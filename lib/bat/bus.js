

class decoder {
	constructor(at_contents) {
		Object.assign(this, {
			contents: at_contents,
			read: 0,
		});
	}

	pint() {
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

	sub(nl_sub) {
		let i_read = this.read;
		this.read += nl_sub;
		return this.contents.slice(i_read, i_read+nl_sub);
	}
}


module.exports = Object.assign({
	encode_utf_8,
	encode_utf_16,

	buffer_writer,
	word_writer,

	decoder,
}, H_TYPES);
