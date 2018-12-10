# graphy.js 🍌
`graphy` is a collection of RDF libraries for JavaScript developers that focuses on performance and usability. Each package works with both Node.js and the browser (with the help of a bundler such as Browserify or Webpack).

### Features
 - Read & write RDF document streams using objects that extend the [RDFJS Data Interface](http://rdf.js.org/), including support for the following formats:
   - N-Triples (.nt)
   - N-Quads (.nq)
   - Turtle (.ttl)
   - TriG (.trig)
 - [High-performance](#performance) textual RDF content readers.
 - Compute the union, intersection, or difference between two RDF graphs using the [DatasetTree package](/docs/util.dataset.tree.md).
 - Compare two RDF graphs for equivalence using the [DatasetTree package](docs/util.dataset.tree.md), which implements the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/).

### API Documentation
 - [Data Factory](/docs/core.data.factory.md) -- documentation for the `@graphy/core.data.factory` package which covers the interfaces for RDF data objects and the methods used to create and mutate them.
 - [Textual Content Handlers](/docs/content.textual.md) -- covers all functionality exposed by packages prefixed with the following prefixes:
   - `@graphy/content.nt.*`
   - `@graphy/content.nq.*`
   - `@graphy/content.ttl.*`
   - `@graphy/content.trig.*`

### Mono-Repo
The [graphy GitHub repository](https://github.com/blake-regalia/graphy.js) contains source code for all of the packages published on npm under the `@graphy` org. Each package is namespaced according to its category, sub-category, and function. They are enumerated here for clarity:

```
@graphy/
   core.
      data.
         factory -- @graphy/core.data.factory since v3.0.0
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
   util.
      dataset.
         tree -- @graphy/util.dataset.tree since v3.0.0
```
