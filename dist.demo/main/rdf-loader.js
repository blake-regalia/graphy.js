/* eslint-disable */
const bus = require('./bus');
const AB_ZERO = Buffer.from([0x00]);
const AB_PREFIX_SEPARATOR_TOKEN = Buffer.from([0x01]);
const AB_ABSOLUTE_IRI_TOKEN = Buffer.from([0x02]);
const AB_BLANK_NODE_TOKEN = Buffer.from([0x03]);
const AB_UTF_16_TOKEN = Buffer.from([0x04]);
const AB_DATATYPE_TOKEN = Buffer.from('^', 'utf-8');
const AB_LANGUAGE_TOKEN = Buffer.from('@', 'utf-8');
const AB_CONTENTS_TOKEN = Buffer.from('"', 'utf-8');
const N_DEFAULT_ALLOCATION_SIZE = 64 * 1024; // 64 KiB
const X_SHORT_LIST = 0x80000000;
const X_UNSHORT_INT = 0x7fffffff;
const encode_utf_8 = (s_chunk) => Buffer.from(s_chunk, 'utf-8');
const encode_utf_16 = (s_chunk) => {
	// encode chunk as utf-16le
	let ab_chunk = Buffer.from(s_chunk, 'utf-16le');
	// prefix buffer w/ utf-16 token
	return Buffer.concat([AB_UTF_16_TOKEN, ab_chunk], ab_chunk.length + 1);
};
const commit = (ab_src, n_length, ab_dest, i_write) => {
	let n_copied = ab_src.copy(ab_dest, i_write);
	let i_read = n_copied;
	while (i_read < n_length) {
		i_write += n_copied;
		let ab_expand = Buffer.alloc(ab_dest.length + N_DEFAULT_ALLOCATION_SIZE);
		ab_dest.copy(ab_expand);
		ab_dest = ab_expand;
		n_length -= n_copied;
		n_copied = ab_src.copy(ab_dest, i_write, i_read);
		i_read += n_copied;
	}
	return ab_dest;
};
const F_SORT_BUFFER = (h_a, h_b) => {
	let ab_a = h_a.buffer,
		ab_b = h_b.buffer;
	let nl_a = ab_a.length,
		nl_b = ab_b.length;
	let n = Math.min(nl_a, nl_b);
	for (let i = 0; i < n; i++) {
		let x_a = ab_a[i];
		let x_b = ab_b[i];
		if (x_a !== x_b) return x_a < x_b ? -1 : 1;
	}
	return nl_a < nl_b ?
		-1 :
		(nl_a > nl_b ?
			1 : 0);
};
const F_SORT_INDEX = (h_a, h_b) => {
	return h_a.index < h_b.index ? -1 : (h_a.index > h_b.index ? 1 : 0);
};
const F_SORT_SHORT_LISTED_INDEX = (h_a, h_b) => {
	return (X_UNSHORT_INT & h_a.index) < (X_UNSHORT_INT & h_b.index) ? -1 : 1;
};
const serialize_fc_dict = (a_words, n_words, n_max_word_length, n_block_size, f_progress) => {
	// prep dict buffer and ref list
	let ab_dict = Buffer.allocUnsafe(N_DEFAULT_ALLOCATION_SIZE);
	let a_ref = new Array(Math.ceil(n_words / n_block_size) + 1);
	a_ref[0] = 0;
	// position in dict where to find each block #
	let i_write = 0;
	// block index ptr
	let i_block = 1;
	// dict src index
	let i_read = 0;
	// apply front-coding
	let i_word = 0;
	while (i_word < n_words) {
		// encode first word fully
		let ab_word = a_words[i_read++].buffer;
		let nl_word = ab_word.length;
		ab_dict = commit(ab_word, nl_word, ab_dict, i_write);
		i_write += nl_word;
		// null terminate
		ab_dict = commit(AB_ZERO, 1, ab_dict, i_write++);
		// maximum index of block range
		let i_top = Math.min(n_words, i_word + n_block_size);
		// front-code remainder of block
		while (++i_word < i_top) {
			// ref word to be coded
			let ab_test = a_words[i_read++].buffer;
			// prep to count how many chars to share
			let c_shared = 0;
			// set upper limit of word comparison length
			let i_limit = Math.min(ab_test.length, nl_word);
			// search until there is a difference
			do {
				if (ab_test[c_shared] !== ab_word[c_shared]) break;
			} while (++c_shared < i_limit);
			// encode shared chars as vbyte
			let ab_shared = bus.encode_pint(c_shared);
			let nx_shared = ab_shared.length;
			// write to dict
			ab_dict = commit(ab_shared, nx_shared, ab_dict, i_write);
			i_write += nx_shared;
			// compute remaining number of bytes for code
			nl_word = ab_test.length;
			let nl_code = nl_word - c_shared;
			// encode code byte count as vbyte
			let ab_bytes = bus.encode_pint(nl_code);
			let nl_bytes = ab_bytes.length;
			// write to dict
			ab_dict = commit(ab_bytes, nl_bytes, ab_dict, i_write);
			i_write += nl_bytes;
			// commit coded word to dict
			let ab_code = ab_test.slice(c_shared);
			ab_dict = commit(ab_code, nl_code, ab_dict, i_write);
			i_write += nl_code;
			// update new word
			ab_word = ab_test;
		}
		// save position of block head to ref
		a_ref[i_block++] = i_write;
		if (i_word % 64 === 0) {
			f_progress(i_word / n_words);
			// every so often, trim down dict src
			if (i_word % 4096 === 0) {
				a_words.splice(0, i_read);
				i_read = 0;
			}
		}
	}
	// final update
	f_progress(1);
	// only keep what was used
	ab_dict = ab_dict.slice(0, i_write);
	// convert ref list to typed array
	let n_refs = a_ref.length;
	let x_max_ref = a_ref[n_refs - 1];
	let at_ref = x_max_ref <= 0xff ?
		new Uint8Array(n_refs) :
		(x_max_ref <= 0xffff ?
			new Uint16Array(n_refs) :
			(x_max_ref <= 0xffffffff ?
				new Uint32Array(n_refs) :
				new Float64Array(n_refs)))
	at_ref.set(a_ref);
	return {
		dict: ab_dict,
		ref: at_ref,
	};
};
/**
 * imports
 **/
// native
const fs = require('fs');
const stream = require('stream');
// 
const async = require('async');
const LinkedGraph = require('../store/lazy-linked-graph.js');
/**
 * constants:
 **/
