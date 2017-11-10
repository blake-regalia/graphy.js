
const N_DEFAULT_ALLOCATION_SIZE = 64 * 1024;  // 64 KiB

let D_TEXT_ENCODER = new TextEncoder();

const encode_utf_8 = (s_chunk) => D_TEXT_ENCODER.encode(s_chunk);
// const encode_utf_16 = (s_chunk) => {
// 	// encode chunk as utf-16le
// 	let ab_chunk = Buffer.from(s_chunk, 'utf-16le');

// 	// prefix buffer w/ utf-16 token
// 	return Buffer.concat([AB_UTF_16_TOKEN, ab_chunk], ab_chunk.length + 1);
// };

const XM_ENCODING_TYPED_ARRAY_BYTES_PER_ELEMENT_1 = 1 << 0;
const XM_ENCODING_TYPED_ARRAY_BYTES_PER_ELEMENT_2 = 1 << 1;
const XM_ENCODING_TYPED_ARRAY_BYTES_PER_ELEMENT_3 = 1 << 2;
const XM_ENCODING_TYPED_ARRAY_BYTES_PER_ELEMENT_4 = 1 << 3;

const X_ENCODING_TYPED_ARRAY_INT8 = 0x11;
const X_ENCODING_TYPED_ARRAY_UINT8 = 0x21;
const X_ENCODING_TYPED_ARRAY_UINT8_CLAMPED = 0x31;
const X_ENCODING_TYPED_ARRAY_INT16 = 0x12;
const X_ENCODING_TYPED_ARRAY_UINT16 = 0x22;
const X_ENCODING_TYPED_ARRAY_INT32 = 0x14;
const X_ENCODING_TYPED_ARRAY_UINT32 = 0x24;
const X_ENCODING_TYPED_ARRAY_FLOAT32 = 0x44;
const X_ENCODING_TYPED_ARRAY_FLOAT64 = 0x48;

// creates the smallest uint typed array that satisfies the requisite `range`
const uint_array = (n_range) =>
	n_range <= 0xff
		? Uint8Array
		: (n_range <= 0xffff
			? Uint16Array
			: (n_range <= 0xffffffff
				? Uint32Array
				: (n_range <= Math.pow(2, 53)
					? Float64Array
					: new RangeError('uint size too large: ${n_range}'))));

const new_uint_array = (n_range, n_size) => {
	return new (uint_array(n_range))(n_size);
};

class buffer_writer {
	constructor(h_config={}) {
		let {
			malloc: b_force_malloc=false,
			size: n_allocation_size=N_DEFAULT_ALLOCATION_SIZE,
			grow: n_grow_size=N_DEFAULT_ALLOCATION_SIZE,
		} = h_config;

		let at_contents;
		if(b_force_malloc) {
			let ab_alloc = new ArrayBuffer(n_allocation_size);
			at_contents = new Uint8Array(ab_alloc);
		}
		else {
			at_contents = new Uint8Array(n_allocation_size);
		}

		Object.assign(this, {
			contents: at_contents,
			write: 0,
			grow: n_grow_size,
		});
	}

	append_byte(x_byte) {
		let at_contents = this.contents;
		if(this.write < at_contents.length) {
			at_contents[this.write++] = x_byte;
			return this.write;
		}
		else {
			return this.append([x_byte]);
		}
	}

	append_bytes_2(x_byte_a, x_byte_b) {
		let at_contents = this.contents;
		let i_write = this.write;
		if(i_write < at_contents.length - 1) {
			at_contents[i_write] = x_byte_a;
			at_contents[i_write+1] = x_byte_b;
			return this.write += 2;
		}
		else {
			return this.append([x_byte_a, x_byte_b]);
		}
	}

	append_bytes_3(x_byte_a, x_byte_b, x_byte_c) {
		let at_contents = this.contents;
		let i_write = this.write;
		if(i_write < at_contents.length - 2) {
			at_contents[i_write] = x_byte_a;
			at_contents[i_write+1] = x_byte_b;
			at_contents[i_write+2] = x_byte_c;
			return this.write += 3;
		}
		else {
			return this.append([x_byte_a, x_byte_b, x_byte_c]);
		}
	}

	append_bytes_4(x_byte_a, x_byte_b, x_byte_c, x_byte_d) {
		let at_contents = this.contents;
		let i_write = this.write;
		if(i_write < at_contents.length - 3) {
			at_contents[i_write] = x_byte_a;
			at_contents[i_write+1] = x_byte_b;
			at_contents[i_write+2] = x_byte_c;
			at_contents[i_write+3] = x_byte_d;
			return this.write += 4;
		}
		else {
			return this.append([x_byte_a, x_byte_b, x_byte_c, x_byte_d]);
		}
	}

