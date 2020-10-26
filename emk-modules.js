const fs = require('fs');
const path = require('path');
const url = require('url').URL;

const jmacs = require('jmacs');
const detective = require('detective');
const ts = require('typescript');

// the 'base' package.json to use as boilerplate for all packages
const P_PACKAGE_JSON_BASE = `./emk/base-package-json.js`;

// module descriptors
const H_MODULES = require('./emk/modules.js');

// run some javscript from the command line
const run_lambduh = sj => /* syntax: bash */ `npx lambduh "${sj.trim().replace(/(["`])/g)}"`;

// static leaf to make .npmrc file
const F_LEAF_NPMRC = () => ({
	deps: [],

	run: /* syntax: bash */ `
		# write .npmrc file
		echo "prefix=$PWD/.npm-packages" > $@
	`,
});

// for run commands to lint js files
const run_eslint = (sx_more='') => /* syntax: bash */ `
	npx eslint --fix --color --rule 'no-debugger: off' $@
	eslint_exit=$?
	# do not fail on warnings
	if [ $eslint_exit -eq 2 ]; then
		${sx_more}
		exit 0
	fi
	${sx_more}
	exit $eslint_exit
`;

// recipe to make package.json file
const gen_leaf_package_json = si_package => () => ({
	deps: [
		P_PACKAGE_JSON_BASE,
		'package.json',
	],

	run: /* syntax: bash */ `
		# load base package.json and enter
		cat $1 | ${run_lambduh(/* syntax: js */ `
				G_PACKAGE_JSON_BASE => {
					// load package info
					const g_package_json = ${JSON.stringify(H_MODULES[si_package].json)};

					// update package.json
					return {...G_PACKAGE_JSON_BASE, ...g_package_json};
				}
			`)} > $@

		# sort its package.json
		npx sort-package-json $@
	`,
});

// recipe to build jmacs file
const gen_leaf_jmacs_lint = (a_deps=[], a_deps_strict=[]) => ({
	deps: [
		...a_deps,
		...a_deps_strict,
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
			&& ${run_eslint(/* syntax: bash */ `
				node emk/pretty-print.js $@
			`)}
	`,
});

// recipe to build ts file
const gen_leaf_ts_lint = (a_deps=[], a_deps_strict=[]) => ({
	deps: [
		...a_deps,
		...a_deps_strict,
		...(a_deps.reduce((a_requires, p_dep) => {
			// skip directories
			if(fs.statSync(p_dep).isDirectory()) return a_requires;

			// preprocess using ts
			const g_preprocess = ts.preProcessFile(fs.readFileSync(p_dep, 'utf8')+'');

			return [
				...g_preprocess.importedFiles.map(g => g.fileName)
					.filter(s => s.startsWith('.')),
			];
			// .filter(s => s.startsWith('/'))
			// 	.map(p => path.relative(process.cwd(), p));
		}, [])),
	],
	run: /* syntax: bash */ `
		npx tsc -t es2019 --lib es2019,es2020.promise,es2020.bigint,es2020.string \
			--strict --esModuleInterop --skipLibCheck --forceConsistentCasingInFileNames \
			--outDir $(dirname $@) -d \
			&& ${run_eslint(/* syntax: bash */ `
				node emk/pretty-print.js $@/$(basename $1)
			`)}
	`,
});

// create intra-package links for development & testing
const package_node_modules = si_package => ({
	[`@$graphy`]: {
		...H_MODULES[si_package].links.reduce((h, si_link) => Object.assign(h, {
			[si_link]: () => ({
				deps: [
					// `link_ready.${si_link}`,
					// `link.selected.${si_link}`,
					// 'link.packages',
					// ...h_packages[si_link].links.map(s => `build/${s}/**`),
				],

				run: /* syntax: bash */ `
					pushd build/package/${si_package}

					# link to dep
					npm link @graphy/${si_link}
					# echo "link @graphy/${si_link}"
					# touch $@
				`,
			}),
		}), {}),

		// run: /* syntax: bash */ `
		// 	mkdir -p $@
		// 	pushd $@
		// 	${h_packages[si_package].links.map(si_link => /* syntax: bash */ `
		// 		# link to dep
		// 		npm link @graphy/${si_link}
		// 	`).join('\n')}
		// 	popd
		// 	`,
	},

	// external dependencies
	...(H_MODULES[si_package].dependencies || [])
		.reduce((h_deps, si_dep) => Object.assign(h_deps, {
			[si_dep]: () => ({
				deps: [
					`node_modules/${si_dep}`,
					'package.json',
				],
				run: /* syntax: bash */ `
					cd "build/module/${si_package}/node_modules"
					ln -sf "../../../../$1" ${si_dep}
				`,
			}),
		}), {}),
});


