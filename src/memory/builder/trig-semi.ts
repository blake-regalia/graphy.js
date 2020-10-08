/* eslint-disable no-use-before-define */
import {
	RDFJS,
	C1,
	Role,
	Quad,
	PrefixMap,
	Dataset,
} from '@graphy/types';

import SyncC1Dataset = Dataset.SyncC1Dataset;
import SyncGspoBuilder = Dataset.SyncGspoBuilder;

import {
	DataFactory,
} from '@graphy/core';

const {
	c1GraphRole,
	c1SubjectRole,
	c1PredicateRole,
	c1ObjectRole,
	concise,
	fromTerm,
} = DataFactory;



/**
 * @fileoverview
 * The following table indicates the names for various groupings of RDF term roles:
 *
 *  ┌─────────┬───────────┬─────────────┬──────────┐
 *  │ <graph> ┊ <subject> ┊ <predicate> ┊ <object> │
 *  ├─────────┴───────────┼─────────────┴──────────┤
 *  │        grub         │           prob         │
 *  ├─────────────────────┴─────────────┬──────────┤
 *  │               greed               │░░░░░░░░░░│
 *  ├─────────┬─────────────────────────┴──────────┤
 *  │░░░░░░░░░│         spred           │░░░░░░░░░░│
 *  ├─────────┼─────────────────────────┴──────────┤
 *  │░░░░░░░░░│               triple               │
 *  ├─────────┴────────────────────────────────────┤
 *  │                      quad                    │
 *  └──────────────────────────────────────────────┘
 *
 */


const $_KEYS = Symbol(' (keys)');
const $_QUADS = Symbol(' (quads)');

interface CountableKeys {
	[$_KEYS]: number;
}

interface CountableQuads extends CountableKeys {
	[$_QUADS]: number;
}

type ObjectReferencesMap = CountableQuads & {
	[sc1_predicate: string]: Set<C1.Object>;
};

interface ObjectDescriptor {
	value: C1.Object;
	refs: ObjectReferencesMap;
}

type ObjectStore = CountableKeys & {
	[sc1_object: string]: ObjectDescriptor;
}

type ProbsTree = CountableQuads & {
	[sc1_predicate: string]: Set<ObjectDescriptor>;
}

type TriplesTree = CountableQuads & {
	[sc1_subject: string]: ProbsTree;
}

type QuadsTree = CountableQuads & {
	[sc1_graph: string]: TriplesTree;
}


class SemiIndexedGreedHandle implements Dataset.GraspHandle {
	_k_dataset: SemiIndexedTrigDataset;
	_kh_grub: SemiIndexedGrubHandle;
	_sc1_predicate: C1.Predicate;
	_sc1_subject: C1.Subject;
	_as_objects: Set<ObjectDescriptor>;

	constructor(kh_grub: SemiIndexedGrubHandle, sc1_predicate: C1.Predicate, as_objects: Set<ObjectDescriptor>) {
		this._k_dataset = kh_grub._k_dataset;
		this._kh_grub = kh_grub;
		this._sc1_subject = kh_grub._sc1_subject;
		this._sc1_predicate = sc1_predicate;
		this._as_objects = as_objects;
	}

