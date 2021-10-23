/* eslint indent: 0, padded-blocks: 0, quote-props: 0, no-new: 0 */
import chai from 'chai';
const expect = chai.expect;

import {
	blankNode,
	ephemeralBlankNode,
	comment,
	newlines,
} from '@graphy/core';

import {
	TurtleReader,
	TurtleWriter,
} from '@graphy/content';

import WriterSuite from '../../helper/writer-suite.mjs';

import util from '../helper/util.js';

import t_family from '../helper/t-family.js';
const H_PREFIXES = t_family.prefixes;

const S_PREFIXES_OUTPUT = Object.entries(H_PREFIXES)
	.reduce((s_out, [s_prefix_id, p_iri]) => /* syntax: turtle */ `${s_out}@prefix ${s_prefix_id}: <${p_iri}> .\n`, '').replace(/\n$/, '');

const a_prefix_events = Object.entries(H_PREFIXES)
	.map(([si_prefix_expect, p_iri_expect]) => [
		'prefix', (si_prefix_actual, p_iri_actual) => {
			expect(si_prefix_actual).to.equal(si_prefix_expect);
			expect(p_iri_actual).to.equal(p_iri_expect);
		}]);

const hc3_alice_bob = {
	_Alice: {
		a: ':Person',
		foaf_name: '"Alice',
	},
	_Bob: {
		a: ':Person',
	},
};

const hc3_alice_knows = {
	_Alice: {
		a: ':Person',
		foaf_name: '"Alice',
		foaf_knows: [
			':Bob',
			':Charlie',
			':David',
			':Edward',
		],
	},
};

