const worker = require('worker');

const bat = require('../bat.js');

const F_SORT_BUFFER = (ab_a, ab_b) => {
	let nl_a = ab_a.length;
	let nl_b = ab_b.length;

	let n_chars = Math.min(nl_a, nl_b);
	for(let i_char=0; i_char<n_chars; i_char++) {
		let x_a = ab_a[i_char];
		let x_b = ab_b[i_char];
		if(x_a < x_b) return -1;
		else if(x_a > x_b) return 1;
	}

	// one is substring of other; shorter length means win
	return (nl_a < nl_b)? -1: 1;
};

const FM_SORT_BUFFER_FAST = (av_src) => {
	return (h_a, h_b) => {
		let {i:i_a, nl:nl_a} = h_a;
		let {i:i_b, nl:nl_b} = h_b;

		let i_char = 0;
		let n_chars = Math.min(nl_a, nl_b);

		let n_chars_4 = (n_chars / 4) | 0;
		for(; i_char<n_chars_4; i_char+=4) {
			let x_a = av_src.getUint32(i_a+i_char);
			let x_b = av_src.getUint32(i_b+i_char);
			if(x_a < x_b) return -1;
			else if(x_a > x_b) return 1;
		}

		for(; i_char<n_chars; i_char++) {
			let x_a = av_src.getUint8(i_a+i_char);
			let x_b = av_src.getUint8(i_b+i_char);
			if(x_a < x_b) return -1;
			else if(x_a > x_b) return 1;
		}

		// one is substring of other; shorter length means win
		return (nl_a < nl_b)? -1: 1;
	};
};

module.exports = function(self) {
	worker.dedicated({

		// sort word list
		sort_word_list(h_list) {
			console.time('sort word list');
			let at_contents_input = h_list.contents;
			let at_indices_input = h_list.indices;

			let nl_contents = at_contents_input.length;
			let n_words = at_indices_input.length;

			let k_input = new bat.word_reader(at_contents_input, at_indices_input);
			let av_input = new DataView(at_contents_input, at_contents_input.byteOffset, at_contents_input.byteLength);

			// sorted word list
			let a_sort = [];
			let i_read = 0;
			for(let i_end of k_input.indices()) {
				// a_sort.push(ab_word);
				a_sort.push({i:i_read, nl:i_end-i_read});
				i_read = i_end;
			}
			// a_sort.sort(F_SORT_BUFFER);
			a_sort.sort(FM_SORT_BUFFER_FAST);

			console.timeEnd('sort word list');


			// // turn sorted list back into word list
			// let at_sorted = new Uint8Array(nl_contents);
			// let at_indices = new bat.uint_array(nl_contents)(n_words);
			// let i_write = 0;
			// for(let i_word=0; i_word<n_words; i_word++) {
			// 	let ab_word = a_sort[i_word];
			// 	at_sorted.set(ab_word, i_write);
			// 	i_write += ab_word.length;
			// 	at_indices[i_word] = i_write;
			// }
		},

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
			let at_indices_c = bat.new_uint_array(nl_content_c, n_words_c);

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
				groups: a_groups,
				prefix_key_bytes: n_prefix_key_bytes,
			} = h_data;

			// key space
			let k_key_space = new bat.key_space(n_prefix_key_bytes);

			// universal node index maps
			let h_uni_maps = {h:{}, s:{}, p:{}, o:{}, d:{}};

			// word lists
			let h_word_writers = {
				h: new bat.word_writer(),
				s: new bat.word_writer(),
				p: new bat.word_writer(),
				o: new bat.word_writer(),
				d: new bat.word_writer(),
			};

			// each prefix group
			let nl_groups = a_groups.length;
			for(let i_group=0; i_group<nl_groups; i_group++) {
				let h_group = a_groups[i_group];

				// create prefix key
				let ab_prefix_key = k_key_space.encode(h_group.prefix_id);

				// group nodes based on type
				bat.classify_and_encode_nodes(ab_prefix_key, h_group.items, h_word_writers, h_uni_maps);
			}

			// store dict data for next task on this worker
			this.put('word_writers', h_word_writers);

			// only pass counts back to main thread
			return {
				uni_maps: {
					h: h_uni_maps.h,
					s: h_uni_maps.s,
					p: h_uni_maps.p,
					o: h_uni_maps.o,
					d: h_uni_maps.d,
				},
				counts: {
					h: h_word_writers.h.count,
					s: h_word_writers.s.count,
					p: h_word_writers.p.count,
					o: h_word_writers.o.count,
					d: h_word_writers.d.count,
				},
			};
		},

		// front code prefixed nodes
		front_code_prefixed_nodes(h_classes) {
			// fetch buffer writers from previous task
			let h_buffer_writers = this.get('word_writers');

			// each class; save front coder
			let h_front_coders = {};
			for(let s_class in h_buffer_writers) {
				// start front coder off at the right offset
				let k_front_coder = new bat.front_coder({
					offset: h_classes[s_class],
					block_size: 16,
				});

				// front code this section
				let {
					contents: at_contents,
					indices: a_indices,
				} = h_buffer_writers[s_class].close();
				k_front_coder.add(at_contents, a_indices);

				// return appropriate parts to main thread
				h_front_coders[s_class] = k_front_coder.export();
			}

			// send back front coded buffers (let library figure out what to transfer)
			return worker.response(h_front_coders, true);
		},
	});
};

