declare const debug_hint: unique symbol;

// Debug and Error types
export type Debug<
	A extends any,
	Hint extends any,
> = {
   [debug_hint]: Hint;
} & A;

type InvalidTermTypeError<
	TermTypeString extends string,
	Disguise = unknown,
	> = Debug<Disguise, `'${TermTypeString}' is an invalid value for the .termType property`>;

