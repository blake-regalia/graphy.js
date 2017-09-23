const events = require('events');

const worker = require('worker').scopify(require, () => {
	require('./worker');
});

const graphy = require('../main/graphy');
const bat = require('./bat');


const F_SORT_COUNT_DESC = (h_a, h_b) => {
	return h_a.count > h_b.count;
};


class term_loader {
	constructor(h_config) {
		let {
			workers: k_workers,
		} = h_config;

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
			workers: k_workers,
			front_coders: {
				h: new bat.front_coder(h_front_coder_config),
				s: new bat.front_coder(h_front_coder_config),
				p: new bat.front_coder(h_front_coder_config),
				o: new bat.front_coder(h_front_coder_config),
			},

			uti: 0,
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

	divide_word_list(h_list, n_block_size=16) {
		let ab_content = h_list.buffer;
		let at_indices = h_list.indices;

		let nl_indices = at_indices.length;

		let a_divisions = [];

		let i_word_lo = 0;
		let i_read_lo = 0;
		this.workers.divisions(at_indices.length).forEach((i_word_hi) => {
			let i_read_hi = at_indices[i_word_hi-1];
			a_divisions.push({
				words: ab_content.slice(i_read_lo, i_read_hi),
				indices: at_indices.slice(i_word_lo, i_word_hi),
				offset: i_word_lo,
				block_size: n_block_size,
			});

			i_word_lo = i_word_hi - 1;
			i_read_lo = at_indices[i_word_lo++];
		});

		// final division
		a_divisions.push({
			words: ab_content.slice(i_read_lo, at_indices[nl_indices-1]),
			indices: at_indices.slice(i_word_lo, nl_indices-1),
			offset: i_word_lo,
			block_size: n_block_size,
		});

		return a_divisions;
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
		this.prefix_key_bytes = bat.key_space.bytes_needed(n_prefixes);

		// while traversing sorted prefixes, separate nodes and datatypes (save to fields)
		let a_nodes = this.prefix_nodes = [];
		let a_datatypes = this.prefix_datatypes = [];

		// count total prefix nodes and datatypes
		let c_nodes = 0;
		let c_datatypes = 0;

		// make prefix word list
		let k_word_writer = new bat.word_writer();
		for(let i_prefix=0; i_prefix<n_prefixes; i_prefix++) {
			let h_prefix = a_prefixes[i_prefix];
			let p_prefix_iri = a_prefix_iris[h_prefix.id];

			// write iri to prefix word list
			let ab_iri = bat.encode_utf_8(p_prefix_iri);
			let ab_word = Buffer.concat([ab_iri, bat.AB_ZERO], ab_iri.length+1);
			k_word_writer.append(ab_word);

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
		return this.divide_word_list(k_word_writer.close());
	}

	divide_prefix_nodes() {
		let n_prefix_key_bytes = this.prefix_key_bytes;

		// divide prefix nodes
		return this.workers.balance_ordered_groups(this.prefix_nodes, {
			item_count: this.prefix_node_count,

			// when a new task is created
			open: (a_groups) => {
				// put list into a hash and create list of prefix ids
				return {
					nodes: a_groups,
					prefix_ids: [],
					prefix_key_bytes: n_prefix_key_bytes,
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
		let n_prefix_key_bytes = this.prefix_key_bytes;

		// balance groups amongst workers
		return this.workers.balance_ordered_groups(this.prefix_datatypes, {
			item_count: this.prefix_datatype_count,

			// when a new task is created
			open: (a_groups) => {
				// put each list into a new hash
				return {
					datatypes: a_groups,
					prefix_ids: [],
					prefix_key_bytes: n_prefix_key_bytes,
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

	divide_plain_literals() {
		let h_literals = this.literals;

		let as_literals_plain = h_literals.plain;
		let n_literals = as_literals_plain.size;

		// divide set of literals into list of buffers
		let a_divisions = [];
		let k_word_writer = new bat.word_writer({force_malloc:true});

		// make generator for dividing this many literals
		let dg_divider = this.workers.divider(n_literals);

		// divide literals into buffers
		for(let s_literal of as_literals_plain) {
			let ab_content = bat.encode_utf_8(s_literal);
			let ab_word = Buffer.concat([bat.AB_TOKEN_CONTENTS, ab_content, bat.AB_ZERO], 1+ab_content.length+1);
			k_word_writer.append(ab_word);

			// divide here
			if(dg_divider.next().value) {
				a_divisions.push(k_word_writer.close());
				k_word_writer = new bat.word_writer({force_malloc:true});
			}
		}

		// final division
		a_divisions.push(k_word_writer.close());

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

			// convert set to word list
			let k_word_writer = new bat.word_writer();
			for(let s_literal of as_literals) {
				let ab_content = bat.encode_utf_8(s_literal);
				let ab_word = Buffer.concat([bat.AB_TOKEN_CONTENTS, ab_content, bat.AB_ZERO], 1+ab_content.length+1);
				k_word_writer.append(ab_word);
			}

			// add to list of languages for sorting
			let ab_lang = bat.encode_utf_8(s_lang);
			a_languages.push({
				tag: Buffer.concat([bat.AB_TOKEN_LANGUAGE, ab_lang], 1+ab_lang.length),
				count: n_literals,
				literals: k_word_writer.close(),
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
					tags: new bat.word_writer(),
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
				// finalize tags word list
				h_data.tags = h_data.tags.close();

				return h_data;
			},
		});
	}


	encode_absolute_nodes(h_word_writers) {
		// group and encode nodes
		bat.group_and_encode_nodes(this.absolute_nodes, bat.AB_TOKEN_ABSOLUTE_IRI, h_word_writers);

		// release to gc
		this.absolute_nodes = null;
	}

	encode_blank_nodes(h_word_writers) {
		// group and encode nodes
		bat.group_and_encode_nodes(this.blank_nodes, bat.AB_TOKEN_BLANK_NODE, h_word_writers);

		// release to gc
		this.blank_nodes = null;
	}

	front_code_buffers(h_word_writers) {
		// each buffer writer
		for(let s_symbol in h_word_writers) {
			// close buffer writer to fetch its buffer and indices
			let {
				buffer: ab_words,
				indices: a_indices,
			} = h_word_writers[s_symbol].close();

			// add section to the group's front coder
			this.front_coders[s_symbol].add(ab_words, a_indices);
		}
	}


	load(k_blob, fc_terms, fk_terms) {
		// find out if any prefixes change
		let b_prefix_change = false;

		// record the byte offsets where we can split parsing the input file
		let a_split_indices = [];

		// parse
		graphy.deserializer(k_blob.mime, k_blob, {
			// split_tracking: {
			// 	// aim for equal divisions
			// 	targets: this.workers.divisions(k_blob.size),

			// 	// when it reaches the closest offset to each target
			// 	reached(i_byte_offset) {
			// 		a_split_indices.push(i_byte_offset);
			// 	},
			// },

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
					this.save_named_node(h_subject, bat.XM_NODE_SUBJECT);
				}
				// subject is blank node
				else {
					this.save_blank_node(h_subject, bat.XM_NODE_SUBJECT);
				}

				// predicate is always named node
				this.save_named_node(h_predicate, bat.XM_NODE_PREDICATE);

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
					this.save_named_node(h_object, bat.XM_NODE_OBJECT);
				}
				// object is blank node
				else {
					this.save_blank_node(h_object, bat.XM_NODE_OBJECT);
				}
			},

			// eof
			end: (h_prefixes) => {
				// next parsing phase can be parallelized
				if(!b_prefix_change) {
					fc_terms({
						// parsing can be done in parallel
						parallel: {
							// byte offsets where parser can start/end between whole triples
							split_indices: a_split_indices,

							// final prefix map
							prefix_map: h_prefixes,
						},

						// pass back current task stream
						workers: this.process(),
					});
				}
				// next parsing phase must be done serially
				else {
					this.process().end(() => {
						fk_terms({
							workers: this.process(),
						});
					});
				}
			},
		});
	}

	process() {
		let k_workers = this.workers;
		let h_front_coders = this.front_coders;

		// outputs
		let h_output = this.output = {};

		// front coders
		let k_front_coder_prefixes = new bat.front_coder();
		let k_front_coder_literals = this.literals.front_coder;

		// prep word writers for building dict sections
		let h_word_writers = {};
		for(let s_symbol in h_front_coders) {
			h_word_writers[s_symbol] = new bat.word_writer();
		}

		// encode absolute and blank nodes first (their buffer tokens sort them at the beginning)
		this.encode_absolute_nodes(h_word_writers);
		this.encode_blank_nodes(h_word_writers);

		// front code buffers and then release to gc
		this.front_code_buffers(h_word_writers);
		h_word_writers = null;

		//
		k_workers.lock([
			'prefixes',
		]);

		// serially increment counts of words as workers finish first task
		let c_words_h = 0;
		let c_words_s = 0;
		let c_words_p = 0;
		let c_words_o = 0;

		return k_workers
			// front code prefixes
			.dispatch({
				task: 'front_code_word_list',
				data: this.divide_prefixes(),
				transfers: true,
			})
			// import each prefix dict fragment in sequence
			.sequence((h_fragment) => {
				k_front_coder_prefixes.import(h_fragment);
			}, () => {
				// its done; create section and unlock prefixes
				h_output.prefixes = new bat.section(k_front_coder_prefixes.export());
				k_workers.unlock('prefixes');
			})
			// sort plain literals' word lists
			.dispatch({
				task: 'sort_word_list',
				data: this.divide_plain_literals(),
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
				data: this.divide_prefixes(),
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

			});
	}
}

class triple_loader {
	constructor(h_config) {
		let {
			workers: k_workers,
		} = h_config;

		Object.assign(this, {
			workers: k_workers,
		});
	}

	load(k_blob, fk_triples) {

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
		let n_chunk_size = this.chunk_size;
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
			let i_end = i_read + n_chunk_size;
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


class creator {
	static from_blob(dfb_input, h_config={}) {
		let k_readable_blob = new readable_blob(dfb_input, {
			chunk_size: 1024*1024,  // 1 MiB
			mime: h_config.mime,
		});

		new creator({
			terms: () => k_readable_blob,
			triples: () => k_readable_blob.reset(),
		});
	}

	constructor(h_config) {
		let {
			terms: f_mk_terms,
			triples: f_mk_triples,
		} = h_config;

		let k_term_loader = new term_loader({
			workers: worker.group('./worker'),
		});

		k_term_loader.load(f_mk_terms(), (h_term_pass) => {
			// make triple loader and load triples!
			let k_triple_loader = new triple_loader(h_term_pass);
			k_triple_loader.load(f_mk_triples());
		}, () => {
			// parallelization not an option
			let k_triple_loader = new triple_loader();
		});
	}
}



module.exports = creator;
