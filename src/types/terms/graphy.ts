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

import type {
	RdfMode_11,
	RdfMode_star,
	RdfMode_easier,
	SupportedRdfMode,
	DescribeRdfMode,
	P_IRI_RDF,
	P_IRI_XSD,
	P_IRI_XSD_BOOLEAN,
	P_IRI_XSD_STRING,
	XsdDatatypes,
	NaN,
	P_IRI_RDF_TYPE,
	P_IRI_XSD_INTEGER,
	P_IRI_XSD_DOUBLE,
	P_IRI_XSD_DECIMAL,
	NodeType,
	P_IRI_XSD_DATETIME,
	P_IRI_XSD_DATE,
} from '../const';

import type {
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
	PrefixMapArg,
} from '../structs';


import type {
	A1_Term,
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

import type {
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

import type {
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

import type {
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

import type {
	Langtag,
	// @ts-ignore jmacs compilation
} from '../strings/bcp47';

import type {
	LiterallyDouble,
	LiterallyInteger,
} from '../strings/util';

import type {
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

import type {
	CoreData,
	D_Literal,
	D_Quad,
	InputTermData,
	FromTermData,
	TermDataArgument,
	FavorTermType,
	AsTypedTermData,
	D_Datatype,
} from './data';



export type RegExpReplacer = ((s_sub: string, ...a_args: any[]) => string);


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
		
		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isGraphyTerm = true
		 * ```
		 * 
		 * This narrowing property is `true` for all Term instances (including Quads) created by graphy
		 */
		readonly isGraphyTerm: true;

		readonly isGraphyQuad: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isDefaultGraph = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_DefaultGraph}.
		 */
		readonly isDefaultGraph: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isNode = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_NamedNode} or {@link G_BlankNode}.
		 */
		readonly isNode: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isNamedNode = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_NamedNode}.
		 */
		readonly isNamedNode: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isAbsoluteIri = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_NamedNode} with an absolute IRI.
		 */
		readonly isAbsoluteIri: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isRelativeIri = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_NamedNode} with a relative IRI.
		 */
		readonly isRelativeIri: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isRdfTypeAlias = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a special type of {@link G_NamedNode} representing the `rdf:type` alias `"a"`.
		 */
		readonly isRdfTypeAlias: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isBlankNode = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_BlankNode}.
		 */
		readonly isBlankNode: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isAnonymousBlankNode = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_BlankNode} that was created from a syntactic anonymous blank node.
		 * 
		 * @deprecated Use `.wasAnonymousBlankNode` instead
		 */
		readonly isAnonymousBlankNode: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type wasAnonymousBlankNode = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_BlankNode} that was created from a syntactic anonymous blank node.
		 */
		readonly wasAnonymousBlankNode: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isEphemeralBlankNode = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_BlankNode} that will serialize as a syntactic anonymous blank node.
		 */
		readonly isEphemeralBlankNode: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_Literal}.
		 */
		readonly isLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isLanguagedLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_Literal} with a non-empty language tag.
		 */
		readonly isLanguagedLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isDatatypedLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_Literal} with a {@link Term_datatype `.datatype`} value other than `xsd:string` or `rdfs:langString`.
		 */
		readonly isDatatypedLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isSimpleLteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a simple {@link G_Literal} (i.e., no language tag and a datatype of `xsd:string`).
		 */
		readonly isSimpleLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isNumericLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_Literal} with a datatype of `xsd:boolean`, making it a {@link G_BooleanLiteral}.
		 */
		readonly isBooleanLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isNumericLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_Literal} with any of the following datatypes:
		 *  - `xsd:integer`
		 *  - `xsd:double`
		 *  - `xsd:decimal`
		 */
		readonly isNumericLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isIntegerLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is an {@link G_Literal} with a datatype of `xsd:integer`, making it an {@link G_IntegerLiteral}.
		 */
		readonly isIntegerLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isDoubleLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_Literal} with a datatype of `xsd:double`, making it a {@link G_DoubleLiteral}.
		 */
		readonly isDoubleLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isDecimalLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_Literal} with a datatype of `xsd:decimal`, making it a {@link G_DecimalLiteral}.
		 */
		readonly isDecimalLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isInfiniteLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_Literal} with a datatype of `xsd:double` and a value of `"INF" | "-INF"`, making it an {@link G_InfiniteLiteral}.
		 */
		readonly isInfiniteLiteral: false;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * type isNaNLiteral = false | true
		 * ```
		 * 
		 * This narrowing property is `true` iff the Term is a {@link G_Literal} with a datatype of `xsd:double` and a value of `"NaN"`, making it a {@link G_NaNLiteral}.
		 */
		readonly isNaNLiteral: false;
	}: never,
	g_custom extends {flat:any}? {
		valueOf: g_custom['flat'];

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * function toString(): A1_Term
		 * ```
		 * 
		 * Returns the canonical {@link A1_Term} string
		 */
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
> = a_descriptor extends Descriptor<DefaultGraphTypeKey>
	? AsGraphyGenericTerm<a_descriptor, {
		readonly isDefaultGraph: true;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * function flat(): '*'
		 * ```
		 * 
		 * Returns the canonical {@link A1_DefaultGraph} string.
		 */
		flat(): A1_DefaultGraph;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * function verbose(): ''
		 * ```
		 * 
		 * Returns the canonical {@link V1_DefaultGraph} string.
		 */
		verbose(): V1_DefaultGraph;

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * function concise(): '*'
		 * ```
		 * 
		 * Returns the concise {@link C1_DefaultGraph} string.
		 */
		concise(h_prefixes?: PrefixMap): '*';

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * function terse(): ''
		 * ```
		 * 
		 * Returns the terse {@link T1_DefaultGraph} string.
		 */
		terse(h_prefixes?: PrefixMap): '';

		/**
		 * === _**@graphy/types**_ ===
		 * 
		 * ```ts
		 * function star(): ''
		 * ```
		 * 
		 * Returns the terse {@link T1_DefaultGraph} string.
		 */
		star(h_prefixes?: PrefixMap): '';
		

		replaceIri: ReplacementFunctionStatic<a_descriptor, {value: ''}>;
		replaceValue: ReplacementFunctionStatic<a_descriptor, {value: ''}>;
		replaceText: ReplacementFunctionStatic<a_descriptor, {value: ''}>;
	}>
	: never;

{
	const h_prefixes = {
		z: 'z://y/',
	} as const;

	let nn!: G_NamedNode;
	const show = nn.terse(h_prefixes);

	let dg!: G_DefaultGraph | G_NamedNode;
	const test = dg.terse()
}

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

					/**
					 * === _**@graphy/types**_ ===
					 * 
					 * @deprecated ## [ ! ] - Useless operation warning
					 * Using `.replaceText` on a NamedNode will have no effect.
					 */
					replaceText(): GraphyTerm<a_descriptor>;

					get url(): URL;
				}, TermIsAll<[
					'Node',
					'NamedNode',
					'AbsoluteIri',
				]>>
			>
			: never
		: never
	: never;

type BlankNodeTypeMap = {
	ephemeral: {
		value: string;
		readonly isEphemeralBlankNode: true;
	};
	anonymous: {
		value: `_g${number}`;
		/**
		 * @deprecated Use `.wasAnonymousBlankNode` instead
		 */
		readonly isAnonymousBlankNode: boolean;
		readonly wasAnonymousBlankNode: true;
	};
};

export type AsGraphyBlankNode<
	a_descriptor extends Descriptor,
> = a_descriptor extends Descriptor<BlankNodeTypeKey>
	? Descriptor.Access<a_descriptor, 'value'> extends infer s_label
		? s_label extends string
			? AsGraphyGenericTerm<a_descriptor, MergeAll<
				Descriptor.Access<a_descriptor, 'nodeType'> extends `${infer si_node_type}`
					? si_node_type extends keyof BlankNodeTypeMap
						? BlankNodeTypeMap[si_node_type]
						: BlankNodeTypeMap[keyof BlankNodeTypeMap]
					: BlankNodeTypeMap[keyof BlankNodeTypeMap],
				[
					{
						value: NodeType.Ephemeral extends Descriptor.Access<a_descriptor, 'nodeType'>? string: s_label;

						flat(): A1_LabeledBlankNode<s_label>;

						verbose(): V1_LabeledBlankNode<s_label>;

						concise(h_prefixes?: PrefixMap): C1_LabeledBlankNode<s_label>;

						terse(h_prefixes?: PrefixMap): T1_LabeledBlankNode<s_label>;
					},
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
	readonly isNumericLiteral: boolean;
	readonly isInfiniteLiteral: boolean;
	readonly isNaNLiteral: boolean;
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
						readonly isLiteral: true;

						readonly langtag: Langtag<s_language>;

						isolate(): D_Literal<a_descriptor>;
					}, [{
						simple: {
							readonly isSimpleLiteral: true;

							flat(): A1_SimpleLiteral<s_content>;

							verbose(): V1_SimpleLiteral<s_content>;

							concise(h_prefixes?: PrefixMap): C1_SimpleLiteral<s_content>;

							terse(h_prefixes?: PrefixMap): T1_SimpleLiteral<s_content>;

							replaceIri: ReplacementFunction<a_descriptor, 'datatype'>;
							replaceText: ReplacementFunction<a_descriptor, 'value'>;
							replaceValue: ReplacementFunctionForLiteralValue<a_descriptor, s_content, p_datatype>;
						};
						languaged: {
							readonly isLanguagedLiteral: true;

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
							readonly isDatatypedLiteral: true;

							flat(): A1_DatatypedLiteral<s_content, p_datatype>;

							verbose(): V1_DatatypedLiteral<s_content, p_datatype>;

							concise<h_prefixes extends PrefixMapArg>(h_prefixes: h_prefixes): C1_DatatypedLiteral<s_content, p_datatype>;

							terse<h_prefixes extends PrefixMapArg>(h_prefixes: h_prefixes): T1_DatatypedLiteral<s_content, p_datatype>;

							// datatype is not replaced for languaged literals
							replaceIri: ReplacementFunction<a_descriptor, 'datatype'>;
							replaceText: ReplacementFunction<a_descriptor, 'value'>;
							replaceValue: ReplacementFunctionForLiteralValue<a_descriptor, s_content, p_datatype>;
						}, p_datatype extends `${P_IRI_XSD}${infer s_xsd_type}`
							? s_xsd_type extends keyof XsdDatatypes? Merge<
								{
									0: Merge<
										s_xsd_type extends 'double'? {
											readonly isInfiniteLiteral: string extends s_content? boolean
												: s_content extends 'INF' | '-INF'? true: false;
											readonly isNaNLiteral: string extends s_content? boolean
												: s_content extends 'NaN'? true: false;
											readonly isNumberPrecise: s_content extends 'INF' | '-INF' | 'NaN'? false: boolean;
										}: {},
										{
											readonly isNumericLiteral: true;
											readonly isNumberPrecise: s_xsd_type extends 'date' | 'dateTime'? true: boolean;
											readonly number: s_xsd_type extends 'integer'
												? ParseInteger<s_content>
												: number;
											readonly bigint: bigint;
											readonly date: s_xsd_type extends 'date' | 'dateTime'? Date: undefined;
										}
									>;
									1: Merge<
										{
											readonly isNumericLiteral: false;
											readonly isNumberPrecise: true;
										}, {
											false: {
												readonly boolean: false;
												readonly number: 0;
												readonly bigint: 0n;
											};
											true: {
												readonly boolean: true;
												readonly number: 1;
												readonly bigint: 1n;
											};
											none: {
												readonly boolean: NaN;
												readonly number: NaN;
												readonly bigint: NaN;
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
									readonly [K in `is${XsdDatatypes[s_xsd_type]}Literal`]: true;
								}
							>: {}
						: string extends p_datatype? UncertainNumericLiteral: {}>;
					}[
						p_datatype extends P_IRI_XSD_STRING? 'simple'
						: And<Extends<s_language, `${string}`>, Not<Extends<s_language, ''>>> extends True? 'languaged'
						: p_datatype extends `${string}`? 'datatyped'
						: 'simple' | 'languaged' | 'datatyped'
					], {
						readonly boolean: Debug<typeof NaN, 'NaN'>;
						readonly number: Debug<typeof NaN, 'NaN'>;
						readonly bigint: Debug<typeof NaN, 'NaN'>;
						readonly date: undefined;
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
				readonly isVariable: true;
				flat(): `?${s_value}`;
				concise(h_prefixes?: PrefixMap): `?${s_value}`;
				terse(h_prefixes?: PrefixMap): `?${s_value}`;
				verbose(): never;
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
							subject: GraphyTerm<a_subject>;
							predicate: GraphyTerm<a_predicate>;
							object: GraphyTerm<a_object>;
							graph: GraphyTerm<a_graph>;

							readonly s: GraphyTerm<a_subject>;
							readonly p: GraphyTerm<a_predicate>;
							readonly o: GraphyTerm<a_object>;
							readonly g: GraphyTerm<a_graph>;

							readonly isGraphyQuad: true;

							isolate(): D_Quad<a_descriptor>;

							get gspo(): [
								GraphyTerm<a_graph>,
								GraphyTerm<a_subject>,
								GraphyTerm<a_predicate>,
								GraphyTerm<a_object>,
							];

							get spog(): [
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
											predicate: FromQualifier<[NamedNodeTypeKey, P_IRI_RDF_TYPE]>;
											object: FromQualifier<[NamedNodeTypeKey, `${P_IRI_RDF}statement`]>;
											graph: FromQualifier<[DefaultGraphTypeKey]>;
										}>>,
										AsGraphyQuad<Descriptor.Mutate<a_descriptor, {
											subject: a_reify;
											predicate: FromQualifier<[NamedNodeTypeKey, `${P_IRI_RDF}subject`]>;
											object: a_subject;
											graph: FromQualifier<[DefaultGraphTypeKey]>;
										}>>,
										AsGraphyQuad<Descriptor.Mutate<a_descriptor, {
											subject: a_reify;
											predicate: FromQualifier<[NamedNodeTypeKey, `${P_IRI_RDF}predicate`]>;
											object: a_predicate;
											graph: FromQualifier<[DefaultGraphTypeKey]>;
										}>>,
										AsGraphyQuad<Descriptor.Mutate<a_descriptor, {
											subject: a_reify;
											predicate: FromQualifier<[NamedNodeTypeKey, `${P_IRI_RDF}object`]>;
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
	readonly isDefaultGraph: false;
	readonly isNode: false;
	readonly isNamedNode: false;
	readonly isAbsoluteIri: false;
	readonly isRelativeIri: false;
	readonly isRdfTypeAlias: false;
	readonly isBlankNode: false;
	readonly wasAnonymousBlankNode: false;
	readonly isEphemeralBlankNode: false;
	readonly isLiteral: false;
	readonly isLanguagedLiteral: false;
	readonly isDatatypedLiteral: false;
	readonly isSimpleLiteral: false;
	readonly isNumericLiteral: false;
	readonly isIntegerLiteral: false;
	readonly isDoubleLiteral: false;
	readonly isDecimalLiteral: false;
	readonly isBooleanLiteral: false;
	readonly isInfiniteLiteral: false;
	readonly isNaNLiteral: false;
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



export type G_DefaultGraph = Term<['DefaultGraph', '']>;


/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type NamedNode<
 *    value extends Iri=Iri,
 * >: Term<['NamedNode', value]>
 * ```
 * 
 * - (!) The return types for all properties and methods are deeply and statically inferenced in Typescript.
 * 
 * --- **Examples:** ---
 * ```ts
 * // typing prefixes `as const` enables URI compacting within return types for methods like `.terse(prefixes)` and `.concise(prefixes)`
 * const prefixes = {test:'https://example.test/ontology/'} as const;
 * const testNode = namedNode(`${prefixes.test}Class`);
 * 
 * // RDFJS properties
 * testNode.termType;  // 'NamedNode'
 * testNode.value;  // 'https://example.test/ontology/Class'
 * 
 * // beware RDFJS equality is case-sensitive even for semantically equivalent identifiers
 * testNode.equals(namedNode('https://example.test/ontology/Class'));  // true
 * testNode.equals(namedNode('HTTPS://example.test/ontology/Class'));  // false
 * 
 * // narrowing properties
 * testNode.isGraphyTerm;    // true
 * testNode.isNode;          // true
 * testNode.isNamedNode;     // true
 * testNode.isAbsoluteIri;   // true
 * testNode.isRelativeIri;   // false
 * testNode.isRdfTypeAlias;  // false
 * 
 * // special properties
 * testNode.url;  // URL {origin:'https://example.test', protocol:'https:', ...}
 * 
 * // serialiation
 * testNode+'';                 // '>https://example.test/ontology/Class'  // returns this.flat()
 * testNode.flat();             // '>https://example.test/ontology/Class'
 * testNode.verbose();          // '<https://example.test/ontology/Class>'
 * testNode.concise(prefixes);  // 'test:Class'
 * testNode.terse(prefixes);    // 'test:Class'
 * testNode.star(prefixes);     // 'test:Class'
 * testNode.concise();          // '>https://example.test/ontology/Class'
 * testNode.terse();            // '<https://example.test/ontology/Class>'
 * testNode.star();             // '>https://example.test/ontology/Class'
 * 
 * // mutation
 * testNode.clone();                            // namedNode(this.value)
 * testNode.replaceValue('Class', 'Property');  // namedNode('https://example.test/ontology/Property')
 * testNode.replaceIri('Class', 'Property');    // namedNode('https://example.test/ontology/Property')
 * testNode.replaceValue(/^https?/, 'ftp');     // namedNode('ftp://example.test/ontology/Class')
 * testNode.replaceIri(/^https?/, 'ftp');       // namedNode('ftp://example.test/ontology/Class')
 * testNode.replaceText('Class', 'Property');   // namedNode(this.value)   // no effect
 * 
 * // hashing
 * testNode.hash();  // sha256(this.flat())
 * 
 * // isolation
 * testNode.isolate();  // {termType:'NamedNode', value:'https://example.test/'}
 * ```
 * 
 * --- **See Also:** ---
 *  - Data properties:
 *    - {@link Term_termType}
 *    - {@link Term_value}
 *    - {@link Term_url}
 * 
 *  - Narrowing properties:
 *    - {@link Term_isGraphyTerm}
 *    - {@link Term_isNode}
 *    - {@link Term_isNamedNode}
 *    - {@link Term_isNamedNode}
 * 
 * - Methods:
 *    - {@link Term_equals}
 */
export type G_NamedNode<
	s_value extends string=string,
> = Term<['NamedNode', s_value]>;

export type G_BlankNode<
	s_value extends string=string,
	si_node_type extends NodeType.ForBlankNodes=NodeType.ForBlankNodes,
> = Term<['BlankNode', s_value, si_node_type]>;

export type G_Literal<
	s_value extends string=string,
	s_language extends string|void=string,
	s_datatype extends string|void=string,
> = Term<['Literal', s_value, s_language, s_datatype]>;

// export namespace Literal {
// 	/**
// 	 * === _**@graphy/types**_ ===
// 	 * 
// 	 * ```ts
// 	 * type Literal.Datatype = Datatype
// 	 * ```
// 	 * 
// 	 * The `.datatype` property of a {@link Literal} is of type {@link Datatype}.
// 	 */
// 	export type Datatype = Datatype;
// }

export type G_NumericLiteral<
	s_value extends string,
> = G_Literal<s_value extends `${number}`? s_value: `${number}`, '', P_IRI_XSD_INTEGER | P_IRI_XSD_DOUBLE | P_IRI_XSD_DECIMAL>;

type BooleanStringValue = '0' | '1' | 'false' | 'true';

export type G_BooleanLiteral<
	s_value extends string,
> = G_Literal<s_value extends BooleanStringValue? s_value: BooleanStringValue, '', P_IRI_XSD_BOOLEAN>;

export type G_IntegerLiteral<
	s_value extends LiterallyInteger,
> = G_Literal<s_value, '', P_IRI_XSD_INTEGER>;

export type G_DoubleLiteral<
	s_value extends LiterallyDouble,
> = G_Literal<s_value, '', P_IRI_XSD_DOUBLE>;

export type G_InfiniteLiteral<
	s_value extends 'INF' | '-INF',
> = G_Literal<s_value, '', P_IRI_XSD_DOUBLE>;

export type G_NaNLiteral = G_Literal<'NaN', '', P_IRI_XSD_DOUBLE>;

export type G_DecimalLiteral<
	s_value extends string,
> = G_Literal<s_value, '', P_IRI_XSD_DECIMAL>;

export type G_DateLiteral<
	s_value extends string,
> = G_Literal<s_value, '', P_IRI_XSD_DATE>;

export type G_DateTimeLiteral<
	s_value extends string,
> = G_Literal<s_value, '', P_IRI_XSD_DATETIME>;

export type G_Variable<
	s_value extends string=string,
> = Term<['Variable', s_value]>;

export type G_Datatype<
	s_datatype extends string=string,
> = G_NamedNode<s_datatype>;

export type G_Node<
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

export type G_Subject<
	s_term extends string=string,
	s_value extends string=string,
> = G_Node<s_term, s_value>;

export type G_Predicate<
	s_term extends string=string,
	s_value extends string=string,
> = s_term extends `${infer ActualTermTypeString}`
	? (ActualTermTypeString extends NamedNodeTypeKey
		? G_NamedNode<s_value>
		: never
	)
	: G_NamedNode<s_value>;

export type G_Object<
	s_term extends string=string,
	s_value extends string=string,
	s_language extends string=string,
	s_datatype extends string=string,
> = s_term extends `${infer ActualTermTypeString}`
	? (ActualTermTypeString extends NodeTypeKey
		? G_Node<ActualTermTypeString, s_value>
		: (ActualTermTypeString extends LiteralTypeKey
			? G_Literal<ActualTermTypeString, s_language, s_datatype>
			: never)
	)
	: G_Node<s_term, s_value> | G_Literal<s_value, s_language, s_datatype>;

export type G_Graph<
	s_term extends string=string,
	s_value extends string=string,
> = s_term extends `${infer ActualTermTypeString}`
	? G_Node<ActualTermTypeString, s_value> | G_DefaultGraph
	: G_Node<s_term, s_value> | G_DefaultGraph;



// export type __Recursive_Quad<
// 	s_mode extends SupportedRdfMode=SupportedRdfMode,
// 	a_subject extends Descriptor<SubjectTypeKey<s_mode>, s_mode>=Descriptor<SubjectTypeKey<s_mode>, s_mode>,
// 	a_predicate extends Descriptor<PredicateTypeKey<s_mode>, s_mode>=Descriptor<PredicateTypeKey<s_mode>, s_mode>,
// 	a_object extends Descriptor<ObjectTypeKey<s_mode>, s_mode>=Descriptor<ObjectTypeKey<s_mode>, s_mode>,
// 	a_graph extends Descriptor<GraphTypeKey<s_mode>, s_mode>=Descriptor<GraphTypeKey<s_mode>, s_mode>,
// > = GraphyTerm<FromQualifier<[QuadTypeKey, '', void, void, a_subject, a_predicate, a_object, a_graph, s_mode]>>;

export type G_Quad<
	s_mode extends SupportedRdfMode=SupportedRdfMode,
	a_graph extends Descriptor<GraphTypeKey<s_mode>, s_mode>=Descriptor<GraphTypeKey<s_mode>, s_mode>,
	a_subject extends Descriptor<SubjectTypeKey<s_mode>, s_mode>=Descriptor<SubjectTypeKey<s_mode>, s_mode>,
	a_predicate extends Descriptor<PredicateTypeKey<s_mode>, s_mode>=Descriptor<PredicateTypeKey<s_mode>, s_mode>,
	a_object extends Descriptor<ObjectTypeKey<s_mode>, s_mode>=Descriptor<ObjectTypeKey<s_mode>, s_mode>,
> = GraphyTerm<FromQualifier<[QuadTypeKey, '', void, void, a_subject, a_predicate, a_object, a_graph, s_mode]>>;

// {
// 	type ind = Descriptor<SubjectTypeKey<RdfMode_11>, RdfMode_11>;
// 	type insp = Quad<RdfMode_11>;

// }

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
