/* eslint-disable */

@ // import linker macros
@include 'linker-macros.builder-js'

/**
* imports
**/

// native
const fs = require('fs');

// local classes
const graphy = require('../main/graphy');


/**
* constants
**/

// for creating new prefixes
const R_COMPRESS = /^(.*?)([^/#]*)$/;

// for obtaining the next adjacency item
const R_NEXT_ITEM = /([^\u0002]+)\u0002/y;
const R_NEXT_IRI = /(?:<([^\u0002]*)>|([^\u0002])+:([^\u0002]*))\u0002/y;

@set ENV_NODE_JS true

@if ENV_BROWSER
	const D_UTF8_TEXT_ENCODER = new TextEncoder('utf-8');
@end

@macro as_autf8(str, nullify_var)
	@if ENV_BROWSER
		D_UTF8_TEXT_ENCODER.encode(@{str});
	@elseif ENV_NODE_JS
		Buffer.from(@{str});
	@end
	@if nullify_var
		// free string to GC
		@{str} = null;
	@end
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
		i_dict_@{which} = a_dict_@{which}.indexOf(2, i_dict_@{which}) + 1;
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
			s_word = s_n3+'\u0002';
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
			s_word = s_prefix_id+':'+m_compress[2]+'\u0002';
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
		s_word = s_prefix_id+':'+s_suffix+'\u0002';
	}
@end


@macro produce_node(kind, offset)
	// ref dict
	let a_dict_@{kind} = this.dict_@{kind};

	// find dict indexes
	@{'p' == kind? 'let ': ''}i_start = this.ref_@{kind}[i_vertex @{offset}];
	@{'p' == kind? 'let ': ''}i_stop = a_dict_@{kind}.indexOf(2, i_start + 1);

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


@macro each_object()
	// last element in path is actually predicate's data_p offset
	let c_offset_data_p = a_path.pop();

	// 3rd to last element is src node id
	let i_src_node = a_path[a_path.length - 2];

	// pull up object's data index
	let i_data_o = k_graph.idx_o[i_src_node - 1][c_offset_data_p];

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
		// remove path from set
		a_paths.splice(i_path, 1);

		// compensate for loop index counter and length
		i_path -= 1; n_iterable_paths -= 1;
	}
@end


@macro end_each()
	}
@end


/**
* class:
**/
class LinkedGraph {

