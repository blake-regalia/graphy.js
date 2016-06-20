/* eslint-disable */

@ // import parser macros
@include 'parser-macros.builder-js'

@ // possible mode types for this file are:
@ // NT: N-Triples
@ // NQ: N-Quads

@{constants()}

const R_CLEAN = /\s*(?:#[^\n]*\n\s*)*\s*/y;
const R_LITERAL = /^"(.*)"(?:\^\^<(.*)>|@([^ \t.]+))$/;

const R_HAS_ESCAPES = /[\\]/;

@if TRIPLES
	@set STATEMENT_REGEX 'R_TRIPLE'
	const R_TRIPLE = /(?:<([^>]*)>|_:([^ \t<]+))[ \t]*<([^>]*)>[ \t]*(.*?)[ \t]*\.\s*(?:#[^\n]*\n\s*|\n\s*)+/y;
@elseif QUADS
	@set STATEMENT_REGEX 'R_QUAD'
	const R_QUAD = /(?:<([^>]*)>|_:([^ \t<]+))[ \t]*<([^>]*)>[ \t]*(.*?)[ \t]*(?:<([^>]*)>|_:([^ \t<]+))[ \t]*\.\s*(?:#[^\n]*\n\s*|\n\s*)+/y;
@end

@ // make prototype function for each rdf object term type
@{term_types()}

@macro parse_n()
	// remove whitespace & comments from beginning
	R_CLEAN.lastIndex = 0;
	R_CLEAN.exec(s);

	// update index and prepare to match statement
	let i = @{STATEMENT_REGEX}.lastIndex = R_CLEAN.lastIndex;

	// match @{STATEMENT_TYPE}s
	while(true) {
		let m_statement = @{STATEMENT_REGEX}.exec(s);
		if(m_statement) {

			// update index
			i = R_TRIPLE.lastIndex;

			// prep object term
			let w_object;

			// determine object term type
			let s_object = m_statement[4];
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
				w_object = new NamedNode(s_object.slice(1, -1));
			}
			// object term type is blank node; make blank node
			else {
				w_object = new BlankNode(s_object.substr(2));
			}

			// emit @{STATEMENT_TYPE} event
			this.@{STATEMENT_TYPE}({
				subject: m_statement[1]? new NamedNode(m_statement[1]): new BlankNode(m_statement[2]),
				predicate: new NamedNode(m_statement[3]),
				object: w_object,
				@if QUADS
					graph: m_statement[5]? new NamedNode(m_statement[5]): new BlankNode(m_statement[6]),
				@end
			});
		}
		// no match
		else {
			break;
		}
	}
@end


function Parser(z_input, h_config) {

	// members
	Object.assign(this, {

		// @{STATEMENT_TYPE} event
		@{STATEMENT_TYPE}: h_config.@{STATEMENT_TYPE},

		// left-over string from previous data chunk
		pre: '',

		// spare polluting primary `this` hash lookup for low-frequency calls
		defer: {
			@{this_defer_errors()}
		},
	});

	// end of file
	const eof = (b_no_callback) => {
		// there is still unparsed data
		if(this.pre.length) {
			// append newline to end so we can match @{STATEMENT_TYPE} token
			let s = this.pre + '\n';

			@ // parse remainder
			@{parse_n()}

			// still unparsed characters
			if(i < s.length) {
				// save string and index before calling parse error
				this.s = s; this.i = i;

				// throw parse error
				this.defer.parse_error('statement');
			}
		}

		// our duty to notify listener
		if(1 !== b_no_callback) {
			// call end event listener
			if(h_config.end) {
				h_config.end();
			}
			// otherwise; log a warning
			else {
				console.warn('[graphy] reached end of file, but no `end` event listener to call');
			}
		}
	};


	// duplex
	if(null === z_input) {
		// create transform
		let d_transform = new require('stream').Transform();

		// prep buffer to build string before flush
		let a_buffer = [];

		// transform
		if(h_config.async) {
			throw 'async transforms not yet implemented';
		}
		else {
			this.@{STATEMENT_TYPE} = (h_statement) => {
				// synchronously transform @{STATEMENT_TYPE}
				h_config.@{STATEMENT_TYPE}(h_statement, a_buffer);
			};
		}

		// once there's no more data to consume, invoke eof
		d_transform._flush = (f_done) => {
			// now that stream has ended, clean up remainder
			eof(1);

			// empty the buffer
			if(a_buffer.length) {
				d_transform.push(a_buffer.join('\n'), 'utf8');
				a_buffer.length = 0;
			}

			// call end event listener
			if(h_config.end) {
				h_config.end();
			}

			// close stream
			f_done();
		};

		// on data event
		d_transform._transform = (s_chunk, s_encoding, f_okay_chunk) => {
			// concatenate current chunk to previous chunk
			let s = this.pre + s_chunk;

			@ // parse chunk
			@{parse_n()}

			// update unparsed data string
			this.pre = s.substr(i);

			// write buffer to output
			if(a_buffer.length) {
				d_transform.push(a_buffer.join('\n'), 'utf8');
				a_buffer.length = 0;
			}

			// done transforming this chunk
			f_okay_chunk();
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


@{export_module()}
