
[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] 

<h1>
  <code class="super-graphy">graphy</code> is a collection of RDF libraries for JavaScript developers with a focus on performance and usability.
</h1>
> Each package works with both Node.js and the browser (with the help of a bundler such as Browserify or Webpack).

<code>npm install --save graphy</code>
<br />

## [API Reference](api)
<div class="larger">
  Documentation for the <code>graphy</code> JavaScript API. Includes API examples.
</div>

## [Command Line Interface](cli)
<div class="larger">
  Documentation for the <code>$ graphy</code> command-line interface. Includes CLI examples.
</div>

## Features
 - [Read RDF documents](content.textual#verb_read) using streams. Includes support for N-Triples (.nt), N-Quads (.nq), Turtle (.ttl), and TriG (.trig).
 - [Write RDF data](content.textual#verb_write) using streaming transforms with the awesome and intuitive [concise triples and concise quads language](concise).
 - [Construct RDF data](concise#hash_c3) using ES object literals that reflect the tree-like structure of quads, `graph -> subject -> predicate -> object`, including nested blank nodes and RDF collections.
<!-- - [High-performance](#performance) document readers. -->
 - [Compute the union, intersection, difference or subtraction](memory.dataset.fast) between multiple RDF graphs analagous to [Set Algebra](https://en.wikipedia.org/wiki/Algebra_of_sets).
 - [Compare two RDF graphs](memory.dataset.fast#method_canonicalize) for isomoprhic equivalence, containment, and disjointness by first canonicalizing them with the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/).
 - [Transform RDF data from the command-line](cli) by piping them through a series of sub-commands.


## Package Tree
<div class="larger">
  The <a href="https://github.com/blake-regalia/graphy.js">graphy GitHub repository</a> contains source code for all of the packages published on npm under the <code>@graphy</code> org. Each package is namespaced according to its category, sub-category, and function. They are enumerated here for clarity:
</div>

```yaml
graphy/:
  core.:
    data.:
      factory: '@graphy/core.data.factory'
  memory.:
    dataset.:
      tree: '@graphy/memory.dataset.fast'
  content.:
    nt.:
      read: '@graphy/content.nt.read'
      scribe: '@graphy/content.nt.scribe'
      write: '@graphy/content.nt.write'
    nq.:
      read: '@graphy/content.nq.read'
      scribe: '@graphy/content.nq.scribe'
      write: '@graphy/content.nq.write'
    ttl.:
      read: '@graphy/content.ttl.read'
      scribe: '@graphy/content.ttl.scribe'
      write: '@graphy/content.ttl.write'
    trig.:
      read: '@graphy/content.trig.read'
      scribe: '@graphy/content.trig.scribe'
      write: '@graphy/content.trig.write'
```

<br />



## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.svg
[npm-url]: https://npmjs.org/package/graphy
[travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/graphy.js
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js


<style>
  section h2 {
    margin-bottom: 6pt;
  }
</style>