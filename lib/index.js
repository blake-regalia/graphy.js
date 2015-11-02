'use strict';

/**
* import:
**/

// native imports
// ...

// libraries
// ...

// local classes
// ...


const fetch_object = (z_value) => {

		// assume value type is a string
		let s_value = z_value;

		// value type is array (multiple triples share same predicate)
		if(Array.isArray(z_value)) {

			// issue warning about using first triple
			debug.warn(`more than one triple share the same predicate "${shorten(p_predicate)}" in object "${s_id}". By using '.${s_access_name}', you are accessing any one of these triples arbitrarily`);

			// use first value by default
			s_value = z_value[0];
		}

		// object is a node
		if('@id' === h_key_context['@type']) {

			// object is blanknode
			if(z_value.startsWith('_:')) {

				// locate blanknode in graph
				let h_blanknode = h_graph[z_value];

				// return new network node using same namespace
				return build_network(h_blanknode, p_namespace);
			}
			// object is named thing
			else {

				// create accessors for object
				let h_object_access = {

					// raw type of this object
					$: {
						value: 'iri',
					},

					// primitive string of iri
					'@id': {
						value: z_value,
					},
				};

				// box primitve value with String object
				let k_object = String(z_value);

				// set accessors on box
				return Object.defineProperties(k_object, h_object_access);
			}
		}
		// object is literal
		else {

			// create accessors for object
			let h_object_access = {

				// raw type of this object
				$: {
					value: 'literal',
				},

				// primitive string value of literal
				'@value': {
					value: z_value
				},
			};

			// datatype of literal exists
			if(h_key_context['@type']) {

				// ref datatype
				let s_datatype = h_key_context['@type'];

				// set datatype accessor
				h_object_access['@type'] = {
					value: s_datatype,
				};

				// datatype can be suffixed
				if(s_datatype.startsWith(p_namespace)) {

					// set suffixed datatype accessor
					h_object_access['$type'] = {
						value: s_datatype.substr(n_namespace_length),
					};
				}

				// datatype suggests that unboxing is possible
				if(H_UNBOXERS[s_datatype]) {

					// set unboxing primitve datatype accessor
					h_object_access['$value'] = {
						value: H_UNBOXERS[s_datatype](z_value),
					};
				}
			}

			// box primitve value with String object
			let k_object = String(z_value);

			// set accessors on box
			return Object.defineProperties(k_object, h_object_access);
		}
	}
};


/**
* private static:
**/
const __class_name = 'LdQuery';


var P_RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';


// a default prototype for creating objects with absolutely no properties
const VIRTUAL_OBJECT = Object.getOwnPropertyNames(Object.prototype).reduce((h_prototype, s_property) => {
	h_prototype[s_property] = undefined;
	return h_prototype;
}, {});

//
const VIRTUAL_FUNCTION_PROPERTIES = (() => {
	let h_undefine_properties = {};
	let f_instance = function(){};
	let z_prototype = f_instance;
	do {
		z_prototype = z_prototype.__proto__;
		Object.getOwnPropertyNames(z_prototype).forEach((s_property) => {
			h_undefine_properties[s_property] = undefined;
		});
	} while(z_prototype !== null);
	return h_undefine_properties;
});

//
const virtual_function = (f_instance) => {
	return Object.defineProperties(f_instance, VIRTUAL_FUNCTION_PROPERTIES);
};


