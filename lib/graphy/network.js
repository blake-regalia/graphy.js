
/**
* private static:
**/


// private members
const _private = Symbol();
// const _network = Symbol();
const _graph = Symbol();
const $resolve = Symbol();
const $Knob = Symbol();


/**
* helpers:
**/

// find and return longest iri from a given hash of prefixes
const longest_prefix = (p_iri, h_prefixes) => {

	// prep to find best prefix
	let s_best_prefix_name = '';
	let n_longest_iri_length = 0;

	// search prefix hash
	for(let s_prefix in h_prefixes) {
		let s_iri = h_prefixes[s_prefix];

		// namespace can prefix the given iri
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
		namespace: h_prefixes[s_best_prefix_name],
	};
};


/**
* helper classes:
**/

// creates a new bunch (list of terms of the same type) after filter function
function Bunch(a_terms) {
	this.terms = a_terms;
}
// methods of the bunch class (separated for implementing pseudo-proxies)
const BunchMethods = {

	// applies filter callback function to each Term in this Bunch
	filter(f_filter) {
		throw '.filter must be overriden by subclass';
	},
};
// put methods into prototype
Bunch.prototype = BunchMethods;

// creates a new literal bunch
function LiteralBunch(a_terms) {
	this.terms = a_terms;
}

LiteralBunch.prototype = Object.assign(Object.create(Bunch.prototype), {
	termType: 'Literal',
	areLiterals: true,

	// applies filter callback function to each Term in this Bunch
	filter(f_filter) {
		return new LiteralBunch(this.terms.filter(f_filter));
	},

	// returns an Array of strings that are the IRIs of each Literal in this Bunch
	datatypes() {
		return this.terms.map(h_term => h_term.datatype);
	},

	// returns an Array of strings that are the languages of each Literal in this Bunch
	languages() {
		return this.terms.map(h_term => h_term.datatype);
	},
});


// filter literals
LiteralBunch.filter = function(z_literal_filter) {
	// user wants to filter literal by language or datatype
	if('string' === typeof z_literal_filter) {
		// by language tag
		if('@' === z_literal_filter[0]) {
			// ref language tag
			let s_language = z_literal_filter.slice(1).toLowerCase();

			// apply filter
			return new Bunch(this.filter((h_term) => {
				return s_language === h_term.language;
			}));
		}
		// by datatype
		else {
			// resolve datatype iri
			let p_datatype = this.resolve(z_literal_filter);

			// apply filter
			return this.filter((h_term) => {
				return p_datatype === h_term.datatype;
			});
		}
	}
	// user wants to filter literal by a function
	else if('function' === typeof z_literal_filter) {
		// apply filter
		return this.filter(z_literal_filter);
	}

	// no filtering
	return this;
};


// make a new bunch of a given type
const mk_Bunch = function(k_network, f_bunch_type, a_terms) {
	// operator
	let f_operator = Object.assign(f_bunch_type.bind(a_terms), {
		terms: a_terms,
	});

	Object.setPrototypeOf(f_operator, BunchMethods);
	// OR copy
	// for(let s_method in BunchMethods) {
	// 	f_operator[s_method] = BunchMethods[s_method];
	// }

	return f_operator;
};

// create a bag of objects by traversing a link stemming from a single knob
function Link(...a_args) {
	// assume args are paths
	let a_paths = a_args;

	// first arg is array
	if(Array.isArray(a_args[0])) {
		// convert it to paths
		a_paths = a_args[0];
	}

	// ref the pairs stemming from this subject
	let h_pairs = this.pairs;

	// single path
	if(1 === a_paths.length) {
		// resolve n3
		let p_path = this.resolve(a_paths[0]);

		// return a new bag
		return new Bag(h_pairs[p_path]);
	}
	// multiple paths (the OR operation)
	else {
		// prep to accumulate all objects
		let a_elements = [];

		// merge the objects from each path
		for(let i_path=0; i_path<a_paths.length; i_path++) {
			a_elements.push.apply(a_elements, h_pairs[a_paths[i_path]]);
		}

		// return a new bag
		return new Bag(a_elements);
	}
}


