/* eslint-disable no-shadow */
import type {
	List,
} from 'ts-toolbelt';

import type {
	Cast,
	Equals,
	Type,
} from 'ts-toolbelt/out/Any/_api';

import type {
	And,
	Not,
} from 'ts-toolbelt/out/Boolean/_api';

import {
	Repeat,
} from 'ts-toolbelt/out/List/Repeat';

import type {
	If,
} from 'ts-toolbelt/out/Any/If';

import type {
	Merge,
} from 'ts-toolbelt/out/Object/_api';


import type {
	ASSERT_SAME,
	Coerce,
	IsOnlyLiteralStrings,
	AutoString,
	Includes,
	AsString,
	Auto,
} from './utility';

import {
	P_XSD_STRING,
	P_RDFS_LANGSTRING,
	RdfMode_star,
	SupportedRdfMode,
	RdfMode_11,
} from './const';

import { DefaultGraphTypeKey, GraphTypeKey, LiteralTypeKey, ObjectTypeKey, PredicateTypeKey, QuadTypeKey, SubjectTypeKey, TermTypeKey, UnvaluableTypeKey, ValuableTypeKey } from './term';


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
	Disguise = unknown,
	> = Debug<Disguise, `'${TermTypeString}' is an invalid value for the .termType property`>;

type IncompatibleTermTypeError<
	TermTypeString extends string,
	Category extends string,
	Disguise = unknown,
	> = Debug<Disguise, `'${TermTypeString}' is an incompatible .termType value for ${Category}`>;


type PreferTermType<
	s_term extends string,
	s_restrict extends TermTypeKey=TermTypeKey,
> = Extract<s_restrict, Coerce<s_term, string, s_restrict>>;

/**
 * Opaque sub-type of void to indicate 'Bypass' termType
 */
type BypassTermType = Type<void, 'Bypass'>

/**
 * The Bypass descriptor indicates not to employ advanced type inferencing
 */
export type BypassDescriptor = [BypassTermType];

type QualifierSparse<
	s_term extends TermTypeKey=TermTypeKey,
	s_mode extends SupportedRdfMode=SupportedRdfMode,
> =
	| [void]
	| [s_term]
	| [s_term, string | void]
	| [s_term, string | void, string | void]
	| [s_term, string | void, string | void, string | void]
	| ({
		[K in SupportedRdfMode]: [
			s_term, string, void, void,
			Descriptor<SubjectTypeKey<s_mode>>,
			Descriptor<PredicateTypeKey<s_mode>>,
			Descriptor<ObjectTypeKey<s_mode>>,
			Descriptor<GraphTypeKey<s_mode>>,
		] | [
			s_term, string, void, void,
			Descriptor<SubjectTypeKey<s_mode>>,
			Descriptor<PredicateTypeKey<s_mode>>,
			Descriptor<ObjectTypeKey<s_mode>>,
			Descriptor<GraphTypeKey<s_mode>>,
			s_mode,
		]
	})[s_mode];

type QualifierMap<
	s_term extends TermTypeKey=TermTypeKey,
	s_mode extends SupportedRdfMode=SupportedRdfMode,
> =
	Merge<
		{
			termType: void | s_term;
			value: void | string;
			language: void | string;
			datatype: void | string;
		},
		{
			subject: void;
			predicate: void;
			object: void;
			graph: void;
			mode: void | SupportedRdfMode;
		} | ({
			[K in SupportedRdfMode]: {
				subject: void | Descriptor<SubjectTypeKey<s_mode>, s_mode>;
				predicate: void | Descriptor<PredicateTypeKey<s_mode>, s_mode>;
				object: void | Descriptor<ObjectTypeKey<s_mode>, s_mode>;
				graph: void | Descriptor<GraphTypeKey<s_mode>, s_mode>;
				mode: void | s_mode;
			}
		})[s_mode]
	>;


/**
 * Qualifier is a way to specify type constraints for a Term that will be normalized into a Descriptor
 */
export type Qualifier<
	s_term extends TermTypeKey=TermTypeKey,
	s_mode extends SupportedRdfMode=SupportedRdfMode,
> = QualifierSparse<s_term, s_mode> | Partial<QualifierMap<s_term, s_mode>>;


namespace NormalizeQualifier {
	/**
	 * Returns the appropriate union of .termType string types for the given `Descriptor`
	 */
	export type TermType<
		s_term extends string | void,
		s_restrict extends TermTypeKey=TermTypeKey,
	> = s_term extends void
		? TermTypeKey
		: (s_term extends string
			? PreferTermType<s_term, s_restrict>
			: TermTypeKey);

	// {
	// 	/* eslint-disable @typescript-eslint/no-unused-vars */
	// 	const Y: ASSERT_STRING<TermType<BypassDescriptor>> = 1;
	// 	const O: ASSERT_STRING<TermType<[void]>> = 1;

