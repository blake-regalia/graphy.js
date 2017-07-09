
@ // import store macros
@include 'store.jmacs'

@{constants()}
@{encoders()}

const HP_SET_UNDEFINED = Symbol('undefined');

const h_plugins_repository = {};

class PluginLoader {
	constructor(h_plugin) {
		let s_namespace = h_plugin.namespace;
		if('string' !== typeof s_namespace) throw `plugin must have a 'namespace' property that denotes its URI`;
		if(h_plugins_repository[s_namespace]) throw `a plugin has already claimed the namespace '${s_namespace}' within this graphy instance`;
		h_plugins_repository[h_plugin.namespace] = h_plugin;

		this.plugin = h_plugin;
	}

	incoming() {
		return this.plugin.incoming;
	}

	check_methods() {
		let h_methods = this.plugin.methods;
		let h_check_methods = {};

		for(let s_method in h_methods) {
			let h_method = h_methods[s_method];

			// method missing check function
			if('function' !== typeof h_method.check) throw `plugin missing 'check' function for '${s_method}' method`;

			h_check_methods[s_method] = h_method.check;
		}

		return h_check_methods;
	}

	find_methods() {
		let h_methods = this.plugin.methods;
		let h_find_methods = {};

		for(let s_method in h_methods) {
			let h_method = h_methods[s_method];

			// method missing find function
			if('function' !== typeof h_method.find) throw `plugin missing 'find' function for '${s_method}' method`;

			h_find_methods[s_method] = h_method.find;
		}

		return h_find_methods;
	}
}

class PluginRegistry {
	constructor(k_graph) {
		Object.assign(this, {
			graph: k_graph,
			registry: {},
		});
	}

