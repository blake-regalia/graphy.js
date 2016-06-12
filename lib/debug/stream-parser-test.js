/*eslint no-console:0*/
const fs = require('fs');

let p_file = '/Users/blake/Downloads/geo_coordinates_mappingbased_en.ttl';

console.time('g');
const parser = require('../ttl/stream-parser');

let c_triples = 0;
let c_literals = 0;
let c_literals_length = 0;

parser(fs.createReadStream(p_file), {
	triple(h_triple) {
		c_triples += 1;
		if('string' !== typeof h_triple.object) {
			c_literals += 1;
			c_literals_length += h_triple.object.$.length;
		}
	},
	end() {
		console.timeEnd('g');
		console.log(`${c_triples} triples parsed`);
		console.log(`${c_literals} literals`);
		console.log(`... totaling ${c_literals_length} characters in total`);
		console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB`);
	},
});

