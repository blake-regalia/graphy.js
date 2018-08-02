const $_IMPL = Symbol('impl');
const $_COUNT = Symbol('count');

const schemafy = require('./schemafier');

const p_base = 'https://bat-rdf.link/';



const h_prefixes = {
	bre: `${p_base}encoding/`,
	brdt: `${p_base}datatype/`,
	bri: `${p_base}interface/`,
	brp: `${p_base}protocol/`,
	rdfjs: '',
};

// raw bytes (alias of the Uint8Array TypedArray)  https://www.ecma-international.org/ecma-262/6.0/#sec-uint8array


let write = {
	'ecma:Number': {
		'rdfs:subClassOf': 'xsd:decimal',
	},
	'ecma:Number.integer': {},
	'ecma:Number.integer.positive': {},
	'ecma:Number.integer.non-negative': {},

	'ecma:String': {
		'rdfs:subClassOf': 'xsd:string',
	},

	'ecma:elementValues': {
		a: 'owl:objectProperty',
		'rdfs:range': 'ecma:Accessible',
	},
	'ecma:TypedArray': {
		'rdfs:subClassOf': 'ecma:ArrayLike',
	},
	'ecma:TypedArray.Uint8Array': {
		'rdfs:subClassOf': 'ecma:TypedArray',
		'ecma:elementValues': 'xsd:unsignedByte',
	},


	'bre:ntu8.string': {},
	'bre:vuint': {},
	'bre:typed-array': {},
	'bre:bytes': {},

	'bat:List': {
		a: 'owl:Class',
	},

	'bat:first': {
		a: 'owl:ObjectProperty',
		'rdfs:domain': 'bat:List',
	},

	'bat:rest': {
		a: 'owl:ObjectProperty',
		'rdfs:domain': 'bat:List',
		'rdfs:range': 'bat:List',
	},

	'bat:nil': {
		a: [
			'owl:NamedIndividual',
			'bat:List',
		],
	},

	'bat:ParameterList': {
		a: 'owl:Class',
		'rdfs:subClassOf': 'bat:List',
	},

	'bat:ArgumentList': {
		a: 'owl:Class',
		'rdfs:subClassOf': 'bat:List',
	},
};


// build a ct-struct for a list (ecma:Array) of datatypes
const datatype_list_class = a_types => ({
	a: 'owl:Class',
	'rdfs:subClassOf': {  // prevent class clashing
		a: 'owl:Class',
		'owl:intersectionOf': [[
			'bat:List',
			{
				a: 'owl:Restriction',
				'owl:onProperty': 'bat:first',
				'owl:cardinality': '^xsd:nonNegativeInteger"1',
				'owl:allValuesFrom': a_types.shift(),
			},
			{
				a: 'owl:Restriction',
				'owl:onProperty': 'bat:rest',
				'owl:cardinality': '^xsd:nonNegativeInteger"1',
				...(a_types.length
					? {'owl:allValuesFrom':datatype_list_class(a_types)}
					: {'owl:hasValue':'bat:nil'}),
			},
		]],
	},
});


// primitive datatypes
let sct_pint = 'ecma:Number.integer.positive';
let sct_uint = 'ecma:Number.integer.non-negative';
let sct_string = 'ecma:String';

// dictionary method to produce a term given its dataset quad id
let gm_produce = {
	params: ['brdt:entity.id'],
	returns: 'rdfjs:Term',
};

// dictionary method to find a quad given its concise term string
let gm_find = {
	params: ['brdt:concise-term.string'],
	returns: 'brdt:entity.id',
};


