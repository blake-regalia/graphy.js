
const events = require('events');
const stream = require('stream');

const I_PINT = 0x00;
const I_NINT = 0x01;
const I_DOUBLE = 0x02;
const I_UTF_8_STRING = 0x03;
const I_UTF_16_STRING = 0x04;
const I_HASH = 0x05;
const I_ARRAY = 0x06;
const I_UINT_8_ARRAY = 0x07;
const I_UINT_16_ARRAY = 0x08;
const I_UINT_32_ARRAY = 0x09;
const I_FLOAT_64_ARRAY = 0x0A;

const encode_vbyte = (x_value) => {
	let ax = [x_value & 0x7f];
	let x_remain = x_value >> 7;
	while(x_remain) {
		ax.push(x_remain & 0x7f);
		x_remain = x_remain >> 7;
	}
	ax[ax.length - 1] |= 0x80;
	return Buffer.from(ax);
};

const decode_vbyte = (a, i) => {
	let c_b = 0;

	// vbyte integer value
	let x_value = 0;
	while(true) {
		// byte value
		let x = a[i+c_b];

		// add lower value
		x_value |= (x & 0x7f) << (7 * c_b++);

		// last byte of number
		if(x & 0x80) break;
	}

	//
	return [x_value, i+c_b];
};

const encode = (z_item, a_message) => {
	if('undefined' === typeof z_item) {
		debugger;
		throw 'cannot encode things of type undefined';
	}
	// number {positive int, negative int, double}
	else if('number' === typeof z_item) {
		// int
		if(Number.isInteger(z_item)) {
			// positive int
			if(z_item >= 0) {
				a_message.push([I_PINT]);
				let ax_value = encode_vbyte(z_item);
				a_message.push(ax_value);
				return 1 + ax_value.length;
			}
			// negative int
			else {
				a_message.push([I_NINT]);
				let ax_value = encode_vbyte(-z_item);
				a_message.push(ax_value);
				return 1 + ax_value.length;	
			}
		}
		// decimal (double)
		else {
			throw 'cannot encode floats... yet';
		}
	}
	// string {utf8-encoded, utf16-encoded}
	else if('string' === typeof z_item) {
		let a_oob_matches = z_item.match(/[^\u0000-\u007f]/g);
		if(a_oob_matches) {
			// number of out-of-bound characters
			let n_oobs = a_oob_matches.length;

			// estimate utf8 length (add weighted average probability of exceeding 2 bytes)
			let n_utf8_len = z_item.length + (n_oobs * 1.9395);

			// estimate utf16 length (add weighted average probability of exceeding 2 bytes)
			let n_utf16_len = (z_item.length * 2) + (n_oobs * 1.8858);

			// encode in whichever probably saves more space
			if(n_utf8_len <= n_utf16_len) {
				a_message.push([I_UTF_8_STRING]);
				ax_item = Buffer.from(z_item, 'utf-8');
			}
			else {
				a_message.push([I_UTF_16_STRING]);
				ax_item = Buffer.from(z_item, 'utf-16le');
			}
		}
		// all characters can be encoded in utf8
		else {
			a_message.push([I_UTF_8_STRING]);
			ax_item = Buffer.from(z_item, 'utf-8');
		}

		let ax_length = encode_vbyte(ax_item.length);
		a_message.push(ax_length);
		a_message.push(ax_item);
		return 1 + ax_length.length + ax_item.length;
	}
	// Array of serializable items
	else if(Array.isArray(z_item)) {
		a_message.push([I_ARRAY]);
		let ax_length = encode_vbyte(z_item.length);
		a_message.push(ax_length);
		let c_bytes = 1 + ax_length.length;
		z_item.forEach((z_sub) => {
			c_bytes += encode(z_sub, a_message);
		});
		return c_bytes;
	}
	// hash (plain object)
	else if(z_item.constructor === Object) {
		a_message.push([I_HASH])
		let n_pairs = 0;
		for(let s_key in z_item) n_pairs++;
		let ax_size = encode_vbyte(n_pairs);
		a_message.push(ax_size);
		let c_bytes = 1 + ax_size.length;
		for(let s_key in z_item) {
			let w_value = z_item[s_key];
			let ab_key = Buffer.from(s_key, 'utf8');
			let ax_key_length = encode_vbyte(ab_key.length);
			a_message.push(ax_key_length);
			a_message.push(ab_key);
			c_bytes += ax_key_length.length + ab_key.length + encode(w_value, a_message);
		}
		return c_bytes;
	}
	// other...
	else {
		// typed arrays
		if(z_item instanceof Uint8Array) {
			a_message.push([I_UINT_8_ARRAY]);
		}
		else if(z_item instanceof Uint16Array) {
			a_message.push([I_UINT_16_ARRAY]);
		}
		else if(z_item instanceof Uint32Array) {
			a_message.push([I_UINT_32_ARRAY]);
		}
		else {
			throw 'invalid type to encode';
		}

		let ax_length = encode_vbyte(z_item.length);
		a_message.push(ax_length);
		a_message.push(Buffer.from(z_item.buffer, z_item.byteOffset, z_item.byteLength));
		return 1 + ax_length.length + z_item.byteLength;
	}
};


