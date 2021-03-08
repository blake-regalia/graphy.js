const G_PACKAGE_JSON_SUPER = require('../package.json');

const S_SEMVER = `^${G_PACKAGE_JSON_SUPER.version}`;

// package tree
const H_MODULES = {
	types: {
		links: [],
		description: 'Typings for all graphy public classes and methods',
		json: {
			main: '',
			module: '',
			exports: {},
		},
	},
	internal: {
		links: ['types'],
		description: 'Internal to graphy',
		dependencies: [
			'readable-stream',
		],
	},
	core: {
		links: ['types'],
		description: 'Contains the core classes used by all other modules',
		dependencies: [
			'uri-js',
		],
	},
	memory: {
		links: ['types', 'core'],
		description: 'Data structures and algorithms for RDF graphs',
	},
	content: {
		links: ['types', 'core', 'memory'],
		description: 'RDF content manipulators; read, write, scan, scribe, load',
		dependencies: [
			'uri-js',
		],
	},
};

// normalize module desciptors
const h_super_deps = Object.assign(G_PACKAGE_JSON_SUPER.dependencies);
for(const [si_module, g_module] of Object.entries(H_MODULES)) {
	// auto-default ref package.json struct
	const g_json = g_module.json = g_module.json || {};

	// no name, use default
	if(!g_json.name) {
		g_json.name = `@graphy/${si_module}`;
	}

	// copy-by-value fields
	Object.assign(g_json, {
		description: g_module.description,
	});

	// auto-default ref dependencies
	const h_dependencies = g_json.dependencies = (g_module.dependencies || [])
		.reduce((h_deps, si_dep) => {
			if(!(si_dep in h_super_deps)) throw new Error(`super repository missing sub-package (${si_module}) dependency: ${si_dep}`);
			return {
				[si_dep]: h_super_deps[si_dep],
			};
		}, {});

	// convert links to dependencies
	for(const si_link of g_module.links) {
		h_dependencies[`@graphy/${si_link}`] = S_SEMVER;
	}
}


module.exports = H_MODULES;
