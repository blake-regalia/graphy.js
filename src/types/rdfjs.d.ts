import type {
	EventEmitter,
} from 'events';

import type * as ActualRDFJS from '@rdfjs/types';

import {
	AllowedRdfMode,
	RdfMode_star,
} from './const';

export namespace RDFJS {
	/**
	 * Contains an Iri, RDF blank Node, RDF literal, variable name, default graph, or a quad
	 * @see NamedNode
	 * @see BlankNode
	 * @see Literal
	 * @see Variable
	 * @see DefaultGraph
	 * @see Quad
	 */
	export type Term = NamedNode | BlankNode | Literal | Variable | DefaultGraph | BaseQuad;

	/**
	 * Contains an IRI.
	 */
	export interface NamedNode<Iri extends string = string> {
		/**
		 * Contains the constant "NamedNode".
		 */
		termType: 'NamedNode';

		/**
		 * The IRI of the named node (example: `http://example.org/resource`)
		 */
		value: Iri;

		/**
		 * @param other The term to compare with.
		 * @return True if and only if other has termType "NamedNode" and the same `value`.
		 */
		equals(other: Term | null | undefined): boolean;
	}

	/**
	 * Contains an RDF blank node.
	 */
	export interface BlankNode {
		/**
		 * Contains the constant "BlankNode".
		 */
		termType: 'BlankNode';

		/**
		 * Blank node name as a string, without any serialization specific prefixes,
		 * e.g. when parsing,
		 * if the data was sourced from Turtle, remove _:,
		 * if it was sourced from RDF/XML, do not change the blank node name (example: blank3).
		 */
		value: string;

		/**
		 * @param other The term to compare with.
		 * @return True if and only if other has termType "BlankNode" and the same `value`.
		 */
		equals(other: Term | null | undefined): boolean;
	}

	/**
	 * An RDF literal, containing a string with an optional language tag and/or datatype.
	 */
	export interface Literal<Datatype extends Role.Datatype=Role.Datatype> {
		/**
		 * Contains the constant "Literal".
		 */
		termType: 'Literal';

		/**
		 * The text value, unescaped, without language or type (example: Brad Pitt).
		 */
		value: string;

		/**
		 * the language as lowercase BCP47 string (examples: en, en-gb)
		 * or an empty string if the literal has no language.
		 * @link http://tools.ietf.org/html/bcp47
		 */
		language: string;

		/**
		 * A NamedNode whose IRI represents the datatype of the literal.
		 */
		datatype: Datatype;

		/**
		 * @param other The term to compare with.
		 * @return True if and only if other has termType "Literal"
		 *                   and the same `value`, `language`, and `datatype`.
		 */
		equals(other: Term | null | undefined): boolean;
	}

	/**
	 * A variable name.
	 */
	export interface Variable {
		/**
		 * Contains the constant "Variable".
		 */
		termType: 'Variable';

		/**
		 * The name of the variable *without* leading ? (example: a).
		 */
		value: string;

		/**
		 * @param other The term to compare with.
		 * @return True if and only if other has termType "Variable" and the same `value`.
		 */
		equals(other: Term | null | undefined): boolean;
	}

	/**
	 * An instance of DefaultGraph represents the default graph.
	 * It's only allowed to assign a DefaultGraph to the .graph property of a Quad.
	 */
	export interface DefaultGraph {
		/**
		 * Contains the constant "DefaultGraph".
		 */
		termType: 'DefaultGraph';

		/**
		 * Contains an empty string as constant value.
		 */
		value: '';

		/**
		 * @param other The term to compare with.
		 * @return True if and only if other has termType "DefaultGraph".
		 */
		equals(other: Term | null | undefined): boolean;
	}


	/**
	 * Type to be unioned with term types for forming role-specific pattern types
	 */
	export type TermPattern = Variable | null;


	/**
	 * Unions of Term types for the various roles they play in 'plain' RDF 1.1 Data
	 */
	export namespace Role {
		export type Subject<
			RdfMode extends AllowedRdfMode=RdfMode_star,
		> = NamedNode | BlankNode | (RdfMode extends RdfMode_star? Quad: never);

