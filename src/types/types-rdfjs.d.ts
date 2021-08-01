
type ASSERT_TRUE<Test extends boolean> = [Test] extends [true]? 1: 0;
type ASSERT_FALSE<Test extends boolean> = [Test] extends [false]? 1: 0;
type ASSERT_BOOLEAN<Test extends boolean> = [Test] extends [false]? 0: ([Test] extends [true]? 0: 1);
type ASSERT_NEVER<Test> = [Test] extends [never]? 1: 0;

{
    const TEST_TRUE_boolean: ASSERT_TRUE<boolean> = 0;
    const TEST_TRUE_false: ASSERT_TRUE<false> = 0;
    const TEST_TRUE_true: ASSERT_TRUE<true> = 1;

    const TEST_FALSE_boolean: ASSERT_FALSE<boolean> = 0;
    const TEST_FALSE_false: ASSERT_FALSE<false> = 1;
    const TEST_FALSE_true: ASSERT_FALSE<true> = 0;

    const TEST_BOOLEAN_boolean: ASSERT_BOOLEAN<boolean> = 1;
    const TEST_BOOLEAN_false: ASSERT_BOOLEAN<false> = 0;
    const TEST_BOOLEAN_true: ASSERT_BOOLEAN<true> = 0;
}

type Extends<A, B> = A extends B? true: false;

type AsBool<Any> = [Any] extends [true]? true: ([Any] extends [false]? false: boolean);

type IsActualBoolean<Boolean extends boolean> = [Boolean] extends [true]? true: ([Boolean] extends [false]? true: false);

type And<BooleanA extends boolean, BooleanB extends boolean> = [BooleanA] extends [false]
    ? false
    : ([BooleanB] extends [false]
        ? false
        : ([BooleanA] extends [true]
            ? ([BooleanB] extends [true]
                ? true
                : boolean
            )
            : boolean
        )
    );

type Or<BooleanA extends boolean, BooleanB extends boolean> = [BooleanA] extends [true]
	? true
	: ([BooleanB] extends [true]
		? true
		: ([BooleanA] extends [false]
			? ([BooleanB] extends [false]
				? false
				: boolean
			)
			: boolean
		)
    );

type Not<Boolean extends boolean> = [Boolean] extends [true]
	? false
	: [Boolean] extends [false]
		? true
		: boolean;

type Xor<
    BooleanA extends boolean,
    BooleanB extends boolean,
> = And<
        IsActualBoolean<BooleanA>,
        IsActualBoolean<BooleanB>
    > extends true
        ? ([BooleanA] extends [false]
            ? ([BooleanB] extends [true]
                ? true
                : false
            )
            : ([BooleanB] extends [false]
                ? true
                : false
            )
        )
        : boolean;

type If<
    Condition extends boolean,
    Then,
    Else=never,
> = [Condition] extends [true]? Then: Else;


type AsString<Any> = [Any] extends [string]
    ? Any
    : string;

type IsActualString<String extends string | void> = [String] extends [string]
    ? ([String] extends [`${infer ActualString}`]
        ? true
        : false
    ): false;

type ActualStringsMatch<
	StringA extends `${string}`,
	StringB extends `${string}`,
> = And<
    Extends<StringA, StringB>,
    Extends<StringB, StringA>,
>;

type StringsMatch<
	StringA extends string|void,
	StringB extends string|void,
> = [StringA, StringB] extends [`${infer ActualStringA}`, `${infer ActualStringB}`]
	? ActualStringsMatch<ActualStringA, ActualStringB>
	: ([
        Extends<[StringA], [void]>,
        Extends<[StringB], [void]>,
    ] extends [
        infer StringAVoid,
        infer StringBVoid,
    ]
        ? (Xor<AsBool<StringAVoid>, AsBool<StringBVoid>> extends true
            ? false
            : If<
                And<AsBool<StringAVoid>, AsBool<StringBVoid>>,
                true,
                boolean,
            >
        )
        : boolean
    );



