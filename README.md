# graphy.js 🍌
`graphy` is a collection of RDF libraries for JavaScript developers that focuses on performance and usability. 

## [See API Documentation](https://graphy.link/api)

## Features
 - [Textual Content Handlers](content.textual)
   - **Read & write** RDF documents using streams. Includes support for:
     - N-Triples (.nt)
     - N-Quads (.nq)
     - Turtle (.ttl)
     - TriG (.trig)
 - [DatasetTree package](util.dataset.tree)
   - Compute the union, intersection, and difference between two RDF graphs.
   - Compare two RDF graphs for equivalence, inclusion, and disjointness using the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/).


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
