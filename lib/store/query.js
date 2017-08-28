/* eslint-disable */

@ // import linker macros
@include 'store.jmacs'


const HP_RANGE_ALL = Symbol('range:all');
const HP_RANGE_HOPS = Symbol('range:hops');
const HP_RANGE_NODES = Symbol('range:nodes');
const HP_RANGE_LITERALS = Symbol('range:literals');
const HP_RANGE_SOURCES = Symbol('range:subjects');
const HP_RANGE_SINKS = Symbol('range:objects');

const HP_HOP = Symbol('hop');
const HP_SUBJECT = Symbol('subject');
const HP_PREDICATE = Symbol('predicate');
const HP_INVERSE_PREDICATE = Symbol('inverse-predicate');
const HP_OBJECT = Symbol('object');

const HP_USE_SPO = Symbol('use:SPO');
const HP_USE_POS = Symbol('use:POS');
const HP_USE_OSP = Symbol('use:OSP');

const HP_INVALIDATE_ROW = Symbol('invalidated');

const A_DATA_MAP = [
	HP_USE_SPO,  // Ks Kp Ko : 0 0 0
	HP_USE_SPO,  // Ks Kp Vo : 0 0 1
	HP_USE_OSP,  // Ks Vp Ko : 0 1 0
	HP_USE_SPO,  // Ks Vp Vo : 0 1 1
	HP_USE_POS,  // Vs Kp Ko : 1 0 0
	HP_USE_POS,  // Vs Kp Vo : 1 0 1
	HP_USE_OSP,  // Vs Vp Ko : 1 1 0
	HP_USE_SPO,  // Vs Vp Vo : 1 1 1
];


@{encoders()}
@{buffer_utils()}


