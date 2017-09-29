

const worker = require('worker').scopify(require, {
	workers: () => {
		require('./encoder.js');
		require('./parse.js');
	},
});

const graphy = require('../../main/graphy.js');
const bat = require('../bat.js');


const F_SORT_COUNT_DESC = (h_a, h_b) => {
	return h_a.count > h_b.count;
};

const F_SORT_PREFIX_IRI = (h_a, h_b) => {
	return h_a.iri < h_b.iri? -1: 1;
};

const F_SORT_LANG = (h_a, h_b) => {
	return h_a.tag < h_b.tag? -1: 1;
};

const HP_DICTIONARY_SIZE = Symbol('size');

const D_TEXT_ENCODER = new TextEncoder();
const D_TEXT_DECODER = new TextDecoder();


class creator {
	constructor(h_config) {
		let {
			resolve: f_resolve,
			workers: k_workers,
		} = h_config;

		//
		let h_front_coder_config = {
			block_size_k: 4,
		};

		Object.assign(this, {
			resolve: f_resolve,

			prefix_groups: Object.create(null),
			prefix_node_count: 0,
			datatype_node_count: 0,
			prefix_key_bytes: 0,

			prefix_nodes: null,
			prefix_datatypes: null,

			nodes: {
				blank_count: 0,
				blank: Object.create(null),

				absolute_count: 0,
				absolute: Object.create(null),

				prefixed_count: 0,
				prefixed: [],
			},

			literals: {
				datatype_absolute_count: 0,
				datatypes_absolute: Object.create(null),

				datatypes_prefixed_count: 0,
				datatypes_prefixed: [],

				language_sum: 0,
				language_count: 0,
				languages: Object.create(null),

				plain_count: 0,
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

			uti: 0,
			uti_map: null,
			uti_term: 1,
			triples_spo: Object.create(null),

			output: [],
		});

		this.worker_count = this.workers.worker_count;
	}

	save_named_node(p_iri, n_type) {
		let h_prefix_groups = this.prefix_groups;

		// determine best prefix
		let m_compress = bat.R_COMPRESS.exec(p_iri);
		if(m_compress) {
			// destructure prefix fragments
			let [, p_prefix_iri, s_suffix] = m_compress;

			// first encounter of prefix
			if(!(p_prefix_iri in h_prefix_groups)) {
				// create prefix map; assign node
				h_prefix_groups[p_prefix_iri] = {
					node_count: 1,
					nodes: Object.assign(Object.create(null), {
						[s_suffix]: {type:n_type, id:this.uti},
					}),
				};

				return this.uti++;
			}
			// prefix exists
			else {
				let h_group = h_prefix_groups[p_prefix_iri];

				// first node for this prefix
				if(!('nodes' in h_group)) {
					Object.assign(h_group, {
						node_count: 1,
						nodes: Object.assign(Object.create(null), {
							[s_suffix]: {type:n_type, id:this.uti},
						}),
					});

					return this.uti++;
				}
				// other datatypes with prefix exist
				else {
					let h_nodes = h_group.nodes;

					// first encounter of node; set type and increment prefix's node counter
					if(!(s_suffix in h_nodes)) {
						h_group.node_count += 1;
						h_nodes[s_suffix] = {type:n_type, id:this.uti};

						return this.uti++;
					}
					// update node type
					else {
						h_nodes[s_suffix].type |= n_type;

						return h_nodes[s_suffix].id;
					}
				}
			}
		}
		// node could not be prefixed
		else {
			let h_nodes = this.nodes.absolute;

			// first encounter of node; set type
			if(!(p_iri in h_nodes)) {
				this.absolute_node_count += 1;
				h_nodes[p_iri] = {type:n_type, id:this.uti};

				return this.uti;
			}
			// update node type
			else {
				h_nodes[p_iri].type |= n_type;

				return h_nodes[p_iri].id;
			}
		}
	}

	save_datatyped_literal(s_value, p_datatype_iri) {
		let h_prefix_groups = this.prefix_groups;

		// determine best prefix
		let m_compress = bat.R_COMPRESS.exec(p_datatype_iri);
		if(m_compress) {
			// destructure prefix fragments
			let [, p_prefix_iri, s_suffix] = m_compress;

			// first encounter of prefix
			if(!(p_prefix_iri in h_prefix_groups)) {
				// create prefix map; assign node
				h_prefix_groups[p_prefix_iri] = {
					datatype_count: 1,
					datatypes: Object.assign(Object.create(null), {
						[s_suffix]: {
							[s_value]: this.uti,
						},
					}),
				};

				return this.uti++;
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
								[s_value]: this.uti,
							},
						},
					});

