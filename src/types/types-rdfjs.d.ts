type MockFalse = 0;
type MockTrue = 1;
type MockEither = 2;
type MockDebug = 3;

type MockTrueOrFalse = MockTrue | MockFalse;

type MockBool = MockTrue | MockFalse | MockEither | MockDebug;

type AsMockBool<Boolean extends boolean> = Boolean extends true
    ? MockTrue
    : MockFalse;

    // : Boolean extends false
    //     ? MockFalse
    //     : MockEither;

type SafeMockBool<In extends any> = In extends MockBool
    ? In
    : (In extends boolean
        ? AsMockBool<In>
        : MockEither
    );

type ToBoolean<Boolean extends MockBool> = Boolean extends MockTrue
    ? true
    : (MockBool extends MockFalse
        ? false
        : boolean
    );

type And<BooleanA extends MockBool, BooleanB extends MockBool> = BooleanA extends MockFalse
    ? MockFalse
    : (BooleanB extends MockFalse
        ? MockFalse
        : (BooleanA extends MockTrue
            ? (BooleanB extends MockTrue
                ? MockTrue
                : MockEither
            )
            : MockEither
        )
    );

type Or<BooleanA extends MockBool, BooleanB extends MockBool> = BooleanA extends MockTrue
	? MockTrue
	: (BooleanB extends MockTrue
		? MockTrue
		: (BooleanA extends MockFalse
			? (BooleanB extends MockFalse
				? MockFalse
				: MockEither
			)
			: MockEither
		)
    );

type Not<Boolean extends MockBool> = Boolean extends MockTrue
	? MockFalse
	: Boolean extends MockFalse
		? MockTrue
		: MockEither;


// type IsActualBoolean<Boolean extends MockBool> = Boolean extends false
// 	? true
// 	: (Boolean extends true
// 		? true
// 		: false);

// {
//     // const ActualFalse: IsActualBoolean<0> = true;
//     // const ActualTrue: IsActualBoolean<1> = true;
//     // const ActualBoolean: IsActualBoolean<2> = false;

//     const ActualFalse: IsActualBoolean<false> = true;
//     const ActualTrue: IsActualBoolean<true> = true;
//     const ActualBoolean: IsActualBoolean<any> = false;
// }

type IsActualString<String extends string> = String extends `${infer ActualString}`
	? true
	: false;

type ActualStrings<
	StringA extends string,
	StringB extends string | null=null,
	StringC extends string | null=null,
	StringD extends string | null=null,
> = StringA extends `${infer ActualStringA}`
	? (StringB extends `${infer ActualStringB}`
		? (StringC extends `${infer ActualStringC}`
			? (StringD extends `${infer ActualStringD}`
				? [ActualStringA, ActualStringB, ActualStringC, ActualStringD]
				: [ActualStringA, ActualStringB, ActualStringC, never]
			)
			: [ActualStringA, ActualStringB, never, never]
		)
		: [ActualStringA, never, never, never]
	)
	: never;

type ActualStringsMatch<
	StringA extends `${string}`,
	StringB extends `${string}`,
> = StringA extends StringB
	? (StringB extends StringA
        ? true
        : false)
	: false;

type StringsMatch<
	StringA extends string,
	StringB extends string,
> = [StringA, StringB] extends [`${infer ActualStringA}`, `${infer ActualStringB}`]
	? AsMockBool<ActualStringsMatch<ActualStringA, ActualStringB>>
	: MockEither;



