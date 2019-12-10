const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const json_stream = require('JSONStream');

const N_TRIALS = process.env.PERF_TRIALS || 1;

const {
	H_PARTIES,
} = require('./all.js');

function run(s_exec, a_args, p_out='/dev/null') {
	return new Promise((fk_resolve, fe_resolve) => {
		console.warn(`$ ${s_exec} ${a_args.join(' ')} > ${p_out}`);

		let u_proc = cp.spawn(s_exec, a_args, {
			stdio: [
				'ignore',
				fs.openSync(p_out, 'w'),
				process.stderr,
			],
		});

		u_proc.on('error', fe_resolve);

		u_proc.on('close', () => {
			fk_resolve();
		});
	});
}

function test(p_runner, p_input, a_options=[]) {
	return new Promise((fk_resolve, fe_resolve) => {
		console.warn(`$ node ${a_options.map(s => s+' ').join('')}${p_runner} < ${p_input}`);

		let u_proc = cp.spawn('node', [...a_options, p_runner], {
			stdio: [
				fs.openSync(p_input, 'r'),
				'ignore',
				'pipe',
			],
		});

		u_proc.on('error', fe_resolve);

		let s_parse = '';
		u_proc.stderr.on('data', (s_chunk) => {
			s_parse += s_chunk;
		});

		u_proc.on('close', () => {
			let g_parse;
			try {
				g_parse = JSON.parse(s_parse);
			}
			catch(e_parse) {
				fe_resolve(s_parse);
			}

			fk_resolve(g_parse);
		});
	});
}

function stat(a_trials, h_props) {
	let nl_trials = a_trials.length;
	let g_summary = {};

	for(let [si_prop, g_prop] of Object.entries(h_props)) {
		let x_sum = 0;
		let x_min = Infinity;
		let x_max = -Infinity;

		for(let g_trial of a_trials) {
			let x_value = g_trial[si_prop];

			x_sum += x_value;

			x_min = Math.min(x_min, x_value);

			x_max = Math.max(x_max, x_value);
		}

		let x_avg = x_sum / nl_trials;

		g_summary[si_prop] = {
			avg: x_avg,
			min: x_min,
			max: x_max,
			std: Math.sqrt(
				a_trials.map(g => Math.pow(g[si_prop]-x_avg, 2))
					.reduce((c, x) => c+x, 0)
				/ nl_trials),
		};
	}

	return g_summary;
}

(async() => {
	let ds_out = json_stream.stringify();

	ds_out.pipe(process.stdout);

	let a_perfs = [];

	for(let [si_party, g_party] of Object.entries(H_PARTIES)) {

		for(let [si_task, h_flavors] of Object.entries(g_party.tasks)) {

			let p_src = `src/party/${si_party}/${si_task}.js.jmacs`;

			for(let [s_flavor, g_flavor] of Object.entries(h_flavors)) {
				let a_inputs = g_flavor.inputs;
				let a_options = g_flavor.options;

				for(let [si_mode, h_env] of Object.entries(g_flavor.modes)) {
					let p_runner = `build/party/${si_party}/${si_task}/${s_flavor}/${si_mode}.js`;

					// mkdirp
					fs.mkdirSync(path.dirname(p_runner), {
						recursive: true,
					});

					// compile runner
					await run('npx', ['jmacs', '-g', JSON.stringify(h_env), p_src], p_runner);

					// each input
					for(let p_input of a_inputs) {
						// 
						let s_fail = null;
						let a_trials = [];

						// each trial
						for(let i_trial=0; i_trial<N_TRIALS; i_trial++) {

							let g_test;
							try {
								g_test = await test(p_runner, p_input, a_options);
							}
							catch(s_test) {
								s_fail = s_test;
								break;
							}

							a_trials.push(g_test);

							// console.warn(`node ${p_runner} < ${p_input}`);
						}

						// fail
						if(s_fail) {
							console.warn(`Failed: ${s_fail}`);
							ds_out.write({
								party: si_party,
								task: si_task,
								flavor: s_flavor,
								mode: si_mode,
								input: p_input,
								error: s_fail,
							});

							continue;
						}

						// summarize
						let g_summary = stat(a_trials, {
							elapsed: {},
							memory: {},
						});

						console.warn(JSON.stringify(g_summary, null, '\t'));

						ds_out.write({
							party: si_party,
							task: si_task,
							flavor: s_flavor,
							mode: si_mode,
							input: p_input,
							results: a_trials[0].results,
							summary: g_summary,
						});
					}
				}
			}
		}
	}

	// console.log(JSON.stringify(a_perfs, null, '\t'));
	ds_out.end();
})();
