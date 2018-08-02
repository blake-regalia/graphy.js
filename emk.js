const fs = require('fs');
const path = require('path');

const h_package_tree = require('./src/aux/package-tree.js');
const {
	packages: h_content_packages,
	modes: h_content_modes,
} = require('./src/aux/content.js');

const g_package_json_base = require('./src/aux/base-package.json');
const g_package_json_super = require('./package.json');

// const h_schema_bat = require('./src/gen/bat-schema/default.js');

const s_semver = `^${g_package_json_base.version}`;

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
	eslint --fix --color --rule 'no-debugger: off' $@
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
		g_json.name = `@graphy/${si_package}`;
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
		h_dependencies[`@graphy/${si_link}`] = s_semver;
	}

	// add package dependency to root library
	h_lib_root_package_json.dependencies[`@graphy/${si_package}`] = s_semver;
}


// recipe to make package.json file
const package_json = si_package => () => ({
	deps: [
		'src/aux/base-package.json',
	],

	run: /* syntax: bash */ `
		# load base package.json and enter
		cat $1| npx lambduh "g_base_package_json => {\
			${/* syntax: js */`
				// load package info
				let g_package_json = ${JSON.stringify(h_packages[si_package].json)};

				// update package.json
				return Object.assign(g_base_package_json, g_package_json);
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
const jmacs = a_deps => ({
	deps: a_deps,
	run: /* syntax: bash */ `
		npx jmacs $1 > $@
		${eslint()}
	`,
});

// create intra-library links for development & testing
const package_node_modules = si_package => ({
	'@graphy': {
		...h_packages[si_package].links.reduce((h, si_link) => Object.assign(h, {
			[si_link]: () => ({
				deps: [
					`link.${si_link}`,
					// ...h_packages[si_link].links.map(s => `build/${s}/**`),
				],

				run: /* syntax: bash */ `
					cd build/packages/${si_package}

					# link to dep
					npm link @graphy/${si_link}
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
					cd build/packages/${si_package}/node_modules
					ln -sf "../../../../$1" ${si_dep}
				`,
			}),
		}), {}),
});



// build bat output config
let h_output_content_bat = {};
{
	const carry = (pd_src, h_recipe={}) => {
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
			else if(s_file.endsWith('.jmacs')) {
				h_recipe[s_file.slice(0, -'.jmacs'.length)] = () => jmacs([p_src]);
			}
			// subdirectory
			else if(fs.statSync(p_src).isDirectory()) {
				// make subrecipe; put in this recipe
				let h_subrecipe = h_recipe[s_file] = {};

				// recurse
				carry(p_src, h_subrecipe);
			}
		}
	};


	// package extension
	let sx_package = '.js.jmacs';

	// bat content root directory
	let a_files = fs.readdirSync('src/content/bat');

	// each file
	for(let s_file of a_files) {
		// package file
		if(s_file.endsWith(sx_package)) {
			let s_verb = s_file.slice(0, -sx_package.length);

			// package id
			let si_package = `content.bat.${s_verb}`;

			// make recipe
			let h_recipe = h_output_content_bat[si_package] = {
				'.npmrc': npmrc,

				'package.json': package_json(si_package),

				node_modules: package_node_modules(si_package),

				'main.js': () => jmacs([`src/content/bat/${s_verb}.js.jmacs`]),
			};

			// it has a 'carry' dir; add to recipe
			if(a_files.includes(s_verb)) {
				carry(`src/content/bat/${s_verb}`, h_recipe);
			}
		}
	}
}

const scoped_package = si_package => ({
	'.npmrc': npmrc,

	'package.json': package_json(si_package),

	node_modules: package_node_modules(si_package),
});

// emk struct
module.exports = {
	defs: {
		// contet sub enum
		content_sub: a_content_subs,

		// package enumeration
		package: Object.keys(h_packages),

		// non-content-sub packages
		package_ncs: Object.keys(h_packages)
			.filter(s => !a_content_subs.includes(s)
				&& !s.startsWith('content.')
				&& !s.startsWith('schema.')),

		// // bat schema file
		// bat_schema_file: Object.keys(h_schema_bat).map(s => `schema.bat.${s}`),

		bat_frame: [
			'dictionary.concise-term.pp12oc.js',
		],
	},

	tasks: {
		// all tasks
		all: [
			'link_to.*',
		],

		// link alias
		link: {
			':package': h => ([
				`.npm-packages/lib/node_modules/@graphy/${h.package}`,
			]),

			graphy: () => ([
				`.npm-packages/lib/node_modules/graphy`,
			]),
		},

		// link-to alias
		link_to: {
			':package': h => ({
				deps: [`node_modules/@graphy/${h.package}`],
			}),

			graphy: () => ({
				deps: [`node_modules/graphy`],
			}),
		},

		// tests
		test: {
			':package': h => ({
				deps: [
					`test/${h.package.replace(/\./g, '/')}.js`,
					`build/packages/${h.package}/**`,
					`link.${h.package}`,
				],

				run: /* syntax: bash */ `
					mocha --colors $1
				`,
			}),
		},
	},

	outputs: {
		// eslint config
		'.eslintrc.yaml': () => ({copy:'~/dev/.eslintrc.yaml'}),

		// package builds
		build: {
			packages: {
				// bat
				...h_output_content_bat,

				// bat schema
				'schema.bat.default': {
					...scoped_package('schema.bat.default'),

					decoders: {
						':bat_frame': h => jmacs([
							`src/gen/bat-schema/decoders/${h.bat_frame}.jmacs`,
							'src/gen/bat-schema/schema.js.jmacs',
						]),
					},

					// ':bat_schema_file': h => ({
					// 	deps: [
					// 		'src/gen/schema/output.js.jmacs',
					// 		'link_to.api.data.factory',
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

				// content subs
				':content_sub': [si_package => ({
					[si_package]: {
						...scoped_package(si_package),

						'main.js': (({split:a_split}) => () => ({
							deps: [
								`src/content/${h_packages[si_package].super}/${a_split[2]}/main.js.jmacs`,
								...[
									'textual-parser-macros',
									'general-parser-macros',
								].map(s => `src/content/${s}.jmacs`),
							],

							run: /* syntax: bash */ `
								npx jmacs -g "{FORMAT:'${a_split[1]}'}" $1 > $@
								${eslint()}
							`,
						}))({
							split: si_package.split(/\./g),
						}),
					},
				})],

				// all non-content-sub packages
				':package_ncs': [si_package => ({
					[si_package]: ({
						...scoped_package(si_package),

						'main.js': () => jmacs([`src/${si_package.replace(/\./g, '/')}.js.jmacs`]),
					}),
				})],

				// the super module
				graphy: {
					'.npmrc': npmrc,

					'package.json': () => ({
						deps: [
							'src/aux/base-package.json',
						],

						run: /* syntax: bash */ `
							cat $1 | npx lambduh "g_base_package_json => { \
								${/* eslint-disable indent */
									/* syntax: js */`
									// load package info
									let g_package_json = ${JSON.stringify({
										name: 'graphy',
										dependencies: {
											...g_package_json_super.dependencies,
											...Object.keys(h_packages).reduce((h, si_link) => Object.assign(h, {
												[`@graphy/${si_link}`]: g_package_json_base.version,
											}), {}),
										},
										description: 'A comprehensive RDF toolkit including triplestores, intuitive writers, and the fastest JavaScript parsers on the Web',
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
						'@graphy': {
							':package': h => ({
								deps: [
									`link.${h.package}`,
								],

								run: /* syntax: bash */ `
									cd build/packages/graphy
									npm link @graphy/${h.package}
								`,
							}),
						},
					},

					'main.js': () => jmacs([`src/main/graphy.js.jmacs`]),
				},

			},
		},

		// package linking
		'.npm-packages': {
			lib: {
				node_modules: {
					'@graphy': {
						':package': h => ({
							deps: [
								`build/packages/${h.package}/**`,
							],

							run: /* syntax: bash */ `
								# enter package directory
								cd build/packages/${h.package}

								# remove package lock
								rm -f package-lock.json

								# then link self
								npm link
							`,
						}),
					},

					graphy: () => ({
						deps: [
							`build/packages/graphy/**`,

							...Object.keys(h_packages).map(s_dep => `link.${s_dep}`),
						],

						run: /* syntax: bash */ `
							# enter package directory
							cd build/packages/graphy

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
			'@graphy': {
				':package': h => ({
					deps: [
						`link.${h.package}`,
					],

					run: /* syntax: bash */ `
						npm link @graphy/${h.package}
					`,
				}),
			},

			graphy: () => ({
				deps: [
					'link.graphy',
				],

				run: /* syntax: bash */ `
					npm link graphy
				`,
			}),
		},
	},
};
