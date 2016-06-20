/*eslint no-console:0*/
const fs = require('fs');

const parser = require('../ttl/parser');

let s_ttl = fs.readFileSync(__dirname+'/../../scrap/debug.ttl', 'utf8');

// s_ttl = '@prefix : <z://>. :a :b :c ';

parser(s_ttl, {
	triple(h_triple) {
		console.log(h_triple.object.value.length);
	},
	error(e_parse) {
		console.error(e_parse);
	},
	end() {
		console.log('end of file');
	},
});
