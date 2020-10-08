import { PrefixMap } from '../../build/package/core.data.factory/main';
import * as graphy from '../types/types';

import Term = graphy.Term;
import C1 = graphy.C1;

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

	function c3(triples: graphy.ConciseTriples, prefixes?: graphy.PrefixMap, graph?: graphy.ConciseGraphable): graphy.IterablePortableQuads;
	function c4(quads: graphy.ConciseQuads, prefixes?: graphy.PrefixMap): graphy.IterablePortableQuads;
}
