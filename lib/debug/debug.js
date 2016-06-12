/*eslint no-console:0*/

const parser = require('../ttl/stream-parser');

parser('<#a> _:blank_nodes_cannot_be_predicates <#c>.', {
	triple(h_triple) {
	},
	end() {
		console.log('all done');
	},
	error() {

	},
});

