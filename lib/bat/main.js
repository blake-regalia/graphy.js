
const creator = require('./creator');

module.exports = {
	create(z_input, h_config) {
		// blob
		if(z_input instanceof Blob) {
			return creator.from_blob(z_input, h_config);
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
