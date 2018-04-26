
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

module.exports = () => ({
	'&format': /(\w+)-((?:de)?serializer)/,

	'&dedicated': /(store)/,

	// all tasks
	all: 'formats standalones store',

	// all formats x modes
	formats: a_format_build_targets,

	'ttl-deserializer': `${pd_packages}/ttl-deserializer/index.js`,

	link: {
		phony: true,
		run: /* syntax: bash */ `
			cd ${pd_packages}/graphy
			${/* eslint-disable indent */[
				'factory',
				'set',
				'viz',
				'serializer',
				'writer',
				'ttl-deserializer',
				'ttl-serializer',
				'trig-deserializer',
				'trig-serializer',
				'nt-deserializer',
				'nt-serializer',
				'nq-deserializer',
				'nq-serializer',
			].map(s => `npm link @graphy/${s}`).join('\n')}
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
			`${pd_packages}/\${format[0]}`,
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
				# eslint --fix -o /dev/null $@
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
			`${pd_packages}/$package`,
		],
		run: /* syntax: bash */ `
			npx jmacs $1 | npx js-beautify -t - > $@
			# eslint --fix -o /dev/null $@
			cd $(dirname $@)
			npm link
		`,
	},

});
