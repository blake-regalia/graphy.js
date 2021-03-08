import {
	RDFJS,
	C1,
	PrefixMap,
	Quad,
} from '@graphy/types';

/**
 * A handle on a specific (graph, subject, predicate) within an `ConciseGspoTreeBuilder`
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
export interface ConciseGspoBuilder<dc_dataset extends Dataset> extends GraphHandle {
	attachPrefixes(h_prefixes: PrefixMap): void;
	openC1Graph(sc1_graph: C1.Graph): GraphHandle;
	deliver(): Promise<dc_dataset>;
}

/**
 * 
 */
export interface Dataset {
	readonly size: number;

	add(quad: RDFJS.Quad): Dataset;
	delete(quad: RDFJS.Quad): Dataset;
	has(quad: RDFJS.Quad): boolean;
	match(subject?: RDFJS.Term, predicate?: RDFJS.Term, object?: RDFJS.Term, graph?: RDFJS.Term): Dataset;

	[Symbol.iterator](): Iterator<Quad>;
}
