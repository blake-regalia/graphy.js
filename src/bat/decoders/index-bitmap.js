
class index_bitmap {
	constructor(kbd) {

		// which index
		let s_index = kbd.ntu8_string();

		// number of pairs
		let n_pairs = kbd.vuint();

		// number of triples
		let n_triples = kbd.vuint();

		// pairs adjacency list
		let at_adj_a_b = kbd.typed_array();

		// triples adjacency list
		let at_adj_ab_c = kbd.typed_array();

		// pairs bitsequence
		let at_bs_a_b = kbd.sub((n_pairs + 7) >> 3);

		// triples bitsequence
		let at_bs_ab_c = kbd.sub((n_triples + 7) >> 3);

		// redundancy checks
		if(n_pairs !== at_adj_a_b.length || n_triples !== at_adj_ab_c.length) {
			throw new Error('quad bitmap lengths do not match. fatal read error');
		}

		debugger;
	}
}

module.exports = index_bitmap;
