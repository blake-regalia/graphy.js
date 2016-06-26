
Although this module provides an API for interacting with RDF graphs, you may wish to only use graphy for its parsers - great! 


<a name="interaction-paradigm" />
## Use a query-like API to interact with RDF graphs
Interact with your static graph by mimicing the semantics of SPARQL property-paths and filters in a query-like manner:
```js
const graphy = require('graphy');
/* ttl_results = sparql('describe dbr:Banana ?exotics { ?exotics dbp:group dbr:Banana }') */
graphy.ttl.linked(ttl_results, (g) => {

    // traverse a link to its set of objects, then filter by language
    g.enter('dbr:Banana').cross('rdfs:label').literals('@en').values();  // ['Banana']
    
    // acheive the same result by accessing the data objects directly
    g.nodes['http://dbpedia.org/resource/Banana']
        .links['http://www.w3.org/2000/01/rdf-schema#label']
        .filter(term => term.isLiteral && term.language == 'en')
        .map(term => term.value());  // ['Banana']

    let banana = g.enter('dbr:Banana');  //  🍌
    
    // dbr:Banana ^dbp:group/rdfs:label ?label. FILTER(isLiteral(?label) && lang(?label)="en")
    banana.back('dbp:group').cross('rdfs:label').literals('@en')
        .values();  // ['Saba banana', 'Gros Michel banana', 'Red banana', ...]
    
    // or, use optional semantic access paths to trivialize things
    banana.is.dbp.group.of.nodes  // dbr:Banana ^dbp:group ?node. FILTER(isIri(?node))
        .terms.map(g.terse);  // ['dbr:Saba_banana', 'dbr:Señorita_banana', ...]
});
```