	register(h_load) {
		let k_graph = this.graph;

		for(let s_alias in h_load) {
			let h_loader = h_load[s_alias];

			if('string' !== typeof s_alias) throw `register alias must be a string; instead receieved a(n) '${s_alias? s_alias.constructor.name: s_alias}'`;
			if(this.registry[s_alias]) throw `a plugin has already been registered to this graph with the alias '${s_alias}'`;

			let s_namespace = h_loader.namespace;
			if('string' !== typeof s_namespace) throw `plugin must have a 'namespace' property that denotes its URI`;
			// if(h_plugins_repository[s_namespace]) throw `a plugin has already claimed the namespace '${s_namespace}' within this graphy instance`;

			// create instance to be sent to each method
			let k_instance = h_loader.instantiate(k_graph);

			// named categories
			let h_categories = {};

			// incoming
			if(h_loader.incoming) {
				let h_incoming = h_loader.incoming;

				// find and submit all terms plugin wants
				let c_terms_interest = 0;
				let c_terms_loaded = 0;

				// asynchronous
				let b_async = false;

				// plugin wants literals
				if(h_incoming.literals) {
					let h_specs = h_incoming.literals;

					// plugin wants literals of certain datatype(s)
					if(h_specs.datatypes) {
						let h_datatypes = h_specs.datatypes;
						for(let s_datatype in h_datatypes) {
							let f_handler = h_datatypes[s_datatype];
							@{compress_tt_node('s_datatype', 'continue', 'k_graph')}

							// find all literals that have the given datatype
							let ab_prefix = encode_utf_8('^'+s_word+'"');
							let i_lo = k_graph.section_l.find_prefix_low(ab_prefix);

							// at least one term has the given datatype
							if(i_lo) {
								let i_hi = k_graph.section_l.find_prefix_high(ab_prefix);

								// cycle through all literals of k_graph datatype
								for(let i_literal=i_lo; i_literal<=i_hi; i_literal++) {
									c_terms_interest += 1;

									// send each term to designated incoming handler
									f_handler.apply(k_instance, [k_graph.l(i_literal), i_literal, (e_handle) => {
										if(e_handle) console.warn(e_handle);
										c_terms_loaded += 1;

										// k_graph was final async term to be indexed
										if(b_async && c_terms_loaded === c_terms_interest) {
											if('function' === typeof h_incoming.finish) {
												h_incoming.finish(k_instance);
											}
										}
									}]);
								}
							}
						}
					}

					// plugin wants literals of certain language(s)
					let h_languages = h_specs.languages;
					if(h_languages) {
						for(let s_language in h_languages) {
							let f_handler = h_languages[s_language];

							// find all literals that have the given language
							let ab_prefix = encode_utf_8('@'+s_language.toLowerCase()+'"');
							let i_lo = k_graph.section_l.find_prefix_low(ab_prefix);

							// at least one term has the given language
							if(i_lo) {
								let i_hi = k_graph.section_l.find_prefix_high(ab_prefix);

								// cycle through all literals of this language
								for(let i_literal=i_lo; i_literal<=i_hi; i_literal++) {
									c_terms_interest += 1;

									// send each term to designated incoming handler
									f_handler.apply(k_instance, [k_graph.l(i_literal), i_literal, (e_handle) => {
										if(e_handle) console.warn(e_handle);
										c_terms_loaded += 1;

										// this was final async term to be indexed
										if(b_async && c_terms_loaded === c_terms_interest) {
											if('function' === typeof h_incoming.finish) {
												h_incoming.finish(k_instance);
											}
										}
									}]);
								}
							}
						}
					}
				}

				// plugin wants sinks
				if(h_incoming.sinks) {
					let h_specs = h_incoming.sinks;

					// find 
					if(h_specs.predicate) {

					}
				}

				// all terms were indexed synchronously
				if(c_terms_loaded === c_terms_interest) {
					if('function' === typeof h_incoming.finish) {
						h_incoming.finish(k_instance);
					}
				}
				// at least one term is asynchronous
				else {
					b_async = true;
				}
			}

			//
			if(h_loader.ranges) {
				let h_ranges = h_loader.ranges;

				if(h_ranges.literals) {
					let h_literals = h_ranges.literals;

					if(h_literals.languages) {
						let h_specs = h_literals.languages;
						let f_add = h_specs.add;
						h_specs.values.forEach((s_language) => {
							// find the range of literals that have the given language
							let ab_prefix = encode_utf_8('@'+s_language.toLowerCase()+'"');
							let i_lo = k_graph.section_l.find_prefix_low(ab_prefix);

							// no literals with given language
							if(!i_lo) return;

							// find upper bound
							let i_hi = k_graph.section_l.find_prefix_high(ab_prefix);

							// call add function
							let h_category = f_add(k_instance, s_language, i_lo, i_hi);

							// category
							if(h_category.name) {
								h_categories[h_category.name] = h_category;
							}
						});
					}

					if(h_literals.datatypes) {
						let h_specs = h_literals.datatypes;
						let f_add = h_specs.add;
						h_specs.values.forEach((s_datatype) => {
							@{compress_tt_node('s_datatype', 'return', 'k_graph')}

							// find all literals that have the given datatype
							let ab_prefix = encode_utf_8('^'+s_word+'"');
							let i_lo = k_graph.section_l.find_prefix_low(ab_prefix);

							// no literals with given language
							if(!i_lo) return;

							// find upper bound
							let i_hi = k_graph.section_l.find_prefix_high(ab_prefix);

							// call add function
							let h_category = f_add(k_instance, s_language, i_lo, i_hi);

							// category
							if(h_category.name) {
								h_categories[h_category.name] = h_category;
							}
						});
					}
				}
			}


			// sort check methods from find methods
			let h_methods = h_loader.relations;
			let h_check_methods = {};
			let h_find_methods = {};

			for(let s_method in h_methods) {
				let h_method = h_methods[s_method];

				// method missing check/find function
				if('function' !== typeof h_method.check) throw `plugin missing 'check' function for '${s_method}' method`;
				if('function' !== typeof h_method.find) throw `plugin missing 'find' function for '${s_method}' method`;

				// sort functions
				h_check_methods[s_method] = h_method.check;
				h_find_methods[s_method] = h_method.find;
			}

			//
			this.registry[s_alias] = new ActivePlugin({
				instance: k_instance,
				alias: s_alias,
				categories: h_categories,
				check_methods: h_check_methods,
				find_methods: h_find_methods,
			});
		}
	}

	// plugin(h_plugin) {
	// 	return new PluginLoader(h_plugin);
	// }
};


// load_plugins() {
// 	let h_registry = k_graph.registry;
// 	for(let s_alias in h_registry) {
// 		let h_register = h_registry[s_alias];

// 		if(!h_register.loader) continue;

// 		let k_loader = h_register.loader;

// 		let k_instance = k_loader.instantiate(k_graph);

// 		// find and submit all terms plugin wants
// 		let c_terms_interest = 0;
// 		let c_terms_loaded = 0;
// 		let h_incoming = k_loader.incoming();

// 		// plugin wants literals
// 		if(h_incoming.literals) {
// 			let h_specs = h_incoming.literals;

