
import { Bcp47 } from "@graphy/types";
import { Includes } from "ts-toolbelt/out/List/Includes";
import { Split } from "ts-toolbelt/out/String/Split";
import { P_RDF_TYPE } from "./const";
import { Iri, Label, PrefixMap, Suffix } from "./root";

import {
	NamedNode,
	RelativeIri,
	BlankNode,
	Variable,
	SimpleLiteral,
	LanguagedLiteral,
	DatatypedLiteral,
	BooleanLiteral,
	Quad,
} from "./terms/term";

export type LiteralMap<
	s_value extends string=string,
> = {
	boolean: BooleanLiteral<s_value>;
	integer: IntegerLiteral<s_value>;
	double: DoubleLiteral<s_value>;
	decimal: DecimalLiteral<s_value>;
	date: DateLiteral<s_value>;
	dateTime: DateTimeLiteral<s_value>;
};

type ValidPrefix<
	s_prefix extends string=string,
> = Split<s_prefix, ''> extends infer a_chars
	? Not<Includes<a_chars, '`' | '~' | '!' | '@' | '#' | '$' | '%' | '^' | '&' | '*' | '(' | ')' | '+' | '=' | '[' | '{' | ']' | '}' | '\\' | '|' | ';' | ':' | '\'' | '"' | ',' | '<' | '>' | '/' | '?'>>
	: never;


type NamedNodeFromC1<
	s_c1 extends string=string,
> = string extends s_c1
	? Term
	: s_c1 extends `>${infer p_iri}`
		? (p_iri extends `${'.' | '/' | '#'}${string}`
			? RelativeIri<p_iri>
			: NamedNode<p_iri>
		)
		: s_c1 extends 'a'
			? NamedNode<P_RDF_TYPE>
			: s_c1 extends `${infer s_prefix}:${infer s_suffix}`
				? If<ValidPrefix<s_c1>, PrefixedNamedNode<s_prefix, s_suffix>, never>
				: never;

type BlankNodeFromC1<
	s_c1 extends string=string,
> = string extends s_c1
	? BlankNode
	: s_c1 extends `#${infer s_rest}`
		? (s_rest extends `#${infer s_any}`
			? BlankNode
			: BlankNode<s_rest>
		)
		: never;

type NodeFromC1<
	s_c1 extends string=string,
> = s_c1 extends `#${string}`
	? BlankNodeFromC1<s_c1>
	: NamedNodeFromC1<s_c1>;

type DataFromC1<
	s_c1 extends string=string,
> = s_c1 extends `"${infer s_content}`
	? SimpleLiteral<s_c1>
	: s_c1 extends `@${infer s_lang}"${s_content}`
		? LanguagedLiteral<s_content, s_lang>
		: s_c1 extends `^${infer sc1_datatype}"${s_content}`
			? (sc1_datatype extends `>${infer p_iri}`
				? (p_iri extends `http://www.w3.org/2001/XMLSchema#${infer s_type}`
					? (s_type extends keyof LiteralMap
						? LiteralMap<s_content>[s_type]
						: DatatypedLiteral<s_content, NamedNode<p_iri>>
					)
					: DatatypedLiteral<s_content, NamedNode<p_iri>>
				)
				: DatatypedLiteral<s_content, NamedNode<p_iri>>
			)
			: NodeFromC1<s_c1>;

type QuadOrDataFromC1<
	s_c1 extends string=string,
> = s_c1 extends `\f${infer s_rest_0}`
	? (s_rest_0 extends `${infer sc1_graph}\r${infer s_rest_1}`
		? (s_rest_1 extends `${infer sc1_subject}\n${infer s_rest_2}`
			? (s_rest_2 extends `${infer sc1_predicate}\t${infer sc1_object}`
				? Quad<sc1_graph, sc1_subject, sc1_predicate, sc1_object>
				: Quad<sc1_graph, sc1_subject>
			)
			: Quad<sc1_graph>
		)
		: Quad
	)
	: DataFromC1<s_c1>;

// type JsonFromC1<
// 	s_c1 extends string=string
// > = string extends s_c1
// 	? never
// 	: s_c1 extends '`${infer s_rest}'
		

