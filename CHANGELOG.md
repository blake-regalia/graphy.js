# Changelog

## v3.1.1 (2019-01-18)
------------------------

#### Fix Missing CLI Dependency and Patch for Browser Stream Polyfill

  The CLI `package.json` was missing a dependency to `yargs`. The [`stream` polyfill](https://github.com/browserify/stream-browserify) used by both Webpack and Browserify improperly pushes `null` and emits an `'end'` event during the call to `.destroy()` -- the same bug exists for node.js <v10. This patch includes an overriding destroy implementation for the stream polyfill when bundled.


## v3.1.0 (2019-01-16)
------------------------

#### Textual Content Writers

  Introduces textual content writers which accept writable data events such as concise-quads and concise-triples hashes, prefix mappings, quad objects, and so on. This update also includes several patches for content reader corner cases that were not covered by W3C manifest, as well as some fixes to situational stream handling and dataset tree.


## v3.0.6 (2018-12-30)
------------------------

#### Turtle and TriG reader patches

  Patches a blank node regex to cover a corner-case in reading Turtle and TriG documents.


## v3.0.5 (2018-12-21)
------------------------

#### Build Process Fix

  Due to how unit test manifests are cached, the build process needed a patch to ensure Travis CI can carry out test validation properly.


## v3.0.4 (2018-12-21)
------------------------

#### Comprehensive Unit Testing for Content Readers

  Content readers for N-Triples, N-Quads, Turtle and TriG now pass all unit tests provided by W3C when validation is enabled.


## v3.0.3 (2018-12-14)
------------------------

#### Core Data Factory Patch

  Since the initial release was a bit rushed, missed a latent dependency added to the `core.data.factory` package.


## v3.0.2 (2018-12-13)
------------------------

#### Passing Specification Tests

  The main four textual content readers, N-Triples, N-Quads, Turtle and TriG now pass all specification tests. More unit tests needed to cover all API use cases.


## v3.0.1 (2018-12-11)
------------------------

#### Functional Readers

  A complement to the initial beta release; adds content readers and patches an issue in the `core.data.factory` package without complete unit tests yet.


## v3.0.0 (2018-12-10)
------------------------

#### Beta Production Release

  Had to get out a beta on npm before unit tests could be completed due to pressure over the temporarily dormant `graphy` org name on npm.
