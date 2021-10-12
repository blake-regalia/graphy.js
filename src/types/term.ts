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
type TermTypeKey = keyof TermTypes;

/**
 * The .termType string value type "NamedNode"
 */
type NamedNodeTypeKey = Extract<TermTypeKey, 'NamedNode'>;

/**
 * The .termType string value type "BlankNode"
 */
type BlankNodeTypeKey = Extract<TermTypeKey, 'BlankNode'>;

/**
 * The .termType string value type "Literal"
 */
type LiteralTypeKey = Extract<TermTypeKey, 'Literal'>;

/**
 * The .termType string value type "DefaultGraph"
 */
type DefaultGraphTypeKey = Extract<TermTypeKey, 'DefaultGraph'>;

/**
 * The .termType string value type "Quad"
 */
type QuadTypeKey = Extract<TermTypeKey, 'Quad'>;

/**
 * The .termType string value type "Variable"
 */
type VariableTypeKey = Extract<TermTypeKey, 'Variable'>;


/**
 * Union of NamedNode and BlankNode term types
 */
type NodeTypeKey = NamedNodeTypeKey | BlankNodeTypeKey;

/**
 * Union of valid .termType string value types which only require the .termType and .value properties.
 */
type TrivialTypeKey = NodeTypeKey | DefaultGraphTypeKey | VariableTypeKey;

/**
 * Union of valid .termType string value types which carry actual data.
 */
type DataTypeKey = Exclude<TermTypeKey, VariableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data.
 */
type ValuableTypeKey = Extract<TermTypeKey, NodeTypeKey | LiteralTypeKey | VariableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data.
 */
type UnvaluableTypeKey = Exclude<TermTypeKey, ValuableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data and ARE NOT required to have an empty .value property.
 */
type ValuableDataTypeKey = Extract<DataTypeKey, ValuableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data and ARE required to have an empty .value property.
 */
type UnvaluableDataTypeKey = Exclude<DataTypeKey, ValuableDataTypeKey>;


/**
 * `<RdfMode extends AllowedRdfMode=RdfMode_11> => TermTypeKey`
 *
 * Returns the union of valid .termType string values for Terms that appear in the subject position for the given `RdfMode`
 */
type SubjectTypeKey<
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
type PredicateTypeKey<
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
type ObjectTypeKey<
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
type GraphTypeKey<
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
type DatatypeTypeKey<
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

type SolvedDescriptor<
	TermTypeString extends TermTypeKey,
	RdfMode extends AllowedRdfMode,
> =
	| [UnvaluableTypeKey, '']
	| [ValuableTypeKey, string]
	| [LiteralTypeKey, string, string, string]
	| [
		QuadTypeKey, string, void, void,
		SolvedDescriptor<SubjectTypeKey<RdfMode>, RdfMode>,
		SolvedDescriptor<PredicateTypeKey<RdfMode>, RdfMode>,
		SolvedDescriptor<ObjectTypeKey<RdfMode>, RdfMode>,
		SolvedDescriptor<GraphTypeKey<RdfMode>, RdfMode>,
		RdfMode,
	];


type TrivialTermDescriptor<TermTypeString extends TrivialTypeKey=TrivialTypeKey> =
	| [TermTypeString]
	| [TermTypeString, string];

type TermDescriptor<TermTypeString extends TermTypeKey=TermTypeKey> =
	| [void]
	| [TermTypeString]
	| [TermTypeString, string]
	| [TermTypeString, string, string|void]
	| [TermTypeString, string, string|void, string|void]
	| [
		TermTypeString, string, void, void,
		TrivialTermDescriptor<SubjectTypeKey<RdfMode_11>>,
		TrivialTermDescriptor<PredicateTypeKey<RdfMode_11>>,
		TermDescriptor<ObjectTypeKey<RdfMode_11>>,
		TrivialTermDescriptor<GraphTypeKey<RdfMode_11>>
	]
	| [
		TermTypeString, string, void, void,
		TrivialTermDescriptor<SubjectTypeKey<RdfMode_11>>,
		TrivialTermDescriptor<PredicateTypeKey<RdfMode_11>>,
		TermDescriptor<ObjectTypeKey<RdfMode_11>>,
		TrivialTermDescriptor<GraphTypeKey<RdfMode_11>>,
		RdfMode_11
	]
	| [
		TermTypeString, string, void, void,
		TermDescriptor<SubjectTypeKey<RdfMode_star>>,
		TrivialTermDescriptor<PredicateTypeKey<RdfMode_star>>,
		TermDescriptor<ObjectTypeKey<RdfMode_star>>,
		TrivialTermDescriptor<GraphTypeKey<RdfMode_star>>,
		RdfMode_star
	]
	| [
		TermTypeString, string, void, void,
		TermDescriptor<SubjectTypeKey<RdfMode_easier>>,
		TermDescriptor<PredicateTypeKey<RdfMode_easier>>,
		TermDescriptor<ObjectTypeKey<RdfMode_easier>>,
		TermDescriptor<GraphTypeKey<RdfMode_easier>>,
		RdfMode_easier
	];


type AutoDescriptor<
	Thing extends any,
> = Thing extends void
	? [void]
	: Thing;


/**
 * Returns the appropriate union of .termType string types for the given `Descriptor`
 */
type DescriptorTermType<
	Descriptor extends TermDescriptor,
	DefaultTypeString extends string=Descriptor[0] extends void? string: TermTypeKey,
