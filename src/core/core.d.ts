import * from '@graphy/types';

export namespace DataFactory {
    function namedNode(value: Iri): NamedNode;
    function blankNode(value?: string): BlankNode;
    function literal(value: string, languageOrDatatype?: string | RDFJS.NamedNode): GenericLiteral;
    function defaultGraph(): DefaultGraph;
    function variable(value: string): Variable;
    function quad(subject: SubjectRole, predicate: PredicateRole, object: ObjectRole, graph?: GraphRole): Quad;
    
    /**
     * @deprecated Use `.quad()` instead
     */
    function triple(): Quad;

    function integer(value: number | string): IntegerLiteral;
    function double(value: number | string): DoubleLiteral;
    function decimal(value: number | string | bigint): DecimalLiteral;
    function boolean(value: boolean | number | string): BooleanLiteral;

    function number(value: number | bigint): NumericLiteral;
    function date(date: Date): DatatypedLiteral;
    function dateTime(dateTime: Date): DatatypedLiteral;
    function ephemeral(): EphemeralBlankNode;

    function fromTerm(term: RDFJS.Term): GenericTerm;
    function fromQuad(quad: RDFJS.Quad): Quad;

    function comment(): ConciseDirective;
    function newlines(): ConciseDirective;

    function concise(iri: Iri, prefixes?: PrefixMap): ConciseNamedNode;
    function terse(iri: Iri, prefixes?: PrefixMap): TerseNamedNode;

    function c1(term: ConciseTerm, prefixes?: PrefixMap): GenericTerm;

    function c1GraphRole(graph: ConciseGraphRole, prefixes?: PrefixMap): GraphRole;
    function c1SubjectRole(subject: ConciseSubjectRole, prefixes?: PrefixMap): SubjectRole;
    function c1PredicateRole(subject: ConcisePredicateRole, prefixes?: PrefixMap): PredicateRole;
    function c1ObjectRole(objectRole: ConciseObjectRole, prefixes?: PrefixMap): ObjectRole;

    function c1Graphable(graph: ConciseGraphable, prefixes?: PrefixMap): Graphable;
    function c1Node(node: ConciseNode, prefixes?: PrefixMap): Node;
    function c1NamedNode(namedNode: ConciseNamedNode, prefixes?: PrefixMap): NamedNode;
    function c1DataTerm(dataTerm: ConciseDataTerm): DataTerm;
    function c1Literal(dataTerm: ConciseLiteral): GenericLiteral;

    function c3(triples: ConciseTriples, prefixes?: PrefixMap, graph?: ConciseGraphable): IterablePortableQuads;
    function c4(quads: ConciseQuads, prefixes?: PrefixMap): IterablePortableQuads;
}