import type {
	// Api,
	// RDFJS,
	// Role,
	Iri,
	// Terse,
	// C1,
	// Term,
	// SubjectData,
	// PredicateData,
	// ObjectData,
	// GraphData,
	// PrefixMap,
	// PrefixMapRelation,

	Descriptor,
	Qualifier,
	FromQualifier,

	A1_Data,

	// c1 groups
	C1_Data,
	C1_Node,
	C1_BlankNode,

	// c1 items
	C1_DefaultGraph,
	C1_NamedNode,
	C1_AnonymousBlankNode,
	C1_LabeledBlankNode,
	C1_SimpleLiteral,
	C1_LanguagedLiteral,
	C1_DatatypedLiteral,
	C1_Variable,
	C1_Quad,
	C1_Directive,

	// c1 roles
	C1_Graph,
	C1_Subject,
	C1_Predicate,
	C1_Object,
	C1_Datatype,

	T1_NamedNode,

	// c4 structs & items
	C4_Triples,
	C4_Quads,
	C4_TripleBundle,
	C4_QuadBundle,

	TermFromC1,

	D_Subject,
	D_Predicate,
	D_Object,
	D_Graph,

	G_DefaultGraph,
	G_NamedNode,
	G_BlankNode,
	G_Literal,
	G_BooleanLiteral,
	G_NumericLiteral,
	G_IntegerLiteral,
	G_DoubleLiteral,
	G_DecimalLiteral,
	G_DateLiteral,
	G_DateTimeLiteral,
	G_Variable,
	G_Quad,

	Datatype,
	DatatypeData,

	QuadArg,

	LiterallyTrue,
	LiterallyFalse,

	PrefixMap,
	PrefixMapArg,
	PrefixMapRelation,

	P_IRI_XSD_BOOLEAN,
	RdfMode_11,
	SupportedRdfMode,
	Predicate,
	Object,
	
	QuadTypeKey,

	
} from '@graphy/types';



/**
 * === _**@graphy/terms**_ ===
 * 
 * Creates a new {@link DefaultGraph}.
 */
declare function defaultGraph(): G_DefaultGraph;


/**
 * === _**@graphy/terms**_ ===
 *
 * Creates a new {@link NamedNode}.
 * 
 * @param iri - the IRI of this NamedNode
 */
declare function namedNode<valueString extends Iri>(iri: valueString): G_NamedNode<valueString>;


/**
 * === _**@graphy/terms**_ ===
 * 
 * Creates a new {@link BlankNode}.
 * 
 * @param label - optional label to give this BlankNode; otherwise, generates a UUIDv4
 */
declare function blankNode<valueString extends string>(value?: valueString): G_BlankNode<valueString, 'labeled' | 'anonymous'>;


/**
 * === _**@graphy/terms**_ ===
 * 
 * Creates a new ephemeral instance of a {@link BlankNode}, which will serialize as a syntactic anonymous blank node.
 */
declare function ephemeralBlankNode(): G_BlankNode<string, 'ephemeral'>;


type Literal_ReturnType<
	s_value extends string,
	z_language_or_datatype extends string | Datatype,
> = z_language_or_datatype extends `@${infer s_language}`
	? G_Literal<s_value, s_language>
	: z_language_or_datatype extends DatatypeData
		? G_Literal<s_value, '', z_language_or_datatype['value']>
		: z_language_or_datatype extends string
			? G_Literal<s_value, z_language_or_datatype>
			: never;

/**
 * === _**@graphy/terms**_ ===
 * 
 * Creates a new {@link Literal}.
 * 
 * @param contents - the string contents of this Literal.
 * @param languageOrDatatype - if passed a string, sets the language tag of this literal; otherwise, sets the datatype
 */
declare function literal<
	valueString extends string,
	languageOrDatatypeType extends string | Datatype,
>(contents: valueString, languageOrDatatype?: languageOrDatatypeType): Literal_ReturnType<valueString, languageOrDatatypeType>;


type BooleanStringMap = {
	'0': '0';
	'F': 'false';
	'f': 'false';
	'1': '1';
	'T': 'true';
	't': 'true';
};

type ValueArg_BooleanLiteral = false | true | 0 | 1 | 0n | 1n | keyof BooleanStringMap | LiterallyFalse | LiterallyTrue;