	append(at_item) {
		let i_write = this.write;
		let at_contents = this.contents;

		let nl_contents = at_contents.length;
		let nl_item = at_item.length;

		// append item will overflow current buffer; figure out how much to alloc
		let i_end = i_write + nl_item;
		let x_overflow = i_end - nl_contents;
		if(x_overflow > 0) {
			// alloc new buffer and copy contents
			let nl_grow = nl_contents + (Math.ceil(x_overflow / this.grow) * this.grow);
			let at_alloc = new Uint8Array(nl_grow);
			at_alloc.set(at_contents);
			this.contents = at_contents = at_alloc;
		}

		// copy item
		at_contents.set(at_item, i_write);
		return this.write = i_end;
	}

	slice(i_start=0, i_end=-1) {
		return this.contents.slice(i_start, i_end);
	}

	close() {
		return this.contents.slice(0, this.write);
	}
}

class buffer_encoder {
	static from_buffer(kb) {
		return new buffer_encoder(null, kb);
	}

	constructor(h_config={}, kb=null) {
		Object.assign(this, {
			buffer: kb? kb: new buffer_writer(h_config),
		});
	}

	ntu8_string(s_value) {
		return this.buffer.append(D_TEXT_ENCODER.encode(s_value+'\0'));
	}

	typed_array(at_values) {
		let kb = this.buffer;

		let x_type;
		if(at_values instanceof Uint8Array) {
			x_type = X_ENCODING_TYPED_ARRAY_UINT8;
		}
		else if(at_values instanceof Uint16Array) {
			x_type = X_ENCODING_TYPED_ARRAY_UINT16;
		}
		else if(at_values instanceof Uint32Array) {
			x_type = X_ENCODING_TYPED_ARRAY_UINT32;
		}
		else if(at_values instanceof Int8Array) {
			x_type = X_ENCODING_TYPED_ARRAY_INT8;
		}
		else if(at_values instanceof Int16Array) {
			x_type = X_ENCODING_TYPED_ARRAY_INT16;
		}
		else if(at_values instanceof Int32Array) {
			x_type = X_ENCODING_TYPED_ARRAY_INT32;
		}
		else if(at_values instanceof Uint8ClampedArray) {
			x_type = X_ENCODING_TYPED_ARRAY_UINT8_CLAMPED;
		}
		else if(at_values instanceof Float32Array) {
			x_type = X_ENCODING_TYPED_ARRAY_FLOAT32;
		}
		else if(at_values instanceof Float64Array) {
			x_type = X_ENCODING_TYPED_ARRAY_FLOAT64;
		}

		// not uint8 array
		let n_bytes = at_values.byteLength;
		let at_append = new Uint8Array(at_values.buffer, at_values.byteOffset, n_bytes);

		// typed array type
		kb.append_byte(x_type);

		// length in bytes
		this.vuint(n_bytes);

		// contents
		this.buffer.append(at_append);
	}

	vuint(x_value) {
		let kb = this.buffer;
		// 0x80: 1
		// 0x4000: 2
		// 0x200000: 3
		// 0x10000000: 4
		// 0x7fffffff
		// 0x7fffffff
		// 0x800000000: 5
		// 0x40000000000: 6
		// 0x2000000000000: 7
		// 0x100000000000000: 8
		// 0x7ffffffffffff
		// <= 0x7FFFFFFFFFFFFFFF

		// can do bitwise operations on this number
		if(x_value <= 0x7fffffff) {
			if(x_value <= 0x3fff) {
				if(x_value <= 0x7f) {
					return kb.append_byte(x_value);
				}
				else {
					return kb.append_bytes_2(
						0x80 | (x_value & 0x7f),
						x_value >> 7
					);
				}
			}
			else if(x_value <= 0x1fffff) {
				return kb.append_bytes_3(
					0x80 | (x_value & 0x7f),
					0x80 | ((x_value >> 7) & 0x7f),
					x_value >> 14
				);
			}
			else if(x_value <= 0xfffffff) {
				return kb.append_bytes_4(
					0x80 | (x_value & 0x7f),
					0x80 | ((x_value >> 7) & 0x7f),
					0x80 | ((x_value >> 14) & 0x7f),
					x_value >> 21
				);
			}
			else {
				return kb.append([
					0x80 | (x_value & 0x7f),
					0x80 | ((x_value >> 7) & 0x7f),
					0x80 | ((x_value >> 14) & 0x7f),
					0x80 | ((x_value >> 21) & 0x7f),
					x_value >> 28,
				]);
			}
		}
		// got to do some shifting
		else {
			let x_hi = Math.floor(x_value / 0x10000);
			let x_lo = x_value - 0x80000000;

			// success
			if(x_hi <= 0x7fffffff) {
				if(x_hi <= 0x3ff8) {
					if(x_hi <= 0x0f) {
						return kb.append([
							0x80 | (x_hi << 3) | (x_lo >> 28),
							0x80 | ((x_lo >> 21) & 0x7f),
							0x80 | ((x_lo >> 14) & 0x7f),
							0x80 | ((x_lo >> 7) & 0x7f),
							x_lo & 0x7f,
						]);
					}
					else {
						debugger;
						return kb.append([
							0x80 | (x_hi & 0x7f),
							0x80 | ((x_hi << 3) & 0x7f) | (x_lo >> 28),
							0x80 | ((x_lo >> 21) & 0x7f),
							0x80 | ((x_lo >> 14) & 0x7f),
							0x80 | ((x_lo >> 7) & 0x7f),
							x_lo & 0x7f,
						]);
					}
				}
			}
		}

		throw 'large integer encoding not implemented';
	}

