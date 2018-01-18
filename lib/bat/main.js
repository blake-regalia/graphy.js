const worker = require('worker').scopify(require, () => {
	require('./workers/serializer.js');
}, 'undefined' !== typeof arguments && arguments);

function from_blob_stream(dfb_input, h_config={}) {
	let k_worker = worker.spawn('./workers/serializer.js');
	let n_bytes_total = dfb_input.size;

	// run load task on worker
	k_worker.run('load_stream', [h_config.mime, worker.stream(dfb_input)], {
		progress(h_progress) {
			let {
				bytes: n_bytes_consumed,
				triples: n_triples,
			} = h_progress;

			console.info(`${(100*(n_bytes_consumed / n_bytes_total)).toFixed(2).toLocaleString()}% read; ${n_triples.toLocaleString()} triples parsed`);
		},
	}).then((p_output) => {
		console.log('done');
		h_config.ready(p_output);
	});
}

function from_blob_transfer(dfb_input, h_config={}) {
	let k_worker = worker.spawn('./workers/serializer.js');

	let p_blob_input = URL.createObjectURL(dfb_input);
	k_worker.run('load_url', [h_config.mime, p_blob_input])
		.then((p_output) => {
			console.log('done');
			h_config.ready(p_output);
		});
}

module.exports = {
	create(z_input, h_config) {
		// blob
		if(z_input instanceof Blob) {
			return from_blob_stream(z_input, h_config);
			// return from_blob_transfer(z_input, h_config);
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