	// 	const N: ASSERT_EQUAL<TermType<[NamedNodeTypeKey]>, NamedNodeTypeKey> = 1;
	// 	const L: ASSERT_EQUAL<TermType<[LiteralTypeKey]>, LiteralTypeKey> = 1;
	// 	const D: ASSERT_SAME<TermType<[NodeTypeKey]>, NodeTypeKey> = 1;
	// 	const J: ASSERT_SAME<TermType<[ObjectTypeKey]>, ObjectTypeKey> = 1;

	// 	const NN: ASSERT_EQUAL<TermType<[NamedNodeTypeKey], NamedNodeTypeKey>, NamedNodeTypeKey> = 1;
	// 	const LL: ASSERT_EQUAL<TermType<[LiteralTypeKey], LiteralTypeKey>, LiteralTypeKey> = 1;
	// 	const DD: ASSERT_SAME<TermType<[NodeTypeKey], NodeTypeKey>, NodeTypeKey> = 1;
	// 	const JJ: ASSERT_SAME<TermType<[ObjectTypeKey], ObjectTypeKey>, ObjectTypeKey> = 1;

	// 	const DN: ASSERT_SAME<TermType<[NodeTypeKey], NamedNodeTypeKey>, NodeTypeKey> = 1;
	// 	const JL: ASSERT_SAME<TermType<[ObjectTypeKey], LiteralTypeKey>, ObjectTypeKey> = 1;

	// 	const ON: ASSERT_EQUAL<TermType<[void], NamedNodeTypeKey>, NamedNodeTypeKey> = 1;
	// 	const OL: ASSERT_EQUAL<TermType<[void], LiteralTypeKey>, LiteralTypeKey> = 1;
	// 	/* eslint-enable @typescript-eslint/no-unused-vars */
	// }


	export type Value<
		s_value extends string | void,
	> = s_value extends void? string: s_value;


	type AutoDatatype<
		s_datatype extends string | void,
		s_laguage,
	> = If<
			Equals<s_laguage, ''>,
			AutoString<s_datatype, P_XSD_STRING>,
			If<
				IsOnlyLiteralStrings<AsString<s_laguage>>,
				P_RDFS_LANGSTRING,
				AutoString<s_datatype>
			>
		>;

	type NarrowLanguage<
		s_language,
		s_datatype,
	> = If<
			And<
				Includes<s_language, string>,
				And<
					Not<Includes<s_datatype, P_RDFS_LANGSTRING>>,
					Not<Includes<s_datatype, string>>
				>
			>,
			'',
			s_language
		>;

	/**
	 * ```ts
	 * LanguageDatatype<
	 * 	LanguageString extends string|void,
	 * 	DatatypeString extends string|void,
	 * > => [string, string]
	 * ```
	 *
	 * Deduces the proper value types for the .language and .datatype.value properties.
	 * Gives precedence to `LanguageString` in case both arguments are specific, non-empty strings.
	 *
	 *     LanguageDatatype<void, void>  // ['', P_XSD_STRING]
	 *     LanguageDatatype<'en', void>  // ['en', P_RDFS_LANGSTRING]
	 *     LanguageDatatype<'en', 'z://y/'>  // ['en', P_RDFS_LANGSTRING]
	 *     LanguageDatatype<void, 'z://y/'>  // ['', 'z://y/']
	 *     LanguageDatatype<string, 'z://y/'>  // ['', 'z://y/']
	 *     LanguageDatatype<'', 'z://y/'>  // ['', 'z://y/']
	 */
	export type LanguageDatatype<
		s_language extends string | void,
		s_datatype extends string | void,
	> = AutoString<s_language, ''> extends infer s_language_auto
		? (AutoDatatype<s_datatype, s_language_auto> extends infer s_datatype_auto
			? (NarrowLanguage<s_language_auto, s_datatype_auto> extends infer s_language_narrow
				? [s_language_narrow, s_datatype_auto]
				: never
			)
			: never
		)
		: never;

