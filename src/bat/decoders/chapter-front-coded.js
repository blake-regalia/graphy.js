const interfaces = require('./interfaces.js');
const bus = require('../../main/bus.js');


class chapter_front_coded extends interfaces.chapter {
	constructor(at_payload, s_chapter, k_dictionary) {
		super();

		let kbd_header = new bus.buffer_decoder(at_payload);

		// block k
		let n_block_k = kbd_header.vuint();

		// word count
		let n_words = kbd_header.vuint();

		// indices
		let at_indices = kbd_header.typed_array();

		// contents (from remainder)
		let at_contents = new Uint8Array(kbd_header.sub());

		Object.assign(this, {
			offset: 1,
			block_k: n_block_k,
			word_count: n_words,
			indices: at_indices,
			contents: at_contents,
		});
	}

	produce(i_term) {
		let {
			block_k: n_block_k,
			indices: at_indices,
			contents: at_contents,
		} = this;

		let i_key = i_term - this.offset;

		let i_block = i_key >>> n_block_k;
		let i_word = i_block << n_block_k;
		let i_contents = at_indices[i_block];

		//
		let n_block_size = 1 << n_block_k;
		let a_block_idx = new Array(n_block_size);
		let a_shares = new Array(n_block_size);
		a_block_idx[0] = i_contents;
		a_shares[0] = 0;
		let i_block_idx = 0;

		// head word
		let nl_word = at_contents.indexOf(0, i_contents) - i_contents;

		// head word shares no characters
		let n_share = 0;

		// word is within block
		if(i_word < i_key) {
			// skip over null char
			i_contents += 1;

			// skip words until arriving at target
			let kbd_contents = new bus.buffer_decoder(at_contents);
			kbd_contents.read = i_contents;
			do {
				// skip over previous word
				kbd_contents.read += nl_word;

				// save share chars value
				a_shares[++i_block_idx] = n_share = kbd_contents.vuint();

				// save length of word
				nl_word = kbd_contents.vuint();

				// save index of word
				a_block_idx[i_block_idx] = kbd_contents.read;
			} while(++i_word < i_key);

			// update index
			i_contents = kbd_contents.read;
		}

		// prep to construct word
		let at_word = new Uint8Array(n_share + nl_word);

		// copy known part from current word
		at_word.set(at_contents.subarray(i_contents, i_contents+nl_word), n_share);

		// while needing to borrow from neighbor
		while(n_share > 0) {
			// check previous word's share value
			let n_prev_share = a_shares[--i_block_idx];

			// not interested!
			if(n_prev_share >= n_share) continue;

			// jump back to start of word content
			i_contents = a_block_idx[i_block_idx];

			// borrow from word
			at_word.set(at_contents.subarray(i_contents, i_contents+(n_share-n_prev_share)), n_prev_share);

			// adjust number of characters needed
			n_share = n_prev_share;
		}

		return at_word;
	}

