# graphy v5 Alpha 0 - Preview v3
![Gitter](https://img.shields.io/gitter/room/graphy-js/community) ![GitHub issues](https://img.shields.io/github/issues/blake-regalia/graphy.js) 

## v4 of this Preview Document
 - v4: add TL;DR
 - v3: added WHATWG Streams section
 - v2: added Content Writers section
 - v1: first published draft

**Table of Contents**
 - [Foreword](#foreword)
 - [TL;DR](#tl-dr)
 - [Features](#features)
   - [RDF-Star](#rdf-star)
   - [Content Loaders](#content-loaders)
   - [WHATWG Streams](#whatwg-streams)
   - [Numeric Literals](#numeric-literals-and-friends)
   - [Prefix Maps](#prefix-maps)
   - [Error Reporting](#error-reporting)
   - [Advanced Typings](#advanced-typings)
 - [Breaking Changes](#breaking-changes)
   - [Scoped Packages](#scoped-packages)
   - [C1 Syntax](#c1-syntax)
   - [Content Readers](#content-readers)
 - [Roadmap](#roadmap)
   - [Content Writers](#content-writers)

## Foreword
This document summarizes notable changes introduced in the upcoming v5 alpha release. It is possible that some features described in this document are not yet fully implemented. Furthermore, some features and breaking changes have not yet been added to this document. All material may be subject to change prior to beta releases.

The primary purpose of this document is to preview these changes to the community in order to collect feedback. Comments and suggestions are very welcome!
Please [open an issue](https://github.com/blake-regalia/graphy.js/issues) on the monorepo or drop by the [gitter channel](https://gitter.im/graphy-js/community).


## TL;DR
 - [RDF-Star](#rdf-star) supported throughout
 - [Content Loaders](#content-loaders) are RDF deserializers that load quads directly into an in-memory dataset
 - [WHATWG Streams](#whatwg-streams) are now supported for reading and writing
 - [Numeric Literals](#numeric-literals-and-friends) provide ES primitive values for certain XSD datatypes
 - [Prefix Maps](#prefix-maps) now support base IRIs and have internal caches
 - [Error Reporting](#error-reporting) has significantly improved for readers
 - [Advanced Typings](#advanced-typings) for TypeScript allow for deep static code analysis


## Features

### RDF-Star
RDF-Star is now supported throughout graphy in the form of:
 - Ability to read/write Turtle-* via RDF-Star mode in `TurtleReader` and `TurtleWriter`
 - `Quad` creation and serialization
 - `.star()` methods on Terms for serializing to Turtle-*
 - Ability to reify RDF-Star terms for RDF 1.1 backwards-compatibilty

### Content Loaders 
From observations of graphy and other RDFJS libraries in the wild, it appears that the most frequent use of _Content Readers_ (what some call "parsers") is for deserializing RDF datasets into memory where they can be searched, counted and editted. However, the pipeline of [reader --> dataset] is not at all efficient for some formats.

This is where _Content Loaders_ come into play; they deserialize RDF strings/documents directly into a dataset instance that lives in memory. Content Loaders are able to take advantage of Turtle and TriG's tree-based syntax and map quads into a tree-based data structure in memory. They are also able to take advantage of prefixed names by completely bypassing the need to expand prefixes when loading. Instead, Content Loaders simply pass formatted strings to the dataset rather than creating RDFJS Terms.

The result of running a Content Loader returns a dataset in memory that is ready for searching, counting, editting, etc. Since the underlying data structure of an RDF dataset's implementation affects several speed vs. density tradeoffs, users may select between different dataset implementations to use for loading. In fact, Content Loaders depend on the dataset via an interface, so users are free to implement their own.

```js
import {TurtleLoader} from '@graphy/content';

(async() => {
    const dataset = await TurtleLoader.run(process.stdin);
    dataset.size;  // count distinct number of triples
})();
```

> TODO: Early benchmarks of Content Loader performance vs Content Reader + Dataset


### Numeric Literals and Friends
Literals created with one of the following XSD datatypes now have properties that provide users with the equivalent ES primitive value such as `.boolean`, `.number` (with precision loss detection), `.bigint` and `.date`:
 - `xsd:boolean`
 - `xsd:integer`
 - `xsd:double` - including NaN and negative/positive infinity
 - `xsd:decimial`
 - `xsd:date`
 - `xsd:dateTime`

> The following types are shown here to give a general idea of Numeric Literals and are for display purposes only, they are not comprehensive and do not reflect the implementation of the actual typings

```ts
// for display purposes only
interface BooleanLiteral extends Literal {
	isBooleanLiteral: true;
	boolean: boolean;
	isNumericLiteral: false;
	isNumberPrecise: true;
	number: 0 | 1;
	bigint: 0n | 1n;
}

interface NumericLiteral extends Literal {
	isNumericLiteral: true;
	number: number;
}

interface IntegerLiteral extends NumericLiteral {
	isIntegerLiteral: true;
	isNumberPrecise: boolean;  // ES numbers can only fit up to 53-bit integers
	bigint: bigint;  // however, bigint is able to store much larger integers
}

interface DoubleLiteral extends NumericLiteral {
	isDoubleLiteral: true;
	isNumberPrecise: true;  // ES numbers are XSD doubles
	bigint: NaN;
}

interface InfiniteLiteral extends DoubleLiteral {
	isInfiniteLiteral: true;
	isNumberPrecise: false;
}

interface PositiveInfinityLiteral extends DoubleLiteral {
	number: Infinity;
}

interface NegativeInfinityLiteral extends InfiniteLiteral {
	number: -Infinity;
}

interface NaNLiteral extends DoubleLiteral {
	isNaNLiteral: true;
	isNumberPrecise: false;
	number: NaN;
}

interface DecimalLiteral extends NumericLiteral {
	isDecimalLiteral: true;
	isNumberPrecise: boolean;  // precision loss calculated on-demand
	number: number;
	bigint: NaN;
}

interface DateLikeLiteral {
    isNumericLiteral: false;
    isNumberPrecise: true;  // timestamp integer precision is to milliseconds
    number: number;  // timestamp in milliseconds
    bigint: bigint;  // timestamp in milliseconds
    date: Date;
}

interface DateLiteral extends DateLikeLiteral {
	isDateLiteral: true;
}

interface DateTimeLiteral extends DateLikeLiteral {
	isDateTimeLiteral: true;
}
```


### WHATWG Streams
Content Readers now support WHATWG streams and overall play much nicer with Web APIs in the browser. 

```js
import {
    TurtleLoader,
} from '@graphy/content';

(async() => {
    // initiate a request to download a Turtle file
    const data = fetch('./people-data.ttl');

    // run() accepts Response objects
    await TurtleLoader.run(await data, loadOptions);

    // it also automatically resolves Promises, so awaitting is optional
    await TurtleLoader.run(data, loadOptions);

    // perhaps we want to read the Response body in more than one place
    const [
        readableStream1,
        readableStream2,
    ] = (await data).body.tee();

    // run() accepts ReadableStreams too! and it will take care of any decoding if necessary
    await TurtleLoader.run(readableStream2, loadOptions);
})();
```


### Prefix Maps
A PrefixMap is simply an object whose keys are prefixes and corresponding values are IRIs. From the user perspective, PrefixMaps are trivial to create and pass around by reference to various functions and constructors.

v5 adds a few minor features to the PrefixMap interface such as the ability to store a Base IRI, a hidden cache for reverse lookups, cache invalidation and object freezing. Since these features are also used internally and by certain utility functions, users do not necessarily need to be aware of any of these features in order to benefit from them.

```js
import {
    setBaseIri, relatePrefixMaps, prefixMapsDiffer,
} from '@graphy/core';
import {TurtleWriter} from '@graphy/content';

// define some prefixes
const prefixes = {
    owl: 'http://www.w3.org/2002/07/owl#',
    dct: 'http://purl.org/dc/terms/',
};

// set a base IRI so that it goes wherever the prefix map goes
setBaseIri(prefixes, 'http://sevro.me/about#');

// pass prefixes and base IRI to a writer
new TurtleWriter({
    prefixes: prefixes,
});

// define some more prefixes
const prefixes2 = {
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    owl: 'http://barn.org/owl#',
};

// deduce the relation between two prefix maps
relatePrefixMaps(prefixes, prefixes2);
// ^ {relation:'overlap', conflicts:['owl']}

// are they just different?
prefixMapsDiffer(prefixes, prefixes2);  // true

// some more examples
const rpm = relatePrefixMaps;
rpm(prefixes, prefixes).relation;  // 'equal'
rpm(prefixes, {my:'http://my.org/'}).relation;  // 'disjoint'
rpm(prefixes, {owl:prefixes.owl}).relation;  // 'subset'
```

### Error Reporting
In previous versions of graphy, RDF documents containing invalid syntax within their content could be difficult to trace back to the source due to a lack of line/col tracking. v5 adds line/col tracking support as well as rich, informative error messages:

```console

@graphy/content.ContentSyntaxError<TurtleReader>: Syntax error found while reading input.
  at { line: 24443, col: 1776 }

  ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┍┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┻┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┑┈┈┈┈┈┈┈┈┈┈┈┈
  -syntax-ns#type> <http://dbpedia.org/class/yago/Wikicat"WeirdAl"YankovicSongs>; <http://ww
  ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┕┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┳┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┙┈┈┈┈┈┈┈┈┈┈┈┈

  Invalid IRI: <http://dbpedia.org/class/yago/Wikicat"WeirdAl"YankovicSongs>
    at Consumer.check_named_node_escapeless (file:///Users/blake/dev/graphy/build/module/content/ttl/read/main.mjs:698:12)
    at Consumer.object_list (file:///Users/blake/dev/graphy/build/module/content/ttl/read/main.mjs:2598:31)
    at Consumer.pairs (file:///Users/blake/dev/graphy/build/module/content/ttl/read/main.mjs:2046:21)
    at Consumer.post_object (file:///Users/blake/dev/graphy/build/module/content/ttl/read/main.mjs:4714:19)
    at Consumer.safe_parse (file:///Users/blake/dev/graphy/build/module/content/ttl/read/main.mjs:1101:21)
    at ReadStream.<anonymous> (file:///Users/blake/dev/graphy/build/module/content/ttl/read/main.mjs:897:26)
    at ReadStream.emit (node:events:394:28)
    at addChunk (node:internal/streams/readable:312:12)
    at readableAddChunk (node:internal/streams/readable:287:9)
    at ReadStream.Readable.push (node:internal/streams/readable:226:10)
```


### Advanced Typings
TypeScript support has been a requested feature for quite some time. All modules exported by graphy in v5 will now ship with complete typings in order to help with type-checking and autocompletion. However, it doesn't stop there. A type-only module named `@graphy/types` provides a suite of advanced type inferencing tools that are able to carry out deep static code analysis both internally and optionally externally (for advanced users). These types go far beyond what other libraries offer.

 - Ability to describe and infer types for the following Term properties:
   - `.termType`, `.value`, `.language`, `.datatype`, `.subject`, `.predicate`, `.object`, and `.graph`
 - Static code analysis for the `Term#equals()` method
 - TypeScript BCP-47 parser for static string types
 - TypeScript IRI parser for static string types
 - Static prefix expansion
 - RDF mode-dependent typings for Quad components, where the types accepted for subject, predicate, object, graph and datatype depend on the RDF mode:
   - supports RDF-1.1, RDF-Star and easier-RDF
 - ... and more planned on the roadmap

Here is a simple demonstration of some use case examples:
```ts
import {
    fromC1,
    DataFactory as factory,
} from '@graphy/core';

let hello = fromC1('@en-US"Hello world!');

// at this point, `hello` has now automatically inheritted the following extended type information:
typeof hello extends {
    termType: 'Literal';
    value: 'Hello world!';
    language: 'en-US';
    datatype: {
        termType: 'NamedNode';
        value: 'http://www.w3.org/2000/01/rdf-schema#langString';
    };
};

let hey = factory.literal('hey world', 'en-US');

// the `Term#equals()` method performs deep static analysis to deduce the expected return type
const isSame = hello.equals(hey);
// at this point, `isSame` has inheritted the type `false` because the typings for `.equals` deduced the terms have different values

// ability to parse and validate BCP-47 language tags
typeof BCP47<'en-far-US-POSIX'> extends {
    _input: 'en-far-US-POSIX';
    _normalized: 'en-far-us-posix';
    language: 'en';
    extendedLanguageSubtags: ['far'],
    region: 'US';
    variants: ['POSIX'];
    privateuse: ['private', 'use'];
};
```

The `@graphy/types` module provides type utilities for advanced users who may wish to develop custom functions:
```ts
import type {
    Literal,
} from '@graphy/types';

// create a narrowing function using a type predicate
function isInEnglish(term): term is Literal<string, 'en' | `en-${string}`> {
    return term.isLiteral && term.language.startsWith('en');
}

if(isInEnglish(someLiteral)) {
    // typeof someLiteral.termType now extends 'Literal';
    // typeof someLiteral.language now extends 'en' | `en-${string}`;
}

const noEn: Literal<string, 'en'>;
const noFr: Literal<string, 'fr'>;
noEn.equals(noFr);  // return type of this expression is `false`

const noEnFr: Literal<string, 'en' | 'fr'>;
noEn.equals(noEnFr);  // return type of this expression is `boolean`
```


## Breaking Changes


<a name="scoped-packages" />


### Names of scoped packages have changed
In previous versions, the various classes and functions that graphy exports are split up into separate packages in order to help reduce the amount of code a user would need to import in order to acheive a particular set of tasks, and subsequently reduce the size of their output  bundle file. However, due to the adoption of ES Modules, these exports no longer require the same degree of precision thanks to [Tree-Shaking](https://www.rollupjs.org/guide/en/#tree-shaking).

Consequently, many packages have coalesced into new modules which greatly simplifies the import experience.

**Before:**
```js
const trig_read = require('@graphy/content.trig.read');
const ttl_write = require('@graphy/content.ttl.write');
```

**After:**
```js
import {
    TrigReader,
    TurtleWriter,
} from '@graphy/content';
```


<a name="c1-syntax" />


### The syntax for concise-term strings (C1) has changed
The use of C1 strings to store and pass around RDF terms is one of the cheif mechanisms enabling graphy's performance. In previous versions, the term type of any C1 string could _almost_ be deduced by the first character of the string. There was an overlooked corner-case in which C1 strings that began with `"_"` could either be a blank node or a prefixed name.

In v5, the syntax has changed such that blank nodes are longer prefixed by `"_:"` but instead are now prefixed by `"#"`. Other features have been added to the syntax such as the ability to represent nested Quads. A simplified table of the updated syntax is shown below:

State                | Production
---------------------|-----------
Term                 | `AbsoluteIri \| TypeAlias \| BlankNode \| PlainLiteral \| LanguagedLiteral \| DatatypedLiteral \| Variable \| Quad \| Directive \| PrefixedName`
AbsoluteIri          | `'>' .+`
TypeAlias            | `a`
BlankNode            | `AnonymousBlankNode \| LabeledBlankNde`
AnonymousBlankNode   | `'#' '#' .*`
LabeledBlankNode     | `'#' .+`
PlainLiteral         | `'"' .*`
LanguagedLiteral     | `'@' [a-zA-A0-9-]+ PlainLiteral`
DatatypedLiteral     | `'^' Datatype PlainLiteral`
Datatype             | `AbsoluteDatatype \| RelativeDatatype`
AbsoluteDatatype     | `'>' [^"]+`
RelativeDatatype     | `'>' [^:"]* ':' [^"]*`
DefaultGraph         | `'*'`
Variable             | `'?' .+`
Quad                 | `'\f' Term '\r' Term '\n' Term '\t' Term`
Directive            | ```'\`' '[' [a-z0-9_-]* ']' JSON```
PrefixedName         | `.* ':' .*`


<a name="content-readers" />


### Content Readers
Content Readers are no longer exported as callable class functions and instead are simply exported as classes. A Content Reader may either be instantiated using the `new` operator or by calling the static async function `.run()`

```js
import {
    TurtleReader,
} from '@graphy/content';

// the recommended way to invoke a reader
(async() => {
    let statementCount = 0;

    // 1st arg can be a string, node.js stream, WHATWG ReadableStream, Response, async iterable, TypedArray, ArrayBuffer, or a Promise that resolves to any of those
    await TurtleReader.run(process.stdin, {
        // options...

        // this still works
        data(quad) {
            statementCount += 1;
        },

        // no more 'end' callback; only 'eof'
        eof(prefixMap) { /*...*/ },
    });
    
    // at this point, input stream has emited 'end' and reading is completely done!
    console.log(statementCount);
})();

// reading strings is synchronous  :)
TurtleReader.run(turtleString, {
    // ...
});

// in case you really like streams...
{
    // creates a Transform stream that can be written to and read from
    const readerTransform = new TurtleReader({
        // options...
    });
    
    readerTransform.on('data', () => { /*...*/ });
    readerTransform.write('@prefix a: <http://ex.org/a> .');
}
```


## Roadmap
These features are planned for v5 but have not yet been implemented.

### Content Writers
The Content Writers continue to gain more style options to enhance user control over the pretty-printing of RDF documents.

The ability to serialize collections has been noted as a requested feature and is planned to be included as part of the updates to Content Writers.

The following Turtle code demonstrates some of the new style options and the effects of their available option values:
```ttl
# heading: 'line' (default)
eg:Alice a dbo:Person ;
    foaf:name "Alice" .

eg:Bob a dbo:Person .


# heading: 'break-list'
eg:Alice
    a dbo:Person ;
    foaf:name "Alice" .

eg:Bob a dbo:Person .


# heading: 'break-all'
eg:Alice
    a dbo:Person ;
    foaf:name "Alice" .

eg:Bob
    a dbo:Person .


# terminator: 'line' (default)
eg:Alice a dbo:Person ;
    foaf:name "Alice" .

# terminator: 'break'
eg:Alice a dbo:Person ;
    foaf:name "Alice" ;
    .


# objects: 'line' (default)
eg:Alice a dbo:Person ;
    foaf:name "Alice" ;
    foaf:knows eg:Bob, eg:Charlie, eg:David, eg:Edward .

# objects: 'break'
eg:Alice a dbo:Person ;
    foaf:name "Alice" ;
    foaf:knows eg:Bob,
        eg:Charlie,
        eg:David,
        eg:Edward .

# objects: 'break-list'
eg:Alice a dbo:Person ;
    foaf:name "Alice" ;
    foaf:knows
        eg:Bob,
        eg:Charlie,
        eg:David,
        eg:Edward .

# objects: 'break-all'
eg:Alice a
        dbo:Person ;
    foaf:name
        "Alice" ;
    foaf:knows
        eg:Bob,
        eg:Charlie,
        eg:David,
        eg:Edward .
```




