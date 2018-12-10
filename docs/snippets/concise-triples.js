
const factory = require('@graphy-dev/core.data.factory');
const ttl_write = require('@graphy-dev/content.ttl.write');

let k_writer = ttl_write({
	prefixes: {
		rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
		owl: 'http://www.w3.org/2002/07/owl#',
		dbr: 'http://dbpedia.org/resource/',
		dbo: 'http://dbpedia.org/ontology/',
		demo: 'http://ex.org/demo#',
		'': 'http://ex.org/owl#',
	},
});

k_writer.pipe(process.stdout);

// the following demonstrates the use of a concise triples hash
k_writer.add({
	// triples about dbr:Banana
	[factory.comment()]: 'hey look, a comment!',
	'dbr:Banana': {
		// `a` is shortcut for rdf:type
		a: 'dbo:Plant',

		// list of objects
		'rdfs:label': ['@en"Banana', '@fr"Banane', '@es"Plátano'],

		// nested array becomes an RDF collection
		'demo:steps': [
			['demo:Peel', 'demo:Slice', 'demo:distribute'],
		],
	},

	// example from OWL 2 primer: https://www.w3.org/TR/owl2-primer/#Property_Restrictions
	[factory.comment()]: 'hey look, another comment!',
	':HappyPerson': {
		a: 'owl:Class',
		'owl:equivalentClass': {
			a: 'owl:Class',
			'owl:intersectionOf': [
				[
					{
						a: 'owl:Restriction',
						'owl:onProperty': ':hasChild',
						'owl:allValuesFrom': ':Happy',
					},
					{
						a: 'owl:Restriction',
						'owl:onProperty': ':hasChild',
						'owl:someValuesFrom': ':Happy',
					},
				],
			],
		},
	},
});

k_writer.end();
