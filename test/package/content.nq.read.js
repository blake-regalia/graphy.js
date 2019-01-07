/* eslint indent: 0, padded-blocks: 0, quote-props: 0 */
const expect = require('chai').expect;

const S_GRAPHY_CHANNEL = process.env.GRAPHY_CHANNEL || 'graphy';

const factory = require(`@${S_GRAPHY_CHANNEL || 'graphy'}/core.data.factory`);
const dataset_tree = require(`@${S_GRAPHY_CHANNEL || 'graphy'}/util.dataset.tree`);

const nq_read = require(`@${S_GRAPHY_CHANNEL || 'graphy'}/content.nq.read`);

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
			'iris w/ unicode escapes': () => ['<\\u2713> <like> <\\U0001F5F8> .', [
				['\u2713', 'like', '\ud83d\uddf8', '*'],
			]],
			'crammed spaces': () => ['<z://a><z://b>"f"^^<z://g>.', [
				['z://a', 'z://b', '^z://g"f', '*'],
			]],
		},

		'iris w/ named graph': {
			'iris': () => ['<z://a> <z://b> <z://c> <z://d> .', a_abcd],
			'iris w/ unicode escapes': () => ['<\\u2713> <like> <\\U0001F5F8> <z://d> .', [
				['\u2713', 'like', '\ud83d\uddf8', 'z://d'],
			]],
		},

		'graphs': {
			'multiple iri named': () => [`
				<#a> <#b> <#c> <#g1> .
				<#d> <#e> <#f> <#g2> .
			`, [
				['#a', '#b', '#c', '#g1'],
				['#d', '#e', '#f', '#g2'],
			]],

			'multiple labeled blank': () => [`
				<#a> <#b> <#c> _:g1 .
				<#d> <#e> <#f> _:g2 .
			`, [
				['#a', '#b', '#c', '_g1'],
				['#d', '#e', '#f', '_g2'],
			]],

			'mixed': () => [`
				<#a> <#b> <#c> _:g0 .
				<#d> <#e> <#f> _:g1 .
				<#g> <#h> <#i> <#g2> .
				<#k> <#l> <#m> <#g3> .
			`, [
				['#a', '#b', '#c', '_g0'],
				['#d', '#e', '#f', '_g1'],
				['#g', '#h', '#i', '#g2'],
				['#k', '#l', '#m', '#g3'],
			]],
		},

		'basics': {
			'basic quads': () => [`
				<#a> <#b> <#c> <#z> . # comments
				<#d> <#e> "f"^^<#g> <#z> .
				<#h> <#i> "j"@k <#z> .
				<#l> <#m> "n" <#z> .
			`, [
				['#a', '#b', '#c', '#z'],
				['#d', '#e', '^#g"f', '#z'],
				['#h', '#i', '@k"j', '#z'],
				['#l', '#m', '"n', '#z'],
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
				_:a <z://b> _:c <#g1> .
				_:c <z://d> _:e _:g2.
			`, [
				['_a', 'z://b', '_c', '#g1'],
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
				['z://a', 'z://b', `""Å"`],
				['z://a', 'z://b', `""𝄞"\\test"`],
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
				'iris': () => ['<alpha> <bravo> <charlie> <delta> .', [
					['alpha', 'bravo', 'charlie', 'delta'],
				]],

				'string literals': () => ['<z://a> <z://b> "charlie"^^<z://delta> <z://epsilon> .', [
					['z://a', 'z://b', '^z://delta"charlie', 'z://epsilon'],
				]],
			},

			'comments': () => [`
				# comment
				<a> <b> <c> <d> .
			`, [
				['a', 'b', 'c', 'd'],
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
			input: '<z://a> <z://b> <z://c> ',
		}),

		'no end of quad': () => ({
			input: '<z://a> <z://b> <z://c> <z://d> ',
		}),
	});

	reader.interfaces((f_setup) => {
		let k_tree_expect = dataset_tree();
		k_tree_expect.add(factory.quad(...[
			factory.namedNode('a'),
			factory.namedNode('b'),
			factory.namedNode('c'),
			factory.namedNode('d'),
		]));

		f_setup({
			reader: nq_read,
			input: /* syntax: nt */ `
				# hello world!
				<a> <b> <c> <d> . #
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