type BooleanLiteral_0 = G_BooleanLiteral<'0'>;
type BooleanLiteral_1 = G_BooleanLiteral<'1'>;
type BooleanLiteral_False = G_BooleanLiteral<'false'>;
type BooleanLiteral_True = G_BooleanLiteral<'true'>;

type BooleanLiteral_ReturnType<
	w_arg extends ValueArg_BooleanLiteral
> = w_arg extends string
? string extends w_arg
	? G_Literal<w_arg, '', P_IRI_XSD_BOOLEAN>
	: w_arg extends keyof BooleanStringMap
		? G_BooleanLiteral<BooleanStringMap[w_arg]>
		: w_arg extends LiterallyFalse
			? BooleanLiteral_False
			: w_arg extends LiterallyTrue
				? BooleanLiteral_True
				: never
: w_arg extends number
	? w_arg extends 0
		? BooleanLiteral_0
		: w_arg extends 1
			? BooleanLiteral_1
			: never
	: w_arg extends bigint
		? w_arg extends 0n
			? BooleanLiteral_0
			: w_arg extends 1n
				? BooleanLiteral_1
				: never
		: w_arg extends boolean
			? w_arg extends false
				? BooleanLiteral_False
				: w_arg extends true
					? BooleanLiteral_True
					: never
			: never;

/**
 * === _**@graphy/terms**_ ===
 * 
 * Creates a new {@link BooleanLiteral}, which will serialize as a syntactic boolean and has special getters.
 * 
 * @param value - the  boolean value to use, which must match one of the following types:
 *  - ```ts
 *   false | true  // `.value` will be 'false' or 'true'
 * ```
 *  - ```ts
 *   0 | 1 | 0n | 1n | '0' | '1'  // `.value` will be '0' or '1'
 * ```
 *  - A `string` matching either:
 *   ```ts
 *      /^([Ff](alse)?|FALSE)$/  // `.value` will be 'false'
 *      /^([Tt](rue)?|TRUE)$/  // `.value` will be 'true'
 *   ```
 */
declare function booleanLiteral<valueString extends ValueArg_BooleanLiteral>(value: valueString): BooleanLiteral_ReturnType<valueString>;


/**
 * === _**@graphy/terms**_ ===
 * 
 * Creates a new {@link IntegerLiteral}, which will serialize as a syntactic integer and has special getters.
 * 
 * @param value - the value of this IntegerLiteral, either as `number` or `string`
 */
declare function integerLiteral<valueType extends number | bigint | string>(value: valueType): G_IntegerLiteral<`${valueType}`>;


	/**
 * Creates a new `DoubleLiteral`, which will serialize as a syntactic double and has special getters.
 * @param value - the value of this DoubleLiteral, either as `number` or `string`
 */
declare function doubleLiteral<valueType extends number | string>(value: valueType): G_DoubleLiteral<`${valueType}`>;


/**
 * Creates a new `DecimalLiteral`, which will serialize as a syntactic decimal and has special getters.
 * @param value - the value of this DecimalLiteral, either as `number`, `bigint` or `string`
 */
declare function decimalLiteral<valueType extends number | bigint | string>(value: valueType): G_DecimalLiteral<`${valueType}`>;


/**
 * Creates a new `NumericLiteral`, manifesting as one of: `IntegerLiteral`, `DoubleLiteral`, `DecimalLiteral`, `PositiveInfinityLiteral`, `NegativeInfinityLiteral`, or `NaNLiteral`, which will serialize as a syntactic numeric literal and has special getters.
 * @param value - the value of this IntegerLiteral, either as `number`, `bigint` or `string`
 */
declare function numericLiteral<valueType extends number | bigint | string>(value: valueType): G_NumericLiteral<`${valueType}`>;


/**
 * Creates a new `DatatypedLiteral` from a `Date` object, with date-level precision, using `xsd:date` for the datatype.
 * @param date - the date object to create this DatatypedLiteral from
 */
declare function dateLiteral(date: Date): G_DateLiteral<string>;


/**
 * Creates a new `DatatypedLiteral` from a `Date` object, with millisecond precision, using `xsd:dateTime` for the datatype.
 * @param date - the date object to create this DatatypedLiteral from
 */
