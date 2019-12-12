[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] 

# graphy.js 🍌
`graphy` is a collection of *high-performance* RDF libraries for JavaScript developers with a focus on usability. 


## [See API Documentation](https://graphy.link/api)
Find the package you need _or_ install the super-package `npm install --save graphy` .

Data Factory
 - [`@graphy/core.data.factory`](https://graphy.link/core.data.factory) -- Data Factory

Dataset
 - [`@graphy/memory.dataset.fast`](https://graphy.link/memory.dataset.fast) -- Dataset

Readers
 - [`@graphy/content.nt.read`](https://graphy.link/content.textual#verb_read) -- N-Triples reader
 - [`@graphy/content.nq.read`](https://graphy.link/content.textual#verb_read) -- N-Quads reader
 - [`@graphy/content.ttl.read`](https://graphy.link/content.textual#verb_read) -- Turtle reader
 - [`@graphy/content.trig.read`](https://graphy.link/content.textual#verb_read) -- TriG reader

Scribers
 - [`@graphy/content.nt.scribe`](https://graphy.link/content.textual#verb_scribe) -- N-Triples scriber
 - [`@graphy/content.nq.scribe`](https://graphy.link/content.textual#verb_scribe) -- N-Quads scriber
 - [`@graphy/content.ttl.scribe`](https://graphy.link/content.textual#verb_scribe) -- Turtle scriber
 - [`@graphy/content.trig.scribe`](https://graphy.link/content.textual#verb_scribe) -- TriG scriber

Writers
 - [`@graphy/content.nt.write`](https://graphy.link/content.textual#verb_write) -- N-Triples writer
 - [`@graphy/content.nq.write`](https://graphy.link/content.textual#verb_write) -- N-Quads writer
 - [`@graphy/content.ttl.write`](https://graphy.link/content.textual#verb_write) -- Turtle writer
 - [`@graphy/content.trig.write`](https://graphy.link/content.textual#verb_write) -- TriG writer


## [Command Line Interface](https://graphy.link/cli)
`npm install --global graphy`


## [Performance Benchmarks](https://github.com/blake-regalia/graphy.js/tree/master/perf)


## [Features](https://graphy.link/)
 - [Read RDF documents](https://graphy.link/content.textual#verb_read) using streams. Includes support for N-Triples (.nt), N-Quads (.nq), Turtle (.ttl), and TriG (.trig).
 - [Write RDF data](https://graphy.link/content.textual#verb_write) using streaming transforms with the awesome and intuitive [concise triples and concise quads language](https://graphy.link/concise).
 - [Construct RDF data](https://graphy.link/concise#hash_c3) using ES object literals that reflect the tree-like structure of quads, `graph -> subject -> predicate -> object`, including nested blank nodes and RDF collections.
 - [Compute the union, intersection, difference or subtraction](https://graphy.link/memory.dataset.fast) between multiple RDF graphs analagous to [Set Algebra](https://en.wikipedia.org/wiki/Algebra_of_sets).
 - [Compare two RDF graphs](https://graphy.link/memory.dataset.fast#method_canonicalize) for isomoprhic equivalence, containment, and disjointness by first canonicalizing them with the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/).
 - [Transform RDF data from the command-line](https://graphy.link/cli) by piping them through a series of sub-commands.




## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.svg
[npm-url]: https://npmjs.org/package/graphy
<!-- [travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master -->
<!-- [travis-url]: https://travis-ci.org/blake-regalia/graphy.js -->
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js
