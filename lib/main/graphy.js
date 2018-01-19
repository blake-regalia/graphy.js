
const S_UUID_V4 = 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx';
const R_UUID_V4 = /[xy]/g;

const terse = (p_iri, h_prefixes) => {
	let s_best_prefix_id = '';
	let nl_best_prefix_iri = 0;
	for(let s_prefix_id in h_prefixes) {
		let p_prefix_iri = h_prefixes[s_prefix_id];
		if(p_iri.startsWith(p_prefix_iri) && p_prefix_iri.length > nl_best_prefix_iri) {
			s_best_prefix_id = s_prefix_id;
		}
	}

	if(nl_best_prefix_iri) {
		return s_best_prefix_id+':'+p_iri.substr(nl_best_prefix_iri);
	}

	return '<'+p_iri+'>';
};

function GenericTerm() {}
Object.assign(GenericTerm.prototype, {
	valueOf() {
		return this.toCanonical();
	},
	equals(h_other) {
		return (h_other.termType === this.termType && h_other.value === this.value);
	},
	toCanonical() {
		console.warn('Term#toCanonical() is deprecated. Use Term#toNT() or Term#valueOf() instead .');
		return this.toNT();
	},
});


function NamedNode(s_iri) {
	this.value = s_iri;
} NamedNode.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		termType: 'NamedNode',
		isNamedNode: true,
		valueOf() {
			return this.value;
		},
		verbose() {
			return '<'+this.value+'>';
		},
		terse(h_prefixes={}) {
			return terse(this.value, h_prefixes);
		},
		toObject() {
			return {
				termType: 'NamedNode',
				value: this.value,
			};
		},
	});

const HP_NN_XSD_STRING = new NamedNode('http://www.w3.org/2001/XMLSchema#string');
const HP_NN_RDFS_LANG_STRING = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');
function Literal(s_value, z_datatype_or_lang) {
	this.value = s_value;
	if(z_datatype_or_lang) {
		if('string' === typeof z_datatype_or_lang) {
			this.language = z_datatype_or_lang;
			this.datatype = HP_NN_RDFS_LANG_STRING;
		}
		else {
			this.datatype = z_datatype_or_lang;
		}
	}
} Literal.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		datatype: HP_NN_XSD_STRING,
		language: '',
		termType: 'Literal',
		isLiteral: true,
		equals(h_other) {
			return 'Literal' === h_other.termType && h_other.value === this.value
				&& this.datatype.equals(h_other.datatype) && h_other.language === this.language;
		},
		valueOf() {
			return (this.language? '@'+this.language: '^'+this.datatype.value)
				+'"'+this.value;
		},
		verbose() {
			return JSON.stringify(this.value) +
				(this.language
					? '@'+this.language
					: (this.datatype !== HP_NN_XSD_STRING
						? '^^<'+this.datatype.value+'>'
						: ''));
		},
		terse(h_prefixes={}) {
			return JSON.stringify(this.value) +
				(this.language
					? '@'+this.language
					: (this.datatype !== HP_NN_XSD_STRING
						? '^^'+terse(this.datatype.value, h_prefixes)
						: ''));
		},
		toObject() {
			return {
				termType: 'Literal',
				value: this.value,
				language: this.language,
				datatype: Object.assign({}, this.datatype),
			};
		},
	});

function BlankNode(s_value) {
	this.value = s_value;
} BlankNode.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		termType: 'BlankNode',
		isBlankNode: true,
		valueOf() {
			return '_'+this.value;
		},
		verbose() {
			return '_:'+this.value;
		},
		terse() {
			return '_:'+this.value;
		},
		toObject() {
			return {
				termType: 'BlankNode',
				value: this.value,
			};
		},
	});

function DefaultGraph() {}
DefaultGraph.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		value: '',
		termType: 'DefaultGraph',
		isDefaultGraph: true,
		valueOf() {
			return '*';
		},
		verbose() {
			return '';
		},
		terse() {
			return '';
		},
		toObject() {
			return {
				termType: 'DefaultGraph',
				value: '',
			};
		},
	});

