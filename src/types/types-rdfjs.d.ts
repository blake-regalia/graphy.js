type MockFalse = 0;
type MockTrue = 1;
type MockEither = 2;

type MockTrueOrFalse = MockTrue | MockFalse;

type MockBool = MockTrueOrFalse | MockEither;

type AsMockBool<Boolean extends boolean> = Boolean extends true
    ? MockTrue
    : MockFalse;

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
	SrcString extends `${string}`,
	ArgString extends `${string}`,
> = ArgString extends SrcString
	? true
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
    TermTypeStringA extends string,
    TermTypeStringB extends string,
    ValueStringA extends string,
    ValueStringB extends string,
> = And<
    StringsMatch<TermTypeStringA, TermTypeStringB>,
    StringsMatch<ValueStringA, ValueStringB>,
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
	> = StringPairsMatch<TermTypeStringA, TermTypeStringB, ValueStringA, ValueStringB> extends infer TermTypesAndValuesMatch
		? (TermTypesAndValuesMatch extends MockTrueOrFalse
			? (TermTypesAndValuesMatch extends MockFalse
				// (a.termType !== b.termType) || (a.value !== b.value)
				? MockFalse
				// (a.termType === b.termType) && (a.value === b.value)
				: (IsActualString<TermTypeStringA> extends true
					// a.termType is known
					? (StringsMatch<TermTypeStringA, 'Literal'> extends MockTrue
						// a.termType === 'Literal'
						? StringPairsMatch<LanguageStringA, LanguageStringB, DatatypeStringA, DatatypeStringB>
						// a.termType !== 'Literal'; term types and values match
						: TermTypesAndValuesMatch
					)
					: MockEither
				)
			)
			: MockEither
		)
		: MockEither;

    {
        const FALSE = 0;
        const TRUE = 1;
        const EITHER = 2;

        const BaBa: ObjectsMatch<'BlankNode', 'A', string, string, 'BlankNode', 'A', string, string> = TRUE;
        const BaBb: ObjectsMatch<'BlankNode', 'A', string, string, 'BlankNode', 'B', string, string> = FALSE;
        const BaNa: ObjectsMatch<'BlankNode', 'A', string, string, 'NamedNode', 'A', string, string> = FALSE;
        const BaNb: ObjectsMatch<'BlankNode', 'A', string, string, 'NamedNode', 'B', string, string> = FALSE;
        const BaBs: ObjectsMatch<'BlankNode', 'A', string, string, 'BlankNode', string, string, string> = EITHER;
        const BaSs: ObjectsMatch<'BlankNode', 'A', string, string, string, string, string, string> = EITHER;
        const BaSa: ObjectsMatch<'BlankNode', 'A', string, string, string, 'A', string, string> = EITHER;
        const BsSa: ObjectsMatch<'BlankNode', string, string, string, string, 'A', string, string> = EITHER;
        const SsSa: ObjectsMatch<string, string, string, string, string, 'A', string, string> = EITHER;
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
			? (StringsMatch<ValueStringA, ValueStringB> extends infer ValueStringsMatch
				// ValueStringsMatch := compare(a.value, b.value)
				? (And<TermTypeStringsMatch, ValueStringsMatch> extends infer TermTypeAndValueStringsMatch
					// TermTypeAndValueStringsMatch := TermTypeStringsMatch && ValueStringsMatch
					? (Or<
						StringsMatch<TermTypeStringA, 'Literal'>,
						StringsMatch<TermTypeStringB, 'Literal'>
					> extends MockTrue
						// a.isLiteral || b.isLiteral
						? (And<TermTypeAndValueStringsMatch,
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
