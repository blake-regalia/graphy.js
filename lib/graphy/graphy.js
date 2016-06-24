
// Turtle package
const ttl = {

	// parses a ttl input
	get parse() {
		// memoize
		delete ttl.parse;
		return ttl.parse = require('../ttl/parser.js');
	},

	// creates a graphy network from a ttl input
	get network() {
		// load & cache dependencies
		const parse_ttl = ttl.parse;
		const Network = require('./network.js');

		// memoize
		delete ttl.network;
		return ttl.network = function(z_input, f_okay_graph) {

			// prep a graph hash [subject_id] => predicate-object pairs
			let h_graph = {};

			// parse document
			parse_ttl(z_input, {

				// create the map
				triple(h_triple) {
					// ref subject of triple
					let h_subject = h_triple.subject;

					// create subject id
					let s_subject_id = h_subject.isBlankNode? ' '+h_subject.value: h_subject.value;

					// a triple with subject exists
					if(h_graph[s_subject_id]) {
						// ref its links
						let h_links = h_graph[s_subject_id];

						// ref predicate
						let s_predicate = h_triple.predicate.value;

						// ref or make object list
						h_links[s_predicate] = h_links[s_predicate] || [];

						// add this object to the list
						h_links[s_predicate].push(h_triple.object);
					}
					// no such triples with subject exist yet
					else {
						// create mapping
						h_graph[s_subject_id] = {
							// create link to sole object in list
							[h_triple.predicate.value]: [h_triple.object],
						};
					}
				},

				// immediately forward error to callback
				error(e_parse) {
					f_okay_graph(e_parse);
				},

				// end of file/stream
				end(h_prefixes) {
					f_okay_graph(null, new Network(h_graph, h_prefixes));
				},
			});
		};
	},
};



// TriG package
const trig = {

	// parses a ttl input
	get parse() {
		// memoize
		delete trig.parse;
		return trig.parse = require('../trig/parser.js');
	},

};


module.exports = {
	ttl,
	trig,
	// nt,
	// nq,
};
