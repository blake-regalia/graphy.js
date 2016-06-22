

### Pseudo-Datatypes:
Throughout this API document, the following datatypes are used to represent expectations imposed on primitive-datatyped parameters to functions and so forth:
 - `hash` - refers to a simple `object` with keys and values (e.g. `{key: 'value'}`)
 - `key` - refers to a `string` used for accessing an arbitrary value in a `hash`
 - `chain` - refers to a method that acts the same as when called as a function without arguments
   - e.g. `thing.chain.property === thing.chain().property`
 - `iri` - refers to a `string` that represents an IRI either by:
   - absolute reference, starting with `'<'` and ending with `'>'`
   - or prefixed name, where the prefix id is given by character preceeding the first `':'` and the suffix is given by everything after that
 - `langtag` - refers to a `string` that represents a language tag by starting with `'@'`
 - `function/hash` - refers to a `function` that also acts as a `hash`, so it can either be used to access certain properties or it can be called with/without certain arguments.

----
<a name="thing" />
### Thing implements @RDFJS Term
A class that implements the [RDFJS Term](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#term) interface.

**Properties:** (implementing RDFJS Term interface)
 - `.value` : `string` -- depends on the type of term; could be the content of a [Literal](#https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#literal-extends-term), the label of a [BlankNode](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#blanknode-extends-term), or the iri of a [NamedNode](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#namednode-extends-term)
 - `.termType` : `string` -- either `'NamedNode'`, `'BlankNode'` or `'Literal'`


----
<a name="knob" />
### Knob extends Thing
A class that represents an RDF node - which is either a [NamedNode or a BlankNode](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#namednode-extends-term)

**Properties:**
 - `.is[Named|Blank]Node` : `boolean` = `true`

**Properties:** (inherited from Thing)
 - `.value` : `string` -- the IRI of this node
 - `.termType` : `string` = either `'NamedNode'` or `'BlankNode'`
 - `.links` : `hash[predicate_uri: key]`
   - selects the set of objects linked by `predicate_uri` from this subject
   - **returns** an Array of RDFJS terms that represent the objects of the triples.
   - *example:*
        ```js
        banana.links['http://www.w3.org/2000/01/rdf-schema#label'];
        // returns: [ { value: 'Banana', language: 'en', datatype: ...}, ...]
        ````

**Methods:**
 - `.at` : `funciton/hash`
   - *{function}* `(predicate: iri[, ...])`
   - *{function}* `(predicates: array)`
     - traverses `predicate(s)` a maximum distance of length one. Multiple arguments or an array is equivalent to the OR path operation which tries all possibilities.
	 - **returns** a [Bag instance](#bag).
	 - *example*
	      ```js
	      banana.at('rdfs:label');  // returns: Bag { ... }
	      // or
	      banana.at('rdfs:label', 'rdfs:comment');
	      banana.at(['rdfs:label', 'rdfs:comment']); // same as above
	      // equivalent to property path: `(rdfs:label|rdfs:comment)`
	      ```
   - *{hash}* `[prefix_id: key]` -- provides a semantic access path for traversing
     - selects a subset of the predicates that link this subject to its objects by filtering predicates that start with the IRI given by the corresponding `prefix_id`.
     - **returns** a [Namespace instance](#namespace).
       - *CAUTION:* Accessing a namespace or subsequent suffix that **does not exist** will cause a `TypeError` because you cannot chain `undefined`. It is safer to use the `.at()` function if you are not guaranteed that a certain path will exist.
	 - *example:*
	      ```js
	      banana.at.rdfs;  // returns: { label: Bag{..}, comment: Bag{..}, ...}
	      // or
	      banana.at[some_prefix_id];
	      ```


----
### Namespace
A `hash` of namespaced suffixes that link to sets of objects.
 - *{hash}* `[predicate_suffix: key]`
   - selects the set of objects corresponding to the predicate given by the current namespace prefix concatenated with `predicate_suffix`
     - > i.e., the keys are the strings leftover after removing the prefix IRI from the beginning of every predicate
   - **returns** a [Bag instance](#bag)


----
### Bag
An unordered list of [Things](#thing)

**Operator:** *{function*} `()` -- when the instance is called as a function
 - selects exactly one element from the unordered list and returns its `.value`. Convenient if you are certain the bag has only one element.
 - **returns** a `string`

**Methods:**
 - `.values()` -- fetches all elements' `.value` property
   - **returns** an Array of strings
 - `.termTypes()` -- fetches all elements' `.termType` property
   - **returns** an Array of strings
 - `.literals` : `chain/function`
   - *{chain}* / *{function}* `()`
   - *{function}* `(filter: iri)` -- filter by datatype
   - *{function}* `(filter: langtag)` -- filter by language
   - *{function}* `(filter: function)` -- filter by custom function
     - selects only terms of type literal and applies an optional `filter`.
     - **returns** a [new Bunch](#bunch)
 - `.nodes` : `chain/function`
   - *{chain}* / *{function}* `()`
   - *{function}* `(filter: function)` -- filter by custom function
     - selects only distinct terms of type NamedNode or BlankNode and applies an optional `filter`.
     - **returns** a [new KnobSet](#knobset)
 - `.namedNodes` : `chain/function`
   - *{chain}* / *{function}* `()`
   - *{function}* `(prefix: iri)` -- filter by whos IRIs start with `prefix`
   - *{function}* `(filter: function)` -- filter by custom function
   - *{function}* `(prefix: iri, filter: function)` -- filter by nodes whos IRIs start with `prefix`, **then** filter by custom function
     - selects only distinct terms of type NamedNode, optionally filters nodes whos IRIs start with `prefix`, and then applies an optional `filter`.
     - **returns** a [new KnobSet](#knobset)
 - `.blankNodes` : `chain/function`
   - *{chain}* / *{function}* `()`
   - *{function}* `(label: RegExp)` -- filter by label
     - selects only distinct terms of type BlankNode and applies an optional `filter`.
     - **returns** a [new KnobSet](#knobset)


----
<a name="bunch" />
### Bunch extends Bag

