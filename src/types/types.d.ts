// import * as RDFJS from '@rdfjs/types';

import type {
	AllowedRdfMode,
	RdfMode_11,
} from './const';

import type {
	RDFJS,
} from './rdfjs';

import type {
	Iri,
	Role,
	PrefixMap,
} from './root';

import type {
	C1,
	Term,
} from './forms';

import * as Api from './term';

export * from './const';
export * from './root';
export * from './forms';
export * from './rdfjs';
export * as Api from './term';

type Rdfjs11Quad = RDFJS.Quad<RdfMode_11>;

export namespace Dataset {
	export interface Config {
		prefixed?: boolean;
		prefixes?: PrefixMap;
	}

	/**
	 * A handle on a specific (graph, subject, predicate) within an `QuadTreeBuilder`
	 */
	export interface GraspHandle {
		/**
		 * Attempt to add a quad given by (graph, subject, predicate, `object`) to the dataset.
		 * @param object
		 * @returns `true` if the quad was inserted (indicates it did not previously exist), `false` otherwise
		 */
		addC1Object(object: C1.Object): boolean;

		/**
		 * Attempt to delete a quad given by (graph, subject, predicate, `object`) from the dataset.
		 * @param object
		 * @returns `true` if the quad was deleted (indicates it previously existed), `false` otherwise
		 */
		deleteC1Object(object: C1.Object): boolean;
	}

	/**
	 * A handle on a specific (graph, subject) within a `ConciseGspoTreeBuilder`.
	 */
	export interface GrubHandle {
		/**
		 * Open a new handle to obtain (graph, subject, `predicate`).
		 * @param predicate
		 */
		openC1Predicate(predicate: C1.Predicate): GraspHandle;
	}


	/**
	 * A handle on a specific graph within a `ConciseGspoTreeBuilder`.
	 */
	export interface GraphHandle {
		/**
		 * Open a new handle to obtain (graph, `subject`).
		 * @param subject
		 */
		openC1Subject(subject: C1.Subject): GrubHandle;
	}



	/**
	 * An interface for building a dataset in (graph, subject, predicate, object) order using concise terms.
	 */
	export interface AsyncQuadTreeBuilder<dc_dataset extends RDFJS.Dataset<Term.Quad>> extends GraphHandle {
		attachPrefixes(h_prefixes: PrefixMap): void;
		openC1Graph(sc1_graph: C1.Graph): GraphHandle;
		deliver(): Promise<dc_dataset>;
	}

	export interface SyncQuadTreeBuilder<
		s_mode extends AllowedRdfMode,
		Deliverable extends SyncDataset<s_mode>,
	> extends GraphHandle {
		// attachPrefixes(h_prefixes: PrefixMap): void;
		openC1Graph(sc1_graph: C1.Graph): GraphHandle;
		deliver(gc_dataset?: Config, datasetClass?: { new(...args:any[]): SyncDataset<s_mode> }): Deliverable;
	}


	export interface Static<DatasetType, BuilderClass, TransferType> {
		empty(prefixes: PrefixMap): DatasetType;
		builder(prefixes: PrefixMap): BuilderClass;
	}

	/**
	 *
	 */
	export interface SyncDataset<
		s_mode extends AllowedRdfMode=AllowedRdfMode,

		SubjectArg extends Api.Optional<Api.SubjectArg<s_mode>> = Api.Optional<Api.SubjectArg<s_mode>>,
		PredicateArg extends Api.Optional<Api.PredicateArg<s_mode>> = Api.Optional<Api.PredicateArg<s_mode>>,
		ObjectArg extends Api.Optional<Api.ObjectArg<s_mode>> = Api.Optional<Api.ObjectArg<s_mode>>,
		GraphArg extends Api.Optional<Api.GraphArg<s_mode>> = Api.Optional<Api.GraphArg<s_mode>>,
		QuadArg extends Api.QuadArg<s_mode> = Api.QuadArg<s_mode>,
	> /*extends RDFJS.Dataset<Term.Quad>*/ {
		readonly isGraphyDataset: true;
		readonly datasetStorageType: string;
		readonly size: number;

		[Symbol.iterator](): Iterator<Term.Quad>;

		add(quad: QuadArg): this;
		delete(quad: QuadArg): this;
		has(quad: QuadArg): boolean;
		match(subject?: SubjectArg, predicate?: PredicateArg, object?: ObjectArg, graph?: GraphArg): SyncDataset<s_mode>;

		distinctGraphCount(): number;
		distinctSubjectCount(): number;
		distinctPredicateCount(): number;
		distinctObjectCount(): number;

		distinctGraphs(): Generator<Term.Graph>;
		distinctSubjects(): Generator<Term.Subject>;
		distinctPredicates(): Generator<Term.Predicate>;
		distinctObjects(): Generator<Term.Object>;

		// equals(other: RDFJS.Dataset): boolean;
		contains(other: RDFJS.Dataset): boolean;
		disjoint(other: RDFJS.Dataset): boolean;

		// union(other: RDFJS.Dataset): SyncDataset;
		// intersection(other: SyncDataset): SyncDataset;
		minus(other: RDFJS.Dataset): SyncDataset<s_mode>;
		// difference(other: SyncDataset): SyncDataset;

		normalize(): SyncDataset<s_mode>;
		// delta(other: SyncDataset): Delta
	}

	export interface SyncC1Dataset<
		s_mode extends AllowedRdfMode,
		DatasetType extends SyncDataset<s_mode>,
	> extends SyncDataset<s_mode> {
		distinctC1Graphs(): Set<C1.Graph>;
		distinctC1Subjects(): Set<C1.Subject>;
		distinctC1Predicates(): Set<C1.Predicate>;
		distinctC1Objects(): Set<C1.Object>;

		addC1Quad(subject: C1.Subject, predicate: C1.Predicate, object: C1.Object, graph?: C1.Graph): boolean;
		clone(prefixes: PrefixMap): DatasetType;
		prefixed(): DatasetType;
		expanded(): DatasetType;
	}

	export interface AsyncDataset {
		distinctGraphCount(): Promise<number>;
		distinctSubjectCount(): Promise<number>;
		distinctPredicateCount(): Promise<number>;
		distinctObjectCount(): Promise<number>;
	}
}
