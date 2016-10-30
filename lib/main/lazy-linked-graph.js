/* eslint-disable */

@ // import linker macros
@include 'linked.builder-js'


@macro mk_ref(kind)
	// allocate array of indicies for @{kind}s' dictionary fragment
	let n_bytes_dict_@{kind} = a_dict_@{kind}.length;
	let a_ref_@{kind} = @{mk_uint_array('c_words_'+kind, 'n_bytes_dict_'+kind)};

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
	let a_idx_@{kind} = @{mk_uint_array(size, range)};

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
	@{'p' == kind? 'let ': ''}i_start = this.ref_@{kind}[@{'p' == kind? 'i_predicate': index} @{offset}];
	@{'p' == kind? 'let ': ''}i_stop = a_dict_@{kind}.indexOf(0, i_start + 1);

	// ref 0th char
	let x_char = a_dict_@{kind}[i_start];

	@if 'p' != kind
		// blank node
		if(32 === x_char) {
			return graphy.blankNode(String.fromCharCode.apply(null, a_dict_@{kind}.slice(i_start+1, i_stop)));
		}
	@end
	// absolute iri
	@{'p' == kind? '': 'else '}if(60 === x_char) {
		return graphy.namedNode(String.fromCharCode.apply(null, a_dict_@{kind}.slice(i_start+1, i_stop)));
	}
	// prefixed name
	else {
		// decompose prefixed name's word from dictionary
		let [s_prefix_id, s_suffix] = String.fromCharCode.apply(null, a_dict_@{kind}.slice(i_start, i_stop)).split(':');

		// produce named node from reconstructed iri
		return graphy.namedNode(this.prefixes[s_prefix_id]+s_suffix);
	}
@end



@macro dict_find(which, then)
	// dict index for @{which}
	let i_dict_@{which} = 0;

	// count how many elements are passed searching for element
	let c_item_@{which} = 0;
	do {
		// comparison
		let i_char = 0;
		while(i_char < a_word.length) {
			if(a_dict_@{which}[i_dict_@{which} + i_char] !== a_word[i_char++]) break;
		}

		// found it
		if(i_char >= a_word.length) {
	@if then
		@{then}
		@{dict_else(which)}
	@end
@end


@macro dict_else(which)
		}

		// advance pointer
		i_dict_@{which} = a_dict_@{which}.indexOf(0, i_dict_@{which}) + 1;
		c_item_@{which} += 1;
	} while(i_dict_@{which} > 0);
@end


@macro scan_data_sp(node)
	// search sp's adjacency list for predicate
	let c_offset_data_sp = 0;
	let i_data_sp_start = k_graph.idx_sp[@{node? node: i_node} - 1]; 
	while(true) {
		let i_test_p = k_graph.data_sp[i_data_sp_start + c_offset_data_sp];
@end


@macro end_scan()
		c_offset_data_sp += 1;
	}
@end





@macro compress_n3_node()
	// iriref
	if('<' === s_n3[0]) {
		// separate into prefix / suffix
		let m_compress = R_COMPRESS.exec(s_n3.slice(1, -1));

		// cannot be compressed
		if(!m_compress) {
			// use iriref
			s_word = s_n3.slice(0, -1)+'\u0000';
		}
		// compress by prefix id
		else {
			// lookup dict prefix from mapped user prefix
			let s_prefix_id = k_graph.user_prefixes[m_compress[1]];

			// prefix not exists
			if(!s_prefix_id) {
				throw `no such prefix "${m_compress[1]}"`;
			}

			// construct word using prefix
			s_word = s_prefix_id+':'+m_compress[2]+'\u0000';
		}
	}
	// prefixed name
	else {
		// extract prefix / suffix
		let [s_user_prefix, s_suffix] = s_n3.split(':');

		// lookup dict prefix from mapped user prefix
		let s_prefix_id = k_graph.user_prefixes[s_user_prefix];

		// prefix not exists
		if(!s_prefix_id) {
			throw `no such prefix "${s_user_prefix}"`;
		}

		// construct word using prefix
		s_word = s_prefix_id+':'+s_suffix+'\u0000';
	}
@end