class Outgoing extends stream.Readable {
	constructor(ab_message=null, h_opt={}) {
		super(h_opt.stream || {});
		if(ab_message instanceof Buffer) {
			this.message = ab_message;
		}
	}

	_read() {
		if(this.message) this.push(this.message);
		this.push(null);
	}

	send(...a_items) {
		let n_items = a_items.length;
		let a_parts = [];
		let c_bytes = 0;
		for(let i_item=0; i_item<n_items; i_item++) {
			c_bytes += encode(a_items[i_item], a_parts);
		}

		let ab_message = Buffer.allocUnsafe(c_bytes);
		let i_write = 0;
		let n_parts = a_parts.length;
		for(let i_part=0; i_part<n_parts; i_part++) {
			let ax_part = a_parts[i_part];
			ab_message.set(ax_part, i_write);
			i_write += ax_part.length;
		}
		this.message = ab_message;

		return this;
	}

}

class Incoming extends stream.Writable {
	constructor(z_receiever, i_consumer, h_stream_opt={}) {
		super(h_stream_opt);
		Object.assign(this, {
			index: i_consumer,
			store: Buffer.from([]),
		});

		this.on('finish', () => {
			let a = this.store;
			let a_results = [];
			if(!a.length) throw 'no data was consumed on incoming before finish was called';
			let [w_result, i] = this._decode(a, 0);
			a_results.push(w_result);
			let n = a.length;
			while(i < n) {
				[w_result, i] = this._decode(a, i);
				a_results.push(w_result);
			}
			let b_heard = this.emit.apply(this, ['receive', ...a_results, this.index]);
			console.log('emitted data receive event with '+a_results.length+' results to '+(b_heard? 'at least one listener': 'no one'));
		});

		if(z_receiever) {
			if('function' === typeof z_receiever) {
				this.on('receive', z_receiever);
			}
			else if(z_receiever.receive) {
				this.on('receive', (...a_args) => {
					z_receiever.receive(...a_args);
				});
			}
		}
	}

	_write(ab_chunk, s_encoding, fk_chunk) {
		this.store = Buffer.concat([this.store, ab_chunk], this.store.length + ab_chunk.length);
		fk_chunk();
	}

	_decode(a, i) {
		let i_type = a[i++];
		switch(i_type) {
			// positive int
			case I_PINT: return decode_vbyte(a, i);

			// negative int
			case I_NINT: {
				let x_value; [x_value, i] = decode_vbyte(a, i);
				return [-x_value, i];
			}

			// double
			case I_DOUBLE: {
				throw 'not yet implemented';
			}

			// utf-8 string
			case I_UTF_8_STRING: {
				let n_bytes; [n_bytes, i] = decode_vbyte(a, i);
				return [a.slice(i, i+n_bytes).toString('utf-8'), i+n_bytes];
			}

			// utf-16 string
			case I_UTF_16_STRING: {
				let n_bytes; [n_bytes, i] = decode_vbyte(a, i);
				return [a.slice(i, i+n_bytes).toString('utf-16le'), i+n_bytes];
			}

			// hash
			case I_HASH: {
				let h_hash = {};
				let n_pairs; [n_pairs, i] = decode_vbyte(a, i);

				for(let i_pair=0; i_pair<n_pairs; i_pair++) {
					let n_key_length; [n_key_length, i] = decode_vbyte(a, i);

					let s_key = a.slice(i, i+n_key_length).toString('utf8');
					i += n_key_length;

					let w_value; [w_value, i] = this._decode(a, i);

					h_hash[s_key] = w_value;
				}

				return [h_hash, i];
			}

			// array
			case I_ARRAY: {
				let a_items = [];
				let n_size; [n_size, i] = decode_vbyte(a, i);

				for(let i_item=0; i_item<n_size; i_item++) {
					let at_item; [at_item, i] = this._decode(a, i);

					a_items.push(at_item);
				}

				return [a_items, i];
			}

			// otherwise
			default: {
				// typed array?
				let typed_array;
				switch(i_type) {
					case I_UINT_8_ARRAY: typed_array = Uint8Array; break;
					case I_UINT_16_ARRAY: typed_array = Uint16Array; break;
					case I_UINT_32_ARRAY: typed_array = Uint32Array; break;
					default: throw 'invalid type to decode: '+i_type;
				}

				let n_length; [n_length, i] = decode_vbyte(a, i);

				let n_bytes_per_element = typed_array.BYTES_PER_ELEMENT;

				let c_bytes = n_length * n_bytes_per_element;

				let at_item;
				let at_slice = a.slice(i, i+c_bytes);
				i += c_bytes;

				// multi-byte uint type
				if(n_bytes_per_element > 1) {
					// perfect byte alignment
					if(at_slice.byteOffset % n_bytes_per_element === 0) {
						at_item = new typed_array(at_slice.buffer, at_slice.byteOffset, n_length);
					}
					// bytes misaligned
					else {
						// create new ArrayBuffer
						let ab = at_slice.buffer.slice(at_slice.byteOffset, at_slice.byteOffset + at_slice.byteLength);

						// create uint32 view
						at_item = new typed_array(ab);
					}
				}
				else {
					// set into target
					at_item = new typed_array(at_slice);
				}

				return [at_item, i];
			}
		}
	}
}


