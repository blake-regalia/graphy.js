/* eslint quote-props: 0 */
/* eslint-env mocha */
const trig_read = require('@graphy/content.trig.read');
const factory = require('@graphy/core.data.factory');

const rdf_xml_parser = require('rdfxml-streaming-parser').RdfXmlParser;
const xml_scribe = require('@graphy/content.xml.scribe');

const serializer_suite = require('../helper/serializer.js');
const util = require('../helper/util.js');

const H_PREFIXES = {
	rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
	rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
	xsd: 'http://www.w3.org/2001/XMLSchema#',
	dbo: 'http://dbpedia.org/ontology/',
	demo: 'http://ex.org/',
	'': 'z://y/',
};

serializer_suite({
	alias: 'nt',
	verb: 'scribe',
	type: 'c3r',
	serializer: xml_scribe,
	interpreter: rdf_xml_parser,
	validator: trig_read,
	prefixes: H_PREFIXES,
}, (serializer) => {
	serializer.validates({
		'objects': {
			'c1 strings': () => ({
				write: {
					':subject': {
						a: [':type'],
						':c1-bn-anon': ['_:'],
						':c1-bn-labeled': ['_:orange'],
						':c1-pn': [':object'],
						':c1-iri': ['>z://object'],
						':c1-literal': ['"object'],
						':c1-lang-literal': ['@en"object'],
						':c1-dtype-literal-pn': ['^:d"object'],
						':c1-dtype-literal-iri': ['^>x://d"object'],
					},
				},
				validate: `
					:subject a :type ;
						:c1-bn-anon [] ;
						:c1-bn-labeled _:orange ;
						:c1-pn :object ;
						:c1-iri <z://object> ;
						:c1-literal "object" ;
						:c1-lang-literal "object"@en ;
						:c1-dtype-literal-pn "object"^^:d ;
						:c1-dtype-literal-iri "object"^^<x://d> .
				`,
			}),

			'object literals': () => ({
				write: {
					':subject': {
						':list-c1-nodes': ['_:', '_:orange', ':object', '>z://object'],
						':list-c1-literals': ['@en"object', '^:d"object', '^>x://d"object'],
					},
				},
				validate: `
					:subject
						:list-c1-nodes [], _:orange, :object, <z://object> ;
						:list-c1-literals "object"@en, "object"^^:d, "object"^^<x://d> .
				`,
			}),

			'quad-like': () => ({
				type: 'array',
				write: [
					{
						subject: {
							termType: 'NamedNode',
							value: 'z://y/subject',
						},
						predicate: {
							termType: 'NamedNode',
							value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
						},
						object: {
							termType: 'NamedNode',
							value: 'z://y/type',
						},
					},
					{
						subject: {
							termType: 'NamedNode',
							value: 'z://y/subject',
						},
						predicate: {
							termType: 'NamedNode',
							value: 'z://y/literal',
						},
						object: {
							termType: 'Literal',
							value: 'object',
							language: '',
							datatype: null,
						},
					},
				],
				validate: `
					:subject a :type ;
						:literal "object" ;
						.
				`,
			}),
		},
	});

	serializer.events({
		'prefixes': () => ({
			writes: [
				{
					type: 'prefixes',
					value: H_PREFIXES,
				},
			],
			events: [
				// no events
			],
		}),

		'c3r default graph': () => ({
			writes: [
				{
					type: 'c3r',
					value: {
						'>z://y/a': {
							'>z://y/b': ['>z://y/c'],
						},
					},
				},
			],
			events: [
				['data', (g_quad) => {
					util.validate_quads([factory.fromQuad(g_quad)], [['z://y/a', 'z://y/b', 'z://y/c', '*']]);
				}],
			],
		}),

		'c4r default graph': () => ({
			writes: [
				{
					type: 'c4r',
					value: {
						'*': {
							'>z://y/a': {
								'>z://y/b': ['>z://y/d'],
							},
						},
					},
				},
			],
			events: [
				['data', (g_quad) => {
					util.validate_quads([factory.fromQuad(g_quad)], [['z://y/a', 'z://y/b', 'z://y/d', '*']]);
				}],
			],
		}),

		'empty array': () => ({
			writes: [
				{
					type: 'array',
					value: [],
				},
			],
			events: [],
		}),

		'array[prefixes]': () => ({
			writes: [
				{
					type: 'array',
					value: [
						{
							type: 'prefixes',
							value: H_PREFIXES,
						},
					],
				},
			],
			events: [
				// no events
			],
		}),

		'array[c3r]': () => ({
			writes: [
				{
					type: 'array',
					value: [
						{
							type: 'c3r',
							value: {
								'>z://y/a': {
									'>z://y/b': ['>z://y/c'],
								},
							},
						},
					],
				},
			],
			events: [
				['data', (g_quad) => {
					util.validate_quads([factory.fromQuad(g_quad)], [['z://y/a', 'z://y/b', 'z://y/c', '*']]);
				}],
			],
		}),

		'array[prefixes, c3r, c4r]': () => ({
			writes: [
				{
					type: 'array',
					value: [
						{
							type: 'prefixes',
							value: H_PREFIXES,
						},
						{
							type: 'c3r',
							value: {
								'>z://y/a': {
									'>z://y/b': ['>z://y/c'],
								},
							},
						},
						{
							type: 'c4r',
							value: {
								'*': {
									'>z://y/a': {
										'>z://y/b': ['>z://y/d'],
									},
								},
							},
						},
					],
				},
			],
			events: [
				['data', (g_quad) => {
					util.validate_quads([factory.fromQuad(g_quad)], [['z://y/a', 'z://y/b', 'z://y/c', '*']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([factory.fromQuad(g_quad)], [['z://y/a', 'z://y/b', 'z://y/d', '*']]);
				}],
			],
		}),

		'array[], prefixes, array[], c3r, array[], c4r, array[]': () => ({
			writes: [
				{
					type: 'array',
					value: [],
				},
				{
					type: 'prefixes',
					value: H_PREFIXES,
				},
				{
					type: 'array',
					value: [],
				},
				{
					type: 'c3r',
					value: {
						'>z://y/a': {
							'>z://y/b': ['>z://y/c'],
						},
					},
				},
				{
					type: 'array',
					value: [],
				},
				{
					type: 'c4r',
					value: {
						'*': {
							'>z://y/a': {
								'>z://y/b': ['>z://y/d'],
								'>empty': [],
							},
						},
					},
				},
				{
					type: 'array',
					value: [],
				},
			],
			events: [
				['data', (g_quad) => {
					util.validate_quads([factory.fromQuad(g_quad)], [['z://y/a', 'z://y/b', 'z://y/c', '*']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([factory.fromQuad(g_quad)], [['z://y/a', 'z://y/b', 'z://y/d', '*']]);
				}],
			],
		}),
	});

	serializer.outputs({
		'c3r no graph': () => ({
			type: 'c3r',
			write: {
				'demo:Banana': {
					a: ['dbo:Fruit'],
					'rdfs:label': ['@en"Banana'],
					'rdfs:comment': ['@en"Comment'],
				},

				'demo:Orange': {
					a: ['dbo:Fruit'],
					'rdfs:label': ['@en"Orange'],
				},

				'demo:Apple': {
					a: ['dbo:Fruit'],
					'rdfs:label': ['@en"Apple'],
					'rdfs:comment': ['@en"Comment'],
				},

				'demo:Watermelon': {
					a: ['dbo:Fruit'],
					'rdfs:label': ['@en"Watermelon'],
				},
			},
			output: /* syntax: rdf/xml */ `
				<?xml version="1.0" encoding="utf-8"?>
				<rdf:RDF
					xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
					xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
					xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
					xmlns:dbo="http://dbpedia.org/ontology/"
					xmlns:demo="http://ex.org/"
					xmlns="z://y/">

					<rdf:Description rdf:about="http://ex.org/Banana">
						<rdf:type rdf:resource="http://dbpedia.org/ontology/Fruit"/>
						<rdfs:label xml:lang="en">Banana</rdfs:label>
						<rdfs:comment xml:lang="en">Comment</rdfs:comment>
					</rdf:Description>

					<rdf:Description rdf:about="http://ex.org/Orange">
						<rdf:type rdf:resource="http://dbpedia.org/ontology/Fruit"/>
						<rdfs:label xml:lang="en">Orange</rdfs:label>
					</rdf:Description>

					<rdf:Description rdf:about="http://ex.org/Apple">
						<rdf:type rdf:resource="http://dbpedia.org/ontology/Fruit"/>
						<rdfs:label xml:lang="en">Apple</rdfs:label>
						<rdfs:comment xml:lang="en">Comment</rdfs:comment>
					</rdf:Description>

					<rdf:Description rdf:about="http://ex.org/Watermelon">
						<rdf:type rdf:resource="http://dbpedia.org/ontology/Fruit"/>
						<rdfs:label xml:lang="en">Watermelon</rdfs:label>
					</rdf:Description>
				</rdf:RDF>
			`,
		}),

		'c4r default graph': () => ({
			type: 'c4r',
			write: {
				'*': {
					'demo:Banana': {
						a: ['dbo:Fruit'],
						'rdfs:label': ['@en"Banana'],
						'rdfs:comment': ['@en"Comment'],
					},

					'demo:Orange': {
						a: ['dbo:Fruit'],
						'rdfs:label': ['@en"Orange'],
					},

					'demo:Apple': {
						a: ['dbo:Fruit'],
						'rdfs:label': ['@en"Apple'],
						'rdfs:comment': ['@en"Comment'],
					},

					'demo:Watermelon': {
						a: ['dbo:Fruit'],
						'rdfs:label': ['@en"Watermelon'],
					},
				},
			},
			output: /* syntax: rdf/xml */ `
				<?xml version="1.0" encoding="utf-8"?>
				<rdf:RDF
					xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
					xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
					xmlns:xsd="http://www.w3.org/2001/XMLSchema#"
					xmlns:dbo="http://dbpedia.org/ontology/"
					xmlns:demo="http://ex.org/"
					xmlns="z://y/">

					<rdf:Description rdf:about="http://ex.org/Banana">
						<rdf:type rdf:resource="http://dbpedia.org/ontology/Fruit"/>
						<rdfs:label xml:lang="en">Banana</rdfs:label>
						<rdfs:comment xml:lang="en">Comment</rdfs:comment>
					</rdf:Description>

					<rdf:Description rdf:about="http://ex.org/Orange">
						<rdf:type rdf:resource="http://dbpedia.org/ontology/Fruit"/>
						<rdfs:label xml:lang="en">Orange</rdfs:label>
					</rdf:Description>

					<rdf:Description rdf:about="http://ex.org/Apple">
						<rdf:type rdf:resource="http://dbpedia.org/ontology/Fruit"/>
						<rdfs:label xml:lang="en">Apple</rdfs:label>
						<rdfs:comment xml:lang="en">Comment</rdfs:comment>
					</rdf:Description>

					<rdf:Description rdf:about="http://ex.org/Watermelon">
						<rdf:type rdf:resource="http://dbpedia.org/ontology/Fruit"/>
						<rdfs:label xml:lang="en">Watermelon</rdfs:label>
					</rdf:Description>
				</rdf:RDF>
			`,
		}),

	});

	serializer.throws({
		'xml prefix': () => ({
			type: 'prefixes',
			write: {
				xml: 'http://noop/',
			},
			match: /^Cannot serialize prefix 'xml'/,
		}),

		'xmlns prefix': () => ({
			type: 'prefixes',
			write: {
				xmlns: 'http://noop/',
			},

			match: /^Cannot serialize prefix 'xmlns'/,
		}),

		'xml-stylesheet prefix': () => ({
			type: 'prefixes',
			write: {
				'xml-stylesheet': 'http://noop/',
			},

			match: /^Cannot serialize prefix 'xml-stylesheet'/,
		}),
	});
});

