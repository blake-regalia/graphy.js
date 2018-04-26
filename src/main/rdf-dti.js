
const buffer_util = require('../util/buffer.js');


const X_TOKEN_ABSOLUTE_IRI = 0x01;
const X_TOKEN_BLANK_NODE = 0x02;
const X_TOKEN_UTF_16 = 0x03;
const X_TOKEN_PREFIX_FOLLOWS = 0x04;

const AB_ZERO = Buffer.from([0x00]);
// const AB_TOKEN_PREFIX_FOLLOWS = Buffer.from([X_TOKEN_PREFIX_FOLLOWS]);
// const AB_TOKEN_ABSOLUTE_IRI = Buffer.from([0x02]);
// const AB_TOKEN_BLANK_NODE = Buffer.from([0x03]);
// const AB_TOKEN_UTF_16 = Buffer.from([0x04]);
const AB_TOKEN_DATATYPE = Buffer.from('^', 'utf-8');
const AB_TOKEN_LANGUAGE = Buffer.from('@', 'utf-8');
const AB_TOKEN_CONTENTS = Buffer.from('"', 'utf-8');



// reserved lo bit values
//   0 -> word delimiter
//   1 -> prefix follows
//   2 -> absolute iri
//   3 -> blank node
//   4 -> utf16-le
const A_KEY_RANGES = [
	0xff - 0x04,
	0xffff - 0x0404,
	0xffffff - 0x040404,
	0xffffffff - 0x04040404,
];
class key_generator {
	constructor(n_keys) {
		let n_key_bytes = 1;
		if(n_keys > A_KEY_RANGES[1]) {
			if(n_keys > A_KEY_RANGES[2]) {
				n_key_bytes = 4;
			}
			else {
				n_key_bytes = 3;
			}
		}
		else if(n_keys > A_KEY_RANGES[0]) {
			n_key_bytes = 2;
		}

		Object.assign(this, {
			key_count: n_keys,
			key_bytes: n_key_bytes,
			id: 0x05,
		});
	}

