const {
	XM_TERM_TAG_DEFAULT_GRAPH,
	XM_TERM_TAG_NODE_NAMED,
	XM_TERM_TAG_NODE_BLANK,
	XM_TERM_TAG_LITERAL_SIMPLE,
	XM_TERM_TAG_LITERAL_LANGUAGED,
	XM_TERM_TAG_LITERAL_DATATYPED,
	XM_TERM_TAG_NODE,
	XM_TERM_TAG_LITERAL,
	XM_TERM_TAG_ANY,
} = require('./constants.js');

const X_RANK_PROPERTY_ACCESS = 1;
const X_RANK_STRING_EQUALS = 3;
const X_RANK_STRING_INDEX_OF = 3.5;
const X_RANK_STRING_ENDS_WITH = 5;
const X_RANK_CONCISE_STRING_EQUALS = 6;
const X_RANK_CONCISE_PREFIXES_STRING_EQUALS = 6.5;
const X_RANK_CONCISE_STRING_INDEX_OF = 7;
const X_RANK_CONCISE_PREFIXES_STRING_INDEX_OF = 7.5;
const X_RANK_REGEX = 11;
const X_RANK_CONCISE_REGEX = 12;
const X_RANK_TERM_COMPARE = 5.5;

const F_SORT_GEN_RANK = (g_a, g_b) => g_a.rank - g_b.rank;

const F_REDUCE_DECAY = (x_total, x_rank) => x_total + (x_rank / 2);

const R_PLAIN_REGEX = /^(\^?)((?:\\.|[^.[\]{}?*+$()|])*)(\$?)$/;

