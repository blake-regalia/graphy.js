
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
		},
		nq: {
			super: 'n',
			description: 'RDF N-Quads',
			modes: [
				'read',
				'write',
			],
		},
		ttl: {
			super: 't',
			description: 'RDF Turtle',
			modes: [
				'read',
				'write',
			],
		},
		trig: {
			super: 't',
			description: 'RDF TriG',
			modes: [
				'read',
				'write',
			],
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
