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
	V1_DefaultGraph,
	V1_NamedNode,
	V1_LabeledBlankNode,
	V1_AnonymousBlankNode,
	V1_SimpleLiteral,
	V1_LanguagedLiteral,
	V1_DatatypedLiteral,
	V1_Variable,
	V1_Quad,
} from '../strings/v1';

import {
	A1_DefaultGraph,
	A1_NamedNode,
	A1_LabeledBlankNode,
	A1_AnonymousBlankNode,
	A1_SimpleLiteral,
	A1_LanguagedLiteral,
	A1_DatatypedLiteral,
	A1_Variable,
	A1_Quad,
} from '../strings/a1';

import {
	C1_DefaultGraph,
	C1_NamedNode,
	C1_LabeledBlankNode,
	C1_AnonymousBlankNode,
	C1_SimpleLiteral,
	C1_LanguagedLiteral,
	C1_DatatypedLiteral,
	C1_Variable,
	C1_Quad,
} from '../strings/c1';

import { T1_DatatypedLiteral, T1_LabeledBlankNode, T1_LanguagedLiteral, T1_NamedNode, T1_SimpleLiteral } from '../strings/t1';
import { ParseInteger } from '../integer';


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