> = Descriptor[0] extends string
	? FavorTermType<Descriptor[0]>
	: DefaultTypeString;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const Y: ASSERT_STRING<DescriptorTermType<BypassDescriptor>> = 1;
	const O: ASSERT_STRING<DescriptorTermType<[void]>> = 1;

	const N: ASSERT_EQUAL<DescriptorTermType<[NamedNodeTypeKey]>, NamedNodeTypeKey> = 1;
	const L: ASSERT_EQUAL<DescriptorTermType<[LiteralTypeKey]>, LiteralTypeKey> = 1;
	const D: ASSERT_SAME<DescriptorTermType<[NodeTypeKey]>, NodeTypeKey> = 1;
	const J: ASSERT_SAME<DescriptorTermType<[ObjectTypeKey]>, ObjectTypeKey> = 1;

	const NN: ASSERT_EQUAL<DescriptorTermType<[NamedNodeTypeKey], NamedNodeTypeKey>, NamedNodeTypeKey> = 1;
	const LL: ASSERT_EQUAL<DescriptorTermType<[LiteralTypeKey], LiteralTypeKey>, LiteralTypeKey> = 1;
	const DD: ASSERT_SAME<DescriptorTermType<[NodeTypeKey], NodeTypeKey>, NodeTypeKey> = 1;
	const JJ: ASSERT_SAME<DescriptorTermType<[ObjectTypeKey], ObjectTypeKey>, ObjectTypeKey> = 1;

	const DN: ASSERT_SAME<DescriptorTermType<[NodeTypeKey], NamedNodeTypeKey>, NodeTypeKey> = 1;
	const JL: ASSERT_SAME<DescriptorTermType<[ObjectTypeKey], LiteralTypeKey>, ObjectTypeKey> = 1;

	const ON: ASSERT_EQUAL<DescriptorTermType<[void], NamedNodeTypeKey>, NamedNodeTypeKey> = 1;
	const OL: ASSERT_EQUAL<DescriptorTermType<[void], LiteralTypeKey>, LiteralTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}

type DescriptorQuadComponent<
	Descriptor,
	Index extends number,
> = Descriptor extends TermDescriptor
	? (Descriptor extends BypassDescriptor
		? BypassDescriptor
		: (Descriptor[Index] extends TermDescriptor
			? Descriptor[Index]
			: BypassDescriptor
		)
	): never;

// type TES = DescriptorQuadComponent<[['NamedNode']], 0>;


type ValidTermTypesMatch<
	KeysSet extends string,
	TermTypeStringA extends string,
	ValueStringA extends string,
	TermTypeStringB extends string,
	ValueStringB extends string,
> = If<
	ValidTermTypes<KeysSet, TermTypeStringA, TermTypeStringB>,
	And<
		// Equals<TermTypeStringA, TermTypeStringB>,
		// Equals<ValueStringA, ValueStringB>,
		StringsMatch<TermTypeStringA, TermTypeStringB>,
		StringsMatch<ValueStringA, ValueStringB>
	>
>;


type AutoDatatype<
	DatatypeString extends string|void,
	AutoLanguageString,
> = If<
	Equals<AutoLanguageString, ''>,
	AutoString<DatatypeString, P_XSD_STRING>,
	If<
		IsOnlyLiteralStrings<AsString<AutoLanguageString>>,
		P_RDFS_LANGSTRING,
		AutoString<DatatypeString>
	>
>;

type NarrowLanguage<
	AutoLanguageString,
	AutoDatatypeString,
> = If<
	And<
		Includes<AutoLanguageString, string>,
		And<
			Not<Includes<AutoDatatypeString, P_RDFS_LANGSTRING>>,
			Not<Includes<AutoDatatypeString, string>>
		>
	>,
	'',
	AutoLanguageString
>;

/**
 * ```ts
 * NormalizeLanguageDatatype<
 * 	LanguageString extends string|void,
 * 	DatatypeString extends string|void,
 * > => [string, string]
 * ```
 *
 * Deduces the proper value types for the .language and .datatype.value properties.
 * Gives precedence to `LanguageString` in case both arguments are specific, non-empty strings.
 *
 *     NormalizeLanguageDatatype<void, void>  // ['', P_XSD_STRING]
 *     NormalizeLanguageDatatype<'en', void>  // ['en', P_RDFS_LANGSTRING]
 *     NormalizeLanguageDatatype<'en', 'z://y/'>  // ['en', P_RDFS_LANGSTRING]
 *     NormalizeLanguageDatatype<void, 'z://y/'>  // ['', 'z://y/']
 *     NormalizeLanguageDatatype<string, 'z://y/'>  // ['', 'z://y/']
 *     NormalizeLanguageDatatype<'', 'z://y/'>  // ['', 'z://y/']
 */
type NormalizeLanguageDatatype<
	LanguageString extends string|void,
	DatatypeString extends string|void,
> = AutoString<LanguageString, ''> extends infer AutoLanguageString
	? (AutoDatatype<DatatypeString, AutoLanguageString> extends infer AutoDatatypeString
		? (NarrowLanguage<AutoLanguageString, AutoDatatypeString> extends infer NarrowLanguageString
			? [NarrowLanguageString, AutoDatatypeString]
			: never
		)
		: never
	)
	: never;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */

	// language takes precedence over datatype
	const VV: ASSERT_SAME<NormalizeLanguageDatatype<'en', 'z://'>, ['en', P_RDFS_LANGSTRING]> = 1;
	const VS: ASSERT_SAME<NormalizeLanguageDatatype<'en', string>, ['en', P_RDFS_LANGSTRING]> = 1;
	const VO: ASSERT_SAME<NormalizeLanguageDatatype<'en', void>, ['en', P_RDFS_LANGSTRING]> = 1;
	// even for unions
	const VU: ASSERT_SAME<NormalizeLanguageDatatype<'en', 'z://'|string>, ['en', P_RDFS_LANGSTRING]> = 1;

	// language unions make it thru
	const UV: ASSERT_SAME<NormalizeLanguageDatatype<'en'|'fr', 'z://'>, ['en'|'fr', P_RDFS_LANGSTRING]> = 1;
	const US: ASSERT_SAME<NormalizeLanguageDatatype<'en'|'fr', string>, ['en'|'fr', P_RDFS_LANGSTRING]> = 1;
	const UO: ASSERT_SAME<NormalizeLanguageDatatype<'en'|'fr', void>, ['en'|'fr', P_RDFS_LANGSTRING]> = 1;

	// empty string language
	const _V: ASSERT_SAME<NormalizeLanguageDatatype<'', 'z://'>, ['', 'z://']> = 1;
	const _S: ASSERT_SAME<NormalizeLanguageDatatype<'', string>, ['', string]> = 1;
	const _O: ASSERT_SAME<NormalizeLanguageDatatype<'', void>, ['', P_XSD_STRING]> = 1;

	// datatype unions make it thru
	const _U: ASSERT_SAME<NormalizeLanguageDatatype<'', 'z://'|'y://'>, ['', 'z://'|'y://']> = 1;
	const OU: ASSERT_SAME<NormalizeLanguageDatatype<void, 'z://'|'y://'>, ['', 'z://'|'y://']> = 1;
	const SU: ASSERT_SAME<NormalizeLanguageDatatype<string, 'z://'|'y://'>, ['', 'z://'|'y://']> = 1;

	// void language => ''
	const OV: ASSERT_SAME<NormalizeLanguageDatatype<void, 'z://'>, ['', 'z://']> = 1;
	const OS: ASSERT_SAME<NormalizeLanguageDatatype<void, string>, ['', string]> = 1;
	const OO: ASSERT_SAME<NormalizeLanguageDatatype<void, void>, ['', P_XSD_STRING]> = 1;

	/* eslint-enable @typescript-eslint/no-unused-vars */
}

