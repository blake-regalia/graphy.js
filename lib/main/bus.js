@macro commit(what, to, where)
	let nl_@{what} = ab_@{what}.length;
	commit(ab_@{what}, nl_@{what}, @{to? to: 'ab_chunk'}, @{where? where: 'i_write'});
	@{where? where: 'i_write'} += nl_@{what};
@end

const events = require('events');
const stream = require('stream');

const ubit = require('../gen/bit-packer.js');

const I_NULL 				= 0x00;
const I_BOOLEAN_TRUE 		= 0x01;
const I_BOOLEAN_FALSE 		= 0x02;
const I_PINT 				= 0x03;
const I_NINT 				= 0x04;
const I_DOUBLE 				= 0x05;
const I_UTF_8_STRING 		= 0x06;
const I_UTF_16_STRING 		= 0x07;
const I_HASH 				= 0x08;
const I_ARRAY 				= 0x09;
const I_BUFFER 				= 0x0A;
const I_UINT_8_ARRAY 		= 0x0B;
const I_UINT_16_ARRAY 		= 0x0C;
const I_UINT_32_ARRAY 		= 0x0D;
const I_FLOAT_64_ARRAY 		= 0x0E;
const I_SORTED_PINT_ARRAY 	= 0x0F;
const I_BOOLEAN_ARRAY 		= 0x10;
const I_MSMI                = 0x11;  // multiple strictly monotonically increasing lists
const I_CSMI                = 0x12;  // complementary strictly monotonically increasing indexes
const I_ECSMI               = 0x13;  // empty "         "
const I_SMI                 = 0x14;

const AB_NULL 				= Buffer.from([I_NULL]);
const AB_BOOLEAN_TRUE 		= Buffer.from([I_BOOLEAN_TRUE]);
const AB_BOOLEAN_FALSE 		= Buffer.from([I_BOOLEAN_FALSE]);
const AB_PINT 				= Buffer.from([I_PINT]);
const AB_NINT 				= Buffer.from([I_NINT]);
const AB_DOUBLE 			= Buffer.from([I_DOUBLE]);
const AB_UTF_8_STRING 		= Buffer.from([I_UTF_8_STRING]);
const AB_UTF_16_STRING 		= Buffer.from([I_UTF_16_STRING]);
const AB_HASH 				= Buffer.from([I_HASH]);
const AB_ARRAY 				= Buffer.from([I_ARRAY]);
const AB_BUFFER 			= Buffer.from([I_BUFFER]);
const AB_UINT_8_ARRAY 		= Buffer.from([I_UINT_8_ARRAY]);
const AB_UINT_16_ARRAY 		= Buffer.from([I_UINT_16_ARRAY]);
const AB_UINT_32_ARRAY 		= Buffer.from([I_UINT_32_ARRAY]);
const AB_FLOAT_64_ARRAY 	= Buffer.from([I_FLOAT_64_ARRAY]);
const AB_SORTED_PINT_ARRAY 	= Buffer.from([I_SORTED_PINT_ARRAY]);
const AB_BOOLEAN_ARRAY 		= Buffer.from([I_BOOLEAN_ARRAY]);
const AB_MSMI               = Buffer.from([I_MSMI]);
const AB_CSMI               = Buffer.from([I_CSMI]);
const AB_ECSMI              = Buffer.from([I_ECSMI]);
const AB_SMI                = Buffer.from([I_SMI]);


const N_DEFAULT_ALLOCATION_SIZE = 64 * 1024;  // 64 KiB
const commit = (ab_src, n_length, ab_dest, i_write) => {
	let n_copied = ab_src.copy(ab_dest, i_write);
	let i_read = n_copied;
	while(i_read < n_length) {
		i_write += n_copied;
		let ab_expand = Buffer.allocUnsafe(ab_dest.length + N_DEFAULT_ALLOCATION_SIZE);
		ab_dest.copy(ab_expand);
		ab_dest = ab_expand;
		n_length -= n_copied;
		n_copied = ab_src.copy(ab_dest, i_write, i_read);
		i_read += n_copied;
	}
	return ab_dest;
};

const bits_per_int = (x_code) => {
	// 1 - 16 bits
	if(x_code <= 0xffff) {
		// 1 - 8 bits
		if(x_code <= 0xff) {
			// 1 - 4 bits
			if(x_code <= 0x0f) {
				// 1 - 2 bits
				if(x_code <= 0x03) return x_code <= 1? 1: 2;
				// 3 - 4 bits
				else return x_code <= 0x07? 3: 4;
			}
			// 5 - 8 bits
			else {
				// 5 - 6 bits
				if(x_code <= 0x3f) return x_code <= 0x1f? 5: 6;
				// 7 - 8 bits
				else return x_code <= 0x7f? 7: 8;
			}
		}
		// 9 - 16 bits
		else {
			// 9 - 12 bits
			if(x_code <= 0xfff){
				// 9 - 10 bits
				if(x_code <= 0x3ff) return x_code <= 0x1ff? 9: 10;
				// 11 - 12 bits
				else return x_code <= 0x7ff? 11: 12;
			}
			// 13 - 16 bits
			else {
				// 13 - 14 bits
				if(x_code <= 0x3fff) return x_code <= 0x1fff? 13: 14;
				// 15 - 16 bits
				else return x_code <= 0x7fff? 15: 16;
			}
		}
	}
	// 17 - 32 bits
	else {
		// 17 - 24 bits
		if(x_code <= 0xffffff) {
			// 17 - 20 bits
			if(x_code <= 0xfffff) {
				// 17 - 18 bits
				if(x_code <= 0x3ffff) return x_code <= 0x1ffff? 17: 18;
				// 19 - 20 bits
				else return x_code <= 0x7ffff? 19: 20;
			}
			// 21 - 24 bits
			else {
				// 21 - 22 bits
				if(x_code <= 0x3fffff) return x_code <= 0x1fffff? 21: 22;
				// 23 - 24 bits
				else return x_code <= 0x7fffff? 23: 24;
			}
		}
		// 25 - 32 bits
		else {
			// 25 - 28 bits
			if(x_code <= 0xfffffff){
				// 25 - 26 bits
				if(x_code <= 0x3ffffff) return x_code <= 0x1ffffff? 25: 26;
				// 27 - 28 bits
				else return x_code <= 0x7ffffff? 27: 28;
			}
			// 29 - 32 bits
			else {
				// 29 - 30 bits
				if(x_code <= 0x3fffffff) return x_code <= 0x1fffffff? 29: 30;
				// 31 - 32 bits
				else return x_code <= 0x7fffffff? 31: 32;
			}
		}
	}
};


const deltas = (a_items) => {
	let n_items = a_items.length;
	let at_deltas = new Uint16Array(n_items-1);
	let i_write = 0;
	let x_rel = a_items[0];
	for(let i_item=1; i_item<n_items; i_item++) {
		let x_value = a_items[i_item];
		at_deltas[i_write++] = x_value - x_rel;
		x_rel = x_value;
	}
	return at_deltas;
};

const front_coded_diff = (ab_a, ab_b) => {
	let n_a = ab_a.length;
	let n_b = ab_b.length;
	let n_max = Math.max(n_a, n_b);
	let i_char = 0;
	do {
		if(ab_a[i_char] !== ab_b[i_char]) break;
	} while(++i_char < n_max);

	let ab_share = encode_pint(i_char);
	let nl_share = ab_share.length;
	let ab_coded = Buffer.allocUnsafe(nl_share + n_b - i_char);
	ab_share.copy(ab_coded);
	ab_b.copy(ab_coded, nl_share, i_char);
	return ab_coded;
};

const front_coded_sum = (ab_word, ab_diff) => {
	let {v:n_shared, i:i_read} = decode_pint(ab_diff, 0);
	let ab_sum = Buffer.allocUnsafe(n_shared + ab_diff.length - i_read);
	ab_word.copy(ab_sum, 0, 0, n_shared);
	ab_diff.copy(ab_sum, n_shared, i_read);
	return ab_sum;
};

