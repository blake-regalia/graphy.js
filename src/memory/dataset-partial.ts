/* eslint-disable no-use-before-define */

import {
	RDFJS,
	Concise,
	PrefixMap,
	Quad,
	Dataset,
	Role,
// } from '@graphy/types';
} from '../types/types';

import SyncDataset = Dataset.SyncDataset;

import {
	DataFactory,
// } from '@graphy/core';
} from '../core/core';

const {
	c1GraphRole,
	c1SubjectRole,
	c1PredicateRole,
	c1ObjectRole,
	concise,
	fromTerm,
} = DataFactory;

import {
	TrigDataset,
} from './dataset/trig';

import {
	$_KEYS,
	$_QUADS,
	PartiallyIndexed,
} from './common';
import { PartiallyIndexedTrigDataset } from '../../build/ts/memory/dataset-partial';
import { Graphable } from '../../build/package/core.data.factory/main';

/**
 * @fileoverview
 * The following table indicates the names for various groupings of RDF term roles:
 * 
 *  ┌─────────┬───────────┬─────────────┬──────────┐
 *  │ <graph> ┊ <subject> ┊ <predicate> ┊ <object> │
 *  ├─────────┴───────────┼─────────────┴──────────┤
 *  │        grub         │           prob         │
 *  ├─────────────────────┴─────────────┬──────────┤
 *  │               greed               │░░░░░░░░░░│
 *  ├─────────┬─────────────────────────┴──────────┤
 *  │░░░░░░░░░│         spred           │░░░░░░░░░░│
 *  ├─────────┼─────────────────────────┴──────────┤
 *  │░░░░░░░░░│               triple               │
 *  ├─────────┴────────────────────────────────────┤
 *  │                      quad                    │
 *  └──────────────────────────────────────────────┘
 * 
 */


class PartiallyIndexedGreedHandle implements Dataset.GreedHandle {
	_k_builder: TrigDatasetBuilder;
	_kh_grub: PartiallyIndexedGrubHandle;
	_sc1_predicate: Concise.NamedNode;
	_sc1_subject: Concise.Node;
	_as_objects: Set<Concise.Term>; 

	constructor(kh_grub: PartiallyIndexedGrubHandle, sc1_predicate: Concise.NamedNode, as_objects: Set<Concise.NamedNode>) {
		this._k_builder = kh_grub._k_builder;
		this._kh_grub = kh_grub;
		this._sc1_subject = kh_grub._sc1_subject;
		this._sc1_predicate = sc1_predicate;
		this._as_objects = as_objects;
	}

	addC1Object(sc1_object: Concise.Term): boolean {
		// ref object store
		const as_objects = this._as_objects;

		// triple already exists
		if(as_objects.has(sc1_object)) return false;

		// insert into object set
		as_objects.add(sc1_object);

		// ref quads tree
		const hc4_quads = this._k_builder._hc4_quads;

		// update quads counter on quads tree
		hc4_quads[$_QUADS] += 1;

		// ref triples tree
		const hc3_triples = hc4_quads[this._kh_grub._kh_graph._sc1_graph];

		// update quads counter on triples tree
		hc3_triples[$_QUADS] += 1;

		// update quads counter on probs tree
		hc3_triples[this._sc1_subject][$_QUADS] += 1;

		// new triple added
		return true;
	}

	deleteC1Object(sc1_object: Concise.Term): boolean {
		return false;
	}
}


class PartiallyIndexedGrubHandle implements Dataset.GrubHandle {
	_k_builder: TrigDatasetBuilder;
	_kh_graph: InternalGraphHandle;
	_sc1_subject: string;
	_hc2_probs: PartiallyIndexed.ProbsTree;

	constructor(k_dataset: TrigDatasetBuilder, kh_graph: InternalGraphHandle, sc1_subject: Concise.Node, hc2_probs: PartiallyIndexed.ProbsTree) {
		this._k_builder = k_dataset;
		this._kh_graph = kh_graph;
		this._sc1_subject = sc1_subject;
		this._hc2_probs = hc2_probs;
	}

	openC1Predicate(sc1_predicate: Concise.NamedNode): Dataset.GreedHandle {
		// increment keys counter
		const hc2_probs = this._hc2_probs;

		// predicate exists; return tuple handle
		if(sc1_predicate in hc2_probs) {
			return new PartiallyIndexedGreedHandle(this, sc1_predicate, hc2_probs[sc1_predicate]);
		}
		else {
			// increment keys counter
			hc2_probs[$_KEYS] += 1;

			// create predicate w/ empty objects set
			const as_objects = hc2_probs[sc1_predicate] = new Set();

			// return tuple handle
			return new PartiallyIndexedGreedHandle(this, sc1_predicate, as_objects);
		}
	}
}

interface InternalGraphHandle {
	_sc1_graph: string;
	_hc3_triples: PartiallyIndexed.TriplesTree;

	openC1Subject(sc1_subject: Concise.Node): Dataset.GrubHandle;
}

class PartiallyIndexedGraphHandle implements InternalGraphHandle, Dataset.GraphHandle {
	_k_builder: TrigDatasetBuilder;
	_sc1_graph: string;
	_hc3_triples: PartiallyIndexed.TriplesTree;
	 
