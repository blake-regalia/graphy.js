const stream = require('stream');

const dataset = require('./dataset.js');
const creator = require('./creator.js');
const serializer = require('./serializer.js');

const store = require('@graphy/store');

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

		this.on('finish', async () => {
			let k_serializer = new serializer(k_creator);

			let at_dataset = await k_serializer.buffer();

			let k_dataset = new dataset(at_dataset);

			debugger;
			k_dataset
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
