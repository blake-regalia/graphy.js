const fs = require('fs');
const path = require('path');

const jmacs = require('jmacs');
const detective = require('detective');

const h_package_tree = require('./src/aux/package-tree.js');
const {
	packages: h_content_packages,
	modes: h_content_modes,
} = require('./src/aux/content.js');

const B_DEVELOPMENT = 'graphy-dev' === process.env.GRAPHY_CHANNEL;
const s_channel = process.env.GRAPHY_CHANNEL || 'graphy';

const g_package_json_super = require('./package.json');
const P_PACKAGE_JSON_BASE = `./src/aux/base-package-${s_channel}.json`;

const s_base_version = g_package_json_super[B_DEVELOPMENT? 'devVersion': 'version'];
const s_semver = B_DEVELOPMENT? s_base_version: `^${s_base_version}`;

const dir_struct = (a_files) => {
	let a_paths = [];
	for(let z_file of a_files) {
		if('string' === typeof z_file) {
			a_paths.push(z_file);
		}
		else {
			for(let s_dir in z_file) {
				a_paths.push(...dir_struct(z_file[s_dir]).map(s => `${s_dir}/${s}`));
			}
		}
	}

	return a_paths;
};

const files = (g_config={}, pd_rel=null) => {
	// accumulate results
	let a_outputs = [];

	// recurse on this directory
	if(g_config.under) {
		let p_pwd = g_config.under;
		pd_rel = pd_rel || p_pwd;

		// filter
		let f_filter = g_config.filter || (() => true);

		// map
		let f_map = g_config.map || (s => s);

		// each file under directory
		for(let s_file of fs.readdirSync(p_pwd)) {
			let p_file = `${p_pwd}/${s_file}`;

			// stat file
			let d_stat = fs.statSync(p_file);

			// subdirectory
			if(d_stat.isDirectory()) {
				a_outputs.push(...files({
					...g_config,
					under: p_file,
				}, pd_rel));
			}
			// file; filter, then map
			else if(f_filter(path.relative(pd_rel, p_file))) {
				a_outputs.push(f_map(path.relative(pd_rel, p_file)));
			}
		}
	}
	// bad input
	else {
		throw new TypeError(`expected 'under' key in files args struct`);
	}

	return a_outputs;
};


// for run commands to lint js files
const eslint = () => /* syntax: bash */ `
	npx eslint --fix --color --rule 'no-debugger: off' $@
	eslint_exit=$?
	# do not fail on warnings
	if [ $eslint_exit -eq 2 ]; then
		exit 0
	fi
	exit $eslint_exit
`;

// root library
const h_lib_root_package_json = {
	dependencies: {},
};

// package map
const h_packages = {};

// each package in the tree
(function map_tree(h_tree, s_path='') {
	// each branch in subtree
	for(let [s_key, z_value] of Object.entries(h_tree)) {
		// leaf node; call value producer and save normalized version to map
		if('function' === typeof z_value) {
			h_packages[s_path+s_key] = Object.assign({
				links: [],
			}, z_value());
		}
		// another subtree; recurse
		else {
			map_tree(z_value, s_path+s_key+'.');
		}
	}
})(h_package_tree);


// list of content subs
let a_content_subs = [];

// each content package
for(let [s_content, g_content] of Object.entries(h_content_packages)) {
	// ref base description
	let s_description_base = g_content.description;

	// each content mode of this package
	for(let s_mode of g_content.modes) {
		let g_mode = h_content_modes[s_mode];

		// mode description
		let s_description_mode = g_mode.description(s_description_base);

		// build package name
		let si_name = `content.${s_content}.${s_mode}`;

		// add definition to package hash
		h_packages[si_name] = {
			...g_mode,
			description: s_description_mode,
		};

		// content sub; add to sub map
		if(g_content.super) {
			h_packages[si_name].super = g_content.super;
			a_content_subs.push(si_name);
			// h_content_heirs[s_content] = si_name;
		}
	}
}


