import type {
	Merge,
	MergeAll,
} from 'ts-toolbelt/out/Object/_api';

import type {
	ASSERT_SAME,
} from '../utility';

import {
	RdfMode_11,
	RdfMode_star,
	RdfMode_easier,
	SupportedRdfMode,
} from '../const';

import {
   NamedNode,
   BlankNode,
   Literal,
   Variable,
   DefaultGraph,
   Quad,
} from './graphy'


interface TermTypes {
	NamedNode: NamedNode;
	BlankNode: BlankNode;
	Literal: Literal;
	Variable: Variable;
	DefaultGraph: DefaultGraph;
	Quad: Quad;
}

/**
 * Union of all valid .termType string value types
 */
export type TermTypeKey = keyof TermTypes;

/**
 * The .termType string value type "NamedNode"
 */
export type NamedNodeTypeKey = Extract<TermTypeKey, 'NamedNode'>;

/**
 * The .termType string value type "BlankNode"
 */
export type BlankNodeTypeKey = Extract<TermTypeKey, 'BlankNode'>;

/**
 * The .termType string value type "Literal"
 */
export type LiteralTypeKey = Extract<TermTypeKey, 'Literal'>;

/**
 * The .termType string value type "DefaultGraph"
 */
export type DefaultGraphTypeKey = Extract<TermTypeKey, 'DefaultGraph'>;

/**
 * The .termType string value type "Quad"
 */
export type QuadTypeKey = Extract<TermTypeKey, 'Quad'>;

/**
 * The .termType string value type "Variable"
 */
export type VariableTypeKey = Extract<TermTypeKey, 'Variable'>;


/**
 * Union of NamedNode and BlankNode term types
 */
export type NodeTypeKey = NamedNodeTypeKey | BlankNodeTypeKey;

/**
 * Union of valid .termType string value types which only require the .termType and .value properties.
 */
export type TrivialTypeKey = NodeTypeKey | DefaultGraphTypeKey | VariableTypeKey;

/**
 * Union of valid .termType string value types which carry actual data.
 */
export type DataTypeKey = Exclude<TermTypeKey, VariableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data.
 */
export type ValuableTypeKey = Extract<TermTypeKey, NodeTypeKey | LiteralTypeKey | VariableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data.
 */
export type UnvaluableTypeKey = Exclude<TermTypeKey, ValuableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data and ARE NOT required to have an empty .value property.
 */
export type ValuableDataTypeKey = Extract<DataTypeKey, ValuableTypeKey>;

/**
 * Union of valid .termType string value types which carry actual data and ARE required to have an empty .value property.
 */
export type UnvaluableDataTypeKey = Exclude<DataTypeKey, ValuableDataTypeKey>;


/**
 * === _**@graphy/types**_ ===
 * 
 * (See generated definition above)
 *
 * Returns the union of valid `.termType` string values for Terms that appear in the subject position for the given RDF `mode`
 * 
 * --- **See Also:** ---
 *  - {@link SupportedRdfMode} to specify `mode`
 *  - {@link TermTypeKey} to see list of possible return types
 */
export type SubjectTypeKey<
	s_mode extends SupportedRdfMode=SupportedRdfMode,
> = MergeAll<
	{[K in RdfMode_11]: NodeTypeKey},
	[
			{[K in RdfMode_star]: NodeTypeKey | QuadTypeKey},
			{[K in RdfMode_easier]: DataTypeKey},
   ]
