/*eslint no-console:0*/
const fs = require('fs');

let p_file = '/Users/blake/Downloads/geo_coordinates_mappingbased_en.ttl';
// p_file = '/Users/blake/dev/volt-debug/data/source/dbpedia-places-california.ttl';
// p_file = '/Users/blake/dev/volt-debug/data/source/dbpedia-places-oregon.ttl';
p_file = '/Users/blake/Downloads/persondata_en.nt';

console.time('g');
let parser = require('../ttl/stream-parser');
parser = require('../nt/stream-parser');
console.log('using nt parser');

let c_triples = 0;
let c_literals = 0;
let c_iris = 0;
let c_literals_length = 0;

parser(fs.createReadStream(p_file), {
	triple(h_triple) {
		c_triples += 1;
		if(h_triple.object.is.literal) {
			c_literals += 1;
			c_literals_length += h_triple.object.value.length;
		}
		else if(h_triple.object.is.iri) {
			c_iris += 1;
		}
	},
	// statement(h_statement) {
	// 	let h_predicates = h_statement.predicates;
	// 	for(let s_predicate in h_predicates) {
	// 		let a_objects = h_predicates[s_predicate];
	// 		a_objects.for
	// 	}
	// },
	end() {
		console.timeEnd('g');
		console.log(`${c_triples} triples parsed`);
		console.log(`${c_iris} iris`);
		console.log(`${c_literals} literals`);
		console.log(`... totaling ${c_literals_length} characters in total`);
		console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB`);
	},
});

