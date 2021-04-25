/* eslint-disable no-use-before-define */
import crypto from 'crypto';

import {DataFactory} from '@graphy/core';

import {
	RDFJS,
	Role,
	Term,
	C1,
	Dataset,
	PrefixMap,
} from '@graphy/types';

import SyncC1Dataset = Dataset.SyncC1Dataset;
import SyncQuadTreeBuilder = Dataset.SyncQuadTreeBuilder;

// import {
// 	$_KEYS,
// 	$_QUADS,
// 	$_OVERLAY,
// 	$_BURIED,
// 	// GenericQuadTreeQuadTree,
// } from './common';

// import ProbsHash = GenericQuadTree.ProbsHash;
// import TriplesHash = GenericQuadTree.TriplesHash;
// import QuadsHash = GenericQuadTree.QuadsHash;
// import GraphHandle = GenericQuadTree.GraphHandle;
// import GrubHandle = GenericQuadTree.GrubHandle;
// import GraspHandle = GenericQuadTree.GraspHandle;
// import ObjectSet = GenericQuadTree.ObjectSet;

// import overlayTree = GenericQuadTree.overlayTree;
// import overlay = GenericQuadTree.overlay;
// import trace = GenericQuadTree.trace;

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
	prefixMapsDiffer,
} = DataFactory;

export interface Deliverable {
	new(...args: any[]): Dataset.SyncC1Dataset;
}

export interface BasicQuadTreeConstructor {
	new(...args: any[]): BasicQuadTree;
}


/**
 * Caches the number of 'keys' stored in the tree.
 */
export const $_KEYS = Symbol('key-count');

/**
 * Tracks the total count of quads stored at all descendent levels of the tree.
 */
export const $_QUADS = Symbol('quad-count');

/**
 * When present, indicates that the tree is overlaying another object via prototype.
 *   This allows for super quick set operations, such as `union` and `difference`, on
 *   the average case and significantly reduces memory consumption and GC time.
 */
export const $_OVERLAY = Symbol('overlay-status');

/**
 * When present, indicates that the tree was used to create an overlay for another tree.
 *   The implication is that if `add` or `delete` is called on a buried tree, the method
 *   will have to create a new tree since the original object may still be referenced.
 */
export const $_BURIED = Symbol('buried-status');


export interface CountableKeys {
	[$_KEYS]: number;
}

export type CountableQuads = CountableKeys & {
	[$_QUADS]: number;
}

export type OverlayableCountableQuads = CountableQuads & {
	[$_OVERLAY]?: number;
	[$_BURIED]?: number;
}

export type QuadsHash = OverlayableCountableQuads & {
	[sc1_graph: string]: TriplesHash;
}

export type TriplesHash = OverlayableCountableQuads & {
	[sc1_subject: string]: ProbsHash;
}

export type ProbsHash = OverlayableCountableQuads & {
	[sc1_predicate: string]: Set<C1.Object>;
}

export interface InternalGraphHandle extends Dataset.GraphHandle {
	_sc1_graph: C1.Graph;
	_hc3_trips: TriplesHash;
}

export interface InternalGrubHandle extends Dataset.GrubHandle {
	_kh_graph: InternalGraphHandle;
	_sc1_subject: C1.Subject;
	_hc2_probs: ProbsHash;
}

export interface InternalGraspHandle extends Dataset.GraspHandle {
	_as_objects: InternalObjectSet;
}

export type InternalObjectSet = Set<C1.Object>;


export type Tree = QuadsHash | TriplesHash | ProbsHash;


export const overlayTree = (n_keys=0, n_quads=0) => ({
	[$_KEYS]: n_keys,
	[$_QUADS]: n_quads,
	// [$_OVERLAY]: 0,
	// [$_SUPPORTING]: [],
}) as QuadsHash | TriplesHash | ProbsHash;

export const overlay = (hcw_src: any): Tree => {
	// create new tree
	const hcw_dst = Object.create(hcw_src);

	// src is now buried
	hcw_src[$_BURIED] = 1;

	// dst is an overlay
	hcw_dst[$_OVERLAY] = 1;

	return hcw_dst;
};

