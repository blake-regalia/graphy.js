const bat = require('../bat.js');
const bus = require('../bus.js');

const interfaces = require('./interfaces.js');

const graphy = require('../../main/graphy.js');

const D_TEXT_ENCODER = new TextEncoder();
const D_TEXT_DECODER = new TextDecoder();
const R_COMPRESS = bat.R_COMPRESS;

const {
	S_TERM_PREFIXES,
	S_TERM_HA, S_TERM_SA, S_TERM_PA, S_TERM_OA,
	S_TERM_HP, S_TERM_SP, S_TERM_PP, S_TERM_OP,
	S_TERM_LP, S_TERM_LL, S_TERM_LDA, S_TERM_LDP,
} = bat;

const A_CHAPTERS = [
	{label:S_TERM_PREFIXES, cue:null, start:1},
	{label:S_TERM_HA, cue:null, start:2},
	{label:S_TERM_HP, cue:S_TERM_HA},
	{label:S_TERM_SA, cue:S_TERM_HP},
	{label:S_TERM_SP, cue:S_TERM_SA},
	{label:S_TERM_PA, cue:null, start:2},
	{label:S_TERM_PP, cue:S_TERM_PA},
	{label:S_TERM_OA, cue:S_TERM_HP},
	{label:S_TERM_OP, cue:S_TERM_OA},
	{label:S_TERM_LP, cue:S_TERM_OP},
	{label:S_TERM_LL, cue:S_TERM_LP},
	{label:S_TERM_LDA, cue:S_TERM_LL},
	{label:S_TERM_LDP, cue:S_TERM_LDA},
];

class dictionary_thirteen_chapter extends interfaces.dictionary {

	constructor(at_payload, s_type, k_decoder) {
		super();

		// only supports terms
		if('terms' !== s_type) {
			throw new Error('dictionary/thirteen-chapter only supports #terms');
		}

		let kcd = new bat.container_decoder(at_payload);
		let h_ranges = {};
		let h_chapters = {};

		let i_chapter = 0;
		do {
			// fetch child node
			let {
				encoding: p_encoding,
				label: s_chapter,
				payload: at_payload_chapter,
			} = kcd.child();

			// skipped chapters
			while(s_chapter !== A_CHAPTERS[i_chapter].label) {
				let {
					label: s_chapter_skipped,
					cue: s_chapter_cue,
				} = A_CHAPTERS[i_chapter++];

				// no instance
				h_chapters[s_chapter_skipped] = null;

				// take cue from previous chapter
				if(s_chapter_cue) {
					let i_cue_hi = h_ranges[s_chapter_cue].hi;

					// set would-be range
					h_ranges[s_chapter_skipped] = {
						lo: i_cue_hi,
						hi: i_cue_hi,
					};
				}
				// init
				else {
					let i_start = h_ranges[s_chapter_skipped].start;
					h_ranges[s_chapter_skipped] = {
						lo: i_start,
						hi: i_start,
					};
				}
			}

			// decode node to instance
			let k_chapter = k_decoder.decode(p_encoding, at_payload_chapter);

			// store instance to hash
			h_chapters[s_chapter] = k_chapter;

			// set range for term searching
			let i_lo = h_ranges[A_CHAPTERS[i_chapter].cue].hi;
			h_ranges[s_chapter] = {
				lo: i_lo,
				hi: i_lo + k_chapter.word_count,
			};

			// set chapter's start range
			k_chapter.offset = i_lo;
		} while(!kcd.finished());


		// instead of using prefix in chapter-mode, use as hash
		let h_prefixes = {};
		let i_prefix = 1;
		for(let p_prefix_iri of h_chapters.prefixes.each()) {
			h_prefixes[bat.key_space.from(i_prefix)] = p_prefix_iri;
		}

		// free prefix chapter
		delete h_chapters.prefixes;

		// save fields
		Object.assign(this, {
			prefixes: h_prefixes,
			ranges: h_ranges,
			chapters: h_chapters,
		});
	}

