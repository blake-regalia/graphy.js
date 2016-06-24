/*eslint no-console:0*/
const fs = require('fs');

const parser = require('../trig/parser');

// let s_input = fs.readFileSync(__dirname+'/../../scrap/debug.ttl', 'utf8');

let s_input = '<z://d> { <z://a> <z://b> <z://c> . }';

debugger;
parser(s_input, {
	data(h_triple) {
		console.log(h_triple);
	},
	error(e_parse) {
		console.error(e_parse);
	},
	end() {
		console.log('end of file');
	},
});
