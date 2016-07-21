const child_process = require('child_process');

const R_TIME = /[gn]: (.+)ms\n/;
const N_TRIALS = 10;

let h_tests = {
	nt: [
		'persondata_en.nt',
	],
	nq: [
		'instance-types_en.nq',
		'article-categories_en.nq',
	],
	ttl: [
		'redirects_en.ttl',
		'persondata_en.ttl',
	],
	trig: [

	],
};

function run(s_program, s_flavor, s_file) {
	let h_return = child_process.spawnSync('node', [`./${s_program}-${s_flavor}.js`, `./data/${s_file}`], {
		encoding: 'utf8',
	});
	let m_time = R_TIME.exec(h_return.stdout);
	if(!m_time) {
		if(h_return.stderr) {
			console.log('stderr: '+h_return.stderr);
		}
		throw 'failed to parse '+h_return.stdout;
	}
	return parseFloat(m_time[1]);
}

for(let s_flavor in h_tests) {
	h_tests[s_flavor].forEach((s_file) => {
		let x_n3_best = Infinity;
		for(let i=0; i<N_TRIALS; i++) {
			let x_time = run('n3', s_flavor, s_file);
			if(x_time < x_n3_best) {
				x_n3_best = x_time;
			}
			console.log(`n3.js-${s_flavor} ./${s_file}: ${x_time}`);
		}
		console.log('='.repeat(30));
		console.log(`n3.js-${s_flavor} ./${s_file}: ${x_n3_best}\n`);

		let x_graphy_best = Infinity;
		for(let i=0; i<N_TRIALS; i++) {
			let x_time = run('graphy', s_flavor, s_file);
			if(x_time < x_graphy_best) {
				x_graphy_best = x_time;
			}
			console.log(`graphy-${s_flavor} ./${s_file}: ${x_time}`);
		}
		console.log('='.repeat(30));
		console.log(`graphy-${s_flavor} ./${s_file}: ${x_graphy_best}\n`);

	});
}
