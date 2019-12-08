/* eslint quote-props: 0 */
/* eslint-env mocha */
const expect = require('chai').expect;

const factory = require('@graphy/core.data.factory');
const trig_read = require('@graphy/content.trig.read');

const trig_scribe = require('@graphy/content.trig.scribe');

const serializer_suite = require('../helper/serializer.js');
const util = require('../helper/util.js');

const t_family = require('../helper/t-family.js');
const H_PREFIXES = t_family.prefixes;

const S_PREFIXES_OUTPUT = Object.entries(H_PREFIXES)
	.reduce((s_out, [s_prefix_id, p_iri]) => /* syntax: turtle */ `${s_out}@prefix ${s_prefix_id}: <${p_iri}> .\n`, '').replace(/\n$/, '');

let a_prefix_events = Object.entries(H_PREFIXES)
	.map(([si_prefix_expect, p_iri_expect]) => [
		'prefix', (si_prefix_actual, p_iri_actual) => {
			expect(si_prefix_actual).to.equal(si_prefix_expect);
			expect(p_iri_actual).to.equal(p_iri_expect);
		}]);

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
		'w/ ephemeral blank node graph': g => () => ({
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
	alias: 'trig',
	verb: 'scribe',
	type: 'c4r',
	serializer: trig_scribe,
	validator: trig_read,
	prefixes: H_PREFIXES,
}, (serializer) => {
	serializer.events(modes({
		'prefixes': () => ({
			writes: [
				{
					type: 'prefixes',
					value: H_PREFIXES,
				},
			],
			events: [
				...a_prefix_events,
			],
		}),

		'c3r default graph': () => ({
			writes: [
				{
					type: 'c3r',
					value: {
						'>a': {
							'>b': ['>c'],
						},
					},
				},
			],
			events: [
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'c', '*']]);
				}],
			],
		}),

		'c4r separate graphs': () => ({
			writes: [
				{
					type: 'c4r',
					value: {
						'>g': {
							'>a': {
								'>b': ['>c'],
							},
						},
						'*': {
							'>a': {
								'>b': ['>d'],
							},
						},
					},
				},
			],
			events: [
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'c', 'g']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'd', '*']]);
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
				...a_prefix_events,
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
								'>a': {
									'>b': ['>c'],
								},
							},
						},
					],
				},
			],
			events: [
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'c', '*']]);
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
								'>a': {
									'>b': ['>c'],
								},
							},
						},
						{
							type: 'c4r',
							value: {
								'>g': {
									'>a': {
										'>b': ['>cg'],
									},
								},
								'*': {
									'>a': {
										'>b': ['>d'],
									},
								},
							},
						},
					],
				},
			],
			events: [
				...a_prefix_events,
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'c', '*']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'cg', 'g']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'd', '*']]);
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
						'>a': {
							'>b': ['>c'],
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
						'>g': {
							'>a': {
								'>b': ['>cg'],
							},
						},
						'*': {
							'>a': {
								'>b': ['>d'],
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
				...a_prefix_events,
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'c', '*']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'cg', 'g']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'd', '*']]);
				}],
			],
		}),
	}));

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
			output: /* syntax: trig */ `
				@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
				@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
				@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
				@prefix dbo: <http://dbpedia.org/ontology/> .
				@prefix demo: <http://ex.org/> .
				@prefix : <z://y/> .

				demo:Banana a dbo:Fruit ;
					rdfs:label "Banana"@en ;
					rdfs:comment "Comment"@en .

				demo:Orange a dbo:Fruit ;
					rdfs:label "Orange"@en .

				demo:Apple a dbo:Fruit ;
					rdfs:label "Apple"@en ;
					rdfs:comment "Comment"@en .

				demo:Watermelon a dbo:Fruit ;
					rdfs:label "Watermelon"@en .
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
			output: /* syntax: trig */ `
				@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
				@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
				@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
				@prefix dbo: <http://dbpedia.org/ontology/> .
				@prefix demo: <http://ex.org/> .
				@prefix : <z://y/> .

				{
					demo:Banana a dbo:Fruit ;
						rdfs:label "Banana"@en ;
						rdfs:comment "Comment"@en .

					demo:Orange a dbo:Fruit ;
						rdfs:label "Orange"@en .

					demo:Apple a dbo:Fruit ;
						rdfs:label "Apple"@en ;
						rdfs:comment "Comment"@en .

					demo:Watermelon a dbo:Fruit ;
						rdfs:label "Watermelon"@en .
				}
			`,
		}),

		'writable data event array': () => ({
			type: 'array',
			write: [
				{
					type: 'c3r',
					value: {
						'demo:Grapefruit': {
							a: ['dbo:Fruit'],
							'rdfs:label': ['@en"Grapefruit'],
						},
					},
				},
				{
					type: 'c3r',
					value: {
						'demo:Watermelon': {
							a: ['dbo:Fruit'],
							'rdfs:label': ['@en"Watermelon'],
						},
					},
				},
				{
					type: 'c4r',
					value: {
						'demo:graph': {
							'demo:Grapefruit': {
								a: ['dbo:Fruit'],
								'rdfs:label': ['@en"Grapefruit'],
							},
						},
					},
				},
				{
					type: 'c4r',
					value: {
						'_:graph': {
							'demo:Watermelon': {
								a: ['dbo:Fruit'],
								'rdfs:label': ['@en"Watermelon'],
							},
						},
					},
				},
			],
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				demo:Grapefruit a dbo:Fruit ;
					rdfs:label "Grapefruit"@en .

				demo:Watermelon a dbo:Fruit ;
					rdfs:label "Watermelon"@en .

				demo:graph {
					demo:Grapefruit a dbo:Fruit ;
						rdfs:label "Grapefruit"@en .
				}

				_:graph {
					demo:Watermelon a dbo:Fruit ;
						rdfs:label "Watermelon"@en .
				}
			`,
		}),

		'ephemeral blank node c1 graphs': () => ({
			write: {
				'_:': {
					'demo:Grapefruit': {
						a: ['dbo:Fruit'],
						'rdfs:label': ['@en"Grapefruit'],
					},
				},
				'_:#anon': {
					'demo:Watermelon': {
						a: ['dbo:Fruit'],
						'rdfs:label': ['@en"Watermelon'],
					},
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				[] {
					demo:Grapefruit a dbo:Fruit ;
						rdfs:label "Grapefruit"@en .
				}

				[] {
					demo:Watermelon a dbo:Fruit ;
						rdfs:label "Watermelon"@en .
				}
			`,
		}),

		'c3r ephemeral blank node c1 subjects': () => ({
			type: 'c3r',
			write: {
				'_:': {
					a: [':BlankNode'],
				},
				'_:#anon': {
					a: [':BlankNode'],
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				[] a :BlankNode .

				[] a :BlankNode .
			`,
		}),

		'c4r ephemeral blank node c1 subjects': () => ({
			write: {
				'*': {
					'_:': {
						a: [':BlankNode'],
					},
				},
				'demo:graph': {
					'_:#anon': {
						a: [':BlankNode'],
					},
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				{
					[] a :BlankNode .
				}

				demo:graph {
					[] a :BlankNode .
				}
			`,
		}),

		'c3r ephemeral blank node c1 objects': () => ({
			type: 'c3r',
			write: {
				'demo:BlankNodes': {
					'demo:refs': ['_:', '_:#anon'],
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				demo:BlankNodes demo:refs [], [] .
			`,
		}),

		'c4r ephemeral blank node c1 objects': () => ({
			write: {
				'*': {
					'demo:BlankNodes': {
						'demo:refs': ['_:', '_:#anon'],
					},
				},
				'demo:graph': {
					'demo:BlankNodes': {
						'demo:refs': ['_:', '_:#anon'],
					},
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				{
					demo:BlankNodes demo:refs [], [] .
				}

				demo:graph {
					demo:BlankNodes demo:refs [], [] .
				}
			`,
		}),

		'c3r ephemeral blank node factory subjects': () => ({
			type: 'c3r',
			write: {
				[factory.ephemeral()]: {
					a: [':BlankNode'],
				},
				[factory.ephemeral()]: {
					a: [':BlankNode'],
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				[] a :BlankNode .

				[] a :BlankNode .
			`,
		}),

		'c4r ephemeral blank node factory subjects': () => ({
			write: {
				'*': {
					[factory.ephemeral()]: {
						a: [':BlankNode'],
					},
				},
				'demo:graph': {
					[factory.ephemeral()]: {
						a: [':BlankNode'],
					},
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				{
					[] a :BlankNode .
				}

				demo:graph {
					[] a :BlankNode .
				}
			`,
		}),

		'c3r ephemeral blank node factory objects': () => ({
			type: 'c3r',
			write: {
				'demo:BlankNodes': {
					'demo:refs': [factory.ephemeral()+'', factory.ephemeral()+''],
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				demo:BlankNodes demo:refs [], [] .
			`,
		}),

		'c4r ephemeral blank node factory objects': () => ({
			write: {
				'*': {
					'demo:BlankNodes': {
						'demo:refs': [factory.ephemeral()+'', factory.ephemeral()+''],
					},
				},
				'demo:graph': {
					'demo:BlankNodes': {
						'demo:refs': [factory.ephemeral()+'', factory.ephemeral()+''],
					},
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				{
					demo:BlankNodes demo:refs [], [] .
				}

				demo:graph {
					demo:BlankNodes demo:refs [], [] .
				}
			`,
		}),
	});
});