module.exports = schemafy(`${p_base}format/default`, {
	prefixes: h_prefixes,

	self: {
		a: 'bat:Format',
	},

	datatypes: {
		'brdt:sequence.id': sct_pint,

		'brdt:sequence.position': sct_uint,

		'brdt:entity.id': sct_pint,

		'brdt:concise-term.string': sct_string,

		'brdt:concise-term.word': 'ecma:TypedArray.Uint8Array',

		'brdt:segment.a.id': sct_pint,

		'brdt:segment.b.id': sct_pint,

		'brdt:segment.b.offset': sct_uint,

		'brdt:segment.b.tuple': [[
			'brdt:segment.b.id',
			'brdt:segment.b.offset',
		]],

		'brdt:segment.c.id': sct_pint,
	},

	encodings: {
		'bre:vuint': {
			call: 'kbd.vuint()',
			datatype: 'ecma:number.integer.non-negative',
			// encoder: require(),
			// decoder: require(),
		},
		'bre:typed-array': {
			call: 'kbd.typed_array()',
			datatype: 'ecma.TypedArray',
			// encoder: require(),
			// decoder: require(),
		},
		'bre:string.ntu8': {
			call: 'kbd.ntu8_string()',
			datatype: 'ecma:String',
			// encoder: require(),
			// decoder: require(),
		},
	},

	interfaces: {
		'bri:dataset': {},

		// 'bri:dataset.dq': {
		// 	extends: 'bri:dataset',
		// 	members: {
		// 		dictionary: 'bri:dictionary',
		// 		quads: 'bri:quads',
		// 	},
		// },

		'bri:dataset.dq.concise-term': {
			extends: 'bri:dataset',
			members: {
				dictionary: 'bri:dictionary.concise-term',
				quads: 'bri:quads',
			},
			methods: {
				find: {
					params: ['brdt:concise-term.string', 'brdt:entity.role'],
					returns: 'brdt:entity.id',
				},
				produce: {
					params: ['brdt:entity.id', 'brdt:entity.role'],
					returns: 'rdfjs:Term',
				},
			},
		},

		'bri:dictionary': {},

		'bri:dictionary.concise-term': {
			extends: 'bri:dictionary',
			methods: {
				produce_hop: gm_produce,
				produce_subject: gm_produce,
				produce_predicate: gm_produce,
				produce_object: gm_produce,
				produce_literal: gm_produce,

				find_hop: gm_find,
				find_subject: gm_find,
				find_predicate: gm_find,
				find_object_node: gm_find,
				find_object_literal: gm_find,
			},
		},

		'bri:chapter': {},

		'bri:chapter.concise-term': {
			extends: 'bri:chapter',
			methods: {
				produce: {
					params: ['brdt:entity.id'],
					returns: 'brdt:concise-term.word',
				},

				find: {
					params: ['brdt:concise-term.word'],
					returns: 'brdt:entity.id',
				},
			},
		},

		'bri:quads': {
			generators: {
				each_a: {
					params: [],
					yields: 'brdt:segment.a.id',
				},
				each_b: {
					params: ['brdt:segment.a.id'],
					yields: 'brdt:segment.b.tuple',
				},
				each_c: {
					params: ['brdt:segment.a.id', 'brdt:segment.b.offset'],
					yields: 'brdt:segment.c.id',
				},
			},
		},

		'bri:triples': {

		},

		'bri:pairs': {
			methods: {

			},
		},

		'bri:bitsequence': {
			methods: {
				rank: {
					params: ['brdt:sequence.position'],
					returns: 'brdt:sequence.id',
				},

				select: {
					params: ['brdt:sequence.id'],
					returns: 'brdt:sequence.position',
				},
			},
		},

	},


	protocols: {
		// 'brp:dataset.dq.concise-term': {
		// 	implements: 'bri:dataset.dq.concise-term',
		// 	members: {
		// 		dictionary: 'bri:dictionary',
		// 		quads: 'bri:quads',
		// 	},
		// 	class: require('./dataset.js'),
		// },

		'brp:dictionary.concise-term:pp12oc': {
			implements: 'bri:dictionary.concise-term',
			fields: {
				chapter_count: 'bre:vuint',
			},
			members: {
				prefixes: 'bri:chapter.concise-term',
				chapters: {
					repeat: {
						min: 1,
						max: 12,
					},
					encoding: 'bri:chapter.concise-term',
				},
			},
			class: require('../../content/bat/decoders/dictionary-pp12oc.js'),
		},

		'brp:chapter.concise-term:difcc': {
			implements: 'bri:chapter.concise-term',
			fields: {
				block_k: 'bre:vuint',
				word_count: 'bre:vuint',
				indices: 'bre:typed-array',
				contents: 'bre:bytes',
			},
			class: require('../../content/bat/decoders/chapter-difcc.js'),
		},

		'brp:quads.t3i': {
			implements: 'bri:quads',
			members: {
				triples: 'bri:triples',
				ps_o: 'bri:index',
				op_s: 'bri:index',
				membership: 'bri:index',
			},
		},

		'brp:triples.2p': {
			implements: 'bri:triples',
			members: {
				roots: 'bri:pairs',
				leafs: 'bri:pairs',
			},
		},

		'brp.pairs.': {

		},

		'brp:bitmap.ab': {
			implements: 'bri:pairs',
			fields: {
				key_count: 'bre:vuint',
				adj: 'bre:typed-array',
			},
			members: {
				bs: 'bri:bitsequence',
			},
			class: require('../../content/bat/decoders/bitmap-ab.js'),
		},

		'brp:bitsequence.plain': {
			implements: 'bri:bitsequence',
			class: require('../../content/bat/decoders/bitsequence-plain.js'),
		},

	},
});
