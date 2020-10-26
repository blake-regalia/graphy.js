import * as RDFJS from 'rdf-js';
import { resolve } from 'uri-js';

export {
	RDFJS as RDFJS,
};

/**
 * Namespace for cross-library Term role interfaces
 */
export namespace Role {
	export interface Data {
		readonly termType: 'DefaultGraph' | 'NamedNode' | 'BlankNode' | 'Literal';
		readonly value: string;
		equals(other: RDFJS.Term): boolean;
	}
	
	export interface Graph extends Data implements RDFJS.Quad_Graph {
		readonly termType: 'DefaultGraph' | 'NamedNode' | 'BlankNode';
		readonly value: string;
		equals(other: RDFJS.Term): boolean;
	}
	
	export interface Subject extends Data implements RDFJS.Quad_Subject {
		readonly termType: 'NamedNode' | 'BlankNode';
		readonly value: string;
		equals(other: RDFJS.Term): boolean;
	}
	
	export interface Predicate extends Data implements RDFJS.Quad_Predicate {
		readonly termType: 'NamedNode';
		readonly value: string;
		equals(other: RDFJS.Term): boolean;
	}
	
	export interface Object extends Data implements RDFJS.Quad_Object {
		readonly termType: 'NamedNode' | 'BlankNode' | 'Literal';
		readonly value: string;
		readonly language?: string;
		readonly datatype?: RDFJS.NamedNode;
		equals(other: RDFJS.Term): boolean;
	}
}

/**
 * Namespace for graphy-specific Term interfaces
 */
export namespace Term {
	export type Graph = Node | DefaultGraph;
	export type Subject = Node;
	export type Predicate = NamedNode;
	export type Object = Node | GenericLiteral;

	export interface GenericTerm {
		readonly isGraphyTerm: true;
		readonly isGraphyQuad: boolean;
		readonly isGraphable: boolean;
		readonly isDefaultGraph: boolean;
		readonly isNode: boolean;
		readonly isNamedNode: boolean;
		readonly isBlankNode: boolean;
		readonly isAnonymousBlankNode: boolean;
		readonly isEphemeralBlankNode: boolean;
		readonly isLiteral: boolean;
		readonly isLanguagedLiteral: boolean;
		readonly isDatatypedLiteral: boolean;
		readonly isSimpleLiteral: boolean;
		readonly isNumericLiteral: boolean;
		readonly isIntegerLiteral: boolean;
		readonly isDoubleLiteral: boolean;
		readonly isDecimalLiteral: boolean;
		readonly isBooleanLiteral: boolean;
		readonly isInfiniteLiteral: boolean;
		readonly isNaNLiteral: boolean;

		readonly termType: string;
		readonly value: string;

		equals(other: RDFJS.Term): boolean;
		concise(prefixes?: PrefixMap): C1.Term;
		terse(prefixes?: PrefixMap): Terse.Term;
		star(prefixes?: PrefixMap): Star.Term;
		verbose(): Verbose.Term;
		isolate(): Isolated.AnyTerm;
		hash(): string;
		replace(searchValue: any, replaceValue: any): GenericTerm;
		replaceAll(searchValue: any, replaceValue: any): GenericTerm;
	}

	interface NonLiteralTerm extends GenericTerm {
		readonly isLiteral: false;
		readonly isLanguagedLiteral: false;
		readonly isDatatypedLiteral: false;
		readonly isSimpleLiteral: false;
		readonly isNumericLiteral: false;
		readonly isIntegerLiteral: false;
		readonly isDoubleLiteral: false;
		readonly isDecimalLiteral: false;
		readonly isBooleanLiteral: false;
		readonly isInfiniteLiteral: false;
		readonly isNaNLiteral: false;
	}

	interface Graphable extends NonLiteralTerm implements Role.Graph, Role.Data {
		readonly isGraphyQuad: false;
		readonly isGraphable: true;

		readonly termType: 'DefaultGraph' | 'NamedNode' | 'BlankNode';
	}

	export interface Node extends Graphable implements Role.Data, Role.Subject, Role.Object {
		readonly isDefaultGraph: false;
		readonly isNode: true;

		readonly termType: 'NamedNode' | 'BlankNode';
	}

	export interface GenericLiteral extends GenericTerm implements Role.Data, Role.Object {
		readonly isGraphyQuad: false;
		readonly isGraphable: false;
		readonly isDefaultGraph: false;
		readonly isNode: false;
		readonly isNamedNode: false;
		readonly isBlankNode: false;
		readonly isAnonymousBlankNode: false;
		readonly isEphemeralBlankNode: false;
		readonly isLiteral: true;

