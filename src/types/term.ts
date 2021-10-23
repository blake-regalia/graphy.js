import type {
	Union,
	List,
} from 'ts-toolbelt';

import type {
	Equals,
	Extends,
	Type,
} from 'ts-toolbelt/out/Any/_api';

import type {
	And,
	Not,
	Or,
} from 'ts-toolbelt/out/Boolean/_api';

import type {
	If,
} from 'ts-toolbelt/out/Any/If';

import type {
	Merge,
} from 'ts-toolbelt/out/Object/_api';

import type {
	Join,
} from 'ts-toolbelt/out/String/_api';

import type {
	ASSERT_TRUE,
	ASSERT_FALSE,
	ASSERT_BOOLEAN,
	ASSERT_EQUAL,
	ASSERT_NEVER,
	ASSERT_SAME,
	ASSERT_STRING,
	ASSERT_VOID,
	True,
	False,
	Bool,
	AsBool,
	Coerce,
	IsOnlyLiteralStrings,
	StringsMatch,
	AutoString,
	Includes,
	ToPrimitiveBoolean,
	AsString,
} from './utility';

import {
	P_XSD_STRING,
	P_RDFS_LANGSTRING,
	RdfMode_11,
	RdfMode_star,
	RdfMode_easier,
	AllowedRdfMode,
	DescribeRdfMode,
} from './const';

import {
	BypassDescriptor,
	Descriptor,
	FromQualifier,
	Qualifier,
} from './descriptor';


declare const debug_hint: unique symbol;

// Debug and Error types
type Debug<
	A extends any,
	Hint extends any,
> = {
	[debug_hint]: Hint;
} & A;

type InvalidTermTypeError<
	TermTypeString extends string,
	Disguise=unknown,
> = Debug<Disguise, `'${TermTypeString}' is an invalid value for the .termType property`>;

type IncompatibleTermTypeError<
	TermTypeString extends string,
	Category extends string,
	Disguise=unknown,
> = Debug<Disguise, `'${TermTypeString}' is an incompatible .termType value for ${Category}`>;



type FavorTermType<
	TermTypeSring extends string,
	KeysSet extends TermTypeKey=TermTypeKey,
> = Coerce<TermTypeSring, string, KeysSet>;


interface TermTypes {
	NamedNode: NamedNode;
	BlankNode: BlankNode;
	Literal: Literal;
	Variable: {};
	DefaultGraph: {};
	Quad: {};
}

type ValidTermType<
	KeysSet extends string,
	TermTypeString extends string,
> = If<
	IsOnlyLiteralStrings<TermTypeString>,
	Extends<TermTypeString, KeysSet>,
	True
>;

type ValidTermTypes<
	KeysSet extends string,
	TermTypeStringA extends string,
	TermTypeStringB extends string,
> = And<
	If<
		IsOnlyLiteralStrings<TermTypeStringA>,
		Extends<TermTypeStringA, KeysSet>,
		True
	>,
	If<
		IsOnlyLiteralStrings<TermTypeStringB>,
		Extends<TermTypeStringB, KeysSet>,
		True
	>
>;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const HS: ASSERT_FALSE<Extends<string, ObjectTypeKey>> = 1;
	const HN: ASSERT_TRUE<Extends<'NamedNode', ObjectTypeKey>> = 1;
	const HD: ASSERT_FALSE<Extends<'DefaultGraph', ObjectTypeKey>> = 1;
	const HI: ASSERT_FALSE<Extends<'Invalid', ObjectTypeKey>> = 1;

	const OSS: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, string, string>> = 1;
	const OSD: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, string, 'DefaultGraph'>> = 1;
	const OSI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, string, 'Invalid'>> = 1;
	const ODS: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'DefaultGraph', string>> = 1;
	const OIS: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'Invalid', string>> = 1;
	const ODD: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'DefaultGraph', 'DefaultGraph'>> = 1;
	const ODI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'DefaultGraph', 'Invalid'>> = 1;
	const OID: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'Invalid', 'DefaultGraph'>> = 1;
	const OII: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'Invalid', 'Invalid'>> = 1;

	const OSN: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, string, 'NamedNode'>> = 1;
	const ONS: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'NamedNode', string>> = 1;
	const ONN: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'NamedNode', 'NamedNode'>> = 1;
	const OND: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'NamedNode', 'DefaultGraph'>> = 1;
	const ONI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'NamedNode', 'Invalid'>> = 1;

	const OSB: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, string, 'BlankNode'>> = 1;
	const OBS: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'BlankNode', string>> = 1;
	const OBB: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'BlankNode', 'BlankNode'>> = 1;
	const OBD: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'BlankNode', 'DefaultGraph'>> = 1;
	const OBI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'BlankNode', 'Invalid'>> = 1;

	const OSL: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, string, 'Literal'>> = 1;
	const OLS: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'Literal', string>> = 1;
	const OLL: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'Literal', 'Literal'>> = 1;
	const OLD: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'Literal', 'DefaultGraph'>> = 1;
	const OLI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'Literal', 'Invalid'>> = 1;

	const ONB: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'NamedNode', 'BlankNode'>> = 1;
	const ONL: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'NamedNode', 'Literal'>> = 1;

	const OBN: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'BlankNode', 'NamedNode'>> = 1;
	const OBL: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'BlankNode', 'Literal'>> = 1;

	const OLN: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'Literal', 'NamedNode'>> = 1;
	const OLB: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'Literal', 'BlankNode'>> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}

/**
 * Union of all valid .termType string value types
 */
export type TermTypeKey = keyof TermTypes;

/**
 * The .termType string value type "NamedNode"
 */
export type NamedNodeTypeKey = Extract<TermTypeKey, 'NamedNode'>;

/**
 * The .termType string value type "BlankNode"
 */
export type BlankNodeTypeKey = Extract<TermTypeKey, 'BlankNode'>;

/**
 * The .termType string value type "Literal"
 */
export type LiteralTypeKey = Extract<TermTypeKey, 'Literal'>;

/**
 * The .termType string value type "DefaultGraph"
 */
export type DefaultGraphTypeKey = Extract<TermTypeKey, 'DefaultGraph'>;

/**
 * The .termType string value type "Quad"
 */
export type QuadTypeKey = Extract<TermTypeKey, 'Quad'>;

/**
 * The .termType string value type "Variable"
 */
export type VariableTypeKey = Extract<TermTypeKey, 'Variable'>;


/**
 * Union of NamedNode and BlankNode term types
 */
export type NodeTypeKey = NamedNodeTypeKey | BlankNodeTypeKey;

/**
 * Union of valid .termType string value types which only require the .termType and .value properties.
 */
export type TrivialTypeKey = NodeTypeKey | DefaultGraphTypeKey | VariableTypeKey;

/**
 * Union of valid .termType string value types which carry actual data.
 */
export type DataTypeKey = Exclude<TermTypeKey, VariableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data.
 */
export type ValuableTypeKey = Extract<TermTypeKey, NodeTypeKey | LiteralTypeKey | VariableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data.
 */
export type UnvaluableTypeKey = Exclude<TermTypeKey, ValuableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data and ARE NOT required to have an empty .value property.
 */
