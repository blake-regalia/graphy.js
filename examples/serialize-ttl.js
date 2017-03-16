const fs = require('fs');
const graphy = require('graphy');

// create TTL serializer
let ds_serializer = graphy.ttl.serializer({
	prefixes: {
		dt: 'http://dbpedia.org/datatype/',
		dbr: 'http://dbpedia.org/resource/',
		dbo: 'http://dbpedia.org/ontology/',
		dbp: 'http://dbpedia.org/property/',
		owl: 'http://www.w3.org/2002/07/owl#',
		rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
		xsd: 'http://www.w3.org/2001/XMLSchema#',
		color: 'http://example.org/color#',
		'umbel-rc': 'http://umbel.org/umbel/rc/',
	},
});

// once readable stream closes
ds_serializer.on('close', () => {
	console.log('done');
});

// pipe to output file
ds_serializer.pipe(fs.createWriteStream('output.ttl'));

// get TTL writer from serializer
let k_writer = ds_serializer.writer;

// add some triples
k_writer.add({
	// subject
	'dbr:Banana': {
		// predicate: object (full IRI)
		'owl:sameAs': '<http://wikidata.dbpedia.org/resource/>',

		// prefixed IRIs
		'rdf:type': [
			'owl:Thing',

			// repeat prefix
			...['Plant', 'EukaryoticCell', 'BiologicalLivingObject']
				.map(s => 'umbel-rc:'+s),
		],

		// IRIs are automatically escaped if needed
		'dbo:category': 'dbr:Category/Edible_fruits',
		'dbo:ingredientOf': 'dbr:Banana_boat_(food)',

		// plain literal
		'rdfs:comment': '"Bananas are amazing.',

		// plain literal with quotes
		'dbo:abstract': '"Bananas, pronounced "bəˈnanəz", are yellow!',

		// literals w/ language tags
		'rdfs:label': [
			'@en"Banana',
			'@fr"Banane',
			'@nl"Banaan',
		],

		// datatyped literals
		'dbp:fiber': '^dt:gram"2.6',
		'dbp:protein': '^dt:gram"1.09',
		'dbp:sugars': '^dt:gram"12.23',

		// named blank node
		'dbp:taste': '_:good_taste',

		// anonymous blank node
		'dbp:color': {
			'color:asHexadecimal': '"ffd700',

			// nested anonymous blank nodes
			'color:asRGB': {
				'color:red': '^xsd:integer"255',
				'color:green': '^xsd:integer"215',
				'color:blue': '^xsd:integer"0',
			},
		},

		// RDF collection
		'dbp:cerealInstructions': {
			$: ['"peel', '"slice', '"distribute'],
		},
	},
});

// all done writing
ds_serializer.close();

