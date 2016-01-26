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
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

plant:Fruit
	ns:contains plant:Seeds .

ns:Banana
	a ns:Food, plant:Fruit, plant:EdiblePart;
	rdfs:label "Banana"^^xsd:string;
	ns:tastes "good" ;
	ns:shape "curved"^^ns:Liberty ;
	ns:data 25 ;
	ns:appears color:Yellow ;
	ns:class ns:Berry ;
	plant:blossoms ns:YearRound ;
	ns:alias ns:Cavendish ;
	ns:alias ns:Naner ;
	ns:alias ns:Bananarama ;
	ns:stages (
		ns:FindSpace
		plant:Seed
		plant:Grow
		plant:Harvest
	) ;
	ns:considered [
		a plant:Clone, plant:Fruit
	] .
```

Here, `example.json` is a JSON-LD file generated from the graph above:
```js
var graphy = require('graphy');
var json_ld = require('./example.json');

graphy(json_ld, (q_network) => {
	
	// select a node from the graph by IRI; set accessor namespace to `ns:` prefix
	let k_banana = q_network.select('ns:Banana', 'ns:');

	// get IRI of node
	k_banana['@id']; // 'vocab://ns/Banana'
	k_banana.$id; // 'Banana'

	// get default `rdf:type` property of node
	k_banana['@type']; // ['vocab://plant/Fruit', 'vocab://ns/Food']
	k_banana.$types; // ['Food']
	k_banana.$type; // 'Food'

	// get value of a literal
	k_banana.tastes(); // 'good'
	k_banana.shape(); // 'curved'

	// get absolute datatype of a literal
	k_banana.shape['@type']; // 'vocab://ns/Liberty'
	k_banana.tastes['@type']; // 'http://www.w3.org/2001/XMLSchema#string'

	// get suffixed datatype of a literal
	k_banana.shape.$type; // 'Liberty'
	k_banana.tastes.$type; // undefined

	// get SPARQL/TTL-compatible string representation of any entity
	k_banana.class.$nquad(); // '<vocab://ns/Berry>'
	k_banana.class.$n3(); // 'ns:Berry'
	k_banana.tastes.$nquad(); // '"good"^^<http://www.w3.org/2001/XMLSchema#string>'k_banana.tastes.$n3(); // '"good"^^xsd:string'
	k_banana.stages.$n3(); // '[rdf:first ns:FindSpace; rdf:rest (plant:Seed plant:Grow plant:Harvest)]'
	k_banana.stages.$n3(false); // '[<http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <vocab://ns/FindSpace>;<http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> (<vocab://plant/Seed> <vocab://plant/Grow> <vocab://plant/Harvest>)]'

	// change accessor namespace to get suffixed datatype of literal
	k_banana.tastes.$('xsd:').$type; // 'string'

	// properties of an IRI in same accessor namespace
	k_banana.class(); // 'Berry'
	k_banana.class.$id; // 'Berry'
	k_banana.class['@id']; // 'vocab://ns/Berry'
	k_banana.class['@type']; // '@id'

	// properties of an IRI in different namespace
	k_banana.appears(); // undefined
	k_banana.appears.$id; // undefined
	k_banana.appears['@id']; // 'vocab://color/Yellow'
	k_banana.appears['@type']; // '@id'
	k_banana.appears.$('color:').$id; // 'Yellow'

	// changing accessor namespace
	k_banana.$('plant:').$types; // ['Fruit', 'EdiblePart']
	k_banana.$('plant:').blossoms(); // undefined
	k_banana.$('plant:').blossoms['@id']; // 'vocab://ns/YearRound'
	k_banana.$('plant:').blossoms.$('ns:').$id; // 'YearRound'

	// terse form: auto-prefixing (SPARQL & TTL compatible strings)
	k_banana.$terse(); // 'ns:Banana'
	k_banana.appears.$terse(); // 'color:Yellow'
	k_banana.tastes.$terse(); // '"good"^^xsd:string'
	k_banana.tastes.$terse.value(); // '"good"'
	k_banana.tastes.$terse.datatype(); // 'xsd:string'

	// type indicators
	k_banana.$is(); // 'node'
	k_banana.$is.node; // true

	// type indicators ..contd'
	k_banana.appears.$is(); // 'iri'
	k_banana.data.$is(); // 'literal'
	k_banana.stages.$is(); // 'collection'
	k_banana.considered.$is(); // 'blanknode'

	// type indicators ..contd'
	k_banana.$is.node; // true
	k_banana.appears.$is.iri; // true
	k_banana.data.$is.literal; // true
	k_banana.stages.$is.iri; // undefined
	k_banana.stages.$is.literal; // undefined
	k_banana.stages.$is.collection; // true
	k_banana.considered.$is.blanknode; // true

	// predicates with multiple objects
	k_banana.alias; // emits warning: 'more than one triple share the same predicate "ns:alias" with subject "ns:Banana"; By using '.alias', you are accessing any one of these triples arbitrarily'

	// ..contd'
	let a_items = k_banana('alias', function(k_alias) { // implicit `.map` callback
		return k_alias();
	});
	a_items; // ['Cavendish', 'Naner', 'Bananarama']

	// collections
	k_banana.stages().map(function(k_stage) {
		return k_stage.$id || k_stage.$('plant:').$id;
	}); // ['FindSpace', 'Seed', 'Grow', 'Harvest']

	// collections: (equivalent to above) implicit `.map`
	k_banana.stages(function(k_stage) { // implicit `.map` callback
		return k_stage.$id || k_stage.$('plant:').$id;
	}); // ['FindSpace', 'Seed', 'Grow', 'Harvest']

	// collections: implicit array accessor
	k_banana.stages(0).$id; // 'FindSpace'
});
```

## Iterating

`for..in`

`for..of`

## RDF Collections

Calling a collection node as a function with no arguments will return the underlying array.
```js
...
```
> The returned array is the underlying array; mutating the returned object will also affect the underlying array

You can also iterate a collection node using `for..of`
```js
for(let k_stage of k_banana.stages) {
	// ...
}
```

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

---------------------------------------
<a name="graphy" />
## Graphy
The module itself.

## graphy(jsonld: Jsonld_object, ready: function)
Calls `ready(network: Network)` once a graphy [network](#network) has been created for the given `jsonld` object.

---------------------------------------
<a name="network" />
## Network
An array of the jsonld objects in this graph, each represented by a graphy [entity](#entity). 

<a name="n.select" />
### network.select(name: string[, namespace: string])
Returns the graphy [entity](#entity) for the IRI given by `name`, which may be a prefixed name or full IRI. Optional `namespace` argument will set the accessor namespace for the returned object (see [.$](#e.$)).

<a name="n.top" />
### network.top([map: function])
Returns an array of only [entities](#entity) that are named things (ie not blanknodes) or blanknodes that do not appear in the object position of any triples in the current graph. These can be thought of as top-level nodes. Accepts an optional `map` function callback to transform the entities before returning the array. These entities will have empty an accessor namespace by default.

<a name="n.@" />
### network.[...]
[Network](#network) is an array, so it supports all native functions. Each item in the array is a graphy [entity](#entity) with an empty accessor namespace.

---------------------------------------
<a name="entity" />
## Entity
A reference to an RDF entity/jsonld object covered by the set of methods/properties documented in this section. An entity can be obtained by [`network.select()`](#n.select), or any one of the array interface methods on [network](#network).

<a name="e" />
### ()
Returns a Map of {predicate => object} pairs for all triples stemming from this entity as the subject. The key of each pair is a string representing the full predicate IRI, the value is an [entity](#entity) representing the object.

### (access_name: string)
Returns an array of [entities](#entity) that are pointed to by the namespaced predicate suffix `access_name`. If the current accessor namespace is empty, then the access name would be the full IRI of the predicate.

<a name="e" />
### (access_name: string[, ])
Same as [`()`](#e) except  an array of [entities](#entity) that are pointed to by the namespaced predicate suffix `access_name`. If the current accessor namespace is empty, then the access name would be the full IRI of the predicate.

<a name="e.$" />
### .$(namespace: string)
Sets the accessor namespace of the returned object to the expanded version of the IRI given by `namespace`, may be either an n3 prefix or a full IRI. By chaining this call, you can change the accessor namespace on the same line to access properties or IRIs by their suffix.

<a name="e.$n3" />
### .$n3()
Returns a terse n3 representation of the current entity as a string. It is prefixed by the longest matching URI available in the original JSON-LD context, unless the resulting suffix would contain invalid characters for a prefixed IRI in either SPARQL or TTL. The string is compatible with SPARQL and TTL as long as the corresponding prefix is also included in the document.

<a name="e.$nquad" />
### .$nquad()
Returns the n-quad representation of this entity. Useful for serializing to SPARQL/TTL without worrying about prefixes.
> Caution: `.$nquad()` does not currently support nested RDF collections (it will produce blanknode collisions)

<a name="e.$in" />
### .$in(namespace: string)
Returns true if the current entity's IRI is in the given `namespace`. Will always return false for blanknodes, collections and literals.

<a name="e.$is" />
### .$is()
Calling this function returns the reference type of this entity as a string. You can also use a shorthand check by testing if `.$is[ref_type]` is defined as `true`. eg: `if(entity.$is.iri === true) ...`. Possible values for type are:
 - *node* - this entity exists as the subject of some triple(s). This entity contains predicates that point to objects
 - *iri* - this is a mere symbollic reference to an IRI, which exists as the object of some triple. If you encounter this type, it means that you reached a named thing (ie: not a blanknode). Use [`.$node()`](#e.node) to obtain the node of this IRI if it exists in the current graph
 - *literal* - an RDF literal
 - *collection* - an RDF collection

<a name="e.node" />
### .$node([namespace: string])
Only defined on entities of type `iri`. Will return the node object for accessing triples that have this IRI as its subject. If there are no triples in the current jsonld graph that have this IRI as its subject, calling `.$node()` will return undefined for this IRI. Passing an optional `namespace` argument will set the accessor namespace on the returned graphy [entity](#entity).

<a name="e.@id" />
### ['@id']
Reflects the json-ld `@id` property.

<a name="e.$id" />
### .$id([namespace: string])
The suffix of the `@id` property after removing the current accessor namespace from the beginning. If the current accessor namespace does not match, or this IRI is a blanknode, this method will return `undefined`. If a `namespace` argument is passed, the method will use the given `namespace` instead of the current accessor namespace to suffix the IRI.

<a name="e.@type" />
### ['@type']
Reflects the json-ld `@type` property. For literals, this will be the datatype. For nodes, this will be an array of objects pointed to by the `rdf:type` predicate.

<a name="e.$types." />
### .$types
An array of the IRI entities that are pointed to by the `@type` property for this entity.

<a name="e.$types" />
### .$types()
Returns an array containing the suffixes of the IRIs pointed to by the `@type` property after removing the current accessor namespace from the beginning of the IRI. If the current accessor namespace does not match any of the IRIs, this will return an empty array `[]`.

<a name="e.$type" />
### .$type([namespace: string])
Shortcut for `.$types[0].$id`. If this node has more than one `rdf:type`, accessing this property will issue a warning. If the current accessor namespace does not match any of the IRIs, this will return `undefined`. If a `namespace` argument is passed, the method will use the given namespace instead of the current accessor namespace to suffix the IRI.



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