	/* eslint-disable @typescript-eslint/no-unused-vars, brace-style, indent */
	{
		// language takes precedence over datatype
		const VV: ASSERT_SAME<LanguageDatatype<'en', 'z://'>, ['en', P_RDFS_LANGSTRING]> = 1;
		const VS: ASSERT_SAME<LanguageDatatype<'en', string>, ['en', P_RDFS_LANGSTRING]> = 1;
		const VO: ASSERT_SAME<LanguageDatatype<'en', void>, ['en', P_RDFS_LANGSTRING]> = 1;
		// even for unions
		const VU: ASSERT_SAME<LanguageDatatype<'en', 'z://' | string>, ['en', P_RDFS_LANGSTRING]> = 1;

		// language unions make it thru
		const UV: ASSERT_SAME<LanguageDatatype<'en' | 'fr', 'z://'>, ['en' | 'fr', P_RDFS_LANGSTRING]> = 1;
		const US: ASSERT_SAME<LanguageDatatype<'en' | 'fr', string>, ['en' | 'fr', P_RDFS_LANGSTRING]> = 1;
		const UO: ASSERT_SAME<LanguageDatatype<'en' | 'fr', void>, ['en' | 'fr', P_RDFS_LANGSTRING]> = 1;

		// empty string language
		const _V: ASSERT_SAME<LanguageDatatype<'', 'z://'>, ['', 'z://']> = 1;
		const _S: ASSERT_SAME<LanguageDatatype<'', string>, ['', string]> = 1;
		const _O: ASSERT_SAME<LanguageDatatype<'', void>, ['', P_XSD_STRING]> = 1;

		// datatype unions make it thru
		const _U: ASSERT_SAME<LanguageDatatype<'', 'z://' | 'y://'>, ['', 'z://' | 'y://']> = 1;
		const OU: ASSERT_SAME<LanguageDatatype<void, 'z://' | 'y://'>, ['', 'z://' | 'y://']> = 1;
		const SU: ASSERT_SAME<LanguageDatatype<string, 'z://' | 'y://'>, ['', 'z://' | 'y://']> = 1;

		// void language => ''
		const OV: ASSERT_SAME<LanguageDatatype<void, 'z://'>, ['', 'z://']> = 1;
		const OS: ASSERT_SAME<LanguageDatatype<void, string>, ['', string]> = 1;
		const OO: ASSERT_SAME<LanguageDatatype<void, void>, ['', P_XSD_STRING]> = 1;
	}
	/* eslint-enable @typescript-eslint/no-unused-vars, brace-style, indent */


	export type Mode<
		s_mode extends SupportedRdfMode | void,
		s_mode_default extends SupportedRdfMode|void=void,
	> = s_mode extends void
		? (s_mode_default extends SupportedRdfMode
			? s_mode_default
			: RdfMode_star
		)
		: s_mode extends SupportedRdfMode
			? s_mode
			: (s_mode_default extends SupportedRdfMode
				? s_mode_default
				: RdfMode_star
			);
}

type FromQualifierSparse<
	a_qualifier extends QualifierSparse,
	s_term_restrict extends TermTypeKey,
	s_mode_default extends SupportedRdfMode,
> = NormalizeQualifier.Mode<a_qualifier[8], s_mode_default> extends infer s_mode
	? (s_mode extends SupportedRdfMode
		? Descriptor.New<
			[
				Extract<s_term_restrict, a_qualifier[0]>,
				a_qualifier[1],
				a_qualifier[2],
				a_qualifier[3],
				a_qualifier[4],
				a_qualifier[5],
				a_qualifier[6],
				a_qualifier[7],
				a_qualifier[8],
			],
			s_term_restrict,
			s_mode_default
		>
		: never
	)
	: never;


type FromQualifierMap<
	g_qualifier extends Partial<QualifierMap>,
	s_term_restrict extends TermTypeKey,
	s_mode_default extends SupportedRdfMode,
> = NormalizeQualifier.Mode<g_qualifier['mode'], s_mode_default> extends infer s_mode
	? (s_mode extends SupportedRdfMode | void
		? ((s_mode extends void? SupportedRdfMode: s_mode extends SupportedRdfMode? s_mode: SupportedRdfMode) extends infer s_mode_pass
			? s_mode_pass extends SupportedRdfMode
				? Descriptor.New<[
						g_qualifier['termType'],
						g_qualifier['value'],
						g_qualifier['language'],
						g_qualifier['datatype'],
						g_qualifier['subject'] extends Descriptor
							// ? Descriptor.Filter<g_qualifier['subject'], SubjectTypeKey<s_mode_pass>>
							? g_qualifier['subject']
							: FromQualifierSparse<[SubjectTypeKey<s_mode_pass>], TermTypeKey, s_mode_pass>,
						g_qualifier['predicate'] extends Descriptor
							? Descriptor.Filter<g_qualifier['predicate'], PredicateTypeKey<s_mode_pass>>
							: FromQualifierSparse<[PredicateTypeKey<s_mode_pass>], TermTypeKey, s_mode_pass>,
						g_qualifier['object'] extends Descriptor
							? Descriptor.Filter<g_qualifier['object'], Extract<s_term_restrict, ObjectTypeKey<s_mode_pass>>>
							: FromQualifierSparse<[ObjectTypeKey<s_mode_pass>], TermTypeKey, s_mode_pass>,
						g_qualifier['graph'] extends Descriptor
							? Descriptor.Filter<g_qualifier['graph'], Extract<s_term_restrict, GraphTypeKey<s_mode_pass>>>
							: FromQualifierSparse<[GraphTypeKey<s_mode_pass>], TermTypeKey, s_mode_pass>,
						s_mode,
					],
					s_term_restrict,
					s_mode_default
				>
				: never
			: never
		)
		: never
	)
	: never;

	{

		type e1 = FromQualifier<{ termType: QuadTypeKey; mode: RdfMode_11 }>;
		type i1 = FromQualifier<{ mode: RdfMode_11 }>;
		type p1 = FromQualifier<{
			termType: QuadTypeKey;
			mode: RdfMode_11;
		}>[4];
	}


