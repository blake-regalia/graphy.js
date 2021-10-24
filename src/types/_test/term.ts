

{
	/* eslint-disable @typescript-eslint/no-unused-vars */

	type B = FromQualifier<[BlankNodeTypeKey]>;
	type N = FromQualifier<[NamedNodeTypeKey]>;
	type L = FromQualifier<[LiteralTypeKey]>;
	type NL = FromQualifier<[NamedNodeTypeKey | LiteralTypeKey]>;
	type D = FromQualifier<[DefaultGraphTypeKey]>;

	// basic fully compatible quad
	type d_BNLD = FromQualifier<[
		'Quad', '', void, void,
		B,
		N,
		NL,
		D,
	]>;
	type BNLD = QuadData<d_BNLD>;

	type BNLD_s = BNLD['subject'];
	const BNLD_st: ASSERT_EQUAL<BNLD_s['termType'], 'BlankNode'> = 1;
	const BNLD_sv: ASSERT_STRING<BNLD_s['value']> = 1;

	type BNLD_p = BNLD['predicate'];
	const BNLD_pt: ASSERT_EQUAL<BNLD_p['termType'], 'NamedNode'> = 1;
	const BNLD_pv: ASSERT_STRING<BNLD_p['value']> = 1;

	type BNLD_o = BNLD['object'];
	const BNLD_ot: ASSERT_SAME<BNLD_o['termType'], 'NamedNode' | 'Literal'> = 1;
	const BNLD_ov: ASSERT_STRING<BNLD_o['value']> = 1;

	type BNLD_g = BNLD['graph'];
	const BNLD_gt: ASSERT_EQUAL<BNLD_g['termType'], 'DefaultGraph'> = 1;
	const BNLD_gv: ASSERT_EQUAL<BNLD_g['value'], ''> = 1;

	type ODATA = ObjectData<['NamedNode' | 'Literal', 'hey']>;

	// rdf-star
	type QQQQs = QuadData<['Quad', '', void, void, d_BNLD, ['NamedNode'], d_BNLD, ['NamedNode'], RdfMode_star]>;

	type QQQQs_s = QQQQs['subject'];
	const QQQQs_st: ASSERT_EQUAL<QQQQs_s['termType'], 'Quad'> = 1;
	const QQQQs_sv: ASSERT_EQUAL<QQQQs_s['value'], ''> = 1;


	// easier-rdf
	type QQQQe = QuadData<['Quad', '', void, void, d_BNLD, d_BNLD, d_BNLD, d_BNLD, RdfMode_easier]>;

	type QQQQe_s = QQQQe['subject'];
	const QQQQe_st: ASSERT_EQUAL<QQQQe_s['termType'], 'Quad'> = 1;
	const QQQQe_sv: ASSERT_EQUAL<QQQQe_s['value'], ''> = 1;

	// type BNLD_p = BNLD['predicate'];
	// const BNLD_pt: ASSERT_EQUAL<BNLD_p['termType'], 'NamedNode'> = 1;
	// const BNLD_pv: ASSERT_STRING<BNLD_p['value']> = 1;

	// type BNLD_o = BNLD['object'];
	// const BNLD_ot: ASSERT_EQUAL<BNLD_o['termType'], 'Literal'> = 1;
	// const BNLD_ov: ASSERT_STRING<BNLD_o['value']> = 1;

	// type BNLD_g = BNLD['graph'];
	// const BNLD_gt: ASSERT_EQUAL<BNLD_g['termType'], 'DefaultGraph'> = 1;
	// const BNLD_gv: ASSERT_STRING<BNLD_g['value']> = 1;


	type LBDV = QuadData<['Quad', '', void, void, ['Literal'], ['BlankNode'], ['DefaultGraph'], ['Variable']]>;

	type GenericCoreTerm = CoreData<Descriptor, string>;

	type ValidGenericQuad = QuadData<['Quad', '', void, void, [SubjectTypeKey], [PredicateTypeKey], [ObjectTypeKey], [GraphTypeKey]]>;

	type AnyGenericQuad = QuadData<[
		'Quad', '', void, void,
		[SubjectTypeKey<RdfMode_easier>],
		[PredicateTypeKey<RdfMode_easier>],
		[ObjectTypeKey<RdfMode_easier>],
		[GraphTypeKey<RdfMode_easier>],
		RdfMode_easier
	]>;


	type AssertIncompatible<
		Test extends AnyGenericQuad,
		Position extends 'subject' | 'predicate' | 'object' | 'graph',
	> = ASSERT_TRUE<
		Extends<
			Test[Position],
			IncompatibleTermTypeError<Test[Position]['termType'], `the ${Position} position`, GenericCoreTerm>
		>
	>;

	const LBDV_s: AssertIncompatible<LBDV, 'subject'> = 1;
	const LBDV_p: AssertIncompatible<LBDV, 'predicate'> = 1;
	const LBDV_o: AssertIncompatible<LBDV, 'object'> = 1;
	const LBDV_g: AssertIncompatible<LBDV, 'graph'> = 1;

	type INS = LBDV['object']
	type INS2 = LBDV['graph']


	TESTQUAD.predicate.termType;
	TESTQUAD.object.termType;
	TESTQUAD.object.language;
	const g_subject = TESTQUAD.graph.subject;
	if('Literal' === g_subject.termType) {

	}

	/* eslint-enable @typescript-eslint/no-unused-vars */
}
// TESTQUAD.graph.graph.


