const fs = require('fs');

console.time('g');
const parser = require('./stream-parser');

let c_triples = 0;
parser(fs.createReadStream('./scrap/large-data.ttl'), (h_triple) => {
	if(h_triple) {
		c_triples += 1;
	}
	else {
		console.timeEnd('g');
		console.log(`${c_triples} parsed`);
		console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB`);
	}
});
