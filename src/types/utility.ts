import type {
	Union,
} from 'ts-toolbelt';

import type {
	Extends,
	Try,
} from 'ts-toolbelt/out/Any/_api';

import type {
	And,
	Not,
	Or,
	Xor,
} from 'ts-toolbelt/out/Boolean/_api';

import type {
	If,
} from 'ts-toolbelt/out/Any/If';


export type False = 0;
export type True = 1;
export type Bool = True | False;

export type AsBool<Input> = Try<Input, Bool, Bool>;

export type ToPrimitiveBoolean<
	Input extends Bool,
> = [Input] extends [True]
		? true
		: ([Input] extends [False]
			? false
			: (Input extends boolean
				? Input
				: boolean
			)
		);

export type ASSERT_TRUE<
	Test extends True | False | true | false,
> = [Test] extends [True]
		? True
		: ([Test] extends [true]
			? True
			: False
		);

export type ASSERT_FALSE<
	Test extends True | False | true | false,
> = [Test] extends [False]
		? True
		: ([Test] extends [false]
			? True
			: False
		);

export type ASSERT_BOOLEAN<
	Test extends True | False | true | false,
> = [Test] extends [False]
		? False
		: ([Test] extends [True]
			? False
			: ([Test] extends [false]
				? False
				: ([Test] extends [true]
					? False
					: True
				)
			)
		);



export type AsString<Any> = [Any] extends [string]
	? Any
	: string;

export type ASSERT_NEVER<Test> = [Test] extends [never]? 1: 0;

export type ASSERT_STRING<String extends string> = [Not<IsOnlyLiteralStrings<String>>] extends [True]? 1: 0;

export type ASSERT_EQUAL<StringA extends string, StringB extends string> = [StringsMatch<StringA, StringB>] extends [True]? 1: 0;

export type ASSERT_SAME<ThingA, ThingB> = [And<Extends<ThingA, ThingB>, Extends<ThingB, ThingA>>] extends [True]? 1: 0;

export type ASSERT_VOID<Thing> = ASSERT_SAME<Thing, void>;