@macro each_hop()
	let n_hops = k_graph.count_d;
	for(let i_hop=1; i_hop<=n_hops; i_hop++) {
@end


@macro each_a()
	for(let i_test_a=1; i_test_a<=n_a; i_test_a++) {
@end

@macro each_ab()
	// search ab's adjacency list for predicate
	let c_offset_data_ab = -1;
	let i_data_ab_start = a_idx_ab[i_test_a - 1];

	// each predicate in subject's ab adjacency list
	while(true) {
		// pull up b's id
		let i_test_b = a_data_ab[i_data_ab_start + (++c_offset_data_ab)];

		// reached end of adjacency list
		if(!i_test_b) break;

		@ // otherwise...
@end

@macro each_abc()
	// pull up c's data index
	let i_data_a_bc = a_idx_a_bc[i_test_a - 1][c_offset_data_ab];

	// each object pointed to by predicate
	while(true) {
		// pull up c's id
		let i_test_c = a_data_a_bc[i_data_a_bc++];

		// reach data c end-of-adjacency list; break loop
		if(!i_test_c) break;

		@ // otherwise...
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


@macro each_source()
	let n_sources = k_graph.count_d + k_graph.count_s;
	for(let i_source=1; i_source<=n_sources; i_source++) {
@end

@macro each_edge()
	// search sp's adjacency list for predicate
	let c_offset_data_sp = -1;
	let i_data_sp_start = k_graph.idx_sp[i_source - 1];

	// each predicate in subject's sp adjacency list
	while(true) {
		// pull up predicate's id
		let i_test_p = k_graph.data_sp[i_data_sp_start + (++c_offset_data_sp)];

		// reached end of adjacency list
		if(!i_test_p) break;

		@ // otherwise...
@end


@macro each_object()
	// pull up object's data index
	let i_data_s_po = k_graph.idx_s_po[i_source - 1][c_offset_data_sp];

	// each object pointed to by predicate
	while(true) {
		// pull up object's id
		let i_test_o = k_graph.data_s_po[i_data_s_po++];

		// reach data object end-of-adjacency list; break loop
		if(!i_test_o) break;

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
	}
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

	// count the size needed to store @{a}@{b}
	let c_data_ab_size = 0;
	let n_@{c} = @{count(c)}
	for(let i_test_@{c}=1; i_test_@{c}<=n_@{c}; i_test_@{c}++) {
			
		// search @{c}@{a}'s adjacency list for predicate
		let c_offset_data_@{c}@{a} = -1;
		let i_data_@{c}@{a}_start = k_graph.idx_@{c}@{a}[i_test_@{c} - 1];

		// each value in key's @{c}@{a} adjacency list
		while(true) {
			// pull up target's id
			let i_test_@{a} = k_graph.data_@{c}@{a}[i_data_@{c}@{a}_start + (++c_offset_data_@{c}@{a})];

			// reached end of adjacency list
			if(!i_test_@{a}) break;

			// pull up data index
			let i_data_@{c}_@{a}@{b} = k_graph.idx_@{c}_@{a}@{b}[i_test_@{c} - 1][c_offset_data_@{c}@{a}];

			// each @{b} pointed to by @{a}
			while(true) {
				// pull up @{b}'s id
				let i_test_@{b} = k_graph.data_@{c}_@{a}@{b}[i_data_@{c}_@{a}@{b}++];

				// reach data @{b} end-of-adjacency list; break loop
				if(!i_test_@{b}) break;

				// ref/create @{a}_n_@{b}@{c}
				let h_groups_@{a}_n_@{b}@{c} = a_groups_@{a}_@{b}@{c}[i_test_@{a}];
				if(!h_groups_@{a}_n_@{b}@{c}) {
					h_groups_@{a}_n_@{b}@{c} = a_groups_@{a}_@{b}@{c}[i_test_@{a}] = {};

					// terminating an adjacency list costs 1 item
					c_data_ab_size += 1;
				}

				// ref/create @{a}_@{b}@{c}_n
				let as_group_@{a}_@{b}@{c}_n = h_groups_@{a}_n_@{b}@{c}[i_test_@{b}];
				if(!as_group_@{a}_@{b}@{c}_n) {
					as_group_@{a}_@{b}@{c}_n = h_groups_@{a}_n_@{b}@{c}[i_test_@{b}] = new Set();

					// increment @{a}@{b} size counter
					c_data_ab_size += 1;
				}

				// push subject to @{a}_@{b}@{c} adjacency list
				as_group_@{a}_@{b}@{c}_n.add(i_test_@{c});
			}
		}
	}

	// prep adjacency lists
	let n_b = @{count(b)};
	let a_data_@{a}@{b} = k_graph.data_@{a}@{b} = @{mk_uint_array('c_data_ab_size', 'n_b')}
	let a_data_@{a}_@{b}@{c} = [];
	let c_data_a_bc_size = 0;

	let n_max_c = 0;

	// flatten @{a}@{b} groups into typed array adjaceny list
	let i_data_@{a}@{b} = 0;
	for(let i_@{a}=1; i_@{a}<=@{count(a)}; i_@{a}++) {
		// convert set to array
		let a_group_@{a}@{b}_n = [];
		let h_groups_@{a}_n_@{b}@{c} = a_groups_@{a}_@{b}@{c}[i_@{a}];
		for(let i_@{b} in h_groups_@{a}_n_@{b}@{c}) {
			a_group_@{a}@{b}_n.push(i_@{b});
		}

		// move contents of array into list
		a_data_@{a}@{b}.set(a_group_@{a}@{b}_n, i_data_@{a}@{b});

		// advance data pointer by number of elements inserted + list terminator
		i_data_@{a}@{b} += a_group_@{a}@{b}_n.length + 1;

		// each object in list
		// let h_groups_@{a}_n_@{b}@{c} = a_groups_@{a}_@{b}@{c}[i_@{a}];
		for(let i_@{b} in h_groups_@{a}_n_@{b}@{c}) {
			// accumulate adjacency list
			let a_data_@{a}_@{b}@{c}_n = [];

			// append set elements to array
			h_groups_@{a}_n_@{b}@{c}[i_@{b}].forEach((i_) => {
				a_data_@{a}_@{b}@{c}_n.push(i_);
				n_max_c = Math.max(i_, n_max_c);
			});

			a_data_@{a}_@{b}@{c}.push(a_data_@{a}_@{b}@{c}_n);

			// update length and add terminus
			c_data_a_bc_size += a_data_@{a}_@{b}@{c}_n.length + 1;
		}
	}


	let i_data_@{a}_@{b}@{c} = 0;
	let at_data_@{a}_@{b}@{c} = k_graph.data_@{a}_@{b}@{c} = @{mk_uint_array('c_data_a_bc_size', 'n_max_c')}
	for(let i_=0; i_<a_data_@{a}_@{b}@{c}.length; i_++) {
		at_data_@{a}_@{b}@{c}.set(a_data_@{a}_@{b}@{c}[i_], i_data_@{a}_@{b}@{c});

		// advance data pointer by number of elements inserted + list terminator
		i_data_@{a}_@{b}@{c} += a_data_@{a}_@{b}@{c}[i_].length + 1;
	}

	// allocate array of indicies for @{kind}s' triples fragment
	let n_a = @{count(a)};
	let n_data_ab = a_data_@{a}@{b}.length;
	let a_idx_@{a}@{b} = @{mk_uint_array('n_a', 'n_data_ab')};

	// fill array
	let i_index = 0;
	let i_item = -1;
	do {
		a_idx_@{a}@{b}[i_index++] = (++i_item);
		i_item = a_data_@{a}@{b}.indexOf(0, i_item);
	} while(i_index < n_a);

	// store to instance
	this.idx_@{a}@{b} = a_idx_@{a}@{b};


	// prep index lookup tree
	let a_idx_@{a}_@{b}@{c} = this.idx_@{a}_@{b}@{c} = [];

	// prep to scan entire data subjects list
	i_data_@{a}_@{b}@{c} = 0;

	// each predicate node
	for(let i_@{a}=0; i_@{a}<k_graph.count_p; i_@{a}++) {
		// grow as we go
		let a_idx_@{a}_@{b}@{c}_n = [];

		// compute maximum index
		let i_max_data_@{a}@{b} = (a_idx_@{a}@{b}[i_@{a} + 1] || a_data_@{a}@{b}.length) - 1;

		// prep to store largest index
		let i_largest = 0;

		// each object in predicate's adjacency list
		let i_data_@{a}@{b} = a_idx_@{a}@{b}[i_@{a}];
		do {
			// add data subject offset
			a_idx_@{a}_@{b}@{c}_n.push(i_data_@{a}_@{b}@{c});

			// track last used index
			i_largest = i_data_@{a}_@{b}@{c};

			// find end of data subject adjacency list
			while(at_data_@{a}_@{b}@{c}[i_data_@{a}_@{b}@{c}++]) {}
		} while(++i_data_@{a}@{b} < i_max_data_@{a}@{b});

		// take up as little memory as possible
		let d_typed_array = i_largest < 0x100
			? Uint8Array
			: (i_largest < 0x10000
				? Uint16Array
				: Uint32Array);

		// and save to index lookup tree
		a_idx_@{a}_@{b}@{c}.push(d_typed_array.from(a_idx_@{a}_@{b}@{c}_n));
	}

	console.timeEnd('@{a}@{b}@{c}');
@end




/**
* imports
**/

// native
const fs = require('fs');

// local classes
const graphy = module.parent.parent.exports;

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
	HP_USE_SPO,
	HP_USE_SPO,
	HP_USE_OSP,
	HP_USE_SPO,
	HP_USE_POS,
	HP_USE_POS,
	HP_USE_OSP,
	HP_USE_SPO,
];


class LinkedGraph {
	constructor(h_config) {
		Object.assign(this, {
			prefixes: {},
			prefix_lookup: {},
			user_prefixes: {},
		});
	}

	add_prefixes(h_prefixes) {
		let h_user_prefixes = this.user_prefixes;
		let h_prefix_lookup = this.prefix_lookup;

		// each prefix that a user wants to add
		for(let s_prefix_id in h_prefixes) {
			let s_prefix_iri = h_prefixes[s_prefix_id];

			// prefix iri indeed reflects existing prefix
			if(h_prefix_lookup[s_prefix_iri]) {
				h_user_prefixes[s_prefix_id] = h_prefix_lookup[s_prefix_iri];
			}
			// prefix iri not an interested prefix
			else {
				console.warn(`not interested in shallow prefix iri "${s_prefix_iri}"`);
			}
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

	mk_pos_raw() {
		console.time('pos');
		let k_graph = this;

		let a_groups_po = [];
		let a_groups_p_os = [];

		// count the size needed to store po
		let c_data_po_size = 0;

		@{each_s()}
			@{each_sp()}
				@{each_spo()}
					// ref/create po_n & p_os
					let as_group_po_n = a_groups_po[i_test_p];
					let h_groups_p_n_os = a_groups_p_os[i_test_p];
					if(!as_group_po_n) {
						as_group_po_n = a_groups_po[i_test_p] = new Set();
						h_groups_p_n_os = a_groups_p_os[i_test_p] = {};

						// terminating an adjacency list costs 1 item
						c_data_po_size += 1;
					}

					// ref/create p_os_n
					let as_group_p_os_n = h_groups_p_n_os[i_test_o];
					if(!as_group_p_os_n) {
						as_group_p_os_n = h_groups_p_n_os[i_test_o] = new Set();

						// set does not yet contain object
						if(!as_group_po_n.has(i_test_o)) {
							// push object to po adjacency list
							as_group_po_n.add(i_test_o);

							// increment po size counter
							c_data_po_size += 1;
						}
					}

					// push subject to p_os adjacency list
					as_group_p_os_n.add(i_test_s);
				@{end_each()}
			@{end_each()}
		@{end_each()}

		// prep adjacency lists
		let n_objects = k_graph.count_d + k_graph.count_o + k_graph.count_l;
		let a_data_po = k_graph.data_po = @{mk_uint_array('c_data_po_size', 'n_objects')}
		let a_data_p_os = [];
		let c_data_p_os_size = 0;

		let n_max_subject = 0;

		// flatten po groups into typed array adjaceny list
		let i_data_po = 0;
		for(let i_predicate=1; i_predicate<=k_graph.count_p; i_predicate++) {
			// convert set to array
			let a_group_po_n = [];
			a_groups_po[i_predicate].forEach((i_) => {
				a_group_po_n.push(i_);
			});

			// move contents of array into list
			a_data_po.set(a_group_po_n, i_data_po);

			// advance data pointer by number of elements inserted + list terminator
			i_data_po += a_group_po_n.length + 1;

			// each object in list
			let h_groups_p_n_os = a_groups_p_os[i_predicate];
			for(let i_object in h_groups_p_n_os) {
				// accumulate adjacency list
				let a_data_p_os_n = [];

				// append set elements to array
				h_groups_p_n_os[i_object].forEach((i_) => {
					a_data_p_os_n.push(i_);
					n_max_subject = Math.max(i_, n_max_subject);
				});

				a_data_p_os.push(a_data_p_os_n);

				// update length and add terminus
				c_data_p_os_size += a_data_p_os_n.length + 1;
			}
		}


		let i_data_p_os = 0;
		let at_data_p_os = k_graph.data_p_os = @{mk_uint_array('c_data_p_os_size', 'n_max_subject')}
		for(let i_=0; i_<a_data_p_os.length; i_++) {
			at_data_p_os.set(a_data_p_os[i_], i_data_p_os);

			// advance data pointer by number of elements inserted + list terminator
			i_data_p_os += a_data_p_os[i_].length + 1;
		}

		// make po index
		let i_index, i_item;
		@{mk_idx('po', 'k_graph.count_p', 'a_data_po.length')}


		// prep index lookup tree
		let a_idx_p_os = this.idx_p_os = [];

		// prep to scan entire data subjects list
		i_data_p_os = 0;

		// each predicate node
		for(let i_predicate=0; i_predicate<k_graph.count_p; i_predicate++) {
			// grow as we go
			let a_idx_p_os_n = [];

			// compute maximum index
			let i_max_data_po = (a_idx_po[i_predicate + 1] || a_data_po.length) - 1;

			// prep to store largest index
			let i_largest = 0;

			// each object in predicate's adjacency list
			let i_data_po = a_idx_po[i_predicate];
			do {
				// add data subject offset
				a_idx_p_os_n.push(i_data_p_os);

				// track last used index
				i_largest = i_data_p_os;

				// find end of data subject adjacency list
				while(at_data_p_os[i_data_p_os++]) {}
			} while(++i_data_po < i_max_data_po);

			// take up as little memory as possible
			let d_typed_array = i_largest < 0x100
				? Uint8Array
				: (i_largest < 0x10000
					? Uint16Array
					: Uint32Array);

			// and save to index lookup tree
			a_idx_p_os.push(d_typed_array.from(a_idx_p_os_n));
		}

		console.timeEnd('pos');
		debugger;
	}

	debug() {
		let k_graph = this;
		let a_dict_s = [];
		@{each_s()}
			a_dict_s.push(this.produce_subject(i_test_s));
		@{end_each()}

		let a_dict_p = [];
		@{each_p()}
			a_dict_p.push(this.produce_predicate(i_test_p));
		@{end_each()}

		let a_dict_o = [];
		@{each_o()}
			a_dict_o.push(this.produce_object(i_test_o));
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

	s(s_n3_s) {
		let i_s = this.find_s(s_n3_s);
		let k_graph = this;
		k_graph.idx_sp
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
		let a_word = @{as_autf8('s_word')};

		// searchs literals dict
		let a_dict_l = k_graph.dict_l;
		@{dict_find('l')}
			let i_o = k_graph.count_d + k_graph.count_o + c_item_l + 1

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

	p(i_predicate) {
		@{produce_node('p', '- 1')}
	}

	s(i_subject) {
		let i_start; let i_stop;
		let c_category = this.count_d;
		// dual
		if(i_subject <= c_category) {
			@{produce_node('d', '- 1', 'i_subject')}
		}
		// subject
		else if(i_subject <= (c_category += this.count_s)) {	
			@{produce_node('s', '- this.count_d - 1', 'i_subject')}
		}
		//
		else {
			throw 'invalid subject id: #'+i_subject;
		}
	}

	o(i_object) {
		let i_start; let i_stop;
		let c_category = this.count_d;
		// dual
		if(i_object <= c_category) {
			@{produce_node('d', '- 1', 'i_object')}
		}
		// object
		else if(i_object <= (c_category += this.count_o)) {	
			@{produce_node('o', '- this.count_d - 1', 'i_object')}
		}
		// literal
		else {
			// ref literals dict
			let a_dict_l = this.dict_l;

			//
			i_start = this.ref_l[i_object - this.count_d - this.count_o - 1];
			i_stop = a_dict_l.indexOf(0, i_start);

			// find start of content
			let i_content = a_dict_l.indexOf(34, i_start) + 1;

			// initialize literal with content
			let k_literal = graphy.literal(String.fromCharCode.apply(null, a_dict_l.slice(i_content, i_stop)))

			// determine primer
			let x_primer = a_dict_l[i_start];

			// literal has datatype
			if(94 === x_primer) {
				k_literal.datatype = String.fromCharCode.apply(null, a_dict_l.slice(i_start + 1, i_content-1));
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
		return this.produce_subject(i_s).value+' '+this.produce_predicate(i_p).value+' '+this.produce_object(i_o);
	}


	find_s(s_n3) {
		// ref graph
		let k_graph = this;

		// ref dicts
		let a_dict_d = this.dict_d;
		let a_dict_s = this.dict_s;

		// prep to find word in dict
		let s_word = '';
		@{compress_n3_node()}

		// turn string into word
		let a_word = @{as_autf8('s_word')}

		// search for word in duals dict
		@{dict_find('d')}
			return c_item_d + 1;
		@{dict_else('d')}

		// search for word in subjects dict
		@{dict_find('s')}
			return k_graph.count_d + c_item_s + 1;
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
		@{compress_n3_node()}

		// turn string into word
		let a_word = @{as_autf8('s_word')}

		// search for word in predicates dict
		@{dict_find('p')}
			return c_item_p + 1;
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
		let s_word = '';
		@{compress_n3_node()}

		// turn string into word
		let a_word = @{as_autf8('s_word')}

		// search for word in duals dict
		@{dict_find('d')}
			return c_item_d + 1;
		@{dict_else('d')}

		// search for word in objects dict
		@{dict_find('o')}
			return k_graph.count_d + c_item_o + 1;
		@{dict_else('o')}

		// search for word in literals dict
		@{dict_find('l')}
			return k_graph.count_d + k_graph.count_o + c_item_l + 1;
		@{dict_else('l')}

		// predicate not found
		return 0;
	}

	// enters the graph
	enter() {
		return new EmptyPath(this);
	}

	diags() {
		console.log('count_d: '+this.count_d);
		console.log('count_s: '+this.count_s);
		console.log('count_o: '+this.count_o);
		console.log('count_l: '+this.count_l);
		console.log('count_p: '+this.count_p);
	}
}

Object.assign(LinkedGraph.prototype, {
	produce_subject: LinkedGraph.prototype.s,
	produce_predicate: LinkedGraph.prototype.p,
	produce_object: LinkedGraph.prototype.o,
});



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
		let a_word = @{as_autf8('s_word')};

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			k_context.append_id(c_item_d + 1, HP_SUBJECT);
			return new Sources(k_graph, k_context);
		@{dict_else('d')}

		// search subjects dict
		let a_dict_s = k_graph.dict_s;
		@{dict_find('s')}
			k_context.append_id(k_graph.count_d + c_item_s + 1, HP_SUBJECT);
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
		let a_word = @{as_autf8('s_word')};

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			k_context.append_id(c_item_d + 1, HP_OBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('d')}

		// search objects dict
		let a_dict_s = k_graph.dict_o;
		@{dict_find('o')}
			k_context.append_id(k_graph.count_d + c_item_o + 1, HP_OBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('o')}
	}

	literal(s_content, z_datatype_or_lang) {
		let k_graph = this.graph;
		let k_context = this.context;

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
		let a_word = @{as_autf8('s_word')};

		// searchs literals dict
		let a_dict_l = k_graph.dict_l;
		@{dict_find('l')}
			k_context.append_id(k_graph.count_d + k_graph.count_o + c_item_l + 1, HP_OBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('l')}
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
				let a_word = @{as_autf8('s_word')};

				// searchs duals dict
				let a_dict_d = k_graph.dict_d;
				@{dict_find('d')}
					a_sources.push(c_item_d + 1);
				@{dict_else('d')}

				// search subjects dict
				let a_dict_s = k_graph.dict_s;
				@{dict_find('s')}
					a_sources.push(k_graph.count_d + c_item_s + 1);
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
			let a_word = @{as_autf8('s_word')};

			// search for word in predicates dict
			@{dict_find('p')}
				// append id to path
				k_context.append_id(c_item_p + 1, HP_PREDICATE);

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
			let a_word = @{as_autf8('s_word')};

			// search for word in predicates dict
			@{dict_find('p')}
				// append id to path
				k_context.append_id(c_item_p + 1, HP_INVERSE_PREDICATE);

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
		let a_word = @{as_autf8('s_word')};

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			k_context.append_id(c_item_d + 1, HP_OBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('d')}

		// search object nodes dict
		let a_dict_o = k_graph.dict_o;
		@{dict_find('o')}
			k_context.append_id(k_graph.count_d + c_item_o + 1, HP_OBJECT);
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
				let a_word = @{as_autf8('s_word')};

				// searchs duals dict
				let a_dict_d = k_graph.dict_d;
				@{dict_find('d')}
					a_ids.push(c_item_d + 1);
				@{dict_else('d')}

				// search object nodes dict
				let a_dict_o = k_graph.dict_o;
				@{dict_find('o')}
					a_ids.push(k_graph.count_d + c_item_o + 1);
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
		let a_word = @{as_autf8('s_word')};

		// search literals dict
		let a_dict_l = k_graph.dict_l;

		// treat literal as node; find every vertex that has that literal
		@{dict_find('l')}
			k_context.append_id(k_graph.count_d + k_graph.count_o + c_item_l + 1, HP_OBJECT);
			return new Bag(this.graph, k_context);
		@{dict_else('l')}
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
		let a_word = @{as_autf8('s_word')};

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			k_context.append_id(c_item_d + 1, HP_SUBJECT);
			return new Bag(k_graph, k_context);
		@{dict_else('d')}

		// search subject nodes dict
		let a_dict_s = k_graph.dict_s;
		@{dict_find('s')}
			k_context.append_id(k_graph.count_d + c_item_s + 1, HP_SUBJECT);
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
				let a_word = @{as_autf8('s_word')};

				// searchs duals dict
				let a_dict_d = k_graph.dict_d;
				@{dict_find('d')}
					a_ids.push(c_item_d + 1);
				@{dict_else('d')}

				// search subject nodes dict
				let a_dict_s = k_graph.dict_s;
				@{dict_find('s')}
					a_ids.push(k_graph.count_d + c_item_s + 1);
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
			let a_word = @{as_autf8('s_word')};

			// search for word in predicates dict
			@{dict_find('p')}
				// append id to path
				k_context.append_id(c_item_p + 1, HP_INVERSE_PREDICATE);

				//
				return new InverseEdge(k_graph, k_context);
			@{dict_else('p')}

			// predicate does not exist
			throw 'pne';
		}

		throw 'non-string';
	}
}


@macro probes_to_edges()
	// prep hash to map [edge] => probe
	let h_edges = {};

	// each probe
	let a_probes = h_source.probes;
	let n_probes = a_probes.length;
	for(let i_probe=0; i_probe<n_probes; i_probe++) {
		let i_edge = a_probes[i_probe][0].id;

		// there can only be a single probe per edge anyway; slice remainder path
		h_edges[i_edge] = a_probes[i_probe].slice(1);
	}
@end


@macro init_row()
	let h_source_row = {
		[s_source_mark]: k_graph.produce_subject(i_source),
	};
@end

@macro find_probe_edge()
	// whether or not to accept this path
	let b_accept = 1;

	// count how many probe attempts so we know when to stop
	let c_tried = 0;
	let a_gather = [];

	@ // each predicate belonging to this source node
	@{scan_data_sp('i_source')}
		// reached end of adjacency list
		if(!i_test_p) break;

		// found one of the necessary probe edges
		else if(h_probes[i_test_p]) {
@end

@macro end_find_probe_edge()
		}
	@{end_scan()}
@end



@macro extend_row(src, dest, type, push)
	h_@{dest}_row = Object.create(h_@{src}_row);
	h_@{dest}_row[s_@{dest}_mark] = k_graph.produce_@{type}(i_@{dest});
	@if push
		a_rows.push(h_@{dest}_row);
	@end
@end




@macro if_marked(which, no_shift)
	@if !no_shift
		// ref @{which}
		let h_@{which} = k_context.shift();
	@end

	// @{which} is marked
	let s_@{which}_mark = h_@{which}.mark;
	if(s_@{which}_mark) {
@end

@macro if_k1(which)
	// K_@{which}[1]
	if(h_@{which}.id) {
		let i_@{which} = h_@{which}.id;
@end

@macro else_if_km(which, hash)
	}
	// K_@{which}[+]
	else if(h_@{which}.ids) {
		let @{hash? 'h': 'a'}_@{which}@{hash? '_ids': 's'} = h_@{which}.ids;
@end

@macro if_km(which, hash)
	// K_@{which}[+]
	if(h_@{which}.ids) {
		let @{hash? 'h': 'a'}_@{which}@{hash? '_ids': 's'} = h_@{which}.ids;
@end

@macro else_v(which)
	}
	// V_@{which}
	else {
		// ref @{which} type
		let hp_@{which}_type = h_@{which}.type;
@end


@macro else_unmarked()
	}
	// no @{which} mark
	else {
@end

@macro add_marks(m1, m2, m3)
	// prep id list
	let a_ids = [];

	// add to mark list
	a_marks.push(s_@{m1}_mark);
	@if m2
		a_marks.push(s_@{m2}_mark);
		@if m3
			a_marks.push(s_@{m3}_mark);
		@end
	@end
@end

@macro end_else()
	}
@end



@macro source_top()
	if(!k_context.length) {
		throw 'eop';
		// reached end of pattern (after probe)
		return a_rows;
	}

	@ // ?.s
	@{if_marked('source', true)}
		@set S_act EOP? 'init_row': 'mark'
		@{source_stomp()}

	@ // ?s
	@{else_unmarked('source')}
		@set S_act null
		@{source_stomp()}

	@{end_else()}
@end

@macro source_stomp()
	@ // K.s[1,+]
	@{if_km('source', false)}
		@set S_each 'id'
		@{edge_top()}

	@ // V.s
	@{else_v('source')}
		@ // V.s[all]
		if(HP_RANGE_ALL === hp_source_type) {
			@set S_each 'source'
			@{edge_top()}
		}
		@ // ??
		else {
			throw 'invalid';
		}

	@{end_else()}
@end


@macro edge_top()
	@ // ?.p
	@{if_marked('edge')}
		@set P_act 'extend'
		@{edge_stomp()}

	@ // ?p
	@{else_unmarked('edge')}
		@set P_act null
		@{edge_stomp()}

	@{end_else()}
@end


@macro edge_stomp()
	@set P_break true

	@ // K_p[1]
	@{if_k1('edge')}
		@set P_test 'i_test_p === i_edge'
		@{sink_top()}

	@set P_break false

	@ // K_p[+]
	@{else_if_km('edge', true)}
		@set P_test 'h_edge_ids[i_test_p]'
		@{sink_top()}

	@ // V_p
	@{else_v('edge')}
		@ // V.p[all]
		if(HP_RANGE_ALL === hp_edge_type) {
			@set P_test null
			@{sink_top()}
		}
		@ // ??
		else {
			throw 'invalid';
		}

	@{end_else()}
@end


@macro sink_top()
	@ // ?.o
	@{if_marked('sink')}
		@set O_act 'extend'
		@{sink_stomp()}

	@ // ?o
	@{else_unmarked('sink')}
		@set O_act 'push_row'
		@{sink_stomp()}

	@{end_else()}
@end

@macro sink_stomp()
	@set O_break true

	@ // K_o[1]
	@{if_k1('sink')}
		@set O_test 'i_test_o === i_sink'
		@{stomp()}

	@set O_break false

	@ // K_o[+]
	@{else_if_km('sink', true)}
		@set O_test 'h_sink_ids[i_test_o]'
		@{stomp()}

	@ // V_o
	@{else_v('sink')}
		@ // V_o[all]
		if(HP_RANGE_ALL === hp_sink_type) {
			@set O_test null
			@{stomp()}
		}
		@ // V_o[hops]
		else if(HP_RANGE_HOPS === hp_sink_type) {
			@set O_test 'i_test_o > i_duals && i_test_o <= i_hops'
			@{stomp()}
		}
		@ // V_o[nodes]
		else if(HP_RANGE_NODES === hp_sink_type) {
			@set O_test 'i_test_o <= i_hops'
			@{stomp()}
		}
		@ // V_o[literals]
		else if(HP_RANGE_LITERALS === hp_sink_type) {
			@set O_test 'i_test_o > i_hops'
			@{stomp()}
		}
		@ // ??
		else {
			throw 'invalid';
		}

	@{end_else()}
@end

@set S_CLOSE_BRACKET '}'

@macro stomp()
	// hi
@end

@macro stomp_hi()
	@if STOMP_IDS_ONLY

		@if S_each == 'id'
			@{each('source', 'i')}
		@elseif S_each == 'source'
			@{each_source()}	
		@end

			@if S_test
				if(@{S_test}) {
			@end

			@if S_act == 'init_row'
				@{init_row()}
			@elseif S_act == 'mark'
				a_marks.push(i_source);
			@end

			@{each_edge()}
				@if P_test
					if(@{P_test}) {
				@end

				@if P_act == 'extend'
					@{extend_row('source', 'edge', 'predicate')}
				@end
	@end
			
			@{each_object()}
				@if O_test
					if(@{O_test}) {
				@end

				@if O_act == 'extend'
					@{extend_row('edge', 'sink', 'object', true)}
				@elseif O_act == 'push_row'
					@if P_act
						a_rows.push(h_edge_row);
					@else
						a_rows.push(h_source_row);
					@end
				@elseif O_act == 'ids'
					a_ids.push(i_sink);
				@end

				@{O_test && O_break? 'break;': ''}
				@{O_test? S_CLOSE_BRACKET: ''}
			@{end_each()}

	@if STOMP_IDS_ONLY

				@{P_test && P_break? 'break;': ''}
				@{P_test? S_CLOSE_BRACKET: ''}
			@{end_each()}

			@{S_test? S_CLOSE_BRACKET: ''}
		
		@{S_each? S_CLOSE_BRACKET: ''}
	@end
@end


@macro handle_probes()
	// running list of all path combinations from source node
	let a_combos = [];

	@ // find each probe edge this source has
	@{find_probe_edge()}
		// copy probe path off this edge so we can mutate list for each path
		let k_context_frag = h_probes[i_test_p];

debugger;

		// collect rows for this path so we can combine them with gather list
		let a_collect = [];

		// accumulate all object ids for upcoming recursive call
		let a_ids = [];

		@set STOMP_IDS_ONLY true
		@set O_act 'ids'
		@{sink_stomp()}
		@set STOMP_IDS_ONLY false

		console.log('stop');
		debugger;

		// recurse
		this._build(k_context_frag, a_collect);

		// reject
		if(!a_collect.length) return [];

		// first result(s), put into combos
		if(!a_combos.length) {
			a_combos = a_collect;
		}
		// there are previous results to combine with
		else {
			// single result
			if(1 === a_collect.length) {
				// ref result
				let h_row = a_collect[0];

				// merge row into every existing combo
				@{each('combo')}
					Object.assign(a_combos[i_combo], h_row);
				@{end_each()}
			}
			// multiple results
			else {
				// do all combinations
				@{each('combo', 'h', 'combo_row')}
					@{each('collect', 'h', 'row')}
						Object.assign(h_combo_row, h_row);
					@{end_each()}
				@{end_each()}
			}
		}

		// no more edges to test for this source
		if(++c_tried === n_probes) {
			// commit gatherings to rows
			a_rows.push.apply(a_rows, a_combos);
		}
	@{end_find_probe_edge()}
@end


@macro mk_edge_iterator()
	// prep edge iterator
	let f_edges;

	// shift edge descriptor off front of queue
	let h_edge = k_context.shift();

	// ref edge's mark (undefined if not exists)
	let s_edge_mark = h_edge.mark;

	// Kp[1]
	if(h_edge.id) {
		let i_edge = h_edge.id;

		if(h_edge.inverse) {
			f_edges = function*(i_sink) {
				@ // find all occurances of sink
				let a_data_s_po = k_graph.data_s_po;
				let i_item_o = -1;
				while(true) {
					// find next match
					i_item_o = a_data_s_po.indexOf(i_sink, i_item_o + 1);

					// no more
					if(-1 === i_item_o) break;

					// find predicate offset
					let i_offset_p = a_data_s_po.lastIndexOf(0, i_item_o);
					debugger;
				}
			};
		}
		else {
			// mk edge iterator
			f_edges = function*(i_source) {	
				@ // each edge belonging to this source node
				@{each_edge()}
					// found the target edge
					if(i_edge === i_test_p) {
						yield [i_edge, c_offset_data_sp];
					}
				@{end_each()}
			};
		}
	}
	// Kp[+]
	else if(h_edge.ids) {
		let a_edge_ids = h_edge.ids;

		if(h_edge.inverse) {
			throw 'implement inverse edge finding for multiple ids';
		}
		else {
			// mk edge iterator
			f_edges = function*(i_source) {
				// copy edge list
				let a_edge_search = a_edge_ids.slice();

				@ // each edge belonging to this source node
				@{each_edge()}
					// found a target predicate 
					let i_found_edge = a_edge_search.indexOf(i_test_p);
					if(-1 !== i_found_edge) {
						// delete from search list
						a_edge_search.splice(i_found_edge, 1);

						// yield
						yield [i_test_p, c_offset_data_sp];
					}
				@{end_each()}
			};
		}
	}
	// Vp
	else {
		let hp_edge_type = h_edge.type;

		// Vp[all]
		if(HP_RANGE_ALL === hp_edge_type) {

			if(h_edge.inverse) {
				throw 'implement inverse edge finding for multiple ids';
			}
			else {
				// mk edge iterator
				f_edges = function*(i_source) {
					// each edge belonging to this source node
					@{each_edge()}
						yield [i_test_p, c_offset_data_sp];
					@{end_each()}
				};
			}
		}
		// ??
		else {
			throw 'invalid variable edge type. only expected {ALL}.';
		}
	}
@end


@macro mk_sink_iterator()
	// prep sink iterator
	let f_sinks;

	// shift sink descriptor off front of queue
	let h_sink = k_context.shift();

	// ref sink's mark (undefined if not exists)
	let s_sink_mark = h_sink.mark;

	// Kp[1]
	if(h_sink.id) {
		let i_sink = h_sink.id;

		// mk sink iterator
		f_sinks = function*(i_source, c_offset_data_sp) {
			// each object belonging to this sp
			@{each_object()}
				// make sure sink exists
				if(i_test_o === i_sink) {
					// then and only then, yield
					yield i_sink;

					// then exit
					break;
				}
			@{end_each()}
		};
	}
	// Kp[+]
	else if(h_sink.ids) {
		let a_sink_ids = h_sink.ids;

		// mk sink iterator
		f_sinks = function*(i_source, c_offset_data_sp) {
			// copy sink id list
			let a_sink_search = a_sink_ids.slice();

			// each object belonging to this sp
			@{each_object()}
				// found a target sink
				let i_found_sink = a_sink_search.indexOf(i_test_o);
				if(-1 !== i_found_sink) {
					// delete from search list
					a_sink_search.splice(i_found_sink, 1);

					// yield
					yield i_test_o;
				}
			@{end_each()}
		};
	}
	// Vp
	else {
		let hp_sink_type = h_sink.type;

		// Vp[all]
		if(HP_RANGE_ALL === hp_sink_type) {
			// mk sink iterator
			f_sinks = function*(i_source, c_offset_data_sp) {
				// each object belonging to this sp
				@{each_object()}
					yield i_test_o;
				@{end_each()}
			};
		}
		// Vp[hops]
		else if(HP_RANGE_HOPS === hp_sink_type) {
			// mk sink iterator
			f_sinks = function*(i_source, c_offset_data_sp) {
				let n_hops = k_graph.count_d;

				// each object belonging to this sp
				@{each_object()}
					// filter by sinks that are sources too (i.e., hops)
					if(i_test_o < n_hops) {
						yield i_test_o;
					}
				@{end_each()}
			};
		}
		// Vp[literals]
		else if(HP_RANGE_LITERALS === hp_sink_type) {
			// mk sink iterator
			f_sinks = function*(i_source, c_offset_data_sp) {
				let n_non_literals = k_graph.count_d + k_graph.count_o;

				// each object belonging to this sp
				@{each_object()}
					// filter by sinks that are literals
					if(i_test_o > n_non_literals) {
						yield i_test_o;
					}
				@{end_each()}
			};
		}
		// ??
		else {
			throw 'invalid sink';
		}
	}
@end


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
					let h_survivors = this.probe(k_context, a_rows, h_sim_c);
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
					let h_survivors = this.proceed(k_context.copy(), a_rows, h_row_c, h_sim_c);
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
				throw 'invalid variable source type. only expected {ALL, HOPS}';
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
				@{each_ab()}
					// found it!
					if(i_test_b === i_entity) {
						yield [i_entity, c_offset_data_ab];

						// stop searching
						break;
					}
				@{end_each()}
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
						yield [i_test_b, c_offset_data_ab];

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
					// search data table for given range
					@{each_ab()}
						// too low (not in range yet)
						if(i_test_b < i_start) continue;

						// too high (out of range)
						if(i_test_b > i_stop) break;

						// within range
						yield [i_test_b, c_offset_data_ab];
					@{end_each()}
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
						yield [i_test_b, c_offset_data_ab];
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
			return function*(i_test_a, c_offset_data_ab) {
				// search data table for given entity
				@{each_abc()}
					// found it!
					if(i_test_c === i_entity) {
						yield i_entity;

						// stop searching
						break;
					}
				@{end_each()}
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
			return function*(i_test_a, c_offset_data_ab) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();

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
			return function*(i_test_a, c_offset_data_ab) {
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

	consume(k_context, a_rows) {
		let k_graph = this.graph

		// head of triple pattern
		let h_head = k_context.shift();

		// // head is object
		// if(HP_OBJECT === h_head.type) {
		// 	// // body is not inverse..?
		// 	// if(!h_body.inverse) {
		// 	// 	throw 'cannot traverse an object in the normal direction';
		// 	// }

		// 	// Vo
		// 	if(h_head.range) {
		// 		x_triple_pattern |= 1;
		// 	}

		// 	// claim objects
		// 	h_o = h_head;
		// }
		// // head is subject
		// else {
		// 	// // body is not normal..?
		// 	// if(h_body.inverse) {
		// 	// 	throw 'cannot traverse a subject in the inverse direction';
		// 	// }

		// 	// Vs
		// 	if(h_head.range) {
		// 		x_triple_pattern |= 4;
		// 	}

		// 	// claim subjects
		// 	h_s = h_head;
		// }

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
				this.proceed(k_context_frag, a_probe_rows, {}, h_head);

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
			return this.proceed(k_context, a_rows, {}, h_head);
		}
	}

	probe(k_root_context, a_rows, h_head) {
		//
		let a_living = [];
		let h_survivors = {};

		// each probe
		let a_probes = h_head.probes;
		for(let i_probe=0; i_probe<a_probes.length; i_probe++) {
			let a_probe_rows_old = [];

			// destruct probe context
			let k_context_frag = a_probes[i_probe].copy();

			// zero path length under probe
			if(!k_context_frag.length) {
				console.warn('empty path under probe');
				continue;
			}

			// play out pattern within probe
			let h_alive = this.proceed(k_context_frag, a_probe_rows_old, {}, h_head);

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

			// // only if there are results
			// if(a_probe_rows.length) {
			// 	// nothing to combine with; set directly
			// 	if(!a_combine.length) {
			@ // 		@{each('probe_row', 'h')}
			// 			a_combine.push(h_probe_row);
			@ // 		@{end_each()}
			// 	}
			// 	// combinations
			// 	else {
			// 		for(let i_combine_row=a_combine.length-1; i_combine_row>=0; i_combine_row--) {
			// 			// take combine row out from array
			// 			let h_combine_row = a_combine[i_combine_row];
			// 			a_combine.splice(i_combine_row, 1);

			// 			// each probe row to combine
			// 			for(let i_probe_row=0; i_probe_row<a_probe_rows.length; i_probe_row++) {
			// 				let h_probe_row = a_probe_rows[i_probe_row];

			// 				// copy original combine row
			// 				let h_copy_row = Object.create(h_combine_row);

			// 				// set each property from probe onto copy row
			// 				for(let i_property in h_probe_row) {
			// 					h_copy_row[i_property] = h_probe_row[i_property];
			// 				}

			// 				// push copy back onto combine
			// 				a_combine.push(h_copy_row);
			// 			}
			// 		}
			// 	}
			// }
	}

	proceed(k_context, a_rows, h_row__, h_head) {
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
			@{mk_iterator('s', 'p', 'o')}
		}
		// POS
		else if(HP_USE_POS === hp_data_use) {
			@{mk_iterator('p', 'o', 's')}
		}
		// OSP
		else {
			@{mk_iterator('o', 's', 'p')}
		}

		// return which heads were used
		return h_results;
	}

	_build(k_context, a_rows) {
		let k_graph = this.graph;

		// ranges
		let i_duals = k_graph.count_d;
		let i_hops = k_graph.count_d + k_graph.count_o;

		//
		let h_source = k_context.shift();

		// probes
		if(h_source.probes) {
			// ref probes
			let h_probes = h_source.probes;

			// probes-first optimization
			if(h_source.probes_first) {
				throw 'probes first';
			}
			// triple-first
			else {
				@ // ?.s
				@{if_marked('source', true)}
					@ // K.s[1,+]
					@{if_km('source', false)}
						@ // each source in list of ids
						@{each('source', 'i')}
							@ // initialize virgin row from source node since it is marked
							@{init_row()}

							@{handle_probes()}
						@{end_each()}

					@ // V.s
					@{else_v('source')}
						@ // V.s[all]
						if(HP_RANGE_ALL === hp_source_type) {
							@ // each of all sources
							@{each_source()}
								@{handle_probes()}
							@{end_each()}
						}
						@ // ??
						else {
							throw 'invalid';
						}

					@{end_else()}

				@ // ?s
				@{else_unmarked('source')}

				@{end_else()}
			}
		}


		// $: end of pattern
		if(k_context.length < 3) {
			@set EOP true
			@{source_top()}

			// nothing more to do
			return a_rows;
		}
		@ // // ...: more pattern
		@ // else {
		@ // 	// for continuing next build
		@ // 	let a_ids = [];
		@ // 	let a_marks = [];
@ // 
		@ // 	@set EOP false
		@ // 	@{source_top()}
@ // 
		@ // 	// continue at next build
		@ // 	k_context.unshift({
		@ // 		ids: a_ids,
		@ // 	});
		@ // 	return this._build(k_context, a_rows);
		@ // }
	}


	style() {
		let k_graph = this.graph;
		let k_context = this.context;

		// prep final rows
		let a_rows = [];

		// source(s)
		let f_sources;
		let h_source = k_context.shift();
		let s_source_mark = h_source.mark;

		// Ks[1]
		if(h_source.id) {
			let i_source = h_source.id;

			// mk source iterator
			f_sources = function*() {
				// simply return source node id (already known to be a valid source)
				yield i_source;
			};
		}
		// Ks[+]
		else if(h_source.ids) {
			let a_source_ids = h_source.ids;

			// mk source iterator
			f_sources = function*() {
				// simply iterate each source node id (already known to be valid sources)
				yield* a_source_ids;
			};
		}
		// Vs
		else {
			let hp_source_type = h_source.type;

			// Vs[all]
			if(HP_RANGE_ALL === hp_source_type) {
				// mk source iterator
				f_sources = function*() {
					// each and every source node
					@{each_source()}
						yield i_source;
					@{end_each()}
				};
			}
			// Vs[hops]
			else if(HP_RANGE_HOPS === hp_source_type) {
				// mk source iterator
				f_sources = function*() {
					// each hop node
					@{each_hop()}
						yield i_hop;
					@{end_each()}
				};
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, HOPS}';
			}
		}

		// end-of-pattern?
		let b_eop = !k_context.length;

		// source has probes
		if(h_source.probes) {
			let h_probes = h_source.probes;

			// prep list to make combinations
			let a_combos = [];

			// probes-first optimization
			if(h_source.probes_first) {
				throw 'probes first';
			}
			// triple-first
			else {
				// prep to examine first probe
				let k_first_probe_context;

				// access iterator
				for(let s_probe_edge in h_probes) {
					// ref first probe's context
					k_first_probe_context = h_probes[s_probe_edge];

					// delete from hash
					delete h_probes[s_probe_edge];

					// exit loop
					break;
				}

				// prep list of source ids for later probes and pattern frags
				let a_source_ids = [];

				// prep list of probe row lists
				let a_probe_lists = [];

				// each primary source from pattern for first probe only
				for(let i_source of f_sources()) {
					// prep new source row
					let h_source_row = {};

					// source is marked; store value to edge row hash
					if(s_source_mark) h_source_row[s_source_mark] = k_graph.produce_subject(i_source);

					// prep to collect rows from probing source
					let a_probe_source_rows = [];

					// handle using recursive method
					this._build_style(k_first_probe_context.copy(), a_probe_source_rows, h_source_row, i_source);

					// probing this source succeeded
					if(a_probe_source_rows.length) {
						// add source id to list for future iterations
						a_source_ids.push(i_source);

						// append those rows to super rows list
						a_probe_lists.push(a_probe_source_rows);
					}
				}


				// each remaining probe
				for(let s_probe_edge in h_probes) {
					// ref context
					let k_probe_context = h_probes[s_probe_edge];

					// each valid source remaining
					@{each('source_id', 'i', 'source')}
						// prep collect rows from probing source
						let a_probe_source_rows = [];

						// prep new source row
						let h_source_row = {};

						// source is marked; store value to edge row hash
						if(s_source_mark) h_source_row[s_source_mark] = k_graph.produce_subject(i_source);

						// handle using recursive method
						this._build_style(k_probe_context.copy(), a_probe_source_rows, h_source_row, i_source);

						// probing source failed
						if(!a_probe_source_rows.length) {
							// remove source id from list
							a_source_ids.splice(i_source_id, 1);

							// remove probe results from corresponding list
							a_probe_lists.splice(i_source_id, 1);

							// decrement index to account for deletion
							i_source_id -= 1;
						}
						// probing source succeeded
						else {
							// prep to re-create probe list
							let a_recreate = [];

							// each previous corresponding probe list row
							let a_previous_rows = a_probe_lists[i_source_id];
							@{each('previous_row', 'h')}

								// combine with each latest probe result row
								@{each('probe_source_row', 'h')}

									// extend previous row
									let h_combined = Object.create(h_previous_row);

									// copy-ref entire probe row
									for(let s_key in h_probe_source_row) {
										h_combined[s_key] = h_probe_source_row[s_key];
									}

									// push to re-created list
									a_recreate.push(h_combined);
								@{end_each()}
							@{end_each()}

							// overwrite corresponding probe list w/ recreated rows
							a_probe_lists[i_source_id] = a_recreate;
						}
					@{end_each()}
				}

				// end-of-pattern
				if(!k_context.length) {
					// create results
					let a_rows = [];
					@{each('probe_list', 'a')}
						// by concatenating each probe list
						a_rows = a_rows.concat(a_probe_list);
					@{end_each()}

					//
					return a_rows;
				}
				// more pattern
				else {
					//
					let a_rows = [];

					// each source remaining
					@{each('source_id', 'i', 'source')}
						let a_probe_source_rows = a_probe_lists[i_source_id];

						this._combine(k_context.copy(), a_probe_source_rows, h_source_row, i_source);
					@{end_each()}
				}
			}
			// 
		}
		// source does not have probes
		else {
			@ // mk edge and sink iterators
			@{mk_edge_iterator()}
			@{mk_sink_iterator()}

			// end-of-pattern?
			b_eop = !k_context.length;

			// each primary source from pattern
			for(let i_source of f_sources()) {
				// prep new source row
				let h_source_row = {};

				// source is marked; store value to edge row hash
				if(s_source_mark) h_source_row[s_source_mark] = k_graph.produce_subject(i_source);

				// each edge from pattern
				for(let [i_edge, c_offset_data_sp] of f_edges(i_source)) {
					// prep edge row to extend / copy-ref source row
					let h_edge_row = h_source_row;

					// edge is marked
					if(s_edge_mark) {
						// extend source row
						h_edge_row = Object.create(h_source_row);
						
						// store value to edge row hash
						h_edge_row[s_edge_mark] = k_graph.produce_predicate(i_edge);
					}

					// each sink from pattern
					for(let i_sink of f_sinks(i_source, c_offset_data_sp)) {
						// prep sink row to extend / copy-ref sink row
						let h_sink_row = h_edge_row;

						// sink is marked
						if(s_sink_mark) {
							// extend edge row
							h_sink_row = Object.create(h_edge_row);

							// store value to sink row hash
							h_sink_row[s_sink_mark] = k_graph.produce_object(i_sink);
						}

						// end-of-pattern
						if(b_eop) {
							a_rows.push(h_sink_row);
						}
						// more pattern, sink must be a hop
						else {
							this._build_style(k_context.copy(), a_rows, h_sink_row, i_sink);
							// debugger;
						}

						// debugger;
					}
				}
			}
		}

		return a_rows;
	}

	_combine(k_context, a_rows, i_source) {
		let k_graph = this.graph;

		//
		@{mk_edge_iterator()}
		@{mk_sink_iterator()}

		// end-of-pattern?
		let b_eop = !k_context.length;

		// each edge from pattern
		for(let [i_edge, c_offset_data_sp] of f_edges(i_source)) {
			// prep edge row to extend / copy-ref source row
			let h_edge_row = h_source_row;

			// edge is marked
			if(s_edge_mark) {
				// extend source row
				h_edge_row = Object.create(h_source_row);
				
				// store value to edge row hash
				h_edge_row[s_edge_mark] = k_graph.produce_predicate(i_edge);
			}

			// each sink from pattern
			for(let i_sink of f_sinks(i_source, c_offset_data_sp)) {
				// prep sink row to extend / copy-ref sink row
				let h_sink_row = h_edge_row;

				// sink is marked
				if(s_sink_mark) {
					// extend edge row
					h_sink_row = Object.create(h_edge_row);

					// store value to sink row hash
					h_sink_row[s_sink_mark] = k_graph.produce_object(i_sink);
				}

				// end-of-pattern; push sink row to list
				if(b_eop) {
					a_rows.push(h_sink_row);
				}
				// more pattern, sink must be a hop; recurse on hop
				else {
					this._build_style(a_rows, h_sink_row, i_sink);
				}
			}  
		}
	}

	_build_style(k_context, a_rows, h_source_row, i_source) {
		let k_graph = this.graph;
		debugger;
		//
		@{mk_edge_iterator()}
		@{mk_sink_iterator()}

		// end-of-pattern?
		let b_eop = !k_context.length;

		// each edge from pattern
		for(let [i_edge, c_offset_data_sp] of f_edges(i_source)) {
			// prep edge row to extend / copy-ref source row
			let h_edge_row = h_source_row;

			// edge is marked
			if(s_edge_mark) {
				// extend source row
				h_edge_row = Object.create(h_source_row);
				
				// store value to edge row hash
				h_edge_row[s_edge_mark] = k_graph.produce_predicate(i_edge);
			}

			// each sink from pattern
			for(let i_sink of f_sinks(i_source, c_offset_data_sp)) {
				// prep sink row to extend / copy-ref sink row
				let h_sink_row = h_edge_row;

				// sink is marked
				if(s_sink_mark) {
					// extend edge row
					h_sink_row = Object.create(h_edge_row);

					// store value to sink row hash
					h_sink_row[s_sink_mark] = k_graph.produce_object(i_sink);
				}

				// more traversal awaits within probes
				if(h_sink.probes) {
					// for(let i_edh_sink.probes.
						throw 'moar';
				}
				// end-of-pattern; push sink row to list
				else if(b_eop) {
					a_rows.push(h_sink_row);
				}
				// more pattern, sink must be a hop; recurse on hop
				else {
					this._build_style(k_context, a_rows, h_sink_row, i_sink);
				}
			}  
		}
	}
}


module.exports = LinkedGraph;