export type FromQualifier<
	z_qualifier extends Qualifier|Descriptor|void=void,
	s_term_restrict extends TermTypeKey=TermTypeKey,
	s_mode_input extends SupportedRdfMode|void=void,
> = z_qualifier extends Descriptor
	? z_qualifier
	: Auto<s_mode_input, SupportedRdfMode> extends infer s_mode
		? (s_mode extends SupportedRdfMode
			? (z_qualifier extends QualifierSparse
				? FromQualifierSparse<z_qualifier, s_term_restrict, s_mode>
				: (z_qualifier extends Partial<QualifierMap>
					? FromQualifierMap<z_qualifier, s_term_restrict, s_mode>
					: never)
			)
			: never
		)
		: never;


// /**
//  * Applies normalization to a descriptor depending on the termType(s) given
//  */
// type DescriptorMap<
// 	s_term extends TermTypeKey,
// 	a_descriptor extends Descriptor,
// 	s_mode extends AllowedRdfMode = AutoString<a_descriptor[8], RdfMode_11>,
// > =
// 	Merge<
// 		// trivial, unvaluable term types
// 		{
// 			[K in Extract<TrivialTypeKey, UnvaluableTypeKey>]: [
// 				s_term, '', void, void,
// 			];
// 		},
// 		Merge<
// 			// trivial, valuable term types
// 			{
// 				[K in Extract<TrivialTypeKey, ValuableTypeKey>]: [
// 					s_term, AutoString<a_descriptor[1]>, void, void,
// 				];
// 			},
// 			Merge<
// 				// literal
// 				{
// 					[K in LiteralTypeKey]: [
// 						s_term, AutoString<a_descriptor[1]>, a_descriptor[2], a_descriptor[3],
// 						// ...NormalizeQualifier.LanguageDatatype<a_descriptor[2], a_descriptor[3]>,
// 					];
// 				},
// 				// quad
// 				{
// 					[K in QuadTypeKey]: [
// 						QuadTypeKey, '', void, void,
// 						SolveDescriptor<Descriptor.Auto<a_descriptor[4]>, SubjectTypeKey<s_mode>, s_mode>,
// 						SolveDescriptor<Descriptor.Auto<a_descriptor[5]>, PredicateTypeKey<s_mode>, s_mode>,
// 						SolveDescriptor<Descriptor.Auto<a_descriptor[6]>, ObjectTypeKey<s_mode>>, s_mode,
// 						SolveDescriptor<Descriptor.Auto<a_descriptor[7]>, GraphTypeKey<s_mode>, s_mode>,
// 					];
// 				}
// 			>
// 		>
// 	>;

// export type SolveDescriptor<
// 	a_descriptor extends Descriptor,
// 	s_terms_restrict extends TermTypeKey = TermTypeKey,
// 	s_mode extends AllowedRdfMode=AllowedRdfMode,
// > = Extract<a_descriptor[0], s_terms_restrict> extends infer s_term
// 	? (s_term extends TermTypeKey
// 		? DescriptorMap<s_term, a_descriptor, s_mode>[s_term]
// 		: never
// 	)
// 	: never;

// export type Solve<
// 	z_qualifier extends Qualifier,
// 	s_mode extends AllowedRdfMode=AllowedRdfMode,
// 	s_terms_restrict extends TermTypeKey=TermTypeKey,
// > = SolveDescriptor<FromQualifier<z_qualifier, s_mode, s_terms_restrict>, s_terms_restrict, s_mode>;

/**
 * A canonical struct for representing the type constraints for a Term
 * 
 * 0: termType
 * 1: value
 * 2: language
 * 3: datatype
 * 4: subject
 * 5: predicate
 * 6: object
 * 7: graph
 * 8: mode
 */
export type Descriptor<
	s_term extends TermTypeKey = TermTypeKey,
	s_mode extends SupportedRdfMode = SupportedRdfMode,
	b_recurse extends boolean=false,