	find(at_word) {
		let {
			block_k: n_block_k,
			indices: at_indices,
			contents: at_contents,
		} = this;

		// first character of word
		let x_word_0 = at_word[0];

		// length of word
		let nl_word = at_word.length;

		// binary search for block
		let i_lo = 0;
		let i_hi = this.word_count - 2;
		let i_hit_0 = -1;
		binary_search:
		for(;;) {
			// successfully isolated block
			if(i_lo === i_hi) {
				// search block for word
				return this.search_fc_block(at_word, i_lo, (i_hit_0 === i_lo));
			}
			// failed to find word
			else if(i_lo > i_hi) {
				return 0;
			}
			// search for block
			else {
				// bias towards hi to avoid infinite loop
				let i_mid = (i_lo + i_hi + 1) >>> 1;

				// test first character of first word
				let i_test = at_indices[i_mid];
				let x_test = at_contents[i_test];

				// miss low (could still be in this block)
				if(x_test < x_word_0) {
					i_lo = i_mid;
				}
				// miss high
				else if(x_test > x_word_0) {
					i_hi = i_mid - 1;
				}
				// hit first character
				else {
					i_hit_0 = i_mid;

					// compare remaining characters until there is a difference
					let i_char = 1;

					// don't bother setting upper limit to shorter word, if test is shorter it will hit null first
					while(i_char < nl_word) {
						let x_test_n = at_contents[i_test+i_char];
						let x_word_n = at_word[i_char++];

						// miss low (could still be in this block)
						if(x_test_n < x_word_n) {
							i_lo = i_mid;
							continue binary_search;
						}
						// miss high (cannot possibly be in this block)
						else if(x_test_n > x_word_n) {
							i_hi = i_mid - 1;
							continue binary_search;
						}
					}

					// test is a substring of word (miss low - could still be in this block)
					if(i_char < nl_word) {
						i_lo = i_mid;
						continue binary_search;
					}
					// word is a substring of test (miss high)
					else if(at_contents[i_test+i_char] !== 0) {
						i_hi = i_mid - 1;
						continue binary_search;
					}
					// found exact word!
					else {
						return this.offset + (i_mid << n_block_k);
					}
				}
			}
		}
	}


	search_fc_block(at_word, i_block, b_skip_head) {
		let {
			block_k: n_block_k,
			indices: at_indices,
			contents: at_contents,
		} = this;

		let n_block_size = 1 << n_block_k;

		// set dict position
		let i_contents = at_indices[i_block];

		// length of search word
		let nl_word = at_word.length;

		// record indexes within block and share values
		let a_block_idx = new Array(n_block_size);
		let a_shares = new Array(n_block_size);
		a_block_idx[0] = i_contents;
		a_shares[0] = 0;

		// skip head word
		if(b_skip_head) {
			// jump to end of head word
			i_contents = at_contents.indexOf(0, i_contents) + 1;
		}
		// check head word
		else {
			// find end of head
			let i_head_end = at_contents.indexOf(0, i_contents);

			// lengths are match
			if(nl_word === (i_head_end - i_contents)) {
				compare_words:
				for(;;) {
					// compare words backwards
					let i_test_char_end = 1;
					do {
						if(at_contents[i_head_end-i_test_char_end] !== at_word[nl_word-i_test_char_end]) break compare_words;
					} while(++i_test_char_end <= nl_word);

					// match!
					return (i_block << n_block_k) + this.offset;
				}
			}

			// set pointer beyond end of head word
			i_contents = i_head_end + 1;
		}

		// decode buffer
		let kbd_contents = new bus.buffer_decoder(at_contents);

		// start scanning at first front-coded word
		jump_search:
		for(let i_block_idx=1; i_block_idx<n_block_size; i_block_idx++) {
			// set contents read position
			kbd_contents.read = i_contents;

			// fetch and save word's shared char count
			let n_share = a_shares[i_block_idx] = kbd_contents.vuint();

			// fetch word's length
			let nl_code = kbd_contents.vuint();

			// save idx
			a_block_idx[i_block_idx] = i_contents = kbd_contents.read;

			// skip over word
			i_contents += nl_code;

			// lengths are the same
			let nl_test = n_share + nl_code;
			if(nl_test === nl_word) {
				// compare suffix strings backwards
				let i_test_char_end = 1;
				do {
					if(at_contents[i_contents-i_test_char_end] !== at_word[nl_word-i_test_char_end]) continue jump_search;
				} while(++i_test_char_end <= nl_code);

				// compare prefix strings
				let i_borrow_idx = i_block_idx;

				// while needing to borrow from neighbor
				while(n_share > 0) {
					// check previous word's share value
					let n_prev_share = a_shares[--i_borrow_idx];

					// not interested!
					if(n_prev_share >= n_share) continue;

					// jump back to start of word content
					let i_borrow_dict = a_block_idx[i_borrow_idx] - n_prev_share;

					// compare words backwards
					for(let i_char=Math.min(nl_word, n_share)-1; i_char>=n_prev_share; i_char--) {
						if(at_contents[i_borrow_dict+i_char] !== at_word[i_char]) continue jump_search;
					}

					// adjust number of characters needed
					n_share = n_prev_share;
				}

				// found the match
				return (i_block << n_block_k) + i_block_idx + this.offset;
			}
		}

		// word not in block
		return 0;
	}


