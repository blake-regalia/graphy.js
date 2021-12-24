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
   SubjectTypeKey,
   PredicateTypeKey,
   ObjectTypeKey,
   GraphTypeKey,
   QuadTypeKey,
} from './key';

import {
   SubjectData,
   PredicateData,
   ObjectData,
   GraphData,
   QuadData,
} from './data';


/**
 * Type for subject argument
 */
export type SubjectArg<
	s_mode extends SupportedRdfMode=SupportedRdfMode,
> = SubjectData<FromQualifier<[SubjectTypeKey<s_mode>]>, s_mode>;

/**
 * Type for predicate argument
 */
export type PredicateArg<
	s_mode extends SupportedRdfMode = SupportedRdfMode,
> = PredicateData<FromQualifier<[PredicateTypeKey<s_mode>]>, s_mode>;

/**
 * Type for object argument
 */
export type ObjectArg<
	s_mode extends SupportedRdfMode=SupportedRdfMode,
> = ObjectData<FromQualifier<[ObjectTypeKey<s_mode>]>, s_mode>;

/**
 * Type for graph argument
 */
export type GraphArg<
	s_mode extends SupportedRdfMode = SupportedRdfMode,
> = GraphData<FromQualifier<[GraphTypeKey<s_mode>]>, s_mode>;

/**
 * Type for quad argument
 */
export type QuadArg<
	s_mode extends SupportedRdfMode = SupportedRdfMode,
> = QuadData<FromQualifier<{termType:QuadTypeKey; mode:s_mode}>>;

