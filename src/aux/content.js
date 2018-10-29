
// content
module.exports = {
	// content packages
	packages: {
		nt: {
			super: 'n',
			description: 'RDF N-Triples',
			modes: [
				'read',
				'turbo',
				'write',
			],
		},
		// nq: 'n',
		ttl: {
			super: 't',
			description: 'RDF Turtle',
			modes: [
				'read',
				'turbo',
				'write',
			],
		},
		// trig: 't',
	},

	// content modes
	modes: {
		read: {
			description: s => `Single-threaded ${s} content reader`,
			links: [
				'api.iso.stream',
				'api.data.factory',
			],
			files: {
				'main.js': ['../text.read.jmacs'],
			},
		},

		turbo: {
			description: s => `Multi-threaded ${s} content reader`,
			links: [
				'api.data.factory',
			],
			files: {
				'main.js': [],
				'worker.js': [],
			},
		},

		write: {
			description: s => `${s} content writer`,
			links: [
				'api.class.writable',
			],
			files: {
				'main.js': [],
			},
		},
	},
};
