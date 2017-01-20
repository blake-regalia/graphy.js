/* eslint-disable */

@ // import parser macros
@include 'binary-parser-macros.builder-js'

/* whitespace */
// const buffer_util = require(__dirname+'/../../../buffer-util/build/Release/buffer_util');

const B_ENV_NODE = ('undefined' !== typeof process && process.release && 'node' === process.release.name);

const AB_ZERO = B_ENV_NODE? Buffer.from([0]): [0];

const encode_utf_8 = (s_chunk) => Buffer.from(s_chunk, 'utf-8');
const encode_utf_16 = (s_chunk) => {
	let ab_chunk = Buffer.from(s_chunk, 'utf-16le');
	return Buffer.concat([AB_ZERO, ab_chunk], ab_chunk.length + 1);
};

const decode_utf_8 = (ab_chunk) => ab_chunk.toString('utf-8');
const decode_utf_16le = (ab_chunk) => ab_chunk.toString('utf-16le');

const join_buffers = B_ENV_NODE
	? (ab_a, ab_b) => {
		return Buffer.concat([Buffer.from(ab_a), ab_b], ab_a.length + ab_b.length);
	}
	: (ab_a, ab_b) => {
		let ab_join = new Uint8Array(ab_a.length + ab_b.length);
		ab_join.set(ab_a);
		ab_join.set(ab_b, ab_a.length);
		return ab_join;
	};

const N_DEFAULT_ALLOCATION_SIZE = 64 * 1024;  // 64 KiB
const commit = (ab_src, n_length, ab_dest, i_write) => {
	let n_copied = ab_src.copy(ab_dest, i_write);
	let i_read = n_copied;
	while(i_read < n_length) {
		i_write += n_copied;
		let ab_expand = Buffer.alloc(ab_dest.length + N_DEFAULT_ALLOCATION_SIZE);
		ab_dest.copy(ab_expand);
		ab_dest = ab_expand;
		n_length -= n_copied;
		n_copied = ab_src.copy(ab_dest, i_write, i_read);
		i_read += n_copied;
	}
	return ab_dest;
};


@macro string_to_buffer(var, str, nullify_var)
	@ // @{str}.match(/[^\u0000-\u007f]/g)? encode_utf_16(@{str}): encode_utf_8(@{str})
	let @{var};

	// find out-of-bound characters
	let a_oob_matches = @{str}.match(/[^\u0000-\u007f]/g);
	if(a_oob_matches) {
		// number of out-of-bound characters
		let n_oobs = a_oob_matches.length;

		// estimate utf8 length (add weighted average probability of exceeding 2 bytes)
		let n_utf8_len = @{str}.length + (n_oobs * 1.9395);

		// estimate utf16 length (add weighted average probability of exceeding 2 bytes)
		let n_utf16_len = (@{str}.length * 2) + (n_oobs * 1.8858);

		// encode in whichever probably saves more space
		@{var} = n_utf8_len <= n_utf16_len? encode_utf_8(@{str}): encode_utf_16(@{str});
	}
	// all characters can be encoded in utf8
	else {
		@{var} = encode_utf_8(@{str});
	}

	@if nullify_var
		;
		// free string to GC
		@{str} = null;
	@end
@end


@macro mk_uint_array(size, range)
	@{range} <= 0x100
		? new Uint8Array(@{size})
		: (@{range} <= 0x10000
			? new Uint16Array(@{size})
			: new Uint32Array(@{size}))
@end


@macro concat(a, b, name)
	let @{name} = new Uint8Array(@{a}.length + @{b}.length);
	@{name}.set(@{a}, 0);
	@{name}.set(@{b}, @{a}.length);
@end



@macro id_generator(name)
	// 1 to 2 character id generator (limited to ~4.294 billion unique ids)
	next_@{name}_id() {
		// exceeded single character range
		if(0x10000 === this.@{name}_id) {
			// reassign id generator
			this.next_@{name}_id = function() {
				// force lo bits to skip 0, 1, and 2
				let x_lo = this.@{name}_id % 0xffff;
				while(x_lo < 2) x_lo = (this.@{name}_id++) % 0xffff;

				// start hi bits off at 4 to avoid collision w/ 0, 1, 2, and 3
				return String.fromCharCode((this.@{name}_id >> 0x10) + 3) + String.fromCharCode(x_lo);
			};

			// return next id from new generator
			return this.next_@{name}_id();
		}

		// single character generator initially
		return String.fromCharCode(this.@{name}_id++);
	},
@end



@macro each(what, ref, name)
	let n_@{what}s = a_@{what}s.length;
	for(let i_@{what}=0; i_@{what}<n_@{what}s; i_@{what}++) {
		@if ref
			@if ref == 'i' && !name
				throw 'you need to name the each value something explicitly to avoid variable name collision';
			@else
				let @{ref}_@{name? name: what} = a_@{what}s[i_@{what}];
			@end
		@end
@end

@macro end_each()
	}
@end


const EventEmitter = require('events');

const graphy = require('../main/graphy');
const util = require('util');

@ // @{constants()}

const P_DICTIONARY_FOUR = 'http://purl.org/HDT/hdt#dictionaryFour';
const P_TRIPLES_LIST = 'http://purl.org/HDT/hdt#triplesList';
const P_TRIPLES_BITMAP = 'http://purl.org/HDT/hdt#triplesBitmap';

const R_CONTROL_PROPERTY = /([^=]+)=([^;]*);/y;

