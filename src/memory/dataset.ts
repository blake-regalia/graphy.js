import {
	ConciseNamedNode,
	ConciseTerm,
	ConciseNode,
	PrefixMap,
	ConciseTriples,
} from '../core/data/factory';


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
	[sc1_predicate: string]: Set<IObjectDescriptor>;
}

type ITriplesTree = ICountableQuads & {
	[sc1_subject: string]: IProbsTree;
}

type IQuadsTree = ICountableQuads & {
	[sc1_graph: string]: ITriplesTree;
}


class GreedHandle {
	_k_dataset: TrigOptimizedSemiIndexedDataset;
	_kh_grub: GrubHandle;
	_sc1_predicate: ConciseNamedNode;
	_sc1_subject: ConciseNode;
	_as_objects: Set<IObjectDescriptor>; 

	constructor(kh_grub: GrubHandle, sc1_predicate: ConciseNamedNode, as_objects: Set<IObjectDescriptor>) {
		this._k_dataset = kh_grub._k_dataset;
		this._kh_grub = kh_grub;
		this._sc1_subject = kh_grub._sc1_subject;
		this._sc1_predicate = sc1_predicate;
		this._as_objects = as_objects;
	}

	addObject(sc1_object: ConciseTerm): boolean {
		// ref object store
		const h_objects = this._k_dataset._h_objects;
		const as_objects = this._as_objects;

		// prep object descriptor
		let g_object: IObjectDescriptor;

		// object exists in store
		if(sc1_object in h_objects) {
			// ref object descriptor
			g_object = h_objects[sc1_object];

			// triple already exists; nothing was added
			if(as_objects.has(g_object)) {
				return false;
			}
			// triple not yet exists, subject guaranteed to not yet exist in predicate-specific references
			else {
				// ref predicate
				const sc1_predicate = this._sc1_predicate;
				
				// ref references
				const h_refs = g_object.refs;

				// predicate exists in references
				if(sc1_predicate in h_refs) {
					// add subject to set
					h_refs[sc1_predicate].add(this._sc1_subject);
				}
				// predicate not yet exists in references
				else {
					// create reference
					h_refs[sc1_predicate] = new Set([this._sc1_subject]);

					// update keys counter on references
					h_refs[$_KEYS] += 1;
				}

				// update quads counter on references
				h_refs[$_QUADS] += 1;

				// jump to add
			}
		}
		// object not yet exists in store
		else {
			// create object descriptor
			g_object = h_objects[sc1_object] = {
				value: sc1_object,
				refs: {
					[$_KEYS]: 1,
					[$_QUADS]: 1,
					[this._sc1_predicate]: new Set([this._sc1_subject]),
				} as IObjectReferencesMap,
			} as IObjectDescriptor;
		}

		// insert into object set
		as_objects.add(g_object);

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


	deleteObject(sc1_object: ConciseTerm): boolean {
		// ref object store
		const h_objects = this._k_dataset._h_objects;
		
		// object not exists in store
		if(!(sc1_object in h_objects)) return false;
		
		// prep object descriptor
		let g_object = h_objects[sc1_object];

		// confine scope
		{
			// ref set of objects
			const as_objects = this._as_objects;

			// triple not exists
			if(!as_objects.has(g_object)) return false;

			// ref quads tree
			const hc4_quads = this._k_dataset._hc4_quads;

			// decrement store-level quad counter
			hc4_quads[$_QUADS] -= 1;
		
			OPSG:
			{
				// ref grub handle
				let kh_grub = this._kh_grub;

				// ref graph handle
				const kh_graph = kh_grub._kh_graph;

				// ref triples tree
				const hc3_triples = kh_graph._hc3_triples;

				PSG: {
					// ref probs tree
					const hc2_probs = kh_grub._hc2_probs;

					// ref probs key count
					const nl_keys_probs = hc2_probs[$_KEYS];

					// last object associated with this greed
					if(1 === as_objects.size) {
						// last predicate associated with this grub
						if(1 === nl_keys_probs) {
							// ref triples key count
							const nl_keys_triples = hc3_triples[$_KEYS];
							
							// last subject associated with this graph, not default graph
							if(1 === nl_keys_triples && '*' !== kh_graph._sc1_graph) {
								// drop given graph
								delete hc4_quads[kh_graph._sc1_graph];

								// decrement key counter
								hc4_quads[$_KEYS] -= 1;

								// no need to decrement others
								break OPSG;
							}
							// other subjects remain or keeping default graph
							else {
								// drop triples tree for given subject
								delete hc3_triples[this._sc1_subject];

								// decrement key counter
								hc3_triples[$_KEYS] = nl_keys_triples - 1;

								// no need to decrement others
								break PSG;
							}
						}
						// other predicates remain
						else {
							// drop probs tree for given predicate
							delete hc2_probs[this._sc1_predicate];

							// decrement key counter
							hc2_probs[$_KEYS] = nl_keys_probs - 1;
						}
					}
					// other objects remain
					else {
						// delete object from set
						as_objects.delete(g_object);
					}

					// decrement subject-level quad counter
					hc2_probs[$_QUADS] -= 1;
				}

				// decrement graph-level quad counter
				hc3_triples[$_QUADS] -= 1;
			}
		}


		// ref object descriptor
		const h_refs = g_object.refs;

		// ref subjects list
		const as_subjects = h_refs[this._sc1_predicate];

		// last subject associated with this prob
		if(1 === as_subjects.size) {
			// ref key count
			const nl_keys_refs = h_refs[$_KEYS];

			// last tuple associated with this object
			if(1 === nl_keys_refs) {
				// delete object from store
				delete h_objects[sc1_object];

				// decrement object key count
				h_objects[$_KEYS] -= 1;
			}
			// other tuples remain
			else {
				// delete predicate from refs
				delete h_refs[this._sc1_predicate];
	
				// decrement keys counter on references
				h_refs[$_KEYS] -= 1;
			}
		}
		// other subjects remain
		else {
			// delete subject from subjects list
			as_subjects.delete(this._sc1_subject);
		}

		// deleted object
		return true;
	}
}


interface IGrubHandle {
	openPredicate(sc1_predicate: ConciseNamedNode): GreedHandle;
}

class GrubHandle implements IGrubHandle {
	_k_dataset: TrigOptimizedSemiIndexedDataset;
	_kh_graph: IInternalGraphHandle;
	_sc1_subject: string;
   _hc2_probs: IProbsTree;

