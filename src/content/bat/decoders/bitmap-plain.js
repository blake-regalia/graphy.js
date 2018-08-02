
module.exports = dc_super => class bitmap_ab extends dc_super {
	count_keys() {
		return this.key_count;
	}

	* ids_offsets(i_a) {
		// adjacency lists of `b` data
		let at_adj = this.adj;

		// bitsequence-a
		let k_bs = this.bs;

		// offset of `b` within adjacency list
		let c_off = 0;

		// position of where `b` adjacency list starts/ends
		let [i_adj_top, i_adj_end] = k_bs.rank_lo_hi(i_a);  // idx[i_a-1], idx[i_a]

		// each `b` in adjacency list
		let i_adj = i_adj_top;
		do {
			// yield id and offset
			yield {
				id: at_adj[i_adj],
				offset: i_adj - i_adj_top,
			};
		} while(++i_adj < i_adj_end);
	}

	* ids(i_a) {
		let at_adj = this.adj;
		let k_bs = this.bs;

		// position where `b` adjacency list starts/ends
		let [i_adj, i_adj_end] = k_bs.rank_lo_hi(i_a);

		// each `c` in adjacency list
		do {
			// fetch/yield `c` id
			yield at_adj[i_adj];
		} while(++i_adj < i_adj_end);
	}
};
