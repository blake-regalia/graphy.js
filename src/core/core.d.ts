import * as graphy from '../types/types';

export namespace DataFactory {
	function namedNode(value: graphy.Iri): graphy.NamedNode;
	function blankNode(value?: string): graphy.BlankNode;
	function literal(value: string, languageOrDatatype?: string | RDFJS.NamedNode): graphy.GenericLiteral;
	function defaultGraph(): graphy.DefaultGraph;
	function variable(value: string): graphy.Variable;
	function quad(subject: graphy.SubjectRole, predicate: graphy.PredicateRole, object: graphy.ObjectRole, graph?: graphy.GraphRole): graphy.Quad;

	/**
	 * @deprecated Use `.quad()` instead
	 */
	function triple(): graphy.Quad;

	function integer(value: number | string): graphy.IntegerLiteral;
	function double(value: number | string): graphy.DoubleLiteral;
	function decimal(value: number | string | bigint): graphy.DecimalLiteral;
	function boolean(value: boolean | number | string): graphy.BooleanLiteral;

	function number(value: number | bigint): graphy.NumericLiteral;
	function date(date: Date): graphy.DatatypedLiteral;
	function dateTime(dateTime: Date): graphy.DatatypedLiteral;
	function ephemeral(): graphy.EphemeralBlankNode;

	function fromTerm(term: RDFJS.Term): graphy.GenericTerm;
	function fromQuad(quad: RDFJS.Quad): graphy.Quad;

	function comment(): graphy.ConciseDirective;
	function newlines(): graphy.ConciseDirective;

	function concise(iri: graphy.Iri, prefixes?: PrefixMap): graphy.ConciseNamedNode;
	function terse(iri: graphy.Iri, prefixes?: PrefixMap): graphy.TerseNamedNode;

	function c1(term: graphy.ConciseTerm, prefixes?: graphy.PrefixMap): graphy.GenericTerm;

	function c1GraphRole(graph: graphy.ConciseGraphRole, prefixes?: PrefixMap): graphy.GraphRole;
	function c1SubjectRole(subject: graphy.ConciseSubjectRole, prefixes?: PrefixMap): graphy.SubjectRole;
	function c1PredicateRole(subject: graphy.ConcisePredicateRole, prefixes?: PrefixMap): graphy.PredicateRole;
	function c1ObjectRole(objectRole: graphy.ConciseObjectRole, prefixes?: PrefixMap): graphy.ObjectRole;

	function c1Graphable(graph: graphy.ConciseGraphable, prefixes?: graphy.PrefixMap): graphy.Graphable;
	function c1Node(node: graphy.ConciseNode, prefixes?: graphy.PrefixMap): graphy.Node;
	function c1NamedNode(namedNode: graphy.ConciseNamedNode, prefixes?: graphy.PrefixMap): graphy.NamedNode;
	function c1DataTerm(dataTerm: graphy.ConciseDataTerm): graphy.DataTerm;
	function c1Literal(dataTerm: graphy.ConciseLiteral): graphy.GenericLiteral;

	function c3(triples: graphy.ConciseTriples, prefixes?: graphy.PrefixMap, graph?: graphy.ConciseGraphable): graphy.IterablePortableQuads;
	function c4(quads: graphy.ConciseQuads, prefixes?: graphy.PrefixMap): graphy.IterablePortableQuads;
}
