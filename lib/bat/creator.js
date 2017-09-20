const async = require('async');
const worker = require('worker');

const bus = require('./bus');
const bat = require('./bat');


const F_SORT_COUNT_DESC = (h_a, h_b) => {
	return h_a.count > h_b.count;
};


class Creator {
	constructor(h_config) {
		//
		let h_front_coder_config = {
			block_size: 16,
		};

		Object.assign(this, {
			prefix_groups: {},
			prefix_iris: [],
			prefix_node_count: 0,
			datatype_node_count: 0,
			prefix_key_bytes: 0,

			prefix_nodes: null,
			prefix_datatypes: null,

			blank_nodes: {},
			absolute_nodes: {},
			literals: {
				absolute_datatype_count: 0,
				absolute_datatypes: {},
				language_count: 0,
				languages: {},
				plain: new Set(),
				front_coder: new bat.front_coder(h_front_coder_config),
			},
			workers: worker.pool('worker.js'),
			front_coders: {
				h: new bat.front_coder(h_front_coder_config),
				s: new bat.front_coder(h_front_coder_config),
				p: new bat.front_coder(h_front_coder_config),
				o: new bat.front_coder(h_front_coder_config),
			},
		});

		this.worker_count = this.workers.worker_count;
	}

	save_named_node(h_term, n_type) {
		let h_prefix_groups = this.prefix_groups;
		let a_prefix_iris = this.prefix_iris;

		let p_iri = h_term.value;

		// determine best prefix
		let m_compress = bat.R_COMPRESS.exec(p_iri);
		if(m_compress) {
			// destructure prefix fragments
			let [, p_prefix_iri, s_suffix] = m_compress;

			// first encounter of prefix
			if(!(p_prefix_iri in h_prefix_groups)) {
				// create prefix map; assign node
				h_prefix_groups[p_prefix_iri] = {
					id: a_prefix_iris.push(p_prefix_iri)-1,
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
		let a_prefix_iris = this.prefix_iris;

		let p_datatype_iri = h_literal.datatype.value;
		let s_value = h_literal.value;

		// determine best prefix
		let m_compress = bat.R_COMPRESS.exec(p_datatype_iri);
		if(m_compress) {
			// destructure prefix fragments
			let [, p_prefix_iri, s_suffix] = m_compress;

			// first encounter of prefix
			if(!(p_prefix_iri in h_prefix_groups)) {
				// create prefix map; assign node
				h_prefix_groups[p_prefix_iri] = {
					id: a_prefix_iris.push(p_prefix_iri)-1,
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
			let h_literals = this.literals;
			let h_datatypes = h_literals.absolute_datatypes;

			// first encounter of node; set type
			if(!(p_datatype_iri in h_datatypes)) {
				h_literals.absolute_datatype_count += 1;
				h_datatypes[p_datatype_iri] = new Set([s_value]);
			}
			// add literal to datatype's set
			else {
				h_datatypes[p_datatype_iri].add(s_value);
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

	divide_prefixes() {
		let h_prefix_groups = this.prefix_groups;
		let a_prefix_iris = this.prefix_iris;

		// turn hash into list and create item count
		let a_prefixes = [];
		for(let p_prefix_iri in h_prefix_groups) {
			let h_group = h_prefix_groups[p_prefix_iri];

			// sum counts
			h_group.count = (h_group.node_count || 0) + (h_group.datatype_count || 0);

			// push group to list for sorting
			a_prefixes.push(h_group);
		}

		// sort prefixes by counts
		a_prefixes.sort(F_SORT_COUNT_DESC);

		// prep prefix key assignment
		let n_prefixes = a_prefixes.length;

		// calculate number of bytes needed for prefix keys
		this.prefix_key_bytes = (new bat.key_generator(n_prefixes)).key_bytes;

		// while traversing sorted prefixes, separate nodes and datatypes (save to fields)
		let a_nodes = this.prefix_nodes = [];
		let a_datatypes = this.prefix_datatypes = [];

		// count total prefix nodes and datatypes
		let c_nodes = 0;
		let c_datatypes = 0;

		// make prefix word list
		let k_buffer_writer = new bus.buffer_writer();
		for(let i_prefix=0; i_prefix<n_prefixes; i_prefix++) {
			let h_prefix = a_prefixes[i_prefix];
			let p_prefix_iri = a_prefix_iris[h_prefix.id];

			// write iri to prefix word list
			let ab_iri = bus.encode_utf_8(p_prefix_iri);
			let ab_word = Buffer.concat([ab_iri, bus.AB_ZERO], ab_iri.length+1);
			k_buffer_writer.append(ab_word);

			// nodes
			if('nodes' in h_prefix) {
				let n_nodes = h_prefix.node_count;
				c_nodes += n_nodes;
				a_nodes.push({
					prefix_id: h_prefix.id,
					count: n_nodes,
					items: h_prefix.nodes,
				});
			}
			// datatypes
			if('datatypes' in h_prefix) {
				let n_datatypes = h_prefix.datatype_count;
				c_datatypes += n_datatypes;
				a_datatypes.push({
					prefix_id: h_prefix.id,
					count: n_datatypes,
					items: h_prefix.datatypes,
				});
			}
		}

		// save counts
		this.prefix_node_count = c_nodes;
		this.datatype_node_count = c_datatypes;

		// done with prefix iri list and prefix groups
		this.prefix_iris = null;
		this.prefix_groups = null;

		// divide and return prefix word list for front coding
		return this.divide_word_list(k_buffer_writer.close());
	}

	divide_prefix_nodes() {
		// divide prefix nodes
		return this.workers.balance_ordered_groups(this.prefix_nodes, {
			item_count: this.prefix_node_count,

			// when a new task is created
			open: (a_groups) => {
				// put list into a hash and create list of prefix ids
				return {
					nodes: a_groups,
					prefix_ids: [],
					prefix_key_bytes: this.prefix_key_bytes,
				};
			},

			// each group
			quantify: (h_group, h_data) => {
				// push prefix id to list
				h_data.prefix_ids.push(h_group.prefix_id);

				return h_group.count;
			},
		});
	}

	divide_prefix_datatype_literals() {
		// balance groups amongst workers
		return this.workers.balance_ordered_groups(this.prefix_datatypes, {
			item_count: this.prefix_datatype_count,

			// when a new task is created
			open: (a_groups) => {
				// put each list into a new hash
				return {
					datatypes: a_groups,
					prefix_ids: [],
					prefix_key_bytes: this.prefix_key_bytes,
				};
			},

			// each group
			quantify: (h_group, h_data) => {
				// generate a new key for this prefix and save to buffer within task data
				h_data.prefix_ids.push(h_group.prefix_id);

				return h_group.count;
			},
		});
	}

	divide_plain_literal_tasks() {
		let h_literals = this.literals;

		let n_literals = h_literals.plain_count;

		// divide set of literals into list of buffers
		let a_divisions = [];
		let k_buffer_writer = new bus.buffer_writer({force_malloc:true});

		// make generator for dividing this many literals
		let dg_divider = this.workers.divider(n_literals);

		// divide literals into buffers
		for(let s_literal of h_literals.plain) {
			let ab_content = bus.encode_utf_8(s_literal);
			let ab_word = Buffer.concat([bat.AB_TOKEN_CONTENTS, ab_content, bat.AB_ZERO], 1+ab_content.length+1);
			k_buffer_writer.append(ab_word);

			// divide here
			if(dg_divider.next().value) {
				a_divisions.push(k_buffer_writer.close());
				k_buffer_writer = new bus.buffer_writer({force_malloc:true});
			}
		}

		// final division
		a_divisions.push(k_buffer_writer.close());

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
			let n_literals = as_literals.size;

			// add to cumulative total
			c_literals += n_literals;

			// convert set to buffer
			let k_buffer_writer = new bus.buffer_writer();
			for(let s_literal of as_literals) {
				let ab_content = bus.encode_utf_8(s_literal);
				let ab_word = Buffer.concat([bat.AB_TOKEN_CONTENTS, ab_content, bat.AB_ZERO], 1+ab_content.length+1);
				k_buffer_writer.append(ab_word);
			}

			// add to list of languages for sorting
			let ab_lang = bus.encode_utf_8(s_lang);
			a_languages.push({
				tag: Buffer.concat([bat.AB_TOKEN_LANGUAGE, ab_lang], 1+ab_lang.length),
				count: n_literals,
				literals: k_buffer_writer.close(),
			});
		}

		// finished with prefix groups; do not hold up gc later
		this.prefix_groups = null;

		// sort list
		a_languages.sort(F_SORT_COUNT_DESC);

		// balance language-tagged groups
		return this.workers.balance_ordered_groups(a_languages, {
			item_count: c_literals,

			// when a new task is created
			open: (a_groups) => {
				return {
					literals: a_groups,
					tags: new bus.buffer_writer(),
				};
			},

			// each language
			quantify: (h_group, h_data) => {
				// add language tag to buffer
				h_data.tags.append(h_group.tag);

				return h_group.count;
			},

			// once a task is ready
			seal: (h_data) => {
				// finalize tags buffer
				h_data.tags = h_data.tags.close();

				return h_data;
			},
		});
	}


	encode_absolute_nodes(h_buffer_writers) {
		// group and encode nodes
		bat.group_and_encode_nodes(this.absolute_nodes, bat.AB_TOKEN_ABSOLUTE_IRI, h_buffer_writers);

		// release to gc
		this.absolute_nodes = null;
	}

	encode_blank_nodes(h_buffer_writers) {
		// group and encode nodes
		bat.group_and_encode_nodes(this.blank_nodes, bat.AB_TOKEN_BLANK_NODE, h_buffer_writers);

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

		let nl_indices = at_indices.length;

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
			buffer: ab_content.slice(i_read_lo, at_indices[nl_indices-1]),
			indices: at_indices.slice(i_word_lo, nl_indices-1),
		});

		return a_divisions;
	}

	load(d_blob) {
		// find out if any prefixes change
		let b_prefix_change = false;

		// record the byte offsets where we can split parsing the input file
		let a_split_indices = [];

		async.series([
			// stage 1
			(fk_stage) => this.deserialize({

				// aim for equal divisions
				split_targets: this.workers.divisions(d_blob.size),

				// when it reaches the closest offset to each target
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
						this.save_named_node(h_subject, bus.XM_NODE_SUBJECT);
					}
					// subject is blank node
					else {
						this.save_blank_node(h_subject, bus.XM_NODE_SUBJECT);
					}

					// predicate is always named node
					this.save_named_node(h_predicate, bus.XM_NODE_PREDICATE);

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
						this.save_named_node(h_object, bus.XM_NODE_OBJECT);
					}
					// object is blank node
					else {
						this.save_blank_node(h_object, bus.XM_NODE_OBJECT);
					}
				},

				// eof
				end: () => {
					let k_workers = this.workers;
					let n_workers = this.worker_count;
					let h_front_coders = this.front_coders;

					// literal's front coder
					let k_front_coder_literals = this.literals.front_coder;

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

					//
					k_workers.lock([
						'prefixes',
					]);

					// serially increment counts of words as workers finish first task
					let c_words_h = 0;
					let c_words_s = 0;
					let c_words_p = 0;
					let c_words_o = 0;

					k_workers
						// front code prefixes
						.dispatch({
							task: 'front_code_word_list',
							data: this.divide_prefixes(),
						})
						// import each prefix dict fragment in sequence
						.sequence((h_fragment) => {
							k_front_coder_prefixes.import(h_fragment);
						}, () => {
							k_workers.unlock('prefixes');
						})
						// sort plain literals' word lists
						.dispatch({
							task: 'sort_word_list',
							data: this.divide_plain_literal_tasks(),
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

							// assign each worker its next task of front coding prefixed nodes
							return {
								task: 'front_code_prefixed_nodes',
								args: [{
									h: c_words_h,
									s: c_words_s,
									p: c_words_p,
									o: c_words_o,
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

module.exports = Creator;
