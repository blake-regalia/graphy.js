

/**
* globals:
**/

// reference to the main graphy instance
const graphy = module.parent.exports;



// const K_EMPTY_ARRAY = function() {
// 	console.warn('empty set');
// 	return [];
// };
// const K_VOID = function() {
// 	return this;
// };
// Object.assign(K_VOID, {
// 	at: K_VOID,
// 	inverseAt: K_VOID,
// 	is: K_VOID,
// 	of: K_VOID,
// 	all: K_VOID,
// 	inverseAll: K_VOID,
// 	nodes: K_VOID,
// 	namedNodes: K_VOID,
// 	blankNodes: K_VOID,
// 	literals: K_VOID,

// 	values: K_EMPTY_ARRAY,
// 	datatypes: K_EMPTY_ARRAY,
// 	languages: K_EMPTY_ARRAY,
// });
// for(let s_method in H_EMPTY_SET_CHAINS) {
// 	Object.defineProperty(K_VOID, s_method, {
// 		get() {

// 		},
// 	})
// }


class Node {
	constructor(k_graph, h_links) {
		// store ref to graph
		this.graph = k_graph;

		// ref some utilities
		this.resolve = k_graph.resolve.bind(k_graph);

		// ref node's term and set local field
		let h_term = h_links['^term'];

		// store links
		this.links = h_links;

		// emulate extending NamedNode|BlankNode by copying its properties from instance
		this.termType = h_term.termType;
		this.value = h_term.value;
		if(h_term.isBlankNode) {
			this.isBlankNode = true;
		}
		else {
			this.isNamedNode = true;
		}

		// create semantic access paths
		// ..
	}

	get at() {
		// user wants to use Namespace
		Object.defineProperty(this, 'at', {
			value: Object.create(this.graph.namespaces, {
				'^links': {
					enumerable: false,
					value: this.links,
				},
			}),
		});
		return this.at;
	}

	//
	hop(s_n3) {
		let p_predicate = this.resolve(s_n3);

		// ref object
		let a_objects = this.links[p_predicate] || [];

		// return or make Bag
		return a_objects.bag || new Bag(this.graph, a_objects);
	}
}


class Bag {
	constructor(k_graph, a_terms) {
		// don't ever recreate this Bag :)
		a_terms.bag = this;

		// set local fields
		this.graph = k_graph;
		this.terms = a_terms;

		// for returning a different sample each time
		this.sample_counter = 0;
	}

	// fetch the first/next+ Term's value
	sample() {
		// ref terms
		let a_terms = this.terms;

		// empty
		if(!a_terms.length) return;

		// add-mod counter
		let i_sample = this.sample_counter = (this.sample_counter + 1) % a_terms.length;

		// return the next sample's value
		return a_terms[i_sample].value;
	}

	// apply a filter callback to terms
	filter(f_filter, b_new_instance) {
		if(b_new_instance) {
			return new Bag(this.graph, this.terms.filter(f_filter));
		}
		else {
			this.terms = this.terms.filter(f_filter);
			this.sample_counter = 0;
		}
	}

	// fetch all Terms' .value
	values() {
		return this.terms.map(h => h.value);
	}

	// fetch all Terms' .termType
	termTypes() {
		return this.terms.map(h => h.termType);
	}

	// selects only Terms of type Literal and applies an optional filter
	get literals() {
		// materialize on instance
		Object.defineProperty(this, 'literals', {
			value: mk_LiteralBunch(this.graph, this.terms.filter(h => h.isLiteral)),
		});

		// return chain/function
		return this.literals;
	}

	// selects only distinct Terms of type NamedNode or BlankNode and applies an optional filter
	get nodes() {
		// materialize on instance
		Object.defineProperty(this, 'nodes', {
			value: mk_NodeSet(this.graph, this.terms.filter(h => h.isNamedNode || h.isBlankNode)),
		});

		// return chain/function
		return this.nodes;
	}

