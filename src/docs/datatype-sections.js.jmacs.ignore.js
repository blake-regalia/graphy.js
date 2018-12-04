
datatype_sections({
  string: {
    'term-verbose': /* syntax: md */ `a string which is conformant with the grammar production \`subject\`, \`predicate\`, \`object\` or \`graphLabel\` as they are defined in the [N-Triples](https://www.w3.org/TR/n-triples/#n-triples-grammar) and [N-Quads](https://www.w3.org/TR/n-quads/#sec-grammar) specifications.`,
    'term-terse': /* syntax: md */ `a string which is conformant with the grammar production \`IRIREF\`, \`RDFLiteral\`, or \`PrefixedName\` as they are defined in the [Turtle](https://www.w3.org/TR/turtle/#sec-grammar) specification.`,
    'language-tag': /* syntax: md */ `a [BCP47 string](https://tools.ietf.org/html/bcp47).`,
  },
  struct: {
    'term-isolate': ,
  },
}
