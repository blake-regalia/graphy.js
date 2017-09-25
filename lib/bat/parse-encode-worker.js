const graphy = require('../main/graphy');
const bat = require('./bat.js');
const worker = require('worker');

module.exports = function() {
	worker.dedicated({

		parse(s_mime, d_port) {
			let b_prefix_change = false;
			let a_triples = [];

			let d_encoder = new TextEncoder('utf-8');
			let k_word_writer = new bat.word_writer();

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
						k_word_writer.append(d_encoder.encode(h_triple.subject.concise));
						k_word_writer.append(d_encoder.encode(h_triple.predicate.concise));
						k_word_writer.append(d_encoder.encode(h_triple.object.concise));

						// a_triples.push({
						// 	s: h_triple.subject.concise(),
						// 	p: h_triple.predicate.concise(),
						// 	o: h_triple.object.concise(),
						// });
					},

					// end of segment
					eos: () => {
						// send triples to master after asking for next stream chunk
						setTimeout(() => {
							// emit triples to master
							let k_response_word_list = worker.response(k_word_writer.export(), true);
							this.emit('dump', k_response_word_list, performance.now());
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
