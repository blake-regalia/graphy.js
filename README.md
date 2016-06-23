# graphy.js
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] 

A **[faster-than-lightning](#benchmark-results)**, asynchronous, streaming RDF deserializer and [query/property-path-driven](#interaction-paradigm) JavaScript API for traversing RDF graphs. It implements the [RDFJS Representation Interfaces](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#data-interfaces) and natively parses Turtle, TriG, N-Triples, and N-Quads.

> JSON-LD support has been temporarily suspended until the expand algorithm is implemented.

# Contents
 - [Introduction & Example Usage](#intro)
 - [Setup](#install)
 - [**API** Documentation](#api)
 - [Compatibility](#compatibility) and [Performance](#performance)
 - [API Differences to N3.js](#n3-js)


<a name="intro" />
### Parse Serialized RDF Graphs Faster than Lightning!
This library boasts a set of high performance parsers, each one is specialized for its corresponding serialization format. Consider the following benchmark trial:

##### Count how many triples are in [DBpedia's 2015-04 English persondata.nt](http://wiki.dbpedia.org/Downloads2015-04#persondata) in N-Triples format:

using **graphy.js**:
```js
console.time('g');
const parser = require('graphy'); let c_triples = 0;
graphy.nt.parse(fs.createReadStream('persondata_en.nt'), {
  data(h_triple) {
    c_triples += 1;
  },
  end() {
    console.timeEnd('g');
    console.log(`${c_triples} triples parsed`);
  },
});
```

using **[N3.js v0.4.5](https://github.com/RubenVerborgh/N3.js)**:
```js
console.time('n');
const n3 = require('n3'); let c_triples = 0;
new n3.Parser().parse(fs.createReadStream('persondata_en.nt'), function(e_parse, h_triple) {
  if(h_triple) {
    c_triples += 1;
  }
  else {
    console.timeEnd('n');
    console.log(`${c_triples} triples parsed`);
  }
});
```

#### Benchmark Results:
Each benchmark listed was the best of 3 trials (and w/ variations of less than 5%):
| trial                    | size     | # statements | N3.js ms    | <--op/s | graphy.js ms | <--op/s   | speedup  |
| ------------------------ | -------- | ------------:| -----------:| -------:| ------------:| ---------:| -------- |
| persondata_en.nt         | 967 MiB  |      8397081 | 16030.645ms | 523,835 |  4715.599ms  | 1,780,929 | 3.4 x    |
| redirects_en.ttl         | 994 MiB  |      6831505 | 12079.796ms | 565,568 |  6790.367ms  | 1,006,112 | 1.778 x  |
| article-categories_en.nq | 5.16 GiB |     20232709 | 46261.009ms | 437,359 | 26855.249ms  |   753,405 | 1.722 x  |
| need to find a .trig     |          |              |             |         |              |           |          |

What's the catch? [See Performance details](#performance)


<a name="interaction-paradigm" />
## Use a Query/Property-Path-Driven API to interact with RDF graphs
Interact with your static graph by mimicing the semantics of SPARQL property-paths and filters in a query-like manner:
```js
const graphy = require('graphy');
/* ttl_results = sparql('describe dbr:Banana ?exotics { ?exotics dbp:group dbr:Banana }') */
graphy.ttl.networks(ttl_results, (g) => {

  let banana = g.enter('dbr:Banana');

  // traverse a link to its set of objects, then filter by language
  banana.at('rdfs:label').literals('@en').values();  // ['Banana']
  
  // access the underlying data object directly
  banana.links['http://www.w3.org/2000/01/rdf-schema#label'].length;  // 9

  // mimic property paths and filtering by chaining calls together in order
  //  dbr:Banana ^dbp:group/rdfs:label ?label. FILTER(isLiteral(?label) && lang(?label)="en")
  banana.inverseAt('dbp:group').at('rdfs:label').literals('@en')
    .values();  // ['Saba banana', 'Gros Michel banana', 'Red banana', ...]

  // use optional semantic access paths to trivialize things
  banana.is.dbp.group.of.nodes  // dbr:Banana ^dbp:group ?node. FILTER(isIri(?node))
    .terms.map(g.terse);  // ['dbr:Saba_banana', 'dbr:Señorita_banana', ...]
});
```

## Setup

**Install:**
```sh
$ npm install graphy
```


----
## API
 - [Introduction](#introduction)
 - [Parsing](#parsing)
 - [Graph](#)

### Introduction


### Parsing
This section documents graphy's high performance parser, which can be used directly for parsing a readable stream, transforming a readable stream to a writable stream, and parsing static strings. Each parser also allows [pausing and resuming the stream](#stream-control).
 - [Parse events](#parse-events)
   - [data(quad: Quad)](#event-data)
   - [prefix(id: string, iri: string)](#event-prefix)
   - [base(iri: string)](#event-base)
   - [graph_open(graph: Term)](#event-graph-open)
   - [graph_close(graph: Term)](#event-graph-close)
   - [error(message: string)](#event-error)
   - [end(prefixes: hash)](#event-end)
 - [Parse options](#parse-options)
   - [max_token_length](#option-max-token-length)
   - [max_string_length](#option-max-string-length)
 - [Stream Control](#stream-control)
 - **Parsers**
   - [Turtle (.ttl) - `graphy.ttl.parse`](#graphy-ttl-parse)
   - [TriG  (.trig) - `graphy.trig.parse`](#graphy-trig-parse)
   - [N-Triples  (.nt) - `graphy.nt.parse`](#graphy-nt-parse)
   - [N-Quads  (.nq) - `graphy.nq.parse`](#graphy-nq-parse)
 
#### Parse Events
The parsers are engineered to run as fast as computerly possible. For this reason, they do not extend EventEmitter, which normally allows event handlers to bind via `.on()` calls. Instead, any event handlers must be specified at the time the parser is invoked. The name of an event is passed as a key in the hash object passed to the `config` parameter, where the value of the entry is the event handler/callback.

For example:
```js
const parse_ttl = graphy.ttl.parse;
parse_ttl(input, {
    triple(h_triple) {  // 'triple' event handler
        // ..
    },
    error(e_parse) {  // 'error' event handler
        // ..
    },
});
```

<a name="event-data" />
##### Event: data(quad: [Quad](#triple)[, output: list])
Gets called once for each triple/quad as soon as it is parsed. The `output` list is for `.push`ing strings to the output stream which is only available when the parser is [used as a transform](#parse-ttl-transform).

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
Gets called if a parsing error occurs at any time. If an error does occur, no other instance events will ever be called after this. If you do not include an `error` event handler, the parser will throw the error's `message` string.

<a name="event-end" />
##### Event: end([prefixes: hash])
Gets called once at the very end of the input. For piped streams, this occurs once the Readable input stream has no more data to be consumed (i.e., `Transform#_flush`). For stream objects, this occurs after the stream's 'end' event.

> The `prefixes` argument is a hash of the final mappings at the time the end of the input was reached. It is only available for [`graphy.ttl.parse`](#graphy-ttl-parse) and [`graphy.trig.parse`](#graphy-trig-parse)


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
#### Stream Control
For any of the event callbacks listed above, you can control the state of the stream and pause events from being emitted by using calls to `this`.

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

----
<a name="graphy-ttl-parse" />
#### graphy.ttl.parse
The Turtle parser:
```js
const parse_ttl = graphy.ttl.parse;
```

The parse function (in the example above, `parse_ttl`) has three variants:

##### parse_ttl(input: string, config: hash)
Synchronously parses the given `input` string. It supports the event handlers:  [`data`](#event-data), [`prefix`](#event-prefix), [`base`](#event-base), [`error`](#event-error) and [`end`](#event-end). If a call to `this.pause()` is made during event callbacks, the operation becomes an asynchronous.

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

##### parse_ttl(config: hash)
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`prefix`](#event-prefix), [`base`](#event-base), [`error`](#event-error) and [`end`](#event-end) and an **extended version** of the [`data`](#event-data) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join this `output` array (and terminate it) using the newline `\n` character and then write that to the output.

*Example:*
```js
// convert a .ttl Turtle file into a .nt N-Triples file
fs.createReadStream('input.ttl', 'utf8')
    .pipe(parse_ttl({
        data(triple, output) {  // for each triple...
            // cast it to a string to produce its canonicalized form
            output.push(triple+'');
        },
    }))
    .pipe(fs.createWriteStream('output.nt'));
```


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
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`graph`](#event-graph), [`prefix`](#event-prefix), [`base`](#event-base), [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`data`](#event-data) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join this `output` array (and terminate it) using the newline `\n` character and then write that to the output. 

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
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`triple`](#event-triple) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join this `output` array (and terminate it) using the newline `\n` character and then write that to the output.


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
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`quad`](#event-quad) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join this `output` array (and terminate it) using the newline `\n` character and then write that to the output.



## Compatibility
Lexing input this fast is only possible by taking advantage of an ECMAScript 2015 feature (the sticky "y" RegExp flag) which is not yet implemented in all browsers, even though it is now the current standard ([see compatibility table](https://kangax.github.io/compat-table/es6/#test-RegExp_y_and_u_flags) at row `RegExp "y" and "u" flags`). It also means that only Node.js versions >= 6.0 are supported, which will also [soon be the new LTS](https://github.com/nodejs/LTS) anyway. Failure to use a modern engine with graphy will result in:
```
SyntaxError: Invalid flags supplied to RegExp constructor 'y'
    at new RegExp (native)
    ....
```

## Performance
High performance has a cost, namely that [this module is not a validator](#not-validator), although it **does handle parsing errors**. Full validation will likely never be implemented in graphy since it slows down parsing and because [N3.js](https://github.com/RubenVerborgh/N3.js/) already does a fine job at it.

<a name="not-validator" />
#### Parser is intended for valid syntax only
This tool is intended for serialized formats that were generated by a machine. Quite simply, it does not check the contents of certain tokens for "invalid" characters; such as those found inside of: IRIs, prefixed names, and blank node labels.

For example:
```js
<a> <iri refs aren't supposed to have spaces> <c> .
```

Is technically not valid TTL. However, graphy will not emit any errors. Instead, it will emit the following triple:
```js
{
  subject: {value: 'a', termType: 'NamedNode', ...},
  predicate: {value: 'iri refs aren't supposed to have spaces', termType: 'NamedNode', ...},
  object: {value: 'c', termType: 'NamedNode', ...},
  graph: {value: '', ..}
}
```


The parser **does however** handle any and all unexpected token errors that violate syntax. For example:
```js
<a> _:blank_nodes_cannot_be_predicates <c> .
```

Emits the error:
```
`_:blank_nodes_cannot_be_predicates `
 ^
expected pairs.  failed to parse a valid token starting at "_"
```

A full list of the test cases can be found in [./test/parser](test/parser)

#### Why bother checking for errors at all?

Stumbling into an invalid token does not incur a performance cost since it is the very last branch in a series of if-else jumps. It is mainly the characters inside of expected tokens that are at risk of sneaking invalid characters through. This is due to the fact that the parser uses the simplest regular expressions it can to match tokens, opting for patterns that only exclude characters that can belong to the next token, rather than specifying ranges of valid character inclusion. This compiles DFAs that require far fewer states with fewer instructions, hence less CPU time.


#### How graphy optimizes
Optimizations are acheived in a variety of ways, but perhaps the most general rule that guides the process is this: graphy tries parsing items based on benefit-cost ratios in descending order. "Benefit" is represented by the probability that a given route is the correct one (derived from typical document freqency), where "Cost" is represented by the amount of time it takes to test whether or not a given route *is* the correct one.

For example, double quoted string literals are more common in TTL documents than single quoted string literals. For this reason, double quoted strings literals have a higher benefit -- and since testing time for each of these two tokens is identical, then they have the same cost. Therefore, if we test for double quoted string literals before single quoted string literals, we end up making fewer tests a majority of the time.

However, the optimization doesn't stop there. We can significantly cut down on the cost of parsing a double quoted string literal if we know it does not contain any escape sequences. String literals without escape sequences are not significantly more common than literals with them, so the benefit is not very high - however, the cost savings is enormous (i.e., the ratio's denominator shrinks) and so it outweighs the benefit thusly saving time overall.

----
<a name="n3-differences" />
## API Differences to N3.js @v0.4.5
If you're familiar with the N3.js parser, it's important to realize some of the differences about graphy's parser, which does the following things differently:
 - [Does not check IRIs, prefixed names, or blank node labels for invalid characters.](#performance)
 - All RDF terms are represented as JavaScript objects, as per the [RDFJS Data Interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#data-interfaces), rather than as strings.
 - Nested blank node property lists and RDF collections are emitted in the order they appear, rather than from the outside-in.
 - Anonymous blank nodes (e.g., `[]`) are assigned a label starting with the character `g`, rather than `b`. This is done in order to minimize the time spent testing and renaming conflicts with common existing blank node labels in the document (such as `_:b0`, `_:b1`, etc.).

---

The same string also exists as a property on the `.is` function, which is the recommended style of determing its type since this lookup is faster than calling the function.

Example usage of determining term type:
```js
// :a :b :c
triple.object.termType;  // 'NamedNode'
triple.object.isNamedNode;  // true

// :a :b _:c
triple.object.termType;  // 'BlankNode'
triple.object.isBlankNode;  // true

// :a :b "c"^^d .
triple.object.termType  // 'Literal'
triple.object.isLiteral;  // true
```

You can also generate the Notation3 string serialization of an object by invoking its `toString` method:
```js
// :a :b :c
triple.object.toString();  // '<http://ex/c>'

// :a :b _:c
''+triple.object;  // '_:c'

// :a :b "c"^^:d .
triple.object+'';  // '"c"^^<http://ex/d>'
```


## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.svg
[npm-url]: https://npmjs.org/package/graphy
[travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/graphy.js
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js

