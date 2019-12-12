

# [« CLI](cli) / Examples

<div class="larger">
	Examples demonstrating some common use cases for the <code>$ graphy</code> command-line interface.
</div>

<div class="larger">
	For examples showcasing the JavaScript API, <a href="api.examples">see API/Examples here</a>.
</div>

<div class="larger">
	<a href="cli">The CLI reference documentation is available here.</a>
</div>

## Contents
 - [Count number of distinct triples in Turtle document](#count-triples-turtle)
 - [Validate Turtle document(s)](#validate-turtle)
 - [Pretty-print an RDF document](#pretty-print)
 - [Count the number of distinct subjects of a certain type](#distinct-subject)
 - [Split a large RDF document into smaller files](#split)
 - [Materialize the inverse relations for a symmetric property](#materialize-symmetric)


----

<a name="count-triples-turtle" />

### [Count number of distinct triples in Turtle document](#count-triples-turtle)
Anytime we are dealing with _triples_ in RDF, we can instead treat them as _quads without the graph_ component. For example, when you load a Turtle document into a triplestore, it will either load into the default graph or some named graph. In this case, a 'triplestore' is more like a set of quads since the graph acts as a fourth component to the triple.

Let's count the number of distinct _triples_ in a Turtle document. In order to get a distinct count, we must push the data through a transform that will remove duplicates, such as the [`distinct`](cli#command_distinct) command. To make things more portable, we can also specify to count the distinct number of _triples_ in order to ignore the graph component (which would be different than counting distinct number of quads in a TriG document).


#### Testing it out on real data!
```bash
$ curl -s http://dbpedia.org/data/Banana.ttl | graphy read -c ttl / distinct --triples
```

Prints:
```
214
```

Voila!

----

<a name="validate-turtle" />

### [Validate Turtle document(s)](#validate-turtle)
In this simple example, we demonstrate how to _validate_ a Turtle document read from `stdin`. Oftentimes in command-driven applications, we just want to know if something succeeded or not by using exit codes. In this example, we only care about the result of the validation; so let's just pipe `stdout` to `/dev/null` (`stderr` still prints to console).

#### Testing with valid input:
```bash
$ curl -s http://dbpedia.org/data/Banana.ttl | graphy read -c ttl > /dev/null
$ echo "exit code: $?"  # the exit code
```

Prints:
```
exit code: 0
```

#### Testing with invalid input (`Banana.rdf` document is not Turtle):
```bash
$ curl -s http://dbpedia.org/data/Banana.rdf | graphy read -c ttl > /dev/null
$ echo "exit code: $?"  # the exit code
```

Prints:
```
invalid IRI: "?xml version="1.0" encoding="utf-8" ?"
exit code: 1
```

----

<a name="pretty-print" />

### [Pretty-print an RDF document](#pretty-print)
Piping RDF data through the [`tree`](cli#command_tree) command organizes quads into a tree data structure by graph > subject > predicate > object. Piping this result to a writer format that uses a tree-like syntax (such as Turtle or TriG) has the effect of pretty-printing an otherwise "ugly" document.

```bash
$ curl http://dbpedia.org/data/Red_banana.ttl \
    |  graphy read -c ttl / tree / write -c ttl  > pretty.ttl
```


#### Turns this:

```turtle
@prefix dbo:  <http://dbpedia.org/ontology/> .
@prefix dbr:  <http://dbpedia.org/resource/> .
dbr:FHIA-01 dbo:wikiPageRedirects dbr:Goldfinger_banana .
dbr:Musa_goldfinger dbo:wikiPageRedirects dbr:Goldfinger_banana .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix wikipedia-en: <http://en.wikipedia.org/wiki/> .
wikipedia-en:Goldfinger_banana  foaf:primaryTopic dbr:Goldfinger_banana .
@prefix rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix yago: <http://dbpedia.org/class/yago/> .
dbr:Goldfinger_banana rdf:type  yago:Whole100003553 ,
    yago:Abstraction100002137 .
@prefix owl:  <http://www.w3.org/2002/07/owl#> .
dbr:Goldfinger_banana rdf:type  owl:Thing ,
    yago:LivingThing100004258 ,
    yago:VascularPlant113083586 ,
    yago:Plant100017222 ,
    dbo:Plant ,
    dbo:Species ,
    yago:Object100002684 .
@prefix wikidata: <http://www.wikidata.org/entity/> .
dbr:Goldfinger_banana rdf:type  wikidata:Q756 ,
    yago:PhysicalEntity100001930 ,
    wikidata:Q19088 ,
    yago:Variety108101085 ,
    yago:TaxonomicGroup107992450 ,
    wikidata:Q4886 ,
    yago:BiologicalGroup107941170 ,
    yago:Cultivar113084834 ,
    yago:WikicatBananaCultivars ,
    dbo:Eukaryote ,
    dbo:CultivatedVariety ,
    yago:Group100031264 ,
    yago:Organism100004475 .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
dbr:Goldfinger_banana rdfs:label  "FHIA-1"@it ,
    "Goldfinger banana"@en ;
  rdfs:comment  "La FHIA-01 nota anche come Goldfinger \u00E8 una cultivar di banana sviluppata dalla Fundaci\u00F3n Hondure\u00F1a de Investigaci\u00F3n Agr\u00EDcola nel 1988. Questa banana si distingue per il suo netto sapore di mela, grande produttivit\u00E0 e la notevole resistenza ai patogeni."@it ,
    "The Goldfinger banana (FHIA-01) is a banana cultivar developed in Honduras. The cultivar, developed at the Honduran Foundation for Agricultural Research (FHIA) by a team of scientists led by Phillip Rowe and Franklin Rosales, has been bred to be pest-resistant (specifically against the black sigatoka) and crop-yielding."@en ;
  owl:sameAs  <http://rdf.freebase.com/ns/m.026ytv3> .
@prefix dbpedia-wikidata: <http://wikidata.dbpedia.org/resource/> .
dbr:Goldfinger_banana owl:sameAs  dbpedia-wikidata:Q5580155 ,
    wikidata:Q5580155 .
@prefix yago-res: <http://yago-knowledge.org/resource/> .
dbr:Goldfinger_banana owl:sameAs  yago-res:Goldfinger_banana ,
    dbr:Goldfinger_banana .
@prefix dbpedia-it: <http://it.dbpedia.org/resource/> .
dbr:Goldfinger_banana owl:sameAs  dbpedia-it:FHIA-1 .
@prefix dct:  <http://purl.org/dc/terms/> .
@prefix dbc:  <http://dbpedia.org/resource/Category:> .
dbr:Goldfinger_banana dct:subject dbc:Banana_cultivars ;
  foaf:name "Musa 'FHIA-01 Goldfinger'"@en ;
  foaf:isPrimaryTopicOf wikipedia-en:Goldfinger_banana .
@prefix prov: <http://www.w3.org/ns/prov#> .
dbr:Goldfinger_banana prov:wasDerivedFrom <http://en.wikipedia.org/wiki/Goldfinger_banana?oldid=646170541> .
@prefix dbp:  <http://dbpedia.org/property/> .
dbr:Goldfinger_banana dbp:group dbr:Banana ;
  dbo:origin  dbr:Honduras ;
  dbo:wikiPageExternalLink  <http://www.fhia.org.hn/dowloads/info_hibridos/fhia01.pdf> ,
    <http://www.promusa.org/tiki-index.php?page=FHIA-01> ,
    <http://archive.idrc.ca/books/reports/V221/banana.html> ;
  dbo:abstract  "The Goldfinger banana (FHIA-01) is a banana cultivar developed in Honduras. The cultivar, developed at the Honduran Foundation for Agricultural Research (FHIA) by a team of scientists led by Phillip Rowe and Franklin Rosales, has been bred to be pest-resistant (specifically against the black sigatoka) and crop-yielding."@en ,
    "La FHIA-01 nota anche come Goldfinger \u00E8 una cultivar di banana sviluppata dalla Fundaci\u00F3n Hondure\u00F1a de Investigaci\u00F3n Agr\u00EDcola nel 1988. Questa banana si distingue per il suo netto sapore di mela, grande produttivit\u00E0 e la notevole resistenza ai patogeni."@it ;
  dbo:wikiPageRevisionID  646170541 ;
  dbo:wikiPageID  8279730 ;
  dbo:hybrid  dbr:Musa_balbisiana ,
    dbr:Musa_acuminata ,
    dbr:Banana ;
  dbp:cultivar  "'FHIA-01 Goldfinger'"^^rdf:langString .
@prefix ns16: <http://purl.org/linguistics/gold/> .
dbr:Goldfinger_banana ns16:hypernym dbr:Cultivar ;
  dbp:imageWidth  250 .
dbr:Goldfinger  dbo:wikiPageDisambiguates dbr:Goldfinger_banana .
```


#### Into this:

```turtle
@prefix dbo: <http://dbpedia.org/ontology/> .
@prefix dbr: <http://dbpedia.org/resource/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .
@prefix wikipedia-en: <http://en.wikipedia.org/wiki/> .
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
@prefix yago: <http://dbpedia.org/class/yago/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix wikidata: <http://www.wikidata.org/entity/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix dbpedia-wikidata: <http://wikidata.dbpedia.org/resource/> .
@prefix yago-res: <http://yago-knowledge.org/resource/> .
@prefix dbpedia-it: <http://it.dbpedia.org/resource/> .
@prefix dct: <http://purl.org/dc/terms/> .
@prefix dbc: <http://dbpedia.org/resource/Category:> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix dbp: <http://dbpedia.org/property/> .
@prefix ns16: <http://purl.org/linguistics/gold/> .

dbr:FHIA-01 dbo:wikiPageRedirects dbr:Goldfinger_banana .

dbr:Musa_goldfinger dbo:wikiPageRedirects dbr:Goldfinger_banana .

wikipedia-en:Goldfinger_banana foaf:primaryTopic dbr:Goldfinger_banana .

dbr:Goldfinger_banana rdf:type yago:Whole100003553, yago:Abstraction100002137, owl:Thing, yago:LivingThing100004258, yago:VascularPlant113083586, yago:Plant100017222, dbo:Plant, dbo:Species, yago:Object100002684, wikidata:Q756, yago:PhysicalEntity100001930, wikidata:Q19088, yago:Variety108101085, yago:TaxonomicGroup107992450, wikidata:Q4886, yago:BiologicalGroup107941170, yago:Cultivar113084834, yago:WikicatBananaCultivars, dbo:Eukaryote, dbo:CultivatedVariety, yago:Group100031264, yago:Organism100004475 ;
  rdfs:label "FHIA-1"@it, "Goldfinger banana"@en ;
  rdfs:comment "La FHIA-01 nota anche come Goldfinger è una cultivar di banana sviluppata dalla Fundación Hondureña de Investigación Agrícola nel 1988. Questa banana si distingue per il suo netto sapore di mela, grande produttività e la notevole resistenza ai patogeni."@it, "The Goldfinger banana (FHIA-01) is a banana cultivar developed in Honduras. The cultivar, developed at the Honduran Foundation for Agricultural Research (FHIA) by a team of scientists led by Phillip Rowe and Franklin Rosales, has been bred to be pest-resistant (specifically against the black sigatoka) and crop-yielding."@en ;
  owl:sameAs <http://rdf.freebase.com/ns/m.026ytv3>, dbpedia-wikidata:Q5580155, wikidata:Q5580155, yago-res:Goldfinger_banana, dbr:Goldfinger_banana, dbpedia-it:FHIA-1 ;
  dct:subject dbc:Banana_cultivars ;
  foaf:name "Musa 'FHIA-01 Goldfinger'"@en ;
  foaf:isPrimaryTopicOf wikipedia-en:Goldfinger_banana ;
  prov:wasDerivedFrom <http://en.wikipedia.org/wiki/Goldfinger_banana?oldid=646170541> ;
  dbp:group dbr:Banana ;
  dbo:origin dbr:Honduras ;
  dbo:wikiPageExternalLink <http://www.fhia.org.hn/dowloads/info_hibridos/fhia01.pdf>, <http://www.promusa.org/tiki-index.php?page=FHIA-01>, <http://archive.idrc.ca/books/reports/V221/banana.html> ;
  dbo:abstract "The Goldfinger banana (FHIA-01) is a banana cultivar developed in Honduras. The cultivar, developed at the Honduran Foundation for Agricultural Research (FHIA) by a team of scientists led by Phillip Rowe and Franklin Rosales, has been bred to be pest-resistant (specifically against the black sigatoka) and crop-yielding."@en, "La FHIA-01 nota anche come Goldfinger è una cultivar di banana sviluppata dalla Fundación Hondureña de Investigación Agrícola nel 1988. Questa banana si distingue per il suo netto sapore di mela, grande produttività e la notevole resistenza ai patogeni."@it ;
  dbo:wikiPageRevisionID "646170541"^^<http://www.w3.org/2001/XMLSchema#integer> ;
  dbo:wikiPageID "8279730"^^<http://www.w3.org/2001/XMLSchema#integer> ;
  dbo:hybrid dbr:Musa_balbisiana, dbr:Musa_acuminata, dbr:Banana ;
  dbp:cultivar "'FHIA-01 Goldfinger'"^^rdf:langString ;
  ns16:hypernym dbr:Cultivar ;
  dbp:imageWidth "250"^^<http://www.w3.org/2001/XMLSchema#integer> .

dbr:Goldfinger dbo:wikiPageDisambiguates dbr:Goldfinger_banana .
```


----

<a name="distinct-subject" />

### [Count the number of distinct subjects of a certain type](#distinct-subject)

Use the [filter](cli#command_filter) command in combination with [distinct](#cli#command_distinct) to count the number of distinct subjects that are of a certain type (say, `dbo:Place`):

```bash
$ graphy read -c nq / filter -x '; a; dbo:Place' / distinct --subjects   < places.nq
```

This is equivalent to the SPARQL query:
```sparql
select (count(distinct ?subject) as ?countSubjects) {
  ?subject a dbo:Place .
}
```


----

<a name="split" />

### [Split a large RDF document into smaller files](#split)

By using the [skip](cli#command_skip) and [head](cli#command_head) commands, you can extract a portion of an RDF document by specifying the number of quads to trim, preserving prefixes and without losing comments.

```bash
# skip the first 4 million quads, then extract the 2 million that follow
$ graphy read -c ttl / skip 4e6 / head 2e6 / write -c ttl  < in.ttl  > view-2M.ttl
```

----

<a name="materialize-symmetric" />

### [Materialize the inverse relations for a symmetric property](#materialize-symmetric)

The [filter](cli#command_filter) and [transform](cli#command_transform) command are capable of incredible things when used together. In this example, let's take all the `owl:sameAs` relations where the object is a _node_ and different from the subject, then materialize the inverse relation (object => subject).

```bash
$ graphy read / filter -x '!$object; owl:sameAs; {node}'   \
    / transform -j  't => [t.o, t.p, t.s]'                 \
    / write -c ttl   < input.ttl   > output.ttl
```

This is equivalent to the SPARQL CONSTRUCT query:
```sparql
construct {
  ?object ?predicate ?object
} where {
  ?subject owl:sameAs ?object .

  filter(?subject != ?object)
  filter(isIRI(?object) || isBlank(?object))
}
```
