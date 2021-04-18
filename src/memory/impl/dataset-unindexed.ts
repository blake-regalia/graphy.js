import * as RDFJS from 'rdf-js';

import {
	IGraspHandle,
	IGrubHandle,
	IGraphHandle,
	IConciseQuadTreeBuilder,
	IDataset,
} from './dataset-interface';

import {
	ConciseNamedNode,
	ConciseTerm,
	ConciseNode,
	PrefixMap,
	DataFactory,
	Quad,
	GraphRole,
} from '@graphy/core.data.factory';

const {
	c1GraphRole,
	c1SubjectRole,
	c1PredicateRole,
	c1ObjectRole,
	concise,
	fromTerm,
} = DataFactory;

class UnindexedGraspHandle implements IGraspHandle {
	_as_quads: Set<string>; 
	_scp_greed: string;

	constructor(k_dataset: QuadSet, scp_greed: string) {
		this._as_quads = k_dataset._as_quads;
		this._scp_greed = scp_greed;
	}

	addC1Object(sc1_object: ConciseTerm): boolean {
		// construct quad
		const scq_quad = this._scp_greed + sc1_object;

		// ref quad store
		const as_quads = this._as_quads;

		// quad already exists
		if(as_quads.has(scq_quad)) return false;

		// insert into quad set
		as_quads.add(scq_quad);

		// quad added
		return true;
	}
	
	deleteC1Object(sc1_object: ConciseTerm): boolean {
		// construct quad
		const scq_quad = this._scp_greed + sc1_object;

		// ref quad store
		const as_quads = this._as_quads;

		// quad does not exist
		if(!as_quads.has(scq_quad)) return false;

		// delete from quad set
		as_quads.delete(scq_quad);

		// quad deleted
		return true;
	}
}

class GrubHandle implements IGrubHandle {
	_k_dataset: QuadSet;
	_scp_grub: string;

	constructor(k_dataset: QuadSet, scp_grub: string) {
		this._k_dataset = k_dataset;
		this._scp_grub = scp_grub;
	}

	openC1Predicate(sc1_predicate: ConciseNamedNode): UnindexedGraspHandle {
		// return greed handle
		return new UnindexedGraspHandle(this._k_dataset, this._scp_grub+sc1_predicate+'\0');
	}
}

class GraphHandle implements IGraphHandle {
	_k_dataset: QuadSet;
	_scp_graph: string;
	 
	constructor(k_dataset: QuadSet, sc1_graph: ConciseNode) {
		this._k_dataset = k_dataset;
		this._scp_graph = sc1_graph+'\9';
	}