class Node {
	constructor(h_graph, p_uri) {
		// ref pairs
		let h_pairs = this.graph[p_uri];

		// prep context
		let h_context = {
			graph: h_graph,
			node_id: this.value,
			pairs: h_pairs,
		};
		Object.assign(this, {
			// [_network]: k_network,
			value: p_uri,
			links: h_pairs,

			// create the link function/hash
			at: Object.setPrototypeOf(Link.bind(h_context), this.namespace),
		});
	}

	// identity property
	get of() {
		return this;
	}

	//
	get all() {
		// prep list of terms for new bag
		let a_terms = [];

		// ref hash of pairs
		let h_pairs = this.pairs;

		// each predicate; concat all objects to list of terms
		for(let p_predicate in h_pairs) {
			a_terms.push.apply(a_terms, h_pairs[p_predicate]);
		}

		// make bag
		let k_bag = new Bag();

		// memoize
		Object.defineProperty(this, 'all', k_bag);
	}
}

class Bag {
	constructor(a_terms) {
		Object.assign(this, {
			terms: a_terms || [],
		});
	}

	// selects exactly one Term from the unordered list and returns its `.value`
	first() {
		return this.terms.length? this.terms[0].value: undefined;
	}

	// fetches all elements' `.value` property
	values() {
		return this.terms.map(h_term => h_term.value);
	}

	// fetches all elements’ `.termType` property
	termTypes() {
		return this.terms.map(h_term => h_term.termType);
	}

	// selects only terms of type Literal and applies an optional filter
	get literals() {
		// materialize on instance
		Object.defineProperty(this, 'literals', {
			value: mk_Bunch(this, LiteralBunch, this.terms.filter((h_term) => {
				return h_term.isLiteral;
			})),
		});

		// return chain/function
		return this.literals;
	}

	// selects only distinct terms of type NamedNode or BlankNode and applies an optional filter
	get nodes() {
		// materialize on instance
		Object.defineProperty(this, 'nodes', {
			value: ,
		});

		// return chain/function
		return this.nodes;
	}

	// selects only distinct terms of type NamedNode, optionally filters nodes whos IRIs start with prefix, and then applies an optional filter
	get namedNodes() {
		// materialize on instance
		Object.defineProperty(this, 'namedNodes', {
			value: ,
		});

		// return chain/function
		return this.namedNodes;
	}

	// selects only distinct terms of type BlankNode and applies an optional filter
	get namedNodes() {
		// materialize on instance
		Object.defineProperty(this, 'blankNodes', {
			value: ,
		});

		// return chain/function
		return this.blankNodes;
	}
}


/**
* class:
**/
class Graph {

