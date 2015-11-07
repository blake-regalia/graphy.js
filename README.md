# graphy [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> Query linked-data graphs by abstracting away traditional JSON-LD interaction


## Install

```sh
$ npm install --save graphy
```


## Usage

Take the following graph:
```turtle
@prefix ns: <vocab://ns/> .
@prefix color: <vocab://color/> .
@prefix plant: <vocab://plant/> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

ns:Banana
	a ns:Fruit ;
	ns:shape "curved"^^ns:Liberty ;
	ns:tastes "good"^^xsd:string ;
	ns:data 25 ;
	ns:class ns:Berry ;
	ns:appears color:Yellow ;
	plant:blossoms ns:YearRound ;
	ns:alias ns:Cavendish ;
	ns:alias ns:Naner ;
	ns:alias ns:Bananarama ;
	ns:stages (
		ns:FindSpace
		plant:Seed
		plant:Grow
		plant:Harvest
	) .
```

Here, `example.json` is a JSON-LD file generated from the graph above:
```js
var graphy = require('graphy');

var json_ld = require('./example.json');
var q_graph = graphy(json_ld);

// traverse the graph using namespace given by the prefix 'ns:'
q_graph.network('ns:', function(k_banana) {

	// get iri of node
	k_banana.$id; // 'Banana'
	k_banana['@id']; // 'vocab://ns/Banana'

	// get default `rdf:type` property of node
	k_banana.$type; // 'Fruit'
	k_banana['@type']; // 'vocab://ns/Fruit'

	// get value of a literal
	k_banana.shape(); // 'curved'
	k_banana.tastes(); // 'good'

	// get suffixed datatype of a literal
	k_banana.shape.$type; // 'Liberty'
	k_banana.tastes.$type; // undefined

	// get full path datatype of a literal
	k_banana.shape['@type']; // 'vocab://ns/Liberty'
	k_banana.tastes['@type']; // 'http://www.w3.org/2001/XMLSchema#string'

	// change namespace to get suffixed datatype of literal
	k_banana.tastes.$('xsd:').$type; // 'string'

	// properties of an iri in same namespace
	k_banana.class(); // 'Berry'
	k_banana.class.$id; // 'Berry'
	k_banana.class['@id']; // 'vocab://ns/Berry'
	k_banana.class['@type']; // '@id'

	// properties of an iri in different namespace
	k_banana.appears(); // undefined
	k_banana.appears.$id; // undefined
	k_banana.appears['@id']; // 'vocab://color/Yellow'
	k_banana.appears['@type']; // '@id'
	k_banana.appears.$('color:').$id; // 'Yellow'

	// changing namespace
	k_banana.$('plant:').blossoms(); // undefined
	k_banana.$('plant:').blossoms.$id; // 'vocab://ns/YearRound'
	k_banana.$('plant:').blossoms.$('ns:').$id; // 'YearRound'

	// autp-prefixing an iri
	k_banana.$.short; // ns:Banana
	k_banana.appears.$.short; // color:Yellow

	// type indicators
	k_banana.$is(); // 'blanknode'
	k_banana.$is.blanknode; // true

	// type indicators ..contd'
	k_banana.appears.$is(); // 'iri'
	k_banana.data.$is(); // 'literal'
	k_banana.stages.$is(); // 'collection'

	// type indicators ..contd'
	k_banana.appears.$is.iri; // true
	k_banana.data.$is.literal; // true
	k_banana.stages.$is.iri; // undefined
	k_banana.stages.$is.literal; // undefined
	k_banana.stages.$is.collection; // true

	// predicates with multiple objects
	k_banana.alias; // emits warning: 'more than one triple share the same predicate "ns:alias" with subject "ns:Banana"; By using '.alias', you are accessing any one of these triples arbitrarily'

	// ..contd'
	var a_items = [];
	k_banana('alias', function(k_alias) { // implicit forEach
		a_items.push(k_alias());
	});
	a_items; // ['Cavendish', 'Naner', 'Bananarama']

	// collections
	let a_stages = [];
	k_banana.stages(function(k_stage) { // implicit forEach
		var s_stage_name = k_stage.$id || k_stage.$('plant:').$id;
		a_stages.push(s_stage_name);
	});
	a_stages; // ['FindSpace', 'Seed', 'Grow', 'Harvest']
});
```

## Iterating

`for..in`

`for..of`

## RDF Collections

In order to be consistent with the graph, rdf collection properties are emulated on collection objects. So instead of accessing a collection's elements via Array's properties/methods, you can also use the `rdf:first` and `rdf:rest` properties:
```javascript
let w_list = k_banana.stages.$('rdf:');

w_list.first.$('ns:').$id; // 'FindSpace'

w_list = w_list.rest;
w_list.first.$('plant:').$id; // 'Seed'

w_list = w_list.rest;
w_list.first.$('plant:').$id; // 'Grow'

w_list = w_list.rest;
w_list.first.$('plant:').$id; // 'Harvest'

w_list = w_list.rest;
w_list.$id; // 'nil'

// ------------ or in a loop ------------
let a_stages = [];
let w_list = k_banana.stages.$('rdf:');
while(w_list.$id !== 'nil') {
	a_stage.push(w_list.first.$('plant:').$id || w_list.first.$('ns:').$id);
	w_list = w_list.rest;
}
a_stages; // ['FindSpace', 'Seed', 'Grow', 'Harvest']
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
