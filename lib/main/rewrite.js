/**
* import:
**/

// modules
const arginfo = require('arginfo');
const classer = require('classer');
const jsonld = require('jsonld');

/**
* globals:
**/

// prefix extracting regex
const R_PNAME_LN = (() => {
	const S_PN_CHARS_BASE = /[A-Za-z\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02ff\u0370-\u037d\u037f-\u1fff\u200c-\u200d\u2070-\u218f\u2c00-\u2fef\u3001-\ud7ff\uf900-\ufdcf\ufdf0-\ufffd\u10000-\ueffff]/.source;
	const S_PN_CHARS_U = `(?:${S_PN_CHARS_BASE}|_)`;
	const S_PN_CHARS = `${S_PN_CHARS_U}|${/[\-0-9\u00b7\u0300-\u036f\u203f-\u2040]/.source}`;
	const S_PN_PREFIX = `${S_PN_CHARS_BASE}(?:(?:${S_PN_CHARS}|\.)*${S_PN_CHARS})?`;
	const S_PLX_COLON = /%[0-9A-Fa-f]{2}|\\[_~.\-!$&'()*+,;=/?#@%]|:/.source;
	const S_PN_LOCAL = `(?:${S_PN_CHARS_U}|[0-9]|${S_PLX_COLON})(?:(?:${S_PN_CHARS}|[.]|${S_PLX_COLON})*(?:${S_PN_CHARS}|${S_PLX_COLON}))?`;
	const S_PNAME_LN = `((?:${S_PN_PREFIX})?):(${S_PN_LOCAL})`;

	// compile with unicode-aware regex flag
	return new RegExp(S_PNAME_LN, 'u');
})();

// de-facto prefix namespaces
const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#';

// de-facto namespaced iri refs
const P_IRI_XSD_INTEGER = `${P_IRI_XSD}integer`;
const P_IRI_XSD_DECIMAL = `${P_IRI_XSD}decimal`;
const P_IRI_XSD_STRING = `${P_IRI_XSD}string`;



/**
* private static:
**/

// private members
const _private = Symbol();


/**
* helpers:
**/

// find and return longest iri from a given hash of prefixes
const longest_prefix = (p_iri, h_prefixes) => {

	// prep to find best prefix
	let s_best_prefix_name = '';
	let n_longest_iri_length = 0;

	// search prefix hash
	for(let s_prefix in h_prefixes) {
		let s_iri = h_prefixes[s_prefix];

		// namespace can prefix the given iri
		if(p_iri.startsWith(s_iri)) {
			// it is the longest matching iri yet
			if(s_iri.length > n_longest_iri_length) {
				// update longest iri length
				n_longest_iri_length = s_iri.length;

				// store prefix name
				s_best_prefix_name = s_prefix;
			}
		}
	}

	return {
		prefix: s_best_prefix_name,
		namespace: h_prefixes[s_best_prefix_name],
	};
};


// shorten the given full path iri to a prefixed name using the longest prefix available
const n3_shorten = (p_iri, h_prefixes) => {

	// don't use prefixes
	if(!h_prefixes) return '<'+p_iri+'>';

	// compute longest prefix, destruct results
	let {
		prefix: s_best_prefix_name,
		namespace: s_namespace_iri,
	} = longest_prefix(p_iri, h_prefixes);

	// found nothing
	if(!s_best_prefix_name.length) {
		// could not shorten, use full path
		return '<'+p_iri+'>';
	}
	// use best prefix match
	else {
		// concat prefix name with suffixed iri
		return s_best_prefix_name+':'+p_iri.substr(s_namespace_iri.length);
	}
};



/**
* methods:
**/

// transform given ref (prefixed name or iri) to its full path
const $iri_of = Symbol();
const iri_of = (s_ref) => {

	// full path was given; return inner iri
	if('<' === s_ref[0] && '>' === s_ref[s_ref.length-1]) return s_ref.slice(1, -1);

	// match prefix
	let m_prefix = R_PNAME_LN.exec(s_ref);

	// not a prefix, must be an iri; return as is
	if(!m_prefix) {
		local.fail(`who is resolving the iri of a non-n3 reference? "${s_ref}"`);
		return s_ref;
	}

	// otherwise, ref prefix
	let s_prefix = m_prefix[1];

	// lookup iri
	let s_iri = this[_private].h_prefixes[s_prefix];

	// no such prefix
	if(!s_iri) {
		// // rdf namespace
		// if('rdf' === s_prefix) return P_IRI_RDF+m_prefix[2];

		// otherwise, throw error
		throw `no such prefix ${s_prefix}`;
	}

	// return full iri
	return s_iri+m_prefix[2];
};



/**
* class:
**/
class Graphy {

	constructor(h_jsonld, f_okay_graphy) {

		/**
		* private:
		**/

		// hash or IRI => node
		let h_graph = {};

		// map prefix name => IRI
		let h_prefixes = {};

		// save private members
		Object.assign(this, {
			[_private]: {

				// array of IRIs for nodes that are top-level (ie: named things or non-encapsulated blanknodes)
				a_top_nodes: null,

				//
				h_graph,
				h_prefixes,

				//
			},

			//
			[$iri_of]: iri_of,
			[$network_node]: network_node,
		});

		/**
		* main:
		**/

		// track highest indexed blanknode in graph
		let h_blanknode_names = {};

		// transform json-ld to expanded form
		jsonld.expand(h_jsonld, (d_jld_err, a_expanded) => {

			// prepare array for all covered nodes
			let a_entities_unnamespaced = [];

			// prepare set for all top-level nodes
			let h_top_level_nodes = {};

			// each subject node in json-ld object
			a_expanded.forEach((h_node) => {
				// ref node id (blanknode or full iri)
				let s_id = h_node['@id'];

				// blanknode; record which names are in use
				if('_' === s_id[0] && ':' === s_id[1]) {
					h_blanknode_names[s_id.substr(2)] = 1;
				}

				// add mapping id => node
				h_graph[s_id] = h_node;

				// create unnamespaced entity
				a_entities_unnamespaced.push(this[$network_node](h_node));

				// begin with assumption that all nodes are top level
				h_top_level_nodes[s_id] = 1;
			});

			// each node; go searching for blanknode objects
			a_expanded.forEach((h_node) => {

				// each key/value pair
				for(let s_key in h_node) {

					// skip json-ld keys
					if('@' === s_key[0]) continue;

					// ref value
					let a_objects = h_node[s_key];

					// assert objects is array
					if(!Array.isArray(a_objects)) {
						local.fail(`expecting json-ld object to be array; instead got: ${arginfo(a_objects)}`);
					}

					// each object
					a_objects.forEach((h_object) => {

						// object is node
						if(h_object.hasOwnProperty('@id')) {
							let s_id = h_object['@id'];

							// object is blanknode
							if('_' === s_id[0] && ':' === s_id[1]) {
								// remove that blanknode from top level
								delete h_top_level_nodes[s_id];
							}
						}
						// object is collection
						else if(h_object.hasOwnProperty('@list')) {

							// each item in collection
							h_object['@list'].forEach((h_item) => {

								// item is node; ref its id
								if(h_item.hasOwnProperty('@id')) {
									let s_id = h_item['@id'];

									// item is blanknode
									if('_' === s_id[0] && ':' === s_id[1]) {
										// remove that blanknode from top level
										delete h_top_level_nodes[s_id];
									}
								}
							});
						}
					});
				}
			});

			// convert top-level nodes hash into array, save to local field
			this[_private].a_top_nodes = Object.keys(h_top_level_nodes);

			// use entities array as operator
			f_okay_graphy(a_entities_unnamespaced);
		});
	}


	// top nodes from graph
	top(f_each) {

		// destruct private members
		let {
			a_top_nodes,
			h_graph,
		} = this[_private];

		// construct list of networked top-level nodes
		let a_nodes = a_top_nodes.map((p_node) => {
			return network_node(h_graph[p_node], '');
		});

		// user passed implicit map callback
		if('function' === typeof f_each) {
			return a_nodes.map(f_each);
		}

		// return mapped nodes
		return a_nodes;
	}


	// select any node from the entire graph
	select(s_ref, s_namespace) {

		// ref private members
		let h_private = this[_private];

		// resolve iri of ref
		let p_iri = this[$iri_of](s_ref);

		// optional namespace
		let p_namespace = s_namespace
			? this[$iri_of](s_namespace)
			: longest_prefix(this[$iri_of](s_ref), this[_private].h_prefixes).namespace;

		// return networked node
		return network_node(h_private.h_graph[p_iri], p_namespace);
	}


	// shorten an arbitrary iri using prefixes given in @context
	shorten(s_name) {
		return n3_shorten(s_name, this[_private].h_prefixes);
	}
}

const local = classer.logger(Graphy);

module.exports = classer.exportAsync(Graphy);
