/* eslint-disable */

@ // import store macros
@include 'store.jmacs'

@{constants()}

@macro count(what)
	@if what == 's'
		k_graph.section_d.count + k_graph.section_s.count
	@elseif what == 'p'
		k_graph.section_p.count
	@elseif what == 'o'
		k_graph.section_d.count + k_graph.section_o.count + k_graph.section_l.count
	@end
@end



/**
* imports
**/

// native
const fs = require('fs');

// local classes
const graphy = require('../main/graphy.js');
const query = require('./query.js');
const plugins = require('./plugin.js');


/**
* constants
**/

const I_PREFIX_TOKEN = 0x01;
@{encoders()}
@{decoders()}
@{buffer_utils()}

const HP_TYPE_HOP = Symbol('hop');
const HP_TYPE_SUBJECT = Symbol('subject');
const HP_TYPE_OBJECT = Symbol('object');

class LinkedGraph {
	constructor(h_config) {
		Object.assign(this, {
			prefixes: {},
			prefix_lookup: {},
			user_prefixes: {},
			user_prefix_iris: {},
			label_lookup: {},
			term_count: 0,
			plugins: new plugins(this),

			TYPE_HOP: HP_TYPE_HOP,
			TYPE_SUBJECT: HP_TYPE_SUBJECT,
			TYPE_OBJECT: HP_TYPE_OBJECT,
		});
	}

	// add_prefixes(h_prefixes) {
	// 	let h_user_prefixes = this.user_prefixes;
	// 	let h_prefix_lookup = this.prefix_lookup;

	// 	// each prefix that a user wants to add
	// 	for(let s_prefix_id in h_prefixes) {
	// 		let s_prefix_iri = h_prefixes[s_prefix_id];

	// 		// prefix iri indeed reflects existing prefix
	// 		if(h_prefix_lookup[s_prefix_iri]) {
	// 			h_user_prefixes[s_prefix_id] = h_prefix_lookup[s_prefix_iri];
	// 		}
	// 		// prefix iri not an interested prefix
	// 		else {
	// 			console.warn(`not interested in shallow prefix iri "${s_prefix_iri}"`);
	// 		}
	// 	}
	// }

	encode_n3_to_word(s_n3) {
		// iriref
		if('<' === s_n3[0]) {
			// construct iri
			let p_iri = s_n3.slice(1, -1);

			// attempt to compress
			let m_compress = R_COMPRESS.exec(p_iri);

			// cannot be compressed
			if(!m_compress) {
				// use iriref
				return encode_utf_8('\u0002'+p_iri);
			}
			// try finding compressed prefix id
			else {
				// lookup prefix id from prefix lookup
				let s_prefix_id = this.prefix_lookup[m_compress[1]];

				// prefix not exists
				if(!s_prefix_id) {
					// no such node
					return false;
				}
				// found the prefix
				else {
					// construct word using prefix
					return encode_utf_8(s_prefix_id+'\u0001'+m_compress[2]);
				}
			}
		}
		// prefixed name
		else {
			// extract prefix / suffix
			let [s_user_prefix, s_suffix] = s_n3.split(':');

			// lookup dict prefix from mapped user prefix
			let s_prefix_id = this.user_prefixes[s_user_prefix];

			// prefix mapping does not exist
			if(!s_prefix_id) {
				// grab user prefix iri
				let p_prefix_iri = this.user_prefix_iris[s_user_prefix];

				// no such user prefix defined
				if(!p_prefix_iri) {
					throw `no such prefix "${s_user_prefix}"`;
				}

				// reconstruct full iri
				let p_iri = p_prefix_iri+s_suffix;

				// attempt to compress
				let m_compress = R_COMPRESS.exec(p_iri);

				// cannot be compressed
				if(!m_compress) {
					// use iriref
					return encode_utf_8('\u0002'+p_iri);
				}
				// try finding compressed prefix id
				else {
					// lookup prefix id from prefix lookup
					let s_prefix_id = this.prefix_lookup[m_compress[1]];

					// prefix not exists
					if(!s_prefix_id) {
						// no such node
						return false;
					}
					// found the prefix
					else {
						// construct word using prefix
						return encode_utf_8(s_prefix_id+'\u0001'+m_compress[2]);
					}
				}
			}
			// prefix mapping does exist
			else {
				// construct word using prefix
				return encode_utf_8(s_prefix_id+'\u0001'+s_suffix);
			}
		}

		// no such node
		return false;
	}