export type ValuableDataTypeKey = Extract<DataTypeKey, ValuableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data and ARE required to have an empty .value property.
 */
export type UnvaluableDataTypeKey = Exclude<DataTypeKey, ValuableDataTypeKey>;


/**
 * `<RdfMode extends AllowedRdfMode=RdfMode_11> => TermTypeKey`
 *
 * Returns the union of valid .termType string values for Terms that appear in the subject position for the given `RdfMode`
 */
export type SubjectTypeKey<
	RdfMode extends AllowedRdfMode=RdfMode_11,
> = Merge<
	{[K in RdfMode_11]: NodeTypeKey},
		Merge<
			{[K in RdfMode_star]: NodeTypeKey | QuadTypeKey},
			{[K in RdfMode_easier]: DataTypeKey}
		>
>[RdfMode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<SubjectTypeKey, NodeTypeKey> = 1;
	const N: ASSERT_SAME<SubjectTypeKey<RdfMode_11>, NodeTypeKey> = 1;
	const S: ASSERT_SAME<SubjectTypeKey<RdfMode_star>, NodeTypeKey | QuadTypeKey> = 1;
	const E: ASSERT_SAME<SubjectTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


/**
 * `<RdfMode extends AllowedRdfMode=RdfMode_11> => TermTypeKey`
 *
 * Returns the union of valid .termType string values for Terms that appear in the predicate position for the given `RdfMode`
 */
export type PredicateTypeKey<
	RdfMode extends AllowedRdfMode=RdfMode_11,
> = Merge<
	{[K in RdfMode_11 | RdfMode_star]: NamedNodeTypeKey},
	{[K in RdfMode_easier]: DataTypeKey}
>[RdfMode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<PredicateTypeKey, NamedNodeTypeKey> = 1;
	const N: ASSERT_SAME<PredicateTypeKey<RdfMode_11>, NamedNodeTypeKey> = 1;
	const S: ASSERT_SAME<PredicateTypeKey<RdfMode_star>, NamedNodeTypeKey> = 1;
	const E: ASSERT_SAME<PredicateTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


/**
 * `<RdfMode extends AllowedRdfMode=RdfMode_11> => TermTypeKey`
 *
 * Returns the union of valid .termType string values for Terms that appear in the object position for the given `RdfMode`
 */
export type ObjectTypeKey<
	RdfMode extends AllowedRdfMode=RdfMode_11,
> = Merge<
	{[K in RdfMode_11]: ValuableDataTypeKey},
		Merge<
			{[K in RdfMode_star]: ValuableDataTypeKey | QuadTypeKey},
			{[K in RdfMode_easier]: DataTypeKey}
		>
>[RdfMode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<ObjectTypeKey, ValuableDataTypeKey> = 1;
	const N: ASSERT_SAME<ObjectTypeKey<RdfMode_11>, ValuableDataTypeKey> = 1;
	const S: ASSERT_SAME<ObjectTypeKey<RdfMode_star>, ValuableDataTypeKey | QuadTypeKey> = 1;
	const E: ASSERT_SAME<ObjectTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


/**
 * `<RdfMode extends AllowedRdfMode=RdfMode_11> => TermTypeKey`
 *
 * Returns the union of valid .termType string values for Terms that appear in the graph position for the given `RdfMode`
 */
export type GraphTypeKey<
	RdfMode extends AllowedRdfMode=RdfMode_11,
> = Merge<
	{[K in RdfMode_11 | RdfMode_star]: NodeTypeKey | DefaultGraphTypeKey},
	{[K in RdfMode_easier]: DataTypeKey}
>[RdfMode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<GraphTypeKey, NodeTypeKey | DefaultGraphTypeKey> = 1;
	const N: ASSERT_SAME<GraphTypeKey<RdfMode_11>, NodeTypeKey | DefaultGraphTypeKey> = 1;
	const S: ASSERT_SAME<GraphTypeKey<RdfMode_star>, NodeTypeKey | DefaultGraphTypeKey> = 1;
	const E: ASSERT_SAME<GraphTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


/**
 * `<RdfMode extends AllowedRdfMode=RdfMode_11> => TermTypeKey`
 *
 * Returns the union of valid .termType string values for Terms that appear in the datatype position for the given `RdfMode`
 */
export type DatatypeTypeKey<
	RdfMode extends AllowedRdfMode=RdfMode_11,
> = Merge<
	{[K in RdfMode_11 | RdfMode_star]: NamedNodeTypeKey},
	{[K in RdfMode_easier]: DataTypeKey}
>[RdfMode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<DatatypeTypeKey, NamedNodeTypeKey> = 1;
	const N: ASSERT_SAME<DatatypeTypeKey<RdfMode_11>, NamedNodeTypeKey> = 1;
	const S: ASSERT_SAME<DatatypeTypeKey<RdfMode_star>, NamedNodeTypeKey> = 1;
	const E: ASSERT_SAME<DatatypeTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}



/**
 * Type for Term data as an argument
 */
export type TermDataArgument<
	a_descriptor extends Descriptor | BypassDescriptor = BypassDescriptor,
> = a_descriptor extends Descriptor
	? AsTypedTermData<a_descriptor>
	: {
		// core
		termType: string;
		value: string;

		// literal
		language?: string;
		datatype?: Datatype;

		// quad
		subject?: TermDataArgument;
		predicate?: TermDataArgument;
		object?: TermDataArgument;
		graph?: TermDataArgument;
	};


/**
 * Base type for term data (i.e., no methods, just data fields)
 */
export type CoreData<
	a_descriptor extends Descriptor = Descriptor,
> = {
	termType: Descriptor.Access<a_descriptor, 'termType'>;
	value: Descriptor.Access<a_descriptor, 'value'>;
};

/**
 * Type for Literal term data (i.e., no methods, just data fields)
 */
export type LiteralData<
	a_descriptor extends Descriptor<LiteralTypeKey> = Descriptor<LiteralTypeKey>,
	> = Merge<CoreData<a_descriptor>, {
		language: Descriptor.Access<a_descriptor, 'language'>;
		datatype: Descriptor.Access<a_descriptor, 'datatype'>;
	}>;


/**
 * Type for quad term data (i.e., no methods, just data fields)
 */
export type QuadData<
	a_descriptor extends Descriptor<QuadTypeKey> = Descriptor<QuadTypeKey>,
> = Merge<CoreData<a_descriptor>, {
	subject: SubjectData<Descriptor.Access<a_descriptor, 'subject'>>;
	predicate: PredicateData<Descriptor.Access<a_descriptor, 'predicate'>>;
	object: ObjectData<Descriptor.Access<a_descriptor, 'object'>>;
	graph: GraphData<Descriptor.Access<a_descriptor, 'graph'>>;
}>;


type SafeTermType<
	a_descriptor extends Descriptor,
	s_term_restrict extends TermTypeKey,
	s_category extends string = Join<Union.ListOf<s_term_restrict>, ', '>,
	s_term extends string = Descriptor.Access<a_descriptor, 'termType'>,
> = s_term extends s_term_restrict
	? (s_term extends TermTypeKey
		? AsTypedTermData<a_descriptor>
		: never
	)
	: IncompatibleTermTypeError<s_term, s_category, CoreData>;


type BlankNodeData<
	a_descriptor extends Descriptor,
	s_category extends string = 'a blank node',
> = SafeTermType<a_descriptor, 'BlankNode', s_category>


type NamedNodeData<
	a_descriptor extends Descriptor,
	s_category extends string = 'a named node',
> = SafeTermType<a_descriptor, 'NamedNode', s_category>


type NodeData<
	a_descriptor extends Descriptor,
	s_category extends string = 'a node type',
> = SafeTermType<a_descriptor, NodeTypeKey, s_category>


type DatatypeData<
	a_descriptor extends Descriptor,
	> = NamedNodeData<a_descriptor, 'a datatype'>;


type CategorySubjectPosition = 'the subject position';
type CategoryPredicatePosition = 'the predicate position';
type CategoryObjectPosition = 'the object position';
type CategoryGraphPosition = 'the graph position';

type ExplainPosition<
	Category extends string,
	RdfMode extends AllowedRdfMode,
> = `${Category} in ${DescribeRdfMode<RdfMode>}`;




/**
 * Type for subject position term data
 */
export type SubjectData<
	a_descriptor extends Descriptor<SubjectTypeKey<AllowedRdfMode>> = Descriptor<SubjectTypeKey>,
	s_mode extends AllowedRdfMode=Descriptor.Access<a_descriptor, 'mode'>,
	s_category extends string = ExplainPosition<CategorySubjectPosition, s_mode>,
> = Merge<
	{
		[K in RdfMode_11]: NodeData<a_descriptor, s_category>;
	},
	Merge<
		{
			[K in RdfMode_star]: SafeTermType<a_descriptor, NodeTypeKey | QuadTypeKey, s_category>;
		},
		{
			[K in RdfMode_easier]: AllowedTermType<a_descriptor, TermTypeKey>;
		}
	>
>[s_mode];


/**
 * Type for predicatte position term data
 */
export type PredicateData<
	a_descriptor extends Descriptor<PredicateTypeKey<AllowedRdfMode>> = Descriptor<PredicateTypeKey>,
	s_mode extends AllowedRdfMode = Descriptor.Access<a_descriptor, 'mode'>,
	s_category extends string = ExplainPosition<CategoryPredicatePosition, s_mode>,
> = Merge<
	{
		[K in RdfMode_11 | RdfMode_star]: NamedNodeData<a_descriptor, s_category>;
	},
	{
		[K in RdfMode_easier]: AllowedTermType<a_descriptor, TermTypeKey>;
	}
>[s_mode];


/**
 * Type for object position term data
 */
export type ObjectData<
	a_descriptor extends Descriptor<ObjectTypeKey<AllowedRdfMode>> = Descriptor<ObjectTypeKey>,
	s_mode extends AllowedRdfMode = Descriptor.Access<a_descriptor, 'mode'>,
	s_category extends string = ExplainPosition<CategoryObjectPosition, s_mode>,
> = Merge<
	{
		[K in RdfMode_11]: SafeTermType<a_descriptor, ObjectTypeKey, s_category>;
	},
	Merge<
		{
			[K in RdfMode_star]: SafeTermType<a_descriptor, ObjectTypeKey | QuadTypeKey, s_category>;
		},
		{
			[K in RdfMode_easier]: AllowedTermType<a_descriptor, TermTypeKey>;
		}
	>
>[s_mode];


/**
 * Type for graph position term data
 */
export type GraphData<
	a_descriptor extends Descriptor<GraphTypeKey<AllowedRdfMode>> = Descriptor<GraphTypeKey>,
	s_mode extends AllowedRdfMode = Descriptor.Access<a_descriptor, 'mode'>,
	s_category extends string = ExplainPosition<CategoryGraphPosition, s_mode>,
> = Merge<
	{
		[K in RdfMode_11 | RdfMode_star]: SafeTermType<a_descriptor, GraphTypeKey, s_category>;
	},
	{
		[K in RdfMode_easier]: AllowedTermType<a_descriptor, TermTypeKey>;
	}
>[s_mode];



/**
 * Routes to a term data type based on descriptor
 */
type AsTypedTermData<
	a_descriptor extends Descriptor,
> = Merge<
	{
		[K in QuadTypeKey]: a_descriptor extends Descriptor<QuadTypeKey>? QuadData<a_descriptor>: never;
		// 	Descriptor.Filter<a_descriptor, Descriptor.Access<a_descriptor, 'termType'>>
		// >;
	},
	Merge<
		{
			[K in LiteralTypeKey]: a_descriptor extends Descriptor<LiteralTypeKey>? LiteralData<a_descriptor>: never;
			// 	Descriptor.Filter<a_descriptor, Descriptor.Access<a_descriptor, 'termType'>>
			// >;
		},
		// Merge<
			{
				[K in TermTypeKey]: CoreData<
					Descriptor.Filter<a_descriptor, Descriptor.Access<a_descriptor, 'termType'>>
				>
			}
		// >
	>
>[Descriptor.Access<a_descriptor, 'termType'>];

{
	type TEST = AsTypedTermData<FromQualifier<['Literal']>>;
	type WT = Term<['Literal', string, void, void]>
}


/**
 * Complements term data type with RDFJS methods
 */
type Term<
	z_qualifier_a extends Qualifier = BypassDescriptor,
> = FromQualifier<z_qualifier_a> extends infer a_descriptor_a
	? (a_descriptor_a extends Descriptor
		? Merge<
			AsTypedTermData<a_descriptor_a>,
			z_qualifier_a extends BypassDescriptor
			? {
				equals<
					z_other extends TermDataArgument | null | undefined,
				>(y_other: z_other): z_other extends null | undefined? false: boolean;
			}
			: {
				equals<
					a_descriptor_b extends Descriptor = Descriptor,
				>(y_other: AsTypedTermData<a_descriptor_b>): a_descriptor_b extends Descriptor
					? TermsEqual<a_descriptor_a, a_descriptor_b>
					: boolean
			}
		>
		: never
	)
	: never;

{
	type TEST = FromQualifier<['Literal', string, void, void]>;
	type LitDesc = Descriptor<'Literal'>;
	type SHO = TEST extends LitDesc? 'Y': 'N';
	type TEST1 = Term<['Literal', string, void, void]>;
}

type RawTermsEqual<
	a_descriptor_a extends Descriptor,
	a_descriptor_b extends Descriptor,

	s_term_a extends string=Descriptor.Access<a_descriptor_a, 'termType'>,
	s_term_b extends string=Descriptor.Access<a_descriptor_b, 'termType'>,
> = If<
		Not<ValidTermType<TermTypeKey, s_term_a>>,
		InvalidTermTypeError<s_term_a, boolean>,
		If<
			Not<ValidTermType<TermTypeKey, s_term_b>>,
			InvalidTermTypeError<s_term_b, boolean>,
			// (a|b).termType are strings in {valid-term-type-keys}
			And<
				StringsMatch<s_term_a, s_term_b>,
				StringsMatch<
					Descriptor.Access<a_descriptor_a, 'value'>,
					Descriptor.Access<a_descriptor_b, 'value'>
				>
			> extends infer b_terms_and_values_match
				// (TermType|Value)StringsMatch := a.(termType|value) === b.(termType|value)
				// ? (Not<AsBool<TermTypeAndValueStringsMatch>> extends True
				? (b_terms_and_values_match extends False
					// a.termType !== b.termType || a.value !== b.value
					? False
					// mixed termTypes and values
					: (Or<
						Equals<s_term_a, 'Literal'>,
						Equals<s_term_b, 'Literal'>
					> extends True
						// (a|b).termType === 'Literal'
						? If<
							Or<
								Not<StringsMatch<
									Descriptor.Access<a_descriptor_a, 'language'>,
									Descriptor.Access<a_descriptor_b, 'language'>
								>>,
								Not<StringsMatch<
									Descriptor.Access<a_descriptor_a, 'datatype'>,
									Descriptor.Access<a_descriptor_b, 'datatype'>
								>>
							>,
							// a.language !== b.language || a.datatype !== b.datatype
							False,
							// return a.language === b.language && a.datatype === b.datatype
							And<
								AsBool<b_terms_and_values_match>,
								And<
									StringsMatch<
										Descriptor.Access<a_descriptor_a, 'language'>,
										Descriptor.Access<a_descriptor_b, 'language'>
									>,
									StringsMatch<
										Descriptor.Access<a_descriptor_a, 'datatype'>,
										Descriptor.Access<a_descriptor_b, 'datatype'>
									>
								>
							>
						>
						: AsBool<b_terms_and_values_match>
					)
				)
				: never
		>
	>;

export type TermsEqual<
	a_descriptor_a extends Descriptor=Descriptor,
	a_descriptor_b extends Descriptor=Descriptor,
> = ToPrimitiveBoolean<
	RawTermsEqual<a_descriptor_a, a_descriptor_b>
>;



{
	/* eslint-disable @typescript-eslint/no-unused-vars */

	type B = FromQualifier<[BlankNodeTypeKey]>;
	type N = FromQualifier<[NamedNodeTypeKey]>;
	type L = FromQualifier<[LiteralTypeKey]>;
	type NL = FromQualifier<[NamedNodeTypeKey | LiteralTypeKey]>;
	type D = FromQualifier<[DefaultGraphTypeKey]>;

	// basic fully compatible quad
	type d_BNLD = FromQualifier<[
		'Quad', '', void, void,
		B,
		N,
		NL,
		D,
	]>;
	type BNLD = QuadData<d_BNLD>;

	type BNLD_s = BNLD['subject'];
	const BNLD_st: ASSERT_EQUAL<BNLD_s['termType'], 'BlankNode'> = 1;
	const BNLD_sv: ASSERT_STRING<BNLD_s['value']> = 1;

	type BNLD_p = BNLD['predicate'];
	const BNLD_pt: ASSERT_EQUAL<BNLD_p['termType'], 'NamedNode'> = 1;
	const BNLD_pv: ASSERT_STRING<BNLD_p['value']> = 1;

	type BNLD_o = BNLD['object'];
	const BNLD_ot: ASSERT_SAME<BNLD_o['termType'], 'NamedNode' | 'Literal'> = 1;
	const BNLD_ov: ASSERT_STRING<BNLD_o['value']> = 1;

	type BNLD_g = BNLD['graph'];
	const BNLD_gt: ASSERT_EQUAL<BNLD_g['termType'], 'DefaultGraph'> = 1;
	const BNLD_gv: ASSERT_EQUAL<BNLD_g['value'], ''> = 1;

	type ODATA = ObjectData<['NamedNode' | 'Literal', 'hey']>;

	// rdf-star
	type QQQQs = QuadData<['Quad', '', void, void, d_BNLD, ['NamedNode'], d_BNLD, ['NamedNode'], RdfMode_star]>;

	type QQQQs_s = QQQQs['subject'];
	const QQQQs_st: ASSERT_EQUAL<QQQQs_s['termType'], 'Quad'> = 1;
	const QQQQs_sv: ASSERT_EQUAL<QQQQs_s['value'], ''> = 1;


	// easier-rdf
	type QQQQe = QuadData<['Quad', '', void, void, d_BNLD, d_BNLD, d_BNLD, d_BNLD, RdfMode_easier]>;

	type QQQQe_s = QQQQe['subject'];
	const QQQQe_st: ASSERT_EQUAL<QQQQe_s['termType'], 'Quad'> = 1;
	const QQQQe_sv: ASSERT_EQUAL<QQQQe_s['value'], ''> = 1;

	// type BNLD_p = BNLD['predicate'];
	// const BNLD_pt: ASSERT_EQUAL<BNLD_p['termType'], 'NamedNode'> = 1;
	// const BNLD_pv: ASSERT_STRING<BNLD_p['value']> = 1;

	// type BNLD_o = BNLD['object'];
	// const BNLD_ot: ASSERT_EQUAL<BNLD_o['termType'], 'Literal'> = 1;
	// const BNLD_ov: ASSERT_STRING<BNLD_o['value']> = 1;

	// type BNLD_g = BNLD['graph'];
	// const BNLD_gt: ASSERT_EQUAL<BNLD_g['termType'], 'DefaultGraph'> = 1;
	// const BNLD_gv: ASSERT_STRING<BNLD_g['value']> = 1;


	type LBDV = QuadData<['Quad', '', void, void, ['Literal'], ['BlankNode'], ['DefaultGraph'], ['Variable']]>;

	type GenericCoreTerm = CoreData<Descriptor, string>;

	type ValidGenericQuad = QuadData<['Quad', '', void, void, [SubjectTypeKey], [PredicateTypeKey], [ObjectTypeKey], [GraphTypeKey]]>;

	type AnyGenericQuad = QuadData<[
		'Quad', '', void, void,
		[SubjectTypeKey<RdfMode_easier>],
		[PredicateTypeKey<RdfMode_easier>],
		[ObjectTypeKey<RdfMode_easier>],
		[GraphTypeKey<RdfMode_easier>],
		RdfMode_easier
	]>;


	type AssertIncompatible<
		Test extends AnyGenericQuad,
		Position extends 'subject' | 'predicate' | 'object' | 'graph',
	> = ASSERT_TRUE<
		Extends<
			Test[Position],
			IncompatibleTermTypeError<Test[Position]['termType'], `the ${Position} position`, GenericCoreTerm>
		>
	>;

	const LBDV_s: AssertIncompatible<LBDV, 'subject'> = 1;
	const LBDV_p: AssertIncompatible<LBDV, 'predicate'> = 1;
	const LBDV_o: AssertIncompatible<LBDV, 'object'> = 1;
	const LBDV_g: AssertIncompatible<LBDV, 'graph'> = 1;

	type INS = LBDV['object']
	type INS2 = LBDV['graph']


	TESTQUAD.predicate.termType;
	TESTQUAD.object.termType;
	TESTQUAD.object.language;
	const g_subject = TESTQUAD.graph.subject;
	if('Literal' === g_subject.termType) {

	}

	/* eslint-enable @typescript-eslint/no-unused-vars */
}
// TESTQUAD.graph.graph.



type AllowedTermType<
	a_descriptor extends Descriptor,
	s_term_restrict extends TermTypeKey,
	s_category extends string=Join<Union.ListOf<s_term_restrict>, ', '>,
	s_term extends string=Descriptor.Access<a_descriptor, 'termType'>,
> = s_term extends s_term_restrict
	? AsTypedTermData<a_descriptor>
	: InvalidTermTypeError<s_term, CoreData>;



{
	// function tquad<
	// 	a_descriptor extends Descriptor,
	// >(): Quad {

	// }

	/* eslint-disable @typescript-eslint/no-unused-vars, no-multi-spaces */

	const Invalid_RHS: ASSERT_TRUE<
		Extends<
			TermsEqual<['NamedNode'], ['Typo']>,
			InvalidTermTypeError<'Typo', boolean>
		>
	> = 1;

	const Invalid_LHS: ASSERT_TRUE<
		Extends<
			TermsEqual<['Typo'], ['NamedNode']>,
			InvalidTermTypeError<'Typo', boolean>
		>
	> = 1;

	type DN    = ['NamedNode'];
	type DNs   = ['NamedNode', string];
	type DNso  = ['NamedNode', string, void];
	type DNsoo = ['NamedNode', string, void, void];
	type DNv   = ['NamedNode', 'z://'];
	type DNvo  = ['NamedNode', 'z://', void];
	type DNvoo = ['NamedNode', 'z://', void, void];
	type DNx   = ['NamedNode', 'y://'];
	type DNxo  = ['NamedNode', 'y://', void];
	type DNxoo = ['NamedNode', 'y://', void, void];

	type DL    = ['Literal'];
	type DLv   = ['Literal', 'z://'];
	type DLvo  = ['Literal', 'z://', void];
	type DLvs  = ['Literal', 'z://', string];
	type DLvso = ['Literal', 'z://', string, void];
	type DLvoo = ['Literal', 'z://', void, void];
	type DLv_k = ['Literal', 'z://', '', P_XSD_STRING];
	type DLv_v = ['Literal', 'z://', '', 'x://'];
	type DLvvr = ['Literal', 'z://', 'en', P_RDFS_LANGSTRING];
	type DLx   = ['Literal', 'y://'];
	type DLxo  = ['Literal', 'y://', void];
	type DLxoo = ['Literal', 'y://', void, void];
	type DLvv  = ['Literal', 'z://', 'en'];
	type DLvx  = ['Literal', 'z://', 'fr'];
	type DLvsv = ['Literal', 'z://', string, 'x://'];
	type DLvov = ['Literal', 'z://', void, 'x://'];
	type DLvox = ['Literal', 'z://', void, 'w://'];

	const DLvoomDLvoo: ASSERT_TRUE<TermsEqual<
		['Literal', 'z://', void, void],
		['Literal', 'z://', void, void]
	>> = 1;


	type DB = ['BlankNode'];
	type DBv = ['BlankNode', 'z://'];

	type DD = ['DefaultGraph'];
	type DI = ['Invalid'];

	const DN_DN: ASSERT_BOOLEAN<TermsEqual<DN, DN>> = 1;
	const DN_DNs: ASSERT_BOOLEAN<TermsEqual<DN, DNs>> = 1;
	const DNs_DN: ASSERT_BOOLEAN<TermsEqual<DNs, DN>> = 1;
	const DNs_DNs: ASSERT_BOOLEAN<TermsEqual<DNs, DNs>> = 1;
	const DNso_DNso: ASSERT_BOOLEAN<TermsEqual<DNso, DNso>> = 1;
	const DNsoo_DNsoo: ASSERT_BOOLEAN<TermsEqual<DNsoo, DNsoo>> = 1;

	const DNv_DNv: ASSERT_TRUE<TermsEqual<DNv, DNv>> = 1;
	const DNvo_DNvo: ASSERT_TRUE<TermsEqual<DNvo, DNvo>> = 1;
	const DNvoo_DNvoo: ASSERT_TRUE<TermsEqual<DNvoo, DNvoo>> = 1;

	const DL_DL: ASSERT_BOOLEAN<TermsEqual<DL, DL>> = 1;
	const DL_DLv: ASSERT_BOOLEAN<TermsEqual<DL, DLv>> = 1;
	const DLv_DLv: ASSERT_BOOLEAN<TermsEqual<DLv, DLv>> = 1;
	const DLvo_DLvo: ASSERT_BOOLEAN<TermsEqual<DLvo, DLvo>> = 1;
	const DLvoo_DLvoo: ASSERT_TRUE<TermsEqual<DLvoo, DLvoo>> = 1;
	const DLvoo_DLvs: ASSERT_BOOLEAN<TermsEqual<DLvoo, DLvs>> = 1;
	const DLvoo_DLvv: ASSERT_FALSE<TermsEqual<DLvoo, DLvv>> = 1;
	const DLvoo_DLvso: ASSERT_BOOLEAN<TermsEqual<DLvoo, DLvso>> = 1;

	const DLvv_DLvvv: ASSERT_TRUE<TermsEqual<DLvv, DLvvr>> = 1;
	const DLvoo_DLv_v: ASSERT_TRUE<TermsEqual<DLvoo, DLv_k>> = 1;

	const DLvsv_DLvov: ASSERT_TRUE<TermsEqual<DLvsv, DLvov>> = 1;
	const DLvsv_DLv_v: ASSERT_TRUE<TermsEqual<DLvsv, DLv_v>> = 1;


	const DN_DB: ASSERT_FALSE<TermsEqual<DN, DB>> = 1;
	const DN_DD: ASSERT_FALSE<TermsEqual<DN, DD>> = 1;
	const DN_DI: ASSERT_BOOLEAN<TermsEqual<DN, DI>> = 1;

	const DN_DBv: ASSERT_FALSE<TermsEqual<DN, DBv>> = 1;
	const DNv_DBv: ASSERT_FALSE<TermsEqual<DNv, DBv>> = 1;
	const DNvo_DBv: ASSERT_FALSE<TermsEqual<DNvo, DBv>> = 1;
	const DNvoo_DBv: ASSERT_FALSE<TermsEqual<DNvoo, DBv>> = 1;



	// Comparing against non-object-types
	const NaDa: ASSERT_FALSE<TermsEqual<['NamedNode',    'A', void, void], ['DefaultGraph', '',  void, void]>> = 1;
	const DaNa: ASSERT_FALSE<TermsEqual<['DefaultGraph', '',  void, void], ['NamedNode',    'A', void, void]>> = 1;
	const DaDa: ASSERT_TRUE<TermsEqual<['DefaultGraph', '',  void, void], ['DefaultGraph', '',  void, void]>> = 1;

	// Comparing against invalid types
	const NaIa: ASSERT_BOOLEAN<TermsEqual<['NamedNode', 'A', void, void], ['Invalid',   'A', void, void]>> = 1;
	const IaNa: ASSERT_BOOLEAN<TermsEqual<['Invalid',   'A', void, void], ['NamedNode', 'A', void, void]>> = 1;
	const IaIa: ASSERT_BOOLEAN<TermsEqual<['Invalid',   'A', void, void], ['Invalid',   'A', void, void]>> = 1;

	// NamedNodes and BlankNodes
	const NaNs: ASSERT_BOOLEAN<TermsEqual<['NamedNode', 'A', void, void], ['NamedNode', string, void, void]>> = 1;
	const NaNa: ASSERT_TRUE   <TermsEqual<['NamedNode', 'A', void, void], ['NamedNode', 'A',    void, void]>> = 1;
	const BaBa: ASSERT_TRUE   <TermsEqual<['BlankNode', 'A', void, void], ['BlankNode', 'A',    void, void]>> = 1;

	// Unions
	const NBvNv: ASSERT_BOOLEAN<TermsEqual<['NamedNode' | 'BlankNode', 'A', void, void], ['NamedNode', 'A', void, void]>> = 1;

	// Literal  [s=string; v='val'; x=other]
	const LsssLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', string, string, string]>> = 1;

	// Literal with only value
	const LsssLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', 'A',    string, string]>> = 1;
	const LvssLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    string, string], ['Literal', string, string, string]>> = 1;
	const LvssLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    string, string], ['Literal', 'A',    string, string]>> = 1;
	const LvssLxss: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    string, string], ['Literal', 'B',    string, string]>> = 1;

	// Simple Literals
	const LsooLvoo: ASSERT_BOOLEAN<TermsEqual<['Literal', string, '',   void], ['Literal', 'A',      '',   void]>> = 1;
	const LvooLsoo: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    '',   void], ['Literal', string,   '',   void]>> = 1;
	const LvooLvoo: ASSERT_TRUE   <TermsEqual<['Literal', 'A',    '',   void], ['Literal', 'A',      '',   void]>> = 1;
	const LvooLxoo: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    '',   void], ['Literal', 'B',      '',   void]>> = 1;

	// Literal with only language
	const LsssLsvs: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', string, 'en',   string]>> = 1;
	const LsvsLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, 'en',   string], ['Literal', string, string, string]>> = 1;
	const LsvsLsvs: ASSERT_BOOLEAN<TermsEqual<['Literal', string, 'en',   string], ['Literal', string, 'en',   string]>> = 1;
	const LsvsLsxs: ASSERT_FALSE  <TermsEqual<['Literal', string, 'en',   string], ['Literal', string, 'fr',   string]>> = 1;

	// Literal with only datatype
	const LsssLssv: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', string, string, 'z://']>> = 1;
	const LssvLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, 'z://'], ['Literal', string, string, string]>> = 1;
	const LssvLssv: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, 'z://'], ['Literal', string, string, 'z://']>> = 1;
	const LssvLssx: ASSERT_FALSE  <TermsEqual<['Literal', string, string, 'z://'], ['Literal', string, string, 'y://']>> = 1;

	// Literal with value and language
	const LsssLvvs: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', 'A',    'en',   string]>> = 1;
	const LvssLsvs: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    string, string], ['Literal', string, 'en',   string]>> = 1;
	const LsvsLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, 'en',   string], ['Literal', 'A',    string, string]>> = 1;
	const LvvsLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    'en',   string], ['Literal', string, string, string]>> = 1;
	const LvvsLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    'en',   string], ['Literal', 'A',    string, string]>> = 1;
	const LvvsLxss: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    'en',   string], ['Literal', 'B',    string, string]>> = 1;
	const LvvsLsvs: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    'en',   string], ['Literal', string, 'en',   string]>> = 1;
	const LvvsLsxs: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    'en',   string], ['Literal', string, 'fr',   string]>> = 1;
	const LvssLvvs: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    string, string], ['Literal', 'A',    'en',   string]>> = 1;
	const LvssLxvs: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    string, string], ['Literal', 'B',    'en',   string]>> = 1;
	const LsvsLvvs: ASSERT_BOOLEAN<TermsEqual<['Literal', string, 'en',   string], ['Literal', 'A',    'en',   string]>> = 1;
	const LsvsLvxs: ASSERT_FALSE  <TermsEqual<['Literal', string, 'en',   string], ['Literal', 'A',    'fr',   string]>> = 1;
	const LvvsLvvs: ASSERT_TRUE   <TermsEqual<['Literal', 'A',    'en',   string], ['Literal', 'A',    'en',   string]>> = 1;
	const LvvsLvxs: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    'en',   string], ['Literal', 'A',    'fr',   string]>> = 1;
	const LvvsLxvs: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    'en',   string], ['Literal', 'B',    'en',   string]>> = 1;

	// Literal with value and datatype
	const LsssLvsv: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', 'A',    'z://', string]>> = 1;
	const LvssLssv: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    string, string], ['Literal', string, 'z://', string]>> = 1;
	const LssvLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, 'z://'], ['Literal', 'A',    string, string]>> = 1;
	const LvsvLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    string, 'z://'], ['Literal', string, string, string]>> = 1;
	const LvsvLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    string, 'z://'], ['Literal', 'A',    string, string]>> = 1;
	const LvsvLxss: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    string, 'z://'], ['Literal', 'B',    string, string]>> = 1;
	const LvsvLssv: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    string, 'z://'], ['Literal', string, string, 'z://']>> = 1;
	const LvsvLssx: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    string, 'z://'], ['Literal', string, string, 'y://']>> = 1;
	const LvssLvsv: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A',    string, string], ['Literal', 'A',    string, 'z://']>> = 1;
	const LvssLxsv: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    string, string], ['Literal', 'B',    string, 'z://']>> = 1;
	const LssvLvsv: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, 'z://'], ['Literal', 'A',    string, 'z://']>> = 1;
	const LssvLvsx: ASSERT_FALSE  <TermsEqual<['Literal', string, string, 'z://'], ['Literal', 'A',    string, 'y://']>> = 1;
	const LvsvLvsv: ASSERT_TRUE   <TermsEqual<['Literal', 'A',    string, 'z://'], ['Literal', 'A',    string, 'z://']>> = 1;
	const LvsvLvsx: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    string, 'z://'], ['Literal', 'A',    string, 'y://']>> = 1;
	const LvsvLxsv: ASSERT_FALSE  <TermsEqual<['Literal', 'A',    string, 'z://'], ['Literal', 'B',    string, 'z://']>> = 1;



	const PNv: TermData = {
		termType: 'NamedNode',
		value: 'z://',
	};

	const RNv: Term = {
		termType: 'NamedNode',
		value: 'z://',
		equals(y_other: TermData): boolean {
			return false;
		},
	};

	const MNv: Term<DNv> = {
		termType: 'NamedNode',
		value: 'z://',
		equals<
			a_descriptor_b extends Descriptor,
			ReturnType extends TermsEqual,
		>(y_other: TermData<a_descriptor_b>): ReturnType {
			return (this.termType === y_other.termType && this.value === y_other.value) as ReturnType;
		},
	};

	const MLv: Term<DNv> = {
		termType: 'NamedNode',
		value: 'z://',
		equals<
			a_descriptor_b extends Descriptor,
			ReturnType extends TermsEqual,
		>(y_other: TermData<a_descriptor_b>): ReturnType {
			return (this.termType === y_other.termType && this.value === y_other.value) as ReturnType;
		},
	};


	const MNvC: Term = {
		termType: 'NamedNode',
		value: 'z://',
		equals(y_other: TermData): boolean {
			return (this.termType === y_other.termType && this.value === y_other.value);
		},
	};

	const F = MNvC.equals({termType: 'Literal', value:'orange', language:'en'});


	const CNv2: TermData = {
		termType: 'NamedNode',
		value: 'z://',
		equals(y_other: TermData): boolean {
			return (this.termType === y_other.termType && this.value === y_other.value);
		},
	};

	const Css: TermData = {
		termType: 'NamedNode',
		value: 'z://',
	};

	const CNs: TermData<['NamedNode']> = {
		termType: 'NamedNode',
		value: 'z://',
	};

	const CNv: TermData<['NamedNode', 'z://']> = {
		termType: 'NamedNode',
		value: 'z://',
	};

	const MNv_Mnv: true = MNv.equals(MNv);
	const MNv_Css_T: TermsEqual<DNv, ['NamedNode']> = true;
	const MNv_Css_F: TermsEqual<DNv, ['NamedNode']> = false;
	const MNv_CNs = MNv.equals(CNs);
	const MNv_CNv: true = MNv.equals(CNv);

	const S!: Term;

	const SNv!: Term<['NamedNode', 'z://', void, void]>;
	const SBv!: Term<['BlankNode', 'z://', void, void]>;
	const SNx!: Term<['NamedNode', 'y://', void, void]>;
	const SBx!: Term<['BlankNode', 'y://', void, void]>;

	const S_SNv: boolean = SNv.equals(S);

	const SNv_SNv: true = SNv.equals(SNv);
	const SNv_SBv: false = SNv.equals(SBv);
	const SNv_SNx: false = SNv.equals(SNx);
	const SNv_SBx: false = SNv.equals(SBx);

	const SBv_SBv: true = SBv.equals(SBv);
	const SBv_SNv: false = SBv.equals(SNv);
	const SBv_SBx: false = SBv.equals(SBx);
	const SBv_SNx: false = SBv.equals(SNx);

	declare function namedNode<ValueString extends string>(value: ValueString): Term<['NamedNode', ValueString]>;

	const ANv = namedNode('z://');
	const test = ANv.value;

	/* eslint-enable @typescript-eslint/no-unused-vars */
}


