/* eslint-disable no-use-before-define */

import {
	RDFJS,
	C1,
	PrefixMap,
	Quad,
	Dataset,
	Role, Graphable, Term
} from '@graphy/types';

import SyncC1Dataset = Dataset.SyncC1Dataset;
import SyncGspoBuilder = Dataset.SyncGspoBuilder;

import {
	$_KEYS,
	$_QUADS,
	$_OVERLAY,
	$_BURIED,
	PartiallyIndexed,
	Generic,
	SemiIndexed
} from '../common';

import ProbsTree = PartiallyIndexed.ProbsTree;
import TriplesTree = PartiallyIndexed.TriplesTree;
import QuadsTree = PartiallyIndexed.QuadsTree;
import GraphHandle = PartiallyIndexed.GraphHandle;
import GrubHandle = PartiallyIndexed.GrubHandle;
import GraspHandle = PartiallyIndexed.GraspHandle;
import ObjectSet = PartiallyIndexed.ObjectSet;

import overlayTree = Generic.overlayTree;
import overlay = Generic.overlay;
import trace = Generic.trace;

import {
	TrigDatasetBuilder,
} from '../builder/trig-partial';

import {
	DataFactory, Topology,
// } from '@graphy/core';
} from '../../core/core';
import { PartiallyIndexedTrigDataset } from './trig-partial';

const {
	concise,
	fromTerm,
	c1Graph,
	c1Subject,
	c1Predicate,
	c1Object,
	c1FromGraphRole,
	c1FromSubjectRole,
	c1FromPredicateRole,
	c1FromObjectRole,
	relateMaps,
} = DataFactory;

type StaticSelf = Function & {
	empty(h_prefixes: PrefixMap): PartiallyIndexedTrigDataset;
	builder(h_prefixes: PrefixMap): TrigDatasetBuilder;
	new(hc4_quads: Generic.QuadsTree, h_prefixes: PrefixMap): PartiallyIndexedTrigDataset;
};

export class PartiallyIndexedNQuadsDataset extends PartiallyIndexedTrigDataset {
	
}


PartiallyIndexedNQuadsDataset.prototype.datasetStorageType = `
	quads {
		[g: c1e]: trips {
			[s: c1e]: probs {
				[p: c1e]: Set<o: c1e>;
			};
		};
	};
`.replace(/\s+/g, '');


