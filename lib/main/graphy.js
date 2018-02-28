
const S_UUID_V4 = 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx';
const R_UUID_V4 = /[xy]/g;

const concise = (p_iri, h_prefixes) => {
	// best prefix id
	let s_best_prefix_id = '';

	// length of longest matching iri
	let nl_best_prefix_iri = 0;

	// each prefix in hash
	for(let s_prefix_id in h_prefixes) {
		let p_prefix_iri = h_prefixes[s_prefix_id];

		// target iri starts with prefix iri and its longer than the current best
		if(p_iri.startsWith(p_prefix_iri) && p_prefix_iri.length > nl_best_prefix_iri) {
			// save prefix id as best
			s_best_prefix_id = s_prefix_id;

			// update best iri length
			nl_best_prefix_iri = p_prefix_iri.length;
		}
	}

	// found a prefix
	if(nl_best_prefix_iri) {
		return s_best_prefix_id+':'+p_iri.substr(nl_best_prefix_iri);
	}

	// no prefix found; default to full iri
	return '>'+p_iri;
};

function GenericTerm() {}
Object.assign(GenericTerm.prototype, {
	valueOf() {
		return this.concise();
	},
	equals(h_other) {
		return (h_other.termType === this.termType && h_other.value === this.value);
	},
});


function NamedNode(s_iri) {
	this.value = s_iri;
} NamedNode.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		termType: 'NamedNode',
		isNamedNode: true,
		concise(h_prefixes={}) {
			return concise(this.value, h_prefixes);
		},
		terse(h_prefixes={}) {
			let p_iri = this.value;
			let sct = concise(p_iri, h_prefixes);
			if('>' === sct[0]) return '<'+p_iri+'>';
			return sct;
		},
		verbose() {
			return '<'+this.value+'>';
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
			return JSON.stringify(this.value)
				+ (this.language
					? '@'+this.language
					: (this.datatype !== HP_NN_XSD_STRING
						? '^^<'+this.datatype.value+'>'
						: ''));
		},
		concise(h_prefixes) {
			if(this.language) {
				return '@'+this.language+'"'+this.value;
			}
			else if(this.hasOwnProperty('datatype')) {
				return '^'+concise(this.datatype.value, h_prefixes)+'"'+this.value;
			}
			else {
				return '"'+this.value;
			}
		},
		terse(h_prefixes={}) {
			let p_datatype = this.datatype.value;

			// concise datatype node
			let sct_datatype = concise(p_datatype, h_prefixes);

			// turn into terse
			let st_datatype = '>' === sct_datatype[0]? '<'+p_datatype+'>': sct_datatype;

			// stringify literal
			return JSON.stringify(this.value)
				+ (this.language
					? '@'+this.language
					: (this.datatype !== HP_NN_XSD_STRING
						? '^^'+st_datatype
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

const HP_NN_XSD_INTEGER = new NamedNode('http://www.w3.org/2001/XMLSchema#integer');
function Literal_Integer(x_value) {
	this.number = +x_value;
	this.value = x_value+'';
} Literal_Integer.prototype = Object.assign(
	Object.create(Literal.prototype), {
		datatype: HP_NN_XSD_INTEGER,
		isNumeric: true,
		concise(h_prefixes={}) {
			return '^'+HP_NN_XSD_INTEGER.concise(h_prefixes)+'"'+this.value;
		},
		terse() {
			return this.value;
		},
	});

const HP_NN_XSD_DOUBLE = new NamedNode('http://www.w3.org/2001/XMLSchema#double');
function Literal_Double(x_value) {
	this.number = +x_value;
	this.value = x_value+'';
} Literal_Double.prototype = Object.assign(
	Object.create(Literal.prototype), {
		datatype: HP_NN_XSD_DOUBLE,
		isNumeric: true,
		concise(h_prefixes={}) {
			return '^'+HP_NN_XSD_DOUBLE.concise(h_prefixes)+'"'+this.value;
		},
		terse() {
			return this.number.toExponential();
		},
	});

const HP_NN_XSD_DECIMAL = new NamedNode('http://www.w3.org/2001/XMLSchema#decimal');
function Literal_Decimal(x_value) {
	this.number = +x_value;
	this.value = x_value+'';
} Literal_Decimal.prototype = Object.assign(
	Object.create(Literal.prototype), {
		datatype: HP_NN_XSD_DECIMAL,
		isNumeric: true,
		concise(h_prefixes={}) {
			return '^'+HP_NN_XSD_DECIMAL.concise(h_prefixes)+'"'+this.value;
		},
		terse() {
			return this.value+(Number.isInteger(this.number)? '.0': '');
		},
	});

function BlankNode(s_value) {
	this.value = s_value;
} BlankNode.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		termType: 'BlankNode',
		isBlankNode: true,
		concise() {
			return '_'+this.value;
		},
		terse() {
			return '_:'+this.value;
		},
		verbose() {
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
		concise() {
			return '*';
		},
		terse() {
			return '';
		},
		verbose() {
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
	terse(h_prefixes) {
		let b_graph = !this.graph.isDefaultGraph;
		return (b_graph? '': this.graph.terse(h_prefixes)+' { ')
			+this.subject.terse(h_prefixes)
			+' '+this.predicate.terse(h_prefixes)
			+' '+this.object.terse(h_prefixes)+' .'
			+(b_graph? ' }': '');
	},
	verbose() {
		return this.subject.verbose()
			+' '+this.predicate.verbose()
			+' '+this.object.verbose()
			+' '+(this.graph.isDefaultGraph? '': this.graph.verbose()+' ')+'.';
	},
	toObject() {
		return {
			subject: this.subject.toObject(),
			predicate: this.predicate.toObject(),
			object: this.object.toObject(),
			graph: this.graph.toObject(),
		};
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

	// parse ttl input
	parse(...a_args) {
		if(1 === a_args.length) a_args[0].validate = true;
		else a_args[1].validate = true;
		return ttl.deserializer(...a_args);
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

	// parse trig input
	parse(...a_args) {
		if(1 === a_args.length) a_args[0].validate = true;
		else a_args[1].validate = true;
		return trig.deserializer(...a_args);
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
		return (nt.serializer = require('../nt/serializer.js'));
	},

	// deserialize nt input
	get deserializer() {
		// memoize
		delete nt.deserializer;
		return (nt.deserializer = require('../nt/deserializer.js'));
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
		return (nq.serializer = require('../nq/serializer.js'));
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

// SPARQL Results package
const sparql_results = {
	// deserialize sparql_results input
	get deserializer() {
		// memoize
		delete sparql_results.deserializer;
		return (sparql_results.deserializer = require('../sparql-results/deserializer.js'));
	},
};


const H_MIMES = {
	'text/turtle': ttl,
	'application/trig': trig,
	'application/n-triples': nt,
	'application/n-quads': nq,
	'application/sparql-results+json': sparql_results,
};

const H_SPARQL_RESULT_TYPES = {
	uri: h => graphy.namedNode(h.value),
	iri: h => graphy.namedNode(h.value),
	bnode: h => graphy.blankNode(h.value),
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
	'typed-literal': h => graphy.literal(h.value, graphy.namedNode(h.datatype)),
};


const graphy = module.exports = {

	/**
	* API:
	**/

	// load triple data from arbitrary parser into memory
	get load() {
		// memoize
		delete graphy.load;
		return (graphy.load = require('./rdf-loader.js'));
	},

	// // 
	// get bat() {
	// 	// memoize
	// 	delete graphy.bat;
	// 	return graphy.bat = require('../bat/main.js');
	// },
	// bat: require('../bat/main.js'),

	//
	get linkedGraph() {
		// memoize
		delete graphy.linkedGraph;
		const linked_graph = require('../store/lazy-linked-graph.js');
		return (graphy.linkedGraph = function(...a_args) {
			return new linked_graph(...a_args);
		});
	},

	/**
	* flavors:
	**/

	ttl,
	trig,
	nt,
	nq,
	hdt,
	sparql_results,
	sparqlResults: sparql_results,

	/*
	* access to flavor by mime
	*/
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

	parse(pm_format, ...a_args) {
		let k_format = H_MIMES[pm_format];
		if(!k_format) return null;
		let dc_parser = k_format.parser;
		if(a_args.length) {
			return dc_parser(...a_args);
		}
		return dc_parser;
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
		return new (require('./quad-set.js'))();
	},

	// construct a term object from a concise term string
	ct(s_ct, h_prefixes) {
		switch(s_ct[0]) {
			// iri
			case '>': return graphy.namedNode(s_ct.slice(1));

			// blank node
			case '_': return graphy.blankNode(s_ct);

			// datatyped literal
			case '^': {
				// find literal's contents delimiter
				let i_contents = s_ct.indexOf('"');

				// extract datatype
				let s_datatype = s_ct.slice(1, i_contents);

				// make term
				return graphy.literal(s_ct.slice(i_contents+1), graphy.ct(s_datatype, h_prefixes));
			}

			// languaged literal
			case '@': {
				// find literal's contents delimiter
				let i_contents = s_ct.indexOf('"');

				// extract language
				let s_language = s_ct.slice(1, i_contents);

				// make term
				return graphy.literal(s_ct.slice(i_contents+1), s_language);
			}

			// prefixed name
			default: return this.ct_prefixed_node(s_ct, h_prefixes);
		}
	},

	// construct a term object from a concise term string for nodes
	ct_prefixed_node(s_ct, h_prefixes={}) {
		// find prefix delimiter
		let i_colon = s_ct.indexof(':');

		// prefix id
		let s_prefix_id = s_ct.slice(0, i_colon);

		// suffix
		let s_suffix = s_ct.slice(i_colon+1);

		// find prefix in hash
		if(s_prefix_id in h_prefixes) {
			return graphy.namedNode(h_prefixes[s_prefix_id]+s_suffix);
		}
		// prefix not exists
		else {
			throw new Error(`no such prefix ${s_prefix_id} found in hash`);
		}
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
			let dt_now = Date.now();
			// eslint-disable-next-line no-undef
			if('undefined' !== typeof performance) d += performance.now();
			return new BlankNode(S_UUID_V4.replace(R_UUID_V4, (s) => {
				let x_r = (dt_now + (Math.random()*16)) % 16 | 0;
				dt_now = Math.floor(dt_now / 16);
				return ('x' === s? x_r: ((x_r & 0x3) | 0x8)).toString(16);
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

	integer(w_value) {
		return new Literal_Integer(w_value);
	},

	double(w_value) {
		return new Literal_Double(w_value);
	},

	decimal(w_value) {
		return new Literal_Decimal(w_value);
	},

	defaultGraph() {
		return new DefaultGraph();
	},

	term(h_term) {
		switch(h_term.termType) {
			case 'NamedNode': return new NamedNode(h_term.value);
			case 'BlankNode': return new BlankNode(h_term.value);
			case 'Literal': return new Literal(h_term.value, h_term.language
				? h_term.language
				: (h_term.datatype
					? new NamedNode(h_term.datatype.value)
					: null));
			case 'DefaultGraph': return new DefaultGraph();
			default: {
				throw new TypeError(`invalid termType: ${h_term.termType}`);
			}
		}
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
