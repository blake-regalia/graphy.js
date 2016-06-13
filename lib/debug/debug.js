/*eslint no-console:0*/

const parser = require('../ttl/stream-parser');

parser(`@prefix : <#>.
		:a :b ((:c :d) (:e) :f)
		`, {
	triple(h_triple) {
		console.log(h_triple);
	},
	end() {
		console.log('all done');
	},
	error() {

	},
});

