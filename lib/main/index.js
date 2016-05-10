/*eslint dot-notation:0, no-extra-parens:0*/

/**
* import:
**/


// native imports
// ...

// libraries
import arginfo from 'arginfo';
import classer from 'classer';
import jsonld from 'jsonld';
import rmprop from 'rmprop';
import xtend from 'xtend';

// local classes
// ...


/**
* private static:
**/

const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const H_IRI_RDF_NIL = {
	type: 'iri',
	iri: P_IRI_RDF+'nil',
};

const P_XSD_INTEGER = 'http://www.w3.org/2001/XMLSchema#integer';
const P_XSD_DECIMAL = 'http://www.w3.org/2001/XMLSchema#decimal';
const P_XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';


// primitive datatype unboxers
const H_PARSEABLE_DATATYPES = {
	'http://www.w3.org/2001/XMLSchema#boolean': (a) => 'boolean' === typeof a? a: /^t/i.test(a),
	'http://www.w3.org/2001/XMLSchema#string': (a) => a+'',
	'http://www.w3.org/2001/XMLSchema#decimal': (a) => parseFloat(a),
	'http://www.w3.org/2001/XMLSchema#byte': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#unsignedByte': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#short': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#unsignedShort': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#long': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#unsignedLong': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#int': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#unsignedInt': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#integer': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#positiveInteger': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#nonPositiveInteger': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#negativeInteger': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#nonNegativeInteger': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#float': (a) => parseFloat(a),
	'http://www.w3.org/2001/XMLSchema#double': (a) => parseFloat(a),
	'http://www.w3.org/2001/XMLSchema#dateTime': (a) => new Date(a),
};


//
const R_PREFIX = /^(\w*):([\w]*)$/;

