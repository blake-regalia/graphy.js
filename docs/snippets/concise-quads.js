
const factory = require('@graphy-dev/api.data.factory');
const trig_write = require('@graphy-dev/content.trig.write');

let k_writer = trig_write({
	prefixes: {
		rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
		owl: 'http://www.w3.org/2002/07/owl#',
		dbr: 'http://dbpedia.org/resource/',
		dbo: 'http://dbpedia.org/ontology/',
		demo: 'http://ex.org/demo#',
	},
});

k_writer.pipe(process.stdout);

// the following demonstrates the use of a concise quads hash
k_writer.add({
	// example 2 from TriG: https://www.w3.org/TR/trig/
	[factory.comment()]: 'default graph',
	'*': {
		'demo:bob': {
			'dc:publisher': '"Bob',
		},
		'demo:alice': {
			'dc:publisher': '"Alice',
		},
	},

	'demo:bob': {
		'_:a': {
			'foaf:name': '"Bob',
			'foaf:mbox': '>mailto:bob@oldcorp.example.org',
			'foaf:knows': '_:b',
		},
	},

	'demo:alice': {
		'_:b': {
			'foaf:name': '"Alice',
			'foaf:mbox': '>mailto:alice@work.example.org',
		},
	},
});

k_writer.end();