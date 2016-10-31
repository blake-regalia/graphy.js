/* eslint-disable */
/* whitespace */

@ // import linker macros
@include 'linked.builder-js'

@set range_counter 0
@set range_name ''

@macro range(low, high)
	@{range_counter}() {
		if(@{low} === i_@{range_name}_id) {
			@if high
				i_@{range_name}_id = @{high};
				next_@{range_name}_id = h_@{range_name}_id_generators[@{range_counter+1}];
			@else
				return h_@{range_name}_id_generators[@{range_counter+1}]();
			@end
		}
		return String.fromCodePoint(i_@{range_name}_id++);
	},
	@set range_counter range_counter + 1
@end

@macro id_generator(name)
	@ // prep for external macro
	@set range_name name

	@ // reset index for multiple uses
	@set range_counter  0

	// starting index
	let i_@{name}_id = 0x41;

	// generators
	const h_@{name}_id_generators = {
		// [A-Z]
		@{range('0x5b', '0x61')}

		// [a-z]
		@{range('0x7b', '0xc0')}

		// [\u00c0-\u00d6]
		@{range('0xd7', '0xd8')}

		// [\u00d8-\u00f6]
		@{range('0xf7', '0xf8')}

		// [\u00f8-\u02ff]
		@{range('0x0300', '0x037F')}

		// [\u037f-\u01fff]
		@{range('0x2000', '0x02070')}

		// [\u2070-\u218f]
		@{range('0x2190', '0x2c00')}

		// [\u2c00-\u2fef]
		@{range('0x2fd0', '0x3001')}

		// [\u3001-\ud7ff]
		@{range('0xd800', '0xf900')}

		// [\uf900-\ufdcf]
		@{range('0xfdd0', '0xfdf0')}

		// [\ufdf0-\ufffd]
		@{range('0xfffe', '0x10000')}

		// [\u{10000}-\u{effff}]
		@{range('0xf0000')}

		@{range_counter}() {
			throw 'ran out of ids for "@{name}"!';
		},
	};

	// initialize
	let next_@{name}_id = h_@{name}_id_generators[0];
@end


@macro compress_named_node(position)
	// ref @{position} iri
	let p_@{position}_iri = h_@{position}.value;

	// determine actual best prefix
	let m_compress_@{position} = R_COMPRESS.exec(p_@{position}_iri);
	if(m_compress_@{position}) {
		// destruct prefix fragments
		let [, p_compress_prefix, s_compress_suffix] = m_compress_@{position};

		// ref/create prefix mapping
		let s_prefix_id = h_prefix_lookup[p_compress_prefix] = h_prefix_lookup[p_compress_prefix] || next_prefix_id();
		s_@{position}_id = s_prefix_id+':'+s_compress_suffix;
	}
	// unable to create prefix for @{position} iri
	else {
		// create dictionary entry; like canonicalized form but without closing angle bracket
		s_@{position}_id = '<'+p_@{position}_iri;
	}
@end


@macro compress_blank_node(position)
	// ref @{position} label
	let s_@{position}_label = h_@{position}.value;
	s_@{position}_id = h_label_lookup[s_@{position}_label] = h_label_lookup[s_@{position}_label] || next_label_id();
@end


@macro write_typed_array(array, variable_range, raw)
	@if variable_range
		// 1-byte indicating number of bytes per element of payload array
		d_transform.push(Buffer.from([@{array}.BYTES_PER_ELEMENT]), 'utf8')
	@end

	@if !raw
		// 4-byte indicating number number of elements in payload array
		let a_payload_@{array} = Uint32Array.from([@{array}.length]);
		let ab_payload_@{array} = Buffer.from(a_payload_@{array}.buffer, a_payload_@{array}.byteOffset, a_payload_@{array}.byteLength);
		if(!B_IS_LITTLE_ENDIAN) ab_payload_@{array}.swap32();
		d_transform.push(ab_payload_@{array}, 'utf8');
	@end

	// payload
	let ab_@{array} = Buffer.from(@{array}.buffer, @{array}.byteOffset, @{array}.byteLength);
	if(!B_IS_LITTLE_ENDIAN) {
		if(2 == ab_@{array}.BYTES_PER_ELEMENT) ab_@{array}.swap16();
		else if(4 == ab_@{array}.BYTES_PER_ELEMENT) ab_@{array}.swap32();
	}
	d_transform.push(ab_@{array}, 'utf8');

	@if raw
		// push single terminus byte
		d_transform.push(Buffer.from([0]), 'utf8');
	@end