	produce(a_bytes) {
		while(a_bytes.length < this.key_bytes) {
			a_bytes.unshift(AB_TOKEN_PREFIX_FOLLOWS);
		}

		return Buffer.from(a_bytes);
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


const X_TYPE_SUBJECT   = 1 << 0;
const X_TYPE_OBJECT    = 1 << 1;
const X_TYPE_PREDICATE = 1 << 2;
const X_TYPE_DATATYPE  = 1 << 3;


const F_SORT_COUNT_DESC = (h_a, h_b) => {
	return h_a.count > h_b.count;
};


class Loader {
	constructor(h_config) {
		let {
			cores: n_cores,
		} = h_config;

		//
		let h_front_coder_config = {
			block_size: 16,
		};

		Object.assign(this, {
			prefix_groups: {},
			blank_nodes: {},
			absolute_nodes: {},
			literals: {
				absolute_datatype_count: 0,
				absolute_datatypes: {},
				language_count: 0,
				languages: {},
				plain: new Set(),
			},
			prefix_key: 0,
			worker_count: n_cores,
			workers: worker.pool('dti-data.js', n_cores),
			front_coders: {
				h: new dti.front_coder(h_front_coder_config),
				s: new dti.front_coder(h_front_coder_config),
				p: new dti.front_coder(h_front_coder_config),
				o: new dti.front_coder(h_front_coder_config),
				d: new dti.front_coder(h_front_coder_config),
			},
		});
	}

	save_named_node(h_term, n_type) {
		let h_prefix_groups = this.prefix_groups;

		// determine best prefix
		let m_compress = R_COMPRESS.exec(h_term.value);
		if(m_compress) {
			// destructure prefix fragments
			let [, p_prefix_iri, s_suffix] = m_compress;

			// for datatyped literals
			s_suffix += s_appendage;

			// first encounter of prefix
			if(!(p_prefix_iri in h_prefix_groups)) {
				// create prefix map; assign node
				h_prefix_groups[p_prefix_iri] = {
					key: this.prefix_key++,
					node_count: 1,
					nodes: {
						[s_suffix]: n_type,
					},
				};
			}
			// prefix exists
			else {
				let h_group = h_prefix_groups[p_prefix_iri];
				let h_nodes = h_group.nodes;

				// first encounter of node; set type and increment prefix's node counter
				if(!(s_suffix in h_nodes)) {
					h_group.node_count += 1;
					h_nodes[s_suffix] = n_type;
				}
				// update node type
				else {
					h_nodes[s_suffix] |= n_type;
				}
			}
		}
		// node could not be prefixed
		else {
			let p_iri = h_term.value;
			let h_nodes = this.absolute_nodes;

			// first encounter of node; set type
			if(!(p_iri in h_nodes)) {
				h_nodes[p_iri] = n_type;
			}
			// update node type
			else {
				h_nodes[p_iri] |= n_type;
			}
		}
	}

	save_datatyped_literal(h_literal) {
		let h_prefix_groups = this.prefix_groups;

		let s_value = h_literal.value;

		// determine best prefix
		let m_compress = R_COMPRESS.exec(h_literal.datatype.value);
		if(m_compress) {
			// destructure prefix fragments
			let [, p_prefix_iri, s_suffix] = m_compress;

			// first encounter of prefix
			if(!(p_prefix_iri in h_prefix_groups)) {
				// create prefix map; assign node
				h_prefix_groups[p_prefix_iri] = {
					key: this.prefix_key++,
					datatype_count: 1,
					datatypes: {
						[s_suffix]: new Set([s_value]),
					},
				};
			}
			// prefix exists
			else {
				let h_group = h_prefix_groups[p_prefix_iri];

				// first datatype for thie prefix
				if(!('datatypes' in h_group)) {
					Object.assign(h_group, {
						datatype_count: 1,
						datatypes: {
							[s_suffix]: new Set([s_value]),
						},
					});
				}
				// other datatype with prefix exists
				else {
					let h_datatypes = h_group.datatypes;

					// first encounter of this datatype
					if(!(s_suffix in h_datatypes)) {
						h_group.datatype_count += 1;
						h_datatypes[s_suffix] = new Set([s_value]);
					}
					// add literal to datatype's set
					else {
						h_datatypes[s_suffix].add(s_value);
					}
				}
			}
		}
		// node could not be prefixed
		else {
			let p_iri = h_term.value;
			let h_literals = this.literals;
			let h_datatypes = h_literals.absolute_datatypes;

			// first encounter of node; set type
			if(!(p_iri in h_datatypes)) {
				h_literals.absolute_datatype_count += 1;
				h_datatypes[p_iri] = new Set([s_value]);
			}
			// add literal to datatype's set
			else {
				h_datatypes[p_iri].add(s_value);
			}
		}
	}

	save_language_literal(h_literal) {
		let h_literals = this.literals;
		let h_languages = h_literals.languages;

		let s_value = h_literal.value;
		let s_lang = h_literal.language;

		// first encounter of language tag
		if(!(s_lang in h_languages)) {
			h_literals.language_count += 1;
			h_languages[s_lang] = new Set([s_value]);
		}
		// another litera exists with same language tag; add literal to language's set
		else {
			h_languages[s_lang].add(s_value);
		}
	}

	save_plain_literal(h_literal) {
		// add literal to plain's set
		this.literals.plain.add(h_literal.value);
	}

	save_blank_node(h_term, n_type) {
		let h_blank_nodes = this.blank_nodes;

		let p_label = h_term.value;

		// first encounter of node; set type
		if(!(p_label in h_blank_nodes)) {
			h_blank_nodes[p_label] = n_type;
		}
		// update node type
		else {
			h_blank_nodes[p_label] |= n_type;
		}
	}

	divide_prefix_tasks() {
		let h_prefix_groups = this.prefix_groups;
		let n_workers = this.worker_count;

		// count nodes
		let c_nodes = 0;

		// convert to list
		let a_prefixes = [];
		for(let p_prefix_iri in h_prefix_groups) {
			let h_group = h_prefix_groups[p_prefix_iri];

			// no nodes in this group
			if(!('nodes' in h_group)) continue;

			let n_nodes = h_group.node_count;
			let h_nodes = h_group.nodes;

			// add to cumulative total
			c_nodes += n_nodes;

			// add to list of prefixes for sorting
			a_prefixes.push({
				// key: h_nodes[HP_KEY],
				count: n_nodes,
				nodes: h_nodes,
			});
		}

		// do not hold up gc later
		this.prefix_groups = null;

		// sort list
		a_prefixes.sort(F_SORT_COUNT);

		// prep to assign prefix keys
		let n_prefixes = a_prefixes.length;
		let k_prefix_keygen = new key_generator(n_prefixes);
		let n_prefix_key_bytes = k_prefix_keygen.key_bytes;

		// target number of nodes per worker
		let x_items_per_worker = c_nodes / n_workers;

		// number of nodes remaining
		let c_items_remain = c_nodes;

		// worker assignments
		let a_worker_tasks = [];
		for(let i_worker=0; i_worker<n_workers; i_worker++) {
			// make buffer for prefix keys to pass to worker
			let n_max_bytes = Math.ceil((n_prefixes*n_prefix_key_bytes) / n_workers);
			let ab_prefix_keys = Buffer.allocUnsafeSlow(n_max_bytes);
			ab_prefix_keys.fill(X_TOKEN_PREFIX_FOLLOWS);

			// add worker task
			a_worker_tasks.push({
				prefixes: [],
				prefix_keys: ab_prefix_keys,
				prefix_key_bytes: n_prefix_key_bytes,
			});
		}

		// balance worker loads
		let i_worker = 0;
		let h_worker_task = a_worker_tasks[i_worker];

		// initialize
		let c_worker_items;
		{
			let h_initial_prefix = a_prefixes[0];
			h_worker_task.prefixes.push(h_initial_prefix);
			c_worker_items = h_initial_prefix.count;
		}

		for(let i_prefix=1; i_prefix<n_prefixes; i_prefix++) {
			let h_prefix = a_prefixes[i_prefix];
			let n_items = h_prefix.count;

			// adding this to current task would exceed target limit
			if(((c_worker_items + n_items) > x_items_per_worker) && i_worker < n_workers-1) {
				// advance worker
				h_worker_task = a_worker_tasks[i_worker++];

				// recompute target items per worker
				c_items_remain -= c_worker_items;
				x_items_per_worker = c_items_remain / (n_workers - i_worker);
				c_worker_items = 0;
			}

			// the prefixes it currently holds
			let a_task_prefixes = h_worker_task.prefixes;

			// assign prefix key
			k_prefix_keygen.next(h_worker_task.prefix_keys, a_task_prefixes.length*n_prefix_key_bytes);

			// push to current worker
			a_task_prefixes.push(h_prefix);

			// 
			c_worker_items += n_items;
		}

		return a_worker_tasks;
	}

	divide_plain_literal_tasks() {
		let n_workers = this.worker_count;
		let h_literals = this.literals;

		let n_literals = h_literals.plain_count;
		let n_literals_per_worker = Math.floor(n_literals / n_workers);

		let c_literals = 0;
		let c_workers_remain = n_worker_count;

		// divide set of literals into list of buffers
		let a_divisions = [];
		let k_buffer_writer = new bus.buffer_writer({force_malloc:true});

		// make generator for dividing this many literals
		let dg_divider = this.workers.divider(n_literals);

		// divide literals into buffers
		for(let s_literal of h_literals.plain) {
			let ab_content = encode_utf_8(s_literal);
			let ab_word = Buffer.concat([AB_TOKEN_CONTENTS, ab_content, AB_ZERO], 1+ab_content.length+1);
			k_buffer_writer.append(ab_word);

			// divide here
			if(dg_divider.next().value) {
				a_divisions.push(k_buffer_writer.close());
				k_buffer_writer = new bus.buffer_writer({force_malloc:true});
			}
		}

		// final division
		a_divisions.push(k_buffer_writer.close());


		// let s_timer = 'plain literal sort/divide/encode';
		// console.time(s_timer);

		// // sort plain literals
		// this.workers.divide(, {
		// 	item_count: n_literals,
		// }).map((a_division) => {
		// 	// transform into buffer
		// 	let k_buffer_writer = new bus.buffer_writer();
		// 	a_division.forEach((s_literal) => {
		// 		k_buffer_writer.append(encode_utf_8(s_literal));
		// 	});
		// 	return k_buffer_writer.close();
		// });

		// console.timeEnd(s_timer);

		// h_literals.plain.forEach((s_literal) => {
		// 	// append 
		// 	k_buffer_writer.append(encode_utf_8(s_literal));

		// 	if((++c_literals === n_literals_per_worker) && c_workers_remain) {
		// 		c_workers_remain -= 1;
		// 		a_divisions.push(k_buffer_writer.close());
		// 		k_buffer_writer = new bus.buffer_writer({force_malloc:true});
		// 	}
		// });

		return a_divisions;
	}

	divide_language_literal_tasks() {
		let n_workers = this.worker_count;
		let h_languages = this.languages;

		let c_literals = 0;

		// convert to list
		let a_languages = [];
		for(let s_lang in h_languages) {
			let as_literals = h_languages[s_lang];

			// number of literals
			let n_literals = as_literals.size;

			// add to cumulative total
			c_literals += n_literals;

			// add to list of languages for sorting
			a_languages.push({
				tag: s_lang,
				count: n_literals,
				literals: as_literals,
			});
		}

		// do not hold up gc later
		this.languages = null;

		// sort list
		a_languages.sort(F_SORT_COUNT_DESC);

		// target number of literals per worker
		let x_items_per_worker = c_literals / n_workers;

		// number of literals remaining
		let c_items_remain = c_literals;

		// worker assignments
		let a_worker_tasks = [];
		for(let i_worker=0; i_worker<n_workers; i_worker++) {
			// add worker task
			a_worker_tasks.push({
				literals: [],
			});
		}


		// divide hash of languages

	}

	encode_absolute_nodes(h_buffer_writers) {
		// group and encode nodes
		dti.group_and_encode_nodes(this.absolute_nodes, AB_TOKEN_ABSOLUTE_IRI, h_buffer_writers);

		// release to gc
		this.absolute_nodes = null;
	}

	encode_blank_nodes(h_buffer_writers) {
		// group and encode nodes
		dti.group_and_encode_nodes(this.blank_nodes, AB_TOKEN_BLANK_NODE, h_buffer_writers);

		// release to gc
		this.blank_nodes = null;
	}

	front_code_buffers(h_buffer_writers) {
		// each buffer writer
		for(let s_symbol in h_buffer_writers) {
			// close buffer writer to fetch its buffer and indices
			let {
				buffer: ab_words,
				indices: a_indices,
			} = h_buffer_writers[s_symbol].close();

			// add section to the group's front coder
			this.front_coder[s_symbol].add(ab_words, a_indices);
		}
	}

	divide_word_list(h_list) {
		let ab_content = h_list.buffer;
		let at_indices = h_list.indices;

		let a_divisions = [];

		let i_word_lo = 0;
		let i_read_lo = 0;
		this.workers.divisions(at_indices.length).forEach((i_word_hi) => {
			let i_read_hi = at_indices[i_word_hi-1];
			a_divisions.push({
				buffer: ab_content.slice(i_read_lo, i_read_hi),
				indices: at_indices.slice(i_word_lo, i_word_hi),
			});

			i_word_lo = i_word_hi - 1;
			i_read_lo = at_indices[i_word_lo++];
		});

		// final division
		a_divisions.push({
			buffer: ab_content.slice(i_read_lo, at_indicies[nl_indices-1]),
			indices: at_indicies.slice(i_word_lo, nl_indices-1),
		});

		return a_divisions;
	}

	load(d_blob) {
		// 
		let b_prefix_change = false;

		async.series([
			// stage 1
			(fk_stage) => this.deserialize({

				//
				split: [],

				//
				split_reached(i_byte_offset) {
					a_split_indices.push(i_byte_offset);
				},

				// if any prefix changes, final map is not valid for whole document
				prefix_change() {
					b_prefix_change = true;
				},

				// each triple
				data: (h_triple) => {
					// ref all positions of triple
					let {
						subject: h_subject,
						predicate: h_predicate,
						object: h_object,
					} = h_triple;

					// subject is named node
					if(h_subject.isNamedNode) {
						this.save_named_node(h_subject, X_TYPE_SUBJECT);
					}
					// subject is blank node
					else {
						this.save_blank_node(h_subject, X_TYPE_SUBJECT);
					}

					// predicate is always named node
					this.save_named_node(h_predicate, X_TYPE_PREDICATE);

					// object is literal
					if(h_object.isLiteral) {
						// ... a language literal
						if(h_object.language) {
							this.save_language_literal(h_object);
						}
						// ... a datatyped literal
						else if(h_object.hasOwnProperty('datatype')) {
							// datatype is always a named node
							this.save_datatyped_literal(h_object);
						}
						// ... a plain literal
						else {
							this.save_plain_literal(h_object);
						}
					}
					// object is named node
					else if(h_object.isNamedNode) {
						this.save_named_node(h_object, X_TYPE_OBJECT);
					}
					// object is blank node
					else {
						this.save_blank_node(h_object, X_TYPE_OBJECT);
					}
				},

				// eof
				end: () => {
					let k_workers = this.workers;
					let n_workers = this.worker_count;
					let h_front_coders = this.front_coders;

					// literal's front coder
					let k_front_coder_literals = new dti.front_coder();

					// prep buffer writers for building dict sections
					let h_buffer_writers = {};
					for(let s_symbol in h_front_coders) {
						h_buffer_writers[s_symbol] = new bus.buffer_writer();
					}

					// encode absolute and blank nodes first (their buffer tokens sort them at the beginning)
					this.encode_absolute_nodes(h_buffer_writers);
					this.encode_blank_nodes(h_buffer_writers);

					// front code buffers and then release to gc
					this.front_code_buffers(h_buffer_writers);
					h_buffer_writers = null;

					// split prefixes into tasks for cores
					let a_prefix_tasks = this.divide_prefix_tasks();

					// serially increment counts of words as workers finish first task
					let c_words_h = 0;	
					let c_words_s = 0;	
					let c_words_p = 0;	
					let c_words_o = 0;	
					let c_words_d = 0;

					k_workers
						// sort plain literals' word lists
						.dispatch({
							task: 'sort_word_list',
							data: a_plain_literal_tasks,
						})
						// merge sorted lists into single word list
						.reduce({
							task: 'merge_word_lists',
						}, (h_word_lists_plain_literal) => {
							// make sure literal dict fragments wait for dependencies
							k_workers.lock('plain_literals');
							k_workers.lock('language_literals');

							// add to outer stream
							return k_workers
								// front code plain literals' word list
								.dispatch({
									task: 'front_code_word_list',
									data: this.divide_word_list(h_word_lists_plain_literal),
								})
								// import each section to literal's front coder
								.sequence((h_section) => {
									k_front_coder_literals.import(h_section);
								}, () => {
									k_workers.unlock('plain_literals');
								})
								// e
								.dispatch({
									task: 'encode_language_literals',
									data: [],
								})
								.sequence((h_response) => {

									return {
										task: 'front_code_language_literals',
									};
								})
								.sequence((h_section) => {
									k_workers.wait('plain_literals', () => {
										k_front_coder_literals.import(h_section);
									});
								}, () => {
									k_workers.unlock('language_literals');
								})
								.dispatch({
									task: 'encode_datatyped_literals',
									data: [],
								})
								.sequence(() => {

								})
								.sequence((h_section) => {
									k_workers.wait('language_literals', () => {
										k_front_coder_literals.import(h_section);
									});
								});
						})
						.dispatch({
							task: 'encode_prefixed_nodes',
							data: a_prefix_tasks,
						})
						.sequence((h_response, i_response) => {
							let h_counts = h_response.counts;

							// increment counts
							c_words_h += h_counts.h;
							c_words_s += h_counts.s;
							c_words_p += h_counts.p;
							c_words_o += h_counts.o;
							c_words_d += h_counts.d;

							// assign each worker its next task of front coding prefixed nodes
							return {
								task: 'front_code_prefixed_nodes',
								args: [{
									h: c_words_h,
									s: c_words_s,
									p: c_words_p,
									o: c_words_o,
									d: c_words_d,
								}],
							};
						})
						.sequence((h_response, i_response) => {
							// import each front coded group
							for(let s_group in h_response) {
								h_front_coders[s_group].import(h_response[s_group]);
							}
						}).dispatch({
							task: 'encode_plain_literals',
							data: a_literal_tasks,
						}).sequence(() => {

						})
						.end(() => {
							fk_stage();
						});
				},
			}),

			// stage 2
			(fk_stage) => {
				// not yet supported
				if(b_prefix_change) {
					throw 'not all prefixes are consistent throughout the input document. cannot parallelize parsing';
				}

				// each split
				let i_byte_start = 0;
				a_split_indices.forEach((i_byte_end) => {
					// force another core to handle
					this.fork(d_blob.slice(i_byte_start, i_byte_end));

					// advance index
					i_byte_end = i_byte_start;
				});
			},
		]);
	}
}



const N_DEFAULT_ALLOCATION_SIZE = 64 * 1024;  // 64 KiB



const worker = require('worker');
const buffer_util = require('../util/buffer.js');
const {
	commit,
} = buffer_util;

const encode_utf_8 = (s_chunk) => Buffer.from(s_chunk, 'utf-8');
const encode_utf_16 = (s_chunk) => {
	// encode chunk as utf-16le
	let ab_chunk = Buffer.from(s_chunk, 'utf-16le');

	// prefix buffer w/ utf-16 token
	return Buffer.concat([AB_UTF_16_TOKEN, ab_chunk], ab_chunk.length + 1);
};

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
					: new RangeError('uint size too large'))));