	// selects only distinct Terms of type NamedNode, optionally filters nodes whos IRIs start with prefix, and then applies an optional filter
	get namedNodes() {
		// materialize on instance
		Object.defineProperty(this, 'namedNodes', {
			value: mk_NodeSet(this.graph, this.terms.filter(h => h.isNamedNode), true),
		});

		// return chain/function
		return this.namedNodes;
	}

	// selects only distinct Terms of type BlankNode and applies an optional filter
	get blankNodes() {
		// materialize on instance
		Object.defineProperty(this, 'blankNodes', {
			value: mk_NodeSet(this.graph, this.terms.filter(h => h.isBlankNode), true),
		});

		// return chain/function
		return this.blankNodes;
	}
}



//
const NodeSet_prototype = {
	areNodes: true,

	get of() {
		return this;
	},
	get length() {
		return this.nodes.length;
	},

	hop(s_n3) {
		let p_predicate = this.graph.resolve(s_n3);

		// no such prefix, return an empty Bag
		if(!p_predicate) return new Bag(this.graph, []);

		// otherwise, create a Bag of flattened object lists
		let a_objects = this.nodes.reduce((a_terms, k) => {
			a_terms.push.apply(a_terms, k.links[p_predicate] || []);
			return a_terms;
		}, []);
		return new Bag(this.graph, a_objects);
	},

	// ...
};

// makes a new NodeSet
function mk_NodeSet(k_graph, a_terms, s_term_types) {
	// prep to reduce nodes to a set
	let h_nodes = {};

	// nodes are all NamedNodes
	if('NamedNode' === s_term_types) {
		for(let i_term=0; i_term<a_terms.length; i_term++) {
			let h_term = a_terms[i_term];
			h_nodes[h_term.value] = 1;
		}
	}
	// nodes are all BlankNodes
	else if('BlankNodes' === s_term_types) {
		for(let i_term=0; i_term<a_terms.length; i_term++) {
			let h_term = a_terms[i_term];
			h_nodes['_:'+h_term.value] = 1;
		}
	}
	// nodes are mixed
	else {
		for(let i_term=0; i_term<a_terms.length; i_term++) {
			let h_term = a_terms[i_term];
			h_nodes[h_term.isBlankNode? '_:'+h_term.value: h_term.value] = 1;
		}
	}

	// reduce nodes to a set
	let as_nodes = [];
	for(let s_node_id in h_nodes) {
		let k_node = k_graph.nodes[s_node_id];

		// only add subject nodes that exist to the set
		if(k_node) as_nodes.push(k_node);
	}

	// make instance
	let h_methods = Object.assign(Object.create(NodeSet_prototype), {
		graph: k_graph,
		nodes: as_nodes,

		areNodes: true,
	});

	// construct 'that'
	let f_bound = NodeSet_operator.bind(h_methods);

	debugger;

	// make & return operator
	Object.setPrototypeOf(f_bound, NodeSet_prototype);
	return Object.assign(f_bound, h_methods);
}

// mutates the NodeSet exactly once with the given filter argument
function NodeSet_operator(f_filter) {
	return this.nodes.filter(f_filter);
}

//
const LiteralBunch_prototype = {
	areLiterals: true,

	filter(f_filter) {
		return Object.assign(Object.create(LiteralBunch_prototype), {
			graph: this.graph,
			terms: this.terms.filter(f_filter),
			sample_counter: 0,
		});
	},

	// fetch the first/next+ Literal's value
	sample() {
		// ref terms
		let a_terms = this.terms;

		// empty
		if(!a_terms.length) return;

		// add-mod counter
		let i_sample = this.sample_counter = (this.sample_counter + 1) % a_terms.length;

		// return the next sample's value
		return a_terms[i_sample].value;
	},

	// fetch all Literals' .value
	values() {
		return this.terms.map(h => h.value);
	},

	// fetch all Literals' .datatype
	datatypes() {
		return this.terms.map(h => h.datatype);
	},

	// fetch all Literals' .language
	languages() {
		return this.terms.map(h => h.language);
	},
};