export type NamedNode<
	s_value extends string=string,
> = Term<['NamedNode', s_value]>;

export type BlankNode<
	s_value extends string=string,
> = Term<['BlankNode', s_value]>;

export type Literal<
	s_value extends string=string,
	s_language extends string|void=string,
	s_datatype extends string|void=string,
> = Term<['Literal', s_value, s_language, s_datatype]>;

export type DefaultGraph = Term<['DefaultGraph', '']>;

export type Variable<
	s_value extends string=string,
> = Term<['Variable', s_value]>;

export type Datatype<
	s_datatype extends string=string,
> = NamedNode<s_datatype>;

export type Node<
	s_term extends string=TermTypeKey,
	s_value extends string=string,
> = FavorTermType<s_term> extends infer s_favored
	? (s_favored extends NodeTypeKey
		? {
			[K in NodeTypeKey]: Term<[s_favored, s_value]>
		}[s_favored]
		: never
	)
	: never;

export type Subject<
	s_term extends string=string,
	s_value extends string=string,
> = Node<s_term, s_value>;

export type Predicate<
	s_term extends string=string,
	s_value extends string=string,
> = s_term extends `${infer ActualTermTypeString}`
	? (ActualTermTypeString extends NamedNodeTypeKey
		? NamedNode<s_value>
		: never
	)
	: NamedNode<s_value>;

