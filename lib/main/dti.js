const stream = require('stream');

const graphy = require('./graphy.js');

const B_IS_BROWSER = ('browser' === process.title);

const _Buffer = B_IS_BROWSER? require('buffer/').Buffer: Buffer;

const D_UTF_8_TEXT_ENCODER = B_IS_BROWSER? new TextEncoder('utf-8'): null;

const encode_utf_8 = B_IS_BROWSER
	? (s_chunk) => {
		return D_UTF_8_TEXT_ENCODER.encode(s_chunk);
	}
	: (s_chunk) => {
		return Buffer.from(s_chunk, 'utf-8');
	};

const D_UTF_8_TEXT_DECODER = B_IS_BROWSER? new TextDecoder('utf-8'): null;

const decode_utf_8 = B_IS_BROWSER
	? (ab_chunk) => {
		return D_UTF_8_TEXT_DECODER.decode(ab_chunk);
	}
	: (ab_chunk) => {
		return Buffer.from(ab_chunk).toString('utf-8');
	};

const H_TYPED_ARRAYS = {
	1: Uint8Array,
	2: Uint16Array,
	4: Uint32Array,
};

const H_READ_METHODS = {
	1: 'readUInt8',
	2: 'readUInt16LE',
	4: 'readUInt32LE',
};

const N_VERSION = 1;


const A_GENERAL_PHASES = ['d', 's', 'o', 'l', 'p'];
const A_DATA_PHASES = ['sp', 's_po', 'po', 'p_os', 'os', 'o_sp'];

const H_SECTIONS = {
	0: {
		object: 1,
		label: 'prefixes',
	},
	1: {
		object: 0,
		label: 'count',
		phases: A_GENERAL_PHASES,
	},
	2: {
		object: 2,
		label: 'dict',
		phases: A_GENERAL_PHASES,
	},
	3: {
		object: 2,
		label: 'ref',
		phases: A_GENERAL_PHASES,
	},
	4: {
		object: 2,
		label: 'data',
		phases: A_DATA_PHASES,
	},
	5: {
		object: 2,
		label: 'idx',
		phases: ['sp', 'po', 'os'],
	},
	6: {
		object: 3,
		label: 'idx',
		phases: ['s_po', 'p_os', 'o_sp'],
	},
	7: {
		object: 2,
		label: 'idx',
		temp: true,
	},
};

const X_TERMINUS = 0;


class Consumer extends stream.Writable {

	constructor(ds_input, h_config={}) {
		super();

		this.graph = graphy.linkedGraph();
		this.config = h_config;

		this.previous = null;
		this.position = 0;

		// initial section
		this.sections = [
			null, 
			{
				object: -1,
				label: 'version',
			},
		];

		// read stream
		ds_input.pipe(this);
	}

	vbyte() {
		// only advance state once entire vbyte has been consumed
		let c_b = 0;

		// vbyte integer value
		let x_value = 0;

		// for breaking to indicate all vbyte was consumed
		let b_consumed = false;

		// while there are bytes
		let n_r = n - i;
		while(c_b < n_r) {
			// byte value
			let x = a[i+c_b];

			// add lower value
			x_value |= (x & 0x7f) << (7 * c_b++);

			// last byte of number
			if(x & 0x80) {
				b_consumed = true;
				break;
			}
		}

		// consumed entire vbyte
		if(b_consumed) {
			// advance index
			i += c_b;

			// save vbyte value to specific key
			this[this.vbyte_key] = x_value;
		}
	}

	decode_vbyte(a, n, i) {
		// only advance state once entire vbyte has been consumed
		let c_b = 0;

		// vbyte integer value
		let x_value = 0;

		// for breaking to indicate all vbyte was consumed
		let b_consumed = false;

		// while there are bytes
		let n_r = n - i;
		while(c_b < n_r) {
			// byte value
			let x = a[i+c_b];

			// add lower value
			x_value |= (x & 0x7f) << (7 * c_b++);

			// last byte of number
			if(x & 0x80) {
				b_consumed = true;
				break;
			}
		}

		// consumed entire vbyte
		if(b_consumed) {
			// advance index and return vbyte value
			return [i+c_b, x_value];
		}
		// did not finish reading vbyte
		else {
			return false;
		}
	}