const RT_TEXT_PREFIX = /^[^~>_^@"*?]/;

const H_TEST_RANGE = {
	[XM_TERM_TAG_DEFAULT_GRAPH]: {
		rank: X_RANK_PROPERTY_ACCESS,

		gen: sj => /* syntax: js */ `${sj}.isDefaultGraph`,
	},

	[XM_TERM_TAG_NODE]: {
		rank: X_RANK_PROPERTY_ACCESS + (X_RANK_PROPERTY_ACCESS / 2),

		gen(sj) {
			return /* syntax: js */ `(${sj}.isNamedNode || ${sj}.isBlankNode)`;
		},
	},

	[XM_TERM_TAG_LITERAL]: {
		rank: X_RANK_PROPERTY_ACCESS,

		gen(sj) {
			return /* syntax: js */ `${sj}.isLiteral`;
		},
	},

	[XM_TERM_TAG_NODE_NAMED]: {
		rank: X_RANK_PROPERTY_ACCESS,

		gen(sj) {
			return /* syntax: js */ `${sj}.isNamedNode`;
		},
	},

	[XM_TERM_TAG_NODE_BLANK]: {
		rank: X_RANK_PROPERTY_ACCESS,

		gen(sj) {
			return /* syntax: js */ `${sj}.isBlankNode`;
		},
	},

	[XM_TERM_TAG_LITERAL_SIMPLE]: {
		rank: X_RANK_PROPERTY_ACCESS,

		gen(sj) {
			return /* syntax: js */ `${sj}.isSimple`;
		},
	},

	[XM_TERM_TAG_LITERAL_LANGUAGED]: {
		rank: X_RANK_PROPERTY_ACCESS,

		gen(sj) {
			return /* syntax: js */ `${sj}.isLanguaged`;
		},
	},

	[XM_TERM_TAG_LITERAL_DATATYPED]: {
		rank: X_RANK_PROPERTY_ACCESS,

		gen(sj) {
			return /* syntax: js */ `${sj}.isDatatyped`;
		},
	},
};


function compile_tags(xm_tags) {
	// tags given
	if(xm_tags && XM_TERM_TAG_ANY !== xm_tags) {
		// direct tag mapping
		if(xm_tags in H_TEST_RANGE) {
			return H_TEST_RANGE[xm_tags];
		}
		// composite tag
		else {
			let a_selectors = [];

			// each test range in order
			for(let [sm_test, g_select] of Object.entries(H_TEST_RANGE)) {
				let xm_test = +sm_test;

				// mask covers case
				if(xm_test === (xm_test & xm_tags)) {
					// reduce case
					xm_tags &= ~xm_test;

					// apply selector
					a_selectors.push(g_select);

					// done
					if(!xm_tags) break;
				}
			}

			// failed to cover case
			if(xm_tags) {
				console.assert(`case not covered: ${xm_tags}`);
			}

			// save tag selector
			return {
				rank: a_selectors.map(g => g.rank).reduce(F_REDUCE_DECAY, 0),

				gen(sj_target) {
					return '('+a_selectors.map(g => g.gen(sj_target)).join(' && ')+')';
				},
			};
		}
	}
}


const pretag = (g, sj_target) => g.tags? compile_tags(g.tags).gen(sj_target)+' && ': '';

const wrap = (s, b) => b? `(${s})`: s;

const escape_str = s => s.replace(/'/g, '\\\'').replace(/\r\n\v\f/g, '');

const track_prefix = (si_var_iri, si_prefix, s_suffix) => ({
	declare: /* syntax: js */ `let ${si_var_iri} = null;`,

	// subscribe to prefix change events
	prefix: {
		[escape_str(si_prefix)]: /* syntax: js */ `${si_var_iri} = p_iri+'${escape_str(s_suffix)}';`,
	},
});

const H_COMPILERS = {
	and(a_items) {
		let a_compiled = a_items.map(g => this.compile(g));

		// tags are not tied tight to conditions by default
		let b_tight_tags = false;

		// all entries are the same
		if(a_compiled.slice(1).every(g => g === a_compiled[0].tags)) {
			// simply add to conditions
			a_compiled.push(compile_tags(a_compiled[0].tags));
		}
		// not all entries are the same
		else {
			// keep test tight to condition
			b_tight_tags = true;
		}

		// sort compiled by rank
		a_compiled.sort(F_SORT_GEN_RANK);

		return {
			rank: a_compiled.reduce(F_REDUCE_DECAY, 0),

			test(g_quad) {
				for(let g_compiled of a_compiled) {
					if(!g_compiled.test(g_quad)) return false;
				}

				return true;
			},

			gen(sj_target) {
				let f_map_gen = b_tight_tags
					? (k, i) => a_compiled[i].auto(sj_target)
					: k => k.gen(sj_target);

				return wrap(a_compiled.map(f_map_gen).join(' && '), a_compiled.length > 1);
			},
		};
	},

	or(a_items) {
		let a_compiled = a_items.map(g => this.compile(g)).sort(F_SORT_GEN_RANK);

		return {
			rank: a_compiled.reduce(F_REDUCE_DECAY, 0),

			test(g_quad) {
				for(let g_compiled of a_compiled) {
					if(g_compiled.test(g_quad)) return true;
				}

				return false;
			},

			gen(sj_target) {
				return wrap(a_compiled.map(k => k.auto(sj_target)).join(' || '), a_compiled.length > 1);
			},
		};
	},

	not(g_not) {
		let k_not = this.compile(g_not);

		return {
			rank: k_not.rank,

			test(g_quad) {
				return !k_not.test(g_quad);
			},

			gen(sj_target) {
				return `!(${pretag(k_not, sj_target)}${k_not.gen(sj_target)})`;
			},
		};
	},

	range(g_range) {
		let {
			term: g_term,
			tags: xm_tags,
		} = g_range;

		// compile term if present
		let k_term = g_term? this.compile(g_range.term): null;

		// tag selector
		let fsj_tag = null;

		// minimum assertion tags
		if(k_term && k_term.tags) {
			xm_tags |= k_term.tags;
		}

		// tags given
		if(xm_tags && XM_TERM_TAG_ANY !== xm_tags) {
			// direct tag mapping
			if(xm_tags in H_TEST_RANGE) {
				fsj_tag = H_TEST_RANGE[xm_tags];
			}
			// composite tag
			else {
				let a_selectors = [];

				// each test range in order
				for(let [sm_test, fsj_select] of Object.entries(H_TEST_RANGE)) {
					let xm_test = +sm_test;

					// mask covers case
					if(xm_test === (xm_test & xm_tags)) {
						// reduce case
						xm_tags &= ~xm_test;

						// apply selector
						a_selectors.push(fsj_select);

						// done
						if(!xm_tags) break;
					}
				}

				// failed to cover case
				if(xm_tags) {
					console.assert(`case not covered: ${xm_tags}`);
				}

				// save tag selector
				fsj_tag = sj_target => a_selectors.map(fsj => fsj(sj_target)).join(' && ');
			}
		}

		// tag and term
		if(fsj_tag && k_term) {
			return {
				rank: X_RANK_PROPERTY_ACCESS,

				gen(sj_target) {
					return /* syntax: js */ `${fsj_tag(sj_target)} && ${k_term.gen(sj_target)}`;
				},
			};
		}
		else {
			debugger;
		}
	},

	iri(p_iri) {
		return {
			tags: XM_TERM_TAG_NODE_NAMED,

			rank: X_RANK_STRING_EQUALS,

			gen(sj_target) {
				return /* syntax: js */ `'${escape_str(p_iri)}' === ${sj_target}.value`;
			},
		};
	},

	pname(g_pname) {
		let {
			prefix: si_prefix,
			local: s_suffix,
		} = g_pname;

		let si_var_iri = this.acquire('p_iri');

		return {
			tags: XM_TERM_TAG_NODE_NAMED,

			rank: X_RANK_STRING_EQUALS,

			hooks() {
				return track_prefix(si_var_iri, si_prefix, s_suffix);
			},

			gen(sj_target) {
				return /* syntax: js */ `${si_var_iri} === ${sj_target}.value`;
			},
		};
	},

	language(s_lang) {
		return {
			// no need for checking `.isLanguaged` property since `.language` can
			//   be undefined
			// tags: XM_TERM_TAG_LITERAL_LANGUAGED,

			rank: X_RANK_STRING_EQUALS,

			gen(sj_target) {
				return /* syntax: js */ `'${escape_str(s_lang).toLowerCase()}' === ${sj_target}.language`;
			},
		};
	},

	datatype(g_datatype) {
		let k_datatype = this.compile(g_datatype);

		return {
			tags: XM_TERM_TAG_LITERAL_DATATYPED,

			rank: X_RANK_PROPERTY_ACCESS,

			gen(sj_target) {
				return k_datatype.toString(/* syntax: js */ `${sj_target}.datatype`);
			},
		};
	},

	literal(g_literal) {
		let {
			contents: s_contents,
			post: g_post,
		} = g_literal;

		let f_contents = sj_target => /* syntax: js */ `'${escape_str(s_contents)}' === ${sj_target}.value`;

		if(g_post) {
			let k_post = this.compile(g_post);

			return {
				tags: k_post.tags,

				rank: [X_RANK_STRING_EQUALS, k_post.rank].reduce(F_REDUCE_DECAY, 0),

				gen(sj_target) {
					return /* syntax: js */ `${f_contents(sj_target)} && ${k_post.gen(sj_target)}`;
				},
			};
		}
		else {
			return {
				tags: XM_TERM_TAG_LITERAL_SIMPLE,

				rank: X_RANK_STRING_EQUALS,

				gen(sj_contents) {
					return f_contents(sj_contents);
				},
			};
		}
	},

	default_graph() {
		return {
			tags: XM_TERM_TAG_DEFAULT_GRAPH,

			rank: 0,

			gen: () => 'true',
		};
	},

	anon() {
		return {
			tags: XM_TERM_TAG_NODE_BLANK,

			rank: 0,

			gen: () => 'true',
		};
	},

	bnode(s_label) {
		if(s_label) {
			return {
				tags: XM_TERM_TAG_NODE_BLANK,

				rank: X_RANK_STRING_EQUALS,

				gen(sj_target) {
					return /* syntax: js */ `'${escape_str(s_label)}' === ${sj_target}.value`;
				},
			};
		}
		else {
			return {
				tags: XM_TERM_TAG_NODE_BLANK,

				rank: 0,

				gen: () => 'true',
			};
		}
	},

	regex(g_regex) {
		let r_pattern = g_regex.pattern;
		let s_source = r_pattern.source;

		// consie term
		if(g_regex.concise) {
			let m_plain = R_PLAIN_REGEX.exec(s_source);

			// plain regex
			if(m_plain && r_pattern.flags.indexOf('i') < 0) {
				let [, s_anchor_start, s_text, s_anchor_end] = m_plain;

				// anchor start
				if(s_anchor_start) {
					// concise term type
					switch(s_text[0]) {
						// language tag
						case '@':
						case '^': {
							let b_datatype = '^' === s_text[0];
							let b_prefixed_datatype = b_datatype && '>' !== s_text[1];
							let sj_prefixes = b_prefixed_datatype? 'h_prefixes': '';

							let xm_tags = b_datatype? XM_TERM_TAG_LITERAL_DATATYPED: XM_TERM_TAG_LITERAL_LANGUAGED;

							// exact
							if(s_anchor_end) {
								return {
									tags: xm_tags,

									prefixes: !!sj_prefixes,

									...(b_prefixed_datatype
										? {
											rank: X_RANK_CONCISE_PREFIXES_STRING_EQUALS,
										}
										: {
											rank: X_RANK_CONCISE_STRING_EQUALS,
										}),

									gen(sj_target) {
										return /* syntax: js */ `'${escape_str(s_text)}' === ${sj_target}.concise(${sj_prefixes})`;
									},
								};
							}
							// starts with
							else {
								// content delimiter
								let i_contents = s_text.indexOf('"');
								if(i_contents >= 0) {
									let s_contents = s_text.slice(i_contents);

									// yes contents
									if(s_contents) {
										return {
											tags: xm_tags,

											prefixes: !!sj_prefixes,

											rank: b_prefixed_datatype? X_RANK_CONCISE_PREFIXES_STRING_INDEX_OF: X_RANK_CONCISE_STRING_INDEX_OF,

											gen(sj_target) {
												return /* syntax: js */ `0 === ${sj_target}.concise(${sj_prefixes}).indexOf('${escape_str(s_text)}')`;
											},
										};
									}
									// no contents given; exact datatype
									else if(b_datatype) {
										return {
											tags: xm_tags,

											prefixes: !!sj_prefixes,

											rank: b_prefixed_datatype? X_RANK_CONCISE_PREFIXES_STRING_EQUALS: X_RANK_CONCISE_STRING_EQUALS,

											gen(sj_target) {
												return /* syntax: js */ `'${escape_str(s_text.slice(1))}' === ${sj_target}.datatype.concise(${sj_prefixes})`;
											},
										};
									}
									// exact language
									else {
										return {
											tags: xm_tags,

											rank: X_RANK_CONCISE_STRING_INDEX_OF,

											gen(sj_target) {
												return /* syntax: js */ `'${escape_str(s_text.slice(1))}' === ${sj_target}.language`;
											},
										};
									}
								}
								// no content delimiter; match start of datatype
								else if(b_datatype) {
									return {
										tags: xm_tags,

										prefixes: !!sj_prefixes,

										rank: b_prefixed_datatype? X_RANK_CONCISE_PREFIXES_STRING_INDEX_OF: X_RANK_CONCISE_STRING_INDEX_OF,

										gen(sj_target) {
											return /* syntax: js */ `0 === ${sj_target}.datatype.concise(${sj_prefixes}).indexOf('${escape_str(s_text)}')`;
										},
									};
								}
								// start of language
								else {
									return {
										tags: xm_tags,

										rank: X_RANK_STRING_INDEX_OF,

										gen(sj_target) {
											return /* syntax: js */ `0 === ${sj_target}.language.indexOf('${escape_str(s_text.slice(1))}')`;
										},
									};
								}
							}
						}

						// simple literal
						case '"': {
							let s_contents = s_text.slice(1);

							// exact contents
							if(s_anchor_end) {
								return {
									tags: XM_TERM_TAG_LITERAL_SIMPLE,

									rank: X_RANK_STRING_EQUALS,

									gen(sj_target) {
										return /* syntax: js */ `'${s_contents}' === ${sj_target}.value`;
									},
								};
							}
							// starts with
							else {
								return {
									tags: XM_TERM_TAG_LITERAL_SIMPLE,

									rank: X_RANK_STRING_INDEX_OF,

									gen(sj_target) {
										return /* syntax: js */ `0 === ${sj_target}.value.indexOf('${s_contents}')`;
									},
								};
							}
						}

						// absolute iri
						case '>': {
							let p_iri = s_text.slice(1);

							// exact contents
							if(s_anchor_end) {
								return {
									tags: XM_TERM_TAG_LITERAL_SIMPLE,

									rank: X_RANK_STRING_EQUALS,

									gen(sj_target) {
										return /* syntax: js */ `'${p_iri}' === ${sj_target}.value`;
									},
								};
							}
							// starts with
							else {
								return {
									tags: XM_TERM_TAG_LITERAL_SIMPLE,

									rank: X_RANK_STRING_INDEX_OF,

									gen(sj_target) {
										return /* syntax: js */ `0 === ${sj_target}.value.indexOf('${p_iri}')`;
									},
								};
							}
						}

						// prefixed node
						default: {
							let i_colon = s_text.indexOf(':');
							let si_prefix = s_text.slice(0, i_colon);
							let s_suffix = s_text.slice(i_colon+1);

							let si_var_iri = this.acquire('p_iri');

							// exact
							if(s_anchor_end) {
								// f_test = (kt, g) => kt.value === g.prefixes[si_prefix]+s_suffix;
								return {
									tags: XM_TERM_TAG_NODE_NAMED,

									rank: X_RANK_STRING_EQUALS,

									hooks() {
										return track_prefix(si_var_iri, si_prefix, s_suffix);
									},

									gen(sj_target) {
										return /* syntax: js */ `${si_var_iri} === ${sj_target}.value`;
									},
								};
							}
							// starts with
							else {
								// f_test = (kt, g) => kt.value.startsWith(g.prefixes[si_prefix]+s_suffix);
								return {
									tags: XM_TERM_TAG_NODE_NAMED,

									rank: X_RANK_STRING_INDEX_OF,

									hooks() {
										return track_prefix(si_var_iri, si_prefix, s_suffix);
									},

									gen(sj_target) {
										return /* syntax: js */ `0 === ${sj_target}.value.indexOf(${si_var_iri})`;
									},
								};
							}
						}
					}
				}
				// ends with
				else if(s_anchor_end) {
					// f_test = kt => kt.value.endsWith(s_text);
					return {
						rank: X_RANK_STRING_ENDS_WITH,

						gen(sj_target) {
							return /* syntax: js */ `${sj_target}.concise().endsWith('${escape_str(s_text)}')`;
						},
					};
				}
				// contains
				else {
					// f_test = kt => kt.value.indexOf(s_text) > -1;
					return {
						rank: X_RANK_STRING_INDEX_OF,

						gen(sj_target) {
							return /* syntax: js */ `${sj_target}.concise().indexOf('${escape_str(s_text)}') > -1`;
						},
					};
				}
			}
			// not plain regex
			else {
				let si_var_regex = this.acquire('rt_term');

				return {
					rank: X_RANK_CONCISE_REGEX,

					prefixes: true,

					hooks() {
						return {
							declare: /* syntax: js */ `let ${si_var_regex} = /${s_source}/${r_pattern.flags};`,
						};
					},

					gen(sj_target) {
						return /* syntax: js */ `${si_var_regex}.test(${sj_target}.concise(h_prefixes))`;
					},
				};
			}
		}
		// not concise term
		else {
			let si_var_regex = this.acquire('rt_term');

			return {
				rank: X_RANK_REGEX,

				hooks() {
					return {
						declare: /* syntax: js */ `let ${si_var_regex} = /${s_source}/${r_pattern.flags};`,
					};
				},

				gen(sj_target) {
					return /* syntax: js */ `${si_var_regex}.test(${sj_target}.value)`;
				},
			};
		}
	},

	ref(s_ref) {
		this._as_destructures.add(s_ref);

		return {
			rank: X_RANK_TERM_COMPARE,

			gen(sj_target) {
				return /* syntax: js */ `${sj_target}.equals(kt_${s_ref})`;
			},
		};
	},
};


class Context {
	constructor() {
		this._c_vars =0;
		this._s_declare = '';
		this._h_prefix_handlers = {};
		this._b_capture_prefixes = false;
		this._as_destructures = new Set();
		this._a_refs = [];
		this._c_patterns = 0;
	}

	start_pattern() {
		this._a_refs.push({});
		this._c_patterns += 1;
	}

	acquire(s_var) {
		return `${s_var}_${this._c_vars++}`;
	}

	push_hook(g_hook) {
		if(g_hook.declare) {
			this._s_declare += g_hook.declare;
		}

		if(g_hook.prefix) {
			let h_handlers = this._h_prefix_handlers;

			let h_prefix = g_hook.prefix;
			for(let si_prefix in h_prefix) {
				(h_handlers[si_prefix] = h_handlers[si_prefix] || [])
					.push(h_prefix[si_prefix]);
			}
		}
	}

	get destructures() {
		return this._as_destructures;
	}

	get declarations() {
		return this._s_declare;
	}

	get prefix_handlers() {
		return this._h_prefix_handlers;
	}

	get capture_prefixes() {
		return this._b_capture_prefixes;
	}

	compile(g_src) {
		let {
			type: s_type,
			value: w_value,
		} = g_src;

		if(!(s_type in H_COMPILERS)) {
			console.assert(`syntax object type ${s_type} not mapped`);
		}

		let g_compiled = H_COMPILERS[s_type].call(this, w_value);

		// special handling for hooks
		if(g_compiled.hooks) {
			this.push_hook(g_compiled.hooks());
		}

		// prefixes
		if(g_compiled.prefixes) {
			this._b_capture_prefixes = true;
		}

		g_compiled.auto = (sj_target) => {
			let sj_compiled = g_compiled.gen(sj_target);

			if(g_compiled.tags) {
				let sj_pretag = pretag(g_compiled, sj_target);

				return wrap(sj_pretag+sj_compiled, sj_pretag);
			}
			else {
				return sj_compiled;
			}
		};

		return g_compiled;
	}
}


class Pattern {
	constructor(k_context, g_source) {
		let x_rank = 0;
		let c_decay = 0;

		let a_conditions = this._a_conditions = [];
		let a_destructures = this._a_destructures = [];
		this._g_graph = null;

		k_context._c_patterns += 1;

		if(g_source.graph) {
			let g_compiled = k_context.compile(g_source.graph);

			x_rank += g_compiled.rank / (Math.pow(2, c_decay++));

			let b_default_graph = XM_TERM_TAG_DEFAULT_GRAPH === g_compiled.tags;

			if(b_default_graph) {
				this._g_graph = {
					compiled: g_compiled,
					condition: g_compiled.auto(/* syntax: js */ `kt_graph`),
					variable: 'b_default_graph',
					default: true,
				};

				a_conditions.push('b_default_graph');
			}
			else {
				let si_var_graph = k_context.acquire('b_graph_pass');

				this._g_graph = {
					compiled: g_compiled,
					condition: g_compiled.auto(/* syntax: js */ `kt_graph`),
					variable: b_default_graph? 'b_default_graph': si_var_graph,
					default: b_default_graph,
				};

				a_conditions.push(si_var_graph);
			}
		}

		if(g_source.object) {
			let g_compiled = k_context.compile(g_source.object);

			x_rank += g_compiled.rank / (Math.pow(2, c_decay++));

			a_conditions.push(g_compiled.auto(/* syntax: js */ `kt_object`));

			a_destructures.push('object');
		}

		if(g_source.subject) {
			let g_compiled = k_context.compile(g_source.subject);

			x_rank += g_compiled.rank / (Math.pow(2, c_decay++));

			a_conditions.push(g_compiled.auto(/* syntax: js */ `kt_subject`));

			a_destructures.push('subject');
		}

		if(g_source.predicate) {
			let g_compiled = k_context.compile(g_source.predicate);

			x_rank += g_compiled.rank / (Math.pow(2, c_decay++));

			a_conditions.push(g_compiled.auto(/* syntax: js */ `kt_predicate`));

			a_destructures.push('predicate');
		}

		this._x_rank = x_rank;
	}

	get destructures() {
		return this._a_destructures;
	}

	get graph() {
		return this._g_graph;
	}

	get rank() {
		return this._x_rank;
	}

	get conditions() {
		return this._a_conditions.join('\n\t && ');
	}
}

const gobble = (s_text) => {
	let m_indent = /^(?:\s*\n)+([ \t]*)/.exec(s_text);
	if(m_indent) {
		let r_indent = new RegExp('\\n'+m_indent[1], 'g');
		return s_text.trim().replace(r_indent, '\n');
	}
	else {
		return s_text;
	}
};

function prepare(a_sources) {
	let k_context = new Context();

	let a_patterns = a_sources
		.map(g_source => new Pattern(k_context, g_source))
		.sort(F_SORT_GEN_RANK);

	let sj_init = '';
	let sj_events = '';

	let a_graphs = [];

	// each pattern
	for(let k_pattern of a_patterns) {
		// graphs
		if(k_pattern.graph) {
			a_graphs.push(k_pattern.graph);
		}

		// declarations
		if(k_pattern.declarations) {
			sj_init += k_pattern.declarations;
		}
	}

	// prefix events
	{
		let s_branches = '';

		// prefix cases
		let h_prefix_cases = k_context.prefix_handlers;
		for(let si_prefix in h_prefix_cases) {
			s_branches += /* syntax: js.switch */ `
				case '${si_prefix}': {
					${h_prefix_cases[si_prefix].join('\n')}
					break;
				}
			`;
		}

		if(s_branches || k_context.capture_prefixes) {
			sj_init += /* syntax: js */ `let h_prefixes = {};\n`;

			sj_events += /* syntax: js */ `
				ds_reader.on('prefix', (si_prefix, p_iri) => {
					${k_context.capture_prefixes? /* syntax: js */ `h_prefixes[si_prefix] = p_iri;`: ''}

					switch(si_prefix) {
						${s_branches}
					}
				});
			`;
		}
	}

	// graph events
	if(a_graphs.length) {
		// filter non-defaults
		let a_graphs_nond = [];

		// default graph present
		let b_default_graph = false;
		{
			// each graph
			for(let g_graph of a_graphs) {
				if(g_graph.default) {
					b_default_graph = true;
				}
				else {
					a_graphs_nond.push(g_graph);
				}
			}

			// default graph
			if(b_default_graph) {
				sj_init += /* syntax: js */ `let b_default_graph = true;\n`;
			}
		}

		sj_init += /* syntax: js */ `const KT_DEFAULT_GRAPH = factory.defaultGraph();\n`;
		sj_init += a_graphs_nond.map(g => /* syntax: js */ `let ${g.variable}_init = (kt_graph => (${g.condition}))(KT_DEFAULT_GRAPH);\n`);
		sj_init += a_graphs_nond.map(g => /* syntax: js */ `let ${g.variable} = ${g.variable}_init;\n`);

		sj_events = /* syntax: js */ `
			ds_reader.on('enter', (kt_graph) => {
				${a_graphs_nond.map(g => /* syntax: js */ `
					if(${g.condition}) {
						${g.variable} = true;
						${b_default_graph? /* syntax: js */ `b_default_graph = false;`: ''}
					}
				`)}

				${b_default_graph
					? /* syntax: js */ `
						if(kt_graph.isDefaultGraph) {
							b_default_graph = true;
						}
					`
					: ''}
			});

			ds_reader.on('exit', (kt_graph) => {
				${a_graphs_nond.map(g => /* syntax: js */ `
					${g.variable} = ${g.variable}_init;
				`)}

				${b_default_graph
					? /* syntax: js */ `
						if(!kt_graph.isDefaultGraph) {
							b_default_graph = false;
						}
					`
					: ''}
			});
		`;
	}

	// destructures
	let sj_destructures = Array.from(
		a_patterns.reduce((as_out, k) => new Set([...as_out, ...k.destructures]), k_context.destructures),
	).map(s => /* syntax: js */ `let kt_${s} = g_quad.${s};`).join('\n');
	// final filter
	let sj_filter = gobble(/* syntax: js */ `
		${k_context.declarations}
		${sj_init}

		let ds_filter = new stream.Transform.QuadsToOther({
			objectMode: true,

			transform(g_quad, s_encoding, fke_transform) {
				${sj_destructures}
				let b_cond = ${a_patterns.map(k => wrap(k.conditions, a_patterns.length > 1)).join('\n\t ||')};

				// condition passed
				if(b_cond) {
					this.push(g_quad);
				}

				// done with quad
				fke_transform();
			},
		});

		ds_filter.on('pipe', (ds_reader) => {
			${sj_events}
		});

		return ds_filter;
	`);

	return sj_filter;
}

module.exports = {
	prepare,
};
