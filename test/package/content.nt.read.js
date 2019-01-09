/* eslint indent: 0, padded-blocks: 0, quote-props: 0 */
const expect = require('chai').expect;

const factory = require('@graphy/core.data.factory');
const dataset_tree = require('@graphy/util.dataset.tree');

const nt_read = require('@graphy/content.nt.read');


const reader_suite = require('../helper/reader.js');

reader_suite({
	alias: 'nt',
	reader: nt_read,
	manifest: 'http://w3c.github.io/rdf-tests/ntriples/manifest.ttl',
}, (reader) => {
	const a_abc = [['z://y/a', 'z://y/b', 'z://y/c']];

	reader.allows({
		'empty': {
			'blank': () => ['', []],
			'whitespace': () => [' \t \n', []],
		},

		'irirs': {
			'iris': () => ['<z://y/a> <z://y/b> <z://y/c> .', a_abc],

			'iris w/ unicode escapes': () => ['<z://y/\\u2713> <z://y/like> <z://y/\\U0001F5F8> .', [
				['z://y/\u2713', 'z://y/like', 'z://y/\ud83d\uddf8'],
			]],

			'crammed spaces': () => [`
				<z://y/a><z://y/b>"f"^^<z://y/g>.
			`, [
				['z://y/a', 'z://y/b', '^z://y/g"f'],
			]],
		},

		'basics': {
			'basic triples': () => [`
				<z://y/a> <z://y/b> <z://y/c> . # comments
				<z://y/d> <z://y/e> "f"^^<z://y/g> .
				<z://y/h> <z://y/i> "j"@k .
				<z://y/l> <z://y/m> "n" .
			`, [
				['z://y/a', 'z://y/b', 'z://y/c'],
				['z://y/d', 'z://y/e', '^z://y/g"f'],
				['z://y/h', 'z://y/i', '@k"j'],
				['z://y/l', 'z://y/m', '"n'],
			]],
		},

		'blank nodes': {
			'labeled': () => [`
				_:a <z://y/b> _:c .
				_:c <z://y/d> _:e .
			`, [
				['_a', 'z://y/b', '_c'],
				['_c', 'z://y/d', '_e'],
			]],
		},

		'string literals': {
			'double quotes': () => [`
				<z://y/a> <z://y/b> "" .
				<z://y/a> <z://y/b> "c" .
				<z://y/a> <z://y/b> "'c\\u002C\\n\\"" .
			`, [
				['z://y/a', 'z://y/b', '"'],
				['z://y/a', 'z://y/b', '"c'],
				['z://y/a', 'z://y/b', `"'c,\n"`],
			]],

			'escapes & unicode': () => [`
				<z://y/a> <z://y/b> "\\"\\\\t = '\\t'\\"" .
				<z://y/a> <z://y/b> "\\"\\"\\"\\"\\"\\"" .
				<z://y/a> <z://y/b> "\\"\\u00C5\\"" .
				<z://y/a> <z://y/b>  "\\"\\U0001D11E\\"\\\\test\\"" .
			`, [
				['z://y/a', 'z://y/b', '""\\t = \'\t\'"'],
				['z://y/a', 'z://y/b', '"""""""'],
				['z://y/a', 'z://y/b', '""\u00c5"'],
				['z://y/a', 'z://y/b', '""\u{0001d11e}"\\test"'],
			]],

			'langtag': () => [`
				<z://y/a> <z://y/b> "c"@en .
				<z://y/d> <z://y/e> "f"@EN .
			`, [
				['z://y/a', 'z://y/b', '@en"c'],
				['z://y/d', 'z://y/e', '@en"f'],
			]],

			'datatype': () => [`
				<z://y/a> <z://y/b> "c"^^<z://y/x> .
				<z://y/d> <z://y/e> "f"^^<z://y/y> .
				<z://y/g> <z://y/h> "i"^^<z://y/z> .
			`, [
				['z://y/a', 'z://y/b', '^z://y/x"c'],
				['z://y/d', 'z://y/e', '^z://y/y"f'],
				['z://y/g', 'z://y/h', '^z://y/z"i'],
			]],
		},

		'triples with tokens': {
			'iris': () => ['<z://y/alpha> <z://y/bravo> <z://y/charlie> .', [
				['z://y/alpha', 'z://y/bravo', 'z://y/charlie'],
			]],

			'string literals': () => ['<z://y/a> <z://y/b> "charlie"^^<z://y/delta> .', [
				['z://y/a', 'z://y/b', '^z://y/delta"charlie'],
			]],

			'comments': () => [`
				# comment
				<z://y/a> <z://y/b> <z://y/c> .
			`, [
				['z://y/a', 'z://y/b', 'z://y/c'],
			]],
		},
	});

	reader.errors({
		'turtle data': () => ({
			input: ':a :b (_:g0 _:b0 _:g1).',
		}),

		'blank node predicate': () => ({
			input: '<a> _:b <c>.',
		}),

		'invalid blank node full stop': () => ({
			input: '[ <a> <b> .',
		}),

		'no end of triple': () => ({
			input: '<z://y/a> <z://y/b> <z://y/c> ',
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
			].map(s => `<z://y/a> <z://y/b> "${s}" .\n`).join(''),
		}),
	});

	reader.interfaces((f_interface) => {
		let k_tree_expect = dataset_tree();
		k_tree_expect.add(factory.quad(...[
			factory.namedNode('a'),
			factory.namedNode('b'),
			factory.namedNode('c'),
		]));

		f_interface({
			reader: nt_read,
			input: /* syntax: nt */ `
				# hello world!
				<a> <b> <c> . #
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

