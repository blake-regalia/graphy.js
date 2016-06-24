/*eslint no-console:0*/
const fs = require('fs');

// let p_file = '/Users/blake/Downloads/geo_coordinates_mappingbased_en.ttl';
// p_file = '/Users/blake/dev/volt-debug/data/source/dbpedia-places-california.ttl';
// p_file = '/Users/blake/dev/volt-debug/data/source/dbpedia-places-oregon.ttl';

// p_file = '/Users/blake/Downloads/instance-types_en.nq';

let s_flavor = process.argv[2];

console.time('g');
let parser = require('../nt/parser');
let p_file = '/Users/blake/Downloads/persondata_en.nt';
let c_triples = 0;
let c_literals = 0;
parser(fs.createReadStream(p_file), {
	data(h_triple) {
		c_triples += 1;
		if(h_triple.object.isLiteral) {
			c_literals += 1;
		}
	},
	end() {
		console.timeEnd('g');
		console.log(`${c_triples} triples parsed`);
		console.log(`${c_literals} literals parsed`);
		console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB`);
	},
});

