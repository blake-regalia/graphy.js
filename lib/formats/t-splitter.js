/* eslint-disable */

@ // import parser macros
@include 'textual-parser-macros.jmacs'

@ // possible mode types for this file are:
@ // TTL: Turtle
@ // TRIG: TriG

const EventEmitter = require('events');
const split_tracker = require('../parsing/split-tracker.js');

@{constants()}

const R_IRIREF_ESCAPELESS = /<([^\\>]*)>\s*/y;
const R_IRIREF = /<([^>]*)>\s*/y;
const R_PREFIXED_NAME_ESCAPELESS = /([^#:<\[("'_][^\s#:<\[("']*)?:([^\s#<\[("'.;,)\]\\]*)(?:\s+|(?=[<\[("';,)\]#]))/y;
// const R_PREFIXED_NAME_ESCAPELESS_WITH_STOPS = /([^#:<\[("'_][^\s#:<\[("']*)?:((?:[^\s#<\[("'.;,)\]\\]*[^\s#<\[("';,)\]\\])?)(?:\s+|(?=[<\[("'.;,)\]#]))/y;
const R_PREFIXED_NAME = 					/([^\s#:<\[("'_][^\s#:<\[("']*)?:((?:(?:[^\s#<\[("';,)\]\\]|\\.)*[^\s#<\[("'.;,)\]\\])?)(?:\.?\s+|(?=[<\[("';,)\]#]))/y;
const R_PREFIXED_NAME_EOF = 				/([^\s#:<\[("'_][^\s#:<\[("']*)?:((?:(?:[^\s#<\[("';,)\]\\]|\\.)*[^\s#<\[("'.;,)\]\\])?)(?:\.?(\s+|$)|(?=[<\[("';,)\]#]))/y;
const R_PN_LOCAL_ESCAPES = /\\(.)/g;

@ // blank node labels have different lookahead characters
@if TTL
	const R_BLANK_NODE_LABEL = /_:(.(?:[^\s:<;,)\]#]*[^\s:<.;,)\]#])?)(?:\s+|(?=[<;,)\]#]))/y;
@elseif TRIG
	const R_BLANK_NODE_LABEL = /_:(.(?:[^\s:<;,)\]#}]*[^\s:<;,)\]#}])?)(?:\s+|(?=[<;,)\]#}]))/y;
@end

const R_STRING_LITERAL_QUOTE = /"((?:[^"\\]|\\.)*)"\s*/y;
const R_STRING_LITERAL_QUOTE_ESCAPELESS = /"([^"\\]*)"\s*/y;
const R_STRING_LITERAL_SINGLE_QUOTE = /'((?:[^'\\]|\\.)*)'\s*/y;
const R_STRING_LITERAL_SINGLE_QUOTE_ESCAPELESS = /'([^'\\]*)'\s*/y;
const R_STRING_LITERAL_LONG_QUOTE = /"""((?:(?:""?)?(?:[^"\\]|\\.))*(?:""?)?)"""\s*/y;
const R_STRING_LITERAL_LONG_SINGLE_QUOTE = /'''((?:(?:''?)?(?:[^'\\]|\\.))*(?:''?)?)'''\s*/y;

