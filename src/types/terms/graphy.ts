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

import type {
   ParseInteger,
} from '../integer';

import {
	RdfMode_11,
	RdfMode_star,
	RdfMode_easier,
	SupportedRdfMode,
	DescribeRdfMode,
	P_RDF,
	P_XSD_STRING,
	P_XSD,
	XsdDatatypes,
	NaN,
	P_RDF_TYPE,
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
	PrefixMap,
} from '../root';

import {
   A1_DefaultGraph,
   A1_NamedNode,
   A1_LabeledBlankNode,
   A1_AnonymousBlankNode,
   A1_SimpleLiteral,
   A1_LanguagedLiteral,
   A1_DatatypedLiteral,
   A1_Quad,
   A1_Variable,
} from '../strings/a1'

import {
   C1_DefaultGraph,
   C1_NamedNode,
   C1_LabeledBlankNode,
   C1_AnonymousBlankNode,
   C1_SimpleLiteral,
   C1_LanguagedLiteral,
   C1_DatatypedLiteral,
   C1_Quad,
   C1_Variable,
} from '../strings/c1'

import {
   V1_DefaultGraph,
   V1_NamedNode,
   V1_LabeledBlankNode,
   V1_AnonymousBlankNode,
   V1_SimpleLiteral,
   V1_LanguagedLiteral,
   V1_DatatypedLiteral,
   V1_Quad,
   V1_Variable,
} from '../strings/v1'

import {
   T1_DefaultGraph,
   T1_NamedNode,
   T1_LabeledBlankNode,
   T1_AnonymousBlankNode,
   T1_SimpleLiteral,
   T1_LanguagedLiteral,
   T1_DatatypedLiteral,
   T1_Quad,
   T1_Variable,
} from '../strings/t1'


import {
   TermTypeKey,
   NodeTypeKey,
   DataTypeKey,
   DefaultGraphTypeKey,
   NamedNodeTypeKey,
   BlankNodeTypeKey,
   LiteralTypeKey,
   VariableTypeKey,
   QuadTypeKey,
   SubjectTypeKey,
   PredicateTypeKey,
   ObjectTypeKey,
   GraphTypeKey,
} from './key';

import {
   CoreData,
   LiteralData,
   QuadData,
   InputTermData,
   FromTermData,
   TermDataArgument,
   FavorTermType,
   AsTypedTermData,
} from './data';


export type RegExpReplacer = ((s_sub: string, ...a_args: any[]) => string);


export type PrefixMapArg = PrefixMap | void;


type ReplacementFunction<
	a_descriptor extends Descriptor,
	si_key extends keyof Descriptor.KeyMap,
> = {
	<
		w_search extends string | RegExp,
		w_replace extends string | RegExpReplacer,
	>(w_search: w_search, w_replace: w_replace): GraphyTerm<Descriptor.Mutate<a_descriptor, {
		[K in si_key]: w_search extends `${infer s_search}`
			? (w_replace extends `${infer s_replace}`
				? Replace<Cast<Descriptor.Access<a_descriptor, si_key>, string>, s_search, s_replace>
				: string
			)
			: string;
	}>>
};


type ReplacementFunctionStatic<
	a_descriptor extends Descriptor,
	g_mutation extends Descriptor.Mutation,
> = {
	(w_search: string | RegExp, w_replace: string | RegExpReplacer): GraphyTerm<Descriptor.Mutate<a_descriptor, g_mutation>>;
}


type AsGraphyGenericTerm<
	a_descriptor extends Descriptor,
	g_custom extends {},