export type Object<
	s_term extends string=string,
	s_value extends string=string,
	s_language extends string=string,
	s_datatype extends string=string,
> = s_term extends `${infer ActualTermTypeString}`
	? (ActualTermTypeString extends NodeTypeKey
		? Node<ActualTermTypeString, s_value>
		: (ActualTermTypeString extends LiteralTypeKey
			? Literal<ActualTermTypeString, s_language, s_datatype>
			: never)
	)
	: Node<s_term, s_value> | Literal<s_value, s_language, s_datatype>;

export type Graph<
	s_term extends string=string,
	s_value extends string=string,
> = s_term extends `${infer ActualTermTypeString}`
	? Node<ActualTermTypeString, s_value> | DefaultGraph<ActualTermTypeString>
	: Node<s_term, s_value> | DefaultGraph;




// // TermTypesAnd

// // SrcTermTypeString extends `${infer ActualSrcTermTypeString}`
// // 	? (ArgTermTypeString extends `${infer ActualArgTermTypeString}`
// // 		? (ActualArgTermTypeString extends ActualSrcTermTypeString

// // 		)
// // 		: boolean
// // 	)
// // 	: boolean;


// type QuadsMatch<
// 	TermTypeStringA extends string,
// 	ValueStringA extends string,
// 	s_languageA extends string,
// 	s_datatypeA extends string,

