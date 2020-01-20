/*

/banana/i;/label/;//

-x '/^dbr:/{concise}; (a; dbo:Fruit, dbo:Plant | rdfs:label; @en, @de)'
{
	{
		?thing a dbo:Fruit
	} union {
		?thing a dbo:Plant
	} union {
		?thing rdfs:label ?label
		filter(
			isLiteral(?label) && (
				langMatches(lang(?label), "en")
				|| langMatches(lang(?label), "de")
			)
		)
	}

	filter(strStarts(str(?thing), "http://dbpedia.org/resource/"))
}


- `-x '$p or $o'`

- `-x 'dbr:Banana'` equivalent to `-s dbr:Banana`
- `-x '!dbr:Banana'` equivalent to `-S dbr:Banana`
- `-x 'dbr:Banana' -x ';; dbr:Banana'` Banana in subject or object position
- `-x 'dbr:Banana | ;; dbr:Banana'`

- `-x '?s;; ?s'`  Any triples where the subject and object are the same term
{
	?s ?p ?s
}

- `-x '?s is !dbr:Banana;; ?s'`  Any triples where the subject and object are the same term except for dbr:Banana
{
	?s ?p ?s
	filter(?s != dbr:Banana)
}

- `-x ';; ^xsd:integer and > 51}'`
{
	?s ?p ?o
	filter(isLiteral(?o) && datatype(?o) = xsd:integer && ?o > 51)
}

- `-x '; dbo:date; not ^xsd:dateTime'`
{
	?thing dbo:date ?time

	filter(
		!isLiteral(?time)
		|| (isLiteral(?time) && datatype(?time) != xsd:dateTime)
	)
}

- `-x '; dbo:date; {literal} and not ^xsd:dateTime'`
{
	?thing dbo:date ?time

	filter(
		isLiteral(?time) && datatype(?time) != xsd:dateTime
	)
}

-x '/banana/i & /Blue_Banana/; rdfs:label; "Banana"@en'
-x ''
-x 'dbr:Apple|dbr:Orange; a; >'
-x '; rdfs:label; @en'
-x '; ; ^^xsd:dateTime'
-x '; ; ^^xsd:integer { kt => kt.number > 24 && kt.number < 100 }'
-x '; ; `kt => kt.number > 5`'


'<http://ex>' -- a specific named node
'_:bEg' -- a specific blank node
'>' -- any named node
'_:' -- any blank node
'[]' -- any named node or blank node

'"eg"' -- a specific simple literal
'"eg"@en' -- a specific languaged literal
'"eg"^^xsd:date' -- a specific datatyped literal
'"eg"^^<http://eg>' -- a specific datatyped literal
'^^xsd:date' -- a literal with exact datatype
'^^<http://eg>' -- a literal with exact datatype
'@en' -- a literal with exact language
'"eg"@' -- a languaged literal with some specific value
'"eg"^^' -- a datatyped literal with some specific value
'/^eg/t' -- a literal that starts with some specific value
'/^eg/l' -- a languaged literal that starts with some specific value

'{node}' -- any node
'{named}' -- any named node
'{blank}' -- any blank node
'{literal}' -- any literal (alias for '//dls')
'{datatyped}' -- any datatyped literal
'{languaged}' -- any languaged literal
'{simple}' -- any simple literal

*/

{
	const {
		XM_TERM_TAG_NODE_NAMED,
		XM_TERM_TAG_NODE_BLANK,
		XM_TERM_TAG_LITERAL_SIMPLE,
		XM_TERM_TAG_LITERAL_LANGUAGED,
		XM_TERM_TAG_LITERAL_DATATYPED,
		XM_TERM_TAG_NODE,
		XM_TERM_TAG_LITERAL,
		XM_TERM_TAG_ANY,
	} = require('./constants.js');

}


start
	= pattern_union


pattern_union
	= g_top:pattern __ a_more:pattern_union_more*
		{
			return a_more.concat(g_top);
		}

pattern_union_more
	= '|' __ a_more:pattern_union
		{
			return a_more;
		}

pattern
	= g_ref:ref __ g_rest:rest_p
		{
			return {
				subject: g_ref,
				...g_rest,
			};
		}

rest_p
	= ';' __ g_match:match_p
		{
			return g_match;
		}
	/ !.

match_p
	= g_ref:ref __ g_rest:rest_o
		{
			return {
				predicate: g_ref,
				...g_rest,
			};
		}
	/ !.

rest_o
	= ';' __ g_match:match_o
		{
			return g_match;
		}
	/ !.

match_o
	= g_ref:ref __ g_rest:rest_g
		{
			return {
				object: g_ref,
				...g_rest,
			};
		}
	/ !.

rest_g
	= ';' __ g_match:match_g
		{
			return g_match;
		}
	/ !.

match_g
	= g_ref:ref __ !.
		{
			return {
				graph: g_ref,
			};
		}
	/ !.


