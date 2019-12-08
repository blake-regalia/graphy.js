/* eslint quote-props: 0 */
/* eslint-env mocha */
const expect = require('chai').expect;

const factory = require('@graphy/core.data.factory');
const ttl_read = require('@graphy/content.ttl.read');

const ttl_scribe = require('@graphy/content.ttl.scribe');

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

serializer_suite({
	alias: 'ttl',
	verb: 'scribe',
	type: 'c3r',
	serializer: ttl_scribe,
	validator: ttl_read,
	prefixes: H_PREFIXES,
}, (serializer) => {
	serializer.events({
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

		'c4r default graph': () => ({
			writes: [
				{
					type: 'c4r',
					value: {
						'*': {
							'>a': {
								'>b': ['>c'],
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

		'c4r implicit union': () => ({
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
			serializer: (k_serializer, f_later) => {
				let c_warns = 0;
				k_serializer.on('warning', (s_warn) => {
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
			serializer: (k_serializer, f_later) => {
				let c_warns = 0;

				k_serializer.on('warning', (s_warn) => {
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
			serializer: (k_serializer, f_later) => {
				let c_warns = 0;
				k_serializer.on('warning', (s_warn) => {
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

	serializer.outputs({
		'basic': () => ({
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
					a: [':BlankNode'],
				},
				'_:#anon': {
					a: [':BlankNode'],
				},
				'_:#anon2': {
					a: [':BlankNode'],
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
					a: [':BlankNode'],
				},
				[factory.ephemeral()]: {
					a: [':BlankNode'],
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
					'demo:refs': [factory.ephemeral()+'', factory.ephemeral()+''],
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
					'rdf:type': ['dbo:Fruit'],
				},
			},
			output: /* syntax: turtle */ `
				${S_PREFIXES_OUTPUT}

				demo:Banana rdf:type dbo:Fruit .
			`,
		}),
	});
});