const H_DEFAULT_GRAPH = new DefaultGraph();


// creates a new Quad by copying the current terms from the parser state
function Quad(h_subject, h_predicate, h_object, h_graph) {
	this.subject = h_subject;
	this.predicate = h_predicate;
	this.object = h_object;
	this.graph = h_graph;
}

Object.assign(Quad.prototype, {
	equals(y_other) {
		return this.object.equals(y_other.object)
			&& this.subject.equals(y_other.subject)
			&& this.predicate.equals(y_other.predicate)
			&& this.graph.equals(y_other.graph);
	},
	valueOf() {
		return this.graph+' '+this.subject+' '+this.predicate+' '+this.object;
	},
	toObject() {
		return {
			subject: this.subject.toObject(),
			predicate: this.predicate.toObject(),
			object: this.object.toObject(),
			graph: this.graph.toObject(),
		};
	},
	toNT() {
		return this.subject.toNT()
			+' '+this.predicate.toNT()
			+' '+this.object.toNT()
			+' '+(this.graph.isDefaultGraph? '': this.graph.toNT()+' ')+'.';
	},
});



// Turtle package
const ttl = {
	// serialize ttl output
	get serializer() {
		// memoize
		delete ttl.serializer;
		return ttl.serializer = require('../ttl/serializer.js');
	},

	// deserialize ttl input
	get deserializer() {
		// memoize
		delete ttl.deserializer;
		return ttl.deserializer = require('../ttl/deserializer.js');
	},

	// split ttl input
	get splitter() {
		// memoize
		delete ttl.splitter;
		return ttl.splitter = require('../ttl/splitter.js');
	},

	// // creates a linked data structure from ttl input
	// get linked() {
	// 	// memoize
	// 	delete ttl.linked;
	// 	return ttl.linked = require('./linked.js')(ttl.parse, true);
	// },
};

// TriG package
const trig = {
	// serialize trig output
	get serializer() {
		// memoize
		delete trig.serializer;
		return trig.serializer = require('../trig/serializer.js');
	},

	// deserialize trig input
	get deserializer() {
		// memoize
		delete trig.deserializer;
		// return trig.deserializer = require('../trig/deserializer.js');
	},

	// // creates a linked data structure from trig input
	// get linked() {
	// 	// memoize
	// 	delete trig.linked;
	// 	return trig.linked = require('./linked.js')(trig.parse, false);
	// },
};

// N-Triples package
const nt = {
	// serialize nt output
	get serializer() {
		// memoize
		delete nt.serializer;
		return nt.serializer = require('../nt/serializer.js');
	},

	// deserialize nt input
	get deserializer() {
		// memoize
		delete nt.deserializer;
		return nt.deserializer = require('../nt/deserializer.js');
	},

	// // creates a linked data structure from nt input
	// get linked() {
	// 	// memoize
	// 	delete nt.linked;
	// 	return nt.linked = require('./linked.js')(nt.parse, true);
	// },
};

// N-Quads package
const nq = {
	// serialize nt output
	get serializer() {
		// memoize
		delete nq.serializer;
		return nq.serializer = require('../nq/serializer.js');
	},

	// deserialize nt input
	get deserializer() {
		// memoize
		delete nq.deserializer;
		// return nq.deserializer = require('../nq/deserializer.js');
	},

	// // creates a linked data structure from nq input
	// get linked() {
	// 	// memoize
	// 	delete nq.linked;
	// 	return nq.linked = require('./linked.js')(nq.parse, true);
	// },
};

// HDT package
const hdt = {

	// // parses hdt input
	// get parse() {
	// 	// memoize
	// 	delete hdt.parse;
	// 	return hdt.parse = require('../hdt/parser.js');
	// },

	// // creates a linked data structure from nq input
	// get linked() {
	// 	// memoize
	// 	delete nq.linked;
	// 	return nq.linked = require('./linked.js')(nq.parse, true);
	// },
};


const H_MIMES = {
	'text/turtle': ttl,
	'application/trig': trig,
	'application/n-triples': nt,
	'application/n-quads': nq,
};

