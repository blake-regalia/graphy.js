const fs = require('fs');
const path = require('path');
const url = require('url').URL;

const jmacs = require('jmacs');
const detective = require('detective');

const h_package_tree = require('./emk/aux/package-tree.js');
const {
	packages: h_content_packages,
	modes: h_content_modes,
} = require('./emk/aux/content.js');

const s_super = process.env.GRAPHY_CHANNEL || 'graphy';

const g_package_json_super = require('./package.json');

const P_PACKAGE_JSON_BASE = `./emk/aux/base-package-${s_super}.json`;
const g_package_json_base = require(P_PACKAGE_JSON_BASE);
const s_base_version = g_package_json_base.version;

// const s_base_version = g_package_json_super.version;
const s_semver = `^${s_base_version}`;

const P_PACKAGE_PREFIX = process.env.GRAPHY_PACKAGE_PREFIX || '.npm-packages';

let a_link_selected = [];

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
const eslint = (sx_more='') => /* syntax: bash */ `
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

// root library
const h_lib_root_package_json = {
	dependencies: {},
};

// package map
const h_packages_top = {
	core: {
		description: 'Contains DataFactory',
		links: ['core.data.factory'],
	},

	memory: {
		description: 'Contains FastDataset',
		links: ['memory.dataset.fast'],
	},

	content: {
		description: 'Contains NTriplesReader, NTriplesScanner, NTriplesWriterScriber, NTriplesWriter, NQuadsReader, NQuadsScanner, NQuadsScriber, NQuadsWriter, TurtleReader, TurtleScriber, TurtleWriter, TriGReader, TriGScriber, TriGWriter, RdfXmlScriber',
		links: [
			'content.nt.read',
			'content.nt.scan',
			'content.nt.scribe',
			'content.nt.write',
			'content.nq.read',
			'content.nq.scan',
			'content.nq.scribe',
			'content.nq.write',
			'content.ttl.read',
			'content.ttl.scribe',
			'content.ttl.write',
			'content.trig.read',
			'content.trig.scribe',
			'content.trig.write',
			'content.xml.scribe',
		],
	},
};

const h_packages = {
	// ...h_packages_top,
};

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
	for(let [s_mode, g_mode_extend] of Object.entries(g_content.modes)) {
		let g_mode = {
			...h_content_modes[s_mode],
			...g_mode_extend,
		};

		// mode description
		let s_description_mode = g_mode.description(s_description_base);

		// build package name
		let si_name = `content.${s_content}.${s_mode}`;

		// add definition to package hash
		h_packages[si_name] = {
			...g_content,
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
debugger;

// normalize packages
let h_super_deps = Object.assign(g_package_json_super.dependencies);
for(let [si_package, g_package] of Object.entries(h_packages)) {
	// auto-default ref package.json struct
	let g_json = g_package.json = g_package.json || {};

	// no name, use default
	if(!g_json.name) {
		g_json.name = `@${s_super}/${si_package}`;
	}

	// copy-by-value fields
	Object.assign(g_json, {
		description: g_package.description,
	});

	// auto-default ref dependencies
	let h_dependencies = g_json.dependencies = (g_package.dependencies || [])
		.reduce((h_deps, si_dep) => {
			if(!(si_dep in h_super_deps)) throw new Error(`super repository missing sub-package (${si_package}) dependency: ${si_dep}`);
			return {
				[si_dep]: h_super_deps[si_dep],
			};
		}, {});

	// convert links to dependencies
	for(let si_link of g_package.links) {
		h_dependencies[`@${s_super}/${si_link}`] = s_semver;
	}

	// add package dependency to root library
	h_lib_root_package_json.dependencies[`@${s_super}/${si_package}`] = s_semver;
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
	deps: [],

	run: /* syntax: bash */ `
		# write .npmrc file
		echo "prefix=$PWD/.npm-packages" > $@
	`,
});

// recipe to build jmacs file
const jmacs_lint = (a_deps=[], a_deps_strict=[]) => ({
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
			&& ${eslint(/* syntax: bash */ `
				node emk/pretty-print.js $@
			`)}
	`,
});

