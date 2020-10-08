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

import {
	TrigDatasetBuilder,
} from '../builder/trig-partial';

import {
	DataFactory,
// } from '@graphy/core';
} from '../../core/core';

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
} = DataFactory;

type StaticSelf = Function & {
	empty(h_prefixes: PrefixMap): TrigDataset;
	builder(h_prefixes: PrefixMap): TrigDatasetBuilder;
	new(hc4_quads: Generic.QuadsTree, h_prefixes: PrefixMap): TrigDataset;
};

export class TrigDataset implements SyncC1Dataset {
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
	_hc3_triples: Generic.TriplesTree;

	/**
	 * Internal self builder for creating match results or appending
	 */
	_k_builder: TrigDatasetBuilder;


	/**
	 * Create new empty dataset
	 * @param h_prefixes 
	 */
	static empty(h_prefixes: PrefixMap): TrigDataset {
		return new TrigDataset({
			[$_KEYS]: 1,
			[$_QUADS]: 0,
			// [$_OVERLAY]: 0,
			// [$_SUPPORTING]: [],
			['*']: {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
				// [$_OVERLAY]: 0,
				// [$_SUPPORTING]: [],
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
	constructor(hc4_quads: Generic.QuadsTree, h_prefixes: PrefixMap) {
		this._hc4_quads = hc4_quads;
		this._hc3_triples = hc4_quads['*'];
		this._h_prefixes = h_prefixes;
		this._k_builder = new TrigDatasetBuilder(h_prefixes, this);
	}

	/**
	 * Get the total number of quads stored in the dataset
	 */
	get size(): number {
		return this._hc4_quads[$_QUADS];
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
			const hc3_triples = hc4_quads[sc1_graph];

			// each subject
			for(const sc1_subject in hc3_triples) {
				// make subject node
				const kt_subject = c1Subject(sc1_subject, h_prefixes);

				// ref probs tree
				const hc2_probs = hc3_triples[sc1_subject] as ProbsTree;

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
			const hc3_triples = hc4_quads[sc1_graph];

			// each subject; add to set
			for(const sc1_subject in hc3_triples) {
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
			const hc3_triples = hc4_quads[sc1_graph];

			// each subject
			for(const sc1_subject in hc3_triples) {
				// ref probs tree
				const hc2_probs = hc3_triples[sc1_subject];

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
			const hc3_triples = hc4_quads[sc1_graph];

			// each subject
			for(const sc1_subject in hc3_triples) {
				// ref probs tree
				const hc2_probs = hc3_triples[sc1_subject] as ProbsTree;

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
			return this._hc3_triples[$_KEYS];
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
			for(let sc1_predicate in this._hc3_triples) {
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

		return kh_handle.openC1Subject(sc1_subject).openC1Predicate(sc1_predicate).addC1Object(sc1_object);
	}

	add(g_quad: RDFJS.Quad): this {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

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
		const hc3_triples = this._hc4_quads[c1FromGraphRole(g_quad.graph, h_prefixes)];

		// none
		if(!hc3_triples) return false;

		// ref subject
		const yt_subject = g_quad.subject;

		// create subject c1
		const sc1_subject = c1FromSubjectRole(g_quad.subject, h_prefixes);

		// fetch probs tree
		const hc2_probs = hc3_triples[concise(sc1_subject, h_prefixes)] as ProbsTree;

		// none
		if(!hc2_probs) return false;

		// fetch objects list
		const as_objects = hc2_probs[c1FromPredicateRole(g_quad.predicate, h_prefixes)];

		// none
		if(!as_objects) return false;

		// create object c1
		const sc1_object = c1FromObjectRole(g_quad.object);

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

	match_in(yt_subject?: Role.Subject | null, yt_predicate?: Role.Predicate | null, yt_object?: Role.Object | null, yt_graph?: Role.Graph| null): SyncC1Dataset {
		const h_prefixes = this._h_prefixes;
		const hc4_quads = this._hc4_quads;

		const dc_self = this.constructor as StaticSelf;

		// // prep new builder
		// const k_builder = dc_self.builder(h_prefixes);

		// prepare new dataset
		const k_result = new dc_self(hc4_quads, h_prefixes);

		// ref out quads tree
		const hc4_out = k_result._hc4_quads;

		// +graph
		if(yt_graph) {
			// convert graph to c1
			const sc1_graph = c1FromGraphRole(yt_graph, h_prefixes);

			// graph does not exist; return new empty dataset
			if(!(sc1_graph in hc4_quads)) return dc_self.empty(h_prefixes);

			// ref triples tree
			const hc3_triples = hc4_quads[sc1_graph];

			// open graph
			const hc3_out = hc4_out[sc1_graph] = overlayTree() as TriplesTree;

			// +graph, +subject
			if(yt_subject) {
				// convert subject to c1
				const sc1_subject = c1FromSubjectRole(yt_subject, h_prefixes);

				// subject does not exist; return new empty dataset
				if(!(sc1_subject in hc3_triples)) return dc_self.empty(h_prefixes);

				// ref probs tree
				const hc2_probs = hc3_triples[sc1_subject] as ProbsTree;

				// open subject
				const hc2_out = hc3_out[sc1_subject] = overlayTree() as ProbsTree;

				// +graph, +subject, +predicate
				if(yt_predicate) {
					// convert predicate to c1
					const sc1_predicate = c1FromPredicateRole(yt_predicate, h_prefixes);
	
					// subject does not exist; return new empty dataset
					if(!(sc1_predicate in hc2_probs)) return dc_self.empty(h_prefixes)

					// ref objects set
					const as_objects = hc2_probs[sc1_predicate];

					// +graph, +subject, +predicate, +object
					if(yt_object) {
						// convert object to c1
						const sc1_object = c1FromObjectRole(yt_object, this._h_prefixes);

						// object does not exist; return new empty dataset
						if(!as_objects.has(sc1_object)) return TrigDataset.empty(this._h_prefixes);

						// open predicate and add object to set
						hc2_out[sc1_predicate] = new Set<C1.Object>([sc1_object]);
					}
					// +graph, +subject, +predicate, -object
					else {
						// clone object set
						(kh_grasp as GraspHandle)._as_objects = new Set(as_objects as ObjectSet);

						// update quad count all the way up
						const nl_objects = as_objects.size;
						(kh_grub as GrubHandle)._hc2_probs[$_QUADS] = nl_objects;
						(kh_graph as GraphHandle)._hc3_triples[$_QUADS] = nl_objects;
						hc4_out[$_QUADS] = nl_objects;
					}

					// all keys and counts are good now, deliver dataset
					return k_builder.deliver();
				}
				// +graph, +subject, -predicate, +object
				else if(yt_object) {
					// convert object to c1
					const sc1_object = c1FromObjectRole(yt_object, h_prefixes);

					// whether or not its empty
					let b_empty = true;

					// dst probs tree
					const hc2_probs_out = kh_grub

					// each predicate
					for(const sc1_predicate in hc2_probs) {
						// object exists in grasp's object set; add to dataset and mark empty
						if(hc2_probs[sc1_predicate].has(sc1_object)) {
							kh_grub.openC1Predicate(sc1_predicate).addC1Object(sc1_object);
							b_empty = false;
						}
					}

					// empty
					if(b_empty) return dc_self.empty(h_prefixes);
				}
				// +graph, +subject, -predicate, -object
				else {
					// make overlay
					const hc2_new = (kh_grub as GrubHandle)._hc2_probs = Object.create(hc2_probs);
					hc2_new[$_OVERLAY] = 1;

					// link support
					(hc2_probs[$_BURIED] = hc2_probs[$_BURIED] || []).push(hc2_new);

					// update quad count all the way up
					const nl_objects = hc2_probs[$_QUADS];
					(kh_graph as GraphHandle)._hc3_triples[$_QUADS] = nl_objects;
					hc4_out[$_QUADS] = nl_objects;

					// all keys and counts are good now, deliver dataset
					return k_builder.deliver();
				}
			}
			// any subject
			else {

			}
		}
		// any graph
		else {

		}

		// return dataset
		return k_dataset;
	}

	_offspring(hc4_out: QuadsTree): TrigDataset {
		return new TrigDataset(hc4_out, this._h_prefixes);
	}


	match(yt_subject?: Role.Subject | null, yt_predicate?: Role.Predicate | null, yt_object?: Role.Object | null, yt_graph?: Role.Graph| null): SyncC1Dataset {
		const h_prefixes = this._h_prefixes;
		const hc4_src = this._hc4_quads as QuadsTree;

		// +graph
		if(yt_graph) {
			// convert graph to c1
			const sc1_graph = c1FromGraphRole(yt_graph, h_prefixes);

			// no such graph; return new empty tree
			if(!(sc1_graph in hc4_src)) return TrigDataset.empty(h_prefixes);

			// ref triples tree
			const hc3_src = hc4_src[sc1_graph];

			// +grraph, +subject
			if(yt_subject) {
				// convert subject to c1
				let sc1_subject = c1FromSubjectRole(yt_subject, h_prefixes);

				// no such subject; return new empty tree
				if(!(sc1_subject in hc3_src)) return TrigDataset.empty(h_prefixes);

				// ref probs tree
				const hc2_src = hc3_src[sc1_subject];

				// +graph, +subject, +predicate
				if(yt_predicate) {
					// convert predicate to c1
					const sc1_predicate = c1FromPredicateRole(yt_predicate, h_prefixes);

					// no such predicate; return new empty tree
					if(!(sc1_predicate in hc2_src)) return TrigDataset.empty(h_prefixes);

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
						if(!as_objects_src.has(sc1_object)) return TrigDataset.empty(h_prefixes);
						
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
						// [$_SUPPORTING]: [],
						[sc1_graph]: {
							[$_KEYS]: 1,
							[$_QUADS]: n_quads_objects,
							// [$_OVERLAY]: 0,
							// [$_SUPPORTING]: [],
							[sc1_subject]: {
								[$_KEYS]: 1,
								[$_QUADS]: n_quads_objects,
								// [$_OVERLAY]: 0,
								// [$_SUPPORTING]: [],
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
					if(!c_probs) return TrigDataset.empty(h_prefixes);

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
				if(!c_subjects) return TrigDataset.empty(h_prefixes);

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
				if(!c_subjects) return TrigDataset.empty(h_prefixes);

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
					if(!c_graphs) return TrigDataset.empty(h_prefixes);

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
					if(!c_graphs) return TrigDataset.empty(h_prefixes);

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
						if(!c_graphs) return TrigDataset.empty(h_prefixes);

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
						if(!c_graphs) return TrigDataset.empty(h_prefixes);

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
						if(!c_graphs) return TrigDataset.empty(h_prefixes);

						// save subject-keys and quads count
						hc4_dst[$_KEYS] = c_graphs;
						hc4_dst[$_QUADS] = c_quads;

						// create dataset tree
						return this._offspring(hc4_dst);
					}
					// -graph, -subject, -predicate, -object
					else {
						// same quad tree (clone)
						return this.union(new FastDataset());
					}
				}
			}
		}
	}

	_slice_match_gsp(k_builder: TrigDatasetBuilder, hc4_out: Generic.QuadsTree, kh_graph: Dataset.GraphHandle, kh_grub: Dataset.GrubHandle, kh_grasp: Dataset.GraspHandle, as_objects: Generic.ObjectSet, yt_object?: Role.Object | null): SyncC1Dataset {
		// object provided
		if(yt_object) {
			// convert to c1
			const sc1_object = c1FromObjectRole(yt_object, this._h_prefixes);

			// object does not exist; return new empty dataset
			if(!as_objects.has(sc1_object)) return TrigDataset.empty(this._h_prefixes);

			// object exists; add to dataset
			kh_grasp.addC1Object(sc1_object);
		}
		// any object
		else {
			// clone object set
			(kh_grasp as GraspHandle)._as_objects = new Set(as_objects as ObjectSet);

			// update quad count all the way up
			const nl_objects = as_objects.size;
			(kh_grub as GrubHandle)._hc2_probs[$_QUADS] = nl_objects;
			(kh_graph as GraphHandle)._hc3_triples[$_QUADS] = nl_objects;
			hc4_out[$_QUADS] = nl_objects;
		}

		// all keys and counts are good now, deliver dataset
		return k_builder.deliver();
	}


						// // each predicate
						// for(const sc1_predicate in hc2_probs) {
						// 	// ref object set
						// 	const as_objects = hc2_probs[sc1_predicate];

						// 	// clone object set
						// 	hc2_new[sc1_predicate] = new Set(as_objects);
						// }

						// // carry over keys and quad count
						// hc2_new[$_KEYS] = hc2_probs[$_KEYS];
						// hc2_new[$_QUADS] = hc2_probs[$_QUADS];
}