const H_ENCODERS = {
	sorted_list: (...a_args) => encode_sorted_list(...a_args),

	array(a_items, a_chunk, s_each_type, ...a_args) {
		a_chunk.push(AB_ARRAY);
		let n_items = a_items.length;
		let ab_length = encode_pint(n_items);
		a_chunk.push(ab_length);
		let c_bytes = 1 + ab_length.length;
		let f_encoder = H_ENCODERS[s_each_type];
		for(let i_item=0; i_item<n_items; i_item++) {
			c_bytes += f_encoder(a_items[i_item], a_chunk, ...a_args);
		}
		return c_bytes;
	},

	null_terminated_fc_dict: (ab_dict, a_chunk, at_len, ...a_args) => {
		// count how many bytes we'll be needing
		let n_words = at_len.length;
		let c_bytes = ab_dict.length + n_words;

		// allocate buffer
		let ab_nt_dict = Buffer.allocUnsafe(c_bytes);

		// prepare to consume each word
		let i_read = 0;
		let i_write = 0;
		for(let i_word=0; i_word<n_words;) {
			let n_length = at_len[i_word++];
			ab_dict.slice(i_read, i_read+n_length).copy(ab_nt_dict, i_write);
			i_read += n_length;
			i_write += n_length;

			// add NULL delimiter
			ab_nt_dict[i_write++] = 0;

			let i_max = Math.min(i_word + 15, n_words);
			while(i_word < i_max) {
				n_length = at_len[i_word++];
				let i_prior_shared = i_read;
				let h = decode_pint(ab_dict, i_read); let n_shared=h.v; i=h.i;
				let n_unshared = n_length - n_shared;
				ab_dict.slice(i_prior_shared, i_read+n_unshared).copy(ab_nt_dict, i_write);
				i_write += (i_read - i_prior_shared) + n_unshared;
				i_read += n_unshared;

				// add NULL delimiter
				ab_nt_dict[i_write++] = 0;
			}
		}

		a_chunk.push(ab_nt_dict);
		return c_bytes;
	},

// 	null_terminated_fc_dict_compressed: (ab_dict, a_chunk, n_block_k, ...a_args) => {
// 		// count how many bytes we'll be needing
// 		let c_bytes = ab_dict.length;

// 		// allocate buffer
// 		let ab_nt_dict = Buffer.allocUnsafe(c_bytes);

// 		// keep running buffer of word
// 		let ab_word = Buffer.allocUnsafe(0);
// // debugger;
// 		// prepare to consume each word
// 		let i_read = 0;
// 		let i_write = 0;

// 		scanning_words:
// 		for(let i_word=0;;) {
// 			let i_head_end = ab_dict.indexOf(0, i_read);
// 			let ab_word_new = ab_dict.slice(i_read, i_head_end);
// 			let ab_coded = !i_word? ab_word_new: front_coded_diff(ab_word, ab_word_new);
// 			ab_coded.copy(ab_nt_dict, i_write);
// 			i_write += ab_coded.length;
// 			ab_word = ab_word_new;
// 			i_read = i_head_end + 1;

// 			// add NULL delimiter
// 			ab_nt_dict[i_write++] = 0;

// 			let i_max = i_word + (1 << n_block_k);
// 			while(++i_word < i_max && i_read < c_bytes) {
// 				let h_shared=decode_pint(ab_dict, i_read); let n_shared=h_shared.v; i_read=h_shared.i;
// 				let h_unshared=decode_pint(ab_dict, i_read); let n_unshared=h_unshared.v; i_read=h_unshared.i;
// 				let nl_word = n_shared + n_unshared;
// 				ab_coded = ab_dict.slice(i_read, i_read+n_unshared);
// 				ab_word = front_coded_sum(ab_word, ab_coded);
// 				ab_coded.copy(ab_nt_dict, i_write);
// 				i_write += n_unshared;
// 				i_read += n_unshared;

// 				// add NULL delimiter
// 				ab_nt_dict[i_write++] = 0;

// 				if(i_read >= c_bytes) break scanning_words;
// 			}
// 		}

// 		ab_nt_dict = ab_nt_dict.slice(0, i_write);
	
// 		let ab_huffman = encode_huffman(ab_nt_dict);
// 		a_chunk.push(ab_huffman);
// 		return ab_huffman.length;
// 	},

	null_terminated_fc_dict_compressed: (k_section, a_chunk, n_block_k, ...a_args) => {
		// count how many bytes we'll be needing
		let c_bytes = k_section.dict.length;

		// allocate buffer
		let ab_nt_dict = Buffer.allocUnsafe(c_bytes);

		// position of write head to nt dict
		let i_write = 0;

		// base word to encode diff from
		let ab_base = Buffer.allocUnsafe(0);
		let i_word = 0;

		scanning_words:
		for(let ab_word of k_section.each()) {
			let ab_coded = !i_word? ab_word: front_coded_diff(ab_base, ab_word);
			ab_coded.copy(ab_nt_dict, i_write);
			i_write += ab_coded.length;
			ab_base = ab_word;

			// add NULL delimiter
			ab_nt_dict[i_write++] = 0;
		}

		ab_nt_dict = ab_nt_dict.slice(0, i_write);
	
		let ab_huffman = encode_huffman(ab_nt_dict);
		a_chunk.push(ab_huffman);
		return ab_huffman.length;
	},

	multiple_strictly_monotonically_increasing: (at_data, a_chunk, at_idx) => {
		let n_idxs = at_idx.length;

		let at_deltas = new Uint32Array(at_data.length + at_idx.length);
		let i_write = 0;

		// convert to null-delimited delta list
		for(let i_idx=0; i_idx<n_idxs-1; i_idx++) {
			// start reading from top of index
			let i_read = at_idx[i_idx];

			// stop reading at top of next index
			let i_max = at_idx[i_idx+1];

			// encode top value as vbyte
			let x_rel = at_data[i_read++];
			// let ab_top = encode_pint(x_rel);

			at_deltas[i_write++] = x_rel;
			for(; i_read<i_max; i_read++) {
				let x_value = at_data[i_read];
				at_deltas[i_write++] = x_value - x_rel;
				x_rel = x_value;
			}
			at_deltas[i_write++] = 0;
		}

		let ab_huffman = encode_huffman(at_deltas);
		// let nl_huffman = ab_huffman.length;
		a_chunk.push(AB_MSMI);
		a_chunk.push(ab_huffman);

		return 1 + ab_huffman.length;
	},

	multiple_strictly_monotonically_increasing_2: (at_data, a_chunk, at_idx) => {
		let n_idxs = at_idx.length;

		let nl_chunk = 1;
		a_chunk.push(AB_MSMI);

		// convert to null-delimited delta list
		for(let i_idx=0; i_idx<n_idxs-1; i_idx++) {
			// start reading from top of index
			let i_read = at_idx[i_idx];

			// encode top value as vbyte
			let x_rel = at_data[i_read++];
			let ab_top = encode_pint(x_rel);
			a_chunk.push(ab_top);

			let x_max = x_rel;

			// stop reading at top of next index
			let i_max = at_idx[i_idx+1];

			let at_deltas = new Uint32Array(i_max - i_read + 1);
			let i_write = 0;
			while(i_read < i_max) {
				let x_value = at_data[i_read++];
				at_deltas[i_write++] = x_value - x_rel;
				x_rel = x_value;
				x_max = Math.max(x_max, x_value);
			}
			at_deltas[i_write++] = 0;
			let ab_huffman = encode_huffman(at_deltas);

			let ab_dummy = Buffer.allocUnsafe(Math.ceil(Math.log2(x_max+1)*(i_max-i_read)*0.125));

			if(ab_dummy.length < ab_huffman.length) {
				a_chunk.push(ab_dummy);
				nl_chunk += ab_top.length + ab_dummy.length;
			}
			else {
				a_chunk.push(ab_huffman);
				nl_chunk += ab_top.length + ab_huffman.length;
			}
		}

		debugger;
		return nl_chunk;
	},

	nested_multiple_strictly_monotonically_increasing: (at_data, a_chunk, a_idx_super) => {
		let n_idx_super = a_idx_super.length;
		let c_idxs_total = 0;
		for(let i_idx=0; i_idx<n_idx_super; i_idx++) {
			c_idxs_total += a_idx_super[i_idx].length - 1;
		}

		let at_deltas = new Uint32Array(at_data.length + c_idxs_total);
		let i_write = 0;
debugger;
		// convert to null-delimited delta list
		for(let i_group=0; i_group<n_idx_super; i_group++) {
			let at_idx = a_idx_super[i_group];

			let nl_idx = at_idx.length;
			for(let i_idx=0; i_idx<nl_idx; i_idx++) {
				// start reading from top of index
				let i_read = at_idx[i_idx];

				// stop reading at top of next index
				let i_max = at_idx[i_idx+1];

				// encode top value as vbyte
				let x_rel = at_data[i_read++];
				// let ab_top = encode_pint(x_rel);

				at_deltas[i_write++] = x_rel;
				for(; i_read<i_max; i_read++) {
					let x_value = at_data[i_read];
					at_deltas[i_write++] = x_value - x_rel;
					x_rel = x_value;
				}
				at_deltas[i_write++] = 0;
			}
		}

		let ab_huffman = encode_huffman(at_deltas);
		// let nl_huffman = ab_huffman.length;
		a_chunk.push(AB_MSMI);
		a_chunk.push(ab_huffman);

		return 1 + ab_huffman.length;
	},

	nested_complementary_strictly_monotonically_increasing_index() {
		debugger;
	},

	differential_bit_sequence: (at_data, a_chunk, at_idx) => {
		let ab_chunk = Buffer.allocUnsafe(N_DEFAULT_ALLOCATION_SIZE);
		let n_idxs = at_idx.length;
		let i_write = 0;
		for(let i_idx=0; i_idx<n_idxs; i_idx++) {
			// start reading from top of index
			let i_read = at_idx[i_idx];

			// stop reading at top of next index
			let i_max = at_idx[i_idx+1];

			// encode top value as vbyte
			let x_rel = at_data[i_read++];
			let ab_top = encode_pint(x_rel);

			// commit top value to buffer
			@{commit('top')}

			// compute/encode/commit number of items in list as vbyte
			let n_items = i_max - i_read;
			let ab_items = encode_pint(n_items);
			@{commit('items')}

			// each item 

			// byte value
			let x = 0;

			// bitwsie position within byte
			let i_x = 0;

debugger;
			// bytes as they are produced
			let a_bytes = [];
			while(i_read < i_max) {
				let x_actual = at_data[i_read++];

				// compute difference
				let x_diff = x_actual - x_rel;

				// positive difference
				if(x_diff > 0) {
					// positive difference indicator
					i_x += 1;  // same as writing bit 0
				}
				// zero or negative difference
				else {
					// negative difference indicator
					x |= 0x80 >>> i_x++;  // write bit 1

					// swap diff
					x_diff = 1 - x_diff;
				}

				// ran out of bits
				if(i_x === 8) {
					// commit byte to array
					a_bytes.push(x);

					// reset byte
					x = 0;
					i_x = 0;
				}

				// available bits remaining in this byte
				let n_bits_remaining = 8 - i_x;

				// until value is encoded
				for(;;) {
					// value belongs in this byte
					if(x_diff <= n_bits_remaining) {
						// advance bit index
						i_x += x_diff;

						// encode to proper bit
						x |= 0x100 >>> i_x;

						// ran out of bits
						if(i_x === 8) {
							// commit byte to array
							a_bytes.push(x);

							// reset byte
							x = 0;
							i_x = 0;
						}

						// update relative value
						x_rel = x_actual;
					}
					// value belongs in future byte
					else {
						// commit byte to array
						a_bytes.push(x);

						// reset byte
						x = 0;
						i_x = 0;

						// adjust difference to relative value
						x_diff -= 8;

						// all bits remain!
						n_bits_remaining = 8;

						// try again
						continue;
					}

					// go on with the encoding
					break;
				}
			}
		}
	},

	complementary_strictly_monotonically_increasing: (at_idx, a_chunk, at_data) => {
		let n_idxs = at_idx.length;
		let a_reduced = [];
		for(let i_idx=1; i_idx<n_idxs-1; i_idx++) {
			let i_eol = at_idx[i_idx];

			// break is nominal
			if(at_data[i_eol-1] >= at_data[i_eol]) continue;

			// break requires delimiter
			a_reduced.push(i_idx);
		}

		// too few for deltas!
		if(a_reduced.length < 2) {
			return encode(a_reduced, a_chunk);
		}

		// compute deltas
		let at_deltas = deltas(a_reduced);

		// encode as huffman
		let ab_huffman = encode_huffman(at_deltas);
		let nl_huffman = ab_huffman.length;

		// encode top value
		let ab_top = encode_pint(a_reduced[0]);
		let nl_top = ab_top.length;

		a_chunk.push(AB_CSMI);
		a_chunk.push(ab_top);
		a_chunk.push(ab_huffman);

		debugger;
		return 1 + nl_top + nl_huffman;
	},

	strictly_monotonically_increasing: (at_data, a_chunk) => {
		// compute deltas
		let at_deltas = deltas(at_data);

		// encode as huffman
		let ab_huffman = encode_huffman(at_deltas);
		let nl_huffman = ab_huffman.length;

		// encode top value
		let ab_top = encode_pint(at_data[0]);
		let nl_top = ab_top.length;

		a_chunk.push(AB_SMI);
		a_chunk.push(ab_top);
		a_chunk.push(ab_huffman);

		// debugger;
		return 1 + nl_top + nl_huffman;
	},
};