	constructor(k_dataset: TrigDatasetBuilder, sc1_graph: Concise.Node, hc3_triples: PartiallyIndexed.TriplesTree) {
		this._k_builder = k_dataset;
		this._sc1_graph = sc1_graph;
		this._hc3_triples = hc3_triples;
	}

	openC1Subject(sc1_subject: Concise.Node): Dataset.GrubHandle {
		// ref triples tree
		const hc3_triples = this._hc3_triples;

		// subject exists; return subject handle
		if(sc1_subject in hc3_triples) {
			return new PartiallyIndexedGrubHandle(this._k_builder, this, sc1_subject, hc3_triples[sc1_subject]);
		}
		else {
			// increment keys counter
			hc3_triples[$_KEYS] += 1;

			// create subject w/ empty probs tree
			const hc2_probs = hc3_triples[sc1_subject] = {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			} as PartiallyIndexed.ProbsTree;

			// return subject handle
			return new PartiallyIndexedGrubHandle(this._k_builder, this, sc1_subject, hc2_probs);
		}
	}
}

function graph_to_c1(yt_graph: Role.Graph, h_prefixes: PrefixMap): Concise.Graphable {
	// depending on graph term type
	switch(yt_graph.termType) {
		// default graph
		case 'DefaultGraph': {
			return '*';
		}

		// named node
		case 'NamedNode': {
			return concise(yt_graph.value, h_prefixes);
		}

		// blank node
		case 'BlankNode': {
			return '_:'+yt_graph.value;
		}

		// other
		default: {
			return '';
		}
	}
}

function dataset_delivered(): never {
	throw new Error(`Cannot use builder after dataset has been delivered`);;
}

/**
 * Trig-Optimized, Semi-Indexed Dataset in Memory
 * YES: ????, g???, g??o, g?po, gs??, gsp?, gspo
 * SOME: gs?o
 * NOT: ???o, ??p?, ??po, ?s??, ?s?o, ?sp?, ?spo, g?p?
 */
export class TrigDatasetBuilder implements InternalGraphHandle, Dataset.GspoBuilder<SyncDataset> {
	_sc1_graph = '*';
	_hc3_triples: PartiallyIndexed.TriplesTree;
	_hc4_quads: PartiallyIndexed.QuadsTree;
	_h_prefixes: PrefixMap;

	static supportsStar = false;

	constructor(h_prefixes={} as PrefixMap) {
		this._h_prefixes = h_prefixes;

		const hc3_triples = this._hc3_triples = {
			[$_KEYS]: 0,
			[$_QUADS]: 0,
		} as PartiallyIndexed.TriplesTree;

		this._hc4_quads = {
			[$_KEYS]: 1,
			[$_QUADS]: 0,
			'*': hc3_triples,
		} as PartiallyIndexed.QuadsTree;
	}

	openC1Graph(sc1_graph: Concise.Graphable): Dataset.GraphHandle {
		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// graph exists; return subject handle
		if(sc1_graph in hc4_quads) {
			return new PartiallyIndexedGraphHandle(this, sc1_graph, hc4_quads[sc1_graph]);
		}
		else {
			// increment keys counter
			hc4_quads[$_KEYS] += 1;

			// create graph w/ empty triples tree
			const hc3_triples = hc4_quads[sc1_graph] = {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			} as PartiallyIndexed.TriplesTree;

			// return subject handle
			return new PartiallyIndexedGraphHandle(this, sc1_graph, hc3_triples);
		}
	}

	openC1Subject(sc1_subject: Concise.Node): Dataset.GrubHandle {
		// ref default graph triples tree
		const hc3_triples = this._hc3_triples;

		// subject exists; return subject handle
		if(sc1_subject in hc3_triples) {
			return new PartiallyIndexedGrubHandle(this, this, sc1_subject, hc3_triples[sc1_subject]);
		}
		// subject not yet exists
		else {
			// increment keys counter
			hc3_triples[$_KEYS] += 1;

			// create subject w/ empty probs tree
			const hc2_probs = hc3_triples[sc1_subject] = {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			} as PartiallyIndexed.ProbsTree;

			// return subject handle
			return new PartiallyIndexedGrubHandle(this, this, sc1_subject, hc2_probs);
		}
	}

	openGraph(yt_graph: Role.Graph): Dataset.GraphHandle {
		return this.openC1Graph(graph_to_c1(yt_graph, this._h_prefixes));
	}

	openSubject(yt_subject: Role.Subject): Dataset.GrubHandle {
		return this.openC1Subject('NamedNode' === yt_subject.termType? concise(yt_subject.value, this._h_prefixes): '_:'+yt_subject.value);
	}

	async deliver(dc_dataset: { new(): SyncDataset }=TrigDataset): Promise<SyncDataset> {  // eslint-disable-line require-await
		// simplify garbage collection and prevent future modifications to dataset
		const hc4_quads = this._hc4_quads;
		this._hc4_quads = null as unknown as PartiallyIndexed.QuadsTree;
		this._hc3_triples = null as unknown as PartiallyIndexed.TriplesTree;
		this.openC1Subject = dataset_delivered;
		this.openC1Graph = dataset_delivered;


		// create dataset
		return new dc_dataset(hc4_quads, this._h_prefixes);
	}
}
