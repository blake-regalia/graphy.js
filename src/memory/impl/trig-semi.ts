/* eslint-disable no-use-before-define */

import {
	RDFJS,
	C1,
	PrefixMap,
	Quad,
	Dataset,
	Role,
} from '@graphy/types';

import {
	QuadTree,
} from './trig-partial';

import SyncDataset = Dataset.SyncDataset;

import {
	$_KEYS,
	$_QUADS,
	PartiallyIndexed,
	SemiIndexed,
	Generic,
} from '../common';

import {
	DataFactory,
// } from '@graphy/core';
} from '../../core/core';

const {
	c1Graph: c1GraphRole,
	c1Subject: c1SubjectRole,
	c1Predicate: c1PredicateRole,
	c1Object: c1ObjectRole,
	concise,
	fromTerm,
} = DataFactory;


export class LinkedQuadTree extends QuadTree {
	_h_objects: SemiIndexed.ObjectStore;

	constructor(h_objects: SemiIndexed.ObjectStore, hc4_quads: SemiIndexed.QuadsTree, h_prefixes: PrefixMap) {
		super(hc4_quads, h_prefixes);
		this._h_objects = h_objects;
	}

	* [Symbol.iterator](): Iterator<Quad> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// each graph
		for(const sc1_graph in hc4_quads) {
			// make graph node
			const kt_graph = c1GraphRole(sc1_graph, h_prefixes);

			// ref triples tree
			const hc3_triples = hc4_quads[sc1_graph];

			// each subject
			for(const sc1_subject in hc3_triples) {
				// make subject node
				const kt_subject = c1SubjectRole(sc1_subject, h_prefixes);

				// ref probs tree
				const hc2_probs = hc3_triples[sc1_subject];

				// each predicate
				for(const sc1_predicate in hc2_probs) {
					// make predicate node
					const kt_predicate = c1PredicateRole(sc1_predicate, h_prefixes);

					// ref objects
					const as_objects = (hc2_probs as SemiIndexed.ProbsTree)[sc1_predicate];

					// each object
					for(const g_object of as_objects) {
						// make object node
						const kt_object = c1ObjectRole(g_object.value, h_prefixes);

						// yield quad
						yield DataFactory.quad(kt_subject, kt_predicate, kt_object, kt_graph);
					}
				}
			}
		}
	}

	
	_total_distinct_predicates(): Set<C1.Predicate> {
		// distinct predicates set
		let as_predicates = new Set<C1.Predicate>();

		// ref objects store
		const h_objects = this._h_objects;

		// each object
		for(const sc1_object in h_objects) {
			// each predicate in object refs; add to set
			for(const sc1_predicate in Object.keys(h_objects[sc1_object].refs)) {
				as_predicates.add(sc1_predicate);
			}
		}

		// return set
		return as_predicates;
	}


	_total_distinct_objects(): Set<C1.Object> {
		// distinct objects set
		let as_objects = new Set<C1.Object>();

		// each object; add to set
		for(const sc1_object in this._h_objects) {
			as_objects.add(sc1_object);
		}

		// return set
		return as_objects;
	}

	distinctObjectCount(): number {
		return this._h_objects[$_KEYS];
	}


}



LinkedQuadTree.prototype.datasetStorageType = `
	descriptor {
		value: c1;
		refs: {
			[p: c1]: s;
		};
	};
	objects {
		[o: c1]: descriptor;
	};
	quads {
		[g: c1]: trips {
			[s: c1]: probs {
				[p: c1]: Set<descriptor>;
			};
		};
	};
`.replace(/\s+/g, '');