

# [« API](api) / Command Line Interface
This document describes the command-line interface for the binary `graphy` available from npm.

### `npm i -g graphy`

<br />
## Internal Pipeline
The `graphy` CLI works by pushing RDF data through a series of [internal transforms](#commands), starting with a single input on `stdin` (or instead, [multiple inputs](#inputs)) and ending with a single output on `stdout`. This internal pipeline feature allows for efficient, high-bandwidth transformation of RDF data.


### `Usage: graphy COMMAND [--pipe COMMAND]*`


## Commands

 - `content TYPE VERB [OPTIONS]`
   - select a content handler command by its content-type and verb.
   - **Type:** `-t, --type`
     - argument to [super.content()](super#function_content).
   - **Verb:** `-v, --verb`
     - which verb to access on the given content handler, e.g., `read`, `write`, etc.
   - *examples:*
     ```bash
     $ graphy content --type=text/turtle --verb=read < input.ttl

     $ graphy content -t application/n-triples -v read < input.nt
     ```

 - `content.FORMAT.read [OPTIONS]`
   - `N-to-N<`[`StringStream`](#class_string-stream)`, `[`QuadStream`](#class_quad-stream)`>`: maps 1 or more utf8-encoded input streams into 1 or more object output streams of RDF [Quad](core.data.factory#class_quad) objects.
   - **Format:**
     - `nt` -- read N-Triples document(s), e.g., `graphy content.nt.read`
     - `nq` -- read N-Quads document(s), e.g., `graphy content.nq.read`
     - `ttl` -- read Turtle document(s), e.g., `graphy content.ttl.read`
     - `trig` -- read TriG document(s), e.g., `graphy.content.trig.read`
   - **Options:**
     - `-b, --base, --base-uri` -- sets the starting base URI for the RDF document, [see more here](content.textual#config_read-no-input).
     - `-v, --validate` -- whether or not to perform validation on tokens, [see more here](content.textual#config_read-no-input).

 - `content.FORMAT.write [OPTIONS]`
   - `N-to-1<`[`WritableDataEventStream`](#class_writable-data-event-stream)`, `[`StringStream`](#class_string-stream)`>` -- maps 1 or more object input streams of [WritableDataEvent](content.textual#interface_writable-data-event) objects into 1 utf8-encoded output stream.
   - **Format:**
     - `nt` -- write an N-Triples document, e.g., `graphy content.nt.write`
     - `nq` -- write an N-Quads document, e.g., `graphy content.nq.write`
     - `ttl` -- write a Turtle document, e.g., `graphy content.ttl.write`
     - `trig` -- write a TriG document, e.g., `graphy.content.trig.write`
   - **Options:**
     - _none_`;


 - `util.dataset.tree [OPTIONS] [COMMAND]`
   - use the [DatasetTree](util.dataset.tree) package to perform set algebra or to remove duplicates from a single data source.
   - **Commands:**
     - `` -- _(no command)_
       - `N-to-N<`[`QuadStream`](#class_quad-stream)`, `[`AnyDestination`](#class_any-destination)`>` -- maps 1 or more object input streams of [Quad](core.data.factory#class_quad) objects into 1 or more object output streams of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream(s). This transformation puts each dataset into its own tree, effectively removing duplicate quads and organizing quads into a tree of `graph --> subject --> predicate --> object`. [See example](#example_reduce).
     - `-u, --union`
       - `N-to-1<`[`QuadStream`](#class_quad-stream)`, `[`AnyDestination`](#class_any-destination)`>` -- accepts 1 or more object input streams of [Quad](core.data.factory#class_quad) objects, performs the union of all datasets, and then pipes the result into 1 object output stream of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream.
     - `-i, --intersection`
       - `N-to-1<`[`QuadStream`](#class_quad-stream)`, `[`AnyDestination`](#class_any-destination)`>` -- accepts 1 or more object input streams of [Quad](core.data.factory#class_quad) objects, performs the intersection of all datasets, and then pipes the result into 1 object output stream of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream.
     - `-m, --minus, --subtract, --subtraction`
       - `2-to-1<`[`QuadStream`](#class_quad-stream)`, `[`AnyDestination`](#class_any-destination)`>` -- accepts exactly 2 input streams of [Quad](core.data.factory#class_quad) objects, performs the subtraction of the second input from the first, and then pipes the result into 1 object output stream of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream.
     - `-d, --diff, --difference`
       - `2-to-1<`[`QuadStream`](#class_quad-stream)`, `[`AnyDestination`](#class_any-destination)`>` -- accepts exactly 2 input streams of [Quad](core.data.factory#class_quad) objects, computes the difference between the two inputs, and then pipes the result into 1 object output stream of [Quad](core.data.factory#class_quad) objects, or [WritableDataEvent](content.textual#interface_writable-data-event) objects, depending on the capabilities of the destination stream.

## Inputs
By default, `graphy` expects a single input stream on `stdin`, which it will forward through the internal pipeline. Some commands may allow for or even expect multiple inputs (e.g., for computing the difference between two datasets).

### `--pipe=[PATH]`
If you are simply piping in multiple input files, you can use the `--input` options like so:
```bash
$ graphy --input=original.ttl --input=modified.ttl \
	content.ttl.read \
	--pipe util.dataset.tree --difference \
	--pipe content.ttl.write \
	> difference.ttl
```

### Process Substitution
If you need to execute other commands before passing in multiple inputs, you can use [process substitution](http://www.tldp.org/LDP/abs/html/process-sub.html) (supported in bash) like so:
```bash
$ DBPEDIA_EN_URL="http://downloads.dbpedia.org/2016-10/core-i18n/en"
$ graphy \
	content.ttl.read \
	--pipe util.dataset.tree --union \
	--pipe content.ttl.write \
	<(curl "$DBPEDIA_EN_URL/topical_concepts_en.ttl.bz2" | bzip2 -d) \
	<(curl "$DBPEDIA_EN_URL/uri_same_as_iri_en.ttl.bz2" | bzip2 -d) \
	> union.ttl
```

<a name="classes" />

## Classes

<a name="class_string-stream" />

### class **StringStream**
A stream of utf8-encoded strings. This always applies to `stdin` and `stdout`.


<a name="class_quad-stream" />

### class **QuadStream**
A stream of [Quad](core.data.factory#class_quad) objects.


<a name="class_writable-data-event-stream" />

### class **WritableDataEventStream**
A stream of [WritableDataEvent](content.textual#interface_writable-data-event) objects.


<a name="class_any-destination" />

### class **AnyDestination**
Automatically determine which mode is best suited for the given destination stream. Compatible with [`QuadStream`](#class_quad-stream)`, `[`WritableDataEventStream`](#class_writable-data-event-stream)` and [`StringStream`](#class_string-stream). In the case of StringStream, each object is converted to its JSON equivalent on a single line, followed by a newline `'\n'` (i.e., [Line-delimited JSON](https://en.wikipedia.org/wiki/JSON_streaming#Line-delimited_JSON)). 


## Examples

<a name="example_reduce" />

### Pretty-print an RDF document
Piping RDF data through the DatasetTree transform organizes quads into a hierarchy by graph, subject, predicate and object. Piping this result to a writer format that uses a tree-like syntax (such as Turtle or TriG) has the effect of pretty-printing an otherwise "ugly" document.

```bash
$ graphy \
	content.ttl.read --pipe \
	util.dataset.tree --pipe \
	content.ttl.write < ugly.ttl > pretty.ttl
```
