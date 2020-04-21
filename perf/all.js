const N_MAX_MILLION = process.env.PERF_MAX_M || 1;

const A_INPUT_SOURCES = [
	'data/wikidata',
	'data/persondata_en',
];

function* gen_inputs(s_format) {
	for(let s_root of A_INPUT_SOURCES) {
		for(let i_million=1; i_million<=N_MAX_MILLION; i_million++) {
			yield `${s_root}/sample-${i_million}M.${s_format}`;
		}
	}
}

const H_FORMATS = {
	nt: {
		inputs: [
			...gen_inputs('nt'),
		],
	},
	ttl: {
		inputs: [
			...gen_inputs('ttl'),
		],
	},
	// nq: {
	// 	inputs: [
	// 		// ...gen_inputs('nq'),
	// 	],
	// },
	// trig: {
	// 	inputs: [
	// 		// ...gen_inputs('trig'),
	// 	],
	// },
};

const H_CONVERT_FORMAT_MAPPINGS = {
	nt: [
		'ttl',
	],
	ttl: [
		'nt',
	],
	// nq: [
	// 	'trig',
	// ],
	// trig: [
	// 	'nq',
	// ],
};

const H_TASK_OPTIONS = {
	distinct: ['--max-old-space-size=8192'],
};

const H_MODES_DEFAULT = {
	default: {},
};

const H_MODES_GRAPHY_READ = {
	default: {}, // default
	relaxed: {
		SJ_CONFIG_READ: /* syntax: js.object-literal */ `
			relax: true,
		`,
	},
};

const H_MODES_GRAPHY_READ_SCAN = {
	...H_MODES_GRAPHY_READ,
	'scan.2': {
		N_THREADS: 2,
	},
	'scan.4': {
		N_THREADS: 4,
	},
	'scan.8': {
		N_THREADS: 8,
	},
	'scan.16': {
		N_THREADS: 8,
	},
	'relaxed-scan.16': {
		N_THREADS: 8,
		SJ_CONFIG_READ: /* syntax: js.object-literal */ `
			relax: true,
		`,
	},
};

const perm_formats_in = si_task => (gc_task={modes:H_MODES_DEFAULT}) => Object.entries(H_FORMATS).reduce((h_out, [s_format, g_format]) => ({
	...h_out,
	[s_format]: {
		inputs: g_format.inputs,
		options: H_TASK_OPTIONS[si_task] || [],
		modes: Object.entries(gc_task.modes).reduce((h_modes_out, [si_mode, h_mode]) => ({
			...h_modes_out,
			[si_mode]: {
				S_FORMAT_IN: s_format,
				...h_mode,
			},
		}), {}),
	},
}), {});

const perm_formats_in_out = si_task => (gc_task={modes:H_MODES_DEFAULT}) => Object.entries(H_FORMATS).reduce((h_out, [s_format_in, g_format_in]) => ({
	...h_out,
	...H_CONVERT_FORMAT_MAPPINGS[s_format_in].reduce((h_conv_out, s_format_out) => ({
		...h_conv_out,
		[`${s_format_in}-${s_format_out}`]: {
			inputs: g_format_in.inputs,
			options: H_TASK_OPTIONS[si_task] || [],
			modes: Object.entries(gc_task.modes).reduce((h_modes_out, [si_mode, h_mode]) => ({
				...h_modes_out,
				[si_mode]: {
					S_FORMAT_IN: s_format_in,
					S_FORMAT_OUT: s_format_out,
					...h_mode,
				},
			}), {}),
		},
	}), {}),
}), {});

const H_TASK_PERMS = {
	count: perm_formats_in('count'),
	distinct: perm_formats_in('distinct'),
	convert: perm_formats_in_out('convert'),
};

const H_PARTIES = {
	N3: {
		label: 'N3.js',
		href: 'https://github.com/rdfjs/N3.js',
		version: require('n3/package.json').version,

		tasks: {
			count: H_TASK_PERMS.count(),
			distinct: H_TASK_PERMS.distinct(),
			convert: H_TASK_PERMS.convert(),
		},
	},

	graphy: {
		label: 'graphy',
		href: 'https://github.com/blake-regalia/graphy.js',
		version: require('../package.json').version,

		tasks: {
			count: H_TASK_PERMS.count({
				modes: H_MODES_GRAPHY_READ_SCAN,
			}),
			distinct: H_TASK_PERMS.distinct({
				modes: H_MODES_GRAPHY_READ,
			}),
			convert: H_TASK_PERMS.convert({
				modes: H_MODES_GRAPHY_READ_SCAN,
			}),
		},
	},
};


module.exports = {
	H_PARTIES,
};


