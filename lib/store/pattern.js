/* eslint-disable */

@ // import linker macros
@include 'store.builder-js'


@macro each_ab_traditional()
	// search ab's adjacency list for predicate
	let c_offset_ab = -1;
	let i_data_ab_start = a_idx_ab[i_test_a - 1];

	// each object pointed to in a's adjacency list
	for(;;) {
		// pull up b's id
		let i_test_b = a_data_ab[i_data_ab_start + (++c_offset_ab)];

		// reach data ab end-of-adjacency list; break loop
		if(!i_test_b) break;

		@ // otherwise...
@end


@macro each_ab(test)
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

		@ // otherwise...
		@set close_each_ab '} while(++c_offset_ab !== c_offset_ab_end);'
@end

@macro each_abc_traditional()
	// pull up c's data index
	let i_data_a_bc = a_idx_a_bc[i_test_a - 1][c_offset_ab];

	// each object pointed to by predicate
	for(;;) {
		// pull up c's id
		let i_test_c = a_data_a_bc[i_data_a_bc++];

		// reach data c end-of-adjacency list; break loop
		if(!i_test_c) break;

		@ // otherwise...
@end

@macro each_abc()
	// pull up c's data index
	let a_idx_x_bc = a_idx_a_bc[i_test_a - 1];
	let i_data_a_bc = a_idx_x_bc[c_offset_ab];
	let i_data_a_bc_end = a_idx_x_bc[c_offset_ab + 1];

	// each object pointed to by predicate
	do {
		// pull up c's id
		let i_test_c = a_data_a_bc[i_data_a_bc];

		@ // otherwise...
		@set close_each_abc '} while(++i_data_a_bc !== i_data_a_bc_end);'
@end


@macro find_abc(what)
	// search ab's adjacency list for 'b'
	let c_offset_a_bc = -1;

	// starting position of adjacency list (for counting item offset)
	let a_idx_a_b = a_idx_a_bc[i_test_a - 1];
	let i_start = a_idx_a_b[c_offset_ab];

	// bounds of binary search
	let i_lo = i_start;
	let i_hi = (a_idx_a_b.length - 1) === c_offset_ab? a_idx_a_bc[i_test_a] - 1: a_idx_a_b[c_offset_ab + 1] - 1;

	searching_adjacency_list:
	for(;;) {
		// binary search
		for(;;) {
			let x_lo = a_data_a_bc[i_lo];
			let x_hi = a_data_a_bc[i_hi];

			// target value out of bounds
			if(@{what} < x_lo || @{what} > x_hi) break searching_adjacency_list;

			// compute midpoint search index
			let i_mid = (i_lo + i_hi) >> 1;
			let x_mid = a_data_a_bc[i_mid];

			// miss low
			if(x_mid < @{what}) {
				i_lo = i_mid + 1;
			}
			// miss high
			else if(x_mid > @{what}) {
				i_hi = i_mid - 1;
			}
			// hit!
			else {
				// set offset accordingly
				c_offset_a_bc = i_mid - i_start;
				break;
			}

			// indexes crossed; target not in list
			if(i_hi < i_lo) break searching_adjacency_list;
		}

		@ // then...
@end



@macro each_s()
	let n_s = k_graph.range_s;
	for(let i_test_s=1; i_test_s<n_s; i_test_s++) {
@end

@macro each_sp()
	// search sp's adjacency list for predicate
	let c_offset_data_sp = -1;
	let i_data_sp_start = k_graph.idx_sp[i_test_s - 1];

	// each predicate in subject's sp adjacency list
	for(;;) {
		// pull up predicate's id
		let i_test_p = k_graph.data_sp[i_data_sp_start + (++c_offset_data_sp)];

		// reached end of adjacency list
		if(!i_test_p) break;

		@ // otherwise...
@end

@macro each_spo()
	// pull up object's data index
	let i_data_s_po = k_graph.idx_s_po[i_test_s - 1][c_offset_data_sp];

	// each object pointed to by predicate
	for(;;) {
		// pull up object's id
		let i_test_o = k_graph.data_s_po[i_data_s_po++];

		// reach data object end-of-adjacency list; break loop
		if(!i_test_o) break;

		@ // otherwise...
@end


@macro each_p()
	let n_p = k_graph.range_p;
	for(let i_test_p=1; i_test_p<n_p; i_test_p++) {
@end

@macro each_po()
	// search po's adjacency list for predicate
	let c_offset_data_po = -1;
	let i_data_po_start = k_graph.idx_po[i_test_p - 1];

	// each object in po's adjacency list
	for(;;) {
		// pull up object's id
		let i_test_o = k_graph.data_po[i_data_po_start + (++c_offset_data_po)];

		// reached end of adjacency list
		if(!i_test_o) break;

		@ // otherwise...
@end

@macro each_pos()
	// pull up subject's data index
	let i_data_p_os = k_graph.idx_p_os[i_test_p - 1][c_offset_data_po];

	// each object pointed to by predicate
	for(;;) {
		// pull up subject's id
		let i_test_s = k_graph.data_p_os[i_data_p_os++];

		// reach data subject end-of-adjacency list; break loop
		if(!i_test_s) break;

		@ // otherwise...
@end


@macro each_o()
	let n_o = k_graph.range_l;
	for(let i_test_o=1; i_test_o<n_o; i_test_o++) {
@end

@macro each_os()
	// search os's adjacency list for object
	let c_offset_data_os = -1;
	let i_data_os_start = k_graph.idx_os[i_test_o - 1];

	// each subject in os's adjacency list
	for(;;) {
		// pull up subject's id
		let i_test_s = k_graph.data_os[i_data_os_start + (++c_offset_data_os)];

		// reached end of adjacency list
		if(!i_test_s) break;

		@ // otherwise...
@end

@macro each_osp()
	// pull up predicates's data index
	let i_data_o_sp = k_graph.idx_o_sp[i_test_o - 1][c_offset_data_os];

	// each subject pointed to by object
	for(;;) {
		// pull up predicates's id
		let i_test_p = k_graph.data_o_sp[i_data_o_sp++];

		// reach data predicate's end-of-adjacency list; break loop
		if(!i_test_p) break;

		@ // otherwise...
@end




@macro abc(a, b, c)
	let a_data_ab = k_graph.data_@{a}@{b};
	let a_data_a_bc = k_graph.data_@{a}_@{b}@{c};
	let a_idx_ab = k_graph.idx_@{a}@{b};
	let a_idx_a_bc = k_graph.idx_@{a}_@{b}@{c};
	let n_a = k_graph.range_@{a};
@end

@macro each_a()
	for(let i_test_a=1; i_test_a<n_a; i_test_a++) {
@end

@macro find_ab_interpolated(what)
	// search ab's adjacency list for 'b'
	let c_offset_ab = -1;

	// starting position of adjacency list (for counting item offset)
	let i_start = a_idx_ab[i_test_a - 1];

	// bounds of interpolation search
	let i_lo = i_start;
	let i_hi = a_idx_ab[i_test_a] - 1;
debugger;
	searching_adjacency_list:
	for(;;) {
		// binary search
		for(;;) {
			let x_lo = a_data_ab[i_lo];
			let x_hi = a_data_ab[i_hi];

			// target value out of bounds
			if(@{what} < x_lo || @{what} > x_hi) break searching_adjacency_list;

			// compute interpolated search index
			let i_mid = (i_lo + ((@{what} - x_lo) * (i_hi - i_lo) / (x_hi - x_lo))) | 0;
			let x_mid = a_data_ab[i_mid];

			// miss low
			if(x_mid < @{what}) {
				i_lo = i_mid + 1;
			}
			// miss high
			else if(x_mid > @{what}) {
				i_hi = i_mid - 1;
			}
			// hit!
			else {
				// set offset accordingly
				c_offset_ab = i_mid - i_start;
				break;
			}

			// indexes crossed; target not in list
			if(i_hi < i_lo) break searching_adjacency_list;
		}

		@ // then...
@end

@macro find_ab(what)
	// search ab's adjacency list for 'b'
	let c_offset_ab = -1;

	// starting position of adjacency list (for counting item offset)
	let i_start = a_idx_ab[i_test_a - 1];

	// bounds of binary search
	let i_lo = i_start;
	let i_hi = a_idx_ab[i_test_a] - 1;

	searching_adjacency_list:
	for(;;) {
		// binary search
		for(;;) {
			let x_lo = a_data_ab[i_lo];
			let x_hi = a_data_ab[i_hi];

			// compute midpoint search index
			let i_mid = (i_lo + i_hi) >> 1;
			let x_mid = a_data_ab[i_mid];

			// miss low
			if(x_mid < @{what}) {
				i_lo = i_mid + 1;
			}
			// miss high
			else if(x_mid > @{what}) {
				i_hi = i_mid - 1;
			}
			// hit!
			else {
				// set offset accordingly
				c_offset_ab = i_mid - i_start;
				break;
			}

			// indexes crossed; target not in list
			if(i_hi < i_lo) break searching_adjacency_list;
		}

		@ // then...
@end

@macro end_find()
		break;
	}
@end


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
		for(let i_a of f_a(h_row__)) {
	@else
		for(let {id:i_a, row:h_row_a} of f_a(h_row__)) {
	@end
@end

@macro iterate_b(no_row)
	// iterate b
	@if no_row
		for(let {id: i_b, offset: c_offset_data_ab} of f_b(i_a, h_row_a)) {
	@else
		for(let {id: i_b, row: h_row_b, offset: c_offset_data_ab} of f_b(i_a, h_row_a)) {
	@end
@end

@macro iterate_c(no_row)
	// iterate c
	@if no_row
		for(let i_c of f_c(i_a, c_offset_data_ab)) {
	@else
		for(let {id:i_c, row:h_row_c} of f_c(i_a, c_offset_data_ab, h_row_b)) {
	@end
@end

@macro end_iterate()
	}
@end


@macro prep_generator_a(style)
	let f_a = this.generate_a_@{style}(h_a, s_term_a);
@end

@macro prep_generator_b(style)
	let f_b = this.generate_b_@{style}(h_b, s_term_b, s_term_a+s_term_b);
@end

@macro prep_generator_c(style)
	let f_c = this.generate_c_@{style}(h_c, s_term_c, s_term_a+'_'+s_term_b+s_term_c);
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

					// tail has probes
					if(h_c.probes) {	
						// simulate pattern head just for probe
						let h_sim_c = {
							id: i_c,
							probes: h_c.probes,
						};

						// probe all of c
						let h_survivors = this.probe(k_pattern, h_row_c, h_sim_c);
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
	if(f_filter && !f_filter(k_graph[s_term](i_e))) continue;

	@if rows
		// assume not marked
		let h_row_a = h_row__;

		@if no_data
			// marked
			if(s_mark) {
				// branch row
				h_row_a = Object.create(h_row__);

				// store marked
				h_row_a[s_mark] = k_graph[s_term](i_e);
			}
		@else
			// marked / saved
			if(b_store) {
				// branch row
				h_row_a = Object.create(h_row__);

				// store marked
				if(s_mark) {
					h_row_a[s_mark] = k_graph[s_term](i_e);
				}

				// store saved
				if(s_save) {
					h_row_a[s_save] = k_instance.load(i_e);
				}
			}
		@end

		// yield
		yield {
			id: i_e,
			row: h_row_a,
		};
	@else
		yield i_e;
	@end
@end



@macro mk_generator_a(rows)
	generate_a_@{rows? 'rows': 'ids'}(h_entity, s_term) {
		let k_graph = this.graph;

		// ref entity attributes
		@if rows
			let s_mark = h_entity.mark;
		@end
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;

		// K*[1]
		if(h_entity.id) {
			let i_entity = h_entity.id;

			// user bound a filter
			if(f_filter) {
				// filter rejects reconstructed term
				if(!f_filter(k_graph[s_term](i_entity))) {
					// empty generator
					return function*(){};
				}
			}

			// user bound a data handler
			if(h_data) {
				@{mk_checker()}

				// apply plugin handler; action dissaproves of this entity
				if(f_evaluate  && !f_evaluate(i_entity)) {
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
							h_row_a[s_save] = k_instance.load(i_entity);

							// entity is marked; store marked
							if(s_mark) h_row_a[s_mark] = k_graph[s_term](i_entity);

							// simply return entity id (already known to be a valid entity)
							yield {
								id: i_entity,
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
						h_row_a[s_mark] = k_graph[s_term](i_entity);
					}

					// simply return entity id (already known to be a valid entity)
					yield {
						id: i_entity,
						row: h_row_a,
					};
				@else
					yield i_entity;
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
				@{each('entity_id', 'i', 'entity')}
					// entity passes filter test
					if(f_filter(k_graph[s_tream](i_entity))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_entity);
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
					@{each('entity_id', 'i', 'entity')}
						// entity passes plugin test
						if(f_evaluate(i_entity)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_entity);
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
							@{each('entity_id', 'i', 'e')}
								// branch row
								let h_row_a = Object.create(h_row__);

								// store saved
								h_row_a[s_save] = k_instance.load(i_e);

								// store marked
								if(s_mark) h_row_a[s_mark] = k_graph[s_term](i_e);

								// yield
								yield {
									id: i_entity,
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
				@{each('entity_id', 'i', 'e')}
					@if rows
						// assume not marked
						let h_row_a = h_row__;

						// marked
						if(s_mark) {
							// branch row
							h_row_a = Object.create(h_row__);

							// store marked
							h_row_a[s_mark] = k_graph[s_term](i_e);
						}

						// yield
						yield {
							id: i_entity,
							row: h_row_a,
						};
					@else
						yield i_entity;
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
			// V*[sources]
			else if(HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[sinks]
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
				throw 'invalid variable source type. only expected {ALL, HOPS}; found '+hp_entity_range;
			}

			if(h_data) {
				// evaluate data find
				let k_plugin = h_data.plugin;
				let h_found = k_plugin.find(f_action, i_start, i_stop);
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
						for(let i_e=i_start; i_e<i_stop; i_e++) {
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
						@{each('found_id', 'i', 'e')}
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
					for(let i_e=i_start; i_e<i_stop; i_e++) {
						@{mk_generator_a_range_yield(rows, true)}
					}
				};
			}
		}
	}
@end


@macro mk_generator_c(rows)
	generate_c_@{rows? 'rows': 'ids'}(h_entity, s_term, s_key) {
		let k_graph = this.graph;

		// data and index
		let a_data_a_bc = k_graph['data_'+s_key];
		let a_idx_a_bc = k_graph['idx_'+s_key];

		// ref entity attributes
		@if rows
			let s_mark = h_entity.mark;
		@end
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;

		// K*[1]
		if(h_entity.id) {
			let i_entity = h_entity.id;

			// user bound a filter
			if(f_filter) {
				// filter rejects reconstructed term
				if(!f_filter(k_graph[s_term](i_entity))) {
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
				if(f_evaluate  && !f_evaluate(i_entity)) {
					// empty generator
					return function*(){};
				}

				@if rows
					// data save
					if(h_checker.save) {
						let k_instance = k_plugin.instance;
						let s_save = h_checker.save;

						// mk entity generator
						return function*(i_test_a, c_offset_ab, h_row_b) {
							// search data table for given entity
							@{find_abc('i_entity')}
								// branch row
								let h_row_c = Object.create(h_row_b);

								// store saved
								h_row_c[s_save] = k_instance.load(i_entity);

								// store marked
								if(s_mark) h_row_c[s_mark] = k_graph[s_term](i_entity);

								// yield
								yield {
									id: i_entity,
									row: h_row_c,
								};
							@{end_find()}
						};
					}
				@end
			}

			// mk entity generator
			return function*(i_test_a, c_offset_ab, h_row_b) {
				// search data table for given entity
				@{find_abc('i_entity')}
					@if rows
						let h_row_c = h_row_b;

						// marked
						if(s_mark) {
							// branch row
							h_row_c = Object.create(h_row_b);

							// store saved
							h_row_c[s_mark] = k_graph[s_term](i_entity);
						}

						// yield
						yield {
							id: i_entity,
							row: h_row_b,
						};
					@else
						yield i_entity;
					@end
				@{end_find()}
			};
		}
		// K*[+]
		else if(h_entity.ids) {
			let a_entity_ids = h_entity.ids;

			// user bound a filter
			if(f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				@{each('entity_id', 'i', 'entity')}
					// entity passes filter test
					if(f_filter(k_graph[s_tream](i_entity))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_entity);
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
					@{each('entity_id', 'i', 'entity')}
						// entity passes plugin test
						if(f_evaluate(i_entity)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_entity);
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
						return function*(i_test_a, c_offset_ab, h_row_b) {
							// copy ids list
							let a_search_ids = a_entity_ids.slice();

							// search data table for given entities
							@{each_abc()}
								// found a target entity
								let i_found_entity = a_search_ids.indexOf(i_test_c);
								if(-1 !== i_found_edge) {
									// delete from search list
									a_search_ids.splice(i_found_entity, 1);

									// branch row
									let h_row_c = Object.create(h_row_b);

									// store saved
									h_row_c[s_save] = k_instance.load(i_entity);

									// store marked
									if(s_mark) h_row_c[s_mark] = k_graph[s_term](i_entity);

									// yield
									yield {
										id: i_test_c,
										row: h_row_c,
									};

									// found all ids; stop searching
									if(!a_search_ids.length) break;
								}
							@{end_each()}
						};
					}
				@end
			}

			// mk entity generator
			return function*(i_test_a, c_offset_ab, h_row_b) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();

				// search data table for given entities
				@{each_abc()}
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_test_c);
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
								h_row_c[s_mark] = k_graph[s_term](i_entity);
							}

							// yield
							yield {
								id: i_test_c,
								row: h_row_b,
							};
						@else
							yield i_test_c;
						@end

						// found all ids; stop searching
						if(!a_search_ids.length) break;
					}
				@{end_each()}
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
			// V*[sources]
			else if(HP_RANGE_SOURCES === hp_entity_range) {
				i_stop = k_graph.range_s;
			}
			// V*[sinks]
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
				throw 'invalid variable source type. only expected {ALL, HOPS}';
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

			// mk entity generator
			return function*(i_test_a, c_offset_ab, h_row_b) {
				@{each_abc()}
					// too low (not in range yet)
					if(i_test_c < i_start) continue;

					// to high (out of range)
					if(i_test_c >= i_stop) break;

					// filter rejects reconstructed term; skip
					if(f_filter && !f_filter(k_graph[s_term](i_test_c))) continue;

					// data evaluate
					if(f_evaluate && !f_evaluate(i_test_c)) continue;

					@if rows
						// assume not marked / saved
						let h_row_c = h_row_b;

						// marked / saved
						if(b_store) {
							// branch row
							h_row_c = Object.create(h_row_b);

							// store marked
							if(s_mark) {
								h_row_c[s_mark] = k_graph[s_term](i_test_c);
							}

							// store saved
							if(s_save) {
								h_row_c[s_save] = k_instance.load(i_test_c);
							}
						}

						// yield
						yield {
							id: i_test_c,
							row: h_row_c,
						};
					@else
						yield i_test_c;
					@end
				@{end_each()}
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
	}

	rows() {
		//x
		let h_results = this.consume(this.pattern);
		let a_rows = [];
		for(let i_head in h_results) {
			let a_survivors = h_results[i_head];
			@{each('survivor', 'h')}
				a_rows.push(h_survivor);
			@{end_each()}
		}
		return a_rows;
	}

	next_triple_pattern(h_head, k_pattern) {
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
			p: h_edge;

			// claim objects
			o: b_inverse? h_head: h_tail,
		};


		// determine data use
		let hp_data_use = A_DATA_MAP[x_triple_pattern];

		// SPO
		if(HP_USE_SPO === hp_data_use) {
			if(!k_graph.data_sp) {
				throw 'Query requires the POS triples index to be built.';
			}
			s_term_a = 's'; s_term_b = 'p'; s_term_c = 'o';
		}
		// POS
		else if(HP_USE_POS === hp_data_use) {
			if(!k_graph.data_po) {
				throw 'Query requires the POS triples index to be built.';
			}
			s_term_a = 'p'; s_term_b = 'o'; s_term_c = 's';
		}
		// OSP
		else {
			if(!k_graph.data_os) {
				throw 'Query requires the OSP triples index to be built.';
			}
			s_term_a = 'o'; s_term_b = 's'; s_term_c = 'p';
		}

		// set a, b, c terms
		return {
			h_a: h_spo[s_term_a],
			h_b: h_spo[s_term_b],
			h_c: h_spo[s_term_c],
			s_term_a,
			s_term_b,
			s_term_c,
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
			s_term_a, s_term_b, s_term_c,
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

		@{mk_proceed_eval()}
	}


	distinct_head_ids() {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// fetch next triple pattern
		let {
			h_a, h_b, h_c,
			s_term_a, s_term_b, s_term_c,
			b_inverse, h_head, h_edge, h_tail,
		} = this.next_triple_pattern(k_pattern.shift(), k_pattern);

		// make set of head ids
		let h_head_ids = {};

		// end of pattern sequence?
		let b_terminate = !k_pattern.length;

		@{prep_generators_abc('ids')}

		scanning_a:
		@{iterate_a()}
			@{iterate_b()}
				@{iterate_c()}
					// reached end of pattern
					if(b_terminate) {
						// inverse
						if(b_inverse) {
							// add to set
							h_head_ids[i_c] = 1;
						}
						// normal
						else {
							// add to set
							h_head_ids[i_a] = 1;

							// don't bother matching resst of triples belonging to this a
							continue scanning_a;
						}
					}
					// tail has probes
					else if(h_c.probes) {
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
								h_head_ids[i_c] = 1;
							}
							// normal
							else {
								// add to set
								h_head_ids[i_a] = 1;

								// 
								continue scanning_a;
							}
						}
					}
				@{end_iterate()}
			@{end_iterate()}
		@{end_iterate()}

		let a_ids = [];
		for(let i_id in h_head_ids) {
			a_ids.push(i_id|0);
		}
	}

	completes(k_pattern, h_head) {
		// fetch next triple pattern
		let {
			h_a, h_b, h_c,
			s_term_a, s_term_b, s_term_c,
			b_inverse, h_head, h_edge, h_tail,
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
					// tail has probes
					else if(h_c.probes) {
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

	iterate_b(h_entity, s_term, s_key) {
		let k_graph = this.graph;

		// data and index
		let a_data_ab = k_graph['data_'+s_key];
		let a_idx_ab = k_graph['idx_'+s_key];

		// ref entity attributes
		let s_mark = h_entity.mark;
		let f_filter = h_entity.filter;
		let h_data = h_entity.data;

		// K*[1]
		if(h_entity.id) {
			let i_entity = h_entity.id;

			// user bound a filter
			if(f_filter) {
				// filter rejects reconstructed term
				if(!f_filter(k_graph[s_term](i_entity))) {
					// empty generator
					return function*() {};
				}
			}

			// user bound a data handler
			if(h_data) {
				@{mk_checker()}

				// apply plugin handler; action dissaproves of this entity
				if(f_evaluate && !f_evaluate(i_entity)) {
					// empty generator
					return function*() {};
				}

				// data saves entity
				if(h_checker.save) {
					let s_save = h_checker.save;
					let k_instance = k_plugin.instance;

					// mk entity generator
					return function*(i_test_a, h_row_a) {
						// search data table for given entity
						@{find_ab('i_entity')}
							// branch row
							let h_row_b = Object.create(h_row_a);

							// store saved
							h_row_b[s_save] = k_instance.load(i_entity);

							// store marked
							if(s_mark) h_row_b[s_mark] = k_graph[s_term](i_entity);

							// yield
							yield {
								id: i_entity,
								row: h_row_b,
								offset: c_offset_ab,
							};
						@{end_find()}
					};
				}
			}

			// mk entity generator
			return function*(i_test_a, h_row_a) {
				// search data table for given entity
				@{find_ab('i_entity')}
					// assume not marked
					let h_row_b = Object.create(h_row_a);

					// marked
					if(s_mark) {
						// branch row
						h_row_b = Object.create(h_row_a);

						// store marked
						h_row_b[s_mark] = k_graph[s_term](i_entity);
					}

					// yield
					yield {
						id: i_entity,
						row: h_row_b,
						offset: c_offset_ab,
					};
				@{end_find()}
			};
		}
		// K*[+]
		else if(h_entity.ids) {
			let a_entity_ids = h_entity.ids;

			// user bound a filter
			if(f_filter) {
				// filter entities
				let a_entity_ids_cleaned = [];
				@{each('entity_id', 'i', 'entity')}
					// entity passes filter test
					if(f_filter(k_graph[s_tream](i_entity))) {
						// preserve entity in set
						a_entity_ids_cleaned.push(i_entity);
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
					@{each('entity_id', 'i', 'entity')}
						// entity passes plugin test
						if(h_checker.evaluate(f_action, i_entity)) {
							// preserve entity in set
							a_entity_ids_cleaned.push(i_entity);
						}
					@{end_each()}

					// reassign id set
					a_entity_ids = a_entity_ids_cleaned;
				}

				// data save
				if(h_data.save) {
					let k_instance = k_plugin.instance;
					let s_save = h_data.save;

					return function*(i_test_a, h_row_a) {
						// copy ids list
						let a_search_ids = a_entity_ids.slice();

						// search data table for given entities
						@{each_ab()}
							// found a target entity
							let i_found_entity = a_search_ids.indexOf(i_test_b);
							if(-1 !== i_found_edge) {
								// delete from search list
								a_search_ids.splice(i_found_entity, 1);

								// branch row
								let h_row_b = Object.create(h_row_a);

								// store saved
								h_row_b[s_save] = k_instance.load(i_test_b);

								// store marked
								if(s_mark) h_row_b[s_mark] = k_graph[s_term](i_test_b);

								// yield
								yield {
									id: i_test_b,
									row: h_row_b,
									offset: c_offset_ab,
								};

								// found all ids; stop searching
								if(!a_search_ids.length) break;
							}
						@{end_each()}
					};
				}
			}

			// mk entity generator
			return function*(i_test_a, h_row_a) {
				// copy ids list
				let a_search_ids = a_entity_ids.slice();

				// search data table for given entities
				@{each_ab()}
					// found a target entity
					let i_found_entity = a_search_ids.indexOf(i_test_b);
					if(-1 !== i_found_edge) {
						// delete from search list
						a_search_ids.splice(i_found_entity, 1);

						// assume not marked
						let h_row_b = h_row_a;

						// marked
						if(s_mark) {
							// branch row
							h_row_b = Object.create(h_row_a);

							// store marked
							h_row_b[s_mark] = k_graph[s_term](i_test_b);
						}

						// yield
						yield {
							id: i_test_b,
							row: h_row_b,
							offset: c_offset_ab,
						};

						// found all ids; stop searching
						if(!a_search_ids.length) break;
					}
				@{end_each()}
			};
		}
		// Vp
		else {
			throw 'span';
			let hp_entity_type = h_entity.type;

			// Vp[all]
			if(HP_RANGE_ALL === hp_entity_range) {
				// no filter
				if(!f_filter) {
					// mk entity generator
					return {
						gen: function*(i_test_a) {
							@{each_ab()}
								yield [i_test_b, c_offset_ab];
							@{end_each()}
						},
					};
				}
				// yes filter
				else {
					// mk entity iterator
					return {
						gen: function*(i_test_a) {
							@{each_ab()}
							// filter rejects reconstructed term; skip
							if(!f_filter(k_graph[s_term](i_test_b))) continue;

							// accepted
							yield [i_test_b, c_offset_ab];
							@{end_each()}
						},
					};
				}
			}
			// V*[custom]
			else if(HP_RANGE_CUSTOM === hp_entity_range) {
				let i_start = h_entity.start;
				let i_stop = h_entity.stop;

				// no filter
				if(!f_filter) {
					// mk entity iterator
					return {
						gen: function*(i_test_a) {
							// search data table for given range
							@{each_ab()}
								// too low (not in range yet)
								if(i_test_b < i_start) continue;

								// too high (out of range)
								if(i_test_b >= i_stop) break;

								// filter rejects reconstructed term; skip
								if(!f_filter(k_graph[s_term](i_test_b))) continue;

								// accepted
								yield [i_test_b, c_offset_ab];
							@{end_each()}
						},
					};
				}
				// yes filter
				else {
					// mk entity iterator
					return {
						gen: function*(i_test_a) {
							// search data table for given range
							@{each_ab()}
								// too low (not in range yet)
								if(i_test_b < i_start) continue;

								// too high (out of range)
								if(i_test_b >= i_stop) break;

								// filter rejects reconstructed term; skip
								if(!f_filter(k_graph[s_term](i_test_b))) continue;

								// accepted
								yield [i_test_b, c_offset_ab];
							@{end_each()}
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

	@{mk_generator_c(false)}
	@{mk_generator_c(true)}

	intersection(k_pattern, h_row__, h_head, a_m1) {
		let k_graph = this.graph;

		// fetch next triple pattern
		let {
			h_a, h_b, h_c,
			s_term_a, s_term_b, s_term_c,
			b_inverse, h_head, h_edge, h_tail,
		} = this.next_triple_pattern(k_pattern.shift(), k_pattern);

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
							h_row_c = Object.create(h_row_b);

							// store marked
							h_row_c[s_mark_c] = k_graph.@{c}(i_c);

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
		if(h_head.probes) {
			throw 'probing first';

			//
			let a_combine = a_rows;

			// each probe
			let a_probes = h_head.probes;
			for(let i_probe=0; i_probe<a_probes.length; i_probe++) {
				let a_probe_rows = [];

				// destruct probe pattern
				let k_pattern_frag = a_probes[i_probe];

				// play out pattern within probe
				this.proceed(k_pattern_frag, {}, h_head);

				// only if there are results
				if(a_probe_rows.length) {
					// nothing to combine with; set directly
					if(!a_combine.length) {
						a_combine = a_probe_rows;
					}
					// combinations
					else {
						for(let i_combine_row=a_combine.length-1; i_combine_row>=0; i_combine_row--) {
							// take combine row out from array
							let h_combine_row = a_combine[i_combine_row];
							a_combine.splice(i_combine_row, 1);

							// each probe row to combine
							for(let i_probe_row=0; i_probe_row<a_probe_rows.length; i_probe_row++) {
								let h_probe_row = a_probe_rows[i_probe_row];

								// copy original combine row
								let h_copy_row = Object.create(h_combine_row);

								// set each property from probe onto copy row
								for(let i_property in h_probe_row) {
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
				let f_e = this.iterate_a(h_head, s_term);

				//
				let s_save = h_data && h_data.save;

				// no mark, no save
				if(!s_mark && !s_save) return [];

				// results list
				let a_results = [];

				for(let {id: i_e, row: h_row} of f_e({})) {
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
		for(let i_probe=0; i_probe<a_probes.length; i_probe++) {
			// destruct probe pattern
			let k_pattern_frag = a_probes[i_probe].copy();

			// zero path length under probe
			if(!k_pattern_frag.length) {
				console.warn('empty path under probe');
				continue;
			}

			// play out pattern within probe
			let h_alive = this.proceed(k_pattern_frag, h_row__, h_head);

			// remove pointer to source row so that we only extend it once
			h_row__ = {};

			// object.keys
			a_living.length = 0;
			for(let i_alive in h_alive) {
				a_living.push(~~i_alive);

				// 
				if(h_survivors[i_alive]) {
					// probe rows to combine
					let a_probe_rows = h_alive[i_alive];

					//
					let a_combine = h_survivors[i_alive];
					for(let i_combine_row=a_combine.length-1; i_combine_row>=0; i_combine_row--) {
						// take combine row out from array
						let h_combine_row = a_combine[i_combine_row];
						a_combine.splice(i_combine_row, 1);

						// each probe row to combine
						for(let i_probe_row=0; i_probe_row<a_probe_rows.length; i_probe_row++) {
							let h_probe_row = a_probe_rows[i_probe_row];

							// copy original combine row
							let h_copy_row = Object.create(h_combine_row);

							// set each property from probe onto copy row
							for(let i_property in h_probe_row) {
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
			if(!a_living.length) {
				return h_alive;
			}
			// one survivor
			else if(1 === a_living.length) {
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
		let k_pattern = this.pattern;

		// fetch next triple pattern
		let {
			h_a, h_b, h_c,
			s_term_a, s_term_b, s_term_c,
			b_inverse, h_head, h_edge, h_tail,
		} = this.next_triple_pattern(h_head, k_pattern);

		// ref markings
		let s_mark_s = h_s.mark;
		let s_mark_p = h_p.mark;
		let s_mark_o = h_o.mark;

		// save which heads were used and their associated rows
		let h_results = {};

		@{mk_proceed_eval()}

		// return which heads were used
		return h_results;
	}
}


class FailedSelection extends Selection {

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


@macro cannot(do_what)
	@{do_what}(s_arg) {
		throw 'cannot `.@{do_what}("${s_arg}")` on an ${this.constructor.name}';
	}
@end




class GraphPatternEntity {
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
		let k_plugin = k_graph.registry[s_register_id];
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

	exit() {
		// exit only allowed on a node / literal
		if(this instanceof Edge || this instanceof InverseEdge) {
			throw 'error: not allowed to exit pattern builder on an edge. pattern must terminate on a node or literal';
		}
		// one of the targets does not exist in the graph
		if(this.failure) {
			return new FailedSelection(this.graph, this.failure);
		}

		// enable query to take place
		return new Selection(this.graph, this.pattern);
	}

	@{cannot('cross')}
	@{cannot('invert')}
	@{cannot('source')}
	@{cannot('sources')}
	@{cannot('sink')}
	@{cannot('sinks')}
	@{cannot('literal')}
	@{cannot('literals')}
	@{cannot('node')}
	@{cannot('nodes')}
	@{cannot('span')}
	@{cannot('spanInverse')}
	@{cannot('all')}
	@{cannot('probe')}
	@{cannot('hops')}
}


@macro empty(method, class)
	@{method}() {
		return new Empty@{class}();
	}
@end


@macro hop(inverse)
	hop(s_n3) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// turn string into word
		let ab_word = k_graph.encode_n3_to_word(s_n3);

		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if(i_item_d) {
			k_pattern.append_id(i_item_d, HP_OBJECT);
			return new @{inverse? 'Source': 'Sink'}(k_graph, k_pattern);
		}

		// no such hop in set
		return new Empty@{inverse? 'Source': 'Sink'}(k_graph, null, {n3: s_n3});
	}
@end


@macro hops(inverse)
	hops() {
		let k_pattern = this.pattern;
		k_pattern.append_range(HP_RANGE_HOPS, @{inverse? 'HP_SUBJECT': 'HP_OBJECT'});
		return new Source(this.graph, k_pattern);
	}
@end


@macro source()
	source(s_n3) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// turn string into word
		let ab_word = k_graph.encode_n3_to_word(s_n3);

		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if(i_item_d) {
			k_pattern.append_id(i_item_d, HP_SUBJECT);
			return new Source(k_graph, k_pattern);
		}

		// search subjects dict
		let i_item_s = k_graph.section_s.find(ab_word);
		if(i_item_s) {
			k_pattern.append_id(i_item_s, HP_SUBJECT);
			return new Source(k_graph, k_pattern);
		}

		// no such source in set
		return new EmptySource(k_graph, null, {n3: s_n3});
	}
@end


@macro sink()
	sink(s_n3) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// turn string into word
		let ab_word = k_graph.encode_n3_to_word(s_n3);

		// searchs duals dict
		let i_item_d = k_graph.section_d.find(ab_word);
		if(i_item_d) {
			k_pattern.append_id(i_item_d, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}

		// search objects dict
		let i_item_o = k_graph.section_o.find(ab_word);
		if(i_item_o) {
			k_pattern.append_id(i_item_o, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}

		// no such sink in set
		return new EmptySink(k_graph, null, {n3: s_n3});
	}
@end


@macro sinks()
	sinks(a_n3s) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// there is a list
		if(a_n3s) {
			// prep list of ids to capture
			let a_ids = [];

			// each n3 node
			@{each('n3', 's')}
				// turn string into word
				let ab_word = k_graph.encode_n3_to_word(s_n3);

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
		return new Sink(k_graph, k_pattern);
	}
@end



@macro sources()
	sources(a_n3s) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// there is a list
		if(a_n3s) {
			// prep list of sources to capture
			let a_sources = [];

			// each n3 node
			@{each('n3', 's')}
				// turn string into word
				let ab_word = k_graph.encode_n3_to_word(s_n3);

				// searchs duals dict
				let i_item_d = k_graph.section_d.find(ab_word);
				if(i_item_d) {
					a_sources.push(i_item_d)
				}
				else {
					// search subjects dict
					let i_item_s = k_graph.section_s.find(ab_word);
					if(i_item_s) {
						a_sources.push(i_item_s);
					}
				}
			@{end_each()}

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
@end


@macro literal()
	literal(s_content, z_datatype_or_lang) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// prep to find word in dict
		let ab_open = Buffer.allocUnsafe(0);
		let nl_open = 0;
		if('string' === typeof z_datatype_or_lang) {
			let s_datatype_or_lang_0 = z_datatype_or_lang[0];
			if('@' === s_datatype_or_lang_0) {
				let ab_lang = encode_utf_8(z_datatype_or_lang.toLowerCase());
				nl_open = ab_lang.length + 1;
				ab_open = Buffer.allocUnsafe(nl_open);
				ab_lang.copy(ab_open);
				ab_open[nl_open-1] = 0x22;  // encode_utf_8('"')[0]
			}
			else if('^' === s_datatype_or_lang_0) {
				let ab_datatype = k_graph.encode_n3_to_word(z_datatype_or_lang.slice(1));
				nl_open = ab_datatype.length + 2;
				ab_open = Buffer.allocUnsafe(nl_open);
				ab_open[0] = 0x5e;  // encode_utf_8('^')[0]
				ab_datatype.copy(ab_open, 1);
				ab_open[nl_open-1] = 0x22;  // encode_utf_8('"')[0]
			}
			else {
				throw `the 'datatype_or_lang' argument to '.literal(..)' must start with either a '^' for datatype, or a '@' for language`;
			}
		}
		else if('object' === typeof z_datatype_or_lang) {
			throw 'literal from datatype';
		}

		// encode content
		let ab_content = encode_utf_auto(s_content);

		// join parts into word (if necessary)
		let ab_word = nl_open? join_buffers(ab_open, ab_content): ab_content;

		// searchs literals dict
		let c_item_l = k_graph.section_l.find(ab_word);
		
		// found item
		if(c_item_l) {
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
@end


@macro literals()
	literals(a_n3s) {
		let k_graph = this.graph;
		let k_pattern = this.pattern;

		// there is a list
		if(a_n3s) {
			throw 'multiple literals not yet supported';
		}
		// no list!
		else {
			k_pattern.append_range(HP_RANGE_LITERALS, HP_OBJECT);
			return new Sink(k_graph, k_pattern);
		}
	}
@end


//
class Entrance {
	constructor(k_graph) {
		Object.assign(this, {
			graph: k_graph,
			pattern: new GraphPattern(),  // create root pattern
		});
	}

	@{source()}
	@{sources()}
	@{sink()}
	@{sinks()}
	@{literal()}
	@{literals()}

	path() {
		return new Path(this.graph, this.pattern);
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
		if('string' === typeof z_edge) {
			let s_n3 = z_edge;

			// turn string into word
			let ab_word = k_graph.encode_n3_to_word(s_n3);

			// search for word in predicates dict
			let i_item_p = k_graph.section_p.find(ab_word);
			if(i_item_p) {
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
		if('string' === typeof z_edge) {
			let s_n3 = z_edge;

			// turn string into word
			let ab_word = k_graph.encode_n3_to_word(s_n3);

			// search for word in predicates dict
			let i_item_p = k_graph.section_p.find(ab_word);
			if(i_item_p) {
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
		if(b_optimize_probe_first) {
			h_source.probe_first = 1;
		}

		// create probes array
		let a_probes = h_source.probes = [];

		// ref graph
		let k_graph = this.graph;

		// probe is array
		if(Array.isArray(z_probes)) {
			throw 'probe array';
		}
		// probe is hash
		else {
			// each probe
			for(let s_probe_edge in z_probes) {
				let f_probe = z_probes[s_probe_edge];

				// find predicate in dict
				let i_p = k_graph.find_p(s_probe_edge);

				// no such predicate, no need to call probe; all done here!
				if(!i_p) return new Void(k_graph, this.pattern);

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
	@{empty('cross', 'Edge')}
	@{empty('invert', 'InverseEdge')}
	probe() {
		return this;
	}
	@{empty('span', 'Edge')}
}


class Edge extends GraphPatternEntity {
	@{hop()}
	@{hops()}
	@{sink()}
	@{sinks()}
	@{literal()}
	@{literals()}

	all() {
		let k_pattern = this.pattern;
		k_pattern.append_all(HP_OBJECT);
		return new Sink(this.graph, this.pattern);
	}
}

class EmptyEdge {
	@{empty('hop', 'Source')}
	@{empty('hops', 'Source')}
	@{empty('sink', 'Sink')}
	@{empty('sinks', 'Sink')}
	@{empty('literal', 'Literal')}
	@{empty('literal', 'Literal')}
	@{empty('all', 'Sink')}
}


class InverseEdge extends GraphPatternEntity {
	@{source()}
	@{sources()}
	@{hop(true)}
	@{hops(true)}
}

class EmptyInverseEdge extends InverseEdge {
	@{empty('source', 'Source')}
	@{empty('sources', 'Source')}
	@{empty('hop', 'Source')}
	@{empty('hops', 'Source')}
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
		if('string' === typeof z_edge) {
			let s_n3 = z_edge;

			// turn string into word
			let ab_word = k_graph.encode_n3_to_word(s_n3);

			// search for word in predicates dict
			let i_item_p = k_graph.section_p.find(ab_word);
			if(i_item_p) {
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
	@{empty('invert', 'InverseEdge')}
}

class GraphPath {

}

class EmptyPath {
	constructor(k_graph, k_pattern) {
		this.graph = k_graph;
		this.pattern = k_pattern;
	}

	from(h_from) {
		if(h_from.node) {
			let h_node = k_graph.find_n(h_from.node);

			// // make segment->vectors
			// h_node.segment = {
			// 	vectors: [],
			// };

			// carry on
			return new PartialPath(k_graph, h_node);
		}

		throw 'nope';
	}
}

const F_SORT_N = (h_a, h_b) => {
	let x_a = h_a.n, x_b = h_b.n;
	return x_a < x_b? -1: (x_a > x_b? 1: 0);
};

class PartialPath {
	constructor(k_graph, h_from) {
		this.graph = k_graph;
		this.from = h_from;
	}

	find(h_src, i_dest, h_visited={}, n_depth=1) {
		let hp_type = h_src.type;
		let i_src = h_src.id;

		let a_vectors = h_src.segment.vectors;
		let a_scan = [];

		// explore 'right' side in normal direction relations
		if(i_src < k_graph.range_d || k_graph.TYPE_SUBJECT === hp_type) {
			// each predicate-object pair associated with this node as a subject
			for(let {p:i_p, o:i_o} = k_graph.s_po(i_src)) {
				// haven't visited node before this call yet
				if(!(h_visited[i_o] < n_depth)) {
					// mark as visited
					h_visited[i_o] = n_depth;

					// make segment
					let h_segment = {
						e: i_p,
						n: i_o,
						d: 1,
						vectors: [],
					};

					// found intersect
					if(i_o === i_dest) {
						// push segment
						a_vectors.push(h_segment);
					}
					// no intersect
					else {
						// queue in order to explore breadth-first
						a_scan.push({
							id: i_o,
							type: k_graph.TYPE_OBJECT,
							segment: h_segment,
						});
					}
				}
			}
		}

		// explore 'left' side in invere direction relations
		if(i_src < k_graph.range_d || k_graph.TYPE_OBJECT === hp_type) {
			// each predicate-object pair associated with this node as a subject
			for(let {p:i_p, s:i_s} = k_graph.o_sp(i_src)) {
				// haven't visited node before this call yet
				if(!(h_visited[i_s] < n_depth)) {
					// mark as visited
					h_visited[i_s] = n_depth;

					// make segment
					let h_segment = {
						e: i_p,
						n: i_s,
						d: -1,
						vectors: [],
					};

					// found intersect
					if(i_s === i_dest) {
						// push segment
						a_vectors.push(h_segment);
					}
					// no intersect
					else {
						// queue in order to explore breadth-first
						a_scan.push({
							id: i_s,
							type: k_graph.TYPE_SUBJECT,
							segment: h_segment,
						});
					}
				}
			}
		}

		// explore breadth-first
		for(let i_scan=0, n_scans=a_scan.length; i_scan<n_scans; i_scan++) {
			let h_scan = a_scan[i_scan];
			this.find(h_scan, i_dest, h_visited, n_depth+1);

			if(h_scan.segment.vectors.length) {
				a_vectors.push(h_scan.segment);
			}
		}
	},

	to(h_to) {
		let k_graph = this.graph;
		let h_src = this.from;

		// 
		let a_src_vectors = h_src.segment.vectors;

		// to node
		if(h_to.source) {
			let z_source = h_to.source;

			// user provided query selection
			if('function' === typeof z_source) {
				// make query selection
				let k_selection = z_source((new Entrance(k_graph)).sources()).exit();

				// extract distinct head ids
				let a_ids = k_selection.distinct_head_ids();

				// each head id
				for(let i_id=0, n_ids=a_ids.length; i_id<n_ids; i_id++) {
					let i_e = a_ids[i_id];

					// prep vectors list
					let a_vectors = [];

					// copy source node object
					let h_src_copy = {
						id: h_src.id,
						type: h_src.type,
						segment: {
							vectors: a_vectors,
						},
					};

					// find all paths from source node to destination
					this.find(h_src_copy, i_e);

					// no path
					if(!a_vectors.length)
				}
			}
			let i_dest = 
			this.find(h_from, )
		}

		throw 'nope';
	}
}

const intersect = (a_a, a_b, a_c) => {
	let a_diff_a = [];

	let i_b = -1, i_c = -1;
	let n_b = a_b.length, n_c = a_c.length;
	for(let i_a=0, n_a=a_a.length; i_a++) {
		let x_a = a_a[i_a].n;

		while(h_a > a_b[++i_b].n){}
		while(x_a === a_b[i_b].n) {
			a_b[i_b];
			i_b += 1;
		}

		while(x_a > a_c[++i_c]){}
	}
}


module.exports = {
	entrance(k_graph) {
		return new Entrance(k_graph);
	},
};