// 			// plugin wants literals of certain datatype(s)
// 			let h_datatypes = h_specs.datatypes;
// 			if(h_datatypes) {
// 				for(let s_datatype in h_datatypes) {
// 					let f_handler = h_datatypes[s_datatype];

// 					// find all literals that have the given datatype
// 					let ab_prefix = encode_utf_8('^'+s_datatype+'"');
// 					let i_lo = k_graph.section_l.find_prefix_low(ab_prefix);

// 					// at least one term has the given datatype
// 					if(i_lo) {
// 						let i_hi = k_graph.section_l.find_prefix_high(ab_prefix);

// 						// cycle through all literals of this datatype
// 						for(let i_literal=i_lo; i_literal<=i_hi; i_literal++) {
// 							c_terms_interest += 1;

// 							// send each term to designated incoming handler
// 							f_handler.apply(k_instance, [k_graph.produce(i_literal), i_literal, (e_handle) => {
// 								if(e_handle) console.warn(e_handle);
// 								c_terms_loaded += 1;
// 							}]);
// 						}
// 					}
// 				}
// 			}

// 			// plugin wants literals of certain language(s)
// 			let h_languages = h_specs.languages;
// 			if(h_languages) {
// 				for(let s_language in h_languages) {
// 					let f_handler = h_languages[s_language];

// 					// find all literals that have the given language
// 					let ab_prefix = encode_utf_8('@'+s_language.toLowerCase()+'"');
// 					let i_lo = k_graph.section_l.find_prefix_low(ab_prefix);

// 					// at least one term has the given language
// 					if(i_lo) {
// 						let i_hi = k_graph.section_l.find_prefix_high(ab_prefix);

// 						// cycle through all literals of this language
// 						for(let i_literal=i_lo; i_literal<=i_hi; i_literal++) {
// 							c_terms_interest += 1;

// 							// send each term to designated incoming handler
// 							f_handler.apply(k_instance, [k_graph.produce(i_literal), i_literal, (e_handle) => {
// 								if(e_handle) console.warn(e_handle);
// 								c_terms_loaded += 1;
// 							}]);
// 						}
// 					}
// 				}
// 			}
// 		}

// 		// plugin wants sinks
// 		if(h_incoming.sinks) {
// 			let h_specs = h_incoming.sinks;


// 		}
// 	}
// }


const H_EMPTY = {
	ids: [],
};

const intersect_id_ids = (i_a, a_b) => {
	if(a_b.includes(i_a)) {
		return {
			id: i_a,
		};
	}
	else {
		return H_EMPTY;
	}
};

const intersect_id_range = (i_a, h_b) => {
	if(h_b.low <= i_a && h_b.high >= i_a) {
		return {
			id: i_a,
		};
	}
	else {
		return H_EMPTY;
	}
};

const intersect = (a_a, a_b, a_c) => {
	let a_diff_a = [];

	let i_b = -1, i_c = -1;
	let n_b = a_b.length, n_c = a_c.length;
	for(let i_a=0, n_a=a_a.length; i<n_a; i_a++) {
		let x_a = a_a[i_a].n;

		while(x_a > a_b[++i_b].n){}
		while(x_a === a_b[i_b].n) {
			a_b[i_b];
			i_b += 1;
		}

		while(x_a > a_c[++i_c]){}
	}
}

// inputs should always be sorted
const intersect_ids_ids = (a_a, a_b) => {
	// output list
	let a_ids = [];

	// sweep
	for(let i_a=0, i_b=-1, nl_a=a_a.length; i_a<nl_a; i_a++) {
		let x_a = a_a[i_a];

		// skip all sorted items less than search
		while(x_a > a_b[++i_b]){}

		// hit
		if(x_a === a_b[i_b]) a_ids.push(x_a);
	}

	return {
		ids: a_ids,
	};
};

// inputs should always be sorted
const intersect_ids_range = (a_a, h_b) => {
	// output list
	let a_ids = [];

	// destructure range
	let {low:h_low, high:x_high} = h_b;

	// sweep
	for(let i_a=0, nl_a=a_a.length; i_a<nl_a; i_a++) {
		let x_a = a_a[i_a];

		// before range
		if(x_a < x_low) continue;

		// beyond range
		if(x_a > x_high) break;

		// within range
		a_ids.push(x_a);
	}

	return {
		ids: a_ids,
	};
};

