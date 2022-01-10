import { ASSERT_NEVER } from '@graphy/types/utility';
import {
	List,
	String,
} from 'ts-toolbelt';

import {
	If,
} from 'ts-toolbelt/out/Any/If';

import {
	Keys,
	Extends,
	Compute,
	Type,
} from 'ts-toolbelt/out/Any/_api';

import {
	PrefixMapArg,
} from '../types';

import {
	ASSERT_SAME,
	ASSERT_EQUAL,
	True,
	Escape,
	Substr,
	FindKeysForValuesPrefixing,
} from '../utility';


/**
 * === _**@graphy/types**_ ===
 * 
 * ## RFC 3987: IRI
 * 
 * http://tools.ietf.org/html/rfc3987
 */
export type Iri = string;
// export type OpaqueIri = Type<Iri, 'Iri'>;


/**
 * === _**@graphy/types**_ ===
 * 
 * ## Blank Node Label
 * 
 * {Turtle,TriG,SPARQL}-safe label for blank nodes
 */
export type Label = string;


/**
 * === _**@graphy/types**_ ===
 * 
 * ## CURIE Prefix
 * 
 * {Turtle,TriG,SPARQL}-safe prefix for CURIEs
 * 
 * https://www.w3.org/TR/curie/
 */
export type Prefix = string;


/**
 * === _**@graphy/types**_ ===
 * 
 * ## CURIE Suffix
 * 
 * {Turtle,TriG,SPARQL}-safe suffix for CURIEs
 * 
 * https://www.w3.org/TR/curie/
 */
export type Suffix = string;


/**
 * === _**@graphy/types**_ ===
 * 
 * ## BCP 47: Language Tag
 * 
 * https://www.rfc-editor.org/info/bcp47
 */
export type Bcp47 = string;


/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type CompactIri<
 * 	iri: string,
 * 	prefixes: PrefixMap,
 * > ==> UnionOf<[prefix: string, suffix: string]> | void
 * ```
 * Compacts `iri` given `prefixes` into [prefix, suffix]
 */
export type CompactIri<
	p_iri extends string,
	h_prefixes extends PrefixMapArg,
> = string extends p_iri
	? void
	: h_prefixes extends Record<string, string>
		? (FindKeysForValuesPrefixing<p_iri, h_prefixes> extends infer si_prefix
			? ([si_prefix] extends [never]
				// iri not found in namespaces
				? void
				: (si_prefix extends string & keyof h_prefixes
					? {
						[K in si_prefix]: h_prefixes[si_prefix] extends infer p_namesapce
							? (string extends p_namesapce
								? [si_prefix, string]
								: (p_namesapce extends string
									? (String.Split<p_iri, ''> extends infer a_chars_iri
										? (a_chars_iri extends string[]
											? [si_prefix, String.Join<List.Extract<a_chars_iri, String.Length<p_namesapce>, a_chars_iri['length']>>]
											: never
										)
										: never
									)
									: never
								)
							)
							: never
					}[si_prefix]
					: never
				)
			)
			: never
		)
		: void;

{
	const AO: ASSERT_SAME<void, CompactIri<'z://y/x', void>> = 1;
	const AE: ASSERT_SAME<void, CompactIri<'z://y/x', {}>> = 1;
	const AX: ASSERT_SAME<void, CompactIri<'z://y/x', {w:'w://u/'}>> = 1;
	const AS: ASSERT_SAME<['z', 'x'], CompactIri<'z://y/x', {z:'z://y/'}>> = 1;
	const AP: ASSERT_SAME<['z', 'x'] | ['Z', ''], CompactIri<'z://y/x', {z:'z://y/', Z:'z://y/x'}>> = 1;
}

type SC1_DEFAULT_ABSOLUTE = `>${string}`;

type SC1_DEFAULT_COMPACT = `${string}:${string}`;

type SC1_DEFAULT_UNKNOWN = SC1_DEFAULT_ABSOLUTE | SC1_DEFAULT_COMPACT;

/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type ConcisifyIri<
 * 	iri: string,
 * 	prefixes: PrefixMap,
 * > ==> `>${string}` | `${string}:${string}`
 * ```
 * Returns the concise string version of a `iri` given `prefixes`
 */
export type ConcisifyIri<
	p_iri extends string,
	h_prefixes extends PrefixMapArg,
> = string extends p_iri
	? SC1_DEFAULT_UNKNOWN
	: CompactIri<p_iri, h_prefixes> extends infer a_compacted
		? (a_compacted extends string[]
			? (a_compacted['length'] extends 0
				? `>${p_iri}`
				: {
					[K in Keys<a_compacted>]: `${a_compacted[0]}:${a_compacted[1]}`
						| If<Extends<string, a_compacted[1]>, `>${p_iri}`>;
				}[Keys<a_compacted>]
			)
			: String.Length<p_iri> extends 0	
				? never
				: `>${p_iri}`
		)
		: SC1_DEFAULT_UNKNOWN;