	addC1Object(sc1_object: C1.Object): boolean {
		// ref object store
		const h_objects = this._k_dataset._h_objects;
		const as_objects = this._as_objects;

		// prep object descriptor
		let g_object: ObjectDescriptor;

		// object exists in store
		if(sc1_object in h_objects) {
			// ref object descriptor
			g_object = h_objects[sc1_object];

			// triple already exists; nothing was added
			if(as_objects.has(g_object)) {
				return false;
			}
			// triple not yet exists, subject guaranteed to not yet exist in predicate-specific references
			else {
				// ref predicate
				const sc1_predicate = this._sc1_predicate;

				// ref references
				const h_refs = g_object.refs;

				// predicate exists in references
				if(sc1_predicate in h_refs) {
					// add subject to set
					h_refs[sc1_predicate].add(this._sc1_subject);
				}
				// predicate not yet exists in references
				else {
					// create reference
					h_refs[sc1_predicate] = new Set([this._sc1_subject]);

					// update keys counter on references
					h_refs[$_KEYS] += 1;
				}

				// update quads counter on references
				h_refs[$_QUADS] += 1;

				// jump to add
			}
		}
		// object not yet exists in store
		else {
			// create object descriptor
			g_object = h_objects[sc1_object] = {
				value: sc1_object,
				refs: {
					[$_KEYS]: 1,
					[$_QUADS]: 1,
					[this._sc1_predicate]: new Set([this._sc1_subject]),
				} as ObjectReferencesMap,
			} as ObjectDescriptor;
		}

		// insert into object set
		as_objects.add(g_object);

		// ref quads tree
		const hc4_quads = this._k_dataset._hc4_quads;

		// update quads counter on quads tree
		hc4_quads[$_QUADS] += 1;

		// ref triples tree
		const hc3_triples = hc4_quads[this._kh_grub._kh_graph._sc1_graph];

		// update quads counter on triples tree
		hc3_triples[$_QUADS] += 1;

		// update quads counter on probs tree
		hc3_triples[this._sc1_subject][$_QUADS] += 1;

		// new triple added
		return true;
	}


	deleteC1Object(sc1_object: C1.Object): boolean {
		// ref object store
		const h_objects = this._k_dataset._h_objects;

		// object not exists in store
		if(!(sc1_object in h_objects)) return false;

		// prep object descriptor
		const g_object = h_objects[sc1_object];

		// confine scope
		{
			// ref set of objects
			const as_objects = this._as_objects;

			// triple not exists
			if(!as_objects.has(g_object)) return false;

			// ref quads tree
			const hc4_quads = this._k_dataset._hc4_quads;

			// decrement store-level quad counter
			hc4_quads[$_QUADS] -= 1;

			OPSG: {
				// ref grub handle
				const kh_grub = this._kh_grub;

				// ref graph handle
				const kh_graph = kh_grub._kh_graph;

				// ref triples tree
				const hc3_triples = kh_graph._hc3_triples;

				PSG: {
					// ref probs tree
					const hc2_probs = kh_grub._hc2_probs;

					// ref probs key count
					const nl_keys_probs = hc2_probs[$_KEYS];

					// last object associated with this greed
					if(1 === as_objects.size) {
						// last predicate associated with this grub
						if(1 === nl_keys_probs) {
							// ref triples key count
							const nl_keys_triples = hc3_triples[$_KEYS];

							// last subject associated with this graph, not default graph
							if(1 === nl_keys_triples && '*' !== kh_graph._sc1_graph) {
								// drop given graph
								delete hc4_quads[kh_graph._sc1_graph];

								// decrement key counter
								hc4_quads[$_KEYS] -= 1;

								// no need to decrement others
								break OPSG;
							}
							// other subjects remain or keeping default graph
							else {
								// drop triples tree for given subject
								delete hc3_triples[this._sc1_subject];

								// decrement key counter
								hc3_triples[$_KEYS] = nl_keys_triples - 1;

								// no need to decrement others
								break PSG;
							}
						}
						// other predicates remain
						else {
							// drop probs tree for given predicate
							delete hc2_probs[this._sc1_predicate];

							// decrement key counter
							hc2_probs[$_KEYS] = nl_keys_probs - 1;
						}
					}
					// other objects remain
					else {
						// delete object from set
						as_objects.delete(g_object);
					}

					// decrement subject-level quad counter
					hc2_probs[$_QUADS] -= 1;
				}

				// decrement graph-level quad counter
				hc3_triples[$_QUADS] -= 1;
			}
		}


		// ref object descriptor
		const h_refs = g_object.refs;

		// ref subjects list
		const as_subjects = h_refs[this._sc1_predicate];

		// last subject associated with this prob
		if(1 === as_subjects.size) {
			// ref key count
			const nl_keys_refs = h_refs[$_KEYS];

			// last tuple associated with this object
			if(1 === nl_keys_refs) {
				// delete object from store
				delete h_objects[sc1_object];

				// decrement object key count
				h_objects[$_KEYS] -= 1;
			}
			// other tuples remain
			else {
				// delete predicate from refs
				delete h_refs[this._sc1_predicate];

				// decrement keys counter on references
				h_refs[$_KEYS] -= 1;
			}
		}
		// other subjects remain
		else {
			// delete subject from subjects list
			as_subjects.delete(this._sc1_subject);
		}

		// deleted object
		return true;
	}
}


