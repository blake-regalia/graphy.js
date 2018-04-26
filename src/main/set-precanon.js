
const crypto = require('crypto');

const factory = require('@graphy/factory');


const F_SORT_QUADS_PREHASH = (h_a, h_b) => {
	let i_graph = (h_a.graph+'').localeCompare(h_b.graph+'');
	if(i_graph) return i_graph;

	let {
		subject: h_subject_a,
		object: h_object_a,
	} = h_a;

	let {
		subject: h_subject_b,
		object: h_object_b,
	} = h_b;

	// left side subject is a blank node
	if(h_subject_a.isBlankNode) {
		// right side subject is a blank node
		if(!h_subject_b.isBlankNode) {
			// blank nodes come first
			return -1;
		}
	}
	// left side subject is not a blank node
	else {
		// right side subject is a blank node
		if(h_subject_b.isBlankNode) {
			// blank nodes come first
			return 1;
		}
		// right side subject is not a blank node
		else {
			// static comparison of subjects
			let i_subject = (h_subject_a+'').localeCompare(h_subject_b+'');
			if(i_subject) return i_subject;
		}
	}

	// static comparison of predicates
	let i_predicate = (h_a.predicate+'').localeCompare(h_b.predicate+'');
	if(i_predicate) return i_predicate;

	// left side object is a blank node
	if(h_object_a.isBlankNode) {
		// right side object is not a blank node
		if(!h_object_b.isBlankNode) {
			// blank nodes come first
			return -1;
		}
		// cannot compare
		else {
			debugger;
			throw new Error('np-hard');
		}
	}
	// left side object is not a blank node
	else {
		// right side object is a blank node
		if(h_object_b.isBlankNode) {
			// blank nodes come first
			return 1;
		}
	}

	// static comparison of objects
	let i_object = (h_object_a+'').localeCompare(h_object_b+'');
	return i_object;
};

const F_SORT_CT_QUADS_PREHASH = (a_a, a_b) => {
	let i_graph = a_a[0].localeCompare(a_b[0]);
	if(i_graph) return i_graph;

	// left side subject is a blank node
	if('_' === a_a[1][0]) {
		// right side subject is not a blank node
		if('_' !== a_b[1][0]) {
			// blank nodes come first
			return -1;
		}
	}
	// left side subject is not a blank node
	else {
		// right side subject is a blank node
		if('_' === a_b[1][0]) {
			// blank nodes come first
			return 1;
		}
		// right side subject is not a blank node
		else {
			let i_subject = a_a[1].localeCompare(a_b[1]);
			if(i_subject) return i_subject;
		}
	}

	let i_predicate = a_a[2].localeCompare(a_b[2]);
	if(i_predicate) return i_predicate;

	// left side object is a blank node
	if('_' === a_a[3][0]) {
		// right side object is not a blank node
		if('_' !== a_b[3][0]) {
			// blank nodes come first
			return -1;
		}
		// cannot compare
		else {
			debugger;
			throw new Error('np-hard');
		}
	}
	// left side subject is not a blank node
	else {
		let i_object = a_a[3].localeCompare(a_b[3]);
		return i_object;
	}

	return 0;
};

//const F_SORT_BLANK_OBJECTS = (a_a, a_b) => {
//	let nl_a = a_a.length;
//	let nl_b = a_b.length;
//
//	// same type
//	if(nl_a === nl_b) {
//		// non-blanks
//		if(1 === nl_a) return a_a[0] < a_b[0]? -1: 1;
//
//		throw new Error('cannot compare two blank nodes');
//	}
//	else {
//		return nl_b - nl_a;
//	}
//};

const F_SORT_BLANK_OBJECTS = (g_a, g_b) => {
	// left side is blank
	if(g_a.label) {
		// right side is blank
		if(g_b.label) {
			// cannot sort
			throw new Error('cannot sort');
		}
		// right side is not blank
		else {
			// blank nodes come first
			return -1;
		}
	}
	// left side is not blank
	else {
		// right side is blank
		if(g_b.label) {
			// blank nodes come first
			return 1;
		}
		// right side is not blank
		else {
			// compare
			return g_a.ct < g_b.ct? -1: 1;
		}
	}
};

