

# [« API](api) / Examples

Examples demonstrating some common use cases for the `graphy` JavaScript API. For examples showcasing the command-line interface, [see CLI/Examples here](cli.examples).

## Contents
 - [Count number of statements in Turtle document](#count-statements-turtle)
 - [Count number of distinct triples in Turtle document](#count-triples-turtle)
 - [Validate Turtle document(s)](#validate-turtle)


----

<a name="count-statements-turtle" />

### [Count number of statements in Turtle document](#count-statements-turtle)
To get started, let's write a simple Node.js script that counts the number of statements in a Turtle document.

```js
// count-statements.js
const ttl_read = require('@graphy/content.ttl.read');

let c_statements = 0;
process.stdin.pipe(ttl_read())
    .on('data', () => {
        c_statements += 1;
    })
    .on('eof', () => {
        console.log(`${c_statements} statements`);
    });
});
```

#### Counting:
```bash
$ echo "
    <a> <b> <c> .
    <a> <b> <c> .
" | node count.js
```

Prints:
```
2 statements
```

> Notice how the result from this experiment shows that we are counting the number of _statements_ in the input. We are more likely interested in counting the number of distinct triples or quads, which we show in the next example.

----

<a name="count-triples-turtle" />

### [Count number of distinct triples in Turtle document](#count-triples-turtle)
Anytime we are dealing with triples in RDF, we are really talking about quads without the _graph_ component. For example, when you load a Turtle document into a triplestore, you are either loading them into the default graph, or you are choosing some graph to load them into. In essence, a 'triplestore' is really just a set of quads (the graph being the fourth component to the triple).

Let's count the number of distinct triples (or in other words, the number of distinct quads in the default graph) in a Turtle document. In order to get a distinct count, we must load the data into a structure that will remove duplicates, such as the [DatasetTree](util.dataset.tree) package.

```js
// count-quads.js
// since we are using multiple packages from graphy, we can load them from the super module
const graphy = require('graphy');
const read = graphy.content.ttl.read;
const tree = graphy.util.dataset.tree;

// we are going to perform an asynchronous task
(async() => {
    // pipe data from stdin thru the Turtle reader
    let k_tree = await process.stdin.pipe(read())
        // pipe the RDF data thru the DatasetTree package
        .pipe(tree())
        // use `.until(event, true)` to await an event and return the stream
        .until('finish', true);

    // at this point, we have awaited for the tree to emit 'finish' and have loaded all quads
    console.log(`${k_tree.size} triples`);
})();
```

#### Testing it out on real data!
```bash
$ curl http://dbpedia.org/data/Banana.ttl | node count.js
```

Prints:
```
214 statements
```

> You can also use the CLI to quickly count the number of distinct quads/triples with one line of bash code; [see the CLI example here](cli.examples#count-triples-turtle)

----

<a name="validate-turtle" />

### [Validate Turtle document(s)](#validate-turtle)
In this simple example, we demonstrate how to _validate_ Turtle sent to a mock Node.js web server using [Express](https://expressjs.com/).

```js
const app = require('express')();
const ttl_read = require('@graphy/content.ttl.read');

app.post('/validate', (ds_req, ds_res) => {
    ds_req.pipe(ttl_read({
        validate: true,
    }))
        .on('error', (e_read) => {
            ds_res.status(400).end(`Invalid Turtle document: ${e_read.message}`);
        })
        .on('eof', () => {
            ds_res.status(200).end('Valid Turtle!');
        });
});

app.listen(3210);
```

#### Testing with invalid input:
```bash
$ curl -X POST --data "<This> <is> <bad input> ." http://localhost:3210/validate
```

Prints:
```
Invalid Turtle document: invalid IRI: "bad input"
```

#### Testing with valid input:
```bash
$ echo "
    @prefix : <http://ex.org/> .
    :This :is :good_input .
" | curl -X POST --data @- http://localhost:3210/validate
```

Prints:
```
Valid Turtle!
```

