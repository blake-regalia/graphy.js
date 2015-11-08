import arginfo from 'arginfo';
import assert from 'assert';
import graphy from '../lib';
import h_graph from './graph.json';

const eq = assert.strictEqual.bind(assert);
const deep = assert.deepEqual.bind(assert);
const includes = (a_list, a_test) => {
	a_test.forEach((s_item) => {
		assert(a_list.includes(s_item), 'list does not include '+s_item+'; '+arginfo(a_list));
	});
};

let q_graph = graphy(h_graph);


describe('graphy node', () => {

	q_graph.network('ns:', (k_banana) => {

		it('contains @id property', () => {
			eq(k_banana['@id'], 'vocab://ns/Banana');
		});

		it('contains @type property', () => {
			eq(k_banana['@type'], 'vocab://ns/Fruit');
		});

		it('contains suffixed id property', () => {
			eq(k_banana.$id, 'Banana');
		});

		it('contains suffixed type property', () => {
			eq(k_banana.$type, 'Fruit');
		});

		it('supports namespace change', () => {
			eq(k_banana.$('plant:').blossoms.$('ns:').$id, 'YearRound');
		});

		it('has blanknode type indicator', () => {
			eq(k_banana.$is.blanknode, true);
		});

		it('calling type indicator returns iri', () => {
			eq(k_banana.$is(), 'blanknode');
		});
	});
});


describe('graphy literal', () => {

	q_graph.network('ns:', (k_banana) => {

		it('returns primitive value when called', () => {
			eq(k_banana.tastes(), 'good');
		});

		it('returns primitive value when is numeric and called', () => {
			eq(k_banana.data(), 25);
		});

		it('contains @type property', () => {
			eq(k_banana.tastes['@type'], 'http://www.w3.org/2001/XMLSchema#string');
		});

		it('suffixes namespaced datatype', () => {
			eq(k_banana.shape.$type, 'Liberty');
		});

		it('does not mis-suffix non-namespaced datatype', () => {
			eq(k_banana.tastes.$type, undefined);
		});

		it('suffixes datatype on namespace changed', () => {
			eq(k_banana.tastes.$('xsd:').$type, 'string');
		});

		it('has literal type indicator', () => {
			eq(k_banana.tastes.$is.literal, true);
		});

		it('calling type indicator returns literal', () => {
			eq(k_banana.tastes.$is(), 'literal');
		});

		it('supports auto-prefixing datatype with literal', () => {
			eq(k_banana.tastes.$.short, '"good"^^xsd:string');
		});

		it('supports auto-prefixing only datatype', () => {
			eq(k_banana.tastes.$.datatype, 'xsd:string');
		});

	});
});


describe('graphy iri', () => {

	q_graph.network('ns:', (k_banana) => {

		it('contains @id property', () => {
			eq(k_banana.appears['@id'], 'vocab://color/Yellow');
		});

		it('contains @type property', () => {
			eq(k_banana.class['@type'], '@id');
		});

		it('contains suffixed id property', () => {
			eq(k_banana.class.$id, 'Berry');
		});

		it('suffixes iri when called', () => {
			eq(k_banana.class(), 'Berry');
		});

		it('does not mis-suffix non-namespaced iri', () => {
			eq(k_banana.appears(), undefined);
		});

		it('suffixes datatype on namespace changed', () => {
			eq(k_banana.appears.$('color:').$id, 'Yellow');
		});

		it('supports auto-prefixing a node', () => {
			eq(k_banana.$.short, 'ns:Banana');
		});

		it('supports auto-prefixing a property', () => {
			eq(k_banana.appears.$.short, 'color:Yellow');
		});

		it('has iri type indicator', () => {
			eq(k_banana.appears.$is.iri, true);
		});

		it('calling type indicator returns iri', () => {
			eq(k_banana.appears.$is(), 'iri');
		});

	});
});



describe('graphy predicate points to multiple objects', () => {

	q_graph.network('ns:', (k_banana) => {

		it('supports forEach', () => {
			let a_items = [];
			k_banana('alias').forEach((k_item) => {
				a_items.push(k_item());
			});
			includes(a_items, ['Cavendish', 'Naner', 'Bananarama']);
		});

		it('supports implicit map callback', () => {
			let a_items = k_banana('alias', (k_item) => {
				return k_item();
			});
			includes(a_items, ['Cavendish', 'Naner', 'Bananarama']);
		});
	});

});



describe('graphy collection', () => {

	q_graph.network('ns:', (k_banana) => {

		it('supports implicit map callback', () => {
			let a_items = k_banana.stages((k_item) => {
				return k_item.$id || k_item.$('plant:').$id;
			});
			eq(Array.isArray(a_items), true);
			deep(a_items, ['FindSpace', 'Seed', 'Grow', 'Harvest']);
		});

		it('returns simple array on invocation', () => {
			let a_items = [];
			k_banana.stages().forEach((k_item) => {
				a_items.push(k_item.$id || k_item.$('plant:').$id);
			});
			includes(a_items, ['FindSpace', 'Seed', 'Grow', 'Harvest']);
		});

		it('emulates rdf:first/next/nil', () => {
			let a_rdf = k_banana.stages.$('rdf:');
			eq(a_rdf.first.$('ns:').$id, 'FindSpace');
			let w_rest = a_rdf.rest;
			eq(w_rest.first.$('plant:').$id, 'Seed');
			w_rest = w_rest.rest;
			eq(w_rest.first.$('plant:').$id, 'Grow');
			w_rest = w_rest.rest;
			eq(w_rest.first.$('plant:').$id, 'Harvest');
			w_rest = w_rest.rest;
			eq(w_rest.$id, 'nil');
		});

		it('has collection type indicator', () => {
			eq(k_banana.stages.$is.collection, true);
		});

		it('calling type indicator returns collection', () => {
			eq(k_banana.stages.$is(), 'collection');
		});
	});

});


describe('graphy interface function', () => {
	let a_nodes = graphy(h_graph).network('ns:');

	it('supports forEach', () => {
		a_nodes.forEach((k_node) => {
			eq(k_node.$id, 'Banana');
		});
	});

	it('supports [0]', () => {
		eq(a_nodes[0].$id, 'Banana');
	});
});

