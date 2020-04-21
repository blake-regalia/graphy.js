[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] 

# graphy.js 🍌
`graphy` is a collection of *high-performance* RDF libraries for JavaScript developers with a focus on usability. API works in both the browser and Node.js. Expressive CLI tool also available for Node.js.

### [https://graphy.link/](https://graphy.link/)


## Performance Benchmarks
🚀 [See how well `graphy` outperforms all others](https://github.com/blake-regalia/graphy.js/blob/master/perf/README.md).


## Command Line Interface
📑 [See documentation for CLI here](https://graphy.link/cli).

### Install the `graphy` bin CLI
 - npm:
   ```console
   $ npm install --global graphy
   $ graphy --help
   ```

 - yarn:
   ```console
   $ yarn global add graphy
   $ graphy --help
   ```


## [Features](https://graphy.link/)
 - [Read RDF documents](https://graphy.link/content.textual#verb_read) using streams. Includes support for N-Triples (.nt), N-Quads (.nq), Turtle (.ttl), and TriG (.trig).
 - [Write RDF data](https://graphy.link/content.textual#verb_write) using streaming transforms with the awesome and intuitive [concise triples and concise quads language](https://graphy.link/concise).
 - [Construct RDF data](https://graphy.link/concise#hash_c3) using ES object literals that reflect the tree-like structure of quads, `graph -> subject -> predicate -> object`, including nested blank nodes and RDF collections.
 - [Compute the union, intersection, difference or subtraction](https://graphy.link/memory.dataset.fast) between multiple RDF graphs analagous to [Set Algebra](https://en.wikipedia.org/wiki/Algebra_of_sets).
 - [Compare two RDF graphs](https://graphy.link/memory.dataset.fast#method_canonicalize) for isomoprhic equivalence, containment, and disjointness by first canonicalizing them with the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/).
 - [Transform RDF data from the command-line](https://graphy.link/cli) by piping them through a series of sub-commands.
 - [Scan RDF documents](https://graphy.link/content.textual#verb_scan) and run custom code using multiple threads for maximum throughput.


## [See API Documentation](https://graphy.link/api)
🔎 Find the package you need _or_ install the super-package `npm install --save graphy` .

### Core
 - [DataFactory](https://graphy.link/core.data.factory)

### Memory
 - [FastDataset](https://graphy.link/memory.dataset.fast)

### Content
 - **N-Triples**: [NTriplesReader](https://graphy.link/content.textual#verb_read), [NTriplesScanner](https://graphy.link/content.textual#verb_scan), [NTriplesWriter](https://graphy.link/content.textual#verb_write), [NTriplesScriber](https://graphy.link/content.textual#verb_scribe)
 - **N-Quads**: [NQuadsReader](https://graphy.link/content.textual#verb_read), [NQuadsScanner](https://graphy.link/content.textual#verb_scan), [NQuadsWriter](https://graphy.link/content.textual#verb_write), [NQuadsScriber](https://graphy.link/content.textual#verb_scribe)
 - **Turtle**: [TurtleReader](https://graphy.link/content.textual#verb_read), [TurtleWriter](https://graphy.link/content.textual#verb_write), [TurtleScriber](https://graphy.link/content.textual#verb_scribe)
 - **TriG**: [TriGReader](https://graphy.link/content.textual#verb_read), [TriGWriter](https://graphy.link/content.textual#verb_write), [TriGScriber](https://graphy.link/content.textual#verb_scribe)
 - **RDF/XML**: [RdfXmlScriber](https://graphy.link/content.textual#verb_scribe)


## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.svg
[npm-url]: https://npmjs.org/package/graphy
<!-- [travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master -->
<!-- [travis-url]: https://travis-ci.org/blake-regalia/graphy.js -->
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js