const H_TYPES = {
	SORTED_LIST: 'sorted_list',
	ARRAY: 'array',
	NULL_TERMINATED_FC_DICT: 'null_terminated_fc_dict',
	NULL_TERMINATED_FC_DICT_COMPRESSED: 'null_terminated_fc_dict_compressed',
	DIFFERENTIAL_BIT_SEQUENCE: 'differential_bit_sequence',
	SMI: 'strictly_monotonically_increasing',
	CSMI: 'complementary_strictly_monotonically_increasing',
	MSMI: 'multiple_strictly_monotonically_increasing_2',
	NMSMI: 'nested_multiple_strictly_monotonically_increasing',
	NCSMI: 'nested_complementary_strictly_monotonically_increasing',
};

const F_SORT_WEIGHTS_DESCENDING = (h_a, h_b) => {
	let x_a = h_a.weight;
	let x_b = h_b.weight;
	return x_a === x_b? 0: (x_a < x_b? 1: -1);
};

const F_SORT_BITS = (h_a, h_b) => {
	let x_a = h_a.bits;
	let x_b = h_b.bits;
	return x_a === x_b
		? (h_a.item < h_b.item? -1: 1)
		: (x_a < x_b? -1: 1);
};

const encode_huffman = (a_items, a_chunk) => {
	let x_max_item = 0;

	// create leaf nodes
	let h_leafs = {};
	let n_items = a_items.length;
	for(let i_item=0; i_item<n_items; i_item++) {
		// use item value as key
		let x_item = a_items[i_item];

		// leaf exists; increment weight
		if(h_leafs[x_item]) {
			h_leafs[x_item].weight += 1;
		}
		// leaf not yet exists; create leaf node
		else {
			// record max item value
			x_max_item = Math.max(x_max_item, x_item);
			h_leafs[x_item] = {
				item: x_item,
				weight: 1,
			};
		}
	}

	// convert hash into array
	let a_queue = [];
	for(let s_item in h_leafs) {
		a_queue.push(h_leafs[s_item]);
	}

	// free leafs to gc
	h_leafs = null;

	// sort in descending weight order
	a_queue.sort(F_SORT_WEIGHTS_DESCENDING);

	// so long as there are nodes to combine
	while(a_queue.length >= 2) {
		// grab left and right nodes
		let h_right = a_queue.pop();
		let h_left = a_queue.pop();

		// combine weights
		let x_weight = h_left.weight + h_right.weight;

		// delete weights from left and right child
		delete h_left.weight;
		delete h_right.weight;

		// create parent node
		let h_node = {
			right: h_right,
			left: h_left,
			weight: x_weight,
		};

		// find proper position to insert node
		insert_sort:
		for(;;) {
			for(let i_leaf=a_queue.length-1; i_leaf>=0; i_leaf--) {
				// found sorted position within queue
				if(x_weight < a_queue[i_leaf].weight) {
					a_queue.splice(i_leaf+1, 0, h_node);
					break insert_sort;
				}
			}

			// node must have greatest weight; insert at end of queue
			a_queue.unshift(h_node);
			break;
		}
	}

	// canonicalize huffman tree
	let a_table = canonicalize_huffman_tree(a_queue[0]).sort(F_SORT_BITS);
	let n_table = a_table.length;

	// set maximum bit length
	let n_bits_per_length = bits_per_int(a_table[n_table-1].bits);

	// create lookup tree
	let h_lookup = {};
	{
		// prep first entry
		let n_prev_bits = a_table[0].bits;
		let s_code = '0'.repeat(n_prev_bits);
		let x_code = parseInt(s_code, 2);

		// commit all entries
		for(let i_row=0; i_row<n_table; i_row++) {
			let h_node = a_table[i_row];

			// length is greater; shift code
			while(h_node.bits > n_prev_bits) {
				x_code = x_code << 1;
				s_code += '0';
				n_prev_bits += 1;
			}

			// commit mapping
			h_lookup[h_node.item] = {
				value: x_code,
				bits: h_node.bits,
			};

			// advance code, then convert back to binary string
			x_code += 1;
			let s_new_code = x_code.toString(2);
			let n_code = s_code.length;
			let n_new_code = s_new_code.length;
			// assure zero-padding
			s_code = n_new_code < n_code? '0'.repeat(n_code-n_new_code)+s_new_code: s_new_code;
		}
	}


	// bit packing
	{
		// encode items into packed format
		let nl_packed_content = N_DEFAULT_ALLOCATION_SIZE;
		let ab_packed_content = Buffer.allocUnsafe(nl_packed_content);
		let i_write = 0;
		let n_bit_width = 8;
		let n_bits_remaining = n_bit_width;
		let x = 0;
		for(let i_item=0; i_item<n_items; i_item++) {
			let x_item = a_items[i_item];
			let h_node = h_lookup[x_item];

			let x_value = h_node.value;
			let n_bits = h_node.bits;
			for(;;) {
				let n_shift = n_bits_remaining - n_bits;
				if(n_shift >= 0) {
					x |= x_value << n_shift;
					n_bits_remaining = n_shift;
					break;
				}
				else {
					n_bits = -n_shift;
					x |= x_value >>> -n_shift;
					ab_packed_content[i_write++] = x;
					if(i_write === nl_packed_content) {
						nl_packed_content += N_DEFAULT_ALLOCATION_SIZE;
						let ab_newspace = Buffer.allocUnsafe(nl_packed_content);
						ab_packed_content.copy(ab_newspace);
						ab_packed_content = ab_newspace;
					}
					x = 0;
					x_value &= (1 << n_bits) - 1;
					n_bits_remaining = 8;
				}
			}
		}

		// push final byte
		ab_packed_content[i_write++] = x;
		ab_packed_content = ab_packed_content.slice(0, i_write);

		// encode tree
		let n_bits_per_item = bits_per_int(x_max_item);
		let a_prepacked_tree = [];
		for(let i_row=0; i_row<n_table; i_row++) {
			let h_row = a_table[i_row];
			a_prepacked_tree.push((h_row.bits << n_bits_per_item) | h_row.item);
		}
		// debugger;
		let n_item_width = n_bits_per_length + n_bits_per_item;
		let ab_packed_tree = ubit.pack(a_prepacked_tree, n_item_width, 32);
		let nl_packed_tree = ab_packed_tree.length;
		let ab_leaf_count = encode_pint(a_prepacked_tree.length);
		let nl_leaf_count = ab_leaf_count.length;

		{
			let ab_message = Buffer.allocUnsafe(1 + 1 + nl_leaf_count + nl_packed_tree + ab_packed_content.length);
			let i_write = 0;
			ab_message[i_write++] = n_item_width;
			ab_message[i_write++] = n_bits_per_item;
			ab_leaf_count.copy(ab_message, i_write);
			i_write += nl_leaf_count;
			ab_packed_tree.copy(ab_message, i_write);
			i_write += nl_packed_tree;
			ab_packed_content.copy(ab_message, i_write);
			return ab_message;
		}
	}
};

