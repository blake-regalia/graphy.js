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

	}

	check(f_action, i_entity) {
		return f_action.apply({}, [this.check_methods])
	}

	find(f_action, i_entity) {
		return f_action.apply({}, [this.find_methods])
	}
}

class DataHelper {
	save() {

	}
}

class ScopedDataHelper extends DataHelper {

}

class RangedDataHelper extends DataHelper {
	relate(s_relation, ...a_args) {
		this.instance.
	}
}



const A_GEOSPATIAL_DATATYPES = [
	'http://www.opengis.net/ont/geosparql#wktLiteral',
];

const A_GEOSPATIAL_PREDICATES = [
	'http://www.opengis.net/ont/geosparql#asWKB',
];

class GeospatialDatabase {
	constructor() {
		Object.assign(this, {
			features: {},
		});
	}
}

const HP_GEOMETRIC_FEATURE_POINT = Symbol('point');
const HP_GEOMETRIC_FEATURE_POLYLINE = Symbol('polyline');
class GeometricFeature {
	constructor() {
		Object.assign(this, {
			type: ,
		});
	}

	within(k_other) {
		let h_bb_this this.bb;
		let h_bb_other = k_other.bb;

		// this bounding box within other bounding box
		if(h_bb_this.l >= h_bb_other.l && h_bb_this.r <= h_bb_other.r && h_bb_this.t <= h_bb_other.t && h_bb_this.b >= h_bb_other.b) {

		}

		return false;
	}
}

class Point extends GeometricFeature {
	constructor(x, y) {
		super(HP_GEOMETRIC_FEATURE_POINT);
		let at_point = new Float64Array(2);
		at_point[0] = x;
		at_point[1] = y;
		Object.assign(this, {
			point: at_point,
		});
	}
}

class Multipoint extends GeometricFeature {
	constructor(a_points) {
		let n_points = a_points.length;
		let at_points = new Float64Array(n_points << 1);
		let i_write = 0;
		@{each('point', 'h')}
			at_points[i_write] = h_point.x;
			at_points[i_write+1] = h_point.y;
			i_write += 2;
		@{end_each()}
		Object.assign(this, {
			size: n_points,
			points: at_points,
		});
	}
}

class Polyline extends Multipoint {

}

class Polygon extends GeometricFeature {
	constructor(a_rings) {
		@{each('ring', 'a', 'points')}
			@{each('point', 'h')}

			@{end_each()}
		@{end_each()}
	}
}

const parseWKT = (s_wkt) => {

};

const GeospatialPlugin = graphy.plugin({
	namespace: 'http://awesemantic-geo.link/plugin/geospatial#1.0',
	instantiate(k_graph) {
		new GeospatialDatabase(k_graph);
	},
	incoming: {
		literals: {
			datatypes: {
				['http://www.opengis.net/ont/geosparql#wktLiteral'](h_literal, i_id, fk_literal) {
					let k_geom;
					try {
						k_geom = parseWKT(h_literal.value)
					}
					catch(e_parse) {
						return fk_literal(e_parse);
					}

					this.features[i_id] = k_geom;
					fk_literal();
				},
			},
		},
		sinks: {
			predicates: {
				['http://www.opengis.net/ont/geosparql#asWKB'](h_sink, i_id, fk_sink) {
					if(h_sink.isBlankNode) fk_sink('cannot dereference blank node');
					download_geometry(h_sink.value, (k_geom) => {
						this.features[i_id] = k_geom;
						fk_sink();
					});
				},
			},
		},
	},

	relations: {
		within: {
			check(i, k) {
				return this.features[i_a].within(k);
			},

			find(k) {
				return this.find_all_within(k);
			},
		},
	},
});

k_graph.register('geometry', GeospatialPlugin);
