

export namespace RDFJS {

	interface TermTypes {
		NamedNode: NamedNode;
		BlankNode: BlankNode;
		Literal: Literal;
		Variable: {};
		DefaultGraph: {};
		Quad: {};
	}

    type ValidTermTypes<
        KeySet extends string,
        TermTypeStringA extends string,
        TermTypeStringB extends string,
    > = And<
        If<
            IsOnlyLiteralStrings<TermTypeStringA>,
            Extends<TermTypeStringA, KeySet>,
            true,
        >,
        If<
            IsOnlyLiteralStrings<TermTypeStringB>,
            Extends<TermTypeStringB, KeySet>,
            true,
        >,
    >;

    {
        const HS: ASSERT_FALSE<Extends<string, ObjectTypeKey>> = 1;
        const HN: ASSERT_TRUE<Extends<'NamedNode', ObjectTypeKey>> = 1;
        const HD: ASSERT_FALSE<Extends<'DefaultGraph', ObjectTypeKey>> = 1;
        const HI: ASSERT_FALSE<Extends<'Invalid', ObjectTypeKey>> = 1;

        const OSS: ValidTermTypes<ObjectTypeKey, string, string> = true;
        const OSD: ValidTermTypes<ObjectTypeKey, string, 'DefaultGraph'> = false;
        const OSI: ValidTermTypes<ObjectTypeKey, string, 'Invalid'> = false;
        const ODS: ValidTermTypes<ObjectTypeKey, 'DefaultGraph', string> = false;
        const OIS: ValidTermTypes<ObjectTypeKey, 'Invalid', string> = false;
        const ODD: ValidTermTypes<ObjectTypeKey, 'DefaultGraph', 'DefaultGraph'> = false;
        const ODI: ValidTermTypes<ObjectTypeKey, 'DefaultGraph', 'Invalid'> = false;
        const OID: ValidTermTypes<ObjectTypeKey, 'Invalid', 'DefaultGraph'> = false;
        const OII: ValidTermTypes<ObjectTypeKey, 'Invalid', 'Invalid'> = false;

        const OSN: ValidTermTypes<ObjectTypeKey, string, 'NamedNode'> = true;
        const ONS: ValidTermTypes<ObjectTypeKey, 'NamedNode', string> = true;
        const ONN: ValidTermTypes<ObjectTypeKey, 'NamedNode', 'NamedNode'> = true;
        const OND: ValidTermTypes<ObjectTypeKey, 'NamedNode', 'DefaultGraph'> = false;
        const ONI: ValidTermTypes<ObjectTypeKey, 'NamedNode', 'Invalid'> = false;

        const OSB: ValidTermTypes<ObjectTypeKey, string, 'BlankNode'> = true;
        const OBS: ValidTermTypes<ObjectTypeKey, 'BlankNode', string> = true;
        const OBB: ValidTermTypes<ObjectTypeKey, 'BlankNode', 'BlankNode'> = true;
        const OBD: ValidTermTypes<ObjectTypeKey, 'BlankNode', 'DefaultGraph'> = false;
        const OBI: ValidTermTypes<ObjectTypeKey, 'BlankNode', 'Invalid'> = false;

        const OSL: ValidTermTypes<ObjectTypeKey, string, 'Literal'> = true;
        const OLS: ValidTermTypes<ObjectTypeKey, 'Literal', string> = true;
        const OLL: ValidTermTypes<ObjectTypeKey, 'Literal', 'Literal'> = true;
        const OLD: ValidTermTypes<ObjectTypeKey, 'Literal', 'DefaultGraph'> = false;
        const OLI: ValidTermTypes<ObjectTypeKey, 'Literal', 'Invalid'> = false;

        const ONB: ValidTermTypes<ObjectTypeKey, 'NamedNode', 'BlankNode'> = true;
        const ONL: ValidTermTypes<ObjectTypeKey, 'NamedNode', 'Literal'> = true;

        const OBN: ValidTermTypes<ObjectTypeKey, 'BlankNode', 'NamedNode'> = true;
        const OBL: ValidTermTypes<ObjectTypeKey, 'BlankNode', 'Literal'> = true;

        const OLN: ValidTermTypes<ObjectTypeKey, 'Literal', 'NamedNode'> = true;
        const OLB: ValidTermTypes<ObjectTypeKey, 'Literal', 'BlankNode'> = true;
    }

	type TermTypeKey = keyof TermTypes;
    type NodeTypeKey = 'NamedNode' | 'BlankNode';
    type ObjectTypeKey = NodeTypeKey | 'Literal';
    type GraphTypeKey = NodeTypeKey | 'DefaultGraph';

	type NonQuadTermTypeKey = keyof Omit<TermTypes, 'Quad'>;

    // type TermDescriptor = [string, string, string|void, string|void];
    type TermDescriptor =
        | [string]
        | [string, string]
        | [string, string, string|void]
        | [string, string, string|void, string|void];

    type ValidTermTypesMatch<
        KeySet extends string,
		TermTypeStringA extends string,
		ValueStringA extends string,
		TermTypeStringB extends string,
		ValueStringB extends string,
    > = If<
        ValidTermTypes<KeySet, TermTypeStringA, TermTypeStringB>,
        And<
            StringsMatch<TermTypeStringA, TermTypeStringB>,
            StringsMatch<ValueStringA, ValueStringB>,
        >,
    >;

    type NodesMatch<
		TermTypeStringA extends string,
		ValueStringA extends string,
		TermTypeStringB extends string,
		ValueStringB extends string,
    > = ValidTermTypesMatch<NodeTypeKey, TermTypeStringA, ValueStringA, TermTypeStringB, ValueStringB>;

    type NamedNodesMatch<
		TermTypeStringA extends string,
		ValueStringA extends string,
		TermTypeStringB extends string,
		ValueStringB extends string,
    > = ValidTermTypesMatch<'NamedNode', TermTypeStringA, ValueStringA, TermTypeStringB, ValueStringB>;