@macro iterate_a(no_row)
	// iterate a
	@if no_row
		for(let i_a of f_a()) {
	@else
		for(let {id:i_a, row:h_row_a} of f_a(h_row__)) {
	@end
@end

@macro iterate_b(no_row)
	// iterate b
	@if no_row
		for(let {id: i_b, offset: c_off_b} of f_b(i_a)) {
	@else
		for(let {id: i_b, row: h_row_b, offset: c_off_b} of f_b(i_a, h_row_a)) {
	@end
@end

@macro iterate_c(no_row)
	// iterate c
	@if no_row
		for(let i_c of f_c(i_a, c_off_b)) {
	@else
		for(let {id:i_c, row:h_row_c} of f_c(i_a, c_off_b, h_row_b)) {
	@end
@end

@macro end_iterate()
	}
@end


@macro prep_generator_a(style)
	let f_a = this.generate_a_@{style}(h_a, k_triples.a);
@end

@macro prep_generator_b(style)
	let f_b = this.generate_b_@{style}(h_b, k_triples);
@end

@macro prep_generator_c(style)
	let f_c = this.generate_c_@{style}(h_c, k_triples);
@end

@macro prep_generators_abc(style)
	@{prep_generator_a(style)}
	@{prep_generator_b(style)}
	@{prep_generator_c(style)}
@end


@macro mk_proceed_eval(yield)
	// end of pattern sequence?
	let b_terminate = !k_pattern.length;

	// mk iteration generators
	@{prep_generator_a('rows')}
	@{prep_generator_b('rows')}

	// bidirectional set intersection
	if(!h_a.range && !h_b.range && h_c.range  && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
		@{prep_generator_c('ids')}

		// set m1
		let a_m1 = [];

		@{iterate_a()}
			let a_heads = h_results[i_a] = [];
			@{iterate_b()}
				@{iterate_c(true)}
					// accumulate ids to m1
					a_m1.push(i_c);
				@{end_iterate()}

				// compute intersection between m1 and m2
				a_heads.push(...this.intersection(k_pattern, h_row_b, h_tail, a_m1));
			@{end_iterate()}
		@{end_iterate()}
	}
	else {
		@{prep_generator_c('rows')}

		@{iterate_a()}
			@{iterate_b()}
				@{iterate_c()}
					// ref head(s)
					let i_head = b_inverse? i_c: i_a;
					let a_heads = h_results[i_head];
					if(!a_heads) a_heads = h_results[i_head] = [];

					// tail has forks
					if(h_c.forks) {	
						// simulate pattern head just for fork
						let h_sim_c = {
							id: i_c,
							type: h_c.type,
							forks: h_c.forks,
						};

						// fork all of c
						let h_survivors = this.fork(k_pattern, h_row_c, h_sim_c);
						if(h_survivors.size) {
							for(let i_tail in h_survivors) {
								let a_survivors = h_survivors[i_tail];
								@{each('survivor', 'a')}
									@if yield
										yield a_survivor;
									@else
										a_heads.push(a_survivor);
									@end
								@{end_each()}
							}
						}
					}
					// reached end of pattern; push the current row
					else if(b_terminate) {
						@if yield
							yield h_row_c;
						@else
							// save row
							a_heads.push(h_row_c);
						@end
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
						for(let i_survivor in h_survivors) {
							@if yield
								yield* h_survivors[i_survivor];
							@else
								// push all onto this super-head's list
								a_heads.push(...h_survivors[i_survivor]);
							@end
						}
					}
				@{end_iterate()}
			@{end_iterate()}
		@{end_iterate()}
	}
@end


@macro mk_generator_a_range_yield(rows, no_data)
	// skip entity if filter rejectes reconstructed term
	if(f_filter && !f_filter(k_graph[s_term](i_a))) continue;

	@if rows
		// assume not marked
		let h_row_a = h_row__;

		@if no_data
			// marked
			if(s_mark) {
				// branch row
				h_row_a = Object.create(h_row__);

				// store marked
				h_row_a[s_mark] = k_graph[s_term](i_a);
			}
		@else
			// marked / saved
			if(b_store) {
				// branch row
				h_row_a = Object.create(h_row__);

				// store marked
				if(s_mark) {
					h_row_a[s_mark] = k_graph[s_term](i_a);
				}

				// store saved
				if(s_save) {
					h_row_a[s_save] = k_instance.load(i_a);
				}
			}
		@end

		// yield
		yield {
			id: i_a,
			row: h_row_a,
		};
	@else
		yield i_a;
	@end
@end



@macro mk_generator_a(rows)
	generate_a_@{rows? 'rows': 'ids'}(h_entity, s_term) {
		let k_graph = this.graph;

		// ref entity attributes
		@if rows
			let s_mark = h_entity.mark;
		@end
		let s_join = h_entity.join;
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;

		// K*[1]
		if(h_entity.id) {
			let i_a = h_entity.id;

			// user bound a filter
			if(f_filter) {
				// filter rejects reconstructed term
				if(!f_filter(k_graph[s_term](i_a))) {
					// empty generator
					return function*(){};
				}
			}

			// user bound a data handler
			if(h_data) {
				@{mk_checker()}

				// apply plugin handler; action dissaproves of this entity
				if(f_evaluate  && !f_evaluate(i_a)) {
					// empty generator
					return function*(){};
				}

				@if rows
					// data saves entity
					if(h_checker.save) {
						let k_instance = k_plugin.instance;
						let s_save = h_checker.save;

						// mk entity generator
						return function*(h_row__) {
							let h_row_a = Object.create(h_row__);

							// store saved
							h_row_a[s_save] = k_instance.load(i_a);

							// entity is marked; store marked
							if(s_mark) h_row_a[s_mark] = k_graph[s_term](i_a);

							// simply return entity id (already known to be a valid entity)
							yield {
								id: i_a,
								row: h_row_a,
							};
						};
					}
				@end
			}

			// mk entity generator
			return function*(h_row__) {
				@if rows
					// assume not marked
					let h_row_a = h_row__;

					// entity is marked
					if(s_mark) {
						h_row_a = Object.create(h_row__);

						// store marked
						h_row_a[s_mark] = k_graph[s_term](i_a);
					}

					// entity will be joined
					if(s_join) {
						debugger;
					}

					// simply return entity id (already known to be a valid entity)
					yield {
						id: i_a,
						row: h_row_a,
					};
				@else
					yield i_a;
				@end
			};
		}
		// K*[+]
		else if(h_entity.ids) {
			let a_entity_ids = h_entity.ids;

			// user bound a filter
			if(f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				@{each('entity_id', 'i', 'a')}
					// entity passes filter test
					if(f_filter(k_graph[s_tream](i_a))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_a);
					}
				@{end_each()}

				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}

			// user bound a data handler
			if(h_data) {
				@{mk_checker()}

				// filter entities
				if(f_evaluate) {
					let a_entity_ids_cleaned = [];
					@{each('entity_id', 'i', 'a')}
						// entity passes plugin test
						if(f_evaluate(i_a)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_a);
						}
					@{end_each()}

					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}

				@if rows
					// data saves entity
					if(h_checker.save) {
						let s_save = h_checker.save;
						let k_instance = k_plugin.instance;

						// mk entity generator
						return function*(h_row__) {
							// simply iterate each entity node id (already known to be valid entities)
							@{each('entity_id', 'i', 'a')}
								// branch row
								let h_row_a = Object.create(h_row__);

								// store saved
								h_row_a[s_save] = k_instance.load(i_a);

								// store marked
								if(s_mark) h_row_a[s_mark] = k_graph[s_term](i_a);

								// yield
								yield {
									id: i_a,
									row: h_row_a,
								};
							@{end_each()}
						};
					}
				@end
			}

			// mk entity generator
			return function*(h_row__) {
				// simply iterate each entity node id (already known to be valid entities)
				@{each('entity_id', 'i', 'a')}
					@if rows
						// assume not marked
						let h_row_a = h_row__;

						// marked
						if(s_mark) {
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
					@else
						yield i_a;
					@end
				@{end_each()}
			};
		}
		// V*
		else {
			let hp_entity_type = h_entity.type;
			let hp_entity_range = h_entity.range;

			let i_start = 1;
			let i_stop;

			// V*[all]
			if(HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if(HP_SUBJECT === hp_entity_type) {
					i_stop = k_graph.range_s;
				}
				// for objects
				else if(HP_OBJECT === hp_entity_type) {
					i_stop = k_graph.range_l;
				}
				// for predicates
				else {
					i_stop = k_graph.range_p;
				}
			}
			// V*[hops]
			else if(HP_RANGE_HOPS === hp_entity_range) {
				i_stop = k_graph.range_d;
			}
			// V*[literals]
			else if(HP_RANGE_LITERALS === hp_entity_range) {
				i_start = k_graph.range_o;
				i_stop = k_graph.range_l;
			}
			// V*[subjects]
			else if(HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[objects]
			else if(HP_RANGE_SINKS === hp_entity_range) {
				i_stop = k_graph.range_o;
			}
			// V*[custom]
			else if(HP_RANGE_CUSTOM === hp_entity_range) {
				i_start = h_entity.start;
				i_stop = h_entity.stop;
			}
			// ??
			else {
				throw 'invalid variable subject type. only expected {ALL, HOPS}; found '+hp_entity_range;
			}

			if(h_data) {
				// evaluate data find
				let k_plugin = h_data.plugin;
				let h_found = k_plugin.find(h_data.action, i_start, i_stop);
				@if rows
					let k_instance = k_plugin.instance;
					let s_save = h_found.save;
				@end

				// found a range
				if(h_found.range) {
					let h_range = h_found.range;

					// narrow range
					i_start = Math.max(i_start, h_range.low);
					i_stop = Math.min(i_stop, h_range.high);

					// mk entity generator
					return function*(h_row__) {
						// each and every entity node
						for(let i_a=i_start; i_a<i_stop; i_a++) {
							@{mk_generator_a_range_yield(rows)}
						}
					};
				}
				// found a list of ids
				else if(h_found.ids) {
					let a_found_ids = h_found.ids;

					// mk entity generator
					return function*(h_row__) {
						// each found entity id
						@{each('found_id', 'i', 'a')}
							@{mk_generator_a_range_yield(rows)}
						@{end_each()}
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
					for(let i_a=i_start; i_a<i_stop; i_a++) {
						@{mk_generator_a_range_yield(rows, true)}
					}
				};
			}
		}
	}
@end


@macro mk_generator_b(rows)
	generate_b_@{rows? 'rows': 'ids'}(h_entity, k_triples) {
		let k_graph = this.graph;

		let s_term = k_triples.b;

		// ref entity attributes
		@if rows
			let s_mark = h_entity.mark;
		@end
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;

		// K*[1]
		if(h_entity.id) {
			let i_b = h_entity.id;

			// user bound a filter
			if(f_filter) {
				// filter rejects reconstructed term
				if(!f_filter(k_graph[s_term](i_b))) {
					// empty generator
					return function*() {};
				}
			}

			// user bound a data handler
			if(h_data) {
				@{mk_checker()}

				// apply plugin handler; action dissaproves of this entity
				if(f_evaluate && !f_evaluate(i_b)) {
					// empty generator
					return function*() {};
				}

				@if rows
					// data saves entity
					if(h_checker.save) {
						let s_save = h_checker.save;
						let k_instance = k_plugin.instance;

						// mk entity generator
						return function*(i_a, h_row_a) {
							// search data table for given entity
							let c_off_b = k_triples.find_b(i_a, i_b);
							if(c_off_b >= 0) {
								// branch row
								let h_row_b = Object.create(h_row_a);

								// store saved
								h_row_b[s_save] = k_instance.load(i_b);

								// store marked
								if(s_mark) h_row_b[s_mark] = k_graph[s_term](i_b);

								// yield
								yield {
									id: i_b,
									row: h_row_b,
									offset: c_off_b,
								};
							}
						};
					}
				@end
			}

			// mk entity generator
			return function*(i_a, h_row_a) {
				// search data table for given entity
				let c_off_b = k_triples.find_b(i_a, i_b);
				if(c_off_b >= 0) {
					@if rows
						// assume not marked
						let h_row_b = Object.create(h_row_a);

						// marked
						if(s_mark) {
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
					@else
						yield {
							id: i_b,
							offset: c_off_b,
						};
					@end
				}
			};
		}
		// K*[+]
		else if(h_entity.ids) {
			let a_entity_ids = h_entity.ids;

			// user bound a filter
			if(f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				@{each('entity_id', 'i', 'b')}
					// entity passes filter test
					if(f_filter(k_graph[s_tream](i_b))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_b);
					}
				@{end_each()}

				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}

			// user bound a data handler
			if(h_data) {
				@{mk_checker()}

				// filter entities
				if(f_evaluate) {
					let a_entity_ids_cleaned = [];
					@{each('entity_id', 'i', 'b')}
						// entity passes plugin test
						if(h_checker.evaluate(f_action, i_b)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_b);
						}
					@{end_each()}

					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}

				@if rows
					// data save
					if(h_data.save) {
						let k_instance = k_plugin.instance;
						let s_save = h_data.save;

						return function*(i_a, h_row_a) {
							// copy ids list
							let a_search_ids = a_entity_ids.slice();

							// search data table for given entities
							for(let {id: i_b, offset: c_off_b} of k_triples.each_b(i_a)) {
								// found a target entity
								let i_found_entity = a_search_ids.indexOf(i_b);
								if(-1 !== i_found_edge) {
									// delete from search list
									a_search_ids.splice(i_found_entity, 1);

									// branch row
									let h_row_b = Object.create(h_row_a);

									// store saved
									h_row_b[s_save] = k_instance.load(i_b);

									// store marked
									if(s_mark) h_row_b[s_mark] = k_graph[s_term](i_b);

									// yield
									yield {
										id: i_b,
										row: h_row_b,
										offset: c_off_b,
									};

									// found all ids; stop searching
									if(!a_search_ids.length) break;
								}
							}
						};
					}
				@end
			}

			// mk entity generator
			return function*(i_a, h_row_a) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();

				// search data table for given entities
				for(let {id: i_b, offset: c_off_b} of k_triples.each_b(i_a)) {
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_b);
					if(-1 !== i_found_edge) {
						// delete from search list
						a_search_ids.splice(i_found_entity, 1);

						@if rows
							// assume not marked
							let h_row_b = h_row_a;

							// marked
							if(s_mark) {
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
						@else
							yield {
								id: i_b,
								offset: c_off_b,
							};
						@end

						// found all ids; stop searching
						if(!a_search_ids.length) break;
					}
				}
			};
		}
		// Vp
		else {
			let hp_entity_type = h_entity.type;
			let hp_entity_range = h_entity.range;

			// yes data
			let f_evaluate;
			@if rows
				let s_save, k_instance;
			@end
			if(h_data) {
				let k_plugin = h_data.plugin;
				let f_action = h_data.action;
				@if rows
					k_instance = k_plugin.instance;
				@end

				if(k_plugin.has_exclusive_ranges) {
					let a_ranges = k_plugin.ranges_within(i_start, i_stop);

					// data incompatible with selection criteria
					if(!a_ranges.length) {
						return function*() {};
					}
					// single range!
					else if(1 === a_ranges.length) {
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
				@if rows
					s_save = h_checker.save;
				@end
			}

			@if rows
				// this entity will store something to row
				let b_store = s_mark || s_save;
			@end

			// Vp[all]
			if(HP_RANGE_ALL === hp_entity_range) {
				// mk entity generator
				return function*(i_a, h_row_a) {
					for(let {id: i_b, offset: c_off_b} of k_triples.each_b(i_a)) {
						// filter rejects reconstructed term; skip
						if(f_filter && !f_filter(k_graph[s_term](i_b))) continue;

						@if rows
							// assume not marked / saved
							let h_row_b = h_row_a;

							// marked
							if(b_store) {
								// branch row
								h_row_b = Object.create(h_row_a);

								// store marked
								if(s_mark) h_row_b[s_mark] = k_graph[s_term](i_b);

								// store saved
								if(s_save) h_row_b[s_save] = k_instance.load(i_b);
							}

							// yield
							yield {
								id: i_b,
								row: h_row_b,
								offset: c_off_b,
							};
						@else
							yield {
								id: i_b,
								offset: c_off_b,
							};
						@end
					}
				};
			}
			// V*[custom]
			else if(HP_RANGE_CUSTOM === hp_entity_range) {
				let i_start = h_entity.start;
				let i_stop = h_entity.stop;

				// mk entity iterator
				return function*(i_a, h_row_a) {
					// search data table for given range
					for(let {id: i_b, offset: c_off_b} of k_triples.each_b(i_a)) {
						// too low (not in range yet)
						if(i_b < i_start) continue;

						// too high (out of range)
						if(i_b >= i_stop) break;

						// filter rejects reconstructed term; skip
						if(f_filter && !f_filter(k_graph[s_term](i_b))) continue;

						@if rows
							// assume not marked / saved
							let h_row_b = h_row_a;

							// marked
							if(b_store) {
								// branch row
								h_row_b = Object.create(h_row_a);

								// store marked
								if(s_mark) h_row_b[s_mark] = k_graph[s_term](i_b);

								// store saved
								if(s_save) h_row_b[s_save] = k_instance.load(i_b);
							}

							// yield
							yield {
								id: i_b,
								row: h_row_b,
								offset: c_off_b,
							};
						@else
							// accepted
							yield {
								id: i_b,
								offset: c_off_b,
							};
						@end
					}
				};
			}
			// ??
			else {
				throw 'invalid variable subject type. only expected {ALL, CUSTOM}';
			}
		}
	}
@end


@macro mk_generator_c(rows)
	generate_c_@{rows? 'rows': 'ids'}(h_entity, k_triples) {
		let k_graph = this.graph;
		let h_joins = this.joins;

		let s_term = k_triples.c;

		// ref entity attributes
		@if rows
			let s_mark = h_entity.mark;
		@end
		let s_join = h_entity.join;
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;

		// K*[1]
		if(h_entity.id) {
			let i_c = h_entity.id;

			// user bound a filter
			if(f_filter) {
				// filter rejects reconstructed term
				if(!f_filter(k_graph[s_term](i_c))) {
					// empty generator
					return function*() {};
				}
			}

			// user bound a data handler
			if(h_data) {
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;

				// apply plugin handler; action dissaproves of this entity
				if(f_evaluate  && !f_evaluate(i_c)) {
					// empty generator
					return function*(){};
				}

				@if rows
					// data save
					if(h_checker.save) {
						let k_instance = k_plugin.instance;
						let s_save = h_checker.save;

						// mk entity generator
						return function*(i_a, c_off_b, h_row_b) {
							// search data table for given entity
							if(k_triples.has_c(i_a, c_off_b, i_c)) {
								// branch row
								let h_row_c = Object.create(h_row_b);

								// store saved
								h_row_c[s_save] = k_instance.load(i_c);

								// store marked
								if(s_mark) h_row_c[s_mark] = k_graph[s_term](i_c);

								// yield
								yield {
									id: i_c,
									row: h_row_c,
								};
							}
						};
					}
				@end
			}

			// mk entity generator
			return function*(i_a, c_off_b, h_row_b) {
				// search data table for given entity
				if(k_triples.has_c(i_a, c_off_b, i_c)) {
					@if rows
						let h_row_c = h_row_b;

						// marked
						if(s_mark) {
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
					@else
						yield i_c;
					@end
				}
			};
		}
		// K*[+]
		else if(h_entity.ids) {
			let a_entity_ids = h_entity.ids;

			// user bound a filter
			if(f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				@{each('entity_id', 'i', 'c')}
					// entity passes filter test
					if(f_filter(k_graph[s_tream](i_c))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_c);
					}
				@{end_each()}

				// reassign id set
				a_entity_ids = a_entity_ids_cleaned;
			}

			// user bound a data handler
			if(h_data) {
				// plugin data checker
				let k_plugin = h_data.plugin;
				let h_checker = k_plugin.checker(h_data.action);
				let f_evaluate = h_checker.evaluate;

				// filter entities
				if(f_evaluate) {
					let a_entity_ids_cleaned = [];
					@{each('entity_id', 'i', 'b')}
						// entity passes plugin test
						if(f_evaluate(i_c)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_c);
						}
					@{end_each()}

					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}

				@if rows
					// data save
					if(h_checker.save) {
						let k_instance = k_plugin.instance;
						let s_save = h_checker.save;

						// mk entity generator
						return function*(i_a, c_off_b, h_row_b) {
							// copy ids list
							let a_search_ids = a_entity_ids.slice();

							// search data table for given entities
							for(let i_c of k_triples.each_c(i_a, c_off_b)) {
								// found a target entity
								let i_found_entity = a_search_ids.indexOf(i_c);
								if(-1 !== i_found_edge) {
									// delete from search list
									a_search_ids.splice(i_found_entity, 1);

									// branch row
									let h_row_c = Object.create(h_row_b);

									// store saved
									h_row_c[s_save] = k_instance.load(i_c);

									// store marked
									if(s_mark) h_row_c[s_mark] = k_graph[s_term](i_c);

									// yield
									yield {
										id: i_c,
										row: h_row_c,
									};

									// found all ids; stop searching
									if(!a_search_ids.length) break;
								}
							}
						};
					}
				@end
			}

			// mk entity generator
			return function*(i_a, c_off_b, h_row_b) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();

				// search data table for given entities
				for(let i_c of k_triples.each_c(i_a, c_off_b)) {
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_c);
					if(-1 !== i_found_edge) {
						// delete from search list
						a_search_ids.splice(i_found_entity, 1);

						@if rows
							// assume not marked
							let h_row_c = h_row_b;

							// marked
							if(s_mark) {
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
						@else
							yield i_c;
						@end

						// found all ids; stop searching
						if(!a_search_ids.length) break;
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
			if(HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if(HP_SUBJECT === hp_entity_type) {
					i_stop = k_graph.range_s;
				}
				// for objects
				else {
					i_stop = i_high_range;
				}
			}
			// V*[hops]
			else if(HP_RANGE_HOPS === hp_entity_range) {
				i_stop = k_graph.range_d;
			}
			// V*[literals]
			else if(HP_RANGE_LITERALS === hp_entity_range) {
				i_start = k_graph.range_o;
				i_stop = i_high_range;
			}
			// V*[subjects]
			else if(HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[objects]
			else if(HP_RANGE_SINKS === hp_entity_range) {
				i_stop = k_graph.range_o;
			}
			// V*[custom]
			else if(HP_RANGE_CUSTOM === hp_entity_range) {
				i_start = h_entity.start;
				i_stop = h_entity.stop;
			}
			// ??
			else {
				throw 'invalid variable subject type. only expected {ALL, HOPS}';
			}

			// yes data
			let f_evaluate;
			@if rows
				let s_save, k_instance;
			@end
			if(h_data) {
				let k_plugin = h_data.plugin;
				let f_action = h_data.action;
				@if rows
					k_instance = k_plugin.instance;
				@end

				if(k_plugin.has_exclusive_ranges) {
					let a_ranges = k_plugin.ranges_within(i_start, i_stop);

					// data incompatible with selection criteria
					if(!a_ranges.length) {
						return function*() {};
					}
					// single range!
					else if(1 === a_ranges.length) {
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
				@if rows
					s_save = h_checker.save;
				@end
			}

			@if rows
				// this entity will store something to row
				let b_store = s_mark || s_save;
			@end

			// prep to store joins
			let as_join = null;
			if(s_join && h_joins[s_join]) {
				let h_join = h_joins[s_join];

				// not overwriting the index
				if(h_entity.index !== h_join.index) {
					let h_yields = h_join.yields;
					as_join = new Set();
					for(let s_id in h_yields) {
						as_join.add(+s_id);
					}
				}
				else {
					// debugger;
				}
			}

			// list of yields
			let a_yields = [];

			// mk entity generator
			return function*(i_a, c_off_b, h_row_b) {
				for(let i_c of k_triples.each_c(i_a, c_off_b)) {
					// too low (not in range yet)
					if(i_c < i_start) continue;

					// to high (out of range)
					if(i_c >= i_stop) break;

					// filter rejects reconstructed term; skip
					if(f_filter && !f_filter(k_graph[s_term](i_c))) continue;

					// data evaluate
					if(f_evaluate && !f_evaluate(i_c)) continue;

					@if rows
						// assume not marked / saved
						let h_row_c = h_row_b;

						// marked / saved
						if(b_store) {
							// branch row
							h_row_c = Object.create(h_row_b);

							// store marked
							if(s_mark) {
								h_row_c[s_mark] = k_graph[s_term](i_c);
							}

							// store saved
							if(s_save) {
								h_row_c[s_save] = k_instance.load(i_c);
							}
						}

						// yield row
						let h_yield = {
							id: i_c,
							row: h_row_c,
						};

						// joins
						if(s_join) {
// debugger;
							// there is a previous set
							if(as_join) {
								// entity does not exist in previous set
								if(!as_join.has(i_c)) {
									// skip it
									continue;
								}
								// otherwise, remove entity from set
								else {
									as_join.delete(i_c);
								}
							}

							// push entity to list
							a_yields.push(h_yield);
						}

						// yield
						yield h_yield;
					@else
						yield i_c;
					@end
				}

				// now create joins set or delete old & unused entries
				if(s_join) {
// debugger;
					// sort list
					a_yields.sort(F_SORT_DISTINCT_ID);

					// a previous set exists
					if(as_join) {
						let h_join = h_joins[s_join];
// debugger;

						// make sure types are compatible
						if(h_join.type !== hp_entity_type) {
							throw 'incompatible join types';
						}

						// things need to be deleted
						if(as_join.size) {
// debugger;
							// invalidate all rows that were not joined
							for(let i_c of as_join) {
								// debugger;
								h_join.yields[i_c][HP_INVALIDATE_ROW] = 1;
							}
						}
					}
					// no such join yet
					else {
						// transform array of {id, row} --> hash[id] => row
						let h_yields = {};
						for(let i_yield=0, nl_yields=a_yields.length; i_yield<nl_yields; i_yield++) {
							let h_yield = a_yields[i_yield];
							h_yields[h_yield.id] = h_yield.row;
						}

						h_joins[s_join] = {
							yields: h_yields,
							type: hp_entity_type,
							index: h_entity.index,
						};
					}
				}
			};
		}
	}
@end


@macro mk_checker()
	// data plugin checker
	let k_plugin = h_data.plugin;
	let h_checker = k_plugin.checker(h_data.action);
	let f_evaluate = h_checker.evaluate;
@end

class Selection {
	constructor(k_graph, k_pattern) {
		this.graph = k_graph;
		this.pattern = k_pattern;
		this.joins = Object.create(null);
	}

	rows() {
		let a_fields = this.pattern.fields();

		//
		let h_results = this.consume(this.pattern);
		let a_rows = [];
		for(let i_head in h_results) {
			let a_survivors = h_results[i_head];
			@{each('survivor', 'h')}
				// if(!(HP_INVALIDATE_ROW in h_survivor)) {
					a_rows.push(h_survivor);
				// }
				// else {
				// 	debugger;
				// }
			@{end_each()}
		}
		a_rows.fields = a_fields;
		return a_rows;
	}

	distinct(s_field) {
		let as_distinct = new Set();
		this.rows().forEach((h_row) => {
			as_distinct.add(h_row[s_field].terse(this.graph.user_prefix_iris));
		});

		return Array.from(as_distinct);
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
		if(HP_PREDICATE === h_edge.type) {
			// Vs
			if(h_head.range) x_triple_pattern |= 4;

			// Vo
			if(h_tail.range) x_triple_pattern |= 1;
		}
		// body is inverse direction
		else {
			b_inverse = true;

			// Vo
			if(h_head.range) x_triple_pattern |= 1;

			// Vs
			if(h_tail.range) x_triple_pattern |= 4;
		}

		// Vp
		if(h_edge.range) x_triple_pattern |= 2;


		// place the subject, predicate and object appropriately
		let h_spo = {
			// claim subjects
			s: b_inverse? h_tail: h_head,

			// predicate(s) of triple pattern
			p: h_edge,

			// claim objects
			o: b_inverse? h_head: h_tail,
		};


		// prep term positions
		let k_triples;

		// determine data use
		let hp_data_use = A_DATA_MAP[x_triple_pattern];

		// SPO
		if(HP_USE_SPO === hp_data_use) {
			if(!k_graph.triples_spo) {
				throw 'Query requires the POS triples index to be built.';
			}
			k_triples = k_graph.triples_spo;
		}
		// POS
		else if(HP_USE_POS === hp_data_use) {
			if(!k_graph.triples_pos) {
				throw 'Query requires the POS triples index to be built.';
			}
			k_triples = k_graph.triples_pos;
		}
		// OSP
		else {
			if(!k_graph.triples_osp) {
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

	*results() {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// fetch next triple pattern
		let {
			h_a, h_b, h_c,
			k_triples,
			b_inverse, h_head, h_edge, h_tail,
		} = this.next_triple_pattern(k_pattern.shift(), k_pattern);

		// ref markings
		let s_mark_a = h_a.mark;
		let s_mark_b = h_b.mark;
		let s_mark_c = h_c.mark;

		// save which heads were used and their associated rows
		let h_results = {};

		// base row
		let h_row__ = {};

		@{mk_proceed_eval(true)}
	}


	// fetches a distinct set of term ids from the head of this pattern
	//   `b_1` is an optional value to use for the hash pair instead of an object {id:int, type:hp}
	distinct_heads(b_1) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// fetch next triple pattern
		let {
			h_a, h_b, h_c,
			k_triples,
			b_inverse, h_head, h_edge, h_tail,
		} = this.next_triple_pattern(k_pattern.shift(), k_pattern);

		// make set of head ids
		let h_head_ids = {};

		// end of pattern sequence?
		let b_terminate = !k_pattern.length;

		@{prep_generators_abc('ids')}

		let b_head_is_a = (h_a === h_head);
		let b_head_is_c = (h_c === h_head);
		let n_range_d = k_graph.range_d;

		scanning_a:
		@{iterate_a(true)}
			@{iterate_b(true)}
				@{iterate_c(true)}
					// set head id
					let i_head = b_head_is_a? i_a: (b_head_is_c? i_c: i_b);
					let h_head_node = {id: i_head, type: h_head.type};
					let s_head = i_head < n_range_d
						? 'd'+i_head
						: (k_graph.TYPE_SUBJECT === h_head.type
							? 's'+i_head
							: (k_graph.TYPE_OBJECT === h_head.type
								? 'o'+i_head
								: 'p'+i_head));

					// reached end of pattern
					if(b_terminate) {
						// inverse
						if(b_inverse) {
							// add to set
							h_head_ids[s_head] = b_1 || h_head_node;
						}
						// normal
						else {
							// add to set
							h_head_ids[s_head] = b_1 || h_head_node;

							// don't bother matching resst of triples belonging to this a
							if(b_head_is_a) continue scanning_a;
						}
					}
					// tail has forks
					else if(h_c.forks) {
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
						if(this.completes(k_pattern.copy(), h_sim_c)) {
							// inverse
							if(b_inverse) {
								// add to set
								h_head_ids[s_head] = b_1 || h_head_node;
							}
							// normal
							else {
								// add to set
								h_head_ids[s_head] = b_1 || h_head_node;

								// don't bother matching resst of triples belonging to this a
								if(b_head_is_a) continue scanning_a;
							}
						}
					}
				@{end_iterate()}
			@{end_iterate()}
		@{end_iterate()}

		return h_head_ids;
	}

	completes(k_pattern, h_head) {
		// fetch next triple pattern
		let {
			h_a, h_b, h_c,
			k_triples,
			b_inverse, h_edge, h_tail,
		} = this.next_triple_pattern(h_head, k_pattern);

		// end of pattern sequence?
		let b_terminate = !k_pattern.length;

		@{prep_generators_abc('ids')}

		scanning_a:
		@{iterate_a()}
			@{iterate_b()}
				@{iterate_c()}
					// reached end of pattern
					if(b_terminate) {
						return true;
					}
					// tail has forks
					else if(h_c.forks) {
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
						if(this.completes(k_pattern.copy(), h_sim_c)) {
							return true;
						}
					}
				@{end_iterate()}
			@{end_iterate()}
		@{end_iterate()}
	}

	@{mk_generator_a(false)}
	@{mk_generator_a(true)}

	@{mk_generator_b(false)}
	@{mk_generator_b(true)}

	@{mk_generator_c(false)}
	@{mk_generator_c(true)}

	intersection(k_pattern, h_row__, h_head, a_m1) {
		let k_graph = this.graph;

		// fetch next triple pattern
		let {
			h_a, h_b, h_c,
			k_triples,
			b_inverse, h_edge, h_tail,
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

		@{prep_generator_a('rows')}
		@{prep_generator_b('rows')}
		@{prep_generator_c('ids')}

		let s_term_c = k_triples.c;

		// head is marked
		if(h_head.mark) {
			@{iterate_a()}
				@{iterate_b()}
					let i_m1 = 0;

					find_intersections:
					@{iterate_c(true)}
						// skip over non-intersecting ids
						for(; a_m1[i_m1]<i_c; i_m1++) {
							if(i_m1 === n_m1) {
								debugger;
								// no more intersections
								break find_intersections;
							}
						}

						// intersection
						if(a_m1[i_m1] === i_c) {
							debugger;

							// extend b
							let h_row_c = Object.create(h_row_b);

							// store marked
							h_row_c[s_mark_c] = k_graph[s_term_c](i_c);

							// add to results
							a_results.push(h_row_c);
						}
					@{end_iterate()}

					// results?!
					debugger;
				@{end_iterate()}
			@{end_iterate()}
		}
		// head is not marked, so long as there is one intersection we can continue matching
		else {
			// testing intersections......
			debugger;

			@{iterate_a(true)}
				@{iterate_b()}
					let i_m1 = 0;

					find_intersections:
					@{iterate_c(true)}
						// skip over non-intersecting ids
						for(; a_m1[i_m1]<i_c; i_m1++) {
							if(i_m1 === n_m1) {
								debugger;
								// no more intersections
								break find_intersections;
							}
						}

						// intersection
						if(a_m1[i_m1] === i_c) {
							debugger;

							// extend b
							let h_row_c = Object.create(h_row_b);

							// store marked
							h_row_c[s_mark_c] = k_graph[s_term_c](i_c);

							// add to results
							a_results.push(h_row_c);
						}
					@{end_iterate()}

					// results?!
					debugger;
				@{end_iterate()}
			@{end_iterate()}
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

		// head has forks
		if(h_head.forks) {
			throw 'probing first';

			//
			let a_combine = a_rows;

			// each fork
			let a_forks = h_head.forks;
			for(let i_fork=0; i_fork<a_forks.length; i_fork++) {
				let a_fork_rows = [];

				// destruct fork pattern
				let k_pattern_frag = a_forks[i_fork];

				// play out pattern within fork
				this.proceed(k_pattern_frag, {}, h_head);

				// only if there are results
				if(a_fork_rows.length) {
					// nothing to combine with; set directly
					if(!a_combine.length) {
						a_combine = a_fork_rows;
					}
					// combinations
					else {
						for(let i_combine_row=a_combine.length-1; i_combine_row>=0; i_combine_row--) {
							// take combine row out from array
							let h_combine_row = a_combine[i_combine_row];
							a_combine.splice(i_combine_row, 1);

							// each fork row to combine
							for(let i_fork_row=0; i_fork_row<a_fork_rows.length; i_fork_row++) {
								let h_fork_row = a_fork_rows[i_fork_row];

								// copy original combine row
								let h_copy_row = Object.create(h_combine_row);

								// set each property from fork onto copy row
								for(let i_property in h_fork_row) {
									h_copy_row[i_property] = h_fork_row[i_property];
								}

								// push copy back onto combine
								a_combine.push(h_copy_row);
							}
						}
					}
				}
			}
		}
		// no forks
		else {
			// yes pattern
			if(k_pattern.length) {
				return this.proceed(k_pattern, {}, h_head);
			}
			// no pattern
			else {
				// head mark
				let s_mark = h_head.mark;

				// term position
				let s_term;
				switch(h_head.type) {
					case HP_HOP:
					case HP_SUBJECT: s_term = 's'; break;
					case HP_OBJECT: s_term = 'o'; break;
					default: {
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
				if(!s_mark && !s_save) return [];

				// results list
				let a_results = [];

				for(let {id:i_a, row:h_row_a} of f_a({})) {
					a_results.push(h_row_a);
				}

				return {
					0: a_results,
				};
			}
		}
	}

	fork(k_root_pattern, h_row__, h_head) {
		//
		let a_living = [];
		let h_survivors = {};

		// each fork
		let a_forks = h_head.forks;
		for(let i_fork=0; i_fork<a_forks.length; i_fork++) {
			// destruct fork pattern
			let k_pattern_frag = a_forks[i_fork].copy();

			// zero path length under fork
			if(!k_pattern_frag.length) {
				console.warn('empty path under fork');
				continue;
			}

			// play out pattern within fork
			let h_alive = this.proceed(k_pattern_frag, h_row__, h_head);

			// remove pointer to subject row so that we only extend it once
			h_row__ = {};

			// object.keys
			a_living.length = 0;
			for(let i_alive in h_alive) {
				a_living.push(~~i_alive);

				// 
				if(h_survivors[i_alive]) {
					// fork rows to combine
					let a_fork_rows = h_alive[i_alive];

					//
					let a_combine = h_survivors[i_alive];
					for(let i_combine_row=a_combine.length-1; i_combine_row>=0; i_combine_row--) {
						// take combine row out from array
						let h_combine_row = a_combine[i_combine_row];
						a_combine.splice(i_combine_row, 1);

						// each fork row to combine
						for(let i_fork_row=0; i_fork_row<a_fork_rows.length; i_fork_row++) {
							let h_fork_row = a_fork_rows[i_fork_row];

							// copy original combine row
							let h_copy_row = Object.create(h_combine_row);

							// set each property from fork onto copy row
							for(let i_property in h_fork_row) {
								h_copy_row[i_property] = h_fork_row[i_property];
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
			if(!a_living.length) {
				return h_alive;
			}
			// one survivor
			else if(1 === a_living.length) {
				// mutate head for next fork
				h_head = {
					id: a_living[0],
					type: h_head.type,
				};
			}
			// multiple survivors
			else {
				// is living sorted?
				// mutate head for next fork
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
		if(a_living.length) {
			// copy only living results
			let n_living = a_living.length;
			for(let i=0; i<n_living; i++) {
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
			h_a, h_b, h_c,
			k_triples,
			b_inverse, h_edge, h_tail,
		} = this.next_triple_pattern(h_head, k_pattern);

		// ref markings
		let s_mark_a = h_a.mark;
		let s_mark_b = h_b.mark;
		let s_mark_c = h_c.mark;

		// save which heads were used and their associated rows
		let h_results = {};

		@{mk_proceed_eval()}

		// return which heads were used
		return h_results;
	}
}


class FailedSelection extends Selection {
	constructor(k_graph, h_failure) {
		super(k_graph, null);
		this.failure = h_failure;
		console.warn('failed to select thing: '+h_failure);
	}

	failed() {
		return true;
	}

	from() {
		throw 'nope';
	}
}


let c_graph_pattern = 0;
class GraphPattern {
	constructor(a_pattern) {
		this.pattern = a_pattern || [];
		this.count = 0;
		this.gpid = c_graph_pattern++;
	}

	get length() {
		return this.pattern.length;
	}

	copy() {
		return new GraphPattern(this.pattern.slice());
	}

	peek(i_peek=0) {
		return this.pattern[i_peek];
	}

	shift() {
		return this.pattern.shift();
	}

	end() {
		return this.pattern[this.pattern.length-1];
	}

	append_id(n_id, hp_type) {
		return this.pattern.push({
			index: this.gpid+'.'+(this.count++),
			id: n_id,
			type: hp_type,
		});
	}

	append_ids(a_ids, hp_type) {
		let a_pattern = this.pattern;
		return a_pattern.push({
			index: this.gpid+'.'+(this.count++),
			ids: a_ids,
			type: hp_type,
		});
	}

	append_range(hp_range, hp_type) {
		return this.pattern.push({
			index: this.gpid+'.'+(this.count++),
			range: hp_range,
			type: hp_type,
		});
	}

	append_all(hp_type) {
		return this.pattern.push({
			index: this.gpid+'.'+(this.count++),
			range: HP_RANGE_ALL,
			type: hp_type,
		});
	}

	fields() {
		let a_fields = [];
		let a_pattern = this.pattern;
		for(let i_pattern=0, n_pattern=a_pattern.length; i_pattern<n_pattern; i_pattern++) {
			let h_step = a_pattern[i_pattern];
			if(h_step.mark) {
				a_fields.push(new MarkedField(h_step.mark));
			}
			if(h_step.save) {
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

@macro cannot(do_what)
	@{do_what}(s_arg) {
		throw 'cannot `.@{do_what}("${s_arg}")` on an ${this.constructor.name}';
	}
@end




class GraphPatternFix {
	constructor(k_graph, k_pattern, h_failure=null) {
		this.graph = k_graph;
		this.pattern = k_pattern;
		this.failure = h_failure;
	}

	mark(s_name) {
		if('data' === s_name) throw `cannot use the reserved name 'data' to mark a term`;
		let k_pattern = this.pattern;

		// empty
		if(!k_pattern.length) return this;

		// save marking
		k_pattern.end().mark = s_name;

		// chain
		return this;
	}

	filter(f_filter) {
		let k_pattern = this.pattern;

		// empty
		if(!k_pattern.length) return this;

		// save marking
		k_pattern.end().filter = f_filter;

		// chain
		return this;
	}

	data(s_register_id, f_action) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// data plugin registerd
		let k_plugin = k_graph.plugins.registry[s_register_id];
		if(k_plugin) {
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

	join(s_name) {
		// save join intent
		this.pattern.end().join = s_name;

		// chain
		return this;
	}

	pipe(f_builder) {
		// call builder with new empty pattern and selection
		return f_builder(this.exit());
	}

	exit() {
		// exit only allowed on a node / literal
		if(this instanceof NormalEdgeFix || this instanceof InverseEdgeFix) {
			throw 'error: not allowed to exit pattern builder on an edge. pattern must terminate on a node or literal';
		}
		// one of the targets does not exist in the graph
		if(this.failure) {
			return new FailedSelection(this.graph, this.failure);
		}

		// enable query to take place
		return new Selection(this.graph, this.pattern);
	}

	@{cannot('edgeOut')}
	@{cannot('edgesOut')}
	@{cannot('edgeIn')}
	@{cannot('edgesIn')}
	@{cannot('subject')}
	@{cannot('subjects')}
	@{cannot('object')}
	@{cannot('objects')}
	@{cannot('literal')}
	@{cannot('literals')}
	@{cannot('objectNode')}
	@{cannot('objectNodes')}
	@{cannot('all')}
	@{cannot('fork')}
	@{cannot('forkIn')}
	@{cannot('hop')}
	@{cannot('hops')}
}


@macro empty(method, class)
	@{method}() {
		return new Empty@{class}();
	}
@end


@macro hop()
	hop(s_tt) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// turn string into word
		let ab_word = k_graph.encode_tt_node_to_word(s_tt);

		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if(i_item_d) {
			k_pattern.append_id(i_item_d, HP_HOP);
			return new HopFix(k_graph, k_pattern);
		}

		// no such hop in set
		return new EmptyHopFix(k_graph, null, {tt: s_tt});
	}
@end


@macro hops(inverse)
	hops() {
		let k_pattern = this.pattern;
		k_pattern.append_range(HP_RANGE_HOPS, @{inverse? 'HP_SUBJECT': 'HP_OBJECT'});
		return new HopFix(this.graph, k_pattern);
	}
@end


@macro subject()
	subject(s_tt) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// turn string into word
		let ab_word = k_graph.encode_tt_node_to_word(s_tt);

		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if(i_item_d) {
			k_pattern.append_id(i_item_d, HP_SUBJECT);
			return new SubjectFix(k_graph, k_pattern);
		}

		// search subjects dict
		let i_item_s = k_graph.section_s.find(ab_word);
		if(i_item_s) {
			k_pattern.append_id(i_item_s, HP_SUBJECT);
			return new SubjectFix(k_graph, k_pattern);
		}

		// no such subject in set
		return new EmptySubjectFix(k_graph, null, {tt: s_tt});
	}
@end


@macro subjects()
	subjects(a_tts) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// there is a list
		if(a_tts) {
			// prep list of subjects to capture
			let a_subjects = [];

			// each tt node
			@{each('tt', 's')}
				// turn string into word
				let ab_word = k_graph.encode_tt_node_to_word(s_tt);

				// searchs duals dict
				let i_item_d = k_graph.section_d.find(ab_word);
				if(i_item_d) {
					a_subjects.push(i_item_d)
				}
				else {
					// search subjects dict
					let i_item_s = k_graph.section_s.find(ab_word);
					if(i_item_s) {
						a_subjects.push(i_item_s);
					}
				}
			@{end_each()}

			// push id list to pattern's pattern
			k_pattern.append_ids(a_subjects, HP_SUBJECT);
		}
		// no list!
		else {
			// add all to path
			k_pattern.append_all(HP_SUBJECT);
		}

		// subject(s)
		return new SubjectFix(this.graph, k_pattern);
	}
@end


@macro object()
	object(s_tt) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// turn string into word
		let ab_word = k_graph.encode_tt_node_to_word(s_tt);

		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if(i_item_d) {
			k_pattern.append_id(i_item_d, HP_OBJECT);
			return new ObjectFix(k_graph, k_pattern);
		}

		// search objects dict
		let i_item_o = k_graph.section_o.find(ab_word);
		if(i_item_o) {
			k_pattern.append_id(i_item_o, HP_OBJECT);
			return new ObjectFix(k_graph, k_pattern);
		}

		// search literals dict
		return this.literal(s_tt);

		// // no such object in set
		// return new EmptyObjectFix(k_graph, null, {tt: s_tt});
	}
@end


@macro objectNode()
	objectNode(s_tt) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// turn string into word
		let ab_word = k_graph.encode_tt_node_to_word(s_tt);

		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if(i_item_d) {
			k_pattern.append_id(i_item_d, HP_OBJECT);
			return new ObjectFix(k_graph, k_pattern);
		}

		// search objects dict
		let i_item_o = k_graph.section_o.find(ab_word);
		if(i_item_o) {
			k_pattern.append_id(i_item_o, HP_OBJECT);
			return new ObjectFix(k_graph, k_pattern);
		}

		// no such object in set
		return new EmptyObjectFix(k_graph, null, {tt: s_tt});
	}
@end


@macro objects()
	objects(a_tts) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// there is a list
		if(a_tts) {
			// prep list of ids to capture
			let a_ids = [];

			// each tt node
			@{each('tt', 's')}
				// literal
				let s_tt_0 = s_tt[0];
				if('"' === s_tt_0 || '^' === s_tt_0 || '@' === s_tt_0) {
					// turn string into word
					let ab_word = k_graph.encode_tt_literal_to_word(s_tt);
				}
				// node
				else {
					// turn string into word
					let ab_word = k_graph.encode_tt_node_to_word(s_tt);

					// searchs duals dict
					let i_item_d = k_graph.section_d.find(ab_word);
					if(i_item_d) {
						a_ids.push(i_item_d);
					}
					else {
						// search objects dict
						let i_item_s = k_graph.section_o.find(ab_word);
						if(i_item_s) {
							a_ids.push(i_item_s);
						}
					}
				}
			@{end_each()}

			// push id list to pattern's pattern
			k_pattern.append_ids(a_ids, HP_OBJECT);
		}
		// no list!
		else {
			// add all to path
			k_pattern.append_all(HP_OBJECT);
		}

		// chaining, return a bag of objects
		return new ObjectFix(k_graph, k_pattern);
	}
@end


@macro objectNodes()
	objectNodes(a_tts) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// there is a list
		if(a_tts) {
			// prep list of ids to capture
			let a_ids = [];

			// each tt node
			@{each('tt', 's')}
				// turn string into word
				let ab_word = k_graph.encode_tt_node_to_word(s_tt);

				// searchs duals dict
				let i_item_d = k_graph.section_d.find(ab_word);
				if(i_item_d) {
					a_ids.push(i_item_d);
				}
				else {
					// search objects dict
					let i_item_s = k_graph.section_o.find(ab_word);
					if(i_item_s) {
						a_ids.push(i_item_s);
					}
				}
			@{end_each()}

			// push id list to pattern's pattern
			k_pattern.append_ids(a_ids, HP_OBJECT);
		}
		// no list!
		else {
			// add all to path
			k_pattern.append_all(HP_OBJECT);
		}

		// chaining, return a bag of objects
		return new ObjectFix(k_graph, k_pattern);
	}
@end



@macro literal()
	literal(s_tt_literal) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// turn string into word
		let ab_word = k_graph.encode_tt_literal_to_word(s_tt_literal);

		// searchs literals dict
		let c_item_l = k_graph.section_l.find(ab_word);
		
		// found item
		if(c_item_l) {
			k_pattern.append_id(c_item_l, HP_OBJECT);
			return new ObjectFix(k_graph, k_pattern);
		}

		// no such literal in set
		return new EmptyObjectFix(k_graph, null, {
			tt: s_tt_literal,
		});
	}
@end


@macro literals()
	literals(a_tts) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// there is a list
		if(a_tts) {
			throw 'multiple literals not yet supported';
		}
		// no list!
		else {
			k_pattern.append_range(HP_RANGE_LITERALS, HP_OBJECT);
			return new ObjectFix(k_graph, k_pattern);
		}
	}
@end

@macro leafNode()
	leafNode(s_tt) {
		
	}
@end

@macro leafNodes()
	leafNodes() {
		
	}
@end


@macro edgeOut()
	edgeOut(z_edge) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// ref prefix lookup
		let h_prefixes = k_graph.prefixes;

		// ref predicates dict
		let a_dict_p = k_graph.dict_p;

		// user wants to cross a single edge
		if('string' === typeof z_edge) {
			let s_tt = z_edge;

			// turn string into word
			let ab_word = k_graph.encode_tt_node_to_word(s_tt);

			// search for word in predicates dict
			let i_item_p = k_graph.section_p.find(ab_word);
			if(i_item_p) {
				// append id to path
				k_pattern.append_id(i_item_p, HP_PREDICATE);
				return new NormalEdgeFix(k_graph, k_pattern);
			}

			// no such predicate in set
			return new EmptyEdgeFix(k_graph, null, {
				tt: s_tt
			});
		}

		throw 'non-string';
	}
@end


@macro edgesOut()
	edgesOut(z_edges) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// list of tt_string predicates
		if(Array.isArray(z_edges)) {
			// build list of predicate ids
			let a_ids = [];

			// each predicate
			z_edges.forEach((s_tt) => {
				// turn string into word
				let ab_word = k_graph.encode_tt_node_to_word(s_tt);

				// search for word in predicates dict
				let i_item_p = k_graph.section_p.find(ab_word);

				// found word
				if(i_item_p) {
					// add to list
					a_ids.push(i_item_p);
				}
			});

			// at least 1 predicate found
			if(a_ids.length) {
				// append list of ids to path
				k_pattern.append_ids(a_ids, HP_PREDICATE);
				return new NormalEdgeFix(k_graph, k_pattern);
			}
			// no predicates found
			else {
				return new EmptyEdgeFix(k_graph, null, {
					tts: z_edges,
				});
			}
		}
		// term set
		else if(z_edges instanceof TermSet) {
			// append list of ids to path
			k_pattern.append_ids(z_edges.terms.map(h => h.id), HP_PREDICATE);
			return new NormalEdgeFix(this.graph, k_pattern);
		}
		// all outgoing edges
		else {
			k_pattern.append_all(HP_PREDICATE);
			return new NormalEdgeFix(this.graph, k_pattern);
		}
	}
@end


@macro edgeIn()
	edgeIn(z_edge) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// ref prefix lookup
		let h_prefixes = k_graph.prefixes;

		// ref predicates dict
		let a_dict_p = k_graph.dict_p;

		// user wants to cross a single edge
		if('string' === typeof z_edge) {
			let s_tt = z_edge;

			// turn string into word
			let ab_word = k_graph.encode_tt_node_to_word(s_tt);

			// search for word in predicates dict
			let i_item_p = k_graph.section_p.find(ab_word);
			if(i_item_p) {
				// append id to path
				k_pattern.append_id(i_item_p, HP_INVERSE_PREDICATE);
				return new InverseEdgeFix(k_graph, k_pattern);
			}

			// no such predicate in set
			return new EmptyInverseEdgeFix(k_graph, null, {
				tt: s_tt,
			});
		}

		throw 'non-string';
	}
@end


@macro edgesIn()
	edgesIn() {
		let k_pattern = this.pattern;
		k_pattern.append_all(HP_PREDICATE);
		return new InverseEdgeFix(this.graph, k_pattern);
	}
@end


@macro forkOut()
	forkOut(z_forks, b_optimize_fork_first) {
		let k_pattern = this.pattern;

		let h_subject = k_pattern.end();

		// optimize query by first matching presence of all fork edges
		if(b_optimize_fork_first) {
			h_subject.fork_first = 1;
		}

		// create forks array
		let a_forks = h_subject.forks = [];

		// ref graph
		let k_graph = this.graph;

		// fork is array
		if(Array.isArray(z_forks)) {
			throw 'fork array';
		}
		// fork is hash
		else {
			// each fork
			for(let s_fork_edge in z_forks) {
				let f_fork = z_forks[s_fork_edge];

				// find predicate in dict
				let i_p = k_graph.find_p(s_fork_edge);

				// no such predicate, no need to call fork; all done here!
				if(!i_p) return new Void(k_graph, this.pattern);

				// create new fork path starting with edge
				let k_pattern_frag = new GraphPattern();
				k_pattern_frag.append_id(i_p, HP_PREDICATE);

				// fire fork callback
				f_fork(new NormalEdgeFix(k_graph, k_pattern_frag));

				// save fork descriptor
				a_forks.push(k_pattern_frag);
			}
		}

		// chain
		return this;
	}
@end


@macro forkIn()
	
@end



//
class EmptyPattern {
	constructor(k_graph) {
		Object.assign(this, {
			graph: k_graph,
			pattern: new GraphPattern(),  // create root pattern
		});
	}

	@{subject()}
	@{subjects()}
	@{object()}
	@{objects()}
	@{objectNode()}
	@{objectNodes()}
	@{literal()}
	@{literals()}
	@{leafNode()}
	@{leafNodes()}
}

class HopFix extends GraphPatternFix {
	@{edgeOut()}
	@{edgesOut()}
	@{forkOut()}

	@{edgeIn()}
	@{edgesIn()}
	@{forkIn()}
}

class EmptyHopFix extends HopFix {
	@{empty('edgeOut', 'NormalEdgeFix')}
	@{empty('edgesOut', 'NormalEdgeFix')}
	@{empty('edgeIn', 'InverseEdgeFix')}
	@{empty('edgesIn', 'InverseEdgeFix')}
	forkOut() { return this; }
	forkIn() { return this; }
}

class SubjectFix extends GraphPatternFix {
	@{edgeOut()}
	@{edgesOut()}
	@{forkOut()}
}

class EmptySubjectFix extends SubjectFix {
	@{empty('edgeOut', 'NormalEdgeFix')}
	@{empty('edgesOut', 'NormalEdgeFix')}
	forkOut() { return this; }
}

class NormalEdgeFix extends GraphPatternFix {
	@{hop()}
	@{hops()}
	@{object()}
	@{objects()}
	@{objectNode()}
	@{objectNodes()}
	@{literal()}
	@{literals()}
	@{leafNode()}
	@{leafNodes()}

	all() {
		let k_pattern = this.pattern;
		k_pattern.append_all(HP_OBJECT);
		return new ObjectFix(this.graph, this.pattern);
	}
}

class EmptyEdgeFix {
	@{empty('hop', 'SubjectFix')}
	@{empty('hops', 'SubjectFix')}
	@{empty('object', 'ObjectFix')}
	@{empty('objects', 'ObjectFix')}
	@{empty('objectNode', 'ObjectFix')}
	@{empty('objectNodes', 'ObjectFix')}
	@{empty('literal', 'ObjectFix')}
	@{empty('literal', 'ObjectFix')}
	@{empty('leafNode', 'ObjectFix')}
	@{empty('leafNodes', 'ObjectFix')}
	@{empty('all', 'ObjectFix')}
}


class InverseEdgeFix extends GraphPatternFix {
	@{subject()}
	@{subjects()}
	@{hop(true)}
	@{hops(true)}
}

class EmptyInverseEdgeFix extends InverseEdgeFix {
	@{empty('subject', 'SubjectFix')}
	@{empty('subjects', 'SubjectFix')}
	@{empty('hop', 'SubjectFix')}
	@{empty('hops', 'SubjectFix')}
}


class ObjectFix extends GraphPatternFix {
	@{edgeIn()}
	@{edgesIn()}
}

class EmptyObjectFix extends ObjectFix {
	@{empty('invert', 'InverseEdgeFix')}
}

class GraphPath {

}

class EmptyPath {
	constructor(k_graph, k_pattern) {
		this.graph = k_graph;
		this.pattern = k_pattern;
	}

	from(h_from) {
		let k_graph = this.graph;

		if(h_from.node) {
			let h_node = k_graph.find_n(h_from.node);

			// prep vector list
			h_node.vectors = [];

			// carry on
			let a_roots = [h_node];
			return new PartialPath(k_graph, a_roots, a_roots);
		}
		else if(h_from.subject) {
			// make query selection
			let k_selection = h_from.subject((new EmptyPattern(k_graph)).subjects()).exit();

			// extract distinct head ids
			let h_heads = k_selection.distinct_heads();

			// 
			let a_roots = [];
			for(let s_head_uid in h_heads) {
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
	let x_a = h_a.n, x_b = h_b.n;
	return x_a < x_b? -1: (x_a > x_b? 1: 0);
};

const F_SORT_DISTINCT_NUMERIC = (x_a, x_b) => {
	return x_a < x_b? -1: 1;
};

const F_SORT_DISTINCT_ID = (h_a, h_b) => {
	let x_a = h_a.id, x_b = h_b.id;
	return x_a < x_b? -1: 1;
};

class TermSet {
	constructor(h_terms) {
		let a_terms = this.terms = [];

		// convert hash into list
		for(let s_term_id in h_terms) {
			a_terms.push(h_terms[s_term_id]);
		}
	}
}

class PartialPath {
	constructor(k_graph, a_roots, a_from) {
		this.graph = k_graph;
		this.roots = a_roots;
		this.from = a_from;
	}

	find(h_src, h_dests, n_min=0, n_max=Infinity, h_visited={}, n_depth=1) {
		let k_graph = this.graph;
		let n_range_d = k_graph.range_d;

		let hp_type = h_src.type;
		let i_src = h_src.id;
		let a_vectors = h_src.vectors;

		let a_scan = [];
// debugger;
		// explore 'right' side in normal direction relations
		if(i_src < k_graph.range_d || k_graph.TYPE_SUBJECT === hp_type) {
			// each predicate-object pair associated with this node as a subject
			for(let {b:i_p, c:i_o} of k_graph.s_po(i_src)) {
				let s_o = i_o < n_range_d? 'd'+i_o: 'o'+i_o;

				// haven't visited node before this call yet
				if(!(h_visited[s_o] < n_depth)) {
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
					if(h_dests[s_o] && n_depth > n_min) {
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
		if(i_src < k_graph.range_d || k_graph.TYPE_OBJECT === hp_type) {
			// each predicate-object pair associated with this node as a subject
			for(let {b:i_s, c:i_p} of k_graph.o_sp(i_src)) {
				let s_s = i_s < n_range_d? 'd'+i_s: 's'+i_s;

				// haven't visited node before this call yet
				if(!(h_visited[s_s] < n_depth)) {
					// mark as visited
					h_visited[s_s] = n_depth;

					//
					let a_segment_vectors = [];

					// make segment
					let h_segment = {
						e: i_p,
						n: i_s,
						i: 1,  // inverse
						c: 0,
						v: a_segment_vectors,
					};

					// found intersect
					if(h_dests[s_s] && n_depth > n_min) {
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
		if(n_depth < n_max) {
			for(let i_scan=0, n_scans=a_scan.length; i_scan<n_scans; i_scan++) {
				let h_scan = a_scan[i_scan];
				this.find(h_scan, h_dests, n_min, n_max, h_visited, n_depth+1);

				if(h_scan.vectors.length) {
					a_vectors.push(h_scan.segment);
				}
			}
		}
	}

	thru(h_thru) {
		// let k_graph = this.graph;
		// let a_from = this.from;

		// // to node
		// if(h_to.subject) {
		// 	let z_subject = h_to.subject;

		// 	// user provided query selection
		// 	if('function' === typeof z_subject) {
		// 		// make query selection
		// 		let k_selection = z_subject((new Entrance(k_graph)).subjects()).exit();

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
		if(h_to.subject) {
			let z_subject = h_to.subject;

			// user provided query selection
			if('function' === typeof z_subject) {
				// make query selection
				let k_selection = z_subject((new EmptyPattern(k_graph)).subjects()).exit();

				// extract distinct head ids
				let h_heads = k_selection.distinct_heads(1);

				//
				for(let i_from=0, n_from=a_from.length; i_from<n_from; i_from++) {
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
		@{each('src', 'h')}
			let i_head = h_src.id;

			let s_head = 's', s_tail = 'o';
			let b_inverse = false;
			if((i_head < k_graph.range_d) || (k_graph.TYPE_SUBJECT === h_src.type)) {
				s_head = 'o';
				s_tail = 's';
				b_inverse = true;
			}

			let h_a = k_graph[s_head](i_head);
			let a_vs = h_src.segment.v;
			for(let i_v=0, n_vs=a_vs.length; i_v<n_vs; i_v++) {
				let h_segment = a_vs[i_v];
				let h_c = k_graph[s_tail](h_segment.n);
				fk_each(b_inverse? h_c: h_a, k_graph.p(h_segment.e), b_inverse? h_a: h_c, new PathExplorer());
			}
		@{end_each()}
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
		@{each('root', 'h')}
			if(h_root.vectors.length) {
				let h_root_vertex = k_graph.v(h_root.id, h_root.type);
				fk_root(h_root_vertex, new PathExplorer(k_graph, h_root.vectors));
			}
		@{end_each()}
	}

	each(fk_each) {
		let k_graph = this.graph;

		let a_srcs = this.srcs;
		@{each('src', 'h')}
			let i_head = h_src.id;

			let s_head = 's', s_tail = 'o';
			let b_inverse = h_ve;
			if((i_head < k_graph.range_d) || (k_graph.TYPE_SUBJECT === h_src.type)) {
				s_head = 'o';
				s_tail = 's';
				b_inverse = true;
			}

			let h_a = k_graph[s_head](i_head);
			let a_vs = h_src.segment.v;
			for(let i_v=0, n_vs=a_vs.length; i_v<n_vs; i_v++) {
				let h_segment = a_vs[i_v];
				fk_each(h_a, k_graph.p(h_segment.e), k_graph[s_tail](h_segment.n), b_inverse, new PathExplorer());
			}
		@{end_each()}
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
		@{each('vector', 'h')}
			let s_head = 's', s_tail = 'o';
			let x_mask = h_vector.i;
			if(x_mask) {
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
		@{end_each()}
	}
}


const intersect_smis = (a_a, a_b) => {
	let a_intersection = [];

	let i_b = -1;
	let n_b = a_b.length;
	for(let i_a=0, n_a=a_a.length; i_a<n_a; i_a++) {
		let x_a = a_a[i_a];

		while(x_a > a_b[++i_b]){}
		if(x_a === a_b[i_b]) {
			a_intersection.push(x_a);
			i_b += 1;
		}
	}

	return a_intersection;
}

// const intersect = (a_a, a_b, a_c) => {
// 	let a_diff_a = [];

// 	let i_b = -1, i_c = -1;
// 	let n_b = a_b.length, n_c = a_c.length;
// 	for(let i_a=0, n_a=a_a.length; i<n_a; i_a++) {
// 		let x_a = a_a[i_a].n;

// 		while(x_a > a_b[++i_b].n){}
// 		while(x_a === a_b[i_b].n) {
// 			a_b[i_b];
// 			i_b += 1;
// 		}

// 		while(x_a > a_c[++i_c]){}
// 	}
// }


module.exports = {
	pattern(k_graph) {
		return new EmptyPattern(k_graph);
	},

	path_from(k_graph, w_from) {
		return (new EmptyPath(k_graph)).from(w_from);
	}
};