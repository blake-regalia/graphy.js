const bkit = require('bkit');
const performance_now = require('performance-now');

const worker = require('worker').scopify(require, () => {
	require('./workers/encoder.js');
}, 'undefined' !== typeof arguments && arguments);

const bat = require('./bat.js');
const creator = require('./creator.js');

const encoder_chapter = require('./encoders/chapter-difcc.js');

const {
	S_PREFIXES,
	S_TERM_HA, S_TERM_SA, S_TERM_PA, S_TERM_OA,
	S_TERM_HP, S_TERM_SP, S_TERM_PP, S_TERM_OP,
	S_TERM_LP, S_TERM_LL, S_TERM_LDA, S_TERM_LDP,
} = bat;

const F_SORT_COUNT_DESC = (h_a, h_b) => {
	return h_a.count > h_b.count;
};

const F_SORT_PREFIX_IRI = (h_a, h_b) => {
	return h_a.iri < h_b.iri? -1: 1;
};

const F_SORT_LANG = (h_a, h_b) => {
	return h_a.tag < h_b.tag? -1: 1;
};

const F_SORT_VALUE = (h_a, h_b) => {
	return h_a.value < h_b.value ? -1: 1;
};

const H_CONFIG_DEFAULT_FRONT_CODER = {
	block_size_k: 4,
};

const H_CHAPTERS_ABSOLUTE = {
	h: S_TERM_HA,
	s: S_TERM_SA,
	p: S_TERM_PA,
	o: S_TERM_OA,
};

const H_CHAPTERS_PREFIXED = {
	h: S_TERM_HP,
	s: S_TERM_SP,
	p: S_TERM_PP,
	o: S_TERM_OP,
};

class serializer {
	constructor(k_creator) {
		Object.assign(this, {
			creator: k_creator,

			nodes_prefixed: [],
			literals_datatyped_prefixed: [],

			workers: worker.group('./workers/encoder.js', null, {
				inspect: process.execArgv.includes('--inspect-brk')
					? {
						range: [9230, 9242],
						brk: true,
					}
					: false,
			}),

			front_coder_config: H_CONFIG_DEFAULT_FRONT_CODER,

			uti_map: null,
			uti_term: 1,

			chapters: [],
			output: [],

			utis: {},
		});

		this.worker_count = this.workers.worker_count;
	}

	async buffer() {
		await this.process_terms();
		await this.process_triples();

		this.close_output();

		let a_buffers = [];
		let cb_buffers = 0;
		for(let at_buffer of this.output) {
			let nb_buffer = at_buffer.byteLength;
			a_buffers.push(Buffer.from(at_buffer.buffer, at_buffer.byteOffset, nb_buffer));
			cb_buffers += nb_buffer;
		}
		return Buffer.concat(a_buffers, cb_buffers);
	}