	// search this section for the lowest indexed word with the given prefix and return its id
	find_prefix_low(at_prefix) {
		let {
			block_k: n_block_k,
			indices: at_indices,
			contents: at_contents,
		} = this;

		// first character of prefix
		let x_prefix_0 = at_prefix[0];

		// length of prefix
		let n_prefix = at_prefix.length;

		// binary search for block
		let i_lo = 0;
		let i_hi = at_indices.length - 2;
		let i_hit_0 = -1;
		let b_hit_hi = false;
		binary_search:
		for(;;) {
			// successfully isolated block
			if(i_lo === i_hi) {
				// first word in block was a prefix hit, making it the lowest indexed matching word
				if(b_hit_hi) {
					return this.offset + (i_lo << n_block_k);
				}
				// search block for prefix
				else {
					return this.search_fc_block_prefix_low(at_prefix, i_lo);
				}
			}
			// first word either in lo block or head of hi
			else if(b_hit_hi && i_lo+1 === i_hi) {
				// search block for prefix
				let i_find = this.search_fc_block_prefix_low(at_prefix, i_lo);

				// return index if it was found in block; otherwise the first word of high
				return i_find || (this.offset + (i_hi << n_block_k));
			}
			// failed to find prefix
			else if(i_lo > i_hi) {
				return 0;
			}
			// search for block
			else {
				// bias towards lo to find lower bound
				let i_mid = (i_lo + i_hi + 1) >>> 1;

				// test first character of first prefix
				let i_test = at_indices[i_mid];
				let x_test = at_contents[i_test];

				// miss low (could still be in this block)
				if(x_test < x_prefix_0) {
					i_lo = i_mid;
				}
				// miss high
				else if(x_test > x_prefix_0) {
					i_hi = i_mid - 1;
				}
				// hit first character
				else {
					i_hit_0 = i_mid;

					// compare remaining characters until there is a difference
					let i_char = 1;

					// don't bother setting upper limit to shorter prefix, if test is shorter it will hit null first
					while(i_char < n_prefix) {
						let x_test_n = at_contents[i_test+i_char];
						let x_prefix_n = at_prefix[i_char++];

						// miss low (could still be in this block)
						if(x_test_n < x_prefix_n) {
							i_lo = i_mid;
							continue binary_search;
						}
						// miss high (cannot possibly be in this block)
						else if(x_test_n > x_prefix_n) {
							i_hi = i_mid - 1;
							continue binary_search;
						}
					}

					// prefix is a substring of test (either hit or miss high)
					if(at_contents[i_test+i_char] !== 0) {
						b_hit_hi = true;
						i_hi = i_mid;
						continue binary_search;
					}
					// found a term that matches prefix
					else {
						return this.offset + (i_mid << n_block_k);
					}
				}
			}
		}
	}

