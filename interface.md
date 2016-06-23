

### Pseudo-Datatypes:
Throughout this API document, the following datatypes are used to represent expectations imposed on primitive-datatyped parameters to functions, exotic uses of primitives in class methods, and so forth:
 - `hash` - refers to a simple `object` with keys and values (e.g. `{key: 'value'}`)
 - `key` - refers to a `string` used for accessing an arbitrary value in a `hash`
 - `list` - refers to a one-dimensional `Array` containing only elments of the same type/class
 - `iri` - refers to a `string` that represents an IRI either by:
   - absolute reference, starting with `'<'` and ending with `'>'`
   - or prefixed name, where the prefix id is given by the characters preceeding the first `':'` and the suffix is given by everything after that
 - `langtag` - refers to a `string` that represents a language tag by starting with `'@'`
 - `chain/function` - refers to a method that acts the same as when called as a function without arguments
   - e.g., `thing.chain.property === thing.chain().property`
 - `function/hash` - refers to a `function` that also acts as a `hash`, so it can either be used to access certain properties or it can be called with/without certain arguments.
   - e.g., `thing.method(arg); /*and*/ thing.method[property]; // are both acceptable and may do different things`


----
<a name="term" />
### abstract **Term** implements @RDFJS Term
An abstract class that represents an RDF term by implementing the [RDFJS Term interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#term).

**Properties:** (implementing RDFJS Term interface)
 - `.termType` : `string` -- either `'NamedNode'`, `'BlankNode'`, `'Literal'` or `'DefaultGraph'`
 - `.value` : `string` -- depends on the type of term; could be the content of a [Literal](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#literal-extends-term), the label of a [BlankNode](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#blanknode-extends-term), or the iri of a [NamedNode](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#namednode-extends-term)

**Methods:** (implementing RDFJS Term interface)
 - `.equals(other: Term)` -- tests if this term is equal to `other`
   - **returns** a `boolean`
 - `.toCanonical()` -- produces an [N-Triples canonical form](https://www.w3.org/TR/n-triples/#canonical-ntriples) of the term
   - **returns** a `string`

**Methods:**
 - `.toString()` -- alias of `.toCanonical()`


----
<a name="namednode" />
### **NamedNode** extends Term implements @RDFJS NamedNode
A class that represents an RDF named node by implementing the [RDFJS NamedNode interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#namednode-extends-term)

**Properties:** (inherited from Term & implementing RDFJS NamedNode)
 - `.termType` : `string` = `'NamedNode'`
 - `.value` : `string` -- the IRI of this named node

**Properties:**
 - `.isNamedNode` : `boolean` = `true` -- the preferred way of testing for NamedNode term type

**Methods:**
 - ... [those inherited from Term](#term)


----
<a name="blanknode" />
### **BlankNode** extends Term implements @RDFJS BlankNode
A class that represents an RDF blank node by implementing the [RDFJS BlankNode interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#blanknode-extends-term)

**Properties:** (inherited from Term & implementing RDFJS NamedNode)
 - `.termType` : `string` = `'NamedNode'`
 - `.value` : `string` -- the IRI of this named node

**Properties:**
 - `.isNamedNode` : `boolean` = `true` -- the preferred way of testing for named node term types

**Methods:**
 - ... [those inherited from Term](#term)


----
<a name="literal" />
### **Literal** extends Term implements @RDFJS Literal
A class that represents an RDF literal by implementing the [RDFJS Literal interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#literal-extends-term)

**Properties:** (inherited from Term & implementing RDFJS Literal interface)
 - `.termType` : `string` = `'Literal'`
 - `.value` : `string` -- the content of this literal

**Properties:** (implementing RDFJS Literal interface)
 - `.datatype` : `string` -- the datatype IRI of this literal
 - `.language` : `string` -- the language tag associated with this literal (empty string if it has no language)

**Properties:**
 - `.isLiteral` : `boolean` = `true` -- the preferred way of testing for literal term types


----
<a name="defaultgraph" />
### **DefaultGraph** extends Term implements @RDFJS DefaultGraph
A class that represents the default graph by implementing the [RDFJS DefaultGraph interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#defaultgraph-extends-term)

**Properties:** (inherited from Term & implementing RDFJS DefaultGraph interface)
 - `.termType` : `string` = `'DefaultGraph'`
 - `.value` : `string` = `''` -- always an empty string

**Properties:**
 - `.isDefaultGraph` : `boolean` = `true` -- the preferred way of testing for default graph term types


----
<a name="quad" />
### **Quad** implements @RDFJS Quad
A class that represents an RDF triple/quad by implementing the [RDFJS Quad interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#quad)

**Properties:** (implementing RDFJS Quad interface)
 - `.subject` : [`[NamedNode|BlankNode]`](#namednode)
 - `.predicate` : [`NamedNode`](#namednode)
 - `.object` : [`Term`](#term)
 - `.graph` : `[NamedNode|BlankNode|DefaultGraph]`

**Methods:** (implementing RDFJS Quad interface)
 - `.equals(other: Quad[, ignore_graph: boolean])`
   - tests if `other` Quad is equal to this one, optionally ignoring the graph if `ignore_graph` is truthy.
   - **returns** a `boolean`
 - `.toCanonical()` -- produces an [N-Triples canonical form](https://www.w3.org/TR/n-triples/#canonical-ntriples) of the Quad.

**Methods:**
 - `.toString()` -- alias of `.toCanonical()`

----
<a name="triple" />
### **Triple** aliases Quad implements @RDFJS Triple
A class that represents an RDF triple by implementing the [RDFJS Triple interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#quad). Same as `Quad` except that `.graph` will always be a [DefaultGraph](#defaultgraph).

**Properties:** (aliasing Quad & implementing RDFJS Triple interface)
 - `.graph` : [`DefaultGraph`](#defaultgraph)
 - ... and [those in Quad](#Quad)

**Methods:** (aliasing Quad & implementing RDFJS Triple interface)
 - ... [those in Quad](#Quad)
----
<a name="node" />
### **Node** extends [NamedNode|BlankNode]
A class that represents an RDF node - which can be either a [NamedNode](#namednode) or a [BlankNode](#blanknode)

**Properties:** (inherited from Term)
 - `.termType` : `string` = either `'NamedNode'` or `'BlankNode'`.
 - `.value` : `string` -- the IRI of this node.

**Properties:**
 - `.is[Named|Blank]Node` : `boolean` = `true` -- the preferred way of testing for NamedNode or BlankNode term type, the other will be `undefined`.
 - `.links` : `hash[predicate_uri: key]`
   - selects the set of objects linked via `predicate_uri` from this subject node.
   - **returns** an `Array` of [Terms](#terms) that represent the objects of the triples.
   - *example:*
        ```js
        banana.links['http://www.w3.org/2000/01/rdf-schema#label'];
        // returns: [ {value:'Banana', language:'en', datatype:...}, ...]
        ````
 - `.inverseLinks` : `hash[predicate_uri: key]`
   - selects the set of subjects linked via `predicate_uri` wherever this node appears as the object in the current graph.
   - **returns** an `Array` of [Nodes](#nodes) that represent the subjects of the triples.
   - *example:*
        ```js
        banana.inverseLinks['http://dbpedia.org/property/group'];
        // returns: [ {value:'http://dbpedia.org/resource/Saba_banana', termType:'NamedNode', ...}, ...]
        ````
 - `.of` : `this` -- identity property for semantic access paths; in other words, it does absolutely nothing and **returns** `this`. Check out the `.is` example below to see why.

**Methods:**
 - `.at` : `funciton/hash`
   - *{function}* `(predicate: iri[, ...])`
   - *{function}* `(predicates: array)`
     - traverses `predicate(s)` a maximum distance of length one in the normal direction. Multiple arguments or an array is equivalent to the OR path operation which tries all possibilities.
	 - **returns** a [new Bag](#bag).
	 - *example*
	      ```js
	      banana.at('rdfs:label');  // returns a Bag of the objects linked via `rdfs:label`
	      // --- or ---
	      // the equivalent to a property path: `(rdfs:label|rdfs:comment)`
	      banana.at('rdfs:label', 'rdfs:comment');
	      banana.at(['rdfs:label', 'rdfs:comment']); // same as above
	      ```
   - *{hash}* `[prefix_id: key]` -- provides a semantic access path for traversing
     - selects a subset of the predicates that link this subject to its objects by filtering predicates that start with the IRI given by the corresponding `prefix_id`.
     - **returns** a [new Namespace](#namespace).
       - *CAUTION:* Accessing a namespace or subsequent suffix that **does not exist** will cause a `TypeError` because you cannot chain `undefined`. It is safer to use the `.at()` function if you are not guaranteed that a certain path will exist.
	 - *example:*
	      ```js
	      banana.at.rdfs;  // { label: Bag{..}, comment: Bag{..}, ...}
	      // --- or ---
	      banana.at[some_prefix_id];
	      ```
 - `.is` : alias of `.inverseAt`
 - `.inverseAt` : `funciton/hash`
   - *{function}* `(predicate: iri[, ...])`
   - *{function}* `(predicates: array)`
     - traverses `predicate(s)` a maximum distance of length one. Multiple arguments or an array is equivalent to the OR path operation which tries all possibilities.
	 - **returns** a [new Bag](#bag).
	 - *example:*
	      ```js
	      // semantic access path
	      banana.inverse('dbp:group');  // returns a NodeSet of the subjects linked via `^dbp:group`
	      banana.is.dbp.group.of; // same as above
	      // --- or ---
	      banana.inverse('dbo:wikiPageRedirects', 'dbo:wikiPageDisambiguates');
	      // equivalent to property path: `^(dbo:wikiPageRedirects|dbo:wikiPageDisambiguates)`
	      ```
   - *{hash}* `[prefix_id: key]` -- provides a semantic access path for traversing
     - selects a subset of the predicates that link this subject to its objects by filtering predicates that start with the IRI given by the corresponding `prefix_id`.
     - **returns** a [new Namespace](#namespace).
       - *CAUTION:* Accessing a namespace or subsequent suffix that **does not exist** will cause a `TypeError` because you cannot chain `undefined`. It is safer to use the `.at()` function if you are not guaranteed that a certain path will exist.
	 - *example:*
	      ```js
	      banana.at.rdfs;  // { label: Bag{..}, comment: Bag{..}, ...}
	      // --- or ---
	      banana.at[some_prefix_id];
	      ```
 - `.all` : `chain/function` -- selects all sets of objects linked via all predicates from this subject node in the normal direction
   - *{chain}* | *{function}* `()`
     - **returns** a [new Bag](#bag)
 - `.inverseAll` : `chain/function` -- selects the set of all subjects linked via all predicates from this node in the inverse direction
   - *{chain}* | *{function}* `()`
     - **returns** a [new NodeSet](#nodeset)

----
<a name="nodeset" />
### **NodeSet**
A class that represents a set of RDF nodes - each of which can be either a [NamedNode](#namednode) or a [BlankNode](#blanknode). All methods of this class apply the corresponding operation to each item in the set and return

**Properties:**
 - `.areNodes` : `boolean` = `true`
 - `.nodes` : `hash` -- access to the underlying `hash` of [Nodes](#node)
 - `.of` : `this` -- behaves the same as [Node#of](#node)

**Methods:**
 - `.at` -- behaves the same as [Node#at](#node)
   - **returns** a [new Bag](#bag)
 - `.inverseAt`, `.is`, `.are` -- behaves the same as [Node#inverse](#node)
   - **returns** a [new NodeSet](#nodeset)
 - `.all` -- behaves the same as [Node#all](#node)
   - **returns** a [new Bag](#bag)
 - `.inverseAll` -- behaves the same as [Node#inverseAll](#node)
   - **returns** a [new NodeSet](#nodeset)

----
### **Bag**
An unordered list of [Terms](#term)

**Properties:**
 - `.terms` : `Array` -- access to the underlying `list` of [Terms](#term)

**Methods:**
 - `.first()` -- selects exactly one [Term](#term) from the unordered list and returns its `.value`. Convenient if you are certain the bag has only one element, otherwise it accesses an arbitrary item from the set.
     - **returns** a `string`
     - *example:*
         ```js
         banana.at.dbp.commons.first();  // 'Banana'
         // is okay. but in bags with more than one element:
         banana.at.rdfs.label.first();  // 'Банан'
         banana.at.rdf.type.first();  // 'http://umbel.org/umbel/rc/Plant'
         ```
 - `.values()` -- fetches all elements' `.value` property
   - **returns** an `Array` of strings
   - *example:*
       ```js
       banana.at('rdfs:label').values();  // ['Банан', 'Banane', ...]
       ```
 - `.termTypes()` -- fetches all elements' `.termType` property
   - **returns** an `Array` of strings
   - *example:*
       ```js
       banana.at('rdfs:label').termTypes();  // ['Literal', 'Literal', ...]
       ```
 - `.literals` : `chain/function` -- selects only terms of type [Literal](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#literal-extends-term) and applies an optional `filter`.
   - *{chain}* | *{function}* `()`
   - *{function}* `(filter: iri)` -- filter by datatype
   - *{function}* `(filter: langtag)` -- filter by language
   - *{function}* `(filter: function)` -- filter by callback function w/ params: `(element: Literal)`
     - **returns** a [new LiteralBunch](#bunchofliterals)
     - *example:*
         ```js
         banana.all.literals;  // indiscriminately select all literals
         banana.all.literals('xsd:string'); // filter by datatype
         banana.all.literals('@en');  // filter by language tag
         banana.all.literals((literal) => {  // filter by callback function
            return literal.value.length < 512;
         });
         ```
 - `.nodes` : `chain/function` -- selects only distinct terms of type NamedNode or BlankNode and applies an optional `filter`.
   - *{chain}* | *{function}* `()`
   - *{function}* `(filter: function)` -- filter by callback function w/ params: `(element: Node)`
     - **returns** a [new NodeSet](#nodeset)
     - *example:*
         ```js
         banana.at('rdf:type').nodes;  // ensures all elements are Nodes and gives us more methods to work with
         ```
 - `.namedNodes` : `chain/function` -- selects only distinct terms of type NamedNode, optionally filters nodes whos IRIs start with `prefix`, and then applies an optional `filter`.
   - *{chain}* | *{function}* `()`
   - *{function}* `(prefix: iri)` -- filter by whos IRIs start with `prefix`
   - *{function}* `(filter: function)` -- filter by callback function w/ params: `(element: Node)`
   - *{function}* `(prefix: iri, filter: function)` -- filter by nodes whos IRIs start with `prefix`, **then** filter by custom function
     - **returns** a [new NodeSet](#nodeset)
 - `.blankNodes` : `chain/function` -- selects only distinct terms of type BlankNode and applies an optional `filter`.
   - *{chain}* | *{function}* `()`
   - *{function}* `(filter: RegExp)` -- filter by label
   - *{function}* `(filter: function)` -- filter by callback function w/ params: `(element: Node)`
     - **returns** a [new NodeSet](#nodeset)


----
<a name="bunch" />
### abstract **Bunch** extends Bag
An abstract class that represents an unordered list of [Terms](#term) which are all of the same term type.

**Operator:** (inherited from Bunch) *{function*} `()` -- when the instance is called as a function
 - selects exactly one [Term](#term) from the unordered list and returns its `.value`. Convenient if you are certain the bag has only one element.
 - **returns** a `string`

**Properties:**
 - `.termType` : `string` -- the term type shared by all the Terms in this Bunch.
 - ... and [those inherited from Bag](#bag)

**Methods:**
 - `.filter(filter: function)` -- applies `filter` callback function to each Term in this Bunch.
   - **returns** a new Bunch
 - ... and [those inherited from Bag](#bag)

----
<a name="literalbunch" />
### **LiteralBunch** extends Bunch
A class that represents an unordered list of [Literals](#literal).

**Properties:** (inherited from Bunch and Bag)
 - `.termType` : `string` = `'Literal'`
 - ... and [those inherited from Bag](#bag)

**Properties:**
 - `.areLiterals` : `boolean` = `true` -- preferred way of distinguishing this class from others that may extend Bunch

**Methods:** (inherited from Bunch and Bag)
 - `.values()` -- **returns** an `Array` of strings that are the contents of each Literal in this Bunch
 - `.filter(filter: function)` -- applies `filter` callback w/ params: `(element: Literal)`
   - **returns** a [new LiteralBunch](#literalbunch)
 - ... and [those inherited from Bag](#bag)

**Methods:**
 - `.datatypes()` -- **returns** an `Array` of strings that are the IRIs of each Literal in this Bunch
 - `.languages()` -- **returns** an `Array` of strings that are the languages of each Literal in this Bunch


----
### **Namespace**
A `hash` of namespaced suffixes where each entry links to a sets of objects.
 - *{hash}* `[predicate_suffix: key]`
   - selects the set of objects corresponding to the predicate given by the current namespace prefix concatenated with `predicate_suffix`
     - > i.e., the keys are the strings leftover after removing the prefix IRI from the beginning of every predicate
   - **returns** a [Bag instance](#bag)
   - *example:*
        ```js
        banana.at.rdfs.label;  // returns a Bag of the objects linked via `rdfs:label`
        ```

