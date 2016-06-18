/*eslint no-console:0*/
const fs = require('fs');

const parser = require('../ttl/stream-parser');

let s_ttl = fs.readFileSync(__dirname+'/../../scrap/debug.ttl', 'utf8');

// s_ttl = '@prefix : <z://>. :a :b :c ';

parser(s_ttl, {
	triple(h_triple) {
		console.log(h_triple);
	},
	error(e_parse) {
		console.error(e_parse);
	},
	end() {
		console.log('end of file');
	},
});
