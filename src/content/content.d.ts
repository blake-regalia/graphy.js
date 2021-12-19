import EventEmitter = NodeJS.EventEmitter;

import {
    Readable,
    Writable,
    Transform,
} from 'stream';

import {
    Dataset,
    Iri,
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


/**
 * Option inputs to Readers
 */
export interface ReaderConfig {
    /**
     * Specify a custom RDFJS DataFactory object to use when creating Terms instead of graphy's
     */
    dataFactory?: RDF.DataFactory;

    /**
     * Provide a base IRI to use when resolving relative IRIs in the document
     */
    baseIRI?: Iri;
    
    /**
     * Set the maximum character length for any token such as IRIs and prefixed names. Defaults to 2048 => http://stackoverflow.com/a/417184/1641160
     */
    maxTokenLength?: number;

    /**
     * Set the maximum character length for string literals. Defaults to 524288 (~1-2 MiB in UTF-16) in order to prevent an out-of-memory crash from potentially unclosed strings. Set to `Infinity` if you wish to disable the limits
     */
    maxStringLength?: number;

    /**
     * Controls the error message output color format
     */
    colorMode?: 'off' | 'ansi';
    

    /**
     * Callback each time a quad/triple is read
     * @param quad - the statement data
     */
    data?(quad: Quad): void;

    /**
     * Callback each time a comment is read
     * @param comment - the comment as a string
     */
    comment?(comment: string): void;

    /**
     * Callback in event of an unrecoverable error. If ommitted, the error will be thrown or the parent promise will be rejected
     * @param err - the error
     */
    error?(err: Error): void;
    
    /**
     * Callback each time the stream receives a new input chunk (useful for UIs showing read progress)
     * @param delta - the number of characters read during the last update
     */
    progress?(delta: number): void;

    /**
     * Callback once the process has successfully read the entire input
     * @param prefixes - the final prefix map
     */
    eof?(prefixes: PrefixMap): void;
}


export interface ScannerConfig extends ReaderConfig {
    preset?: 'count' | 'scribe' | 'ndjson';
    run?: JavaScriptCode;
    reduce?(accumulator: any, current: any): any;
    receive?(value: any, thread: number): any;
    threads?: number;
}

/**
 * Configuration to override the serialization of lists
 */
export interface ListsConfig {
    /**
     * The predicate to use in place of rdf:first
     */
    first: ConciseNamedNode;

    /**
     * The predicate to use in place of rdf:rest
     */
    rest: ConciseNamedNode;

    /**
     * The predicate to use in place of rdf:nil
     */
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

    /**
     * Refers to RDF collections
     */
    collections?: 'dense' | 'padded' | 'indent' | 'break';
}

/**
 * Option inputs to Writers
 */
export interface WriteConfig {
    /**
     * The prefix map to use when serializing the document
     */
    prefixes?: PrefixMap;

    /**
     * Optionally override the predicates used when serializing lists from c3/c4 objects
     */
    lists?: ListsConfig;

    /**
     * Control styling options when writing RDF to a supported output format
     */
    style?: StyleConfig;
}

/**
 * Option inputs to Turtle and TriG Readers
 */
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

/**
 * Option inputs to the Turtle Reader
 */
export interface TurtleReaderConfig extends TReaderConfig {
    /**
     * Star mode enables RDF-star for Turtle
     */
    star?: boolean;
}

/**
 * Option inputs to the TriG Reader
 */
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

/**
 * An object that only has static methods for reading Turtle documents
 */
export class TurtleReader {
    /**
     * Runs the reader on an input Turtle document (i.e., parses it)
     * @param input - input Turtle document (including a chain of Promises that eventually resolves to one)
     * @param config - config for the reader
     */
    static async run(input: Input, config: TurtleReaderConfig): Promise<void>;

    /**
     * @deprecated TurtleReader is not a constructor, it only has static methods
     */
    constructor(): never;
}

/**
 * Allows for creating RDFJS-compatible streams (node.js Transform) for reading Turtle documents
 */
export class TurtleReaderNodeStream extends GraphyTransform {
    constructor(config: TurtleReaderConfig);
}

/**
 * Allows for creating instances of WHATWG TransformStream for reading Turtle documents
 */
export class TurtleReaderWebStream extends TransformStream {
    constructor(config: TurtleReaderConfig);
}


/**
 * An object that only has static methods for loading Turtle documents
 */
export class TurtleLoader {
    /**
     * Runs the reader on an input Turtle document (i.e., parses it)
     * @param input - input Turtle document (including a chain of Promises that eventually resolves to one)
     * @param config - config for the reader
     */
    static async run(input: Input, config: TurtleLoaderConfig): Promise<Dataset>;

    /**
     * @deprecated TurtleLoader is not a constructor, it only has static methods
     */
    constructor(): never;
}

/**
 * An object that only has static methods for reading TriG documents
 */
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

