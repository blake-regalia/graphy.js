
type IsStringLiteral = Community.IsStringLiteral;

type ASSERT_TRUE<Test extends boolean> = [Test] extends [true]? 1: 0;
type ASSERT_FALSE<Test extends boolean> = [Test] extends [false]? 1: 0;
type ASSERT_BOOLEAN<Test extends boolean> = [Test] extends [false]? 0: ([Test] extends [true]? 0: 1);
type ASSERT_NEVER<Test> = [Test] extends [never]? 1: 0;

type Auto<
    Value,
    Target,
    Default,
> = Value extends Target? Value: Default;

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

/**
 * `<Test extends string|void> => true | false`
 * 
 * Deduces whether the given type `Test` contains only literal strings:
 * 
 *     IsOnlyLiteralStrings<'A'>  // true
 *     IsOnlyLiteralStrings<'A' | 'B'>  // true
 *     IsOnlyLiteralStrings<string>  // false
 *     IsOnlyLiteralStrings<string | 'A'>  // false
 *     IsOnlyLiteralStrings<string | 'A' | 'B'>  // false
 *     IsOnlyLiteralStrings<void>  // false
 */
type IsOnlyLiteralStrings<Test extends string | void> = [Test] extends [string]
    ? ([Test] extends [`${infer ActualTest}`]
        ? true
        : false
    ): false;

{
    const A: ASSERT_TRUE<IsOnlyLiteralStrings<'A'>> = 1;
    const AB: ASSERT_TRUE<IsOnlyLiteralStrings<'A' | 'B'>> = 1;
    const S: ASSERT_FALSE<IsOnlyLiteralStrings<string>> = 1;
    const SA: ASSERT_FALSE<IsOnlyLiteralStrings<string | 'A'>> = 1;
    const SAB: ASSERT_FALSE<IsOnlyLiteralStrings<string | 'A' | 'B'>> = 1;
    const O: ASSERT_FALSE<IsOnlyLiteralStrings<void>> = 1;
}


/**
 * `<Test extends string|void> => true | false`
 * 
 * Deduces whether the given type `Test` is a single, literal string by excluding unions:
 * 
 *     IsOnlyLiteralStrings<'A'>  // true
 *     IsOnlyLiteralStrings<'A' | 'B'>  // false
 *     IsOnlyLiteralStrings<string>  // false
 *     IsOnlyLiteralStrings<string | 'A'>  // false
 *     IsOnlyLiteralStrings<string | 'A' | 'B'>  // false
 *     IsOnlyLiteralStrings<void>  // false
 */
type IsSingleString<Test extends string|void> = And<
    IsOnlyLiteralStrings<Test>,
    Not<IsUnion<Test>>,
>;

{
    const A: ASSERT_TRUE<IsSingleString<'A'>> = 1;
    const AB: ASSERT_FALSE<IsSingleString<'A' | 'B'>> = 1;
    const S: ASSERT_FALSE<IsSingleString<string>> = 1;
    const SA: ASSERT_FALSE<IsSingleString<string | 'A'>> = 1;
    const SAB: ASSERT_FALSE<IsSingleString<string | 'A' | 'B'>> = 1;
    const O: ASSERT_FALSE<IsSingleString<void>> = 1;
}


/**
 * `<Value, Default=string>`
 * 
 * Returns the given type `Value` if it is a string, otherwise returns `Default`
 * 
 *     AutoString<'A'>  // 'A'
 *     AutoString<void>  // string
 *     AutoString<'A', 'Z'>  // 'A'
 *     AutoString<void, 'Z'>  // 'Z'
 *     AutoString<12, 'Z'>  // 'Z'
 *     AutoString<'A' | 'B'>  // 'A' | 'B'
 *     AutoString<void, 'Y' | 'Z'>  // 'Y' | 'Z'
 */
type AutoString<
    String,
    Default=string,
> = String extends string? String: Default;

{
    const _: ASSERT_EQUAL<AutoString<''>, ''> = 1;
    const A: ASSERT_EQUAL<AutoString<'A'>, 'A'> = 1;
    const O: ASSERT_STRING<AutoString<void>> = 1;
    const NZ: ASSERT_EQUAL<AutoString<12, 'Z'>, 'Z'> = 1;
    const _Z: ASSERT_EQUAL<AutoString<'', 'Z'>, ''> = 1;
    const AZ: ASSERT_EQUAL<AutoString<'A', 'Z'>, 'A'> = 1;
    const OZ: ASSERT_EQUAL<AutoString<void, 'Z'>, 'Z'> = 1;
    const OYZ: ASSERT_SAME<AutoString<void, 'Y' | 'Z'>, 'Y' | 'Z'> = 1;
    const AB: ASSERT_SAME<AutoString<'A' | 'B'>, 'A' | 'B'> = 1;
    const ABZ: ASSERT_SAME<AutoString<'A' | 'B', 'Z'>, 'A' | 'B'> = 1;
}

type UnionToIntersection<
    Union,
