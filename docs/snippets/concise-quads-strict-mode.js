
const trig_write = require('@graphy/content.trig.write');

// create a TriG content writer
let ds_writer = trig_write({
	prefixes: {
		rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
		owl: 'http://www.w3.org/2002/07/owl#',
		dbr: 'http://dbpedia.org/resource/',
		dbo: 'http://dbpedia.org/ontology/',
		dc: 'http://purl.org/dc/terms/',
		foaf: 'http://xmlns.com/foaf/0.1/',
		demo: 'http://ex.org/demo#',
	},
});

// pipe to stdout
ds_writer.pipe(process.stdout);

// write some quads using a concise quads hash
ds_writer.write({
	type: 'c4r',
	value: {  // example 2 from TriG: https://www.w3.org/TR/trig/
		'*': {
			'demo:bob': {
				'dc:publisher': ['"Bob'],
			},
			'demo:alice': {
				'dc:publisher': ['"Alice'],
			},
		},

		'demo:bob': {
			'_:a': {
				'foaf:name': ['"Bob'],
				'foaf:mbox': ['>mailto:bob@oldcorp.example.org'],
				'foaf:knows': ['_:b'],
			},
		},

		'demo:alice': {
			'_:b': {
				'foaf:name': ['"Alice'],
				'foaf:mbox': ['>mailto:alice@work.example.org'],
			},
		},
	},
});

// end the writable side of the transform
ds_writer.end();
