const graphy = require('../main/graphy.js');

const F_SORT_VALUE = (h_a, h_b) => {
	let x_a = h_a.value;
	let x_b = h_b.value;

	return x_a < x_b? -1
		: (x_a > x_b? 1: 0);
};

class NumberDatabase {
	constructor(k_graph) {
		Object.assign(this, {
			values: {},
			numbers: [],
			graph: k_graph,
		});
	}

	load(i_entity) {
		return this.values[i_entity];
	}

	index_of_low(x, b_include_equal_to) {
		let a_numbers = this.numbers;
		let i_lo=0, i_hi=a_numbers.length-1;
		let h_mid;
debugger;
		search:
		{
			for(; i_lo<=i_hi;) {
				let i_mid = (i_lo + i_hi) >>> 1;

				h_mid = a_numbers[i_mid];
				let x_mid = h_mid.value;

				// miss low
				if(x_mid < x) {
					i_lo = i_mid + 1;
				}
				// miss high
				else if(x_mid > x) {
					i_hi = i_mid - 1;
				}
				// hit
				else {
					break search;
				}
			}

			// [miss]
			return 
		}
		debugger;
	}

	index_of_high(x, b_include_equal_to) {
		debugger;
	}
}

const F_INCOMING_NUMBER = function(h_literal, i_id, fk_literal) {
	// parse literal's value
	let x_value = parseFloat(h_literal.value);

	// failed to parse number from literal's value
	if(isNaN(x_value)) return fk_literal(`'${h_literal.value}' is not a number`);

	// save value to lookup table indexed by term id
	this.values[i_id] = x_value;

	// push number to list
	this.numbers.push({
		value: x_value,
		id: i_id,
	});

	// acknowledge done with literal
	fk_literal();
};

const H_PLUGIN = {
	namespace: 'http://stko.geog.ucsb.edu/plugin/numbers/1.0',

	prefixes: {
		xsd: 'http://www.w3.org/2001/XMLSchema#',
	},

	instantiate(k_graph) {
		return new NumberDatabase();
	},

	incoming: {
		literals: {
			datatypes: {
				'xsd:integer': 	F_INCOMING_NUMBER,
				'xsd:decimal': 	F_INCOMING_NUMBER,
				'xsd:float': 	F_INCOMING_NUMBER,
				'xsd:double': 	F_INCOMING_NUMBER,
				'xsd:long': 	F_INCOMING_NUMBER,
				'xsd:int': 		F_INCOMING_NUMBER,
				'xsd:short': 	F_INCOMING_NUMBER,
				'xsd:byte': 	F_INCOMING_NUMBER,
				'xsd:unsignedLong': 	F_INCOMING_NUMBER,
				'xsd:unsignedInt': 		F_INCOMING_NUMBER,
				'xsd:unsignedShort': 	F_INCOMING_NUMBER,
				'xsd:unsignedByte': 	F_INCOMING_NUMBER,
				'xsd:positiveInteger': 	F_INCOMING_NUMBER,
				'xsd:negativeInteger': 	F_INCOMING_NUMBER,
				'xsd:nonPositiveInteger': 	F_INCOMING_NUMBER,
				'xsd:nonNegativeInteger': 	F_INCOMING_NUMBER,
			},
		},

		finish(k) {
			k.numbers.sort(F_SORT_VALUE);
		},
	},

	relations: {
		'<': {
			check: (k, i, x) => k.values[i] < x,

			find: (k, x) => ({
				ids: k.numbers.slice(0, k.index_of_high(x)).map(h => h.id),
			}),
		},

		'<=': {
			check: (k, i, x) => k.values[i] <= x,

			find: (k, x) => ({
				ids: k.numbers.slice(0, k.index_of_high(x, true)).map(h => h.id),
			}),
		},

		'>': {
			check: (k, i, x) => k.values[i] > x,

			find: (k, x) => ({
				ids: k.numbers.slice(k.index_of_low(x)).map(h => h.id),
			}),
		},

		'>=': {
			check: (k, i, x) => k.values[i] >= x,

			find: (k, x) => ({
				ids: k.numbers.slice(k.index_of_low(x, true)).map(h => h.id),
			}),
		},

		'==': {
			check: (k, i, x) => k.values[i] === x,

			find: (k, x) => {
				let i_lo = k.index_of_low(x, true);
				let a_numbers = k.numbers.length;
				let n_numbers = a_numbers.length;
				let i_hi = i_lo;
				for(; i_hi<n_numbers; i_hi++) {
					if(a_numbers[i_hi].value !== x) break;
				}
				return {
					ids: a_numbers.slice(i_lo, i_hi).map(h => h.id),
				};
			},
		},

		'!=': {
			check: (k, i, x) => k.values[i] !== x,

			find: (k, x) => {
				let i_hi = k.index_of_low(x, true);
				throw 'not yet implemented :P';
				// let a_numbers = k.numbers.length;
				// let n_numbers = a_numbers.length;
				// let i_hi = i_lo;
				// for(; i_hi<n_numbers; i_hi++) {
				// 	if(a_numbers[i_hi].value !== x) break;
				// }
				// return {
				// 	ids: a_numbers.slice(i_lo, i_hi).map(h => h.id),
				// };
			},
		},
	},
};

module.exports = function(a_additional_datatypes) {
	let h_plugin = Object.assign({}, H_PLUGIN);

	// user wants to add additional datatypes to parse as numbers
	if(a_additional_datatypes) {
		let h_datatypes = h_plugin.incoming.literals.datatypes;
		a_additional_datatypes.forEach((s_datatype) => {
			h_datatypes[s_datatype] = F_INCOMING_NUMBER;
		});
	}

	return h_plugin;
};
