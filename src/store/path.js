@include 'store.jmacs'

class GraphPath {

}

class EmptyPath {
	constructor(k_graph, k_pattern) {
		this.graph = k_graph;
		this.pattern = k_pattern;
	}

	from(h_from) {
		let k_graph = this.graph;

		if(h_from.node) {
			let h_node = k_graph.find_n(h_from.node);

			// prep vector list
			h_node.vectors = [];

			// carry on
			let a_roots = [h_node];
			return new PartialPath(k_graph, a_roots, a_roots);
		}
		else if(h_from.subject) {
			// make query selection
			let k_selection = h_from.subject((new EmptyPattern(k_graph)).subjects()).exit();

			// extract distinct head ids
			let h_heads = k_selection.distinct_heads();

			// 
			let a_roots = [];
			for(let s_head_uid in h_heads) {
				let h_node = h_heads[s_head_uid];
				h_node.vectors = [];
				a_roots.push(h_node);
			}
			return new PartialPath(k_graph, a_roots, a_roots);
		}

		throw 'nope';
	}
}


class PartialPath {
	constructor(k_graph, a_roots, a_from) {
		this.graph = k_graph;
		this.roots = a_roots;
		this.from = a_from;
	}

	find(h_src, h_dests, n_min=0, n_max=Infinity, h_visited={}, n_depth=1) {
		let k_graph = this.graph;
		let n_range_d = k_graph.range_d;

		let hp_role = h_src.role;
		let i_src = h_src.id;
		let a_vectors = h_src.vectors;

		let a_scan = [];
// debugger;
		// explore 'right' side in normal direction relations
		if(i_src < k_graph.range_d || k_graph.TYPE_SUBJECT === hp_role) {
			// each predicate-object pair associated with this node as a subject
			for(let {b:i_p, c:i_o} of k_graph.s_po(i_src)) {
				let s_o = i_o < n_range_d? 'd'+i_o: 'o'+i_o;

				// haven't visited node before this call yet
				if(!(h_visited[s_o] < n_depth)) {
					// mark as visited
					h_visited[s_o] = n_depth;

					//
					let a_segment_vectors = [];

					// make segment
					let h_segment = {
						e: i_p,
						n: i_o,
						i: 0,
						c: 0,
						v: a_segment_vectors,
					};

					// found intersect
					if(h_dests[s_o] && n_depth > n_min) {
						// this is a checkpoint vertex
						h_segment.c = 1;

						// count number of intersects
						h_dests[s_o] += 1;

						// push segment
						a_vectors.push(h_segment);
					}
					// no intersect
					else {
						// queue in order to explore breadth-first
						a_scan.push({
							id: i_o,
							type: k_graph.TYPE_OBJECT,
							vectors: a_segment_vectors,
							segment: h_segment,
						});
					}
				}
			}
		}

		// explore 'left' side in invere direction relations
		if(i_src < k_graph.range_d || k_graph.TYPE_OBJECT === hp_role) {
			// each predicate-object pair associated with this node as a subject
			for(let {b:i_s, c:i_p} of k_graph.o_sp(i_src)) {
				let s_s = i_s < n_range_d? 'd'+i_s: 's'+i_s;

				// haven't visited node before this call yet
				if(!(h_visited[s_s] < n_depth)) {
					// mark as visited
					h_visited[s_s] = n_depth;

					//
					let a_segment_vectors = [];

					// make segment
					let h_segment = {
						e: i_p,
						n: i_s,
						i: 1,  // inverse
						c: 0,
						v: a_segment_vectors,
					};

					// found intersect
					if(h_dests[s_s] && n_depth > n_min) {
						// this is a checkpoint vertex
						h_segment.c = 1;

						// count number of intersects
						h_dests[s_s] += 1;

						// push segment
						a_vectors.push(h_segment);
					}
					// no intersect
					else {
						// queue in order to explore breadth-first
						a_scan.push({
							id: i_s,
							type: k_graph.TYPE_SUBJECT,
							vectors: a_segment_vectors,
							segment: h_segment,
						});
					}
				}
			}
		}

		// explore breadth-first
		if(n_depth < n_max) {
			for(let i_scan=0, n_scans=a_scan.length; i_scan<n_scans; i_scan++) {
				let h_scan = a_scan[i_scan];
				this.find(h_scan, h_dests, n_min, n_max, h_visited, n_depth+1);

				if(h_scan.vectors.length) {
					a_vectors.push(h_scan.segment);
				}
			}
		}
	}

	thru(h_thru) {
		// let k_graph = this.graph;
		// let a_from = this.from;

		// // to node
		// if(h_to.subject) {
		// 	let z_subject = h_to.subject;

		// 	// user provided query selection
		// 	if('function' === typeof z_subject) {
		// 		// make query selection
		// 		let k_selection = z_subject((new Entrance(k_graph)).subjects()).exit();

		// 		// extract distinct head ids
		// 		let h_heads = k_selection.distinct_heads(1);

		// 		//
		// 		let a_dests = [];

		// 		//
		// 		for(let i_from=0, n_from=a_from.length; i_from<n_from; i_from++) {
		// 			let h_src = a_from[i_from];

		// 			// prep vectors list
		// 			let a_vectors = [];

		// 			//
		// 			this.find(h_src, h_heads, h_to.min, h_to.max);

		// 			// select which targets found paths
		// 			for(let s_id in h_heads) {
		// 				// at least one path found to dest (incremented starting value of 1)
		// 				if(h_heads[s_id] > 1) {
		// 					let h_head = h_heads[s_id];
		// 					debugger;

		// 					let h_dest = {
		// 						id: +s_id.substr(1),
		// 						type: k_graph.TYPE_SUBJECT,
		// 						vectors: [],
		// 					};

		// 					// commit dest to src
		// 					a_vectors.push(h_dest);

		// 					// add dest to next partial path
		// 					a_dests.push(h_dest);
		// 				}
		// 			}
		// 		}

		// 		//
		// 		debugger;
		// 		return new Maze(k_graph, a_roots_cleaned);
		// 	}
		// }

		throw 'nope';
	}

