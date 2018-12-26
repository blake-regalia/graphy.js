const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDF_FIRST = P_IRI_RDF+'first';
const P_IRI_RDF_REST = P_IRI_RDF+'rest';
const P_IRI_RDF_NIL = P_IRI_RDF+'nil';

const P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#';

const factory = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/core.data.factory`);
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-string'));

const helper = module.exports = {
	e1(ze1) {
		let s_type = typeof ze1;

		// string
		if('string' === s_type) {
			let se1 = ze1;
			switch(se1) {
				// rdf:first
				case '->': return {termType:'NamedNode', value:P_IRI_RDF_FIRST};

				// rdf:rest
				case '>>': return {termType:'NamedNode', value:P_IRI_RDF_REST};

				// rdf:nil
				case '.': return {termType:'NamedNode', value:P_IRI_RDF_NIL};

				// default graph
				case '*': return {termType:'DefaultGraph', value:''};

				default: {
					switch(se1[0]) {
						// anonymous blank node
						case ' ': {
							return {
								termType: 'BlankNode',
								isAnonymous: true,
							};
						}

						// labeled blank node
						case '_': {
							return {
								termType: 'BlankNode',
								isAnonymous: false,
								value: se1.slice(1),
							};
						}

						// literal
						case '"': {
							return {
								termType: 'Literal',
								value: se1.slice(1),
								language: '',
								datatype: {
									termType: 'NamedNode',
									value: 'http://www.w3.org/2001/XMLSchema#string',
								},
							};
						}

						// datatyped-literal
						case '^': {
							let i_contents = se1.indexOf('"');
							return {
								termType: 'Literal',
								value: se1.slice(i_contents+1),
								language: '',
								datatype: {
									termType: 'NamedNode',
									value: se1.slice(1, i_contents),
								},
							};
						}

						// languaged-literal
						case '@': {
							let i_contents = se1.indexOf('"');
							return {
								termType: 'Literal',
								value: se1.slice(i_contents+1),
								language: se1.slice(1, i_contents),
								datatype: {
									termType: 'NamedNode',
									value: 'http://www.w3.org/2001/XMLSchema#langString',
								},
							};
						}

						default: {
							// iri
							return {
								termType: 'NamedNode',
								value: se1,
							};
						}
					}
				}
			}
		}
		// number
		else if('number' === s_type) {
			return {
				termType: 'Literal',
				value: ze1+'',
			};

			// return (kt) => {
			// 	expect(kt).to.include({
			// 		termType: 'Literal',
			// 		value: ze1+'',
			// 	}).and.to.have.property('datatype')
			// 		.that.has.property('value')
			// 			.that.startsWith(P_IRI_XSD);
			// 	// expect(kt.datatype).to.have.property('value');
			// 	// expect(kt.datatype.value).to.startWith();
			// };
		}
		else {
			return ze1;
		}
	},

	e4(ae4) {
		return {
			subject: helper.e1(ae4[0]),
			predicate: helper.e1(ae4[1]),
			object: helper.e1(ae4[2]),
			...(4 === ae4.length
				? {graph:helper.e1(ae4[3])}
				: {}),
		};
	},

	o4(ao4) {
		let {
			subject: g_subject,
			predicate: g_predicate,
			object: g_object,
			graph: g_graph,
		} = helper.e4(ao4);

		return factory.quad(...[g_subject, g_predicate, g_object, g_graph].map(factory.from.rdfjs_term));
	},

	validate_quads(dg_actual, a_expect) {
		expect(dg_actual).to.have.property('constructor')
			.that.equals(((function *() {})()).constructor);

		a_expect = a_expect.map(a => helper.e4(a));
		let a_actual = [...dg_actual];
		expect(a_actual).to.have.lengthOf(a_expect.length);

		// each quad
		for(let i_quad=0; i_quad<a_expect.length; i_quad++) {
			let g_actual = a_actual[i_quad];
			let g_expect = a_expect[i_quad];

			// subject
			if(g_actual.subject.isBlankNode) {
				expect(g_actual.subject).to.include(g_expect.subject);
			}
			else {
				expect(g_actual.subject.isolate()).to.eql(g_expect.subject);
			}

			// predicate
			expect(g_actual.predicate.isolate()).to.eql(g_expect.predicate);

			// object
			if(g_actual.object.isBlankNode) {
				expect(g_actual.object).to.include(g_expect.object);
			}
			else {
				expect(g_actual.object.isolate()).to.eql(g_expect.object);
			}

			// graph
			if(g_expect.graph) {
				if(g_actual.graph.isBlankNode) {
					expect(g_actual.graph).to.include(g_expect.graph);
				}
				else {
					expect(g_actual.graph.isolate()).to.eql(g_expect.graph);
				}
			}
		}
	},

	validate_quads_unordered(dg_actual, a_expect) {
		expect(dg_actual).to.have.property('constructor')
			.that.equals(((function *() {})()).constructor);

		a_expect = a_expect.map(a => helper.e4(a));
		let a_actual = [...dg_actual];
		expect(a_actual).to.have.lengthOf(a_expect.length);

		EXPECTING:
		for(let g_expect of a_expect) {
			for(let i_actual=a_actual.length-1; i_actual>=0; i_actual--) {
				// match
				if(a_actual[i_actual].equals(g_expect)) {
					a_actual.splice(i_actual, 1);
					continue EXPECTING;
				}
			}

			throw new Error(`failed to match this quad in actual: ${g_expect}`);
		}
	},
};
