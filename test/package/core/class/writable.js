
const assert = require('assert');
const writable = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/core.class.writable`);

const eq = assert.strictEqual;
const deq = assert.deepEqual;

const has = (k, h) => {
	for(let s_key in h) {
		assert.notStrictEqual(typeof k[s_key], 'undefined', 'instance missing key {'+s_key+'}');
		assert.strictEqual(k[s_key], h[s_key], 'instance has wrong value {'+s_key+': "'+k[s_key]+'" should be "'+h[s_key]+'"}');
	}
};

describe('core.class.writable', () => {
	let g_serializer = writable.serializer;
	describe('writable.serializer.textual', () => {
		let g_textual = g_serializer.textual;

		it('verbose', () => {
			eq(typeof g_textual.verbose, 'function');
		});

		it('terse', () => {
			eq(typeof g_textual.terse, 'function');
		});
	});
});
