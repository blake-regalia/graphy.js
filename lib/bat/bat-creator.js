const bat = require('./bat.js');


const HP_DICTIONARY_SIZE = Symbol('size');

class bat_creator {

	constructor(h_serialized=null) {

		if(h_serialized) {
			Object.assign(this, h_serialized);
		}
		else {
			Object.assign(this, {
				prefix_groups: Object.create(null),
				// prefix_node_count: 0,
				// datatype_node_count: 0,
				// prefix_key_bytes: 0,

				// prefix_nodes: null,
				// prefix_datatypes: null,

				nodes: {
					blank_count: 0,
					blank: Object.create(null),

					absolute_count: 0,
					absolute: Object.create(null),

					prefixed_count: 0,
					prefixed: [],
				},

				literals: {
					datatyped_absolute_count: 0,
					datatyped_absolute: Object.create(null),

					// datatyped_prefixed_count: 0,
					// datatyped_prefixed: [],

					languages_count: 0,
					languaged_count: 0,
					languaged: Object.create(null),

					plain_count: 0,
					plain: Object.create(null),

					// front_coder: new bat.front_coder(h_front_coder_config),
				},

				uti: 0,
				triples_spo: Object.create(null),
			});
		}
	}

	save_named_node(p_iri, n_type) {
		let h_prefix_groups = this.prefix_groups;

		// determine best prefix
		let m_compress = bat.R_COMPRESS.exec(p_iri);
		if(m_compress) {
			// destructure prefix fragments
			let [, p_prefix_iri, s_suffix] = m_compress;

			// first encounter of prefix
			if(!(p_prefix_iri in h_prefix_groups)) {
				// create prefix map; assign node
				h_prefix_groups[p_prefix_iri] = {
					node_count: 1,
					nodes: Object.assign(Object.create(null), {
						[s_suffix]: {type:n_type, id:this.uti},
					}),
				};

				return this.uti++;
			}
			// prefix exists
			else {
				let h_group = h_prefix_groups[p_prefix_iri];

				// other datatypes with prefix exist
				if('nodes' in h_group) {
					let h_nodes = h_group.nodes;

					// first encounter of node; set type and increment prefix's node counter
					if(!(s_suffix in h_nodes)) {
						h_group.node_count += 1;
						h_nodes[s_suffix] = {type:n_type, id:this.uti};

						return this.uti++;
					}
					// update node type
					else {
						h_nodes[s_suffix].type |= n_type;

						return h_nodes[s_suffix].id;
					}
				}
				// first node for this prefix
				else {
					Object.assign(h_group, {
						node_count: 1,
						nodes: Object.assign(Object.create(null), {
							[s_suffix]: {type:n_type, id:this.uti},
						}),
					});

					return this.uti++;
				}
			}
		}
		// node could not be prefixed
		else {
			let h_nodes = this.nodes.absolute;

			// first encounter of node; set type
			if(!(p_iri in h_nodes)) {
				this.nodes.absolute_count += 1;
				h_nodes[p_iri] = {type:n_type, id:this.uti};

				return this.uti;
			}
			// update node type
			else {
				h_nodes[p_iri].type |= n_type;

				return h_nodes[p_iri].id;
			}
		}
	}

	save_datatyped_literal(s_value, p_datatype_iri) {
		let h_prefix_groups = this.prefix_groups;

		// determine best prefix
		let m_compress = bat.R_COMPRESS.exec(p_datatype_iri);
		if(m_compress) {
			// destructure prefix fragments
			let [, p_prefix_iri, s_suffix] = m_compress;

			// prefix exists
			if(p_prefix_iri in h_prefix_groups) {
				let h_group = h_prefix_groups[p_prefix_iri];

				// other datatype with prefix exists
				if('datatypes' in h_group) {
					let h_datatypes = h_group.datatypes;

					// first encounter of this datatype
					if(!(s_suffix in h_datatypes)) {
						h_group.datatype_count += 1;
						h_datatypes[s_suffix] = {
							[s_value]: this.uti,
						};

						return this.uti++;
					}
					// add literal to datatype's set
					else {
						let h_datatype = h_datatypes[s_suffix];

						// first encounter with literal
						if(!(s_value in h_datatype)) {
							return h_datatype[s_value] = this.uti++;
						}
						// literal already exists; return unique literal id
						else {
							return h_datatype[s_value];
						}
					}
				}
				// first datatype for this prefix
				else {
					Object.assign(h_group, {
						datatype_count: 1,
						datatypes: {
							[s_suffix]: {
								[s_value]: this.uti,
							},
						},
					});

					return this.uti++;
				}
			}
			// first encounter of prefix
			else {
				// create prefix map; assign node
				h_prefix_groups[p_prefix_iri] = {
					datatype_count: 1,
					datatypes: Object.assign(Object.create(null), {
						[s_suffix]: {
							[s_value]: this.uti,
						},
					}),
				};

				return this.uti++;
			}
		}
		// node could not be prefixed
		else {
			let h_literals = this.literals;
			let h_datatypes = h_literals.datatyped_absolute;

			// first encounter of node; set type
			if(!(p_datatype_iri in h_datatypes)) {
				h_literals.datatyped_absolute_count += 1;
				h_datatypes[p_datatype_iri] = {
					[s_value]: this.uti,
				};

				return this.uti++;
			}
			// add literal to datatype's set
			else {
				let h_datatype = h_datatypes[p_datatype_iri];

				// first encounter with literal
				if(!(s_value in h_datatype)) {
					return h_datatype[s_value] = this.uti++;
				}
				// literal already exists; return unique literal id
				else {
					return h_datatype[s_value];
				}
			}
		}
	}

