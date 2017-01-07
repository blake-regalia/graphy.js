/* eslint-disable */

@ // import linker macros
@include 'linked.builder-js'

@{constants()}

const B_IS_BROWSER = ('browser' === process.title);

const AB_ZERO = B_IS_BROWSER? [0]: Buffer.from([0]);

const D_UTF_8_TEXT_ENCODER = B_IS_BROWSER? new TextEncoder('utf-8'): null;
const D_UTF_16LE_TEXT_ENCODER = B_IS_BROWSER? new TextEncoder('utf-16le'): null;

const encode_utf_8 = B_IS_BROWSER
	? (s_chunk) => {
		return D_UTF_8_TEXT_ENCODER.encode(s_chunk);
	}
	: (s_chunk) => {
		return Buffer.from(s_chunk, 'utf-8');
	};

const encode_utf_16 = B_IS_BROWSER
	? (s_chunk) => {
		let ab_chunk = D_UTF_16LE_TEXT_ENCODER.encode(s_chunk);
		let ab_encoded = new Uint8Array(ab_chunk.length + 1);
		ab_encoded.set(ab_chunk, 1);
		return ab_encoded;
	}
	: (s_chunk) => {
		let ab_chunk = Buffer.from(s_chunk, 'utf-16le');
		return Buffer.concat([AB_ZERO, ab_chunk], ab_chunk.length + 1);
	};


const D_UTF_8_TEXT_DECODER = B_IS_BROWSER? new TextDecoder('utf-8'): null;
const D_UTF_16LE_TEXT_DECODER = B_IS_BROWSER? new TextDecoder('utf-16le'): null;

const decode_utf_8 = B_IS_BROWSER
	? (ab_chunk) => {
		return D_UTF_8_TEXT_DECODER.decode(ab_chunk);
	}
	: (ab_chunk) => {
		return Buffer.from(ab_chunk).toString('utf-8');
	};

const decode_utf_16le = B_IS_BROWSER
	? (ab_chunk) => {
		return D_UTF_16LE_TEXT_DECODER.decode(ab_chunk);
	}
	: (ab_chunk) => {
		return Buffer.from(ab_chunk).toString('utf-16le');
	};

const join_buffers = B_IS_BROWSER
	? (ab_a, ab_b) => {
		let ab_join = new Uint8Array(ab_a.length + ab_b.length);
		ab_join.set(ab_a);
		ab_join.set(ab_b, ab_a.length);
		return ab_join;
	}
	: (ab_a, ab_b) => {
		return Buffer.concat([Buffer.from(ab_a), ab_b], ab_a.length + ab_b.length);
	};


@macro mk_ref(kind)
	// allocate array of indicies for @{kind}s' dictionary fragment
	let n_bytes_dict_@{kind} = a_dict_@{kind}.length;

	// store psuedo-element at end of ref to encode its word length by adding +1 to c_words_@{kind}
	let a_ref_@{kind} = @{mk_uint_array('c_words_'+kind+' + 1', 'n_bytes_dict_'+kind)};

	// fill array
	i_index = 0; i_item = -1;
	do {
		a_ref_@{kind}[i_index++] = ++i_item;
		i_item = a_dict_@{kind}.indexOf(0, i_item+1);
	} while(i_item > 0);

	// store to instance
	this.ref_@{kind} = a_ref_@{kind};
@end


@macro mk_idx(kind, size, range)
	// allocate array of indicies for @{kind}s' triples fragment
	let a_idx_@{kind} = @{mk_uint_array(size+' + 1', range)};

	// fill array
	i_index = 0; i_item = -1;
	do {
		a_idx_@{kind}[i_index++] = (++i_item);
		i_item = a_data_@{kind}.indexOf(0, i_item);
	} while(i_index < @{size});

	// store to instance
	this.idx_@{kind} = a_idx_@{kind};
@end


@macro produce_node(kind, offset, index)
	// ref dict
	let a_dict_@{kind} = this.dict_@{kind};

	// find dict indexes
	let i_key_@{kind} = @{'p' == kind? 'i_predicate': index} @{offset? offset: ''};
	@{'p' == kind? 'let ': ''}i_start = this.ref_@{kind}[i_key_@{kind} - 1];
	@{'p' == kind? 'let ': ''}i_stop = this.ref_@{kind}[i_key_@{kind}];

	// ref 0th char
	let x_char = a_dict_@{kind}[i_start];

	@if 'p' != kind
		// blank node
		if(3 === x_char) {
			return graphy.blankNode(decode_utf_8(a_dict_@{kind}.slice(i_start+1, i_stop)));
		}
	@end
	// absolute iri
	@{'p' == kind? '': 'else '}if(2 === x_char) {
		return graphy.namedNode(decode_utf_8(a_dict_@{kind}.slice(i_start+1, i_stop)));
	}
	// prefixed name
	else {
		// decompose prefixed name's word from dictionary
		let [s_prefix_id, s_suffix] = decode_utf_8(a_dict_@{kind}.slice(i_start, i_stop)).split('\u0001');

		// produce named node from reconstructed iri
		return graphy.namedNode(this.prefixes[s_prefix_id]+s_suffix);
	}
@end



@macro dict_find(which, then)
	// dict index for @{which}
	let i_dict_@{which} = 0;

	// ref
	let a_ref_@{which} = k_graph.ref_@{which};

	// find an entry with the right length first
	let n_ref_@{which} = a_ref_@{which}.length;
	for(let c_item_@{which}=1; c_item_@{which}<n_ref_@{which}; c_item_@{which}++) {
		// ref index
		let i_dict_@{which}_next = a_ref_@{which}[c_item_@{which}]

		// item indexed by c_item_@{which} has matching length
		if(n_word === i_dict_@{which}_next - i_dict_@{which}) {
			// comparison
			let i_char = 0;
			while(i_char < n_word) {
				if(a_dict_@{which}[i_dict_@{which} + i_char] !== a_word[i_char++]) break;
			}

			// found it
			if(i_char === n_word) {
				@if then
					@{then}
					@{dict_else(which)}
				@end
@end


@macro fc_dict_find(which, then)
	// dict index for @{which}
	let i_dict_@{which} = 0;

	// block refs and lengths of each entry
	let a_ref_@{which} = k_graph.ref_@{which};
	let a_len_@{which} = k_graph.len_@{which};

	// block index
	let i_block = -1;

	// index preceeding test word
	let i_test_word = -1;

	// word (to persist across length finds)
	let a_test_word;

	// position of last entry
	let i_entry_end_pos = -1;

	// find an entry with the right length first
	let n_lens_@{which} = a_len_@{which}.length;
	for(let i_item_@{which}=0; i_item_@{which}<n_lens_@{which}; i_item_@{which}++) {
		// item indexed by c_item_@{which} has matching length
		if(n_word === a_len_@{which}[i_item_@{which}]) {
			// compute block index
			let i_block_here = i_item_@{which} >>> 4;

			// different block than test word
			if(i_block_here !== i_block) {
				// update block
				i_block = i_block_here;

				// compute word index from block index
				i_test_word = i_block << 4;

				// set dict pointer index by resolving block from ref
				i_dict_@{which} = a_ref_@{which}[i_block];

				// find first entry's end
				i_entry_end_pos = i_dict_@{which} + a_len_@{which}[i_test_word];

				// grab first word
				a_test_word = a_dict_@{which}.slice(i_dict_@{which}, i_entry_end_pos);
			}

			// while we are not at the target item
			for(let i_interim=i_test_word+1; i_interim<=i_item_@{which}; i_interim++) {
				// begin scanning at end of prev word
				i_dict_@{which} = i_entry_end_pos;

				// vbyte number of characters to reuse
				let x_share = 0;

				// number of bytes consumed for vbyte
				let c_b = 0;
				while(true) {
					// byte value
					let x = a_dict_@{which}[i_dict_@{which}++];

					// add lower value
					x_share |= (x & 0x7f) << (7 * c_b++);

					// last byte of number
					if(x & 0x80) break;
				}

				let n_word_len = a_len_@{which}[i_interim];

				// find entry's end
				i_entry_end_pos = i_dict_@{which} + n_word_len - x_share;

				// compile new word
				let a_new_test_word = new Uint8Array(n_word_len);
				a_new_test_word.set(a_test_word.slice(0, x_share));
				a_new_test_word.set(a_dict_@{which}.slice(i_dict_@{which}, i_entry_end_pos), x_share);
				a_test_word = a_new_test_word;
			}

			// update test word index
			i_test_word = i_item_@{which};

			// comparison
			let i_char = 0;
			while(i_char < n_word) {
				if(a_test_word[i_char] !== a_word[i_char++]) break;
			}

			// found it
			if(i_char === n_word) {
				let c_item_@{which} = i_item_@{which};
				@if then
					@{then}
					@{fc_dict_else(which)}
				@end
@end


@macro fc_dict_else(which)
			}
		}
	}
@end

@macro dict_else(which)
			}
		}

		// update index
		i_dict_@{which} = i_dict_@{which}_next;
	}
@end


@macro compress_iri()
	// attempt to compress
	let m_compress = R_COMPRESS.exec(p_iri);

	// cannot be compressed
	if(!m_compress) {
		// use iriref
		s_word = '\u0002'+p_iri;
	}
	// try finding compressed prefix id
	else {
		// lookup prefix id from prefix lookup
		let s_prefix_id = k_graph.prefix_lookup[m_compress[1]];

		// prefix not exists
		if(!s_prefix_id) {
			// no such node
			s_word = '';
		}
		// found the prefix
		else {
			// construct word using prefix
			s_word = s_prefix_id+'\u0001'+m_compress[2];
		}
	}
@end