const sort_blanks_prehash = (a_cqs) => {
	return (g_a, g_b) => {
		debugger;
		g_a; g_b;
	};
};


const $_KEYS = Symbol('key-count');
const $_QUADS = Symbol('quad-count');

class QuadSet {
	constructor(h_quad_tree={[$_KEYS]:0, [$_QUADS]:0}) {
		Object.assign(this, {
			quad_tree: h_quad_tree,
			digest: null,
			root_blanks: {},
			leaf_blanks: {},
		});
	}

	*quads() {
		let h_quads = this.quad_tree;
		for(let s_graph in h_quads) {
			let h_subjects = h_quads[s_graph];
			let g_graph = factory.ct(s_graph);
			for(let s_subject in h_subjects) {
				let h_predicates = h_subjects[s_subject];
				let g_subject = factory.ct(s_subject);
				for(let s_predicate in h_predicates) {
					let as_objects = h_predicates[s_predicate];
					let g_predicate = factory.ct(s_predicate);
					for(let s_object of as_objects) {
						yield factory.quad(
							g_subject,
							g_predicate,
							factory.ct(s_object),
							g_graph,
						);
					}
				}
			}
		}
	}

	*ct_quads() {
		let h_quads = this.quad_tree;
		for(let sct_graph in h_quads) {
			let h_subjects = h_quads[sct_graph];
			for(let sct_subject in h_subjects) {
				let h_predicates = h_subjects[sct_subject];
				for(let sct_predicate in h_predicates) {
					let as_objects = h_predicates[sct_predicate];
					for(let sct_object of as_objects) {
						yield [sct_graph, sct_subject, sct_predicate, sct_object];
					}
				}
			}
		}
	}

	*graphs() {
		for(let s_graph in this.quad_tree) {
			yield s_graph;
		}
	}

	*subjects(s_graph) {
		let h_subjects = this.quad_tree[s_graph];
		for(let s_subject in h_subjects) {
			yield s_subject;
		}
	}

	*predicates(s_graph, s_subject) {
		let h_predicates = this.quad_tree[s_graph][s_subject];
		for(let s_predicate in h_predicates) {
			yield s_predicate;
		}
	}

	*objects(s_graph, s_subject, s_predicate) {
		yield* this.quad_tree[s_graph][s_subject][s_predicate];
	}

	// add a quad to this set
	add(g_quad) {
		let h_quads = this.quad_tree;

		let p_graph = g_quad.graph.concise();
		let p_subject = g_quad.subject.concise();
		let p_predicate = g_quad.predicate.concise();
		let p_object = g_quad.object.concise();

		// first encounter of graph
		if(!(p_graph in h_quads)) {
			// add new tree under graph
			h_quads[p_graph] = {
				[$_KEYS]: 1,
				[$_QUADS]: 1,
				[p_subject]: {
					[$_KEYS]: 1,
					[$_QUADS]: 1,
					[p_predicate]: new Set([p_object]),
				},
			};

			// increment how many graphs there are in this set
			h_quads[$_KEYS] += 1;
		}
		// graph exists
		else {
			let h_triples = h_quads[p_graph];

			// first encounter of subject
			if(!(p_subject in h_triples)) {
				// add new tree under subject
				h_triples[p_subject] = {
					[$_KEYS]: 1,
					[$_QUADS]: 1,
					[p_predicate]: new Set([p_object]),
				};

				// increment how many subjects there are under this graph
				h_triples[$_KEYS] += 1;
			}
			// subject exists
			else {
				let h_pairs = h_triples[p_subject];

				// first encounter of predicate
				if(!(p_predicate in h_pairs)) {
					// add new set under predicate
					h_pairs[p_predicate] = new Set([p_object]);

					// increment how many predicates there are under this subject
					h_pairs[$_KEYS] += 1;
				}
				// predicate exists
				else {
					let as_objects = h_pairs[p_predicate];

					// first encounter of object
					if(!as_objects.has(p_object)) {
						// add object to set
						as_objects.add(p_object);
					}
					// duplicate
					else {
						return;
					}
				}

				// increment how many quads there are under this subject
				h_pairs[$_QUADS] += 1;
			}

			// increment how many quads there are under this graph
			h_triples[$_QUADS] += 1;
		}

		// increment how many quads there are in set
		h_quads[$_QUADS] += 1;

		// subject is blank node
		if(g_quad.subject.isBlankNode) {
			let h_root_blanks = this.root_blanks;
			if(p_subject in h_root_blanks) {
				h_root_blanks[p_subject].add(g_quad);
			}
			else {
				h_root_blanks[p_subject] = new Set([g_quad]);
			}
		}

		// object is blank node
		if(g_quad.object.isBlankNode) {
			let h_leaf_blanks = this.leaf_blanks;
			if(p_object in h_leaf_blanks) {
				h_leaf_blanks[p_object].add(g_quad);
			}
			else {
				h_leaf_blanks[p_object] = new Set([g_quad]);
			}
		}

		// invalidate hash and canonicalization
		this.hash = this.canonicalization = null;
	}

