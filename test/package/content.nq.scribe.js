/* eslint quote-props: 0 */
/* eslint-env mocha */
const expect = require('chai').expect;

const factory = require('@graphy/core.data.factory');
const trig_read = require('@graphy/content.trig.read');

const nq_read = require('@graphy/content.nq.read');
const nq_scribe = require('@graphy/content.nq.scribe');

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

let a_items = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const modes = (h_tree) => {
	let g_mods = {
		'w/o graph': g => () => ({
			...g,
			type: 'c3r',
		}),
		'w/ named graph': g => () => ({
			...g,
			write: {
				':graph': g.write,
			},
			validate: `:graph { ${g.validate} }`,
		}),
		'w/ anonymous blank node graph': g => () => ({
			...g,
			write: {
				'_:': g.write,
			},
			validate: `[] { ${g.validate} }`,
		}),
		'w/ labeled blank node graph': g => () => ({
			...g,
			write: {
				'_:graph': g.write,
			},
			validate: `_:graph { ${g.validate} }`,
		}),
	};


	let g_outs = Object.keys(g_mods)
		.reduce((h_out, s_key) => ({
			...h_out,
			[s_key]: {},
		}), {});

	util.map_tree(h_tree, (s_label, f_leaf, a_path) => {
		let a_nodes = Object.values(g_outs);

		for(let s_key of a_path) {
			if(!(s_key in a_nodes[0])) a_nodes.forEach(h_node => h_node[s_key] = {});
			a_nodes = a_nodes.map(h_node => h_node[s_key]);
		}

		let {
			write: g_write,
			validate: s_validate,
		} = f_leaf();


		a_nodes.forEach((h_node, i_node) => {
			let s_mode = Object.keys(g_outs)[i_node];
			describe(s_mode, () => {
				h_node[s_label] = g_mods[s_mode](f_leaf());
			});
		});
	});

	return g_outs;
};

serializer_suite({
	alias: 'nq',
	verb: 'scribe',
	type: 'c4r',
	serializer: nq_scribe,
	interpreter: nq_read,
	validator: trig_read,
	prefixes: H_PREFIXES,
}, (serializer) => {
	serializer.validates(modes({
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
		},
	}));

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
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/c', '*']]);
				}],
			],
		}),

		'c4r separate graphs': () => ({
			writes: [
				{
					type: 'c4r',
					value: {
						'>z://y/g': {
							'>z://y/a': {
								'>z://y/b': ['>z://y/c'],
							},
						},
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
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/c', 'z://y/g']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/d', '*']]);
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
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/c', '*']]);
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
								'>z://y/g': {
									'>z://y/a': {
										'>z://y/b': ['>z://y/cg'],
									},
								},
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
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/c', '*']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/cg', 'z://y/g']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/d', '*']]);
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
						'>z://y/g': {
							'>z://y/a': {
								'>z://y/b': ['>z://y/cg'],
							},
						},
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
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/c', '*']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/cg', 'z://y/g']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['z://y/a', 'z://y/b', 'z://y/d', '*']]);
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
			output: /* syntax: n-quads */ `
				<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> .
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#label> "Banana"@en .
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en .
				<http://ex.org/Orange> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> .
				<http://ex.org/Orange> <http://www.w3.org/2000/01/rdf-schema#label> "Orange"@en .
				<http://ex.org/Apple> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> .
				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#label> "Apple"@en .
				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en .
				<http://ex.org/Watermelon> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> .
				<http://ex.org/Watermelon> <http://www.w3.org/2000/01/rdf-schema#label> "Watermelon"@en .
			`,
		}),

		'c4r default graph': () => ({
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
			output: /* syntax: n-quads */ `
				<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> .
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#label> "Banana"@en .
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en .
				<http://ex.org/Orange> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> .
				<http://ex.org/Orange> <http://www.w3.org/2000/01/rdf-schema#label> "Orange"@en .
				<http://ex.org/Apple> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> .
				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#label> "Apple"@en .
				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en .
				<http://ex.org/Watermelon> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> .
				<http://ex.org/Watermelon> <http://www.w3.org/2000/01/rdf-schema#label> "Watermelon"@en .
			`,
		}),

	});
});