> = MergeAll<g_custom, [
	AsTypedTermData<a_descriptor>,
	Descriptor.Access<a_descriptor, 'value'> extends infer w_value? {
		hash(): string;
		clone(): GraphyTerm<a_descriptor>;
		isolate(): CoreData<a_descriptor>;

		equals<
			z_other extends InputTermData,
		>(y_other: z_other): TermsEqual<a_descriptor, FromTermData<z_other>>;

		replaceIri: ReplacementFunctionStatic<a_descriptor, {
			value: string;
			datatype: string;
		}>;

		replaceText: ReplacementFunctionStatic<a_descriptor, {
			value: string;
		}>;

		replaceValue: ReplacementFunction<a_descriptor, 'value'>;
		
		isGraphyTerm: true;
		isGraphyQuad: false;
		isDefaultGraph: false;
		isNode: false;
		isNamedNode: false;
		isAbsoluteIri: false;
		isRelativeIri: false;
		isRdfTypeAlias: false;
		isBlankNode: false;

		/**
		 * @deprecated Use `.wasAnonymousBlankNode` instead
		 */
		isAnonymousBlankNode: boolean;

		wasAnonymousBlankNode: false;
		isEphemeralBlankNode: false;
		isLiteral: false;
		isLanguagedLiteral: false;
		isDatatypedLiteral: false;
		isSimpleLiteral: false;
		isNumericLiteral: false;
		isIntegerLiteral: false;
		isDoubleLiteral: false;
		isDecimalLiteral: false;
		isBooleanLiteral: false;
		isInfiniteLiteral: false;
		isNaNLiteral: false;
	}: never,
	g_custom extends {flat:any}? {
		valueOf: g_custom['flat'];
		toString: g_custom['flat'];
	}: {},
	g_custom extends {terse:any}? {
		star: g_custom['terse'];
	}: {},
]>;


type TermIsAll<
	a_things extends string[],
	w_value extends boolean=true,
> = List.UnionOf<a_things> extends `${infer s_thing}`
	? {
		[K in s_thing as `is${K}`]: w_value;
	}
	: never;

export type AsGraphyDefaultGraph<
	a_descriptor extends Descriptor,
> = a_descriptor extends Descriptor<NamedNodeTypeKey>
	? AsGraphyGenericTerm<a_descriptor, {
		isDefaultGraph: true;
		flat(): A1_DefaultGraph;
		verbose(): V1_DefaultGraph;
		concise(h_prefixes?: PrefixMap): '*';
		terse(h_prefixes?: PrefixMap): '';
		star(h_prefixes?: PrefixMap): '';
		replaceIri: ReplacementFunctionStatic<a_descriptor, {value: ''}>;
		replaceValue: ReplacementFunctionStatic<a_descriptor, {value: ''}>;
		replaceText: ReplacementFunctionStatic<a_descriptor, {value: ''}>;
	}>
	: never;


export type AsGraphyNamedNode<
	a_descriptor extends Descriptor,
> = a_descriptor extends Descriptor<NamedNodeTypeKey>
	? Descriptor.Access<a_descriptor, 'value'> extends infer p_iri
		? p_iri extends string
			? AsGraphyGenericTerm<a_descriptor, Merge<
				{
					flat(): A1_NamedNode<p_iri>;

					verbose(): V1_NamedNode<p_iri>;

					concise<h_prefixes extends PrefixMapArg>(h_prefixes?: h_prefixes): C1_NamedNode<p_iri, h_prefixes>;

					terse<h_prefixes extends PrefixMapArg>(h_prefixes?: h_prefixes): T1_NamedNode<p_iri, h_prefixes>;

					replaceIri: ReplacementFunction<a_descriptor, 'value'>;
				}, TermIsAll<[
					'Node',
					'NamedNode',
					'AbsoluteIri',
				]>>
			>
			: never
		: never
	: never;


export type AsGraphyBlankNode<
	a_descriptor extends Descriptor,
> = a_descriptor extends Descriptor<BlankNodeTypeKey>
	? Descriptor.Access<a_descriptor, 'value'> extends infer s_label
		? s_label extends string
			? AsGraphyGenericTerm<a_descriptor, MergeAll<
				{
					/**
					 * @deprecated Use `.wasAnonymousBlankNode` instead
					 */
					isAnonymousBlankNode: boolean;
					wasAnonymousBlankNode: boolean;
					isEphemeralBlankNode: s_label extends `${string}`? (s_label extends ''? true: false): boolean;

					flat(): A1_LabeledBlankNode<s_label>;

					verbose(): V1_LabeledBlankNode<s_label>;

					concise(h_prefixes?: PrefixMap): C1_LabeledBlankNode<s_label>;

					terse(h_prefixes?: PrefixMap): T1_LabeledBlankNode<s_label>;
				}, [
					TermIsAll<[
						'Node',
						'BlankNode',
					]>,
				]>
			>
			: never
		: never
	: never;



