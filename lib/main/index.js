/*eslint dot-notation:0, no-extra-parens:0*/

/**
* import:
**/


// native imports
// ...

// libraries
import classer from 'classer';
import jsonld from 'jsonld';
import rmprop from 'rmprop';
import arginfo from 'arginfo';
import rapunzel from 'rapunzel';

// local classes
// ...


/**
* private static:
**/

//
const A_ITERATION_METHODS = ['forEach', 'entries', 'every', 'some', 'filter', 'find', 'findIndex', 'keys', 'map', 'reduce', 'reduceRight', 'values'];

//
const map_array_interface = (z_object, a_input, f_map) => {

	// ref array prototype
	let d_proto = Array.prototype;

	// each iteration method
	A_ITERATION_METHODS.forEach((s_method) => {

		// implement iteration method
		z_object[s_method] = function() {

			// first, map each value to network node
			let a_mapped = d_proto.map.call(a_input, f_map);

			// now apply method to mapped array
			return d_proto[s_method].apply(a_mapped, arguments);
		};
	});

	// return modified object
	return z_object;
};


const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const H_IRI_RDF_NIL = {
	type: 'iri',
	iri: P_IRI_RDF+'nil',
};

const P_XSD_INTEGER = 'http://www.w3.org/2001/XMLSchema#integer';
const P_XSD_DECIMAL = 'http://www.w3.org/2001/XMLSchema#decimal';
const P_XSD_STRING  = 'http://www.w3.org/2001/XMLSchema#string';


// primitive datatype unboxers
const H_PRIMITIVES = {
	'http://www.w3.org/2001/XMLSchema#string': (a) => a+'',
	'http://www.w3.org/2001/XMLSchema#integer': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#decimal': (a) => parseFloat(a),
};


//
const R_PREFIX = /^(\w*):([\w]*)$/;
const R_NOT_PREFIX = /\//;


// deduce only top-level nodes in graph; returns array of their IRIs



