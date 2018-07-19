const bat = require('bat');
const bkit = require('bkit');

const encoder_bitsequence = require('./bitsequence-plain.js');

module.exports = class bitmap_ab {
	constructor(g_config) {
		Object.assign(this, g_config);
	}

	close() {
		// payload components
		let {
			key_count: nl_keys,
			adjacency_list: at_adj,
			bitsequence: atu8_bs,
		} = this;

		// payload size estimate
		let nb_payload = Math.log2(nl_keys) + 1 + at_adj.byteLength + atu8_bs.byteLength;

		// create payload
		let kbe_payload = new bkit.buffer_encoder({size:nb_payload});

		// write to payload: key count
		kbe_payload.vuint(nl_keys);

		// write to payload: adjacency list
		kbe_payload.typed_array(at_adj);

		// encode bitsequence
		let ke_bs = new encoder_bitsequence({
			raw: atu8_bs,
		});

		// write to payload: bitsequence
		kbe_payload.buffer.append(ke_bs.close());

		// serialize payload
		let at_payload = kbe_payload.close();


		// create section header
		let kbe_header = new bkit.buffer_encoder({size:512});

		// encoding scheme
		kbe_header.ntu8_string(bat.PE_DATASET_QUADS_TRIPLES_BITMAP_AB);

		// payload byte count
		kbe_header.vuint(at_payload.byteLength);

		// serialize header
		let at_header = kbe_header.close();


		// estimate bundle size
		let nb_bundle = at_header.byteLength + at_payload.byteLength;

		// create bundle
		let kbw_bundle = new bkit.buffer_writer({size:nb_bundle});

		// write to bundle: header
		kbw_bundle.append(at_header);

		// write to bundle: payload
		kbw_bundle.append(at_payload);

		// serialize bundle
		return kbw_bundle.close();
	}
};