// create intra-library links for development & testing
const package_node_modules = si_package => ({
	[`@${s_super}`]: {
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
					npm link @${s_super}/${si_link}
					# echo "link @${s_super}/${si_link}"
					# touch $@
				`,
			}),
		}), {}),

		// run: /* syntax: bash */ `
		// 	mkdir -p $@
		// 	pushd $@
		// 	${h_packages[si_package].links.map(si_link => /* syntax: bash */ `
		// 		# link to dep
		// 		npm link @${s_super}/${si_link}
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
			'.npmrc': npmrc,
		}),

	'package.json': package_json(si_package),

	node_modules: package_node_modules(si_package),
});

// carry files from a main source file's subdirectory
const carry_sub = (pd_src, h_recipe={}, pdr_package=null) => {
	// scan directory
	let a_files = fs.readdirSync(pd_src);

	// deps
	let a_deps = [];
	let a_direct = [];

	// each file
	for(let s_file of a_files) {
		let p_src = `${pd_src}/${s_file}`;
		let pd_dst = `build/package/${pdr_package}`;

		// *.js files
		if(s_file.endsWith('.js')) {
			h_recipe[s_file] = () => ({copy:p_src});
			a_deps.push(`${pd_dst}/${s_file}`);
		}
		// *.jmacs files
		else if(s_file.endsWith('.js.jmacs')) {
			let s_dst = s_file.slice(0, -'.jmacs'.length);
			h_recipe[s_dst] = () => jmacs_lint([p_src]);
			a_deps.push(`${pd_dst}/${s_dst}`);
		}
		// subdirectory
		else if(fs.statSync(p_src).isDirectory()) {
			// make subrecipe; put in this recipe
			let h_subrecipe = h_recipe[s_file] = {};

			// recurse
			a_deps.push(...carry_sub(p_src, h_subrecipe, `${pdr_package}/${s_file}`));

			// simple deps
			a_direct.push(`${pd_dst}/${s_file}/**`);
		}
	}

	return a_direct.length? a_direct: a_deps;
	// return a_deps;
};


let a_messages = fs.readdirSync('messages').sort().reverse().map(s => `messages/${s}`);

