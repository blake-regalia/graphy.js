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
   TermTypeKey,
   DefaultGraphTypeKey,
   NamedNodeTypeKey,
   BlankNodeTypeKey,
   LiteralTypeKey,
   VariableTypeKey,
   QuadTypeKey,
} from './key';

import {
   Term,
   NamedNode,
   BlankNode,
} from './graphy';


type ExpandC1Node<
	sc1_node extends string=string,
	h_prefixes extends PrefixMap={},
> = string extends sc1_node
	? NamedNode | BlankNode
	: sc1_node extends `>${infer p_iri}`
		? p_iri
	: sc1_node extends `${infer si_prefix}:${infer s_suffix}`
		? (si_prefix extends keyof h_prefixes
			? `${h_prefixes[si_prefix]}${s_suffix}`
			// prefix not defined
			: never
		)
		: never;


/**
 * Parses a C1 string into a Term
 */
export type ParseC1<
	sc1_term extends string=string,
	h_prefixes extends PrefixMap={},
> = string extends sc1_term
		? void
	: sc1_term extends '*'
		? {
			termType: DefaultGraphTypeKey;
			value: '';
		}
	: sc1_term extends 'a'
		? {
			termType: NamedNodeTypeKey;
			value: P_RDF_TYPE;
		}
	: sc1_term extends `>${infer p_iri}`
		? {
			termType: NamedNodeTypeKey;
			value: p_iri;
		}
	: sc1_term extends `#${infer s_label}`
		? {
			termType: BlankNodeTypeKey;
			value: s_label extends `#${string}`? '': s_label;
		}
	: sc1_term extends `"${infer s_content}`
		? {
			termType: LiteralTypeKey;
			value: s_content;
		}
	: sc1_term extends `@${infer s_language}"${infer s_content}`
		? {
			termType: LiteralTypeKey;
			value: s_content;
			language: s_language;
		}
	: sc1_term extends `^${infer sc1_datatype}"${infer s_content}`
		? (ExpandC1Node<sc1_datatype, h_prefixes> extends infer p_datatype
			? (p_datatype extends string
				? (p_datatype extends void
					? never
					: {
						termType: LiteralTypeKey;
						value: s_content;
						datatype: p_datatype;
					}
				)
				: never
			)
			: never
		)
	: sc1_term extends `?${infer s_name}`
		? {
			termType: VariableTypeKey;
			value: s_name;
		}
	: sc1_term extends `\f${infer sc1_graph}\r${infer sc1_subject}\n${infer sc1_predicate}\t${infer sc1_object}`
		? {
			termType: QuadTypeKey;
			graph: sc1_graph extends string
				? ParseC1<sc1_graph> extends infer g_graph
					? g_graph extends Qualifier
						? FromQualifier<g_graph>
						: never
					: never
				: never;
			
			subject: sc1_subject extends string
				? ParseC1<sc1_subject> extends infer g_subject
					? g_subject extends Qualifier
						? FromQualifier<g_subject>
						: never
					: never
				: never;
			
			predicate: sc1_predicate extends string
				? ParseC1<sc1_predicate> extends infer g_predicate
					? g_predicate extends Qualifier
						? FromQualifier<g_predicate>
						: never
					: never
				: never;
			
			object: sc1_object extends string
				? ParseC1<sc1_object> extends infer g_object
					? g_object extends Qualifier
						? FromQualifier<g_object>
						: never
					: never
				: never;	
		}
	: sc1_term extends `\`${infer sx_directive}`
		? never
	: ExpandC1Node<sc1_term, h_prefixes> extends infer sa1_term
		? sa1_term extends string
			? sa1_term extends void
				? never
				: {
					termType: NamedNodeTypeKey;
					value: sa1_term;
				}
			: never
		: never;
	

export type TermFromC1<
	sc1_term extends string=string,
	h_prefixes extends PrefixMap={},
> = string extends sc1_term
	? Term<{
		termType: TermTypeKey;
		value: string;
		mode: SupportedRdfMode;
	}>
	: ParseC1<sc1_term, h_prefixes> extends infer g_term
		? g_term extends Qualifier
			? Term<g_term>
			: never
		: never;
		
// type testttt = TermFromC1<'prisnr:type', {
// 	prisnr: 'https://prisnr.games/';
// }>['value'];

// type t2 = TermFromC1<string>['termType'];

// type integer = TermFromC1<'^xsd:integer"54', {
// 	xsd: P_XSD;
// }>['number']