class SemiIndexedGrubHandle implements Dataset.GrubHandle {
	_k_dataset: SemiIndexedTrigDataset;
	_kh_graph: InternalGraphHandle;
	_sc1_subject: string;
	_hc2_probs: ProbsTree;

	constructor(k_dataset: SemiIndexedTrigDataset, kh_graph: InternalGraphHandle, sc1_subject: C1.Subject, hc2_probs: ProbsTree) {
		this._k_dataset = k_dataset;
		this._kh_graph = kh_graph;
		this._sc1_subject = sc1_subject;
		this._hc2_probs = hc2_probs;
	}

	openC1Predicate(sc1_predicate: C1.Predicate): Dataset.GraspHandle {
		// increment keys counter
		const hc2_probs = this._hc2_probs;

		// predicate exists; return tuple handle
		if(sc1_predicate in hc2_probs) {
			return new SemiIndexedGreedHandle(this, sc1_predicate, hc2_probs[sc1_predicate]);
		}
		else {
			// increment keys counter
			hc2_probs[$_KEYS] += 1;

			// create predicate w/ empty objects set
			const as_objects = hc2_probs[sc1_predicate] = new Set<ObjectDescriptor>();

			// return tuple handle
			return new SemiIndexedGreedHandle(this, sc1_predicate, as_objects);
		}
	}
}

interface InternalGraphHandle {
	_sc1_graph: string;
	_hc3_triples: TriplesTree;
}

class SemiIndexedGraphHandle implements InternalGraphHandle, Dataset.GraphHandle {
	_k_dataset: SemiIndexedTrigDataset;
	_sc1_graph: string;
	_hc3_triples: TriplesTree;

	constructor(k_dataset: SemiIndexedTrigDataset, sc1_graph: C1.Graph, hc3_triples: TriplesTree) {
		this._k_dataset = k_dataset;
		this._sc1_graph = sc1_graph;
		this._hc3_triples = hc3_triples;
	}

	openC1Subject(sc1_subject: C1.Subject): Dataset.GrubHandle {
		// ref triples tree
		const hc3_triples = this._hc3_triples;

		// subject exists; return subject handle
		if(sc1_subject in hc3_triples) {
			return new SemiIndexedGrubHandle(this._k_dataset, this, sc1_subject, hc3_triples[sc1_subject]);
		}
		else {
			// increment keys counter
			hc3_triples[$_KEYS] += 1;

			// create subject w/ empty probs tree
			const hc2_probs = hc3_triples[sc1_subject] = {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			} as ProbsTree;

			// return subject handle
			return new SemiIndexedGrubHandle(this._k_dataset, this, sc1_subject, hc2_probs);
		}
	}
}

function graph_to_c1(yt_graph: Role.Graph, h_prefixes: PrefixMap) {
	// depending on graph term type
	switch(yt_graph.termType) {
		// default graph
		case 'DefaultGraph': {
			return '*';
		}

		// named node
		case 'NamedNode': {
			return concise(yt_graph.value, h_prefixes);
		}

		// blank node
		default: {
			return '_:'+yt_graph.value;
		}
	}
}