	equals(k_other) {
		// both have digest precomputed
		if(this.digest && k_other.digest) {
			return this.digest === k_other.digest;
		}

		// ref quads
		let h_quads_a = this.quad_tree;
		let h_quads_b = k_other.quad_tree;

		// different key count or quad count; cannot be equal
		if(h_quads_a[$_QUADS] !== h_quads_b[$_QUADS] || h_quads_a[$_KEYS] !== h_quads_b[$_KEYS]) {
			return false;
		}

		// compare digests
		return this.hash() === k_other.hash();
	}

	// generate the contents hash of a blank node in this set
	hash_blank_node(p_blank, h_hashed, a_visited=null) {
		let h_root_blanks = this.root_blanks;
		let h_leaf_blanks = this.leaf_blanks;

		// blank node has already been hashed
		if(p_blank in h_hashed) return h_hashed[p_blank];

		if(!a_visited) {
			a_visited = [p_blank];
		}
		else {
			let i_visited = a_visited.indexOf(p_blank);
			if(-1 !== i_visited) return '#'+i_visited;
			a_visited.unshift(p_blank);
		}

		// a canonical string to produce from the contents of incoming and outgoing triples
		let p_canonical = '';
debugger;
		// root blank nodes
		if(!(p_blank in h_root_blanks)) {
			p_canonical += '_\0\n';
		}
		else {
			p_canonical += [...h_root_blanks[p_blank]]
				.sort(F_SORT_QUADS_PREHASH)
				.map(g_quad => this.canonicalize_quad(g_quad, h_hashed, a_visited))
				.join('')+'\0\n';
		}

		// midpoint
		p_canonical += '|\0\n';

		// leaf blank nodes
		if(!(p_blank in h_leaf_blanks)) {
			p_canonical += '_\0\n';
		}
		else {
			p_canonical += [...h_leaf_blanks[p_blank]]
				.sort(F_SORT_QUADS_PREHASH)
				.map(g_quad => this.canonicalize_quad(g_quad, h_hashed, a_visited))
				.join('\0\n')+'\0\n';
		}

		// create hash
		let p_hash = '#'+crypto.createHash('sha256')
			.update(p_canonical)
			.digest('hex');

		// do not recompute next time
		h_hashed[p_blank] = p_hash;

		return p_hash;
	}

