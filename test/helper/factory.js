const expect = require('chai').expect;
const util = require('../helper/util.js');

const P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#';
const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDFS = 'http://www.w3.org/2000/01/rdf-schema#';

const H_PREFIXES = {
	'': '#',
	test: 'test#',
	test_: 'test_#',
	xsd: P_IRI_XSD,
	rdf: P_IRI_RDF,
	rdfs: P_IRI_RDFS,
};


const H_VALIDATORS = {
	default_graph(kt_actual) {
		expect(kt_actual).to.include({
			termType: 'DefaultGraph',
			isDefaultGraph: true,
			value: '',
		});
	},

	term(kt_actual) {
		expect(kt_actual).to.include({
			isGraphyTerm: true,
		});
	},

	blank_node(kt_actual, s_label=null, b_anonymous=null) {
		expect(kt_actual).to.include({
			termType: 'BlankNode',
			isBlankNode: true,
		});

		// validate value
		if(null !== s_label) {
			expect(kt_actual.value).to.equal(s_label);
		}

		// validate anonymous-ness
		if(null !== b_anonymous) {
			expect(kt_actual.isAnonymous).to.equal(b_anonymous);
		}
	},

	named_node(kt_actual, p_value=null) {
		expect(kt_actual).to.include({
			termType: 'NamedNode',
			isNamedNode: true,
		});

		// validate value
		expect(kt_actual.value).to.equal(null === p_value? P_IRI_XSD+'string': p_value);
	},

	literal(kt_actual, g_descriptor={}) {
		// abides generic term
		this.term(kt_actual);

		// literal specifics
		expect(kt_actual).to.include({
			termType: 'Literal',
			language: g_descriptor.language || '',
			isLiteral: true,
		}).and.have.property('datatype');

		// validate value
		if('value' in g_descriptor) {
			expect(kt_actual.value).to.equal(g_descriptor.value);
		}

		// check datatype
		this.named_node(kt_actual.datatype, g_descriptor.language
			? P_IRI_RDF+'langString'
			: ('string' === typeof g_descriptor.datatype
				? g_descriptor.datatype
				: null));
	},

	integer(kt_actual, x_value) {
		// abides literal
		this.literal(kt_actual, {value:x_value+'', datatype:P_IRI_XSD+'integer'});

		// literal integer specifics
		expect(kt_actual).to.include({
			isNumeric: true,
			isInteger: true,
			number: x_value,
		});
	},

	double(kt_actual, x_value) {
		// abides double
		this.literal(kt_actual, {value:x_value+'', datatype:P_IRI_XSD+'double'});

		// literal double specifics
		expect(kt_actual).to.include({
			isNumeric: true,
			isDouble: true,
			number: x_value,
		});
	},

	decimal(kt_actual, x_value) {
		// abides literal
		this.literal(kt_actual, {value:x_value+'', datatype:P_IRI_XSD+'decimal'});

		// literal decimal specifics
		expect(kt_actual).to.include({
			isNumeric: true,
			isDecimal: true,
			number: x_value,
		});
	},

	boolean(kt_actual, b_value) {
		// abides literal
		this.literal(kt_actual, {value:b_value+'', datatype:P_IRI_XSD+'boolean'});

		// literal boolean specifics
		expect(kt_actual).to.include({
			isBoolean: true,
			boolean: b_value,
		});
	},

	number(kt_actual, z_value, w_arg) {
		let s_type, w_value;
		if(Array.isArray(z_value)) {
			[s_type, w_value] = z_value;
		}
		else if('undefined' !== typeof w_arg) {
			s_type = z_value;
			w_value = w_arg;
		}
		else {
			throw new Error('invalid test case');
		}

		this[s_type](kt_actual, w_value);
	},

	date(kt_actual, dt_value) {
		this.literal(kt_actual, {value:dt_value.toISOString().replace(/T.+$/, 'Z'), datatype:P_IRI_XSD+'date'});
	},

	dateTime(kt_actual, dt_value) {
		this.literal(kt_actual, {value:dt_value.toISOString(), datatype:P_IRI_XSD+'dateTime'});
	},
};

class factory_suite {
	constructor(gc_factory) {
		Object.assign(this, gc_factory);
	}

	validate_c1(g_actions) {
		let factory = this.factory;
		for(let s_action in g_actions) {
			let z_action = g_actions[s_action];

			switch(s_action) {
				case 'throws': {
					let h_map = z_action;
					for(let s_group in h_map) {
						let a_tests = h_map[s_group];
						describe(s_group+' throws', () => {
							for(let s_title of a_tests) {
								it(s_title, () => {
									expect(() => factory.c1(s_title, H_PREFIXES)).to.throw(Error);
								});
							}
						});
					}
					break;
				}

				case 'returns': {
					let h_types = z_action;
					for(let s_type in h_types) {
						describe(s_type+' returns', () => {
							let h_cases = h_types[s_type];
							for(let s_title in h_cases) {
								let z_descriptor = h_cases[s_title];
								it(s_title, () => {
									if('function' === typeof z_descriptor) {
										z_descriptor();
									}
									else {
										H_VALIDATORS[s_type](factory.c1(s_title, H_PREFIXES), z_descriptor);
									}
								});
							}
						});
					}
					break;
				}

				default: {
					throw new Error(`invalid test case action: ${s_action}`);
				}
			}
		}
	}