		export type Predicate<
			RdfMode extends AllowedRdfMode=RdfMode_star,
		> = NamedNode;

		export type Object<
			RdfMode extends AllowedRdfMode=RdfMode_star,
			LiteralDatatype extends Datatype=Datatype,
		> = NamedNode | BlankNode | Literal<LiteralDatatype> | (RdfMode extends RdfMode_star? Quad: never);

		export type Graph<
			RdfMode extends AllowedRdfMode=RdfMode_star,
		> = DefaultGraph | NamedNode | BlankNode;

		export type Datatype<
			RdfMode extends AllowedRdfMode=RdfMode_star,
		> = NamedNode;
	}


	/**
	 * Unions of Term types for the various
	 */
	export namespace Pattern {
		export type Subject<
			RdfMode extends AllowedRdfMode=RdfMode_star,
		> = Role.Subject<RdfMode> | TermPattern;

		export type Predicate<
			RdfMode extends AllowedRdfMode=RdfMode_star,
		> = Role.Predicate<RdfMode> | TermPattern;

		export type Object<
			RdfMode extends AllowedRdfMode=RdfMode_star,
			LiteralDatatype extends Datatype=Datatype,
		> = Role.Object<RdfMode> | TermPattern;

		export type Graph<
			RdfMode extends AllowedRdfMode=RdfMode_star,
		> = Role.Graph<RdfMode> | TermPattern;

		export type Datatype<
			RdfMode extends AllowedRdfMode=RdfMode_star,
		> = Role.Datatype<RdfMode> | TermPattern;
	}


	/**
	 * The subject, which is a NamedNode, BlankNode or Variable.
	 * @deprecated Consider using one of the following types instead: @see Role.Subject or @see Pattern.Subject
	 */
	export type Quad_Subject<
		RdfMode extends AllowedRdfMode=RdfMode_star,
	> = Role.Subject<RdfMode> | Variable;

	/**
	 * The predicate, which is a NamedNode or Variable.
	 * @deprecated Consider using one of the following types instead: @see Role.Predicate or @see Pattern.Predicate
	 */
	export type Quad_Predicate<
		RdfMode extends AllowedRdfMode=RdfMode_star,
	> = Role.Predicate<RdfMode> | Variable;

	/**
	 * The object, which is a NamedNode, Literal, BlankNode or Variable.
	 * @deprecated Consider using one of the following types instead: @see Role.Object or @see Pattern.Object
	 */
	export type Quad_Object<
		RdfMode extends AllowedRdfMode=RdfMode_star,
	> = Role.Object<RdfMode> | Variable;

	/**
	 * The named graph, which is a DefaultGraph, NamedNode, BlankNode or Variable.
	 * @deprecated Consider using one of the following types instead: @see Role.Graph or @see Pattern.Graph
	 */
	export type Quad_Graph<
		RdfMode extends AllowedRdfMode=RdfMode_star,
	> = Role.Graph<RdfMode> | Variable;

	/**
	 * An RDF quad, taking any Term in its positions, containing the subject, predicate, object and graph terms.
	 */
	export interface BaseQuad {
		/**
		 * Contains the constant "Quad".
		 */
		termType: 'Quad';

		/**
		 * Contains an empty string as constant value.
		 */
		value: '';

		/**
		 * The subject.
		 */
		subject: Term;

		/**
		 * The predicate.
		 */
		predicate: Term;

		/**
		 * The object.
		 */
		object: Term;

		/**
		 * The named graph.
		 */
		graph: Term;

		/**
		 * @param other The term to compare with.
		 * @return True if and only if the argument is a) of the same type b) has all components equal.
		 */
		equals(other: Term | null | undefined): boolean;
	}