const build_huffman_lookup = (h_node, s_code='', h_lookup={}) => {
	// node is not a leaf; recursively build binary tree path
	if(h_node.left) {
		build_huffman_lookup(h_node.left, s_code+'0', h_lookup);
		build_huffman_lookup(h_node.right, s_code+'1', h_lookup);
	}
	// leaf node; map key-value pair
	else {
		h_lookup[h_node.item] = {
			value: parseInt(s_code, 2),
			bits: s_code.length,
		};
	}

	return h_lookup;
};

const canonicalize_huffman_tree = (h_node, n_length=0, a_table=[]) => {
	// node is not a leaf; recursively build binary tree path
	if(h_node.left) {
		n_length += 1;
		canonicalize_huffman_tree(h_node.left, n_length, a_table);
		canonicalize_huffman_tree(h_node.right, n_length, a_table);
	}
	// leaf node; map key-value pair
	else {
		a_table.push({
			item: h_node.item,
			bits: n_length,
		});
	}

	return a_table;
};


//
const encode_sorted_list = (a_items, a_chunk) => {
	let n_items = a_items.length;

	// relative starting value
	let x_rel = a_items[0];

	// number of bits needed for sequence
	let n_bits = a_items[n_items - 1] - x_rel + 1;

	// number of bytes that will be completely full
	let n_full_bytes = (n_bits >>> 3);

	// need an extra partially filled byte at the end
	let b_partial_final = ~~((n_full_bytes << 3) < n_bits);

	// type of array to reconstruct
	let i_type = I_ARRAY;
	if(a_items instanceof Uint8Array) i_type = I_UINT_8_ARRAY;
	else if(a_items instanceof Uint16Array) i_type = I_UINT_16_ARRAY;
	else if(a_items instanceof Uint32Array) i_type = I_UINT_32_ARRAY;

	// size of list
	let ab_length = encode_pint(n_items);
	let nx_length = ab_length.length;

	// encode starting value as pint
	let ab_rel = encode_pint(x_rel);
	let nx_rel = ab_rel.length;

	// allocate buffer for number of bytes needed in total
	let ab_bytes = Buffer.allocUnsafe(1 + nx_length + nx_rel + n_full_bytes + b_partial_final);

	// write position within buffer
	let i_write = 0;

	// start encoding header
	ab_bytes[i_write++] = I_SORTED_PINT_ARRAY;
	ab_bytes.set(ab_length, i_write);
	i_write += nx_length;
	ab_bytes.set(ab_rel, i_write);
	i_write += nx_rel;

	// current item value
	let x_item;

	// difference to start of byte
	let x_diff;

	// current byte
	let x = 0;

	// encode all items
	for(let i_item=0; i_item<n_items; i_item++) {
		// difference between current and relative value (top of byte)
		x_diff = a_items[i_item] - x_rel;
		for(;;) {
			// value belongs in this byte; encode to proper bit
			if(x_diff < 8) x |= 0x80 >>> x_diff;
			else {
				// push current byte to buffer
				ab_bytes[i_write++] = x;

				// reset byte value
				x = 0;

				// shift relative value
				x_rel += 8;

				// adjust difference to starting value
				x_diff -= 8;

				// try again
				continue;
			}

			// go on with the encoding
			break;
		}
	}

	// partial byte at end
	if(b_partial_final) ab_bytes[i_write++] = x;

	// buffer
	a_chunk.push(ab_bytes);
	return ab_bytes.length;
};

const decode_sorted_list = (a, i) => {
	// output list of values
	let a_items = [];

	// length of output list
	let h_items=decode_pint(a, i); let n_items=h_items.v; i=h_items.i;

	// top of each byte in item value
	let h_top=decode_pint(a, i); let x_top=h_top.v; i=h_top.i;

	// current byte index (incremental => counter)
	let c_b = 0;

	// loop until list is filled
	while(a_items.length < n_items) {
		// byte value
		let x = a[i++];

		if(x & 0x80) a_items.push(x_top);
		if(x & 0x40) a_items.push(x_top+1);
		if(x & 0x20) a_items.push(x_top+2);
		if(x & 0x10) a_items.push(x_top+3);
		if(x & 0x08) a_items.push(x_top+4);
		if(x & 0x04) a_items.push(x_top+5);
		if(x & 0x02) a_items.push(x_top+6);
		if(x & 0x01) a_items.push(x_top+7);

		x_top += 8;
	}

	// decoded list of items
	return {v:a_items, i};
};

