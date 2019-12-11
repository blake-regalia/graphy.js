const fs = require('fs');
const {
	once,
} = require('events');

const {
	CanvasRenderService,
} = require('chartjs-node-canvas');

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
	'nt-ttl': 'N-Triples as input and Turtle as output',
	'ttl-nt': 'Turtle as input and N-Triples as output',
};

const H_TRANSFORM = {
	elapsed: (h, si) => h? h[si].avg / 1000: Infinity,
	memory: (h, si) => h? h[si].avg / 1024 / 1024: Infinity,
};

const H_COLORS = {
	'graphy/default': 'rgba(0, 127, 0 1)',
	'graphy/relaxed': 'rgba(0, 0, 127, 1)',
	'n3/default': 'rgba(127, 0, 0, 1)',
};

const H_REVIEWS = {
	elapsed: 'Time Elapsed (s)',
	memory: 'Memory Usage (MiB)',
};

const H_PARTIES = {
	graphy: 'graphy.js',
	n3: 'N3.js',
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
	const configuration = {
		type: 'line',
		...g_opt,
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero: true,
					},
				}],
			},
		},
	};
	const canvasRenderService = new CanvasRenderService(x_width, x_height, (ChartJS) => { });
	// const image = await canvasRenderService.renderToBuffer(configuration);
	// const dataUrl = await canvasRenderService.renderToDataURL(configuration);

	let ds_test = canvasRenderService.renderToStream(configuration)
		.pipe(fs.createWriteStream(`./chart/${si_chart}.png`));

	await once(ds_test, 'finish');
}

async function* r() {
	for(let [si_task, g_task] of Object.entries(H_COMPARE)) {
		let a_tests_task = a_bench.filter(g => si_task === g.task);

		let a_flavors = [...new Set(a_tests_task.map(g => g.flavor))];
		let a_parties = [...new Set(a_tests_task.map(g => g.party))];

		yield gobble(`
			## Task: ${si_task}
			${g_task.info}

			**Tests:**
			${a_flavors.map(s_flavor => ` - [${H_FLAVORS[s_flavor]}](#test_${si_task}_${s_flavor})`).join('\n')}
		`)+'\n\n';

		for(let s_flavor of a_flavors) {
			let a_tests_flavor = a_tests_task.filter(g => s_flavor === g.flavor);

			let a_sources = [...new Set(a_tests_flavor.map(g => g.input.replace(/\/[^/]+$/, '')))];

			yield gobble(`
				<a name="#test_${si_task}_${s_flavor}" />

				### Test: ${si_task} / ${s_flavor}
				The ${si_task} task with ${H_DESCRIBE[s_flavor]}.
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
					**Input File: ${H_SOURCES[s_source]}**
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
							label: si_test,
							backgroundColor: 'rgba(0, 0, 0, 0)',
							borderColor: H_COLORS[si_test],
							borderWidth: 1.5,
						}).data.push(H_TRANSFORM[s_review](g_test.summary, s_review));
					}

					let si_chart = `${si_task}_${s_flavor}_${s_label}_${s_review}`;

					a_cells.push(gobble(`
						![Performance Review of ${s_review} for ${si_task} Task with ${H_DESCRIBE[s_flavor]}](build/chart/${si_chart}.png)
					`));

					await render(si_chart, {
						data: {
							labels: [
								...new Set(a_tests_source.map(g => g.input.replace(/^.*-([^-.]+)\.[^.]+$/, '$1'))),
							],
							datasets: Object.values(g_groups),
						},
					});
				}

				yield s_table+a_cells.join(' | ')+'\n';
			}
		}
	}
}

(async() => {
	console.log(gobble(`
		# Performance Benchmarks
		The following diagrams plot the mean value of 5 trials for each data point.

		The X-axis units are in Millions of Quads, and correspond to the number of triples/quads fed into the process via stdin.
	`));
	for await (let s_chunk of r()) {
		console.log(s_chunk);
	}
})();
