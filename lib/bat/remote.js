const bus = require('./bus.js');

class resource_connection {
	constructor() {

	}
}

class http_get_resource_connection extends resource_connection {
	constructor(p_url, h_headers={}) {
		super();

		Object.assign(this, {
			url: p_url,
			mode: p_url.startsWith(location.origin)? 'same-origin': 'cors',
			headers: h_headers,
			bytes: Infinity,
		});
	}

	async size() {
		if(Infinity !== this.bytes) return this.bytes;

		let d_res = await fetch(new Request(this.url, {
			method: 'HEAD',
			mode: this.mode,
			redirect: 'error',
		}))
			.catch((e_res) => {
				debugger;
				throw new Error(e_res);
			});

		debugger;
		console.info(d_res);
	}

	async fetch(i_lo, i_hi) {
		let d_res = await fetch(new Request(this.url, {
			method: 'GET',
			mode: this.mode,
			redirect: 'error',
			headers: Object.assign({}, this.headers, {
				Range: 'bytes='+i_lo+'-'+i_hi,
			}),
		}))
			.catch((e_res) => {
				debugger;
				throw new Error(e_res);
			});

		debugger;
		console.info(d_res);
	}

	async fetch_ranges(a_ranges) {
		let d_res = await fetch(new Request(this.url, {
			method: 'GET',
			headers: Object.assign({}, this.headers, {
				Range: 'bytes='+a_ranges.map(a => a[0]+'-'+a[1]).join(', '),
			}),
		}))
			.catch((e_res) => {
				debugger;
				throw new Error(e_res);
			});

		debugger;
		console.info(d_res);
	}
}

class composite_resource_connection extends resource_connection {
	contructor() {
	}
}

class auto_switching_composite_resource_connection extends composite_resource_connection {
	constructor(a_krcs=[]) {
		super();

		let a_validations = [];
		for(let i_range=0; i_range<n_validations; i_range++) {

			a_validations.push();
		}

		Object.assign(this, {
			krcs: [],
			validations: a_validations,
		});

		this.add(a_krcs);
	}

	async add(a_krcs_add) {
		let a_krcs = this.krcs;
		if(!a_krcs.length) {
			return Promise.race(a_krcs_add.map(krc => krc.size()));
		}
	}

	async validate(krc) {
		Promise.race([
			krc.size(),
		]);
	}

	async fetch() {

	}
}

class remote_buffer {
	constructor(krc, i_offset, nl_buffer) {
		Object.assign(this, {
			krc: krc,
			offset: i_offset,
			bytes: nl_buffer,
			chunks: [],
		});
	}

	// merges given chunk value with chunks on left and right sides
	wedge(at_value, i_left) {
		let a_chunks = this.chunks;

		let {
			lo: i_lo,
			value: at_left,
		} = a_chunks[i_left];

		let {
			hi: i_hi,
			value: at_right,
		} = a_chunks[i_left+1];

		let nl_left = at_left.length;
		let nl_wedge = at_value.length;
		let nl_right = at_right.length;
		let nl_chunk = nl_left + nl_wedge + nl_right;
		let at_chunk = new Uint8Array(nl_chunk);
		at_chunk.set(at_left);
		at_chunk.set(at_value, nl_left);
		at_chunk.set(at_right, nl_left+nl_wedge);

		// create new chunk
		let h_chunk = {
			lo: i_lo,
			hi: i_hi,
			value: at_chunk,
		};

		// replace 2 chunks with 1: remove and insert
		a_chunks.splice(i_left, 2, h_chunk);

		return h_chunk;
	}

	// merges multiples chunk values with chunks on left and right sides
	wedges(a_values, a_ranges, i_left) {
		let a_chunks = this.chunks;
		let nl_ranges = a_ranges.length;

		let nl_output = 0;
		for(let i_range=0, i_chunk=i_left; i_range<nl_ranges; i_range++, i_chunk++) {
			nl_output += a_chunks[i_left];
		}

		for(let i_value=0; i_value<nl_ranges; i_value++) {
			nl_output += a_values[i_value].length;
		}

		let at_output = new Uint8Array(nl_output);
		let i_write = 0;
		for(let i_value=0, i_chunk=i_left; i_value<nl_ranges; i_value++, i_chunk++) {
			let at_chunk = a_chunks[i_chunk];
			at_output.set(at_chunk, i_write);
			i_write += at_chunk.length;

			let at_value = a_values[i_value];
			at_output.set(at_value, i_write);
			i_write += at_value.length;
		}

		// terminal chunk
		at_output.set(a_chunks[i_left+nl_ranges], i_write);

		// create output
		let h_output = {
			lo: a_ranges[0].lo,
			hi: a_ranges[nl_ranges].hi,
			value: at_output,
		};

		// replace n chunks with 1: remove and insert
		a_chunks.splice(i_left, nl_ranges+1, h_output);

		return h_output;
	}

