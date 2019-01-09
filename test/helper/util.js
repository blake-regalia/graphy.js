const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDF_FIRST = P_IRI_RDF+'first';
const P_IRI_RDF_REST = P_IRI_RDF+'rest';
const P_IRI_RDF_NIL = P_IRI_RDF+'nil';

const P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#';

// const factory = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/core.data.factory`);
const factory = require('@graphy/core.data.factory');
const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-string'));

const F_BRANCH_DEFAULT = (s, f) => describe(s, f);

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
									value: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString',
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
			return (kt) => {
				let s_xsd_type = Number.isInteger(ze1)
					? 'integer'
					: (!Number.isFinite(ze1) || Number.isNaN(ze1)
						? 'double'
						: 'decimal');

				expect(kt).to.include({
					termType: 'Literal',
					value: ze1+'',
					...(Number.isNaN(ze1)
						? {}
						: {
							number: ze1,
							...(Number.isInteger(ze1)
								? {isInteger:true}
								: (Number.isFinite(ze1)
									? {isDecimal:true}
									: {isDouble:true}
								)
							),
						}),
				});

				expect(kt).to.have.property('datatype')
					.that.includes({
						termType: 'NamedNode',
						value: `http://www.w3.org/2001/XMLSchema#${s_xsd_type}`,
					});
			};
		}
		// boolean
		else if('boolean' === s_type) {
			return (kt) => {
				expect(kt).to.include({
					termType: 'Literal',
					value: ze1+'',
					boolean: ze1,
					isBoolean: true,
				});

				expect(kt).to.have.property('datatype')
					.that.includes({
						termType: 'NamedNode',
						value: 'http://www.w3.org/2001/XMLSchema#boolean',
					});
			};
		}
		// actual term
		else if(ze1.isGraphyTerm) {
			return (kt) => {
				expect(kt).to.eql(ze1);
			};
		}
		// simple es object literal
		else {
			// expand 'datatype' property
			if('string' === typeof ze1.datatype) {
				ze1.datatype = {
					termType: 'NamedNode',
					value: ze1.datatype,
				};
			}
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
		expect(dg_actual).to.have.property(Symbol.iterator);
			// .that.equals(((function *() {})()).constructor);

		a_expect = a_expect.map(a => helper.e4(a));
		let a_actual = [...dg_actual];
		expect(a_actual).to.have.lengthOf(a_expect.length);

		// each quad
		for(let i_quad=0; i_quad<a_expect.length; i_quad++) {
			let {
				subject: z_actual_subject,
				predicate: z_actual_predicate,
				object: z_actual_object,
				graph: z_actual_graph=null,
			} = a_actual[i_quad];

			let {
				subject: z_expect_subject,
				predicate: z_expect_predicate,
				object: z_expect_object,
				graph: z_expect_graph=null,
			} = a_expect[i_quad];

			// subject
			if(z_actual_subject.isBlankNode) {
				expect(z_actual_subject).to.include(z_expect_subject);
			}
			else if('function' === typeof z_expect_subject) {
				z_expect_subject(z_actual_subject);
			}
			else {
				expect(z_actual_subject.isolate()).to.eql(z_expect_subject);
			}

			// predicate
			expect(z_actual_predicate.isolate()).to.eql(z_expect_predicate);

			// object
			if(z_actual_object.isBlankNode) {
				expect(z_actual_object).to.include(z_expect_object);
			}
			else if('function' === typeof z_expect_object) {
				z_expect_object(z_actual_object);
			}
			else {
				expect(z_actual_object.isolate()).to.eql(z_expect_object);
			}

			// graph
			if(z_expect_graph) {
				if(z_actual_graph.isBlankNode) {
					expect(z_actual_graph).to.include(z_expect_graph);
				}
				else if('function' === typeof z_expect_graph) {
					z_expect_graph(z_actual_graph);
				}
				else {
					expect(z_actual_graph.isolate()).to.eql(z_expect_graph);
				}
			}
		}
	},

	validate_quads_unordered(dg_actual, a_expect) {
		expect(dg_actual).to.have.property(Symbol.iterator);
			// .that.equals(((function *() {})()).constructor);

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

	map_tree(h_tree, f_onto, f_branch=F_BRANCH_DEFAULT, a_path=[]) {
		for(let s_key in h_tree) {
			let z_leaf = h_tree[s_key];

			if('function' === typeof z_leaf) {
				f_onto(s_key, z_leaf, a_path);
			}
			else if(Object === z_leaf.constructor) {
				f_branch(s_key, () => {
					helper.map_tree(z_leaf, f_onto, f_branch, [...a_path, s_key]);
				});
			}
			else {
				throw new TypeError(`unexpected leaf type encountered at path '${a_path.join('/')}': '${z_leaf}'`);
			}
		}
	},

	gobble(s_text, s_indent='') {
		let m_pad = /^(\s+)/.exec(s_text.replace(/^([ \t]*\n)/, ''));
		if(m_pad) {
			return s_indent+s_text.replace(new RegExp(`\\n${m_pad[1]}`, 'g'), '\n'+s_indent.trim()).trim();
		}
		else {
			return s_indent+s_text.trim();
		}
	},
};
