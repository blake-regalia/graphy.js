/* eslint-disable */

@ // import store macros
@include 'store.builder-js'

@{constants()}

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
	if(!s_word) return @{fail_return_value? fail_return_value: 'new Void(k_graph, k_pattern)'};
@end


@macro count(what)
	@if what == 's'
		k_graph.section_d.count + k_graph.section_s.count
	@elseif what == 'p'
		k_graph.section_p.count
	@elseif what == 'o'
		k_graph.section_d.count + k_graph.section_o.count + k_graph.section_l.count
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
	let n_@{c} = @{count(c)};
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
		@ // let a_idx_x_@{b}@{c} = @{mk_uint_array('n_idx_x_length', 'c_data_ab')}
		let a_idx_x_@{b}@{c} = new Uint32Array(n_idx_x_length);

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
const graphy = require('../main/graphy.js');
const pattern = require('./pattern.js');



/**
* constants
**/

const I_PREFIX_TOKEN = 0x01;
@{encoders()}
@{decoders()}
@{buffer_utils()}



class LinkedGraph {
	constructor(h_config) {
		Object.assign(this, {
			prefixes: {},
			prefix_lookup: {},
			user_prefixes: {},
			user_prefix_iris: {},
			label_lookup: {},
			term_count: 0,
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

	encode_n3_to_word(s_n3) {
		// iriref
		if('<' === s_n3[0]) {
			// construct iri
			let p_iri = s_n3.slice(1, -1);

			// attempt to compress
			let m_compress = R_COMPRESS.exec(p_iri);

			// cannot be compressed
			if(!m_compress) {
				// use iriref
				return encode_utf_8('\u0002'+p_iri);
			}
			// try finding compressed prefix id
			else {
				// lookup prefix id from prefix lookup
				let s_prefix_id = this.prefix_lookup[m_compress[1]];

				// prefix not exists
				if(!s_prefix_id) {
					// no such node
					return false;
				}
				// found the prefix
				else {
					// construct word using prefix
					return encode_utf_8(s_prefix_id+'\u0001'+m_compress[2]);
				}
			}
		}
		// prefixed name
		else {
			// extract prefix / suffix
			let [s_user_prefix, s_suffix] = s_n3.split(':');

			// lookup dict prefix from mapped user prefix
			let s_prefix_id = this.user_prefixes[s_user_prefix];

			// prefix mapping does not exist
			if(!s_prefix_id) {
				// grab user prefix iri
				let p_prefix_iri = this.user_prefix_iris[s_user_prefix];

				// no such user prefix defined
				if(!p_prefix_iri) {
					throw `no such prefix "${s_user_prefix}"`;
				}

				// reconstruct full iri
				let p_iri = p_prefix_iri+s_suffix;

				// attempt to compress
				let m_compress = R_COMPRESS.exec(p_iri);

				// cannot be compressed
				if(!m_compress) {
					// use iriref
					return encode_utf_8('\u0002'+p_iri);
				}
				// try finding compressed prefix id
				else {
					// lookup prefix id from prefix lookup
					let s_prefix_id = this.prefix_lookup[m_compress[1]];

					// prefix not exists
					if(!s_prefix_id) {
						// no such node
						return false;
					}
					// found the prefix
					else {
						// construct word using prefix
						return encode_utf_8(s_prefix_id+'\u0001'+m_compress[2]);
					}
				}
			}
			// prefix mapping does exist
			else {
				// construct word using prefix
				return encode_utf_8(s_prefix_id+'\u0001'+s_suffix);
			}
		}

		// no such node
		return false;
	}


	word_to_node(ab_word) {
		// ref 0th char
		let x_char = ab_word[0];

		// blank node
		if(3 === x_char) {
			return graphy.blankNode(decode_utf_8(ab_word));
		}
		// named node w/ absolute iri
		else if(2 === x_char) {
			return graphy.namedNode(decode_utf_8(ab_word));
		}
		// named node w/ prefixed name
		else {
			// find prefix token
			let i_prefix_token = ab_word.indexOf(I_PREFIX_TOKEN);

			// decompose prefixed name's word from dictionary
			let s_prefix_id = decode_utf_8(ab_word.slice(0, i_prefix_token));
			let s_suffix = decode_utf_8(ab_word.slice(i_prefix_token+1));

			// produce named node from reconstructed iri
			return graphy.namedNode(this.prefixes[s_prefix_id]+s_suffix);
		}
	}

	set_user_prefixes(h_set_prefixes) {
		// ref maps
		let h_prefix_lookup = this.prefix_lookup;
		let h_user_prefixes = this.user_prefixes;
		let h_user_prefix_iris = this.user_prefix_iris;

		// each new prefix
		for(let s_prefix in h_set_prefixes) {
			let p_iri = h_set_prefixes[s_prefix];

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

	mk_prefix_lookup() {
		// create prefix lookup hash by inversing normal prefix map
		let h_prefix_lookup = this.prefix_lookup = {};
		let h_prefixes = this.prefixes;
		for(let s_prefix_id in h_prefixes) {
			let p_prefix_iri = h_prefixes[s_prefix_id];
			h_prefix_lookup[p_prefix_iri] = s_prefix_id;
		}
	}

	mk_pos() {
		@{mk_data('p', 'o', 's')}
	}

	mk_osp() {
		@{mk_data('o', 's', 'p')}
	}

@ //	debug() {
@ //		let k_graph = this;
@ //		let a_dict_s = [];
@ //		@{each_s()}
@ //			a_dict_s.push(this.s(i_test_s));
@ //		@{end_each()}
@ //
@ //		let a_dict_p = [];
@ //		@{each_p()}
@ //			a_dict_p.push(this.p(i_test_p));
@ //		@{end_each()}
@ //
@ //		let a_dict_o = [];
@ //		@{each_o()}
@ //			a_dict_o.push(this.o(i_test_o));
@ //		@{end_each()}
@ //
@ //		return ''
@ //			+`id | subject\n-- | --\n`+a_dict_s.map((h_n, i_n) => {
@ //				return (i_n+1)+' | '+h_n.value;
@ //			}).join('\n')+'\n'
@ //			+`id | predicate\n-- | --\n`+a_dict_p.map((h_n, i_n) => {
@ //				return (i_n+1)+' | '+h_n.value;
@ //			}).join('\n')+'\n'
@ //			+`id | object\n-- | --\n`+a_dict_o.map((h_n, i_n) => {
@ //				return (i_n+1)+' | '+h_n.value;
@ //			}).join('\n')+'\n';
@ //	}
@ //
@ //	match(k_subject, k_predicate, k_object) {
@ //		let x_data_use = 
@ //			(k_subject === null? 4: 0)
@ //			| (k_predicate === null? 2: 0)
@ //			| (k_object === null? 1: 0);
@ //
@ //		let hp_data_use = A_DATA_MAP[x_data_use];
@ //		if(hp_data_use === HP_USE_SPO) {
@ //			if(k_subject !== null) {
@ //				// let i_s = this.find_s(k_subject.toCanonical());
@ //				if(k_predicate !== null) {
@ //
@ //				}
@ //			}
@ //		}
@ //	}
@ //
@ //	spo(s_n3_s, s_n3_p) {
@ //		let i_s = this.find_s(s_n3_s);
@ //		let i_p = this.find_p(s_n3_p);
@ //
@ //		let k_graph = this;
@ //
@ //		let i_test_s = i_s;
@ //		@{each_sp()}
@ //			if(i_test_p === i_p) {
@ //				let i_data_s_po = k_graph.idx_s_po[i_s-1][c_offset_data_sp];
@ //				let a_terms = [];
@ //				for(;;) {
@ //					let i_test_o = k_graph.data_s_po[i_data_s_po];
@ //					if(!i_test_o) break;
@ //					a_terms.push(k_graph.o(i_test_o));
@ //					i_data_s_po++;
@ //				}
@ //				console.log(`${s_n3_s} ${s_n3_p} ${a_terms.map(h=>h.toNT()).join(',\n\t')}`)
@ //				debugger;
@ //			}
@ //		@{end_each()}
@ //	}
@ //
@ //	pls(s_n3_p, s_content, z_datatype_or_lang) {
@ //		let i_p = this.find_p(s_n3_p);
@ //
@ //		let k_graph = this;
@ //
@ //		// prep to find word in dict
@ //		let s_word = '"'+s_content;
@ //		if('string' === typeof z_datatype_or_lang) {
@ //			s_word = '@'+z_datatype_or_lang+s_word;
@ //		}
@ //		else if('object' === typeof z_datatype_or_lang) {
@ //			s_word = '^'+z_datatype_or_lang+s_word;
@ //		}
@ //
@ //		// terminus
@ //		s_word += '\u0000';
@ //
@ //		// turn string into word
@ //		let a_word = encode_utf_8(s_word);
@ //
@ //		// cache word length
@ //		let n_word = a_word.length;
@ //
@ //		// searchs literals dict
@ //		let a_dict_l = k_graph.dict_l;
@ //		@ // @{dict_find('l')}
@ //		@ // 	let i_o = k_graph.count_d + k_graph.count_o + c_item_l;
@ //
@ //		@ // 	let i_test_p = i_p;
@ //		@ // 	@{each_po()}
@ //		@ // 		if(i_test_o === i_o) {
@ //		@ // 			let i_data_p_os = k_graph.idx_p_os[i_p-1][c_offset_data_po];
@ //		@ // 			let a_terms = [];
@ //		@ // 			for(;;) {
@ //		@ // 				let i_test_s = k_graph.data_p_os[i_data_p_os];
@ //		@ // 				if(!i_test_s) break;
@ //		@ // 				a_terms.push(k_graph.s(i_test_s));
@ //		@ // 				i_data_p_os++;
@ //		@ // 			}
@ //		@ // 			console.log(`${k_graph.o(i_o).toNT()} ^${s_n3_p} ${a_terms.map(h=>h.toNT()).join(',\n\t')}`)
@ //		@ // 			debugger;
@ //		@ // 		}
@ //		@ // 	@{end_each()}
@ //		@ // @{dict_else('l')}
@ //
@ //		debugger;
@ //	}
@ //
@ //	pos(s_n3_p, s_n3_o) {
@ //		let i_p = this.find_p(s_n3_p);
@ //		let i_o = this.find_o(s_n3_o);
@ //
@ //		let k_graph = this;
@ //
@ //		let a_data_ab = k_graph.data_po;
@ //		let a_idx_ab = k_graph.idx_po;
@ //		let a_data_a_bc = k_graph.data_p_os;
@ //		let a_idx_a_bc = k_graph.idx_p_os;
@ //		let i_test_a = i_p;
@ //
@ //		// a_data_ab.slice(a_idx_ab[i_test_a-1], a_idx_ab[i_test_a]).forEach(i => console.log(k_graph.o(i).value));
@ //		@{each_ab()}
@ //			if(i_test_b === i_o) {
@ //				debugger;
@ //				let a_terms = [];
@ //				@{each_abc()}
@ //					a_terms.push(k_graph.s(i_test_c));
@ //				@{end_each()}
@ //				console.log(`${s_n3_p} ${s_n3_o} ${a_terms.map(h=>h.toNT()).join(',\n\t')}`)
@ //				break;
@ //			}
@ //		@{end_each()}
@ //	}

	s(i_subject) {
		// dual
		if(i_subject < this.range_d) {
			let ab_word = this.section_d.produce(i_subject);
			return this.word_to_node(ab_word);
		}
		// subject
		else if(i_subject < this.range_s) {
			let ab_word = this.section_s.produce(i_subject);
			return this.word_to_node(ab_word);
		}
		//
		else {
			throw 'invalid subject id: #'+i_subject;
		}
	}

	p(i_predicate) {
		let ab_word = this.section_p.produce(i_predicate);
		
		// ref 0th char
		let x_char = ab_word[0];

		// named node w/ absolute iri
		if(2 === x_char) {
			return graphy.namedNode(decode_utf_8(ab_word));
		}
		// named node w/ prefixed name
		else {
			// find prefix token
			let i_prefix_token = ab_word.indexOf(I_PREFIX_TOKEN);

			// decompose prefixed name's word from dictionary
			let s_prefix_id = decode_utf_8(ab_word.slice(0, i_prefix_token));
			let s_suffix = decode_utf_8(ab_word.slice(i_prefix_token+1));

			// produce named node from reconstructed iri
			return graphy.namedNode(this.prefixes[s_prefix_id]+s_suffix);
		}
	}

	o(i_object) {
		// dual
		if(i_object < this.range_d) {
			let ab_word = this.section_d.produce(i_object);
			return this.word_to_node(ab_word);
		}
		// object
		else if(i_object < this.range_o) {	
			let ab_word = this.section_o.produce(i_object);
			return this.word_to_node(ab_word);
		}
		// literal
		else {
			let ab_word = this.section_l.produce(i_object);

			// find start of content
			let i_content = ab_word.indexOf(34);

			// extract content
			let ab_content = ab_word.slice(i_content + 1);

			// initialize literal with content
			let k_literal = graphy.literal(
				(ab_content[0] === I_UTF_16_TOKEN)
					? decode_utf_16le(ab_content.slice(1))  // word is utf-16le encoded
					: decode_utf_8(ab_content)  // word is utf-8 encoded
			);

			// determine primer
			let x_primer = ab_word[0];

			// literal has datatype
			if(94 === x_primer) {
				k_literal.datatype = this.word_to_node(ab_word.slice(1, i_content));
			}
			// literal has language tag
			else if(64 === x_primer) {
				k_literal.language = decode_utf_8(ab_word.slice(1, i_content));
			}

			//
			return k_literal;
		}
	}

	triple(i_s, i_p, i_o) {
		return this.s(i_s).value+' '+this.p(i_p).value+' '+this.o(i_o);
	}


	find_s(s_n3) {
		// prep to find word in dict
		let s_word = '';
		@{compress_n3_node(0)}

		// turn string into word
		let ab_word = encode_utf_8(s_word);

		// search for word in duals dict, then subjects dict
		return this.section_d.find(ab_word)
			|| this.section_s.find(ab_word);
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
		let ab_word = encode_utf_8(s_word)

		// search for word in predicates dict
		return this.section_p.find(ab_word);
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
			let ab_word = encode_utf_8(s_word)

			// search for word in duals dict, then objects dict
			return this.section_d.find(ab_word)
				|| this.section_o.find(ab_word);
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
			let ab_word = join_buffers(encode_utf_8(s_word), ab_content);
	
			// cache word length
			let n_word = ab_word.length;

			// search for word in literals dict
			return this.section_l.find(ab_word);
		}

		// predicate not found
		return 0;
	}

@ //	*quads() {
@ //		let k_graph = this;
@ //		@{abc('s', 'p', 'o')}
@ //		@{each_a()}
@ //			@{each_ab()}
@ //				@{each_abc()}
@ //					yield graphy.quad(
@ //						k_graph.s(i_test_a),
@ //						k_graph.p(i_test_b),
@ //						k_graph.o(i_test_c));
@ //				@{end_each()}
@ //			@{end_each()}
@ //		@{end_each()}
@ //	}

	// enters the graph
	enter() {
		return pattern.entrance(this);
	}
}


module.exports = LinkedGraph;

