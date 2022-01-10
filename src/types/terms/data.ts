import type {
	Union,
	List,
} from 'ts-toolbelt';

import type {
	Keys,
	Cast,
	Equals,
	Extends,
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
	MergeAll,
} from 'ts-toolbelt/out/Object/_api';

import type {
	Join,
	Split,
} from 'ts-toolbelt/out/String/_api';

import type {
	ASSERT_TRUE,
	ASSERT_FALSE,
	ASSERT_SAME,
	Debug,
	True,
	False,
	AsBool,
	Coerce,
	IsOnlyLiteralStrings,
	StringsMatch,
	ToPrimitiveBoolean,
	ActualStringsMatch,
	Replace,
} from '../utility';

import {
	RdfMode_11,
	RdfMode_star,
	RdfMode_easier,
	SupportedRdfMode,
	DescribeRdfMode,
	P_IRI_RDF,
	P_IRI_XSD_STRING,
	P_IRI_XSD,
	XsdDatatypes,
	NaN,
	P_IRI_RDF_TYPE,
} from '../const';

import {
	BypassDescriptor,
	Descriptor,
	FromQualifier,
	Qualifier,
} from '../descriptor';

import type {
	Iri,
	Prefix,
} from '../strings/common';

import type {
	PrefixMap,
} from '../structs';

import {
   TermTypeKey,
   NodeTypeKey,
   NamedNodeTypeKey,
   BlankNodeTypeKey,
   LiteralTypeKey,
   QuadTypeKey,
   SubjectTypeKey,
   PredicateTypeKey,
   ObjectTypeKey,
   GraphTypeKey,
   DatatypeTypeKey,
} from './key'




type InvalidTermTypeError<
	TermTypeString extends string,
	Disguise=unknown,
> = Debug<Disguise, `'${TermTypeString}' is an invalid value for the .termType property`>;

type IncompatibleTermTypeError<
	TermTypeString extends string,
	Category extends string,
	Disguise=unknown,
> = Debug<Disguise, `'${TermTypeString}' is an incompatible .termType value for ${Category}`>;



export type InputTermData<
	s_term extends string=TermTypeKey,
> = {
	termType: s_term;
	value: string;
	language?: string;
	datatype?: CoreData;
	subject?: InputTermData<SubjectTypeKey<SupportedRdfMode>>;
	predicate?: InputTermData<PredicateTypeKey<SupportedRdfMode>>;
	object?: InputTermData<ObjectTypeKey<SupportedRdfMode>>;
	graph?: InputTermData<GraphTypeKey<SupportedRdfMode>>;
}

export type FromTermData<
	g_data extends InputTermData,
> = FromQualifier<{
	termType: g_data['termType'];
	value: g_data['value'];
	language: g_data extends {language: string}? g_data['language']: void;
	datatype: g_data extends { datatype: TermDataArgument } ? g_data['datatype']['value'] : void;
	subject: g_data extends { subject: TermDataArgument } ? g_data['subject'] : void;
	predicate: g_data extends { predicate: TermDataArgument } ? g_data['predicate'] : void;
	object: g_data extends { object: TermDataArgument } ? g_data['object'] : void;
	graph: g_data extends { graph: TermDataArgument } ? g_data['graph'] : void;
	mode: g_data extends { mode: string } ? g_data['mode'] : void;
}>;


export type FavorTermType<
	TermTypeSring extends string,
	KeysSet extends TermTypeKey=TermTypeKey,
> = Coerce<TermTypeSring, string, KeysSet>;



type AllowedTermType<
	a_descriptor extends Descriptor,
	s_term_restrict extends TermTypeKey,
	s_category extends string=Join<Union.ListOf<s_term_restrict>, ', '>,
	s_term extends string=Descriptor.Access<a_descriptor, 'termType'>,