	_write(zb_chunk, s_encoding, f_okay) {
		let a = zb_chunk;

		// chunk is an encoded string
		if('string' === typeof zb_chunk) {
			// decode into array-buffer
			a = _Buffer.from(zb_chunk, s_encoding);
		}

		// augment chunk with previous leftovers
		if(this.previous) {
			a = _Buffer.concat([this.previous, a], this.previous.length + a.length);
			this.previous = null;
		}

		// cache current chunk length
		let n = a.length;

		// start reading chunk from beginning
		let i = 0;


		// ref graph
		let k_graph = this.graph;

		// 
		let a_sections = this.sections;

		// ref current section
		let h_section = a_sections.pop();
		chunk:
		while(n - i > 0) {
			// resuming payload
			if(h_section) {
				// destructure section vars
				let s_label = h_section.label;
				let s_phase = h_section.phase;
				let i_offset = h_section.offset;

				// depending on section object type
				switch(h_section.object) {
					// version
					case -1: {
						// attempt to decode vbyte
						let a_decode = this.decode_vbyte(a, n, i);

						// not enough in buffer to parse vbyte
						if(!a_decode) break chunk;

						// update index
						i = a_decode[0];

						// check version
						if(a_decode[1] > N_VERSION) {
							throw 'version not supported';
						}

						// pop section
						h_section = a_sections.pop();
						break;
					}

					// numbers
					case 0: {
						// destruct section vars
						let a_phases = h_section.phases;

						do {
							// attempt to decode vbyte
							let a_decode = this.decode_vbyte(a, n, i);

							// ran out of bytes
							if(!a_decode) {
								// save offset
								h_section.offset = i_offset;

								// exit loop
								break chunk;
							}

							// update index
							i = a_decode[0];

							// set value
							k_graph[s_label+'_'+a_phases[i_offset++]] = a_decode[1];
						} while(i_offset < a_phases.length);

						// parsed all numbers; pop section
						if(i_offset >= a_phases.length) h_section = a_sections.pop();
						break;
					}

					// hash (all utf8)
					case 1: {
						// section vars
						let n_bytes = h_section.bytes;
						let h_hash = h_section.hash = h_section.hash || {};

						// header has not been read
						if('undefined' === typeof n_bytes) {
							// attempt to decode vbyte
							let a_decode = this.decode_vbyte(a, n, i);

							// not enough in buffer to parse vbyte
							if(!a_decode) break chunk;

							// update index
							i = a_decode[0];

							// set byte count
							n_bytes = h_section.bytes = a_decode[1];
						}

						// minimum 3 bytes: [prefix, delimiter, value]
						while(n - i > 0 && i_offset < n_bytes) {
							// find delimiter
							let i_delim = a.indexOf(0x01, i+1);

							// ran out of bytes
							if(-1 === i_delim) {
								// save offset
								h_section.offset = i_offset;

								// break loop
								break chunk;
							}

							// find terminus
							let i_term = a.indexOf(0x00, i_delim+1);

							// ran out of bytes
							if(-1 === i_term) {
								// save offset
								h_section.offset = i_offset;

								// break loop
								break chunk;
							}

							// extract key
							let s_key = decode_utf_8(a.slice(i, i_delim));

							// extract value
							let s_value = decode_utf_8(a.slice(i_delim+1, i_term));

							// save to hash
							h_hash[s_key] = s_value;

							// advance offset
							i_offset += (i_term - i) + 1;

							// update index
							i = i_term + 1;
						}

						// done with this section
						if(i_offset >= n_bytes) {
							// store to graph
							k_graph[s_label+(s_phase? '_'+s_phase: '')] = h_hash;

							// pop section
							h_section = a_sections.pop();
						}
						break;
					}

					// typed array
					case 2: {
						// section vars specific to typed array objects
						let n_bytes_per_element = h_section.bytes_per_element || 1;
						let n_size = h_section.size || 1;
						let at_array = h_section.array;
						let n_bytes = 2 + (n_size * n_bytes_per_element);

						// do not run out of bytes unexpectedly
						do {
							// offset is at bytes per element
							if(0 === i_offset) {
								// save btyes per element
								n_bytes_per_element = h_section.bytes_per_element = a[i++];

								// advance offset
								i_offset += 1;
							}
							// offset is at size of array
							else if(1 === i_offset) {
								// attempt to decode vbyte
								let a_decode = this.decode_vbyte(a, n, i);

								// not enough in buffer to parse vbyte
								if(!a_decode) {
									// save offset
									h_section.offset = i_offset;

									// break loop
									break chunk;
								}

								// update index
								i = a_decode[0];

								// save size of array
								n_size = h_section.size = a_decode[1];

								// create array
								switch(n_bytes_per_element) {
									case 1: at_array = h_section.array = new Uint8Array(n_size); break;
									case 2: at_array = h_section.array = new Uint16Array(n_size); break;
									case 4: at_array = h_section.array = new Uint32Array(n_size); break;
								}

								// calculate number of bytes needed
								n_bytes = 2 + (n_size * n_bytes_per_element);

								// advance offset
								i_offset += 1;
							}
							// offset is amidst payload
							else {
								// how many bytes are in excess
								let n_over = n - i - (n_bytes - i_offset);

								// extract wanted portion
								let a_slice;

								// there is a shortage
								if(n_over <= 0) {
									// range has exact multiple of uint bytes
									if((n - i) % n_bytes_per_element === 0) {
										a_slice = a.slice(i);
									}
									// range ends mid-uint bytes
									else {
										a_slice = a.slice(i, -((n - i) % n_bytes_per_element));
									}
								}
								// there is an excess
								else {
									// only take what is needed (will have all bytes needed)
									a_slice = a.slice(i, -n_over);
								}

								// not enough bytes
								if(!a_slice.length) {
									// update offset
									h_section.offset = i_offset;

									// exit loop
									break chunk;
								}

								// create typed array
								let at_slice = a_slice;

								// multi-byte uint type
								if(n_bytes_per_element > 1) {
									// perfect byte alignment
									if(a_slice.byteOffset % n_bytes_per_element === 0) {
										at_slice = new at_array.constructor(a_slice.buffer, a_slice.byteOffset, a_slice.byteLength / n_bytes_per_element);
									}
									// bytes misaligned
									else {
										// create new ArrayBuffer
										let ab = a_slice.buffer.slice(a_slice.byteOffset, a_slice.byteOffset + a_slice.byteLength);

										// create uint32 view
										at_slice = new at_array.constructor(ab);
									}
								}

								// set into target
								at_array.set(at_slice, (i_offset - 2) / n_bytes_per_element);

								// advance indexes
								let n_consumed = a_slice.length;
								i_offset += n_consumed;
								i += n_consumed;
							}
						} while(n - i > 0 && i_offset < n_bytes);

						// done with array
						if(i_offset >= n_bytes) {
							// array has phase
							if(s_phase) {
								// save to graph
								k_graph[s_label+'_'+s_phase] = at_array;
							}
							// array is sub-array of super
							else {
								h_section.super.push(at_array);
							}

							// pop section
							h_section = a_sections.pop();
						}
						break;
					}

					// super array
					case 3: {
						// section vars
						let n_size = h_section.size;

						// beginning on super array
						if('undefined' === typeof n_size) {
							// attempt to decode vbyte
							let a_decode = this.decode_vbyte(a, n, i);

							// not enough in buffer to parse vbyte
							if(!a_decode) break chunk;

							// update index
							i = a_decode[0];

							// save size of array
							n_size = h_section.size = a_decode[1];

							// create super-array
							h_section.array = [];
						}

						// items remain
						if(h_section.array.length < n_size) {
							// push super section
							a_sections.push(h_section);

							// set sub-array section as current
							i_offset = 0;
							h_section = {
								object: 2,
								super: h_section.array,
							};
						}
						// done w/ super array
						else {
							// save super to graph
							k_graph[s_label+'_'+s_phase] = h_section.array;

							// pop section
							h_section = a_sections.pop();
						}

						// store state vars
						break;
					}
				}

				// update state vars
				if(h_section) {
					h_section.offset = i_offset;
				}
			}
			// start of section
			else {
				// read header byte
				let x_header = a[i++];

				// decode type and phase
				let x_type = (x_header & 0xf0) >> 4;
				let x_phase = x_header & 0x0f;

				// push section
				a_sections.push(h_section);

				// start new section
				let h_section_starter = H_SECTIONS[x_type];
				if(!h_section_starter) throw 'invalid section found';
				h_section = Object.assign({}, h_section_starter);
				if(h_section.phases) h_section.phase = h_section.phases[x_phase];
				h_section.offset = 0;
				let s_section = h_section.label+'_'+h_section.phase;
				// console.log(s_section);
			}
		}

		this.position += i;

		// push section
		this.sections.push(h_section);

		// data remains in buffer
		if(i < n) {
			// store remainder
			this.previous = _Buffer.from(a.slice(i));
		}

		if(this.config.progress) {
			let s_section;
			if(h_section && h_section.label) {
				if(h_section.phase) s_section = h_section.label+'_'+h_section.phase;
				else s_section = h_section.label+'(s)';
			}
			this.config.progress(this.position, s_section || '...');
		}

		// done reading this chunk
		f_okay();
	}

