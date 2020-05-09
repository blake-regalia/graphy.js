# ROADMAP

A list of planned features for `graphy`, lossely grouped and sorted by priority.

## Level 3: In Progress
 - ES Module Support for top-level groups.
 - `DenseDatacache` -- Datacache (w/o union, diff, etc) for storing many quads.

## Level 2: Wanted
 - `JsonLdReader` -- Single threaded streaming reader for JSON-LD.
 - `NdJsonReader` and `NdJsonScriber` -- Explicit reader and scriber for 'Newline-Delimited' JSON.
 - Line number, column, and byte positions of read error origin.
 - `DenseDataset` -- Dataset (w/ union, diff, etc) for storing many quads.
 - `FastDatacache` -- Datacache (w/o union, diff, etc) for storing and retrieving quads quickly.

## Level 1: Interested
 - `TurtleScanner` and `TriGScanner` -- Multi-threaded streaming readers for Turtle and TriG.
 - `CsvReader` and `CsvScriber` -- Reader and scriber for 'simple profile' CSV format.
 - Add TypeScript definitions to APIs.
 - Support WHATWG streams natively.
 - Pre-bundled builds for the browser.
 - `AutoDatacache` -- Datacache that automatically switches between 'Fast' and 'Dense' depending on resource monitor(s).
 - CLI `inject` command -- inject writable data events into stream.
 - `NTriplesLinter` and `NQuadsLinter` -- code linters for NTriples and NQuads.
 - `TurtleLinter` and `TriGLinter` -- code linters for Turtle and TriG.

## Level 0: Speculative
 - `TurtleLoader` -- Directly loads triples into memory from serialized Turtle (unmarshalling).
 - `NTriplesExtractor` -- WASM-powered parser with lazy property getters for optimized reading when filters are present.
 - `SparqlResultsJsonReader` -- Single threaded streaming reader for application/sparql-results+json.
 - `N3Reader` -- Single threaded streaming reader for Notation3.
 - `RdfXmlReader` -- Single threaded streaming reader for RDF/XML.
 - `OwlManchesterReader` and `OwlFunctionalReader` -- Single threaded streaming reader for OWL Manchester Syntax and OWL Functional Syntax.
 - `BigInt` support.
 - Concise Term directive for serializing long literals.
