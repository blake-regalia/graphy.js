import type {
	Merge,
	MergeAll,
} from 'ts-toolbelt/out/Object/_api'

import {
	RdfMode_11,
	RdfMode_star,
	RdfMode_easier,
	SupportedRdfMode,
} from "../const";

export type Role = 'graph' | 'subject' | 'predicate' | 'object' | 'datatype';

export type Remapper = {
	Data: any;
	
	DefaultGraph: any;
	Node: any;
	NamedNode: any;
	Literal: any;
	Quad: any;
};


export type RemapGraph<
	h_remap extends Pick<Remapper, 'DefaultGraph' | 'NamedNode' | 'Data'>,
> = MergeAll<{}, [
	{
		[K in RdfMode_11 | RdfMode_star]: h_remap['DefaultGraph'] | h_remap['NamedNode'];
	},
	{
		[K in RdfMode_easier]: h_remap['Data'];
	},
]>;


export type RemapSubject<
	h_remap extends Pick<Remapper, 'Node' | 'Quad' | 'Data'>,
> = MergeAll<{}, [
	{
		[K in RdfMode_11]: h_remap['Node'];
	},
	{
		[K in RdfMode_star]: h_remap['Node'] | h_remap['Quad'];
	},
	{
		[K in RdfMode_easier]: h_remap['Data'];
	},
]>;


export type RemapPredicate<
	h_remap extends Pick<Remapper, 'NamedNode' | 'Data'>,
> = MergeAll<{}, [
	{
		[K in RdfMode_11 | RdfMode_star]: h_remap['NamedNode'];
	},
	{
		[K in RdfMode_easier]: h_remap['Data'];
	},
]>;


export type RemapObject<
	h_remap extends Pick<Remapper, 'Node' | 'Literal' | 'Quad' | 'Data'>,
> = MergeAll<{}, [
	{
		[K in RdfMode_11]: h_remap['Node'];
	},
	{
		[K in RdfMode_star]: h_remap['Node'] | h_remap['Literal'] | h_remap['Quad'];
	},
	{
		[K in RdfMode_easier]: h_remap['Data'];
	},
]>;

export type RemapDatatype<
	h_remap extends Pick<Remapper, 'NamedNode' | 'Data'>,
> = h_remap['NamedNode'];


export type RemapRole<
	s_mode extends SupportedRdfMode,
	h_remap extends Remapper,
	si_role extends Role,
> = {
	graph: RemapGraph<h_remap>;
	subject: RemapSubject<h_remap>;
	predicate: RemapPredicate<h_remap>;
	object: RemapObject<h_remap>;
	datatype: RemapDatatype<h_remap>;
}[si_role][s_mode];