@macro compress_n3_node(fail_return_value)
	// iriref
	if('<' === s_n3[0]) {
		// construct iri
		let p_iri = s_n3.slice(1, -1);

		@{compress_iri()}
	}
	// prefixed name
	else {
		// extract prefix / suffix
		let [s_user_prefix, s_suffix] = s_n3.split(':');

		// lookup dict prefix from mapped user prefix
		let s_prefix_id = k_graph.user_prefixes[s_user_prefix];

		// prefix mapping does not exist
		if(!s_prefix_id) {
			// grab user prefix iri
			let p_prefix_iri = k_graph.user_prefix_iris[s_user_prefix];

			// no such user prefix defined
			if(!p_prefix_iri) {
				throw `no such prefix "${s_user_prefix}"`;
			}

			// reconstruct full iri
			let p_iri = p_prefix_iri+s_suffix;

			@{compress_iri()}
		}
		// prefix mapping does exist
		else {
			// construct word using prefix
			s_word = s_prefix_id+'\u0001'+s_suffix;
		}
	}

	// no such node
	if(!s_word) return @{fail_return_value? fail_return_value: 'new Void(k_graph, k_context)'};
@end


@macro abc(a, b, c)
	let a_data_ab = k_graph.data_@{a}@{b};
	let a_data_a_bc = k_graph.data_@{a}_@{b}@{c};
	let a_idx_ab = k_graph.idx_@{a}@{b};
	let a_idx_a_bc = k_graph.idx_@{a}_@{b}@{c};
	let n_a = @{count(a)};
@end

