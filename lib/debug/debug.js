/*eslint no-console:0*/
const fs = require('fs');

const parse = require('../ttl/parser');

// let s_input = fs.readFileSync(__dirname+'/../../scrap/debug.ttl', 'utf8');

let s_input = `# In-scope base URI is <http://www.w3.org/2013/TurtleTests/turtle-subm-27.ttl> at this point
<a1> <b1> <c1> .
@base <http://example.org/ns/> .
# In-scope base URI is http://example.org/ns/ at this point
<a2> <http://example.org/ns/b2> <c2> .
@base <foo/> .
# In-scope base URI is http://example.org/ns/foo/ at this point
<a3> <b3> <c3> .
@prefix : <bar#> .
:a4 :b4 :c4 .
@prefix : <http://example.org/ns2#> .
:a5 :b5 :c5 .`;

parse(s_input, {
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
