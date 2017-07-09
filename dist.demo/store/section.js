const bus = require('../main/bus.js');
class Section {
	constructor() {}
	produce() {}
	find() {}
}
class FrontCodedNullVByteSection {
	constructor(ab_dict, at_ref, n_count, n_block_k, i_offset) {
		Object.assign(this, {
			count: n_count,
			dict: ab_dict,
			ref: at_ref,
			k: n_block_k,
			offset: i_offset,
		});
	}
	// produce word having the given id (computes index relative to local variable `offset`)
	produce(i_term) {
			let {
				dict: ab_dict,
				ref: at_ref,
				k: n_block_k,
				offset: i_offset,
			} = this;
			let i_key = i_term - i_offset;
			let i_block = i_key >>> n_block_k;
			let i_word = i_block << n_block_k;
			let i_dict = at_ref[i_block];
			//
			let n_block_size = 1 << n_block_k;
			let a_block_idx = new Array(n_block_size);
			let a_shares = new Array(n_block_size);
			a_block_idx[0] = i_dict;
			a_shares[0] = 0;
			let i_block_idx = 0;
			// head word
			let nl_word = ab_dict.indexOf(0, i_dict) - i_dict;
			// head word shares no characters
			let n_share = 0;
			// word is within block
			if (i_word < i_key) {
				// skip over null char
				i_dict += 1;
				// skip words until arriving at target
				do {
					// skip over previous word
					i_dict += nl_word;
					// decode shared chars vbyte
					n_share = ab_dict[i_dict];
					if (n_share >= 0x80) {
						let h = bus.decode_pint(ab_dict, i_dict);
						n_share = h.v;
						i_dict = h.i;
					} else i_dict++;
					// save share value
					a_shares[++i_block_idx] = n_share;
					// decode length of word vbyte
					nl_word = ab_dict[i_dict];
					if (nl_word >= 0x80) {
						let h = bus.decode_pint(ab_dict, i_dict);
						nl_word = h.v;
						i_dict = h.i;
					} else i_dict++;
					// save index of word
					a_block_idx[i_block_idx] = i_dict;
				} while (++i_word < i_key);
			}
			// prep to construct word
			let ab_word = Buffer.allocUnsafe(n_share + nl_word);
			// copy known part from current word
			ab_dict.copy(ab_word, n_share, i_dict, i_dict + nl_word);
			// while needing to borrow from neighbor
			while (n_share > 0) {
				// check previous word's share value
				let n_prev_share = a_shares[--i_block_idx];
				// not interested!
				if (n_prev_share >= n_share) continue;
				// jump back to start of word content
				i_dict = a_block_idx[i_block_idx];
				// borrow from word
				ab_dict.copy(ab_word, n_prev_share, i_dict, i_dict + (n_share - n_prev_share));
				// adjust number of characters needed
				n_share = n_prev_share;
			}
			return ab_word;
		}
		* each() {
			let {
				dict: ab_dict,
				ref: at_ref,
				k: n_block_k,
				offset: i_offset,
			} = this;
			// number of items in each block
			let n_block_size = 1 << n_block_k;
			//
			let i_word = 0;
			let n_words = this.count;
			// scan all words
			let i_dict = 0;
			let n_dict = ab_dict.length;
			for (; i_dict < n_dict; i_dict++) {
				// head word length
				let nl_word = ab_dict.indexOf(0, i_dict) - i_dict;
				// head word
				let ab_base = ab_dict.slice(i_dict, i_dict + nl_word);
				yield ab_base;
				// advance pointer
				i_dict += nl_word;
				// increment word index
				i_word += 1;

				// each item within this block
				let i_block_idx_max = (n_words - i_word) >= n_block_size ? n_block_size - 1 : n_dict - i_dict;
				for (let i_block_idx = 1; i_block_idx <= i_block_idx_max; i_block_idx++) {
					// decode shared chars vbyte
					let n_share = ab_dict[i_dict];
					if (n_share >= 0x80) {
						let h = bus.decode_pint(ab_dict, i_dict);
						n_share = h.v;
						i_dict = h.i;
					} else i_dict++;
					// decode length of word vbyte
					nl_word = ab_dict[i_dict];
					if (nl_word >= 0x80) {
						let h = bus.decode_pint(ab_dict, i_dict);
						nl_word = h.v;
						i_dict = h.i;
					} else i_dict++;
					// allocate word
					let ab_word = Buffer.allocUnsafe(n_share + nl_word);
					// copy from base
					ab_base.copy(ab_word, 0, 0, n_share);
					try {
						ab_dict.copy(ab_word, n_share, i_dict, i_dict + nl_word);
					} catch (e) {
						debugger;
					}
					// word
					yield ab_word;
					// update base
					if (ab_word.length > ab_base.length) {
						ab_base = ab_word;
					} else {
						ab_word.copy(ab_base);
					}
					// advance pointer
					i_dict += nl_word;
					// increment word index
					i_word += 1;
				}
			}
		}
	search_fc_block(ab_word, i_block, b_skip_head) {
		let {
			dict: ab_dict,
			ref: at_ref,
			k: n_block_k,
			offset: i_offset,
		} = this;
		let n_block_size = 1 << n_block_k;
		// set dict position
		let i_dict = at_ref[i_block];
		// length of search word
		let nl_word = ab_word.length;
		// record indexes within block and share values
		let a_block_idx = new Array(n_block_size);
		let a_shares = new Array(n_block_size);
		a_block_idx[0] = i_dict;
		a_shares[0] = 0;
		// skip head word
		if (b_skip_head) {
			// jump to end of head word
			i_dict = ab_dict.indexOf(0, i_dict) + 1;
		}
		// check head word
		else {
			// find end of head
			let i_head_end = ab_dict.indexOf(0, i_dict);
			// lengths are match
			if (nl_word === (i_head_end - i_dict)) {
				compare_words: for (;;) {
					// compare words backwards
					let i_test_char_end = 1;
					do {
						if (ab_dict[i_head_end - i_test_char_end] !== ab_word[nl_word - i_test_char_end]) break compare_words;
					} while (++i_test_char_end <= nl_word);
					// match!
					return (i_block << n_block_k) + i_offset;
				}
			}
			// set pointer beyond end of head word
			i_dict = i_head_end + 1;
		}
		// start scanning at first front-coded word
		jump_search:
			for (let i_block_idx = 1; i_block_idx < n_block_size; i_block_idx++) {
				// fetch word's shared char count
				let n_share = ab_dict[i_dict];
				if (n_share >= 0x80) {
					let h = bus.decode_pint(ab_dict, i_dict);
					nl_share = h.v;
					i_dict = h.i;
				} else i_dict++;
				// save share value
				a_shares[i_block_idx] = n_share;
				// fetch word's length
				let nl_code = ab_dict[i_dict];
				if (nl_code >= 0x80) {
					let h = bus.decode_pint(ab_dict, i_dict);
					nl_code = h.v;
					i_dict = h.i;
				} else i_dict++;
				// save idx
				a_block_idx[i_block_idx] = i_dict;
				// skip over word
				i_dict += nl_code;
				// lengths are the same
				let nl_test = n_share + nl_code;
				if (nl_test === nl_word) {
					// compare suffix strings backwards
					let i_test_char_end = 1;
					do {
						if (ab_dict[i_dict - i_test_char_end] !== ab_word[nl_word - i_test_char_end]) continue jump_search;
					} while (++i_test_char_end <= nl_code);
					// compare prefix strings
					let i_borrow_idx = i_block_idx;
					// while needing to borrow from neighbor
					while (n_share > 0) {
						// check previous word's share value
						let n_prev_share = a_shares[--i_borrow_idx];
						// not interested!
						if (n_prev_share >= n_share) continue;
						// jump back to start of word content
						let i_borrow_dict = a_block_idx[i_borrow_idx] - n_prev_share;
						// compare words backwards
						for (let i_char = Math.min(nl_word, n_share) - 1; i_char >= n_prev_share; i_char--) {
							if (ab_dict[i_borrow_dict + i_char] !== ab_word[i_char]) continue jump_search;
						}
						// adjust number of characters needed
						n_share = n_prev_share;
					}
					// found the match
					return (i_block << n_block_k) + i_block_idx + i_offset;
				}
			}
		// word not in block
		return 0;
	}
	// search this section for the given word and return its id
	find(ab_word) {
		let {
			dict: ab_dict,
			ref: at_ref,
			k: n_block_k,
			offset: i_offset,
		} = this;
		// first character of word
		let x_word_0 = ab_word[0];
		// length of word
		let n_word = ab_word.length;
		// binary search for block
		let i_lo = 0;
		let i_hi = at_ref.length - 2;
		let i_hit_0 = -1;
		binary_search:
			for (;;) {
				// successfully isolated block
				if (i_lo === i_hi) {
					// search block for word
					return this.search_fc_block(ab_word, i_lo, (i_hit_0 === i_lo));
				}
				// failed to find word
				else if (i_lo > i_hi) {
					return 0;
				}
				// search for block
				else {
					// bias towards hi to avoid infinite loop
					let i_mid = (i_lo + i_hi + 1) >>> 1;
					// test first character of first word
					let i_test = at_ref[i_mid];
					let x_test = ab_dict[i_test];
					// miss low (could still be in this block)
					if (x_test < x_word_0) {
						i_lo = i_mid;
					}
					// miss high
					else if (x_test > x_word_0) {
						i_hi = i_mid - 1;
					}
					// hit first character
					else {
						i_hit_0 = i_mid;
						// compare remaining characters until there is a difference
						let i_char = 1;
						// don't bother setting upper limit to shorter word, if test is shorter it will hit null first
						while (i_char < n_word) {
							let x_test_n = ab_dict[i_test + i_char];
							let x_word_n = ab_word[i_char++];
							// miss low (could still be in this block)
							if (x_test_n < x_word_n) {
								i_lo = i_mid;
								continue binary_search;
							}
							// miss high (cannot possibly be in this block)
							else if (x_test_n > x_word_n) {
								i_hi = i_mid - 1;
								continue binary_search;
							}
						}
						// test is a substring of word (miss low - could still be in this block)
						if (i_char < n_word) {
							i_lo = i_mid;
							continue binary_search;
						}
						// word is a substring of test (miss high)
						else if (ab_dict[i_test + i_char] !== 0) {
							i_hi = i_mid - 1;
							continue binary_search;
						}
						// found exact word!
						else {
							return i_offset + (i_mid << n_block_k);
						}
					}
				}
			}
		// no match found in dict
		return 0;
	}
	// search this section for the lowest indexed word with the given prefix and return its id
	find_prefix_low(ab_prefix) {
		let {
			dict: ab_dict,
			ref: at_ref,
			k: n_block_k,
			offset: i_offset,
		} = this;
		// first character of prefix
		let x_prefix_0 = ab_prefix[0];
		// length of prefix
		let n_prefix = ab_prefix.length;
		// binary search for block
		let i_lo = 0;
		let i_hi = at_ref.length - 2;
		let i_hit_0 = -1;
		let b_hit_hi = false;
		binary_search:
			for (;;) {
				// successfully isolated block
				if (i_lo === i_hi) {
					// first word in block was a prefix hit, making it the lowest indexed matching word
					if (b_hit_hi) {
						return i_offset + (i_lo << n_block_k);
					}
					// search block for prefix
					else {
						return this.search_fc_block_prefix_low(ab_prefix, i_lo);
					}
				}
				// first word either in lo block or head of hi
				else if (b_hit_hi && i_lo + 1 === i_hi) {
					// search block for prefix
					let i_find = this.search_fc_block_prefix_low(ab_prefix, i_lo);
					// return index if it was found in block; otherwise the first word of high
					return i_find || (i_offset + (i_hi << n_block_k));
				}
				// failed to find prefix
				else if (i_lo > i_hi) {
					return 0;
				}
				// search for block
				else {
					// bias towards lo to find lower bound
					let i_mid = (i_lo + i_hi + 1) >>> 1;
					// test first character of first prefix
					let i_test = at_ref[i_mid];
					let x_test = ab_dict[i_test];
					// miss low (could still be in this block)
					if (x_test < x_prefix_0) {
						i_lo = i_mid;
					}
					// miss high
					else if (x_test > x_prefix_0) {
						i_hi = i_mid - 1;
					}
					// hit first character
					else {
						i_hit_0 = i_mid;
						// compare remaining characters until there is a difference
						let i_char = 1;
						// don't bother setting upper limit to shorter prefix, if test is shorter it will hit null first
						while (i_char < n_prefix) {
							let x_test_n = ab_dict[i_test + i_char];
							let x_prefix_n = ab_prefix[i_char++];
							// miss low (could still be in this block)
							if (x_test_n < x_prefix_n) {
								i_lo = i_mid;
								continue binary_search;
							}
							// miss high (cannot possibly be in this block)
							else if (x_test_n > x_prefix_n) {
								i_hi = i_mid - 1;
								continue binary_search;
							}
						}
						// prefix is a substring of test (either hit or miss high)
						if (ab_dict[i_test + i_char] !== 0) {
							b_hit_hi = true;
							i_hi = i_mid;
							continue binary_search;
						}
						// found a term that matches prefix
						else {
							return i_offset + (i_mid << n_block_k);
						}
					}
				}
			}
		// no match found in dict
		return 0;
	}
	search_fc_block_prefix_low(ab_prefix, i_block) {
		let {
			dict: ab_dict,
			ref: at_ref,
			k: n_block_k,
			offset: i_offset,
		} = this;
		let n_block_size = 1 << n_block_k;
		// set dict position
		let i_dict = at_ref[i_block];
		// length of search prefix
		let nl_prefix = ab_prefix.length;
		// scan first word
		compare_head: {
			let i_char = 0;
			while (i_char < nl_prefix) {
				if (ab_dict[i_dict + i_char] !== ab_prefix[i_char++]) break compare_head;
			}
			// first word is a match
			return (i_block << n_block_k) + i_offset;
		}
		// record indexes within block and share values
		let a_block_idx = new Array(n_block_size);
		let a_shares = new Array(n_block_size);
		a_block_idx[0] = i_dict;
		a_shares[0] = 0;
		// jump to end of head word
		i_dict = ab_dict.indexOf(0, i_dict) + 1;
		// start scanning at first front-coded word
		let nl_code = 0;
		jump_search:
			for (let i_block_idx = 1; i_block_idx < n_block_size; i_block_idx++, i_dict += nl_code) {
				// fetch word's shared char count
				let n_share = ab_dict[i_dict];
				if (n_share >= 0x80) {
					let h = bus.decode_pint(ab_dict, i_dict);
					n_share = h.v;
					i_dict = h.i;
				} else i_dict++;
				// save share value
				a_shares[i_block_idx] = n_share;
				// fetch word's length
				nl_code = ab_dict[i_dict];
				if (nl_code >= 0x80) {
					let h = bus.decode_pint(ab_dict, i_dict);
					nl_code = h.v;
					i_dict = h.i;
				} else i_dict++;
				// save idx
				a_block_idx[i_block_idx] = i_dict;
				// word is long enough to contain prefix
				let nl_test = n_share + nl_code;
				if (nl_test >= nl_prefix) {
					// match prefix to word backwards
					let i_test_char = nl_prefix;
					while (--i_test_char >= n_share) {
						if (ab_dict[i_dict - n_share + i_test_char] !== ab_prefix[i_test_char]) continue jump_search;
					}
					// compare prefix strings
					let i_borrow_idx = i_block_idx;
					// while needing to borrow from neighbor
					while (n_share > 0) {
						// check previous word's share value
						let n_prev_share = a_shares[--i_borrow_idx];
						// not interested!
						if (n_prev_share >= n_share) continue;
						// jump back to start of word content
						let i_borrow_dict = a_block_idx[i_borrow_idx] - n_prev_share;
						// compare words backwards
						for (let i_char = Math.min(nl_prefix, n_share) - 1; i_char >= n_prev_share; i_char--) {
							if (ab_dict[i_borrow_dict + i_char] !== ab_prefix[i_char]) continue jump_search;
						}
						// adjust number of characters needed
						n_share = n_prev_share;
					}
					// found the lowest match
					return (i_block << n_block_k) + i_block_idx + i_offset;
				}
			}
		// prefix not in block
		return 0;
	}
	// search this section for the highest indexed word with the given prefix and return its id
	find_prefix_high(ab_prefix) {
		let {
			dict: ab_dict,
			ref: at_ref,
			k: n_block_k,
			offset: i_offset,
		} = this;
		// first character of prefix
		let x_prefix_0 = ab_prefix[0];
		// length of prefix
		let n_prefix = ab_prefix.length;
		// binary search for block
		let i_lo = 0;
		let i_hi = at_ref.length - 2;
		let i_hit_0 = -1;
		binary_search:
			for (;;) {
				// successfully isolated block
				if (i_lo === i_hi) {
					// search block for prefix
					return this.search_fc_block_prefix_high(ab_prefix, i_lo, (i_hit_0 === i_lo));
				}
				// failed to find prefix
				else if (i_lo > i_hi) {
					return 0;
				}
				// search for block
				else {
					// bias towards hi to avoid infinite loop
					let i_mid = (i_lo + i_hi + 1) >>> 1;
					// test first character of first prefix
					let i_test = at_ref[i_mid];
					let x_test = ab_dict[i_test];
					// miss low (could still be in this block)
					if (x_test < x_prefix_0) {
						i_lo = i_mid;
					}
					// miss high
					else if (x_test > x_prefix_0) {
						i_hi = i_mid - 1;
					}
					// hit first character
					else {
						i_hit_0 = i_mid;
						// compare remaining characters until there is a difference
						let i_char = 1;
						// don't bother setting upper limit to shorter prefix, if test is shorter it will hit null first
						while (i_char < n_prefix) {
							let x_test_n = ab_dict[i_test + i_char];
							let x_prefix_n = ab_prefix[i_char++];
							// miss low (could still be in this block)
							if (x_test_n < x_prefix_n) {
								i_lo = i_mid;
								continue binary_search;
							}
							// miss high (cannot possibly be in this block)
							else if (x_test_n > x_prefix_n) {
								i_hi = i_mid - 1;
								continue binary_search;
							}
						}
						// prefix is a substring of test (either hit or miss low)
						if (ab_dict[i_test + i_char] !== 0) {
							i_lo = i_mid;
							continue binary_search;
						}
						// found a term that matches prefix
						else {
							return i_offset + (i_mid << n_block_k);
						}
					}
				}
			}
		// no match found in dict
		return 0;
	}
	search_fc_block_prefix_high(ab_prefix, i_block) {
		let {
			dict: ab_dict,
			ref: at_ref,
			k: n_block_k,
			offset: i_offset,
		} = this;
		let n_block_size = 1 << n_block_k;
		// set dict position
		let i_dict = at_ref[i_block];
		// length of search prefix
		let nl_prefix = ab_prefix.length;
		//
		let i_highest = 0;
		// scan first word
		compare_head: {
			let i_char = 0;
			while (i_char < nl_prefix) {
				if (ab_dict[i_dict + i_char] !== ab_prefix[i_char++]) break compare_head;
			}
			// first word is a match
			i_highest = (i_block << n_block_k) + i_offset;
		}
		// record indexes within block and share values
		let a_block_idx = new Array(n_block_size);
		let a_shares = new Array(n_block_size);
		a_block_idx[0] = i_dict;
		a_shares[0] = 0;
		// jump to end of head word
		i_dict = ab_dict.indexOf(0, i_dict) + 1;
		// start scanning at first front-coded word
		let nl_code = 0;
		jump_search:
			for (let i_block_idx = 1; i_block_idx < n_block_size; i_block_idx++, i_dict += nl_code) {
				// fetch word's shared char count
				let n_share = ab_dict[i_dict];
				if (n_share >= 0x80) {
					let h = bus.decode_pint(ab_dict, i_dict);
					n_share = h.v;
					i_dict = h.i;
				} else i_dict++;
				// save share value
				a_shares[i_block_idx] = n_share;
				// fetch word's length
				nl_code = ab_dict[i_dict];
				if (nl_code >= 0x80) {
					let h = bus.decode_pint(ab_dict, i_dict);
					nl_code = h.v;
					i_dict = h.i;
				} else i_dict++;
				// save idx
				a_block_idx[i_block_idx] = i_dict;
				// word is long enough to contain prefix
				let nl_test = n_share + nl_code;
				if (nl_test >= nl_prefix) {
					// match prefix to word backwards
					let i_test_char = nl_prefix;
					while (--i_test_char >= n_share) {
						if (ab_dict[i_dict - n_share + i_test_char] !== ab_prefix[i_test_char]) {
							// not matching anymore, last match is highest
							if (i_highest) {
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
					while (n_share > 0) {
						// check previous word's share value
						let n_prev_share = a_shares[--i_borrow_idx];
						// not interested!
						if (n_prev_share >= n_share) continue;
						// jump back to start of word content
						let i_borrow_dict = a_block_idx[i_borrow_idx] - n_prev_share;
						// compare words backwards
						for (let i_char = Math.min(nl_prefix, n_share) - 1; i_char >= n_prev_share; i_char--) {
							if (ab_dict[i_borrow_dict + i_char] !== ab_prefix[i_char]) {
								// not matching anymore, last match is highest
								if (i_highest) {
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
					i_highest = (i_block << n_block_k) + i_block_idx + i_offset;
				}
			}
		// return highest index found
		return i_highest;
	}
}
module.exports = {
	front_coded_null_vbyte_section(ab_dict, at_ref, n_count, n_block_k, i_offset) {
		return new FrontCodedNullVByteSection(ab_dict, at_ref, n_count, n_block_k, i_offset);
	},
};