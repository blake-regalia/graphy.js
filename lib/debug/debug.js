/*eslint no-console:0*/

const parser = require('../ttl/stream-parser');

parser(`
	a:f :b :c .
`, {
	triple(h_triple) {
		console.log(h_triple);
	},
	end() {
		console.log('all done');
	},
});
