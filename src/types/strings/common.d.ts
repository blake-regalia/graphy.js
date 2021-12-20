import {
	List,
	String,
} from 'ts-toolbelt';

import {
	If,
	Keys,
	Extends,
} from 'ts-toolbelt/out/Any/_api';

import {
	Escape,
	Substr,
	FindKeysForValuesPrefixing,
} from '../utility';


/**
 * RFC 3987: IRI <http://tools.ietf.org/html/rfc3987>
 */
export type Iri = string;


/**
 * {Turtle,TriG,SPARQL}-safe label
 */
export type Label = string;


/**
 * {Turtle,TriG,SPARQL}-safe prefix
 */
export type Prefix = string;


/**
 * {Turtle,TriG,SPARQL}-safe suffix
 */
export type Suffix = string;


/**
 * === _**@graphy/types**_ ===
 * 
 * ```ts
 * type CompactIri<
 * 	iri: string,
 * 	prefixes: PrefixMap,
 * > ==> [prefix: string, suffix: string]
 * ```
 * Compacts `iri` given `prefixes` into [prefix, suffix]
 */
export type CompactIri<
	p_iri extends string,
	h_prefixes extends {} | void,
> = string extends p_iri
	? []
	: h_prefixes extends {}
		? (FindKeysForValuesPrefixing<p_iri, h_prefixes> extends infer si_prefix
			? ([si_prefix] extends [never]
				// iri not found in namespaces
				? []
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
		: [];


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
	h_prefixes extends {} | void,
> = CompactIri<p_iri, h_prefixes> extends infer a_compacted
	? (a_compacted extends string[]
		? (a_compacted['length'] extends 0
			? `>${p_iri}`
			: {
				[K in Keys<a_compacted>]: `${a_compacted[0]}:${a_compacted[1]}`
					| If<Extends<string, a_compacted[1]>, `>${p_iri}`>;
			}[Keys<a_compacted>]
		)
		: never
	)
	: never


/**
 * All characters that need to be escaped in terse curies
 */
type PrefixedNameLocalEscapes = '_' | '~' | '.' | '-' | '!' | '$' | '&' | '\'' | '(' | ')' | '*' | '+' | ',' | ';' | '=' | '/' | '?' | '#' | '@' | '%';

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
	p_iri extends string,
	h_prefixes extends {} | void,
> = CompactIri<p_iri, h_prefixes> extends infer a_compacted
	? a_compacted extends string[]
		? {
			[K in Keys<a_compacted>]: `${a_compacted[0]}:${Escape<a_compacted[1], PrefixedNameLocalEscapes>}`
				| If<Extends<string, a_compacted[1]>, `<${p_iri}>`>
				| If<List.Includes<Split<a_compacted[1], ''>, PrefixedNameLocalEscapes>, `<${p_iri}>`>;
		}[Keys<a_compacted>]
		: never
	: never


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
