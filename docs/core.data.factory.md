
# Data Factory
`@graphy/core.data.factory`

## Primer
 - `factory` is used throughout this document to refer to this module's export.

## Contents
 - [Accessibility](#accessibility) -- how to access this module
 - [Datatypes](#datatypes) -- formatting hints or restrictions on primitive ES datatypes
   - [Strings](#strings) -- restrictions on the format or syntax of primitive strings
   - [Structs](#structs) -- restrictions on plain objects, i.e., `typeof value === 'object' && value.constructor === Object`
   - [Configs](#configs) -- objects that have certain expected keys and/or may have  certain optional keys
   - [Hashes](#hashes) -- plain objects that have arbitrary keys which correspond to their value, much like a HashMap
 - [Functions](#functions) -- static functions made available on this module's export
   - Basic Term constructors
     - [`namedNode(...)`](#function_named-node)
     - [`blankNode(...)`](#function_blank-node)
     - [`defaultGraph(...)`](#function_default-graph)
     - [`literal(...)`](#function_literal)
   - Specialized Literal Term constructors
     - [`boolean(...)`](#function_boolean)
     - [`integer(...)`](#function_integer)
     - [`decimal(...)`](#function_decimal)
     - [`double(...)`](#function_double)
     - [`number(...)`](#function_number)
     - [`date(...)`](#function_date)
     - [`dateTime(...)`](#function_datetime)
   - Concise Term constructors
     - [`c1(...)`](#function_c1)
     - [`term(...)`](#function_term)
   - Quad constructors
     - [`quad(...)`](#function_quad)
     
   - Concise Quads constructors
     - [`c4(...)`](#function_c4)
     
     - [`c3(...)`](#function_c3)
     
   - Content Writer directives
     - [`comment(...)`](#function_comment)
     
 - [Classes](#classes) -- class definitions
   - [GenericTerm](#class_genericterm)
     - [NamedNode](#class_namednode)
     - [BlankNode](#class_blanknode)
     - [Literal](#class_literal)
       - [Literal_Boolean](#class_literal-boolean)
       - [Literal_Integer](#class_literal-integer)
       - [Literal_Decimal](#class_literal-decimal)
       - [Literal_Double](#class_literal-double)
         - [Literal_PositiveInfinity](#class_literal-positive-infinity)
         - [Literal_NegativeInfinity](#class_literal-negative-infinity)
         - [Literal_NaN](#class_literal-nan)
   - [Quad](#class_quad)
     - [Triple](#class_triple)
 - [Interfaces](#interfaces) -- interface definitions
   - [Term](#interface_term)
   - [LabelManager](#interface_term)

---

## Accessibility
The following code block demonstrates three *different* ways to access this module.
```js
// stand-alone
const factory = require('@graphy/core.data.factory');

// via the graphy 'super module'
const graphy = require('graphy');
const factory = graphy.core.data.factory;

// via inheritted methods on the graphy 'super module'
const graphy = require('graphy');
const factory = graphy;
```

---

## Datatypes
The following section describes hinted formatting on ES primitives that are used throughout this document.

### Strings:

<a name="string_term-verbose" />

 - `#string/term-verbose` -- a string which is conformant with the grammar production `subject`, `predicate`, `object` or `graphLabel` as they are defined in the [N-Triples](https://www.w3.org/TR/n-triples/#n-triples-grammar) and [N-Quads](https://www.w3.org/TR/n-quads/#sec-grammar) specifications.

<a name="string_term-terse" />

 - `#string/term-terse` -- a string which is conformant with the grammar production `IRIREF`, `RDFLiteral`, or `PrefixedName` as they are defined in the [Turtle](https://www.w3.org/TR/turtle/#sec-grammar) specification.

<a name="string_language-tag" />

 - `#string/language_tag` -- a [BCP47 string](https://tools.ietf.org/html/bcp47).

### Structs:
A 'struct' refers to an interface for a simple ES Object `value` such that `value.constructor === Object`. This is important because some methods may perform duck-typing on their arguments in order to deduce which overloaded variant to employ. The following section documents the definitions for these interfaces.

<a name="struct_term-isolate" />

 - `#struct/term-isolate` -- an object that represents an isolated RDF term.
   - **required properties:**
     - `.termType`: `string`
     - `.value`: `string`
   - **optional properties:**
     - `.datatype`: [`#struct/node-isolate`]
     - `.language`: [`#string/language-tag`]

<a name="struct_quad-isolate" />

 - `#struct/quad-isolate` -- an object that represents an isolated RDF quad.
   - **properties:**
     - `.subject` : [`#struct/term-isolate`]
     - `.predicate` : [`#struct/term-isolate`]
     - `.object` : [`#struct/term-isolate`]
     - `.graph` : [`#struct/term-isolate`]

<a name="configs" />

### Configs:
A 'config' refers to an interface for a value that has certain expected or optional properties. Configs are typically used to pass named options to a method.



<a name="hashes" />

### Hash Interfaces:
A 'hash' is a synonym of a HashMap; it refers to an object whose keys are arbitrarily decided by you, the user. The following section documents significance of the keys and expected values for hashes used by this library.

<a name="hash_prefix-mappings" />

 - `#hash/prefix-mappings` -- an object that represents the mappings from a prefix string to its expanded IRI.
  - **definition:**
    ```ts
    interface **PrefixMappings** { [prefix: string]: string; };
    ```

---

## Functions:

<a name="function_named-node" />

- `factory.namedNode(iri: string)`
  - **returns** a [new NamedNode](#class_named-node)
  - *example:*
      ```js
      factory.namedNode('ex://test').verbose();  // '<ex://test>'
      ```

<a name="function_blank-node" />

 - `factory.blankNode(...)`
   - *overloaded variants*
     - `()` -- no args constructor will generate a new UUID4 in attempt to avoid label collisions
     - `(label: string)` -- uses the given `label` 
     - `(label_manager: `[`LabelManager`](#interface_label-manager)`)` -- calls `label_manager.next_label()` to generate a new label. It is recommended to use this variant rather than the no-args variant because it guarantees collision-free labels and is typically better performance.
   - **returns** a [new BlankNode](#class_blank-node)
   - *examples:*
       ```js
       // no-args constructor
       factory.blankNode().verbose();  // '_:439e14ae_1531_4683_ac96_b9f091da9595'

       // use given label constructor
       factory.blankNode('label').verbose();  // '_:label'

       // use a LabelManager constructor
       graphy.content.nt.read('<a> <b> <c> .', {
           data() { factory.blankNode(this).verbose(); },  // _:g0
       });
       ```

<a name="function_default-graph" />

 - `factory.defaultGraph()`
   - **returns** a [new DefaultGraph](#class_default-graph)
   - *example:*
       ```js
       graphy.defaultGraph().verbose();  // ''
       graphy.defaultGraph().termType;  // 'DefaultGraph'
       ```

<a name="function_literal" />

 - `factory.literal(contents: string[, datatype_or_lang: `[`NamedNode`](#class_named-node)` | string])`
   - **returns** a [new Literal](#class_literal), optionally using `datatype_or_lang`
   - *example:*
       ```js
       factory.literal('"').verbose();  // '"\""^^<http://www.w3.org/2001/XMLSchema#string>'
       factory.literal('42', 'ex://datatype').verbose();  // '"42"@ex://datatype'
       factory.literal('hello Mars!', '@en').verbose();  // '"hello Mars!"@@en'
       ```

<a name="function_integer" />

 - `factory.integer(value: `[`#number/integer`](#number_integer)` | string)`
   - **returns** a [new Literal_Integer](#class_literal-integer)
   - *examples:* [See Literal_Integer](#class_literal-integer)

<a name="function_double" />

 - `factory.double(value: number | string)`
   - **returns** a [new Literal_Double](#class_literal-double)
   - *examples:* [See Literal_Double](#class_literal-double)

<a name="function_decimal" />

 - `factory.decimal(value: number | string)`
   - **returns** a [new Literal_Decimal](#class_literal-decimal)
   - *examples:* [See Literal_Decimal](#class_literal-decimal)

<a name="function_boolean" />

 - `factory.boolean(value: boolean | string)`
   - **returns** a [new Literal_Boolean](#class_literal-boolean)
   - *examples:* [See Literal_Boolean](#class_literal-boolean)

<a name="function_number" />

 - `factory.number(value: number)`
   - will return an RDF literal with either an XSD integer datatype or an XSD decimal datatype, depending on if `value` is an integer or not. Otherwise, if `value` is infinite or `NaN`, will return an RDF literal with an XSD double datatype.
   - **returns** a [new Literal_Integer](#class_literal-integer), a new [new Literal_Decimal](#class_literal-decimal), or a [new Literal_Double](#class_literal-double) depending on `value`.
   - *examples:*
      ```js
      const h_prefixes = {xsd:'http://www.w3.org/2001/XMLSchema#'};
      factory.number(42).datatype.terse(h_prefixes);  // 'xsd:integer'
      factory.number(Math.PI).datatype.terse(h_prefixes);  // 'xsd:decimal'
      factory.number(Infinity).datatype.terse(h_prefixes);  // 'xsd:double'
      ```

<a name="function_date" />

 - `factory.date(date: Date)`
   - **returns** a [new Literal](#class_literal)
   - *examples:*
      ```js
      const h_prefixes = {xsd:'http://www.w3.org/2001/XMLSchema#'};
      let dt_event = new Date('December 17, 1995 03:24:00');
      factory.date(dt_event).terse(h_prefixes);  // '"1995-12-17Z"^^xsd:date'
      ```

<a name="function_dateTime" />

 - `factory.dateTime(dateTime: Date)`
   - **returns** a [new Literal](#class_literal)
   - *examples:*
      ```js
      const h_prefixes = {xsd:'http://www.w3.org/2001/XMLSchema#'};
      let dt_event = new Date('December 17, 1995 03:24:00');
      factory.dateTime(dt_event).terse(h_prefixes);  // '"1995-12-17T11:24:00.000Z"^^xsd:dateTime'
      ```

<a name="function_c1" />

 - `factory.c1(term: `[`#string/concise-term`](concise#string_c1)`[, prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **returns** a [new GenericTerm](#class_generic-term)

<a name="function_term" />

 - `factory.term(term: `[`#string/concise-term`](concise#string_c1)`[, prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **returns** a [new GenericTerm](#class_generic-term)

<a name="function_quad" />

 - `factory.quad(subject: `[`Term`](#interface_term)`, predicate: `[`Term`](#interface_term)`, object: `[`Term`](#interface_term)`, graph: `[`Term`](#interface_term)`)`
   - **returns** a [new Quad](#class_quad)



<a name="function_c4" />

 - *generator* `factory.c4(quads: `[`#hash/concise-quads`](concise#hash_c4)`[, prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **yields** a series of [Quads](#class_quad)




<a name="function_c3" />

 - *generator* `factory.c3(triples: `[`#hash/concise-triples`](concise#hash_c4)`[, prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **yields** a series of [Triples](#class_triple)



<a name="function_comment" />

 - `factory.comment(config: `[`#config/comment`](#config_comment)`)`
   - creates a special concise term string that tells the RDF writer to interpret the value associated with this key as a comment and to insert it into the output RDF document if the destination RDF format supports comments. Use this function in the predicate, subject or graph position of any concise triples or concise quads hash.
   - **returns** a [`#string/concise-term`](concise#string_c1)
   - *example:*
      ```js
      // snippets/write-comment.js
      const factory = require('@graphy-dev/core.data.factory');
      const ttl_write = require('@graphy-dev/content.ttl.write');
      
      let y_writer = ttl_write({
         prefixes: {
            demo: 'http://ex.org/',
            dbo: 'http://dbpedia.org/ontology/',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
         },
      });
      
      y_writer.pipe(process.stdout);
      
      y_writer.write({
         type: 'c3',
         value: {
            [factory.comment()]: 'this is a comment',
            'demo:Banana': {
               a: 'dbo:Fruit',
               [factory.comment()]: 'so is this...',
               'rdfs:label': '@en"Banana',
            },
         },
      });
      
      y_writer.end();
      ```
   - *outputs:*
      ```turtle
      @prefix demo: <http://ex.org/> .
      @prefix dbo: <http://dbpedia.org/ontology/> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      
      # this is a comment
      demo:Banana rdf:type dbo:Fruit ;
         # so is this...
         rdfs:label "Banana"@en .
      
      ```



---

## Classes

<a name="class_generic-term" />

### abstract class **GenericTerm** implements [Term](#interface_term)
**Properties:**
 - `.isGraphyTerm` : `boolean` = `true`

**Methods:**
 - `equals(other: `[`@RDFJS/Term`](http://rdf.js.org/#term-interface)`)`
   - **returns** `boolean`
 - `verbose()`
   - **returns** [`#string/term_verbose`](#string-term_verbose)
 - `terse(prefix_map: `[`#hash/prefix-mappings`](#hash-prefixmappings)`)`
   - **returns** [`#string/term_terse`](#string-term_terse)
 - `concise(prefix_map: `[`#hash/prefix-mappings`](#hash-prefixmappings)`)`
   - **returns** [`#string/term_concise`](#string-term_concise)
 - `isolate()` -- creates a self-contained object representation of this term, devoid of references to other objects
   - **returns** [`#struct/term_isolated`](#struct-term_isolate)
   - *example:*
      ```js
      factory.namedNode('ex://test').isolate();  // {termType:'NamedNode', value:'ex://test'}
      factory.blankNode('yellow').isolate();  // {termType:'BlankNode', value:'yellow'}
      factory.integer(42).isolate();  /* {
          termType: 'Literal',
          value: '42',
          datatype: {
              termType: 'NamedNode',
              value: 'http://www.w3.org/2001/XMLSchema#integer',
          },
      } */
      ```

<a name="class_named-node" />

### class **NamedNode** extends [GenericTerm](#class_generic-term) implements [@RDFJS/NamedNode](http://rdf.js.org/#namednode-interface)
A class that represents an RDF named node.

**Properties implementing [@RDFJS/NamedNode](http://rdf.js.org/#namednode-interface)**:
 - `.termType` : `string` = `'NamedNode'`
 - `.value` : `string` -- the IRI of this named node

**Properties:**
 - `.isNamedNode` : `boolean` = `true` -- a faster alternative to test for NamedNode term types

**Methods:**
 - ... [see those inherited from GenericTerm](#class_generic-term)

<a name="class_blank-node" />

### class **BlankNode** extends [GenericTerm](#class_generic-term) implements [@RDFJS/BlankNode](http://rdf.js.org/#blanknode-interface)
A class that represents an RDF blank node.

**Properties implementing [@RDFJS/BlankNode](http://rdf.js.org/#blanknode-interface)**:
 - `.termType` : `string` = `'BlankNode'`
 - `.value` : `string` -- the label of this blank node (i.e., without leading `'_:'`)

**Properties:**
 - `.isBlankNode` : `boolean` = `true` -- a faster alternative to test for BlankNode term types
 - `.isAnonymous` : `boolean` -- whether or not this term was constructed anonymously

**Methods:**
 - ... [see those inherited from GenericTerm](#class_generic-term)

**Examples:**
```js
factory.blankNode().isAnonymous;  // true
factory.blankNode('label').isAnonymous;  // false

graphy.content.ttl.read('_:a <b> [] .', {
    data(y_quad) {
        y_quad.subject.isAnonymous;  // false
        y_quad.object.isAnonymous;  // true
    },
});
```

<a name="class_default-graph" />

### class **DefaultGraph** extends [GenericTerm](#class_generic-term) implements [@RDFJS/DefaultGraph](http://rdf.js.org/#defaultgraph-interface)
A class that represents an RDF default graph.

**Properties implementing [@RDFJS/DefaultGraph](http://rdf.js.org/#defaultgraph-interface)**:
 - `.termType` : `string` = `'DefaultGraph'`
 - `.value` : `string` = `''` (an empty string)

**Properties:**
 - `.isDefaultGraph` : `boolean` = `true` -- a faster alternative to test for DefaultGraph term types

**Methods:**
 - ... [see those inherited from GenericTerm](#class_generic-term)

<a name="class_literal" />

### class **Literal** extends [GenericTerm](#class_generic-term) implements [@RDFJS/Literal](http://rdf.js.org/#literal-interface)
A class that represents an RDF literal.

**Properties implementing [@RDFJS/Literal](http://rdf.js.org/#literal-interface)**:
 - `.termType` : `string` = `'Literal'`
 - `.value` : `string` -- the contents of this literal
 - `.datatype` : [`NamedNode`](#class-namednode) -- the datatype of this literal (defaults to [rdf:langString](https://www.w3.org/1999/02/22-rdf-syntax-ns#langString))
 - `.language` : `#string/language_tag` -- the language tag associated with this literal (will be an empty string if it has no language)

**Properties:**
 - `.isLiteral` : `boolean` = `true` -- a faster alternative to test for Literal term types
 
**Methods:**
 - ... [see those inherited from GenericTerm](#class_generic-term)

<a name="class_literal-boolean" />

### class **Literal_Boolean** extends [Literal](#class_literal)
A class that represents an RDF literal that is an [xsd:boolean](https://www.w3.org/TR/xmlschema-2/#boolean).

**Properties:**
 - ... [see those inherited from Literal](#class_literal)
 - `.isBoolean` : `boolean` = `true` -- indicates that this object has a boolean value (i.e., `typeof this.number === 'boolean'`).
 - `.boolean` : `boolean` - the boolean value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class_literal)



<a name="class_literal-integer" />

### class **Literal_Integer** extends [Literal](#class_literal)
A class that represents an RDF literal that is an [xsd:integer](https://www.w3.org/TR/xmlschema-2/#integer).

**Properties:**
 - ... [see those inherited from Literal](#class_literal)
 - `.isNumeric` : `boolean` = `true` -- indicates that this object has a numeric value (i.e., `typeof this.number === 'number'`).
 - `.isInteger` : `boolean` = `true` -- indicates that this object has an integer value (i.e., `Number.isInteger(this.number) === true`).
 - `.number` : `#number/integer` - the numeric integer value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class_literal)

**Examples:**
```js
let yt_answer = factory.integer(42);
yt_answer.verbose();  // '"42"^^<http://www.w3.org/2001/XMLSchema#integer>'
yt_answer.isNumeric;  // 'true'
yt_answer.isInteger;  // 'true'
yt_answer.isDouble;  // undefined
yt_answer.number + 1;  // 43
yt_answer.value;  // '42'

factory.integer('12').number;  // 12
factory.integer(12.1);  // throws Number is not an integer: 12.1
factory.integer('12.1');  // throws Error: Invalid integer string: 12.1
```


<a name="class_literal-decimal" />

### class **Literal_Decimal** extends [Literal](#class_literal)
A class that represents an RDF literal that is an [xsd:decimal](https://www.w3.org/TR/xmlschema-2/#decimal).

**Properties:**
 - ... [see those inherited from Literal](#class_literal)
 - `.isNumeric` : `boolean` = `true` -- indicates that this object has a numeric value (i.e., `typeof this.number === 'number'`).
 - `.isDecimal` : `boolean` = `true` -- indicates that this object has a decimal value (note that decimals can never encode +/- infinity nor NaN).
 - `.number` : `#number/double` - the numeric double value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class_literal)

<a name="class_literal-double" />

### class **Literal_Double** extends [Literal](#class_literal)
A class that represents an RDF literal that is an [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Properties:**
 - ... [see those inherited from Literal](#class_literal)
 - `.isNumeric` : `boolean` = `true` -- indicates that this object has a numeric value (i.e., `typeof this.number === 'number'`).
 - `.isDouble`  : `boolean` = `true` -- indicates that this object has a double value, which may include `+Infinity`, `-Infinity` or `NaN`.
 - `.number` : `#number/double` - the numeric double value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class_literal)


**Examples:**
```js
let yt_pi = factory.double(Math.PI);
yt_pi.verbose();  // '"3.141592653589793"^^<http://www.w3.org/2001/XMLSchema#double>'
yt_pi.isNumeric;  // true
yt_pi.isDouble;  // true
yt_pi.isInteger;  // undefined
yt_pi.number * 2;  // 6.283185307179586

graphy.content.ttl.read('<ex://unit-circle> <ex://area> 3.141592653589793 .', {
    data(y_quad) {
        y_quad.object.value;  // '3.141592653589793'
        y_quad.object.number;  // 3.141592653589793
        y_quad.object.datatype.value;  // 'http://www.w3.org/2001/XMLSchema#double'
    },
});
```

<a name="class_literal-positive-infinity" />

### class **Literal_PositiveInfinity** extends [Literal_Double](#class_literal-double)
A class that represents an RDF literal that is positive infinity, which is of type [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Overriding properties:**
 - `.value` : `string` = `'INF'` -- the XSD-comformant string representation of this double.
 - `.number` : `number` = `Infinity` - the numeric positive infinity value of this RDF literal.

**Properties:**
 - ... [see those inherited from Literal_Double](#class_literal-double)
 - `.isInfinite` : `boolean` = `true` -- indicates that this object has an infinite numeric value (i.e., `Number.isFinite(this.number) === false`)
 
**Methods:**
 - ... [see those inherited from Literal_Double](#class_literal-double)

<a name="class_literal-negative-infinity" />

### class **Literal_NegativeInfinity** extends [Literal_Double](#class_literal-double)
A class that represents an RDF literal that is negative infinity, which is of type [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Overriding properties:**
 - `.value` : `string` = `'-INF'` -- the XSD-comformant string representation of this double.
 - `.number` : `number` = `-Infinity` - the numeric negative infinity value of this RDF literal.

**Properties:**
 - ... [see those inherited from Literal_Double](#class_literal-double)
 - `.isInfinite` : `boolean` = `true` -- indicates that this object has an infinite numeric value (i.e., `Number.isFinite(this.number) === false`)
 
**Methods:**
 - ... [see those inherited from Literal_Double](#class_literal-double)

<a name="class_literal-nan" />

### class **Literal_NaN** extends [Literal_Double](#class_literal-double)
A class that represents an RDF literal that is NaN, which is of type [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Overriding properties:**
 - `.value` : `string` = `'NaN'` -- the XSD-comformant string representation of this double.
 - `.number` : `number` = `NaN` - the numeric NaN value of this RDF literal.

**Properties:**
 - ... [see those inherited from Literal_Double](#class_literal-double)
 - `.isNaN` : `boolean` = `true` -- indicates that this object has an NaN numeric value (i.e., `Number.isNan(this.number) === true`)
 
**Methods:**
 - ... [see those inherited from Literal_Double](#class_literal-double)

<a name="class_quad" />

### class **Quad** implements [@RDFJS/Quad](http://rdf.js.org/#quad-interface)
A class that represents an RDF quad.

**Properties:**
 - `.subject` : [`NamedNode`](#class_named-node)` | `[`BlankNode`](#named-node)
 - `.predicate` : [`NamedNode`](#class_named-node)
 - `.object` : [`NamedNode`](#class_named-node)` | `[`BlankNode`](#named-node)` | `[`Literal`](#class_literal)
 - `.graph` : [`NamedNode`](#class_named-node)` | `[`BlankNode`](#named-node)` | `[`DefaultGraph`](#class_default-graph)
 
**Methods:**
 - `equals(other: `[`@RDFJS/Quad`](http://rdf.js.org/#quad-interface)`)`
   - **returns** a `boolean`
 - `verbose()`
   - **returns** a [`#string/quad_verbose`](#string_quad-verbose)
 - `terse()`
   - **returns** a [`#string/quad_terse`](#string_quad-terse)
 - `concise()`
   - **returns** a [`#struct/quad_concise`](#struct_quad-concise)
 - `isolate()`
   - **returns** a [`#struct/quad_isolate`](#struct_quad-isolate)

---

## Interfaces

<a name="interface_term" />

### interface **Term** extends [@RDFJS/Term](http://rdf.js.org/#term-interface)
Alias of [@RDFJS/Term](http://rdf.js.org/#term-interface)

<a name="interface_labelmanager" />

### interface **LabelManager**

**Methods:**
 - `nextLabel()`
   - generate the next unique blank node label
   - **returns** a `string`