// for creating new prefixes
const R_COMPRESS = /^(.*?)([^/#]*)$/;

// crc tables
const A_CRC_8 = new Uint8Array([0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d, 0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d, 0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd, 0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd, 0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea, 0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2, 0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a, 0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a, 0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a, 0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4, 0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4, 0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44, 0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34, 0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 0x76, 0x71, 0x78, 0x7f, 0x6a, 0x6d, 0x64, 0x63, 0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13, 0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb, 0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83, 0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3]);
const A_CRC_16 = new Uint16Array([0x0000, 0xc0c1, 0xc181, 0x0140, 0xc301, 0x03c0, 0x0280, 0xc241, 0xc601, 0x06c0, 0x0780, 0xc741, 0x0500, 0xc5c1, 0xc481, 0x0440, 0xcc01, 0x0cc0, 0x0d80, 0xcd41, 0x0f00, 0xcfc1, 0xce81, 0x0e40, 0x0a00, 0xcac1, 0xcb81, 0x0b40, 0xc901, 0x09c0, 0x0880, 0xc841, 0xd801, 0x18c0, 0x1980, 0xd941, 0x1b00, 0xdbc1, 0xda81, 0x1a40, 0x1e00, 0xdec1, 0xdf81, 0x1f40, 0xdd01, 0x1dc0, 0x1c80, 0xdc41, 0x1400, 0xd4c1, 0xd581, 0x1540, 0xd701, 0x17c0, 0x1680, 0xd641, 0xd201, 0x12c0, 0x1380, 0xd341, 0x1100, 0xd1c1, 0xd081, 0x1040, 0xf001, 0x30c0, 0x3180, 0xf141, 0x3300, 0xf3c1, 0xf281, 0x3240, 0x3600, 0xf6c1, 0xf781, 0x3740, 0xf501, 0x35c0, 0x3480, 0xf441, 0x3c00, 0xfcc1, 0xfd81, 0x3d40, 0xff01, 0x3fc0, 0x3e80, 0xfe41, 0xfa01, 0x3ac0, 0x3b80, 0xfb41, 0x3900, 0xf9c1, 0xf881, 0x3840, 0x2800, 0xe8c1, 0xe981, 0x2940, 0xeb01, 0x2bc0, 0x2a80, 0xea41, 0xee01, 0x2ec0, 0x2f80, 0xef41, 0x2d00, 0xedc1, 0xec81, 0x2c40, 0xe401, 0x24c0, 0x2580, 0xe541, 0x2700, 0xe7c1, 0xe681, 0x2640, 0x2200, 0xe2c1, 0xe381, 0x2340, 0xe101, 0x21c0, 0x2080, 0xe041, 0xa001, 0x60c0, 0x6180, 0xa141, 0x6300, 0xa3c1, 0xa281, 0x6240, 0x6600, 0xa6c1, 0xa781, 0x6740, 0xa501, 0x65c0, 0x6480, 0xa441, 0x6c00, 0xacc1, 0xad81, 0x6d40, 0xaf01, 0x6fc0, 0x6e80, 0xae41, 0xaa01, 0x6ac0, 0x6b80, 0xab41, 0x6900, 0xa9c1, 0xa881, 0x6840, 0x7800, 0xb8c1, 0xb981, 0x7940, 0xbb01, 0x7bc0, 0x7a80, 0xba41, 0xbe01, 0x7ec0, 0x7f80, 0xbf41, 0x7d00, 0xbdc1, 0xbc81, 0x7c40, 0xb401, 0x74c0, 0x7580, 0xb541, 0x7700, 0xb7c1, 0xb681, 0x7640, 0x7200, 0xb2c1, 0xb381, 0x7340, 0xb101, 0x71c0, 0x7080, 0xb041, 0x5000, 0x90c1, 0x9181, 0x5140, 0x9301, 0x53c0, 0x5280, 0x9241, 0x9601, 0x56c0, 0x5780, 0x9741, 0x5500, 0x95c1, 0x9481, 0x5440, 0x9c01, 0x5cc0, 0x5d80, 0x9d41, 0x5f00, 0x9fc1, 0x9e81, 0x5e40, 0x5a00, 0x9ac1, 0x9b81, 0x5b40, 0x9901, 0x59c0, 0x5880, 0x9841, 0x8801, 0x48c0, 0x4980, 0x8941, 0x4b00, 0x8bc1, 0x8a81, 0x4a40, 0x4e00, 0x8ec1, 0x8f81, 0x4f40, 0x8d01, 0x4dc0, 0x4c80, 0x8c41, 0x4400, 0x84c1, 0x8581, 0x4540, 0x8701, 0x47c0, 0x4680, 0x8641, 0x8201, 0x42c0, 0x4380, 0x8341, 0x4100, 0x81c1, 0x8081, 0x4040]);
const A_CRC_32 = new Uint32Array([0x00000000, 0xf26b8303, 0xe13b70f7, 0x1350f3f4, 0xc79a971f, 0x35f1141c, 0x26a1e7e8, 0xd4ca64eb, 0x8ad958cf, 0x78b2dbcc, 0x6be22838, 0x9989ab3b, 0x4d43cfd0, 0xbf284cd3, 0xac78bf27, 0x5e133c24, 0x105ec76f, 0xe235446c, 0xf165b798, 0x030e349b, 0xd7c45070, 0x25afd373, 0x36ff2087, 0xc494a384, 0x9a879fa0, 0x68ec1ca3, 0x7bbcef57, 0x89d76c54, 0x5d1d08bf, 0xaf768bbc, 0xbc267848, 0x4e4dfb4b, 0x20bd8ede, 0xd2d60ddd, 0xc186fe29, 0x33ed7d2a, 0xe72719c1, 0x154c9ac2, 0x061c6936, 0xf477ea35, 0xaa64d611, 0x580f5512, 0x4b5fa6e6, 0xb93425e5, 0x6dfe410e, 0x9f95c20d, 0x8cc531f9, 0x7eaeb2fa, 0x30e349b1, 0xc288cab2, 0xd1d83946, 0x23b3ba45, 0xf779deae, 0x05125dad, 0x1642ae59, 0xe4292d5a, 0xba3a117e, 0x4851927d, 0x5b016189, 0xa96ae28a, 0x7da08661, 0x8fcb0562, 0x9c9bf696, 0x6ef07595, 0x417b1dbc, 0xb3109ebf, 0xa0406d4b, 0x522bee48, 0x86e18aa3, 0x748a09a0, 0x67dafa54, 0x95b17957, 0xcba24573, 0x39c9c670, 0x2a993584, 0xd8f2b687, 0x0c38d26c, 0xfe53516f, 0xed03a29b, 0x1f682198, 0x5125dad3, 0xa34e59d0, 0xb01eaa24, 0x42752927, 0x96bf4dcc, 0x64d4cecf, 0x77843d3b, 0x85efbe38, 0xdbfc821c, 0x2997011f, 0x3ac7f2eb, 0xc8ac71e8, 0x1c661503, 0xee0d9600, 0xfd5d65f4, 0x0f36e6f7, 0x61c69362, 0x93ad1061, 0x80fde395, 0x72966096, 0xa65c047d, 0x5437877e, 0x4767748a, 0xb50cf789, 0xeb1fcbad, 0x197448ae, 0x0a24bb5a, 0xf84f3859, 0x2c855cb2, 0xdeeedfb1, 0xcdbe2c45, 0x3fd5af46, 0x7198540d, 0x83f3d70e, 0x90a324fa, 0x62c8a7f9, 0xb602c312, 0x44694011, 0x5739b3e5, 0xa55230e6, 0xfb410cc2, 0x092a8fc1, 0x1a7a7c35, 0xe811ff36, 0x3cdb9bdd, 0xceb018de, 0xdde0eb2a, 0x2f8b6829, 0x82f63b78, 0x709db87b, 0x63cd4b8f, 0x91a6c88c, 0x456cac67, 0xb7072f64, 0xa457dc90, 0x563c5f93, 0x082f63b7, 0xfa44e0b4, 0xe9141340, 0x1b7f9043, 0xcfb5f4a8, 0x3dde77ab, 0x2e8e845f, 0xdce5075c, 0x92a8fc17, 0x60c37f14, 0x73938ce0, 0x81f80fe3, 0x55326b08, 0xa759e80b, 0xb4091bff, 0x466298fc, 0x1871a4d8, 0xea1a27db, 0xf94ad42f, 0x0b21572c, 0xdfeb33c7, 0x2d80b0c4, 0x3ed04330, 0xccbbc033, 0xa24bb5a6, 0x502036a5, 0x4370c551, 0xb11b4652, 0x65d122b9, 0x97baa1ba, 0x84ea524e, 0x7681d14d, 0x2892ed69, 0xdaf96e6a, 0xc9a99d9e, 0x3bc21e9d, 0xef087a76, 0x1d63f975, 0x0e330a81, 0xfc588982, 0xb21572c9, 0x407ef1ca, 0x532e023e, 0xa145813d, 0x758fe5d6, 0x87e466d5, 0x94b49521, 0x66df1622, 0x38cc2a06, 0xcaa7a905, 0xd9f75af1, 0x2b9cd9f2, 0xff56bd19, 0x0d3d3e1a, 0x1e6dcdee, 0xec064eed, 0xc38d26c4, 0x31e6a5c7, 0x22b65633, 0xd0ddd530, 0x0417b1db, 0xf67c32d8, 0xe52cc12c, 0x1747422f, 0x49547e0b, 0xbb3ffd08, 0xa86f0efc, 0x5a048dff, 0x8ecee914, 0x7ca56a17, 0x6ff599e3, 0x9d9e1ae0, 0xd3d3e1ab, 0x21b862a8, 0x32e8915c, 0xc083125f, 0x144976b4, 0xe622f5b7, 0xf5720643, 0x07198540, 0x590ab964, 0xab613a67, 0xb831c993, 0x4a5a4a90, 0x9e902e7b, 0x6cfbad78, 0x7fab5e8c, 0x8dc0dd8f, 0xe330a81a, 0x115b2b19, 0x020bd8ed, 0xf0605bee, 0x24aa3f05, 0xd6c1bc06, 0xc5914ff2, 0x37faccf1, 0x69e9f0d5, 0x9b8273d6, 0x88d28022, 0x7ab90321, 0xae7367ca, 0x5c18e4c9, 0x4f48173d, 0xbd23943e, 0xf36e6f75, 0x0105ec76, 0x12551f82, 0xe03e9c81, 0x34f4f86a, 0xc69f7b69, 0xd5cf889d, 0x27a40b9e, 0x79b737ba, 0x8bdcb4b9, 0x988c474d, 0x6ae7c44e, 0xbe2da0a5, 0x4c4623a6, 0x5f16d052, 0xad7d5351]);

const X_HEAP_LIMIT = 1.2 * 1024 * 1024 * 1024;

@macro else()
	}
	else {
@end

@macro at_least(n_chars)
	@if n_chars == 1
		i < n
	@else
		n - i >= @{n_chars}
	@end
@end

@macro end_if()
	}
@end

@macro crc_byte(n, what)
	@if n == 8
		A_CRC_@{n}[(x_crc ^ @{what}) & 0xff] & 0xff
	@elseif n == 16
		(A_CRC_@{n}[(x_crc ^ @{what}) & 0xff] ^ x_crc >>> 8) & 0xffff
	@else
		A_CRC_@{n}[(x_crc ^ @{what}) & 0xff] ^ x_crc >>> 8
	@end
@end

@macro crc_range(n, m)
	for(let i_b=i; i_b<@{m}; i_b++) {
		x_crc = @{crc_byte(n, 'a[i_b]')};
	}
@end

@macro crc(n, what, do_not_declare)
	@if !do_not_declare
		let x_crc = this.crc;
	@end
	@if what
		this.crc = @{crc_byte(n, what)};
	@else
		@{crc_range(n, '= i_null')}
		this.crc = x_crc;
	@end
@end

@macro vbyte(save_as, next_state, crc32)
	this.vbyte_key = '@{save_as}';
	@{push_state(next_state)}
	@{goto('vbyte_'+(crc32? '32': '8'))}
@end

@macro vbyte_state(state, save_as, next_state, crc32)
	@{method(state)}
		@{vbyte(save_as, next_state, crc32)}
	},