{
	// function tquad<
	// 	a_descriptor extends Descriptor,
	// >(): Quad {

	// }

	/* eslint-disable @typescript-eslint/no-unused-vars, no-multi-spaces */

	const Invalid_RHS: ASSERT_TRUE<
		Extends<
			TermsEqual<['NamedNode'], ['Typo']>,
			InvalidTermTypeError<'Typo', boolean>
		>
	> = 1;

	const Invalid_LHS: ASSERT_TRUE<
		Extends<
			TermsEqual<['Typo'], ['NamedNode']>,
			InvalidTermTypeError<'Typo', boolean>
		>
	> = 1;

	type DN = ['NamedNode'];
	type DNs = ['NamedNode', string];
	type DNso = ['NamedNode', string, void];
	type DNsoo = ['NamedNode', string, void, void];
	type DNv = ['NamedNode', 'z://'];
	type DNvo = ['NamedNode', 'z://', void];
	type DNvoo = ['NamedNode', 'z://', void, void];
	type DNx = ['NamedNode', 'y://'];
	type DNxo = ['NamedNode', 'y://', void];
	type DNxoo = ['NamedNode', 'y://', void, void];

	type DL = ['Literal'];
	type DLv = ['Literal', 'z://'];
	type DLvo = ['Literal', 'z://', void];
	type DLvs = ['Literal', 'z://', string];
	type DLvso = ['Literal', 'z://', string, void];
	type DLvoo = ['Literal', 'z://', void, void];
	type DLv_k = ['Literal', 'z://', '', P_XSD_STRING];
	type DLv_v = ['Literal', 'z://', '', 'x://'];
	type DLvvr = ['Literal', 'z://', 'en', P_RDFS_LANGSTRING];
	type DLx = ['Literal', 'y://'];
	type DLxo = ['Literal', 'y://', void];
	type DLxoo = ['Literal', 'y://', void, void];
	type DLvv = ['Literal', 'z://', 'en'];
	type DLvx = ['Literal', 'z://', 'fr'];
	type DLvsv = ['Literal', 'z://', string, 'x://'];
	type DLvov = ['Literal', 'z://', void, 'x://'];
	type DLvox = ['Literal', 'z://', void, 'w://'];

	const DLvoomDLvoo: ASSERT_TRUE<TermsEqual<
		['Literal', 'z://', void, void],
		['Literal', 'z://', void, void]
	>> = 1;


	type DB = ['BlankNode'];
	type DBv = ['BlankNode', 'z://'];

	type DD = ['DefaultGraph'];
	type DI = ['Invalid'];

	const DN_DN: ASSERT_BOOLEAN<TermsEqual<DN, DN>> = 1;
	const DN_DNs: ASSERT_BOOLEAN<TermsEqual<DN, DNs>> = 1;
	const DNs_DN: ASSERT_BOOLEAN<TermsEqual<DNs, DN>> = 1;
	const DNs_DNs: ASSERT_BOOLEAN<TermsEqual<DNs, DNs>> = 1;
	const DNso_DNso: ASSERT_BOOLEAN<TermsEqual<DNso, DNso>> = 1;
	const DNsoo_DNsoo: ASSERT_BOOLEAN<TermsEqual<DNsoo, DNsoo>> = 1;

	const DNv_DNv: ASSERT_TRUE<TermsEqual<DNv, DNv>> = 1;
	const DNvo_DNvo: ASSERT_TRUE<TermsEqual<DNvo, DNvo>> = 1;
	const DNvoo_DNvoo: ASSERT_TRUE<TermsEqual<DNvoo, DNvoo>> = 1;

	const DL_DL: ASSERT_BOOLEAN<TermsEqual<DL, DL>> = 1;
	const DL_DLv: ASSERT_BOOLEAN<TermsEqual<DL, DLv>> = 1;
	const DLv_DLv: ASSERT_BOOLEAN<TermsEqual<DLv, DLv>> = 1;
	const DLvo_DLvo: ASSERT_BOOLEAN<TermsEqual<DLvo, DLvo>> = 1;
	const DLvoo_DLvoo: ASSERT_TRUE<TermsEqual<DLvoo, DLvoo>> = 1;
	const DLvoo_DLvs: ASSERT_BOOLEAN<TermsEqual<DLvoo, DLvs>> = 1;
	const DLvoo_DLvv: ASSERT_FALSE<TermsEqual<DLvoo, DLvv>> = 1;
	const DLvoo_DLvso: ASSERT_BOOLEAN<TermsEqual<DLvoo, DLvso>> = 1;

	const DLvv_DLvvv: ASSERT_TRUE<TermsEqual<DLvv, DLvvr>> = 1;
	const DLvoo_DLv_v: ASSERT_TRUE<TermsEqual<DLvoo, DLv_k>> = 1;

	const DLvsv_DLvov: ASSERT_TRUE<TermsEqual<DLvsv, DLvov>> = 1;
	const DLvsv_DLv_v: ASSERT_TRUE<TermsEqual<DLvsv, DLv_v>> = 1;


	const DN_DB: ASSERT_FALSE<TermsEqual<DN, DB>> = 1;
	const DN_DD: ASSERT_FALSE<TermsEqual<DN, DD>> = 1;
	const DN_DI: ASSERT_BOOLEAN<TermsEqual<DN, DI>> = 1;

	const DN_DBv: ASSERT_FALSE<TermsEqual<DN, DBv>> = 1;
	const DNv_DBv: ASSERT_FALSE<TermsEqual<DNv, DBv>> = 1;
	const DNvo_DBv: ASSERT_FALSE<TermsEqual<DNvo, DBv>> = 1;
	const DNvoo_DBv: ASSERT_FALSE<TermsEqual<DNvoo, DBv>> = 1;



	// Comparing against non-object-types
	const NaDa: ASSERT_FALSE<TermsEqual<['NamedNode', 'A', void, void], ['DefaultGraph', '', void, void]>> = 1;
	const DaNa: ASSERT_FALSE<TermsEqual<['DefaultGraph', '', void, void], ['NamedNode', 'A', void, void]>> = 1;
	const DaDa: ASSERT_TRUE<TermsEqual<['DefaultGraph', '', void, void], ['DefaultGraph', '', void, void]>> = 1;

	// Comparing against invalid types
	const NaIa: ASSERT_BOOLEAN<TermsEqual<['NamedNode', 'A', void, void], ['Invalid', 'A', void, void]>> = 1;
	const IaNa: ASSERT_BOOLEAN<TermsEqual<['Invalid', 'A', void, void], ['NamedNode', 'A', void, void]>> = 1;
	const IaIa: ASSERT_BOOLEAN<TermsEqual<['Invalid', 'A', void, void], ['Invalid', 'A', void, void]>> = 1;

	// NamedNodes and BlankNodes
	const NaNs: ASSERT_BOOLEAN<TermsEqual<['NamedNode', 'A', void, void], ['NamedNode', string, void, void]>> = 1;
	const NaNa: ASSERT_TRUE<TermsEqual<['NamedNode', 'A', void, void], ['NamedNode', 'A', void, void]>> = 1;
	const BaBa: ASSERT_TRUE<TermsEqual<['BlankNode', 'A', void, void], ['BlankNode', 'A', void, void]>> = 1;

	// Unions
	const NBvNv: ASSERT_BOOLEAN<TermsEqual<['NamedNode' | 'BlankNode', 'A', void, void], ['NamedNode', 'A', void, void]>> = 1;

	// Literal  [s=string; v='val'; x=other]
	const LsssLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', string, string, string]>> = 1;

	// Literal with only value
	const LsssLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', 'A', string, string]>> = 1;
	const LvssLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', string, string], ['Literal', string, string, string]>> = 1;
	const LvssLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', string, string], ['Literal', 'A', string, string]>> = 1;
	const LvssLxss: ASSERT_FALSE<TermsEqual<['Literal', 'A', string, string], ['Literal', 'B', string, string]>> = 1;

	// Simple Literals
	const LsooLvoo: ASSERT_BOOLEAN<TermsEqual<['Literal', string, '', void], ['Literal', 'A', '', void]>> = 1;
	const LvooLsoo: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', '', void], ['Literal', string, '', void]>> = 1;
	const LvooLvoo: ASSERT_TRUE<TermsEqual<['Literal', 'A', '', void], ['Literal', 'A', '', void]>> = 1;
	const LvooLxoo: ASSERT_FALSE<TermsEqual<['Literal', 'A', '', void], ['Literal', 'B', '', void]>> = 1;

	// Literal with only language
	const LsssLsvs: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', string, 'en', string]>> = 1;
	const LsvsLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, 'en', string], ['Literal', string, string, string]>> = 1;
	const LsvsLsvs: ASSERT_BOOLEAN<TermsEqual<['Literal', string, 'en', string], ['Literal', string, 'en', string]>> = 1;
	const LsvsLsxs: ASSERT_FALSE<TermsEqual<['Literal', string, 'en', string], ['Literal', string, 'fr', string]>> = 1;

	// Literal with only datatype
	const LsssLssv: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', string, string, 'z://']>> = 1;
	const LssvLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, 'z://'], ['Literal', string, string, string]>> = 1;
	const LssvLssv: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, 'z://'], ['Literal', string, string, 'z://']>> = 1;
	const LssvLssx: ASSERT_FALSE<TermsEqual<['Literal', string, string, 'z://'], ['Literal', string, string, 'y://']>> = 1;

	// Literal with value and language
	const LsssLvvs: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', 'A', 'en', string]>> = 1;
	const LvssLsvs: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', string, string], ['Literal', string, 'en', string]>> = 1;
	const LsvsLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, 'en', string], ['Literal', 'A', string, string]>> = 1;
	const LvvsLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', 'en', string], ['Literal', string, string, string]>> = 1;
	const LvvsLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', 'en', string], ['Literal', 'A', string, string]>> = 1;
	const LvvsLxss: ASSERT_FALSE<TermsEqual<['Literal', 'A', 'en', string], ['Literal', 'B', string, string]>> = 1;
	const LvvsLsvs: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', 'en', string], ['Literal', string, 'en', string]>> = 1;
	const LvvsLsxs: ASSERT_FALSE<TermsEqual<['Literal', 'A', 'en', string], ['Literal', string, 'fr', string]>> = 1;
	const LvssLvvs: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', string, string], ['Literal', 'A', 'en', string]>> = 1;
	const LvssLxvs: ASSERT_FALSE<TermsEqual<['Literal', 'A', string, string], ['Literal', 'B', 'en', string]>> = 1;
	const LsvsLvvs: ASSERT_BOOLEAN<TermsEqual<['Literal', string, 'en', string], ['Literal', 'A', 'en', string]>> = 1;
	const LsvsLvxs: ASSERT_FALSE<TermsEqual<['Literal', string, 'en', string], ['Literal', 'A', 'fr', string]>> = 1;
	const LvvsLvvs: ASSERT_TRUE<TermsEqual<['Literal', 'A', 'en', string], ['Literal', 'A', 'en', string]>> = 1;
	const LvvsLvxs: ASSERT_FALSE<TermsEqual<['Literal', 'A', 'en', string], ['Literal', 'A', 'fr', string]>> = 1;
	const LvvsLxvs: ASSERT_FALSE<TermsEqual<['Literal', 'A', 'en', string], ['Literal', 'B', 'en', string]>> = 1;

	// Literal with value and datatype
	const LsssLvsv: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, string], ['Literal', 'A', 'z://', string]>> = 1;
	const LvssLssv: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', string, string], ['Literal', string, 'z://', string]>> = 1;
	const LssvLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, 'z://'], ['Literal', 'A', string, string]>> = 1;
	const LvsvLsss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', string, 'z://'], ['Literal', string, string, string]>> = 1;
	const LvsvLvss: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', string, 'z://'], ['Literal', 'A', string, string]>> = 1;
	const LvsvLxss: ASSERT_FALSE<TermsEqual<['Literal', 'A', string, 'z://'], ['Literal', 'B', string, string]>> = 1;
	const LvsvLssv: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', string, 'z://'], ['Literal', string, string, 'z://']>> = 1;
	const LvsvLssx: ASSERT_FALSE<TermsEqual<['Literal', 'A', string, 'z://'], ['Literal', string, string, 'y://']>> = 1;
	const LvssLvsv: ASSERT_BOOLEAN<TermsEqual<['Literal', 'A', string, string], ['Literal', 'A', string, 'z://']>> = 1;
	const LvssLxsv: ASSERT_FALSE<TermsEqual<['Literal', 'A', string, string], ['Literal', 'B', string, 'z://']>> = 1;
	const LssvLvsv: ASSERT_BOOLEAN<TermsEqual<['Literal', string, string, 'z://'], ['Literal', 'A', string, 'z://']>> = 1;
	const LssvLvsx: ASSERT_FALSE<TermsEqual<['Literal', string, string, 'z://'], ['Literal', 'A', string, 'y://']>> = 1;
	const LvsvLvsv: ASSERT_TRUE<TermsEqual<['Literal', 'A', string, 'z://'], ['Literal', 'A', string, 'z://']>> = 1;
	const LvsvLvsx: ASSERT_FALSE<TermsEqual<['Literal', 'A', string, 'z://'], ['Literal', 'A', string, 'y://']>> = 1;
	const LvsvLxsv: ASSERT_FALSE<TermsEqual<['Literal', 'A', string, 'z://'], ['Literal', 'B', string, 'z://']>> = 1;



	const PNv: TermData = {
		termType: 'NamedNode',
		value: 'z://',
	};

	const RNv: Term = {
		termType: 'NamedNode',
		value: 'z://',
		equals(y_other: TermData): boolean {
			return false;
		},
	};

	const MNv: Term<DNv> = {
		termType: 'NamedNode',
		value: 'z://',
		equals<
			a_descriptor_b extends Descriptor,
			ReturnType extends TermsEqual,
			>(y_other: TermData<a_descriptor_b>): ReturnType {
			return (this.termType === y_other.termType && this.value === y_other.value) as ReturnType;
		},
	};

	const MLv: Term<DNv> = {
		termType: 'NamedNode',
		value: 'z://',
		equals<
			a_descriptor_b extends Descriptor,
			ReturnType extends TermsEqual,
			>(y_other: TermData<a_descriptor_b>): ReturnType {
			return (this.termType === y_other.termType && this.value === y_other.value) as ReturnType;
		},
	};


	const MNvC: Term = {
		termType: 'NamedNode',
		value: 'z://',
		equals(y_other: TermData): boolean {
			return (this.termType === y_other.termType && this.value === y_other.value);
		},
	};

	const F = MNvC.equals({ termType: 'Literal', value: 'orange', language: 'en' });


	const CNv2: TermData = {
		termType: 'NamedNode',
		value: 'z://',
		equals(y_other: TermData): boolean {
			return (this.termType === y_other.termType && this.value === y_other.value);
		},
	};

	const Css: TermData = {
		termType: 'NamedNode',
		value: 'z://',
	};

	const CNs: TermData<['NamedNode']> = {
		termType: 'NamedNode',
		value: 'z://',
	};

	const CNv: TermData<['NamedNode', 'z://']> = {
		termType: 'NamedNode',
		value: 'z://',
	};

	const MNv_Mnv: true = MNv.equals(MNv);
	const MNv_Css_T: TermsEqual<DNv, ['NamedNode']> = true;
	const MNv_Css_F: TermsEqual<DNv, ['NamedNode']> = false;
	const MNv_CNs = MNv.equals(CNs);
	const MNv_CNv: true = MNv.equals(CNv);

	const S!: Term;

	const SNv!: Term<['NamedNode', 'z://', void, void]>;
	const SBv!: Term<['BlankNode', 'z://', void, void]>;
	const SNx!: Term<['NamedNode', 'y://', void, void]>;
	const SBx!: Term<['BlankNode', 'y://', void, void]>;

	const S_SNv: boolean = SNv.equals(S);

	const SNv_SNv: true = SNv.equals(SNv);
	const SNv_SBv: false = SNv.equals(SBv);
	const SNv_SNx: false = SNv.equals(SNx);
	const SNv_SBx: false = SNv.equals(SBx);

	const SBv_SBv: true = SBv.equals(SBv);
	const SBv_SNv: false = SBv.equals(SNv);
	const SBv_SBx: false = SBv.equals(SBx);
	const SBv_SNx: false = SBv.equals(SNx);

	declare function namedNode<ValueString extends string>(value: ValueString): Term<['NamedNode', ValueString]>;

	const ANv = namedNode('z://');
	const test = ANv.value;

	/* eslint-enable @typescript-eslint/no-unused-vars */
}