> = (Merge<
	{
		[K in QuadTypeKey]: [
			Extract<QuadTypeKey, s_term>, '', void, void,
			Descriptor.Route<SubjectTypeKey<s_mode>, s_mode, b_recurse>,
			Descriptor.Route<PredicateTypeKey<s_mode>, s_mode, b_recurse>,
			Descriptor.Route<ObjectTypeKey<s_mode>, s_mode, b_recurse>,
			Descriptor.Route<GraphTypeKey<s_mode>, s_mode, b_recurse>,
			s_mode,
		];
	},
	Merge <
		{
			[K in LiteralTypeKey]: [
				Extract < LiteralTypeKey, s_term >, string, string, string,
				void, void, void, void,
				SupportedRdfMode,
			];
		},
		Merge<
			{
				[K in ValuableTypeKey]: [
					Extract<ValuableTypeKey, s_term>, string, void, void,
					void, void, void, void,
					SupportedRdfMode,
				];
			},
			{
				[K in UnvaluableTypeKey]: [
					Extract < DefaultGraphTypeKey, s_term >, '', void, void,
					void, void, void, void,
					SupportedRdfMode,
				];
			}
		>
	>
>)[s_term];


export namespace Descriptor {
	/**
	 * Maps key names to the corresponding descriptor index
	 */
	export type KeyMap = {
		termType: 0;
		value: 1;
		language: 2;
		datatype: 3;
		subject: 4;
		predicate: 5;
		object: 6;
		graph: 7;
		mode: 8;
	}

	// type AccessMap<
	// 	a_descriptor extends Descriptor,
	// > = Merge<
	// 	{
	// 		termType: a_descriptor[0];
	// 		value: a_descriptor[1];
	// 		language: a_descriptor[2];
	// 		datatype: a_descriptor[3];
	// 		mode: a_descriptor[8];
	// 	},
	// 	a_descriptor extends Descriptor<QuadTypeKey>
	// 	? {
	// 		subject: a_descriptor[4] extends Descriptor<SubjectTypeKey<AllowedRdfMode>> ? a_descriptor[4] : never;
	// 		predicate: a_descriptor[5] extends Descriptor<PredicateTypeKey<AllowedRdfMode>> ? a_descriptor[5] : never;
	// 		object: a_descriptor[6] extends Descriptor<ObjectTypeKey<AllowedRdfMode>> ? a_descriptor[6] : never;
	// 		graph: a_descriptor[7] extends Descriptor<GraphTypeKey<AllowedRdfMode>> ? a_descriptor[7] : never;
	// 			// predicate: a_descriptor[5];
	// 			// object: a_descriptor[6];
	// 			// graph: a_descriptor[7];
	// 		}
	// 	: {
	// 		subject: void;
	// 		predicate: void;
	// 		object: void;
	// 		graph: void;
	// 	}
	// >;

	type AccessMap<
		a_descriptor extends Descriptor,
		> = {
			termType: a_descriptor[0];
			value: a_descriptor[1];
			language: a_descriptor[2];
			datatype: a_descriptor[3];
			subject: a_descriptor[4] extends Descriptor<SubjectTypeKey> ? a_descriptor[4] : never;
			predicate: a_descriptor[5] extends Descriptor<PredicateTypeKey> ? a_descriptor[5] : never;
			object: a_descriptor[6] extends Descriptor<ObjectTypeKey> ? a_descriptor[6] : never;
			graph: a_descriptor[7] extends Descriptor<GraphTypeKey> ? a_descriptor[7] : never;
			mode: a_descriptor[8];
		};
	
	// 	mode: a_descriptor[8];
	// };

	export type Access<
		a_descriptor extends Descriptor,
		s_at extends keyof KeyMap,
	> = AccessMap<a_descriptor>[s_at];

	export type Mutation = {
		termType?: TermTypeKey;
		value?: string;
		language?: string;
		datatype?: string;
	};

	export type Mutate<
		a_descriptor extends Descriptor,
		g_mutator extends Mutation,
	> = Descriptor.New<[
		Auto<g_mutator['termType'], TermTypeKey, a_descriptor[0]>,
		Auto<g_mutator['value'], string, a_descriptor[1]>,
		Auto<g_mutator['language'], string, a_descriptor[2]>,
		Auto<g_mutator['datatype'], string, a_descriptor[3]>,
		a_descriptor[4],
		a_descriptor[5],
		a_descriptor[6],
		a_descriptor[7],
		a_descriptor[8]
	]>

	export type Devoid<
		z_descriptor extends any,
	> = z_descriptor extends Descriptor
		? z_descriptor
		: FromQualifier;

	type NestedQuad<
		s_term extends QuadTypeKey = QuadTypeKey,
		s_mode extends SupportedRdfMode = SupportedRdfMode,
	> = [
		Extract<QuadTypeKey, s_term>, '', void, void,
		Descriptor<SubjectTypeKey<s_mode>, s_mode>,
		Descriptor<PredicateTypeKey<s_mode>, s_mode>,
		Descriptor<ObjectTypeKey<s_mode>, s_mode>,
		Descriptor<GraphTypeKey<s_mode>, s_mode>,
		s_mode,
	];