> = (Union extends any
        ? (w_arg: Union) => void
        : never
    ) extends ((w_arg: infer Intersection) => void)
        ? Intersection
        : never;

type LastOf<
    Tuple,
> = UnionToIntersection<
    Tuple extends any
        ? () => Tuple
        : never
    > extends () => (infer Last)
        ? Last
        : never;

type Push<
    Tuple extends any[],
    Item,
> = [...Tuple, Item];

type TuplifyUnion<
    Tuple,
    Last=LastOf<Tuple>,
    IsNever = [Tuple] extends [never] ? true : false,
> = true extends IsNever
    ? []
    : Push<
        TuplifyUnion<Exclude<Tuple, Last>>,
        Last,
    >;


/**
 * `<Test> => true | false`
 * 
 * Deduce whether the given type `Test` is an explicit union of types
 * 
 *     IsUnion<'A'>  // false
 *     IsUnion<string>  // false
 *     IsUnion<void>  // false
 *     IsUnion<'A' | 'B'>  // true
 *     IsUnion<'A' | string>  // true
 *     IsUnion<'A' | void>  // true
 *     IsUnion<string | void>  // true
 */
type IsUnion<Test> = Union.ListOf<Test>['length'] extends 1? false: true;

{
    const A: ASSERT_FALSE<IsUnion<'A'>> = 1;
    const S: ASSERT_FALSE<IsUnion<string>> = 1;
    const O: ASSERT_FALSE<IsUnion<void>> = 1;
    const AB: ASSERT_TRUE<IsUnion<'A' | 'B'>> = 1;
    const AS: ASSERT_FALSE<IsUnion<'A' | string>> = 1;
    const AO: ASSERT_TRUE<IsUnion<'A' | void>> = 1;
    const OA: ASSERT_TRUE<IsUnion<void | 'A'>> = 1;
    const SO: ASSERT_TRUE<IsUnion<string | void>> = 1;
    const OS: ASSERT_TRUE<IsUnion<void | string>> = 1;
}

type DirectlyIncludes<Union, Item> = If<
    IsUnion<Item>,
    Extends<[Item], [Union]>,
    Union extends infer Find
        ? (Find extends Item
            ? (Item extends Union? true: false)
            : false
        )
        : never
>;

/**
 * `<Union, Item> => true | false`
 * 
 * Deduces whether the given `Union` explicitly includes the specified `Item`
 * 
 *     Includes<'A', 'A'>  // true
 *     Includes<'A'|'B', 'A'>  // true
 *     Includes<'A', 'A'|'B'>  // false
 *     Includes<'A'|'B', 'A'|'B'>  // true
 *     Includes<'A'|'B'|'C', 'A'|'B'>  // true
 *     Includes<'A'|string, 'A'>  // false: `'A'|string` merges into just `string`
 *     Includes<'A'|void, 'A'>  // true
 *     Includes<'A'|void, void>  // true
 *     Includes<void, void>  // true
 *     Includes<string|void, void>  // true
 *     Includes<string|void, string>  // true
 */
type Includes<Union, Item> = DirectlyIncludes<Union, Item> extends infer Directly
    ? Or<
        AsBool<Directly>,
        IsUnion<Directly>,
    >
    : never;

{
    const A_A: ASSERT_TRUE<Includes<'A', 'A'>> = 1;
    const A_B: ASSERT_FALSE<Includes<'A', 'B'>> = 1;
    const A_S: ASSERT_FALSE<Includes<'A', string>> = 1;
    const S_A: ASSERT_FALSE<Includes<string, 'A'>> = 1;
    const AB_A: ASSERT_TRUE<Includes<'A' | 'B', 'A'>> = 1;
    const A_AB: ASSERT_FALSE<Includes<'A', 'A' | 'B'>> = 1;
    const AB_AB: ASSERT_TRUE<Includes<'A' | 'B', 'A' | 'B'>> = 1;
    const ABC_AB: ASSERT_TRUE<Includes<'A' | 'B' | 'C', 'A' | 'B'>> = 1;
    const AS_A: ASSERT_FALSE<Includes<'A' | string, 'A'>> = 1;  // `'A'|string` merges into `string`
    const O_O: ASSERT_TRUE<Includes<void, void>> = 1;
    const AO_A: ASSERT_TRUE<Includes<'A' | void, 'A'>> = 1;
    const AO_O: ASSERT_TRUE<Includes<'A' | void, void>> = 1;
    const O_S: ASSERT_FALSE<Includes<void, string>> = 1;
    const OS_S: ASSERT_TRUE<Includes<void | string, string>> = 1;
    const S_O: ASSERT_FALSE<Includes<string, void>> = 1;
    const SO_O: ASSERT_TRUE<Includes<string | void, void>> = 1;
}

type ActualStringsMatch<
	StringA extends `${string}`,
	StringB extends `${string}`,
