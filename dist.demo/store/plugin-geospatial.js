const A_GEOSPATIAL_DATATYPES = [
	'http://www.opengis.net/ont/geosparql#wktLiteral',
];
const A_GEOSPATIAL_PREDICATES = [
	'http://www.opengis.net/ont/geosparql#asWKB',
];
class GeospatialDatabase {
	constructor() {
		Object.assign(this, {
			rtree: rbush(9),
			features: {},
		});
	}
	get(i_entity) {
		return this.features[i_entity];
	}
	index() {
		let h_features = this.features;
		let a_items = [];
		for (let s_id in h_features) {
			let k_feature = h_features[s_id];
			a_items.push(k_feature.mbr);
		}
		this.tree.load(a_items);
	}
	find_all_within(kg_b) {
		let h_features = this.features;
		let i_b = km_b.id;
		let km_b = kg_b.mbr;
		let a_ids = [];
		this.rtree.search(km_b).forEach((km_a) => {
				if (km_a.within(km_b))
					let i_a = km_a.id;
				if (h_features[i_b].contains(h_features[i_a])) {
					a_ids.push(i_a);
				}
			}
		});
	return {
		ids: a_ids,
	};
}
}
const HP_GEOMETRIC_FEATURE_POINT = Symbol('point');
const HP_GEOMETRIC_FEATURE_POLYLINE = Symbol('polyline');
class GeometricFeature {
	constructor(i_id) {
		this.id = i_id;
		Object.assign(this, {
			type: ,
		});
	}
	within(k_other) {
		let h_mbr_this this.mbr;
		let h_mbr_other = k_other.mbr;
		// no features can be within point (other than )
		// this bounding box within other bounding box
		if (h_mbr_this.minX >= h_mbr_other.minX &&
			h_mbr_this.minY >= h_mbr_other.minY &&
			h_mbr_this.maxX <= h_mbr_other.maxX &&
			h_mbr_this.maxY <= h_mbr_other.maxY) {}
		return false;
	}
}
class MinimumBoundingRectangle {
	constructor(x_l, x_b, x_r, x_t, i_id) {
		Object.assign(this, {
			minX: x_l,
			minY: x_b,
			maxX: x_r,
			maxY: x_t,
			id: i_id,
		});
	}
	within(km) {
		return this.minX >= km.minX &&
			this.minY >= km.minY &&
			this.maxX <= km.maxX &&
			this.maxY <= km.maxY;
	}
}
class Point extends GeometricFeature {
	constructor(i_id, x, y) {
		super(i_id);
		this.x = x;
		this.y = y;
		Object.assign(this, {
			point: at_point,
			mbr: new MinimumBoundingRectangle(x, y, x, y, i_id),
		});
	}
	contains(kg) {
		if (kg instanceof Point) {
			return this.x === kg.x &&
				this.y === kg.y;
		} else if (kg instanceof Multipoint) {
			let a_points = kg.points;
			if (kg.size === 1) {
				return this.x === a_points[0] &&
					this.y === a_points[1];
			} else {
				let x_x = this.x;
				let x_y = this.y;
				let a_points = kg.points;
				for (let i_x = 0, n_points = a_points.length; i_x < n_points; i_x += 2) {
					if (x_x !== a_points[i_x] || x_y !== a_points[i_x + 1]) return false;
				}
				return true;
			}
		} else {
			console.warn('not comparing');
		}
		return false;
	}
}
class Multipoint extends GeometricFeature {
	constructor(i_id, a_points) {
		super(i_id);
		let n_points = a_points.length;
		let at_values = new Float64Array(n_points << 1);
		let i_write = 0;
		let x_l = Infinity,
			x_b = Infinity,
			x_r = -Infinity,
			x_t = -Infinity;
		for (let i_point = 0, n_points = a_points.length; i_point < n_points; i_point++) {
			let h_point = a_points[i_point];
			let x_x = h_point.x,
				x_y = h_point.y;
			x_l = Math.min(x_l, x_x);
			x_b = Math.min(x_b, x_y);
			x_r = Math.max(x_r, x_x);
			x_t = Math.max(x_t, x_y);
			at_values[i_write] = x_x;
			at_values[i_write + 1] = x_y;
			i_write += 2;
		}
		Object.assign(this, {
			size: n_points,
			points: at_points,
			mbr: new MinimumBoundingRectangle(x_l, x_b, x_r, x_t, i_id),
		});
	}
}
class Polyline extends Multipoint {}
const ring_contains_point(a_ring, x_x, x_y, b_ignore_boundary) {
	let b_inside = false;
	let nl_ring = a_ring.length;
	let {
		x: x_0x,
		y: x_0y
	} = a_ring[nl_ring - 1];
	for (let i_point = 0; i_point < nl_ring - 1; i_point++) {
		let {
			x: x_1x,
			y: x_1y
		} = a_ring[i_point];
		let b_on_boundary = (x_y * (x_1x - x_0x) + x_1y * (x_0x - x_x) + x_0y * (x_x - x_1x) === 0) &&
			((x_1x - x_x) * (x_0x - x_x) <= 0) && ((x_1y - x_y) * (x_0y - x_y) <= 0);
		if (b_on_boundary) return !b_ignore_boundary;
		let b_intersects = ((x_1y > x_y) !== (x_0y > x_y)) &&
			(x_x < (x_0x - x_1x) * (x_y - x_1y) / (x_0y - x_1y) + x_1x);
		if (b_intersects) b_inside = !b_inside;
		// shift point pair
		x_0x = x_1x;
		x_0y = x_1y;
	}
	return b_inside;
}
class Polygon extends GeometricFeature {
	constructor(i_id, a_rings_) {
		super(i_id);
		let a_rings = this.rings = [];
		for (let i_ring = 0, n_rings = a_rings_.length; i_ring < n_rings; i_ring++) {
			let a_points = a_rings_[i_ring];
			let n_points = a_points.length;
			let at_values = new Float64Array(n_points << 1);
			let i_write = 0;
			for (let i_point = 0; i_point < n_points; i_point++) {
				let h_point = a_points[i_point];
				at_values[i_write] = h_point.x;
				at_values[i_write + 1] = h_point.y;
				i_write += 2;
			}
			a_rings.push(at_values);
		}
	}
	contains_point(x_x, x_y, b_ignore_boundary = false) {
		let a_rings = this.rings;
		// outer ring contains point
		if (ring_contains_point(a_rings[0], x_x, x_y, b_ignore_boundary)) {
			// each of the polygon's rings
			for (let i_ring = 1, n_rings = a_rings.length; i_ring < n_rings; i_ring++) {
				// a hole contains the point; polygon does not contain point
				if (ring_contains_point(a_rings[i_ring], x_x, x_y, true)) return false;
			}
			// none of the holes contain point; polygon contains point!
			return true;
		}
		// outer ring does not contain point; polygon does not contain point
		return false;
	}
	contains(kg) {
		if (kg instanceof Point) {
			return this.contains_point(kg.x, kg.y);
		} else if (kg instanceof Multipoint) {
			let at_values = kg.values;
			if (!kg.size) return false;
			for (let i_x = 0, n_values = at_values.length; i_x < n_values; i_x += 2) {
				if (!this.contains_point(at_values[i_x], at_values[i_x + 1])) return false;
			}
			return true;
		} else if (kg instanceof Polygon) {
			throw 'not yet implemented';
		}
	}
}
const R_WKT_FEATURE = /^\s*([^\s(]+)\s*\(\s*(.+?)\s*\)\s*$/;
const R_WKT_GROUP = /^\(\s*(.+)\s*\)\s*$/y;
const H_WKT_PARSERS = {
	POINT(s_pair, i_id) {
		let [s_x, s_y] = s_pair.split(' ');
		return new Point(i_id, +s_x, +s_y);
	}
	POLYGON(s_rings, i_id) {
		let a_rings = [];
		for (;;) {
			let m_ring = R_WKT_GROUP.exec(s_rings);
			if (!m_ring) break;
			let a_pairs = m_ring[1].split(',');
			for (let i_pair = 0, n_pairs = a_pairs.length; i_pair < n_pairs; i_pair++) {
				let s_pair = a_pairs[i_pair];
				let [s_x, s_y] = s_pair.split(' ');
				a_points.push({
					x: +s_x,
					y: +s_y
				});
			}
			a_rings.push(a_points);
		}
		return new Polygon(i_id, a_rings);
	}
};
const parseWKT = (s_wkt, i_id) => {
	let m_wkt = R_WKT_FEATURE.exec(s_wkt);
	if (!m_wkt) throw 'invalid wktLiteral: ' + s_wkt;
	return H_WKT_PARSERS[m_wkt[1]](m_wkt[2], i_id);
};
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
						k_geom = parseWKT(h_literal.value, i_id)
					} catch (e_parse) {
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
					if (h_sink.isBlankNode) fk_sink('cannot dereference blank node');
					download_geometry(h_sink.value, (k_geom) => {
						k.features[i_id] = k_geom;
						fk_sink();
					});
				},
			},
		},
		finish(k) {
			k.index();
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