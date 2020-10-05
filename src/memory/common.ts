import {
	Concise,
} from '../types/types';

export const $_KEYS = Symbol(' (keys)');
export const $_QUADS = Symbol(' (quads)');
export const $_PARASITE = Symbol(' (parasite)');
export const $_INFECTIONS = Symbol(' (infected)');

export interface CountableKeys {
	[$_KEYS]: number;
}

export type CountableQuads = CountableKeys & {
	[$_QUADS]: number;
}

export type ParasiticCountableQuads = CountableQuads & {
	[$_PARASITE]: number;
	[$_INFECTIONS]: Array<CountableQuads>;
}

export namespace PartiallyIndexed {
	export type ObjectReferencesMap = CountableQuads & {
		[sc1_predicate: string]: Set<Concise.Node>;
	};

	export interface ObjectDescriptor {
		value: Concise.Term;
		refs: ObjectReferencesMap;
	}

	export type ObjectStore = CountableKeys & {
		[sc1_object: string]: ObjectDescriptor;
	}

	export type ProbsTree = CountableQuads & {
		[sc1_predicate: string]: Set<Concise.Term>;
	}

	export type TriplesTree = CountableQuads & {
		[sc1_subject: string]: ProbsTree;
	}

	export type QuadsTree = CountableQuads & {
		[sc1_graph: string]: TriplesTree;
	}
}