	search_fc_block_prefix_low(at_prefix, i_block) {
		let {
			block_k: n_block_k,
			indices: at_indices,
			contents: at_contents,
		} = this;

		let n_block_size = 1 << n_block_k;

		// set dict position
		let i_contents = at_indices[i_block];

		// length of search prefix
		let nl_prefix = at_prefix.length;

		// scan first word
		compare_head: {
			let i_char = 0;
			while(i_char < nl_prefix) {
				if(at_contents[i_contents+i_char] !== at_prefix[i_char++]) break compare_head;
			}

			// first word is a match
			return (i_block << n_block_k) + this.offset;
		}

		// record indexes within block and share values
		let a_block_idx = new Array(n_block_size);
		let a_shares = new Array(n_block_size);
		a_block_idx[0] = i_contents;
		a_shares[0] = 0;

		// jump to end of head word
		i_contents = at_contents.indexOf(0, i_contents) + 1;

		// decode buffer
		let kbd_contents = new bus.buffer_decoder(at_contents);

		// start scanning at first front-coded word
		let nl_code = 0;
		jump_search:
		for(let i_block_idx=1; i_block_idx<n_block_size; i_block_idx++, i_contents+=nl_code) {
			// set contents read position
			kbd_contents.read = i_contents;

			// fetch and save word's shared char count
			let n_share = a_shares[i_block_idx] = kbd_contents.vuint();

			// fetch word's length
			nl_code = kbd_contents.vuint();

			// save idx
			a_block_idx[i_block_idx] = i_contents = kbd_contents.read;

			// word is long enough to contain prefix
			let nl_test = n_share + nl_code;
			if(nl_test >= nl_prefix) {
				// match prefix to word backwards
				let i_test_char = nl_prefix;
				while(--i_test_char >= n_share) {
					if(at_contents[i_contents-n_share+i_test_char] !== at_prefix[i_test_char]) continue jump_search;
				}

				// compare prefix strings
				let i_borrow_idx = i_block_idx;

				// while needing to borrow from neighbor
				while(n_share > 0) {
					// check previous word's share value
					let n_prev_share = a_shares[--i_borrow_idx];

					// not interested!
					if(n_prev_share >= n_share) continue;

					// jump back to start of word content
					let i_borrow_dict = a_block_idx[i_borrow_idx] - n_prev_share;

					// compare words backwards
					for(let i_char=Math.min(nl_prefix, n_share)-1; i_char>=n_prev_share; i_char--) {
						if(at_contents[i_borrow_dict+i_char] !== at_prefix[i_char]) continue jump_search;
					}

					// adjust number of characters needed
					n_share = n_prev_share;
				}

				// found the lowest match
				return (i_block << n_block_k) + i_block_idx + this.offset;
			}
		}

		// prefix not in block
		return 0;
	}

	// search this section for the highest indexed word with the given prefix and return its id
	find_prefix_high(at_prefix) {
		let {
			block_k: n_block_k,
			indices: at_indices,
			contents: at_contents,
		} = this;

		// first character of prefix
		let x_prefix_0 = at_prefix[0];

		// length of prefix
		let n_prefix = at_prefix.length;

		// binary search for block
		let i_lo = 0;
		let i_hi = at_indices.length - 2;
		let i_hit_0 = -1;
		binary_search:
		for(;;) {
			// successfully isolated block
			if(i_lo === i_hi) {
				// search block for prefix
				return this.search_fc_block_prefix_high(at_prefix, i_lo, (i_hit_0 === i_lo));
			}
			// failed to find prefix
			else if(i_lo > i_hi) {
				return 0;
			}
			// search for block
			else {
				// bias towards hi to avoid infinite loop
				let i_mid = (i_lo + i_hi + 1) >>> 1;

				// test first character of first prefix
				let i_test = at_indices[i_mid];
				let x_test = at_contents[i_test];

				// miss low (could still be in this block)
				if(x_test < x_prefix_0) {
					i_lo = i_mid;
				}
				// miss high
				else if(x_test > x_prefix_0) {
					i_hi = i_mid - 1;
				}
				// hit first character
				else {
					i_hit_0 = i_mid;

					// compare remaining characters until there is a difference
					let i_char = 1;

					// don't bother setting upper limit to shorter prefix, if test is shorter it will hit null first
					while(i_char < n_prefix) {
						let x_test_n = at_contents[i_test+i_char];
						let x_prefix_n = at_prefix[i_char++];

						// miss low (could still be in this block)
						if(x_test_n < x_prefix_n) {
							i_lo = i_mid;
							continue binary_search;
						}
						// miss high (cannot possibly be in this block)
						else if(x_test_n > x_prefix_n) {
							i_hi = i_mid - 1;
							continue binary_search;
						}
					}

					// prefix is a substring of test (either hit or miss low)
					if(at_contents[i_test+i_char] !== 0) {
						i_lo = i_mid;
						continue binary_search;
					}
					// found a term that matches prefix
					else {
						return this.offset + (i_mid << n_block_k);
					}
				}
			}
		}
	}

