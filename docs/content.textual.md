
# [« API](api) / Textual RDF Content Handlers
This documentation covers the following graphy packages:
 - N-Triples
   - reader: `@graphy/content.nt.read`
   - scriber: `@graphy/content.nt.scribe`
   - writer: `@graphy/content.nt.write`
 - N-Quads
   - reader: `@graphy/content.nq.read`
   - scriber: `@graphy/content.nq.scribe`
   - writer: `@graphy/content.nq.write`
 - Turtle
   - reader: `@graphy/content.ttl.read`
   - scriber: `@graphy/content.ttl.scribe`
   - writer: `@graphy/content.ttl.write`
 - TriG
   - reader: `@graphy/content.trig.read`
   - scriber: `@graphy/content.trig.scribe`
   - writer: `@graphy/content.trig.write`
 - RDF/XML
   - scriber: `@graphy/content.xml.scribe`

----

## Contents
 - [A Note About Events](#note_events) -- two different styles for event binding
 - [Accessibility](#accessibility) -- all textual RDF content modules
 - [Verbs](#verbs) -- the module export functions under each content namespace
   - [`.read`](#verb_read) -- for reading RDF from a string or stream
     - **Events:**
       - [`readable(...)`](#event_read-readable)
       - [`base(...)`](#event_read-base)
       - [`prefix(...)`](#event_read-prefix)
       - [`comment(...)`](#event_read-comment)
       - [`data(...)`](#event_read-data)
       - [`enter(...)`](#event_read-enter)
       - [`exit(...)`](#event_read-exit)
       - [`progress(...)`](#event_read-progress)
       - [`eof(...)`](#event_read-eof)
       - [`finish(...)`](#event_read-finish)
       - [`end(...)`](#event_read-end)
       - [`error(...)`](#event_read-error)
   - [`.scribe`](#verb_scribe) -- for fast and simple RDF serialization to writable stream
   - [`.write`](#verb_write) -- for dynamic and stylized RDF serialization to writable stream
     - [**Scribe vs. Write**](#note_scribe-vs-write)
     - **Classes:**
       - [`Scriber`](#class_scriber)
       - [`Writer`](#class_writer)
     - **Events:**
       - [`warning(...)`](#event_write-warning)
     - [**WritableDataEvent Types:**](#interface_writable-data-event)
       - [`'c3'`](#interface_writable-data-event-c3) (full-mode)
       - [`'c3r'`](#interface_writable-data-event-c3r) (strict-mode)
       - [`'c4'`](#interface_writable-data-event-c4) (full-mode)
       - [`'c4r'`](#interface_writable-data-event-c4r) (strict-mode)
       - [`'quad'`](#interface_writable-data-event-quad)
       - [`'prefixes'`](#interface_writable-data-event-prefixes)
       - [`'array'`](#interface_writable-data-event-array) (includes all other types)
       - [`'comment'`](#interface_writable-data-event-comment)
       - [`'newlines'`](#interface_writable-data-event-newlines)
 - [Classes](#classes)
 - [Events](#events) -- definitions for event interfaces
 - [Configs](#configs) -- definitions for config interfaces
 - [Interfaces](#interfaces) -- definitions for all other interfaces

<!--
- [`scan`](#verb_scan) -- for reading RDF from a string or stream using multiple threads
-->

----

<a name="note_events" />

#### A note about Events
These modules offer two distinct approaches to binding event listeners. The traditional `.on(...)` approach will allow you to attach event listeners on the `Transform` object that is returned by the module function. This style was popularized by node.js, however this actually does incur a non-trivial amount of overhead for setup, teardown, and emittance.

A sleeker alternative to the `.on(...)` approach is the *inline events* style. Simply provide a callback function for each event you want to attach a listener to at the time the module function is called, passing a direct reference to at most one callback function per event. This approach allows the module to bypass the `EventEmitter` methods and can result in slightly better performance; it is also more pleasant to look at. However, it might not be suitable for users who need the ability to add multiple event listeners, to remove listeners, or to add listeners at a later time.

See the [`read`](#verb_read) examples for a demonstration of the two styles of attaching event listeners.

----

<a name="accessibility" />

## Accessibility
The following code block demonstrates three *different* ways to access these modules (shown here for the `read` verb):
```js
// stand-alone readers
const nt_read = require('@graphy/content.nt.read');
const nq_read = require('@graphy/content.nq.read');
const ttl_read = require('@graphy/content.ttl.read');
const trig_read = require('@graphy/content.trig.read');

// readers via named access from the graphy 'super module'
const graphy = require('graphy');
const nt_read = graphy.content.nt.read;
const nq_read = graphy.content.nq.read;
const ttl_read = graphy.content.ttl.read;
const trig_read = graphy.content.trig.read;

// readers via Content-Type query from the graphy 'super module'
const graphy = require('graphy');
const nt_read = graphy.content('application/n-triples').read;
const nq_read = graphy.content('application/n-quads').read;
const ttl_read = graphy.content('text/turtle').read;
const trig_read = graphy.content('application/trig').read;

```

<!--
----

<a name="datatypes" />

## Datatypes
The following section describes hinted formatting on ES primitives that are used throughout this document.

<a name="strings" />

### Strings:

<a name="#string_js-function-" />

 - `#string/js_function_*` -- a string that will be turned into a JavaScript function using `eval`, `new Function`, `new vm.Script`, or whatever else is appropriate depending on the environment. This is done in order to transmit the function between threads. If the library were to accept an actual function instead, it would require first serializing it into a `string` which introduces potential dangers such as externally scoped references, native code stringification, and so forth. 
   - > If you are developing in Sublime Text 3, it is recommended to use the [Ecmascript-Sublime](https://github.com/bathos/Ecmascript-Sublime) package to enable nested syntax highlighting on template literal strings for instances like this and a better highlighting experience all around ;)
 
<a name="#string_js-function-map" />

 - `#string/js-function-map` -- see [`@string/js-function-*`](#string_js-function-).
   - **signature:** `function(result_callback: callback(result: any))` : [`#config/read-no-input`](#config_read)

<a name="#string_js-function-reduce" />

 - `#string/js-function-reduce` -- see [`@string/js-function-*`](#string_js-function-).
   - **signature:** `function(result_a: any, result_b: any)` : `any`

-->

----

<a name="verbs" />

## Verbs
This section documents the 'verb' part of each content module. A 'verb' refers to the fact that the module's export is itself a function.
 - [read](#verb_read) -- read serialized RDF documents using a single thread.
 - [scribe](#verb_scribe) -- write serialized RDF data to an output stream _fast_, in an event-driven manner using RDFJS/Quads or concise struct objects in strict-mode.
 - [write](#verb_write) -- write serialized RDF data to an output stream _with style_, in an event-driven manner using RDFJS/Quads or elegant concise struct objects.

<!--
 - [scan](#verb_scan) -- read serialized RDF documents using multiple threads.
-->


<a name="note_scribe-vs-write" />

#### Difference between `scribe` and `write` verbs
The [`scribe`](#verb_scribe) and [`write`](#verb_write) verbs are both for serializing RDF to a writable stream. However, `scribe` is the more basic serializer built for speed, while `write` is the more advanced serializer built to support rich features such as stylized output (e.g., custom spacing), serializing comments, RDF collections, and so forth.

Additionally, `write` employs several safety checks that help prevent serializing malformed RDF from faulty write input (e.g., literals in subject position, blank nodes or literals in predicate position, invalid IRI strings, and so on), whereas `scribe` does not perform such safety checks.

The [`scribe`](#verb_scribe) verb supports the following [WritableDataEvent](#interface_writable-data-event) types:
 - `'prefixes'`
 - `'quad'`
 - `'c3r'`
 - `'c4r'`
 - `'comment'`
 - `'newlines'`

The [`write`](#verb_write) verb supports the following [WritableDataEvent](#interface_writable-data-event) types (* = difference from scribe):
 - `'prefixes'`
 - `'quad'`
 - `'c3'` *
 - `'c3r'`
 - `'c4'` *
 - `'c4r'`
 - `'comment'`
 - `'newlines'`

----

<a name="verb_read" />

### [`read`](#verb_read)`([input: string | stream][, config: `[`ReadConfig`](#config_read-no-input)`])`
 - Read RDF data (in other words, deserialize it) from a document given by an input stream, input string or via duplexing. Uses a single thread.
 - **returns** a [`new Transform<string, Quad>`](core.iso.stream#transform_string-writable_quad-readable) (accepts utf8-encoded strings on its writable side, pushes [Quad](core.data.factory#class_quad) objects on its readable side)

**Accessible via the following modules:**
 - N-Triples (.nt) -- `@graphy/content.nt.read`
 - N-Quads (.nq) -- `@graphy/content.nq.read`
 - Turtle (.ttl) -- `@graphy/content.ttl.read`
 - TriG (.trig) -- `@graphy/content.trig.read`

#### Usage examples

**Read from a Turtle file in Node.js:**
```js
cons fs = require('fs');
const ttl_read = require('@graphy/content.ttl.read');

fs.createReadStream('input.ttl')
    .pipe(ttl_read())
    .on('data', (y_quad) => {
       console.dir(y_quad.isolate());
    })
    .on('eof', () => {
        console.log('done!');
    });
```

**Read a Turtle string:**
```js
const ttl_read = require('@graphy/content.ttl.read');

ttl_read(`
    @prefix foaf: <http://xmlns.com/foaf/0.1/> .

    <#spiderman> a foaf:Person ;
        foaf:name "Spiderman" .
`, {
    // whew! simplified inline events style  ;)
    data(y_quad) {
        console.dir(y_quad);
    },

    eof(h_prefixes) {
        console.log('done!');
    },
})
```

**Overloaded variants:**
 - `read([config: `[`#ReadConfigNoInput`](#config_read-no-input)`])`
 - `read(input_string: string[, config: `[`#ReadConfigNoInput`](#config_read-no-input)`])`
   - shortcut for: `read(config).end(input_string, 'utf-8');`
   - equivalent to: `read({...config, input: {string:input_string}});`
 - `read(input_stream: `[`ReadableStream<string>`](core.iso.stream#readable_string)`[, config: `[`#ReadConfigNoInput`](#config_read-no-input)`])`
   - shortcut for: `input_stream.pipe(read(config));`
   - equivalent to: `read({...config, input: {stream:input_stream}});`
 - `read(config: `[`#ReadConfigWithInput`](#config_read-with-input)`)`

----

<a name="verb_scribe" />

### [`scribe`](#verb_scribe)`([config: `[`ScribeConfig`](#config_scribe)`])`
 - Write RDF data (in other words, serialize it) from objects in memory into utf8-encoded strings for storage, transmission, etc. 
 - **returns** a [`new Scriber`](#class_scriber) which transforms [WritableDataEvent objects](#interface_writable-data-event) or [@RDFJS/Quads](https://rdf.js.org/data-model-spec/#quad-interface) on the writable side into utf8-encoded strings on the readable side. The transformation an object undergoes from the writable side to the readable side will vary depending on the capabilities of the specific output RDF format.

**Accessible via the following modules:**
 - N-Triples (.nt) -- `@graphy/content.nt.scribe`
 - N-Quads (.nq) -- `@graphy/content.nq.scribe`
 - Turtle (.ttl) -- `@graphy/content.ttl.scribe`
 - TriG (.trig) -- `@graphy/content.trig.scribe`
 - RDF/XML (.rdf) -- `@graphy/content.xml.scribe`

### Usage examples

**Serialize some RDF data to Turtle on-the-fly:**
```js
const ttl_scribe = require('@graphy/content.ttl.scribe');
const factory = require('@graphy/core.data.factory');

let ds_scriber = ttl_scribe({
    prefixes: {
        dbr: 'http://dbpedia.org/resource/',
        ex: 'http://ex.org/',
    },
});

ds_scriber.on('data', (s_turtle) => {
    console.log(s_turtle+'');
});

// write an RDFJS quad
ds_scriber.write(factory.quad(...[
  factory.namedNode('http://dbpedia.org/resource/Banana'),
  factory.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#a'),
  factory.namedNode('http://dbpedia.org/ontology/Plant'),
]));

// or write using a concise-triples struct in strict-mode (c3r)
ds_scriber.write({
    type: 'c3r',
    value: {
        'dbr:Banana': {
            'ex:color': ['dbr:Yellow'],
        },
    },
});
```

Prints:
```turtle
@prefix dbr: <http://dbpedia.org/resource/> .
@prefix ex: <http://ex.org/> .

dbr:Banana a dbo:Plant .

dbr:Banana ex:color dbr:Yellow .
```

----

<a name="verb_write" />

### [`write`](#verb_write)`([config: `[`WriteConfig`](#config_write)`])`
 - Write RDF data (in other words, serialize it) from objects in memory into utf8-encoded strings for storage, transmission, etc. 
 - **returns** a [`new Writer`](#class_writer) which transforms [WritableDataEvent objects](#interface_writable-data-event) or [RDFJS Quads](http://rdf.js.org/data-model-spec/#quad-interface) on the writable side into utf8-encoded strings on the readable side. The transformation an object undergoes from the writable side to the readable side will vary depending on the capabilities of the specific output RDF format.

**Accessible via the following modules:**
 - N-Triples (.nt) -- `@graphy/content.nt.write`
 - N-Quads (.nq) -- `@graphy/content.nq.write`
 - Turtle (.ttl) -- `@graphy/content.ttl.write`
 - TriG (.trig) -- `@graphy/content.trig.write`

### Usage examples

**Serialize some RDF data to Turtle on-the-fly:**
```js
const ttl_write = require('@graphy/content.ttl.write');

let ds_writer = ttl_write({
    prefixes: {
        dbr: 'http://dbpedia.org/resource/',
        ex: 'http://ex.org/',
    },
});

ds_writer.on('data', (s_turtle) => {
    console.log(s_turtle+'');
});

ds_writer.write({
    type: 'c3',
    value: {
        'dbr:Banana': {
            'ex:lastSeen': new Date(),
        },
    },
});
```

Prints:
```turtle
@prefix dbr: <http://dbpedia.org/resource/> .
@prefix ex: <http://ex.org/> .

dbr:Banana ex:lastSeen "2019-01-16T06:59:53.401Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
```

----

<a name="class_scriber" />

## **Scriber** _extends_ [Transform](core.iso.stream#class_transform)&lt;[WritableDataEvent](#interface_writable-data-event) | [@RDFJS/Quad](http://rdf.js.org/data-model-spec/#quad-interface), string&gt;


**Methods:**
 - ... [see those inheritted from Transform](core.iso.stream#transform)
 - `write(data: `[`WritableDataEvent`](#interface_writable-data-event)` | `[`@RDFJS/Quad`](http://rdf.js.org/data-model-spec/#quad-interface)`[, ignore: any][, function: callback])`
   - Implementation of [@node.js/stream.Writable#write](https://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback), where `ignore` corresponds to the `encoding` parameter since the Transform is in objectMode.
 - `import(`[`@RDFJS/Stream`](http://rdf.js.org/stream-spec/#stream-interface)`)` _implements_ [@RDFJS/Sink.import](http://rdf.js.org/stream-spec/#sink-interface)
   - Consumes the given stream. See RDFJS documentation for further reference.

<a name="class_writer" />

## **Writer** _extends_ [Scriber](#class_scriber)

**Methods:**
 - ... [those inheritted from Scriber](#class_scriber)


----

<a name="events" />

## Event definitions

<a name="events_read" />

#### events **ReadEvents**
The definition for all possible events emitted during content reading. Please [see this note about events](#note_events) to understand how this definition applies to both the traditional `.on()`-style of event binding as well as the inline-style.

**Events:**


<a name="event_read-readable" />

 - `readable()` _via_ [@node.js/stream.Readable#event-readable](https://nodejs.org/api/stream.html#stream_event_readable)
   - Gets called once there is data available to be read from the stream (automatically emitted by stream mechanics).


<a name="event_read-base" />

 - `base(iri: string)`
   - Gets called for each base statement as soon as it is parsed. `iri` is the full IRI of the new base.
   - *example:*
      ```js
      ttl_read('@base <http://example.org/vocabulary/> .', {
          base(p_iri) {
              p_iri;  // 'http://example.org/vocabulary/'
          },
      });
      ```


<a name="event_read-prefix" />

 - `prefix(id: string, iri: string)`
   - Gets called for each prefix statement as soon as it is parsed. `id` will be the name of the prefix without the colon and `iri` will be the full IRI of the associated mapping.
   - *example:*
      ```js
      ttl_read('@prefix dbr: <http://dbpedia.org/resource/> .', {
          prefix(s_id, p_iri) {
              s_id;  // 'dbr'
              p_iri;  // 'http://dbpedia.org/resource/'
          },
      });
      ```


<a name="event_read-comment" />

 - `comment(comment: string)`
   - Gets called for each comment (after `#` symbol until end-of-line) as soon as it is parsed.
   - *examples:*
      ```js
      // inline event style (less overhead)
      ttl_read(`
        # hello world!
        <#banana> a <#Fruit> .
      `, {
          comment(s_comment) {
              s_comment;  // ' hello world!'
          },
      });
      
      // attach event listener style (more overhead)
      let ds_read = ttl_read(`
        # hello world!
        <#banana> a <#Fruit> .
      `);
      ds_read.on('comment', (s_comment) => {
          s_comment;  // ' hello world!'
      });
      ```

<a name="event_read-data" />

 - `data(quad: `[`Quad`](core.data.factory#class_quad)`)` _via_ [@node.js/stream.Readable#event-data](https://nodejs.org/api/stream.html#stream_event_data)
   - Gets called for each triple/quad as soon as it is parsed.
   - *examples:*
      ```js
      // inline event style (less overhead)
      ttl_read('<#banana> a <#Fruit> .', {
          data(y_quad) {
              y_quad.predicate.value;  // 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
          },
      });
      
      // attach event listener style (more overhead)
      let ds_read = ttl_read('<#banana> a <#Fruit> .');
      ds_read.on('data', (y_quad) => {
          y_quad.predicate.value;  // 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
      });
      ```


<a name="event_read-enter" />

 - `enter(graph: `[`Term`](core.data.factory#class_namednode)`)`
   - Gets called each time a graph block is entered as soon as the opening brace character `{` is read. `graph` will either be a [NamedNode](#namednode), [BlankNode](#blanknode) or [DefaultGraph](#defaultgraph).
   - *example:*
      ```js
      // only inspect triples within a certain graph
      let b_inspect = false;
      trig_read(ds_input, {
          enter(y_graph) {
              if(y_graph.value === 'http://target-graph') b_inspect = true;
          },
          exit(y_graph) {
              b_inpsect = false;
          },
          data(y_quad) {
              if(b_inspect) {  // much faster than comparing y_quad.graph to a string!
                  // do something with triples
              }
          },
      });
      ```


<a name="event_read-exit" />

 - `exit(graph: `[`NamedNode`](core.data.factory#class_named-node)`)`
   - Gets called each time a graph block is exitted as soon as the closing brace character `}` is read.       `graph` will either be a [NamedNode](core.data.factory#class_named-node), [BlankNode](core.data.factory#class_blank-node) or       [DefaultGraph](core.data.factory#class_default-graph).


<a name="event_read-progress" />

  - `progress(delta: integer)`
    - Gets called each time the reader has finished processing a chunk of data and is about to go asynchronous and wait for the next I/O event. `delta` will reflect the number of characters that were consumed from the input which resulted in a change to the reader's internal state (i.e., incomplete tokens must wait for next chunk to be terminated). This event offers a nice way to provide progress updates to the user, however this would require knowing ahead of time how many characters in total are contained by the input, which will always be less than or equal to the total number of bytes of the document depending on how many surrogate pairs are present in the utf8-encoded string. This event also provides hints to resource-hungry applications when it might be an opportunistic time to perform blocking tasks. This event will also be called right before the `'eof'` event with a `delta` equal to `0`.


<a name="event_read-eof" />

  - `eof(prefixes: `[`#hash/prefix-mappings`](core.data.factory#hash_prefix-mappings)`)`
    - Gets called once the 'end-of-file' has been reached before the [`'finish'` event](#event_read-finish) is emitted; useful for obtaining the final prefix mappings `'prefixes'`. This event indicates that the input has been entirely consumed (i.e., no errors occurred while reading) and the only events that will follow are the [`'finish'`](#event_read-finish) and [`'end'`](#event_read-finish) events.


<a name="event_read-finish" />

  - `finish()` _via_ [@node.js/stream.Writable#event-finish](https://nodejs.org/api/stream.html#stream_event_finish)
    - Gets called once the input stream has finished writing. It indicates that the writable side of the transform has ended and the input stream has been consumed entirely.

<a name="event_read-end" />

  - `end()` _via_ [@node.js/stream.Readable#event-end](https://nodejs.org/api/stream.html#stream_event_end)
    - Gets called once the readable side of the transform has been read entirely. If the trasnsform was not piped somewhere or has not been read to completion (such as by not binding a `'data'` event listener), this event will never fire. If you are only interested in consuming the input (e.g., for validation) use the [`'eof'` event](#event_read-eof) instead.
    > Caution! Be aware that this event only fires if the transform is being read. For a clear indication that the input has been consumed, it is recommended to use the [`'eof'` event](#event_read-eof).


<a name="event_read-error" />

  - `error(err: Error)` _via_ [@node.js/stream.Readable#event-error](https://nodejs.org/api/stream.html#stream_event_error_1)
    - Gets called if an error occurs any time during the read process, including malformed syntax errors, unreadable inputs, and so forth. If an error does occur, no other events will be emitted after this one. If you do not include an error event handler, the parser will throw the error.


----

<a name="events_write" />

#### events **WriteEvents**
The definition for all possible events emitted during content writing. Please [see this note about events](#note-events) to understand how this definition applies to both the traditional `.on()`-style of event binding as well as the inline-style.

**Events:**
 - ... [see those inherited from @node.js/stream.Transform](https://nodejs.org/api/stream.html#stream_class_stream_transform) (i.e., events from both @node.js/stream.Readable and @node.js/stream.Writable)


<a name="event_write-warning" />

 - `warning(message: string)`
   - Gets called to emit a warning message to the developer. Currently, this will only happen to warn about an implicit union when trying to write quad(s) with anything other than the default graph to an output format that does not support graphs (essentially drops the graph component in such cases).



<!--

----

<a name="classes" />

## Classes

<a name="class_concise-quad-writer" />

### class **ConciseQuadWriter** _extends_ [Transform](core.iso.stream#transform)&lt;[#hash/c4r](concise#c4r-hash), string&gt;
Acts as an object-writable, string-readable Transform for serializing RDF quads from memory to an output destination. Expects objects on the writable side to be of type [#hash/c4r](concise#c4r-hash).

**Construction:**
See [`write`](#verb_write).

**Methods:**
 - ... [see those inheritted from Transform](core.iso.stream#transform)
 - `graph(graph: `[`NamedNode`](core.data.factory#class_named-node)`)` -- creates an instance of a [`ConciseTripleWriter`](#class_triple-writer) that allows for writing multiple statements which belong to the same given `graph`.
   - **returns** a [new `ConciseTripleWriter`](#class_concise-triple-writer)
 - `subject(subject: `[`NamedNode`](core.data.factory#class_named-node)`)` -- creates an instance of a [`ConcisePairWriter`](#class_pair-writer) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `ConcisePairWriter`](#class_concise-pair-writer)

<a name="class_concise-triple-writer" />

### class **ConciseTripleWriter** _extends_ [Transform](core.iso.stream#transform)&lt;[#hash/c3](concise#c3-hash), string&gt;
Acts as an object-writable, string-readable Transform for serializing RDF triples from memory to an output destination. Expects objects on the writable side to be of type [#hash/c3](concise#c3-hash).

**Construction:**
See [`write`](#verb_write).

**Methods:**
 - ... [see those inheritted from Transform](core.iso.stream#transform)
 - `subject(subject: `[`NamedNode`](core.data.factory#class_named-node)`)` -- creates an instance of a [`ConcisePairWriter`](#class_concise-pair-writer) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `ConcisePairWriter`](#class_concise-pair-writer)


<a name="class_concise-pair-writer" />

### class **ConcisePairWriter** _extends_ [Transform](core.iso.stream#transform)&lt;[#hash/c2](concise#c2-hash), string&gt;
Acts as an object-writable, string-readable Transform for serializing RDF quads from memory to an output destination. Expects objects on the writable side to be of type [#hash/c2](concise#c2-hash).

**Methods:**
 - ... [see those inheritted from Transform](core.iso.stream#transform)
 - `predicate(predicate: `[`NamedNode`](core.data.factory#class_namednode)`)` -- creates an instance of a [`ConciseObjectWriter`](#class_concise-object-writer) that allows for writing multiple statements which belong to the same given `predicate` under the current graph and subject.
   - **returns** a [new `ConciseObjectWriter`](#class_concise-object-writer)


<a name="class_concise-object-writer" />

### class **ConciseObjectWriter** _extends_ [Transform](core.iso.stream#transform)&lt;[#hash/c2](concise#c2-hash), string&gt;
Acts as an object-writable, string-readable Transform for serializing RDF quads from memory to an output destination. Expects objects on the writable side to be of type [#hash/c2](concise#c2-hash).

**Methods:**
 - ... [see those inheritted from Transform](core.iso.stream#transform)
 - `add(predicate: `[`NamedNode`](core.data.factory#class_namednode)`)` -- creates an instance of a [`ConciseObjectWriter`](#class_concise-object-writer) that allows for writing multiple statements which belong to the same given `predicate` under the current graph and subject.
   - **returns** a [new `ConciseObjectWriter`](#class_concise-object-writer)

<!--

<a name="class_rdfjs-quad-writer" />

### class **RDFJSQuadWriter** _extends_ [Transform](core.iso.stream#transform)&lt;[@RDFJS/Quad](http://rdf.js.org/#quad-interface), string&gt;]
Contains methods for serializing RDF quads from memory to an output destination.

**Construction:**
See [`write`](#verb_write).

**Methods:**
 - `async add(quads: `[`#hash/c4r`](concise#struct_c4r)`)` -- serialize 
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `async add(quad: `[`@RDFJS/Quad`](http://rdf.js.org/#quad-interface)`)`
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `graph(graph: `[`NamedNode`](core.data.factory#class_namednode)`)` -- creates an instance of a [`TripleWriter`](#class_triplewriter) that allows for writing multiple statements which belong to the same given `graph`.
   - **returns** a [new `TripleWriter`](#class_triplewriter)
 - `subject(subject: `[`NamedNode`](core.data.factory#class_namednode)`)` -- creates an instance of a [`PairWriter`](#class_pairwriter) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `PairWriter`](#class_pairwriter)


<a name="class_generic-quad-writer" />

### class **GenericQuadWriter** _extends_ [Transform&lt;Quad | @RDFJS/Quad, string&gt;]()
Contains methods for serializing RDF quads from memory to an output destination.

**Construction:**
See [`write`](#verb_write).

**Methods:**
 - `async add(quads: `[`#hash/concise-quads`](concise#c4_hash)`)` -- serialize 
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `async add(quad: `[`@RDFJS/Quad`](http://rdf.js.org/#quad-interface)`)`
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `graph(graph: `[`NamedNode`](core.data.factory#class_namednode)`)` -- creates an instance of a [`TripleWriter`](#class_triplewriter) that allows for writing multiple statements which belong to the same given `graph`.
   - **returns** a [new `TripleWriter`](#class_triplewriter)
 - `subject(subject: `[`NamedNode`](core.data.factory#class_namednode)`)` -- creates an instance of a [`PairWriter`](#class_pairwriter) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `PairWriter`](#class_pairwriter)

<a name="class_triple-writer" />

### class **TripleWriter**
Contains methods for serializing RDF triples from memory to an output destination.

**Construction:**
See [`write`](#verb_write) and [`QuadWriter#graph`](#class_quadwriter).

**Methods:**
 - `async add(triples: `[`#hash/concise-triples`](concise#c3-hash)`)`
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `async add(quad: `[`@RDFJS/Triple`](http://rdf.js.org/#triple-interface)`)`
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `subject(subject: `[`NamedNode`](core.data.factory#class_namednode)`)` -- creates an instance of a [`PairWriter`](#class_pairwriter) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `PairWriter`](#class_pairwriter)

-->

----

<a name="configs" />

## Configs

<a name="config_read-no-input" />

#### config **ReadConfigNoInput** _inlines_ [ReadEvents](#events_read) _implements_ [@RDFJS/ConstructorOptions](http://rdf.js.org/stream-spec/#constructoroptions-interface)
An interface that defines the config object passed to a content reader.

**Options:**
 - ... [see those inlined from ReadEvents](#events_read)
 - `dataFactory` : `DataFactory=@graphy/core.data.factory` -- DataFactory implementation that will be used to create all Terms and Quads. The default implementation provided by graphy tends to perform a tad better and enables readers to create specialized Terms such as [Booleans, Integers, Decimals, Doubles, and so on](https://graphy.link/core.data.factory#class_literal-boolean).
 - `baseURI | baseUri | baseIRI | baseIri`: `string` -- sets the starting base URI for the RDF document.
 - `relax` : `boolean=false` -- by default, the contents of tokens are validated, e.g., checking for invalid characters in IRIs, literals, and so on. The stream will emit an `'error'` event if an invalid token is encountered. Setting the `relax` option to `true` will permit as wide a character range within tokens as possible (i.e., it will allow any characters *not* in the lookahead table). Using the `relax` option may be useful when trying to recover improperly formatted Turtle documents, however it also yields slightly faster parsing for valid documents as well since normal validation adds overhead to reading.
 - `maxTokenLength` : `number=2048` -- defines the maximum number of characters to expect of any token other than a quoted literal. This option only exists to prevent invalid input from endlessly consuming the reader when using a stream as input. By default, this value is set to **2048**, which is more than the recommended maximum URL length. However, you may wish to set this value to `Infinity` if you never expect to encounter invalid syntax on the input stream.
 - `maxStringLength` : `number=Infinity` -- defines the maximum number of characters to expect for any string literal. This option only exists to prevent invalid input from endlessly consuming the reader (such as a long-quoted literal `""" that never ends...`) when using a stream as input. By default, this value is set to **Infinity** characters (no limit). However, you may wish to set this value to some reasonable upper-bound limit (such as `65536` == 64 KiB) if you want to prevent possible memory leaks from invalid inputs or need your program to be able to gracefully recover from such syntax errors.

<a name="config_read-with-input" />

#### config **ReadConfigWithInput** _extends_ [#ReadConfigNoInput](#config_read-no-input)
      
**Options:**
 - ... [see those inheritted from #ReadConfigNoInput](#config_read-no-input)

**Required:**
 - `input` : [`UseInputString`](#interface_use-input-string)` | `[`UseInputStream`](#interface_use-input-stream)


<a name="config_write" />

#### config **WriteConfig** _inlines_ [WriteEvents](#events_write)
An interface that defines the config object passed to a content writer.

**Options:**
 - ... [see those inlined from WriteEvents](#events_write)
 - `prefixes` : [`#hash/prefix-mappings`](core.data.factory#hash_prefix-mappings) -- prefix mappings to use in order to expand the concise-term strings within concise-quad hashes as they are written. These prefixes will also be used to create prefix statements and terse terms on the output stream whenever possible (e.g., for Turtle and TriG documents).
 - `lists`: [`#ListConfig`](#config_lists) -- globally sets the predicates to use when serializing list structures (defaults to using [RDF Collections](https://www.w3.org/TR/rdf-schema/#ch_collectionvocab)).
 - `style` -- configure stylistic options to customize serialization for the given output format.
   - **Options:**
     - `.indent` : `string='\t'` -- sets the indentation string to use.
     - `.graphKeyword` : `boolean | string=''` -- only supported by TriG writer. If `true`, will write `GRAPH` before each graph open block. If a `string` is given, it must match `/^graph$/i`.
     - `.simplifyDefaultGraph` : `boolean=false` -- only supported by TriG writer. If `true`, will omit serializating the surrounding optional graph block for quads within the default graph ([see Example 3 from TriG specification](https://www.w3.org/TR/trig/#sec-graph-statements)).

<a name="config_lists" />

#### config **ListsConfig**
 - _optional properties:_
   - `.first`: [`#string/c1`](concise#string/c1) -- the predicate to use for specifiying the 'first' item of the linked-list structure.
   - `.rest`: [`#string/c1`](concise#string/c1) -- the predicate to use for specifiying the 'rest' item of the linked-list structure.
   - `.nil`: [`#string/c1`](concise#string/c1) -- the object to use for specifiying the terminating 'nil' item of the linked-list structure.


<a name="config_comment" />

#### config **CommentConfig**
 - _optional properties:_
   - `.width`: `int` -- if specified, breaks comments longer than the given `width` onto multiple lines.


<!-- - `coercions` : [`#map/object-coercions`](#map-objectcoercions) -- allows for extending the built-in mappings for coercing objects that are an `instanceof` some class or function to their RDF representation. For example, an instance of the `Date` object will -->


<!--

<a name="config_turbo-no-input" />

#### config **TurboConfig_WithInput** _inlines_ [TurboEvents](#events-turbo)
 
**Required:**
 - `input` : [`#struct/input-file`](#struct_input-file)` | `[`#struct/input-url`](#struct_input-url)
 - `map` : [`#string/js_function_map`](#string-js_function_map)
   - **signature:** `function(result_callback: callback(result: any))` : [`ReadConfig_NoInput`](#config_read)
   - This string will be copied and given to each worker thread where it will be turned into a new function in order to build the reader config as well as to distill the results that you are interested in obtaining. The function should accept a single argument, a callback function `result_callback` which expects to be called once the worker thread is ready to pass its results back to the main thread.
 - `reduce` : [`#string/js_function_reduce`](#string-js_function_reduce)
   - **signature:** `function(result_a: any, result_b: any)` : `any`
   - This string will be copied, turned into a new function, and used each time the worker group needs to merge the results from two different workers. The function should return a value that merges the relevant information from `result_a` and `result_b`. This merge result will likely get used again to merge with another result.

**Examples:**
```js
const nt_turbo = require('@graphy/content.nt.turbo');

(async function() {
    // count the total number of triples in a file
    let c_total = await nt_turbo({
        input: {
            file: '../data/input/master-incomplete.nt',
        },
        map: /* syntax: js */ `
            // this function will be created and called in each worker thread
            function(fk_result) {
                let c_triples = 0;
                
                // return the config for a new reader
                return {
                    data(y_quad) {
                        c_triples += 1;
                    },
                    // once the reader has finished its share of the document
                    end() {
                        // callback the result handler with our result value
                        fk_result(c_triples);
                    },
                };
            }`,
        reduce: /* syntax: js */ `
            // take two results and merge them into one result
            function(c_a, c_b) {
                return c_a + c_b;
            }`,
    });

    // this is the final result
    console.log(c_total);
})();
```

-->

<a name="interfaces" />

## Interfaces


<a name="interface_input-string" />

#### interface **UseInputString**
Indicates a utf8-encoded string to use as input to a reader.

 - _required properties:_
   - `.string`: `string`


<a name="interface_input-stream" />

#### interface **UseInputStream**
Indicates a readable stream to use as input to a reader.

 - _required properties:_
   - `.stream`: [`ReadableStream<string>`](core.iso.stream#readable-string)


<a name="interface_writable-data-event" />

#### interface **WritableDataEvent**
An object that describes an event of writable RDF data (including metadata and directives such as prefix mappings, comments, etc.).

 - _required properties:_
   - `.type`: `string` -- the type of event this object represents, see below
   - `.value`: `any` -- the value of the object
 - The string given for `.type` should be one of the following:

<a name="#interface_writable-data-event-c3" />

   - `'c3'` -- (full-mode) write a set of triples to the output using the [full-mode of concise triples](concise#hash_c3).
      - *expects* `.value` to be a [concise triple hash in full-mode](concise#hash_c3)
      - _example:_
        ```js
        const factory = require('@graphy/core.data.factory');
        const stream = require('@graphy/core.iso.stream');
        const ttl_write = require('@graphy/content.ttl.write');

        // `stream.source(data).pipe(dst)` is essentially `dst.write(data).end()`
        stream.source({
            type: 'c3',
            value: {
                [factory.comment()]: 'banana example'
                'dbr:Banana': {
                    a: 'dbo:Fruit',
                    'rdfs:label': [
                       '@en"Banana',
                       '@fr"Banane',
                    ],
                },
            },
        }).pipe(ttl_write({
            prefixes: {
                dbr: 'http://dbpedia.org/resource/',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            },
        })).pipe(process.stdout);
        ```
      - **outputs:**
        ```turtle
        @prefix dbr: <http://dbpedia.org/resource/> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

        # banana example
        dbr:Banana rdfs:label "Banana"@en, "Banane"@fr .
        ```

<a name="#interface_writable-data-event-c3r" />

   - `'c3r'` -- (strict-mode) write a set of triples to the output using the [strict-mode of concise triples](concise#hash_c3r).
      - *expects* `.value` to be a [concise triple hash in strict-mode](concise#hash_c3r)
      - _example:_
        ```js
        const factory = require('@graphy/core.data.factory');
        const stream = require('@graphy/core.iso.stream');
        const ttl_write = require('@graphy/content.ttl.write');

        // `stream.source(data).pipe(dst)` is essentially `dst.write(data).end()`
        stream.source({
            type: 'c3r',
            value: {
                'dbr:Banana': {
                    a: ['dbo:Fruit'],
                    'rdfs:label': [
                       '@en"Banana',
                       '@fr"Banane',
                    ],
                },
            },
        }).pipe(ttl_write({
            prefixes: {
                dbr: 'http://dbpedia.org/resource/',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            },
        })).pipe(process.stdout);
        ```
      - **outputs:**
        ```turtle
        @prefix dbr: <http://dbpedia.org/resource/> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

        # banana example
        dbr:Banana rdfs:label "Banana"@en, "Banane"@fr .
        ```

<a name="#interface_writable-data-event-c4" />

   - `'c4'` -- write a set of quads to the output using the [full-mode of concise quads](concise#hash_c4).
      - *expects* `.value` to be a [concise quad hash in full-mode](concise#hash_c4)
      - _example:_
        ```js
        const factory = require('@graphy/core.data.factory');
        const stream = require('@graphy/core.iso.stream');
        const trig_write = require('@graphy/content.trig.write');

        // `stream.source(data).pipe(dst)` is essentially `dst.write(data).end()`
        stream.source({
            type: 'c4',
            value: {
                [factory.comment()]: 'default graph',
                '*': {
                    [factory.comment()]: 'banana example',
                    'dbr:Banana': {
                        [factory.comment()]: 'did i mention that comments work here too?',
                        'rdfs:label': [
                           '@en"Banana',
                           '@fr"Banane',
                        ],
                        [factory.comment()]: 'pretty cool i know ;)',
                    },
                },

                [factory.comment()]: 'another graph (blank node)',
                '_:': {
                    'dbr:Banana': {
                        'dbr:color': '"yellow',
                    },
                },
            },
        }).pipe(trig_write({
            prefixes: {
                dbr: 'http://dbpedia.org/resource/',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            },
            tokens: {
                graph: true,  // output `GRAPH` tokens in TriG format
            },
        })).pipe(process.stdout);
        ```
      - **outputs:**
        ```trig
        @prefix dbr: <http://dbpedia.org/resource/> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

        # default graph
        GRAPH {
            # banana example
            dbr:Banana 
                # did i mention that comments work here too?
                rdfs:label "Banana"@en, "Banane"@fr ;
                # pretty cool i know ;)
                .
        }

        # another graph (blank node)
        GRAPH _:05565745_3fb2_4378_b4d0_bedb24d45d55 {
            dbr:Banana dbr:color "yellow" .
        }
        ```

<a name="#interface_writable-data-event-c4r" />

   - `'c4r'` -- write a set of quads to the output using the [strict-mode of concise quads](concise#hash_c4r).
      - *expects* `.value` to be a [concise quad hash in strict-mode](concise#hash_c4r)
      - _example:_
        ```js
        const factory = require('@graphy/core.data.factory');
        const stream = require('@graphy/core.iso.stream');
        const trig_write = require('@graphy/content.trig.write');

        // `stream.source(data).pipe(dst)` is essentially `dst.write(data).end()`
        stream.source({
            type: 'c4r',
            value: {
                // default graph
                '*': {
                    'dbr:Banana': {
                        'rdfs:label': [
                           '@en"Banana',
                           '@fr"Banane',
                        ],
                    },
                },

                // another graph (blank node)
                '_:': {
                    'dbr:Banana': {
                        // notice the value must be an Array
                        'dbr:color': ['"yellow'],
                    },
                },
            },
        }).pipe(trig_write({
            prefixes: {
                dbr: 'http://dbpedia.org/resource/',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            },
            tokens: {
                graph: true,  // output `GRAPH` tokens in TriG format
            },
        })).pipe(process.stdout);
        ```
      - **outputs:**
        ```trig
        @prefix dbr: <http://dbpedia.org/resource/> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

        GRAPH {
            dbr:Banana rdfs:label "Banana"@en, "Banane"@fr .
        }

        GRAPH _:05565745_3fb2_4378_b4d0_bedb24d45d55 {
            dbr:Banana dbr:color "yellow" .
        }
        ```

<a name="#interface_writable-data-event-quad" />

   - `'quad'` -- write a single RDFJS-compatible quad to the output.
      - *expects* `.value` to be a [Quad](core.data.factory#class_quad)
      - _example:_
        ```js
        const factory = require('@graphy/core.data.factory');
        const ttl_write = require('@graphy/content.ttl.write');

        // procedural style
        let y_writer = ttl_write({
            prefixes: {
                dbr: 'http://dbpedia.org/resource/',
                rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            },
        });

        // pipe to stdout
        y_writer.pipe(process.stdout);

        // create RDF terms
        let yt_subject = factory.namedNode('http://dbpedia.org/resource/Banana');
        let yt_predicate = factory.namedNode('http://www.w3.org/2000/01/rdf-schema#label');
        let yt_object = factory.literal('Banana', 'en');

        // create RDF quad
        let y_quad = factory.quad(yt_subject, yt_predicate, yt_object);

        // write quad
        y_writer.write({
            type: 'quad',
            value: y_quad,
        });

        // end stream
        y_writer.end();
        ```
      - **outputs:**
        ```turtle
        @prefix dbr: <http://dbpedia.org/resource/> .
        @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

        dbr:Banana rdfs:label "Banana"@en .
        ```


<a name="#interface_writable-data-event-prefixes" />

   - `'prefixes'` -- updates the current prefix mappings which are used to expand CURIEs found in subsequent concise triple (c3 or c3r) and concise quad (c4 or c4r) hashes. Will also cause the writer to output the given prefix mappings if supported by the underlying RDF format.
      - *expects* `.value` to be a [#hash/prefix-mappings](core.data.factory#hash_prefix-mappings)
      - _example:_
        ```js
        const ttl_write = require('@graphy/content.ttl.write');

        // procedural style
        let y_writer = ttl_write();

        // pipe to stdout
        y_writer.pipe(process.stdout);

        // write prefix mapping(s)
        y_writer.write({
            type: 'prefixes',
            value: {
                demo: 'http://ex.org/demo/',
            },
        });

        // write some data using the new mapping
        y_writer.write({
          type: 'c3',
          value: {
            'demo:Test': {
              'demo:isWorking': true,
            },
          },
        });

        // end stream
        y_writer.end();
        ```
      - **outputs:**
        ```turtle
        @prefix demo: <http://ex.org/demo/> .

        demo:Test demo:isWorking true .
        ```

<a name="#interface_writable-data-event-array" />

   - `'array'` -- write a series of data events (useful for aggregating events synchronously before going async).
      - *expects* `.value` to be an `Array<`[`WritableDataEvent`](#interface_writable-data-event)`>`.




<a name="#interface_writable-data-event-comment" />

   - `'comment'` -- write a comment to the output stream in the appropriate format. Newlines within the string will become comments on separate lines. Comment-terminating substrings within the string will be escaped.
      - *expects* `.value` to be a `string`.

<a name="#interface_writable-data-event-newlines" />

   - `'newlines'` -- write the given number of newlines to the output.
      - *expects* `.value` to be a `uint`.