	hash_blank_node_absolute(p_blank) {
		let h_root_blanks = this.root_blanks;
		let h_leaf_blanks = this.leaf_blanks;

		// create canonical string
		let p_canonical = '#id\0\n';

		let a_predicates = [];
		let h_blank_subjects = {};
		let h_pairs = {};
		for(let g_quad of h_root_blanks[p_blank]) {
			let g_object = g_quad.object;
			let p_predicate = g_quad.predicate.value;

			// first encounter with predicate
			if(!(p_predicate in h_pairs)) {
				h_pairs[p_predicate] = [];
				a_predicates.push(p_predicate);
			}

			if(g_object.isBlankNode) {
				let s_blank_label = g_object.value;

				// already exists
				if(s_blank_label in h_blank_subjects) {
					h_blank_subjects[s_blank_label].push(p_predicate);
				}
				// first encounter
				else {
					h_blank_subjects[s_blank_label] = [p_predicate];
				}

				h_pairs[p_predicate].push({
					ct: `_#<${p_predicate}>`,
					label: g_object.value,
				});
			}
			else {
				h_pairs[p_predicate].push({
					ct: g_object.concise(),
				});
			}
		}

		// sort predicates
		a_predicates.sort();

		let h_blank_objects = {};

		// each predicate
		for(let p_predicate of a_predicates) {
			let a_objects = h_pairs[p_predicate]
				.map((g_object) => {
					if(g_object.label in h_blank_objects) {
						return h_blank_objects[g_object.label];
					}

					return g_object;
				});

			try {
				a_objects.sort(F_SORT_BLANK_OBJECTS);
			}
			catch(e_sort) {
				debugger;
				continue;
			}

			// safely canonicalize all
			p_canonical += `\t${p_predicate}\0\n`;
			for(let g_object of a_objects) {
				if(g_object.label && !(g_object.label in h_blank_objects)) {
					h_blank_objects[g_object.label] = g_object;
				}

				p_canonical += `\t\t${g_object.ct}\0\n`;
			}
		}

		debugger;
	}

	hash_blank_node_relative() {

	}

	// generate the canonical string representation of a quad
	canonicalize_quad(g_quad, h_hashed, a_visited) {
		let {
			subject: h_subject,
			object: h_object,
		} = g_quad;

		return g_quad.graph.concise()+'\0\n'
			+(h_subject.isBlankNode
				? this.hash_blank_node(h_subject.concise(), h_hashed, a_visited)
				: h_subject.concise()+'')+'\0\n'
			+g_quad.predicate.concise()+'\0\n'
			+(h_object.isBlankNode
				? this.hash_blank_node(h_object.concise(), h_hashed, a_visited)
				: h_object.concise())+'\0\n';
	}

	// generate a unique hash of this set
	hash() {
		return this.digest = this.digest
			|| '@'+crypto.createHash('sha256')
				.update(this.canonicalize(true))
				.digest('hex');
	}

