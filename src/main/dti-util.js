
// copy contents of buffer from src to dest, expanding if needed
const commit = (ab_src, n_length, ab_dest, i_write) => {
	let n_copied = ab_src.copy(ab_dest, i_write);
	let i_read = n_copied;
	while(i_read < n_length) {
		i_write += n_copied;
		let ab_expand = Buffer.alloc(ab_dest.length + N_DEFAULT_ALLOCATION_SIZE);
		ab_dest.copy(ab_expand);
		ab_dest = ab_expand;
		n_length -= n_copied;
		n_copied = ab_src.copy(ab_dest, i_write, i_read);
		i_read += n_copied;
	}
	return ab_dest;
};



const X_TOKEN_ABSOLUTE_IRI = 0x01;
const X_TOKEN_BLANK_NODE = 0x02;
const X_TOKEN_UTF_16 = 0x03;
const X_TOKEN_PREFIX_FOLLOWS = 0x04;

const AB_ZERO = Buffer.from([0x00]);
// const AB_TOKEN_PREFIX_FOLLOWS = Buffer.from([X_TOKEN_PREFIX_FOLLOWS]);
const AB_TOKEN_ABSOLUTE_IRI = Buffer.from([0x02]);
// const AB_TOKEN_BLANK_NODE = Buffer.from([0x03]);
// const AB_TOKEN_UTF_16 = Buffer.from([0x04]);
const AB_TOKEN_DATATYPE = Buffer.from('^', 'utf-8');
const AB_TOKEN_LANGUAGE = Buffer.from('@', 'utf-8');
const AB_TOKEN_CONTENTS = Buffer.from('"', 'utf-8');


const XM_NODE_SUBJECT   = 1 << 0;
const XM_NODE_OBJECT    = 1 << 1;
const XM_NODE_PREDICATE = 1 << 2;
const XM_NODE_DATATYPE  = 1 << 3;

const XM_NODE_HOP = XM_NODE_SUBJECT | XM_NODE_OBJECT;



class front_coder {
	constructor(h_opt) {
		let {
			offset: i_offset=0,
			block_size: n_block_size=(1 << 4),
		} = h_opt;

		Object.assign(this, {
			offset: i_offset,
			block_size: n_block_size,
			write: 0,
			content: Buffer.allocUnsafe(N_DEFAULT_ALLOCATION_SIZE),
			block_indices: [],
			word_count: 0,
			defer: null,
		});
	}

	export() {
		let i_write = this.write;
		let n_words = this.word_count;
		let at_indices = new bus.uint_array(i_write)(n_words);
		at_indices.set(this.indices);
		return {
			block_size: this.block_size,
			content: this.content.slice(0, i_write),
			block_indices: at_indices,
			defer: this.defer,
			word_count: n_words,
		};
	}