// normalize packages
for(let [si_package, g_package] of Object.entries(h_packages)) {
	// auto-default ref package.json struct
	let g_json = g_package.json = g_package.json || {};

	// no name, use default
	if(!g_json.name) {
		g_json.name = `@${s_channel}/${si_package}`;
	}

	// copy-by-value fields
	Object.assign(g_json, {
		description: g_package.description,
	});

	// auto-default ref dependencies
	let h_dependencies = g_json.dependencies = (g_package.dependencies || [])
		.reduce((h_deps, si_dep) => ({
			[si_dep]: g_package_json_super.dependencies[si_dep],
		}), {});

	// convert links to dependencies
	for(let si_link of g_package.links) {
		h_dependencies[`@${s_channel}/${si_link}`] = s_semver;
	}

	// add package dependency to root library
	h_lib_root_package_json.dependencies[`@${s_channel}/${si_package}`] = s_semver;
}


// recipe to make package.json file
const package_json = si_package => () => ({
	deps: [
		P_PACKAGE_JSON_BASE,
		'package.json',
	],

	run: /* syntax: bash */ `
		# load base package.json and enter
		cat $1| npx lambduh "g_base_package_json => {\
			${/* syntax: js */`
				// load package info
				let g_package_json = ${JSON.stringify(h_packages[si_package].json)};

				// update package.json
				return Object.assign(g_base_package_json, g_package_json, {
					version: '${s_base_version}',
				});
			`.trim().replace(/(["`])/g, '\\$1')} }" > $@

		# sort its package.json
		npx sort-package-json $@
	`,
});

// recipe to make .npmrc file
const npmrc = () => ({
	deps: [
		'.npmrc',
	],

	run: /* syntax: bash */ `
		# write .npmrc file
		echo "prefix = ../../../.npm-packages" >> $@
	`,
});

// recipe to build jmacs file
const jmacs_lint = (a_deps=[]) => ({
	deps: [
		...a_deps,
		...(a_deps.reduce((a_requires, p_dep) => {
			// skip directories
			if(fs.statSync(p_dep).isDirectory()) return a_requires;

			// load script into jmacs
			let g_compiled = jmacs.load(p_dep);

			return [
				...detective(g_compiled.meta.code),
				...g_compiled.meta.deps,
			].filter(s => s.startsWith('/'))
				.map(p => path.relative(process.cwd(), p));
		}, [])),
	],
	run: /* syntax: bash */ `
		npx jmacs $1 > $@ \
			&& ${eslint()}
	`,
});

// create intra-library links for development & testing
const package_node_modules = si_package => ({
	[`@${s_channel}`]: {
		...h_packages[si_package].links.reduce((h, si_link) => Object.assign(h, {
			[si_link]: () => ({
				deps: [
					`link.${si_link}`,
					// ...h_packages[si_link].links.map(s => `build/${s}/**`),
				],

				run: /* syntax: bash */ `
					cd build/${s_channel}/${si_package}

					# link to dep
					npm link @${s_channel}/${si_link}
				`,
			}),
		}), {}),
	},

	// external dependencies
	...(h_packages[si_package].dependencies || [])
		.reduce((h_deps, si_dep) => Object.assign(h_deps, {
			[si_dep]: () => ({
				deps: [
					`node_modules/${si_dep}`,
					'package.json',
				],
				run: /* syntax: bash */ `
					cd build/${s_channel}/${si_package}/node_modules
					ln -sf "../../../../$1" ${si_dep}
				`,
			}),
		}), {}),
});


const scoped_package = si_package => ({
	// '.npmrc': npmrc,

	'package.json': package_json(si_package),

	node_modules: package_node_modules(si_package),
});