	// generate the canonical string representation of this set
	canonicalize(b_temporary=false) {
		if(this.canonicalization) return this.canonicalization;

		let h_quads = this.quad_tree;
		let h_hashed = {};

		let h_root_blanks = this.root_blanks;
		let h_leaf_blanks = this.leaf_blanks;

		// // try sorting all quads first
		// let a_ct_quads_sorted;
		// try {
		// 	a_ct_quads_sorted = [...this.ct_quads()].sort(F_SORT_CT_QUADS_PREHASH);
		// }
		// catch(e_sort) {
		// 	// backup plan
		// 	throw e_sort;
		// }

		// // map to concise quad strings
		// let a_cq_quads_sorted = a_ct_quads_sorted.map(a => a.join('\0\n'));

		// // build sorted blank node list
		// let a_blanks = [];

		// let f_sort_blanks_prehash = sort_blanks_prehash(a_cq_quads_sorted);

		for(let p_blank in h_root_blanks) {

			this.hash_blank_node_absolute(p_blank);

			// a_blanks.push({
			// 	roots: [...h_root_blanks[p_blank]]
			// 		.sort(f_sort_blanks_prehash),
			// 	leafs: h_leaf_blanks[p_blank]
			// 		? [...h_leaf_blanks[p_blank]]
			// 			.sort(f_sort_blanks_prehash)
			// 		: [],
			// });
		}

		a_blanks.sort(F_SORT_BLANKS_PREHASH);
		debugger;


		for(let p_blank in h_root_blanks) {
			let p_hash;

			if(!(p_blank in h_hashed)) {
				p_hash = this.hash_blank_node(p_blank, h_hashed);
			}
			else {
				p_hash = h_hashed[p_blank];
			}

			h_root_blanks[p_blank].forEach((g_quad) => {
				g_quad.subject.value = p_hash;

				let h_triples = h_quads[g_quad.graph.concise()];

				// restructure graphs
				if(p_blank in h_triples) {
					let h_pairs = h_triples[p_blank];
					delete h_triples[p_blank];
					h_triples['_'+p_hash] = h_pairs;
				}
			});
		}

		for(let p_blank in h_leaf_blanks) {
			let p_hash;

			if(!(p_blank in h_hashed)) {
				p_hash = this.hash_blank_node(p_blank, h_hashed);
			}
			else {
				p_hash = h_hashed[p_blank];
			}

			h_leaf_blanks[p_blank].forEach((g_quad) => {
				g_quad.object.value = p_hash;

				// update graphs
				let as_objects = h_quads[g_quad.graph.concise()][g_quad.subject.concise()][g_quad.predicate.concise()];
				as_objects.delete(p_blank);
				as_objects.add('_'+p_hash);
			});
		}

		// each quad
		let s_canonicalization = Object.keys(h_quads).sort().map((p_graph) => {
			// each triple
			let h_triples = h_quads[p_graph];
			return `${p_graph}\0\n`+Object.keys(h_triples).sort().map((p_subject) => {
				let h_pairs = h_triples[p_subject];
				// each pair
				return `\t${p_subject}\0\n`+Object.keys(h_pairs).sort().map((p_predicate) => {
					// each object
					let as_objects = h_pairs[p_predicate];
					return `\t\t${p_predicate}\0\n`+[...as_objects].sort().map((p_object) => {
						return `\t\t\t${p_object}`;
					}).join('\0\n');
				}).join('\0\n');
			}).join('\0\n');
		}).join('\0\n');

		// save this canonicalization
		if(!b_temporary) this.canonicalization = s_canonicalization;

		return s_canonicalization;
	}

	// create union of two sets
	union(k_other) {
		// ref quads
		let h_quads_a = this.quad_tree;
		let h_quads_b = k_other.quad_tree;

		// a has less keys than b; swap quads
		if(h_quads_a[$_KEYS] < h_quads_b[$_KEYS]) {
			[h_quads_a, h_quads_b] = [h_quads_b, h_quads_a];
		}

		// prep quads union
		let h_quads_u = Object.create(h_quads_a);

		// each graph in a
		for(let p_graph in h_quads_a) {
			// graph is also in b
			if(p_graph in h_quads_b) {
				// ref triples
				let h_triples_a = h_quads_a[p_graph];
				let h_triples_b = h_quads_b[p_graph];

				// a has less keys than b; swap triples
				if(h_triples_a[$_KEYS] < h_triples_b[$_KEYS]) {
					[h_triples_a, h_triples_b] = [h_triples_b, h_triples_a];
				}

				// prep triples union and save it to quads union
				let h_triples_u = h_quads_u[p_graph] = Object.create(h_triples_a);

				// each subject in a
				for(let p_subject in h_triples_a) {
					// subject is also in b
					if(p_subject in h_triples_b) {
						// ref pairs
						let h_pairs_a = h_triples_a[p_subject];
						let h_pairs_b = h_triples_b[p_subject];

						// a has less keys than b; swap pairs
						if(h_pairs_a[$_KEYS] < h_pairs_b[$_KEYS]) {
							[h_pairs_a, h_pairs_b] = [h_pairs_b, h_pairs_a];
						}

						// prep pairs union and save it to triples union
						let h_pairs_u = h_triples_u[p_subject] = Object.create(h_pairs_a);

						// each predicate in a
						for(let p_predicate in h_pairs_a) {
							// predicate is also in b
							if(p_predicate in h_pairs_b) {
								// ref objects
								let as_objects_a = h_pairs_a[p_predicate];
								let as_objects_b = h_pairs_b[p_predicate];

								// union sets and save it to pairs union
								let as_objects_u = h_pairs_u[p_predicate] = new Set([...as_objects_a, ...as_objects_b]);

								// update quad counts with difference
								let n_quads_add = as_objects_u.size - as_objects_a.size;
								h_pairs_u[$_QUADS] += n_quads_add;
								h_triples_u[$_QUADS] += n_quads_add;
								h_quads_u[$_QUADS] += n_quads_add;
							}
						}

						// each predicate in b
						for(let p_predicate in h_pairs_b) {
							// predicate is not in a
							if(!(p_predicate in h_triples_a)) {
								// add all objects from this predicate
								h_pairs_u[p_predicate] = h_pairs_b[p_predicate];

								// update key count
								h_pairs_u[$_KEYS] += 1;

								// update quad counts
								let n_quads_add = h_pairs_b[p_predicate].size;
								h_pairs_u[$_QUADS] += n_quads_add;
								h_triples_u[$_QUADS] += n_quads_add;
								h_quads_u[$_QUADS] += n_quads_add;
							}
						}
					}
				}

				// each subject in b
				for(let p_subject in h_triples_b) {
					// subject is not is a
					if(!(p_subject in h_triples_a)) {
						// add all pairs from this subject
						let h_pairs_u = h_triples_u[p_subject] = h_triples_b[p_subject];

						// update key count
						h_triples_u[$_KEYS] += 1;

						// update quad counts
						let n_quads_add = h_pairs_u[$_QUADS];
						h_triples_u[$_QUADS] += n_quads_add;
						h_quads_u[$_QUADS] += n_quads_add;
					}
				}
			}
		}

