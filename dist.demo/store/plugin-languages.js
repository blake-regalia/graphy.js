const graphy = require('../main/graphy.js');
class LanguageRanges {
	constructor(k_graph) {
		Object.assign(this, {
			ranges: {},
			graph: k_graph,
		});
	}
	load(i_entity) {
		let h_ranges = this.ranges;
		for (let s_language in h_ranges) {
			let h_range = h_ranges[s_language];
			if (i_entity >= h_range.low && i_entity <= h_range.high) {
				return s_language;
			}
		}
	}
	add_range(s_language, i_lo, i_hi) {
		this.ranges[s_language] = {
			low: i_lo,
			high: i_hi,
		};
	}
}
const H_PLUGIN = {
	namespace: 'http://stko.geog.ucsb.edu/plugin/languages/1.0',
	instantiate(k_graph) {
		return new LanguageRanges();
	},
	ranges: {
		literals: {
			languages: {
				values: [],
				add: (k, s_language, i_lo, i_hi) => {
					return k.add_range(s_language, i_lo, i_hi);
				},
			},
		},
	},
	relations: {
		is: {
			check: (k, i, s) => {
				let h_range = k.ranges[s];
				return i >= h_range.low && i <= h_range.high;
			},
			find: (k, s) => ({
				range: k.ranges[s]
			}),
		},
	},
};
module.exports = function(a_languages = []) {
	let h_plugin = Object.assign({}, H_PLUGIN);
	// set which languages to store ranges
	h_plugin.ranges.literals.languages.values.push(...a_languages);
	return h_plugin;
};