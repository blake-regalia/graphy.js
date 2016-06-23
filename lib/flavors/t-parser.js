/* eslint-disable */

@ // import parser macros
@include 'parser-macros.builder-js'

@ // possible mode types for this file are:
@ // TTL: Turtle
@ // TRIG: TriG

@{constants()}

const R_IRIREF_ESCAPELESS = /<([^\\>]*)>\s*/y;
const R_IRIREF = /<([^>]*)>\s*/y;
const R_PREFIXED_NAME = /([^\s#:<\[("'_][^\s#:<\[("']*)?:([^\s#:<\[("'.;,)\]]*)(?:\s+|(?=[:<\[("'.;,)\]#]))/y;

@ // blank node labels have different lookahead characters
@if TTL
	const R_BLANK_NODE_LABEL = /_:([^\s<.;,)\]#]+)(?:\s+|(?=[<.;,)\]#]))/y;
@elseif TRIG
	const R_BLANK_NODE_LABEL = /_:([^\s<.;,)\]#}]+)(?:\s+|(?=[<.;,)\]#}]))/y;
@end

const R_STRING_LITERAL_QUOTE = /"((?:[^"\\]|\\.)*)"\s*/y;
const R_STRING_LITERAL_QUOTE_ESCAPELESS = /"([^"\\]*)"\s*/y;
const R_STRING_LITERAL_SINGLE_QUOTE = /'((?:[^'\\]|\\.)*)'\s*/y;
const R_STRING_LITERAL_SINGLE_QUOTE_ESCAPELESS = /'([^'\\]*)'\s*/y;
const R_STRING_LITERAL_LONG_QUOTE = /"""((?:(?:""?)?(?:[^"\\]|\\.))*(?:""?)?)"""\s*/y;
const R_STRING_LITERAL_LONG_SINGLE_QUOTE = /'''((?:(?:''?)?(?:[^'\\]|\\.))*(?:''?)?)'''\s*/y;

