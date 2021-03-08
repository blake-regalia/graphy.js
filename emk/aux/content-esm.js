const G_MODES_N_FAMILY = {
	read: {},
	write: {},
	scan: {},
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
	load: {
		dependencies: [
			'uri-js',
		],
	},
};

// content
module.exports = {
	// content packages
	packages: {
		nt: {
			super: 'n',
			export_prefix: 'NTriples',
			description: 'RDF N-Triples',
			modes: G_MODES_N_FAMILY,
			manifest: 'https://w3c.github.io/rdf-tests/ntriples/manifest.ttl',
			mime: 'application/n-triples',
		},
		nq: {
			super: 'n',
			export_prefix: 'NQuads',
			description: 'RDF N-Quads',
			modes: G_MODES_N_FAMILY,
			manifest: 'https://w3c.github.io/rdf-tests/nquads/manifest.ttl',
			mime: 'application/n-quads',
		},
		ttl: {
			super: 't',
			export_prefix: 'Turtle',
			description: 'RDF Turtle',
			modes: G_MODES_T_FAMILY,
			manifest: 'https://w3c.github.io/rdf-tests/turtle/manifest.ttl',
			mime: 'text/turtle',
		},
		trig: {
			super: 't',
			export_prefixes: 'TriG',
			description: 'RDF TriG',
			modes: G_MODES_T_FAMILY,
			manifest: 'https://w3c.github.io/rdf-tests/trig/manifest.ttl',
			mime: 'application/trig',
		},
		xml: {
			super: 'xml',
			export_prefix: 'RdfXml',
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
			export_suffix: 'Reader',
			description: s => `Single-threaded ${s} content reader`,
			links: [
				'core',
				'internal',
			],
			files: {
				'main.js': ['../text.read.jmacs'],
			},
		},

		load: {
			export_suffix: 'Loader',
			description: s => `Single-threaded ${s} content loader`,
			links: [
				'core',
				'internal',
			],
			files: {
				'main.js': [
					'./read/main.js.jmacs',
					'../text.read.jmacs',
				],
			},
		},

		scan: {
			export_suffix: 'Scanner',
			description: s => `Multi-threaded ${s} content reader`,
			links: [
				'core',
			],
			files: {
				'main.js': [],
				// 'master.js': [],
				'task-presets.js': [],
				'worker.js': [],
			},
		},

		write: {
			export_suffix: 'Writer',
			description: s => `${s} content writer for dynamic and stylized output`,
			links: [
				'core',
				'internal',
			],
			files: {
				'main.js': [],
			},
		},

		scribe: {
			export_suffix: 'Scriber',
			description: s => `${s} content scriber for fast and simple output`,
			links: [
				'core',
				'internal',
			],
			files: {
				'main.js': [],
			},
		},
	},
};
