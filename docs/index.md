
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] 

# `graphy` is a collection of JavaScript packages for RDF that focuses on performance and usability.
Each package works with both Node.js and the browser (with the help of a bundler such as Browserify or Webpack).

## [API Documentation](api)

## Features
 - [Textual Content Handlers](content.textual)
   - **Read & write** RDF documents using streams. Includes support for:
     - N-Triples (.nt)
     - N-Quads (.nq)
     - Turtle (.ttl)
     - TriG (.trig)
   - [High-performance](#performance) document readers.
 - [DatasetTree package](util.dataset.tree)
   - Compute the union, intersection, and difference between two RDF graphs.
   - Compare two RDF graphs for equivalence, inclusion, and disjointness using the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/).
 - Enjoy the ease-of-use with the command-line interface.


## Package Tree
The [graphy GitHub repository](https://github.com/blake-regalia/graphy.js) contains source code for all of the packages published on npm under the `@graphy` org. Each package is namespaced according to its category, sub-category, and function. They are enumerated here for clarity:

```yaml
graphy/:
  core.:
    data.:
      factory: '@graphy/core.data.factory'
  util.:
    dataset.:
      tree: '@graphy/util.dataset.tree'
  content.:
    nt.:
      read: '@graphy/content.nt.read'
      write: '@graphy/content.nt.write'
    nq.:
      read: '@graphy/content.nq.read'
      write: '@graphy/content.nq.write'
    ttl.:
      read: '@graphy/content.ttl.read'
      write: '@graphy/content.ttl.write'
    trig.:
      read: '@graphy/content.trig.read'
      write: '@graphy/content.trig.write'
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
