

# [« API](api) / Dataset Tree
<div class="package-heading">
  <code>@graphy/util.dataset.tree</code>
</div>

## Primer
 - `dataset_tree` is used throughout examples in this document's code sections to refer to the module's export.

## Contents
 - [Memory and Performance](#memory-and-performance) -- what to be aware of when using this package.
 - [Construction](#construction) -- how to create an instance of a DatasetTree
 - [Properties](#properties)
   - [`.size`](#property_size) -- number of quads in the tree.
 - [Prototype Methods](#methods) -- 
   - Iterators
     - [`* [Symbol.iterator](...)`](#method_symbol-iterator) -- instances are iterable
   - Canonicalization
     - [`.canonicalize(...)`](#method_canonicalize)
   - Set Mutators
     - [`.add(...)`](#method_add)
     - [`.addAll(...)`](#method_add-all)
     - [`.addQuads(...)`](#method_add-quads)
     - [`.delete(...)`](#method_delete)
     - [`.deleteQuads(...)`](#method_delete-quads)
     - [`.clear(...)`](#method_clear) -- remove all quads from the tree
   - Set Analogues
     - [`.has(...)`](#method_has) -- test if the dataset has a given quad
   - Set Algebra Booleans
     - [`.equals(...)`](#method_equals) -- `A = B`
     - [`.contains(...)`](#method_contains) -- `(A ∩ B) = B`
     - [`.disjoint(...)`](#method_disjoint) -- `(A ∩ B) = Ø`
   - Set Algebra Primitives
     - [`.union(...)`](#method_union) -- `A ∪ B`
     - [`.intersection(...)`](#method_intersection) -- `A ∩ B`
   - Set Algebra Derivatives
     - [`.minus(...)`](#method_minus) -- `A - (A ∩ B)`
     - [`.difference(...)`](#method_difference) -- `(A - (A ∩ B)) ∪ (B - (A ∩ B))`
   - Selection
     - [`.match(...)`](#method_match)
     

----

## Memory and Performance

This data structure is implemented in a performance-oriented, memory-conscious manner. More technically, certain set operations may reuse pointers to existing object trees in order to save the time it takes to copy subtrees and to reduce the overall memory footprint. This should have no effect on user functionality since object reuse is handled internally and all methods ensure that stale objects are released to GC.


----

## Properties


<a name="property_size" />

### [`.size`](#property_size)
 - get the number of quads in the tree.
 - **returns** a [`#number/integer`](core.data.factory#number_integer)
 - *examples:*
     ```js
     let y_tree = dataset_tree();
     let h_prefixes = {
        dbr: 'http://dbpedia.org/resource/',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        graph: 'http://ex.org/graph#',
     };

     y_tree.size;  // 0

     y_tree.addQuads(factory.c4({
         'graph:example': {
             'dbr:Banana': {
                 'rdfs:label': [
                     '@en"Banana',
                     '@fr"Banane',
                 ],
             },
         },
     }, h_prefixes));
     
     y_tree.size;  // 2
     ```

----

## Methods

<a name="method_symbol-iterator" />

### [`* [Symbol.iterator]`](#method_symbol-iterator)`()` _per_ [@RDFJS/dataset](https://rdf.js.org/dataset-spec/dataset-spec.html#datasetcore-interface)
 - create an iterator to traverse each quad in `this`.
 - **yields** [Quads](core.data.factory#class_quad).


<a name="method_canonicalize" />

### [`.canonicalize`](#method_canonicalize)`()`
 - create a new DatasetTree by applying the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/) (URDNA2015). If you want isomorphism to hold under the usual DatasetTree methods, you should use this method on both dataset instances prior to testing [`.equals()`](#method_equals), [`.contains()`](#method_contains), [`.disjoint()`](#method_disjoint), and prior to using [`.union()`](#method_union), [`.intersection()`](#method_intersection), [`.minus()`](#method_minus), and [`.difference()`](#method_difference).
 - **returns** a [new DatasetTree](#methods).


<a name="method_add" />

### [`.add`](#method_add)`(quad: `[`AnyQuad`](core.data.factory#interface_any-quad)`)` _implements_ [@RDFJS/dataset.add](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-datasetcore-add)
 - add a single quad to the tree; will only succeed if the quad is not already present.
 - **returns** `this`.


<a name="method_add-all" />

### [`.addAll`](#method_addAll)`(quads: `[`@RDFJS/dataset`](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-dataset)` | sequence<`[`AnyQuad`](core.data.factory#interface_any-quad)`>)` _implements_ [@RDFJS/dataset.addAll](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-dataset-addall)
 - add quads to the tree; will only add each quad that is not already present. 
 - **returns** `this`


<a name="method_add-quads" />

### [`.addQuads`](#method_addQuads)`(quads: `[`Iterable`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator)`<`[`Quad`](core.data.factory#class_quad)`>)`
 - add quads to the tree; will only add each quad that is not already present. Bypass the internal overhead of checking and needlessly converting each quad to graphy-safe objects. Notice that `quads` must be an [Iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) sequence of graphy [Quads](core.data.factory#class_quad).
 - **returns** a [`#number/integer`](core.data.factory#number_integer) indicating how many quads were successfully added to the tree.


<a name="method_delete" />

### [`.delete`](#method_delete)`(quad: `[`AnyQuad`](core.data.factory#interface_any-quad)`)` _implements_ [@RDFJS/dataset.delete](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-datasetcore-delete)
 - delete the given `quad` from the tree if it exists.
 - **returns** `this`

<a name="method_delete-quads" />

### [`.deleteQuads`](#method_deleteQuads)`(quads: list<`[`Quad`](core.data.factory#class_quad)`>)`
 - delete the given `quads` from the tree if they exist.
 - **returns** a [`#number/integer`](core.data.factory#number_integer) indicating how many quads were successfully deleted from the tree.


<a name="method_clear" />

### [`.clear`](#method_clear)`()`
 - remove all quads from the tree.
 - **returns** `undefined`.


<a name="method_has" />

### [`.has`](#method_has)`(quad: `[`AnyQuad`](core.data.factory#interface_any-quad)`)` _implements_ [@RDFJS/dataset.has](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-datasetcore-has)
 - tests if this contains the given `quad`.
 - **returns** a `boolean`.


<a name="method_equals" />

### [`.equals`](#method_equals)`(other: `[`DatasetTree`](#methods)`)` _implements_ [@RDFJS/dataset.equals](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-dataset-equals)
 - `A = B`
 - tests if `this` and `other` are strictly equal graphs.
 - **returns** a `boolean`


<a name="method_contains" />

### [`.contains`](#method_contains)`(other: `[`DatasetTree`](#methods)`)`
 - `(A ∩ B) = B`
 - tests if `this` contains all quads in `other`.
 - **returns** a `boolean`.


<a name="method_disjoint" />

### [`.disjoint`](#method_disjoint)`(other: `[`DatasetTree`](#methods)`)`
 - `(A ∩ B) = Ø`
 - tests if `this` is disjoint with `other`.
 - **returns** a `boolean`.


<a name="method_union" />

### [`.union`](#method_union)`(other: `[`DatasetTree`](#methods)`)` _implements_ [@RDFJS/dataset.union](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-dataset-union)
 - create a new DatasetTree by combining the quads from both `this` and `other`.
 - **returns** a [new DatasetTree](#methods).


<a name="method_intersection" />

### [`.intersection`](#method_intersection)`(other: `[`DatasetTree`](#methods)`)` _implements_ [@RDFJS/dataset.intersection](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-dataset-intersection)
 - `A ∩ B`
 - create a new DatasetTree by intersecting the quads between `this` and `other`.
 - **returns** a [new DatasetTree](#methods).


<a name="method_minus" />

### [`.minus`](#method_minus)`(other: `[`DatasetTree`](#methods)`)`
 - `(A - (A ∩ B))`
 - create a new DatasetTree by subtracting the quads in `other` from `this`.
 - **returns** a [new DatasetTree](#methods).


<a name="method_difference" />

### [`.difference`](#method_difference)`(other: `[`DatasetTree`](#methods)`)` _implements_ [@RDFJS/dataset.difference](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-dataset-difference)
 - `(A - (A ∩ B)) ∪ (B - (A ∩ B))`
 - create a new DatasetTree by taking the difference between `this` and `other`.
 - **returns** a [new DatasetTree](#methods).

<a name="method_match" />

### [`.match`](#method_match)`([subject: null | `[`AnyTerm`](core.data.factory#interface_any-term)`[, predicate: null | `[`AnyTerm`](core.data.factory#interface_any-term)`[, object: null | `[`AnyTerm`](core.data.factory#interface_any-term)`[, graph: null | `[`AnyTerm`](core.data.factory#interface_any-term)`]]]])` _implements_ [@RDFJS/dataset.match](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-datasetcore-match)
 - create a new DatasetTree by matching the specified `subject`, `predicate`, `object`, and/or `graph`, or any quads if `null` is given for any role.
 - **returns** a [new DatasetTree](#methods).