	produce_subject(i_term) {
		let {
			ranges: {
				hops_absolute: h_range_ha,
				hops_prefixed: h_range_hp,
				subjects_absolute: h_range_sa,
				subjects_prefixed: h_range_sp,
			},
			chapters: h_chapters,
		} = this;

		if(i_term < 2) {
			throw new RangeError('invalid term ID');
		}
		else if(i_term <= h_range_hp.hi) {
			if(i_term <= h_range_ha.hi) {
				return this.word_to_node_absolute(h_chapters.hops_absolute.produce(i_term));
			}
			else {
				return this.word_to_node_prefixed(h_chapters.hops_prefixed.produce(i_term));
			}
		}
		else {
			if(i_term <= h_range_sa.hi) {
				return this.word_to_node_absolute(h_chapters.subjects_absolute.produce(i_term));
			}
			else if(i_term <= h_range_sp.hi) {
				return this.word_to_prefixed(h_chapters.subjects_prefixed.produce(i_term));
			}
			else {
				throw new RangeError('term id exceeds subject id range');
			}
		}
	}

	produce_predicate(i_term) {
		let {
			ranges: {
				predicates_absolute: h_range_pa,
				predicates_prefixed: h_range_pp,
			},
			chapters: h_chapters,
		} = this;

		if(i_term < 2) {
			throw new RangeError('invalid term ID');
		}
		else if(i_term <= h_range_pa.hi) {
			return this.word_to_node_absolute(h_chapters.predicates_absolute.produce(i_term));
		}
		else if(i_term <= h_range_pp.hi) {
			return this.word_to_node_prefixed(h_chapters.predicates_prefixed.produce(i_term));
		}
		else {
			throw new RangeError('term id exceeds predicate id range');
		}
	}

	produce_object(i_term) {
		let {
			ranges: {
				hops_absolute: h_range_ha,
				hops_prefixed: h_range_hp,
				objects_absolute: h_range_oa,
				objects_prefixed: h_range_op,
				literals_plain: h_range_lp,
				literals_languaged: h_range_ll,
				literals_datatyped_absolute: h_range_lda,
				literals_datatyped_prefixed: h_range_ldp,
			},
			chapters: h_chapters,
		} = this;

		if(i_term < 2) {
			throw new RangeError('invalid term ID');
		}
		else if(i_term <= h_range_op.hi) {
			if(i_term <= h_range_hp.hi) {
				if(i_term <= h_range_ha.hi) {
					return this.word_to_node_absolute(h_chapters.hops_absolute.produce(i_term));
				}
				else {
					return this.word_to_node_prefixed(h_chapters.hops_prefixed.produce(i_term));
				}
			}
			else {
				if(i_term <= h_range_oa.hi) {
					return this.word_to_node_absolute(h_chapters.objects_absolute.produce(i_term));
				}
				else {
					return this.word_to_node_prefixed(h_chapters.objects_prefixed.produce(i_term));
				}
			}
		}
		else {
			if(i_term <= h_range_ll.hi) {
				if(i_term <= h_range_lp.hi) {
					return this.word_to_literal_plain(h_chapters.literals_plain.produce(i_term));
				}
				else {
					return this.word_to_literal_languaged(h_chapters.literals_languaged.produce(i_term));
				}
			}
			else {
				if(i_term <= h_range_lda.hi) {
					return this.word_to_literal_datatyped_absolute(h_chapters.literals_datatyped_absolute.produce(i_term));
				}
				else if(i_term <= h_range_ldp.hi) {
					return this.word_to_literal_datatyped_prefixed(h_chapters.literals_datatyped_prefixed.produce(i_term));
				}
				else {
					throw new RangeError('term id exceeds object-literal id range');
				}
			}
		}
	}

	word_to_node_absolute(at_word) {
		return graphy.namedNode(D_TEXT_DECODER.decode(at_word));
	}