@end

@macro crc_check(n, next_state, is_var)
	@{push_state(next_state, is_var)}
	@{goto('crc'+n)}
@end

@macro crc_state(state, n, next_state, is_var)
	@{method(state)}
		@{crc_check(n, next_state, is_var)}
	},
@end

@macro crc32_prep_state(next)
	@{next}_prep(a, n, i) {
		// crc 32 starts at -1
		this.crc = -1;
		@{goto(next)}
	},
@end

@macro idx_a_bc(bit)
	if(x_byte & @{bit}) {
		a_idxs_c.push(i_soal);
		if(!--n_bs) {
			// convert idx_c to array-buffer
			let ab_idxs_c = @{mk_uint_array('a_idxs_c.length', 'i_soal')}
			ab_idxs_c.set(a_idxs_c);

			// overwrite a's group
			a_idxs.push(ab_idxs_c);

			// reset idx_c
			a_idxs_c = [i_soal];
			n_bs = a_idx_ab[i_a+1] - a_idx_ab[i_a++];
		}
	}
	i_soal += 1;
@end


@macro vbyte_inline(n, key, state, on_consumed)
	// only advance state once entire vbyte has been consumed
	let c_b = 0;

	// vbyte integer value
	let x_value = 0;

	// ref current crc value
	let x_crc = this.crc;

	// for breaking to indicate all vbyte was consumed
	let b_consumed = false;

	// while there are bytes
	let n_r = n - i;
	while(c_b < n_r) {
		// byte value
		let x = a[i+c_b];

		// update crc
		x_crc = @{crc_byte(n, 'x')}

		// add lower value
		x_value |= (x & 0x7f) << (7 * c_b++);

		// last byte of number
		if(x & 0x80) {
			b_consumed = true;
			break;
		}
	}

	// consumed entire vbyte
	if(b_consumed) {
		// advance index
		i += c_b;

		// save crc value to instance
		this.crc = x_crc;

		// save vbyte value to specific key
		@if state
			this.@{key} = x_value;
		@else
			this@{key} = x_value
		@end

		@if on_consumed
			@{on_consumed}
		@else
			// pop state
			@{pop_state()}
		@end
	}
	// more bytes needed
	else {
		@if state
			// save vbyte value to property @{key}
			this.vbyte_key = '@{key}';

			// after vbyte, resume state @{state}
			@{push_state(state)}
		@end

		@{bail('vbyte_'+n)}
	}
@end

const R_IRI_REF = /^<([^>]*)>$/;

const HP_TYPE_GLOBAL = {
	state: 'control',
};
const HP_TYPE_HEADER = {
	state: 'header',
};
const HP_TYPE_DICTIONARY = {
	state: 'dict_sect',
};
const HP_TYPE_TRIPLES = {
	state: 'triples',
};
const HP_TYPE_INDEX = {
	state: 'index',
};


const A_FOUR_SECTION_DICTIONARY = [
	{
		code: 'd',
		name: 'shared',
	},
	{
		code: 's',
		name: 'subjects',
	},
	{
		code: 'p',
		name: 'predicates',
	},
	{
		code: 'o',
		name: 'objects',
	},
];


// set predictive heap growth multiplier
const X_PREDICTIVE_HEAP_GROWTH_MULTIPLIER = 2.2;

// flag: manage memory
const B_MANAGE_MEMORY = true;


// we are in node.js and allowing memory management
const v8 = (B_ENV_NODE && B_MANAGE_MEMORY)? require('v8'): null;

// determine actual heap size limit
const N_HEAP_SIZE_LIMIT = v8? (() => {
	const N_64_MIB = 64 * 1024 * 1024;
	let h_stats = v8.getHeapStatistics();
	let n_heap_size_limit = h_stats.heap_size_limit;

	// user set --max-old-space-size limit
	let a_old_space_args = process.execArgv.filter(s_arg => s_arg.startsWith('--max-old-space-size') || s_arg.startsWith('--max_old_space_size'));
	if(a_old_space_args.length) {
		// parse limit value
		let s_old_space_arg = a_old_space_args[0];
		let n_old_space_value = (~~s_old_space_arg.substr(s_old_space_arg.indexOf('=') + 1)) * 1024 * 1024;

		// heap size limit does not match what user specified
		if(n_heap_size_limit !== (n_old_space_value + N_64_MIB)) {
			console.warn(`WARNING: V8 did not respect your --max-old-space-size argument of ${n_old_space_value / 1024 / 1024} MiB because it exceeds the heap size that V8 can support on this system architecture. I recommend trying 4031 MiB (4096 MiB - 64 MiB - 1 MiB) and seeing if this message goes away.`);

			// assume 4gb limit
			return 4096 * 1024 * 1024;
		}
	}

	// heap size limit from heap stats is trustworthy
	return n_heap_size_limit;
})(): Infinity;


