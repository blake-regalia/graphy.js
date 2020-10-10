/* eslint-disable no-use-before-define */

import {
	RDFJS,
	C1,
	PrefixMap,
	Quad,
	Dataset,
	Role, Graphable, Term
} from '@graphy/types';

import SyncC1Dataset = Dataset.SyncC1Dataset;
import SyncGspoBuilder = Dataset.SyncGspoBuilder;

import {
	$_KEYS,
	$_QUADS,
	$_OVERLAY,
	$_BURIED,
	PartiallyIndexed,
	Generic,
	SemiIndexed
} from '../common';

import ProbsTree = PartiallyIndexed.ProbsTree;
import TriplesTree = PartiallyIndexed.TriplesTree;
import QuadsTree = PartiallyIndexed.QuadsTree;
import GraphHandle = PartiallyIndexed.GraphHandle;
import GrubHandle = PartiallyIndexed.GrubHandle;
import GraspHandle = PartiallyIndexed.GraspHandle;
import ObjectSet = PartiallyIndexed.ObjectSet;

import overlayTree = Generic.overlayTree;
import overlay = Generic.overlay;
import trace = Generic.trace;

import {
	TrigDatasetBuilder,
} from '../builder/trig-partial';

import {
	DataFactory, Topology,
// } from '@graphy/core';
} from '../../core/core';
import { TrigDataset } from '../memory';

const {
	concise,
	fromTerm,
	c1Graph,
	c1Subject,
	c1Predicate,
	c1Object,
	c1FromGraphRole,
	c1FromSubjectRole,
	c1FromPredicateRole,
	c1FromObjectRole,
	c1ExpandData,
	relateMaps,
} = DataFactory;

type StaticSelf = Function & {
	empty(h_prefixes: PrefixMap): PartiallyIndexedTrigDataset;
	builder(h_prefixes: PrefixMap): TrigDatasetBuilder;
	new(hc4_quads: Generic.QuadsTree, h_prefixes: PrefixMap): PartiallyIndexedTrigDataset;
};

export interface TrigDataset extends SyncC1Dataset {

	expand(): TrigDataset;
}

interface Constructor extends Generic.Constructor<PartiallyIndexedTrigDataset, TrigDatasetBuilder, Generic.QuadsTree> {}

