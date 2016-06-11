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

@set UNROLLED false

//
@macro apply(method)
	this.@{method}();
@end

@macro pairs()
	@{apply('pairs')}
@end

@macro object_list()
	@{apply('object_list')}
@end



//
@macro continue(method)
	@if UNROLLED
		continue @{method}
	@else
		return @{apply(method)}
	@end
@end


//
@macro else_resume(mode, expected)
	else {
		@if STREAM
			this.resume = this.@{mode};
			this.pre = s.slice(i);
			if(this.pre.length > 255) {
				throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
					\nexpected @{expected}, instead found character "${s[i]}" @${i}`;
			}
			console.log(`pausing at "${this.pre}"`);
			return;
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


//
@macro save(var, val)
	@if UNROLLED
		@{var} = @{val};
	@else
		this.@{var} = @{val};
	@end
@end

@macro save_let(var, val)
	@if UNROLLED
		let @{save(var, val)};
	@else
		@{save(var, val)};
	@end
@end

// update index from regex last index
@macro update(regex)
	@{save('i', regex+'.lastIndex')}
@end


// consume whitespace
@macro whitespace(offset)
	R_WS.lastIndex = @{offset};
	R_WS.exec(s);
	@{update('R_WS')}
@end


//
@macro literal(match)
	// make literal
	let h_literal = {};
	this.objects.push(h_literal);

	// set literal value
	h_literal.$ = @{match}[1];
@end


//
@macro commit_object(how)
	@if NETWORK
		this.objects.push(@{how});
	@else
		w_object = @{how};
	@end
@end

@macro open(method)
	const @{method} = StreamParser.prototype.@{method} = function() {
		let {
			i,
			s,
		} = this;
@end


const StreamParser =
//
@if NETWORK
	module.exports = function(s) {

		// payload
		this.tops = {};

		// nesting
		this.nested = [];
		this.mode = 'statement';
@end

@if STREAM
	module.exports = function(ds, f_emit) {

		// unparsed chunk from previous pass
		this.pre = '';

		// set emitter
		this.emit = f_emit;

		// mode switching
		this.resume = this.statement;
@end

		// up-to-date prefixes
		this.prefix = {};

		// up-to-date base
		this.base = '';

@if STREAM
		// when we get to the end of the stream
		ds.on('end', () => {
			if(s_pre.length) {
				throw `${s_pre.length} characters unparsed`;
			}
			f_emit();
		});

		// read stream read event
		ds.on('data', (s_in) => {

			// concat previous chunk
			this.s = this.pre + s_in;

			// reset previous
			this.pre = '';
@end

			// set data length
			@{save_let('n', 's.length')}

			// data index
			@{save_let('i', '0')}

			// skip whitespace at beginning
			@{whitespace('0')}

			//
			this.resume();

@if STREAM
		});
@else
		return this.tops;
@end
	};


//
@{open('datatype_or_langtag')}
	let x = s[i];

	// '^' datatype
	if('^' === x) {
		// skip '^^'
		i += 2;

		// iriref
		@{match('R_IRIREF', 'm_iriref_datatype')} {
			@{update('R_IRIREF')}

			// set literal datatype
			h_literal['^'] = this.base+m_iriref_datatype[1];
		}
		// not iriref
		else {
			@{match('R_PREFIXED_NAME', 'm_prefixed_named_datatype')} {
				@{update('R_PREFIXED_NAME')}

				// set literal datatype
				h_literal['^'] = this.prefix[m_prefixed_named_datatype[1]]+m_prefixed_named_datatype[2];
			}
			// not iriref, not prefixed name
			@{else_resume('datatype_or_langtag')}
		}
	}
	// '@' language tag
	else if('@' === x) {
		// langtag
		@{match('R_LANGTAG', 'm_langtag')} {
			@{update('R_LANGTAG')}

			// set literal language type
			h_literal['@'] = m_langtag[1];
		}
		// not langtag
		@{else_resume('datatype_or_langtag')}
	}
	// not datatype, not language tag => that's okay! those are optional
	@{continue('end_of_triple')}
}


@{open('string_literal')}
	// make literal
	let h_literal = {};
	@{commit_object('h_literal')}

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
			@{else_resume('string_literal')}
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
			@{else_resume('string_literal')}
		}
	}

	// complete literal
	@{continue('datatype_or_langtag')}
};


//
@{open('object_list')}

@if NETWORK
	//
	this.objects = this.pairs[this.predicate] = this.pairs[this.predicate] || [];
@else
	let h_object;
@end

	//
	object_list:
	while(i < n) {

		// iriref
		@{match('R_IRIREF', 'm_iriref_object')} {
			@{update('R_IRIREF')}

			// commit object iri as is
			@{commit_object('this.base + m_iriref_object[1]')}
		}
		// not iriref
		else {
			// prefixed name
			@{match('R_PREFIXED_NAME', 'm_prefixed_named_object')} {
				@{update('R_PREFIXED_NAME')}

				// commit object iri from resolve prefixed name
				@{commit_object('this.prefix[m_prefixed_named_object[1]] + m_prefixed_named_object[2]')}
			}
			// not iriref, not prefixed name: string literal
			else if(`"` === s[i] || `'` === s[i]) {
				@{continue('string_literal')}
			}
			// not iriref, not prefixed name, not string literal
			else {
				// numeric literal
				@{match('R_NUMERIC_LITERAL', 'm_numeric_literal')} {
					@{update('R_NUMERIC_LITERAL')}

					// commit literal
					@set numeric_literal '{$: parseFloat(m_numeric_literal[1])}'
					@{commit_object(numeric_literal)}
				}
				// not iriref, not prefixed name, not string literal, not numeric literal
				else {
					// boolean literal
					@{match('R_BOOLEAN_LITERAL', 'm_boolean_literal')} {
						@{update('R_BOOLEAN_LITERAL')}

						// make literal
						@set boolean_literal '{$: m_boolean_literal[1]? true: false}'
						@{commit_object(boolean_literal)}
					}
					// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal: blank node property list
					else if('[' === s[i]) {
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
							w_object = {_: ''};
						@end

						// goto parsing pairs state
						@{continue('pairs')};
					}
					// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list: collection
					else if('(' === s[i]) {
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
							w_object = [];
						@end

						// goto parsing object list state
						@{continue('object_list')};
					}
					// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
					@{else_resume('object_list')}
				}
			}
		}

		//
		@{continue('end_of_triple')}
	}
};

