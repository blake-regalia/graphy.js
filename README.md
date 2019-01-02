[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] 

# graphy.js 🍌
`graphy` is a collection of RDF libraries for JavaScript developers that focuses on performance and usability. 

## [See API Documentation](https://graphy.link/api)

## [Command Line Interface](cli)

## Features
 - [Read & write RDF documents](content.textual) using streams. Includes support for N-Triples (.nt), N-Quads (.nq), Turtle (.ttl), and TriG (.trig).
 - [Construct RDF data](concise#hash_c3) using ES object literals that reflect the tree-like structure of quads, `graph -> subject -> predicate -> object`, including nested blank nodes and RDF collections.
<!-- - [High-performance](#performance) document readers. -->
 - [Compute the union, intersection, difference or subtraction](util.dataset.tree) between multiple RDF graphs analagous to [Set Algebra](https://en.wikipedia.org/wiki/Algebra_of_sets).
 - [Compare two RDF graphs](util.dataset.tree) for equivalence, containment, and disjointness by employing the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/).
 - [Transform RDF data from the command-line](cli) by piping them through a series of sub-commands.




## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.svg
[npm-url]: https://npmjs.org/package/graphy
[travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/graphy.js
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js
