/*eslint no-console:0*/
const fs = require('fs');

console.time('g');
let p_file = process.argv[2];
let parse = require('../dist/main/graphy').trig.parse;
let c_triples = 0;
parse(fs.createReadStream(p_file), {
	data(h_triple) {
		c_triples += 1;
	},
	end() {
		console.timeEnd('g');
		console.log(`${c_triples} triples parsed`);
		console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB rss`);
	},
});

