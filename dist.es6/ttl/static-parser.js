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


// exec regex and store match


// update index from regex last index


// consume whitespace


//


//

//


//


//
const pairs = function() {

		// make/ref hash of predicate-object pairs
		let h_pairs = h_tops[this.subject] = h_tops[this.subject] || {};

	//
	pairs:
	while(i < n) {

		// iriref
			R_IRIREF.lastIndex = i;
	let m_iriref_predicate = R_IRIREF.exec(s);
	if(m_iriref_predicate) {
				i = R_IRIREF.lastIndex;

			// make predicate key
			this.predicate = s_base+m_iriref_predicate[1];

			// object-list state
			
	//
	let a_objects = h_pairs[this.predicate] = h_pairs[this.predicate] || [];

	//
	object_list:
	while(i < n) {

		// iriref
			R_IRIREF.lastIndex = i;
	let m_iriref_object = R_IRIREF.exec(s);
	if(m_iriref_object) {
				i = R_IRIREF.lastIndex;

			// commit object iri as is
					a_objects.push(s_base + m_iriref_object[1]);
		}
		// not iriref
		else {
			// prefixed name
				R_PREFIXED_NAME.lastIndex = i;
	let m_prefixed_named_object = R_PREFIXED_NAME.exec(s);
	if(m_prefixed_named_object) {
					i = R_PREFIXED_NAME.lastIndex;

				// commit object iri from resolve prefixed name
						a_objects.push(h_prefix[m_prefixed_named_object[1]] + m_prefixed_named_object[2]);
			}
			// not iriref, not prefixed name: string literal
			else if(`"` === s[i] || `'` === s[i]) {
				// make literal
				let h_literal = {};
						a_objects.push(h_literal);

				// string literal quote / string literal long quote
				if(`"` === s[i]) {
					// `"""` string literal long quote
						R_STRING_LITERAL_LONG_QUOTE.lastIndex = i;
	let m_string_literal_long_quote = R_STRING_LITERAL_LONG_QUOTE.exec(s);
	if(m_string_literal_long_quote) {
							i = R_STRING_LITERAL_LONG_QUOTE.lastIndex;

						// set literal value
						h_literal.$ = m_string_literal_long_quote[1];
					}
					// not string literal long quote
					else {
						// `"` string literal quote
							R_STRING_LITERAL_QUOTE.lastIndex = i;
	let m_string_literal_quote = R_STRING_LITERAL_QUOTE.exec(s);
	if(m_string_literal_quote) {
								i = R_STRING_LITERAL_QUOTE.lastIndex;

							// set literal value
							h_literal.$ = m_string_literal_quote[1];
						}
						// not string long literal quote, not string literal quote
							else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected string literal quote, instead found character "${s[i]}" @${i}`;
	}
					}
				}
				// not string literal long quote, not string literal quote
				else {
					// `'''` string literal long single quote
						R_STRING_LITERAL_LONG_SINGLE_QUOTE.lastIndex = i;
	let m_string_literal_long_single_quote = R_STRING_LITERAL_LONG_SINGLE_QUOTE.exec(s);
	if(m_string_literal_long_single_quote) {
							i = R_STRING_LITERAL_LONG_SINGLE_QUOTE.lastIndex;

						// set literal value
						h_literal.$ = m_string_literal_long_single_quote[1];
					}
					// not string literal long single quote
					else {
						// `'` string literal single quote
							R_STRING_LITERAL_SINGLE_QUOTE.lastIndex = i;
	let m_string_literal_single_quote = R_STRING_LITERAL_SINGLE_QUOTE.exec(s);
	if(m_string_literal_single_quote) {
								i = R_STRING_LITERAL_SINGLE_QUOTE.lastIndex;

							// set literal value
							h_literal.$ = m_string_literal_single_quote[1];
						}
						// not string literal long single quote, not string literal single quote
							else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected string literal single quote, instead found character "${s[i]}" @${i}`;
	}
					}
				}

				// complete literal
					// '^' datatype
	if('^' === s[i]) {
		// skip '^^'
		i += 2;

		// iriref
			R_IRIREF.lastIndex = i;
	let m_iriref_datatype = R_IRIREF.exec(s);
	if(m_iriref_datatype) {
				i = R_IRIREF.lastIndex;

			// set literal datatype
			h_literal['^'] = s_base+m_iriref_datatype[1];
		}
		// not iriref
		else {
				R_PREFIXED_NAME.lastIndex = i;
	let m_prefixed_named_datatype = R_PREFIXED_NAME.exec(s);
	if(m_prefixed_named_datatype) {
					i = R_PREFIXED_NAME.lastIndex;

				// set literal datatype
				h_literal['^'] = h_prefix[m_prefixed_named_datatype[1]]+m_prefixed_named_datatype[2];
			}
			// not iriref, not prefixed name
				else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected object datatype iri, instead found character "${s[i]}" @${i}`;
	}
		}
	}
	// '@' language tag
	else if('@' === s[i]) {
		// langtag
			R_LANGTAG.lastIndex = i;
	let m_langtag = R_LANGTAG.exec(s);
	if(m_langtag) {
				i = R_LANGTAG.lastIndex;

			// set literal language type
			h_literal['@'] = m_langtag[1];
		}
		// not langtag
			else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected object language tag, instead found character "${s[i]}" @${i}`;
	}
	}
	// not datatype, not language tag => that's okay! those are optional
			}
			// not iriref, not prefixed name, not string literal
			else {
				// numeric literal
					R_NUMERIC_LITERAL.lastIndex = i;
	let m_numeric_literal = R_NUMERIC_LITERAL.exec(s);
	if(m_numeric_literal) {
						i = R_NUMERIC_LITERAL.lastIndex;

					// commit literal
							a_objects.push({$: parseFloat(m_numeric_literal[1])});
				}
				// not iriref, not prefixed name, not string literal, not numeric literal
				else {
					// boolean literal
						R_BOOLEAN_LITERAL.lastIndex = i;
	let m_boolean_literal = R_BOOLEAN_LITERAL.exec(s);
	if(m_boolean_literal) {
							i = R_BOOLEAN_LITERAL.lastIndex;

						// make literal
								a_objects.push({$: m_boolean_literal[1]? true: false});
					}
					// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal: blank node property list
					else if('[' === s[i]) {
						// advance index to next token
							R_WS.lastIndex = i+1;
	R_WS.exec(s);
	i = R_WS.lastIndex;

							// push current pairs hash to list
							this.nested.push([h_pairs, a_objects]);

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
							R_WS.lastIndex = i+1;
	R_WS.exec(s);
	i = R_WS.lastIndex;

							// push current objects list to list
							this.nested.push([h_pairs, a_objects]);

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
						else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected object, instead found character "${s[i]}" @${i}`;
	}
				}
			}
		}

		// at this point, a new triple has been parsed

		// advance index to next token
			R_WS.lastIndex = i;
	R_WS.exec(s);
	i = R_WS.lastIndex;

		// 
		post_object:
		while(true) {
			// ref delimiter
			let s_t = s[i];

			// advance index to next token beyond delimiter
				R_WS.lastIndex = i+1;
	R_WS.exec(s);
	i = R_WS.lastIndex;

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
					[h_pairs, a_objects] = this.nested.pop();

				// recurse out
				continue post_object;
			}
				else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected post-object delimiter, instead found character "${s[i]}" @${i}`;
	}
		}
	}
		}
		// not iriref
		else {
			// prefixed name
				R_PREFIXED_NAME.lastIndex = i;
	let m_prefixed_named_predicate = R_PREFIXED_NAME.exec(s);
	if(m_prefixed_named_predicate) {
					i = R_PREFIXED_NAME.lastIndex;

				// make predicate key
				this.predicate = h_prefix[m_prefixed_named_predicate[1]]+m_prefixed_named_predicate[2];

				// object-list state
				
	//
	let a_objects = h_pairs[this.predicate] = h_pairs[this.predicate] || [];

	//
	object_list:
	while(i < n) {

		// iriref
			R_IRIREF.lastIndex = i;
	let m_iriref_object = R_IRIREF.exec(s);
	if(m_iriref_object) {
				i = R_IRIREF.lastIndex;

			// commit object iri as is
					a_objects.push(s_base + m_iriref_object[1]);
		}
		// not iriref
		else {
			// prefixed name
				R_PREFIXED_NAME.lastIndex = i;
	let m_prefixed_named_object = R_PREFIXED_NAME.exec(s);
	if(m_prefixed_named_object) {
					i = R_PREFIXED_NAME.lastIndex;

				// commit object iri from resolve prefixed name
						a_objects.push(h_prefix[m_prefixed_named_object[1]] + m_prefixed_named_object[2]);
			}
			// not iriref, not prefixed name: string literal
			else if(`"` === s[i] || `'` === s[i]) {
				// make literal
				let h_literal = {};
						a_objects.push(h_literal);

				// string literal quote / string literal long quote
				if(`"` === s[i]) {
					// `"""` string literal long quote
						R_STRING_LITERAL_LONG_QUOTE.lastIndex = i;
	let m_string_literal_long_quote = R_STRING_LITERAL_LONG_QUOTE.exec(s);
	if(m_string_literal_long_quote) {
							i = R_STRING_LITERAL_LONG_QUOTE.lastIndex;

						// set literal value
						h_literal.$ = m_string_literal_long_quote[1];
					}
					// not string literal long quote
					else {
						// `"` string literal quote
							R_STRING_LITERAL_QUOTE.lastIndex = i;
	let m_string_literal_quote = R_STRING_LITERAL_QUOTE.exec(s);
	if(m_string_literal_quote) {
								i = R_STRING_LITERAL_QUOTE.lastIndex;

							// set literal value
							h_literal.$ = m_string_literal_quote[1];
						}
						// not string long literal quote, not string literal quote
							else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected string literal quote, instead found character "${s[i]}" @${i}`;
	}
					}
				}
				// not string literal long quote, not string literal quote
				else {
					// `'''` string literal long single quote
						R_STRING_LITERAL_LONG_SINGLE_QUOTE.lastIndex = i;
	let m_string_literal_long_single_quote = R_STRING_LITERAL_LONG_SINGLE_QUOTE.exec(s);
	if(m_string_literal_long_single_quote) {
							i = R_STRING_LITERAL_LONG_SINGLE_QUOTE.lastIndex;

						// set literal value
						h_literal.$ = m_string_literal_long_single_quote[1];
					}
					// not string literal long single quote
					else {
						// `'` string literal single quote
							R_STRING_LITERAL_SINGLE_QUOTE.lastIndex = i;
	let m_string_literal_single_quote = R_STRING_LITERAL_SINGLE_QUOTE.exec(s);
	if(m_string_literal_single_quote) {
								i = R_STRING_LITERAL_SINGLE_QUOTE.lastIndex;

							// set literal value
							h_literal.$ = m_string_literal_single_quote[1];
						}
						// not string literal long single quote, not string literal single quote
							else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected string literal single quote, instead found character "${s[i]}" @${i}`;
	}
					}
				}

				// complete literal
					// '^' datatype
	if('^' === s[i]) {
		// skip '^^'
		i += 2;

		// iriref
			R_IRIREF.lastIndex = i;
	let m_iriref_datatype = R_IRIREF.exec(s);
	if(m_iriref_datatype) {
				i = R_IRIREF.lastIndex;

			// set literal datatype
			h_literal['^'] = s_base+m_iriref_datatype[1];
		}
		// not iriref
		else {
				R_PREFIXED_NAME.lastIndex = i;
	let m_prefixed_named_datatype = R_PREFIXED_NAME.exec(s);
	if(m_prefixed_named_datatype) {
					i = R_PREFIXED_NAME.lastIndex;

				// set literal datatype
				h_literal['^'] = h_prefix[m_prefixed_named_datatype[1]]+m_prefixed_named_datatype[2];
			}
			// not iriref, not prefixed name
				else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected object datatype iri, instead found character "${s[i]}" @${i}`;
	}
		}
	}
	// '@' language tag
	else if('@' === s[i]) {
		// langtag
			R_LANGTAG.lastIndex = i;
	let m_langtag = R_LANGTAG.exec(s);
	if(m_langtag) {
				i = R_LANGTAG.lastIndex;

			// set literal language type
			h_literal['@'] = m_langtag[1];
		}
		// not langtag
			else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected object language tag, instead found character "${s[i]}" @${i}`;
	}
	}
	// not datatype, not language tag => that's okay! those are optional
			}
			// not iriref, not prefixed name, not string literal
			else {
				// numeric literal
					R_NUMERIC_LITERAL.lastIndex = i;
	let m_numeric_literal = R_NUMERIC_LITERAL.exec(s);
	if(m_numeric_literal) {
						i = R_NUMERIC_LITERAL.lastIndex;

					// commit literal
							a_objects.push({$: parseFloat(m_numeric_literal[1])});
				}
				// not iriref, not prefixed name, not string literal, not numeric literal
				else {
					// boolean literal
						R_BOOLEAN_LITERAL.lastIndex = i;
	let m_boolean_literal = R_BOOLEAN_LITERAL.exec(s);
	if(m_boolean_literal) {
							i = R_BOOLEAN_LITERAL.lastIndex;

						// make literal
								a_objects.push({$: m_boolean_literal[1]? true: false});
					}
					// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal: blank node property list
					else if('[' === s[i]) {
						// advance index to next token
							R_WS.lastIndex = i+1;
	R_WS.exec(s);
	i = R_WS.lastIndex;

							// push current pairs hash to list
							this.nested.push([h_pairs, a_objects]);

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
							R_WS.lastIndex = i+1;
	R_WS.exec(s);
	i = R_WS.lastIndex;

							// push current objects list to list
							this.nested.push([h_pairs, a_objects]);

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
						else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected object, instead found character "${s[i]}" @${i}`;
	}
				}
			}
		}

		// at this point, a new triple has been parsed

		// advance index to next token
			R_WS.lastIndex = i;
	R_WS.exec(s);
	i = R_WS.lastIndex;

		// 
		post_object:
		while(true) {
			// ref delimiter
			let s_t = s[i];

			// advance index to next token beyond delimiter
				R_WS.lastIndex = i+1;
	R_WS.exec(s);
	i = R_WS.lastIndex;

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
					[h_pairs, a_objects] = this.nested.pop();

				// recurse out
				continue post_object;
			}
				else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected post-object delimiter, instead found character "${s[i]}" @${i}`;
	}
		}
	}
			}
			// not iriref, not prefixed name
			else {
				// 'a'
					R_A.lastIndex = i;
	let m_a = R_A.exec(s);
	if(m_a) {
						i = R_A.lastIndex;

					// make predicate key
					this.predicate = 'a';

					// object-list state
					
	//
	let a_objects = h_pairs[this.predicate] = h_pairs[this.predicate] || [];

	//
	object_list:
	while(i < n) {

		// iriref
			R_IRIREF.lastIndex = i;
	let m_iriref_object = R_IRIREF.exec(s);
	if(m_iriref_object) {
				i = R_IRIREF.lastIndex;

			// commit object iri as is
					a_objects.push(s_base + m_iriref_object[1]);
		}
		// not iriref
		else {
			// prefixed name
				R_PREFIXED_NAME.lastIndex = i;
	let m_prefixed_named_object = R_PREFIXED_NAME.exec(s);
	if(m_prefixed_named_object) {
					i = R_PREFIXED_NAME.lastIndex;

				// commit object iri from resolve prefixed name
						a_objects.push(h_prefix[m_prefixed_named_object[1]] + m_prefixed_named_object[2]);
			}
			// not iriref, not prefixed name: string literal
			else if(`"` === s[i] || `'` === s[i]) {
				// make literal
				let h_literal = {};
						a_objects.push(h_literal);

				// string literal quote / string literal long quote
				if(`"` === s[i]) {
					// `"""` string literal long quote
						R_STRING_LITERAL_LONG_QUOTE.lastIndex = i;
	let m_string_literal_long_quote = R_STRING_LITERAL_LONG_QUOTE.exec(s);
	if(m_string_literal_long_quote) {
							i = R_STRING_LITERAL_LONG_QUOTE.lastIndex;

						// set literal value
						h_literal.$ = m_string_literal_long_quote[1];
					}
					// not string literal long quote
					else {
						// `"` string literal quote
							R_STRING_LITERAL_QUOTE.lastIndex = i;
	let m_string_literal_quote = R_STRING_LITERAL_QUOTE.exec(s);
	if(m_string_literal_quote) {
								i = R_STRING_LITERAL_QUOTE.lastIndex;

							// set literal value
							h_literal.$ = m_string_literal_quote[1];
						}
						// not string long literal quote, not string literal quote
							else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected string literal quote, instead found character "${s[i]}" @${i}`;
	}
					}
				}
				// not string literal long quote, not string literal quote
				else {
					// `'''` string literal long single quote
						R_STRING_LITERAL_LONG_SINGLE_QUOTE.lastIndex = i;
	let m_string_literal_long_single_quote = R_STRING_LITERAL_LONG_SINGLE_QUOTE.exec(s);
	if(m_string_literal_long_single_quote) {
							i = R_STRING_LITERAL_LONG_SINGLE_QUOTE.lastIndex;

						// set literal value
						h_literal.$ = m_string_literal_long_single_quote[1];
					}
					// not string literal long single quote
					else {
						// `'` string literal single quote
							R_STRING_LITERAL_SINGLE_QUOTE.lastIndex = i;
	let m_string_literal_single_quote = R_STRING_LITERAL_SINGLE_QUOTE.exec(s);
	if(m_string_literal_single_quote) {
								i = R_STRING_LITERAL_SINGLE_QUOTE.lastIndex;

							// set literal value
							h_literal.$ = m_string_literal_single_quote[1];
						}
						// not string literal long single quote, not string literal single quote
							else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected string literal single quote, instead found character "${s[i]}" @${i}`;
	}
					}
				}

				// complete literal
					// '^' datatype
	if('^' === s[i]) {
		// skip '^^'
		i += 2;

		// iriref
			R_IRIREF.lastIndex = i;
	let m_iriref_datatype = R_IRIREF.exec(s);
	if(m_iriref_datatype) {
				i = R_IRIREF.lastIndex;

			// set literal datatype
			h_literal['^'] = s_base+m_iriref_datatype[1];
		}
		// not iriref
		else {
				R_PREFIXED_NAME.lastIndex = i;
	let m_prefixed_named_datatype = R_PREFIXED_NAME.exec(s);
	if(m_prefixed_named_datatype) {
					i = R_PREFIXED_NAME.lastIndex;

				// set literal datatype
				h_literal['^'] = h_prefix[m_prefixed_named_datatype[1]]+m_prefixed_named_datatype[2];
			}
			// not iriref, not prefixed name
				else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected object datatype iri, instead found character "${s[i]}" @${i}`;
	}
		}
	}
	// '@' language tag
	else if('@' === s[i]) {
		// langtag
			R_LANGTAG.lastIndex = i;
	let m_langtag = R_LANGTAG.exec(s);
	if(m_langtag) {
				i = R_LANGTAG.lastIndex;

			// set literal language type
			h_literal['@'] = m_langtag[1];
		}
		// not langtag
			else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected object language tag, instead found character "${s[i]}" @${i}`;
	}
	}
	// not datatype, not language tag => that's okay! those are optional
			}
			// not iriref, not prefixed name, not string literal
			else {
				// numeric literal
					R_NUMERIC_LITERAL.lastIndex = i;
	let m_numeric_literal = R_NUMERIC_LITERAL.exec(s);
	if(m_numeric_literal) {
						i = R_NUMERIC_LITERAL.lastIndex;

					// commit literal
							a_objects.push({$: parseFloat(m_numeric_literal[1])});
				}
				// not iriref, not prefixed name, not string literal, not numeric literal
				else {
					// boolean literal
						R_BOOLEAN_LITERAL.lastIndex = i;
	let m_boolean_literal = R_BOOLEAN_LITERAL.exec(s);
	if(m_boolean_literal) {
							i = R_BOOLEAN_LITERAL.lastIndex;

						// make literal
								a_objects.push({$: m_boolean_literal[1]? true: false});
					}
					// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal: blank node property list
					else if('[' === s[i]) {
						// advance index to next token
							R_WS.lastIndex = i+1;
	R_WS.exec(s);
	i = R_WS.lastIndex;

							// push current pairs hash to list
							this.nested.push([h_pairs, a_objects]);

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
							R_WS.lastIndex = i+1;
	R_WS.exec(s);
	i = R_WS.lastIndex;

							// push current objects list to list
							this.nested.push([h_pairs, a_objects]);

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
						else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected object, instead found character "${s[i]}" @${i}`;
	}
				}
			}
		}

		// at this point, a new triple has been parsed

		// advance index to next token
			R_WS.lastIndex = i;
	R_WS.exec(s);
	i = R_WS.lastIndex;

		// 
		post_object:
		while(true) {
			// ref delimiter
			let s_t = s[i];

			// advance index to next token beyond delimiter
				R_WS.lastIndex = i+1;
	R_WS.exec(s);
	i = R_WS.lastIndex;

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
					[h_pairs, a_objects] = this.nested.pop();

				// recurse out
				continue post_object;
			}
				else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected post-object delimiter, instead found character "${s[i]}" @${i}`;
	}
		}
	}
				}
				// not iriref, not prefixed name, not 'a'
					else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected predicate, instead found character "${s[i]}" @${i}`;
	}
			}
		}
	}
};


//
	module.exports = function(s) {

		// payload
		let h_tops = {};

		// nesting
		this.nested = [];
		this.mode = 'statement';


		// up-to-date prefixes
		let h_prefix = {};

		// up-to-date base
		let s_base = '';


			// set data length
			let n = s.length;

			// data index
			let i = 0;

			// skip whitespace at beginning
				R_WS.lastIndex = 0;
	R_WS.exec(s);
	i = R_WS.lastIndex;

			//
			statement:
			while(i < n) {

				// iriref
					R_IRIREF.lastIndex = i;
	let m_iriref_subject = R_IRIREF.exec(s);
	if(m_iriref_subject) {
						i = R_IRIREF.lastIndex;

					// make subject key
					this.subject = s_base+m_iriref_subject[1];

					// predicate-object pairs state
						pairs.apply(this);
				}
				// not iriref
				else {
					// prefixed name
						R_PREFIXED_NAME.lastIndex = i;
	let m_prefixed_named_subject = R_PREFIXED_NAME.exec(s);
	if(m_prefixed_named_subject) {
							i = R_PREFIXED_NAME.lastIndex;

						// make subject key
						this.subject = h_prefix[m_prefixed_named_subject[1]]+m_prefixed_named_subject[2];

						// predicate-object pairs state
							pairs.apply(this);
					}
					// not iriref, not prefixed name
					else {
						// blank node label
							R_BLANK_NODE_LABEL.lastIndex = i;
	let m_blank_node_label_subject = R_BLANK_NODE_LABEL.exec(s);
	if(m_blank_node_label_subject) {
								i = R_BLANK_NODE_LABEL.lastIndex;

							// make subject key
							this.subject = m_blank_node_label_subject[1];

							// predicate-object pairs state
								pairs.apply(this);
						}
						// not iriref, not prefixed name, not blank node label
						else {
							// prefix id
								R_PREFIX_ID.lastIndex = i;
	let m_prefix_id = R_PREFIX_ID.exec(s);
	if(m_prefix_id) {
									i = R_PREFIX_ID.lastIndex;

								// set mapping prefix id => iri
								h_prefix[m_prefix_id[1]] = m_prefix_id[2];
							}
							// not iriref, not prefixed name, not blank node label, not prefix id
							else {
								// base
									R_BASE.lastIndex = i;
	let m_base = R_BASE.exec(s);
	if(m_base) {
										i = R_BASE.lastIndex;

									// set base iri
									s_base = m_base[1];
								}
								// not iriref, not prefixed name, not blank node label, not prefix id, not base
									else {
			throw `\`${s.substr(i-15, 30).replace(/[\n\t]/g, ' ')}\`\n                ^
				\nexpected statement, instead found character "${s[i]}" @${i}`;
	}
							}
						}
					}
				}
			}
		return h_tops
	};
