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
 * Struct for passing around prefix maps
 */
export type PrefixMap = {
	[prefixId: Prefix]: Iri;
	readonly '.base'?: Iri;
	readonly '.cache'?: {};
};


/**
 * Struct for describing relation between prefix maps
 */
export interface PrefixMapRelation {
	relation: 'disjoint' | 'equal' | 'superset' | 'subset' | 'overlap';
	conflicts: Prefix[];
}

