const G_MODES_N_FAMILY = {
	read: {},
	write: {},
	// scan: {},
	scribe: {},
};

const G_MODES_T_FAMILY = {
	read: {
		dependencies: [
			'uri-js',
		],
	},
	write: {
		dependencies: [
			'big-integer',
		],
	},
	scribe: {},
};

// content
module.exports = {
	// content packages
	packages: {
		nt: {
			super: 'n',
			description: 'RDF N-Triples',
			modes: G_MODES_N_FAMILY,
			manifest: 'http://w3c.github.io/rdf-tests/ntriples/manifest.ttl',
			mime: 'application/n-triples',
		},
		nq: {
			super: 'n',
			description: 'RDF N-Quads',
			modes: G_MODES_N_FAMILY,
			manifest: 'http://w3c.github.io/rdf-tests/nquads/manifest.ttl',
			mime: 'application/n-quads',
		},
		ttl: {
			super: 't',
			description: 'RDF Turtle',
			modes: G_MODES_T_FAMILY,
			manifest: 'http://w3c.github.io/rdf-tests/turtle/manifest.ttl',
			mime: 'text/turtle',
		},
		trig: {
			super: 't',
			description: 'RDF TriG',
			modes: G_MODES_T_FAMILY,
			manifest: 'http://w3c.github.io/rdf-tests/trig/manifest.ttl',
			mime: 'application/trig',
		},
		xml: {
			super: 'xml',
			description: 'RDF/XML',
			modes: {
				scribe: {},
			},
			// manifest: 'http://w3c.github.io/rdf-tests/trig/manifest.ttl',
			mime: 'application/rdf+xml',
		},
	},

	// content modes
	modes: {
		read: {
			description: s => `Single-threaded ${s} content reader`,
			links: [
				'core.data.factory',
				'core.iso.stream',
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
			description: s => `${s} content writer for dynamic and stylized output`,
			links: [
				'core.data.factory',
				'core.class.writable',
			],
			files: {
				'main.js': [],
			},
		},

		scribe: {
			description: s => `${s} content scriber for fast and simple output`,
			links: [
				'core.data.factory',
				'core.class.writable',
			],
			files: {
				'main.js': [],
			},
		},
	},
};
