
let literal = (s_literal) => ({
	type: 'literal',
	value: s_literal,
});

let pattern = (r_pattern, a_chars_0) => ({
	type: 'pattern',
	value: r_pattern,
	chars: a_chars_0,
});

let quantity = (a_productions, s_quantifier) => ({
	type: 'quantity',
	productions: a_productions,
	quantifier: s_quantifier,
});

let h_language = {
	productions: {
		start: [
			'statement*',
		],
		statement: [
			['directive'],
			['triples', literal('.')],
		],
		directive: [
			'prefixID',
			'base',
			'sparqlPrefix',
			'sparqlBase',
		],
		prefixID: [
			literal('@prefix'),
			'PNAME_NS',
			'IRIREF',
			literal('.'),
		],
		sparqlPrefix: [
			pattern(/PREFIX/i, ['p', 'P']),
		],
		triples: [
			['subject', 'predicateObjectList'],
			['blankNodePropertyList', 'predicateObjectList?'],
		],
		predicateObjectList: [
			'verb',
			'objectList',
			quantity([
				';',
				quantity([
					'verb',
					'objectList',
				], '?'),
			], '*'),
		],

		IRIREF: [
			'<',
			quantity([
				[pattern(/[^\u0000-\u0020<>"{}|^`\\]/), 'UCHAR'],
			], '*'),
			'>',
		],
	},
};