// tests
{
	const Af_Bf: ASSERT_FALSE<And<false, false>> = 1;
	const Af_Bt: ASSERT_FALSE<And<false, true>> = 1;
	const At_Bf: ASSERT_FALSE<And<true, false>> = 1;
	const At_Bt: ASSERT_TRUE<And<true, true>> = 1;

	const Ab_Bb: ASSERT_BOOLEAN<And<boolean, boolean>> = 1;
	const Ab_Bf: ASSERT_FALSE<And<boolean, false>> = 1;
	const Ab_Bt: ASSERT_BOOLEAN<And<boolean, true>> = 1;
	const Af_Bb: ASSERT_FALSE<And<false, boolean>> = 1;
	const At_Bb: ASSERT_BOOLEAN<And<true, boolean>> = 1;

	const AfIBf: ASSERT_FALSE<Or<false, false>> = 1;
	const AfIBt: ASSERT_TRUE<Or<false, true>> = 1;
	const AtIBf: ASSERT_TRUE<Or<true, false>> = 1;
	const AtIBt: ASSERT_TRUE<Or<true, true>> = 1;

	const AbIBb: ASSERT_BOOLEAN<Or<boolean, boolean>> = 1;
	const AbIBf: ASSERT_BOOLEAN<Or<boolean, false>> = 1;
	const AbIBt: ASSERT_TRUE<Or<boolean, true>> = 1;
	const AfIBb: ASSERT_BOOLEAN<Or<false, boolean>> = 1;
	const AtIBb: ASSERT_TRUE<Or<true, boolean>> = 1;
 
    const Actual: ASSERT_TRUE<IsActualString<'A'>> = 1;
    const Union: ASSERT_TRUE<IsActualString<'A' | 'B'>> = 1;
    const String: ASSERT_FALSE<IsActualString<string>> = 1;
 
    const AmA: ASSERT_TRUE<StringsMatch<'A', 'A'>> = 1;
    const AmB: ASSERT_FALSE<StringsMatch<'A', 'B'>> = 1;
    const AmS: ASSERT_BOOLEAN<StringsMatch<'A', string>> = 1;
    const SmA: ASSERT_BOOLEAN<StringsMatch<string, 'A'>> = 1;
    const SmS: ASSERT_BOOLEAN<StringsMatch<string, string>> = 1;

    const OmO: ASSERT_TRUE<StringsMatch<void, void>> = 1;
    const OmA: ASSERT_FALSE<StringsMatch<void, 'A'>> = 1;
    const OmS: ASSERT_FALSE<StringsMatch<void, string>> = 1;
    const AmO: ASSERT_FALSE<StringsMatch<'A', void>> = 1;
    const SmO: ASSERT_FALSE<StringsMatch<string, void>> = 1;
}

type StringPairsMatch<
    StringA1 extends string,
    StringB1 extends string,
    StringA2 extends string,
    StringB2 extends string,
> = And<
    StringsMatch<StringA1, StringB1>,
    StringsMatch<StringA2, StringB2>,
