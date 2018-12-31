const fs = require('fs');
const cp = require('child_process');
const path = require('path');
const url = require('url');
const stream = require('stream');
const data = require('./data.js');

const N_SAMPLES = 1;
const X_SIZE_MAX = 800 * (1 << 20);  // 800 MiB

const map_tree = (h_tree, f_onto, a_path=[], a_out=[]) => {
	for(let s_key in h_tree) {
		let z_leaf = h_tree[s_key];

		if('function' === typeof z_leaf) {
			a_out.push(f_onto(z_leaf, a_path));
		}
		else if('object' === typeof z_leaf) {
			map_tree(z_leaf, f_onto, [...a_path, s_key], a_out);
		}
		else {
			throw new Error(`expected map_tree leaf node to be a function: ${z_leaf}`);
		}
	}

	return a_out;
};


let a_inputs = map_tree(data, (f_leaf, a_path) => {
	// let {
	// 	source: p_source_url,
	// } = f_leaf();
	let p_source_url = f_leaf();

	let s_source_host = a_path[a_path.length-1];
	let s_basename = path.basename((new url.URL(p_source_url)).pathname);

	let b_compressed = s_basename.endsWith('.bz2');
	s_basename = s_basename.replace(/(\.\w+)\.bz2$/, '$1');

	return {
		content_type: a_path[0],
		source_host: s_source_host,
		compressed: b_compressed,
		url: p_source_url,
		basename: s_basename,
	};
});


if(module === require.main) {
	let s_type = process.argv[2];
	let s_content_type = process.argv[3];
	let a_runners = process.argv.slice(4);

	let a_relevant = a_inputs.filter(g => s_content_type === g.content_type);
	let h_results = {};

	(async() => {
		for(let p_runner of a_runners) {
			console.warn(`runner: ${p_runner}`);

			let h_trials = h_results[p_runner] = {};
			for(let g_input of a_relevant) {
				let {
					source_host: s_source_host,
					basename: s_basename,
				} = g_input;

				let p_data = `build/cache/data/${s_source_host}/${s_basename}`;
				let d_stat = fs.statSync(p_data);

				if(d_stat.size > X_SIZE_MAX) {
					console.warn(`\tskipping large file '${p_data}'`);
					continue;
				}

				console.warn(`\t${p_data}...`);

				let a_samples = [];
				let g_trial = h_trials[p_data] = {
					size: d_stat.size,
					quads: null,
					samples: a_samples,
				};

				for(let i_sample=0; i_sample<N_SAMPLES; i_sample++) {
					try {
						let g_result = await new Promise((fk_resolve, fe_resolve) => {
							let u_runner = cp.spawn(process.execPath, [p_runner], {
								stdio: [
									fs.openSync(p_data),
									'pipe',
									'pipe',
								],
							});

							let s_stdout = '';
							let s_stderr = '';
							u_runner.stdout.on('data', s => s_stdout += s);
							u_runner.stderr.on('data', s => s_stderr += s);

							u_runner.on('exit', (xc_exit) => {
								if(xc_exit) {
									return fe_resolve(new Error(`runner '${path.basename(p_runner)}' failed to read '${path.basename(p_data)}' with non-zero exit code: ${xc_exit}\n${s_stderr}`));
								}

								try {
									return fk_resolve(JSON.parse(s_stdout));
								}
								catch(e_parse) {
									fe_resolve(new Error(`runner '${p_runner}' printed invalid JSON: '${s_stderr}'`));
								}
							});
						});

						if(!g_result.baseline) {
							if(null !== g_trial.quads) {
								if(g_result.quads !== g_trial.quads) {
									throw new Error(`quad count mismatch ${g_result.quads} != ${g_trial.quads}`);
								}
							}
							else {
								g_trial.quads = g_result.quads;
							}
						}

						a_samples.push({
							...g_result,
						});
					}
					catch(e_run) {
						console.error(e_run.stack);
						break;
					}
				}
			}
		}

		process.stdout.write(JSON.stringify(h_results, null, '\t'));
	})();
}
else {
	module.exports = {
		* inputs() {
			yield* a_inputs;
		},
	};
}