	constructor(w_input, h_config) {

		// // 
		// this.compress = h_config.compress || 'compact';

		// w_input = `
		// 	<a> <p0> <b> .
		// 	<c> <p0> <d> .
		// 	<c> <p0> <a> .
		// 	<c> <p1> <b> .
		// 	<a> <p1> <d> .
		// 	<a> <p1> "hi" .
		// 	<a> <p1> "you" .
		// 	<c> <p0> "test" .
		// 	<e> <p1> <a> .
		// 	<a> <p0> <c> .
		// `;

		// ref to this
		const k_graph = this;

		// number of triples in between progress events
		let n_progress_spacing = h_config.progress_spacing || (h_config.progress? 1e3: 0);

		// whether or not to optimize dictionary lookups
		let b_optimize_lookups = h_config.hasOwnProperty('optimize_lookups')? h_config.optimize_lookups: true;

		// HDT data structs
		let h_nodes = {};
		let c_nodes = 0;

		let h_predicates = {};
		let c_words_p = 0;

		let s_dict_l = '';
		let c_words_l = 0;


		@ // id generators
		@{id_generator('prefix')}
		@{id_generator('label')}


		// prefix lookup mappings [prefix_iri] => dict_prefix_id
		let h_prefix_lookup = {};

		// label lookup mappings [label_name] => dict_label_id
		let h_label_lookup = {};

		// user prefix mappins [user_prefix_id] => dict_prefix_id
		let h_user_prefixes = {};

		// define user prefixes
		let h_inject_prefixes = h_config.prefixes;
		if(h_inject_prefixes) {
			for(let s_prefix_id in h_inject_prefixes) {
				// store mappings: [user_prefix_id] => dict_prefix_id, and [prefix_iri] => dict_prefix_id
				h_user_prefixes[s_prefix_id] = h_prefix_lookup[h_inject_prefixes[s_prefix_id]] = next_prefix_id();
			}
		}

		// count triples so we can make callbacks
		let c_triples_total = 0;
		let c_triples = 0;

		//
		let c_distinct_sp = 0;

		// prepare output
		h_config.resources.open_write('literals');


		// parse input
		graphy.@{FLAVOR}.parse(w_input, Object.assign(h_config.parse_options || {}, {

			// end of chunk
			progress(c_bytes_read) {

				// time for a progress update
				h_config.progress && h_config.progress(c_triples, c_bytes_read);

				// reset triple counter
				c_triples_total += c_triples;
				c_triples = 0;
			},

			// each triple
			data(h_triple) {

				// progress callback
				c_triples += 1;

				// ref all positions of triple
				let h_subject = h_triple.subject;
				let h_predicate = h_triple.predicate;
				let h_object = h_triple.object;

				//
				let s_subject_id;
				let s_predicate_id;
				let s_object_id;

				// subject is named node
				if(h_subject.isNamedNode) {
					@ // save to nodes and mark it appeared as subject
					@{compress_named_node('subject', 'nodes', 1)}
				}
				// subject is blank node
				else {
					@ // save to nodes and mark it appeared as object
					@{compress_blank_node('subject', 'nodes', 1)}
				}

				@ // predicates section of dictionary
				@{compress_named_node('predicate', 'predicates', 1)}


				//
				let i_predicate;

				// first encounter of predicate; create index and store it to hash
				if(undefined === h_predicates[s_predicate_id]) {
					i_predicate = h_predicates[s_predicate_id] = c_words_p++;
				}
				// otherwise, fetch its hash index
				else {
					i_predicate = h_predicates[s_predicate_id];
				}


				// prep ref to pairs
				let h_pairs;

				// first encounter of node; create index and store it to hash
				if(undefined === h_nodes[s_subject_id]) {
					h_pairs = (h_nodes[s_subject_id] = {index: c_nodes++, types: 1, pairs: {}}).pairs;
				}
				// otherwise, update types and fetch the pairs map
				else {
					let h_node = h_nodes[s_subject_id];
					h_node.types |= 1;
					h_pairs = h_node.pairs = h_node.pairs || {};
				}


				// add predicate to adjacency list
				let h_adj_lists = h_pairs[i_predicate] = h_pairs[i_predicate] || (c_distinct_sp++, {});
		
				// object is literal
				if(h_object.isLiteral) {
					// add canonicalized form to literals dict
					s_dict_l += h_object.toCanonical().replace(/\^\^(<[^"]+>)$/, () => {
						return '^A:datatype';
					})+'\u0002';

					// record to adjancency list
					let a_list = h_adj_lists.l = h_adj_lists.l || [];
					a_list.push(c_words_l++);
				}
				// object a node
				else {
					let i_object;

					// named node
					if(h_object.isNamedNode) {
						@ // save to nodes and mark it appeared as object
						@{compress_named_node('object', 'nodes', 2)}
					}
					// blank node
					else {
						@ // save to nodes and mark it appeared as object
						@{compress_blank_node('object', 'nodes', 2)}
					}

					// first encounter of this node, store to node mapping
					if(undefined === h_nodes[s_object_id]) {
						i_object = c_nodes++;
						h_nodes[s_object_id] = {index: i_object, types: 2};
					}
					// otherwise, update types and fetch index
					else {
						let h_node = h_nodes[s_object_id];
						h_node.types |= 2;
						i_object = h_node.index;
					}

					// record to adjacency list
					let a_list = h_adj_lists.n = h_adj_lists.n || [];
					a_list.push(i_object);
				}
			},

			// finished scanning input
			end() {
				console.log('\n');

				memory_usage('finished scanning');

				// update count of how many triples there are in total
				c_triples_total += c_triples

				// reduce literals dict to Uint8Array
				let a_dict_l = @{as_autf8('s_dict_l', true)}

				// create normal prefix map by inversing prefix lookup hash
				let h_prefixes = {};
				for(let p_prefix_iri in h_prefix_lookup) {
					let s_prefix_id = h_prefix_lookup[p_prefix_iri];
					h_prefixes[s_prefix_id] = p_prefix_iri;
					// delete h_prefix_lookup[p_prefix_iri];
				}

				// write predicates to dictionary
				let s_dict_p = '';
				for(let s_predicate in h_predicates) {
					// append to predicate portion of dictionary
					s_dict_p += s_predicate+'\u0002';

					// free to GC
					delete h_predicates[s_predicate];
				}

				// reducate predicates dict to Uint8Array 
				let a_dict_p = @{as_autf8('s_dict_p', true)}

				memory_usage('dumped predicates');

				// // write literals to dictionary
				// let s_dict_l = '';
				// for(let s_literal in h_literals) {
				// 	// append literal
				// 	s_dict_l += s_literal+'\u0002';
				// 	c_words_l += 1;

				// 	// free to GC
				// 	delete h_literals[s_literal];
				// }

				// prep node dictionary fragments
				let s_dict_d = '';
				let s_dict_s = '';
				let s_dict_o = '';

				// count items in each fragment
				let c_words_d = 0;
				let c_words_s = 0;
				let c_words_o = 0;

				//
				let h_free_nodes = {};

				//
				let a_remap = new Uint32Array(c_nodes);

				// each node; count how many duals and start remapping
				for(let s_node_id in h_nodes) {
					let h_node = h_nodes[s_node_id];

					// found a common subject-object (dual)
					if(3 === h_node.types) {
						// commit to dict
						s_dict_d += s_node_id+'\u0002';

						// store remapped index
						a_remap[h_node.index] = ++c_words_d;

						// don't need key anymore, but still need node
						h_free_nodes[c_words_d] = h_node;

						// free node!
						delete h_nodes[s_node_id];
					}
				}

				// reduce duals dictionary from utf-16 string to utf-8 Uint8Array
				let a_dict_d = @{as_autf8('s_dict_d', true)}

				// each node; remap subjects and objects using duals offset
				for(let s_node_id in h_nodes) {
					let h_node = h_nodes[s_node_id];

					// non-common subject
					if(1 === h_node.types) {
						// commit to dict
						s_dict_s += s_node_id+'\u0002';

						// store remapped index
						a_remap[h_node.index] = c_words_d + (++c_words_s);

						// don't need key anymore, but still need node
						h_free_nodes[c_words_d + c_words_s] = h_node;

						// free node!
						delete h_nodes[s_node_id];
					}
					// non-common object
					else if(2 === h_node.types) {
						// commit to dict
						s_dict_o += s_node_id+'\u0002';

						// store remapped index
						a_remap[h_node.index] = c_words_d + c_words_s + (++c_words_o);

						// don't need key, or node!
						delete h_nodes[s_node_id];
					}
				}

				// reduce subjects and objects dictionaries from utf-16 strings to utf-8 Uint8Arrays
				let a_dict_s = @{as_autf8('s_dict_s', true)}
				let a_dict_o = @{as_autf8('s_dict_o', true)}


				// prep data storage (compact triples structure) for predicates
				let a_data_p = new Uint32Array(c_distinct_sp + c_words_d + c_words_s);
				let i_data_p = 0;  // pointer for array above

				// prep data storage (compact triples structure) for objects
				let a_data_o = new Uint32Array(c_triples_total + c_distinct_sp);
				let i_data_o = 0;  // pointer for array above

				// each free node; (only subject nodes left in free nodes)
				for(let i_fn in h_free_nodes) {
					let h_node = h_free_nodes[i_fn];

					// each {[predicate] => objects} in this subject's triples
					let h_pairs = h_node.pairs;
					for(let i_dict_p in h_pairs) {
						let h_objects = h_pairs[i_dict_p];

						// write predicate to list
						a_data_p[i_data_p++] = ~~i_dict_p + 1;

						// prep to sort object nodes (separate hops from sinks)
						let a_data_o_nodes = [];

						// each object node in this subject's triples
						let a_object_nodes = h_objects.n;
						for(let i_ in a_object_nodes) {
							// write remapped index value to adjacency list
							a_data_o_nodes.push(a_remap[a_object_nodes[i_]]);
						}

						// sort object nodes by node id
						a_data_o_nodes.sort((a, b) => a - b);

						// commit to data list and adjust offset accordingly
						a_data_o.set(a_data_o_nodes, i_data_o);
						i_data_o += a_data_o_nodes.length;

						// then, each literal in this subject's triples
						let a_object_literals = h_objects.l;
						for(let i_ in a_object_literals) {
							// copy literal's index value over offset by [object nodes segment] of dict
							a_data_o[i_data_o++] = c_words_d  + c_words_s + c_words_o + a_object_literals[i_] + 1;
						}

						// terminate predicate's object adjacency group
						a_data_o[i_data_o++] = 0;
					}

					// terminate subject' predicate adjacency group
					a_data_p[i_data_p++] = 0;
				}

				memory_usage('constructed dictionaries');


				// save everything
				Object.assign(k_graph, {
					count_triples: c_triples_total,

					prefixes: h_prefixes,
					prefix_lookup: h_prefix_lookup,
					user_prefixes: h_user_prefixes,

					data_p: a_data_p,
					data_o: a_data_o,

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
				});


				// only if we're optimizing dictionary lookups
				if(b_optimize_lookups) {
					console.log('optimizing lookups...');
					console.time('indexing');

					// prep to find all items in adjacency list
					R_NEXT_ITEM.lastIndex = 0;
					let i_index;
					let i_item;

					@ // make dictionary references
					@{mk_ref('d')}
					@{mk_ref('s')}
					@{mk_ref('o')}
					@{mk_ref('l')}
					@{mk_ref('p')}

					memory_usage('created dictionary references');

					// make data indexes
					let n_all_source_nodes = c_words_d + c_words_s;
					let n_data_p_idx_range = a_data_p.length;
					@{mk_idx('p', 'n_all_source_nodes', 'n_data_p_idx_range')}

					// prep index lookup tree
					let a_idx_o = k_graph.idx_o = [];

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

					memory_usage('indexed dictionaries and data');
				}

				h_config.ready(k_graph);
			}
		}));
	}


	// resolves a word to its full iri
	resolve(s_word) {
		// iriref
		if('<' === s_word[0]) {
			// already in desired format
			return s_word;
		}
		// prefixed name
		else {
			// extract prefix / suffix
			let [s_prefix_id, s_suffix] = s_word.split(':');

			// resolve
			return '<'+this.prefixes[s_prefix_id]+s_suffix+'>';
		}
	}


	// enters the graph
	enter() {
		return new EmptyPath(this);
	}

	lookup_predicate(i_predicate) {
		let i_start = this.ref_p[i_predicate - 1];
		let i_stop = this.dict_p.indexOf(2, i_start + 1);
		return String.fromCharCode.apply(null, this.dict_p.slice(i_start, i_stop));
	}

	lookup_vertex(i_vertex) {
		let i_start; let i_stop;
		let c_category = this.count_d;
		if(i_vertex <= c_category) {
			i_start = this.ref_d[i_vertex - 1];
			i_stop = this.dict_d.indexOf(2, i_start + 1);
			return String.fromCharCode.apply(null, this.dict_d.slice(i_start, i_stop));
		}
		else if(i_vertex <= (c_category += this.count_s)) {
			i_start = this.ref_s[i_vertex - this.count_d - 1];
			i_stop = this.dict_s.indexOf(2, i_start + 1);
			return String.fromCharCode.apply(null, this.dict_s.slice(i_start, i_stop));
		}
		else if(i_vertex <= (c_category += this.count_o)) {
			i_start = this.ref_o[i_vertex - this.count_d - this.count_s - 1];
			i_stop = this.dict_o.indexOf(2, i_start + 1);
			return String.fromCharCode.apply(null, this.dict_o.slice(i_start, i_stop));
		}
		else {
			i_start = this.ref_l[i_vertex - this.count_d - this.count_s - this.count_o - 1];
			i_stop = this.dict_l.indexOf(2, i_start + 1);
			return String.fromCharCode.apply(null, this.dict_l.slice(i_start, i_stop));
		}
	}

	produce_predicate(i_predicate) {
		@{produce_node('p', '- 1', true)}
	}

	produce_vertex(i_vertex) {
		let i_start; let i_stop;
		let c_category = this.count_d;
		if(i_vertex <= c_category) {
			@{produce_node('d', '- 1')}
		}
		else if(i_vertex <= (c_category += this.count_s)) {
			@{produce_node('s', '- this.count_d - 1')}
		}
		else if(i_vertex <= (c_category += this.count_o)) {	
			@{produce_node('o', '- this.count_d - this.count_s - 1')}
		}
		else {
			// ref literals dict
			let a_dict_l = this.dict_l;

			//
			i_start = this.ref_l[i_vertex - this.count_d - this.count_s - this.count_o - 1];
			i_stop = a_dict_l.indexOf(2, i_start + 1);

			// find closing quote
			let i_closing_quote = a_dict_l.indexOf(34, i_start + 1);

			// make literal using value
			let k_literal = graphy.literal(String.fromCharCode.apply(null, a_dict_l.slice(i_start+1, i_closing_quote)));

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
}



class Bucket {
	constructor(a_paths=[], k_stem=null) {
		this.paths = a_paths;
		this.branches = [];
		this.stem = k_stem;
	}

	purge(i_path) {
		// remove path from local list of paths
		this.paths.splice(i_path, 1);

		// bucket is now empty of paths
		if(!this.paths.length) {
			// locate bucket's index in stem's bucket list
			let i_bucket = this.stem.buckets.indexOf(this);

			// delete the stem's parent's path associated with the empty bucket
			this.stem.parent.purge(i_bucket);
		}
		// bucket not empty
		else {
			// each branch
			let a_branches = this.branches;
			let n_branches = a_branches.length;
			for(let i_branch=0; i_branch<n_branches; i_branch++) {
				let k_branch = a_branches[i_branch];

				// delete entire bucket at that index
				k_branch.buckets.splice(i_path, 1);
			}
		}
	}
}


class Branch {
	constructor(k_parent_bucket, a_buckets=[]) {
		this.parent = k_parent_bucket;
		this.buckets = a_buckets;
		this.marked = [];

		// automatically add this branch to parent bucket
		if(k_parent_bucket) k_parent_bucket.branches.push(this);
		
		// set each child bucket's stem
		for(let i_bucket=0; i_bucket<a_buckets.length; i_bucket++) {
			a_buckets[i_bucket].stem = this;
		}
	}

	push(k_bucket) {
		this.buckets.push(k_bucket);

		// set child bucket's stem
		k_bucket.stem = this;
	}
}




//
class EmptyPath {

	constructor(k_graph) {
		this.graph = k_graph;

		// create root context
		this.context = new Branch(null, [new Bucket()]);
	}

	source(z_source) {
		// ref graph
		let k_graph = this.graph;

		// n3 string
		if('string' === typeof z_source) {
			let s_n3 = z_source;

			// prep to find word in dictionary
			let s_word_node = '';

			// iriref
			if('<' === s_n3[0]) {
				// separate into prefix / suffix
				let m_compress = R_COMPRESS.exec(s_n3.slice(1, -1));

				// cannot be compressed
				if(!m_compress) {
					// use iriref
					s_word_node = s_n3+'\u0002';
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
					s_word_node = s_prefix_id+':'+m_compress[2]+'\u0002';
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
				s_word_node = s_prefix_id+':'+s_suffix+'\u0002';
			}

			// reduce string to Uint8Array
			let a_word = @{as_autf8('s_word_node')}

			//
			let a_path = [];
			this.context.buckets[0].paths.push(a_path);

			// start in duals
			let a_dict_d = k_graph.dict_d;
			// search for word in duals dict
			@{dict_find('d')}
				a_path.push(c_item_d + 1);
				return new Sources(k_graph, this.context);
			@{dict_else('d')}

			// check subjects next
			let a_dict_s = k_graph.dict_s;
			// search for word in subjects dict
			@{dict_find('s')}
				a_path.push(k_graph.count_d + c_item_s + 1);
				return new Sources(k_graph, this.context);
			@{dict_else('s')}

			// check objects last
			let a_dict_o = k_graph.dict_o;
			// search for word in objects dict
			@{dict_find('o')}
				a_path.push(k_graph.count_d + k_graph.count_o + c_item_o + 1);
				return new Sources(k_graph, this.context);
			@{dict_else('o')}

			// not found
			return `not such node exists: <${k_graph.resolve(s_word_node.slice(0, -1))}>`;
		}
	}
}


class PathLeg {
	constructor(k_graph, h_context) {
		this.graph = k_graph;
		this.context = h_context;
	}

	mark(s_name) {
		// ref buckets
		let a_buckets = this.context.buckets;

		// empty
		if(!a_buckets.length) return this;

		// ref paths
		let a_paths = a_buckets[0].paths;

		// save path index to marked array
		if(a_paths.length && a_paths[0].length) {
			this.context.marked.push({
				index: a_paths[0].length - 1,
				name: s_name,
			});
		}

		// chain
		return this;
	}

	exit() {
		return new Selection(this.graph, this.context);
	}
}



class Sources extends PathLeg {
	constructor(k_graph, h_context) {
		super(k_graph, h_context);
	}

	cross(z_edge) {
		// ref graph
		let k_graph = this.graph;

		// ref prefix lookup
		let h_prefixes = k_graph.prefixes;

		// ref predicates dict
		let a_dict_p = k_graph.dict_p;

		// ref predicates data
		let a_data_p = k_graph.data_p;

		// ref predicates data index
		let a_idx_p = k_graph.idx_p;

		// user wants to cross a single edge
		if('string' === typeof z_edge) {
			let s_n3 = z_edge;

			// prep to find word in dict
			let s_word = '';
			@{compress_n3_node()}

			// turn string into word
			let a_word = @{as_autf8('s_word')}

			// search for word in predicates dict
			@{dict_find('p')}

				@{each_bucket()}
					@{each_path()}
						// ref terminal node in path
						let i_node = a_path[a_path.length-1];

						@ // scan predicate data to test if given predicate belongs to node
						@{scan_data_p('i_node')}
							// indeed, this node has the given predicate
							if(c_item_p + 1 === i_test_p) {
								// append predicate to list
								a_path.push(i_test_p);

								// save the offset
								a_path.push(c_offset_data_p);

								// break sp loop
								break;
							}
							// reached end-of-adjacency-list; node does not have predicate
							else if(!i_test_p) {
								// purge path
								k_bucket.purge(i_path);

								// decrement path index and iteration length to compensate for deletion
								i_path -= 1; n_iterable_paths -= 1;

								// break sp loop
								break;
							}
						@{end_scan()}
					@{end_each()}
				@{end_each()}

				// 
				return new Edge(k_graph, this.context);
			@{dict_else('p')}

			// predicate not found
			return new Edge(k_graph, this.context);
		}
		// 
		else {
			throw 'multiple edge crossings';
		}
	}


	probe(z_probes) {
		// ref graph
		let k_graph = this.graph;

		// probe is array
		if(Array.isArray(z_probes)) {
			// each probe route
			for(let i_probe=0; i_probe<z_probes.length; i_probe++) {
				let f_probe = z_probes[i_probe];

				@{each_bucket()}
					// create new branch that stems from current bucket
					let k_branch = new Branch(k_bucket);

					@{each_path()}
						// ref terminal node from parent context
						let i_node = a_path[a_path.length-1];

						// add new bucket (sole node in new path in new list of paths) to list
						k_branch.push(new Bucket([[i_node]]));
					@{end_each()}

					// fire probe callback
					f_probe(new Sources(k_graph, k_branch));
				@{end_each()}
			}
		}
		// probe is hash
		else {
			// each probe
			for(let s_probe_edge in z_probes) {
				let f_probe = z_probes[s_probe_edge];

				// find predicate in dict
				let i_p = k_graph.find_p(s_probe_edge);

				// no such predicate, no need to call probe; all done here!
				if(!i_p) continue;

				@{each_bucket()}
					// create new branch that stems from current bucket
					let k_branch = new Branch(k_bucket);

					@{each_path()}
						// ref terminal hop from parent context
						let i_node = a_path[a_path.length-1];

						@ // scan each predicate in hop's data sp list
						@{scan_data_p('i_node')}
							// indeed, this hop has the given predicate
							if(i_p === i_test_p) {
								// add new bucket (sole [node, pred, offset_data_p] pair in new path in new list of paths) to list
								k_branch.push(new Bucket([[i_node, i_p, c_offset_data_p]]));

								// break sp loop
								break;
							}
							// reached end-of-adjacency-list; hop does not have predicate
							else if(!i_test_p) {
								// purge path
								k_bucket.purge(i_path);

								// decrement path index and iteration length to compensate for deletion
								i_path -= 1; n_iterable_paths -= 1;

								// break sp loop
								break;
							}
						@{end_scan()}
					@{end_each()}

					// fire probe callback
					f_probe(new Edge(k_graph, k_branch));
				@{end_each()}
			}
		}

		// chain
		return this;
	}
}





class Edge {
	constructor(k_graph, h_context) {
		this.graph = k_graph;
		this.context = h_context;
	}

	all() {
		// ref graph
		let k_graph = this.graph;

		@{each_bucket()}

			@{each_path()}

				@{each_object()}
				
					@{assimilate_object()}
				@{end_each()}
			@{end_each()}
		@{end_each()}

		//
		return new Bag(k_graph, this.context);
	}

	hops() {
		// ref graph
		let k_graph = this.graph;

		// anything below index is a dual (hop)
		let i_hops = k_graph.count_d;

		@{each_bucket()}
			@{each_path()}

				@{each_object()}
					// id of node indicates it IS a hop!
					if(i_object <= i_hops) {
						@{assimilate_object()}
					}
				@{end_each()}

				@{remove_unused_paths()}
			@{end_each()}
		@{end_each()}

		//
		return new Sources(k_graph, this.context);
	}

	literals() {
		// ref graph
		let k_graph = this.graph;

		// compute earliest possible literal index
		let i_non_literals = k_graph.count_d + k_graph.count_s + k_graph.count_o;

		@{each_bucket()}

			@{each_path()}

				@{each_object()}
					// id of object indicates it is a literal
					if(i_object > i_non_literals) {
						@{assimilate_object()}
					}
				@{end_each()}

				@{remove_unused_paths()}
			@{end_each()}
		@{end_each()}

		//
		return new Bag(k_graph, this.context);
	}
}


class Bag extends PathLeg {
	constructor(k_graph, h_context) {
		super(k_graph, h_context);
	}

	match(s_n3) {
		// ref graph
		let k_graph = this.graph;

		// prep to find word in dict
		let s_word = '';
		@{compress_n3_node()}

		// turn string into word
		let a_word = @{as_autf8('s_word')}

		// searchs duals dict
		let a_dict_d = k_graph.dict_d;
		@{dict_find('d')}
			return this._match(c_item_d + 1);
		@{dict_else('d')}

		// search subjects dict
		let a_dict_s = k_graph.dict_s;
		@{dict_find('s')}
			return this._match(k_graph.count_d + c_item_s + 1);
		@{dict_else('s')}

		// search object nodes dict
		let a_dict_o = k_graph.dict_o;
		@{dict_find('o')}
			return this._match(k_graph.count_d + k_graph.count_s + c_item_o + 1);
		@{dict_else('o')}

		// search literals dict
		let a_dict_l = k_graph.dict_l;
		@{dict_find('l')}
			return this._match(k_graph.count_d + k_graph.count_s + k_graph.count_o + c_item_l + 1);
		@{dict_else('l')}

		// 
		throw 'nart ferrnd';
	}

	_match(i_object) {
		@{each_bucket()}
			@{each_path()}
				// path has mismatched object
				if(a_path[a_path.length-1] !== i_object) {
					// purge path
					k_bucket.purge(i_path);

					// compensate for loop index counter and length
					i_path -= 1; n_iterable_paths -= 1;
				}
			@{end_each()}
		@{end_each()}

		// done matching; continue chaining
		return this;
	}
}


class Selection {
	constructor(k_graph, h_context) {
		this.graph = k_graph;
		this.context = h_context;
	}

	build(a_branches, i_path, a_src_group) {
		// ref graph
		let k_graph = this.graph;

		// each branch
		for(let i_branch=0; i_branch<a_branches.length; i_branch++) {
			let k_branch = a_branches[i_branch];

			// ref marked
			let a_marked = k_branch.marked;
			let n_marks = a_marked.length;

			// jump straight to bucket associated with path index
			let k_bucket = k_branch.buckets[i_path];

			// for creating a new src group
			let a_new_src_group = [];

			// each of bucket's paths
			@{each_path()}

				// each src (fixed length)
				let n_srcs = a_src_group.length;
				for(let i_src=0; i_src<n_srcs; i_src++) {
					let h_src = a_src_group[i_src];

					// prep a new/reused row
					let h_row;

					// bucket has marks so it's worth creating a new row prototype
					if(n_marks) {
						// create a new pseudo row from src
						h_row = Object.create(h_src);

						// each mark
						for(let i_mark=0; i_mark<n_marks; i_mark++) {
							let h_mark = a_marked[i_mark];

							// ref path fix index
							let i_fix = h_mark.index;

							// thing is vertex
							if(0 === i_fix % 2) {
								// produce vertex and save to row at designated key
								h_row[h_mark.name] = k_graph.produce_vertex(a_path[i_fix]);
							}
							// thing is predicate
							else {
								// produce vertex and save to row at designated key
								h_row[h_mark.name] = k_graph.produce_predicate(a_path[i_fix]);
							}
						}
					}
					// nothing marked, just reuse existing src object reference
					else {
						h_row = h_src;
					}

					// bucket has branches
					let a_child_branches = k_bucket.branches;
					if(a_child_branches.length) {
						// create row group
						let h_row_group = [];

						// build out from this path
						this.build(a_child_branches, i_path, a_new_src_group);
					}
					// no branches (end of line)
					else {
						// add row to src group
						a_new_src_group.push(h_row);
					}
				}
			@{end_each()}

			// update src group
			a_src_group = a_new_src_group;
		}

		// 
		return a_src_group;
	}

	rows() {
		// local members
		let k_graph = this.graph;
		let h_prefix_lookup = k_graph.prefix_lookup;

		// prep list of results
		let a_rows = [];

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
					if(0 === i_fix % 2) {
						// produce vertex and save to row at designated key
						h_base[h_mark.name] = k_graph.produce_vertex(a_path[i_fix]);
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
						a_rows.push(a_row_group[i_row]);
					}
				}
				// root bucket is end-of-line
				else {
					// add base as row
					a_rows.push(h_base);
				}
			@{end_each()}
		@{end_each()}

		//
		return a_rows;
	}
}



// module
module.exports = function(w_input, h_config) {

	//
	return new LinkedGraph(w_input, h_config);
};



function memory_usage(s_key) {
	console.log(s_key);
	console.log(`	${(process.memoryUsage().rss / 1024 / 1024).toFixed(6)} MiB rss`);
	console.log(`	${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(6)} MiB heap used`);
}