	constructor(h_graph, h_prefixes) {

		/**
		* private:
		**/

		// prep hash of root nodes
		let h_roots = {};

		// track all blank node labels in use to prevent conflicts
		let h_labels = {};

		// prepare array for all covered nodes
		let a_entities_unnamespaced = [];

		//
		const resolve = (s_n3) => {
			// absolute iri
			if('<' === s_n3[0]) return s_n3.slice(1, -1);

			// get prefix from n3
			let s_prefix = s_n3.split(':')[0];

			// ref prefix iri
			let p_iri = h_prefixes[s_prefix];

			// prefix not found
			if(!p_iri) return;

			// make full URI
			return p_iri + s_n3.slice(s_prefix.length+1);
		};


		/**
		* subclasses:
		**/

		//
		let i_anon = 0;

		// save private members
		Object.assign(this, {
			resolve,
			graph: h_graph,
			roots: h_roots,

			// allow user to create new blank nodes with collision-free labels
			next_label() {
				let s_label = '';
				do {
					s_label = 'g' + (i_anon++);
				} while (h_labels[s_label]);

				// claim this label, and remember that we invented it
				h_labels[s_label] = 1;

				// return the label
				return s_label;
			},

			[_private]: {

				//
				graph: h_graph,
				prefixes: h_prefixes,

				// weak map of knobs
				hm_knobs: new WeakMap(),
			},

			[$Knob]: Knob,
			// [$network_node]: network_node,
		});


		// set prefixes for Knob prototypes
		const PrefixNamespace = {};
		Object.keys(h_prefixes).forEach((s_prefix_id) => {
			// ref prefix iri & cache its length
			let p_prefix_iri = h_prefixes[s_prefix_id];
			let n_prefix_iri = p_prefix_iri.length;

			// define prefix property on namespace prototype object
			Object.defineProperty(PrefixNamespace, s_prefix_id, {

				// make a hash of suffixes
				get() {
					// prep the operator
					let h_operator = {};

					// ref predicate-object pairs hash
					let h_pairs = h_graph[this.$];

					// each predicate in pairs hash
					Object.keys(h_pairs).forEach((p_predicate) => {
						// predicate indeed starts with this prefix
						if(p_predicate.startsWith(p_prefix_iri)) {
							// add to operator hash
							Object.defineProperty(h_operator, p_predicate.slice(n_prefix_iri), {
								// once this namespace is accessed
								get() {
									// memoize
									delete this[p_predicate];
									return this[p_predicate] = new Bag(h_pairs[p_predicate]);
								}
							});
						}
					});

					return h_operator;
				},
			});
		});


		/**
		* main:
		**/

		// ref all subject nodes in graph by their subject id
		let a_nodes = Object.keys(h_graph);


		// grant assumption that every subject node is an entry node
		for(let i_node=0; i_node<a_nodes.length; i_node++) {
			let s_node_id = a_nodes[i_node];
			h_roots[s_node_id] = h_graph[s_node_id];
		}

		// each subject node in graph; 
		for(let i_node=0; i_node<a_nodes.length; i_node++) {
			// ref node id (blanknode or full iri)
			let s_id = a_nodes[i_node];

			// subject is a blank node; record which labels are in use
			let b_subject_blank;
			if(' ' === s_id[0]) {
				b_subject_blank = true;
				h_labels[s_id.slice(1)] = 1;
			}

			// ref node object
			let h_node = h_graph[s_id];

			// each predicate link
			for(let s_predicate in h_node) {
				// ref objects list
				let a_objects = h_node[s_predicate];

				// each object
				for(let i_object=0; i_object<a_objects.length; i_object++) {
					// ref object
					let y_object = a_objects[i_object];

					// object is blank node
					if(y_object.isBlankNode) {
						// ref blank node label
						let s_label = y_object.value;

						// remove that blank node from entry level
						delete h_roots[' '+s_label];

						// record label as in use
						h_labels[s_label] = 1;
					}
				}
			}
		}
	}

	// 	// create knob for each entry node
	// 	for(let s_subject_id in h_roots) {
	// 		// ref 
	// 		h_roots[s_subject_id]
	// 	}



	// 		// each node; go searching for blanknode objects
	// 		a_expanded.forEach((h_node) => {

	// 			// each key/value pair
	// 			for(let s_key in h_node) {

	// 				// skip json-ld keys
	// 				if('@' === s_key[0]) continue;

	// 				// ref value
	// 				let a_objects = h_node[s_key];

	// 				// assert objects is array
	// 				if(!Array.isArray(a_objects)) {
	// 					local.fail(`expecting json-ld object to be array; instead got: ${arginfo(a_objects)}`);
	// 				}

	// 				// each object
	// 				a_objects.forEach((h_object) => {

	// 					// object is node
	// 					if(h_object.hasOwnProperty('@id')) {
	// 						let s_id = h_object['@id'];

	// 						// object is blanknode
	// 						if('_' === s_id[0] && ':' === s_id[1]) {
	// 							// remove that blanknode from top level
	// 							delete h_top_level_nodes[s_id];
	// 						}
	// 					}
	// 					// object is collection
	// 					else if(h_object.hasOwnProperty('@list')) {

	// 						// each item in collection
	// 						h_object['@list'].forEach((h_item) => {

	// 							// item is node; ref its id
	// 							if(h_item.hasOwnProperty('@id')) {
	// 								let s_id = h_item['@id'];

	// 								// item is blanknode
	// 								if('_' === s_id[0] && ':' === s_id[1]) {
	// 									// remove that blanknode from top level
	// 									delete h_top_level_nodes[s_id];
	// 								}
	// 							}
	// 						});
	// 					}
	// 				});
	// 			}
	// 		});

	// 		// convert top-level nodes hash into array, save to local field
	// 		this[_private].a_top_nodes = Object.keys(h_top_level_nodes);

	// 		// use entities array as operator
	// 		f_okay_graphy(a_entities_unnamespaced);
	// 	});
	// }
}