const decode_sorted_list_frag = (a, i, n) => {
	// output list of values
	let a_items = [];

	// length of output list
	let h_items_frag = decode_pint_frag(a, i, n);
	if(!h_items_frag) return false;
	let h_items=h_items_frag; let n_items=h_items.v; i=h_items.i;

	// top of each byte in item value
	let h_top_frag = decode_pint_frag(a, i, n);
	if(!h_top_frag) return false;
	let h=h_top_frag; let x_top=h.v; i=h.i;

	// current byte index (incremental => counter)
	let c_b = 0;

	// loop until list is filled
	while(a_items.length < n_items) {
		if(i >= n) return false;

		// byte value
		let x = a[i++];

		if(x & 0x80) a_items.push(x_top);
		if(x & 0x40) a_items.push(x_top+1);
		if(x & 0x20) a_items.push(x_top+2);
		if(x & 0x10) a_items.push(x_top+3);
		if(x & 0x08) a_items.push(x_top+4);
		if(x & 0x04) a_items.push(x_top+5);
		if(x & 0x02) a_items.push(x_top+6);
		if(x & 0x01) a_items.push(x_top+7);

		x_top += 8;
	}

	// decoded list of items
	return {v:a_items, i};
};

// encodes up to 64-bit positive integers
const encode_pint = (x_value) => {
	// 0x80: 1
	// 0x4000: 2
	// 0x200000: 3
	// 0x10000000: 4
	// 0x7fffffff
	// 0x7fffffff
	// 0x800000000: 5
	// 0x40000000000: 6
	// 0x2000000000000: 7
	// 0x100000000000000: 8
	// 0x7ffffffffffff
	// <= 0x7FFFFFFFFFFFFFFF

	// can do bitwise operations on this number
	if(x_value <= 0x7fffffff) {
		if(x_value <= 0x3fff) {
			if(x_value <= 0x7f) {
				let ab = Buffer.allocUnsafe(1);
				ab[0] = x_value;
				return ab;
			}
			else {
				let ab = Buffer.allocUnsafe(2);
				ab[0] = 0x80 | (x_value & 0x7f);
				ab[1] = x_value >> 7;
				return ab;
			}
		}
		else if(x_value <= 0x1fffff) {
			let ab = Buffer.allocUnsafe(3);
			ab[0] = 0x80 | (x_value & 0x7f);
			ab[1] = 0x80 | ((x_value >> 7) & 0x7f);
			ab[2] = x_value >> 14;
			return ab;
		}
		else if(x_value <= 0xfffffff) {
			let ab = Buffer.allocUnsafe(4);
			ab[0] = 0x80 | (x_value & 0x7f);
			ab[1] = 0x80 | ((x_value >> 7) & 0x7f);
			ab[2] = 0x80 | ((x_value >> 14) & 0x7f);
			ab[3] = x_value >> 21;
			return ab;
		}
		else {
			let ab = Buffer.allocUnsafe(5);
			ab[0] = 0x80 | (x_value & 0x7f);
			ab[1] = 0x80 | ((x_value >> 7) & 0x7f);
			ab[2] = 0x80 | ((x_value >> 14) & 0x7f);
			ab[3] = 0x80 | ((x_value >> 21) & 0x7f);
			ab[4] = x_value >> 28;
			return ab;
		}
	}
	// got to do some shifting
	else {
		let x_hi = Math.floor(x_value / 0x10000);
		let x_lo = x_value - 0x80000000;

		// success
		if(x_hi <= 0x7fffffff) {
			if(x_hi <= 0x3ff8) {
				if(x_hi <= 0x0f) {
					let ab = Buffer.allocUnsafe(4);
					ab[0] = 0x80 | (x_hi << 3) | (x_lo >> 28);
					ab[1] = 0x80 | ((x_lo >> 21) & 0x7f);
					ab[2] = 0x80 | ((x_lo >> 14) & 0x7f);
					ab[3] = 0x80 | ((x_lo >> 7) & 0x7f);
					ab[4] = x_lo & 0x7f;
					return ab;
				}
				else {
					debugger;
					let ab = Buffer.allocUnsafe(5);
					ab[0] = 0x80 | (x_hi & 0x7f);
					ab[1] = 0x80 | ((x_hi << 3) & 0x7f) | (x_lo >> 28);
					ab[2] = 0x80 | ((x_lo >> 21) & 0x7f);
					ab[3] = 0x80 | ((x_lo >> 14) & 0x7f);
					ab[4] = 0x80 | ((x_lo >> 7) & 0x7f);
					ab[5] = x_lo & 0x7f;
					// return ab;
				}
			}
		}
	}

	throw 'large integer encoding not yet implemented';
};

const decode_pint = (a, i) => {
	// 1 byte value
	let x = a[i];

	// first byte is end of int
	if(x < 0x80) return {v:x, i:i+1};

	// set pint value to lower value
	let x_value = x & 0x7f;


	// 2 bytes; keep going
	x = a[i+1];

	// add lower value
	x_value |= (x & 0x7f) << 7;

	// last byte of number
	if(x < 0x80) return {v:x_value, i:i+2};


	// 3 bytes; keep going
	x = a[i+2];

	// add lower value
	x_value |= (x & 0x7f) << 14;

	// last byte of number
	if(x < 0x80) return {v:x_value, i:i+3};


	// 4 bytes; keep going
	x = a[i+3];

	// add lower value
	x_value |= (x & 0x7f) << 21;

	// last byte of number
	if(x < 0x80) return {v:x_value, i:i+4};


	// 5 bytes; be cautious
	x = a[i+4];

	// safe to shift
	let x_hi = (x & 0x7f);
	if(x_hi < 0x07) {
		// add lower value
		x_value |= x_hi << 28;
	}
	// cannot shift
	else {
		// shift by means of float multiplication
		x_value += (x_hi * 0x10000000);
	}

	// last byte of number
	if(x < 0x80) return {v:x_value, i:i+5};


	// 6 bytes (or more)
	throw 'large integer decoding not yet implemented';

};


const decode_pint_frag = (a, i, n) => {
	if(n - i > 6) return decode_pint(a, i);

	if(i >= n) return false;

	// 1 byte value
	let x = a[i];

	// last byte of number
	if(x < 0x80) return {v:x, i:i+1};

	// set pint value to lower value
	let x_value = x & 0x7f;


	if(i + 1 >= n) return false;

	// 2 bytes; keep going
	x = a[i+1];

	// add lower value
	x_value |= (x & 0x7f) << 7;

	// last byte of number
	if(x < 0x80) return {v:x_value, i:i+2};


	if(i + 2 >= n) return false;

	// 3 bytes; keep going
	x = a[i+2];

	// add lower value
	x_value |= (x & 0x7f) << 14;

	// last byte of number
	if(x < 0x80) return {v:x_value, i:i+3};


	if(i + 3 >= n) return false;

	// 4 bytes; keep going
	x = a[i+3];

	// add lower value
	x_value |= (x & 0x7f) << 21;

	// last byte of number
	if(x < 0x80) return {v:x_value, i:i+4};


	if(i + 4 >= n) return false;

	// 5 bytes; be cautious
	x = a[i+4];

	// safe to shift
	let x_hi = (x & 0x7f);
	if(x_hi < 0x07) {
		// add lower value
		x_value |= x_hi << 28;
	}
	// cannot shift
	else {
		// shift by means of float multiplication
		x_value += (x_hi * 0x10000000);
	}

	// last byte of number
	if(x < 0x80) return {v:x_value, i:i+5};


	// 6 bytes (or more)
	throw 'large integer decoding not yet implemented';
};


