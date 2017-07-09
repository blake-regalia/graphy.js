/* eslint-disable */
const serializer = require('../main/serializer.js');


class nt_serializer extends serializer.human {
	constructor(h_config) {
		super(h_config, serializer.triples);

		// n3 node
		this.n3_node = this.n3_node_verbose;
	}

	from_term(h_term) {
		return h_term.verbose();
	}

	data(k_leaf, s_object) {
		this.out.write(`${k_leaf.parent.term} ${k_leaf.term} ${s_object} .`);
	}
};

module.exports = nt_serializer;