const H_SPARQL_RESULT_TYPES = {
	iri: (h) => graphy.namedNode(h.value),
	bnode: (h) => graphy.blankNode(h.value),
	literal: (h) => {
		// language
		if('xml:lang' in h) {
			return graphy.literal(h.value, h['xml:lang']);
		}
		// datatype
		else if('datatype' in h) {
			return graphy.literal(h.value, graphy.namedNode(h.datatype));
		}
		// simple
		else {
			return graphy.literal(h.value);
		}
	},

	// old version of SPARQL results
	'typed-literal': (h) => graphy.literal(h.value, graphy.namedNode(h.datatype)),
};

const F_SORT_QUADS_PREHASH = (h_a, h_b) => {
	let i_graph = (h_a.graph+'').localeCompare(h_b.graph+'');
	if(i_graph) return i_graph;

	let {
		subject: h_subject_a,
		object: h_object_a,
	} = h_a;

	let {
		subject: h_subject_b,
		object: h_object_b,
	} = h_b;

	if(h_subject_a.isBlankNode) {
		if(!h_subject_b.isBlankNode) {
			return -1;
		}
	}
	else {
		let i_subject = (h_subject_a+'').localeCompare(h_subject_b+'');
		if(i_subject) return i_subject;
	}

	let i_predicate = (h_a.predicate+'').localeCompare(h_b.predicate+'');
	if(i_predicate) return i_predicate;

	if(h_object_a.isBlankNode) {
		if(!h_object_b.isBlankNode) {
			return -1;
		}
	}
	else {
		let i_object = (h_object_a+'').localeCompare(h_object_b+'');
		return i_object;
	}

	return 0;
};

class QuadSet {
	constructor() {
		Object.assign(this, {
			tree: {},
			quads: [],
			root_blanks: {},
			leaf_blanks: {},
		});
	}

	add(h_quad) {
		let h_tree = this.tree;

		let p_graph = h_quad.graph+'';
		let p_subject = h_quad.subject+'';
		let p_predicate = h_quad.predicate+'';
		let p_object = h_quad.object+'';

		// first encounter of graph
		if(!(p_graph in h_tree)) {
			h_tree[p_graph] = {
				[p_subject]: {
					[p_predicate]: new Set([p_object]),
				},
			};
		}
		// graph exists
		else {
			let h_triples = h_tree[p_graph];

			// first encounter of subject
			if(!(p_subject in h_triples)) {
				h_triples[p_subject] = {
					[p_predicate]: new Set([p_object]),
				};
			}
			// subject exists
			else {
				let h_pairs = h_triples[p_subject];

				// first encounter of predicate
				if(!(p_predicate in h_pairs)) {
					h_pairs[p_predicate] = new Set([p_object]);
				}
				// predicate exists
				else {
					let as_objects = h_pairs[p_predicate];

					// first encounter of object
					if(!as_objects.has(p_object)) {
						// add object to set
						as_objects.add(p_object);

						// add quad to list
						this.quads.push(h_quad);
					}
					// duplicate
					else {
						return;
					}
				}
			}
		}

		// subject is blank node
		if(h_quad.subject.isBlankNode) {
			let h_root_blanks = this.root_blanks;
			if(p_subject in h_root_blanks) {
				h_root_blanks[p_subject].add(h_quad);
			}
			else {
				h_root_blanks[p_subject] = new Set([h_quad]);
			}
		}

		// object is blank node
		if(h_quad.object.isBlankNode) {
			let h_leaf_blanks = this.leaf_blanks;
			if(p_object in h_leaf_blanks) {
				h_leaf_blanks[p_object].add(h_quad);
			}
			else {
				h_leaf_blanks[p_object] = new Set([h_quad]);
			}
		}

	}

	// equals(k_other) {
	// 	return this.blank_nodes === k_other.blank_nodes
	// 		&& (this.blank_nodes
	// 			? this.compare(k_other)
	// 			: this.canonicalize() === k_other.canonicalize());
	// }

	// compare() {
	// 	this.quads.forEach((h_quad) => {
	// 		if(h_quad.subject.isBlankNode) {
	// 			this.leaf_blanks[h_quad.subject+'']
	// 		}
	// 	});
	// }

