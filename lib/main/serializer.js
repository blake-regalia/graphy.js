const stream = require('stream');
const graphy = require('./graphy.js');
const DC_URL = require('../isomorphic/locals.js').URL;

const R_NAMED_NODE_CHARS_INVALID = /[\0- <>"{}|^`\\]/g;
const R_INVALID_PREFIXED_NAME = /^\.|(?:[\u0000-,/;-@[-^`{-\u00bf\u00d7\u00f7\u0300-\u306f\u037e\u2000-\u200b\u200e-\u206f\u2190-\u2bff\u2ff0-\u3000\ud800-\uf8ff\ufdd0-\ufddf\uffff])/;

const HM_DEFAULT_COERCE = new Map();
HM_DEFAULT_COERCE.set(Date, dt => graphy.literal(dt.toISOString(), graphy.namedNode('http://www.w3.org/2001/XMLSchema#dateTime')));

class HumanReadableSerializer extends stream.Readable {
	constructor(h_config, dc_writer) {
		super();

		let hm_coercions = HM_DEFAULT_COERCE;
		if(h_config.coercions) {
			hm_coercions = new Map(HM_DEFAULT_COERCE);
			for(let [dc_type, f_transform] of h_config.coercions) {
				hm_coercions.set(dc_type, f_transform);
			}
		}

		Object.assign(this, {
			nested_blank_nodes: false,
			blank_node_index: 0,
			prefixes: h_config.prefixes || {},
			coercions: hm_coercions,
			writer: new dc_writer(null, '', this),
		});

		if(h_config.ready) {
			h_config.ready.apply(this);
		}
	}

	// proxy writer methods
	add(...a_args) {
		this.writer.add(...a_args);
	}


	_read() {}

	// generate ct-* prefixes
	ct_prefixes() {
		let h_prefixes = this.prefixes;
		let s_prefixes = '';
		for(let s_prefix_id in h_prefixes) {
			s_prefixes += `@prefix ${s_prefix_id}: <${h_prefixes[s_prefix_id]}> .\n`;
		}
		this.push(s_prefixes+'\n');
	}

	// convert ct string to verbose node
	ct_node_verbose(s_ct) {
		// full iri path
		if('>' === s_ct[0]) {
			// make it a valid iri
			return (new DC_URL(s_ct.slice(1))).toString();
		}
		// blank node
		else if('_' === s_ct[0]) {
			return '_:'+s_ct.slice(1);
		}
		// no good
		else if('<' === s_ct[0]) {
			throw new Error('absolute IRIs using the concise-term string syntax must start with `>`. Invalid term string: '+s_ct);
		}

		// find delimiter
		let i_colon = s_ct.indexOf(':');
		if(-1 === i_colon) throw 'ct string must be for a node';

		// split word to prefix and suffix
		let s_prefix = s_ct.slice(0, i_colon);
		let s_suffix = s_ct.slice(i_colon+1);

		// check prefix
		let h_prefixes = this.prefixes;

		// no such prefix
		if(!(s_prefix in h_prefixes)) throw `prefix not mapped '${s_prefix}'`;

		// join prefix iri with suffix
		return `<${h_prefixes[s_prefix]}${s_suffix}>`;
	}

	// convert ct string to terse node
	ct_node_terse(s_ct) {
		// rdf:type shortcut
		if('a' === s_ct) return 'a';

		// next blank node
		if(!s_ct.length) return '_:b'+(this.blank_node_index++);

		// full iri path
		if('>' === s_ct[0]) {
			// make it a valid iri
			let p_iri = (new DC_URL(s_ct.slice(1))).toString();

			// find best prefix
			let s_best_prefix_id;
			let nl_best_prefix = 0;
			let h_prefixes = this.prefixes;
			for(let s_prefix_id in h_prefixes) {
				let p_prefix_iri = h_prefixes[s_prefix_id];
				if(p_iri.startsWith(p_prefix_iri) && p_prefix_iri.length > nl_best_prefix) {
					s_best_prefix_id = s_prefix_id;
					nl_best_prefix = p_prefix_iri.length;
				}
			}

			// found one; try to express as terse
			if(nl_best_prefix) {
				return this.ct_prefixed_node_terse(`${s_best_prefix_id}:${p_iri.slice(nl_best_prefix)}`);
			}
			// no suporting prefix found; use full iri
			else {
				return '<'+p_iri+'>';
			}
		}
		// blank node
		else if('_' === s_ct[0]) {
			return '_:'+s_ct.slice(1);
		}
		// no good
		else if('<' === s_ct[0]) {
			throw new Error('absolute IRIs using the concise-term string syntax must start with `>`. Invalid term string: '+s_ct);
		}

		// attempt prefixed named node
		return this.ct_prefixed_node_terse(s_ct);
	}

	// convert ct string of prefixed node to terse node
	ct_prefixed_node_terse(s_ct) {
		// find delimiter
		let i_colon = s_ct.indexOf(':');
		if(-1 === i_colon) {
			if(this.shortcuts) {
				let s_expanded = this.shortcuts[s_ct];
				if(s_expanded) return s_expanded;
			}

			throw `subject must be ct string, instead got "${s_ct}"`;
		}

		// split word to prefix and suffix
		let s_prefix = s_ct.slice(0, i_colon);
		let s_suffix = s_ct.slice(i_colon+1);

		// check prefix
		let h_prefixes = this.prefixes;

		// no such prefix
		if(!(s_prefix in h_prefixes)) throw `prefix not mapped '${s_prefix}'`;

		// suffix cannot be used safely with prefixed name
		if(R_INVALID_PREFIXED_NAME.test(s_suffix)) {
			// join prefix iri with suffix
			return `<${h_prefixes[s_prefix]}${s_suffix}>`;
		}
		// input ct string can be used in serialization
		else {
			return s_ct;
		}
	}

	// convert ct string to term
	ct_term(s_ct) {
		// find quote
		let i_quote = s_ct.indexOf('"');

		// literal
		if(-1 !== i_quote) {
			// extract literal content and escape
			let s_literal = '"'+s_ct.slice(i_quote+1).replace(/\\/g, '\\\\').replace(/"/g, '\\"')+'"';

			// language tag
			if('@' === s_ct[0]) {
				s_literal += s_ct.slice(0, i_quote).toLowerCase();
			}
			// datatyped
			else if('^' === s_ct[0]) {
				let s_datatype = s_ct.slice(1, i_quote);
				s_literal += '^^'+this.ct_node(s_datatype);
			}
			// not plain
			else if(i_quote) {
				throw 'invalid ct string/literal';
			}

			// terse literal term
			return s_literal;
		}
		// not a literal
		else {
			return this.ct_node(s_ct);
		}
	}

	// hash comment
	hash_comment(s_comment) {
		s_comment.split(/\n/g).forEach((s_line) => {
			this.push(`#${s_line}\n`);
		});
	}

	// blank line
	blank_line() {
		throw 'class that extends serializer must implement `blank_line` method';
	}

	convert_ct() {
		throw 'class that extends serializer must implement `convert_ct()` method';
	}

	from_term() {
		throw 'class that extends serializer must implement `from_term()` method';
	}

	comment() {
		throw 'class that extends serializer must implement `comment()` method';
	}

	close() {
		throw 'class that extends serializer must implement `close()` method';
	}
}

