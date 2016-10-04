const assert = require('assert');
const graphy = require('../../dist/main/graphy.js');

const eq = assert.strictEqual;
const deq = assert.deepEqual;

const has = (k, h) => {
	for(let s_key in h) {
		assert.notStrictEqual(typeof k[s_key], 'undefined', 'instance missing key {'+s_key+'}');
		assert.strictEqual(k[s_key], h[s_key], 'instance has wrong value {'+s_key+': "'+k[s_key]+'" should be "'+h[s_key]+'"}');
	}
};

describe('DataFactory:', () => {

	describe('graphy.literal', () => {

		it('w/o datatype', () => {
			has(graphy.literal('test'), {value: 'test'});
			eq(graphy.literal('test').datatype.value, 'http://www.w3.org/2001/XMLSchema#string');
		});

		it('yes datatype', () => {
			let k_datatype = graphy.namedNode('yes');
			has(graphy.literal('test', k_datatype), {value: 'test', datatype: k_datatype});
		});

		it('language', () => {
			has(graphy.literal('test', 'en'), {value: 'test', language: 'en'});
		});

		it('valueOf casts to canonical form', () => {
			eq(graphy.literal('hello', 'en')+'', '@en"hello');
			eq(graphy.literal('hello', graphy.namedNode('greeting'))+'', '^greeting"hello');
		});

		it('.toNT', () => {
			eq(graphy.literal('hello', 'en').toNT(), '"hello"@en');
			eq(graphy.literal('hello', graphy.namedNode('greeting')).toNT(), '"hello"^^<greeting>');
		});

		it('.termType', () => {
			eq(graphy.literal('').termType, 'Literal');
		});

		it('.isLiteral', () => {
			eq(graphy.literal('').isLiteral, true);
		});
	});
});

// RDFJS Data Model test suite
require('rdf-data-model-test-suite')(graphy);
