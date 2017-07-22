/* eslint-disable */
const HP_RANGE_ALL = Symbol('range:all');
const HP_RANGE_HOPS = Symbol('range:hops');
const HP_RANGE_NODES = Symbol('range:nodes');
const HP_RANGE_LITERALS = Symbol('range:literals');
const HP_RANGE_SOURCES = Symbol('range:sources');
const HP_RANGE_SINKS = Symbol('range:sinks');
const HP_HOP = Symbol('hop');
const HP_SUBJECT = Symbol('subject');
const HP_PREDICATE = Symbol('predicate');
const HP_INVERSE_PREDICATE = Symbol('inverse-predicate');
const HP_OBJECT = Symbol('object');
const HP_USE_SPO = Symbol('use:SPO');
const HP_USE_POS = Symbol('use:POS');
const HP_USE_OSP = Symbol('use:OSP');
const A_DATA_MAP = [
	HP_USE_SPO, // Ks Kp Ko : 0 0 0
	HP_USE_SPO, // Ks Kp Vo : 0 0 1
	HP_USE_OSP, // Ks Vp Ko : 0 1 0
	HP_USE_SPO, // Ks Vp Vo : 0 1 1
	HP_USE_POS, // Vs Kp Ko : 1 0 0
	HP_USE_POS, // Vs Kp Vo : 1 0 1
	HP_USE_OSP, // Vs Vp Ko : 1 1 0
	HP_USE_SPO, // Vs Vp Vo : 1 1 1
];
const I_UTF_16_TOKEN = 0x04;
const AB_UTF_16_TOKEN = Buffer.from([I_UTF_16_TOKEN]);
const encode_utf_8 = (s_chunk) => Buffer.from(s_chunk, 'utf-8');
const encode_utf_16le = (s_chunk) => {
	// encode chunk as utf-16le
	let ab_chunk = Buffer.from(s_chunk, 'utf-16le');
	// prefix buffer w/ utf-16 token
	return Buffer.concat([AB_UTF_16_TOKEN, ab_chunk], ab_chunk.length + 1);
};
const R_OUTSIDE_UTF_8_SINGLE_BYTE_RANGE = /[^\u0000-\u007f]/g;
const encode_utf_auto = (s_str) => {
	// encode in utf-8
	let ab_utf8 = encode_utf_8(s_str);
	// string contains out-of-bounds characters
	if (R_OUTSIDE_UTF_8_SINGLE_BYTE_RANGE.test(s_str)) {
		// encode in utf-16
		let ab_utf16 = encode_utf_16le(s_str);
		// return whichever saves more space
		if (ab_utf8.length <= ab_utf16.length) {
			return ab_utf8;
		} else {
			return ab_utf16;
		}
	}
	// all characters can be encoded in utf8
	else {
		return ab_utf8;
	}
};
const join_buffers = (ab_a, ab_b) => {
	return Buffer.concat([ab_a, ab_b], ab_a.length + ab_b.length);
};
class Selection {
	constructor(k_graph, k_pattern) {
		this.graph = k_graph;
		this.pattern = k_pattern;
	}
	rows() {
		let a_fields = this.pattern.fields();
		//
		let h_results = this.consume(this.pattern);
		let a_rows = [];
		for (let i_head in h_results) {
			let a_survivors = h_results[i_head];
			for (let i_survivor = 0, n_survivors = a_survivors.length; i_survivor < n_survivors; i_survivor++) {
				let h_survivor = a_survivors[i_survivor];
				a_rows.push(h_survivor);
			}
		}
		a_rows.fields = a_fields;
		return a_rows;
	}
	next_triple_pattern(h_head, k_pattern) {
			let k_graph = this.graph;
			// edge of triple pattern
			let h_edge = k_pattern.shift();
			// tail of triple pattern
			let h_tail = k_pattern.shift();
			// assume normal direction
			let b_inverse = false;
			// determine data use
			let x_triple_pattern = 0;
			// body is normal direction
			if (HP_PREDICATE === h_edge.type) {
				// Vs
				if (h_head.range) x_triple_pattern |= 4;
				// Vo
				if (h_tail.range) x_triple_pattern |= 1;
			}
			// body is inverse direction
			else {
				b_inverse = true;
				// Vo
				if (h_head.range) x_triple_pattern |= 1;
				// Vs
				if (h_tail.range) x_triple_pattern |= 4;
			}
			// Vp
			if (h_edge.range) x_triple_pattern |= 2;
			// place the subject, predicate and object appropriately
			let h_spo = {
				// claim subjects
				s: b_inverse ? h_tail : h_head,
				// predicate(s) of triple pattern
				p: h_edge,
				// claim objects
				o: b_inverse ? h_head : h_tail,
			};
			// prep term positions
			let k_triples;
			// determine data use
			let hp_data_use = A_DATA_MAP[x_triple_pattern];
			// SPO
			if (HP_USE_SPO === hp_data_use) {
				if (!k_graph.triples_spo) {
					throw 'Query requires the POS triples index to be built.';
				}
				k_triples = k_graph.triples_spo;
			}
			// POS
			else if (HP_USE_POS === hp_data_use) {
				if (!k_graph.triples_pos) {
					throw 'Query requires the POS triples index to be built.';
				}
				k_triples = k_graph.triples_pos;
			}
			// OSP
			else {
				if (!k_graph.triples_osp) {
					throw 'Query requires the OSP triples index to be built.';
				}
				k_triples = k_graph.triples_osp;
			}
			// set a, b, c terms
			return {
				h_a: h_spo[k_triples.a],
				h_b: h_spo[k_triples.b],
				h_c: h_spo[k_triples.c],
				k_triples,
				b_inverse,
				h_head,
				h_edge,
				h_tail,
			};
		}
		* results() {
			let k_graph = this.graph;
			let k_pattern = this.pattern;
			// fetch next triple pattern
			let {
				h_a,
				h_b,
				h_c,
				k_triples,
				b_inverse,
				h_head,
				h_edge,
				h_tail,
			} = this.next_triple_pattern(k_pattern.shift(), k_pattern);
			// ref markings
			let s_mark_a = h_a.mark;
			let s_mark_b = h_b.mark;
			let s_mark_c = h_c.mark;
			// save which heads were used and their associated rows
			let h_results = {};
			// base row
			let h_row__ = {};
			// end of pattern sequence?
			let b_terminate = !k_pattern.length;
			// mk iteration generators
			let f_a = this.generate_a_rows(h_a, k_triples.a);
			let f_b = this.generate_b_rows(h_b, k_triples);
			// bidirectional set intersection
			if (!h_a.range && !h_b.range && h_c.range && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
				let f_c = this.generate_c_ids(h_c, k_triples);
				// set m1
				let a_m1 = [];
				// iterate a
				for (let {
						id: i_a,
						row: h_row_a
					} of f_a(h_row__)) {
					let a_heads = h_results[i_a] = [];
					// iterate b
					for (let {
							id: i_b,
							row: h_row_b,
							offset: c_off_b
						} of f_b(i_a, h_row_a)) {
						// iterate c
						for (let i_c of f_c(i_a, c_off_b)) {
							// accumulate ids to m1
							a_m1.push(i_c);
						}
						// compute intersection between m1 and m2
						a_heads.push(...this.intersection(k_pattern, h_row_b, h_tail, a_m1));
					}
				}
			} else {
				let f_c = this.generate_c_rows(h_c, k_triples);
				// iterate a
				for (let {
						id: i_a,
						row: h_row_a
					} of f_a(h_row__)) {
					// iterate b
					for (let {
							id: i_b,
							row: h_row_b,
							offset: c_off_b
						} of f_b(i_a, h_row_a)) {
						// iterate c
						for (let {
								id: i_c,
								row: h_row_c
							} of f_c(i_a, c_off_b, h_row_b)) {
							// ref head(s)
							let i_head = b_inverse ? i_c : i_a;
							let a_heads = h_results[i_head];
							if (!a_heads) a_heads = h_results[i_head] = [];
							// tail has probes
							if (h_c.probes) {
								// simulate pattern head just for probe
								let h_sim_c = {
									id: i_c,
									probes: h_c.probes,
								};
								// probe all of c
								let h_survivors = this.probe(k_pattern, h_row_c, h_sim_c);
								if (h_survivors.size) {
									for (let i_tail in h_survivors) {
										let a_survivors = h_survivors[i_tail];
										for (let i_survivor = 0, n_survivors = a_survivors.length; i_survivor < n_survivors; i_survivor++) {
											let a_survivor = a_survivors[i_survivor];
											a_heads.push(a_survivor);
										}
									}
								}
							}
							// reached end of pattern; push the current row
							else if (b_terminate) {
								// save row
								a_heads.push(h_row_c);
							}
							// more pattern to match
							else {
								// simulate pattern head for next triple
								let h_sim_c = {
									id: i_c,
									type: HP_HOP,
								};
								// proceed on c
								let h_survivors = this.proceed(k_pattern.copy(), h_row_c, h_sim_c);
								for (let i_survivor in h_survivors) {
									// push all onto this super-head's list
									a_heads.push(...h_survivors[i_survivor]);
								}
							}
						}
					}
				}
			}
		}
	distinct_heads(b_1) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// fetch next triple pattern
		let {
			h_a,
			h_b,
			h_c,
			k_triples,
			b_inverse,
			h_head,
			h_edge,
			h_tail,
		} = this.next_triple_pattern(k_pattern.shift(), k_pattern);
		// make set of head ids
		let h_head_ids = {};
		// end of pattern sequence?
		let b_terminate = !k_pattern.length;
		let f_a = this.generate_a_ids(h_a, k_triples.a);
		let f_b = this.generate_b_ids(h_b, k_triples);
		let f_c = this.generate_c_ids(h_c, k_triples);
		let b_head_is_a = (h_a === h_head);
		let b_head_is_c = (h_c === h_head);
		let n_range_d = k_graph.range_d;
		scanning_a:
			// iterate a
			for (let i_a of f_a()) {
				// iterate b
				for (let {
						id: i_b,
						offset: c_off_b
					} of f_b(i_a)) {
					// iterate c
					for (let i_c of f_c(i_a, c_off_b)) {
						// set head id
						let i_head = b_head_is_a ? i_a : (b_head_is_c ? i_c : i_b);
						let h_head_node = {
							id: i_head,
							type: h_head.type
						};
						let s_head = i_head < n_range_d ?
							'd' + i_head :
							(k_graph.TYPE_SUBJECT === h_head.type ?
								's' + i_head :
								(k_graph.TYPE_OBJECT === h_head.type ?
									'o' + i_head :
									'p' + i_head));
						// reached end of pattern
						if (b_terminate) {
							// inverse
							if (b_inverse) {
								// add to set
								h_head_ids[s_head] = b_1 || h_head_node;
							}
							// normal
							else {
								// add to set
								h_head_ids[s_head] = b_1 || h_head_node;
								// don't bother matching resst of triples belonging to this a
								if (b_head_is_a) continue scanning_a;
							}
						}
						// tail has probes
						else if (h_c.probes) {
							throw 'nye';
						}
						// more pattern to match
						else {
							// simulate pattern head for next triple
							let h_sim_c = {
								id: i_c,
								type: HP_HOP,
							};
							// this path completes
							if (this.completes(k_pattern.copy(), h_sim_c)) {
								// inverse
								if (b_inverse) {
									// add to set
									h_head_ids[s_head] = b_1 || h_head_node;
								}
								// normal
								else {
									// add to set
									h_head_ids[s_head] = b_1 || h_head_node;
									// don't bother matching resst of triples belonging to this a
									if (b_head_is_a) continue scanning_a;
								}
							}
						}
					}
				}
			}
		return h_head_ids;
	}
	completes(k_pattern, h_head) {
		// fetch next triple pattern
		let {
			h_a,
			h_b,
			h_c,
			k_triples,
			b_inverse,
			h_edge,
			h_tail,
		} = this.next_triple_pattern(h_head, k_pattern);
		// end of pattern sequence?
		let b_terminate = !k_pattern.length;
		let f_a = this.generate_a_ids(h_a, k_triples.a);
		let f_b = this.generate_b_ids(h_b, k_triples);
		let f_c = this.generate_c_ids(h_c, k_triples);
		scanning_a:
			// iterate a
			for (let {
					id: i_a,
					row: h_row_a
				} of f_a(h_row__)) {
				// iterate b
				for (let {
						id: i_b,
						row: h_row_b,
						offset: c_off_b
					} of f_b(i_a, h_row_a)) {
					// iterate c
					for (let {
							id: i_c,
							row: h_row_c
						} of f_c(i_a, c_off_b, h_row_b)) {
						// reached end of pattern
						if (b_terminate) {
							return true;
						}
						// tail has probes
						else if (h_c.probes) {
							throw 'nye';
						}
						// more pattern to match
						else {
							// simulate pattern head for next triple
							let h_sim_c = {
								id: i_c,
								type: HP_HOP,
							};
							// this path completes
							if (this.completes(k_pattern.copy(), h_sim_c)) {
								return true;
							}
						}
					}
				}
			}
	}
	generate_a_ids(h_entity, s_term) {
		let k_graph = this.graph;
		// ref entity attributes
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;
		// K*[1]
		if (h_entity.id) {
			let i_a = h_entity.id;
			// user bound a filter
			if (f_filter) {
				// filter rejects reconstructed term
				if (!f_filter(k_graph[s_term](i_a))) {
					// empty generator
					return function*() {};
				}
			}
			// user bound a data handler
			if (h_data) {
				// data plugin checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// apply plugin handler; action dissaproves of this entity
				if (f_evaluate && !f_evaluate(i_a)) {
					// empty generator
					return function*() {};
				}
			}
			// mk entity generator
			return function*(h_row__) {
				yield i_a;
			};
		}
		// K*[+]
		else if (h_entity.ids) {
			let a_entity_ids = h_entity.ids;
			// user bound a filter
			if (f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_a = a_entity_ids[i_entity_id];
					// entity passes filter test
					if (f_filter(k_graph[s_tream](i_a))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_a);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// user bound a data handler
			if (h_data) {
				// data plugin checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// filter entities
				if (f_evaluate) {
					let a_entity_ids_cleaned = [];
					for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
						let i_a = a_entity_ids[i_entity_id];
						// entity passes plugin test
						if (f_evaluate(i_a)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_a);
						}
					}
					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}
			}
			// mk entity generator
			return function*(h_row__) {
				// simply iterate each entity node id (already known to be valid entities)
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_a = a_entity_ids[i_entity_id];
					yield i_a;
				}
			};
		}
		// V*
		else {
			let hp_entity_type = h_entity.type;
			let hp_entity_range = h_entity.range;
			let i_start = 1;
			let i_stop;
			// V*[all]
			if (HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if (HP_SUBJECT === hp_entity_type) {
					i_stop = k_graph.range_s;
				}
				// for objects
				else if (HP_OBJECT === hp_entity_type) {
					i_stop = k_graph.range_l;
				}
				// for predicates
				else {
					i_stop = k_graph.range_p;
				}
			}
			// V*[hops]
			else if (HP_RANGE_HOPS === hp_entity_range) {
				i_stop = k_graph.range_d;
			}
			// V*[literals]
			else if (HP_RANGE_LITERALS === hp_entity_range) {
				i_start = k_graph.range_o;
				i_stop = k_graph.range_l;
			}
			// V*[sources]
			else if (HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[sinks]
			else if (HP_RANGE_SINKS === hp_entity_range) {
				i_stop = k_graph.range_o;
			}
			// V*[custom]
			else if (HP_RANGE_CUSTOM === hp_entity_range) {
				i_start = h_entity.start;
				i_stop = h_entity.stop;
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, HOPS}; found ' + hp_entity_range;
			}
			if (h_data) {
				// evaluate data find
				let k_plugin = h_data.plugin;
				let h_found = k_plugin.find(h_data.action, i_start, i_stop);
				// found a range
				if (h_found.range) {
					let h_range = h_found.range;
					// narrow range
					i_start = Math.max(i_start, h_range.low);
					i_stop = Math.min(i_stop, h_range.high);
					// mk entity generator
					return function*(h_row__) {
						// each and every entity node
						for (let i_a = i_start; i_a < i_stop; i_a++) {
							// skip entity if filter rejectes reconstructed term
							if (f_filter && !f_filter(k_graph[s_term](i_a))) continue;
							yield i_a;
						}
					};
				}
				// found a list of ids
				else if (h_found.ids) {
					let a_found_ids = h_found.ids;
					// mk entity generator
					return function*(h_row__) {
						// each found entity id
						for (let i_found_id = 0, n_found_ids = a_found_ids.length; i_found_id < n_found_ids; i_found_id++) {
							let i_a = a_found_ids[i_found_id];
							// skip entity if filter rejectes reconstructed term
							if (f_filter && !f_filter(k_graph[s_term](i_a))) continue;
							yield i_a;
						}
					};
				}
				// found something else
				else {
					throw `invalid 'find' return object`;
				}
			}
			// no data (no save)
			else {
				// mk entity generator
				return function*(h_row__) {
					// each and every entity node
					for (let i_a = i_start; i_a < i_stop; i_a++) {
						// skip entity if filter rejectes reconstructed term
						if (f_filter && !f_filter(k_graph[s_term](i_a))) continue;
						yield i_a;
					}
				};
			}
		}
	}
	generate_a_rows(h_entity, s_term) {
		let k_graph = this.graph;
		// ref entity attributes
		let s_mark = h_entity.mark;
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;
		// K*[1]
		if (h_entity.id) {
			let i_a = h_entity.id;
			// user bound a filter
			if (f_filter) {
				// filter rejects reconstructed term
				if (!f_filter(k_graph[s_term](i_a))) {
					// empty generator
					return function*() {};
				}
			}
			// user bound a data handler
			if (h_data) {
				// data plugin checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// apply plugin handler; action dissaproves of this entity
				if (f_evaluate && !f_evaluate(i_a)) {
					// empty generator
					return function*() {};
				}
				// data saves entity
				if (h_checker.save) {
					let k_instance = k_plugin.instance;
					let s_save = h_checker.save;
					// mk entity generator
					return function*(h_row__) {
						let h_row_a = Object.create(h_row__);
						// store saved
						h_row_a[s_save] = k_instance.load(i_a);
						// entity is marked; store marked
						if (s_mark) h_row_a[s_mark] = k_graph[s_term](i_a);
						// simply return entity id (already known to be a valid entity)
						yield {
							id: i_a,
							row: h_row_a,
						};
					};
				}
			}
			// mk entity generator
			return function*(h_row__) {
				// assume not marked
				let h_row_a = h_row__;
				// entity is marked
				if (s_mark) {
					h_row_a = Object.create(h_row__);
					// store marked
					h_row_a[s_mark] = k_graph[s_term](i_a);
				}
				// simply return entity id (already known to be a valid entity)
				yield {
					id: i_a,
					row: h_row_a,
				};
			};
		}
		// K*[+]
		else if (h_entity.ids) {
			let a_entity_ids = h_entity.ids;
			// user bound a filter
			if (f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_a = a_entity_ids[i_entity_id];
					// entity passes filter test
					if (f_filter(k_graph[s_tream](i_a))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_a);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// user bound a data handler
			if (h_data) {
				// data plugin checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// filter entities
				if (f_evaluate) {
					let a_entity_ids_cleaned = [];
					for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
						let i_a = a_entity_ids[i_entity_id];
						// entity passes plugin test
						if (f_evaluate(i_a)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_a);
						}
					}
					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}
				// data saves entity
				if (h_checker.save) {
					let s_save = h_checker.save;
					let k_instance = k_plugin.instance;
					// mk entity generator
					return function*(h_row__) {
						// simply iterate each entity node id (already known to be valid entities)
						for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
							let i_a = a_entity_ids[i_entity_id];
							// branch row
							let h_row_a = Object.create(h_row__);
							// store saved
							h_row_a[s_save] = k_instance.load(i_a);
							// store marked
							if (s_mark) h_row_a[s_mark] = k_graph[s_term](i_a);
							// yield
							yield {
								id: i_a,
								row: h_row_a,
							};
						}
					};
				}
			}
			// mk entity generator
			return function*(h_row__) {
				// simply iterate each entity node id (already known to be valid entities)
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_a = a_entity_ids[i_entity_id];
					// assume not marked
					let h_row_a = h_row__;
					// marked
					if (s_mark) {
						// branch row
						h_row_a = Object.create(h_row__);
						// store marked
						h_row_a[s_mark] = k_graph[s_term](i_a);
					}
					// yield
					yield {
						id: i_a,
						row: h_row_a,
					};
				}
			};
		}
		// V*
		else {
			let hp_entity_type = h_entity.type;
			let hp_entity_range = h_entity.range;
			let i_start = 1;
			let i_stop;
			// V*[all]
			if (HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if (HP_SUBJECT === hp_entity_type) {
					i_stop = k_graph.range_s;
				}
				// for objects
				else if (HP_OBJECT === hp_entity_type) {
					i_stop = k_graph.range_l;
				}
				// for predicates
				else {
					i_stop = k_graph.range_p;
				}
			}
			// V*[hops]
			else if (HP_RANGE_HOPS === hp_entity_range) {
				i_stop = k_graph.range_d;
			}
			// V*[literals]
			else if (HP_RANGE_LITERALS === hp_entity_range) {
				i_start = k_graph.range_o;
				i_stop = k_graph.range_l;
			}
			// V*[sources]
			else if (HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[sinks]
			else if (HP_RANGE_SINKS === hp_entity_range) {
				i_stop = k_graph.range_o;
			}
			// V*[custom]
			else if (HP_RANGE_CUSTOM === hp_entity_range) {
				i_start = h_entity.start;
				i_stop = h_entity.stop;
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, HOPS}; found ' + hp_entity_range;
			}
			if (h_data) {
				// evaluate data find
				let k_plugin = h_data.plugin;
				let h_found = k_plugin.find(h_data.action, i_start, i_stop);
				let k_instance = k_plugin.instance;
				let s_save = h_found.save;
				// found a range
				if (h_found.range) {
					let h_range = h_found.range;
					// narrow range
					i_start = Math.max(i_start, h_range.low);
					i_stop = Math.min(i_stop, h_range.high);
					// mk entity generator
					return function*(h_row__) {
						// each and every entity node
						for (let i_a = i_start; i_a < i_stop; i_a++) {
							// skip entity if filter rejectes reconstructed term
							if (f_filter && !f_filter(k_graph[s_term](i_a))) continue;
							// assume not marked
							let h_row_a = h_row__;
							// marked / saved
							if (b_store) {
								// branch row
								h_row_a = Object.create(h_row__);
								// store marked
								if (s_mark) {
									h_row_a[s_mark] = k_graph[s_term](i_a);
								}
								// store saved
								if (s_save) {
									h_row_a[s_save] = k_instance.load(i_a);
								}
							}
							// yield
							yield {
								id: i_a,
								row: h_row_a,
							};
						}
					};
				}
				// found a list of ids
				else if (h_found.ids) {
					let a_found_ids = h_found.ids;
					// mk entity generator
					return function*(h_row__) {
						// each found entity id
						for (let i_found_id = 0, n_found_ids = a_found_ids.length; i_found_id < n_found_ids; i_found_id++) {
							let i_a = a_found_ids[i_found_id];
							// skip entity if filter rejectes reconstructed term
							if (f_filter && !f_filter(k_graph[s_term](i_a))) continue;
							// assume not marked
							let h_row_a = h_row__;
							// marked / saved
							if (b_store) {
								// branch row
								h_row_a = Object.create(h_row__);
								// store marked
								if (s_mark) {
									h_row_a[s_mark] = k_graph[s_term](i_a);
								}
								// store saved
								if (s_save) {
									h_row_a[s_save] = k_instance.load(i_a);
								}
							}
							// yield
							yield {
								id: i_a,
								row: h_row_a,
							};
						}
					};
				}
				// found something else
				else {
					throw `invalid 'find' return object`;
				}
			}
			// no data (no save)
			else {
				// mk entity generator
				return function*(h_row__) {
					// each and every entity node
					for (let i_a = i_start; i_a < i_stop; i_a++) {
						// skip entity if filter rejectes reconstructed term
						if (f_filter && !f_filter(k_graph[s_term](i_a))) continue;
						// assume not marked
						let h_row_a = h_row__;
						// marked
						if (s_mark) {
							// branch row
							h_row_a = Object.create(h_row__);
							// store marked
							h_row_a[s_mark] = k_graph[s_term](i_a);
						}
						// yield
						yield {
							id: i_a,
							row: h_row_a,
						};
					}
				};
			}
		}
	}
	generate_b_ids(h_entity, k_triples) {
		let k_graph = this.graph;
		let s_term = k_triples.b;
		// ref entity attributes
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;
		// K*[1]
		if (h_entity.id) {
			let i_b = h_entity.id;
			// user bound a filter
			if (f_filter) {
				// filter rejects reconstructed term
				if (!f_filter(k_graph[s_term](i_b))) {
					// empty generator
					return function*() {};
				}
			}
			// user bound a data handler
			if (h_data) {
				// data plugin checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// apply plugin handler; action dissaproves of this entity
				if (f_evaluate && !f_evaluate(i_b)) {
					// empty generator
					return function*() {};
				}
			}
			// mk entity generator
			return function*(i_a, h_row_a) {
				// search data table for given entity
				let c_off_b = k_triples.find_b(i_a, i_b);
				if (c_off_b >= 0) {
					yield {
						id: i_b,
						offset: c_off_b,
					};
				}
			};
		}
		// K*[+]
		else if (h_entity.ids) {
			let a_entity_ids = h_entity.ids;
			// user bound a filter
			if (f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_b = a_entity_ids[i_entity_id];
					// entity passes filter test
					if (f_filter(k_graph[s_tream](i_b))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_b);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// user bound a data handler
			if (h_data) {
				// data plugin checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// filter entities
				if (f_evaluate) {
					let a_entity_ids_cleaned = [];
					for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
						let i_b = a_entity_ids[i_entity_id];
						// entity passes plugin test
						if (h_checker.evaluate(f_action, i_b)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_b);
						}
					}
					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}
			}
			// mk entity generator
			return function*(i_a, h_row_a) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();
				// search data table for given entities
				for (let {
						id: i_b,
						offset: c_off_b
					} of k_triples.each_b(i_a)) {
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_b);
					if (-1 !== i_found_edge) {
						// delete from search list
						a_search_ids.splice(i_found_entity, 1);
						yield {
							id: i_b,
							offset: c_off_b,
						};
						// found all ids; stop searching
						if (!a_search_ids.length) break;
					}
				}
			};
		}
		// Vp
		else {
			let hp_entity_type = h_entity.type;
			// yes data
			let f_evaluate;
			if (h_data) {
				let k_plugin = h_data.plugin;
				let f_action = h_data.action;
				if (k_plugin.has_exclusive_ranges) {
					let a_ranges = k_plugin.ranges_within(i_start, i_stop);
					// data incompatible with selection criteria
					if (!a_ranges.length) {
						return function*() {};
					}
					// single range!
					else if (1 === a_ranges.length) {
						i_start = a_ranges[0].low;
						i_stop = a_ranges[0].high;
					}
					// multiple ranges
					else {
						debugger;
						throw 'multiple ranges';
					}
				}
				let h_checker = k_plugin.checker(f_action);
				f_evaluate = h_checker.evaluate;
			}
			// Vp[all]
			if (HP_RANGE_ALL === hp_entity_range) {
				// mk entity generator
				return function*(i_a, h_row_a) {
					for (let {
							id: i_b,
							offset: c_off_b
						} of k_triples.each_b(i_a)) {
						// filter rejects reconstructed term; skip
						if (f_filter && !f_filter(k_graph[s_term](i_b))) continue;
						yield {
							id: i_b,
							offset: c_off_b,
						};
					}
				};
			}
			// V*[custom]
			else if (HP_RANGE_CUSTOM === hp_entity_range) {
				let i_start = h_entity.start;
				let i_stop = h_entity.stop;
				// mk entity iterator
				return function*(i_a, h_row_a) {
					// search data table for given range
					for (let {
							id: i_b,
							offset: c_off_b
						} of k_triples.each_b(i_a)) {
						// too low (not in range yet)
						if (i_b < i_start) continue;
						// too high (out of range)
						if (i_b >= i_stop) break;
						// filter rejects reconstructed term; skip
						if (f_filter && !f_filter(k_graph[s_term](i_b))) continue;
						// accepted
						yield {
							id: i_b,
							offset: c_off_b,
						};
					}
				};
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, CUSTOM}';
			}
		}
	}
	generate_b_rows(h_entity, k_triples) {
		let k_graph = this.graph;
		let s_term = k_triples.b;
		// ref entity attributes
		let s_mark = h_entity.mark;
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;
		// K*[1]
		if (h_entity.id) {
			let i_b = h_entity.id;
			// user bound a filter
			if (f_filter) {
				// filter rejects reconstructed term
				if (!f_filter(k_graph[s_term](i_b))) {
					// empty generator
					return function*() {};
				}
			}
			// user bound a data handler
			if (h_data) {
				// data plugin checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// apply plugin handler; action dissaproves of this entity
				if (f_evaluate && !f_evaluate(i_b)) {
					// empty generator
					return function*() {};
				}
				// data saves entity
				if (h_checker.save) {
					let s_save = h_checker.save;
					let k_instance = k_plugin.instance;
					// mk entity generator
					return function*(i_a, h_row_a) {
						// search data table for given entity
						let c_off_b = k_triples.find_b(i_a, i_b);
						if (c_off_b >= 0) {
							// branch row
							let h_row_b = Object.create(h_row_a);
							// store saved
							h_row_b[s_save] = k_instance.load(i_b);
							// store marked
							if (s_mark) h_row_b[s_mark] = k_graph[s_term](i_b);
							// yield
							yield {
								id: i_b,
								row: h_row_b,
								offset: c_off_b,
							};
						}
					};
				}
			}
			// mk entity generator
			return function*(i_a, h_row_a) {
				// search data table for given entity
				let c_off_b = k_triples.find_b(i_a, i_b);
				if (c_off_b >= 0) {
					// assume not marked
					let h_row_b = Object.create(h_row_a);
					// marked
					if (s_mark) {
						// branch row
						h_row_b = Object.create(h_row_a);
						// store marked
						h_row_b[s_mark] = k_graph[s_term](i_b);
					}
					// yield
					yield {
						id: i_b,
						row: h_row_b,
						offset: c_off_b,
					};
				}
			};
		}
		// K*[+]
		else if (h_entity.ids) {
			let a_entity_ids = h_entity.ids;
			// user bound a filter
			if (f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_b = a_entity_ids[i_entity_id];
					// entity passes filter test
					if (f_filter(k_graph[s_tream](i_b))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_b);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// user bound a data handler
			if (h_data) {
				// data plugin checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// filter entities
				if (f_evaluate) {
					let a_entity_ids_cleaned = [];
					for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
						let i_b = a_entity_ids[i_entity_id];
						// entity passes plugin test
						if (h_checker.evaluate(f_action, i_b)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_b);
						}
					}
					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}
				// data save
				if (h_data.save) {
					let k_instance = k_plugin.instance;
					let s_save = h_data.save;
					return function*(i_a, h_row_a) {
						// copy ids list
						let a_search_ids = a_entity_ids.slice();
						// search data table for given entities
						for (let {
								id: i_b,
								offset: c_off_b
							} of k_triples.each_b(i_a)) {
							// found a target entity
							let i_found_entity = a_search_ids.indexOf(i_b);
							if (-1 !== i_found_edge) {
								// delete from search list
								a_search_ids.splice(i_found_entity, 1);
								// branch row
								let h_row_b = Object.create(h_row_a);
								// store saved
								h_row_b[s_save] = k_instance.load(i_b);
								// store marked
								if (s_mark) h_row_b[s_mark] = k_graph[s_term](i_b);
								// yield
								yield {
									id: i_b,
									row: h_row_b,
									offset: c_off_b,
								};
								// found all ids; stop searching
								if (!a_search_ids.length) break;
							}
						}
					};
				}
			}
			// mk entity generator
			return function*(i_a, h_row_a) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();
				// search data table for given entities
				for (let {
						id: i_b,
						offset: c_off_b
					} of k_triples.each_b(i_a)) {
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_b);
					if (-1 !== i_found_edge) {
						// delete from search list
						a_search_ids.splice(i_found_entity, 1);
						// assume not marked
						let h_row_b = h_row_a;
						// marked
						if (s_mark) {
							// branch row
							h_row_b = Object.create(h_row_a);
							// store marked
							h_row_b[s_mark] = k_graph[s_term](i_b);
						}
						// yield
						yield {
							id: i_b,
							row: h_row_b,
							offset: c_off_b,
						};
						// found all ids; stop searching
						if (!a_search_ids.length) break;
					}
				}
			};
		}
		// Vp
		else {
			let hp_entity_type = h_entity.type;
			// yes data
			let f_evaluate;
			let s_save, k_instance;
			if (h_data) {
				let k_plugin = h_data.plugin;
				let f_action = h_data.action;
				k_instance = k_plugin.instance;
				if (k_plugin.has_exclusive_ranges) {
					let a_ranges = k_plugin.ranges_within(i_start, i_stop);
					// data incompatible with selection criteria
					if (!a_ranges.length) {
						return function*() {};
					}
					// single range!
					else if (1 === a_ranges.length) {
						i_start = a_ranges[0].low;
						i_stop = a_ranges[0].high;
					}
					// multiple ranges
					else {
						debugger;
						throw 'multiple ranges';
					}
				}
				let h_checker = k_plugin.checker(f_action);
				f_evaluate = h_checker.evaluate;
				s_save = h_checker.save;
			}
			// this entity will store something to row
			let b_store = s_mark || s_save;
			// Vp[all]
			if (HP_RANGE_ALL === hp_entity_range) {
				// mk entity generator
				return function*(i_a, h_row_a) {
					for (let {
							id: i_b,
							offset: c_off_b
						} of k_triples.each_b(i_a)) {
						// filter rejects reconstructed term; skip
						if (f_filter && !f_filter(k_graph[s_term](i_b))) continue;
						// assume not marked / saved
						let h_row_b = h_row_a;
						// marked
						if (b_store) {
							// branch row
							h_row_b = Object.create(h_row_a);
							// store marked
							if (s_mark) h_row_b[s_mark] = k_graph[s_term](i_b);
							// store saved
							if (s_save) h_row_b[s_save] = k_instance.load(i_b);
						}
						// yield
						yield {
							id: i_b,
							row: h_row_b,
							offset: c_off_b,
						};
					}
				};
			}
			// V*[custom]
			else if (HP_RANGE_CUSTOM === hp_entity_range) {
				let i_start = h_entity.start;
				let i_stop = h_entity.stop;
				// mk entity iterator
				return function*(i_a, h_row_a) {
					// search data table for given range
					for (let {
							id: i_b,
							offset: c_off_b
						} of k_triples.each_b(i_a)) {
						// too low (not in range yet)
						if (i_b < i_start) continue;
						// too high (out of range)
						if (i_b >= i_stop) break;
						// filter rejects reconstructed term; skip
						if (f_filter && !f_filter(k_graph[s_term](i_b))) continue;
						// assume not marked / saved
						let h_row_b = h_row_a;
						// marked
						if (b_store) {
							// branch row
							h_row_b = Object.create(h_row_a);
							// store marked
							if (s_mark) h_row_b[s_mark] = k_graph[s_term](i_b);
							// store saved
							if (s_save) h_row_b[s_save] = k_instance.load(i_b);
						}
						// yield
						yield {
							id: i_b,
							row: h_row_b,
							offset: c_off_b,
						};
					}
				};
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, CUSTOM}';
			}
		}
	}
	generate_c_ids(h_entity, k_triples) {
		let k_graph = this.graph;
		let s_term = k_triples.c;
		// ref entity attributes
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;
		// K*[1]
		if (h_entity.id) {
			let i_c = h_entity.id;
			// user bound a filter
			if (f_filter) {
				// filter rejects reconstructed term
				if (!f_filter(k_graph[s_term](i_c))) {
					// empty generator
					return function*() {};
				}
			}
			// user bound a data handler
			if (h_data) {
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// apply plugin handler; action dissaproves of this entity
				if (f_evaluate && !f_evaluate(i_c)) {
					// empty generator
					return function*() {};
				}
			}
			// mk entity generator
			return function*(i_a, c_off_b, h_row_b) {
				// search data table for given entity
				if (k_triples.has_c(i_a, c_off_b, i_c)) {
					yield i_c;
				}
			};
		}
		// K*[+]
		else if (h_entity.ids) {
			let a_entity_ids = h_entity.ids;
			// user bound a filter
			if (f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_c = a_entity_ids[i_entity_id];
					// entity passes filter test
					if (f_filter(k_graph[s_tream](i_c))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_c);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// user bound a data handler
			if (h_data) {
				// plugin data checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// filter entities
				if (f_evaluate) {
					let a_entity_ids_cleaned = [];
					for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
						let i_b = a_entity_ids[i_entity_id];
						// entity passes plugin test
						if (f_evaluate(i_c)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_c);
						}
					}
					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}
			}
			// mk entity generator
			return function*(i_a, c_off_b, h_row_b) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();
				// search data table for given entities
				for (let i_c of k_triples.each_c(i_a, c_off_b)) {
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_c);
					if (-1 !== i_found_edge) {
						// delete from search list
						a_search_ids.splice(i_found_entity, 1);
						yield i_c;
						// found all ids; stop searching
						if (!a_search_ids.length) break;
					}
				}
			};
		}
		// V*
		else {
			let hp_entity_type = h_entity.type;
			let hp_entity_range = h_entity.range;
			let i_start = 1;
			let i_stop;
			//
			let i_high_range = k_graph.range_l;
			// V*[all]
			if (HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if (HP_SUBJECT === hp_entity_type) {
					i_stop = k_graph.range_s;
				}
				// for objects
				else {
					i_stop = i_high_range;
				}
			}
			// V*[hops]
			else if (HP_RANGE_HOPS === hp_entity_range) {
				i_stop = k_graph.range_d;
			}
			// V*[literals]
			else if (HP_RANGE_LITERALS === hp_entity_range) {
				i_start = k_graph.range_o;
				i_stop = i_high_range;
			}
			// V*[sources]
			else if (HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[sinks]
			else if (HP_RANGE_SINKS === hp_entity_range) {
				i_stop = k_graph.range_o;
			}
			// V*[custom]
			else if (HP_RANGE_CUSTOM === hp_entity_range) {
				i_start = h_entity.start;
				i_stop = h_entity.stop;
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, HOPS}';
			}
			// yes data
			let f_evaluate;
			if (h_data) {
				let k_plugin = h_data.plugin;
				let f_action = h_data.action;
				if (k_plugin.has_exclusive_ranges) {
					let a_ranges = k_plugin.ranges_within(i_start, i_stop);
					// data incompatible with selection criteria
					if (!a_ranges.length) {
						return function*() {};
					}
					// single range!
					else if (1 === a_ranges.length) {
						i_start = a_ranges[0].low;
						i_stop = a_ranges[0].high;
					}
					// multiple ranges
					else {
						debugger;
						throw 'multiple ranges';
					}
				}
				let h_checker = k_plugin.checker(f_action);
				f_evaluate = h_checker.evaluate;
			}
			// mk entity generator
			return function*(i_a, c_off_b, h_row_b) {
				for (let i_c of k_triples.each_c(i_a, c_off_b)) {
					// too low (not in range yet)
					if (i_c < i_start) continue;
					// to high (out of range)
					if (i_c >= i_stop) break;
					// filter rejects reconstructed term; skip
					if (f_filter && !f_filter(k_graph[s_term](i_c))) continue;
					// data evaluate
					if (f_evaluate && !f_evaluate(i_c)) continue;
					yield i_c;
				}
			};
		}
	}
	generate_c_rows(h_entity, k_triples) {
		let k_graph = this.graph;
		let s_term = k_triples.c;
		// ref entity attributes
		let s_mark = h_entity.mark;
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;
		// K*[1]
		if (h_entity.id) {
			let i_c = h_entity.id;
			// user bound a filter
			if (f_filter) {
				// filter rejects reconstructed term
				if (!f_filter(k_graph[s_term](i_c))) {
					// empty generator
					return function*() {};
				}
			}
			// user bound a data handler
			if (h_data) {
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// apply plugin handler; action dissaproves of this entity
				if (f_evaluate && !f_evaluate(i_c)) {
					// empty generator
					return function*() {};
				}
				// data save
				if (h_checker.save) {
					let k_instance = k_plugin.instance;
					let s_save = h_checker.save;
					// mk entity generator
					return function*(i_a, c_off_b, h_row_b) {
						// search data table for given entity
						if (k_triples.has_c(i_a, c_off_b, i_c)) {
							// branch row
							let h_row_c = Object.create(h_row_b);
							// store saved
							h_row_c[s_save] = k_instance.load(i_c);
							// store marked
							if (s_mark) h_row_c[s_mark] = k_graph[s_term](i_c);
							// yield
							yield {
								id: i_c,
								row: h_row_c,
							};
						}
					};
				}
			}
			// mk entity generator
			return function*(i_a, c_off_b, h_row_b) {
				// search data table for given entity
				if (k_triples.has_c(i_a, c_off_b, i_c)) {
					let h_row_c = h_row_b;
					// marked
					if (s_mark) {
						// branch row
						h_row_c = Object.create(h_row_b);
						// store saved
						h_row_c[s_mark] = k_graph[s_term](i_c);
					}
					// yield
					yield {
						id: i_c,
						row: h_row_b,
					};
				}
			};
		}
		// K*[+]
		else if (h_entity.ids) {
			let a_entity_ids = h_entity.ids;
			// user bound a filter
			if (f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_c = a_entity_ids[i_entity_id];
					// entity passes filter test
					if (f_filter(k_graph[s_tream](i_c))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_c);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// user bound a data handler
			if (h_data) {
				// plugin data checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// filter entities
				if (f_evaluate) {
					let a_entity_ids_cleaned = [];
					for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
						let i_b = a_entity_ids[i_entity_id];
						// entity passes plugin test
						if (f_evaluate(i_c)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_c);
						}
					}
					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}
				// data save
				if (h_checker.save) {
					let k_instance = k_plugin.instance;
					let s_save = h_checker.save;
					// mk entity generator
					return function*(i_a, c_off_b, h_row_b) {
						// copy ids list
						let a_search_ids = a_entity_ids.slice();
						// search data table for given entities
						for (let i_c of k_triples.each_c(i_a, c_off_b)) {
							// found a target entity
							let i_found_entity = a_search_ids.indexOf(i_c);
							if (-1 !== i_found_edge) {
								// delete from search list
								a_search_ids.splice(i_found_entity, 1);
								// branch row
								let h_row_c = Object.create(h_row_b);
								// store saved
								h_row_c[s_save] = k_instance.load(i_c);
								// store marked
								if (s_mark) h_row_c[s_mark] = k_graph[s_term](i_c);
								// yield
								yield {
									id: i_c,
									row: h_row_c,
								};
								// found all ids; stop searching
								if (!a_search_ids.length) break;
							}
						}
					};
				}
			}
			// mk entity generator
			return function*(i_a, c_off_b, h_row_b) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();
				// search data table for given entities
				for (let i_c of k_triples.each_c(i_a, c_off_b)) {
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_c);
					if (-1 !== i_found_edge) {
						// delete from search list
						a_search_ids.splice(i_found_entity, 1);
						// assume not marked
						let h_row_c = h_row_b;
						// marked
						if (s_mark) {
							// branch row
							h_row_c = Object.create(h_row_b);
							// store marked
							h_row_c[s_mark] = k_graph[s_term](i_c);
						}
						// yield
						yield {
							id: i_c,
							row: h_row_b,
						};
						// found all ids; stop searching
						if (!a_search_ids.length) break;
					}
				}
			};
		}
		// V*
		else {
			let hp_entity_type = h_entity.type;
			let hp_entity_range = h_entity.range;
			let i_start = 1;
			let i_stop;
			//
			let i_high_range = k_graph.range_l;
			// V*[all]
			if (HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if (HP_SUBJECT === hp_entity_type) {
					i_stop = k_graph.range_s;
				}
				// for objects
				else {
					i_stop = i_high_range;
				}
			}
			// V*[hops]
			else if (HP_RANGE_HOPS === hp_entity_range) {
				i_stop = k_graph.range_d;
			}
			// V*[literals]
			else if (HP_RANGE_LITERALS === hp_entity_range) {
				i_start = k_graph.range_o;
				i_stop = i_high_range;
			}
			// V*[sources]
			else if (HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[sinks]
			else if (HP_RANGE_SINKS === hp_entity_range) {
				i_stop = k_graph.range_o;
			}
			// V*[custom]
			else if (HP_RANGE_CUSTOM === hp_entity_range) {
				i_start = h_entity.start;
				i_stop = h_entity.stop;
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, HOPS}';
			}
			// yes data
			let f_evaluate;
			let s_save, k_instance;
			if (h_data) {
				let k_plugin = h_data.plugin;
				let f_action = h_data.action;
				k_instance = k_plugin.instance;
				if (k_plugin.has_exclusive_ranges) {
					let a_ranges = k_plugin.ranges_within(i_start, i_stop);
					// data incompatible with selection criteria
					if (!a_ranges.length) {
						return function*() {};
					}
					// single range!
					else if (1 === a_ranges.length) {
						i_start = a_ranges[0].low;
						i_stop = a_ranges[0].high;
					}
					// multiple ranges
					else {
						debugger;
						throw 'multiple ranges';
					}
				}
				let h_checker = k_plugin.checker(f_action);
				f_evaluate = h_checker.evaluate;
				s_save = h_checker.save;
			}
			// this entity will store something to row
			let b_store = s_mark || s_save;
			// mk entity generator
			return function*(i_a, c_off_b, h_row_b) {
				for (let i_c of k_triples.each_c(i_a, c_off_b)) {
					// too low (not in range yet)
					if (i_c < i_start) continue;
					// to high (out of range)
					if (i_c >= i_stop) break;
					// filter rejects reconstructed term; skip
					if (f_filter && !f_filter(k_graph[s_term](i_c))) continue;
					// data evaluate
					if (f_evaluate && !f_evaluate(i_c)) continue;
					// assume not marked / saved
					let h_row_c = h_row_b;
					// marked / saved
					if (b_store) {
						// branch row
						h_row_c = Object.create(h_row_b);
						// store marked
						if (s_mark) {
							h_row_c[s_mark] = k_graph[s_term](i_c);
						}
						// store saved
						if (s_save) {
							h_row_c[s_save] = k_instance.load(i_c);
						}
					}
					// yield
					yield {
						id: i_c,
						row: h_row_c,
					};
				}
			};
		}
	}
	intersection(k_pattern, h_row__, h_head, a_m1) {
		let k_graph = this.graph;
		// fetch next triple pattern
		let {
			h_a,
			h_b,
			h_c,
			k_triples,
			b_inverse,
			h_edge,
			h_tail,
		} = this.next_triple_pattern(h_head, k_pattern);
		// ref markings
		let s_mark_a = h_a.mark;
		let s_mark_b = h_b.mark;
		let s_mark_c = h_c.mark;
		// save results as list
		let a_results = [];
		// m1 read index and length
		let i_m1 = 0;
		let n_m1 = a_m1.length;
		let f_a = this.generate_a_rows(h_a, k_triples.a);
		let f_b = this.generate_b_rows(h_b, k_triples);
		let f_c = this.generate_c_ids(h_c, k_triples);
		let s_term_c = k_triples.c;
		// head is marked
		if (h_head.mark) {
			// iterate a
			for (let {
					id: i_a,
					row: h_row_a
				} of f_a(h_row__)) {
				// iterate b
				for (let {
						id: i_b,
						row: h_row_b,
						offset: c_off_b
					} of f_b(i_a, h_row_a)) {
					let i_m1 = 0;
					find_intersections:
						// iterate c
						for (let i_c of f_c(i_a, c_off_b)) {
							// skip over non-intersecting ids
							for (; a_m1[i_m1] < i_c; i_m1++) {
								if (i_m1 === n_m1) {
									debugger;
									// no more intersections
									break find_intersections;
								}
							}
							// intersection
							if (a_m1[i_m1] === i_c) {
								debugger;
								// extend b
								let h_row_c = Object.create(h_row_b);
								// store marked
								h_row_c[s_mark_c] = k_graph[s_term_c](i_c);
								// add to results
								a_results.push(h_row_c);
							}
						}
					// results?!
					debugger;
				}
			}
		}
		// head is not marked, so long as there is one intersection we can continue matching
		else {
			// testing intersections......
			debugger;
		}
		// continue pattern....
		debugger;
		//
		return a_results;
	}
	consume(k_pattern) {
		let k_graph = this.graph
		// head of triple pattern
		let h_head = k_pattern.shift();
		// head has probes
		if (h_head.probes) {
			throw 'probing first';
			//
			let a_combine = a_rows;
			// each probe
			let a_probes = h_head.probes;
			for (let i_probe = 0; i_probe < a_probes.length; i_probe++) {
				let a_probe_rows = [];
				// destruct probe pattern
				let k_pattern_frag = a_probes[i_probe];
				// play out pattern within probe
				this.proceed(k_pattern_frag, {}, h_head);
				// only if there are results
				if (a_probe_rows.length) {
					// nothing to combine with; set directly
					if (!a_combine.length) {
						a_combine = a_probe_rows;
					}
					// combinations
					else {
						for (let i_combine_row = a_combine.length - 1; i_combine_row >= 0; i_combine_row--) {
							// take combine row out from array
							let h_combine_row = a_combine[i_combine_row];
							a_combine.splice(i_combine_row, 1);
							// each probe row to combine
							for (let i_probe_row = 0; i_probe_row < a_probe_rows.length; i_probe_row++) {
								let h_probe_row = a_probe_rows[i_probe_row];
								// copy original combine row
								let h_copy_row = Object.create(h_combine_row);
								// set each property from probe onto copy row
								for (let i_property in h_probe_row) {
									h_copy_row[i_property] = h_probe_row[i_property];
								}
								// push copy back onto combine
								a_combine.push(h_copy_row);
							}
						}
					}
				}
			}
		}
		// no probes
		else {
			// yes pattern
			if (k_pattern.length) {
				return this.proceed(k_pattern, {}, h_head);
			}
			// no pattern
			else {
				// head mark
				let s_mark = h_head.mark;
				// term position
				let s_term;
				switch (h_head.type) {
					case HP_HOP:
					case HP_SUBJECT:
						s_term = 's';
						break;
					case HP_OBJECT:
						s_term = 'o';
						break;
					default:
						{
							throw 'cannot determine term position';
						}
				}
				// destruct iterator
				let f_a = this.generate_a_rows(h_head, s_term);
				throw 'no pattern implement';
				//
				let h_data = h_head.data;
				let s_save = h_data && h_data.save;
				// no mark, no save
				if (!s_mark && !s_save) return [];
				// results list
				let a_results = [];
				for (let {
						id: i_a,
						row: h_row_a
					} of f_a({})) {
					a_results.push(h_row_a);
				}
				return {
					0: a_results,
				};
			}
		}
	}
	probe(k_root_pattern, h_row__, h_head) {
		//
		let a_living = [];
		let h_survivors = {};
		// each probe
		let a_probes = h_head.probes;
		for (let i_probe = 0; i_probe < a_probes.length; i_probe++) {
			// destruct probe pattern
			let k_pattern_frag = a_probes[i_probe].copy();
			// zero path length under probe
			if (!k_pattern_frag.length) {
				console.warn('empty path under probe');
				continue;
			}
			// play out pattern within probe
			let h_alive = this.proceed(k_pattern_frag, h_row__, h_head);
			// remove pointer to source row so that we only extend it once
			h_row__ = {};
			// object.keys
			a_living.length = 0;
			for (let i_alive in h_alive) {
				a_living.push(~~i_alive);
				// 
				if (h_survivors[i_alive]) {
					// probe rows to combine
					let a_probe_rows = h_alive[i_alive];
					//
					let a_combine = h_survivors[i_alive];
					for (let i_combine_row = a_combine.length - 1; i_combine_row >= 0; i_combine_row--) {
						// take combine row out from array
						let h_combine_row = a_combine[i_combine_row];
						a_combine.splice(i_combine_row, 1);
						// each probe row to combine
						for (let i_probe_row = 0; i_probe_row < a_probe_rows.length; i_probe_row++) {
							let h_probe_row = a_probe_rows[i_probe_row];
							// copy original combine row
							let h_copy_row = Object.create(h_combine_row);
							// set each property from probe onto copy row
							for (let i_property in h_probe_row) {
								h_copy_row[i_property] = h_probe_row[i_property];
							}
							// push copy back onto combine
							a_combine.push(h_copy_row);
						}
					}
				}
				// first survivor to claim this index
				else {
					h_survivors[i_alive] = h_alive[i_alive];
				}
			}
			// nothing lives!
			if (!a_living.length) {
				return h_alive;
			}
			// one survivor
			else if (1 === a_living.length) {
				// mutate head for next probe
				h_head = {
					id: a_living[0],
					type: h_head.type,
				};
			}
			// multiple survivors
			else {
				// is living sorted?
				// mutate head for next probe
				h_head = {
					ids: a_living,
					type: h_head.type,
				};
			}
		}
		// prep results list
		let h_results = {
			size: 0,
		};
		// exitted with living heads
		if (a_living.length) {
			// copy only living results
			let n_living = a_living.length;
			for (let i = 0; i < n_living; i++) {
				let i_survivor = a_living[i];
				h_results[i_survivor] = h_survivors[i_survivor];
			}
			// update size
			h_results.size = n_living;
		}
		//
		return h_results;
	}
	proceed(k_pattern, h_row__, h_head) {
		let k_graph = this.graph
		// fetch next triple pattern
		let {
			h_a,
			h_b,
			h_c,
			k_triples,
			b_inverse,
			h_edge,
			h_tail,
		} = this.next_triple_pattern(h_head, k_pattern);
		// ref markings
		let s_mark_a = h_a.mark;
		let s_mark_b = h_b.mark;
		let s_mark_c = h_c.mark;
		// save which heads were used and their associated rows
		let h_results = {};
		// end of pattern sequence?
		let b_terminate = !k_pattern.length;
		// mk iteration generators
		let f_a = this.generate_a_rows(h_a, k_triples.a);
		let f_b = this.generate_b_rows(h_b, k_triples);
		// bidirectional set intersection
		if (!h_a.range && !h_b.range && h_c.range && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
			let f_c = this.generate_c_ids(h_c, k_triples);
			// set m1
			let a_m1 = [];
			// iterate a
			for (let {
					id: i_a,
					row: h_row_a
				} of f_a(h_row__)) {
				let a_heads = h_results[i_a] = [];
				// iterate b
				for (let {
						id: i_b,
						row: h_row_b,
						offset: c_off_b
					} of f_b(i_a, h_row_a)) {
					// iterate c
					for (let i_c of f_c(i_a, c_off_b)) {
						// accumulate ids to m1
						a_m1.push(i_c);
					}
					// compute intersection between m1 and m2
					a_heads.push(...this.intersection(k_pattern, h_row_b, h_tail, a_m1));
				}
			}
		} else {
			let f_c = this.generate_c_rows(h_c, k_triples);
			// iterate a
			for (let {
					id: i_a,
					row: h_row_a
				} of f_a(h_row__)) {
				// iterate b
				for (let {
						id: i_b,
						row: h_row_b,
						offset: c_off_b
					} of f_b(i_a, h_row_a)) {
					// iterate c
					for (let {
							id: i_c,
							row: h_row_c
						} of f_c(i_a, c_off_b, h_row_b)) {
						// ref head(s)
						let i_head = b_inverse ? i_c : i_a;
						let a_heads = h_results[i_head];
						if (!a_heads) a_heads = h_results[i_head] = [];
						// tail has probes
						if (h_c.probes) {
							// simulate pattern head just for probe
							let h_sim_c = {
								id: i_c,
								probes: h_c.probes,
							};
							// probe all of c
							let h_survivors = this.probe(k_pattern, h_row_c, h_sim_c);
							if (h_survivors.size) {
								for (let i_tail in h_survivors) {
									let a_survivors = h_survivors[i_tail];
									for (let i_survivor = 0, n_survivors = a_survivors.length; i_survivor < n_survivors; i_survivor++) {
										let a_survivor = a_survivors[i_survivor];
										a_heads.push(a_survivor);
									}
								}
							}
						}
						// reached end of pattern; push the current row
						else if (b_terminate) {
							// save row
							a_heads.push(h_row_c);
						}
						// more pattern to match
						else {
							// simulate pattern head for next triple
							let h_sim_c = {
								id: i_c,
								type: HP_HOP,
							};
							// proceed on c
							let h_survivors = this.proceed(k_pattern.copy(), h_row_c, h_sim_c);
							for (let i_survivor in h_survivors) {
								// push all onto this super-head's list
								a_heads.push(...h_survivors[i_survivor]);
							}
						}
					}
				}
			}
		}
		// return which heads were used
		return h_results;
	}
}
class FailedSelection extends Selection {
	constructor(k_graph, h_failure) {
		super(k_graph, null);
		this.failure = h_failure;
		console.warn('failed to select thing: ' + h_failure);
	}
	failed() {
		return true;
	}
	from() {
		throw 'nope';
	}
}
class GraphPattern {
	constructor(a_pattern) {
		this.pattern = a_pattern || [];
	}
	get length() {
		return this.pattern.length;
	}
	copy() {
		return new GraphPattern(this.pattern.slice());
	}
	peek(i_peek = 0) {
		return this.pattern[i_peek];
	}
	shift() {
		return this.pattern.shift();
	}
	end() {
		return this.pattern[this.pattern.length - 1];
	}
	append_id(n_id, hp_type) {
		return this.pattern.push({
			id: n_id,
			type: hp_type,
		});
	}
	append_ids(a_ids, hp_type) {
		let a_pattern = this.pattern;
		return a_pattern.push({
			ids: a_ids,
			type: hp_type,
		});
	}
	append_range(hp_range, hp_type) {
		return this.pattern.push({
			range: hp_range,
			type: hp_type,
		});
	}
	append_all(hp_type) {
		return this.pattern.push({
			range: HP_RANGE_ALL,
			type: hp_type,
		});
	}
	fields() {
		let a_fields = [];
		let a_pattern = this.pattern;
		for (let i_pattern = 0, n_pattern = a_pattern.length; i_pattern < n_pattern; i_pattern++) {
			let h_step = a_pattern[i_pattern];
			if (h_step.mark) {
				a_fields.push(new MarkedField(h_step.mark));
			}
			if (h_step.save) {
				a_fields.push(new SavedField(h_step.save));
			}
		}
		return a_fields;
	}
}
class Field {
	constructor(s_name) {
		this.name = s_name;
	}
}
class MarkedField extends Field {
	constructor(s_name) {
		super(s_name);
		this.isMarked = true;
	}
}
class SavedField extends Field {
	constructor(s_name) {
		super(s_name);
		this.isData = true;
	}
}
class GraphPatternEntity {
	constructor(k_graph, k_pattern, h_failure = null) {
		this.graph = k_graph;
		this.pattern = k_pattern;
		this.failure = h_failure;
	}
	mark(s_name) {
		if ('data' === s_name) throw `cannot use the reserved name 'data' to mark a term`;
		let k_pattern = this.pattern;
		// empty
		if (!k_pattern.length) return this;
		// save marking
		k_pattern.end().mark = s_name;
		// chain
		return this;
	}
	filter(f_filter) {
		let k_pattern = this.pattern;
		// empty
		if (!k_pattern.length) return this;
		// save marking
		k_pattern.end().filter = f_filter;
		// chain
		return this;
	}
	data(s_register_id, f_action) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// data plugin registerd
		let k_plugin = k_graph.registry[s_register_id];
		if (k_plugin) {
			// save action
			k_pattern.end().data = {
				plugin: k_plugin,
				action: f_action,
			};
		}
		// no such data plugin registered
		else {
			throw `no data plugin is registered under the alias "${s_register_id}"`;
		}
		// chain
		return this;
	}
	exit() {
		// exit only allowed on a node / literal
		if (this instanceof Edge || this instanceof InverseEdge) {
			throw 'error: not allowed to exit pattern builder on an edge. pattern must terminate on a node or literal';
		}
		// one of the targets does not exist in the graph
		if (this.failure) {
			return new FailedSelection(this.graph, this.failure);
		}
		// enable query to take place
		return new Selection(this.graph, this.pattern);
	}
	cross(s_arg) {
		throw 'cannot `.cross("${s_arg}")` on an ${this.constructor.name}';
	}
	invert(s_arg) {
		throw 'cannot `.invert("${s_arg}")` on an ${this.constructor.name}';
	}
	source(s_arg) {
		throw 'cannot `.source("${s_arg}")` on an ${this.constructor.name}';
	}
	sources(s_arg) {
		throw 'cannot `.sources("${s_arg}")` on an ${this.constructor.name}';
	}
	sink(s_arg) {
		throw 'cannot `.sink("${s_arg}")` on an ${this.constructor.name}';
	}
	sinks(s_arg) {
		throw 'cannot `.sinks("${s_arg}")` on an ${this.constructor.name}';
	}
	literal(s_arg) {
		throw 'cannot `.literal("${s_arg}")` on an ${this.constructor.name}';
	}
	literals(s_arg) {
		throw 'cannot `.literals("${s_arg}")` on an ${this.constructor.name}';
	}
	node(s_arg) {
		throw 'cannot `.node("${s_arg}")` on an ${this.constructor.name}';
	}
	nodes(s_arg) {
		throw 'cannot `.nodes("${s_arg}")` on an ${this.constructor.name}';
	}
	span(s_arg) {
		throw 'cannot `.span("${s_arg}")` on an ${this.constructor.name}';
	}
	spanInverse(s_arg) {
		throw 'cannot `.spanInverse("${s_arg}")` on an ${this.constructor.name}';
	}
	all(s_arg) {
		throw 'cannot `.all("${s_arg}")` on an ${this.constructor.name}';
	}
	probe(s_arg) {
		throw 'cannot `.probe("${s_arg}")` on an ${this.constructor.name}';
	}
	hops(s_arg) {
		throw 'cannot `.hops("${s_arg}")` on an ${this.constructor.name}';
	}
}
//
class Entrance {
	constructor(k_graph) {
		Object.assign(this, {
			graph: k_graph,
			pattern: new GraphPattern(), // create root pattern
		});
	}
	source(s_n3) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// turn string into word
		let ab_word = k_graph.encode_n3_to_word(s_n3);
		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if (i_item_d) {
			k_pattern.append_id(i_item_d, HP_SUBJECT);
			return new Source(k_graph, k_pattern);
		}
		// search subjects dict
		let i_item_s = k_graph.section_s.find(ab_word);
		if (i_item_s) {
			k_pattern.append_id(i_item_s, HP_SUBJECT);
			return new Source(k_graph, k_pattern);
		}
		// no such source in set
		return new EmptySource(k_graph, null, {
			n3: s_n3
		});
	}
	sources(a_n3s) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// there is a list
		if (a_n3s) {
			// prep list of sources to capture
			let a_sources = [];
			// each n3 node
			for (let i_n3 = 0, n_n3s = a_n3s.length; i_n3 < n_n3s; i_n3++) {
				let s_n3 = a_n3s[i_n3];
				// turn string into word
				let ab_word = k_graph.encode_n3_to_word(s_n3);
				// searchs duals dict
				let i_item_d = k_graph.section_d.find(ab_word);
				if (i_item_d) {
					a_sources.push(i_item_d)
				} else {
					// search subjects dict
					let i_item_s = k_graph.section_s.find(ab_word);
					if (i_item_s) {
						a_sources.push(i_item_s);
					}
				}
			}
			// push id list to pattern's pattern
			k_pattern.append_ids(a_sources, HP_SUBJECT);
		}
		// no list!
		else {
			// add all to path
			k_pattern.append_all(HP_SUBJECT);
		}
		// source(s)
		return new Source(this.graph, k_pattern);
	}
	sink(s_n3) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// turn string into word
		let ab_word = k_graph.encode_n3_to_word(s_n3);
		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if (i_item_d) {
			k_pattern.append_id(i_item_d, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
		// search objects dict
		let i_item_o = k_graph.section_o.find(ab_word);
		if (i_item_o) {
			k_pattern.append_id(i_item_o, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
		// no such sink in set
		return new EmptySink(k_graph, null, {
			n3: s_n3
		});
	}
	sinks(a_n3s) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// there is a list
		if (a_n3s) {
			// prep list of ids to capture
			let a_ids = [];
			// each n3 node
			for (let i_n3 = 0, n_n3s = a_n3s.length; i_n3 < n_n3s; i_n3++) {
				let s_n3 = a_n3s[i_n3];
				// turn string into word
				let ab_word = k_graph.encode_n3_to_word(s_n3);
				// searchs duals dict
				let i_item_d = k_graph.section_d.find(ab_word);
				if (i_item_d) {
					a_ids.push(i_item_d);
				} else {
					// search objects dict
					let i_item_s = k_graph.section_o.find(ab_word);
					if (i_item_s) {
						a_ids.push(i_item_s);
					}
				}
			}
			// push id list to pattern's pattern
			k_pattern.append_ids(a_ids, HP_OBJECT);
		}
		// no list!
		else {
			// add all to path
			k_pattern.append_all(HP_OBJECT);
		}
		// chaining, return a bag of objects
		return new Sink(k_graph, k_pattern);
	}
	literal(s_content, z_datatype_or_lang) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// prep to find word in dict
		let ab_open = Buffer.allocUnsafe(1);
		let nl_open = 1;
		if ('string' === typeof z_datatype_or_lang) {
			let s_datatype_or_lang_0 = z_datatype_or_lang[0];
			if ('@' === s_datatype_or_lang_0) {
				let ab_lang = encode_utf_8(z_datatype_or_lang.toLowerCase());
				nl_open = ab_lang.length + 1;
				ab_open = Buffer.allocUnsafe(nl_open);
				ab_lang.copy(ab_open);
				ab_open[nl_open - 1] = 0x22; // encode_utf_8('"')[0]
			} else if ('^' === s_datatype_or_lang_0) {
				let ab_datatype = k_graph.encode_n3_to_word(z_datatype_or_lang.slice(1));
				nl_open = ab_datatype.length + 2;
				ab_open = Buffer.allocUnsafe(nl_open);
				ab_open[0] = 0x5e; // encode_utf_8('^')[0]
				ab_datatype.copy(ab_open, 1);
				ab_open[nl_open - 1] = 0x22; // encode_utf_8('"')[0]
			} else {
				throw `the 'datatype_or_lang' argument to '.literal(..)' must start with either a '^' for datatype, or a '@' for language`;
			}
		} else if ('object' === typeof z_datatype_or_lang) {
			throw 'literal from datatype';
		} else {
			ab_open[0] = 0x22; // encode_utf_8('"')[0]
		}
		// encode content
		let ab_content = encode_utf_auto(s_content);
		// join parts into word
		let ab_word = join_buffers(ab_open, ab_content);
		// searchs literals dict
		let c_item_l = k_graph.section_l.find(ab_word);

		// found item
		if (c_item_l) {
			k_pattern.append_id(c_item_l, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
		// no such literal in set
		return new EmptySink(k_graph, null, {
			literal: {
				content: s_content,
				datatype_or_lang: z_datatype_or_lang,
			},
		});
	}
	literals(a_n3s) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// there is a list
		if (a_n3s) {
			throw 'multiple literals not yet supported';
		}
		// no list!
		else {
			k_pattern.append_range(HP_RANGE_LITERALS, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
	}
}
class Source extends GraphPatternEntity {
	cross(z_edge) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// ref prefix lookup
		let h_prefixes = k_graph.prefixes;
		// ref predicates dict
		let a_dict_p = k_graph.dict_p;
		// user wants to cross a single edge
		if ('string' === typeof z_edge) {
			let s_n3 = z_edge;
			// turn string into word
			let ab_word = k_graph.encode_n3_to_word(s_n3);
			// search for word in predicates dict
			let i_item_p = k_graph.section_p.find(ab_word);
			if (i_item_p) {
				// append id to path
				k_pattern.append_id(i_item_p, HP_PREDICATE);
				return new Edge(k_graph, k_pattern);
			}
			// no such predicate in set
			return new EmptyEdge(k_graph, null, {
				n3: s_n3
			});
		}
		throw 'non-string';
	}
	invert(z_edge) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// ref prefix lookup
		let h_prefixes = k_graph.prefixes;
		// ref predicates dict
		let a_dict_p = k_graph.dict_p;
		// user wants to cross a single edge
		if ('string' === typeof z_edge) {
			let s_n3 = z_edge;
			// turn string into word
			let ab_word = k_graph.encode_n3_to_word(s_n3);
			// search for word in predicates dict
			let i_item_p = k_graph.section_p.find(ab_word);
			if (i_item_p) {
				// append id to path
				k_pattern.append_id(i_item_p, HP_INVERSE_PREDICATE);
				return new InverseEdge(k_graph, k_pattern);
			}
			// no such predicate in set
			return new EmptyInverseEdge(k_graph, null, {
				n3: s_n3,
			});
		}
		throw 'non-string';
	}
	probe(z_probes, b_optimize_probe_first) {
		let k_pattern = this.pattern;
		let h_source = k_pattern.end();
		// optimize query by first matching presence of all probe edges
		if (b_optimize_probe_first) {
			h_source.probe_first = 1;
		}
		// create probes array
		let a_probes = h_source.probes = [];
		// ref graph
		let k_graph = this.graph;
		// probe is array
		if (Array.isArray(z_probes)) {
			throw 'probe array';
		}
		// probe is hash
		else {
			// each probe
			for (let s_probe_edge in z_probes) {
				let f_probe = z_probes[s_probe_edge];
				// find predicate in dict
				let i_p = k_graph.find_p(s_probe_edge);
				// no such predicate, no need to call probe; all done here!
				if (!i_p) return new Void(k_graph, this.pattern);
				// create new probe path starting with edge
				let k_pattern_frag = new GraphPattern();
				k_pattern_frag.append_id(i_p, HP_PREDICATE);
				// fire probe callback
				f_probe(new Edge(k_graph, k_pattern_frag));
				// save probe descriptor
				a_probes.push(k_pattern_frag);
			}
		}
		// chain
		return this;
	}
	span() {
		let k_pattern = this.pattern;
		k_pattern.append_all(HP_PREDICATE);
		return new Edge(this.graph, k_pattern);
	}
}
class EmptySource extends Source {
	cross() {
		return new EmptyEdge();
	}
	invert() {
		return new EmptyInverseEdge();
	}
	probe() {
		return this;
	}
	span() {
		return new EmptyEdge();
	}
}
class Edge extends GraphPatternEntity {
	hop(s_n3) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// turn string into word
		let ab_word = k_graph.encode_n3_to_word(s_n3);
		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if (i_item_d) {
			k_pattern.append_id(i_item_d, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
		// no such hop in set
		return new EmptySink(k_graph, null, {
			n3: s_n3
		});
	}
	hops() {
		let k_pattern = this.pattern;
		k_pattern.append_range(HP_RANGE_HOPS, HP_OBJECT);
		return new Source(this.graph, k_pattern);
	}
	sink(s_n3) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// turn string into word
		let ab_word = k_graph.encode_n3_to_word(s_n3);
		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if (i_item_d) {
			k_pattern.append_id(i_item_d, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
		// search objects dict
		let i_item_o = k_graph.section_o.find(ab_word);
		if (i_item_o) {
			k_pattern.append_id(i_item_o, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
		// no such sink in set
		return new EmptySink(k_graph, null, {
			n3: s_n3
		});
	}
	sinks(a_n3s) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// there is a list
		if (a_n3s) {
			// prep list of ids to capture
			let a_ids = [];
			// each n3 node
			for (let i_n3 = 0, n_n3s = a_n3s.length; i_n3 < n_n3s; i_n3++) {
				let s_n3 = a_n3s[i_n3];
				// turn string into word
				let ab_word = k_graph.encode_n3_to_word(s_n3);
				// searchs duals dict
				let i_item_d = k_graph.section_d.find(ab_word);
				if (i_item_d) {
					a_ids.push(i_item_d);
				} else {
					// search objects dict
					let i_item_s = k_graph.section_o.find(ab_word);
					if (i_item_s) {
						a_ids.push(i_item_s);
					}
				}
			}
			// push id list to pattern's pattern
			k_pattern.append_ids(a_ids, HP_OBJECT);
		}
		// no list!
		else {
			// add all to path
			k_pattern.append_all(HP_OBJECT);
		}
		// chaining, return a bag of objects
		return new Sink(k_graph, k_pattern);
	}
	literal(s_content, z_datatype_or_lang) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// prep to find word in dict
		let ab_open = Buffer.allocUnsafe(1);
		let nl_open = 1;
		if ('string' === typeof z_datatype_or_lang) {
			let s_datatype_or_lang_0 = z_datatype_or_lang[0];
			if ('@' === s_datatype_or_lang_0) {
				let ab_lang = encode_utf_8(z_datatype_or_lang.toLowerCase());
				nl_open = ab_lang.length + 1;
				ab_open = Buffer.allocUnsafe(nl_open);
				ab_lang.copy(ab_open);
				ab_open[nl_open - 1] = 0x22; // encode_utf_8('"')[0]
			} else if ('^' === s_datatype_or_lang_0) {
				let ab_datatype = k_graph.encode_n3_to_word(z_datatype_or_lang.slice(1));
				nl_open = ab_datatype.length + 2;
				ab_open = Buffer.allocUnsafe(nl_open);
				ab_open[0] = 0x5e; // encode_utf_8('^')[0]
				ab_datatype.copy(ab_open, 1);
				ab_open[nl_open - 1] = 0x22; // encode_utf_8('"')[0]
			} else {
				throw `the 'datatype_or_lang' argument to '.literal(..)' must start with either a '^' for datatype, or a '@' for language`;
			}
		} else if ('object' === typeof z_datatype_or_lang) {
			throw 'literal from datatype';
		} else {
			ab_open[0] = 0x22; // encode_utf_8('"')[0]
		}
		// encode content
		let ab_content = encode_utf_auto(s_content);
		// join parts into word
		let ab_word = join_buffers(ab_open, ab_content);
		// searchs literals dict
		let c_item_l = k_graph.section_l.find(ab_word);

		// found item
		if (c_item_l) {
			k_pattern.append_id(c_item_l, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
		// no such literal in set
		return new EmptySink(k_graph, null, {
			literal: {
				content: s_content,
				datatype_or_lang: z_datatype_or_lang,
			},
		});
	}
	literals(a_n3s) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// there is a list
		if (a_n3s) {
			throw 'multiple literals not yet supported';
		}
		// no list!
		else {
			k_pattern.append_range(HP_RANGE_LITERALS, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
	}
	all() {
		let k_pattern = this.pattern;
		k_pattern.append_all(HP_OBJECT);
		return new Sink(this.graph, this.pattern);
	}
}
class EmptyEdge {
	hop() {
		return new EmptySource();
	}
	hops() {
		return new EmptySource();
	}
	sink() {
		return new EmptySink();
	}
	sinks() {
		return new EmptySink();
	}
	literal() {
		return new EmptyLiteral();
	}
	literal() {
		return new EmptyLiteral();
	}
	all() {
		return new EmptySink();
	}
}
class InverseEdge extends GraphPatternEntity {
	source(s_n3) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// turn string into word
		let ab_word = k_graph.encode_n3_to_word(s_n3);
		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if (i_item_d) {
			k_pattern.append_id(i_item_d, HP_SUBJECT);
			return new Source(k_graph, k_pattern);
		}
		// search subjects dict
		let i_item_s = k_graph.section_s.find(ab_word);
		if (i_item_s) {
			k_pattern.append_id(i_item_s, HP_SUBJECT);
			return new Source(k_graph, k_pattern);
		}
		// no such source in set
		return new EmptySource(k_graph, null, {
			n3: s_n3
		});
	}
	sources(a_n3s) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// there is a list
		if (a_n3s) {
			// prep list of sources to capture
			let a_sources = [];
			// each n3 node
			for (let i_n3 = 0, n_n3s = a_n3s.length; i_n3 < n_n3s; i_n3++) {
				let s_n3 = a_n3s[i_n3];
				// turn string into word
				let ab_word = k_graph.encode_n3_to_word(s_n3);
				// searchs duals dict
				let i_item_d = k_graph.section_d.find(ab_word);
				if (i_item_d) {
					a_sources.push(i_item_d)
				} else {
					// search subjects dict
					let i_item_s = k_graph.section_s.find(ab_word);
					if (i_item_s) {
						a_sources.push(i_item_s);
					}
				}
			}
			// push id list to pattern's pattern
			k_pattern.append_ids(a_sources, HP_SUBJECT);
		}
		// no list!
		else {
			// add all to path
			k_pattern.append_all(HP_SUBJECT);
		}
		// source(s)
		return new Source(this.graph, k_pattern);
	}
	hop(s_n3) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// turn string into word
		let ab_word = k_graph.encode_n3_to_word(s_n3);
		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if (i_item_d) {
			k_pattern.append_id(i_item_d, HP_OBJECT);
			return new Source(k_graph, k_pattern);
		}
		// no such hop in set
		return new EmptySource(k_graph, null, {
			n3: s_n3
		});
	}
	hops() {
		let k_pattern = this.pattern;
		k_pattern.append_range(HP_RANGE_HOPS, HP_SUBJECT);
		return new Source(this.graph, k_pattern);
	}
}
class EmptyInverseEdge extends InverseEdge {
	source() {
		return new EmptySource();
	}
	sources() {
		return new EmptySource();
	}
	hop() {
		return new EmptySource();
	}
	hops() {
		return new EmptySource();
	}
}
class Sink extends GraphPatternEntity {
	invert(z_edge) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;
		// ref prefix lookup
		let h_prefixes = k_graph.prefixes;
		// ref predicates dict
		let a_dict_p = k_graph.dict_p;
		// user wants to cross a single edge
		if ('string' === typeof z_edge) {
			let s_n3 = z_edge;
			// turn string into word
			let ab_word = k_graph.encode_n3_to_word(s_n3);
			// search for word in predicates dict
			let i_item_p = k_graph.section_p.find(ab_word);
			if (i_item_p) {
				// append id to path
				k_pattern.append_id(i_item_p, HP_INVERSE_PREDICATE);
				return new InverseEdge(k_graph, k_pattern);
			}
			// predicate does not exist
			return new EmptyInverseEdge(k_graph, null);
		}
		throw 'non-string';
	}
}
class EmptySink extends Sink {
	invert() {
		return new EmptyInverseEdge();
	}
}
class GraphPath {}
class EmptyPath {
	constructor(k_graph, k_pattern) {
		this.graph = k_graph;
		this.pattern = k_pattern;
	}
	from(h_from) {
		let k_graph = this.graph;
		if (h_from.node) {
			let h_node = k_graph.find_n(h_from.node);
			// prep vector list
			h_node.vectors = [];
			// carry on
			let a_roots = [h_node];
			return new PartialPath(k_graph, a_roots, a_roots);
		} else if (h_from.source) {
			// make query selection
			let k_selection = h_from.source((new Entrance(k_graph)).sources()).exit();
			// extract distinct head ids
			let h_heads = k_selection.distinct_heads();
			// 
			let a_roots = [];
			for (let s_head_uid in h_heads) {
				let h_node = h_heads[s_head_uid];
				h_node.vectors = [];
				a_roots.push(h_node);
			}
			return new PartialPath(k_graph, a_roots, a_roots);
		}
		throw 'nope';
	}
}
const F_SORT_N = (h_a, h_b) => {
	let x_a = h_a.n,
		x_b = h_b.n;
	return x_a < x_b ? -1 : (x_a > x_b ? 1 : 0);
};
class PartialPath {
	constructor(k_graph, a_roots, a_from) {
		this.graph = k_graph;
		this.roots = a_roots;
		this.from = a_from;
	}
	find(h_src, h_dests, n_min = 0, n_max = Infinity, h_visited = {}, n_depth = 1) {
		let k_graph = this.graph;
		let n_range_d = k_graph.range_d;
		let hp_type = h_src.type;
		let i_src = h_src.id;
		let a_vectors = h_src.vectors;
		let a_scan = [];
		// debugger;
		// explore 'right' side in normal direction relations
		if (i_src < k_graph.range_d || k_graph.TYPE_SUBJECT === hp_type) {
			// each predicate-object pair associated with this node as a subject
			for (let {
					b: i_p,
					c: i_o
				} of k_graph.s_po(i_src)) {
				let s_o = i_o < n_range_d ? 'd' + i_o : 'o' + i_o;
				// haven't visited node before this call yet
				if (!(h_visited[s_o] < n_depth)) {
					// mark as visited
					h_visited[s_o] = n_depth;
					//
					let a_segment_vectors = [];
					// make segment
					let h_segment = {
						e: i_p,
						n: i_o,
						i: 0,
						c: 0,
						v: a_segment_vectors,
					};
					// found intersect
					if (h_dests[s_o] && n_depth > n_min) {
						// this is a checkpoint vertex
						h_segment.c = 1;
						// count number of intersects
						h_dests[s_o] += 1;
						// push segment
						a_vectors.push(h_segment);
					}
					// no intersect
					else {
						// queue in order to explore breadth-first
						a_scan.push({
							id: i_o,
							type: k_graph.TYPE_OBJECT,
							vectors: a_segment_vectors,
							segment: h_segment,
						});
					}
				}
			}
		}
		// explore 'left' side in invere direction relations
		if (i_src < k_graph.range_d || k_graph.TYPE_OBJECT === hp_type) {
			// each predicate-object pair associated with this node as a subject
			for (let {
					b: i_s,
					c: i_p
				} of k_graph.o_sp(i_src)) {
				let s_s = i_s < n_range_d ? 'd' + i_s : 's' + i_s;
				// haven't visited node before this call yet
				if (!(h_visited[s_s] < n_depth)) {
					// mark as visited
					h_visited[s_s] = n_depth;
					//
					let a_segment_vectors = [];
					// make segment
					let h_segment = {
						e: i_p,
						n: i_s,
						i: 1, // inverse
						c: 0,
						v: a_segment_vectors,
					};
					// found intersect
					if (h_dests[s_s] && n_depth > n_min) {
						// this is a checkpoint vertex
						h_segment.c = 1;
						// count number of intersects
						h_dests[s_s] += 1;
						// push segment
						a_vectors.push(h_segment);
					}
					// no intersect
					else {
						// queue in order to explore breadth-first
						a_scan.push({
							id: i_s,
							type: k_graph.TYPE_SUBJECT,
							vectors: a_segment_vectors,
							segment: h_segment,
						});
					}
				}
			}
		}
		// explore breadth-first
		if (n_depth < n_max) {
			for (let i_scan = 0, n_scans = a_scan.length; i_scan < n_scans; i_scan++) {
				let h_scan = a_scan[i_scan];
				this.find(h_scan, h_dests, n_min, n_max, h_visited, n_depth + 1);
				if (h_scan.vectors.length) {
					a_vectors.push(h_scan.segment);
				}
			}
		}
	}
	thru(h_thru) {
		// let k_graph = this.graph;
		// let a_from = this.from;
		// // to node
		// if(h_to.source) {
		// 	let z_source = h_to.source;
		// 	// user provided query selection
		// 	if('function' === typeof z_source) {
		// 		// make query selection
		// 		let k_selection = z_source((new Entrance(k_graph)).sources()).exit();
		// 		// extract distinct head ids
		// 		let h_heads = k_selection.distinct_heads(1);
		// 		//
		// 		let a_dests = [];
		// 		//
		// 		for(let i_from=0, n_from=a_from.length; i_from<n_from; i_from++) {
		// 			let h_src = a_from[i_from];
		// 			// prep vectors list
		// 			let a_vectors = [];
		// 			//
		// 			this.find(h_src, h_heads, h_to.min, h_to.max);
		// 			// select which targets found paths
		// 			for(let s_id in h_heads) {
		// 				// at least one path found to dest (incremented starting value of 1)
		// 				if(h_heads[s_id] > 1) {
		// 					let h_head = h_heads[s_id];
		// 					debugger;
		// 					let h_dest = {
		// 						id: +s_id.substr(1),
		// 						type: k_graph.TYPE_SUBJECT,
		// 						vectors: [],
		// 					};
		// 					// commit dest to src
		// 					a_vectors.push(h_dest);
		// 					// add dest to next partial path
		// 					a_dests.push(h_dest);
		// 				}
		// 			}
		// 		}
		// 		//
		// 		debugger;
		// 		return new Maze(k_graph, a_roots_cleaned);
		// 	}
		// }
		throw 'nope';
	}
	to(h_to) {
		let k_graph = this.graph;
		let a_from = this.from;
		// to node
		if (h_to.source) {
			let z_source = h_to.source;
			// user provided query selection
			if ('function' === typeof z_source) {
				// make query selection
				let k_selection = z_source((new Entrance(k_graph)).sources()).exit();
				// extract distinct head ids
				let h_heads = k_selection.distinct_heads(1);
				//
				for (let i_from = 0, n_from = a_from.length; i_from < n_from; i_from++) {
					let h_src = a_from[i_from];
					// create vectors where each
					this.find(h_src, h_heads, h_to.min, h_to.max);
				}
				// 
				return new Maze(k_graph, this.roots);
			}
		}
		throw 'nope';
	}
	exit() {
		return new TrailHead(this.graph, this.roots);
	}
}
class CompletePath {
	constructor(k_graph, a_roots, a_dests) {
		this.graph = k_graph;
		this.roots = a_roots;
		this.dests = a_dests;
	}
	triples(fk_each) {
		let k_graph = this.graph;
		let a_srcs = this.srcs;
		for (let i_src = 0, n_srcs = a_srcs.length; i_src < n_srcs; i_src++) {
			let h_src = a_srcs[i_src];
			let i_head = h_src.id;
			let s_head = 's',
				s_tail = 'o';
			let b_inverse = false;
			if ((i_head < k_graph.range_d) || (k_graph.TYPE_SUBJECT === h_src.type)) {
				s_head = 'o';
				s_tail = 's';
				b_inverse = true;
			}
			let h_a = k_graph[s_head](i_head);
			let a_vs = h_src.segment.v;
			for (let i_v = 0, n_vs = a_vs.length; i_v < n_vs; i_v++) {
				let h_segment = a_vs[i_v];
				let h_c = k_graph[s_tail](h_segment.n);
				fk_each(b_inverse ? h_c : h_a, k_graph.p(h_segment.e), b_inverse ? h_a : h_c, new PathExplorer());
			}
		}
	}
}
class Maze {
	constructor(k_graph, a_roots) {
		this.graph = k_graph;
		this.roots = a_roots;
	}
	explore(fk_root) {
		let k_graph = this.graph;
		let a_roots = this.roots;
		for (let i_root = 0, n_roots = a_roots.length; i_root < n_roots; i_root++) {
			let h_root = a_roots[i_root];
			if (h_root.vectors.length) {
				let h_root_vertex = k_graph.v(h_root.id, h_root.type);
				fk_root(h_root_vertex, new PathExplorer(k_graph, h_root.vectors));
			}
		}
	}
	each(fk_each) {
		let k_graph = this.graph;
		let a_srcs = this.srcs;
		for (let i_src = 0, n_srcs = a_srcs.length; i_src < n_srcs; i_src++) {
			let h_src = a_srcs[i_src];
			let i_head = h_src.id;
			let s_head = 's',
				s_tail = 'o';
			let b_inverse = h_ve;
			if ((i_head < k_graph.range_d) || (k_graph.TYPE_SUBJECT === h_src.type)) {
				s_head = 'o';
				s_tail = 's';
				b_inverse = true;
			}
			let h_a = k_graph[s_head](i_head);
			let a_vs = h_src.segment.v;
			for (let i_v = 0, n_vs = a_vs.length; i_v < n_vs; i_v++) {
				let h_segment = a_vs[i_v];
				fk_each(h_a, k_graph.p(h_segment.e), k_graph[s_tail](h_segment.n), b_inverse, new PathExplorer());
			}
		}
	}
}
class PathExplorer {
	constructor(k_graph, a_vectors) {
		this.graph = k_graph;
		this.vectors = a_vectors;
	}
	each(fk_each) {
		let k_graph = this.graph;
		let a_vectors = this.vectors;
		for (let i_vector = 0, n_vectors = a_vectors.length; i_vector < n_vectors; i_vector++) {
			let h_vector = a_vectors[i_vector];
			let s_head = 's',
				s_tail = 'o';
			let x_mask = h_vector.i;
			if (x_mask) {
				s_head = 'o';
				s_tail = 's';
			}
			x_mask |= (h_vector.c << 1);
			fk_each(
				k_graph.p(h_vector.e),
				k_graph[s_tail](h_vector.n),
				x_mask,
				new PathExplorer(k_graph, h_vector.v)
			);
		}
	}
}
const intersect = (a_a, a_b, a_c) => {
	let a_diff_a = [];
	let i_b = -1,
		i_c = -1;
	let n_b = a_b.length,
		n_c = a_c.length;
	for (let i_a = 0, n_a = a_a.length; i < n_a; i_a++) {
		let x_a = a_a[i_a].n;
		while (h_a > a_b[++i_b].n) {}
		while (x_a === a_b[i_b].n) {
			a_b[i_b];
			i_b += 1;
		}
		while (x_a > a_c[++i_c]) {}
	}
}
module.exports = {
	entrance(k_graph) {
		return new Entrance(k_graph);
	},
	from(k_graph, w_from) {
		return (new EmptyPath(k_graph)).from(w_from);
	}
};