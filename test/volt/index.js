import arginfo from 'arginfo';
import assert from 'assert';
import graphy from '../../lib/main';
import h_graph from './graph.json';


const eq = assert.strictEqual.bind(assert);
const deep = assert.deepEqual.bind(assert);
const includes = (a_list, a_test) => {
	a_test.forEach((s_item) => {
		assert(a_list.includes(s_item), 'list does not include '+s_item+'; '+arginfo(a_list));
	});
};

// mocha hack
describe('graphy', () => {
	it('can wait', () => {
		eq(true, true);
	});

	// async get graphy
	graphy(h_graph, (q_graph) => {

		// select property
		let k_property = q_graph.select('stko:PointsTowards').$('volt:');

		// get stages
		let k_stages = k_property.stages;


		//
		describe('node', () => {

			it('has stages', () => {
				eq(k_stages[0].$type,);
			});

			// it('contains @id property', () => {
			// 	eq(k_property['@id'], 'vocab://ns/Banana');
			// });

			// it('contains @type property', () => {
			// 	includes(k_property['@type'], ['vocab://plant/Fruit', 'vocab://ns/Food', 'vocab://plant/EdiblePart']);
			// });

			// it('namespace set to iri prefix', () => {
			// 	eq(k_property.$(), 'vocab://ns/');
			// });

			// it('contains suffixed id property', () => {
			// 	eq(k_property.$id(), 'Banana');
			// });

			// it('contains suffixed type property', () => {
			// 	eq(k_property.$type(), 'Food');
			// });

			// it('contains types as array', () => {
			// 	deep(k_property.$types(), ['Food']);
			// });

			// it('defaults namespace to iri prefix', () => {
			// 	deep(k_property.$type(), 'Food');
			// });

			// it('supports namespace access', () => {
			// 	eq(k_property.$.plant.blossoms.$.ns.$id(), 'YearRound');
			// });

			// it('supports namespace destruct', () => {
			// 	let {
			// 		plant: k_plant,
			// 	} = k_property.$;

			// 	eq(k_plant.blossoms.$.ns.$id(), 'YearRound');
			// });

			// it('supports namespace change', () => {
			// 	eq(k_property.$('plant:').blossoms.$('ns:').$id(), 'YearRound');
			// });

			// it('supports $type() ns change', () => {
			// 	deep(k_property.$('plant:').$type('ns:'), 'Food');
			// });

			// it('supports $types() namespace change', () => {
			// 	deep(k_property.$types('plant:'), ['Fruit', 'EdiblePart']);
			// });

			// it('serializes to n3', () => {
			// 	eq(k_property.$n3(), 'ns:Banana');
			// });

			// it('serializes to nqaud', () => {
			// 	eq(k_property.$nquad(), '<vocab://ns/Banana>');
			// });

			// it('has node type indicator', () => {
			// 	eq(k_property.$is.node, true);
			// });

			// it('calling type indicator returns node', () => {
			// 	eq(k_property.$is(), 'node');
			// });

			// it('returns map of all predicate/object pairs', () => {
			// 	eq(k_property() instanceof Map, true);
			// });

			// it('support namespace mapping', () => {
			// 	let {plant, rdfs} = k_property.$namespaces();
			// 	eq(rdfs.label(), 'Banana');
			// 	eq(plant.blossoms('ns:'), 'YearRound');
			// });

			// it('expands namespace', () => {
			// 	eq(k_property.$(), q_graph.expand('ns:'));
			// });
		});


		// //
		// describe('typed literal', () => {

		// 	it('supports access-by-name property on namespace accessor', () => {
		// 		eq(k_property.$.rdfs.label(), 'Banana');
		// 	});

		// 	it('returns primitive value when called', () => {
		// 		eq(k_property.$('rdfs:').label(), 'Banana');
		// 	});

		// 	it('returns primitive value when is numeric and called', () => {
		// 		eq(k_property.data(), 25);
		// 	});

		// 	it('contains @type property', () => {
		// 		eq(k_property.tastes['@type'], 'http://www.w3.org/2001/XMLSchema#string');
		// 	});

		// 	it('contains @value property', () => {
		// 		eq(k_property.tastes['@value'], '"good"');
		// 	});

		// 	it('suffixes namespaced datatype', () => {
		// 		eq(k_property.shape.$type(), 'Liberty');
		// 	});

		// 	it('does not mis-suffix non-namespaced datatype', () => {
		// 		eq(k_property.$('rdfs:').label.$type(), undefined);
		// 	});

		// 	it('suffixes datatype on namespace changed', () => {
		// 		eq(k_property.$('rdfs:').label.$type('xsd:'), 'string');
		// 	});

		// 	it('has literal type indicator', () => {
		// 		eq(k_property.$('rdfs:').label.$is.literal, true);
		// 	});

		// 	it('calling type indicator returns literal', () => {
		// 		eq(k_property.$('rdfs:').label.$is(), 'literal');
		// 	});

		// 	it('serializes to nquad', () => {
		// 		eq(k_property.$('rdfs:').label.$nquad(), '"Banana"^^<http://www.w3.org/2001/XMLSchema#string>');
		// 	});

		// 	it('nquad contains datatype property', () => {
		// 		eq(k_property.$('rdfs:').label.$nquad.datatype(), '<http://www.w3.org/2001/XMLSchema#string>');
		// 	});

		// 	it('serializes to n3; supports auto-prefixing datatype with literal', () => {
		// 		eq(k_property.$('rdfs:').label.$n3(), '"Banana"^^xsd:string');
		// 	});

		// 	it('supports auto-prefixing just datatype', () => {
		// 		eq(k_property.$('rdfs:').label.$n3.datatype(), 'xsd:string');
		// 	});
		// });


		// describe('iri', () => {

		// 	it('contains @id property', () => {
		// 		eq(k_property.appears['@id'], 'vocab://color/Yellow');
		// 	});

		// 	it('contains @type property', () => {
		// 		eq(k_property.class['@type'], '@id');
		// 	});

		// 	it('contains suffixed id property', () => {
		// 		eq(k_property.class.$id(), 'Berry');
		// 	});

		// 	it('supports $id ns change', () => {
		// 		eq(k_property.appears.$id('color:'), 'Yellow');
		// 	});

		// 	it('suffixes iri when called', () => {
		// 		eq(k_property.class(), 'Berry');
		// 	});

		// 	it('does not mis-suffix non-namespaced iri', () => {
		// 		eq(k_property.appears(), undefined);
		// 	});

		// 	it('suffixes datatype on iri ns change when called', () => {
		// 		eq(k_property.appears('color:'), 'Yellow');
		// 	});

		// 	it('suffixes datatype on ns change before call', () => {
		// 		eq(k_property.appears.$('color:')(), 'Yellow');
		// 	});

		// 	it('suffixes datatype on ns change before $id', () => {
		// 		eq(k_property.appears.$('color:').$id(), 'Yellow');
		// 	});

		// 	it('serializes to n3', () => {
		// 		eq(k_property.appears.$n3(), 'color:Yellow');
		// 	});

		// 	it('serializes to nquad', () => {
		// 		eq(k_property.class.$nquad(), '<vocab://ns/Berry>');
		// 	});

		// 	it('has iri type indicator', () => {
		// 		eq(k_property.appears.$is.iri, true);
		// 	});

		// 	it('calling type indicator returns iri', () => {
		// 		eq(k_property.appears.$is(), 'iri');
		// 	});

		// 	it('emulates rdf namespace for rdf:type', () => {
		// 		eq(k_property.$('rdf:')('type').filter(x => x.$in('ns:'))[0].$('ns:').$id(), 'Food');
		// 	});

		// 	it('dereferences to node', () => {
		// 		eq(k_property.$types.filter(x => x.$in('plant:'))[0].$node('ns:').contains.$id('plant:'), 'Seeds');
		// 	});

		// 	it('supports access-by-name property on namespace accessor', () => {
		// 		eq(k_property.appears.$.color.$id(), 'Yellow');
		// 	});
		// });


		// describe('predicate points to multiple objects', () => {

		// 	it('supports forEach', () => {
		// 		let a_items = [];
		// 		k_property('alias').forEach((k_item) => {
		// 			a_items.push(k_item());
		// 		});
		// 		includes(a_items, ['Cavendish', 'Naner', 'Bananarama']);
		// 	});

		// 	it('supports implicit map callback', () => {
		// 		let a_items = k_property('alias', (k_item) => {
		// 			return k_item();
		// 		});
		// 		includes(a_items, ['Cavendish', 'Naner', 'Bananarama']);
		// 	});

		// });


		// describe('collection', () => {

		// 	it('serializes to n3', () => {
		// 		eq(k_property.stages.$n3(), '[rdf:first ns:FindSpace;rdf:rest (plant:Seed plant:Grow plant:Harvest)]');
		// 	});

		// 	it('serializes to nquad', () => {
		// 		eq(k_property.stages.$nquad(), '_:b5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <vocab://ns/FindSpace>. '
		// 			+'_:b5 <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> _:b6. '
		// 			+'_:b6 <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <vocab://plant/Seed>. '
		// 			+'_:b6 <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> _:b7. '
		// 			+'_:b7 <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <vocab://plant/Grow>. '
		// 			+'_:b7 <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> _:b8. '
		// 			+'_:b8 <http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <vocab://plant/Harvest>. '
		// 			+'_:b8 <http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> <http://www.w3.org/1999/02/22-rdf-syntax-ns#nil>. ');
		// 	});

		// 	it('supports implicit map callback', () => {
		// 		let a_items = k_property.stages((k_item) => {
		// 			return k_item.$id() || k_item.$('plant:').$id();
		// 		});
		// 		eq(Array.isArray(a_items), true);
		// 		deep(a_items, ['FindSpace', 'Seed', 'Grow', 'Harvest']);
		// 	});

		// 	it('returns simple array on invocation', () => {
		// 		let a_items = [];
		// 		k_property.stages().forEach((k_item) => {
		// 			a_items.push(k_item.$id() || k_item.$('plant:').$id());
		// 		});
		// 		includes(a_items, ['FindSpace', 'Seed', 'Grow', 'Harvest']);
		// 	});

		// 	it('emulates rdf:first/next/nil', () => {
		// 		let a_rdf = k_property.stages.$('rdf:');
		// 		eq(a_rdf.first.$('ns:').$id(), 'FindSpace');
		// 		let w_rest = a_rdf.rest;
		// 		eq(w_rest.first.$('plant:').$id(), 'Seed');
		// 		w_rest = w_rest.rest;
		// 		eq(w_rest.first.$('plant:').$id(), 'Grow');
		// 		w_rest = w_rest.rest;
		// 		eq(w_rest.first.$('plant:').$id(), 'Harvest');
		// 		w_rest = w_rest.rest;
		// 		eq(w_rest.$id(), 'nil');
		// 	});

		// 	it('has collection type indicator', () => {
		// 		eq(k_property.stages.$is.collection, true);
		// 	});

		// 	it('calling type indicator returns collection', () => {
		// 		eq(k_property.stages.$is(), 'collection');
		// 	});
		// });

	});

});