// for creating new prefixes
const R_COMPRESS = /^(.*?)([^/#]*)$/;
// for obtaining the next adjacency item
const R_NEXT_ITEM = /([^\u0002]+)\u0002/y;
const R_NEXT_IRI = /(?:<([^\u0002]*)>|([^\u0002])+:([^\u0002]*))\u0002/y;
// platform is little endian
const B_IS_LITTLE_ENDIAN = (function() {
	let d_buffer = new ArrayBuffer(2);
	new DataView(d_buffer).setInt16(0, 256, true);
	return new Int16Array(d_buffer)[0] === 256;
})();
/**
 * class:
 **/
class RDF_Loader {
	constructor(p_file, h_config) {
		// new graph
		const k_graph = new LinkedGraph();
		// number of triples in between progress events
		let n_progress_spacing = h_config.progress_spacing || (h_config.progress ? 1e3 : 0);
		// hash of subject/object nodes and size
		let h_nodes = {};
		// hash of predicate nodes and size
		let h_predicates = {};
		// hash of literals and size
		let h_literals = {};
		let f_progress = function() {};
		// start index (0x00 = NULL, 0x01 = prefix separator, 0x02 = absolute iri, 0x03 = blank node, 0x04 = utf-16 token)
		let i_prefix_id = 0x05;
		// 1 to 2 character id generator (limited to ~4.294 billion unique ids)
		function next_prefix_id() {
			// exceeded single character range
			if (0x10000 === i_prefix_id) {
				// reassign id generator
				next_prefix_id = function() {
					// force lo bits to skip 0, 1, 2, 3, and 4
					let x_lo = i_prefix_id % 0xffff;
					while (x_lo < 4) x_lo = (i_prefix_id++) % 0xffff;
					// start hi bits off at 5 to avoid collision w/ 0, 1, 2, 3 and 4
					return Buffer.from(String.fromCharCode.apply(null, [(i_prefix_id >> 0x10) + 4, x_lo]));
				};
				// return next id from new generator
				return next_prefix_id();
			}
			// single character generator initially
			return Buffer.from(String.fromCharCode.apply(null, [i_prefix_id++]));
		}
		// start index (0x00 = NULL, 0x01 = prefix separator, 0x02 = absolute iri, 0x03 = blank node, 0x04 = utf-16 token)
		let i_label_id = 0x05;
		// 1 to 2 character id generator (limited to ~4.294 billion unique ids)
		function next_label_id() {
			// exceeded single character range
			if (0x10000 === i_label_id) {
				// reassign id generator
				next_label_id = function() {
					// force lo bits to skip 0, 1, 2, 3, and 4
					let x_lo = i_label_id % 0xffff;
					while (x_lo < 4) x_lo = (i_label_id++) % 0xffff;
					// start hi bits off at 5 to avoid collision w/ 0, 1, 2, 3 and 4
					return Buffer.from(String.fromCharCode.apply(null, [(i_label_id >> 0x10) + 4, x_lo]));
				};
				// return next id from new generator
				return next_label_id();
			}
			// single character generator initially
			return Buffer.from(String.fromCharCode.apply(null, [i_label_id++]));
		}
		//
		let h_long_predicates = {};
		// prefix lookup mappings [prefix_iri] => dict_prefix_id
		let h_prefix_lookup = k_graph.prefix_lookup = {};
		// label lookup mappings [label_name] => dict_label_id
		let h_label_lookup = k_graph.h_label_lookup = {};
		// user prefix mappins [user_prefix_id] => dict_prefix_id
		let h_user_prefixes = k_graph.user_prefixes = {};
		// prefix candidates [prefix_iri] => c_uses
		let h_prefix_candidates = {};
		// define user prefixes
		let h_inject_prefixes = h_config.prefixes;
		if (h_inject_prefixes) {
			for (let s_prefix_id in h_inject_prefixes) {
				// store mappings: [user_prefix_id] => dict_prefix_id, and [prefix_iri] => dict_prefix_id
				h_user_prefixes[s_prefix_id] = h_prefix_lookup[h_inject_prefixes[s_prefix_id]] = next_prefix_id();
			}
		}
		// count triples so we can make callbacks
		let c_triples = 0;
		let c_triples_file = 0;
		let c_triples_diff = 0;
		// everytime
		let c_distinct_sp = 0;
		//
		let c_nodes = 0;
		let c_predicates = 0;
		let c_literals = 0;
		// execute stages in series
		async.series([
			// stage 1
			(fk_task) => h_config.parse(fs.createReadStream(p_file), {
				ready() {
					console.log('\nstage 1: building prefix map...');
					if (h_config.progress) f_progress = h_config.progress('parse');
				},
				// end of chunk
				progress(c_bytes_read) {
					// time for a progress update
					f_progress(c_triples_diff, c_bytes_read);
					// reset triple counter
					// c_triples_total += c_triples_diff;
					c_triples_diff = 0;
				},
				// each triple
				data(h_triple) {
					// progress callback
					c_triples_diff += 1;
					c_triples_file += 1;
					// ref all positions of triple
					let h_subject = h_triple.subject;
					let h_predicate = h_triple.predicate;
					let h_object = h_triple.object;
					// subject is named node
					if (h_subject.isNamedNode) {
						// ref subject iri
						let p_subject_iri = h_subject.value;
						// determine actual best prefix
						let m_compress_subject = R_COMPRESS.exec(p_subject_iri);
						if (m_compress_subject) {
							// destruct prefix fragments
							let [, p_compress_prefix, s_compress_suffix] = m_compress_subject;
							// store candidate
							if (h_prefix_candidates[p_compress_prefix]) h_prefix_candidates[p_compress_prefix] += 1;
							else h_prefix_candidates[p_compress_prefix] = 1;
						}
					}
					// subject is blank node
					else {
						// ref subject label
						let s_label = h_subject.value;
						h_label_lookup[s_label] = h_label_lookup[s_label] || next_label_id();
					}
					// predicate is always named node
					// ref predicate iri
					let p_predicate_iri = h_predicate.value;
					// determine actual best prefix
					let m_compress_predicate = R_COMPRESS.exec(p_predicate_iri);
					if (m_compress_predicate) {
						// destruct prefix fragments
						let [, p_compress_prefix, s_compress_suffix] = m_compress_predicate;
						// store candidate
						if (h_prefix_candidates[p_compress_prefix]) h_prefix_candidates[p_compress_prefix] += 1;
						else h_prefix_candidates[p_compress_prefix] = 1;
					}
					// object is literal
					if (h_object.isLiteral) {
						// ... a datatyped literal
						if (h_object.hasOwnProperty('datatype')) {
							// ref datatype named node
							let h_datatype = h_object.datatype;
							// datatype is named node
							// ref datatype iri
							let p_datatype_iri = h_datatype.value;
							// determine actual best prefix
							let m_compress_datatype = R_COMPRESS.exec(p_datatype_iri);
							if (m_compress_datatype) {
								// destruct prefix fragments
								let [, p_compress_prefix, s_compress_suffix] = m_compress_datatype;
								// store candidate
								if (h_prefix_candidates[p_compress_prefix]) h_prefix_candidates[p_compress_prefix] += 1;
								else h_prefix_candidates[p_compress_prefix] = 1;
							}
						}
					}
					// object is named node
					else if (h_object.isNamedNode) {
						// ref object iri
						let p_object_iri = h_object.value;
						// determine actual best prefix
						let m_compress_object = R_COMPRESS.exec(p_object_iri);
						if (m_compress_object) {
							// destruct prefix fragments
							let [, p_compress_prefix, s_compress_suffix] = m_compress_object;
							// store candidate
							if (h_prefix_candidates[p_compress_prefix]) h_prefix_candidates[p_compress_prefix] += 1;
							else h_prefix_candidates[p_compress_prefix] = 1;
						}
					}
					// object is blank node
					else {
						// ref object label
						let s_label = h_object.value;
						h_label_lookup[s_label] = h_label_lookup[s_label] || next_label_id();
					}
				},
				// finished scanning input
				end(d_transform) {
					// update count of how many triples there are in total
					// c_triples_total += c_triples_diff;
					c_triples_diff = 0;
					// scan auto-gen prefixes to reduce prefix map size
					for (let p_prefix_iri in h_prefix_candidates) {
						// prefix used more than once
						if (h_prefix_candidates[p_prefix_iri] > 1) {
							// create its prefix id and save it to prefix lookup
							h_prefix_lookup[p_prefix_iri] = next_prefix_id();
						}
					}
					// remove prefix candidates
					h_prefix_candidates = null;
					setImmediate(fk_task);
				},
			}),
			// stage 2
			(fk_task) => fs.createReadStream(p_file).pipe(h_config.parse({
				ready() {
					console.log('\nstage 2: compressing terms...');
					if (h_config.progress) f_progress = h_config.progress('parse');
				},
				// end of chunk
				progress(c_bytes_read) {
					// time for a progress update
					f_progress(c_triples_diff, c_bytes_read);
					// reset triple counter
					c_triples_diff = 0;
				},
				// each triple
				data(h_triple) {
					c_triples_diff += 1;
					// ref all positions of triple
					let h_subject = h_triple.subject;
					let h_predicate = h_triple.predicate;
					let h_object = h_triple.object;
					// prep pairs object
					let h_pairs;
					// canonicalize subject
					let s_subject_id = h_subject.toCanonical();
					// first encounter of subject
					let h_subject_node = h_nodes[s_subject_id];
					if (!h_subject_node) {
						// prep compress subject buffer
						let ab_subject;
						// subject is named node
						if (h_subject.isNamedNode) {
							let p_subject_iri = h_subject.value;
							// attempt to find its prefix via lookup
							let m_compress = R_COMPRESS.exec(p_subject_iri);
							if (m_compress) {
								let [, p_compress_prefix, s_compress_suffix] = m_compress;
								// direct mapping for compressed prefix exists
								let ab_prefix = h_prefix_lookup[p_compress_prefix];
								if (ab_prefix) {
									// always encode iris in utf-8
									let ab_suffix = encode_utf_8(s_compress_suffix);
									// set subject's buffer
									ab_subject = Buffer.concat([ab_prefix, AB_PREFIX_SEPARATOR_TOKEN, ab_suffix], ab_prefix.length + 1 + ab_suffix.length);
								}
								// naively compressed prefix is not used elsewhere in document
								else {
									// search for an established prefix that can support this iri
									let p_best_prefix_iri;
									let n_best_prefix_len = Infinity;
									for (let p_test_prefix_iri in h_prefix_lookup) {
										if (p_subject_iri.startsWith(p_test_prefix_iri) && p_test_prefix_iri.length > n_best_prefix_len) {
											p_best_prefix_iri = p_test_prefix_iri;
											n_best_prefix_len = p_test_prefix_iri.length;
										}
									}
									// found one!
									if (p_best_prefix_iri) {
										// use that prefix instead
										let ab_prefix = h_prefix_lookup[p_best_prefix_iri];
										// always encode iris in utf-8
										let ab_suffix = encode_utf_8(p_subject_iri.slice(n_best_prefix_len));
										// set subject's buffer
										ab_subject = Buffer.concat([ab_prefix, AB_PREFIX_SEPARATOR_TOKEN, ab_suffix], ab_prefix.length + 1 + ab_suffix.length);
									}
									// no usable prefix was found; use full iri
									else {
										// always encode iris in utf-8
										let ab_iri = encode_utf_8(p_subject_iri);
										// set subject's buffer
										ab_subject = Buffer.concat([AB_ABSOLUTE_IRI_TOKEN, ab_iri], 1 + ab_iri.length);
									}
								}
							}
							// cannot be compressed, use full iri
							else {
								// always encode iris in utf-8
								let ab_iri = encode_utf_8(p_subject_iri);
								// set subject's buffer
								ab_subject = Buffer.concat([AB_ABSOLUTE_IRI_TOKEN, ab_iri], 1 + ab_iri.length);
							}
						}
						// subject is blank node
						else {
							let s_label = h_subject.value;
							let ab_blank_node_id = h_label_lookup[s_label];
							// set subject's buffer
							ab_subject = Buffer.concat([AB_BLANK_NODE_TOKEN, ab_blank_node_id], 1 + ab_blank_node_id.length);
						}
						// make pairs object
						h_pairs = {};
						// make subject node
						h_subject_node = {
							buffer: ab_subject,
							temp_index: c_nodes++,
							types: 1,
							pairs: h_pairs,
						};
						// save subject node to node lookup
						h_nodes[s_subject_id] = h_subject_node;
					}
					// subject exists
					else {
						// update fact that node is also subject
						h_subject_node.types |= 1;
						// and set pairs if not already exist
						h_pairs = h_subject_node.pairs = h_subject_node.pairs || {};
					}
					// canonicalize predicate
					let s_predicate_id = h_predicate.toCanonical();
					// temporary predicate id
					let i_predicate_temp = 0;
					// first encounter of predicate
					let h_predicate_node = h_predicates[s_predicate_id];
					if (!h_predicate_node) {
						// prep compress predicate buffer
						let ab_predicate;
						// predicate is always named node
						let p_predicate_iri = h_predicate.value;
						// attempt to find its prefix via lookup
						let m_compress = R_COMPRESS.exec(p_predicate_iri);
						if (m_compress) {
							let [, p_compress_prefix, s_compress_suffix] = m_compress;
							// direct mapping for compressed prefix exists
							let ab_prefix = h_prefix_lookup[p_compress_prefix];
							if (ab_prefix) {
								// always encode iris in utf-8
								let ab_suffix = encode_utf_8(s_compress_suffix);
								// set predicate's buffer
								ab_predicate = Buffer.concat([ab_prefix, AB_PREFIX_SEPARATOR_TOKEN, ab_suffix], ab_prefix.length + 1 + ab_suffix.length);
							}
							// naively compressed prefix is not used elsewhere in document
							else {
								// search for an established prefix that can support this iri
								let p_best_prefix_iri;
								let n_best_prefix_len = Infinity;
								for (let p_test_prefix_iri in h_prefix_lookup) {
									if (p_predicate_iri.startsWith(p_test_prefix_iri) && p_test_prefix_iri.length > n_best_prefix_len) {
										p_best_prefix_iri = p_test_prefix_iri;
										n_best_prefix_len = p_test_prefix_iri.length;
									}
								}
								// found one!
								if (p_best_prefix_iri) {
									// use that prefix instead
									let ab_prefix = h_prefix_lookup[p_best_prefix_iri];
									// always encode iris in utf-8
									let ab_suffix = encode_utf_8(p_predicate_iri.slice(n_best_prefix_len));
									// set predicate's buffer
									ab_predicate = Buffer.concat([ab_prefix, AB_PREFIX_SEPARATOR_TOKEN, ab_suffix], ab_prefix.length + 1 + ab_suffix.length);
								}
								// no usable prefix was found; use full iri
								else {
									// always encode iris in utf-8
									let ab_iri = encode_utf_8(p_predicate_iri);
									// set predicate's buffer
									ab_predicate = Buffer.concat([AB_ABSOLUTE_IRI_TOKEN, ab_iri], 1 + ab_iri.length);
								}
							}
						}
						// cannot be compressed, use full iri
						else {
							// always encode iris in utf-8
							let ab_iri = encode_utf_8(p_predicate_iri);
							// set predicate's buffer
							ab_predicate = Buffer.concat([AB_ABSOLUTE_IRI_TOKEN, ab_iri], 1 + ab_iri.length);
						}
						// assign next int value
						i_predicate_temp = c_predicates++;
						// create predicate node
						h_predicate_node = {
							buffer: ab_predicate,
							temp_index: i_predicate_temp,
						};
						// save predicate node
						h_predicates[s_predicate_id] = h_predicate_node;
					} else {
						// fetch temp index
						i_predicate_temp = h_predicate_node.temp_index;
					}
					// ref/create adjacency list and update count of distinct sp pairs
					let h_adj_lists = h_pairs[i_predicate_temp] = h_pairs[i_predicate_temp] ||
						(c_distinct_sp++, {
							l: [],
							n: [],
							lh: {},
							nh: {}
						});
					// canonicalize object
					let s_object_id = h_object.toCanonical();
					// object is literal
					if (h_object.isLiteral) {
						let h_object_literal = h_literals[s_object_id];
						let i_literal_temp = 0;
						// first encounter of object literal
						if (!h_object_literal) {
							// prep compress object buffer
							let ab_object;
							// encode contents of literal
							let s_contents = h_object.value;
							let ab_contents;
							// find out-of-bound characters
							let a_oob_matches = s_contents.match(/[^\u0000-\u007f]/g);
							if (a_oob_matches) {
								// number of out-of-bound characters
								let n_oobs = a_oob_matches.length;
								// estimate utf8 length (add weighted average probability of exceeding 2 bytes)
								let n_utf8_len = s_contents.length + (n_oobs * 1.9395);
								// estimate utf16 length (add weighted average probability of exceeding 2 bytes)
								let n_utf16_len = (s_contents.length * 2) + (n_oobs * 1.8858);
								// encode in whichever probably saves more space
								ab_contents = n_utf8_len <= n_utf16_len ? encode_utf_8(s_contents) : encode_utf_16(s_contents);
							}
							// all characters can be encoded in utf8
							else {
								ab_contents = encode_utf_8(s_contents);
							}
							// literal is languaged
							if (h_object.hasOwnProperty('language')) {
								// always encode lang tag in utf-8
								let ab_language = encode_utf_8(h_object.language);
								// create object from language buffer and contents
								ab_object = Buffer.concat([AB_LANGUAGE_TOKEN, ab_language, AB_CONTENTS_TOKEN, ab_contents], 1 + ab_language.length + 1 + ab_contents.length);
							}
							// literal is datatyped
							else if (h_object.hasOwnProperty('datatype')) {
								let h_datatype = h_object.datatype;
								// prep datatype buffer
								let ab_datatype;
								// datatype is named node
								let p_datatype_iri = h_datatype.value;
								// attempt to find its prefix via lookup
								let m_compress = R_COMPRESS.exec(p_datatype_iri);
								if (m_compress) {
									let [, p_compress_prefix, s_compress_suffix] = m_compress;
									// direct mapping for compressed prefix exists
									let ab_prefix = h_prefix_lookup[p_compress_prefix];
									if (ab_prefix) {
										// always encode iris in utf-8
										let ab_suffix = encode_utf_8(s_compress_suffix);
										// set datatype's buffer
										ab_datatype = Buffer.concat([ab_prefix, AB_PREFIX_SEPARATOR_TOKEN, ab_suffix], ab_prefix.length + 1 + ab_suffix.length);
									}
									// naively compressed prefix is not used elsewhere in document
									else {
										// search for an established prefix that can support this iri
										let p_best_prefix_iri;
										let n_best_prefix_len = Infinity;
										for (let p_test_prefix_iri in h_prefix_lookup) {
											if (p_datatype_iri.startsWith(p_test_prefix_iri) && p_test_prefix_iri.length > n_best_prefix_len) {
												p_best_prefix_iri = p_test_prefix_iri;
												n_best_prefix_len = p_test_prefix_iri.length;
											}
										}
										// found one!
										if (p_best_prefix_iri) {
											// use that prefix instead
											let ab_prefix = h_prefix_lookup[p_best_prefix_iri];
											// always encode iris in utf-8
											let ab_suffix = encode_utf_8(p_datatype_iri.slice(n_best_prefix_len));
											// set datatype's buffer
											ab_datatype = Buffer.concat([ab_prefix, AB_PREFIX_SEPARATOR_TOKEN, ab_suffix], ab_prefix.length + 1 + ab_suffix.length);
										}
										// no usable prefix was found; use full iri
										else {
											// always encode iris in utf-8
											let ab_iri = encode_utf_8(p_datatype_iri);
											// set datatype's buffer
											ab_datatype = Buffer.concat([AB_ABSOLUTE_IRI_TOKEN, ab_iri], 1 + ab_iri.length);
										}
									}
								}
								// cannot be compressed, use full iri
								else {
									// always encode iris in utf-8
									let ab_iri = encode_utf_8(p_datatype_iri);
									// set datatype's buffer
									ab_datatype = Buffer.concat([AB_ABSOLUTE_IRI_TOKEN, ab_iri], 1 + ab_iri.length);
								}
								// create object from datatype buffer and contents
								ab_object = Buffer.concat([AB_DATATYPE_TOKEN, ab_datatype, AB_CONTENTS_TOKEN, ab_contents], 1 + ab_datatype.length + 1 + ab_contents.length);
							}
							// literal is plain
							else {
								ab_object = Buffer.concat([AB_CONTENTS_TOKEN, ab_contents], 1 + ab_contents.length);
							}
							// create temp index
							i_literal_temp = c_literals++;
							// create literal
							h_object_literal = {
								buffer: ab_object,
								temp_index: i_literal_temp,
							};
							// save literal
							h_literals[s_object_id] = h_object_literal;
						} else {
							// fetch temp index
							i_literal_temp = h_object_literal.temp_index;
						}
						//
						let h_lh = h_adj_lists.lh;
						// duplicate triple; exit
						if (i_literal_temp in h_lh) {
							console.warn(`encountered duplicate triple ${s_subject_id} ${s_predicate_id} ${s_object_id}`);
							return;
						}
						// unique triple
						h_lh[i_literal_temp] = 1;
						// count
						c_triples += 1;
						// push literal to adjacency list
						h_adj_lists.l.push(h_object_literal);
					}
					// object is node
					else {
						let h_object_node = h_nodes[s_object_id];
						let i_node_temp = 0;
						// first encounter of object node
						if (!h_object_node) {
							// prep compress object buffer
							let ab_object;
							// object is a named node
							if (h_object.isNamedNode) {
								let p_object_iri = h_object.value;
								// attempt to find its prefix via lookup
								let m_compress = R_COMPRESS.exec(p_object_iri);
								if (m_compress) {
									let [, p_compress_prefix, s_compress_suffix] = m_compress;
									// direct mapping for compressed prefix exists
									let ab_prefix = h_prefix_lookup[p_compress_prefix];
									if (ab_prefix) {
										// always encode iris in utf-8
										let ab_suffix = encode_utf_8(s_compress_suffix);
										// set object's buffer
										ab_object = Buffer.concat([ab_prefix, AB_PREFIX_SEPARATOR_TOKEN, ab_suffix], ab_prefix.length + 1 + ab_suffix.length);
									}
									// naively compressed prefix is not used elsewhere in document
									else {
										// search for an established prefix that can support this iri
										let p_best_prefix_iri;
										let n_best_prefix_len = Infinity;
										for (let p_test_prefix_iri in h_prefix_lookup) {
											if (p_object_iri.startsWith(p_test_prefix_iri) && p_test_prefix_iri.length > n_best_prefix_len) {
												p_best_prefix_iri = p_test_prefix_iri;
												n_best_prefix_len = p_test_prefix_iri.length;
											}
										}
										// found one!
										if (p_best_prefix_iri) {
											// use that prefix instead
											let ab_prefix = h_prefix_lookup[p_best_prefix_iri];
											// always encode iris in utf-8
											let ab_suffix = encode_utf_8(p_object_iri.slice(n_best_prefix_len));
											// set object's buffer
											ab_object = Buffer.concat([ab_prefix, AB_PREFIX_SEPARATOR_TOKEN, ab_suffix], ab_prefix.length + 1 + ab_suffix.length);
										}
										// no usable prefix was found; use full iri
										else {
											// always encode iris in utf-8
											let ab_iri = encode_utf_8(p_object_iri);
											// set object's buffer
											ab_object = Buffer.concat([AB_ABSOLUTE_IRI_TOKEN, ab_iri], 1 + ab_iri.length);
										}
									}
								}
								// cannot be compressed, use full iri
								else {
									// always encode iris in utf-8
									let ab_iri = encode_utf_8(p_object_iri);
									// set object's buffer
									ab_object = Buffer.concat([AB_ABSOLUTE_IRI_TOKEN, ab_iri], 1 + ab_iri.length);
								}
							}
							// object is a blank node
							else {
								let s_label = h_object.value;
								let ab_blank_node_id = h_label_lookup[s_label];
								// set object's buffer
								ab_object = Buffer.concat([AB_BLANK_NODE_TOKEN, ab_blank_node_id], 1 + ab_blank_node_id.length);
							}
							// create temp index
							i_node_temp = c_nodes++;
							// create object node
							h_object_node = {
								buffer: ab_object,
								temp_index: i_node_temp,
								types: 2,
							};
							// save object node
							h_nodes[s_object_id] = h_object_node;
						}
						// object already exists as node
						else {
							// update fact that node is also object
							h_object_node.types |= 2;
							// fetch temp index
							i_node_temp = h_object_node.temp_index;
						}
						// 
						let h_nh = h_adj_lists.nh;
						// duplicate triple; exit
						if (i_node_temp in h_nh) {
							console.warn(`encountered duplicate triple ${s_subject_id} ${s_predicate_id} ${s_object_id}`);
							return;
						}
						// unique triple
						h_nh[i_node_temp] = 1;
						// count
						c_triples += 1;
						// push node to adjacency list
						h_adj_lists.n.push(h_object_node);
					}
					// sp pair has more than one object
					if (h_adj_lists.l.length + h_adj_lists.n.length > 1) {
						h_long_predicates[i_predicate_temp] = 1;
					}
				},
				// finished scanning input
				end(d_transform) {
					console.log('\nstage 3: sorting dictionaries...');
					if (h_config.progress) {
						f_progress = h_config.progress('process', {
							total: 6,
						});
					}
					// nodes
					let a_duals = [];
					let a_subjects = [];
					let a_objects = [];
					// separate nodes into duals, subjects and objects
					for (let s_node_id in h_nodes) {
						let h_node = h_nodes[s_node_id];
						// dual
						if (3 === h_node.types) {
							a_duals.push(h_node);
						}
						// subject
						else if (1 === h_node.types) {
							a_subjects.push(h_node);
						}
						// object
						else if (2 === h_node.types) {
							a_objects.push(h_node);
						}
					}
					f_progress(1);
					// free nodes hash to gc
					h_nodes = null;
					// sort each list by buffer
					a_duals.sort(F_SORT_BUFFER);
					f_progress(1);
					a_subjects.sort(F_SORT_BUFFER);
					f_progress(1);
					a_objects.sort(F_SORT_BUFFER);
					f_progress(1);
					// predicates
					let a_short_predicates = [];
					let a_predicates = new Array(c_predicates);
					let i_write_predicate = 0;
					// convert predicates to list
					for (let s_predicate_id in h_predicates) {
						let h_predicate_node = h_predicates[s_predicate_id];
						if (!h_long_predicates[h_predicate_node.temp_index]) {
							h_predicate_node.short = 1;
						}
						a_predicates[i_write_predicate++] = h_predicate_node;
					}
					// free predicates hash to gc
					h_long_predicates = null;
					h_predicates = null;
					// sort list by buffer
					a_predicates.sort(F_SORT_BUFFER);
					f_progress(1);
					// literals
					let a_literals = new Array(c_literals);
					let i_write_literal = 0;
					// convert literals to list
					for (let s_literal_id in h_literals) {
						a_literals[i_write_literal++] = h_literals[s_literal_id];
					}
					// free literals hash to gc
					h_literals = null;
					// sort list by buffer
					a_literals.sort(F_SORT_BUFFER);
					f_progress(1);
					console.log('\nstage 4: serializing data...');
					if (h_config.progress) {
						f_progress = h_config.progress('process', {
							total: 8,
						});
					}
					let n_max_word_length_dual = 0;
					let n_duals = a_duals.length;
					for (let i_dual = 0; i_dual < n_duals; i_dual++) {
						let h_thing = a_duals[i_dual];
						// update max word length
						n_max_word_length_dual = Math.max(h_thing.buffer.length, n_max_word_length_dual);
						h_thing.index = i_dual + 1;
					}
					f_progress(1);
					let n_max_word_length_subject = 0;
					let n_subjects = a_subjects.length;
					for (let i_subject = 0; i_subject < n_subjects; i_subject++) {
						let h_thing = a_subjects[i_subject];
						// update max word length
						n_max_word_length_subject = Math.max(h_thing.buffer.length, n_max_word_length_subject);
						h_thing.index = n_duals + i_subject + 1;
					}
					f_progress(1);
					let n_max_word_length_object = 0;
					let n_objects = a_objects.length;
					for (let i_object = 0; i_object < n_objects; i_object++) {
						let h_thing = a_objects[i_object];
						// update max word length
						n_max_word_length_object = Math.max(h_thing.buffer.length, n_max_word_length_object);
						h_thing.index = n_duals + i_object + 1;
					}
					f_progress(1);
					let n_max_word_length_literal = 0;
					let n_literals = a_literals.length;
					for (let i_literal = 0; i_literal < n_literals; i_literal++) {
						let h_thing = a_literals[i_literal];
						// update max word length
						n_max_word_length_literal = Math.max(h_thing.buffer.length, n_max_word_length_literal);
						h_thing.index = n_duals + n_objects + i_literal + 1;
					}
					f_progress(1);
					let n_max_word_length_predicate = 0;
					let n_predicates = a_predicates.length;
					for (let i_predicate = 0; i_predicate < n_predicates; i_predicate++) {
						let h_thing = a_predicates[i_predicate];
						// update max word length
						n_max_word_length_predicate = Math.max(h_thing.buffer.length, n_max_word_length_predicate);
						h_thing.index = i_predicate + 1;
					}
					f_progress(1);
					let i_max_object = n_duals + n_objects + n_literals;
					//
					// pre-determined lengths of arrays
					let n_idx_s_p = n_duals + n_subjects + 1;
					let n_adj_s_p = c_distinct_sp;
					let n_idx_sp_o = n_adj_s_p + 1;
					// declare arrays (using typed arrays where possible)
					let a_idx_s_p = new Array(n_idx_s_p);
					a_idx_s_p[0] = 0;
					let at_adj_s_p = n_predicates << 1 <= 0xff ?
						new Uint8Array(n_adj_s_p) :
						(n_predicates << 1 <= 0xffff ?
							new Uint16Array(n_adj_s_p) :
							(n_predicates << 1 <= 0xffffffff ?
								new Uint32Array(n_adj_s_p) :
								new Float64Array(n_adj_s_p))) // reserve a bit for short list mask
					let a_idx_sp_o = new Array(n_idx_sp_o);
					a_idx_sp_o[0] = 0;
					let at_adj_sp_o = i_max_object <= 0xff ?
						new Uint8Array(c_triples) :
						(i_max_object <= 0xffff ?
							new Uint16Array(c_triples) :
							(i_max_object <= 0xffffffff ?
								new Uint32Array(c_triples) :
								new Float64Array(c_triples)));
					let i_write_idx_s_p = 1;
					let i_write_adj_s_p = 0;
					let i_write_idx_sp_o = 1;
					let i_write_adj_sp_o = 0;
					// prep s_po list for first (then each) subject
					let a_s_po_list = [];
					// ammend data_sp from duals
					for (let i_dual = 0; i_dual < n_duals; i_dual++) {
						let h_pairs = a_duals[i_dual].pairs;
						// for sorting the sp pairs
						let a_sps = [];
						// each sp pair
						for (let i_temp_id in h_pairs) {
							let h_pair = h_pairs[i_temp_id];
							// cast temp id to string so that it compares properly when searching
							i_temp_id = parseInt(i_temp_id);
							// find predicate's actual id
							let i_word_p;
							for (let i_predicate = 0; i_predicate < n_predicates; i_predicate++) {
								let h_predicate_node = a_predicates[i_predicate];
								// found predicate!
								if (h_predicate_node.temp_index === i_temp_id) {
									// grab it's atual id
									i_word_p = h_predicate_node.index;
									// stop searching
									break;
								}
							}
							// push predicate to intermediate sp list
							a_sps.push({
								pair: h_pair,
								index: i_word_p,
							});
						}
						// sort sp pairs by index
						a_sps.sort(F_SORT_SHORT_LISTED_INDEX);
						// each sp pair
						let n_pairs = a_sps.length;
						for (let i_pair = 0; i_pair < n_pairs; i_pair++) {
							let {
								pair: h_pair,
								index: i_word_p,
							} = a_sps[i_pair];
							// free hashes to gc
							delete h_pair.nh;
							delete h_pair.lh;
							// push predicate index to sp list
							at_adj_s_p[i_write_adj_s_p++] = i_word_p;
							// first serialize nodes (ids always lower than literals)
							let a_nodes = h_pair.n;
							let n_nodes = a_nodes.length;
							a_nodes.sort(F_SORT_INDEX);
							for (let i_node = 0; i_node < n_nodes; i_node++) {
								at_adj_sp_o[i_write_adj_sp_o++] = a_nodes[i_node].index;
							}
							// then serialize literals
							let a_literals = h_pair.l;
							let n_literals = a_literals.length;
							a_literals.sort(F_SORT_INDEX);
							for (let i_literal = 0; i_literal < n_literals; i_literal++) {
								at_adj_sp_o[i_write_adj_sp_o++] = a_literals[i_literal].index;
							}
							// position of `c` within adjacency list given `ab`
							a_idx_sp_o[i_write_idx_sp_o++] = i_write_adj_sp_o;
						}
						// position of `b` within adjacency list given `a`
						a_idx_s_p[i_write_idx_s_p++] = i_write_adj_s_p;
					}
					f_progress(1);
					// ammend data_sp from subjects
					for (let i_subject = 0; i_subject < n_subjects; i_subject++) {
						let h_pairs = a_subjects[i_subject].pairs;
						// for sorting the sp pairs
						let a_sps = [];
						// each sp pair
						for (let i_temp_id in h_pairs) {
							let h_pair = h_pairs[i_temp_id];
							// cast temp id to string so that it compares properly when searching
							i_temp_id = parseInt(i_temp_id);
							// find predicate's actual id
							let i_word_p;
							for (let i_predicate = 0; i_predicate < n_predicates; i_predicate++) {
								let h_predicate_node = a_predicates[i_predicate];
								// found predicate!
								if (h_predicate_node.temp_index === i_temp_id) {
									// grab it's atual id
									i_word_p = h_predicate_node.index;
									// stop searching
									break;
								}
							}
							// push predicate to intermediate sp list
							a_sps.push({
								pair: h_pair,
								index: i_word_p,
							});
						}
						// sort sp pairs by index
						a_sps.sort(F_SORT_SHORT_LISTED_INDEX);
						// each sp pair
						let n_pairs = a_sps.length;
						for (let i_pair = 0; i_pair < n_pairs; i_pair++) {
							let {
								pair: h_pair,
								index: i_word_p,
							} = a_sps[i_pair];
							// free hashes to gc
							delete h_pair.nh;
							delete h_pair.lh;
							// push predicate index to sp list
							at_adj_s_p[i_write_adj_s_p++] = i_word_p;
							// first serialize nodes (ids always lower than literals)
							let a_nodes = h_pair.n;
							let n_nodes = a_nodes.length;
							a_nodes.sort(F_SORT_INDEX);
							for (let i_node = 0; i_node < n_nodes; i_node++) {
								at_adj_sp_o[i_write_adj_sp_o++] = a_nodes[i_node].index;
							}
							// then serialize literals
							let a_literals = h_pair.l;
							let n_literals = a_literals.length;
							a_literals.sort(F_SORT_INDEX);
							for (let i_literal = 0; i_literal < n_literals; i_literal++) {
								at_adj_sp_o[i_write_adj_sp_o++] = a_literals[i_literal].index;
							}
							// position of `c` within adjacency list given `ab`
							a_idx_sp_o[i_write_idx_sp_o++] = i_write_adj_sp_o;
						}
						// position of `b` within adjacency list given `a`
						a_idx_s_p[i_write_idx_s_p++] = i_write_adj_s_p;
					}
					f_progress(1);
					debugger;
					// serialize triples indexes and adjacency lists
					let i_max_s_p = a_idx_s_p[n_idx_s_p - 1];
					let at_idx_s_p = i_max_s_p <= 0xff ?
						new Uint8Array(n_idx_s_p) :
						(i_max_s_p <= 0xffff ?
							new Uint16Array(n_idx_s_p) :
							(i_max_s_p <= 0xffffffff ?
								new Uint32Array(n_idx_s_p) :
								new Float64Array(n_idx_s_p)))
					at_idx_s_p.set(a_idx_s_p);
					let i_max_sp_o = a_idx_sp_o[n_idx_sp_o - 1];
					let at_idx_sp_o = i_max_sp_o <= 0xff ?
						new Uint8Array(n_idx_sp_o) :
						(i_max_sp_o <= 0xffff ?
							new Uint16Array(n_idx_sp_o) :
							(i_max_sp_o <= 0xffffffff ?
								new Uint32Array(n_idx_sp_o) :
								new Float64Array(n_idx_sp_o)))
					at_idx_sp_o.set(a_idx_sp_o);
					// let n_adj_sp_o = a_adj_sp_o.length
					// let i_max_adj_sp_o = n_duals + n_objects + n_literals;
					// at_adj_sp_o.set(a_adj_sp_o);
					// free data lists to gc
					a_idx_s_p = null;
					a_idx_sp_o = null;
					// a_adj_sp_o = null;
					f_progress(1);
					console.log('\nstage 5: dictionaries |');

					console.log('serializing front-coded dual dictionary...');
					if (h_config.progress) {
						f_progress = h_config.progress('process', {
							mode: 'ratio',
						});
					}
					let {
						dict: ab_dict_d,
						ref: at_ref_d,
					} = serialize_fc_dict(a_duals, n_duals, n_max_word_length_dual, 16, f_progress);
					// free resources to gc
					a_duals = null;

					console.log('serializing front-coded dual dictionary...');
					if (h_config.progress) {
						f_progress = h_config.progress('process', {
							mode: 'ratio',
						});
					}
					let {
						dict: ab_dict_s,
						ref: at_ref_s,
					} = serialize_fc_dict(a_duals, n_duals, n_max_word_length_dual, 16, f_progress);
					// free resources to gc
					a_duals = null;

					console.log('serializing front-coded subject dictionary...');
					if (h_config.progress) {
						f_progress = h_config.progress('process', {
							mode: 'ratio',
						});
					}
					let {
						dict: ab_dict_o,
						ref: at_ref_o,
					} = serialize_fc_dict(a_subjects, n_subjects, n_max_word_length_subject, 16, f_progress);
					// free resources to gc
					a_subjects = null;

					console.log('serializing front-coded object dictionary...');
					if (h_config.progress) {
						f_progress = h_config.progress('process', {
							mode: 'ratio',
						});
					}
					let {
						dict: ab_dict_l,
						ref: at_ref_l,
					} = serialize_fc_dict(a_objects, n_objects, n_max_word_length_object, 16, f_progress);
					// free resources to gc
					a_objects = null;

					console.log('serializing front-coded literal dictionary...');
					if (h_config.progress) {
						f_progress = h_config.progress('process', {
							mode: 'ratio',
						});
					}
					let {
						dict: ab_dict_p,
						ref: at_ref_p,
					} = serialize_fc_dict(a_literals, n_literals, n_max_word_length_literal, 16, f_progress);
					// free resources to gc
					a_literals = null;
					// create normal prefix map by inversing prefix lookup hash
					let h_prefixes = k_graph.prefixes = {};
					for (let p_prefix_iri in h_prefix_lookup) {
						let ab_prefix_id = h_prefix_lookup[p_prefix_iri];
						let s_prefix_id = String.fromCharCode.apply(null, ab_prefix_id);
						h_prefixes[s_prefix_id] = p_prefix_iri;
						// delete h_prefix_lookup[p_prefix_iri];
					}
					Object.assign(k_graph, {
						range_d: 1 + n_duals,
						range_s: 1 + n_duals + n_subjects,
						range_o: 1 + n_duals + n_objects,
						range_l: 1 + n_duals + n_objects + n_literals,
						range_p: 1 + n_predicates,
						section_d: {
							count: n_duals,
							dict: ab_dict_d,
							ref: at_ref_d,
							k: 4,
						},
						section_s: {
							count: n_subjects,
							dict: ab_dict_s,
							ref: at_ref_s,
							k: 4,
						},
						section_o: {
							count: n_objects,
							dict: ab_dict_o,
							ref: at_ref_o,
							k: 4,
						},
						section_l: {
							count: n_literals,
							dict: ab_dict_l,
							ref: at_ref_l,
							k: 4,
						},
						section_p: {
							count: n_predicates,
							dict: ab_dict_p,
							ref: at_ref_p,
							k: 4,
						},
						triples_spo: {
							adj_a_b: at_adj_s_p,
							idx_a_b: at_idx_s_p,
							idx_ab_c: at_idx_sp_o,
							adj_ab_c: at_adj_sp_o,
						},
					});
					setImmediate(fk_task);
				},
			})),
		], () => {
			h_config.ready(k_graph);
		});
	}
	get operator() {
		return new stream.Readable({
			read() {
				this.push(null);
			}
		});
	}
}
// module
module.exports = function(w_input = null, h_config = {}) {
	// single argument
	if (1 === arguments.length) {
		// input is a hash, not a stream
		if ('object' === typeof w_input && !w_input.setEncoding) {
			// shift args
			h_config = w_input;
			w_input = null;
		}
	}
	// 
	return (new RDF_Loader(w_input, h_config)).operator;
};
// 			Buffer.allocUnsafe(64 * 1024);
// 			// write predicates to dictionary
// 			let s_dict_p = '';
// 			for(let s_predicate in h_predicates) {
// 				// append to predicate portion of dictionary
// 				s_dict_p += s_predicate+'\u0000';
// 				// free to GC
// 				delete h_predicates[s_predicate];
// 			}
// 			// reduce predicates dict to Uint8Array 
// 			// prep node dictionary fragments
// 			let s_dict_d = '';
// 			let s_dict_s = '';
// 			let s_dict_o = '';
// 			// count items in each fragment
// 			let c_words_d = 0;
// 			let c_words_s = 0;
// 			let c_words_o = 0;
// 			//
// 			let h_free_nodes = {};
// 			//
// 			let a_remap = new Uint32Array(c_nodes);
// 			// each node; count how many duals and start remapping
// 			for(let s_node_id in h_nodes) {
// 				let h_node = h_nodes[s_node_id];
// 				// found a common subject-object (dual)
// 				if(3 === h_node.types) {
// 					// commit to dict
// 					s_dict_d += s_node_id+'\u0000';
// 					// store remapped index
// 					a_remap[h_node.index] = ++c_words_d;
// 					// don't need key anymore, but still need node
// 					h_free_nodes[c_words_d] = h_node;
// 					// free node!
// 					delete h_nodes[s_node_id];
// 				}
// 			}
// 			// reduce duals dictionary from utf-16 string to utf-8 Uint8Array
// 			// each node; remap subjects and objects using duals offset
// 			for(let s_node_id in h_nodes) {
// 				let h_node = h_nodes[s_node_id];
// 				// non-common subject
// 				if(1 === h_node.types) {
// 					// commit to dict
// 					s_dict_s += s_node_id+'\u0000';
// 					// store remapped index
// 					a_remap[h_node.index] = c_words_d + (++c_words_s);
// 					// don't need key anymore, but still need node
// 					h_free_nodes[c_words_d + c_words_s] = h_node;
// 					// free node!
// 					delete h_nodes[s_node_id];
// 				}
// 				// non-common object
// 				else if(2 === h_node.types) {
// 					// commit to dict
// 					s_dict_o += s_node_id+'\u0000';
// 					// store remapped index
// 					a_remap[h_node.index] = c_words_d + (++c_words_o);
// 					// don't need key, or node!
// 					delete h_nodes[s_node_id];
// 				}
// 			}
// 			// reduce subjects and objects dictionaries from utf-16 strings to utf-8 Uint8Arrays
// 			// write literals to dictionary
// 			let s_dict_l = '';
// 			for(let s_literal in h_literals) {
// 				// append literal
// 				s_dict_l += s_literal;
// 				// free to GC
// 				delete h_literals[s_literal];
// 			}
// 			// reduce literals dict to Uint8Array
// 			// prep data storage (compact triples structure) for SP
// 			let n_data_sp_size = c_distinct_sp + c_words_d + c_words_s;
// 			let i_data_sp = 0;  // pointer for array above
// 			// prep data storage (compact triples structure) for SP_O
// 			let n_data_s_po_size = c_triples_total + c_distinct_sp;
// 			let n_objects = c_words_d + c_words_o + c_words_l;
// 			let i_data_s_po = 0;  // pointer for array above
// 			// each free node; (only subject nodes left in free nodes)
// 			for(let i_fn in h_free_nodes) {
// 				let h_node = h_free_nodes[i_fn];
// 				// each {[predicate] => objects} in this subject's triples
// 				let h_pairs = h_node.pairs;
// 				for(let i_dict_p in h_pairs) {
// 					let h_objects = h_pairs[i_dict_p];
// 					// write predicate to list
// 					a_adj_s_p[i_data_sp++] = ~~i_dict_p + 1;
// 					// prep to sort object nodes (separate hops from sinks)
// 					let a_adj_sp_o_nodes = [];
// 					// each object node in this subject's triples
// 					let a_object_nodes = h_objects.n;
// 					for(let i_ in a_object_nodes) {
// 						// write remapped index value to adjacency list
// 						a_adj_sp_o_nodes.push(a_remap[a_object_nodes[i_]]);
// 					}
// 					// sort object nodes by node id
// 					a_adj_sp_o_nodes.sort((a, b) => a - b);
// 					// commit to data list and adjust offset accordingly
// 					a_adj_sp_o.set(a_adj_sp_o_nodes, i_data_s_po);
// 					i_data_s_po += a_adj_sp_o_nodes.length;
// 					// then, each literal in this subject's triples
// 					let a_object_literals = h_objects.l;
// 					for(let i_ in a_object_literals) {
// 						// copy literal's index value over offset by [object nodes segment] of dict
// 						a_adj_sp_o[i_data_s_po++] = c_words_d + c_words_o + a_object_literals[i_] + 1;
// 					}
// 					// terminate predicate's object adjacency group
// 					a_adj_sp_o[i_data_s_po++] = 0;
// 				}
// 				// terminate subject' predicate adjacency group
// 				a_adj_s_p[i_data_sp++] = 0;
// 			}
// 			// save everything
// 			Object.assign(k_graph, {
// 				count_triples: c_triples_total,
// 				prefixes: h_prefixes,
// 				prefix_lookup: h_prefix_lookup,
// 				user_prefixes: h_user_prefixes,
// 				data_sp: a_adj_s_p,
// 				data_s_po: a_adj_sp_o,
// 				// data_po: ,
// 				// data_po_s: ,
// 				// data_os: ,
// 				// data_os_p: ,
// 				dict_d: a_dict_d,
// 				dict_s: a_dict_s,
// 				dict_o: a_dict_o,
// 				dict_l: a_dict_l,
// 				dict_p: a_dict_p,
// 				count_d: c_words_d,
// 				count_s: c_words_s,
// 				count_o: c_words_o,
// 				count_l: c_words_l,
// 				count_p: c_words_p,
// 			});
// 			// being used as transform
// 			if(!w_input && d_transform && 'function' === typeof d_transform.push) {
// 				// build prefixes bytes
// 				let a_prefixes = [];
// 				for(let s_prefix_id in h_prefixes) {
// 					let s_encoded = s_prefix_id+'\u0001'+h_prefixes[s_prefix_id]+'\u0000';
// 					a_prefixes.push.apply(a_prefixes, Array.from(Buffer.from(s_encoded)));
// 				}
// 				// convert to TypedArray
// 				let at_prefixes = Uint8Array.from(a_prefixes);
// 				// write to output
// 				// write each dict section to output
// 				// write each data section to output
// 			}
// 			// ready event callback
// 			h_config.ready && h_config.ready(k_graph);
// 		}
// 	});
// 	// no input stream
// 	if(!w_input) {
// 		// return parser config
// 		this.operator = h_parse_config;
// 	}
// 	// indeed input stream
// 	else {
// 		if(!h_config.format || 'function' !== h_config.format.parse) {
// 			throw `config arg hash must include a valid "format"`;
// 		}
// 		else {
// 			this.operator = h_config.format.parse(w_input, h_parse_config);
// 		}
// 	}
// }