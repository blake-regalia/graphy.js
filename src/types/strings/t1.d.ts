import {
	PrefixMap
} from '../const';

import {
	V1_DefaultGraph,
	V1_LabeledBlankNode,
	V1_SimpleLiteral,
	V1_LanguagedLiteral,
	V1_DatatypedLiteral,
	V1_Variable,
} from './v1';


/**
 * Terse term string for DefaultGraph terms
 */
export type T1_DefaultGraph = V1_DefaultGraph;


/**
 * Terse term string for NamedNode terms
 */
export type T1_NamedNode<
	p_iri extends string=string,
	h_prefixes extends PrefixMap={},
> = TersifyIri<p_iri, h_prefixes>;


/**
 * Terse term string for LabeledBlankNode terms
 */
export type T1_LabeledBlankNode<
	s_label extends string=string,
> = V1_LabeledBlankNode<s_label>;


/**
 * Terse term string for AnonymousBlankNode terms
 */
export type T1_AnonymousBlankNode<
	s_id extends string=string,
> = V1_LabeledBlankNode<s_id>;


/**
 * Terse term string for SimpleLiteral terms
 */
export type T1_SimpleLiteral<
	s_content extends string=string,
> = V1_SimpleLiteral<s_content>;


/**
 * Terse term string for LanguagedLiteral terms
 */
export type T1_LanguagedLiteral<
	s_content extends string=string,
	s_language extends string=string,
> = V1_LanguagedLiteral<s_content, s_language>;


/**
 * Terse term string for DatatypedLiteral terms
 */
export type T1_DatatypedLiteral<
	s_content extends string=string,
	p_datatype extends string=string,
	h_prefixes extends PrefixMap={},
> = `"${EscapeTerseLiteralContent<s_content>}"^^${T1_NamedNode<p_datatype, h_prefixes>}`;


/**
 * Terse term string for Variable terms
 */
export type T1_Variable<
	s_name extends string=string,
> = V1_Variable<s_name>;


/**
 * Terse term string for Quad terms
 */
export type T1_Quad<
	st1_subject extends string=string,
	st1_predicate extends string=string,
	st1_object extends string=string,
	st1_graph extends string=string,
> = `${st1_subject} ${st1_predicate} ${st1_object}${string extends st1_graph? string: st1_graph extends ''? '': ` ${st1_graph}`} .`;