	close() {
		return this.buffer.close();
	}
}

class word_writer {
	constructor(h_config={}) {
		Object.assign(this, {
			buffer: new buffer_writer(h_config),
			indices: [],
			count: 0,
		});
	}

	append(at_item) {
		this.indices.push(this.buffer.append(at_item));
		this.count += 1;
	}

	close() {
		return {
			contents: this.buffer.close(),
			indices: this.indices,
		};
	}
}


class bitsequence_writer {
	constructor(n_bits) {
		Object.assign(this, {
			contents: new Uint8Array(Math.ceil(n_bits / 8)),
			index: 0,
			pending: 0x00,
			bit: -1,
		});
	}

	advance(n_bits) {
		let i_bit = n_bits + this.bit;
		let n_bytes = (i_bit / 8) | 0;
		if(n_bytes) {
			if(this.pending) {
				this.contents[this.index] = this.pending;
				this.pending = 0;
			}
			this.index += n_bytes;
		}

		let i_pos = this.bit = i_bit % 8;
		this.pending |= 0x80 >>> i_pos;
	}

	close() {
		let at_contents = this.contents;
		if(this.index > at_contents.length) throw new Error('bitsequence wrote out of range');
		at_contents[this.index] = this.pending;
		return at_contents;
	}
}



class buffer_decoder {
	constructor(at_contents) {
		Object.assign(this, {
			contents: at_contents,
			read: 0,
		});
	}

	vuint() {
		let {
			contents: at,
			read: i,
		} = this;

		// 1 byte value
		let x = at[i];

		// first byte is end of int
		if(x < 0x80) {
			this.read += 1;
			return x;
		}

		// set pint value to lower value
		let x_value = x & 0x7f;


		// 2 bytes; keep going
		x = at[i+1];

		// add lower value
		x_value |= (x & 0x7f) << 7;

		// last byte of number
		if(x < 0x80) {
			this.read += 2;
			return x_value;
		}


		// 3 bytes; keep going
		x = at[i+2];

		// add lower value
		x_value |= (x & 0x7f) << 14;

		// last byte of number
		if(x < 0x80) {
			this.read += 3;
			return x_value;
		}


		// 4 bytes; keep going
		x = at[i+3];

		// add lower value
		x_value |= (x & 0x7f) << 21;

		// last byte of number
		if(x < 0x80) {
			this.read += 4;
			return x_value;
		}


		// 5 bytes; be cautious
		x = at[i+4];

		// safe to shift
		let x_hi = (x & 0x7f);
		if(x_hi < 0x07) {
			// add lower value
			x_value |= x_hi << 28;
		}
		// cannot shift
		else {
			// shift by means of float multiplication
			x_value += (x_hi * 0x10000000);
		}

		// last byte of number
		if(x < 0x80) {
			this.read += 5;
			return x_value;
		}


		// 6 bytes (or more)
		throw 'large integer decoding not yet implemented';
	}

	sub(nl_sub=null) {
		let {
			contents: at_contents,
			read: i_read,
		} = this;
		if(null === nl_sub) nl_sub = at_contents.length - i_read;
		this.read += nl_sub;
		return at_contents.slice(i_read, i_read+nl_sub);
	}
}


class word_reader {
	constructor(at_contents, at_indices) {
		Object.assign(this, {
			contents: at_contents,
			indices: at_indices,
		});
	}

	*words() {
		let {
			contents: at_contents,
			indices: at_indices,
		} = this;

		let n_words = at_indices.length;
		let i_read = 0;
		for(let i_word=0; i_word<n_words; i_word++) {
			let i_end = at_indices[i_word];
			yield at_contents.subarray(i_read, i_end);
			i_read = i_end;
		}
	}

	*triples() {
		let {
			contents: at_contents,
			indices: at_indices,
		} = this;

		let n_words = at_indices.length;
		let i_read = 0;
		for(let i_word=0; i_word<n_words; i_word++) {
			let i_end = at_indices[i_word++];
			let ab_s = at_contents.subarray(i_read, i_end);
			i_read = i_end;

			i_end = at_indices[i_word++];
			let ab_p = at_contents.subarray(i_read, i_end);

			i_end = at_indices[i_word++];
			let ab_o = at_contents.subarray(i_read, i_end);
			i_read = i_end;

			yield {
				s: ab_s,
				p: ab_p,
				o: ab_o,
			};
		}
	}
}

module.exports = Object.assign({
	uint_array,
	new_uint_array,

	buffer_writer,
	word_writer,
	bitsequence_writer,

	buffer_encoder,

	buffer_decoder,
	word_reader,

	encode_utf_8,
	// encode_utf_16,
});
