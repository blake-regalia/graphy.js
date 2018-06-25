const G_PACKAGE_JSON_BASE = require('./src/aux/base-package.json');

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

const H_FORMATS_GENERALIZED = {
	nt: 'n',
	// nq: 'n',
	ttl: 't',
	// trig: 't',
};

const H_FORMAT_MODES = {
	read: dir_struct([
		'main.js',
		'package.json',
	]),
	turbo: dir_struct([
		'main.js',
		'worker.js',
		'package.json',
	]),
	write: dir_struct([
		'main.js',
		'package.json',
	]),
};


const A_FILES_STORE = [
	'main',
	'pattern',
	'selection',
	// 'match',
	'plugin',
	'symbols',
];

let s_self_dir = '$(dirname $@)';
let pd_build = 'build';
let pd_packages = `${pd_build}/packages`;

let a_format_build_targets = [];
for(let s_format of Object.keys(H_FORMATS_GENERALIZED)) {
	for(let [s_mode, a_files] of Object.entries(H_FORMAT_MODES)) {
		for(let s_file of a_files) {
			a_format_build_targets.push(`${pd_packages}/format.${s_format}.${s_mode}/${s_file}`);
		}
	}
	// a_format_build_targets.push(
	// 	...Object.entries(A_FORMAT_MODES)
	// 		.reduce((a, [s_mode, a_paths]) => a.push(
	// 			...a_paths.map(s_file => `${pd_packages}/format.${s_format}.${s_mode}/${s_file}`))
	// 				&& a, []));
}

const eslint = () => /* syntax: bash */ `
	eslint --fix --color --rule 'no-debugger: off' $@
	eslint_exit=$?
	# do not fail on warnings
	if [ $eslint_exit -eq 2 ]; then
		exit 0
	fi
	exit $eslint_exit
`;

const H_LINKS = {
	factory: [],
	stream: [],
	// store: [],
	set: ['factory', 'stream'],
	// bat: ['factory', 'store'],
	viz: [],
	writer: ['factory', 'stream'],
	'format.nt.read': ['factory', 'stream'],
	'format.nt.turbo': ['format.nt.read', 'stream'],
	// 'format.nq.read': ['factory', 'stream'],
	'format.ttl.read': ['factory', 'stream'],
	'format.ttl.write': ['factory', 'writer', 'stream'],
};


