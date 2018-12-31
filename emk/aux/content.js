
// content
module.exports = {
	// content packages
	packages: {
		nt: {
			super: 'n',
			description: 'RDF N-Triples',
			modes: [
				'read',
				'write',
			],
			manifest: 'http://w3c.github.io/rdf-tests/ntriples/manifest.ttl',
			mime: 'application/n-triples',
		},
		nq: {
			super: 'n',
			description: 'RDF N-Quads',
			modes: [
				'read',
				'write',
			],
			manifest: 'http://w3c.github.io/rdf-tests/nquads/manifest.ttl',
			mime: 'application/n-quads',
		},
		ttl: {
			super: 't',
			description: 'RDF Turtle',
			modes: [
				'read',
				'write',
			],
			manifest: 'http://w3c.github.io/rdf-tests/turtle/manifest.ttl',
			mime: 'text/turtle',
		},
		trig: {
			super: 't',
			description: 'RDF TriG',
			modes: [
				'read',
				'write',
			],
			manifest: 'http://w3c.github.io/rdf-tests/trig/manifest.ttl',
			mime: 'application/trig',
		},
	},

	// content modes
	modes: {
		read: {
			description: s => `Single-threaded ${s} content reader`,
			links: [
				'core.iso.stream',
				'core.data.factory',
			],
			dependencies: [
				'uri-js',
			],
			files: {
				'main.js': ['../text.read.jmacs'],
			},
		},

		scan: {
			description: s => `Multi-threaded ${s} content reader`,
			links: [
				'core.data.factory',
			],
			files: {
				'main.js': [],
				'worker.js': [],
			},
		},

		write: {
			description: s => `${s} content writer`,
			links: [
				'core.class.writable',
			],
			dependencies: [
				'big-integer',
			],
			files: {
				'main.js': [],
			},
		},

		scribe: {
			description: s => `${s} content scriber`,
			links: [
				'core.class.writable',
			],
			files: {
				'main.js': [],
			},
		},
	},
};