{
	/* eslint-disable @typescript-eslint/no-unused-vars */

	type _ = '';
	type E = 'en';

	type V = 'z://';

	const V_: ASSERT_EQUAL<AutoDatatype<V, ''>, V> = 1;
	const VE: ASSERT_EQUAL<AutoDatatype<V, E>, P_RDFS_LANGSTRING> = 1;
	const VS: ASSERT_EQUAL<AutoDatatype<V, string>, V> = 1;

	const S_: ASSERT_STRING<AutoDatatype<string, ''>> = 1;
	const SE: ASSERT_EQUAL<AutoDatatype<string, E>, P_RDFS_LANGSTRING> = 1;
	const SS: ASSERT_STRING<AutoDatatype<string, string>> = 1;

	const O_: ASSERT_EQUAL<AutoDatatype<void, ''>, P_XSD_STRING> = 1;
	const OE: ASSERT_EQUAL<AutoDatatype<void, E>, P_RDFS_LANGSTRING> = 1;
	const OS: ASSERT_STRING<AutoDatatype<void, string>> = 1;

	/* eslint-enable @typescript-eslint/no-unused-vars */
}


type RawTermsEqual<
	DescriptorA extends TermDescriptor=TermDescriptor,
	DescriptorB extends TermDescriptor=TermDescriptor,

	TermTypeStringA extends string=DescriptorTermType<DescriptorA>,
	ValueStringA extends string=AutoString<DescriptorA[1]>,
	LanguageStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[2]>,
	DatatypeStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[3]>,

	TermTypeStringB extends string=DescriptorTermType<DescriptorB>,
	ValueStringB extends string=AutoString<DescriptorB[1]>,
	LanguageStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[2]>,
	DatatypeStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[3]>,
> = If<
		Not<ValidTermType<TermTypeKey, TermTypeStringA>>,
		InvalidTermTypeError<TermTypeStringA, boolean>,
		If<
			Not<ValidTermType<TermTypeKey, TermTypeStringB>>,
			InvalidTermTypeError<TermTypeStringB, boolean>,
			// (a|b).termType are strings in {valid-term-type-keys}
			And<
				StringsMatch<TermTypeStringA, TermTypeStringB>,
				StringsMatch<ValueStringA, ValueStringB>
			> extends infer TermTypeAndValueStringsMatch
				// (TermType|Value)StringsMatch := a.(termType|value) === b.(termType|value)
				// ? (Not<AsBool<TermTypeAndValueStringsMatch>> extends True
				? (TermTypeAndValueStringsMatch extends False
					// a.termType !== b.termType || a.value !== b.value
					? False
					// mixed termTypes and values
					: (Or<
						Equals<TermTypeStringA, 'Literal'>,
						Equals<TermTypeStringB, 'Literal'>
					> extends True
						// (a|b).termType === 'Literal'
						? ([
							...NormalizeLanguageDatatype<LanguageStringA, DatatypeStringA>,
							...NormalizeLanguageDatatype<LanguageStringB, DatatypeStringB>,
						] extends [
							infer NormalizeLanguageStringA, infer NormalizeDatatypeStringA,
							infer NormalizeLanguageStringB, infer NormalizeDatatypeStringB,
						]
							// AutoLanguageString = LanguageString || ''
							// AutoDatatypeString = AutoLanguageString? 'rdfs:langString': DatatypeString || 'xsd:string'
							// NarrowLanguageString = AutoDatatypeString !== 'rdfs:langString' && AutoLanguageString includes `string`? '': AutoLanguageString
							// Normalize(Language|Datatype)String = [NarrowLanguageString, AutoDatatypeString]
							? If<
								Or<
									Not<StringsMatch<AsString<NormalizeLanguageStringA>, AsString<NormalizeLanguageStringB>>>,
									Not<StringsMatch<AsString<NormalizeDatatypeStringA>, AsString<NormalizeDatatypeStringB>>>
								>,
								// a.language !== b.language || a.datatype !== b.datatype
								False,
								// return a.language === b.language && a.datatype === b.datatype
								And<
									AsBool<TermTypeAndValueStringsMatch>,
									And<
										StringsMatch<AsString<NormalizeLanguageStringA>, AsString<NormalizeLanguageStringB>>,
										StringsMatch<AsString<NormalizeDatatypeStringA>, AsString<NormalizeDatatypeStringB>>
									>
								>
							>
							: never
						)
						: AsBool<TermTypeAndValueStringsMatch>
						// : NodesMatch<
						// 	TermTypeStringA, ValueStringA,
						// 	TermTypeStringB, ValueStringB,
						// >
					)
				)
				: never
		>
	>;

export type TermsEqual<
	DescriptorA extends TermDescriptor=TermDescriptor,
	DescriptorB extends TermDescriptor=TermDescriptor,
> = ToPrimitiveBoolean<
		RawTermsEqual<DescriptorA, DescriptorB>
	>;


type ConditionalLiteralString<
	TermTypeString extends string,
	LanguageOrDatatypeString extends string|void,
> = 'Literal' extends TermTypeString
	? (LanguageOrDatatypeString extends undefined
		? string
		: LanguageOrDatatypeString
	)
	: void;


