const fs = require('fs');
const {
	once,
} = require('events');

const {
	CanvasRenderService,
} = require('chartjs-node-canvas');

const {
	H_PARTIES,
} = require('./all.js');

let a_bench = require(process.argv[2] || './build/bench.json');

const H_FLAVORS = {
	nt: 'N-Triples',
	nq: 'N-Quads',
	ttl: 'Turtle',
	trig: 'TriG',
	'nt-ttl': 'N-Triples => Turtle',
	'ttl-nt': 'Turtle => N-Triples',
};

const H_DESCRIBE = {
	nt: 'N-Triples as input',
	nq: 'N-Quads as input',
	ttl: 'Turtle as input',
	trig: 'TriG as input',
	'nt-ttl': 'N-Triples as input => Turtle as output',
	'ttl-nt': 'Turtle as input => N-Triples as output',
};

const quads = p => (+p.replace(/^.*(\d+)M\.\w+$/, '$1')) * 1e6;

const H_TRANSFORM = {
	// elapsed: (h, si) => h? h[si].avg / 1000: Infinity,
	elapsed: (g, si) => g.summary? (quads(g.input) / g.summary[si].avg): Infinity,
	memory: (g, si) => g.summary? g.summary[si].avg / 1024 / 1024: Infinity,
};

const H_COLORS = {
	'graphy/default': 'rgba(0, 127, 0 1)',
	'graphy/relaxed': 'rgba(0, 0, 127, 1)',
	'graphy/scan.2': 'rgb(102, 102, 255)',
	'graphy/scan.4': 'rgb(153, 153, 255)',
	'graphy/scan.8': 'rgb(153, 102, 255)',
	'graphy/scan.16': 'rgb(204, 102, 255)',
	'graphy/load': 'rgb(216, 60, 255)',
	'N3/default': 'rgba(127, 0, 0, 1)',
};

const H_REVIEWS = {
	// elapsed: 'Time Elapsed (s)',
	elapsed: 'Velocity (Quads/ms)  ▲=👍',
	memory: 'Memory Usage (MiB)  ▼=👍',
};

const H_SOURCES = {
	'data/wikidata': 'Wikidata Data Dump',
	'data/persondata_en': 'DBpedia "Person Data" Dump',
};

const H_COMPARE = {
	count: {
		info: 'Count the number of statements in an RDF document.',
	},

	distinct: {
		info: 'Count the distinct number of triples/quads in an RDF document.',
	},

	convert: {
		info: 'Convert an RDF document from one serialization format to another.',
	},
};

const gobble = (s_text, s_indent='') => {
	let m_pad = /^(\s+)/.exec(s_text.replace(/^([ \t]*\n)/, ''));
	if(m_pad) {
		return s_indent+s_text.replace(new RegExp(`\\n${m_pad[1]}`, 'g'), '\n'+s_indent.trim()).trim();
	}
	else {
		return s_indent+s_text.trim();
	}
};


async function render(si_chart, g_opt={}) {
	let x_width = 600;
	let x_height = 400;

	let xs_scale = 0.8;
	x_width = Math.round(x_width * xs_scale);
	x_height = Math.round(x_height * xs_scale);

	const gc_chart = {
		type: 'line',
		...g_opt,
		options: {
			legend: {
				labels: {
					fontColor: 'black',
					fontSize: 16,
					fontStyle: 'bold',
					boxWidth: 12,
				},
			},
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
					},
				}],
			},
		},
	};

	let pr_img = `chart/${si_chart}.png`;

	const y_service = new CanvasRenderService(x_width, x_height, (ChartJS) => {
		ChartJS.plugins.register({
			beforeDraw(y_chart) {
				let y_ctx = y_chart.ctx;
				y_ctx.fillStyle = '#ffffff';
				y_ctx.fillRect(0, 0, x_width, x_height);
			},
		});
	});

	let ds_test = y_service.renderToStream(gc_chart)
		.pipe(fs.createWriteStream(`./${pr_img}`));

	await once(ds_test, 'finish');

	return pr_img;
}

const proper = s => s[0].toUpperCase()+s.slice(1);