/**
* class:
**/
const local = classer('Graphy', (h_jsonld, f_okay_graphy) => {

	/**
	* private:
	**/

	// array of IRIs for nodes that are top-level (ie: named things or non-encapsulated blanknodes)
	let a_top_nodes;

	// hash of IRI => node
	let h_graph = {};

	// map prefix name => IRI
	let hm_prefixes = new Map();

	// track highest indexed blanknode in graph
	let i_highest_blanknode_id;

	// input json-ld has context
	if(h_jsonld.hasOwnProperty('@context')) {

		// ref context
		let h_context = h_jsonld['@context'];

		// each key in context object
		for(let s_key in h_context) {

			// ref value
			let z_value = h_context[s_key];

			// type of value is string; indeed a prefix
			if('string' === typeof z_value) {

				// copy to map
				hm_prefixes.set(s_key, z_value);
			}
		}
	}

	// transform json-ld to expanded form
	jsonld.expand(h_jsonld, (d_jld_err, a_expanded) => {

		// prepare set for all top-level nodes
		let as_top_level_nodes = new Set();

		// each subject node in json-ld object
		a_expanded.forEach((h_node) => {

			// ref node id (blanknode or iri)
			let s_id = h_node['@id'];

			// blanknode; track highest blanknode index
			if(s_id.startsWith('_:')) {
				i_highest_blanknode_id = Math.max(i_highest_blanknode_id, ~~s_id.substr(3));
			}

			// add mapping id => node
			h_graph[s_id] = h_node;

			// begin with assumption that all nodes are top level
			as_top_level_nodes.add(s_id);
		});

		// each node; go searching for blanknode objects
		a_expanded.forEach((h_node) => {

			// each key/value pair
			for(let s_key in h_node) {

				// skip json-ld keys
				if('@' === s_key[0]) continue;

				// ref value
				let a_objects = h_node[s_key];

				// assert objects is array
				if(!Array.isArray(a_objects)) {
					local.fail('expecting json-ld object to be array; instead got: '+arginfo(a_objects));
				}

				// each object
				a_objects.forEach((h_object) => {

					// object is node
					if(h_object.hasOwnProperty('@id')) {

						// object is blanknode
						if(h_object['@id'].startsWith('_:')) {

							// remove that blanknode from top level
							as_top_level_nodes.delete(h_object['@id']);
						}
					}
					// object is collection
					else if(h_object.hasOwnProperty('@list')) {

						// each item in collection
						h_object['@list'].forEach((h_item) => {

							// item is node
							if(h_item.hasOwnProperty('@id')) {

								// item is blanknode
								if(h_item['@id'].startsWith('_:')) {

									// remove that blanknode from top level
									as_top_level_nodes.delete(h_item['@id']);
								}
							}
						});
					}
				});
			}
		});

		// cast set to array, store in local field
		a_top_nodes = Array.from(as_top_level_nodes);

		//
		f_okay_graphy({

			// jump across nodes by accessing javascript object properties prefixed by a given namespace
			network(s_namespace, f_each) {

				// resolve iri of namespace
				let p_namespace = iri_of(s_namespace);

				// construct list of networked top-level nodes
				let a_nodes = a_top_nodes.map((p_node) => {
					return network_node(h_graph[p_node], p_namespace);
				});

				// user passed implicit map callback
				if('function' === typeof f_each) {
					return a_nodes.map(f_each);
				}

				// return mapped nodes
				return a_nodes;
			},

			// shorten an arbitrary iri using prefixes given in @context
			shorten: n3_shorten,
		});
	});


	// transform given ref (prefixed name or iri) to its full path
	const iri_of = (s_ref) => {

		// full path was given
		if('<' === s_ref[0] && s_ref.endsWith('>')) {
			return s_ref.slice(1, -1);
		}

		// match prefix
		let m_prefix = R_PREFIX.exec(s_ref);

		// not a prefix, must be an iri
		if(!m_prefix) {
			return s_ref;
		}

		// ref prefix
		let s_prefix = m_prefix[1];

		// lookup iri
		let s_iri = hm_prefixes.get(s_prefix);

		// no such prefix
		if(!s_iri) throw `no such prefix ${s_prefix}`;

		// return full iri
		return s_iri+m_prefix[2];
	};


	// shorten the given full path to the longest prefix
	const n3_shorten = (p_iri) => {

		//
		let s_best_prefix_name = '';
		let n_longest_iri_length = 0;

		// search context
		for(let [s_prefix, s_iri] of hm_prefixes) {

			// it can prefix the given iri
			if(p_iri.startsWith(s_iri)) {

				// it is the longest matching iri yet
				if(s_iri.length > n_longest_iri_length) {

					// update longest iri length
					n_longest_iri_length = s_iri.length;

					// store prefix name
					s_best_prefix_name = s_prefix;
				}
			}
		}

		// found nothing
		if(!n_longest_iri_length) {

			// could not shorten, use full path
			return '<'+p_iri+'>';
		}
		// use best prefix match
		else {

			// concat prefix name with suffixed iri
			return s_best_prefix_name+':'+p_iri.substr(n_longest_iri_length);
		}
	};


	// standardizes a json-ld object with our javascript interface
	const standardize_node = (h_object, s_key='') => {

		// contains @value json-ld property
		if(h_object.hasOwnProperty('@value')) {

			// ref value
			let s_value = h_object['@value'];

			// default datatype (xsd:string)
			let s_datatype = P_XSD_STRING;

			// datatype is set
			if(h_object.hasOwnProperty('@type')) {
				s_datatype = h_object['@type'];
			}
			// datatype not set; js type is number though
			else if('number' === typeof s_value) {
				s_datatype = Number.isInteger(s_value)? P_XSD_INTEGER: P_XSD_DECIMAL;
			}

			// prep standardized object as literal type
			let h_std = {
				type: 'literal',
				value: H_PRIMITIVES.hasOwnProperty(s_datatype)? H_PRIMITIVES[s_datatype](s_value): s_value,
				datatype: s_datatype,
			};

			// // datatype was deduced
			// if(s_datatype) h_std.datatype = s_datatype;

			// wrap with array
			return h_std;
		}

		// contains @list json-ld property
		if(h_object.hasOwnProperty('@list')) {

			// ref list
			let a_items = h_object['@list'];

			// render rdf collection
			return {
				type: 'collection',
				list: a_items.map((z_item) => {
					return standardize_node(z_item, s_key);
				}),
			};
		}

		// ref @id
		let s_id = h_object['@id'];

		// blanknode
		if(s_id.startsWith('_:')) {
			return {
				type: 'node',
				node: h_object['@id'],
			};
		}

		// iri
		return {
			type: 'iri',
			iri: s_id,
		};
	};


	//
	const cover_iri = (h_iri, p_namespace) => {

		// ref iri value
		let p_iri = h_iri.iri;

		// prepare to store iri suffix
		let s_suffix;

		// iri can be suffixed
		if(p_iri.startsWith(p_namespace)) {
			s_suffix = p_iri.substr(p_namespace.length);
		}

		// create virtual function for interface
		let k_iri = rmprop(function() {

			// return the computed suffix value
			return s_suffix;
		});

		// prepare hash of properties to set on virtual function
		let h_properties = {

			// change namespace
			$: {
				value(s_namespace) {
					return cover_iri(h_iri, iri_of(s_namespace));
				},
			},

			// generate n3 representation of this node as string
			$n3: {
				value() {
					return n3_shorten(p_iri);
				},
			},

			// what this is
			$is: {

				// read-only property 'iri'
				value: Object.defineProperties(function() {
					return 'iri';
				}, {
					iri: {
						value: true,
					},
				}),
			},

			// iri could exist as subject of some triple in graph
			$node: {
				value() {
					if(h_graph.hasOwnProperty(p_iri)) {
						return network_node(h_graph[p_iri], p_namespace);
					}
				},
			},

			// nquad representation of iri
			$nquad: {
				value() {
					return '<'+p_iri+'>';
				},
			},

			// set json-ld @id property
			'@id': {
				value: p_iri,
			},

			// set json-ld @type property
			'@type': {
				value: '@id',
			},
		};

		// iri suffix is available
		if(s_suffix) {

			// set shortcut id
			h_properties['$id'] = {
				value: s_suffix,
			};
		}

		// define properties on iri's interface object
		Object.defineProperties(k_iri, h_properties);

		//
		return k_iri;
	};


	//
	const cover_literal = (h_literal, p_namespace) => {

		// ref value of literal
		let z_value = h_literal.value;

		// ref datatype of literal
		let s_datatype = h_literal.datatype;

		// create virtual function for interface
		let k_literal = rmprop(function() {
			return z_value;
		});

		// create escaped version of literal value
		let s_quoted_value = '"'+('string' === typeof z_value? z_value.replace(/"/g, '\\"'): z_value)+'"';

		// prepare hash of properties to set on virtual function
		let h_properties = {

			// change namespace
			$: {
				value(s_namespace) {
					return cover_literal(h_literal, iri_of(s_namespace));
				},
			},

			// what this is
			$is: {

				// read-only property 'literal'
				value: Object.defineProperties(function() {
					return 'literal';
				}, {
					literal: {
						value: true,
					},
				}),
			},

			// generate n3 representation of this node (with auto-prefix) as string
			$n3: {
				value: Object.defineProperties(function() {
					return s_quoted_value+(s_datatype? '^^'+n3_shorten(s_datatype): '');
				}, {

					// auto-prefix terse datatype
					datatype: {
						value() {
							return n3_shorten(s_datatype);
						},
					},
				})
			},

			// nquad representation of literal
			$nquad: {
				value: Object.defineProperties(function() {
					return s_quoted_value+(s_datatype? '^^<'+s_datatype+'>': '');
				}, {
					datatype: {
						value() {
							return s_datatype? '<'+s_datatype+'>': '';
						},
					},
				}),
			},

			// literal value
			'@value': {
				value: s_quoted_value,
			},
		};

		// literal has it's datatype set
		if(s_datatype) {

			// full path of datatype
			h_properties['@type'] = {
				value: s_datatype,
			};

			// datatype iri can be suffixed
			if(s_datatype.startsWith(p_namespace)) {

				// shorten datatype iri by removing namespace from beginning
				h_properties['$type'] = {
					value: s_datatype.substr(p_namespace.length),
				};
			}
		}

		// define properties on literal's interface object
		Object.defineProperties(k_literal, h_properties);

		//
		return k_literal;
	};


	//
	const cover_collection = (h_collection, p_namespace) => {

		// cover collection's list immediately
		let a_list_covered = h_collection.list.map((h_item) => {

			// assert item only has one element
			if(1 !== h_item.length) {
				local.fail(`an rdf collection item somehow does not have exactly one object (it has ${h_item.length}):\n${arginfo(h_item)}`);
			}

			// before applying an iteration method, cover each item as networked node
			return cover_networked_node(h_item[0], p_namespace);
		});

		// create virtual function for interface
		let k_collection = rmprop(function(z_arg) {

			// empty-args call
			if(0 === arguments.length) {

				// return collection as array
				return a_list_covered;
			}
			// array accessor shortcut
			else if('number' === typeof z_arg) {

				// return item at given index
				return a_list_covered[z_arg];
			}
			// this is an implicit map call
			else if('function' === typeof z_arg) {

				// each item (return as mapped)
				return a_list_covered.map((k_item) => {
					return z_arg(k_item);
				});
			}
			// other
			else {
				local.fail('calling a collection is an implicit `map` call on the underlying list; method requires a callback function, instead got: '+arginfo(z_arg));
			}
		});

		// prepare hash of properties to set on virtual funtion
		let h_properties = {

			// change namespace
			$: {
				value(s_namespace) {
					return cover_collection(h_collection, iri_of(s_namespace));
				},
			},

			// ld-type
			$is: {

				// read-only property 'collection'
				value: Object.defineProperties(function() {
					return 'collection';
				}, {
					collection: {
						value: true,
					},
				}),
			},

			// n3 representation of collection
			$n3: {
				value: Object.defineProperties(function() {
					return '['
						+n3_shorten('<'+P_IRI_RDF+'first>')+' '+a_list_covered[0].$n3()+';'
						+n3_shorten('<'+P_IRI_RDF+'rest>')+' ('+a_list_covered.slice(1).map(h => h.$n3()).join(' ')+')'
						+']';
				}, {
					size: {
						value() {
							return a_list_covered.length;
						},
					},
				}),
			},

			// nquad representation of collection
			$nquad: {
				value: Object.defineProperties(function(c_bni=i_highest_blanknode_id) {
					return '_:b'+(++c_bni)+' '
						+'<'+P_IRI_RDF+'first> '+a_list_covered[0].$nquad(++c_bni)+';'
						+'<'+P_IRI_RDF+'rest> ('+a_list_covered.slice(1).map(h => h.$nquad(++c_bni)).join(' ')+')'
						+']';
				}, {
					size: {
						value() {
							return a_list_covered.length;
						},
					},
				}),
			},

			// collection iterator
			[Symbol.iterator]: {
				value: a_list_covered[Symbol.iterator],
			},
		};

		// define properties on collection's interface object
		Object.defineProperties(k_collection, h_properties);

		// namespace is rdf: ; emulate rdf collection
		if(P_IRI_RDF === p_namespace) {

			// emulate rdf:first
			k_collection.first = a_list_covered[0];

			// emulate rdf:rest
			let a_rest = h_collection.list.slice(1);
			k_collection.rest = a_rest.length? cover_collection({type: 'collection', list: a_rest}, p_namespace): cover_iri(H_IRI_RDF_NIL, P_IRI_RDF);
		}

		//
		return k_collection;
	};


	//
	const cover_networked_node = (h_object, p_namespace) => {

		// depending on type
		switch(h_object.type) {

			// node to be networked
			case 'node':
				return network_node(h_object.node, p_namespace);

			// named thing
			case 'iri':
				return cover_iri(h_object, p_namespace);

			// literal
			case 'literal':
				return cover_literal(h_object, p_namespace);

			// collection
			case 'collection':
				return cover_collection(h_object, p_namespace);
		}

		// nothing matched
		local.fail('failed to handle unknown internal node type: "'+h_object.type+'" from object: '+arginfo(h_object));
	};


	// construct a network node from a jsonld node
	const network_node = (h_node, p_namespace) => {

		// node is blanknode?
		let b_blanknode = h_node['@id'].startsWith('_:');

		// prepare hash for storing all objects pointed to by namespace suffixes
		let h_suffixed_objects = {};

		// assert @id
		if(!h_node.hasOwnProperty('@id')) {
			throw 'json-ld node is missing @id property: '+arginfo(h_node);
		}

		// ref @id
		let s_id = h_node['@id'];

		// prepare hash for defining properties on network node
		let h_properties = {

			// namespace change method
			$: {
				value(s_namespace) {
					return network_node(h_node, iri_of(s_namespace));
				},
			},

			// generate n3 representation of this node as string
			$n3: {
				value() {
					// node is blanknode
					if(b_blanknode) return s_id;

					// otherwise, shorten iri
					return n3_shorten(s_id);
				},
			},

			// nquad representation of this node
			$nquad: {
				value() {
					// node is blanknode
					if(b_blanknode) return s_id;

					// otherwise, use full iri
					return '<'+h_node['@id']+'>';
				},
			},

			// what this is
			$is: {
				// read-only property 'blaknode'/'node'
				value: Object.defineProperties(function() {
					return b_blanknode? 'blanknode': 'node';
				}, {
					[b_blanknode? 'blanknode': 'node']: {
						value: true,
						enumerable: true,
					},
				}),
			},

			// set json-ld @id property
			'@id': {
				value: s_id,
			},
		};

		// ref length of namespace string
		let n_namespace_length = p_namespace.length;

		// id can be shortened
		if(!b_blanknode && s_id.startsWith(p_namespace)) {

			// set accessor
			h_properties['$id'] = {
				value: s_id.substr(n_namespace_length),
			};
		}

		// rdf:type exists
		if(h_node.hasOwnProperty('@type')) {

			// ref type
			let a_types = h_node['@type'];

			// set @type
			h_properties['@type'] = {
				value: a_types,
			};

			// filter types that can be shortened
			let a_tersable_types = a_types.filter(s_type => s_type.startsWith(p_namespace));

			// set accessor for all rdf:types in terse form
			h_properties['$types'] = {
				value: a_tersable_types.map(s_type => s_type.substr(n_namespace_length)),
			};

			// set primary accessor
			if(a_tersable_types.length > 0) {
				h_properties['$type'] = {
					get() {
						// more than one rdf:type
						if(1 !== a_tersable_types.length) {
							// issue warning about accessing 0th rdf:type
							local.warn(`more than one triple share the same predicate "${n3_shorten(P_IRI_RDF+'type')}" with subject "${h_node.id}". By using '.$type', you are accessing any one of these triples arbitrarily`);
						}

						// return first rdf:type
						return a_tersable_types[0].substr(n_namespace_length);
					},
				};
			}
		}

		// each property of json-ld node
		for(let s_key in h_node) {

			// json-ld property
			if('@' === s_key[0]) {

				// other than @id and @type
				if('@id' !== s_key && '@type' !== s_key) {
					throw `unexpected json-ld property "${s_key}" on expanded json-ld node: ${arginfo(h_node)}`;
				}

				// otherwise, skip property
				continue;
			}

			// ref objects
			let a_objects = h_node[s_key];

			// predicate can be suffixed
			if(s_key.startsWith(p_namespace)) {

				// ref access name
				let s_access_name = s_key.substr(n_namespace_length);

				// wrap the node so it is an array of standardized objects
				let a_nodes = a_objects.map(h_object => standardize_node(h_object, s_key));

				// store these nodes to the suffixed object hash
				h_suffixed_objects[s_access_name] = a_nodes;

				// set accessor in properties hash
				h_properties[s_access_name] = {

					// show this predicate when iterating
					enumerable: true,

					// object is being requested
					get: () => {

						// more than one triple share this predicate
						if(a_nodes.length > 1) {

							// issue warning about using first triple
							local.warn(`more than one triple share the same predicate "${n3_shorten(s_key)}" with subject "${h_node.id}". By using '.${s_access_name}', you are accessing any one of these triples arbitrarily`);
						}

						// cover first object
						return cover_networked_node(a_nodes[0], p_namespace);
					},
				};
			}
		}


		// virtual function to create array of network nodes using namespaced suffix as predicate
		const k_node = rmprop(function(s_suffix, f_each) {

			// lookup nodes pointed to by this suffix
			let a_nodes = h_suffixed_objects[s_suffix];

			// nothing found
			if(!a_nodes) {
				throw `no objects are pointed to by namespaced suffix "${s_suffix}" in {${n3_shorten(p_namespace)}}`;
			}

			// caller wants to map items
			if('function' === typeof f_each) {

				// each item (a_nodes overrides Array.protoype)
				return Array.prototype.map.call(a_nodes, (h_item) => {

					// cover node and pass to callback
					return f_each(cover_networked_node(h_item, p_namespace));
				});
			}

			// generate interface for these triples
			let a_interface = map_array_interface(a_nodes, a_nodes, (h_item) => {
				return cover_networked_node(h_item, p_namespace);
			});

			// define namespace change method
			a_interface.$ = function(s_namespace) {
				return local.fail('namespace change on collections not yet supported');
			};

			// 
			return a_interface;
		});

		// set properties on network node
		Object.defineProperties(k_node, h_properties);

		//
		return k_node;
	};


	/**
	* public:
	**/
	return {};
}, {

	/**
	* public static:
	**/

	// stringify
	stringify(z_what) {

		//
		let stringify_thing = function(add, z_thing) {

			// ref thing type
			let s_type = typeof z_thing;

			// string
			if('string' === s_type) {
				add(`'${z_thing.replace(/'/g, '\\\'')}'`, true);
			}
			// array
			else if(Array.isArray()) {
				add.open('[ ', ',', true);
				for(let i_item in z_thing) {
					add('');
					stringify_thing(add, z_thing[i_item]);
				}
				add.close(']');
			}
			// something with enumerable properties
			else {

				if('function' === s_type) {
					add.open('(function){', ',', true);
				}
				else {
					add.open('{', ',', true);
				}
				let b_was_found = false;
				for(let s_property in z_thing) {
					b_was_found = true;
					add(`'${s_property.replace(/'/g, '\\\'')}': `);
					stringify_thing(add, z_thing[s_property]);
				}
				if(!b_was_found) {
					add.close('', '');
				}
				else {
					add.close('}');
				}
			}
		};

		return rapunzel({
			body: function(add) {
				return stringify_thing(add, z_what);
			},
		}).produce({
			indent: '    ',
		});
	},
});

export default local;