	export type Route<
		s_term extends TermTypeKey = TermTypeKey,
		s_mode extends SupportedRdfMode = SupportedRdfMode,
		b_recurse extends boolean = false,
	> = s_term extends QuadTypeKey
		? (b_recurse extends true
			? NestedQuad<s_term, s_mode>
			: Descriptor<s_term, s_mode, true>
		)
		: Descriptor<s_term, s_mode, true>;


	type NewArgs = [
		string | void,
		string | void,
		string | void,
		string | void,
		NewArgs | void,
		NewArgs | void,
		NewArgs | void,
		NewArgs | void,
		SupportedRdfMode | void,
	];

	type RecurseNew<
		a_args extends NewArgs | void,
		s_term_restrict extends TermTypeKey,
		s_mode_default extends SupportedRdfMode,
	> = a_args extends NewArgs
		? New<a_args, s_term_restrict, s_mode_default>
		: void;

	// export type New<
	// 	a_args extends NewArgs,
	// 	s_term_restrict extends TermTypeKey = TermTypeKey,
	// 	s_mode_default extends AllowedRdfMode = AllowedRdfMode,
	// 	> = [
	// 		NormalizeQualifier.TermType<a_args[0], s_term_restrict>,
	// 		NormalizeQualifier.Value<a_args[1]>,
	// 		...NormalizeQualifier.LanguageDatatype<a_args[2], a_args[3]>,
	// 		RecurseNew<a_args[4], s_term_restrict, s_mode_default>,
	// 		RecurseNew<a_args[5], s_term_restrict, s_mode_default>,
	// 		RecurseNew<a_args[6], s_term_restrict, s_mode_default>,
	// 		RecurseNew<a_args[7], s_term_restrict, s_mode_default>,
	// 		Auto<a_args[8], s_mode_default>,
	// 	];

	export type New<
		a_args extends NewArgs,
		s_term_restrict extends TermTypeKey = TermTypeKey,
		s_mode_default extends SupportedRdfMode = SupportedRdfMode,
	> = NormalizeQualifier.TermType<a_args[0], s_term_restrict> extends infer s_term
		? (s_term extends s_term_restrict
			? (Auto<a_args[8], s_mode_default> extends infer s_mode
				? (s_mode extends SupportedRdfMode
					? (Merge<
						{
							[K in QuadTypeKey]: [
								s_term, '', void, void,
								RecurseNew<a_args[4], s_term_restrict, s_mode_default>,
								RecurseNew<a_args[5], s_term_restrict, s_mode_default>,
								RecurseNew<a_args[6], s_term_restrict, s_mode_default>,
								RecurseNew<a_args[7], s_term_restrict, s_mode_default>,
								s_mode
							]
						},
						Merge<
							{
								[K in LiteralTypeKey]: [
									s_term,
									NormalizeQualifier.Value<a_args[1]>,
									...NormalizeQualifier.LanguageDatatype<a_args[2], a_args[3]>,
									void, void, void, void,
									s_mode,
								]
							},
							Merge<
								{
									[K in ValuableTypeKey]: [
										s_term, NormalizeQualifier.Value<a_args[1]>, void, void,
										void, void, void, void,
										s_mode,
									]
								},
								{
									[K in UnvaluableTypeKey]: [
										s_term, '', void, void,
										void, void, void, void,
										s_mode,
									];
								}
							>
						>
					>)[s_term]
					: never
				)
				: never
			)
			: never
		)
		: never;

	/**
	 * ```ts
	 * FilterDescriptor<
	 * 	Descriptor extends TermDescriptor,
	 * 	Target extends TermTypeKey,
	 * 	TermTypeSring extends TermTypeKey=DescriptorTermType<Descriptor, Target>,
	 * > => TermDescriptor<Target>
	 * ```
	 *
	 * Converts `Descriptor` into `TermDescriptor<Target>`
	 */
	export type Filter<
		a_descriptor extends Descriptor,
		s_term_restrict extends TermTypeKey,
	> = [Extract<Access<a_descriptor, 'termType'>, s_term_restrict>, ...List.Omit<a_descriptor, 0>] extends infer NewDescriptor
		? (NewDescriptor extends Descriptor<s_term_restrict>
			? NewDescriptor
			: never
		)
		: never;
}


// type SolvedDescriptor<
// 	TermTypeString extends TermTypeKey,
// 	RdfMode extends AllowedRdfMode,
// 	> =
// 	| [UnvaluableTypeKey, '']
// 	| [ValuableTypeKey, string]
// 	| [LiteralTypeKey, string, string, string]
// 	| [
// 		QuadTypeKey, string, void, void,
// 		SolvedDescriptor<SubjectTypeKey<RdfMode>, RdfMode>,
// 		SolvedDescriptor<PredicateTypeKey<RdfMode>, RdfMode>,
// 		SolvedDescriptor<ObjectTypeKey<RdfMode>, RdfMode>,
// 		SolvedDescriptor<GraphTypeKey<RdfMode>, RdfMode>,
// 		RdfMode,
// 	];


