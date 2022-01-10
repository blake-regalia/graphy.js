import type {
	ALPHA,
	DIGIT,
	LiterallyTrue,
	LiterallyFalse,
} from './gen'

export type ALPHA_LOWER = ALPHA;
export type ALPHA_UPPER = Uppercase<ALPHA_LOWER>;
export type ALPHA_ANY = ALPHA_LOWER | ALPHA_UPPER;

export type ALPHANUM = ALPHA | DIGIT;

export type LiterallyTrueOrFalse = LiterallyTrue | LiterallyFalse;

export type LiterallyInteger = string;
export type LiterallyDouble = string;
export type LiterallyDecimal = string;