	word_to_node(ab_word) {
		// ref 0th char
		let x_char = ab_word[0];

		// blank node
		if(3 === x_char) {
			return graphy.blankNode(decode_utf_8(ab_word));
		}
		// named node w/ absolute iri
		else if(2 === x_char) {
			return graphy.namedNode(decode_utf_8(ab_word));
		}
		// named node w/ prefixed name
		else {
			// find prefix token
			let i_prefix_token = ab_word.indexOf(I_PREFIX_TOKEN);

			// decompose prefixed name's word from dictionary
			let s_prefix_id = decode_utf_8(ab_word.slice(0, i_prefix_token));
			let s_suffix = decode_utf_8(ab_word.slice(i_prefix_token+1));

			// produce named node from reconstructed iri
			return graphy.namedNode(this.prefixes[s_prefix_id]+s_suffix);
		}
	}

	word_to_literal(ab_word) {
		// find start of content
		let i_content = ab_word.indexOf(34);

		// extract content
		let ab_content = ab_word.slice(i_content + 1);

		// initialize literal with content
		let k_literal = graphy.literal(
			(ab_content[0] === I_UTF_16_TOKEN)
				? decode_utf_16le(ab_content.slice(1))  // word is utf-16le encoded
				: decode_utf_8(ab_content)  // word is utf-8 encoded
		);

		// determine primer
		let x_primer = ab_word[0];

		// literal has datatype
		if(94 === x_primer) {
			k_literal.datatype = this.word_to_node(ab_word.slice(1, i_content));
		}
		// literal has language tag
		else if(64 === x_primer) {
			k_literal.language = decode_utf_8(ab_word.slice(1, i_content));
		}

		//
		return k_literal;
	}

	set_user_prefixes(h_set_prefixes) {
		// ref maps
		let h_prefix_lookup = this.prefix_lookup;
		let h_user_prefixes = this.user_prefixes;
		let h_user_prefix_iris = this.user_prefix_iris;

		// each new prefix
		for(let s_prefix in h_set_prefixes) {
			let p_iri = h_set_prefixes[s_prefix];

			// exact mapping match
			if(h_prefix_lookup[p_iri]) {
				// set mapping forwards
				h_user_prefix_iris[s_prefix] = p_iri;
				h_user_prefixes[s_prefix] = h_prefix_lookup[p_iri];
			}
			else {
				h_user_prefix_iris[s_prefix] = p_iri;
				console.warn(`The prefix mapping of ${s_prefix}: to <${p_iri}> is not efficient for this dataset`);
			}
		}
	}

	mk_prefix_lookup() {
		// create prefix lookup hash by inversing normal prefix map
		let h_prefix_lookup = this.prefix_lookup = {};
		let h_prefixes = this.prefixes;
		for(let s_prefix_id in h_prefixes) {
			let p_prefix_iri = h_prefixes[s_prefix_id];
			h_prefix_lookup[p_prefix_iri] = s_prefix_id;
		}
	}

	mk_pos() {
		if(this.triples_spo) {
			this.triples_pos = this.triples_spo.shift_left();
		}
		else if(this.triples_osp) {
			this.triples_pos = this.triples_osp.shift_right();
		}
	}

	mk_osp() {
		if(this.triples_pos) {
			this.triples_osp = this.triples_pos.shift_left();
		}
		else if(this.triples_spo) {
			this.triples_osp = this.triples_spo.shift_right();
		}
	}


	upper(s_term_code) {
		switch(s_term_code) {
			case 's': return this.range_s;
			case 'p': return this.range_p;
			case 'o': return this.range_l;
		}
	}

	width(s_term_code) {
		return this.upper(s_term_code) - 1;
	}

	*s_po(i_s) {
		if(!this.triples_spo) throw 'SPO index not built';
		yield* this.triples_spo.each_bc(i_s);
	}

	*p_os(i_p) {
		if(!this.triples_pos) throw 'POS index not built';
		yield* this.triples_pos.each_bc(i_p);
	}

	*o_sp(i_o) {
		if(!this.triples_osp) throw 'OSP index not built';
		yield* this.triples_osp.each_bc(i_o);
	}

	s(i_subject) {
		// dual
		if(i_subject < this.range_d) {
			let ab_word = this.section_d.produce(i_subject);
			return this.word_to_node(ab_word);
		}
		// subject
		else if(i_subject < this.range_s) {
			let ab_word = this.section_s.produce(i_subject);
			return this.word_to_node(ab_word);
		}
		//
		else {
			throw 'invalid subject id: #'+i_subject;
		}
	}

	p(i_predicate) {
		let ab_word = this.section_p.produce(i_predicate);
		
		// ref 0th char
		let x_char = ab_word[0];

		// named node w/ absolute iri
		if(2 === x_char) {
			return graphy.namedNode(decode_utf_8(ab_word));
		}
		// named node w/ prefixed name
		else {
			// find prefix token
			let i_prefix_token = ab_word.indexOf(I_PREFIX_TOKEN);

			// decompose prefixed name's word from dictionary
			let s_prefix_id = decode_utf_8(ab_word.slice(0, i_prefix_token));
			let s_suffix = decode_utf_8(ab_word.slice(i_prefix_token+1));

			// produce named node from reconstructed iri
			return graphy.namedNode(this.prefixes[s_prefix_id]+s_suffix);
		}
	}

