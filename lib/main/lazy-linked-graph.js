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
	// allocate array of indicies for @{kind}s' dictionary fragment
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


@macro scan_data_p(node)
	// search sp's adjacency list for predicate
	let c_offset_data_p = 0;
	let i_data_p_start = k_graph.idx_p[@{node? node: i_node} - 1]; 
	while(true) {
		let i_test_p = k_graph.data_p[i_data_p_start + c_offset_data_p];
@end


@macro end_scan()
		c_offset_data_p += 1;
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


@macro each_parent_path(access, cache_length)
	// each path
	let a_parent_paths = @{access? access: 'this.context.parent'}.paths;
	@if cache_length
		let n_iterable_parent_paths = a_parent_paths.length;
	@end
	for(let i_parent_path=0; i_parent_path<a_parent_paths.length; i_parent_path++) {
		let a_parent_path = a_parent_paths[i_parent_path];
@end


@macro each_bucket(src)
	// each bucket
	let a_buckets = @{src? src: 'this.context.buckets'};
	for(let i_bucket=a_buckets.length-1; i_bucket>=0; i_bucket--) {
		let k_bucket = a_buckets[i_bucket];
@end


@macro each_path(dynamic_length)
	// each path
	let a_paths = k_bucket.paths;
	@if !dynamic_length
		let n_iterable_paths = a_paths.length;
	@end
	for(let i_path=0; i_path<@{dynamic_length? 'a_paths.length': 'n_iterable_paths'}; i_path++) {
		let a_path = a_paths[i_path];
@end


@macro each_source()
	let n_sources = k_graph.count_d + k_graph.count_s;
	for(let i_source=1; i_source<=n_sources; i_source++) {
@end


@macro each_object()
	// pull up object's data index
	let i_data_o = k_graph.idx_o[i_source - 1][c_offset_data_p];

	// flag indicates whether or not original path was used
	let b_path_used = false;

	// each object pointed to by predicate
	while(true) {
		// pull up object's id
		let i_object = k_graph.data_o[i_data_o++];

		// reach data object end-of-adjacency list; break loop
		if(!i_object) break;

		@ // otherwise...
@end


@macro assimilate_object()
	// path hasn't been used yet
	if(!b_path_used) {
		// now it has
		b_path_used = true;

		// push object id to path
		a_path.push(i_object);
	}
	// this path was used, make a copy of the original instead
	else {
		// copy but remove object from first use 
		let a_path_copy = a_path.slice(0, -1);

		// push object id to path
		a_path_copy.push(i_object);

		// push new path to set
		a_paths.push(a_path_copy);
	}
@end


@macro remove_unused_paths()
	// path was not used
	if(!b_path_used) {
		// purge path from bucket
		k_bucket.purge(i_path, 1);

		// compensate for loop index counter and length
		i_path -= 1; n_iterable_paths -= 1;
	}
@end


@macro end_each()
	}
@end



/**
* imports
**/

// native
const fs = require('fs');

// local classes
const graphy = module.parent.parent.exports;

const H_STOMP_SOURCE = {};



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

			data_p: a_data_p,
			data_o: a_data_o,

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
		let n_data_p_idx_range = a_data_p.length;
		@{mk_idx('p', 'n_all_source_nodes', 'n_data_p_idx_range')}

		// prep index lookup tree
		let a_idx_o = this.idx_o = [];

		// prep to scan entire data objects list
		let i_data_o = 0;

		// each subject node
		for(let i_subject=0; i_subject<n_all_source_nodes; i_subject++) {

			// grow as we go
			let a_idx_o_n = [];

			// compute maximum index
			let i_max_data_p = (a_idx_p[i_subject + 1] || a_data_p.length - 1) - 1;

			// prep to store largest index
			let i_largest = 0;

			// each predicate in subject's adjacency list
			let i_data_p = a_idx_p[i_subject];
			do {
				// add data object offset
				a_idx_o_n.push(i_data_o);

				// track last used index
				i_largest = i_data_o;

				// find end of data object adjacency list
				while(a_data_o[i_data_o++]) {}
			} while(++i_data_p < i_max_data_p);

			// take up as little memory as possible
			let d_typed_array = i_largest < 0x100
				? Uint8Array
				: (i_largest < 0x10000
					? Uint16Array
					: Uint32Array);

			// and save to index lookup tree
			a_idx_o.push(d_typed_array.from(a_idx_o_n));
		}

		console.timeEnd('indexing');
	}

	produce_predicate(i_predicate) {
		@{produce_node('p', '- 1')}
	}

	produce_subject(i_subject) {
		let i_start; let i_stop;
		let c_category = this.count_d;
		// dual
		if(i_subject <= c_category) {
			@{produce_node('d', '- 1', 'i_subject')}
		}
		// subject
		else if(i_subject <= (c_category += this.count_s)) {	
			@{produce_node('o', '- this.count_d - 1', 'i_subject')}
		}
		//
		else {
			throw 'invalid subject id: #'+i_subject;
		}
	}

	produce_object(i_object) {
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

			// find closing quote
			let i_closing_quote = a_dict_l.indexOf(34, i_start + 1);

			// make literal using value
			let k_literal = graphy.literal(String.fromCharCode.apply(null, a_dict_l.slice(i_start, i_closing_quote)));

			// literal has datatype
			if(94 === a_dict_l[i_closing_quote+1]) {
				k_literal.datatype = String.fromCharCode.apply(null, a_dict_l.slice(i_closing_quote+2, i_stop));
			}
			// language
			else if(64 === a_dict_l[i_closing_quote+1]) {
				k_literal.language = String.fromCharCode.apply(null, a_dict_l.slice(i_closing_quote+2, i_stop));
			}

			//
			return k_literal;
		}
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



class PathLeg {
	constructor(k_graph, h_context) {
		this.graph = k_graph;
		this.context = h_context;
	}

	mark(s_name) {
		let a_pattern = this.context;

		// empty
		if(!a_pattern.length) return this;

		// save marking
		a_pattern[a_pattern.length-1].mark = s_name;

		// chain
		return this;
	}

	exit() {
		return new Selection(this.graph, this.context);
	}
}


//
class EmptyPath extends PathLeg {

	constructor(k_graph) {
		// create root context
		super(k_graph, []);
	}

	sources() {
		this.context.push({
			type: H_STOMP_SOURCE,
		});
		return new Sources(this.graph, this.context);
	}
}


class Sources extends PathLeg {
	constructor(k_graph, h_context) {
		super(k_graph, h_context);
	}

	probe(z_probes) {
		let a_pattern = this.context;

		let h_source = a_pattern[a_pattern.length - 1];

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

				// create new probe path
				let a_path = [i_p];
				a_probes.push(a_path);

				// fire probe callback
				f_probe(new Edge(k_graph, a_path));
			}
		}

		// chain
		return this;
	}
}


class Edge extends PathLeg {
	constructor(k_graph, h_context) {
		super(k_graph, h_context);
	}

	// select only the paths that lead to an exact node
	node(s_n3) {
		// ref graph
		let k_graph = this.graph;

		// prep to find word in dict
		let s_word = '';

		@{compress_n3_node()}

		// turn string into word
		let a_word = @{as_autf8('s_word')};

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			return this._append(c_item_d + 1);
		@{dict_else('d')}

		// search object nodes dict
		let a_dict_o = k_graph.dict_o;
		@{dict_find('o')}
			return this._append(k_graph.count_d + c_item_o + 1);
		@{dict_else('o')}
	}

	literal(s_n3) {
		// ref graph
		let k_graph = this.graph;

		// prep to find word in dict
		let s_word = s_n3.slice(1)+'\u0000';

		// turn string into word
		let a_word = @{as_autf8('s_word')};

		// search literals dict
		let a_dict_l = k_graph.dict_l;

		// treat literal as node; find every vertex that has that literal
		@{dict_find('l')}
			return this._append(k_graph.count_d + k_graph.count_o + c_item_l + 1);
		@{dict_else('l')}
	}

	_append(i_vertex) {
		let k_graph = this.graph;

		//
		this.context.push({
			id: i_vertex,
		});

		// done appending; continue chaining
		return new Bag();
	}
}

class Bag extends PathLeg {
	constructor(k_graph, k_context) {
		super(k_graph, k_context);
	}
}

class Selection {
	constructor(k_graph, h_context) {
		this.graph = k_graph;
		this.context = h_context;
	}

	*iterator() {
		// local members
		let k_graph = this.graph;
		let h_prefix_lookup = k_graph.prefix_lookup;

		//
		let k_root  = this.context;
		let a_marked = k_root.marked;

		//
		@{each_bucket()}
			@{each_path()}
				// prep base
				let h_base = {};

				// each mark
				for(let i_mark=0; i_mark<a_marked.length; i_mark++) {
					let h_mark = a_marked[i_mark];

					// ref path fix index
					let i_fix = h_mark.index;

					// thing is vertex
					if(0 === i_fix) {
						// produce subject node and save to row at designated key
						h_base[h_mark.name] = k_graph.produce_subject(a_path[i_fix]);
					}
					else if(0 === i_fix % 2) {
						// produce vertex and save to row at designated key
						h_base[h_mark.name] = k_graph.produce_object(a_path[i_fix]);
					}
					// thing is predicate
					else {
						// produce vertex and save to row at designated key
						h_base[h_mark.name] = k_graph.produce_predicate(a_path[i_fix]);
					}
				}

				// bucket has branches
				let a_branches = k_bucket.branches;
				if(a_branches.length) {
					// build out from this path
					let a_row_group = this.build(a_branches, i_path, [h_base]);
					
					// flatten row group
					let n_rows = a_row_group.length;
					for(let i_row=0; i_row<n_rows; i_row++) {
						yield a_row_group[i_row];
					}
				}
				// root bucket is end-of-line
				else {
					// add base as row
					yield h_base;
				}
			@{end_each()}
		@{end_each()}
	}

	rows() {
		// local members
		let k_graph = this.graph;
		let h_prefix_lookup = k_graph.prefix_lookup;

		// prep list of results
		let a_rows = [];

		//
		let a_pattern = this.context;

		//
		let n_steps = a_pattern.length;
		for(let i_step=0; i_step<n_steps; i_step++) {
			let h_step = a_pattern[i_step];

			// V * *
			if(H_STOMP_SOURCE === h_step.type) {
				let s_step_mark = h_step.mark;
				debugger;

				// probes: V -< K,K *
				if(h_step.probes) {
					let a_probes = h_step.probes.slice();

					//
					let h_edges = {};
					let n_probes = a_probes.length;
					for(let i_probe=0; i_probe<n_probes; i_probe++) {
						let i_edge = a_probes[i_probe][0];
						let a_group = h_edges[i_edge] = h_edges[i_edge] || [];
						a_group.push(a_probes[i_probe].slice(1));
					}

					@ // each source node
					@{each_source()}
						// prep row base
						let h_row = {};

						// marked
						if(s_step_mark) {
							h_row = {
								[s_step_mark]: k_graph.produce_subject(i_source),
							};
						}

						//
						let b_accept = 1;
						let c_tried = 0;
						let a_gather = [];

						@ // each predicate belonging to this source node
						scanning: {
							@{scan_data_p('i_source')}
								// found one of the necessary probe edges
								if(h_edges[i_test_p]) {
									// each probe path having this edge
									let a_group = h_edges[i_test_p];
									for(let i_probe=0; i_probe<a_group.length; i_probe++) {
										let a_path = a_group[i_probe];
										let a_combo = [];

										// continue hunting down path
										b_accept &= this.hunt(i_source, i_test_p, c_offset_data_p, a_path.slice(0), h_row, a_combo);

										// reject
										if(!b_accept) {
											break scanning;
										}
										// single results
										else if(1 === a_combo.length) {
											if(!a_gather.length) {
												a_gather.push(a_combo[0]);
											}
										}
										// multiple rows
										else {
											throw 'combinations';
										}

										// count how many probes have been attempted
										c_tried += 1;
									}

									// all probes have been explored
									if(c_tried === n_probes) break;
								}
								// reached end of adjacency list
								else if(!i_test_p) {
									break;
								}
							@{end_scan()}
						}

						// all probe edges have been found
						if(b_accept) {
							a_rows.push.apply(a_rows, a_gather);
						}
					@{end_each()}
				}
			}
		}

		//
		return a_rows;
	}

	hunt(i_source, i_edge, c_offset_data_p, a_path, h_row, a_rows) {
		let k_graph = this.graph;

		// ref target vertex
		let h_target = a_path.shift();

		//
		let s_target_mark = h_target.mark;

		// target has vertex id
		if(h_target.id) {
			let i_target = h_target.id;

			@ // each object in sp's adjacency list
			@{each_object()}
				// found target 
				if(i_object === i_target) {
					// vv this is pointless because the target is already known (maybe do it outside the loop)
					// // target is marked
					// if(s_target_mark) {
					// 	a_rows.push(Object.create(h_row, {
					// 		[s_target_mark]: k_graph.produce_object(i_object);
					// 	}));
					// }

					// change this later to continuing the hunt for predicate/object pairs
					if(!a_path.length) {
						a_rows.push(h_row);
					}
					else {
						throw 'more segments in path remain';
					}

					// all done
					return true;
				}
			@{end_each()}
		}
		else {
			throw 'dunno yet how to test for vertex that has no id';
		}

		return false;
	}
}


module.exports = LinkedGraph;

