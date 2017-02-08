

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

	get(i_entity) {
		return this.features[i_entity];
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

		// no features can be within point (other than )

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

@ // class Multipoint extends GeometricFeature {
@ // 	constructor(a_points) {
@ // 		let n_points = a_points.length;
@ // 		let at_points = new Float64Array(n_points << 1);
@ // 		let i_write = 0;
@ // 		@{each('point', 'h')}
@ // 			at_points[i_write] = h_point.x;
@ // 			at_points[i_write+1] = h_point.y;
@ // 			i_write += 2;
@ // 		@{end_each()}
@ // 		Object.assign(this, {
@ // 			size: n_points,
@ // 			points: at_points,
@ // 		});
@ // 	}
@ // }
@ // 
@ // class Polyline extends Multipoint {
@ // 
@ // }
@ // 
@ // class Polygon extends GeometricFeature {
@ // 	constructor(a_rings) {
@ // 		@{each('ring', 'a', 'points')}
@ // 			@{each('point', 'h')}
@ // 
@ // 			@{end_each()}
@ // 		@{end_each()}
@ // 	}
@ // }
@ // 
@ // const parseWKT = (s_wkt) => {
@ // 
@ // };

const GeospatialPlugin = graphy.plugin({
	namespace: 'http://awesemantic-geo.link/plugin/geospatial#1.0',
	instantiate(k_graph) {
		new GeospatialDatabase(k_graph);
	},
	incoming: {
		literals: {
			datatypes: {
				'http://www.opengis.net/ont/geosparql#wktLiteral': (k, h_literal, i_id, fk_literal) => {
					let k_geom;
					try {
						k_geom = parseWKT(h_literal.value)
					}
					catch(e_parse) {
						return fk_literal(e_parse);
					}

					k.features[i_id] = k_geom;
					fk_literal();
				},
			},
		},
		sinks: {
			predicates: {
				'http://www.opengis.net/ont/geosparql#asWKB': (k, h_sink, i_id, fk_sink) => {
					if(h_sink.isBlankNode) fk_sink('cannot dereference blank node');
					download_geometry(h_sink.value, (k_geom) => {
						k.features[i_id] = k_geom;
						fk_sink();
					});
				},
			},
		},
	},

	relations: {
		within: {
			check(k, i, x) {
				return k.features[i].within(x);
			},

			find(k, x) {
				return k.find_all_within(x);
			},

			compare(k, i_a, i_b) {
				return k.features[i_a].within(k.features[i_b]);
			},
		},
	},
});

k_graph.register('geometry', GeospatialPlugin);
