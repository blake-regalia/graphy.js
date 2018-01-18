const events = require('events');
const bus = require('./bus.js');

let D_TEXT_ENCODER = new TextEncoder();

const X_TOKEN_ABSOLUTE_IRI = 0x01;
const X_TOKEN_BLANK_NODE = 0x02;
const X_TOKEN_PREFIX_FOLLOWS = 0x03;
// const X_TOKEN_UTF_16 = 0x03;
const X_TOKEN_CONTENTS = D_TEXT_ENCODER.encode('"');
const X_TOKEN_LANGUAGE = D_TEXT_ENCODER.encode('@');
const X_TOKEN_DATATYPE = D_TEXT_ENCODER.encode('^');

const X_CODE_HEADER = 0x01;
const X_CODE_DICTIONARY = 0x02;
const X_CODE_CHAPTER_PREFIXES = 0x10;
const X_CODE_CHAPTER_HOPS = 0x11;
const X_CODE_CHAPTER_HOPS_ABSOLUTE = 0x12;
const X_CODE_CHAPTER_HOPS_PREFIXED = 0x13;
const X_CODE_CHAPTER_SUBJECTS = 0x14;
const X_CODE_CHAPTER_SUBJECTS_ABSOLUTE = 0x15;
const X_CODE_CHAPTER_SUBJECTS_PREFIXED = 0x16;
const X_CODE_CHAPTER_PREDICATES = 0x17;
const X_CODE_CHAPTER_PREDICATES_ABSOLUTE = 0x18;
const X_CODE_CHAPTER_PREDICATES_PREFIXED = 0x19;
const X_CODE_CHAPTER_OBJECTS = 0x1a;
const X_CODE_CHAPTER_OBJECTS_ABSOLUTE = 0x1b;
const X_CODE_CHAPTER_OBJECTS_PREFIXED = 0x1c;
const X_CODE_CHAPTER_LITERALS = 0x1d;
const X_CODE_CHAPTER_LITERALS_PLAIN = 0x1e;
const X_CODE_CHAPTER_LITERALS_LANGUAGED = 0x1f;
const X_CODE_CHAPTER_LITERALS_DATATYPED = 0x20;
const X_CODE_CHAPTER_LITERALS_DATATYPED_ABSOLUTE = 0x21;
const X_CODE_CHAPTER_LITERALS_DATATYPED_PREFIXED = 0x22;

const S_TOKEN_ABSOLUTE_IRI = String.fromCharCode(X_TOKEN_ABSOLUTE_IRI);
const S_TOKEN_BLANK_NODE = String.fromCharCode(X_TOKEN_BLANK_NODE);
const S_TOKEN_PREFIX_FOLLOWS = String.fromCharCode(X_TOKEN_PREFIX_FOLLOWS);

const AB_ZERO = Buffer.from([0x00]);
const AB_TOKEN_ABSOLUTE_IRI = Buffer.from([X_TOKEN_ABSOLUTE_IRI]);
const AB_TOKEN_BLANK_NODE = Buffer.from([X_TOKEN_BLANK_NODE]);
// const AB_TOKEN_UTF_16 = Buffer.from([0x04]);
const AB_TOKEN_PREFIX_FOLLOWS = Buffer.from([X_TOKEN_PREFIX_FOLLOWS]);
const AB_TOKEN_CONTENTS = Buffer.from('"', 'utf-8');
const AB_TOKEN_LANGUAGE = Buffer.from('@', 'utf-8');
const AB_TOKEN_DATATYPE = Buffer.from('^', 'utf-8');


const XM_NODE_SUBJECT	= 1 << 0;
const XM_NODE_OBJECT	= 1 << 1;
const XM_NODE_PREDICATE	= 1 << 2;
const XM_NODE_DATATYPE	= 1 << 3;

const XM_NODE_HOP = XM_NODE_SUBJECT | XM_NODE_OBJECT;