	save_language_literal(s_value, s_lang) {
		let h_literals = this.literals;
		let h_languaged = h_literals.languaged;

		// another litera exists with same language tag; add literal to language's set
		if(s_lang in h_languaged) {
			let h_language = h_languaged[s_lang];

			// first encounter of literal
			if(!(s_value in h_language)) {
				// h_language[HP_DICTIONARY_SIZE] += 1;
				h_literals.languaged_count += 1;
				return h_language[s_value] = this.uti++;
			}
			// literal already exists; return unique literal id
			else {
				return h_language[s_value];
			}
		}
		// first encounter of language tag
		else {
			h_literals.languages_count += 1;
			h_literals.languaged_count += 1;
			h_languaged[s_lang] = {
				// [HP_DICTIONARY_SIZE]: 1,
				[s_value]: this.uti,
			};

			return this.uti++;
		}
	}

	save_plain_literal(s_value) {
		let h_plain = this.literals.plain;

		// literal already exists; return unique literal id
		if(s_value in h_plain) {
			return h_plain[s_value];
		}
		// first encounter of literal
		else {
			this.literals.plain_count += 1;
			return h_plain[s_value] = this.uti++;
		}
	}

	save_blank_node(p_label, n_type) {
		let h_blank_nodes = this.nodes.blank;

		// update node type
		if(p_label in h_blank_nodes) {
			h_blank_nodes[p_label].type |= n_type;

			return h_blank_nodes[p_label].id;
		}
		// first encounter of node; set type
		else {
			this.nodes.blank_count += 1;
			h_blank_nodes[p_label] = {type:n_type, id:this.uti};

			return this.uti++;
		}
	}

	save_triple(h_triple) {
		// ref all positions of triple
		let {
			subject: h_subject,
			predicate: h_predicate,
			object: h_object,
		} = h_triple;

		let i_s;

		// subject is named node
		if(h_subject.isNamedNode) {
			i_s = this.save_named_node(h_subject.value, bat.XM_NODE_SUBJECT);
		}
		// subject is blank node
		else {
			i_s = this.save_blank_node(h_subject.value, bat.XM_NODE_SUBJECT);
		}

		// predicate is always named node
		let i_p = this.save_named_node(h_predicate.value, bat.XM_NODE_PREDICATE);

		let i_o;

		// object is literal
		if(h_object.isLiteral) {
			// ... a language literal
			if(h_object.language) {
				i_o = this.save_language_literal(h_object.value, h_object.language);
			}
			// ... a datatyped literal
			else if(h_object.hasOwnProperty('datatype')) {
				// datatype is always a named node
				i_o = this.save_datatyped_literal(h_object.value, h_object.datatype.value);
			}
			// ... a plain literal
			else {
				i_o = this.save_plain_literal(h_object.value);
			}
		}
		// object is named node
		else if(h_object.isNamedNode) {
			i_o = this.save_named_node(h_object.value, bat.XM_NODE_OBJECT);
		}
		// object is blank node
		else {
			i_o = this.save_blank_node(h_object.value, bat.XM_NODE_OBJECT);
		}

		// save triple using utis
		this.save_spo(i_s, i_p, i_o);
	}


	save_spo(i_s, i_p, i_o) {
		let h_triples = this.triples_spo;

		if(i_s in h_triples) {
			let h_pair = h_triples[i_s];

			if(i_p in h_pair) {
				let a_list = h_pair[i_p];
				a_list.push(i_o);
			}
			else {
				h_pair[i_p] = [i_o];
			}
		}
		else {
			h_triples[i_s] = {
				[i_p]: [i_o],
			};
		}
	}


	export() {
		return {
			prefix_groups: this.prefix_groups,
			nodes: this.nodes,
			literals: this.literals,
			uti: this.uti,
			triples_spo: this.triples_spo,
		};
	}