const buffer_join_zero_terminate = (ab_a, ab_b) => {
	return Buffer.concat([ab_a, ab_b, AB_ZERO], ab_a.length + ab_b.length + 1);
};







worker.dedicated({

	// encode list of plain literals
	encode_plain_literals(h_data) {
		let {

		} = h_data;


	},

	merge_word_lists(h_a, h_b) {
		let {
			buffer: ab_content_a,
			indices: a_indices_a,
		} = h_a;

		let {
			buffer: at_content_b,
			indices: a_indices_b,
		} = h_b;

		// create buffer atop uint8array
		let ab_content_b = Buffer.from(at_content_b);

		let n_words_a = a_indices_a.length;
		let n_words_b = a_indices_b.length;

		// write head and output word list length
		let i_write_c = 0;
		let n_words_c = n_words_a + n_words_b;

		// output buffer & indicies
		let nl_content_c = ab_content_a.length + ab_content_b.length;
		let ab_content_c = Buffer.allocUnsafe(nl_content_c);
		let at_indices_c = new bus.uint_array(nl_content_c)(n_words_c);

		let i_word_a = 0;
		let i_word_b = 0;

		let i_end_a = a_indices_a[i_word_a];
		let i_end_b = a_indices_b[i_word_b];

		let nl_word_a = i_end_a - i_word_a;
		let nl_word_b = i_end_b - i_word_b;

		let i_read_a = 0;
		let i_read_b = 0;

		for(let i_word_c=0; i_word_c<n_words_c; i_word_c++) {
			let n_chars = Math.min(nl_word_a, nl_word_b);

			// tie goes to shorter word
			let b_win_a = nl_word_a < nl_word_b;

			// compare words char by char
			for(let i_char=0; i_char<n_chars; i_char++) {
				let x_char_a = ab_content_a[i_read_a+i_char];
				let x_char_b = ab_content_b[i_read_b+i_char];

				if(x_char_a === x_char_b) continue;
				else if(x_char_a < x_char_b) b_win_a = true;
				else b_win_a = false;

				break;
			}

			// a side wins; copy to output
			if(b_win_a) {
				ab_content_a.copy(ab_content_c, i_write_c, i_read_a, i_end_a);
				i_write_c += nl_word_a;
				at_indices_c[i_word_c] = i_write_c;

				// reached end of list a; copy remaining b list to output
				if(++i_word_a === n_words_a) {
					ab_content_b.copy(ab_content_c, i_write_c, i_read_b, a_indices_b[nl_word_b-1]);
				}

				// advance indexes and word length for next iterations
				i_read_a = i_end_a;
				i_end_a = a_indices_a[i_word_a];
				nl_word_a = i_end_a - i_read_a;
			}
			// b side wins; copy to output
			else {
				ab_content_b.copy(ab_content_c, i_write_c, i_read_b, i_end_b);
				i_write_c += nl_word_b;
				at_indices_c[i_word_c] = i_write_c;

				// reached end of list b; copy remaining a list to output
				if(++i_word_b === n_words_b) {
					ab_content_a.copy(ab_content_c, i_write_c, i_read_a, a_indices_a[nl_word_a-1]);
				}

				// advance indexes and word length for next iterations
				i_read_b = i_end_b;
				i_end_b = a_indices_b[i_word_b];
				nl_word_b = i_end_b - i_read_b;
			}
		}

		return {
			buffer: ab_content_c,
			indices: at_indices_c,
		};
	},

	// encode lists of nodes grouped by prefix into a buffer
	encode_prefixed_nodes(h_data) {
		let {
			prefixes: a_prefixes,
			prefix_keys: at_prefix_keys,
			prefix_key_bytes: n_prefix_key_bytes,
		} = h_data;

		// create buffer atop uint8array
		let ab_prefix_keys = Buffer.from(at_prefix_keys);

		// word lists
		let h_buffer_writers = {
			h: bus.buffer_writer(),
			s: bus.buffer_writer(),
			p: bus.buffer_writer(),
			o: bus.buffer_writer(),
			d: bus.buffer_writer(),
		};

		// each prefix
		a_prefixes.map((h_prefix, i_prefix) => {
			let h_nodes = h_prefix.nodes;

			// fetch key from buffer
			let i_prefix_key = i_prefix * n_prefix_key_bytes;
			let ab_prefix_key = ab_prefix_keys.slice(i_prefix_key, i_prefix_key+n_prefix_key_bytes);

			// group nodes based on type
			dti.group_and_encode_nodes(h_nodes, ab_prefix_key, h_buffer_writers);
		});

		// store dict data for next task on this worker
		this.put('writers', h_buffer_writers);

		// only pass counts back to main thread
		return {
			counts: {
				h: h_buffer_writers.h.count,
				s: h_buffer_writers.s.count,
				p: h_buffer_writers.p.count,
				o: h_buffer_writers.o.count,
				d: h_buffer_writers.d.count,
			},
		};
	},

	// front code prefixed nodes
	front_code_prefixed_nodes(h_sections) {
		// fetch buffer writers from previous task
		let h_buffer_writers = this.get('writers');

		let h_front_coders = {};

		// each section
		for(let s_section in h_buffer_writers) {
			// start front coder off at the right offset
			let k_front_coder = new dti.front_coder({
				offset: h_sections[s_section],
				block_size: 16,
			});

			// front code this section
			let {
				buffer: ab_words,
				indices: a_indices,
			} = h_temp[s_section].close();
			k_front_coder.add(ab_words, a_indices);

			// return appropriate parts to main thread
			h_front_coders[s_section] = k_front_coder.export();
		}

		// send back front coded buffers (let library figure out what to transfer)
		return worker.response(h_front_coders, true);
	},

});



