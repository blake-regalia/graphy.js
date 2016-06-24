/*eslint no-console:0*/
const fs = require('fs');

// let p_file = '/Users/blake/Downloads/geo_coordinates_mappingbased_en.ttl';
// p_file = './scrap/large-data.ttl';


console.time('g');
const n3 = require('n3');
let p_file = '/Users/blake/Downloads/redirects_en.ttl';
let c_triples = 0;
let c_literals = 0;
new n3.Parser().parse(fs.createReadStream(p_file), function(e_parse, h_triple) {
	if(h_triple) {
		c_triples += 1;
		// console.log(h_triple.object);
		// if(h_triple.object[0] === '"') {
		// 	c_literals += 1;
		// }
	}
	else {
		console.timeEnd('g');
		console.log(`${c_triples} triples parsed`);
		// console.log(`${c_literals} literals parsed`);
		console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB`);
	}
});