	end() {
		// ref graph
		let k_graph = this.graph;

		// last section needs to be set
		let h_section = this.sections.pop();
		if(h_section) {
			k_graph[h_section.label+'_'+h_section.phase] = h_section.array;
		}

// memory('loaded');
// 		// create indexes
// 		k_graph.index();

// memory('indexed spo');
// 		// 
// 		k_graph.mk_pos();

// memory('pos');
// 		// k_graph.mk_osp();

// memory('osp');

		// create prefix inverse
		for(let s_prefix_id in k_graph.prefixes) {
			let s_prefix_iri = k_graph.prefixes[s_prefix_id];
			k_graph.prefix_lookup[s_prefix_iri] = s_prefix_id;
		}

		// ref config
		let h_config = this.config;

		// load user prefixes
		this.graph.set_prefixes(this.config.prefixes || {});

		//
		h_config.ready && h_config.ready(k_graph);
	}
}


class Serializer {
	constructor(ds_output, h_config, fk_writer) {
		this.output = ds_output;
		this.config = h_config;

		// progress callback
		this.progress = this.config.progress || null;

		// ref & save graph
		let k_graph = this.graph = h_config.graph;

		// once we're all finished writing
		ds_output.on('finish', () => {
			fk_writer();
		});

		// vbyte dti format version
		ds_output.write(_Buffer.from([0x80 | N_VERSION]));

		// prefix mappings
		let a_flow = this.flow = [
			() => this.write_hash(0x00, 0x00, 'prefixes'),
		];

		// counts
		a_flow.push(...[
			() => this.write_bytes([
					(0x01 << 4) | 0x00,
					...this.encode_vbyte(k_graph.count_d),
					...this.encode_vbyte(k_graph.count_s),
					...this.encode_vbyte(k_graph.count_o),
					...this.encode_vbyte(k_graph.count_l),
					...this.encode_vbyte(k_graph.count_p),
				], 'counts'),
		]);

		// dicts & refs
		a_flow.push(...[
			() => this.write_array(0x02, 0x00, 'dict_d'),
			() => this.write_array(0x02, 0x01, 'dict_s'),
			() => this.write_array(0x02, 0x02, 'dict_o'),
			() => this.write_array(0x02, 0x03, 'dict_l'),
			() => this.write_array(0x02, 0x04, 'dict_p'),
			() => this.write_array(0x03, 0x00, 'ref_d'),
			() => this.write_array(0x03, 0x01, 'ref_s'),
			() => this.write_array(0x03, 0x02, 'ref_o'),
			() => this.write_array(0x03, 0x03, 'ref_l'),
			() => this.write_array(0x03, 0x04, 'ref_p'),
		]);

		// uses SPO
		if(k_graph.data_sp) {
			a_flow.push(...[
				() => this.write_array(0x04, 0x00, 'data_sp'),
				() => this.write_array(0x04, 0x01, 'data_s_po'),
				() => this.write_array(0x05, 0x00, 'idx_sp'),
				() => this.write_super_array(0x00, 'idx_s_po'),
			]);
		}

		// uses POS
		if(k_graph.data_po) {
			a_flow.push(...[
				() => this.write_array(0x04, 0x02, 'data_po'),
				() => this.write_array(0x04, 0x03, 'data_p_os'),
				() => this.write_array(0x05, 0x01, 'idx_po'),
				() => this.write_super_array(0x01, 'idx_p_os'),
			]);
		}

		// uses OSP
		if(k_graph.data_os) {
			a_flow.push(...[
				() => this.write_array(0x04, 0x04, 'data_os'),
				() => this.write_array(0x04, 0x05, 'data_o_sp'),
				() => this.write_array(0x05, 0x02, 'idx_os'),
				() => this.write_super_array(0x02, 'idx_o_sp'),
			]);
		}

		// every time the output stream drains
		ds_output.on('drain', () => {
			// section was completed; notify user
			if(this.section && this.progress) {
				this.progress(this.section);
			}

			// resume flow
			this.resume();
		});

		// start flow
		this.resume();
	}

