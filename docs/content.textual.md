
# Textual RDF Content Handlers
This documentation serves for all graphy packages that are under the following prefixes:
 - `@graphy/content.nt.*`
 - `@graphy/content.ttl.*`
 - `@graphy/content.nq.*`
 - `@graphy/content.trig.*`

These are considered 'textual' RDF content handlers and include 

## Contents of this document
 - [A Note About Events](#note_events) -- two different styles for event binding
 - [Accessibility](#accessibility) -- all textual RDF content modules
 - [Datatypes](#datatypes) -- formatting hints or restrictions on primitive ES datatypes
   - [Structs](#structs) -- a value where `typeof value === 'object' && value.constructor === Object`
 - [Verbs](#verbs) -- the module export functions under each content namespace
   - [`read`](#verb_read) -- for reading RDF from a string or stream
   - [`write`](#verb_write) -- for writing RDF using write event objects
 - [Classes](#classes)

 - [Events](#events) -- definitions for event interfaces
 - [Configs](#configs) -- definitions for config interfaces

<!--
- [`scan`](#verb-scan) -- for reading RDF from a string or stream using multiple threads
- [`scribe`](#verb-scribe) -- for writing RDF using Quad objects only
-->

---

<a name="note_events" />

#### A note about Events
These modules offer two distinct approaches to binding event listeners. The traditional `.on(...)` approach will allow you to bind event listeners on the returned handle as popularized by node.js, however this actually does incur a non-trivial amount of overhead for setup, teardown, and every time an event is emitted.

A sleeker alternative is to provide a callback function for each event you want to listen for at the time the reader is created, giving the reader a direct reference to at most a single callback function per event. While this allows for better performance, it might not be suitable for users who want the ability to add multiple event listeners, to remove listeners, or to add listeners at a later time.

See the [`read`](#verb-read) examples for a demonstration of the two styles of attaching event listeners.

---

<a name="accessibility" />

## Accessibility
The following code block demonstrates two *different* ways to access this module.
```js
// stand-alone readers
const nt_read = require('@graphy/content.nt.read');
const nq_read = require('@graphy/content.nq.read');
const ttl_read = require('@graphy/content.ttl.read');
const trig_read = require('@graphy/content.trig.read');

// readers via the graphy 'super module'
const graphy = require('graphy');
const nt_read = graphy.content.nt.read;
const nq_read = graphy.content.nq.read;
const ttl_read = graphy.content.ttl.read;
const trig_read = graphy.content.trig.read;

```

<!--

// stand-alone turbos
const nt_turbo = require('@graphy/content.nt.turbo');
const nq_turbo = require('@graphy/content.nq.turbo');
const ttl_turbo = require('@graphy/content.ttl.turbo');
const trig_turbo = require('@graphy/content.trig.turbo');

// turbos via the graphy 'super module'
const graphy = require('graphy');
const nt_turbo = graphy.content.nt.turbo;
const nq_turbo = graphy.content.nq.turbo;
const ttl_turbo = graphy.content.ttl.turbo;
const trig_turbo = graphy.content.trig.turbo;


// stand-alone writers
const nt_write = require('@graphy/content.nt.write');
const nq_write = require('@graphy/content.nq.write');
const ttl_write = require('@graphy/content.ttl.write');
const trig_write = require('@graphy/content.trig.write');

// writers via the graphy 'super module'
const graphy = require('graphy');
const nt_write = graphy.content.nt.write;
const nq_write = graphy.content.nq.write;
const ttl_write = graphy.content.ttl.write;
const trig_write = graphy.content.trig.write;

-->

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
   - **signature:** `function(result_callback: callback(result: any))` : [`ReadConfig_NoInput`](#config-read)

<a name="#string_js-function-reduce" />

 - `#string/js-function-reduce` -- see [`@string/js-function-*`](#string_js-function-).
   - **signature:** `function(result_a: any, result_b: any)` : `any`

<a name="structs" />

### Structs:
A 'struct' refers to an interface for a simple ES Object `value` such that `value.constructor === Object`. The following section documents the definitions for these interfaces.

<a name="struct_input-string" />

 - `#struct/input-string` -- a static utf8-encoded string to use as input to a reader.
   - **required properties:**
     - `.string`: `string`

<a name="struct_input-stream" />

 - `#struct/input-stream` -- 
   - **required properties:**
     - `.stream`: [`ReadableStream<string>`](api.iso.stream#readable-string)

<a name="struct_write-datum" />

 - `#struct/writable-data-event` -- 
   - **required properties:**
     - `.type`: `string` -- the type of event this object represents, see below
     - `.value`: `any` -- the value of the object
   - The string given for `.type` should be one of the following:
     - `'c3'` -- write a set of triples to the output.
        - *expects* `.value` to be a [concise triple hash](concise#hash_c3)
     - `'c4'` -- write a set of quads to the output.
        - *expects* `.value` to be a [concise quad hash](concise#hash_c4)
     - `'triple'` -- write a single triple to the output.
        - *expects* `.value` to be a [Triple](api.data.factory#class_triple)
     - `'quad'` -- write a single quad to the output.
        - *expects* `.value` to be a [Quad](api.data.factory#class_quad)
     - `'prefixes'` -- updates the current prefix mappings which are used to expand CURIEs found in following concise triple (c3) and concise quad (c4) hashes. Will also cause the writer to output the given prefix mappings if supported by the underlying RDF format.
        - *expects* `.value` to be a [#struct/prefix-mappings](api.data.factory#struct_prefix-mappings)
     - `'comment'` -- if the underlying RDF format supports it, a comment will be written to the output document, otherwise this has no effect.
        - *expects* `.value` to be a:
           - `string` -- a single-line comment
           - [#struct/comment-config](#struct_comment-config)
        [#struct/prefix-mappings](api.data.factory#struct_prefix-mappings)

<a name="struct_comment-config" />

 - `#struct/comment-config` -- 
   - **required properties:**
     - `.contents`: `string` -- the contents of the comment
     - `.column`: `int` -- a column number to break long comments by word and wrap onto the next line

---

<a name="verbs" />

## Verbs
This section documents the 'verb' part of each content module. A 'verb' refers to the fact that the module's export is itself a function.
 - [read](#verb-read) -- reads a serialized RDF document, given by an input stream or string, using a single thread.
 - [turbo](#verb-turbo) -- reads a serialized RDF document, given by an input target, using multiple threads.
 - [write](#verb-write) -- writes serialized RDF data to an output in an event-driven manner using the elegant concise-struct language.

<a name="verb_read" />

### read
Read RDF (in other words, deserialize it) from a document given by an input stream or input string. Uses a single thread.

**Accessible via the following modules:**
 - N-Triples (.nt) -- `@graphy/content.nt.read`
 - N-Quads (.nq) -- `@graphy/content.nq.read`
 - Turtle (.ttl) -- `@graphy/content.ttl.read`
 - TriG (.trig) -- `@graphy/content.trig.read`

**Overloaded variants:**
 - `read([config: `[`#struct/read-config-no-input`](#struct_read-config-no-input)`])`
   - creates a new content reader that will act as a transform, accepting utf8-encoded strings on the writable side and outputting [Quads](api.data.factory#class-quad) on the readable side.
   - **returns** a [new Transform<string, Quad>](api.iso.stream#transform_string-writable-quad-readable)

 - `read(input_string: string[, config: `[`#struct/read-config-no-input`](#struct_read-config-no-input)`])`
   - shortcut for:
      ```js
      read({
          ...config,
          input: {
              string: input_string,
          },
      })
      ```
   - **returns** a [new ReadableStream<Quad>](api.iso.stream#readable_quad)
 
 - `read(input_stream: `[`ReadableStream<string>`](api.iso.stream#readable_string)`[, config: `[`#struct/read-config-no-input`](#struct_read-config-no-input)`])`
   - shortcut for:
      ```js
      read({
          ...config,
          input: {
              stream: input_stream,
          },
      })
      ```
   - **returns** a [new ReadableStream<Quad>](api.iso.stream#readable_quad)

 - `read(config: `[`ReadConfig_WithInput`](#config-read-with-input)`)`
   - creates a new content reader that will output [Quads](api.data.factory#class_quad).
   - **returns** a [new ReadableStream<Quad>](api.iso.stream#readable_quad)

**Examples**:
```js
const nt_read = require('@graphy/content.nt.read');

// input string
nt_read('<a> <b> <c> .', {
    data(y_quad) {
        y_quad.predicate.value;  // 'b'
    },
});

// equivalent to above
nt_read({
    input: {
        string: '<a> <b> <c> .',
    },
    data(y_quad) {
        y_quad.predicate.value;  // 'b'
    },
});

// also equivalent to above
nt_read('<a> <b> <c> .')
    .on('data', (y_quad) => {
        y_quad.predicate.value;  // 'b'
    });


// input stream
let ds_input = fs.createReadStream('./input.nt');
nt_read(ds_input, {
    data(y_quad) { /* ... */ },
});

// equivalent to above
nt_read({
    input: {
        stream: fs.createReadStream('./input.nt'),
    },
    data(y_quad) { /* ... */ },
});

// also equivalent to above
nt_read(fs.createReadStream('./input.nt'))
    .on('data', () => { /* ... */ });


// no input given yet
let ds_reader = nt_read({
    data(y_quad) { /* ... */ },
});
// pipe in data later
fs.createReadStream('./input.nt').pipe(ds_reader);

// no input given yet
let ds_reader = nt_read({
    data(y_quad) { /* ... */ },
});
// write data later
ds_reader.write('<a> <b> <c> .');
```

<a name="verb_write" />

### write
Write RDF (in other words, serialize it) to a document for storage, transmission, etc. Uses a single thread.

**Accessible via the following modules:**
 - N-Triples (.nt) -- `@graphy/content.nt.write`
 - N-Quads (.nq) -- `@graphy/content.nq.write`
 - Turtle (.ttl) -- `@graphy/content.ttl.write`
 - TriG (.trig) -- `@graphy/content.trig.write`

**Overloaded variants:**
 - `write([config: `[`WriteConfig`](#config_write)`])`
   - creates a new content writer and returns a transform that operates in object mode on the writable side and emits utf8-encoded strings on the readable side. The type of object it expects on the writable side depends on the capabilities of the format and the options specified in `config`
     - **returns** a [new `Transform<#struct/write-data-event, string>`](#transform-write-data-event-writable-string-readable)

**Example A**:
Convert a CSV document into an RDF Turtle document using a custom transform in a pipeline.
```js
// snippets/transform-csv.js
const csv_parse = require('csv-parse');
const stream = require('@graphy-dev/api.iso.stream');
const ttl_write = require('@graphy-dev/content.ttl.write');

// a series of streams to pipe together
stream.pipeline(...[
   // read from standard input
   process.stdin,

   // parse string chunks from CSV into row objects
   csv_parse(),

   // transform each row
   new stream.Transform({
      // this transform both expects objects as input and outputs object
      objectMode: true,

      // each row
      transform(a_row, s_encoding, fk_transform) {
         // destructure row into cells
         let [s_id, s_name, s_likes] = a_row;

         // structure data into concise-triple hash
         fk_transform(null, {
            type: 'c3',
            value: {
               ['demo:'+s_name]: {
                  'foaf:name': '"'+s_name,
                  'demo:id': parseInt(s_id),
                  'demo:likes': s_likes.split(/\s+/g)
                     .map(s => `demo:${s}`),
               },
            },
         });
      },
   }),

   // serialize each triple
   ttl_write({
      prefixes: {
         demo: 'http://ex.org/',
         foaf: 'http://xmlns.com/foaf/0.1/',
      },
   }),

   // write to standard output
   process.stdout,

   // listen for errors; throw them
   (e_stream) => {
      throw e_stream;
   },
]);
```

Then, we can run the following command:
```sh
cat <<EOF | node snippets/transform-csv.js
> 1,Blake,Banana
> 2,Banana,Water Sunlight Soil
> EOF
```

And get the output:
```turtle
@prefix demo: <http://ex.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

demo:Blake foaf:name "Blake" ;
   demo:id 1 ;
   demo:likes demo:Banana .

demo:Banana foaf:name "Banana" ;
   demo:id 2 ;
   demo:likes demo:Water, demo:Sunlight, demo:Soil .

```

---

<a name="events" />

## Event definitions

<a name="event_read" />

#### events **ReadEvents**
The definition for all possible events emitted during content reading. Please [see this note about events](#note_events) to understand how this definition applies to both the traditional `.on()`-style of event binding as well as the inline-style.

**Events:**
 - `ready()`
   - Gets called once the input stream is readable. If the input is a string, then this event gets called immediately.
 - `base(iri: string)`
   - Gets called once for each base statement as soon as it is parsed. `iri` is the full IRI of the new base.
   - *example:*
      ```js
      ttl_read('@base <http://example.org/vocabulary/> .', {
          base(p_iri) {
              p_iri;  // 'http://example.org/vocabulary/'
          },
      });
      ```
 - `prefix(id: string, iri: string)`
   - Gets called once for each prefix statement as soon as it is parsed. `id` will be the name of the prefix without the colon and `iri` will be the full IRI of the associated mapping.
   - *example:*
      ```js
      ttl_read('@prefix dbr: <http://dbpedia.org/resource/> .', {
          prefix(s_id, p_iri) {
              s_id;  // 'dbr'
              p_iri;  // 'http://dbpedia.org/resource/'
          },
      });
      ```
 - `data(quad: `[`Quad`](api.data.factory#class_quad)`)`
   - Gets called once for each triple/quad as soon as it is parsed.
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
 - `enter(graph: `[`Term`](api.data.factory#class_namednode)`)`
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
 - `exit(graph: `[`NamedNode`](api.data.factory#class_named-node)`)`
   - Gets called each time a graph block is exitted as soon as the closing brace character `}` is read.       `graph` will either be a [NamedNode](api.data.factory#class_named-node), [BlankNode](api.data.factory#class_blank-node) or       [DefaultGraph](api.data.factory#class_default-graph).
  - `progress(delta: integer)`
    - Gets called each time the reader has finished processing a chunk of data is going asynchronous to wait for the next I/O event. `delta` will reflect the number of characters that were consumed from the input which resulted in a change to the reader's internal state (i.e., incomplete tokens must wait for next chunk to be terminated). This event offers a nice way to provide progress updates to the user but would also require knowing ahead of time how many characters in total are contained by the input. This event also provides hints to resource-hungry applications when it might be an opportunistic time to perform synchronous tasks. This event will also be called right before the `eof()` event with a `delta` equal to `0`.
  - `error(err: Error)`
    - Gets called if an error occurs any time during the read process, including malformed syntax errors, unreadable inputs, and so forth. If an error does occur, no other events will be emitted after this one. If you do not include an error event handler, the parser will throw the error.
  - `eof(prefixes: `[`#hash/prefix-mappings`](api.data.factory#hash_prefix-mappings)`)`
    - Gets called once the 'end-of-file' has been reached on the input and all other events have been emitted, except for the final `end()` event to indicate the the output stream is done. This event is useful for grabbing the final map of `prefixes`.
  - `end()`
    - Gets called once at the very end of the input. It indicates that the input stream (if any) has been closed and no more events will be emitted.


<a name="events_write" />

#### events **WriteEvents**
The definition for all possible events emitted during content writing. Please [see this note about events](#note-events) to understand how this definition applies to both the traditional `.on()`-style of event binding as well as the inline-style.

**Events:**
 - ... [see those inherited from @nodejs/stream.Transform](https://nodejs.org/api/stream.html#stream_class_stream_transform) (i.e., events from both @nodejs/stream.Readable and @nodejs/stream.Writable)

---

<a name="classes" />

## Classes

<a name="class_concise-quad-writer" />

### class **ConciseQuadWriter** extends [Transform](api.iso.stream#transform)&lt;[#hash/c4](concise#c4-hash), string&gt;
Acts as an object-writable, string-readable Transform for serializing RDF quads from memory to an output destination. Expects objects on the writable side to be of type [#hash/c4](concise#c4-hash).

**Construction:**
See [`write`](#verb-write).

**Methods:**
 - ... [see those inheritted from Transform](api.iso.stream#transform)
 - `graph(graph: `[`NamedNode`](api.data.factory#class_named-node)`)` -- creates an instance of a [`ConciseTripleWriter`](#class_triple-writer) that allows for writing multiple statements which belong to the same given `graph`.
   - **returns** a [new `ConciseTripleWriter`](#class_concise-triple-writer)
 - `subject(subject: `[`NamedNode`](api.data.factory#class_named-node)`)` -- creates an instance of a [`ConcisePairWriter`](#class_pair-writer) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `ConcisePairWriter`](#class_concise-pair-writer)

<a name="class_concise-triple-writer" />

### class **ConciseTripleWriter** extends [Transform](api.iso.stream#transform)&lt;[#hash/c3](concise#c3-hash), string&gt;
Acts as an object-writable, string-readable Transform for serializing RDF triples from memory to an output destination. Expects objects on the writable side to be of type [#hash/c3](concise#c3-hash).

**Construction:**
See [`write`](#verb-write).

**Methods:**
 - ... [see those inheritted from Transform](api.iso.stream#transform)
 - `subject(subject: `[`NamedNode`](api.data.factory#class_named-node)`)` -- creates an instance of a [`ConcisePairWriter`](#class_pair-writer) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `ConcisePairWriter`](#class_concise-pair-writer)


<a name="class-concisepairwriter" />

### class **ConcisePairWriter** extends [Transform](api.iso.stream#transform)&lt;[#hash/c4](concise#c4-hash), string&gt;
Acts as an object-writable, string-readable Transform for serializing RDF quads from memory to an output destination. Expects objects on the writable side to be of type [#hash/c4](concise#c4-hash).

**Construction:**
See [`write`](#verb-write).

**Methods:**
 - ... [see those inheritted from Transform](api.iso.stream#transform)
 - `graph(graph: `[`NamedNode`](api.data.factory#class_named-node)`)` -- creates an instance of a [`ConciseTripleWriter`](#class_triplewriter) that allows for writing multiple statements which belong to the same given `graph`.
   - **returns** a [new `ConciseTripleWriter`](#class_concisetriplewriter)
 - `subject(subject: `[`NamedNode`](api.data.factory#class_namednode)`)` -- creates an instance of a [`ConcisePairWriter`](#class_pairwriter) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `ConcisePairWriter`](#class_concisepairwriter)

<a name="class_rdfjs-quad-writer" />

### class **RDFJSQuadWriter** extends [Transform](api.iso.stream#transform)&lt;[@RDFJS/Quad](http://rdf.js.org/#quad-interface), string&gt;]
Contains methods for serializing RDF quads from memory to an output destination.

**Construction:**
See [`write`](#verb_write).

**Methods:**
 - `async add(quads: `[`#struct/c4-hash`](concise#c4-hash)`)` -- serialize 
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `async add(quad: `[`@RDFJS/Quad`](http://rdf.js.org/#quad-interface)`)`
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `graph(graph: `[`NamedNode`](api.data.factory#class_namednode)`)` -- creates an instance of a [`TripleWriter`](#class_triplewriter) that allows for writing multiple statements which belong to the same given `graph`.
   - **returns** a [new `TripleWriter`](#class_triplewriter)
 - `subject(subject: `[`NamedNode`](api.data.factory#class_namednode)`)` -- creates an instance of a [`PairWriter`](#class_pairwriter) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `PairWriter`](#class_pairwriter)


<a name="class_generic-quad-writer" />

### class **GenericQuadWriter** extends [Transform&lt;Quad | @RDFJS/Quad, string&gt;]()
Contains methods for serializing RDF quads from memory to an output destination.

**Construction:**
See [`write`](#verb_write).

**Methods:**
 - `async add(quads: `[`#hash/concise-quads`](concise#c4_hash)`)` -- serialize 
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `async add(quad: `[`@RDFJS/Quad`](http://rdf.js.org/#quad-interface)`)`
   - **resolves to** a [`WriteReport`](#class_writereport)
 - `graph(graph: `[`NamedNode`](api.data.factory#class_namednode)`)` -- creates an instance of a [`TripleWriter`](#class_triplewriter) that allows for writing multiple statements which belong to the same given `graph`.
   - **returns** a [new `TripleWriter`](#class_triplewriter)
 - `subject(subject: `[`NamedNode`](api.data.factory#class_namednode)`)` -- creates an instance of a [`PairWriter`](#class_pairwriter) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
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
 - `subject(subject: `[`NamedNode`](api.data.factory#class_namednode)`)` -- creates an instance of a [`PairWriter`](#class_pairwriter) that allows for writing multiple statements which belong to the same given `subject` under the default graph.
   - **returns** a [new `PairWriter`](#class_pairwriter)


---

<a name="configs" />

## Configs

<a name="config_read-no-input" />

#### config **ReadConfig_NoInput** inlines [ReadEvents](#events_read)
An interface that defines the config object passed to a content reader.

**Options:**
 - ... [see those inlined from ReadEvents](#events_read)

<a name="config_read-with-input" />

#### config **ReadConfig_WithInput** extends [ReadConfig_NoInput](#config_read-no-input)
      
**Options:**
 - ... [see those inheritted from ReadConfig_NoInput](#config-read-no-input)

**Required:**
 - `input` : [`#struct/input_string`](#struct_input-string)` | `[`#struct/input_stream`](#struct_input-stream)


<a name="config_write" />

#### config **WriteConfig** inlines [WriteEvents](#events_write)
An interface that defines the config object passed to a content writer.

**Options:**
 - ... [see those inlined from WriteEvents](#events_write)
 - `type` : `'concise' | 'rdfjs' | null` -- optionally specify the type of objects that will be written to the transform, where `'concise'` indicates objects of either [concise triple hash](concise#hash_c3) or [concise quad hash](concise#hash_c4) depending on whether or not the underlying serialization format supports quads, and where `'rdfjs'` indicates objects of [@RDFJS/Quad](http://rdf.js.org/#quad-interface) (the graph component will be ignored for formats that do not support quads). If `null` is given or this option is not specified, each object written to the transform will be automatically duck-typed and interpretted as one of these two object types.
 - `prefixes` : [`#hash/prefix-mappings`](api.data.factory#hash_prefix-mappings) -- prefix mappings to use in order to expand the concise-term strings within concise-quad hashes as they are written. These prefixes will also be used to create prefix statements and terse terms on the output stream whenever possible (e.g., for Turtle and TriG documents).


<!-- - `coercions` : [`#map/object-coercions`](#map-objectcoercions) -- allows for extending the built-in mappings for coercing objects that are an `instanceof` some class or function to their RDF representation. For example, an instance of the `Date` object will -->


<!--

<a name="config-turbo-no-input" />

#### config **TurboConfig_WithInput** inlines [TurboEvents](#events-turbo)
 
**Required:**
 - `input` : [`#struct/input_file`](#struct_input-file)` | `[`#struct/input_url`](#struct_input-url)
 - `map` : [`#string/js_function_map`](#string-js_function_map)
   - **signature:** `function(result_callback: callback(result: any))` : [`ReadConfig_NoInput`](#config-read)
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
