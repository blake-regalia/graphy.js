# graphy [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] 
> Abstracts JSON-LD objects with an API for easy traversal and exploration of an RDF graph programatically. It emphasizes the use of iterators and namespaces to access entities by their suffix.


# Contents
 - [Setup](#install)
 - [Example Usage](#usage)
 - [Iterators and Collections](#iterating)
 - [API Reference](#api-reference)


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
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
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
	ns:alias ns:Cavendish, ns:Naner, ns:Bananarama ;
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
	let k_banana = q_network.select('ns:Banana').$('ns:');

	// get IRI of node
	k_banana['@id']; // 'vocab://ns/Banana'
	k_banana.$id(); // 'Banana'

	// get `rdf:type` property(s) of node
	k_banana['@type']; // ['vocab://plant/Fruit', 'vocab://ns/Food']
	k_banana.$types(); // ['Food']
	k_banana.$type(); // 'Food'
	k_banana.$types('plant:'); // ['Fruit']
	k_banana.$type('plant:'); // 'Fruit'

	// get value of a literal
	k_banana.tastes(); // 'good'
	k_banana.shape(); // 'curved'

	// get absolute datatype of a literal
	k_banana.shape['@type']; // 'vocab://ns/Liberty'
	k_banana.tastes['@type']; // 'http://www.w3.org/2001/XMLSchema#string'

	// get suffixed datatype of a literal
	k_banana.shape.$type(); // 'Liberty'

	// set terminal namespace to get suffixed datatype of literal
	k_banana.tastes.$type(); // undefined
	k_banana.tastes.$type('xsd:'); // 'string'

	// properties of an IRI in same accessor namespace
	k_banana.class(); // 'Berry'
	k_banana.class.$id(); // 'Berry'
	k_banana.class['@id']; // 'vocab://ns/Berry'
	k_banana.class['@type']; // '@id'

	// properties of an IRI in different namespace
	k_banana.appears(); // undefined
	k_banana.appears('color:'); // 'Yellow'
	k_banana.appears.$id(); // undefined
	k_banana.appears.$id('color:'); // 'Yellow'
	k_banana.appears['@id']; // 'vocab://color/Yellow'
	k_banana.appears['@type']; // '@id'

	// changing accessor namespace
	k_banana.$types('plant:'); // ['Fruit', 'EdiblePart']
	k_banana.$('plant:').blossoms(); // undefined
	k_banana.$('plant:').blossoms['@id']; // 'vocab://ns/YearRound'
	k_banana.$('plant:').blossoms('ns:'); // 'YearRound'

	// get SPARQL/TTL-compatible string representation of any entity
	k_banana.$n3(); // 'ns:Banana'
	k_banana.$n3(false); // '<vocab://ns/Banana>'
	k_banana.appears.$n3(); // 'color:Yellow'
	k_banana.tastes.$n3(); // '"good"^^xsd:string'
	k_banana.tastes.$n3.value(); // '"good"'
	k_banana.tastes.$n3.datatype(); // 'xsd:string'

	// ...cont'd
	k_banana.class.$n3(); // 'ns:Berry'
	k_banana.class.$nquad(); // '<vocab://ns/Berry>'
	k_banana.tastes.$nquad(); // '"good"^^<http://www.w3.org/2001/XMLSchema#string>'
	k_banana.stages.$n3(); // '[rdf:first ns:FindSpace; rdf:rest (plant:Seed plant:Grow plant:Harvest)]'
	k_banana.stages.$n3(false); // '[<http://www.w3.org/1999/02/22-rdf-syntax-ns#first> <vocab://ns/FindSpace>;<http://www.w3.org/1999/02/22-rdf-syntax-ns#rest> (<vocab://plant/Seed> <vocab://plant/Grow> <vocab://plant/Harvest>)]'

	// type indicators
	k_banana.$is(); // 'node'
	k_banana.$is.node; // true

	// ...cont'd
	k_banana.appears.$is(); // 'iri'
	k_banana.data.$is(); // 'literal'
	k_banana.stages.$is(); // 'collection'
	k_banana.considered.$is(); // 'blanknode'

	// ...cont'd
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
		return k_stage.$id() || k_stage.$id('plant:');
	}); // ['FindSpace', 'Seed', 'Grow', 'Harvest']

	// collections: (equivalent to above) implicit `.map`
	k_banana.stages(function(k_stage) { // implicit `.map` callback
		return k_stage.$id() || k_stage.$id('plant:');
	}); // ['FindSpace', 'Seed', 'Grow', 'Harvest']

	// collections: implicit array accessor
	k_banana.stages(0).$id(); // 'FindSpace'
});
```

<a name="#Iterators" />
## Iterating

### `for..of`
An entity of type `node` supports iteration directly on the reference itself. The key of the iterator will be the predicate suffixed by the current accessor namespace, the value of the iterator will be an array of entities that are pointed to by that predicate:

```js
for(let [s_predicate_suffix, a_objects] of k_banana) {
	a_objects.forEach((k_node) => {
		console.log(s_predicate+' => {'+k_node.$is()+'} '+k_node.$n3());
	});
}