function Parser(z_input, h_config) {
	let k_graph = graphy.linkedGraph();

	Object.assign(this, {
		// original config options
		config: h_config,

		// current parser state
		state: this.control,

		// state nesting push/pop
		nested: [],

		// initial index for prefix ids (0x00 = utf-16le, 0x01 = prefix separator, 0x02 = absolute iri, 0x03 = blank node)
		prefix_id: 0x04,

		// initial index for label ids (0x00 = utf-16le, 0x01 = prefix separator, 0x02 = absolute iri, 0x03 = blank node)
		label_id: 0x04,

		// graph
		graph: k_graph,

		// data
		pre: [],

		// for verbose error handling
		offset: 0,

		//
		four_section_dict_index: 0,
		front: '',
		reuse_length: 0,
		string_seen: 0,

		// dictionary section's data & ref (allocation placeholders)
		ref: [],
		dict: [],
		dict_offset: 0,

		// separate ones for literal
		ref_l: [],
		dict_l: [],
		dict_l_offset: 0,
		max_word_length: 0,

		// bitmap section
		bitmap_section_z: false,

		// bitmap and array containers
		array: [],
		index: 0,
		index_a: 1,

		// event callbacks
		data: h_config.data,

		// maximum buffer size while parsing (128 mebibytes)
		max_buffer_size: 128 * 1024 * 1024,

		// log sequence bit sections
		bit_length: 0,
		bytes_consumed: 0,

		// 
		bit_remainder: 0,
		bit_value: 0,
	});

	Object.assign(this, {
		prefixes: k_graph.prefixes,

		// prefix lookup mappings [prefix_iri] => dict_prefix_id
		prefix_lookup: k_graph.prefix_lookup,
		
		// label lookup mappings [label_name] => dict_label_id
		label_lookup: k_graph.label_lookup,

		// user prefix mappins [user_prefix_id] => dict_prefix_id
		user_prefixes: k_graph.user_prefixes,

		prefix_candidates: {},
	});

	// node.js only
	if(v8) {
		// create means to track heap space as it grows
		Object.assign(this, {
			// object container for heap snapshot info
			heap_snapshot: {},

			// test whether or not we should do some garbage "shoveling"
			approaching_heap_limit(n_btyes_consumed) {
				// protect against infinity bug
				if(!n_btyes_consumed) return false;

				// ref snapshot info
				let h_snapshot = this.heap_snapshot;

				// grab v8 heap stats
				let h_stats = v8.getHeapStatistics();

				// compute heap growth rate based on bytes consumed in bit sequence
				let x_growth_rate = (h_stats.used_heap_size - h_snapshot.heap_size) / n_btyes_consumed;

				// keep only maximum growth rate and maximum bytes consumed
				x_growth_rate = h_snapshot.max_growth_rate = Math.max(h_snapshot.max_growth_rate || 0, x_growth_rate);
				n_btyes_consumed = h_snapshot.max_bytes_consumed =  Math.max(h_snapshot.max_bytes_consumed || 0, n_btyes_consumed);

				// console.log(util.inspect(Object.assign(h_stats, {
				// 	max_growth_rate: x_growth_rate,
				// 	max_bytes_consumed: n_btyes_consumed,
				// })));

				// console.log(`is ${(x_growth_rate * n_btyes_consumed * X_PREDICTIVE_HEAP_GROWTH_MULTIPLIER) / 1024 / 1024} > ${(N_HEAP_SIZE_LIMIT - h_stats.total_heap_size) / 1024 / 1024} ?`);

				// compute worst case scenario
				return ((x_growth_rate * n_btyes_consumed * X_PREDICTIVE_HEAP_GROWTH_MULTIPLIER) + h_stats.total_heap_size > N_HEAP_SIZE_LIMIT);
			},
		});
	}

	// override internal error handling with user defined one
	if(h_config.error) this._error = h_config.error;

	// end of file
	const eof = (b_no_callback) => {
		// invalid parsing state
		if(this.control !== this.state) {
			return this._error(`reached end of file in intermediate state "${this.state.name}"`);
		}
		// there are still unparsed characters
		else if(this.pre.length) {
			// throw parse error
			return this.parse_error('reached end of file, but failed to parse control information from remaining bytes');
		}

		// our duty to notify listener
		if(1 !== b_no_callback) {
			this.operator.emit('end');
			// call end event listener
			if(h_config.end) {
				h_config.end(this.graph.user_prefixes, this.graph);
			}
			// otherwise log a warning
			else {
				console.warn('[graphy] reached end of file, but no `end` event listener to call');
			}
		}
	};

	// stream
	if(z_input.setEncoding) {
		// no data event callback
		if(!h_config.data) {
			// bind data event call to event emitter
			this.data = function(h_statement) {
				this.emit('data', h_statement);
			};
		}

		// user wants to be notified when input is readable
		if(h_config.ready) z_input.on('readable', h_config.ready);

		// once stream closes, invoke eof
		z_input.on('end', eof);

		// begin
		z_input.on('data', (a_chunk) => {
			let a = this.pre;

			// concatenate current chunk to previous chunk
			if(a.length) {
				a = Buffer.concat([a, a_chunk], a.length + a_chunk.length);
			}
			// re-assign a
			else {
				a = a_chunk;
			}

			// cache a length
			let n = a.length;

			// begin
			this.state(a, n, 0);

			// user wants parse progress updates
			if(h_config.parse_progress) h_config.parse_progress(this.offset, this.state.name);
		});

		@ // make stream controls
		@ // @{stream_control('d_transform')}

		// event emitter
		this.operator = new EventEmitter();
		this.emit = this.operator.emit.bind(this);
	}
}