	/**
	 * An RDF quad, containing the subject, predicate, object and graph terms.
	 */
	export interface Quad<
		RdfMode extends AllowedRdfMode=RdfMode_star,
		LiteralDataype extends Role.Datatype=Role.Datatype<RdfMode>
	> extends BaseQuad {
		/**
		 * The subject.
		 * @see Quad_Subject
		 */
		subject: Role.Subject<RdfMode>;

		/**
		 * The predicate.
		 * @see Quad_Predicate
		 */
		predicate: Role.Predicate<RdfMode>;

		/**
		 * The object.
		 * @see Quad_Object
		 */
		object: Role.Object<RdfMode, LiteralDataype>;

		/**
		 * The named graph.
		 * @see Quad_Graph
		 */
		graph: Role.Graph<RdfMode>;
	}

	/**
	 * An RDF quad, containing the subject, predicate, object and graph terms.
	 */
	export interface QuadPattern<
		RdfMode extends AllowedRdfMode=RdfMode_star,
		LiteralDataype extends Role.Datatype=Role.Datatype<RdfMode>
	> {
		/**
		 * The subject.
		 * @see Quad_Subject
		 */
		subject: Pattern.Subject<RdfMode>;

		/**
		 * The predicate.
		 * @see Quad_Predicate
		 */
		predicate: Pattern.Predicate<RdfMode>;

		/**
		 * The object.
		 * @see Quad_Object
		 */
		object: Pattern.Object<RdfMode, LiteralDataype>;

		/**
		 * The named graph.
		 * @see Quad_Graph
		 */
		graph: Pattern.Graph<RdfMode>;
	}



	/**
	 * A factory for instantiating RDF terms and quads.
	 */
	export interface DataFactory<OutQuad extends BaseQuad=Quad, InQuad extends BaseQuad=Quad> {
		/**
		* @param value The IRI for the named node.
		* @return A new instance of NamedNode.
		* @see NamedNode
		*/
		namedNode<Iri extends string = string>(value: Iri): NamedNode<Iri>;

		/**
		* @param value The optional blank node identifier.
		* @return A new instance of BlankNode.
		*                         If the `value` parameter is undefined a new identifier
		*                         for the blank node is generated for each call.
		* @see BlankNode
		*/
		blankNode(value?: string): BlankNode;

		/**
		* @param                 value              The literal value.
		* @param languageOrDatatype The optional language or datatype.
		*    If `languageOrDatatype` is a NamedNode,
		*    then it is used for the value of `NamedNode.datatype`.
		*    Otherwise `languageOrDatatype` is used for the value
		*    of `NamedNode.language`.
		* @return A new instance of Literal.
		* @see Literal
		*/
		literal(value: string, languageOrDatatype?: string | NamedNode): Literal;

		/**
		* This method is optional.
		* @param value The variable name
		* @return A new instance of Variable.
		* @see Variable
		*/
		variable?(value: string): Variable;

		/**
		* @return An instance of DefaultGraph.
		*/
		defaultGraph(): DefaultGraph;

		/**
		* @param subject   The quad subject term.
		* @param predicate The quad predicate term.
		* @param object    The quad object term.
		* @param graph     The quad graph term.
		* @return A new instance of Quad.
		* @see PlainQuad
		*/
		quad(subject: InQuad['subject'], predicate: InQuad['predicate'], object: InQuad['object'], graph?: InQuad['graph']): OutQuad;
	}

	export type Dataset<OutQuad extends BaseQuad=Quad, InQuad extends BaseQuad=OutQuad> = ActualRDFJS.Dataset<InQuad, OutQuad>;
	export type DatasetFactory<OutQuad extends BaseQuad=Quad, InQuad extends BaseQuad=OutQuad, D extends Dataset<OutQuad, InQuad>=Dataset<OutQuad, InQuad>> = ActualRDFJS.DatasetFactory<InQuad, OutQuad, D>;
	export type Stream<Q extends BaseQuad=Quad> = ActualRDFJS.Stream<Q>;
	export type Source<Q extends BaseQuad=Quad> = ActualRDFJS.Source<Q>;
	export type Sink<I extends EventEmitter, O extends EventEmitter> = ActualRDFJS.Sink<I, O>;
	export type Store<Q extends BaseQuad=Quad> = ActualRDFJS.Store<Q>;
}
