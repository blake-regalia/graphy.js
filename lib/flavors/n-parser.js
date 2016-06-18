/* eslint-disable */

@ // import parser macros
@include 'parser-macros.builder-js'

@ // possible mode types for this file are:
@ // NT: N-Triples
@ // NQ: N-Quads

@{constants()}

const R_ESCAPELESS = /^([^"\\]*)$/;

const R_CLEAN = /\s*(?:\s*#[^\n]*\n)*\s*/y;

const R_TRIPLE_STICKY = /(?:<([^>]*)>|_:([^\s<]+))\s*<([^>]*)>\s*(.*?)\s*\.\s*(?:#[^\n]*)?\n\s*/y;
const R_LITERAL = /^"(.*)"(?:\^\^<(.*)>|@([^\s.]+))$/;

@ // make prototype function for each rdf object term type
@{term_types()}


@macro parse_n()
	// remove whitespace & comments from beginning
	R_CLEAN.lastIndex = 0;
	R_CLEAN.exec(s);

	// update index and prepare to match triples
	let i = R_TRIPLE_STICKY.lastIndex = R_CLEAN.lastIndex;

	// match triples
	while(true) {
		let m_triple = R_TRIPLE_STICKY.exec(s);
		if(m_triple) {

			// update index
			i = R_TRIPLE_STICKY.lastIndex;

			// prep object term
			let w_object;

			// determine object term type
			let s_object = m_triple[4];
			let m_literal = R_LITERAL.exec(s_object);

			// objet term type is literal
			if(m_literal) {
				// make literal
				w_object = new Literal(m_literal[1]);

				// set datatype if present
				if(m_literal[2]) {
					w_object@{literal_datatype()} = m_literal[2];
				}
				// otherwise, set langtag if present
				else if(m_literal[3]) {
					w_object@{literal_language()} = m_literal[3];
				}
			}
			// object term type is iri; make iri
			else if('<' === s_object[0]) {
				w_object = new Iri(s_object.slice(1, -1));
			}
			// object term type is blank node; make blank node
			else {
				w_object = new Blanknode(s_object.substr(2));
			}

			// emit triple event
			this.triple({
				subject: m_triple[1] || ' '+m_triple[2],
				predicate: m_triple[3],
				object: w_object,
			});
		}
		// no match
		else {
			break;
		}
	}
@end


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
				@{this_defer_errors()}
			},
		});

		// end of file
		const eof = () => {
			// there is still unparsed data
			if(this.pre.length) {
				// append newline to end so we can match triple token
				let s = this.pre + '\n';

				@ // parse remainder
				@{parse_n()}

				// still unparsed characters
				if(i < s.length) {
					// throw parse error
					this.defer.parse_error('triple');
				}
			}

			// call event listener
			if(h_events.end) {
				h_events.end();
			}
			// otherwise; log a warning
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

				@ // parse chunk
				@{parse_n()};

				// update unparsed data string
				this.pre = s.substr(i);
			});
		}
		// string
		else if ('string' === typeof ds) {
			// ref entire string
			let s = ds;

			@ // parse all at once
			@{parse_n()}

			// reached eof
			eof();
		}
	}

}

module.exports = function(ds, h_events) {
	new Parser(ds, h_events);
};