const fs = require('fs');
const path = require('path');

const h_package_tree = require('./src/aux/package-tree.js');
const {
	packages: h_content_packages,
	modes: h_content_modes,
} = require('./src/aux/content.js');

const g_package_json_base = require('./src/aux/base-package.json');

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
	let h_dependencies = g_json.dependencies = g_json.dependencies || g_package.dependencies || {};

	// convert links to dependencies
	for(let si_link of g_package.links) {
		h_dependencies[`@graphy/${si_link}`] = s_semver;
	}

	// add package dependency to root library
	h_lib_root_package_json.dependencies[`@graphy/${si_package}`] = s_semver;
}


// recipe to make package.json file
const package_json = h => ({
	deps: [
		'src/aux/base-package.json',
	],

	run: /* syntax: bash */ `
		# load base package.json and enter
		cat $1| npx lambduh "g_base_package_json => {\
			${/* syntax: js */`
				// load package info
				let g_package_json = ${JSON.stringify(h_packages[h.package].json)};

				// update package.json
				return Object.assign(g_base_package_json, g_package_json);
			`.trim().replace(/(["`])/g, '\\$1')} }" > $@

		# sort its package.json
		npx sort-package-json $@
	`,
});

// create intra-library links for development & testing
const package_node_modules = f_normalize => ({
	'@graphy': {
		':link': h_in => (h => ({
			deps: [
				...h_packages[h.link].links.map(s => `build/${s}/**`),
			],

			run: /* syntax: bash */ `
				cd build/packages/${h.package}

				# link to dep
				npm link @graphy/${h.link}
			`,
		}))({...h_in, ...f_normalize(h_in)}),
	},
});

// emk struct
module.exports = {
	defs: {
		bat_js: files({
			under: 'src/bat',
			filter: s_path => s_path.endsWith('.js'),
		}),

		bat_jmacs: files({
			under: 'src/bat',
			filter: s_path => s_path.endsWith('.jmacs'),
		}),

		// contet sub enum
		content_sub: a_content_subs,

		// package enumeration
		package: Object.keys(h_packages),

		// non-content-sub packages
		package_ncs: Object.keys(h_packages).filter(s => !a_content_subs.includes(s)),
	},

	tasks: {
		// all tasks
		all: [
			// 'build/**',
			// 'link.*',
			'link_to.*',
		],

		link: {
			':package': h => ({
				deps: h_packages[h.package].links
					.map(s_dep => `build/packages/${h.package}/node_modules/@graphy/${s_dep}`),

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

		link_to: {
			':package': h => ({
				deps: [`node_modules/@graphy/${h.package}`],
			}),
		},

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
		'.eslintrc.yaml': () => ({copy:'~/dev/.eslintrc.yaml'}),

		build: {
			packages: {
				':content_sub': {
					'package.json': h => package_json({package:h.content_sub}),

					node_modules: package_node_modules(h => ({package:h.content_sub})),

					'main.js': h_in => (h => ({
						deps: [
							`src/content/${h.package.super}/${h.split[2]}/main.js.jmacs`,
							...[
								'textual-parser-macros',
								'general-parser-macros',
							].map(s => `src/content/${s}.jmacs`),
						],

						run: /* syntax: bash */ `
							npx jmacs -g "{FORMAT:'${h.split[1]}'}" $1 > $@
							${eslint()}
						`,
					}))({
						package: h_packages[h_in.content_sub],
						split: h_in.content_sub.split('.'),
					}),
				},

				':package_ncs': {
					'package.json': h => package_json({package:h.package_ncs}),

					'main.js': h => ({
						deps: [`src/${h.package_ncs.replace(/\./g, '/')}.js.jmacs`],

						run: /* syntax: bash */ `
							npx jmacs $1 > $@
							${eslint()}
						`,
					}),

					node_modules: package_node_modules(h => ({package:h.package_ncs})),
				},
			},
		},

		node_modules: {
			'@graphy': {
				':package': h => ({
					deps: [
						`build/packages/${h.package}/**`,
						`link.${h.package}`,
					],

					run: /* syntax: bash */ `
						npm link @graphy/${h.package}
					`,
				}),
			},
		},
	},
};
