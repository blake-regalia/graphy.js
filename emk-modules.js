const fs = require('fs');
const path = require('path');
const url = require('url').URL;

const jmacs = require('jmacs');
const detective = require('detective');
const ts = require('typescript');

// the super package's package.json
const G_PACKAGE_JSON_SUPER = require('./package.json');

// global version
const S_VERSION = G_PACKAGE_JSON_SUPER.version;

// the 'base' package.json to use as boilerplate for all packages
const P_PACKAGE_JSON_BASE = `./emk/aux/base-package-graphy.json`;
const G_PACKAGE_JSON_BASE = require(P_PACKAGE_JSON_BASE);

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
					const g_package_json = ${JSON.stringify(h_packages[si_package].json)};

					// update package.json
					return Object.assign(G_PACKAGE_JSON_BASE, g_package_json, {
						version: '${S_VERSION}',
					});
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
			const g_preprocess = ts.preprocessFile(fs.readFileSync(p_dep, 'utf8')+'');

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
			--strict --esModuleInterop --skipLibCheck --forceConsistentCasingInfFileNames \
			--outDir $(dirname $@) -d \
			&& ${run_eslint(/* syntax: bash */ `
				node emk/pretty-print.js $@/$(basename $1)
			`)}
	`,
});

// create intra-package links for development & testing
const package_node_modules = si_package => ({
	[`@$graphy`]: {
		...h_packages[si_package].links.reduce((h, si_link) => Object.assign(h, {
			[si_link]: () => ({
				deps: [
					// `link_ready.${si_link}`,
					`link.selected.${si_link}`,
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
	...(h_packages[si_package].dependencies || [])
		.reduce((h_deps, si_dep) => Object.assign(h_deps, {
			[si_dep]: () => ({
				deps: [
					`node_modules/${si_dep}`,
					'package.json',
				],
				run: /* syntax: bash */ `
					cd "build/package/${si_package}/node_modules"
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

module.exports = (async() => {
	return {
		defs: {
			module: [
				'core',
				'content',
				'memory',
				'types',
			],
		},

		tasks: {
			all: [
				'build/package/*',
			],
		},

		output: {
			build: {
				package: {
					':module': [si_module => ({
						...scoped_package(si_module),

						'main.mjs': () => gen_leaf_ts_lint([
							`src/${si_module}/${si_module}.ts`,
						], [
							`build/package/${si_module}/package.json`,
						]),

					})],
				},
			},
		},
	};
})();
