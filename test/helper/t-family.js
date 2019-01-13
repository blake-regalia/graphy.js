/* eslint quote-props: 0 */
const factory = require('@graphy/core.data.factory');
const util = require('./util.js');

let a_items = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

let kt_nonreusable_ephemeral = factory.ephemeral();
let kt_reusable_blank_node_auto = factory.blankNode();
let kt_reusable_blank_node_labeled = factory.blankNode('label');

module.exports = {
	prefixes: {
		rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
		xsd: 'http://www.w3.org/2001/XMLSchema#',
		dbo: 'http://dbpedia.org/ontology/',
		demo: 'http://ex.org/',
		'': 'z://y/',
	},
	validates: {
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
						':term-bn-labeled': factory.blankNode('test'),
						':term-bn-auto': factory.blankNode(),
						':term-bn-ephemeral': factory.ephemeral(),
						':literal': factory.literal('test'),
					},
				},
				validate: `
					:subject
						:date "1990-03-12T00:00:00.000Z"^^xsd:dateTime ;
						:term-node <ex://test> ;
						:term-bn-labeled _:test ;
						:term-bn-auto _:_auto ;
						:term-bn-ephemeral [] ;
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

			'reusable blank nodes': () => ({
				write: {
					[kt_reusable_blank_node_auto]: {
						':self': kt_reusable_blank_node_auto,
						':labeled': kt_reusable_blank_node_labeled,
						':ephemeral': kt_nonreusable_ephemeral,
					},

					[kt_reusable_blank_node_labeled]: {
						':self': kt_reusable_blank_node_labeled,
						':auto': kt_reusable_blank_node_auto,
						':ephemeral': kt_nonreusable_ephemeral,
					},

					[kt_nonreusable_ephemeral]: {
						':ephemeral': kt_nonreusable_ephemeral,
						':auto': kt_reusable_blank_node_auto,
						':labeled': kt_reusable_blank_node_labeled,
					},
				},
				validate: `
					_:_auto :self _:_auto ;
						:labeled _:label ;
						:ephemeral [] .

					_:label :self _:label ;
						:auto _:_auto ;
						:ephemeral [] .

					[] :ephemeral [] ;
						:auto _:_auto ;
						:labeled _:label .
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
						'>b': [a_items.map(s => `"${s}`)],
					},
				},
				validate: `
					<a> <b> (${a_items.map(s => `"${s}" `).join(' ')}) .
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
						'>b': [a_items.map(s => '"'+s)],
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
					<a> <b> ${util.serialize_collection_turtle(a_items.slice(0).map(s => `"${s}"`), '<first>', '<rest>', '<nil>')} .
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
	},
};