// tests
{
    const FALSE = 0;
    const TRUE = 1;
    const EITHER = 2;

	const Af_Bf: And<MockFalse, MockFalse> = FALSE;
	const Af_Bt: And<MockFalse, MockTrue> = FALSE;
	const At_Bf: And<MockTrue, MockFalse> = FALSE;
	const At_Bt: And<MockTrue, MockTrue> = TRUE;

	const Ab_Bb: And<MockEither, MockEither> = EITHER;
	const Ab_Bf: And<MockEither, MockFalse> = FALSE;
	const Ab_Bt: And<MockEither, MockTrue> = EITHER;
	const Af_Bb: And<MockFalse, MockEither> = FALSE;
	const At_Bb: And<MockTrue, MockEither> = EITHER;

	const AfIBf: Or<MockFalse, MockFalse> = FALSE;
	const AfIBt: Or<MockFalse, MockTrue> = TRUE;
	const AtIBf: Or<MockTrue, MockFalse> = TRUE;
	const AtIBt: Or<MockTrue, MockTrue> = TRUE;

	const AbIBb: Or<MockEither, MockEither> = EITHER;
	const AbIBf: Or<MockEither, MockFalse> = EITHER;
	const AbIBt: Or<MockEither, MockTrue> = TRUE;
	const AfIBb: Or<MockFalse, MockEither> = EITHER;
	const AtIBb: Or<MockTrue, MockEither> = TRUE;
 
 
    const AmA: StringsMatch<'A', 'A'> = TRUE;
    const AmB: StringsMatch<'A', 'B'> = FALSE;
    const AmS: StringsMatch<'A', string> = EITHER;
    const SmA: StringsMatch<string, 'A'> = EITHER;
    const SmS: StringsMatch<string, string> = EITHER;
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

type AsBoolean<Result extends boolean> = Result extends 0
    ? false
    : (Result extends 1
        ? true
        : boolean
    );


export namespace RDFJS {

	interface TermTypes {
		NamedNode: NamedNode;
		BlankNode: BlankNode;
		Literal: Literal;
		Variable: {};
		DefaultGrah: {};
		Quad: {};
	}

	type TermTypeKey = keyof TermTypes;
	type NonQuadTermTypeKey = keyof Omit<TermTypes, 'Quad'>;

	type ObjectDescriptor = [string, string, string, string];

	type ObjectsMatch<
		TermTypeStringA extends string,
		ValueStringA extends string,
		LanguageStringA extends string,
		DatatypeStringA extends string,
		TermTypeStringB extends string,
		ValueStringB extends string,
		LanguageStringB extends string,
		DatatypeStringB extends string,
	> = [
        StringsMatch<TermTypeStringA, TermTypeStringB>,
        StringsMatch<ValueStringA, ValueStringB>,
    ] extends [
        infer TermTypeStringsMatch,
        infer ValueStringsMatch,
    ]
        // (TermType|Value)StringsMatch := a.(termType|value) === b.(termType|value)
        ? (Or<
            Not<SafeMockBool<TermTypeStringsMatch>>,
            Not<SafeMockBool<ValueStringsMatch>>,
        > extends MockTrue
            // a.termType !== b.termType || a.value !== b.value
            ? MockFalse
            // mixed termTypes and values
            : (Or<
                StringsMatch<TermTypeStringA, 'Literal'>,
                StringsMatch<TermTypeStringB, 'Literal'>,
            > extends MockTrue
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
                        Or<SafeMockBool<LanguageStringAKnown>, SafeMockBool<DatatypeStringAKnown>>,
                        Or<SafeMockBool<LanguageStringBKnown>, SafeMockBool<DatatypeStringBKnown>>,
                    > extends MockTrue
                        // a.(language|datatype) is known && b.(language|datatype) is known
                        ? (SafeMockBool<LanguageStringAKnown> extends MockTrue
                            // a.language is known && b.(language|datatype) is known
                            ? (Not<StringsMatch<LanguageStringA, LanguageStringB>> extends MockTrue
                                ? MockFalse
                                : And<
                                    SafeMockBool<TermTypeStringsMatch>,
                                    SafeMockBool<ValueStringsMatch>,
                                >
                            )
                            // a.datatype is known && b.(language|datatype) is known
                            : (Not<StringsMatch<DatatypeStringA, DatatypeStringB>> extends MockTrue
                                ? MockFalse
                                : And<
                                    SafeMockBool<TermTypeStringsMatch>,
                                    SafeMockBool<ValueStringsMatch>,
                                >
                            )
                        )
                        : MockEither
                    )
                    : never
                )
                // (a|b).termType !== 'Literal'
                // return (a.termType === b.termType && a.value === b.value)
                : And<
                    SafeMockBool<TermTypeStringsMatch>,
                    SafeMockBool<ValueStringsMatch>,
                >
            )
        )
        : never;

        // : ([
        //     IsActualString<TermTypeStringA>,
        //     IsActualString<TermTypeStringB>,
        //     IsActualString<ValueStringA>,
        //     IsActualString<ValueStringB>,
        // ] extends [
        //     infer TermTypeStringAKnown,
        //     infer TermTypeStringBKnown,
        //     infer ValueStringAKnown,
        //     infer ValueStringBKnown,
        // ]
        //     // (TermType|Value)String(A|B)Known := (a|b).(termType|value) is known

        //     ? 
        //         ? TermTypeStringsMatch extends MockFalse
        //             ? MockFalse

        //     ? (And<
        //         SafeMockBool<TermTypeStringAKnown>,
        //         SafeMockBool<TermTypeStringBKnown>,
        //     > extends MockTrue
        //         // a.termType is known && b.termType is known
        //         ? (And<
        //             SafeMockBool<ValueStringAKnown>,
        //             SafeMockBool<ValueStringBKnown>,
        //         > extends MockTrue
                    

        //             // a.value is known && b.value is known
        //             ? (

        //             )
        //             : (

        //             )
        //         )
        //         // a.termType is unknown || b.termType is unknown
        //         :
                
        //         And<SafeMockBool<TermTypeStringAKnown>, SafeMockBool<TermTypeStringBKnown>> extends MockTrue
        //         ? And<SafeMockBool<ValueStringAKnown>, SafeMockBool<ValueStringBKnown>>

        // // And<SafeMockBool<ValueStringAKnown>, SafeMockBool<ValueStringBKnown>>
        // > extends MockTrue
		// 			// a.termType is known
		// 			: MockEither
		// 		)
		// 	)
		// 	: MockEither
		// )
		// : MockEither;



                        //     ? (And<
                        //         SafeMockBool<LanguageStringAKnown>,
                        //         Or<SafeMockBool<LanguageStringBKnown>, SafeMockBool<DatatypeStringBKnown>>,
                        //     > extends MockTrue
                        //         // a.language is known and (b.language is known || b.datatype is known)
                        //         ? (StringsMatch<LanguageStringA, LanguageStringB> extends MockTrue
                        //             ? MockTrue
                        //             : MockFalse
                        //         )
                        //         : (And<
                        //             Or<SafeMockBool<LanguageStringAKnown>, SafeMockBool<DatatypeStringAKnown>>,
                        //             SafeMockBool<LanguageStringAKnown>,
                        //         > extends MockTrue

                        //         )
                        //     )
                        //     : never


                        //     // a.language is known
                        //     ? (Or<
                        //         AsMockBool<IsActualString<LanguageStringB>>,
                        //         AsMockBool<IsActualString<DatatypeStringB>>,
                        //     > extends MockTrue
                        //         // b.language is known or b.datatype is known
                        //         ? (StringsMatch<LanguageStringA, DatatypeStringB> extends MockTrue
                        //             ? MockTrue
                        //             : MockFalse
                        //         )
                        //         // b.language is unknown and b.datatype is unknown
                        //         : MockEither
                        //     )
                        //     // a.language is unknown
                        //     : (IsActualString<

                        //     )
                        // >


    // StringPairsMatch<TermTypeStringA, TermTypeStringB, ValueStringA, ValueStringB> extends infer TermTypesAndValuesMatch
	// 	? (TermTypesAndValuesMatch extends MockTrueOrFalse
			// ? (TermTypesAndValuesMatch extends MockFalse
				// (a.termType !== b.termType) || (a.value !== b.value)
				// ? MockFalse
				// (a.termType === b.termType) && (a.value === b.value)
				// : (


    {
        // type TestSafe = SafeMockBool<boolean>;

        const FALSE = 0;
        const TRUE = 1;
        const EITHER = 2;

        const BaBa: ObjectsMatch<'BlankNode', 'A', string, string, 'BlankNode', 'A', string, string> = TRUE;
        const NaNa: ObjectsMatch<'NamedNode', 'A', string, string, 'NamedNode', 'A', string, string> = TRUE;

        // Literal  [s=string; v='val'; x=other]
        const LsssLsss: ObjectsMatch<'Literal', string, string, string, 'Literal', string, string, string> = EITHER;

        // Literal with only value
        const LsssLvss: ObjectsMatch<'Literal', string, string, string, 'Literal', 'A',    string, string> = EITHER;
        const LvssLsss: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', string, string, string> = EITHER;
        const LvssLvss: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', 'A',    string, string> = EITHER;
        const LvssLxss: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', 'B',    string, string> = FALSE;
        
        // Literal with only language
        const LsssLsvs: ObjectsMatch<'Literal', string, string, string, 'Literal', string, 'en',   string> = EITHER;
        const LsvsLsss: ObjectsMatch<'Literal', string, 'en',   string, 'Literal', string, string, string> = EITHER;
        const LsvsLsvs: ObjectsMatch<'Literal', string, 'en',   string, 'Literal', string, 'en',   string> = EITHER;
        const LsvsLsxs: ObjectsMatch<'Literal', string, 'en',   string, 'Literal', string, 'fr',   string> = FALSE;

        // Literal with only datatype
        const LsssLssv: ObjectsMatch<'Literal', string, string, string, 'Literal', string, string, 'z://'> = EITHER;
        const LssvLsss: ObjectsMatch<'Literal', string, string, 'z://', 'Literal', string, string, string> = EITHER;
        const LssvLssv: ObjectsMatch<'Literal', string, string, 'z://', 'Literal', string, string, 'z://'> = EITHER;
        const LssvLssx: ObjectsMatch<'Literal', string, string, 'z://', 'Literal', string, string, 'y://'> = FALSE;

        // Literal with value and language
        const LsssLvvs: ObjectsMatch<'Literal', string, string, string, 'Literal', 'A',    'en',   string> = EITHER;
        const LvssLsvs: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', string, 'en',   string> = EITHER;
        const LsvsLvss: ObjectsMatch<'Literal', string, 'en',   string, 'Literal', 'A',    string, string> = EITHER;
        const LvvsLsss: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', string, string, string> = EITHER;
        const LvvsLvss: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'A',    string, string> = EITHER;
        const LvvsLxss: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'B',    string, string> = FALSE;
        const LvvsLsvs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', string, 'en',   string> = EITHER;
        const LvvsLsxs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', string, 'fr',   string> = FALSE;
        const LvssLvvs: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', 'A',    'en',   string> = EITHER;
        const LvssLxvs: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', 'B',    'en',   string> = FALSE;
        const LsvsLvvs: ObjectsMatch<'Literal', string, 'en',   string, 'Literal', 'A',    'en',   string> = EITHER;
        const LsvsLvxs: ObjectsMatch<'Literal', string, 'en',   string, 'Literal', 'A',    'fr',   string> = FALSE;
        const LvvsLvvs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'A',    'en',   string> = TRUE;
        const LvvsLvxs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'A',    'fr',   string> = FALSE;
        const LvvsLxvs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'B',    'en',   string> = FALSE;

        // Literal with value and datatype
        const LsssLvvs: ObjectsMatch<'Literal', string, string, string, 'Literal', 'A',    'en',   string> = EITHER;
        const LvssLsvs: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', string, 'en',   string> = EITHER;
        const LsvsLvss: ObjectsMatch<'Literal', string, 'en',   string, 'Literal', 'A',    string, string> = EITHER;
        const LvvsLsss: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', string, string, string> = EITHER;
        const LvvsLvss: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'A',    string, string> = EITHER;
        const LvvsLxss: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'B',    string, string> = FALSE;
        const LvvsLsvs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', string, 'en',   string> = EITHER;
        const LvvsLsxs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', string, 'fr',   string> = FALSE;
        const LvssLvvs: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', 'A',    'en',   string> = EITHER;
        const LvssLxvs: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', 'B',    'en',   string> = FALSE;
        const LsvsLvvs: ObjectsMatch<'Literal', string, 'en',   string, 'Literal', 'A',    'en',   string> = EITHER;
        const LsvsLvxs: ObjectsMatch<'Literal', string, 'en',   string, 'Literal', 'A',    'fr',   string> = FALSE;
        const LvvsLvvs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'A',    'en',   string> = TRUE;
        const LvvsLvxs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'A',    'fr',   string> = FALSE;
        const LvvsLxvs: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'B',    'en',   string> = FALSE;

        // const LvssLvss: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', 'A',    string, string> = EITHER;
        // const LvssLxss: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', 'B',    string, string> = FALSE;


        // const LassLaes: ObjectsMatch<'Literal', 'A',    string, string, 'Literal', 'A',    'en',   string> = EITHER;
        // const LaesLaes: ObjectsMatch<'Literal', 'A',    'en',   string, 'Literal', 'A',    'en',   string> = EITHER;
        // const LaexLaex: ObjectsMatch<'Literal', 'A', 'en', 'z://y/str', 'Literal', 'A', 'en', 'z://y/str'> = TRUE;
        // const LaexLae: ObjectsMatch<'Literal', 'A', 'en', 'z://y/str', 'Literal', 'A', 'en', string> = EITHER;
        // const LaeLaex: ObjectsMatch<'Literal', 'A', 'en', string, 'Literal', 'A', 'en', 'z://y/str'> = EITHER;
        // const LaexLaez: ObjectsMatch<'Literal', 'A', 'en', 'z://y/str', 'Literal', 'A', 'en', 'z://y/other'> = FALSE;
        // const LafxLaex: ObjectsMatch<'Literal', 'A', 'en', 'z://y/str', 'Literal', 'A', 'fr', 'z://y/str'> = FALSE;
        // const LafxLae: ObjectsMatch<'Literal', 'A', 'en', 'z://y/str', 'Literal', 'A', 'fr', string> = FALSE;
        // const LafLaex: ObjectsMatch<'Literal', 'A', 'en', string, 'Literal', 'A', 'fr', 'z://y/str'> = FALSE;
        // const LafLae: ObjectsMatch<'Literal', 'A', 'en', string, 'Literal', 'A', 'fr', string> = FALSE;
        // const BaBb: ObjectsMatch<'BlankNode', 'A', string, string, 'BlankNode', 'B', string, string> = FALSE;
        // const BaNa: ObjectsMatch<'BlankNode', 'A', string, string, 'NamedNode', 'A', string, string> = FALSE;
        // const BaNb: ObjectsMatch<'BlankNode', 'A', string, string, 'NamedNode', 'B', string, string> = FALSE;
        // const BaBs: ObjectsMatch<'BlankNode', 'A', string, string, 'BlankNode', string, string, string> = EITHER;
        // const BaSs: ObjectsMatch<'BlankNode', 'A', string, string, string, string, string, string> = EITHER;
        // const BaSa: ObjectsMatch<'BlankNode', 'A', string, string, string, 'A', string, string> = EITHER;
        // const BsSa: ObjectsMatch<'BlankNode', string, string, string, string, 'A', string, string> = EITHER;
        // const SsSa: ObjectsMatch<string, string, string, string, string, 'A', string, string> = EITHER;
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
            ObjectsMatch<
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

type Test<A extends string, B extends string> = StringsMatch<A, B> extends infer C? C: never;

const Test1: Test<'A', 'A'> = 1;
const Test2: Test<'A', 'B'> = 0;
const Test3: Test<'A', string> = 2;
const Test4: Test<string, 'B'> = 2;
const Test5: Test<string, string> = 2;

	type NonQuadTermsMatch<
		TermTypeStringA extends string,
		ValueStringA extends string,
		LanguageStringA extends string,
		DatatypeStringA extends string,

		TermTypeStringB extends string,
		ValueStringB extends string,
		LanguageStringB extends string,
		DatatypeStringB extends string,
	> = StringsMatch<TermTypeStringA, TermTypeStringB> extends infer TermTypeStringsMatch
		// TermTypeStringsMatch := compare(a.termType, b.termType)
		? (And<
			// (a.termType in {term-type-keys} or a.termType is not `${actual-string}`)
			Or<
				TermTypeStringA extends keyof TermTypeKey? MockTrue: MockFalse,
				Not<AsMockBool<IsActualString<TermTypeStringA>>>,
			>,
			// (b.termType in {term-type-keys} or b.termType is not `${actual-string}`)
			Or<
				TermTypeStringB extends keyof TermTypeKey? MockTrue: MockFalse,
				Not<AsMockBool<IsActualString<TermTypeStringB>>>,
			>
		> extends MockTrue
			? (StringsMatch<ValueStringA, ValueStringB> extends (infer ValueStringsMatch)
				// ValueStringsMatch := compare(a.value, b.value)
				? (And<SafeMockBool<TermTypeStringsMatch>, SafeMockBool<ValueStringsMatch>> extends infer TermTypeAndValueStringsMatch
					// TermTypeAndValueStringsMatch := TermTypeStringsMatch && ValueStringsMatch
					? (Or<
						StringsMatch<TermTypeStringA, 'Literal'>,
						StringsMatch<TermTypeStringB, 'Literal'>
					> extends MockTrue
						// a.isLiteral || b.isLiteral
						? (And<SafeMockBool<TermTypeAndValueStringsMatch>,
								And<
									StringsMatch<LanguageStringA, LanguageStringB>,
									StringsMatch<DatatypeStringA, DatatypeStringB>
								>,
							>
						)
						// !(a.isLiteral || b.isLiteral)
						: (Or<
							StringsMatch<TermTypeStringA, 'Quad'>,
							StringsMatch<TermTypeStringB, 'Quad'>,
						> extends MockTrue
							// a.isQuad || b.isQuad
							? (TermTypeAndValueStringsMatch extends MockFalse
								// TermTypeAndValueStringsMatch === false
								? MockFalse
								// Cannot test quad components in this mode
								: MockEither
							)
							// neither are quads, just compare their types and values
							: TermTypeAndValueStringsMatch
						)
					): never
				): never
			): never
		): never;


	export type Term<
		TermTypeStringA extends string=string,
		ValueStringA extends string=string,
		LanguageStringA extends string=string,
		DatatypeStringA extends string=string,
	> = {
		type: TermTypeStringA;
		value: ValueStringA;
		equals<
			TermTypeStringB extends string,
			ValueStringB extends string,
			LanguageStringB extends string,
			DatatypeStringB extends string,
		>(y_other: Term<TermTypeStringB, ValueStringB, LanguageStringB, DatatypeStringB>):
			Or<
				TermTypeStringA extends keyof NonQuadTermTypeKey? MockTrue: MockFalse,
				TermTypeStringB extends keyof NonQuadTermTypeKey? MockTrue: MockFalse,
			> extends MockTrue
				// !a.isQuad || !b.isQuad
				? ToBoolean<NonQuadTermsMatch<
					TermTypeStringA,
					ValueStringA,
					LanguageStringA,
					DatatypeStringA,

					TermTypeStringB,
					ValueStringB,
					LanguageStringB,
					DatatypeStringB,
				>>
				// both terms are quads; cannot compute
				: boolean;
	}
	& (TermTypeStringA extends 'Literal'
		? {
			language: LanguageStringA;
			datatype: Datatype<DatatypeStringA>;
		}
		: unknown
	);



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
			TermTypeStringB extends string=string,
			ValueStringB extends string=string,
			TypeB extends Term=Term,
			SubjectTermTypeStringB extends string=string,
			SubjectValueStringB extends string=string,
			PredicateTermTypeStringB extends string=string,
			PredicateValueStringB extends string=string,
			ObjectTermTypeStringB extends string=string,
			ObjectValueStringB extends string=string,
			ObjectLanguageStringB extends string=string,
			ObjectDatatypeStringB extends string=string,
			GraphTermTypeStringB extends string=string,
			GraphValueStringB extends string=string,
		>(y_other: TypeB):
			TypeB extends Quad<infer TermTypeStringB, >l

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
							? And<And<And<SubjectsMatch, PredicatesMatch>, ObjectsMatch>, GraphsMatch>


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
