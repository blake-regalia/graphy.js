/**
* import:
**/

// native imports
// ...

// libraries
import rmprop from 'rmprop';
import arginfo from 'arginfo';
import clone from 'clone';
import rapunzel from 'rapunzel';

// local classes
// ...


// colored output
require(__dirname+'/console-color.js');


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


/**
* private static:
**/
const __class_name = 'Graphy';


const P_RDF_NAMESPACE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const H_IRI_RDF_NIL = {
	type: 'iri',
	iri: P_RDF_NAMESPACE+'nil',
};

const P_XSD_INTEGER = 'http://www.w3.org/2001/XMLSchema#integer';
const P_XSD_DECIMAL = 'http://www.w3.org/2001/XMLSchema#decimal';


// primitive datatype unboxers
const H_PRIMITIVES = {
	'http://www.w3.org/2001/XMLSchema#string': (a) => a+'',
	'http://www.w3.org/2001/XMLSchema#integer': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#decimal': (a) => parseFloat(a),
};


//
const R_PREFIX = /^(\w*):(.*)$/;


/**
* @class LdQuery
* using closure for private methods and fields
**/
const __construct = function(h_jsonld) {

	/**
	* private:
	**/

	const h_graph = {};

	const h_context = h_jsonld['@context'];


	// fetches the context of an ld-name
	const context = (s_name) => {

		// try finding context by looking up name in hash
		let z_context = h_context[s_name];

		// context was not immediately found
		if(!z_context) {

			// ld-name is prefixed
			let m_prefix = R_PREFIX.exec(s_name);
			if(m_prefix) {

				// first part of id has primary context
				if(h_context[m_prefix[1]]) {

					// ref primary context
					let z_primary_context = h_context[m_prefix[1]];

					// primary context is only a prefix
					if('string' === typeof z_primary_context) {

						// try to resolve secondary context too
						let h_secondary_context = h_context[m_prefix[2]];

						// secondary context should be json-ld context
						if('object' !== typeof h_secondary_context) {
							local.fail('expected secondary context name "'+m_prefix[2]+'" from "'+s_name+'" to be json-ld object; instead got: '+arginfo(h_secondary_context));
						}

						// clone secondary context
						let h_local_context = {
							id: h_secondary_context['@id'],
							type: h_secondary_context['@type'],
						};

						// if it does not have an id, append the latter part of the name to primary prefix
						h_local_context.id = z_primary_context+m_prefix[2];

						// return that context hash
						return h_local_context;
					}
					// primary context is a json-ld context
					else {

						// primary context is missing an id
						if(!z_primary_context['@id']) {
							local.fail(`json-ld context node is missing '@id' property at context name "${m_prefix[1]}": ${arginfo(z_primary_context)}`);
						}

						// ref primary context id
						let s_primary_context_id = z_primary_context['@id'];

						// secondary context is directly available
						if(h_context[s_primary_context_id+m_prefix[2]]) {

							// just use that
							z_context = h_context[s_primary_context_id+m_prefix[2]];
						}
						// secondary context not available
						else {

							// use the primary context node
							let h_local_context = {
								id: s_primary_context_id,
								type: z_primary_context['@type'],
							};

							// extend its id with the latter part of the name
							h_local_context.id += m_prefix[2];

							// return that context hash
							return h_local_context;
						}
					}
				}
				// at least we tried...
				else {
					local.fail('failed to resolve primary context of name: "'+m_prefix[1]+'" from "'+s_name+'"');
				}
			}
			// no prefixing here
			else {
				local.fail('failed to resolve context of non-prefixed name: "'+s_name+'"');
			}
		}

		// context exists as string
		if('string' === typeof z_context) {

			// this means its just the iri
			return {
				id: z_context,
			};
		}
		// context exists as object
		else {

			// standardize
			return {
				id: z_context['@id'],
				type: z_context['@type'],
			};
		}
	};



	// expand the given iri to its full path (for ttl iris)
	const expand = (s_iri) => {

		// full path given
		if('<' === s_iri[0] && s_iri.endsWith('>')) {
			return s_iri.slice(1, -1);
		}

		// match prefix
		let m_prefix = R_PREFIX.exec(s_iri);

		// no prefix?!
		if(!m_prefix) {
			local.fail('cannot expand non-prefixed iri: "'+s_iri+'"');
		}

		// find prefix in context
		let z_context_ref = h_context[m_prefix[1]];

		// mapping is not a prefix => iriref
		if('string' !== typeof z_context_ref) {
			local.fail('did not find a prefix mapping for "'+m_prefix[1]+'"; instead found: '+arginfo(z_context_ref));
		}

		// expansion
		return z_context_ref+m_prefix[2];
	};



	// shorten the given full path to the longest prefix
	const shorten = (p_iri) => {

		//
		let s_best_prefix_name = '';
		let n_longest_prefix_length = 0;

		// search context
		for(let s_prefix in h_context) {

			// indeed a prefix
			if('string' === typeof h_context[s_prefix]) {

				// ref iri
				let p_prefix_iri = h_context[s_prefix];

				// it can prefix this iri
				if(p_iri.startsWith(p_prefix_iri)) {

					// it is the longest matching iri yet
					if(p_prefix_iri.length > n_longest_prefix_length) {

						// update best iri
						n_longest_prefix_length = p_prefix_iri.length;

						// store prefix name
						s_best_prefix_name = s_prefix;
					}
				}
			}
		}

		// found nothing
		if(!n_longest_prefix_length) {

			// could not shorten, use full path
			return '<'+p_iri+'>';
		}
		// using best prefix match
		else {

			// concat prefix name with suffixed iri
			return s_best_prefix_name+p_iri.substr(n_longest_prefix_length);
		}
	};


	// deduce the top-level nodes in the graph; return their json-ld names as an array
	const top_nodes = () => {

		// there is no graph, only one node!
		if(!h_jsonld['@graph']) {

			// no keys!
			return [];
		}

		// otherwise, inspect the graph
		let a_graph = h_jsonld['@graph'];

		// prepare a set for all top-level nodes
		let a_top_level_nodes = new Set();

		// create graph map keyed by id of each node
		a_graph.forEach((h_node) => {

			//
			let s_id = h_node['@id'];

			// set mapping
			h_graph[s_id] = h_node;

			// begin with assumption that all nodes are top level
			a_top_level_nodes.add(s_id);
		});

		// each node; go searching for blanknodes
		a_graph.forEach((h_node) => {

			// each key/value pair
			for(let s_key in h_node) {

				// skip non-property keys
				if('@' === s_key[0]) continue;

				// get context of key
				let h_key_context = context(s_key);

				// key has no context, must not point to a blanknode
				if(!h_key_context) {
					local.warn(`did not find a context for "${s_key}"; this could be malformed json-ld`);
					continue;
				}

				// ref value
				let z_value = h_node[s_key];

				// value type is a string
				if('string' === typeof z_value) {

					// this node points to a blanknode
					if('@id' === h_key_context.type && z_value.startsWith('_:')) {

						// remove that blanknode from top level
						a_top_level_nodes.delete(z_value);
					}
				}
				// value type is object
				else if('object' === typeof z_value) {

					// node is list of objects (multiple triples sharing same predicate)
					if(Array.isArray(z_value)) {

						// each item in list
						z_value.forEach((z_item) => {

							// item type is string
							if('string' === typeof z_item) {

								// item points to blanknode
								if(z_item.startsWith('_:')) {

									// remove that blanknode from top level
									a_top_level_nodes.delete(z_item);
								}
							}
						});
					}
					// node is a collection
					else if(z_value['@list']) {

						// each item in collection
						z_value['@list'].forEach((z_item) => {

							// ref id (whether or not it is defined)
							let s_item_id = z_item['@id'];

							// item points to blanknode
							if(s_item_id && s_item_id.startsWith('_:')) {

								// remove that blanknode from top level
								a_top_level_nodes.delete(s_item_id);
							}
						});
					}
					// node is a literal or named thing
					else if(z_value['@value'] || z_value['@id']) {

						// not a blanknode; ignore
					}
					// node is something else
					else {
						local.fail(`unrecognized object struct for top-level json-ld node value point to by '${s_key}' key: ${arginfo(z_value)}`);
					}
				}
				// value type is number
				else if('number' === typeof z_value) {

					// not a blanknode; ignore
				}
				// other
				else {
					local.fail('unrecognized datatype for top-level json-ld graph node value: '+arginfo(z_value));
				}
			}
		});

		// return list of top-level nodes
		return Array.from(a_top_level_nodes);
	};



	/**
	* wrap_node helpers
	**/

	//
	const iri = (s_iri) => {

		// identifier points to blank node
		if(s_iri.startsWith('_:')) {

			// return that node
			return [{
				type: 'node',
				iri: s_iri,
				node: h_graph[s_iri],
			}];
		}
		// identifier points to named thing
		else {

			// return full url
			return [{
				type: 'iri',
				iri: expand(s_iri),
			}];
		}
	};



	// wraps a json-ld object with our javascript interface
	const wrap_node = (z_object, h_node_context) => {

		// ref object type
		let s_type = typeof z_object;

		// in case we discover datatype
		let s_datatype;

		// object type is a javascript simple object (it may have json-ld properties that override node context)
		if('object' === s_type && !Array.isArray(z_object)) {

			// json-ld is giving iri
			if('string' === typeof z_object['@id']) {
				return iri(z_object['@id']);
			}

			// create deep copy of context before changing properties
			h_node_context = clone(h_node_context, false);

			// alias object before traversing
			let h_object = z_object;

			// each property in json-ld object
			for(let s_property in h_object) {

				// json-ld property
				if('@' === s_property[0]) {

					// json-ld is giving object datatype
					if('@type' === s_property && '@' !== h_object[s_property][0]) {

						// set datatype
						s_datatype = expand(h_object[s_property]);
					}
					// json-ld is giving the object value!
					else if('@value' === s_property) {

						// set object value!
						z_object = h_object[s_property];

						// update object type
						s_type = typeof z_object;

						// don't set this property on node's context
						continue;
					}

					// override the property set on node context
					h_node_context[s_property.substr(1)] = h_object[s_property];
				}
			}
		}

		// object type is a javascript number
		if('number' === s_type) {

			// object is a literal type; guess datatype
			return [{
				type: 'literal',
				value: z_object,
				datatype: s_datatype || (Number.isInteger(z_object)? P_XSD_INTEGER: P_XSD_DECIMAL),
			}];
		}

		// obejct type is explicit literal
		if(s_datatype) {
			return [{
				type: 'literal',
				value: z_object,
				datatype: s_datatype,
			}];
		}

		// points to an iri
		if('@id' === h_node_context.type) {

			// object type is a javascript string
			if('string' === s_type) {

				// json-ld is giving iri
				return iri(z_object);
			}
			// object type is a javascript object
			else if('object' === s_type) {

				// object is array; multiple triples share same predicate
				if(Array.isArray(z_object)) {

					// map each object to wrapper
					return z_object.map((z_item) => {
						let a_nodes = wrap_node(z_item, h_node_context);

						// make sure only one node was created
						if(a_nodes.length > 1) local.fail('more than one object node was returned from an object group item');

						//
						return a_nodes[0];
					});
				}
				// object is a collection
				else if(z_object['@list']) {

					// map each list item to wrapper; return list as single element in array
					return [z_object['@list'].map((z_item) => {
						return wrap_node(z_item, h_node_context);
					})];
				}
				// unknown
				else {
					local.fail('unrecognized json-ld object value: '+arginfo(z_object));
				}
			}
			// unknown
			else {
				local.fail('unrecognized json-ld object value: '+arginfo(z_object));
			}
		}
		// literal type
		else if('string' === typeof h_node_context.type) {

			// return literal
			return [{
				type: 'literal',
				datatype: h_node_context.type,
				value: z_object,
			}];
		}
		// raw string
		else {

			// return literal
			return [{
				type: 'literal',
				value: z_object,
			}];
		}
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
				value: function(s_namespace) {
					return cover_iri(h_iri, expand(s_namespace));
				},
			},

			// set json-ld @id property
			'@id': {
				value: h_iri.iri,
			},

			// set json-ld @type property
			'@type': {
				value: '@id',
			},
		};

		// iri suffix is available
		if(s_suffix) {

			// set shortcut id
			h_properties.$id = {
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

		// create virtual function for interface
		let k_literal = rmprop(function() {
			return h_literal.value;
		});

		// prepare hash of properties to set on virtual function
		let h_properties = {

			// change namespace
			$: {
				value: function(s_namespace) {
					return cover_literal(h_literal, expand(s_namespace));
				},
			},
		};

		// literal has it's datatype set
		if(h_literal.datatype) {

			// full path of datatype
			h_properties['@type'] = {
				value: h_literal.datatype,
			};

			// datatype iri can be suffixed
			if(h_literal.datatype.startsWith(p_namespace)) {

				// shorten datatype iri by removing namespace from beginning
				h_properties.$type = {
					value: h_literal.datatype.substr(p_namespace.length),
				};
			}
		}

		// define properties on literal's interface object
		Object.defineProperties(k_literal, h_properties);

		//
		return k_literal;
	};


	//
	const cover_collection = (a_collection, p_namespace) => {

		// before yielding a collection item, apply this function to it
		let f_collection_item = (h_item) => {

			// assert item only has one element
			if(1 !== h_item.length) {
				local.fail(`an rdf collection item somehow does not have exactly one object (it has ${h_item.length}):\n${arginfo(h_item)}`);
			}

			// before applying an iteration method, cover each item as networked node
			return cover_networked_node(h_item[0], p_namespace);
		};

		// create virtual function for interface
		let k_collection = rmprop(function(f_each) {

			// empty-args call
			if(0 === arguments.length) {

				// return collection as array
				return a_collection.map(f_collection_item);
			}
			// this is an implicit each call
			else if('function' === typeof f_each) {

				// each item
				a_collection.map(f_collection_item).forEach(f_each);
			}
			// other
			else {
				local.fail('calling a collection is an implicit forEach on the underlying list; method requires a callback function, instead got: '+arginfo(f_each));
			}
		});

		// prepare hash of properties to set on virtual funtion
		let h_properties = {

			// change namespace
			$: {
				value: function(s_namespace) {
					return cover_collection(a_collection, expand(s_namespace));
				},
			},
		};

		// extend with array-like interface
		map_array_interface(k_collection, a_collection, f_collection_item);

		// define properties on collection's interface object
		Object.defineProperties(k_collection, h_properties);

		// namespace is rdf: ; emulate rdf collection
		if(P_RDF_NAMESPACE === p_namespace) {

			// emulate rdf:first
			k_collection.first = cover_networked_node(a_collection[0][0]);

			// emulate rdf:rest
			let a_rest = a_collection.slice(1);
			k_collection.rest = a_rest.length? cover_collection(a_rest, p_namespace): cover_iri(H_IRI_RDF_NIL, P_RDF_NAMESPACE);
		}

		//
		return k_collection;
	};


	//
	const cover_networked_node = (h_object, p_namespace) => {

		// depending on type
		switch(h_object.type) {

			// blanknode
			case 'node':
				return network_node(h_object.node, p_namespace);

			// named thing
			case 'iri':
				return cover_iri(h_object, p_namespace);

			// literal
			case 'literal':
				return cover_literal(h_object, p_namespace);
		}

		// collection
		if(Array.isArray(h_object)) {
			return cover_collection(h_object, p_namespace);
		}

		// nothing matched
		local.fail('failed to handle unknown internal node type: "'+h_object.type+'" from object: '+arginfo(h_object));
	};


	//
	const network_node = (h_node, p_namespace) => {

		// prepare hash for storing all objects pointed to by namespace suffixes
		let h_suffixed_objects = {};

		// prepare hash for defining properties on network node
		let h_properties = {

			// namespace change method
			$: {

				// hide this property when iterating
				enumerable: false,

				// 
				value: function(s_namespace) {
					return network_node(h_node, expand(s_namespace));
				},
			},
		};

		// cache length of namespace string
		let n_namespace_length = p_namespace.length;

		// each property of json-ld node
		for(let s_key in h_node) {

			// json-ld property
			if('@' === s_key[0]) {

				// skip context node, for now...
				if('@context' === s_key) {

					// only warn about non-global context nodes
					if(h_node !== h_jsonld) {
						local.warn(`@context is currently unsupported on nested json-ld nodes; ignorning context on this node`);
					}
					continue;
				}

				// unsupported property
				if(!['@id', '@type'].includes(s_key)) {
					local.fail('unsupported json-ld property: `'+s_key+'`');
					continue;
				}

				// ref value
				let s_value = h_node[s_key];

				// points to blanknode
				if(s_value.startsWith('_:')) {

					// set natural json-ld property
					h_properties[s_key] = {

						// hide this property when iterating
						enumerable: false,

						// do not expand iri
						value: s_value,
					};

					// do not create accessor
					continue;
				}

				// expand iri to full path
				let p_iri = expand(s_value);

				// set natural json-ld property
				h_properties[s_key] = {

					// hide this property when iterating
					enumerable: false,

					// 
					value: p_iri,
				};

				// value can be suffixed
				if(p_iri.startsWith(p_namespace)) {

					// set accessor
					h_properties['$'+s_key.substr(1)] = {

						// hide this property when iterating
						enumerable: false,

						// 
						value: p_iri.substr(n_namespace_length),
					};
				}
			}
			// ld predicate
			else {

				// ref value
				let z_value = h_node[s_key];

				// fetch context of node
				let h_node_context = context(s_key);

				// get full predicate path
				let p_predicate = h_node_context.id;

				// predicate can be suffixed
				if(p_predicate.startsWith(p_namespace)) {

					// ref access name
					let s_access_name = p_predicate.substr(n_namespace_length);

					// wrap the node so it is an array of standardized objects
					let a_nodes = wrap_node(z_value, h_node_context);

					// store these nodes to the suffixed object hash
					h_suffixed_objects[s_access_name] = a_nodes;

					// set accessor in properties hash
					h_properties[s_access_name] = {

						// this predicate/object pair shows when iterating
						enumerable: true,

						// object is being requested
						get: () => {

							// more than one triple share this predicate
							if(a_nodes.length > 1) {

								// issue warning about using first triple
								local.warn(`more than one triple share the same predicate "${shorten(p_predicate)}" with subject "${h_node.id}". By using '.${s_access_name}', you are accessing any one of these triples arbitrarily`);
							}

							// ref first object
							let h_object = a_nodes[0];

							//
							return cover_networked_node(h_object, p_namespace);
						},
					};
				}
			}
		}


		// virtual function to create array of network nodes using namespaced suffix as predicate
		const k_node = rmprop(function(s_suffix, f_each) {

			// lookup nodes pointed to by this suffix
			let a_nodes = h_suffixed_objects[s_suffix];

			// nothing found
			if(!a_nodes) {
				return local.error(`no objects are pointed to by namespaced suffix "${s_suffix}" in {${shorten(p_namespace)}:}`);
			}

			// caller wants to iterate each item
			if('function' === typeof f_each) {

				// each item (a_nodes overrides Array.protoype)
				Array.prototype.forEach.call(a_nodes, (h_item) => {

					// cover node and pass to callback
					f_each(cover_networked_node(h_item, p_namespace));
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
	* public operator() ():
	**/

	// deduce top-level nodes
	const a_top_nodes = top_nodes(h_jsonld);

	// set the default public operator to a method container
	const operator = {};


	/**
	* public:
	**/

	// extend the array with methods that give control over graph
	{

		// jump across nodes by accessing javascript object properties prefixed by a given namespace
		operator.network = function(s_namespace, f_each) {

			// expand namespace iri
			let p_namespace = expand(s_namespace);

			// construct list of networked top-level nodes
			let a_nodes = (() => {

				// there are multiple things
				if(a_top_nodes.length) {
					return a_top_nodes.map((p_node) => {
						return network_node(h_graph[p_node], p_namespace);
					});
				}
				// there are 0 or there is only one thing
				else {

					// there are no things
					let a_keys = Object.keys(h_jsonld);
					if(1 === a_keys.length && '@context' === a_keys[0]) {
						return [];
					}
					// there is 1 thing
					else {
						return [network_node(h_jsonld, p_namespace)];
					}
				}
			})();

			// user passed implicit each callback
			if('function' === typeof f_each) {
				a_nodes.forEach(f_each);
			}

			// return mapped nodes
			return a_nodes;
		};
	}

	return operator;
};


/**
* public static operator() ()
**/
const local = function() {
	return __construct.apply(this, arguments);
};

/**
* public static:
**/
{

	//
	local.toString = function() {
		return __class_name+'()';
	};

	//
	local.stringify = function(z_what) {

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
	};
}



// prefix output messages to console with class's tag
require(__dirname+'/log-tag.js').extend(local, __class_name);

export default local;
