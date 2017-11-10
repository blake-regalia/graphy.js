
const R_IRI_ENCODING = /^(.*)#(.*)$/;
class container_decoder {
	constructor(kbd) {
		this.buffer_decoder = kbd;
	}

	child() {
		let kbd = this.buffer_decoder;

		let [, p_encoding, s_label] = R_IRI_ENCODING.exec(kbd.ntu8_string());
		let n_payload_bytes = kbd.vuint();
		let at_payload = kbd.sub(n_payload_bytes);

		return {
			encoding: p_encoding,
			label: s_label,
			payload: at_payload,
		};
	}

	finished() {
		return this.buffer_decoder.
	}
}

module.exports = {
	container_decoder,
};