// type TrivialTermDescriptor<TermTypeString extends TrivialTypeKey = TrivialTypeKey> =
// 	| [TermTypeString]
// 	| [TermTypeString, string];

// export type TermDescriptor<TermTypeString extends TermTypeKey = TermTypeKey> =
// 	| [void]
// 	| [TermTypeString]
// 	| [TermTypeString, string]
// 	| [TermTypeString, string, string | void]
// 	| [TermTypeString, string, string | void, string | void]
// 	| [
// 		TermTypeString, string, void, void,
// 		TrivialTermDescriptor<SubjectTypeKey<RdfMode_11>>,
// 		TrivialTermDescriptor<PredicateTypeKey<RdfMode_11>>,
// 		TermDescriptor<ObjectTypeKey<RdfMode_11>>,
// 		TrivialTermDescriptor<GraphTypeKey<RdfMode_11>>
// 	]
// 	| [
// 		TermTypeString, string, void, void,
// 		TrivialTermDescriptor<SubjectTypeKey<RdfMode_11>>,
// 		TrivialTermDescriptor<PredicateTypeKey<RdfMode_11>>,
// 		TermDescriptor<ObjectTypeKey<RdfMode_11>>,
// 		TrivialTermDescriptor<GraphTypeKey<RdfMode_11>>,
// 		RdfMode_11
// 	]
// 	| [
// 		TermTypeString, string, void, void,
// 		TermDescriptor<SubjectTypeKey<RdfMode_star>>,
// 		TrivialTermDescriptor<PredicateTypeKey<RdfMode_star>>,
// 		TermDescriptor<ObjectTypeKey<RdfMode_star>>,
// 		TrivialTermDescriptor<GraphTypeKey<RdfMode_star>>,
// 		RdfMode_star
// 	]
// 	| [
// 		TermTypeString, string, void, void,
// 		TermDescriptor<SubjectTypeKey<RdfMode_easier>>,
// 		TermDescriptor<PredicateTypeKey<RdfMode_easier>>,
// 		TermDescriptor<ObjectTypeKey<RdfMode_easier>>,
// 		TermDescriptor<GraphTypeKey<RdfMode_easier>>,
// 		RdfMode_easier
// 	];



// {
// 	/* eslint-disable @typescript-eslint/no-unused-vars */

// 	type _ = '';
// 	type E = 'en';

// 	type V = 'z://';

// 	const V_: ASSERT_EQUAL<AutoDatatype<V, ''>, V> = 1;
// 	const VE: ASSERT_EQUAL<AutoDatatype<V, E>, P_RDFS_LANGSTRING> = 1;
// 	const VS: ASSERT_EQUAL<AutoDatatype<V, string>, V> = 1;

// 	const S_: ASSERT_STRING<AutoDatatype<string, ''>> = 1;
// 	const SE: ASSERT_EQUAL<AutoDatatype<string, E>, P_RDFS_LANGSTRING> = 1;
// 	const SS: ASSERT_STRING<AutoDatatype<string, string>> = 1;

// 	const O_: ASSERT_EQUAL<AutoDatatype<void, ''>, P_XSD_STRING> = 1;
// 	const OE: ASSERT_EQUAL<AutoDatatype<void, E>, P_RDFS_LANGSTRING> = 1;
// 	const OS: ASSERT_STRING<AutoDatatype<void, string>> = 1;

// 	/* eslint-enable @typescript-eslint/no-unused-vars */
// }


// {
// 	/* eslint-disable @typescript-eslint/no-unused-vars */
// 	type N = SolveDescriptor<[NamedNodeTypeKey]>;
// 	const N_0: ASSERT_EQUAL<N[0], NamedNodeTypeKey> = 1;
// 	const N_1: ASSERT_STRING<N[1]> = 1;
// 	const N_2: ASSERT_VOID<N[2]> = 1;
// 	const N_3: ASSERT_VOID<N[3]> = 1;

// 	type Nv = SolveDescriptor<[NamedNodeTypeKey, 'A']>;
// 	const Nv0: ASSERT_EQUAL<Nv[0], NamedNodeTypeKey> = 1;
// 	const Nv1: ASSERT_EQUAL<Nv[1], 'A'> = 1;
// 	const Nv2: ASSERT_VOID<Nv[2]> = 1;
// 	const Nv3: ASSERT_VOID<Nv[3]> = 1;

