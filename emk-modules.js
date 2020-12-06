const fs = require('fs');
const path = require('path');
const url = require('url').URL;

const jmacs = require('jmacs');
const detective = require('detective');
const ts = require('typescript');

// the 'base' package.json to use as boilerplate for all packages
const P_PACKAGE_JSON_BASE = `./emk/base-package-json.js`;

// package prefix
const P_PACKAGE_PREFIX = process.env.GRAPHY_PACKAGE_PREFIX || '.npm-packages';

// module descriptors
const H_MODULES = require('./emk/modules.js');

// run some javscript from the command line
const run_lambduh = sj => /* syntax: bash */ `npx lambduh '${sj.trim().replace(/'/g, `\\'`)}'`;

// for run commands to lint js files
const run_eslint = (sx_more='', b_ignore_errors=false) => /* syntax: bash */ `
	npx eslint --fix --color --rule 'no-debugger: off' $@
	eslint_exit=$?
	# do not fail on warnings
	if [ $eslint_exit -eq 2 ]${b_ignore_errors? /* syntax: bash */ ` | [ $eslint_exit -eq 1 ]`: ''}; then
		${sx_more}
		exit 0
	fi
	${sx_more}
	exit $eslint_exit
`;

const H_GEN_LEAF = {
	// make .npmrc file
	npmrc: () => () => ({
		deps: [],

		run: /* syntax: bash */ `
			# write .npmrc file
			echo "prefix=$PWD/.npm-packages" > $@
		`,
	}),

	// recipe to make package.json file
	package_json: si_package => () => ({
		deps: [
			P_PACKAGE_JSON_BASE,
			'package.json',
		],

		run: /* syntax: bash */ `
			# load base package.json and enter
			node emk/json-stringify.js $1 | ${run_lambduh(/* syntax: js */ `
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
	}),

	// ensure node_modules closure for development & testing
	node_modules: si_module => ({
		// inter-module links
		[`@graphy`]: {
			...H_MODULES[si_module].links.reduce((h, si_link) => Object.assign(h, {
				[si_link]: () => ({
					deps: [
						`link.module.${si_link}`,

						// `link_ready.${si_link}`,
						// 'link.packages',
						// ...h_packages[si_link].links.map(s => `build/${s}/**`),
					],

					run: /* syntax: bash */ `
						pushd build/module/${si_module}

						# link to dep
						npm link @graphy/${si_link}
					`,
				}),
			}), {}),
		},

		// external dependencies
		...(H_MODULES[si_module].dependencies || [])
			.reduce((h_deps, si_dep) => Object.assign(h_deps, {
				[si_dep]: () => ({
					deps: [
						`node_modules/${si_dep}`,
						'package.json',
					],
					run: /* syntax: bash */ `
						cd "build/module/${si_module}/node_modules"
						ln -sf "../../../../$1" ${si_dep}
					`,
				}),
			}), {}),
	}),

	// recipe to build jmacs file
	jmacs_lint: (a_deps=[], a_deps_strict=[]) => () => ({
		deps: [
			...a_deps,
			...a_deps_strict,
			...(a_deps.reduce((a_requires, p_dep) => {

				// skip directories
				if(fs.statSync(p_dep).isDirectory()) return a_requires;

				// load script into jmacs
				const g_compiled = jmacs.load(p_dep);

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
	}),

	// recipe to build ts file
	ts_lint: (a_deps=[], a_deps_strict=[]) => () => ({
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
	}),

	// transpile module to commonjs
	module_commonjs_lint: (a_deps=[]) => () => ({
		deps: [
			...a_deps,
		],
		run: /* syntax: bash */ `
			npx babel --plugins @babel/plugin-transform-modules-commonjs $1 > $@ \
				&& ${run_eslint(/* syntax: bash */ `
					node emk/pretty-print.js $@
				`, true)}
		`,
	}),
};



const scoped_package = si_package => ({
	...(process.env.GRAPHY_USE_NVM? {}: {  // eslint-disable-line multiline-ternary
		'.npmrc': H_GEN_LEAF.npmrc(),
	}),

	'package.json': H_GEN_LEAF.package_json(si_package),

	node_modules: H_GEN_LEAF.node_modules(si_package),
});


const mainify = (s_file, si_module) => s_file.replace(new RegExp('^'+si_module.replace(/([.$+])/g, '\\$1'), 'g'), 'main');

// carry files from a main source file's subdirectory
const expand_macros = (pd_src, si_module=null, h_recipe={}) => {
	// deps
	const a_deps = [];
	const a_direct = [];

	// scan directory
	const a_files = fs.readdirSync(pd_src);

	// each file
	for(const s_file_src of a_files) {
		const p_src = `${pd_src}/${s_file_src}`;
		const pd_dst = `build/module/${si_module}`;

		// subdirectory
		if(fs.statSync(p_src).isDirectory()) {
			// recurse
			const {
				deps: a_subdeps,
				recipe: h_subrecipe,
			} = expand_macros(p_src, `${si_module}/${s_file_src}`);

			// make subrecipe; put in this recipe
			h_recipe[s_file_src] = h_subrecipe;

			// push deps
			a_deps.push(...a_subdeps);

			// simple deps
			a_direct.push(`${pd_dst}/${s_file_src}/**`);
		}
		// file
		else {
			// expanded intermediate file
			let s_file_exp = mainify(s_file_src, si_module);
			let p_exp = path.join(pd_src, s_file_exp);

			// expand jmacs files
			if(/\.(\w+)\.jmacs$/.test(s_file_src)) {
				s_file_exp = s_file_exp.replace(/\.jmacs$/, '');
				p_exp = path.join(pd_dst, s_file_exp);
				h_recipe[s_file_exp] = H_GEN_LEAF.jmacs_lint([p_src]);
			}
			// copy js, mjs, and ts files
			else if(s_file_src.endsWith('.js') || s_file_src.endsWith('.mjs') || s_file_src.endsWith('.ts')) {
				h_recipe[s_file_exp] = () => ({copy:p_src});
			}

			// leave .d.ts files as is
			if(s_file_exp.endsWith('.d.ts')) {
				a_deps.push(p_exp);
			}
			// compile typescript files
			else if(s_file_exp.endsWith('.ts')) {
				const s_file_js = s_file_exp.replace(/\.ts$/, '.js');
				h_recipe[s_file_js] = H_GEN_LEAF.ts_lint([p_exp]);

				// target the final build file
				a_deps.push(`${pd_dst}/${s_file_js}`);
			}
			// transpile mjs to js
			else if(s_file_exp.endsWith('.mjs')) {
				const s_file_js = s_file_exp.replace(/\.mjs$/, '.js');
				h_recipe[s_file_js] = H_GEN_LEAF.module_commonjs_lint([p_exp]);

				// target the final build file
				a_deps.push(`${pd_dst}/${s_file_js}`);
			}
			// target js file
			else if(s_file_exp.endsWith('.js')) {
				a_deps.push(p_exp);
			}
			// otherwise, notice
			else {
				console.warn(`ignoring '${p_exp}'`);
			}
		}
	}

	return {
		deps: a_direct.length? a_direct: a_deps,
		recipe: h_recipe,
	};
};


const A_MODULES = Object.keys(H_MODULES);

const H_EXPANDED_MODULE_MACROS = A_MODULES.reduce((h_out, si_module) => ({
	...h_out,
	[si_module]: expand_macros(`src/${si_module}`, si_module, {
		...scoped_package(si_module),
	}),
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

		link: {
			// link the module from the super context
			super: {
				':module': ({module:si_module}) => ([
					`node_modules/@graphy/${si_module}`,
				]),
			},

			// ensures the module is ready to be linked from the super context
			ready: {
				':module': ({module:si_module}) => ([
					`${P_PACKAGE_PREFIX}/lib/node_modules/@graphy/${si_module}.ready`,
				]),
			},

			// ensures the built module itself is linked
			module: {
				':module': ({module:si_module}) => ({
					deps: [
						...H_MODULES[si_module].links.reduce((a_out, si_link) => [
							...a_out,
							`link.module.${si_link}`,
						], []),

						// `link.ready.${si_package}`,
					],
					run: /* syntax: bash */ `
						# package directory relative to project root
						PACKAGE_DIR='build/module/${si_module}'
						
						# enter package directory
						pushd "$PACKAGE_DIR"

						# link self
						npm link

						# pop dir from stack
						popd
					`,
				}),
			},
		},
	},

	outputs: {
		build: {
			module: {
				':module': [si_module => ({
					[si_module]: H_EXPANDED_MODULE_MACROS[si_module].recipe,
				})],
			},
		},


		// package linking
		[P_PACKAGE_PREFIX]: {
			lib: {
				node_modules: {
					'@graphy': {
						':module.ready': ({module:si_module}) => ({
							deps: [
								`build/module/${si_module}/**`,
							],

							run: /* syntax: bash */ `
								# module directory relative to project root
								PACKAGE_DIR='build/module/${si_module}'
								
								# enter package directory
								pushd "$PACKAGE_DIR"

								# remove package lock
								rm -f package-lock.json

								# pop dir off stack
								popd

								# touch file ready
								mkdir -p $(dirname $@)
								touch $@

								# # then link self
								# npm link
							`,
						}),
					},

					// [s_super]: () => ({
					// 	deps: [
					// 		`build/package/${s_super}/**`,

					// 		...Object.keys(h_packages).map(s_dep => `link_ready.${s_dep}`),
					// 		'link.packages',
					// 	],

					// 	run: /* syntax: bash */ `
					// 		# enter package directory
					// 		cd build/package/${s_super}

					// 		# remove package lock
					// 		rm -f package-lock.json

					// 		# then link self
					// 		npm link
					// 	`,
					// }),
				},
			},
		},

		// mono-repo testing
		node_modules: {
			'@graphy': {
				':module': ({module:si_module}) => {
					// a_link_selected.push(si_module);

					return {
						deps: [
							`link.module.${si_module}`,
							`link.ready.${si_module}`,
						],

						run: /* syntax: bash */ `
							npm link @graphy/${si_module}
						`,
					};
				},
			},

			// [s_super]: () => ({
			// 	deps: [
			// 		`link.${s_super}`,
			// 	],

			// 	run: /* syntax: bash */ `
			// 		npm link ${s_super}
			// 	`,
			// }),
		},
	},
};