type ReplacementFunctionForLiteralValue<
	a_descriptor extends Descriptor,
	s_content extends string,
	p_datatype extends string,
> = {
	<
		w_search extends string | RegExp,
		w_replace extends string | RegExpReplacer,
	>(w_search: w_search, w_replace: w_replace): GraphyTerm<Descriptor.Mutate<a_descriptor, w_search extends `${infer s_search}`
		? (w_replace extends `${infer s_replace}`
			? {
				value: Replace<s_content, s_search, s_replace>;
				dataype: Replace<p_datatype, s_search, s_replace>;
			}
			: {
				value: string;
				datatype: string;
			}
		)
		: {
			value: string;
			datatype: string;
		}
	>>;
}


type UncertainNumericLiteral = Merge<{
	[si_type in keyof XsdDatatypes as `is${XsdDatatypes[si_type]}Literal`]: boolean;
}, {
	isNumericLiteral: boolean;
	isInfiniteLiteral: boolean;
	isNaNLiteral: boolean;
}>;

export type AsGraphyLiteral<
	a_descriptor extends Descriptor,
> = a_descriptor extends Descriptor<LiteralTypeKey>
	? [
		Descriptor.Access<a_descriptor, 'value'>,
		Descriptor.Access<a_descriptor, 'language'>,
		Descriptor.Access<a_descriptor, 'datatype'>,
	 ] extends [infer s_content, infer s_language, infer p_datatype]
	 	? s_content extends string
	 		? s_language extends string
			 ? p_datatype extends string
				? AsGraphyGenericTerm<a_descriptor, MergeAll<
					{
						isLiteral: true;
						isolate(): LiteralData<a_descriptor>;
					}, [{
						simple: {
							isSimpleLiteral: true;

							flat(): A1_SimpleLiteral<s_content>;

							verbose(): V1_SimpleLiteral<s_content>;

							concise(h_prefixes?: PrefixMap): C1_SimpleLiteral<s_content>;

							terse(h_prefixes?: PrefixMap): T1_SimpleLiteral<s_content>;

							replaceIri: ReplacementFunction<a_descriptor, 'datatype'>;
							replaceText: ReplacementFunction<a_descriptor, 'value'>;
							replaceValue: ReplacementFunctionForLiteralValue<a_descriptor, s_content, p_datatype>;
						};
						languaged: {
							isLanguagedLiteral: true;

							flat(): A1_LanguagedLiteral<s_content, s_language>;

							verbose(): V1_LanguagedLiteral<s_content, s_language>;

							concise(h_prefixes?: PrefixMap): C1_LanguagedLiteral<s_content, s_language>;

							terse(h_prefixes?: PrefixMap): T1_LanguagedLiteral<s_content, s_language>;

							// datatype is not replaced for languaged literals
							replaceIri: ReplacementFunctionStatic<a_descriptor, {}>;
							replaceText: ReplacementFunction<a_descriptor, 'value'>;
							replaceValue: ReplacementFunction<a_descriptor, 'value'>;
						};
						datatyped: Merge<{
							isDatatypedLiteral: true;

							flat(): A1_DatatypedLiteral<s_content, p_datatype>;

							verbose(): V1_DatatypedLiteral<s_content, p_datatype>;

							concise<h_prefixes extends PrefixMapArg>(h_prefixes: h_prefixes): C1_DatatypedLiteral<s_content, p_datatype>;

							terse<h_prefixes extends PrefixMapArg>(h_prefixes: h_prefixes): T1_DatatypedLiteral<s_content, p_datatype>;

							// datatype is not replaced for languaged literals
							replaceIri: ReplacementFunction<a_descriptor, 'datatype'>;
							replaceText: ReplacementFunction<a_descriptor, 'value'>;
							replaceValue: ReplacementFunctionForLiteralValue<a_descriptor, s_content, p_datatype>;
						}, p_datatype extends `${P_XSD}${infer s_xsd_type}`
							? s_xsd_type extends keyof XsdDatatypes? Merge<
								{
									0: Merge<
										s_xsd_type extends 'double'? {
											isInfiniteLiteral: string extends s_content? boolean
												: s_content extends 'INF' | '-INF'? true: false;
											isNaNLiteral: string extends s_content? boolean
												: s_content extends 'NaN'? true: false;
											isNumberPrecise: s_content extends 'INF' | '-INF' | 'NaN'? false: boolean;
										}: {},
										{
											isNumericLiteral: true;
											isNumberPrecise: s_xsd_type extends 'date' | 'dateTime'? true: boolean;
											number: s_xsd_type extends 'integer'
												? ParseInteger<s_content>
												: number;
											bigint: bigint;
											date: s_xsd_type extends 'date' | 'dateTime'? Date: undefined;
										}
									>;
									1: Merge<
										{
											isNumericLiteral: false;
											isNumberPrecise: true;
										}, {
											false: {
												boolean: false;
												number: 0;
												bigint: 0n;
											};
											true: {
												boolean: true;
												number: 1;
												bigint: 1n;
											};
											none: {
												boolean: NaN;
												number: NaN;
												bigint: NaN;
											};
										}[
											string extends s_content? 'false' | 'true'
											: s_content extends '0' | 'false'? 'false'
											: s_content extends '1' | 'true'? 'true'
											: 'none'
										]
									>;
								}[Extends<'boolean', s_xsd_type>],
								{
									[K in `is${XsdDatatypes[s_xsd_type]}Literal`]: true;
								}
							>: {}
						: string extends p_datatype? UncertainNumericLiteral: {}>;
					}[
						p_datatype extends P_XSD_STRING? 'simple'
						: And<Extends<s_language, `${string}`>, Not<Extends<s_language, ''>>> extends True? 'languaged'
						: p_datatype extends `${string}`? 'datatyped'
						: 'simple' | 'languaged' | 'datatyped'
					], {
						boolean: Debug<typeof NaN, 'NaN'>;
						number: Debug<typeof NaN, 'NaN'>;
						bigint: Debug<typeof NaN, 'NaN'>;
						date: undefined;
					}]>>
					: never
				: never
			: never
		: never
	: never;