	to(h_to) {
		let k_graph = this.graph;
		let a_from = this.from;

		// to node
		if(h_to.subject) {
			let z_subject = h_to.subject;

			// user provided query selection
			if('function' === typeof z_subject) {
				// make query selection
				let k_selection = z_subject((new EmptyPattern(k_graph)).subjects()).exit();

				// extract distinct head ids
				let h_heads = k_selection.distinct_heads(1);

				//
				for(let i_from=0, n_from=a_from.length; i_from<n_from; i_from++) {
					let h_src = a_from[i_from];

					// create vectors where each
					this.find(h_src, h_heads, h_to.min, h_to.max);
				}

				// 
				return new Maze(k_graph, this.roots);
			}
		}

		throw 'nope';
	}

	exit() {
		return new TrailHead(this.graph, this.roots);
	}
}

class CompletePath {
	constructor(k_graph, a_roots, a_dests) {
		this.graph = k_graph;
		this.roots = a_roots;
		this.dests = a_dests;
	}

	triples(fk_each) {
		let k_graph = this.graph;

		let a_srcs = this.srcs;
		@{each('src', 'h')}
			let i_head = h_src.id;

			let s_head = 's', s_tail = 'o';
			let b_inverse = false;
			if((i_head < k_graph.range_d) || (k_graph.TYPE_SUBJECT === h_src.type)) {
				s_head = 'o';
				s_tail = 's';
				b_inverse = true;
			}

			let h_a = k_graph[s_head](i_head);
			let a_vs = h_src.segment.v;
			for(let i_v=0, n_vs=a_vs.length; i_v<n_vs; i_v++) {
				let h_segment = a_vs[i_v];
				let h_c = k_graph[s_tail](h_segment.n);
				fk_each(b_inverse? h_c: h_a, k_graph.p(h_segment.e), b_inverse? h_a: h_c, new PathExplorer());
			}
		@{end_each()}
	}
}

class Maze {
	constructor(k_graph, a_roots) {
		this.graph = k_graph;
		this.roots = a_roots;
	}

	explore(fk_root) {
		let k_graph = this.graph;
		let a_roots = this.roots;
		@{each('root', 'h')}
			if(h_root.vectors.length) {
				let h_root_vertex = k_graph.v(h_root.id, h_root.type);
				fk_root(h_root_vertex, new PathExplorer(k_graph, h_root.vectors));
			}
		@{end_each()}
	}

	each(fk_each) {
		let k_graph = this.graph;

		let a_srcs = this.srcs;
		@{each('src', 'h')}
			let i_head = h_src.id;

			let s_head = 's', s_tail = 'o';
			let b_inverse = h_ve;
			if((i_head < k_graph.range_d) || (k_graph.TYPE_SUBJECT === h_src.type)) {
				s_head = 'o';
				s_tail = 's';
				b_inverse = true;
			}

			let h_a = k_graph[s_head](i_head);
			let a_vs = h_src.segment.v;
			for(let i_v=0, n_vs=a_vs.length; i_v<n_vs; i_v++) {
				let h_segment = a_vs[i_v];
				fk_each(h_a, k_graph.p(h_segment.e), k_graph[s_tail](h_segment.n), b_inverse, new PathExplorer());
			}
		@{end_each()}
	}
}

class PathExplorer {
	constructor(k_graph, a_vectors) {
		this.graph = k_graph;
		this.vectors = a_vectors;
	}

	each(fk_each) {
		let k_graph = this.graph;

		let a_vectors = this.vectors;
		@{each('vector', 'h')}
			let s_head = 's', s_tail = 'o';
			let x_mask = h_vector.i;
			if(x_mask) {
				s_head = 'o';
				s_tail = 's';
			}

			x_mask |= (h_vector.c << 1);

			fk_each(
				k_graph.p(h_vector.e),
				k_graph[s_tail](h_vector.n),
				x_mask,
				new PathExplorer(k_graph, h_vector.v)
			);
		@{end_each()}
	}
}


const intersect_smis = (a_a, a_b) => {
	let a_intersection = [];

	let i_b = -1;
	let n_b = a_b.length;
	for(let i_a=0, n_a=a_a.length; i_a<n_a; i_a++) {
		let x_a = a_a[i_a];

		while(x_a > a_b[++i_b]){}
		if(x_a === a_b[i_b]) {
			a_intersection.push(x_a);
			i_b += 1;
		}
	}

	return a_intersection;
}

// const intersect = (a_a, a_b, a_c) => {
// 	let a_diff_a = [];

// 	let i_b = -1, i_c = -1;
// 	let n_b = a_b.length, n_c = a_c.length;
// 	for(let i_a=0, n_a=a_a.length; i<n_a; i_a++) {
// 		let x_a = a_a[i_a].n;

// 		while(x_a > a_b[++i_b].n){}
// 		while(x_a === a_b[i_b].n) {
// 			a_b[i_b];
// 			i_b += 1;
// 		}

// 		while(x_a > a_c[++i_c]){}
// 	}
// }
