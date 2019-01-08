/* eslint-env mocha */
const expect = require('chai').expect;

const stream = require('@graphy/core.iso.stream');
const dataset_tree = require('@graphy/util.dataset.tree');
const ttl_read = require('@graphy/content.ttl.read');
const ttl_write = require('@graphy/content.ttl.write');
const nt_read = require('@graphy/content.nt.read');

const nt_write = require('@graphy/content.nt.write');

const H_PREFIXES = {

};

const normalize = (st_doc, f_reader) => stream.source(st_doc)
	// read expected document
	.pipe(f_reader({
		prefixes: H_PREFIXES,
	}))
	// canonicalize in dataset
	.pipe(dataset_tree({
		canonicalize: true,
	}))
	// write to turtle
	.pipe(ttl_write())
	// return accumulated result
	.bucket();

const write = async(hc3_input, st_validate, gc_write={}) => {
	// start with concise-triples hash
	let st_output = await stream.source({
		type: 'c3',
		value: hc3_input,
	})
		// write to n-triples
		.pipe(nt_write({
			prefixes: H_PREFIXES,
			...gc_write,
		}))
		// accumulate result
		.bucket();

	// normalize result document
	let st_result = await normalize(st_output, nt_read);

	// normalize expected document
	let st_expect = await normalize(st_validate, ttl_read);

	// assertion
	expect(st_result).to.equal(st_expect);
};


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

