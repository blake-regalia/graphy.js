/*eslint no-console:0*/

const parser = require('../ttl/stream-parser');

parser(`@prefix : <#>.
	(
		"1"
		[
			:a (
				"2"
				[
					:b "3"
				]
				"4"
			)
		]
		"5"
	) :c :d .
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

