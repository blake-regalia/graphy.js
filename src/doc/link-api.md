
----
<a name="node" />
### **Node** extends [NamedNode|BlankNode]
A class that wraps an RDF node - which can be either a [NamedNode](#namednode) or a [BlankNode](#blanknode) - for traversing links that lead to objects or other nodes.

**Properties:** (inherited from [NamedNode|BlankNode])
 - `.termType` : `string` = either `'NamedNode'` or `'BlankNode'`.
 - `.value` : `string` -- the ID of this node (either an IRI or blank node label).
 - `.is[Named|Blank]Node` : `boolean` = `true` -- the preferred and fastest way to test for NamedNode or BlankNode term types, only one will be defined, the other will be `undefined`.

**Properties:**
 - `.links[predicate_uri: key]` -- a `hash` that provides access to the underlying [Links](#link)
   - selects the set of objects linked via `predicate_uri` from this subject node.
   - **returns** an `Array` of [Terms](#terms) which represents the objects of the triples.
   - *example:*
        ```js
        banana.links['http://www.w3.org/2000/01/rdf-schema#label'];
        // returns: [ Literal {value:'Banana', language:'en', datatype:...}, ...]
        ````
 - `.inverseLinks[predicate_uri: key]` -- a `hash` that provides access to the inverse [Links](#links)
   - selects the set of subjects linked via `predicate_uri` wherever this Node appears in the object position of a triple in the current graph.
   - **returns** an `Array` of [Nodes](#nodes) that represent the subjects of the triples.
   - *example:*
        ```js
        banana.inverseLinks['http://dbpedia.org/property/group'];
        // returns: [ {value:'http://dbpedia.org/resource/Saba_banana', termType:'NamedNode', ...}, ...]
        ````
 - `.at[prefix_id: key]` : `hash` -- provides a semantic access path for traversing the graph in an expressive way
     - selects a subset of the predicates that link this subject to its objects by filtering predicates that start with the IRI given by the corresponding `prefix_id`.
     - **returns** a [Namespace](#namespace).
       - *CAUTION:* Accessing a namespace or subsequent suffix that **does not exist** will cause a `TypeError` because you cannot chain `undefined`. It is safer to use the `.at()` function if you are not guaranteed that a certain path will exist.
	 - *example:*
	      ```js
	      banana.at.rdfs;  // { label: Bag{..}, comment: Bag{..}, ...}
	      // --- or ---
	      banana.at[some_prefix_id];
	      ```
 - `.of` : `this` -- identity property for semantic access paths; in other words, it simply points to `this` for chaining calls together. Check out the `.is` example below to see why.
 - `.is[prefix_id: key]` -- provides a semantic access path for traversing the graph in an expressive way
   - selects a subset of the predicates that link this **object to its subjects** by filtering predicates that start with the IRI given by the corresponding `prefix_id`.
   - **returns** a [new Namespace](#namespace).
     - *CAUTION:* Accessing a namespace or subsequent suffix that **does not exist** will cause a `TypeError` because you cannot chain `undefined`. It is safer to use the `.back()` function if you are not guaranteed that a certain path will exist.
    - *example:*
        ```js
        banana.is.dbp.group.of  // dbr:Banana ^dbp:group ?things
            .nodes.values();  // ['http://dbpedia.org/resource/Red_banana', ...]
        ```

**Methods:**
 - `.cross` : `function`
   - *{function}* `(predicate: iri[, ...])`
   - *{function}* `(predicates: array)`
     - traverses `predicate(s)` a maximum distance of length one in the normal direction. Multiple arguments or an Array of them is equivalent to using the OR property path operation.
	 - **returns** a [new Bag](#bag).
	 - *example*
	      ```js
	      banana.cross('rdfs:label');  // returns a Bag of the objects linked via rdfs:label
	      // --- or ---
	      // the equivalent to property path: (rdfs:label|rdfs:comment)
	      banana.cross('rdfs:label', 'rdfs:comment');
	      banana.cross(['rdfs:label', 'rdfs:comment']); // same as above
	      ```
 - `.crossInverse` : `function` -- an alias of `.back`
 - `.back` : `function`
   - *{function}* `(predicate: iri[, ...])`
   - *{function}* `(predicates: array)`
     - traverses `predicate(s)` a maximum distance of length one. Multiple arguments or an Array of them is equivalent to using the OR property path operation.
	 - **returns** a [new Bag](#bag).
	 - *example:*
	      ```js
	      banana.back('dbp:group');  // fetch subjects linked via ^dbp:group
	      banana.is.dbp.group.of;  // another way to access inverse
	      // --- or ---
	      banana.back('dbo:wikiPageRedirects', 'dbo:wikiPageDisambiguates');
	      // equivalent to  ^(dbo:wikiPageRedirects|dbo:wikiPageDisambiguates)
	      ```
 - `.all` : `chain/function` -- traverses all predicates from this subject node to all of its objects (i.e., in the normal direction) and returns all of those objects (including duplicates). *The function may support a filter arguent in future versions, that is why this is listed under methods for now.*
   - *{chain}* | *{function}* `()`
     - **returns** a [new Bag](#bag)
     - *example:*
         ```js
         banana.all.literals.terms;  // fetch all Literals that are object of dbr:Banana
         ```
 - `.allInverse` : `chain/function` -- an ugly victim of camelCase that is an alias of `.owners`
 - `.owners` : `chain/function` -- traverses all predicates that point to this node by following them in the inverse direction (from object to subject) and returns all of those subjects.
   - *{chain}* | *{function}* `()`
     - **returns** a [new NodeSet](#nodeset)
     - *example:*
         ```js
         banana.owners.namedNodes.values();  // IRIs of all subjects pointing to dbr:Banana
         ```

----
<a name="nodeset" />
### **NodeSet**
A class that wraps a set of [Nodes](#node). Since it is a set, no two of its items will be identical. Each method in this class simply applies the corresponding operation to each Node.

**Properties:**
 - `.areNodes` : `boolean` = `true`
 - `.nodes` : `list` -- access to the underlying `list` of [Nodes](#node)
 - `.of` : `this` -- behaves the same as [Node#of](#node)

**Methods:**
 - `.cross` -- behaves the same as [Node#cross](#node)
   - **returns** a [new Bag](#bag)
 - `.back`, `.crossInverse` -- behaves the same as [Node#back](#node)
   - **returns** a [new NodeSet](#nodeset)
 - `.all` -- behaves the same as [Node#all](#node)
   - **returns** a [new Bag](#bag)
 - `.allInverse` -- behaves the same as [Node#allInverse](#node)
   - **returns** a [new NodeSet](#nodeset)

----
### **Bag**
An unordered list of [Terms](#term). "Unordered" refers to the fact that the ordering of its elements is arbitrary. The list is not a set, so it may contain duplicates.

**Properties:**
 - `.terms` : `Array` -- access to the underlying `list` of [Terms](#term)

**Methods:**
 - `.sample()` -- selects exactly one [Term](#term) from the unordered list and returns its `.value`. Convenient if you are certain the bag has only one element, otherwise it accesses the first/next+ item from the unordered list.
     - **returns** a `string` or `undefined` if Bag is empty
     - *example:*
         ```js
         banana.at.dbp.commons.sample();  // 'Banana'
         // in bags with more than one element:
         banana.at.rdfs.label.sample();  // 'Банан'
         banana.at.rdfs.label.sample();  // 'Banane'
         banana.at.rdf.type.sample();  // 'http://umbel.org/umbel/rc/Plant'
         ```
 - `.filter(filter: function[, new_instance: boolean])` -- applies `filter` callback function to each Term in this Bag. By default, will mutate the `Array` of Terms belonging to `this`. If you plan to reuse the original Bag of Terms before it was filtered, you can pass `true` to `new_instance`.
   - **returns** `this` or a new Bag, depending on `new_instance`
 - `.values()` -- fetches all elements' `.value` property
   - **returns** an `Array` of strings
   - *example:*
       ```js
       banana.cross('rdfs:label').values();  // ['Банан', 'Banane', ...]
       ```
 - `.termTypes()` -- fetches all elements' `.termType` property
   - **returns** an `Array` of strings
   - *example:*
       ```js
       banana.cross('rdfs:label').termTypes();  // ['Literal', 'Literal', ...]
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
 - `.anyNodes` : `chain/function` -- selects only distinct terms of type NamedNode **or** BlankNode and applies an optional `filter`.
   - *{chain}* | *{function}* `()`
   - *{function}* `(filter: function)` -- filter by callback function w/ params: `(element: Node)`
     - **returns** a [new NodeSet](#nodeset)
     - *example:*
         ```js
         banana.cross('rdf:type').anyNodes;  // ensures all elements are Nodes and gives us more methods to work with
         ```

 - `.collections` : `chain/function` -- selects any nodes that have an `rdf:first` property

----
<a name="literalbunch" />
### **LiteralBunch**
A class that represents an unordered list of [Literals](#literal).

**Properties:**
 - `.areLiterals` : `boolean` = `true`
 - `.terms` : `Array` -- access to the underlying `list` of [Terms](#term)

**Methods:**
 - `.filter(filter: function)` -- applies `filter` callback w/ params: `(element: Literal)`
   - **returns** a [new LiteralBunch](#literalbunch)
 - `.sample()` -- selects exactly one [Literal](#literal) from the unordered list and returns is `.value`. Convenient if you are certain the bag has only one element, otherwise it accesses the first/next+ item from the unordered list.
   - **returns** a `string` or `undefined` if LiteralBunch is empty
 - `.values()` -- fetches all Literals' `.value` property
   - **returns** an `Array` of strings
 - `.termTypes()` -- fetches all Literals' `.termType` property
   - **returns** an `Array` of strings
 - `.datatypes()` -- fetches all Literals' `.datatype` property
   - **returns** an `Array` of strings
 - `.languages()` -- fetches all Literals' `.language` property
   - **returns** an `Array` of strings


----
### **Void**
A class that represents the absence of a [Node](#node). It is used to prevent `TypeError`s from being thrown during chaining if a requested Node does not exist.

**Properties/Methods:**
 - `.at` : `hash/function` -- **returns** an empty [Bag](#bag)
 - `.inverseAt`, `.is`, `.of` : `hash/function` -- **returns** an empty [NodeSet](#nodeset)
 - `.all`, `.inverseAll` : `hash` -- **returns** an empty [Bag](#bag)
 - `.nodes`, `.namedNodes`, `.blankNodes` : `hash` -- **returns** an empty [NodeSet](#nodeset)
 - `.literals` : `hash/function` -- **returns** an empty [LiteralBunch](#literalbunch)
 - `.values()` -- **returns** an empty `Array`
 - `.datatypes()`, `.languages()` -- **returns** an empty `Array`

----
### **Namespace**
A `hash` of namespaced suffixes where each entry links to a sets of objects (Literals) or to other nodes (NamedNodes or BlankNodes).

Also, certain object protoype properties (such as `.length`) are overriden by defining them as `undefined` on this `hash` so that false positives are avoided. Obviously, if the predicate's suffix *is* `'length'`, then that property *will* be defined on the `hash`, as it should.
 - *{hash}* `[predicate_suffix: key]`
   - selects the set of objects corresponding to the predicate given by the current namespace prefix concatenated with `predicate_suffix`
     - > i.e., the keys are the strings leftover after removing the prefix IRI from the beginning of every predicate
   - **returns** a [Bag instance](#bag)
   - *example:*
        ```js
        banana.at.rdfs  // this is a Namespace
            .label;  // selects the Bag of the objects linked via `rdfs:label`
        ```

----
### **Links**
A `hash` that represents the set of predicates from the current node to its objects (Literals, NamedNodes, and BlankNodes) *OR* to its subjects (NamedNodes and BlankNodes). An instance can either represent links in the normal direction (i.e., to objects) *OR* it can represent links in the inverse direction (i.e., to subject nodes), depending on how it was created.

Reserved keys are prefixed with a `'^'` to prevent collisions with predicate IRIs. Also, certain object protoype properties (such as `.toString` and `.hasOwnProperty`) are overriden by defining them as `undefined` on this `hash` so that false positives are avoided. Obviously, if a predicate's suffix *is* `'hasOwnProperty'`, then that property *will* be defined on the `hash`, as it should. What this means is that you cannot use these prototypical methods -- however, this does not interfere with own-property iteration such as `for..in` and `Object.keys`.
 - *{hash}* `['^direction']` *non-enumerable* : `number` -- indicates the direction of the predicates.
   - either a `1` for normal direction (i.e., `subject --> object`) or a `-1` for inverse direction (i.e., `subject <-- object`).
 - *{hash}* `['^term']`  *non-enumerable* -- the Term that is the 'owner' of these Links. This will always be either a [NamedNode](#namednode) or [BlankNode](#blanknode).
 - *{hash}* `[predicate_iri: key]`
   - selects the set of objects that are pointed to, or subjcets that are pointed from, the given `predicate_iri` -- depending on `^direction`.

----
### **Graph**
A class that represents a set of triples in which any of its subject nodes are accessible by their id, which is either an IRI or a blank node label. Nodes are linked to other [Nodes](#node) or to [Bags](#bag) of objects by the predicates that were extracted from the input triples. 

**Properties:**
 - `.term` -- the Term that is the 'owner' of this Graph, which is either a [NamedNode](#namednode) or a [BlankNode](#blanknode).
 - `.prefixes[prefix_id: key]` -- a `hash` that provides access to the prefixes used by all graphs in the Store.
   - **returns** a `string` of the prefix' IRI
 - `.nodes[node_id: key]` -- a `hash` that provides access to the underlying set of subject Nodes by returning the [Node](#node) belonging to the given `node_id`.
   - **returns** a [Node](#node)
   - *example:*
       ```js
       g.nodes['http://dbpedia.org/resource/Banana'];
       // -- or --
       g.nodes['_:b12'];
       ```
 - `.roots[node_id: key]` -- a `hash` that provides access to named nodes that appear **at least once** in the subject position of any triple AND blank nodes that **only** appear in the subject position of any triple. Useful for iteration with the `in` operator.
     - **returns** a [Node](#node)
     - *example:*
         ```js
         for(let node_id in g.roots) {
           if(node_id.startsWith('_:')) {
             // blank nodes only appearing as subject in this set of triples
             let blank_node = g.roots[node_id];
           }
         }
         ```

**Methods:**
 - `.enter(node_id: iri|label)` -- selects the node in the current graph given by `node_id`. However, if no such node is found then it will return an [EmptySet](#emptyset) so that chaining may continue.
   - **returns** a [Node](#node) or [EmptySet](#emptyset)
   - *example:*
       ```js
       let banana = g.enter('dbr:Banana');
       ```
 - `.resolve(prefixed_name: string)` -- returns the IRI of the given `prefixed_name` by replacing the prefix with its corresponding IRI.
   - **returns** a `string` of the IRI, or `undefined` if no such prefix exists
 - `.terse` : `function` -- produces the most terse Turtle serialization of a node's IRI, a blank node's label, or a literal's content and language/datatype. For IRIs, it will find the longest matching prefix and attempt to to create a prefixed name unless the resulting name contains invalid characters, in which case an absolute IRI reference (with `'<'` and `'>'`) is returned. For literals, it will omit the datatype if it is `xsd:string`, and will attempt to represent `xsd:boolean`, `xsd:integer`, `xsd:decimal` and `xsd:double` as numeric literals so long as the contents are parseable. See example for details.
   - *{function}* `(term: Term)` -- for any: [NamedNode](#namednode), [BlankNode](#blanknode), or [Literal](#literal).
   - *{function}* `(node: Node)` -- serializes the IRI or the label associated with `node`
   - *{function}* `(iri: string)` -- attempts to shorten the given `iri`
     - **returns** a `string` in Notation3, or `undefined` if a prefix does not exist
     - *example:*
         ```js
         // .terse(term: Term)
         g.terse(banana.term);  // 'dbr:Banana'
         g.terse(graphy.literal('hello world!'));  // '"hello world!"'
         g.terse(graphy.literal('42', 'http://www.w3.org/2001/XMLSchema#decimal'));  // '42.0'
         g.terse(graphy.literal('hola mundo!', '@es'));  // '"hola mundo!"@es
         g.terse(graphy.literal('f', 'http://www.w3.org/2001/XMLSchema#double'));  // '"f"^^xsd:double'
         
         // .terse(node: Node)
         g.terse(banana);  // 'dbr:Banana'
         
         // .terse(iri: string)
         g.terse('http://dbpedia.org/page/Tachyon');  // dbr:Tachyon
         ```
   - *{function}* `(bag: Bag)` -- maps each [Term](#term) in `bag` to `.terse(term: Term)`
     - **returns** an `Array` of strings
     - *example:*
         ```js
         g.terse(banana.at.rdfs.label);
         /* returns: [
            '""Banane"@fr',
		    '"موز"@ar',
		    '"香蕉"@zh',
		    '"Banana"@it"',
		    ...]
		 */
         ```

----
### **Store**
A class that represents a set of [Graphs](#graph). 

**Properties:**
 - `.graphs[graph_id: key]` -- a `hash` that provides access to the underlying store, which returns a [Graph](#graph) of all triples associated with the given `graph_id`.
     - **returns** a [Graph](#graph)
     - *example:*
         ```js
         s.graphs['http://named-graph-id/'];
         // -- or --
         s.graphs['_:b0'];
         // -- or --
         s.graphs[''];  // the default graph
         ```

**Methods:**
 - *not yet implemented:* ~~`.union(graph_ids: Array{graph_id: string})` -- performs a union of Graphs by copying the entire contents of each graph by the given `graph_id` into a new object. Automatically relabels blank nodes so that there are no collisions.~~
   - **returns** a [new Graph](#graph)

