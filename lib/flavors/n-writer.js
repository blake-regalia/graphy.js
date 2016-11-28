/* eslint-disable */

@ // possible mode types for this file are:
@ // NT: N-Triples
@ // NQ: N-Quads

class nt_writer {
	__construct(h_config) {

	}

	write() {
		this.out.write(k_quad.toNT()+'\n');
	}
};

module.exports = nt_writer;