>;


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
            IsActualString<TermTypeStringA>,
            Extends<TermTypeStringA, KeySet>,
            true,
        >,
        If<
            IsActualString<TermTypeStringB>,
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
        ([
            StringsMatch<TermTypeStringA, TermTypeStringB>,
            StringsMatch<ValueStringA, ValueStringB>,
        ] extends [
            infer TermTypeStringsMatch,
            infer ValueStringsMatch,
        ]
            // (TermType|Value)StringsMatch := a.(termType|value) === b.(termType|value)
            ? (Or<
                Not<AsBool<TermTypeStringsMatch>>,
                Not<AsBool<ValueStringsMatch>>,
            > extends true
                // a.termType !== b.termType || a.value !== b.value
                ? false
                // mixed termTypes and values
                : (Or<
                    StringsMatch<TermTypeStringA, 'Literal'>,
                    StringsMatch<TermTypeStringB, 'Literal'>,
                > extends true
                    // (a|b).termType === 'Literal'
                    ? ([
                        IsActualString<LanguageStringA>,
                        IsActualString<DatatypeStringA>,
                        IsActualString<LanguageStringB>,
                        IsActualString<DatatypeStringB>,
                    ] extends [
                        infer LanguageStringAKnown,
                        infer DatatypeStringAKnown,
                        infer LanguageStringBKnown,
                        infer DatatypeStringBKnown,
                    ]
                        // (Language|Datatype)String(A|B)Known := (a|b).(language|datatype) is known
                        ? (And<
                            Or<AsBool<LanguageStringAKnown>, AsBool<DatatypeStringAKnown>>,
                            Or<AsBool<LanguageStringBKnown>, AsBool<DatatypeStringBKnown>>,
                        > extends true
                            // a.(language|datatype) is known && b.(language|datatype) is known
                            ? (AsBool<LanguageStringAKnown> extends true
                                // a.language is known && b.(language|datatype) is known
                                ? If<
                                    Not<StringsMatch<LanguageStringA, LanguageStringB>>,
                                    false,
                                    And<
                                        AsBool<TermTypeStringsMatch>,
                                        AsBool<ValueStringsMatch>,
                                    >,
                                >
                                // a.datatype is known && b.(language|datatype) is known
                                : If<
                                    Not<StringsMatch<DatatypeStringA, DatatypeStringB>>,
                                    false,
                                    And<
                                        AsBool<TermTypeStringsMatch>,
                                        AsBool<ValueStringsMatch>,
                                    >,
                                >
                            )
                            : If<
                                Or<
                                    And<
                                        Extends<[LanguageStringA], [void]>,
                                        Extends<[LanguageStringB], [void]>,
                                    >,
                                    And<
                                        Extends<[DatatypeStringA], [void]>,
                                        Extends<[DatatypeStringB], [void]>,
                                    >,
                                >,
                                true,
                                boolean,
                            >
                        ): never
                    )
                    // (a|b).termType !== 'Literal'
                    // return (a.termType === b.termType && a.value === b.value)
                    : And<
                        AsBool<TermTypeStringsMatch>,
                        AsBool<ValueStringsMatch>,
                    >
                )
            ): never
        )
    >;

    {
        // Comparing against non-object-types
        const NaDa: ASSERT_NEVER<ObjectsEqual<'NamedNode',    'A', string, string, 'DefaultGraph', '',  string, string>> = 1;
        const DaNa: ASSERT_NEVER<ObjectsEqual<'DefaultGraph', '',  string, string, 'NamedNode',    'A', string, string>> = 1;
        const DaDa: ASSERT_NEVER<ObjectsEqual<'DefaultGraph', '',  string, string, 'DefaultGraph', '',  string, string>> = 1;

        // Comparing against invalid types
        const NaIa: ASSERT_NEVER<ObjectsEqual<'NamedNode', 'A', string, string, 'Invalid',   'A', string, string>> = 1;
        const IaNa: ASSERT_NEVER<ObjectsEqual<'Invalid',   'A', string, string, 'NamedNode', 'A', string, string>> = 1;
        const IaIa: ASSERT_NEVER<ObjectsEqual<'Invalid',   'A', string, string, 'Invalid',   'A', string, string>> = 1;

        // NamedNodes and BlankNodes
        const NaNs: ASSERT_BOOLEAN<ObjectsEqual<'NamedNode', 'A', string, string, 'NamedNode', string, string, string>> = 1;
        const NaNa: ASSERT_TRUE<ObjectsEqual<'NamedNode', 'A', string, string, 'NamedNode', 'A', string, string>> = 1;
        const BaBa: ASSERT_TRUE<ObjectsEqual<'BlankNode', 'A', string, string, 'BlankNode', 'A', string, string>> = 1;

        // Literal  [s=string; v='val'; x=other]
        const LsssLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', string, string, string>> = 1;

        // Literal with only value
        const LsssLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', 'A',    string, string>> = 1;
        const LvssLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', string, string, string>> = 1;
        const LvssLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'A',    string, string>> = 1;
        const LvssLxss: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'B',    string, string>> = 1;
        
        // Literal with only language
        const LsssLsvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', string, 'en',   string>> = 1;
        const LsvsLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', string, string, string>> = 1;
        const LsvsLsvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', string, 'en',   string>> = 1;
        const LsvsLsxs: ASSERT_FALSE<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', string, 'fr',   string>> = 1;

        // Literal with only datatype
        const LsssLssv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', string, string, 'z://'>> = 1;
        const LssvLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', string, string, string>> = 1;
        const LssvLssv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', string, string, 'z://'>> = 1;
        const LssvLssx: ASSERT_FALSE<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', string, string, 'y://'>> = 1;

        // Literal with value and language
        const LsssLvvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', 'A',    'en',   string>> = 1;
        const LvssLsvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', string, 'en',   string>> = 1;
        const LsvsLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', 'A',    string, string>> = 1;
        const LvvsLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', string, string, string>> = 1;
        const LvvsLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'A',    string, string>> = 1;
        const LvvsLxss: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'B',    string, string>> = 1;
        const LvvsLsvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', string, 'en',   string>> = 1;
        const LvvsLsxs: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', string, 'fr',   string>> = 1;
        const LvssLvvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'A',    'en',   string>> = 1;
        const LvssLxvs: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'B',    'en',   string>> = 1;
        const LsvsLvvs: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', 'A',    'en',   string>> = 1;
        const LsvsLvxs: ASSERT_FALSE<ObjectsEqual<'Literal', string, 'en',   string, 'Literal', 'A',    'fr',   string>> = 1;
        const LvvsLvvs: ASSERT_TRUE<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'A',    'en',   string>> = 1;
        const LvvsLvxs: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'A',    'fr',   string>> = 1;
        const LvvsLxvs: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    'en',   string, 'Literal', 'B',    'en',   string>> = 1;

        // Literal with value and datatype
        const LsssLvsv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, string, 'Literal', 'A',    'z://', string>> = 1;
        const LvssLssv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', string, 'z://', string>> = 1;
        const LssvLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', 'A',    string, string>> = 1;
        const LvsvLsss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', string, string, string>> = 1;
        const LvsvLvss: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'A',    string, string>> = 1;
        const LvsvLxss: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'B',    string, string>> = 1;
        const LvsvLssv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', string, string, 'z://'>> = 1;
        const LvsvLssx: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', string, string, 'y://'>> = 1;
        const LvssLvsv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'A',    string, 'z://'>> = 1;
        const LvssLxsv: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    string, string, 'Literal', 'B',    string, 'z://'>> = 1;
        const LssvLvsv: ASSERT_BOOLEAN<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', 'A',    string, 'z://'>> = 1;
        const LssvLvsx: ASSERT_FALSE<ObjectsEqual<'Literal', string, string, 'z://', 'Literal', 'A',    string, 'y://'>> = 1;
        const LvsvLvsv: ASSERT_TRUE<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'A',    string, 'z://'>> = 1;
        const LvsvLvsx: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'A',    string, 'y://'>> = 1;
        const LvsvLxsv: ASSERT_FALSE<ObjectsEqual<'Literal', 'A',    string, 'z://', 'Literal', 'B',    string, 'z://'>> = 1;
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
    > = IsActualString<TermTypeString> extends true
        ? (TermTypeString extends 'Literal'
            ? LanguageOrDatatypeString
            : void
        )
        : string;

    type AutoString<
        String,
    > = String extends string? String: string

	export type ComparableTerm<
        DescriptorA extends TermDescriptor=TermDescriptor,
		TermTypeStringA extends string=DescriptorA[0],
		ValueStringA extends string=AutoString<DescriptorA[1]>,
		LanguageStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[2]>,
		DatatypeStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[3]>,
	> = {
		termType: TermTypeStringA;
		value: ValueStringA;
        equals?(y_other: ComparableTerm): boolean;
    } & (TermTypeStringA extends 'Literal'
        ? {
            language: LanguageStringA;
            datatype: Datatype<AsString<DatatypeStringA>>;
        }
        : unknown
    ) & {
        [si_key: string]: any;
    };

    type VoidDescriptor = ['@VOID'];

	export type Term<
        DescriptorA extends TermDescriptor=VoidDescriptor,

        // these are provided for descriptor inferencing
		TermTypeStringA extends string=DescriptorA[0],
		ValueStringA extends string=AutoString<DescriptorA[1]>,
		LanguageStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[2]>,
		DatatypeStringA extends string|void=ConditionalLiteralString<TermTypeStringA, DescriptorA[3]>,
	> = Pick<
        ComparableTerm<
            DescriptorA,
            TermTypeStringA,
            ValueStringA,
            LanguageStringA,
            DatatypeStringA,
        >, 'termType' | 'value'> & (DescriptorA extends VoidDescriptor
        ? {
            equals(y_other: ComparableTerm): boolean;
        }
        : {
            equals<
                DescriptorB extends TermDescriptor|void=void,
                TermTypeStringB extends string=string,
                ValueStringB extends string=string,
                LanguageStringB extends string|void=string|void,
                DatatypeStringB extends string|void=string|void,
            >(y_other: DescriptorB extends TermDescriptor
                ? ComparableTerm<DescriptorB, TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB> | SmartTerm<DescriptorB, TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB>
                : ComparableTerm
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
        type DLvso  = ['Literal', 'z://', string, void];
        type DLvoo = ['Literal', 'z://', void, void];
        type DLx   = ['Literal', 'y://'];
        type DLxo  = ['Literal', 'y://', void];
        type DLxoo = ['Literal', 'y://', void, void];
        type DLvv  = ['Literal', 'z://', 'en'];
        type DLvx  = ['Literal', 'z://', 'fr'];
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

        const DL_DL: ASSERT_TRUE<TermsEqual<DL, DL>> = 1;
        const DL_DLv: ASSERT_BOOLEAN<TermsEqual<DL, DLv>> = 1;
        const DLv_DLv: ASSERT_TRUE<TermsEqual<DLv, DLv>> = 1;
        const DLvo_DLvo: ASSERT_TRUE<TermsEqual<DLvo, DLvo>> = 1;
        const DLvoo_DLvoo: ASSERT_TRUE<TermsEqual<DLvoo, DLvoo>> = 1;
        const DLvoo_DLvs: ASSERT_FALSE<TermsEqual<DLvoo, DLvs>> = 1;
        const DLvoo_DLvso: ASSERT_FALSE<TermsEqual<DLvoo, DLvso>> = 1;

        const DN_DB: ASSERT_FALSE<TermsEqual<DN, DB>> = 1;
        const DN_DD: ASSERT_NEVER<TermsEqual<DN, DD>> = 1;
        const DN_DI: ASSERT_NEVER<TermsEqual<DN, DI>> = 1;

        const DN_DBv: ASSERT_FALSE<TermsEqual<DN, DBv>> = 1;
        const DNv_DBv: ASSERT_FALSE<TermsEqual<DNv, DBv>> = 1;
        const DNvo_DBv: ASSERT_FALSE<TermsEqual<DNvo, DBv>> = 1;
        const DNvoo_DBv: ASSERT_FALSE<TermsEqual<DNvoo, DBv>> = 1;

        const PNv: ComparableTerm = {
            termType: 'NamedNode',
            value: 'z://',
        };

        const RNv: Term = {
            termType: 'NamedNode',
            value: 'z://',
            equals(y_other: ComparableTerm): boolean {
                return false;
            },
        };

        const MNv: SmartTerm<DNv> = {
            termType: 'NamedNode',
            value: 'z://',
            equals<
                DescriptorB extends TermDescriptor,
                ReturnType extends TermsEqual,
            >(y_other: ComparableTerm<DescriptorB>): ReturnType {
                return (this.termType === y_other.termType && this.value === y_other.value) as ReturnType;
            },
        };

        const MLv: SmartTerm<DNv> = {
            termType: 'NamedNode',
            value: 'z://',
            equals<
                DescriptorB extends TermDescriptor,
                ReturnType extends TermsEqual,
            >(y_other: ComparableTerm<DescriptorB>): ReturnType {
                return (this.termType === y_other.termType && this.value === y_other.value) as ReturnType;
            },
        };


        const MNvC: Term = {
            termType: 'NamedNode',
            value: 'z://',
            equals(y_other: ComparableTerm): boolean {
                return (this.termType === y_other.termType && this.value === y_other.value);
            },
        };

        const F = MNvC.equals({termType: 'hi', value:'orange'});


        const CNv2: ComparableTerm = {
            termType: 'NamedNode',
            value: 'z://',
            equals(y_other: BasicTerm): boolean {
                return (this.termType === y_other.termType && this.value === y_other.value);
            },
        };

        const Css: ComparableTerm = {
            termType: 'NamedNode',
            value: 'z://',
        };

        const CNs: ComparableTerm<['NamedNode']> = {
            termType: 'NamedNode',
            value: 'z://',
        };

        const CNv: ComparableTerm<['NamedNode', 'z://']> = {
            termType: 'NamedNode',
            value: 'z://',
        };

        const MNv_Mnv: true = MNv.equals(MNv);
        const MNv_Css_T: TermsEqual<DNv, ['NamedNode']> = true;
        const MNv_Css_F: TermsEqual<DNv, ['NamedNode']> = false;
        const MNv_CNs = MNv.equals(CNs);
        const MNv_CNv: true = MNv.equals(CNv);

        const S!: SmartTerm;

        const SNv!: SmartTerm<['NamedNode', 'z://', void, void]>;
        const SBv!: SmartTerm<['BlankNode', 'z://', void, void]>;
        const SNx!: SmartTerm<['NamedNode', 'y://', void, void]>;
        const SBx!: SmartTerm<['BlankNode', 'y://', void, void]>;

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


	// export type Term<
	// 	TermTypeStringA extends string=string,
	// 	ValueStringA extends string=string,
	// 	LanguageStringA extends string | void=string,
	// 	DatatypeStringA extends string | void=string,
	// > = {
	// 	termType: TermTypeStringA;
	// 	value: ValueStringA;
	// 	equals<
    //         TypeB extends BasicTerm=BasicTerm,
	// 	>(y_other: TypeB): TypeB extends SmartTerm
    //         ? ToBoolean<
    //             TermsMatch<
    //                 TermTypeStringA,
    //                 ValueStringA,
    //                 LanguageStringA,
    //                 DatatypeStringA,
    //                 TermTypeStringB,
    //                 ValueStringB,
    //                 LanguageStringB,
    //                 DatatypeStringB,
    //             >
    //         : boolean;
	// 	// equals<
	// 	// 	TermTypeStringB extends string,
	// 	// 	ValueStringB extends string,
	// 	// 	LanguageStringB extends string | void,
	// 	// 	DatatypeStringB extends string | void,
	// 	// >(y_other: Term<TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB>): ToBoolean<
    //     //     TermsMatch<
    //     //         TermTypeStringA,
    //     //         ValueStringA,
    //     //         LanguageStringA,
    //     //         DatatypeStringA,
    //     //         TermTypeStringB,
    //     //         ValueStringB,
    //     //         LanguageStringB,
    //     //         DatatypeStringB,
    //     //     >
    //     // >;
	// }
	// & (TermTypeStringA extends 'Literal'
    //     ? (DatatypeStringA extends string
    //         ? {
    //             language: LanguageStringA;
    //             datatype: Datatype<DatatypeStringA>;
    //         }
    //         : never
    //     )
	// 	: unknown
	// );

    {
        type EqualsBool = ToBoolean<TermsEqual<string, string, string, string, string, string, string, string>>;

        const F: BasicTerm<'NamedNode', 'empty'> = {
            termType: 'NamedNode',
            value: 'empty',
            equals(y_other: BasicTerm): boolean {
                return ('orange' in String);
            },
        };

        type Descriptor = [string, string, string|void, string|void];

        type NamedNode_Banana = SmartTerm<'NamedNode', 'z://banana', void, void>;

        const F1: SmartTerm<NamedNode_Banana> = {
            termType: 'NamedNode',
            value: 'empty',
            equals<D extends Descriptor>(): ToBoolean {

            },
            equals<T extends string, V extends string, L extends string|void, D extends string|void>(y_other: SmartTerm<T, V, L, D>): ToBoolean<TermsEqual<'NamedNode', 'empty', void, void>> {
                return ('orange' in String);
            },
        };
    }

    {
        const FALSE = 0;
        const TRUE = 1;
        const EITHER = 2;

        const NvssSsss: ToBoolean<TermsEqual<string, string, string, string, string, string, string, string>> = true;
    }



			// 	? (IsActualBoolean<TermTypeStringsMatch> extends true
			// 		? (TermTypeStringsMatch extends true
			// 			?
			// 			// a.termType !== b.termType
			// 			: false
			// 		)
			// 		: TermTypeStringsMatch
			// 	: never;

			// (TermTypeStringA extends `${infer ActualTermTypeString}`
			// 	? TermTypeStringA extends QuadTermTypeKey
			// 		? TermTypeStringA extends NonQuadTermTypeKey
			// 			? TermTypeStringB extends `${infer ActualOtherTermTypeString}`
			// 				? ActualOtherTermTypeString extends ActualTermTypeString
			// 					// this.termType === other.termType
			// 					? ValueStringA extends `${infer ActualValueString}`
			// 						? ValueStringB extends `${infer ActualOtherValueString}`
			// 							? ActualOtherValueString extends ActualValueString
			// 								? true  // this.value === other.value
			// 								: false  // this.value !== other.value
			// 							: boolean
			// 						: boolean
			// 					// this.termType !== other.termType
			// 					: false
			// 				: boolean
			// 			: boolean
			// 		: false  // this.termType === 'Quad' && 
			// 	: never)  // !RDFJS.TermTypes.includes(this.termType)
			// & (ValueStringA extends `${infer ActualValueString}`
			// 	? ValueStringB extends `${infer ActualOtherValueString}`
			// 		? ActualOtherValueString extends ActualValueString
			// 			? boolean  // this.value === other.value
			// 			: false  // this.value !== other.value
			// 		: boolean
			// 	: boolean);
	
	export type NamedNode<ValueString extends string=string> = Term<'NamedNode', ValueString>;

	export type BlankNode<ValueString extends string=string> = Term<'BlankNode', ValueString>;

	export type Literal<
		TermTypeString extends string=string,
		ValueString extends string=string,
		LanguageString extends string=string,
		DatatypeString extends string=string,
	> = TermTypeString extends `${infer ActualTermTypeString}`
		? (TermTypeString extends 'Literal'
			? Term<'Literal', ValueString, LanguageString, DatatypeString>
			: never
		)
		: Term<'Literal', ValueString, LanguageString, DatatypeString>;


	export type Variable<ValueString extends string=string> = Term<'Variable', ValueString>;

	export type DefaultGraph<TermTypeString extends string=string> = 
		TermTypeString extends `${infer ActualTermTypeString}`
			? TermTypeString extends 'DefaultGraph'
				? Term<'DefaultGraph', ''>
				: never
			: Term<'DefaultGraph', ''>;

	export type Datatype<DatatypeString extends string=string> = NamedNode<DatatypeString>;

	export type Node<
		TermTypeString extends string=string,
		ValueString extends string=string,
	> = TermTypeString extends `${infer ActualTermTypeString}`
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
