@include 'store.builder-js'

class Triples {
	
}

class ContiguousAdjacencyListTriples {
	constructor(k_graph, s_a, s_b, s_c, at_idx_a_b, at_adj_a_b, at_idx_ab_c, at_adj_ab_c) {
		Object.assign(this, {
			graph: k_graph,
			a:s_a, b:s_b, c:s_c,

			// holds positions of `b` lists given `a`
			idx_a_b: at_idx_a_b,

			// holds `b` id given `a` key
			adj_a_b: at_adj_a_b,

			// // holds positions of `bc` lists given `a`
			// idx_a_bc: at_idx_a_bc,

			// holds positions of `c` lists given `ab`
			idx_ab_c: at_idx_ab_c,

			// holds `c` id given `ab` key
			adj_ab_c: at_adj_ab_c,
		});
	}


	/**
	* @returns `true` if adjacency list given by head id `a` and ab-offset `c_off_b` contains tail id given by `c`
	**/
	has_c(i_a, c_off_b, i_c) {
		// adjacency lists of `c` data
		let at_adj_ab_c = this.adj_ab_c;

		// index-a and index-ab
		let at_idx_a_b = this.idx_a_b;
		let at_idx_ab_c = this.idx_ab_c;

		// position of where `a` index list starts
		let i_idx_ab_c_top = at_idx_a_b[i_a-1];

		// position where `b` adjacency list starts/ends
		let i_lo = at_idx_ab_c[i_idx_ab_c_top+c_off_b];
		let i_hi = at_idx_ab_c[i_idx_ab_c_top+c_off_b+1];

		// values at those positions
		let x_lo = at_adj_ab_c[i_lo];
		let x_hi = at_adj_ab_c[i_hi];

		// binary search
		for(;;) {
			// target value out of bounds
			if(i_c < x_lo || i_c > x_hi) return false;

			// compute midpoint search index
			let i_mid = (i_lo + i_hi) >> 1;
			let x_mid = at_adj_ab_c[i_mid];

			// miss low
			if(x_mid < i_c) {
				i_lo = i_mid + 1;
				x_lo = at_adj_ab_c[i_lo];
			}
			// miss high
			else if(x_mid > i_c) {
				i_hi = i_mid - 1;
				x_hi = at_adj_ab_c[i_hi];
			}
			// hit!
			else {
				return true;
			}

			// indexes crossed; target not in list
			if(i_hi < i_lo) return false;
		}
	}

	/**
	* @returns offset of `b` within adjacency list or `-1` if not found
	**/
	find_b(i_a, i_b) {
		// adjacency lists of `b` data
		let at_adj_a_b = this.adj_a_b;

		// index-a
		let at_idx_a_b = this.idx_a_b;

		// position of where `a` adjacency list starts/ends
		let i_top = at_idx_a_b[i_a-1];
		let i_lo = i_top;
		let i_hi = at_idx_a_b[i_a]-1;

		// values of those positions
		let x_lo = at_adj_a_b[i_lo];
		let x_hi = at_adj_a_b[i_hi];

		// binary search
		for(;;) {
			// target value out of bounds
			if(i_b < x_lo || i_b > x_hi) return -1;

			// compute midpoint search index
			let i_mid = (i_lo + i_hi) >> 1;
			let x_mid = at_adj_a_b[i_mid];

			// miss low
			if(x_mid < i_b) {
				i_lo = i_mid + 1;
				x_lo = at_adj_a_b[i_lo];
			}
			// miss high
			else if(x_mid > i_b) {
				i_hi = i_mid - 1;
				x_hi = at_adj_a_b[i_hi];
			}
			// hit!
			else {
				// return offset accordingly
				return i_mid - i_top;
			}

			// indexes crossed; target not in list
			if(i_hi < i_lo) return -1;
		}
	}


	/**
	*
	**/
	*each_a() {
		let k_graph = this.graph;
		for(let i_a=1, n_a=k_graph.upper(this.a); i_a<n_a; i_a++) {
			yield i_a;
		}
	}


	/**
	*
	**/
	*each_b(i_a) {
		// adjacency lists of `b` data
		let at_adj_a_b = this.adj_a_b;

		// index-a
		let at_idx_a_b = this.idx_a_b;

		// offset of `b` within adjacency list
		let c_off_b = 0;

		// position of where `b` adjacency list starts/ends
		let i_adj_a_b_top = at_idx_a_b[i_a-1];
		let c_off_b_end = at_idx_a_b[i_a] - i_adj_a_b_top;

		// each `b` in adjacency list
		do {
			// fetch `b` id
			let i_b = at_adj_a_b[i_adj_a_b_top+c_off_b];

			// yield id and offset
			yield {
				id: i_b,
				offset: c_off_b,
			};
		} while(++c_off_b < c_off_b_end);
	}

