

# [« API](api) / Dataset Tree
### `@graphy/util.dataset.tree`

## Primer
 - `dataset_tree` is used throughout examples in this document's code sections to refer to the module's export.

## Contents
 - [Memory and Performance](#memory-and-performance) -- what to be aware of when using this package.
 - [Construction](#construction) -- how to create an instance of a DatasetTree
 - [Properties](#properties)
   - [`.size`](#property_size) -- number of quads in the tree.
 - [Prototype Methods](#methods) -- 
   - Iterators
     - [`* [Symbol.iterator](...)`](#method_iterator) -- for iterating over the dataset
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
     

----

## Memory and Performance

This data structure is implemented in a performance-oriented, memory-conscious manner. More technically, certain set operations may reuse pointers to existing object trees in order to save the time it takes to copy subtrees and to reduce the overall memory footprint. This should have no effect on user functionality since object reuse is handled internally and all methods ensure that stale objects are released to GC.


----

## Properties


<a name="property_size" />

### **.size**
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

<a name="method_iterator" />

### * **[Symbol.iterator]**()
 - create an iterator to traverse each quad in `this`.
 - **yields** [Quads](core.data.factory#class_quad).


<a name="method_canonicalize" />

### **.canonicalize**()
 - create a new DatasetTree by applying the [RDF Dataset Normalization Algorithm](https://json-ld.github.io/normalization/spec/) (URDNA2015). If you want isomorphism to hold under the usual DatasetTree methods, you should use this method on both dataset instances prior to testing [`.equals()`](#method_equals), [`.contains()`](#method_contains), [`.disjoint()`](#method_disjoint), and prior to using [`.union()`](#method_union), [`.intersection()`](#method_intersection), [`.minus()`](#method_minus), and [`.difference()`](#method_difference).
 - **returns** a [new DatasetTree](#methods).


<a name="method_add" />

### **.add**(quad: [AnyQuad](core.data.factory#interface_any-quad)) _implements_ [@RDFJS/dataset.add](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-datasetcore-add)
 - add a single quad to the tree; will only succeed if the quad is not already present.
 - **returns** `this`.


<a name="method_add-all" />

### **.addAll**(quads: [@RDFJS/dataset](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-dataset) | sequence<[AnyQuad](core.data.factory#interface_any-quad)>) _implements_ [@RDFJS/dataset.addAll](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-datasetcore-addall)
 - add quads to the tree; will only add each quad that is not already present. 
 - **returns** `this`


<a name="method_add-quads" />

### **.addQuads**(quads: [Iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator)<[Quad](core.data.factory#class_quad)>)
 - add quads to the tree; will only add each quad that is not already present. Bypass the internal overhead of checking and needlessly converting each quad to graphy-safe objects. Notice that `quads` must be an [Iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator) sequence of graphy [Quads](core.data.factory#class_quad).
 - **returns** a [`#number/integer`](core.data.factory#number_integer) indicating how many quads were successfully added to the tree.


<a name="method_delete" />

### **.delete**(Quad quad) _implements_ [@RDFJS/dataset.delete](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-datasetcore-delete)
 - delete the given `quad` from the tree if it exists.
 - **returns** `this`

<a name="method_delete-quads" />

### **deleteQuads**(quads: list<[Quad](core.data.factory#class_quad)>)
 - delete the given `quads` from the tree if they exist.
 - **returns** a [`#number/integer`](core.data.factory#number_integer) indicating how many quads were successfully deleted from the tree.


<a name="method_clear" />

### **.clear**()
 - remove all quads from the tree.
 - **returns** `undefined`.


<a name="method_has" />

### **.has**(quad: [AnyQuad](core.data.factory#interface_any-quad)) _implements_ [@RDFJS/dataset.has](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-datasetcore-has)
 - tests if this contains the given `quad`.
 - **returns** a `boolean`.


<a name="method_equals" />

### **.equals**(other: [DatasetTree](#methods)>) _implements_ [@RDFJS/dataset.equals](https://rdf.js.org/dataset-spec/dataset-spec.html#dom-datasetcore-equals)
 - `A = B`
 - tests if `this` and `other` are equivalent graphs using [URDNA2015](https://json-ld.github.io/normalization/spec/).
 - **returns** a `boolean`


<a name="method_contains" />

### **contains**(other: [DatasetTree](#methods)>)
 - `(A ∩ B) = B`
 - tests if `this` contains all quads in `other`.
 - **returns** a `boolean`.


<a name="method_disjoint" />

### **.disjoint**(other: [DatasetTree](#methods)>)
 - `(A ∩ B) = Ø`
 - tests if `this` is disjoint with `other`.
 - **returns** a `boolean`.


<a name="method_union" />

### **.union**(other: [DatasetTree](#methods)>)
 - create a new DatasetTree by combining the quads from both `this` and `other`.
 - **returns** a [new DatasetTree](#methods).


<a name="method_intersection" />

### **.intersection**(other: [DatasetTree](#methods)>)
 - `A ∩ B`
 - create a new DatasetTree by intersecting the quads between `this` and `other`.
 - **returns** a [new DatasetTree](#methods).


<a name="method_minus" />

### **.minus**(other: [DatasetTree](#methods)>)
 - `(A - (A ∩ B))`
 - create a new DatasetTree by subtracting the quads in `other` from `this`.
 - **returns** a [new DatasetTree](#methods).


<a name="method_difference" />

### **.difference**(other: [DatasetTree](#methods)>)
 - `(A - (A ∩ B)) ∪ (B - (A ∩ B))`
 - create a new DatasetTree by taking the difference between `this` and `other`.
 - **returns** a [new DatasetTree](#methods).

