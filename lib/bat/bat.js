
const N_DEFAULT_ALLOCATION_SIZE = 64 * 1024;  // 64 KiB

const X_TOKEN_ABSOLUTE_IRI = 0x01;
const X_TOKEN_BLANK_NODE = 0x02;
const X_TOKEN_UTF_16 = 0x03;
const X_TOKEN_PREFIX_FOLLOWS = 0x04;

const AB_ZERO = Buffer.from([0x00]);
// const AB_TOKEN_PREFIX_FOLLOWS = Buffer.from([X_TOKEN_PREFIX_FOLLOWS]);
const AB_TOKEN_ABSOLUTE_IRI = Buffer.from([0x02]);
// const AB_TOKEN_BLANK_NODE = Buffer.from([0x03]);
// const AB_TOKEN_UTF_16 = Buffer.from([0x04]);
const AB_TOKEN_DATATYPE = Buffer.from('^', 'utf-8');
const AB_TOKEN_LANGUAGE = Buffer.from('@', 'utf-8');
const AB_TOKEN_CONTENTS = Buffer.from('"', 'utf-8');


const XM_NODE_SUBJECT	= 1 << 0;
const XM_NODE_OBJECT	= 1 << 1;
const XM_NODE_PREDICATE	= 1 << 2;
const XM_NODE_DATATYPE	= 1 << 3;

const XM_NODE_HOP = XM_NODE_SUBJECT | XM_NODE_OBJECT;