{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const At_t: ASSERT_TRUE<true> = 1;
	const At_f: ASSERT_TRUE<false> = 0;
	const At_b: ASSERT_TRUE<boolean> = 0;

	const Af_t: ASSERT_FALSE<true> = 0;
	const Af_f: ASSERT_FALSE<false> = 1;
	const Af_b: ASSERT_FALSE<boolean> = 0;

	const Ab_t: ASSERT_BOOLEAN<true> = 0;
	const Ab_f: ASSERT_BOOLEAN<false> = 0;
	const Ab_b: ASSERT_BOOLEAN<boolean> = 1;

	const Af_Bf: ASSERT_FALSE<And<False, False>> = 1;
	const Af_Bt: ASSERT_FALSE<And<False, True>> = 1;
	const At_Bf: ASSERT_FALSE<And<True, False>> = 1;
	const At_Bt: ASSERT_TRUE<And<True, True>> = 1;

	const Ab_Bb: ASSERT_BOOLEAN<And<Bool, Bool>> = 1;
	const Ab_Bf: ASSERT_FALSE<And<Bool, False>> = 1;
	const Ab_Bt: ASSERT_BOOLEAN<And<Bool, True>> = 1;
	const Af_Bb: ASSERT_FALSE<And<False, Bool>> = 1;
	const At_Bb: ASSERT_BOOLEAN<And<True, Bool>> = 1;

	const AfIBf: ASSERT_FALSE<Or<False, False>> = 1;
	const AfIBt: ASSERT_TRUE<Or<False, True>> = 1;
	const AtIBf: ASSERT_TRUE<Or<True, False>> = 1;
	const AtIBt: ASSERT_TRUE<Or<True, True>> = 1;

	const AbIBb: ASSERT_BOOLEAN<Or<Bool, Bool>> = 1;
	const AbIBf: ASSERT_BOOLEAN<Or<Bool, False>> = 1;
	const AbIBt: ASSERT_TRUE<Or<Bool, True>> = 1;
	const AfIBb: ASSERT_BOOLEAN<Or<False, Bool>> = 1;
	const AtIBb: ASSERT_TRUE<Or<True, Bool>> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


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
export type IsOnlyLiteralStrings<Test extends string | void> =
	[Test] extends [string]
		? ([Test] extends [`${infer ActualTest}`]
			? True
			: False
		): False;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const A: ASSERT_TRUE<IsOnlyLiteralStrings<'A'>> = 1;
	const AB: ASSERT_TRUE<IsOnlyLiteralStrings<'A' | 'B'>> = 1;
	const S: ASSERT_FALSE<IsOnlyLiteralStrings<string>> = 1;
	const SA: ASSERT_FALSE<IsOnlyLiteralStrings<string | 'A'>> = 1;
	const SAB: ASSERT_FALSE<IsOnlyLiteralStrings<string | 'A' | 'B'>> = 1;
	const O: ASSERT_FALSE<IsOnlyLiteralStrings<void>> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
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
export type AutoString<
	String,
	Default=string,
> = 
	String extends string
		? (String extends undefined
			? Default
			: String
		)
		: Default;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
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

	const U: ASSERT_SAME<AutoString<undefined>, string> = 1;
	const UZ: ASSERT_EQUAL<AutoString<undefined, 'Z'>, 'Z'> = 1;
	const UA: ASSERT_SAME<AutoString<undefined | 'A', 'Z'>, 'A' | 'Z'> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


export type ActualStringsMatch<
	StringA extends `${string}`,
	StringB extends `${string}`,
> = And<
		Extends<StringA, StringB>,
		Extends<StringB, StringA>
	> extends False
		? False
		: If<
			And<
				Extends<[StringA], [StringB]>,
				Extends<[StringB], [StringA]>
			>,
			If<
				Or<
					IsUnion<StringA>,
					IsUnion<StringB>
				>,
				Bool,
				True
			>,
			Bool
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
 export type StringsMatch<
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
			? (Xor<AsBool<StringAVoid>, AsBool<StringBVoid>> extends True
				? False
				: If<
					And<AsBool<StringAVoid>, AsBool<StringBVoid>>,
					True,
					Bool
				>
			)
			: Bool
		);

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
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
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


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
export type IsUnion<Test> = Union.ListOf<Test>['length'] extends 1? False: True;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const A: ASSERT_FALSE<IsUnion<'A'>> = 1;
	const S: ASSERT_FALSE<IsUnion<string>> = 1;
	const O: ASSERT_FALSE<IsUnion<void>> = 1;
	const AB: ASSERT_TRUE<IsUnion<'A' | 'B'>> = 1;
	const AS: ASSERT_FALSE<IsUnion<'A' | string>> = 1;
	const AO: ASSERT_TRUE<IsUnion<'A' | void>> = 1;
	const OA: ASSERT_TRUE<IsUnion<void | 'A'>> = 1;
	const SO: ASSERT_TRUE<IsUnion<string | void>> = 1;
	const OS: ASSERT_TRUE<IsUnion<void | string>> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}
 
export type DirectlyIncludes<UnionType, Item> = If<
	IsUnion<Item>,
	Extends<[Item], [UnionType]>,
	UnionType extends infer Find
		? (Find extends Item
			? (Item extends UnionType? True: False)
			: False
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
export type Includes<UnionType, Item> = DirectlyIncludes<UnionType, Item> extends infer Directly
	? Or<
		AsBool<Directly>,
		IsUnion<Directly>
	>
	: never;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
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
	/* eslint-enable @typescript-eslint/no-unused-vars */
}


/**
 * `<Subject, From, Into> => Subject | Into`
 * 
 * If the type `From` extends `Subject`, then return `Into`; otherwise return `Subject`
 */
export type Coerce<
	Subject extends any,
	From extends any,
	Into extends any,
> = From extends Subject
	? Into
	: Subject;


export type Auto<
	Thing extends any,
	Default extends any,
> = Thing extends void
	? Default
	: Thing extends Default
		? Thing
		: Default;

// export type Auto<
// 	Thing extends any,
// 	Default extends any,
// > = Thing extends void
// 	? Default
// 	: Thing extends Default
// 		? Thing
// 		: Default;

{
	/* eslint-disable @typescript-eslint/no-unused-vars */
	const AS: ASSERT_EQUAL<Coerce<'A', string, 'Z'>, 'A'> = 1;
	const ABS: ASSERT_SAME<Coerce<'A' | 'B', string, 'Z'>, 'A' | 'B'> = 1;
	const SS: ASSERT_EQUAL<Coerce<string, string, 'Z'>, 'Z'> = 1;
	/* eslint-enable @typescript-eslint/no-unused-vars */
}