// alias => {iri} ns:Cavendish
// alias => {iri} ns:Naner
// alias => {iri} ns:Bananarama
// appears => {iri} color:Yellow
// class => {iri} ns:Berry
// considered => {blanknode} _:b4
// data => {literal} "25"^^xsd:integer
// stages => {collection} [rdf:first ns:FindSpace;rdf:rest (plant:Seed plant:Grow plant:Harvest)]
// ...
```

You can also iterate on the no-args call of a node entity, this will set the namespace to an empty string so that the key of each iterator is the full IRI of each predicate:
```js
for(let [p_predicate, a_objects] of k_banana()) {  // same as k_banana.$('')
	a_objects.forEach((k_node) => {
		console.log(q_graph.shorten(p_predicate)+' => {'+k_node.$is()+'} '+k_node.$n3());
	});
}

// ns:alias => {iri} ns:Cavendish
// ns:alias => {iri} ns:Naner
// ns:alias => {iri} ns:Bananarama
// ns:appears => {iri} color:Yellow
// plant:blossoms => {iri} ns:YearRound
// ns:class => {iri} ns:Berry
// ...
```

## RDF Collections

Collection objects are arrays that are also an [entity](#entity).

In order to be consistent with the graph, rdf collection properties are emulated on collection objects. So instead of accessing a collection's elements via Array's properties/methods, you can also use the `rdf:first` and `rdf:rest` properties:
```javascript
let w_list = k_banana.stages.$('rdf:');

w_list.first.$id('ns:'); // 'FindSpace'

w_list = w_list.rest;
w_list.first.$id('plant:'); // 'Seed'

w_list = w_list.rest;
w_list.first.$id('plant:'); // 'Grow'

w_list = w_list.rest;
w_list.first.$id('plant:'); // 'Harvest'

w_list = w_list.rest;
w_list.$id('rdf:'); // 'nil'