> = s_term extends s_term_restrict
	? AsTypedTermData<a_descriptor>
	: InvalidTermTypeError<s_term, CoreData>;





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
	const HD: ASSERT_FALSE<Extends<'DefaultGraph', ObjectTypeKey<RdfMode_11>>> = 1;
	const HI: ASSERT_FALSE<Extends<'Invalid', ObjectTypeKey<RdfMode_11>>> = 1;

	const OSS: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, string, string>> = 1;
	const OSD: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey<RdfMode_11>, string, 'DefaultGraph'>> = 1;
	const OSI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey<RdfMode_11>, string, 'Invalid'>> = 1;
	const ODS: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey<RdfMode_11>, 'DefaultGraph', string>> = 1;
	const OIS: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'Invalid', string>> = 1;
	const ODD: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey<RdfMode_11>, 'DefaultGraph', 'DefaultGraph'>> = 1;
	const ODI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'DefaultGraph', 'Invalid'>> = 1;
	const OID: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'Invalid', 'DefaultGraph'>> = 1;
	const OII: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'Invalid', 'Invalid'>> = 1;

	const OSN: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, string, 'NamedNode'>> = 1;
	const ONS: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'NamedNode', string>> = 1;
	const ONN: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'NamedNode', 'NamedNode'>> = 1;
	const OND: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey<RdfMode_11>, 'NamedNode', 'DefaultGraph'>> = 1;
	const ONI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'NamedNode', 'Invalid'>> = 1;

	const OSB: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, string, 'BlankNode'>> = 1;
	const OBS: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'BlankNode', string>> = 1;
	const OBB: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'BlankNode', 'BlankNode'>> = 1;
	const OBD: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey<RdfMode_11>, 'BlankNode', 'DefaultGraph'>> = 1;
	const OBI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'BlankNode', 'Invalid'>> = 1;

	const OSL: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, string, 'Literal'>> = 1;
	const OLS: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'Literal', string>> = 1;
	const OLL: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'Literal', 'Literal'>> = 1;
	const OLD: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey<RdfMode_11>, 'Literal', 'DefaultGraph'>> = 1;
	const OLI: ASSERT_FALSE<ValidTermTypes<ObjectTypeKey, 'Literal', 'Invalid'>> = 1;

	const ONB: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'NamedNode', 'BlankNode'>> = 1;
	const ONL: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'NamedNode', 'Literal'>> = 1;

	const OBN: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'BlankNode', 'NamedNode'>> = 1;
	const OBL: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'BlankNode', 'Literal'>> = 1;

	const OLN: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'Literal', 'NamedNode'>> = 1;
	const OLB: ASSERT_TRUE<ValidTermTypes<ObjectTypeKey, 'Literal', 'BlankNode'>> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


type CategorySubjectPosition = 'the subject position';
type CategoryPredicatePosition = 'the predicate position';
type CategoryObjectPosition = 'the object position';
type CategoryGraphPosition = 'the graph position';

type ExplainPosition<
	Category extends string,
	RdfMode extends SupportedRdfMode,
> = `${Category} in ${DescribeRdfMode<RdfMode>}`;



/**
 * Routes to a term data type based on descriptor
 */
export type AsTypedTermData<
	a_descriptor extends Descriptor,
> = MergeAll<{}, [
	{
		[K in QuadTypeKey]: a_descriptor extends Descriptor<QuadTypeKey>? D_Quad<a_descriptor>: never;
		// 	Descriptor.Filter<a_descriptor, Descriptor.Access<a_descriptor, 'termType'>>
	},
	{
		[K in LiteralTypeKey]: a_descriptor extends Descriptor<LiteralTypeKey>? D_Literal<a_descriptor>: never;
		// 	Descriptor.Filter<a_descriptor, Descriptor.Access<a_descriptor, 'termType'>>
	},
	{
		[K in TermTypeKey]: CoreData<
			Descriptor.Filter<a_descriptor, Descriptor.Access<a_descriptor, 'termType'>>
		>
	},
]>[Descriptor.Access<a_descriptor, 'termType'>];



/**
 * Type for Term data as an argument
 */
export type TermDataArgument<
	a_descriptor extends Descriptor | BypassDescriptor = BypassDescriptor,
	s_term extends string=string,