class Graph {
	constructor(s_graph_id, h_nodes, h_prefixes) {

		this.id = s_graph_id;
		this.nodes = h_nodes;
	}

	// enter the graph at the given node
	enter(z_node) {
		let p_uri = this[$resolve](z_node);

			// node not found
			if(!this[_graph][p_uri]) return;

			// make knob
			return new this[$Knob](this, p_uri);
		}
		else {
			throw 'unrecognized node type';
		}
	}
}

class Store {
	constructor(h_graphs, h_prefixes) {
		let k_graphs = {};

		for(let s_graph_id in h_graphs) {
			Object.defineProperty(k_graphs, s_graph_id, {
				get() {
					delete k_graphs[s_graph_id];
					return k_graphs[s_graph_id] = new Graph(s_graph_id, h_graphs[s_graph_id], h_prefixes);
				},
			});
		}

		this.graphs = k_graphs;
	}
}


// makes network creator
module.exports = function(f_parse, b_default_graph) {

	// return network creator
	return b_default_graph? function(z_input, f_okay_graph) {

		// prep a store of graphs; each graph [subject_id] => predicate-object pairs
		let h_default_graph = {};

		// parse document
		f_parse(z_input, {

			// create the map
			data(h_triple) {
				// ref subject of triple
				let h_subject = h_triple.subject;

				// create subject id
				let s_subject_id = h_subject.isBlankNode? '_:'+h_subject.value: h_subject.value;

				// a triple with subject exists
				if(h_default_graph[s_subject_id]) {
					// ref its links
					let h_links = h_default_graph[s_subject_id];

					// ref predicate
					let s_predicate = h_triple.predicate.value;

					// ref or make object list
					h_links[s_predicate] = h_links[s_predicate] || [];

					// add this object to the list
					h_links[s_predicate].push(h_triple.object);
				}
				// no such triples with subject exist yet
				else {
					// create mapping
					h_default_graph[s_subject_id] = {
						// create reserved keys
						'^term': h_subject,
						'^direction': 1,

						// create link to sole object in list
						[h_triple.predicate.value]: [h_triple.object],
					};
				}
			},

			// immediately forward error to callback
			error(e_parse) {
				f_okay_graph(e_parse);
			},

			// end of file/stream
			end(h_prefixes) {
				let k_store = new Store({'': h_default_graph}, h_prefixes);
				f_okay_graph(null, k_store.graphs[''], k_store);
			},
		});
	} : function(z_input, f_okay_graph) {

		// prep a store of graphs; each graph [subject_id] => predicate-object pairs
		let h_store = {};

		// prep a default graph
		let h_default_graph = h_store[''] = {
			'^term': 
		};

		// parse document
		f_parse(z_input, {

			// create the map
			data(h_triple) {
				// ref graph of the triple
				let h_graph = h_triple.graph;

				// create graph id
				let s_graph_id = h_graph.isBlankNode? '_:'+h_graph.value: h_graph.value;

				// ref/create triples container
				let h_triples = h_store[s_graph_id] = h_store[s_graph_id] || {};

				// ref subject of triple
				let h_subject = h_triple.subject;

				// create subject id
				let s_subject_id = h_subject.isBlankNode? '_:'+h_subject.value: h_subject.value;

				// a triple with subject exists
				if(h_triples[s_subject_id]) {
					// ref its links
					let h_links = h_triples[s_subject_id];

					// ref predicate
					let s_predicate = h_triple.predicate.value;

					// ref or make object list
					h_links[s_predicate] = h_links[s_predicate] || [];

					// add this object to the list
					h_links[s_predicate].push(h_triple.object);
				}
				// no such triples with subject exist yet
				else {
					// create mapping
					h_triples[s_subject_id] = {
						// create reserved keys
						'^term': h_subject,
						'^direction': 1,

						// create link to sole object in list
						[h_triple.predicate.value]: [h_triple.object],
					};
				}
			},

			// immediately forward error to callback
			error(e_parse) {
				f_okay_graph(e_parse);
			},

			// end of file/stream
			end(h_prefixes) {
				let k_store = new Store(h_store, h_prefixes);
				f_okay_graph(null, k_store.graphs[''], k_store);
			},
		});
	};
};