// ------------ or in a loop ------------
let a_stages = [];
let w_list = k_banana.stages.$('rdf:');
while(w_list.$id('rdf:') !== 'nil') {
	a_stage.push(w_list.first.$id('plant:') || w_list.first.$id('ns:'));
	w_list = w_list.rest;
}
a_stages; // ['FindSpace', 'Seed', 'Grow', 'Harvest']
```

<a name="#API_Reference" />
# API Reference

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
Returns the graphy entity for the IRI given by `name`, which may be a prefixed name or full IRI. Optional `namespace` argument will set the accessor namespace for the returned object (see [entity.$()](#e.$)).

<a name="n.top" />
### network.top([map: function])
Returns an array of only entities that are named things (ie not blanknodes) or blanknodes that do not appear in the object position of any triples in the current graph. These can be thought of as top-level nodes. Accepts an optional `map` function callback to transform the entities before returning the array. These entities will have empty an accessor namespace by default.

<a name="n.shorten" />
### network.shorten(iri: string)
Shortens an IRI using prefixes defined in the @context of the original jsonld object.

<a name="n.@" />
### network.[...]
[Network](#network) is an array, so it supports all native functions. Each item in the array is a graphy entity with an empty accessor namespace.

---------------------------------------
<a name="entity" />
## Entity
A reference to an RDF entity/jsonld object covered by the set of methods/properties documented in this section. An entity can be obtained by [`network.select()`](#n.select), or any one of the array interface methods on network.

<a name="e" />
### entity()
> Only for types: `node`

Returns a Map of {predicate => object} pairs for all triples stemming from this entity as the subject. The key of each pair is a string representing the full predicate IRI, the value is an entity representing the object.

### entity([namespace: string])
> Only for types: `iri`

Returns the IRI of this entity suffixed by the current accessor namespace or the `namespace` argument if it is used. You can obtain the full IRI no matter the current accessor namespace by using an empty string for `namespace`.

### entity()
> Only for types: `literal`

Returns the value portion of the literal. See [`entity.$type`](#e.$type) and [`entity.$n3.datatype`](#entity.$n3_datatype) for getting the datatype of a literal.

### entity(access_name: string)
> Only for types: `node`

Returns an array of entities that are pointed to by the namespaced predicate suffix `access_name`. If the current accessor namespace is empty, then the access name would be the full IRI of the predicate.

<a name="e" />
### entity(access_name: string[, map_callback: function])
> Only for types: `node`

Same as [`entity()`](#e) except that it maps every object pointed to by `access_name` to the given `map_callback` function before returning the array of entities.

### entity()
> Only for types: `collection`

Returns the array 

### entity(item_index: integer)
> Only for types: `collection`

Returns the item at `item_index` in the collection.

### entity(map_callback: function)
> Only for types: `collection`

Applies the given `map_callback` to every item in the array and returns the resulting array.

<a name="e.$" />
### entity.$(namespace: string)
Sets the accessor namespace of the returned object to the expanded version of the IRI given by `namespace`, may be either an n3 prefix or a full IRI. By chaining this call, you can change the accessor namespace on the same line to access properties or IRIs by their suffix.

### entity.$()
This no-args version of the namespace method will instead return the full IRI of the current accessor namespace.

<a name="e.$n3" />
### entity.$n3()
Returns a terse n3 representation of the current entity as a string. It is prefixed by the longest matching URI available in the original JSON-LD context, unless the resulting suffix would contain invalid characters for a prefixed IRI in either SPARQL or TTL. The string is compatible with SPARQL and TTL as long as the corresponding prefix is also included in the document.

<a name="e.$n3_datatype" />
### entity.$n3.datatype()
> Only for types: `literal`

Returns the IRI datatype of this literal in terese n3 form.

<a name="e.$nquad" />
### entity.$nquad()
Returns the n-quad representation of this entity. Useful for serializing to SPARQL/TTL without worrying about prefixes.
> Caution: `.$nquad()` does not currently support nested RDF collections (it will produce blanknode collisions)

<a name="e.$in" />
### entity.$in(namespace: string)
Returns true if the current entity's IRI is in the given `namespace`. Will always return false for blanknodes, collections and literals.

<a name="e.$is" />
### entity.$is()
Calling this function returns the reference type of this entity as a string. You can also use a shorthand check by testing if `.$is[ref_type]` is defined as `true`. eg: `if(entity.$is.iri === true) ...`. Possible values for type are:
 - *node* - this entity exists as the subject of some triple(s). This entity contains predicates that point to objects
 - *iri* - this is a mere symbollic reference to an IRI, which exists as the object of some triple. If you encounter this type, it means that you reached a named thing (ie: not a blanknode). Use [`entity.$node()`](#e.node) to obtain the node of this IRI if it exists in the current graph
 - *literal* - an RDF literal
 - *collection* - an RDF collection

<a name="e.node" />
### entity.$node([namespace: string])
> Only for types: `iri`

Will return the node object for accessing triples that have this IRI as its subject. If there are no triples in the current jsonld graph that have this IRI as its subject, calling `.$node()` will return undefined for this IRI. Passing an optional `namespace` argument will set the accessor namespace on the returned graphy entity.

<a name="e.@id" />
### entity['@id']
Reflects the json-ld `@id` property.

<a name="e.$id" />
### entity.$id([namespace: string])
The suffix of the `@id` property after removing the current accessor namespace from the beginning. If the current accessor namespace does not match, or this IRI is a blanknode, this method will return `undefined`. If a `namespace` argument is passed, the method will use the given `namespace` instead of the current accessor namespace to suffix the IRI.

<a name="e.@type" />
### entity['@type']
Reflects the json-ld `@type` property. For literals, this will be the datatype. For nodes, this will be an array of objects pointed to by the `rdf:type` predicate.

<a name="e.$types." />
### entity.$types
> Only for types: `node`

An array of graphy IRI entities that are pointed to by the `@type` property (which is the `rdf:type` predicate) for this entity.

<a name="e.$types" />
### entity.$types([namespace: string])
> Only for types: `node`

Returns an array of strings that are the suffixes of the IRIs pointed to by the `@type` property after removing the current accessor namespace (or the given `namespace` argument) from the beginning of the IRI. If the namespace does not match any of the IRIs, this will return an empty array `[]`.

<a name="e.$type" />
### entity.$type([namespace: string])
> Only for types: `node`

Shortcut for `.$types(..)[0]`. If this node entity has more than one `rdf:type`, accessing this property will issue a warning. If the current accessor namespace does not match any of the IRIs, this will return `undefined`. If a `namespace` argument is passed, the method will use the given namespace instead of the current accessor namespace to suffix the IRI.

### entity.$type([namespace: string])
> Only for types: `literal`

Returns the datatype of this literal entity suffixed by the current accessor namespace or the `namespace` argument if it is used.


## License

ISC © [Blake Regalia]()


[npm-image]: https://badge.fury.io/js/graphy.svg
[npm-url]: https://npmjs.org/package/graphy
[travis-image]: https://travis-ci.org/blake-regalia/graphy.js.svg?branch=master
[travis-url]: https://travis-ci.org/blake-regalia/graphy.js
[daviddm-image]: https://david-dm.org/blake-regalia/graphy.js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/blake-regalia/graphy.js