class QuadsWriter {
	constructor(k_serializer) {
		this.serializer = k_serializer;
	}

	// create a triples writer for the given graph
	graph(s_graph) {
		let k_serializer = this.serializer;
		return new TriplesWriter(this, k_serializer.ct_node(s_graph), k_serializer);
	}

	// create a subject writer using the default graph
	subject(s_subject) {
		let k_triples = new TriplesWriter(this, '', this.serializer);
		return k_triples.subject(s_subject);
	}

	// add quads to output
	add(h_quads) {
		// each entry in quads hash
		for(let s_graph in h_quads) {
			// graph is key
			let z_triples = h_quads[s_graph];

			// create triples writer and then write to it
			this.graph(s_graph).add(z_triples, 0);
		}
	}
}

class Writer {
	constructor(k_parent, s_term, k_serializer) {
		Object.assign(this, {
			serializer: k_serializer,
			parent: k_parent,
			term: s_term,
		});
	}
}

class TriplesWriter extends Writer {
	// create a subject writer
	subject(s_subject) {
		let k_serializer = this.serializer;
		return new PairsWriter(this, k_serializer.ct_node(s_subject), k_serializer);
	}

	// add triples to output
	add(h_triples, x_mask=4) {
		// each entry in triples hash
		for(let s_subject in h_triples) {
			// [subject] => pairs
			let z_pairs = h_triples[s_subject];

			// create pairs writer and then write to it
			this.subject(s_subject).add(z_pairs, x_mask);

			// same graph now
			x_mask |= 4;
		}
	}
}


