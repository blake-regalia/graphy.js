
const worker = require('worker').scopify(require, {
	arguments: 'undefined' !== typeof arguments? arguments: null,
	workers: () => {
		require('./workers/serializer.js');
	},
	subworkers: () => {
		require('./workers/encoder.js');
	},
});

function from_blob(dfb_input, h_config={}) {
	let k_worker = worker.spawn('./workers/serializer.js');
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
	}, (p_output) => {
		console.log('done');
		h_config.ready(p_output);
	});

	k_stream.blob(dfb_input);
}

// function from_blob_transfer(dfb_input, h_config={}) {
// 	let k_worker = worker.spawn('./workers/bat-loader.js');

// 	let p_blob_input = URL.createObjectURL(dfb_input);
// 	k_worker.run({
// 		task: 'load',
// 		args: [h_config.mime, p_blob_input],
// 	}, () => {
// 		debugger;
// 		console.log('done');
// 	});
// }

module.exports = {
	create(z_input, h_config) {
		// blob
		if(z_input instanceof Blob) {
			return from_blob(z_input, h_config);
		}
		// stream
		else if('setEncoding' in z_input) {
			throw new Error('cannot use readable stream to create BAT file because it needs to make more than one pass over the input file');
		}
		// something else
		else {
			throw new Error('not sure what you tried to pass as input but it is not going to fly');
		}
	},
};

