
const creator = require('./creator');

const create_bat = (ab_input, h_config) => {
	let k_creator = new creator();
	k_creator.load(ab_input);
};

module.exports = {
	create(z_input, h_config) {
		// array buffer
		if(z_input instanceof ArrayBuffer) {
			create_bat(z_input, h_config);
		}
		// file input
		else if(z_input instanceof File) {
			// use file reader
			let dfr = new FileReader();

			// once it loads; pass array buffer to creator
			dfr.addEventListener('loadend', (ab_input) => {
				create_bat(ab_input, h_config);
			});

			dfr.readAsArrayBuffer();
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