		readonly termType: 'Literal';
		readonly value: string;
		readonly language: string;
		readonly datatype: NamedNode;

		concise(prefixes?: PrefixMap): C1.Literal;
		terse(prefixes?: PrefixMap): Terse.Literal;
		star(prefixes?: PrefixMap): Star.Literal;
		verbose(): Verbose.Literal;
		isolate(): Isolated.Literal;
	}

	export interface NamedNode extends Node implements RDFJS.NamedNode implements Role.Predicate {
		readonly isDefaultGraph: false;
		readonly isNamedNode: true;
		readonly isBlankNode: false;
		readonly isAnonymousBlankNode: false;
		readonly isEphemeralBlankNode: false;

		readonly termType: 'NamedNode';
		readonly value: Iri;

		constructor(iri: Iri);
		concise(prefixes?: PrefixMap): C1.NamedNode;
		terse(prefix?: PrefixMap): Terse.NamedNode;
		star(prefixes?: PrefixMap): Star.NamedNode;
		verbose(): Verbose.NamedNode;
		isolate(): Isolated.NamedNode;
		replace(searchValue: any, replaceValue: any): NamedNode;
		replaceAll(searchValue: any, replaceValue: any): NamedNode;
	}

	export interface BlankNode extends Node implements RDFJS.BlankNode {
		readonly isDefaultGraph: false;
		readonly isNamedNode: false;
		readonly isBlankNode: true;

		readonly termType: 'BlankNode';
		readonly value: string;    

		constructor(label: string);
		concise(prefixes?: PrefixMap): C1.BlankNode;
		terse(prefixes?: PrefixMap): Terse.BlankNode;
		star(prefixes?: PrefixMap): Star.BlankNode;
		verbose(): Verbose.BlankNode;
		isolate(): Isolated.BlankNode;
		replace(searchValue: any, replaceValue: any): BlankNode;
		replaceAll(searchValue: any, replaceValue: any): BlankNode;
	}

	export interface AnonymousBlankNode extends BlankNode implements RDFJS.BlankNode {
		readonly isAnonymousBlankNode: true;
	}

	export interface EphemeralBlankNode extends AnonymousBlankNode implements RDFJS.BlankNode {
		readonly isEphemeralBlankNode: true;
	}

	export interface LanguagedLiteral extends GenericLiteral implements RDFJS.Literal {
		readonly isLanguagedLiteral: true;
		readonly isDatatypedLiteral: false;
		readonly isSimpleLiteral: false;
		readonly isNumericLiteral: false;
		readonly isIntegerLiteral: false;
		readonly isDoubleLiteral: false;
		readonly isDecimalLiteral: false;
		readonly isBooleanLiteral: false;
		readonly isInfiniteLiteral: false;
		readonly isNaNLiteral: false;

		constructor(value: string, language: string);
		replace(searchValue: any, replaceValue: any): LanguagedLiteral;
		replaceAll(searchValue: any, replaceValue: any): LanguagedLiteral;
	}

	export interface DatatypedLiteral extends GenericLiteral implements RDFJS.Literal {
		readonly isNamedNode: false;
		readonly isBlankNode: false;
		// --
		readonly isLanguagedLiteral: false;
		readonly isDatatypedLiteral: true;
		readonly isSimpleLiteral: false;

		constructor(value: string, datatype: NamedNode);
		replace(searchValue: any, replaceValue: any): DatatypedLiteral;
		replaceAll(searchValue: any, replaceValue: any): DatatypedLiteral;
	}

	export interface NumericLiteral extends DatatypedLiteral {
		readonly isNumericLiteral: true;
		readonly isBooleanLiteral: false;

		readonly number: number;
	}

	export interface IntegerLiteral extends NumericLiteral {
		readonly isIntegerLiteral: true;
		readonly isDoubleLiteral: false;
		readonly isDecimalLiteral: false;
		readonly isInfiniteLiteral: false;
		readonly isNaNLiteral: false;

		constructor(value: number | string);
	}

	export interface DoubleLiteral extends NumericLiteral {
		readonly isIntegerLiteral: false;
		readonly isDoubleLiteral: true;
		readonly isDecimalLiteral: false;

		constructor(value: number | string);
	}

	export interface InfiniteLiteral extends DoubleLiteral {
		readonly isInfiniteLiteral: true;
		readonly isNaNLiteral: false;

