# Data Factory
`@graphy/api.data.factory`

## Primer
 - `factory` is used throughout this document to refer to this module's export.

## Contents
 - [Accessibility](#accessibility) -- how to access this module
 - [Datatypes](#datatypes) -- formatting hints or restrictions on primitive ES datatypes
   - [Strings](#strings) -- `typeof value === 'string'`
   - [Structs](#structs) -- `typeof value === 'object' && value.constructor === Object`
 - [Functions](#functions) -- static functions made available on this module's export
   - Basic Term constructors
     - [`namedNode(...)`](#function-namednode)
     - [`blankNode(...)`](#function-blanknode)
     - [`defaultGraph(...)`](#function-defaultgraph)
     - [`literal(...)`](#function-literal)
   - Specialized Literal Term constructors
     - [`boolean(...)`](#function-boolean)
     - [`integer(...)`](#function-integer)
     - [`decimal(...)`](#function-decimal)
     - [`double(...)`](#function-double)
     - [`number(...)`](#function-number)
     - [`date(...)`](#function-date)
     - [`dateTime(...)`](#function-datetime)
   - Quad constructors
     - [`quad(...)`](#function-quad)
     - [`triple(...)`](#function-triple)
 - [Classes](#classes) -- class definitions
   - [GenericTerm](#class-genericterm)
     - [NamedNode](#class-namednode)
     - [BlankNode](#class-blanknode)
     - [Literal](#class-literal)
       - [Literal_Boolean](#class-literal_boolean)
       - [Literal_Integer](#class-literal_integer)
       - [Literal_Decimal](#class-literal_decimal)
       - [Literal_Double](#class-literal_double)
         - [Literal_PositiveInfinity](#class-literal_positiveinfinity)
         - [Literal_NegativeInfinity](#class-literal_negativeinfinity)
         - [Literal_NaN](#class-literal_nan)
   - [Quad](#class-quad)
     - [Triple](#class-triple)
 - [Interfaces](#interfaces) -- interface definitions
   - [Term](#interface-term)
   - [LabelManager](#interface-term)

---

## Accessibility
The following code block demonstrates three *different* ways to access this module.
```js
// stand-alone
const factory = require('@graphy/api.data.factory');

// via the graphy 'super module'
const graphy = require('graphy');
const factory = graphy.api.data.factory;

// via inheritted methods on the graphy 'super module'
const graphy = require('graphy');
const factory = graphy;
```

---

## Datatypes
The following section describes hinted formatting on ES primitives that are used throughout this document.

### Strings:

<a name="string-term_verbose" />

 - `#string/term_verbose` -- a string which is conformant with the grammar production `subject`, `predicate`, `object` or `graphLabel` as they are defined in the [N-Triples](https://www.w3.org/TR/n-triples/#n-triples-grammar) and [N-Quads](https://www.w3.org/TR/n-quads/#sec-grammar) specifications.

<a name="string-term_terse" />

 - `#string/term_terse` -- a string which is conformant with the grammar production `IRIREF`, `RDFLiteral`, or `PrefixedName` as they are defined in the [Turtle](https://www.w3.org/TR/turtle/#sec-grammar) specification.

<a name="string-term_concise" />

 - `#string/term_concise` -- a [concise-term string](/doc/concise-term#ct-string).

<a name="string-language_tag" />

 - `#string/language_tag` -- a [BCP47 string](https://tools.ietf.org/html/bcp47).

### Structs:
A 'struct' refers to an interface for a simple ES Object `value` such that `value.constructor === Object`. The following section documents the definitions for these interfaces.

<a name="struct-term_isolate" />

 - `#struct/term_isolate` -- an object that represents an isolated RDF term.
   - **required properties:**
     - `.termType`: `string`
     - `.value`: `string`
   - **optional properties:**
     - `.datatype`: [`#struct/node_isolate`]
     - `.language`: [`#string/language_tag`]

<a name="struct-quad_isolate" />

 - `#struct/quad_isolate` -- an object that represents an isolated RDF quad.
   - **properties:**
     - `.subject` : [`#struct/term_isolate`]
     - `.predicate` : [`#struct/term_isolate`]
     - `.object` : [`#struct/term_isolate`]
     - `.graph` : [`#struct/term_isolate`]

### Hash Interfaces:
A 'hash' is a synonym of a HashMap; it refers to an object whose keys are arbitrarily decided by you, the user. The following section documents significance of the keys and expected values for hashes used by this library.

<a name="hash-prefixmappings" />

 - `#hash/prefix-mappings` -- an object that represents the mappings from a prefix string to its expanded IRI.
  - **definition:**
    ```ts
    interface **PrefixMappings** { [prefix: string]: string; };
    ```

---

## Functions:

<a name="function-namednode" />

- `factory.namedNode(iri: string)`
  - **returns** a [new NamedNode](#class-namednode)
  - *example:*
      ```js
      factory.namedNode('ex://test').verbose();  // '<ex://test>'
      ```

<a name="function-blanknode" />

 - `factory.blankNode(...)`
   - *overloaded variants*
     - `()` -- no args constructor will generate a new UUID4 in attempt to avoid label collisions
     - `(label: string)` -- uses the given `label` 
     - `(label_manager: `[`LabelManager`](#interface-labelmanager)`)` -- calls `label_manager.next_label()` to generate a new label. It is recommended to use this variant rather than the no-args variant because it guarantees collision-free labels and is typically better performance.
   - **returns** a [new BlankNode](#class-blanknode)
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

<a name="function-defaultgraph" />

 - `factory.defaultGraph()`
   - **returns** a [new DefaultGraph](#class-defaultgraph)
   - *example:*
       ```js
       graphy.defaultGraph().verbose();  // ''
       graphy.defaultGraph().termType;  // 'DefaultGraph'
       ```

<a name="function-literal" />

 - `factory.literal(contents: string[, datatype_or_lang: `[`NamedNode`](#class-namednode)` | string])`
   - **returns** a [new Literal](#class-literal), optionally using `datatype_or_lang`
   - *example:*
       ```js
       factory.literal('"').verbose();  // '"\""^^<http://www.w3.org/2001/XMLSchema#string>'
       factory.literal('42', 'ex://datatype').verbose();  // '"42"^^<ex://datatype>'
       factory.literal('hello Mars!', '@en').verbose();  // '"hello Mars!"@en'
       ```

<a name="function-integer" />

 - `factory.integer(value: `[`#number/integer`](#number-integer)` | string)`
   - **returns** a [new Literal_Integer](#class-literal_integer)
   - *examples:* [See Literal_Integer](#class-literal_integer)

<a name="function-double" />

 - `factory.double(value: number | string)`
   - **returns** a [new Literal_Double](#class-literal_double)
   - *examples:* [See Literal_Double](#class-literal_double)

<a name="function-decimal" />

 - `factory.decimal(value: number | string)`
   - **returns** a [new Literal_Decimal](#class-literal_decimal)
   - *examples:* [See Literal_Decimal](#class-literal_decimal)

<a name="function-boolean" />

 - `factory.boolean(value: boolean | string)`
   - **returns** a [new Literal_Boolean](#class-literal_boolean)
   - *examples:* [See Literal_Boolean](#class-literal_boolean)

<a name="function-number" />

 - `factory.number(value: number)`
   - will return an RDF literal with either an XSD integer datatype or an XSD decimal datatype, depending on if `value` is an integer or not. Otherwise, if `value` is infinite or `NaN`, will return an RDF literal with an XSD double datatype.
   - **returns** a [new Literal_Integer](#class-literal_integer), a new [new Literal_Decimal](#class-literal_decimal), or a [new Literal_Double](#class-literal_double) depending on `value`.
   - *examples:*
      ```js
      const h_prefixes = {xsd:'http://www.w3.org/2001/XMLSchema#'};
      factory.number(42).datatype.terse(h_prefixes);  // 'xsd:integer'
      factory.number(Math.PI).datatype.terse(h_prefixes);  // 'xsd:decimal'
      factory.number(Infinity).datatype.terse(h_prefixes);  // 'xsd:double'
      ````

<a name="function-date" />

 - `factory.date(date: Date)`
   - **returns** a [new Literal](#class-literal)
   - *examples:*
      ```js
      const h_prefixes = {xsd:'http://www.w3.org/2001/XMLSchema#'};
      let dt_event = new Date('December 17, 1995 03:24:00');
      factory.date(dt_event).terse(h_prefixes);  // '"1995-12-14Z"^^xsd:date'
      ```

<a name="function-dateTime" />

 - `factory.dateTime(dateTime: Date)`
   - **returns** a [new Literal](#class-literal)
   - *examples:*
      ```js
      const h_prefixes = {xsd:'http://www.w3.org/2001/XMLSchema#'};
      let dt_event = new Date('December 17, 1995 03:24:00');
      factory.dateTime(dt_event).terse(h_prefixes);  // '"1995-12-14T03:24:00"^^xsd:dateTime'
      ```

<a name="function-double" />

 - `factory.double(value: number)`
   - **returns** a [new Literal_Double](#class-literal_double)
   - *examples:* [See Literal_Double](#class-literal_double)

<a name="function-quad" />

 - `factory.quad(subject: `[`Term`](#interface-term)`, predicate: `[`Term`](#interface-term)`, object: `[`Term`](#interface-term)`, graph: `[`Term`](#interface-term)`)`
   - **returns** a [new Quad](#class-quad)

<a name="function-triple" />

 - `factory.triple(subject: `[`Term`](#interface-term)`, predicate: `[`Term`](#interface-term)`, object: `[`Term`](#interface-term)`)`
   - **returns** a [new Triple](#class-triple)

---

## Classes

<a name="class-genericterm" />

### abstract class **GenericTerm** implements [Term](#interface-term)
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

<a name="class-namednode" />

### class **NamedNode** extends [GenericTerm](#class-genericterm) implements [@RDFJS/NamedNode](http://rdf.js.org/#namednode-interface)
A class that represents an RDF named node.

**Properties implementing [@RDFJS/NamedNode](http://rdf.js.org/#namednode-interface)**:
 - `.termType` : `string` = `'NamedNode'`
 - `.value` : `string` -- the IRI of this named node

**Properties:**
 - `.isNamedNode` : `boolean` = `true` -- a faster alternative to test for NamedNode term types

**Methods:**
 - ... [see those inherited from GenericTerm](#class-genericterm)

<a name="class-blanknode" />

### class **BlankNode** extends [GenericTerm](#class-genericterm) implements [@RDFJS/BlankNode](http://rdf.js.org/#blanknode-interface)
A class that represents an RDF blank node.

**Properties implementing [@RDFJS/BlankNode](http://rdf.js.org/#blanknode-interface)**:
 - `.termType` : `string` = `'BlankNode'`
 - `.value` : `string` -- the label of this blank node (i.e., without leading `'_:'`)

**Properties:**
 - `.isBlankNode` : `boolean` = `true` -- a faster alternative to test for BlankNode term types
 - `.isAnonymous` : `boolean` -- whether or not this term was constructed anonymously

**Methods:**
 - ... [see those inherited from GenericTerm](#class-genericterm)

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

<a name="class-defaultgraph" />

### class **DefaultGraph** extends [GenericTerm](#class-genericterm) implements [@RDFJS/DefaultGraph](http://rdf.js.org/#defaultgraph-interface)
A class that represents an RDF default graph.

**Properties implementing [@RDFJS/DefaultGraph](http://rdf.js.org/#defaultgraph-interface)**:
 - `.termType` : `string` = `'DefaultGraph'`
 - `.value` : `string` = `''` (an empty string)

**Properties:**
 - `.isDefaultGraph` : `boolean` = `true` -- a faster alternative to test for DefaultGraph term types

**Methods:**
 - ... [see those inherited from GenericTerm](#class-genericterm)

<a name="class-literal" />

### class **Literal** extends [GenericTerm](#class-genericterm) implements [@RDFJS/Literal](http://rdf.js.org/#literal-interface)
A class that represents an RDF literal.

**Properties implementing [@RDFJS/Literal](http://rdf.js.org/#literal-interface)**:
 - `.termType` : `string` = `'Literal'`
 - `.value` : `string` -- the contents of this literal
 - `.datatype` : [`NamedNode`](#class-namednode) -- the datatype of this literal (defaults to [rdf:langString](https://www.w3.org/1999/02/22-rdf-syntax-ns#langString))
 - `.language` : `#string/language_tag` -- the language tag associated with this literal (will be an empty string if it has no language)

**Properties:**
 - `.isLiteral` : `boolean` = `true` -- a faster alternative to test for Literal term types
 
**Methods:**
 - ... [see those inherited from GenericTerm](#class-genericterm)

<a name="class-literal_boolean" />

### class **Literal_Boolean** extends [Literal](#class-literal)
A class that represents an RDF literal that is an [xsd:boolean](https://www.w3.org/TR/xmlschema-2/#boolean).

**Properties:**
 - ... [see those inherited from Literal](#class-literal)
 - `.isBoolean` : `boolean` = `true` -- indicates that this object has a boolean value (i.e., `typeof this.number === 'boolean'`).
 - `.boolean` : `boolean` - the boolean value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class-literal)



<a name="class-literal_integer" />

### class **Literal_Integer** extends [Literal](#class-literal)
A class that represents an RDF literal that is an [xsd:integer](https://www.w3.org/TR/xmlschema-2/#integer).

**Properties:**
 - ... [see those inherited from Literal](#class-literal)
 - `.isNumeric` : `boolean` = `true` -- indicates that this object has a numeric value (i.e., `typeof this.number === 'number'`).
 - `.isInteger` : `boolean` = `true` -- indicates that this object has an integer value (i.e., `Number.isInteger(this.number) === true`).
 - `.number` : `#number/integer` - the numeric integer value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class-literal)

**Examples:**
```js
let yt_answer = factory.integer(42);
yt_answer.verbose();  // '"42"^^<http://www.w3.org/2001/XMLSchema#integer>'
yt_answer.isNumeric;  // true
yt_answer.isInteger;  // true
yt_answer.isDouble;  // undefined
yt_answer.number + 1;  // 43
yt_answer.value;  // '42'

factory.integer('12').number;  // 12
factory.integer(12.1);  // throws Error: Number is not an integer
factory.integer('12.1');  // throws Error: Invalid integer string: 12.1
```


<a name="class-literal_decimal" />

### class **Literal_Decimal** extends [Literal](#class-literal)
A class that represents an RDF literal that is an [xsd:decimal](https://www.w3.org/TR/xmlschema-2/#decimal).

**Properties:**
 - ... [see those inherited from Literal](#class-literal)
 - `.isNumeric` : `boolean` = `true` -- indicates that this object has a numeric value (i.e., `typeof this.number === 'number'`).
 - `.isDecimal` : `boolean` = `true` -- indicates that this object has a decimal value (note that decimals can never encode +/- infinity nor NaN).
 - `.number` : `#number/double` - the numeric double value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class-literal)

<a name="class-literal_double" />

### class **Literal_Double** extends [Literal](#class-literal)
A class that represents an RDF literal that is an [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Properties:**
 - ... [see those inherited from Literal](#class-literal)
 - `.isNumeric` : `boolean` = `true` -- indicates that this object has a numeric value (i.e., `typeof this.number === 'number'`).
 - `.isDouble`  : `boolean` = `true` -- indicates that this object has a double value, which may include `+Infinity`, `-Infinity` or `NaN`.
 - `.number` : `#number/double` - the numeric double value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class-literal)


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

<a name="class-literal_positiveinfinity" />

### class **Literal_PositiveInfinity** extends [Literal_Double](#class-literal_double)
A class that represents an RDF literal that is positive infinity, which is of type [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Overriding properties:**
 - `.value` : `string` = `'INF'` -- the XSD-comformant string representation of this double.
 - `.number` : `number` = `Infinity` - the numeric positive infinity value of this RDF literal.

**Properties:**
 - ... [see those inherited from Literal_Double](#class-literal_double)
 - `.isInfinite` : `boolean` = `true` -- indicates that this object has an infinite numeric value (i.e., `Number.isFinite(this.number) === false`)
 
**Methods:**
 - ... [see those inherited from Literal_Double](#class-literal_double)

<a name="class-literal_negativeinfinity" />

### class **Literal_NegativeInfinity** extends [Literal_Double](#class-literal_double)
A class that represents an RDF literal that is negative infinity, which is of type [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Overriding properties:**
 - `.value` : `string` = `'-INF'` -- the XSD-comformant string representation of this double.
 - `.number` : `number` = `-Infinity` - the numeric negative infinity value of this RDF literal.

**Properties:**
 - ... [see those inherited from Literal_Double](#class-literal_double)
 - `.isInfinite` : `boolean` = `true` -- indicates that this object has an infinite numeric value (i.e., `Number.isFinite(this.number) === false`)
 
**Methods:**
 - ... [see those inherited from Literal_Double](#class-literal_double)

<a name="class-literal_nan" />

### class **Literal_NaN** extends [Literal_Double](#class-literal_double)
A class that represents an RDF literal that is NaN, which is of type [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Overriding properties:**
 - `.value` : `string` = `'NaN'` -- the XSD-comformant string representation of this double.
 - `.number` : `number` = `NaN` - the numeric NaN value of this RDF literal.

**Properties:**
 - ... [see those inherited from Literal_Double](#class-literal_double)
 - `.isNaN` : `boolean` = `true` -- indicates that this object has an NaN numeric value (i.e., `Number.isNan(this.number) === true`)
 
**Methods:**
 - ... [see those inherited from Literal_Double](#class-literal_double)

<a name="class-quad" />

### class **Quad** implements [@RDFJS/Quad](http://rdf.js.org/#quad-interface)
A class that represents an RDF quad.

**Properties:**
 - `.subject` : [`NamedNode`](#class-namednode)` | `[`BlankNode`](#named-node)
 - `.predicate` : [`NamedNode`](#class-namednode)
 - `.object` : [`NamedNode`](#class-namednode)` | `[`BlankNode`](#named-node)` | `[`Literal`](#class-literal)
 - `.graph` : [`NamedNode`](#class-namednode)` | `[`BlankNode`](#named-node)` | `[`DefaultGraph`](#class-defaultgraph)
 
**Methods:**
 - `equals(other: `[`@RDFJS/Quad`](http://rdf.js.org/#quad-interface)`)`
   - **returns** a `boolean`
 - `verbose()`
   - **returns** a [`#string/quad_verbose`](#string-quad_verbose)
 - `terse()`
   - **returns** a [`#string/quad_terse`](#string-quad_terse)
 - `concise()`
   - **returns** a [`#struct/quad_concise`](#struct-quad_concise)
 - `isolate()`
   - **returns** a [`#struct/quad_isolate`](#struct-quad_isolate)

---

## Interfaces

<a name="interface-term" />

### interface **Term** extends [@RDFJS/Term](http://rdf.js.org/#term-interface)
Alias of [@RDFJS/Term](http://rdf.js.org/#term-interface)

<a name="interface-labelmanager" />

### interface **LabelManager**

**Methods:**
 - `nextLabel()`
   - generate the next unique blank node label
   - **returns** a `string`