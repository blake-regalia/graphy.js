import {
	RDFJS,
	Role,
	Iri,
	C1,
	Term,
} from '@graphy/types';

export interface PrefixMapRelation {
	relation: 'equal' | 'superset' | 'subset' | 'overlap';
	conflicts: Array<string>;
}

export namespace DataFactory {
	function namedNode(value: Iri): Term.NamedNode;
	function blankNode(value?: string): Term.BlankNode;
	function literal(value: string, languageOrDatatype?: string | RDFJS.NamedNode): Term.Literal;
	function defaultGraph(): Term.DefaultGraph;
	function variable(value: string): Term.Variable;
	function quad(subject: Term.Subject, predicate: Term.Predicate, object: Term.Object, graph?: Term.Graph): Term.Quad;

	/**
	 * @deprecated Use `.quad()` instead
	 */
	function triple(): Term.Quad;

	function integer(value: number | string): Term.IntegerLiteral;
	function double(value: number | string): Term.DoubleLiteral;
	function decimal(value: number | string | bigint): Term.DecimalLiteral;
	function boolean(value: boolean | number | string): Term.BooleanLiteral;

	function number(value: number | bigint): Term.NumericLiteral;
	function date(date: Date): Term.DatatypedLiteral;
	function dateTime(dateTime: Date): Term.DatatypedLiteral;
	function ephemeral(): Term.EphemeralBlankNode;

	function fromTerm(term: RDFJS.Term): Term.GenericTerm;
	function fromQuad(quad: RDFJS.Quad): Term.Quad;

	function comment(): C1.Directive;
	function newlines(): C1.Directive;

	function concise(iri: Iri, prefixes?: PrefixMap): C1.NamedNode;
	function terse(iri: Iri, prefixes?: PrefixMap): Terse.NamedNode;

	// should be `fromC1` ?
	function c1(term: C1.GenericTerm, prefixes?: PrefixMap): Term.GenericTerm;
	
	function c1ExpandData(term: C1.DataTerm, prefixes: PrefixMap): C1.DataTerm;

	function c1Graph(graph: C1.Graph, prefixes: PrefixMap): Term.Graph;
	function c1Subject(subject: C1.Subject, prefixes: PrefixMap): Term.Subject;
	function c1Predicate(subject: C1.Predicate, prefixes: PrefixMap): Term.Predicate;
	function c1Object(objectRole: C1.Object, prefixes: PrefixMap): Term.Object;

	function c1FromGraphRole(graph: Role.Graph, prefixes: PrefixMap): C1.Graph;
	function c1FromSubjectRole(subject: Role.Subject, prefixes: PrefixMap): C1.Subject;
	function c1FromPredicateRole(predicate: Role.Predicate, prefixes: PrefixMap): C1.Predicate;
	function c1FromObjectRole(object: Role.Object, prefixes: PrefixMap): C1.Object;

	// function c1Graphable(graph: graphy.ConciseGraphable, prefixes?: graphy.PrefixMap): graphy.Graphable;
	// function c1Node(node: graphy.ConciseNode, prefixes?: graphy.PrefixMap): graphy.Node;
	// function c1NamedNode(namedNode: graphy.ConciseNamedNode, prefixes?: graphy.PrefixMap): graphy.NamedNode;
	// function c1DataTerm(dataTerm: graphy.ConciseDataTerm): graphy.DataTerm;
	// function c1Literal(dataTerm: graphy.ConciseLiteral): graphy.GenericLiteral;

	function c3(triples: C4.Triples, prefixes?: PrefixMap, graph?: C1.Graph): C1.QuadBundle;
	function c4(quads: C4.Quads, prefixes?: PrefixMap): C1.QuadBundle;

	function relatePrefixMaps(prefixesA: PrefixMap, prefixesB: PrefixMap): PrefixMapRelation;
	function prefixMapsDiffer(prefixesA: PrefixMap, prefixesB: PrefixMap): boolean;
}

export default DataFactory;
