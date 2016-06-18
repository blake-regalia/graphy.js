/* eslint-disable */

@ // import parser macros
@include 'parser-macros.builder-js'

@{constants()}

const R_ESCAPELESS = /^([^"\\]*)$/;

const R_CLEAN = /\s*(?:\s*#[^\n]*\n)*\s*/y;

const R_TRIPLE_STICKY = /(?:<([^>]*)>|_:([^\s<]+))\s*<([^>]*)>\s*(.*?)\s*\.\s*(?:#[^\n]*)?\n\s*/y;
const R_LITERAL = /^"(.*)"(?:\^\^<(.*)>|@([^\s.]+))$/;

@{term_types()}

class Parser {

	constructor(ds, h_events) {

		// members
		Object.assign(this, {

			// triple event
			triple: h_events.triple,

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
			// there are still unparsed characters
			if(this.pre.length) {
				// append newline to end
				this.pre += '\n';

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

				let i = R_CLEAN.lastIndex = 0;
				R_CLEAN.exec(s);
				i = R_TRIPLE_STICKY.lastIndex = R_CLEAN.lastIndex;
				while(true) {
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
						else if('<' === s_object[0]) {
							w_object = new Iri(s_object.slice(1, -1));
						}
						else {
							w_object = new Blanknode(s_object.substr(2));
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
				}


				this.pre = s.substr(i);
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