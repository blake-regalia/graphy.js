const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDF_FIRST = P_IRI_RDF+'first';
const P_IRI_RDF_REST = P_IRI_RDF+'rest';
const P_IRI_RDF_NIL = P_IRI_RDF+'nil';

const P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-string'));

module.exports = {
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
			subject: this.e1(ae4[0]),
			predicate: this.e1(ae4[1]),
			object: this.e1(ae4[2]),
			...(4 === ae4.length
				? {graph:this.e1(ae4[3])}
				: {}),
		};
	},
};