const intersect_range_range = (h_a, h_b) => {
	let {low:x_low, high:x_high} = h_b;
	if(x_low > h_a.low) h_a.low = x_low;
	if(x_high < h_a.high) h_a.high = x_high;
	return h_a;
};

const intersect_constraints = (h_a, h_b) => {
	let h_swp = h_a;

	// a is null
	if(h_a === HP_SET_UNDEFINED) {
		return h_b;
	}
	// a has id
	else if(h_a.id) {
		// b has id
		if(h_b.id) {
			// exact same id
			if(h_a.id === h_b.id) {
				return h_a;
			}
			// different ids; empty
			else {
				return H_EMPTY;
			}
		}
		// b has list of ids
		else if(h_b.ids) {
			return intersect_id_ids(h_a.id, h_b.ids);
		}
		// b has range
		else if(h_b.range) {
			return intersect_id_range(h_a.id, h_b.range);
		}
		else {
			throw `bad constraint: ${h_b}`;
		}
	}
	// a has list of ids
	else if(h_a.ids) {
		// b has id
		if(h_b.id) {
			return intersect_id_ids(h_b.id, h_a.ids);
		}
		// b has list of ids too
		else if(h_b.ids) {
			return intersect_ids_ids(h_a.ids, h_b.ids);
		}
		// b has range
		else if(h_b.range) {
			return intersect_ids_range(h_a.ids, h_b.range);
		}
		else {
			throw `bad constraint: ${h_b}`;
		}
	}
	// a has range
	else if(h_a.range) {
		// b has id
		if(h_b.id) {
			return intersect_id_range(h_b.id, h_a.range);
		}
		// b has list of ids
		else if(h_b.ids) {
			return intersect_ids_range(h_b.ids, h_b.range);
		}
		// b has range
		else if(h_b.range) {
			return {
				range: intersect_range_range(h_a.range, h_b.range),
			};
		}
		else {
			throw `bad constraint: ${h_b}`;
		}
	}
	else {
		throw `bad constraint: ${h_b}`;
	}
};


class ActivePlugin {
	constructor(h_this) {
		Object.assign(this, h_this);
		// {
		// 	checker: new DataPluginChecker(this),
		// 	finder: new DataPluginFinder(this),
		// });
	}

	action(f_action, h_methods, i_lo=0, i_hi=0) {
		let k_action = f_action(new DataActionBuilder());

		// method did not construct data action
		if(!(k_action instanceof DataActionBuilder)) {
			throw 'method did not return a valid data action';
		}

		// what to give back to the iterator
		let h_handle = {};

		// series of evaluation functions to apply
		let a_evaluations = [];

		// constrain object
		let h_constraint = HP_SET_UNDEFINED;

		// save
		if(k_action._save) {
			h_handle.save = k_action._save;
		}

		// categories
		if(k_action._categories.length) {
			// each categroy
			k_action._categories.forEach((s_category) => {
				// update constraint range
				h_constraint = intersect_constraints(h_constraint, this.categories[s_category]);
			});
		}

		// perform relation
		if(k_action._relations.length) {
			k_action._relations.forEach((h_relation) => {
				let s_operator = h_relation.operator;

				// operator not exists
				if(!(s_operator in h_methods)) throw `'${this.alias}' plugin has no relational operator '${s_operator}'; <${this.iri}>`;

				// return method function
				let f_method = h_methods[s_operator];
				let a_args = h_relation.args;

				// find method
				if(i_hi) {
					// update constraint
					h_constraint = intersect_constraints(h_constraint, f_method(this.instance, i_entity, ...a_args, i_lo, i_hi));
				}
				// check method
				else {
					a_evaluations.push((i_entity) => {
						return f_method(this.instance, i_entity, ...a_args, i_lo, i_hi);
					});
				}
			});
		}


		// find method
		if(i_hi) {
			if(h_constraint !== HP_SET_UNDEFINED) {
				// exact id constraint
				if(h_constraint.id) {
					h_handle.id = h_constraint.id;
				}
				// list of ids
				else if(h_constraint.ids) {
					// empty, no need to evaluate
					if(!h_constraint.ids) {
						a_evaluations.length =0 ;
					}
					// non empty list of ids
					else {
						h_handle.ids = h_constraint.ids;
					}
				}
				// range
				else if(h_constraint.range) {
					h_handle.range = h_constraint.range;
				}
			}
		}
		// check method
		else {
			a_evaluations.push((i_entity) => {
				return !!intersect_constraints(h_constraint, {id:i_entity}).id;
			});
		}


		// there are evaluations to perform
		if(a_evaluations.length) {
			// single evaluation
			if(1 === a_evaluations.length) {
				h_handle.evaluate = a_evaluations[0];
			}
			// multiple evaluations
			else {
				// find method
				if(i_hi) {
					h_handle.evaluate = (i_entity) => {
						let h_individual;

						a_evaluations.forEach((f_eval) => {
							// intersect constraints from eval with base
							h_individual = intersect_constraints(h_constraint, f_eval(i_entity));
						});

						return h_individual;
					}
				}
				// check method
				else {
					h_handle.evaluate = (i_entity) => {
						return a_evaluations.every((f_eval) => f_eval(i_entity));
					};
				}
			}
		}

		return h_handle;
	}