// 	type B = SolveDescriptor<[BlankNodeTypeKey]>;
// 	const B_0: ASSERT_EQUAL<B[0], BlankNodeTypeKey> = 1;
// 	const B_1: ASSERT_STRING<B[1]> = 1;
// 	const B_2: ASSERT_VOID<B[2]> = 1;
// 	const B_3: ASSERT_VOID<B[3]> = 1;

// 	type Bv = SolveDescriptor<[BlankNodeTypeKey, 'A']>;
// 	const Bv0: ASSERT_EQUAL<Bv[0], BlankNodeTypeKey> = 1;
// 	const Bv1: ASSERT_EQUAL<Bv[1], 'A'> = 1;
// 	const Bv2: ASSERT_VOID<Bv[2]> = 1;
// 	const Bv3: ASSERT_VOID<Bv[3]> = 1;

// 	type L = SolveDescriptor<[LiteralTypeKey]>;
// 	const L_0: ASSERT_EQUAL<L[0], LiteralTypeKey> = 1;
// 	const L_1: ASSERT_STRING<L[1]> = 1;
// 	const L_2: ASSERT_EQUAL<L[2], ''> = 1;
// 	const L_3: ASSERT_EQUAL<L[3], P_XSD_STRING> = 1;

// 	type Lv = SolveDescriptor<[LiteralTypeKey, 'A']>;
// 	const Lv0: ASSERT_EQUAL<Lv[0], LiteralTypeKey> = 1;
// 	const Lv1: ASSERT_EQUAL<Lv[1], 'A'> = 1;
// 	const Lv2: ASSERT_EQUAL<Lv[2], ''> = 1;
// 	const Lv3: ASSERT_EQUAL<Lv[3], P_XSD_STRING> = 1;

// 	type Lvv = SolveDescriptor<[LiteralTypeKey, 'A', 'en']>;
// 	const Lvv0: ASSERT_EQUAL<Lvv[0], LiteralTypeKey> = 1;
// 	const Lvv1: ASSERT_EQUAL<Lvv[1], 'A'> = 1;
// 	const Lvv2: ASSERT_EQUAL<Lvv[2], 'en'> = 1;
// 	const Lvv3: ASSERT_EQUAL<Lvv[3], P_RDFS_LANGSTRING> = 1;

// 	type G = SolveDescriptor<[DefaultGraphTypeKey]>;
// 	const G_0: ASSERT_EQUAL<G[0], DefaultGraphTypeKey> = 1;
// 	const G_1: ASSERT_EQUAL<G[1], ''> = 1;
// 	const G_2: ASSERT_VOID<G[2]> = 1;
// 	const G_3: ASSERT_VOID<G[3]> = 1;

// 	type R = SolveDescriptor<[VariableTypeKey]>;
// 	const R_0: ASSERT_EQUAL<R[0], VariableTypeKey> = 1;
// 	const R_1: ASSERT_STRING<R[1]> = 1;
// 	const R_2: ASSERT_VOID<R[2]> = 1;
// 	const R_3: ASSERT_VOID<R[3]> = 1;

// 	const NmO_N: ASSERT_SAME<N, SolveDescriptor<[void], NamedNodeTypeKey>> = 1;
// 	const BmO_B: ASSERT_SAME<B, SolveDescriptor<[void], BlankNodeTypeKey>> = 1;
// 	const LmO_L: ASSERT_SAME<L, SolveDescriptor<[void], LiteralTypeKey>> = 1;
// 	const GmO_G: ASSERT_SAME<G, SolveDescriptor<[void], DefaultGraphTypeKey>> = 1;
// 	const RmO_R: ASSERT_SAME<R, SolveDescriptor<[void], VariableTypeKey>> = 1;


// 	type NL = SolveDescriptor<[NamedNodeTypeKey | LiteralTypeKey]>;
// 	const NL_0: ASSERT_SAME<NL[0], NamedNodeTypeKey | LiteralTypeKey> = 1;
// 	const NL_1: ASSERT_STRING<NL[1]> = 1;
// 	const NL_2: ASSERT_SAME<NL[2], void | ''> = 1;
// 	const NL_3: ASSERT_SAME<NL[3], void | P_XSD_STRING> = 1;

// 	type Q = SolveDescriptor<[QuadTypeKey]>;
// 	const Q_0: ASSERT_SAME<Q[0], QuadTypeKey> = 1;
// 	const Q_4: ASSERT_SAME<Q[4][0], SubjectTypeKey> = 1;
// 	const Q_5: ASSERT_SAME<Q[5][0], PredicateTypeKey> = 1;
// 	const Q_6: ASSERT_SAME<Q[6][0], ObjectTypeKey> = 1;
// 	const Q_7: ASSERT_SAME<Q[7][0], GraphTypeKey> = 1;
// 	/* eslint-enable @typescript-eslint/no-unused-vars */
// }