// type TermFromF1<
// 	s_c1 extends string=string,
// > = s_c1 extends `>${infer p_iri}`
// 	? (p_iri extends `${'.' | '/' | '#'}${string}`
// 		? RelativeIri<p_iri>
// 		: NamedNode<p_iri>
// 	)
// 	: s_c1 extends `#${infer s_rest}`
// 		? (s_rest extends `#${infer s_any}`
// 			? BlankNode
// 			: BlankNode
// 		)
// 		: s_c1 extends `"${infer s_content}`
// 			? SimpleLiteral<s_c1>
// 			: s_c1 extends `@${infer s_lang}"${s_content}`
// 				? LanguagedLiteral<s_content, s_lang>
// 				: s_c1 extends `^${infer sc1_datatype}"${s_content}`
// 					? (sc1_datatype extends `>${infer p_iri}`
// 						? (p_iri extends `http://www.w3.org/2001/XMLSchema#${infer s_type}`
// 							? (s_type extends keyof LiteralMap
// 								? LiteralMap<s_content>[s_type]
// 								: DatatypedLiteral<s_content, NamedNode<p_iri>>
// 							)
// 							: DatatypedLiteral<s_content, NamedNode<p_iri>>
// 						)
// 						: DatatypedLiteral<s_content, NamedNode<p_iri>>
// 					)
// 					: s_c1 extends `?${infer s_name}`
// 						? Variable<s_name>
// 						: Term;


// type SXs = TermFromF1<'^>xsd:data"help'>['datatype']['value'];







export namespace F1 {
	export type DefaultGraph = '*';
	export type NamedNode<s_value extends Iri=Iri> = `>${s_value}`;
	export type RelativeIri<s_value extends IriRelativeRef=IriRelativeRef> = `>${s_value}`;
	export type LabeledBlankNode<s_value extends string=string> = `#${s_value}`;
	export type AnonymousBlankNode = `#${string}`;
	export type EphemeralBlankNode = `##${string}`;
	export type SimpleLiteral<s_value extends string=string> = `"${s_value}`;
	export type LanguagedLiteral<s_value extends string=string, s_language extends Bcp47=Bcp47> = `@${s_language}"${s_value}`;
	export type DatatypedLiteral<s_value extends string=string, s_datatype extends Iri=Iri> = `^${NamedNode<s_datatype>}"${s_value}`;
	export type BooleanLiteral<s_value extends LiterallyTrueOrFalse=LiterallyTrueOrFalse> = `^>http://www.w3.org/2001/XMLSchema#boolean"${s_value}`;
	export type IntegerLiteral<s_value extends LiterallyInteger=LiterallyInteger> = `^>http://www.w3.org/2001/XMLSchema#integer"${s_value}`;
	export type DoubleLiteral<s_value extends LiterallyDouble=LiterallyDouble> = `^>http://www.w3.org/2001/XMLSchema#double"${s_value}`;
	export type PositiveInfinityLiteral = `^>http://www.w3.org/2001/XMLSchema#double"INF`;
	export type NegativeInfinityLiteral = `^>http://www.w3.org/2001/XMLSchema#double"-INF`;
	export type NaNLiteral = `^>http://www.w3.org/2001/XMLSchema#double"NaN`;
	export type DecimalLiteral<s_value extends LiterallyDecimal=LiterallyDecimal> = `^>http://www.w3.org/2001/XMLSchema#decimal"${s_value}`;
	export type DateLiteral<s_value extends string=string> = `^>http://www.w3.org/2001/XMLSchema#date"${s_value}`;
	export type DateTimeLiteral<s_value extends string=string> = `^>http://www.w3.org/2001/XMLSchema#dateTime"${s_value}`;
	export type Variable<s_value extends string=string> = `?${s_value}`;
	export type Quad<s_value_subject extends string=string, s_value_predicate extends Iri=Iri, s_value_object extends string=string, s_language_object extends Bcp47=Bcp47, s_datatype_object extends Iri=Iri, s_value_graph extends string=string> = string;
	export type BlankNode<s_value extends string=string> = string;
	export type Literal<s_value extends string=string, s_language extends Bcp47=Bcp47, s_datatype extends Iri=Iri> = string;
	export type Json = string;
	export type Directive = string;
	export interface QuadBundle extends Iterable<Quad> {
		[Symbol.iterator]: () => Iterator<Quad>;
		toString(): F1.Json;
	}

