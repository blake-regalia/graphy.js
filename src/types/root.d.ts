// import * as RDFJS from 'rdf-js';
import * as RDFJS from '@rdfjs/types';

/**
 * Reserved for future TypeScript static string parsing
 */
export type Iri = string;

/**
 * Namespace for cross-library Term role interfaces
 */
export namespace Role {
	export type Data = RDFJS.NamedNode | RDFJS.BlankNode | RDFJS.Literal | RDFJS.DefaultGraph;

	export type Graph = RDFJS.DefaultGraph | RDFJS.NamedNode | RDFJS.BlankNode;

	export type Subject = RDFJS.NamedNode | RDFJS.BlankNode;

	export type Predicate = RDFJS.NamedNode;

	export type Object = RDFJS.NamedNode | RDFJS.BlankNode | RDFJS.Literal;

	export type Datatype = RDFJS.NamedNode;

	export interface Quad extends RDFJS.Quad {
		subject: Subject;
		predicate: Predicate;
		object: Object;
		graph: Graph;

		equals(y_other?: null | RDFJS.Term): boolean;
	}
}

/**
 * Namespace for cross-library Term role interfaces
 */
export namespace StarRole {
	export type Graph = Role.Graph;

	export type Subject = RDFJS.Quad | Role.Subject;

	export type Predicate = Role.Predicate;

	export type Object = RDFJS.Quad | Role.Object;

	export type Datatype = Role.Datatype;

	export interface Quad extends RDFJS.Quad {
		subject: Subject;
		predicate: Predicate;
		object: Object;
		graph: Graph;

		equals(y_other?: null | RDFJS.Term): boolean;
	}
}

/**
 * Namespace for cross-library Term role interfaces
 */
export namespace VRole {
	type Optional = null | RDFJS.Variable;

	export type Graph = Optional | Role.Graph;

	export type Subject = Optional | Role.Subject;

	export type Predicate = Optional | Role.Predicate;

	export type Object = Optional | Role.Object;

	export type Datatype = Optional | Role.Datatype;

	export type Quad = Role.Quad;
}

/**
 * Namespace for cross-library Term role interfaces
 */
export namespace VStarRole {
	type Optional = null | RDFJS.Variable;

	export type Graph = Optional | StarRole.Graph;

	export type Subject = Optional | StarRole.Subject;

	export type Predicate = Optional | StarRole.Predicate;

	export type Object = Optional | StarRole.Object;

	export type Datatype = Optional | StarRole.Datatype;

	export type Quad = StarRole.Quad;
}


export namespace C4 {
	export type ObjectsTarget = boolean | number | C1.Data | Role.Object;
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


export interface PrefixMap {
	[prefixId: string]: Iri;
}

export interface PrefixMapRelation {
	relation: 'disjoint' | 'equal' | 'superset' | 'subset' | 'overlap';
	conflicts: Array<string>;
}

