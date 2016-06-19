/* eslint-disable */

@ // import parser macros
@include 'parser-macros.builder-js'

@ // possible mode types for this file are:
@ // TTL: Turtle
@ // TRIG: TriG

@{constants()}

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

const R_NUMERIC_LITERAL = /([+\-]?(?:[0-9]+([.]?[0-9]*)|([.][0-9]+))([eE][+\-]?[0-9]+)?)(?:\s+|(?=[^0-9]))/y;
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

@ // make prototype function for each rdf object term type
@{term_types()}
@ // and add a collection object
@{object_term_type('Collection', 'collection', false, 'Array')}


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

			// current @base iri
			base: '',
			base_scheme: '',
			base_root: '',
			base_path: '',

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
			pause: false,

			// which state to go to after end of triple
			after_end_of_triple: this.post_object,

			// spare polluting primary `this` hash lookup for low-frequency calls
			defer: {
				// `base` statement event
				base: h_events.base || false,

				// `prefix` statement event
				prefix: h_events.prefix || false,

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
		const eof = () => {
			// invalid parsing state
			if(this.statement !== this.resume) {
				this.defer.parse_error(this.resume.name);
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
					this.defer.parse_error(this.resume.name);
				}
			}

			// call event listener
			if(h_events.end) {
				h_events.end();
			}
			// otherwise log a warning
			else {
				console.warn('[graphy] reached end of file, but no `end` event listener to call');
			}
		};


		// stream
		if(ds.setEncoding) {
			// set encoding on stream
			ds.setEncoding('utf8');

			// once stream closes, invoke eof
			ds.on('end', eof);

			// begin
			ds.on('data', (s_in) => {
				// concatenate current chunk to previous chunk
				this.s = this.pre + s_in;

				// cache chunk length
				this.n = this.s.length;

				// consume whitespace (and incidentally reset chunk index)
				let s = this.s;
				@{whitespace('0')}

				// begin
				this.resume();
			});
		}
		// string
		else if('string' === typeof ds) {
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
			@{whitespace('0')}

			// begin
			this.resume();
		}
	}


	@{method('statement')}
		// benchmarks confirm: regexes faster than character ref in this context

		// iriref
		@{if_match('R_IRIREF', 'm_iriref_subject')}
			@{iriref('subject', 'm_iriref_subject')}

			// predicate-object pairs state
			@{continue('pairs')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_subject')}
			@{valid_prefix('m_prefixed_named_subject')}

			// make subject key
			this.subject = this.prefixes[s_prefix_id] + m_prefixed_named_subject[2];

			// predicate-object pairs state
			@{continue('pairs')}

		// blank node label
		@{else_if_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_subject')}
			// extract label
			let s_label = m_blank_node_label_subject[1];

			@ // ensure there are no conflicting blank node labels
			@{no_label_conflict()}

			// make subject key
			this.subject = ' '+s_label;

			// predicate-object pairs state
			@{continue('pairs')}

		// blank node property list
		@{else_if_match('R_CHAR_BLANK_NODE')}
			// enter blank node
			this.subject = ' '+this.next_label();

			// how to resume when we pop state
			@{push_state('pairs')}

			// goto pairs state for inside property list
			@{continue('pairs')}

		// rdf collection
		@{else_if_match('R_CHAR_COLLECTION')}
			// indicate that collection subject should emit an initial triple
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

		// comment
		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not blank node label, not prefix id, not base
		@{else_retry()}

	@{end_method('statement')}


	@{method('pairs')}
		// benchmarks indicate: regex for end of blank node property list faster than ch

		// iriref
		@{if_match('R_IRIREF', 'm_iriref_predicate')}
			@{iriref('predicate', 'm_iriref_predicate')}

			// object-list state
			@{continue('object_list')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_predicate')}
			@{valid_prefix('m_prefixed_named_predicate')}

			// make predicate key
			this.predicate = this.prefixes[s_prefix_id] + m_prefixed_named_predicate[2];

			// object-list state
			@{continue('object_list')}

		// 'a'
		@{else_if_match('R_A')}
			// make predicate key
			this.predicate = P_IRI_RDF_TYPE;

			// object-list state
			@{continue('object_list')}

		// ']' end of blank node property list
		@{else_if_match('R_CHAR_KET')}
			@{pop_state()}

		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not 'a'
		@{else_retry()}

	@{end_method('pairs')}


	@{method('object_list')}
		// ref char
		let x = s[i];

		// iriref
		@{if_match('R_IRIREF', 'm_iriref_object')}
			@{iriref('object', 'm_iriref_object', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_object')}
			@{valid_prefix('m_prefixed_named_object')}

			// commit object iri from resolve prefixed name
			this.object = new Iri(this.prefixes[s_prefix_id] + m_prefixed_named_object[2]);

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
			this.object = new Blanknode(s_label);

			// emit triple event
			@{emit_triple()}

			// push state to stack
			@{push_state('post_object')}

			// set new subject
			this.subject = ' '+s_label;

			// goto parsing pairs state
			@{continue('pairs')}

		// labeled blank node
		@{else_if_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_object')}
			// ref blank node label
			let s_label = m_blank_node_label_object[1];

			@ // ensure there are no conflicting blank node labels
			@{no_label_conflict()}

			// make object
			this.object = new Blanknode(s_label);

		// collection
		@{else_if_char('(')}
			// advance index to next token
			@{whitespace('i+1')}

			// state to resume after collection ends
			@{push_state('post_object')}

			// goto collection-object state
			@{continue('collection_object')}

		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_retry()}

		// fall through for cases that did not change state on their own
		@{end_of_triple()}
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
	@{end_method('string_literal')}


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

		// goto end of triple state
		@{end_of_triple()}
	@{end_method('datatype_or_langtag')}


	@{method('datatype')}
		// iriref
		@{if_match('R_IRIREF', 'm_iriref_datatype')}
			@{iriref('object["datatype"]', 'm_iriref_datatype')}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_datatype')}
			@{valid_prefix('m_prefixed_named_datatype')}

			// set literal datatype
			this.object@{literal_datatype()} = this.prefixes[s_prefix_id] + m_prefixed_named_datatype[2];

		// not iriref, not prefixed name
		@{else_retry()}

		// goto end of triple state
		@{end_of_triple()}
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
		@{if_match('R_IRIREF', 'm_iriref_prefix')}
			@ // set prefix mapping
			@{iriref('prefixes[this.defer.prefix_id]', 'm_iriref_prefix')}

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
				this.subject = P_IRI_RDF_NIL;

				// state was never pushed to stack, jump to pairs state
				@{continue('pairs')}
			}
			// otherwise, there must be items in collection

			// commit collection end
			this.object = new Iri(P_IRI_RDF_NIL);
			@{emit_triple()}

			// restore state from stack
			@{pop_state()}
		@{end_else()}


		// otherwise, pre-emptively secure the next blank node label
		let s_pointer_label = this.next_label();

		// very first collection object
		if(null === this.subject) {
			// set quasi subject (really for resume state)
			this.subject = ' '+s_pointer_label;
			@{push_state('pairs')}
			// reset subject for later conditional branch
			this.subject = null;
		}

		// iriref
		@{if_match('R_IRIREF', 'm_iriref_object', true)}
			@ // commit object iri as is
			@{iriref('object', 'm_iriref_object', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_object', true)}
			@{valid_prefix('m_prefixed_named_object')}

			// commit object iri from resolve prefixed name
			this.object = new Iri(this.prefixes[s_prefix_id] + m_prefixed_named_object[2]);

		// string literal
		@{else_if_char('"', "'")}
			// first item in list
			if(null === this.subject) {
				this.subject = ' '+s_pointer_label;
				this.predicate = P_IRI_RDF_FIRST;
			}
			// not first item in list
			else {
				// make nest list item
				this.object = new Blanknode(s_pointer_label);
				@{emit_triple()}

				// setup for object literal
				this.subject = ' '+s_pointer_label;
				this.predicate = P_IRI_RDF_FIRST;
			}

			// how to resume collection subject state after object literal
			this.after_end_of_triple = function() {
				this.predicate = P_IRI_RDF_REST;
				this.after_end_of_triple = this.post_object;
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
				this.object = new Blanknode(s_pointer_label);
				@{emit_triple()}
			}

			// subject needs to be set
			this.subject = ' '+s_pointer_label;
			this.predicate = P_IRI_RDF_FIRST;
			let s_label = this.next_label();
			this.object = new Blanknode(s_label);
			@{emit_triple()}

			// when resume
			this.predicate = P_IRI_RDF_REST;

			// push state
			@{push_state('collection_subject')}

			// prepare next triple
			this.subject = ' '+s_label;

			// goto parsing pairs state
			@{continue('pairs')}

		// new collection
		@{else_if_char('(')}
			@{whitespace('i+1', true)}

			// commit list item pointer
			this.object = new Blanknode(s_pointer_label);
			@{emit_triple()}

			// add this list as an item to the outer list
			this.subject = ' '+s_pointer_label;
			this.predicate = P_IRI_RDF_REST;
			@{push_state('collection_object')}

			// prepare next triple
			this.predicate = P_IRI_RDF_FIRST;
			continue;

		// labeled blank node
		@{else_if_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_object', true)}
			// ref blank node label
			let s_label = m_blank_node_label_object[1];

			@ // ensure there are no conflicting blank node labels
			@{no_label_conflict()}

			// make object
			this.object = new Blanknode(s_label);

		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_retry()}



		// not the very first item of collection subject
		if(this.subject !== null) {
			// ref object
			let w_object = this.object;

			// create blanknode to embed list
			this.object = new Blanknode(s_pointer_label);

			// emit triple that functions as collection's head "pointer"
			@{emit_triple()}

			// swap back object
			this.object = w_object;
		}

		// emit triple that is item
		this.subject = ' '+s_pointer_label;
		this.predicate = P_IRI_RDF_FIRST;
		@{emit_triple()}

		// prepare next predicate
		this.predicate = P_IRI_RDF_REST;

	@{end_method('collection_subject')}



	@{method('collection_object')}

		// ref char
		let x = s[i];

		// end of collection
		@{if_char(')')}
			@{whitespace('i+1')}

			// make & emit collection's tail "pointer"
			this.object = new Iri(P_IRI_RDF_NIL);
			@{emit_triple()}

			// restore previous state
			@{pop_state()}
		@{end_else()}


		// otherwise, pre-emptively secure the next blank node label
		let s_pointer_label = this.next_label();

		// iriref
		@{if_match('R_IRIREF', 'm_iriref_object', true)}
			// commit object iri as is
			@{iriref('object', 'm_iriref_object', true)}

		// prefixed name
		@{else_if_match('R_PREFIXED_NAME', 'm_prefixed_named_object', true)}
			@{valid_prefix('m_prefixed_named_object')}

			// commit object iri from resolve prefixed name
			this.object = new Iri(this.prefixes[s_prefix_id] + m_prefixed_named_object[2]);

		// string literal
		@{else_if_char('"', "'")}
			// update index before changing states
			this.i = i;

			// create blanknode to embed list
			this.object = new Blanknode(s_pointer_label);

			// emit triple that functions as collection's head "pointer"
			@{emit_triple()}

			// prepare triple that is item
			this.subject = ' '+s_pointer_label;
			this.predicate = P_IRI_RDF_FIRST;

			this.after_end_of_triple = function() {
				this.predicate = P_IRI_RDF_REST;
				this.after_end_of_triple = this.post_object;
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
			this.object = new Blanknode(s_pointer_label);
			@{emit_triple()}

			// setup state to resume and push
			this.subject = ' '+s_pointer_label;
			this.predicate = P_IRI_RDF_REST
			@{push_state('collection_object')}

			// enter blank node
			this.predicate = P_IRI_RDF_FIRST;
			let s_label = this.next_label();
			this.object = new Blanknode(s_label);
			@{emit_triple()}

			// prepare next triple
			this.subject = ' '+s_label;
			this.predicate = P_IRI_RDF_FIRST;

			// goto parsing pairs state
			@{continue('pairs')}

		// new collection
		@{else_if_char('(')}
			@{whitespace('i+1', true)}

			// commit list item pointer
			this.object = new Blanknode(s_pointer_label);
			@{emit_triple()}

			// add this list as an item to the outer list
			this.subject = ' '+s_pointer_label;
			this.predicate = P_IRI_RDF_REST;
			@{push_state('collection_object')}

			// prepare next triple
			// this.subject = s_list_label;
			this.predicate = P_IRI_RDF_FIRST;
			continue;

		// labeled blank node
		@{else_if_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_object', true)}
			// ref blank node label
			let s_label = m_blank_node_label_object[1];

			@ // ensure there are no conflicting blank node labels
			@{no_label_conflict()}

			// make object
			this.object = new Blanknode(s_label);

		@{else_if_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_retry()}


		// ref object
		let w_object = this.object;

		// create blanknode to embed list
		this.object = new Blanknode(s_pointer_label);

		// emit triple that functions as collection's head "pointer"
		@{emit_triple()}

		// emit triple that is item
		this.subject = ' '+s_pointer_label;
		this.predicate = P_IRI_RDF_FIRST;
		this.object = w_object;
		@{emit_triple()}

		// prepare next predicate
		this.predicate = P_IRI_RDF_REST;

	@{end_method('collection_object')}

	@{method('base_iri')}
		// prefix id
		@{if_match('R_IRIREF', 'm_iriref_base')}
			@ // set base iri
			@{iriref('base', 'm_iriref_base', false ,true)}

			// emit base event
			this.defer.base && this.defer.base(this.base);

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
}

@{export_module()}