export type AsGraphyVariable<
	a_descriptor extends Descriptor,
> = a_descriptor extends Descriptor<VariableTypeKey>
	? Descriptor.Access<a_descriptor, 'value'> extends infer s_value
		? s_value extends string
			? AsGraphyGenericTerm<a_descriptor, {
				isVariable: true;
				flat: `?${s_value}`;
				concise(h_prefixes?: PrefixMap): `?${s_value}`;
				terse(h_prefixes?: PrefixMap): `?${s_value}`;
				verbose: never;
			}>
			: never
		: never
	: never;

// type gnode = AsGraphyNamedNode<FromQualifier<[NamedNodeTypeKey, 'https://demo/test']>>

// 	declare function concise<
// 		h_prefixes extends PrefixMap,
// 	>(h_prefixes?: h_prefixes): ConcisifyIri<'https://demo/test', h_prefixes>;

// 	const h_prefixes = {
// 		demo: 'https://demo/',
// 		test: 'https://howdy/',
// 	};

// 	const reveal = concise(h_prefixes);

type ReplacementFunctionForQuad<
	a_descriptor extends Descriptor<QuadTypeKey>,
	a_subject extends Descriptor<SubjectTypeKey>,
	a_predicate extends Descriptor<PredicateTypeKey>,
	a_object extends Descriptor<ObjectTypeKey>,
	a_graph extends Descriptor<GraphTypeKey>,
> = GraphyTerm<Descriptor.Mutate<a_descriptor, {
		subject: Descriptor.Mutate<a_subject, {
			value: string;
		}>;
		predicate: Descriptor.Mutate<a_predicate, {
			value: string;
		}>;
		object: Term;
		graph: Descriptor.Mutate<a_graph, {
			value: string;
		}>;
	}>>


