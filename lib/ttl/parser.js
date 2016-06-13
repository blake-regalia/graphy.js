/* eslint-disable */
const fs = require('fs');

// regexes
const R_IRIREF = /<([^>]+)>\s*/y;
const R_PREFIXED_NAME = /([^\s#:<\[("'_]*):([^\s#:<\[("'.;,)\]]*)\s*/y;
const R_BLANK_NODE_LABEL = /_:([^\s#<.;,)\]]+)\s*/y;
const R_STRING_LITERAL_QUOTE = /"((?:[^"\\]|\\.)*)"\s*/y;
const R_STRING_LITERAL_SINGLE_QUOTE = /'((?:[^'\\]|\\.)*)'\s*/y;
const R_STRING_LITERAL_LONG_QUOTE = /"""((?:(?:""?)?(?:[^"\\]))*)"""\s*/y;
const R_STRING_LITERAL_LONG_SINGLE_QUOTE = /'''((?:(?:''?)?(?:[^'\\]))*)'''\s*/y;
const R_NUMERIC_LITERAL = /([+\-]?[0-9.]+(?:[eE][+\-]?[0-9]+)?)\s*/y;
const R_BOOLEAN_LITERAL = /(?:(true|TRUE)|false|FALSE)\s*/y;
const R_A = /a\s*(?:(?=[\s<\[]))/y;
const R_DOUBLE_CARET = /\^\^/y;
const R_WS = /\s*/y;
const R_LANGTAG = /@([A-Za-z0-9\-]+)\s*(?:(?=[.;,\])]))/y;
const R_PREFIX = /@?prefix\s*([^#:]*):\s*<([^>]+)>\s*\.?\s*/iy;
const R_PREFIX_KEYWORD = /(@?)prefix\s*/iy;
const R_PREFIX_ID = /([^#:]*):\s*/iy;
const R_BASE = /@?base\s*<([^>]+)>\s*\.?\s*/iy;
const R_BASE_KEYWORD = /@?base\s*/iy;
const R_COMMENT = /(#[^\n]*\n\s*)+/y;

const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDF_FIRST = P_IRI_RDF+'first';
const P_IRI_RDF_REST = P_IRI_RDF+'rest';
const P_IRI_RDF_NIL = P_IRI_RDF+'nil';

@set KEY_IRI 'iri'
@set KEY_LITERAL_VALUE 'value'
@set KEY_LITERAL_DATATYPE 'datatype'
@set KEY_LITERAL_LANGUAGE 'language'
@set KEY_BLANK_NODE_LABEL 'label'

@macro access(key)
['@{key}']
@end

@macro dot(key)
.@{key}
@end

@macro iri()
@{dot(KEY_IRI)}
@end

@macro literal_value()
@{dot(KEY_LITERAL_VALUE)}
@end

@macro literal_datatype()
@{dot(KEY_LITERAL_DATATYPE)}
@end

@macro literal_language()
@{dot(KEY_LITERAL_LANGUAGE)}
@end

@macro blank_node_label()
@{dot(KEY_BLANK_NODE_LABEL)}
@end

@macro is_iri()
isIri: true
@end

@macro is_literal()
isLiteral: true
@end

@macro is_blank_node()
isBlanknode: true
@end


@ // change state
@macro continue(method)
	return this.@{method}();
@end


@ // consume whitespace
@macro whitespace(offset, local)
	R_WS.lastIndex = @{offset};
	R_WS.exec(s);
	@{!local? 'this.': ''}i = R_WS.lastIndex;
@end


@ // counter how many braces need closing
@set match_counter 0


@ // close all preceeding else branches
@macro end_else()
	@repeat match_counter
		} // @{loop.index}
	@end

	@ // reset match counter
	@set match_counter 0
@end


@ // exec regex and store match
@macro match(regex, match, local)
	@ // count how many else branches we'll need to close
	@set match_counter (match_counter + 0)

	// prepare sticky regex index
	@{regex}.lastIndex = i;

	@ // store the match
	@if match
		// execute regex
		let @{match} = @{regex}.exec(s);

		// regex was a match
		if(@{match}) {
	@ // no need to store the match
	@else
		if(@{regex}.exec(s)) {
	@end

	// advance index
	@{local? '': 'this.'}i = @{regex}.lastIndex;
@end


@ // try next match
@macro else_match(regex, match, local)
	@ // increment number of else branches we'll need to close
	@set match_counter (match_counter + 1)

	@ // when previous match fails
	} else {
		@ // try next match
		@{match(regex, match, local)}
@end


@ // set resume state & stop parsing in this stack
@macro resume(mode)
	// update index value
	this.i = i;

	// not yet eos
	if(this.i < this.n) {
		// expected token was not found
		if(0 === i) return this.defer.parse_error('@{mode}');
	}

	// save state before pausing
	this.resume = this.@{mode};

	// store what is unparsed
	this.pre = s.slice(i);

	// if we're not parsing a stream, then this is an error
	return this.pause();
@end


@ // all matches failed, pause parser
@macro else_resume(mode)
	// match counter: @{match_counter}
	} else {
		@{resume(mode)}
	}

	@ // close all preceeding else branches
	@{end_else()}
@end



@ // test the immediate character
@macro if_char(a, b, c)
	if(`@{a}` === x@{defined(b)?' || `':''}@{defined(b)?b:''}@{defined(b)?'` === x':''}@{defined(c)?' || `':''}@{defined(c)?c:''}@{defined(c)?'` === x':''}) {
@end


@ // else if branching test immediate character
@macro else_if_char(a, b, c)
	@if defined(c)
		} else @{if_char(a, b, c)}
	@elseif defined(b)
		} else @{if_char(a, b)}
	@else
		} else @{if_char(a)}
	@end
@end


@ // semantic label for closing series of else macros
@macro else_nil()
	}
@end


@ // declare a parse state
@macro method(name)
	// parse state for @{name}
	@{name}() {
		// destruct chunk, length, and index
		let {s, n, i} = this;

		// start labeled loop, run while there are characters
		@{name}: while(i < n) {
@end


@ // end parse state method
@macro end_method(name)
		}

		// ran out of characters
		@{resume(name)}
	}
@end


@ // assert the prefix found in prefixed name is valid
@macro valid_prefix(match)
	// check valid prefix
	let s_prefix_id = @{match}[1];

	// invalid prefix
	if(!this.prefixes.hasOwnProperty(s_prefix_id)) return this.defer.error(`no such prefix "${s_prefix_id}"`);
@end


@ //
@macro push_state(state)
	this.nested.push([this.subject, this.predicate, '@{state}']);
@end

@ //
@macro pop_state(state_var)
	let @{state_var};
	[this.subject, this.predicate, @{state_var}] = this.nested.pop();
@end


@ //
@macro no_label_conflict()
	// not first time use of label
	let z_label_state = this.labels[s_label];
	if(z_label_state) {
		// label is fine
		if(1 === z_label_state) {}
		// label is in use by invention
		else if(2 === z_label_state) {
			// create redirect mapping for this actual label & use it
			s_label = this.labels[s_label] = this.next_label();
		}
		// label already has redirect mapping
		else {
			// use redirected label
			s_label = this.labels[s_label];
		}
	}
	// first time use of label
	else {
		// store label in hash so we avoid future collisions
		this.labels[s_label] = 1;
	}
@end


@ // 
@macro full_stop()
	// consume all comments
	while('#' === s[i]) {
		R_COMMENT.lastIndex = i;
		R_COMMENT.exec(this.s);
		i = R_COMMENT.lastIndex;
	}

	// consume period delimiter
	if('.' === s[i]) {
		// then all whitespace
		@{whitespace('i+1')}

		// and we're done!
	}
	// super inconvenient eos if prefix id/iri is large as buffer
	else if(i === n) {
		// update index since we're using local variable
		this.i = i;

		@{continue('defer.full_stop')}
	}
	// otherwise, update index since we're using local variable
	else {
		this.i = i;
	}
@end


@ // creates a class for the given term type of an rdf object
@macro object_term_type(proper, casual, set, inherit)
function @{proper}
@if set
(s_@{set}) {
	this.@{set} = s_@{set};
@else
() {
@end
}
@if inherit
@{proper}.prototype = Object.create(@{inherit}.prototype);
@end
@{proper}.prototype.is = Object.assign(function() {
	return '@{casual}';
}, {
	@{casual}: true,
});
@end


@ // create a class for each of the term types that the object of a triple can be
@{object_term_type('Iri', 'iri', KEY_IRI)}
@{object_term_type('Literal', 'literal', KEY_LITERAL_VALUE)}
@{object_term_type('Blanknode', 'blanknode', KEY_BLANK_NODE_LABEL)}
@{object_term_type('Collection', 'collection', false, 'Array')}



class StreamParser {

	constructor(ds, h_events) {

		// emit triple event for single subject
		const triple_iri_subject = function() {
			h_events.triple({
				subject: this.subject,
				predicate: this.predicate,
				object: this.object,
			});
		};

		//
		let n_label_index = 0;

		// members
		Object.assign(this, {

			//
			triple_iri_subject: triple_iri_subject,

			// triple event
			triple: triple_iri_subject,

			// current parser state
			resume: this.statement,

			// left-over string from previous data chunk
			pre: '',

			// current @base iri
			base: '',

			// map of current prefix ids => iris
			prefixes: {},

			// queue of nested subject, predicate, state for blanknodes and collections
			nested: [],

			// what to do when reach eos
			pause: () => {},

			// which state to go to after end of triple
			after_end_of_triple: this.post_object,

			// hash to keep track of all blank node labels in use
			labels: {},

			// finds the next non-conflicting blank node label
			next_label() {
				let s_label = '';
				do {
					s_label = 'g'+(n_label_index++);
				} while(this.labels[s_label]);

				// claim this label, and remember that we invented it
				this.labels[s_label] = 2;

				// return the label
				return s_label;
			},

			// spare polluting primary `this` hash lookup for low-frequency calls
			defer: {

				// `base` statement event
				base() {},

				// `prefix` statement event
				prefix() {},

				// error event
				error(e_parse) {
					throw `parse error: ${e_parse}`;
				},

				// eof event
				eof: h_events.end || (() => {
					console.warn('no eof callback');
				}),

				// parse_error (not meant to be an event callback)
				parse_error: (s_expected) => {
					let i = this.i;
					let s = this.s;
					let i_off = Math.min(i, Math.abs(i-15));
					this.defer.error(`\n\`${s.substr(i_off, i_off+30).replace(/[\n\t]/g, ' ')}\`\n`
						+` ${' '.repeat(i-i_off)}^\n`
						+`expected ${s_expected}.  failed to parse a valid token starting at "${s[i]}"`);
				},

				// in case eos happens twice during prefix / base (extremely unlikely)
				full_stop: () => {
					let x = this.s[this.i];
					if('.' === x) {
						this.i += 1;
						@{whitespace('this.i')}
					}
					// poorly-placed comment
					else if('#' === x) {
						@{whitespace('this.i')}

						// try again
						this.defer.full_stop();
					}

					// no matter, return to statement
					this.statement();
				},

				// a resume-only state to handle eos interupting ';'
				post_pair: () => {
					let x = this.s[this.i];
					if(']' === x) {
						this.i += 1;
						@{whitespace('this.i')}
					}

					// resume at pairs state
					this.pairs();
				},
			},
		});

		// stream
		if(ds.on) {

			// once stream closes
			ds.on('end', () => {
				
				// there are still unparsed characters
				if(this.i < this.n) {

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
					if(i < this.n) {
						// throw parse error
						this.defer.parse_error(this.resume.name);
					}
				}

				// call eof listener
				this.defer.eof();
			});

			// begin
			ds.on('data', (s_in) => {

				// concatenate previous chunk
				this.s = this.pre + s_in;

				// compute chunk length
				this.n = this.s.length;

				// reset index
				this.i = 0;

				// consume whitespace
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
			this.pause = function() {

				// characters remain
				if(this.pre.length) {
					this.defer.parse_error(this.resume.name);
				}

				// eof
				this.defer.eof('end');
			};

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
		let x = s[i];

		// iriref
		@{match('R_IRIREF', 'm_iriref_subject')}
			// make subject key
			this.subject = this.base + m_iriref_subject[1];

			// predicate-object pairs state
			@{continue('pairs')}

		// prefixed name
		@{else_match('R_PREFIXED_NAME', 'm_prefixed_named_subject')}
			@{valid_prefix('m_prefixed_named_subject')}

			// make subject key
			this.subject = this.prefixes[s_prefix_id] + m_prefixed_named_subject[2];

			// predicate-object pairs state
			@{continue('pairs')}

		// blank node label
		@{else_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_subject')}
			// ref label
			let s_label = m_blank_node_label_subject[1];

			@{no_label_conflict()}

			// make subject key
			this.subject = ' '+s_label;

			// predicate-object pairs state
			@{continue('pairs')}

		// rdf collection
		@{else_if_char('(')}
			@{whitespace('i+1')}
			throw `collection subject`;

			// goto collection-subject state
			@{continue('collection_subject')}

		// prefix id
		@{else_match('R_PREFIX', 'm_prefix', true)}
			// ref prefix id and prefix name
			let s_prefix_id = m_prefix[1];
			let s_prefix_iri = m_prefix[2];

			// set mapping prefix id => iri
			this.prefixes[s_prefix_id] = s_prefix_iri;

			// callback
			this.defer.prefix(s_prefix_id, s_prefix_iri);

			continue;

		// base
		@{else_match('R_BASE', 'm_base', true)} 
			// set base iri
			this.base = m_base[1];

			// callback
			this.defer.base(m_base[1]);

			continue;

		// comment
		@{else_match('R_COMMENT', false, true)}
			continue;

		// prefix with interupt (e.g., a comment)
		@{else_match('R_PREFIX_KEYWORD', 'm_prefix_keyword')}
			// save whether or not to expect a full stop
			this.defer.expect_full_stop = m_prefix_keyword[1]? true: false;

			// goto prefix state
			@{continue('prefix_id')}

		// base with interupt (e.g., a comment)
		@{else_match('R_BASE_KEYWORD', 'm_base_keyword')}
			// save whether or not to expect a full stop
			this.defer.expect_full_stop = m_base_keyword[1]? true: false;

			// goto base state
			@{continue('base_iri')}

		// not iriref, not prefixed name, not blank node label, not prefix id, not base
		@{else_resume('statement')}

	@{end_method('statement')}


	@{method('pairs')}
		// iriref
		@{match('R_IRIREF', 'm_iriref_predicate')}
			// make predicate key
			this.predicate = this.base + m_iriref_predicate[1];

			// object-list state
			@{continue('object_list')}

		// prefixed name
		@{else_match('R_PREFIXED_NAME', 'm_prefixed_named_predicate')}
			@{valid_prefix('m_prefixed_named_predicate')}

			// make predicate key
			this.predicate = this.prefixes[m_prefixed_named_predicate[1]] + m_prefixed_named_predicate[2];

			// object-list state
			@{continue('object_list')}

		// 'a'
		@{else_match('R_A')}
			// make predicate key
			this.predicate = 'a';

			// object-list state
			@{continue('object_list')}

		@{else_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not 'a'
		@{else_resume('pairs')}

	@{end_method('pairs')}


	@{method('object_list')}
		// ref char
		let x = s[i];

		// iriref
		@{match('R_IRIREF', 'm_iriref_object')}
			// commit object iri as is
			this.object = new Iri(this.base + m_iriref_object[1]);

		// prefixed name
		@{else_match('R_PREFIXED_NAME', 'm_prefixed_named_object')}
			@{valid_prefix('m_prefixed_named_object')}

			// commit object iri from resolve prefixed name
			this.object = new Iri(this.prefixes[m_prefixed_named_object[1]] + m_prefixed_named_object[2]);

		// string literal
		@{else_if_char('"', "'")}
			@{continue('string_literal')}

		// numeric literal
		@{else_match('R_NUMERIC_LITERAL', 'm_numeric_literal')}
			// commit literal
			this.object = new Literal(parseFloat(m_numeric_literal[1]));

		// boolean literal
		@{else_match('R_BOOLEAN_LITERAL', 'm_boolean_literal')}
			// make literal
			this.object = new Literal(m_boolean_literal[1]? true: false);

		// blank node property list
		@{else_if_char('[')}
			// advance index to next token
			@{whitespace('i+1')}

			// make object
			let s_label = this.next_label();
			this.object = new Blanknode(s_label);

			// emit triple event
			this.triple();

			@{push_state('object_list')}

			// set new subject
			this.subject = ' '+s_label;

			// goto parsing pairs state
			@{continue('pairs')}

		// collection
		@{else_if_char('(')}
			// advance index to next token
			@{whitespace('i+1')}

			@{push_state('object_list')}

			// goto collection-object state
			@{continue('collection_object')}

			// // make list's blank node object
			// let s_label = this.next_label();
			// this.object = new Blanknode(s_label);

			// // emit triple event
			// this.triple();

			// // what to do after committing an object inside collection
			// this.after_end_of_triple = function() {
			// 	// shift first/rest
			// 	this.predicate = P_IRI_RDF_REST;
			// 	let s_label = this.next_label();
			// 	this.object = new Blanknode(s_label);
			// 	this.triple();

			// 	return this.object_list();
			// };

			// //
			// this.triple = function() {

			// };

			// // push old subject/predicate pair
			// this.nested.push([this.subject, this.predicate]);

			// // set new subject
			// this.subject = ' '+s_label;

		// labeled blank node
		@{else_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_object')}
			// ref blank node label
			let s_label = m_blank_node_label_object[1];

			@{no_label_conflict()}

			// make object
			this.object = new Blanknode(s_label);

		@{else_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_resume('object_list')}

		// fall through for cases that did not change state on their own
		@{continue('end_of_triple')}
	@{end_method('object_list')}


	end_of_triple() {
		// at this point, a new triple has been parsed
		@if STREAM
			this.triple();
		@end

		// goto next parsing state
		this.after_end_of_triple();
	}


	@{method('string_literal')}

		// we know this is going to be a literal
		let h_literal = this.object = new Literal();

		// ref character
		let x = s[i];

		// string literal quote / string literal long quote
		@{if_char('"')}
			// `"""` string literal long quote
			@{match('R_STRING_LITERAL_LONG_QUOTE', 'm_string_literal_long_quote')}
				// set literal value
				h_literal@{literal_value()} = m_string_literal_long_quote[1];

			// `"` string literal quote
			@{else_match('R_STRING_LITERAL_QUOTE', 'm_string_literal_quote')}
				// set literal value
				h_literal@{literal_value()} = m_string_literal_quote[1];

			// not string long literal quote, not string literal quote
			@{else_resume('string_literal')}

		// `'''` string literal long single quote
		@{else_match('R_STRING_LITERAL_LONG_SINGLE_QUOTE', 'm_string_literal_long_single_quote')}
			// set literal value
			h_literal@{literal_value()} = m_string_literal_long_single_quote[1];

		// `'` string literal single quote
		@{else_match('R_STRING_LITERAL_SINGLE_QUOTE', 'm_string_literal_single_quote')}
			// set literal value
			h_literal@{literal_value()} = m_string_literal_single_quote[1];

		// not string literal long single quote, not string literal single quote
		@{else_resume('string_literal')}

		// complete literal
		@{continue('datatype_or_langtag')}
	@{end_method('string_literal')}


	@{method('datatype_or_langtag')}
		// ref character
		let x = s[i];

		// next token indicates datatype or langtag
		@{if_char('^', '@')}
			// '^^' datatype
			@{match('R_DOUBLE_CARET')}
				@{continue('datatype')}

			// '@' language tag
			@{else_match('R_LANGTAG', 'm_langtag')}
				// set literal language type
				this.object@{literal_language()} = m_langtag[1].toLowerCase();

			// next token definitely datatype or langtag, we are just being interrupted by eos
			@{else_resume('datatype_or_langtag')}

		@{else_match('R_COMMENT', false, true)}
			continue;

		@{end_else()}

		// not datatype, not language tag => that's okay! those are optional
		@{else_nil()}

		// goto end of triple state
		@{continue('end_of_triple')}
	@{end_method('datatype_or_langtag')}


	@{method('datatype')}
		// iriref
		@{match('R_IRIREF', 'm_iriref_datatype')}
			// set literal datatype
			this.object@{literal_datatype()} = this.base + m_iriref_datatype[1];

		// prefixed name
		@{else_match('R_PREFIXED_NAME', 'm_prefixed_named_datatype')}
			@{valid_prefix('m_prefixed_named_datatype')}

			// set literal datatype
			this.object@{literal_datatype()} = this.prefixes[m_prefixed_named_datatype[1]] + m_prefixed_named_datatype[2];

		// not iriref, not prefixed name
		@{else_resume('datatype')}

		// goto end of triple state
		@{continue('end_of_triple')}
	@{end_method('datatype')}


	@{method('post_object')}
		// ref delimiter
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
			@{continue('statement')}

		// ']' end of property-object pairs
		@{else_if_char(']')}
			@{pop_state('s_resume_state')}
			return this[s_resume_state]();

		// ')' end of collection
		@{else_if_char(')')}
			// do something
			throw `end of collection`;

		// comment
		@{else_match('R_COMMENT', false, true)}
			// do not change state
			continue;

		} else {
			debugger;
			this.defer.parse_error('post_object');
		}

		@{end_else()}

	@{end_method('post_object')}


	@{method('prefix_id')}
		// prefix id
		@{match('R_PREFIX_ID', 'm_prefix_id')}
			// set temp prefix id
			this.defer.prefix_id = m_prefix_id[1];

			// goto prefix iri state
			@{continue('prefix_iri')}

		// for poorly-placed comments
		@{else_match('R_COMMENT', false, true)}
			// do not change state
			continue;

		@{else_resume('prefix_id')}
	@{end_method('prefix_id')}


	@{method('prefix_iri')}
		// prefix iri
		@{match('R_IRIREF', 'm_iriref_prefix', true)}
			// set prefix mapping
			this.prefixes[this.defer.prefix_id] = m_iriref_prefix[1];

			@ // handle full stop
			@{full_stop()}

			// goto statement state
			@{continue('statement')}

		// for poorly-placed comments
		@{else_match('R_COMMENT', false, true)}
			// do not change state
			continue;

		@{else_resume('prefix_iri')}
	@{end_method('prefix_id')}


	@{method('base_iri')}
		// prefix id
		@{match('R_IRIREF', 'm_iriref_base', true)}
			// set base iri
			this.base = m_iriref_base[1];

			@ // handle full stop
			@{full_stop()}

			// goto prefix iri state
			@{continue('statement')}

		// for poorly-placed comments
		@{else_match('R_COMMENT', false, true)}
			// do not change state
			continue;

		@{else_resume('base_iri')}
	@{end_method('base_iri')}


	@{method('collection_subject')}

	@{end_method('collection_subject')}


	@{method('collection_object')}
		// pre-emptively secure next blank node label
		let s_pointer_label = this.next_label();

		// ref char
		let x = s[i];

		// iriref
		@{match('R_IRIREF', 'm_iriref_object', true)}
			// commit object iri as is
			this.object = new Iri(this.base + m_iriref_object[1]);

		// prefixed name
		@{else_match('R_PREFIXED_NAME', 'm_prefixed_named_object', true)}
			@{valid_prefix('m_prefixed_named_object')}

			// commit object iri from resolve prefixed name
			this.object = new Iri(this.prefixes[m_prefixed_named_object[1]] + m_prefixed_named_object[2]);

		// string literal
		@{else_if_char('"', "'")}
			@{continue('string_literal')}

		// numeric literal
		@{else_match('R_NUMERIC_LITERAL', 'm_numeric_literal', true)}
			// commit literal
			this.object = new Literal(parseFloat(m_numeric_literal[1]));

		// boolean literal
		@{else_match('R_BOOLEAN_LITERAL', 'm_boolean_literal', true)}
			// make literal
			this.object = new Literal(m_boolean_literal[1]? true: false);

		// blank node property list
		@{else_if_char('[')}
			// advance index to next token
			@{whitespace('i+1')}

			// make object
			let s_label = this.next_label();
			this.object = new Blanknode(s_label);

			// emit triple event
			this.triple();

			@{push_state('collection_object')}

			// set new subject
			this.subject = ' '+s_label;

			// goto parsing pairs state
			@{continue('pairs')}

		// new collection
		@{else_if_char('(')}
			@{whitespace('i+1', true)}

			// commit list item pointer
			this.object = new Blanknode(s_pointer_label);
			this.triple();

			// push state
			@{push_state('collection_object')}

			// add this list as an item to the outer list
			this.subject = ' '+s_pointer_label;
			this.predicate = P_IRI_RDF_FIRST;

			let s_list_label = this.next_label();
			this.object = new Blanknode(s_list_label);
			this.triple();

			// prepare next predicate
			this.predicate = P_IRI_RDF_REST;
			continue;

		// end of collection
		@{else_if_char(')')}
			@{whitespace('i+1')}

			// make & emit collection's tail "pointer"
			this.object = new Iri(P_IRI_RDF_NIL);
			this.triple();

			// restore previous state
			@{pop_state('s_resume_state')}
			return this[s_resume_state]();

		// labeled blank node
		@{else_match('R_BLANK_NODE_LABEL', 'm_blank_node_label_object', true)}
			// ref blank node label
			let s_label = m_blank_node_label_object[1];

			debugger;

			@{no_label_conflict()}

			// make object
			this.object = new Blanknode(s_label);

		@{else_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_resume('collection_object')}


		// ref object
		let w_object = this.object;

		// create blanknode to embed list
		this.object = new Blanknode(s_pointer_label);

		// emit triple that functions as collection's head "pointer"
		this.triple();

		// emit triple that is item
		this.subject = ' '+s_pointer_label;
		this.predicate = P_IRI_RDF_FIRST;
		this.object = w_object;
		this.triple();

		// prepare next predicate
		this.predicate = P_IRI_RDF_REST;

	@{end_method('collection_object')}

}



module.exports = function(ds, h_events) {
	new StreamParser(ds, h_events);
};
