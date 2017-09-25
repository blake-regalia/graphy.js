const worker = require('worker');

const graphy = require('../../main/graphy');
const bat = require('../bat.js');

module.exports = function() {
	worker.dedicated({

		parse(s_mime, d_port) {
			let b_prefix_change = false;
			let a_triples = [];

			return new Promise((f_resolve) => {
				graphy.deserializer(s_mime, worker.stream(d_port), {
					// split_tracking: {
					// 	// aim for equal divisions
					// 	targets: this.workers.divisions(k_blob.size),

					// 	// when it reaches the closest offset to each target
					// 	reached(i_byte_offset) {
					// 		a_split_indices.push(i_byte_offset);
					// 	},
					// },

					// if any prefix changes, final map is not valid for whole document
					prefix_change() {
						b_prefix_change = true;
					},

					// each triple
					data: (h_triple) => {
						a_triples.push({
							s: h_triple.subject.concise(),
							p: h_triple.predicate.concise(),
							o: h_triple.object.concise(),
						});
					},

					// end of segment
					eos: () => {
						// swap reference
						let a_triples_send = a_triples;
						a_triples = [];

						// send triples to master after asking for next stream chunk
						setTimeout(() => {
// console.log('S ==> [triples]');

							// emit triples to master
							this.emit('dump', a_triples_send, performance.now());
						}, 0);
					},

					// eof
					end: (h_prefixes) => {
						f_resolve({
							prefix_change: b_prefix_change,
							prefixes: h_prefixes,
						});
					},
				});
			});
		},

	});
};