// find and return longest iri from hash of prefixes
const longest_prefix = (p_iri, h_local_prefixes) => {

	// prep to find best prefix
	let s_best_prefix_name = '';
	let n_longest_iri_length = 0;

	// search context
	for(let s_prefix in h_local_prefixes) {
		let s_iri = h_local_prefixes[s_prefix];

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

	return {
		prefix: s_best_prefix_name,
		namespace: h_local_prefixes[s_best_prefix_name],
	};
};


// shorten the given full path to the longest prefix
const n3_shorten = (p_iri, h_local_prefixes) => {

	// don't use prefixes
	if(!h_local_prefixes) return '<'+p_iri+'>';

	//
	let {
		prefix: s_best_prefix_name,
		namespace: s_namespace_iri,
	} = longest_prefix(p_iri, h_local_prefixes);

	// found nothing
	if(!s_best_prefix_name.length) {

		// could not shorten, use full path
		return '<'+p_iri+'>';
	}
	// use best prefix match
	else {

		// concat prefix name with suffixed iri
		return s_best_prefix_name+':'+p_iri.substr(s_namespace_iri.length);
	}
};



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
	let h_prefixes = {};

	// track highest indexed blanknode in graph
	let i_highest_blanknode_id = 0;

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
				h_prefixes[s_key] = z_value;
			}
		}
	}

	// transform json-ld to expanded form
	jsonld.expand(h_jsonld, (d_jld_err, a_expanded) => {

		// prepare array for all covered nodes
		let a_entities_unnamespaced = [];

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

			// create unnamespaced entity
			a_entities_unnamespaced.push(network_node(h_node));

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
		f_okay_graphy(Object.defineProperties(a_entities_unnamespaced, {

			// top nodes from graph
			top: {
				value(f_each) {

					// construct list of networked top-level nodes
					let a_nodes = a_top_nodes.map((p_node) => {
						return network_node(h_graph[p_node], '');
					});

					// user passed implicit map callback
					if('function' === typeof f_each) {
						return a_nodes.map(f_each);
					}

					// return mapped nodes
					return a_nodes;
				},
			},

			// select any node from the entire graph
			select: {
				value(s_ref, s_namespace) {

					// resolve iri of ref
					let p_iri = iri_of(s_ref);

					// optional namespace
					let p_namespace = s_namespace? iri_of(s_namespace): longest_prefix(iri_of(s_ref), h_prefixes).namespace;

					// return networked node
					return network_node(h_graph[p_iri], p_namespace);
				},
			},

			// shorten an arbitrary iri using prefixes given in @context
			shorten: {
				value(s_name) {
					return n3_shorten(s_name, h_prefixes);
				},
			},

			// expands an arbitrary prefixed iri using prefixes given in @context
			expand: {
				value(s_name) {
					return iri_of(s_name);
				},
			},
		}));
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
		let s_iri = h_prefixes[s_prefix];

		// no such prefix
		if(!s_iri) {

			// rdf namespace
			if('rdf' === s_prefix) return P_IRI_RDF+m_prefix[2];

			// otherwise, throw error
			throw `no such prefix ${s_prefix}`;
		}

		// return full iri
		return s_iri+m_prefix[2];
	};

	// usher n3 prefix selection
	const n3_usher = (p_iri, z_prefixes, b_exclusive) => {
		// don't use prefixes
		if(false === z_prefixes) return n3_shorten(p_iri, false);

		// exclusively use given prefixes
		if(true === b_exclusive) return n3_shorten(p_iri, z_prefixes);

		// use shorten method on combined set
		return n3_shorten(p_iri, xtend(h_prefixes, z_prefixes));
	};

	// computes suffix of iri using given namespace
	const suffix = (p_iri, p_namespace) => {
		return p_iri.startsWith(p_namespace)? p_iri.substr(p_namespace.length): undefined;
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

			// parse certain datatypes
			let w_value = s_value;
			let b_parseable = false;
			if(H_PARSEABLE_DATATYPES.hasOwnProperty(s_datatype)) {
				w_value = H_PARSEABLE_DATATYPES[s_datatype](s_value);
				b_parseable = true;
			}

			// prep standardized object as literal type
			let h_std = {
				type: 'literal',
				value: w_value,
				raw_value: s_value,
				datatype: s_datatype,
				parseable: b_parseable,
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
				node: h_object,
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
		let k_iri = rmprop(function(s_namespace) {
			// no-args call; return pre-computed suffix value
			if(!arguments.length) return s_suffix;

			// otherwise, use given namespace to compute suffix
			return suffix(p_iri, iri_of(s_namespace));
		});

		//
		let k_cached_namespaces;

		// prepare hash of properties to set on virtual function
		let h_properties = {

			// change namespace
			$: {
				get() {
					// namespaces haven't been cached yet
					if(!k_cached_namespaces) {
						// create namespace changer method
						k_cached_namespaces = function(s_namespace) {
							if(!arguments.length) return p_namespace;
							return cover_iri(h_iri, iri_of(s_namespace));
						};

						// push each prefix to namespace accessor
						for(let s_prefix in h_prefixes) {
							let p_ns_iri = h_prefixes[s_prefix];
							k_cached_namespaces[s_prefix] = cover_iri(h_iri, p_ns_iri);
						}
					}

					// return namespaces/accessor
					return k_cached_namespaces;
				},
			},

			// checks namesapce of iri
			$in: {
				value: (s_namespace) => p_iri.startsWith(iri_of(s_namespace)),
			},

			// generate n3 representation of this node as string
			$n3: {
				value: (z_prefixes, b_exclusive) => n3_usher(p_iri, z_prefixes, b_exclusive),
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
				value(s_namespace) {
					if(h_graph.hasOwnProperty(p_iri)) {
						return network_node(h_graph[p_iri], arguments.length? iri_of(s_namespace): p_namespace);
					}
				},
			},

			// nquad representation of iri
			$nquad: {
				value: () => '<'+p_iri+'>',
			},

			// set json-ld @id property
			'@id': {
				value: p_iri,
			},

			// set shortcut id
			$id: {
				value(s_namespace) {
					if(p_iri.startsWith('_:')) return undefined;
					if(!arguments.length) return s_suffix;
					return suffix(p_iri, iri_of(s_namespace));
				},
			},

			// set json-ld @type property
			'@type': {
				value: '@id',
			},
		};

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

		//
		let k_cached_namespaces;

		// prepare hash of properties to set on virtual function
		let h_properties = {

			// change namespace
			$: {
				get() {
					// namespaces haven't been cached yet
					if(!k_cached_namespaces) {
						// create namespace changer method
						k_cached_namespaces = function(s_namespace) {
							if(!arguments.length) return p_namespace;
							return cover_literal(h_literal, iri_of(s_namespace));
						};

						// push each prefix to namespace accessor
						for(let s_prefix in h_prefixes) {
							let p_iri = h_prefixes[s_prefix];
							k_cached_namespaces[s_prefix] = cover_literal(h_literal, p_iri);
						}
					}

					// return namespaces/accessor
					return k_cached_namespaces;
				},
			},

			// checks namesapce of iri
			$in: {
				value: () => false,
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
				value: Object.defineProperties(function(z_prefixes, b_exclusive) {
					return s_quoted_value+(s_datatype? '^^'+n3_usher(s_datatype, z_prefixes, b_exclusive): '');
				}, {

					// auto-prefix terse datatype
					datatype: {
						value() {
							return n3_shorten(s_datatype, h_prefixes);
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

			// returns the raw value before any parsing was done
			$raw: {
				value: () => h_literal.raw_value,
			},
		};

		// literal has it's datatype set
		if(s_datatype) {

			// full path of datatype
			h_properties['@type'] = {
				value: s_datatype,
			};

			// shorten datatype iri by removing namespace from beginning
			h_properties['$datatype'] = {
				value: Object.defineProperties(function(s_namespace) {
					let s_ns_iri = arguments.length? iri_of(s_namespace): p_namespace;
					return suffix(s_datatype, s_ns_iri);
				}, {
					parseable: {
						value: () => h_literal.parseable,
					},
				}),
			};
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

			// before applying an iteration method, cover each item as networked node
			return cover_networked_node(h_item, p_namespace);
		});

		// create virtual function for interface
		let k_collection = rmprop.emulateArray(a_list_covered, function(z_arg) {

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

		// prep namespace cache
		let k_cached_namespaces;

		// prepare hash of properties to set on virtual funtion
		let h_properties = {

			// change namespace
			$: {
				get() {
					// namespaces haven't been cached yet
					if(!k_cached_namespaces) {
						// create namespace changer method
						k_cached_namespaces = function(s_namespace) {
							if(!arguments.length) return p_namespace;
							return cover_collection(h_collection, iri_of(s_namespace));
						};

						// push each prefix to namespace accessor
						for(let s_prefix in h_prefixes) {
							let p_iri = h_prefixes[s_prefix];
							k_cached_namespaces[s_prefix] = cover_collection(h_collection, p_iri);
						}
					}

					// return namespaces/accessor
					return k_cached_namespaces;
				},
			},

			// checks namesapce of iri
			$in: {
				value() {
					return false;
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
				value: Object.defineProperties(function(z_prefixes, b_exclusive) {
					return '['
						+n3_usher(P_IRI_RDF+'first', z_prefixes, b_exclusive)+' '+a_list_covered[0].$n3(z_prefixes, b_exclusive)+';'
						+n3_usher(P_IRI_RDF+'rest', z_prefixes, b_exclusive)+' ('+a_list_covered.slice(1).map(h => h.$n3(z_prefixes, b_exclusive)).join(' ')+')'
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
				value: Object.defineProperties(function(c_bni=i_highest_blanknode_id+1) {

					// map each item to nqaud conversion
					return a_list_covered.map((h_entity, i_entity) => {
						let s_root = '_:b'+(c_bni);
						let s_rest = i_entity === a_list_covered.length-1? '<'+P_IRI_RDF+'nil>': '_:b'+(++c_bni);

						return ''
							+s_root+' <'+P_IRI_RDF+'first> '+h_entity.$nquad()+'. '
							+s_root+' <'+P_IRI_RDF+'rest> '+s_rest+'. ';
					}).join('');
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
			case 'node': {
				// ref node
				let h_node = h_object.node;

				// ref node's id
				let h_graph_node = h_graph[h_node['@id']];

				// node is in graph
				if(h_graph_node) {
					// network actual node
					return network_node(h_graph_node, p_namespace);
				}
				// node is not in graph
				else {
					// cover this (possibly thin) node
					return network_node(h_node, p_namespace);
				}
			}

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
	const network_node = (h_node, p_namespace='') => {

		// node is blanknode?
		let b_blanknode = h_node['@id'].startsWith('_:');

		// prepare hash for storing all objects pointed to by namespace suffixes
		let h_suffixed_objects = {};

		// a map of all property mappings
		let hm_all_properties = new Map();

		// assert @id
		if(!h_node.hasOwnProperty('@id')) {
			throw 'json-ld node is missing @id property: '+arginfo(h_node);
		}

		// ref @id
		let s_id = h_node['@id'];

		// prep cached namespaces
		let k_cached_namespaces;

		// prepare hash for defining properties on network node
		let h_properties = {

			// namespace change method
			$: {
				get() {
					// namespaces haven't been cached yet
					if(!k_cached_namespaces) {
						// create namespace changer method
						k_cached_namespaces = function(s_namespace) {
							if(!arguments.length) return p_namespace;
							return network_node(h_node, iri_of(s_namespace));
						};

						// push each prefix to namespace accessor
						for(let s_prefix in h_prefixes) {
							let p_iri = h_prefixes[s_prefix];
							k_cached_namespaces[s_prefix] = network_node(h_node, p_iri);
						}
					}

					// return namespaces/accessor
					return k_cached_namespaces;
				},
			},

			// checks namesapce of iri
			$in: {
				value(s_namespace) {
					return s_id.startsWith(iri_of(s_namespace));
				},
			},

			// returns hash of namespaces mapped to corresponding node entities
			$namespaces: {
				value() {
					// prep return hash
					let h_ns_map = {};

					// each prefix in context
					for(let s_prefix in h_prefixes) {
						h_ns_map[s_prefix] = network_node(h_node, h_prefixes[s_prefix]);
					}

					// return ns map
					return h_ns_map;
				},
			},

			// generate n3 representation of this node as string
			$n3: {
				value(z_prefixes, b_exclusive) {
					// node is blanknode
					if(b_blanknode) return s_id;

					// otherwise, shorten iri
					return n3_usher(s_id, z_prefixes, b_exclusive);
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
					// return b_blanknode? 'blanknode': 'node';
					return 'node';
				}, {
					// [b_blanknode? 'blanknode': 'node']: {
					// 	value: true,
					// 	enumerable: true,
					// },
					node: {
						value: true,
						enumerable: true,
					},
				}),
			},

			// set json-ld @id property
			'@id': {
				value: s_id,
			},

			// set id property
			$id: {
				value(s_namespace) {
					if(b_blanknode) return undefined;
					let s_ns_iri = arguments.length? iri_of(s_namespace): p_namespace;
					return suffix(s_id, s_ns_iri);
				},
			},

			[Symbol.iterator]: {
				value: function*() {
					// each predicate in properties
					for(let [p_predicate, k_node] of hm_all_properties) {
						// predicate matches current namespace
						if(p_predicate.startsWith(p_namespace)) {
							yield [p_predicate.substr(p_namespace.length), k_node];
						}
					}
				},
			},
		};

		// ref length of namespace string
		let n_namespace_length = p_namespace.length;

		// rdf:type exists
		if(h_node.hasOwnProperty('@type')) {

			// ref type
			let a_types = h_node['@type'];

			// create transformed iri to nodes list
			let a_iris = a_types.map((s_rdf_type) => {
				// wrap types as IRIs
				return cover_networked_node(
					standardize_node({'@id': s_rdf_type}, P_IRI_RDF+'type'), p_namespace);
			});

			// set @type
			h_properties['@type'] = {
				value: a_types,
			};

			// set accessor for all rdf:types in terse form
			h_properties['$types'] = {
				value: rmprop.emulateArray(a_iris, function(s_namespace) {

					// resolve iri of namespace arg
					let s_ns_iri = arguments.length? iri_of(s_namespace): p_namespace;

					// filter only rdf:types that can be suffixed by given namespace; then suffix them
					return a_types
						.filter(s_type => s_type.startsWith(s_ns_iri))
						.map(s_type => s_type.substr(s_ns_iri.length));
				}),
			};

			// set primary accessor
			h_properties['$type'] = {
				value(s_namespace) {
					// resolve namespace
					let s_ns_iri = arguments.length? iri_of(s_namespace): p_namespace;

					// filter types that can be tersed in current accessor namespace
					let a_tersable_types = a_types.filter(s_type => s_type.startsWith(s_ns_iri));

					// more than one rdf:type
					if(1 < a_tersable_types.length) {
						// issue warning about accessing 0th rdf:type
						local.warn(`more than one triple share the same predicate "${n3_shorten(P_IRI_RDF+'type', h_prefixes)}" with subject "${s_id}". By using '.$type()', you are accessing any one of these triples arbitrarily`);
					}

					// return first matching rdf:type
					return a_tersable_types[0].substr(s_ns_iri.length);
				},
			};

			// emulate rdf namespace
			if(P_IRI_RDF === p_namespace) {

				// put type suffixes
				h_suffixed_objects['type'] = a_iris;

				// put rdf:type properties
				h_properties['type'] = {
					// show this predicate when iterating
					enumerable: true,

					// object is being requested
					get() {
						// more than one triple share this predicate
						if(a_iris.length > 1) {

							// issue warning about using first triple
							local.warn(`more than one triple share the same predicate "${n3_shorten(P_IRI_RDF+'type', h_prefixes)}" with subject "${s_id}". By using '.type', you are accessing any one of these triples arbitrarily`);
						}

						// cover first object
						return a_iris[0];
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

			// create nodes from object list
			let a_nodes = h_node[s_key]
				.map(h_object => {
					return cover_networked_node(
						standardize_node(h_object, s_key), p_namespace);
				});

			// predicate can be suffixed
			if(s_key.startsWith(p_namespace)) {

				// ref access name
				let s_access_name = s_key.substr(n_namespace_length);

				// store these nodes to the suffixed object hash
				h_suffixed_objects[s_access_name] = a_nodes;

				// set accessor in properties hash
				h_properties[s_access_name] = {

					// show this predicate when iterating
					enumerable: true,

					// object is being requested
					get() {
						// more than one triple share this predicate
						if(a_nodes.length > 1) {

							// issue warning about using first triple
							local.warn(`more than one triple share the same predicate "${n3_shorten(s_key, h_prefixes)}" with subject "${s_id}". By using '.${s_access_name}', you are accessing any one of these triples arbitrarily`);
						}

						// cover first object
						return a_nodes[0];
					},
				};
			}

			// add mapping
			hm_all_properties.set(s_key, a_nodes);
		}

		// virtual function to create array of network nodes using namespaced suffix as predicate
		const k_node = rmprop(function(s_suffix, f_each) {

			// no args call
			if(!arguments.length) {

				// return predicate/object map
				return hm_all_properties;
			}

			// lookup nodes pointed to by this suffix
			let a_nodes = h_suffixed_objects[s_suffix];

			// nothing found
			if(!a_nodes) {
				throw `no objects are pointed to by namespaced suffix "${s_suffix}" in {${n3_shorten(p_namespace, h_prefixes)}}`;
			}

			// caller wants to map items
			if('function' === typeof f_each) {
				// map each item onto callback
				return a_nodes.map(f_each);
			}

			// return plain entities
			return a_nodes;
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

});

export default local;
