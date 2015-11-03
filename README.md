# graphy [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Query linked-data graphs by abstracting away traditional JSON-LD interaction


## Install

```sh
$ npm install --save graphy
```


## Usage

```turtle
@prefix ns: <vocab://ns/> .

ns:Mickey ns:existsAs [
	a ns:Mouse ;
	ns:hasPet ns:Pluto ;
	foaf:firstName "Mickey"^^xsd:string ;
] .
```

```js
var graphy = require('graphy');

query_sparql_engine('describe <vocab://ns/Mickey>', function(json_ld) {
	var graph = graphy(json_ld);

	graph.network('ns:').forEach(function(node) {
		node.$type; // String('Mouse'){'@type':'@id', '@id': 'vocab://ns/Mouse'}
		node.hasPet; // String('Pluto'){'@type':'@id', '@id': 'vocab://ns/Pluto'}
		node['foaf:firstName']; // String('Mickey'){'@type':'http://www.w3.org/2001/XMLSchema#string', '@value': 'Mickey'}
	});
});
```

## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.js.svg
[npm-url]: https://npmjs.org/package/graphy
[travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/graphy.js
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js
[coveralls-image]: https://coveralls.io/repos/blake-regalia/graphy.js/badge.svg
[coveralls-url]: https://coveralls.io/r/blake-regalia/graphy.js