// 	SubjectTermTypeStringA extends string,
// 	SubjectValueStringA extends string,
// 	PredicateTermTypeStringA extends string,
// 	PredicateValueStringA extends string,
// 	ObjectTermTypeStringA extends string,
// 	ObjectValueStringA extends string,
// 	Objects_languageA extends string,
// 	Objects_datatypeA extends string,
// 	GraphTermTypeStringA extends string,
// 	GraphValueStringA extends string,

// 	TermTypeStringB extends string,
// 	ValueStringB extends string,
// 	s_languageB extends string,
// 	s_datatypeB extends string,

// 	SubjectTermTypeStringB extends string,
// 	SubjectValueStringB extends string,
// 	PredicateTermTypeStringB extends string,
// 	PredicateValueStringB extends string,
// 	ObjectTermTypeStringB extends string,
// 	ObjectValueStringB extends string,
// 	Objects_languageB extends string,
// 	Objects_datatypeB extends string,
// 	GraphTermTypeStringB extends string,
// 	GraphValueStringB extends string,
// > = And<
// 	And<
// 		And<
// 			StringPairsMatch<SubjectTermTypeStringA, SubjectTermTypeStringB, SubjectValueStringA, SubjectValueStringB>,
// 			StringPairsMatch<PredicateTermTypeStringA, PredicateTermTypeStringB, PredicateValueStringA, PredicateValueStringB>,
// 		>,
// 		ObjectsEqual<
// 			ObjectTermTypeStringA,
// 			ObjectValueStringA,
// 			Objects_languageA,
// 			Objects_datatypeA,
// 			ObjectTermTypeStringB,
// 			ObjectValueStringB,
// 			Objects_languageB,
// 			Objects_datatypeB,
// 		>,
// 	>,
// 	StringPairsMatch<GraphTermTypeStringA, GraphTermTypeStringB, GraphValueStringA, GraphValueStringB>,
// >;

