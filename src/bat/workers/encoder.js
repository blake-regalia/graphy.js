const assert = require('assert');

const worker = require('worker');
const bkit = require('bkit');
const performance_now = require('performance-now');

const bat = require('../bat.js');
const creator = require('../creator.js');
// const graphy = require('../../main/graphy.js');

const encoder_chapter = require('../encoders/chapter-front-coded.js');

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

const F_SORT_VALUE = (h_a, h_b) => {
	return h_a.value < h_b.value? -1: 1;
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

// TODO: check endianess of machine
const FM_COMPARE_BUFFER_DUAL_FAST = (av_src_a, av_src_b) => {
	return (i_a, nl_a, i_b, nl_b) => {
		let i_char = 0;
		let n_chars = Math.min(nl_a, nl_b);

		let n_chars_4 = ((n_chars / 4) | 0) << 2;
		for(; i_char<n_chars_4; i_char+=4) {
			let x_a = av_src_a.getUint32(i_a+i_char);
			let x_b = av_src_b.getUint32(i_b+i_char);
			if(x_a < x_b) return -1;
			else if(x_a > x_b) return 1;
		}

		for(; i_char<n_chars; i_char++) {
			let x_a = av_src_a.getUint8(i_a+i_char);
			let x_b = av_src_b.getUint8(i_b+i_char);
			if(x_a < x_b) return -1;
			else if(x_a > x_b) return 1;
		}

		// one is substring of other; shorter length means win
		return (nl_a < nl_b)? -1: 1;
	};
};

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

	// // front code a word list
	// front_code_word_list(h_list) {
	// 	// start front coder off at the right offset
	// 	let k_front_coder = new bat.front_coder({
	// 		offset: h_list.offset,
	// 		block_size_k: h_list.block_size_k,
	// 	});

	// 	// front code fragment
	// 	k_front_coder.add(h_list.words, h_list.indices);

	// 	// results
	// 	return worker.result(k_front_coder.export());
	// },

	// front code a null-terminated word list
	encode_chapter(a_buffers) {
		assert(1 === a_buffers.length);

		let h_buffer = a_buffers[0];

		// start front coder off at the right offset
		let k_chapter = new encoder_chapter({
			offset: h_buffer.offset,
			block_size_k: h_buffer.block_size_k,
		});

		// front code fragment
		k_chapter.add_nt_word_list(h_buffer.contents, h_buffer.word_count);

		// results
		return k_chapter.export();
	},

	// encode list of plain literals
	encode_plain_literals(h_data) {
		// let {

		// } = h_data;


	},

	classify_sort_concat_encode(a_words, i_uli_max, s_wtf) {
		// let t_sort_last = performance_now();
		let h_types = bat.classify_nodes_list(a_words);
		// t_sort_last = Math.round(performance_now() - t_sort_last);

		// let t_sort_first = performance_now();
		// a_words.sort(F_SORT_VALUE);

		// let h_types_a = bat.classify_nodes_list_no_sort(a_words);
		// t_sort_first = Math.round(performance_now() - t_sort_first);

		// console.info(`sort-last: ${t_sort_last}; sort-first: ${t_sort_first}`);

		return {
			h: this.tasks.concat_encode(h_types.h, i_uli_max),
			s: this.tasks.concat_encode(h_types.s, i_uli_max),
			p: this.tasks.concat_encode(h_types.p, i_uli_max),
			o: this.tasks.concat_encode(h_types.o, i_uli_max),
		};
	},

	merge_classified_word_buffers(h_a, h_b, i_uli_max) {
		return {
			h: this.tasks.merge_word_buffers(h_a.h, h_b.h, i_uli_max),
			s: this.tasks.merge_word_buffers(h_a.s, h_b.s, i_uli_max),
			p: this.tasks.merge_word_buffers(h_a.p, h_b.p, i_uli_max),
			o: this.tasks.merge_word_buffers(h_a.o, h_b.o, i_uli_max),
		};
	},

	concat_encode(a_words, i_uli_max) {
		let nl_words = a_words.length;

		// console.time('encode each');
		// let k_buffer_writer = new bat.buffer_writer({grow:1024*1024});
		// for(let i_literal=0; i_literal<nl_literals; i_literal++) {
		// 	k_buffer_writer.append(bkit.encode_utf_8(a_literals[i_literal]));
		// }
		// let at_contents = k_buffer_writer.close();
		// console.timeEnd('encode each');
		// console.log('encode each contents length: '+at_contents.length);

		// k_buffer_writer = null;
		// at_contents = null;
// debugger;
		// console.time('concat-encode');
		let s_super = '';

		let at_ids = bkit.new_uint_array(i_uli_max, nl_words);

		// each word
		for(let i_word=0; i_word<nl_words; i_word++) {
			let h_word = a_words[i_word];

			// concat its value
			s_super += h_word.value+'\0';

			if(!h_word.value) debugger;

			// push its id
			at_ids[i_word] = h_word.id;
		}

		// encode all at once
		let at_contents = bkit.encode_utf_8(s_super);
		// console.timeEnd('concat-encode');

		return {
			contents: at_contents,
			ids: at_ids,
		};
	},

	sort_concat_encode(a_words, i_uli_max, b_debug=false) {
		a_words.sort(F_SORT_VALUE);

		return this.tasks.concat_encode(a_words, i_uli_max);
	},

	merge_word_buffers(h_a, h_b, i_uli_max, b_debug=false) {
		console.time('merge word buffers');

		let {
			contents: at_a,
			ids: at_ids_a,
		} = h_a;

		let {
			contents: at_b,
			ids: at_ids_b,
		} = h_b;

		if(!at_a) debugger;

		let nl_a = at_a.length;
		let nl_b = at_b.length;

		// one of the buffers is empty
		if(!nl_a) return h_b;
		else if(!nl_b) return h_a;

		let nl_c = nl_a + nl_b;
		let at_c = new Uint8Array(nl_c);
		let at_ids_c = bkit.new_uint_array(i_uli_max, at_ids_a.length+at_ids_b.length);

		let av_src_a = new DataView(at_a.buffer, at_a.byteOffset, at_a.byteLength);
		let av_src_b = new DataView(at_b.buffer, at_b.byteOffset, at_b.byteLength);
		let f_compare = FM_COMPARE_BUFFER_DUAL_FAST(av_src_a, av_src_b);

		let i_word_a = 0;
		let i_word_b = 0;
		let i_word_c = 0;

		let i_read_a = 0;
		let i_read_b = 0;

		let i_end_a = at_a.indexOf(0, i_read_a) + 1;
		let i_end_b = at_b.indexOf(0, i_read_b) + 1;

		let nl_word_a = i_end_a - i_read_a;
		let nl_word_b = i_end_b - i_read_b;

		let i_write_c = 0;
		while(i_write_c<nl_c) {
			// a wins
			if(f_compare(i_read_a, nl_word_a, i_read_b, nl_word_b) < 0) {
				// add word to buffer
				at_c.set(at_a.subarray(i_read_a, i_end_a), i_write_c);

				// put id in right spot
				at_ids_c[i_word_c++] = at_ids_a[i_word_a++];

				// advance write index
				i_write_c += nl_word_a;

				// advance pointers; check end of input buffer
				i_read_a = i_end_a;
				i_end_a = at_a.indexOf(0, i_read_a) + 1;
				if(0 === i_end_a) break;
				nl_word_a = i_end_a - i_read_a;
			}
			// b wins
			else {
				// add word to buffer
				at_c.set(at_b.subarray(i_read_b, i_end_b), i_write_c);

				// put id in right spot
				at_ids_c[i_word_c++] = at_ids_b[i_word_b++];

				// advance write index
				i_write_c += nl_word_b;

				// advance pointers; check end of input buffer
				i_read_b = i_end_b;
				i_end_b = at_b.indexOf(0, i_read_b) + 1;
				if(0 === i_end_b) break;
				nl_word_b = i_end_b - i_read_b;
			}
		}

		// a is empty; append rest of b
		if(i_read_a === nl_a) {
			at_c.set(at_b.subarray(i_read_b), i_write_c);
			at_ids_c.set(at_ids_b.subarray(i_word_b), i_word_c);
			i_write_c += nl_b - i_read_b;
		}
		// b is empty; append rest of a
		else if(i_read_b === nl_b) {
			at_c.set(at_a.subarray(i_read_a), i_write_c);
			at_ids_c.set(at_ids_a.subarray(i_word_a), i_word_c);
			i_write_c += nl_a - i_read_a;
		}

		// sanity check
		console.assert(i_write_c === nl_c, 'bug alert: sorted null-terminated word buffers were not thoroughly merged');

		console.timeEnd('merge word buffers');

		// if(b_debug) debugger;
		return {
			contents: at_c,
			ids: at_ids_c,
		};
	},

	merge_word_lists(h_a, h_b) {
		debugger;
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
		let at_indices_c = bkit.new_uint_array(nl_content_c, n_words_c);

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
				block_size_k: 4,
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
		return h_front_coders;
	},

	// front_code_word_buffer(h_word_buffer) {
	// 	let k_chapter = new encoder_chapter();

	// 	k_chapter
	// }


	parse_save(pm_format, d_port_input, h_state) {
		let t_start = performance_now();
		let k_creator = new creator();

		return new Promise((f_resolve) => {
			let k_stream = worker.stream(d_port_input);

			throw new Error('deprecated');
			// // parse
			// graphy.deserializer(pm_format, k_stream, {
			// 	state: h_state,

			// 	// each triple
			// 	data: (h_triple) => {
			// 		k_creator.save_triple(h_triple);
			// 	},

			// 	// eof
			// 	end: (h_prefixes) => {
			// 		let t_all = performance_now() - t_start;
			// 		console.info(`total: ${t_all}`);

			// 		// debugger;
			// 		f_resolve(k_creator.export());
			// 	},
			// });
		});
	},

	merge_terms_triples(g_creator_a, g_creator_b) {
		return new creator(g_creator_a)
			.import(g_creator_b)
			.export();
	},
});