					return this.uti++;
				}
				// other datatype with prefix exists
				else {
					let h_datatypes = h_group.datatypes;

					// first encounter of this datatype
					if(!(s_suffix in h_datatypes)) {
						h_group.datatype_count += 1;
						h_datatypes[s_suffix] = {
							[s_value]: this.uti,
						};

						return this.uti++;
					}
					// add literal to datatype's set
					else {
						let h_datatype = h_datatypes[s_suffix];

						// first encounter with literal
						if(!(s_value in h_datatype)) {
							return h_datatype[s_value] = this.uti++;
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
					[s_value]: this.uti,
				};

				return this.uti++;
			}
			// add literal to datatype's set
			else {
				let h_datatype = h_datatypes[p_datatype_iri];

				// first encounter with literal
				if(!(s_value in h_datatype)) {
					return h_datatype[s_value] = this.uti++;
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
			h_literals.language_sum += 1;
			h_languages[s_lang] = {
				// [HP_DICTIONARY_SIZE]: 1,
				[s_value]: this.uti,
			};

			return this.uti++;
		}
		// another litera exists with same language tag; add literal to language's set
		else {
			let h_language = h_languages[s_lang];

			// first encounter of literal
			if(!(s_value in h_language)) {
				// h_language[HP_DICTIONARY_SIZE] += 1;
				h_literals.language_sum += 1;
				return h_language[s_value] = this.uti++;
			}
			// literal already exists; return unique literal id
			else {
				return h_language[s_value];
			}
		}
	}

	save_plain_literal(s_value) {
		let h_plain = this.literals.plain;

		// first encounter of literal
		if(!(s_value in h_plain)) {
			this.literals.plain_count += 1;
			return h_plain[s_value] = this.uti++;
		}
		// literal already exists; return unique literal id
		else {
			return h_plain[s_value];
		}
	}

	save_blank_node(p_label, n_type) {
		let h_blank_nodes = this.nodes.blank;

		// first encounter of node; set type
		if(!(p_label in h_blank_nodes)) {
			this.nodes.blank_count += 1;
			h_blank_nodes[p_label] = {type:n_type, id:this.uti};

			return this.uti++;
		}
		// update node type
		else {
			h_blank_nodes[p_label].type |= n_type;

			return h_blank_nodes[p_label].id;
		}
	}

	divide_word_list(h_list=null, n_block_size_k=4) {
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


	divide_word_buffer(h_words, i_offset) {
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

	divide_prefixes() {
		let {
			prefix_groups: h_prefix_groups,
			nodes: {prefixed:a_nodes},
			literals: {datatypes_prefixed:a_datatypes},
		} = this;

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

		// make prefix word list
		let k_key_space = new bat.key_space(n_prefix_key_bytes);
		let k_word_writer = new bat.word_writer();
		for(let i_prefix=0; i_prefix<n_prefixes; i_prefix++) {
			let {
				iri: p_prefix_iri,
				group: h_group,
			} = a_prefixes[i_prefix];

			// write iri to prefix word list
			k_word_writer.append(bat.encode_utf_8(p_prefix_iri));

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
						value: s_code_prefix+s_suffix+'\0',
						type: h_node.type,
						id: h_node.id,
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
							value: s_code_datatype+s_value+'\0',
							id: h_literals[s_value],
						});
					}
				}
			}
		}

		// save counts
		this.nodes.prefixed_count = c_nodes;
		this.literals.datatypes_prefixed_count = c_datatypes;

		// done with prefix iri list and prefix groups
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

	divide_plain_literals() {
		let h_literals = this.literals;

		let h_literals_plain = h_literals.plain;
		let n_literals = h_literals.plain_count;

		// no plain literals
		if(!n_literals) return [];

		// divide set of literals into list of buffers
		let a_divisions = [];
		let k_word_writer = new bat.word_writer({malloc:true});

		// make generator for dividing this many literals
		let g_divider = this.workers.divider(n_literals);

		// divide literals into buffers
		for(let s_literal in h_literals_plain) {
			let ab_content = bat.encode_utf_8(s_literal);
			let ab_word = Buffer.concat([bat.AB_TOKEN_CONTENTS, ab_content, bat.AB_ZERO], 1+ab_content.length+1);
			k_word_writer.append(ab_word);

			// divide here
			if(g_divider.next().value) {
				a_divisions.push(k_word_writer.close());
				k_word_writer = new bat.word_writer({malloc:true});
			}
		}

		// final division
		a_divisions.push(k_word_writer.close());

		return a_divisions;
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

	save_t(h_triple) {
		// ref all positions of triple
		let {
			subject: h_subject,
			predicate: h_predicate,
			object: h_object,
		} = h_triple;

		let i_s;

		// subject is named node
		if(h_subject.isNamedNode) {
			i_s = this.save_named_node(h_subject.value, bat.XM_NODE_SUBJECT);
		}
		// subject is blank node
		else {
			i_s = this.save_blank_node(h_subject.value, bat.XM_NODE_SUBJECT);
		}

		// predicate is always named node
		let i_p = this.save_named_node(h_predicate.value, bat.XM_NODE_PREDICATE);

		let i_o;

		// object is literal
		if(h_object.isLiteral) {
			// ... a language literal
			if(h_object.language) {
				i_o = this.save_language_literal(h_object.value, h_object.language);
			}
			// ... a datatyped literal
			else if(h_object.hasOwnProperty('datatype')) {
				// datatype is always a named node
				i_o = this.save_datatyped_literal(h_object.value, h_object.datatype.value);
			}
			// ... a plain literal
			else {
				i_o = this.save_plain_literal(h_object.value);
			}
		}
		// object is named node
		else if(h_object.isNamedNode) {
			i_o = this.save_named_node(h_object.value, bat.XM_NODE_OBJECT);
		}
		// object is blank node
		else {
			i_o = this.save_blank_node(h_object.value, bat.XM_NODE_OBJECT);
		}

		// save triple using utis
		this.save_spo(i_s, i_p, i_o);
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

				this.process().end(() => {
					fk_terms({
						workers: this.process(),
					});
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
	add_uti_map(at_ids) {
		let {
			uti_map: at_uti_map,
			uti_term: i_term,
		} = this;

		// each id
		let n_ids = at_ids.length;
		for(let i_id=0; i_id<n_ids; i_id++) {
			// set mapping
			at_uti_map[at_ids[i_id]] = i_term++;
		}

		// save uti pointer
		this.uti_term = i_term;
	}

	push_chapter(at_chapter) {
		this.output.push(at_chapter);
	}

	process() {
		let k_workers = this.workers;
		let h_front_coders = this.front_coders;

		// prepare uti map
		this.uti_map = bat.new_uint_array(this.uti, this.uti);

		// front-code options
		let n_block_size_k_literals = 4;

		// counts
		let n_literals_plain_count = this.literals.plain_count;
		let n_literals_language_count = this.literals.language_sum;

		// front coders
		let k_front_coder_prefixes = new bat.front_coder();
		let k_front_coder_literals = this.literals.front_coder;

		// prep word writers for building dict sections
		let h_word_writers = {};
		for(let s_symbol in h_front_coders) {
			h_word_writers[s_symbol] = new bat.word_writer();
		}

		// // encode absolute and blank nodes first (their buffer tokens sort them at the beginning)
		// this.encode_absolute_nodes(h_word_writers);
		// this.encode_blank_nodes(h_word_writers);

		// free to gc
		this.nodes.absolute = this.nodes.blank = null;

		// front code buffers and then release to gc
		this.front_code_word_list_groups(h_word_writers);
		h_word_writers = null;

		//
		k_workers.lock([
			'prefixes',
		]);

		// uti maps
		let h_uti_map_h = {};
		let h_uti_map_s = {};
		let h_uti_map_p = {};
		let h_uti_map_o = {};

		// serially increment counts of words as workers finish first task
		let c_words_h = 0;
		let c_words_s = 0;
		let c_words_p = 0;
		let c_words_o = 0;

		// once absolute nodes are ready; commit blank nodes
		k_workers.wait('nodes_absolute', () => {
			k_front_coder_nodes.import(k_front_coder_nodes_blank);
		});

		return k_workers
			// front code prefixes
			.dispatch({
				task: 'front_code_word_list',
				data: this.divide_prefixes(),
				transfers: true,
			})
			// import each prefix chapter fragment in sequence
			.sequence((h_fragment) => {
				k_front_coder_prefixes.import(h_fragment);
			}, () => {
				// its done; commit chapter and unlock prefixes
				this.push_chapter(k_front_coder_prefixes.export());
				k_front_coder_prefixes = null;
				k_workers.unlock('prefixes');

				console.info('front-coded prefixes');
			})
			// sort, concat then encode absolute nodes
			.dispatch({
				task: 'sort_concat_encode',
				data: this.divide_nodes_absolute(),
			})
			// combine sorted word buffers for absolute nodes
			.reduce({
				task: 'merge_word_buffers',
				args: [this.uti],
			}, (h_word_buffer_nodes_absolute) => {
				debugger;
			})
			// sort, concat then encode blank nodes
			.dispatch({
				task: 'sort_concat_encode',
				data: this.divide_nodes_prefixed(),
			})
			// combine sorted word buffers for absolute nodes
			.reduce({
				task: 'merge_word_buffers',
				args: [this.uti],
			}, (h_word_buffer_nodes_absolute) => {
				debugger;
			})
			// sort plain literals' word lists
			.dispatch({
				task: 'sort_word_list',
				data: this.divide_plain_literals(),
			})
			// merge sorted lists into single word list
			.reduce({
				task: 'merge_word_lists',
			}, (h_word_lists_plain_literal=null) => {
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
					.sequence((h_fragment_literal_plain) => {
						k_front_coder_literals.import(h_fragment_literal_plain);
					}, () => {
						k_workers.unlock('plain_literals');
					})
					// sort, concat, then encode language literals
					.dispatch({
						task: 'sort_concat_encode',
						data: this.divide_language_literals(),
						args: [this.uti],
					})
					// combine sorted word buffers for language literals
					.reduce({
						task: 'merge_word_buffers',
						args: [this.uti],
					}, (h_word_buffer_literals_language) => {
						// save uti map
						this.add_uti_map(h_word_buffer_literals_language.ids);

						// add new task stream to outer stream
						return k_workers
							// front code language literals' word buffer
							.dispatch({
								task: 'front_code_word_buffer',
								data: this.divide_word_buffer(h_word_buffer_literals_language, n_literals_plain_count),
								args: [n_block_size_k_literals],
							})
							// combine front-coded fragments
							.sequence((h_fragment_literal_language) => {
								k_workers.wait('plain_literals', () => {
									k_front_coder_literals.import(h_fragment_literal_language);
								});
							}, () => {
								// language literals section done
								k_workers.unlock('language_literals');
							})
							// datatype literals
							.dispatch({
								task: 'sort_concat_encode',
								data: this.divide_datatype_literals(),

							});
					})
					// .sequence((h_response, i_response, f_carry) => {
					// 	debugger;
					// 	// f_carry();
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
