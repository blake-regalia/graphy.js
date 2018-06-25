module.exports = {
	graphy: {
		name: 'graphy',
		description: 'A comprehensive RDF toolkit including triplestores, intuitive writers, and the fastest JavaScript parsers on the Web',
	},
	factory: {
		description: 'Create instances of Terms and Triples/Quads. Implements @RDFJS DataFactory',
	},
	stream: {
		description: 'Provides isomorphic stream interface for node.js / browser and adds `.until`, a promisified version of the `.on` event listener',
	},
	store: {
		description: 'Query an RDF graph using patterns and paths',
	},
	writer: {
		description: 'Produce quads using nestable concise term string objects',
	},
	set: {
		description: 'Create a mathematical set of triples for comparison and operations such as union, intersection, difference, etc.',
	},
	viz: {
		description: 'Create graphviz visualizations of triples and quads',
	},
	bat: {
		description: 'Binary Application Triples',
		dependencies: [
			'bkit',
		],
	},
	format: {
		// common: {
		// 	parser: {
		// 		text: {
		// 			description: 'Abstract parser class for text-based formats',
		// 		},
		// 	},
		// },
		nt: {
			read: {
				description: 'RDF N-Triples parser (single-threaded)',
			},
			turbo: {
				description: 'Multi-threaded RDF N-Triples parser',
				dependencies: [
					'worker',
				],
			},
			write: {
				description: 'RDF N-Triples writer',
			},
		},
		ttl: {
			read: {
				description: 'RDF Turtle parser (single-threaded)',
			},
			turbo: {
				description: 'Multi-threaded RDF Turtle parser',
			},
			write: {
				description: 'RDF Turtle writer',
			},
		},
		nq: {
			read: {
				description: 'RDF N-Quads parser',
			},
			turbo: {
				description: 'Multi-threaded RDF N-Quads parser',
			},
			write: {
				description: 'RDF N-Quads writer',
			},
		},
		trig: {
			read: {
				description: 'RDF TriG parser',
			},
			turbo: {
				description: 'Multi-threaded RDF Trig parser',
			},
			write: {
				description: 'RDF TriG writer',
			},
		},
	},
};
