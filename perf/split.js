const fs = require('fs');
const cp = require('child_process');
const util = require('util');
const cp_exec = util.promisify(cp.exec);

const H_FORMAT_MAPPINGS = {
	ttl: ['nt', 'ttl'],
	trig: ['nq', 'trig'],
};

async function exec(s_cmd) {
	console.warn('$ '+s_cmd);
	await cp_exec(s_cmd);
}

(async() => {
	let p_master = process.argv[2];
	let s_format_in = /\.([^.]+)$/.exec(p_master)[1];
	let s_name = p_master.slice(0, -(s_format_in.length+1));

	fs.mkdirSync(s_name, {
		recursive: true,
	});

	for(let s_format_out of H_FORMAT_MAPPINGS[s_format_in]) {
		for(let i_million=1; i_million<=8; i_million++) {
			await exec(/* syntax: bash */ `
				npx graphy-dev read -c ${s_format_in}
					/ head ${i_million}e6
					/ scribe -c ${s_format_out}
					< ${p_master}
					> "${s_name}/sample-${i_million}M.${s_format_out}"
			`.trim().replace(/\s*(\n\s*)+/g, ' '));
		}
	}
})();
