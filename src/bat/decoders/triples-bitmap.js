
class triples_bitmap {
	constructor(kbd) {

		// which index
		let s_index = kbd.ntu8_string();

		// number of pairs
		let n_pairs = kbd.vuint();

		// number of triples
		let n_triples = kbd.vuint();

		// pairs adjacency list
		let at_adj_a_b = kbd.sub(n_pairs);

		// pairs bitsequence
		let at_bs_a_b = kbd.sub(Math.ceil(n_pairs / 8));

		// triples adjacency list
		let at_adj_ab_c = kbd.sub(n_triples);

		// triples bitsequence
		let at_bs_ab_c = kbd.sub(Math.ceil(n_triples / 8));

		debugger;
	}
}

module.exports = triples_bitmap;