	// merges given chunk value with chunk to the right
	merge_left(at_value, i_left) {
		let h_chunk = this.chunks[i_left];

		let nl_add = at_value.length;
		let at_left = h_chunk.value;
		let nl_left = at_left.length;
		let at_chunk = new Uint8Array(nl_left+nl_add);
		at_chunk.set(at_left);
		at_chunk.set(at_value, nl_left);

		// merge into chunk
		h_chunk.hi += nl_add;
		h_chunk.value = at_chunk;

		return h_chunk;
	}

	// merges given chunk value with chunk to the right
	merge_right(at_value, i_right) {
		let h_chunk = this.chunks[i_right];

		let nl_add = at_value.length;
		let at_right = h_chunk.value;
		let at_chunk = new Uint8Array(nl_add+at_right.length);
		at_chunk.set(at_value);
		at_chunk.set(at_right, nl_add);

		// merge into chunk
		h_chunk.lo -= nl_add;
		h_chunk.value = at_chunk;

		return h_chunk;
	}

	// extracts the given range from a chunk
	within(h_chunk, i_ask_lo, i_ask_hi) {
		let i_lo = h_chunk.lo;
		return h_chunk.value.subarray(i_ask_lo-i_lo, i_ask_hi-i_lo);
	}

	ranges_left(i_chunk, i_ask_lo) {
		let a_chunks = this.chunks;
		let i_chunk_lo = a_chunks[i_chunk].lo;

		let a_ranges = [];
		let b_dangle = false;

		// scan leftwards
		let i_scan = i_chunk - 1;
		let h_scan = a_chunks[i_scan];
		for(;;) {
			let {
				lo: i_scan_lo,
				hi: i_scan_hi,
			} = h_scan;

			// add range to list
			a_ranges.push([i_scan_hi, i_chunk_lo]);

			// no more scans needed
			if(i_scan_lo <= i_ask_lo) {
				break;
			}
			// no more chunks left
			else if(!i_scan) {
				// still need bytes at head
				if(i_ask_lo < i_scan_lo) {
					// push last range
					a_ranges.push([i_ask_lo, i_scan_lo]);

					// this chunk will merge right
					b_dangle = true;
				}

				break;
			}

			// next chunk
			h_scan = a_chunks[--i_scan];

			// shift pointer
			i_chunk_lo = i_scan_lo;
		}

		return {
			ranges: a_ranges,
			dangle: b_dangle,
			scan: i_scan,
		};
	}

	ranges_right(i_chunk, i_ask_hi) {
		let a_chunks = this.chunks;
		let nl_chunks = a_chunks.length;
		let i_chunk_hi = a_chunks[i_chunk].hi;

		let a_ranges = [];
		let b_dangle = false;

		// scan rightwards
		let i_scan = i_chunk + 1;
		let h_scan = a_chunks[i_scan];
		for(;;) {
			let {
				lo: i_scan_lo,
				hi: i_scan_hi,
			} = h_scan;

			// add range to list
			a_ranges.push([i_chunk_hi, i_scan_lo]);

			// no more scans needed
			if(i_ask_hi <= i_scan_hi) {
				break;
			}
			// no more chunks left
			else if(i_scan === nl_chunks-1) {
				// still need bytes at tail
				if(i_ask_hi > i_scan_hi) {
					// push last range
					a_ranges.push([i_scan_hi, i_ask_hi]);

					// this chunk will merge left
					b_dangle = true;
				}

				break;
			}

			// next chunk
			h_scan = a_chunks[++i_scan];

			// shift pointer
			i_chunk_hi = i_scan_hi;
		}

		return {
			ranges: a_ranges,
			dangle: b_dangle,
			scan: i_scan,
		};
	}

	async scan_left(i_chunk, i_ask_lo, i_ask_hi) {
		// deduce ranges needed
		let {
			ranges: a_ranges,
			dangle: b_dangle,
			scan: i_scan,
		} = this.ranges_left(i_chunk, i_ask_lo);

		// fetch all ranges
		let a_fetched = await krc.fetch_ranges(a_ranges);

		// prep result after fitting chunks into place
		let h_chunk;

		// leftmost chunk merges right
		if(b_dangle) {
			// merge dangle first
			this.merge_right(a_fetched.shift(), i_scan);

			// don't wedge this chunk
			a_ranges.shift();
		}

		// // iterate backwards to avoid mutating chunk index offset
		// for(let i_fetch=a_ranges.length-1, i_wedge=i_chunk-1; i_fetch>=0; i_fetch--, i_wedge--) {
		// 	// wedge chunk into place
		// 	h_chunk = this.wedge(a_fetched[i_fetch], i_wedge);
		// }

		h_chunk = this.wedges(a_fetched, a_ranges, i_scan);

		// final chunk
		return this.within(h_chunk, i_ask_lo, i_ask_hi);
	}