	checker(f_action) {
		return this.action(f_action, this.check_methods);
	}

	find(f_action, i_lo, i_hi) {
		return this.action(f_action, this.find_methods, i_lo, i_hi);
	}
}



// class ActivePlugin {
// 	constructor(h_this) {
// 		Object.assign(this, h_this);
// 	}

// 	action(f_action, h_methods, i_lo=0, i_hi=0) {
// 		let k_action = f_action(new DataActionBuilder());

// 		// method did not construct data action
// 		if(!(k_action instanceof DataActionBuilder)) {
// 			throw 'method did not return a valid data action';
// 		}

// 		// what to give back to the iterator
// 		let h_handle = {};

// 		// save
// 		if(k_action.save_name) {
// 			h_handle.save = k_action.save_name;
// 		}

// 		// perform relation
// 		if(k_action.relate) {
// 			let h_relate = k_action.relate;
// 			let s_relation = h_relate.relation;

// 			// relation not exists
// 			if(!(s_relation in h_methods)) throw `'${this.alias}' plugin has no relation called '${s_relation}'; <${this.iri}>`;

// 			// return method function
// 			let f_method = h_methods[s_relation];
// 			let a_args = h_relate.args;

// 			// find method
// 			if(i_lo) {
// 				let h_found = f_method(this.instance, ...a_args, i_lo, i_hi);

// 				// found range
// 				if(h_found.range) {
// 					let h_range = h_found.range;

// 					// trim low and high to range bounds
// 					h_handle.range = {
// 						low: Math.max(i_lo, h_range.low),
// 						high: Math.min(i_hi, h_range.high),
// 					};
// 				}
// 				// found list of ids
// 				else if(h_found.ids) {
// 					let a_founds_ids = h_found.ids;
// 					let n_found_ids = a_founds_ids.length;

// 					// assume sorted list, first and last fall within range
// 					if(a_founds_ids[0] >= i_lo && a_founds_ids[n_found_ids] <= i_hi) {
// 						h_handle.ids = a_founds_ids;
// 					}
// 					// out of bounds
// 					else {
// 						let a_ids = h_handle.ids = [];
// 						for(let i_found_id=0; i_found_id<n_found_ids; i_found_id++) {
// 							let i_id = a_founds_ids[i_found_id];
// 							if(i_id >= i_lo && i_id <= i_hi) a_ids.push(i_id);
// 						}
// 					}
// 				}
// 				// found single id
// 				else if(h_found.id) {
// 					let i_id = h_found.id;

// 					// id falls out of bounds
// 					if(i_id < i_lo || i_id > i_hi) {
// 						h_handle.ids = [];
// 					}
// 					// id within bounds
// 					else {
// 						h_handle.id = h_found.id;
// 					}
// 				}
// 			}
// 			// check method
// 			else {
// 				h_handle.evaluate = (i_entity) => f_method(this.instance, i_entity, ...a_args);
// 			}
// 		}

// 		return h_handle;
// 	}

// 	checker(f_action) {
// 		return this.action(f_action, this.check_methods);
// 	}

// 	find(f_action, i_lo, i_hi) {
// 		return this.action(f_action, this.find_methods, i_lo, i_hi);
// 	}
// }



class DataActionBuilder {
	constructor() {
		Object.assign(this, {
			_save: null,
			_categories: [],
			_relations: [],
		});
	}

	save(s_name) {
		this._save = s_name;
		return this;
	}

	in(s_category) {
		this._categories.push(s_category);
		return this;
	}

	is(s_operator, ...a_args) {
		this._relations.push({
			operator: s_operator,
			args: a_args,
		});
		return this;
	}
}


module.exports = PluginRegistry;
