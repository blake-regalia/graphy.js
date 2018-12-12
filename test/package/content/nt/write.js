/* eslint-env mocha */
const assert = require('assert');

const S_GRAPHY_CHANNEL = `@${process.env.GRAPHY_CHANNEL || 'graphy'}`;
const data_set = require(`${S_GRAPHY_CHANNEL}/util.dataset.tree`);
const ttl_read = require(`${S_GRAPHY_CHANNEL}/content.ttl.read`);
const nt_read = require(`${S_GRAPHY_CHANNEL}/content.nt.read`);

const nt_write = require(`${S_GRAPHY_CHANNEL}/content.nt.write`);

const H_PREFIXES = {

};

const doc_as_set = (f_reader, st_doc) => new Promise((fk_set) => {
	// parse expected document
	f_reader({
		prefixes: H_PREFIXES,
		input: {
			string: st_doc,
		},
	})
		// create then return set
		.pipe(data_set({
			ready(k_set) {
				fk_set(k_set);
			},
		}));
});

const write = (hc3_input, st_expected, gc_write={}) => new Promise((fk_write) => {
	let k_writer = nt_write({
		prefixes: H_PREFIXES,
		...gc_write,
	});

	// output string
	let st_output = '';
	k_writer.setEncoding('utf8');
	k_writer
		.on('data', (s_chunk) => {
			st_output += s_chunk;
		})
		.on('end', async() => {
			// parse result document
			let k_result = await doc_as_set(nt_read, st_output);

			// parse expected document
			let k_expected = await doc_as_set(ttl_read, st_expected);

			// compare
			assert.strictEqual(k_result.canonicalize(), k_expected.canonicalize());

			fk_write();
		});

	// write to turtle document
	k_writer.write({
		type: 'c3',
		value: hc3_input,
	});

	// close document without waiting for drain
	k_writer.end();
});


describe('collections', () => {
	it('long collections', async() => {
		let a_items = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

		await write({
			'>a': {
				'>b': [a_items.map(s => `"${s}`)],
			},
		}, `
			<a> <b> (${a_items.map(s => `"${s}" `).join(' ')}) .
		`);
	});

	it('recursive collections', async() => {
		await write({
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
		}, `
			<a> <b> (
				"a" "b" "c" (
					"D" "E" "F" (
						"g" "h" "i"
					) "G" "H" "I"
				)
			) .
		`);
	});
});