declare function dateTimeLiteral(dateTime: Date): G_DateTimeLiteral<string>;

declare function quad<
	w_qualifier extends Qualifier = [QuadTypeKey],
>(): FromQualifier<w_qualifier> extends infer a_descriptor
	? a_descriptor extends Descriptor
		? (subject: D_Subject<Descriptor.Access<a_descriptor, 'subject'>>,
			predicate: D_Predicate<Descriptor.Access<a_descriptor, 'predicate'>>,
			object: D_Object<Descriptor.Access<a_descriptor, 'object'>>,
			graph?: D_Graph<Descriptor.Access<a_descriptor, 'graph'>>
		) => G_Quad<a_descriptor>
		: never
	: never;

// /**
//  * Creates a new `Quad`.
//  * @param subject - the subject of this Quad
//  * @param predicate - the predicate of this Quad
//  * @param object - the object of this Quad
//  * @param graph - the optional graph of this Quad; otherwise, defaults to `DefaultGraph`
//  */
// const quad: quad;

// function quad<
// 	SubjectTermTypeString extends string=string,
// 	SubjectValueString extends string=string,
// 	PredicateValueString extends string=string,
// 	ObjectTermTypeString extends string=string,
// 	ObjectValueString extends string=string,
// 	ObjectLanguageString extends string=string,
// 	ObjectDatatypeString extends string=string,
// 	GraphTermTypeString extends string=string,
// 	GraphValueString extends string=string,
// >(subject: Role.Subject<SubjectTermTypeString, SubjectValueString>,
// 	predicate: Role.Predicate<PredicateValueString>,
// 	object: Role.Object<ObjectTermTypeString, ObjectValueString, ObjectLanguageString, ObjectDatatypeString>,
// 	graph?: Role.Graph<GraphTermTypeString, GraphValueString>
// ): Term.Quad<
// 	Term.Subject<SubjectTermTypeString, SubjectValueString>,
// 	Term.Predicate<PredicateValueString>,
// 	Term.Object<ObjectTermTypeString, ObjectValueString, ObjectLanguageString, ObjectDatatypeString>,
// 	Term.Graph<GraphTermTypeString, GraphValueString>,
// >;


/**
 *  === _**@graphy/terms**_ ===
 * 
 * @deprecated Use {@link quad `quad()`} instead.
 */
declare function triple(): G_Quad;


/**
 *  === _**@graphy/terms**_ ===
 * 
 * Creates a new {@link Variable Variable}.
 * 
 * @param name - the name of this Variable
 * 
 * --- **Examples:** ---
 * ```ts
 * 	import { variable } from '@graphy/terms';
 * 
 * 	variable('s');
 * ```
 */
declare function variable<
	valueString extends string,
>(name: valueString): G_Variable<valueString>;


/**
 * Returns `term` if it is already a graphy Term (including Quads), otherwise calls `fromRdfjsTerm` or `fromC1` depending on the argument's type.
 * @param term - the Term to convert
 * @param prefixes - prefix map to use for prefixed names / relative IRIs in c1 string
 */
declare function fromTermLike<TermType extends Term.Any=Term.Any>(term: RDFJS.Term | C1_Data, prefixes: PrefixMap): TermType;


/**
 * Returns `term` if it is already a graphy Term (including Quads), otherwise calls `fromRdfjsTerm`.
 * @param term - the Term to convert
 */
declare function fromTerm<
	z_term extends Api.Term,
>(term: z_term): {
	DefaultGraph: Term.DefaultGraph;
	NamedNode: Term.NamedNode;
	BlankNode: Term.BlankNode;
	Literal: Term.Literal;
	Quad: Term.Quad;
	Variable: Term.Variable;
}[z_term['termType']];


/**
 * Returns `quad` if it is already a graphy Quad, otherwise calls `fromRdfjsQuad`.
 * @param term - the Quad to convert
 */
declare function fromQuad(src: QuadArg): G_Quad;


/**
 * Convert an RDFJS compatible Term (including Quads) to a graphy Term.
 * @param term - the Term to convert
 */
declare function fromRdfjsTerm<TermType extends Term.Any=Term.Any>(term: RDFJS.Term): TermType;


