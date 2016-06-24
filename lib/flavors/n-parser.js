/* eslint-disable */

@ // import parser macros
@include 'parser-macros.builder-js'

@ // possible mode types for this file are:
@ // NT: N-Triples
@ // NQ: N-Quads

@{constants()}

const R_CLEAN = /\s*(?:#[^\n]*\n\s*)*\s*/y;
const R_LITERAL_ESCAPELESS = /^"([^\\"]*)"(?:\^\^<([^\\>]*)>|@([^ \t.]+))$/;
const R_LITERAL = /^"(.*)"(?:\^\^<(.*)>|@([^ \t.]+))$/;


@if TRIPLES
	@set STATEMENT_REGEX 'R_TRIPLE'
	const R_TRIPLE_ESCAPELESS_SP = /(?:<([^\\>]*)>|_:([^ \t<]+))[ \t]*<([^\\>]*)>[ \t]*(.*?)[ \t]*\.\s*(?:#[^\n]*\n\s*|\n\s*)+/y;
	const R_TRIPLE = /(?:<([^>]*)>|_:([^ \t<]+))[ \t]*<([^>]*)>[ \t]*(.*?)[ \t]*\.\s*(?:#[^\n]*\n\s*|\n\s*)+/y;
@elseif QUADS
	@set STATEMENT_REGEX 'R_QUAD'
	const R_QUAD_ESCAPELESS_SP = /(?:<([^\\>]*)>|_:([^ \t<]+))[ \t]*<([^\\>]*)>[ \t]*(.*?)[ \t]*(?:<([^>]*)>|_:([^ \t<]+))[ \t]*\.\s*(?:#[^\n]*\n\s*|\n\s*)+/y;
	const R_QUAD = /(?:<([^>]*)>|_:([^ \t<]+))[ \t]*<([^>]*)>[ \t]*(.*?)[ \t]*(?:<([^>]*)>|_:([^ \t<]+))[ \t]*\.\s*(?:#[^\n]*\n\s*|\n\s*)+/y;
@end


@ // make prototype function for each rdf object term type
@{term_types()}

@macro unescape_iri(term)
	R_HAS_ESCAPES.test(@{term})? @{term}.@{replace_unicode(true)}: @{term}
@end

@macro match_body(match, escape_subject, escape_predicate)
	// prep object term
	let w_object;

	// determine object term type
	let s_object = @{match}[4];

	let x = s_object[0];

	// objet term type is literal
	if('"' === x) {
		// no escapes in string nor datatype
		let m_literal_e = R_LITERAL_ESCAPELESS.exec(s_object);
		if(m_literal_e) {
			// literal has no escapes
			w_object = new Literal(m_literal_e[1]);

			// set datatype if present
			if(m_literal_e[2]) {
				w_object@{literal_datatype()} = m_literal_e[2];
			}
			// otherwise, set langtag if present
			else if(m_literal_e[3]) {
				w_object@{literal_language()} = m_literal_e[3];
			}
		}
		// escapes in string and/or datatype
		else {
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
					w_object@{literal_datatype()} = @{unescape_iri('m_literal[2]')};
				}
				// otherwise, set langtag if present
				else if(m_literal[3]) {
					w_object@{literal_language()} = m_literal[3];
				}
			}
			else {
				this.defer.parse_error('string literal');
			}
		}
	}
	// object term type is iri; make iri
	else if('<' === x) {
		w_object = new NamedNode(s_object.slice(1, -1));
	}
	// object term type is blank node; make blank node
	else {
		// object term type is blank node; make blank node
		w_object = new BlankNode(s_object.substr(2));
	}

	// emit data event
	this.data(new Quad(
		@{match}[1]? new NamedNode(
			@if escape_subject
				@{unescape_iri(match+'[1]')}
			@else
				@{match}[1]
			@end
			): new BlankNode(@{match}[2]),
		new NamedNode(
			@if escape_predicate
				@{unescape_iri(match+'[3]')}
			@else
				@{match}[3]
			@end
			),
		w_object,
		@if QUADS
			@{match}[5]
				? new NamedNode(@{unescape_iri(match+'[5]')})
				: new BlankNode(@{match}[6])
		@else
			H_DEFAULT_GRAPH
		@end
	));
@end



@macro parse_n()
	// prep string to parse
	let s = this.pre + s_chunk;

	// remove whitespace & comments from beginning
	R_CLEAN.lastIndex = 0;
	R_CLEAN.exec(s);

	// update index and prepare to match statement
	let i = R_CLEAN.lastIndex;

	// match @{STATEMENT_TYPE}s
	while(true) {
		@{if_match(STATEMENT_REGEX+'_ESCAPELESS_SP', 'm_statement_e_sp', true)}
			@{match_body('m_statement_e_sp')}
			
		@{else_if_match(STATEMENT_REGEX, 'm_statement', true)}
			console.log('escaped s/p iri');
			@{match_body('m_statement', true, true)}

		@{else_retry()}
	}

	// update unparsed data string
	this.pre = s.substr(i);
@end


function Parser(z_input, h_config) {

	// members
	Object.assign(this, {

		// left-over string from previous data chunk
		pre: '',

		// pause control
		n: 0,

		// events
		data: h_config.data,

		// for restoring the original event callback when resuming paused stream
		restore_data: h_config.data,

		// keep a queue of data events to hold onto until stream resumes (only happens in rare conditions)
		queue_event: [],

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
			this.statement('\n');

			// still unparsed characters
			if(this.pre.length) {
				// save string and index before calling parse error
				this.s = this.pre; this.i = i;

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
			this.data = (h_statement) => {
				// synchronously transform @{STATEMENT_TYPE}
				h_config.data(h_statement, a_buffer);
			};
		}

		// once there's no more data to consume, invoke eof
		d_transform._flush = (f_done) => {
			// now that stream has ended, clean up remainder
			eof(1);

			@ // empty the buffer
			@{write_buffer()}

			// call end event listener
			if(h_config.end) {
				h_config.end();
			}

			// close stream
			f_done();
		};

		// on data event
		d_transform._transform = (s_chunk, s_encoding, f_okay_chunk) => {
			@ // parse chunk (avoiding a call to `this.statement` saves time for large files)
			@{parse_n()}

			@ // write buffer to output
			@{write_buffer()}

			// done transforming this chunk
			f_okay_chunk();
		};

		@ // make stream controls for a transform
		@{stream_control('d_transform', true)}

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
			debugger;
			@ // parse chunk
			@{parse_n()};
		});

		@ // make stream controls
		@{stream_control('z_input')}
	}
	// string
	else if('string' === typeof z_input) {
		// set entire string as input
		this.pre = z_input;

		@ // emulate stream controls
		@{stream_control()}

		// parse all at once
		this.statement('\n');

		// reached eof
		eof();
	}
	// invalid arg
	else {
		throw new TypeError('[graphy] invalid argument for input parameter');
	}
}


Parser.prototype.statement = function(s_chunk) {
	@ // parse chunk
	@{parse_n()};
};



@{export_module()}
