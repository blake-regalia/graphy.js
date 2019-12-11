# Performance Benchmarks
The following diagrams plot the mean value of 5 trials for each data point.

The X-axis units are in Millions of Quads, and correspond to the number of triples/quads fed into the process via stdin.
## Task: count
Count the number of statements in an RDF document.

**Tests:**
 - [N-Triples](#test_count_nt)
 - [Turtle](#test_count_ttl)


<a name="#test_count_nt" />

### Test: count / nt
The count task with N-Triples as input.

**Input File: Wikidata Data Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for count Task with N-Triples as input](chart/count_nt_wikidata_elapsed.png) | ![Performance Review of memory for count Task with N-Triples as input](chart/count_nt_wikidata_memory.png)

**Input File: DBpedia "Person Data" Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for count Task with N-Triples as input](chart/count_nt_persondata_en_elapsed.png) | ![Performance Review of memory for count Task with N-Triples as input](chart/count_nt_persondata_en_memory.png)

<a name="#test_count_ttl" />

### Test: count / ttl
The count task with Turtle as input.

**Input File: Wikidata Data Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for count Task with Turtle as input](chart/count_ttl_wikidata_elapsed.png) | ![Performance Review of memory for count Task with Turtle as input](chart/count_ttl_wikidata_memory.png)

**Input File: DBpedia "Person Data" Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for count Task with Turtle as input](chart/count_ttl_persondata_en_elapsed.png) | ![Performance Review of memory for count Task with Turtle as input](chart/count_ttl_persondata_en_memory.png)

## Task: distinct
Count the distinct number of triples/quads in an RDF document.

**Tests:**
 - [N-Triples](#test_distinct_nt)
 - [Turtle](#test_distinct_ttl)


<a name="#test_distinct_nt" />

### Test: distinct / nt
The distinct task with N-Triples as input.

**Input File: Wikidata Data Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for distinct Task with N-Triples as input](chart/distinct_nt_wikidata_elapsed.png) | ![Performance Review of memory for distinct Task with N-Triples as input](chart/distinct_nt_wikidata_memory.png)

**Input File: DBpedia "Person Data" Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for distinct Task with N-Triples as input](chart/distinct_nt_persondata_en_elapsed.png) | ![Performance Review of memory for distinct Task with N-Triples as input](chart/distinct_nt_persondata_en_memory.png)

<a name="#test_distinct_ttl" />

### Test: distinct / ttl
The distinct task with Turtle as input.

**Input File: Wikidata Data Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for distinct Task with Turtle as input](chart/distinct_ttl_wikidata_elapsed.png) | ![Performance Review of memory for distinct Task with Turtle as input](chart/distinct_ttl_wikidata_memory.png)

**Input File: DBpedia "Person Data" Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for distinct Task with Turtle as input](chart/distinct_ttl_persondata_en_elapsed.png) | ![Performance Review of memory for distinct Task with Turtle as input](chart/distinct_ttl_persondata_en_memory.png)

## Task: convert
Convert an RDF document from one serialization format to another.

**Tests:**
 - [N-Triples => Turtle](#test_convert_nt-ttl)
 - [Turtle => N-Triples](#test_convert_ttl-nt)


<a name="#test_convert_nt-ttl" />

### Test: convert / nt-ttl
The convert task with N-Triples as input and Turtle as output.

**Input File: Wikidata Data Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for convert Task with N-Triples as input and Turtle as output](chart/convert_nt-ttl_wikidata_elapsed.png) | ![Performance Review of memory for convert Task with N-Triples as input and Turtle as output](chart/convert_nt-ttl_wikidata_memory.png)

**Input File: DBpedia "Person Data" Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for convert Task with N-Triples as input and Turtle as output](chart/convert_nt-ttl_persondata_en_elapsed.png) | ![Performance Review of memory for convert Task with N-Triples as input and Turtle as output](chart/convert_nt-ttl_persondata_en_memory.png)

<a name="#test_convert_ttl-nt" />

### Test: convert / ttl-nt
The convert task with Turtle as input and N-Triples as output.

**Input File: Wikidata Data Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for convert Task with Turtle as input and N-Triples as output](chart/convert_ttl-nt_wikidata_elapsed.png) | ![Performance Review of memory for convert Task with Turtle as input and N-Triples as output](chart/convert_ttl-nt_wikidata_memory.png)

**Input File: DBpedia "Person Data" Dump**

Time Elapsed (s) | Memory Usage (MiB)
:---:|:---:
![Performance Review of elapsed for convert Task with Turtle as input and N-Triples as output](chart/convert_ttl-nt_persondata_en_elapsed.png) | ![Performance Review of memory for convert Task with Turtle as input and N-Triples as output](chart/convert_ttl-nt_persondata_en_memory.png)

