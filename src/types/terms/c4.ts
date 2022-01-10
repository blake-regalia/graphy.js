import type {
	Type,
} from 'ts-toolbelt/out/Any/_api';

import type {
	DefaultGraphTypeKey,
	G_Quad,
	TermTypeKey,
} from './_api';

import type {
	C1_Data,
	C1_Node,
	C1_NamedNode,
	C1_Directive,
	C1_Graph,
} from '../strings/c1';

import type {
	ObjectArg,
} from './arg';

import {
	RdfMode_11,
} from '../const';

import { FromQualifier } from '../types';
import { ParseC1 } from './parse';


export type C4_Item_Object = boolean | number | bigint | C1_Data | ObjectArg;

export type C4_Item_ObjectList = Array<C4_Item_Object> | Set<C4_Item_Object>;

export type C4_Item_ObjectCollection = Array<C4_Item_ObjectList> | Set<C4_Item_ObjectList>;

export type C4_Item = C4_Item_Object | C4_Item_ObjectList | C4_Item_ObjectCollection;

// export type StrictObjects = Array<C1_Data>;

export type C4_Pairs = {
	[predicate: C1_NamedNode]: C4_Item;
	[directive: C1_Directive]: any;
};

export type C4_Triples = {
	[subject: C1_Node]: C4_Pairs;
	[directive: C1_Directive]: any;
};

export type C4_Quads = {
	[K in C1_Data]?: C4_Triples;
};

type DefaultGraph_11 = FromQualifier<[DefaultGraphTypeKey, ''], DefaultGraphTypeKey, RdfMode_11>;

type Graph_11 = FromQualifier<ParseC1<C1_Graph<RdfMode_11>>, TermTypeKey, RdfMode_11>;

export type C4_TripleBundle<
	sc1_graph extends C1_Graph<RdfMode_11>,
> = {
	[Symbol.iterator](): Generator<G_Quad<RdfMode_11, FromQualifier<ParseC1<C1_Graph<RdfMode_11>>, TermTypeKey, RdfMode_11>>, RdfMode_11>;
	toString(): Type<`{"type":"c3","value":{${string}}}`, 'JSON'>;
};

export type C4_QuadBundle = {
	[Symbol.iterator](): Generator<G_Quad<RdfMode_11>, RdfMode_11>;
	toString(): Type<`{"type":"c4","value":{${string}}}`, 'JSON'>;
};
