const fs = require('fs');
const yargs = require('yargs');

const gobble = (s_text, s_indent='') => {
	let m_pad = /^(\s+)/.exec(s_text.replace(/^([ \t]*\n)/, ''));
	if(m_pad) {
		return s_indent+s_text.replace(new RegExp(`\\n${m_pad[1]}`, 'g'), '\n'+s_indent.trim()).trim();
	}
	else {
		return s_indent+s_text.trim();
	}
};


const h_hosts = {
	baseline: gc_reader => gobble(/* syntax: js */ `
		const {
			performance,
		} = require('perf_hooks');
		let x_perf_a = performance.now();

		let c_chars = 0;
		process.stdin
			.on('error', (e_read) => {
				throw e_read;
			})
			.on('data', (s_chunk) => {
				c_chars += s_chunk.length;
			})
			.on('end', () => {
				let x_perf_b = performance.now();

				process.stdout.write(JSON.stringify({
					baseline: true,
					...${JSON.stringify(gc_reader.tag)},
					chars: c_chars,
					time: x_perf_b - x_perf_a,
					rss: process.memoryUsage().rss,
				}));
			});
	`),

	graphy: gc_reader => gobble(/* syntax: js */ `
		const {
			performance,
		} = require('perf_hooks');
		let x_perf_a = performance.now();

		const ttl_read = require('@${process.env.GRAPHY_CHANNEL || 'graphy'}/${gc_reader.package}');
		let c_quads = 0;
		ttl_read(process.stdin, {
			base_iri: '${gc_reader.base_iri}',
			validation: ${gc_reader.validation || /* syntax: js */ `false`},

			error(e_read) {
				throw e_read;
			},

			data(g_quad) {
				c_quads += 1;
			},

			end() {
				let x_perf_b = performance.now();

				process.stdout.write(JSON.stringify({
					...${JSON.stringify(gc_reader.tag)},
					quads: c_quads,
					time: x_perf_b - x_perf_a,
					rss: process.memoryUsage().rss,
				}));
			},
		});
	`),

	n3: gc_reader => gobble(/* syntax: js */ `
		const {
			performance,
		} = require('perf_hooks');
		let x_perf_a = performance.now();

		const n3 = require('n3');
		let c_quads = 0;
		new n3.Parser({
			baseIRI: '${gc_reader.base_iri}',
			${gc_reader.format? /* syntax: js */ `format: '${gc_reader.content_type}',`: ''}
		}).parse(process.stdin, function(e_parse, g_quad) {
			if(e_parse) {
				throw e_parse;
			}
			else if(g_quad) {
				c_quads += 1;
			}
			else {
				let x_perf_b = performance.now();

				process.stdout.write(JSON.stringify({
					...${JSON.stringify(gc_reader.tag)},
					quads: c_quads,
					time: x_perf_b - x_perf_a,
					rss: process.memoryUsage().rss,
				}));
			}
		});
	`),
};

const graphy_candidates = gc_candidate => Object.entries({
	default: {},
	validation: {
		validation: true,
	},
}).reduce((g_out, [s_mode, gc_mode]) => ({
	...g_out,
	[s_mode]: {
		...gc_mode,
		package: gc_candidate.package,
	},
}), {});

const n3_candidates = gc_candidate => ({
	auto: {},
	format: {
		format: true,
	},
});

const h_content_types = {
	'application/n-triples': {
		candidates: {
			baseline: {default:{}},
			graphy: graphy_candidates({
				package: 'content.nt.read',
			}),
			n3: n3_candidates(),
		},
	},
	// 'application/n-quads': {
	// 	graphy: graphy_candidate('content.nq.read'),
	// 	n3: n3_candidate(),
	// },
	'text/turtle': {
		candidates: {
			baseline: {default:{}},
			graphy: graphy_candidates({
				package: 'content.ttl.read',
			}),
			n3: n3_candidates(),
		},
	},
	// 'application/trig': {
	// 	graphy: graphy_candidate('content.trig.read'),
	// 	n3: n3_candidate(),
	// },
};


function* targets(g_which={}) {
	let {
		content_type: s_which_content_type=null,
		host: s_which_host=null,
		mode: s_which_mode=null,
	} = g_which;

	// each content-type
	for(let s_content_type in h_content_types) {
		if(s_which_content_type && s_which_content_type !== s_content_type) continue;
		let g_content_type = h_content_types[s_content_type];

		// ref candidate hash
		let h_candidates = g_content_type.candidates;

		// each host
		for(let s_host in h_candidates) {
			if(s_which_host && s_which_host !== s_host) continue;
			let h_modes = h_candidates[s_host];

			// each mode
			for(let s_mode in h_modes) {
				if(s_which_mode && s_which_mode !== s_mode) continue;

				let g_tag = {
					host: s_host,
					mode: s_mode,
					content_type: s_content_type,
				};

				yield {
					id: `${s_host}_${s_mode}_${s_content_type}`.replace(/[^a-zA-Z0-9._-]/g, '-'),
					// file: `${s_content_type.replace(/[^a-zA-Z0-9._-]/g, '-')}_${s_mode}.js`,
					file: `${s_content_type.replace(/[^a-zA-Z0-9._-]/g, '-')}_${s_host}_${s_mode}.js`,
					...g_tag,
					candidate: gc_spread => h_hosts[s_host]({
						...h_modes[s_mode],
						content_type: s_content_type,
						...gc_spread,
						tag: g_tag,
					}),
				};
			}
		}
	}
}

if(module === require.main) {
	let {
		content_type: s_content_type,
		host: s_host,
		mode: s_mode,
	} = yargs
		.string('content_type')
		.string('host')
		.string('mode')
		.argv;

	let g_content_type = h_content_types[s_content_type];
	if(!g_content_type) throw new Error(`no such content-type: ${s_content_type}`);

	let h_modes = g_content_type.candidates[s_host];
	if(!h_modes) throw new Error(`no such host '${s_host}' for content-type: ${s_content_type}`);

	let gc_mode = h_modes[s_mode];
	if(!gc_mode) throw new Error(`no such mode '${s_mode}' for host '${s_host}' with content-type: ${s_content_type}`);

	for(let g_target of targets({
		content_type: s_content_type,
		host: s_host,
		mode: s_mode,
	})) {
		process.stdout.end(g_target.candidate());
	}

	// for(let g_target of targets()) {
	// 	fs.writeFileSync(`${g_target.id}.js`, g_target.candidate({
	// 		base_iri: 'http://downloads.dbpedia.org/2016-10/core-i18n/en/article_templates_en.ttl',
	// 	}));
	// }
}
else {
	module.exports = {
		targets,
	};
}
