const expect = require('chai').expect;

const factory = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/core.data.factory`);
const dataset_tree = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/util.dataset.tree`);
const helper = require('../../../helper.js');

const map_tree = (h_tree, f_onto, a_path=[]) => {
	for(let s_key in h_tree) {
		let z_leaf = h_tree[s_key];

		if('function' === typeof z_leaf) {
			it(s_key, () => {
				f_onto(z_leaf, a_path);
			});
		}
		else {
			describe(s_key, () => {
				map_tree(z_leaf, f_onto, [...a_path, s_key]);
			});
		}
	}
};

const onto_relational = f_relation => (f_leaf, a_path) => {
	let {
		a: a_a,
		b: a_b,
		expect: z_expect,
	} = f_leaf();

	let k_tree_a = dataset_tree();
	let k_tree_b = dataset_tree();

	for(let g_quad_a of a_a.map(helper.o4)) {
		k_tree_a.add(g_quad_a);
	}

	for(let g_quad_b of a_b.map(helper.o4)) {
		k_tree_b.add(g_quad_b);
	}

	let s_action = a_path[a_path.length-1];
	let z_result = k_tree_a[s_action](k_tree_b);

	f_relation(z_result, z_expect);
};

const methods_set = (h_tree) => {
	map_tree(h_tree, onto_relational((k_tree_out, a_expect) => {
		helper.validate_quads_unordered(k_tree_out.quads(), a_expect);
	}));
};

const methods_boolean = (h_tree) => {
	map_tree(h_tree, onto_relational((b_result, b_expect) => {
		expect(b_result).to.equal(b_expect);
	}));
};

// const methods_generators = (h_tree) => {
// 	map_tree(h_tree, )
// };

describe('dataset_tree set methods', () => {
	let a_simple = [
		['z://a', 'z://b', 'z://c', 'z://g'],
		['z://a', 'z://b', '"c', 'z://g'],
		['z://a', 'z://b', '^z://d"c', 'z://g'],
		['_:a', 'z://b', 'z://c', 'z://g'],
		['z://a', 'z://b', '_:c', 'z://:g'],
		['z://a', 'z://b', 'z://c', '_:g'],
		['_:a', 'z://b', '_:c', 'z://g'],
		['_:a', 'z://b', 'z://c', '_:g'],
		['z://a', 'z://b', '_:c', '_:g'],
		['_:a', 'z://b', '_:c', '_:g'],
	];

	methods_set({
		union: {
			'both blank': () => ({
				a: [],
				b: [],
				expect: [],
			}),
			'a blank': () => ({
				a: [],
				b: a_simple,
				expect: a_simple,
			}),
			'b blank': () => ({
				a: a_simple,
				b: [],
				expect: a_simple,
			}),
			'both same': () => ({
				a: a_simple,
				b: a_simple,
				expect: a_simple,
			}),
			'both different': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'overlap in a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'overlap in b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'a includes b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'b includes a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
		},

		intersection: {
			'both blank': () => ({
				a: [],
				b: [],
				expect: [],
			}),
			'a blank': () => ({
				a: [],
				b: a_simple,
				expect: [],
			}),
			'b blank': () => ({
				a: a_simple,
				b: [],
				expect: [],
			}),
			'both same': () => ({
				a: a_simple,
				b: a_simple,
				expect: a_simple,
			}),
			'both different': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [],
			}),
			'overlap in a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
			}),
			'overlap in b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
			}),
			'a includes b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
			}),
			'b includes a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
			}),
		},

		difference: {
			'both blank': () => ({
				a: [],
				b: [],
				expect: [],
			}),
			'a blank': () => ({
				a: [],
				b: a_simple,
				expect: a_simple,
			}),
			'b blank': () => ({
				a: a_simple,
				b: [],
				expect: a_simple,
			}),
			'both same': () => ({
				a: a_simple,
				b: a_simple,
				expect: [],
			}),
			'both different': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'overlap in a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'overlap in b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'a includes b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'b includes a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
		},

		minus: {
			'both blank': () => ({
				a: [],
				b: [],
				expect: [],
			}),
			'a blank': () => ({
				a: [],
				b: a_simple,
				expect: [],
			}),
			'b blank': () => ({
				a: a_simple,
				b: [],
				expect: a_simple,
			}),
			'both same': () => ({
				a: a_simple,
				b: a_simple,
				expect: [],
			}),
			'both different': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
			}),
			'overlap in a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
			}),
			'overlap in b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
				],
			}),
			'a includes b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'b includes a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [],
			}),
		},
	});
});