ws 'whitespace'
	= '\t'
	/ '\v'
	/ '\f'
	/ ' '
	/ '\u00A0'
	/ '\uFEFF'
	/ [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

eol 'eol'
	= [\n\r\u2028\u2029]

eol_seq 'end of line'
	= '\n'
	/ '\r\n'
	/ '\r'
	/ '\u2028'
	/ '\u2029'


__ = (ws / eol_seq)*

_ 'whitespace' = ws*

pn_chars_u 'pn_chars_u'
	= pn_chars_base / '_'

pn_chars_base 'pn_chars_base'
	= [A-Z]
	/ [a-z]
	/ [\u00C0-\u00D6]
	/ [\u00D8-\u00F6]
	/ [\u00F8-\u02FF]
	/ [\u0370-\u037D]
	/ [\u037F-\u1FFF]
	/ [\u200C-\u200D]
	/ [\u2070-\u218F]
	/ [\u2C00-\u2FEF]
	/ [\u3001-\uD7FF]
	/ [\uF900-\uFDCF]
	/ [\uFDF0-\uFFFD]
//	/ [\u10000-\uEFFFF]  // extended code points not supported

pn_chars 'pn_chars'
	= pn_chars_u / '-' / [0-9] / [\u00B7] / [\u0300-\u036F] / [\u203F-\u2040]

pn_prefix 'pn_prefix'
	= $(
		pn_chars_base
		(
			(
				('.' / pn_chars) &('.' / pn_chars)
			)*
			pn_chars
		)?
	)

/*
pn_local 'pn_local'
	= $((pn_chars_u / ':' / [0-9] / plx) ((pn_chars / '.' / ':' / plx)* (pn_chars / ':' / plx))?)
*/

pn_local 'pn_local'
	= $(
		(pn_chars_u / ':' / [0-9] / plx) 
		(
			(
				('.' / pn_local_end) &('.' / pn_local_end)
			)*
			pn_local_end
		)?
	)

pn_local_end
	= pn_chars
	/ ':'
	/ plx

plx 'plx'
	= '%' char_hex char_hex
	/ '\\' [_~.!$&'()*+,;=/?#@%-]



term 'term'
	= term_node
	/ term_literal
	/ '*'
		{
			return {
				type: 'default_graph',
				value: '',
			};
		}

term_literal 'term_literal'
	= datatype_or_lang
	/ '"' s_contents:string '"' g_post:datatype_or_lang?
		{
			return {
				type: 'literal',
				value: {
					contents: s_contents,
					post: g_post,
				},
			};
		}

datatype_or_lang
	= '^' '^'? g_datatype:(term_node_named / term_regex)
		{
			return {
				type: 'datatype',
				value: g_datatype,
			};
		}
	/ '@' s_tag:$([a-zA-Z]+ ('-' [a-zA-Z0-9]+)*)
		{
			return {
				type: 'language',
				value: s_tag,
			};
		}

string 'string'
	= !('"' / '\\' / eol) .
		{
			return text();
		}
	/ '\\' s_contents:string_escape
		{
			return s_contents;
		}

string_escape 'string_escape'
	= string_char_escape
	/ string_escape_unicode

string_char_escape 'string_char_escape'
	= char_escape
	/ char_nonescape

char_escape 'char_escape'
	= '\''
	/ '"'
	/ '\\'
	/ 'b'
		{
			return '\b';
		}
	/ 'f'
		{
			return '\f';
		}
	/ 'n'
		{
			return '\n';
		}
	/ 'r'
		{
			return '\r';
		}
	/ 't'
		{
			return '\t';
		}
	/ 'v'
		{
			return '\v';
		}

char_nonescape 'char_nonescape'
	= !(escape / eol) .
		{
			return text();
		}

escape 'escape'
	= char_escape
	/ 'u'

string_escape_unicode 'string_escape_unicode'
	= 'u' s_digits:$(char_hex char_hex char_hex char_hex)
		{
			return String.fromCharCode(parseInt(digits, 16));
		}
	/ 'U' s_digits:$(char_hex char_hex char_hex char_hex char_hex char_hex char_hex char_hex)

char_hex 'char_hex'
	= [0-9a-f]i

uchar 'uchar'
	= '\\' string_escape_unicode

term_node 'term_node'
	= term_node_named
	/ term_node_blank
	/ term_regex

term_node_named 'term_node_named'
	= '<' value:$([^\u0000-\u0020<>"{}|^`\\] / uchar)* '>'
		{
			return {
				type: 'iri',
				value,
			};
		}
	/ prefix:pn_prefix? ':' local:pn_local?
		{
			return {
				type: 'pname',
				value: {
					prefix,
					local,
				},
			};
		}
	/ 'a'
		{
			return {
				type: 'iri',
				value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
			};
		}

term_node_blank 'term_node_blank'
	= '[' _ ']'
		{
			return {
				type: 'anon',
			};
		}
	/ '_:' s_label:(pn_chars_u / [0-9]) ((pn_chars / '.')* pn_chars)?
		{
			return {
				type: 'bnode',
				value: s_label,
			};
		}


term_regex 'regular expression'
	= '/' s_pattern:$regex_body '/' s_flags:$regex_flags
		{
			// regex flags string
			let s_flags_r = s_flags;

			// concise flag
			let b_concise = false;
			if(s_flags.includes('c')) {
				s_flags_r = s_flags.replace(/c/g, '');
				b_concise = true;
			}

			// verbose flag
			let b_verbose = false;
			if(s_flags.includes('v')) {
				s_flags_r = s_flags.replace(/v/g, '');
				b_verbose = true;
				if(b_concise) {
					error(`cannot combine regex flags 'c' (for concise) and 'v' (for verbose)`);
				}
			}

			// regex value
			let r_value;

			// parse regex
			try {
				r_value = new RegExp(s_pattern, s_flags_r);
			}
			// failed to parse
			catch (e_parse) {
				error(e_parse.message);
			}

			return {
				type: 'regex',
				value: {
					pattern: r_value,
					concise: b_concise,
					verbose: b_verbose,
				},
			};
		}

regex_body
	= regex_char_0 regex_char_n*

regex_char_0
	= ![*\\/[] regex_nonterminator
	/ regex_sequence_escape
	/ regex_class

regex_char_n
	= ![\\/[] regex_nonterminator
	/ regex_sequence_escape
	/ regex_class

regex_sequence_escape
	= '\\' regex_nonterminator

regex_nonterminator
	= !eol .

regex_class
	= '[' regex_char_class* ']'

regex_char_class
	= ![\]\\] regex_nonterminator
	/ regex_sequence_escape

regex_flags 'regex_flags'
	= [igmc]*

tags 'tags'
	= '{' __ xm_contents:tags_contents? __ '}'
		{
			return xm_contents || XM_TERM_TAG_ANY;
		}

tags_contents
	= xm_head:tags_selector a_tail:(__ ',' __ tags_selector)*
		{
			return xm_head | (a_tail.reduce((xm, a) => xm | a[3], 0));
		}

tags_contents_more
	= ',' __ as_more:tags_contents
		{
			return as_more;
		}

tags_selector 'tags_selector'
	= 'node' 's'?
		{
			return XM_TERM_TAG_NODE;
		}
	/ 'named' _node?
		{
			return XM_TERM_TAG_NODE_NAMED;
		}
	/ 'blank' 's'? _node?
		{
			return XM_TERM_TAG_NODE_BLANK;
		}
	/ 'literal' 's'?
		{
			return XM_TERM_TAG_LITERAL;
		}
	/ 'datatype' [sd]? _literal?
		{
			return XM_TERM_TAG_LITERAL_DATATYPED;
		}
	/ 'lang' ('s' / 'uage' [sd]?) _literal?
		{
			return XM_TERM_TAG_LITERAL_LANGUAGED;
		}
	/ 'simple' 's'? _literal?
		{
			return XM_TERM_TAG_LITERAL_SIMPLE;
		}

_node
	= [- _]? 'node' 's'?

_literal
	= [- _]? 'literal' 's'?

primary_expr
	= g_term:term __ xm_tags:tags?
		{
			return xm_tags
				? {
					type: 'range',
					value: {
						term: g_term,
						tags: xm_tags,
					},
				}
				: g_term;
		}
	/ xm_tags:tags
		{
			return {
				type: 'range',
				value: {
					term: null,
					tags: xm_tags,
				},
			};
		}
	/ '(' __ g_expr:expr __ ')'
		{
			return g_expr;
		}
	/ reference

reference 'reference'
	= '$s' 'ubject'?
		{
			return {
				type: 'ref',
				value: 'subject',
			};
		}
	/ '$p' 'redicate'?
		{
			return {
				type: 'ref',
				value: 'predicate',
			};
		}
	/ '$o' 'bject'?
		{
			return {
				type: 'ref',
				value: 'object',
			};
		}
	/ '$g' 'raph'?
		{
			return {
				type: 'ref',
				value: 'graph',
			};
		}

expr_unary
	= s_op:$op_unary __ g_expr:expr_unary
		{
			return {
				type: 'not',
				value: g_expr,
			};
		}
	/ primary_expr

op_unary
	= '!'
	/ 'not' &non_word

expr_term_and
	= g_head:expr_unary a_tail:(__ op_term_and __ expr_term_and)*
		{
			return a_tail.length? {
				type: 'and',
				value: [g_head, ...a_tail.map(a => a[3])],
			}: g_head;
		}

op_term_and
	= 'and' &non_word
	/ 'but' &non_word

expr_term_or
	= g_head:expr_term_and a_tail:(__ op_term_or __ expr_term_and)*
		{
			return a_tail.length? {
				type: 'or',
				value: [g_head, ...a_tail.map(a => a[3])],
			} : g_head;
		}

op_term_or
	= ',' __ ('or')?
	/ 'or'

expr
	= expr_term_or

ref
	= expr?

non_word
	= ws / [`~!@#$%^&*()\-=_+{}|;':",./<>?[\]]

var 'var'
	= '?' s_var:$((pn_chars_u / [0-9]) (pn_chars_u / [0-9\u00B7\u0300-\u036F\u203F-\u2040])*)
		{
			return s_var;
		}