    type GraphsMatch<
		TermTypeStringA extends string,
		ValueStringA extends string,
		TermTypeStringB extends string,
		ValueStringB extends string,
    > = ValidTermTypesMatch<GraphTypeKey, TermTypeStringA, ValueStringA, TermTypeStringB, ValueStringB>;

    {
        const FALSE = 0;
        const TRUE = 1;
        const EITHER = 2;
        const NEVER!: never;

        const SsSs: NodesMatch<string,      string, string,      string> = EITHER;

        const SsSv: NodesMatch<string,      string, string,      'A'   > = EITHER;
        const SsNs: NodesMatch<string,      string, 'NamedNode', string> = EITHER;
        const SvSs: NodesMatch<string,      'A',    string,      string> = EITHER;
        const NsSs: NodesMatch<'NamedNode', string, string,      string> = EITHER;

        const SsNv: NodesMatch<string,      string, 'NamedNode', 'A'   > = EITHER;
        const SvSv: NodesMatch<string,      'A',    string,      'A'   > = EITHER;
        const SvSx: NodesMatch<string,      'A',    string,      'B'   > = FALSE;
        const SvNs: NodesMatch<string,      'A',    'NamedNode', string> = EITHER;
        const NsSv: NodesMatch<'NamedNode', string, string,      'A'   > = EITHER;
        const BsSv: NodesMatch<'BlankNode', string, string,      'A'   > = EITHER;
        const LsSv: NodesMatch<'Literal',   string, string,      'A'   > = NEVER;
        const IsSv: NodesMatch<'Invalid',   string, string,      'A'   > = NEVER;
        const NsNs: NodesMatch<'NamedNode', string, 'NamedNode', string> = EITHER;
        const NsBs: NodesMatch<'NamedNode', string, 'BlankNode', string> = FALSE;
        const NsLs: NodesMatch<'NamedNode', string, 'Literal',   string> = NEVER;
        const NsIs: NodesMatch<'NamedNode', string, 'Invalid',   string> = NEVER;
        const NvSs: NodesMatch<'NamedNode', 'A',    string,      string> = EITHER;

        const SvNv: NodesMatch<string,      'A',    'NamedNode', 'A'   > = EITHER;
        const SvNx: NodesMatch<string,      'A',    'NamedNode', 'B'   > = FALSE;
        const NsNv: NodesMatch<'NamedNode', string, 'NamedNode', 'A'   > = EITHER;
        const NsBv: NodesMatch<'NamedNode', string, 'BlankNode', 'A'   > = FALSE;
        const NsLv: NodesMatch<'NamedNode', string, 'Literal',   'A'   > = NEVER;
        const NsIv: NodesMatch<'NamedNode', string, 'Invalid',   'A'   > = NEVER;
        const NvSv: NodesMatch<'NamedNode', 'A',    string,      'A'   > = EITHER;
        const NvSx: NodesMatch<'NamedNode', 'A',    string,      'B'   > = FALSE;
        const NvNs: NodesMatch<'NamedNode', 'A',    'NamedNode', string> = EITHER;
        const NvBs: NodesMatch<'NamedNode', 'A',    'BlankNode', string> = FALSE;
        const NvLs: NodesMatch<'NamedNode', 'A',    'Literal',   string> = NEVER;
        const NvIs: NodesMatch<'NamedNode', 'A',    'Invalid',   string> = NEVER;

        const NvNv: NodesMatch<'NamedNode', 'A',    'NamedNode', 'A'   > = TRUE;
        const NvNx: NodesMatch<'NamedNode', 'A',    'NamedNode', 'B'   > = FALSE;
        const NvBv: NodesMatch<'NamedNode', 'A',    'BlankNode', 'A'   > = FALSE;
        const BvNv: NodesMatch<'BlankNode', 'A',    'NamedNode', 'A'   > = FALSE;
        const BvBv: NodesMatch<'BlankNode', 'A',    'BlankNode', 'A'   > = TRUE;
        const BvBx: NodesMatch<'BlankNode', 'A',    'BlankNode', 'B'   > = FALSE;

        const NvLv: NodesMatch<'NamedNode', 'A',    'Literal',   'A'   > = NEVER;
        const NvIv: NodesMatch<'NamedNode', 'A',    'Invalid',   'A'   > = NEVER;
        const BvLv: NodesMatch<'BlankNode', 'A',    'Literal',   'A'   > = NEVER;
        const BvIv: NodesMatch<'BlankNode', 'A',    'Invalid',   'A'   > = NEVER;

        const LvNv: NodesMatch<'Literal',   'A',   'NamedNode', 'A'    > = NEVER;
        const IvNv: NodesMatch<'Invalid',   'A',   'NamedNode', 'A'    > = NEVER;
        const LvBv: NodesMatch<'Literal',   'A',   'BlankNode', 'A'    > = NEVER;
        const IvBv: NodesMatch<'Invalid',   'A',   'BlankNode', 'A'    > = NEVER;
    }

    `
        if ValidTermTypes(ObjectTypeKey, TermTypeStringA, TermTypeStringB):
            TermTypeAndValueStringsMatch = TermTypeStringA == TermTypeStringB and ValueStringA == ValueStringB
            
            if TermTypeAndValueStringsMatch is not True:
                return false
            
            if TermTypeStringA == 'Literal' or TermTypeStringB == 'Literal':
                LanguageStringAKnown = IsActualString(LanguageStringA)
                DatatypeStringAKnown = IsActualString(DatatypeStringA)
                LanguageStringBKnown = IsActualString(LanguageStringB)
                DatatypeStringBKnown = IsActualString(DatatypeStringB)

                if (LanguageStringAKnown or LanguageStringBKnown) and (DatatypeStringAKnown or DatatypeStringBKnown):
                    if LanguageStringAKnown:
                        if DatatypeStringA != DatatypeStringB:
                            return false
                        else:
                            return TermTypeAndValueStringsMatch
                    else:
    `

    type P_XSD_STRING = 'http://www.w3.org/2001/XMLSchema#string';
    type P_RDFS_LANGSTRING = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString';