const R_NUMERIC_LITERAL = /([+\-]?(?:[0-9]+([.]?[0-9]*)|([.][0-9]+))([eE][+\-]?[0-9]+)?)(?:\s+|(?=\.[^0-9]|[;,)\]]))/y;
const R_BOOLEAN_LITERAL = /(?:(true|TRUE)|false|FALSE)\s*/y;
const R_A = /a(?:\s+|(?=[<\[#]))/y;

const R_DOUBLE_CARET = /\^\^/y;
const R_WS = /\s*/y;
const R_LANGTAG = /@([A-Za-z0-9\-]+)(?:\s+|(?=[.;,\])#]))/y;

const R_PREFIX = /@?prefix\s*([^#:]*):\s*<([^>]+)>\s*\.?\s*/iy;
const R_PREFIX_KEYWORD = /(@?)prefix\s*/iy;
const R_PREFIX_ID = /([^#:]*):\s*/iy;
const R_BASE = /@?base\s*<([^>]+)>\s*\.?\s*/iy;
const R_BASE_KEYWORD = /(@?)base\s*/iy;

const R_COMMENT = /(#[^\n]*\n\s*)+/y;

const R_IRI_ABSOLUTE = /^[A-Za-z][A-Za-z0-9.\-+]*:/;
const R_URI = /^(\/[^?#]+)/;
const R_BASE_IRI = /^((([A-Za-z0-9.\-+]*:\/)?\/[^\/>]*)?(\/(?:[^\/>]*\/)*)?[^>]*)$/;
// /<(								# 1: uri
// 	( 							# 2: root
// 		([A-Za-z0-9.\-+]*:\/)?	# 3: scheme
// 		(?:\/[^\/>]*)?			# [authority]
// 	)?
// 	(							# 4: path
// 		\/(?:[^\/>]*\/)*
// 	)?
// 	[^>]*						# [rest]
// )>/
const R_QUERYSTRING = /(\/[^/?#]*[?#].*)$/;

const R_CHAR_BLANK_NODE = /\[\s*/y;
const R_CHAR_COLLECTION = /\(\s*/y;
const R_CHAR_COMMA = /,\s*/y;
const R_CHAR_SEMI = /;\s*/y;
const R_CHAR_BRA = /\[\s*/y;
const R_CHAR_KET = /\]\s*/y
const R_CHAR_WAX = /\(\s*/y;
const R_CHAR_WANE = /\)\s*/y;

const R_CHAR_STOP = /\.\s*/y;

const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDF_TYPE = P_IRI_RDF+'type';
const P_IRI_RDF_FIRST = P_IRI_RDF+'first';
const P_IRI_RDF_REST = P_IRI_RDF+'rest';
const P_IRI_RDF_NIL = P_IRI_RDF+'nil';

const P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#';
const P_IRI_XSD_BOOLEAN = P_IRI_XSD+'boolean';
const P_IRI_XSD_INTEGER = P_IRI_XSD+'integer';
const P_IRI_XSD_DECIMAL = P_IRI_XSD+'decimal';
const P_IRI_XSD_DOUBLE = P_IRI_XSD+'double';

// queue prefix events instead of emitting them
const F_QUEUE_PREFIX = function(s_prefix_id, p_prefix_iri) {
	this.queue_event.push({
		event: 'restore_prefix',
		args: [s_prefix_id, p_prefix_iri],
	});
};

// instead of putting this in a macro to be unrolled at every IRI resolution,
// ... spare the monstrosity from the source and make it a function
const F_DOT_SEGMENTS = (s_rel_iri) => {
	let m_uri = R_URI.exec(s_rel_iri);
	if(!m_uri) return s_rel_iri;
	s_iri = m_uri[1];

	//
	let m_qs_hash = R_QUERYSTRING.exec(s_iri);
	let s_qs_hash = '';
	if(m_qs_hash) {
		s_qs_hash = m_qs_hash[1];
		s_iri = s_iri.slice(0, -s_qs_hash.length);
	}

	let a_segments = s_iri.split('/');
	let a_output = [];
	let b_empty = true;

	for(let i=0; i<a_segments.length; i++) {
		let s_segment = a_segments[i];
		b_empty = false;

		// up a hierarchical level
		if('..' === s_segment) {
			if(a_output.length > 1) a_output.pop();
		}
		// down a level level
		else if('.' !== s_segment && (s_segment || !i || i === a_segments.length-1)) {
			a_output.push(s_segment);
		}
	}

	return a_output.join('/')+s_qs_hash;
};



@ // make prototype function for each rdf term type
@{term_types()}


function Parser(z_input, h_config) {

	// track index for anonymous blank node labels
	let i_anon = 0;

	// members
	Object.assign(this, {

		// current parser state
		state: this.statement,

		// left-over string from previous data chunk
		pre: '',

		// current @base url
		base_url: '',
		base_url_scheme: '',
		base_url_root: '',
		base_url_path: '',

		// current data
		subject: '',
		predicate: '',
		object: '',
		graph: new DefaultGraph(),

		// events
		data: h_config.data,
		base: h_config.base || false,
		prefix: h_config.prefix || false,

		// for restoring the original event callback when resuming paused stream
		restore_data: h_config.data,
		restore_prefix: h_config.prefix,

		// keep a queue of data events to hold onto until stream resumes (only happens in rare conditions)
		queue_event: [],

		// map of current prefix ids => iris
		prefixes: {},

		// queue of nested subject, predicate, state for blanknodes and collections
		nested: [],

		// hash to keep track of all blank node labels in use
		labels: {},

		// finds the next non-conflicting blank node label
		next_label() {
			let s_label = '';
			do {
				s_label = 'g'+(i_anon++);
			} while(this.labels[s_label]);

			// claim this label, and remember that we invented it
			this.labels[s_label] = 2;

			// return the label
			return s_label;
		},

		// what to do when reach eos
		eos: false,

		// which state to go to after end of statement
		after_end_of_statement: this.post_object,

		// maximum length of a token: defaults to 2048 => http://stackoverflow.com/a/417184/1641160
		max_token_length: h_config.max_token_length || 2048,

		// maximum length of a string (overrides max_token_length): defaults to 64 kibibytes
		max_string_length: h_config.max_string_length || 65536,

		// spare polluting primary `this` hash lookup for low-frequency calls
		defer: {

			@ // error handling
			@{this_defer_errors()}

			// a resume-only state to handle eos interupting ';'
			post_pair: () => {
				let x = this.s[this.i];
				if(']' === x) {
					@{whitespace('this.i+1')}
				}

				// resume at pairs state
				this.pairs();
			},
		},
	});

	// end of file
	const eof = (b_no_callback) => {
		// invalid parsing state
		if(this.statement !== this.state) {
			return this.defer.parse_error(this.state.name);
		}
		// there are still unparsed characters
		else if(this.i < this.n) {
			// consume whitespace and comments
			let s = this.s;
			let i = this.i;
			@{whitespace('i', true)}
			R_COMMENT.lastIndex = i;
			R_COMMENT.exec(s);
			this.i = i = R_COMMENT.lastIndex;

			// still unparsed characters
			if(i < this.n) {
				// throw parse error
				return this.defer.parse_error(this.state.name);
			}
		}

		// our duty to notify listener
		if(1 !== b_no_callback) {
			// call end event listener
			if(h_config.end) {
				h_config.end(this.prefixes);
			}
			// otherwise log a warning
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
			this.data_event = this.data = (h_statement) => {
				// synchronously transform data
				h_config.data(h_statement, a_buffer);
			};
		}

		// once there's no more data to consume, invoke eof
		d_transform._flush = (f_done) => {
			// now that stream has ended, clean up remainder
			eof(1);

			@ // empty buffer
			@{write_buffer()}

			// call end event listener
			if(h_config.end) {
				h_config.end(this.prefixes);
			}

			// close stream
			f_done();
		};

		// on data event
		d_transform._transform = (s_chunk, s_encoding, f_okay_chunk) => {
			// concatenate current chunk to previous chunk
			this.s = this.pre + s_chunk;

			// cache chunk length
			this.n = this.s.length;

			// consume whitespace (and incidentally reset chunk index)
			let s = this.s;
			@{whitespace('0')}

			// begin
			this.state();

			@ // write buffer to output
			@{write_buffer()}

			// done transforming this chunk
			f_okay_chunk();
		};

		@ // if consumer wants to pause
		@{mk_pause('d_transform')}

		@ // if consumer ready to resume
		@{mk_resume('d_transform', true)}

		// public operator
		this.operator = d_transform;
	}
	// stream
	else if(z_input.setEncoding) {
		// set encoding on stream
		z_input.setEncoding('utf8');

		// once stream closes, invoke eof
		z_input.on('end', eof);

		// begin
		z_input.on('data', (s_chunk) => {
			// concatenate current chunk to previous chunk
			this.s = this.pre + s_chunk;

			// cache chunk length
			this.n = this.s.length;

			// consume whitespace (and incidentally reset chunk index)
			let s = this.s;
			@{whitespace('0')}

			// begin
			this.state();
		});

		@ // if consumer wants to pause
		@{mk_pause('z_input')}

		@ // if consumer ready to resume
		@{mk_resume('z_input')}		
	}
	// string
	else if('string' === typeof z_input) {
		// concatenate previous chunk
		this.s = z_input;

		// eos means we've reached eof
		this.eos = eof;

		// compute chunk length
		this.n = this.s.length;

		// reset index
		this.i = 0;

		// consume whitespace
		let s = this.s;
		@{whitespace('0')}

		@ // if consumer wants to pause
		@{mk_pause()}

		@ // if consumer ready to resume
		@{mk_resume()}		

		// begin
		this.state();
	}
}

Object.assign(Parser.prototype, {

	@ // regexes are faster than character[0] switching in this context
	@{method('statement')}

		// iriref
		@{if_match('R_IRIREF_ESCAPELESS', 'm_iriref_e_subject')}
			@{iriref('subject', 'm_iriref_e_subject', true)}

			// predicate-object pairs state
			@{continue('pairs')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_subject')}
			@{valid_prefix('m_prefixed_named_subject')}

			// make subject key
			this.subject = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_subject[2]);

			// predicate-object pairs state
			@{continue('pairs')}

		// blank node label
		@{else_if_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_subject')}
			// extract label
			let s_label = m_blank_node_label_subject[1];

			@ // ensure there are no conflicting blank node labels
			@{no_label_conflict()}

			// make subject key
			this.subject = new BlankNode(s_label);

			// predicate-object pairs state
			@{continue('pairs')}

		// blank node property list
		@{else_if_match('R_CHAR_BLANK_NODE')}
			// enter blank node
			this.subject = new BlankNode(this.next_label());

			// how to resume when we pop state
			@{push_state('pairs')}

			// goto pairs state for inside property list
			@{continue('pairs')}

		// rdf collection
		@{else_if_match('R_CHAR_COLLECTION')}
			// indicate that collection subject should emit an initial statement
			this.subject = null;
			
			// (don't push state, we don't have a subject yet)

			// goto collection-subject state
			@{continue('collection_subject')}

		// prefix with interupt (e.g., a comment)
		@{else_if_match('R_PREFIX_KEYWORD', 'm_prefix_keyword')}
			// save whether or not to expect a full stop
			this.defer.expect_full_stop = m_prefix_keyword[1]? true: false;

			// goto prefix state
			@{continue('prefix_id')}

		// base with interupt (e.g., a comment)
		@{else_if_match('R_BASE_KEYWORD', 'm_base_keyword')}
			// save whether or not to expect a full stop
			this.defer.expect_full_stop = m_base_keyword[1]? true: false;

			// goto base state
			@{continue('base_iri')}

		// iriref
		@{else_if_match('R_IRIREF', 'm_iriref_subject')}
			@{iriref('subject', 'm_iriref_subject', true, false, true)}

			// predicate-object pairs state
			@{continue('pairs')}

		// comment
		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not blank node label, not prefix id, not base
		@{else_retry()}

	@{end_method('statement')}


	@{method('pairs')}
		// benchmarks indicate: regex for end of blank node property list faster than ch

		// iriref
		@{if_match('R_IRIREF_ESCAPELESS', 'm_iriref_e_predicate')}
			@{iriref('predicate', 'm_iriref_e_predicate', true)}

			// object-list state
			@{continue('object_list')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_predicate')}
			@{valid_prefix('m_prefixed_named_predicate')}

			// make predicate key
			this.predicate = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_predicate[2]);

			// object-list state
			@{continue('object_list')}

		// 'a'
		@{else_if_match('R_A')}
			// make predicate key
			this.predicate = new NamedNode(P_IRI_RDF_TYPE);

			// object-list state
			@{continue('object_list')}

		// ']' end of blank node property list
		@{else_if_match('R_CHAR_KET')}
			@{pop_state()}

		// iriref
		@{else_if_match('R_IRIREF', 'm_iriref_predicate')}
			@{iriref('predicate', 'm_iriref_predicate', true, false, true)}

			// object-list state
			@{continue('object_list')}

		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not 'a'
		@{else_retry()}

	@{end_method('pairs')}


	@{method('object_list')}
		// ref char
		let x = s[i];

		// iriref
		@{if_match('R_IRIREF_ESCAPELESS', 'm_iriref_e_object')}
			@{iriref('object', 'm_iriref_e_object', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_object')}
			@{valid_prefix('m_prefixed_named_object')}

			// commit object iri from resolve prefixed name
			this.object = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_object[2]);

		// string literal
		@{else_if_char('"', "'")}
			@{continue('string_literal')}

		// numeric literal
		@{else_if_match('R_NUMERIC_LITERAL', 'm_numeric_literal')}
			@{numeric_literal()}

		// boolean literal
		@{else_if_match('R_BOOLEAN_LITERAL', 'm_boolean_literal')}
			@{boolean_literal()}

		// blank node property list
		@{else_if_char('[')}
			// advance index to next token
			@{whitespace('i+1')}

			// make object
			let s_label = this.next_label();
			this.object = new BlankNode(s_label);

			// emit statement event
			@{emit_statement()}

			// push state to stack
			@{push_state('post_object')}

			// set new subject
			this.subject = new BlankNode(s_label);

			// goto parsing pairs state
			@{continue('pairs')}

		// labeled blank node
		@{else_if_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_object')}
			// ref blank node label
			let s_label = m_blank_node_label_object[1];

			@ // ensure there are no conflicting blank node labels
			@{no_label_conflict()}

			// make object
			this.object = new BlankNode(s_label);

		// collection
		@{else_if_char('(')}
			// advance index to next token
			@{whitespace('i+1')}

			// state to resume after collection ends
			@{push_state('post_object')}

			// goto collection-object state
			@{continue('collection_object')}

		// iriref
		@{else_if_match('R_IRIREF', 'm_iriref_object')}
			@{iriref('object', 'm_iriref_object', true, false, true)}

		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_retry()}

		// fall through for cases that did not change state on their own
		@{end_of_statement()}
	@{end_method('object_list')}


	@{method('string_literal')}
		// we know this is going to be a literal
		let h_literal = this.object = new Literal();

		// ref character
		let x = s[i];

		// string literal quote / string literal long quote
		@{if_char('"')}
			// `"""` string literal long quote
			@{if_match('R_STRING_LITERAL_LONG_QUOTE', 'm_string_literal_long_quote')}
				@{set_string_literal('m_string_literal_long_quote', 'long')}

			// `"` string literal quote
			@{else_if_match('R_STRING_LITERAL_QUOTE_ESCAPELESS', 'm_string_literal_quote_escapeless')}
				@{set_string_literal('m_string_literal_quote_escapeless', 'no-escape')}

			// `"` string literal quote
			@{else_if_match('R_STRING_LITERAL_QUOTE', 'm_string_literal_quote')}
				@{set_string_literal('m_string_literal_quote', 'single-dirk')}

			// not string long literal quote, not string literal quote
			@{else_retry()}

		// `'''` string literal long single quote
		@{else_if_match('R_STRING_LITERAL_LONG_SINGLE_QUOTE', 'm_string_literal_long_single_quote')}
			@{set_string_literal('m_string_literal_long_single_quote', 'long')}

		// `"` string literal quote
		@{else_if_match('R_STRING_LITERAL_SINGLE_QUOTE_ESCAPELESS', 'm_string_literal_single_quote_escapeless')}
			@{set_string_literal('m_string_literal_single_quote_escapeless', 'no-escape')}

		// `'` string literal single quote
		@{else_if_match('R_STRING_LITERAL_SINGLE_QUOTE', 'm_string_literal_single_quote')}
			@{set_string_literal('m_string_literal_single_quote', 'single-irk')}

		// not string literal long single quote, not string literal single quote
		@{else_retry()}

		// complete literal
		@{continue('datatype_or_langtag')}
	@{end_method('string_literal', 'max_string_length')}


	@{method('datatype_or_langtag')}
		// ref character
		let x = s[i];

		// next token indicates datatype or langtag
		@{if_char('^', '@')}
			// '^^' datatype
			@{if_match('R_DOUBLE_CARET')}
				@{continue('datatype')}

			// '@' language tag
			@{else_if_match('R_LANGTAG', 'm_langtag')}
				// set literal language type
				this.object@{literal_language()} = m_langtag[1].toLowerCase();

			// next token definitely datatype or langtag, we are just being interrupted by eos
			@{else_retry()}

		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not datatype, not language tag => that's okay! those are optional
		@{end_else()}

		// goto end of statement state
		@{end_of_statement()}
	@{end_method('datatype_or_langtag')}


	@{method('datatype')}
		// iriref
		@{if_match('R_IRIREF_ESCAPELESS', 'm_iriref_e_datatype')}
			@{iriref('object["datatype"]', 'm_iriref_e_datatype')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_datatype')}
			@{valid_prefix('m_prefixed_named_datatype')}

			// set literal datatype
			this.object@{literal_datatype()} = this.prefixes[s_prefix_id] + m_prefixed_named_datatype[2];

		// iriref
		@{else_if_match('R_IRIREF', 'm_iriref_datatype')}
			@{iriref('object["datatype"]', 'm_iriref_datatype', false, false, true)}

		// not iriref, not prefixed name
		@{else_retry()}

		// goto end of statement state
		@{end_of_statement()}
	@{end_method('datatype')}


	@{method('post_object')}
		// benchmarks confirm: character ref faster than regexes in this context
		let x = s[i];

		// advance index to next token beyond delimiter
		@{whitespace('i+1')}

		// ',' more objects
		@{if_char(',')}
			@{continue('object_list')};

		// ';' more predicate-object pairs
		@{else_if_char(';')}
			// next token is end of blank node property list
			if(']' === s[this.i]) {
				// divert to post-object state
				@{continue('post_object')}
			}
			// eos
			else if(this.i === n) {
				// go to post-pair state
				@{continue('defer.post_pair')}
			}
			@{continue('pairs')}

		// '.' end of statement
		@{else_if_char('.')}
			// assert not nested
			if(this.nested.length) {
				// reset index to that character
				this.i = i;

				// emit parse error
				return this.defer.parse_error('end_of_property_list');
			}
			@{continue('statement')}

		// ']' end of property-object pairs
		@{else_if_char(']')}
			@{pop_state()}

		// ')' end of collection
		@{else_if_char(')')}
			// do something
			throw `end of collection`;

		// comment
		@{else_if_match('R_COMMENT', false, true)}
			// do not change state
			continue;

		// comment interrupted by eos?
		@{else_retry()}

	@{end_method('post_object')}


	@{method('base_iri')}
		// prefix id
		@{if_match('R_IRIREF_ESCAPELESS', 'm_iriref_e_base')}
			@ // set base url
			@{iriref('base_url', 'm_iriref_e_base', false, true)}

			// emit base event
			this.base && this.base(this.base_url);

			@ // handle full stop
			@{full_stop()}

			// goto prefix iri state
			@{continue('statement')}

		// prefix id
		@{else_if_match('R_IRIREF', 'm_iriref_base')}
			@ // set base iri
			@{iriref('base_url', 'm_iriref_base', false, true, true)}

			// emit base event
			this.base && this.base(this.base_url);

			@ // handle full stop
			@{full_stop()}

			// goto prefix iri state
			@{continue('statement')}

		// for poorly-placed comments
		@{else_if_match('R_COMMENT', false, true)}
			// do not change state
			continue;

		@{else_retry()}
	@{end_method('base_iri')}


	@{method('prefix_id')}
		// prefix id
		@{if_match('R_PREFIX_ID', 'm_prefix_id')}
			// set temp prefix id
			this.defer.prefix_id = m_prefix_id[1];

			// goto prefix iri state
			@{continue('prefix_iri')}

		// for poorly-placed comments
		@{else_if_match('R_COMMENT', false, true)}
			// do not change state
			continue;

		@{else_retry()}

	@{end_method('prefix_id')}


	@{method('prefix_iri')}
		// prefix iri
		@{if_match('R_IRIREF_ESCAPELESS', 'm_iriref_e_prefix')}
			@ // set prefix mapping
			@{iriref('prefixes[this.defer.prefix_id]', 'm_iriref_e_prefix')}

			// emit prefix event
			if(this.defer.prefix) {
				let s_prefix_id = this.defer.prefix_id;
				this.defer.prefix(s_prefix_id, this.prefixes[s_prefix_id]);
			}

			@ // handle full stop
			@{full_stop()}

			// goto statement state
			@{continue('statement')}

		// prefix iri
		@{else_if_match('R_IRIREF', 'm_iriref_prefix')}
			@ // set prefix mapping
			@{iriref('prefixes[this.defer.prefix_id]', 'm_iriref_prefix', false, false, true)}

			// emit prefix event
			if(this.defer.prefix) {
				let s_prefix_id = this.defer.prefix_id;
				this.defer.prefix(s_prefix_id, this.prefixes[s_prefix_id]);
			}

			@ // handle full stop
			@{full_stop()}

			// goto statement state
			@{continue('statement')}

		// for poorly-placed comments
		@{else_if_match('R_COMMENT', false, true)}
			// do not change state
			continue;

		@{else_retry()}
	@{end_method('prefix_iri')}


	// in case eos happens twice during prefix / base (extremely unlikely)
	@{method('full_stop')}
		@{if_match('R_CHAR_STOP')}
			// resume statement
			@{continue('statement')}

		// poorly-placed comment
		@{else_if_match('R_COMMENT', false, true)}
			// try again
			continue;
		
		// possibly interrupted by eos
		@{else_retry()}

	@{end_method('full_stop')}


	@{method('collection_subject')}
		// ref char
		let x = s[i];

		// end of collection
		@{if_char(')')}
			@{whitespace('i+1')}

			// no items in collection subject
			if(null === this.subject) {
				// prepare subject
				this.subject = new NamedNode(P_IRI_RDF_NIL);

				// state was never pushed to stack, jump to pairs state
				@{continue('pairs')}
			}
			// otherwise, there must be items in collection

			// commit collection end
			this.object = new NamedNode(P_IRI_RDF_NIL);
			@{emit_statement()}

			// restore state from stack
			@{pop_state()}
		@{end_else()}


		// otherwise, pre-emptively secure the next blank node label
		let s_pointer_label = this.next_label();

		// very first collection object
		if(null === this.subject) {
			// set quasi subject (really for resume state)
			this.subject = new BlankNode(s_pointer_label);
			@{push_state('pairs')}
			// reset subject for later conditional branch
			this.subject = null;
		}

		// iriref
		@{if_match('R_IRIREF_ESCAPELESS', 'm_iriref_e_object', true)}
			@ // commit object iri as is
			@{iriref('object', 'm_iriref_e_object', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_object', true)}
			@{valid_prefix('m_prefixed_named_object')}

			// commit object iri from resolve prefixed name
			this.object = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_object[2]);

		// string literal
		@{else_if_char('"', "'")}
			// first item in list
			if(null === this.subject) {
				this.subject = new BlankNode(s_pointer_label);
				this.predicate = new NamedNode(P_IRI_RDF_FIRST);
			}
			// not first item in list
			else {
				// make nest list item
				this.object = new BlankNode(s_pointer_label);
				@{emit_statement()}

				// setup for object literal
				this.subject = new BlankNode(s_pointer_label);
				this.predicate = new NamedNode(P_IRI_RDF_FIRST);
			}

			// how to resume collection subject state after object literal
			this.after_end_of_statement = function() {
				this.predicate = new NamedNode(P_IRI_RDF_REST);
				this.after_end_of_statement = this.post_object;
				return this.collection_subject();
			};
			@{continue('string_literal')}

		// numeric literal
		@{else_if_match('R_NUMERIC_LITERAL', 'm_numeric_literal', true)}
			@{numeric_literal()}

		// boolean literal
		@{else_if_match('R_BOOLEAN_LITERAL', 'm_boolean_literal', true)}
			// make literal
			this.object = new Literal(m_boolean_literal[1]? true: false);

		// blank node property list
		@{else_if_char('[')}
			// advance index to next token
			@{whitespace('i+1')}

			// this blank node is just the next item in the list
			if(null !== this.subject) {
				this.object = new BlankNode(s_pointer_label);
				@{emit_statement()}
			}

			// subject needs to be set
			this.subject = new BlankNode(s_pointer_label);
			this.predicate = new NamedNode(P_IRI_RDF_FIRST);
			let s_label = this.next_label();
			this.object = new BlankNode(s_label);
			@{emit_statement()}

			// when resume
			this.predicate = new NamedNode(P_IRI_RDF_REST);

			// push state
			@{push_state('collection_subject')}

			// prepare next triple
			this.subject = new BlankNode(s_label);

			// goto parsing pairs state
			@{continue('pairs')}

		// new collection
		@{else_if_char('(')}
			@{whitespace('i+1', true)}

			// commit list item pointer
			this.object = new BlankNode(s_pointer_label);
			@{emit_statement()}

			// add this list as an item to the outer list
			this.subject = new BlankNode(s_pointer_label);
			this.predicate = new NamedNode(P_IRI_RDF_REST);
			@{push_state('collection_object')}

			// prepare next triple
			this.predicate = new NamedNode(P_IRI_RDF_FIRST);

			// flowing
			continue;

		// labeled blank node
		@{else_if_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_object', true)}
			// ref blank node label
			let s_label = m_blank_node_label_object[1];

			@ // ensure there are no conflicting blank node labels
			@{no_label_conflict()}

			// make object
			this.object = new BlankNode(s_label);

		// iriref
		@{else_if_match('R_IRIREF', 'm_iriref_object', true)}
			@ // commit object iri as is
			@{iriref('object', 'm_iriref_object', true, false, true)}

		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_retry()}



		// not the very first item of collection subject
		if(this.subject !== null) {
			// ref object
			let w_object = this.object;

			// create blanknode to embed list
			this.object = new BlankNode(s_pointer_label);

			// emit statement that functions as collection's head "pointer"
			@{emit_statement()}

			// swap back object
			this.object = w_object;
		}

		// emit statement that is item
		this.subject = new BlankNode(s_pointer_label);
		this.predicate = new NamedNode(P_IRI_RDF_FIRST);
		@{emit_statement()}

		// prepare next predicate
		this.predicate = new NamedNode(P_IRI_RDF_REST);

	@{end_method('collection_subject')}



	@{method('collection_object')}

		// ref char
		let x = s[i];

		// end of collection
		@{if_char(')')}
			@{whitespace('i+1')}

			// make & emit collection's tail "pointer"
			this.object = new NamedNode(P_IRI_RDF_NIL);
			@{emit_statement()}

			// restore previous state
			@{pop_state()}
		@{end_else()}


		// otherwise, pre-emptively secure the next blank node label
		let s_pointer_label = this.next_label();

		// iriref
		@{if_match('R_IRIREF_ESCAPELESS', 'm_iriref_e_object', true)}
			// commit object iri as is
			@{iriref('object', 'm_iriref_e_object', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_object', true)}
			@{valid_prefix('m_prefixed_named_object')}

			// commit object iri from resolve prefixed name
			this.object = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_object[2]);

		// string literal
		@{else_if_char('"', "'")}
			// update index before changing states
			this.i = i;

			// create blanknode to embed list
			this.object = new BlankNode(s_pointer_label);

			// emit statement that functions as collection's head "pointer"
			@{emit_statement()}

			// prepare statement that is item
			this.subject = new BlankNode(s_pointer_label);
			this.predicate = new NamedNode(P_IRI_RDF_FIRST);

			this.after_end_of_statement = function() {
				this.predicate = new NamedNode(P_IRI_RDF_REST);
				this.after_end_of_statement = this.post_object;
				return this.collection_object();
			};
			@{continue('string_literal')}

		// numeric literal
		@{else_if_match('R_NUMERIC_LITERAL', 'm_numeric_literal', true)}
			@{numeric_literal()}

		// boolean literal
		@{else_if_match('R_BOOLEAN_LITERAL', 'm_boolean_literal', true)}
			// make literal
			this.object = new Literal(m_boolean_literal[1]? true: false);

		// blank node property list
		@{else_if_char('[')}
			// advance index to next token
			@{whitespace('i+1')}

			// commit head of list pointer
			this.object = new BlankNode(s_pointer_label);
			@{emit_statement()}

			// setup state to resume and push
			this.subject = new BlankNode(s_pointer_label);
			this.predicate = new NamedNode(P_IRI_RDF_REST);
			@{push_state('collection_object')}

			// enter blank node
			this.predicate = new NamedNode(P_IRI_RDF_FIRST);
			let s_label = this.next_label();
			this.object = new BlankNode(s_label);
			@{emit_statement()}

			// prepare next triple
			this.subject = new BlankNode(s_label);
			this.predicate = new NamedNode(P_IRI_RDF_FIRST);

			// goto parsing pairs state
			@{continue('pairs')}

		// new collection
		@{else_if_char('(')}
			@{whitespace('i+1', true)}

			// commit list item pointer
			this.object = new BlankNode(s_pointer_label);
			@{emit_statement()}

			// add this list as an item to the outer list
			this.subject = new BlankNode(s_pointer_label);
			this.predicate = new NamedNode(P_IRI_RDF_REST);
			@{push_state('collection_object')}

			// prepare next triple
			this.predicate = new NamedNode(P_IRI_RDF_FIRST);

			// flowing
			continue;

		// labeled blank node
		@{else_if_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_object', true)}
			// ref blank node label
			let s_label = m_blank_node_label_object[1];

			@ // ensure there are no conflicting blank node labels
			@{no_label_conflict()}

			// make object
			this.object = new BlankNode(s_label);

		// iriref
		@{else_if_match('R_IRIREF', 'm_iriref_object', true)}
			// commit object iri as is
			@{iriref('object', 'm_iriref_object', true, false, true)}

		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_retry()}


		// ref object
		let w_object = this.object;

		// create blanknode to embed list
		this.object = new BlankNode(s_pointer_label);

		// emit statement that functions as collection's head "pointer"
		@{emit_statement()}

		// emit statement that is item
		this.subject = new BlankNode(s_pointer_label);
		this.predicate = new NamedNode(P_IRI_RDF_FIRST);
		this.object = w_object;
		@{emit_statement()}

		// prepare next predicate
		this.predicate = new NamedNode(P_IRI_RDF_REST);

	@{end_method('collection_object')}

});

@{export_module()}
