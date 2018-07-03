
class index_adjacency {
	constructor(kbd) {

		let s_index = kbd.ntu8_string();

		// number of triples
		let n_triples = kbd.vuint();

		// adjacency list
		let at_adj_a_b = kbd.typed_array();

		// bitsequence
		let at_bs_a_b = kbd.grab((n_triples + 7) >> 3);

		// redundancy checks
		if(n_triples !== at_adj_a_b.length) {
			throw new Error('quad adjacency list lengths do not match. fatal read error');
		}

		debugger;
	}
}

module.exports = index_adjacency;
