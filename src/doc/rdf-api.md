
### Pseudo-Datatypes:
Throughout this API document, the following datatypes are used to represent expectations imposed on primitive-datatyped parameters to functions, exotic uses of primitives in class methods (*in future versions*), and so forth:
 - `hash` - refers to a simple `object` with keys and values (e.g. `{key: 'value'}`)
 - `key` - refers to a `string` used for accessing an arbitrary value in a `hash`
 - `list` - refers to a one-dimensional `Array` containing only elments of the same type/class

<a name="term" />
### abstract **Term** implements @RDFJS Term
An abstract class that represents an RDF term by implementing the [RDFJS Term interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#term). If you are looking to create an instance of Term, see the [graphy DataFactory](#graphy-factory).

**Properties:** (implementing RDFJS Term interface)
 - `.termType` : `string` -- either `'NamedNode'`, `'BlankNode'`, `'Literal'` or `'DefaultGraph'`
 - `.value` : `string` -- depends on the type of term; could be the content of a [Literal](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#literal-extends-term), the label of a [BlankNode](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#blanknode-extends-term), or the IRI of a [NamedNode](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#namednode-extends-term)

**Methods:** (implementing RDFJS Term interface)
 - `.equals(other: Term)` -- tests if this term is equal to `other`
   - **returns** a `boolean`
 - `.toCanonical()` -- produces an [N-Triples canonical form](https://www.w3.org/TR/n-triples/#canonical-ntriples) of the term
   - **returns** a `string`

**Methods:**
 - `.valueOf()` -- gets called when cast to a `string`. It simply returns `.toCanonical()`
   - **returns** a `string`
   - *example:*
       ```js
       let hey = graphy.namedNode('hello');
       let you = graphy.literal('world!', '@en');
       console.log(hey+' '+you); // '<hello> "world!"@en'
       ```
      

----
<a name="namednode" />
### **NamedNode** extends Term implements @RDFJS NamedNode
A class that represents an RDF named node by implementing the [RDFJS NamedNode interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#namednode-extends-term)

**Properties:** (inherited from Term & implementing RDFJS NamedNode)
 - `.termType` : `string` = `'NamedNode'`
 - `.value` : `string` -- the IRI of this named node

**Properties:**
 - `.isNamedNode` : `boolean` = `true` -- the preferred and fastest way to test for NamedNode term types

**Methods:**
 - ... [those inherited from Term](#term)


----
<a name="blanknode" />
### **BlankNode** extends Term implements @RDFJS BlankNode
A class that represents an RDF blank node by implementing the [RDFJS BlankNode interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#blanknode-extends-term)

**Properties:** (inherited from Term & implementing RDFJS NamedNode)
 - `.termType` : `string` = `'BlankNode'`
 - `.value` : `string` -- the label of this blank node (i.e., without leading `'_:'`)

**Properties:**
 - `.isBlankNode` : `boolean` = `true` -- the preferred and fastest way to test for BlankNode term types

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
 - `.isLiteral` : `boolean` = `true` -- the preferred and fastest way to test for Literal term types

> Notice: Some serialization formats allow for "simple literals", which do not have an explicit datatype specified. These literals have an implicit datatype of `xsd:string` - however, you can test if an instance of Literal was created with an explicit datatype by using `Object.hasOwnProperty` to discover if `datatype` is defined on the instance object itself or in its protoype chain:
```js
let simple = graphy.literal('no datatype');
simple.datatype;  // 'http://www.w3.org/2001/XMLSchema#string'
simple.hasOwnProperty('datatype');  // false

let typed = graphy.literal('yes datatype', 'ex://datatype');
typed.datatype;  // 'ex://datatype'
typed.hasOwnProperty('datatype');  // true

let langed = graphy.literal('language tag', '@en');
simple.datatype;  // 'http://www.w3.org/2001/XMLSchema#string'
simple.hasOwnProperty('datatype');  // false
```

----
<a name="integerliteral" />
### **IntegerLiteral** extends Literal
A class that represents an RDF literal that was obtained by deserializing a syntactic integer.

> Only available in Turtle and TriG

**Properties:** (inherited from / overriding Literal)
 - ... [those inherited from Literal](#literal)
 - `.datatype` : `string` = `'http://www.w3.org/2001/XMLSchema#integer'`
 
**Properties:**
 - `.number` : `number` -- the parsed number value obtained via `parseInt`
 - `.isNumeric` : `boolean` = `true`

----
<a name="decimalliteral" />
### **DecimalLiteral** extends Literal
A class that represents an RDF literal that was obtained by deserializing a syntactic decimal.

> Only available in Turtle and TriG

**Properties:** (inherited from / overriding Literal)
 - ... [those inherited from Literal](#literal)
 - `.datatype` : `string` = `'http://www.w3.org/2001/XMLSchema#decimal'`
 
**Properties:**
 - `.number` : `number` -- the parsed number value obtained via `parseFloat`
 - `.isNumeric` : `boolean` = `true`

----
<a name="doubleliteral" />
### **DoubleLiteral** extends Literal
A class that represents an RDF literal that was obtained by deserializing a syntactic double.

> Only available in Turtle and TriG

**Properties:** (inherited from / overriding Literal)
 - ... [those inherited from Literal](#literal)
 - `.datatype` : `string` = `'http://www.w3.org/2001/XMLSchema#double'`
 
**Properties:**
 - `.number` : `number` -- the parsed number value obtained via `parseFloat`
 - `.isNumeric` : `boolean` = `true`

*Example:*
```js
graphy.ttl.parse('<a> <b> 0.42e+2 .', {
    data(triple) {
        triple.object.value;  // '0.42e+2'
        triple.object.number;  // 42
        triple.object.isNumeric;  // true
        triple.object.datatype;  // 'http://www.w3.org/2001/XMLSchema#double'
    },
});
```

----
<a name="booleanliteral" />
### **BooleanLiteral** extends Literal
A class that represents an RDF literal that was obtained by deserializing a syntactic boolean.

> Only available in Turtle and TriG

**Properties:** (inherited from / overriding Literal)
 - ... [those inherited from Literal](#literal)
 - `.datatype` : `string` = `'http://www.w3.org/2001/XMLSchema#boolean'`
 
**Properties:**
 - `.boolean` : `boolean` -- the boolean value, either `true` or `false`
 - `.isBoolean` : `boolean` = `true`

----
<a name="defaultgraph" />
### **DefaultGraph** extends Term implements @RDFJS DefaultGraph
A class that represents the default graph by implementing the [RDFJS DefaultGraph interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#defaultgraph-extends-term)

**Properties:** (inherited from Term & implementing RDFJS DefaultGraph interface)
 - `.termType` : `string` = `'DefaultGraph'`
 - `.value` : `string` = `''` -- always an empty string

**Properties:**
 - `.isDefaultGraph` : `boolean` = `true` -- the preferred and fastest way to test for DefaultGraph term types


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
 - `.valueOf()` -- gets called when cast to a `string`. It simply returns `.toCanonical()`
   - **returns** a `string`
   - *example:*
       ```js
       graphy.quad(
           graphy.namedNode('subject'),
           graphy.namedNode('predicate'),
           graphy.namedNode('object'),
           graphy.namedNode('graph'),
       )+'';  // '<subject> <predicate> <object> <graph> .'
       ```

----
<a name="triple" />
### **Triple** aliases Quad implements @RDFJS Triple
A class that represents an RDF triple by implementing the [RDFJS Triple interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#quad). Same as `Quad` except that `.graph` will always be a [DefaultGraph](#defaultgraph).

**Properties:** (aliasing Quad & implementing RDFJS Triple interface)
 - `.graph` : [`DefaultGraph`](#defaultgraph)
 - ... and [those in Quad](#Quad)

**Methods:** (aliasing Quad & implementing RDFJS Triple interface)
 - ... [those in Quad](#Quad)
