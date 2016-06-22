# graphy.js
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] 

A *faster-than-lightning* RDF deserializer and property-path-driven JavaScript API that implements the [RDFJS representation interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#data-interfaces). It natively parses JSON-LD, Turtle, TriG, N-Triples, and N-Quads.

For instance, a SPARQL `describe` query to DBpedia:
```sparql
describe dbr:Banana ?exotics {
  ?exotics dbp:group dbr:Banana .
}
```
Using graphy, explore the results:
```js
const graphy = require('graphy');
graphy.ttl.network(results, (network) => {

  // enter network at a specific node
  let banana = network.enter('dbr:Banana');

  // traverse a link to a set of objects, then filter by type and language
  banana.at('rdfs:label').literals('@en').values();  // ['Banana']
  
  // or use a semantic access path to trivialize things
  banana.is.dbp.group.of.nodes; // 'Banana'

  // or use direct URIs for max performance
  banana.links['http://www.w3.org/2000/01/rdf-schema#label'][0].value; // 'Banana'

  // chain a sequence of links together to mimic property paths
  // such as     dbr:Banana ^dbp:group/rdfs:label ?exotic_labels
  let exotic_labels = banana.inverse('dbp:group').at('rdfs:label');

  // filter those objects by literals with a given language tag
  exotic_labels.literals('@en').values();  // ['Saba banana', 'Gros Michel banana', 'Red banana', ...]
});
```

# Contents
 - [Setup](#install)
 - [Example Usage](#usage)
 - [Comparisons to N3.js](#n3-js)

## Install
```sh
$ npm install graphy
```

## Usage
graphy parses the following serializations of RDF:
 - Turtle (.ttl)
 - TriG (.trig)
 - N-Triples (.nt)
 - N-Quads (.nq)

## API
 - [Introduction](#introduction)
 - [Parsing](#parsing)

### Introduction

<a name="terminology" />
#### Terminology used in this document
Given that some terms for javascript datatypes conflict with the terminology used in RDF, the following terminology is used in this document:
 - **hash** - refers to a plain javascript object that has keys and values (eg: `{key: 'value'}`)
 - **list** - refers to a 1-dimensional javascript array
 - **item** - refers to an element in a javacsript array

### Parsing
 - [Parser events](#parser-events)
   - [triple(triple: Triple)](#event-triple)
   - [quad(quad: Quad)](#event-quad)
   - [base(iri: string)](#event-base)
   - [prefix(id: string, iri: string)](#event-prefix)
   - [error(message: string)](#event-error)
   - [end(prefixes: hash)](#event-end)
 - [Parser options](#parser-options)
   - [max_token_length](#option-max-token-length)
   - [max_string_length](#option-max-string-length)
 - **Parsers**
   - [`graphy.ttl.parser` - Turtle  (.ttl)](#graphy-ttl-parser)
   - [TriG  (.trig)](#graphy-trig-parser)
   - [N-Triples  (.nt)](#graphy-nt-parser)
   - [N-Quads  (.nq)](#graphy-nq-parser)
 
#### Parser Events
The graphy parsers are engineered to run as fast as computerly possible. For this reason, the parsers do not implement an EventEmitter interface that usually allows event handlers to bind via `.on()` calls. Instead, any event handlers must be specified at the time the parser is invoked. The name of an event is passed as a key in the hash object passed to the `config` parameter, where the value of the entry is the event handler/callback.

For example:
```js
parse_ttl(input, {
    triple(h_triple) {  // 'triple' event handler
        // ..
    },
    error(e_parse) {  // 'error' event handler
        // ..
    },
});
```

<a name="event-triple" />
##### Event: triple(triple: [Triple](#triple)[, output: list])
Gets called once for each triple as soon as it is parsed. The `output` list is an array that is only available when the parser is [used as a transform](#parse-ttl-transform).
> Only for [`graphy.ttl.parser`](#graphy-ttl-parser) and [`graphy.nt.parser`](#graphy-nt-parser)

<a name="event-quad" />
##### Event: quad(quad: [Quad](#quad)[, output: list])
Gets called once for each quad as soon as it is parsed. The `output` list is an array that is only available when the parser is [used as a transform](#parse-trig-transform).
> Only for [`graphy.trig.parser`](#graphy-trig-parser) and [`graphy.nq.parser`](#graphy-nq-parser)

<a name="event-base" />
##### Event: base(iri: string)
Gets called once for each `@base` statement as soon as it is parsed. `iri` is the full URI of the new base.
> Only for [`graphy.ttl.parser`](#graphy-ttl-parser) and [`graphy.trig.parser`](#graphy-trig-parser)

<a name="event-prefix" />
##### Event: prefix(id: string, iri: string)
Gets called once for each `@prefix` statement as soon as it is parsed. `id` is the name of the prefix without the colon (e.g., `'dbr'`) and `iri` is the full URI of the associated mapping (e.g., `'http://dbpedia.org/resource/'`).
> Only for [`graphy.ttl.parser`](#graphy-ttl-parser) and [`graphy.trig.parser`](#graphy-trig-parser)

<a name="event-error" />
##### Event: error(message: string)
Gets called if a parsing error occurs at any time. If an error does occur, no other instance events will ever be called after this. If you do not include an `error` event handler, the parser will throw the error's `message` string.

<a name="event-end" />
##### Event: end([prefixes: hash])
Gets called once at the very end of the input. For piped streams, this occurs once the Readable input stream has no more data to be consumed (i.e., `Transform#_flush`). For stream objects, this occurs after the stream's 'end' event.

> The `prefixes` argument is a hash of the final mappings at the time the end of the input was reached. It is only available for [`graphy.ttl.parser`](#graphy-ttl-parser) and [`graphy.trig.parser`](#graphy-trig-parser)


#### Parser Options
In addition to [specifying events](#parser-events), the parser function's `config` parameter also accepts a set of options:

<a name="option-max-token-length" />
##### Option: max_token_length
A `number` that defines the maximum number of characters to expect of any token other than a quoted literal. This option only exists to prevent invalid input from endlessly consuming the parser when using streams as input. By default, this value is set to **2048**, which is more than the recommended maximum URL length. However, you may wish to set this value to `Infinity` if you never expect to encounter invalid syntax on the input stream.

<a name="option-max-string-length" />
##### Option: max_string_length
A `number` that defines the maximum number of characters to expect of any quoted literal. This option only exists to prevent invalid input from endlessly consuming the parser (such as a long-quoted literal `""" that never ends...`) when using streams as input. By default, this value is set to **65536** characters. However, you may set this value to `Infinity` if you never expect to encounter invalid syntax on the input stream.


<a name="graphy-ttl-parser" />
#### graphy.ttl.parse
The Turtle parser:
```js
const parse_ttl = graphy.ttl.parse;
```

The parser function (in the example above, `parse_ttl`) has three variants:

##### parse_ttl(input: string, config: hash)
Synchronously parses the given `input` string. It supports the event handlers: [`base`](#event-base), [`prefix`](#event-prefix), [`triple`](#event-triple), [`error`](#event-error) and [`end`](#event-end).

##### parse_ttl(input: stream, config: hash)
Asynchronously parses the given `input` stream object. It supports the event handlers: [`base`](#event-base), [`prefix`](#event-prefix), [`triple`](#event-triple), [`error`](#event-error) and [`end`](#event-end).

##### parse_ttl(config: hash)
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`base`](#event-base), [`prefix`](#event-prefix), [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`triple`](#event-triple) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join this `output` array (and terminate it) using the newline `\n` character and then write that to the output. For example:
```js
// convert a .ttl Turtle file into a .nt N-Triples file
fs.createReadStream('input.ttl', 'utf8')
    .pipe(parse_ttl({
        // for each triple...
        triple(h_triple, a_output) {
            // use Term#toString() method to produce canonicalized forms
            a_output.push(h_triple.subject+' '+h_triple.predicate+' '+h_triple.object+' .');
        },
    }))
    .pipe(fs.createWriteStream('output.nt'));
```


<a name="graphy-trig-parser" />
#### graphy.trig.parse
The TriG parser:
```js
const parse_trig = graphy.trig.parse;
```

The parser function (in the example above, `parse_trig`) has three variants:

##### parse_trig(input: string, config: hash)
Synchronously parses the given `input` string. It supports the event handlers: [`base`](#event-base), [`prefix`](#event-prefix), [`quad`](#event-quad), [`error`](#event-error) and [`end`](#event-end).

##### parse_trig(input: stream, config: hash)
Asynchronously parses the given `input` stream object. It supports the event handlers: [`base`](#event-base), [`prefix`](#event-prefix), [`quad`](#event-quad), [`error`](#event-error) and [`end`](#event-end).

##### parse_trig(config: hash)
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`base`](#event-base), [`prefix`](#event-prefix), [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`quad`](#event-quad) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join this `output` array (and terminate it) using the newline `\n` character and then write that to the output. For example:
```js
// convert a .trig TriG file into a .nq N-Quads file
fs.createReadStream('input.trig', 'utf8')
    .pipe(parse_ttl({
        // for each quad...
        quad(h_quad, a_output) {
            // use Term#toString() method to produce canonicalized forms
            a_output.push(h_quad.subject+' '+h_quad.predicate+' '+h_quad.object+' '+h_quad.graph+' .');
        },
    }))
    .pipe(fs.createWriteStream('output.nq'));
```


<a name="graphy-nt-parser" />
#### graphy.nt.parse
The N-Triples parser:
```js
const parse_nt = graphy.nt.parse;
```

The parser function (in the example above, `parse_nt`) has three variants:

##### parse_nt(input: string, config: hash)
Synchronously parses the given `input` string. It supports the event handlers: [`triple`](#event-triple), [`error`](#event-error) and [`end`](#event-end).

##### parse_nt(input: stream, config: hash)
Asynchronously parses the given `input` stream object. It supports the event handlers: [`triple`](#event-triple), [`error`](#event-error) and [`end`](#event-end).

##### parse_nt(config: hash)
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`triple`](#event-triple) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join this `output` array (and terminate it) using the newline `\n` character and then write that to the output.


<a name="graphy-nq-parser" />
#### graphy.nq.parse
The N-Quads parser:
```js
const parse_nq = graphy.nq.parse;
```

The parser function (in the example above, `parse_nq`) has three variants:

##### parse_nq(input: string, config: hash)
Synchronously parses the given `input` string. It supports the event handlers: [`quad`](#event-quad), [`error`](#event-error) and [`end`](#event-end).

##### parse_nq(input: stream, config: hash)
Asynchronously parses the given `input` stream object. It supports the event handlers: [`quad`](#event-quad), [`error`](#event-error) and [`end`](#event-end).

##### parse_nq(config: hash)
Creates a [`Transform`](https://nodejs.org/api/stream.html#stream_duplex_and_transform_streams) for simultaneously reading input data and writing output data. It supports the event handlers: [`error`](#event-error), [`end`](#event-end) and an **extended version** of the [`quad`](#event-quad) event handler that allows the callback to write output data by pushing strings to the callback function's `output` argument. For each chunk that is read from the input, the parser will join this `output` array (and terminate it) using the newline `\n` character and then write that to the output.

## N3.js
[N3.js](https://github.com/RubenVerborgh/N3.js/) is an excellent javascript toolkit for parsing, writing and storing Notation3 RDF data. 

Unlike graphy, its parser also validates the input. The graphy module does not intend to reinvent the wheel

### Differences from N3.js @v0.4.5
If you're familiar with N3.js, it's important to realize what's different about graphy. `graphy` does the following things:
 - All RDF terms are represented as javascript objects, as per the [RDFJS Data Interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#data-interfaces), rather than as strings.
 - Nested blank node property lists and RDF collections are emitted in the order they appear, rather than from the outside-in.
 - Anonymous blank nodes (e.g., `[]`) are assigned a label starting with the character `g`, rather than `b`. This is done in order to minimize the time spent testing and renaming conflicts with common existing blank node labels in the document (such as `_:b0`, `_:b1`, etc.).

#### Parser is for valid syntax only
This tool is **not a validator**. Do not use it on files written by humans. The parser is engineered for performance, so it mostly assumes that the input is valid syntax. It does not check for invalid characters.

For example,
```js
<#a> <#iri refs aren't supposed to have spaces> <#c> .
```

Is technically not valid TTL. However, graphy will not emit any errors. Instead, it will emit the following triple:
```js
{
  subject: '#a',
  predicate: '#iri refs aren't supposed to have spaces'
  object: '#c',
}
```


The parser *does however* handle unexpected tokens that violate syntax. For example:
```js
<#a> _:blank_nodes_cannot_be_predicates <#c> .
```

Emits the error:
```
`_:blank_nodes_cannot_be_predicates `
 ^
expected pairs.  failed to parse a valid token starting at "_"
```

However, this is not by design. It is simply an inherent quality that emerges naturally because each state of the DFA expects a limited set of tokens. It is not safe to assume that it can handle all permutations. In other words, the parser is not intended to catch arbitrary syntax errors. And at this time, I cannot verify that it covers all cases.

> Then why bother checking for errors at all?
Stumbling into an invalid token does not incur a performance cost since it is the very last branch in a series of else jumps. It is mostly the characters inside of expected tokens that are at risk of sneaking invalid characters through. This is due to the fact that the parser uses the simplest regular expressions it can to match tokens, opting for patterns that only exclude characters that might belong to the next token, rather than specifying ranges of valid character inclusion. This compiles DFAs that require far fewer states with fewer instructions, hence less CPU time.

> Abstracts JSON-LD objects with an API for easy traversal and exploration of an RDF graph programatically. It emphasizes the use of iterators and namespaces to access entities by their suffix.


# API

## Triple representation
All triples in graphy are represented by a javascript object with three keys:

#### `subject`
Will be either a `NamedNode` (which *has* an IRI reference) or a `BlankNode` (which has a label).

For example:
```js
if(triple.subject.isBlankNode) {  // subject is a blank node
  let blank_node_label = triple.subject.value;
  console.log('Subject blank node label: ' + blank_node_label);
}
else {  // subject is an IRI reference
  console.log('Subject URI: ' + triple.subject);
}
```

#### `predicate`
Will always be a `NamedNode`.

#### `object`
Will be a `NamedNode`, `BlankNode`, or `Literal`. In addition to the  will always have the property `.is`, which is a function that respectively returns the string `'iri'`, `'blanknode'`, or `'literal'`, depending on the type. The same string also exists as a property on the `.is` function, which is the recommended style of determing its type since this lookup is faster than calling the function.

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

The actual properties of the object depending on its type are as follows:
 - `'iri'` type - has the properties:
  - `iri` - a string that is the full URI of the object
 - `'blanknode'` type - has the properties:
  - `'label'` - a string that is the blank node's label as it appeared in the document, or as it was generated by the parser (if it was an anonymous blank node)
 - `'literal'` type - has the properties:
  - `'value'` - a string that is the unescaped string literal value
    - **OR** a number that is the numeric value of an xsd:integer, xsd:decimal or xsd:double (only for Turtle and TriG)
    - **OR** a boolean that is the boolean value of an xsd:boolean (only for Turtle and TriG)
    - > Note: string literals with numeric or boolean datatypes will not have their values automatically converted to their javascript equivalent. The two types above are only produced for numeric or boolean tokens from Turtle and TriG documents
  - `'language'` - a lowercase string that is the language tag of a string literal, otherwise `undefined`
  - `'datatype'` - a string that is the full URI of the literal's datatype. If no datatype was explicitly given by document, will be `undefined`
    - > Note: datatype is set automatically for numeric and boolean literals
    - > Note: datatype will be `undefined` if the literal has a `language` property

Numeric and boolean literals:
```js
// :a :b 5 .
triple.object.value * 2;  // 10
typeof triple.object.value;  // 'number'
triple.object.datatype;  // '<http://www.w3.org/2001/XMLSchema#integer>'

// :a :b 5.0 .
triple.object.value * 2;  // 10
typeof triple.object.value;  // 'number'
triple.object.datatype;  // '<http://www.w3.org/2001/XMLSchema#decimal>'

// :a :b 0.05e+2 .
triple.object.value * 2;  // 10
typeof triple.object.value;  // 'number'
triple.object.datatype;  // '<http://www.w3.org/2001/XMLSchema#double>'

// :a :b true .
!triple.object.value;  // false
typeof triple.object.value;  // 'boolean'
triple.object.datatype;  // '<http://www.w3.org/2001/XMLSchema#boolean>'
```


### How graphy optimizes
This module is engineered for maximum performance. It acheives this in a variety of ways, but perhaps the most general rule that guides the optimization process is this: graphy tries parsing items based on benefit-cost ratios in descending order. "Benefit" is represented by the probability that a given route is the correct one (derived from typical document freqency), where "Cost" is represented by the amount of time it takes to test whether or not a given route *is* the correct one.

For example, double quoted string literals are more common in TTL documents than single quoted string literals. For this reason, double quoted strings literals have a higher benefit. Since testing time for each of these two tokens is identical, they have the same cost. Therefore, if we test for double quoted string literals before single quoted string literals, we end up making fewer tests a majority of the time.

However, the optimization doesn't stop there. We can significantly cut down on the cost of parsing a double quoted string literal if we know it does not contain any escape sequences. String literals without escape sequences are not significantly more common than literals with them, so the benefit is not very high - however, the cost savings is enormous (i.e., the ratio's denominator shrinks) and so it outweighs the benefit thusly saving time overall.



# Contents
 - [Setup](#install)
 - [Example Usage](#usage)
 - [Iterators and Collections](#iterating)
 - [Concepts](#concepts)
 - [API Reference](#api_reference)


## Install

```sh
$ npm install --save graphy
```

## Usage

Take this example using DBpedia's [dbr:Banana](http://dbpedia.org/page/Banana) resource:
```js
var graphy = require('graphy');

let json_ld = ...; // JSON-LD for dbr:Banana from DBpedia

graphy(json_ld, (network) => {
  
  // select a node from the graph by IRI
  let banana = network.select('ns:Banana');

  // reference some prefixes we will be using
  let {rdfs, dbo, dbp, owl} = banana.$;

  // acess some literals
  rdfs.label(); // 'Banana'
  dbo.wikiPageID(); // 38940

  // ... and their datatype
  dbp.wikiPageID['@type']; // 'http://www.w3.org/2001/XMLSchema#integer'
  dbp.wikiPageID.$datatype('xsd:'); // 'integer'

  // predicates linking to more than one object
  dbp.caption.length; // 2
  dbp.caption(0); // 'Coconut, banana and banana leaves [...]'

  // get suffixes of rdf:type object IRIs for a given prefix
  banana.$types('umbel-rc:'); // ['Plant', 'EukaryoticCell', 'BiologicalLivingObject']

  // transform an object list into an array of IRI suffixes
  banana.$.dct.subject(s => s.$id('dbc:')); // ['Fiber_plants', 'Staple_foods', 'Tropical_agriculture', ...]

  // get IRI of node
  banana['@id']; // 'http://dbpedia.org/resource/Banana'
  banana.$id(); // 'Banana'
});
```



<a name="#iterating" />
## Iterating

### `for..of`
An entity of type `node` supports iteration directly on the reference itself. The key of the iterator will be the predicate suffixed by the current accessor namespace, the value of the iterator will be an array of entities that are pointed to by that predicate:

```js
for(let [s_predicate_suffix, a_objects] of k_banana) {
  a_objects.forEach((k_node) => {
    console.log(s_predicate+' => {'+k_node.$is()+'} '+k_node.$n3());
  });
}

// alias => {iri} ns:Cavendish
// alias => {iri} ns:Naner
// alias => {iri} ns:Bananarama
// appears => {iri} color:Yellow
// class => {iri} ns:Berry
// considered => {blanknode} _:b4
// data => {literal} "25"^^xsd:integer
// stages => {collection} [rdf:first ns:FindSpace;rdf:rest (plant:Seed plant:Grow plant:Harvest)]
// ...
```

You can also iterate on the no-args call of a node entity, this will set the namespace to an empty string so that the key of each iterator is the full IRI of each predicate:
```js
for(let [p_predicate, a_objects] of k_banana()) {  // same as k_banana.$('')
  a_objects.forEach((k_node) => {
    console.log(q_graph.shorten(p_predicate)+' => {'+k_node.$is()+'} '+k_node.$n3());
  });
}

// ns:alias => {iri} ns:Cavendish
// ns:alias => {iri} ns:Naner
// ns:alias => {iri} ns:Bananarama
// ns:appears => {iri} color:Yellow
// plant:blossoms => {iri} ns:YearRound
// ns:class => {iri} ns:Berry
// ...
```

## RDF Collections

Collection objects are arrays that are also an [entity](#entity).

In order to be consistent with the graph, rdf collection properties are emulated on collection objects. So instead of accessing a collection's elements via Array's properties/methods, you can also use the `rdf:first` and `rdf:rest` properties:
```js
let w_list = k_banana.stages.$('rdf:');

w_list.first.$id('ns:'); // 'FindSpace'

w_list = w_list.rest;
w_list.first.$id('plant:'); // 'Seed'

w_list = w_list.rest;
w_list.first.$id('plant:'); // 'Grow'

w_list = w_list.rest;
w_list.first.$id('plant:'); // 'Harvest'

w_list = w_list.rest;
w_list.$id('rdf:'); // 'nil'

// ------------ or in a loop ------------
let a_stages = [];
let w_list = k_banana.stages.$('rdf:');
while(w_list.$id('rdf:') !== 'nil') {
  a_stage.push(w_list.first.$id('plant:') || w_list.first.$id('ns:'));
  w_list = w_list.rest;
}
a_stages; // ['FindSpace', 'Seed', 'Grow', 'Harvest']
```

<a name="concepts" />
# Concepts

<a name="_accessor_namespace" />
## Accessor Namespace
All instances of type [entity](#_entity) have methods and properties that 'access' the suffixed part of the IRIs the entity is associated with. This suffix is made by removing the current accessor namespace from the beginning of the IRI. So for example:
```js
let banana = network.select('dbr:Banana');
let rdfs = banana.$('http://www.w3.org/2000/01/rdf-schema#'); // sets the accessor namespace to the IRI aka by the prefix `rdfs:`
rdfs.label(); // the `label` property was created because `http://www.w3.org/2000/01/rdf-schema#` was removed from the beginning of the predicate IRI
```

The accessor namespace of a variable does not change unless you reassign the variable; instead, the accessor namespace is mutated by chaining successive namespace modifier calls to a variable.

<a name="api_reference" />
# API Reference


---------------------------------------
<a name="_graphy" />
## Graphy
The module itself.

## graphy(jsonld: Jsonld_object, ready: function)
Calls `ready(network: Network)` once a graphy [network](#_network) has been created for the given `jsonld` object.

---------------------------------------
<a name="_network" />
## Network
An array of the jsonld objects in this graph, each represented by a graphy [entity](#_entity). 


<a name="network.select" />
### network.select(iri: string[, namespace: string])

Returns the graphy [entity](#_entity) for the IRI given by `iri`, which may be either a prefixed or absolute IRI. Optional `namespace` argument will set the [accessor namespace](#_accessor_namespace) for the returned object (see [`entity.$()`](#entity.$)). If `namespace` is ommitted, then the accessor namespace will get set to the longest matching prefix of the provided `iri`.

Example:
```js
graphy(jsonld, (network) => {

  // select the set of triples in this JSONLD graph where `ns:Banana` is the subject
  let banana = network.select('ns:Banana');

  // the namespace accessor defaulted to `ns:`
  banana.$id(); // 'Banana'
});
```


<a name="network.top" />
### network.top([map_callback: function])
Returns an array of entities that are named things (ie not blanknodes) or blanknodes that do not appear in the object position of any triples in the current graph. These can be thought of as top-level nodes. Accepts an optional `map_callback` function to transform the entities before returning the array. These entities will have empty an accessor namespace by default.


<a name="network.shorten" />

### network.shorten(iri: string)
Shortens an IRI using prefixes defined in the @context object of the original JSON-LD document. Picks the prefix with the longest matching URI.


<a name="network.expand" />

### network.expand(n3_iri: string)
Expands a prefixed n3 IRI using prefixes defined in the @context object of the original JSON-LD document.


<a name="network.@" />

### network.[...]
[Network](#network) is an array, so it supports all native Array functions. Each item in the array is a graphy entity with an empty accessor namespace.

---------------------------------------
<a name="_entity" />
## Entity
An abstract class that represents an RDF entity / JSON-LD object, supported by the set of methods and properties documented in this section and in the appropriate subclass. A graphy entity can be obtained by calling [`network.select()`](#network.select), or any one of the array interface methods in the [network](#_network) class.

This class is abstract. The methods and properties in this section are available on all its subclasses; those subclasses are:
 - [Node](#_node)
 - [IRI](#_iri)
 - [Literal](#_literal)
 - [Collection](#_collection)


<a name="e.$is" />
### entity.$is(),  entity.$is[type]

Returns the representative `type` of this entity as a string. You can also use a shorthand check by testing if `.$is[type]` is defined as `true`. eg: `if(entity.$is.iri === true) ...`. Possible values for `type` are:
 - *node* - a [node](#_node)
 - *iri* - an [iri](#_iri)
 - *literal* - a [literal](#_literal)
 - *collection* - a [collection](#_collection)

Example:
 ```js
banana.$is(); // 'node'
banana.$is.node; // true
banana.$is.literal; // false
 ```


<a name="entity.$" />
### entity.$(namespace: string)

Sets the accessor namespace of the returned object to the expanded version of the IRI given by `namespace`, may be either an n3 prefix or a full IRI. By chaining this call, you can change the accessor namespace on the same line to access properties or IRIs by their suffix. For an even shorter syntax, see [`entity.$[prefix_name]`](#entity.$.@prefix_name) .


### entity.$()

The no-args version of this method returns the absolute IRI of the current accessor namespace.


<a name="entity.$.@prefix_name" />
### entity.$[prefix_name]
A hash whose values are entities embodying objects of the triples belonging to this node under different prefix names (given by the key of each key-value pair); one for each IRI prefix in the JSON-LD document's context.

Example:
```js
// accessing a property that is expected to always be there
banana.$.rdfs.label(); // 'Banana'

// ... not guaranteed to be there
let rdfs = banana.$('rdfs:');
if(rdfs.label) {
  rdfs.label();
}

// 'en masse' destructuring assignment
let {rdfs, owl, ns} = banana.$;
rdfs.label; // 'Banana'
ns.tastes(); // 'good'
```

> Warning: If a certain prefix/namespace is not guaranteed to be in the JSON-LD document, chaining properties on this object may throw an `Uncaught TypeError` since the prefix does not exist in the document and would return `undefined`. Hence, it is recommended to use [`entity.$(namespace)`](#entity.$) for these cases.


<a name="entity.$n3" />
### entity.$n3([use_absolute_iris: boolean])

Returns a terse n3 representation of this entity as a string. All IRIs are prefixed by the longest matching URI available in the original JSON-LD context, unless the resulting suffix would contain invalid characters for a prefixed IRI in either SPARQL or TTL. The resulting string is fully compatible and ready for use in SPARQL and TTL as long as the corresponding prefixes are also included in the document. If `use_absolute_iris` is set to `true`, then no prefixes will be used.

Example:
```js
// for literals
banana.tastes.$n3(); // '"good"^^xsd:string'
banana.tastes.$n3(true); // '"good"^^<http://www.w3.org/2001/XMLSchema#string>'

// for 
banana.appears.$n3; //
```


<a name="entity.$nquad" />
### entity.$nquad()

Returns the n-quad representation of this entity. Useful for serializing to SPARQL/TTL without worrying about prefixes.
> Note: this difffers from `.$n3()` 
> Caution: `.$nquad()` does not currently support nested RDF collections (it will produce blanknode collisions)

Example:
```js
// for collections
banana.stages.$nquad();
```


<a name="entity.$in" />
### entity.$in(namespace: string)

Returns `true` if the current entity's IRI is within the given `namespace`. Will always return `false` for blanknodes, collections and literals.


<a name="entity.@id" />
### entity["@id"]

The absolute IRI of this entity. Reflects the JSON-LD `@id` property.

Examples:
```js
// for nodes
banana['@id']; // 'vocab://ns/Banana'

// for iris
banana.class['@id']; // 'vocab://ns/Berry'
banana.appears['@id']; // 'vocab://color/Yellow'

// for blanknodes
banana.considered
// 
```


<a name="entity.$id" />
### entity.$id([namespace: string])

The suffix of the `@id` property after removing the current accessor namespace from the beginning. If the current accessor namespace does not match, or this IRI is a blanknode, this method will return `undefined`. If a `namespace` argument is passed, the method will use the given `namespace` instead of the current accessor namespace to suffix the IRI

```js
// for nodes
banana.$id(); // 'Banana'

// for iris
let ns = banana.$('ns:');
ns.class.$id(); // 'Berry'
ns.appears.$id(); // undefined
ns.appears.$id('color:'); // 'Yellow'
ns.appears.$.color.$id(); // 'Yellow'
```


<a name="entity.@type" />
### entity["@type"]

Reflects the JSON-LD `@type` property. For literals, this will return the absolute datatype IRI as a string. For nodes, this will return an array of absolute IRIs representing the objects pointed to by the `rdf:type` predicate.



## Node
A graphy [entity](#_entity) that represents a set of triples belonging to the same subject. By default, blanknodes that are included in the provided graph will be returned as node entities, whereas named things will be returned as IRI entities. See [iri.$node](#iri.$node) to turn an IRI entity into a node entity.


<a name="node" />
### node()

Returns a Map of {predicate => array[object]} pairs for all triples in this set (which are stemming from the subject that this node repesents). For each pair, the key is a full IRI of the predicate as a string, the value is an array of graphy entities representing the objects pointed to by the given predicate.


<a name="node" />
### node(access_name: string[, map_callback: function])

Returns an array of entities that are pointed to by the namespaced predicate suffix `access_name`. If the current accessor namespace is empty, then the access name would be the full IRI of the predicate.

The optional `map_callback` argument is a function that will be applied the array of entities before they are returned.


<a name="node.@@iterator" />
### node[@@iterator]

Enables iteration over the Map of {predicate => array[object]} pairs where the key is an absolute IRI as a string and the value is an array of graphy entities.

```js
for(let [predicate, objects] of banana) {
  console.log(
    graph.shorten(predicate)
    + ' => '
    + objects.map(o => o.$n3()).join(', ')
  );
}
// rdf:type => ns:Food, plant:Fruit, plant:EdiblePart
// rdfs:label => "Banana"^^xsd:string
// ...
```


<a name="node.$types." />
### node.$types

An array of graphy IRI entities that are pointed to by the `@type` property (which is the `rdf:type` predicate) for this node.

Example:
```js
banana.$types.length;
banana.$types[0].$id('ns:');
```

> The `.$types` property is both an array and a function. To use it as a function see [`node.$types()`](#node.$types) .


<a name="node.$types" />
### node.$types([namespace: string])

Returns an array of strings that are the suffixes of the IRIs pointed to by the `@type` property after removing the current accessor namespace (or the given `namespace` argument) from the beginning of the IRI. If the namespace does not match any of the IRIs, this will return an empty array `[]`.


<a name="node.$type" />
### node.$type([namespace: string])

Shortcut for `.$types(..)[0]`. If this node entity has more than one `rdf:type`, accessing this property will issue a warning. If the current accessor namespace does not match any of the IRIs, this will return `undefined`. If a `namespace` argument is passed, the method will use the given namespace instead of the current accessor namespace to suffix the IRI.



## IRI
A graphy [entity](#_entity) that represents a simple RDF IRI, typically encountered when reaching an object of a triple that is neither a blanknode nor literal. Use [`iri.$node()`](#iri.node) to obtain the graphy [node](#_node) of this IRI if it exists in the current graph.


<a name="iri." />
### iri([namespace: string])

Returns the suffixed portion of this IRI as a string, using the current accessor namespace or the `namespace` argument if one is provided. You can obtain the full IRI no matter the current accessor namespace by using an empty string for `namespace`, or by using the JSON-LD property [`entity['@id']`](#entity.$id) .


<a name="iri.node" />
### iri.$node([namespace: string])

Will return the node object for accessing triples that have this IRI as its subject. If there are no triples in the current jsonld graph that have this IRI as its subject, calling `.$node()` will return undefined for this IRI. Passing an optional `namespace` argument will set the accessor namespace on the returned graphy entity.




## Literal
A graphy [entity](#entity) that represents an RDF literal.

```js
rdfs.label.$is(); // 'literal'
```


<a name="literal." />
### literal()

Returns the value portion of the literal. Certain datatypes are automatically parsed to their corresponding JavaScript datatype; see the list [here](#literal.$datatype.parseable). To access the unparsed value, use [`literal.$raw()`](#literal.$raw).
> See [`literal.$datatype`](#literal.$datatype) and [`literal.$n3.datatype`](#literal.$n3_datatype) for getting the datatype of a literal.

```js
rdfs.label(); // 'Banana'
```


<a name="literal.$datatype" />
### literal.$datatype([namespace: string])

Returns the suffix of this literal's datatype IRI using the current accessor namespace unless a `namespace` argument is provided.
> To get the absolute IRI, you can pass an empty string for the `namespace` argument.

```js
rdfs.label.$datatype('xsd:'); // 'string'
rdfs.label.$datatype(''); // 'http://www.w3.org/2001/XMLSchema#string'
```

<a name="literal.$datatype.parseable" />
### literal.$datatype.parseable()

Returns true if this literal was automatically parsed to its corresponding JavaScript datatype. Applies to the following `xsd:` datatypes:
 - string
 - boolean
 - decimal
 - byte, unsignedByte
 - short, unsignedShort
 - long, unsignedLong
 - int, unsignedInt
 - integer, positiveInteger, nonPositiveInteger, negativeInteger, nonNegativeInteger
 - float, double
 - dateTime

```js
rdfs.label.$datatype.parseable(); // true
```


<a name="literal.$n3.datatype" />
### literal.$n3.datatype()

Returns the terse datatype IRI of this literal in n3 form.
> This is a property of the [`entity.$n3`](#entity.n3) function.

```js
rdfs.label.$n3.datatype(); // 'xsd:string'
```


<a name="literal.$nquad.datatype" />
### literal.$nquad.datatype()

Returns the absolute datatype IRI of this literal in nquad form.
> This is a property of the [`entity.$nquad`](#entity.nquad) function.

```js
rdfs.label.$nquad.datatype; // 'http://www.w3.org/2001/XMLSchema#string'
```


<a name="literal.$raw()" />
### literal.$raw()

Returns the raw, unparsed value of this literal from the JSON-LD graph. For most cases, this will be the same as the parsed value.



## Collection
A graphy [entity](#_entity) that represents an RDF collection.


<a name="collection." />
### collection()

Returns the array 


<a name="collection.at" />
### entity(item_index: integer)
### entity.at(item_index: integer)

Returns the item at `item_index` in the collection.


<a name="collection.map" />
### entity(map_callback: function)
### entity.map(map_callback: function)

Applies every entity in this collection to the provided `map_callback` and returns the resulting array.


## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.svg
[npm-url]: https://npmjs.org/package/graphy
[travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/graphy.js
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js