	hash_blank_node(p_blank, h_hashed, a_visited=null) {
		let h_root_blanks = this.root_blanks;
		let h_leaf_blanks = this.leaf_blanks;

		// blank node has already been hashed
		if(p_blank in h_hashed) return h_hashed[p_blank];

		if(!a_visited) {
			a_visited = [p_blank];
		}
		else {
			let i_visited = a_visited.indexOf(p_blank);
			if(-1 !== i_visited) return '#'+i_visited;
			a_visited.push(p_blank);
		}

		// a canonical string to produce from the contents of incoming and outgoing triples
		let p_canonical = '';

		// root blank nodes
		if(!(p_blank in h_root_blanks)) {
			p_canonical += '_\n';
		}
		else {
			p_canonical += [...h_root_blanks[p_blank]]
				.sort(F_SORT_QUADS_PREHASH)
				.map(h_quad => this.hash_quad(h_quad, h_hashed, a_visited))
				.join('')+'\n';
		}

		// midpoint
		p_canonical = '|\n';

		// leaf blank nodes
		if(!(p_blank in h_leaf_blanks)) {
			p_canonical += '_\n';
		}
		else {
			p_canonical += [...h_leaf_blanks[p_blank]]
				.sort(F_SORT_QUADS_PREHASH)
				.map(h_quad => this.hash_quad(h_quad, h_hashed, a_visited))
				.join('\n')+'\n';
		}

		// create hash
		let p_hash = require('crypto').createHash('sha256')
			.update(p_canonical)
			.digest('hex');

		// do not recompute next time
		h_hashed[p_blank] = p_hash;

		return p_hash;
	}

	hash_quad(h_quad, h_hashed, a_visited) {
		let {
			subject: h_subject,
			object: h_object,
		} = h_quad;

		return h_quad.graph+'\n'
			+(h_subject.isBlankNode
				? '_'+this.hash_blank_node(h_subject+'', h_hashed, a_visited)
				: h_subject+'')+'\n'
			+h_quad.predicate+'\n'
			+(h_object.isBlankNode
				? '_'+this.hash_blank_node(h_object+'', h_hashed, a_visited)
				: h_object+'')+'\n';
	}

	canonicalize() {
		let h_tree = this.tree;
		let h_hashed = {};

		let h_root_blanks = this.root_blanks;
		for(let p_blank in h_root_blanks) {
			let p_hash;

			if(!(p_blank in h_hashed)) {
				p_hash = this.hash_blank_node(p_blank, h_hashed);
			}
			else {
				p_hash = h_hashed[p_blank];
			}

			h_root_blanks[p_blank].forEach((h_quad) => {
				h_quad.subject.value = p_hash;

				let h_triples = h_tree[h_quad.graph+''];

				// restructure tree
				if(p_blank in h_triples) {
					let h_pairs = h_triples[p_blank];
					delete h_triples[p_blank];
					h_triples['_'+p_hash] = h_pairs;
				}
			});
		}

		let h_leaf_blanks = this.leaf_blanks;
		for(let p_blank in h_leaf_blanks) {
			let p_hash;

			if(!(p_blank in h_hashed)) {
				p_hash = this.hash_blank_node(p_blank, h_hashed);
			}
			else {
				p_hash = h_hashed[p_blank];
			}

			h_leaf_blanks[p_blank].forEach((h_quad) => {
				h_quad.object.value = p_hash;

				// update tree
				let as_objects = h_tree[h_quad.graph+''][h_quad.subject+''][h_quad.predicate+''];
				as_objects.delete(p_blank);
				as_objects.add('_'+p_hash);
			});
		}

		// each quad
		return Object.keys(h_tree).sort().map((p_graph) => {
			// each triple
			let h_triples = h_tree[p_graph];
			return `${p_graph}\n`+Object.keys(h_triples).sort().map((p_subject) => {
				let h_pairs = h_triples[p_subject];

				// // blank nodes cannot be canonicalized
				// if(' ' === p_subject[0]) p_subject = this.hash_blank_node(p_subject, h_hashed);

				// each pair
				return `\t${p_subject}\n`+Object.keys(h_pairs).sort().map((p_predicate) => {
					// each object
					let as_objects = h_pairs[p_predicate];
					return `\t\t${p_predicate}\n`+[...as_objects].sort().map((p_object) => {
						// // blank nodes cannot be canonicalized
						// if(' ' === p_object[0]) p_object = this.hash_blank_node(p_object, h_hashed);

						return `\t\t\t${p_object}`;
					}).join('\n');
				}).join('\n');
			}).join('\n');
		}).join('\n');
	}
}