@{open('end_of_triple')}
	// at this point, a new triple has been parsed
	@if STREAM
		this.emit({
			subject: this.subject,
			predicate: this.predicate,
			object: w_object,
		});
	@end

	@{continue('post_object')}
};

@{open('post_object')}
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
			@{continue('object_list')};
		}
		// ';' more predicate-object pairs
		else if(';' === s_t) {
			// next token is end of blank node property list
			if(']' === s[i]) @{continue('post_object')};
			@{continue('pairs')};
		}
		// '.' end of statement
		else if('.' === s_t) {
			@{continue('statement')};
		}
		// ']' end of property-object pairs
		else if(']' === s_t || ')' === s_t) {
			@if NETWORK
				// pop nested pairs hash
				[this.pairs, this.objects] = this.nested.pop();
			@end

			// recurse out
			@{continue('post_object')};
		}
		@{else_resume('post_object')}
	}
};


@{open('pairs')}

	@if NETWORK
		// make/ref hash of predicate-object pairs
		this.pairs = this.tops[this.subject] = this.tops[this.subject] || {};
	@else

	@end

	//
	pairs:
	while(i < n) {

		// iriref
		@{match('R_IRIREF', 'm_iriref_predicate')} {
			@{update('R_IRIREF')}

			// make predicate key
			this.predicate = this.base+m_iriref_predicate[1];

			// object-list state
			@{object_list()}
		}
		// not iriref
		else {
			// prefixed name
			@{match('R_PREFIXED_NAME', 'm_prefixed_named_predicate')} {
				@{update('R_PREFIXED_NAME')}

				// make predicate key
				this.predicate = this.prefix[m_prefixed_named_predicate[1]]+m_prefixed_named_predicate[2];

				// object-list state
				@{object_list()}
			}
			// not iriref, not prefixed name
			else {
				// 'a'
				@{match('R_A', 'm_a')} {
					@{update('R_A')}

					// make predicate key
					this.predicate = 'a';

					// object-list state
					@{apply('object_list')}
				}
				// not iriref, not prefixed name, not 'a'
				@{else_resume('predicate')}
			}
		}
	}
};


@{open('statement')}
	//
	statement:
	while(i < n) {

		// iriref
		@{match('R_IRIREF', 'm_iriref_subject')} {
			@{update('R_IRIREF')}

			// make subject key
			this.subject = this.base+m_iriref_subject[1];

			// predicate-object pairs state
			@{pairs()}
		}
		// not iriref
		else {
			// prefixed name
			@{match('R_PREFIXED_NAME', 'm_prefixed_named_subject')} {
				@{update('R_PREFIXED_NAME')}

				// make subject key
				this.subject = this.prefix[m_prefixed_named_subject[1]]+m_prefixed_named_subject[2];

				// predicate-object pairs state
				@{pairs()}
			}
			// not iriref, not prefixed name
			else {
				// blank node label
				@{match('R_BLANK_NODE_LABEL', 'm_blank_node_label_subject')} {
					@{update('R_BLANK_NODE_LABEL')}

					// make subject key
					this.subject = m_blank_node_label_subject[1];

					// predicate-object pairs state
					@{pairs()}
				}
				// not iriref, not prefixed name, not blank node label
				else {
					// prefix id
					@{match('R_PREFIX_ID', 'm_prefix_id')} {
						@{update('R_PREFIX_ID')}

						// set mapping prefix id => iri
						this.prefix[m_prefix_id[1]] = m_prefix_id[2];
					}
					// not iriref, not prefixed name, not blank node label, not prefix id
					else {
						// base
						@{match('R_BASE', 'm_base')} {
							@{update('R_BASE')}

							// set base iri
							this.base = m_base[1];
						}
						// not iriref, not prefixed name, not blank node label, not prefix id, not base
						@{else_resume('statement')}
					}
				}
			}
		}
	}
};

