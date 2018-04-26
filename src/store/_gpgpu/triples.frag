
uniform usampler1D adj_ab_c;
uniform usampler1D idx_a_b;
uniform usampler1D idx_ab_c;

uniform uint adj_ab_c_len;
uniform uint idx_a_b_len;
uniform uint idx_ab_c_len;

uniform uint i_a;

varying uvec4 input;

void main() {
	uint i_a = input.r * IN_FLOAT_AS_UINT_24;
	uint c_off_b = input.g * IN_FLOAT_AS_UINT_24;
	uint i_c = input.b * IN_FLOAT_AS_UINT_24;

	// position of where `a` index list starts
	uint i_idx_ab_c_top = texelFetch(idx_a_b, i_a - 1);

	// position where `b` adjacency list starts/ends
	uint i_lo = texelFetch(idx_ab_c, i_idx_ab_c_top + c_off_b);
	uint i_hi = texelFetch(idx_ab_c, i_idx_ab_c_top + c_off_b + 1);

	// values at those positions
	uint x_lo = texelFetch(adj_ab_c, i_lo);
	uint x_hi = texelFetch(adj_ab_c, i_hi);

	// binary search
	for(;;) {
		// target value of out bounds
		if(i_c < x_lo || i_c > x_hi) discard;

		// compute midpoint search index
		uint i_mid = (i_lo + i_hi) >> 1;
		uint x_mid = texelFetch(adj_ab_c, i_mid);

		// miss low
		if(x_mid < i_c) {
			i_hi
		}
	}
}


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
	let x_hi = at_adj_ab_c[i_hi-1];

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