> = a_descriptor extends Descriptor
	? AsTypedTermData<a_descriptor>
	: {
		// core
		termType: s_term;
		value: string;

		// literal
		language?: string;
		datatype?: CoreData<FromQualifier<[NamedNodeTypeKey]>>;

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
export type D_Literal<
	a_descriptor extends Descriptor<LiteralTypeKey> = Descriptor<LiteralTypeKey>,
	> = Merge<CoreData<a_descriptor>, {
		language: Descriptor.Access<a_descriptor, 'language'>;
		datatype: D_Datatype<
			FromQualifier<[NamedNodeTypeKey, Descriptor.Access<a_descriptor, 'datatype'>]>
		>;
	}>;


/**
 * Type for quad term data (i.e., no methods, just data fields)
 */
export type D_Quad<
	a_descriptor extends Descriptor<QuadTypeKey> = Descriptor<QuadTypeKey>,
> = Merge<CoreData<a_descriptor>, {
	subject: D_Subject<Descriptor.Access<a_descriptor, 'subject'>>;
	predicate: D_Predicate<Descriptor.Access<a_descriptor, 'predicate'>>;
	object: D_Object<Descriptor.Access<a_descriptor, 'object'>>;
	graph: D_Graph<Descriptor.Access<a_descriptor, 'graph'>>;
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


export type D_BlankNode<
	a_descriptor extends Descriptor,
	s_category extends string = 'a blank node',
> = SafeTermType<a_descriptor, BlankNodeTypeKey, s_category>


export type D_NamedNode<
	a_descriptor extends Descriptor,
	s_category extends string = 'a named node',
> = SafeTermType<a_descriptor, NamedNodeTypeKey, s_category>


export type D_Node<
	a_descriptor extends Descriptor,
	s_category extends string = 'a node type',
> = SafeTermType<a_descriptor, NodeTypeKey, s_category>


export type D_Datatype<
	a_descriptor extends Descriptor,
   s_category extends string='a datatype',
> = SafeTermType<a_descriptor, NamedNodeTypeKey, s_category>;



/**
 * Type for subject position term data
 */
export type D_Subject<
	a_descriptor extends Descriptor<SubjectTypeKey> = Descriptor<SubjectTypeKey>,
	s_mode extends SupportedRdfMode=Descriptor.Access<a_descriptor, 'mode'>,
	s_category extends string = ExplainPosition<CategorySubjectPosition, s_mode>,
> = Merge<
	{
		[K in RdfMode_11]: D_Node<a_descriptor, s_category>;
	},
	Merge<
		{
			[K in RdfMode_star]: SafeTermType<a_descriptor, SubjectTypeKey<s_mode>, s_category>;
		},
		{
			[K in RdfMode_easier]: AllowedTermType<a_descriptor, TermTypeKey>;
		}
	>
>[s_mode];


/**
 * Type for predicatte position term data
 */
export type D_Predicate<
	a_descriptor extends Descriptor<PredicateTypeKey> = Descriptor<PredicateTypeKey>,
	s_mode extends SupportedRdfMode = Descriptor.Access<a_descriptor, 'mode'>,
	s_category extends string = ExplainPosition<CategoryPredicatePosition, s_mode>,
> = Merge<
	{
		[K in RdfMode_11 | RdfMode_star]: D_NamedNode<a_descriptor, s_category>;
	},
	{
		[K in RdfMode_easier]: AllowedTermType<a_descriptor, TermTypeKey>;
	}
>[s_mode];


/**
 * Type for object position term data
 */
export type D_Object<
	a_descriptor extends Descriptor<ObjectTypeKey> = Descriptor<ObjectTypeKey>,
	s_mode extends SupportedRdfMode = Descriptor.Access<a_descriptor, 'mode'>,
	s_category extends string = ExplainPosition<CategoryObjectPosition, s_mode>,
> = Merge<
	{
		[K in RdfMode_11]: SafeTermType<a_descriptor, ObjectTypeKey<s_mode>, s_category>;
	},
	Merge<
		{
			[K in RdfMode_star]: SafeTermType<a_descriptor, ObjectTypeKey<s_mode>, s_category>;
		},
		{
			[K in RdfMode_easier]: AllowedTermType<a_descriptor, TermTypeKey>;
		}
	>
>[s_mode];


/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type GraphData<
 *    descriptor: Descriptor,
 *    mode: SupportedRdfMode=descriptor['mode'],
 * > ==> TermData<{
 *    termType: GraphTypeKey<mode>,
 *    ...descriptor,
 * }>
 * ```
 *
 * Returns a union of Term types valid for the graph position, optionally in the given `mode`
 * 
 * --- **See Also:** ---
 *  - {@link FromQualifier} to create a Descriptor
 *  - {@link TermData to see the shape of possible return types
 */
export type D_Graph<
	a_descriptor extends Descriptor<GraphTypeKey> = Descriptor<GraphTypeKey>,
	s_mode extends SupportedRdfMode = Descriptor.Access<a_descriptor, 'mode'>,
	s_category extends string = ExplainPosition<CategoryGraphPosition, s_mode>,
> = Merge<
	{
		[K in RdfMode_11 | RdfMode_star]: SafeTermType<a_descriptor, GraphTypeKey<s_mode>, s_category>;
	},
	{
		[K in RdfMode_easier]: AllowedTermType<a_descriptor, TermTypeKey>;
	}
>[s_mode];

