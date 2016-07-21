/*eslint no-console:0*/
const fs = require('fs');

const parse = require('../ttl/parser');

let s_input = fs.readFileSync(__dirname+'/../../scrap/star-wars.ttl', 'utf8');

// let s_input = `
// 	@prefix <a> 
// `;

parse(s_input, {
	data(h_triple) {
		console.log(h_triple+'');
	},
	error(e_parse) {
		console.error(e_parse);
	},
	end() {
		console.log('end of file');
	},
});
