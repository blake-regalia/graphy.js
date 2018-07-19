
// content
module.exports = {
	// content packages
	packages: {
		// bat: {
		// 	modes: [
		// 		'create',
		// 		'read',
		// 	],
		// },
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
		create: {
			links: [],
			files: [
				'main.js',
				'package.json',
			],
		},

		read: {
			description: s => `Single-threaded ${s} content reader`,
			links: [
				'api.data.factory',
			],
			files: [
				'main.js',
				'package.json',
			],
		},

		turbo: {
			description: s => `Multi-threaded ${s} content reader`,
			links: [
				'api.data.factory',
			],
			files: [
				'main.js',
				'worker.js',
				'package.json',
			],
		},

		write: {
			description: s => `${s} content writer`,
			links: [
				'api.data.factory',
			],
			files: [
				'main.js',
				'package.json',
			],
		},
	},
};
