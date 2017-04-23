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
		for(let s_language in h_ranges) {
			let h_range = h_ranges[s_language];
			if(i_entity >= h_range.low && i_entity <= h_range.high) {
				return s_language;
			}
		}
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
					return {
						name: s_language,
						range: {
							low: i_lo,
							high: i_hi,
						},
					};
				},
			},
		},
	},
};

module.exports = function(a_languages=[]) {
	let h_plugin = Object.assign({}, H_PLUGIN);

	// set which languages to store ranges
	h_plugin.ranges.literals.languages.values.push(...a_languages);

	return h_plugin;
};