	async scan_right(i_chunk, i_ask_lo, i_ask_hi) {
		// deduce ranges needed
		let {
			ranges: a_ranges,
			dangle: b_dangle,
			scan: i_scan,
		} = this.ranges_right(i_chunk, i_ask_hi);

		// fetch all ranges
		let a_fetched = await krc.fetch_ranges(a_ranges);

		// prep result after fitting chunks into place
		let h_chunk;

		// rightmost chunk merges left
		if(b_dangle) {
			// merge dangle first
			this.merge_left(a_fetched.pop(), i_scan);

			// don't wedge this chunk
			a_ranges.pop();
		}

		// // iterate backwards to avoid mutating chunk index offset
		// for(let i_fetch=a_ranges.length-1, i_wedge=i_chunk-1; i_fetch>=0; i_fetch--, i_wedge--) {
		// 	// wedge chunk into place
		// 	h_chunk = this.wedge(a_fetched[i_fetch], i_wedge);
		// }

		h_chunk = this.wedges(a_fetched, a_ranges, i_chunk);

		// final chunk
		return this.within(h_chunk, i_ask_lo, i_ask_hi);
	}

	async scan_both(i_chunk, i_ask_lo, i_ask_hi) {
		// deduce ranges needed on left side
		let {
			ranges: a_ranges_left,
			dangle: b_dangle_left,
			scan: i_scan_left,
		} = this.ranges_left(i_chunk, i_ask_lo);

		// deduce ranges needed on right side
		let {
			ranges: a_ranges_right,
			dangle: b_dangle_right,
			scan: i_scan_right,
		} = this.ranges_right(i_chunk, i_ask_hi);

		// fetch all ranges at once
		let a_ranges = a_ranges_left.concat(a_ranges_right);
		let a_fetched = await krc.fetch_ranges(a_ranges);

		// prep result after fitting chunks into place
		let h_chunk;

		// rightmost chunk merges left
		if(b_dangle_right) {
			// merge dangle first
			this.merge_left(a_fetched.pop(), i_scan_right);

			// don't wedge this chunk
			a_ranges_right.pop();
		}

		//
		let nl_ranges_left = a_ranges_left.length;

		// // iterate backwards to avoid mutating chunk index offset
		// for(let i_fetch=nl_ranges_left+a_ranges_right.length-1, i_wedge=i_chunk-1; i_fetch>=nl_ranges_left; i_fetch--, i_wedge--) {
		// 	// wedge chunk into place
		// 	h_chunk = this.wedge(a_fetched[i_fetch], i_wedge);
		// }

		// leftmost chunk merges right
		if(b_dangle_left) {
			// merge dangle first
			this.merge_right(a_fetched.shift(), i_scan_left);

			// don't wedge this chunk
			a_ranges_left.shift();
		}

		// // iterate backwards to avoid mutating chunk index offset
		// for(let i_fetch=nl_ranges_left-1, i_wedge=i_chunk-1; i_fetch>=0; i_fetch--, i_wedge--) {
		// 	// wedge chunk into place
		// 	h_chunk = this.wedge(a_fetched[i_fetch], i_wedge);
		// }

		h_chunk = this.wedges(a_fetched, a_ranges, i_scan_left);

		// final chunk
		return this.within(h_chunk, i_ask_lo, i_ask_hi);
	}