// makes a new LiteralBunch
function mk_LiteralBunch(k_graph, a_terms) {
	// append local methods to hash
	let h_methods = Object.assign(Object.create(LiteralBunch_prototype), {
		graph: k_graph,
		terms: a_terms,

		// for returning a different sample each time
		sample_counter: 0,
	});

	// construct 'that'
	let f_bound = LiteralBunch_operator.bind(h_methods);

	// make & return operator
	Object.setPrototypeOf(f_bound, LiteralBunch_prototype);
	return Object.assign(f_bound, h_methods);
}

// mutates the LiteralBunch exactly once with the given filter argument
function LiteralBunch_operator(z_literal_filter) {
	// user wants to filter literal by language or datatype
	if('string' === typeof z_literal_filter) {
		// by language tag
		if('@' === z_literal_filter[0]) {
			// ref language tag
			let s_language = z_literal_filter.slice(1).toLowerCase();

			// apply filter
			this.terms = this.terms.filter((h_term) => {
				return s_language === h_term.language;
			});
		}
		// by datatype
		else {
			// resolve datatype iri
			let p_datatype = this.resolve(z_literal_filter);

			// apply filter
			this.terms = this.terms.filter((h_term) => {
				return p_datatype === h_term.datatype;
			});
		}
	}
	// user wants to filter literal by a function
	else if('function' === typeof z_literal_filter) {
		// apply filter
		this.terms = this.terms.filter(z_literal_filter);
	}

	// results / no filtering
	return this;
}



class Graph {
	constructor(h_nodes, h_prefixes) {
		this.term = h_nodes['^term'];
		this.prefixes = h_prefixes;

		// prep set of subject Nodes
		let k_nodes = this.nodes = Object.defineProperty({}, '^term', {
			value: h_nodes['^term'],
			enumerable: false,
		});

		// track all blank node labels used in graph to prevent collisions
		let h_labels = this.labels = {};

		// prep roots
		let k_roots = this.roots = {};

		// each subject node in graph; make new scope for async memoizers
		Object.keys(h_nodes).forEach((s_node_id) => {

			// make Node access memoizer
			Object.defineProperty(k_nodes, s_node_id, {
				configurable: true,
				get: () => {
					Object.defineProperty(k_nodes, s_node_id, {
						value: new Node(this, h_nodes[s_node_id]),
					});
					return k_nodes[s_node_id];
				},
			});

			// start with assumption that all subject nodes are roots
			k_roots[s_node_id] = k_nodes[s_node_id];

			// subject is a blank node; record which labels are in use
			if(s_node_id.startsWith('_:')) {
				h_labels[s_node_id.slice(2)] = 1;
			}
		});

		// each subject node in graph; remove blank node objects from roots
		for(let s_node_id in h_nodes) {
			let h_node = h_nodes[s_node_id];

			// each predicate link
			for(let s_predicate in h_node) {
				// ref objects list
				let a_objects = h_node[s_predicate];

				// each object
				for(let i_object=0; i_object<a_objects.length; i_object++) {
					let y_object = a_objects[i_object];

					// object is blank node
					if(y_object.isBlankNode) {
						// ref blank node label
						let s_label = y_object.value;

						// remove that blank node from roots
						delete k_roots['_:'+s_label];
					}
				}
			}
		}

		// prep namespace accessor descriptor
		let h_descriptor = {};

		// ref graph instance
		let k_graph = this;

		// create a scope for each prefix
		Object.keys(h_prefixes).forEach((s_prefix_id) => {
			let p_prefix_iri = h_prefixes[s_prefix_id];
			let n_prefix_iri = p_prefix_iri.length;

			// make the descriptor to define this key
			h_descriptor[s_prefix_id] = {
				// user accessing namespace on a Node instance
				get() {
					// ref links
					let h_links = this['^links'];

					// prep the Namespace
					let k_namespace = {};

					// test each link
					for(let p_predicate_iri in h_links) {
						// predicate is in namespace
						if(p_predicate_iri.startsWith(p_prefix_iri)) {
							// add suffix to namespace
							k_namespace[p_predicate_iri.substr(n_prefix_iri)] = new Bag(k_graph, h_links[p_predicate_iri]);
						}
					}

					// memoize namespace to instance
					Object.defineProperty(this, s_prefix_id, {
						value: k_namespace,
					});

					// return its value
					return this[s_prefix_id];
				},
			};
		});

		// define descriptor on namespace accessor
		this.namespaces = Object.defineProperties({}, h_descriptor);
	}

