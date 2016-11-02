/*eslint indent:0*/
const assert = require('assert');
const deq = assert.deepStrictEqual;
const eq = assert.strictEqual;
const fs = require('fs');

const graphy = require('../../dist/main/graphy.js');


describe('linked api:', () => {
	it('can wait', () => {
		eq(true, true);
	});

	graphy.ttl.linked(fs.createReadStream(__dirname+'/banana.ttl'), (e, g) => {

		let banana = g.enter('dbr:Banana');


		describe('dbr:Banana rdfs:label ?label:', () => {

			it('query-style === semantic-access-path-style', () => {
				eq(banana.hop('rdfs:label'), banana.at.rdfs.label);
			});

			it('Bag.terms', () => {
				eq(banana.at.rdfs.label.terms.length, 9);
			});

			it('Bag.sample()', () => {
				eq(banana.at.rdfs.label.sample(), 'Banane');
			});

			it('Bag.sample(); again, but different result', () => {
				eq(banana.at.rdfs.label.sample(), 'موز');
			});

			it('Bag.values()', () => {
				deq(banana.at.rdfs.label.values(), ['Банан', 'Banane', 'موز', '香蕉', 'Banana', 'Banaan (vrucht)', 'バナナ', 'Banana', 'Banana']);
			});

			it('Bag.termTypes()', () => {
				deq(banana.at.rdfs.label.termTypes(), Array(9).fill('Literal'));
			});

			it('Bag.literals', () => {
				deq(banana.at.rdfs.label.literals.values(), ['Банан', 'Banane', 'موز', '香蕉', 'Banana', 'Banaan (vrucht)', 'バナナ', 'Banana', 'Banana']);
			});

			it('Bag.literals()', () => {
				deq(banana.at.rdfs.label.literals().values(), ['Банан', 'Banane', 'موز', '香蕉', 'Banana', 'Banaan (vrucht)', 'バナナ', 'Banana', 'Banana']);
			});

			it('Bag.literals(langtag)', () => {
				deq(banana.at.rdfs.label.literals('@en').values(), ['Banana']);
			});

			it('Bag.literals(datatype); nonexistent', () => {
				deq(banana.at.rdfs.label.literals('<nonexistent>').values(), []);
			});

			it('Bag.literals(datatype); prefixed name', () => {
				deq(banana.at.dbp.carbs.literals('ns28:gram').values(), ['22.84']);
			});

			it('Bag.literals(datatype); iri', () => {
				deq(banana.at.dbp.fiber.literals('<http://dbpedia.org/datatype/gram>').values(), ['2.6']);
			});

			it('Literal.isLiteral', () => {
				eq(banana.at.rdfs.label.literals.terms[0].isLiteral, true);
			});

			it('LiteralBunch.areLiterals', () => {
				eq(banana.at.rdfs.label.literals.areLiterals, true);
			});
		});


		describe('dbr:Banana a ?type:', () => {

			it('?type {anyNodes}.nodes === {namedNodes}.nodes', () => {
				deq(banana.at.rdf.type.anyNodes.nodes, banana.at.rdf.type.namedNodes.nodes);
			});

			it('NodeSet.areNodes; .anyNodes', () => {
				eq(banana.at.rdf.type.anyNodes.areNodes, true);
			});

			it('NodeSet.areNodes; .namedNodes', () => {
				eq(banana.at.rdf.type.namedNodes.areNodes, true);
			});

			it('NodeSet.nodes', () => {
				eq(banana.at.rdf.type.namedNodes.nodes.length, 4);
			});

			describe('?type ^rdf:type ?other', () => {

				it('NodeSet.inverseHop("rdf:type")', () => {
					// eq(banana.at.rdf.type.inverseHop('rdf:type')namedNodes.length, 4);
				});
			});

		});

	});
});
