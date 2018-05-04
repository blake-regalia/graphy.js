/* eslint-env mocha */
/* eslint indent: 0 */
const assert = require('assert');
const eq = assert.strictEqual;
const deq = assert.deepEqual;

const graphy = require('graphy');

const write = (h_triples, snt_verify) => new Promise((fk_test) => {
	let k_set_expected = graphy.set();

	graphy.nt.parser({input:snt_verify})
		.pipe(k_set_expected)
		.on('finish', () => {
			let k_set_actual = graphy.set(null, {debug:true});

			let k_writer = graphy.ttl.writer({
				prefixes: {
					'': '',
				},
			});

			k_writer
				.pipe(graphy.ttl.parser())
				.pipe(k_set_actual)
				.on('finish', () => {
					eq(k_set_actual.canonicalize(), k_set_expected.canonicalize());
					fk_test();
				});

			k_writer.add(h_triples);
			k_writer.end();
		});
});

let h_tests = {
	basic: {
		'absolute IRIs': {
			write: {
				'>a': {
					'>b': '>c',
				},
			},
			expect: `
				<a> <b> <c> .
			`,
		},

		'prefixed names': {
			write: {
				':a': {
					':b': ':c',
				},
			},
			expect: `
				<a> <b> <c> .
			`,
		},
	},
};

for(let s_describe in h_tests) {
	let h_cases = h_tests[s_describe];
	describe(s_describe, () => {
		for(let s_it in h_cases) {
			let g_test = h_cases[s_it];
			it(s_it, async() => await write(g_test.write, g_test.expect));
		}
	});
}