	encode_vbyte(x_value) {
		let a_bytes = [x_value & 0x7f];
		let x_remain = x_value >> 7;
		while(x_remain) {
			a_bytes.push(x_remain & 0x7f);
			x_remain = x_remain >> 7;
		}
		a_bytes[a_bytes.length - 1] |= 0x80;
		return a_bytes;
	}

	resume() {
		// process flow task items in a loop
		while(this.flow.length) {
			// take a task from head of list
			let f_task = this.flow.shift();

			// run operation
			let h_result = f_task();

			// run operation; it overfilled buffer
			if(!h_result.drained) {
				// store section name for once it drains
				this.section = h_result.section;

				// pause writing
				return;
			}
			// section was written
			else if(this.progress) {
				// notify section progress
				this.progress(h_result.section);
			}
		}

		// all tasks completed, close output stream
		this.output.end();
	}

	write_bytes(a_bytes, s_section) {
		return {
			drained: this.output.write(_Buffer.from(a_bytes)),
			section: s_section,
		};
	}

	write_hash(x_type, x_phase, s_key) {
		// prepare array of bytes
		let a_bytes = [];

		// ref hash
		let h_hash = this.graph[s_key];

		// each entry in hash
		for(let s_key in h_hash) {
			// convert key into bytes
			a_bytes.push(...encode_utf_8(s_key));

			// prefix delimiter
			a_bytes.push(0x01);

			// utf8-encoded value
			a_bytes.push(...encode_utf_8(h_hash[s_key]));

			// terminus
			a_bytes.push(0x00);
		}

		// set header
		a_bytes.unshift(...[(x_type << 4) | x_phase, ...this.encode_vbyte(a_bytes.length)]);

		// write bytes
		return {
			drained: this.output.write(_Buffer.from(a_bytes)),
			section: s_key,
		};
	}