export const trace = (hcw_overlay: any): Tree => {
	// create dst tree
	const hcw_dst = {} as Tree;

	// check each key
	for(let sv1_key in hcw_overlay) {
		hcw_dst[sv1_key] = hcw_overlay[sv1_key];
	}

	// copy key count and quad count
	hcw_dst[$_KEYS] = hcw_overlay[$_KEYS];
	hcw_dst[$_QUADS] = hcw_overlay[$_QUADS];

	return hcw_dst;
};



/**
 * @fileoverview
 * The following table indicates the names for various groupings of RDF term roles:
 * 
 *  ┌─────────┬───────────┬─────────────┬──────────┐
 *  │ <graph> ┊ <subject> ┊ <predicate> ┊ <object> │
 *  ├─────────┴───────────┼─────────────┴──────────┤
 *  │        grub         │           prob         │
 *  ├─────────────────────┴─────────────┬──────────┤
 *  │               grasp               │░░░░░░░░░░│
 *  ├─────────┬─────────────────────────┴──────────┤
 *  │░░░░░░░░░│         spred           │░░░░░░░░░░│
 *  ├─────────┼─────────────────────────┴──────────┤
 *  │░░░░░░░░░│               triple               │
 *  ├─────────┴────────────────────────────────────┤
 *  │                      quad                    │
 *  └──────────────────────────────────────────────┘
 * 
 */


class GraspHandle implements InternalGraspHandle {
	_k_builder: BasicQuadTreeBuilder;
	_kh_grub: GrubHandle;
	_sc1_predicate: C1.Predicate;
	_sc1_subject: C1.Subject;
	_as_objects: Set<C1.Object>; 

	constructor(kh_grub: GrubHandle, sc1_predicate: C1.Predicate, as_objects: Set<C1.Object>) {
		this._k_builder = kh_grub._k_builder;
		this._kh_grub = kh_grub;
		this._sc1_subject = kh_grub._sc1_subject;
		this._sc1_predicate = sc1_predicate;
		this._as_objects = as_objects;
	}

	addC1Object(sc1_object: C1.Object): boolean {
		// ref object store
		const as_objects = this._as_objects;

		// triple already exists
		if(as_objects.has(sc1_object)) return false;

		// insert into object set
		as_objects.add(sc1_object);

		// ref quads tree
		const hc4_quads = this._k_builder._hc4_quads;

		// update quads counter on quads tree
		hc4_quads[$_QUADS] += 1;

		// ref triples tree
		const hc3_trips = hc4_quads[this._kh_grub._kh_graph._sc1_graph];

		// update quads counter on triples tree
		hc3_trips[$_QUADS] += 1;

		// update quads counter on probs tree
		hc3_trips[this._sc1_subject][$_QUADS] += 1;

		// new triple added
		return true;
	}
}


class GrubHandle implements InternalGrubHandle {
	_k_builder: BasicQuadTreeBuilder;
	_kh_graph: InternalGraphHandle;
	_sc1_subject: C1.Subject;
	_hc2_probs: ProbsHash;

	constructor(k_dataset: BasicQuadTreeBuilder, kh_graph: InternalGraphHandle, sc1_subject: C1.Subject, hc2_probs: ProbsHash) {
		this._k_builder = k_dataset;
		this._kh_graph = kh_graph;
		this._sc1_subject = sc1_subject;
		this._hc2_probs = hc2_probs;
	}

	openC1Predicate(sc1_predicate: C1.Predicate): Dataset.GraspHandle {
		// increment keys counter
		const hc2_probs = this._hc2_probs;

		// predicate exists; return tuple handle
		if(sc1_predicate in hc2_probs) {
			return new GraspHandle(this, sc1_predicate, hc2_probs[sc1_predicate]);
		}
		else {
			// increment keys counter
			hc2_probs[$_KEYS] += 1;

			// create predicate w/ empty objects set
			const as_objects = hc2_probs[sc1_predicate] = new Set();

			// return tuple handle
			return new GraspHandle(this, sc1_predicate, as_objects);
		}
	}
}

class StandaloneGraphHandle implements InternalGraphHandle {
	_k_builder: BasicQuadTreeBuilder;
	_sc1_graph: string;
	_hc3_trips: TriplesHash;
	 