// emk struct
module.exports = async() => {
	// make manifest dependencies
	let h_manifest_deps = {};
	{
		const A_DEPEDENCY_PREDICATES = [
			'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#action',
			'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#result',
		];

		for(let si_package of a_content_subs.filter(s => s.endsWith('.read'))) {
			let h_deps = h_manifest_deps[`manifest_deps_${si_package.replace(/\./g, '_')}`] = {};

			try {
				fs.accessSync(`build/package/content.ttl.read/main.js`, fs.constants.F_OK);
				fs.accessSync(`build/cache/specs/${si_package}/manifest.ttl`, fs.constants.F_OK);
			}
			catch(e_access) {
				continue;
			}

			if(process.env.GRAPHY_SKIP_MANIFEST) continue;

			let ttl_read;
			try {
				ttl_read = require(`@${s_super}/content.ttl.read`);  // eslint-disable-line global-require
			}
			catch(e_require) {
				continue;
			}

			if('function' !== typeof ttl_read) continue;

			let ds_manifest = fs.createReadStream(path.join(`build/cache/specs`, si_package, 'manifest.ttl'));

			try {
				await new Promise((fk_deps, fe_deps) => {
					ds_manifest.pipe(ttl_read({
						base_uri: h_packages[si_package].manifest,
						data(g_quad) {
							if(A_DEPEDENCY_PREDICATES.includes(g_quad.predicate.value)) {
								let p_dep = g_quad.object.value;
								h_deps[path.basename((new url(p_dep)).pathname)] = p_dep;
							}
						},

						error(e_read) {
							fe_deps(e_read);
						},

						end() {
							fk_deps(h_deps);
						},
					}));
				});
			}
			catch(e_read) {
				continue;
			}
		}
	}

	return {
		defs: {
			// contet sub enum
			content_sub: a_content_subs,

			// top packages
			package_top: Object.keys(h_packages_top),

			...(Object.entries(h_manifest_deps).reduce((h_out, [si_key, h_deps]) => ({
				...h_out,
				[si_key]: Object.keys(h_deps),
			}), {})),

			testable: [
				'core.data.factory',
				'content.nt.read',
				'content.nt.scan',
				'content.nt.scribe',
				'content.nt.write',
				'content.nq.read',
				'content.nq.scan',
				'content.nq.scribe',
				'content.nq.write',
				'content.ttl.read',
				'content.ttl.scribe',
				'content.ttl.write',
				'content.trig.read',
				'content.trig.scribe',
				'content.trig.write',
				'content.xml.scribe',
				'memory.dataset.fast',
			],

			// package enumeration
			package: Object.keys(h_packages),

			// non-content-sub packages
			package_ncs: Object.keys(h_packages)
				.filter(s => !a_content_subs.includes(s)
					&& !s.startsWith('content.n')
					&& !s.startsWith('content.t')
					&& !s.startsWith('store.memory.query')
				),

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

			// clean
			clean: () => ({
				run: /* syntax: bash */ `
					rm -rf \
						'${P_PACKAGE_PREFIX}/lib/node_modules/${s_super}' \
						'${P_PACKAGE_PREFIX}/lib/node_modules/@${s_super}' \
						'${P_PACKAGE_PREFIX}/bin/${s_super}' \
						'build/package' \
						'build/test' \
						'node_modules/${s_super}' \
						'node_modules/@${s_super}'
				`,
			}),

			// link alias
			link_ready: {
				':package': h => ([
					`${P_PACKAGE_PREFIX}/lib/node_modules/@${s_super}/${h.package}.ready`,
				]),
			},

			link: {
				// selected: () => ({
				// 	run() {
				// 		return a_link_selected.map(si_link => /* syntax: bash */ `
				// 			# package directory relative to project root
				// 			PACKAGE_DIR='build/package/${si_link}'

				// 			# enter package directory
				// 			pushd "$PACKAGE_DIR"

				// 			# link self
				// 			npm link

				// 			# pop dir from stack
				// 			popd
				// 		`).map('\n');
				// 	},
				// }),

				selected: {
					':package': ({package:si_package}) => ({
						deps: [
							...h_packages[si_package].links.reduce((a_out, si_link) => [
								...a_out,
								`link.selected.${si_link}`,
							], []),

							`link_ready.${si_package}`,
						],
						run: /* syntax: bash */ `
							# package directory relative to project root
							PACKAGE_DIR='build/package/${si_package}'
							
							# enter package directory
							pushd "$PACKAGE_DIR"

							# link self
							npm link

							# pop dir from stack
							popd
						`,
					}),
				},

				packages: () => ({
					deps: [
						...Object.keys(h_packages).reduce((a_out, si_package) => [
							...a_out,
							`link_ready.${si_package}`,
						], []),
					],
					run: Object.keys(h_packages).map(si_package => /* syntax: bash */ `
						# package directory relative to project root
						PACKAGE_DIR='build/package/${si_package}'
						
						# enter package directory
						pushd "$PACKAGE_DIR"

						# link self
						npm link

						# pop dir from stack
						popd
					`).join('\n'),
				}),

				[s_super]: () => ([
					`${P_PACKAGE_PREFIX}/lib/node_modules/${s_super}`,
				]),
			},

			// link-to alias
			local: {
				':package': h => ({
					deps: [`node_modules/@${s_super}/${h.package}`],
				}),

				[s_super]: () => ({
					deps: [`node_modules/${s_super}`],
				}),
			},

			// prepublish
			prepublish: {
				':package': h => ({
					deps: [`local.${h.package}`],
					run: /* syntax: bash */ `
						cd build/package/${h.package}

						# defer README to GitHub
						rm -rf README.md
						cat <(echo "#@${s_super}/${h.package}") ../../../emk/aux/README-defer.md > README.md
					`,
				}),

				[s_super]: () => ({
					deps: [`local.${s_super}`],
					run: /* syntax: bash */ `
						cd build/package/${s_super}

						# defer README to GitHub
						rm -rf README.md
						cat <(echo "#${s_super}") ../../../emk/aux/README-defer.md > README.md
					`,
				}),

				docs: ['docs/**'],
			},

			// publish
			publish: {
				':package': h => ({
					deps: [`prepublish.${h.package}`],
					run: /* syntax: bash */ `
						cd build/package/${h.package}

						# publish to npm
						npm publish --access=public
					`,
				}),

				[s_super]: () => ({
					deps: [`prepublish.${s_super}`],
					run: /* syntax: bash */ `
						cd build/package/${s_super}

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
						'local.memory.dataset.fast',
						`test/package/${si_package}.js`,
						...a_content_subs.filter(s => s.endsWith('.read')).includes(si_package)
							? [
								`build/cache/specs/${si_package}/**`,
								// `build/cache/specs/${si_package}/dependencies/*:{optional:true}`,
							]
							: [],
					],

					run: /* syntax: bash */ `
						npx mocha --timeout 5000 --colors $3
					`,
				}),

				[s_super]: () => ({
					deps: [
						`test/package/${s_super}.js`,
						`prepublish.${s_super}`,
						// 'build/cache/data/dbr/**',
					],

					run: /* syntax: bash */ `
						npx mocha --timeout 5000 --colors $1
					`,
				}),

				// web test
				web: {
					browserify: {
						chrome: () => ({
							deps: [
								'test/web/runner.html',
								`build/test/browserify/**`,
							],
							run: /* syntax: bash */ `
								npx mocha-webdriver-runner --reporter=spec --headless-chrome $1
							`,
						}),

						firefox: () => ({
							deps: [
								'test/web/runner.html',
								`build/test/browserify/**`,
							],
							run: /* syntax: bash */ `
								npx mocha-webdriver-runner --reporter=spec --headless-firefox $1
							`,
						}),
					},

					webpack: {
						chrome: () => ({
							deps: [
								'test/web/runner.html',
								`build/test/webpack/**`,
							],
							run: /* syntax: bash */ `
								npx mocha-webdriver-runner --reporter=spec --headless-chrome $1
							`,
						}),

						firefox: () => ({
							deps: [
								'test/web/runner.html',
								`build/test/webpack/**`,
							],
							run: /* syntax: bash */ `
								npx mocha-webdriver-runner --reporter=spec --headless-firefox $1
							`,
						}),
					},
				},
			},

			// performance
			perf: ['build/perf/**'],
		},

		outputs: {
			// eslint config
			'.eslintrc.yaml': () => ({copy:'~/dev/.eslintrc.yaml'}),

			// CHANGELOG.md
			'CHANGELOG.md': () => ({
				deps: [
					...a_messages,
				],
				run: /* syntax: bash */ `
					echo -e "# Changelog\\\\n\\\\n${a_messages.map(s => `$(cat '${s}')`).join('\\\\n'.repeat(3))}" > $@
				`,
			}),

			// docs
			docs: {
				// snippets
				snippets: {
					':snippet': h => jmacs_lint([
						`src/docs/snippets/${h.snippet}.jmacs`,
					], [
						'local.*',
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
				cache: {
					specs: {
						':content_sub': [si_package => ({
							...(si_package.endsWith('.read')
								? {
									[si_package]: (g_package => ({
										// manifest file
										[path.basename(g_package.manifest)]: () => ({
											deps: [
												g_package.manifest,
											],

											run: /* syntax: bash */ `
												curl "$1" > $@
											`,
										}),

										// manifest dependencies
										...(si_manifest_dep => ({
											[`:${si_manifest_dep}`]: [s_dep => ({
												[s_dep]: () => ({
													deps: [
														h_manifest_deps[si_manifest_dep][s_dep],
														`build/cache/specs/${si_package}/${path.basename(g_package.manifest)}`,
													],
													run: /* syntax: bash */ `
														curl "$1" > $@
													`,
												}),
											})],
										}))(`manifest_deps_${si_package.replace(/\./g, '_')}`),
									}))(h_packages[si_package]),
								}
								: {}),
						})],
					},
				},

				package: {
					// // supers
					// ':package_top': [si_package => ({
					// 	[si_package]: (g_package => ({
					// 		...scoped_package(si_package),

					// 		'main.js': () => ({
					// 			deps: [
					// 				...a_content_subs.map(s => `build/package/${s}/**`),
					// 			],
					// 			write: /* syntax: js */ `
					// 				import 
					// 				${g_package.links.map}
					// 			`,
					// 			run: /* syntax: bash */ `
					// 				npx jmacs emk
					// 			`,
					// 		}),
					// 	}))(h_packages_top[si_package]),
					// })],

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
										npx jmacs -g '${JSON.stringify({/* eslint-disable indent */
											...g_package.jmacs,
											FORMAT: si_package.split(/\./g)[1],
										})/* eslint-enable indent */}' $1 > $@ \
										 && ${eslint(/* syntax: bash */ `
											node emk/pretty-print.js $@
										`)}
									`,
								}),
							}), {}),
						}))(h_packages[si_package]),
					})],

					// all non-content-sub packages
					':package_ncs': [si_package => ({
						[si_package]: {
							...scoped_package(si_package),

							'main.js': () => jmacs_lint([
								`src/${si_package.replace(/\./g, '/')}.js.jmacs`,
							], [
								`build/package/${si_package}/package.json`,
							]),

							...((h_packages[si_package].includes || []).reduce((h_out, s_include) => ({
								...h_out,
								[s_include]: () => ({
									copy: `src/${si_package.replace(/\./g, '/').replace(/\/[^/]+$/, '')}/${s_include}`,
								}),
							}), {})),
						},
					})],

					// the super module
					[s_super]: {
						...(process.env.GRAPHY_USE_NVM
							? {}
							: {
								'.npmrc': npmrc,
							}),

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
											name: s_super,
											dependencies: {
												...g_package_json_super.dependencies,
												...Object.keys(h_packages).reduce((h, si_link) => Object.assign(h, {
													[`@${s_super}/${si_link}`]: s_base_version,
												}), {}),
											},
											description: 'A comprehensive RDF toolkit including triplestores, intuitive writers, and the fastest JavaScript parsers on the Web',
											main: 'api.js',
											bin: {
												[s_super]: 'cli.js',
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
							[`@${s_super}`]: {
								':package': ({package:si_package}) => ({
									deps: [
										...(process.env.GRAPHY_USE_NVM
											? []
											: [`build/package/${s_super}/.npmrc`]),
										`local.${si_package}`,
									],

									run: /* syntax: bash */ `
										cd build/package/${s_super}
										npm link @${s_super}/${si_package}
									`,
								}),
							},
						},

						'api.js': () => jmacs_lint([`src/main/graphy.js.jmacs`], ['package.json']),

						'cli.js': () => jmacs_lint([`src/cli/cli.js.jmacs`]),

						// quad-expression parser
						'quad-expression.js': () => ({
							deps: [
								'src/cli/quad-expression.pegjs',
							],

							run: /* syntax: bash */ `
								npx pegjs < $1 > $@
							`,
						}),

						// quad-expression parser
						'expression-handler.js': () => ({
							copy: 'src/cli/expression-handler.js',
						}),
						'constants.js': () => ({
							copy: 'src/cli/constants.js',
						}),
					},

				},

				test: {
					browserify: {
						':testable.js': ({testable:si_package}) => ({
							deps: [
								`test/package/${si_package}.js`,
							],
							run: /* syntax: bash */ `
								npx browserify $1 -d -o $@
							`,
						}),
					},

					webpack: {
						':testable.js': ({testable:si_package}) => ({
							deps: [
								`test/package/${si_package}.js`,
							],
							run: /* syntax: bash */ `
								npx webpack --config=./emk/webpack.config.js $1 -o $@
							`,
						}),
					},
				},
			},

			// package linking
			[P_PACKAGE_PREFIX]: {
				lib: {
					node_modules: {
						[`@${s_super}`]: {
							':package.ready': ({package:si_package}) => ({
								deps: [
									`build/package/${si_package}/**`,
								],

								run: /* syntax: bash */ `
									# package directory relative to project root
									PACKAGE_DIR='build/package/${si_package}'
									
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

						[s_super]: () => ({
							deps: [
								`build/package/${s_super}/**`,

								...Object.keys(h_packages).map(s_dep => `link_ready.${s_dep}`),
								'link.packages',
							],

							run: /* syntax: bash */ `
								# enter package directory
								cd build/package/${s_super}

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
				[`@${s_super}`]: {
					':package': ({package:si_package}) => {
						a_link_selected.push(si_package);

						return {
							deps: [
								`link_ready.${si_package}`,
								`link.selected.${si_package}`,
							],

							run: /* syntax: bash */ `
								npm link @${s_super}/${si_package}
							`,
						};
					},
				},

				[s_super]: () => ({
					deps: [
						`link.${s_super}`,
					],

					run: /* syntax: bash */ `
						npm link ${s_super}
					`,
				}),
			},
		},
	};
};
