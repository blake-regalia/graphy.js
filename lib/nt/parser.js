/* eslint-disable */


const R_IRIREF = /<([^>]*)>\s*/y;


const R_BLANK_NODE_LABEL = /_:([^\s<.]+)(?:\s+|(?=[<.]))/y;

const R_STRING_LITERAL_QUOTE = /"((?:[^"\\]|\\.)*)"\s*/y;
const R_STRING_LITERAL_QUOTE_ESCAPELESS = /"([^"\\]*)"\s*/y;

const R_ESCAPES = /(\\\\)|\\([^tbnrfu\\])/g;


const R_DOUBLE_CARET = /\^\^/y;
const R_WS = /\s*/y;
const R_LANGTAG = /@([A-Za-z0-9\-]+)(?:\s+|(?=[.;,\])#]))/y;


const R_COMMENT = /(#[^\n]*\n\s*)+/y;
const R_CLEAN = /\s*(?:\s*#[^\n]*\n)*\s*/y;


const R_CHAR_STOP = /\.\s*/y;

const R_TRIPLE = /^(?:<([^>]*)>|_:([^\s<]+))\s*<([^>]*)>\s*(.*?)\s*\.\s*(?:#.*)?$/;
const R_TRIPLE_STICKY = /(?:<([^>]*)>|_:([^\s<]+))\s*<([^>]*)>\s*(.*?)\s*\.\s*(?:#[^\n]*)?\n\s*/y;
const R_LITERAL = /^"(.*)"(?:\^\^<(.*)>|@([^\s.]+))$/;



function Iri(s_iri) {
	this.iri = s_iri;
}
Iri.prototype.is = Object.assign(function() {
	return 'iri';
}, {
	iri: true,
});

function Literal(s_value) {
	this.value = s_value;
}
Literal.prototype.is = Object.assign(function() {
	return 'literal';
}, {
	literal: true,
});

function Blanknode(s_label) {
	this.label = s_label;
}
Blanknode.prototype.is = Object.assign(function() {
	return 'blanknode';
}, {
	blanknode: true,
});



class Parser {

	constructor(ds, h_events) {

		// track index for anonymous blank node labels
		let i_anon = 0;

		// members
		Object.assign(this, {

			// triple event
			triple: h_events.triple,

			// current parser state
			resume: this.statement,

			// left-over string from previous data chunk
			pre: '',


			// what to do when reach eos
			pause: false,

			// which state to go to after end of triple
			after_end_of_triple: this.post_object,

			// spare polluting primary `this` hash lookup for low-frequency calls
			defer: {

				// error event
				error: h_events.error || ((e_parse) => {
					throw `parse error: ${e_parse}`;
				}),

				// parse_error (not meant to be an event callback)
				parse_error: (s_expected) => {
					let i = this.i;
					let s = this.s;
					let i_off = Math.min(i, Math.abs(i - 15));
					this.defer.error(`\n\`${s.substr(i_off, i_off+30).replace(/[\n\t]/g, ' ')}\`\n` +
						` ${' '.repeat(i-i_off)}^\n` +
						`expected ${s_expected}.  failed to parse a valid token starting at ${s[i]? '"'+s[i]+'"': '<EOF>'}`);
				},

			},
		});

		// end of file
		const eof = () => {
			// invalid parsing state
			if (this.statement !== this.resume) {
				this.defer.parse_error(this.resume.name);
			}
			// there are still unparsed characters
			else if (this.i < this.n) {
				// consume whitespace and comments
				let s = this.s;
				let i = this.i;
				R_WS.lastIndex = i;
				R_WS.exec(s);
				i = R_WS.lastIndex;
				R_COMMENT.lastIndex = i;
				R_COMMENT.exec(s);
				this.i = i = R_COMMENT.lastIndex;

				// still unparsed characters
				if (i < this.n) {
					// throw parse error
					this.defer.parse_error(this.resume.name);
				}
			}

			// call event listener
			if (h_events.end) {
				h_events.end();
			}
			// otherwise log a warning
			else {
				console.warn('[graphy] reached end of file, but no `end` event listener to call');
			}
		};


		// stream
		if (ds.on) {
			// once stream closes, invoke eof
			ds.on('end', eof);

			// begin
			ds.on('data', (s_in) => {
				// concatenate current chunk to previous chunk
				let s = this.pre + s_in;
				let i = 0;

				R_CLEAN.lastIndex = 0;
				R_CLEAN.exec(s);
				i = R_TRIPLE_STICKY.lastIndex = R_CLEAN.lastIndex;
				do {
					let m_triple = R_TRIPLE_STICKY.exec(s);
					if(m_triple) {
						i = R_TRIPLE_STICKY.lastIndex;
						let w_object;
						let s_object = m_triple[4];

						let m_literal = R_LITERAL.exec(s_object);
						if(m_literal) {
							w_object = new Literal(m_literal[1]);
							if(m_literal[2]) {
								w_object['datatype'] = m_literal[2];
							}
							else if(m_literal[3]) {
								w_object['langtag'] = m_literal[3];
							}
						}
						else {
							w_object = new Iri(s_object.slice(1, -1));
						}

						this.triple({
							subject: m_triple[1] || ' '+m_triple[2],
							predicate: m_triple[3],
							object: w_object,
						});
					}
					else {
						break;
					}
				} while(true)


				this.pre = s.substr(i);


					// //
					// let a = s.split(/\s*\n\s*/g);

					// // begin
					// for(let i=0; i<a.length-1; i++) {
					// 	let s_line = a[i];
					// 	let m_triple = R_TRIPLE.exec(s_line);

					// 	if(m_triple) {
					// 		let w_object;
					// 		let s_object = m_triple[4];

					// 		let m_literal = R_LITERAL.exec(s_object);
					// 		if(m_literal) {
					// 			w_object = new Literal(m_literal[1]);
					// 			if(m_literal[2]) {
					// 				w_object['datatype'] = m_literal[2];
					// 			}
					// 			else if(m_literal[3]) {
					// 				w_object['langtag'] = m_literal[3];
					// 			}
					// 		}
					// 		else {
					// 			w_object = new Iri(s_object.slice(1, -1));
					// 		}

					// 		this.triple({
					// 			subject: m_triple[1] || ' '+m_triple[2],
					// 			predicate: m_triple[3],
					// 			object: w_object,
					// 		});
					// 	}
					// }

					// this.pre = a[a.length-1];
			});
		}
		// string
		else if ('string' === typeof ds) {
			// concatenate previous chunk
			this.s = ds;

			// pausing means we've reached eof
			this.pause = eof;

			// compute chunk length
			this.n = this.s.length;

			// reset index
			this.i = 0;

			// consume whitespace
			let s = this.s;
			R_WS.lastIndex = 0;
			R_WS.exec(s);
			this.i = R_WS.lastIndex;

			// begin
			this.resume();
		}
	}

}

module.exports = function(ds, h_events) {
	new Parser(ds, h_events);
};