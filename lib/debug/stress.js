/*eslint no-console:0*/
const fs = require('fs');

let s_ttl = fs.readFileSync(__dirname+'/../../scrap/debug.ttl', 'utf8');

console.time('g');
let parser = require(`../ttl/parser`);

for(let i=0; i<100000; i++) {
	parser(s_ttl, {
		triple(h_triple) {},
		end() {
		},
	});
}

console.timeEnd('g');