    type AutoDatatype<
        DatatypeString extends string|void,
        AutoLanguageString,
    > = If<
        StringsMatch<AsString<AutoLanguageString>, ''>,
        AutoString<DatatypeString, P_XSD_STRING>,
        If<
            IsOnlyLiteralStrings<AsString<AutoLanguageString>>,
            P_RDFS_LANGSTRING,
            AutoString<DatatypeString>,
        >,
    >;

    type NarrowLanguage<
        AutoLanguageString,
        AutoDatatypeString,
    > = If<
        And<
            Includes<AutoLanguageString, string>,
            And<
                Not<Includes<AutoDatatypeString, P_RDFS_LANGSTRING>>,
                Not<Includes<AutoDatatypeString, string>>,
            >,
        >,
        '',
        AutoLanguageString,
    >;

    type NormalizeLanguageDatatype<
        LanguageString extends string|void,
        DatatypeString extends string|void,
    > = AutoString<LanguageString, ''> extends infer AutoLanguageString
        ? (AutoDatatype<DatatypeString, AutoLanguageString> extends infer AutoDatatypeString
            ? (NarrowLanguage<AutoLanguageString, AutoDatatypeString> extends infer NarrowLanguageString
                ? [NarrowLanguageString, AutoDatatypeString]
                : never
            )
            : never
        )
        : never;

    {
        // language takes precedence over datatype
        const VV: ASSERT_SAME<NormalizeLanguageDatatype<'en', 'z://'>, ['en', P_RDFS_LANGSTRING]> = 1;
        const VS: ASSERT_SAME<NormalizeLanguageDatatype<'en', string>, ['en', P_RDFS_LANGSTRING]> = 1;
        const VO: ASSERT_SAME<NormalizeLanguageDatatype<'en', void>, ['en', P_RDFS_LANGSTRING]> = 1;
        // even for unions
        const VU: ASSERT_SAME<NormalizeLanguageDatatype<'en', 'z://'|string>, ['en', P_RDFS_LANGSTRING]> = 1;

        // language unions make it thru
        const UV: ASSERT_SAME<NormalizeLanguageDatatype<'en'|'fr', 'z://'>, ['en'|'fr', P_RDFS_LANGSTRING]> = 1;
        const US: ASSERT_SAME<NormalizeLanguageDatatype<'en'|'fr', string>, ['en'|'fr', P_RDFS_LANGSTRING]> = 1;
        const UO: ASSERT_SAME<NormalizeLanguageDatatype<'en'|'fr', void>, ['en'|'fr', P_RDFS_LANGSTRING]> = 1;

        // empty string language
        const _V: ASSERT_SAME<NormalizeLanguageDatatype<'', 'z://'>, ['', 'z://']> = 1;
        const _S: ASSERT_SAME<NormalizeLanguageDatatype<'', string>, ['', string]> = 1;
        const _O: ASSERT_SAME<NormalizeLanguageDatatype<'', void>, ['', P_XSD_STRING]> = 1;

        // datatype unions make it thru
        const _U: ASSERT_SAME<NormalizeLanguageDatatype<'', 'z://'|'y://'>, ['', 'z://'|'y://']> = 1;
        const OU: ASSERT_SAME<NormalizeLanguageDatatype<void, 'z://'|'y://'>, ['', 'z://'|'y://']> = 1;
        const SU: ASSERT_SAME<NormalizeLanguageDatatype<string, 'z://'|'y://'>, ['', 'z://'|'y://']> = 1;

        // void language => ''
        const OV: ASSERT_SAME<NormalizeLanguageDatatype<void, 'z://'>, ['', 'z://']> = 1;
        const OS: ASSERT_SAME<NormalizeLanguageDatatype<void, string>, ['', string]> = 1;
        const OO: ASSERT_SAME<NormalizeLanguageDatatype<void, void>, ['', P_XSD_STRING]> = 1;

        type DEBUG = NormalizeLanguageDatatype<'en', string>;
    }

    {
        type _ = '';
        type E = 'en';

        type V = 'z://';

        const V_: ASSERT_EQUAL<AutoDatatype<V, ''>, V> = 1;
        const VE: ASSERT_EQUAL<AutoDatatype<V, E>, P_RDFS_LANGSTRING> = 1;
        const VS: ASSERT_EQUAL<AutoDatatype<V, string>, V> = 1;

        const S_: ASSERT_STRING<AutoDatatype<string, ''>> = 1;
        const SE: ASSERT_EQUAL<AutoDatatype<string, E>, P_RDFS_LANGSTRING> = 1;
        const SS: ASSERT_STRING<AutoDatatype<string, string>> = 1;

        const O_: ASSERT_EQUAL<AutoDatatype<void, ''>, P_XSD_STRING> = 1;
        const OE: ASSERT_EQUAL<AutoDatatype<void, E>, P_RDFS_LANGSTRING> = 1;
        const OS: ASSERT_STRING<AutoDatatype<void, string>> = 1;
    }

