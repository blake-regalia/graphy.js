// import * as RDFJS from 'rdf-js';
import {
	ObjectArg,
} from './term';

import * as RDFJS from '@rdfjs/types';

/**
 * Reserved for future TypeScript static string parsing
 */
export type Iri = string;
export type Label = string;

export type Prefix = string;
export type Suffix = string;

export namespace C4 {
	export type ObjectTarget = boolean | number | C1.Data | ObjectArg;
	export type ObjectList = Array<ObjectsTarget> | Set<ObjectsTarget>;
	export type ObjectCollection = Array<ObjectsList> | Set<ObjectsList>;

	export type Objects = ObjectTarget | ObjectList | ObjectCollection;

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
	[prefixId: Prefix]: Iri;
}

export interface PrefixMapRelation {
	relation: 'disjoint' | 'equal' | 'superset' | 'subset' | 'overlap';
	conflicts: Array<string>;
}

