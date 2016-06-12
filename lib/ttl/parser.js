/* eslint-disable */
const fs = require('fs');

// regexes
const R_IRIREF = /<([^>]+)>\s*/y;
const R_PREFIXED_NAME = /([^\s#:<\[("'_]*):([^\s#:<\[("'.;,)\]]*)\s*/y;
const R_BLANK_NODE_LABEL = /_:([^\s#<.;,)\]])\s*/y;
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
const R_PREFIX_ID = /@?prefix\s*([^#:]*):\s*<([^>]+)>\s*\.?\s*/iy;
const R_PREFIX_KEYWORD = /@?prefix\s*/iy;
const R_BASE = /@?base\s*<([^>]+)>\s*\.?\s*/iy;
const R_BASE_KEYWORD = /@?base\s*/iy;
const R_COMMENT = /#[^\n]*(?:\n\s*)/y;


@ // change state
@macro continue(method)
	return this.@{method}();
@end


@ // consume whitespace
@macro whitespace(offset)
	R_WS.lastIndex = @{offset};
	R_WS.exec(s);
	this.i = R_WS.lastIndex;
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

	// expected token was not found
	if(0 === i) return this.defer.parse_error('@{mode}');

	// otherwise, save state
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
	if(!s_prefix_id in this.prefixes) return this.error(`no such prefix "${s_prefix_id}"`);
@end


class StreamParser {

	constructor(ds, h_events) {

		// members
		Object.assign(this, {
			resume: this.statement,
			pre: '',
			base: '',
			prefixes: {},
			last: -1,
			pause: () => {},

			// spare the lookup from pollution for low-frequency event callbacks
			defer: {
				base() {},
				prefix() {},
				error(e_parse) {
					throw `parse error: ${e_parse}`;
				},
				eof: h_events.end || (() => {
					console.warn('no eof callback')
				}),
				parse_error: (s_expected) => {
					let i = this.i;
					let s = this.s;
					let i_off = Math.min(i, Math.abs(i-15));
					this.defer.error(`\n\`${s.substr(i_off, i_off+30).replace(/[\n\t]/g, ' ')}\`\n`
						+` ${' '.repeat(i-i_off)}^\n`
						+`expected ${s_expected}.  failed to parse a valid token starting at "${s[i]}"`);
				},

				// in case eos happens twice during prefix / base (extremely unlikely)
				full_stop() {
					if('.' === this.s[this.i]) {
						this.i += 1;
					}

					// no matter, return to statement
					this.statement();
				}
			},
		});

		//
		this.triple = h_events.triple;

		// stream
		if(ds.on) {

			// once stream closes
			ds.on('end', () => {

				// there are unparsed characters
				if(this.i < this.n) {
					console.warn('unparsed characters remain');
					debugger;
					throw 'err';
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
			// make subject key
			this.subject = m_blank_node_label_subject[1];

			// predicate-object pairs state
			@{continue('pairs')}

		// prefix id
		@{else_match('R_PREFIX_ID', 'm_prefix_id', true)}
			// ref prefix id and prefix name
			let s_prefix_id = m_prefix_id[1];
			let s_prefix_iri = m_prefix_id[2];

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
		@{else_match('R_PREFIX_KEYWORD')}
			// goto prefix state
			@{continue('prefix')}

		// base with interupt (e.g., a comment)
		@{else_match('R_BASE_KEYWORD')}
			// goto base state
			@{continue('base')}

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
			this.object = this.base + m_iriref_object[1];

		// prefixed name
		@{else_match('R_PREFIXED_NAME', 'm_prefixed_named_object')}
			@{valid_prefix('m_prefixed_named_object')}

			// commit object iri from resolve prefixed name
			this.object = this.prefixes[m_prefixed_named_object[1]] + m_prefixed_named_object[2];

		// string literal
		@{else_if_char('"', "'")}
			@{continue('string_literal')}

		// numeric literal
		@{else_match('R_NUMERIC_LITERAL', 'm_numeric_literal')}
			// commit literal
			this.object = {$: parseFloat(m_numeric_literal[1])};

		// boolean literal
		@{else_match('R_BOOLEAN_LITERAL', 'm_boolean_literal')}
			// make literal
			this.object = {$: m_boolean_literal[1]? true: false};

		// blank node property list
		@{else_if_char('[')}
			// advance index to next token
			@{whitespace('i+1')}

				@if NETWORK
					// push current pairs hash to list
					this.nested.push([this.pairs, this.objects]);

					// make hash of blanknode (to store predicate-object pairs)
					this.pairs = {
						_: '',
					};

					// push blanknode to object list
					this.objects.push(this.pairs);
				@else
					this.object = {_: ''};
				@end

			// goto parsing pairs state
			@{continue('pairs')}

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list: collection
		@{else_if_char('(')}
			// advance index to next token
			@{whitespace('i+1')}

			@if NETWORK
				// push current objects list to list
				this.nested.push([this.pairs, this.objects]);

				// make list for collection
				let a_collection = [];

				// push collection list to object list
				this.objects.push(a_collection);

				// nest
				this.objects = a_collection;
			@else
				this.object = [];
			@end

			// goto parsing object list state
			@{continue('object_list')}

		@{else_match('R_COMMENT', false, true)}
			continue;

		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
		@{else_resume('object_list')}

		// fall through of all cases
		@{continue('end_of_triple')}
	@{end_method('object_list')}


	end_of_triple() {
		// at this point, a new triple has been parsed
		@if STREAM
			this.triple({
				subject: this.subject,
				predicate: this.predicate,
				object: this.object,
			});
		@end

		// goto parsing post-object delimiter
		this.post_object();
	}


	@{method('string_literal')}

		// we know this is going to be a literal
		let h_literal = this.object = {};

		// ref character
		let x = s[i];

		// string literal quote / string literal long quote
		@{if_char('"')}
			// `"""` string literal long quote
			@{match('R_STRING_LITERAL_LONG_QUOTE', 'm_string_literal_long_quote')}
				// set literal value
				h_literal.$ = m_string_literal_long_quote[1];

			// `"` string literal quote
			@{else_match('R_STRING_LITERAL_QUOTE', 'm_string_literal_quote')}
				// set literal value
				h_literal.$ = m_string_literal_quote[1];

			// not string long literal quote, not string literal quote
			@{else_resume('string_literal')}

		// `'''` string literal long single quote
		@{else_match('R_STRING_LITERAL_LONG_SINGLE_QUOTE', 'm_string_literal_long_single_quote')}
			// set literal value
			h_literal.$ = m_string_literal_long_single_quote[1];

		// `'` string literal single quote
		@{else_match('R_STRING_LITERAL_SINGLE_QUOTE', 'm_string_literal_single_quote')}
			// set literal value
			h_literal.$ = m_string_literal_single_quote[1];

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
				this.object['@'] = m_langtag[1].toLowerCase();

			// next token definitely datatype or langtag, we are just being interrupted by eos
			@{else_resume('datatype_or_langtag')}

		// not datatype, not language tag => that's okay! those are optional
		@{else_nil()}

		// goto end of triple state
		@{continue('end_of_triple')}
	@{end_method('datatype_or_langtag')}


	@{method('datatype')}
		// iriref
		@{match('R_IRIREF', 'm_iriref_datatype')}
			// set literal datatype
			this.object['^'] = this.base + m_iriref_datatype[1];

		// prefixed name
		@{else_match('R_PREFIXED_NAME', 'm_prefixed_named_datatype')}
			@{valid_prefix('m_prefixed_named_datatype')}

			// set literal datatype
			this.object['^'] = this.prefixes[m_prefixed_named_datatype[1]] + m_prefixed_named_datatype[2];

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
			if(']' === x) @{continue('post_object')}
			@{continue('pairs')}

		// '.' end of statement
		@{else_if_char('.')}
			@{continue('statement')}

		// ']' end of property-object pairs
		@{else_if_char(']', ')')}
			// recurse out
			@{continue('post_object')}

		// comment
		@{else_match('R_COMMENT', false, true)}
			// do not change state
			continue;

		} else {
			debugger;
			this.defer.parse_error('post_object');
			// let i_off = Math.max(i, i-10);
			// throw `${s.slice(i_off, i_off+45).replace(/[\t\n]/g, ' ')}\n${' '.repeat(i - i_off)}^\nencountered unexpected character "${x}"`;
		}

		@{end_else()}

	@{end_method('post_object')}


	@{method('prefix_id')}
		// prefix id
		@{match('R_PREFIX_ID', 'm_prefix_id')}
			// set temp prefix id
			this.defer.prefix_id = s_prefix_id;

			// goto prefix iri state
			@{continue('prefix_iri')}

		@{else_resume('prefix_id')}
	@{end_method('prefix_id')}


	@{method('prefix_iri')}
		// prefix iri
		@{match('R_IRIREF', 'm_iriref_prefix', true)}
			// set prefix mapping
			this.prefix[this.defer.prefix_id] = m_iriref_prefix[1];

			// update index since we're using local variable
			this.i = i;

			// consume period delimiter
			if('.' === s[i]) this.i += 1;

			// super inconvenient eos if prefix id/iri is large as buffer
			else if(i === n) {
				@{continue('defer.full_stop')}
			}

			// goto statement state
			@{continue('statement')}

		@{else_resume('prefix_iri')}
	@{end_method('prefix_id')}


	@{method('base_iri')}
		// prefix id
		@{match('R_IRIREF', 'm_iriref_base', true)}
			// set base iri
			this.base = m_iriref_base[1];

			// update index since we're using local variable
			this.i = i;

			// consume period delimiter
			if('.' === s[i]) this.i += 1;

			// super inconvenient eos if base iri is large as buffer
			else if(i === n) {
				@{continue('defer.full_stop')}
			}

			// goto prefix iri state
			@{continue('statement')}

		@{else_resume('base_iri')}
	@{end_method('base_iri')}

}



module.exports = function(ds, h_events) {
	new StreamParser(ds, h_events);
};
