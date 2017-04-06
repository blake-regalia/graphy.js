# graphy.js 🍌
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] 

A **[faster-than-lightning](#benchmark-results)**, asynchronous, streaming RDF deserializer. It implements the [RDFJS Representation Interfaces](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#data-interfaces) and natively parses Turtle, TriG, N-Triples, and N-Quads.

> A future release is aiming to provide a query-like JavaScript API for traversing RDF graphs. It is currently under development. JSON-LD support has also been suspended until the expand algorithm is re-implemented.

# Contents
 - [Introduction & Example Usage](#intro)
 - [Setup](#install)
 - [**API** Documentation](#api)
 - [Compatibility](#compatibility) and [Performance](#performance)


### <a name="intro"></a> Parse serialized RDF graphs faster than lightning!
This library boasts a set of high performance parsers, each one is specialized for its corresponding serialization format. Consider the following benchmark test:

##### Count how many triples are in [DBpedia's 2015-04 English persondata.nt](http://wiki.dbpedia.org/Downloads2015-04#persondata) in N-Triples format:

using **graphy**:
```js
console.time('g'); const graphy = require('graphy'); let c_triples = 0;
let input = fs.createReadStream('persondata_en.nt');
graphy.nt.parse(input, {
    data(triple) {
        c_triples += 1;
    },
    end() {
        console.timeEnd('g');
        console.log(`${c_triples} triples parsed`);
    },
});
```

versus **[N3.js v0.4.5](https://github.com/RubenVerborgh/N3.js)**:
```js
console.time('n'); const n3 = require('n3'); let c_triples = 0;
let input = fs.createReadStream('persondata_en.nt');
new n3.Parser(/* faster w/o format*/).parse(input, function(err, triple) {
    if(triple) {
        c_triples += 1;
    }
    else {
        console.timeEnd('n');
        console.log(`${c_triples} triples parsed`);
    }
});
```

#### Benchmark Results:
Each benchmark listed was the best of 10 trials:

| DBpedia file             | # quads    | N3.js time | "" velocity  | graphy time | "" velocity    | speedup |
| ------------------------ | ----------:| ----------:| ------------:| -----------:| --------------:| -------:|
| persondata_en.nt         |  8,397,081 |   13859 ms | 605,871 op/s |     4792 ms | 1,752,276 op/s |  2.892x |
| instance-types_en.nq     |  5,647,972 |   12440 ms | 453,997 op/s |     6478 ms |   871,755 op/s |  1.920x |
| redirects_en.ttl         |  6,831,505 |   12098 ms | 564,670 op/s |     7000 ms |   975,810 op/s |  1.728x |
| persondata_en.ttl        |  8,397,081 |   15740 ms | 533,463 op/s |     9287 ms |   904,084 op/s |  1.694x |
| article-categories_en.nq | 20,232,709 |   46386 ms | 436,172 op/s |    27561 ms |   734,098 op/s |  1.683x |

What's the catch? [See Performance details](#performance)

### Piping streams to transform
Streams can also be piped into graphy to [use it as a Transform](#graphy-ttl-parse-transform).
```js
const request = require('request');
request(path_to_remote_data)
    .pipe(graphy.ttl.parse({
        data(triple, output) {
            let string_chunk = do_something(triple);
            output.push(string_chunk);
        },
    })
    .pipe(fs.createWriteStream(path_to_output_file));
```

## Setup

**Install it as a dependency for your project:**
```sh
$ npm install --save graphy
```


----
## API
 - [Introduction](#introduction)
 - [Pseudo-Datatypes](#pseudo-datatypes)
 - [DataFactory](#graphy-factory)
 - [Parsing](#parsing)
 - [RDF Data](#rdf)

### Introduction
The module does not `require` its dependencies until they are explicitly accessed by the user (i.e., they are lazily loaded), so only what is requested will be loaded (the same goes for browsers, so long as you are using [browserify](http://browserify.org/) to bundle your project). 

However, no matter which component of graphy you are loading, the DataFactory methods will always be available. These allow you to create new instances of RDF terms for comparing, injecting, serializing, or using alongside their parser-derived siblings.

### Pseudo-Datatypes:
Throughout this API document, the following datatypes are used to represent expectations imposed on primitive-datatyped parameters to functions, exotic uses of primitives in class methods (*in future versions*), and so forth:
 - `hash` - refers to a simple `object` with keys and values (e.g. `{key: 'value'}`)
 - `key` - refers to a `string` used for accessing an arbitrary value in a `hash`
 - `list` - refers to a one-dimensional `Array` containing only elments of the same type/class


### <a name="graphy-factory"></a> **graphy** implements @RDFJS DataFactory
The module's main export implements the [RDFJS DataFactory](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#datafactory)

```js
const graphy = require('graphy');
```

**Methods:**
 - `graphy.namedNode (iri: string)`
   - **returns** a [new NamedNode](#namednode)
   - *example:*

       ```js
       graphy.namedNode('ex://test')+'';  // '<ex://test>'
       ```

 - `graphy.literal(contents: string[, datatype_or_lang: string|langtag])`
   - **returns** a [new Literal](#literal) with optional `datatype_or_lang`
   - *example:*

       ```js
       graphy.literal('"')+'';  // '"\""^^<http://www.w3.org/2001/XMLSchema#string>'
       graphy.literal('42', 'ex://datatype')+'';  // '"42"^^<ex://datatype>'
       graphy.literal('hello Mars!', '@en')+'';  // '"hello Mars!"@en'
       ```

 - `graphy.blankNode` : `function`
   - *{function}* `()` -- no args constructor will generate a new UUID4 in order to thwart label collisions
   - *{function}* `(label: string)` -- uses the given `label` 
   - *{function}* `(label_manager: Parser|Graph|other)` -- calls `label_manager.next_label()` to generate a new label. Alwyas better to use this method than the no-args version because it guarantees collision-free labels and is also more efficient.
     - **returns** a [new BlankNode](#blanknode)
     - *example:*

         ```js
         graphy.blankNode()+'';  // '_:439e14ae_1531_4683_ac96_b9f091da9595'
         graphy.blankNode('label')+'';  // '_:label'
         graphy.nt.parse('<a> <b> <c> .', {
            data() { graphy.blankNode(this)+''; },  // _:g0
         });
         ```

 - `graphy.defaultGraph()`
   - **returns** a [new DefaultGraph](#defaultgraph)
   - *example:*

       ```js
       graphy.defaultGraph()+'';  // ''
       graphy.defaultGraph().termType;  // 'DefaultGraph'
       ```

 - `graphy.triple(subject: Term, predicate: Term, object: Term)`
   - **returns** a [new Triple](#triple)
 - `graphy.quad(subject: Term, predicate: Term, object: Term, graph: Term)`
   - **returns** a [new Quad](#quad)
 
----
### Parsing
This section documents graphy's high performance parser, which can be used directly for parsing a readable stream, transforming a readable stream to a writable stream, and parsing static strings. Each parser also allows [pausing and resuming the stream](#stream-control).
 - [Parse events](#parse-events)
   - [ready()](#event-ready)
   - [data(quad: Quad)](#event-data)
   - [prefix(id: string, iri: string)](#event-prefix)
   - [base(iri: string)](#event-base)
   - [graph_open(graph: Term)](#event-graph-open)
   - [graph_close(graph: Term)](#event-graph-close)
   - [error(message: string)](#event-error)
   - [end(prefixes: hash)](#event-end)
 - [Stream Control](#stream-control)
 - [Parse options](#parse-options)
   - [max_token_length](#option-max-token-length)
   - [max_string_length](#option-max-string-length)
 - **Parsers**
   - [Turtle (.ttl) - `graphy.ttl.parse`](#graphy-ttl-parse)
   - [TriG  (.trig) - `graphy.trig.parse`](#graphy-trig-parse)
   - [N-Triples  (.nt) - `graphy.nt.parse`](#graphy-nt-parse)
   - [N-Quads  (.nq) - `graphy.nq.parse`](#graphy-nq-parse)
 
#### Parse Events
The parsers are engineered to run as fast as computerly possible. For this reason, they do not extend EventEmitter, which normally allows event handlers to bind via `.on()` calls. Instead, any event handlers must be specified during a call to the parser. The name of an event is given by the key of a `hash` that gets passed as the `config`, where the value of each entry is the event's callback function.

For example:
```js
const parse_trig = graphy.trig.parse;
parse_trig(input, {
    data(quad) {  // 'data' event handler
        // ..
    },
    error(parse_error) {  // 'error' event handler
        // ..
    },
});
```

##### <a name="event-ready"></a> Event: ready()
Gets called once the input stream is readable. On the other hand, if the input is a string then this event gets called immediately.

##### <a name="event-data"></a> Event: data(quad: [Quad](#triple)[, output: list])
Gets called once for each triple/quad as soon as it is parsed. The `output` list is for `.push`ing strings to the output stream which is only available when the parser is [used as a transform](#graphy-ttl-parse-transform).

<a name="event-prefix" />
##### Event: prefix(id: string, iri: string)
Gets called once for each `@prefix` statement as soon as it is parsed. `id` is the name of the prefix without the colon (e.g., `'dbr'`) and `iri` is the full URI of the associated mapping (e.g., `'http://dbpedia.org/resource/'`).
> Only for [`graphy.ttl.parse`](#graphy-ttl-parse) and [`graphy.trig.parse`](#graphy-trig-parse)

<a name="event-base" />
##### Event: base(iri: string)
Gets called once for each `@base` statement as soon as it is parsed. `iri` is the full URI of the new base.
> Only for [`graphy.ttl.parse`](#graphy-ttl-parse) and [`graphy.trig.parse`](#graphy-trig-parse)

<a name="event-graph-open" />
##### Event: graph_open(term: Term)
Gets called once for each graph block as soon as the opening `{` character is parsed. `term` is either a [NamedNode](#namednode), [BlankNode](#blanknode) or [DefaultGraph](#defaultgraph).
> Only for [`graphy.trig.parse`](#graphy-trig-parse)

<a name="event-graph" />
##### Event: graph_close(term: Term)
Gets called once for each graph block as soon as the closing `}` character is parsed. `term` is either a [NamedNode](#namednode), [BlankNode](#blanknode) or [DefaultGraph](#defaultgraph).
> Only for [`graphy.trig.parse`](#graphy-trig-parse)

<a name="event-error" />
##### Event: error(message: string)
Gets called if a parsing error occurs at any time. If an error does occur, no other events will be called on the instance after this. If you do not include an `error` event handler, the parser will throw the error's `message` string.

<a name="event-end" />
##### Event: end([prefixes: hash])
Gets called once at the very end of the input. For piped streams, this occurs once the Readable input stream has no more data to be consumed (i.e., `Transform#_flush`). For stream objects, this occurs after the stream's 'end' event.

> The `prefixes` argument is a hash of the final mappings at the time the end of the input was reached. It is only available for [`graphy.ttl.parse`](#graphy-ttl-parse) and [`graphy.trig.parse`](#graphy-trig-parse)

----
#### Stream Control
For any of the event callbacks listed above, you can control the stream's state and temporarily suspend events from being emitted by making calls through `this`.

For example:
```js
parse_ttl(input, {
    data(triple) {
        if(triple.object.isNamedNode) {
            this.pause();  // no events will be emitted ...
            asyncFunction(() => {
                this.resume();  // ... until now
            });
        }
    },
});
```

#### `this.pause()`
 - Immediately suspends any `data`, `prefix` or `base` events from being emitted until `this.resume()` is called. Also pauses the readable input stream until more data is needed.
   - Some of the parsers will finish parsing the current chunk of stream data before the call to `this.pause()` returns, others will finish parsing the current production. When this happens, the parser queues any would-be events to a buffer which will be released to the corresponding event callbacks once `this.resume()` is called.

#### `this.resume()`
 - Resumes firing event callbacks. Once there are no more queued events, the parser will automatically resume the readable input stream.

#### `this.stop()`
 - Immediately stops parsing and permanently unbinds all event liteners so that no more events will be emitted, not even `end`. Will also attempt to close the input stream if it can (calls `.destroy` on `fs.ReadStream` objects). Useful for exitting read streams of large files prematurely.
 - *example:*

     ```js
     parse_ttl(fs.createReadStream('input.ttl'), {
        data(triple) {
            // once we've found what we're looking for...
            if(triple.object.isLiteral && /find me/.test(triple.object.value)) {
                this.stop();
            }
        },
     });
     ```



----
#### Parse Options
In addition to [specifying events](#parse-events), the parser function's `config` parameter also accepts a set of options:

<a name="option-max-token-length" />
##### Option: max_token_length
A `number` that defines the maximum number of characters to expect of any token other than a quoted literal. This option only exists to prevent invalid input from endlessly consuming the parser when using streams as input. By default, this value is set to **2048**, which is more than the recommended maximum URL length. However, you may wish to set this value to `Infinity` if you never expect to encounter invalid syntax on the input stream.

<a name="option-max-string-length" />
##### Option: max_string_length
A `number` that defines the maximum number of characters to expect of any quoted literal. This option only exists to prevent invalid input from endlessly consuming the parser (such as a long-quoted literal `""" that never ends...`) when using streams as input. By default, this value is set to **65536** characters. However, you may set this value to `Infinity` if you never expect to encounter invalid syntax on the input stream.


----
<a name="graphy-ttl-parse" />
#### graphy.ttl.parse
The Turtle parser:
```js
const parse_ttl = graphy.ttl.parse;
```

The parse function (in the example above, `parse_ttl`) has three variants:

##### parse_ttl(input: string, config: hash)
Synchronously parses the given `input` string. It supports the event handlers:  [`data`](#event-data), [`prefix`](#event-prefix), [`base`](#event-base), [`error`](#event-error) and [`end`](#event-end). If a call to `this.pause()` is made during event callbacks, the operation becomes asynchronous.

*Example:*
```js
parse_ttl('@prefix : <http://ex.org>. ex:s ex:p: ex:o.', {
    data(triple) {
        console.log(triple+'');  // '<http://ex.org/s> <http://ex.org/p> <http://ex.org/o> .'
    },
});
```

##### parse_ttl(input: Stream, config: hash)
Asynchronously parses the given `input` stream. It supports the event handlers: [`data`](#event-data), [`prefix`](#event-prefix), [`base`](#event-base), [`error`](#event-error) and [`end`](#event-end).

*Example:*
```js
// download images from DBpedia
let foaf_depiction = 'http://xmlns.com/foaf/0.1/depiction';
parse_ttl(fs.createReadStream('input.ttl'), {
    data(triple) {  // for each triple...
        if(triple.predicate.startsWith(foaf_depiction)) {
            download_queue.push(triple.object.value);  // download the image
            if(download_queue.is_full) {  // if there's too many requests...
                this.pause();
                download_queue.once('available', () => {
                    this.resume();
                });
            }
        }
    },
});
```

<a name="graphy-ttl-parse-transform" />
##### parse_ttl(config: hash)
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`prefix`](#event-prefix), [`base`](#event-base), [`error`](#event-error) and [`end`](#event-end) and an **extended version** of the [`data`](#event-data) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join all the strings in this `output` array (by an empty character) and then write that to the output.

*Example:*
```js
// convert a .ttl Turtle file into a .nt N-Triples file
fs.createReadStream('input.ttl', 'utf8')
    .pipe(parse_ttl({
        data(triple, output) {  // for each triple...
            // cast it to a string to produce N-Triples canonicalized form
            output.push(triple+'');
        },
    }))
    .pipe(fs.createWriteStream('output.nt'));
```

----
<a name="graphy-trig-parse" />
#### graphy.trig.parse
The TriG parser:
```js
const parse_trig = graphy.trig.parse;
```

The parse function (in the example above, `parse_trig`) has three variants:

##### parse_trig(input: string, config: hash)
Synchronously parses the given `input` string. It supports the event handlers: [`data`](#event-data), [`graph`](#event-graph), [`prefix`](#event-prefix), [`base`](#event-base), [`error`](#event-error) and [`end`](#event-end). If a call to `this.pause()` is made during event callbacks, the operation becomes an asynchronous.

*Example:*
```js
parse_trig('@prefix : <http://ex.org>.  ex:g { ex:s ex:p: ex:o. }', {
    data(quad) {
        console.log(quad+'');  // '<http://ex.org/s> <http://ex.org/p> <http://ex.org/o> <http://ex.org/g> .'
    },
});
```

##### parse_trig(input: stream, config: hash)
Asynchronously parses the given `input` stream object. It supports the event handlers: [`data`](#event-data), [`graph`](#event-graph), [`prefix`](#event-prefix), [`base`](#event-base), [`error`](#event-error) and [`end`](#event-end).

*Example:*
```js
// only inspect triples within a certain graph
let inspect = false;
parse_trig(input, {
    graph_open(graph) {
        if(graph.value === 'http://target-graph') inspect = true;
    },
    graph_close(graph) {
        if(inspect) inpsect = false;
    },
    data(quad) {
        if(inspect) {  // much faster than comparing quad.graph to a string
            // do something with triples
        }
    },
});
```

##### parse_trig(config: hash)
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`graph`](#event-graph), [`prefix`](#event-prefix), [`base`](#event-base), [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`data`](#event-data) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join all the strings in this `output` array (by an empty character) and then write that to the output.

*Example:*
```js
// convert a .trig TriG file into a .nq N-Quads file
fs.createReadStream('input.trig', 'utf8')
    .pipe(parse_trig({
        data(quad, output) {  // for each quad...
            // cast it to a string to produce its canonicalized form
            output.push(quad+'');
        },
    }))
    .pipe(fs.createWriteStream('output.nq'));
```

----
<a name="graphy-nt-parse" />
#### graphy.nt.parse
The N-Triples parser:
```js
const parse_nt = graphy.nt.parse;
```

The parse function (in the example above, `parse_nt`) has three variants:

##### parse_nt(input: string, config: hash)
Synchronously parses the given `input` string. It supports the event handlers: [`triple`](#event-triple), [`error`](#event-error) and [`end`](#event-end).

##### parse_nt(input: stream, config: hash)
Asynchronously parses the given `input` stream object. It supports the event handlers: [`triple`](#event-triple), [`error`](#event-error) and [`end`](#event-end).

##### parse_nt(config: hash)
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`triple`](#event-triple) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join all the strings in this `output` array (by an empty character) and then write that to the output.


----
<a name="graphy-nq-parse" />
#### graphy.nq.parse
The N-Quads parser:
```js
const parse_nq = graphy.nq.parse;
```

The parse function (in the example above, `parse_nq`) has three variants:

##### parse_nq(input: string, config: hash)
Synchronously parses the given `input` string. It supports the event handlers: [`quad`](#event-quad), [`error`](#event-error) and [`end`](#event-end).

##### parse_nq(input: stream, config: hash)
Asynchronously parses the given `input` stream object. It supports the event handlers: [`quad`](#event-quad), [`error`](#event-error) and [`end`](#event-end).

##### parse_nq(config: hash)
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`quad`](#event-quad) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join all the strings in this `output` array (by an empty character) and then write that to the output.

----
## RDF Data
The following section documents how graphy represents RDF data in its various forms.


<a name="term" />
### abstract **Term** implements @RDFJS Term
An abstract class that represents an RDF term by implementing the [RDFJS Term interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#term). If you are looking to create an instance of Term, see the [graphy DataFactory](#graphy-factory).

**Properties:** (implementing RDFJS Term interface)
 - `.termType` : `string` -- either `'NamedNode'`, `'BlankNode'`, `'Literal'` or `'DefaultGraph'`
 - `.value` : `string` -- depends on the type of term; could be the content of a [Literal](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#literal-extends-term), the label of a [BlankNode](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#blanknode-extends-term), or the IRI of a [NamedNode](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#namednode-extends-term)

**Methods:** (implementing RDFJS Term interface)
 - `.equals(other: Term)` -- tests if this term is equal to `other`
   - **returns** a `boolean`
 - `.toCanonical()` -- produces an [N-Triples canonical form](https://www.w3.org/TR/n-triples/#canonical-ntriples) of the term
   - **returns** a `string`

**Methods:**
 - `.valueOf()` -- gets called when cast to a `string`. It simply returns `.toCanonical()`
   - **returns** a `string`
   - *example:*

       ```js
       let hey = graphy.namedNode('hello');
       let you = graphy.literal('world!', '@en');
       console.log(hey+' '+you); // '<hello> "world!"@en'
       ```

      

----
<a name="namednode" />
### **NamedNode** extends Term implements @RDFJS NamedNode
A class that represents an RDF named node by implementing the [RDFJS NamedNode interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#namednode-extends-term)

**Properties:** (inherited from Term & implementing RDFJS NamedNode)
 - `.termType` : `string` = `'NamedNode'`
 - `.value` : `string` -- the IRI of this named node

**Properties:**
 - `.isNamedNode` : `boolean` = `true` -- the preferred and fastest way to test for NamedNode term types

**Methods:**
 - ... [those inherited from Term](#term)


----
<a name="blanknode" />
### **BlankNode** extends Term implements @RDFJS BlankNode
A class that represents an RDF blank node by implementing the [RDFJS BlankNode interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#blanknode-extends-term)

**Properties:** (inherited from Term & implementing RDFJS NamedNode)
 - `.termType` : `string` = `'BlankNode'`
 - `.value` : `string` -- the label of this blank node (i.e., without leading `'_:'`)

**Properties:**
 - `.isBlankNode` : `boolean` = `true` -- the preferred and fastest way to test for BlankNode term types

**Methods:**
 - ... [those inherited from Term](#term)


----
<a name="literal" />
### **Literal** extends Term implements @RDFJS Literal
A class that represents an RDF literal by implementing the [RDFJS Literal interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#literal-extends-term)

**Properties:** (inherited from Term & implementing RDFJS Literal interface)
 - `.termType` : `string` = `'Literal'`
 - `.value` : `string` -- the content of this literal

**Properties:** (implementing RDFJS Literal interface)
 - `.datatype` : `string` -- the datatype IRI of this literal
 - `.language` : `string` -- the language tag associated with this literal (empty string if it has no language)

**Properties:**
 - `.isLiteral` : `boolean` = `true` -- the preferred and fastest way to test for Literal term types

> Notice: Some serialization formats allow for "simple literals", which do not have an explicit datatype specified. These literals have an implicit datatype of `xsd:string` - however, you can test if an instance of Literal was created with an explicit datatype by using `Object.hasOwnProperty` to discover if `datatype` is defined on the instance object itself or in its protoype chain:

```js
let simple = graphy.literal('no datatype');
simple.datatype;  // 'http://www.w3.org/2001/XMLSchema#string'
simple.hasOwnProperty('datatype');  // false

let typed = graphy.literal('yes datatype', 'ex://datatype');
typed.datatype;  // 'ex://datatype'
typed.hasOwnProperty('datatype');  // true

let langed = graphy.literal('language tag', '@en');
simple.datatype;  // 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString'
```

----
<a name="integerliteral" />
### **IntegerLiteral** extends Literal
A class that represents an RDF literal that was obtained by deserializing a syntactic integer.

> Only available in Turtle and TriG

**Properties:** (inherited from / overriding Literal)
 - ... [those inherited from Literal](#literal)
 - `.datatype` : `string` = `'http://www.w3.org/2001/XMLSchema#integer'`
 
**Properties:**
 - `.number` : `number` -- the parsed number value obtained via `parseInt`
 - `.isNumeric` : `boolean` = `true`

----
<a name="decimalliteral" />
### **DecimalLiteral** extends Literal
A class that represents an RDF literal that was obtained by deserializing a syntactic decimal.

> Only available in Turtle and TriG

**Properties:** (inherited from / overriding Literal)
 - ... [those inherited from Literal](#literal)
 - `.datatype` : `string` = `'http://www.w3.org/2001/XMLSchema#decimal'`
 
**Properties:**
 - `.number` : `number` -- the parsed number value obtained via `parseFloat`
 - `.isNumeric` : `boolean` = `true`

----
<a name="doubleliteral" />
### **DoubleLiteral** extends Literal
A class that represents an RDF literal that was obtained by deserializing a syntactic double.

> Only available in Turtle and TriG

**Properties:** (inherited from / overriding Literal)
 - ... [those inherited from Literal](#literal)
 - `.datatype` : `string` = `'http://www.w3.org/2001/XMLSchema#double'`
 
**Properties:**
 - `.number` : `number` -- the parsed number value obtained via `parseFloat`
 - `.isNumeric` : `boolean` = `true`

*Example:*

```js
graphy.ttl.parse('<a> <b> 0.42e+2 .', {
    data(triple) {
        triple.object.value;  // '0.42e+2'
        triple.object.number;  // 42
        triple.object.isNumeric;  // true
        triple.object.datatype;  // 'http://www.w3.org/2001/XMLSchema#double'
    },
});
```

----
<a name="booleanliteral" />
### **BooleanLiteral** extends Literal
A class that represents an RDF literal that was obtained by deserializing a syntactic boolean.

> Only available in Turtle and TriG

**Properties:** (inherited from / overriding Literal)
 - ... [those inherited from Literal](#literal)
 - `.datatype` : `string` = `'http://www.w3.org/2001/XMLSchema#boolean'`
 
**Properties:**
 - `.boolean` : `boolean` -- the boolean value, either `true` or `false`
 - `.isBoolean` : `boolean` = `true`

----
<a name="defaultgraph" />
### **DefaultGraph** extends Term implements @RDFJS DefaultGraph
A class that represents the default graph by implementing the [RDFJS DefaultGraph interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#defaultgraph-extends-term)

**Properties:** (inherited from Term & implementing RDFJS DefaultGraph interface)
 - `.termType` : `string` = `'DefaultGraph'`
 - `.value` : `string` = `''` -- always an empty string

**Properties:**
 - `.isDefaultGraph` : `boolean` = `true` -- the preferred and fastest way to test for DefaultGraph term types


----
<a name="quad" />
### **Quad** implements @RDFJS Quad
A class that represents an RDF triple/quad by implementing the [RDFJS Quad interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#quad)

**Properties:** (implementing RDFJS Quad interface)
 - `.subject` : [`[NamedNode|BlankNode]`](#namednode)
 - `.predicate` : [`NamedNode`](#namednode)
 - `.object` : [`Term`](#term)
 - `.graph` : `[NamedNode|BlankNode|DefaultGraph]`

**Methods:** (implementing RDFJS Quad interface)
 - `.equals(other: Quad[, ignore_graph: boolean])`
   - tests if `other` Quad is equal to this one, optionally ignoring the graph if `ignore_graph` is truthy.
   - **returns** a `boolean`
 - `.toCanonical()` -- produces an [N-Triples canonical form](https://www.w3.org/TR/n-triples/#canonical-ntriples) of the Quad.

**Methods:**
 - `.valueOf()` -- gets called when cast to a `string`. It simply returns `.toCanonical()`
   - **returns** a `string`
   - *example:*

       ```js
       graphy.quad(
           graphy.namedNode('subject'),
           graphy.namedNode('predicate'),
           graphy.namedNode('object'),
           graphy.namedNode('graph'),
       )+'';  // '<subject> <predicate> <object> <graph> .'
       ```


----
<a name="triple" />
### **Triple** aliases Quad implements @RDFJS Triple
A class that represents an RDF triple by implementing the [RDFJS Triple interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#quad). Same as `Quad` except that `.graph` will always be a [DefaultGraph](#defaultgraph).

**Properties:** (aliasing Quad & implementing RDFJS Triple interface)
 - `.graph` : [`DefaultGraph`](#defaultgraph)
 - ... and [those in Quad](#Quad)

**Methods:** (aliasing Quad & implementing RDFJS Triple interface)
 - ... [those in Quad](#Quad)


## Compatibility
Lexing input this fast is only possible by taking advantage of an ECMAScript 2015 feature (the sticky "y" RegExp flag) which is not yet implemented in all browsers, even though it is now the current standard ([see compatibility table](https://kangax.github.io/compat-table/es6/#test-RegExp_y_and_u_flags) at row `RegExp "y" and "u" flags`). It also means that only Node.js versions >= 6.0 are supported, which will also [soon be the new LTS](https://github.com/nodejs/LTS) anyway. Failure to use a modern engine with graphy will result in:
```
SyntaxError: Invalid flags supplied to RegExp constructor 'y'
    at new RegExp (native)
    ....
```

## Performance
High performance has a cost, namely that [this module is not a validator](#not-validator), although it **does handle parsing errors**. Full validation will likely never be implemented in graphy since it only slows down parsing and because [N3.js](https://github.com/RubenVerborgh/N3.js/) already does a fine job at it.

<a name="not-validator" />
#### Parser is intended for valid syntax only
This tool is intended for serialized formats that were generated by a machine. Quite simply, it does not check the contents of certain tokens for "invalid" characters; such as those found inside of: IRIs, prefixed names, and blank node labels.

For example:
```
<a> <iri refs aren't supposed to have spaces> <c> .
```

Is technically not valid TTL. However, graphy will not emit any errors. Instead, it will emit the following triple:
```
{
  subject: {value: 'a', termType: 'NamedNode', ...},
  predicate: {value: 'iri refs aren't supposed to have spaces', termType: 'NamedNode', ...},
  object: {value: 'c', termType: 'NamedNode', ...},
  graph: {value: '', ..}
}
```


The parser **does however** handle unexpected token errors that violate syntax. For example:
```
<a> _:blank_nodes_cannot_be_predicates <c> .
```

Emits the error:
```
`_:blank_nodes_cannot_be_predicates `
 ^
expected pairs.  failed to parse a valid token starting at "_"
```

You can check out the test case in [./test](./test)

### Debugging
If you are encountering parsing errors or possibly a bug with graphy, simply change your graphy import statement to `const graphy = require('graphy/es6')` to load the unminized, unmangled versions of the parsers which will yield more verbose parser errors (such as the state name which gets mangled during minimization). 

In case you are testing against N-Triples canonicalized forms, bear in mind the following things that graphy does:
 - Nested blank node property lists and RDF collections are emitted in the order they appear, rather than from the outside-in.
 - Anonymous blank nodes (e.g., `[]`) are assigned a label starting with the character `g`, rather than `b`. This is done in order to minimize the time spent testing and renaming conflicts with common existing blank node labels in the document (such as `_:b0`, `_:b1`, etc.).



#### Why bother checking for errors at all?

Stumbling into an invalid token does not incur a performance cost since it is the very last branch in a series of if-else jumps. It is mainly the characters inside of expected tokens that are at risk of sneaking invalid characters through. This is due to the fact that the parser uses the simplest regular expressions it can to match tokens, opting for patterns that only exclude characters that can belong to the next token, rather than specifying ranges of valid character inclusion. This compiles DFAs that require far fewer states with fewer instructions, hence less CPU time.


#### How graphy optimizes
Optimizations are acheived in a variety of ways, but perhaps the most general rule that guides the process is this: graphy tries parsing items based on benefit-cost ratios in descending order. "Benefit" is represented by the probability that a given route is the correct one (derived from typical document freqency), where "Cost" is represented by the amount of time it takes to test whether or not a given route *is* the correct one.

For example, double quoted string literals are more common in TTL documents than single quoted string literals. For this reason, double quoted strings literals have a higher benefit -- and since testing time for each of these two tokens is identical, then they have the same cost. Therefore, if we test for double quoted string literals before single quoted string literals, we end up making fewer tests a majority of the time.

However, the optimization doesn't stop there. We can significantly cut down on the cost of parsing a double quoted string literal if we know it does not contain any escape sequences. String literals without escape sequences are not significantly more common than literals with them, so the benefit is not very high - however, the cost savings is enormous (i.e., the ratio's denominator shrinks) and so it outweighs the benefit thusly saving time overall.

---


## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.svg
[npm-url]: https://npmjs.org/package/graphy
[travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/graphy.js
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js