const encode = (z_item, a_message) => {
	if('undefined' === typeof z_item) {
		debugger;
		throw 'cannot encode things of type undefined';
	}
	// null
	else if(null === z_item) {
		a_message.push(AB_NULL);
		return 1;
	}
	// number {positive int, negative int, double}
	else if('number' === typeof z_item) {
		// int
		if(Number.isInteger(z_item)) {
			// positive int
			if(z_item >= 0) {
				a_message.push(AB_PINT);
				let ab_value = encode_pint(z_item);
				a_message.push(ab_value);
				return 1 + ab_value.length;
			}
			// negative int
			else {
				a_message.push(AB_NINT);
				let ab_value = encode_pint(-z_item);
				a_message.push(ab_value);
				return 1 + ab_value.length;	
			}
		}
		// decimal (double)
		else {
			throw 'cannot encode floats... yet';
		}
	}
	// string {utf8-encoded, utf16-encoded}
	else if('string' === typeof z_item) {
		let a_oob_matches = z_item.match(/[^\u0000-\u007f]/g);
		if(a_oob_matches) {
			// number of out-of-bound characters
			let n_oobs = a_oob_matches.length;

			// estimate utf8 length (add weighted average probability of exceeding 2 bytes)
			let n_utf8_len = z_item.length + (n_oobs * 1.9395);

			// estimate utf16 length (add weighted average probability of exceeding 2 bytes)
			let n_utf16_len = (z_item.length * 2) + (n_oobs * 1.8858);

			// encode in whichever probably saves more space
			if(n_utf8_len <= n_utf16_len) {
				a_message.push(AB_UTF_8_STRING);
				ab_item = Buffer.from(z_item, 'utf-8');
			}
			else {
				a_message.push(AB_UTF_16_STRING);
				ab_item = Buffer.from(z_item, 'utf-16le');
			}
		}
		// all characters can be encoded in utf8
		else {
			a_message.push(AB_UTF_8_STRING);
			ab_item = Buffer.from(z_item, 'utf-8');
		}

		let ab_length = encode_pint(ab_item.length);
		a_message.push(ab_length);
		a_message.push(ab_item);
		return 1 + ab_length.length + ab_item.length;
	}
	// Array of serializable items
	else if(Array.isArray(z_item)) {
		a_message.push(AB_ARRAY);
		let ab_length = encode_pint(z_item.length);
		a_message.push(ab_length);
		let c_bytes = 1 + ab_length.length;
		z_item.forEach((z_sub) => {
			c_bytes += encode(z_sub, a_message);
		});
		return c_bytes;
	}
	// hash (plain object)
	else if(z_item.constructor === Object) {
		a_message.push(AB_HASH)
		let n_pairs = 0;
		for(let s_key in z_item) n_pairs++;
		let ab_size = encode_pint(n_pairs);
		a_message.push(ab_size);
		let c_bytes = 1 + ab_size.length;
		for(let s_key in z_item) {
			let w_value = z_item[s_key];
			let ab_key = Buffer.from(s_key, 'utf8');
			let ab_key_length = encode_pint(ab_key.length);
			a_message.push(ab_key_length);
			a_message.push(ab_key);
			c_bytes += ab_key_length.length + ab_key.length + encode(w_value, a_message);
		}
		return c_bytes;
	}
	// buffer
	else if(z_item instanceof Buffer) {
		a_message.push(AB_BUFFER);
		let ab_length = encode_pint(z_item.length);
		a_message.push(ab_length);
		a_message.push(Buffer.from(z_item.buffer, z_item.byteOffset, z_item.byteLength));
		return 1 + ab_length.length + z_item.byteLength;
	}
	// other...
	else {
		// typed arrays
		if(z_item instanceof Uint8Array) {
			a_message.push(AB_UINT_8_ARRAY);
		}
		else if(z_item instanceof Uint16Array) {
			a_message.push(AB_UINT_16_ARRAY);
		}
		else if(z_item instanceof Uint32Array) {
			a_message.push(AB_UINT_32_ARRAY);
		}
		else {
			throw 'invalid type to encode';
		}

		let ab_length = encode_pint(z_item.length);
		a_message.push(ab_length);
		a_message.push(Buffer.from(z_item.buffer, z_item.byteOffset, z_item.byteLength));
		return 1 + ab_length.length + z_item.byteLength;
	}
};


const decode = (a, i) => {
	let i_type = a[i++];
	switch(i_type) {
		// null
		case I_NULL: return [null, i];

		// positive int
		case I_PINT: return decode_pint(a, i);

		// negative int
		case I_NINT: {
			let h=decode_pint(a, i); let x_value=h.v; i=h.i;
			return {v:-x_value, i};
		}

		// double
		case I_DOUBLE: {
			throw 'not yet implemented';
		}

		// utf-8 string
		case I_UTF_8_STRING: {
			let h=decode_pint(a, i); let n_bytes=h.v; i=h.i;
			return {v:a.slice(i, i+n_bytes).toString('utf-8'), i:i+n_bytes};
		}

		// utf-16 string
		case I_UTF_16_STRING: {
			let h=decode_pint(a, i); let n_bytes=h.v; i=h.i;
			return {v:a.slice(i, i+n_bytes).toString('utf-16le'), i:i+n_bytes};
		}

		// hash
		case I_HASH: {
			let h_hash = {};
			let h=decode_pint(a, i); let n_pairs=h.v; i=h.i;

			for(let i_pair=0; i_pair<n_pairs; i_pair++) {
				let h1=decode_pint(a, i); let n_key_length=h1.v; i=h1.i;

				let s_key = a.slice(i, i+n_key_length).toString('utf8');
				i += n_key_length;

				let h2=decode(a, i); let w_value=h2.v; i=h2.i;

				h_hash[s_key] = w_value;
			}

			return {v:h_hash, i};
		}

		// array
		case I_ARRAY: {
			let h=decode_pint(a, i); let n_size=h.v; i=h.i;
			let a_items = new Array(n_size);

			for(let i_item=0; i_item<n_size; i_item++) {
				let h1=decode(a, i); let w_item=h1.v; i=h1.i;

				a_items[i_item] = at_item;
			}

			return {v:a_items, i};
		}

		// sorted list
		case I_SORTED_PINT_ARRAY: {
			return decode_sorted_list(a, i);
		}

		// buffer
		case I_BUFFER: {
			let h=decode_pint(a, i); let c_bytes=h.v; i=h.i;
			return {v:a.slice(i, i+c_bytes), i:i+c_bytes};
		}

		// Uint8Array
		case I_UINT_8_ARRAY: {
			let h=decode_pint(a, i); let c_bytes=h.v; i=h.i;
			return {v:new Uint8Array(a.slice(i, i+c_bytes)), i:i+c_bytes};
		}

		// otherwise
		default: {
			let h=decode_pint(a, i); let n_length=h.v; i=h.i;

			// typed array?
			let typed_array;
			if(i_type === I_UINT_16_ARRAY) typed_array = Uint16Array;
			else if(i_type === I_UINT_32_ARRAY) typed_array = Uint32Array;
			else throw 'invalid type to decode: '+i_type;

			// fetch bytes per element and compute number of bytes to read
			let n_bytes_per_element = typed_array.BYTES_PER_ELEMENT;
			let c_bytes = n_length * n_bytes_per_element;

			// prep typed arary
			let at_item;

			// take slice of buffer
			let ab_slice = a.slice(i, i+c_bytes);

			// perfect byte alignment
			if(ab_slice.byteOffset % n_bytes_per_element === 0) {
				at_item = new typed_array(ab_slice.buffer, ab_slice.byteOffset, n_length);
			}
			// bytes misaligned
			else {
				// create new ArrayBuffer
				let ab = ab_slice.buffer.slice(ab_slice.byteOffset, ab_slice.byteOffset + ab_slice.byteLength);

				// create uint32 view
				at_item = new typed_array(ab);
			}

			return {v:at_item, i:i+c_bytes};
		}
	}
};