// for creating new prefixes
const R_COMPRESS = /^(.*?)([^/#]*)$/;


const H_CONSTANTS = {
	X_TOKEN_ABSOLUTE_IRI,
	X_TOKEN_BLANK_NODE,
	X_TOKEN_UTF_16,
	X_TOKEN_PREFIX_FOLLOWS,

	AB_ZERO,

	AB_TOKEN_ABSOLUTE_IRI,

	AB_TOKEN_DATATYPE,
	AB_TOKEN_LANGUAGE,
	AB_TOKEN_CONTENTS,

	R_COMPRESS,
};

// creates the smallest uint typed array that satisfies the requisite `range`
const uint_array = (n_range) =>
	n_range <= 0xff
		? Uint8Array
		: (n_range <= 0xffff
			? Uint16Array
			: (n_range <= 0xffffffff
				? Uint32Array
				: (n_range <= Math.pow(2, 53)
					? Float64Array
					: new RangeError('uint size too large'))));


class buffer_writer {
	constructor(h_config){
		let {
			force_malloc: b_force_malloc,
			allocation_size: n_allocation_size=N_DEFAULT_ALLOCATION_SIZE,
		} = h_config;

		Object.assign(this, {
			buffer: b_force_malloc
				? Buffer.allocUnsafeSlow(n_allocation_size)
				: Buffer.allocUnsafe(n_allocation_size),
			write: 0,
			count: 0,
			indices: [],
		});
	}

	append(ab_item) {
		let i_write = this.write;
		let ab_dest = this.buffer;

		let nl_item = ab_item.length;

		// add index
		this.indices.push(i_write + nl_item);

		// 
		let n_copied = ab_item.copy(ab_dest, i_write);
		let i_read = n_copied;
		while(i_read < nl_item) {
			i_write += n_copied;
			let ab_expand = Buffer.alloc(ab_dest.length + N_DEFAULT_ALLOCATION_SIZE);
			ab_dest.copy(ab_expand);
			ab_dest = ab_expand;
			nl_item -= n_copied;
			n_copied = ab_item.copy(ab_dest, i_write, i_read);
			i_read += n_copied;
		}

		this.write += nl_item;
		this.count += 1;
	}

	close() {
		let ab_words = this.buffer.slice(0, this.write);
		return {
			buffer: ab_words,
			indices: this.indices,
		};
	}
}


// reserved lo bit values
//   0 -> word delimiter
//   1 -> prefix follows
//   2 -> absolute iri
//   3 -> blank node
//   4 -> utf16-le
const A_KEY_RANGES = [
	0xff - 0x04,
	0xffff - 0x0404,
	0xffffff - 0x040404,
	0xffffffff - 0x04040404,
];
class key_generator {
	constructor(n_keys) {
		let n_key_bytes = 1;
		if(n_keys > A_KEY_RANGES[1]) {
			if(n_keys > A_KEY_RANGES[2]) {
				n_key_bytes = 4;
			}
			else {
				n_key_bytes = 3;
			}
		}
		else if(n_keys > A_KEY_RANGES[0]) {
			n_key_bytes = 2;
		}

		Object.assign(this, {
			key_count: n_keys,
			key_bytes: n_key_bytes,
			id: 0x05,
		});
	}

	produce(a_bytes) {
		while(a_bytes.length < this.key_bytes) {
			a_bytes.unshift(bat.AB_TOKEN_PREFIX_FOLLOWS);
		}

		return Buffer.from(a_bytes);
	}

	next(ab_write, i_write) {
		// exceeded 1 byte range
		if(this.id > 0xff) {
			this.id = 0x0505;
			this.next = this.next_16;
			return this.next();
		}
		// within range
		else {
			// just set the least significant byte
			ab_write[i_write+this.key_bytes-1] = this.id++;
		}
	}

	next_16(ab_write, i_write) {
		let i_id = this.id;

		// skip 0-4 in b0
		let x_b0 = i_id & 0xff;
		while(x_b0 < 4) x_b0 = (i_id++) &0xff;

		// exceeded 2 byte range
		if(i_id > 0xffff) {
			this.id = 0x050505;
			this.next = this.next_24;
			return this.next();
		}
		// within range
		else {
			this.id = i_id + 1;

			// set b1 and b0
			let n_key_bytes = this.key_bytes;
			ab_write[i_write+n_key_bytes-2] = i_id >> 8;
			ab_write[i_write+n_key_bytes-1] = x_b0;
		}
	}

	next_24(ab_write, i_write) {
		let i_id = this.id;

		// skip 0-4 in b0
		let x_b0 = i_id & 0xff;
		while(x_b0 < 4) x_b0 = (i_id++) &0xff;

		// skip 0-4 in b1
		let x_b1 = (i_id >> 8) & 0xff;
		while(x_b1 < 4) {
			i_id += 0x0100;
			x_b1 = (i_id >> 8) & 0xff;
		}

		// exceeded 3 byte range
		if(i_id > 0xffffff) {
			this.id = 0x05050505;
			this.next = this.next_32;
			return this.next();
		}
		// within range
		else {
			this.id = i_id + 1;

			// set b2, b1 and b0
			let n_key_bytes = this.key_bytes;
			ab_write[i_write+n_key_bytes-3] = i_id >> 16;
			ab_write[i_write+n_key_bytes-2] = x_b1;
			ab_write[i_write+n_key_bytes-1] = x_b0;
		}
	}

	next_32(ab_write, i_write) {
		let i_id = this.id;

		// skip 0-4 in b0
		let x_b0 = i_id & 0xff;
		while(x_b0 < 4) x_b0 = (i_id++) &0xff;

		// skip 0-4 in b1
		let x_b1 = (i_id >> 8) & 0xff;
		while(x_b1 < 4) {
			i_id += 0x0100;
			x_b1 = (i_id >> 8) & 0xff;
		}

		// skip 0-4 in b2
		let x_b2 = (i_id >> 16) & 0xff;
		while(x_b2 < 4) {
			i_id += 0x010000;
			x_b2 = (i_id >> 16) & 0xff;
		}

		// exceeded 4 byte range
		if(i_id > 0xfffffffe) {
			this.next = this.exceeded_range;
			ab_write[i_write+0] = 0xff;
			ab_write[i_write+1] = 0xff;
			ab_write[i_write+2] = 0xff;
			ab_write[i_write+3] = 0xff;
		}
		// within range
		else {
			this.id = i_id + 1;

			// set b3, b2, b1 and b0
			ab_write[i_write+0] = i_id >> 24;
			ab_write[i_write+1] = x_b2;
			ab_write[i_write+2] = x_b1;
			ab_write[i_write+3] = x_b0;
		}
	}

	exceeded_range() {
		throw 'exceeded 32-bit range';
	}
}



class front_coder {
	constructor(h_opt) {
		let {
			offset: i_offset=0,
			block_size: n_block_size=(1 << 4),
		} = h_opt;

		Object.assign(this, {
			offset: i_offset,
			block_size: n_block_size,
			write: 0,
			content: Buffer.allocUnsafe(N_DEFAULT_ALLOCATION_SIZE),
			block_indices: [],
			word_count: 0,
			defer: null,
		});
	}

	export() {
		let i_write = this.write;
		let n_words = this.word_count;
		let at_indices = new uint_array(i_write)(n_words);
		at_indices.set(this.indices);
		return {
			block_size: this.block_size,
			content: this.content.slice(0, i_write),
			block_indices: at_indices,
			defer: this.defer,
			word_count: n_words,
		};
	}

	add(ab_section, a_indices) {
		let n_block_size = this.block_size;
		let i_write = this.write;
		let a_block_indices = this.block_indices;
		let n_words_total = this.word_count;

		// length of section
		let nl_section = ab_section.length;

		// read index in section
		let i_read = 0;

		// number of words in section
		let n_words_section = a_indices.length;

		// how many words have been processed in this section
		let c_words_section = 0;

		// this is the first local section
		if(!i_write) {
			// offset puts this amid an existing block
			let i_offset = this.offset;
			if(0 !== i_offset % n_block_size) {
				// jump to head word of new block
				c_words_section = n_block_size - (i_offset % n_block_size);

				// index of end of this range to skip
				let i_range_end = a_indices[c_words_section];

				// defer all words at once
				this.defer = {
					content: ab_section.slice(0, i_range_end),
					indices: a_indices.slice(0, c_words_section),
				};

				// update read index
				i_read = i_range_end;
			}
		}

		// while there are words to front code
		while(i_read < nl_section) {
			// fetch head word
			let i_word_end = a_indices[c_words_section++];
			let nl_word = i_word_end - i_read;
			let ab_word = ab_section.slice(i_read, i_word_end);
			i_read = i_word_end;

			// plainly encode head word in its entirety (including null termination)
			commit(ab_word, nl_head, ab_content, i_write);
			i_write += n_word;

			// front-code remainder of block
			while(i_read < nl_section) {
				// fetch word to be coded
				i_word_end = a_indices[c_words_section++];
				let nl_test = i_word_end - i_read;
				let ab_test = ab_section.slice(i_read, i_word_end);
				i_read = i_word_end;

				// how many chars to share
				let c_shared = 0;

				// scan until difference
				let n_limit = Math.min(nl_test, nl_word);
				do {
					if(ab_test[c_shared] !== ab_word[c_shared]) break;
				} while(++c_shared < n_limit);

				// encode shared chars as vbyte
				let ab_shared = bus.encode_pint(c_shared);
				let nl_shared = ab_shared.length;

				// write shared vbyte
				ab_content = bus.push(ab_content, i_write, ab_shared, nl_shared);
				i_write += nl_shared;

				// compute byte length of code
				let ab_byte_length = bus.encode_pint(nl_code);
				let nl_byte_length = ab_byte_length.length;

				// write byte length
				ad_content = bus.push(ab_content, i_write, ab_byte_length, nl_byte_length);
				i_write += nl_byte_length

				// write rest of word
				let nl_code = nl_code_word - c_shared;
				ab_content = bus.push(ab_content, i_write, ab_test.slice(c_shared), nl_code);
				i_write += nl_code;

				// update word
				ab_word = ab_test;
				nl_word = nl_test;
			}

			// write block index
			a_block_indices.push(i_write);
		}

		// mismatch
		if(c_words_section !== n_words_section) {
			throw 'did not process expected number of items';
		}

		// update word count
		this.word_count += c_words_section;
	}
}



module.exports = Object.assign(H_CONSTANTS, {
	uint_array,
	buffer_writer,

	key_generator,
	front_coder,

	group_nodes(h_nodes) {
		// create hops, subjects, predicates, objects, and datatypes
		let a_nodes_h = [];
		let a_nodes_s = [];
		let a_nodes_p = [];
		let a_nodes_o = [];

		// separate nodes into categories
		for(let s_key in h_nodes) {
			let x_node_type = h_nodes[s_key];

			// a subject
			if(x_node_type & XM_NODE_SUBJECT) {
				// an object too
				if(x_node_type & XM_NODE_OBJECT) {
					// it's a hop
					a_nodes_h.push(s_key);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(s_key);
					}
				}
				// not an object
				else {
					// its a subject
					a_nodes_s.push(s_key);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(s_key);
					}
				}
			}
			// not a subject
			else {
				// an object
				if(x_node_type & XM_NODE_OBJECT) {
					a_nodes_o.push(s_key);
				}
				// a predicate
				if(x_node_type & XM_NODE_PREDICATE) {
					a_nodes_p.push(s_key);
				}
			}
		}

		return {
			h: a_nodes_h.sort(),
			s: a_nodes_s.sort(),
			p: a_nodes_p.sort(),
			o: a_nodes_o.sort(),
		};
	},

	//
	encode_nodes(k_buffer_writer, a_terms, ab_prefix) {
		// encode every prefixed node into a word list
		a_terms.forEach((s_suffix) => {
			// encode node to word
			let ab_word = buffer_join_zero_terminate(ab_prefix, encode_utf_8(s_suffix));

			// commit word to list
			k_buffer_writer.append(ab_word);
		});
	},

	group_and_encode_nodes(h_nodes, ab_prefix, h_buffer_writers) {
		let h_groups = this.group_nodes(h_nodes);

		for(let s_group in h_groups) {
			this.encode_nodes(h_buffer_writers[s_group], h_groups[s_group], ab_prefix);
		}
	},
});
