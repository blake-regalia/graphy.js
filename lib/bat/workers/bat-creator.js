

const worker = require('worker').scopify(require, {
	workers: () => {
		require('./encoder.js');
	},
});

const graphy = require('../../main/graphy.js');
const bat = require('../bat.js');


const F_SORT_COUNT_DESC = (h_a, h_b) => {
	return h_a.count > h_b.count;
};


class creator {
	constructor(h_config) {
		let {
			resolve: f_resolve,
			workers: k_workers,
		} = h_config;

		//
		let h_front_coder_config = {
			block_size: 16,
		};

		Object.assign(this, {
			resolve: f_resolve,

			prefix_groups: Object.create(null),
			prefix_iris: [],
			prefix_node_count: 0,
			datatype_node_count: 0,
			prefix_key_bytes: 0,

			prefix_nodes: null,
			prefix_datatypes: null,

			blank_nodes: Object.create(null),
			absolute_nodes: Object.create(null),

			literals: {
				absolute_datatype_count: 0,
				absolute_datatypes: Object.create(null),
				language_count: 0,
				languages: Object.create(null),
				plain: Object.create(null),
				front_coder: new bat.front_coder(h_front_coder_config),
			},
			workers: k_workers,
			front_coders: {
				h: new bat.front_coder(h_front_coder_config),
				s: new bat.front_coder(h_front_coder_config),
				p: new bat.front_coder(h_front_coder_config),
				o: new bat.front_coder(h_front_coder_config),
			},

			uni: 0,
			uli: 0,

			triples_spo: {},
		});

		this.worker_count = this.workers.worker_count;
	}

	save_named_node(p_iri, n_type) {
		let h_prefix_groups = this.prefix_groups;
		let a_prefix_iris = this.prefix_iris;

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
					nodes: Object.assign(Object.create(null), {
						[s_suffix]: [n_type, this.uni],
					}),
				};

