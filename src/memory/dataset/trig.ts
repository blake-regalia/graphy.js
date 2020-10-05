/* eslint-disable no-use-before-define */

import {
	RDFJS,
	Concise,
	PrefixMap,
	Quad,
	Dataset,
	Role,
// } from '@graphy/types';
} from '../../types/types';

type SyncDataset = Dataset.SyncDataset;

import {
	DataFactory,
// } from '@graphy/core';
} from '../../core/core';

const {
	c1GraphRole,
	c1SubjectRole,
	c1PredicateRole,
	c1ObjectRole,
	concise,
	fromTerm,
} = DataFactory;


export class TrigDataset implements SyncDataset {
	_hc4_quads?: QuadsTree;
	_h_prefixes: PrefixMap;

	constructor(hc4_quads: Common.PI.QuadsTree, h_prefixes: PrefixMap) {
		this._h_prefixes = h_prefixes;
	}

	get size(): number {
		return this._hc4_quads[$_QUADS];
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
					const as_objects = hc2_probs[sc1_predicate];

					// each object
					for(const sc1_object of as_objects) {
						// make object node
						const kt_object = c1ObjectRole(sc1_object, h_prefixes);

						// yield quad
						yield DataFactory.quad(kt_subject, kt_predicate, kt_object, kt_graph);
					}
				}
			}
		}
	}

	distinctGraphCount(): number {
		return this._hc4_quads[$_KEYS];
	}

	distinctSubjectCount(): number {
		// only default graph
		if(1 === this._hc4_quads[$_KEYS]) {
			return this._hc3_triples[$_KEYS];
		}
		// multiple graphs
		else {
			let as_subjects = new Set();
			for(let sc1_graph in this._hc4_quads) {
				as_subjects = new Set([...as_subjects, ...Object.keys(this._hc4_quads[sc1_graph])]);
			}
			return as_subjects.size;
		}
	}

	distinctPredicateCount() {
		// only default graph
		if(1 === this._hc4_quads[$_KEYS]) {
			let as_predicates = new Set();
			for(let sc1_predicate in this._hc3_triples) {
				as_predicates.add(sc1_predicate);
			}
			return as_predicates.size;
		}
		// multiple graphs
		else {
			let as_predicates = new Set();
			const h_objects = this._h_objects;
			for(let sc1_object in h_objects) {
				for(let sc1_predicate in Object.keys(h_objects[sc1_object].refs)) {
					as_predicates.add(sc1_predicate);
				}
			}
			return as_predicates.size;
		}
	}

	distinctObjectCount() {
		return this._h_objects[$_KEYS];
	}

	attachPrefixes(h_prefixes: PrefixMap) {
		this._h_prefixes = h_prefixes;
	}

	addQuad(sc1_subject: Concise.SubjectRole, sc1_predicate: Concise.PredicateRole, sc1_object: Concise.ObjectRole ,sc1_graph?:  Concise.GraphRole): boolean {
		const kh_handle: InternalGraphHandle = sc1_graph
			? this.openC1Graph(sc1_graph)
			: this as InternalGraphHandle;

		return kh_handle.openC1Subject(sc1_subject).openC1Predicate(sc1_predicate).addC1Object(sc1_object);
	}

	add(g_quad: RDFJS.Quad): this {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

		this.openC1Graph(graph_to_c1(g_quad.graph as Role.Graph, h_prefixes))
			.openC1Subject('NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value)
			.openC1Predicate(concise(g_quad.predicate.value, h_prefixes))
			.addC1Object(fromTerm(g_quad.object).concise());

		return this;
	}

	has(g_quad: RDFJS.Quad): boolean {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// fetch triples tree
		const hc3_triples = this._hc4_quads[graph_to_c1(g_quad.graph as Role.Graph, h_prefixes)];

		// none
		if(!hc3_triples) return false;

		// ref subject
		const yt_subject = g_quad.subject;

		// create subject c1
		const sc1_subject = 'NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value;

		// fetch probs tree
		const hc2_probs = hc3_triples[concise(sc1_subject, h_prefixes)]

		// none
		if(!hc2_probs) return false;

		// fetch objects list
		const as_objects = hc2_probs[concise(g_quad.predicate.value, h_prefixes)]

		// none
		if(!as_objects) return false;

		// create object c1
		const sc1_object = fromTerm(g_quad.object).concise(h_prefixes);

		// use native set .has()
		return as_objects.has(sc1_object);
	}

	delete(g_quad: RDFJS.Quad): this {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

		this.openC1Graph(graph_to_c1(g_quad.graph as Role.Graph, h_prefixes))
			.openC1Subject('NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value)
			.openC1Predicate(concise(g_quad.predicate.value, h_prefixes))
			.deleteC1Object(fromTerm(g_quad.object).concise(h_prefixes));

		return this;
	}

	match(yt_subject?: Role.Subject | null, yt_predicate?: Role.Predicate | null, yt_object?: Role.Object | null, yt_graph?: Role.Graph| null): SyncDataset {
		const h_prefixes = this._h_prefixes;
		const hc4_quads = this._hc4_quads;

		// prepare new dataset
		const k_result = new TrigDataset(h_prefixes);

		// ref new quads tree
		const hc4_new = k_result._hc4_quads;

		// graph provided
		if(yt_graph) {
			// convert to c1
			const sc1_graph = graph_to_c1(yt_graph as Role.Graph, h_prefixes);

			// graph does not exist; return new empty dataset
			if(!(sc1_graph in hc4_quads)) return k_result;

			// ref triples tree
			const hc3_triples = hc4_quads[sc1_graph];

			// open graph
			const kh_graph = k_result.openC1Graph(sc1_graph);

			// subject provided
			if(yt_subject) {
				// convert to c1
				const sc1_subject = fromTerm(yt_subject).concise(h_prefixes);

				// subject does not exist; return new empty dataset
				if(!(sc1_subject in hc3_triples)) return new TrigDataset(h_prefixes);

				// ref probs tree
				const hc2_probs = hc3_triples[sc1_subject];

				// open subject
				const kh_grub = kh_graph.openC1Subject(sc1_subject);

				// predicate provided
				if(yt_predicate) {
					// convert to c1
					const sc1_predicate = fromTerm(yt_subject).concise(h_prefixes);
	
					// subject does not exist; return new empty dataset
					if(!(sc1_predicate in hc2_probs)) return new TrigDataset(h_prefixes)

					// ref objects set
					const as_objects = hc2_probs[sc1_predicate];

					// open predicate
					const kh_greed = kh_grub.openC1Predicate(sc1_predicate);

					// object provided
					if(yt_object) {
						// convert to c1
						const sc1_object = fromTerm(yt_object).concise(h_prefixes);

						// object does not exist; return new empty dataset
						if(!as_objects.has(sc1_object)) return new TrigDataset(h_prefixes);

						// object exists; add to dataset
						kh_greed.addC1Object(sc1_object);
					}
					// any object
					else {
						// clone object set
						(kh_greed as PartiallyIndexedGreedHandle)._as_objects = new Set(as_objects);

						// update quad count all the way up
						const nl_objects = as_objects.size;
						(kh_grub as PartiallyIndexedGrubHandle)._hc2_probs[$_QUADS] = nl_objects;
						(kh_graph as PartiallyIndexedGraphHandle)._hc3_triples[$_QUADS] = nl_objects;
						hc4_new[$_QUADS] = nl_objects;
					}
				}
				// any predicate
				else {
					// object provided
					if(yt_object) {
						// convert to c1
						const sc1_object = fromTerm(yt_object).concise(h_prefixes);

						// whether or not its empty
						let b_empty = true;

						// each predicate
						for(const sc1_predicate in hc2_probs) {
							// object exists in greed's object set; add to dataset and mark empty
							if(hc2_probs[sc1_predicate].has(sc1_object)) {
								kh_grub.openC1Predicate(sc1_predicate).addC1Object(sc1_object);
								b_empty = false;
							}
						}

						// empty
						if(b_empty) return new TrigDataset(h_prefixes);
					}
					// any object
					else {
						// make parasite
						const hc2_new = (kh_grub as PartiallyIndexedGrubHandle)._hc2_probs = Object.create(hc2_probs);
						hc2_new[$_PARASITE] = 1;

						// link host
						hc2_probs[$_INFECTIONS].push(hc2_new);

						// // each predicate
						// for(const sc1_predicate in hc2_probs) {
						// 	// ref object set
						// 	const as_objects = hc2_probs[sc1_predicate];

						// 	// clone object set
						// 	hc2_new[sc1_predicate] = new Set(as_objects);
						// }

						// // carry over keys and quad count
						// hc2_new[$_KEYS] = hc2_probs[$_KEYS];
						// hc2_new[$_QUADS] = hc2_probs[$_QUADS];
					}
				}
			}
		}
		// graph not provided
		else {

		}

		// return dataset
		return k_dataset;
	}

	delete(g_quad: RDFJS.Quad): SyncDataset {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

		this.openC1Graph(graph_to_c1(g_quad.graph as Role.Graph, h_prefixes))
			.openC1Subject('NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value)
			.openC1Predicate(concise(g_quad.predicate.value, h_prefixes))
			.deleteC1Object(fromTerm(g_quad.object).concise(h_prefixes));

		return this;
	}
}