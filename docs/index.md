
# graphy.js 🍌
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] 

`graphy` is a collection of RDF libraries for JavaScript developers that focuses on performance and usability. Each package works with both Node.js and the browser (with the help of a bundler such as Browserify or Webpack).

### Features
 - Read & write RDF document streams using objects that extend the [RDFJS Data Interface](http://rdf.js.org/), including support for the following formats:
   - N-Triples (.nt)
   - N-Quads (.nq)
   - Turtle (.ttl)
   - TriG (.trig)
 - [High-performance](#performance) textual RDF content readers.
 - Compute the union, intersection, or difference between two RDF graphs using the [DatasetTree package](util.dataset.tree).
 - Compare two RDF graphs for equivalence using the [DatasetTree package](util.dataset.tree), which implements the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/).

### API Documentation
 - [Data Factory](core.data.factory) -- documentation for the `@graphy/core.data.factory` package which covers the interfaces for RDF data objects and the methods used to create and mutate them.
 - [Textual Content Handlers](content.textual) -- covers all functionality exposed by packages prefixed with: `@graphy/content.nt.*`, `@graphy/content.nq.*`, `@graphy/content.ttl.*` and `@graphy/content.trig.*`.

### Mono-Repo
The [graphy GitHub repository](https://github.com/blake-regalia/graphy.js) contains source code for all of the packages published on npm under the `@graphy` org. Each package is namespaced according to its category, sub-category, and function. They are enumerated here for clarity:

```
@graphy/
   core.
      data.
         factory -- @graphy/core.data.factory since v3.0.0
   util.
      dataset.
         tree -- @graphy/util.dataset.tree since v3.0.0
   content.
      nt.
         read -- @graphy/content.nt.read since v3.0.0
         write -- @graphy/content.nt.write since v3.0.0
      ttl.
         read -- @graphy/content.ttl.read since v3.0.0
         write -- @graphy/content.ttl.write since v3.0.0
      nq.
         read -- @graphy/content.nq.read since v3.0.0
         write -- @graphy/content.nq.write since v3.0.0
      trig.
         read -- @graphy/content.trig.read since v3.0.0
         write -- @graphy/content.trig.write since v3.0.0
```

----

### Examples

#### Covert a CSV document to a Turtle document
```js
// snippets/transform-csv.js
const csv_parse = require('csv-parse');
const stream = require('@graphy/core.iso.stream');
const ttl_write = require('@graphy/content.ttl.write');

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

Run from the command line with:
```sh
cat <<EOF | node snippets/transform-csv.js
> 1,Blake,Banana
> 2,Banana,Water Sunlight Soil
> EOF
```

Outputs:
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


## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.svg
[npm-url]: https://npmjs.org/package/graphy
[travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/graphy.js
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js
