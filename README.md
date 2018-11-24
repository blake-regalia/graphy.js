# graphy.js 🍌
`graphy` is a collection of RDF libraries for JavaScript developers that focuses on performance and usability. Each package works with both Node.js and the browser (with the help of a bundler such as Browserify or Webpack).

### Features
 - Read & write RDF document streams using objects that extend the [RDFJS Data Interface](http://rdf.js.org/), including support for: N-Triples, N-Quads, Turtle, and TriG.
 - [High-performance](#performance) textual RDF content readers.
 - Compute the union, intersection, or difference between two RDF graphs using the [Set package](/doc/api.data.set).
 - Compare two RDF graphs for equivalence using the [Set package](/doc/api.data.set), which implements the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/).

### API Documentation
 - [Data Factory](/doc/api.data.factory) -- documentation for the `@graphy/api.data.factory` package which covers the interfaces for RDF data objects and the methods used to create and mutate them.
 - [Textual Content Handlers](/doc/context.textual) -- covers all functionality exposed by packages prefixed with: `@graphy/content.nt.*`, `@graphy/content.nq.*`, `@graphy/content.ttl.*` and `@graphy/content.trig.*`.

### Mono-Repo
The [graphy GitHub repository](https://github.com/blake-regalia/graphy.js) contains source code for all of the packages published on npm under the `@graphy` org. Each package is namespaced according to its category, sub-category, and function. They are enumerated here for clarity:

```
@graphy/
   api.
      data.
         factory -- @graphy/api.data.factory since v3.0.0
         set -- @graphy/api.data.set since v3.0.0
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