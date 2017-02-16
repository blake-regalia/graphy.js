/* eslint-disable */

@ // import store macros
@include 'store.builder-js'

@{constants()}


@macro compress_iri()
	// attempt to compress
	let m_compress = R_COMPRESS.exec(p_iri);

	// cannot be compressed
	if(!m_compress) {
		// use iriref
		s_word = '\u0002'+p_iri;
	}
	// try finding compressed prefix id
	else {
		// lookup prefix id from prefix lookup
		let s_prefix_id = this.prefix_lookup[m_compress[1]];

		// prefix not exists
		if(!s_prefix_id) {
			// no such node
			s_word = '';
		}
		// found the prefix
		else {
			// construct word using prefix
			s_word = s_prefix_id+'\u0001'+m_compress[2];
		}
	}
@end


@macro compress_n3_node(n3, on_fail)
	let s_word = '';

	// iriref
	if('<' === @{n3}[0]) {
		// construct iri
		let p_iri = @{n3}.slice(1, -1);

		@{compress_iri()}
	}
	// prefixed name
	else {
		// extract prefix / suffix
		let [s_user_prefix, s_suffix] = @{n3}.split(':');

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

			@{compress_iri()}
		}
		// prefix mapping does exist
		else {
			// construct word using prefix
			s_word = s_prefix_id+'\u0001'+s_suffix;
		}
	}

	// no such node
	if(!s_word) 
	@if on_fail
		@{on_fail};
	@else
		return 0;
	@end