	validate_factory(h_methods) {
		let factory = this.factory;
		for(let s_method in h_methods) {
			let g_actions = h_methods[s_method];

			for(let s_action in g_actions) {
				let h_cases = g_actions[s_action];
				describe(`factory.${s_method} ${s_action}`, () => {
					for(let s_title in h_cases) {
						let z_case = h_cases[s_title];

						it(s_title, () => {
							switch(s_action) {
								case 'throws': {
									expect(() => factory[s_method](z_case)).to.throw(Error);
									break;
								}

								case 'returns': {
									let w_arg, z_value;
									if(Array.isArray(z_case)) {
										[w_arg, z_value] = z_case;
									}
									else if('function' === typeof z_case) {
										z_case();
										return;
									}
									else {
										w_arg = z_value = z_case;
									}

									H_VALIDATORS[s_method](factory[s_method](w_arg), z_value, w_arg);
									break;
								}

								case 'augments': {
									// adopt ad-hoc factory instance
									const dc_adopted = factory.adopt({
										namedNode: p_iri => ({
											termType: 'NamedNode',
											value: p_iri,
										}),
										literal: (s_value, z_lang_or_datatype) => ({
											termType: 'Literal',
											value: s_value,
											...'string' === typeof z_lang_or_datatype
												? {
													language: z_lang_or_datatype,
													datatype: {
														termType: 'NamedNode',
														value: P_IRI_RDF+'langString',
													},
												}
												: {
													language: '',
													datatype: z_lang_or_datatype || {
														termType: 'NamedNode',
														value: P_IRI_XSD+'string',
													},
												},
										}),
									});

									expect(dc_adopted[s_method](z_case)).to.deep.equal(factory[s_method](z_case).isolate());
									break;
								}

								default: {
									throw new Error(`invalid test case action: ${s_action}`);
								}
							}
						});
					}
				});
			}
		}
	}