const graphy = module.exports = {

	/**
	* API:
	**/

	// load triple data from arbitrary parser into memory
	get load() {
		// memoize
		delete graphy.load;
		return graphy.load = require('./rdf-loader.js');
	},

	// // 
	// get bat() {
	// 	// memoize
	// 	delete graphy.bat;
	// 	return graphy.bat = require('../bat/main.js');
	// },
	bat: require('../bat/main.js'),

	//
	get linkedGraph() {
		// memoize
		delete graphy.linkedGraph;
		const linked_graph = require('../store/lazy-linked-graph.js');
		return graphy.linkedGraph = function(...a_args) {
			return new linked_graph(...a_args);
		};
	},

	/**
	* flavors:
	**/

	ttl,
	trig,
	nt,
	nq,
	hdt,

	/**
	* access to flavor by mime
	**/
	serializer(pm_format, ...a_args) {
		let k_format = H_MIMES[pm_format];
		if(!k_format) return null;
		let dc_serializer = k_format.serializer;
		if(a_args.length) {
			return dc_serializer(...a_args);
		}
		return dc_serializer;
	},

	deserializer(pm_format, ...a_args) {
		let k_format = H_MIMES[pm_format];
		if(!k_format) return null;
		let dc_deserializer = k_format.deserializer;
		if(a_args.length) {
			return dc_deserializer(...a_args);
		}
		return dc_deserializer;
	},

	splitter(pm_format, ...a_args) {
		let k_format = H_MIMES[pm_format];
		if(!k_format) return null;
		let dc_splitter = k_format.splitter;
		if(a_args.length) {
			return dc_splitter(...a_args);
		}
		return dc_splitter;
	},

	set() {
		return new QuadSet();
	},

	/**
	* DataFactory:
	**/

	namedNode(s_iri) {
		return new NamedNode(s_iri);
	},

	blankNode(z_label) {
		// no label given, generate a UUID
		if(!z_label) {
			let d = Date.now();
			// eslint-disable-next-line no-undef
			if('undefined' !== typeof performance) d += performance.now();
			return new BlankNode(S_UUID_V4.replace(R_UUID_V4, function(c) {
				let r = (d + Math.random()*16)%16 | 0;
				d = Math.floor(d / 16);
				// eslint-disable-next-line eqeqeq
				return ('x'==c? r: (r&0x3|0x8)).toString(16);
			}));
		}
		// label given
		else if('string' === typeof z_label) {
			return new BlankNode(z_label);
		}
		// parser or graph object given
		else if('object' === typeof z_label) {
			return new BlankNode(z_label.next_label());
		}
		throw new TypeError('unexpected type for `label` parameter');
	},

	literal(s_value, z_datatype_or_lang) {
		return new Literal(s_value, z_datatype_or_lang);
	},

	defaultGraph() {
		return new DefaultGraph();
	},

	triple(h_subject, h_predicate, h_object) {
		return new Quad(h_subject, h_predicate, h_object, H_DEFAULT_GRAPH);
	},

	quad(h_subject, h_predicate, h_object, h_graph) {
		return new Quad(h_subject, h_predicate, h_object, h_graph || H_DEFAULT_GRAPH);
	},

	fromSPARQLResult(h_term) {
		return H_SPARQL_RESULT_TYPES[h_term.type](h_term);
	},

};

// export graphy to window object if in main thread of browser
if('undefined' !== typeof window) window.graphy = graphy;
