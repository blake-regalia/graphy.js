/* eslint quote-props: 0 */
/* eslint-env mocha */
const expect = require('chai').expect;

const factory = require('@graphy/core.data.factory');
const trig_read = require('@graphy/content.trig.read');

const trig_write = require('@graphy/content.trig.write');

const writer_suite = require('../helper/writer.js');
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
			type: 'c3',
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

writer_suite({
	alias: 'trig',
	type: 'c4',
	writer: trig_write,
	validator: trig_read,
	prefixes: H_PREFIXES,
}, (writer) => {
	writer.validates(modes(t_family.validates));

	writer.events({
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

		'c3 default graph': () => ({
			writes: [
				{
					type: 'c3',
					value: {
						'>a': {
							'>b': '>c',
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

		'c4 separate graphs': () => ({
			writes: [
				{
					type: 'c4',
					value: {
						'>g': {
							'>a': {
								'>b': '>c',
							},
						},
						'*': {
							'>a': {
								'>b': '>d',
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

		'array[c3]': () => ({
			writes: [
				{
					type: 'array',
					value: [
						{
							type: 'c3',
							value: {
								'>a': {
									'>b': '>c',
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

		'array[prefixes, c3, c4]': () => ({
			writes: [
				{
					type: 'array',
					value: [
						{
							type: 'prefixes',
							value: H_PREFIXES,
						},
						{
							type: 'c3',
							value: {
								'>a': {
									'>b': '>c',
								},
							},
						},
						{
							type: 'c4',
							value: {
								'>g': {
									'>a': {
										'>b': '>cg',
									},
								},
								'*': {
									'>a': {
										'>b': '>d',
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

		'array[], prefixes, array[], c3, array[], c4, array[]': () => ({
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
					type: 'c3',
					value: {
						'>a': {
							'>b': '>c',
						},
					},
				},
				{
					type: 'array',
					value: [],
				},
				{
					type: 'c4',
					value: {
						'>g': {
							'>a': {
								'>b': '>cg',
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
	});

	writer.outputs({
		'c3 no graph': () => ({
			type: 'c3',
			write: {
				'demo:Banana': {
					a: 'dbo:Fruit',
					'rdfs:label': '@en"Banana',
					'rdfs:comment': '@en"Comment',
				},

				'demo:Orange': {
					a: 'dbo:Fruit',
					'rdfs:label': '@en"Orange',
				},

				'demo:Apple': {
					a: 'dbo:Fruit',
					'rdfs:label': '@en"Apple',
					'rdfs:comment': '@en"Comment',
				},

				'demo:Watermelon': {
					a: 'dbo:Fruit',
					'rdfs:label': '@en"Watermelon',
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

		'c4 default graph': () => ({
			write: {
				'*': {
					'demo:Banana': {
						a: 'dbo:Fruit',
						'rdfs:label': '@en"Banana',
						'rdfs:comment': '@en"Comment',
					},

					'demo:Orange': {
						a: 'dbo:Fruit',
						'rdfs:label': '@en"Orange',
					},

					'demo:Apple': {
						a: 'dbo:Fruit',
						'rdfs:label': '@en"Apple',
						'rdfs:comment': '@en"Comment',
					},

					'demo:Watermelon': {
						a: 'dbo:Fruit',
						'rdfs:label': '@en"Watermelon',
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

		'comments': () => ({
			write: {
				[factory.comment()]: 'above graph',
				'demo:graph': {
					[factory.comment()]: 'above banana',
					'demo:Banana': {
						[factory.comment()]: 'above type',
						a: 'dbo:Fruit',
						[factory.comment()]: 'above label',
						'rdfs:label': '@en"Banana',
						[factory.comment()]: 'below label',
						'rdfs:comment': '@en"Comment',
						[factory.comment()]: 'below comment',
					},

					[factory.comment()]: 'below banana',

					'demo:Orange': {
						a: 'dbo:Fruit',
						[factory.comment()]: 'below type',
						'rdfs:label': '@en"Orange',
					},

					[factory.comment()]: 'below orange',
					[factory.comment()]: 'above apple',
					'demo:Apple': {
						[factory.comment()]: 'below open',
						[factory.comment()]: 'above type',
						a: 'dbo:Fruit',
						[factory.comment()]: 'below type',
						[factory.comment()]: 'above label',
						'rdfs:label': '@en"Apple',
						[factory.comment()]: 'below label',
						[factory.comment()]: 'above comment',
						'rdfs:comment': '@en"Comment',
						[factory.comment()]: 'below comment',
						[factory.comment()]: 'above close',
					},

					'demo:Watermelon': {
						a: 'dbo:Fruit',
						'rdfs:label': '@en"Watermelon',
					},
				},

				'demo:graph2': {
					'demo:Banana': {
						a: 'dbo:Fruit',
						'rdfs:label': '@en"Banana',
						'rdfs:comment': '@en"Comment',
					},
				},

				[factory.comment()]: 'below graph',

				[factory.comment()]: 'above graph',
				'demo:graph3': {
					[factory.comment()]: 'below open',
					[factory.comment()]: 'above banana',
					'demo:Banana': {
						[factory.comment()]: 'below open',
						[factory.comment()]: 'above type',
						a: 'dbo:Fruit',
						[factory.comment()]: 'below type',
						[factory.comment()]: 'above label',
						'rdfs:label': '@en"Banana',
						[factory.comment()]: 'below label',
						[factory.comment()]: 'above comment',
						'rdfs:comment': '@en"Comment',
						[factory.comment()]: 'below comment',
						[factory.comment()]: 'above close',
					},

					[factory.comment()]: 'below banana',
					[factory.comment()]: 'above orange',
					'demo:Orange': {
						a: 'dbo:Fruit',
						[factory.comment()]: 'below type',
						'rdfs:label': '@en"Orange',
					},

					[factory.comment()]: 'below orange',
				},
			},
			output: /* syntax: trig */ `
				@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
				@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
				@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
				@prefix dbo: <http://dbpedia.org/ontology/> .
				@prefix demo: <http://ex.org/> .
				@prefix : <z://y/> .

				# above graph
				demo:graph {
					# above banana
					demo:Banana 
						# above type
						a dbo:Fruit ;
						# above label
						rdfs:label "Banana"@en ;
						# below label
						rdfs:comment "Comment"@en ;
						# below comment
						.

					# below banana
					demo:Orange a dbo:Fruit ;
						# below type
						rdfs:label "Orange"@en .

					# below orange
					# above apple
					demo:Apple 
						# below open
						# above type
						a dbo:Fruit ;
						# below type
						# above label
						rdfs:label "Apple"@en ;
						# below label
						# above comment
						rdfs:comment "Comment"@en ;
						# below comment
						# above close
						.

					demo:Watermelon a dbo:Fruit ;
						rdfs:label "Watermelon"@en .
				}

				demo:graph2 {
					demo:Banana a dbo:Fruit ;
						rdfs:label "Banana"@en ;
						rdfs:comment "Comment"@en .
				}

				# below graph
				# above graph
				demo:graph3 {
					# below open
					# above banana
					demo:Banana 
						# below open
						# above type
						a dbo:Fruit ;
						# below type
						# above label
						rdfs:label "Banana"@en ;
						# below label
						# above comment
						rdfs:comment "Comment"@en ;
						# below comment
						# above close
						.

					# below banana
					# above orange
					demo:Orange a dbo:Fruit ;
						# below type
						rdfs:label "Orange"@en .

					# below orange
				}
			`,
		}),

		'newlines': () => ({
			write: {
				'*': {
					[factory.newlines()]: 1,
					'demo:Banana': {
						[factory.newlines()]: 1,
						a: 'dbo:Fruit',
						[factory.newlines()]: 1,
						'rdfs:label': '@en"Banana',
						[factory.newlines()]: 1,
						'rdfs:comment': '@en"Comment',
						[factory.newlines()]: 1,
					},

					[factory.newlines()]: 1,

					'demo:Orange': {
						a: 'dbo:Fruit',
						[factory.newlines()]: 2,
						'rdfs:label': '@en"Orange',
					},

					[factory.newlines()]: 1,
					[factory.newlines()]: 1,
					'demo:Apple': {
						[factory.newlines()]: 1,
						[factory.newlines()]: 1,
						a: 'dbo:Fruit',
						[factory.newlines()]: 1,
						[factory.newlines()]: 1,
						'rdfs:label': '@en"Apple',
						[factory.newlines()]: 1,
						[factory.newlines()]: 1,
						'rdfs:comment': '@en"Comment',
						[factory.newlines()]: 1,
						[factory.newlines()]: 2,
					},

					'demo:Watermelon': {
						a: 'dbo:Fruit',
						'rdfs:label': '@en"Watermelon',
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

					demo:Banana 

						a dbo:Fruit ;

						rdfs:label "Banana"@en ;

						rdfs:comment "Comment"@en ;

						.


					demo:Orange a dbo:Fruit ;


						rdfs:label "Orange"@en .



					demo:Apple 


						a dbo:Fruit ;


						rdfs:label "Apple"@en ;


						rdfs:comment "Comment"@en ;



						.

					demo:Watermelon a dbo:Fruit ;
						rdfs:label "Watermelon"@en .
				}
			`,
		}),

		'empty objects': () => ({
			write: {
				'_:': {
					[factory.comment()]: 'above banana',
					'demo:Banana': {
						[factory.comment()]: 'above type',
						a: 'dbo:Fruit',
						'demo:empty-1': [],
						[factory.comment()]: 'between empties',
						'demo:empty-2': [],
						[factory.comment()]: 'above label',
						'rdfs:label': '@en"Banana',
						[factory.comment()]: 'below comment',
					},

					'demo:Empty-a': {
						a: [],
					},

					'demo:Empty-demo': {
						'demo:empty': [],
					},

					'demo:Empty-demos': {
						'demo:empty-1': [],
						'demo:empty-2': [],
					},

					'demo:Empty-demos-inline-comment': {
						'demo:empty-1': [],
						[factory.comment()]: 'inside empty',
						'demo:empty-2': [],
					},

					[factory.comment()]: 'outside empty',
					'demo:Empty-demos-comment-above': {
						'demo:empty-1': [],
						'demo:empty-2': [],
					},

					'demo:Okay': {
						'demo:empty-1': [],
						[factory.comment()]: 'between empties',
						'demo:empty-2': [],
						[factory.comment()]: 'above label',
						'rdfs:label': '@en"Banana',
						[factory.comment()]: 'below comment',
					},

					'demo:Orange': {
						a: 'dbo:Fruit',
						[factory.comment()]: 'below type',
						'rdfs:label': '@en"Orange',
					},

					[factory.comment()]: 'below orange',
				},
			},
			output: /* syntax: trig */ `
				@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
				@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
				@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
				@prefix dbo: <http://dbpedia.org/ontology/> .
				@prefix demo: <http://ex.org/> .
				@prefix : <z://y/> .

				[] {
					# above banana
					demo:Banana 
						# above type
						a dbo:Fruit ;
						# between empties
						# above label
						rdfs:label "Banana"@en ;
						# below comment
						.

						# inside empty

					# outside empty
					demo:Okay 
						# between empties
						# above label
						rdfs:label "Banana"@en ;
						# below comment
						.

					demo:Orange a dbo:Fruit ;
						# below type
						rdfs:label "Orange"@en .

					# below orange
				}
			`,
		}),

		'writable data event array': () => ({
			type: 'array',
			write: [
				{
					type: 'c3',
					value: {
						'demo:Grapefruit': {
							a: 'dbo:Fruit',
							'rdfs:label': '@en"Grapefruit',
						},
					},
				},
				{
					type: 'c3',
					value: {
						'demo:Watermelon': {
							a: 'dbo:Fruit',
							'rdfs:label': '@en"Watermelon',
						},
					},
				},
				{
					type: 'c4',
					value: {
						'demo:graph': {
							'demo:Grapefruit': {
								a: 'dbo:Fruit',
								'rdfs:label': '@en"Grapefruit',
							},
						},
					},
				},
				{
					type: 'c4',
					value: {
						'_:graph': {
							'demo:Watermelon': {
								a: 'dbo:Fruit',
								'rdfs:label': '@en"Watermelon',
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
						a: 'dbo:Fruit',
						'rdfs:label': '@en"Grapefruit',
					},
				},
				'_:#anon': {
					'demo:Watermelon': {
						a: 'dbo:Fruit',
						'rdfs:label': '@en"Watermelon',
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

		'c3 ephemeral blank node c1 subjects': () => ({
			type: 'c3',
			write: {
				'_:': {
					a: ':BlankNode',
				},
				'_:#anon': {
					a: ':BlankNode',
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				[] a :BlankNode .

				[] a :BlankNode .
			`,
		}),

		'c4 ephemeral blank node c1 subjects': () => ({
			write: {
				'*': {
					'_:': {
						a: ':BlankNode',
					},
				},
				'demo:graph': {
					'_:#anon': {
						a: ':BlankNode',
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

		'c3 ephemeral blank node c1 objects': () => ({
			type: 'c3',
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

		'c4 ephemeral blank node c1 objects': () => ({
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

		'c3 ephemeral blank node factory subjects': () => ({
			type: 'c3',
			write: {
				[factory.ephemeral()]: {
					a: ':BlankNode',
				},
				[factory.ephemeral()]: {
					a: ':BlankNode',
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				[] a :BlankNode .

				[] a :BlankNode .
			`,
		}),

		'c4 ephemeral blank node factory subjects': () => ({
			write: {
				'*': {
					[factory.ephemeral()]: {
						a: ':BlankNode',
					},
				},
				'demo:graph': {
					[factory.ephemeral()]: {
						a: ':BlankNode',
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

		'c3 ephemeral blank node factory objects': () => ({
			type: 'c3',
			write: {
				'demo:BlankNodes': {
					'demo:refs': [factory.ephemeral(), factory.ephemeral()],
				},
			},
			output: /* syntax: trig */ `
				${S_PREFIXES_OUTPUT}

				demo:BlankNodes demo:refs [], [] .
			`,
		}),

		'c4 ephemeral blank node factory objects': () => ({
			write: {
				'*': {
					'demo:BlankNodes': {
						'demo:refs': [factory.ephemeral(), factory.ephemeral()],
					},
				},
				'demo:graph': {
					'demo:BlankNodes': {
						'demo:refs': [factory.ephemeral(), factory.ephemeral()],
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