	/**
	*
	**/
	*each_c(i_a, c_off_b) {
		// adjacency lists of `c` data
		let at_adj_ab_c = this.adj_ab_c;

		// index-a and index-ab
		let at_idx_a_b = this.idx_a_b;
		let at_idx_ab_c = this.idx_ab_c;

		// position of where `a` index list starts
		let i_idx_ab_c_top = at_idx_a_b[i_a-1];

		// position where `b` adjacency list starts/ends
		let i_adj_ab_c = at_idx_ab_c[i_idx_ab_c_top+c_off_b];
		let i_adj_ab_c_end = at_idx_ab_c[i_idx_ab_c_top+c_off_b+1];

		// each `c` in adjacency list
		do {
			// fetch/yield `c` id
			yield at_adj_ab_c[i_adj_ab_c];
		} while(++i_adj_ab_c !== i_adj_ab_c_end);
	}

	*each_bc(i_a) {
		for(let {id:i_b, offset:c_off_b} of this.each_b(i_a)) {
			for(let i_c of this.each_c(i_a, c_off_b)) {
				yield {
					b: i_b,
					c: i_c,
				};
			}
		}
	}

	shift_left() {
		let k_graph = this.graph;
		console.time('shift');

		let a_groups_b_ca = [];

		// refs
		let at_idx_a_b = this.idx_a_b;
		let at_adj_a_b = this.adj_a_b;
		let at_idx_ab_c = this.idx_ab_c;
		let at_adj_ab_c = this.adj_ab_c;

		//
		let nl_adj_b_c = 0;

		// each `a`
		for(let i_a of this.each_a()) {
			// each `b`
			for(let {id:i_b, offset:c_off_b} of this.each_b(i_a)) {
				// ref/create x_ca
				let h_groups_x_ca = a_groups_b_ca[i_b] = a_groups_b_ca[i_b] || {};

				// each `c`
				for(let i_c of this.each_c(i_a, c_off_b)) {
					// ref/create b_ya
					if(!h_groups_x_ca[i_c]) {
						h_groups_x_ca[i_c] = {
							[i_a]: 1,
						};

						// increment b_c size counter
						nl_adj_b_c += 1;
					}
					else {
						// push `a` to b_ya adjacency set
						h_groups_x_ca[i_c][i_a] = 1;
					}
				}
			}
		}


		// number of `a`/`b` terms
		let n_a = k_graph.width(this.a);
		let n_b = k_graph.width(this.b);

		// prep shallow adjacency list/index
		let at_adj_b_c = @{mk_uint_array('nl_adj_b_c', 'n_b')};
		let at_idx_b_c = @{mk_uint_array('n_b+1', 'nl_adj_b_c')};

		let i_write_idx_b_c = 1;
		let i_write_adj_b_c = 0;

		let nl_adj_bc_a = this.adj_ab_c.length;
		let i_max_a = k_graph.width(this.a);
		let at_adj_bc_a = @{mk_uint_array('nl_adj_bc_a', 'i_max_a')};
		let i_write_adj_bc_a = 0;

		let nl_idx_bc_a = nl_adj_b_c + 1;
		let at_idx_bc_a = @{mk_uint_array('nl_idx_bc_a', 'nl_adj_bc_a')};
		let i_write_idx_bc_a = 1;

		// flatten bc groups into typed array adjaceny list
		for(let i_b=1; i_b<=n_b; i_b++) {

			// prep to compute length of set
			let i_write_adj_b_c_top = i_write_adj_b_c;

			// convert set of keys to list of ints
			let h_groups_c_a = a_groups_b_ca[i_b];
			for(let s_c in h_groups_c_a) {
				at_adj_b_c[i_write_adj_b_c++] = +s_c;
			}

			// record end of that list to index
			at_idx_b_c[i_write_idx_b_c++] = i_write_adj_b_c;

			// calculate length of set by difference between indexes
			let nl_adj_xc_a = i_write_adj_b_c - i_write_adj_b_c_top;
			for(let s_c in h_groups_c_a) {
				for(let i_a in h_groups_c_a[s_c]) {
					at_adj_bc_a[i_write_adj_bc_a++] = i_a;
				}

				at_idx_bc_a[i_write_idx_bc_a++] = i_write_adj_bc_a;
			}
		}


		// debugger;

		console.timeEnd('shift');

		return new ContiguousAdjacencyListTriples(k_graph, this.b, this.c, this.a, at_idx_b_c, at_adj_b_c, at_idx_bc_a, at_adj_bc_a);
	}
}

@macro mk_idx(kind, size, range)
	// allocate array of indicies for @{kind}s' triples fragment
	let a_idx_@{kind} = @{mk_uint_array(size+' + 1', range)};

	// fill array
	i_index = 0; i_item = -1;
	do {
		a_idx_@{kind}[i_index++] = (++i_item);
		i_item = a_data_@{kind}.indexOf(0, i_item);
	} while(i_index < @{size});

	// store to instance
	this.idx_@{kind} = a_idx_@{kind};
@end


module.exports = {
	contiguous_adjacency_list_triples(k_graph, s_a, s_b, s_c, at_idx_a_b, at_adj_a_b, at_idx_ab_c, at_adj_ab_c) {
		return new ContiguousAdjacencyListTriples(k_graph, s_a, s_b, s_c, at_idx_a_b, at_adj_a_b, at_idx_ab_c, at_adj_ab_c);
	}
};