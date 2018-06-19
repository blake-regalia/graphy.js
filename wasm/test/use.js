const fs = require('fs');
const path = require('path');

console.time('g');
const parse = require(path.resolve(__dirname, '../build/api.js'));

let c_triples = 0;
let c_literals = 0;

// let p_input = '/Users/blake/dev/graphy/data/input/debug.nt';
let p_input = '/Users/blake/dev/graphy/performance/data/persondata_en.nt';

// let ab_input = fs.readFileSync(p_input);

// let at_input = ab_input.subarray(0, 45);

// let ab_partial = Buffer.from(`
// 	<a> <b> <`);


let ds_input = fs.createReadStream(p_input);
// console.time('parse');
parse(ds_input, {
	data(g_quad) {
		// console.log(g_quad.verbose());

		c_triples += 1;

		// if('Literal' === g_quad.object.termType) {
		// 	c_literals += 1;
		// }
	},

	end() {
		console.timeEnd('g');
		// console.timeEnd('parse');
		console.log(`triples: ${c_triples}`);
		console.log(`literals: ${c_literals}`);
	},
});


const stat_nt = require('@graphy/format.stat.nt');
let g_stats = await stat_nt(ds_input);