module.exports = {
	'&format': /format\.(\w+)\.(\w+)/,

	'&dedicated': /(store)/,

	'&file_subdir': /([^/]+)(?:\/(.+))?/,

	// all tasks
	all: [
		'formats',
		'standalones',
		// 'bat',
		// 'store',
	],

	// test
	test: {
		phony: true,
		deps: [
			'all',
			'link',
		],
		run: /* syntax: bash */ `
			mocha test/parsers/ttl.js
		`,
	},

	// copy eslint from authority
	eslint: {
		run: /* syntax: bash */ `
			cp ~/dev/.eslintrc.yaml .
		`,
	},

	// all formats x modes
	formats: a_format_build_targets,

	bat: [
		...dir_struct([
			'bat',
			'builder',
			'creator',
			'main',
			// 'main',
			'serializer',
			{
				decoders: [
					// 'async',
					'chapter-difcc',
					'dictionary-pp12oc',
					'dataset',
					'interfaces',
					'triples-bitmap',
				],
				encoders: [
					'chapter-difcc',
				],
				workers: [
					'encoder',
				],
			},
		]).map(s => `${pd_packages}/bat/${s}.js`),
		`${pd_packages}/bat/package.json`,
	],

	...dir_struct([
		'bat',
		{
			decoders: [
				'dictionary-pp12oc',
				'interfaces',
			],
		},
	]).reduce((h, s) => (Object.assign(h, {
		[`${pd_packages}/bat/${s}.js`]: {
			case: true,
			deps: [
				`src/bat/${s}.js.jmacs`,
				s_self_dir,
			],
			run: /* syntax: bash */ `
				jmacs $1 > $@
				${eslint()}
			`,
		},
	})), {}),


	// package's package.json file
	[`${pd_packages}/:package/package.json`]: {
		case: true,
		deps: [
			'src/aux/base-package.json',
			'src/aux/package-extras.js',
			s_self_dir,
		],
		run: /* syntax: bash */ `
			cat $1| npx lambduh "json => {\
				${/* syntax: js */`
					// final dependencies
					let h_deps = {};

					// package extras
					let h_package_tree = require('${__dirname}/$2');
					let a_words = '$package'.split(/\\./g);
					let h_package = h_package_tree;
					for(let s_word of a_words) h_package = h_package[s_word];

					// no name, use default
					if(!h_package.name) {
						h_package.name = '@graphy/$package';
					}

					// dependencies
					if(h_package.dependencies) {
						// source root dependencies
						let h_root_deps = ${JSON.stringify(G_PACKAGE_JSON_BASE.dependencies).replace(/"/g, '\\"')};

						// add dependencies from package extras
						for(let s_dep of h_package.dependencies) {
							h_deps[s_dep] = h_root_deps[s_dep];
						}

						// do not overwrite package.json with this key/value
						delete h_package.dependencies;
					}

					// source links
					let h_links = ${JSON.stringify(H_LINKS).replace(/"/g, '\\"')};

					// add dependencies from graphy links
					if('$package' in h_links) {
						for(let s_link of h_links['$package']) {
							h_deps['@graphy/'+s_link] = '^${G_PACKAGE_JSON_BASE.version}';
						}
					}
					// graphy package
					else if('$package' === 'graphy') {
						for(let s_dep in h_links) {
							h_deps['@graphy/'+s_dep] = '^${G_PACKAGE_JSON_BASE.version}';
						}
					}

					// update package.json
					return Object.assign(json, h_package, {
						dependencies: h_deps,
					});
				`.trim()} }" > $@

			# sort its package.json
			npx sort-package-json $@
		`,
	},


	[`${pd_packages}/bat/:file.js`]: {
		case: true,
		deps: [
			'src/bat/$file.js',
			s_self_dir,
		],
		run: /* syntax: bash */ `
			cp $1 $@
			${eslint()}
		`,
	},

	[`${pd_packages}/bat/:sub`]: {
		case: true,
		deps: [
			s_self_dir,
		],
		run: /* syntax: bash */ `
			mkdir -p $@
		`,
	},

	[`${pd_packages}/bat/:sub/:file.js`]: {
		case: true,
		deps: [
			'src/bat/$sub/$file.js',
			s_self_dir,
		],
		run: /* syntax: bash */ `
			cp $1 $@
			${eslint()}
		`,
	},

	link: {
		phony: true,
		deps: ['link/graphy'],
		run: /* syntax: bash */ `
			# for testing
			npm link graphy
		`,
	},

	'link/graphy': {
		deps: Object.keys(H_LINKS).map(s_dep => `link-sub/${s_dep}`),
		run: /* syntax: bash */ `
			cd build/packages/graphy
			${Object.keys(H_LINKS).map(s_dep => /* syntax: bash */ `
				npm link @graphy/${s_dep}
			`).join('')}

			# remove package lock
			rm -f package-lock.json

			# then link self
			npm link
		`,

		stderr: {
			warn: [
				/^npm notice/,
			],
		},
	},

	'link-sub/:package': {
		phony: true,
		deps: [
			h => H_LINKS[h.package].map(s_dep => `link/${s_dep}`).join(' '),
		],
		run: h => /* syntax: bash */ `
			cd build/packages/$package

			# first, link to dependencies
			${H_LINKS[h.package].map(s_dep => /* syntax: bash */ `
				npm link @graphy/${s_dep}
			`).join('')}

			# remove package lock
			rm package-lock.json

			# then link self
			npm link
		`,
	},

	// standalone targets
	standalones: [
		'graphy',
		'factory',
		'set',
		'stream',
		'viz',
		'writer',
	].reduce((a, s_package) => a.push(...[
		'main.js',
		'package.json',
	].map(s_file => `${pd_packages}/${s_package}/${s_file}`)) && a, []),

	// build dir for package
	[`${pd_packages}/:package`]: {
		run: /* syntax: bash */ `
			mkdir -p $@
		`,
	},

	// an RDF file format
	[`${pd_packages}/(&format)/:file.js`]: {
		case: true,
		deps: [
			h => `src/formats/${H_FORMATS_GENERALIZED[h.format[1]]}/${h.format[2]}/${h.file}.js.jmacs`,
			...[
				'textual-parser-macros',
				'general-parser-macros',
			].map(s => `src/formats/${s}.jmacs`),
			s_self_dir,
		],
		run: /* syntax: bash */ `
			npx jmacs -g "{FORMAT:'\${format[1]}'}" $1 > $@
			${eslint()}
		`,
	},

	// // format commons
	// [`${pd_packages}/format.common.parser.text/index.js`]: {
	// 	deps: [
	// 		'src/formats/common.parser.text.js.jmacs',
	// 		s_self_dir,
	// 	],
	// 	run: /* syntax: bash */ `
	// 		npx jmacs $1 > $@
	// 		${eslint()}
	// 	`,
	// },

	// store
	store: A_FILES_STORE.map(s => `${pd_packages}/store/${s}.js`),

	...A_FILES_STORE.reduce((h_targets, s_file) => Object.assign(h_targets, {
		[`${pd_packages}/store/${s_file}.js`]: {
			deps: [
				`src/store/${s_file}.js.jmacs`,
				s_self_dir,
			],

			run: /* syntax: bash */ `
				npx jmacs $1 > $@
				${eslint()}
			`,
		},
	}), {}),

	// mains
	[`${pd_packages}/:package/main.js`]: {
		case: true,
		deps: [
			`src/main/$package.js.jmacs`,
			s_self_dir,
		],
		run: /* syntax: bash */ `
			npx jmacs $1 > $@
			${eslint()}
		`,
	},

};