				return this.uni++;
			}
			// prefix exists
			else {
				let h_group = h_prefix_groups[p_prefix_iri];

				// first node for this prefix
				if(!('nodes' in h_group)) {
					Object.assign(h_group, {
						node_count: 1,
						nodes: {
							[s_suffix]: [n_type, this.uni],
						},
					});

					return this.uni++;
				}
				// other datatypes with prefix exist
				else {
					let h_nodes = h_group.nodes;

					// first encounter of node; set type and increment prefix's node counter
					if(!(s_suffix in h_nodes)) {
						h_group.node_count += 1;
						h_nodes[s_suffix] = [n_type, this.uni];

						return this.uni++;
					}
					// update node type
					else {
						h_nodes[s_suffix][0] |= n_type;

						return h_nodes[s_suffix][1];
					}
				}
			}
		}
		// node could not be prefixed
		else {
			let h_nodes = this.absolute_nodes;

			// first encounter of node; set type
			if(!(p_iri in h_nodes)) {
				h_nodes[p_iri] = [n_type, this.uni];

				return this.uni;
			}
			// update node type
			else {
				h_nodes[p_iri][0] |= n_type;

				return h_nodes[p_iri][1];
			}
		}
	}

	save_datatyped_literal(s_value, p_datatype_iri) {
		let h_prefix_groups = this.prefix_groups;
		let a_prefix_iris = this.prefix_iris;

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
					datatypes: Object.assign(Object.create(null), {
						[s_suffix]: {
							[s_value]: this.uli,
						},
					}),
				};

				return this.uli++;
			}
			// prefix exists
			else {
				let h_group = h_prefix_groups[p_prefix_iri];

				// first datatype for thie prefix
				if(!('datatypes' in h_group)) {
					Object.assign(h_group, {
						datatype_count: 1,
						datatypes: {
							[s_suffix]: {
								[s_value]: this.uli,
							},
						},
					});

					return this.uli++;
				}
				// other datatype with prefix exists
				else {
					let h_datatypes = h_group.datatypes;

					// first encounter of this datatype
					if(!(s_suffix in h_datatypes)) {
						h_group.datatype_count += 1;
						h_datatypes[s_suffix] = {
							[s_value]: this.uli,
						};

						return this.uli++;
					}
					// add literal to datatype's set
					else {
						let h_datatype = h_datatypes[s_suffix];

						// first encounter with literal
						if(!(s_value in h_datatype)) {
							return h_datatype[s_value] = this.uli++;
						}
						// literal already exists; return unique literal id
						else {
							return h_datatype[s_value];
						}
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
				h_datatypes[p_datatype_iri] = {
					[s_value]: this.uli,
				};

				return this.uli++;
			}
			// add literal to datatype's set
			else {
				let h_datatype = h_datatypes[p_datatype_iri];

				// first encounter with literal
				if(!(s_value in h_datatype)) {
					return h_datatype[s_value] = this.uli++;
				}
				// literal already exists; return unique literal id
				else {
					return h_datatype[s_value];
				}
			}
		}
	}

	save_language_literal(s_value, s_lang) {
		let h_literals = this.literals;
		let h_languages = h_literals.languages;

		// first encounter of language tag
		if(!(s_lang in h_languages)) {
			h_literals.language_count += 1;
			h_languages[s_lang] = {
				s_value: this.uli,
			};

			return this.uli++;
		}
		// another litera exists with same language tag; add literal to language's set
		else {
			let h_language = h_languages[s_lang];

			// first encounter of literal
			if(!(s_value in h_language)) {
				return h_language[s_value] = this.uli++;
			}
			// literal already exists; return unique literal id
			else {
				return h_language[s_value];
			}
		}
	}

	save_plain_literal(s_value) {
		// add literal to plain's map
		let h_plain = this.literals.plain;

		// first encounter of literal
		if(!(s_value in h_plain)) {
			return h_plain[s_value] = this.uli++;
		}
		// literal already exists; return unique literal id
		else {
			return h_plain[s_value];
		}
	}

	save_blank_node(p_label, n_type) {
		let h_blank_nodes = this.blank_nodes;

		// first encounter of node; set type
		if(!(p_label in h_blank_nodes)) {
			h_blank_nodes[p_label] = [n_type, this.uni];

			return this.uni++;
		}
		// update node type
		else {
			h_blank_nodes[p_label][0] |= n_type;

			return h_blank_nodes[p_label][1];
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

	save_t(h_triple) {
		// ref all positions of triple
		let {
			subject: h_subject,
			predicate: h_predicate,
			object: h_object,
		} = h_triple;

		// subject is named node
		if(h_subject.isNamedNode) {
			this.save_named_node(h_subject.value, bat.XM_NODE_SUBJECT);
		}
		// subject is blank node
		else {
			this.save_blank_node(h_subject.value, bat.XM_NODE_SUBJECT);
		}

		// predicate is always named node
		this.save_named_node(h_predicate.value, bat.XM_NODE_PREDICATE);

		// object is literal
		if(h_object.isLiteral) {
			// ... a language literal
			if(h_object.language) {
				this.save_language_literal(h_object.value, h_object.language);
			}
			// ... a datatyped literal
			else if(h_object.hasOwnProperty('datatype')) {
				// datatype is always a named node
				this.save_datatyped_literal(h_object.value, h_object.datatype.value);
			}
			// ... a plain literal
			else {
				this.save_plain_literal(h_object.value);
			}
		}
		// object is named node
		else if(h_object.isNamedNode) {
			this.save_named_node(h_object.value, bat.XM_NODE_OBJECT);
		}
		// object is blank node
		else {
			this.save_blank_node(h_object.value, bat.XM_NODE_OBJECT);
		}
	}

	save_spo(i_s, i_p, i_o) {
		let h_triples = this.triples_spo;

		if(i_s in h_triples) {
			let h_pair = h_triples[i_s];

			if(i_p in h_pair) {
				let a_list = h_pair[i_p];
				a_list.push(i_o);
			}
			else {
				h_pair[i_p] = [i_o];
			}
		}
		else {
			h_triples[i_s] = {
				[i_p]: [i_o],
			};
		}
	}

	save(a_triples) {
		a_triples.forEach((h_triple) => {
			let i_s, i_p, i_o;

			let s_s = h_triple.s;
			if('_' === s_s[0]) {
				i_s = this.save_blank_node(s_s.substr(1), bat.XM_NODE_SUBJECT);
			}
			else {
				i_s = this.save_named_node(s_s, bat.XM_NODE_SUBJECT);
			}

			i_p = this.save_named_node(h_triple.p, bat.XM_NODE_PREDICATE);

			let s_o = h_triple.o;
			let s_o_0 = s_o[0];
			if('_' === s_o_0) {
				i_o = this.save_blank_node(s_o.substr(1), bat.XM_NODE_OBJECT);
			}
			else if('"' === s_o_0) {
				i_o = this.save_plain_literal(s_o);
			}
			else if('^' === s_o_0) {
				let i_contents_token = s_o.indexOf('"');
				let p_datatype_iri = s_o.slice(1, i_contents_token);
				i_o = this.save_datatyped_literal(s_o.substr(i_contents_token+1), p_datatype_iri);
			}
			else if('@' === s_o_0) {
				let i_contents_token = s_o.indexOf('"');
				let s_language = s_o.slice(1, i_contents_token);
				i_o = this.save_language_literal(s_o.substr(i_contents_token+1), s_language);
			}
			else {
				i_o = this.save_named_node(s_o, bat.XM_NODE_OBJECT);
			}

			this.save_spo(i_s, i_p, i_o);
		});
	}


	// dumb idea
	save_encoded(at_content, at_indices) {
		// each triple in word list
		let k_reader = new bat.word_reader(at_content, at_indices);
		for(let {s:ab_s, p:ab_p, o:ab_o} of k_reader.triples()) {
			// subject blank node
			if(95 === ab_s[0]) {
				i_s = this.save_blank_node();
			}
		}
	}

	load_sync(s_mime, k_stream, fc_terms, fk_terms) {
		let t_start = performance.now();

		let b_prefix_change = false;

		// parse
		graphy.deserializer(s_mime, k_stream, {
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
				this.save_t(h_triple);
			},

			// eof
			end: (h_prefixes) => {
				let t_all = performance.now() - t_start;
				console.info(`total: ${t_all}`);
				debugger;

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


	load_async(s_mime, dfb_input, fc_terms, fk_terms) {
		// // find out if any prefixes change
		// let b_prefix_change = false;

		// // record the byte offsets where we can split parsing the input file
		// let a_split_indices = [];

		// spawn worker for parsing
		let k_worker = worker.spawn('./parse-worker.js');

		// worker stream
		let k_stream = worker.stream();

		// time it took to process previous dump
		let t_previous_process = 0;

		let c_processing = 0;
		let t_start = performance.now();

		// run parse task
		k_worker.run({
			task: 'parse',
			args: [s_mime, k_stream.other_port],
			transfer: [k_stream.other_port],
			events: {
				dump: (a_triples, t_posted) => {
// console.log('M <== [triples]; posted @'+t_posted);
					let t_start_process = performance.now();
					this.save(a_triples);
					t_previous_process = performance.now() - t_start_process;
					c_processing += t_previous_process;
				},
			},
		}, () => {
			let t_all = performance.now() - t_start;
			console.info(`main: ${c_processing.toFixed(2)}; worker: ${k_stream.receiver_elapsed.toFixed(2)};`);
			console.info(`sum: ${(c_processing+k_stream.receiver_elapsed).toFixed(2)}; total: ${t_all.toFixed(2)}`);
			debugger;
			this.process();
		});

		// send blob
		k_stream.blob(dfb_input, {
			// chunk_size: 1190,
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
					// // e
					// .dispatch({
					// 	task: 'encode_language_literals',
					// 	data: [],
					// })
					// .sequence((h_response, i_response, f_carry) => {

					// 	f_carry();
					// })
					// .assign(() => ({
					// 	task: 'front_code_language_literals',
					// 	args: ,
					// }))
					// .sequence((h_section) => {
					// 	k_workers.wait('plain_literals', () => {
					// 		k_front_coder_literals.import(h_section);
					// 	});
					// }, () => {
					// 	k_workers.unlock('language_literals');
					// })
					// .dispatch({
					// 	task: 'encode_datatyped_literals',
					// 	data: [],
					// })
					// .sequence(() => {

					// })
					// .sequence((h_section) => {
					// 	k_workers.wait('language_literals', () => {
					// 		k_front_coder_literals.import(h_section);
					// 	});
					// });
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



module.exports = function() {
	worker.dedicated({

		load(s_mime, d_port) {
			return new Promise((f_resolve) => {
				let k_creator = new creator({
					resolve: f_resolve,
					workers: worker.group('./encoder.js'),
				});

				k_creator.load_sync(s_mime, worker.stream(d_port));
			});
		},

	});
};