	word_to_node_prefixed(at_word) {
		let n_prefix_key_bytes = this.prefix_key_bytes;

		// decompose prefixed name's word from dictionary
		let s_prefix_id = bat.key_space.from(at_word.subarray(0, n_prefix_key_bytes));
		let s_suffix = D_TEXT_DECODER.decode(at_word.subarry(n_prefix_key_bytes));

		// produce named node from reconstructed iri
		return graphy.namedNode(this.prefixes[s_prefix_id]+s_suffix);
	}

	word_to_literal_plain(at_word) {
		return graphy.literal(at_word);
	}

	word_to_literal_languaged(at_word) {
		// extract content
		let s_word = D_TEXT_DECODER.decode(at_word);

		// find start of content
		let i_content = s_word.indexOf('"');

		// initialize literal with content
		return graphy.literal(s_word.slice(i_content+1), s_word.slice(0, i_content));
	}

	word_to_literal_datatyped_absolute(at_word) {
		// extract content
		let s_word = D_TEXT_DECODER.decode(at_word);

		// find start of content
		let i_content = s_word.indexOf('"');

		// initialize literal with content
		return graphy.literal(s_word.slice(i_content+1), graphy.namedNode(s_word.slice(0, i_content)));
	}

	word_to_literal_datatyped_prefixed(at_word) {
		let n_prefix_key_bytes = this.prefix_key_bytes;

		let at_prefix = at_word.slice(0, n_prefix_key_bytes);
		let s_contents = D_TEXT_DECODER.decode(at_word.slice(n_prefix_key_bytes));

		// initialize literal with content
		return graphy.literal(s_contents, this.node_prefixed(at_prefix));
	}


	find_hop(s_tt) {
		let h_chapters = this.chapters;

		// create word from tts node
		let h_word = this.tts_node_to_word(s_tt);

		// prefix not exist
		if(!h_word) return 0;

		// destructure word
		let {word:at_word, prefixed:b_prefixed} = h_word;

		// prefixed word
		if(b_prefixed) {
			return h_chapters.hops_prefixed.find(at_word);
		}
		// absolute word
		else {
			return h_chapters.hops_absolute.find(at_word);
		}
	}

	find_subject(s_tt) {
		let h_chapters = this.chapters;

		// create word from tts node
		let h_word = this.tts_node_to_word(s_tt);

		// prefix not exist
		if(!h_word) return 0;

		// destructure word
		let {word:at_word, prefixed:b_prefixed} = h_word;

		// prefixed word
		if(b_prefixed) {
			return h_chapters.subjects_prefixed.find(at_word)
				|| h_chapters.hops_prefixed.find(at_word);
		}
		// absolute word
		else {
			return h_chapters.subjects_absolute.find(at_word)
				|| h_chapters.hops_absolute.find(at_word);
		}
	}

	find_predicate(s_tt) {
		let h_chapters = this.chapters;

		// create word from tts node
		let h_word = this.tts_node_to_word(s_tt);

		// prefix not exist
		if(!h_word) return 0;

		// destructure word
		let {word:at_word, prefixed:b_prefixed} = h_word;

		// prefixed word
		if(b_prefixed) {
			return h_chapters.predicates_prefixed.find(at_word);
		}
		// absolute word
		else {
			return h_chapters.predicates_absolute.find(at_word);
		}
	}

	find_object_node(s_tt) {
		let h_chapters = this.chapters;

		// create word from tts node
		let h_word = this.tts_node_to_word(s_tt);

		// prefix not exist
		if(!h_word) return 0;

		// destructure word
		let {word:at_word, prefixed:b_prefixed} = h_word;

		// prefixed word
		if(b_prefixed) {
			return h_chapters.objects_prefixed.find(at_word)
				|| h_chapters.hops_prefixed.find(at_word);
		}
		// absolute word
		else {
			return h_chapters.objects_absolute.find(at_word)
				|| h_chapters.hops_absolute.find(at_word);
		}
	}

