const fs = require('fs');

let p_file = '/Users/blake/Downloads/geo_coordinates_mappingbased_en.ttl';
// p_file = './scrap/large-data.ttl';

console.time('g');
const parser = require('../ttl/stream-parser');

let c_triples = 0;
parser(fs.createReadStream(p_file), (h_triple) => {
	if(h_triple) {
		c_triples += 1;
	}
	else {
		console.timeEnd('g');
		console.log(`${c_triples} triples parsed`);
		console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB`);
	}
});