// carry files from a main source file's subdirectory
const carry_sub = (pd_src, h_recipe={}) => {
	// scan directory
	let a_files = fs.readdirSync(pd_src);

	// each file
	for(let s_file of a_files) {
		let p_src = `${pd_src}/${s_file}`;

		// *.js files
		if(s_file.endsWith('.js')) {
			h_recipe[s_file] = () => ({copy:p_src});
		}
		// *.jmacs files
		else if(s_file.endsWith('.js.jmacs')) {
			h_recipe[s_file.slice(0, -'.jmacs'.length)] = () => jmacs_lint([p_src]);
		}
		// subdirectory
		else if(fs.statSync(p_src).isDirectory()) {
			// make subrecipe; put in this recipe
			let h_subrecipe = h_recipe[s_file] = {};

			// recurse
			carry_sub(p_src, h_subrecipe);
		}
	}
};


// convert a src directory to a set of packages
const src_to_main = (pd_src, s_prefix, h_output={}) => {
	// package extension
	let sx_package = '.js.jmacs';

	// bat content root directory
	let a_files = fs.readdirSync(pd_src);

	// each file
	for(let s_file of a_files) {
		// package file
		if(s_file.endsWith(sx_package)) {
			let s_verb = s_file.slice(0, -sx_package.length);

			// package id
			let si_package = `${s_prefix}.${s_verb}`;

			// make recipe
			let h_recipe = h_output[si_package] = {
				...scoped_package(si_package),

				'main.js': () => jmacs_lint([`${pd_src}/${s_verb}.js.jmacs`]),
			};

			// it has a 'carry' dir; add to recipe
			if(a_files.includes(s_verb)) {
				carry_sub(`${pd_src}/${s_verb}`, h_recipe);
			}
		}
	}

	// return output
	return h_output;
};


// bat output config
let h_output_content_bat = src_to_main('src/content/bat', 'content.bat');

// memory store output config
let h_output_store_mem = src_to_main('src/store/memory', 'store.memory');