async function* r() {
	for(let [si_task, g_task] of Object.entries(H_COMPARE)) {
		let a_tests_task = a_bench.filter(g => si_task === g.task);

		let a_flavors = [...new Set(a_tests_task.map(g => g.flavor))];
		let a_parties = [...new Set(a_tests_task.map(g => g.party))];

		yield gobble(`
			------------

			## ${proper(si_task)} Task
			${g_task.info}

			**Test Flavors:**
			${a_flavors.map(s_flavor => ` - With [${H_DESCRIBE[s_flavor]}](#test_${si_task}_${s_flavor})`).join('\n')}
		`)+'\n\n';

		for(let s_flavor of a_flavors) {
			let a_tests_flavor = a_tests_task.filter(g => s_flavor === g.flavor);

			let a_sources = [...new Set(a_tests_flavor.map(g => g.input.replace(/\/[^/]+$/, '')))];

			yield gobble(`
				<a name="#test_${si_task}_${s_flavor}" />

				### ${proper(si_task)} Task With ${H_DESCRIBE[s_flavor]}

			`)+'\n';

			for(let s_source of a_sources) {
				let a_tests_source = a_tests_flavor.filter(g => g.input.startsWith(s_source))
					.sort((g_a, g_b) => g_a.input.localeCompare(g_b.input));

				let s_label = s_source.replace(/^data\//g, '').replace(/\//g, '-');

				let a_reviews = [
					...new Set(a_tests_source
						.filter(g => g.summary)
						.map(g => Object.keys(g.summary)).flat()),
				];

				yield gobble(`
					Input File: ${H_SOURCES[s_source]}
				`)+'\n';

				let s_table = gobble(`
					${a_reviews.map(s_review => H_REVIEWS[s_review]).join(' | ')}
					:---:|:---:
				`)+'\n';

				let a_cells = [];

				for(let s_review of a_reviews) {
					let g_groups = {};
					for(let g_test of a_tests_source) {
						let si_test = `${g_test.party}/${g_test.mode}`;
						(g_groups[si_test] = g_groups[si_test] || {
							data: [],
							label: si_test.replace(/\/default$/, '')+'  ',
							backgroundColor: 'rgba(0, 0, 0, 0)',
							borderColor: H_COLORS[si_test],
							borderWidth: 1.5,
						}).data.push(H_TRANSFORM[s_review](g_test, s_review));
					}

					let si_chart = `${si_task}_${s_flavor}_${s_label}_${s_review}`;

					let pr_img = await render(si_chart, {
						data: {
							labels: [
								...new Set(a_tests_source.map(g => g.input.replace(/^.*-([^-.]+)\.[^.]+$/, '$1'))),
							],
							datasets: Object.values(g_groups),
						},
					});

					a_cells.push(gobble(`
						![Performance Review of ${s_review} for ${si_task} Task with ${H_DESCRIBE[s_flavor]}](${pr_img})
					`));
				}

				yield s_table+a_cells.join(' | ')+'\n';
			}
		}
	}
}

(async() => {
	console.log(gobble(`
		# Performance Benchmarks

		This document plots the results of a series of performance benchmarks in order to compare the performance of \`graphy\` against other libraries as well as against itself (using different modes/options). The benchmarks demonstrate a few select task objectives designed to simulate real-world scenarios.

		Want to see how other libraries stack up? Feel free to [open an issue](https://github.com/blake-regalia/graphy.js/issues).


		## Interpretting the Charts
		 - Each data point in the following charts represents the mean value of 5 trials.
		 - The **X-axis units** for all charts are in **Millions of Quads**, and correspond to the number of triples/quads fed into the process via stdin
		 - The **Y-axis for each 'Velocity' chart** denotes the number of **Quads per millisecond (Quads/ms)** at which the task objective completed.


		## Disclaimers
		 - Memory-intensive tasks were run with the \`--max-old-space-size=8192\` node.js option (e.g., the [distinct task](#distinct-task)). Some charts show a non-linear progression in time due to the fact that V8's GC starts aggressively trying to free up memory.
		 - Memory usage represents the resident stack size (RSS) at the moment the results are reported.
		 - All Turtle input files are using prefixed names for identifiers when possible.


		There are multiple modes for \`graphy\`:
		  - the default mode, which means that validation is enabled for reading
		  - ['relaxed' mode](https://graphy.link/content.textual#config_read-no-input), which skips validation for faster reading
		  - ['scan' mode](https://graphy.link/content.textual#verb_scan), which uses multiple threads (2, 4, 8 or 16 in these trials) to read the input stream


		## Competitors
		${Object.entries(H_PARTIES).reduce((s_out, [, g_party]) => s_out
			+` - [${g_party.label}](${g_party.href}) v${g_party.version}\n`, '')}

		## Task Objectives
		${[...new Set(a_bench.map(g => g.task))].map(s => ` - [${proper(s)} Task](#${s}-task) -- ${H_COMPARE[s].info}`).join('\n')}

		<p align="center">⬇️&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⬇️&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;⬇️</p>
	`)+'\n');
	for await (let s_chunk of r()) {
		console.log(s_chunk);
	}
})();