> = And<
        Extends<StringA, StringB>,
        Extends<StringB, StringA>,
    > extends false
        ? false
        : If<
            And<
                Extends<[StringA], [StringB]>,
                Extends<[StringB], [StringA]>,
            >,
            If<
                Or<
                    IsUnion<StringA>,
                    IsUnion<StringB>,
                >,
                boolean,
                true,
            >,
            boolean,
        >;

/**
 * `<StringA extends string|void, StringB extends string|void> => true | false | boolean`
 * 
 * Describes the possible outcomes of matching `StringA` with `StringB`.
 * 
 * If both arguments are not unions, then the parametric type returns:
 *   - `true` if the two arguments are the same string
 *   - `true` if the two arguments are both `void`
 *   - `false` otherwise
 * 
 * If at least one of the arguments a union, then both arguments are treated as sets and the parametric type returns:
 *   - `boolean` if the two sets are equals or overlap
 *   - `false` if the sets are disjoint 
 * 
 * 
 *     StringsMatch<'A', 'A'>  // true
 *     StringsMatch<'A', 'B'>  // false
 *     StringsMatch<'A', void>  // false
 *     StringsMatch<void, void>  // true
 *     StringsMatch<'A', 'A'|'B'>  // boolean
 *     StringsMatch<'A', string>  // boolean
 *     StringsMatch<'A'|'B', 'A'>  // boolean
 *     StringsMatch<'A'|'B', 'A'|'B'>  // boolean
 *     StringsMatch<'A'|'B', 'B'|'C'>  // boolean
 *     StringsMatch<'A'|'B', 'C'>  // false
 *     StringsMatch<'A'|'B', 'C' | 'D'>  // false
 *     StringsMatch<'A'|'B', string>  // false
 */
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


type ASSERT_STRING<String extends string> = [Not<IsOnlyLiteralStrings<String>>] extends [true]? 1: 0;
type ASSERT_EQUAL<StringA extends string, StringB extends string> = [StringsMatch<StringA, StringB>] extends [true]? 1: 0;
type ASSERT_SAME<ThingA, ThingB> = [And<Extends<ThingA, ThingB>, Extends<ThingB, ThingA>>] extends [true]? 1: 0;

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
 
    const Actual: ASSERT_TRUE<IsOnlyLiteralStrings<'A'>> = 1;
    const Union: ASSERT_TRUE<IsOnlyLiteralStrings<'A' | 'B'>> = 1;
    const String: ASSERT_FALSE<IsOnlyLiteralStrings<string>> = 1;

    const AmU: ASSERT_BOOLEAN<StringsMatch<'A', 'A' | 'B'>> = 1;
    const CmU: ASSERT_FALSE<StringsMatch<'C', 'A' | 'B'>> = 1;
    const SmU: ASSERT_BOOLEAN<StringsMatch<string, 'A' | 'B'>> = 1;
    const OmU: ASSERT_FALSE<StringsMatch<void, 'A' | 'B'>> = 1;
    const UmA: ASSERT_BOOLEAN<StringsMatch<'A' | 'B', 'A'>> = 1;
    const ABmBC: ASSERT_BOOLEAN<StringsMatch<'A' | 'B', 'B' | 'C'>> = 1;
    const ABmC: ASSERT_FALSE<StringsMatch<'A' | 'B', 'C'>> = 1;
    const UmC: ASSERT_FALSE<StringsMatch<'A' | 'B', 'C'>> = 1;
    const UmS: ASSERT_BOOLEAN<StringsMatch<'A' | 'B', string>> = 1;
    const UmO: ASSERT_FALSE<StringsMatch<'A' | 'B', void>> = 1;
    const UmU: ASSERT_BOOLEAN<StringsMatch<'A' | 'B', 'A' | 'B'>> = 1;

    const AOmA: ASSERT_BOOLEAN<StringsMatch<'A' | void, 'A'>> = 1;
    const AOmO: ASSERT_BOOLEAN<StringsMatch<'A' | void, 'A'>> = 1;
    const AOmAO: ASSERT_BOOLEAN<StringsMatch<'A' | void, 'A' | void>> = 1;
 
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

    type A = 'A';
    type U = 'A' | 'B';

    type DEBUG_RAA = Extends<A, A>;      // true
    type DEBUG_TAA = Extends<[A], [A]>;  // true

    type DEBUG_RUU = Extends<U, U>;      // true
    type DEBUG_TUU = Extends<[U], [U]>;  // true

    type DEBUG_RAU = Extends<A, U>;      // true
    type DEBUG_TAU = Extends<[A], [U]>;  // true

    type DEBUG_RUA = Extends<U, A>;      // boolean
    type DEBUG_TUA = Extends<[U], [A]>;  // false

    type DEBUG_AND = And<DEBUG_RAU, DEBUG_RUA>;

    type IsUn<A extends string, B extends string> = Or<
        And<
            Extends<A, B>,
            Not<
                Extends<[B], [A]>
            >,
        >,
        And<
            Extends<B, A>,
            Not<
                Extends<[A], [B]>
            >,
        >,
    >;
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