// emk struct
module.exports = {
	defs: {
		// contet sub enum
		content_sub: a_content_subs,

		testable: [
			'core.data.factory',
			'core.class.writable',
			'content.nq.read',
			'content.nt.read',
			'content.nt.write',
			'content.ttl.read',
			'content.ttl.write',
			'content.trig.read',
			'content.trig.write',
		],

		// package enumeration
		package: Object.keys(h_packages),

		// non-content-sub packages
		package_ncs: Object.keys(h_packages)
			.filter(s => !a_content_subs.includes(s)
				&& !s.startsWith('content.n')
				&& !s.startsWith('content.t')
				&& !s.startsWith('content.bat')
				&& !s.startsWith('schema.')
				&& !s.startsWith('store.memory.query')),

		// // bat schema file
		// bat_schema_file: Object.keys(h_schema_bat).map(s => `schema.bat.${s}`),

		bat_protocol: fs.readdirSync('src/gen/bat-schema/decoders')
			.filter(s => s.endsWith('.js.jmacs')).map(s => s.replace(/\.jmacs$/, '')),

		bat_datatype: fs.readdirSync('src/gen/bat-schema/datatypes')
			.filter(s => s.endsWith('.js.jmacs')).map(s => s.replace(/\.jmacs$/, '')),

		// docs snippet
		snippet: fs.readdirSync('src/docs/snippets')
			.filter(s => s.endsWith('.js.jmacs')).map(s => s.replace(/\.jmacs$/, '')),

		// docs markdown
		markdown: fs.readdirSync('src/docs/')
			.filter(s => s.endsWith('.md.jmacs')).map(s => s.replace(/\.jmacs$/, '')),
	},

	tasks: {
		// all tasks
		all: [
			'prepublish.*',
		],

		// link alias
		link: {
			':package': h => ([
				`.npm-packages/lib/node_modules/@${s_channel}/${h.package}`,
			]),

			[s_channel]: () => ([
				`.npm-packages/lib/node_modules/${s_channel}`,
			]),
		},

		// link-to alias
		link_to: {
			':package': h => ({
				deps: [`node_modules/@${s_channel}/${h.package}`],
			}),

			[s_channel]: () => ({
				deps: [`node_modules/${s_channel}`],
			}),
		},

		// prepublish
		prepublish: {
			':package': h => ({
				deps: [`link_to.${h.package}`],
				run: /* syntax: bash */ `
					cd build/${s_channel}/${h.package}

					# defer README to GitHub
					rm -rf README.md
					cat <(echo "#@${s_channel}/${h.package}") ../../../src/aux/README-defer.md > README.md
				`,
			}),

			[s_channel]: () => ({
				deps: [`link_to.${s_channel}`],
				run: /* syntax: bash */ `
					cd build/${s_channel}/${s_channel}

					# defer README to GitHub
					rm -rf README.md
					cat <(echo "#@${s_channel}/${s_channel}") ../../../src/aux/README-defer.md > README.md
				`,
			}),

			docs: ['docs/**'],
		},

		// publish
		publish: {
			':package': h => ({
				deps: [`prepublish.${h.package}`],
				run: /* syntax: bash */ `
					cd build/${s_channel}/${h.package}

					# publish to npm
					npm publish --access=public
				`,
			}),

			[s_channel]: () => ({
				deps: [`prepublish.${s_channel}`],
				run: /* syntax: bash */ `
					cd build/${s_channel}/${s_channel}

					# publish to npm
					npm publish --access=public
				`,
			}),
		},

		// tests
		test: {
			':testable': ({testable:si_package}) => ({
				deps: [
					`prepublish.${si_package}`,
					'link_to.util.dataset.tree',
					`test/${si_package.replace(/\./g, '/')}.js`,
				],

				run: /* syntax: bash */ `
					mocha --colors $3
				`,
			}),
		},
	},

	outputs: {
		// eslint config
		'.eslintrc.yaml': () => ({copy:'~/dev/.eslintrc.yaml'}),

		// docs
		docs: {
			// snippets
			snippets: {
				':snippet': h => jmacs_lint([
					`src/docs/snippets/${h.snippet}.jmacs`,
				]),
			},

			// markdown
			':markdown': h => ({
				deps: [
					`src/docs/${h.markdown}.jmacs`,
					`src/docs/docs.jmacs`,
					'docs/snippets/**',
				],
				run: /* syntax: bash */ `
					npx jmacs $1 > $@
				`,
			}),
		},

		// package builds
		build: {
			[s_channel]: {
				...('graphy-dev' === process.env.GRAPHY_CHANNEL
					? {
						// content.bat.*
						...h_output_content_bat,

						// store.memory.*
						...h_output_store_mem,

						// bat schema
						'schema.bat.default': {
							...scoped_package('schema.bat.default'),

							'main.js': () => jmacs_lint([
								'src/gen/bat-schema/default.js.jmacs',
								'src/gen/bat-schema/datatypes',  // directory
								'src/gen/bat-schema/decoders',  // directory
							]),

							decoders: {
								':bat_protocol': h => jmacs_lint([
									`src/gen/bat-schema/decoders/${h.bat_protocol}.jmacs`,
									'src/gen/bat-schema/schema.js.jmacs',
								]),
							},

							datatypes: {
								':bat_datatype': h => jmacs_lint([
									`src/gen/bat-schema/datatypes/${h.bat_datatype}.jmacs`,
									'src/gen/bat-schema/schema.js.jmacs',
								]),
							},

							// ':bat_schema_file': h => ({
							// 	deps: [
							// 		'src/gen/schema/output.js.jmacs',
							// 		'link_to.core.data.factory',
							// 		'link_to.content.ttl.write',
							// 	],

							// 	run: /* syntax: bash */ `
							// 		npx jmacs $1 -g '${
							// 			/* eslint-disable indent */
							// 			JSON.stringify({
							// 				iri: h_schema_bat[h.bat_schema_file],
							// 			})
							// 		/* eslint-enable */}' > $@
							// 	`,
							// }),
						},
					}
					: {}),

				// content subs
				':content_sub': [si_package => ({
					[si_package]: (g_package => ({
						...scoped_package(si_package),

						...Object.entries(g_package.files).reduce((h_def, [s_file, a_deps]) => ({
							...h_def,
							[s_file]: () => ({
								deps: [
									`src/content/${g_package.super}/${si_package.split(/\./g)[2]}/${s_file}.jmacs`,
									...a_deps.map(s_dep => path.join(`src/content/${g_package.super}/`, s_dep)),
								],

								run: /* syntax: bash */ `
									npx jmacs -g "{FORMAT:'${si_package.split(/\./g)[1]}'}" $1 > $@ \
									 && ${eslint()}
								`,
							}),
						}), {}),
					}))(h_packages[si_package]),
				})],

				// all non-content-sub packages
				':package_ncs': [si_package => ({
					[si_package]: {
						...scoped_package(si_package),

						'main.js': () => jmacs_lint([`src/${si_package.replace(/\./g, '/')}.js.jmacs`]),
					},
				})],

				// the super module
				[s_channel]: {
					// '.npmrc': npmrc,

					'package.json': () => ({
						deps: [
							P_PACKAGE_JSON_BASE,
							'package.json',
						],

						run: /* syntax: bash */ `
							cat $1 | npx lambduh "g_base_package_json => { \
								${/* eslint-disable indent */
									/* syntax: js */`
									// load package info
									let g_package_json = ${JSON.stringify({
										name: s_channel,
										dependencies: {
											...g_package_json_super.dependencies,
											...Object.keys(h_packages).reduce((h, si_link) => Object.assign(h, {
												[`@${s_channel}/${si_link}`]: s_base_version,
											}), {}),
										},
										description: 'A comprehensive RDF toolkit including triplestores, intuitive writers, and the fastest JavaScript parsers on the Web',
										bin: {
											[s_channel]: 'main.js',
										},
									})};

									// update package.json
									return Object.assign(g_base_package_json, g_package_json);
								`.trim().replace(/(["`])/g, '\\$1')
								/* eslint-enable */} }" > $@

							# sort its package.json
							npx sort-package-json $@
						`,
					}),

					node_modules: {
						[`@${s_channel}`]: {
							':package': ({package:si_package}) => ({
								deps: [
									`link.${si_package}`,
								],

								run: /* syntax: bash */ `
									cd build/${s_channel}/${s_channel}
									npm link @${s_channel}/${si_package}
								`,
							}),
						},
					},

					'main.js': () => jmacs_lint([`src/main/graphy.js.jmacs`]),
				},

			},
		},

		// package linking
		'.npm-packages': {
			lib: {
				node_modules: {
					[`@${s_channel}`]: {
						':package': ({package:si_package}) => ({
							deps: [
								`build/${s_channel}/${si_package}/**`,
							],

							run: /* syntax: bash */ `
								# enter package directory
								cd build/${s_channel}/${si_package}

								# remove package lock
								rm -f package-lock.json

								# then link self
								npm link
							`,
						}),
					},

					[s_channel]: () => ({
						deps: [
							`build/${s_channel}/${s_channel}/**`,

							...Object.keys(h_packages).map(s_dep => `link.${s_dep}`),
						],

						run: /* syntax: bash */ `
							# enter package directory
							cd build/${s_channel}/${s_channel}

							# remove package lock
							rm -f package-lock.json

							# then link self
							npm link
						`,
					}),
				},
			},
		},

		// mono-repo testing
		node_modules: {
			[`@${s_channel}`]: {
				':package': ({package:si_package}) => ({
					deps: [
						`link.${si_package}`,
					],

					run: /* syntax: bash */ `
						npm link @${s_channel}/${si_package}
					`,
				}),
			},

			[s_channel]: () => ({
				deps: [
					`link.${s_channel}`,
				],

				run: /* syntax: bash */ `
					npm link ${s_channel}
				`,
			}),
		},
	},
};