		// each graph in b
		for(let p_graph in h_quads_b) {
			// graph is not in a
			if(!(p_graph in h_quads_b)) {
				// add all triples from this graph
				let h_triples_u = h_quads_u[p_graph] = h_quads_b[p_graph];

				// update key count
				h_quads_u[$_KEYS] += 1;

				// update quad counts
				let n_quads_add = h_triples_u[$_QUADS];
				h_quads_u[$_QUADS] += n_quads_add;
			}
		}

		return new QuadSet(h_quads_u);
	}

	// compute intersection of two sets
	intersection(k_other) {
		// ref quads
		let h_quads_a = this.quad_tree;
		let h_quads_b = k_other.quad_tree;

		// set b has less quads than set a; swap quadss
		if(h_quads_b[$_KEYS] < h_quads_a[$_KEYS]) {
			[h_quads_a, h_quads_b] = [h_quads_b, h_quads_a];
		}

		// prep quads intersection
		let h_quads_i = {[$_KEYS]:0, [$_QUADS]:0};

		// each graph in a
		for(let p_graph in h_quads_a) {
			// graph is also in b
			if(p_graph in h_quads_b) {
				// ref tripless
				let h_triples_a = h_quads_a[p_graph];
				let h_triples_b = h_quads_b[p_graph];

				// set b has less triples than set a; swap triples
				if(h_triples_b[$_KEYS] < h_triples_a[$_KEYS]) {
					[h_triples_a, h_triples_b] = [h_triples_b, h_triples_a];
				}

				// prep triples intersection
				let h_triples_i = {[$_KEYS]:0, [$_QUADS]:0};

				// each subject in a
				for(let p_subject in h_triples_a) {
					// subject is also in b
					if(p_subject in h_triples_b) {
						// ref pairs
						let h_pairs_a = h_triples_a[p_subject];
						let h_pairs_b = h_triples_b[p_subject];

						// set b has less pairs than set a; swap pairs
						if(h_pairs_b[$_KEYS] < h_pairs_a[$_KEYS]) {
							[h_pairs_a, h_pairs_b] = [h_pairs_b, h_pairs_a];
						}

						// prep pairs intersection
						let h_pairs_i = {[$_KEYS]:0, [$_QUADS]:0};

						// each predicate in a
						for(let p_predicate in h_pairs_a) {
							// predicate is also in b
							if(p_predicate in h_pairs_b) {
								// ref objects
								let as_objects_a = h_pairs_a[p_predicate];
								let as_objects_b = h_pairs_b[p_predicate];

								// set b has less objects than set a; swap objects
								if(as_objects_b.size < as_objects_a.size) {
									[as_objects_a, as_objects_b] = [as_objects_b, as_objects_a];
								}

								// prep objects intersection
								let as_objects_i = new Set();

								// each object in a
								for(let p_object of as_objects_a) {
									// object is also in b
									if(as_objects_b.has(p_object)) {
										// add to intersection
										as_objects_i.add(p_object);
									}
								}

								// non-empty object intersection
								if(as_objects_i) {
									// add objects to pair
									h_pairs_i[p_predicate] = as_objects_i;

									// update key count
									h_pairs_i[$_KEYS] += 1;

									// update quad count
									h_pairs_i[$_QUADS] += as_objects_i.size;
								}
							}
						}

						// non-empty pairs intersection
						if(h_pairs_i[$_KEYS]) {
							// add pairs to triples
							h_triples_i[p_subject] = h_pairs_i;

							// update key count
							h_triples_i[$_KEYS] += 1;

							// update quad count
							h_triples_i[$_QUADS] += 1;
						}
					}
				}

				// non-empty triples intersection
				if(h_triples_i[$_KEYS]) {
					// add triples to quads
					h_quads_i[p_graph] = h_triples_i;

					// update key count
					h_quads_i[$_KEYS] += 1;

					// update quad count
					h_quads_i[$_QUADS] += 1;
				}
			}
		}

		return new QuadSet(h_quads_i);
	}

