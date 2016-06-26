const fs = require('fs');

console.time('g');
const graphy = require('../graphy/graphy');

let p_file = '/Users/blake/Downloads/persondata_en.nt';
let ds_input = fs.createReadStream(p_file);

graphy.nt.linked(ds_input, (error, g) => {
	console.timeEnd('g');
	console.log(`${process.memoryUsage().rss / 1024 / 1024}MiB rss`);
	console.log(`${process.memoryUsage().heapTotal / 1024 / 1024}MiB heap total`);
	console.log(`${process.memoryUsage().heapUsed / 1024 / 1024}MiB heap used`);
});