type CoreTermData<
	Descriptor extends TermDescriptor=TermDescriptor,
	TermTypeString extends string=DescriptorTermType<Descriptor, TrivialTypeKey>,
	ValueString extends string=AutoString<Descriptor[1]>,
> = FavorTermType<TermTypeString, TrivialTypeKey> extends infer FavorTermTypeString
	? {
		termType: FavorTermTypeString;
		value: ValueString;

		equals?(y_other: TermDataArgument): boolean;
	}
	: never;


type LiteralTermData<
	DescriptorA extends TermDescriptor=BypassDescriptor,

	// these are provided for descriptor inferencing
	TermTypeStringA extends string=DescriptorTermType<DescriptorA, LiteralTypeKey>,
	ValueStringA extends string=AutoString<DescriptorA[1]>,
	LanguageStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[2]>,
	DatatypeStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[3]>,
> = NormalizeLanguageDatatype<LanguageStringA, DatatypeStringA> extends [
	infer NormalizeLanguageStringA,
	infer NormalizeDatatypeStringA,
]
	? {
		termType: 'Literal';
		value: ValueStringA;

		language: NormalizeLanguageStringA;
		datatype: Datatype<AsString<NormalizeDatatypeStringA>>;

		equals?(y_other: TermDataArgument): boolean;
	}
	: never;


type SolveQuadDescriptor<
	Descriptor extends TermDescriptor,
> =
	QuadTypeKey extends Descriptor[0]
		? [
			QuadTypeKey,

		]
		: never;

type NormalizeQuadComponents = false;

type DescriptorMap<
	TermTypeString extends TermTypeKey,
	Descriptor extends TermDescriptor,
	RdfMode extends AllowedRdfMode=AutoString<Descriptor[8], RdfMode_11>,
> =
	Merge<
		// trivial, unvaluable term types
		{
			[K in Extract<TrivialTypeKey, UnvaluableTypeKey>]: [
				TermTypeString, '', void, void,
			];
		},
		Merge<
			// trivial, valuable term types
			{
				[K in Extract<TrivialTypeKey, ValuableTypeKey>]: [
					TermTypeString, AutoString<Descriptor[1]>, void, void,
				];
			},
			Merge<
				// literal
				{
					[K in LiteralTypeKey]: [
						LiteralTypeKey, AutoString<Descriptor[1]>,
						...NormalizeLanguageDatatype<Descriptor[2], Descriptor[3]>,
					];
				},
				// quad
				{
					[K in QuadTypeKey]: [
						QuadTypeKey, '', void, void,
						SolveDescriptor<AutoDescriptor<Descriptor[4]>, SubjectTypeKey<RdfMode>>,
						SolveDescriptor<AutoDescriptor<Descriptor[5]>, PredicateTypeKey<RdfMode>>,
						SolveDescriptor<AutoDescriptor<Descriptor[6]>, ObjectTypeKey<RdfMode>>,
						SolveDescriptor<AutoDescriptor<Descriptor[7]>, GraphTypeKey<RdfMode>>,
					];
				}
			>
		>
	>;

type SolveDescriptor<
	Descriptor extends TermDescriptor,
	Target extends TermTypeKey=TermTypeKey,
> =
	DescriptorTermType<Descriptor, Target> extends infer TermTypeString
		? (TermTypeString extends TermTypeKey
			? DescriptorMap<TermTypeString, Descriptor>[TermTypeString]
			: never
		)
		: never;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	type N = SolveDescriptor<[NamedNodeTypeKey]>;
	const N_0: ASSERT_EQUAL<N[0], NamedNodeTypeKey> = 1;
	const N_1: ASSERT_STRING<N[1]> = 1;
	const N_2: ASSERT_VOID<N[2]> = 1;
	const N_3: ASSERT_VOID<N[3]> = 1;

	type Nv = SolveDescriptor<[NamedNodeTypeKey, 'A']>;
	const Nv0: ASSERT_EQUAL<Nv[0], NamedNodeTypeKey> = 1;
	const Nv1: ASSERT_EQUAL<Nv[1], 'A'> = 1;
	const Nv2: ASSERT_VOID<Nv[2]> = 1;
	const Nv3: ASSERT_VOID<Nv[3]> = 1;

	type B = SolveDescriptor<[BlankNodeTypeKey]>;
	const B_0: ASSERT_EQUAL<B[0], BlankNodeTypeKey> = 1;
	const B_1: ASSERT_STRING<B[1]> = 1;
	const B_2: ASSERT_VOID<B[2]> = 1;
	const B_3: ASSERT_VOID<B[3]> = 1;

	type Bv = SolveDescriptor<[BlankNodeTypeKey, 'A']>;
	const Bv0: ASSERT_EQUAL<Bv[0], BlankNodeTypeKey> = 1;
	const Bv1: ASSERT_EQUAL<Bv[1], 'A'> = 1;
	const Bv2: ASSERT_VOID<Bv[2]> = 1;
	const Bv3: ASSERT_VOID<Bv[3]> = 1;

	type L = SolveDescriptor<[LiteralTypeKey]>;
	const L_0: ASSERT_EQUAL<L[0], LiteralTypeKey> = 1;
	const L_1: ASSERT_STRING<L[1]> = 1;
	const L_2: ASSERT_EQUAL<L[2], ''> = 1;
	const L_3: ASSERT_EQUAL<L[3], P_XSD_STRING> = 1;

	type Lv = SolveDescriptor<[LiteralTypeKey, 'A']>;
	const Lv0: ASSERT_EQUAL<Lv[0], LiteralTypeKey> = 1;
	const Lv1: ASSERT_EQUAL<Lv[1], 'A'> = 1;
	const Lv2: ASSERT_EQUAL<Lv[2], ''> = 1;
	const Lv3: ASSERT_EQUAL<Lv[3], P_XSD_STRING> = 1;

	type Lvv = SolveDescriptor<[LiteralTypeKey, 'A', 'en']>;
	const Lvv0: ASSERT_EQUAL<Lvv[0], LiteralTypeKey> = 1;
	const Lvv1: ASSERT_EQUAL<Lvv[1], 'A'> = 1;
	const Lvv2: ASSERT_EQUAL<Lvv[2], 'en'> = 1;
	const Lvv3: ASSERT_EQUAL<Lvv[3], P_RDFS_LANGSTRING> = 1;

	type G = SolveDescriptor<[DefaultGraphTypeKey]>;
	const G_0: ASSERT_EQUAL<G[0], DefaultGraphTypeKey> = 1;
	const G_1: ASSERT_EQUAL<G[1], ''> = 1;
	const G_2: ASSERT_VOID<G[2]> = 1;
	const G_3: ASSERT_VOID<G[3]> = 1;

	type R = SolveDescriptor<[VariableTypeKey]>;
	const R_0: ASSERT_EQUAL<R[0], VariableTypeKey> = 1;
	const R_1: ASSERT_STRING<R[1]> = 1;
	const R_2: ASSERT_VOID<R[2]> = 1;
	const R_3: ASSERT_VOID<R[3]> = 1;

	const NmO_N: ASSERT_SAME<N, SolveDescriptor<[void], NamedNodeTypeKey>> = 1;
	const BmO_B: ASSERT_SAME<B, SolveDescriptor<[void], BlankNodeTypeKey>> = 1;
	const LmO_L: ASSERT_SAME<L, SolveDescriptor<[void], LiteralTypeKey>> = 1;
	const GmO_G: ASSERT_SAME<G, SolveDescriptor<[void], DefaultGraphTypeKey>> = 1;
	const RmO_R: ASSERT_SAME<R, SolveDescriptor<[void], VariableTypeKey>> = 1;


	type NL = SolveDescriptor<[NamedNodeTypeKey | LiteralTypeKey]>;
	const NL_0: ASSERT_SAME<NL[0], NamedNodeTypeKey | LiteralTypeKey> = 1;
	const NL_1: ASSERT_STRING<NL[1]> = 1;
	const NL_2: ASSERT_SAME<NL[2], void | ''> = 1;
	const NL_3: ASSERT_SAME<NL[3], void | P_XSD_STRING> = 1;

	type Q = SolveDescriptor<[QuadTypeKey]>;
	const Q_0: ASSERT_SAME<Q[0], QuadTypeKey> = 1;
	const Q_4: ASSERT_SAME<Q[4][0], SubjectTypeKey> = 1;
	const Q_5: ASSERT_SAME<Q[5][0], PredicateTypeKey> = 1;
	const Q_6: ASSERT_SAME<Q[6][0], ObjectTypeKey> = 1;
	const Q_7: ASSERT_SAME<Q[7][0], GraphTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}

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
type FilterDescriptor<
	Descriptor extends TermDescriptor,
	Target extends TermTypeKey,
	TermTypeSring extends TermTypeKey=DescriptorTermType<Descriptor, Target>,