	run() {
		let factory = this.factory;

		describe(this.package, () => {
			describe('factory.literal', () => {
				it('w/o datatype', () => {
					H_VALIDATORS.literal(factory.literal('test'), {value:'test'});
				});

				it('with datatype', () => {
					let k_datatype = factory.namedNode('yes');
					H_VALIDATORS.literal(factory.literal('test', k_datatype), {value:'test', datatype:'yes'});
				});

				it('language', () => {
					H_VALIDATORS.literal(factory.literal('test', 'en'), {value:'test', language:'en'});
				});

				it('language w/ optional @', () => {
					H_VALIDATORS.literal(factory.literal('test', '@en'), {value:'test', language:'en'});
				});

				it('valueOf casts to canonical form', () => {
					expect(factory.literal('hello', 'en')+'').to.equal('@en"hello');
					expect(factory.literal('hello', factory.namedNode('greeting'))+'').to.equal('^>greeting"hello');
				});

				it('.verbose', () => {
					expect(factory.literal('hello', 'en').verbose()).to.equal('"hello"@en');
					expect(factory.literal('hello', factory.namedNode('greeting')).verbose()).to.equal('"hello"^^<greeting>');
				});

				it('.termType', () => {
					expect(factory.literal(''))
						.to.have.property('termType', 'Literal');
				});

				it('.isLiteral', () => {
					expect(factory.literal(''))
						.to.have.property('isLiteral', true);
				});
			});

			describe('datatyped literal constructors', () => {
				this.validate_factory({
					integer: {
						throws: {
							'+Infinity': Infinity,
							'-Infinity': -Infinity,
							NaN: NaN,
							'non-integer': 0.1,
							true: true,
							false: false,
							null: null,
							undefined: undefined,  // eslint-disable-line no-undefined
							'empty string': '',
							'non-numeric string': 'hi',
							'invalid numeric string': '0  1',
						},
						returns: {
							0: 0,
							1: 1,
							'-1': -1,
							'Number.MAX_SAFE_INTEGER': Number.MAX_SAFE_INTEGER,
							'Number.MIN_SAFE_INTEGER': Number.MIN_SAFE_INTEGER,
							'numeric string: 0': ['0', 0],
							'numeric string: 1': ['1', 1],
							'numeric string: -1': ['-1', -1],
							'numeric string: 0xff': ['0xff', 0xff],
							'numeric string: 0b101': ['0b101', 0b101],
						},
						augments: [0, 1, '0', '1'],
					},
					double: {
						throws: {
							true: true,
							false: false,
							null: null,
							undefined: undefined,  // eslint-disable-line no-undefined
							'empty string': '',
							'non-numeric string': 'hi',
							'invalid numeric string': '0  .1',
						},
						returns: {
							0: 0,
							1: 1,
							'-1': -1,
							0.1: 0.1,
							'-0.1': -0.1,
							'Number.MAX_SAFE_INTEGER': Number.MAX_SAFE_INTEGER,
							'Number.MIN_SAFE_INTEGER': Number.MIN_SAFE_INTEGER,
							'Number.MAX_VALUE': Number.MAX_VALUE,
							'Number.MIN_VALUE': Number.MIN_VALUE,
							'numeric string: 0': ['0', 0],
							'numeric string: 1': ['1', 1],
							'numeric string: -1': ['-1', -1],
							'numeric string: 0.1': ['0.1', 0.1],
							'numeric string: -0.1': ['-0.1', -0.1],
							'numeric string: 0xff': ['0xff', 0xff],
							'numeric string: 0b101': ['0b101', 0b101],
							'+Infinity': () => {
								let kt_actual = factory.double(Infinity);
								H_VALIDATORS.literal(kt_actual, {value:'INF', datatype:P_IRI_XSD+'double'});
								expect(kt_actual).to.include({
									number: Infinity,
									isNumeric: true,
									isDouble: true,
									isInfinite: true,
								});
							},
							'-Infinity': () => {
								let kt_actual = factory.double(-Infinity);
								H_VALIDATORS.literal(kt_actual, {value:'-INF', datatype:P_IRI_XSD+'double'});
								expect(kt_actual).to.include({
									number: -Infinity,
									isNumeric: true,
									isDouble: true,
									isInfinite: true,
								});
							},
							NaN: () => {
								let kt_actual = factory.double(NaN);
								H_VALIDATORS.literal(kt_actual, {value:'NaN', datatype:P_IRI_XSD+'double'});
								expect(kt_actual).to.include({
									isNumeric: true,
									isDouble: true,
									isNaN: true,
								});
								expect(kt_actual.number).to.be.NaN;
							},
						},
						augments: [0.1, -1.2, '0.1', '-1.2'],
					},
					decimal: {
						throws: {
							'+Infinity': Infinity,
							'-Infinity': -Infinity,
							NaN: NaN,
							true: true,
							false: false,
							null: null,
							undefined: undefined,  // eslint-disable-line no-undefined
							'empty string': '',
							'non-numeric string': 'hi',
							'invalid numeric string': '0  .1',
						},
						returns: {
							0: 0,
							1: 1,
							'-1': -1,
							0.1: 0.1,
							'-0.1': -0.1,
							'Number.MAX_SAFE_INTEGER': Number.MAX_SAFE_INTEGER,
							'Number.MIN_SAFE_INTEGER': Number.MIN_SAFE_INTEGER,
							'Number.MAX_VALUE': Number.MAX_VALUE,
							'Number.MIN_VALUE': Number.MIN_VALUE,
							'numeric string: 0': ['0', 0],
							'numeric string: 1': ['1', 1],
							'numeric string: -1': ['-1', -1],
							'numeric string: 0.1': ['0.1', 0.1],
							'numeric string: -0.1': ['-0.1', -0.1],
							'numeric string: 0xff': ['0xff', 0xff],
							'numeric string: 0b101': ['0b101', 0b101],
						},
						augments: [0.1, -1.2, '0.1', '-1.2'],
					},
					boolean: {
						throws: {
							'+Infinity': Infinity,
							'-Infinity': -Infinity,
							NaN: NaN,
							null: null,
							undefined: undefined,  // eslint-disable-line no-undefined
							'-1': -1,
							0.1: 0.1,
							'empty string': '',
							'non-boolean string': 'hi',
							'invalid boolean string': 'tRUE',
						},
						returns: {
							0: [0, false],
							1: [1, true],
							true: true,
							false: false,
							'boolean string: true': ['true', true],
							'boolean string: false': ['false', false],
							'boolean string: True': ['True', true],
							'boolean string: False': ['False', false],
							'boolean string: TRUE': ['TRUE', true],
							'boolean string: FALSE': ['FALSE', false],
						},
						augments: [true, false, 'true', 'false'],
					},
					number: {
						throws: {
							null: null,
							undefined: undefined,  // eslint-disable-line no-undefined
							'empty string': '',
							'non-numeric string': 'hi',
							'invalid numeric string': '0  .1',
						},
						returns: {
							0: [0, 'integer'],
							1: [1, 'integer'],
							'-1': [-1, 'integer'],
							0.1: [0.1, 'decimal'],
							'-0.1': [-0.1, 'decimal'],
							'+Infinity': () => {
								let kt_actual = factory.number(Infinity);
								H_VALIDATORS.literal(kt_actual, {value:'INF', datatype:P_IRI_XSD+'double'});
								expect(kt_actual).to.include({
									number: Infinity,
									isNumeric: true,
									isDouble: true,
									isInfinite: true,
								});
							},
							'-Infinity': () => {
								let kt_actual = factory.number(-Infinity);
								H_VALIDATORS.literal(kt_actual, {value:'-INF', datatype:P_IRI_XSD+'double'});
								expect(kt_actual).to.include({
									number: -Infinity,
									isNumeric: true,
									isDouble: true,
									isInfinite: true,
								});
							},
							NaN: () => {
								let kt_actual = factory.number(NaN);
								H_VALIDATORS.literal(kt_actual, {value:'NaN', datatype:P_IRI_XSD+'double'});
								expect(kt_actual).to.include({
									isNumeric: true,
									isDouble: true,
									isNaN: true,
								});
								expect(kt_actual.number).to.be.NaN;
							},
							'Number.MAX_SAFE_INTEGER': [Number.MAX_SAFE_INTEGER, 'integer'],
							'Number.MIN_SAFE_INTEGER': [Number.MIN_SAFE_INTEGER, 'integer'],
							'Number.MAX_VALUE': [Number.MAX_VALUE, 'integer'],
							'Number.MIN_VALUE': [Number.MIN_VALUE, 'decimal'],
							'numeric string: 0': ['0', ['decimal', 0]],
							'numeric string: 1': ['1', ['decimal', 1]],
							'numeric string: -1': ['-1', ['decimal', -1]],
							'numeric string: 0.1': ['0.1', ['decimal', 0.1]],
							'numeric string: -0.1': ['-0.1', ['decimal', -0.1]],
							'numeric string: 0xff': ['0xff', ['decimal', 0xff]],
							'numeric string: 0b101': ['0b101', ['decimal', 0b101]],
						},
					},
					date: {
						returns: {
							now: new Date(),
						},
					},
					dateTime: {
						returns: {
							now: new Date(),
						},
					},
				});
			});

			describe('factory.c1', () => {
				this.validate_c1({
					throws: {
						'datatype no contents': [
							'^xsd:integer',
							'^:integer',
							'^^>:integer',
							'^>#a',
						],
						'datatype no datatype': [
							'^"',
							'^"test',
						],
						'language no contents': [
							'@en',
							'@en-US',
						],
						'prefix with leading underscore': [
							'_test:abc',
						],
					},
					returns: {
						literal: {
							'"': {value:''},
							'"hi': {value:'hi'},
							'@"': {value:'', language:''},
							'@en"': {value:'', language:'en'},
							'@"hello': {value:'hello', language:''},
							'@en"hello': {value:'hello', language:'en'},
							'^>"': {value:'', datatype:''},
							'^>"test': {value:'test', datatype:''},
							'^>#a"': {value:'', datatype:'#a'},
							'^>#a"test': {value:'test', datatype:'#a'},
							'^:a"': {value:'', datatype:'#a'},
							'^:a"test': {value:'test', datatype:'#a'},
							'^xsd:integer"': {value:'', datatype:P_IRI_XSD+'integer'},
							'^xsd:integer"10': {value:'10', datatype:P_IRI_XSD+'integer'},
						},
						named_node: {
							'>': '',
							':': '#',
							'>#': '#',
							'>a': 'a',
							'>#a': '#a',
							':a': '#a',
							'>abc': 'abc',
							':abc': '#abc',
							'test:abc': 'test#abc',
							'test_:abc': 'test_#abc',
							a: P_IRI_RDF+'type',
						},
						blank_node: {
							'_:': () => {
								let kt_blank = factory.c1('_:');
								H_VALIDATORS.blank_node(kt_blank, null, true);
								expect(kt_blank.value).to.have.length('_fee893ce_d36a_4413_a197_a9f47a3e5991'.length);
							},
							'_:#anonymous': () => {
								let kt_blank = factory.c1('_:#anonymous');
								H_VALIDATORS.blank_node(kt_blank, null, true);
								expect(kt_blank.value).to.have.length('_fee893ce_d36a_4413_a197_a9f47a3e5991'.length);
							},
							'_:b': 'b',
							'_:b1': 'b1',
						},
						default_graph: {
							'*': '',
						},
					},
				});
			});

			describe('factory.c3', () => {
				it('works', () => {
					util.validate_quads(factory.c3({
						'>a': {
							'>b': '>c',
							'>d': ['>e', '^>y"f'],
							'>g': ['>h', [
								'>i',
								'>j',
								'"k',
							]],
						},

						'>g': {
							'>h': '>i',
						},
					}), [
						['a', 'b', 'c'],
						['a', 'd', 'e'],
						['a', 'd', '^y"f'],
						['a', 'g', 'h'],
						['a', 'g', ' g0'],
						[' g0', '->', 'i'],
						[' g0', '>>', ' g1'],
						[' g1', '->', 'j'],
						[' g1', '>>', ' g2'],
						[' g2', '->', '"k'],
						[' g2', '>>', '.'],
						['g', 'h', 'i'],
					]);
				});

				it('works w/ prefix-mappings', () => {
					util.validate_quads(factory.c3({
						':a': {
							':b': ':c',
							':d': [':e', '^:y"f'],
							':g': [':h', [
								':i',
								':j',
								'"k',
							]],
						},

						'z:g': {
							'z:h': 'z:i',
						},
					}, {
						'': 'Z://',
						z: 'z://',
					}), [
						['Z://a', 'Z://b', 'Z://c'],
						['Z://a', 'Z://d', 'Z://e'],
						['Z://a', 'Z://d', '^Z://y"f'],
						['Z://a', 'Z://g', 'Z://h'],
						['Z://a', 'Z://g', ' g0'],
						[' g0', '->', 'Z://i'],
						[' g0', '>>', ' g1'],
						[' g1', '->', 'Z://j'],
						[' g1', '>>', ' g2'],
						[' g2', '->', '"k'],
						[' g2', '>>', '.'],
						['z://g', 'z://h', 'z://i'],
					]);
				});
			});

			describe('factory.c4', () => {
				it('works', () => {
					util.validate_quads(factory.c4({
						'*': {
							'>a': {
								'>b': '>c',
								'>d': ['>e', '^>y"f'],
								'>g': ['>h', [
									'>i',
									'>j',
									'"k',
								]],
							},
						},

						'>g': {
							'>h': {
								'>i': '>j',
							},
						},
					}), [
						['a', 'b', 'c', '*'],
						['a', 'd', 'e', '*'],
						['a', 'd', '^y"f', '*'],
						['a', 'g', 'h', '*'],
						['a', 'g', ' g0', '*'],
						[' g0', '->', 'i', '*'],
						[' g0', '>>', ' g1', '*'],
						[' g1', '->', 'j', '*'],
						[' g1', '>>', ' g2', '*'],
						[' g2', '->', '"k', '*'],
						[' g2', '>>', '.', '*'],
						['h', 'i', 'j', 'g'],
					]);
				});

				it('works w/ prefix-mappings', () => {
					util.validate_quads(factory.c4({
						'*': {
							':a': {
								':b': ':c',
								':d': [':e', '^:y"f'],
								':g': [':h', [
									':i',
									':j',
									'"k',
								]],
							},
						},

						'z:g': {
							'z:h': {
								'z:i': 'z:j',
							},
						},
					}, {
						'': 'Z://',
						z: 'z://',
					}), [
						['Z://a', 'Z://b', 'Z://c', '*'],
						['Z://a', 'Z://d', 'Z://e', '*'],
						['Z://a', 'Z://d', '^Z://y"f', '*'],
						['Z://a', 'Z://g', 'Z://h', '*'],
						['Z://a', 'Z://g', ' g0', '*'],
						[' g0', '->', 'Z://i', '*'],
						[' g0', '>>', ' g1', '*'],
						[' g1', '->', 'Z://j', '*'],
						[' g1', '>>', ' g2', '*'],
						[' g2', '->', '"k', '*'],
						[' g2', '>>', '.', '*'],
						['z://h', 'z://i', 'z://j', 'z://g'],
					]);
				});
			});

			describe('factory.comment()', () => {
				it('returns a string', () => {
					expect(factory.comment()).to.be.a('string');
				});
			});

			describe('factory.newlines()', () => {
				it('returns a string', () => {
					expect(factory.comment()).to.be.a('string');
				});
			});

			describe('DefaultGraph', () => {
				let kt_graph = factory.defaultGraph();

				it('#isDefaultGraph', () => {
					expect(kt_graph).to.have.property('isDefaultGraph', true);
				});

				it('#isGraphyTerm', () => {
					expect(kt_graph).to.have.property('isGraphyTerm', true);
				});

				it('#concise()', () => {
					expect(kt_graph.concise()).to.equal('*');
				});

				it('#concise({})', () => {
					expect(kt_graph.concise({})).to.equal('*');
				});

				it('#terse()', () => {
					expect(kt_graph.terse()).to.equal('');
				});

				it('#terse({})', () => {
					expect(kt_graph.terse({})).to.equal('');
				});

				it('#verbose()', () => {
					expect(kt_graph.verbose()).to.equal('');
				});

				it('#isolate()', () => {
					expect(kt_graph.isolate()).to.eql({
						termType: 'DefaultGraph',
						value: '',
					});
				});

				it('#equals(this)', () => {
					expect(kt_graph.equals(kt_graph)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_graph.equals(factory.defaultGraph())).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_graph.equals(kt_graph.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_graph.equals({
						termType: 'DefaultGraph',
						value: '',
					})).to.be.true;
				});
			});

			describe('NamedNode', () => {
				let p_iri_tests = 'https://graphy.link/tests#';
				let kt_node = factory.namedNode(p_iri_tests+'node');
				let h_prefixes = {
					tests: p_iri_tests,
				};

				it('#isNamedNode', () => {
					expect(kt_node).to.have.property('isNamedNode', true);
				});

				it('#isGraphyTerm', () => {
					expect(kt_node).to.have.property('isGraphyTerm', true);
				});

				it('#concise()', () => {
					expect(kt_node.concise()).to.equal(`>${p_iri_tests}node`);
				});

				it('#concise(h_prefixes)', () => {
					expect(kt_node.concise(h_prefixes)).to.equal('tests:node');
				});

				it('#terse()', () => {
					expect(kt_node.terse()).to.equal(`<${p_iri_tests}node>`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kt_node.terse(h_prefixes)).to.equal('tests:node');
				});

				it('#verbose()', () => {
					expect(kt_node.verbose()).to.equal(`<${p_iri_tests}node>`);
				});

				it('#isolate()', () => {
					expect(kt_node.isolate()).to.eql({
						termType: 'NamedNode',
						value: p_iri_tests+'node',
					});
				});

				it('#equals(this)', () => {
					expect(kt_node.equals(kt_node)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_node.equals(factory.namedNode(p_iri_tests+'node'))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_node.equals(kt_node.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_node.equals({
						termType: 'NamedNode',
						value: p_iri_tests+'node',
					})).to.be.true;
				});
			});

			describe('Labeled Blank Node', () => {
				let kt_node = factory.blankNode('label');

				it('#isBlankNode', () => {
					expect(kt_node).to.have.property('isBlankNode', true);
				});

				it('#isAnonymous', () => {
					expect(kt_node).to.have.property('isAnonymous', false);
				});

				it('#isGraphyTerm', () => {
					expect(kt_node).to.have.property('isGraphyTerm', true);
				});

				it('#concise()', () => {
					expect(kt_node.concise()).to.equal('_:label');
				});

				it('#concise({})', () => {
					expect(kt_node.concise({})).to.equal('_:label');
				});

				it('#terse()', () => {
					expect(kt_node.terse()).to.equal('_:label');
				});

				it('#terse({})', () => {
					expect(kt_node.terse({})).to.equal('_:label');
				});

				it('#verbose()', () => {
					expect(kt_node.verbose()).to.equal('_:label');
				});

				it('#isolate()', () => {
					expect(kt_node.isolate()).to.eql({
						termType: 'BlankNode',
						value: 'label',
					});
				});

				it('#equals(this)', () => {
					expect(kt_node.equals(kt_node)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_node.equals(factory.blankNode('label'))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_node.equals(kt_node.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_node.equals({
						termType: 'BlankNode',
						value: 'label',
					})).to.be.true;
				});
			});

			describe('Eephemeral Blank Node', () => {
				let kt_node = factory.ephemeral();
				let nl_uuidv4 = 'xxxxyyyy-xxxx-yyyy-zzzz-xxxxyyyyzzzz'.length;

				it('#isBlankNode', () => {
					expect(kt_node).to.have.property('isBlankNode', true);
				});

				it('#isAnonymous', () => {
					expect(kt_node).to.have.property('isAnonymous', true);
				});

				it('#isEphemeral', () => {
					expect(kt_node).to.have.property('isEphemeral', true);
				});

				it('#isGraphyTerm', () => {
					expect(kt_node).to.have.property('isGraphyTerm', true);
				});

				it('#concise()', () => {
					expect(kt_node.concise()).to.startWith('_:#_').and.have.lengthOf(nl_uuidv4+4);
				});

				it('#concise({})', () => {
					expect(kt_node.concise({})).to.startWith('_:#_').and.have.lengthOf(nl_uuidv4+4);
				});

				it('#terse()', () => {
					expect(kt_node.terse({})).to.equal('[]');
				});

				it('#terse({})', () => {
					expect(kt_node.terse({})).to.equal('[]');
				});

				it('#verbose()', () => {
					expect(kt_node.verbose()).to.startWith('_:_').and.have.lengthOf(nl_uuidv4+3);
				});

				it('#isolate()', () => {
					expect(kt_node.isolate()).to.include({
						termType: 'BlankNode',
					}).and.to.have.property('value').that.has.lengthOf(nl_uuidv4+1);
				});

				it('#equals(this)', () => {
					expect(kt_node.equals(kt_node)).to.be.false;
				});

				it('#equals(other)', () => {
					expect(kt_node.equals(factory.blankNode(kt_node.value))).to.be.false;
				});

				it('#equals(isolate)', () => {
					expect(kt_node.equals(kt_node.isolate())).to.be.false;
				});

				it('#equals(similar)', () => {
					expect(kt_node.equals({
						termType: 'BlankNode',
						value: kt_node.value,
					})).to.be.false;
				});

				it('.value !== .value', () => {
					expect(kt_node.value).to.not.equal(kt_node.value);
				});
			});

			describe('Auto Blank Node', () => {
				let kt_node = factory.blankNode();
				let nl_uuidv4 = 'xxxxyyyy-xxxx-yyyy-zzzz-xxxxyyyyzzzz'.length;

				it('#isBlankNode', () => {
					expect(kt_node).to.have.property('isBlankNode', true);
				});

				it('#isAnonymous', () => {
					expect(kt_node).to.have.property('isAnonymous', true);
				});

				it('#isGraphyTerm', () => {
					expect(kt_node).to.have.property('isGraphyTerm', true);
				});

				it('#concise()', () => {
					expect(kt_node.concise()).to.startWith('_:_').and.have.lengthOf(nl_uuidv4+3);
				});

				it('#concise({})', () => {
					expect(kt_node.concise({})).to.startWith('_:_').and.have.lengthOf(nl_uuidv4+3);
				});

				it('#terse()', () => {
					expect(kt_node.terse()).to.startWith('_:_').and.have.lengthOf(nl_uuidv4+3);
				});

				it('#terse({})', () => {
					expect(kt_node.terse({})).to.startWith('_:_').and.have.lengthOf(nl_uuidv4+3);
				});

				it('#verbose()', () => {
					expect(kt_node.verbose()).to.startWith('_:_').and.have.lengthOf(nl_uuidv4+3);
				});

				it('#isolate()', () => {
					expect(kt_node.isolate()).to.include({
						termType: 'BlankNode',
					}).and.to.have.property('value').that.has.lengthOf(nl_uuidv4+1);
				});

				it('#equals(this)', () => {
					expect(kt_node.equals(kt_node)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_node.equals(factory.blankNode(kt_node.value))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_node.equals(kt_node.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_node.equals({
						termType: 'BlankNode',
						value: kt_node.value,
					})).to.be.true;
				});
			});

			describe('Plain Literal', () => {
				let kt_literal = factory.literal('value');

				it('#isLiteral', () => {
					expect(kt_literal).to.have.property('isLiteral', true);
				});

				it('#isGraphyTerm', () => {
					expect(kt_literal).to.have.property('isGraphyTerm', true);
				});

				it('#concise()', () => {
					expect(kt_literal.concise()).to.equal('"value');
				});

				it('#concise({})', () => {
					expect(kt_literal.concise({})).to.equal('"value');
				});

				it('#terse()', () => {
					expect(kt_literal.terse()).to.equal('"value"');
				});

				it('#terse({})', () => {
					expect(kt_literal.terse({})).to.equal('"value"');
				});

				it('#verbose()', () => {
					expect(kt_literal.verbose()).to.equal('"value"');
				});

				it('#isolate()', () => {
					expect(kt_literal.isolate()).to.eql({
						termType: 'Literal',
						value: 'value',
						language: '',
						datatype: {
							termType: 'NamedNode',
							value: `${P_IRI_XSD}string`,
						},
					});
				});

				it('#equals(this)', () => {
					expect(kt_literal.equals(kt_literal)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_literal.equals(factory.literal('value'))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_literal.equals(kt_literal.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_literal.equals({
						termType: 'Literal',
						value: 'value',
						language: '',
						datatype: {
							termType: 'NamedNode',
							value: `${P_IRI_XSD}string`,
						},
					})).to.be.true;
				});
			});

			describe('Languaged Literal', () => {
				let kt_literal = factory.literal('value', 'en');

				it('#isLiteral', () => {
					expect(kt_literal).to.have.property('isLiteral', true);
				});

				it('#isGraphyTerm', () => {
					expect(kt_literal).to.have.property('isGraphyTerm', true);
				});

				it('#concise()', () => {
					expect(kt_literal.concise()).to.equal('@en"value');
				});

				it('#concise({})', () => {
					expect(kt_literal.concise({})).to.equal('@en"value');
				});

				it('#terse()', () => {
					expect(kt_literal.terse()).to.equal('"value"@en');
				});

				it('#terse({})', () => {
					expect(kt_literal.terse({})).to.equal('"value"@en');
				});

				it('#verbose()', () => {
					expect(kt_literal.verbose()).to.equal('"value"@en');
				});

				it('#isolate()', () => {
					expect(kt_literal.isolate()).to.eql({
						termType: 'Literal',
						value: 'value',
						language: 'en',
						datatype: {
							termType: 'NamedNode',
							value: `${P_IRI_RDF}langString`,
						},
					});
				});

				it('#equals(this)', () => {
					expect(kt_literal.equals(kt_literal)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_literal.equals(factory.literal('value', 'en'))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_literal.equals(kt_literal.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_literal.equals({
						termType: 'Literal',
						value: 'value',
						language: 'en',
						datatype: {
							termType: 'NamedNode',
							value: `${P_IRI_RDF}langString`,
						},
					})).to.be.true;
				});
			});

			describe('Datatyped Literal', () => {
				let p_iri_tests = 'https://graphy.link/tests#';
				let kt_datatype = factory.namedNode(p_iri_tests+'datatype');
				let h_prefixes = {
					tests: p_iri_tests,
				};
				let kt_literal = factory.literal('value', kt_datatype);

				it('#isLiteral', () => {
					expect(kt_literal).to.have.property('isLiteral', true);
				});

				it('#isGraphyTerm', () => {
					expect(kt_literal).to.have.property('isGraphyTerm', true);
				});

				it('#concise()', () => {
					expect(kt_literal.concise()).to.equal(`^>${p_iri_tests}datatype"value`);
				});

				it('#concise(h_prefixes)', () => {
					expect(kt_literal.concise(h_prefixes)).to.equal(`^tests:datatype"value`);
				});

				it('#terse()', () => {
					expect(kt_literal.terse()).to.equal(`"value"^^<${p_iri_tests}datatype>`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kt_literal.terse(h_prefixes)).to.equal('"value"^^tests:datatype');
				});

				it('#verbose()', () => {
					expect(kt_literal.verbose()).to.equal(`"value"^^<${p_iri_tests}datatype>`);
				});

				it('#isolate()', () => {
					expect(kt_literal.isolate()).to.eql({
						termType: 'Literal',
						value: 'value',
						language: '',
						datatype: {
							termType: 'NamedNode',
							value: `${p_iri_tests}datatype`,
						},
					});
				});

				it('#equals(this)', () => {
					expect(kt_literal.equals(kt_literal)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_literal.equals(factory.literal('value', factory.namedNode(p_iri_tests+'datatype')))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_literal.equals(kt_literal.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_literal.equals({
						termType: 'Literal',
						value: 'value',
						language: '',
						datatype: {
							termType: 'NamedNode',
							value: `${p_iri_tests}datatype`,
						},
					})).to.be.true;
				});
			});

			describe('Quad w/o explicit graph', () => {
				let p_iri_tests = 'https://graphy.link/tests#';
				let kt_datatype = factory.namedNode(p_iri_tests+'datatype');
				let h_prefixes = {
					tests: p_iri_tests,
				};
				let kt_subject = factory.blankNode('subject');
				let kt_predicate = factory.namedNode(p_iri_tests+'predicate');
				let kt_object = factory.literal('value', kt_datatype);
				let kq_quad = factory.quad(kt_subject, kt_predicate, kt_object);

				it('#isGraphyQuad', () => {
					expect(kq_quad).to.have.property('isGraphyQuad', true);
				});

				it('#concise()', () => {
					expect(kq_quad.concise()).to.eql([
						'_:subject',
						'>'+p_iri_tests+'predicate',
						`^>${p_iri_tests}datatype"value`,
						'*',
					]);
				});

				it('#concise(h_prefixes)', () => {
					expect(kq_quad.concise(h_prefixes)).to.eql([
						'_:subject',
						'tests:predicate',
						`^tests:datatype"value`,
						'*',
					]);
				});

				it('#terse()', () => {
					expect(kq_quad.terse()).to.equal(`_:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> .`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kq_quad.terse(h_prefixes)).to.equal(`_:subject tests:predicate "value"^^tests:datatype .`);
				});

				it('#verbose()', () => {
					expect(kq_quad.verbose()).to.equal(`_:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> .`);
				});

				it('#isolate()', () => {
					expect(kq_quad.isolate()).to.eql({
						subject: {
							termType: 'BlankNode',
							value: 'subject',
						},
						predicate: {
							termType: 'NamedNode',
							value: p_iri_tests+'predicate',
						},
						object: {
							termType: 'Literal',
							value: 'value',
							language: '',
							datatype: {
								termType: 'NamedNode',
								value: `${p_iri_tests}datatype`,
							},
						},
						graph: {
							termType: 'DefaultGraph',
							value: '',
						},
					});
				});

				it('#equals(this)', () => {
					expect(kq_quad.equals(kq_quad)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kq_quad.equals(factory.quad(...[
						factory.blankNode('subject'),
						factory.namedNode(p_iri_tests+'predicate'),
						factory.literal('value', kt_datatype),
					]))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kq_quad.equals(kq_quad.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kq_quad.equals({
						subject: {
							termType: 'BlankNode',
							value: 'subject',
						},
						predicate: {
							termType: 'NamedNode',
							value: p_iri_tests+'predicate',
						},
						object: {
							termType: 'Literal',
							value: 'value',
							language: '',
							datatype: {
								termType: 'NamedNode',
								value: `${p_iri_tests}datatype`,
							},
						},
						graph: {
							termType: 'DefaultGraph',
							value: '',
						},
					})).to.be.true;
				});
			});

			describe('Quad w/ graph', () => {
				let p_iri_tests = 'https://graphy.link/tests#';
				let kt_datatype = factory.namedNode(p_iri_tests+'datatype');
				let h_prefixes = {
					tests: p_iri_tests,
				};
				let kt_subject = factory.blankNode('subject');
				let kt_predicate = factory.namedNode(p_iri_tests+'predicate');
				let kt_object = factory.literal('value', kt_datatype);
				let kt_graph = factory.namedNode(p_iri_tests+'graph');
				let kq_quad = factory.quad(kt_subject, kt_predicate, kt_object, kt_graph);

				it('#isGraphyQuad', () => {
					expect(kq_quad).to.have.property('isGraphyQuad', true);
				});

				it('#concise()', () => {
					expect(kq_quad.concise()).to.eql([
						'_:subject',
						'>'+p_iri_tests+'predicate',
						`^>${p_iri_tests}datatype"value`,
						'>'+p_iri_tests+'graph',
					]);
				});

				it('#concise(h_prefixes)', () => {
					expect(kq_quad.concise(h_prefixes)).to.eql([
						'_:subject',
						'tests:predicate',
						`^tests:datatype"value`,
						'tests:graph',
					]);
				});

				it('#terse()', () => {
					expect(kq_quad.terse()).to.equal(`<${p_iri_tests}graph> { _:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> . }`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kq_quad.terse(h_prefixes)).to.equal(`tests:graph { _:subject tests:predicate "value"^^tests:datatype . }`);
				});

				it('#verbose()', () => {
					expect(kq_quad.verbose()).to.equal(`_:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> <${p_iri_tests}graph> .`);
				});

				it('#isolate()', () => {
					expect(kq_quad.isolate()).to.eql({
						subject: {
							termType: 'BlankNode',
							value: 'subject',
						},
						predicate: {
							termType: 'NamedNode',
							value: p_iri_tests+'predicate',
						},
						object: {
							termType: 'Literal',
							value: 'value',
							language: '',
							datatype: {
								termType: 'NamedNode',
								value: `${p_iri_tests}datatype`,
							},
						},
						graph: {
							termType: 'NamedNode',
							value: p_iri_tests+'graph',
						},
					});
				});

				it('#equals(this)', () => {
					expect(kq_quad.equals(kq_quad)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kq_quad.equals(factory.quad(...[
						factory.blankNode('subject'),
						factory.namedNode(p_iri_tests+'predicate'),
						factory.literal('value', kt_datatype),
						factory.namedNode(p_iri_tests+'graph'),
					]))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kq_quad.equals(kq_quad.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kq_quad.equals({
						subject: {
							termType: 'BlankNode',
							value: 'subject',
						},
						predicate: {
							termType: 'NamedNode',
							value: p_iri_tests+'predicate',
						},
						object: {
							termType: 'Literal',
							value: 'value',
							language: '',
							datatype: {
								termType: 'NamedNode',
								value: `${p_iri_tests}datatype`,
							},
						},
						graph: {
							termType: 'NamedNode',
							value: p_iri_tests+'graph',
						},
					})).to.be.true;
				});
			});
		});

		describe('RDFJS', () => {
			let d_warn = console.warn;

			// capture warn messages
			console.warn = (s_warn) => {
				// silence
				if(/^\s*Warning:/.test(s_warn)) return;

				// otherwise echo
				d_warn.apply(console, [s_warn]);
			};

			// RDFJS Data Model test suite
			// the data test suite is currently in disagreement over falsy Term values and the graph component of `Triple`
			require('@rdfjs/data-model/test')(factory);
		});
	}
}

module.exports = (...a_args) => {
	(new factory_suite(...a_args)).run();
};