const scoped_package = si_package => ({
	...(process.env.GRAPHY_USE_NVM
		? {}
		: {
			'.npmrc': F_LEAF_NPMRC,
		}),

	'package.json': gen_leaf_package_json(si_package),

	node_modules: package_node_modules(si_package),
});


// carry files from a main source file's subdirectory
const expand_macros = (pd_src, h_recipe={}, pdr_package=null) => {
	// scan directory
	const a_files = fs.readdirSync(pd_src);

	// deps
	const a_deps = [];
	const a_direct = [];

	// each file
	for(const s_file of a_files) {
		const p_src = `${pd_src}/${s_file}`;
		const pd_dst = `build/module/${pdr_package}`;

		// *.[tj]s files
		if(s_file.endsWith('.js') || s_file.endsWith('.ts')) {
			h_recipe[s_file] = () => ({copy:p_src});
			a_deps.push(`${pd_dst}/${s_file}`);
		}
		// *.jmacs files
		else if(s_file.endsWith('.ts.jmacs')) {
			const s_dst = s_file.replace(/\.jmacs$/, '');
			h_recipe[s_dst] = () => gen_leaf_jmacs_lint([p_src]);
			a_deps.push(`${pd_dst}/${s_dst}`);
		}
		// subdirectory
		else if(fs.statSync(p_src).isDirectory()) {
			// make subrecipe; put in this recipe
			const h_subrecipe = h_recipe[s_file] = {};

			// recurse
			a_deps.push(...expand_macros(p_src, h_subrecipe, `${pdr_package}/${s_file}`));

			// simple deps
			a_direct.push(`${pd_dst}/${s_file}/**`);
		}
		// otherwise, notice
		else {
			console.warn(`ignoring '${pd_src}/${s_file}'`);
		}
	}

	return a_direct.length? a_direct: a_deps;
	// return a_deps;
};


const A_MODULES = Object.keys(H_MODULES);

const H_EXPANDED_MODULE_MACROS = A_MODULES.reduce((h_out, si_module) => ({
	...h_out,
	[si_module]: (() => {
		const h_recipe = {};
		const a_deps = expand_macros(`src/${si_module}`, h_recipe);
		return {
			deps: a_deps,
			recipe: h_recipe,
		};
	})(),
}), {});

debugger;

module.exports = {
	defs: {
		module: A_MODULES,
	},

	tasks: {
		all: [
			'build/module/**',
		],
	},

	outputs: {
		build: {
			lib: {
				memory: {
					'memory.ts': () => gen_leaf_jmacs_lint([
						`src/memory/memory.ts.jmacs`,
					]),
					'indexed-tree.ts': () => gen_leaf_jmacs_lint([
						`src/memory/indexed-tree.ts.jmacs`,
					]),
				},

				// ':module': [si_module => ({
				// 	[si_module]: H_EXPANDED_MODULE_MACROS[si_module],
				// })],
			},

			module: {
				':module': [si_module => ({
					[si_module]: {
						...scoped_package(si_module),

						'main.mjs': () => gen_leaf_ts_lint([
							`lib/${si_module}/${si_module}.ts`,
						], [
							`build/module/${si_module}/package.json`,
						]),
					},
				})],
			},
		},
	},
};