const R_NUMERIC_LITERAL = /([+\-]?(?:[0-9]+([.]?[0-9]*)|([.][0-9]+))([eE][+\-]?[0-9]+)?)(?:\s+|(?=\.[^0-9]|[;,)\]]))/y;
const R_BOOLEAN_LITERAL = /(?:true|TRUE|false|FALSE)\s*/y;
const R_A = /a(?:\s+|(?=[<\[#]))/y;

const R_DOUBLE_CARET = /\^\^/y;
const R_WS = /\s*/y;
const R_LANGTAG = /@([A-Za-z0-9\-]+)(?:\s+|(?=[.;,\])#]))/y;

const R_PREFIX = /@?prefix\s*([^#:]*):\s*<([^>]+)>\s*\.?\s*/iy;
const R_PREFIX_KEYWORD = /(@?)prefix\s*/iy;
const R_PREFIX_ID = /([^#:]*):\s*/iy;
const R_BASE = /@?base\s*<([^>]+)>\s*\.?\s*/iy;
const R_BASE_KEYWORD = /(@?)base\s*/iy;

@if TRIG
	const R_GRAPH_IRI_ESCAPELESS = /(?:graph)?\s*<([^\\>]*)>\s*\{\s*/y;
	const R_GRAPH_PREFIXED_NAME = /(?:graph)?\s*([^\s:_][^\s:]*)?:([^\s\{]*)\s*\{\s*/y;
	const R_GRAPH_LABELED_BLANK_NODE = /(?:graph)?\s*_:([^\s{#]+)\s*\{\s*/y;
	const R_GRAPH_ANONYMOUS_BLANK_NODE = /(?:graph)?\s*\[\]\s*\{\s*/y;
	const R_GRAPH_IRI = /(?:graph)?\s*<([^>]*)>\s*\{\s*/y;
@end

const R_COMMENT = /(#[^\n]*\n\s*)+/y;

const R_IRI_ABSOLUTE = /^[A-Za-z][A-Za-z0-9.\-+]*:/;
const R_URI = /^(\/[^?#]+#?)/;
const R_BASE_IRI = /^((([A-Za-z0-9.\-+]*:\/)?\/[^\/>]*)?(\/(?:[^\/>]*\/)*)?[^>]*)$/;
@ // /<(								# 1: uri
@ // 	( 							# 2: root
@ // 		([A-Za-z0-9.\-+]*:\/)?	# 3: scheme
@ // 		(?:\/[^\/>]*)?			# [authority]
@ // 	)?
@ // 	(							# 4: path
@ // 		\/(?:[^\/>]*\/)*
@ // 	)?
@ // 	[^>]*						# [rest]
@ // )>/
const R_QUERYSTRING = /(\/[^/?#]*[?#].*)$/;

const R_ANONYMOUS_BLANK_NODE = /\[\]\s*/y;
const R_CHAR_BLANK_NODE = /\[(?:\s+|(?=[<:#]))/y;
const R_CHAR_COLLECTION = /\(\s*/y;

@if NEEDED
	const R_CHAR_COMMA = /,\s*/y;
	const R_CHAR_SEMI = /;\s*/y;
	const R_CHAR_BRA = /\[\s*/y;
	const R_CHAR_WAX = /\(\s*/y;
	const R_CHAR_WANE = /\)\s*/y;
@end

const R_CHAR_KET = /\]\s*/y

@if TRIG
	const R_CHAR_OPEN = /\{\s*/y;
	const R_CHAR_CLOSE = /\}\s*/y;
@end

const R_CHAR_STOP = /\.\s*/y;

const H_SPECIAL_ESCAPES = {
	'\t': '\\t',
	'\u0008': '\\b',
	'\n': '\\n',
	'\r': '\\r',
	'\f': '\\f',
	'"': '\\"',
};

@ // will only be used by TriG
@macro emit_graph_open()
	this.graph_open && this.graph_open(this.graph);
@end

@ // will only be used by TriG
@macro emit_graph_close()
	this.graph_close && this.graph_close(this.graph);
@end


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
	let s_iri = m_uri[1];

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



@if TTL
	@set STARTING_STATE 'statement'
@elseif TRIG
	@set STARTING_STATE 'block'
@end

function Parser(z_input, h_config={}) {
	// track index for anonymous blank node labels
	let i_anon = h_config.blank_node_offset || 0;

	// members
	Object.assign(this, {
		// current parser state
		state: this.@{STARTING_STATE},

		// how many characters have been read
		offset: 0,

		// left-over string from previous data chunk
		pre: '',

		// current @base url
		base_url: '',
		base_url_scheme: '',
		base_url_root: '',
		base_url_path: '',

		// events
		ready: h_config.ready || false,
		base: h_config.base || false,
		prefix: h_config.prefix || false,
		@if TRIG
			graph_open: h_config.graph_open || false,
			graph_close: h_config.graph_close || false,
		@end

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

		//
		blank_node_index() {
			return i_anon;
		},

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

		@ // error handling
		@{this_defer_errors()}
	});


	// readable stream must emit byte count
	if(z_input.setEncoding) {
		if(!z_input.emitsByteCounts) {
			throw new Error('in order to use split tracking, readable stream must be able to emit byte counts alongside utf-8 encoded data chunks');
		}
	}
	// not supported
	else {
		throw new Error('split tracking is not (yet) supported for non readable streams');
	}

	// make split tracker
	let {
		targets: a_targets,
		fragment: fk_fragment,
	} = h_config;
	let k_split_tracker = this.split_tracker = new split_tracker(a_targets, fk_fragment);

	// end of file
	const eof = (b_no_callback) => {
		// invalid parsing state
		if(this.@{STARTING_STATE} !== this.state) {
			// possible ambiguous ending of prefixed name
			if(this.datatype === this.state || this.object_list === this.state) {
				// test special EOF prefixed name token
				let s = this.s;
				let i = this.i;

				@{if_match('R_PREFIXED_NAME_EOF', 'm_prefixed_name_eof')}
					@ // @{valid_prefix('m_prefixed_named_e_object')}

					return this.after_end_of_statement;
				@{end_else()}
			}
			return this.parse_error(this.state.name);
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
				return this.parse_error(this.state.name);
			}
		}

		// make buffer's alloc eligible for gc
		this.s = null;

		// final progress update
		if(h_config.progress) {
			// no additional bytes were read
			h_config.progress(0);
		}

		// our duty to notify listener
		if(1 !== b_no_callback) {
			this.operator.emit('end');
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

		// user wants to be notified when input is readable
		if(this.ready) {
			// notify once and never again
			d_transform.once('pipe', () => {
				this.ready();
			});
		}

		// once there's no more data to consume, invoke eof
		d_transform._flush = (f_done) => {
			// now that stream has ended, clean up remainder
			eof(1);

			@ // empty buffer
			@{write_buffer()}

			// call end event listener
			if(h_config.end) {
				h_config.end(d_transform, this.prefixes);
			}

			// close write stream (EOF-signaling)
			d_transform.push(null);

			// close read stream
			f_done();
		};

		// on data event
		d_transform._transform = (s_chunk, s_encoding, f_okay_chunk) => {
			// concatenate current chunk to previous chunk
			let s = this.s = this.pre + s_chunk;

			// cache chunk length
			this.n = s.length;

			// consume whitespace (and incidentally reset chunk index)
			@{whitespace('0')}

			// begin
			this.state();

			@ // write buffer to output
			@{write_buffer()}

			// user wants progress updates
			if(h_config.progress) h_config.progress(s_chunk.length);

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

		// when chunk processing ends, compute last terminal byte offset
		this.eos = function() {
			if(h_config.eos) h_config.eos(z_input);
			k_split_tracker.eos(this.s);
		};

		// once stream closes, notify split tracker too
		z_input.on('end', () => {
			k_split_tracker.eof();
			eof();
		});

		// begin
		z_input.on('data', (s_chunk, at_chunk) => {
			// user wants to be notified when input is readable
			if(this.ready) {
				this.ready();

				// do not notify again
				this.ready = false;
			}

			// concatenate current chunk to previous chunk
			let s = this.s = this.pre + s_chunk;

			// cache chunk length
			let n = this.n = s.length;

			// notify split tracker of upcoming byte-count/string-length
			k_split_tracker.upcoming(s_chunk, at_chunk, this.pre.length, {
				base: {
					url: this.base_url,
					scheme: this.base_url_scheme,
					root: this.base_url_root,
					path: this.base_url_path,
				},
				prefixes: Object.assign({}, this.prefixes),
				labels: Object.assign({}, this.labels),
				blank_node_index: this.blank_node_index(),
			});

			// consume whitespace (and incidentally reset chunk index)
			@{whitespace('0')}

			// begin parsing, keep applying until no more stack bail-outs
			let f_sync = this.state();
			while('function' === typeof f_sync) {
				f_sync = f_sync.apply(this);
			}

			// user wants progress updates
			if(h_config.progress) h_config.progress(s_chunk.length);
		});

		@ // make stream controls
		@{stream_control('z_input')}

		// event emitter
		this.operator = new EventEmitter();
		this.emit = this.operator.emit.bind(this);
	}
	// string
	else if('string' === typeof z_input) {
		// concatenate previous chunk
		let s = this.s = z_input;

		// eos means we've reached eof
		if(h_config.async) {
			this.eos = function() {
				setTimeout(eof);
			}
		}
		else {
			this.eos = eof;
		}

		// event emitter
		this.operator = new EventEmitter();
		this.emit = this.operator.emit.bind(this);

		// compute chunk length
		this.n = s.length;

		// reset index
		this.i = 0;

		// consume whitespace
		@{whitespace('0')}

		@ // emulate stream controls
		@{stream_control()}

		// user wants to be notified when input is readable
		if(h_config.ready) h_config.ready();

		// begin
		this.state();
	}
}

Object.assign(Parser.prototype, {

	// a resume-only state to handle eos interupting ';'
	post_pair() {
		let s = this.s;
		let x = s[this.i];
		if('.' === x || ']' === x) {
			@{whitespace('this.i+1')}
		}
		@{goto('pairs')}
	},

	// after a blank node subject (either property-list or colleciton)
	post_blank_subject() {
		let s = this.s;
		if('.' === s[this.i]) {
			@{whitespace('this.i+1')}
			@{goto('statement')}
		}
		@{goto('pairs')}
	},

	@ // regexes are faster than character[0] switching in this context
	@{method('statement')}

		// iriref
		@{if_test('R_IRIREF_ESCAPELESS')}
			// predicate-object pairs state
			@{goto('pairs')}

		@ // sub-macro for reusing statement productions
		@macro triples(directives)

			// prefixed name
			@{else_if_match('R_PREFIXED_NAME_ESCAPELESS', 'm_prefixed_named_e_subject')}
				@ // @{valid_prefix('m_prefixed_named_e_subject')}

				// predicate-object pairs state
				@{goto('pairs')}

			// blank node label
			@{else_if_test('R_BLANK_NODE_LABEL')}
				// predicate-object pairs state
				@{goto('pairs')}

			// anonymous blank node subject
			@{else_if_test('R_ANONYMOUS_BLANK_NODE')}
				// goto pairs state for inside property list
				@{goto('pairs')}

			// anonymous blank node property list subject
			@{else_if_test('R_CHAR_BLANK_NODE')}
				// how to resume when we pop state
				@{push_nest('post_blank_subject')}

				// goto pairs state for inside property list
				@{goto('pairs')}

			// rdf collection
			@{else_if_test('R_CHAR_COLLECTION')}
				// (don't push state, we don't have a subject yet)

				// goto collection-subject state
				@{goto('collection_subject')}

			@if TTL || directives
				// prefix with interupt (e.g., a comment)
				@{else_if_match('R_PREFIX_KEYWORD', 'm_prefix_keyword')}
					// save whether or not to expect a full stop
					this.expect_full_stop = m_prefix_keyword[1]? true: false;

					// goto prefix state
					@{goto('prefix_id')}

				// base with interupt (e.g., a comment)
				@{else_if_match('R_BASE_KEYWORD', 'm_base_keyword')}
					// save whether or not to expect a full stop
					this.expect_full_stop = m_base_keyword[1]? true: false;

					// goto base state
					@{goto('base_iri')}
			@end

			@if TRIG && !directives
				// closing graph '}'
				@{else_if_test('R_CHAR_CLOSE')}
					// emit graph_close event
					@{emit_graph_close()}

					// goto block state
					@{goto('block')}
			@end

			// iriref
			@{else_if_test('R_IRIREF')}
				// predicate-object pairs state
				@{goto('pairs')}

			// prefixed name
			@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_subject')}
				@ // @{valid_prefix('m_prefixed_named_subject')}

				// predicate-object pairs state
				@{goto('pairs')}
		@end

		@{triples()}

		@ // for trig only
		@if TRIG
			@{else_if_test('R_CHAR_CLOSE')}
				@{goto('block')}
		@end

		// comment
		@{else_if_test('R_COMMENT', true)}
			continue;

		// not iriref, not prefixed name, not blank node label, not prefix id, not base
		@{else_retry()}

	@{end_method('statement')}


	@if TRIG
		@{method('block')}

			@{if_test('R_GRAPH_IRI_ESCAPELESS')}
				@{emit_graph_open()}

				// statement state
				@{goto('statement')}

			@{else_if_match('R_GRAPH_PREFIXED_NAME', 'm_graph_prefixed_name')}
				@ // @{valid_prefix('m_graph_prefixed_name')}

				@{emit_graph_open()}

				// statement state
				@{goto('statement')}

			@{else_if_test('R_CHAR_OPEN')}
				@{emit_graph_open()}

				// goto statement state
				@{goto('statement')}

			@{else_if_test('R_GRAPH_ANONYMOUS_BLANK_NODE')}
				@{emit_graph_open()}

				// statement state
				@{goto('statement')}

			@{else_if_test('R_GRAPH_LABELED_BLANK_NODE')}
				@{emit_graph_open()}

				// statement state
				@{goto('statement')}

			// iriref
			@{else_if_test('R_IRIREF_ESCAPELESS')}
				// predicate-object pairs state
				@{goto('pairs')}

			@ // try triples productions
			@{triples(true)}

			@ // then try other graph keywords
			@{else_if_test('R_GRAPH_IRI')}
				@{emit_graph_open()}

				// statement state
				@{goto('statement')}

			// comment
			@{else_if_test('R_COMMENT', true)}
				continue;

			// not iriref, not prefixed name, not blank node label, not prefix id, not base
			@{else_retry()}

		@{end_method('block')}
	@end


	@{method('pairs')}
		// benchmarks indicate: regex for end of blank node property list faster than ch

		// iriref
		@{if_test('R_IRIREF_ESCAPELESS')}
			// object-list state
			@{goto('object_list')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME_ESCAPELESS', 'm_prefixed_named_e_predicate')}
			@ // @{valid_prefix('m_prefixed_named_e_predicate')}

			// object-list state
			@{goto('object_list')}

		// 'a'
		@{else_if_test('R_A')}
			// object-list state
			@{goto('object_list')}

		// ']' end of blank node property list
		@{else_if_test('R_CHAR_KET')}
			@{pop_nest()}

		// iriref
		@{else_if_test('R_IRIREF')}
			// object-list state
			@{goto('object_list')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_predicate')}
			@ // @{valid_prefix('m_prefixed_named_predicate')}

			// object-list state
			@{goto('object_list')}


		@{else_if_test('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not 'a'
		@{else_retry()}

	@{end_method('pairs')}


	@{method('object_list')}
		// ref char
		let x = s[i];

		// iriref
		@{if_test('R_IRIREF_ESCAPELESS')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME_ESCAPELESS', 'm_prefixed_named_e_object')}
			@ // @{valid_prefix('m_prefixed_named_e_object')}

		// string literal
		@{else_if_char('"', "'")}
			@{goto('string_literal')}

		// numeric literal
		@{else_if_test('R_NUMERIC_LITERAL')}

		// boolean literal
		@{else_if_test('R_BOOLEAN_LITERAL')}

		// blank node property list
		@{else_if_char('[')}
			// advance index to next token
			@{whitespace('i+1')}

			// push state to stack
			@{push_nest('post_object')}

			// goto parsing pairs state
			@{goto('pairs')}

		// labeled blank node
		@{else_if_test('R_BLANK_NODE_LABEL')}

		// collection
		@{else_if_char('(')}
			// advance index to next token
			@{whitespace('i+1')}

			// state to resume after collection ends
			@{push_nest('post_object')}

			// goto collection-object state
			@{goto('collection_object')}

		// iriref
		@{else_if_test('R_IRIREF')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_object')}
			@ // @{valid_prefix('m_prefixed_named_object')}

		@{else_if_test('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_retry()}

		// fall through for cases that did not change state on their own
		return this.after_end_of_statement;
	@{end_method('object_list')}


	@{method('string_literal')}
		// ref character
		let x = s[i];

		// string literal quote / string literal long quote
		@{if_char('"')}
			// `"""` string literal long quote
			@{if_test('R_STRING_LITERAL_LONG_QUOTE')}

			// `"` string literal quote
			@{else_if_test('R_STRING_LITERAL_QUOTE_ESCAPELESS')}

			// `"` string literal quote
			@{else_if_test('R_STRING_LITERAL_QUOTE')}

			// not string long literal quote, not string literal quote
			@{else_retry()}

		// `'''` string literal long single quote
		@{else_if_test('R_STRING_LITERAL_LONG_SINGLE_QUOTE')}

		// `"` string literal quote
		@{else_if_test('R_STRING_LITERAL_SINGLE_QUOTE_ESCAPELESS')}

		// `'` string literal single quote
		@{else_if_test('R_STRING_LITERAL_SINGLE_QUOTE')}

		// not string literal long single quote, not string literal single quote
		@{else_retry()}

		// complete literal
		@{goto('datatype_or_langtag')}
	@{end_method('string_literal', 'max_string_length')}


	@{method('datatype_or_langtag')}
		// ref character
		let x = s[i];

		// next token indicates datatype or langtag
		@{if_char('^', '@')}
			// '^^' datatype
			@{if_test('R_DOUBLE_CARET')}
				@{goto('datatype')}

			// '@' language tag
			@{else_if_test('R_LANGTAG')}

			// next token definitely datatype or langtag, we are just being interrupted by eos
			@{else_retry()}

		@{else_if_test('R_COMMENT', true)}
			continue;

		// not datatype, not language tag => that's okay! those are optional
		@{end_else()}

		// goto end of statement state
		return this.after_end_of_statement;
	@{end_method('datatype_or_langtag')}


	@{method('datatype')}
		// iriref
		@{if_test('R_IRIREF_ESCAPELESS')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME_ESCAPELESS', 'm_prefixed_named_e_datatype')}
			@ // @{valid_prefix('m_prefixed_named_e_datatype')}

		// iriref
		@{else_if_test('R_IRIREF')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_datatype')}
			@ // @{valid_prefix('m_prefixed_named_datatype')}

		// not iriref, not prefixed name
		@{else_retry()}

		// goto end of statement state
		return this.after_end_of_statement;
	@{end_method('datatype')}


	@{method('post_object')}
		// benchmarks confirm: character ref faster than regexes in this context
		let x = s[i];

		// advance index to next token beyond delimiter
		@{whitespace('i+1')}

		// ',' more objects
		@{if_char(',')}
			@{goto('object_list')};

		// ';' more predicate-object pairs
		@{else_if_char(';')}
			// next token is end of statement or end of blank node property list
			let x1 = s[this.i];
			if('.' === x1 || ']' === x1 || ';' === x1) {
				// goto post-object state
				@{goto('post_object')}
			}
			// eos
			else if(this.i === n) {
				// go to post-pair state
				@{goto('post_pair')}
			}
			@{goto('pairs')}

		// '.' end of statement
		@{else_if_char('.')}
			// assert not nested
			if(this.nested.length) {
				// reset index to that character
				this.i = i;

				// emit parse error
				return this.parse_error('end_of_property_list');
			}
			@if TTL
				// split tracking; mark character position after full-stop char
				if(this.split_tracker) this.split_tracker.terminal(i+1);
				@{goto(STARTING_STATE)}
			@else
				return (H_DEFAULT_GRAPH === this.graph)? this.@{STARTING_STATE}(): this.statement();
			@end

		// ']' end of property-object pairs
		@{else_if_char(']')}
			@{pop_nest()}

		// ')' end of collection
		@{else_if_char(')')}
			// do something
			throw `end of collection`;

		// comment
		@{else_if_test('R_COMMENT', false, true)}
			// do not change state
			continue;

		// comment interrupted by eos?
		@{else_retry()}

	@{end_method('post_object')}


	@{method('base_iri')}
		// prefix id
		@{if_test('R_IRIREF_ESCAPELESS')}
			@ // handle full stop
			@{full_stop()}

			// goto prefix iri state
			@{goto(STARTING_STATE)}

		// prefix id
		@{else_if_test('R_IRIREF')}
			@ // handle full stop
			@{full_stop()}

			// goto prefix iri state
			@{goto(STARTING_STATE)}

		// for poorly-placed comments
		@{else_if_test('R_COMMENT', true)}
			// do not change state
			continue;

		@{else_retry()}
	@{end_method('base_iri')}


	@{method('prefix_id')}
		// prefix id
		@{if_match('R_PREFIX_ID', 'm_prefix_id')}
			// set temp prefix id
			this.temp_prefix_id = m_prefix_id[1];

			// goto prefix iri state
			@{goto('prefix_iri')}

		// for poorly-placed comments
		@{else_if_test('R_COMMENT', true)}
			// do not change state
			continue;

		@{else_retry()}

	@{end_method('prefix_id')}


	@{method('prefix_iri')}
		let h_prefixes = this.prefixes;
		let s_prefix_id = this.temp_prefix_id;
		let p_prefix_iri;

		// prefix iri
		@{if_match('R_IRIREF_ESCAPELESS', 'm_iriref_e_prefix')}
			@ // set prefix mapping
			@{iriref('p_prefix_iri', 'm_iriref_e_prefix', false, false, false, true)}

			// existing mapping
			if(s_prefix_id in h_prefixes) {
				// doesn't match existing
				if(p_prefix_iri !== h_prefixes[s_prefix_id]) {
					// emit change event
					if(this.prefix_change) {
						this.prefix_change(s_prefix_id, h_prefixes[s_prefix_id], p_prefix_iri);
					}

					// update prefix
					h_prefixes[s_prefix_id] = p_prefix_iri;
				}
			}
			// first mapping; set prrefix
			else {
				h_prefixes[s_prefix_id] = p_prefix_iri;
			}

			// emit prefix event
			if(this.prefix) {
				this.prefix(s_prefix_id, p_prefix_iri);
			}

			@ // handle full stop
			@{full_stop()}

			// goto statement state
			@{goto(STARTING_STATE)}

		// prefix iri
		@{else_if_match('R_IRIREF', 'm_iriref_prefix')}
			@ // set prefix mapping
			@{iriref('p_prefix_iri', 'm_iriref_prefix', false, false, true, true)}

			// existing mapping
			if(s_prefix_id in h_prefixes) {
				// doesn't match existing
				if(p_prefix_iri !== h_prefixes[s_prefix_id]) {
					// emit change event
					if(this.prefix_change) {
						this.prefix_change(s_prefix_id, h_prefixes[s_prefix_id], p_prefix_iri);
					}

					// update prefix
					h_prefixes[s_prefix_id] = p_prefix_iri;
				}
			}
			// first mapping; set prrefix
			else {
				h_prefixes[s_prefix_id] = p_prefix_iri;
			}

			// emit prefix event
			if(this.prefix) {
				this.prefix(s_prefix_id, p_prefix_iri);
			}

			@ // handle full stop
			@{full_stop()}

			// goto statement state
			@{goto(STARTING_STATE)}

		// for poorly-placed comments
		@{else_if_test('R_COMMENT', true)}
			// do not change state
			continue;

		@{else_retry()}
	@{end_method('prefix_iri')}


	// in case eos happens twice during prefix / base (extremely unlikely)
	@{method('full_stop')}
		@{if_test('R_CHAR_STOP')}
			// resume statement
			@{goto(STARTING_STATE)}

		// poorly-placed comment
		@{else_if_test('R_COMMENT', true)}
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

			// restore state from stack
			@{pop_nest()}
		@{end_else()}


		// iriref
		@{if_test('R_IRIREF_ESCAPELESS', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME_ESCAPELESS', 'm_prefixed_named_e_object', true)}
			@ // @{valid_prefix('m_prefixed_named_e_object')}

		// string literal
		@{else_if_char('"', "'")}
			// how to resume collection subject state after object literal
			this.after_end_of_statement = function() {
				this.after_end_of_statement = this.post_object;
				return this.collection_subject();
			};
			@{goto('string_literal')}

		// numeric literal
		@{else_if_test('R_NUMERIC_LITERAL', true)}

		// boolean literal
		@{else_if_test('R_BOOLEAN_LITERAL', true)}

		// blank node property list
		@{else_if_char('[')}
			// advance index to next token
			@{whitespace('i+1')}

			// push state
			@{push_nest('collection_subject')}

			// goto parsing pairs state
			@{goto('pairs')}

		// new collection
		@{else_if_char('(')}
			@{whitespace('i+1', true)}

			@{push_nest('collection_object')}

			// flowing
			continue;

		// labeled blank node
		@{else_if_test('R_BLANK_NODE_LABEL', true)}

		// iriref
		@{else_if_test('R_IRIREF', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_object', true)}
			@ // @{valid_prefix('m_prefixed_named_object')}

		@{else_if_test('R_COMMENT', true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_retry()}


	@{end_method('collection_subject')}



	@{method('collection_object')}

		// ref char
		let x = s[i];

		// end of collection
		@{if_char(')')}
			@{whitespace('i+1')}

			// restore previous state
			@{pop_nest()}
		@{end_else()}

		// iriref
		@{if_test('R_IRIREF_ESCAPELESS', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME_ESCAPELESS', 'm_prefixed_named_e_object', true)}
			@ // @{valid_prefix('m_prefixed_named_e_object')}

		// string literal
		@{else_if_char('"', "'")}
			// update index before changing states
			this.i = i;

			this.after_end_of_statement = function() {
				this.after_end_of_statement = this.post_object;
				return this.collection_object();
			};
			@{goto('string_literal')}

		// numeric literal
		@{else_if_test('R_NUMERIC_LITERAL', true)}

		// boolean literal
		@{else_if_test('R_BOOLEAN_LITERAL', true)}

		// blank node property list
		@{else_if_char('[')}
			// advance index to next token
			@{whitespace('i+1')}

			@{push_nest('collection_object')}

			// goto parsing pairs state
			@{goto('pairs')}

		// new collection
		@{else_if_char('(')}
			@{whitespace('i+1', true)}

			@{push_nest('collection_object')}

			// flowing
			continue;

		// labeled blank node
		@{else_if_test('R_BLANK_NODE_LABEL', true)}

		// iriref
		@{else_if_test('R_IRIREF', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_object', true)}
			@ // @{valid_prefix('m_prefixed_named_object')}

		@{else_if_test('R_COMMENT', true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_retry()}

	@{end_method('collection_object')}

});

@{export_module()}