// for creating new prefixes
const R_COMPRESS = /^(.*?)([^/#]*)$/;

// 'bate:dataset/1.0#bat'
// 'bate:encodings'
// 'bate:triples/'

const P_IRI_BAT_ENCODING = 'http://bat-rdf.link/encoding/';
const PE_DATASET = P_IRI_BAT_ENCODING + 'dataset/partial-graph/1.0';
const PE_DICTIONARY = P_IRI_BAT_ENCODING + 'dictionary/twelve-section/1.0';
const PE_TRIPLES_BITMAP = P_IRI_BAT_ENCODING + 'triples/bitmap/1.0';
const PE_TRIPLES_WAVELET = P_IRI_BAT_ENCODING + 'triples/wavelet/1.0';

const PE_CHAPTER = P_IRI_BAT_ENCODING + 'chapter/indices-contents/1.0';

// const PE_CHAPTER_FRONT_CODED = 

const PE_CHAPTER_INDICES = P_IRI_BAT_ENCODING + 'chapter-indices/direct/1.0';
const PE_CHAPTER_CONTENTS = P_IRI_BAT_ENCODING + 'chapter-contents/front-coded/1.0';



const S_PREFIXES = 'prefixes';
const S_TERM_HA = 'hops_absolute';
const S_TERM_SA = 'subjects_absolute';
const S_TERM_PA = 'predicates_absolute';
const S_TERM_OA = 'objects_absolute';
const S_TERM_HP = 'hops_prefixed';
const S_TERM_SP = 'subjects_prefixed';
const S_TERM_PP = 'predicates_prefixed';
const S_TERM_OP = 'objects_prefixed';
const S_TERM_LP = 'literals_plain';
const S_TERM_LL = 'literals_languaged';
const S_TERM_LDA = 'literals_datatyped_absolute';
const S_TERM_LDP = 'literals_datatyped_prefixed';


const H_CONSTANTS = {
	X_TOKEN_ABSOLUTE_IRI,
	X_TOKEN_BLANK_NODE,
	// X_TOKEN_UTF_16,
	X_TOKEN_PREFIX_FOLLOWS,

	S_TOKEN_ABSOLUTE_IRI,
	S_TOKEN_BLANK_NODE,
	S_TOKEN_PREFIX_FOLLOWS,

	AB_ZERO,

	AB_TOKEN_ABSOLUTE_IRI,

	AB_TOKEN_DATATYPE,
	AB_TOKEN_LANGUAGE,
	AB_TOKEN_CONTENTS,

	X_TOKEN_CONTENTS,
	X_TOKEN_LANGUAGE,
	X_TOKEN_DATATYPE,

	X_CODE_HEADER,
	X_CODE_DICTIONARY,
	X_CODE_CHAPTER_PREFIXES,
	X_CODE_CHAPTER_HOPS,
	X_CODE_CHAPTER_HOPS_ABSOLUTE,
	X_CODE_CHAPTER_HOPS_PREFIXED,
	X_CODE_CHAPTER_SUBJECTS,
	X_CODE_CHAPTER_SUBJECTS_ABSOLUTE,
	X_CODE_CHAPTER_SUBJECTS_PREFIXED,
	X_CODE_CHAPTER_PREDICATES,
	X_CODE_CHAPTER_PREDICATES_ABSOLUTE,
	X_CODE_CHAPTER_PREDICATES_PREFIXED,
	X_CODE_CHAPTER_OBJECTS,
	X_CODE_CHAPTER_OBJECTS_ABSOLUTE,
	X_CODE_CHAPTER_OBJECTS_PREFIXED,
	X_CODE_CHAPTER_LITERALS,
	X_CODE_CHAPTER_LITERALS_PLAIN,
	X_CODE_CHAPTER_LITERALS_LANGUAGED,
	X_CODE_CHAPTER_LITERALS_DATATYPED,
	X_CODE_CHAPTER_LITERALS_DATATYPED_ABSOLUTE,
	X_CODE_CHAPTER_LITERALS_DATATYPED_PREFIXED,

	R_COMPRESS,

	XM_NODE_SUBJECT,
	XM_NODE_OBJECT,
	XM_NODE_PREDICATE,
	XM_NODE_DATATYPE,
	XM_NODE_HOP,


	PE_DATASET,
	PE_DICTIONARY,
	PE_TRIPLES_BITMAP,

	PE_CHAPTER,

	// PE_CHAPTER_FRONT_CODED,

	S_PREFIXES,
	S_TERM_HA,
	S_TERM_SA,
	S_TERM_PA,
	S_TERM_OA,
	S_TERM_HP,
	S_TERM_SP,
	S_TERM_PP,
	S_TERM_OP,
	S_TERM_LP,
	S_TERM_LL,
	S_TERM_LDA,
	S_TERM_LDP,
};


// class buffer_writer_node {
// 	constructor(h_config={}) {
// 		let {
// 			malloc: b_force_malloc=false,
// 			size: n_allocation_size=N_DEFAULT_ALLOCATION_SIZE,
// 		} = h_config;

// 		Object.assign(this, {
// 			buffer: b_force_malloc
// 				? Buffer.allocUnsafeSlow(n_allocation_size)
// 				: Buffer.allocUnsafe(n_allocation_size),
// 			write: 0,
// 		});
// 	}

// 	append(ab_item) {
// 		let i_write = this.write;
// 		let ab_dest = this.buffer;

// 		let nl_item = ab_item.length;

// 		// 
// 		let n_copied = ab_item.copy(ab_dest, i_write);
// 		let i_read = n_copied;
// 		while(i_read < nl_item) {
// 			i_write += n_copied;
// 			let ab_expand = Buffer.alloc(ab_dest.length + N_DEFAULT_ALLOCATION_SIZE);
// 			ab_dest.copy(ab_expand);
// 			ab_dest = ab_expand;
// 			nl_item -= n_copied;
// 			n_copied = ab_item.copy(ab_dest, i_write, i_read);
// 			i_read += n_copied;
// 		}

// 		this.write += nl_item;
// 	}

// 	slice(i_start=0, i_end=-1) {
// 		return this.buffer.slice(i_start, i_end);
// 	}

// 	close() {
// 		return this.buffer.slice(0, this.write);
// 	}
// }



// class word_writer_node {
// 	constructor(h_config={}) {
// 		Object.assign(this, {
// 			buffer: new buffer_writer(h_config),
// 			indices: [],
// 			count: 0,
// 		});
// 	}

// 	append(a_item) {
// 		this.buffer.append(at_item);
// 		let i_write = this.write;
// 		let ab_dest = this.buffer;

// 		let nl_item = ab_item.length;

// 		// add index
// 		this.indices.push(i_write + nl_item);

// 		// 
// 		let n_copied = ab_item.copy(ab_dest, i_write);
// 		let i_read = n_copied;
// 		while(i_read < nl_item) {
// 			i_write += n_copied;
// 			let ab_expand = Buffer.alloc(ab_dest.length + N_DEFAULT_ALLOCATION_SIZE);
// 			ab_dest.copy(ab_expand);
// 			ab_dest = ab_expand;
// 			nl_item -= n_copied;
// 			n_copied = ab_item.copy(ab_dest, i_write, i_read);
// 			i_read += n_copied;
// 		}

// 		this.write += nl_item;
// 		this.count += 1;
// 	}

// 	close() {
// 		let ab_words = this.buffer.slice(0, this.write);
// 		return {
// 			buffer: ab_words,
// 			indices: this.indices,
// 		};
// 	}
// }



class plain_map {
	constructor(b_safe=false) {
		this.map = b_safe? Object.create(null): {};
	}

	put(s_key, z_value) {
		this.map[s_key] = z_value;
	}
}

class dual_map_proxy {
	constructor(b_safe=false) {
		this.map_a = new plain_map(b_safe);
		this.map_b = new plain_map(b_safe);
	}

	put(s_key, z_value) {
		this.map_a.map[s_key] = z_value;
		this.map_b.map[s_key] = z_value;
	}
}


// reserved lo bit values
//   0 -> word delimiter
//   1 -> absolute iri
//   2 -> blank node
//   3 -> prefix follows
const A_KEY_RANGES = [
	0xfc,
	0xffff - 0x0404,
	0xffffff - 0x040404,
	0xffffffff - 0x04040404,
];
class key_space {
	static bytes_needed(n_keys) {
		// ranges 0-1
		if(n_keys <= 0xf90b) {
			// range 0
			if(n_keys <= 0xfc) {
				return 1;
			}
			// range 1
			else {
				return 2;
			}
		}
		// ranges 2-3
		else {
			// range 2
			if(n_keys <= 0xf528cc) {
				return 3;
			}
			// range 3
			else {
				return 4;
			}
		}
	}

	constructor(n_key_bytes) {
		Object.assign(this, {
			key_bytes: n_key_bytes,
			i_id: 0,
		});
	}

	produce(a_bytes) {
		while(a_bytes.length < this.key_bytes) {
			a_bytes.unshift(AB_TOKEN_PREFIX_FOLLOWS);
		}

		return Buffer.from(a_bytes);
	}

	encode(i_id) {
		let n_key_bytes = this.key_bytes;
		let ab_write = new Uint8Array(n_key_bytes);
		if(n_key_bytes > 2) {
			if(3 === n_key_bytes) {
				ab_write[0] = ab_write[1] = ab_write[2] = X_TOKEN_PREFIX_FOLLOWS;
			}
			else {
				ab_write[0] = ab_write[1] = X_TOKEN_PREFIX_FOLLOWS;
			}
		}
		else {
			ab_write[0] = X_TOKEN_PREFIX_FOLLOWS;
		}

		// ranges 0-1
		if(i_id < 0xf90b) {
			// range 0
			if(i_id < 0xfc) {
				ab_write[n_key_bytes-1] = i_id + 4;
			}
			// range 1
			else {
				// avoid bytes 0x04 and below
				let x_out = i_id + 0x304 + (Math.trunc(i_id / 0xfc) << 2);

				// write
				ab_write[n_key_bytes-2] = x_out >> 8;
				ab_write[n_key_bytes-1] = x_out & 0xff;
			}
		}
		// ranges 2-3
		else {
			let x_b0 = Math.trunc(i_id / 0xfc) << 2;
			let x_b1 = Math.trunc((i_id - 0xf90c) / 0xf810) << 10;

			// range 2
			if(i_id < 0xf528cc) {
				let x_out = i_id + 0x30704 + x_b1 + x_b0;

				ab_write[n_key_bytes-3] = x_out >> 16;
				ab_write[n_key_bytes-2] = (x_out >> 8) & 0xff;
				ab_write[n_key_bytes-1] = x_out & 0xff;
			}
			// range 3
			else {
				let x_b2 = Math.trunc((i_id - 0xf528cc) / 0xf42fc0) << 18;
				let x_out = i_id + 0x3070704 + x_b2 + x_b1 + x_b0;

				ab_write[n_key_bytes-4] = x_out >> 24;
				ab_write[n_key_bytes-3] = (x_out >> 16) & 0xff;
				ab_write[n_key_bytes-2] = (x_out >> 8) & 0xff;
				ab_write[n_key_bytes-1] = x_out & 0xff;
			}
		}

		return ab_write;
	}

	decode(x_key) {
		let n_key_bytes = this.key_bytes;

		// ranges 0-1
		if(x_key <= 0xffff) {
			// range 0
			if(x_key <= 0xff) {
				return x_key - 4;
			}
			// range 1
			else {
				return (0xfc * (x_key - 0x304)) / 0x100;
			}
		}
	}

	next(ab_write, i_write) {
		// exceeded 1 byte range
		if(this.id > 0xff) {
			this.id = 0x0505;
			this.next = this.next_16;
			return this.next();
		}
		// within range
		else {
			// just set the least significant byte
			ab_write[i_write+this.key_bytes-1] = this.id++;
		}
	}

	next_16(ab_write, i_write) {
		let i_id = this.id;

		// skip 0-4 in b0
		let x_b0 = i_id & 0xff;
		while(x_b0 < 4) x_b0 = (i_id++) &0xff;

		// exceeded 2 byte range
		if(i_id > 0xffff) {
			this.id = 0x050505;
			this.next = this.next_24;
			return this.next();
		}
		// within range
		else {
			this.id = i_id + 1;

			// set b1 and b0
			let n_key_bytes = this.key_bytes;
			ab_write[i_write+n_key_bytes-2] = i_id >> 8;
			ab_write[i_write+n_key_bytes-1] = x_b0;
		}
	}

	next_24(ab_write, i_write) {
		let i_id = this.id;

		// skip 0-4 in b0
		let x_b0 = i_id & 0xff;
		while(x_b0 < 4) x_b0 = (i_id++) &0xff;

		// skip 0-4 in b1
		let x_b1 = (i_id >> 8) & 0xff;
		while(x_b1 < 4) {
			i_id += 0x0100;
			x_b1 = (i_id >> 8) & 0xff;
		}

		// exceeded 3 byte range
		if(i_id > 0xffffff) {
			this.id = 0x05050505;
			this.next = this.next_32;
			return this.next();
		}
		// within range
		else {
			this.id = i_id + 1;

			// set b2, b1 and b0
			let n_key_bytes = this.key_bytes;
			ab_write[i_write+n_key_bytes-3] = i_id >> 16;
			ab_write[i_write+n_key_bytes-2] = x_b1;
			ab_write[i_write+n_key_bytes-1] = x_b0;
		}
	}

	next_32(ab_write, i_write) {
		let i_id = this.id;

		// skip 0-4 in b0
		let x_b0 = i_id & 0xff;
		while(x_b0 < 4) x_b0 = (i_id++) &0xff;

		// skip 0-4 in b1
		let x_b1 = (i_id >> 8) & 0xff;
		while(x_b1 < 4) {
			i_id += 0x0100;
			x_b1 = (i_id >> 8) & 0xff;
		}

		// skip 0-4 in b2
		let x_b2 = (i_id >> 16) & 0xff;
		while(x_b2 < 4) {
			i_id += 0x010000;
			x_b2 = (i_id >> 16) & 0xff;
		}

		// exceeded 4 byte range
		if(i_id > 0xfffffffe) {
			this.next = this.exceeded_range;
			ab_write[i_write+0] = 0xff;
			ab_write[i_write+1] = 0xff;
			ab_write[i_write+2] = 0xff;
			ab_write[i_write+3] = 0xff;
		}
		// within range
		else {
			this.id = i_id + 1;

			// set b3, b2, b1 and b0
			ab_write[i_write+0] = i_id >> 24;
			ab_write[i_write+1] = x_b2;
			ab_write[i_write+2] = x_b1;
			ab_write[i_write+3] = x_b0;
		}
	}

	exceeded_range() {
		throw 'exceeded 32-bit range';
	}
}


class readable_blob extends events.EventEmitter {
	constructor(dfb_input, h_config) {
		super();
		Object.assign(this, {
			input: dfb_input,
			decoder: new TextDecoder('utf-8'),
			read_index: 0,
			encoding: 'utf-8',
			chunk_size: h_config.chunk_size || 1024*1024,  // 1 MiB
			flowing: null,
			size: dfb_input.size,
			mime: h_config.mime || 'text/turtle',
		});
	}

	setEncoding(s_encoding) {
		if(s_encoding !== this.decoder.encoding) {
			this.decoder = new TextDecoder(s_encoding);
		}
	}

	pause() {
		this.flowing = false;
	}

	resume() {
		if(!this.flowing) {
			this.flowing = true;
			this.stream();
		}

		return this;
	}

	stream() {
		let dfb_input = this.input;
		let nl_input = dfb_input.size;
		let d_decoder = this.decoder;

		let dfr_reader = new FileReader();
		dfr_reader.onload = (d_event) => {
			let s_chunk = d_decoder.decode(d_event.target.result, {stream:!b_eof});
			this.emit('data', s_chunk);

			if(b_eof) {
				setTimeout(() => {
					this.emit('end');
				}, 0);
			}
			else if(this.flowing) {
				next();
			}
			else {
				this.read_index = i_read;
			}
		};

		let i_read = this.read_index;
		let b_eof = false;
		function next() {
			let i_end = i_read + this.chunk_size;  // always fetch current chunk_size value
			if(i_end >= nl_input) {
				i_end = nl_input;
				b_eof = true;
			}

			let dfb_slice = dfb_input.slice(i_read, i_end);
			i_read = i_end;

			dfr_reader.readAsArrayBuffer(dfb_slice);
		}

		next();
	}


	on(s_event, fk_event) {
		super.on(s_event, fk_event);

		if('data' === s_event) {
			if(this.flowing !== false) {
				this.resume();
			}
		}
	}

	reset() {
		this.read_index = 0;
	}
}

const D_ENCODER_UTF8 = new TextEncoder();
const F_SORT_SUFFIX = (h_a, h_b) => {
	return h_a.suffix < h_b.suffix? -1: 1;
};

const F_SORT_VALUE = (h_a, h_b) => {
	return h_a.value < h_b.value? -1: 1;
};


module.exports = Object.assign(H_CONSTANTS, {
	plain_map,
	dual_map_proxy,

	key_space,
	readable_blob,

	// classify nodes into hops, subjects, predicates, objects, and datatypes
	classify_nodes(h_nodes) {
		let a_nodes_h = [];
		let a_nodes_s = [];
		let a_nodes_p = [];
		let a_nodes_o = [];

		// separate nodes into categories
		for(let s_key in h_nodes) {
			let {
				type: x_node_type,
				id: i_uni,
			} = h_nodes[s_key];

			// classified item
			let h_item = {
				value: s_key,
				id: i_uni,
			};

			// a subject
			if(x_node_type & XM_NODE_SUBJECT) {
				// an object too
				if(x_node_type & XM_NODE_OBJECT) {
					// it's a hop
					a_nodes_h.push(h_item);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(h_item);
					}
				}
				// not an object
				else {
					// its a subject
					a_nodes_s.push(h_item);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(h_item);
					}
				}
			}
			// not a subject
			else {
				// an object
				if(x_node_type & XM_NODE_OBJECT) {
					a_nodes_o.push(h_item);
				}
				// a predicate
				if(x_node_type & XM_NODE_PREDICATE) {
					a_nodes_p.push(h_item);
				}
			}
		}

		return {
			h: a_nodes_h.sort(F_SORT_SUFFIX),
			s: a_nodes_s.sort(F_SORT_SUFFIX),
			p: a_nodes_p.sort(F_SORT_SUFFIX),
			o: a_nodes_o.sort(F_SORT_SUFFIX),
		};
	},

	// classify nodes into hops, subjects, predicates, objects, and datatypes
	classify_nodes_list(a_nodes) {
		let a_nodes_h = [];
		let a_nodes_s = [];
		let a_nodes_p = [];
		let a_nodes_o = [];

		// separate nodes into categories
		for(let i_node=0, n_nodes=a_nodes.length; i_node<n_nodes; i_node++) {
			let {
				value: s_value,
				id: i_uni,
				type: x_node_type,
			} = a_nodes[i_node];

			// classified item
			let h_item = {
				value: s_value,
				id: i_uni,
			};

			// a subject
			if(x_node_type & XM_NODE_SUBJECT) {
				// an object too
				if(x_node_type & XM_NODE_OBJECT) {
					// it's a hop
					a_nodes_h.push(h_item);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(h_item);
					}
				}
				// not an object
				else {
					// its a subject
					a_nodes_s.push(h_item);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(h_item);
					}
				}
			}
			// not a subject
			else {
				// an object
				if(x_node_type & XM_NODE_OBJECT) {
					a_nodes_o.push(h_item);
				}
				// a predicate
				if(x_node_type & XM_NODE_PREDICATE) {
					a_nodes_p.push(h_item);
				}
			}
		}

		return {
			h: a_nodes_h.sort(F_SORT_VALUE),
			s: a_nodes_s.sort(F_SORT_VALUE),
			p: a_nodes_p.sort(F_SORT_VALUE),
			o: a_nodes_o.sort(F_SORT_VALUE),
		};
	},


	// classify nodes into hops, subjects, predicates, objects, and datatypes
	classify_nodes_list_no_sort(a_nodes) {
		let a_nodes_h = [];
		let a_nodes_s = [];
		let a_nodes_p = [];
		let a_nodes_o = [];

		// separate nodes into categories
		for(let i_node=0, n_nodes=a_nodes.length; i_node<n_nodes; i_node++) {
			let {
				value: s_value,
				id: i_uni,
				type: x_node_type,
			} = a_nodes[i_node];

			// classified item
			let h_item = {
				value: s_value,
				id: i_uni,
			};

			// a subject
			if(x_node_type & XM_NODE_SUBJECT) {
				// an object too
				if(x_node_type & XM_NODE_OBJECT) {
					// it's a hop
					a_nodes_h.push(h_item);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(h_item);
					}
				}
				// not an object
				else {
					// its a subject
					a_nodes_s.push(h_item);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(h_item);
					}
				}
			}
			// not a subject
			else {
				// an object
				if(x_node_type & XM_NODE_OBJECT) {
					a_nodes_o.push(h_item);
				}
				// a predicate
				if(x_node_type & XM_NODE_PREDICATE) {
					a_nodes_p.push(h_item);
				}
			}
		}

		return {
			h: a_nodes_h,
			s: a_nodes_s,
			p: a_nodes_p,
			o: a_nodes_o,
		};
	},

	//
	classify_nodes_in_word_buffer(at_contents, at_ids, at_types) {

	},

	//
	encode_prefixed_terms(ab_prefix, a_terms, k_word_writer, h_map) {
		// encode every prefixed term into a word list
		for(let i_term=0, nl_terms=a_terms.length; i_term<nl_terms; i_term++) {
			let h_term = a_terms[i_term];

			// save mapping from term id => dict offset
			// k_map.put(h_term.id, k_word_writer.count);
			h_map[h_term.id] = k_word_writer.count;

			// write prefix
			k_word_writer.buffer.append(ab_prefix);

			// encode, write and commit suffix
			k_word_writer.append(D_ENCODER_UTF8.encode(h_term.value));
		}
	},

	classify_and_encode_nodes(ab_prefix, h_nodes, h_word_writers, h_uni_maps) {
		// classify nodes into sorted lists
		let h_classes = this.classify_nodes(h_nodes);

		// each class; encode its nodes
		for(let s_class in h_classes) {
			this.encode_prefixed_terms(ab_prefix, h_classes[s_class], h_word_writers[s_class], h_uni_maps[s_class]);
		}
	},
});
