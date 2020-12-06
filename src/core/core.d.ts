import {
	RDFJS,
	Role,
	Iri,
	Terse,
	C1,
	Term,
	PrefixMap,
	PrefixMapRelation,
} from '@graphy/types';

export namespace DataFactory {
	/**
	 * Creates a new `DefaultGraph`.
	 */
	function defaultGraph(): Term.DefaultGraph;

	/**
	 * Creates a new `NamedNode`.
	 * @param iri - the IRI of this NamedNode
	 */
	function namedNode(iri: Iri): Term.NamedNode;

	/**
	 * Creates a new `BlankNode`.
	 * @param label - the optional label to give this BlankNode; otherwise, a Version 4 UUID is generated for the label
	 */
	function blankNode(value?: string): Term.BlankNode;

	/**
	 * Creates a new ephemeral instance of an anonymous `BlankNode`, which will serialize as a syntactic anonymous blank node.
	 */
	function ephemeralBlankNode(): Term.EphemeralBlankNode;

	/**
	 * Creates a new `Literal`.
	 * @param contents - the string contents of this Literal.
	 * @param languageOrDatatype - if passed a string, sets the language tag of this literal; otherwise, sets the datatype
	 */
	function literal(contents: string, languageOrDatatype?: string | Role.Datatype): Term.Literal;

	/**
	 * Creates a new `BooleanLiteral`, which will serialize as a syntactic boolean and has special getters.
	 * @param value - the value of this BooleanLiteral, one of: `true`, `false`, `1`, `0`, or any `string` that matches `/^([Tt](rue)?|TRUE)$/` or `/^([Ff](alse)?|FALSE)$/`
	 */
	function booleanLiteral(value: boolean | number | bigint | string): Term.BooleanLiteral;

	/**
	 * Creates a new `IntegerLiteral`, which will serialize as a syntactic integer and has special getters.
	 * @param value - the value of this IntegerLiteral, either as `number` or `string`
	 */
	function integerLiteral(value: number | bigint | string): Term.IntegerLiteral;

	/**
	 * Creates a new `DoubleLiteral`, which will serialize as a syntactic double and has special getters.
	 * @param value - the value of this DoubleLiteral, either as `number` or `string`
	 */
	function doubleLiteral(value: number | string): Term.DoubleLiteral;
	
	/**
	 * Creates a new `DecimalLiteral`, which will serialize as a syntactic decimal and has special getters.
	 * @param value - the value of this DecimalLiteral, either as `number`, `bigint` or `string`
	 */
	function decimalLiteral(value: number | bigint | string): Term.DecimalLiteral;
	
	/**
	 * Creates a new `NumericLiteral`, manifesting as one of: `IntegerLiteral`, `DoubleLiteral`, `DecimalLiteral`, `PositiveInfinityLiteral`, `NegativeInfinityLiteral`, or `NaNLiteral`, which will serialize as a syntactic numeric literal and has special getters.
	 * @param value - the value of this IntegerLiteral, either as `number`, `bigint` or `string`
	 */
	function numericLiteral(value: number | bigint | string): Term.NumericLiteral;

	/**
	 * Creates a new `DatatypedLiteral` from a `Date` object, with date-level precision, using `xsd:date` for the datatype.
	 * @param date - the date object to create this DatatypedLiteral from
	 */
	function dateLiteral(date: Date): Term.DateLiteral;

	/**
	 * Creates a new `DatatypedLiteral` from a `Date` object, with millisecond precision, using `xsd:dateTime` for the datatype.
	 * @param date - the date object to create this DatatypedLiteral from
	 */
	function dateTimeLiteral(dateTime: Date): Term.DateTimeLiteral;

	/**
	 * Creates a new `Quad`.
	 * @param subject - the subject of this Quad
	 * @param predicate - the predicate of this Quad
	 * @param object - the object of this Quad
	 * @param graph - the optional graph of this Quad; otherwise, defaults to `DefaultGraph`
	 */
	function quad(subject: Role.Subject, predicate: Role.Predicate, object: Role.Object, graph?: Role.Graph): Term.Quad;

	/**
	 * @deprecated Use `.quad()` instead
	 */
	function triple(): Term.Quad;

	/**
	 * Creates a new `Variable`.
	 * @param name - the name of this Variable
	 */
	function variable(name: string): Term.Variable;


	/**
	 * Returns `term` if it is already a graphy Term (including Quads), otherwise calls `fromRdfjsTerm` or `fromC1` depending on the argument's type.
	 * @param term - the Term to convert
	 * @param prefixes - prefix map to use for prefixed names / relative IRIs in c1 string
	 */
	function fromTermLike(term: RDFJS.Term | C1.Any, prefixes: PrefixMap): Term.Any;

	/**
	 * Returns `term` if it is already a graphy Term (including Quads), otherwise calls `fromRdfjsTerm`.
	 * @param term - the Term to convert
	 */
	function fromTerm(term: RDFJS.Term): Term.Any;

	/**
	 * Returns `quad` if it is already a graphy Quad, otherwise calls `fromRdfjsQuad`.
	 * @param term - the Quad to convert
	 */
	function fromQuad(quad: RDFJS.Quad): Term.Quad;

	/**
	 * Convert an RDFJS compatible Term (including Quads) to a graphy Term.
	 * @param term - the Term to convert
	 */
	function fromRdfjsTerm(term: RDFJS.Term): Term.Any;

	/**
	 * Convert an RDFJS compatible Quad to a graphy Quad.
	 * @param quad - the Quad to convert
	 */
	function fromRdfjsQuad(quad: RDFJS.Quad): Term.Quad;

	/**
	 * Construct a graphy Term from a c1 string
	 * @param {C1.Any} term - the c1 string of a Term
	 * @param  {PrefixMap} prefixes - prefix map to use for prefixed names / relative IRIs
	 * @return {Term.NamedNode} - an RDFJS-compatible graphy Term object
	 */
	function fromC1(term: C1.Any, prefixes?: PrefixMap): Term.Any;

	/**
	 * Construct a graphy NamedNode from a c1 string
	 * @param {C1.Any} term - the c1 string of a NamedNode
	 * @param  {PrefixMap} prefixes - prefix map to use for prefixed names / relative IRIs
	 * @return {Term.NamedNode} - an RDFJS-compatible graphy NamedNode object
	 */
	function fromP1(term: C1.Any, prefixes?: PrefixMap): Term.NamedNode;
	
	function comment(): C1.Directive;
	function newlines(): C1.Directive;

	function concise(iri: Iri, prefixes?: PrefixMap): C1.NamedNode;
	function terse(iri: Iri, prefixes?: PrefixMap): Terse.NamedNode;

	
	function c1ExpandData(term: C1.Data, prefixes: PrefixMap): C1.Data;

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