class PairsWriter extends Writer {
	// create a predicate writer
	predicate(s_ct) {
		let k_serializer = this.serializer;
		return new ObjectsWriter(this, k_serializer.ct_node(s_ct), k_serializer);
	}

	// add triple using this subject
	add(h_pairs, x_mask=0) {
		// each item in add pairs
		for(let s_predicate in h_pairs) {
			// [predicate] => objects
			let w_objects = h_pairs[s_predicate];

			// create objects writer and then write to it
			this.predicate(s_predicate).add(w_objects, x_mask);

			// debugger;

			// same subject now
			x_mask |= 2;
		}
	}
}


class ObjectsWriter extends Writer {

	serialize(z_objects, x_mask=0, n_nest_level=1) {
		let k_serializer = this.serializer;
		let hm_coercions = k_serializer.coercions;

		// bad type
		if(!z_objects) {
			throw `bad/empty RDF object: [${typeof z_object}] ${null===z_objects? null: z_objects.constructor} "${z_objects}"`;
		}
		// t3 string
		else if('string' === typeof z_objects) {
			return k_serializer.ct_term(z_objects);
		}
		// an array
		else if(Array.isArray(z_objects)) {
			// apply to each object
			z_objects.forEach((z) => {
				// recurse
				this.add(z, x_mask);

				// now they share same graph, subject & predicate
				x_mask |= 7;
			});

			return;
		}
		// blank node
		else if(Object === z_objects.constructor) {
			// blank node nesting
			if(k_serializer.nested_blank_nodes) {
				// same graph/subject
				x_mask = x_mask & 6;

				// outer mask
				let x_outer_mask = x_mask;

				//
				const serialize_pair = (s_predicate, z, x) => {
					// serialize object
					let s_object_ = this.serialize(z, x, n_nest_level+1);

					// make pair
					return k_serializer.pair(s_predicate, s_object_, x, n_nest_level);
				};

				// open blank node
				let s_pairs = k_serializer.nest_open(n_nest_level);

				// each pair
				for(let s_predicate in z_objects) {
					// [predicate] => object
					let z_object = z_objects[s_predicate];

					// object list
					if(Array.isArray(z_object)) {

						// each item in list
						z_object.forEach((z) => {
							s_pairs += serialize_pair(s_predicate, z, x_mask);

							// now they share same predicate
							x_mask |= 1;
						});
					}
					// regular object
					else {
						s_pairs += serialize_pair(s_predicate, z_object, x_mask);
					}
				}

				// close blank node
				s_pairs += k_serializer.nest_close(n_nest_level);

				// complex nesting; just return as string
				if(n_nest_level > 1) {
					return s_pairs;
				}
				// top tier nest; serialize it
				else {
					// output that serialization
					k_serializer.data(this, s_pairs, x_outer_mask);
				}

				return;
			}
			// must create name for anonymous blank node
			else {
				// make blank node label
				let s_blank_node = '_:g'+(k_serializer.blank_node_index++);

				// create node
				let k_blank_node = this.parent.parent.subject(s_blank_node);

				// add pairs normally (same graph tho!)
				k_blank_node.add(z_objects, x_mask & 4);

				// then continue with outer triple where blank node is object
				return s_blank_node;
			}
		}
		// coercable instance
		else if(hm_coercions.has(z_objects.constructor)) {
			let h_term = hm_coercions.get(z_objects.constructor).call(k_serializer, z_objects, k_serializer);
			return k_serializer.from_term(h_term);
		}
		// RDFJS term
		else if(z_objects.termType) {
			return k_serializer.from_term(z_objects);
		}
		// bad type
		else {
			throw `bad type for RDF object: [${typeof z_object}] ${z_objects.constructor}`;
		}
	}

	// add object
	add(z_objects, x_mask=0) {
		// attempt to serialize object
		let s_object = this.serialize(z_objects, x_mask);

		// serialization emits normal event
		if(s_object) {
			// emit data with mask
			this.serializer.data(this, s_object, x_mask);
		}
	}
}



module.exports = {
	quads: QuadsWriter,
	triples: TriplesWriter,
	human: HumanReadableSerializer,
};