describe('dataset_tree set booleans', () => {
	let a_simple = [
		['z://a', 'z://b', 'z://c', 'z://g'],
		['z://a', 'z://b', '"c', 'z://g'],
		['z://a', 'z://b', '^z://d"c', 'z://g'],
		['_a', 'z://b', 'z://c', 'z://g'],
		['z://a', 'z://b', '_c', 'z://g'],
		['z://a', 'z://b', 'z://c', '_g'],
		['_a', 'z://b', '_c', 'z://g'],
		['_a', 'z://b', 'z://c', '_g'],
		['z://a', 'z://b', '_c', '_g'],
		['_a', 'z://b', '_c', '_g'],
	];
	let a_simple_reverse = a_simple.reverse();

	methods_boolean({
		equals: {
			'both blank': () => ({
				a: [],
				b: [],
				expect: true,
			}),
			'a blank': () => ({
				a: [],
				b: a_simple,
				expect: false,
			}),
			'b blank': () => ({
				a: a_simple,
				b: [],
				expect: false,
			}),
			'both same': () => ({
				a: a_simple,
				b: a_simple,
				expect: true,
			}),
			'equivalent sets': () => ({
				a: a_simple,
				b: a_simple_reverse,
				expect: true,
			}),
			'both different': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: false,
			}),
			'a includes b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: false,
			}),
			'b includes a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: false,
			}),
		},
		includes: {
			'both blank': () => ({
				a: [],
				b: [],
				expect: true,
			}),
			'a blank': () => ({
				a: [],
				b: a_simple,
				expect: false,
			}),
			'b blank': () => ({
				a: a_simple,
				b: [],
				expect: true,
			}),
			'both same': () => ({
				a: a_simple,
				b: a_simple,
				expect: true,
			}),
			'equivalent sets': () => ({
				a: a_simple,
				b: a_simple_reverse,
				expect: true,
			}),
			'both different': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: false,
			}),
			'overlap in a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: false,
			}),
			'overlap in b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: false,
			}),
			'a includes b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: true,
			}),
			'b includes a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: false,
			}),
		},
	});
});

describe('mutability', () => {
	let mutate_orig = (h_trees) => {
		h_trees.orig.add(...factory.c3({
			'>z://a': {
				'>z://b': '>z://z',
			},
		}));
	};

	let expect_sizes = (h_trees, h_expect) => {
		for(let s_name in h_trees) {
			expect(h_trees[s_name]).to.have.property('size', h_expect[s_name]);
		}
	};

	let mutability_modes = (h_modes) => {
		for(let s_mode in h_modes) {
			let {
				trees: h_trees_src,
				check: f_check,
				debug: b_debug=false,
			} = h_modes[s_mode];

			let k_tree_orig = dataset_tree();
			k_tree_orig.add(...factory.c3({
				'>z://a': {
					'>z://b': '>z://c',
				},
			}));
			let h_trees_dst = {
				orig: k_tree_orig,
			};

			for(let s_tree in h_trees_src) {
				let z_value = h_trees_src[s_tree];
				if('function' === typeof z_value) {
					h_trees_dst[s_tree] = z_value(h_trees_dst);
				}
				else {
					let k_tree_invent = h_trees_dst[s_tree] = dataset_tree();
					k_tree_invent.add(...factory.c3(h_trees_src[s_tree]));
				}
			}

			it(s_mode, () => {
				f_check(h_trees_dst);
			});
		}
	};

	describe('copy does not change', () => {
		mutability_modes({
			'new object after union empty': {
				trees: {
					empty: {},
					copy: h => h.orig.union(h.empty),
				},
				check(h_trees) {
					mutate_orig(h_trees);
					expect_sizes(h_trees, {
						orig: 2,
						empty: 0,
						copy: 1,
					});
				},
			},

			'new object after union identity': {
				trees: {
					copy: h => h.orig.union(h.orig),
				},
				check(h_trees) {
					mutate_orig(h_trees);
					expect_sizes(h_trees, {
						orig: 2,
						copy: 1,
					});
				},
			},

			'new object after union same': {
				trees: {
					other: {
						'>z://a': {
							'>z://b': '>z://c',
						},
					},
					copy: h => h.orig.union(h.other),
				},
				check(h_trees) {
					mutate_orig(h_trees);
					expect_sizes(h_trees, {
						orig: 2,
						other: 1,
						copy: 1,
					});
				},
			},

			'new object after union different': {
				debug: true,
				trees: {
					other: {
						'>z://a': {
							'>z://b': '>z://d',
						},
					},
					copy: h => h.orig.union(h.other),
				},
				check(h_trees) {
					mutate_orig(h_trees);
					expect_sizes(h_trees, {
						orig: 2,
						other: 1,
						copy: 2,
					});
				},
			},
		});
	});
});

// describe('dataset_tree generators', () => {
// 	methods_generators({
// 		quads: {
// 			empty: () => ({
// 				in: [],
// 				expect: [],
// 			}),
// 		},
// 	});
// });
