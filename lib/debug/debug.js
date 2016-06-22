/*eslint no-console:0*/
const fs = require('fs');

const parser = require('../ttl/parser');

let s_ttl = fs.readFileSync(__dirname+'/../../scrap/debug.ttl', 'utf8');

// s_ttl = '@prefix : <z://>. :a :b :c ';

parser(s_ttl, {
	triple(h_triple) {
		// console.log(h_triple.subject+' '+h_triple.predicate+' '+h_triple.object+' .');
		if(h_triple.object.isLiteral) {
			let h_object = h_triple.object;
			// console.log(h_triple.predicate.value);
			if('http://www.w3.org/2000/01/rdf-schema#label' === h_triple.predicate.value && h_triple.object.language === 'en') {
				console.log(h_triple.subject+' '+h_triple.predicate+' '+h_triple.object);
			}
		}
	},
	error(e_parse) {
		console.error(e_parse);
	},
	end() {
		console.log('end of file');
	},
});