		readonly boolean: boolean;
	}

	export interface PositiveInfinityLiteral extends InfiniteLiteral {
		readonly value: 'INF';
		// readonly number: Infinity;
	}

	export interface NegativeInfinityLiteral extends InfiniteLiteral {
		readonly value: '-INF';
		// readonly number: -Infinity;
	}

	export interface NaNLiteral extends DoubleLiteral {
		readonly isNaNLiteral: true;

		readonly value: 'NaN';
	}

	export interface DecimalLiteral extends NumericLiteral {
		readonly isIntegerLiteral: false;
		readonly isDoubleLiteral: false;
		readonly isDecimalLiteral: true;
		readonly isInfiniteLiteral: false;
		readonly isNaNLiteral: false;

		constructor(value: number | string);
	}

	export interface BooleanLiteral extends DatatypedLiteral {
		readonly isNumericLiteral: false;
		readonly isIntegerLiteral: false;
		readonly isDoubleLiteral: false;
		readonly isDecimalLiteral: false;
		readonly isBooleanLiteral: true;
		readonly isInfiniteLiteral: false;
		readonly isNaNLiteral: false;

		readonly boolean: boolean;
	}

	export interface SimpleLiteral extends GenericLiteral implements RDFJS.Literal {
		readonly isNamedNode: false;
		readonly isBlankNode: false;
		// --
		readonly isLanguagedLiteral: false;
		readonly isDatatypedLiteral: false;
		readonly isSimpleLiteral: true;
		readonly isNumericLiteral: false;
		readonly isIntegerLiteral: false;
		readonly isDoubleLiteral: false;
		readonly isDecimalLiteral: false;
		readonly isBooleanLiteral: false;
		readonly isInfiniteLiteral: false;
		readonly isNaNLiteral: false;

		constructor(value: string, datatype: NamedNode);
		replace(searchValue: any, replaceValue: any): SimpleLiteral;
		replaceAll(searchValue: any, replaceValue: any): SimpleLiteral;
	}

	export interface DefaultGraph extends Graphable implements RDFJS.DefaultGraph {
		readonly isDefaultGraph: true;
		
		readonly termType: 'DefaultGraph';
		readonly value: '';
		
		constructor();
		concise(prefixes?: PrefixMap): C1.DefaultGraph;
		terse(prefix?: PrefixMap): Terse.DefaultGraph;
		star(prefixes?: PrefixMap): Star.DefaultGraph;
		verbose(): Verbose.DefaultGraph;
		isolate(): Isolated.DefaultGraph;
		replace(searchValue: any, replaceValue: any): DefaultGraph;
		replaceAll(searchValue: any, replaceValue: any): DefaultGraph;
	}

	interface NonDataTerm extends NonLiteralTerm {
		readonly isDefaultGraph: false;
		readonly isGraphable: false;
		readonly isNode: false;
		readonly isNamedNode: false;
		readonly isBlankNode: false;
		readonly isAnonymousBlankNode: false;
		readonly isEphemeralBlankNode: false;
	}

	export interface Variable extends NonDataTerm implements RDFJS.Variable {
		readonly isGraphyQuad: false;
		readonly isVariable: true;

		readonly termType: 'Variable';
		readonly value: string;
		constructor(value: string);

		concise(prefixes?: PrefixMap): C1.Variable;
		terse(prefixes?: PrefixMap): Terse.Variable;
		star(prefixes?: PrefixMap): Star.Variable;
		verbose(): Verbose.Variable;
		isolate(): Isolated.Variable;
		replace(searchValue: any, replaceValue: any): Variable;
		replaceAll(searchValue: any, replaceValue: any): Variable;
	}

	export interface Reification {
		readonly node: BlankNode;
		readonly quads: Array<Quad>;
	}

	export interface Quad extends NonDataTerm implements RDFJS.Quad {
		readonly isGraphyQuad: true;
		readonly isVariable: false;

		readonly termType: 'Quad';
		readonly value: '';
		readonly subject: Term.Subject;
		readonly predicate: Term.Predicate;
		readonly object: Term.Object;
		readonly graph: Term.Graph;
		constructor(subject: Role.Subject, predicate: Role.Predicate, object: Role.Object, graph?: Role.Graph);
		isolate(): IsolatedQuad;
		reify(label?: string): Reification;

