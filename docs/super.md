

# [« API](api) / Super Package
This document describes the 'super' package `graphy`.


### `npm i -g graphy`

<br />

### export **graphy** _extends_ [DataFactory](core.data.factory)

## Contents
 - [Functions](#functions)
   - [`.content(...)`](#function_content)
 - [Packages](#packages)
   - [`.content.nt.read(...)`](#package_content-nt-read)
   - [`.content.nt.scribe(...)`](#package_content-nt-scribe)
   - [`.content.nt.write(...)`](#package_content-nt-write)
   - [`.content.nq.read(...)`](#package_content-nq-read)
   - [`.content.nq.scribe(...)`](#package_content-nq-scribe)
   - [`.content.nq.write(...)`](#package_content-nq-write)
   - [`.content.ttl.read(...)`](#package_content-ttl-read)
   - [`.content.ttl.scribe(...)`](#package_content-ttl-scribe)
   - [`.content.ttl.write(...)`](#package_content-ttl-write)
   - [`.content.trig.read(...)`](#package_content-trig-read)
   - [`.content.trig.scribe(...)`](#package_content-trig-scribe)
   - [`.content.trig.write(...)`](#package_content-trig-write)
   - [`.content.xml.scribe(...)`](#package_content-xml-scribe)
   - [`.memory.dataset.fast(...)`](#package_memory-dataset-fast)

<a name="functions" />

## Functions

<a name="function_content" />

 - `graphy.content(query: string)`
   - selects a group of content handlers identified by the given `query`, which may be a case-insensitive [Content-Type](https://www.w3.org/Protocols/rfc1341/4_Content-Type.html) (e.g., `'application/N-Triples'`) or the name of the package categroy (e.g., `'nq'`).
   - **returns** an object that contains, as keys, the _verbs_ available on the selected content-type, whose values reflect the corresponding package export. Will `throw` an Error if no content handler matches the provided `query`.
   - *example:*
      ```js
      const graphy = require('graphy');

      graphy.content('nt');  // { read: [Getter], write: [Getter] }

      graphy.content('text/turtle');  // { read: [Getter], write: [Getter] }
      ```

<a name="packages" />


<a name="package_content-nt-read" />

 - `graphy.content.nt.read(...)`
   - See the [`read verb`](content.textual#verb_read) in [Reading and Writing](content.textual).
         
<a name="package_content-nt-scribe" />

 - `graphy.content.nt.scribe(...)`
   - See the [`scribe verb`](content.textual#verb_scribe) in [Reading and Writing](content.textual).
         
<a name="package_content-nt-write" />

 - `graphy.content.nt.write(...)`
   - See the [`write verb`](content.textual#verb_write) in [Reading and Writing](content.textual).
         
<a name="package_content-nq-read" />

 - `graphy.content.nq.read(...)`
   - See the [`read verb`](content.textual#verb_read) in [Reading and Writing](content.textual).
         
<a name="package_content-nq-scribe" />

 - `graphy.content.nq.scribe(...)`
   - See the [`scribe verb`](content.textual#verb_scribe) in [Reading and Writing](content.textual).
         
<a name="package_content-nq-write" />

 - `graphy.content.nq.write(...)`
   - See the [`write verb`](content.textual#verb_write) in [Reading and Writing](content.textual).
         
<a name="package_content-ttl-read" />

 - `graphy.content.ttl.read(...)`
   - See the [`read verb`](content.textual#verb_read) in [Reading and Writing](content.textual).
         
<a name="package_content-ttl-scribe" />

 - `graphy.content.ttl.scribe(...)`
   - See the [`scribe verb`](content.textual#verb_scribe) in [Reading and Writing](content.textual).
         
<a name="package_content-ttl-write" />

 - `graphy.content.ttl.write(...)`
   - See the [`write verb`](content.textual#verb_write) in [Reading and Writing](content.textual).
         
<a name="package_content-trig-read" />

 - `graphy.content.trig.read(...)`
   - See the [`read verb`](content.textual#verb_read) in [Reading and Writing](content.textual).
         
<a name="package_content-trig-scribe" />

 - `graphy.content.trig.scribe(...)`
   - See the [`scribe verb`](content.textual#verb_scribe) in [Reading and Writing](content.textual).
         
<a name="package_content-trig-write" />

 - `graphy.content.trig.write(...)`
   - See the [`write verb`](content.textual#verb_write) in [Reading and Writing](content.textual).
         

<a name="package_memory-dataset-fast" />

 - `graphy.memory.dataset.fast(...)`
   - See the [`FastDataset`](memory.dataset.fast) package.



