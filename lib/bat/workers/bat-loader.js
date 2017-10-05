

const worker = require('worker').scopify(require, {
	workers: () => {
		require('./encoder.js');
		require('./parse.js');
	},
});

const graphy = require('../../main/graphy.js');
const bat = require('../bat.js');
const bat_creator = require('../bat-creator.js');


const F_SORT_COUNT_DESC = (h_a, h_b) => {
	return h_a.count > h_b.count;
};

const F_SORT_PREFIX_IRI = (h_a, h_b) => {
	return h_a.iri < h_b.iri? -1: 1;
};

const F_SORT_LANG = (h_a, h_b) => {
	return h_a.tag < h_b.tag? -1: 1;
};

const D_TEXT_ENCODER = new TextEncoder();

const H_CONFIG_DEFAULT_FRONT_CODER = {
	block_size_k: 4,
};

const H_NODE_ABBREVIATIONS = {
	h: 'hops',
	s: 'subjects',
	p: 'predicates',
	o: 'objects',
};

const H_CODES_CHAPTERS_ABSOLUTE = {
	h: bat.X_CODE_CHAPTER_HOPS_ABSOLUTE,
	s: bat.X_CODE_CHAPTER_SUBJECTS_ABSOLUTE,
	p: bat.X_CODE_CHAPTER_PREDICATES_ABSOLUTE,
	o: bat.X_CODE_CHAPTER_OBJECTS_ABSOLUTE,
};

class loader {
	constructor(h_config) {
		let {
			resolve: f_resolve,
			workers: k_workers,
		} = h_config;

		Object.assign(this, {
			resolve: f_resolve,

			nodes_prefixed: [],
			literals_datatyped: [],

			front_coder_config: {
				prefixes: H_CONFIG_DEFAULT_FRONT_CODER,
			},

			workers: k_workers,
			front_coders: {
				h: new bat.front_coder(H_CONFIG_DEFAULT_FRONT_CODER),
				s: new bat.front_coder(H_CONFIG_DEFAULT_FRONT_CODER),
				p: new bat.front_coder(H_CONFIG_DEFAULT_FRONT_CODER),
				o: new bat.front_coder(H_CONFIG_DEFAULT_FRONT_CODER),
				lp: new bat.front_coder(H_CONFIG_DEFAULT_FRONT_CODER),
				ll: new bat.front_coder(H_CONFIG_DEFAULT_FRONT_CODER),
				ld: new bat.front_coder(H_CONFIG_DEFAULT_FRONT_CODER),
			},

			uti_map: null,
			uti_term: 1,

			chapters: [],
			output: [],
		});

		this.worker_count = this.workers.worker_count;
	}


	balance_word_list(h_list=null, n_block_size_k=4) {
		if(!h_list) return [];

		let ab_contents = h_list.contents;
		let at_indices = h_list.indices;

		let nl_indices = at_indices.length;

		let a_groups = [];
		let i_word_lo = 0;
		let i_read_lo = 0;
		let x_offset = 0;
		this.workers.divisions(nl_indices).forEach((i_word_hi) => {
			let i_read_hi = at_indices[i_word_hi-1];
			let ab_slice = ab_contents.slice(i_read_lo, i_read_hi);
			let dab_slice = ab_slice.buffer.slice(ab_slice.byteOffset, ab_slice.byteOffset + ab_slice.byteLength);
			a_groups.push({
				words: new Uint8Array(dab_slice),
				indices: at_indices.slice(i_word_lo, i_word_hi).map(x => x - x_offset),
				offset: i_word_lo,
				block_size_k: n_block_size_k,
			});

			i_word_lo = i_word_hi - 1;
			i_read_lo = at_indices[i_word_lo++];
			x_offset = at_indices[i_word_lo-1];
		});

		// final group
		let ab_slice = ab_contents.slice(i_read_lo, at_indices[nl_indices-1]);
		let dab_slice = ab_slice.buffer.slice(ab_slice.byteOffset, ab_slice.byteOffset + ab_slice.byteLength);
		a_groups.push({
			words: new Uint8Array(dab_slice),
			indices: at_indices.slice(i_word_lo, nl_indices).map(x => x - x_offset),
			offset: i_word_lo,
			block_size_k: n_block_size_k,
		});

		return a_groups;
	}


