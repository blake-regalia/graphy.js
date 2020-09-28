import * as RDFJS from 'rdf-js';

type RDFJS_QuadGraph = RDFJS.DefaultGraph | RDFJS.NamedNode | RDFJS.BlankNode;
type RDFJS_QuadSubject = RDFJS.NamedNode | RDFJS.BlankNode;
type RDFJS_QuadPredicate = RDFJS.NamedNode;
type RDFJS_QuadObject = RDFJS.NamedNode | RDFJS.BlankNode | RDFJS.Literal;

import {
	ConciseNamedNode,
	ConciseTerm,
	ConciseNode,
	PrefixMap,
	DataFactory,
	Quad,
	GraphRole,
} from '../core/data/factory';

import {
	IDataset,
	IConciseGspoBuilder,
	IGraphHandle,
	IGrubHandle,
	IGreedHandle,
} from './dataset-interface';


const {
	c1GraphRole,
	c1SubjectRole,
	c1PredicateRole,
	c1ObjectRole,
	concise,
	fromTerm,
} = DataFactory;


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


const $_KEYS = Symbol(' (keys)');
const $_QUADS = Symbol(' (quads)');

interface ICountableKeys {
	[$_KEYS]: number;
}

interface ICountableQuads extends ICountableKeys {
	[$_QUADS]: number;
}

type IObjectReferencesMap = ICountableQuads & {
	[sc1_predicate: string]: Set<ConciseNode>;
};

interface IObjectDescriptor {
	value: ConciseTerm;
	refs: IObjectReferencesMap;
}

type IObjectStore = ICountableKeys & {
	[sc1_object: string]: IObjectDescriptor;
}

type IProbsTree = ICountableQuads & {
	[sc1_predicate: string]: Set<ConciseTerm>;
}

type ITriplesTree = ICountableQuads & {
	[sc1_subject: string]: IProbsTree;
}

type IQuadsTree = ICountableQuads & {
	[sc1_graph: string]: ITriplesTree;
}


class PartiallyIndexedGreedHandle implements IGreedHandle {
	_k_dataset: PartiallyIndexedTrigDataset;
	_kh_grub: GrubHandle;
	_sc1_predicate: ConciseNamedNode;
	_sc1_subject: ConciseNode;
	_as_objects: Set<ConciseTerm>; 

	constructor(kh_grub: GrubHandle, sc1_predicate: ConciseNamedNode, as_objects: Set<ConciseNamedNode>) {
		this._k_dataset = kh_grub._k_dataset;
		this._kh_grub = kh_grub;
		this._sc1_subject = kh_grub._sc1_subject;
		this._sc1_predicate = sc1_predicate;
		this._as_objects = as_objects;
	}

	addC1Object(sc1_object: ConciseTerm): boolean {
		// ref object store
		const as_objects = this._as_objects;

		// triple already exists
		if(as_objects.has(sc1_object)) return false;

		// insert into object set
		as_objects.add(sc1_object);

		// ref quads tree
		const hc4_quads = this._k_dataset._hc4_quads;

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

	deleteC1Object(sc1_object: ConciseTerm): boolean {
		return false;
	}
}


class GrubHandle implements IGrubHandle {
	_k_dataset: PartiallyIndexedTrigDataset;
	_kh_graph: IInternalGraphHandle;
	_sc1_subject: string;
   _hc2_probs: IProbsTree;

	constructor(k_dataset: PartiallyIndexedTrigDataset, kh_graph: IInternalGraphHandle, sc1_subject: ConciseNode, hc2_probs: IProbsTree) {
		this._k_dataset = k_dataset;
		this._kh_graph = kh_graph;
		this._sc1_subject = sc1_subject;
		this._hc2_probs = hc2_probs;
	}

	openC1Predicate(sc1_predicate: ConciseNamedNode): IGreedHandle {
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

interface IInternalGraphHandle {
	 _sc1_graph: string;
	_hc3_triples: ITriplesTree;
}

class GraphHandle implements IInternalGraphHandle, IGraphHandle {
	_k_dataset: PartiallyIndexedTrigDataset;
	 _sc1_graph: string;
	_hc3_triples: ITriplesTree;
	 
	constructor(k_dataset: PartiallyIndexedTrigDataset, sc1_graph: ConciseNode, hc3_triples: ITriplesTree) {
		this._k_dataset = k_dataset;
		this._sc1_graph = sc1_graph;
		this._hc3_triples = hc3_triples;
	}

	openC1Subject(sc1_subject: ConciseNode): IGrubHandle {
		// ref triples tree
		const hc3_triples = this._hc3_triples;

		// subject exists; return subject handle
		if(sc1_subject in hc3_triples) {
			return new GrubHandle(this._k_dataset, this, sc1_subject, hc3_triples[sc1_subject]);
		}
		else {
			// increment keys counter
			hc3_triples[$_KEYS] += 1;

			// create subject w/ empty probs tree
			const hc2_probs = hc3_triples[sc1_subject] = {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			} as IProbsTree;

			// return subject handle
			return new GrubHandle(this._k_dataset, this, sc1_subject, hc2_probs);
		}
	}
}

function graph_to_c1(yt_graph: GraphRole, h_prefixes: PrefixMap) {
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
		default: {
			return '_:'+yt_graph.value;
		}
	}
}

/**
 * Trig-Optimized, Semi-Indexed Dataset in Memory
 * YES: ????, g???, g??o, g?po, gs??, gsp?, gspo
 * SOME: gs?o
 * NOT: ???o, ??p?, ??po, ?s??, ?s?o, ?sp?, ?spo, g?p?
 */
export class PartiallyIndexedTrigDataset implements IInternalGraphHandle, IConciseGspoBuilder<IDataset>, IDataset {
	_h_objects: IObjectStore;
	_sc1_graph = '*';
	_hc3_triples: ITriplesTree;
	_hc4_quads: IQuadsTree;
	_h_prefixes: PrefixMap;

