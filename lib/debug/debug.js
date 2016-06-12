/*eslint no-console:0*/

const parser = require('../ttl/stream-parser');

parser('@prefix p: <#>. p:a p:b p:c#comment\n.', {
	triple(h_triple) {
		console.log(h_triple);
	},
	end() {
		console.log('all done');
	},
	error() {

	},
});