	add(ab_section, a_indices) {
		let n_block_size = this.block_size;
		let i_write = this.write;
		let a_block_indices = this.block_indices;
		let n_words_total = this.word_count;

		// length of section
		let nl_section = ab_section.length;

		// read index in section
		let i_read = 0;

		// number of words in section
		let n_words_section = a_indices.length;

		// how many words have been processed in this section
		let c_words_section = 0;

		// this is the first local section
		if(!i_write) {
			// offset puts this amid an existing block
			let i_offset = this.offset;
			if(0 !== i_offset % n_block_size) {
				// jump to head word of new block
				c_words_section = n_block_size - (i_offset % n_block_size);

				// index of end of this range to skip
				let i_range_end = a_indices[c_words_section];

				// defer all words at once
				this.defer = {
					content: ab_section.slice(0, i_range_end),
					indices: a_indices.slice(0, c_words_section),
				};

				// update read index
				i_read = i_range_end;
			}
		}

		// while there are words to front code
		while(i_read < nl_section) {
			// fetch head word
			let i_word_end = a_indices[c_words_section++];
			let nl_word = i_word_end - i_read;
			let ab_word = ab_section.slice(i_read, i_word_end);
			i_read = i_word_end;

			// plainly encode head word in its entirety (including null termination)
			commit(ab_word, nl_head, ab_content, i_write);
			i_write += n_word;

			// front-code remainder of block
			while(i_read < nl_section) {
				// fetch word to be coded
				i_word_end = a_indices[c_words_section++];
				let nl_test = i_word_end - i_read;
				let ab_test = ab_section.slice(i_read, i_word_end);
				i_read = i_word_end;

				// how many chars to share
				let c_shared = 0;

				// scan until difference
				let n_limit = Math.min(nl_test, nl_word);
				do {
					if(ab_test[c_shared] !== ab_word[c_shared]) break;
				} while(++c_shared < n_limit);

				// encode shared chars as vbyte
				let ab_shared = bus.encode_pint(c_shared);
				let nl_shared = ab_shared.length;

				// write shared vbyte
				ab_content = bus.push(ab_content, i_write, ab_shared, nl_shared);
				i_write += nl_shared;

				// compute byte length of code
				let ab_byte_length = bus.encode_pint(nl_code);
				let nl_byte_length = ab_byte_length.length;

				// write byte length
				ad_content = bus.push(ab_content, i_write, ab_byte_length, nl_byte_length);
				i_write += nl_byte_length

				// write rest of word
				let nl_code = nl_code_word - c_shared;
				ab_content = bus.push(ab_content, i_write, ab_test.slice(c_shared), nl_code);
				i_write += nl_code;

				// update word
				ab_word = ab_test;
				nl_word = nl_test;
			}

			// write block index
			a_block_indices.push(i_write);
		}

		// mismatch
		if(c_words_section !== n_words_section) {
			throw 'did not process expected number of items';
		}

		// update word count
		this.word_count += c_words_section;
	}
}



module.exports = {
	constants: {

	},

	front_coder,

	group_nodes(h_nodes) {
		// create hops, subjects, predicates, objects, and datatypes
		let a_nodes_h = [];
		let a_nodes_s = [];
		let a_nodes_p = [];
		let a_nodes_o = [];
		let a_nodes_d = [];

		// separate nodes into categories
		for(let s_key in h_nodes) {
			let x_node_type = h_nodes[s_key];

			// a subject
			if(x_node_type & XM_NODE_SUBJECT) {
				// an object too
				if(x_node_type & XM_NODE_OBJECT) {
					// its a hop
					a_nodes_h.push(s_key);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(s_key);
					}
					// also a datatype
					if(x_node_type & XM_NODE_DATATYPE) {
						a_nodes_d.push(s_key);
					}
				}
				// not an object
				else {
					// its a subject
					a_nodes_s.push(s_key);

					// also a predicate
					if(x_node_type & XM_NODE_PREDICATE) {
						a_nodes_p.push(s_key);
					}
					// also a datatype
					if(x_node_type & XM_NODE_DATATYPE) {
						a_nodes_d.push(s_key);
					}
				}
			}
			// not a subject
			else {
				// its a predicate
				if(x_node_type & XM_NODE_PREDICATE) {
					a_nodes_p.push(s_key);
				}
				// its a datatype
				if(x_node_type & XM_NODE_DATATYPE) {
					a_nodes_d.push(s_key);
				}
			}
		}

		return {
			h: a_nodes_h.sort(),
			s: a_nodes_s.sort(),
			p: a_nodes_p.sort(),
			o: a_nodes_o.sort(),
			d: a_nodes_d.sort(),
		};
	},

	//
	encode_nodes(k_buffer_writer, a_terms, ab_prefix) {
		// encode every prefixed node into a word list
		a_terms.forEach((s_suffix) => {
			// encode node to word
			let ab_word = buffer_join_zero_terminate(ab_prefix, encode_utf_8(s_suffix));

			// commit word to list
			k_buffer_writer.append(ab_word);
		});
	},

	group_and_encode_nodes(h_nodes, ab_prefix, h_buffer_writers) {
		let h_groups = this.group_nodes(h_nodes);

		for(let s_group in h_groups) {
			this.encode_nodes(h_buffer_writers[s_group], h_groups[s_group], ab_prefix);
		}
	},
};