		concise(prefixes?: PrefixMap): C1.QuadTerm;
		terse(prefixes?: PrefixMap): Terse.Quad;
		star(prefixes?: PrefixMap): Star.QuadTerm;
		verbose(): Verbose.Quad;
		isolate(): Isolated.Quad;
		replace(searchValue: any, replaceValue: any): Quad;
		replaceAll(searchValue: any, replaceValue: any): Quad;
	}

}

export type Iri = string;

export namespace C1 {
	export type NamedNode = string;
	export type BlankNode = string;
	export type DefaultGraph = '*';
	export type Literal = string;
	export type Variable = string;
	export type QuadTerm = string;

	export type Node = NamedNode | BlankNode;
	export type Graphable = Node | DefaultGraph;
	export type DataTerm = Graphable | Literal;
	
	export type Graph = Graphable;
	export type Subject = Node | QuadTerm;
	export type Predicate = NamedNode;
	export type Object = Node | Literal | QuadTerm;

	export type Json = string;
	export type Directive = string;

	export type Term = DataTerm | Variable | Json | Directive | QuadTerm;

	export interface QuadBundle implements Iterable<Quad> {
		[Symbol.iterator]: () => Iterator<Quad>;
		toString(): C1.Json;
	}
}

export namespace C4 {
	export type ObjectsTarget = boolean | number | Role.Object;
	export type ObjectsList = Array<ObjectsTarget> | Set<ObjectsTarget>;
	export type ObjectsCollection = Array<ObjectsList> | Set<ObjectsList>;
	export type Objects = ObjectsTarget | ObjectsList | ObjectsCollection;

	export type StrictObjects = Array<Role.Object>;

	export interface Pairs {
		// [predicate: ConciseNamedNode]: ConciseObjects;
		[predicate: string]: Objects;
	}

	export interface Triples {
		// [subject: ConciseNode]: ConcisePairs;
		[subject: string]: Pairs;
	}

	export interface Quads {
		// [graph: ConciseGraphable]: ConciseTriples;
		[graph: string]: Triples;
	}
}

export namespace Terse {
	export type NamedNode = string;
	export type BlankNode = string;
	export type DefaultGraph = '*';
	export type Literal = string;
	export type Variable = string;

	export type Quad = string;

	export type Node = NamedNode | BlankNode;
	export type Graphable = Node | DefaultGraph;
	export type DataTerm = Graphable | Literal;
	
	export type GraphRole = Graphable;
	export type SubjectRole = Node;
	export type PredicateRole = NamedNode;
	export type ObjectRole = Node | Literal;

	export type Term = DataTerm | Variable;
}

export namespace Verbose {
	export type NamedNode = string;
	export type BlankNode = string;
	export type DefaultGraph = '';
	export type Literal = string;
	export type Variable = string;

	export type Quad = string;

	export type Node = NamedNode | BlankNode;
	export type Graphable = Node | DefaultGraph;
	export type DataTerm = Graphable | Literal;
	
	export type GraphRole = Graphable;
	export type SubjectRole = Node | QuadTerm;
	export type PredicateRole = NamedNode;
	export type ObjectRole = Node | Literal | QuadTerm;

	export type Term = DataTerm | Variable | Json | Directive | QuadTerm;
}

export namespace Star {
	export type NamedNode = Terse.NamedNode;
	export type BlankNode = Terse.BlankNode;
	export type DefaultGraph = '';
	export type Literal = Terse.Literal;
	export type Variable = Terse.Variable;
	export type QuadTerm = string;

	export type Quad = string;

	export type Node = NamedNode | BlankNode;
	export type Graphable = Node | DefaultGraph;
	export type DataTerm = Graphable | Literal;
	
	export type GraphRole = Graphable;
	export type SubjectRole = Node | QuadTerm;
	export type PredicateRole = NamedNode;
	export type ObjectRole = Node | Literal | QuadTerm;

	export type Term = DataTerm | Variable | QuadTerm;
}

export namespace Isolated {
	interface NamedNode {
		termType: 'NamedNode';
		value: string;
	}
	
	interface BlankNode {
		termType: 'BlankNode';
		value: string;
	}
	
	interface DefaultGraph {
		termType: 'DefaultGraph';
		value: '';
	}
	
	interface Literal {
		termType: 'Literal';
		value: string;
		language: string;
		datatype: NamedNode;
	}
	
	interface Variable {
		termType: 'Variable';
		value: string;
	}
	