@macro each_a()
	for(let i_test_a=1; i_test_a<=n_a; i_test_a++) {
@end

@macro find_ab(what)
	// search ab's adjacency list for predicate
	let c_offset_ab = -1;
	let i_data_ab_start = a_idx_ab[i_test_a - 1];
	let i_data_ab_lo = i_data_ab_start;
	let i_data_ab_hi = a_idx_ab[i_test_a] - 1;
	let n_range = i_data_ab_hi - i_data_ab_lo;

	// debugger;
	find_@{what}:
	do {
		let i_test_b;
		let c_offset_ab;

		let i_lo = a_data_ab[i_data_ab_lo];
		let i_hi = a_data_ab[i_data_ab_hi];
		k_graph;

		do {
			let i_data_ab_test = Math.floor(i_data_ab_lo + ((@{what} - i_lo) / (i_hi - i_lo)) * n_range);
			i_test_b = a_data_ab[i_data_ab_test];
			// miss
			if(i_test_b !== @{what}) {
				// too high
				if(i_test_b > @{what}) {
					i_hi = i_test_b;
					i_data_ab_hi = i_data_ab_test - 1;
				}
				// too low
				else {
					i_lo = i_test_b;
					i_data_ab_lo = i_data_ab_test + 1;
				}
				// recompute range
				n_range = i_data_ab_hi - i_data_ab_lo;
			}
			// hit!
			else {
				c_offset_ab = i_data_ab_test - i_data_ab_start;
				break;
			}
		} while(true);

		@ // then...
@end

@macro end_find()
	} while(false);
@end


@macro each_ab_traditional()
	// search ab's adjacency list for predicate
	let c_offset_ab = -1;
	let i_data_ab_start = a_idx_ab[i_test_a - 1];

	// each object pointed to in a's adjacency list
	while(true) {
		// pull up b's id
		let i_test_b = a_data_ab[i_data_ab_start + (++c_offset_ab)];

		// reach data ab end-of-adjacency list; break loop
		if(!i_test_b) break;

		@ // otherwise...
@end


@macro each_ab(test)
	// search ab's adjacency list for predicate
	let c_offset_ab = 0;
	let i_data_ab_start = a_idx_ab[i_test_a - 1];
	// let c_offset_ab_end = a_idx_ab[i_test_a] - i_data_ab_start;
	let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
	let c_offset_ab_end = a_idx_x_bc.length - 1;

	// each predicate in subject's ab adjacency list
	do {
		// pull up b's id
		let i_test_b = a_data_ab[i_data_ab_start + c_offset_ab];

		@ // otherwise...
		@set close_each_ab '} while(++c_offset_ab !== c_offset_ab_end);'
@end

@macro each_abc_traditional()
	// pull up c's data index
	let i_data_a_bc = a_idx_a_bc[i_test_a - 1][c_offset_ab];

	// each object pointed to by predicate
	while(true) {
		// pull up c's id
		let i_test_c = a_data_a_bc[i_data_a_bc++];

		// reach data c end-of-adjacency list; break loop
		if(!i_test_c) break;

		@ // otherwise...
@end

@macro each_abc()
	// pull up c's data index
	let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
	let i_data_a_bc = a_idx_x_bc[c_offset_ab];
	let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];

	// each object pointed to by predicate
	do {
		// pull up c's id
		let i_test_c = a_data_a_bc[i_data_a_bc];

		@ // otherwise...
		@set close_each_abc '} while(++i_data_a_bc !== i_data_a_bc_end);'
@end


@macro find_abc(what)
	// search a_bc's adjacency list for predicate
	let c_offset_data_a_bc = -1;
	let a_idx_a_b = a_idx_a_bc[i_test_a - 1];
	let i_data_a_bc_start = a_idx_a_b[c_offset_ab];
	let i_data_a_bc_lo = i_data_a_bc_start;
	let i_data_a_bc_hi = (a_idx_a_b.length - 1) === c_offset_ab? a_idx_a_bc[i_test_a] - 1: a_idx_a_b[c_offset_ab + 1] - 1;
	let n_range = i_data_a_bc_hi - i_data_a_bc_lo;

	// debugger;
	find_@{what}:
	do {
		let i_lo = a_data_a_bc[i_data_a_bc_lo];
		let i_hi = a_data_a_bc[i_data_a_bc_hi];
debugger;
		do {
			let i_data_a_bc_test = Math.floor(i_data_a_bc_lo + ((@{what} - i_lo) / (i_hi - i_lo)) * n_range);
			i_test_c = a_data_a_bc[i_data_a_bc_test];
			// miss
			if(i_test_c !== @{what}) {
				// too high
				if(i_test_c > @{what}) {
					i_hi = i_test_c;
					i_data_a_bc_hi = i_data_a_bc_test - 1;
				}
				// too low
				else {
					i_lo = i_test_c;
					i_data_a_bc_lo = i_data_a_bc_test + 1;
				}
				// recompute range
				n_range = i_data_a_bc_hi - i_data_a_bc_lo;
			}
			// hit!
			else {
				c_offset_data_a_bc = i_data_a_bc_test - i_data_a_bc_start;
				break;
			}
		} while(true);

	@ // then...
@end



@macro each_s()
	let n_s = k_graph.count_d + k_graph.count_s;
	for(let i_test_s=1; i_test_s<=n_s; i_test_s++) {
@end

@macro each_sp()
	// search sp's adjacency list for predicate
	let c_offset_data_sp = -1;
	let i_data_sp_start = k_graph.idx_sp[i_test_s - 1];

	// each predicate in subject's sp adjacency list
	while(true) {
		// pull up predicate's id
		let i_test_p = k_graph.data_sp[i_data_sp_start + (++c_offset_data_sp)];

		// reached end of adjacency list
		if(!i_test_p) break;

		@ // otherwise...
@end

@macro each_spo()
	// pull up object's data index
	let i_data_s_po = k_graph.idx_s_po[i_test_s - 1][c_offset_data_sp];

	// each object pointed to by predicate
	while(true) {
		// pull up object's id
		let i_test_o = k_graph.data_s_po[i_data_s_po++];

		// reach data object end-of-adjacency list; break loop
		if(!i_test_o) break;

		@ // otherwise...
@end


@macro each_p()
	let n_p = k_graph.count_p;
	for(let i_test_p=1; i_test_p<=n_p; i_test_p++) {
@end

@macro each_po()
	// search po's adjacency list for predicate
	let c_offset_data_po = -1;
	let i_data_po_start = k_graph.idx_po[i_test_p - 1];

	// each object in po's adjacency list
	while(true) {
		// pull up object's id
		let i_test_o = k_graph.data_po[i_data_po_start + (++c_offset_data_po)];

		// reached end of adjacency list
		if(!i_test_o) break;

		@ // otherwise...
@end

@macro each_pos()
	// pull up subject's data index
	let i_data_p_os = k_graph.idx_p_os[i_test_p - 1][c_offset_data_po];

	// each object pointed to by predicate
	while(true) {
		// pull up subject's id
		let i_test_s = k_graph.data_p_os[i_data_p_os++];

		// reach data subject end-of-adjacency list; break loop
		if(!i_test_s) break;

		@ // otherwise...
@end


@macro each_o()
	let n_o = k_graph.count_d + k_graph.count_o + k_graph.count_l;
	for(let i_test_o=1; i_test_o<=n_o; i_test_o++) {
@end

@macro each_os()
	// search os's adjacency list for object
	let c_offset_data_os = -1;
	let i_data_os_start = k_graph.idx_os[i_test_o - 1];

	// each subject in os's adjacency list
	while(true) {
		// pull up subject's id
		let i_test_s = k_graph.data_os[i_data_os_start + (++c_offset_data_os)];

		// reached end of adjacency list
		if(!i_test_s) break;

		@ // otherwise...
@end

@macro each_osp()
	// pull up predicates's data index
	let i_data_o_sp = k_graph.idx_o_sp[i_test_o - 1][c_offset_data_os];

	// each subject pointed to by object
	while(true) {
		// pull up predicates's id
		let i_test_p = k_graph.data_o_sp[i_data_o_sp++];

		// reach data predicate's end-of-adjacency list; break loop
		if(!i_test_p) break;

		@ // otherwise...
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
	@if close_each_abc
		@{close_each_abc}
		@set close_each_abc null
	@elseif close_each_ab
		@{close_each_ab}
		@set close_each_ab null
	@else
		}
	@end
@end


@macro count(what)
	@if what == 's'
		k_graph.count_d + k_graph.count_s
	@elseif what == 'p'
		k_graph.count_p
	@elseif what == 'o'
		k_graph.count_d + k_graph.count_o + k_graph.count_l
	@end
@end

@macro mk_data(a, b, c)
	console.time('@{a}@{b}@{c}');
	let k_graph = this;

	let a_groups_@{a}_@{b}@{c} = [];

	// refs
	let a_idx_@{c}@{a} = k_graph.idx_@{c}@{a};
	let a_data_@{c}@{a} = k_graph.data_@{c}@{a};
	let a_idx_@{c}_@{a}@{b} = k_graph.idx_@{c}_@{a}@{b};
	let a_data_@{c}_@{a}@{b} = k_graph.data_@{c}_@{a}@{b};

	// count the size needed to store @{a}@{b}
	let c_data_ab_size = 0;
	let n_@{c} = @{count(c)}
	for(let i_test_@{c}=1; i_test_@{c}<=n_@{c}; i_test_@{c}++) {

		// ref @{c}'s index group
		let a_idx_x_@{a}@{b} = a_idx_@{c}_@{a}@{b}[i_test_@{c} - 1];

		// @{c}@{a}'s adjacency list counter
		let c_offset_@{c}@{a} = 0;

		// @{c}@{a}'s upper limit to adjacency list counter
		let c_offset_end_@{c}@{a} = a_idx_x_@{a}@{b}.length - 1;

		// index: starting data position for this @{c}
		let i_data_start_@{c}@{a} = a_idx_@{c}@{a}[i_test_@{c} - 1];

		// each value in key's @{c}@{a} adjacency list
		do {
			// pull up target's id
			let i_test_@{a} = a_data_@{c}@{a}[i_data_start_@{c}@{a} + c_offset_@{c}@{a}];

			// ref/create x_@{b}@{c}
			let h_groups_x_@{b}@{c} = a_groups_@{a}_@{b}@{c}[i_test_@{a}];
			if(!h_groups_x_@{b}@{c}) {
				// sparse arrays use a little less memory than objects w/ integer keys (stored as strings)
				h_groups_x_@{b}@{c} = a_groups_@{a}_@{b}@{c}[i_test_@{a}] = [];
			}

			// starting index of @{c}_@{a}@{b}'s adjacency list
			let i_data_@{c}_@{a}@{b} = a_idx_x_@{a}@{b}[c_offset_@{c}@{a}];

			// end index of @{c}_@{a}@{b}'s adjacency list
			let i_data_end_@{c}_@{a}@{b} = a_idx_x_@{a}@{b}[c_offset_@{c}@{a} + 1];

			// each @{b} pointed to by @{a}
			do {
				// pull up @{b}'s id
				let i_test_@{b} = a_data_@{c}_@{a}@{b}[i_data_@{c}_@{a}@{b}];

				// ref/create @{a}_y@{c}
				let as_group_@{a}_y@{c} = h_groups_x_@{b}@{c}[i_test_@{b}];
				if(!as_group_@{a}_y@{c}) {
					as_group_@{a}_y@{c} = h_groups_x_@{b}@{c}[i_test_@{b}] = new Set();

					// increment @{a}@{b} size counter
					c_data_ab_size += 1;
				}

				// push subject to @{a}_y@{c} adjacency list
				as_group_@{a}_y@{c}.add(i_test_@{c});
			} while(++i_data_@{c}_@{a}@{b} !== i_data_end_@{c}_@{a}@{b});
		} while(++c_offset_@{c}@{a} !== c_offset_end_@{c}@{a});
	}


	// prep @{a}@{b}'s data adjacency list
	let n_b = @{count(b)};
	let a_data_@{a}@{b} = k_graph.data_@{a}@{b} = @{mk_uint_array('c_data_ab_size', 'n_b')}

	// prep @{a}_@{b}@{c}'s data groups
	let a_pre_data_@{a}_@{b}@{c} = [];

	// count how many elements will be stored in @{a}_@{b}@{c}'s final adjacency list
	let c_data_a_bc_size = 0;

	// track the maximum id value of its elements
	let n_max_c = 0;


	// prep @{a}@{b}'s index
	let n_a = @{count(a)};
	let n_data_ab = a_data_@{a}@{b}.length;
	let a_idx_@{a}@{b} = k_graph.idx_@{a}@{b} = @{mk_uint_array('n_a + 1', 'n_data_ab')};

	// start index position after first zero element
	let c_idx_ab = 1;

	// count the offsets of each data element for indexing
	let c_data_ab = 0;


	// prep @{a}_@{b}@{c}'s index groups
	let a_idx_@{a}_@{b}@{c} = k_graph.idx_@{a}_@{b}@{c} = [];

	// flatten @{a}@{b} groups into typed array adjaceny list
	for(let i_@{a}=1; i_@{a}<=@{count(a)}; i_@{a}++) {
		// convert set of keys to list of elements
		let a_group_@{a}y = [];
		let h_groups_x_@{b}@{c} = a_groups_@{a}_@{b}@{c}[i_@{a}];
		for(let i_@{b} in h_groups_x_@{b}@{c}) {
			// convert string key to int value
			a_group_@{a}y.push(~~i_@{b});
		}

		// move contents of array into list
		a_data_@{a}@{b}.set(a_group_@{a}y, c_data_ab);

		// advance data pointer by number of elements in group list
		c_data_ab += a_group_@{a}y.length;

		// record end of that list to index
		a_idx_@{a}@{b}[c_idx_ab++] = c_data_ab;


		// prep x_@{b}@{c} index list
		let n_idx_x_length = a_group_@{a}y.length + 1;
		let a_idx_x_@{b}@{c} = @{mk_uint_array('n_idx_x_length', 'c_data_ab')}

		// first index element is start of list
		a_idx_x_@{b}@{c}[0] = c_data_a_bc_size;

		// start index position after first element
		let c_idx_x_bc = 1;

		// each object in list
		// let h_groups_@{a}_n_@{b}@{c} = a_groups_@{a}_@{b}@{c}[i_@{a}];
		for(let i_@{b} in h_groups_x_@{b}@{c}) {
			// convert set to array
			let a_data_@{a}_@{b}z = [];
			h_groups_x_@{b}@{c}[i_@{b}].forEach((i_) => {
				a_data_@{a}_@{b}z.push(i_);

				// update maximum c value for determining range of typed array
				n_max_c = Math.max(i_, n_max_c);
			});

			// append array to @{a}_@{b}@{c}'s groups
			a_pre_data_@{a}_@{b}@{c}.push(a_data_@{a}_@{b}z);

			// update length (no terminus)
			c_data_a_bc_size += a_data_@{a}_@{b}z.length;

			// save end of list to @{a}_@{b}@{c} index
			a_idx_x_@{b}@{c}[c_idx_x_bc++] = c_data_a_bc_size;
		}

		// push x_@{b}@{c} index list to @{a}_@{b}@{c}'s index group
		a_idx_@{a}_@{b}@{c}.push(a_idx_x_@{b}@{c});
	}

	// flatten @{a}_@{b}@{c}'s data groups into single adjacency list
	let i_data_@{a}_@{b}@{c} = 0;
	let a_data_@{a}_@{b}@{c} = k_graph.data_@{a}_@{b}@{c} = @{mk_uint_array('c_data_a_bc_size', 'n_max_c')}
	for(let i_=0; i_<a_pre_data_@{a}_@{b}@{c}.length; i_++) {
		a_data_@{a}_@{b}@{c}.set(a_pre_data_@{a}_@{b}@{c}[i_], i_data_@{a}_@{b}@{c});

		// advance data pointer by number of elements inserted (no list terminator)
		i_data_@{a}_@{b}@{c} += a_pre_data_@{a}_@{b}@{c}[i_].length;
	}

	console.timeEnd('@{a}@{b}@{c}');
@end




/**
* imports
**/

// native
const fs = require('fs');

// local classes
const graphy = require('./graphy');

const HP_RANGE_ALL = Symbol('range:all');
const HP_RANGE_HOPS = Symbol('range:hops');
const HP_RANGE_NODES = Symbol('range:nodes');
const HP_RANGE_LITERALS = Symbol('range:literals');
const HP_RANGE_SOURCES = Symbol('range:sources');
const HP_RANGE_SINKS = Symbol('range:sinks');

const HP_HOP = Symbol('hop');
const HP_SUBJECT = Symbol('subject');
const HP_PREDICATE = Symbol('predicate');
const HP_INVERSE_PREDICATE = Symbol('inverse-predicate');
const HP_OBJECT = Symbol('object');

const HP_USE_SPO = Symbol('use:SPO');
const HP_USE_POS = Symbol('use:POS');
const HP_USE_OSP = Symbol('use:OSP');

const A_DATA_MAP = [
	HP_USE_SPO,  // Ks Kp Ko : 0 0 0
	HP_USE_SPO,  // Ks Kp Vo : 0 0 1
	HP_USE_OSP,  // Ks Vp Ko : 0 1 0
	HP_USE_SPO,  // Ks Vp Vo : 0 1 1
	HP_USE_POS,  // Vs Kp Ko : 1 0 0
	HP_USE_POS,  // Vs Kp Vo : 1 0 1
	HP_USE_OSP,  // Vs Vp Ko : 1 1 0
	HP_USE_SPO,  // Vs Vp Vo : 1 1 1
];


class LinkedGraph {
	constructor(h_config) {
		Object.assign(this, {
			prefixes: {},
			prefix_lookup: {},
			user_prefixes: {},
			user_prefix_iris: {},
			label_lookup: {},
		});
	}

	// add_prefixes(h_prefixes) {
	// 	let h_user_prefixes = this.user_prefixes;
	// 	let h_prefix_lookup = this.prefix_lookup;

	// 	// each prefix that a user wants to add
	// 	for(let s_prefix_id in h_prefixes) {
	// 		let s_prefix_iri = h_prefixes[s_prefix_id];

	// 		// prefix iri indeed reflects existing prefix
	// 		if(h_prefix_lookup[s_prefix_iri]) {
	// 			h_user_prefixes[s_prefix_id] = h_prefix_lookup[s_prefix_iri];
	// 		}
	// 		// prefix iri not an interested prefix
	// 		else {
	// 			console.warn(`not interested in shallow prefix iri "${s_prefix_iri}"`);
	// 		}
	// 	}
	// }

	set_prefixes(h_prefixes) {
		let k_graph = this;

		// ref maps
		let h_prefix_lookup = k_graph.prefix_lookup;
		let h_user_prefixes = k_graph.user_prefixes;
		let h_user_prefix_iris = k_graph.user_prefix_iris;

		// each new prefix
		for(let s_prefix in h_prefixes) {
			// ref prefix iri
			let p_iri = h_prefixes[s_prefix];

			// exact mapping match
			if(h_prefix_lookup[p_iri]) {
				// set mapping forwards
				h_user_prefix_iris[s_prefix] = p_iri;
				h_user_prefixes[s_prefix] = h_prefix_lookup[p_iri];
			}
			else {
				h_user_prefix_iris[s_prefix] = p_iri;
				console.warn(`The prefix mapping of ${s_prefix}: to <${p_iri}> is not efficient for this dataset`);
			}
		}
	}

	clean_prefixes() {
		let k_graph = this;

		// each prefix
		next_prefix:
		for(let s_prefix in k_graph.prefixes) {
			let a_prefix = encode_utf_8(s_prefix+'\u0001');
			let n_prefix = a_prefix.length;
			let b_used = false;

			// find prefix that only has a single use
			let a_dict = k_graph.dict_d;
			let a_ref = k_graph.ref_d;
			scanning:
			for(let i_entry=0; i_entry<k_graph.count_d; i_entry++) {
				let c_chars = 0;
				for(let i_pos=a_ref[i_entry]; i_pos<a_ref[i_entry+1] && c_chars<n_prefix; i_pos++) {
					if(a_dict[i_pos] !== a_prefix[c_chars++]) continue scanning;
				}
				if(b_used) continue next_prefix;
				b_used = true;
			}

			debugger;
		}
	}

	index() {
		console.time('indexing');

		// ref local members
		let {
			dict_d: a_dict_d,
			dict_s: a_dict_s,
			dict_o: a_dict_o,
			dict_l: a_dict_l,
			dict_p: a_dict_p,

			count_d: c_words_d,
			count_s: c_words_s,
			count_o: c_words_o,
			count_l: c_words_l,
			count_p: c_words_p,

			data_sp: a_data_sp,
			data_s_po: a_data_s_po,

		} = this;

		// prep to find all items in adjacency list
		let i_index;
		let i_item;

		@ // make dictionary references
		@{mk_ref('d')}
		@{mk_ref('s')}
		@{mk_ref('o')}
		@{mk_ref('l')}
		@{mk_ref('p')}

		// make data indexes
		let n_all_source_nodes = c_words_d + c_words_s;
		let n_data_sp_idx_range = a_data_sp.length;
		@{mk_idx('sp', 'n_all_source_nodes', 'n_data_sp_idx_range')}

		// prep index lookup tree
		let a_idx_s_po = this.idx_s_po = [];

		// prep to scan entire data objects list
		let i_data_s_po = 0;

		// each subject node
		for(let i_subject=0; i_subject<n_all_source_nodes; i_subject++) {
			// grow as we go
			let a_idx_s_po_n = [];

			// compute maximum index
			let i_max_data_sp = (a_idx_sp[i_subject + 1] || a_data_sp.length) - 1;

			// prep to store largest index
			let i_largest = 0;

			// each predicate in subject's adjacency list
			let i_data_sp = a_idx_sp[i_subject];
			do {
				// add data object offset
				a_idx_s_po_n.push(i_data_s_po);

				// track last used index
				i_largest = i_data_s_po;

				// find end of data object adjacency list
				while(a_data_s_po[i_data_s_po++]) {}
			} while(++i_data_sp < i_max_data_sp);

			// take up as little memory as possible
			let d_typed_array = i_largest < 0x100
				? Uint8Array
				: (i_largest < 0x10000
					? Uint16Array
					: Uint32Array);

			// and save to index lookup tree
			a_idx_s_po.push(d_typed_array.from(a_idx_s_po_n));
		}

		console.timeEnd('indexing');
	}

	mk_pos() {
		@{mk_data('p', 'o', 's')}
	}

	mk_osp() {
		@{mk_data('o', 's', 'p')}
	}

	debug() {
		let k_graph = this;
		let a_dict_s = [];
		@{each_s()}
			a_dict_s.push(this.s(i_test_s));
		@{end_each()}

		let a_dict_p = [];
		@{each_p()}
			a_dict_p.push(this.p(i_test_p));
		@{end_each()}

		let a_dict_o = [];
		@{each_o()}
			a_dict_o.push(this.o(i_test_o));
		@{end_each()}

		return ''
			+`id | subject\n-- | --\n`+a_dict_s.map((h_n, i_n) => {
				return (i_n+1)+' | '+h_n.value;
			}).join('\n')+'\n'
			+`id | predicate\n-- | --\n`+a_dict_p.map((h_n, i_n) => {
				return (i_n+1)+' | '+h_n.value;
			}).join('\n')+'\n'
			+`id | object\n-- | --\n`+a_dict_o.map((h_n, i_n) => {
				return (i_n+1)+' | '+h_n.value;
			}).join('\n')+'\n';
	}

	show(s_which, i_k) {
		let k_graph = this;

		debugger;

		let a_idx = k_graph['idx_'+s_which];
		let a_data = k_graph['data_'+s_which];

		let i_off = a_idx[i_k];
		let a_slice = a_data.slice(i_off, a_data.indexOf(0, i_off));
		debugger;
		return a_slice;
	}

	spo(s_n3_s, s_n3_p) {
		let i_s = this.find_s(s_n3_s);
		let i_p = this.find_p(s_n3_p);

		let k_graph = this;

		let i_test_s = i_s;
		@{each_sp()}
			if(i_test_p === i_p) {
				let i_data_s_po = k_graph.idx_s_po[i_s-1][c_offset_data_sp];
				let a_terms = [];
				do {
					let i_test_o = k_graph.data_s_po[i_data_s_po];
					if(!i_test_o) break;
					a_terms.push(k_graph.o(i_test_o));
					i_data_s_po++;
				} while(true);
				console.log(`${s_n3_s} ${s_n3_p} ${a_terms.map(h=>h.toNT()).join(',\n\t')}`)
				debugger;
			}
		@{end_each()}
	}

	pls(s_n3_p, s_content, z_datatype_or_lang) {
		let i_p = this.find_p(s_n3_p);

		let k_graph = this;

		// prep to find word in dict
		let s_word = '"'+s_content;
		if('string' === typeof z_datatype_or_lang) {
			s_word = '@'+z_datatype_or_lang+s_word;
		}
		else if('object' === typeof z_datatype_or_lang) {
			s_word = '^'+z_datatype_or_lang+s_word;
		}

		// terminus
		s_word += '\u0000';

		// turn string into word
		let a_word = encode_utf_8(s_word);

		// cache word length
		let n_word = a_word.length;

		// searchs literals dict
		let a_dict_l = k_graph.dict_l;
		@{dict_find('l')}
			let i_o = k_graph.count_d + k_graph.count_o + c_item_l;

			let i_test_p = i_p;
			@{each_po()}
				if(i_test_o === i_o) {
					let i_data_p_os = k_graph.idx_p_os[i_p-1][c_offset_data_po];
					let a_terms = [];
					do {
						let i_test_s = k_graph.data_p_os[i_data_p_os];
						if(!i_test_s) break;
						a_terms.push(k_graph.s(i_test_s));
						i_data_p_os++;
					} while(true);
					console.log(`${k_graph.o(i_o).toNT()} ^${s_n3_p} ${a_terms.map(h=>h.toNT()).join(',\n\t')}`)
					debugger;
				}
			@{end_each()}
		@{dict_else('l')}

		debugger;
	}

	pos(s_n3_p, s_n3_o) {
		let i_p = this.find_p(s_n3_p);
		let i_o = this.find_o(s_n3_o);

		let k_graph = this;

		let a_data_ab = k_graph.data_po;
		let a_idx_ab = k_graph.idx_po;
		let a_data_a_bc = k_graph.data_p_os;
		let a_idx_a_bc = k_graph.idx_p_os;
		let i_test_a = i_p;

		// a_data_ab.slice(a_idx_ab[i_test_a-1], a_idx_ab[i_test_a]).forEach(i => console.log(k_graph.o(i).value));
		@{each_ab()}
			if(i_test_b === i_o) {
				debugger;
				let a_terms = [];
				@{each_abc()}
					a_terms.push(k_graph.s(i_test_c));
				@{end_each()}
				console.log(`${s_n3_p} ${s_n3_o} ${a_terms.map(h=>h.toNT()).join(',\n\t')}`)
				break;
			}
		@{end_each()}
	}

	s(i_subject) {
		let i_start; let i_stop;
		let c_category = this.count_d;
		// dual
		if(i_subject <= c_category) {
			@{produce_node('d', '', 'i_subject')}
		}
		// subject
		else if(i_subject <= (c_category += this.count_s)) {	
			@{produce_node('s', '- this.count_d', 'i_subject')}
		}
		//
		else {
			throw 'invalid subject id: #'+i_subject;
		}
	}

	p(i_predicate) {
		@{produce_node('p')}
	}

	o(i_object) {
		let i_start; let i_stop;
		let c_category = this.count_d;
		// dual
		if(i_object <= c_category) {
			@{produce_node('d', '', 'i_object')}
		}
		// object
		else if(i_object <= (c_category += this.count_o)) {	
			@{produce_node('o', '- this.count_d', 'i_object')}
		}
		// literal
		else {
			// ref literals dict
			let a_dict_l = this.dict_l;
			let ab_literal;

			// find index of word in dict
			let i_key = i_object - this.count_d - this.count_o;
			let a_ref_l = this.ref_l;

			// fc_dict
			if(this.len_l) {
				let a_len_l = this.len_l;
				let i_block = i_key >>> 4;
				let i_word = i_block << 4;
				let i_dict_l = a_ref_l[i_block];

				// head word
				let i_entry_end = i_dict_l + a_len_l[i_word++];
				let ab_test_word = a_dict_l.slice(i_dict_l, i_entry_end);

				while(i_word <= i_key) {
					// begin scanning at end of prev word
					i_dict_l = i_entry_end;

					// vbyte number of characters to reuse
					let x_share = 0;

					// number of bytes consumed for vbyte
					let c_b = 0;
					while (true) {
						// byte value
						let x = a_dict_l[i_dict_l++];
						// add lower value
						x_share |= (x & 0x7f) << (7 * c_b++);
						// last byte of number
						if (x & 0x80) break;
					}
					let n_word_len = a_len_l[i_word++];

					// find entry's end
					i_entry_end = i_dict_l + n_word_len - x_share;

					// compile new word
					let a_new_test_word = new Uint8Array(n_word_len);
					a_new_test_word.set(ab_test_word.slice(0, x_share));
					a_new_test_word.set(a_dict_l.slice(i_dict_l, i_entry_end), x_share);
					ab_test_word = a_new_test_word;
				}

				ab_literal = ab_test_word;
			}
			// dict
			else {
				i_start = a_ref_l[i_key - 1];
				i_stop = a_ref_l[i_key];

				// find start of content
				let i_content = a_dict_l.indexOf(34, i_start) + 1;

				// ref chunk of buffer
				ab_literal = a_dict_l.slice(i_content, i_stop);
			}

			// initialize literal with content
			let k_literal = graphy.literal(
				(!ab_literal[0])
					? decode_utf_16le(ab_literal.slice(1))  // word is utf-16le encoded
					: decode_utf_8(ab_literal)  // word is utf-8 encoded
			);

			// determine primer
			let x_primer = a_dict_l[i_start];

			// literal has datatype
			if(94 === x_primer) {
				k_literal.datatype = decode_utf_8(a_dict_l.slice(i_start + 1, i_content-1));
			}
			// literal has language tag
			else if(64 === x_primer) {
				k_literal.language = String.fromCharCode.apply(null, a_dict_l.slice(i_start + 1, i_content-1));
			}

			//
			return k_literal;
		}
	}

	triple(i_s, i_p, i_o) {
		return this.s(i_s).value+' '+this.p(i_p).value+' '+this.o(i_o);
	}


	find_s(s_n3) {
		// ref graph
		let k_graph = this;

		// ref dicts
		let a_dict_d = this.dict_d;
		let a_dict_s = this.dict_s;

		// prep to find word in dict
		let s_word = '';
		@{compress_n3_node(0)}

		// turn string into word
		let a_word = encode_utf_8(s_word)

		// cache word length
		let n_word = a_word.length;

		// search for word in duals dict
		@{dict_find('d')}
			return c_item_d;
		@{dict_else('d')}

		// search for word in subjects dict
		@{dict_find('s')}
			return k_graph.count_d + c_item_s;
		@{dict_else('s')}

		// subject not found
		return 0;
	}

	find_p(s_n3) {
		// ref graph
		let k_graph = this;

		// ref predicates dict
		let a_dict_p = this.dict_p;

		// prep to find word in dict
		let s_word = '';
		@{compress_n3_node(0)}

		// turn string into word
		let a_word = encode_utf_8(s_word)

		// cache word length
		let n_word = a_word.length;

		// search for word in predicates dict
		@{dict_find('p')}
			return c_item_p;
		@{dict_else('p')}

		// predicate not found
		return 0;
	}

	find_o(s_n3) {
		// ref graph
		let k_graph = this;

		// ref dicts
		let a_dict_d = this.dict_d;
		let a_dict_o = this.dict_o;
		let a_dict_l = this.dict_l;

		// prep to find word in dict
		if(s_n3.indexOf('"') === -1) {
			let s_word = '';
			@{compress_n3_node(0)}

			// turn string into word
			let a_word = encode_utf_8(s_word)

			// cache word length
			let n_word = a_word.length;

			// search for word in duals dict
			@{dict_find('d')}
				return c_item_d;
			@{dict_else('d')}

			// search for word in objects dict
			@{dict_find('o')}
				return k_graph.count_d + c_item_o;
			@{dict_else('o')}
		}
		else {
			// encode content
			console.warn('utf-16 not properly tested for');
			let s_content = s_n3.slice(s_n3.indexOf('"'));
			let s_word = s_n3.slice(0, s_n3.indexOf('"'));
			let ab_content = /[^\u0000-\u00ff]/.test(s_content)
				? encode_utf_16le(s_content)  // using utf-16le
				: encode_utf_8(s_content);  // using utf-8

			// join parts into word
			let a_word = join_buffers(encode_utf_8(s_word), ab_content);
	
			// cache word length
			let n_word = a_word.length;

			// search for word in literals dict
			@{fc_dict_find('l')}
				return k_graph.count_d + k_graph.count_o + c_item_l;
			@{fc_dict_else('l')}
		}

		// predicate not found
		return 0;
	}

	diags() {
		console.log('count_d: '+this.count_d);
		console.log('count_s: '+this.count_s);
		console.log('count_o: '+this.count_o);
		console.log('count_l: '+this.count_l);
		console.log('count_p: '+this.count_p);
	}

	*quads() {
		let k_graph = this;
		@{abc('s', 'p', 'o')}
		@{each_a()}
			@{each_ab()}
				@{each_abc()}
					yield graphy.quad(
						k_graph.s(i_test_a),
						k_graph.p(i_test_b),
						k_graph.o(i_test_c));
				@{end_each()}
			@{end_each()}
		@{end_each()}
	}

	// enters the graph
	enter() {
		return new EmptyPath(this);
	}
}


class PathLeg {
	constructor(k_graph, k_context) {
		this.graph = k_graph;
		this.context = k_context;
	}

	mark(s_name) {
		let k_context = this.context;

		// empty
		if(!k_context.length) return this;

		// save marking
		k_context.end().mark = s_name;

		// chain
		return this;
	}

	filter(f_filter) {
		let k_context = this.context;

		// empty
		if(!k_context.length) return this;

		// save marking
		k_context.end().filter = f_filter;

		// chain
		return this;
	}

	exit() {
		if(this instanceof Edge || this instanceof InverseEdge) {
			throw 'error: not allowed to exit pattern on an edge. pattern must terminate on a node or literal';
		}
		return new Selection(this.graph, this.context);
	}
}


class Context {
	constructor(a_pattern) {
		this.pattern = a_pattern || [];
	}

	get length() {
		return this.pattern.length;
	}

	copy() {
		return new Context(this.pattern.slice());
	}

	shift() {
		return this.pattern.shift();
	}

	end() {
		return this.pattern[this.pattern.length-1];
	}

	append_id(n_id, hp_type) {
		return this.pattern.push({
			id: n_id,
			type: hp_type,
		});
	}

	append_ids(a_ids, hp_type) {
		let a_pattern = this.pattern;
		return a_pattern.push({
			ids: a_ids,
			type: hp_type,
		});
	}

	append_range(hp_range, hp_type) {
		return this.pattern.push({
			range: hp_range,
			type: hp_type,
		});
	}

	append_all(hp_type) {
		return this.pattern.push({
			range: HP_RANGE_ALL,
			type: hp_type,
		});
	}
}


//
class EmptyPath extends PathLeg {

	constructor(k_graph) {
		// create root context
		let k_context = new Context();

		// create path leg
		super(k_graph, k_context);
	}

	source(s_n3) {
		let k_graph = this.graph;
		let k_context = this.context;

		// prep to find word in dict
		let s_word = '';
		@{compress_n3_node()}

		// turn string into word
		let a_word = encode_utf_8(s_word);

		// cache word length
		let n_word = a_word.length;

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			k_context.append_id(c_item_d, HP_SUBJECT);
			return new Sources(k_graph, k_context);
		@{dict_else('d')}

		// search subjects dict
		let a_dict_s = k_graph.dict_s;
		@{dict_find('s')}
			k_context.append_id(k_graph.count_d + c_item_s, HP_SUBJECT);
			return new Sources(k_graph, k_context);
		@{dict_else('s')}
	}

	sink(s_n3) {
		let k_graph = this.graph;
		let k_context = this.context;

		// prep to find word in dict
		let s_word = '';
		@{compress_n3_node()}

		// turn string into word
		let a_word = encode_utf_8(s_word);

		// cache word length
		let n_word = a_word.length;

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			k_context.append_id(c_item_d, HP_OBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('d')}

		// search objects dict
		let a_dict_o = k_graph.dict_o;
		@{dict_find('o')}
			k_context.append_id(k_graph.count_d + c_item_o, HP_OBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('o')}
	}

	literal(s_content, z_datatype_or_lang) {
		let k_graph = this.graph;
		let k_context = this.context;

		// prep to find word in dict
		let s_word = '"';
		if('string' === typeof z_datatype_or_lang) {
			s_word = '@'+z_datatype_or_lang+'"';
		}
		else if('object' === typeof z_datatype_or_lang) {
			s_word = '^'+z_datatype_or_lang+'"';
		}

		// encode content
		let ab_content = /[^\u0000-\u00ff]/.test(s_content)
			? encode_utf_16le(s_content)  // using utf-16le
			: encode_utf_8(s_content);  // using utf-8

		// join parts into word
		let a_word = join_buffers(encode_utf_8(s_word), ab_content);

		// cache word length
		let n_word = a_word.length;

		// searchs literals dict
		let a_dict_l = k_graph.dict_l;
		@{fc_dict_find('l')}
			k_context.append_id(k_graph.count_d + k_graph.count_o + c_item_l, HP_OBJECT);
			return new Bag(k_graph, k_context);
		@{fc_dict_else('l')}
	}

	sources(a_n3s) {
		let k_graph = this.graph;
		let k_context = this.context;

		// there is a list
		if(a_n3s) {
			// prep list of sources to capture
			let a_sources = [];

			// each n3 node
			@{each('n3', 's')}
				// prep to find word in dict
				let s_word = '';
				@{compress_n3_node()}

				// turn string into word
				let a_word = encode_utf_8(s_word);

				// cache word length
				let n_word = a_word.length;

				// searchs duals dict
				let a_dict_d = k_graph.dict_d;
				@{dict_find('d')}
					a_sources.push(c_item_d);
				@{dict_else('d')}

				// search subjects dict
				let a_dict_s = k_graph.dict_s;
				@{dict_find('s')}
					a_sources.push(k_graph.count_d + c_item_s);
				@{dict_else('s')}
			@{end_each()}

			// push id list to context's pattern
			k_context.append_ids(a_sources, HP_SUBJECT);

			// sources
			return new Sources(k_graph, k_context);
		}
		// no list!
		else {
			// add all to path
			k_context.append_all(HP_SUBJECT);

			// sources
			return new Sources(this.graph, k_context);
		}
	}

}


class Sources extends PathLeg {
	constructor(k_graph, k_context) {
		super(k_graph, k_context);
	}

	cross(z_edge) {
		let k_graph = this.graph;
		let k_context = this.context;

		// ref prefix lookup
		let h_prefixes = k_graph.prefixes;

		// ref predicates dict
		let a_dict_p = k_graph.dict_p;

		// ref predicates data
		let a_data_sp = k_graph.data_sp;

		// ref predicates data index
		let a_idx_sp = k_graph.idx_sp;

		// user wants to cross a single edge
		if('string' === typeof z_edge) {
			let s_n3 = z_edge;

			// prep to find word in dict
			let s_word = '';
			@{compress_n3_node()}

			// turn string into word
			let a_word = encode_utf_8(s_word);

			// cache word length
			let n_word = a_word.length;

			// search for word in predicates dict
			@{dict_find('p')}
				// append id to path
				k_context.append_id(c_item_p, HP_PREDICATE);

				//
				return new Edge(k_graph, k_context);
			@{dict_else('p')}

			// predicate does not exist
			throw 'pne';
		}

		throw 'non-string';
	}


	invert(z_edge) {
		let k_graph = this.graph;
		let k_context = this.context;

		// ref prefix lookup
		let h_prefixes = k_graph.prefixes;

		// ref predicates dict
		let a_dict_p = k_graph.dict_p;

		// ref predicates data
		let a_data_sp = k_graph.data_sp;

		// ref predicates data index
		let a_idx_sp = k_graph.idx_sp;

		// user wants to cross a single edge
		if('string' === typeof z_edge) {
			let s_n3 = z_edge;

			// prep to find word in dict
			let s_word = '';
			@{compress_n3_node()}

			// turn string into word
			let a_word = encode_utf_8(s_word);

			// cache word length
			let n_word = a_word.length;

			// search for word in predicates dict
			@{dict_find('p')}
				// append id to path
				k_context.append_id(c_item_p, HP_INVERSE_PREDICATE);

				//
				return new InverseEdge(k_graph, k_context);
			@{dict_else('p')}

			// predicate does not exist
			throw 'pne';
		}

		throw 'non-string';
	}

	probe(z_probes, b_optimize_probe_first) {
		let k_context = this.context;

		let h_source = k_context.end();

		// optimize query by first matching presence of all probe edges
		if(b_optimize_probe_first) {
			h_source.probe_first = 1;
		}

		// create probes array
		let a_probes = h_source.probes = [];

		// ref graph
		let k_graph = this.graph;

		// probe is array
		if(Array.isArray(z_probes)) {
			throw 'probe array';
		}
		// probe is hash
		else {
			// each probe
			for(let s_probe_edge in z_probes) {
				let f_probe = z_probes[s_probe_edge];

				// find predicate in dict
				let i_p = k_graph.find_p(s_probe_edge);

				// no such predicate, no need to call probe; all done here!
				if(!i_p) return new Void(k_graph, this.context);

				// create new probe path starting with edge
				let k_context_frag = new Context();
				k_context_frag.append_id(i_p, HP_PREDICATE);

				// fire probe callback
				f_probe(new Edge(k_graph, k_context_frag));

				// save probe descriptor
				a_probes.push(k_context_frag);
			}
		}

		// chain
		return this;
	}

	span() {
		let k_context = this.context;
		k_context.append_all(HP_PREDICATE);
		return new Edge(this.graph, k_context);
	}
}


class Edge extends PathLeg {
	constructor(k_graph, k_context) {
		super(k_graph, k_context);
	}

	// select only the paths that lead to an exact node
	node(s_n3) {
		let k_graph = this.graph;
		let k_context = this.context;

		// prep to find word in dict
		let s_word = '';

		@{compress_n3_node()}

		// turn string into word
		let a_word = encode_utf_8(s_word);

		// cache word length
		let n_word = a_word.length;

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			k_context.append_id(c_item_d, HP_OBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('d')}

		// search object nodes dict
		let a_dict_o = k_graph.dict_o;
		@{dict_find('o')}
			k_context.append_id(k_graph.count_d + c_item_o, HP_OBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('o')}
	}

	// select only the paths that lead to an exact node
	nodes(a_n3s) {
		let k_graph = this.graph;
		let k_context = this.context;

		// there is a list
		if(a_n3s) {
			// prep list of ids to capture
			let a_ids = [];

			// each n3 node
			@{each('n3', 's')}
				// prep to find word in dict
				let s_word = '';

				@{compress_n3_node()}

				// turn string into word
				let a_word = encode_utf_8(s_word);

				// cache word length
				let n_word = a_word.length;

				// searchs duals dict
				let a_dict_d = k_graph.dict_d;
				@{dict_find('d')}
					a_ids.push(c_item_d);
				@{dict_else('d')}

				// search object nodes dict
				let a_dict_o = k_graph.dict_o;
				@{dict_find('o')}
					a_ids.push(k_graph.count_d + c_item_o);
				@{dict_else('o')}
			@{end_each()}

			// push id list to context's pattern
			k_context.append_ids(a_ids, HP_OBJECT);
		}
		// no list!
		else {
			// push variable type all
			k_context.append_all(HP_OBJECT);
		}

		// chaining, return a bag of objects
		return new Bag(k_graph, k_context);
	}

	literal(s_n3) {
		let k_graph = this.graph;

		// prep to find word in dict
		let s_word = s_n3.slice(1)+'\u0000';

		// turn string into word
		let a_word = encode_utf_8(s_word);

		// cache word length
		let n_word = a_word.length;

		// search literals dict
		let a_dict_l = k_graph.dict_l;

		// treat literal as node; find every vertex that has that literal
		@{fc_dict_find('l')}
			k_context.append_id(k_graph.count_d + k_graph.count_o + c_item_l, HP_OBJECT);
			return new Bag(this.graph, k_context);
		@{fc_dict_else('l')}
	}

	literals(a_n3s) {
		let k_graph = this.graph;
		let k_context = this.context;

		// there is a list
		if(a_n3s) {
			throw 'multiple literals not yet supported';
		}
		// no list!
		else {
			k_context.append_range(HP_RANGE_LITERALS, HP_OBJECT);
			return new Bag(k_graph, k_context);
		}
	}

	hops() {
		let k_context = this.context;
		k_context.append_range(HP_RANGE_HOPS, HP_OBJECT);
		return new Sources(this.graph, k_context);
	}

	all() {
		let k_context = this.context;
		k_context.append_all(HP_OBJECT);
		return new Bag(this.graph, this.context);
	}
}


class InverseEdge extends PathLeg {
	constructor(k_graph, k_context) {
		super(k_graph, k_context);
	}

	// select only the paths that lead to an exact node
	node(s_n3) {
		let k_graph = this.graph;
		let k_context = this.context;

		// prep to find word in dict
		let s_word = '';

		@{compress_n3_node()}

		// turn string into word
		let a_word = encode_utf_8(s_word);

		// cache word length
		let n_word = a_word.length;

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			k_context.append_id(c_item_d, HP_SUBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('d')}

		// search subject nodes dict
		let a_dict_s = k_graph.dict_s;
		@{dict_find('s')}
			k_context.append_id(k_graph.count_d + c_item_s, HP_SUBJECT);
			return new Sources(k_graph, k_context);
		@{dict_else('s')}
	}

	// select only the paths that lead to an exact node
	nodes(a_n3s) {
		let k_graph = this.graph;
		let k_context = this.context;

		// there is a list
		if(a_n3s) {
			// prep list of ids to capture
			let a_ids = [];

			// each n3 node
			@{each('n3', 's')}
				// prep to find word in dict
				let s_word = '';

				@{compress_n3_node()}

				// turn string into word
				let a_word = encode_utf_8(s_word);

				// cache word length
				let n_word = a_word.length;

				// searchs duals dict
				let a_dict_d = k_graph.dict_d;
				@{dict_find('d')}
					a_ids.push(c_item_d);
				@{dict_else('d')}

				// search subject nodes dict
				let a_dict_s = k_graph.dict_s;
				@{dict_find('s')}
					a_ids.push(k_graph.count_d + c_item_s);
				@{dict_else('s')}
			@{end_each()}

			// push id list to context's pattern
			k_context.append_ids(a_ids, HP_SUBJECT);
		}
		// no list!
		else {
			// push variable type all
			k_context.append_all(HP_SUBJECT);
		}

		// chaining, return a Sources
		return new Sources(k_graph, k_context);
	}

	hops() {
		let k_context = this.context;
		k_context.append_range(HP_RANGE_HOPS, HP_SUBJECT);
		return new Sources(this.graph, k_context);
	}

	sources() {
		let k_context = this.context;
		k_context.append_all(HP_SUBJECT);
		return new Sources(this.graph, this.context);
	}
}


class Bag extends PathLeg {
	constructor(k_graph, k_context) {
		super(k_graph, k_context);
	}

	invert(z_edge) {
		let k_graph = this.graph;
		let k_context = this.context;

		// ref prefix lookup
		let h_prefixes = k_graph.prefixes;

		// ref predicates dict
		let a_dict_p = k_graph.dict_p;

		// ref predicates data
		let a_data_sp = k_graph.data_sp;

		// ref predicates data index
		let a_idx_sp = k_graph.idx_sp;

		// user wants to cross a single edge
		if('string' === typeof z_edge) {
			let s_n3 = z_edge;

			// prep to find word in dict
			let s_word = '';
			@{compress_n3_node()}

			// turn string into word
			let a_word = encode_utf_8(s_word);

			// cache word length
			let n_word = a_word.length;

			// search for word in predicates dict
			@{dict_find('p')}
				// append id to path
				k_context.append_id(c_item_p, HP_INVERSE_PREDICATE);

				//
				return new InverseEdge(k_graph, k_context);
			@{dict_else('p')}

			// predicate does not exist
			throw 'pne';
		}

		throw 'non-string';
	}
}



@macro mk_iterator(a, b, c)
	// mk iteration generators
	let f_@{a} = this.iterate_a(h_@{a}, '@{a}');
	let f_@{b} = this.iterate_b(h_@{b}, '@{b}', '@{a}@{b}');
	let f_@{c} = this.iterate_c(h_@{c}, '@{c}', '@{a}_@{b}@{c}');

	// iterate a
	for(let i_@{a} of f_@{a}()) {
		let h_row_a = h_row__;

		// a is marked
		if(s_mark_@{a}) {
			// extend row _
			h_row_a = Object.create(h_row__);

			// save marked
			h_row_a[s_mark_@{a}] = k_graph.@{a}(i_@{a});
		}

		// iterate b
		for(let [i_@{b}, c_offset_data_@{a}@{b}] of f_@{b}(i_@{a})) {
			let h_row_b = h_row_a;

			// b is marked
			if(s_mark_@{b}) {
				// extend row a
				h_row_b = Object.create(h_row_a);

				// save marked
				h_row_b[s_mark_@{b}] = k_graph.@{b}(i_@{b});
			}

			// iterate c
			for(let i_@{c} of f_@{c}(i_@{a}, c_offset_data_@{a}@{b})) {
				let h_row_c = h_row_b;

				// c is marked
				if(s_mark_@{c}) {
					// extend row b
					h_row_c = Object.create(h_row_b);

					// save marked
					h_row_c[s_mark_@{c}] = k_graph.@{c}(i_@{c});
				}

				// ref head(s)
				let i_head = b_inverse? i_@{c}: i_@{a};
				let a_heads = h_results[i_head];
				if(!a_heads) a_heads = h_results[i_head] = [];

				// tail has probes
				if(h_@{c}.probes) {	
					// simulate pattern head just for probe
					let h_sim_c = {
						id: i_@{c},
						probes: h_@{c}.probes,
					};

					// probe all of c
					let h_survivors = this.probe(k_context, h_row_c, h_sim_c);
					if(h_survivors.size) {
						for(let i_tail in h_survivors) {
							let a_survivors = h_survivors[i_tail];
							@{each('survivor', 'a')}
								a_heads.push(a_survivor);
							@{end_each()}
						}
					}
				}
				// reached end of pattern; push the current row
				else if(b_terminate) {
					// save row
					a_heads.push(h_row_c);
				}
				// more pattern to match
				else {
					// simulate pattern head for next triple
					let h_sim_c = {
						id: i_@{c},
						type: HP_HOP,
					};

					// proceed on c
					let h_survivors = this.proceed(k_context.copy(), h_row_c, h_sim_c);
					for(let i_survivor in h_survivors) {
						// push all onto this super-head's list
						a_heads.push(...h_survivors[i_survivor]);
					}
				}
			}
		}
	}
@end



class Selection {
	constructor(k_graph, k_context) {
		this.graph = k_graph;
		this.context = k_context;
	}


	rows() {
		//x
		let h_results = this.consume(this.context);
		let a_rows = [];
		for(let i_head in h_results) {
			let a_survivors = h_results[i_head];
			@{each('survivor', 'h')}
				a_rows.push(h_survivor);
			@{end_each()}
		}
		return a_rows;
	}

	iterate_a(h_entity, s_term) {
		let k_graph = this.graph;

		// ref filter
		let f_filter = h_entity.filter;

		// K*[1]
		if(h_entity.id) {
			let i_entity = h_entity.id;

			// user bound a filter
			if(f_filter) {
				// filter rejects reconstructed term
				if(!f_filter(k_graph[s_term](i_entity))) {
					// empty iterator
					return function*() {};
				}
			}

			// mk entity iterator
			return function*() {
				// simply return entity id (already known to be a valid entity)
				yield i_entity;
			};
		}
		// K*[+]
		else if(h_entity.ids) {
			let a_entity_ids = h_entity.ids;

			// user bound a filter
			if(f_filter) {
				// map entity ids thru term constructor then apply filter
				a_entity_ids = a_entity_ids.map(k_graph[s_term]).filter(f_filter);
			}

			// mk entity iterator
			return function*() {
				// simply iterate each entity node id (already known to be valid entities)
				yield* a_entity_ids;
			};
		}
		// V*
		else {
			let hp_entity_type = h_entity.type;
			let hp_entity_range = h_entity.range;

			let i_start = 1;
			let i_stop;

			// V*[all]
			if(HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if(HP_SUBJECT === hp_entity_type) {
					i_stop = k_graph.count_d + k_graph.count_s;
				}
				// for objects
				else if(HP_OBJECT === hp_entity_type) {
					i_stop = k_graph.count_d + k_graph.count_O + k_graph.count_l;
				}
				// for predicates
				else {
					i_stop = k_graph.count_p;
				}
			}
			// V*[hops]
			else if(HP_RANGE_HOPS === hp_entity_range) {
				i_stop = k_graph.count_d;
			}
			// V*[literals]
			else if(HP_RANGE_LITERALS === hp_entity_range) {
				i_start = k_graph.count_d + k_graph.count_o;
				i_stop = i_start + k_graph.count_l;
			}
			// V*[sources]
			else if(HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.count_d + k_graph.count_s;
			}
			// V*[sinks]
			else if(HP_RANGE_SINKS === hp_entity_range) {
				i_stop = k_graph.count_d + k_graph.count_o;
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, HOPS}; found '+hp_entity_range;
			}

			// mk entity iterator
			return function*() {
				// no filter
				if(!f_filter) {
					// each and every entity node
					for(let i_e=i_start; i_e<=i_stop; i_e++) {
						yield i_e;
					}
				}
				// yes filter
				else {
					// each and every entity node
					for(let i_e=i_start; i_e<=i_stop; i_e++) {
						// skip entity if filter rejectes reconstructed term
						if(!f_filter(k_graph[s_term](i_e))) continue;

						// otherwise, yield
						yield i_e;
					}
				}
			};
		}
	}


	iterate_b(h_entity, s_term, s_key) {
		let k_graph = this.graph;

		// data and index
		let a_data_ab = k_graph['data_'+s_key];
		let a_idx_ab = k_graph['idx_'+s_key];

		// ref filter
		let f_filter = h_entity.filter;

		// K*[1]
		if(h_entity.id) {
			let i_entity = h_entity.id;

			// user bound a filter
			if(f_filter) {
				// filter rejects reconstructed term
				if(!f_filter(k_graph[s_term](i_entity))) {
					// empty iterator
					return function*() {};
				}
			}

			// mk entity iterator
			return function*(i_test_a) {
				// search data table for given entity
				@{find_ab('i_entity')}
					yield [i_entity, c_offset_ab];
				@{end_find()}
			};
		}
		// K*[+]
		else if(h_entity.ids) {
			let a_entity_ids = h_entity.ids;

			// user bound a filter
			if(f_filter) {
				// map entity ids thru term constructor then apply filter
				a_entity_ids = a_entity_ids.map(k_graph[s_term]).filter(f_filter);
			}

			// mk entity iterator
			return function*(i_test_a) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();

				// search data table for given entities
				@{each_ab()}
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_test_b);
					if(-1 !== i_found_edge) {
						// delete from search list
						a_search_ids.splice(i_found_entity, 1);

						// yield
						yield [i_test_b, c_offset_ab];

						// found all ids; stop searching
						if(!a_search_ids.length) break;
					}
				@{end_each()}
			};
		}
		// V*
		else {
			let hp_entity_type = h_entity.type;
			let hp_entity_range = h_entity.range;

			let i_start = 1;
			let i_stop;

			// V*[all]
			if(HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if(HP_SUBJECT === hp_entity_type) {
					i_stop = k_graph.count_d + k_graph.count_s;
				}
				// for objects
				else if(HP_OBJECT === hp_entity_type) {
					throw 'i thought this would never happen';
					i_stop = k_graph.count_d + k_graph.count_O + k_graph.count_l;
				}
				// for predicates
				else {
					i_stop = k_graph.count_p;
				}
			}
			// V*[hops]
			else if(HP_RANGE_HOPS === hp_entity_range) {
				i_stop = k_graph.count_d;
			}
			// V*[literals]
			else if(HP_RANGE_LITERALS === hp_entity_range) {
				throw 'i thought this would never happen';
				i_start = k_graph.count_d + k_graph.count_o;
				i_stop = i_start + k_graph.count_l;
			}
			// V*[sources]
			else if(HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.count_d + k_graph.count_s;
			}
			// V*[sinks]
			else if(HP_RANGE_SINKS === hp_entity_range) {
				throw 'i thought this would never happen';
				i_stop = k_graph.count_d + k_graph.count_o;
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, HOPS}';
			}

			// mk entity iterator
			return function*(i_test_a) {
				// no filter
				if(!f_filter) {

					debugger;
					@{find_ab('i_start')}
						do {
							yield [i_test_b, c_offset_ab];
							i_test_b = a_data_ab[i_data_ab_start + (++c_offset_ab)];
						} while(i_test_b < i_stop);
					@{end_find()}

					// // search data table for given range
					// {
					@ // 	@{each_ab()}
					// 		// too low (not in range yet)
					// 		if(i_test_b < i_start) continue;

					// 		// too high (out of range)
					// 		if(i_test_b > i_stop) break;

					// 		// within range
					// 		yield [i_test_b, c_offset_ab];
					@ // 	@{end_each()}
					// }
				}
				// yes filter
				else {
					// search data table for given range
					@{each_ab()}
						// too low (not in range yet)
						if(i_test_b < i_start) continue;

						// too high (out of range)
						if(i_test_b > i_stop) break;

						// filter rejects reconstructed term; skip
						if(!f_filter(k_graph[s_term](i_test_b))) continue;

						// accepted
						yield [i_test_b, c_offset_ab];
					@{end_each()}
				}
			};
		}
	}

	iterate_c(h_entity, s_term, s_key) {
		let k_graph = this.graph;

		// data and index
		let a_data_a_bc = k_graph['data_'+s_key];
		let a_idx_a_bc = k_graph['idx_'+s_key];

		// ref filter
		let f_filter = h_entity.filter;

		// K*[1]
		if(h_entity.id) {
			let i_entity = h_entity.id;

			// user bound a filter
			if(f_filter) {
				// filter rejects reconstructed term
				if(!f_filter(k_graph[s_term](i_entity))) {
					// empty iterator
					return function*() {};
				}
			}

			// mk entity iterator
			return function*(i_test_a, c_offset_ab) {
				// search data table for given entity
				@{find_abc('i_entity')}
					yield i_entity;
				@{end_find()}
			};
		}
		// K*[+]
		else if(h_entity.ids) {
			let a_entity_ids = h_entity.ids;

			// user bound a filter
			if(f_filter) {
				// map entity ids thru term constructor then apply filter
				a_entity_ids = a_entity_ids.map(k_graph[s_term]).filter(f_filter);
			}

			// mk entity iterator
			return function*(i_test_a, c_offset_ab) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();
				
				debugger;
				// search data table for given entities
				@{each_abc()}
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_test_c);
					if(-1 !== i_found_edge) {
						// delete from search list
						a_search_ids.splice(i_found_entity, 1);

						// yield
						yield i_test_c;

						// found all ids; stop searching
						if(!a_search_ids.length) break;
					}
				@{end_each()}
			};
		}
		// V*
		else {
			let hp_entity_type = h_entity.type;
			let hp_entity_range = h_entity.range;

			let i_start = 1;
			let i_stop;

			// V*[all]
			if(HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if(HP_SUBJECT === hp_entity_type) {
					i_stop = k_graph.count_d + k_graph.count_s;
				}
				// for objects
				else if(HP_OBJECT === hp_entity_type) {
					i_stop = k_graph.count_d + k_graph.count_O + k_graph.count_l;
				}
				// for predicates
				else {
					throw 'i thought this would never happen';
					i_stop = k_graph.count_p;
				}
			}
			// V*[hops]
			else if(HP_RANGE_HOPS === hp_entity_range) {
				i_stop = k_graph.count_d;
			}
			// V*[literals]
			else if(HP_RANGE_LITERALS === hp_entity_range) {
				i_start = k_graph.count_d + k_graph.count_o;
				i_stop = i_start + k_graph.count_l;
			}
			// V*[sources]
			else if(HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.count_d + k_graph.count_s;
			}
			// V*[sinks]
			else if(HP_RANGE_SINKS === hp_entity_range) {
				i_stop = k_graph.count_d + k_graph.count_o;
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, HOPS}';
			}

			// mk entity iterator
			return function*(i_test_a, c_offset_ab) {
				// no filter
				if(!f_filter) {
					// search data table for given range
					@{each_abc()}
						// too low (not in range yet)
						if(i_test_c < i_start) continue;

						// too high (out of range)
						if(i_test_c > i_stop) break;

						// within range
						yield i_test_c;
					@{end_each()}
				}
				// yes filter
				else {
					// search data table for given range
					@{each_abc()}
						// too low (not in range yet)
						if(i_test_c < i_start) continue;

						// too high (out of range)
						if(i_test_c > i_stop) break;

						// filter rejects reconstructed term; skip
						if(!f_filter(k_graph[s_term](i_test_c))) continue;

						// accepted
						yield i_test_c;
					@{end_each()}
				}
			};
		}
	}

	consume(k_context) {
		let k_graph = this.graph

		// head of triple pattern
		let h_head = k_context.shift();

		// head has probes
		if(h_head.probes) {
			throw 'probing first';

			//
			let a_combine = a_rows;

			// each probe
			let a_probes = h_head.probes;
			for(let i_probe=0; i_probe<a_probes.length; i_probe++) {
				let a_probe_rows = [];

				// destruct probe context
				let k_context_frag = a_probes[i_probe];

				// play out pattern within probe
				this.proceed(k_context_frag, {}, h_head);

				// only if there are results
				if(a_probe_rows.length) {
					// nothing to combine with; set directly
					if(!a_combine.length) {
						a_combine = a_probe_rows;
					}
					// combinations
					else {
						for(let i_combine_row=a_combine.length-1; i_combine_row>=0; i_combine_row--) {
							// take combine row out from array
							let h_combine_row = a_combine[i_combine_row];
							a_combine.splice(i_combine_row, 1);

							// each probe row to combine
							for(let i_probe_row=0; i_probe_row<a_probe_rows.length; i_probe_row++) {
								let h_probe_row = a_probe_rows[i_probe_row];

								// copy original combine row
								let h_copy_row = Object.create(h_combine_row);

								// set each property from probe onto copy row
								for(let i_property in h_probe_row) {
									h_copy_row[i_property] = h_probe_row[i_property];
								}

								// push copy back onto combine
								a_combine.push(h_copy_row);
							}
						}
					}
				}
			}
		}
		// no probes
		else {
			return this.proceed(k_context, {}, h_head);
		}
	}

	probe(k_root_context, h_row__, h_head) {
		//
		let a_living = [];
		let h_survivors = {};

		// each probe
		let a_probes = h_head.probes;
		for(let i_probe=0; i_probe<a_probes.length; i_probe++) {
			// destruct probe context
			let k_context_frag = a_probes[i_probe].copy();

			// zero path length under probe
			if(!k_context_frag.length) {
				console.warn('empty path under probe');
				continue;
			}

			// play out pattern within probe
			let h_alive = this.proceed(k_context_frag, h_row__, h_head);

			// remove pointer to source row so that we only extend it once
			h_row__ = {};

			// object.keys
			a_living.length = 0;
			for(let i_alive in h_alive) {
				a_living.push(~~i_alive);

				// 
				if(h_survivors[i_alive]) {
					// probe rows to combine
					let a_probe_rows = h_alive[i_alive];

					//
					let a_combine = h_survivors[i_alive];
					for(let i_combine_row=a_combine.length-1; i_combine_row>=0; i_combine_row--) {
						// take combine row out from array
						let h_combine_row = a_combine[i_combine_row];
						a_combine.splice(i_combine_row, 1);

						// each probe row to combine
						for(let i_probe_row=0; i_probe_row<a_probe_rows.length; i_probe_row++) {
							let h_probe_row = a_probe_rows[i_probe_row];

							// copy original combine row
							let h_copy_row = Object.create(h_combine_row);

							// set each property from probe onto copy row
							for(let i_property in h_probe_row) {
								h_copy_row[i_property] = h_probe_row[i_property];
							}

							// push copy back onto combine
							a_combine.push(h_copy_row);
						}
					}
				}
				// first survivor to claim this index
				else {
					h_survivors[i_alive] = h_alive[i_alive];
				}
			}

			// nothing lives!
			if(!a_living.length) {
				return h_alive;
			}
			// one survivor
			else if(1 === a_living.length) {
				// mutate head for next probe
				h_head = {
					id: a_living[0],
					type: h_head.type,
				};
			}
			// multiple survivors
			else {
				// mutate head for next probe
				h_head = {
					ids: a_living,
					type: h_head.type,
				};
			}
		}

		// prep results list
		let h_results = {
			size: 0,
		};

		// exitted with living heads
		if(a_living.length) {
			// copy only living results
			let n_living = a_living.length;
			for(let i=0; i<n_living; i++) {
				let i_survivor = a_living[i];
				h_results[i_survivor] = h_survivors[i_survivor];
			}

			// update size
			h_results.size = n_living;
		}

		//
		return h_results;
	}

	proceed(k_context, h_row__, h_head) {
		let k_graph = this.graph
		let b_inverse = false;

		let x_triple_pattern = 0;
		let h_s;
		let h_o;

		// predicate(s) of triple pattern
		let h_p = k_context.shift();

		// Vp
		if(h_p.range) x_triple_pattern |= 2;

		// tail of triple pattern
		let h_tail = k_context.shift();

		// end of pattern sequence
		let b_terminate = !k_context.length;

		// body is normal direction
		if(HP_PREDICATE === h_p.type) {
			// Vs
			if(h_head.range) x_triple_pattern |= 4;

			// claim subjects
			h_s = h_head;

			// Vo
			if(h_tail.range) x_triple_pattern |= 1;

			// claim objects
			h_o = h_tail;
		}
		// body is inverse direction
		else {
			b_inverse = true;

			// Vs
			if(h_head.range) x_triple_pattern |= 1;

			// claim objects
			h_o = h_head;

			// Vs
			if(h_tail.range) x_triple_pattern |= 4;

			// claim subjects
			h_s = h_tail;
		}


		//
		let hp_data_use = A_DATA_MAP[x_triple_pattern];

		// ref markings
		let s_mark_s = h_s.mark;
		let s_mark_p = h_p.mark;
		let s_mark_o = h_o.mark;

		// save which heads were used and their associated rows
		let h_results = {};

		// SPO
		if(HP_USE_SPO === hp_data_use) {
			if(!k_graph.data_sp) {
				throw 'Query requires the POS triples index to be built.';
			}
			@{mk_iterator('s', 'p', 'o')}
		}
		// POS
		else if(HP_USE_POS === hp_data_use) {
			if(!k_graph.data_po) {
				throw 'Query requires the POS triples index to be built.';
			}
			@{mk_iterator('p', 'o', 's')}
		}
		// OSP
		else {
			if(!k_graph.data_os) {
				throw 'Query requires the OSP triples index to be built.';
			}
			@{mk_iterator('o', 's', 'p')}
		}

		// return which heads were used
		return h_results;
	}
}


module.exports = LinkedGraph;

