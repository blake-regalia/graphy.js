/* eslint-disable */
const fs = require('fs');

// regexes
const R_IRIREF = /<([^>]+)>\s*/y;
const R_PREFIXED_NAME = /([^\s:\[(]]*):([^\s;.,<)\]]*)\s*/y;
const R_BLANK_NODE_LABEL = /_:([^\s;.,<)\]])\s*/y;
const R_STRING_LITERAL_QUOTE = /"((?:[^"\\]|\\.)*)"\s*/y;
const R_STRING_LITERAL_SINGLE_QUOTE = /'((?:[^'\\]|\\.)*)'\s*/y;
const R_STRING_LITERAL_LONG_QUOTE = /"""((?:(?:""?)?(?:[^"\\]))*)"""\s*/y;
const R_STRING_LITERAL_LONG_SINGLE_QUOTE = /'''((?:(?:''?)?(?:[^'\\]))*)'''\s*/y;
const R_NUMERIC_LITERAL = /([+\-]?[0-9.]+(?:[eE][+\-]?[0-9]+)?)\s*/y;
const R_BOOLEAN_LITERAL = /(?:(true|TRUE)|false|FALSE)\s*/y;
const R_A = /a(?=[\s<\[])\s*/y;
const R_WS = /\s*/y;
const R_LANGTAG = /@([A-Za-z0-9\-]+)\s*/y;
const R_PREFIX_ID = /@?prefix\s*([^:]*):\s*<([^>]+)>\s*\.?\s*/y;
const R_BASE = /@?base\\s*<([^>]+)>\s*\.?\s*/y;


//
@macro else_invalid(expected)
	else {
		@if STREAM
			s_pre = s.slice(i);
			return;
			if(s_pre.length > 255) {
				throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
					\nexpected @{expected}, instead found character "${s[i]}" @${i}`;
			}
			console.log(`pausing at "${s_pre}"`);
		@else
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected @{expected}, instead found character "${s[i]}" @${i}`;
		@end
	}
@end


// exec regex and store match
@macro match(regex, match)
	@{regex}.lastIndex = i;
	let @{match} = @{regex}.exec(s);
	if(@{match})
@end


// update index from regex last index
@macro update(regex)
	i = @{regex}.lastIndex;
@end


// consume whitespace
@macro whitespace(offset)
	R_WS.lastIndex = @{offset};
	R_WS.exec(s);
	i = R_WS.lastIndex;
@end


//
@macro literal(match)
	// make literal
	let h_literal = {};
	a_objects.push(h_literal);

	// set literal value
	h_literal.$ = @{match}[1];

@end


//
@macro datatype_or_langtag()
	// '^' datatype
	if('^' === s[i]) {
		// skip '^^'
		i += 2;

		// iriref
		@{match('R_IRIREF', 'm_iriref_datatype')} {
			@{update('R_IRIREF')}

			// set literal datatype
			h_literal['^'] = s_base+m_iriref_datatype[1];
		}
		// not iriref
		else {
			@{match('R_PREFIXED_NAME', 'm_prefixed_named_datatype')} {
				@{update('R_PREFIXED_NAME')}

				// set literal datatype
				h_literal['^'] = h_prefix[m_prefixed_named_datatype[1]]+m_prefixed_named_datatype[2];
			}
			// not iriref, not prefixed name
			@{else_invalid('object datatype iri')}
		}
	}
	// '@' language tag
	else if('@' === s[i]) {
		// langtag
		@{match('R_LANGTAG', 'm_langtag')} {
			@{update('R_LANGTAG')}

			// set literal language type
			h_literal['@'] = m_langtag[1];
		}
		// not langtag
		@{else_invalid('object language tag')}
	}
	// not datatype, not language tag => that's okay! those are optional
@end


//
@macro object_list()
	//
	let a_objects = h_pairs[s_predicate] = h_pairs[s_predicate] || [];

	//
	object_list:
	while(i < n) {

		// iriref
		@{match('R_IRIREF', 'm_iriref_object')} {
			@{update('R_IRIREF')}

			// append object iri as is
			a_objects.push(s_base+m_iriref_object[1]);
		}
		// not iriref
		else {
			// prefixed name
			@{match('R_PREFIXED_NAME', 'm_prefixed_named_object')} {
				@{update('R_PREFIXED_NAME')}

				// append object iri from resolve prefixed name
				a_objects.push(h_prefix[m_prefixed_named_object[1]]+m_prefixed_named_object[2]);
			}
			// not iriref, not prefixed name: string literal
			else if(`"` === s[i] || `'` === s[i]) {
				// make literal
				let h_literal = {};
				a_objects.push(h_literal);

				// string literal quote / string literal long quote
				if(`"` === s[i]) {
					// `"""` string literal long quote
					@{match('R_STRING_LITERAL_LONG_QUOTE', 'm_string_literal_long_quote')} {
						@{update('R_STRING_LITERAL_LONG_QUOTE')}

						// set literal value
						h_literal.$ = m_string_literal_long_quote[1];
					}
					// not string literal long quote
					else {
						// `"` string literal quote
						@{match('R_STRING_LITERAL_QUOTE', 'm_string_literal_quote')} {
							@{update('R_STRING_LITERAL_QUOTE')}

							// set literal value
							h_literal.$ = m_string_literal_quote[1];
						}
						// not string long literal quote, not string literal quote
						@{else_invalid('string literal quote')}
					}
				}
				// not string literal long quote, not string literal quote
				else {
					// `'''` string literal long single quote
					@{match('R_STRING_LITERAL_LONG_SINGLE_QUOTE', 'm_string_literal_long_single_quote')} {
						@{update('R_STRING_LITERAL_LONG_SINGLE_QUOTE')}

						// set literal value
						h_literal.$ = m_string_literal_long_single_quote[1];
					}
					// not string literal long single quote
					else {
						// `'` string literal single quote
						@{match('R_STRING_LITERAL_SINGLE_QUOTE', 'm_string_literal_single_quote')} {
							@{update('R_STRING_LITERAL_SINGLE_QUOTE')}

							// set literal value
							h_literal.$ = m_string_literal_single_quote[1];
						}
						// not string literal long single quote, not string literal single quote
						@{else_invalid('string literal single quote')}
					}
				}

				// complete literal
				@{datatype_or_langtag()}
			}
			// not iriref, not prefixed name, not string literal
			else {
				// numeric literal
				@{match('R_NUMERIC_LITERAL', 'm_numeric_literal')} {
					@{update('R_NUMERIC_LITERAL')}

					// make literal
					a_objects.push({
						$: parseFloat(m_numeric_literal[1]),
					});
				}
				// not iriref, not prefixed name, not string literal, not numeric literal
				else {
					// boolean literal
					@{match('R_BOOLEAN_LITERAL', 'm_boolean_literal')} {
						@{update('R_BOOLEAN_LITERAL')}

						// make literal
						a_objects.push({
							$: m_boolean_literal[1]? true: false,
						});
					}
					// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal: blank node property list
					else if('[' === s[i]) {
						// advance index to next token
						@{whitespace('i+1')}

						// push current pairs hash to list
						a_nested.push([h_pairs, a_objects]);

						// make hash of blanknode (to store predicate-object pairs)
						h_pairs = {
							_: '',
						};

						// push blanknode to object list
						a_objects.push(h_pairs);

						// goto parsing pairs state
						continue pairs;
					}
					// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list: collection
					else if('(' === s[i]) {
						// advance index to next token
						@{whitespace('i+1')}

						// push current objects list to list
						a_nested.push([h_pairs, a_objects]);

						// make list for collection
						let a_collection = [];

						// push collection list to object list
						a_objects.push(a_collection);

						// nest
						a_objects = a_collection;

						// goto parsing object list state
						continue object_list;
					}
					// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
					@{else_invalid('object')}
				}
			}
		}

		// at this point, a new triple has been parsed
		@if !NETWORK
			f_emit({
				subject: s_subject,
				predicate: s_predicate,
				object: a_objects[a_objects.length-1],
			});
		@end

		// advance index to next token
		@{whitespace('i')}

		// 
		post_object:
		while(true) {
			// ref delimiter
			let s_t = s[i];

			// advance index to next token beyond delimiter
			@{whitespace('i+1')}

			// ',' more objects
			if(',' === s_t) {
				continue object_list;
			}
			// ';' more predicate-object pairs
			else if(';' === s_t) {
				// next token is end of blank node property list
				if(']' === s[i]) continue post_object;
				continue pairs;
			}
			// '.' end of statement
			else if('.' === s_t) {
				continue statement;
			}
			// ']' end of property-object pairs
			else if(']' === s_t || ')' === s_t) {
				// pop nested pairs hash
				[h_pairs, a_objects] = a_nested.pop();

				// recurse out
				continue post_object;
			}
			@{else_invalid('post-object delimiter')}
		}
	}
@end


//
@macro pairs(subject)
	// make/ref hash of predicate-object pairs
	let h_pairs = h_tops[@{subject}] = h_tops[@{subject}] || {};

	//
	pairs:
	while(i < n) {

		// iriref
		@{match('R_IRIREF', 'm_iriref_predicate')} {
			@{update('R_IRIREF')}

			// make predicate key
			s_predicate = s_base+m_iriref_predicate[1];

			// object-list state
			@{object_list('s_predicate')}
		}
		// not iriref
		else {
			// prefixed name
			@{match('R_PREFIXED_NAME', 'm_prefixed_named_predicate')} {
				@{update('R_PREFIXED_NAME')}

				// make predicate key
				s_predicate = h_prefix[m_prefixed_named_predicate[1]]+m_prefixed_named_predicate[2];

				// object-list state
				@{object_list('s_predicate')}
			}
			// not iriref, not prefixed name
			else {
				// 'a'
				@{match('R_A', 'm_a')} {
					@{update('R_A')}

					// make predicate key
					s_predicate = 'a';

					// object-list state
					@{object_list('s_predicate')}
				}
				// not iriref, not prefixed name, not 'a'
				@{else_invalid('predicate')}
			}
		}
	}
@end


//
@if NETWORK
module.exports = function(s) {

@else
module.exports = function(ds, f_emit) {

	// unparsed chunk from previous pass
	let s_pre = '';
@end

	// up-to-date prefixes
	let h_prefix = {};

	// up-to-date base
	let s_base = '';

	// nesting
	let a_nested = [];

@if !NETWORK
	// when we get to the end of the stream
	ds.on('end', () => {
		f_emit();
	});

	// read stream read event
	ds.on('data', (s_in) => {

		// concat previous chunk
		let s = s_pre + s_in;

		// reset previous
		s_pre = '';
@end

	// payload
	let h_tops = {};

	// set data length
	let n = s.length;

	// data index
	let i = 0;
	let s_subject;
	let s_predicate;

	// skip whitespace at beginning
	@{whitespace('0')}

	//
	statement:
	while(i < n) {

		// iriref
		@{match('R_IRIREF', 'm_iriref_subject')} {
			@{update('R_IRIREF')}

			// make subject key
			s_subject = s_base+m_iriref_subject[1];

			// predicate-object pairs state
			@{pairs('s_subject')}
		}
		// not iriref
		else {
			// prefixed name
			@{match('R_PREFIXED_NAME', 'm_prefixed_named_subject')} {
				@{update('R_PREFIXED_NAME')}

				// make subject key
				s_subject = h_prefix[m_prefixed_named_subject[1]]+m_prefixed_named_subject[2];

				// predicate-object pairs state
				@{pairs('s_subject')}
			}
			// not iriref, not prefixed name
			else {
				// blank node label
				@{match('R_BLANK_NODE_LABEL', 'm_blank_node_label_subject')} {
					@{update('R_BLANK_NODE_LABEL')}

					// make subject key
					s_subject = m_blank_node_label_subject[1];

					// predicate-object pairs state
					@{pairs('s_subject')}
				}
				// not iriref, not prefixed name, not blank node label
				else {
					// prefix id
					@{match('R_PREFIX_ID', 'm_prefix_id')} {
						@{update('R_PREFIX_ID')}

						// set mapping prefix id => iri
						h_prefix[m_prefix_id[1]] = m_prefix_id[2];
					}
					// not iriref, not prefixed name, not blank node label, not prefix id
					else {
						// base
						@{match('R_BASE', 'm_base')} {
							@{update('R_BASE')}

							// set base iri
							s_base = m_base[1];
						}
						// not iriref, not prefixed name, not blank node label, not prefix id, not base
						@{else_invalid('statement')}
					}
				}
			}
		}
	}

@if !NETWORK
	});
@end
};
