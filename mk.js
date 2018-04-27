
const H_FORMATS_GENERALIZED = {
	nt: 'n',
	nq: 'n',
	ttl: 't',
	trig: 't',
};

const A_FORMAT_MODES = [
	'serializer',
	'deserializer',
];


const A_FILES_STORE = [
	'index',
	'pattern',
	'selection',
	'match',
	'plugin',
	'symbols',
];

let s_self_dir = '$(dirname $@)';
let pd_build = 'build';
let pd_packages = `${pd_build}/packages`;

let a_format_build_targets = [];
Object.keys(H_FORMATS_GENERALIZED).forEach((s_format) => {
	a_format_build_targets.push(
		...A_FORMAT_MODES.map(s_mode => `${pd_packages}/${s_format}-${s_mode}/index.js`));
});

const H_LINKS = {
	factory: [],
	bat: [],
	set: [],
	viz: [],
	serializer: [],
	writer: [],
	'ttl-deserializer': ['factory'],
	// 'ttl-serializer': ['factory', 'serializer', 'writer'],
	'nt-deserializer': ['factory'],
	'nq-deserializer': ['factory'],
	get graphy() {
		return Object.keys(H_LINKS).filter(s => ('graphy' !== s));
	},
};

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

module.exports = () => ({
	'&format': /(\w+)-((?:de)?serializer)/,

	'&dedicated': /(store)/,

	'&file_subdir': /([^/]+)(?:\/(.+))?/,

	// all tasks
	all: 'formats standalones bat store',

	// all formats x modes
	formats: a_format_build_targets,

	bat: [
		...dir_struct([
			'store',
			'main',
			'index',
			'bat',
			'creator',
			{
				decoders: [
					'async',
					'bat',
					'chapter-front-coded',
					'dataset',
					'dictionary-thirteen-chapter',
					'interfaces',
				],
				encoders: [
					'chapter-front-coded',
				],
				workers: [
					'encoder',
					'serializer',
				],
			},
		]).map(s => `${pd_packages}/bat/${s}.js`),
	],

	[`${pd_packages}/bat/decoders/interfaces.js`]: {
		case: true,
		deps: [
			'src/bat/decoders/interfaces.js.jmacs',
			s_self_dir,
		],
		run: /* syntax: bash */ `
			jmacs $1 > $@ \
				&& eslint --fix --rule 'no-debugger: off' $@
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
		`,
	},

	'ttl-deserializer': `${pd_packages}/ttl-deserializer/index.js`,

	// link: {
	// 	phony: true,
	// 	run: /* syntax: bash */ `
	// 		${/* eslint-disable indent */
	// 			Object.keys(H_LINKS).map(s_package => /* syntax: bash */ `
	// 				pushd ${pd_packages}/${s_package}
	// 					npm link
	// 					${H_LINKS[s_package].map(s_dep => /* syntax: bash */ `
	// 						npm link @graphy/${s_dep}
	// 					`).join('')}
	// 				popd
	// 			`).join('')
	// 		}
	// 	`,
	// },

	link: 'link/graphy',

	'link/:package': {
		phony: true,
		deps: [
			h => H_LINKS[h.package].map(s_dep => `link/${s_dep}`).join(' '),
		],
		run: h => /* syntax: bash */ `
			cd build/packages/$package
			npm link
			${H_LINKS[h.package].map(s_dep => /* syntax: bash */ `
				npm link @graphy/${s_dep}
			`).join('')}
		`,
	},

	// standalone targets
	standalones: [
		'graphy',
		'factory',
		'set',
		'viz',
		'serializer',
		'writer',
	].map(s => `${pd_packages}/${s}/index.js`),

	// build dir for package
	[`${pd_packages}/:package`]: {
		deps: [
			'src/aux/base-package.json',
			'src/aux/package-descriptions.json',
		],
		run: /* syntax: bash */ `
			mkdir -p $@
			cat $1| npx lambduh "json => \
				Object.assign(json, $(cat $2 | npx lambduh "json => json['$package']")) \
				&& json" > $@/package.json
		`,
	},

	// an RDF file format
	[`${pd_packages}/(&format)/index.js`]: {
		case: true,
		deps: [
			h => `src/formats/${H_FORMATS_GENERALIZED[h.format[1]]}-${h.format[2]}.js.jmacs`,
			...[
				'textual-parser-macros',
				'general-parser-macros',
			].map(s => `src/formats/${s}.jmacs`),
			s_self_dir,
		],
		run: /* syntax: bash */ `
			npx jmacs -g "{FORMAT:'\${format[1]}'}" $1 \
				| npx js-beautify -t - > $@
			eslint --fix -o /dev/null $@
		`,
	},

	// store
	store: A_FILES_STORE.map(s => `${pd_packages}/store/${s}.js`),

	...A_FILES_STORE.reduce((h_targets, s_file) => Object.assign(h_targets, {
		[`${pd_packages}/store/${s_file}.js`]: {
			deps: [
				`src/store/${s_file}.js.jmacs`,
				s_self_dir,
			],

			run: /* syntax: bash */ `
				npx jmacs $1 \
					| npx js-beautify -t - > $@
				eslint --fix --rule 'no-debugger: off' -o /dev/null $@
				cd $(dirname $@)
				npm link
			`,
		},
	}), {}),

	// mains
	[`${pd_packages}/:package/index.js`]: {
		case: true,
		deps: [
			`src/main/$package.js.jmacs`,
			s_self_dir,
		],
		run: /* syntax: bash */ `
			npx jmacs $1 | npx js-beautify -t - > $@
			# eslint --fix --rule 'no-debugger: off' -o /dev/null $@
			cd $(dirname $@)
			npm link
		`,
	},

});