	o(i_object) {
		// dual
		if(i_object < this.range_d) {
			let ab_word = this.section_d.produce(i_object);
			return this.word_to_node(ab_word);
		}
		// object
		else if(i_object < this.range_o) {	
			let ab_word = this.section_o.produce(i_object);
			return this.word_to_node(ab_word);
		}
		// literal
		else {
			return this.l(i_object);
		}
	}

	l(i_literal) {
		let ab_word = this.section_l.produce(i_literal);
		return this.word_to_literal(ab_word);
	}

	v(i_vertex, hp_type) {
		if(i_vertex < this.range_d) {
			let ab_word = this.section_d.produce(i_vertex);
			return this.word_to_node(ab_word);
		}
		else if(HP_TYPE_SUBJECT === hp_type) {
			let ab_word = this.section_s.produce(i_vertex);
			return this.word_to_node(ab_word);
		}
		else if(HP_TYPE_OBJECT === hp_type) {
			if(i_vertex < this.range_l) {
				let ab_word = this.section_o.produce(i_vertex);
				return this.word_to_node(ab_word);
			}
			else {
				let ab_word = this.section_l.produce(i_vertex);
				return this.word_to_literal(ab_word);
			}
		}
	}

	triple(i_s, i_p, i_o) {
		return this.s(i_s).value+' '+this.p(i_p).value+' '+this.o(i_o);
	}


	find_s(s_n3) {
		// prep to find word in dict
		@{compress_n3_node('s_n3')}

		// turn string into word
		let ab_word = encode_utf_8(s_word);

		// search for word in duals dict, then subjects dict
		return this.section_d.find(ab_word)
			|| this.section_s.find(ab_word);
	}

	find_p(s_n3) {
		// prep to find word in dict
		@{compress_n3_node('s_n3')}

		// turn string into word
		let ab_word = encode_utf_8(s_word)

		// search for word in predicates dict
		return this.section_p.find(ab_word);
	}

	find_o(s_n3) {
		// prep to find word in dict
		if(s_n3.indexOf('"') === -1) {
			@{compress_n3_node('s_n3')}

			// turn string into word
			let ab_word = encode_utf_8(s_word)

			// search for word in duals dict, then objects dict
			return this.section_d.find(ab_word)
				|| this.section_o.find(ab_word);
		}
		else {
			// encode content
			console.warn('utf-16 not properly tested for');
			let s_content = s_n3.slice(s_n3.indexOf('"'));
			let s_word = s_n3.slice(0, s_n3.indexOf('"'));
			let ab_content = /[^\u0000-\u00ff]/.test(s_content)
				? encode_utf_16le(s_content)  // using utf-16le
				: encode_utf_8(s_content);  // using utf-8

			// join parts into word
			let ab_word = join_buffers(encode_utf_8(s_word), ab_content);
	
			// cache word length
			let n_word = ab_word.length;

			// search for word in literals dict
			return this.section_l.find(ab_word);
		}

		// predicate not found
		return 0;
	}

	// find a node, whether it is a dual, subject or object
	find_n(s_n3) {
		// prep to find word in dict
		@{compress_n3_node('s_n3')}

		// turn string into word
		let ab_word = encode_utf_8(s_word);

		// search for word in duals dict, then subjects dict, then objects
		let i_d = this.section_d.find(ab_word);
		if(i_d) return {
			id: i_d,
			type: this.TYPE_HOP,
		};
		let i_s = this.section_s.find(ab_word);
		if(i_s) return {
			id: i_s,
			type: this.TYPE_SUBJECT,
		};
		let i_o = this.section_o.find(ab_word);
		if(i_o) return {
			id: i_o,
			type: this.TYPE_OBJECT,
		};
	}

	// create new pattern for flat matching
	pattern() {
		return query.pattern(this);
	}

	// 
	path(w_from) {
		return query.path(this, w_from);
	}

	debug_terms() {
		console.log('\n==== subjects ====');
		for(let i_s=this.lower('s'), n_s=this.upper('s'); i_s<n_s; i_s++) {
			console.log(i_s+': '+this.s(i_s).value);
		}

		console.log('\n==== predicates ====');
		for(let i_p=this.lower('p'), n_p=this.upper('p'); i_p<n_p; i_p++) {
			console.log(i_p+': '+this.p(i_p).value);
		}

		console.log('\n==== objects ====');
		for(let i_o=this.lower('o'), n_o=this.upper('o'); i_o<n_o; i_o++) {
			console.log(i_o+': '+this.o(i_o).value);
		}
	}
}




module.exports = LinkedGraph;

