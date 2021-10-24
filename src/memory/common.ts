import {
	C1,
	Term,
	RDFJS,
	Dataset,
	PrefixMap,
	AllowedRdfMode,
	RdfMode_11,
	Api,
} from '@graphy/types';

import {
	DataFactory,
} from '@graphy/core';

const {
	concise,
	fromTerm,
	graphFromC1,
	subjectFromC1,
	predicateFromC1,
	objectFromC1,
	c1FromGraphRole,
	c1FromSubjectRole,
	c1FromPredicateRole,
	c1FromObjectRole,
	c1ExpandData,
	prefixMapsDiffer,
} = DataFactory;

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


export namespace IBasicQuadTree {
	export type QuadsHash = OverlayableCountableQuads & {
		[sc1_graph: string]: TriplesHash;
	}

	export type TriplesHash = OverlayableCountableQuads & {
		[sc1_subject: string]: ProbsHash;
	}

	export type ProbsHash = OverlayableCountableQuads & {
		[sc1_predicate: string]: Set<C1.Object>;
	}

	export interface GraphHandle extends Dataset.GraphHandle {
		_sc1_graph: C1.Graph;
		_hc3_trips: TriplesHash;
	}

	export interface GrubHandle extends Dataset.GrubHandle {
		_kh_graph: GraphHandle;
		_sc1_subject: C1.Subject;
		_hc2_probs: ProbsHash;
	}

	export interface GraspHandle extends Dataset.GraspHandle {
		_as_objects: ObjectSet;
	}

	export type ObjectSet = Set<C1.Object>;
}

export namespace ILinkedQuadTree {
	export type QuadsHash = OverlayableCountableQuads & {
		[sc1_graph: string]: TriplesHash;
	}

	export type TriplesHash = OverlayableCountableQuads & {
		[sc1_subject: string]: ProbsHash;
	}

	export type ProbsHash = OverlayableCountableQuads & {
		[sc1_predicate: string]: Set<ObjectDescriptor>;
	}

	export interface ObjectDescriptor {
		value: C1.Object;
		refs: ObjectReferencesMap;
	}

	export type ObjectReferencesMap = CountableQuads & {
		[sc1_predicate: string]: Set<C1.Subject>;
	}

	export type ObjectStore = CountableKeys & {
		[sc1_object: string]: ObjectDescriptor;
	}

	export type ObjectSet = Set<ObjectDescriptor>;
}

/* eslint-disable no-shadow */

type Iteratee<DatasetType, ReturnType> = (g_quad: Term.Quad, k_dataset: DatasetType) => ReturnType;


export abstract class GenericQuadTree<
	s_mode extends AllowedRdfMode,

	TreeType extends Dataset.SyncDataset<s_mode>,
	QuadsHash extends CountableQuads & {[s:string]:TriplesHash},
	TriplesHash extends CountableKeys,

	SubjectArg extends Api.Optional<Api.SubjectArg<s_mode>> = Api.Optional<Api.SubjectArg<s_mode>>,
	PredicateArg extends Api.Optional<Api.PredicateArg<s_mode>> = Api.Optional<Api.PredicateArg<s_mode>>,
	ObjectArg extends Api.Optional<Api.ObjectArg<s_mode>> = Api.Optional<Api.ObjectArg<s_mode>>,
	GraphArg extends Api.Optional<Api.GraphArg<s_mode>> = Api.Optional<Api.GraphArg<s_mode>>,
	QuadArg extends Api.QuadArg<s_mode> = Api.QuadArg<s_mode>,