	constructor(k_dataset: TrigOptimizedSemiIndexedDataset, kh_graph: IInternalGraphHandle, sc1_subject: ConciseNode, hc2_probs: IProbsTree) {
		this._k_dataset = k_dataset;
		this._kh_graph = kh_graph;
		this._sc1_subject = sc1_subject;
		this._hc2_probs = hc2_probs;
	}

	openPredicate(sc1_predicate: ConciseNamedNode): GreedHandle {
		// increment keys counter
		const hc2_probs = this._hc2_probs;

		// predicate exists; return tuple handle
		if(sc1_predicate in hc2_probs) {
			return new GreedHandle(this, sc1_predicate, hc2_probs[sc1_predicate]);
		}
		else {
			// increment keys counter
			hc2_probs[$_KEYS] += 1;

			// create predicate w/ empty objects set
			const as_objects = hc2_probs[sc1_predicate] = new Set<IObjectDescriptor>();

			// return tuple handle
			return new GreedHandle(this, sc1_predicate, as_objects);
		}
	}
}

interface IGraphHandle {
	openSubject(sc1_subject: ConciseNode): IGrubHandle;
}

interface IInternalGraphHandle {
	 _sc1_graph: string;
	_hc3_triples: ITriplesTree;
}

class GraphHandle implements IInternalGraphHandle, IGraphHandle {
	_k_dataset: TrigOptimizedSemiIndexedDataset;
	 _sc1_graph: string;
	_hc3_triples: ITriplesTree;
	 
	constructor(k_dataset: TrigOptimizedSemiIndexedDataset, sc1_graph: ConciseNode, hc3_triples: ITriplesTree) {
		this._k_dataset = k_dataset;
		this._sc1_graph = sc1_graph;
		this._hc3_triples = hc3_triples;
	}

	openSubject(sc1_subject: ConciseNode): GrubHandle {
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

interface IGspoConciseTreeBuilder extends IGraphHandle {
	attachPrefixes(h_prefixes: PrefixMap): void;
	openGraph(sc1_graph: ConciseNode): IGraphHandle;
}

/**
 * Trig-Optimized, Semi-Indexed Dataset in Memory
 * YES: ????, g???, g??o, g?po, gs??, gsp?, gspo
 * SOME: gs?o
 * NOT: ???o, ??p?, ??po, ?s??, ?s?o, ?sp?, ?spo, g?p?
 */
class TrigOptimizedSemiIndexedDataset implements IInternalGraphHandle, IGspoConciseTreeBuilder {
	_h_objects: IObjectStore;
	_sc1_graph = '*';
	_hc3_triples: ITriplesTree;
	_hc4_quads: IQuadsTree;
	_h_prefixes: PrefixMap;

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

	attachPrefixes(h_prefixes: PrefixMap) {
		this._h_prefixes = h_prefixes;
	}

	openGraph(sc1_graph: ConciseNode): IGraphHandle {
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

	openSubject(sc1_subject: ConciseNode): IGrubHandle {
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
		this.openSubject(sc1_subject).openPredicate(sc1_predicate).addObject(sc1_object);
	}
}

