
const pd_build = 'build';
const pd_src = 'src';

const s_self_dir = /* syntax: bash */ `$(dirname $@)`;

const gobble = (a_strings, ...a_interps) => {
	let s_output = a_strings[0];
	for(let i_part=1, nl_parts=a_strings.length; i_part<nl_parts; i_part++) {
		s_output += a_interps[i_part-1] + a_strings[i_part];
	}

	let [, s_indent] = /^\n(\s*)/.exec(s_output);

	return s_output.replace(new RegExp(`\\n${s_indent}`, 'g'), '\n');
};

const CMD_EMCC = (h_docker_args={}) => /* syntax: bash */ `
	docker run --rm \\
		-v $(pwd)/${pd_build}:/src \\
		-u emscripten ${/* eslint-disable indent */
			Object.keys(h_docker_args)
				.map(s_option => `${s_option} ${h_docker_args[s_option]}`)
				.join(' ')/* eslint-enable indent */} \\
		trzeci/emscripten \\
		emcc `;

const A_METHODS_EXPORT = [
	'register_callbacks',
	'parse_n',
	'parse_eof',
];

const A_RUNTIME_METHODS_EXPORT = [
	'ccall',
	'cwrap',
	'addFunction',
	'Pointer_stringify',
	'FS',
];

module.exports = mk => ({

	all: [
		`${pd_build}/parser.wasm`,
		`${pd_build}/api.js`,
	],

	// build directory
	[`${pd_build}`]: {
		run: /* syntax: bash */ `
			mkdir -p $@
		`,
	},

	// build subdirectory
	[`${pd_build}/:sub`]: {
		run: /* syntax: bash */ `
			mkdir -p $@
		`,
	},

	// parser.wasm
	[`${pd_build}/parser.wasm`]: {
		deps: [
			`${pd_build}/src/main.c`,
			s_self_dir,
		],
		run: (h, a_deps) => /* syntax: bash */ `
			# export EMCC_DEBUG=1

			${CMD_EMCC()} \
					${/* eslint-disable indent */
						a_deps
							.filter(s => s.endsWith('.c'))
							.map(s => s.replace(/^build\//, ''))
							.join(' ')
					/* eslint-enable indent */} \
					-O0 \
					-o parser.html \
					-s WASM=1 \
					-s EXPORTED_FUNCTIONS='${JSON.stringify(A_METHODS_EXPORT.map(s => '_'+s))}' \
					-s EXTRA_EXPORTED_RUNTIME_METHODS='${JSON.stringify(A_RUNTIME_METHODS_EXPORT)}' \
					-s RESERVED_FUNCTION_POINTERS=10 \
					-s NO_EXIT_RUNTIME=1 \
					-s MODULARIZE=1 \
					-s ASSERTIONS=2 \
					-s FORCE_FILESYSTEM=1 \
					-g4 \
				|| exit 1

			eslint --fix ${pd_build}/parser.js > /dev/null \
				|| exit 0
		`,
	},

	// main.c
	[`${pd_build}/src/main.c`]: {
		deps: [
			`${pd_src}/main.c.jmacs`,
			s_self_dir,
		],
		run: /* syntax: bash */ `
			jmacs $1 > $@
		`,
	},

	// api.js
	[`${pd_build}/api.js`]: {
		deps: [
			`${pd_src}/api.js.jmacs`,
			s_self_dir,
		],
		run: /* syntax: bash */ `
			jmacs $1 > $@ || exit 1
			eslint --fix --color --rule 'no-debugger: off' $@
		`,
	},
});