> {
// > implements RDFJS.Dataset<Term.Quad> {
	/**
	 * Authoritative and immutable prefix map to use for c1 creation and resolution
	 * @internal
	 */
	_h_prefixes: PrefixMap;

	/**
	 * Primary tree data structure for storing quads
	 * @internal
	 */
	_hc4_quads: QuadsHash;

	/**
	 * Shortcut to the default graph
	 * @internal
	 */
	_hc3_trips: TriplesHash;

	/**
	 * If true, c1 strings are prefixed. Otherwise, c1 strings are expanded
	 * @internal
	 */
	_b_prefixed: boolean;

	/**
	 * The graphy storage type string for this dataset
	 */
	abstract datasetStorageType: string;


	constructor(hc4_quads: QuadsHash, gc_dataset: Dataset.Config={}) {
		this._hc4_quads = hc4_quads;
		this._hc3_trips = hc4_quads['*'];
		this._h_prefixes = gc_dataset.prefixes || {};
		this._b_prefixed = gc_dataset.prefixed || false;
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
	 * Get the prefixes
	*/
	get prefixes(): PrefixMap {
		return this._h_prefixes;
	}

	abstract [Symbol.iterator](): Generator<Term.Quad>;

	protected _total_distinct_graphs(): Set<C1.Graph> {
		// distinct graphs set
		const as_graphs = new Set<C1.Graph>();

		// each graph
		for(const sc1_graph in this._hc4_quads) {
			as_graphs.add(sc1_graph as C1.Graph);
		}

		// return set
		return as_graphs;
	}

	protected _total_distinct_subjects(): Set<C1.Subject> {
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
				as_subjects.add(sc1_subject as C1.Subject);
			}
		}

		// return set
		return as_subjects;
	}

	some(f_some: Iteratee<this, boolean>): boolean {
		for(const g_quad of this) {
			if(f_some(g_quad, this)) return true;
		}
		return false;
	}

	every(f_every: Iteratee<this, boolean>): boolean {
		for(const g_quad of this) {
			if(!f_every(g_quad, this)) return false;
		}
		return true;
	}

	forEach(f_each: Iteratee<this, void>): void {
		for(const g_quad of this) {
			f_each(g_quad, this);
		}
	}

	toArray(): Term.Quad[] {
		return [...this];
	}

	map(f_map: Iteratee<TreeType, Term.Quad>): TreeType {
		throw new Error('not yet implemented');
	}

	reduce<AccumulatorType=any>(f_reduce: (w_accumulator: AccumulatorType, g_quad: Term.Quad, k_dataset: this) => AccumulatorType, w_initial?: AccumulatorType): AccumulatorType {
		throw new Error('not yet implemented');
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
			for(const sc1_graph in this._hc4_quads) {
				as_subjects = new Set([...as_subjects, ...Object.keys(this._hc4_quads[sc1_graph])]);
			}
			return as_subjects.size;
		}
	}


	distinctC1Graphs(): Set<C1.Graph> {
		return this._total_distinct_graphs();
	}

	distinctC1Subjects(): Set<C1.Subject> {
		return this._total_distinct_subjects();
	}


	* distinctGraphs(): Generator<Term.Graph> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// each graph
		for(const sc1_graph of this.distinctC1Graphs()) {
			yield graphFromC1(sc1_graph, h_prefixes);
		}
	}

	* distinctSubjects(): Generator<Term.Subject> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// each subject
		for(const sc1_subject of this.distinctC1Subjects()) {
			yield subjectFromC1(sc1_subject, h_prefixes);
		}
	}

	abstract _equals(k_other: TreeType): boolean;

	equals(y_other: RDFJS.Dataset): boolean {
		// falsy
		if(!y_other) {
			const e_falsy = new TypeError(`'other' argument is falsy`);
			console.warn(`WARNING: ${e_falsy.stack}`);
			return false;
		}

		// reflection
		if((y_other as unknown) === this) return true;

		// graphy dataset
		if((y_other as any).isGraphyDataset) {
			const hc4_quads_a = this._hc4_quads;
			const hc4_quads_b = (y_other as any)._hc4_quads as QuadsHash;

			// quad count mismatch
			if(hc4_quads_a[$_QUADS] !== hc4_quads_b[$_QUADS]) return false;

			// key count mismatch
			if(hc4_quads_a[$_KEYS] !== hc4_quads_b[$_KEYS]) return false;

			// matching storage types
			if(this.datasetStorageType === (y_other as any).datasetStorageType) {
				// apply impl-specific equals test
				return this._equals(y_other as unknown as TreeType);
			}
			else {
				throw new Error(`not yet implemented`);
			}
		}
		// non-graphy
		else {
			throw new Error(`not yet implemented`);
		}
	}

	abstract add(g_quad: QuadArg): this;

	// abstract sibling(): TreeType;

	// abstract contains(y_other: RDFJS.Dataset): boolean;

	abstract deleteMatches(yt_subject?: SubjectArg, predicate?: PredicateArg, object?: ObjectArg, graph?: GraphArg): this;

	// abstract difference(y_other: RDFJS.Dataset): TreeType;

	// abstract filter(f_iteratee: (g_quad: Term.Quad, kd_dataset: this) => boolean): TreeType;

	// abstract import(ds_stream: RDFJS.Stream): Promise<this>;

	// abstract intersection(y_other: RDFJS.Dataset): TreeType;

	// abstract union(y_other: RDFJS.Dataset): TreeType;

	abstract match(yt_subject?: SubjectArg, predicate?: PredicateArg, object?: ObjectArg, graph?: GraphArg): TreeType;

	abstract delete(g_quad: QuadArg): this;

	abstract has(g_quad: QuadArg): boolean;

	toCanonical(): string {
		throw new Error('Method not yet implemented');
	}

	toStream(): RDFJS.Stream<Term.Quad> {
		throw new Error('Method not yet implemented');
	}

	addAll(z_quads: RDFJS.Dataset | QuadArg[]): this {
		for(const g_quad of z_quads) {
			// @ts-expect-error RDFJS.Dataset
			this.add(g_quad);
		}

		return this;
	}


	// every(f_iteratee: QuadFilterIteratee): boolean {
	// 	for(const g_quad of this) {
	// 		if(!f_iteratee(g_quad)) return false;
	// 	}

	// 	return true;
	// }

	// filter(f_iteratee: QuadFilterIteratee): TreeType {
	// 	const kd_new = this.sibling();

	// 	for(const g_quad of this) {
	// 		if(f_iteratee(g_quad)) {
	// 			kd_new.add(g_quad);
	// 		}
	// 	}

	// 	return kd_new;
	// }

	// some(f_iteratee: QuadFilterIteratee): TreeType {
	// 	for(const g_quad of this) {
	// 		if(!f_iteratee(g_quad)) return false;
	// 	}

	// 	return true;
	// }

	// forEach(f_iteratee: QuadFilterIteratee): void {
	// 	for(const g_quad of this) {
	// 		f_iteratee(g_quad);
	// 	}
	// }
}