const decode_frag = (a, i, n) => {
	while(i < n) {
		let i_type = a[i++];
		switch(i_type) {
			// null
			case I_NULL: return {v:null, i};

			// positive int
			case I_PINT: return decode_pint_frag(a, i, n);

			// negative int
			case I_NINT: {
				let h_nint = decode_pint(a, i, n);
				if(!h_nint) return false;
				let x_value=h_nint.v; i=h_nint.i;
				return {v:-x_value, i};
			}

			// double
			case I_DOUBLE: {
				throw 'not yet implemented';
			}

			// utf-8 string
			case I_UTF_8_STRING: {
				let h_utf8 = decode_pint_frag(a, i, n);
				if(!h_utf8) return false;
				let n_bytes=h_utf8.v; i=h_utf8.i;
				return {v:a.slice(i, i+n_bytes).toString('utf-8'), i:i+n_bytes};
			}

			// utf-16 string
			case I_UTF_16_STRING: {
				let h_utf16 = decode_pint_frag(a, i, n);
				if(!h_utf16) return false;
				let n_bytes=h_utf16.v; i=h_utf16.i;
				return {v:a.slice(i, i+n_bytes).toString('utf-16le'), i:i+n_bytes};
			}

			// hash
			case I_HASH: {
				let h_frag = decode_pint_frag(a, i, n);
				if(!h_frag) return false;
				let n_pairs=h_frag.v; i=h_frag.i;
				let h_hash = {};

				for(let i_pair=0; i_pair<n_pairs; i_pair++) {
					let h_key_frag = decode_pint_frag(a, i, n);
					if(!h_key_frag) return false;
					let n_key_length=h_key_frag.v; i=h_key_frag.i;

					let s_key = a.slice(i, i+n_key_length).toString('utf8');
					i += n_key_length;

					let h_value_frag = decode_frag(a, i, n);
					if(!h_value_frag) return false;
					let w_value=h_value_frag.v; i=h_value_frag.i;

					h_hash[s_key] = w_value;
				}

				return {v:h_hash, i};
			}

			// array
			case I_ARRAY: {
				let h_frag = decode_pint_frag(a, i, n);
				if(!h_frag) return false;
				let n_size=h_frag.v; i=h_frag.i;

				let a_items = [];

				for(let i_item=0; i_item<n_size; i_item++) {
					let h_item_frag = decode_frag(a, i, n);
					if(!h_item_frag) return false;
					let at_item=h_item_frag.v; i=h_item_frag.i;

					a_items.push(at_item);
				}

				return {v:a_items, i};
			}

			// sorted list
			case I_SORTED_PINT_ARRAY: {
				return decode_sorted_list_frag(a, i, n);
			}

			// buffer
			case I_BUFFER: {
				let h_frag = decode_pint_frag(a, i, n);
				if(!h_frag) return false;
				let c_bytes=h_frag.v; i=h_frag.i;
				if(i + c_bytes > n) return false;

				return {v:a.slice(i, i+c_bytes), i:i+c_bytes};
			}

			// Uint8Array
			case I_UINT_8_ARRAY: {
				let h_frag = decode_pint_frag(a, i, n);
				if(!h_frag) return false;
				let c_bytes=h_frag.v; i=h_frag.i;
				if(i + c_bytes > n) return false;

				return {v:new Uint8Array(a.slice(i, i+c_bytes)), i:i+c_bytes};
			}

			// otherwise
			default: {
				let h_length_frag = decode_pint_frag(a, i, n);
				if(!h_length_frag) return false;
				let n_length=h_length_frag.v; i=h_length_frag.i;

				// typed array?
				let typed_array;
				if(i_type === I_UINT_16_ARRAY) typed_array = Uint16Array;
				else if(i_type === I_UINT_32_ARRAY) typed_array = Uint32Array;
				else throw 'invalid type to decode: '+i_type;

				// fetch bytes per element and compute number of bytes to read
				let n_bytes_per_element = typed_array.BYTES_PER_ELEMENT;
				let c_bytes = n_length * n_bytes_per_element;

				// ran out of btyes
				if(i + c_bytes > n) return false;

				// prep typed arary
				let at_item;

				// take slice of buffer
				let ab_slice = a.slice(i, i+c_bytes);

				// perfect byte alignment
				if(ab_slice.byteOffset % n_bytes_per_element === 0) {
					at_item = new typed_array(ab_slice.buffer, ab_slice.byteOffset, n_length);
				}
				// bytes misaligned
				else {
					// create new ArrayBuffer
					let ab = ab_slice.buffer.slice(ab_slice.byteOffset, ab_slice.byteOffset + ab_slice.byteLength);

					// create uint32 view
					at_item = new typed_array(ab);
				}

				return {v:at_item, i:i+c_bytes};
			}
		}

		break;
	}
};







const H_CUSTOM_ENCODER = {
	encode: encode,
	encode_pint: encode_pint,
};


class Outgoing extends stream.Readable {
	constructor(ab_message=null, h_opt={}) {
		super(h_opt.stream || {});
		Object.assign(this, {
			message: null,
			queue: [],
			closed: false,
			encoders: [],
		});
		if(ab_message instanceof Buffer) {
			this.message = ab_message;
		}
	}

	// when this is piped, close data
	pipe(...a_args) {
		this.closed = true;
		super.pipe(...a_args);
	}

	_read() {
		// initialized with buffer; message mode
		if(this.message) {
			this.push(this.message);
			this.message = null;
			this.push(null);
			return;
		}

		// consume items off the queue
		let a_items = this.queue;
		let i_item = 0;
		let n_items = a_items.length;

		// until its finished processing the queue
		while(i_item !== n_items) {
			// take item
			let [w_item, z_type, ...a_args] = a_items[i_item++];
			
// debugger;

			// encode parts
			let a_parts = [];
			let c_bytes;

			// encoder type defined
			if(z_type) {
				// standard encoder type
				if('string' === typeof z_type) {
					c_bytes = H_ENCODERS[z_type](w_item, a_parts, ...a_args);
				}
				// custom encoder type
				else if('number' === typeof z_type) {
					c_bytes = this.encoders[z_type].apply(H_CUSTOM_ENCODER, [w_item, a_parts, ...a_args]);
				}
				else {
					throw 'invalid encoder type specification';
				}
			}
			else {
				c_bytes = encode(w_item, a_parts);
			}

			// merge buffers
			let ab_chunk = Buffer.allocUnsafe(c_bytes);
			let n_parts = a_parts.length;
			let i_write = 0;
			for(let i_part=0; i_part<n_parts; i_part++) {
				let ab_part = a_parts[i_part];
				ab_part.copy(ab_chunk, i_write);
				i_write += ab_part.length;
			}

			let s_bytes;
			if(c_bytes > 1024) {
				if(c_bytes > 1024 * 1024) {
					s_bytes = (c_bytes / 1024 / 1024).toFixed(2)+' MiB';
				}
				else {
					s_bytes = (c_bytes / 1024).toFixed(2)+' KiB';
				}
			}
			else {
				s_bytes = c_bytes+' B';
			}
			// console.log('\nwrote '+s_bytes+' ('+(w_item === null? 'null': w_item.constructor.name)+')');

			// push chunk; break if need to halt
			if(this.push(ab_chunk)) break;
		}

		// adjust queue
		a_items = this.queue = a_items.slice(i_item);

		// outgoing is closed and queue is empty
		if(this.closed && !a_items.length) this.push(null);
	}

	// push items to the queue
	add(w_item, s_type, ...a_args) {
		if(this.closed) throw 'outgoing bus was already closed';
		this.queue.push([w_item, s_type || null, ...a_args]);
	}

	// close stream
	end() {
		this.closed = true;
	}

	// define an encoder
	define(f_encoder) {
		return this.encoders.push(f_encoder);
	}
}

class Collector extends stream.Writable {
	constructor(z_receiever, i_consumer, h_stream_opt={}) {
		super(h_stream_opt);
		Object.assign(this, {
			index: i_consumer,
			store: Buffer.from([]),
		});

		this.on('finish', () => {
			this.process();
		});

		if(z_receiever) {
			if('function' === typeof z_receiever) {
				this.on('receive', z_receiever);
			}
			else if(z_receiever.receive) {
				this.on('receive', (...a_args) => {
					z_receiever.receive(...a_args);
				});
			}
		}
	}

	process() {
		let a = this.store;
		let a_results = [];
		if(!a.length) throw 'no data was consumed on incoming before finish was called';
		let {v:w_result, i} = decode(a, 0);
		a_results.push(w_result);
		let n = a.length;
		while(i < n) {
			let h=decode(a, i); let w_result=h.v; i=h.i;
			a_results.push(w_result);
		}
		let b_heard = this.emit.apply(this, ['receive', ...a_results]);
	}

	put(ab_store) {
		this.store = ab_store;
		this.process();
	}

	_write(ab_chunk, s_encoding, fk_chunk) {
		this.store = Buffer.concat([this.store, ab_chunk], this.store.length + ab_chunk.length);
		fk_chunk();
	}
}


class Incoming extends stream.Writable {
	constructor(z_receiever, i_consumer, h_stream_opt={}) {
		super(h_stream_opt);
		Object.assign(this, {
			index: i_consumer,
			item: 0,
			pre: Buffer.from([]),
			store: Buffer.from([]),
		});

		if(z_receiever) {
			if('function' === typeof z_receiever) {
				this.on('item', z_receiever);
			}
			else {
				throw 'invalid consumer';
			}
		}
	}

	_write(ab_chunk, s_encoding, fk_chunk) {
		let n = this.pre.length + ab_chunk.length;
		let a = Buffer.concat([this.pre, ab_chunk], n);
		let i = 0;
		let w_item;
		for(;;) {
			let i_prior = i;
			let h_frag = decode_frag(a, i, n);
			if(!h_frag) break;
			let w_item=h_frag.v; i=h_frag.i;
			this.emit('item', w_item, this.item++, i - i_prior);
		}
		this.pre = a.slice(i);
		fk_chunk();
	}
}