// // {
// //     const SsSs: StringPairsMatch<string,      string,      string, string> = EITHER;

// //     const SsSv: StringPairsMatch<string,      string,      string, 'z://'> = EITHER;
// //     const SvSs: StringPairsMatch<string,      string,      'z://', string> = EITHER;
// //     const SsNs: StringPairsMatch<string,      'NamedNode', string, string> = EITHER;
// //     const NsSs: StringPairsMatch<'NamedNode', string,      string, string> = EITHER;

// //     const SvSv: StringPairsMatch<string,      string,      'z://', 'z://'> = EITHER;
// //     const SvSx: StringPairsMatch<string,      string,      'z://', 'y://'> = FALSE;
// //     const SsNv: StringPairsMatch<string,      'NamedNode', string, 'z://'> = EITHER;
// //     const SvNs: StringPairsMatch<string,      'NamedNode', 'z://', string> = EITHER;
// //     const NsSv: StringPairsMatch<'NamedNode', string,      string, 'z://'> = EITHER;
// //     const NvSs: StringPairsMatch<'NamedNode', string,      'z://', string> = EITHER;
// //     const NsNs: StringPairsMatch<'NamedNode', 'NamedNode', string, string> = EITHER;
// //     const NsBs: StringPairsMatch<'NamedNode', 'BlankNode', string, string> = FALSE;