	openC1Subject(sc1_subject: ConciseNode): GrubHandle {
		// return grub handle
		return new GrubHandle(this._k_dataset, this._scp_graph+sc1_subject+'\8');
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

const R_SPLIT_QUAD = /[\9\8\0]/g;

const XM_GRAPH     = 0b0001;
const XM_SUBJECT   = 0b0010;
const XM_PREDICATE = 0b0100;
const XM_OBJECT    = 0b1000;

/**
 * Stores an unindexed set of quads in (graph, subject, predicate, object) order.
 * Fast insertion, slow at everything else.
 */
export class QuadSet implements IConciseQuadTreeBuilder<IDataset>, IDataset {
	_h_prefixes: PrefixMap;
	_as_quads: Set<string>;

	static supportsStar = false;

	constructor(h_prefixes={} as PrefixMap, as_quads=new Set<string>()) {
		this._h_prefixes = h_prefixes;
		this._as_quads = as_quads;
	}

	get size() {
		return this._as_quads.size;
	}

	async deliver(): Promise<IDataset> {
		return this;
	}

	*[Symbol.iterator](): Iterator<Quad> {
		// ref prefixes
		const h_prefixes = this._h_prefixes;

		// each quad
		for(const scq_quad of this._as_quads) {
			// extract concise term strings
			const [, sc1_graph, sc1_subject, sc1_predicate, sc1_object, ...a_remainder] = scq_quad.split(R_SPLIT_QUAD);

			// reconstruct quad object
			yield DataFactory.quad(
				c1SubjectRole(sc1_subject, h_prefixes),
				c1PredicateRole(sc1_predicate, h_prefixes),
				c1ObjectRole(sc1_object+a_remainder.join(''), h_prefixes),
				c1GraphRole(sc1_graph, h_prefixes),
			);
		}
	}


	openC1Graph(sc1_graph: ConciseNode): IGraphHandle {
		// return graph handle
		return new GraphHandle(this, sc1_graph);
	}

	openC1Subject(sc1_subject: ConciseNode): IGrubHandle {
		// return grub handle
		return new GrubHandle(this, sc1_subject);
	}

	distinct(s_which: 'graphs' | 'subjects' | 'predicates' | 'objects') {
		switch(s_which) {
			case 'graphs': {
				const as_graphs = new Set<string>();
				for(const scq_quad of this._as_quads) {
					as_graphs.add(scq_quad.slice(0, scq_quad.indexOf('\9')));
				}
				return as_graphs.size;
			}

			case 'subjects': {
				const as_subjects = new Set<string>();
				for(const scq_quad of this._as_quads) {
					as_subjects.add(scq_quad.slice(scq_quad.indexOf('\9')+1, scq_quad.indexOf('\8')));
				}
				return as_subjects.size;
			}

			case 'predicates': {
				const as_predicates = new Set<string>();
				for(const scq_quad of this._as_quads) {
					as_predicates.add(scq_quad.slice(scq_quad.indexOf('\8')+1, scq_quad.indexOf('\0')));
				}
				return as_predicates.size;
			}

			case 'objects': {
				const as_objects = new Set<string>();
				for(const scq_quad of this._as_quads) {
					as_objects.add(scq_quad.slice(scq_quad.indexOf('\0')+1));
				}
				return as_objects.size;
			}

			default: {
				throw new Error(`cannot query for distinct '${s_which}'`);
			}
		}
	}

	attachPrefixes(h_prefixes: PrefixMap) {
		this._h_prefixes = h_prefixes;
	}

	addTriple(sc1_subject: ConciseNode, sc1_predicate: ConciseNamedNode, sc1_object: ConciseTerm) {
		return this.openC1Subject(sc1_subject).openC1Predicate(sc1_predicate).addC1Object(sc1_object);
	}

	_quad_to_cq(g_quad: RDFJS.Quad): string {
		const h_prefixes = this._h_prefixes;
		const yt_subject = g_quad.subject;

		return graph_to_c1(g_quad.graph as GraphRole, this._h_prefixes)
			+'\9'+('NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value)
			+'\8'+concise(g_quad.predicate.value, h_prefixes)
			+'\0'+fromTerm(g_quad.object).concise(h_prefixes);
	}

	add(g_quad: RDFJS.Quad): IDataset {
		this._as_quads.add(this._quad_to_cq(g_quad));

		return this;
	}

	delete(g_quad: RDFJS.Quad): IDataset {
		this._as_quads.delete(this._quad_to_cq(g_quad));

		return this;
	}

	has(g_quad: RDFJS.Quad): boolean {
		return this._as_quads.has(this._quad_to_cq(g_quad));
	}

	_quad_to_c1s(yt_subject?: RDFJS.Term, yt_predicate?: RDFJS.Term, yt_object?: RDFJS.Term, yt_graph?: RDFJS.Term) {
		const h_prefixes = this._h_prefixes;

		return [
			yt_graph? ('Variable' !== yt_graph.termType? graph_to_c1(yt_graph as GraphRole, h_prefixes): ''): '*',
			(yt_subject && 'Variable' !== yt_subject.termType)? ('NamedNode' === yt_subject.termType? concise(yt_subject.value, h_prefixes): '_:'+yt_subject.value): '',
			(yt_predicate && 'Variable' !== yt_predicate.termType)? concise(yt_predicate.value, h_prefixes): '',
			(yt_object && 'Variable' !== yt_object.termType)? fromTerm(yt_object).concise(h_prefixes): '',
		];
	}

	match(yt_subject?: RDFJS.Term, yt_predicate?: RDFJS.Term, yt_object?: RDFJS.Term, yt_graph?: RDFJS.Term): IDataset {
		const xm_given = (yt_subject? XM_SUBJECT: 0) & (yt_predicate? XM_PREDICATE: 0) & (yt_object? XM_OBJECT: 0) & (yt_graph? XM_GRAPH: 0);

		const [
			sc1_subject,
			sc1_predicate,
			sc1_object,
			sc1_graph,
		] = this._quad_to_c1s(yt_subject, yt_predicate, yt_object, yt_graph);

		let s_regex = '';
		let f_filter: (scq: string) => boolean = () => false;

		switch(xm_given) {
			case XM_GRAPH: {
				f_filter = scq => scq.startsWith(sc1_graph);
				break;
			}

			case (XM_GRAPH | XM_SUBJECT): {
				f_filter = scq => scq.startsWith(sc1_graph+sc1_subject);
				break;
			}

			case (XM_GRAPH | XM_SUBJECT | XM_PREDICATE): {
				f_filter = scq => scq.startsWith(sc1_graph+sc1_subject+sc1_predicate);
				break;
			}

			case (XM_GRAPH | XM_SUBJECT | XM_PREDICATE | XM_OBJECT): {
				f_filter = scq => scq.startsWith(sc1_graph+sc1_subject+sc1_predicate+sc1_object);
				break;
			}

			case XM_SUBJECT: {
				f_filter = scq => sc1_subject === scq.substr(scq.indexOf('\9')+1, sc1_subject.length);
				break;
			}

			case (XM_SUBJECT | XM_PREDICATE): {
				f_filter = (scq) => {
					const scp_spred = sc1_subject+'\8'+sc1_predicate;
					return scp_spred === scq.substr(scq.indexOf('\9')+1, scp_spred.length);
				};
				break;
			}

			case (XM_SUBJECT | XM_PREDICATE | XM_OBJECT): {
				f_filter = (scq) => {
					const scp_sprob = sc1_subject+'\8'+sc1_predicate+'\0'+sc1_object;
					return scp_sprob === scq.substr(scq.indexOf('\9')+1, scp_sprob.length);
				};
				break;
			}

			
			case XM_PREDICATE: {
				f_filter = scq => sc1_predicate === scq.substr(scq.indexOf('\8')+1, sc1_predicate.length);
				break;
			}

			case (XM_PREDICATE | XM_OBJECT): {
				f_filter = (scq) => {
					const scp_prob = sc1_predicate+'\0'+sc1_object;
					return scp_prob === scq.substr(scq.indexOf('\8')+1, scp_prob.length);
				};
				break;
			}
			

			case XM_OBJECT: {
				f_filter = scq => sc1_object === scq.substr(scq.indexOf('\0'), sc1_object.length);
				break;
			}

		}

		const as_quads = new Set<string>();
		for(const scq_quad of this._as_quads) {
			if(f_filter(scq_quad)) {
				as_quads.add(scq_quad);
			}
		}

		return new QuadSet(this._h_prefixes, as_quads);
	}
}