	constructor(k_dataset: BasicQuadTreeBuilder, sc1_graph: C1.Graph, hc3_trips: TriplesHash) {
		this._k_builder = k_dataset;
		this._sc1_graph = sc1_graph;
		this._hc3_trips = hc3_trips;
	}

	openC1Subject(sc1_subject: C1.Subject): Dataset.GrubHandle {
		// ref triples tree
		const hc3_trips = this._hc3_trips;

		// subject exists; return subject handle
		if(sc1_subject in hc3_trips) {
			return new GrubHandle(this._k_builder, this, sc1_subject, hc3_trips[sc1_subject]);
		}
		else {
			// increment keys counter
			hc3_trips[$_KEYS] += 1;

			// create subject w/ empty probs tree
			const hc2_probs = hc3_trips[sc1_subject] = overlayTree() as ProbsHash;

			// return subject handle
			return new GrubHandle(this._k_builder, this, sc1_subject, hc2_probs);
		}
	}
}

function graph_to_c1(yt_graph: Role.Graph, h_prefixes: PrefixMap): C1.Graph {
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
		case 'BlankNode': {
			return '_:'+yt_graph.value;
		}

		// other
		default: {
			return '';
		}
	}
}

function dataset_already_delivered(): never {
	throw new Error(`Cannot use builder after dataset has been delivered`);;
}

/**
 * Trig-Optimized, Semi-Indexed Dataset in Memory
 * YES: ????, g???, g??o, g?po, gs??, gsp?, gspo
 * SOME: gs?o
 * NOT: ???o, ??p?, ??po, ?s??, ?s?o, ?sp?, ?spo, g?p?
 */
export class BasicQuadTreeBuilder implements Dataset.GraphHandle, Dataset.SyncQuadTreeBuilder<SyncC1Dataset> {
	_sc1_graph = '*';
	_hc3_trips: TriplesHash;
	_hc4_quads: QuadsHash;
	_h_prefixes: PrefixMap;

	static supportsStar = false;

	constructor(h_prefixes={} as PrefixMap, kd_init=BasicQuadTree.empty(h_prefixes)) {
		this._h_prefixes = h_prefixes;

		this._hc4_quads = kd_init._hc4_quads as QuadsHash;
		this._hc3_trips = kd_init._hc3_trips as TriplesHash;
	}

	openC1Graph(sc1_graph: C1.Graph): Dataset.GraphHandle {
		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// graph exists; return subject handle
		if(sc1_graph in hc4_quads) {
			return new StandaloneGraphHandle(this, sc1_graph, hc4_quads[sc1_graph]);
		}
		else {
			// increment keys counter
			hc4_quads[$_KEYS] += 1;

			// create graph w/ empty triples tree
			const hc3_trips = hc4_quads[sc1_graph] = overlayTree() as TriplesHash;

			// return subject handle
			return new StandaloneGraphHandle(this, sc1_graph, hc3_trips);
		}
	}

	openC1Subject(sc1_subject: C1.Node): Dataset.GrubHandle {
		// ref default graph triples tree
		const hc3_trips = this._hc3_trips;

		// subject exists; return subject handle
		if(sc1_subject in hc3_trips) {
			return new GrubHandle(this, this, sc1_subject, hc3_trips[sc1_subject]);
		}
		// subject not yet exists
		else {
			// increment keys counter
			hc3_trips[$_KEYS] += 1;

			// create subject w/ empty probs tree
			const hc2_probs = hc3_trips[sc1_subject] = overlayTree() as ProbsHash;

			// return subject handle
			return new GrubHandle(this, this, sc1_subject, hc2_probs);
		}
	}

	openGraph(yt_graph: Role.Graph): Dataset.GraphHandle {
		return this.openC1Graph(graph_to_c1(yt_graph, this._h_prefixes));
	}

	openSubject(yt_subject: Role.Subject): Dataset.GrubHandle {
		return this.openC1Subject('NamedNode' === yt_subject.termType? concise(yt_subject.value, this._h_prefixes): '_:'+yt_subject.value);
	}

