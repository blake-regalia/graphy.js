
/**
 * Represents an absolute term string type for DefaultGraph terms
 */
export type A1_DefaultGraph = '*';


/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type A1_NamedNode<
 * 	iri: string = string,
 * > ==> `>${string}`
 * ```
 * Constructs an absolute term string type for NamedNode terms with the optional `iri`
 */
export type A1_NamedNode<
	p_iri extends string=string,
> = string extends p_iri
	? `>${Iri}`
	: p_iri extends Iri
		? `>${s_value}`
		: never;


/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type A1_LabeledBlankNode<
 * 	label: string = string,
 * > ==> `#${string}`
 * ```
 * Constructs an absolute term string type for LabeledBlankNode terms with the optional `label`
 */
export type A1_LabeledBlankNode<
	s_label extends string=string,
> = string extends s_label
	? `#${Label}`
	: s_label extends Label
		? `#${s_label}`
		: never;


/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type A1_AnonymousdBlankNode<
 * 	id: string = string,
 * > ==> `#_${string}`
 * ```
 * Constructs an absolute term string type for AnonymousBlankNode terms with the optional `id`
 */
export type A1_AnonymousBlankNode<
	s_id extends string=string,
> = `#_${s_id}`;


/**
 * Absolute term string for SimpleLiteral terms
 */
export type A1_SimpleLiteral<
	s_content extends string=string,
> = `"${s_content}`;


/**
 * Absolute term string for LanguagedLiteral terms
 */
export type A1_LanguagedLiteral<
	s_content extends string=string,
	s_language extends string=string,
> = string extends s_language
	? `@${Bcp47}"${s_content}`
	: s_language extends Bcp47
		? `@${s_language}"${s_content}`
		: never;


/**
 * Absolute term string for DatatypedLiteral terms
 */
export type A1_DatatypedLiteral<
	s_content extends string=string,
	s_datatype extends string=string,
> = `^${A1_NamedNode<s_datatype>}"${s_content}}`;


/**
 * Absolute term string for Variable terms
 */
export type A1_Variable<
	s_name extends string=string,
> = `?${s_name}`;


/**
 * Absolute term string for Quad terms
 */
export type A1_Quad<
	sa1_subject extends string=string,
	sa1_predicate extends string=string,
	sa1_object extends string=string,
	sa1_graph extends string=string,
> = `\f${sa1_graph}\r${sa1_subject}\n${sa1_predicate}${sa1_object}`;

