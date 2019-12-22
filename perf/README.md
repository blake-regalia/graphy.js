# Performance Benchmarks
The following diagrams plot the mean value of 5 trials for each data point.

The X-axis units are in Millions of Quads, and correspond to the number of triples/quads fed into the process via stdin.

There are usually two modes for `graphy`, the default mode with validation enabled for reading, and ['relaxed' mode](https://graphy.link/content.textual#config_read-no-input), which skips validation for faster read speeds.

All Turtle input files are using prefixed names for identifiers when possible.

Memory-intensive tasks were run with the `--max-old-space-size=8192` node.js option (e.g., the [distinct task](#distinct-task)). Some charts show an exponential jump in time due to the fact that V8's GC starts aggressively trying to free up memory.

Want to see how other libraries stack up? Feel free to [open an issue](https://github.com/blake-regalia/graphy.js/issues).

## Versions
 - [N3.js](https://github.com/rdfjs/N3.js) v1.3.5
 - [graphy](https://github.com/blake-regalia/graphy.js) v4.0.1


## Table of Contents
 - [Count Task](#count-task) -- Count the number of statements in an RDF document.
 - [Distinct Task](#distinct-task) -- Count the distinct number of triples/quads in an RDF document.
 - [Convert Task](#convert-task) -- Convert an RDF document from one serialization format to another.

------------

## Count Task
Count the number of statements in an RDF document.

**Test Flavors:**
 - With [N-Triples as input](#test_count_nt)
 - With [Turtle as input](#test_count_ttl)


<a name="#test_count_nt" />

### Count Task With N-Triples as input

Input File: Wikidata Data Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for count Task with N-Triples as input](chart/count_nt_wikidata_elapsed.png) | ![Performance Review of memory for count Task with N-Triples as input](chart/count_nt_wikidata_memory.png)

Input File: DBpedia "Person Data" Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for count Task with N-Triples as input](chart/count_nt_persondata_en_elapsed.png) | ![Performance Review of memory for count Task with N-Triples as input](chart/count_nt_persondata_en_memory.png)

<a name="#test_count_ttl" />

### Count Task With Turtle as input

Input File: Wikidata Data Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for count Task with Turtle as input](chart/count_ttl_wikidata_elapsed.png) | ![Performance Review of memory for count Task with Turtle as input](chart/count_ttl_wikidata_memory.png)

Input File: DBpedia "Person Data" Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for count Task with Turtle as input](chart/count_ttl_persondata_en_elapsed.png) | ![Performance Review of memory for count Task with Turtle as input](chart/count_ttl_persondata_en_memory.png)

------------

## Distinct Task
Count the distinct number of triples/quads in an RDF document.

**Test Flavors:**
 - With [N-Triples as input](#test_distinct_nt)
 - With [Turtle as input](#test_distinct_ttl)


<a name="#test_distinct_nt" />

### Distinct Task With N-Triples as input

Input File: Wikidata Data Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for distinct Task with N-Triples as input](chart/distinct_nt_wikidata_elapsed.png) | ![Performance Review of memory for distinct Task with N-Triples as input](chart/distinct_nt_wikidata_memory.png)

Input File: DBpedia "Person Data" Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for distinct Task with N-Triples as input](chart/distinct_nt_persondata_en_elapsed.png) | ![Performance Review of memory for distinct Task with N-Triples as input](chart/distinct_nt_persondata_en_memory.png)

<a name="#test_distinct_ttl" />

### Distinct Task With Turtle as input

Input File: Wikidata Data Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for distinct Task with Turtle as input](chart/distinct_ttl_wikidata_elapsed.png) | ![Performance Review of memory for distinct Task with Turtle as input](chart/distinct_ttl_wikidata_memory.png)

Input File: DBpedia "Person Data" Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for distinct Task with Turtle as input](chart/distinct_ttl_persondata_en_elapsed.png) | ![Performance Review of memory for distinct Task with Turtle as input](chart/distinct_ttl_persondata_en_memory.png)

------------

## Convert Task
Convert an RDF document from one serialization format to another.

**Test Flavors:**
 - With [N-Triples as input => Turtle as output](#test_convert_nt-ttl)
 - With [Turtle as input => N-Triples as output](#test_convert_ttl-nt)


<a name="#test_convert_nt-ttl" />

### Convert Task With N-Triples as input => Turtle as output

Input File: Wikidata Data Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for convert Task with N-Triples as input => Turtle as output](chart/convert_nt-ttl_wikidata_elapsed.png) | ![Performance Review of memory for convert Task with N-Triples as input => Turtle as output](chart/convert_nt-ttl_wikidata_memory.png)

Input File: DBpedia "Person Data" Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for convert Task with N-Triples as input => Turtle as output](chart/convert_nt-ttl_persondata_en_elapsed.png) | ![Performance Review of memory for convert Task with N-Triples as input => Turtle as output](chart/convert_nt-ttl_persondata_en_memory.png)

<a name="#test_convert_ttl-nt" />

### Convert Task With Turtle as input => N-Triples as output

Input File: Wikidata Data Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for convert Task with Turtle as input => N-Triples as output](chart/convert_ttl-nt_wikidata_elapsed.png) | ![Performance Review of memory for convert Task with Turtle as input => N-Triples as output](chart/convert_ttl-nt_wikidata_memory.png)

Input File: DBpedia "Person Data" Dump

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for convert Task with Turtle as input => N-Triples as output](chart/convert_ttl-nt_persondata_en_elapsed.png) | ![Performance Review of memory for convert Task with Turtle as input => N-Triples as output](chart/convert_ttl-nt_persondata_en_memory.png)

