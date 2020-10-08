/* eslint-disable no-use-before-define */

import {
	RDFJS,
	C1,
	PrefixMap,
	Quad,
	Dataset,
	Role,
} from '@graphy/types';

import SyncDataset = Dataset.SyncDataset;

import {
	$_KEYS,
	$_QUADS,
	PartiallyIndexed,
	Generic,
} from '../common';

import {
	DataFactory,
// } from '@graphy/core';
} from '../../core/core';

import { PartiallyIndexedTrigDataset } from './trig-partial';

const {
	c1Graph: c1GraphRole,
	c1Subject: c1SubjectRole,
	c1Predicate: c1PredicateRole,
	c1Object: c1ObjectRole,
	concise,
	fromTerm,
} = DataFactory;


export abstract class TrigDataset implements SyncDataset {
	_hc3_triples: Generic.TriplesTree;
	_hc4_quads: Generic.QuadsTree;
	_h_prefixes: PrefixMap;

	static empty(h_prefixes: PrefixMap={}): TrigDataset {
		return new (this as any)({
			[$_KEYS]: 1,
			[$_QUADS]: 0,
			['*']: {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			},
		} as Generic.QuadsTree, h_prefixes);
	}

	constructor(hc4_quads: Generic.QuadsTree, h_prefixes: PrefixMap) {
		this._hc4_quads = hc4_quads;
		this._hc3_triples = hc4_quads['*'];
		this._h_prefixes = h_prefixes;
	}

	get size(): number {
		return this._hc4_quads[$_QUADS];
	}

	* [Symbol.iterator](): Iterator<Quad>;
}