/**
 * Trig-Optimized, Semi-Indexed Dataset in Memory
 * YES: ????, g???, g??o, g?po, gs??, gsp?, gspo
 * SOME: gs?o
 * NOT: ???o, ??p?, ??po, ?s??, ?s?o, ?sp?, ?spo, g?p?
 */
export class SemiIndexedTrigDataset implements InternalGraphHandle, SyncGspoBuilder<SyncC1Dataset>, Dataset.SyncDataset {
	_h_objects: ObjectStore;
	_sc1_graph = '*';
	_hc3_triples: TriplesTree;
	_hc4_quads: QuadsTree;
	_h_prefixes: PrefixMap;

	static supportsStar = false;

	constructor(h_prefixes={} as PrefixMap) {
		this._h_prefixes = h_prefixes;

		this._h_objects = {
			[$_KEYS]: 0,
		} as ObjectStore;

		const hc3_triples = this._hc3_triples = {
			[$_KEYS]: 0,
			[$_QUADS]: 0,
		} as TriplesTree;

		this._hc4_quads = {
			[$_KEYS]: 1,
			[$_QUADS]: 0,
			'*': hc3_triples,
		} as QuadsTree;
	}

	get size(): number {
		return this._hc4_quads[$_QUADS];
	}

	deliver(): Dataset.SyncC1Dataset {
		return new SemiIndexedTrigDataset();
	}

