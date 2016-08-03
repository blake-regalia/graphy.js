const stream = require('stream');

const LinkedGraph = require('./lazy-linked-graph.js');

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

const X_TERMINUS = 0;


class Consumer extends stream.Writable {

	constructor(ds_input, h_config={}) {
		super();

		this.graph = new LinkedGraph();
		this.config = h_config;

		this.state = 0;
		this.previous = null;

		this.bytes_per_element = 1;
		this.bytes_needed = 1;
		this.read_method = '';
		this.section_index = 0;
		this.item_count = 0;

		this.sections = [
			{ type: 2, key: 'prefixes' },
			{ type: 0, key: 'dict_d' },
			{ type: 0, key: 'dict_s' },
			{ type: 0, key: 'dict_o' },
			{ type: 0, key: 'dict_l' },
			{ type: 0, key: 'dict_p' },
			{ type: 1, key: 'data_p' },
			{ type: 1, key: 'data_o' },
		];

		this.section = this.sections.shift();

		// read stream
		ds_input.pipe(this);
	}

	_write(db_chunk, s_encoding, f_okay) {
		if('string' === typeof db_chunk) {
			db_chunk = Buffer.from(db_chunk, s_encoding);
		}

		// augment chunk with previous leftovers
		if(this.previous) {
			db_chunk = Buffer.concat([this.previous, db_chunk], this.previous.length + db_chunk.length);
			this.previous = null;
		}

		// ref graph
		let k_graph = this.graph;

		// cache current chunk length
		let n_chunk_length = db_chunk.length;

		// prep to track state, read method, and how many bytes the next unit requires
		let b_state = this.state;
		let s_read_method = this.read_method;
		let n_bytes_needed = this.bytes_needed;

		// ref current section
		let h_section = this.section;

		// start reading chunk from beginning
		let i_reader = 0;
		while(n_chunk_length - i_reader >= n_bytes_needed) {
			// typed array
			if(h_section.type <= 1) {
				// payload data
				if(2 === b_state) {
					let a_section = k_graph[h_section.key];
					let n_section = a_section.length;
					let i_section = this.section_index;

					// prep to count number of items
					let c_items = this.item_count;

					// scan buffer and extract items along the way
					let i_buffer_end = n_chunk_length - n_bytes_needed;
					while(i_section < n_section && i_reader <= i_buffer_end) {
						// move item to designated position in array buffer via TypedArray setter
						let x_unit = db_chunk[s_read_method](i_reader);
						a_section[i_section++] = x_unit;

						// unit is terminus; increment item counter
						if(X_TERMINUS === x_unit) c_items++;

						// advance reader index
						i_reader += n_bytes_needed;
					}

					// cleared entire payload
					if(i_section === n_section) {
						console.log('loaded '+h_section.key);
						// dict section
						if(0 === h_section.type) {
							k_graph['count_'+h_section.key.slice('dict_'.length)] = c_items;
						}

						// reset state
						b_state = 0;

						// reset item counter
						this.item_count = 0;

						// advance section
						h_section = this.sections.shift();
					}
					// more to come
					else {
						// remember where we left off
						this.section_index = i_section;
						this.item_count = c_items;
					}
				}
				// start of new payload
				else if(0 === b_state) {
					// only for data sections
					if(1 === h_section.type) {
						// this byte indicates how many bytes per element the upcoming payload array needs
						this.bytes_per_element = db_chunk.readUInt8(i_reader++);
					}

					// the next unit is going to be a 32-bit word indicating length of the payload array
					n_bytes_needed = 4;

					// advance state to length reader
					b_state += 1;
				}
				// length of upcoming array
				else if(1 === b_state) {
					let d_typed_array = H_TYPED_ARRAYS[this.bytes_per_element];
					s_read_method = H_READ_METHODS[this.bytes_per_element];

					// create new TypedArray of the necessary type with the given size
					k_graph[h_section.key] = new d_typed_array(db_chunk.readUInt32LE(i_reader));

					// we just read this 32-bit word
					i_reader += 4;

					// reset payload section pointer and item counter
					this.section_index = 0;

					// expect so many bytes per item now that payload is next
					n_bytes_needed = this.bytes_per_element;

					// advance to payload data state
					b_state += 1;
				}
			}
			// hash (all utf8)
			else if(2 === h_section.type) {
				// scan buffer and extract items along the way
				let i_buffer_end = n_chunk_length - n_bytes_needed;
				while(i_reader <= i_buffer_end) {
					//
					let i_eop = db_chunk.indexOf(0, i_reader);

					// interrupted by end of chunk
					if(-1 === i_eop) break;

					// end of payload
					if(i_reader === i_eop) {
						// reset state
						b_state = 0;

						// advance reader
						i_reader += 1;

						// advance section
						h_section = this.sections.shift();
						break;
					}

					// extract key and value
					let i_split = db_chunk.indexOf(58, i_reader);
					let s_key = db_chunk.toString('utf8', i_reader, i_split);
					let s_value = db_chunk.toString('utf8', i_split+1, i_eop);

					// save to hash
					k_graph[h_section.key][s_key] = s_value;

					// advance reader
					i_reader = i_eop + 1;
				}
			}
		}

		// store state variables for next pass
		this.read_method = s_read_method;
		this.bytes_needed = n_bytes_needed;
		this.state = b_state;
		this.section = h_section;

		// data remains in buffer
		if(i_reader < db_chunk.length) {
			// store remainder
			this.previous = Buffer.from(db_chunk.slice(i_reader));
		}

		// done reading this chunk
		f_okay();
	}

	end() {
		// ref graph
		let k_graph = this.graph;

		// create indexes
		k_graph.index();

		// create prefix inverse
		for(let s_prefix_id in k_graph.prefixes) {
			let s_prefix_iri = k_graph.prefixes[s_prefix_id];
			k_graph.prefix_lookup[s_prefix_iri] = s_prefix_id;
		}

		// ref config
		let h_config = this.config;

		// load user prefixes
		this.graph.add_prefixes(this.config.prefixes || {});

		//
		h_config.ready && h_config.ready(k_graph);
	}
}


module.exports = {
	load(ds_input, h_config) {
		return new Consumer(ds_input, h_config);
	},
};

