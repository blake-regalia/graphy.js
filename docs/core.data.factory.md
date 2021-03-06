

# [« API](api) / Data Factory
<div class="package-heading">
  <code>@graphy/core.data.factory</code>
</div>

## Primer
 - `factory` is used throughout this document to refer to this module's export.

## Contents
 - [Accessibility](#accessibility) -- how to access this module
 - [Datatypes](#datatypes) -- formatting hints or restrictions on primitive ES datatypes
   - [Numbers](#numbers) -- restrictions on the value of primitive numbers
   - [Strings](#strings) -- restrictions on the format or syntax of primitive strings
   - [Structs](#structs) -- restrictions on plain objects, i.e., `typeof value === 'object' && value.constructor === Object`
   - [Hashes](#hashes) -- plain objects that have arbitrary keys which correspond to their value, much like a HashMap
 - [Functions](#functions) -- static functions made available on this module's export
   - Basic Term constructors
     - [`.namedNode(...)`](#function_named-node)
     - [`.blankNode(...)`](#function_blank-node)
     - [`.defaultGraph(...)`](#function_default-graph)
     - [`.literal(...)`](#function_literal)
   - Specialized Literal Term constructors
     - [`.ephemeral(...)`](#function_ephemeral)
     - [`.boolean(...)`](#function_boolean)
     - [`.integer(...)`](#function_integer)
     - [`.decimal(...)`](#function_decimal)
     - [`.double(...)`](#function_double)
     - [`.number(...)`](#function_number)
     - [`.date(...)`](#function_date)
     - [`.dateTime(...)`](#function_date-time)
   - Quad constructors
     - [`.quad(...)`](#function_quad)
   - Concise Term constructors
     - [`.c1(...)`](#function_c1)
   - Concise Quads constructors
     - [`.c3(...)`](#function_c3)
     - [`.c4(...)`](#function_c4)
   - Normalization
     - [`.fromTerm`](#function_from-term)
     - [`.fromQuad`](#function_from-quad)
     - [`.from.term`](#function_from-term)
     - [`.from.quad`](#function_from-quad)
   - Content Writer directives
     - [`.config(...)`](#function_config)
     - [`.comment(...)`](#function_comment)
     - [`.newlines(...)`](#function_newlines)
 - [Classes](#classes) -- class definitions
   - [GenericTerm](#class_generic-term)
     - [NamedNode](#class_named-node)
     - [BlankNode](#class_blank-node)
       - [EphemeralBlankNode](#class_ephemeral-blank-node)
     - [Literal](#class_literal)
       - [Literal_Boolean](#class_literal-boolean)
       - [Literal_Integer](#class_literal-integer)
       - [Literal_Decimal](#class_literal-decimal)
       - [Literal_Double](#class_literal-double)
         - [Literal_PositiveInfinity](#class_literal-positive-infinity)
         - [Literal_NegativeInfinity](#class_literal-negative-infinity)
         - [Literal_NaN](#class_literal-nan)
   - [Quad](#class_quad)
 - [Interfaces](#interfaces) -- interface definitions
   - [AnyTerm](#interface_any-term)
   - [AnyQuad](#interface_any-quad)


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


<a name="numbers" />

### Numbers:

<a name="number_integer" />

 - [`#number/integer`](#number_integer) -- any number such that `Numer.isInteger(value) === true`.

<a name="number_double" />

 - [`#number/double`](#number_double) -- any number.


<a name="strings" />

### Strings:

<a name="string_term-verbose" />

 - [`#string/term-verbose`](#string_term-verbose) -- a string which is conformant with the grammar production `subject`, `predicate`, `object` or `graphLabel` as they are defined in the [N-Triples](https://www.w3.org/TR/n-triples/#n-triples-grammar) and [N-Quads](https://www.w3.org/TR/n-quads/#sec-grammar) specifications.

<a name="string_quad-verbose" />

 - [`#string/quad-verbose`](#string_quad-verbose) -- a string which is conformant with the grammar production `statement` as is is defined in the [N-Quads](https://www.w3.org/TR/n-quads/#sec-grammar) specification.

<a name="string_term-terse" />

 - [`#string/term-terse`](#string_term-terse) -- a string which is conformant with the grammar production `IRIREF`, `RDFLiteral`, or `PrefixedName` as they are defined in the [Turtle](https://www.w3.org/TR/turtle/#sec-grammar) specification.

<a name="string_language-tag" />

 - [`#string/language-tag`](#string_language-tag) -- a [BCP47 string](https://tools.ietf.org/html/bcp47).


<a name="structs" />

### Structs:
A 'struct' refers to an interface for a simple ES Object `value` such that `value.constructor === Object`. This is important because some methods may perform duck-typing on their arguments in order to deduce which overloaded variant to employ. The following section documents the definitions for these interfaces.

<a name="struct_term-isolate" />

 - [`#struct/term-isolate`](#struct_term-isolate) -- an object that represents an isolated RDF term.
   - _required properties:_
     - `.termType`: `string`
     - `.value`: `string`
   - _optional properties:_
     - `.datatype`: [#struct/term-isolate](#struct_term-isolate)
     - `.language`: [#string/language-tag](#string_language-tag)

<a name="struct_quad-isolate" />

 - [`#struct/quad-isolate`](#struct_quad-isolate) -- an object that represents an isolated RDF quad.
   - _properties:_
     - `.subject` : [#struct/term-isolate](#struct_term-isolate)
     - `.predicate` : [#struct/term-isolate](#struct_term-isolate)
     - `.object` : [#struct/term-isolate](#struct_term-isolate)
     - `.graph` : [#struct/term-isolate](#struct_term-isolate)

<!--
<a name="configs" />

### Configs:
A 'config' refers to an interface for a value that has certain expected or optional properties. Configs are typically used to pass named options to a method.
-->


<a name="hashes" />

### Hash Interfaces:
A 'hash' is a synonym of a HashMap; it refers to an object whose keys are arbitrarily decided by you, the user. The following section documents significance of the keys and expected values for hashes used by this library.

<a name="hash_prefix-mappings" />

 - [`#hash/prefix-mappings`](#hash_prefix-mappings) -- an object that represents the mappings from a prefix string to its expanded IRI.
   - **definition:**
     ```ts
     interface **PrefixMappings** { [prefix: string]: string; };
     ```

---

## Functions:

<a name="function_named-node" />

### [`factory.namedNode`](#function_named-node)`(iri: string)`
  - **returns** a [new NamedNode](#class_named-node)
  - *example:*
      ```js
      factory.namedNode('http://ex.org/test').verbose();  // '<http://ex.org/test>'
      ```

<a name="function_blank-node" />

### [`factory.blankNode`](#function_blank-bode)`(...)`
   - *overloaded variants*
     - `()` -- 'auto'-version (no args constructor) will generate a new UUID4 in attempt to avoid label collisions
     - `(label: string)` -- uses the given `label` 
   - **returns** a [new BlankNode](#class_blank-node)
   - *examples:*
       ```js
       // no-args constructor
       factory.blankNode().verbose();  // '_:_439e14ae_1531_4683_ac96_b9f091da9595'

       // use given label constructor
       factory.blankNode('label').verbose();  // '_:label'

       ```

<a name="function_default-graph" />

### [`factory.defaultGraph`](#function_default-graph)`()`
   - **returns** a [new DefaultGraph](#class_default-graph)
   - *example:*
       ```js
       graphy.defaultGraph().verbose();  // ''
       graphy.defaultGraph().termType;  // 'DefaultGraph'
       ```

<a name="function_literal" />

### [`factory.literal`](#function_literal)`(contents: string[, datatype_or_lang: `[`NamedNode`](#class_named-node)` | `[`#string/language-tag`](#string_language-tag)`])`
   - **returns** a [new Literal](#class_literal), optionally using `datatype_or_lang`
   - *example:*
       ```js
       factory.literal('"').verbose();  // '"\""^^<http://www.w3.org/2001/XMLSchema#string>'
       factory.literal('42', 'http://ex.org/datatype').verbose();  // '"42"@http://ex.org/datatype'
       factory.literal('hello Mars!', 'en').verbose();  // '"hello Mars!"@en'

       // for backwards-compatibility, the '@' character is also allowed in the language tag argument version
       factory.literal('hello Mars!', '@en').verbose();  // '"hello Mars!"@en'
       ```

<a name="function_ephemeral" />

### [`factory.ephemeral`](#function_ephemeral)`()`
   - **returns** a [new EphemeralBlankNode](#class_ephemeral-blank-node) which is primarily used as a means to write syntactic anonymous blank nodes in Turtle and TriG.
   - *examples:*
       ```js
       let kt_ephemeral = factory.ephemeral();

       kt_ephemeral.isAnonymous;  // true
       kt_ephemeral.isEphemeral;  // true

       // returns a different label each time `.value` is accessed to ensure it is not accidentally reused
       kt_ephemeral.value;  // '_66f0cc19_e551_4d82_8bf2_73329fb578b2'
       kt_ephemeral.value;  // '_12ebb618_981b_45c9_a63b_a1e30170fcd1'
       kt_ephemeral.value;  // '_4335c2d1_b7e2_4a43_ae81_a9f3a73e31ab'

       // same thing happens with `.verbose()` string
       kt_ephemeral.verbose();  // '_:_82d116e8_352b_4ec3_8e3a_3b100a53b557'
       kt_ephemeral.verbose();  // '_:_72b4a5ab_f4f0_494c_a432_c82b9d5aed50'
       kt_ephemeral.verbose();  // '_:_1110a7e0_39fa_45ed_88c3_03912da0d93c'

       // the `.terse()` string is the anonymous blank node token!
       kt_ephemeral.terse();  // '[]'

       // will never equal itself
       kt_ephemeral.equals(kt_ephemeral);  // false

       // demonstration being used in c3/c4 hashes
       [...factory.c3({
           // create a non-reusable blank node as the subject of some triples
           [factory.ephemeral()]: {
               a: 'owl:Thing',
               'demo:refs': factory.ephemeral(),
           },
       }, h_prefixes)].map(g => g.terse()).join('');  // '[] a owl:Thing; demo:refs [] .'
       ```

<a name="function_boolean" />


### [`factory.boolean`](#function_boolean)`(value: boolean | number | string)`
   - create an RDF literal with an XSD boolean datatype. Will serialize as a literal boolean value in writers that support them. If `value` is a number, it must be either `1` or `0`. If `value` is a string, it must match `/^([Tt](rue)?|TRUE)$/` or `/^([Ff](alse)?|FALSE)$/`.
   - **returns** a [new Literal_Boolean](#class_literal-boolean)
   - *examples:* [See Literal_Boolean](#class_literal-boolean)

<a name="function_integer" />

### [`factory.integer`](#function_integer)`(value: `[`#number/integer`](#number_integer)` | string)`
   - **returns** a [new Literal_Integer](#class_literal-integer)
   - *examples:* [See Literal_Integer](#class_literal-integer)

<a name="function_double" />

### [`factory.double`](#function_double)`(value: number | string)`
   - **returns** a [new Literal_Double](#class_literal-double)
   - *examples:* [See Literal_Double](#class_literal-double)

<a name="function_decimal" />

### [`factory.decimal`](#function_decimal)`(value: number | string)`
   - **returns** a [new Literal_Decimal](#class_literal-decimal)
   - *examples:* [See Literal_Decimal](#class_literal-decimal)

<a name="function_number" />

### [`factory.number`](#function_number)`(value: number)`
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

### [`factory.date`](#function_date)`(date: Date)`
   - **returns** a [new Literal](#class_literal)
   - *examples:*
      ```js
      const h_prefixes = {xsd:'http://www.w3.org/2001/XMLSchema#'};
      let dt_event = new Date('December 17, 1995 03:24:00');
      factory.date(dt_event).terse(h_prefixes);  // '"1995-12-17Z"^^xsd:date'
      ```

<a name="function_date-time" />

### [`factory.dateTime`](#function_date-time)`(dateTime: Date)`
   - **returns** a [new Literal](#class_literal)
   - *examples:*
      ```js
      const h_prefixes = {xsd:'http://www.w3.org/2001/XMLSchema#'};
      let dt_event = new Date('December 17, 1995 03:24:00');
      factory.dateTime(dt_event).terse(h_prefixes);  // '"1995-12-17T11:24:00.000Z"^^xsd:dateTime'
      ```

<a name="function_quad" />

### [`factory.quad`](#function_quad)`(subject: `[`Term`](#interface_term)`, predicate: `[`Term`](#interface_term)`, object: `[`Term`](#interface_term)`, graph: `[`Term`](#interface_term)`)`
   - **returns** a [new Quad](#class_quad)
   - *examples:*
      ```js
      let kt_banana = factory.namedNode('http://ex.org/Banana');
      let kt_color = factory.namedNode('http://ex.org/color');
      let kt_yellow = factory.literal('yellow', factory.namedNode('http://ex.org/Color'));
      let kt_graph = factory.namedNode('http://ex.org/graph');
      factory.quad(kt_banana, kt_color, kt_yellow, kt_graph).terse({ex:'http://ex.org/'});  // ex:graph { ex:Banana ex:color "yellow" . }

      // recommended way using `factory.c4`
      [...factory.c4({
          'ex:graph': {
              'ex:Banana': {
                  'ex:color': 'ex:Color^"yellow',
              },
          },
      }, {ex:'http://ex.org/'})].map(k_quad => k_quad.terse({ex:'http://ex.org/'}));  // ['ex:graph { ex:Banana ex:color <http://ex.org/Color\u005e\u0022yellow> . }']
      ```

<a name="function_c1" />

### [`factory.c1`](#function_c1)`(term: `[`#string/concise-term`](concise#string_c1)`[, prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **returns** a [new GenericTerm](#class_generic-term)
   - *examples:* [See Concise Term String](concise#string_c1)

<!--
<a name="function_term" />

### [`factory.term`](#function_term)`(term: `[`#string/concise-term`](concise#string_c1)`[, prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **returns** a [new GenericTerm](#class_generic-term)
-->



<a name="function_c3" />

### *generator* [`*factory.c3`](#function_c3)`(triples: `[`#hash/concise-triples`](concise#hash_c3)`[, prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **yields** a series of [Quads](#class_quad)
   - *examples:* [See Concise Triples Hash](concise#hash_c3)



<a name="function_c4" />

### *generator* [`*factory.c4`](#function_c4)`(quads: `[`#hash/concise-quads`](concise#hash_c4)`[, prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **yields** a series of [Quads](#class_quad)
   - *examples:* [See Concise Quads Hash](concise#hash_c4)




<a name="function_from-term" />

### [`factory.fromTerm`](#function_from-term)`(term: `[`AnyTerm`](#interface_any-term)`)`
   - converts an object that represents an RDF term, as long as it includes the expected keys such as an [@RDFJS/Term](https://rdf.js.org/#term-interface) from another library, into a graphy-constructed [GenericTerm](#class_generic-term).
   - **returns** a [new GenericTerm](#class_generic-term)
   - *example:*
      ```js
      factory.fromTerm({
          termType: 'NamedNode',
          value: 'z://a',
      }).verbose();  // '<z://a>'
      ```

<a name="function_from-quad" />

### [`factory.fromQuad`](#function_from-quad)`(term: `[`AnyQuad`](#interface_any-quad)`)`
   - converts an object that represents an RDF quad, as long as it includes the expected keys such as an [@RDFJS/Quad](https://rdf.js.org/#quad-interface) from another library, into a graphy-constructed [Quad](#class_quad).
   - **returns** a [new Quad](#class_quad)
   - *example:*
      ```js
      factory.fromQuad({
          subject: {
              termType: 'NamedNode',
              value: 'z://y/a',
          },
          predicate: {
              termType: 'NamedNode',
              value: 'z://y/b',
          },
          object: {
              termType: 'NamedNode',
              value: 'z://y/c',
          },
          // optional
          graph: {
              termType: 'NamedNode',
              value: 'z://y/g',
          },
      }).verbose();  // '<z://y/a> <z://y/b> <z://y/c> <z://y/g> .'
      ```



<a name="function_comment" />

### [`factory.comment`](#function_comment)`(config: `[`#config/comment`](#config_comment)`)`
   - creates a special concise term string that tells the RDF writer to interpret the value associated with this key as a comment and to insert it into the output RDF document if the destination RDF format supports comments. Use this function in the predicate, subject or graph position of any concise triples or concise quads hash.
   - **returns** a [`#string/concise-term`](concise#string_c1)
   - *example:*
      ```js
      // snippets/write-comment.js
      const factory = require('@graphy/core.data.factory');
      const ttl_write = require('@graphy/content.ttl.write');
      
      let ds_writer = ttl_write({
         prefixes: {
            demo: 'http://ex.org/',
            dbo: 'http://dbpedia.org/ontology/',
            rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
            rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
         },
      });
      
      ds_writer.pipe(process.stdout);
      
      ds_writer.write({
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
      
      ds_writer.end();
      ```
   - *outputs:*
      ```turtle
      @prefix demo: <http://ex.org/> .
      @prefix dbo: <http://dbpedia.org/ontology/> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
      @prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
      
      # this is a comment
      demo:Banana a dbo:Fruit ;
         # so is this...
         rdfs:label "Banana"@en .
      
      
      ```



---

## Classes


<a name="class_generic-term" />

### abstract class [**GenericTerm**](#class_generic-term) implements [AnyTerm](#interface_any-term), [@RDFJS/Term](https://rdf.js.org/#term-interface)
**Properties:**
 - `.isGraphyTerm` : `boolean` = `true`

**Methods:**
 - `equals(other: `[`AnyTerm`](#interface_any-term)`)`
   - **returns** `boolean`
 - `verbose()`
   - **returns** [`#string/term_verbose`](#string_term-verbose)
 - `terse(prefix_map: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`)`
   - **returns** [`#string/term_terse`](#string_term-terse)
 - `concise(prefix_map: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`)`
   - **returns** [`#string/term_concise`](#string_term-concise)
 - `isolate()` -- creates a self-contained object representation of this term, devoid of references to other objects
   - **returns** [`#struct/term-isolate`](#struct_term-isolate)
   - *example:*
      ```js
      factory.namedNode('http://ex.org/test').isolate();  // {termType:'NamedNode', value:'http://ex.org/test'}
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

### class [**NamedNode**](#class_named-node) extends [GenericTerm](#class_generic-term) implements [AnyTerm](#interface_any-term), [@RDFJS/Term](https://rdf.js.org/#term-interface)
A class that represents an RDF named node.

**Properties implementing [@RDFJS/NamedNode](https://rdf.js.org/#namednode-interface)**:
 - `.termType` : `string` = `'NamedNode'`
 - `.value` : `string` -- the IRI of this named node

**Properties:**
 - `.isNamedNode` : `boolean` = `true` -- a faster alternative to test for NamedNode term types

**Methods:**
 - ... [see those inherited from GenericTerm](#class_generic-term)

<a name="class_blank-node" />

### class [**BlankNode**](#class_blank-node) extends [GenericTerm](#class_generic-term) implements [AnyTerm](#interface_any-term), [@RDFJS/Term](https://rdf.js.org/#term-interface)
A class that represents an RDF blank node.

**Properties implementing [@RDFJS/BlankNode](https://rdf.js.org/#blanknode-interface)**:
 - `.termType` : `string` = `'BlankNode'`
 - `.value` : `string` -- the label of this blank node (i.e., without leading `'_:'`)

**Properties:**
 - `.isBlankNode` : `boolean` = `true` -- a faster alternative to test for BlankNode term types
 - `.isAnonymous` : `boolean` -- whether or not this term was constructed from an _anonymous_ blank node

**Methods:**
 - ... [see those inherited from GenericTerm](#class_generic-term)

**Examples:**
```js
let kt_auto = factory.blankNode();
let kt_labeled = factory.blankNode('label');

kt_auto.isAnonymous;  // false
kt_label.isAnonymous;  // false

kt_auto.value;  // '_f4b39957_4619_459e_b954_a26f7b6da4a'
kt_label.value;  // 'label'

graphy.content.ttl.read('_:a <b> [] .', {
    data(y_quad) {
        y_quad.subject.isAnonymous;  // false
        y_quad.object.isAnonymous;  // true
    },
});
```

<a name="class_ephemeral-blank-node" />

### class [**EphemeralBlankNode**](#class_ephemeral-blank-node) extends [BlankNode](#class_blank-node) implements [AnyTerm](#interface_any-term), [@RDFJS/Term](https://rdf.js.org/#term-interface)
A class that represents an anonymous RDF blank node with ephemeral qualities. Primarily used for [writing](content.textual#verb_write).

**Properties implementing [@RDFJS/BlankNode](https://rdf.js.org/#blanknode-interface)**:
 - `.termType` : `string` = `'BlankNode'`
 - `.value` : `string` -- the label of a blank node (i.e., without leading `'_:'`) which changes everytime it is accessed

**Properties:**
 - ... [see those inherited from BlankNode](#class_blank-node)
 - `.isAnonymous` : `boolean` = `true` -- indicates this represents an anonymous blank node
 - `.isEphemeral` : `boolean` = `true` -- used to help indicate to interested parties that this blank node is ephemeral

**Methods:**
 - ... [see those inherited from BlankNode](#class_blank-node)
 - `equals(other: `[`AnyTerm`](#interface_any-term)`)`
   - these instances will never `.equals()` any other term no matter what
   - **returns** `false`

**Examples:**
```js
let kt_ephemeral = factory.ephemeral();

kt_ephemeral.isAnonymous;  // true
kt_ephemeral.isEphemeral;  // true

// changes everytime it is accessed
kt_ephemeral.value;  // '_66f0cc19_e551_4d82_8bf2_73329fb578b2'
kt_ephemeral.value;  // '_12ebb618_981b_45c9_a63b_a1e30170fcd1'
kt_ephemeral.value;  // '_4335c2d1_b7e2_4a43_ae81_a9f3a73e31ab'

// same applies to the verbose string
kt_ephemeral.verbose();  // '_:_82d116e8_352b_4ec3_8e3a_3b100a53b557'
kt_ephemeral.verbose();  // '_:_72b4a5ab_f4f0_494c_a432_c82b9d5aed50'
kt_ephemeral.verbose();  // '_:_1110a7e0_39fa_45ed_88c3_03912da0d93c'

// the terse string is the anonymous blank node token
kt_ephemeral.terse();  // '[]'

// will never equal itself
kt_ephemeral.equals(kt_ephemeral);  // false
```

<a name="class_default-graph" />

### class [**DefaultGraph**](#class_default-graph) extends [GenericTerm](#class_generic-term) implements [AnyTerm](#interface_any-term), [@RDFJS/Term](https://rdf.js.org/#term-interface)
A class that represents an RDF default graph.

**Properties implementing [@RDFJS/DefaultGraph](https://rdf.js.org/#defaultgraph-interface)**:
 - `.termType` : `string` = `'DefaultGraph'`
 - `.value` : `string` = `''` (an empty string)

**Properties:**
 - `.isDefaultGraph` : `boolean` = `true` -- a faster alternative to test for DefaultGraph term types

**Methods:**
 - ... [see those inherited from GenericTerm](#class_generic-term)

<a name="class_literal" />

### class [**Literal**](#class_literal) extends [GenericTerm](#class_generic-term) implements [AnyTerm](#interface_any-term), [@RDFJS/Term](https://rdf.js.org/#term-interface)
A class that represents an RDF literal.

**Properties implementing [@RDFJS/Literal](https://rdf.js.org/#literal-interface)**:
 - `.termType` : `string` = `'Literal'`
 - `.value` : `string` -- the contents of this literal
 - `.datatype` : [`NamedNode`](#class-namednode) -- the datatype of this literal (defaults to [rdf:langString](https://www.w3.org/1999/02/22-rdf-syntax-ns#langString))
 - `.language` : `#string/language-tag` -- the language tag associated with this literal (will be an empty string if it has no language)

**Properties:**
 - `.isLiteral` : `boolean` = `true` -- a faster alternative to test for Literal term types
 - `.isSimple` : `boolean` -- whether or not this Literal is 'simple', i.e., it has the datatype [xsd:string](https://www.w3.org/TR/xmlschema-2/#boolean) and no language tag.
 - `.isLanguaged` : `boolean` -- whether or not this Literal is 'languaged', i.e., it has some language tag and the datatype [rdf:langString](https://www.w3.org/TR/rdf11-concepts/#dfn-language-tagged-string).
 - `.isDatatyped` : `boolean` -- whether or not this Literal is 'datatyped', i.e., it has some datatype other than [xsd:string](https://www.w3.org/TR/xmlschema-2/#boolean) and no language tag.
 
**Methods:**
 - ... [see those inherited from GenericTerm](#class_generic-term)

<a name="class_literal-boolean" />

### class [**Literal_Boolean**](#class_literal-boolean) extends [Literal](#class_literal)
A class that represents an RDF literal that is an [xsd:boolean](https://www.w3.org/TR/xmlschema-2/#boolean).

**Properties:**
 - ... [see those inherited from Literal](#class_literal)
 - `.isBoolean` : `boolean` = `true` -- indicates that this object has a boolean value (i.e., `typeof this.number === 'boolean'`).
 - `.boolean` : `boolean` - the boolean value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class_literal)

**Examples:**
```js
let kt_true = factory.boolean(true);
kt_true = factory.boolean(1);
kt_true = factory.boolean('t');
kt_true = factory.boolean('true');
kt_true = factory.boolean('True');
kt_true = factory.boolean('TRUE');

let kt_false = factory.boolean(false);
kt_false = factory.boolean(0);
kt_false = factory.boolean('f');
kt_false = factory.boolean('false');
kt_false = factory.boolean('False');
kt_false = factory.boolean('FALSE');

kt_true.isolate();  // {termType:'Literal', value:'true', language:'', datatype:{termType:'NamedNode', value:'http://www.w3.org/2001/XMLSchema#boolean', }, }
kt_true.verbose();  // "true"^^<http://www.w3.org/2001/XMLSchema#boolean>
kt_true.terse();  // true
kt_true.isBoolean;  // true
kt_true.boolean;  // true
kt_true.value;  // true
```


<a name="class_literal-integer" />

### class [**Literal_Integer**](#class_literal-integer) extends [Literal](#class_literal)
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
yt_answer.isNumeric;  // true
yt_answer.isInteger;  // true
yt_answer.isDouble;  // undefined
yt_answer.number + 1;  // 43
yt_answer.value;  // '42'

factory.integer('12').number;  // 12
factory.integer(12.1);  // throws an Error: Number is not an integer: 12.1
factory.integer('12.1');  // throws an Error: Invalid integer string: 12.1
```


<a name="class_literal-decimal" />

### class [**Literal_Decimal**](#class_literal-decimal) extends [Literal](#class_literal)
A class that represents an RDF literal that is an [xsd:decimal](https://www.w3.org/TR/xmlschema-2/#decimal).

**Properties:**
 - ... [see those inherited from Literal](#class_literal)
 - `.isNumeric` : `boolean` = `true` -- indicates that this object has a numeric value (i.e., `typeof this.number === 'number'`).
 - `.isDecimal` : `boolean` = `true` -- indicates that this object has a decimal value (note that decimals can never encode +/- infinity nor NaN).
 - `.number` : `#number/double` - the numeric double value of this RDF literal.
 
**Methods:**
 - ... [see those inherited from Literal](#class_literal)

<a name="class_literal-double" />

### class [**Literal_Double**](#class_literal-double) extends [Literal](#class_literal)
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
yt_pi.value;  // '3.141592653589793'
yt_pi.isolate();  // '{termType:'Literal', value:'3.141592653589793', language:'', datatype:{termType:'NamedNode', value:'http://www.w3.org/2001/XMLSchema#double', }, }'
yt_pi.verbose();  // '"3.141592653589793"^^<http://www.w3.org/2001/XMLSchema#double>'
yt_pi.terse();  // '"3.141592653589793"^^<http://www.w3.org/2001/XMLSchema#double>'
yt_pi.isNumeric;  // true
yt_pi.isDouble;  // true
yt_pi.isInteger;  // undefined
yt_pi.number * 2;  // 6.283185307179586

graphy.content.ttl.read('<http://ex.org/unit-circle> <http://ex.org/area> 3.141592653589793 .', {
    data(y_quad) {
        y_quad.object.value;  // '3.141592653589793'
        y_quad.object.number;  // 3.141592653589793
        y_quad.object.datatype.value;  // 'http://www.w3.org/2001/XMLSchema#double'
    },
});
```

<a name="class_literal-positive-infinity" />

### class [**Literal_PositiveInfinity**](#class_literal-positive-infinity) extends [Literal_Double](#class_literal-double)
A class that represents an RDF literal that is positive infinity, which is of type [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Overriding properties:**
 - `.value` : `string` = `'INF'` -- the XSD-comformant string representation of this double.
 - `.number` : `number` = `Infinity` - the numeric positive infinity value of this RDF literal.

**Properties:**
 - ... [see those inherited from Literal_Double](#class_literal-double)
 - `.isInfinite` : `boolean` = `true` -- indicates that this object has an infinite numeric value (i.e., `Number.isFinite(this.number) === false`)
 
**Methods:**
 - ... [see those inherited from Literal_Double](#class_literal-double)

**Examples:**
```js
let yt_pos_inf = factory.double(Infinity);
yt_pos_inf.value;  // INF
yt_pos_inf.isolate();  // '{termType:'Literal', value:'INF', language:'', datatype:{termType:'NamedNode', value:'http://www.w3.org/2001/XMLSchema#double', }, }'
yt_pos_inf.verbose();  // '"INF"^^<http://www.w3.org/2001/XMLSchema#double>'
yt_pos_inf.terse();  // '"INF"^^<http://www.w3.org/2001/XMLSchema#double>'
yt_pos_inf.isNumeric;  // true
yt_pos_inf.isDouble;  // true
yt_pos_inf.isInfinite;  // true
yt_pos_inf.number;  // Infinity
```

<a name="class_literal-negative-infinity" />

### class [**Literal_NegativeInfinity**](#class_literal-negative-infinity) extends [Literal_Double](#class_literal-double)
A class that represents an RDF literal that is negative infinity, which is of type [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Overriding properties:**
 - `.value` : `string` = `'-INF'` -- the XSD-comformant string representation of this double.
 - `.number` : `number` = `-Infinity` - the numeric negative infinity value of this RDF literal.

**Properties:**
 - ... [see those inherited from Literal_Double](#class_literal-double)
 - `.isInfinite` : `boolean` = `true` -- indicates that this object has an infinite numeric value (i.e., `Number.isFinite(this.number) === false`)
 
**Methods:**
 - ... [see those inherited from Literal_Double](#class_literal-double)

**Examples:**
```js
let yt_neg_inf = factory.double(-Infinity);
yt_neg_inf.value;  // -INF
yt_neg_inf.isolate();  // '{termType:'Literal', value:'-INF', language:'', datatype:{termType:'NamedNode', value:'http://www.w3.org/2001/XMLSchema#double', }, }'
yt_neg_inf.verbose();  // '"-INF"^^<http://www.w3.org/2001/XMLSchema#double>'
yt_neg_inf.terse();  // '"-INF"^^<http://www.w3.org/2001/XMLSchema#double>'
yt_neg_inf.isNumeric;  // true
yt_neg_inf.isDouble;  // true
yt_neg_inf.isInfinite;  // true
yt_neg_inf.number;  // -Infinity
```

<a name="class_literal-nan" />

### class [**Literal_NaN**](#class_literal-nan) extends [Literal_Double](#class_literal-double)
A class that represents an RDF literal that is NaN, which is of type [xsd:double](https://www.w3.org/TR/xmlschema-2/#double).

**Overriding properties:**
 - `.value` : `string` = `'NaN'` -- the XSD-comformant string representation of this double.
 - `.number` : `number` = `NaN` - the numeric NaN value of this RDF literal.

**Properties:**
 - ... [see those inherited from Literal_Double](#class_literal-double)
 - `.isNaN` : `boolean` = `true` -- indicates that this object has an NaN numeric value (i.e., `Number.isNan(this.number) === true`)
 
**Methods:**
 - ... [see those inherited from Literal_Double](#class_literal-double)

**Examples:**
```js
let yt_nan = factory.double(NaN);
yt_nan.value;  // NaN
yt_nan.isolate();  // '{termType:'Literal', value:'NaN', language:'', datatype:{termType:'NamedNode', value:'http://www.w3.org/2001/XMLSchema#double', }, }'
yt_nan.verbose();  // '"NaN"^^<http://www.w3.org/2001/XMLSchema#double>'
yt_nan.terse();  // '"NaN"^^<http://www.w3.org/2001/XMLSchema#double>'
yt_nan.isNumeric;  // true
yt_nan.isDouble;  // true
yt_nan.isNaN;  // true
yt_nan.number;  // NaN
```

<a name="class_quad" />

### class [**Quad**](#class_quad) implements [@RDFJS/Quad](https://rdf.js.org/#quad-interface)
A class that represents an RDF quad.

**Properties:**
 - `.subject` : [`NamedNode`](#class_named-node)` | `[`BlankNode`](#named-node)
 - `.predicate` : [`NamedNode`](#class_named-node)
 - `.object` : [`NamedNode`](#class_named-node)` | `[`BlankNode`](#named-node)` | `[`Literal`](#class_literal)
 - `.graph` : [`NamedNode`](#class_named-node)` | `[`BlankNode`](#named-node)` | `[`DefaultGraph`](#class_default-graph)
 
**Methods:**
 - `equals(other: `[`AnyQuad`](#interface_any-quad)`)`
   - compare this RDF quad to another quad (which itself may be a simple object with the expected keys such as an [@RDFJS/Term](https://rdf.js.org/#term-interface) from another library).
   - **returns** a `boolean`
 - `verbose()`
   - **returns** a [#string/quad-verbose](#string_quad-verbose)
 - `terse([prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **returns** a [#string/quad-terse](#string_quad-terse)
 - `concise([prefixes: `[`#hash/prefix-mappings`](#hash_prefix-mappings)`])`
   - **returns** a plain object with the following key/value pairs:
     - `.subject`: [#string/quad-term](#string_term-concise)
     - `.predicate`: [#string/quad-term](#string_term-concise)
     - `.object`: [#string/quad-term](#string_term-concise)
     - `.graph`: [#string/quad-term](#string_term-concise)
 - `isolate()`
   - **returns** a [#struct/quad-isolate](#struct_quad-isolate)



**Examples:**
```js
graphy.content.ttl.read('<http://ex.org/unit-circle> <http://ex.org/area> 3.141592653589793 .', {
    data(y_quad) {
        y_quad.isolate();  // {subject:{termType:'NamedNode', value:'http://ex.org/unit-circle', }, predicate:{termType:'NamedNode', value:'http://ex.org/area', }, object:{termType:'Literal', value:'3.141592653589793', language:'', datatype:{termType:'NamedNode', value:'http://www.w3.org/2001/XMLSchema#decimal', }, }, graph:{termType:'DefaultGraph', value:'', }, }
        y_quad.verbose();  // <http://ex.org/unit-circle> <http://ex.org/area> "3.141592653589793"^^<http://www.w3.org/2001/XMLSchema#decimal> .
        y_quad.terse();  // <http://ex.org/unit-circle> <http://ex.org/area> 3.141592653589793 .
        y_quad.terse({ex:'http://ex.org/'});  // ex:unit-circle ex:area 3.141592653589793 .
    },
});
```

---

## Interfaces

<a name="interface_any-term" />

### interface [**AnyTerm**](#interface_any-term)
Any object with the given properties defined, including plain objects. By definition, any instance of an [@RDFJS/Term](https://rdf.js.org/#term-interface) or [GenericTerm](#class_generic-term) also meet these criteria.
 - _required properties_:
   - `.termType` : `'NamedNode' | 'BlankNode' | 'Literal' | 'DefaultGraph'`
   - `.value` : `string`
 - _optional properties_:
   - `.datatype` : [AnyTerm](#interface_any-term)
   - `.language` : [#string/language-tag](#string_language-tag)



<a name="interface_any-quad" />

### interface [**AnyQuad**](#interface_any-quad)
Any object with the given properties defined, including plain objects. By definition, any instance of an [@RDFJS/Quad](https://rdf.js.org/#quad-interface) or [Quad](#class_quad) also meet these criteria.
 - _required properties_:
   - `.subject` : [AnyTerm](#interface_any-term)
   - `.predicate` : [AnyTerm](#interface_any-term)
   - `.object` : [AnyTerm](#interface_any-term)
 - _optional properties_:
   - `.graph` : [AnyTerm](#interface_any-term)