> = [Extract<TermTypeSring, Target>, ...List.Omit<Descriptor, 0>] extends infer NewDescriptor
	? (NewDescriptor extends TermDescriptor<Target>
		? NewDescriptor
		: never
	)
	: never;


type QuadTermData<
	DescriptorA extends TermDescriptor=BypassDescriptor,

	// // these are provided for descriptor inferencing
	// TermTypeStringA extends string=DescriptorTermType<DescriptorA, QuadTypeKey>,
	// ValueStringA extends string=AutoString<DescriptorA[1]>,
	// LanguageStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[2]>,
	// DatatypeStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[3]>,

	// SubjectDescriptorA extends TermDescriptor=DescriptorQuadComponent<DescriptorA, 4>,
	// PredicateDescriptorA extends TermDescriptor=DescriptorQuadComponent<DescriptorA, 5>,
	// ObjectDescriptorA extends TermDescriptor=DescriptorQuadComponent<DescriptorA, 6>,
	// GraphDescriptorA extends TermDescriptor=DescriptorQuadComponent<DescriptorA, 7>,

	// RdfMode extends AllowedRdfMode=AutoString<DescriptorA[8], RdfMode_11>,
> = SolveDescriptor<DescriptorA, QuadTypeKey> extends infer Solved
		? {
			termType: QuadTypeKey;
			value: '';

			subject: SubjectData<DescriptorQuadComponent<Solved, 4>, RdfMode>;
			predicate: PredicateData<PredicateDescriptorA, RdfMode>;
			object: ObjectData<ObjectDescriptorA, RdfMode>;
			graph: GraphData<GraphDescriptorA, RdfMode>;

			equals?(y_other: TermDataArgument): boolean;
		}
		: never;

type TermTypeMap<
	Descriptor extends TermDescriptor=BypassDescriptor,
	// TermTypeString extends TermTypeKey=DescriptorTermType<Descriptor, TermTypeKey>,
> = {
	NamedNode: CoreTermData<FilterDescriptor<Descriptor, NamedNodeTypeKey>>;
	BlankNode: CoreTermData<FilterDescriptor<Descriptor, BlankNodeTypeKey>>;
	Variable: CoreTermData<FilterDescriptor<Descriptor, VariableTypeKey>>;
	DefaultGraph: CoreTermData<FilterDescriptor<Descriptor, DefaultGraphTypeKey>>;
	Literal: LiteralTermData<FilterDescriptor<Descriptor, LiteralTypeKey>>;
	Quad: QuadTermData<FilterDescriptor<Descriptor, QuadTypeKey>>;
};

export type TermData<
	Descriptor extends TermDescriptor=BypassDescriptor,
	TermTypeString extends TermTypeKey=DescriptorTermType<Descriptor, TermTypeKey>,
> = TermTypeString extends keyof TermTypeMap
	? TermTypeMap<Descriptor>[TermTypeString]
	: never;

export type TermDataArgument<
	Descriptor extends TermDescriptor=BypassDescriptor,
> = DescriptorTermType<Descriptor, string> extends infer TermTypeString
	? TermTypeString extends TermTypeKey
		? TermData<Descriptor>
		: {
			termType: string;
			value: string;

			language?: string;
			datatype?: Datatype;
		}
	: never;


type Term<
	DescriptorA extends TermDescriptor=BypassDescriptor,
