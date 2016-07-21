/*eslint no-console:0*/
const fs = require('fs');

let a_enums = [
	'\u002cWe "cannot\\" escape \t\n\b\r\f all these characters \\\'',
	'seriously, "what" are "we" to do?',
];


const R_UNICODE_8 = /\\U(?:0000([0-9A-Fa-f]{4})|([0-9A-Fa-f]{8}))/g;
const R_ESCAPES = /(\\[\\])|\\([^tbnrfu\\])/g;

const F_UNICODE_REPLACE = (s_, s_4, s_8) => {
	if (s_4) return String.fromCharCode(parseInt(s_4, 16));

	// produce utf16 be surrogate pair
	let x_cp = parseInt(s_8, 16) - 0x10000;
	return String.fromCharCode(0xD800 + (x_cp >> 10), 0xDC00 + (x_cp & 0x3FF));
};


console.time('g');

const H_SPECIAL_ESCAPES = {
	'\t': '\\t',
	'\r': '\\r',
	'\f': '\\f',
	'\u0008': '\\b',
	'\n': '\\n',
	'"': '\\"',
};

for(let i=0; i<100000; i++) {
	// JSON.parse('"' +
	// 	a_enums[i%a_enums.length]
	// 	.replace(R_UNICODE_8, F_UNICODE_REPLACE)
	// 	.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
	// 	.replace(/\t/g, '\\t') // tab characters not allowed in JSON strings
	// 	.replace(/\r/g, '\\r') // carriage returns not allowed in JSON strings
	// 	.replace(/\f/g, '\\f') // tab characters not allowed in JSON strings
	// 	.replace(/\u0008/g, '\\b') // tab characters not allowed in JSON strings
	// 	.replace(/\n/g, '\\n') // newline breaks not allowed in JSON strings
	// 	.replace(/"/g, '\\"') // escape all quotes ;)
	// 	+
	// 	'"');
	JSON.parse('"'+
		a_enums[i%a_enums.length]
			.replace(R_UNICODE_8, F_UNICODE_REPLACE)
			.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
			.replace(/[\t\r\f\u0008\n\"]/g, (s) => {
				return H_SPECIAL_ESCAPES[s];
			})
	+'"');
}

console.timeEnd('g');

