

const S_UUID_V4 = 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx';
const R_UUID_V4 = /[xy]/g;

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
		terse() {
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
			return JSON.stringify(this.value) +
				(this.language
					? '@'+this.language
					: (this.datatype !== HP_NN_XSD_STRING
						? '^^<'+this.datatype.value+'>'
						: ''));
		},
		terse() {
			return JSON.stringify(this.value) +
				(this.language
					? '@'+this.language
					: (this.datatype !== HP_NN_XSD_STRING
						? '^^<'+this.datatype.value+'>'
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
			return ':'+this.value;
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
		// return ttl.deserializer = require('../ttl/deserializer.js');
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
		// return nt.deserializer = require('../nt/deserializer.js');
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

	// 
	get dti() {
		// memoize
		delete graphy.dti;
		return graphy.dti = require('./dti.js');
	},

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

};

// export graphy to window object if in browser
if('browser' === process.title) window.graphy = graphy;
