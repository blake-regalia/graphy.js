
// debugger;
// console.log(arguments);

const worker = require('worker').scopify(require, {
	arguments: 'undefined' !== typeof arguments? arguments: null,
	workers: () => {
		require('./workers/bat-creator.js');
	},
	subworkers: () => {
		require('./workers/encoder.js');
	},
});

// const graphy = require('../main/graphy.js');
// const bat = require('./bat.js');


class creator {
	static from_blob(dfb_input, h_config={}) {
		let k_worker = worker.spawn('./workers/bat-creator.js');

		let k_stream = worker.stream();
		k_worker.run({
			task: 'load',
			args: [h_config.mime, k_stream.other_port],
			transfer: [k_stream.other_port],
		}, () => {
			debugger;
			console.log('done');
		});
		k_stream.blob(dfb_input);
	}
}



module.exports = creator;