	// subtract a subset from this
	minus_subset(k_subset) {
		// ref quads
		let h_quads_a = this.quad_tree;
		let h_quads_b = k_subset.quad_tree;

		// prep quads remainder
		let h_quads_r = {[$_KEYS]:0, [$_QUADS]:0};

		// each graph in a
		for(let p_graph in h_quads_a) {
			// graph is also in b
			if(p_graph in h_quads_b) {
				// ref tripless
				let h_triples_a = h_quads_a[p_graph];
				let h_triples_b = h_quads_b[p_graph];

				// prep triples remainder
				let h_triples_r = {[$_KEYS]:0, [$_QUADS]:0};

				// each subject in a
				for(let p_subject in h_triples_a) {
					// subject is also in b
					if(p_subject in h_triples_b) {
						// ref pairs
						let h_pairs_a = h_triples_a[p_subject];
						let h_pairs_b = h_triples_b[p_subject];

						// prep pairs remainder
						let h_pairs_r = {[$_KEYS]:0, [$_QUADS]:0};

						// each predicate in b
						for(let p_predicate in h_pairs_b) {
							// ref objects
							let as_objects_a = h_pairs_a[p_predicate];
							let as_objects_b = h_pairs_b[p_predicate];

							// prep objects remainder
							let as_objects_r = new Set(as_objects_a);

							// each object in b
							for(let p_object of as_objects_b) {
								// remove from remainder
								as_objects_r.delete(p_object);
							}

							// non-empty object remainder
							if(as_objects_r.size) {
								// add objects to pair
								h_pairs_r[p_predicate] = as_objects_r;

								// update key count
								h_pairs_r[$_KEYS] += 1;

								// update quad count
								h_pairs_r[$_QUADS] += as_objects_r.size;
							}
						}

						// non-empty pairs remainder
						if(h_pairs_r[$_KEYS]) {
							// add pairs to triples
							h_triples_r[p_subject] = h_pairs_r;

							// update key count
							h_triples_r[$_KEYS] += 1;

							// update quad count
							h_triples_r[$_QUADS] += h_pairs_r[$_QUADS];
						}
					}
					// subject is not in b
					else {
						// add all pairs from this subject
						let h_pairs_r = h_triples_r[p_subject] = h_triples_a[p_graph];

						// update key count
						h_triples_r[$_KEYS] += 1;

						// update quad count
						h_triples_r[$_QUADS] += h_pairs_r[$_QUADS];
					}
				}

				// non-empty triples intersection
				if(h_triples_r[$_KEYS]) {
					// add triples to quads
					h_quads_r[p_graph] = h_triples_r;

					// update key count
					h_quads_r[$_KEYS] += 1;

					// update quad count
					h_quads_r[$_QUADS] += h_triples_r[$_QUADS];
				}
			}
			// graph is not in b
			else {
				// add all triples from this graph
				let h_triples_r = h_quads_r[p_graph] = h_quads_a[p_graph];

				// update key count
				h_quads_r[$_KEYS] += 1;

				// update quad count
				h_quads_r[$_QUADS] += h_triples_r[$_QUADS];
			}
		}

		// return new quad set
		return new QuadSet(h_quads_r);
	}