@end


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
const pattern = require('./pattern.js');



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
			registry: {},

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
	enter() {
		return pattern.entrance(this);
	}

	// 
	from(w_from) {
		return pattern.from(this, w_from);
	}


	register(s_alias, h_loader) {
		if('string' !== typeof s_alias) throw `register alias must be a string; instead receieved a(n) '${s_alias? s_alias.constructor.name: s_alias}'`;
		if(this.registry[s_alias]) throw `a plugin has already been registered to this graph with the alias '${s_alias}'`;

		let s_namespace = h_loader.namespace;
		if('string' !== typeof s_namespace) throw `plugin must have a 'namespace' property that denotes its URI`;
		// if(h_plugins_repository[s_namespace]) throw `a plugin has already claimed the namespace '${s_namespace}' within this graphy instance`;

		// create instance to be sent to each method
		let k_instance = h_loader.instantiate(this);

		// incoming
		if(h_loader.incoming) {
			let h_incoming = h_loader.incoming;

			// find and submit all terms plugin wants
			let c_terms_interest = 0;
			let c_terms_loaded = 0;

			// asynchronous
			let b_async = false;

			// plugin wants literals
			if(h_incoming.literals) {
				let h_specs = h_incoming.literals;

				// plugin wants literals of certain datatype(s)
				if(h_specs.datatypes) {
					let h_datatypes = h_specs.datatypes;
					for(let s_datatype in h_datatypes) {
						let f_handler = h_datatypes[s_datatype];
						@{compress_n3_node('s_datatype', 'continue')}

						// find all literals that have the given datatype
						let ab_prefix = encode_utf_8('^'+s_word+'"');
						let i_lo = this.section_l.find_prefix_low(ab_prefix);

						// at least one term has the given datatype
						if(i_lo) {
							let i_hi = this.section_l.find_prefix_high(ab_prefix);

							// cycle through all literals of this datatype
							for(let i_literal=i_lo; i_literal<=i_hi; i_literal++) {
								c_terms_interest += 1;

								// send each term to designated incoming handler
								f_handler.apply(k_instance, [this.l(i_literal), i_literal, (e_handle) => {
									if(e_handle) console.warn(e_handle);
									c_terms_loaded += 1;

									// this was final async term to be indexed
									if(b_async && c_terms_loaded === c_terms_interest) {
										if('function' === typeof h_incoming.finish) {
											h_incoming.finish(k_instance);
										}
									}
								}]);
							}
						}
					}
				}

				// plugin wants literals of certain language(s)
				let h_languages = h_specs.languages;
				if(h_languages) {
					for(let s_language in h_languages) {
						let f_handler = h_languages[s_language];

						// find all literals that have the given language
						let ab_prefix = encode_utf_8('@'+s_language.toLowerCase()+'"');
						let i_lo = this.section_l.find_prefix_low(ab_prefix);

						// at least one term has the given language
						if(i_lo) {
							let i_hi = this.section_l.find_prefix_high(ab_prefix);

							// cycle through all literals of this language
							for(let i_literal=i_lo; i_literal<=i_hi; i_literal++) {
								c_terms_interest += 1;

								// send each term to designated incoming handler
								f_handler.apply(k_instance, [this.l(i_literal), i_literal, (e_handle) => {
									if(e_handle) console.warn(e_handle);
									c_terms_loaded += 1;

									// this was final async term to be indexed
									if(b_async && c_terms_loaded === c_terms_interest) {
										if('function' === typeof h_incoming.finish) {
											h_incoming.finish(k_instance);
										}
									}
								}]);
							}
						}
					}
				}
			}

			// plugin wants sinks
			if(h_incoming.sinks) {
				let h_specs = h_incoming.sinks;


			}

			// all terms were indexed synchronously
			if(c_terms_loaded === c_terms_interest) {
				if('function' === typeof h_incoming.finish) {
					h_incoming.finish(k_instance);
				}
			}
			// at least one term is asynchronous
			else {
				b_async = true;
			}
		}

		//
		if(h_loader.ranges) {
			let h_ranges = h_loader.ranges;

			if(h_ranges.literals) {
				let h_literals = h_ranges.literals;

				if(h_literals.languages) {
					let h_specs = h_literals.languages;
					let f_add = h_specs.add;
					h_specs.values.forEach((s_language) => {
						// find the range of literals that have the given language
						let ab_prefix = encode_utf_8('@'+s_language.toLowerCase()+'"');
						let i_lo = this.section_l.find_prefix_low(ab_prefix);

						// no literals with given language
						if(!i_lo) return;

						// find upper bound
						let i_hi = this.section_l.find_prefix_high(ab_prefix);

						// call add function
						f_add(k_instance, s_language, i_lo, i_hi);
					});
				}

				if(h_literals.datatypes) {
					let h_specs = h_literals.datatypes;
					let f_add = h_specs.add;
					h_specs.values.forEach((s_datatype) => {
						@{compress_n3_node('s_datatype', 'return')}

						// find all literals that have the given datatype
						let ab_prefix = encode_utf_8('^'+s_word+'"');
						let i_lo = this.section_l.find_prefix_low(ab_prefix);

						// no literals with given language
						if(!i_lo) return;

						// find upper bound
						let i_hi = this.section_l.find_prefix_high(ab_prefix);

						// call add function
						f_add(k_instance, s_language, i_lo, i_hi);
					});
				}
			}
		}


		// sort check methods from find methods
		let h_methods = h_loader.relations;
		let h_check_methods = {};
		let h_find_methods = {};

		for(let s_method in h_methods) {
			let h_method = h_methods[s_method];

			// method missing check/find function
			if('function' !== typeof h_method.check) throw `plugin missing 'check' function for '${s_method}' method`;
			if('function' !== typeof h_method.find) throw `plugin missing 'find' function for '${s_method}' method`;

			// sort functions
			h_check_methods[s_method] = h_method.check;
			h_find_methods[s_method] = h_method.find;
		}

		//
		this.registry[s_alias] = new ActivePlugin({
			instance: k_instance,
			alias: s_alias,
			check_methods: h_check_methods,
			find_methods: h_find_methods,
		});
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



class ActivePlugin {
	constructor(h_this) {
		Object.assign(this, h_this);
	}

	action(f_action, h_methods, i_lo=0, i_hi=0) {
		let k_action = f_action(new DataActionBuilder());

		// method did not construct data action
		if(!(k_action instanceof DataActionBuilder)) {
			throw 'method did not return a valid data action';
		}

		// what to give back to the iterator
		let h_handle = {};

		// save
		if(k_action.save_name) {
			h_handle.save = k_action.save_name;
		}

		// perform relation
		if(k_action.relate) {
			let h_relate = k_action.relate;
			let s_relation = h_relate.relation;

			// relation not exists
			if(!(s_relation in h_methods)) throw `'${this.alias}' plugin has no relation called '${s_relation}'; <${this.iri}>`;

			// return method function
			let f_method = h_methods[s_relation];
			let a_args = h_relate.args;

			// find method
			if(i_lo) {
				let h_found = f_method(this.instance, ...a_args, i_lo, i_hi);

				// found range
				if(h_found.range) {
					let h_range = h_found.range;

					// trim low and high to range bounds
					h_handle.range = {
						low: Math.max(i_lo, h_range.low),
						high: Math.min(i_hi, h_range.high),
					};
				}
				// found list of ids
				else if(h_found.ids) {
					let a_founds_ids = h_found.ids;
					let n_found_ids = a_founds_ids.length;

					// assume sorted list, first and last fall within range
					if(a_founds_ids[0] >= i_lo && a_founds_ids[n_found_ids] <= i_hi) {
						h_handle.ids = a_founds_ids;
					}
					// out of bounds
					else {
						let a_ids = h_handle.ids = [];
						for(let i_found_id=0; i_found_id<n_found_ids; i_found_id++) {
							let i_id = a_founds_ids[i_found_id];
							if(i_id >= i_lo && i_id <= i_hi) a_ids.push(i_id);
						}
					}
				}
				// found single id
				else if(h_found.id) {
					let i_id = h_found.id;

					// id falls out of bounds
					if(i_id < i_lo || i_id > i_hi) {
						h_handle.ids = [];
					}
					// id within bounds
					else {
						h_handle.id = h_found.id;
					}
				}
			}
			// check method
			else {
				h_handle.evaluate = (i_entity) => f_method(this.instance, i_entity, ...a_args);
			}
		}

		return h_handle;
	}

	checker(f_action) {
		return this.action(f_action, this.check_methods);
	}

	find(f_action, i_lo, i_hi) {
		return this.action(f_action, this.find_methods, i_lo, i_hi);
	}
}

class DataActionBuilder {
	save(s_name) {
		this.save_name = s_name;
		return this;
	}

	test(s_relation, ...a_args) {
		this.relate = {
			relation: s_relation,
			args: a_args,
		};
		return this;
	}
}



module.exports = LinkedGraph;