	import(h_import) {
		console.time('import');

		let {
			prefix_groups: h_prefix_groups,
			nodes: {
				blank: h_nodes_blank,
				prefixed: a_nodes_prefixed,
			},
			literals: {
				plain: h_literals_plain,
				languaged: h_literals_languaged,
			},
			uti: i_uti,
			triples_spo: h_triples,
		} = this;

		let {
			prefix_groups: h_prefix_groups_import,
			nodes: {
				blank: h_nodes_blank_import,
				prefixed: a_nodes_prefixed_import,
			},
			literals: {
				plain: h_literals_plain_import,
				languaged: h_literals_languaged_import,
			},
			uti: i_uti_import,
			triples_spo: h_triples_import,
		} = h_import;

		let h_remap = {};

		// blank nodes
		for(let s_label in h_nodes_blank_import) {
			let h_node_blank_import = h_nodes_blank_import[s_label];

			if(s_label in h_nodes_blank) {
				let h_node_blank = h_nodes_blank[s_label];

				h_node_blank.type |= h_nodes_blank_import.type;
				h_remap[h_nodes_blank_import.id] = h_node_blank.id;
			}
			else {
				h_nodes_blank[s_label] = h_node_blank_import;
				h_node_blank_import.id += i_uti;
			}
		}

		// prefixed nodes
		for(let s_prefix in h_prefix_groups_import) {
			let h_group_import = h_prefix_groups_import[s_prefix];

			if(s_prefix in h_prefix_groups) {
				let h_group = h_prefix_groups[s_prefix];
				let h_nodes = h_group.nodes;

				let h_nodes_import = h_group_import.nodes;
				for(let s_suffix in h_nodes_import) {
					let h_node_import = h_nodes_import[s_suffix];

					if(s_suffix in h_nodes) {
						let h_node = h_nodes[s_suffix];

						h_node.type |= h_node_import.type;
						h_remap[h_node_import.id] = h_node.id;
					}
					else {
						h_nodes[s_suffix] = h_node_import;
						h_node_import.id += i_uti;
					}
				}
			}
			else {
				h_prefix_groups[s_prefix] = h_group_import;

				let h_nodes = h_group_import.nodes;
				for(let s_suffix in h_nodes) {
					h_nodes[s_suffix].id += i_uti;
				}
			}
		}

		// plain literals
		for(let s_value in h_literals_plain_import) {
			if(s_value in h_literals_plain) {
				h_remap[h_literals_plain_import[s_value]] = h_literals_plain[s_value];
			}
			else {
				h_literals_plain_import[s_value] += i_uti;
			}
		}

		// languaged literals
		for(let s_lang in h_literals_languaged_import) {
			let h_literals_import = h_literals_languaged_import[s_lang];

			if(s_lang in h_literals_languaged) {
				let h_literals = h_literals_languaged[s_lang];

				for(let s_value in h_literals_import) {
					if(s_value in h_literals) {
						h_remap[h_literals_import[s_value]] = h_literals[s_value];
					}
					else {
						h_literals_import[s_value] += i_uti;
					}
				}
			}
			// language not encountered in this; transfer whole object
			else {
				h_literals_languaged_import[s_lang] = h_literals_import;

				for(let s_value in h_literals_import) {
					h_literals_import[s_value] += i_uti;
				}
			}
		}

		// datatyped literals
		// ....
		// debugger;

		for(let si_subject in h_triples_import) {
			let h_pair_import = h_triples_import[si_subject];
			let h_pair;

			// subject id needs remap
			if(si_subject in h_remap) {
				si_subject = h_remap[si_subject];

				// pair exists in this
				if(si_subject in h_triples) {
					h_pair = h_triples[si_subject];
				}
				// create pair in this
				else {
					h_pair = h_triples[si_subject] = {};
				}
			}
			// no remap means this never encountered subject; create pair in this
			else {
				h_pair = h_triples[si_subject+i_uti] = {};
			}

			// each pair in import
			for(let si_predicate in h_pair_import) {
				let a_list_import = h_pair_import[si_predicate];
				let a_list;

				// predicate id needs remap
				if(si_predicate in h_remap) {
					si_predicate = h_remap[si_predicate];

					// object list exists in this
					if(si_predicate in h_pair) {
						a_list = h_pair[si_predicate];
					}
					// create object list in this
					else {
						a_list = h_pair[si_predicate] = [];
					}
				}
				// no remap means this never encounted subject; create list in this
				else {
					a_list = h_pair[si_predicate+i_uti] = [];
				}

				// each object in list
				for(let i_object=0, n_objects=a_list_import.length; i_object<n_objects; i_object++) {
					let x_object = a_list_import[i_object];

					// remap or offset
					if(x_object in h_remap) x_object = +h_remap[x_object];
					else x_object += i_uti;

					// add to list
					a_list.push(x_object);
				}
			}
		}

		this.uti += i_uti_import;

		console.timeEnd('import');
		
		return this;
	}

}


module.exports = bat_creator;
