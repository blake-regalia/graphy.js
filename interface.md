
Datatypes:
 - iri - a `string` that represents an IRI either by:
   - absolute reference, starting with `'<'` and ending with `'>'`
   - prefixed name, with a prefix id given by everything before the first `':'` and a suffix given by everything after that
 - langtag - a `string` that represents a language tag. it must start with `'@'`


Knob {

	// inherited from RDFJS Data Interface
	.value: string - the IRI of this node
	.termType: string - either `'NamedNode'` or `'BlankNode'`
	.is[Named|Blank]Node: boolean = true
	
	.links: hash[predicate_uri: string]
		- selects the set of objects linked by `predicate_uri` from this subject
		=> returns an array of RDFJS terms that represent the objects of the triples

	.at: funciton/hash
		{function}(predicate: iri[, ...])
		{function}(predicates: array)
			- traverses `predicate(s)` a maximum length of one. Multiple arguments or an array is equivalent to the OR path operation which tries all possibilities.
			=> returns a Bag instance
		{hash}[prefix_id: key]
			- selects a subset of the predicates that link this subject to its objects by filtering predicates that start with the IRI given by the corresponding `prefix_id`.
			=> returns a Namespace instance
}

Namespace {
	{hash}[predicate_suffix: string]
		- selects the set of objects corresponding to the predicate given by the current namespace prefix concatenated with `predicate_suffix`
		> i.e., the keys are the strings leftover after removing the prefix IRI from the beginning of every predicate
		=> returns a Bag instance
}

Bag {
	// *operator() function
	{function}()
		- selects exactly one element from the unordered list and returns its `.value`. Convenient if you are certain the bag has only one element.
		=> returns a string

	// operations on terms of all types
	.values() - fetches all elements' `.value` property
		=> returns an Array of strings
	.termTypes() - fetches all elements' `.termType` property
		=> returns an Array of strings

	.literals: chain/function
		{chain}
		{function}()
		{function}(filter: iri) - filter by datatype
		{function}(filter: langtag) - filter by language
		{function}(filter: function) - filter by custom function
			- selects only terms of type literal and applies an optional `filter`.
			=> returns a new Bunch

	.nodes: chain/function
		{chain}
		{function}()
		{function}(filter: function) - filter by custom function
			- selects only distinct terms of type NamedNode or BlankNode and applies an optional `filter`.
			=> returns a new KnobSet

	.namedNodes: chain/function
		{chain}
		{function}()
		{function}(prefix: iri) - filter by whos IRIs start with `prefix`
		{function}(filter: function) - filter by custom function
		{function}(prefix: iri, filter: function) - filter by nodes whos IRIs start with `prefix`, **then** filter by custom function
			- selects only distinct terms of type NamedNode, optionally filters nodes whos IRIs start with `prefix`, and then applies an optional `filter`.
			=> returns a new KnobSet

	.blankNodes: chain/function
		{chain}
		{function}()
		{function}(label: RegExp) - filter by label
			- selects only distinct terms of type BlankNode and applies an optional `filter`.
			=> returns a new KnobSet
}