>[s_mode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<SubjectTypeKey, DataTypeKey> = 1;
	const N: ASSERT_SAME<SubjectTypeKey<RdfMode_11>, NodeTypeKey> = 1;
	const S: ASSERT_SAME<SubjectTypeKey<RdfMode_star>, NodeTypeKey | QuadTypeKey> = 1;
	const E: ASSERT_SAME<SubjectTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


/**
 * === _**@graphy/types**_ ===
 * 
 * (See generated definition above)
 *
 * Returns the union of valid `.termType` string values for Terms that appear in the predicate position for the given RDF `mode`
 * 
 * --- **See Also:** ---
 *  - {@link SupportedRdfMode} to specify `mode`
 *  - {@link TermTypeKey} to see list of possible return types
 */
export type PredicateTypeKey<
	RdfMode extends SupportedRdfMode=SupportedRdfMode,
> = Merge<
	{[K in RdfMode_11 | RdfMode_star]: NamedNodeTypeKey},
	{[K in RdfMode_easier]: DataTypeKey}
>[RdfMode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<PredicateTypeKey, DataTypeKey> = 1;
	const N: ASSERT_SAME<PredicateTypeKey<RdfMode_11>, NamedNodeTypeKey> = 1;
	const S: ASSERT_SAME<PredicateTypeKey<RdfMode_star>, NamedNodeTypeKey> = 1;
	const E: ASSERT_SAME<PredicateTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


/**
 * === _**@graphy/types**_ ===
 * 
 * (See generated definition above)
 *
 * Returns the union of valid `.termType` string values for Terms that appear in the object position for the given RDF `mode`
 * 
 * --- **See Also:** ---
 *  - {@link SupportedRdfMode} to specify `mode`
 *  - {@link TermTypeKey} to see list of possible return types
 */
export type ObjectTypeKey<
	RdfMode extends SupportedRdfMode=SupportedRdfMode,
> = MergeAll<
	{[K in RdfMode_11]: ValuableDataTypeKey},
	[
      {[K in RdfMode_star]: ValuableDataTypeKey | QuadTypeKey},
      {[K in RdfMode_easier]: DataTypeKey}
   ]
>[RdfMode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<ObjectTypeKey, DataTypeKey> = 1;
	const N: ASSERT_SAME<ObjectTypeKey<RdfMode_11>, ValuableDataTypeKey> = 1;
	const S: ASSERT_SAME<ObjectTypeKey<RdfMode_star>, ValuableDataTypeKey | QuadTypeKey> = 1;
	const E: ASSERT_SAME<ObjectTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


/**
 * === _**@graphy/types**_ ===
 * 
 * (See generated definition above)
 *
 * Returns the union of valid `.termType` string values for Terms that appear in the graph position for the given RDF `mode`
 * 
 * --- **See Also:** ---
 *  - {@link SupportedRdfMode} to specify `mode`
 *  - {@link TermTypeKey} to see list of possible return types
 */
export type GraphTypeKey<
	RdfMode extends SupportedRdfMode=SupportedRdfMode,
> = Merge<
	{[K in RdfMode_11 | RdfMode_star]: NodeTypeKey | DefaultGraphTypeKey},
	{[K in RdfMode_easier]: DataTypeKey}
>[RdfMode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<GraphTypeKey, DataTypeKey> = 1;
	const N: ASSERT_SAME<GraphTypeKey<RdfMode_11>, NodeTypeKey | DefaultGraphTypeKey> = 1;
	const S: ASSERT_SAME<GraphTypeKey<RdfMode_star>, NodeTypeKey | DefaultGraphTypeKey> = 1;
	const E: ASSERT_SAME<GraphTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


/**
 * === _**@graphy/types**_ ===
 * 
 * (See generated definition above)
 *
 * Returns the union of valid `.termType` string values for Terms that appear in the datatype position for the given RDF `mode`
 * 
 * --- **See Also:** ---
 *  - {@link SupportedRdfMode} to specify `mode`
 *  - {@link TermTypeKey} to see list of possible return types
 */
export type DatatypeTypeKey<
	RdfMode extends SupportedRdfMode=SupportedRdfMode,
> = Merge<
	{[K in RdfMode_11 | RdfMode_star]: NamedNodeTypeKey},
	{[K in RdfMode_easier]: DataTypeKey}
>[RdfMode];

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const _: ASSERT_SAME<DatatypeTypeKey, DataTypeKey> = 1;
	const N: ASSERT_SAME<DatatypeTypeKey<RdfMode_11>, NamedNodeTypeKey> = 1;
	const S: ASSERT_SAME<DatatypeTypeKey<RdfMode_star>, NamedNodeTypeKey> = 1;
	const E: ASSERT_SAME<DatatypeTypeKey<RdfMode_easier>, DataTypeKey> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}