	balance_word_buffer(h_words, i_offset=0) {
		console.time('divide word buffer');
		let k_workers = this.workers;

		let {
			contents: at_contents,
			ids: {length:n_words},
		} = h_words;
		let g_divider = k_workers.divider(n_words);

		// divide buffer into word lists
		let a_data = [];
		let i_start = 0;
		let i_end = 0;
		let c_words_committed = 0;
		for(let i_word=0; i_word<n_words; i_word++) {
			i_end = at_contents.indexOf(0, i_end) + 1;

			// divide here
			if(g_divider.next().value) {
				// copy select portion to new array buffer for transfer
				let c_words = i_word - c_words_committed;
				a_data.push({
					contents: at_contents.slice(i_start, i_end),
					word_count: c_words,
					offset: i_offset,
				});

				// advance pointers
				i_start = i_end;
				i_offset += c_words;
				c_words_committed = i_word;
			}
		}

		// final data fragment
		a_data.push({
			contents: at_contents.slice(i_start),
			word_count: n_words - c_words_committed,
			offset: i_offset,
		});

		console.timeEnd('divide word buffer');
		return a_data;
	}

	list_prefixed_items(k_creator) {
		let {
			nodes_prefixed: a_nodes,
			literals_datatyped: a_datatypes,
		} = this;
		let h_prefix_groups = k_creator.prefix_groups;

		// turn hash into list and create item count
		let a_prefixes = [];
		for(let p_prefix_iri in h_prefix_groups) {
			// push group to list for sorting
			a_prefixes.push({
				iri: p_prefix_iri,
				group: h_prefix_groups[p_prefix_iri],
			});
		}

		// sort prefixes alphanumerically
		a_prefixes.sort(F_SORT_PREFIX_IRI);


		// prep prefix key assignment
		let n_prefixes = a_prefixes.length;

		// calculate number of bytes needed for prefix keys
		let n_prefix_key_bytes = this.prefix_key_bytes = bat.key_space.bytes_needed(n_prefixes);

		// count total prefix nodes and datatypes
		let c_nodes = 0;
		let c_datatypes = 0;

		// make prefix super string
		let s_super = '';

		// make prefix word list
		let k_key_space = new bat.key_space(n_prefix_key_bytes);
		let k_word_writer = new bat.word_writer();
		for(let i_prefix=0; i_prefix<n_prefixes; i_prefix++) {
			let {
				iri: p_prefix_iri,
				group: h_group,
			} = a_prefixes[i_prefix];

			// // write iri to prefix word list
			// k_word_writer.append(bat.encode_utf_8(p_prefix_iri));

			// commit prefix to super string
			s_super += p_prefix_iri+'\0';

			// prefix code
			let s_code_prefix = String.fromCharCode(...k_key_space.encode(i_prefix));

			// nodes
			if('nodes' in h_group) {
				let n_nodes = h_group.node_count;
				c_nodes += n_nodes;

				// each node
				let h_nodes = h_group.nodes;
				for(let s_suffix in h_nodes) {
					let h_node = h_nodes[s_suffix];

					// commit to list
					a_nodes.push({
						value: s_code_prefix+s_suffix,
						id: h_node.id,
						type: h_node.type,
					});
				}
			}
			// datatypes
			if('datatypes' in h_group) {
				let n_datatypes = h_group.datatype_count;
				c_datatypes += n_datatypes;

				// prefix code
				let s_code_prefix_datatype = '^'+s_code_prefix;

				// each datatype
				let h_datatypes = h_group.datatypes;
				for(let s_datatype in h_datatypes) {
					let h_literals = h_datatypes[s_datatype];

					// datatype code
					let s_code_datatype = s_code_prefix_datatype+s_datatype+'"';

					// each literal
					for(let s_value in h_literals) {
						a_datatypes.push({
							value: s_code_datatype+s_value,
							id: h_literals[s_value],
						});
					}
				}
			}
		}

		// save counts
		this.nodes_prefixed_count = c_nodes;
		this.literals_datatyped_prefixed_count = c_datatypes;

		// done with prefix iri list and prefix groups
		k_creator.prefix_groups = null;

		// encode super string
		let at_contents = D_TEXT_ENCODER.encode(s_super);

		// front code prefix chapter
		let k_front_coder = new bat.front_coder(this.front_coder_config.prefixes);
		k_front_coder.add_nt_word_list(at_contents, n_prefixes);

		// commit chapter
		this.push_chapter(k_front_coder.close(bat.X_CODE_CHAPTER_PREFIXES));

		// // divide and return prefix word list for front coding
		// return this.balance_word_list(k_word_writer.close());
	}