	// enter the graph at the given node
	enter(s_node) {
		let p_uri = this.resolve(s_node);

		// node not found
		if(!this.nodes[p_uri]) return K_VOID;

		// make Node
		return this.nodes[p_uri];
	}

	//
	resolve(s_n3) {
		// absolute iri
		if('<' === s_n3[0]) return s_n3.slice(1, -1);

		// get prefix from n3
		let s_prefix = s_n3.split(':')[0];

		// ref prefix iri
		let p_iri = this.prefixes[s_prefix];

		// prefix not found
		if(!p_iri) {
			console.warn(`no such prefix "${s_prefix}"`);
			return;
		}

		// make full URI
		return p_iri + s_n3.slice(s_prefix.length+1);
	}

	//
	terse() {

	}
}

class Store {
	constructor(h_graphs, h_prefixes) {
		let k_graphs = {};

		// make scope for each graph
		Object.keys(h_graphs).forEach((s_graph_id) => {
			Object.defineProperty(k_graphs, s_graph_id, {
				configurable: true,
				get() {
					Object.defineProperty(this, s_graph_id, {
						value: new Graph(h_graphs[s_graph_id], h_prefixes),
					});
					return this[s_graph_id];
				},
			});
		});

		this.graphs = k_graphs;
	}
}


// makes network creator
module.exports = function(f_parse, b_default_graph) {
	// return network creator
	return b_default_graph? function(z_input, h_config, f_okay_graph) {
		if(2 === arguments.length) {
			f_okay_graph = h_config;
			h_config = {};
		}

		// prep a store of graphs; each graph [subject_id] => predicate-object pairs
		let h_default_graph = Object.defineProperty({}, '^term', {
			value: graphy.defaultGraph(),
			enumerable: false,
		});

		// parse document
		f_parse(z_input, Object.assign(h_config, {

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
					h_default_graph[s_subject_id] = Object.defineProperties({
						// create link to sole object in list
						[h_triple.predicate.value]: [h_triple.object],
					}, {
						// create reserved keys
						'^term': {
							value: h_subject,
							enumerable: false,
						},
						'^direction': {
							value: 1,
							enumerable: false,
						},
					});
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
		}));
	} : function(z_input, h_config, f_okay_graph) {
		if(2 === arguments.length) {
			f_okay_graph = h_config;
			h_config = {};
		}

		// prep a store of graphs; each graph [subject_id] => predicate-object pairs
		let h_store = {};

		// prep a default graph
		h_store[''] = Object.defineProperty({}, '^term', {
			value: graphy.defaultGraph(),
			enumerable: false,
		});

		// parse document
		f_parse(z_input, Object.assign(h_config, {

			// create the map
			data(h_triple) {
				// ref graph of the triple
				let h_graph = h_triple.graph;

				// create graph id
				let s_graph_id = h_graph.isBlankNode? '_:'+h_graph.value: h_graph.value;

				// ref/create triples container
				let h_triples = h_store[s_graph_id] = h_store[s_graph_id]
					|| Object.defineProperty({}, '^term', {value: h_graph, enumerable: false});

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
					h_triples[s_subject_id] = Object.defineProperties({

						// create link to sole object in list
						[h_triple.predicate.value]: [h_triple.object],
					}, {
						// create reserved keys
						'^term': {
							value: h_subject,
							enumerable: false,
						},
						'^direction': {
							value: 1,
							enumerable: false,
						},
					});
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
		}));
	};
};
