const worker = require('worker');

const bat = require('../bat.js');

module.exports = function(self) {
	worker.dedicated({

		// front code a word list
		front_code_word_list(h_list) {
			// start front coder off at the right offset
			let k_front_coder = new bat.front_coder({
				offset: h_list.offset,
				block_size: h_list.block_size,
			});

			// front code fragment
			k_front_coder.add(h_list.words, h_list.indices);

			// results
			return worker.response(k_front_coder.export(), true);
		},

		// encode list of plain literals
		encode_plain_literals(h_data) {
			// let {

			// } = h_data;


		},

		merge_word_lists(h_a, h_b) {
			let {
				words: ab_content_a,
				indices: a_indices_a,
			} = h_a;

			let {
				words: at_content_b,
				indices: a_indices_b,
			} = h_b;

			// create buffer atop uint8array
			let ab_content_b = Buffer.from(at_content_b);

			let n_words_a = a_indices_a.length;
			let n_words_b = a_indices_b.length;

			// write head and output word list length
			let i_write_c = 0;
			let n_words_c = n_words_a + n_words_b;

			// output buffer & indicies
			let nl_content_c = ab_content_a.length + ab_content_b.length;
			let ab_content_c = Buffer.allocUnsafe(nl_content_c);
			let at_indices_c = new bat.uint_array(nl_content_c)(n_words_c);

			let i_word_a = 0;
			let i_word_b = 0;

			let i_end_a = a_indices_a[i_word_a];
			let i_end_b = a_indices_b[i_word_b];

			let nl_word_a = i_end_a - i_word_a;
			let nl_word_b = i_end_b - i_word_b;

			let i_read_a = 0;
			let i_read_b = 0;

			for(let i_word_c=0; i_word_c<n_words_c; i_word_c++) {
				let n_chars = Math.min(nl_word_a, nl_word_b);

				// tie goes to shorter word
				let b_win_a = nl_word_a < nl_word_b;

				// compare words char by char
				for(let i_char=0; i_char<n_chars; i_char++) {
					let x_char_a = ab_content_a[i_read_a+i_char];
					let x_char_b = ab_content_b[i_read_b+i_char];

					if(x_char_a === x_char_b) continue;
					else if(x_char_a < x_char_b) b_win_a = true;
					else b_win_a = false;

					break;
				}

				// a side wins; copy to output
				if(b_win_a) {
					ab_content_a.copy(ab_content_c, i_write_c, i_read_a, i_end_a);
					i_write_c += nl_word_a;
					at_indices_c[i_word_c] = i_write_c;

					// reached end of list a; copy remaining b list to output
					if(++i_word_a === n_words_a) {
						ab_content_b.copy(ab_content_c, i_write_c, i_read_b, a_indices_b[nl_word_b-1]);
					}

					// advance indexes and word length for next iterations
					i_read_a = i_end_a;
					i_end_a = a_indices_a[i_word_a];
					nl_word_a = i_end_a - i_read_a;
				}
				// b side wins; copy to output
				else {
					ab_content_b.copy(ab_content_c, i_write_c, i_read_b, i_end_b);
					i_write_c += nl_word_b;
					at_indices_c[i_word_c] = i_write_c;

					// reached end of list b; copy remaining a list to output
					if(++i_word_b === n_words_b) {
						ab_content_a.copy(ab_content_c, i_write_c, i_read_a, a_indices_a[nl_word_a-1]);
					}

					// advance indexes and word length for next iterations
					i_read_b = i_end_b;
					i_end_b = a_indices_b[i_word_b];
					nl_word_b = i_end_b - i_read_b;
				}
			}

			return {
				buffer: ab_content_c,
				indices: at_indices_c,
			};
		},

		// encode lists of nodes grouped by prefix into a buffer
		encode_prefixed_nodes(h_data) {
			let {
				prefixes: a_prefixes,
				prefix_keys: at_prefix_keys,
				prefix_key_bytes: n_prefix_key_bytes,
			} = h_data;

			// create buffer atop uint8array
			let ab_prefix_keys = Buffer.from(at_prefix_keys);

			// word lists
			let h_buffer_writers = {
				h: bat.word_writer(),
				s: bat.word_writer(),
				p: bat.word_writer(),
				o: bat.word_writer(),
				d: bat.word_writer(),
			};

			// each prefix
			a_prefixes.map((h_prefix, i_prefix) => {
				let h_nodes = h_prefix.nodes;

				// fetch key from buffer
				let i_prefix_key = i_prefix * n_prefix_key_bytes;
				let ab_prefix_key = ab_prefix_keys.slice(i_prefix_key, i_prefix_key+n_prefix_key_bytes);

				// group nodes based on type
				bat.group_and_encode_nodes(h_nodes, ab_prefix_key, h_buffer_writers);
			});

			// store dict data for next task on this worker
			this.put('writers', h_buffer_writers);

			// only pass counts back to main thread
			return {
				counts: {
					h: h_buffer_writers.h.count,
					s: h_buffer_writers.s.count,
					p: h_buffer_writers.p.count,
					o: h_buffer_writers.o.count,
					d: h_buffer_writers.d.count,
				},
			};
		},

		// front code prefixed nodes
		front_code_prefixed_nodes(h_sections) {
			// fetch buffer writers from previous task
			let h_buffer_writers = this.get('writers');

			let h_front_coders = {};

			// each section
			for(let s_section in h_buffer_writers) {
				// start front coder off at the right offset
				let k_front_coder = new bat.front_coder({
					offset: h_sections[s_section],
					block_size: 16,
				});

				// front code this section
				let {
					buffer: ab_words,
					indices: a_indices,
				} = h_buffer_writers[s_section].close();
				k_front_coder.add(ab_words, a_indices);

				// return appropriate parts to main thread
				h_front_coders[s_section] = k_front_coder.export();
			}

			// send back front coded buffers (let library figure out what to transfer)
			return worker.response(h_front_coders, true);
		},
	});
};