	search_fc_block_prefix_high(at_prefix, i_block) {
		let {
			block_k: n_block_k,
			indices: at_indices,
			contents: at_contents,
		} = this;

		let n_block_size = 1 << n_block_k;

		// set dict position
		let i_contents = at_indices[i_block];

		// length of search prefix
		let nl_prefix = at_prefix.length;

		//
		let i_highest = 0;

		// scan first word
		compare_head: {
			let i_char = 0;
			while(i_char < nl_prefix) {
				if(at_contents[i_contents+i_char] !== at_prefix[i_char++]) break compare_head;
			}

			// first word is a match
			i_highest = (i_block << n_block_k) + this.offset;
		}

		// record indexes within block and share values
		let a_block_idx = new Array(n_block_size);
		let a_shares = new Array(n_block_size);
		a_block_idx[0] = i_contents;
		a_shares[0] = 0;

		// jump to end of head word
		i_contents = at_contents.indexOf(0, i_contents) + 1;

		//
		let kbd_contents = new bus.buffer_decoder(at_contents);

		// start scanning at first front-coded word
		let nl_code = 0;
		jump_search:
		for(let i_block_idx=1; i_block_idx<n_block_size; i_block_idx++, i_contents+=nl_code) {
			// set contents read position
			kbd_contents.read = i_contents;

			// fetch and save word's shared char count
			let n_share = a_shares[i_block_idx] = kbd_contents.vuint();

			// fetch word's length
			nl_code = kbd_contents.vuint();

			// save idx
			a_block_idx[i_block_idx] = i_contents = kbd_contents.read;

			// word is long enough to contain prefix
			let nl_test = n_share + nl_code;
			if(nl_test >= nl_prefix) {
				// match prefix to word backwards
				let i_test_char = nl_prefix;
				while(--i_test_char >= n_share) {
					if(at_contents[i_contents-n_share+i_test_char] !== at_prefix[i_test_char]) {
						// not matching anymore, last match is highest
						if(i_highest) {
							return i_highest;
						}
						// haven't matched yet, continue searching
						else {
							continue jump_search;
						}
					}
				}

				// compare prefix strings
				let i_borrow_idx = i_block_idx;

				// while needing to borrow from neighbor
				while(n_share > 0) {
					// check previous word's share value
					let n_prev_share = a_shares[--i_borrow_idx];

					// not interested!
					if(n_prev_share >= n_share) continue;

					// jump back to start of word content
					let i_borrow_dict = a_block_idx[i_borrow_idx] - n_prev_share;

					// compare words backwards
					for(let i_char=Math.min(nl_prefix, n_share)-1; i_char>=n_prev_share; i_char--) {
						if(at_contents[i_borrow_dict+i_char] !== at_prefix[i_char]) {
							// not matching anymore, last match is highest
							if(i_highest) {
								return i_highest;
							}
							// haven't matched yet, continue searching
							else {
								continue jump_search;
							}
						}
					}

					// adjust number of characters needed
					n_share = n_prev_share;
				}

				// update highest match
				i_highest = (i_block << n_block_k) + i_block_idx + this.offset;
			}
		}

		// return highest index found
		return i_highest;
	}
}

module.exports = {
	structures: {
		'http://bat-rdf.link/structure/chapter/front-coded/1.0': chapter_front_coded,
	},
};
