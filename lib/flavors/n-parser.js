/* eslint-disable */

@ // import parser macros
@include 'parser-macros.builder-js'

@ // possible mode types for this file are:
@ // NT: N-Triples
@ // NQ: N-Quads

@{constants()}

const R_CLEAN = /\s*(?:\s*#[^\n]*\n)*\s*/y;
const R_TRIPLE = /(?:<([^>]*)>|_:([^ \t<]+))[ \t]*<([^>]*)>[ \t]*(.*?)[ \t]*\.\s*(?:#[^\n]*)?\n\s*/y;
const R_LITERAL = /^"(.*)"(?:\^\^<(.*)>|@([^ \t.]+))$/;

const R_HAS_ESCAPES = /[\\]/;

@ // make prototype function for each rdf object term type
@{term_types()}


@macro parse_n()
	// remove whitespace & comments from beginning
	R_CLEAN.lastIndex = 0;
	R_CLEAN.exec(s);

	// update index and prepare to match triples
	let i = R_TRIPLE.lastIndex = R_CLEAN.lastIndex;

	// match triples
	while(true) {
		let m_triple = R_TRIPLE.exec(s);
		if(m_triple) {

			// update index
			i = R_TRIPLE.lastIndex;

			// prep object term
			let w_object;

			// determine object term type
			let s_object = m_triple[4];
			let m_literal = R_LITERAL.exec(s_object);

			// objet term type is literal
			if(m_literal) {
				// ref literal value
				let s_literal = m_literal[1];

				// string literal has escapes
				if(R_HAS_ESCAPES.test(s_literal)) {
					w_object = new Literal(@{unescape('s_literal')});
				}
				// no escapes
				else {
					w_object = new Literal(s_literal);
				}

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


function Parser(z_input, h_events) {

	// members
	Object.assign(this, {

		// triple event
		triple: h_events.triple,

		// left-over string from previous data chunk
		pre: '',

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

	// duplex
	if(null === z_input) {
		// create transform
		let d_transform = new require('stream').Transform();

		// transform
		if(h_events.async) {
			throw 'async transforms not yet implemented';
		}
		else {
			this.triple = (h_triple) => {
				// synchronously transform triple
				let z_response = h_events.triple(h_triple);

				// indeed response
				if(z_response) {
					// write output stream
					d_transform.push(z_response);
				}
			};
		}

		// // once there's no more data to consume, invoke eof
		// d_transform._flush = (f_done) => {
		// 	console.log('EOF');
		// 	eof();
		// 	f_done();
		// };

		// on data event
		d_transform._transform = (s_chunk, s_encoding, f_okay_chunk) => {
			// concatenate current chunk to previous chunk
			let s = this.pre + s_chunk;

			@ // parse chunk
			@{parse_n()}

			// update unparsed data string
			this.pre = s.substr(i);
		};

		// public operator
		this.operator = d_transform;
	}
	// stream
	else if(z_input.setEncoding) {
		// set encoding on stream
		z_input.setEncoding('utf8');

		// once stream closes, invoke eof
		z_input.on('end', eof);

		// on data event
		z_input.on('data', (s_chunk) => {
			// concatenate current chunk to previous chunk
			let s = this.pre + s_chunk;

			@ // parse chunk
			@{parse_n()};

			// update unparsed data string
			this.pre = s.substr(i);
		});
	}
	// string
	else if('string' === typeof z_input) {
		// ref entire string
		let s = z_input + '\n';

		@ // parse all at once
		@{parse_n()}

		// reached eof
		eof();
	}
	// invalid arg
	else {
		throw new TypeError('[graphy] invalid argument for input parameter');
	}
}

// 
module.exports = function(z_input, h_events) {
	// duplex mode
	if(1 === arguments.length) {
		// shift arguments
		h_events = z_input; z_input = null;
	}

	// create parser, return operator if it wants to
	return (new Parser(z_input, h_events)).operator;
};