{
	const AS: ASSERT_SAME<SC1_DEFAULT_UNKNOWN, ConcisifyIri<string, {}>> = 1;
	const AE: ASSERT_NEVER<ConcisifyIri<'', {}>> = 1;
	const AT: ASSERT_SAME<`>http://${string}`, ConcisifyIri<`http://${string}`, {}>> = 1;
	const AV: ASSERT_SAME<'>z://y/x', ConcisifyIri<'z://y/x', {}>> = 1;
	const AC: ASSERT_SAME<'z:x', ConcisifyIri<'z://y/x', {z:'z://y/'}>> = 1;
}


/**
 * All characters that need to be escaped in terse curies
 */
type PrefixedNameLocalEscapes = '_' | '~' | '.' | '-' | '!' | '$' | '&' | '\'' | '(' | ')' | '*' | '+' | ',' | ';' | '=' | '/' | '?' | '#' | '@' | '%';

type EscapePrefixedNameLocalEscapes<
	s_input extends string,
>= Escape<
	Escape<
		Escape<
			Escape<
				Escape<
					Escape<
						Escape<
							Escape<
								Escape<
									Escape<
										Escape<
											Escape<
												Escape<
													Escape<
														Escape<
															Escape<
																Escape<
																	Escape<
																		Escape<
																			Escape<
																				s_input, '_'
																			>, '~'
																		>, '.'
																	>, '-'
																>, '!'
															>, '$'
														>, '&'
													>, '\''
												>, '('
											>, ')'
										>, '*'
									>, '+'
								>, ','
							>, ';'
						>, '='
					>, '/'
				>, '?'
			>, '#'
		>, '@'
	>, '%'
>;

/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type TersifyIri<
 * 	iri: string,
 * 	prefixes: PrefixMap,
 * > ==> `<${string}>` | `${string}:${string}`
 * ```
 * Returns the terse string version of a `iri` given `prefixes` with proper escapes
 */
export type TersifyIri<
	z_iri extends string,
	h_prefixes extends PrefixMapArg,
> = z_iri extends `${infer p_iri}`
	? CompactIri<p_iri, h_prefixes> extends infer a_compacted
		? a_compacted extends string[]
			? {
				[K in Exclude<Keys<a_compacted>, number>]: `${a_compacted[0]}:${EscapePrefixedNameLocalEscapes<a_compacted[1]>}`
					| If<Extends<string, a_compacted[1]>, `<${p_iri}>`>
					| If<List.Includes<String.Split<a_compacted[1], ''>, PrefixedNameLocalEscapes>, `<${p_iri}>`>
			}[Exclude<Keys<a_compacted>, number>]
			: `<${p_iri}>`
		: never
	: `<${string}>` | `${string}:${string}`;

{
	type p_iri = 'z://y/x';
	type sv1_iri = `<${p_iri}>`;
	const AO: ASSERT_SAME<sv1_iri, TersifyIri<p_iri, void>> = 1;
	const AE: ASSERT_SAME<sv1_iri, TersifyIri<p_iri, {}>> = 1;
	const AX: ASSERT_SAME<sv1_iri, TersifyIri<p_iri, {w:'w://u'}>> = 1;
	const AI: ASSERT_SAME<'z:x', TersifyIri<p_iri, {z:'z://y/'}>> = 1;
	const AM: ASSERT_SAME<'z:x', TersifyIri<p_iri, {z:'z://y/', w:'w://u'}>> = 1;
	const AS: ASSERT_SAME<'z:x\\/w' | `<${p_iri}/w>`, TersifyIri<`${p_iri}/w`, {z:'z://y/', w:'w://u'}>> = 1;

	const Ax: ASSERT_SAME<`<${string}>` | `${string}:${string}`, TersifyIri<string, void>> = 1;
}


/**
 * Escapes the contents of a terse Literal
 */
export type EscapeTerseLiteralContent<
	s_content extends string,
> = Escape<s_content, '"' | '\n'>;


// const H_PREFIXES = {
// 	rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
// 	rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
// 	rdft: 'http://www.w3.org/ns/rdftest#',
// 	dc: 'http://purl.org/dc/terms/',
// 	doap: 'http://usefulinc.com/ns/doap#',
// 	earl: 'http://www.w3.org/ns/earl#',
// 	foaf: 'http://xmlns.com/foaf/0.1/',
// 	// foaf_p: 'http://xmlns.com/foaf/0.1/p/',
// 	xsd: 'http://www.w3.org/2001/XMLSchema#',
// 	mf: 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#',
// } as const;

// {
// 	type demo = CompactIri<'http://xmlns.com/foaf/0.1/p/help', typeof H_PREFIXES>;
// 	type demo1 = ConcisifyIri<'http://xmlns.com/foaf/0.1/p/help', typeof H_PREFIXES>;
// 	type demo1a = ConcisifyIri<'http://xmlns.com/not/exists/help', typeof H_PREFIXES>;
// 	type demo2 = TersifyIri<'http://xmlns.com/foaf/0.1/p/help', typeof H_PREFIXES>;
// }
