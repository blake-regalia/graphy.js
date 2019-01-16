

# [« CLI](cli) / Examples

Examples demonstrating some common use cases for the `graphy` command-line interface. For examples showcasing the JavaScript API, [see API/Examples here](api.examples).

## Contents
 - [Count number of distinct triples in Turtle document](#count-triples-turtle)
 - [Validate Turtle document(s)](#validate-turtle)


----

<a name="count-triples-turtle" />

### [Count number of distinct triples in Turtle document](#count-triples-turtle)
Anytime we are dealing with triples in RDF, we are really talking about quads without the _graph_ component. For example, when you load a Turtle document into a triplestore, you are either loading them into the default graph, or you are choosing some graph to load them into. In essence, a 'triplestore' is really just a set of quads (the graph being the fourth component to the triple).

Let's count the number of distinct triples (or in other words, the number of distinct quads in the default graph) in a Turtle document. In order to get a distinct count, we must push the data through a transform that will remove duplicates, such as the [`util.dataset.tree`](cli#command_util-dataset-tree) command. If we end the internal pipeline there, graphy recognizes the stream destination as `stdout` and prints each quad as a JSON object (i.e., a [line-delimted JSON stream](https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON)). Finally, we can simply pipe this data to another command that will count the number of lines, such as `wc -l`.

#### Testing it out on real data!
```bash
$ curl -s http://dbpedia.org/data/Banana.ttl | graphy content.ttl.read --pipe util.dataset.tree | wc -l
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
$ curl -s http://dbpedia.org/data/Banana.ttl | graphy content.ttl.read --validate > /dev/null
$ echo $?  # the exit code
```

Prints:
```
0
```

#### Testing with invalid input (`Banana.rdf` document is not Turtle):
```bash
$ curl -s http://dbpedia.org/data/Banana.rdf | graphy content.ttl.read --validate > /dev/null
$ echo $?  # the exit code
```

Prints:
```
invalid IRI: "?xml version="1.0" encoding="utf-8" ?"
1
```