	// takes a slice out of buffer from lo inclusive to hi exclusive
	async slice(i_ask_lo, i_ask_hi) {
		let {
			krc: krc,
			offset: i_offset,
			chunks: a_chunks,
		} = this;

		i_ask_lo += i_offset;
		i_ask_hi += i_offset;

		let nl_chunks = a_chunks.length;

		let i_lo = 0;
		let i_hi = nl_chunks;

		// binary search
		while(i_lo <= i_hi) {
			let i_mid = (i_lo + i_hi) >>> 1;
			let h_mid = a_chunks[i_mid];
			let {
				lo: i_chunk_lo,
				hi: i_chunk_hi,
			} = h_mid;

			// starts at/before chunk starts
			if(i_ask_lo <= i_chunk_lo) {
				// ends after chunk starts; chunk is a hit
				if(i_ask_hi > i_chunk_lo) {
					// ends at/before chunk ends;
					if(i_ask_hi <= i_chunk_hi) {
						// chunk contains entire target
						if(i_ask_lo === i_chunk_lo) {
							return this.within(h_mid, i_ask_lo, i_ask_hi);
						}
						// chunk is missing target's head
						else {
							// previous chunk does not contain target
							if(!i_lo || i_ask_lo >= a_chunks[i_mid-1].hi) {
								// fetch difference
								let at_add = await krc.fetch(i_ask_lo, i_chunk_lo);

								// this connects previous chunk
								if(i_lo && i_ask_lo === a_chunks[i_mid-1].hi) {
									let h_chunk = this.wedge(at_add, i_mid-1);
									return this.within(h_chunk, i_ask_lo, i_ask_hi);
								}
								// merge with chunk
								else {
									let h_chunk = this.merge_right(at_add, i_mid);
									return this.within(h_chunk, i_ask_lo, i_ask_hi);
								}
							}
							// previous chunk contains part of target
							else {
								return this.scan_left(i_mid, i_ask_lo, i_ask_hi);
							}
						}
					}
					// ends after chunk ends
					else {
						// chunk contains head
						if(i_ask_lo === i_chunk_lo) {
							// no more chunks
							if(i_mid === nl_chunks-1) {
								// fetch difference
								let at_add = await krc.fetch(i_chunk_hi, i_ask_hi);

								// merge with chunk
								return this.merge_left(at_add, i_mid);
							}
							// more chunks to the right
							else {
								return this.scan_right(i_mid, i_ask_lo, i_ask_hi);
							}
						}
						// missing parts at both head and tail
						else {
							return this.scan_both(i_mid, i_ask_lo, i_ask_hi);
						}
					}
				}
				// ends before chunk starts; aim left
				else {
					i_hi = i_mid;
				}
			}
			// starts after chunk starts
			else {
				// starts before chunk ends; hit
				if(i_ask_lo < i_chunk_hi) {
					// ends at/before chunk ends; chunk contains entire target
					if(i_ask_hi <= i_chunk_hi) {
						return this.within(i_mid, i_ask_lo, i_ask_hi);
					}
					// ends after chunk
					else {
						return this.scan_right(i_mid, i_ask_lo, i_ask_hi);
					}
				}
				// starts after chunk ends; aim right
				else {
					i_lo = i_mid;
				}
			}
		}
	}
}

class remote_typed_array {
	constructor(krc, i_offset, nl_buffer, dc_type) {
		Object.assign(this, {
			krb: new remote_buffer(krc, i_offset, nl_buffer),
			shifts_per_element: Math.log2(dc_type.BYTES_PER_ELEMENT),
			type: dc_type,
		});
	}

	async slice(i_lo, i_hi) {
		let ns_element = this.shifts_per_element;
		let at_slice = await this.krb.slice(i_lo<<ns_element, i_hi<<ns_element);
		return new this.type(at_slice);
	}
}

class remote_chapter_front_coded extends async_interfaces.chapter {
	constructor() {
		super();

		Object.assign(this, {
			indices: new remote_typed_array(krc, i_indicies, nb_indices, Uint16Array),
			contents: new remote_buffer(krc, i_contents, nb_contents),
		});
	}

	async produce(i_term) {
		let {
			block_k: n_block_k,
			indices: krt_indices,
			contents: krb_contents,
		} = this;

		let i_key = i_term - this.offset;

		let i_block = i_key >>> n_block_k;
		let i_word = i_block << n_block_k;
		let [i_contents, i_contents_end] = await krt_indices.slice(i_block, i_block+1);
		let at_block = await krb_contents.slice(i_contents, i_contents_end);

		let n_block_size = 1 << n_block_k;
		let a_block_idx = new Array(n_block_size);
		let a_shares = new Array(n_block_size);

		let i_read = 0;
		a_block_idx[0] = 0;
		a_shares[0] = 0;
		let i_block_idx = 0;

		// length of head word
		let nl_word = at_block.indexOf(0);

		// head word shares no characters
		let n_share = 0;

		// word is within block
		if(i_word < i_key) {
			// skip over null char
			i_read += 1;

			// skip words until arriving at target
			let kbd_contents = new bus.buffer_decoder(at_contents);
			kbd_contents.read = i_read;
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
			i_read = kbd_contents.read;
		}

		// prep to construct word
		let at_word = new Uint8Array(n_share + nl_word);

		// copy known part from current word
		at_word.set(at_block.subarray(i_read, i_read+nl_word), n_share);

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
}


let krc = new auto_switching_composite_resource_connection({
	connections: [
		new http_get_resource_connection('http://phuzzy.link/data/dbpedia.org/2015-04.hdt'),
	],
	// validation: {
		
	// },
});



