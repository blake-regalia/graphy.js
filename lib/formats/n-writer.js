/* eslint-disable */
const serializer = require('../main/serializer.js');

@ // possible mode types for this file are:
@ // NT: N-Triples
@ // NQ: N-Quads

class nt_serializer extends serializer.human {
	construct(h_config) {
		super(h_config, serializer.triples);

		// n3 node
		this.n3_node = this.n3_node_verbose;
	}

	from_term(h_term) {
		return h_term.verbose();
	}

	data(k_leaf, s_object) {
		@if QUADS
			let k_parent = k_leaf.parent;
			this.out.write(`${k_parent.term} ${k_leaf.term} ${s_object} ${k_parent.parent.term} .`);
		@else
			this.out.write(`${k_leaf.parent.term} ${k_leaf.term} ${s_object} .`);
		@end
	}
};

module.exports = nt_serializer;
