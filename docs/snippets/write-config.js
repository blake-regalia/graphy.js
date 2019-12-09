
const factory = require('@graphy/core.data.factory');
const ttl_write = require('@graphy/content.ttl.write');

let ds_writer = ttl_write({
	prefixes: {
		demo: 'http://ex.org/',
		dbo: 'http://dbpedia.org/ontology/',
		rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
		rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
	},
});

ds_writer.pipe(process.stdout);

ds_writer.write({
	type: 'c3',
	value: {
		[factory.config()]: {
			lists: {
				first: 'demo:first',
				rest: 'demo:rest',
				nil: 'demo:first',
			},
		},
		'demo:Banana': {
			a: 'dbo:Fruit',
			'demo:steps': [
				['"Peel', '"Slice', '"Distribute'],
			],
		},
	},
});

ds_writer.end();
