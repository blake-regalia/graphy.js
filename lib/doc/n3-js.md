
 - [API Differences to N3.js](#n3-js)

 
----
<a name="n3-differences" />
## API Differences to N3.js @v0.4.5
If you're familiar with the N3.js parser, it's important to realize some of the differences about graphy's parser, which does the following things differently:
 - [Does not check IRIs, prefixed names, or blank node labels for invalid characters.](#performance)
 - All RDF terms are represented as JavaScript objects, as per the [RDFJS Data Interface](https://github.com/rdfjs/representation-task-force/blob/master/interface-spec.md#data-interfaces), rather than as strings.
 - Nested blank node property lists and RDF collections are emitted in the order they appear, rather than from the outside-in.
 - Anonymous blank nodes (e.g., `[]`) are assigned a label starting with the character `g`, rather than `b`. This is done in order to minimize the time spent testing and renaming conflicts with common existing blank node labels in the document (such as `_:b0`, `_:b1`, etc.).