	type ObjectsEqualN<
		TermTypeStringA extends string,
		ValueStringA extends string,
		LanguageStringA extends string|void,
		DatatypeStringA extends string|void,
		TermTypeStringB extends string,
		ValueStringB extends string,
		LanguageStringB extends string|void,
		DatatypeStringB extends string|void,
	> = If<
        ValidTermTypes<ObjectTypeKey, TermTypeStringA, TermTypeStringB>,
        // (a.termType and b.termType) are each either unknown or in {object-type-key}
        And<
            StringsMatch<TermTypeStringA, TermTypeStringB>,
            StringsMatch<ValueStringA, ValueStringB>,
        > extends infer TermTypeAndValueStringsMatch
            // (TermType|Value)StringsMatch := a.(termType|value) === b.(termType|value)
            ? (Not<AsBool<TermTypeAndValueStringsMatch>> extends true
                // a.termType !== b.termType || a.value !== b.value
                ? false
                // mixed termTypes and values
                : (Or<
                    StringsMatch<TermTypeStringA, 'Literal'>,
                    StringsMatch<TermTypeStringB, 'Literal'>,
                > extends true
                    // (a|b).termType === 'Literal'
                    ? ([
                        AutoString<LanguageStringA, ''>,
                        AutoString<LanguageStringB, ''>,
                    ] extends [
                        infer AutoLanguageStringA,
                        infer AutoLanguageStringB,
                    ]
                        // AutoLanguageString = LanguageString || ''
                        ? ([
                            AutoDatatype<DatatypeStringA, AutoLanguageStringA>,
                            AutoDatatype<DatatypeStringB, AutoLanguageStringB>,
                        ] extends [
                            infer AutoDatatypeStringA,
                            infer AutoDatatypeStringB,
                        ]
                            // AutoDatatypeString = AutoLanguageString? 'rdfs:langString': DatatypeString || 'xsd:string'
                            ? ([
                                NarrowLanguage<AutoLanguageStringA, AutoDatatypeStringA>,
                                NarrowLanguage<AutoLanguageStringB, AutoDatatypeStringB>,
                            ] extends [
                                infer NarrowLanguageStringA,
                                infer NarrowLanguageStringB,
                            ]
                                // NarrowLanguageString = AutoDatatypeString !== 'rdfs:langString' && AutoLanguageString includes `string`? '': AutoLanguageString
                                ? If<
                                    Or<
                                        Not<StringsMatch<AsString<NarrowLanguageStringA>, AsString<NarrowLanguageStringB>>>,
                                        Not<StringsMatch<AsString<AutoDatatypeStringA>, AsString<AutoDatatypeStringB>>>,
                                    >,
                                    // a.language !== b.language || a.datatype !== b.datatype
                                    false,
                                    // return a.language === b.language && a.datatype === b.datatype
                                    And<
                                        AsBool<TermTypeAndValueStringsMatch>,
                                        And<
                                            StringsMatch<AsString<NarrowLanguageStringA>, AsString<NarrowLanguageStringB>>,
                                            StringsMatch<AsString<AutoDatatypeStringA>, AsString<AutoDatatypeStringB>>,
                                        >,
                                    >,
                                >
                                : never
                            )
                            : never
                        )
                        : never
                    )
                    : NodesMatch<
                        TermTypeStringA, ValueStringA,
                        TermTypeStringB, ValueStringB,
                    >
                )
            )
            : never
    >;

	type ObjectsEqual<
		TermTypeStringA extends string,
		ValueStringA extends string,
		LanguageStringA extends string|void,
		DatatypeStringA extends string|void,
		TermTypeStringB extends string,
		ValueStringB extends string,
		LanguageStringB extends string|void,
		DatatypeStringB extends string|void,
	> = If<
        ValidTermTypes<ObjectTypeKey, TermTypeStringA, TermTypeStringB>,
        // (a.termType and b.termType) are each either unknown or in {object-type-key}
        And<
            StringsMatch<TermTypeStringA, TermTypeStringB>,
            StringsMatch<ValueStringA, ValueStringB>,
        > extends infer TermTypeAndValueStringsMatch
            // (TermType|Value)StringsMatch := a.(termType|value) === b.(termType|value)
            ? (Not<AsBool<TermTypeAndValueStringsMatch>> extends true
                // a.termType !== b.termType || a.value !== b.value
                ? false
                // mixed termTypes and values
                : (Or<
                    StringsMatch<TermTypeStringA, 'Literal'>,
                    StringsMatch<TermTypeStringB, 'Literal'>,
                > extends true
                    // (a|b).termType === 'Literal'
                    ? ([
                        ...NormalizeLanguageDatatype<LanguageStringA, DatatypeStringA>,
                        ...NormalizeLanguageDatatype<LanguageStringB, DatatypeStringB>,
                    ] extends [
                        infer NormalizeLanguageStringA, infer NormalizeDatatypeStringA,
                        infer NormalizeLanguageStringB, infer NormalizeDatatypeStringB,
                    ]
                        // AutoLanguageString = LanguageString || ''
                        // AutoDatatypeString = AutoLanguageString? 'rdfs:langString': DatatypeString || 'xsd:string'
                        // NarrowLanguageString = AutoDatatypeString !== 'rdfs:langString' && AutoLanguageString includes `string`? '': AutoLanguageString
                        // Normalize(Language|Datatype)String = [NarrowLanguageString, AutoDatatypeString]
                        ? If<
                            Or<
                                Not<StringsMatch<AsString<NormalizeLanguageStringA>, AsString<NormalizeLanguageStringB>>>,
                                Not<StringsMatch<AsString<NormalizeDatatypeStringA>, AsString<NormalizeDatatypeStringB>>>,
                            >,
                            // a.language !== b.language || a.datatype !== b.datatype
                            false,
                            // return a.language === b.language && a.datatype === b.datatype
                            And<
                                AsBool<TermTypeAndValueStringsMatch>,
                                And<
                                    StringsMatch<AsString<NormalizeLanguageStringA>, AsString<NormalizeLanguageStringB>>,
                                    StringsMatch<AsString<NormalizeDatatypeStringA>, AsString<NormalizeDatatypeStringB>>,
                                >,
                            >,
                        >
                        : never
                    )
                    : NodesMatch<
                        TermTypeStringA, ValueStringA,
                        TermTypeStringB, ValueStringB,
                    >
                )
            )
            : never
    >;