	write_array(x_type, x_phase, s_key) {
		let at_array = this.graph[s_key];
		let ds_output = this.output;

		let b_drained = ds_output.write(_Buffer.from([
			// +4bits[entry type {dict, ref, data, index}] +4bits[entry phase {d, s, o, l, p}]
			(x_type << 4) | x_phase,

			// bytes per element
			at_array.BYTES_PER_ELEMENT,

			// length of array
			...this.encode_vbyte(at_array.length),
		]));

		// // convert to little endian
		// let at_array_le = new 

		// write data
		return {
			drained: b_drained && ds_output.write(_Buffer.from(at_array.buffer, at_array.byteOffset, at_array.byteLength)),
			section: s_key,
		};
	}

	write_super_array(x_phase, s_key) {
		let a_array = this.graph[s_key];
		let ds_output = this.output;

		// write super-array header
		let b_drained = ds_output.write(_Buffer.from([
			// +4bits[entry type] +4bits[entry phase]
			(0x06 << 4) | x_phase,

			// length of super array
			...this.encode_vbyte(a_array.length),
		]));
debugger;
		// write each sub-array
		let n_arr = a_array.length;
		for(let i_arr=0; i_arr<n_arr; i_arr++) {
			let at_array = a_array[i_arr];

			// write typed array header
			b_drained &= ds_output.write(_Buffer.from([
				// bytes per element
				at_array.BYTES_PER_ELEMENT,

				// length of array
				...this.encode_vbyte(at_array.length),
			]));

			// write data
			b_drained &= ds_output.write(_Buffer.from(at_array.buffer, at_array.byteOffset, at_array.byteLength));
		}

		// results
		return {
			drained: b_drained,
			section: s_key,
		};
	}
}



function memory(s_label) {
	console.log('--- '+s_label+ ' ---');
	console.log('rss: '+(process.memoryUsage().rss / 1024 / 1024)+' MiB');
	console.log('heap total: '+(process.memoryUsage().heapTotal / 1024 / 1024)+' MiB');
	console.log('heap used: '+(process.memoryUsage().heapUsed / 1024 / 1024)+' MiB');
	console.log('');
}

module.exports = {
	load(ds_input, h_config, fk_load) {
		return new Consumer(ds_input, h_config, fk_load);
	},

	writer(ds_output, h_config, fk_write) {
		return new Serializer(ds_output, h_config, fk_write);
	},
};

