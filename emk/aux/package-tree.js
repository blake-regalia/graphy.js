
// package tree
module.exports = {
	core: {
		class: {
			writable: () => ({
				links: ['core.data.factory', 'core.class.scribable'],
				description: 'Serialize RDF conveniently and with style',
			}),
			scribable: () => ({
				links: ['core.data.factory', 'core.iso.stream'],
				description: 'Serialize RDF fast',
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
				dependencies: [
					'readable-stream',
				],
			}),

			master: () => ({
				description: 'Provides simple, isomorphic worker (from main thread) interface for node.js / browser',
				includes: ['master-node.js', 'master-browser.js'],
				json: {
					browser: {
						'./master-node.js': false,
					},
				},
			}),

			worker: () => ({
				description: 'Provides simple, isomorphic worker (from worker thread) interface for node.js / browser',
				includes: ['worker-node.js', 'worker-browser.js'],
				json: {
					browser: {
						'./master-node.js': false,
					},
				},
			}),
		},
	},

	util: {
		dataset: {
			tree: () => ({
				links: ['core.data.factory', 'core.iso.stream'],
				description: `This package is now an alias for where it has been moved to: '@graphy/memory.dataset.fast'`,
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

	memory: {
		dataset: {
			fast: () => ({
				links: ['core.data.factory', 'core.iso.stream'],
				description: 'Create a dataset of quads in memory for comparison and set operations such as union, intersection, difference, etc.',
			}),
		},
	},

	// content: {
	// 	sparql_results: {
	// 		read: () => ({
	// 			links: [
	// 				'core.data.factory',
	// 			],
	// 			description: 'Single-threaded SPARQL Query Results JSON Format (application/sparql-results+json) reader',
	// 		}),
	// 	},
	// },

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