	deliver(dc_dataset: Deliverable=BasicQuadTree): SyncC1Dataset {  // eslint-disable-line require-await
		// simplify garbage collection and prevent future modifications to dataset
		const hc4_quads = this._hc4_quads;
		this._hc4_quads = null as unknown as QuadsHash;
		this._hc3_trips = null as unknown as TriplesHash;
		this.openC1Subject = dataset_already_delivered;
		this.openC1Graph = dataset_already_delivered;


		// create dataset
		return new dc_dataset(hc4_quads, this._h_prefixes);
	}
}

@import './embed/normalizer.ts.jmacs';
@import './embed/union-same.ts.jmacs';


type StaticSelf = Function & {
	builder: {new(): Dataset.QuadTreeBuilder};
	empty(h_prefixes: PrefixMap): BasicQuadTree;
	new(hc4_quads: QuadsHash, h_prefixes: PrefixMap): BasicQuadTree;
};

// export interface QuadTree extends SyncC1Dataset {

// 	expand(): QuadTree;
// }

// interface Constructor extends GenericQuadTree.Constructor<QuadTree, QuadTreeBuilder, GenericQuadTree.QuadsHash> {}


// export const BasicQuadTree: Constructor = class BasicQuadTree implements QuadTree {
export class BasicQuadTree implements SyncC1Dataset {
	static Builder = BasicQuadTreeBuilder;

	/**
	 * Authoritative and immutable prefix map to use for c1 creation and resolution
	 */
	_h_prefixes: PrefixMap;

	/**
	 * Primary tree data structure for storing quads
	 */
	_hc4_quads: QuadsHash;

	/**
	 * Shortcut to the default graph
	 */
	_hc3_trips: TriplesHash;

	/**
	 * Internal self builder for creating match results or appending
	 */
	_k_builder: BasicQuadTreeBuilder;

	/**
	 * If true, c1 strings are prefixed. Otherwise, c1 strings are expanded
	 */
	_b_prefixed: boolean;

	/**
	 * Create new empty dataset
	 * @param h_prefixes 
	 */
	static empty(h_prefixes: PrefixMap): BasicQuadTree {
		return new BasicQuadTree({
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
		} as QuadsHash, h_prefixes);
	}