/**
 * Convert an RDFJS compatible Quad to a graphy Quad.
 * @param quad - the Quad to convert
 */
declare function fromRdfjsQuad(src: RDFJS.Quad): G_Quad;


/**
 * Construct a graphy Term from a c1 string
 * @param {C1.Any} term - the c1 string of a Term
 * @param  {PrefixMap} prefixes - prefix map to use for prefixed names / relative IRIs
 * @return {Term.NamedNode} - an RDFJS-compatible graphy Term object
 */
declare function fromC1<termString extends C1_Data=C1_Data>(term: termString, prefixes?: PrefixMapArg): TermFromC1<termString>;


/**
 * Construct a graphy NamedNode from a A1 string
 * @param {P1.Any} term - the p1 string of a NamedNode
 * @param  {PrefixMap} prefixes - prefix map to use for prefixed names / relative IRIs
 * @return {Term.NamedNode} - an RDFJS-compatible graphy NamedNode object
 */
declare function fromA1<termString extends A1_Data=A1_Data>(term: termString, prefixes?: PrefixMapArg): TermFromC1<termString>;

declare function comment(): C1_Directive;
declare function newlines(): C1_Directive;

declare function concise<
	iriValue extends Iri,
	prefixesValue extends PrefixMapArg,
>(iri: iriValue, prefixes?: prefixesValue): C1_NamedNode<iriValue, prefixesValue>;

declare function terse<
	iriValue extends Iri,
	prefixesValue extends PrefixMapArg,
>(iri: Iri, prefixes?: PrefixMap): T1_NamedNode<iriValue, prefixesValue>;


declare function c1CompactData<C1Type extends C1.Data=C1.Data>(term: C1Type, prefixes: PrefixMap): C1Type;
declare function c1ExpandData<C1Type extends C1.Data=C1.Data>(term: C1Type, prefixes: PrefixMap): C1Type;

declare function graphFromC1(graph: C1_Graph, prefixes: PrefixMap): ;

declare function subjectFromC1<
	termC1 extends C1_Subject<rdfMode>,
	prefixMap extends PrefixMapArg,
	rdfMode extends SupportedRdfMode=RdfMode_11,
>(subject: termC1, prefixes: prefixMap): TermFromC1<termC1, prefixMap>;

declare function predicateFromC1(subject: C1_Predicate, prefixes: PrefixMap): Predicate;
declare function objectFromC1(objectRole: C1_Object, prefixes: PrefixMap): Object;

declare function c1FromGraphRole(graph: StarRole.Graph, prefixes: PrefixMap): C1_Graph;
declare function c1FromSubjectRole(subject: StarRole.Subject, prefixes: PrefixMap): C1_Subject;
declare function c1FromPredicateRole(predicate: StarRole.Predicate, prefixes: PrefixMap): C1_Predicate;
declare function c1FromObjectRole(object: StarRole.Object, prefixes: PrefixMap): C1_Object;

// function c1Graphable(graph: graphy.ConciseGraphable, prefixes?: graphy.PrefixMap): graphy.Graphable;
// function c1Node(node: graphy.ConciseNode, prefixes?: graphy.PrefixMap): graphy.Node;
// function c1NamedNode(namedNode: graphy.ConciseNamedNode, prefixes?: graphy.PrefixMap): graphy.NamedNode;
// function c1DataTerm(dataTerm: graphy.ConciseDataTerm): graphy.DataTerm;
// function c1Literal(dataTerm: graphy.ConciseLiteral): graphy.GenericLiteral;

declare function c3<
	triplesArg extends C4_Triples,
	prefixMap extends PrefixMapArg,
	graphC1 extends C1_Graph<RdfMode_11>=C1_DefaultGraph,
>(triples: triplesArg, prefixes?: prefixMap, graph?: graphC1): C4_TripleBundle<graphC1>;

declare function c4<
	prefixMap extends PrefixMapArg,
>(quads: C4_Quads, prefixes?: PrefixMap): C4_QuadBundle;

declare function relatePrefixMaps(prefixesA: PrefixMap, prefixesB: PrefixMap): PrefixMapRelation;
declare function prefixMapsDiffer(prefixesA: PrefixMap, prefixesB: PrefixMap): boolean;
