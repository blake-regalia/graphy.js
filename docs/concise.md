
# Concise Terms, Triples and Quads
This document describes a language for concisely expressing RDF data from within a JavaScript programming environment, allowing for a convenient technique of mixing in data from live variables and objects to create RDF quads and RDF terms such as named nodes, blank nodes, and literals.

<a name="c1-string" />

## Concise Term String (c1-string)
The concise term string defines a syntax that allows developers to quickly create RDF terms such as named nodes, blank nodes, and literals from a simple string. The syntax should be familiar to those who use Turtle.
 
The first character of the string dictates what type of Term it is:
 - `>` -- NamedNode (the absolute IRI)
 - `_` -- BlankNode
 - `@` -- Literal w/ language tag
 - `^` -- Literal w/ datatype
 - `"` -- plain Literal
 - `\`` *(backtick)* -- directive
 - *else* -- NamedNode (prefixed name)

#### Named Nodes: No Closing Brackets
Notice that the first character to indicate an absolute IRI is the right-angle bracket `>`. This was selected intentionally to remind you that the format does not have a closing bracket for absolute IRIs.

```js
let p_iri = 'http://dbpedia.org/resource/9/11_Memorial_(Arizona)';
let y_node = factory.term('>'+p_iri);
```

#### Blank Nodes: When to Use Them
There's not much need to create blank nodes using concise-term strings since you can implicitly create them using [concise-triple](#c3-hash) and [concise-quad](#c4-hash) hashes. However, if you need to create new triples where the subject is a blank node, or need to use labelled blank nodes, this syntax will allow you to create them explicitly.

```js
ley y_triple = factory.triples({
	'_:b1': {
		'>http://ex.org/has': '_:b2',
	},
});
```


#### Literals: No Escaping Needed
Since only one term can be expressed in a string, the syntax does not need to have delimiters for the start or end of certain sequences and so the contents of a Literal do not need to be escaped. For example, a plain RDF literal can be expressed like so:

```js
let s_expression = 'Hello World!';
let y_greeting = factory.term('"'+s_expression);
```

Here, the double quote at position `0` indicates that this is a plain literal, and that the contents follow (until the end of the string). If you wanted to add quote characters to the contents of the RDF literal, it would simply look like this:

```js
let s_expression = '"Hello World!"';
let y_greeting = factory.term('"'+s_expression);
```

#### Prefixed Names: All Characters Allowed
The 'suffix' of prefixed names may contain any character, such as `/`, `.`, `,`, and so on, without having to worry about the way it is serialized to the output destination. Invalid IRI characters (`[#x00-#x20<>"{}|^`\]`) will be automatically converted to URI escape sequences.

```js
let h_prefixes = {dbr:'http://dbpedia.org/resource/'};
let y_node = factory.term('dbr:9/11_Memorial_(Arizona)', h_prefixes);
y_node.value;  // 'http://dbpedia.org/resource/9/11_Memorial_(Arizona)'
```

#### Directives
Directives allow for special events to be passed to the output serializer at a given location within the document, such as for the insertion of comments and newlines. See [factory.comment](api.data.factory#function-comment) and [factory.newlines](api.data.factory#function-comment) for creating directive strings which can be used as keys in concise triples and concise quads hashes.


#### Grammar
| State            | Production                                           |
| ---------------- | ---------------------------------------------------- |
| Term             | `NamedNode | BlankNode | Literal | Directive`        |
| NamedNode        | `AbsoluteIRI` | `PrefixedName` | `TypeAlias`         |
| AbsoluteIRI      | `'>' .*`                                             |
| PrefixedName     | `([^_:@"^\`][^:]*)? ':' .*`                          |
| TypeAlias        | `'a'`                                                |
| BlankNode        | `'_' ':' .*`                                         |
| Literal          | `PlainLiteral | DatatypedLiteral | LanguagedLiteral` |
| PlainLiteral     | `'"' .*`                                             |
| DatatypedLiteral | `'^' NamedNode PlainLiteral`                         |
| LanguagedLiteral | `'@' [a-zA-Z0-9-]+ PlainLiteral`                     |
| Directive        | `'\` '[' uuid_v4 ']' JSON `                          |

----

<a name="c3-hash" />

## Concise Triples Hash (c3-hash)
A concise triples hash describes a plain object whose keys represent the *subject* of a set of triples, and values represent the predicates and objects, collections, or nested blank nodes related to the subject/predicate pair in a tree-like structure.

**Example:**
```js
// snippets/concise-triples.js
const factory = require('@graphy-dev/api.data.factory');
const ttl_write = require('@graphy-dev/content.ttl.write');

let k_writer = ttl_write({
   prefixes: {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      owl: 'http://www.w3.org/2002/07/owl#',
      dbr: 'http://dbpedia.org/resource/',
      dbo: 'http://dbpedia.org/ontology/',
      demo: 'http://ex.org/demo#',
      '': 'http://ex.org/owl#',
   },
});

k_writer.pipe(process.stdout);

// the following demonstrates the use of a concise triples hash
k_writer.write({
   // triples about dbr:Banana
   'dbr:Banana': {
      // `a` is shortcut for rdf:type
      a: 'dbo:Plant',

      // list of objects
      'rdfs:label': ['@en"Banana', '@fr"Banane', '@es"Plátano'],

      // nested array becomes an RDF collection
      'demo:steps': [
         ['demo:Peel', 'demo:Slice', 'demo:distribute'],
      ],
   },

   // example from OWL 2 primer: https://www.w3.org/TR/owl2-primer/#Property_Restrictions
   ':HappyPerson': {
      a: 'owl:Class',
      'owl:equivalentClass': {
         a: 'owl:Class',
         'owl:intersectionOf': [
            [
               {
                  a: 'owl:Restriction',
                  'owl:onProperty': ':hasChild',
                  'owl:allValuesFrom': ':Happy',
               },
               {
                  a: 'owl:Restriction',
                  'owl:onProperty': ':hasChild',
                  'owl:someValuesFrom': ':Happy',
               },
            ],
         ],
      },
   },
});

k_writer.end();
```

**Outputs:**
```turtle
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix dbr: <http://dbpedia.org/resource/> .
@prefix dbo: <http://dbpedia.org/ontology/> .
@prefix demo: <http://ex.org/demo#> .
@prefix : <http://ex.org/owl#> .

 .

```

----

<a name="c4-hash" />

## Concise Quads Hash (c4-hash)
A concise triple hash describes a plain object whose keys represent the *graph* of a triple, and values represent the subjects, predicates and objects, collections, or nested blank nodes related to the original triple in a tree-like structure.
