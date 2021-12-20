import {
   EscapeTerseLiteralContent,
} from './common';


/**
 * Verbose term string for DefaultGraph terms
 */
export type V1_DefaultGraph = '';


/**
 * Verbose term string for NamedNode terms
 */
export type V1_NamedNode<
	s_value extends string=string,
> = string extends s_value
	? `<${Iri}>`
	: p_iri extends Iri
		? `<${p_iri}>`
		: never;


/**
 * Verbose term string for LabeledBlankNode terms
 */
export type V1_LabeledBlankNode<
	s_label extends string=string,
> = string extends s_label
	? `_:${Label}`
	: s_label extends Label
		? `_:${s_label}`
		: never;


/**
 * Verbose term string for AnonymousBlankNode terms
 */
export type V1_AnonymousBlankNode<
	s_id extends string=string,
> = `[]`;


/**
 * Verbose term string for SimpleLiteral terms
 */
export type V1_SimpleLiteral<
	s_content extends string=string,
> = `"${EscapeTerseLiteralContent<s_content>}"`;


/**
 * Verbose term string for LanguagedLiteral terms
 */
export type V1_LanguagedLiteral<
	s_content extends string=string,
	s_language extends string=string,
> = string extends s_language
	? `"${EscapeTerseLiteralContent<s_content>}"@${Bcp47}`
	: s_language extends Bcp47
		? `"${EscapeTerseLiteralContent<s_content>}"@${s_language}`
		: never;


/**
 * Verbose term string for DatatypedLiteral terms
 */
export type V1_DatatypedLiteral<
	s_content extends string=string,
	s_datatype extends string=string,
> = `"${EscapeTerseLiteralContent<s_content>}"^^${V1_NamedNode<s_datatype>}`;


/**
 * Verbose term string for Variable terms
 */
export type V1_Variable<
	s_name extends string=string,
> = `?${s_name}`;


/**
 * Verbose term string for Quad terms
 */
export type V1_Quad<
	sv1_subject extends string=string,
	sv1_predicate extends string=string,
	sv1_object extends string=string,
	sv1_graph extends string=string,
> = `${sv1_subject} ${sv1_predicate} ${sv1_object}${string extends sv1_graph? string: sv1_graph extends ''? '': ` ${sv1_graph}`} .`;