// //     const SvNv: StringPairsMatch<string,      'NamedNode', 'z://', 'z://'> = EITHER;
// //     const SvNx: StringPairsMatch<string,      'NamedNode', 'z://', 'y://'> = FALSE;
// //     const NvNs: StringPairsMatch<'NamedNode', 'NamedNode', 'z://', string> = EITHER;
// //     const NvBs: StringPairsMatch<'NamedNode', 'BlankNode', 'z://', string> = FALSE;
// //     const NsNv: StringPairsMatch<'NamedNode', 'NamedNode', string, 'z://'> = EITHER;
// //     const NsBv: StringPairsMatch<'NamedNode', 'BlankNode', string, 'z://'> = FALSE;
// //     const NvSv: StringPairsMatch<'NamedNode', string,      'z://', 'z://'> = EITHER;
// //     const NvSx: StringPairsMatch<'NamedNode', string,      'z://', 'y://'> = FALSE;
// //     const NvNv: StringPairsMatch<'NamedNode', 'NamedNode', 'z://', 'z://'> = TRUE;
// //     const NvNx: StringPairsMatch<'NamedNode', 'NamedNode', 'z://', 'y://'> = FALSE;
// //     const NvBv: StringPairsMatch<'NamedNode', 'BlankNode', 'z://', 'z://'> = FALSE;
// //     const NvBx: StringPairsMatch<'NamedNode', 'BlankNode', 'z://', 'x://'> = FALSE;
// // }


