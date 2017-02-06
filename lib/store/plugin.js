
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

module.exports = {
	plugin(h_plugin) {
		return new PluginLoader(h_plugin);
	},
};


register(s_alias, k_plugin_loader) {
	if('string' !== typeof s_alias) throw `register alias must be a string; instead receieved a(n) '${s_alias? s_alias.constructor.name: s_alias}'`;
	if(!(k_plugin_loader instanceof PluginLoader)) throw `to register a plugin, you must first create one by calling graphy.plugin(..)`;
	if(this.registry[s_alias]) throw `a plugin has already been registered to this graph with the alias '${s_alias}'`;

	this.registry[s_alias] = {
		loader: k_plugin_loader,
	};
}

load_plugins() {
	let h_registry = this.registry;
	for(let s_alias in h_registry) {
		let h_register = h_registry[s_alias];

		if(!h_register.loader) continue;

		let k_loader = h_register.loader;

		let k_instance = k_loader.instantiate(this);

		// find and submit all terms plugin wants
		let c_terms_interest = 0;
		let c_terms_loaded = 0;
		let h_incoming = k_loader.incoming();

		// plugin wants literals
		if(h_incoming.literals) {
			let h_specs = h_incoming.literals;

			// plugin wants literals of certain datatype(s)
			let h_datatypes = h_specs.datatypes;
			if(h_datatypes) {
				for(let s_datatype in h_datatypes) {
					let f_handler = h_datatypes[s_datatype];

					// find all literals that have the given datatype
					let ab_prefix = encode_utf_8('^'+s_datatype+'"');
					let i_lo = this.section_l.find_prefix_low(ab_prefix);

					// at least one term has the given datatype
					if(i_lo) {
						let i_hi = this.section_l.find_prefix_high(ab_prefix);

						// cycle through all literals of this datatype
						for(let i_literal=i_lo; i_literal<=i_hi; i_literal++) {
							c_terms_interest += 1;

							// send each term to designated incoming handler
							f_handler.apply(k_instance, [this.produce(i_literal), i_literal, (e_handle) => {
								if(e_handle) console.warn(e_handle);
								c_terms_loaded += 1;
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
					let i_lo = this.section_l.find_prefix_low(ab_prefix);

					// at least one term has the given language
					if(i_lo) {
						let i_hi = this.section_l.find_prefix_high(ab_prefix);

						// cycle through all literals of this language
						for(let i_literal=i_lo; i_literal<=i_hi; i_literal++) {
							c_terms_interest += 1;

							// send each term to designated incoming handler
							f_handler.apply(k_instance, [this.produce(i_literal), i_literal, (e_handle) => {
								if(e_handle) console.warn(e_handle);
								c_terms_loaded += 1;
							}]);
						}
					}
				}
			}
		}

		// plugin wants sinks
		if(h_incoming.sinks) {
			let h_specs = h_incoming.sinks;


		}
	}
}


class ActivePlugin {
	constructor() {
		Object.assign(this, {
			checker: new DataPluginChecker(this),
			finder: new DataPluginFinder(this),
		});
	}

	action(f_action, h_methods, i_find_from=0) {
		let k_action = f_action(new DataActionBuilder());

		// method did not construct data action
		if(!(k_action instanceof DataActionBuilder)) {
			throw 'method did not return a valid data action';
		}

		// what to give back to the iterator
		let h_handle = {};

		// save
		if(k_action.save) {
			h_handle.save = k_action.save;
		}

		// perform relation
		if(k_action.relate) {
			let h_relate = k_action.relate;
			let s_relation = h_relate.relation;

			// relation not exists
			if(!(s_relate in h_methods)) throw `'${this.alias}' plugin has no relation called '${s_relation}'; <${this.iri}>`;

			// return method function
			let f_method = h_methods[s_relation];
			let a_args = h_relate.args;

			// find method
			if(i_find_from) {
				Object.assign(h_handle, f_method(this.instance, i_find_from, ...a_args));
			}
			// check method
			else {
				h_handle.evaluate = (i_entity) => f_method(this.instance, i_entity, ...a_args);
			}
		}

		return h_handle;
	}

	checker(f_action) {
		return this.action(f_action, this.check_methods);
	}

	find(f_action, i_entity) {
		return this.action(f_action, this.find_methods, i_entity);
	}
}

class DataActionBuilder {
	save(s_name) {
		this.save = s_name;
		return this;
	}

	relate(s_relation, ...a_args) {
		this.relate = {
			relation: s_relation,
			args: a_args,
		};
		return this;
	}
}

