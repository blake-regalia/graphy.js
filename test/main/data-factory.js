const assert = require('assert');
const graphy = require('../../dist/index');

const eq = assert.strictEqual;
const deq = assert.deepEqual;

describe('DataFactory:', () => {

	describe('graphy.literal', () => {

		it('no datatype', () => {
			deq(graphy.literal('test'), {value: 'test'});
			eq(graphy.literal('test').datatype, 'http://www.w3.org/2001/XMLSchema#string');
		});

		it('yes datatype', () => {
			deq(graphy.literal('test', 'yes'), {value: 'test', datatype: 'yes'});
		});

		it('language', () => {
			deq(graphy.literal('test', '@en'), {value: 'test', language: 'en'});
		});

		it('casts to string toCanonical', () => {
			eq(graphy.literal('hello', '@en')+'', '"hello"@en');
			eq(graphy.literal('hello', 'greeting')+'', '"hello"^^<greeting>');
		});

		it('.toCanonical', () => {
			eq(graphy.literal('hello', '@en').toCanonical(), '"hello"@en');
			eq(graphy.literal('hello', 'greeting').toCanonical(), '"hello"^^<greeting>');
		});

		it('.termType', () => {
			eq(graphy.literal('').termType, 'Literal');
		});

		it('.isLiteral', () => {
			eq(graphy.literal('').isLiteral, true);
		});
	});
});
