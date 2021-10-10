import type {
	Merge,
} from 'ts-toolbelt/out/Object/_api';

// IRI constants
export type P_XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';
export type P_RDFS_LANGSTRING = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString';


// RDF Modes
export type RdfMode_11 = 'rdf-1.1' | '1.1';
export type RdfMode_star = 'rdf-star' | 'star' | '*';
export type RdfMode_easier = 'easier-rdf' | 'easier';
export type AllowedRdfMode = RdfMode_11 | RdfMode_star | RdfMode_easier;

export type DescribeRdfMode<
	RdfMode extends AllowedRdfMode,
> = Merge<
	{[K in RdfMode_11]: 'RDF 1.1'},
	Merge<
		{[K in RdfMode_star]: 'RDF-Star'},
		{[K in RdfMode_easier]: 'EasierRDF'}
	>
>[RdfMode];
