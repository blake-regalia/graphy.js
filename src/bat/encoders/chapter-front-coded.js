const bkit = require('bkit');

class chapter_front_coded {
	constructor(h_opt={}) {
		let {
			offset: i_offset=0,
			block_size_k: n_block_size_k=4,
		} = h_opt;

		Object.assign(this, {
			offset: i_offset,
			block_size: 1 << n_block_size_k,
			contents: new bkit.buffer_writer(),
			block_indices: [],
			word_count: 0,
			defer: null,
			top_word: null,
		});
	}

	close(p_encoding) {
		let {
			block_size: n_block_size,
			contents: k_contents,
			block_indices: a_block_indices,
			word_count: n_words,
		} = this;

		let nl_contents = k_contents.write;
		let at_block_indices = bkit.uint_array(nl_contents).from(a_block_indices);

		let nl_block_indices = at_block_indices.byteLength;
		let n_byte_estimate = 1 + (4*4) + nl_block_indices + nl_contents;

		let kbe = new bkit.buffer_encoder({size:n_byte_estimate});

		// chapter encoding
		kbe.ntu8_string(p_encoding);

		// block size k
		kbe.vuint(Math.log2(n_block_size, 2));

		// word count
		kbe.vuint(n_words);

		// // block indices length
		// kbe.vuint(nl_block_indices);

		// // block indices
		// kbe.array(at_block_indices);

		// block indices
		kbe.typed_array(at_block_indices);

		// contents length
		kbe.vuint(nl_contents);

		// contents
		kbe.buffer.append(k_contents.close());

		return kbe.close();
	}

	export() {
		let {
			block_size: n_block_size,
			contents: k_contents,
			block_indices: a_block_indices,
			word_count: n_words,
			defer: h_defer,
			top_word: at_top_word,
		} = this;

		let nl_contents = k_contents.write;
		let n_deferments = h_defer
			? (h_defer.indices
				? h_defer.indices.length
				: h_defer.word_count): 0;
		let n_contents_word = n_words - n_deferments;
		// if(!n_contents_word) debugger;
		let at_block_indices = bkit.new_uint_array(nl_contents, a_block_indices.length);
		at_block_indices.set(a_block_indices);
		return {
			offset: this.offset,
			block_size_k: Math.log2(n_block_size, 2),
			contents: k_contents.close(),
			block_indices: at_block_indices,
			defer: h_defer,
			top_word: at_top_word,
			contents_word_count: n_contents_word,
		};
	}