class Multiplx extends events {
	constructor(h_config={}) {
		super();
		Object.assign(this, {
			results: [],
			channels: h_config.channels || Infinity,
			ordered: h_config.ordered || false,
			consumer_count: 0,
			receiver_index: 0,
			_producers: function() {
				throw 'no data to multiplex';
			},
		});

		// consumer generator
		this._consumers = (function*() {
			if(Number.isFinite(this.channels)) {
				let n_channels = this.channels;
				for(let i_consumer=0; i_consumer<n_channels; i_consumer++) {
					yield new Incoming(this, i_consumer);
				}
			}
			else {
				for(;;) {
					yield new Incoming(this, i_consumer++);
				}
			}
		}).apply(this);
	}

	// when an incoming message is fully received
	receive(...a_results) {
		let i_consumer = a_results.pop();
		let a_super_results = this.results;

		// results are ordered
		if(this.ordered) {
			// result can be unloaded immediately
			if(i_consumer === this.receiver_index) {
				// while there are results to unload
				do {
					// emit receive event
					this.emit.apply(this, ['receive', ...a_results, i_consumer]);

					// clear result (even if we aren't storing it)
					delete a_super_results[this.receiver_index];

					// advance receiever index and fetch its value
					a_results = a_super_results[++this.receiver_index];
				} while('undefined' !== typeof a_super_results[this.receiver_index]);
			}
			// result needs to be saved
			else {
				// emit queued event
				this.emit.apply(this, ['queued', ...a_results, i_consumer]);

				// store result until its ready
				a_super_results[i_consumer] = a_results;
			}
		}
		// not serial
		else {
			this.emit.apply(this, ['receive', ...a_results, i_consumer]);
		}
	}

	// user wants to divide an array amongst the channels
	divide(h_opt) {
		throw 'implementation not up-to-date';
		let {
			array: a_items,
			multiple: n_multiple=null,
			ammend: ab_ammend,
		} = h_opt;
		if(!Array.isArray(a_items)) throw new TypeError(`Multiplex#divide() expects an Array for value at key 'array'`);
		// create outgoing generator
		this._producers = (function*() {
			// track index of current item to send
			let i_message_item_start = 0;

			// how many whole elements to send to each channel
			let n_chunk_length = Math.ceil(a_items.length / this.channels);

			// coerce to an ideal multiple
			if(n_multiple && (n_chunk_length % n_multiple !== 0)) {
				n_chunk_length = Math.ceil(n_chunk_length / n_multiple) * n_multiple;
			}

			// each channel
			for(let i_channel=0; i_channel<this.channels; i_channel++) {
				// number of items remaining
				let n_items_remaining = a_items.length - i_message_item_start;

				// number of items to send this channel
				let n_items = Math.min(n_chunk_length, n_items_remaining);

				// count message byte length without creating (too much) extra memory if possible
				let b_predict = true;
				let ab_length = encode_pint(n_items);
				let c_bytes = 1 + ab_length.length;

				// at least store the vbytes
				let a_pints = [];

				// each item
				for(let i_item=i_message_item_start; i_item<(i_message_item_start+n_items); i_item++) {
					let w_item = a_items[i_item];

					// typed array (fixed & predictable length)
					if(w_item instanceof Uint8Array || w_item instanceof Uint16Array || w_item instanceof Uint32Array) {
						let ab_item_length = encode_pint(w_item.length);
						a_pints.push(ab_item_length);
						c_bytes += 1 + ab_item_length.length + (w_item.length * w_item.BYTES_PER_ELEMENT);
					}
					// don't bother with anything else
					else {
						b_predict = false;
						a_pints.length = 0;
						c_bytes = 0;
						break;
					}
				}
				
				// for iterating the messages (again)
				let i_item = i_message_item_start;

				// for storing message result
				let ab_message;

				// we were able to precompute message length
				if(b_predict) {
					// add ammended message
					if(ab_ammend) c_bytes += ab_ammend.length;

					// allocate buffer
					ab_message = Buffer.allocUnsafe(c_bytes);

					// header
					ab_message[0] = I_ARRAY;
					ab_message.set(ab_length, 1);

					// index: message buffer write
					let i_write = ab_length.length + 1;

					let i_pint = 0;

					// each item (again)
					while(i_item < i_message_item_start + n_items) {
						let at_item = a_items[i_item];

						// only typed arrays make it here; encode the item header & length
						let ab_type = (at_item instanceof Uint8Array
								? AB_UINT_8_ARRAY
								: (at_item instanceof Uint16Array
									? AB_UINT_16_ARRAY
									: (at_item instanceof Uint32Array
										? AB_UINT_32_ARRAY
										: AB_FLOAT_64_ARRAY)));
						ab_message[i_write++] = ab_type[0];
						let ab_item_length = a_pints[i_pint++];
						ab_message.set(ab_item_length, i_write);
						i_write += ab_item_length.length;

						// item contents
						ab_message.set(Buffer.from(at_item.buffer, at_item.byteOffset, at_item.byteLength), i_write);
						i_write += at_item.byteLength;

						// advance item index
						i_item += 1;
					}

					// make ammendments
					if(ab_ammend) {
						ab_message.set(ab_ammend, i_write);
						i_write += ab_ammend.length;
					}
				}
				// unable to count in efficient manner
				else {
					let a_message = [];

					// only build the outer array header
					a_message.push(AB_ARRAY);
					a_message.push(ab_length);
					c_bytes = 1 + ab_length.length;

					// encode all contents
					let i_item = i_message_item_start;
					while(i_item < i_message_item_start + n_items) {
						let w_item = a_items[i_item];

						// encode item and count number of bytes needed
						c_bytes += encode(w_item, a_message);

						// advance item index
						i_item += 1;
					}

					// add ammended message
					if(ab_ammend) c_bytes += ab_ammend.length;

					// generate actual message
					ab_message = Buffer.allocUnsafe(c_bytes);
					let i_write = 0;
					let n_parts = a_message.length;
					for(let i_part=0; i_part<n_parts; i_part++) {
						let ab_part = a_message[i_part];
						ab_message.set(ab_part, i_write);
						i_write += ab_part.length;
					}

					// make ammendments
					if(ab_ammend) {
						ab_message.set(ab_ammend, i_write);
						i_write += ab_ammend.length;
					}
				}

				// update item index
				i_message_item_start = i_item;
debugger;
				// the message
				yield new Outgoing(ab_message);
			}
		}).apply(this);

		// chain
		return this;
	}

	// acquire an incoming handler
	incoming() {
		return this._consumers.next().value;
	}

	// acquire an outgoing handler
	outgoing() {
		return this._producers.next().value;
	}
}


module.exports = Object.assign({
	// new incoming instance
	incoming(...a_args) {
		return new Incoming(...a_args);
	},

	// 
	collector(...a_args) {
		return new Collector(...a_args);
	},

	// decode data all at once, synchronously
	decode(ab_data) {
		let a_results = [];
		if(!ab_data.length) throw 'no data was consumed on incoming before finish was called';
		let {v:w_result, i} = decode(ab_data, 0);
		a_results.push(w_result);
		let n = ab_data.length;
		while(i < n) {
			let h=decode(ab_data, i); let w_result=h.v; i=h.i;
			a_results.push(w_result);
		}

		return a_results;
	},

	// 
	// stats(...a_args) {
	// 	return new Stats(...a_args);
	// },

	// new outgoing instance
	outgoing(...a_args) {
		return new Outgoing(...a_args);
	},

	// multiplex
	multiplex(...a_args) {
		return new Multiplx(...a_args);
	},

	// encode data
	encode(...a_items) {
		let n_items = a_items.length;
		let a_parts = [];
		let c_bytes = 0;
		for(let i_item=0; i_item<n_items; i_item++) {
			c_bytes += encode(a_items[i_item], a_parts);
		}

		let ab_message = Buffer.allocUnsafe(c_bytes);
		let i_write = 0;
		let n_parts = a_parts.length;
		for(let i_part=0; i_part<n_parts; i_part++) {
			let ab_part = a_parts[i_part];
			ab_message.set(ab_part, i_write);
			i_write += ab_part.length;
		}
		return ab_message;
	},

	encode_pint,
	decode_pint,
	encode_sorted_list,
	decode_sorted_list,
	encode_huffman,
}, H_TYPES);
