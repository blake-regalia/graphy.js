

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
	constructor(k_graph, h_links, h_leaf_node) {
		// store ref to graph
		this.graph = k_graph;

		// ref some utilities
		this.resolve = k_graph.resolve.bind(k_graph);

		// ref node's term and set local field
		let h_term = h_links['^term'] || h_leaf_node;

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

	// traverse normal direction
	cross(s_n3) {
		let p_predicate = this.resolve(s_n3);

		// ref objects
		let a_objects = this.links[p_predicate] || [];

		// return or make Bag
		return a_objects.bag || new Bag(this.graph, a_objects);
	}

	// traverse inverse direction
	back(s_n3) {
		let p_predicate = this.resolve(s_n3);

		// ref subjects
		let a_subjects = this.inverseLinks[p_predicate] || [];

		// return or make NodeSet
		return a_subjects.set || mk_NodeSet(this.graph, a_subjects);
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
	get anyNodes() {
		// materialize on instance
		Object.defineProperty(this, 'anyNodes', {
			value: mk_NodeSet(this.graph, this.terms.filter(h => h.isNamedNode || h.isBlankNode)),
		});

		// return chain/function
		return this.anyNodes;
	}

	// selects only distinct Terms of type NamedNode, optionally filters nodes whos IRIs start with prefix, and then applies an optional filter
	get namedNodes() {
		// materialize on instance
		Object.defineProperty(this, 'namedNodes', {
			value: mk_NodeSet(this.graph, this.terms.filter(h => h.isNamedNode), 'NamedNode'),
		});

		// return chain/function
		return this.namedNodes;
	}

	// selects only distinct Terms of type BlankNode and applies an optional filter
	get blankNodes() {
		// materialize on instance
		Object.defineProperty(this, 'blankNodes', {
			value: mk_NodeSet(this.graph, this.terms.filter(h => h.isBlankNode), 'BlankNode'),
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

	// traverse normal direction
	cross(s_n3) {
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

	// traverse inverse direction
	back(s_n3) {
		let p_predicate = this.graph.resolve(s_n3);

		// no such prefix, return an empty NodeSet
		if(!p_predicate) return mk_NodeSet(this.graph, []);

		// otherwise, create a NodeSet of subjects
		// let a_subjects = 
	},

	// ...
};

// assign aliases
Object.assign(NodeSet_prototype, {
	crossInverse: NodeSet_prototype.back,

});

// makes a new NodeSet
function mk_NodeSet(k_graph, a_terms, s_term_types) {
	// prep to reduce nodes to a set
	let h_nodes = {};

	// nodes are all NamedNodes
	if('NamedNode' === s_term_types) {
		for(let i_term=0; i_term<a_terms.length; i_term++) {
			let h_term = a_terms[i_term];
			h_nodes[h_term.value] = h_term;
		}
	}
	// nodes are all BlankNodes
	else if('BlankNodes' === s_term_types) {
		for(let i_term=0; i_term<a_terms.length; i_term++) {
			let h_term = a_terms[i_term];
			h_nodes['_:'+h_term.value] = h_term;
		}
	}
	// nodes are mixed
	else {
		for(let i_term=0; i_term<a_terms.length; i_term++) {
			let h_term = a_terms[i_term];
			h_nodes[h_term.isBlankNode? '_:'+h_term.value: h_term.value] = h_term;
		}
	}

	// reduce nodes to a set
	let as_nodes = [];
	for(let s_node_id in h_nodes) {
		let k_node = k_graph.nodes[s_node_id]
			|| k_graph.leafs[s_node_id]
			|| (k_graph.leafs[s_node_id] = new Node(k_graph, [], h_nodes[s_node_id]));

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

	// save to list so we can reuse it
	a_terms.set = f_bound;

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
			let p_datatype = this.graph.resolve(z_literal_filter);

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

		// prep set of object nodes
		let k_object_nodes = this.object_nodes = {};

		// prep set of leaf Nodes
		this.leafs = {};

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
					// object is a named node
					else if(y_object.isNamedNode) {
						// k_object_nodes[y_object.value] = 
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
							// do not recreate new instances of Bag
							let a_objects = h_links[p_predicate_iri];

							// add suffix to namespace
							k_namespace[p_predicate_iri.substr(n_prefix_iri)] = a_objects.bag || new Bag(k_graph, a_objects);
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


const R_COMPRESS = /^(.*?)([^/#]*)$/;

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


		// maps [prefix_iri] => terse_character
		let h_tersed = {};

		// maps [terse_character] = prefix_iri
		let h_verbose = {};

		// tersed_index
		let i_terse = 1;


		let c_triples = 0;

		// parse document
		f_parse(z_input, Object.assign(h_config, {

			// create the map
			data(h_triple) {
				c_triples += 1;
				// ref subject of triple
				let h_subject = h_triple.subject;

				// prep subject id
				let s_subject_id;

				// subject is blank node
				if(h_subject.isBlankNode) {
					s_subject_id = ' '+h_subject.value;
				}
				// subject is named node
				else {
					// compress subject
					let m_compress = R_COMPRESS.exec(h_subject.value);

					// ref prefix iri
					let p_pre = m_compress[1];

					// prefix has been encountered before
					if(h_tersed[p_pre]) {
						s_subject_id = h_tersed[p_pre]+'\0'+m_compress[2];
					}
					// new prefix
					else {
						// make terse character
						let x_terse = String.fromCharCode(i_terse++);

						// add terse mapping
						h_tersed[p_pre] = x_terse;

						// add inverse mapping
						h_verbose[x_terse] = p_pre;

						// make subject id
						s_subject_id = x_terse+'\0'+m_compress[2];
					}
				}

				// // create subject id
				// let s_subject_id = h_subject.isBlankNode? '_:'+h_subject.value: h_subject.value;


				// compress predicate
				let m_compress_p = R_COMPRESS.exec(h_triple.predicate.value);

				// ref prefix iri
				let p_pre = m_compress_p[1];
				let s_predicate_id;

				//
				let x_terse_prefix;
				let s_predicate_suffix = m_compress_p[2];

				// prefix has been encountered before
				if(h_tersed[p_pre]) {
					x_terse_prefix = h_tersed[p_pre];
					s_predicate_id = x_terse_prefix+'\0'+s_predicate_suffix;
				}
				// new prefix
				else {
					// make terse character
					x_terse_prefix = String.fromCharCode(i_terse++);

					// add terse mapping
					h_tersed[p_pre] = x_terse_prefix;

					// // add inverse mapping
					// h_verbose[x_terse_prefix] = p_pre;

					// make predicate id
					s_predicate_id = x_terse_prefix+'\0'+s_predicate_suffix;
				}


				// compress object
				let w_object = h_triple.object;
				let h_object = w_object;
				if(h_object.isNamedNode) {
					// compress predicate
					let m_compress_o = R_COMPRESS.exec(h_triple.object.value);

					// ref prefix iri
					let p_pre_o = m_compress_o[1];

					//
					let x_terse_prefix_o;
					let s_object_suffix = m_compress_o[2];

					// prefix has been encountered before
					if(h_tersed[p_pre_o]) {
						x_terse_prefix_o = h_tersed[p_pre_o];
						w_object = x_terse_prefix_o+'\0'+s_object_suffix;
					}
					// new prefix
					else {
						// make terse character
						x_terse_prefix_o = String.fromCharCode(i_terse++);

						// add terse mapping
						h_tersed[p_pre_o] = x_terse_prefix_o;

						// add inverse mapping
						h_verbose[x_terse_prefix_o] = p_pre_o;

						// make object id
						w_object = x_terse_prefix_o+'\0'+s_object_suffix;
					}
				}
				else {
					w_object = null;
				}



				// ref subject node
				let h_subject_node = h_default_graph[s_subject_id];

				// at least one other triple with same subject exists in graph
				if(h_subject_node) {

					// ref predicate namespace
					let h_namespace = h_subject_node[x_terse_prefix];

					// at least one other triple with same predicate namespace exists in graph
					if(h_namespace) {
						// ref or create the link to the objects list
						h_namespace[s_predicate_suffix] = h_namespace[s_predicate_suffix] || '';

						// and finally, push this object
						h_namespace[s_predicate_suffix] += w_object+'\0';
					}
					// namespace not yet exists
					else {
						// make namespace
						h_subject_node[x_terse_prefix] = {
							// and set its only item to a list containing this object
							[s_predicate_suffix]: w_object+'\0',
						};
					}

					// // ref or make object list
					// h_links[s_predicate_id] = h_links[s_predicate_id] || [];

					// // add this object to the list
					// h_links[s_predicate_id].push(h_triple.object);
				}
				// no such triples with subject exist yet
				else {
					debugger;
					if(0 === c_triples % 7) console.log(`${c_triples} triples / ${process.memoryUsage().rss / 1024 / 1024}MiB rss`);
					// create mapping
					h_default_graph[s_subject_id] = Object.defineProperties({
						// // create link to sole object in list
						// [h_triple.predicate.value]: [h_triple.object],
						[x_terse_prefix]: {
							[s_predicate_suffix]: w_object+'\0',
						},
					}, {
						// // create reserved keys
						// '^term': {
						// 	value: h_subject,
						// 	enumerable: false,
						// },
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