class Multiplx extends events {
	constructor(h_config={}) {
		super();
		Object.assign(this, {
			results: [],
			channels: h_config.channels || Infinity,
			ordered: h_config.ordered || false,
			consumer_count: 0,
			receiver_index: 0,
			_producers: function() {
				throw 'no data to multiplex';
			},
		});

		// consumer generator
		this._consumers = (function*() {
			if(Number.isFinite(this.channels)) {
				let n_channels = this.channels;
				for(let i_consumer=0; i_consumer<n_channels; i_consumer++) {
					yield new Incoming(this, i_consumer);
				}
			}
			else {
				while(true) {
					yield new Incoming(this, i_consumer++);
				}
			}
		}).apply(this);
	}

	// when an incoming message is fully received
	receive(...a_results) {
		let i_consumer = a_results.pop();
		let a_super_results = this.results;

		// results are ordered
		if(this.ordered) {
			// result can be unloaded immediately
			if(i_consumer === this.receiver_index) {
				// while there are results to unload
				do {
					// emit receive event
					this.emit.apply(this, ['receive', ...a_results, i_consumer]);

					// clear result (even if we aren't storing it)
					delete a_super_results[this.receiver_index];

					// advance receiever index and fetch its value
					a_results = a_super_results[++this.receiver_index];
				} while('undefined' !== typeof a_super_results[this.receiver_index]);
			}
			// result needs to be saved
			else {
				// emit queued event
				this.emit.apply(this, ['queued', ...a_results, i_consumer]);

				// store result until its ready
				a_super_results[i_consumer] = a_results;
			}
		}
		// not serial
		else {
			this.emit.apply(this, ['receive', ...a_results, i_consumer]);
		}
	}

