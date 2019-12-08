/* eslint indent: 0, padded-blocks: 0, quote-props: 0 */
const expect = require('chai').expect;

const factory = require('@graphy/core.data.factory');
const dataset_tree = require('@graphy/memory.dataset.fast');

const nq_read = require('@graphy/content.nq.read');

const reader_suite = require('../helper/reader.js');

reader_suite({
	alias: 'nq',
	reader: nq_read,
	manifest: 'http://w3c.github.io/rdf-tests/nquads/manifest.ttl',
}, (reader) => {
	const a_abc = [['z://a', 'z://b', 'z://c', '*']];
	const a_abcd = [['z://a', 'z://b', 'z://c', 'z://d']];

	reader.allows({
		'empty': {
			'blank': () => ['', []],
			'whitespace': () => [' \t \n', []],
		},

		'iris w/o graph': {
			'iris': () => ['<z://a> <z://b> <z://c> .', a_abc],
			'iris w/ unicode escapes': () => ['<z://y/\\u2713> <z://y/like> <z://y/\\U0001F5F8> .', [
				['z://y/\u2713', 'z://y/like', 'z://y/\ud83d\uddf8', '*'],
			]],
			'crammed spaces': () => ['<z://a><z://b>"f"^^<z://g>.', [
				['z://a', 'z://b', '^z://g"f', '*'],
			]],
		},

		'iris w/ named graph': {
			'iris': () => ['<z://a> <z://b> <z://c> <z://d> .', a_abcd],
			'iris w/ unicode escapes': () => ['<z://y/\\u2713> <z://y/like> <z://y/\\U0001F5F8> <z://d> .', [
				['z://y/\u2713', 'z://y/like', 'z://y/\ud83d\uddf8', 'z://d'],
			]],
		},

		'graphs': {
			'multiple iri named': () => [`
				<z://y/a> <z://y/b> <z://y/c> <z://y/g1> .
				<z://y/d> <z://y/e> <z://y/f> <z://y/g2> .
			`, [
				['z://y/a', 'z://y/b', 'z://y/c', 'z://y/g1'],
				['z://y/d', 'z://y/e', 'z://y/f', 'z://y/g2'],
			]],

			'multiple labeled blank': () => [`
				<z://y/a> <z://y/b> <z://y/c> _:g1 .
				<z://y/d> <z://y/e> <z://y/f> _:g2 .
			`, [
				['z://y/a', 'z://y/b', 'z://y/c', '_g1'],
				['z://y/d', 'z://y/e', 'z://y/f', '_g2'],
			]],

			'mixed': () => [`
				<z://y/a> <z://y/b> <z://y/c> _:g0 .
				<z://y/d> <z://y/e> <z://y/f> _:g1 .
				<z://y/g> <z://y/h> <z://y/i> <z://y/g2> .
				<z://y/k> <z://y/l> <z://y/m> <z://y/g3> .
			`, [
				['z://y/a', 'z://y/b', 'z://y/c', '_g0'],
				['z://y/d', 'z://y/e', 'z://y/f', '_g1'],
				['z://y/g', 'z://y/h', 'z://y/i', 'z://y/g2'],
				['z://y/k', 'z://y/l', 'z://y/m', 'z://y/g3'],
			]],
		},

		'basics': {
			'basic quads': () => [`
				<z://y/a> <z://y/b> <z://y/c> <z://y/z> . # comments
				<z://y/d> <z://y/e> "f"^^<z://y/g> <z://y/z> .
				<z://y/h> <z://y/i> "j"@k <z://y/z> .
				<z://y/l> <z://y/m> "n" <z://y/z> .
			`, [
				['z://y/a', 'z://y/b', 'z://y/c', 'z://y/z'],
				['z://y/d', 'z://y/e', '^z://y/g"f', 'z://y/z'],
				['z://y/h', 'z://y/i', '@k"j', 'z://y/z'],
				['z://y/l', 'z://y/m', '"n', 'z://y/z'],
			]],
		},

		'blank nodes': {
			'labeled triples': () => [`
				_:a <z://b> _:c  .
				_:c <z://d> _:e .
			`, [
				['_a', 'z://b', '_c', '*'],
				['_c', 'z://d', '_e', '*'],
			]],

			'labeled quads': () => [`
				_:a <z://b> _:c <z://y/g1> .
				_:c <z://d> _:e _:g2.
			`, [
				['_a', 'z://b', '_c', 'z://y/g1'],
				['_c', 'z://d', '_e', '_g2'],
			]],
		},

		'string literals': {
			'double quotes': () => [`
				<z://a> <z://b> "" .
				<z://a> <z://b> "c" _:d .
				<z://a> <z://b> "'c\\u002C\\n\\"" <z://d> .
			`, [
				['z://a', 'z://b', '"', '*'],
				['z://a', 'z://b', '"c', '_d'],
				['z://a', 'z://b', `"'c,\n"`, 'z://d'],
			]],

			'escapes & unicode': () => [`
				<z://a> <z://b> "\\"\\\\t = '\\t'\\"" .
				<z://a> <z://b> "\\"\\"\\"\\"\\"\\"" .
				<z://a> <z://b> "\\"\\u00C5\\"" .
				<z://a> <z://b>  "\\"\\U0001D11E\\"\\\\test\\"" .
			`, [
				['z://a', 'z://b', `""\\t = '\t'"`],
				['z://a', 'z://b', '"""""""'],
				['z://a', 'z://b', `""\u00c5"`],
				['z://a', 'z://b', `""\u{0001d11e}"\\test"`],
			]],

			'langtag': () => [`
				<z://a> <z://b> "c"@en .
				<z://d> <z://e> "f"@EN .
				<z://a> <z://b> "c"@fr _:g .
				<z://d> <z://e> "f"@FR <z://g> .
			`, [
				['z://a', 'z://b', '@en"c', '*'],
				['z://d', 'z://e', '@en"f', '*'],
				['z://a', 'z://b', '@fr"c', '_g'],
				['z://d', 'z://e', '@fr"f', 'z://g'],
			]],

			'datatype': () => [`
				<z://a> <z://b> "c"^^<z://x> .
				<z://d> <z://e> "f"^^<z://y> _:d .
				<z://g> <z://h> "i"^^<z://z> <z://d> .
			`, [
				['z://a', 'z://b', '^z://x"c', '*'],
				['z://d', 'z://e', '^z://y"f', '_d'],
				['z://g', 'z://h', '^z://z"i', 'z://d'],
			]],
		},

		'interrupted by end-of-stream': {
			'triples with tokens': {
				'iris': () => ['<z://y/alpha> <z://y/bravo> <z://y/charlie> <z://y/delta> .', [
					['z://y/alpha', 'z://y/bravo', 'z://y/charlie', 'z://y/delta'],
				]],

				'string literals': () => ['<z://a> <z://b> "charlie"^^<z://delta> <z://epsilon> .', [
					['z://a', 'z://b', '^z://delta"charlie', 'z://epsilon'],
				]],
			},

			'comments': () => [`
				# comment
				<z://y/a> <z://y/b> <z://y/c> <z://y/d> .
			`, [
				['z://y/a', 'z://y/b', 'z://y/c', 'z://y/d'],
			]],
		},
	});

	reader.errors({
		'turtle data': () => ({
			input: ':a :b (_:g0 _:b0 _:g1).',
		}),

		'blank node predicate': () => ({
			input: '<z://y/a> _:b <z://y/c>.',
		}),

		'invalid blank node full stop': () => ({
			input: '[ <z://y/a> <z://y/b> .',
		}),

		'no end of triple': () => ({
			input: '<z://a> <z://b> <z://c> ',
		}),

		'no end of quad': () => ({
			input: '<z://a> <z://b> <z://c> <z://d> ',
		}),

		'invalid escapes': () => ({
			input: [
				`${'\\'.repeat(1)}`,
				`${'\\'.repeat(3)}`,
				`${'\\'.repeat(5)}`,
				`  ${'\\'.repeat(1)}`,
				`  ${'\\'.repeat(3)}`,
				`  ${'\\'.repeat(5)}`,
				`${'\\'.repeat(1)}  `,
				`${'\\'.repeat(3)}  `,
				`${'\\'.repeat(5)}  `,
				`  ${'\\'.repeat(1)}  `,
				`  ${'\\'.repeat(3)}  `,
				`  ${'\\'.repeat(5)}  `,
			].map(s => `<z://y/a> <z://y/b> "${s}" <z://y/g> .\n`).join(''),
		}),
	});

	reader.interfaces((f_setup) => {
		let k_tree_expect = dataset_tree();
		k_tree_expect.add(factory.quad(...[
			factory.namedNode('z://y/a'),
			factory.namedNode('z://y/b'),
			factory.namedNode('z://y/c'),
			factory.namedNode('z://y/d'),
		]));

		f_setup({
			reader: nq_read,
			input: /* syntax: nt */ `
				# hello world!
				<z://y/a> <z://y/b> <z://y/c> <z://y/d> . #
			`,
			events: {
				data(a_events) {
					let k_tree_actual = dataset_tree();
					for(let [g_quad] of a_events) {
						k_tree_actual.add(g_quad);
					}

					expect(k_tree_actual.equals(k_tree_expect)).to.be.true;
				},

				comment(a_comments) {
					expect(a_comments).to.eql([
						[' hello world!'],
						[''],
					]);
				},

				eof(a_eofs) {
					expect(a_eofs).to.have.length(1);
				},
			},
		});
	});

	reader.specification();
});