	import(h_import) {
		let {
			offset: i_offset,
			block_size: n_block_size,
			contents: k_contents,
			block_indices: a_block_indices,
			word_count: n_words,
		} = this;

		let {
			offset: i_offset_import,
			block_size_k: n_block_size_k_import,
			contents: at_contents_import,
			block_indices: at_block_indices_import,
			defer: h_defer_import,
			top_word: at_top_word,
			contents_word_count: n_contents_word_import,
		} = h_import;

		// check alignment
		{
			if((1 << n_block_size_k_import) !== n_block_size) {
				throw new Error(`block size mismatch: ${1 << n_block_size_k_import} != ${n_block_size}`);
			}
			if(i_offset_import !== n_words) {
				throw new Error(`import's word offset @${i_offset_import} != this word count @${n_words}`);
			}
			if(h_defer_import) {
				let n_deferments = h_defer_import.indices
					? h_defer_import.indices.length
					: h_defer_import.word_count;
				let n_block_space = n_block_size - (n_words % n_block_size);

				// blocks are present
				if(at_block_indices_import.length) {
					// deferments does not exactly fill remainder block space
					if(n_deferments !== n_block_space) {
						throw new Error(`import has incorrect number of deferred words for this remainder block space`);
					}
				}
				// only deferments; but they exceed remainder block space
				else if(n_deferments > n_block_space) {
					throw new Error(`import has too many deferred words for this remainder block space`);
				}
			}
		}

		// front-code deferred words
		if(h_defer_import) {
			if(h_defer_import.indices) {
				this.add(h_defer_import.contents, h_defer_import.indices);
			}
			else {
				this.add_nt_word_list(h_defer_import.contents, h_defer_import.word_count);
			}
		}

		// append completed fragments
		if(n_contents_word_import) {
			k_contents.append(at_contents_import);
			a_block_indices.push(...at_block_indices_import);
			this.word_count += n_contents_word_import;
			this.top_word = at_top_word;
		}

		// inherit top word from import
		// if(at_top_word) this.top_word = at_top_word;
	}

// 	add(at_fragment, a_indices) {
// 		let {
// 			block_size: n_block_size,
// 			block_indices: a_block_indices,
// 			contents: k_contents,
// 			word_count: n_words,
// 		} = this;

// 		// length of fragment
// 		let nl_fragment = at_fragment.length;

// 		// empty fragment
// 		if(!nl_fragment) return;

// 		// read index in fragment
// 		let i_read = 0;

// 		// number of words in fragment
// 		let n_words_fragment = a_indices.length;

// 		// how many words have been processed in this fragment
// 		let c_words_fragment = 0;

// 		// this is the first local fragment
// 		if(!k_contents.write) {
// 			// offset puts this amid an existing block
// 			let i_offset = this.offset;
// 			if(0 !== i_offset % n_block_size) {
// 				// jump to head word of new block
// 				let n_words_skip = n_block_size - (i_offset % n_block_size);

// 				// skipped all words in fragment
// 				let b_defer_all = false;
// 				if(n_words_skip >= n_words_fragment) {
// 					b_defer_all = true;
// 					n_words_skip = n_words_fragment;

// 					// save word count before exit
// 					this.word_count += n_words_fragment;
// 				}
// 				// more words remain
// 				else {
// 					c_words_fragment = n_words_skip;
// 				}

// 				// index of end of this range to skip
// 				let i_range_end = a_indices[n_words_skip - 1];

// 				// defer all words at once
// 				this.defer = {
// 					contents: at_fragment.slice(0, i_range_end),
// 					indices: a_indices.slice(0, n_words_skip),
// 				};

// 				// update read index
// 				i_read = i_range_end;

// 				// defer all
// 				if(b_defer_all) return;
// 			}
// 		}

// // debugger;
// 		// front-coding in blocks
// 		let i_word_end, nl_word, at_word;
// 		let c_words_block = n_block_size;

// 		// front-code remainder of block
// 		if(0 !== n_words % n_block_size) {
// 			// use top word
// 			at_word = this.top_word;
// 			nl_word = at_word.length;

// 			// front-code remainder of block
// 			c_words_block = n_words % n_block_size;
// 		}

// 		for(;;) {
// 			// front-code remainder of block
// 			while(i_read < nl_fragment && (c_words_block++ < n_block_size)) {
// 				// fetch word to be coded
// 				i_word_end = a_indices[c_words_fragment++];
// 				let nl_test = i_word_end - i_read;
// 				let at_test = at_fragment.subarray(i_read, i_word_end);
// 				i_read = i_word_end;

// 				// how many chars to share
// 				let c_shared = 0;

// 				// scan until difference
// 				let n_limit = Math.min(nl_test, nl_word);
// 				do {
// 					if(at_test[c_shared] !== at_word[c_shared]) break;
// 				} while(++c_shared < n_limit);

// 				// write shared chars as vbyte
// 				k_contents.append(bkit.encode_pint(c_shared));

// 				// compute remaining number of bytes for code
// 				let nl_code = nl_test - c_shared;

// 				// write byte length of code
// 				k_contents.append(bkit.encode_pint(nl_code));

// 				// write rest of word
// 				k_contents.append(at_test.subarray(c_shared, c_shared+nl_code));

// 				// // null-terminate
// 				// k_contents.append(AB_ZERO);

// 				// update word
// 				at_word = at_test;
// 				nl_word = nl_test;
// 			}

// 			// finished whole block; write block index
// 			if(c_words_block === n_block_size) {
// 				a_block_indices.push(k_contents.write);
// 			}
// 			// block unfinished; save top word
// 			else if(c_words_block < n_block_size) {
// 				let i_uint_offset = at_word.byteOffset;
// 				this.top_word = new Uint8Array(at_word.buffer.slice(i_uint_offset, i_uint_offset+at_word.length));
// 			}

// 			// start of new block
// 			if(i_read < nl_fragment) {
// 				// fetch head word
// 				i_word_end = a_indices[c_words_fragment++];
// 				nl_word = i_word_end - i_read;
// 				at_word = at_fragment.subarray(i_read, i_word_end);
// 				i_read = i_word_end;

// 				// plainly encode head word in its entirety
// 				k_contents.append(at_word);

// 				// null-terminate
// 				k_contents.append(AB_ZERO);

// 				// reset block count
// 				c_words_block = 1;
// 			}
// 			// finished fragment
// 			else {
// 				break;
// 			}
// 		}

// 		// mismatch
// 		if(c_words_fragment !== n_words_fragment) {
// 			throw new Error('did not process expected number of items');
// 		}

// 		// update word count
// 		this.word_count += c_words_fragment;
// 	}

