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
const $_DATA = Symbol('data');
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
class Row {
	// constructor() {
	// 	this[$_DATA] = {};
	// }
	// data(s_name) {
	// 	if(undefined === s_name) return this[$_DATA];
	// 	return this[$_DATA][s_name];
	// }
}
class Selection {
	constructor(k_graph, k_pattern) {
		this.graph = k_graph;
		this.pattern = k_pattern;
	}
	rows() {
			//x
			let h_results = this.consume(this.pattern);
			let a_rows = [];
			for (let i_head in h_results) {
				let a_survivors = h_results[i_head];
				for (let i_survivor = 0, n_survivors = a_survivors.length; i_survivor < n_survivors; i_survivor++) {
					let h_survivor = a_survivors[i_survivor];
					a_rows.push(h_survivor);
				}
			}
			return a_rows;
		}
		* results() {
			let k_pattern = this.pattern;
			let h_row__ = {};
			// head of triple pattern
			let h_head = k_pattern.shift();
			let k_graph = this.graph;
			let b_inverse = false;
			let x_triple_pattern = 0;
			let h_s;
			let h_o;
			// predicate(s) of triple pattern
			let h_p = k_pattern.shift();
			// Vp
			if (h_p.range) x_triple_pattern |= 2;
			// tail of triple pattern
			let h_tail = k_pattern.shift();
			// end of pattern sequence
			let b_terminate = !k_pattern.length;
			// body is normal direction
			if (HP_PREDICATE === h_p.type) {
				// Vs
				if (h_head.range) x_triple_pattern |= 4;
				// claim subjects
				h_s = h_head;
				// Vo
				if (h_tail.range) x_triple_pattern |= 1;
				// claim objects
				h_o = h_tail;
			}
			// body is inverse direction
			else {
				b_inverse = true;
				// Vs
				if (h_head.range) x_triple_pattern |= 1;
				// claim objects
				h_o = h_head;
				// Vs
				if (h_tail.range) x_triple_pattern |= 4;
				// claim subjects
				h_s = h_tail;
			}
			//
			let hp_data_use = A_DATA_MAP[x_triple_pattern];
			// ref markings
			let s_mark_s = h_s.mark;
			let s_mark_p = h_p.mark;
			let s_mark_o = h_o.mark;
			// save which heads were used and their associated rows
			let h_results = {};
			// SPO
			if (HP_USE_SPO === hp_data_use) {
				if (!k_graph.data_sp) {
					throw 'Query requires the POS triples index to be built.';
				}
				// mk iteration generators
				let f_s = this.iterate_a(h_s, 's');
				let {
					gen: f_p,
					data: h_data_b,
				} = this.iterate_b(h_p, 'p', 'sp');
				let f_o = this.iterate_c(h_o, 'o', 's_po');
				let s_save_b = h_data_b && h_data_b.save;
				let k_data_instance_b;
				if (s_save_b) k_data_instance_b = h_p.data.plugin.instance;
				let b_extend_b = s_mark_p || s_save_b;
				// bidirectional set intersection
				if (!h_s.range && !h_p.range && h_o.range && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
					// set m1
					let a_m1 = [];
					// iterate a
					for (let {
							id: i_s,
							row: h_row_a
						} of f_s(h_row__)) {
						let a_heads = h_results[i_s] = [];
						// iterate b
						for (let [i_p, c_offset_data_sp] of f_p(i_s)) {
							let h_row_b = h_row_a;
							// b is marked
							if (s_mark_p) {
								// extend row a
								h_row_b = Object.create(h_row_a);
								// save marked
								h_row_b[s_mark_p] = k_graph.p(i_p);
							}
							// b is saved
							if (s_save_b) {
								h_row_b[s_save_b] = k_data_instance_b.load(i_p);
							}
							// iterate c
							for (let {
									id: i_o,
									row: h_row_c
								} of f_o(i_s, c_offset_data_sp, h_row_b)) {
								// accumulate ids to m1
								a_m1.push(i_o);
							}
							// compute intersection between m1 and m2
							a_heads.push(...this.intersection(k_pattern, h_row_b, h_tail, a_m1));
						}
					}
				} else {
					// iterate a
					for (let {
							id: i_s,
							row: h_row_a
						} of f_s(h_row__)) {
						// iterate b
						for (let [i_p, c_offset_data_sp] of f_p(i_s)) {
							let h_row_b = h_row_a;
							// b is marked
							if (s_mark_p) {
								// extend row a
								h_row_b = Object.create(h_row_a);
								// save marked
								h_row_b[s_mark_p] = k_graph.p(i_p);
							}
							// b is saved
							if (s_save_b) {
								h_row_b[s_save_b] = k_data_instance_b.load(i_p);
							}
							// iterate c
							for (let {
									id: i_o,
									row: h_row_c
								} of f_o(i_s, c_offset_data_sp, h_row_b)) {
								// ref head(s)
								let i_head = b_inverse ? i_o : i_s;
								let a_heads = h_results[i_head];
								if (!a_heads) a_heads = h_results[i_head] = [];
								// tail has probes
								if (h_o.probes) {
									// simulate pattern head just for probe
									let h_sim_c = {
										id: i_o,
										probes: h_o.probes,
									};
									// probe all of c
									let h_survivors = this.probe(k_pattern, h_row_c, h_sim_c);
									if (h_survivors.size) {
										for (let i_tail in h_survivors) {
											let a_survivors = h_survivors[i_tail];
											for (let i_survivor = 0, n_survivors = a_survivors.length; i_survivor < n_survivors; i_survivor++) {
												let a_survivor = a_survivors[i_survivor];
												yield a_survivor;
											}
										}
									}
								}
								// reached end of pattern; push the current row
								else if (b_terminate) {
									yield h_row_C;
								}
								// more pattern to match
								else {
									// simulate pattern head for next triple
									let h_sim_c = {
										id: i_o,
										type: HP_HOP,
									};
									// proceed on c
									let h_survivors = this.proceed(k_pattern.copy(), h_row_c, h_sim_c);
									for (let i_survivor in h_survivors) {
										yield* h_survivors[i_survivor];
									}
								}
							}
						}
					}
				}
			}
			// POS
			else if (HP_USE_POS === hp_data_use) {
				if (!k_graph.data_po) {
					throw 'Query requires the POS triples index to be built.';
				}
				// mk iteration generators
				let f_p = this.iterate_a(h_p, 'p');
				let {
					gen: f_o,
					data: h_data_b,
				} = this.iterate_b(h_o, 'o', 'po');
				let f_s = this.iterate_c(h_s, 's', 'p_os');
				let s_save_b = h_data_b && h_data_b.save;
				let k_data_instance_b;
				if (s_save_b) k_data_instance_b = h_o.data.plugin.instance;
				let b_extend_b = s_mark_o || s_save_b;
				// bidirectional set intersection
				if (!h_p.range && !h_o.range && h_s.range && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
					// set m1
					let a_m1 = [];
					// iterate a
					for (let {
							id: i_p,
							row: h_row_a
						} of f_p(h_row__)) {
						let a_heads = h_results[i_p] = [];
						// iterate b
						for (let [i_o, c_offset_data_po] of f_o(i_p)) {
							let h_row_b = h_row_a;
							// b is marked
							if (s_mark_o) {
								// extend row a
								h_row_b = Object.create(h_row_a);
								// save marked
								h_row_b[s_mark_o] = k_graph.o(i_o);
							}
							// b is saved
							if (s_save_b) {
								h_row_b[s_save_b] = k_data_instance_b.load(i_o);
							}
							// iterate c
							for (let {
									id: i_s,
									row: h_row_c
								} of f_s(i_p, c_offset_data_po, h_row_b)) {
								// accumulate ids to m1
								a_m1.push(i_s);
							}
							// compute intersection between m1 and m2
							a_heads.push(...this.intersection(k_pattern, h_row_b, h_tail, a_m1));
						}
					}
				} else {
					// iterate a
					for (let {
							id: i_p,
							row: h_row_a
						} of f_p(h_row__)) {
						// iterate b
						for (let [i_o, c_offset_data_po] of f_o(i_p)) {
							let h_row_b = h_row_a;
							// b is marked
							if (s_mark_o) {
								// extend row a
								h_row_b = Object.create(h_row_a);
								// save marked
								h_row_b[s_mark_o] = k_graph.o(i_o);
							}
							// b is saved
							if (s_save_b) {
								h_row_b[s_save_b] = k_data_instance_b.load(i_o);
							}
							// iterate c
							for (let {
									id: i_s,
									row: h_row_c
								} of f_s(i_p, c_offset_data_po, h_row_b)) {
								// ref head(s)
								let i_head = b_inverse ? i_s : i_p;
								let a_heads = h_results[i_head];
								if (!a_heads) a_heads = h_results[i_head] = [];
								// tail has probes
								if (h_s.probes) {
									// simulate pattern head just for probe
									let h_sim_c = {
										id: i_s,
										probes: h_s.probes,
									};
									// probe all of c
									let h_survivors = this.probe(k_pattern, h_row_c, h_sim_c);
									if (h_survivors.size) {
										for (let i_tail in h_survivors) {
											let a_survivors = h_survivors[i_tail];
											for (let i_survivor = 0, n_survivors = a_survivors.length; i_survivor < n_survivors; i_survivor++) {
												let a_survivor = a_survivors[i_survivor];
												yield a_survivor;
											}
										}
									}
								}
								// reached end of pattern; push the current row
								else if (b_terminate) {
									yield h_row_C;
								}
								// more pattern to match
								else {
									// simulate pattern head for next triple
									let h_sim_c = {
										id: i_s,
										type: HP_HOP,
									};
									// proceed on c
									let h_survivors = this.proceed(k_pattern.copy(), h_row_c, h_sim_c);
									for (let i_survivor in h_survivors) {
										yield* h_survivors[i_survivor];
									}
								}
							}
						}
					}
				}
			}
			// OSP
			else {
				if (!k_graph.data_os) {
					throw 'Query requires the OSP triples index to be built.';
				}
				// mk iteration generators
				let f_o = this.iterate_a(h_o, 'o');
				let {
					gen: f_s,
					data: h_data_b,
				} = this.iterate_b(h_s, 's', 'os');
				let f_p = this.iterate_c(h_p, 'p', 'o_sp');
				let s_save_b = h_data_b && h_data_b.save;
				let k_data_instance_b;
				if (s_save_b) k_data_instance_b = h_s.data.plugin.instance;
				let b_extend_b = s_mark_s || s_save_b;
				// bidirectional set intersection
				if (!h_o.range && !h_s.range && h_p.range && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
					// set m1
					let a_m1 = [];
					// iterate a
					for (let {
							id: i_o,
							row: h_row_a
						} of f_o(h_row__)) {
						let a_heads = h_results[i_o] = [];
						// iterate b
						for (let [i_s, c_offset_data_os] of f_s(i_o)) {
							let h_row_b = h_row_a;
							// b is marked
							if (s_mark_s) {
								// extend row a
								h_row_b = Object.create(h_row_a);
								// save marked
								h_row_b[s_mark_s] = k_graph.s(i_s);
							}
							// b is saved
							if (s_save_b) {
								h_row_b[s_save_b] = k_data_instance_b.load(i_s);
							}
							// iterate c
							for (let {
									id: i_p,
									row: h_row_c
								} of f_p(i_o, c_offset_data_os, h_row_b)) {
								// accumulate ids to m1
								a_m1.push(i_p);
							}
							// compute intersection between m1 and m2
							a_heads.push(...this.intersection(k_pattern, h_row_b, h_tail, a_m1));
						}
					}
				} else {
					// iterate a
					for (let {
							id: i_o,
							row: h_row_a
						} of f_o(h_row__)) {
						// iterate b
						for (let [i_s, c_offset_data_os] of f_s(i_o)) {
							let h_row_b = h_row_a;
							// b is marked
							if (s_mark_s) {
								// extend row a
								h_row_b = Object.create(h_row_a);
								// save marked
								h_row_b[s_mark_s] = k_graph.s(i_s);
							}
							// b is saved
							if (s_save_b) {
								h_row_b[s_save_b] = k_data_instance_b.load(i_s);
							}
							// iterate c
							for (let {
									id: i_p,
									row: h_row_c
								} of f_p(i_o, c_offset_data_os, h_row_b)) {
								// ref head(s)
								let i_head = b_inverse ? i_p : i_o;
								let a_heads = h_results[i_head];
								if (!a_heads) a_heads = h_results[i_head] = [];
								// tail has probes
								if (h_p.probes) {
									// simulate pattern head just for probe
									let h_sim_c = {
										id: i_p,
										probes: h_p.probes,
									};
									// probe all of c
									let h_survivors = this.probe(k_pattern, h_row_c, h_sim_c);
									if (h_survivors.size) {
										for (let i_tail in h_survivors) {
											let a_survivors = h_survivors[i_tail];
											for (let i_survivor = 0, n_survivors = a_survivors.length; i_survivor < n_survivors; i_survivor++) {
												let a_survivor = a_survivors[i_survivor];
												yield a_survivor;
											}
										}
									}
								}
								// reached end of pattern; push the current row
								else if (b_terminate) {
									yield h_row_C;
								}
								// more pattern to match
								else {
									// simulate pattern head for next triple
									let h_sim_c = {
										id: i_p,
										type: HP_HOP,
									};
									// proceed on c
									let h_survivors = this.proceed(k_pattern.copy(), h_row_c, h_sim_c);
									for (let i_survivor in h_survivors) {
										yield* h_survivors[i_survivor];
									}
								}
							}
						}
					}
				}
			}
		}
	iterate_a(h_entity, s_term) {
		let k_graph = this.graph;
		// ref entity attributes
		let s_mark = h_entity.mark;
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;
		// K*[1]
		if (h_entity.id) {
			let i_entity = h_entity.id;
			// user bound a filter
			if (f_filter) {
				// filter rejects reconstructed term
				if (!f_filter(k_graph[s_term](i_entity))) {
					// empty generator
					return function*() {};
				}
			}
			// user bound a data handler
			if (h_data) {
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				// apply plugin handler; action dissaproves of this entity
				if (!h_checker.evaluate(i_entity)) {
					// empty generator
					return function*() {};
				}
				// data saves entity
				if (h_checker.save) {
					let k_instance = k_plugin.instance;
					let s_save = h_checker.save;
					// entity is marked
					if (s_mark) {
						// mk entity generator
						return function*(h_row__) {
							let h_row_a = Object.create(h_row__);
							// store saved
							h_row_a[s_save] = k_instance.load(i_entity);
							// store marked
							h_row_a[s_mark] = k_graph[s_term](i_entity);
							// simply return entity id (already known to be a valid entity)
							yield {
								id: i_entity,
								row: h_row_a,
							};
						};
					} else {
						// mk entity generator
						return function*(h_row__) {
							let h_row_a = Object.create(h_row__);
							// store saved
							h_row_a[s_save] = k_instance.load(i_entity);
							// simply return entity id (already known to be a valid entity)
							yield {
								id: i_entity,
								row: h_row_a,
							};
						};
					}
				}
			}
			// entity is marked
			if (s_mark) {
				// mk entity generator
				return function*(h_row__) {
					let h_row_a = Object.create(h_row__);
					// store marked
					h_row_a[s_mark] = k_graph[s_term](i_entity);
					// simply return entity id (already known to be a valid entity)
					yield {
						id: i_entity,
						row: h_row_a,
					};
				};
			}
			// not marked, not saved
			else {
				// mk entity generator
				return function*(h_row__) {
					// simply return entity id (already known to be a valid entity)
					yield {
						id: i_entity,
						row: h_row__,
					};
				};
			}
		}
		// K*[+]
		else if (h_entity.ids) {
			let a_entity_ids = h_entity.ids;
			// user bound a filter
			if (f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_entity = a_entity_ids[i_entity_id];
					// entity passes filter test
					if (f_filter(k_graph[s_tream](i_entity))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_entity);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// user bound a data handler
			if (h_data) {
				// data plugin checker
				let h_checker = h_data.plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;
				// filter entities
				if (f_evaluate) {
					let a_entity_ids_cleaned = [];
					for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
						let i_entity = a_entity_ids[i_entity_id];
						// entity passes plugin test
						if (f_evaluate(i_entity)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_entity);
						}
					}
					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}
				// data saves entity
				if (h_checker.save) {
					return {
						// mk entity generator
						gen: function*() {
							// simply iterate each entity node id (already known to be valid entities)
							yield* a_entity_ids;
						},
						// data role
						data: {
							save: h_checker.save,
						},
					};
				}
			}
			// mk entity iterator
			return {
				* gen() {
					// simply iterate each entity node id (already known to be valid entities)
					yield* a_entity_ids;
				},
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
			// no filter
			if (!f_filter) {
				// no data
				if (!h_data) {
					// marked
					if (s_mark) {
						// mk entity iterator
						return function*(h_row__) {
							// each and every entity node
							for (let i_e = i_start; i_e < i_stop; i_e++) {
								// branch row
								let h_row_a = Object.create(h_row__);
								// store marked
								h_row_a[s_mark] = k_graph[s_term](i_e);
								// yield
								yield {
									id: i_e,
									row: h_row_a,
								};
							}
						};
					}
					// not marked
					else {
						// mk entity iterator
						return function*(h_row__) {
							// each and every entity node
							for (let i_e = i_start; i_e < i_stop; i_e++) {
								yield {
									id: i_e,
									row: h_row__,
								};
							}
						};
					}
				}
				// yes data
				else {
					// evaluate data find
					let k_plugin = h_data.plugin;
					let h_found = k_plugin.find(h_data.action, i_start, i_stop);
					// yes saved
					if (h_found.save) {
						let s_save = h_found.save;
						let k_instance = k_plugin.instance;
						// marked
						if (s_mark) {
							// mk entity iterator
							return function*(h_row__) {
								// each and every entity node
								for (let i_e = i_start; i_e < i_stop; i_e++) {
									// branch row
									let h_row_a = Object.create(h_row__);
									// store marked
									h_row_a[s_mark] = k_graph[s_term](i_e);
									// store saved
									h_row_a[s_save] = k_instance.load(i_e);
									// yield
									yield {
										id: i_e,
										row: h_row_a,
									};
								}
							};
						}
						// not marked
						else {
							// mk entity iterator
							return function*(h_row__) {
								// each and every entity node
								for (let i_e = i_start; i_e < i_stop; i_e++) {
									// branch row
									let h_row_a = Object.create(h_row__);
									// store saved
									h_row_a[s_save] = k_instance.load(i_e);
									// yield
									yield {
										id: i_e,
										row: h_row_a,
									};
								}
							};
						}
					}
					// mk entity generator
					return function*(h_row__) {
						// id list
						if (h_found.ids) {
							yield* h_found.ids;
						}
						// range
						else if (h_found.range) {
							let h_range = h_found.range;
							for (let i_e = h_range.low; i_e <= h_range.high; i_e++) {
								yield i_e;
							}
						}
					};
				}
			}
			// yes filter
			else {
				// no data
				if (!h_data) {
					// marked
					if (s_mark) {
						// mk entity generator
						return function*(h_row__) {
							// each and every entity node
							for (let i_e = i_start; i_e < i_stop; i_e++) {
								// skip entity if filter rejectes reconstructed term
								if (!f_filter(k_graph[s_term](i_e))) continue;
								// branch row
								let h_row_a = Object.create(h_row__);
								// store marked
								h_row_a[s_mark] = k_graph[s_term](i_e);
								// yield
								yield {
									id: i_e,
									row: h_row_a,
								};
							}
						};
					}
					// not marked
					else {
						// mk entity generator
						return function*(h_row__) {
							// each and every entity node
							for (let i_e = i_start; i_e < i_stop; i_e++) {
								// skip entity if filter rejectes reconstructed term
								if (!f_filter(k_graph[s_term](i_e))) continue;
								// yield
								yield {
									id: i_e,
									row: h_row__,
								};
							}
						};
					}
				}
				// yes data
				else {
					// evaluate data find
					let k_plugin = h_data.plugin;
					let h_found = k_plugin.find(f_action, i_start, i_stop);
					// saved
					if (h_found.save) {
						let s_save = h_found.save;
						// marked
						if (s_mark) {
							// id list
							if (h_found.ids) {
								let a_found_ids = h_found.ids;
								// mk entity generator
								return function*(h_row__) {
									for (let i_found_id = 0, n_found_ids = a_found_ids.length; i_found_id < n_found_ids; i_found_id++) {
										let i_e = a_found_ids[i_found_id];
										// skip entity if filter rejectes reconstructed term
										if (!f_filter(k_graph[s_term](i_e))) continue;
										// branch row
										let h_row_a = Object.create(h_row__);
										// store marked
										h_row_a[s_mark] = k_graph[s_term](i_e);
										// store saved
										h_row_a[s_save] = k_instance.load(i_e);
										// yield
										yield {
											id: i_e,
											row: h_row_a,
										};
									}
								};
							}
							// range
							else if (h_found.range) {
								let h_range = h_found.range;
								// mk entity iterator
								return function*(h_row__) {
									// each entity node that was returned by data
									for (let i_e = h_range.low; i_e < h_range.high; i_e++) {
										// skip entity if filter rejectes reconstructed term
										if (!f_filter(k_graph[s_term](i_e))) continue;
										// branch row
										let h_row_a = Object.create(h_row__);
										// store marked
										h_row_a[s_mark] = k_graph[s_term](i_e);
										// store saved
										h_row_a[s_save] = k_instance.load(i_e);
										// yield
										yield {
											id: i_e,
											row: h_row_a,
										};
									}
								};
							}
							// invalid
							else {
								throw `'find' function of plugin returned invalid object`;
							}
						}
						// not marked
						else {
							// id list
							if (h_found.ids) {
								let a_found_ids = h_found.ids;
								// mk entity generator
								return function*(h_row__) {
									for (let i_found_id = 0, n_found_ids = a_found_ids.length; i_found_id < n_found_ids; i_found_id++) {
										let i_e = a_found_ids[i_found_id];
										// skip entity if filter rejectes reconstructed term
										if (!f_filter(k_graph[s_term](i_e))) continue;
										// branch row
										let h_row_a = Object.create(h_row__);
										// store saved
										h_row_a[s_save] = k_instance.load(i_e);
										// yield
										yield {
											id: i_e,
											row: h_row_a,
										};
									}
								};
							}
							// range
							else if (h_found.range) {
								let h_range = h_found.range;
								// mk entity iterator
								return function*(h_row__) {
									// each entity node that was returned by data
									for (let i_e = h_range.low; i_e < h_range.high; i_e++) {
										// skip entity if filter rejectes reconstructed term
										if (!f_filter(k_graph[s_term](i_e))) continue;
										// branch row
										let h_row_a = Object.create(h_row__);
										// store saved
										h_row_a[s_save] = k_instance.load(i_e);
										// yield
										yield {
											id: i_e,
											row: h_row_a,
										};
									}
								};
							}
							// invalid
							else {
								throw `'find' function of plugin returned invalid object`;
							}
						}
					}
					// not saved
					else {
						// marked
						if (s_mark) {
							// id list
							if (h_found.ids) {
								let a_found_ids = h_found.ids;
								// mk entity generator
								return function*(h_row__) {
									for (let i_found_id = 0, n_found_ids = a_found_ids.length; i_found_id < n_found_ids; i_found_id++) {
										let i_e = a_found_ids[i_found_id];
										// skip entity if filter rejectes reconstructed term
										if (!f_filter(k_graph[s_term](i_e))) continue;
										// branch row
										let h_row_a = Object.create(h_row__);
										// store marked
										h_row_a[s_mark] = k_graph[s_term](i_e);
										// yield
										yield {
											id: i_e,
											row: h_row_a,
										};
									}
								};
							}
							// range
							else if (h_found.range) {
								let h_range = h_found.range;
								// mk entity iterator
								return function*(h_row__) {
									// each entity node that was returned by data
									for (let i_e = h_range.low; i_e < h_range.high; i_e++) {
										// skip entity if filter rejectes reconstructed term
										if (!f_filter(k_graph[s_term](i_e))) continue;
										// branch row
										let h_row_a = Object.create(h_row__);
										// store marked
										h_row_a[s_mark] = k_graph[s_term](i_e);
										// yield
										yield {
											id: i_e,
											row: h_row_a,
										};
									}
								};
							}
							// invalid
							else {
								throw `'find' function of plugin returned invalid object`;
							}
						}
						// not marked
						else {
							// id list
							if (h_found.ids) {
								let a_found_ids = h_found.ids;
								// mk entity generator
								return function*(h_row__) {
									for (let i_found_id = 0, n_found_ids = a_found_ids.length; i_found_id < n_found_ids; i_found_id++) {
										let i_e = a_found_ids[i_found_id];
										// skip entity if filter rejectes reconstructed term
										if (!f_filter(k_graph[s_term](i_e))) continue;
										// yield
										yield {
											id: i_e,
											row: h_row__,
										};
									}
								};
							}
							// range
							else if (h_found.range) {
								let h_range = h_found.range;
								// mk entity iterator
								return function*(h_row__) {
									// each entity node that was returned by data
									for (let i_e = h_range.low; i_e < h_range.high; i_e++) {
										// skip entity if filter rejectes reconstructed term
										if (!f_filter(k_graph[s_term](i_e))) continue;
										// yield
										yield {
											id: i_e,
											row: h_row__,
										};
									}
								};
							}
							// invalid
							else {
								throw `'find' function of plugin returned invalid object`;
							}
						}
					}
					// end
				}
			}
		}
	}
	iterate_b(h_entity, s_term, s_key) {
		let k_graph = this.graph;
		// data and index
		let a_data_ab = k_graph['data_' + s_key];
		let a_idx_ab = k_graph['idx_' + s_key];
		// ref filter
		let f_filter = h_entity.filter;
		// ref data
		let h_data = h_entity.data;
		// K*[1]
		if (h_entity.id) {
			let i_entity = h_entity.id;
			// user bound a filter
			if (f_filter) {
				// filter rejects reconstructed term
				if (!f_filter(k_graph[s_term](i_entity))) {
					// empty iterator
					return {
						gen: function*() {}
					};
				}
			}
			// user bound a data handler
			if (h_data) {
				let h_checker = h_data.plugin.checker(h_data.action);
				// apply plugin handler; action dissaproves of this entity
				if (!h_checker.evaluate(i_entity)) {
					// empty generator
					return {
						gen: function*() {}
					};
				}
				// data saves entity
				if (h_checker.save) {
					return {
						// mk entity generator
						gen: function*(i_test_a) {
							// search data table for given entity
							// search ab's adjacency list for 'b'
							let c_offset_ab = -1;
							// starting position of adjacency list (for counting item offset)
							let i_start = a_idx_ab[i_test_a - 1];
							// bounds of binary search
							let i_lo = i_start;
							let i_hi = a_idx_ab[i_test_a] - 1;
							searching_adjacency_list:
								for (;;) {
									// binary search
									for (;;) {
										let x_lo = a_data_ab[i_lo];
										let x_hi = a_data_ab[i_hi];
										// compute midpoint search index
										let i_mid = (i_lo + i_hi) >> 1;
										let x_mid = a_data_ab[i_mid];
										// miss low
										if (x_mid < i_entity) {
											i_lo = i_mid + 1;
										}
										// miss high
										else if (x_mid > i_entity) {
											i_hi = i_mid - 1;
										}
										// hit!
										else {
											// set offset accordingly
											c_offset_ab = i_mid - i_start;
											break;
										}
										// indexes crossed; target not in list
										if (i_hi < i_lo) break searching_adjacency_list;
									}
									yield [i_entity, c_offset_ab];
									break;
								}
						},
						// data role
						data: {
							save: h_checker.save,
						},
					};
				}
			}
			return {
				// mk entity generator
				gen: function*(i_test_a) {
					// search data table for given entity
					// search ab's adjacency list for 'b'
					let c_offset_ab = -1;
					// starting position of adjacency list (for counting item offset)
					let i_start = a_idx_ab[i_test_a - 1];
					// bounds of binary search
					let i_lo = i_start;
					let i_hi = a_idx_ab[i_test_a] - 1;
					searching_adjacency_list:
						for (;;) {
							// binary search
							for (;;) {
								let x_lo = a_data_ab[i_lo];
								let x_hi = a_data_ab[i_hi];
								// compute midpoint search index
								let i_mid = (i_lo + i_hi) >> 1;
								let x_mid = a_data_ab[i_mid];
								// miss low
								if (x_mid < i_entity) {
									i_lo = i_mid + 1;
								}
								// miss high
								else if (x_mid > i_entity) {
									i_hi = i_mid - 1;
								}
								// hit!
								else {
									// set offset accordingly
									c_offset_ab = i_mid - i_start;
									break;
								}
								// indexes crossed; target not in list
								if (i_hi < i_lo) break searching_adjacency_list;
							}
							yield [i_entity, c_offset_ab];
							break;
						}
				},
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
					let i_entity = a_entity_ids[i_entity_id];
					// entity passes filter test
					if (f_filter(k_graph[s_tream](i_entity))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_entity);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// user bound a data handler
			if (h_data) {
				// checker
				let h_checker = h_data.plugin.checker(h_data.action);
				// filter entities
				let a_entity_ids_cleaned = [];
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_entity = a_entity_ids[i_entity_id];
					// entity passes plugin test
					if (h_checker.evaluate(f_action, i_entity)) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_entity);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// mk entity iterator
			return {
				gen: function*(i_test_a) {
					// copy ids list
					let a_search_ids = a_entity_ids.slice();
					// search data table for given entities
					// search ab's adjacency list for predicate
					let c_offset_ab = 0;
					let i_data_ab_start = a_idx_ab[i_test_a - 1];
					// let c_offset_ab_end = a_idx_ab[i_test_a] - i_data_ab_start;
					let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
					let c_offset_ab_end = a_idx_x_bc.length - 1;
					// each predicate in subject's ab adjacency list
					do {
						// pull up b's id
						let i_test_b = a_data_ab[i_data_ab_start + c_offset_ab];
						// found a target entity
						let i_found_entity = a_search_ids.indexOf(i_test_b);
						if (-1 !== i_found_edge) {
							// delete from search list
							a_search_ids.splice(i_found_entity, 1);
							// yield
							yield [i_test_b, c_offset_ab];
							// found all ids; stop searching
							if (!a_search_ids.length) break;
						}
					} while (++c_offset_ab !== c_offset_ab_end);
				},
			};
		}
		// Vp
		else {
			let hp_entity_type = h_entity.type;
			// Vp[all]
			if (HP_RANGE_ALL === hp_entity_range) {
				// no filter
				if (!f_filter) {
					// mk entity iterator
					return {
						gen: function*(i_test_a) {
							// search ab's adjacency list for predicate
							let c_offset_ab = 0;
							let i_data_ab_start = a_idx_ab[i_test_a - 1];
							// let c_offset_ab_end = a_idx_ab[i_test_a] - i_data_ab_start;
							let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
							let c_offset_ab_end = a_idx_x_bc.length - 1;
							// each predicate in subject's ab adjacency list
							do {
								// pull up b's id
								let i_test_b = a_data_ab[i_data_ab_start + c_offset_ab];
								yield [i_test_b, c_offset_ab];
							} while (++c_offset_ab !== c_offset_ab_end);
						},
					};
				}
				// yes filter
				else {
					// mk entity iterator
					return {
						gen: function*(i_test_a) {
							// search ab's adjacency list for predicate
							let c_offset_ab = 0;
							let i_data_ab_start = a_idx_ab[i_test_a - 1];
							// let c_offset_ab_end = a_idx_ab[i_test_a] - i_data_ab_start;
							let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
							let c_offset_ab_end = a_idx_x_bc.length - 1;
							// each predicate in subject's ab adjacency list
							do {
								// pull up b's id
								let i_test_b = a_data_ab[i_data_ab_start + c_offset_ab];
								// filter rejects reconstructed term; skip
								if (!f_filter(k_graph[s_term](i_test_b))) continue;
								// accepted
								yield [i_test_b, c_offset_ab];
							} while (++c_offset_ab !== c_offset_ab_end);
						},
					};
				}
			}
			// V*[custom]
			else if (HP_RANGE_CUSTOM === hp_entity_range) {
				let i_start = h_entity.start;
				let i_stop = h_entity.stop;
				// no filter
				if (!f_filter) {
					// mk entity iterator
					return {
						gen: function*(i_test_a) {
							// search data table for given range
							// search ab's adjacency list for predicate
							let c_offset_ab = 0;
							let i_data_ab_start = a_idx_ab[i_test_a - 1];
							// let c_offset_ab_end = a_idx_ab[i_test_a] - i_data_ab_start;
							let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
							let c_offset_ab_end = a_idx_x_bc.length - 1;
							// each predicate in subject's ab adjacency list
							do {
								// pull up b's id
								let i_test_b = a_data_ab[i_data_ab_start + c_offset_ab];
								// too low (not in range yet)
								if (i_test_b < i_start) continue;
								// too high (out of range)
								if (i_test_b >= i_stop) break;
								// filter rejects reconstructed term; skip
								if (!f_filter(k_graph[s_term](i_test_b))) continue;
								// accepted
								yield [i_test_b, c_offset_ab];
							} while (++c_offset_ab !== c_offset_ab_end);
						},
					};
				}
				// yes filter
				else {
					// mk entity iterator
					return {
						gen: function*(i_test_a) {
							// search data table for given range
							// search ab's adjacency list for predicate
							let c_offset_ab = 0;
							let i_data_ab_start = a_idx_ab[i_test_a - 1];
							// let c_offset_ab_end = a_idx_ab[i_test_a] - i_data_ab_start;
							let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
							let c_offset_ab_end = a_idx_x_bc.length - 1;
							// each predicate in subject's ab adjacency list
							do {
								// pull up b's id
								let i_test_b = a_data_ab[i_data_ab_start + c_offset_ab];
								// too low (not in range yet)
								if (i_test_b < i_start) continue;
								// too high (out of range)
								if (i_test_b >= i_stop) break;
								// filter rejects reconstructed term; skip
								if (!f_filter(k_graph[s_term](i_test_b))) continue;
								// accepted
								yield [i_test_b, c_offset_ab];
							} while (++c_offset_ab !== c_offset_ab_end);
						},
					};
				}
			}
			// ??
			else {
				throw 'invalid variable source type. only expected {ALL, CUSTOM}';
			}
		}
	}
	iterate_c(h_entity, s_term, s_key) {
		let k_graph = this.graph;
		// data and index
		let a_data_a_bc = k_graph['data_' + s_key];
		let a_idx_a_bc = k_graph['idx_' + s_key];
		// ref entity attributes
		let s_mark = h_entity.mark;
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;
		// K*[1]
		if (h_entity.id) {
			let i_entity = h_entity.id;
			// user bound a filter
			if (f_filter) {
				// filter rejects reconstructed term
				if (!f_filter(k_graph[s_term](i_entity))) {
					// empty iterator
					return function*() {};
				}
			}
			throw 'nye';
			// mk entity iterator
			return function*(i_test_a, c_offset_ab) {
				// search data table for given entity
				// search ab's adjacency list for 'b'
				let c_offset_a_bc = -1;
				// starting position of adjacency list (for counting item offset)
				let a_idx_a_b = a_idx_a_bc[i_test_a - 1];
				let i_start = a_idx_a_b[c_offset_ab];
				// bounds of binary search
				let i_lo = i_start;
				let i_hi = (a_idx_a_b.length - 1) === c_offset_ab ? a_idx_a_bc[i_test_a] - 1 : a_idx_a_b[c_offset_ab + 1] - 1;
				searching_adjacency_list:
					for (;;) {
						// binary search
						for (;;) {
							let x_lo = a_data_a_bc[i_lo];
							let x_hi = a_data_a_bc[i_hi];
							// target value out of bounds
							if (i_entity < x_lo || i_entity > x_hi) break searching_adjacency_list;
							// compute midpoint search index
							let i_mid = (i_lo + i_hi) >> 1;
							let x_mid = a_data_a_bc[i_mid];
							// miss low
							if (x_mid < i_entity) {
								i_lo = i_mid + 1;
							}
							// miss high
							else if (x_mid > i_entity) {
								i_hi = i_mid - 1;
							}
							// hit!
							else {
								// set offset accordingly
								c_offset_a_bc = i_mid - i_start;
								break;
							}
							// indexes crossed; target not in list
							if (i_hi < i_lo) break searching_adjacency_list;
						}
						yield i_entity;
						break;
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
					let i_entity = a_entity_ids[i_entity_id];
					// entity passes filter test
					if (f_filter(k_graph[s_tream](i_entity))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_entity);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// user bound a data handler
			if (h_data) {
				// plugin data checker
				let f_checker = h_data.plugin.checker(h_data.action);
				// filter entities
				let a_entity_ids_cleaned = [];
				for (let i_entity_id = 0, n_entity_ids = a_entity_ids.length; i_entity_id < n_entity_ids; i_entity_id++) {
					let i_entity = a_entity_ids[i_entity_id];
					// entity passes plugin test
					if (f_checker(i_entity)) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_entity);
					}
				}
				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}
			// mk entity iterator
			return {
				gen: function*(i_test_a, c_offset_ab) {
					// copy ids list
					let a_search_ids = a_entity_ids.slice();
					// search data table for given entities
					// pull up c's data index
					let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
					let i_data_a_bc = a_idx_x_bc[c_offset_ab];
					let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
					// each object pointed to by predicate
					do {
						// pull up c's id
						let i_test_c = a_data_a_bc[i_data_a_bc];
						// found a target entity
						let i_found_entity = a_search_ids.indexOf(i_test_c);
						if (-1 !== i_found_edge) {
							// delete from search list
							a_search_ids.splice(i_found_entity, 1);
							// yield
							yield i_test_c;
							// found all ids; stop searching
							if (!a_search_ids.length) break;
						}
					} while (++i_data_a_bc !== i_data_a_bc_end);
				},
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
			let f_evaluate, s_save, k_instance;
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
				s_save = h_checker.save;
				f_evaluate = h_checker.evaluate;
			}
			// no evaluate
			if (!f_evaluate) {
				// no filter
				if (!f_filter) {
					// marked
					if (s_mark) {
						// saved
						if (s_save) {
							// no need to check low
							if (i_start === 1) {
								// no need to check high
								if (i_stop === i_high_range) {
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];


											// branch row
											let h_row_c = Object.create(h_row_b);
											// store marked
											h_row_c[s_mark] = k_graph[s_term](i_test_c);
											// store saved
											h_row_c[s_save] = k_instance.load(i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										}
									};
								}
								// only check for high
								else {
									// too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c >= i_stop) break;

											// branch row
											let h_row_c = Object.create(h_row_b);
											// store marked
											h_row_c[s_mark] = k_graph[s_term](i_test_c);
											// store saved
											h_row_c[s_save] = k_instance.load(i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										} while (++i_data_a_bc !== i_data_a_bc_end);
									};
								}
							}
							// must check for low
							else {
								// no need to check high
								if (i_stop === i_high_range) {
									// too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c < i_start) break;

											// branch row
											let h_row_c = Object.create(h_row_b);
											// store marked
											h_row_c[s_mark] = k_graph[s_term](i_test_c);
											// store saved
											h_row_c[s_save] = k_instance.load(i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										}
									};
								}
								// check for high too
								else {
									// check for either: too low (not in range yet); too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c < i_start) break;
											if (i_test_c >= i_stop) break;
											// branch row
											let h_row_c = Object.create(h_row_b);
											// store marked
											h_row_c[s_mark] = k_graph[s_term](i_test_c);
											// store saved
											h_row_c[s_save] = k_instance.load(i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										} while (++i_data_a_bc !== i_data_a_bc_end);
									};
								}
							}
						}
						// not saved
						else {
							// no need to check low
							if (i_start === 1) {
								// no need to check high
								if (i_stop === i_high_range) {
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];


											// branch row
											let h_row_c = Object.create(h_row_b);
											// store marked
											h_row_c[s_mark] = k_graph[s_term](i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										}
									};
								}
								// only check for high
								else {
									// too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c >= i_stop) break;

											// branch row
											let h_row_c = Object.create(h_row_b);
											// store marked
											h_row_c[s_mark] = k_graph[s_term](i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										} while (++i_data_a_bc !== i_data_a_bc_end);
									};
								}
							}
							// must check for low
							else {
								// no need to check high
								if (i_stop === i_high_range) {
									// too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c < i_start) break;

											// branch row
											let h_row_c = Object.create(h_row_b);
											// store marked
											h_row_c[s_mark] = k_graph[s_term](i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										}
									};
								}
								// check for high too
								else {
									// check for either: too low (not in range yet); too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c < i_start) break;
											if (i_test_c >= i_stop) break;
											// branch row
											let h_row_c = Object.create(h_row_b);
											// store marked
											h_row_c[s_mark] = k_graph[s_term](i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										} while (++i_data_a_bc !== i_data_a_bc_end);
									};
								}
							}
						}
					}
					// not marked
					else {
						// saved
						if (s_save) {
							// no need to check low
							if (i_start === 1) {
								// no need to check high
								if (i_stop === i_high_range) {
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];


											// branch row
											let h_row_c = Object.create(h_row_b);
											// store saved
											h_row_c[s_save] = k_instance.load(i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										}
									};
								}
								// only check for high
								else {
									// too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c >= i_stop) break;

											// branch row
											let h_row_c = Object.create(h_row_b);
											// store saved
											h_row_c[s_save] = k_instance.load(i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										} while (++i_data_a_bc !== i_data_a_bc_end);
									};
								}
							}
							// must check for low
							else {
								// no need to check high
								if (i_stop === i_high_range) {
									// too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c < i_start) break;

											// branch row
											let h_row_c = Object.create(h_row_b);
											// store saved
											h_row_c[s_save] = k_instance.load(i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										}
									};
								}
								// check for high too
								else {
									// check for either: too low (not in range yet); too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c < i_start) break;
											if (i_test_c >= i_stop) break;
											// branch row
											let h_row_c = Object.create(h_row_b);
											// store saved
											h_row_c[s_save] = k_instance.load(i_test_c);
											// yield
											yield {
												id: i_test_c,
												row: h_row_c,
											};
										} while (++i_data_a_bc !== i_data_a_bc_end);
									};
								}
							}
						}
						// not saved
						else {
							// no need to check low
							if (i_start === 1) {
								// no need to check high
								if (i_stop === i_high_range) {
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];


											// yield
											yield {
												id: i_test_c,
												row: h_row_b
											};
										}
									};
								}
								// only check for high
								else {
									// too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c >= i_stop) break;

											// yield
											yield {
												id: i_test_c,
												row: h_row_b
											};
										} while (++i_data_a_bc !== i_data_a_bc_end);
									};
								}
							}
							// must check for low
							else {
								// no need to check high
								if (i_stop === i_high_range) {
									// too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c < i_start) break;

											// yield
											yield {
												id: i_test_c,
												row: h_row_b
											};
										}
									};
								}
								// check for high too
								else {
									// check for either: too low (not in range yet); too high (out of range)
									// mk entity iterator
									return function*(i_test_a, c_offset_ab, h_row_b) {
										// pull up c's data index
										let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
										let i_data_a_bc = a_idx_x_bc[c_offset_ab];
										let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
										// each object pointed to by predicate
										do {
											// pull up c's id
											let i_test_c = a_data_a_bc[i_data_a_bc];
											if (i_test_c < i_start) break;
											if (i_test_c >= i_stop) break;
											// yield
											yield {
												id: i_test_c,
												row: h_row_b
											};
										} while (++i_data_a_bc !== i_data_a_bc_end);
									};
								}
							}
						}
					}
				}
				// yes filter
				else {
					throw 'yes filter';
					// no need to check low
					if (i_start === 1) {
						// no need to check high
						if (i_stop === i_high_range) {
							// mk entity iterator
							f_gen = function*(i_test_a, c_offset_ab) {
								// pull up c's data index
								let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
								let i_data_a_bc = a_idx_x_bc[c_offset_ab];
								let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
								// each object pointed to by predicate
								do {
									// pull up c's id
									let i_test_c = a_data_a_bc[i_data_a_bc];
									// filter rejects reconstructed term; skip
									if (!f_filter(k_graph[s_term](i_test_c))) continue;
									// accepted
									yield i_test_c;
								} while (++i_data_a_bc !== i_data_a_bc_end);
							};
						}
						// only check for high
						else {
							// mk entity iterator
							f_gen = function*(i_test_a, c_offset_ab) {
								// search data table for given range
								// pull up c's data index
								let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
								let i_data_a_bc = a_idx_x_bc[c_offset_ab];
								let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
								// each object pointed to by predicate
								do {
									// pull up c's id
									let i_test_c = a_data_a_bc[i_data_a_bc];
									// too high (out of range)
									if (i_test_c >= i_stop) break;
									// filter rejects reconstructed term; skip
									if (!f_filter(k_graph[s_term](i_test_c))) continue;
									// within range
									yield i_test_c;
								} while (++i_data_a_bc !== i_data_a_bc_end);
							};
						}
					}
					// must check for low
					else {
						// no need to check high
						if (i_stop === i_high_range) {
							// mk entity iterator
							f_gen = function*(i_test_a, c_offset_ab) {
								// search data table for given range
								// pull up c's data index
								let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
								let i_data_a_bc = a_idx_x_bc[c_offset_ab];
								let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
								// each object pointed to by predicate
								do {
									// pull up c's id
									let i_test_c = a_data_a_bc[i_data_a_bc];
									// too low (not in range yet)
									if (i_test_c < i_start) continue;
									// filter rejects reconstructed term; skip
									if (!f_filter(k_graph[s_term](i_test_c))) continue;
									// within range
									yield i_test_c;
								} while (++i_data_a_bc !== i_data_a_bc_end);
							};
						}
						// check for high too
						else {
							// mk entity iterator
							f_gen = function*(i_test_a, c_offset_ab) {
								// search data table for given range
								// pull up c's data index
								let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
								let i_data_a_bc = a_idx_x_bc[c_offset_ab];
								let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
								// each object pointed to by predicate
								do {
									// pull up c's id
									let i_test_c = a_data_a_bc[i_data_a_bc];
									// too low (not in range yet)
									if (i_test_c < i_start) continue;
									// too high (out of range)
									if (i_test_c >= i_stop) break;
									// filter rejects reconstructed term; skip
									if (!f_filter(k_graph[s_term](i_test_c))) continue;
									// within range
									yield i_test_c;
								} while (++i_data_a_bc !== i_data_a_bc_end);
							};
						}
					}
				}
			}
			// yes data evaluate
			else {
				// marked
				if (s_mark) {
					// saved
					if (s_save) {
						// no need to check low
						if (i_start === 1) {
							// no need to check high
							if (i_stop === i_high_range) {
								// plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (!f_evaluate(i_test_c)) continue;

										// branch row
										let h_row_c = Object.create(h_row_b);
										// store marked
										h_row_c[s_mark] = k_graph[s_term](i_test_c);
										// store saved
										h_row_c[s_save] = k_instance.load(i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									}
								};
							}
							// only check for high
							else {
								// too high (out of range) || plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c >= i_stop) break;
										if (!f_evaluate(i_test_c)) continue;
										// branch row
										let h_row_c = Object.create(h_row_b);
										// store marked
										h_row_c[s_mark] = k_graph[s_term](i_test_c);
										// store saved
										h_row_c[s_save] = k_instance.load(i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									} while (++i_data_a_bc !== i_data_a_bc_end);
								};
							}
						}
						// must check for low
						else {
							// no need to check high
							if (i_stop === i_high_range) {
								// too low (not in range yet) || plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c < i_start || !f_evaluate(i_test_c)) continue;

										// branch row
										let h_row_c = Object.create(h_row_b);
										// store marked
										h_row_c[s_mark] = k_graph[s_term](i_test_c);
										// store saved
										h_row_c[s_save] = k_instance.load(i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									}
								};
							}
							// check for high too
							else {
								// too low (not in range yet) || plugin rejects reconstructed term; skip || or out of range
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c < i_start || !f_evaluate(i_test_c)) continue;
										if (i_test_c >= i_stop) break;
										// branch row
										let h_row_c = Object.create(h_row_b);
										// store marked
										h_row_c[s_mark] = k_graph[s_term](i_test_c);
										// store saved
										h_row_c[s_save] = k_instance.load(i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									} while (++i_data_a_bc !== i_data_a_bc_end);
								};
							}
						}
					}
					// not saved
					else {
						// no need to check low
						if (i_start === 1) {
							// no need to check high
							if (i_stop === i_high_range) {
								// plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (!f_evaluate(i_test_c)) continue;

										// branch row
										let h_row_c = Object.create(h_row_b);
										// store marked
										h_row_c[s_mark] = k_graph[s_term](i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									}
								};
							}
							// only check for high
							else {
								// too high (out of range) || plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c >= i_stop) break;
										if (!f_evaluate(i_test_c)) continue;
										// branch row
										let h_row_c = Object.create(h_row_b);
										// store marked
										h_row_c[s_mark] = k_graph[s_term](i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									} while (++i_data_a_bc !== i_data_a_bc_end);
								};
							}
						}
						// must check for low
						else {
							// no need to check high
							if (i_stop === i_high_range) {
								// too low (not in range yet) || plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c < i_start || !f_evaluate(i_test_c)) continue;

										// branch row
										let h_row_c = Object.create(h_row_b);
										// store marked
										h_row_c[s_mark] = k_graph[s_term](i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									}
								};
							}
							// check for high too
							else {
								// too low (not in range yet) || plugin rejects reconstructed term; skip || or out of range
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c < i_start || !f_evaluate(i_test_c)) continue;
										if (i_test_c >= i_stop) break;
										// branch row
										let h_row_c = Object.create(h_row_b);
										// store marked
										h_row_c[s_mark] = k_graph[s_term](i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									} while (++i_data_a_bc !== i_data_a_bc_end);
								};
							}
						}
					}
				}
				// not marked
				else {
					// saved
					if (s_save) {
						// no need to check low
						if (i_start === 1) {
							// no need to check high
							if (i_stop === i_high_range) {
								// plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (!f_evaluate(i_test_c)) continue;

										// branch row
										let h_row_c = Object.create(h_row_b);
										// store saved
										h_row_c[s_save] = k_instance.load(i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									}
								};
							}
							// only check for high
							else {
								// too high (out of range) || plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c >= i_stop) break;
										if (!f_evaluate(i_test_c)) continue;
										// branch row
										let h_row_c = Object.create(h_row_b);
										// store saved
										h_row_c[s_save] = k_instance.load(i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									} while (++i_data_a_bc !== i_data_a_bc_end);
								};
							}
						}
						// must check for low
						else {
							// no need to check high
							if (i_stop === i_high_range) {
								// too low (not in range yet) || plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c < i_start || !f_evaluate(i_test_c)) continue;

										// branch row
										let h_row_c = Object.create(h_row_b);
										// store saved
										h_row_c[s_save] = k_instance.load(i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									}
								};
							}
							// check for high too
							else {
								// too low (not in range yet) || plugin rejects reconstructed term; skip || or out of range
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c < i_start || !f_evaluate(i_test_c)) continue;
										if (i_test_c >= i_stop) break;
										// branch row
										let h_row_c = Object.create(h_row_b);
										// store saved
										h_row_c[s_save] = k_instance.load(i_test_c);
										// yield
										yield {
											id: i_test_c,
											row: h_row_c,
										};
									} while (++i_data_a_bc !== i_data_a_bc_end);
								};
							}
						}
					}
					// not saved
					else {
						// no need to check low
						if (i_start === 1) {
							// no need to check high
							if (i_stop === i_high_range) {
								// plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (!f_evaluate(i_test_c)) continue;

										// yield
										yield {
											id: i_test_c,
											row: h_row_b
										};
									}
								};
							}
							// only check for high
							else {
								// too high (out of range) || plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c >= i_stop) break;
										if (!f_evaluate(i_test_c)) continue;
										// yield
										yield {
											id: i_test_c,
											row: h_row_b
										};
									} while (++i_data_a_bc !== i_data_a_bc_end);
								};
							}
						}
						// must check for low
						else {
							// no need to check high
							if (i_stop === i_high_range) {
								// too low (not in range yet) || plugin rejects reconstructed term; skip
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c < i_start || !f_evaluate(i_test_c)) continue;

										// yield
										yield {
											id: i_test_c,
											row: h_row_b
										};
									}
								};
							}
							// check for high too
							else {
								// too low (not in range yet) || plugin rejects reconstructed term; skip || or out of range
								// mk entity iterator
								return function*(i_test_a, c_offset_ab, h_row_b) {
									// pull up c's data index
									let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
									let i_data_a_bc = a_idx_x_bc[c_offset_ab];
									let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];
									// each object pointed to by predicate
									do {
										// pull up c's id
										let i_test_c = a_data_a_bc[i_data_a_bc];
										if (i_test_c < i_start || !f_evaluate(i_test_c)) continue;
										if (i_test_c >= i_stop) break;
										// yield
										yield {
											id: i_test_c,
											row: h_row_b
										};
									} while (++i_data_a_bc !== i_data_a_bc_end);
								};
							}
						}
					}
				}
				// end
			}
		}
	}
	intersection(k_pattern, h_row__, h_head, a_m1) {
		let k_graph = this.graph;
		// predicate(s) of triple pattern
		let h_p = k_pattern.shift();
		// Vp
		if (h_p.range) x_triple_pattern |= 2;
		// tail of triple pattern
		let h_tail = k_pattern.shift();
		// end of pattern sequence
		let b_terminate = !k_pattern.length;
		// which data/index to use
		let hp_data_use, h_s, h_o;
		// body is normal direction
		if (HP_PREDICATE === h_p.type) {
			h_s = h_head;
			h_o = h_tail;
			hp_data_use = HP_USE_POS;
		}
		// body is inverse direction
		else {
			b_inverse = true;
			h_s = h_tail;
			h_o = h_head;
			hp_data_use = HP_USE_SPO;
		}
		// ref markings
		let s_mark_s = h_s.mark;
		let s_mark_p = h_p.mark;
		let s_mark_o = h_o.mark;
		// save results as list
		let a_results = [];
		// m1 read index and length
		let i_m1 = 0;
		let n_m1 = a_m1.length;
		// SPO
		if (HP_USE_SPO === hp_data_use) {
			if (!k_graph.data_sp) {
				throw 'Query requires the POS triples index to be built.';
			}
			// mk iteration generators
			let f_s = this.iterate_a(h_s, 's');
			let {
				gen: f_p,
				data: h_data_b,
			} = this.iterate_b(h_p, 'p', 'sp');
			let f_o = this.iterate_c(h_o, 'o', 's_po');
			let s_save_b = h_data_b && h_data_b.save;
			let k_data_instance_b;
			if (s_save_b) k_data_instance_b = h_p.data.plugin.instance;
			let b_extend_b = s_mark_p || s_save_b;
			// head is marked
			if (h_head.mark) {
				// iterate a
				for (let {
						id: i_s,
						row: h_row_a
					} of f_s(h_row__)) {
					// iterate b
					for (let [i_p, c_offset_data_sp] of f_p(i_s)) {
						let h_row_b = h_row_a;
						// b is marked
						if (s_mark_p) {
							// extend row a
							h_row_b = Object.create(h_row_a);
							// save marked
							h_row_b[s_mark_p] = k_graph.p(i_p);
						}
						// b is saved
						if (s_save_b) {
							h_row_b[s_save_b] = k_data_instance_b.load(i_p);
						}
						let i_m1 = 0;
						find_intersections:
							// iterate c
							for (let {
									id: i_o,
									row: h_row_c
								} of f_o(i_s, c_offset_data_sp, h_row_b)) {
								// skip over non-intersecting ids
								for (; a_m1[i_m1] < i_o; i_m1++) {
									if (i_m1 === n_m1) {
										debugger;
										// no more intersections
										break find_intersections;
									}
								}
								// intersection
								if (a_m1[i_m1] === i_o) {
									debugger;
									// extend b
									h_row_c = Object.create(h_row_b);
									// save marked
									h_row_c[s_mark_o] = k_graph.o(i_o);
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
		}
		// POS
		else if (HP_USE_POS === hp_data_use) {
			if (!k_graph.data_po) {
				throw 'Query requires the POS triples index to be built.';
			}
			// mk iteration generators
			let f_p = this.iterate_a(h_p, 'p');
			let {
				gen: f_o,
				data: h_data_b,
			} = this.iterate_b(h_o, 'o', 'po');
			let f_s = this.iterate_c(h_s, 's', 'p_os');
			let s_save_b = h_data_b && h_data_b.save;
			let k_data_instance_b;
			if (s_save_b) k_data_instance_b = h_o.data.plugin.instance;
			let b_extend_b = s_mark_o || s_save_b;
			// head is marked
			if (h_head.mark) {
				// iterate a
				for (let {
						id: i_p,
						row: h_row_a
					} of f_p(h_row__)) {
					// iterate b
					for (let [i_o, c_offset_data_po] of f_o(i_p)) {
						let h_row_b = h_row_a;
						// b is marked
						if (s_mark_o) {
							// extend row a
							h_row_b = Object.create(h_row_a);
							// save marked
							h_row_b[s_mark_o] = k_graph.o(i_o);
						}
						// b is saved
						if (s_save_b) {
							h_row_b[s_save_b] = k_data_instance_b.load(i_o);
						}
						let i_m1 = 0;
						find_intersections:
							// iterate c
							for (let {
									id: i_s,
									row: h_row_c
								} of f_s(i_p, c_offset_data_po, h_row_b)) {
								// skip over non-intersecting ids
								for (; a_m1[i_m1] < i_s; i_m1++) {
									if (i_m1 === n_m1) {
										debugger;
										// no more intersections
										break find_intersections;
									}
								}
								// intersection
								if (a_m1[i_m1] === i_s) {
									debugger;
									// extend b
									h_row_c = Object.create(h_row_b);
									// save marked
									h_row_c[s_mark_s] = k_graph.s(i_s);
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
		}
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
				this.proceed(k_pattern_frag, new Row(), h_head);
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
				return this.proceed(k_pattern, new Row(), h_head);
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
				let f_e = this.iterate_a(h_head, s_term);
				//
				let s_save = h_data && h_data.save;
				// no mark, no save
				if (!s_mark && !s_save) return [];
				// results list
				let a_results = [];
				for (let {
						id: i_e,
						row: h_row
					} of f_e(new Row())) {
					a_results.push(h_row);
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
			h_row__ = new Row();
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
		let b_inverse = false;
		let x_triple_pattern = 0;
		let h_s;
		let h_o;
		// predicate(s) of triple pattern
		let h_p = k_pattern.shift();
		// Vp
		if (h_p.range) x_triple_pattern |= 2;
		// tail of triple pattern
		let h_tail = k_pattern.shift();
		// end of pattern sequence
		let b_terminate = !k_pattern.length;
		// body is normal direction
		if (HP_PREDICATE === h_p.type) {
			// Vs
			if (h_head.range) x_triple_pattern |= 4;
			// claim subjects
			h_s = h_head;
			// Vo
			if (h_tail.range) x_triple_pattern |= 1;
			// claim objects
			h_o = h_tail;
		}
		// body is inverse direction
		else {
			b_inverse = true;
			// Vo
			if (h_head.range) x_triple_pattern |= 1;
			// claim objects
			h_o = h_head;
			// Vs
			if (h_tail.range) x_triple_pattern |= 4;
			// claim subjects
			h_s = h_tail;
		}
		//
		let hp_data_use = A_DATA_MAP[x_triple_pattern];
		// ref markings
		let s_mark_s = h_s.mark;
		let s_mark_p = h_p.mark;
		let s_mark_o = h_o.mark;
		// save which heads were used and their associated rows
		let h_results = {};
		// SPO
		if (HP_USE_SPO === hp_data_use) {
			if (!k_graph.data_sp) {
				throw 'Query requires the POS triples index to be built.';
			}
			// mk iteration generators
			let f_s = this.iterate_a(h_s, 's');
			let {
				gen: f_p,
				data: h_data_b,
			} = this.iterate_b(h_p, 'p', 'sp');
			let f_o = this.iterate_c(h_o, 'o', 's_po');
			let s_save_b = h_data_b && h_data_b.save;
			let k_data_instance_b;
			if (s_save_b) k_data_instance_b = h_p.data.plugin.instance;
			let b_extend_b = s_mark_p || s_save_b;
			// bidirectional set intersection
			if (!h_s.range && !h_p.range && h_o.range && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
				// set m1
				let a_m1 = [];
				// iterate a
				for (let {
						id: i_s,
						row: h_row_a
					} of f_s(h_row__)) {
					let a_heads = h_results[i_s] = [];
					// iterate b
					for (let [i_p, c_offset_data_sp] of f_p(i_s)) {
						let h_row_b = h_row_a;
						// b is marked
						if (s_mark_p) {
							// extend row a
							h_row_b = Object.create(h_row_a);
							// save marked
							h_row_b[s_mark_p] = k_graph.p(i_p);
						}
						// b is saved
						if (s_save_b) {
							h_row_b[s_save_b] = k_data_instance_b.load(i_p);
						}
						// iterate c
						for (let {
								id: i_o,
								row: h_row_c
							} of f_o(i_s, c_offset_data_sp, h_row_b)) {
							// accumulate ids to m1
							a_m1.push(i_o);
						}
						// compute intersection between m1 and m2
						a_heads.push(...this.intersection(k_pattern, h_row_b, h_tail, a_m1));
					}
				}
			} else {
				// iterate a
				for (let {
						id: i_s,
						row: h_row_a
					} of f_s(h_row__)) {
					// iterate b
					for (let [i_p, c_offset_data_sp] of f_p(i_s)) {
						let h_row_b = h_row_a;
						// b is marked
						if (s_mark_p) {
							// extend row a
							h_row_b = Object.create(h_row_a);
							// save marked
							h_row_b[s_mark_p] = k_graph.p(i_p);
						}
						// b is saved
						if (s_save_b) {
							h_row_b[s_save_b] = k_data_instance_b.load(i_p);
						}
						// iterate c
						for (let {
								id: i_o,
								row: h_row_c
							} of f_o(i_s, c_offset_data_sp, h_row_b)) {
							// ref head(s)
							let i_head = b_inverse ? i_o : i_s;
							let a_heads = h_results[i_head];
							if (!a_heads) a_heads = h_results[i_head] = [];
							// tail has probes
							if (h_o.probes) {
								// simulate pattern head just for probe
								let h_sim_c = {
									id: i_o,
									probes: h_o.probes,
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
									id: i_o,
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
		// POS
		else if (HP_USE_POS === hp_data_use) {
			if (!k_graph.data_po) {
				throw 'Query requires the POS triples index to be built.';
			}
			// mk iteration generators
			let f_p = this.iterate_a(h_p, 'p');
			let {
				gen: f_o,
				data: h_data_b,
			} = this.iterate_b(h_o, 'o', 'po');
			let f_s = this.iterate_c(h_s, 's', 'p_os');
			let s_save_b = h_data_b && h_data_b.save;
			let k_data_instance_b;
			if (s_save_b) k_data_instance_b = h_o.data.plugin.instance;
			let b_extend_b = s_mark_o || s_save_b;
			// bidirectional set intersection
			if (!h_p.range && !h_o.range && h_s.range && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
				// set m1
				let a_m1 = [];
				// iterate a
				for (let {
						id: i_p,
						row: h_row_a
					} of f_p(h_row__)) {
					let a_heads = h_results[i_p] = [];
					// iterate b
					for (let [i_o, c_offset_data_po] of f_o(i_p)) {
						let h_row_b = h_row_a;
						// b is marked
						if (s_mark_o) {
							// extend row a
							h_row_b = Object.create(h_row_a);
							// save marked
							h_row_b[s_mark_o] = k_graph.o(i_o);
						}
						// b is saved
						if (s_save_b) {
							h_row_b[s_save_b] = k_data_instance_b.load(i_o);
						}
						// iterate c
						for (let {
								id: i_s,
								row: h_row_c
							} of f_s(i_p, c_offset_data_po, h_row_b)) {
							// accumulate ids to m1
							a_m1.push(i_s);
						}
						// compute intersection between m1 and m2
						a_heads.push(...this.intersection(k_pattern, h_row_b, h_tail, a_m1));
					}
				}
			} else {
				// iterate a
				for (let {
						id: i_p,
						row: h_row_a
					} of f_p(h_row__)) {
					// iterate b
					for (let [i_o, c_offset_data_po] of f_o(i_p)) {
						let h_row_b = h_row_a;
						// b is marked
						if (s_mark_o) {
							// extend row a
							h_row_b = Object.create(h_row_a);
							// save marked
							h_row_b[s_mark_o] = k_graph.o(i_o);
						}
						// b is saved
						if (s_save_b) {
							h_row_b[s_save_b] = k_data_instance_b.load(i_o);
						}
						// iterate c
						for (let {
								id: i_s,
								row: h_row_c
							} of f_s(i_p, c_offset_data_po, h_row_b)) {
							// ref head(s)
							let i_head = b_inverse ? i_s : i_p;
							let a_heads = h_results[i_head];
							if (!a_heads) a_heads = h_results[i_head] = [];
							// tail has probes
							if (h_s.probes) {
								// simulate pattern head just for probe
								let h_sim_c = {
									id: i_s,
									probes: h_s.probes,
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
									id: i_s,
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
		// OSP
		else {
			if (!k_graph.data_os) {
				throw 'Query requires the OSP triples index to be built.';
			}
			// mk iteration generators
			let f_o = this.iterate_a(h_o, 'o');
			let {
				gen: f_s,
				data: h_data_b,
			} = this.iterate_b(h_s, 's', 'os');
			let f_p = this.iterate_c(h_p, 'p', 'o_sp');
			let s_save_b = h_data_b && h_data_b.save;
			let k_data_instance_b;
			if (s_save_b) k_data_instance_b = h_s.data.plugin.instance;
			let b_extend_b = s_mark_s || s_save_b;
			// bidirectional set intersection
			if (!h_o.range && !h_s.range && h_p.range && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
				// set m1
				let a_m1 = [];
				// iterate a
				for (let {
						id: i_o,
						row: h_row_a
					} of f_o(h_row__)) {
					let a_heads = h_results[i_o] = [];
					// iterate b
					for (let [i_s, c_offset_data_os] of f_s(i_o)) {
						let h_row_b = h_row_a;
						// b is marked
						if (s_mark_s) {
							// extend row a
							h_row_b = Object.create(h_row_a);
							// save marked
							h_row_b[s_mark_s] = k_graph.s(i_s);
						}
						// b is saved
						if (s_save_b) {
							h_row_b[s_save_b] = k_data_instance_b.load(i_s);
						}
						// iterate c
						for (let {
								id: i_p,
								row: h_row_c
							} of f_p(i_o, c_offset_data_os, h_row_b)) {
							// accumulate ids to m1
							a_m1.push(i_p);
						}
						// compute intersection between m1 and m2
						a_heads.push(...this.intersection(k_pattern, h_row_b, h_tail, a_m1));
					}
				}
			} else {
				// iterate a
				for (let {
						id: i_o,
						row: h_row_a
					} of f_o(h_row__)) {
					// iterate b
					for (let [i_s, c_offset_data_os] of f_s(i_o)) {
						let h_row_b = h_row_a;
						// b is marked
						if (s_mark_s) {
							// extend row a
							h_row_b = Object.create(h_row_a);
							// save marked
							h_row_b[s_mark_s] = k_graph.s(i_s);
						}
						// b is saved
						if (s_save_b) {
							h_row_b[s_save_b] = k_data_instance_b.load(i_s);
						}
						// iterate c
						for (let {
								id: i_p,
								row: h_row_c
							} of f_p(i_o, c_offset_data_os, h_row_b)) {
							// ref head(s)
							let i_head = b_inverse ? i_p : i_o;
							let a_heads = h_results[i_head];
							if (!a_heads) a_heads = h_results[i_head] = [];
							// tail has probes
							if (h_p.probes) {
								// simulate pattern head just for probe
								let h_sim_c = {
									id: i_p,
									probes: h_p.probes,
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
									id: i_p,
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
		// return which heads were used
		return h_results;
	}
}
class FailedSelection extends Selection {}
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
		let ab_open = Buffer.allocUnsafe(0);
		let nl_open = 0;
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
		}
		// encode content
		let ab_content = encode_utf_auto(s_content);
		// join parts into word (if necessary)
		let ab_word = nl_open ? join_buffers(ab_open, ab_content) : ab_content;
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
		// ref predicates data
		let a_data_sp = k_graph.data_sp;
		// ref predicates data index
		let a_idx_sp = k_graph.idx_sp;
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
		// ref predicates data
		let a_data_sp = k_graph.data_sp;
		// ref predicates data index
		let a_idx_sp = k_graph.idx_sp;
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
		let ab_open = Buffer.allocUnsafe(0);
		let nl_open = 0;
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
		}
		// encode content
		let ab_content = encode_utf_auto(s_content);
		// join parts into word (if necessary)
		let ab_word = nl_open ? join_buffers(ab_open, ab_content) : ab_content;
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
		// ref predicates data
		let a_data_sp = k_graph.data_sp;
		// ref predicates data index
		let a_idx_sp = k_graph.idx_sp;
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
module.exports = {
	entrance(k_graph) {
		return new Entrance(k_graph);
	},
};