    {

        // Comparing against non-object-types
        const NaDa: ASSERT_NEVER<ObjectsEqual<'NamedNode',    'A', void, void, 'DefaultGraph', '',  void, void>> = 1;
        const DaNa: ASSERT_NEVER<ObjectsEqual<'DefaultGraph', '',  void, void, 'NamedNode',    'A', void, void>> = 1;
        const DaDa: ASSERT_NEVER<ObjectsEqual<'DefaultGraph', '',  void, void, 'DefaultGraph', '',  void, void>> = 1;

        // Comparing against invalid types
        const NaIa: ASSERT_NEVER<ObjectsEqual<'NamedNode', 'A', void, void, 'Invalid',   'A', void, void>> = 1;
        const IaNa: ASSERT_NEVER<ObjectsEqual<'Invalid',   'A', void, void, 'NamedNode', 'A', void, void>> = 1;
        const IaIa: ASSERT_NEVER<ObjectsEqual<'Invalid',   'A', void, void, 'Invalid',   'A', void, void>> = 1;

        // NamedNodes and BlankNodes
        const NaNs: ASSERT_BOOLEAN<ObjectsEqual<'NamedNode', 'A', void, void, 'NamedNode', string, void, void>> = 1;
        const NaNa: ASSERT_TRUE   <ObjectsEqual<'NamedNode', 'A', void, void, 'NamedNode', 'A',    void, void>> = 1;
        const BaBa: ASSERT_TRUE   <ObjectsEqual<'BlankNode', 'A', void, void, 'BlankNode', 'A',    void, void>> = 1;

        // Unions
        const NBvNv: ASSERT_BOOLEAN<ObjectsEqual<'NamedNode' | 'BlankNode', 'A', void, void, 'NamedNode', 'A', void, void>> = 1;

        // Literal  [s=string; v='val'; x=other]
        const LsssLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', string, string, string>> = 1;

        // Literal with only value
        const LsssLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', 'A',    string, string>> = 1;
        const LvssLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', string, string, string>> = 1;
        const LvssLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'A',    string, string>> = 1;
        const LvssLxss: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'B',    string, string>> = 1;

        // Simple Literals
        const LsooLvoo: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, '',   void, 'Literal', 'A',      '',   void>> = 1;
        const LvooLsoo: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    '',   void, 'Literal', string,   '',   void>> = 1;
        const LvooLvoo: ASSERT_TRUE   <ObjectsEqual<'Literal', 'A',    '',   void, 'Literal', 'A',      '',   void>> = 1;
        const LvooLxoo: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    '',   void, 'Literal', 'B',      '',   void>> = 1;

        // Literal with only language
        const LsssLsvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', string, 'en',   string>> = 1;
        const LsvsLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', string, string, string>> = 1;
        const LsvsLsvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', string, 'en',   string>> = 1;
        const LsvsLsxs: ASSERT_FALSE  <ObjectsEqual<'Literal', string, 'en',   string, 'Literal', string, 'fr',   string>> = 1;

        // Literal with only datatype
        const LsssLssv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', string, string, 'z://'>> = 1;
        const LssvLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', string, string, string>> = 1;
        const LssvLssv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', string, string, 'z://'>> = 1;
        const LssvLssx: ASSERT_FALSE  <ObjectsEqual<'Literal', string, string, 'z://', 'Literal', string, string, 'y://'>> = 1;

        // Literal with value and language
        const LsssLvvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', 'A',    'en',   string>> = 1;
        const LvssLsvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', string, 'en',   string>> = 1;
        const LsvsLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', 'A',    string, string>> = 1;
        const LvvsLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', string, string, string>> = 1;
        const LvvsLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'A',    string, string>> = 1;
        const LvvsLxss: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'B',    string, string>> = 1;
        const LvvsLsvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', string, 'en',   string>> = 1;
        const LvvsLsxs: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', string, 'fr',   string>> = 1;
        const LvssLvvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'A',    'en',   string>> = 1;
        const LvssLxvs: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'B',    'en',   string>> = 1;
        const LsvsLvvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', 'A',    'en',   string>> = 1;
        const LsvsLvxs: ASSERT_FALSE  <ObjectsEqual<'Literal', string, 'en',   string, 'Literal', 'A',    'fr',   string>> = 1;
        const LvvsLvvs: ASSERT_TRUE   <ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'A',    'en',   string>> = 1;
        const LvvsLvxs: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'A',    'fr',   string>> = 1;
        const LvvsLxvs: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'B',    'en',   string>> = 1;

        // Literal with value and datatype
        const LsssLvsv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', 'A',    'z://', string>> = 1;
        const LvssLssv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', string, 'z://', string>> = 1;
        const LssvLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', 'A',    string, string>> = 1;
        const LvsvLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', string, string, string>> = 1;
        const LvsvLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'A',    string, string>> = 1;
        const LvsvLxss: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'B',    string, string>> = 1;
        const LvsvLssv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', string, string, 'z://'>> = 1;
        const LvsvLssx: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', string, string, 'y://'>> = 1;
        const LvssLvsv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'A',    string, 'z://'>> = 1;
        const LvssLxsv: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'B',    string, 'z://'>> = 1;
        const LssvLvsv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', 'A',    string, 'z://'>> = 1;
        const LssvLvsx: ASSERT_FALSE  <ObjectsEqual<'Literal', string, string, 'z://', 'Literal', 'A',    string, 'y://'>> = 1;
        const LvsvLvsv: ASSERT_TRUE   <ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'A',    string, 'z://'>> = 1;
        const LvsvLvsx: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'A',    string, 'y://'>> = 1;
        const LvsvLxsv: ASSERT_FALSE  <ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'B',    string, 'z://'>> = 1;
    }

	type QuadsMatch<
		TermTypeStringA extends string,
		ValueStringA extends string,
		LanguageStringA extends string,
		DatatypeStringA extends string,

		SubjectTermTypeStringA extends string,
		SubjectValueStringA extends string,
		PredicateTermTypeStringA extends string,
		PredicateValueStringA extends string,
		ObjectTermTypeStringA extends string,
		ObjectValueStringA extends string,
		ObjectLanguageStringA extends string,
		ObjectDatatypeStringA extends string,
		GraphTermTypeStringA extends string,
		GraphValueStringA extends string,

		TermTypeStringB extends string,
		ValueStringB extends string,
		LanguageStringB extends string,
		DatatypeStringB extends string,

		SubjectTermTypeStringB extends string,
		SubjectValueStringB extends string,
		PredicateTermTypeStringB extends string,
		PredicateValueStringB extends string,
		ObjectTermTypeStringB extends string,
		ObjectValueStringB extends string,
		ObjectLanguageStringB extends string,
		ObjectDatatypeStringB extends string,
		GraphTermTypeStringB extends string,
		GraphValueStringB extends string,
	> = And<
        And<
            And<
                StringPairsMatch<SubjectTermTypeStringA, SubjectTermTypeStringB, SubjectValueStringA, SubjectValueStringB>,
                StringPairsMatch<PredicateTermTypeStringA, PredicateTermTypeStringB, PredicateValueStringA, PredicateValueStringB>,
            >,
            ObjectsEqual<
                ObjectTermTypeStringA,
                ObjectValueStringA,
                ObjectLanguageStringA,
                ObjectDatatypeStringA,
                ObjectTermTypeStringB,
                ObjectValueStringB,
                ObjectLanguageStringB,
                ObjectDatatypeStringB,
            >,
        >,
        StringPairsMatch<GraphTermTypeStringA, GraphTermTypeStringB, GraphValueStringA, GraphValueStringB>,
    >;