export type AsGraphyQuad<
	a_descriptor extends Descriptor,
> = a_descriptor extends Descriptor<QuadTypeKey>
	? [
		Descriptor.Access<a_descriptor, 'subject'>,
		Descriptor.Access<a_descriptor, 'predicate'>,
		Descriptor.Access<a_descriptor, 'object'>,
		Descriptor.Access<a_descriptor, 'graph'>,
	] extends [
		infer a_subject,
		infer a_predicate,
		infer a_object,
		infer a_graph,
	]
		? a_subject extends Descriptor<SubjectTypeKey>
			? a_predicate extends Descriptor<PredicateTypeKey>
				? a_object extends Descriptor<ObjectTypeKey>
					? a_graph extends Descriptor<GraphTypeKey>
						? AsGraphyGenericTerm<a_descriptor, {
							isGraphyQuad: true;

							isolate(): QuadData<a_descriptor>;

							gspo(): [
								GraphyTerm<a_graph>,
								GraphyTerm<a_subject>,
								GraphyTerm<a_predicate>,
								GraphyTerm<a_object>,
							];

							spog(): [
								GraphyTerm<a_subject>,
								GraphyTerm<a_predicate>,
								GraphyTerm<a_object>,
								GraphyTerm<a_graph>,
							];

							flat<
								h_prefixes extends PrefixMapArg,
							>(h_prefixes: h_prefixes): `\f${string}\r${string}\n${string}\t${string}`;

							concise<
								h_prefixes extends PrefixMapArg,
							>(h_prefixes: h_prefixes): `\f${string}\r${string}\n${string}\t${string}`;

							terse<
								h_prefixes extends PrefixMapArg,
							>(h_prefixes: h_prefixes): string;

							verbose(): string;

							star<
								h_prefixes extends PrefixMapArg,
							>(h_prefixes: h_prefixes): `<< ${string} >>`;

							reify<
								s_label extends string | void,
							>(s_label: s_label): FromQualifier<{
								termType: BlankNodeTypeKey,
								value: s_label extends `${string}`? s_label extends ''? string: s_label: string;
								mode: Descriptor.Access<a_descriptor, 'mode'>;
							}> extends infer a_reify
								? a_reify extends Descriptor<DataTypeKey>? {
									node: GraphyTerm<a_reify>;
									quads: [
										AsGraphyQuad<Descriptor.Mutate<a_descriptor, {
											subject: a_reify;
											predicate: FromQualifier<[NamedNodeTypeKey, P_RDF_TYPE]>;
											object: FromQualifier<[NamedNodeTypeKey, `${P_RDF}statement`]>;
											graph: FromQualifier<[DefaultGraphTypeKey]>;
										}>>,
										AsGraphyQuad<Descriptor.Mutate<a_descriptor, {
											subject: a_reify;
											predicate: FromQualifier<[NamedNodeTypeKey, `${P_RDF}subject`]>;
											object: a_subject;
											graph: FromQualifier<[DefaultGraphTypeKey]>;
										}>>,
										AsGraphyQuad<Descriptor.Mutate<a_descriptor, {
											subject: a_reify;
											predicate: FromQualifier<[NamedNodeTypeKey, `${P_RDF}predicate`]>;
											object: a_predicate;
											graph: FromQualifier<[DefaultGraphTypeKey]>;
										}>>,
										AsGraphyQuad<Descriptor.Mutate<a_descriptor, {
											subject: a_reify;
											predicate: FromQualifier<[NamedNodeTypeKey, `${P_RDF}object`]>;
											object: a_object;
											graph: FromQualifier<[DefaultGraphTypeKey]>;
										}>>,
									];
								}: never: never;
														
							replaceIri(w_search: string | RegExp, w_replace: string | RegExpReplacer): ReplacementFunctionForQuad<a_descriptor, a_subject, a_predicate, a_object, a_graph>;
							replaceValue(w_search: string | RegExp, w_replace: string | RegExpReplacer): ReplacementFunctionForQuad<a_descriptor, a_subject, a_predicate, a_object, a_graph>;
							replaceText(w_search: string | RegExp, w_replace: string | RegExpReplacer): ReplacementFunctionForQuad<a_descriptor, a_subject, a_predicate, a_object, a_graph>;
						}>
						: never
					: never
				: never
			: never
		: never
	: never;
		

