import arginfo from 'arginfo';
import assert from 'assert';
import graphy from '../lib';
import h_graph from './graph.json';

let eq = assert.strictEqual.bind(assert);
let includes = (a_list, a_test) => {
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

		it('contains suffixed type property', () => {
			eq(k_banana.$type, 'Fruit');
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

	});
});



describe('graphy collection', () => {

	q_graph.network('ns:', (k_banana) => {

		it('supports forEach', () => {
			let a_items = [];
			k_banana('alias').forEach((k_item) => {
				a_items.push(k_item());
			});
			includes(a_items, ['Cavendish','Naner','Bananarama']);
		});
	});

});