	// user wants to divide an array amongst the channels
	divide(h_opt) {
		let {
			array: a_items,
			multiple: n_multiple=null,
			ammend: ax_ammend,
		} = h_opt;
		if(!Array.isArray(a_items)) throw new TypeError(`Multiplex#divide() expects an Array for value at key 'array'`);
		// create outgoing generator
		this._producers = (function*() {
			// track index of current item to send
			let i_message_item_start = 0;

			// how many whole elements to send to each channel
			let n_chunk_length = Math.ceil(a_items.length / this.channels);

			// coerce to an ideal multiple
			if(n_multiple && (n_chunk_length % n_multiple !== 0)) {
				n_chunk_length = Math.ceil(n_chunk_length / n_multiple) * n_multiple;
			}

			// each channel
			for(let i_channel=0; i_channel<this.channels; i_channel++) {
				// number of items remaining
				let n_items_remaining = a_items.length - i_message_item_start;

				// number of items to send this channel
				let n_items = Math.min(n_chunk_length, n_items_remaining);

				// count message byte length without creating (too much) extra memory if possible
				let b_predict = true;
				let ax_length = encode_vbyte(n_items);
				let c_bytes = 1 + ax_length.length;

				// at least store the vbytes
				let a_vbytes = [];

				// each item
				for(let i_item=i_message_item_start; i_item<(i_message_item_start+n_items); i_item++) {
					let w_item = a_items[i_item];

					// typed array (fixed & predictable length)
					if(w_item instanceof Uint8Array || w_item instanceof Uint16Array || w_item instanceof Uint32Array) {
						let ax_item_length = encode_vbyte(w_item.length);
						a_vbytes.push(ax_item_length);
						c_bytes += 1 + ax_item_length.length + (w_item.length * w_item.BYTES_PER_ELEMENT);
					}
					// don't bother with anything else
					else {
						b_predict = false;
						a_vbytes.length = 0;
						c_bytes = 0;
						break;
					}
				}
				
				// for iterating the messages (again)
				let i_item = i_message_item_start;

				// for storing message result
				let ab_message;

				// we were able to precompute message length
				if(b_predict) {
					// add ammended message
					if(ax_ammend) c_bytes += ax_ammend.length;

					// allocate buffer
					ab_message = Buffer.allocUnsafe(c_bytes);

					// header
					ab_message[0] = I_ARRAY;
					ab_message.set(ax_length, 1);

					// index: message buffer write
					let i_write = ax_length.length + 1;

					let i_vbyte = 0;

					// each item (again)
					while(i_item < i_message_item_start + n_items) {
						let at_item = a_items[i_item];

						// only typed arrays make it here; encode the item header & length
						let i_type = (at_item instanceof Uint8Array
								? I_UINT_8_ARRAY
								: (at_item instanceof Uint16Array
									? I_UINT_16_ARRAY
									: (at_item instanceof Uint32Array
										? I_UINT_32_ARRAY
										: I_FLOAT_64_ARRAY)));
						ab_message[i_write++] = i_type;
						let ax_item_length = a_vbytes[i_vbyte++];
						ab_message.set(ax_item_length, i_write);
						i_write += ax_item_length.length;

						// item contents
						ab_message.set(Buffer.from(at_item.buffer, at_item.byteOffset, at_item.byteLength), i_write);
						i_write += at_item.byteLength;

						// advance item index
						i_item += 1;
					}

					// make ammendments
					if(ax_ammend) {
						ab_message.set(ax_ammend, i_write);
						i_write += ax_ammend.length;
					}
				}
				// unable to count in efficient manner
				else {
					let a_message = [];

					// only build the outer array header
					a_message.push([I_ARRAY]);
					a_message.push(ax_length);
					c_bytes = 1 + ax_length.length;

					// encode all contents
					let i_item = i_message_item_start;
					while(i_item < i_message_item_start + n_items) {
						let w_item = a_items[i_item];

						// encode item and count number of bytes needed
						c_bytes += encode(w_item, a_message);

						// advance item index
						i_item += 1;
					}

					// add ammended message
					if(ax_ammend) c_bytes += ax_ammend.length;

					// generate actual message
					ab_message = Buffer.allocUnsafe(c_bytes);
					let i_write = 0;
					let n_parts = a_message.length;
					for(let i_part=0; i_part<n_parts; i_part++) {
						let ax_part = a_message[i_part];
						ab_message.set(ax_part, i_write);
						i_write += ax_part.length;
					}

					// make ammendments
					if(ax_ammend) {
						ab_message.set(ax_ammend, i_write);
						i_write += ax_ammend.length;
					}
				}

				// update item index
				i_message_item_start = i_item;
debugger;
				// the message
				yield new Outgoing(ab_message);
			}
		}).apply(this);

		// chain
		return this;
	}

	// acquire an incoming handler
	incoming() {
		return this._consumers.next().value;
	}

	// acquire an outgoing handler
	outgoing() {
		return this._producers.next().value;
	}
}


module.exports = {
	// new incoming instance
	incoming(...a_args) {
		return new Incoming(...a_args);
	},

	// new outgoing instance
	outgoing(...a_args) {
		return new Outgoing(...a_args);
	},

	// multiplex
	multiplex(...a_args) {
		return new Multiplx(...a_args);
	},

	// encode data
	encode(...a_items) {
		let n_items = a_items.length;
		let a_parts = [];
		let c_bytes = 0;
		for(let i_item=0; i_item<n_items; i_item++) {
			c_bytes += encode(a_items[i_item], a_parts);
		}

		let ab_message = Buffer.allocUnsafe(c_bytes);
		let i_write = 0;
		let n_parts = a_parts.length;
		for(let i_part=0; i_part<n_parts; i_part++) {
			let ax_part = a_parts[i_part];
			ab_message.set(ax_part, i_write);
			i_write += ax_part.length;
		}
		return ab_message;
	},

	encode_vbyte: encode_vbyte,
	decode_vbyte: decode_vbyte,
};