	* [Symbol.iterator](): Iterator<Quad> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// each graph
		for(const sc1_graph in hc4_quads) {
			// make graph node
			const kt_graph = c1GraphRole(sc1_graph, h_prefixes);

			// ref triples tree
			const hc3_triples = hc4_quads[sc1_graph];

			// each subject
			for(const sc1_subject in hc3_triples) {
				// make subject node
				const kt_subject = c1SubjectRole(sc1_subject, h_prefixes);

				// ref probs tree
				const hc2_probs = hc3_triples[sc1_subject];

				// each predicate
				for(const sc1_predicate in hc2_probs) {
					// make predicate node
					const kt_predicate = c1PredicateRole(sc1_predicate, h_prefixes);

					// ref objects
					const as_objects = hc2_probs[sc1_predicate];

					// each object
					for(const g_object of as_objects) {
						// make object node
						const kt_object = c1ObjectRole(g_object.value, h_prefixes);

						// yield quad
						yield DataFactory.quad(kt_subject, kt_predicate, kt_object, kt_graph);
					}
				}
			}
		}
	}

	distinctGraphCount(): number {  // eslint-disable-line require-await
		// graph count
		return this._hc4_quads[$_KEYS];
	}

	distinctSubjectCount(): number {  // eslint-disable-line require-await
		// only default graph
		if(1 === this._hc4_quads[$_KEYS]) {
			return this._hc3_triples[$_KEYS];
		}
		// multiple graphs
		else {
			let as_subjects = new Set();
			for(const sc1_graph in this._hc4_quads) {
				as_subjects = new Set([...as_subjects, ...Object.keys(this._hc4_quads[sc1_graph])]);
			}
			return as_subjects.size;
		}
	}

	distinctPredicateCount(): number {  // eslint-disable-line require-await
		// only default graph
		if(1 === this._hc4_quads[$_KEYS]) {
			const as_predicates = new Set();
			for(const sc1_predicate in this._hc3_triples) {
				as_predicates.add(sc1_predicate);
			}
			return as_predicates.size;
		}
		// multiple graphs
		else {
			const as_predicates = new Set();
			const h_objects = this._h_objects;
			for(const sc1_object in h_objects) {
				for(const sc1_predicate in Object.keys(h_objects[sc1_object].refs)) {
					as_predicates.add(sc1_predicate);
				}
			}
			return as_predicates.size;
		}
	}

	distinctObjectCount(): number {  // eslint-disable-line require-await
		return this._h_objects[$_KEYS];
	}

	attachPrefixes(h_prefixes: PrefixMap): void {
		this._h_prefixes = h_prefixes;
	}

	openC1Graph(sc1_graph: ConciseNode): GraphHandle {
		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// graph exists; return subject handle
		if(sc1_graph in hc4_quads) {
			return new SemiIndexedGraphHandle(this, sc1_graph, hc4_quads[sc1_graph]);
		}
		else {
			// increment keys counter
			hc4_quads[$_KEYS] += 1;

			// create graph w/ empty triples tree
			const hc3_triples = hc4_quads[sc1_graph] = {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			} as TriplesTree;

			// return subject handle
			return new SemiIndexedGraphHandle(this, sc1_graph, hc3_triples);
		}
	}

	openC1Subject(sc1_subject: ConciseNode): GrubHandle {
		// ref default graph triples tree
		const hc3_triples = this._hc3_triples;

		// subject exists; return subject handle
		if(sc1_subject in hc3_triples) {
			return new SemiIndexedGrubHandle(this, this, sc1_subject, hc3_triples[sc1_subject]);
		}
		// subject not yet exists
		else {
			// increment keys counter
			hc3_triples[$_KEYS] += 1;

			// create subject w/ empty probs tree
			const hc2_probs = hc3_triples[sc1_subject] = {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			} as ProbsTree;

			// return subject handle
			return new SemiIndexedGrubHandle(this, this, sc1_subject, hc2_probs);
		}
	}

	addTriple(sc1_subject: ConciseNode, sc1_predicate: ConciseNamedNode, sc1_object: ConciseTerm): boolean {
		return this.openC1Subject(sc1_subject).openC1Predicate(sc1_predicate).addC1Object(sc1_object);
	}

	add(g_quad: RDFJS.Quad): this {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

		this.openC1Graph(graph_to_c1(g_quad.graph as GraphRole, h_prefixes))
			.openC1Subject('NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value)
			.openC1Predicate(concise(g_quad.predicate.value, h_prefixes))
			.addC1Object(fromTerm(g_quad.object).concise(h_prefixes));

		return this;
	}

	has(g_quad: RDFJS.Quad): boolean {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// fetch triples tree
		const hc3_triples = this._hc4_quads[graph_to_c1(g_quad.graph as GraphRole, h_prefixes)];

		// none
		if(!hc3_triples) return false;

		// ref subject
		const yt_subject = g_quad.subject;

		// create subject c1
		const sc1_subject = 'NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value;

		// fetch probs tree
		const hc2_probs = hc3_triples[concise(sc1_subject, h_prefixes)]

		// none
		if(!hc2_probs) return false;

		// fetch objects list
		const as_objects = hc2_probs[concise(g_quad.predicate.value, h_prefixes)]

		// none
		if(!as_objects) return false;

		// create object c1
		const sc1_object = fromTerm(g_quad.object).concise(h_prefixes);

		// object exists in store
		const g_object = this._h_objects[sc1_object];

		// no object
		if(!g_object) return false;

		// use native set .has()
		return as_objects.has(g_object);
	}

	delete(g_quad: RDFJS.Quad): this {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

		this.openC1Graph(graph_to_c1(g_quad.graph as GraphRole, h_prefixes))
			.openC1Subject('NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value)
			.openC1Predicate(concise(g_quad.predicate.value, h_prefixes))
			.deleteC1Object(fromTerm(g_quad.object).concise(h_prefixes));

		return this;
	}

	match(yt_subject?: RDFJS.Term, yt_predicate?: RDFJS.Term, yt_object?: RDFJS.Term, yt_graph?: RDFJS.Term): SyncDataset {
		return new SemiIndexedTrigDataset();
	}
}

// DatasetFactory.semiIndexedTrigOptimized

// ByteOtimized {
// 	P: {
// 		S: {
// 			O: [G],
// 		}
// 	},
// }