// export type Quad<
// 	SubjectTermTypeStringA extends string=string,
// 	SubjectValueStringA extends string=string,
// 	PredicateTermTypeStringA extends string=string,
// 	PredicateValueStringA extends string=string,
// 	ObjectTermTypeStringA extends string=string,
// 	ObjectValueStringA extends string=string,
// 	Objects_languageA extends string=string,
// 	Objects_datatypeA extends string=string,
// 	GraphTermTypeStringA extends string=string,
// 	GraphValueStringA extends string=string,
// > = {
// 	type: 'Quad';
// 	value: '';
// 	equals<
// 		TypeB extends BasicTerm=BasicTerm,
// 		// TermTypeStringB extends string=string,
// 		// ValueStringB extends string=string,
// 		// SubjectTermTypeStringB extends string=string,
// 		// SubjectValueStringB extends string=string,
// 		// PredicateTermTypeStringB extends string=string,
// 		// PredicateValueStringB extends string=string,
// 		// ObjectTermTypeStringB extends string=string,
// 		// ObjectValueStringB extends string=string,
// 		// Objects_languageB extends string=string,
// 		// Objects_datatypeB extends string=string,
// 		// GraphTermTypeStringB extends string=string,
// 		// GraphValueStringB extends string=string,
// 	>(y_other: TypeB):
// 		TypeB extends Quad<infer TermTypeStringB, ValueStringB, >l

// 		OtherType extends Term<OtherTermType, OtherValueString>
// 			? OtherTermTypeString extends `${infer ActualOtherTermTypeString}`
// 				? (ActualOtherTermTypeString extends 'Quad'
// 				? (And<StringsMatch<SubjectTermTypeString, OtherSubjectTermTypeString>, StringsMatch<SubjectValueString, OtherSubjectValueString>> extends infer SubjectsMatch
// 					? (StringsMatch<PredicateValueString, OtherPredicateValueString> extends infer PredicatesMatch
// 						? (And<
// 								And<
// 									And<
// 										StringsMatch<ObjectTermTypeString, OtherObjectTermTypeString>,
// 										StringsMatch<ObjectValueString, OtherObjectTermTypeString>
// 									>,
// 									StringsMatch<Objects_language, OtherObjects_language>
// 						>)
// 						? And<And<And<SubjectsMatch, PredicatesMatch>, ObjectsEqual>, GraphsMatch>


// 					? (OtherValueString extends `${infer ActualOtherValueString}`
// 						? (ActualOtherValueString extends ''
// 							? (OtherType extends Quad<
// 								OtherSubjectTermTypeString,
// 								OtherSubjectValueString,
// 								OtherPredicateTermTypeString,
// 								OtherPredicateValueString,
// 								OtherObjectTermTypeString,
// 								OtherObjectValueString,
// 								OtherObjects_language,
// 								OtherObjects_datatype,
// 								OtherGraphTermTypeString,
// 								OtherGraphValueString,
// 							>
// 								? (OtherSubjectTermTypeString extends `${infer ActualOtherSubjectTermTypeString}`
// 									? (ActualOtherSubjectTermTypeString extends SubjectTermTypeString
// 										? (

// 										)
// 										: false
// 									)
// 									: boolean
// 								)
// 								: booleann
// 							)
// 							: false
// 						)
// 						: false  // other.value
// 					)
// 					: never  // other.termType !== 'Quad'
// 				)
// 				: boolean
// 			: boolean;


// 			(TermTypeString extends `${infer ActualTermTypeString}`
// 				? TermTypeString extends TermTypeKey
// 					? OtherTermType extends `${infer ActualOtherTermTypeString}`
// 						? ActualOtherTermTypeString extends ActualTermTypeString
// 							// this.termType === other.termType
// 							? ValueString extends `${infer ActualValueString}`
// 								? OtherValueString extends `${infer ActualOtherValueString}`
// 									? ActualOtherValueString extends ActualValueString
// 										? true  // this.value === other.value
// 										: false  // this.value !== other.value
// 									: boolean
// 								: boolean
// 							// this.termType !== other.termType
// 							: false
// 						: boolean
// 					: boolean
// 				: never)  // !RDFJS.TermTypes.includes(this.termType)
// 			& (ValueString extends `${infer ActualValueString}`
// 				? OtherValueString extends `${infer ActualOtherValueString}`
// 					? ActualOtherValueString extends ActualValueString
// 						? boolean  // this.value === other.value
// 						: false  // this.value !== other.value
// 					: boolean
// 				: boolean);

// 	subject: Subject<SubjectTermTypeString, SubjectValueString>;
// 	predicate: Predicate<PredicateTermTypeString, PredicateValueString>;
// 	object: Object<ObjectTermTypeString, ObjectValueString, Objects_language, Objects_datatype>;
// 	graph: Graph<GraphTermTypeString, GraphValueString>;
// };

// let ggg!: Quad<'NamedNode', 'hi'>;
// let g2!: Quad<'NamedNode', 'hi'>;
// const fff = ggg.equals(g2);



{
type L = ['Literal'];
type Test = RDFJS.SubjectData<['Literal']>;
let LHS: RDFJS.SubjectData<['NamedNode']>;
let RHS!: RDFJS.TermData<['Literal']>;
LHS = RHS;
}