export const PartiallyIndexedTrigDataset: Constructor = class PartiallyIndexedTrigDataset implements TrigDataset {
	/**
	 * Authoritative and immutable prefix map to use for c1 creation and resolution
	 */
	_h_prefixes: PrefixMap;

	/**
	 * Primary tree data structure for storing quads
	 */
	_hc4_quads: Generic.QuadsTree;

	/**
	 * Shortcut to the default graph
	 */
	_hc3_trips: Generic.TriplesTree;

	/**
	 * Internal self builder for creating match results or appending
	 */
	_k_builder: TrigDatasetBuilder;

	/**
	 * If true, c1 strings are prefixed. Otherwise, c1 strings are expanded
	 */
	_b_prefixed: boolean;

	/**
	 * Create new empty dataset
	 * @param h_prefixes 
	 */
	static empty(h_prefixes: PrefixMap): PartiallyIndexedTrigDataset {
		return new PartiallyIndexedTrigDataset({
			[$_KEYS]: 1,
			[$_QUADS]: 0,
			// [$_OVERLAY]: 0,
			// [$_BURIED]: [],
			['*']: {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
				// [$_OVERLAY]: 0,
				// [$_BURIED]: [],
			},
		} as Generic.QuadsTree, h_prefixes);
	}

	/**
	 * Create new empty dataset builder
	 * @param h_prefixes 
	 */
	static builder(h_prefixes: PrefixMap): TrigDatasetBuilder {
		return new TrigDatasetBuilder(h_prefixes);
	}
	

	/**
	 * Create new dataset
	 * @param hc4_quads 
	 * @param h_prefixes 
	 */
	constructor(hc4_quads: Generic.QuadsTree, h_prefixes: PrefixMap, b_prefixed=false) {
		this._hc4_quads = hc4_quads;
		this._hc3_trips = hc4_quads['*'];
		this._h_prefixes = h_prefixes;
		this._b_prefixed = b_prefixed;
		this._k_builder = new TrigDatasetBuilder(h_prefixes, this);
	}

	/**
	 * Get the total number of quads stored in the dataset
	 */
	get size(): number {
		return this._hc4_quads[$_QUADS];
	}

	/**
	 * Whether or not the c1 strings are prefixed (opposite of expanded)
	 */
	get isPrefixed(): boolean {
		return this._b_prefixed;
	}

	/**
	 * Whether or not the c1 strings are expanded (opposite of prefixed)
	 */
	get isExpanded(): boolean {
		return !this._b_prefixed;
	}


	/**
	 * For iterating through the dataset one quad at a time
	 */
	* [Symbol.iterator](): Generator<Quad> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// each graph
		for(const sc1_graph in hc4_quads) {
			// make graph node
			const kt_graph = c1Graph(sc1_graph, h_prefixes);

			// ref triples tree
			const hc3_trips = hc4_quads[sc1_graph];

			// each subject
			for(const sc1_subject in hc3_trips) {
				// make subject node
				const kt_subject = c1Subject(sc1_subject, h_prefixes);

				// ref probs tree
				const hc2_probs = hc3_trips[sc1_subject] as ProbsTree;

				// each predicate
				for(const sc1_predicate in hc2_probs) {
					// make predicate node
					const kt_predicate = c1Predicate(sc1_predicate, h_prefixes);

					// ref objects
					const as_objects = hc2_probs[sc1_predicate];

					// each object
					for(const sc1_object of as_objects) {
						// make object node
						const kt_object = c1Object(sc1_object, h_prefixes);

						// yield quad
						yield DataFactory.quad(kt_subject, kt_predicate, kt_object, kt_graph);
					}
				}
			}
		}
	}


	_total_distinct_graphs(): Set<C1.Graph> {
		// distinct graphs set
		const as_graphs = new Set<C1.Graph>();

		// each graph
		for(const sc1_graph in this._hc4_quads) {
			as_graphs.add(sc1_graph);
		}

		// return set
		return as_graphs;
	}

	_total_distinct_subjects(): Set<C1.Graph> {
		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// count distinct subjects
		const as_subjects = new Set<C1.Subject>();

		// each graph
		for(const sc1_graph in hc4_quads) {
			// ref triples tree
			const hc3_trips = hc4_quads[sc1_graph];

			// each subject; add to set
			for(const sc1_subject in hc3_trips) {
				as_subjects.add(sc1_subject);
			}
		}

		// return set
		return as_subjects;
	}

	_total_distinct_predicates(): Set<C1.Predicate> {
		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// count distinct predicates using set
		let as_predicates = new Set<C1.Predicate>();

		// each graph
		for(const sc1_graph in hc4_quads) {
			// ref triples tree
			const hc3_trips = hc4_quads[sc1_graph];

			// each subject
			for(const sc1_subject in hc3_trips) {
				// ref probs tree
				const hc2_probs = hc3_trips[sc1_subject];

				// each predicate; add to set
				for(const sc1_predicate in hc2_probs) {
					as_predicates.add(sc1_predicate);
				}
			}
		}

		// return set
		return as_predicates;
	}

	_total_distinct_objects(): Set<C1.Object> {
		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// distinct objects set
		let as_objects = new Set<C1.Object>();

		// each graph
		for(const sc1_graph in hc4_quads) {
			// ref triples tree
			const hc3_trips = hc4_quads[sc1_graph];

			// each subject
			for(const sc1_subject in hc3_trips) {
				// ref probs tree
				const hc2_probs = hc3_trips[sc1_subject] as ProbsTree;

				// each predicate
				for(const sc1_predicate in hc2_probs) {
					// ref objects set
					const as_add = hc2_probs[sc1_predicate];

					// each object; add it to set
					for(const sc1_object of as_add) {
						as_objects.add(sc1_object);
					}
				}
			}
		}

		// return set
		return as_objects;
	}


	distinctGraphCount(): number {
		return this._hc4_quads[$_KEYS];
	}

	distinctSubjectCount(): number {
		// only default graph
		if(1 === this._hc4_quads[$_KEYS]) {
			return this._hc3_trips[$_KEYS];
		}
		// multiple graphs
		else {
			let as_subjects = new Set();
			for(let sc1_graph in this._hc4_quads) {
				as_subjects = new Set([...as_subjects, ...Object.keys(this._hc4_quads[sc1_graph])]);
			}
			return as_subjects.size;
		}
	}

	distinctPredicateCount(): number {
		// only default graph
		if(1 === this._hc4_quads[$_KEYS]) {
			let as_predicates = new Set();
			for(let sc1_predicate in this._hc3_trips) {
				as_predicates.add(sc1_predicate);
			}
			return as_predicates.size;
		}
		// multiple graphs
		else {
			return this._total_distinct_predicates().size;
		}
	}

	distinctObjectCount(): number {
		return this._total_distinct_objects().size;
	}


	distinctC1Graphs(): Set<C1.Graph> {
		return this._total_distinct_graphs();
	}

	distinctC1Subjects(): Set<C1.Graph> {
		return this._total_distinct_subjects();
	}

	distinctC1Predicates(): Set<C1.Predicate> {
		return this._total_distinct_predicates();
	}

	distinctC1Objects(): Set<C1.Object> {
		return this._total_distinct_objects();
	}


	* distinctGraphs(): Generator<Term.Graph> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// each graph
		for(const sc1_graph of this.distinctC1Graphs()) {
			yield c1Graph(sc1_graph, h_prefixes);
		}
	}

	* distinctSubjects(): Generator<Term.Subject> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// each subject
		for(const sc1_subject of this.distinctC1Graphs()) {
			yield c1Subject(sc1_subject, h_prefixes);
		}
	}

	* distinctPredicates(): Generator<Term.Subject> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// each predicate
		for(const sc1_predicate of this.distinctC1Predicates()) {
			yield c1Predicate(sc1_predicate, h_prefixes);
		}
	}

	* distinctObjects(): Generator<Term.Object> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// each object
		for(const sc1_object of this.distinctC1Objects()) {
			yield c1Object(sc1_object, h_prefixes);
		}
	}


	attachPrefixes(h_prefixes: PrefixMap) {
		this._h_prefixes = h_prefixes;
	}

	addC1Quad(sc1_subject: C1.Subject, sc1_predicate: C1.Predicate, sc1_object: C1.Object, sc1_graph?:  C1.Graph): boolean {
		const kh_handle: Dataset.GraphHandle = sc1_graph
			? this._k_builder.openC1Graph(sc1_graph)
			: this._k_builder as TrigDatasetBuilder;

		// use builder to efficiently add quad
		return kh_handle.openC1Subject(sc1_subject).openC1Predicate(sc1_predicate).addC1Object(sc1_object);
	}

	add(g_quad: RDFJS.Quad): this {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

		// use builder to efficiently add quad
		this._k_builder.openC1Graph(c1FromGraphRole(g_quad.graph, h_prefixes))
			.openC1Subject(c1FromSubjectRole(g_quad.subject, h_prefixes))
			.openC1Predicate(c1FromPredicateRole(g_quad.predicate, h_prefixes))
			.addC1Object(c1FromObjectRole(g_quad.object, h_prefixes));

		return this;
	}

	has(g_quad: RDFJS.Quad): boolean {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// fetch triples tree
		const hc3_trips = this._hc4_quads[c1FromGraphRole(g_quad.graph, h_prefixes)];

		// none
		if(!hc3_trips) return false;

		// ref subject
		const yt_subject = g_quad.subject;

		// create subject c1
		const sc1_subject = c1FromSubjectRole(g_quad.subject, h_prefixes);

		// fetch probs tree
		const hc2_probs = hc3_trips[concise(sc1_subject, h_prefixes)] as ProbsTree;

		// none
		if(!hc2_probs) return false;

		// fetch objects list
		const as_objects = hc2_probs[c1FromPredicateRole(g_quad.predicate, h_prefixes)];

		// none
		if(!as_objects) return false;

		// create object c1
		const sc1_object = c1FromObjectRole(g_quad.object, h_prefixes);

		// use native set .has()
		return as_objects.has(sc1_object);
	}

	delete(g_quad: RDFJS.Quad): this {
		const h_prefixes = this._h_prefixes;

		this._k_builder.openC1Graph(c1FromGraphRole(g_quad.graph, h_prefixes))
			.openC1Subject(c1FromSubjectRole(g_quad.subject, h_prefixes))
			.openC1Predicate(c1FromPredicateRole(g_quad.predicate.value, h_prefixes))
			.deleteC1Object(c1FromObjectRole(g_quad.object, h_prefixes));

		return this;
	}


	_offspring(hc4_out: QuadsTree): PartiallyIndexedTrigDataset {
		return new PartiallyIndexedTrigDataset(hc4_out, this._h_prefixes);
	}


	match(yt_subject?: Role.Subject | null, yt_predicate?: Role.Predicate | null, yt_object?: Role.Object | null, yt_graph?: Role.Graph| null): SyncC1Dataset {
		const h_prefixes = this._h_prefixes;
		const hc4_src = this._hc4_quads as QuadsTree;

		// +graph
		if(yt_graph) {
			// convert graph to c1
			const sc1_graph = c1FromGraphRole(yt_graph, h_prefixes);

			// no such graph; return new empty tree
			if(!(sc1_graph in hc4_src)) return PartiallyIndexedTrigDataset.empty(h_prefixes);

			// ref triples tree
			const hc3_src = hc4_src[sc1_graph];

			// +grraph, +subject
			if(yt_subject) {
				// convert subject to c1
				let sc1_subject = c1FromSubjectRole(yt_subject, h_prefixes);

				// no such subject; return new empty tree
				if(!(sc1_subject in hc3_src)) return PartiallyIndexedTrigDataset.empty(h_prefixes);

				// ref probs tree
				const hc2_src = hc3_src[sc1_subject];

				// +graph, +subject, +predicate
				if(yt_predicate) {
					// convert predicate to c1
					const sc1_predicate = c1FromPredicateRole(yt_predicate, h_prefixes);

					// no such predicate; return new empty tree
					if(!(sc1_predicate in hc2_src)) return PartiallyIndexedTrigDataset.empty(h_prefixes);

					// ref objects set
					const as_objects_src = hc2_src[sc1_predicate];

					// for both paths
					let n_quads_objects;
					let as_objects_dst: ObjectSet;

					// +graph, +subject, +predicate, +object
					if(yt_object) {
						// convert object to c1
						const sc1_object = c1FromObjectRole(yt_object, h_prefixes);

						// no such object; return new empty tree
						if(!as_objects_src.has(sc1_object)) return PartiallyIndexedTrigDataset.empty(h_prefixes);
						
						// create set
						as_objects_dst = new Set([sc1_object]);

						// sole quad
						n_quads_objects = 1;
					}
					// +graph, +subject, +predicate, -object
					else {
						// copy set
						as_objects_dst = new Set(as_objects_src);

						// quad count
						n_quads_objects = as_objects_src.size;
					}
					
					// path merge; create new tree
					return this._offspring({
						[$_KEYS]: 1,
						[$_QUADS]: n_quads_objects,
						// [$_OVERLAY]: 0,
						// [$_BURIED]: [],
						[sc1_graph]: {
							[$_KEYS]: 1,
							[$_QUADS]: n_quads_objects,
							// [$_OVERLAY]: 0,
							// [$_BURIED]: [],
							[sc1_subject]: {
								[$_KEYS]: 1,
								[$_QUADS]: n_quads_objects,
								// [$_OVERLAY]: 0,
								// [$_BURIED]: [],
								[sc1_predicate]: as_objects_dst,
							},
						},
					} as QuadsTree);
				}
				// +graph, +subject, -predicate, +object
				else if(yt_object) {
					// convert object to c1
					const sc1_object = c1FromObjectRole(yt_object, h_prefixes);

					// prepare for loading into set multiple times
					const a_object_load = [sc1_object];

					// how many distinct probs are added
					let c_probs = 0;

					// dst probs tree
					const hc2_dst = overlayTree() as ProbsTree;

					// each probs
					for(const sc1_predicate in hc2_src) {
						// object exists under probs tree
						if(hc2_src[sc1_predicate].has(sc1_object)) {
							// create new objects set and save to dst probs tree
							hc2_dst[sc1_predicate] = new Set(a_object_load);

							// increment probs count
							c_probs += 1;
						}
					}

					// no quads; empty tree
					if(!c_probs) return PartiallyIndexedTrigDataset.empty(h_prefixes);

					// save keys and quads count
					hc2_dst[$_KEYS] = c_probs;
					hc2_dst[$_QUADS] = c_probs;

					// create new tree
					return this._offspring({
						[$_KEYS]: 1,
						[$_QUADS]: c_probs,
						[sc1_graph]: {
							[$_KEYS]: 1,
							[$_QUADS]: c_probs,
							[sc1_subject]: hc2_dst,
						},
					} as QuadsTree);
				}
				// +graph, +subject -predicate, -object
				else {
					// quad count
					const n_quads_probs = hc2_src[$_QUADS];

					// create new tree
					return this._offspring({
						[$_KEYS]: 1,
						[$_QUADS]: n_quads_probs,
						[sc1_graph]: {
							[$_KEYS]: 1,
							[$_QUADS]: n_quads_probs,
							[sc1_subject]: overlay(hc2_src),
						},
					} as QuadsTree);
				}
			}
			// +graph, -subject, +predicate
			else if(yt_predicate) {
				// convert predicate to c1
				const sc1_predicate = c1FromPredicateRole(yt_predicate, h_prefixes);

				// how many subject-keys and quads are added
				let c_subjects = 0;
				let c_quads = 0;

				// init dst triples tree
				const hc3_dst = overlayTree() as TriplesTree;

				// +graph, -subject, +predicate, +object
				if(yt_object) {
					// convert object to c1
					const sc1_object = c1FromObjectRole(yt_object, h_prefixes);

					// prepare for loading into set multiple times
					const a_object_load = [sc1_object];

					// each triples
					for(const sc1_subject in hc3_src) {
						// ref src probs tree
						const hc2_src = hc3_src[sc1_subject];

						// no such predicate; skip
						if(!(sc1_predicate in hc2_src)) continue;

						// ref src objects set
						const as_objects_src = hc2_src[sc1_predicate];

						// no such object; skip
						if(!as_objects_src.has(sc1_object)) continue;

						// create probs subtree
						hc3_dst[sc1_subject] = {
							[$_KEYS]: 1,
							[$_QUADS]: 1,
							[sc1_predicate]: new Set(a_object_load),
						} as ProbsTree;

						// increment quads count
						c_quads += 1;
					}

					// key count matches added quads count
					c_subjects = c_quads;
				}
				// +graph, -subject, +predicate, -object
				else {
					// each triples
					for(const sc1_subject in hc3_src) {
						// ref src probs tree
						const hc2_src = hc3_src[sc1_subject];

						// no such predicate; skip
						if(!(sc1_predicate in hc2_src)) continue;

						// create dst objects set
						const as_objects_dst = new Set(hc2_src[sc1_predicate]);

						// create probs subtree
						hc3_dst[sc1_subject] = {
							[$_KEYS]: 1,
							[$_QUADS]: as_objects_dst.size,
							[sc1_predicate]: as_objects_dst,
						} as ProbsTree;
						
						// increment quads & subject-keys count
						c_quads += as_objects_dst.size;
						c_subjects += 1;
					}
				}

				// no quads; empty tree
				if(!c_subjects) return PartiallyIndexedTrigDataset.empty(h_prefixes);

				// save quads and subject-keys counts to dst triples tree
				hc3_dst[$_KEYS] = c_subjects;
				hc3_dst[$_QUADS] = c_quads;

				// create new tree
				return this._offspring({
					[$_KEYS]: 1,
					[$_QUADS]: c_quads,
					[sc1_graph]: hc3_dst,
				} as QuadsTree);
			}
			// +graph, -subject, -predicate, +object
			else if(yt_object) {
				// convert object to c1
				const sc1_object = c1FromObjectRole(yt_object, h_prefixes);

				// prepare for loading into set multiple times
				const a_object_load = [sc1_object];

				// how many subject keys and quads are added
				let c_subjects = 0;
				let c_quads = 0;

				// init dst triples tree
				const hc3_dst = overlayTree() as TriplesTree;

				// each triples
				for(const sc1_subject in hc3_src) {
					// ref src probs tree
					const hc2_src = hc3_src[sc1_subject];

					// count distinct probs
					let c_probs = 0;

					// dst probs tree
					const hc2_dst = overlayTree() as ProbsTree;

					// each probs
					for(const sc1_predicate in hc2_src) {
						// ref src objects set
						let as_objects_src = hc2_src[sc1_predicate];

						// set has target object
						if(as_objects_src.has(sc1_object)) {
							// create object set
							hc2_dst[sc1_predicate] = new Set(a_object_load);

							// increment pair count
							c_probs += 1;
						}
					}

					// no probs; skip
					if(!c_probs) continue;

					// save quads and predicate-keys count
					hc2_dst[$_KEYS] = c_probs;
					hc2_dst[$_QUADS] = c_probs;

					// save probs tree tree
					hc3_dst[sc1_subject] = hc2_dst;

					// increment super quads count
					c_quads += c_probs;

					// increment subject-keys count
					c_subjects += 1;
				}

				// no quads; empty tree
				if(!c_subjects) return PartiallyIndexedTrigDataset.empty(h_prefixes);

				// save quads and subject-keys count
				hc3_dst[$_KEYS] = c_subjects;
				hc3_dst[$_QUADS] = c_quads;

				// create dataset tree
				return this._offspring({
					[$_KEYS]: 1,
					[$_QUADS]: c_quads,
					[sc1_graph]: hc3_dst,
				} as QuadsTree);
			}
			// +graph, -subject, -predicate, -object
			else {
				// create dataset tree
				return this._offspring({
					[$_KEYS]: 1,
					[$_QUADS]: hc3_src[$_QUADS],
					[sc1_graph]: overlay(hc3_src),
				} as QuadsTree);
			}
		}
		// -graph
		else {
			// init dst quads hash
			const hc4_dst = overlayTree() as QuadsTree;

			// -graph, +subject
			if(yt_subject) {
				// convert subject to c1
				const sc1_subject = c1FromSubjectRole(yt_subject, h_prefixes);

				// -graph, +subject, +predicate
				if(yt_predicate) {
					// convert predicate to c1
					const sc1_predicate = c1FromPredicateRole(yt_predicate, h_prefixes);

					// graph-keys and quads counts
					let c_graphs = 0;
					let c_quads = 0;

					// -graph, +subject, +predicate, +object
					if(yt_object) {
						// convert object to c1
						const sc1_object = c1FromObjectRole(yt_object, h_prefixes);

						// prepare for loading into set multiple times
						const a_object_load = [sc1_object];

						// each graph
						for(const sc1_graph in hc4_src) {
							// ref src triples tree
							const hc3_src = hc4_src[sc1_graph];

							// no such subject; skip
							if(!(sc1_subject in hc3_src)) continue;

							// ref src probs tree
							const hc2_src = hc3_src[sc1_subject];

							// no such predicate; skip
							if(!(sc1_predicate in hc2_src)) continue;

							// ref src objects set
							const as_objects_src = hc2_src[sc1_predicate];

							// no such object; skip
							if(!as_objects_src.has(sc1_object)) continue;

							// create dst object set
							const as_objects_dst = new Set(a_object_load);

							// create dst triples tree
							hc4_dst[sc1_graph] = {
								[$_KEYS]: 1,
								[$_QUADS]: 1,
								[sc1_subject]: {
									[$_KEYS]: 1,
									[$_QUADS]: 1,
									[sc1_predicate]: as_objects_dst,
								},
							} as TriplesTree;

							// increment graph-keys & quads count
							c_quads += 1;
						}

						// graph-keys count matches quads count
						c_graphs = c_quads;
					}
					// -graph, +subject, +predicate, -object
					else {
						// each graph
						for(const sc1_graph in hc4_src) {
							// ref src triples tree
							const hc3_src = hc4_src[sc1_graph];

							// no such subject; skip
							if(!(sc1_subject in hc3_src)) continue;

							// ref src probs tree
							const hc2_src = hc3_src[sc1_subject];

							// no such predicate; skip
							if(!(sc1_predicate in hc2_src)) continue;

							// create dst objects set
							const as_objects_dst = new Set(hc2_src[sc1_predicate]);

							// how many objects are in set
							let n_objects = as_objects_dst.size;

							// create dst triples tree
							hc4_dst[sc1_graph] = {
								[$_KEYS]: 1,
								[$_QUADS]: n_objects,
								[sc1_subject]: {
									[$_KEYS]: 1,
									[$_QUADS]: n_objects,
									[sc1_predicate]: as_objects_dst,
								},
							} as TriplesTree;

							// increment graph-keys & quads count
							c_graphs += 1;
							c_quads += n_objects;
						}
					}

					// no quads; empty tree
					if(!c_graphs) return PartiallyIndexedTrigDataset.empty(h_prefixes);

					// save quads and graph-keys counts
					hc4_dst[$_KEYS] = c_graphs;
					hc4_dst[$_QUADS] = c_quads;

					// create dataset tree
					return this._offspring(hc4_dst);
				}
				// -graph, +subject, -predicate
				else {
					// count graph-keys and quads
					let c_graphs = 0;
					let c_quads = 0;

					// -graph, +subject, -predicate, +object
					if(yt_object) {
						// convert object to c1
						const sc1_object = c1FromObjectRole(yt_object, h_prefixes);

						// prepare for loading into set multiple times
						const a_object_load = [sc1_object];

						// each graph
						for(const sc1_graph in hc4_src) {
							// ref src triples tree
							const hc3_src = hc4_src[sc1_graph];

							// no such subject; skip
							if(!(sc1_subject in hc3_src)) continue;

							// ref src probs tree
							const hc2_src = hc3_src[sc1_subject];

							// count probs
							let c_probs = 0;

							// init dst probs tree
							const hc2_dst =  overlayTree() as ProbsTree;

							// each predicate
							for(const sc1_predicate in hc2_src) {
								// ref src objets set
								const as_objects_src = hc2_src[sc1_predicate];

								// no such object; skip
								if(!as_objects_src.has(sc1_object)) continue;

								// create dst objects set
								hc2_dst[sc1_predicate] = new Set(a_object_load);

								// increment probs count
								c_probs += 1;
							}

							// no probs tree to add; skip graph
							if(!c_probs) continue;

							// save predicate-keys and quads counts
							hc2_dst[$_KEYS] = c_probs;
							hc2_dst[$_QUADS] = c_probs;

							// save probs tree tree
							hc4_dst[sc1_graph] = {
								[$_KEYS]: 1,
								[$_QUADS]: c_probs,
								[sc1_subject]: hc2_dst,
							} as TriplesTree;

							// increment graph-keys and quads count
							c_graphs += 1;
							c_quads += c_probs;
						}
					}
					// -graph, +subject, -predicate, -object
					else {
						// each graph
						for(const sc1_graph in hc4_src) {
							// ref src triples tree
							const hc3_src = hc4_src[sc1_graph];

							// no such subject; skip
							if(!(sc1_subject in hc3_src)) continue;

							// ref src probs tree
							const hc2_src = hc3_src[sc1_subject];

							// quads under probs tree
							const n_quads = hc2_src[$_QUADS];

							// save thin copy of probs tree to dst quads hash
							hc4_dst[sc1_graph] = {
								[$_KEYS]: 1,
								[$_QUADS]: n_quads,
								[sc1_subject]: overlay(hc2_src),
							} as TriplesTree;

							// increment graph-keys and quads count
							c_graphs += 1;
							c_quads += n_quads;
						}
					}

					// no quads; empty tree
					if(!c_graphs) return PartiallyIndexedTrigDataset.empty(h_prefixes);

					// save graph-keys and quads count
					hc4_dst[$_KEYS] = c_graphs;
					hc4_dst[$_QUADS] = c_quads;

					// save graph-keys and quads counts
					return this._offspring(hc4_dst);
				}
			}
			// -graph, -subject
			else {
				// -graph, -subject, +predicate
				if(yt_predicate) {
					// convert predicate to c1
					const sc1_predicate = c1FromPredicateRole(yt_predicate, h_prefixes);

					// graph-keys and quads count
					let c_graphs = 0;
					let c_quads = 0;

					// -graph, -subject, +predicate, +object
					if(yt_object) {
						// convert predicate to c1
						const sc1_object = c1FromObjectRole(yt_object, h_prefixes);

						// prepare for loading into set multiple times
						const a_object_load = [sc1_object];

						// each graph
						for(const sc1_graph in hc4_src) {
							// ref src triples tree
							const hc3_src = hc4_src[sc1_graph];

							// subjet-keys count
							let c_subjects = 0;

							// init dst triples tree
							const hc3_dst = overlayTree() as TriplesTree;

							// each subject
							for(const sc1_subject in hc3_src) {
								// ref src probs tree
								const hc2_src = hc3_src[sc1_subject];

								// no such predicate; skip
								if(!(sc1_predicate in hc2_src)) continue;

								// ref src objects set
								const as_objects_src = hc2_src[sc1_predicate];

								// no such object; skip
								if(!as_objects_src.has(sc1_object)) continue;

								// create dst triples tree
								hc3_dst[sc1_subject] = {
									[$_KEYS]: 1,
									[$_QUADS]: 1,
									[sc1_predicate]: new Set(a_object_load),
								} as ProbsTree;

								// increment subject-keys and quads count
								c_subjects += 1;
							}

							// no triples trees to add; skip graph
							if(!c_subjects) continue;

							// save subject-keys and quads count
							hc3_dst[$_KEYS] = c_subjects;
							hc3_dst[$_QUADS] = c_subjects;

							// save triples tree tree
							hc4_dst[sc1_graph] = hc3_dst;

							// increment graph-keys and quads count
							c_graphs += 1;
							c_quads += c_subjects;
						}

						// no quads; empty tree
						if(!c_graphs) return PartiallyIndexedTrigDataset.empty(h_prefixes);

						// save graph-keys and quads count
						hc4_dst[$_KEYS] = c_graphs;
						hc4_dst[$_QUADS] = c_quads

						// create dataset tree
						return this._offspring(hc4_dst);
					}
					// -graph, -subject, +predicate, -object
					else {
						// each graph
						for(const sc1_graph in hc4_src) {
							// ref src triples tree
							const hc3_src = hc4_src[sc1_graph];

							// subjet-keys and quads count
							let c_subjects = 0;
							let c_triples = 0;

							// init dst triples tree
							const hc3_dst = overlayTree() as TriplesTree;

							// each subject
							for(const sc1_subject in hc3_src) {
								// ref src probs tree
								const hc2_src = hc3_src[sc1_subject];

								// no such predicate; skip
								if(!(sc1_predicate in hc2_src)) continue;

								// create dst objects set
								const as_objects_dst = new Set(hc2_src[sc1_predicate]);

								// objects count
								const n_objects = as_objects_dst.size;

								// create dst triples tree
								hc3_dst[sc1_subject] = {
									[$_KEYS]: 1,
									[$_QUADS]: n_objects,
									[sc1_predicate]: as_objects_dst,
								} as ProbsTree;

								// increment subject-keys and quads count
								c_subjects += 1;
								c_triples += n_objects;
							}

							// no triples trees to add; skip graph
							if(!c_subjects) continue;

							// save subject-keys and quads count
							hc3_dst[$_KEYS] = c_subjects;
							hc3_dst[$_QUADS] = c_triples;

							// save triples tree tree
							hc4_dst[sc1_graph] = hc3_dst;

							// increment graph-keys and quads count
							c_graphs += 1;
							c_quads += c_triples;
						}

						// no quads; empty tree
						if(!c_graphs) return PartiallyIndexedTrigDataset.empty(h_prefixes);

						// save graph-keys and quads counts
						hc4_dst[$_KEYS] = c_graphs;
						hc4_dst[$_QUADS] = c_quads;

						// create dataset tree
						return this._offspring(hc4_dst);
					}
				}
				// -graph, -subject, -predicate
				else {
					// -graph, -subject, -predicate, +object
					if(yt_object) {
						// convert predicate to c1
						const sc1_object = c1FromObjectRole(yt_object, h_prefixes);

						// prepare for loading into set multiple times
						const a_object_load = [sc1_object];

						// graph-keys and quads count
						let c_graphs = 0;
						let c_quads = 0;

						// each graph
						for(const sc1_graph in hc4_src) {
							// ref src triples tree
							const hc3_src = hc4_src[sc1_graph];

							// subject-keys and quads count
							let c_subjects = 0;
							let c_triples = 0;

							// init dst triples tree
							const hc3_dst = overlayTree() as TriplesTree;

							// each subject
							for(const sc1_subject in hc3_src) {
								// ref src probs tree
								const hc2_src = hc3_src[sc1_subject];

								// predicate-keys count
								let c_predicates = 0;

								// init dst probs tree
								const hc2_dst = overlayTree() as ProbsTree;

								// each predicate
								for(const sc1_predicate in hc2_src) {
									// ref src objects set
									const as_objects_src = hc2_src[sc1_predicate];

									// no such object; skip
									if(!as_objects_src.has(sc1_object)) continue;

									// create dst probs tree
									hc2_dst[sc1_predicate] = new Set(a_object_load);

									// increment predicate-keys count
									c_predicates += 1;
								}

								// no quads
								if(!c_predicates) continue;

								// save predicate-keys and quads count
								hc2_dst[$_KEYS] = c_predicates;
								hc2_dst[$_QUADS] = c_predicates;

								// increment subject-keys and triples count
								c_subjects += 1;
								c_triples += c_predicates;

								// save to triples tree tree
								hc3_dst[sc1_subject] = hc2_dst;
							}

							// no quads
							if(!c_subjects) continue;

							// save subject-keys and quads count
							hc3_dst[$_KEYS] = c_subjects;
							hc3_dst[$_QUADS] = c_triples;

							// increment graph-keys and quads count
							c_graphs += 1;
							c_quads += c_triples;

							// save triples tree tree
							hc4_dst[sc1_graph] = hc3_dst;
						}

						// no quads; empty tree
						if(!c_graphs) return PartiallyIndexedTrigDataset.empty(h_prefixes);

						// save subject-keys and quads count
						hc4_dst[$_KEYS] = c_graphs;
						hc4_dst[$_QUADS] = c_quads;

						// create dataset tree
						return this._offspring(hc4_dst);
					}
					// -graph, -subject, -predicate, -object
					else {
						// same quad tree (clone)
						return PartiallyIndexedTrigDataset.empty(h_prefixes);
					}
				}
			}
		}
	}


	/**
	 * Clone this dataset
	 */
	clone(h_prefixes_add?: PrefixMap) {
		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// bury
		hc4_quads[$_BURIED] = 1;

		// make overlay
		const hc4_out = Object.create(hc4_quads);
		hc4_out[$_OVERLAY] = 1;

		// prep prefixes
		const h_prefixes = h_prefixes_add
			? {
				...this._h_prefixes,
				...h_prefixes_add,
			}
			: this._h_prefixes;

		// return new dataset
		return new PartiallyIndexedTrigDataset(hc4_out, h_prefixes);
	}



	/**
	 * Create a new dataset by prefixing all c1 strings
	 */
	prefixed(): TrigDataset {
		// already prefixed, just clone it
		if(this._b_prefixed) return this.clone();

		// TODO: implement
	}


	/**
	 * Create a new dataset by expanding all c1 strings
	 */
	expanded(): TrigDataset {
		// already expanded, just clone it
		if(!this._b_prefixed) return this.clone();

		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// ref quads
		const hc4_quads = this._hc4_quads as QuadsTree;

		// prep quads out
		const hc4_out = overlayTree();

		// each graph
		for(const sc1_graph in hc4_quads) {
			// ref trips tree
			const hc3_trips = hc4_quads[sc1_graph];

			// prep trips out
			const hc3_out = hc4_out[c1ExpandData(sc1_graph, h_prefixes)] = overlayTree();

			// each subject
			for(const sc1_subject in hc3_trips) {
				// ref probs tree
				const hc2_probs = hc3_trips[sc1_subject];

				// prep probs out
				const hc2_out = hc3_out[c1ExpandData(sc1_subject, h_prefixes)] = overlayTree();

				// each predicate
				for(const sc1_predicate in hc2_probs) {
					// ref objects set
					const as_objects = hc2_probs[sc1_predicate];

					// prep objects out
					const as_out = hc2_out[c1ExpandData(sc1_predicate, h_prefixes)] = new Set<C1.Object>();

					// each object
					for(const sc1_object of as_objects) {
						as_out.add(c1ExpandData(sc1_object, h_prefixes));
					}
				}
			}
		}

		// return new dataset
		return new TrigDataset(hc4_out, h_prefixes);
	}


	/**
	 * Perform the union of two datasets
	 * @param k_other 
	 */
	union(z_other: RDFJS.Dataset): PartiallyIndexedTrigDataset {
		// other is graphy dataset
		if(z_other.isGraphyDataset) {
			// deduce dataset type
			switch(z_other.datasetType) {
				// same dataset type
				case this.datasetStorageType: {
					// prefix maps are identical
					if(Topology.EQUAL === relateMaps(this._h_prefixes, z_other._h_prefixes)) {
						return this._union_same(z_other);
					}
					// prefix maps differ; perform expanded union
					else {
						return this.toNQuadsDataset().union(z_other.toNQuadsDataset());
					}
				}
				
				// fall-through
			}
		}

		// resort to iterative merge
		{
			// clone this dataset
			const k_clone = this.clone(z_other._h_prefixes || {});

			// each quad in other; add to clone
			for(const g_quad of z_other) {
				k_clone.add(g_quad);
			}

			// return clone
			return k_clone;
		}
	}


	_union_same(k_other: PartiallyIndexedTrigDataset): PartiallyIndexedTrigDataset {
		// ref quads
		let hc4_quads_a = this._hc4_quads as PartiallyIndexed.QuadsTree;
		let hc4_quads_b = k_other._hc4_quads as PartiallyIndexed.QuadsTree;

		// a has less keys than b; swap quads
		if(hc4_quads_a[$_KEYS] < hc4_quads_b[$_KEYS]) {
			[hc4_quads_a, hc4_quads_b] = [hc4_quads_b, hc4_quads_a];
		}

		// prep quads union
		const hc4_quads_u = Object.create(hc4_quads_a);

		// union is now overlay
		hc4_quads_u[$_OVERLAY] = 1;

		// quads to add under quads
		let c_quads_add_quads = 0;

		// number of graph keys overriden
		let c_traced_graphs = 0;

		// each graph in a
		for(const sc1_graph in hc4_quads_a) {
			// graph is also in b
			if(sc1_graph in hc4_quads_b) {
				// ref triples
				let hc3_trips_a = hc4_quads_a[sc1_graph];
				let hc3_trips_b = hc4_quads_b[sc1_graph];

				// triples are not swapped relative to quads
				let b_swapped_triples = false;

				// a has less keys than b
				if(hc3_trips_a[$_KEYS] < hc3_trips_b[$_KEYS]) {
					// swap triples
					[hc3_trips_a, hc3_trips_b] = [hc3_trips_b, hc3_trips_a];

					// beware consequence of swap
					b_swapped_triples = true;
				}

				// prep triples union
				const hc3_trips_u = Object.create(hc3_trips_a);

				// union is now overlay
				hc3_trips_u[$_OVERLAY] = 1;

				// quads to add under trips
				let c_quads_add_trips = 0;

				// number of subject keys overriden
				let c_traced_subjs = 0;

				// each subject in 'a'
				for(const sc1_subject in hc3_trips_a) {
					// subject is also in 'b'
					if(sc1_subject in hc3_trips_b) {
						// ref probs
						let hc2_probs_a = hc3_trips_a[sc1_subject];
						let hc2_probs_b = hc3_trips_b[sc1_subject];

						// probs are not swapped relative to triples
						let b_swapped_probs = false;

						// 'a' has less keys than 'b'
						if(hc2_probs_a[$_KEYS] < hc2_probs_b[$_KEYS]) {
							// swap probs
							[hc2_probs_a, hc2_probs_b] = [hc2_probs_b, hc2_probs_a];

							// beware consequences of swap
							b_swapped_probs = true;
						}

						// prep probs union
						const hc2_probs_u = Object.create(hc2_probs_a);

						// union is now overlay
						hc2_probs_u[$_OVERLAY] = 1;

						// quads to add under probs
						let c_quads_add_probs = 0;

						// number of predicate keys overriden
						let c_traced_preds = 0;

						// each predicate in 'a'
						for(const sc1_predicate in hc2_probs_a) {
							// predicate is also in 'b'
							if(sc1_predicate in hc2_probs_b) {
								// ref objects
								const as_objects_a = hc2_probs_a[sc1_predicate];
								const as_objects_b = hc2_probs_b[sc1_predicate];

								// union sets
								const as_objects_u = new Set([...as_objects_a, ...as_objects_b]);
								
								// compute number of objects added
								const nl_objects_add = as_objects_u.size - as_objects_a.size;

								// at least one object was added to union objects set
								if(nl_objects_add) {
									// update quad counts with difference
									c_quads_add_probs += nl_objects_add;

									// save new objects set to probs union
									hc2_probs_u[sc1_predicate] = as_objects_u;

									// increment traced predicate key count
									c_traced_preds += 1;
								}
								// otherwise, no difference between objects sets: keep overlay
							}
							// otherwise, predicate is not in 'b': keep overlay
						}

						// count key increment using local var
						let c_keys_probs_new = 0;

						// each predicate in 'b'
						for(const sc1_predicate in hc2_probs_b) {
							// predicate is not in 'a'
							if(!(sc1_predicate in hc2_probs_a)) {
								// add all objects from this predicate
								const as_objects_u = hc2_probs_u[sc1_predicate] = new Set(hc2_probs_b[sc1_predicate]);

								// update quad counts
								c_quads_add_probs += as_objects_u.size;

								// increment probs key count
								c_keys_probs_new += 1;
							}
							// otherwise, predicate was already handled in previous loop block
						}

						// new keys were added to union probs tree; update key count now outside loop
						if(c_keys_probs_new) hc2_probs_u[$_KEYS] += c_keys_probs_new;

						// union probs* is different from 'a' probs*
						if(c_quads_add_probs) {
							// update counts
							hc2_probs_u[$_QUADS] += c_quads_add_probs;
							c_quads_add_trips += c_quads_add_probs;

							// union overrides all prototype predicate keys and overlays none
							if(c_traced_preds === hc2_probs_a[$_KEYS]) {
									// uninherit from 'a'
									Object.setPrototypeOf(hc2_probs_u, {});

									// set own key count property
									hc2_probs_u[$_KEYS] = c_traced_preds;

									// union probs tree is no longer an overlay
									delete hc2_probs_u[$_OVERLAY];
							}
							// union overlays prototype
							else {
								// 'a' is now buried
								hc2_probs_a[$_BURIED] = 1;
							}

							// override subject in trips union tree with probs union tree
							hc3_trips_u[sc1_subject] = hc2_probs_u;

							// increment traced subject key count
							c_traced_subjs += 1;
						}
						// union and 'a' are identical
						else {
							// 'a' is now buried
							hc2_probs_a[$_BURIED] = 1;

							// but union probs tree is not trips 'a' value, need to overlay trips union
							if(b_swapped_probs) {
								// override subject in trips union tree with probs union tree
								hc3_trips_u[sc1_subject] = hc2_probs_u;

								// increment traced subject key count
								c_traced_subjs += 1;
							}
							// otherwise, key/value in overlay is same as trips 'a'
						}
					}
				}

				// count key increment using local var
				let c_keys_trips_new = 0;

				// each subject in 'b'
				for(const p_subject in hc3_trips_b) {
					// subject is not in 'a'
					if(!(p_subject in hc3_trips_a)) {
						// ref probs
						const hc2_probs_b = hc3_trips_b[p_subject];

						// update quad counts
						c_quads_add_trips += hc2_probs_b[$_QUADS];

						// 'b' is now buried
						hc2_probs_b[$_BURIED] = 1;

						// add all probs from this subject and save to triples union
						const hc2_probs_u = hc3_trips_u[p_subject] = Object.create(hc2_probs_b);

						// union is now overlay
						hc2_probs_u[$_OVERLAY] = 1;

						// increment triples key count
						c_keys_trips_new += 1;
					}
					// otherwise, subject was already handled in previous loop block
				}

				// new keys were added to union triples tree; update key count now outside loop
				if(c_keys_trips_new) hc3_trips_u[$_KEYS] += c_keys_trips_new;

				// union trips* is different from 'a' trips*
				if(c_quads_add_trips) {
					// update counts
					c_quads_add_quads += c_quads_add_trips;

					// union overrides all prototype subject keys and overlays none
					if(c_traced_subjs === hc3_trips_a[$_KEYS]) {
						// uninherit from 'a'
						Object.setPrototypeOf(hc3_trips_u, {});
						
						// set own key count property
						hc3_trips_u[$_KEYS] = c_traced_subjs;

						// union trips tree is no longer an overlay
						delete hc3_trips_u[$_OVERLAY];
					}
					// union differs from prototype
					else {
						// 'a' is now buried
						hc3_trips_a[$_BURIED] = 1;
					}

					// override graph in trips union tree with trips union tree
					hc4_quads_u[sc1_graph] = hc3_trips_u;

					// increment traced graph key count
					c_traced_graphs += 1;
				}
				// no mutations, but prototype is invalid from triple swap
				else if(b_swapped_triples) {
					// override graph in trips union tree with trips union tree
					hc4_quads_u[sc1_graph] = hc3_trips_a;
				}
			}
		}

		// count key increment using local var
		let c_keys_quads_new = 0;

		// each graph in b
		for(const sc1_graph in hc4_quads_b) {
			// graph is not in a
			if(!(sc1_graph in hc4_quads_a)) {
				// add all triples from this graph
				let hc3_triples_u = hc4_quads_u[sc1_graph] = Object.create(hc4_quads_b[sc1_graph]);

				// increment quads key count
				c_keys_quads_new += 1;

				// update quad counts
				c_quads_add_quads += hc4_quads_b[$_QUADS];
			}
		}

		// new keys were added to union quads tree; update key count now outside loop
		if(c_keys_quads_new) hc4_quads_u[$_KEYS] += c_keys_quads_new;

		// union overrides all prototype predicate keys and overlays none
		if(c_traced_graphs === hc4_quads_a[$_KEYS]) {
			// uninherit from 'a'
			Object.setPrototypeOf(hc4_quads_u, {});

			// set own key count property
			hc4_quads_u[$_KEYS] = c_traced_graphs;

			// union probs tree is no longer an overlay
			delete hc4_quads_u[$_OVERLAY];
		}
		// union differs from prototype
		else {
			// flag descendents on source
			hc4_quads_u[$_BURIED] = 1;
		}

		// return new dataset
		return new PartiallyIndexedTrigDataset(hc4_quads_u, {
			// copy prefixes
			...this._h_prefixes,
		});
	}


	minus() {
		// TODO: in some cases, it will be faster to replace a tree in 'src' with an overlay of a tree from 'dst', and then delete keys from original tree
	}

}


export interface PartiallyIndexedTrigDataset {
	/**
	 * Indicates at runtime without that this class is compatible as a graphy dataset
	 */
	isGraphyDataset: true;

	/**
	 * Describes at runtime the canonical storage type interface for this datatset
	 */
	datasetStorageType: string;
}

PartiallyIndexedTrigDataset.prototype.isGraphyDataset = true;

PartiallyIndexedTrigDataset.prototype.datasetStorageType = `
	quads {
		[g: c1]: trips {
			[s: c1]: probs {
				[p: c1]: Set<o: c1>;
			};
		};
	};
`.replace(/\s+/g, '');


