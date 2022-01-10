import type {
	Merge,
} from 'ts-toolbelt/out/Object/_api';

import type {
	Debug,
} from './utility';


/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `rdf:`
 */
export type P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';

/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `rdf:type`
 */
export type P_IRI_RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';

/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `xsd:`
 */
export type P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#'


/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `xsd:boolean`
 */
export type P_IRI_XSD_BOOLEAN = `${P_IRI_XSD}boolean`;

/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `xsd:integer`
 */
export type P_IRI_XSD_INTEGER = `${P_IRI_XSD}integer`;

/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `xsd:double`
 */
export type P_IRI_XSD_DOUBLE = `${P_IRI_XSD}double`;

/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `xsd:decimal`
 */
export type P_IRI_XSD_DECIMAL = `${P_IRI_XSD}decimal`;

/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `xsd:date`
 */
export type P_IRI_XSD_DATE = `${P_IRI_XSD}date`;

/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `xsd:dateTime`
 */
export type P_IRI_XSD_DATETIME = `${P_IRI_XSD}dateTime`;

/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `xsd:string`
 */
export type P_IRI_XSD_STRING = `${P_IRI_XSD}string`;


/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `rdfs:`
 */
export type P_IRI_RDFS = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'

/**
 * === _**@graphy/types**_ ===
 * 
 * ## IRI - `rdfs:langString`
 */
export type P_IRI_RDFS_LANGSTRING = `${P_IRI_RDFS}langString`;


// RDF Modes
export type RdfMode_11 = 'rdf-1.1';
export type RdfMode_star = 'rdf-star';
export type RdfMode_easier = 'easier-rdf';

export type SupportedRdfMode = RdfMode_11 | RdfMode_star | RdfMode_easier;

export type DescribeRdfMode<
	RdfMode extends SupportedRdfMode,
> = Merge<
	{[K in RdfMode_11]: 'RDF 1.1'},
	Merge<
		{[K in RdfMode_star]: 'RDF-Star'},
		{[K in RdfMode_easier]: 'EasierRDF'}
	>
>[RdfMode];


// xsd types
export type XsdDatatypes = {
	boolean: 'Boolean';
	integer: 'Integer';
	double: 'Double';
	decimal: 'Decimal';
	date: 'Date';
	dateTime: 'DateTime';
};


/**
 * === _**@graphy/types**_ ===
 * 
 * ## `NaN`
 * 
 * Opaque type to represent `NaN`
 */
export type NaN = Debug<typeof NaN, 'NaN'>;


export type ReservedPrefixMapKey_Cache = '.cache';
export type ReservedPrefixMapKey_Base = '.base';


export type NodeType = NodeType.ForNamedNodes | NodeType.ForBlankNodes;
export namespace NodeType {
	export type Absolute = 'absolute';
	export type Relative = 'relative';

	export type ForNamedNodes = Absolute | Relative;

	export type Labeled = 'labeled';
	export type Anonymous = 'anonymous';
	export type Ephemeral = 'ephemeral';

	export type ForBlankNodes = Labeled | Anonymous | Ephemeral;
}
