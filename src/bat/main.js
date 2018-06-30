const stream = require('stream');

const bkit = require('bkit');

const bat = require('./bat.js');
const creator = require('./creator.js');
const serializer = require('./serializer.js');

// const store = require('@graphy/store');

class bat_store extends stream.Writable {
	constructor(g_config={}) {
		super({
			objectMode: true,
		});

		let k_creator = new creator();

		Object.assign(this, {
			creator: k_creator,
			ready: g_config.ready,
		});

		this.on('finish', async() => {
			debugger;
			let k_serializer = new serializer(k_creator);

			let at_serialized = await k_serializer.buffer();

			// create buffer decoder to read serialized data
			let kbd = new bkit.buffer_decoder(at_serialized);

			// instantiate bat decoders
			let k_decoders = new bat.decoders();

			// dataset contained
			let k_dataset;

			// read
			let a_decode;
			while((a_decode = k_decoders.auto_what(kbd))) {
				let [k_item, pe_item] = a_decode;
				if(bat.PE_DATASET_PG === pe_item) {
					// already loaded a dataset
					if(k_dataset) {
						throw new Error('multiple datasets contained ');
					}
					else {
						k_dataset = k_item;
					}
				}
				else {
					throw new Error(`root container encoding <${pe_item}> was not expected`);
				}
			}

			// prepare store on dataset
			debugger;
		});
	}

	_write(g_quad, s_encoding, fk_write) {
		this.creator.save_triple(g_quad);
		fk_write();
	}

	_writev(a_quads, fk_write) {
		let k_creator = this.creator;
		for(let g_quad of a_quads) {
			k_creator.save_triple(g_quad);
		}

		fk_write();
	}
}


module.exports = {
	store(...a_args) {
		return new bat_store(...a_args);
	},
};