	// tests if another set is included in this set
	includes(k_other) {
		// compute intersection first
		let k_i = this.intersection(k_other);

		// (A ∩ B) == B
		return k_i.equals(k_other);
	}

	// subtract another set from this
	minus(k_other) {
		// compte intersection first
		let k_i = this.intersection(k_other);

		// A - (A ∩ B)
		return this.minus_subset(k_i);
	}

	// compute the difference of two sets
	difference(k_other) {
		// compute intersection first
		let k_i = this.intersection(k_other);

		// (A - (A ∩ B)) ∪ (B - (A ∩ B))
		return this.minus_subset(k_i)
			.union(k_other.minus_subset(k_i));
	}

	// count how many quads match the given selector
	count(a_terms=[]) {
		// no terms; return quad count
		if(!a_terms.length) return this.quad_tree[$_QUADS];

		// normalize terms
		let act_terms = a_terms.map((z) => {
			// concise term string
			if('string' === typeof z) return z;

			// rdfjs term
			if('termType' in z) {
				// graphy term
				if('concise' in z) return z.concise();

				// foreign term; make graphy
				return factory.term(z).concsie();
			}

			// null
			if(null === z) return z;

			// invalid
			throw new TypeError(`invalid type for term in array: ${z}`);
		});

		// ref quads
		let h_quads = this.quad_tree;

		// number of terms
		let nl_terms = act_terms.length;

		// matching trees
		let a_trees = [];

		// graph
		let p_graph = act_terms[0];

		// variable; take all graphs
		if(null === p_graph) {
			a_trees = Object.values(h_quads);
		}
		// specific
		else {
			a_trees = [h_quads[p_graph]];
		}

		// subject
		if(nl_terms > 1) {
			let p_subject = act_terms[1];

			// prep to swap out trees
			let a_swap = [];

			// variable
			if(null === p_subject) {
				// take all subjects
				a_trees.forEach((h) => {
					a_swap.push(...Object.values(h));
				});
			}
			// specific
			else {
				a_trees.forEach((h) => {
					if(p_subject in h) {
						a_swap.push(h[p_subject]);
					}
				});
			}

			// swap in for trees
			a_trees = a_swap;

			// predicate given
			if(nl_terms > 2) {
				let p_predicate = act_terms[2];

				// prep to swap out trees
				a_swap = [];

				// variable
				if(null === p_predicate) {
					// take all predicates
					a_trees.forEach((h) => {
						a_swap.push(...Object.values(h));
					});
				}
				// specific
				else {
					a_trees.forEach((h) => {
						if(p_predicate in h) {
							a_swap.push(h[p_predicate]);
						}
					});
				}

				// swap in for trees
				a_trees = a_swap;

				// object given
				if(nl_terms > 3) {
					let p_object = act_terms[3];

					// prep to count objects
					let c_objects = 0;

					// variable
					if(null === p_object) {
						// take all objects
						a_trees.forEach((as) => {
							c_objects += as.size;
						});
					}
					// specific
					else {
						// count objects
						a_trees.forEach((h) => {
							if(p_object in h) {
								c_objects += 1;
							}
						});
					}

					// more terms given
					if(nl_terms > 4) {
						throw new Error(`too many values given in terms array`);
					}

					// object count
					return c_objects;
				}
			}
		}

		// reduce final quad count
		return a_trees.reduce((c, h) => c + h[$_QUADS], 0);
	}
}

Object.assign(QuadSet, {
	isGraphySet: true,
});

module.exports = function(...a_args) {
	return new QuadSet(...a_args);
};