Object.assign(Parser.prototype, {

	@ // id generators
	@{id_generator('prefix')}
	@{id_generator('label')}


	@{method('crc8', 1)}
		if(this.crc !== a[i++]) {
			this._error(`CRC-8 validation check failed before "${this.nested.pop()}"; expected 0x${a[i-1].toString(16)}, instead got 0x${this.crc.toString(16)}`);
		}
		else {
			this.crc = 0;
			@{pop_state()}	
		}
	@{end_method('crc8')}


	@{method('crc16', 2)}
		let x_crc_check = a[i++] | (a[i++] << 8);
		if(this.crc !== x_crc_check) {
			let x_crc = this.crc;
			let s_computed = [
				x_crc & 0xff,
				(x_crc >> 8) & 0xff,
			].map(x => '0x'+x.toString(16)).join(', ');
			this._error(`CRC-16 validation check failed before "${this.nested.pop()}";`
					+` checksum is [${Array.from(a.slice(i-2, i)).map(x => '0x'+x.toString(16)).join(', ')}]LE,`
					+` instead computed [${s_computed}]LE`);
		}
		else {
			this.crc = 0;
			@{pop_state()}	
		}
	@{end_method('crc16')}


	@{method('crc32', 4)}
		let x_crc_check = a[i++] | (a[i++] << 8) | (a[i++] << 16) | (a[i++] << 24);
		if((this.crc ^ -1) !== x_crc_check) {
			let x_crc = (this.crc ^ -1);
			let s_computed = [
				x_crc & 0xff,
				(x_crc >> 8) & 0xff,
				(x_crc >> 16) & 0xff,
				(x_crc >> 24) & 0xff,
			].map(x => '0x'+x.toString(16)).join(', ');
			this._error(`CRC-32 validation check failed before "${this.nested.pop()}";`
					+` checksum is [${Array.from(a.slice(i-4, i)).map(x => '0x'+x.toString(16)).join(', ')}]LE,`
					+` instead computed [${s_computed}]LE`);
		}
		else {
			this.crc = 0;
			@{pop_state()}	
		}
	@{end_method('crc32')}


	@{method('control', 4)}
		// '$', 'H', 'D', 'T'
		if(a[i] === 0x24 && a[i+1] === 0x48 && a[i+2] === 0x44 && a[i+3] === 0x54) {
			// crc 16
			this.crc = 0x19b8;

			// advance pointer
			i += 4;

			// next state
			@{goto('control_type')}
		}
	@{end_method('control')}

	@{method('control_type', 1)}
		let x_type = a[i++];
		@{crc(16, 'x_type')}

		// global
		if(x_type === 1) {
			this.type = HP_TYPE_GLOBAL;
		}
		// header
		else if(x_type === 2) {
			this.type = HP_TYPE_HEADER;
		}
		// dict
		else if(x_type === 3) {
			this.type = HP_TYPE_DICTIONARY;
		}
		// triples
		else if(x_type === 4) {
			this.type = HP_TYPE_TRIPLES;
		}
		// index
		else if(x_type === 5) {
			this.type = HP_TYPE_INDEX;	
		}

		@{goto('control_format')}

	@{end_method('control_type')}


	@{method('control_format', null, 's_format')}
		// headers may not use iri ref
		if(this.type === HP_TYPE_HEADER) {
			this.format = s_format;
		}
		// control format must be an iri ref
		else {
			let m_format = R_IRI_REF.exec(s_format);
			if(!m_format) {
				throw 'improper IRI Reference';
			}
			else {
				let p_format = m_format[1];
				this.format = p_format;
			}
		}

		// update index
		i = i_null + 1;
		@{goto('control_properties')}
	@{end_method('control_format')}


	@{method('control_properties', null, 's_properties')}
		let h_properties = {};

		// attempt to match first property
		let m_property = R_CONTROL_PROPERTY.exec(s_properties);
		while(m_property) {
			// set property that maps: key => value
			h_properties[m_property[1]] = m_property[2];

			// attempt to match next one
			m_property = R_CONTROL_PROPERTY.exec(s_properties);
		}

		// save properties hash
		this.properties = h_properties;

		// update index
		i = i_null + 1;

		// next state
		@{crc_check(16, 'this.type.state', true)}
	@{end_method('control_properties')}


	@{method('header')}
		let n_header = ~~this.properties.length;
		if(@{at_least('n_header')}) {
			// no crc for header

			// user wants header
			if(this._header) {
				let s_header = @{utf8_string('a.slice(i, i + n_header)')};
				this._header(s_header);
			}

			// advance index
			i += n_header;
			@{goto('control')}
		}
	@{end_method('header')}


	@{method('dict_sect', 1)}
		let x = a[i++];
		@{crc(8, 'x')}

		// dict section plain
		if(x === 1) {
			throw 'dictionary section plain';
		}
		// dict section plain front coding
		else if(x === 2) {
			@{goto('dict_sect_front_coding_string_count')}
		}
		else {
			throw 'string dictionary [HTFC, FMINDEX, REPAIRDAC, HASHHUFF]';
		}
	@{end_method('dict_sect')}


	@{vbyte_state('dict_sect_front_coding_string_count', 'string_count', 'dict_sect_front_coding_buffer_length')}

	@{vbyte_state('dict_sect_front_coding_buffer_length', 'buffer_length', 'dict_sect_front_coding_block_size')}

	@{vbyte_state('dict_sect_front_coding_block_size', 'block_size', 'dict_sect_front_coding_crc8')}

	@{crc_state('dict_sect_front_coding_crc8', 8, 'dict_sect_front_coding_log_sequence_open')}


	@{method('dict_sect_front_coding_log_sequence_open', 2)}
		// TYPE_SEQLOG
		if(a[i++] === 1) {
			// update crc
			let x_crc = this.crc;
			x_crc = @{crc_byte(8, '1')};

			// number of bits needed to store each element (depending on range of ids)
			let x_bits_per_item = a[i++];

			// update crc
			this.crc = @{crc_byte(8, 'x_bits_per_item')};

			// save to instance
			this.bits_per_item = x_bits_per_item;

			@{vbyte('log_sequence_entries', 'dict_sect_front_coding_log_sequence_number_entries')}
		}
		// unexpected type id
		else {
			throw 'expecting sequence log type identifier';
		}
	@{end_method('dict_sect_front_coding_log_sequence_open')}


	@{crc_state('dict_sect_front_coding_log_sequence_number_entries', 8, 'dict_sect_front_coding_log_sequence_data')}


	@{method('dict_sect_front_coding_log_sequence_data')}
		let n_bytes = Math.ceil((this.bits_per_item * this.log_sequence_entries) / 8);
		if(@{at_least('n_bytes')}) {
			this.log_sequence = a.slice(i, i + n_bytes);

			// start new crc 32
			let x_crc = -1;
			@{crc_range(32, 'i + n_bytes')}
			this.crc = x_crc;

			// advance pointer
			i += n_bytes;
			@{crc_check(32, 'dict_sect_front_coding_string_prep')}
		}
	@{end_method('dict_sect_front_coding_log_sequence_data')}


	@{crc32_prep_state('dict_sect_front_coding_string')}


	@{method('dict_sect_front_coding_string')}
		if(v8) this.heap_snapshot.heap_size = v8.getHeapStatistics().used_heap_size;
		let i_start = i;

		while(i < n) {
			// index of null character
			let i_null = a.indexOf(0, i);

			// string is beyond buffer; bail
			if(-1 === i_null) break;

			@{crc(32)}
			// decode string from buffer
			let s_chunk = @{utf8_string()};

			let s_catch = this.front;
			let s_term = this.front = this.front.slice(0, this.reuse_length) + s_chunk;

			// literal
			if(s_term[0] === '"') {
				// index of literal's ending quote
				let i_end_quote = s_term.lastIndexOf('"');

				// character after last ending quote
				let s_terminus = s_term[i_end_quote+1]

				// form content part of canonicalized literal
				let s_content = s_term.slice(1, i_end_quote);
				@{string_to_buffer('ab_content', 's_content')};

				// prep preceeding part of word
				let ab_preceed;

				// literal has language tag
				if('@' === s_terminus) {
					// set preceeding part of literal's word
					ab_preceed = encode_utf_8(s_term.slice(i_end_quote+1)+'"');
				}
				// literal is datatyped
				else if('^' === s_terminus) {
					// prep datatype word fragment
					let s_word;

					// ref datatype iri
					let p_datatype = s_term.slice(i_end_quote+4, s_term.length - 1);

					// determine actual best prefix
					let m_compress = R_COMPRESS.exec(p_datatype);
					if(m_compress) {
						// destruct prefix fragments
						let [, p_compress_prefix, s_compress_suffix] = m_compress;

						// track prefixes that are WRONG
						if(this.prefix_candidates[p_compress_prefix]) this.prefix_candidates[p_compress_prefix] += 1;
						else this.prefix_candidates[p_compress_prefix] = 0;

						// ref/create prefix mapping
						let s_prefix_id = this.prefix_lookup[p_compress_prefix] = this.prefix_lookup[p_compress_prefix] || this.next_prefix_id();
						s_word = s_prefix_id+'\u0001'+s_compress_suffix;
					}
					// unable to create prefix for @{position} iri
					else {
						// create dictionary entry; like canonicalized form but without closing angle bracket
						s_word = '\u0002'+s_term;
					}

					// set preceeding part of literal's word
					ab_preceed = encode_utf_8('^'+s_word+'"');
				}
				else {
					// just the quote delimiter
					ab_preceed = Uint8Array.of(34);
				}

				// form whole word
				let a_word = join_buffers(ab_preceed, ab_content);

				// we don't need this for fc_dict
				// // save word's offset within dict_l to ref
				// this.ref_l.push(this.dict_l_offset);

				// push word to dict_l vector
				this.dict_l.push(a_word);

				// save max length
				this.max_word_length = Math.max(this.max_word_length, a_word.length);
				
				// adjust offset
				this.dict_l_offset += a_word.length;
			}
			// non-literal
			else {
				let s_word;

				// blank node
				if(s_term[0] === '_' && s_term[1] === ':') {
					// extract label value from blank node string
					let s_label = s_term.substr(2);

					// create binary blank node word
					s_word = '\u0003'+(this.label_lookup[s_label] = this.label_lookup[s_label] || this.next_label_id());
				}
				// iri
				else {
					// determine actual best prefix
					let m_compress = R_COMPRESS.exec(s_term);
					if(m_compress) {
						// destruct prefix fragments
						let [, p_compress_prefix, s_compress_suffix] = m_compress;

						// track prefixes that are WRONG
						if(this.prefix_candidates[p_compress_prefix]) this.prefix_candidates[p_compress_prefix] += 1;
						else this.prefix_candidates[p_compress_prefix] = 0;

						// ref/create prefix mapping
						let s_prefix_id = this.prefix_lookup[p_compress_prefix] = this.prefix_lookup[p_compress_prefix] || this.next_prefix_id();
						s_word = s_prefix_id+'\u0001'+s_compress_suffix;
					}
					// unable to create prefix for @{position} iri
					else {
						// create dictionary entry; like canonicalized form but without closing angle bracket
						s_word = '\u0002'+s_term;
					}
				}

				// convert string into array-buffer
				ab_word = encode_utf_8(s_word);

				// save word's offset within dict to ref
				this.ref.push(this.dict_offset);

				// push word to dict vector
				this.dict.push(ab_word);

				// adjust offset
				this.dict_offset += ab_word.length;
			}

			// advance index
			i = i_null + 1;

			// increment counter
			this.string_seen += 1;

			// more strings to consume in this dict section
			if(this.string_seen < this.string_count) {
				// end of block
				if(this.string_seen % this.block_size === 0) {
					this.front = '';
					this.reuse_length = 0;
					this.blocks_consumed = this.blocks_consumed || 1;
					continue;
				}
				// more remain in block
				else {
					@{vbyte_inline(32, 'reuse_length', 'dict_sect_front_coding_string', 'continue;')}
				}
			}
			// consumed all strings in dict section
			else {
				// four-section dictionary
				if(P_DICTIONARY_FOUR === this.format) {
					// destructure section descriptor
					let {
						code: s_section_code,
					} = A_FOUR_SECTION_DICTIONARY[this.four_section_dict_index];

					// transfer basic dict & ref
					this.transfer_dict_into_graph(s_section_code, this.dict, this.ref, this.dict_offset);

					// reset data continers
					this.ref = [];
					this.dict = [];
					this.dict_offset = 0;

					// this is the object section, there are also literals
					if('o' === s_section_code) {
						this.transfer_fc_dict_into_graph('l', this.dict_l, this.dict_l_offset, this.max_word_length);
						// return;

						// reset those things
						this.ref_l = [];
						this.dict_l = [];
						this.dict_l_offset = 0;
					}

					// reset counters
					this.string_seen = 0;
					this.reuse_length = 0;

					// advance dict index
					this.four_section_dict_index += 1;

					// more sections remain
					if(this.four_section_dict_index < A_FOUR_SECTION_DICTIONARY.length) {
						@{crc_check(32, 'dict_sect')}
					}
					// consumed all sections
					else {
						let k_graph = this.graph;

						// create normal prefix map by inversing prefix lookup hash
						let h_prefixes = {};
						let h_prefix_lookup = this.prefix_lookup;
						for(let p_prefix_iri in h_prefix_lookup) {
							let s_prefix_id = h_prefix_lookup[p_prefix_iri];
							h_prefixes[s_prefix_id] = p_prefix_iri;
							// delete h_prefix_lookup[p_prefix_iri];
						}
						// delete k_graph.prefix_lookup;
						k_graph.prefixes = h_prefixes;

						@{crc_check(32, 'control')}
					}
				}
				// unimplemented dictionary type
				else {
					throw `unknown dictionary type: <${this.format}>`;
				}
			}
		}

		// approaching heap limit
		if(v8 && this.approaching_heap_limit(i - i_start)) {
			console.warn('WARNING: running low on free heap memory. Buffer relocation not yet implemented for this state.');
		}
	@{end_method('dict_sect_front_coding_string')}


	@{vbyte_state('dict_sect_front_coding_reuse_length', 'reuse_length', 'dict_sect_front_coding_string', true)}


	triples(a, n, i) {
		switch(this.format) {
			case P_TRIPLES_BITMAP: @{goto('triples_bitmap')}
			case P_TRIPLES_LIST: @{goto('triples_list')}
		}

		throw `unknown triples type: <${this.format}>`;
	},


	@{method('triples_bitmap', 1)}
		let x = a[i++];
		@{crc(8, 'x')}
		if(x === 1) {
			@{vbyte('bit_length', 'triples_bitmap_preamble')}
		}
		else {
			throw 'unrecognized bitmap format: '+x;
		}
	@{end_method('triples_bitmap')}


	@{crc_state('triples_bitmap_preamble', 8, 'triples_bitmap_bits_prep')}

	triples_bitmap_bits_prep(a, n, i) {
		this.crc = -1;

		// initialize w/ first start of list
		this.array = [0];

		// index: start of adjacency list
		this.index = 1;

		@{goto('triples_bitmap_bits')}
	},

	@{method('triples_bitmap_bits')}
		// number of bytes needed to end this block section
		let n_bytes_remain = Math.ceil(this.bit_length / 8) - this.bytes_consumed;

		// prep bytes buffer & fragmentation
		let a_bytes;
		let b_fragmented = false;

		// ref crc value
		let x_crc = this.crc;

		// entire payload is in buffer
		if(@{at_least('n_bytes_remain')}) {
			// consume entire payload
			a_bytes = a.slice(i, i + n_bytes_remain);

			// update crc
			@{crc_range(32, 'i + n_bytes_remain')}

			// advance index
			i += n_bytes_remain;

			// reset consumption counter
			this.bytes_consumed = 0;
		}
		// payload is fragmented
		else {
			// set fragmented flag
			b_fragmented = true;

			// consume entire fragment
			a_bytes = a.slice(i);

			// update crc
			@{crc_range(32, 'n')}

			// remember how many bytes we are consuming for next fragment
			this.bytes_consumed += n - i;

			// fast-forward index
			i = n;

			// track heap growth
			if(v8) this.heap_snapshot.heap_size = v8.getHeapStatistics().used_heap_size;
		}

		// save to instance
		this.crc = x_crc;

		// bitmap section Y
		if(!this.bitmap_section_z) {
			let a_idxs = this.array;

			// index: start of adjacency list
			let i_soal = this.index;

			@{each('byte', 'x')}
				// end of siblings
				if(x_byte & 1) a_idxs.push(i_soal);
				i_soal += 1;
				if(x_byte & 2) a_idxs.push(i_soal);
				i_soal += 1;
				if(x_byte & 4) a_idxs.push(i_soal);
				i_soal += 1;
				if(x_byte & 8) a_idxs.push(i_soal);
				i_soal += 1;
				if(x_byte & 16) a_idxs.push(i_soal);
				i_soal += 1;
				if(x_byte & 32) a_idxs.push(i_soal);
				i_soal += 1;
				if(x_byte & 64) a_idxs.push(i_soal);
				i_soal += 1;
				if(x_byte & 128) a_idxs.push(i_soal);
				i_soal += 1;
			@{end_each()}

			// more bitmap remains
			if(b_fragmented) {
				// save index
				this.index = i_soal;

				// running out of heap space
				if(v8 && this.approaching_heap_limit(this.bytes_consumed)) {
					console.warn('WARNING: running low on free memory. Attempting to move objects outside of V8 heap');

					// move to typed array
					let ab_idx = @{mk_uint_array('a_idxs.length', 'i_soal')};
					ab_idx.set(a_idxs);

					// found another fragment there already
					if(this.graph.idx_sp) {
						let ab_idx_sp = this.graph.idx_sp;

						// expand graph index by merging arrays
						let ab_idx_merge = this.graph.idx_sp = @{mk_uint_array('a_idxs.length + ab_idx_sp.length', 'i_soal')};
						ab_idx_merge.set(ab_idx_sp);
						ab_idx_merge.set(ab_idx, ab_idx_sp.length);
					}
					else {
						// save first fragment to graph
						this.graph.idx_sp = ab_idx;
					}

					// reset array
					a_idxs.length = 0;

					// started with --expose-gc
					if(global.hasOwnProperty('gc')) {
						// force garbage collection
						global.gc();
					}
					// gc not available
					else {
						// warn about inability to force garbage collection
						console.warn('WARNING: freed up some heap memory but cannot force garbage collection. Start with --expose-gc to allow this');
					}
				}
			}
			// end of bitmap
			else {
				// convert to array-buffer
				let ab_idx = @{mk_uint_array('a_idxs.length', 'i_soal')};
				ab_idx.set(a_idxs);

				// found another fragment there already
				if(this.graph.idx_sp) {
					let ab_idx_sp = this.graph.idx_sp;

					// expand graph index by merging arrays
					let ab_idx_merge = this.graph.idx_sp = @{mk_uint_array('a_idxs.length + ab_idx_sp.length', 'i_soal')};
					ab_idx_merge.set(ab_idx_sp);
					ab_idx_merge.set(ab_idx, ab_idx_sp.length);
				}
				else {
					// save this fragment to graph
					this.graph.idx_sp = ab_idx;
				}

				// reset index and array
				this.index = 1;
				this.array = [0];

				// flip bitmap section Y/Z flag
				this.bitmap_section_z = !this.bitmap_section_z;

				// reset heap stats
				if(v8) this.heap_snapshot = {};
			}
		}
		// bitmap section Z
		else {
			// array of array-buffers (save to graph)
			let a_idxs = this.graph.idx_s_po;

			// index: a position of triple
			let i_a = this.index_a;

			// super adjacecncy list
			let a_idx_ab = this.graph.idx_sp;

			// c indicies container
			let a_idxs_c = this.array;

			// number of b elements remaining in current a-list
			let n_bs = a_idx_ab[i_a] - a_idx_ab[i_a - 1] - a_idxs_c.length + 1;

			// index: start of adjacency list
			let i_soal = this.index;

			@{each('byte', 'x')}
				// end of siblings
				@{idx_a_bc(1)}
				@{idx_a_bc(2)}
				@{idx_a_bc(4)}
				@{idx_a_bc(8)}
				@{idx_a_bc(16)}
				@{idx_a_bc(32)}
				@{idx_a_bc(64)}
				@{idx_a_bc(128)}
			@{end_each()}

			// more bitmap remains
			if(b_fragmented) {
				// save states to instance
				this.array = a_idxs_c;
				this.index = i_soal;
				this.index_a = i_a;
			}
			// end of bitmap
			else {
				// flip bitmap section Y/Z flag
				this.bitmap_section_z = !this.bitmap_section_z;
			}
		}

		// consumed entire payload
		if(!b_fragmented) {
			// consumed bitmap Y, repeat for bitmap Z
			if(this.bitmap_section_z) {
				// prepare graph's idx_s_po
				this.graph.idx_s_po = [];

				@{push_state('triples_bitmap')}
			}
			// finished with bitmaps, push next state
			else {
				@{push_state('triples_bitmap_array')}
			}

			// check crc 32
			@{goto('crc32')}
		}
	@{end_method('triples_bitmap_bits')}


	@{method('triples_bitmap_array', 2)}
		let x = a[i++];
		let x_crc = this.crc;
		x_crc = @{crc_byte(8, 'x')};

		// Log64 format
		if(x === 1) {
			let x_bits_per_item = a[i++];
			this.crc = @{crc_byte(8, 'x_bits_per_item')};
			this.bits_per_item = x_bits_per_item;
			@{vbyte('bitmap_entry_size', 'triples_bitmap_array_preamble')}
		}
		// uint32 format
		else if(x === 2) {
			throw 'bitmap uint32 format';
		}
		// uint64 format
		else if(x === 3) {
			throw 'bitmap uint64 format';	
		}
		// unknown
		else {
			throw 'unknown bitmap format: '+x;
		}
	@{end_method('triples_bitmap_array')}


	@{crc_state('triples_bitmap_array_preamble', 8, 'triples_bitmap_array_entries_prep')}

	@{crc32_prep_state('triples_bitmap_array_entries')}


	@{method('triples_bitmap_array_entries')}
		// ref graph
		let k_graph = this.graph;

		// bitmap section Z
		let b_section_z = this.bitmap_section_z;

		// bits per log item
		let n_bits_per_item = this.bits_per_item;

		// number of bytes to end this block section
		let n_bytes_remain = Math.ceil((n_bits_per_item * this.bitmap_entry_size) / 8) - this.bytes_consumed;

		// bitmask to consume only n bits per item
		let x_mask = (1 << n_bits_per_item) - 1;

		// prep bytes buffer & fragmentation
		let a_bytes;
		let b_fragmented = false;

		// ref crc value
		let x_crc = this.crc;

		// entire payload is in buffer
		if(@{at_least('n_bytes_remain')}) {
			// consume entire payload
			a_bytes = a.slice(i, i + n_bytes_remain);

			// update crc
			@{crc_range(32, 'i + n_bytes_remain')}

			// reset byte consumption counter
			this.bytes_consumed = 0;

			// advance index
			i += n_bytes_remain;
		}
		// payload is fragmented
		else {
			// set fragmented flag
			b_fragmented = true;

			// consume entire fragment
			a_bytes = a.slice(i);

			// update crc
			@{crc_range(32, 'n')}

			// remember how many bytes were consumed
			this.bytes_consumed += n - i;

			// fast-forward index
			i = n;
		}

		// update crc
		this.crc = x_crc;

		// auto-advancing index pointer
		let i_ptr = 0;

		// HDT "array-Y"
		if(!b_section_z) {
			// ref existing data array-buffer
			let ab_array = k_graph.data_sp;

			// not exists
			if(!ab_array) {
				// create data array-buffer
				ab_array = k_graph.data_sp = @{mk_uint_array('this.bitmap_entry_size', 'x_mask')};
			}
			// it was started prior
			else {
				// fetch ptr index
				i_ptr = this.data_write_index;
			}

			// perfect byte alignment
			if(n_bits_per_item == 8) {
				@{each('byte', 'x')}
					ab_array[i_ptr++] = x_byte;
				@{end_each()}
			}
			// smaller than a byte
			else if(n_bits_per_item < 8) {
				let n_bit_remainder = this.bit_remainder;
				let x_value = this.bit_value;
				@{each('byte', 'x')}
					x_value |= (x_byte << n_bit_remainder);
					n_bit_remainder += 8;
					do {
						ab_array[i_ptr++] = x_value & x_mask;
						x_value = x_value >> n_bits_per_item;
						n_bit_remainder -= n_bits_per_item;
					} while(n_bit_remainder >= n_bits_per_item);
				@{end_each()}
				this.bit_remainder = n_bit_remainder;
				this.bit_value = x_value;
			}
			// larger than a byte
			else {
				let n_bit_remainder = this.bit_remainder;
				let x_value = this.bit_value;
				@{each('byte', 'x')}
					x_value |= (x_byte << n_bit_remainder);
					n_bit_remainder += 8;
					while(n_bit_remainder >= n_bits_per_item) {
						ab_array[i_ptr++] = x_value & x_mask;
						x_value = x_value >> n_bits_per_item;
						n_bit_remainder -= n_bits_per_item;
					}
				@{end_each()}
				this.bit_remainder = n_bit_remainder;
				this.bit_value = x_value;
			}

			// save ptr index
			this.data_write_index = i_ptr;
		}
		// HDT "array-Z"
		else {
			// ref existing data array-buffer
			let ab_array = k_graph.data_s_po;

			// not exists
			if(!ab_array) {
				// create data array-buffer
				ab_array = k_graph.data_s_po = @{mk_uint_array('this.bitmap_entry_size', 'x_mask')};
			}
			// it was started prior
			else {
				// fetch ptr index
				i_ptr = this.data_write_index;
			}

			let c_count_d = k_graph.count_d;
			let c_count_o = k_graph.count_o;
			let c_count_l = k_graph.count_l;
			let c_divide = c_count_d + c_count_l;

			// perfect byte alignment
			if(n_bits_per_item == 8) {
				@{each('byte', 'x')}
					if(x_byte > c_divide) x_byte -= c_count_l;
					else if(x_byte > c_count_d) x_byte += c_count_o;
					ab_array[i_ptr++] = x_byte;
				@{end_each()}
			}
			// smaller than a byte
			else if(n_bits_per_item < 8) {
				let n_bit_remainder = this.bit_remainder;
				let x_value = this.bit_value;
				@{each('byte', 'x')}
					x_value |= (x_byte << n_bit_remainder);
					n_bit_remainder += 8;
					do {
						let i_data_c = x_value & x_mask;
						if(i_data_c > c_divide) i_data_c -= c_count_l;
						else if(i_data_c > c_count_d) i_data_c += c_count_o;
						ab_array[i_ptr++] = i_data_c;
						x_value = x_value >> n_bits_per_item;
						n_bit_remainder -= n_bits_per_item;
					} while(n_bit_remainder >= n_bits_per_item);
				@{end_each()}
				this.bit_remainder = n_bit_remainder;
				this.bit_value = x_value;
			}
			// larger than a byte
			else {
				let n_bit_remainder = this.bit_remainder;
				let x_value = this.bit_value;
				@{each('byte', 'x')}
					x_value |= (x_byte << n_bit_remainder);
					n_bit_remainder += 8;
					while(n_bit_remainder >= n_bits_per_item) {
						let i_data_c = x_value & x_mask;
						if(i_data_c > c_divide) i_data_c -= c_count_l;
						else if(i_data_c > c_count_d) i_data_c += c_count_o;
						ab_array[i_ptr++] = i_data_c;
						x_value = x_value >> n_bits_per_item;
						n_bit_remainder -= n_bits_per_item;
					}
				@{end_each()}
				this.bit_remainder = n_bit_remainder;
				this.bit_value = x_value;
			}

			// save ptr index
			this.data_write_index = i_ptr;
		}

		// consumed entire payload
		if(!b_fragmented) {
			// flip bitmap section Y/Z flag
			this.bitmap_section_z = !this.bitmap_section_z;

			// clear bit values
			this.bit_remainder = 0;
			this.bit_value = 0;

			// now onto bitmap section Z
			if(this.bitmap_section_z) {
				@{crc_check(32, 'triples_bitmap_array')}
			}
			// end of section
			else {
				@{crc_check(32, 'triples_data')}
			}
		}
	@{end_method('triples_bitmap_array_entries')}


	// after consuming a triples array section
	triples_data(a, n, i) {
		// this is being used as a parser
		if(this.config.data) {
			// ref graph
			let k_graph = this.graph;

			// iterate every quad in graph
			for(let h_quad of k_graph.quads()) {
				// emit quad to user
				this.data(h_quad);
			}
		}

		// return to base state
		@{goto('control')}
	},


	// variable-byte number in crc-8 mode
	@{method('vbyte_8')}
		// only advance state once entire vbyte has been consumed
		let c_b = 0;

		// vbyte integer value
		let x_value = 0;

		// ref current crc value
		let x_crc = this.crc;

		// for breaking to indicate all vbyte was consumed
		let b_consumed = false;

		// while there are bytes
		let n_r = n - i;
		while(c_b < n_r) {
			// byte value
			let x = a[i+c_b];

			// update crc
			x_crc = @{crc_byte(8, 'x')}

			// add lower value
			x_value |= (x & 0x7f) << (7 * c_b++);

			// last byte of number
			if(x & 0x80) {
				b_consumed = true;
				break;
			}
			// more bytes ahead
			else {
				// x_value = x_value << 7;
				// x = a[i++];
			}
		}

		// consumed entire vbyte
		if(b_consumed) {
			// advance index
			i += c_b;

			// save crc value to instance
			this.crc = x_crc;

			// save vbyte value to specific key
			this[this.vbyte_key] = x_value;

			// pop state
			@{pop_state()}
		}
	@{end_method('vbyte_8')}


	// variable-byte number in crc-32 mode
	@{method('vbyte_32')}
		@{vbyte_inline(32, '[this.vbyte_key]')}

		// pop state
		@{pop_state()}
	@{end_method('vbyte_32')}



	// transfer dict array into denser memory storage formats
	transfer_dict_into_graph(s_section_code, a_dict, a_ref, n_dict_length) {
		// prepare array-buffer for dict and ref, respectively
		let ab_dict = new Uint8Array(n_dict_length);
		let ab_ref = @{mk_uint_array('a_dict.length + 1', 'n_dict_length')};

		// track offset of words within dict
		let i_offset = 0;

		// iterate vector to produce storage format
		for(let i_entry=0; i_entry<a_dict.length; i_entry++) {
			// ref word from dict
			let ab_word = a_dict[i_entry];

			// shift buffer into dict
			ab_dict.set(ab_word, i_offset);

			// update offset
			i_offset += ab_word.length;

			// store offset to ref (including end-of-list; assumes initial element is 0)
			ab_ref[i_entry+1] = i_offset;
		}

		// transfer into graph container
		let k_graph = this.graph;
		k_graph['dict_'+s_section_code] = ab_dict;
		k_graph['ref_'+s_section_code] = ab_ref;
		k_graph['count_'+s_section_code] = a_dict.length;
	},

	// transfer a front-coding dict into graph
	transfer_fc_dict_into_graph(s_section_code, a_dict, n_dict_length, n_max_word_length) {
		// sort the dict
		a_dict.sort((ab_a, ab_b) => {
			let n_limit = Math.min(ab_a.length, ab_b.length);
			for(let i=0; i<n_limit; i++) {
				let x_a = ab_a[i];
				let x_b = ab_b[i];
				if(x_a !== x_b) return x_a < x_b? -1: 1;
			}
			return 0;
		});

		// ref number of items in dict
		let n_words = a_dict.length;

		// // significant dict size (greater than 100k words)
		// if(a_dict.length > 1e6) {
		// 	let os = require('os');
			let bus = require('../main/bus');
		// 	let cp = require('child_process');
		// 	let n_cpus = os.cpus().length;

		// 	// new multiplexing serializer/deserializer
		// 	let k_multi = bus.multiplex({
		// 		channels: n_cpus,
		// 		ordered: true,
		// 	}).divide({
		// 		array: a_dict,
		// 		multiple: 16,
		// 		ammend: bus.encode(n_max_word_length),
		// 	});

		// 	// as each serial input finishes
		// 	k_multi.on('receive', (a_dict_part, a_ref_part, ab_lens_part) => {
		// 		// join them...
		// 		debugger;
		// 	});

		// 	// each cpu
		// 	for(let i_cpu=0; i_cpu<n_cpus; i_cpu++) {
		// 		// spawn worker
		// 		let u_worker = cp.spawn('node', [__dirname+'/worker.js'], {
		// 			stdio: ['pipe', process.stdout, process.stderr, 'pipe'],
		// 		});

		// 		// bind to worker output
		// 		u_worker.stdio[3].pipe(k_multi.incoming());

		// 		// send buffer over child proc
		// 		k_multi.outgoing().pipe(u_worker.stdin);
		// 	}
		// }

		// if(true) return;

		// user wants build progress updates
		let f_build_progress = this.config.build_progress || function(){};
		f_build_progress('fc_dict_l', 0);

		// buffer for encoding dict
		let ab_dict = Buffer.allocUnsafe(N_DEFAULT_ALLOCATION_SIZE);

		// list of dict indexes
		let a_ref = [];

		// array of whole word lengths
		let at_lens = @{mk_uint_array('a_dict.length', 'n_max_word_length')}

		// position in dict where to find each block #
		let i_write = 0;

		// dict src index
		let i_read = 0;

		// apply front-coding
		let i_word = 0;
		while(i_word < n_words) {
			// save position of block head
			a_ref.push(i_write);

			// encode first word fully
			let ab_word = a_dict[i_read++];
			let n_word = ab_word.length;
			ab_dict = commit(ab_word, n_word, ab_dict, i_write);
			i_write += n_word;

			// maximum index of block range
			let i_top = Math.min(n_words, i_word+16);

			// save word len
			at_lens[i_word++] = n_word;

			// front-code remainder of block
			while(i_word < i_top) {
				// ref word to be coded
				let ab_code = a_dict[i_read++];

				if(!(ab_code instanceof Uint8Array)) {
					debugger;
					throw 'word is not Uint8Array';
				}

				// prep to count how many chars to share
				let c_shared = 0;

				// set upper limit of word comparison length
				let i_limit = Math.min(ab_code.length, n_word);

				// search until there is a difference
				while(c_shared < i_limit) {
					if(ab_code[c_shared] !== ab_word[c_shared]) break;
					c_shared += 1;
				}

				// let c_shared = buffer_util.diverge(ab_code, ab_word);

				// encode shared chars as vbyte
				let ax_shared = [c_shared & 0x7f];
				let nx_shared = 1;
				let x_remain = c_shared >> 7;
				while(x_remain) {
					nx_shared = ax_shared.push(x_remain & 0x7f);
					x_remain = x_remain >> 7;
				}
				ax_shared[nx_shared - 1] |= 0x80;

				// write to dict
				ab_dict = commit(Buffer.from(ax_shared), nx_shared, ab_dict, i_write);
				i_write += nx_shared;

				// push remainder of string
				let n_code_word = ab_code.length;
				n_code = n_code_word - c_shared;
				ab_code = ab_code.slice(c_shared);
				ab_dict = commit(ab_code, n_code, ab_dict, i_write);
				i_write += n_code;

				// make new word
				ab_word = Buffer.concat([ab_word.slice(0, c_shared), ab_code], c_shared + n_code);

				// save word len
				at_lens[i_word++] = n_code_word;
			}

			if(i_word % 64 === 0) {
				f_build_progress('fc_dict_l', i_word / n_words);

				// every so often, trim down dict src
				if(i_word % 1024 === 0) {
					a_dict = a_dict.slice(i_read);
					i_read = 0;
				}
			}
		}

		// only keep what was used
		ab_dict = ab_dict.slice(0, i_write);

		// ab_flat = Buffer.concat([ab_flat, Buffer.from(a_flat_dict)], ab_flat.length + a_flat_dict.length);
		// a_flat_dict.length = 0;
		// ab_ref = Buffer.concat([ab_ref, Buffer.from(a_ref)], ab_ref.length + a_ref.length);
		// a_ref.length = 0;
		at_ref = @{mk_uint_array('a_ref.length', 'i_write')}
		at_ref.set(a_ref);

		// save to graph
		let k_graph = this.graph;

		// dict
		// let ab_dict = new Uint8Array(ab_flat);
		// ab_dict.set(a_flat_dict);
		k_graph['dict_'+s_section_code] = ab_dict;

		// ref
		@ // let ab_ref = @{mk_uint_array('a_ref.length', 'a_ref[a_ref.length - 1]')}
		// ab_ref.set(a_ref);
		k_graph['ref_'+s_section_code] = at_ref;

		// lens
		k_graph['len_'+s_section_code] = at_lens;

		// count
		k_graph['count_'+s_section_code] = n_words;

		let c_useless = 0;
		let c_bytes = 0;
		let h_prefix_candidates = this.prefix_candidates
		for(let s_prefix in h_prefix_candidates) {
			if(!h_prefix_candidates[s_prefix]) {
				c_useless += 1;
				c_bytes += encode_utf_8(s_prefix).length;
			}
		}
		console.log(c_useless+' useless prefixes totalling more than '+(c_bytes / 1024).toFixed(2)+' wasted KiB');
	},


	// error event
	_error(e_parse) {
		throw `error: ${e_parse}`;
	},

	// parse_error (not meant to be an event callback)
	parse_error(a, n, i, s_state) {
		this._error(`reached maximum buffer size while waiting for a valid chunk of bytes in the "${s_state}"" state @${this.offset+i}`);
	},

});


@{export_module()}