// primitive datatype unboxers
const H_UNBOXERS = {
	'http://www.w3.org/2001/XMLSchema#string': (a) => a+'',
	'http://www.w3.org/2001/XMLSchema#integer': (a) => parseInt(a),
	'http://www.w3.org/2001/XMLSchema#decimal': (a) => parseFloat(a),
};


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

	const a_graph = h_jsonld['@graph'];

	var h_model = {};



	// 
	const build_network(h_node, p_namespace) = () => {

		//
		let k_node = {};

		//
		let h_access = {};

		let n_namespace_length = p_namespace.length;

		// each property of json-ld node
		for(let s_key in h_node) {

			// json-ld property
			if('@' === s_key[0]) {

				// unsupported property
				if(!['@id','@type'].includes(s_key)) {
					debug.fail('unsupported json-ld property: `'+s_key+'`');
					continue;
				}

				// ref value
				let s_value = h_node[s_key];

				// points to blanknode, do not create accessor
				if(s_value.startsWith('_:')) continue;

				// expand iri to full path
				let p_iri = expand(s_value);

				// value can be suffixed
				if(p_iri.startsWith(p_namespace)) {

					// set accessor
					h_access['$'+s_p] = {
						value: p_iri.substr(n_namespace_length),
					};
				}
			}
			// ld predicate
			else {

				// ref value
				let z_value = h_node[s_key];

				// fetch context of key
				let h_key_context = h_context[s_key];

				// get full predicate path
				let p_predicate = h_key_context['@id'];

				// predicate can be suffixed
				if(p_predicate.startsWith(p_namespace)) {

					// ref access name
					let s_access_name = p_predicate.substr(n_namespace_length);

					// value type is an object
					if('object' === typeof z_value) {

						// ld object is a collection
						if(z_value['@list']) {

							// ref collection
							let a_list = z_value['@list'];

							// set accessor for collection
							h_accessor = {

								// provide array-like functionality to accessor
								forEach: (f_each) => {

									// each object
									a_list.forEach((s_node) => {

										// send callback covered object
										f_each(
											cover_object(s_node)
										);
									});
								},
							};
						}
						// unknown ld type
						else {
							return debug.fail('expected json-ld object to be a collection but no `@list` property exists');
						}
					}
					// value type is string or array
					else {

						// set accessor for literal
						h_accessor = cover_object(z_value);
					}


					// set accessor in access hash
					h_access[s_access_name] = {

						// this predicate/object pair shows when iterating
						enumerable: true,

						// object is being requested
						get: h_accessor,
					};
				}
			}
		}


		// create virtual object using access hash for properties
		const k_node = virtual_function(h_access);

		// fetch network node using namespaced predicate suffix
		let k_network = function(s_name) {

			//
			h_node
		};

		//

	};



	// wraps a json-ld object with our javascript interface
	const wrap_node = (z_object) => {

		// subject type is a javascript string
		if('string' === typeof z_object) {

			// identifier points to blank node
			if(z_object.startsWith('_:')) {

				// return that node
				return h_network[z_object];
			}
			// identifier points to named thing
			else if(z_object.includes(':')) {

				// return full url
				return expand(z_object);
			}
			// string literal
			else {

				// return literal
				return z_object;
			}
		}

		// subject type is a javsascript object
		else if('object' === typeof z_object) {

			// multiple triples share same predicate
			if(Array.isArray(z_object)) {

				// return 0th object (first triple that matches)
				return z_object[0];
			}

			// this is an ordered list
			else if(z_object.hasOwnProperty('@list')) {

				// wrap each item in the list
				return z_object['@list'].map(wrap);
			}

			// literal
			else if(z_object.hasOwnProperty('@value')) {

				// expand type (replace with full path)
				var p_type = z_object['@type'] = expand(z_object['@type']);

				// convenient shortened type
				if(s_trim === p_type.substr(0, ls_trim)) {
					z_object.$type = p_type.substr(ls_trim);
				}

				return z_object;
			}

			// external named thing (or blanknode)
			else if(z_object.hasOwnProperty('@id')) {

				// blanknode
				if(z_object['@id'].startsWith('_:')) {
					return k_network[z_object['@id']];
				}
				// external named thing
				else {
					var p_id = expand(z_object['@id']);
					var h_object = {};
					Object.defineProperties(h_object, {
						$: {
							value: 'uri',
						},
						'@id': {
							value: p_id,
						},
					});
					if(s_trim === p_id.substr(0, ls_trim)) {
						Object.defineProperty(h_object, '$id', {
							value: p_id.substr(ls_trim),
						});
					}
					return h_object;
				}
			}
		}

		// subject type is a javascript number
		else if('number' === typeof z_object) {
			return z_object;
		}

		return 'unknown';
	};



	//
	const cover = (h_node) => {

		// query for a predicate
		let f_query = function(s_predicate) {

		};

		// build traversal network
		f_query.traverse = (s_iri) => {

			// build network
			return build_network(h_node, expand(s_iri));
		};

		//
		return f_query;
	};


	//
	const restructure = (a_graph) => {

		//
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

		// each node
		a_graph.forEach((h_node) => {

			// each key/value pair
			for(let s_key in h_node) {

				// skip non-property keys
				if('@' === s_key[0]) continue;

				// value type is a string
				if('string' === typeof h_node[s_key]) {

					// get context of key
					let h_key_context = h_context[s_key];

					// key has no context, must not point to a blanknode
					if(!h_key_context) continue;

					// this node points to a blanknode
					if('@id' === h_key_context['@type'] && h_node[s_key].startsWith('_:')) {

						// remove that blanknode from top level
						a_top_level_nodes.delete(h_node[s_key]);
					}
				}
			}
		});

		// cover each top-level node and return that
		return Array.from(a_top_level_nodes).map(cover);
	};


	/**
	* public operator() ():
	**/
	const operator = restructure(a_graph);


	/**
	* public:
	**/
	{

		// traverse each node in graph
		operator['traverse'] = function(s_iri, f_each) {

			// each node
			operator.forEach((h_node) => {

				// build network
				let k_network = build_network(h_node, expand(s_iri))

				// send to callback
				f_each(k_network);
			});
		};
	}

	// configurations
	{
	}

	return operator;
};

/**
* public static operator() ()
**/
const local = function() {

	// called with `new`
	if(new.target) {
		var instance = __construct.apply(this, arguments);
		return instance;
	}
	// called directly
	else {
		if(arguments.length) {
			return d_global_instance.apply(this, arguments);
		}
		return d_global_instance;
	}
};

/**
* public static:
**/
{

	// 
	local['toString'] = function() {
		return __class_name+'()';
	};
}


// prefix output messages to console with class's tag
require('./log-tag.js').extend(exports, __class_name);


export default local;