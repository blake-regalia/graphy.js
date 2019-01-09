/* eslint quote-props: 0 */
/* eslint-env mocha */
const expect = require('chai').expect;

const factory = require('@graphy/core.data.factory');
const trig_read = require('@graphy/content.trig.read');

const nq_read = require('@graphy/content.nq.read');
const nq_write = require('@graphy/content.nq.write');

const writer_suite = require('../helper/writer.js');
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
let f_nt = a_rest => /* syntax: turtle */ `[
	<first> "${a_rest.shift()}" ;
	<rest> ${a_rest.length? f_nt(a_rest): '<nil>'} ;
]`;

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

writer_suite({
	alias: 'nq',
	type: 'c4',
	writer: nq_write,
	interpreter: nq_read,
	validator: trig_read,
	prefixes: H_PREFIXES,
}, (writer) => {
	writer.validates(modes({
		'objects': {
			'c1 strings': () => ({
				write: {
					':subject': {
						a: ':type',
						':c1-bn-anon': '_:',
						':c1-bn-labeled': '_:orange',
						':c1-pn': ':object',
						':c1-iri': '>z://object',
						':c1-literal': '"object',
						':c1-lang-literal': '@en"object',
						':c1-dtype-literal-pn': '^:d"object',
						':c1-dtype-literal-iri': '^>x://d"object',
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

			'es literals': () => ({
				write: {
					':subject': {
						':false': false,
						':true': true,
						':zero': 0,
						':integer': 12,
						':decimal': 12.1,
						':infinity': Infinity,
						':negative-infinity': -Infinity,
						':NaN': NaN,
					},
				},
				validate: `
					:subject
						:false false ;
						:true true ;
						:zero 0 ;
						:integer 12 ;
						:decimal 12.1 ;
						:infinity "INF"^^xsd:double ;
						:negative-infinity "-INF"^^xsd:double ;
						:NaN "NaN"^^xsd:double .
				`,
			}),

			'special objects': () => ({
				write: {
					':subject': {
						':date': new Date('1990-03-12'),
						':term-node': factory.namedNode('ex://test'),
						':term-bn': factory.blankNode('test'),
						':literal': factory.literal('test'),
					},
				},
				validate: `
					:subject
						:date "1990-03-12T00:00:00.000Z"^^xsd:dateTime ;
						:term-node <ex://test> ;
						:term-bn _:test ;
						:literal "test" .
				`,
			}),

			'object literals': () => ({
				write: {
					':subject': {
						':list-c1-nodes': ['_:', '_:orange', ':object', '>z://object'],
						':list-c1-literals': ['@en"object', '^:d"object', '^>x://d"object'],
						':list-es-literals': [false, true, 0, 12, 12.1, Infinity, -Infinity, NaN],
						':es-set-nodes': new Set([':a', ':b', ':c']),
					},
				},
				validate: `
					:subject
						:list-c1-nodes [], _:orange, :object, <z://object> ;
						:list-c1-literals "object"@en, "object"^^:d, "object"^^<x://d> ;
						:list-es-literals false, true, 0, 12, 12.1, "INF"^^xsd:double, "-INF"^^xsd:double, "NaN"^^xsd:double ;
						:es-set-nodes :a, :b, :c .
				`,
			}),

			'nested blank nodes': () => ({
				write: {
					':subject': {
						':nested-blank': {},
						':nested-single': {
							':prop': ':object',
						},
						':nested-multiple': {
							':prop1': ':object',
							':prop2': ':object',
						},
						':nested-recursive-1': {
							':prop1': ':object',
							':prop2': {
								':recurse1': ':object',
							},
						},
					},
				},
				validate: `
					:subject
						:nested-blank [] ;
						:nested-single [
							:prop :object ;
						] ;
						:nested-multiple [
							:prop1 :object ;
							:prop2 :object ;
						] ;
						:nested-recursive-1 [
							:prop1 :object ;
							:prop2 [
								:recurse1 :object ;
							] ;
						] .
				`,
			}),
		},

		'collections': {
			'empty collection': () => ({
				write: {
					'>a': {
						'>b': [[]],
						'>c': [[[]]],
						'>d': [[[], [[]]]],
					},
				},
				validate: `
					<a> <b> () .
					<a> <c> (()) .
					<a> <d> (() (())) .
				`,
			}),

			'long items': () => ({
				write: {
					'>a': {
						'>b': [a_items.slice(0).map(s => `"${s}`)],
					},
				},
				validate: `
					<a> <b> (${a_items.slice(0).map(s => `"${s}" `).join(' ')}) .
				`,
			}),

			'recursive collections': () => ({
				write: {
					'>a': {
						'>b': [[
							'"a', '"b', '"c', [
								'"D', '"E', '"F', [
									'"g', '"h', '"i',
								],
								'"G', '"H', '"I',
							],
						]],
					},
				},
				validate: /* syntax: turtle */ `
					<a> <b> (
						"a" "b" "c" (
							"D" "E" "F" (
								"g" "h" "i"
							) "G" "H" "I"
						)
					) .
				`,
			}),

			'nested anonymous blank node lists inside collections': () => ({
				write: {
					'>a': {
						'>b': [[
							{
								'>c': '>d',
								'>e': ['>f', '>g'],
								'>h': [['>i', '>j'], '>k'],
							},
						]],
					},
				},
				validate: /* syntax: turtle */ `
					<a> <b> (
						[
							<c> <d> ;
							<e> <f>, <g> ;
							<h> (<i> <j>), <k> ;
						]
					) .
				`,
			}),

			'custom collections': () => ({
				write: {
					'>a': {
						'>b': [[
							'"a', '"b', '"c', [
								'"D', '"E', '"F', [
									'"g', '"h', '"i',
								],
								'"G', '"H', '"I',
							],
						]],
					},
				},
				config: {
					collections: {
						first: '>first',
						rest: '>rest',
						nil: '>nil',
					},
				},
				validate: /* syntax: turtle */ `
					<a> <b> [
						<first> "a" ;
						<rest> [
							<first> "b" ;
							<rest> [
								<first> "c" ;
								<rest> [
									<first> [
										<first> "D" ;
										<rest> [
											<first> "E" ;
											<rest> [
												<first> "F" ;
												<rest> [
													<first> [
														<first> "g" ;
														<rest> [
															<first> "h" ;
															<rest> [
																<first> "i" ;
																<rest> <nil> ;
															] ;
														] ;
													] ;
													<rest> [
														<first> "G" ;
														<rest> [
															<first> "H" ;
															<rest> [
																<first> "I" ;
																<rest> <nil>
															] ;
														] ;
													] ;
												] ;
											] ;
										] ;
									] ;
									<rest> <nil> ;
								] ;
							] ;
						] ;
					] .
				`,
			}),

			'long custom collections': () => ({
				write: {
					'>a': {
						'>b': [a_items.slice(0).map(s => '"'+s)],
					},
				},
				config: {
					collections: {
						first: '>first',
						rest: '>rest',
						nil: '>nil',
					},
				},
				validate: /* syntax: turtle */ `
					<a> <b> ${f_nt(a_items.slice(0))} .
				`,
			}),

			'deep nesting': () => ({
				write: {
					'>a': {
						'>b': [
							['>c', ['>d', ['>e']]],
						],
					},
				},
				validate: /* syntax: turtle */ `
					<a> <b> (<c> (<d> (<e>))) .
				`,
			}),
		},

		'corner cases': {
			'empty lists': () => ({
				write: {
					'>a': {
						'>b': [],
						'>c': '>d',
					},
				},
				validate: /* syntax: turtle */ `
					<a> <c> <d> .
				`,
			}),
		},
	}));

	writer.events({
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
				// no events
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
			output: /* syntax: n-quads */ `
				<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit>  .
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#label> "Banana"@en  .
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en  .
				<http://ex.org/Orange> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit>  .
				<http://ex.org/Orange> <http://www.w3.org/2000/01/rdf-schema#label> "Orange"@en  .
				<http://ex.org/Apple> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit>  .
				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#label> "Apple"@en  .
				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en  .
				<http://ex.org/Watermelon> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit>  .
				<http://ex.org/Watermelon> <http://www.w3.org/2000/01/rdf-schema#label> "Watermelon"@en  .
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
			output: /* syntax: n-quads */ `
				# above graph
				# above banana
				# above type
				<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> <http://ex.org/graph> .
				# above label
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#label> "Banana"@en <http://ex.org/graph> .
				# below label
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en <http://ex.org/graph> .
				# below comment
				# below banana
				<http://ex.org/Orange> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> <http://ex.org/graph> .
				# below type
				<http://ex.org/Orange> <http://www.w3.org/2000/01/rdf-schema#label> "Orange"@en <http://ex.org/graph> .
				# below orange
				# above apple
				# below open
				# above type
				<http://ex.org/Apple> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> <http://ex.org/graph> .
				# below type
				# above label
				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#label> "Apple"@en <http://ex.org/graph> .
				# below label
				# above comment
				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en <http://ex.org/graph> .
				# below comment
				# above close
				<http://ex.org/Watermelon> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> <http://ex.org/graph> .
				<http://ex.org/Watermelon> <http://www.w3.org/2000/01/rdf-schema#label> "Watermelon"@en <http://ex.org/graph> .
				<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> <http://ex.org/graph2> .
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#label> "Banana"@en <http://ex.org/graph2> .
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en <http://ex.org/graph2> .
				# below graph
				# above graph
				# below open
				# above banana
				# below open
				# above type
				<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> <http://ex.org/graph3> .
				# below type
				# above label
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#label> "Banana"@en <http://ex.org/graph3> .
				# below label
				# above comment
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en <http://ex.org/graph3> .
				# below comment
				# above close
				# below banana
				# above orange
				<http://ex.org/Orange> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> <http://ex.org/graph3> .
				# below type
				<http://ex.org/Orange> <http://www.w3.org/2000/01/rdf-schema#label> "Orange"@en <http://ex.org/graph3> .
				# below orange
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
			output: /* syntax: n-quads */ `
				<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit>  .

				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#label> "Banana"@en  .

				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en  .


				<http://ex.org/Orange> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit>  .


				<http://ex.org/Orange> <http://www.w3.org/2000/01/rdf-schema#label> "Orange"@en  .




				<http://ex.org/Apple> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit>  .


				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#label> "Apple"@en  .


				<http://ex.org/Apple> <http://www.w3.org/2000/01/rdf-schema#comment> "Comment"@en  .



				<http://ex.org/Watermelon> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit>  .
				<http://ex.org/Watermelon> <http://www.w3.org/2000/01/rdf-schema#label> "Watermelon"@en  .
			`,
		}),

		'empty objects': () => ({
			debug: true,
			write: {
				'_:g': {
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
			output: /* syntax: n-quads */ `
				# above banana
				# above type
				<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> _:g .
				# between empties
				# above label
				<http://ex.org/Banana> <http://www.w3.org/2000/01/rdf-schema#label> "Banana"@en _:g .
				# below comment
				# inside empty
				# outside empty
				# between empties
				# above label
				<http://ex.org/Okay> <http://www.w3.org/2000/01/rdf-schema#label> "Banana"@en _:g .
				# below comment
				<http://ex.org/Orange> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://dbpedia.org/ontology/Fruit> _:g .
				# below type
				<http://ex.org/Orange> <http://www.w3.org/2000/01/rdf-schema#label> "Orange"@en _:g .
				# below orange
			`,
		}),
	});
});