	find_object_literal(s_tt) {
		let h_chapters = this.chapters;

		// create word from tts node
		let h_word = this.tts_literal_to_word(s_tt);

		// prefix not exist
		if(!h_word) return 0;

		// destructure word
		let {word:at_word, chapter:s_chapter} = h_word;

		// prefixed word
		return h_chapters[s_chapter].find(at_word);
	}


	tts_node_to_word(s_tt) {
		// iriref
		if('<' === s_tt[0]) {
			// construct iri
			let p_iri = s_tt.slice(1, -1);

			// attempt to compress
			let m_compress = R_COMPRESS.exec(p_iri);

			// cannot be compressed
			if(!m_compress) {
				// use iriref
				return {word:D_TEXT_ENCODER.encode(p_iri), prefixed:false};
			}
			// try finding compressed prefix id
			else {
				// lookup prefix id from prefix lookup
				let s_prefix_id = this.prefix_lookup[m_compress[1]];

				// prefix not exists
				if(!s_prefix_id) {
					// no such node
					return null;
				}
				// found the prefix
				else {
					// construct word using prefix
					return {word:D_TEXT_ENCODER.encode(s_prefix_id+m_compress[2]), prefixed:true};
				}
			}
		}
		// prefixed name
		else {
			// extract prefix / suffix
			let [s_user_prefix, s_suffix] = s_tt.split(':');

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
					return {word:D_TEXT_ENCODER.encode(p_iri), prefixed:false};
				}
				// try finding compressed prefix id
				else {
					// lookup prefix id from prefix lookup
					let s_prefix_code = this.prefix_lookup[m_compress[1]];

					// prefix not exists
					if(!s_prefix_code) {
						// no such node
						return null;
					}
					// found the prefix
					else {
						// construct word using prefix
						return {word:D_TEXT_ENCODER.encode(s_prefix_code+m_compress[2]), prefixed:true};
					}
				}
			}
			// prefix mapping does exist
			else {
				// construct word using prefix
				return {word:D_TEXT_ENCODER.encode(s_prefix_id+s_suffix), prefixed:true};
			}
		}
	}

	tts_literal_to_word(s_tt) {
		// start of content
		let i_content = s_tt.indexOf('"');

		// plain literal
		if(!i_content) {
			return {
				word: D_TEXT_ENCODER.encode(s_tt.slice(1)),
				chapter: S_TERM_LP,
			};
		}
		// not a literal
		else if(-1 === i_content) {
			throw new Error(`invalid tt_string for literal: ${s_tt}`);
		}
		// non-plain literal
		else {
			let s_chr = s_tt[0];

			// languaged literal
			if('@' === s_chr) {
				let s_language = s_tt.slice(1, i_content).toLowerCase();
				return {
					word: D_TEXT_ENCODER.encode(s_language+s_tt.slice(i_content)),
					chapter: S_TERM_LL,
				};
			}
			// datatyped literal
			else if('^' === s_chr) {
				let h_datatype = this.tts_node_to_word(s_tt.slice(1, i_content));

				// prefix not exist
				if(!h_datatype) return 0;

				// destructure word
				let {word:at_datatype, prefixed:b_datatype_prefixed} = h_datatype;

				// encode contents
				let at_contents = D_TEXT_ENCODER.encode(s_tt.slice(i_content));

				// combine into word
				let n_datatype_bytes = at_datatype.length;
				let at_word = new Uint8Array(n_datatype_bytes + at_contents.length);
				at_word.set(at_datatype);
				at_word.set(at_contents, n_datatype_bytes);

				return {
					word: at_word,
					chapter: b_datatype_prefixed? S_TERM_LDP: S_TERM_LDA,
				};
			}
			// invalid tt_string
			else {
				throw `invalid tt_string for literal: ${s_tt}`;
			}
		}
	}


}


module.exports = {
	structures: {
		'http://bat-rdf.link/structure/dictionary/thirteen-chapter/1.0': dictionary_thirteen_chapter,
	},
};

