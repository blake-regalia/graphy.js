
// package tree
module.exports = {
	api: {
		class: {
			writable: () => ({
				links: ['api.data.factory', 'api.iso.stream'],
				description: 'Produce quads using nestable concise term string objects',
			}),
		},
		data: {
			factory: () => ({
				description: 'Create instances of Terms and Triples/Quads. Implements @RDFJS DataFactory',
			}),
			set: () => ({
				links: ['api.data.factory', 'api.iso.stream'],
				description: 'Create a mathematical set of triples for comparison and operations such as union, intersection, difference, etc.',
			}),
		},
		iso: {
			stream: () => ({
				description: 'Provides isomorphic stream interface for node.js / browser and adds `.until`, a promisified version of the `.on` event listener',
			}),
		},
		ui: {
			viz: () => ({
				description: 'Create graphviz visualizations of triples and quads',
			}),
		},
	},

	content: {
		bat: {
			create: () => ({
				dependencies: [
					'bkit',
				],
				links: [
					// 'content.bat.decoders',
					'content.bat.primer',
					'content.bat.serializer',
				],
				description: 'Create a compact RDF dataset according to the BAT format',
			}),
			decoders: () => ({
				dependencies: [
					'bkit',
				],
				description: 'Create a compact RDF dataset according to the BAT format',
			}),
			primer: () => ({
				description: 'Intermediate data structures for creating a compact dataset',
			}),
			serializer: () => ({
				dependencies: [
					'bkit',
					'worker',
				],
				description: 'Serialize an RDF dataset in the BAT format',
			}),
			decode: () => ({
				description: 'Decode BAT data',
			}),
		},

		sparql_results: {
			read: () => ({
				links: [
					'api.data.factory',
				],
				description: 'Single-threaded SPARQL Query Results JSON Format (application/sparql-results+json) reader',
			}),
		},
	},

	schema: {
		bat: {
			default: () => ({
				dependencies: ['bkit'],
				description: 'Default BAT schema',
			}),
		},
	},

	store: {
		memory: {
			query: () => ({
				description: 'Query an in-memory quadstore using GTAR, the Graph Traversal API for RDF',
			}),
			create: () => ({
				links: [
					'content.bat.create',
					'content.bat.decode',
					'schema.bat.default',
					'store.memory.query',
				],
				description: 'Create a quadstore in memory from a graphy event stream',
			}),
		},
	},
};