    // {
    //     const SsSs: StringPairsMatch<string,      string,      string, string> = EITHER;

    //     const SsSv: StringPairsMatch<string,      string,      string, 'z://'> = EITHER;
    //     const SvSs: StringPairsMatch<string,      string,      'z://', string> = EITHER;
    //     const SsNs: StringPairsMatch<string,      'NamedNode', string, string> = EITHER;
    //     const NsSs: StringPairsMatch<'NamedNode', string,      string, string> = EITHER;

    //     const SvSv: StringPairsMatch<string,      string,      'z://', 'z://'> = EITHER;
    //     const SvSx: StringPairsMatch<string,      string,      'z://', 'y://'> = FALSE;
    //     const SsNv: StringPairsMatch<string,      'NamedNode', string, 'z://'> = EITHER;
    //     const SvNs: StringPairsMatch<string,      'NamedNode', 'z://', string> = EITHER;
    //     const NsSv: StringPairsMatch<'NamedNode', string,      string, 'z://'> = EITHER;
    //     const NvSs: StringPairsMatch<'NamedNode', string,      'z://', string> = EITHER;
    //     const NsNs: StringPairsMatch<'NamedNode', 'NamedNode', string, string> = EITHER;
    //     const NsBs: StringPairsMatch<'NamedNode', 'BlankNode', string, string> = FALSE;

    //     const SvNv: StringPairsMatch<string,      'NamedNode', 'z://', 'z://'> = EITHER;
    //     const SvNx: StringPairsMatch<string,      'NamedNode', 'z://', 'y://'> = FALSE;
    //     const NvNs: StringPairsMatch<'NamedNode', 'NamedNode', 'z://', string> = EITHER;
    //     const NvBs: StringPairsMatch<'NamedNode', 'BlankNode', 'z://', string> = FALSE;
    //     const NsNv: StringPairsMatch<'NamedNode', 'NamedNode', string, 'z://'> = EITHER;
    //     const NsBv: StringPairsMatch<'NamedNode', 'BlankNode', string, 'z://'> = FALSE;
    //     const NvSv: StringPairsMatch<'NamedNode', string,      'z://', 'z://'> = EITHER;
    //     const NvSx: StringPairsMatch<'NamedNode', string,      'z://', 'y://'> = FALSE;
    //     const NvNv: StringPairsMatch<'NamedNode', 'NamedNode', 'z://', 'z://'> = TRUE;
    //     const NvNx: StringPairsMatch<'NamedNode', 'NamedNode', 'z://', 'y://'> = FALSE;
    //     const NvBv: StringPairsMatch<'NamedNode', 'BlankNode', 'z://', 'z://'> = FALSE;
    //     const NvBx: StringPairsMatch<'NamedNode', 'BlankNode', 'z://', 'x://'> = FALSE;
    // }

    type TermsEqual<
        DescriptorA extends TermDescriptor=TermDescriptor,
        DescriptorB extends TermDescriptor=TermDescriptor,

		TermTypeStringA extends string=DescriptorA[0],
		ValueStringA extends string=AutoString<DescriptorA[1]>,
		LanguageStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[2]>,
		DatatypeStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[3]>,

		TermTypeStringB extends string=DescriptorB[0],
		ValueStringB extends string=AutoString<DescriptorB[1]>,
		LanguageStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[2]>,
		DatatypeStringB extends string|void=ConditionalLiteralString<TermTypeStringB, DescriptorB[3]>,
    > = If<
        ValidTermTypes<TermTypeKey, TermTypeStringA, TermTypeStringB>,
        // (a|b).termType are strings in {valid-term-type-keys}
        If<
            Or<
                Extends<TermTypeStringA, ObjectTypeKey>,
                Extends<TermTypeStringB, ObjectTypeKey>,
            >,
            // (a|b).termType in {object-term-type-keys}; return ObjectsMatch(a, b)
            ObjectsEqual<
                TermTypeStringA, ValueStringA, LanguageStringA, DatatypeStringA,
                TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB,
            >,
            // (a|b).termType are not in {object-term-type-keys}; return a.termType === b.termType && a.value === b.value
            And<
                AsBool<StringsMatch<TermTypeStringA, TermTypeStringB>>,
                AsBool<StringsMatch<ValueStringA, ValueStringB>>,
            >,
        >,
    >;

    type ConditionalLiteralString<
        TermTypeString extends string,
        LanguageOrDatatypeString extends string|void,
    > = 'Literal' extends TermTypeString
        ? (LanguageOrDatatypeString extends undefined
            ? string
            : LanguageOrDatatypeString
        )
        : void;


	export type TermData<
        Descriptor extends TermDescriptor=TermDescriptor,
		TermTypeString extends string=Descriptor[0],
		ValueString extends string=AutoString<Descriptor[1]>,
		LanguageString extends string|void=ConditionalLiteralString<TermTypeString, Descriptor[2]>,
		DatatypeString extends string|void=ConditionalLiteralString<TermTypeString, Descriptor[3]>,
	> = {
		termType: TermTypeString;
		value: ValueString;
        equals?(y_other: TermData): boolean;
    }
    & ('Literal' extends TermTypeString
        ? (NormalizeLanguageDatatype<LanguageString, DatatypeString> extends [
            infer NormalizeLanguageString,
            infer NormalizeDatatypeString,
        ]
            ? (TermTypeString extends 'Literal'
                ? {
                    language: NormalizeLanguageString;
                    datatype: Datatype<AsString<NormalizeDatatypeString>>;
                }
                : {
                    language?: NormalizeLanguageString;
                    datatype?: Datatype<AsString<NormalizeDatatypeString>>;
                }
            )
            : never
        )
        : unknown
    ) & {
        [si_key: string]: any;
    };

