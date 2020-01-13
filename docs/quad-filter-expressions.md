

# [« API](api) / Quad Filter Expressions
This document describes a language for expressing filters on RDF data at the quad-level, allowing for short filter expressions that cover a breadth of use-cases in lou of SPARQL queries.

> Stability: **Experimental**


## Introduction
This language was created out of a need for constructing quick and easy filters without having to write complex JavaScript expressions. These filters expressions are for testing a single quad/triple at a time, **unlike basic graph patterns** which might require storing quads in memory until the pattern can be evaluated. Instead, these filter expressions evaluate one at a time against a stream of quads/triples, similar to Triple Patterns.

In the following outline, a few use-case examples are given and followed by an equivalent graph pattern one might use in a SPARQL query.

#### Prefix Expansion in Regexes
The regex flag `c` can be used to denote that the pattern should be matched against the [Concise Term String](https://graphy.link/concise#string_c1) representation of the term, using the best prefix available.

**Example:**

Filter by triples where the IRI of the subject starts with the expanded prefix for `dbr:`, and the predicate is `rdf:type` and the object `dbo:Plant`:
```
/^dbr:/c; a; dbo:Plant
```

It is equivalent to the following SPARQL graph pattern:
```sparql
?s a dbo:Plant .
filter(strStarts(str(?s), str(dbr:))
```


#### And, Or, Not
The keywords `and` and `but` can be used interchangeably to specify that the term must satisfy both conditions. Likewise, `or` and `,` can be used interchangeably to specify that the term must satisfy one of the two conditions. The `and` and `but` keywords have precedence over the `or` and `,` keywords.

Finally, the `not` and `!` keywords can be used interchangeably as a unary operator to negate the condition that follows.

**Example:**

Filter by triples where the subject and object are the same term, while excluding the term `dbr:Banana`:
```
$object but not dbr:Banana
```

It is equivalent to the following SPARQL graph pattern:
```sparql
?s ?p ?s .
filter(?s != dbr:Banana)
```


#### Tags
You can specify to match a range of terms based on their type, such as `{node}`, `{named-node}`, `{blank-node}`, `{literal}`, `{simple-literal}`, `{languaged-literal}`, or `{datatyped-literal}`.

You can also combine tag selectors to specify the union of types, e.g., `{named-node, datatyped-literal}` will match _either_ a named node or a literal that has a datatype.

**Example:**

Filter by triples where the predicate is `dbo:date` and the object is a literal, but the literal does not have the datatype `xsd:dateTime`:
```
; dbo:date; {literal} but not ^xsd:dateTime
```

It is equivalent to the following SPARQL graph pattern:
```sparql
?thing dbo:date ?time

filter(
	isLiteral(?time) && datatype(?time) != xsd:dateTime
)
```

#### Unions
The union operator `|` can be used to specify multiple alternative conditions. When used with grouping `(` `)`, it allows you to branch conditionals and without having to combine the preceeding term expressions.

**Example:**

Filter by triples where the subject is `dbr:Orange` OR the subject is *not* `dbr:Banana` and is either (a) of type `dbo:Fruit` or `dbo:Plant`, or (b) has an `rdfs:label` to some literal that has the language tag `@en` or `@de`:
```
not dbr:Banana; (a; dbo:Fruit or dbo:Plant | rdfs:label; @en, @de) | dbr:Orange
```

It is equivalent to the following SPARQL graph pattern:
```sparql
	{
		{
			?s a dbo:Fruit
		} union {
			?s a dbo:Plant
		} union {
			?s rdfs:label ?label
			filter(
				isLiteral(?label) && (
					langMatches(lang(?label), "en")
					|| langMatches(lang(?label), "de")
				)
			)
		}

		filter(?s != dbr:Banana)
	} union {
		dbr:Orange ?p ?o
	}
```

#### Quad Filter Expression Grammar

<table class="tabular">
    <thead>
        <tr>
            <th>State</th>
            <th>Production</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Expression</td>
            <td><code>Subject? (';' Predicate? (';' Object? (';' Graph?)?)?)?</code></td>
        </tr>
        <tr>
            <td>Subject</td>
            <td><code>TermExpr</code></td>
        </tr>
        <tr>
            <td>Predicate</td>
            <td><code>TermExpr</code></td>
        </tr>
        <tr>
            <td>Object</td>
            <td><code>TermExpr</code></td>
        </tr>
        <tr>
            <td>Graph</td>
            <td><code>TermExpr</code></td>
        </tr>
        <tr>
            <td>TermExpr</td>
            <td><code>TermExprAnd ((',' | 'or') TermExpr)*</code></td>
        </tr>
        <tr>
            <td>TermExprAnd</td>
            <td><code>TermExprUnary (('and' | 'but') TermExprAnd)</code></td>
        </tr>
        <tr>
            <td>TermExprUnary</td>
            <td><code>('!' | 'not')? PrimaryExpr</code></td>
        </tr>
        <tr>
            <td>PrimaryExpr</td>
            <td><code>Term | Tags | '(' TermExpr ')' | Reference</code></td>
        </tr>
        <tr>
            <td>Term</td>
            <td><code>NamedNode | BlankNode | Regex</code></td>
        </tr>
        <tr>
            <td>Tags</td>
            <td><code>'{' TagSelector (',' TagSelector)* '}'</code></td>
        </tr>
        <tr>
            <td>TagSelector</td>
            <td><code>NODE | 'named' NODE? | 'blank' 's'? NODE? | LITERAL | 'datatype' [sd]? LITERAL? | 'lang' ('s' | 'uage' [sd]?)? LITERAL? | 'simple' 's'? LITERAL</code></td>
        </tr>
        <tr>
            <td>NODE</td>
            <td><code>('-' | '_')? 'node' 's'?</code></td>
        </tr>
        <tr>
            <td>LITERAL</td>
            <td><code>('-' | '_')? 'literal' 's'?</code></td>
        </tr>
        <tr>
            <td>Regex</td>
            <td><code>'/' REGEX_CONTENTS '/' REGEX_FLAG*</code></td>
        </tr>
        <tr>
            <td>REGEX_FLAG</td>
            <td><code>[ic]</code></td>
        </tr>
        <tr>
            <td>Reference</td>
            <td><code>'$s' 'ubject'? | '$p' 'redicate'? | '$o' 'bject'? | '$g' 'raph'?</code></td>
        </tr>
        <tr>
            <td>NamedNode</td>
            <td><code>AbsoluteIRI | PrefixedName | TypeAlias</code></td>
        </tr>
        <tr>
            <td>AbsoluteIRI</td>
            <td><code>'&lt;' .* '&gt;'</code></td>
        </tr>
        <tr>
            <td>PrefixedName</td>
            <td><code>([^_:@"^`][^:]*)? ':' [^ ]*</code></td>
        </tr>
        <tr>
            <td>TypeAlias</td>
            <td><code>'a'</code></td>
        </tr>
        <tr>
            <td>BlankNode</td>
            <td><code>'_' ':' [^ ]*</code></td>
        </tr>
        <tr>
            <td>Literal</td>
            <td><code>StringLiteral | Language | Datatype</code></td>
        </tr>
        <tr>
            <td>StringLiteral</td>
            <td><code>'"' STRING_CONTENTS '"' (Language | Datatype)</code></td>
        </tr>
        <tr>
            <td>Datatype</td>
            <td><code>'^' '^'? NamedNode</code></td>
        </tr>
        <tr>
            <td>Language</td>
            <td><code>'@' [a-zA-Z0-9-]+</code></td>
        </tr>
        <tr>
            <td>DefaultGraph</td>
            <td><code>'*'</code></td>
        </tr>
    </tbody>
</table>