	export type Node<s_value extends string=string> = NamedNode<s_value> | BlankNode<s_value>;
	export type Graph<s_value extends string=string> = DefaultGraph | (s_value extends ''? never: Node<s_value>);
	export type Subject<s_value extends string=string> = Node<s_value>;
	export type Predicate<s_value extends string=string> = NamedNode<s_value>;
	export type Object<s_value extends string=string, s_language extends Bcp47=Bcp47, s_datatype extends Iri=Iri> = Node<s_value> | Literal<s_value, s_language, s_datatype>;
	export type Datatype<s_value extends string=string> = NamedNode<s_value>;
	export type Data = Node | Graph | Subject | Predicate | Object | Datatype;
	export type Any = Data | Variable | Quad | Json | Directive;

	type f = LabeledBlankNode<'hey'>;
	f['value'];
}

export namespace C1 {
	export type DefaultGraph = F1.DefaultGraph;
	export type NamedNode<s_value extends Iri=Iri> = F1.NamedNode<s_value> | `${string}:${string}`;
	export type RelativeIri<s_value extends IriRelativeRef=IriRelativeRef> = void;
	export type LabeledBlankNode<s_value extends string=string> = F1.LabeledBlankNode<s_value>;
	export type AnonymousBlankNode = F1.AnonymousBlankNode;
	export type EphemeralBlankNode = F1.EphemeralBlankNode;
	export type SimpleLiteral<s_value extends string=string> = F1.SimpleLiteral<s_value>;
	export type LanguagedLiteral<s_value extends string=string, s_language extends Bcp47=Bcp47> = F1.LanguagedLiteral<s_value, s_language>;
	export type DatatypedLiteral<s_value extends string=string, s_datatype extends Iri=Iri> = `^${NamedNode<s_datatype>}"${s_value}`;
	export type BooleanLiteral<s_value extends LiterallyTrueOrFalse=LiterallyTrueOrFalse> = F1.BooleanLiteral<s_value> | `^${string}:${string}"${s_value}`;
	export type IntegerLiteral<s_value extends LiterallyInteger=LiterallyInteger> = F1.IntegerLiteral<s_value> | `^${string}:${string}"${number}`;
	export type DoubleLiteral<s_value extends LiterallyDouble=LiterallyDouble> = F1.DoubleLiteral<s_value> | `^${string}:${string}"${s_value}`;
	export type PositiveInfinityLiteral = F1.PositiveInfinityLiteral | `^${string}:${string}"INF`;
	export type NegativeInfinityLiteral = F1.NegativeInfinityLiteral | `^${string}:${string}"-INF`;
	export type NaNLiteral = F1.NaNLiteral | `^${string}:${string}"NaN`;
	export type DecimalLiteral<s_value extends LiterallyDecimal=LiterallyDecimal> = F1.DecimalLiteral<s_value> | `^${string}:${string}"${string}`;
	export type DateLiteral<s_value extends string=string> = F1.DateLiteral<s_value> | `^${string}:${string}"${string}`;
	export type DateTimeLiteral<s_value extends string=string> = F1.DateTimeLiteral<s_value> | `^${string}:${string}"${string}`;
	export type Variable<s_value extends string=string> = F1.Variable<s_value>;
	export type Quad<s_value_subject extends string=string, s_value_predicate extends Iri=Iri, s_value_object extends string=string, s_language_object extends Bcp47=Bcp47, s_datatype_object extends Iri=Iri, s_value_graph extends string=string> = string;
	export type BlankNode<s_value extends string=string> = LabeledBlankNode<s_value> | AnonymousBlankNode | EphemeralBlankNode;
	export type Literal<s_value extends string=string, s_language extends Bcp47=Bcp47, s_datatype extends Iri=Iri> = SimpleLiteral<s_value> | LanguagedLiteral<s_value, s_language> | DatatypedLiteral<s_value, s_datatype>;
	export type Json = string;
	export type Directive = string;
	export interface QuadBundle extends Iterable<Quad> {
		[Symbol.iterator]: () => Iterator<Quad>;
		toString(): C1.Json;
	}

	export type Node<s_value extends string=string> = NamedNode<s_value> | BlankNode<s_value>;
	export type Graph<s_value extends string=string> = DefaultGraph | (s_value extends ''? never: Node<s_value>);
	export type Subject<s_value extends string=string> = Node<s_value>;
	export type Predicate<s_value extends string=string> = NamedNode<s_value>;
	export type Object<s_value extends string=string, s_language extends Bcp47=Bcp47, s_datatype extends Iri=Iri> = Node<s_value> | Literal<s_value, s_language, s_datatype>;
	export type Datatype<s_value extends string=string> = NamedNode<s_value>;
	export type Data = Node | Graph | Subject | Predicate | Object | Datatype;
	export type Any = Data | Variable | Quad | Json | Directive;
}