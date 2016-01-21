import arginfo from 'arginfo';
import assert from 'assert';
import graphy from '../lib/main';
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

		// it('contains @full property; ttl serialization', () => {
		// 	eq(k_banana['@type'], '...');
		// });

		it('contains suffixed id property', () => {
			eq(k_banana.$id, 'Banana');
		});

		it('contains suffixed type property', () => {
			eq(k_banana.$type, 'Fruit');
		});

		it('supports namespace change', () => {
			eq(k_banana.$('plant:').blossoms.$('ns:').$id, 'YearRound');
		});

		// it('supports tersing', () => {
		// 	eq(k_banana.$terse(), 'ns:Banana');
		// });

		it('has node type indicator', () => {
			eq(k_banana.$is.node, true);
		});

		it('calling type indicator returns node', () => {
			eq(k_banana.$is(), 'node');
		});
	});
});

// describe('graphy blanknode', () => {

// 	q_graph.network('ns:', (k_banana) => {

// 		//
// 		let k_node = k_banana.

// 		it('contains @id property', () => {
// 			eq(k_banana['@id'], 'vocab://ns/Banana');
// 		});

// 		it('contains @type property', () => {
// 			eq(k_banana['@type'], 'vocab://ns/Fruit');
// 		});

// 		it('contains suffixed id property', () => {
// 			eq(k_banana.$id, 'Banana');
// 		});

// 		it('contains suffixed type property', () => {
// 			eq(k_banana.$type, 'Fruit');
// 		});

// 		it('supports namespace change', () => {
// 			eq(k_banana.$('plant:').blossoms.$('ns:').$id, 'YearRound');
// 		});

// 		it('has node type indicator', () => {
// 			eq(k_banana.$is.node, true);
// 		});

// 		it('calling type indicator returns node', () => {
// 			eq(k_banana.$is(), 'node');
// 		});
// 	});
// });


// describe('graphy simple literal', () => {

// 	q_graph.network('ns:', (k_banana) => {

// 		it('returns primitive value when called', () => {
// 			eq(k_banana.tastes(), 'good');
// 		});

// 		it('does not contain @type property', () => {
// 			eq(k_banana.tastes['@type'], undefined);
// 		});

// 		it('contains @full property; ttl serialization', () => {
// 			eq(k_banana.tastes['@full'], '"good"');
// 		});

// 		it('has literal type indicator', () => {
// 			eq(k_banana.tastes.$is.literal, true);
// 		});

// 		it('calling type indicator returns literal', () => {
// 			eq(k_banana.tastes.$is(), 'literal');
// 		});

// 		it('returns simple literal without datatype', () => {
// 			eq(k_banana.tastes.$terse(), '"good"');
// 		});

// 		it('returns undefined datatype on terse', () => {
// 			eq(k_banana.tastes.$terse.datatype(), undefined);
// 		});

// 	});
// });

describe('graphy typed literal', () => {

	q_graph.network('ns:', (k_banana) => {

		it('returns primitive value when called', () => {
			eq(k_banana.$('rdfs:').label(), 'Banana');
		});

		it('returns primitive value when is numeric and called', () => {
			eq(k_banana.data(), 25);
		});

		it('contains @type property', () => {
			eq(k_banana.tastes['@type'], 'http://www.w3.org/2001/XMLSchema#string');
		});

		it('contains @value property', () => {
			eq(k_banana.tastes['@value'], '"good"');
		});

		it('contains @full property; ttl serialization', () => {
			eq(k_banana.$('rdfs:').label['@full'], '"Banana"^^<http://www.w3.org/2001/XMLSchema#string>');
		});

		it('suffixes namespaced datatype', () => {
			eq(k_banana.shape.$type, 'Liberty');
		});

		it('does not mis-suffix non-namespaced datatype', () => {
			eq(k_banana.$('rdfs:').label.$type, undefined);
		});

		it('suffixes datatype on namespace changed', () => {
			eq(k_banana.$('rdfs:').label.$('xsd:').$type, 'string');
		});

		it('has literal type indicator', () => {
			eq(k_banana.$('rdfs:').label.$is.literal, true);
		});

		it('calling type indicator returns literal', () => {
			eq(k_banana.$('rdfs:').label.$is(), 'literal');
		});

		it('supports auto-prefixing datatype with literal', () => {
			eq(k_banana.$('rdfs:').label.$terse(), '"Banana"^^xsd:string');
		});

		it('supports auto-prefixing only datatype', () => {
			eq(k_banana.$('rdfs:').label.$terse.datatype(), 'xsd:string');
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

		it('contains @full property; ttl serialization', () => {
			eq(k_banana.class['@full'], '<vocab://ns/Berry>');
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

		it('supports tersing', () => {
			eq(k_banana.appears.$terse(), 'color:Yellow');
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

		it('contains @full property; ttl serialization', () => {
			eq(k_banana.stages['@full'], '[<http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <vocab://ns/FindSpace>;<http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> (<vocab://plant/Seed> <vocab://plant/Grow> <vocab://plant/Harvest>)]');
		});

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

