import EventEmitter = NodeJS.EventEmitter;

import {
    Transform,
} from 'stream';

import * from '@graphy/types';

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

export interface ReaderConfig {
    dataFactory?: RDF.DataFactory;
    baseIRI?: string;
    
    input?: string;
    maxTokenLength?: number;
    maxStringLength?: number;

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

export interface StyleConfig {
    indent?: string;
    graphKeyword?: boolean | 'graph' | 'Graph' | 'GRAPH';
    simplifyDefaultGraph?: boolean;
    directives?: 'turtle' | 'Turtle' | 'TURTLE' | 'sparql' | 'Sparql' | 'SPARQL';
}

export interface WriteConfig {
    prefixes?: PrefixMap;
    lists?: ListsConfig;
    style?: StyleConfig;
}

export interface TReaderConfig extends ReaderConfig {
    relax?: boolean;
    star?: boolean;

    base?(iri: Iri): void;
    prefix?(prefixId: string, iri: Iri): void;
    enter?(graph: Graphable);
    exit?(graph: Graphable);
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
    constructor(config: TReaderConfig);
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

