/* eslint-disable quote-props */
const chai = require('chai');
chai.use(require('chai-iterator'));
const expect = chai.expect;

const factory = require('@graphy/core.data.factory');
const dataset_tree = require('@graphy/memory.dataset.fast');
const util = require('../helper/util.js');

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

	for(let g_quad_a of a_a.map(util.o4)) {
		k_tree_a.add(g_quad_a);
	}

	for(let g_quad_b of a_b.map(util.o4)) {
		k_tree_b.add(g_quad_b);
	}

	let s_action = a_path[a_path.length-1];
	let z_result = k_tree_a[s_action](k_tree_b);

	f_relation(z_result, z_expect);
};

const methods_set = (h_tree) => {
	map_tree(h_tree, onto_relational((k_tree_out, a_expect) => {
		util.validate_quads_unordered(k_tree_out.quads(), a_expect);
	}));
};

const methods_boolean = (h_tree) => {
	map_tree(h_tree, onto_relational((b_result, b_expect) => {
		expect(b_result).to.equal(b_expect);
	}));
};

describe('memory.dataset.fast', () => {
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

	describe('mutators', () => {
		describe('#add', () => {
			it('single quad', () => {
				let k_tree = dataset_tree();
				expect(k_tree.add(g_abcg)).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 1);
			});

			it('two different quads (object) sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.add(g_abcg)).to.equal(k_tree);
				expect(k_tree.add(g_abdg)).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (predicate) sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.add(g_abcg)).to.equal(k_tree);
				expect(k_tree.add(g_adcg)).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (subject) sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.add(g_abcg)).to.equal(k_tree);
				expect(k_tree.add(g_dbcg)).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (graph) sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.add(g_abcg)).to.equal(k_tree);
				expect(k_tree.add(g_abcd)).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two identical quads sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.add(g_abcg)).to.equal(k_tree);
				expect(k_tree.add(g_abcg)).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 1);
			});
		});

		describe('#addQuads', () => {
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

		describe('#addAll', () => {
			it('blank on empty', () => {
				let k_tree = dataset_tree();
				expect(k_tree.addAll([])).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 0);
			});

			it('single quad', () => {
				let k_tree = dataset_tree();
				expect(k_tree.addAll([g_abcg])).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 1);
			});

			it('blank on nonempty', () => {
				let k_tree = dataset_tree();
				k_tree.addAll([g_abcg]);
				expect(k_tree.addAll([])).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 1);
			});

			it('two different quads (object) sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.addAll([g_abcg])).to.equal(k_tree);
				expect(k_tree.addAll([g_abdg])).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (predicate) sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.addAll([g_abcg])).to.equal(k_tree);
				expect(k_tree.addAll([g_adcg])).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (subject) sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.addAll([g_abcg])).to.equal(k_tree);
				expect(k_tree.addAll([g_dbcg])).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (graph) sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.addAll([g_abcg])).to.equal(k_tree);
				expect(k_tree.addAll([g_abcd])).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (object) simultaneously', () => {
				let k_tree = dataset_tree();
				let n_added = k_tree.addAll([
					g_abcg,
					g_abdg,
				]);

				expect(n_added).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (predicate) simultaneously', () => {
				let k_tree = dataset_tree();
				let n_added = k_tree.addAll([
					g_abcg,
					g_adcg,
				]);

				expect(n_added).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (subject) simultaneously', () => {
				let k_tree = dataset_tree();
				let n_added = k_tree.addAll([
					g_abcg,
					g_dbcg,
				]);

				expect(n_added).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two different quads (graph) simultaneously', () => {
				let k_tree = dataset_tree();
				let n_added = k_tree.addAll([
					g_abcg,
					g_abcd,
				]);

				expect(n_added).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 2);
			});

			it('two identical quads sequentially', () => {
				let k_tree = dataset_tree();

				expect(k_tree.addAll([g_abcg])).to.equal(k_tree);
				expect(k_tree.addAll([g_abcg])).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 1);
			});

			it('two identical quads simultaneously', () => {
				let k_tree = dataset_tree();

				expect(k_tree.addAll([g_abcg, g_abcg])).to.equal(k_tree);
				expect(k_tree).to.have.property('size', 1);
			});
		});

		describe('#delete', () => {
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

		describe('#clear', () => {
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

		describe('#has', () => {
			it('false on empty', () => {
				let k_tree = dataset_tree();
				expect(k_tree.has(g_abcg)).to.be.false;
			});

			it('false on deleted', () => {
				let k_tree = dataset_tree();
				k_tree.add(g_abcg);
				k_tree.delete(g_abcg);
				expect(k_tree.has(g_abcg)).to.be.false;
			});

			it('false on cleared', () => {
				let k_tree = dataset_tree();
				k_tree.add(g_abcg);
				k_tree.clear();
				expect(k_tree.has(g_abcg)).to.be.false;
			});

			it('false on other single', () => {
				let k_tree = dataset_tree();
				k_tree.add(g_abcg);
				k_tree.clear();
				expect(k_tree.has(g_abdg)).to.be.false;
			});

			it('false on other multiple', () => {
				let k_tree = dataset_tree();
				k_tree.add(g_abcg);
				k_tree.add(g_abdg);
				k_tree.clear();
				expect(k_tree.has(g_adcg)).to.be.false;
			});

			it('true on single', () => {
				let k_tree = dataset_tree();
				k_tree.add(g_abcg);
				expect(k_tree.has(g_abcg)).to.be.true;
			});

			it('true on single not deleted (1st)', () => {
				let k_tree = dataset_tree();
				k_tree.add(g_abcg);
				k_tree.add(g_abdg);
				k_tree.delete(g_abdg);
				expect(k_tree.has(g_abcg)).to.be.true;
			});

			it('true on single not deleted (2nd)', () => {
				let k_tree = dataset_tree();
				k_tree.add(g_abcg);
				k_tree.add(g_abdg);
				k_tree.delete(g_abcg);
				expect(k_tree.has(g_abdg)).to.be.true;
			});

			it('true on multiple', () => {
				let k_tree = dataset_tree();
				k_tree.add(g_abcg);
				k_tree.add(g_abdg);
				expect(k_tree.has(g_abcg)).to.be.true;
				expect(k_tree.has(g_abdg)).to.be.true;
			});
		});

	});

	describe('set methods', () => {
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

	describe('set booleans', () => {
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

	describe('mutability after union', () => {
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

	describe('#match', () => {
		let k_tree = dataset_tree();

		let h_prefixes = {
			'': 'z://y/',
		};

		k_tree.addAll(factory.c4({
			':g0': {
				':Banana': {
					a: ':Fruit',
					':label': '"Banana',
				},
				':Grapefruit': {
					a: ':Fruit',
				},
			},
			':g1': {
				':Watermelon': {
					a: ':Fruit',
					':label': '"Watermelon',
				},
			},
		}, {
			'': 'z://y/',
		}));

		const {
			keys: $_KEYS,
			quads: $_QUADS,
		} = dataset_tree;

		const matches = h_tree => util.map_tree(h_tree, (s_label, f_leaf) => {
			let {
				match: g_match,
				quads: h_quads_exp,
			} = f_leaf();

			it(s_label, () => {
				let a_args = [null, null, null, null];

				if(g_match.graph) a_args[3] = factory.c1(g_match.graph, h_prefixes);
				if(g_match.subject) a_args[0] = factory.c1(g_match.subject, h_prefixes);
				if(g_match.predicate) a_args[1] = factory.c1(g_match.predicate, h_prefixes);
				if(g_match.object) a_args[2] = factory.c1(g_match.object, h_prefixes);

				let k_matched = k_tree.match(...a_args);
				let h_quads_act = k_matched.quad_tree;

				expect(h_quads_act).to.have.property($_KEYS, Object.keys(h_quads_exp).length);

				let c_quads_exp = 0;
				for(let sc1_graph in h_quads_exp) {
					let h_triples_exp = h_quads_exp[sc1_graph];

					let sv1_graph = factory.c1(sc1_graph, h_prefixes).concise();
					expect(h_quads_act).to.have.property(sv1_graph).that.exist;
					let h_triples_act = h_quads_act[sv1_graph];

					expect(h_triples_act).to.have.property($_KEYS, Object.keys(h_triples_exp).length);

					let c_triples_exp = 0;
					for(let sc1_subject in h_triples_exp) {
						let h_pairs_exp = h_triples_exp[sc1_subject];

						let sv1_subject = factory.c1(sc1_subject, h_prefixes).concise();
						expect(h_triples_act).to.have.property(sv1_subject).that.exist;
						let h_pairs_act = h_triples_act[sv1_subject];

						expect(h_pairs_act).to.have.property($_KEYS, Object.keys(h_pairs_exp).length);

						let c_pairs_exp = 0;
						for(let sc1_predicate in h_pairs_exp) {
							let z_objects_exp = h_pairs_exp[sc1_predicate];

							let sv1_predicate = factory.c1(sc1_predicate, h_prefixes).concise();
							expect(h_pairs_act).to.have.property(sv1_predicate).that.exist;
							let as_objects_act = h_pairs_act[sv1_predicate];

							// array
							if(Array.isArray(z_objects_exp)) {
								expect(as_objects_act).to.have.property('size', z_objects_exp.length);
								expect(as_objects_act).to.have.all.keys(z_objects_exp.map(s => factory.c1(s, h_prefixes).concise()));
								c_pairs_exp += z_objects_exp.length;
							}
							// single value
							else {
								expect(as_objects_act).to.have.property('size', 1);
								expect(as_objects_act).to.have.all.keys(factory.c1(z_objects_exp, h_prefixes).concise());
								c_pairs_exp += 1;
							}
						}

						expect(h_pairs_act).to.have.property($_QUADS, c_pairs_exp);
						c_triples_exp += c_pairs_exp;
					}

					expect(h_triples_act).to.have.property($_QUADS, c_triples_exp);
					c_quads_exp += c_triples_exp;
				}

				expect(h_quads_act).to.have.property($_QUADS, c_quads_exp);

				let a_quads_actual = [...k_matched].map(k => k.isolate());
				let a_quads_expect = [...factory.c4(h_quads_exp, h_prefixes)].map(k => k.isolate());

				expect(a_quads_actual).to.deep.eql(a_quads_expect);
			});
		});

		matches({
			'negatives': {
				'graph': () => ({
					match: {
						graph: ':absent',
					},
					quads: {},
				}),

				'subject': () => ({
					match: {
						subject: ':absent',
					},
					quads: {},
				}),

				'predicate': () => ({
					match: {
						predicate: ':absent',
					},
					quads: {},
				}),

				'object': () => ({
					match: {
						object: ':absent',
					},
					quads: {},
				}),

				'graph, subject': () => ({
					match: {
						graph: ':g0',
						subject: ':absent',
					},
					quads: {},
				}),

				'graph, predicate': () => ({
					match: {
						graph: ':g0',
						predicate: ':absent',
					},
					quads: {},
				}),

				'graph, object': () => ({
					match: {
						graph: ':g0',
						object: ':absent',
					},
					quads: {},
				}),

				'subject, predicate': () => ({
					match: {
						subject: ':Banana',
						predicate: ':absent',
					},
					quads: {},
				}),

				'subject, object': () => ({
					match: {
						subject: ':Banana',
						object: ':absent',
					},
					quads: {},
				}),

				'predicate, object': () => ({
					match: {
						predicate: 'a',
						object: ':absent',
					},
					quads: {},
				}),

				'graph, subject, predicate': () => ({
					match: {
						graph: ':g0',
						subject: ':Banana',
						predicate: ':absent',
					},
					quads: {},
				}),

				'graph, subject, object': () => ({
					match: {
						graph: ':g0',
						subject: ':Banana',
						object: ':absent',
					},
					quads: {},
				}),

				'graph, predicate, object': () => ({
					match: {
						graph: ':g0',
						predicate: 'a',
						object: ':absent',
					},
					quads: {},
				}),

				'subject, predicate, object': () => ({
					match: {
						subject: ':Banana',
						predicate: 'a',
						object: ':absent',
					},
					quads: {},
				}),

				'graph, subject, predicate, object': () => ({
					match: {
						graph: ':g0',
						subject: ':Banana',
						predicate: 'a',
						object: ':absent',
					},
					quads: {},
				}),
			},

			'positives': {
				'graph': () => ({
					match: {
						graph: ':g0',
					},
					quads: {
						':g0': {
							':Banana': {
								a: ':Fruit',
								':label': '"Banana',
							},
							':Grapefruit': {
								a: ':Fruit',
							},
						},
					},
				}),

				'subject': () => ({
					match: {
						subject: ':Banana',
					},
					quads: {
						':g0': {
							':Banana': {
								a: ':Fruit',
								':label': '"Banana',
							},
						},
					},
				}),

				'predicate': () => ({
					match: {
						predicate: ':label',
					},
					quads: {
						':g0': {
							':Banana': {
								':label': '"Banana',
							},
						},
						':g1': {
							':Watermelon': {
								':label': '"Watermelon',
							},
						},
					},
				}),

				'object': () => ({
					match: {
						object: ':Fruit',
					},
					quads: {
						':g0': {
							':Banana': {
								a: ':Fruit',
							},
							':Grapefruit': {
								a: ':Fruit',
							},
						},
						':g1': {
							':Watermelon': {
								a: ':Fruit',
							},
						},
					},
				}),

				'graph, subject': () => ({
					match: {
						graph: ':g0',
						subject: ':Banana',
					},
					quads: {
						':g0': {
							':Banana': {
								a: ':Fruit',
								':label': '"Banana',
							},
						},
					},
				}),

				'graph, predicate': () => ({
					match: {
						graph: ':g0',
						predicate: 'a',
					},
					quads: {
						':g0': {
							':Banana': {
								a: ':Fruit',
							},
							':Grapefruit': {
								a: ':Fruit',
							},
						},
					},
				}),

				'graph, object': () => ({
					match: {
						graph: ':g0',
						object: ':Fruit',
					},
					quads: {
						':g0': {
							':Banana': {
								a: ':Fruit',
							},
							':Grapefruit': {
								a: ':Fruit',
							},
						},
					},
				}),

				'subject, predicate': () => ({
					match: {
						subject: ':Banana',
						predicate: ':label',
					},
					quads: {
						':g0': {
							':Banana': {
								':label': '"Banana',
							},
						},
					},
				}),

				'subject, object': () => ({
					match: {
						subject: ':Watermelon',
						object: ':Fruit',
					},
					quads: {
						':g1': {
							':Watermelon': {
								a: ':Fruit',
							},
						},
					},
				}),

				'predicate, object': () => ({
					match: {
						predicate: 'a',
						object: ':Fruit',
					},
					quads: {
						':g0': {
							':Banana': {
								a: ':Fruit',
							},
							':Grapefruit': {
								a: ':Fruit',
							},
						},
						':g1': {
							':Watermelon': {
								a: ':Fruit',
							},
						},
					},
				}),

				'graph, subject, predicate': () => ({
					match: {
						graph: ':g1',
						subject: ':Watermelon',
						predicate: 'a',
					},
					quads: {
						':g1': {
							':Watermelon': {
								a: ':Fruit',
							},
						},
					},
				}),

				'graph, subject, object': () => ({
					match: {
						graph: ':g1',
						subject: ':Watermelon',
						object: '"Watermelon',
					},
					quads: {
						':g1': {
							':Watermelon': {
								':label': '"Watermelon',
							},
						},
					},
				}),

				'graph, predicate, object': () => ({
					match: {
						graph: ':g1',
						predicate: ':label',
						object: '"Watermelon',
					},
					quads: {
						':g1': {
							':Watermelon': {
								':label': '"Watermelon',
							},
						},
					},
				}),

				'subject, predicate, object': () => ({
					match: {
						subject: ':Watermelon',
						predicate: ':label',
						object: '"Watermelon',
					},
					quads: {
						':g1': {
							':Watermelon': {
								':label': '"Watermelon',
							},
						},
					},
				}),

				'graph, subject, predicate, object': () => ({
					match: {
						graph: ':g1',
						subject: ':Watermelon',
						predicate: ':label',
						object: '"Watermelon',
					},
					quads: {
						':g1': {
							':Watermelon': {
								':label': '"Watermelon',
							},
						},
					},
				}),
			},
		});
	});

	// describe('mutability after match')

	describe('iterable<Quad>', () => {
		it('iterable', () => {
			expect(dataset_tree()).to.be.iterable;
		});

		it('iterates over single quad', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			expect(k_tree).to.deep.iterate.over([g_abcg]);
		});

		it('iterates over multiple quads', () => {
			let k_tree = dataset_tree();
			k_tree.add(g_abcg);
			k_tree.add(g_abdg);
			k_tree.add(g_adcg);
			expect(k_tree).to.deep.iterate.over([g_abcg, g_abdg, g_adcg]);
		});
	});

	// describe('generators', () => {
	// 	methods_generators({
	// 		quads: {
	// 			empty: () => ({
	// 				in: [],
	// 				expect: [],
	// 			}),
	// 		},
	// 	});
	// });
});
