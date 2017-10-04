
// debugger;
// console.log(arguments);

const worker = require('worker').scopify(require, {
	arguments: 'undefined' !== typeof arguments? arguments: null,
	workers: () => {
		require('./workers/bat-loader.js');
	},
	subworkers: () => {
		require('./workers/encoder.js');
		require('./workers/parse.js');
	},
});

// const graphy = require('../main/graphy.js');
// const bat = require('./bat.js');


class creator {
	static from_blob(dfb_input, h_config={}) {
		let k_worker = worker.spawn('./workers/bat-loader.js');
		let n_bytes_total = dfb_input.size;

		let k_stream = worker.stream();
		k_worker.run({
			task: 'load',
			args: [h_config.mime, k_stream.other_port],
			transfer: [k_stream.other_port],
			events: {
				progress(h_progress) {
					let {
						bytes: n_bytes_consumed,
						triples: n_triples,
					} = h_progress;

					console.info(`${(100*(n_bytes_consumed / n_bytes_total)).toFixed(2).toLocaleString()}% read; ${n_triples.toLocaleString()} triples parsed`);
				},
			},
		}, () => {
			debugger;
			console.log('done');
		});
		k_stream.blob(dfb_input);
	}

	static from_blob_transfer(dfb_input, h_config={}) {
		let k_worker = worker.spawn('./workers/bat-loader.js');

		let p_blob_input = URL.createObjectURL(dfb_input);
		k_worker.run({
			task: 'load',
			args: [h_config.mime, p_blob_input],
		}, () => {
			debugger;
			console.log('done');
		});
	}
}



module.exports = creator;
