
// package tree
module.exports = {
	core: {
		class: {
			writable: () => ({
				links: ['core.data.factory', 'core.iso.stream'],
				description: 'Serialize RDF using a variety of object interfaces',
			}),
			scribable: () => ({
				links: ['core.data.factory', 'core.iso.stream'],
				description: 'Serialize RDF using RDF/JS quads',
			}),
		},
		data: {
			factory: () => ({
				description: 'Create instances of Terms and Triples/Quads. Implements @RDFJS DataFactory',
				dependencies: [
					'uri-js',
				],
			}),
		},
		iso: {
			stream: () => ({
				description: 'Provides isomorphic stream interface for node.js / browser and adds `.until`, a promisified version of the `.on` event listener',
			}),
		},
	},

	util: {
		dataset: {
			tree: () => ({
				links: ['core.data.factory', 'core.iso.stream'],
				description: 'Create a mathematical set of triples for comparison and operations such as union, intersection, difference, etc.',
			}),
		},
		...('graphy-ignore' === process.env.GRAPHY_CHANNEL
			? {
				ui: {
					viz: () => ({
						description: 'Create graphviz visualizations of triples and quads',
					}),
				},
			}
			: {}),
	},

	content: {
		sparql_results: {
			read: () => ({
				links: [
					'core.data.factory',
				],
				description: 'Single-threaded SPARQL Query Results JSON Format (application/sparql-results+json) reader',
			}),
		},
	},

	// store: {
	// 	memory: {
	// 		query: () => ({
	// 			description: 'Query an in-memory quadstore using GTAR, the Graph Traversal API for RDF',
	// 		}),
	// 		create: () => ({
	// 			links: [
	// 				'store.memory.query',
	// 			],
	// 			description: 'Create a quadstore in memory from a graphy event stream',
	// 		}),
	// 	},
	// },
};
