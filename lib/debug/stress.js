/*eslint no-console:0*/
const fs = require('fs');

let s_ttl = fs.readFileSync(__dirname+'/../../scrap/debug.ttl', 'utf8');

console.time('g');
let parser = require(`../ttl/parser`);

let h_look = {
	'dbr': 'http://dbpedia.org/resource',
};
let h_check = {
	'try to find this',
};
let a_enums = [
	'dbr:Gros_Michel_banana',
	'volt:GeographiNamesEntitiy',
];

for(let i=0; i<100000; i++) {
	// parser(s_ttl, {
	// 	triple(h_triple) {},
	// 	end() {
	// 	},
	// });
	let s_try = a_enums[i%2];
	let s_prefix = s_try.split(':')[0];
	if(h_look[s_prefix]) {
		let s_suffix = s_try.slice(s_prefix.length);
		if(h_check[s_suffix]) {
			console.log('never');
		}
	}
}

console.timeEnd('g');