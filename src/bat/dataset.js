const bkit = require('bkit');

const bat = require('./bat.js');

const A_EXPORTERS = [
	require('./decoders/chapter-front-coded.js'),
	require('./decoders/dataset.js'),
	require('./decoders/dictionary-thirteen-chapter.js'),
];

let h_decoders = {};

for(let g_export of A_EXPORTERS) {
	let h_export_decoders = g_export.decoders;
	for(let pe_decoder in h_export_decoders) {
		h_decoders[pe_decoder.slice(0, -1)] = h_export_decoders[pe_decoder];
	}
}

class dataset {
	constructor(at_payload) {
		let kbd = new bkit.buffer_decoder(at_payload);
		let k_container = new bat.container_decoder(kbd);
		let g_child = k_container.child();

		if(!g_child) {
			throw new Error('empty container');
		}
		else {
			let {
				encoding: pe_child,
				payload: at_child,
			} = g_child;

			if(pe_child in h_decoders) {
				let k_child = new h_decoders[pe_child](at_child);
				debugger;
			}
			else {
				throw new Error('automatic container resolve not yet implemented');
			}
		}
	}
}

module.exports = dataset;