> = Merge<
	TermData<DescriptorA>,
	DescriptorA extends BypassDescriptor
		? {
			equals(y_other: TermDataArgument): boolean;
		}
		: {
			equals<
				DescriptorB extends TermDescriptor=BypassDescriptor,

				// forward descriptor inferencing
				TermTypeStringB extends string=DescriptorTermType<DescriptorB>,
				ValueStringB extends string=AutoString<DescriptorB[1]>,
				LanguageStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[2]>,
				DatatypeStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[3]>,

				SubjectDescriptorB extends TermDescriptor=DescriptorQuadComponent<DescriptorB, 4>,
				PredicateDescriptorB extends TermDescriptor=BypassDescriptor,
				ObjectDescriptorB extends TermDescriptor=BypassDescriptor,
				GraphDescriptorB extends TermDescriptor=BypassDescriptor,
			>(y_other: DescriptorB extends BypassDescriptor
				? TermData
				: TermData<DescriptorB> | Term<DescriptorB>
			): DescriptorB extends BypassDescriptor
				? boolean
				: TermsEqual<
					DescriptorA,
					// [TermTypeStringA, ValueStringA, LanguageStringA, DatatypeStringA],
					DescriptorB
					// [TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB],
				>;
		}
>;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */

	// basic fully compatible quad
	type d_BNLD = ['Quad', '', void, void, ['BlankNode'], ['NamedNode'], ['Literal' | 'NamedNode'], ['DefaultGraph']];
	type BNLD = QuadTermData<d_BNLD>;

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
	type QQQQs = QuadTermData<['Quad', '', void, void, d_BNLD, ['NamedNode'], d_BNLD, ['NamedNode'], RdfMode_star]>;

	type QQQQs_s = QQQQs['subject'];
	const QQQQs_st: ASSERT_EQUAL<QQQQs_s['termType'], 'Quad'> = 1;
	const QQQQs_sv: ASSERT_EQUAL<QQQQs_s['value'], ''> = 1;


	// easier-rdf
	type QQQQe = QuadTermData<['Quad', '', void, void, d_BNLD, d_BNLD, d_BNLD, d_BNLD, RdfMode_easier]>;

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


	type LBDV = QuadTermData<['Quad', '', void, void, ['Literal'], ['BlankNode'], ['DefaultGraph'], ['Variable']]>;

	type GenericCoreTerm = CoreTermData<TermDescriptor, string>;

	type ValidGenericQuad = QuadTermData<['Quad', '', void, void, [SubjectTypeKey], [PredicateTypeKey], [ObjectTypeKey], [GraphTypeKey]]>;

	type AnyGenericQuad = QuadTermData<[
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



type SafeTermType<
	Descriptor extends TermDescriptor,
	KeysSet extends TermTypeKey,
	Category extends string=Join<Union.ListOf<KeysSet>, ', '>,
	TermTypeString extends string=DescriptorTermType<Descriptor>,
> = TermTypeString extends KeysSet
	? (TermTypeString extends keyof TermTypeMap
		? TermTypeMap<Descriptor>[TermTypeString]
		: never
	)
	: IncompatibleTermTypeError<TermTypeString, Category, CoreTermData>;

type AllowedTermType<
	Descriptor extends TermDescriptor,
	KeysSet extends TermTypeKey,
	Category extends string=Join<Union.ListOf<KeysSet>, ', '>,
	TermTypeString extends string=DescriptorTermType<Descriptor>,
> = TermTypeString extends KeysSet
	? TermTypeMap<Descriptor>[TermTypeString]
	: InvalidTermTypeError<TermTypeString, CoreTermData>;

type BlankNodeTermData<
	Descriptor extends TermDescriptor,
	Category extends string='a blank node',
> = SafeTermType<Descriptor, 'BlankNode', Category>

type NamedNodeTermData<
	Descriptor extends TermDescriptor,
	Category extends string='a named node',
> = SafeTermType<Descriptor, 'NamedNode', Category>

type NodeTermData<
	Descriptor extends TermDescriptor,
	Category extends string='a node type',
> = SafeTermType<Descriptor, NodeTypeKey, Category>


type DatatypeTermData<
	Descriptor extends TermDescriptor,
> = NamedNodeTermData<Descriptor, 'a datatype'>;

type CategorySubjectPosition = 'the subject position';
type CategoryPredicatePosition = 'the predicate position';
type CategoryObjectPosition = 'the object position';
type CategoryGraphPosition = 'the graph position';

type ExplainPosition<
	Category extends string,
	RdfMode extends AllowedRdfMode,
> = `${Category} in ${DescribeRdfMode<RdfMode>}`;

export type SubjectData<
	Descriptor extends TermDescriptor,
	RdfMode extends AllowedRdfMode=RdfMode_11,
	Category extends string=ExplainPosition<CategorySubjectPosition, RdfMode>,
> = RdfMode extends RdfMode_11
	? NodeTermData<Descriptor, Category>
	: (RdfMode extends RdfMode_star
		? SafeTermType<Descriptor, NodeTypeKey | QuadTypeKey, Category>
		: AllowedTermType<Descriptor, TermTypeKey>
	);

type PredicateData<
	Descriptor extends TermDescriptor,
	RdfMode extends AllowedRdfMode=RdfMode_11,
	Category extends string=ExplainPosition<CategoryPredicatePosition, RdfMode>,
> = RdfMode extends RdfMode_11 | RdfMode_star
	? NamedNodeTermData<Descriptor, Category>
	: AllowedTermType<Descriptor, TermTypeKey>;

type ObjectData<
	Descriptor extends TermDescriptor,
	RdfMode extends AllowedRdfMode=RdfMode_11,
	Category extends string=ExplainPosition<CategoryObjectPosition, RdfMode>,
> = RdfMode extends RdfMode_11
	? SafeTermType<Descriptor, ObjectTypeKey, Category>
	: RdfMode extends RdfMode_star
		? SafeTermType<Descriptor, ObjectTypeKey | QuadTypeKey, Category>
		: AllowedTermType<Descriptor, TermTypeKey>;

type GraphData<
	Descriptor extends TermDescriptor,
	RdfMode extends AllowedRdfMode=RdfMode_11,
	Category extends string=ExplainPosition<CategoryGraphPosition, RdfMode>,
> = RdfMode extends RdfMode_11 | RdfMode_star
	? SafeTermType<Descriptor, GraphTypeKey, Category>
	: AllowedTermType<Descriptor, TermTypeKey>;


type BypassTermType = Type<void, 'Bypass'>

type BypassDescriptor = [BypassTermType];

type BasicTermEquals = {
	equals(y_other: TermData): boolean;
};

// type PlainTermEquals<
// 	TermTypeStringA extends string,
// 	ValueStringA extends string,
// 	LanguageStringA extends string|void,
// 	DatatypeStringA extends string|void,
// > = {
// 	equals<
// 		DescriptorB extends TermDescriptor=BypassDescriptor,

// 		// forward descriptor inferencing
// 		TermTypeStringB extends string=DescriptorB[0] extends BypassTermType? string: DescriptorB[0],
// 		ValueStringB extends string=AutoString<DescriptorB[1]>,
// 		LanguageStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[2]>,
// 		DatatypeStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[3]>,
// 	>(y_other: DescriptorB extends BypassDescriptor
// 		? TermData
// 		: (TermData<DescriptorB, TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB>
// 			| Term<DescriptorB, TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB>
// 		)
// 	): DescriptorB extends BypassDescriptor
// 		? boolean
// 		: TermsEqual<
// 			// DescriptorA
// 			[TermTypeStringA, ValueStringA, LanguageStringA, DatatypeStringA],
// 			// DescriptorB
// 			[TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB],
// 		>;
// };

// type QuadTermEquals<
// 	SubjectTermTypeString extends string|void,
// 	SubjectValueTypeString extends string|void,
// 	PredicateTermTypeTypeString extends string|void,
// 	PredicateValueTypeString extends string|void,
// 	ObjectTermTypeString extends string|void,
// 	ObjectValueString extends string|void,
// 	ObjectLanguageString extends string|void,
// 	ObjectDatatypeTypeString extends string|void,
// 	GraphTermTypeString extends string|void,
// 	GraphValueString extends string|void,
// > = {
// 	equals<
// 		DescriptorB extends TermDescriptor=BypassDescriptor,

// 		// forward descriptor inferencing
// 		TermTypeStringB extends string=DescriptorB[0] extends BypassTermType? string: DescriptorB[0],
// 		ValueStringB extends string=AutoString<DescriptorB[1]>,
// 		LanguageStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[2]>,
// 		DatatypeStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[3]>,

// 		SubjectTermTypeStringB extends string|void=ConditionalQuadString<TermTypeStringB, DescriptorB[4]>,
// 		SubjectValueTypeStringB extends string|void=ConditionalQuadString<TermTypeStringB, DescriptorB[5]>,
// 		PredicateTermTypeTypeStringB extends string|void=ConditionalQuadString<TermTypeStringB, DescriptorB[6]>,
// 		PredicateValueTypeStringB extends string|void=ConditionalQuadString<TermTypeStringB, DescriptorB[7]>,
// 		ObjectTermTypeStringB extends string|void=ConditionalQuadString<TermTypeStringB, DescriptorB[8]>,
// 		ObjectValueStringB extends string|void=ConditionalQuadString<TermTypeStringB, DescriptorB[9]>,
// 		ObjectLanguageStringB extends string|void=ConditionalQuadString<TermTypeStringB, ConditionalLiteralString<AsString<ObjectTermTypeString>, DescriptorB[10]>>,
// 		ObjectDatatypeTypeStringB extends string|void=ConditionalQuadString<TermTypeStringB, ConditionalLiteralString<AsString<ObjectTermTypeString>, DescriptorB[11]>>,
// 		GraphTermTypeStringB extends string|void=ConditionalQuadString<TermTypeStringB, DescriptorB[12]>,
// 		GraphValueStringB extends string|void=ConditionalQuadString<TermTypeStringB, DescriptorB[13]>,
// 	>(y_other: DescriptorB extends BypassDescriptor
// 		? TermData
// 		: (TermData<DescriptorB, TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB>
// 			| Term<DescriptorB, TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB>
// 		)
// 	): DescriptorB extends BypassDescriptor
// 		? boolean
// 		: TermsEqual<
// 			// DescriptorA
// 			[TermTypeStringA, ValueStringA, LanguageStringA, DatatypeStringA],
// 			// DescriptorB
// 			[TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB],
// 		>;
// };

type ConditionalQuadString<
	TermTypeString extends string,
	ComponentString extends string|void,
> = 'Quad' extends TermTypeString
	? (ComponentString extends undefined
		? string
		: ComponentString
	)
	: void;

// export type Term<
// 	DescriptorA extends TermDescriptor=BypassDescriptor,

// 	// these are provided for descriptor inferencing
// 	TermTypeStringA extends string=DescriptorA[0] extends BypassTermType? string: DescriptorA[0],
// 	ValueStringA extends string=AutoString<DescriptorA[1]>,
// 	LanguageStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[2]>,
// 	DatatypeStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[3]>,

// 	SubjectTermTypeString extends string|void=ConditionalQuadString<TermTypeStringA, DescriptorA[4]>,
// 	SubjectValueTypeString extends string|void=ConditionalQuadString<TermTypeStringA, DescriptorA[5]>,
// 	PredicateTermTypeTypeString extends string|void=ConditionalQuadString<TermTypeStringA, DescriptorA[6]>,
// 	PredicateValueTypeString extends string|void=ConditionalQuadString<TermTypeStringA, DescriptorA[7]>,
// 	ObjectTermTypeString extends string|void=ConditionalQuadString<TermTypeStringA, DescriptorA[8]>,
// 	ObjectValueString extends string|void=ConditionalQuadString<TermTypeStringA, DescriptorA[9]>,
// 	ObjectLanguageString extends string|void=ConditionalQuadString<TermTypeStringA, ConditionalLiteralString<AsString<ObjectTermTypeString>, DescriptorA[10]>>,
// 	ObjectDatatypeTypeString extends string|void=ConditionalQuadString<TermTypeStringA, ConditionalLiteralString<AsString<ObjectTermTypeString>, DescriptorA[11]>>,
// 	GraphTermTypeString extends string|void=ConditionalQuadString<TermTypeStringA, DescriptorA[12]>,
// 	GraphValueString extends string|void=ConditionalQuadString<TermTypeStringA, DescriptorA[13]>,
// > = Merge<
// 	// Pick<
// 		TermData<
// 			DescriptorA
// 			// [TermTypeStringA, ValueStringA, LanguageStringA, DatatypeStringA],
// 			// TermTypeStringA,
// 			// ValueStringA,
// 			// LanguageStringA,
// 			// DatatypeStringA,
// 		>
// 		// 'termType' | 'value' | (
// 		// 	// only include language and datatype keys if termType can be 'Literal'
// 		// 	'Literal' extends TermTypeStringA
// 		// 		? 'language' | 'datatype'
// 		// 		: 'termType'
// 		// ),
// 	// >
// 	,
// 	DescriptorA extends BypassDescriptor
// 		? BasicTermEquals
// 		: (
// 			TermTypeStringA extends 'Quad'
// 				? ('Quad' extends TermTypeStringA
// 					// quad
// 					? QuadTermEquals<
// 						SubjectTermTypeString,
// 						SubjectValueTypeString,
// 						PredicateTermTypeTypeString,
// 						PredicateValueTypeString,
// 						ObjectTermTypeString,
// 						ObjectValueString,
// 						ObjectLanguageString,
// 						ObjectDatatypeTypeString,
// 						GraphTermTypeString,
// 						GraphValueString
// 					>
// 					// union termType, take easy way uot
// 					: BasicTermEquals
// 				)
// 				: PlainTermEquals<TermTypeStringA, ValueStringA, LanguageStringA, DatatypeStringA>
// 		)
// >;

{
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
			DescriptorB extends TermDescriptor,
			ReturnType extends TermsEqual,
		>(y_other: TermData<DescriptorB>): ReturnType {
			return (this.termType === y_other.termType && this.value === y_other.value) as ReturnType;
		},
	};

	const MLv: Term<DNv> = {
		termType: 'NamedNode',
		value: 'z://',
		equals<
			DescriptorB extends TermDescriptor,
			ReturnType extends TermsEqual,
		>(y_other: TermData<DescriptorB>): ReturnType {
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
	ValueString extends string=string,
> = Term<['NamedNode', ValueString]>;

export type BlankNode<
	ValueString extends string=string,
> = Term<['BlankNode', ValueString]>;

export type Literal<
	ValueString extends string=string,
	LanguageString extends string|void=string,
	DatatypeString extends string|void=string,
> = Term<['Literal', ValueString, LanguageString, DatatypeString]>;

export type DefaultGraph = Term<['DefaultGraph', '']>;

export type Variable<
	ValueString extends string=string,
> = Term<['Variable', ValueString]>;

export type Datatype<
	DatatypeString extends string=string,
> = NamedNode<DatatypeString>;

export type Node<
	TermTypeString extends string=TermTypeKey,
	ValueString extends string=string,
> = FavorTermType<TermTypeString> extends infer FavorTermTypeString
	? (FavorTermTypeString extends NodeTypeKey
		? {
			[K in NodeTypeKey]: Term<[FavorTermTypeString, ValueString]>
		}[FavorTermTypeString]
		: never
	)
	: never;

export type Subject<
	TermTypeString extends string=string,
	ValueString extends string=string,
> = Node<TermTypeString, ValueString>;

export type Predicate<
	TermTypeString extends string=string,
	ValueString extends string=string,
> = TermTypeString extends `${infer ActualTermTypeString}`
	? (TermTypeString extends 'NamedNode'
		? NamedNode<ValueString>
		: never
	)
	: NamedNode<ValueString>;

export type Object<
	TermTypeString extends string=string,
	ValueString extends string=string,
	LanguageString extends string=string,
	DatatypeString extends string=string,
> = Node<TermTypeString, ValueString>
	| Literal<TermTypeString, ValueString, LanguageString, DatatypeString>;

export type Graph<
	TermTypeString extends string=string,
	ValueString extends string=string,
> = TermTypeString extends `${infer ActualTermTypeString}`
	? Node<ActualTermTypeString, ValueString> | DefaultGraph<ActualTermTypeString>
	: Node<TermTypeString, ValueString> | DefaultGraph;




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
// 	LanguageStringA extends string,
// 	DatatypeStringA extends string,

// 	SubjectTermTypeStringA extends string,
// 	SubjectValueStringA extends string,
// 	PredicateTermTypeStringA extends string,
// 	PredicateValueStringA extends string,
// 	ObjectTermTypeStringA extends string,
// 	ObjectValueStringA extends string,
// 	ObjectLanguageStringA extends string,
// 	ObjectDatatypeStringA extends string,
// 	GraphTermTypeStringA extends string,
// 	GraphValueStringA extends string,

// 	TermTypeStringB extends string,
// 	ValueStringB extends string,
// 	LanguageStringB extends string,
// 	DatatypeStringB extends string,

// 	SubjectTermTypeStringB extends string,
// 	SubjectValueStringB extends string,
// 	PredicateTermTypeStringB extends string,
// 	PredicateValueStringB extends string,
// 	ObjectTermTypeStringB extends string,
// 	ObjectValueStringB extends string,
// 	ObjectLanguageStringB extends string,
// 	ObjectDatatypeStringB extends string,
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
// 			ObjectLanguageStringA,
// 			ObjectDatatypeStringA,
// 			ObjectTermTypeStringB,
// 			ObjectValueStringB,
// 			ObjectLanguageStringB,
// 			ObjectDatatypeStringB,
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
// 	ObjectLanguageStringA extends string=string,
// 	ObjectDatatypeStringA extends string=string,
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
// 		// ObjectLanguageStringB extends string=string,
// 		// ObjectDatatypeStringB extends string=string,
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
// 									StringsMatch<ObjectLanguageString, OtherObjectLanguageString>
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
// 								OtherObjectLanguageString,
// 								OtherObjectDatatypeString,
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
// 	object: Object<ObjectTermTypeString, ObjectValueString, ObjectLanguageString, ObjectDatatypeString>;
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