    type BypassDescriptor = [never];

	export type Term<
        DescriptorA extends TermDescriptor=BypassDescriptor,

        // these are provided for descriptor inferencing
		TermTypeStringA extends string=DescriptorA[0] extends never? string: DescriptorA[0],
		ValueStringA extends string=AutoString<DescriptorA[1]>,
		LanguageStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[2]>,
		DatatypeStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[3]>,
	> = Pick<
        TermData<
            // DescriptorA
            [TermTypeStringA, ValueStringA, LanguageStringA, DatatypeStringA],
            TermTypeStringA,
            ValueStringA,
            LanguageStringA,
            DatatypeStringA,
        >,
        'termType' | 'value' | (
            // only include language and datatype keys if termType can be 'Literal'
            'Literal' extends TermTypeStringA
                ? 'language' | 'datatype'
                : 'termType'
        ),
    > & (DescriptorA extends BypassDescriptor
        ? {
            equals(y_other: TermData): boolean;
        }
        : {
            equals<
                DescriptorB extends TermDescriptor|void=void,
                TermTypeStringB extends string=string,
                ValueStringB extends string=string,
                LanguageStringB extends string|void=string|void,
                DatatypeStringB extends string|void=string|void,
            >(y_other: DescriptorB extends TermDescriptor
                ? TermData<DescriptorB, TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB> | Term<DescriptorB, TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB>
                : TermData
            ): DescriptorB extends TermDescriptor
                ? TermsEqual<DescriptorA, [TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB]>
                : boolean;
        }
    );

    {
        type DN    = ['NamedNode'];
        type DNs   = ['NamedNode', string];
        type DNso  = ['NamedNode', string, void];
        type DNsoo = ['NamedNode', string, void, void];
        type DNv   = ['NamedNode', 'z://'];
        type DNvo  = ['NamedNode', 'z://', void];
        type DNvoo = ['NamedNode', 'z://', void, void];
        type DNx   = ['NamedNode', 'y://'];
        type DNxo  = ['NamedNode', 'y://', void];
        type DNxoo = ['NamedNode', 'y://', void, void];

        type DL    = ['Literal'];
        type DLv   = ['Literal', 'z://'];
        type DLvo  = ['Literal', 'z://', void];
        type DLvs  = ['Literal', 'z://', string];
        type DLvso = ['Literal', 'z://', string, void];
        type DLvoo = ['Literal', 'z://', void, void];
        type DLv_k = ['Literal', 'z://', '', P_XSD_STRING];
        type DLv_v = ['Literal', 'z://', '', 'x://'];
        type DLvvr = ['Literal', 'z://', 'en', P_RDFS_LANGSTRING];
        type DLx   = ['Literal', 'y://'];
        type DLxo  = ['Literal', 'y://', void];
        type DLxoo = ['Literal', 'y://', void, void];
        type DLvv  = ['Literal', 'z://', 'en'];
        type DLvx  = ['Literal', 'z://', 'fr'];
        type DLvsv = ['Literal', 'z://', string, 'x://'];
        type DLvov = ['Literal', 'z://', void, 'x://'];
        type DLvox = ['Literal', 'z://', void, 'w://'];

        const DLvoomDLvoo: ASSERT_TRUE<ObjectsEqual<
            'Literal', 'z://', void, void,
            'Literal', 'z://', void, void,
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
        const DN_DD: ASSERT_NEVER<TermsEqual<DN, DD>> = 1;
        const DN_DI: ASSERT_NEVER<TermsEqual<DN, DI>> = 1;

        const DN_DBv: ASSERT_FALSE<TermsEqual<DN, DBv>> = 1;
        const DNv_DBv: ASSERT_FALSE<TermsEqual<DNv, DBv>> = 1;
        const DNvo_DBv: ASSERT_FALSE<TermsEqual<DNvo, DBv>> = 1;
        const DNvoo_DBv: ASSERT_FALSE<TermsEqual<DNvoo, DBv>> = 1;

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
                DescriptorB extends TermDescriptor,
                ReturnType extends TermsEqual,
            >(y_other: TermData<DescriptorB>): ReturnType {
                return (this.termType === y_other.termType && this.value === y_other.value) as ReturnType;
            },
        };

