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
		debug: b_debug=false,
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

describe('dataset_tree mutators', () => {
	let g_abcg = factory.quad(...[
		factory.namedNode('z://a'),
		factory.namedNode('z://b'),
		factory.namedNode('z://c'),
		factory.namedNode('z://g'),
	]);

	let g_abdg = factory.quad(...[
		factory.namedNode('z://a'),
		factory.namedNode('z://b'),
		factory.namedNode('z://d'),
		factory.namedNode('z://g'),
	]);

	let g_adcg = factory.quad(...[
		factory.namedNode('z://a'),
		factory.namedNode('z://d'),
		factory.namedNode('z://c'),
		factory.namedNode('z://g'),
	]);

	let g_dbcg = factory.quad(...[
		factory.namedNode('z://d'),
		factory.namedNode('z://b'),
		factory.namedNode('z://c'),
		factory.namedNode('z://g'),
	]);

	let g_abcd = factory.quad(...[
		factory.namedNode('z://a'),
		factory.namedNode('z://b'),
		factory.namedNode('z://c'),
		factory.namedNode('z://d'),
	]);

	describe('add / addQuads', () => {
		it('blank on empty', () => {
			let k_tree = dataset_tree();
			expect(k_tree.addQuads([])).to.equal(0);
			expect(k_tree).to.have.property('size', 0);
		});

		it('single quad', () => {
			let k_tree = dataset_tree();
			expect(k_tree.addQuads([g_abcg])).to.equal(1);
			expect(k_tree).to.have.property('size', 1);
		});

		it('blank on nonempty', () => {
			let k_tree = dataset_tree();
			k_tree.addQuads([g_abcg]);
			expect(k_tree.addQuads([])).to.equal(0);
			expect(k_tree).to.have.property('size', 1);
		});

		it('two different quads (object) sequentially', () => {
			let k_tree = dataset_tree();

			expect(k_tree.addQuads([g_abcg])).to.equal(1);
			expect(k_tree.addQuads([g_abdg])).to.equal(1);
			expect(k_tree).to.have.property('size', 2);
		});

		it('two different quads (predicate) sequentially', () => {
			let k_tree = dataset_tree();

			expect(k_tree.addQuads([g_abcg])).to.equal(1);
			expect(k_tree.addQuads([g_adcg])).to.equal(1);
			expect(k_tree).to.have.property('size', 2);
		});

		it('two different quads (subject) sequentially', () => {
			let k_tree = dataset_tree();

			expect(k_tree.addQuads([g_abcg])).to.equal(1);
			expect(k_tree.addQuads([g_dbcg])).to.equal(1);
			expect(k_tree).to.have.property('size', 2);
		});

		it('two different quads (graph) sequentially', () => {
			let k_tree = dataset_tree();

			expect(k_tree.addQuads([g_abcg])).to.equal(1);
			expect(k_tree.addQuads([g_abcd])).to.equal(1);
			expect(k_tree).to.have.property('size', 2);
		});

		it('two different quads (object) simultaneously', () => {
			let k_tree = dataset_tree();
			let n_added = k_tree.addQuads([
				g_abcg,
				g_abdg,
			]);

			expect(n_added).to.equal(2);
			expect(k_tree).to.have.property('size', 2);
		});

		it('two different quads (predicate) simultaneously', () => {
			let k_tree = dataset_tree();
			let n_added = k_tree.addQuads([
				g_abcg,
				g_adcg,
			]);

			expect(n_added).to.equal(2);
			expect(k_tree).to.have.property('size', 2);
		});

		it('two different quads (subject) simultaneously', () => {
			let k_tree = dataset_tree();
			let n_added = k_tree.addQuads([
				g_abcg,
				g_dbcg,
			]);

			expect(n_added).to.equal(2);
			expect(k_tree).to.have.property('size', 2);
		});

		it('two different quads (graph) simultaneously', () => {
			let k_tree = dataset_tree();
			let n_added = k_tree.addQuads([
				g_abcg,
				g_abcd,
			]);

			expect(n_added).to.equal(2);
			expect(k_tree).to.have.property('size', 2);
		});

		it('two identical quads sequentially', () => {
			let k_tree = dataset_tree();

			expect(k_tree.addQuads([g_abcg])).to.equal(1);
			expect(k_tree.addQuads([g_abcg])).to.equal(0);
			expect(k_tree).to.have.property('size', 1);
		});

		it('two identical quads simultaneously', () => {
			let k_tree = dataset_tree();

			expect(k_tree.addQuads([g_abcg, g_abcg])).to.equal(1);
			expect(k_tree).to.have.property('size', 1);
		});
	});

	describe('delete', () => {
		it('blank on empty', () => {
			let k_tree = dataset_tree();
			expect(k_tree.delete()).to.equal(0);
			expect(k_tree).to.have.property('size', 0);
		});

		it('blank on non-empty', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			expect(k_tree.delete()).to.equal(0);
			expect(k_tree).to.have.property('size', 1);
		});

		it('non-blank on empty', () => {
			let k_tree = dataset_tree();
			expect(k_tree.delete(g_abcg)).to.equal(0);
			expect(k_tree).to.have.property('size', 0);
		});

		it('exact sole quad', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			expect(k_tree.delete(g_abcg)).to.equal(1);
			expect(k_tree).to.have.property('size', 0);
		});

		it('missing sole quad', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			expect(k_tree.delete(g_abdg)).to.equal(0);
			expect(k_tree).to.have.property('size', 1);
		});

		it('single present quad', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			k_tree.add(g_abdg);
			expect(k_tree.delete(g_abcg)).to.equal(1);
			expect(k_tree).to.have.property('size', 1);
		});

		it('multiple present quads sequentially', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			k_tree.add(g_abdg);
			k_tree.add(g_adcg);
			expect(k_tree.delete(g_abcg)).to.equal(1);
			expect(k_tree.delete(g_adcg)).to.equal(1);
			expect(k_tree).to.have.property('size', 1);
		});

		it('multiple present quads simultaneously', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			k_tree.add(g_abdg);
			k_tree.add(g_adcg);
			expect(k_tree.delete(g_abcg, g_adcg)).to.equal(2);
			expect(k_tree).to.have.property('size', 1);
		});

		it('single present quad, single absent quad simultaneously', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			k_tree.add(g_abdg);
			expect(k_tree.delete(g_abcg, g_adcg)).to.equal(1);
			expect(k_tree).to.have.property('size', 1);
		});

		it('multiple absent quads simultaneously', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			k_tree.add(g_abdg);
			k_tree.add(g_adcg);
			expect(k_tree.delete(g_abcd, g_dbcg)).to.equal(0);
			expect(k_tree).to.have.property('size', 3);
		});

		it('weak descendents; parent then self', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			let k_tree_union_empty = k_tree.union(dataset_tree());

			let k_tree_abdg = dataset_tree();
			k_tree_abdg.add(g_abdg);
			let k_tree_union_abdg = k_tree.union(k_tree_abdg);

			let k_tree_adcg = dataset_tree();
			k_tree_adcg.add(g_adcg);
			let k_tree_union_adcg = k_tree.union(k_tree_adcg);

			let k_tree_dbcg = dataset_tree();
			k_tree_dbcg.add(g_dbcg);
			let k_tree_union_dbcg = k_tree.union(k_tree_dbcg);

			let k_tree_abcd = dataset_tree();
			k_tree_abcd.add(g_abcd);
			let k_tree_union_abcd = k_tree.union(k_tree_abcd);

			expect(k_tree).to.have.property('size', 1);
			expect(k_tree_union_empty).to.have.property('size', 1);

			// union empty
			expect(k_tree_union_empty.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_empty).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);


			// delete parent quad
			expect(k_tree_union_abdg.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_abdg).to.have.property('size', 1);
			expect(k_tree).to.have.property('size', 1);

			// then delete own quad
			expect(k_tree_union_abdg.delete(g_abdg)).to.equal(1);
			expect(k_tree_union_abdg).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);

			// delete parent quad
			expect(k_tree_union_adcg.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_adcg).to.have.property('size', 1);
			expect(k_tree).to.have.property('size', 1);

			// then delete own quad
			expect(k_tree_union_adcg.delete(g_adcg)).to.equal(1);
			expect(k_tree_union_abdg).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);

			// delete parent quad
			expect(k_tree_union_dbcg.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_dbcg).to.have.property('size', 1);
			expect(k_tree).to.have.property('size', 1);

			// then delete own quad
			expect(k_tree_union_dbcg.delete(g_dbcg)).to.equal(1);
			expect(k_tree_union_abdg).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);

			// delete parent quad
			expect(k_tree_union_abcd.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_abcd).to.have.property('size', 1);
			expect(k_tree).to.have.property('size', 1);

			// then delete own quad
			expect(k_tree_union_abcd.delete(g_abcd)).to.equal(1);
			expect(k_tree_union_abdg).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);
		});

		it('weak descendents; self then parent', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			let k_tree_union_empty = k_tree.union(dataset_tree());

			let k_tree_abdg = dataset_tree();
			k_tree_abdg.add(g_abdg);
			let k_tree_union_abdg = k_tree.union(k_tree_abdg);

			let k_tree_adcg = dataset_tree();
			k_tree_adcg.add(g_adcg);
			let k_tree_union_adcg = k_tree.union(k_tree_adcg);

			let k_tree_dbcg = dataset_tree();
			k_tree_dbcg.add(g_dbcg);
			let k_tree_union_dbcg = k_tree.union(k_tree_dbcg);

			let k_tree_abcd = dataset_tree();
			k_tree_abcd.add(g_abcd);
			let k_tree_union_abcd = k_tree.union(k_tree_abcd);

			expect(k_tree).to.have.property('size', 1);
			expect(k_tree_union_empty).to.have.property('size', 1);

			// union empty
			expect(k_tree_union_empty.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_empty).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);


			// delete own quad
			expect(k_tree_union_abdg.delete(g_abdg)).to.equal(1);
			expect(k_tree_union_abdg).to.have.property('size', 1);
			expect(k_tree).to.have.property('size', 1);

			// then delete parent quad
			expect(k_tree_union_abdg.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_abdg).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);

			// delete own quad
			expect(k_tree_union_adcg.delete(g_adcg)).to.equal(1);
			expect(k_tree_union_adcg).to.have.property('size', 1);
			expect(k_tree).to.have.property('size', 1);

			// then delete parent quad
			expect(k_tree_union_adcg.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_adcg).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);

			// delete own quad
			expect(k_tree_union_dbcg.delete(g_dbcg)).to.equal(1);
			expect(k_tree_union_dbcg).to.have.property('size', 1);
			expect(k_tree).to.have.property('size', 1);

			// then delete parent quad
			expect(k_tree_union_dbcg.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_dbcg).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);

			// delete own quad
			expect(k_tree_union_abcd.delete(g_abcd)).to.equal(1);
			expect(k_tree_union_abcd).to.have.property('size', 1);
			expect(k_tree).to.have.property('size', 1);

			// then delete parent quad
			expect(k_tree_union_abcd.delete(g_abcg)).to.equal(1);
			expect(k_tree_union_abcd).to.have.property('size', 0);
			expect(k_tree).to.have.property('size', 1);
		});
	});

	describe('clear', () => {
		it('empty', () => {
			let k_tree = dataset_tree();
			k_tree.clear();
			expect(k_tree).to.have.property('size', 0);
		});

		it('single quad', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			k_tree.clear();
			expect(k_tree).to.have.property('size', 0);
		});

		it('multiple quads', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			k_tree.add(g_abdg);
			k_tree.add(g_adcg);
			k_tree.clear();
			expect(k_tree).to.have.property('size', 0);
		});
	});
});

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

	let a_abcg = ['z://a', 'z://b', 'z://c', 'z://g'];
	let a_abdg = ['z://a', 'z://b', 'z://d', 'z://g'];
	let a_adcg = ['z://a', 'z://d', 'z://c', 'z://g'];
	let a_dbcg = ['z://d', 'z://b', 'z://c', 'z://g'];
	let a_abcd = ['z://a', 'z://b', 'z://c', 'z://d'];

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
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'overlap in a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'overlap in b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'a contains b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'b contains a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'a along b object': () => ({
				a: [a_abcg],
				b: [a_abdg],
				expect: [
					a_abcg,
					a_abdg,
				],
			}),
			'a along b predicate': () => ({
				a: [a_abcg],
				b: [a_adcg],
				expect: [
					a_abcg,
					a_adcg,
				],
			}),
			'a along b subject': () => ({
				a: [a_abcg],
				b: [a_dbcg],
				expect: [
					a_abcg,
					a_dbcg,
				],
			}),
			'a along b graph': () => ({
				a: [a_abcg],
				b: [a_abcd],
				expect: [
					a_abcg,
					a_abcd,
				],
				debug: true,
			}),
			'b along a object': () => ({
				a: [a_abdg],
				b: [a_abcg],
				expect: [
					a_abdg,
					a_abcg,
				],
			}),
			'b along a predicate': () => ({
				a: [a_adcg],
				b: [a_abcg],
				expect: [
					a_adcg,
					a_abcg,
				],
			}),
			'b along a subject': () => ({
				a: [a_dbcg],
				b: [a_abcg],
				expect: [
					a_dbcg,
					a_abcg,
				],
			}),
			'b along a graph': () => ({
				a: [a_abcd],
				b: [a_abcg],
				expect: [
					a_abcd,
					a_abcg,
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
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
			}),
			'overlap in b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
			}),
			'a contains b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
			}),
			'b contains a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
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
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'overlap in a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
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
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
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
			'a contains b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'b contains a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
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
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
			}),
			'overlap in a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
				],
				b: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
			}),
			'overlap in b ': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				expect: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
				],
			}),
			'a contains b': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				expect: [
					['z://h', 'z://i', 'z://j', 'z://g'],
					['z://k', 'z://l', 'z://m', 'z://g'],
				],
			}),
			'b contains a': () => ({
				a: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://d', 'z://e', 'z://f', 'z://g'],
				],
				b: [
					['z://a', 'z://b', 'z://c', 'z://g'],
					['z://a', 'z://b', 'z://d', 'z://g'],
					['z://a', 'z://e', 'z://f', 'z://g'],
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
			'a contains b': () => ({
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
			'b contains a': () => ({
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

		contains: {
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
			'a contains b': () => ({
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
			'b contains a': () => ({
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

		disjoint: {
			'both blank': () => ({
				a: [],
				b: [],
				expect: true,
			}),
			'a blank': () => ({
				a: [],
				b: a_simple,
				expect: true,
			}),
			'b blank': () => ({
				a: a_simple,
				b: [],
				expect: true,
			}),
			'both same': () => ({
				a: a_simple,
				b: a_simple,
				expect: false,
			}),
			'equivalent sets': () => ({
				a: a_simple,
				b: a_simple_reverse,
				expect: false,
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
				expect: true,
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
			'a contains b': () => ({
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
			'b contains a': () => ({
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

describe('dataset_tree mutability after union', () => {
	let h_mutations = {
		object: {
			'>z://g': {
				'>z://a': {
					'>z://b': '>z://z',
				},
			},
		},

		predicate: {
			'>z://g': {
				'>z://a': {
					'>z://z': '>z://c',
				},
			},
		},

		subject: {
			'>z://g': {
				'>z://z': {
					'>z://b': '>z://c',
				},
			},
		},

		graph: {
			'>z://z': {
				'>z://a': {
					'>z://b': '>z://c',
				},
			},
		},
	};

	let expect_sizes = (h_trees, h_expect) => {
		for(let s_name in h_trees) {
			expect(h_trees[s_name]).to.have.property('size', h_expect[s_name]);
		}
	};

	let mutability_modes = (h_modes) => {
		map_tree(h_modes, (f_mode, a_path) => {
			let {
				trees: h_trees_src,
				sizes: h_sizes,
				// check: f_check,
			} = f_mode();

			let k_tree_orig = dataset_tree();
			k_tree_orig.addQuads([...factory.c4({
				'>z://g': {
					'>z://a': {
						'>z://b': '>z://c',
					},
				},
			})]);
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
					k_tree_invent.addQuads([...factory.c4(h_trees_src[s_tree])]);
				}
			}

			it(a_path[a_path.length-1], () => {
				h_trees_dst.orig.addQuads([...factory.c4(h_mutations[a_path[a_path.length-2]])]);
				// f_check(h_trees_dst);
				expect_sizes(h_trees_dst, h_sizes);
			});
		});
	};

	mutability_modes({
		object: {
			empty: () => ({
				trees: {
					empty: {},
					copy: h => h.orig.union(h.empty),
				},
				sizes: {
					orig: 2,
					empty: 0,
					copy: 1,
				},
			}),

			identity: () => ({
				trees: {
					copy: h => h.orig.union(h.orig),
				},
				sizes: {
					orig: 2,
					copy: 1,
				},
			}),

			same: () => ({
				trees: {
					other: {
						'>z://g': {
							'>z://a': {
								'>z://b': '>z://c',
							},
						},
					},
					copy: h => h.orig.union(h.other),
				},
				sizes: {
					orig: 2,
					other: 1,
					copy: 1,
				},
			}),

			different: () => ({
				trees: {
					other: {
						'>z://g': {
							'>z://a': {
								'>z://b': '>z://d',
							},
						},
					},
					copy: h => h.orig.union(h.other),
				},
				sizes: {
					orig: 2,
					other: 1,
					copy: 2,
				},
			}),
		},

		predicate: {
			empty: () => ({
				trees: {
					empty: {},
					copy: h => h.orig.union(h.empty),
				},
				sizes: {
					orig: 2,
					empty: 0,
					copy: 1,
				},
			}),

			identity: () => ({
				trees: {
					copy: h => h.orig.union(h.orig),
				},
				sizes: {
					orig: 2,
					copy: 1,
				},
			}),

			same: () => ({
				trees: {
					other: {
						'>z://g': {
							'>z://a': {
								'>z://b': '>z://c',
							},
						},
					},
					copy: h => h.orig.union(h.other),
				},
				sizes: {
					orig: 2,
					other: 1,
					copy: 1,
				},
			}),

			different: () => ({
				trees: {
					other: {
						'>z://g': {
							'>z://a': {
								'>z://d': '>z://c',
							},
						},
					},
					copy: h => h.orig.union(h.other),
				},
				sizes: {
					orig: 2,
					other: 1,
					copy: 2,
				},
			}),
		},

		subject: {
			empty: () => ({
				trees: {
					empty: {},
					copy: h => h.orig.union(h.empty),
				},
				sizes: {
					orig: 2,
					empty: 0,
					copy: 1,
				},
			}),

			identity: () => ({
				trees: {
					copy: h => h.orig.union(h.orig),
				},
				sizes: {
					orig: 2,
					copy: 1,
				},
			}),

			same: () => ({
				trees: {
					other: {
						'>z://g': {
							'>z://a': {
								'>z://b': '>z://c',
							},
						},
					},
					copy: h => h.orig.union(h.other),
				},
				sizes: {
					orig: 2,
					other: 1,
					copy: 1,
				},
			}),

			different: () => ({
				trees: {
					other: {
						'>z://g': {
							'>z://d': {
								'>z://b': '>z://c',
							},
						},
					},
					copy: h => h.orig.union(h.other),
				},
				sizes: {
					orig: 2,
					other: 1,
					copy: 2,
				},
			}),
		},

		graph: {
			empty: () => ({
				trees: {
					empty: {},
					copy: h => h.orig.union(h.empty),
				},
				sizes: {
					orig: 2,
					empty: 0,
					copy: 1,
				},
			}),

			identity: () => ({
				trees: {
					copy: h => h.orig.union(h.orig),
				},
				sizes: {
					orig: 2,
					copy: 1,
				},
			}),

			same: () => ({
				trees: {
					other: {
						'>z://g': {
							'>z://a': {
								'>z://b': '>z://c',
							},
						},
					},
					copy: h => h.orig.union(h.other),
				},
				sizes: {
					orig: 2,
					other: 1,
					copy: 1,
				},
			}),

			different: () => ({
				trees: {
					other: {
						'>z://d': {
							'>z://a': {
								'>z://b': '>z://c',
							},
						},
					},
					copy: h => h.orig.union(h.other),
				},
				sizes: {
					orig: 2,
					other: 1,
					copy: 2,
				},
			}),
		},
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