	front_coder() {
		return new bat.front_coder(this.front_coder_config);
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
		let k_group = this.workers;

		let {
			contents: at_contents,
			ids: {length:n_words},
		} = h_words;
		let g_divider = k_group.divider(n_words);

		// divide buffer into word lists
		let a_data = [];
		let i_start = 0;
		let i_end = 0;
		let c_words_committed = -1;
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

	list_prefixed_items() {
		let {
			creator: k_creator,
			nodes_prefixed: a_nodes,
			literals_datatyped_prefixed: a_datatypes,
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
		// let kww = new bkit.word_writer();
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
		let at_contents = bkit.encode_utf_8(s_super);

		// front code prefix chapter
		let k_chapter = new encoder_chapter(H_CONFIG_DEFAULT_FRONT_CODER);
		k_chapter.add_nt_word_list(at_contents, n_prefixes);

		// commit chapter
		this.push_chapter(k_chapter.close(S_PREFIXES));

		// // divide and return prefix word list for front coding
		// return this.balance_word_list(k_word_writer.close());
	}

	balance_nodes_absolute() {
		let {
			nodes: {
				absolute_count: n_nodes_absolute,
				absolute: h_nodes_absolute,
			},
		} = this.creator;

		if(n_nodes_absolute) {
			debugger;
			throw new Error(`absolute iris not yet implemented`);
		}
		else {
			return [];
		}
		// return this.workers.balance(h_nodes_absolute);
	}

	balance_literals_plain() {
		let {
			creator: {
				literals: {
					plain: h_literals,
					plain_count: n_literals,
				},
			},
		} = this;

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

	balance_literals_languaged() {
		let {
			creator: {
				literals: {
					languaged_count: n_literals,
					languaged: h_literals,
				},
			},
		} = this;

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

	balance_literals_datatyped_absolute() {
		let {
			creator: {
				literals: {
					datatyped_absolute: h_literals_absolute,
				},
			},
		} = this;

		// divide literals into buffers
		let a_list = [];

		// start with absolutely datatyped literals
		for(let p_datatype_iri in h_literals_absolute) {
			a_list.push({
				value: p_datatype_iri,
				id: h_literals_absolute[p_datatype_iri],
			});
		}

		return this.workers.balance(a_list);
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
		let a_chapters = this.chapters;
		let nl_chapters = a_chapters.length;

		// info section
		let kbe_info = new bkit.buffer_encoder({size:64});

		// dictionary type
		kbe_info.ntu8_string('terms');

		// chapter count
		kbe_info.vuint(nl_chapters);

		// info section
		let at_info = kbe_info.close();

		// byte count of info section
		let cb_payload = at_info.byteLength;

		// add sum of chapter byte counts
		for(let i_chapter=0; i_chapter<nl_chapters; i_chapter++) {
			cb_payload += a_chapters[i_chapter].length;
		}

		// header section
		let kbe_header = new bkit.buffer_encoder({size:64});

		// dictionary encoding
		kbe_header.ntu8_string(bat.PE_DICTIONARY_PP12OC);

		// payload byte length
		kbe_header.vuint(cb_payload);

		// dictionary header
		this.output.push(kbe_header.close());

		// info section
		this.output.push(at_info);

		// chapters
		this.output.push(...a_chapters);
	}

	process_terms() {
		let {
			creator: {
				uti: i_uti,
			},
			workers: k_group,
		} = this;

		this.uti_map = bkit.new_uint_array(i_uti, i_uti);

		let h_utis = this.utis;

		this.list_prefixed_items();

		k_group
			.data(this.balance_nodes_absolute())

			// sort, concat then encode absolute nodes
			.map('classify_sort_concat_encode', [i_uti])

			// combine sorted word buffers for absolute nodes
			.reduce('merge_classified_word_buffers', [i_uti]).then((h_word_buffer_nodes_absolute=null) => {
				// no absolute nodes
				if(!h_word_buffer_nodes_absolute) {
					h_utis.hops_absolute = 2;
					h_utis.predicates_absolute = 2;

					// unlock uti map and first absolute node chapters
					k_group.unlock([
						'uti_'+S_TERM_HA,
						'uti_'+S_TERM_PA,
						S_TERM_HA,
						S_TERM_PA,
					]);

					k_group.wait('uti_'+S_TERM_HP, () => {
						h_utis.subjects_absolute = h_utis.hops_prefixed;
						k_group.unlock(['uti_'+S_TERM_SA]);
					});

					// as soon as the prefixed chapter is ready, unlock the next absolute chapter
					k_group.wait(S_TERM_HP, S_TERM_SA);

					k_group.wait('uti_'+S_TERM_SP, () => {
						h_utis.objects_absolute = h_utis.subjects_prefixed;
						k_group.unlock(['uti_'+S_TERM_OA]);
					});

					// as soon as the prefixed chapter is ready, unlock the next absolute chapter
					k_group.wait(S_TERM_SP, S_TERM_OA);
				}
				// yes absolute nodes
				else {
					// save & unlock uti maps
					h_utis.hops_absolute = this.add_uti_map(h_word_buffer_nodes_absolute.h.ids, 2);
					h_utis.predicates_absolute = this.add_uti_map(h_word_buffer_nodes_absolute.p.ids, 2);
					k_group.unlock(['uti_'+S_TERM_HA, 'uti_'+S_TERM_PA]);

					k_group.wait('uti_'+S_TERM_HP, () => {
						h_utis.subjects_absolute = this.add_uti_map(h_word_buffer_nodes_absolute.s.ids, h_utis.hops_prefixed);
						k_group.unlock('uti_'+S_TERM_SA);
					});

					k_group.wait('uti_'+S_TERM_SP, () => {
						h_utis.objects_absolute = this.add_uti_map(h_word_buffer_nodes_absolute.o.ids, h_utis.subjects_prefixed);
						k_group.unlock('uti_'+S_TERM_OA);
					});

					for(let s_key in h_word_buffer_nodes_absolute) {
						let k_chapter = new encoder_chapter(H_CONFIG_DEFAULT_FRONT_CODER);

						k_group
							.data(this.balance_word_buffer(h_word_buffer_nodes_absolute[s_key]))

							// front code absolute nodes' word buffer
							.map('encode_chapter')

							// combine front-coded fragments
							.series((h_fragment_nodes_absolute) => {
								k_chapter.import(h_fragment_nodes_absolute);
							}, () => {
								let s_chapter = H_CHAPTERS_ABSOLUTE[s_key];

								// push this chapter to dictionary
								this.push_chapter(k_chapter.close(s_chapter));

								// absolute nodes section done
								k_group.unlock(s_chapter);
							});
					}
				}
			});

		k_group
			// sort, concat then encode prefixed nodes
			.data(this.nodes_prefixed)

			.map('classify_sort_concat_encode', [i_uti, 'nopez'])

			// combine sorted word buffers for absolute nodes
			.reduce('merge_classified_word_buffers', [i_uti]).then((h_word_buffer_nodes_prefixed=null) => {
				// no prefixed nodes
				if(!h_word_buffer_nodes_prefixed) {
					// close node chapters
					debugger;

					// unlock uti map and prefixed nodes
					k_group.wait('uti_'+S_TERM_HA, 'uti_'+S_TERM_HP);
					k_group.wait('uti_'+S_TERM_SA, 'uti_'+S_TERM_SP);
					k_group.wait('uti_'+S_TERM_PA, 'uti_'+S_TERM_PP);
					k_group.wait('uti_'+S_TERM_OA, 'uti_'+S_TERM_OP);

					k_group.wait(S_TERM_HA, S_TERM_HP);
					k_group.wait(S_TERM_SA, S_TERM_SP);
					k_group.wait(S_TERM_PA, S_TERM_PP);
					k_group.wait(S_TERM_OA, S_TERM_OP);
				}
				// yes prefixed nodes
				else {
					// save & unlock uti maps
					k_group.wait('uti_'+S_TERM_HA, () => {
						h_utis.hops_prefixed = this.add_uti_map(h_word_buffer_nodes_prefixed.h.ids, h_utis.hops_absolute);
						k_group.unlock('uti_'+S_TERM_HP);
					});

					k_group.wait('uti_'+S_TERM_SA, () => {
						h_utis.subjects_prefixed = this.add_uti_map(h_word_buffer_nodes_prefixed.s.ids, h_utis.subjects_absolute);
						k_group.unlock('uti_'+S_TERM_SP);
					});

					k_group.wait('uti_'+S_TERM_PA, () => {
						h_utis.predicates_prefixed = this.add_uti_map(h_word_buffer_nodes_prefixed.p.ids, h_utis.predicates_absolute);
						k_group.unlock('uti_'+S_TERM_PP);
					});

					k_group.wait('uti_'+S_TERM_OA, () => {
						h_utis.objects_prefixed = this.add_uti_map(h_word_buffer_nodes_prefixed.o.ids, h_utis.objects_absolute);
						k_group.unlock('uti_'+S_TERM_OP);
					});

					for(let s_key in h_word_buffer_nodes_prefixed) {
						let k_chapter = new encoder_chapter(H_CONFIG_DEFAULT_FRONT_CODER);

						k_group
							.data(this.balance_word_buffer(h_word_buffer_nodes_prefixed[s_key]))

							// encode prefixed nodes'
							.map('encode_chapter')

							// combine front-coded fragments
							.series((h_fragment_nodes_prefixed) => {
								k_chapter.import(h_fragment_nodes_prefixed);
							}, () => {
								// wait for unlock events on absolute chapter
								k_group.wait(H_CHAPTERS_ABSOLUTE[s_key], () => {
									let s_chapter = H_CHAPTERS_PREFIXED[s_key];

									// push this chapter to dictionary
									this.push_chapter(k_chapter.close(s_chapter));

									// prefixed nodes section done
									k_group.unlock(s_chapter);
								});
							});
					}
				}
			});

		let s_literals_dependency = S_TERM_OP;
		let n_block_size_k_literals = 4;

		[
			{
				chapter: S_TERM_LP,
				use: this.balance_literals_plain(),
				// data: this.balance_word_buffer(h_literals.plain),
			},
			{
				chapter: S_TERM_LL,
				use: this.balance_literals_languaged(),
				// data: this.balance_word_buffer(h_literals.languaged),
			},
			{
				chapter: S_TERM_LDA,
				use: this.balance_literals_datatyped_absolute(),
				// data: this.balance_word_buffer(h_literals.datatyped_absolute),
			},
			{
				chapter: S_TERM_LDP,
				// data: k_group.balance(this.literals_datatyped_prefixed),
				data: this.literals_datatyped_prefixed,
			},
		].map((h_group) => {
			let {
				chapter: s_chapter,
				data: a_data,
				use: a_use,
			} = h_group;

			// copy ref dependency
			let s_dependency = s_literals_dependency;

			// advance dependency for next ref
			s_literals_dependency = s_chapter;

			let b_debug = false; //'literals_languaged' === s_chapter;

			return (a_data? k_group.data(a_data): k_group.use(a_use))

				// sort, concat, then encode terms
				.map('sort_concat_encode', [i_uti, b_debug])

				// combine sorted word buffers
				.reduce('merge_word_buffers', [i_uti, b_debug], null, b_debug? s_chapter: false).then((h_word_buffer=null) => {
					// no terms
					if(!h_word_buffer) {
						// once uti dependency is done
						k_group.wait('uti_'+s_dependency, () => {
							// forward propagate uti index
							h_utis[s_chapter] = h_utis[s_dependency];

							// unlock uti map
							k_group.unlock('uti_'+s_chapter);
						});

						// as soon as dependency chapter is done; so is this chapter
						k_group.wait(s_dependency, s_chapter);
					}
					else {
						// once utis for dependency are mapped
						k_group.wait('uti_'+s_dependency, () => {
							// save uti map
							h_utis[s_chapter] = this.add_uti_map(h_word_buffer.ids, h_utis[s_dependency]);

							// unlock next uti map state
							k_group.unlock('uti_'+s_chapter);
						});

						// datatyped literals front coder
						let k_chapter = new encoder_chapter();

						// add new task stream to outer stream
						return k_group
							.data(this.balance_word_buffer(h_word_buffer))

							// front code absolutely datatyped literals' word buffer
							.map('encode_chapter')

							// combine front-coded fragments
							.series((h_fragment) => {
								k_chapter.import(h_fragment);
							}, () => {
								// wait for dependency to be done
								k_group.wait(s_dependency, () => {
									// push chapter to dictionary
									this.push_chapter(k_chapter.close(s_chapter));

									// chapter done
									k_group.unlock(s_chapter);
								});
							});
					}
				});
		});

		return new Promise((f_resolve) => {
			// once the last chapter is ready
			k_group.wait(['uti_'+S_TERM_LDP, S_TERM_LDP], () => {
				// commit dictionary
				this.commit_dictionary();

				// done here
				f_resolve();
			});
		});

		// return new Promise((f_resolve) => {
		// 	k_group.wait(Object.values(H_CHAPTERS_PREFIXED), () => {
		// 		debugger;
		// 		this;
		// 		f_resolve();
		// 	});
		// });
	}

	process_triples() {
		let {
			creator: {
				triples_count: c_triples,
				pairs_count: c_pairs,
				subjects_count: c_subjects,
				triples_spo: h_spo_uti,
			},
			uti_map: at_utis,
			utis: h_utis,
		} = this;
debugger;

		let i_term_adj_sp_o = 0;
		let i_write_adj_sp_o = 0;
		let at_adj_sp_o = bkit.new_uint_array(h_utis.literals_datatyped_prefixed, c_triples);
		let kbs_sp_o = new bkit.bitsequence_writer(c_triples);

		// let i_write_idx_sp_o = 0;
		// let at_idx_sp_o = bat.new_uint_array(c_triples+c_pairs, c_pairs);


		let i_term_adj_s_p = 0;
		let i_write_adj_s_p = 0;
		let at_adj_s_p = bkit.new_uint_array(h_utis.predicates_prefixed, c_pairs);
		let kbs_s_p = new bkit.bitsequence_writer(c_pairs);

		// let i_write_idx_s_p = 0;
		// let at_idx_s_p = bat.new_uint_array(c_pairs, c_subjects);

		// convert hash into sorted list
		let a_ss = new Array(c_subjects);
		for(let si_s in h_spo_uti) {
			a_ss[at_utis[+si_s]] = h_spo_uti[si_s];
		}

// debugger;

		// each subject
		for(let i_s=2; i_s<c_subjects+2; i_s++) {
			let h_po_uti = a_ss[i_s];

			// convert hash into list
			let a_ps = [];
			for(let si_p in h_po_uti) {
				a_ps.push({
					value: at_utis[+si_p],
					list: h_po_uti[si_p],
				});
			}

			// sort predicate list
			a_ps.sort(F_SORT_VALUE);

			// each predicate
			for(let i_p=0, n_ps=a_ps.length; i_p<n_ps; i_p++) {
				let h_p = a_ps[i_p];

				// write predicate to adjacency list
				at_adj_s_p[i_write_adj_s_p++] = h_p.value;

				// convert list of utis to list of term ids
				let a_o = [];
				for(let i_o_uti of h_p.list) {
					a_o.push(at_utis[+i_o_uti]);
				}

				// sort object list
				a_o.sort();

				// each object
				for(let i_o=0, n_o=a_o.length; i_o<n_o; i_o++) {
					// write to object adjacency list
					at_adj_sp_o[i_write_adj_sp_o++] = a_o[i_o];
				}

				// index end of object list & advance terminal index
				kbs_sp_o.advance(i_write_adj_sp_o-i_term_adj_sp_o);
				i_term_adj_sp_o = i_write_adj_sp_o;
			}

			// index end of predicate list & advance terminal index
			kbs_s_p.advance(i_write_adj_s_p-i_term_adj_s_p);
			i_term_adj_s_p = i_write_adj_s_p;
		}

		// close bitsequences
		let at_bs_s_p = kbs_s_p.close();
		let at_bs_sp_o = kbs_sp_o.close();

		// create section header
		let kbe_header = new bkit.buffer_encoder({size:512});

		// create info section
		let kbe_info = new bkit.buffer_encoder({size:512});

		// index type
		kbe_info.ntu8_string('spo');

		// number of pairs
		kbe_info.vuint(c_pairs);

		// number of triples
		kbe_info.vuint(c_triples);

		// end of info section
		let at_info = kbe_info.close();

		// encoding scheme
		kbe_header.ntu8_string(bat.PE_TRIPLES_BITMAP);

		// payload byte count
		kbe_header.vuint(at_info.byteLength
			+ at_adj_s_p.length
			+ at_bs_s_p.length
			+ at_adj_sp_o.length
			+ at_bs_sp_o.length);

		// add section to output
		this.output.push(
			kbe_header.close(),
			at_info,
			at_adj_s_p, at_bs_s_p,
			at_adj_sp_o, at_bs_sp_o,
		);
	}

	close_output() {
		// count payload byte length
		let cb_payload = 0;
		for(let at_section of this.output) {
			cb_payload += at_section.byteLength;
		}

		// encode header
		let kbe_header = new bkit.buffer_encoder({size:512});

		// dataset encoding
		kbe_header.ntu8_string(bat.PE_DATASET_PG);

		// payload byte length
		kbe_header.vuint(cb_payload);

		// push dataset header to front
		this.output.unshift(kbe_header.close());
	}
}

module.exports = serializer;
