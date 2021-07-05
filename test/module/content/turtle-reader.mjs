/* eslint indent: 0, padded-blocks: 0, quote-props: 0 */
import chai from 'chai';
const expect = chai.expect;

import {
	namedNode,
	quad,
	integerLiteral,
	doubleLiteral,
	decimalLiteral,
} from '@graphy/core';

import { QuadTree } from '@graphy/memory';
// import QuadTree from '@graphy/memory/quad-tree';

import { TurtleReader } from '@graphy/content';

import ReaderSuite from '../../helper/reader-suite.mjs';

const f_string_literals = s => ['#a', '#b', '"'+s];

(new ReaderSuite({
	alias: 'ttl',
	syntax: 'Turtle',
	reader: TurtleReader,
	manifest: 'http://w3c.github.io/rdf-tests/turtle/manifest.ttl',
	prefixes: {
		'': '#',
	},
}, (reader) => {
	const a_abc = [['z://y/a', 'z://y/b', 'z://y/c']];

	reader.allows({
		'empty': {
			'blank': () => ['', []],
			'whitespace': () => [' \t \n', []],
		},

		'irirs & prefixed names': {
			'iris': () => ['<z://y/a> <z://y/b> <z://y/c> .', a_abc],

			'iris w/ base': () => ['@base <z://y>. <a> <b> <c> .', a_abc],

			'iris w/ unicode escapes': () => ['<\\u2713> <like> <\\U0001F5F8> .', [
				['\u2713', 'like', '\ud83d\uddf8'],
			]],

			'crammed spaces': () => [`
				<z://y/a><z://y/b>"f"^^<z://y/g>.
			`, [
				['z://y/a', 'z://y/b', '^z://y/g"f'],
			]],

			'short pnames': () => [`
				@prefix : <z://y/> .
				:a :b :c .
			`, [
				['z://y/a', 'z://y/b', 'z://y/c'],
			]],

			'short pnames w/ literal': () => [`
				@prefix : <z://y/> .
				:a :b "f"^^:g .
			`, [
				['z://y/a', 'z://y/b', '^z://y/g"f'],
			]],

			'prefixed names w/ empty prefix id': () => ['@prefix : <z://y/>. :a :b :c .', a_abc],

			'prefixed names w/ trailing colon & mid-stops': () => [`
				@prefix : <z://y/>. :a: :b.b :c:c.c: .
			`, [
				['z://y/a:', 'z://y/b.b', 'z://y/c:c.c:'],
			]],

			'prefixed names w/ non-empty prefix id': () => ['@prefix p: <z://y/>. p:a p:b p:c .', a_abc],

			'prefixed names w/ empty suffix': () => [`
				@prefix pa: <z://y/a>.
				@prefix pb: <z://y/b>.
				@prefix pc: <z://y/c>.
				pa: pb: pc: .
			`, a_abc],
		},

		'base & relative iris': {
			'change scheme': () => [`
				@base <scheme://auth/path/end> .
				<//a> <//a/b> <//a/b/d/../c> .
			`, [
				['scheme://a', 'scheme://a/b', 'scheme://a/b/c'],
			]],

			'change root': () => [`
				@base <scheme://auth/path/end> .
				</a> </d/../a/b> </../e/../a/b/d/../c> .
			`, [
				['scheme://auth/a', 'scheme://auth/a/b', 'scheme://auth/a/b/c'],
			]],

			'change path up': () => [`
				@base <scheme://auth/path/end> .
				<../a> <../../a/./b> <../d/../../../a/b/c> .

				@base <scheme://auth/path/end/> .
				<../a> <../../a/./b> <../d/../../../a/b/c> .
			`, [
				['scheme://auth/a', 'scheme://auth/a/b', 'scheme://auth/a/b/c'],
				['scheme://auth/path/a', 'scheme://auth/a/b', 'scheme://auth/a/b/c'],
			]],

			'change path same': () => [`
				@base <scheme://auth/path/end> .
				<./a> <./../a/./b> <./d/../../../a/b/c> .

				@base <scheme://auth/path/end/> .
				<./a> <./../a/./b> <./d/../../../a/b/c> .
			`, [
				['scheme://auth/path/a', 'scheme://auth/a/b', 'scheme://auth/a/b/c'],
				['scheme://auth/path/end/a', 'scheme://auth/path/a/b', 'scheme://auth/a/b/c'],
			]],

			'change path down': () => [`
				@base <scheme://auth/path/end> .
				<a> <a/./b> <d/../../../a/b/c> .

				@base <scheme://auth/path/end/> .
				<a> <a/./b> <d/../../../a/b/c> .
			`, [
				['scheme://auth/path/a', 'scheme://auth/path/a/b', 'scheme://auth/a/b/c'],
				['scheme://auth/path/end/a', 'scheme://auth/path/end/a/b', 'scheme://auth/a/b/c'],
			]],

			'add hash': () => [`
				@base <scheme://auth/path/end> .
				<#a> <#b> <#c> .

				@base <scheme://auth/path/end/> .
				<#a> <#b> <#c> .
			`, [
				['scheme://auth/path/end#a', 'scheme://auth/path/end#b', 'scheme://auth/path/end#c'],
				['scheme://auth/path/end/#a', 'scheme://auth/path/end/#b', 'scheme://auth/path/end/#c'],
			]],

			'add querystring': () => [`
				@base <scheme://auth/path/end> .
				<?a> <?b=/../dots/../> <?c=../dots/..> .

				@base <scheme://auth/path/end/> .
				<?a> <?b=/../dots/../> <?c=../dots/..> .
			`, [
				['scheme://auth/path/end?a', 'scheme://auth/path/end?b=/../dots/../', 'scheme://auth/path/end?c=../dots/..'],
				['scheme://auth/path/end/?a', 'scheme://auth/path/end/?b=/../dots/../', 'scheme://auth/path/end/?c=../dots/..'],
			]],

			'chaining': () => [`
				@base <scheme://auth/path/> .
				<a> <./b/../a/b> </a/b/c> .

				@base </a/a> .
				<> <./b> </a/b/c> .

				@prefix : </test/> .
				:a :b :c .
			`, [
				['scheme://auth/path/a', 'scheme://auth/path/a/b', 'scheme://auth/a/b/c'],
				['scheme://auth/a/a', 'scheme://auth/a/b', 'scheme://auth/a/b/c'],
				['scheme://auth/test/a', 'scheme://auth/test/b', 'scheme://auth/test/c'],
			]],
		},

		'comments': {
			'breaking triple': () => [`
				@prefix p: <z://y/>.
					p:a#comment
						p:b#
						p:c#comment
					.
			`, a_abc],

			'breaking base sequence': () => [`
				@base#
				<z://y/>#
				#c
				.<a><b><c>#comment
				.
			`, a_abc],

			'breaking prefix sequence': () => [`
				@prefix#
				p:#
				<z://y/>#
				. p:a p:b p:c#comment
				.
			`, a_abc],

			'crammed spaces': () => [`
				@prefix p:<z://y/>.p:a<z://y/b>p:c,p:d;p:e"f"^^p:g.
			`, [
				['z://y/a', 'z://y/b', 'z://y/c'],
				['z://y/a', 'z://y/b', 'z://y/d'],
				['z://y/a', 'z://y/e', '^z://y/g"f'],
			]],

			'before predicate-object pair separator': () => [`
				@prefix p: <z://y/> .
				p:a p:b p:c
					#comment
					;
					.
			`, [
				['z://y/a', 'z://y/b', 'z://y/c'],
			]],

			'at end of predicate-object pairs': () => [`
				@prefix p: <z://y/> .
				p:a p:b p:c ;
					#comment
					.
			`, [
				['z://y/a', 'z://y/b', 'z://y/c'],
			]],

			'within predicate-object pairs': () => [`
				@prefix p: <z://y/> .
				p:a p:b p:c ;
					#comment
					p:b p:d ;
					.
			`, [
				['z://y/a', 'z://y/b', 'z://y/c'],
				['z://y/a', 'z://y/b', 'z://y/d'],
			]],
		},

		'blank nodes': {
			'labeled': () => [`
				_:a :b _:c .
				_:c :d _:e .
			`, [
				['_a', '#b', '_c'],
				['_c', '#d', '_e'],
			]],

			'labeled spacing': () => [`
				_:a :b _:c.
				<z://y/c> :d _:e.<z://y/c> :d _:f.
			`, [
				['_a', '#b', '_c'],
				['z://y/c', '#d', '_e'],
				['z://y/c', '#d', '_f'],
			]],

			'anonymous': () => [`
				[] :b _:c .
				_:c :d [] .
				[] :e [] .
			`, [
				[' g0', '#b', '_c'],
				['_c', '#d', ' g1'],
				[' g2', '#e', ' g3'],
			]],

			'property list nesting': () => [`
				:a0a :b0a [
					:b1a :c1a, :c1b;
					:b1b
						[:b2a :c2a;],
						:c1c,
						[:b2b :c2b],
						:c2d ;
					:b1c :c1c ;
					:b1d []
				].
			`, [
				['#a0a', '#b0a', ' g0'],
					[' g0', '#b1a', '#c1a'],
					[' g0', '#b1a', '#c1b'],
					[' g0', '#b1b', ' g1'],
						[' g1', '#b2a', '#c2a'],
					[' g0', '#b1b', '#c1c'],
					[' g0', '#b1b', ' g2'],
						[' g2', '#b2b', '#c2b'],
					[' g0', '#b1b', '#c2d'],
					[' g0', '#b1c', '#c1c'],
					[' g0', '#b1d', ' g3'],
			]],
		},

		'collections': {
			'empty': () => [':a :b ().', [
				['#a', '#b', '.'],
			]],

			'empty nester (lol)': () => [':a :b (()).', [
				['#a', '#b', ' g0'],
					[' g0', '->', '.'],
					[' g0', '>>', '.'],
			]],

			'single iri item': () => [':a :b (:c).', [
				['#a', '#b', ' g0'],
					[' g0', '->', '#c'],
					[' g0', '>>', '.'],
			]],

			'multiple iri items': () => [':a :b (:c :d).', [
				['#a', '#b', ' g0'],
					[' g0', '->', '#c'],
					[' g0', '>>', ' g1'],
					[' g1', '->', '#d'],
					[' g1', '>>', '.'],
			]],

			'single literal item': () => [':a :b (1).', [
				['#a', '#b', ' g0'],
					[' g0', '->', 1],
					[' g0', '>>', '.'],
			]],

			'multiple literal items': () => [':a :b (1 2.1 "3").', [
				['#a', '#b', ' g0'],
					[' g0', '->', 1],
					[' g0', '>>', ' g1'],
					[' g1', '->', 2.1],
					[' g1', '>>', ' g2'],
					[' g2', '->', '"3'],
					[' g2', '>>', '.'],
			]],

			'mixed iri and literal items': () => [':a :b (1 :c 2.1 :d), (:e "3").', [
				['#a', '#b', ' g0'],
					[' g0', '->', 1],
					[' g0', '>>', ' g1'],
					[' g1', '->', '#c'],
					[' g1', '>>', ' g2'],
					[' g2', '->', 2.1],
					[' g2', '>>', ' g3'],
					[' g3', '->', '#d'],
					[' g3', '>>', '.'],
				['#a', '#b', ' g4'],
					[' g4', '->', '#e'],
					[' g4', '>>', ' g5'],
					[' g5', '->', '"3'],
					[' g5', '>>', '.'],
			]],

			'labeled blank node items (and with label conflicts)': () => [`
				:a :b (_:g0 _:b0 _:g1).
			`, [
				['#a', '#b', ' g0'],
					[' g0', '->', '_g1'],
					[' g0', '>>', ' g2'],
					[' g2', '->', '_b0'],
					[' g2', '>>', ' g3'],
					[' g3', '->', '_g4'],
					[' g3', '>>', '.'],
			]],

			'as part of an object list': () => [`
				:a :b (:c :d), :e.
			`, [
				['#a', '#b', ' g0'],
					[' g0', '->', '#c'],
					[' g0', '>>', ' g1'],
					[' g1', '->', '#d'],
					[' g1', '>>', '.'],
				['#a', '#b', '#e'],
			]],

			'nesting 2 levels deep': () => [`
				:a :b ((:c :d) (:e) :f).
			`, [
				['#a', '#b', ' g0'],
				[' g0', '->', ' g1'],
					[' g1', '->', '#c'],
					[' g1', '>>', ' g2'],
					[' g2', '->', '#d'],
					[' g2', '>>', '.'],
				[' g0', '>>', ' g3'],
				[' g3', '->', ' g4'],
					[' g4', '->', '#e'],
					[' g4', '>>', '.'],
				[' g3', '>>', ' g5'],
				[' g5', '->', '#f'],
				[' g5', '>>', '.'],
			]],

			'nesting 3 levels deep in the opposite direction': () => [`
				:t :u (:v (:w) (:x :y :z)).
			`, [
				['#t', '#u', ' g0'],
					[' g0', '->', '#v'],
					[' g0', '>>', ' g1'],
					[' g1', '->', ' g2'],
						[' g2', '->', '#w'],
						[' g2', '>>', '.'],
					[' g1', '>>', ' g3'],
					[' g3', '->', ' g4'],
						[' g4', '->', '#x'],
						[' g4', '>>', ' g5'],
						[' g5', '->', '#y'],
						[' g5', '>>', ' g6'],
						[' g6', '->', '#z'],
						[' g6', '>>', '.'],
					[' g3', '>>', '.'],
			]],

			'nesting 4 levels deep in the middle': () => [`
				:a :b (:c (:d (:e (:f) :g) :h) :i).
			`, [
				['#a', '#b', ' g0'],
					[' g0', '->', '#c'],
					[' g0', '>>', ' g1'],
					[' g1', '->', ' g2'],
						[' g2', '->', '#d'],
						[' g2', '>>', ' g3'],
						[' g3', '->', ' g4'],
							[' g4', '->', '#e'],
							[' g4', '>>', ' g5'],
							[' g5', '->', ' g6'],
								[' g6', '->', '#f'],
								[' g6', '>>', '.'],
							[' g5', '>>', ' g7'],
							[' g7', '->', '#g'],
							[' g7', '>>', '.'],
						[' g3', '>>', ' g8'],
						[' g8', '->', '#h'],
						[' g8', '>>', '.'],
					[' g1', '>>', ' g9'],
					[' g9', '->', '#i'],
					[' g9', '>>', '.'],
			]],

			'blank node property list items': () => [`
				:a :b ([] ([:c :d])).
			`, [
				['#a', '#b', ' g0'],
					[' g0', '->', ' g1'],
					[' g0', '>>', ' g2'],
					[' g2', '->', ' g3'],
						[' g3', '->', ' g4'],
							[' g4', '#c', '#d'],
						[' g3', '>>', '.'],
					[' g2', '>>', '.'],
			]],

			'string literals and nested blank node property lists in collection subject': () => [`
				("1" [:a ("2" [:b "3"] "4")] "5") :c :d .
			`, [
				[' g0', '->', '"1'],
				[' g0', '>>', ' g1'],
				[' g1', '->', ' g2'],
					[' g2', '#a', ' g3'],
						[' g3', '->', '"2'],
						[' g3', '>>', ' g4'],
						[' g4', '->', ' g5'],
							[' g5', '#b', '"3'],
						[' g4', '>>', ' g6'],
						[' g6', '->', '"4'],
						[' g6', '>>', '.'],
				[' g1', '>>', ' g7'],
				[' g7', '->', '"5'],
				[' g7', '>>', '.'],
				[' g0', '#c', '#d'],
			]],

			'string literals and iris nested in blank node property lists and collections in collection subject': () => [`
				(
					"1"
					[
						:a "2";
						:b (
							"3"
							[
								:c (
									"3"
									[:d "4"]
									"5"
								)
							]
							"6"
						)
					]
					"7"
				) :e :f .
			`, [
				[' g0', '->', '"1'],
				[' g0', '>>', ' g1'],
				[' g1', '->', ' g2'],
					[' g2', '#a', '"2'],
					[' g2', '#b', ' g3'],
						[' g3', '->', '"3'],
						[' g3', '>>', ' g4'],
						[' g4', '->', ' g5'],
							[' g5', '#c', ' g6'],
							[' g6', '->', '"3'],
							[' g6', '>>', ' g7'],
							[' g7', '->', ' g8'],
								[' g8', '#d', '"4'],
							[' g7', '>>', ' g9'],
							[' g9', '->', '"5'],
							[' g9', '>>', '.'],
						[' g4', '>>', ' g10'],
						[' g10', '->', '"6'],
						[' g10', '>>', '.'],
				[' g1', '>>', ' g11'],
				[' g11', '->', '"7'],
				[' g11', '>>', '.'],
				[' g0', '#e', '#f'],
			]],
		},

		'string literals': {
			'single quotes': () => [`
				:a :b '' .
				:a :b 'c' .
				:a :b '"c\\u002C\\n\\'' .
			`, [
				'',
				'c',
				`"c,\n'`,
			].map(f_string_literals)],

			'double quotes': () => [`
				:a :b "" .
				:a :b "c" .
				:a :b "'c\\u002C\\n\\"" .
			`, [
				'',
				'c',
				`'c,\n"`,
			].map(f_string_literals)],

			'long single quotes': () => [`
				:a :b '''''' .
				:a :b '''\r''' .
				:a :b '''\\r''' .
				:a :b '''c''' .
				:a :b '''"c\\u002C''\\n'\n''' .
			`, [
				'',
				'\r',
				'\r',
				'c',
				`"c,''\n'\n`,
			].map(f_string_literals)],

			'long double quotes': () => [`
				:a :b """""" .
				:a :b """c""" .
				:a :b """'c\\u002C""\\n"\n""" .
			`, [
				'',
				'c',
				`'c,""\n"\n`,
			].map(f_string_literals)],

			'escapes & unicode': () => [`
				:a :b "\\"\\\\t = '\\t'\\"",
					"\\"\\"\\"\\"\\"\\"",
					"\\"\\u00C5\\"", "\\"\\U0001D11E\\"\\\\test\\"" .
			`, [
				`"\\t = '\t'"`,
				'""""""',
				'"\u00c5"',
				'"\u{0001d11e}"\\test"',
			].map(f_string_literals)],

			'valid sequential escapes': () => [`
				:a :b
					"\\"",
					"  \\"",
					"\\"  ",
					"  \\"  ",
					"${'\\'.repeat(2)}",
					"${'\\'.repeat(4)}",
					"${'\\'.repeat(6)}",
					"  ${'\\'.repeat(2)}",
					"  ${'\\'.repeat(4)}",
					"  ${'\\'.repeat(6)}",
					"${'\\'.repeat(2)}  ",
					"${'\\'.repeat(4)}  ",
					"${'\\'.repeat(6)}  ",
					"  ${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(4)}  ",
					"  ${'\\'.repeat(6)}  " .
			`, [
				'"',
				'  "',
				'"  ',
				'  "  ',
				`${'\\'.repeat(1)}`,
				`${'\\'.repeat(2)}`,
				`${'\\'.repeat(3)}`,
				`  ${'\\'.repeat(1)}`,
				`  ${'\\'.repeat(2)}`,
				`  ${'\\'.repeat(3)}`,
				`${'\\'.repeat(1)}  `,
				`${'\\'.repeat(2)}  `,
				`${'\\'.repeat(3)}  `,
				`  ${'\\'.repeat(1)}  `,
				`  ${'\\'.repeat(2)}  `,
				`  ${'\\'.repeat(3)}  `,
			].map(f_string_literals)],

			'valid escapes next to `t`': () => [`
				:a :b
					"${'\\'.repeat(2)}t",
					"${'\\'.repeat(4)}t",
					"${'\\'.repeat(6)}t",
					"  ${'\\'.repeat(2)}t",
					"  ${'\\'.repeat(4)}t",
					"  ${'\\'.repeat(6)}t",
					"${'\\'.repeat(2)}t  ",
					"${'\\'.repeat(4)}t  ",
					"${'\\'.repeat(6)}t  ",
					"  ${'\\'.repeat(2)}t  ",
					"  ${'\\'.repeat(4)}t  ",
					"  ${'\\'.repeat(6)}t  ",
					"${'\\'.repeat(2)}t${'\\'.repeat(2)}",
					"${'\\'.repeat(4)}t${'\\'.repeat(2)}",
					"${'\\'.repeat(6)}t${'\\'.repeat(2)}",
					"  ${'\\'.repeat(2)}t${'\\'.repeat(2)}",
					"  ${'\\'.repeat(4)}t${'\\'.repeat(2)}",
					"  ${'\\'.repeat(6)}t${'\\'.repeat(2)}",
					"${'\\'.repeat(2)}t${'\\'.repeat(2)}  ",
					"${'\\'.repeat(4)}t${'\\'.repeat(2)}  ",
					"${'\\'.repeat(6)}t${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(2)}t${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(4)}t${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(6)}t${'\\'.repeat(2)}  " .
				`, [
					`${'\\'.repeat(1)}t`,
					`${'\\'.repeat(2)}t`,
					`${'\\'.repeat(3)}t`,
					`  ${'\\'.repeat(1)}t`,
					`  ${'\\'.repeat(2)}t`,
					`  ${'\\'.repeat(3)}t`,
					`${'\\'.repeat(1)}t  `,
					`${'\\'.repeat(2)}t  `,
					`${'\\'.repeat(3)}t  `,
					`  ${'\\'.repeat(1)}t  `,
					`  ${'\\'.repeat(2)}t  `,
					`  ${'\\'.repeat(3)}t  `,
					`${'\\'.repeat(1)}t\\`,
					`${'\\'.repeat(2)}t\\`,
					`${'\\'.repeat(3)}t\\`,
					`  ${'\\'.repeat(1)}t\\`,
					`  ${'\\'.repeat(2)}t\\`,
					`  ${'\\'.repeat(3)}t\\`,
					`${'\\'.repeat(1)}t\\  `,
					`${'\\'.repeat(2)}t\\  `,
					`${'\\'.repeat(3)}t\\  `,
					`  ${'\\'.repeat(1)}t\\  `,
					`  ${'\\'.repeat(2)}t\\  `,
					`  ${'\\'.repeat(3)}t\\  `,
				].map(f_string_literals)],

			'valid escapes w/ escaped literal (\\t)': () => [`
				:a :b
					"${'\\'.repeat(1)}t",
					"${'\\'.repeat(3)}t",
					"${'\\'.repeat(5)}t",
					"  ${'\\'.repeat(1)}t",
					"  ${'\\'.repeat(3)}t",
					"  ${'\\'.repeat(5)}t",
					"${'\\'.repeat(1)}t  ",
					"${'\\'.repeat(3)}t  ",
					"${'\\'.repeat(5)}t  ",
					"  ${'\\'.repeat(1)}t  ",
					"  ${'\\'.repeat(3)}t  ",
					"  ${'\\'.repeat(5)}t  ",
					"${'\\'.repeat(1)}t${'\\'.repeat(2)}",
					"${'\\'.repeat(3)}t${'\\'.repeat(2)}",
					"${'\\'.repeat(5)}t${'\\'.repeat(2)}",
					"  ${'\\'.repeat(1)}t${'\\'.repeat(2)}",
					"  ${'\\'.repeat(3)}t${'\\'.repeat(2)}",
					"  ${'\\'.repeat(5)}t${'\\'.repeat(2)}",
					"${'\\'.repeat(1)}t${'\\'.repeat(2)}  ",
					"${'\\'.repeat(3)}t${'\\'.repeat(2)}  ",
					"${'\\'.repeat(5)}t${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(1)}t${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(3)}t${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(5)}t${'\\'.repeat(2)}  " .
				`, [
					`${'\\'.repeat(0)}\t`,
					`${'\\'.repeat(1)}\t`,
					`${'\\'.repeat(2)}\t`,
					`  ${'\\'.repeat(0)}\t`,
					`  ${'\\'.repeat(1)}\t`,
					`  ${'\\'.repeat(2)}\t`,
					`${'\\'.repeat(0)}\t  `,
					`${'\\'.repeat(1)}\t  `,
					`${'\\'.repeat(2)}\t  `,
					`  ${'\\'.repeat(0)}\t  `,
					`  ${'\\'.repeat(1)}\t  `,
					`  ${'\\'.repeat(2)}\t  `,
					`${'\\'.repeat(0)}\t\\`,
					`${'\\'.repeat(1)}\t\\`,
					`${'\\'.repeat(2)}\t\\`,
					`  ${'\\'.repeat(0)}\t\\`,
					`  ${'\\'.repeat(1)}\t\\`,
					`  ${'\\'.repeat(2)}\t\\`,
					`${'\\'.repeat(0)}\t\\  `,
					`${'\\'.repeat(1)}\t\\  `,
					`${'\\'.repeat(2)}\t\\  `,
					`  ${'\\'.repeat(0)}\t\\  `,
					`  ${'\\'.repeat(1)}\t\\  `,
					`  ${'\\'.repeat(2)}\t\\  `,
				].map(f_string_literals)],

			'valid escapes w/ actual tab character': () => [`
				:a :b
					"${'\\'.repeat(2)}\t",
					"${'\\'.repeat(4)}\t",
					"${'\\'.repeat(6)}\t",
					"  ${'\\'.repeat(2)}\t",
					"  ${'\\'.repeat(4)}\t",
					"  ${'\\'.repeat(6)}\t",
					"${'\\'.repeat(2)}\t  ",
					"${'\\'.repeat(4)}\t  ",
					"${'\\'.repeat(6)}\t  ",
					"  ${'\\'.repeat(2)}\t  ",
					"  ${'\\'.repeat(4)}\t  ",
					"  ${'\\'.repeat(6)}\t  ",
					"${'\\'.repeat(2)}\t${'\\'.repeat(2)}",
					"${'\\'.repeat(4)}\t${'\\'.repeat(2)}",
					"${'\\'.repeat(6)}\t${'\\'.repeat(2)}",
					"  ${'\\'.repeat(2)}\t${'\\'.repeat(2)}",
					"  ${'\\'.repeat(4)}\t${'\\'.repeat(2)}",
					"  ${'\\'.repeat(6)}\t${'\\'.repeat(2)}",
					"${'\\'.repeat(2)}\t${'\\'.repeat(2)}  ",
					"${'\\'.repeat(4)}\t${'\\'.repeat(2)}  ",
					"${'\\'.repeat(6)}\t${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(2)}\t${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(4)}\t${'\\'.repeat(2)}  ",
					"  ${'\\'.repeat(6)}\t${'\\'.repeat(2)}  " .
				`, [
					`${'\\'.repeat(1)}\t`,
					`${'\\'.repeat(2)}\t`,
					`${'\\'.repeat(3)}\t`,
					`  ${'\\'.repeat(1)}\t`,
					`  ${'\\'.repeat(2)}\t`,
					`  ${'\\'.repeat(3)}\t`,
					`${'\\'.repeat(1)}\t  `,
					`${'\\'.repeat(2)}\t  `,
					`${'\\'.repeat(3)}\t  `,
					`  ${'\\'.repeat(1)}\t  `,
					`  ${'\\'.repeat(2)}\t  `,
					`  ${'\\'.repeat(3)}\t  `,
					`${'\\'.repeat(1)}\t\\`,
					`${'\\'.repeat(2)}\t\\`,
					`${'\\'.repeat(3)}\t\\`,
					`  ${'\\'.repeat(1)}\t\\`,
					`  ${'\\'.repeat(2)}\t\\`,
					`  ${'\\'.repeat(3)}\t\\`,
					`${'\\'.repeat(1)}\t\\  `,
					`${'\\'.repeat(2)}\t\\  `,
					`${'\\'.repeat(3)}\t\\  `,
					`  ${'\\'.repeat(1)}\t\\  `,
					`  ${'\\'.repeat(2)}\t\\  `,
					`  ${'\\'.repeat(3)}\t\\  `,
				].map(f_string_literals)],

			'langtag': () => [`
				:a :b "c"@en .
				:d :e "f"@EN .
			`, [
				['#a', '#b', '@en"c'],
				['#d', '#e', '@en"f'],
			]],

			'datatype': () => [`
				:a :b "c"^^:x .
				@base <z://_/> .
				:d :e "f"^^<y> .
				:g :h "i"^^<z://_/z> .
			`, [
				['#a', '#b', '^#x"c'],
				['#d', '#e', '^z://_/y"f'],
				['#g', '#h', '^z://_/z"i'],
			]],
		},

		'numeric literals': {
			'integers': () => [`
				:a :b 0, -2, +20 .
			`, [
				['#a', '#b', 0],
				['#a', '#b', -2],
				['#a', '#b', integerLiteral('+20')],
			]],

			'decimals': () => [`
				:a :b .0, 0.0, -0.2, +20.0 .
			`, [
				['#a', '#b', decimalLiteral('.0')],
				['#a', '#b', decimalLiteral('0.0')],
				['#a', '#b', decimalLiteral('-0.2')],
				['#a', '#b', decimalLiteral('+20.0')],
			]],

			'doubles': () => [`
				:a :b 0.e1, -2.0e-1, +0.02e+3 .
			`, [
				['#a', '#b', doubleLiteral('0.e1')],
				['#a', '#b', doubleLiteral('-2.0e-1')],
				['#a', '#b', doubleLiteral('+0.02e+3')],
			]],
		},

		'boolean literals': {
			'true': () => [`
				:a :b true, TRUE .
			`, [
				['#a', '#b', true],
				['#a', '#b', true],
			]],

			'false': () => [`
				:a :b false, FALSE .
			`, [
				['#a', '#b', false],
				['#a', '#b', false],
			]],
		},

		'states interrupted by end-of-stream': {
			'prefix': () => ['@prefix test: <z://> .', []],

			'base': () => ['@base <z://> .', []],

			'prefixed names': () => [':alpha :bravo :charlie .', [
				['#alpha', '#bravo', '#charlie'],
			]],

			'iris': () => ['<alpha> <bravo> <charlie> .', [
				['alpha', 'bravo', 'charlie'],
			]],

			'string literals': () => [':a :b "charlie"^^<z://delta> .', [
				['#a', '#b', '^z://delta"charlie'],
			]],

			'numeric literals': () => [':a :b 25.12e-1 .', [
				['#a', '#b', doubleLiteral('25.12e-1')],
			]],

			'prefixed names with dots': () => [':a :b :c.d. :a :b "c"^^:d.e.', [
				['#a', '#b', '#c.d'],
				['#a', '#b', '^#d.e"c'],
			]],

			'property list nesting': () => [`
				:a0a :b0a[:b1a :c1a,:c1b;:b1b[:b2a :c2a;],:c1c,[:b2b :c2b],:c2d;:b1c :c1c;:b1d[]].
			`, [
				['#a0a', '#b0a', ' g0'],
					[' g0', '#b1a', '#c1a'],
					[' g0', '#b1a', '#c1b'],
					[' g0', '#b1b', ' g1'],
						[' g1', '#b2a', '#c2a'],
					[' g0', '#b1b', '#c1c'],
					[' g0', '#b1b', ' g2'],
						[' g2', '#b2b', '#c2b'],
					[' g0', '#b1b', '#c2d'],
					[' g0', '#b1c', '#c1c'],
					[' g0', '#b1d', ' g3'],
			]],

			'comments': () => [`
				# comment
				<a> <b> <c> .
			`, [
				['a', 'b', 'c'],
			]],
		},

		// Special thanks to Ruben Verborgh for the following test cases:
		'N3.js test cases': {
			'should parse statements with an empty list in the subject': () => [
				'() <a> <b>.', [
					['.', 'a', 'b'],
			]],

			'should parse statements with an empty list in the object': () => [
				'<a> <b> ().', [
					['a', 'b', '.'],
			]],

			'should parse statements with a single-element list in the subject': () => [
				'(<x>) <a> <b>.', [
					[' g0', '->', 'x'],
					[' g0', '>>', '.'],
					[' g0', 'a', 'b'],
			]],

			'should parse statements with a single-element list in the object': () => [
				'<a> <b> (<x>).', [
					['a', 'b', ' g0'],
					[' g0', '->', 'x'],
					[' g0', '>>', '.'],
			]],

			'should parse statements with a multi-element list in the subject': () => [
				'(<x> <y>) <a> <b>.', [
					[' g0', '->', 'x'],
					[' g0', '>>', ' g1'],
					[' g1', '->', 'y'],
					[' g1', '>>', '.'],
					[' g0', 'a', 'b'],
			]],

			'should parse statements with a multi-element list in the object': () => [
				'<a> <b> (<x> <y>).', [
					['a', 'b', ' g0'],
					[' g0', '->', 'x'],
					[' g0', '>>', ' g1'],
					[' g1', '->', 'y'],
					[' g1', '>>', '.'],
			]],

			'should parse statements with prefixed names in lists': () => [
				'@prefix a: <a#>. <a> <b> (a:x a:y).', [
					['a', 'b', ' g0'],
					[' g0', '->', 'a#x'],
					[' g0', '>>', ' g1'],
					[' g1', '->', 'a#y'],
					[' g1', '>>', '.'],
			]],

			'should parse statements with blank nodes in lists': () => [
				'<a> <b> (_:x _:y).', [
					['a', 'b', ' g0'],
					[' g0', '->', '_x'],
					[' g0', '>>', ' g1'],
					[' g1', '->', '_y'],
					[' g1', '>>', '.'],
			]],

			'should parse statements with a list containing strings': () => [
				'("1") <a> <b>.', [
					[' g0', '->', '"1'],
					[' g0', '>>', '.'],
					[' g0', 'a', 'b'],
			]],

			'should parse statements with a nested empty list': () => [
				'<a> <b> (<x> ()).', [
					['a', 'b', ' g0'],
					[' g0', '->', 'x'],
					[' g0', '>>', ' g1'],
					[' g1', '->', '.'],
					[' g1', '>>', '.'],
			]],

			'should parse statements with non-empty nested lists': () => [
				'<a> <b> (<x> (<y>)).', [
					['a', 'b', ' g0'],
					[' g0', '->', 'x'],
					[' g0', '>>', ' g1'],
					[' g1', '->', ' g2'],
					[' g2', '->', 'y'],
					[' g2', '>>', '.'],
					[' g1', '>>', '.'],
			]],

			'should parse statements with a list containing a blank node': () => [
				'([]) <a> <b>.', [
					[' g0', '->', ' g1'],
					[' g0', '>>', '.'],
					[' g0', 'a', 'b'],
			]],

			'should parse statements with a list containing multiple blank nodes': () => [
				'([] [<x> <y>]) <a> <b>.', [
					[' g0', '->', ' g1'],
					[' g0', '>>', ' g2'],
					[' g2', '->', ' g3'],
					[' g3', 'x', 'y'],
					[' g2', '>>', '.'],
					[' g0', 'a', 'b'],
			]],

			'should parse statements with a blank node containing a list': () => [
				'[<a> (<b>)] <c> <d>.', [
					[' g0', 'a', ' g1'],
					[' g1', '->', 'b'],
					[' g1', '>>', '.'],
					[' g0', 'c', 'd'],
			]],
		},
	});

	reader.errors({
		'prefix declaration without prefix': () => ({
			input: '@prefix <a> ',
			char: '<',
			state: 'prefix_id',
		}),

		'prefix declaration without iri': () => ({
			input: '@prefix : .',
			char: '.',
			state: 'prefix_iri',
		}),

		'prefix declaration without a dot': () => ({
			input: '@prefix : <a> ;',
			char: ';',
			state: 'full_stop',
		}),

		'invalid collection syntax': () => ({
			input: '<a> <b> (]).',
			char: ']',
			state: 'collection_object',
		}),

		'blank node predicate': () => ({
			input: '<a> _:b <c>.',
			char: '_',
			state: 'pairs',
		}),

		'blank node with missing subject': () => ({
			input: '<a> <b> [<c>].',
			char: ']',
			state: 'object_list',
		}),

		'blank node with only a semicolon': () => ({
			input: '<a> <b> [;].',
			char: ';',
			state: 'pairs',
		}),

		'invalid blank node full stop': () => ({
			input: '[ <a> <b> .',
			char: '.',
			state: 'end_of_property_list',
		}),

		'invalid collection full stop': () => ({
			input: '<a> <b> (.).',
			char: '.',
			state: 'collection_object',
		}),

		'invalid collection property list': () => ({
			input: '<a> <b> (]).',
			char: ']',
			state: 'collection_object',
		}),

		'no end of triple': () => ({
			input: '@prefix : <#> . :a :b :c ',
			char: '\0',
			state: 'post_object',
		}),

		'missing object': () => ({
			input: '@prefix : <z://y/> .'
				+'\n:a :b .	\n',
			char: '.',
			state: 'object_list',
		}),

		'invalid escapes': () => ({
			input: `
				:a :b
					"${'\\'.repeat(1)}",
					"${'\\'.repeat(3)}",
					"${'\\'.repeat(5)}",
					"  ${'\\'.repeat(1)}",
					"  ${'\\'.repeat(3)}",
					"  ${'\\'.repeat(5)}",
					"${'\\'.repeat(1)}  ",
					"${'\\'.repeat(3)}  ",
					"${'\\'.repeat(5)}  ",
					"  ${'\\'.repeat(1)}  ",
					"  ${'\\'.repeat(3)}  ",
					"  ${'\\'.repeat(5)}  " .
			`,
		}),

		'escape tab': () => ({
			input: `
				:a :b "${'\\'.repeat(1)}\t" .
			`,
		}),

		'challenge eof': () => ({
			input: `
				:a :b "${'\\'.repeat(2)}\t",
			`,
		}),

		...(['\'', '"'].reduce((h_out, s_quote) => ({
			...h_out,

			[`invalid empty string literal (${s_quote}) terminator`]: () => ({
				input: `<a> <b> ${s_quote}${s_quote}y .`,
				char: 'y',
				state: 'post_object',
			}),

			[`invalid non-empty string literal (${s_quote}) terminator`]: () => ({
				input: `<a> <b> ${s_quote}s${s_quote}y .`,
				char: 'y',
				state: 'post_object',
			}),

			[`invalid linebreak at start of string literal (${s_quote}) contents`]: () => ({
				input: `<a> <b> ${s_quote}\nworld${s_quote} .`,
				char: '\n',
				state: 'string_literal_short_'+('"' === s_quote? 'double': 'single'),
			}),

			[`invalid escape sequence at start of string literal (${s_quote}) contents`]: () => ({
				input: `<a> <b> ${s_quote}\\\nworld${s_quote}y .`,
				string: 'escape sequence',
				state: 'string_literal',
			}),

			[`invalid linebreak within string literal (${s_quote}) contents`]: () => ({
				input: `<a> <b> ${s_quote}helo\nworld${s_quote} .`,
				string: 'line feed character',
				state: 'string_literal_short_'+('"' === s_quote? 'double': 'single'),
			}),

			[`invalid escape sequence within string literal (${s_quote}) contents`]: () => ({
				input: `<a> <b> ${s_quote}hello\\\nworld${s_quote}y .`,
				string: 'escape sequence',
				state: 'string_literal',
			}),
		}), {})),
	});

	reader.interfaces((f_interface) => {
		const kd_expect = new QuadTree();

		kd_expect.add(quad(...[
			namedNode('test://a'),
			namedNode('test://b'),
			namedNode('test://c'),
		]));

		f_interface({
			reader: (...a_args) => TurtleReader.run(...a_args),
			reader_class: TurtleReader,
			input: /* syntax: ttl */ `
				@base <base://> .
				@prefix : <test://> .
				@prefix test: <test://test#> .
				# hello world!
				:a :b :c . #
			`,
			events: {
				base(a_bases) {
					expect(a_bases).to.eql([
						['base://'],
					]);
				},

				comment(a_comments) {
					expect(a_comments).to.eql([
						[' hello world!'],
						[''],
					]);
				},

				prefix(a_prefixes) {
					expect(a_prefixes).to.eql([
						['', namedNode('test://')],
						['test', namedNode('test://test#')],
					]);
				},

				data(a_events) {
					const kd_actual = new QuadTree();
					for(const [g_quad] of a_events) {
						kd_actual.add(g_quad);
					}

					expect(kd_actual.equals(kd_expect)).to.be.true;
				},

				eof(a_eofs) {
					expect(a_eofs).to.have.lengthOf(1);
					expect(a_eofs[0][0]).to.eql({
						'': 'test://',
						test: 'test://test#',
					});
				},
			},
		});
	});

	reader.specification();
}));