        const MLv: Term<DNv> = {
            termType: 'NamedNode',
            value: 'z://',
            equals<
                DescriptorB extends TermDescriptor,
                ReturnType extends TermsEqual,
            >(y_other: TermData<DescriptorB>): ReturnType {
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

        const F = MNvC.equals({termType: 'hi', value:'orange'});


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
    }

	export type NamedNode<ValueString extends string=string> = Term<['NamedNode', ValueString]>;

	export type BlankNode<ValueString extends string=string> = Term<['BlankNode', ValueString]>;

	export type Literal<
		TermTypeString extends string=string,
		ValueString extends string=string,
		LanguageString extends string=string,
		DatatypeString extends string=string,
	> = TermTypeString extends `${infer ActualTermTypeString}`
		? (TermTypeString extends 'Literal'
			? Term<['Literal', ValueString, LanguageString, DatatypeString]>
			: never
		)
		: Term<['Literal', ValueString, LanguageString, DatatypeString]>;


	export type Variable<ValueString extends string=string> = Term<['Variable', ValueString]>;

	export type DefaultGraph<TermTypeString extends string=string> = 
		TermTypeString extends `${infer ActualTermTypeString}`
			? TermTypeString extends 'DefaultGraph'
				? Term<['DefaultGraph', '']>
				: never
			: Term<['DefaultGraph', '']>;

	export type Datatype<DatatypeString extends string=string> = NamedNode<DatatypeString>;

	export type Node<
		TermTypeString extends string=string,
		ValueString extends string=string,
	> = IsSingleString<TermTypeString> extends true
		? (TermTypeString extends 'NamedNode'
			? NamedNode<ValueString>
			: (TermTypeString extends 'BlankNode'
				? BlankNode<ValueString>
				: never
			)
		)
		: NamedNode<ValueString> | BlankNode<ValueString>;
	
	export type Subject<
		TermTypeString extends string=string,
		ValueString extends string=string,
	> = Node<TermTypeString, ValueString>;

	export type Predicate<
		TermTypeString extends string=string,
		ValueString extends string=string,
	> = TermTypeString extends `${infer ActualTermTypeString}`
		? (TermTypeString extends 'NamedNode'
			? NamedNode<ValueString>
			: never
		)
		: NamedNode<ValueString>;

	export type Object<
		TermTypeString extends string=string,
		ValueString extends string=string,
		LanguageString extends string=string,
		DatatypeString extends string=string,
	> = Node<TermTypeString, ValueString>
		| Literal<TermTypeString, ValueString, LanguageString, DatatypeString>;

	export type Graph<
		TermTypeString extends string=string,
		ValueString extends string=string,
	> = TermTypeString extends `${infer ActualTermTypeString}`
		? Node<ActualTermTypeString, ValueString> | DefaultGraph<ActualTermTypeString>
		: Node<TermTypeString, ValueString> | DefaultGraph;




	// TermTypesAnd
	
	// SrcTermTypeString extends `${infer ActualSrcTermTypeString}`
	// 	? (ArgTermTypeString extends `${infer ActualArgTermTypeString}`
	// 		? (ActualArgTermTypeString extends ActualSrcTermTypeString

	// 		)
	// 		: boolean
	// 	)
	// 	: boolean;


	export type Quad<
		SubjectTermTypeStringA extends string=string,
		SubjectValueStringA extends string=string,
		PredicateTermTypeStringA extends string=string,
		PredicateValueStringA extends string=string,
		ObjectTermTypeStringA extends string=string,
		ObjectValueStringA extends string=string,
		ObjectLanguageStringA extends string=string,
		ObjectDatatypeStringA extends string=string,
		GraphTermTypeStringA extends string=string,
		GraphValueStringA extends string=string,
	> = {
		type: 'Quad';
		value: '';
		equals<
			TypeB extends BasicTerm=BasicTerm,
			// TermTypeStringB extends string=string,
			// ValueStringB extends string=string,
			// SubjectTermTypeStringB extends string=string,
			// SubjectValueStringB extends string=string,
			// PredicateTermTypeStringB extends string=string,
			// PredicateValueStringB extends string=string,
			// ObjectTermTypeStringB extends string=string,
			// ObjectValueStringB extends string=string,
			// ObjectLanguageStringB extends string=string,
			// ObjectDatatypeStringB extends string=string,
			// GraphTermTypeStringB extends string=string,
			// GraphValueStringB extends string=string,
		>(y_other: TypeB):
			TypeB extends Quad<infer TermTypeStringB, ValueStringB, >l

			OtherType extends Term<OtherTermType, OtherValueString>
				? OtherTermTypeString extends `${infer ActualOtherTermTypeString}`
					? (ActualOtherTermTypeString extends 'Quad'
					? (And<StringsMatch<SubjectTermTypeString, OtherSubjectTermTypeString>, StringsMatch<SubjectValueString, OtherSubjectValueString>> extends infer SubjectsMatch
						? (StringsMatch<PredicateValueString, OtherPredicateValueString> extends infer PredicatesMatch
							? (And<
									And<
										And<
											StringsMatch<ObjectTermTypeString, OtherObjectTermTypeString>,
											StringsMatch<ObjectValueString, OtherObjectTermTypeString>
										>,
										StringsMatch<ObjectLanguageString, OtherObjectLanguageString>
							>)
							? And<And<And<SubjectsMatch, PredicatesMatch>, ObjectsEqual>, GraphsMatch>


						? (OtherValueString extends `${infer ActualOtherValueString}`
							? (ActualOtherValueString extends ''
								? (OtherType extends Quad<
									OtherSubjectTermTypeString,
									OtherSubjectValueString,
									OtherPredicateTermTypeString,
									OtherPredicateValueString,
									OtherObjectTermTypeString,
									OtherObjectValueString,
									OtherObjectLanguageString,
									OtherObjectDatatypeString,
									OtherGraphTermTypeString,
									OtherGraphValueString,
								>
									? (OtherSubjectTermTypeString extends `${infer ActualOtherSubjectTermTypeString}`
										? (ActualOtherSubjectTermTypeString extends SubjectTermTypeString
											? (

											)
											: false
										)
										: boolean
									)
									: booleann
								)
								: false
							)
							: false  // other.value
						)
						: never  // other.termType !== 'Quad'
					)
					: boolean
				: boolean;
				

				(TermTypeString extends `${infer ActualTermTypeString}`
					? TermTypeString extends TermTypeKey
						? OtherTermType extends `${infer ActualOtherTermTypeString}`
							? ActualOtherTermTypeString extends ActualTermTypeString
								// this.termType === other.termType
								? ValueString extends `${infer ActualValueString}`
									? OtherValueString extends `${infer ActualOtherValueString}`
										? ActualOtherValueString extends ActualValueString
											? true  // this.value === other.value
											: false  // this.value !== other.value
										: boolean
									: boolean
								// this.termType !== other.termType
								: false
							: boolean
						: boolean
					: never)  // !RDFJS.TermTypes.includes(this.termType)
				& (ValueString extends `${infer ActualValueString}`
					? OtherValueString extends `${infer ActualOtherValueString}`
						? ActualOtherValueString extends ActualValueString
							? boolean  // this.value === other.value
							: false  // this.value !== other.value
						: boolean
					: boolean);

		subject: Subject<SubjectTermTypeString, SubjectValueString>;
		predicate: Predicate<PredicateTermTypeString, PredicateValueString>;
		object: Object<ObjectTermTypeString, ObjectValueString, ObjectLanguageString, ObjectDatatypeString>;
		graph: Graph<GraphTermTypeString, GraphValueString>;
	};

	let ggg!: Quad<'NamedNode', 'hi'>;
	let g2!: Quad<'NamedNode', 'hi'>;
	const fff = ggg.equals(g2);
}