// eslint-disable-next-line no-var,no-shadow
export namespace GenericQuadTree {
	export type QuadsHash = IBasicQuadTree.QuadsHash | ILinkedQuadTree.QuadsHash;
	export type TriplesHash = IBasicQuadTree.TriplesHash | ILinkedQuadTree.TriplesHash;
	export type ProbsHash = CountableQuads & {
		[sc1_predicate: string]: ObjectSet;
	};
	export type ObjectSet = Set<C1.Object | ILinkedQuadTree.ObjectDescriptor>;
	export type ObjectIdentifier = C1.Object & ILinkedQuadTree.ObjectDescriptor;

	export type Tree = QuadsHash | TriplesHash | ProbsHash;

	// export const overlayTree = (n_keys=0, n_quads=0) => ({
	// 	[$_KEYS]: n_keys,
	// 	[$_QUADS]: n_quads,
	// 	// [$_OVERLAY]: 0,
	// 	// [$_SUPPORTING]: [],
	// }) as QuadsHash | TriplesHash | ProbsHash;


	/**
	 * creates a new hash tree with the $_QUADS and $_KEYS properties set
	 */
	export const overlayTree = <HashType extends QuadsHash | TriplesHash | ProbsHash>(n_keys=0, n_quads=0) => ({
		[$_KEYS]: n_keys,
		[$_QUADS]: n_quads,
		// [$_OVERLAY]: 0,
		// [$_SUPPORTING]: [],
	}) as HashType;

	/**
	 * overlaying creates an object that inherits all properties from the src via prototype
	 * chaining and sets the $_BURIED property on the src and the $_OVERLAY property on dst
	 */
	export const overlay = (hcw_src: any): Tree => {
		// create new tree
		const hcw_dst = Object.create(hcw_src);

		// src is now buried
		hcw_src[$_BURIED] = 1;

		// dst is an overlay
		hcw_dst[$_OVERLAY] = 1;

		return hcw_dst;
	};

	/**
	 * tracing takes an overlay and creates a new plain object hash that has all the properties
	 * the overlay's prototype chain and own property set
	 */
	export const trace = (hcw_overlay: any): Tree => {
		// create dst tree
		const hcw_dst = {} as Tree;

		// check each key
		for(const sv1_key in hcw_overlay) {
			hcw_dst[sv1_key] = hcw_overlay[sv1_key];
		}

		// copy key count and quad count
		hcw_dst[$_KEYS] = hcw_overlay[$_KEYS];
		hcw_dst[$_QUADS] = hcw_overlay[$_QUADS];

		return hcw_dst;
	};

	export interface Static<
		s_mode extends AllowedRdfMode,
		DatasetType extends Dataset.SyncDataset<s_mode>,
		BuilderType extends Dataset.SyncQuadTreeBuilder<s_mode, DatasetType>,
		TransferType extends QuadsHash
	> extends Dataset.Static<DatasetType, BuilderType, TransferType> {
		empty(prefixes: PrefixMap): DatasetType;
		builder(prefixes: PrefixMap): BuilderType;
	}
}
