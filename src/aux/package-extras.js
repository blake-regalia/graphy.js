module.exports = {
	graphy: {
		name: 'graphy',
		description: 'A comprehensive RDF toolkit including triplestores, intuitive writers, and the fastest JavaScript parsers on the Web',
	},
	factory: {
		name: '@graphy/factory',
		description: 'Create instances of Terms and Triples/Quads. Implements @RDFJS DataFactory',
	},
	store: {
		name: '@graphy/store',
		description: 'Query an RDF graph using patterns and paths',
	},
	writer: {
		name: '@graphy/writer',
		description: 'Produce quads using nestable concise term string objects',
	},
	set: {
		name: '@graphy/set',
		description: 'Create a mathematical set of triples for comparison and operations such as union, intersection, difference, etc.',
	},
	viz: {
		name: '@graphy/viz',
		description: 'Create graphviz visualizations of triples and quads',
	},
	bat: {
		name: '@graphy/bat',
		description: 'Binary Application Triples',
		dependencies: [
			'bkit',
		],
	},
	'nq-parser': {
		name: '@graphy/nq-parser',
		description: 'RDF N-Quads parser',
	},
	'nq-writer': {
		name: '@graphy/nq-writer',
		description: 'RDF N-Quads writer',
	},
	'nt-parser': {
		name: '@graphy/nt-parser',
		description: 'RDF N-Triples parser',
	},
	'nt-writer': {
		name: '@graphy/nt-writer',
		description: 'RDF N-Triples writer',
	},
	'trig-parser': {
		name: '@graphy/trig-parser',
		description: 'RDF TriG parser',
	},
	'trig-writer': {
		name: '@graphy/trig-writer',
		description: 'RDF TriG writer',
	},
	'ttl-parser': {
		name: '@graphy/ttl-parser',
		description: 'RDF Turtle parser',
	},
	'ttl-writer': {
		name: '@graphy/ttl-writer',
		description: 'RDF Turtle writer',
	},
};
