/* eslint quote-props: 0 */
/* eslint-env mocha */
const expect = require('chai').expect;

const factory = require('@graphy/core.data.factory');
const ttl_read = require('@graphy/content.ttl.read');

const ttl_write = require('@graphy/content.ttl.write');

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

writer_suite({
	alias: 'ttl',
	type: 'c3',
	writer: ttl_write,
	validator: ttl_read,
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
				[factory.ephemeral()]: {
					a: ':BlankNode',
				},
				[factory.ephemeral()]: {
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
					'demo:refs': [factory.ephemeral(), factory.ephemeral()],
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
						[factory.ephemeral()]: 'demo:object',
					},
				},
			}),

			'factory auto blank node': () => ({
				write: {
					'demo:subject': {
						[factory.blankNode()]: 'demo:object',
					},
				},
			}),

			'factory labeled blank node': () => ({
				write: {
					'demo:subject': {
						[factory.blankNode('label')]: 'demo:object',
					},
				},
			}),
		},
	});
});