type BooleanTermGetters = {
	isDefaultGraph: false;
	isNode: false;
	isNamedNode: false;
	isAbsoluteIri: false;
	isRelativeIri: false;
	isRdfTypeAlias: false;
	isBlankNode: false;
	wasAnonymousBlankNode: false;
	isEphemeralBlankNode: false;
	isLiteral: false;
	isLanguagedLiteral: false;
	isDatatypedLiteral: false;
	isSimpleLiteral: false;
	isNumericLiteral: false;
	isIntegerLiteral: false;
	isDoubleLiteral: false;
	isDecimalLiteral: false;
	isBooleanLiteral: false;
	isInfiniteLiteral: false;
	isNaNLiteral: false;
};

/**
 * Complements term data type with RDFJS methods
 */
export type Term<
	z_qualifier_a extends Qualifier = BypassDescriptor,
> = FromQualifier<z_qualifier_a> extends infer a_descriptor_a
	? (a_descriptor_a extends Descriptor
		? GraphyTerm<a_descriptor_a>
		: never
	)
	: never;

export type GraphyTerm<
	a_descriptor extends Descriptor
> = a_descriptor extends BypassDescriptor
	? AsGraphyGenericTerm<a_descriptor, Merge<
		{
			equals<
				z_other extends TermDataArgument | null | undefined,
			>(y_other: z_other): z_other extends null | undefined? false: boolean;
		},
		TermIsAll<Union.ListOf<Exclude<keyof BooleanTermGetters, 'isGraphyTerm'>>, boolean>
	>>
	: {
		DefaultGraph: AsGraphyDefaultGraph<a_descriptor>;
		NamedNode: AsGraphyNamedNode<a_descriptor>;
		BlankNode: AsGraphyBlankNode<a_descriptor>;
		Literal: AsGraphyLiteral<a_descriptor>;
		Variable: AsGraphyVariable<a_descriptor>;
		Quad: AsGraphyQuad<a_descriptor>;
	}[Cast<Descriptor.Access<a_descriptor, 'termType'>, TermTypeKey>];



// {
// 	type TEST = FromQualifier<['Literal', string, void, void]>;
// 	type LitDesc = Descriptor<'Literal'>;
// 	type SHO = TEST extends LitDesc? 'Y': 'N';
// 	type TEST1 = Term<['Literal', string, void, void]>;

// 	type F = TermDataArgument<BypassDescriptor, TermTypeKey>;
// 	type DD = FromQualifier<{
// 		termType: F['termType'];
// 		value: F['value'];
// 		language: F['language'];
// 		datatype: F['datatype']['value'];
// 	}>;
// 	type TK = DD extends Descriptor? 'Y': 'N';

// 	type S = FromQualifier<['Literal', string, void, void]>;
// 	type L = FromQualifier<['Literal', string, 'en', void]>;
// 	type EQ = TermsEqual<S, L>;
// }

type RawTermsEqual<
	a_descriptor_a extends Descriptor,
	a_descriptor_b extends Descriptor,

	s_term_a extends string=Descriptor.Access<a_descriptor_a, 'termType'>,
	s_term_b extends string=Descriptor.Access<a_descriptor_b, 'termType'>,
> = And<
		StringsMatch<s_term_a, s_term_b>,
		ActualStringsMatch<
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
		: never;

export type TermsEqual<
	a_descriptor_a extends Descriptor=Descriptor,
	a_descriptor_b extends Descriptor=Descriptor,
> = ToPrimitiveBoolean<
	RawTermsEqual<a_descriptor_a, a_descriptor_b>
>;




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
	? Node<ActualTermTypeString, s_value> | DefaultGraph
	: Node<s_term, s_value> | DefaultGraph;



export type Quad<
   z_qualifier extends Qualifier<QuadTypeKey>=Qualifier<QuadTypeKey>,
> = Term<z_qualifier>;

// {
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