	balance_nodes_absolute() {
		return this.workers.balance(this.nodes.absolute);
	}

	divide_nodes_prefixed() {
		return this.workers.balance(this.nodes.prefixed);
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
					groups: a_groups,
					prefix_key_bytes: n_prefix_key_bytes,
				};
			},

			// quantify group
			quantify: (h_group) => {
				return h_group.count;
			},

			// // commit an item to a group
			// commit: (h_data, h_group) => {
			// 	// push prefix id to list
			// 	h_data.prefix_ids.push(h_group.prefix_id);
			// },
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

	balance_literals_datatyped(k_creator) {
		let {
			literals: {
				datatyped_absolute: h_literals_absolute,
			},
		} = k_creator;

		// divide literals into buffers
		let a_list = [];

		// start with absolutely datatyped literals
		for(let p_datatype_iri in h_literals_absolute) {
			a_list.push({
				value: bat.S_TOKEN_ABSOLUTE_IRI+p_datatype_iri,
				id: h_literals_absolute[p_datatype_iri],
			});
		}

		return this.workers.balance(this.literals_datatyped.concat(a_list));
	}

	balance_literals_languaged(k_creator) {
		let {
			literals: {
				languaged_count: n_literals,
				languaged: h_literals,
			},
		} = k_creator;

		// divide set of literals into list of buffers
		let a_data = [];

		// make generator for dividing this many literals
		let g_divider = this.workers.divider(n_literals);

		// divide literals into buffers
		let a_list = [];
		for(let s_lang in h_literals) {
			let h_group = h_literals[s_lang];

			// language tag prefix
			let s_code_prefix = s_lang+'"';

			// each literal
			for(let s_value in h_group) {
				// add literal to list
				a_list.push({
					value: s_code_prefix+s_value,
					id: h_group[s_value],
				});

				// divide here
				if(g_divider.next().value) {
					a_data.push(a_list);
					a_list = [];
				}
			}
		}

		// final chunk
		a_data.push(a_list);

		return a_data;
	}

	balance_literals_plain(k_creator) {
		let {
			plain: h_literals,
			plain_count: n_literals,
		} = k_creator.literals;

		// no plain literals
		if(!n_literals) return [];

		// divide set of literals into list of buffers
		let a_data = [];

		// make generator for dividing this many literals
		let g_divider = this.workers.divider(n_literals);

		// divide literals into buffers
		let a_list = [];
		for(let s_literal in h_literals) {
			// add literal to list
			a_list.push({
				value: '"'+s_literal,
				id: h_literals[s_literal],
			});

			// divide here
			if(g_divider.next().value) {
				a_data.push(a_list);
				a_list = [];
			}
		}

		// final chunk
		a_data.push(a_list);

		return a_data;
	}

	divide_language_literals_slow() {
		let h_languages = this.literals.languages;

		let c_literals = 0;
		let d_encoder = new TextEncoder();

		let n_literals_total = this.literals.language_sum;
		let k_divider = this.workers.divider(n_literals_total);

		// convert to list
		let a_languages = [];
		for(let s_lang in h_languages) {
			let h_group = h_languages[s_lang];
			let n_literals = h_group[HP_DICTIONARY_SIZE];

			// add to cumulative total
			c_literals += n_literals;

			console.time(s_lang);
			// convert set to word list
			let k_word_writer = new bat.word_writer({grow:1024*1024});
			for(let s_literal in h_group) {
				k_word_writer.buffer.append_byte(bat.X_TOKEN_CONTENTS);
				k_word_writer.buffer.append(d_encoder.encode(s_literal));
				if(k_divider.next().value) {
					console.timeEnd('chunk 1');
					debugger;
				}
			}
			console.timeEnd(s_lang);

			// add to list of languages for sorting
			// let kb_lang = new bat.buffer_writer({size:1+s_lang.length*2});
			// kb_lang.append_byte(bat.X_TOKEN_LANGUAGE);
			// kb_lang.append(d_encoder.encode(s_lang));
			a_languages.push({
				// tag: kb_lang.close(),
				tag: s_lang,
				count: n_literals,
				literals: k_word_writer.close(),
			});
		}

		// finished with prefix groups; do not hold up gc later
		this.prefix_groups = null;

		// sort list
		a_languages.sort(F_SORT_LANG);

		// balance language-tagged groups
		return this.workers.balance_ordered_groups(a_languages, {
			item_count: c_literals,

			// each language
			quantify: h => h.count,
		});
	}


	divide_language_literals() {
		let h_languages = this.literals.languages;

		let c_literals = 0;

		let a_super = [];
		let a_chunk = [];
		let n_literals_total = this.literals.language_sum;
		let k_divider = this.workers.divider(n_literals_total);

		// convert to list
		for(let s_lang in h_languages) {
			let h_group = h_languages[s_lang];
			// let n_literals = h_group[HP_DICTIONARY_SIZE];

			// // add to cumulative total
			// c_literals += n_literals;

			console.time(s_lang);

			for(let s_literal in h_group) {
				a_chunk.push({
					value: '@'+s_lang+'"'+s_literal,
					id: h_group[s_literal],
				});
				if(k_divider.next().value) {
					a_super.push(a_chunk);
					a_chunk = [];
				}
			}

			console.timeEnd(s_lang);
		}

		a_super.push(a_chunk);

		return a_super;
	}

	divide_datatype_literals() {
		let {
			literals: {
				datatypes_absolute: h_datatypes,
				datatype_absolute_count: n_literals_datatype_absolute_count,
			},
		} = this;

		let a_super = [];

		// no absolute datatyped literals
		if(!n_literals_datatype_absolute_count) return [];


	}

	import_front_coder_fragment_nodes(s_key, h_front_coders_import) {
		debugger;
	}

	encode_absolute_nodes(h_word_writers) {
		// group and encode nodes
		if(this.nodes.absolute_count) {
			bat.classify_and_encode_nodes(this.nodes.absolute, bat.AB_TOKEN_ABSOLUTE_IRI, h_word_writers);
		}
	}

	encode_blank_nodes(h_word_writers) {
		// group and encode nodes
		if(this.nodes.blank_count) {
			bat.classify_and_encode_nodes(this.nodes.blank, bat.AB_TOKEN_BLANK_NODE, h_word_writers);
		}
	}

	front_code_word_list_groups(h_word_writers) {
		// each word writer
		for(let s_symbol in h_word_writers) {
			// close word writer to fetch its content and indices
			let {
				contents: at_contents,
				indices: a_indices,
			} = h_word_writers[s_symbol].close();

			// add section to the group's front coder
			if(at_contents.length) {
				this.front_coders[s_symbol].add(at_contents, a_indices);
			}
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

	load_split(pm_format, k_stream, fc_terms, fk_terms) {
		console.time('parse');
		console.time('blob');
		console.time('load');
		let k_workers = this.workers;

		let b_prefix_change = false;

		// latent dispatch task stream
		let k_split_load = k_workers
			.latent({
				task: 'parse_save',
				args: [pm_format],
			})
			.reduce({
				task: 'merge_terms_triples',
			}, (h_creator) => {
				console.timeEnd('load');
				debugger;
			});

		// 
		k_stream.onblob = (dfb_input) => {
			console.timeEnd('blob');

			// split
			graphy.splitter(pm_format, k_stream, {
				// where to make splits
				targets: k_workers.divisions(dfb_input.size),

				// if any prefix changes, final map is not valid for whole document
				prefix_change() {
					b_prefix_change = true;
				},

				// each fragment
				fragment(h_fragment) {
					let {
						byte_start: i_byte_start,
						byte_end: i_byte_end,
						state: h_state,
					} = h_fragment;

					// mk new stream
					let k_stream_fragment = worker.stream();

					setTimeout(() => {
						// start parse task on fragment
						k_split_load.push([
							k_stream_fragment.other_port,
							h_state,
						], [k_stream_fragment.other_port]);

						// send blob
						k_stream_fragment.blob(dfb_input.slice(i_byte_start, i_byte_end < 0? dfb_input.size: i_byte_end));
					}, 0);
				},

				// eof
				end: (h_prefixes) => {
					console.timeEnd('parse');
					// debugger;
				},
			});
		};
	}

	load_sync(pm_format, k_stream, k_notify, fc_terms, fk_terms) {
		let t_start = performance.now();

		let k_creator = new bat_creator();
		let c_triples = 0;

		// parse
		graphy.deserializer(pm_format, k_stream, {
			// each triple
			data: (h_triple) => {
				// this.save_t(h_triple);
				k_creator.save_triple(h_triple);

				c_triples += 1;
			},

			// end-of-segment
			eos: () => {
				k_notify.emit('progress', {
					bytes: k_stream.consumed,
					triples: c_triples,
				});
			},

			// eof
			end: (h_prefixes) => {
				k_notify.emit('progress', {
					bytes: k_stream.consumed,
					triples: c_triples,
				});

				let t_all = performance.now() - t_start;
				console.info(`total: ${t_all}`);

				this.process(k_creator).end(() => {

				});
			},
		});
	}

	update_uti_map(h_map, h_update, n_offset) {
		for(let s_key in h_update) {
			h_map[s_key] = h_update[s_key] + n_offset;
		}
	}

	// add uti map for any term that is subject and/or object
	add_uti_map(at_ids, i_term) {
		let at_uti_map = this.uti_map;

		// each id
		let n_ids = at_ids.length;
		for(let i_id=0; i_id<n_ids; i_id++) {
			// set mapping
			at_uti_map[at_ids[i_id]] = i_term++;
		}

		return i_term;
	}

	push_chapter(at_chapter) {
		this.chapters.push(at_chapter);
	}

	commit_dictionary() {
		let c_bytes = 0;
		let a_chapters = this.chapters;
		let n_chapters = a_chapters.length;
		for(let i_chapter=0; i_chapter<n_chapters; i_chapter++) {
			c_bytes += a_chapters[i_chapter].length;
		}

		let n_byte_estimate = 1 + 4*2;

		let k_buffer = new bus.buffer_writer({size:n_byte_estimate});

		// dictionary code
		k_buffer.append(bus.encode_pint(bat.X_CODE_DICTIONARY));

		// chapter count
		k_buffer.append(bus.encode_pint(n_chapters));

		// chapter length
		k_buffer.append(bus.encode_pint(c_bytes));

		// dictionary header
		this.output.push(k_buffer.close());

		// chapters
		this.output.push(...a_chapters);
	}

	process(k_creator) {
		let k_workers = this.workers;
		let h_front_coders = this.front_coders;

		let {
			nodes: {
				blank_count: n_nodes_blank,
				blank: h_nodes_blank,

				absolute_count: n_nodes_absolute,
				absolute: h_nodes_absolute,

				prefixed_count: n_nodes_prefixed,
				prefixed: a_nodes_prefixed,
			},
			literals: {
				plain_count: n_literals_plain,
				plain: h_literals_plain,

				languaged_count: n_literals_languaged,
				languaged: h_literals_languaged,

				datatyped_count: n_literals_datatyped,
				datatyped: h_literals_datatyped,
			},
			uti: i_uti,
		} = k_creator;

		// prepare uti map
		this.uti_map = bat.new_uint_array(i_uti, i_uti);

		// front-code options
		let n_block_size_k_literals = 4;

		// // uti maps
		// let h_uti_map_h = {};
		// let h_uti_map_s = {};
		// let h_uti_map_p = {};
		// let h_uti_map_o = {};

		// // serially increment counts of words as workers finish first task
		// let c_words_h = 0;
		// let c_words_s = 0;
		// let c_words_p = 0;
		// let c_words_o = 0;

		// let h_chapter_starts = {
		// 	h: 0,  // # of blank nodes that are hops
		// 	s: 0,  // "                       " subjects
		// 	o: 0,  // "                       " objects
		// };

		// // front coders
		// let k_front_coder_prefixes = new bat.front_coder();

		let h_utis = {};

		this.list_prefixed_items(k_creator);

		return k_workers
			// // front code prefixes
			// .dispatch({
			// 	task: 'front_code_word_buffer',
			// 	data: this.balance_prefixes(k_creator),
			// 	transfers: true,
			// 	// debug: true,
			// })
			// // import each prefix chapter fragment in sequence
			// .sequence((h_fragment) => {
			// 	k_front_coder_prefixes.import(h_fragment);
			// }, () => {
			// 	// its done; commit chapter and unlock prefixes
			// 	this.push_chapter(k_front_coder_prefixes.export());
			// 	k_front_coder_prefixes = null;
			// 	k_workers.unlock('prefixes');

			// 	console.info('front-coded prefixes');
			// })

			// sort, concat then encode absolute nodes
			.dispatch({
				task: 'classify_sort_concat_encode',
				data: k_workers.balance(h_nodes_absolute),
				args: [i_uti],
			})
			// combine sorted word buffers for absolute nodes
			.reduce({
				task: 'merge_classified_word_buffers',
				args: [i_uti],
			}, (h_word_buffer_nodes_absolute=null) => {
				// no absolute nodes
				if(!h_word_buffer_nodes_absolute) {
					// unlock uti map and absolute nodes
					k_workers.unlock([
						'uti_hops_absolute',
						'uti_predicates_absolute',
						'uti_subjects_absolute',
						'uti_objects_absolute',
						'nodes_absolute',
					]);
				}
				// yes absolute nodes
				else {
					// save & unlock uti maps
					h_utis.h_a = this.add_uti_map(h_word_buffer_nodes_absolute.h.ids, 2);
					h_utis.p_a = this.add_uti_map(h_word_buffer_nodes_absolute.p.ids, 2);
					k_workers.unlock(['uti_hops_absolute', 'uti_predicates_absolute']);

					k_workers.wait('uti_hops_prefixed', () => {
						h_utis.s_a = this.add_uti_map(h_word_buffer_nodes_absolute.s.ids, 2);
						k_workers.unlock('uti_subjects_absolute');
					});

					k_workers.wait('uti_subjects_prefixed', () => {
						h_utis.o_a = this.add_uti_map(h_word_buffer_nodes_absolute.o.ids, h_utis.s_p);
						k_workers.unlock('uti_objects_absolute');
					});

					let k_tasks = k_workers;
					for(let s_key in h_word_buffer_nodes_absolute) {
						k_tasks = k_tasks
							// front code absolute nodes' word buffer
							.dispatch({
								task: 'front_code_word_buffer',
								data: this.balance_word_buffer(h_word_buffer_nodes_absolute[s_key]),
							})
							// combine front-coded fragments
							.sequence((h_fragment_nodes_absolute) => {
								this.import_front_coder_fragment_nodes(s_key, h_fragment_nodes_absolute);
							}, () => {
								// absolute nodes section done
								k_workers.unlock(H_NODE_ABBREVIATIONS[s_key]+'_absolute');

								console.info('absolute '+s_key);
							});
					}

					// add new task stream to outer stream
					return k_tasks;
				}
			})

			// sort, concat then encode prefixed nodes
			.dispatch({
				task: 'classify_sort_concat_encode',
				data: k_workers.balance(this.nodes_prefixed),
				args: [i_uti],
			})
			// combine sorted word buffers for absolute nodes
			.reduce({
				task: 'merge_classified_word_buffers',
				args: [i_uti],
			}, (h_word_buffer_nodes_prefixed=null) => {
				// no prefixed nodes
				if(!h_word_buffer_nodes_prefixed) {
					// close node chapters
					debugger;

					// unlock uti map and nodes prefixed
					k_workers.unlock([
						'uti_nodes_prefixed',
						'nodes_prefixed',
					]);
				}
				// yes prefixed nodes
				else {
					// once utis for absolute nodes are mapped
					k_workers.wait('uti_nodes_absolute', () => {
						// save & unlock uti maps
						k_workers.wait('uti_hops_absolute', () => {
							h_utis.h_p = this.add_uti_map(h_word_buffer_nodes_prefixed.h.ids, h_utis.h_a);
							k_workers.unlock('uti_hops_prefixed');
						});

						k_workers.wait('uti_subjects_absolute', () => {
							h_utis.s_p = this.add_uti_map(h_word_buffer_nodes_prefixed.s.ids, h_utis.s_a);
							k_workers.unlock('uti_subjects_prefixed');
						});

						h_utis.s_p = this.add_uti_map(h_word_buffer_nodes_prefixed.s.ids, h_utis.s_a);
						h_utis.p_p = this.add_uti_map(h_word_buffer_nodes_prefixed.s.ids, h_utis.p_a);
						h_utis.o_p = this.add_uti_map(h_word_buffer_nodes_prefixed.s.ids, h_utis.o_a);

						// unlock net uti map state
						k_workers.unlock('uti_nodes_prefixed');
					});


					let k_tasks = k_workers;
					for(let s_key in h_word_buffer_nodes_prefixed) {
						let k_front_coder = new bat.front_coder();

						k_tasks = k_tasks
							// front code absolute nodes' word buffer
							.dispatch({
								task: 'front_code_word_buffer',
								data: this.balance_word_buffer(h_word_buffer_nodes_prefixed[s_key]),
							})
							// combine front-coded fragments
							.sequence((h_fragment_nodes_prefixed) => {
								k_front_coder.import(h_fragment_nodes_prefixed);
							}, () => {
								// absolute nodes section done
								k_workers.unlock(H_NODE_ABBREVIATIONS[s_key]+'_prefixed');

								this.push_chapter(k_front_coder.close(H_CODES_CHAPTERS_ABSOLUTE[s_key]));
								console.info('prefixed '+s_key);
							});
					}

					// add new task stream to outer stream
					return k_tasks;
				}
			})

			// sort, concat, then encode plain literals
			.dispatch({
				task: 'sort_concat_encode',
				data: this.balance_literals_plain(k_creator),
				args: [i_uti],
			})
			// combine sorted word buffers for plain literals
			.reduce({
				task: 'merge_word_buffers',
				args: [i_uti],
			}, (h_word_buffer_literals_plain=null) => {
				// no plain literals
				if(!h_word_buffer_literals_plain) {
					// unlock uti map and plain literals
					k_workers.unlock([
						'uti_literals_plain',
						'literals_plain',
					]);
				}
				// yes plain literals
				else {
					// once utis for prefixed nodes are mapped
					k_workers.wait('uti_nodes_prefixed', () => {
						// save uti map for plain literals
						this.add_uti_map(h_word_buffer_literals_plain.ids);

						// unlock next uti map state
						k_workers.unlock('uti_literals_plain');
					});

					// literals plain front coder
					let k_front_coder = h_front_coders.lp;

					// add to outer stream
					return k_workers
						// front code plain literals' word list
						.dispatch({
							task: 'front_code_word_buffer',
							data: this.balance_word_buffer(h_word_buffer_literals_plain),
						})
						// import each section to literal's front coder
						.sequence((h_fragment_literal_plain) => {
							k_front_coder.import(h_fragment_literal_plain);
						}, () => {
							// plain literals section done
							k_workers.unlock('plain_literals');

							console.info('plain literals');
						});
				}
			})

			// sort, concat, then encode language literals
			.dispatch({
				task: 'sort_concat_encode',
				data: this.balance_literals_languaged(k_creator),
				args: [i_uti],
			})
			// combine sorted word buffers for language literals
			.reduce({
				task: 'merge_word_buffers',
				args: [i_uti],
			}, (h_word_buffer_literals_languaged=null) => {
				// no datatyped literals
				if(!h_word_buffer_literals_languaged) {
					// unlock uti map and datatyped literals
					k_workers.unlock([
						'uti_literals_languaged',
						'literals_languaged',
					]);
				}
				else {
					// once utis for plain literals are mapped
					k_workers.wait('uti_literals_plain', () => {
						// save uti map for languaged literals
						this.add_uti_map(h_word_buffer_literals_languaged.ids);

						// unlock next uti map state
						k_workers.unlock('uti_literals_languaged');
					});

					// languaged literals front coder
					let k_front_coder = h_front_coders.ll;

					// add new task stream to outer stream
					return k_workers
						// front code language literals' word buffer
						.dispatch({
							task: 'front_code_word_buffer',
							data: this.balance_word_buffer(h_word_buffer_literals_languaged),
							args: [n_block_size_k_literals],
						})
						// combine front-coded fragments
						.sequence((h_fragment_literals_languaged) => {
							// k_workers.wait('plain_literals', () => {
							k_front_coder.import(h_fragment_literals_languaged);
							// });
						}, () => {
							// language literals section done
							k_workers.unlock('literals_languaged');

							console.info('languaged literals');
						});
				}
			})

			// sort, concat, then encode datatyped literals
			.dispatch({
				task: 'sort_concat_encode',
				data: this.balance_literals_datatyped(k_creator),
				args: [i_uti],
				// debug: true,
			})
			// combine sorted word buffers for language literals
			.reduce({
				task: 'merge_word_buffers',
				args: [i_uti, true],
				debug: true,
			}, (h_word_buffer_literals_datatyped=null) => {
				// no datatyped literals
				if(!h_word_buffer_literals_datatyped) {
					// unlock uti map and datatyped literals
					k_workers.unlock([
						'uti_literals_datatpyed',
						'literals_datatyped',
					]);
				}
				else {
					// once utis for languaged literals are mapped
					k_workers.wait('uti_literals_languaged', () => {
						// save uti map
						this.add_uti_map(h_word_buffer_literals_datatyped.ids);

						// unlock next uti map state
						k_workers.unlock('uti_literals_datatpyed');
					});

					// datatyped literals front coder
					let k_front_coder = h_front_coders.ld;

					// add new task stream to outer stream
					return k_workers
						// front code language literals' word buffer
						.dispatch({
							task: 'front_code_word_buffer',
							data: this.balance_word_buffer(h_word_buffer_literals_datatyped),
							args: [n_block_size_k_literals],
						})
						// combine front-coded fragments
						.sequence((h_fragment_literals_datatyped) => {
							// k_workers.wait('plain_literals', () => {
							k_front_coder.import(h_fragment_literals_datatyped);
							// });
						}, () => {
							// datatyped literals section done
							k_workers.unlock('literals_datatyped');

							console.info('datatyped literals');
						});
				}
			});

			// .dispatch({
			// 	task: 'encode_prefixed_nodes',
			// 	data: this.divide_prefix_nodes(),
			// })
			// .sequence((h_response, i_response, f_carry) => {
			// 	debugger;

			// 	let {
			// 		uni_maps: h_uni_maps,
			// 		counts: h_counts,
			// 	} = h_response;

			// 	// update uni maps
			// 	this.update_uni_map(h_uni_map_h, h_uni_maps.h, c_words_h);
			// 	this.update_uni_map(h_uni_map_s, h_uni_maps.s, c_words_s);
			// 	this.update_uni_map(h_uni_map_p, h_uni_maps.p, c_words_p);
			// 	this.update_uni_map(h_uni_map_o, h_uni_maps.o, c_words_o);

			// 	// assign each worker its next task of front coding prefixed nodes
			// 	f_carry({
			// 		h: c_words_h,
			// 		s: c_words_s,
			// 		p: c_words_p,
			// 		o: c_words_o,
			// 	});

			// 	// increment counts afterwards
			// 	c_words_h += h_counts.h;
			// 	c_words_s += h_counts.s;
			// 	c_words_p += h_counts.p;
			// 	c_words_o += h_counts.o;
			// })
			// .assign((h_counts) => ({
			// 	task: 'front_code_prefixed_nodes',
			// 	args: [h_counts],
			// }))
			// .sequence((h_front_coders_worker) => {
			// 	debugger;

			// 	// import each front coded group
			// 	h_front_coders.h.import(h_front_coders_worker.h);
			// 	h_front_coders.s.import(h_front_coders_worker.s);
			// 	h_front_coders.p.import(h_front_coders_worker.p);
			// 	h_front_coders.o.import(h_front_coders_worker.o);
			// })
			// .dispatch({
			// 	task: 'encode_plain_literals',
			// 	data: a_literal_tasks,
			// })
			// .sequence(() => {

			// });
	}
}


module.exports = function() {
	worker.dedicated({

		load(pm_format, z_stream_handle) {
			return new Promise((f_resolve) => {
				let k_creator = new loader({
					resolve: f_resolve,
					workers: worker.group('./encoder.js'),
				});

				// k_creator.load_split(pm_format, worker.stream(z_stream_handle));
				k_creator.load_sync(pm_format, worker.stream(z_stream_handle), this);
			});
		},

	});
};