	nt_word_end(at_words, n_words_skip) {
		let i_end = 0;
		for(let i_word=0; i_word<n_words_skip; i_word++) {
			i_end = at_words.indexOf(0, i_end) + 1;
		}

		return i_end;
	}

	add_nt_word_list(at_fragment, n_words_fragment) {
	// debugger;
		let {
			block_size: n_block_size,
			block_indices: a_block_indices,
			contents: kb_contents,
			word_count: n_words,
		} = this;

		// length of fragment
		let nl_fragment = at_fragment.length;

		// empty fragment
		if(!nl_fragment) return;

		// read index in fragment
		let i_read = 0;

		// how many words have been processed in this fragment
		let c_words_fragment = 0;

		// this is the first local fragment
		if(!kb_contents.write) {
			// offset puts this amid an existing block
			let i_offset = this.offset;
			if(0 !== i_offset % n_block_size) {
				// jump to head word of new block
				let n_words_skip = n_block_size - (i_offset % n_block_size);

				// skipped all words in fragment
				let b_defer_all = false;
				if(n_words_skip >= n_words_fragment) {
					b_defer_all = true;
					n_words_skip = n_words_fragment;

					// save word count before exit
					this.word_count += n_words_fragment;
				}

				// index of end of this range to skip
				let i_range_end = this.nt_word_end(at_fragment, n_words_skip);

				// defer all words at once
				this.defer = {
					contents: at_fragment.slice(0, i_range_end),
					word_count: n_words_skip,
				};

				// update read index
				i_read = i_range_end;

				// defer all
				if(b_defer_all) return;
			}
		}

		// front-coding in blocks
		let i_word_end, nl_word, at_word;
		let c_words_block = n_block_size + 1;

		// front-code remainder of block
		if(0 !== n_words % n_block_size) {
			// use top word
			at_word = this.top_word;
			nl_word = at_word.length;

			// front-code remainder of block
			c_words_block = n_words % n_block_size;
		}

		// encode to buffer
		let kbe_contents = bkit.buffer_encoder.from_buffer(kb_contents);

		for(;;) {
			// front-code remainder of block
			while(i_read < nl_fragment && c_words_block < n_block_size) {
				// fetch word to be coded
				i_word_end = at_fragment.indexOf(0, i_read);
				let nl_test = i_word_end - i_read;
				let at_test = at_fragment.subarray(i_read, i_word_end);
				i_read = i_word_end + 1;

				// how many chars to share
				let c_shared = 0;

				// scan until difference
				let n_limit = Math.min(nl_test, nl_word);
				do {
					if(at_test[c_shared] !== at_word[c_shared]) break;
				} while(++c_shared < n_limit);

				// write shared chars as vbyte
				kbe_contents.vuint(c_shared);

				// compute remaining number of bytes for code
				let nl_code = nl_test - c_shared;

				// write byte length of code
				kbe_contents.vuint(nl_code);

				// write rest of word
				kb_contents.append(at_test.subarray(c_shared, c_shared+nl_code));

				// // null-terminate
				// k_contents.append(AB_ZERO);

				// update word
				at_word = at_test;
				nl_word = nl_test;

				c_words_block += 1;
			}

			// finished whole block; write block index
			if(c_words_block === n_block_size) {
				// debugger;
				a_block_indices.push(kb_contents.write);
			}
			// block unfinished; save top word
			else if(c_words_block < n_block_size) {
				let i_uint_offset = at_word.byteOffset;
				this.top_word = new Uint8Array(at_word.buffer.slice(i_uint_offset, i_uint_offset+at_word.length));
			}

			// start of new block
			if(i_read < nl_fragment) {
				// fetch head word
				i_word_end = at_fragment.indexOf(0, i_read) + 1;
				nl_word = i_word_end - i_read;
				at_word = at_fragment.subarray(i_read, i_word_end);
				i_read = i_word_end;

				// plainly encode head word in its entirety (including null-termination)
				kb_contents.append(at_word);

				// reset block count
				c_words_block = 1;
			}
			// finished fragment
			else {
				break;
			}
		}

		// mismatch
		if(i_read !== nl_fragment) {
			throw new Error('did not process expected number of items');
		}

		// update word count
		this.word_count += n_words_fragment;
	}
}

module.exports = chapter_front_coded;
