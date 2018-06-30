/* eslint-disable */

@ // import linker macros
@include '../store.jmacs'
@{encoders()}
@{buffer_utils()}


@def iterate_a(no_row)
	// iterate a
	@if no_row
		for(let i_a of f_a()) {
	@else
		for(let {id:i_a, row:h_row_a} of f_a(h_row__)) {
	@end
@end

@def iterate_b(no_row)
	// iterate b
	@if no_row
		for(let {id: i_b, offset: c_off_b} of f_b(i_a)) {
	@else
		for(let {id: i_b, row: h_row_b, offset: c_off_b} of f_b(i_a, h_row_a)) {
	@end
@end

@def iterate_c(no_row)
	// iterate c
	@if no_row
		for(let i_c of f_c(i_a, c_off_b)) {
	@else
		for(let {id:i_c, row:h_row_c} of f_c(i_a, c_off_b, h_row_b)) {
	@end
@end

@def end_iterate()
	}
@end


@def prep_generator_a(style)
	let f_a = this.generate_a_@{style}(h_a, k_triples.a);
@end

@def prep_generator_b(style)
	let f_b = this.generate_b_@{style}(h_b, k_triples);
@end

@def prep_generator_c(style)
	let f_c = this.generate_c_@{style}(h_c, k_triples);
@end

@def prep_generators_abc(style)
	@{prep_generator_a(style)}
	@{prep_generator_b(style)}
	@{prep_generator_c(style)}
@end


@def mk_proceed_eval(yield)
	// end of pattern sequence?
	let b_terminate = !k_pattern.length;

	// mk iteration generators
	@{prep_generator_a('rows')}
	@{prep_generator_b('rows')}

	// bidirectional set intersection
	if(!h_a.range && !h_b.range && h_c.range && k_pattern.length >= 2 && !k_pattern.peek(0).range && !k_pattern.peek(1).range) {
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
							role: h_c.role,
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
							role: HP_ROLE_HOP,
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


@def mk_generator_a_range_yield(rows, no_data)
	// skip entity if filter rejectes reconstructed term
	if(f_filter && !f_filter(k_graph[s_term](i_a))) continue;

	@if rows
		// assume not bound
		let h_row_a = h_row__;

		@if no_data
			// bound
			if(s_bind) {
				// branch row
				h_row_a = Object.create(h_row__);

				// store bound
				h_row_a[s_bind] = k_graph[s_term](i_a);
			}
		@else
			// bound / saved
			if(b_store) {
				// branch row
				h_row_a = Object.create(h_row__);

				// store bound
				if(s_bind) {
					h_row_a[s_bind] = k_graph[s_term](i_a);
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



@def mk_generator_a(rows)
	generate_a_@{rows? 'rows': 'ids'}(h_entity, s_term) {
		let k_graph = this.graph;

		// ref entity attributes
		@if rows
			let s_bind = h_entity.bind;
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

							// entity is bound; store binding
							if(s_bind) h_row_a[s_bind] = k_graph[s_term](i_a);

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
					// assume not bound
					let h_row_a = h_row__;

					// entity is bound
					if(s_bind) {
						h_row_a = Object.create(h_row__);

						// store bound
						h_row_a[s_bind] = k_graph[s_term](i_a);
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

								// store bound
								if(s_bind) h_row_a[s_bind] = k_graph[s_term](i_a);

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
						// assume not bound
						let h_row_a = h_row__;

						// bound
						if(s_bind) {
							// branch row
							h_row_a = Object.create(h_row__);

							// store bound
							h_row_a[s_bind] = k_graph[s_term](i_a);
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
			let hp_entity_role = h_entity.role;
			let hp_entity_range = h_entity.range;

			let i_start = 1;
			let i_stop;

			// V*[all]
			if(HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if(HP_ROLE_SUBJECT === hp_entity_role) {
					i_stop = k_graph.range_s;
				}
				// for objects
				else if(HP_ROLE_OBJECT === hp_entity_role) {
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
			else if(HP_RANGE_SUBJECTS === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[objects]
			else if(HP_RANGE_OBJECTS === hp_entity_range) {
				i_stop = k_graph.range_o;
			}
			// V*[custom]
			else if(HP_RANGE_CUSTOM === hp_entity_range) {
				i_start = h_entity.start;
				i_stop = h_entity.stop;
			}
			// ??
			else {
				throw 'invalid variable subject role. only expected {ALL, HOPS}; found '+hp_entity_range;
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


@def mk_generator_b(rows)
	generate_b_@{rows? 'rows': 'ids'}(h_entity, k_triples) {
		let k_graph = this.graph;

		let s_term = k_triples.b;

		// ref entity attributes
		@if rows
			let s_bind = h_entity.bind;
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

								// store bound
								if(s_bind) h_row_b[s_bind] = k_graph[s_term](i_b);

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
						// assume not bound
						let h_row_b = Object.create(h_row_a);

						// bound
						if(s_bind) {
							// branch row
							h_row_b = Object.create(h_row_a);

							// store bound
							h_row_b[s_bind] = k_graph[s_term](i_b);
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

									// store bound
									if(s_bind) h_row_b[s_bind] = k_graph[s_term](i_b);

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
							// assume not bound
							let h_row_b = h_row_a;

							// bound
							if(s_bind) {
								// branch row
								h_row_b = Object.create(h_row_a);

								// store bound
								h_row_b[s_bind] = k_graph[s_term](i_b);
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
			let hp_entity_role = h_entity.role;
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
				let b_store = s_bind || s_save;
			@end

			// Vp[all]
			if(HP_RANGE_ALL === hp_entity_range) {
				// mk entity generator
				return function*(i_a, h_row_a) {
					for(let {id: i_b, offset: c_off_b} of k_triples.each_b(i_a)) {
						// filter rejects reconstructed term; skip
						if(f_filter && !f_filter(k_graph[s_term](i_b))) continue;

						@if rows
							// assume not bound / saved
							let h_row_b = h_row_a;

							// bound
							if(b_store) {
								// branch row
								h_row_b = Object.create(h_row_a);

								// store bound
								if(s_bind) h_row_b[s_bind] = k_graph[s_term](i_b);

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
							// assume not bound / saved
							let h_row_b = h_row_a;

							// bound
							if(b_store) {
								// branch row
								h_row_b = Object.create(h_row_a);

								// store bound
								if(s_bind) h_row_b[s_bind] = k_graph[s_term](i_b);

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


@def mk_generator_c(rows)
	generate_c_@{rows? 'rows': 'ids'}(h_entity, k_triples) {
		let k_graph = this.graph;
		let h_joins = this.joins;

		let s_term = k_triples.c;

		// ref entity attributes
		@if rows
			let s_bind = h_entity.bind;
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

								// store bound
								if(s_bind) h_row_c[s_bind] = k_graph[s_term](i_c);

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

						// bound
						if(s_bind) {
							// branch row
							h_row_c = Object.create(h_row_b);

							// store saved
							h_row_c[s_bind] = k_graph[s_term](i_c);
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

									// store bound
									if(s_bind) h_row_c[s_bind] = k_graph[s_term](i_c);

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
							// assume not bound
							let h_row_c = h_row_b;

							// bound
							if(s_bind) {
								// branch row
								h_row_c = Object.create(h_row_b);

								// store bound
								h_row_c[s_bind] = k_graph[s_term](i_c);
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
			let hp_entity_role = h_entity.role;
			let hp_entity_range = h_entity.range;
			let b_single = h_entity.single;

			let i_start = 1;
			let i_stop;

			//
			let i_high_range = k_graph.range_l;

			// V*[all]
			if(HP_RANGE_ALL === hp_entity_range) {
				// for subjects
				if(HP_ROLE_SUBJECT === hp_entity_role) {
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
			else if(HP_RANGE_SUBJECTS === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[objects]
			else if(HP_RANGE_OBJECTS === hp_entity_range) {
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
				let b_store = s_bind || s_save;
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
						// assume not bound / saved
						let h_row_c = h_row_b;

						// bound / saved
						if(b_store) {
							// branch row
							h_row_c = Object.create(h_row_b);

							// store bound
							if(s_bind) {
								h_row_c[s_bind] = k_graph[s_term](i_c);
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

					// only yield first result
					if(b_single) break;
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

						// make sure roles are compatible
						if(h_join.role !== hp_entity_role) {
							throw 'incompatible join roles';
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
							role: hp_entity_role,
							index: h_entity.index,
						};
					}
				}
			};
		}
	}
@end


@def mk_checker()
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
		if(HP_ROLE_PREDICATE === h_edge.role) {
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

		// ref bindings
		let s_bind_a = h_a.bind;
		let s_bind_b = h_b.bind;
		let s_bind_c = h_c.bind;

		// save which heads were used and their associated rows
		let h_results = {};

		// base row
		let h_row__ = {};

		@{mk_proceed_eval(true)}
	}


	// fetches a distinct set of term ids from the head of this pattern
	//   `b_1` is an optional value to use for the hash pair instead of an object {id:int, role:hp}
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
					let h_head_node = {id: i_head, role: h_head.role};
					let s_head = i_head < n_range_d
						? 'd'+i_head
						: (k_graph.TYPE_SUBJECT === h_head.role
							? 's'+i_head
							: (k_graph.TYPE_OBJECT === h_head.role
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
							role: HP_ROLE_HOP,
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
							role: HP_ROLE_HOP,
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

		// ref bindings
		let s_bind_a = h_a.bind;
		let s_bind_b = h_b.bind;
		let s_bind_c = h_c.bind;

		// save results as list
		let a_results = [];

		// m1 read index and length
		let i_m1 = 0;
		let n_m1 = a_m1.length;

		@{prep_generator_a('rows')}
		@{prep_generator_b('rows')}
		@{prep_generator_c('ids')}

		let s_term_c = k_triples.c;

		// head is bound
		if(h_head.bind) {
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

							// store bound
							h_row_c[s_bind_c] = k_graph[s_term_c](i_c);

							// add to results
							a_results.push(h_row_c);
						}
					@{end_iterate()}

					// results?!
					debugger;
				@{end_iterate()}
			@{end_iterate()}
		}
		// head is not bound, so long as there is one intersection we can continue matching
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

							// store bound
							h_row_c[s_bind_c] = k_graph[s_term_c](i_c);

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
				// head bind
				let s_bind = h_head.bind;

				// term position
				let s_term;
				switch(h_head.role) {
					case HP_ROLE_HOP:
					case HP_ROLE_SUBJECT: s_term = 's'; break;
					case HP_ROLE_OBJECT: s_term = 'o'; break;
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

				// no bind, no save
				if(!s_bind && !s_save) return [];

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
					role: h_head.role,
				};
			}
			// multiple survivors
			else {
				// is living sorted?
				// mutate head for next fork
				h_head = {
					ids: a_living,
					role: h_head.role,
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

		// ref bindings
		let s_bind_a = h_a.bind;
		let s_bind_b = h_b.bind;
		let s_bind_c = h_c.bind;

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


module.exports = {
	pattern(k_graph) {
		return new EmptyPattern(k_graph);
	},

	path_from(k_graph, w_from) {
		return (new EmptyPath(k_graph)).from(w_from);
	}
};