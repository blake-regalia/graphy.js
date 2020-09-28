import * as RDFJS from 'rdf-js';

type RDFJS_QuadGraph = RDFJS.DefaultGraph | RDFJS.NamedNode | RDFJS.BlankNode;
type RDFJS_QuadSubject = RDFJS.NamedNode | RDFJS.BlankNode;
type RDFJS_QuadPredicate = RDFJS.NamedNode;
type RDFJS_QuadObject = RDFJS.NamedNode | RDFJS.BlankNode | RDFJS.Literal;

import {
	ConciseNamedNode,
	ConciseTerm,
	ConciseNode,
	PrefixMap,
	SubjectRole,
	PredicateRole,
	ObjectRole,
	GraphRole,
	Quad,
} from '../core/data/factory';

/**
 * A handle on a specific (graph, subject, predicate) within an `IConciseGspoTreeBuilder`
 */
export interface IGreedHandle {
	/**
	 * Attempt to add a quad given by (graph, subject, predicate, `object`) to the dataset.
	 * @param object
	 * @returns `true` if the quad was inserted (indicates it did not previously exist), `false` otherwise
	 */
	addC1Object(object: ConciseTerm): boolean;

	/**
	 * Attempt to delete a quad given by (graph, subject, predicate, `object`) from the dataset.
	 * @param object
	 * @returns `true` if the quad was deleted (indicates it previously existed), `false` otherwise
	 */
	deleteC1Object(object: ConciseTerm): boolean;
}


/**
 * A handle on a specific (graph, subject) within an `IConciseGspoTreeBuilder`.
 */
export interface IGrubHandle {
	/**
	 * Open a new handle to obtain (graph, subject, `predicate`).
	 * @param predicate
	 */
	openC1Predicate(predicate: ConciseNamedNode): IGreedHandle;
}


/**
 * A handle on a specific graph within an `IConciseGspoTreeBuilder`.
 */
export interface IGraphHandle {
	/**
	 * Open a new handle to obtain (graph, `subject`).
	 * @param subject 
	 */
	openC1Subject(subject: ConciseNode): IGrubHandle;
}


/**
 * An interface for building a dataset in (graph, subject, predicate, object) order using concise terms.
 */
export interface IConciseGspoBuilder<dc_dataset extends IDataset> extends IGraphHandle {
	attachPrefixes(h_prefixes: PrefixMap): void;
	openC1Graph(sc1_graph: ConciseNode): IGraphHandle;
	deliver(): Promise<dc_dataset>;
}

/**
 * 
 */
export interface IDataset {
	readonly size: number;

	add(quad: RDFJS.Quad): IDataset;
	delete(quad: RDFJS.Quad): IDataset;
	has(quad: RDFJS.Quad): boolean;
	match(subject?: RDFJS.Term, predicate?: RDFJS.Term, object?: RDFJS.Term, graph?: RDFJS.Term): IDataset;

	[Symbol.iterator](): Iterator<Quad>;
}