	/**
	 * Create new dataset
	 * @param hc4_quads 
	 * @param h_prefixes 
	 */
	constructor(hc4_quads: QuadsHash, h_prefixes: PrefixMap, b_prefixed=false) {
		this._hc4_quads = hc4_quads;
		this._hc3_trips = hc4_quads['*'];
		this._h_prefixes = h_prefixes;
		this._b_prefixed = b_prefixed;
		this._k_builder = new BasicQuadTreeBuilder(h_prefixes, this);
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
	* [Symbol.iterator](): Generator<Term.Quad> {
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
				const hc2_probs = hc3_trips[sc1_subject] as ProbsHash;

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
				const hc2_probs = hc3_trips[sc1_subject] as ProbsHash;

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

	distinctC1Subjects(): Set<C1.Subject> {
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

	* distinctPredicates(): Generator<Term.Predicate> {
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
			: this._k_builder as BasicQuadTreeBuilder;

		// use builder to efficiently add quad
		return kh_handle.openC1Subject(sc1_subject).openC1Predicate(sc1_predicate).addC1Object(sc1_object);
	}

	add(g_quad: RDFJS.Quad): this {
		const h_prefixes = this._h_prefixes;

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
		const hc2_probs = hc3_trips[concise(sc1_subject, h_prefixes)] as ProbsHash;

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
			.openC1Predicate(c1FromPredicateRole(g_quad.predicate, h_prefixes))
			.deleteC1Object(c1FromObjectRole(g_quad.object, h_prefixes));

		return this;
	}


	_offspring(hc4_out: QuadsHash): BasicQuadTree {
		return new BasicQuadTree(hc4_out, this._h_prefixes);
	}


	match(yt_subject?: Role.Subject | null, yt_predicate?: Role.Predicate | null, yt_object?: Role.Object | null, yt_graph?: Role.Graph| null): SyncC1Dataset {
		const h_prefixes = this._h_prefixes;
		const hc4_src = this._hc4_quads as QuadsHash;

		// +graph
		if(yt_graph) {
			// convert graph to c1
			const sc1_graph = c1FromGraphRole(yt_graph, h_prefixes);

			// no such graph; return new empty tree
			if(!(sc1_graph in hc4_src)) return BasicQuadTree.empty(h_prefixes);

			// ref triples tree
			const hc3_src = hc4_src[sc1_graph];

			// +grraph, +subject
			if(yt_subject) {
				// convert subject to c1
				let sc1_subject = c1FromSubjectRole(yt_subject, h_prefixes);

				// no such subject; return new empty tree
				if(!(sc1_subject in hc3_src)) return BasicQuadTree.empty(h_prefixes);

				// ref probs tree
				const hc2_src = hc3_src[sc1_subject];

				// +graph, +subject, +predicate
				if(yt_predicate) {
					// convert predicate to c1
					const sc1_predicate = c1FromPredicateRole(yt_predicate, h_prefixes);

					// no such predicate; return new empty tree
					if(!(sc1_predicate in hc2_src)) return BasicQuadTree.empty(h_prefixes);

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
						if(!as_objects_src.has(sc1_object)) return BasicQuadTree.empty(h_prefixes);
						
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
					} as QuadsHash);
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
					const hc2_dst = overlayTree() as ProbsHash;

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
					if(!c_probs) return BasicQuadTree.empty(h_prefixes);

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
					} as QuadsHash);
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
					} as QuadsHash);
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
				const hc3_dst = overlayTree() as TriplesHash;

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
						} as ProbsHash;

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
						} as ProbsHash;
						
						// increment quads & subject-keys count
						c_quads += as_objects_dst.size;
						c_subjects += 1;
					}
				}

				// no quads; empty tree
				if(!c_subjects) return BasicQuadTree.empty(h_prefixes);

				// save quads and subject-keys counts to dst triples tree
				hc3_dst[$_KEYS] = c_subjects;
				hc3_dst[$_QUADS] = c_quads;

				// create new tree
				return this._offspring({
					[$_KEYS]: 1,
					[$_QUADS]: c_quads,
					[sc1_graph]: hc3_dst,
				} as QuadsHash);
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
				const hc3_dst = overlayTree() as TriplesHash;

				// each triples
				for(const sc1_subject in hc3_src) {
					// ref src probs tree
					const hc2_src = hc3_src[sc1_subject];

					// count distinct probs
					let c_probs = 0;

					// dst probs tree
					const hc2_dst = overlayTree() as ProbsHash;

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
				if(!c_subjects) return BasicQuadTree.empty(h_prefixes);

				// save quads and subject-keys count
				hc3_dst[$_KEYS] = c_subjects;
				hc3_dst[$_QUADS] = c_quads;

				// create dataset tree
				return this._offspring({
					[$_KEYS]: 1,
					[$_QUADS]: c_quads,
					[sc1_graph]: hc3_dst,
				} as QuadsHash);
			}
			// +graph, -subject, -predicate, -object
			else {
				// create dataset tree
				return this._offspring({
					[$_KEYS]: 1,
					[$_QUADS]: hc3_src[$_QUADS],
					[sc1_graph]: overlay(hc3_src),
				} as QuadsHash);
			}
		}
		// -graph
		else {
			// init dst quads hash
			const hc4_dst = overlayTree() as QuadsHash;

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
							} as TriplesHash;

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
							} as TriplesHash;

							// increment graph-keys & quads count
							c_graphs += 1;
							c_quads += n_objects;
						}
					}

					// no quads; empty tree
					if(!c_graphs) return BasicQuadTree.empty(h_prefixes);

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
							const hc2_dst =  overlayTree() as ProbsHash;

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
							} as TriplesHash;

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
							} as TriplesHash;

							// increment graph-keys and quads count
							c_graphs += 1;
							c_quads += n_quads;
						}
					}

					// no quads; empty tree
					if(!c_graphs) return BasicQuadTree.empty(h_prefixes);

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
							const hc3_dst = overlayTree() as TriplesHash;

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
								} as ProbsHash;

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
						if(!c_graphs) return BasicQuadTree.empty(h_prefixes);

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
							const hc3_dst = overlayTree() as TriplesHash;

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
								} as ProbsHash;

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
						if(!c_graphs) return BasicQuadTree.empty(h_prefixes);

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
							const hc3_dst = overlayTree() as TriplesHash;

							// each subject
							for(const sc1_subject in hc3_src) {
								// ref src probs tree
								const hc2_src = hc3_src[sc1_subject];

								// predicate-keys count
								let c_predicates = 0;

								// init dst probs tree
								const hc2_dst = overlayTree() as ProbsHash;

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
						if(!c_graphs) return BasicQuadTree.empty(h_prefixes);

						// save subject-keys and quads count
						hc4_dst[$_KEYS] = c_graphs;
						hc4_dst[$_QUADS] = c_quads;

						// create dataset tree
						return this._offspring(hc4_dst);
					}
					// -graph, -subject, -predicate, -object
					else {
						// same quad tree (clone)
						return BasicQuadTree.empty(h_prefixes);
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
		return new BasicQuadTree(hc4_out, h_prefixes);
	}



	/**
	 * Create a new dataset by prefixing all c1 strings
	 */
	prefixed(): BasicQuadTree {
		// already prefixed, just clone it
		if(this._b_prefixed) return this.clone();

		// TODO: implement
	}


	/**
	 * Create a new dataset by expanding all c1 strings
	 */
	expanded(): BasicQuadTree {
		// already expanded, just clone it
		if(!this._b_prefixed) return this.clone();

		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// ref quads
		const hc4_quads = this._hc4_quads as QuadsHash;

		// prep quads out
		const hc4_out = overlayTree() as QuadsHash;

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
		return new BasicQuadTree(hc4_out, h_prefixes);
	}


	/**
	 * Perform the union of two datasets
	 * @param k_other 
	 */
	union(z_other: RDFJS.Dataset): BasicQuadTree {
		// other is graphy dataset
		if((z_other as any).isGraphyDataset) {
			// deduce dataset type
			switch((z_other as any).datasetType) {
				// same dataset type
				case (this as any).datasetStorageType: {
					// prefix maps differ; perform expanded union
					if(prefixMapsDiffer(this._h_prefixes, z_other._h_prefixes)) {
						return this.toNQuadsDataset().union(z_other.toNQuadsDataset());
					}
					// prefix maps are identical
					else {
						return this._union_same(z_other);
					}
				}
				
				// fall-through
			}
		}

		// resort to iterative merge
		{
			// clone this dataset
			const k_clone = this.clone((z_other as any)._h_prefixes || {});

			// each quad in other; add to clone
			for(const g_quad of z_other) {
				k_clone.add(g_quad);
			}

			// return clone
			return k_clone;
		}
	}


	_union_same(k_other: BasicQuadTree) {
		// ref quads
		let hc4_quads_a = this._hc4_quads;
		let hc4_quads_b = k_other._hc4_quads;

		// a has less keys than b; swap quads
		if(hc4_quads_a[$_KEYS] < hc4_quads_b[$_KEYS]) {
			[hc4_quads_a, hc4_quads_b] = [hc4_quads_b, hc4_quads_a];
		}
		@{union_same()}

		// return new dataset
		return new BasicQuadTree(hc4_quads_u, {
			// copy prefixes
			...this._h_prefixes,
		});
	}



	minus() {
		// TODO: in some cases, it will be faster to replace a tree in 'src' with an overlay of a tree from 'dst', and then delete keys from original tree
	}


	normalize() {
		return (new Normalizer(this)).normalize();
	}
}


// typings for fixed prototype properties
export interface BasicQuadTree {
	/**
	 * Indicates at runtime without that this class is compatible as a graphy dataset
	 */
	isGraphyDataset: true;

	/**
	 * Describes at runtime the canonical storage type interface for this datatset
	 */
	datasetStorageType: string;
}

BasicQuadTree.prototype.isGraphyDataset = true;

BasicQuadTree.prototype.datasetStorageType = '@{`
	quads {
		[g: c1]: trips {
			[s: c1]: probs {
				[p: c1]: Set<o: c1>;
			};
		};
	};
`.replace(/\s+/g, '')}';