@end



/**
* imports
**/

// native
const fs = require('fs');

// 
const LinkedGraph = require('./lazy-linked-graph.js');

/**
* constants:
**/

@{constants()}

// for obtaining the next adjacency item
const R_NEXT_ITEM = /([^\u0002]+)\u0002/y;
const R_NEXT_IRI = /(?:<([^\u0002]*)>|([^\u0002])+:([^\u0002]*))\u0002/y;

// platform is little endian
const B_IS_LITTLE_ENDIAN = (function() {
	let d_buffer = new ArrayBuffer(2);
	new DataView(d_buffer).setInt16(0, 256, true);
	return new Int16Array(d_buffer)[0] === 256;
})();


/**
* class:
**/
class Compressor {

	constructor(w_input, h_config) {
		// new graph
		const k_graph = new LinkedGraph();

		// number of triples in between progress events
		let n_progress_spacing = h_config.progress_spacing || (h_config.progress? 1e3: 0);

		// whether or not to optimize dictionary lookups
		let b_optimize_lookups = h_config.hasOwnProperty('optimize_lookups')? h_config.optimize_lookups: true;

		// HDT data structs
		let h_nodes = {};
		let c_nodes = 0;

		let h_predicates = {};
		let c_words_p = 0;

		let h_literals = {};
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


		// prep parse config
		let h_parse_config = Object.assign(h_config.parse_options || {}, {

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
					@{compress_named_node('subject')}
				}
				// subject is blank node
				else {
					@ // save to nodes and mark it appeared as object
					@{compress_blank_node('subject')}
				}

				@ // predicates section of dictionary
				@{compress_named_node('predicate')}


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
					let i_literal; 

					// canonicalize literal
					let s_literal_id = '"'+h_object.value;

					// literal has language tag
					if(h_object.hasOwnProperty('language')) {
						// add to literal's word
						s_literal_id = '@'+h_object.language+s_literal_id;
					}
					// literal is datatyped
					else if(h_object.hasOwnProperty('datatype')) {
						// ref datatype named node
						let h_datatype = h_object.datatype;

						// prep datatype word fragment
						let s_datatype_id;

						@ // create datatype id
						@{compress_named_node('datatype')}

						// add to literal's word
						s_literal_id = '^'+s_datatype_id+s_literal_id;
					}

					// append terminus
					s_literal_id += '\u0000';

					// first encounter of this node, store to node mapping
					if(undefined === h_literals[s_literal_id]) {
						h_literals[s_literal_id] = i_literal = c_words_l++;
					}
					// otherwise, fetch its id
					else {
						i_literal = h_literals[s_literal_id];
					}

					// record to adjancency list
					let a_list = h_adj_lists.l = h_adj_lists.l || [];
					a_list.push(i_literal);
				}
				// object a node
				else {
					let i_object;

					// named node
					if(h_object.isNamedNode) {
						@ // save to nodes and mark it appeared as object
						@{compress_named_node('object')}
					}
					// blank node
					else {
						@ // save to nodes and mark it appeared as object
						@{compress_blank_node('object')}
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
			end(d_transform) {

				// update count of how many triples there are in total
				c_triples_total += c_triples

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
					s_dict_p += s_predicate+'\u0000';

					// free to GC
					delete h_predicates[s_predicate];
				}

				// reduce predicates dict to Uint8Array 
				let a_dict_p = @{as_autf8('s_dict_p', true)}


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
						s_dict_d += s_node_id+'\u0000';

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
						s_dict_s += s_node_id+'\u0000';

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
						s_dict_o += s_node_id+'\u0000';

						// store remapped index
						a_remap[h_node.index] = c_words_d + (++c_words_o);

						// don't need key, or node!
						delete h_nodes[s_node_id];
					}
				}

				// reduce subjects and objects dictionaries from utf-16 strings to utf-8 Uint8Arrays
				let a_dict_s = @{as_autf8('s_dict_s', true)}
				let a_dict_o = @{as_autf8('s_dict_o', true)}


				// write literals to dictionary
				let s_dict_l = '';
				for(let s_literal in h_literals) {
					// append literal
					s_dict_l += s_literal;

					// free to GC
					delete h_literals[s_literal];
				}

				// reduce literals dict to Uint8Array
				let a_dict_l = @{as_autf8('s_dict_l', true)}


				// prep data storage (compact triples structure) for SP
				let n_data_sp_size = c_distinct_sp + c_words_d + c_words_s;
				let a_data_sp = @{mk_uint_array('n_data_sp_size', 'c_words_p')};
				let i_data_sp = 0;  // pointer for array above

				// prep data storage (compact triples structure) for SP_O
				let n_data_s_po_size = c_triples_total + c_distinct_sp;
				let n_objects = c_words_d + c_words_o + c_words_l;
				let a_data_s_po = @{mk_uint_array('n_data_s_po_size', 'n_objects')};
				let i_data_s_po = 0;  // pointer for array above

				// each free node; (only subject nodes left in free nodes)
				for(let i_fn in h_free_nodes) {
					let h_node = h_free_nodes[i_fn];

					// each {[predicate] => objects} in this subject's triples
					let h_pairs = h_node.pairs;
					for(let i_dict_p in h_pairs) {
						let h_objects = h_pairs[i_dict_p];

						// write predicate to list
						a_data_sp[i_data_sp++] = ~~i_dict_p + 1;

						// prep to sort object nodes (separate hops from sinks)
						let a_data_s_po_nodes = [];

						// each object node in this subject's triples
						let a_object_nodes = h_objects.n;
						for(let i_ in a_object_nodes) {
							// write remapped index value to adjacency list
							a_data_s_po_nodes.push(a_remap[a_object_nodes[i_]]);
						}

						// sort object nodes by node id
						a_data_s_po_nodes.sort((a, b) => a - b);

						// commit to data list and adjust offset accordingly
						a_data_s_po.set(a_data_s_po_nodes, i_data_s_po);
						i_data_s_po += a_data_s_po_nodes.length;

						// then, each literal in this subject's triples
						let a_object_literals = h_objects.l;
						for(let i_ in a_object_literals) {
							// copy literal's index value over offset by [object nodes segment] of dict
							a_data_s_po[i_data_s_po++] = c_words_d + c_words_o + a_object_literals[i_] + 1;
						}

						// terminate predicate's object adjacency group
						a_data_s_po[i_data_s_po++] = 0;
					}

					// terminate subject' predicate adjacency group
					a_data_sp[i_data_sp++] = 0;
				}


				// save everything
				Object.assign(k_graph, {
					count_triples: c_triples_total,

					prefixes: h_prefixes,
					prefix_lookup: h_prefix_lookup,
					user_prefixes: h_user_prefixes,

					data_sp: a_data_sp,
					data_s_po: a_data_s_po,
					// data_po: ,
					// data_po_s: ,
					// data_os: ,
					// data_os_p: ,

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

				// being used as transform
				if(!w_input && d_transform && 'function' === typeof d_transform.push) {
					// build prefixes bytes
					let a_prefixes = [];
					for(let s_prefix_id in h_prefixes) {
						let s_encoded = s_prefix_id+':'+h_prefixes[s_prefix_id]+'\0';
						a_prefixes.push.apply(a_prefixes, Array.from(Buffer.from(s_encoded)));
					}

					// convert to TypedArray
					let at_prefixes = Uint8Array.from(a_prefixes);

					// write to output
					@{write_typed_array('at_prefixes', false, true)}

					// write each dict section to output
					@{write_typed_array('a_dict_d')}
					@{write_typed_array('a_dict_s')}
					@{write_typed_array('a_dict_o')}
					@{write_typed_array('a_dict_l')}
					@{write_typed_array('a_dict_p')}

					// write each data section to output
					@{write_typed_array('a_data_sp', true)}
					@{write_typed_array('a_data_s_po', true)}
				}

				// ready event callback
				h_config.ready && h_config.ready(k_graph);
			}
		});

		// no input stream
		if(!w_input) {
			// return parser config
			this.operator = h_parse_config;
		}
		// indeed input stream
		else {
			if(!h_config.format || 'function' !== h_config.format.parse) {
				throw `config arg hash must include a valid "format"`;
			}
			else {
				this.operator = h_config.format.parse(w_input, h_parse_config);
			}
		}
	}

}

// module
module.exports = function(w_input=null, h_config={}) {
	// single argument
	if(1 === arguments.length) {
		// input is a hash, not a stream
		if('object' === typeof w_input && !w_input.setEncoding) {
			// shift args
			h_config = w_input;
			w_input = null;
		}
	}

	// 
	return (new Compressor(w_input, h_config)).operator;
};
