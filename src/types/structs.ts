import {
	Merge,
} from 'ts-toolbelt/out/Object/_api';

import {
	ReservedPrefixMapKey_Cache,
	ReservedPrefixMapKey_Base,
} from './const';

import {
	Iri,
	Prefix,
	Suffix,
} from './strings/common';


/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type PrefixMap = {
 * 	[prefixId: Prefix]: Iri;
 * 	'.base'?: Iri;
 * 	'.cache'?: PrefixMapCache;
 * }
 * ```
 * 
 * Maps a {@link Prefix} to an {@link Iri}. The keys `.base` and `.cache` are reserved.
 */
export type PrefixMap = Merge<{
	[prefixId: Prefix]: Iri;
}, {
	readonly '.base'?: Iri;
	readonly '.cache'?: {};
}>;


/**
 * === _**@graphy/types**_ ===
 * 
 * ## Argument version of {@link PrefixMap}.
 */
export type PrefixMapArg = PrefixMap | void;


/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type PrefixMapRelation = {
 * 	relation: 'disjoint' | 'equal' | 'superset' | 'subset' | 'overlap';
 * 	conflicts: Prefix[];
 * }
 * ```
 * 
 * Describes relation between two {@link PrefixMap PrefixMaps} and includes a list of conflicting {@link Prefix Prefixes} that point to the same {@link Iri}.
 */
export interface PrefixMapRelation {
	relation: 'disjoint' | 'equal' | 'superset' | 'subset' | 'overlap';
	conflicts: Prefix[];
}