	static supportsStar = false;

	constructor(h_prefixes={} as PrefixMap) {
		this._h_prefixes = h_prefixes;

		this._h_objects = {
			[$_KEYS]: 0,
		} as IObjectStore;

		let hc3_triples = this._hc3_triples = {
			[$_KEYS]: 0,
			[$_QUADS]: 0,
		} as ITriplesTree;

		this._hc4_quads = {
			[$_KEYS]: 1,
			[$_QUADS]: 0,
			'*': hc3_triples,
		} as IQuadsTree;
	}

	get size() {
		return this._hc4_quads[$_QUADS];
	}

	async deliver(): Promise<IDataset> {
		return this;
	}

	*[Symbol.iterator](): Iterator<Quad> {
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

	distinct(s_which: 'graphs' | 'subjects' | 'predicates' | 'objects') {
		switch(s_which) {
			case 'graphs': return this._hc4_quads[$_KEYS];
			case 'subjects': {
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
			case 'predicates': {
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
			case 'objects': {
				return this._h_objects[$_KEYS];
			}
			default: {
				throw new Error(`cannot query for distinct '${s_which}'`);
			}
		}
	}

	attachPrefixes(h_prefixes: PrefixMap) {
		this._h_prefixes = h_prefixes;
	}

	openC1Graph(sc1_graph: ConciseNode): IGraphHandle {
		// ref quads tree
		const hc4_quads = this._hc4_quads;

		// graph exists; return subject handle
		if(sc1_graph in hc4_quads) {
			return new GraphHandle(this, sc1_graph, hc4_quads[sc1_graph]);
		}
		else {
			// increment keys counter
			hc4_quads[$_KEYS] += 1;

			// create graph w/ empty triples tree
			const hc3_triples = hc4_quads[sc1_graph] = {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			} as ITriplesTree;

			// return subject handle
			return new GraphHandle(this, sc1_graph, hc3_triples);
		}
	}

	openC1Subject(sc1_subject: ConciseNode): IGrubHandle {
		// ref default graph triples tree
		const hc3_triples = this._hc3_triples;

		// subject exists; return subject handle
		if(sc1_subject in hc3_triples) {
			return new GrubHandle(this, this, sc1_subject, hc3_triples[sc1_subject]);
		}
		// subject not yet exists
		else {
			// increment keys counter
			hc3_triples[$_KEYS] += 1;

			// create subject w/ empty probs tree
			const hc2_probs = hc3_triples[sc1_subject] = {
				[$_KEYS]: 0,
				[$_QUADS]: 0,
			} as IProbsTree;

			// return subject handle
			return new GrubHandle(this, this, sc1_subject, hc2_probs);
		}
	}

	addTriple(sc1_subject: ConciseNode, sc1_predicate: ConciseNamedNode, sc1_object: ConciseTerm) {
		return this.openC1Subject(sc1_subject).openC1Predicate(sc1_predicate).addC1Object(sc1_object);
	}

	add(g_quad: RDFJS.Quad): IDataset {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

		this.openC1Graph(graph_to_c1(g_quad.graph as RDFJS_QuadGraph, h_prefixes))
			.openC1Subject('NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value)
			.openC1Predicate(concise(g_quad.predicate.value, h_prefixes))
			.addC1Object(fromTerm(g_quad.object).concise());

		return this;
	}

	has(g_quad: RDFJS.Quad): boolean {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// fetch triples tree
		const hc3_triples = this._hc4_quads[graph_to_c1(g_quad.graph as RDFJS_QuadGraph, h_prefixes)];

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

	_match_subject(sc1_subject: ConciseNode) {

	}

	match(yt_subject?: RDFJS.Term, yt_predicate?: RDFJS.Term, yt_object?: RDFJS.Term, yt_graph?: RDFJS.Term): IDataset {
		return this;
	}

	delete(g_quad: RDFJS.Quad): IDataset {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

		this.openC1Graph(graph_to_c1(g_quad.graph as GraphRole, h_prefixes))
			.openC1Subject('NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value)
			.openC1Predicate(concise(g_quad.predicate.value, h_prefixes))
			.deleteC1Object(fromTerm(g_quad.object).concise(h_prefixes));

		return this;
	}
}
