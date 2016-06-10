const fs = require('fs');

console.time('g');
const parser = require('../ttl/static-parser');

let h_network = parser(fs.readFileSync('./scrap/large-data.ttl', 'utf8'));

let c_top_nodes = Object.keys(h_network).length;

console.timeEnd('g');
console.log(`${c_top_nodes} top triples`);
console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB`);
