/*eslint no-console:0*/
const fs = require('fs');

console.time('g');
let p_file = process.argv[2];
const n3 = require('n3');
let c_triples = 0;
new n3.Parser().parse(fs.createReadStream(p_file), function(e_parse, h_triple) {
	if(h_triple) {
		c_triples += 1;
	}
	else {
		console.timeEnd('g');
		console.log(`${c_triples} triples parsed`);
		console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB`);
	}
});