(new WriterSuite({
	alias: 'ttl',
	type: 'c3',
	writer: TurtleWriter,
	validator: TurtleReader,
	prefixes: H_PREFIXES,
}, (writer) => {
	writer.validates(t_family.validates);

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

		'c4 default graph': () => ({
			writes: [
				{
					type: 'c4',
					value: {
						'*': {
							'>a': {
								'>b': '>c',
							},
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

		'c4 implicit union': () => ({
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
			writer: (k_writer, f_later) => {
				let c_warns = 0;
				k_writer.on('warning', (s_warn) => {
					expect(s_warn).to.include('implicit union');
					c_warns += 1;
				});

				f_later(() => {
					expect(c_warns).to.equal(1);
				});
			},
			events: [
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'c', '*']]);
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
			writer: (k_writer, f_later) => {
				let c_warns = 0;
				k_writer.on('warning', (s_warn) => {
					expect(s_warn).to.include('implicit union');
					c_warns += 1;
				});

				f_later(() => {
					expect(c_warns).to.equal(1);
				});
			},
			events: [
				...a_prefix_events,
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'c', '*']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'cg', '*']]);
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
			writer: (k_writer, f_later) => {
				let c_warns = 0;
				k_writer.on('warning', (s_warn) => {
					expect(s_warn).to.include('implicit union');
					c_warns += 1;
				});

				f_later(() => {
					expect(c_warns).to.equal(1);
				});
			},
			events: [
				...a_prefix_events,
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'c', '*']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'cg', '*']]);
				}],
				['data', (g_quad) => {
					util.validate_quads([g_quad], [['a', 'b', 'd', '*']]);
				}],
			],
		}),
	});

	writer.outputs({
		'basic': () => ({
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
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

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

		'comments': () => ({
			write: {
				[comment()]: 'above banana',
				'demo:Banana': {
					[comment()]: 'above type',
					a: 'dbo:Fruit',
					[comment()]: 'above label',
					'rdfs:label': '@en"Banana',
					[comment()]: 'below label',
					'rdfs:comment': '@en"Comment',
					[comment()]: 'below comment',
				},

				[comment()]: 'below banana',

				'demo:Orange': {
					a: 'dbo:Fruit',
					[comment()]: 'below type',
					'rdfs:label': '@en"Orange',
				},

				[comment()]: 'below orange',
				[comment()]: 'above apple',
				'demo:Apple': {
					[comment()]: 'below open',
					[comment()]: 'above type',
					a: 'dbo:Fruit',
					[comment()]: 'below type',
					[comment()]: 'above label',
					'rdfs:label': '@en"Apple',
					[comment()]: 'below label',
					[comment()]: 'above comment',
					'rdfs:comment': '@en"Comment',
					[comment()]: 'below comment',
					[comment()]: 'above close',
				},

				'demo:Watermelon': {
					a: 'dbo:Fruit',
					'rdfs:label': '@en"Watermelon',
				},
			},
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

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
			`,
		}),

		'newlines': () => ({
			write: {
				[newlines()]: 1,
				'demo:Banana': {
					[newlines()]: 1,
					a: 'dbo:Fruit',
					[newlines()]: 1,
					'rdfs:label': '@en"Banana',
					[newlines()]: 1,
					'rdfs:comment': '@en"Comment',
					[newlines()]: 1,
				},

				[newlines()]: 1,

				'demo:Orange': {
					a: 'dbo:Fruit',
					[newlines()]: 2,
					'rdfs:label': '@en"Orange',
				},

				[newlines()]: 1,
				[newlines()]: 1,
				'demo:Apple': {
					[newlines()]: 1,
					[newlines()]: 1,
					a: 'dbo:Fruit',
					[newlines()]: 1,
					[newlines()]: 1,
					'rdfs:label': '@en"Apple',
					[newlines()]: 1,
					[newlines()]: 1,
					'rdfs:comment': '@en"Comment',
					[newlines()]: 1,
					[newlines()]: 2,
				},

				'demo:Watermelon': {
					a: 'dbo:Fruit',
					'rdfs:label': '@en"Watermelon',
				},
			},
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}


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
			`,
		}),

		'empty objects': () => ({
			write: {
				[comment()]: 'above banana',
				'demo:Banana': {
					[comment()]: 'above type',
					a: 'dbo:Fruit',
					'demo:empty-1': [],
					[comment()]: 'between empties',
					'demo:empty-2': [],
					[comment()]: 'above label',
					'rdfs:label': '@en"Banana',
					[comment()]: 'below comment',
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
					[comment()]: 'inside empty',
					'demo:empty-2': [],
				},

				[comment()]: 'outside empty',
				'demo:Empty-demos-comment-above': {
					'demo:empty-1': [],
					'demo:empty-2': [],
				},

				'demo:Okay': {
					'demo:empty-1': [],
					[comment()]: 'between empties',
					'demo:empty-2': [],
					[comment()]: 'above label',
					'rdfs:label': '@en"Banana',
					[comment()]: 'below comment',
				},

				'demo:Orange': {
					a: 'dbo:Fruit',
					[comment()]: 'below type',
					'rdfs:label': '@en"Orange',
				},

				[comment()]: 'below orange',
			},
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

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
			],
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

				demo:Grapefruit a dbo:Fruit ;
					rdfs:label "Grapefruit"@en .

				demo:Watermelon a dbo:Fruit ;
					rdfs:label "Watermelon"@en .
			`,
		}),

		'ephemeral blank node c1 subjects': () => ({
			write: {
				'_:': {
					a: ':BlankNode',
				},
				'_:#anon': {
					a: ':BlankNode',
				},
				'_:#anon2': {
					a: ':BlankNode',
				},
			},
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

				[] a :BlankNode .

				[] a :BlankNode .

				[] a :BlankNode .
			`,
		}),

		'ephemeral blank node c1 objects': () => ({
			write: {
				'demo:BlankNodes': {
					'demo:refs': ['_:', '_:#anon'],
				},
			},
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

				demo:BlankNodes demo:refs [], [] .
			`,
		}),

		'ephemeral blank node factory subjects': () => ({
			write: {
				[ephemeralBlankNode()]: {
					a: ':BlankNode',
				},
				[ephemeralBlankNode()]: {
					a: ':BlankNode',
				},
			},
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

				[] a :BlankNode .

				[] a :BlankNode .
			`,
		}),

		'ephemeral blank node factory objects': () => ({
			write: {
				'demo:BlankNodes': {
					'demo:refs': [ephemeralBlankNode(), ephemeralBlankNode()],
				},
			},
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

				demo:BlankNodes demo:refs [], [] .
			`,
		}),

		'use rdf:type': () => ({
			write: {
				'demo:Banana': {
					'rdf:type': 'dbo:Fruit',
				},
			},
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

				demo:Banana rdf:type dbo:Fruit .
			`,
		}),

		'directives styling: sparql': () => ({
			config: {
				style: {
					directives: 'sparql',
				},
			},
			type: 'array',
			write: [],
			output: /* syntax: turtle */ `
				${Object.entries(H_PREFIXES)
					.reduce((s_out, [s_prefix_id, p_iri]) => /* syntax: turtle */ ''
						+`${s_out}prefix ${s_prefix_id}: <${p_iri}>\n`, '').replace(/\n$/, '')}
			`,
		}),

		'directives styling: Sparql': () => ({
			config: {
				style: {
					directives: 'Sparql',
				},
			},
			type: 'array',
			write: [],
			output: /* syntax: turtle */ `
				${Object.entries(H_PREFIXES)
					.reduce((s_out, [s_prefix_id, p_iri]) => /* syntax: turtle */ ''
						+`${s_out}Prefix ${s_prefix_id}: <${p_iri}>\n`, '').replace(/\n$/, '')}
			`,
		}),

		'directives styling: SPARQL': () => ({
			config: {
				style: {
					directives: 'SPARQL',
				},
			},
			type: 'array',
			write: [],
			output: /* syntax: turtle */ `
				${Object.entries(H_PREFIXES)
					.reduce((s_out, [s_prefix_id, p_iri]) => /* syntax: turtle */ ''
						+`${s_out}PREFIX ${s_prefix_id}: <${p_iri}>\n`, '').replace(/\n$/, '')}
			`,
		}),

		'directives styling: turtle': () => ({
			config: {
				style: {
					directives: 'turtle',
				},
			},
			type: 'array',
			write: [],
			output: /* syntax: turtle */ `
				${Object.entries(H_PREFIXES)
					.reduce((s_out, [s_prefix_id, p_iri]) => /* syntax: turtle */ ''
						+`${s_out}@prefix ${s_prefix_id}: <${p_iri}> .\n`, '').replace(/\n$/, '')}
			`,
		}),

		'directives styling: Turtle': () => ({
			config: {
				style: {
					directives: 'Turtle',
				},
			},
			type: 'array',
			write: [],
			output: /* syntax: turtle */ `
				${Object.entries(H_PREFIXES)
					.reduce((s_out, [s_prefix_id, p_iri]) => /* syntax: turtle */ ''
						+`${s_out}@Prefix ${s_prefix_id}: <${p_iri}> .\n`, '').replace(/\n$/, '')}
			`,
		}),

		'directives styling: TURTLE': () => ({
			config: {
				style: {
					directives: 'TURTLE',
				},
			},
			type: 'array',
			write: [],
			output: /* syntax: turtle */ `
				${Object.entries(H_PREFIXES)
					.reduce((s_out, [s_prefix_id, p_iri]) => /* syntax: turtle */ ''
						+`${s_out}@PREFIX ${s_prefix_id}: <${p_iri}> .\n`, '').replace(/\n$/, '')}
			`,
		}),

		'heading style: line': () => ({
			config: {
				style: {
					heading: 'line',
				},
			},
			write: hc3_alice_bob,
			output: /* syntax: turtle */ `
				eg:Alive a dbo:Person ;
					foaf:name "Alice" .

				eg:Bob a :Person .
			`,
		}),

		'heading style: break-list': () => ({
			config: {
				style: {
					heading: 'break-list',
				},
			},
			write: hc3_alice_bob,
			output: /* syntax: turtle */ `
				eg:Alive
					a dbo:Person ;
					foaf:name "Alice" .

				eg:Bob a :Person .
			`,
		}),

		'heading style: break-all': () => ({
			config: {
				style: {
					heading: 'break-all',
				},
			},
			write: hc3_alice_bob,
			output: /* syntax: turtle */ `
				eg:Alive
					a dbo:Person ;
					foaf:name "Alice" .

				eg:Bob
					a :Person .
			`,
		}),

		' terminator style: line': () => ({
			config: {
				style: {
					terminator: 'line',
				},
			},
			write: hc3_alice_bob,
			output: /* syntax: turtle */ `
				eg:Alive a dbo:Person ;
					foaf:name "Alice" .

				eg:Bob a :Person .
			`,
		}),

		' terminator style: break': () => ({
			config: {
				style: {
					terminator: 'break',
				},
			},
			write: hc3_alice_bob,
			output: /* syntax: turtle */ `
				eg:Alive a dbo:Person ;
					foaf:name "Alice" ;
					.

				eg:Bob a :Person ;
					.
			`,
		}),

		' objects style: line': () => ({
			config: {
				style: {
					objects: 'line',
				},
			},
			write: hc3_alice_knows,
			output: /* syntax: turtle */ `
				eg:Alive a dbo:Person ;
					foaf:name "Alice" ;
					foaf:name eg:Bob, eg:Charlie, eg:David, eg:Edward .
			`,
		}),

		' objects style: break': () => ({
			config: {
				style: {
					objects: 'break',
				},
			},
			write: hc3_alice_knows,
			output: /* syntax: turtle */ `
				eg:Alive a dbo:Person ;
					foaf:name "Alice" ;
					foaf:name eg:Bob,
						eg:Charlie,
						eg:David,
						eg:Edward .
			`,
		}),

		' objects style: break-list': () => ({
			config: {
				style: {
					objects: 'break-list',
				},
			},
			write: hc3_alice_knows,
			output: /* syntax: turtle */ `
				eg:Alive a dbo:Person ;
					foaf:name "Alice" ;
					foaf:name
						eg:Bob,
						eg:Charlie,
						eg:David,
						eg:Edward .
			`,
		}),

		' objects style: break-all': () => ({
			config: {
				style: {
					objects: 'break-all',
				},
			},
			write: hc3_alice_knows,
			output: /* syntax: turtle */ `
				eg:Alive a dbo:Person ;
					foaf:name
						"Alice" ;
					foaf:name
						eg:Bob,
						eg:Charlie,
						eg:David,
						eg:Edward .
			`,
		}),


	});

	const R_ERR_PREDICATE = /predicate position/;
	writer.throws({
		'blank node predicates': {
			'auto blank node': () => ({
				write: {
					'demo:subject': {
						'_:': 'demo:object',
					},
				},
				match: R_ERR_PREDICATE,
			}),

			'c1 labeled blank node': () => ({
				write: {
					'demo:subject': {
						'_:label': 'demo:object',
					},
				},
			}),

			'c1 ephemeral blank node': () => ({
				write: {
					'demo:subject': {
						'_:#anon': 'demo:object',
					},
				},
			}),

			'c1 hinted auto blank node': () => ({
				write: {
					'demo:subject': {
						'_:_anon': 'demo:object',
					},
				},
			}),

			'factory ephemeral blank node': () => ({
				write: {
					'demo:subject': {
						[ephemeralBlankNode()]: 'demo:object',
					},
				},
			}),

			'factory auto blank node': () => ({
				write: {
					'demo:subject': {
						[blankNode()]: 'demo:object',
					},
				},
			}),

			'factory labeled blank node': () => ({
				write: {
					'demo:subject': {
						[blankNode('label')]: 'demo:object',
					},
				},
			}),
		},
	});
}));