	export type Node = NamedNode | BlankNode;
	export type Graphable = Node | DefaultGraph;
	export type Object = Node | GenericLiteral;
	export type DataTerm = GraphTerm | Literal;
	// type Data = DataTerm | Quad;

	type Any = Graphable | Literal | Quad | Variable;
	
	interface Quad {
		termType: 'Quad';
		value: '';
		subject: Node;
		predicate: NamedNode;
		object: Object;
		graph: Graphable;
	}
}

export interface PrefixMap {
	[prefixId: string]: Iri;
}

export interface PrefixMapRelation {
	relation: 'disjoint' | 'equal' | 'superset' | 'subset' | 'overlap';
	conflicts: Array<string>;
}

export namespace Dataset {
	/**
	 * A handle on a specific (graph, subject, predicate) within an `GspoBuilder`
	 */
	export interface GraspHandle {
		/**
		 * Attempt to add a quad given by (graph, subject, predicate, `object`) to the dataset.
		 * @param object
		 * @returns `true` if the quad was inserted (indicates it did not previously exist), `false` otherwise
		 */
		addC1Object(object: C1.Term): boolean;
	}

	/**
	 * A handle on a specific (graph, subject) within a `GspoBuilder`.
	 */
	export interface GrubHandle {
		/**
		 * Open a new handle to obtain (graph, subject, `predicate`).
		 * @param predicate
		 */
		openC1Predicate(predicate: C1.NamedNode): GraspHandle;
	}

	/**
	 * A handle on a specific graph within a `GspoBuilder`.
	 */
	export interface GraphHandle {
		/**
		 * Open a new handle to obtain (graph, `subject`).
		 * @param subject 
		 */
		openC1Subject(subject: C1.Node): GrubHandle;
	}


	/**
	 * An interface for building a dataset in (graph, subject, predicate, object) order using concise terms.
	 */
	export interface GspoBuilder extends GraphHandle {
		openC1Graph(graph: C1.Graphable): GraphHandle;
		openC1Subject(subject: C1.Node): GrubHandle;
		openGraph(graph: Role.Graph): GraphHandle;
		openSubject(subject: Role.Subject): GrubHandle;
	}

	export interface SyncGspoBuilder<Deliverable extends SyncDataset> extends GspoBuilder {
		deliver(datasetClass?: { new(...args: any[]): SyncDataset }): Deliverable;
	}


	export interface Constructor<DatasetType, BuilderType, TransferType> {
		empty(prefixes: PrefixMap): DatasetType;
		builder(prefixes: PrefixMap): BuilderType;

		new(transfer: TransferType, prefixes: PrefixMap): DatasetType;
	}

	/**
	 * 
	 */
	export interface SyncDataset {
		readonly isGraphyDataset: true;
		readonly datasetStorageType: string;
		readonly size: number;

		[Symbol.iterator](): Iterator<Quad>;

		add(quad: RDFJS.Quad): this;
		delete(quad: RDFJS.Quad): this;
		has(quad: RDFJS.Quad): boolean;
		match(subject?: Role.Subject | null, predicate?: Role.Predicate | null, object?: Role.Object | null, graph?: Role.Graph| null): SyncDataset;

		distinctGraphCount(): number;
		distinctSubjectCount(): number;
		distinctPredicateCount(): number;
		distinctObjectCount(): number;

		distinctGraphs(): Iterator<Term.Graph>;
		distinctSubjects(): Iterator<Term.Subject>;
		distinctPredicates(): Iteratort<Term.Predicate>;
		distinctObjects(): Iterator<Term.Object>;

		equals(other: SyncDataset): boolean;
		contains(other: SyncDataset): boolean;
		disjoint(other: SyncDataset): boolean;

		union(other: SyncDataset): SyncDataset;
		intersection(other: SyncDataset): SyncDataset;
		minus(other: SyncDataset): SyncDataset;
		difference(other: SyncDataset): SyncDataset;

		canonicalize(): SyncDataset;
		delta(other: SyncDataset): Delta
	}

	export interface SyncC1Dataset extends SyncDataset {
		distinctC1Graphs(): Set<C1.Graph>;
		distinctC1Subjects(): Set<C1.Subject>;
		distinctC1Predicates(): Set<C1.Predicate>;
		distinctC1Objects(): Set<C1.Object>;
	}

	export interface AsyncDataset {
		distinctGraphCount(): Promise<number>;
		distinctSubjectCount(): Promise<number>;
		distinctPredicateCount(): Promise<number>;
		distinctObjectCount(): Promise<number>;
	}
}
