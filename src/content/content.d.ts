import EventEmitter = NodeJS.EventEmitter;

import {
    Readable,
    Writable,
    Transform,
} from 'stream';

import {
    Dataset,
    Term,
} from '@graphy/types';

import {
    PrefixMap,
    ConciseNamedNode,
    ConciseTerm,
    Quad,
    Iri,
    Graphable,
    ConciseTriples,
    ConciseQuads,
} from './factory';


export type JavaScriptCode = string;

type InputValue = string | NodeJS.TypedArray | ArrayBuffer;

export type ResolvedInput = InputValue | ReadableStream<InputValue> | Response | AsyncIterable<InputValue> | NodeJS.ReadableStream;

export type Input = ResolvedInput | Promise<Input>;

export interface ReaderConfig {
    dataFactory?: RDF.DataFactory;
    baseIRI?: string;
    
    /**
     * Sets the maximum character length for any token such as IRIs and prefixed names. Defaults to 2048 => http://stackoverflow.com/a/417184/1641160
     */
    maxTokenLength?: number;

    /**
     * Sets the maximum character length for string literals. Defaults to 524288 (~1-2 MiB in UTF-16) in order to prevent an out-of-memory crash from potentially unclosed strings. Set to `Infinity` if you wish to disable the limits
     */
    maxStringLength?: number;

    /**
     * Controls the error message output color format
     */
    colorMode: 'off' | 'ansi';
    
    readable?(): void;
    finish?(): void;
    end?(): void;
    error?(err: Error): void;

    data?(quad: Quad): void;
    comment?(comment: string): void;
    progress?(delta: number): void;
    eof?(prefixes: PrefixMap): void;
}

export interface ScannerConfig extends ReaderConfig {
    preset?: 'count' | 'scribe' | 'ndjson';
    run?: JavaScriptCode;
    reduce?(accumulator: any, current: any): any;
    receive?(value: any, thread: number): any;
    threads?: number;
}

export interface ListsConfig {
    first: ConciseNamedNode;
    rest: ConciseNamedNode;
    nil: ConciseTerm;
}


/**
 * Controls styling options when writing RDF to a supported output format
 */
export interface StyleConfig {
    /**
     * Overrides the whitespace string to use for indentation [defaults to '\t']
     */
    indent?: string;

    /**
     * Prints the optional GRAPH keyword for named graph groups; also allows specifying the capitalization style [defaults to false]
     */
    graphKeyword?: boolean | 'graph' | 'Graph' | 'GRAPH';

    /**
     * Omits the optional GRAPH group for triples in the default graph (only applies to TriG) [defaults to false]
     */
    simplifyDefaultGraph?: boolean;

    /**
     * Specifies the directive style (Turtle vs SPARQL) as well as the capitalization style for prefix and base statements [defaults to 'turtle']
     */
    directives?: 'turtle' | 'Turtle' | 'TURTLE' | 'sparql' | 'Sparql' | 'SPARQL';

    /**
     * Refers to the first line of a tree-style triple (where the subject is printed) and whether to print the first predicate-object pair on the same line under various circumstances [defaults to 'line']
     */
    heading?: 'line' | 'break-list' | 'break-all';

    /**
     * Refers to the full-stop terminator for a triple and whether to print it on the same line as the last object [defaults to 'line']
     */
    terminator?: 'line' | 'break';

    /**
     * Refers to objects-lists and when to break line [defaults to 'line']
     */
    objects?: 'line' | 'break' | 'break-list' | 'break-all' | 'wrap' | `wrap(${string})`;
}

export interface WriteConfig {
    prefixes?: PrefixMap;
    lists?: ListsConfig;
    style?: StyleConfig;
}

export interface TReaderConfig extends ReaderConfig {
    /**
     * Tolerant mode enables an optimization faster read speeds. It disables strict validation of IRIs and prefix IDs, allowing certain characters normally forbidden in TriG/Turtle to be used in IRIs and prefix IDs
     */
    tolerant?: boolean;

    /**
     * Swift mode enables a slight optimization for faster read speeds. It disables line tracking which is normally used to print the line/col offset within an input document when a ContentSyntaxError is thrown
     */
    swift?: boolean;

    /**
     * Callback for when a base statement is read
     * @param iri - IRI of the new base
     */
    base?(iri: Iri): void;

    /**
     * Callback for whIen a prefix statement is read
     * @param prefixId - ID of the new prefix mapping
     * @param iri - IRI of the new prefix mapping
     */
    prefix?(prefixId: string, iri: Iri): void;
}

export interface TurtleReaderConfig extends TReaderConfig {
    /**
     * Star mode enables RDF-star for Turtle
     */
    star?: boolean;
}

export interface TrigReaderConfig extends TReaderConfig {
    /**
     * Callback for when a graph block is entered (including the default graph). Does not emit for naked triples outside of graph blocks
     * @param graph - graph being entered
     */
    enter?(graph: Term.Graph): void;

    /**
     * Callback for when a graph block is exited (including the default graph). Does not emit for naked triples outside of graph blocks
     * @param graph - graph being exited
     */
    exit?(graph: Term.Graph): void;
}

export interface NReaderConfig extends ReaderConfig {

}

export interface NScannerConfig extends NReaderConfig {
    update?(msg: any, threadId: number);
    report?(value: any);
    error?(err: Error, threadId?: number);
}

export class GraphyTransform extends Transform {
    import(stream: RDF.Stream<RDF.Quad>): void;
    async bucket(): Promise<string>;
}

export class TurtleReader extends GraphyTransform implements RDF.Sink<EventEmitter> {
    /**
     * Runs the reader on an input Turtle document (i.e., parses it)
     * @param input - input Turtle document
     * @param config - config for the reader
     */
    static async run(input: Input, config: TurtleReaderConfig): Promise<void>;


    constructor(config: TurtleReaderConfig);
}


export class TurtleLoader extends GraphyTransform implements RDF.Sink<EventEmitter> {
    /**
     * Runs the reader on an input Turtle document (i.e., parses it)
     * @param input - input Turtle document
     * @param config - config for the reader
     */
    static async run(input: Input, config: TurtleLoaderConfig): Promise<Dataset>;


    constructor(config: TurtleLoaderConfig);
}

export class TrigReader extends GraphyTransform implements RDF.Sink<EventEmitter> {
    constructor(config: TrigReaderConfig);
}



export interface WritableC3 {
    type: 'c3',
    value: ConciseTriples,
}

export interface WritableC4 {
    type: 'c4',
    value: ConciseQuads,
}

export type WritableDataEvent = Quad | WritableC3 | WritableC4;

export class TurtleWriter extends GraphyTransform implements RDF.Sink<WritableDataEvent> {
    write(data: WritableDataEvent, cb?: (error: Error) => void): boolean;
    write(data: WritableDataEvent, encoding?: string, cb?: (error: Error) => void): boolean;

    read(): Error;

}

