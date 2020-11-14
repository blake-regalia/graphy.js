import chai from 'chai';
const expect = chai.expect;

import crypto from 'crypto';

const hash = s => crypto.createHash('sha256').update(s).digest('base64');

import rdfjsDataModelTester from './rdfjs-data-model-test.js';

import util from '../helper/util.mjs';

const P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#';
const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDFS = 'http://www.w3.org/2000/01/rdf-schema#';

function expect_original_replaced_equals(kt_original, kt_replaced, b_equals) {
	expect(kt_replaced).to.not.equal(kt_original);
	expect(kt_replaced.equals(kt_original)).to.equal(b_equals);
	expect(kt_original.equals(kt_replaced)).to.equal(b_equals);
}

const F_REPLACER_NOOP = () => [];

function test_replacements(g_reps) {
	const {
		input: kt_test,
		validate: f_validator,
		identity: f_identity,
		replace: h_replacers={},
		map: h_map,
	} = g_reps;

	for(const s_which in h_map) {
		const g_actions = h_map[s_which];

		const s_method = `replace${s_which[0].toUpperCase()+s_which.slice(1)}`;

		for(const s_action in g_actions) {
			const a_tests = g_actions[s_action];
			const b_clone = 'clones' === s_action;

			for(const a_args of a_tests) {
				it(`#${s_method}(${a_args.map(z => 'string' === typeof z? '"'+z+'"': z+'').join(', ')})`, () => {
					const kt_replaced = kt_test[s_method](...a_args);
					f_validator(kt_replaced, ...(b_clone? f_identity(): (h_replacers[s_which] || F_REPLACER_NOOP)(...a_args)));
					expect_original_replaced_equals(kt_test, kt_replaced, b_clone);
				});
			}
		}
	}
}

const H_PREFIXES = {
	'': '#',
	test: 'test#',
	test_: 'test_#',
	xsd: P_IRI_XSD,
	rdf: P_IRI_RDF,
	rdfs: P_IRI_RDFS,
};

const G_PROPERTIES_GRAPHY_TERM_GENERAL = {
	isAbleGraph: false,
	isAbleSubject: false,
	isAblePredicate: false,
	isAbleObject: false,
	isAbleDatatype: false,

	isGraphyTerm: true,
	isGraphyQuad: false,
	isDefaultGraph: false,
	isNode: false,
	isBlankNode: false,
	isLiteral: false,
};

const G_PROPERTIES_GRAPHY_TERM_NOT_NODE = {
	isNamedNode: false,
	isAbsoluteIri: false,
	isRelativeIri: false,
	isRdfTypeAlias: false,
	isAnonymousBlankNode: false,
	isEphemeralBlankNode: false,
};

const G_PROPERTIES_GRAPHY_TERM_NOT_LITERAL = {
	isLanguagedLiteral: false,
	isDatatypedLiteral: false,
	isSimpleLiteral: false,
	isNumericLiteral: false,
	isIntegerLiteral: false,
	isDoubleLiteral: false,
	isDecimalLiteral: false,
	isBooleanLiteral: false,
	isInfiniteLiteral: false,
	isNaNLiteral: false,
};

const G_PROPERTIES_GRAPHY_TERM_ALL = {
	...G_PROPERTIES_GRAPHY_TERM_GENERAL,
	...G_PROPERTIES_GRAPHY_TERM_NOT_NODE,
	...G_PROPERTIES_GRAPHY_TERM_NOT_LITERAL,
};


const H_VALIDATORS = {
	default_graph(kt_actual) {
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isAbleGraph: true,
			isDefaultGraph: true,
			termType: 'DefaultGraph',
			value: '',
		});
	},

	term(kt_actual) {
		expect(kt_actual.equals).to.be.a('function');
		expect(kt_actual.equals()).to.be.false;
		expect(kt_actual.concise).to.be.a('function');
		expect(kt_actual.concise()).to.be.a('string');
		expect(kt_actual.terse).to.be.a('function');
		expect(kt_actual.terse()).to.be.a('string');
		expect(kt_actual.star).to.be.a('function');
		expect(kt_actual.verbose).to.be.a('function');
		expect(kt_actual.isolate).to.be.a('function');
		expect(kt_actual.hash).to.be.a('function');
		expect(kt_actual.replaceIri).to.be.a('function');
		expect(kt_actual.replaceText).to.be.a('function');
		expect(kt_actual.replaceValue).to.be.a('function');
	},

	blank_node(kt_actual, s_label=null, b_anonymous=false, b_ephemeral=false) {
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isAbleGraph: true,
			isAbleSubject: true,
			isAbleObject: true,
			isNode: true,
			isBlankNode: true,
			isAnonymousBlankNode: b_anonymous,
			isEphemeralBlankNode: b_ephemeral,
			termType: 'BlankNode',
		});

		// validate value
		if(null !== s_label) {
			expect(kt_actual.value).to.equal(s_label);
		}

		// // validate anonymous-ness
		// if(null !== b_anonymous) {
		// 	expect(kt_actual.isAnonymous).to.equal(b_anonymous);
		// }
	},

	named_node(kt_actual, w_desc=null) {
		let p_value = w_desc;
		let b_type_alias = false;
		let b_relative = false;
		if('object' === typeof w_desc && null !== w_desc) {
			p_value = w_desc.value;
			b_type_alias = w_desc.type_alias || false;
			b_relative = w_desc.relative || false;
		}

		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isAbleGraph: true,
			isAbleSubject: true,
			isAblePredicate: true,
			isAbleObject: true,
			isAbleDatatype: true,
			isRdfTypeAlias: b_type_alias,
			isNode: true,
			isNamedNode: true,
			isAbsoluteIri: !b_relative,
			isRelativeIri: b_relative,
			termType: 'NamedNode',
		});

		// validate value
		expect(kt_actual.value).to.equal(null === p_value? P_IRI_XSD+'string': p_value);
	},

	literal(kt_actual, g_descriptor={}, s_eval=null) {
		if(s_eval) return H_VALIDATORS[s_eval](kt_actual, g_descriptor);

		// abides general term and literal specifics
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_GENERAL,
			...G_PROPERTIES_GRAPHY_TERM_NOT_NODE,
			isAbleObject: true,
			isLiteral: true,
			isDatatypedLiteral: 'datatype' in g_descriptor && (P_IRI_XSD+'string') !== g_descriptor.datatype,
			isLanguagedLiteral: !!g_descriptor.language,
			isSimpleLiteral: !g_descriptor.language && (!('datatype' in g_descriptor) || (P_IRI_XSD+'string') === g_descriptor.datatype),
			termType: 'Literal',
			language: g_descriptor.language || '',
		}).and.have.property('datatype');

		expect(kt_actual.boolean).to.be.NaN;
		expect(kt_actual.number).to.be.NaN;
		expect(kt_actual.bigint).to.be.NaN;

		// validate value
		if('value' in g_descriptor) {
			expect(kt_actual.value).to.equal(g_descriptor.value);
		}

		// check datatype
		H_VALIDATORS.named_node(kt_actual.datatype, g_descriptor.language
			? P_IRI_RDF+'langString'
			: ('string' === typeof g_descriptor.datatype
				? g_descriptor.datatype
				: null));
	},

	integer(kt_actual, w_desc) {
		let xg_value;

		if('number' === typeof w_desc) {
			xg_value = BigInt(w_desc);
		}
		else if('bigint' === typeof w_desc) {
			xg_value = w_desc;
		}
		else if('string' === typeof w_desc) {
			xg_value = BigInt(w_desc);
		}

		if(xg_value > BigInt(Number.MAX_SAFE_INTEGER) || xg_value < BigInt(Number.MIN_SAFE_INTEGER)) {
			expect(kt_actual.number).to.be.NaN;
		}
		else {
			expect(kt_actual.number).to.equal(Number(xg_value));
		}

		// literal integer specifics
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isAbleObject: true,
			isLiteral: true,
			isDatatypedLiteral: true,
			isNumericLiteral: true,
			isIntegerLiteral: true,
			isNumberPrecise: true,
			termType: 'Literal',
			language: '',
			value: xg_value+'',
			bigint: xg_value,
		});

		// datatype
		H_VALIDATORS.named_node(kt_actual.datatype, P_IRI_XSD+'integer');

		// boolean value
		expect(kt_actual.boolean, '.boolean').to.be.NaN;
	},

	double(kt_actual, z_value) {
		let x_value = z_value;
		let s_value = z_value+'';

		if('string' === typeof z_value) {
			if('INF' === z_value) {
				x_value = Infinity;
			}
			else if('-INF' === z_value) {
				x_value = -Infinity;
			}
			else {
				x_value = Number(z_value);
			}
		}

		let b_nan = false;
		let b_infinite = false;

		if(Number.isNaN(x_value)) {
			expect(kt_actual.number).to.be.NaN;
			b_nan = true;
		}
		else {
			expect(kt_actual.number).to.equal(x_value);

			if(!Number.isFinite(x_value)) {
				s_value = x_value > 0? 'INF': '-INF';
				b_infinite = true;
				x_value = +x_value;
			}
		}

		// literal double specifics
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isAbleObject: true,
			isLiteral: true,
			isDatatypedLiteral: true,
			isNumericLiteral: true,
			isNumberPrecise: !b_nan && !b_infinite,
			isDoubleLiteral: true,
			isNaNLiteral: b_nan,
			isInfiniteLiteral: b_infinite,
			termType: 'Literal',
			language: '',
			value: s_value,
		});

		// datatype
		H_VALIDATORS.named_node(kt_actual.datatype, P_IRI_XSD+'double');

		expect(kt_actual.boolean, '.boolean').to.be.NaN;
		expect(kt_actual.bigint, '.bigint').to.be.NaN;
	},

	decimal(kt_actual, z_value) {
		let x_value = +z_value;
		let b_precise = true;
		if('object' === typeof z_value) {
			x_value = z_value.value;
			b_precise = z_value.precise;
		}

		// literal decimal specifics
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isAbleObject: true,
			isLiteral: true,
			isDatatypedLiteral: true,
			isNumericLiteral: true,
			isDecimalLiteral: true,
			isNumberPrecise: b_precise,
			termType: 'Literal',
			language: '',
			value: z_value+'',
			number: x_value,
		});

		// datatype
		H_VALIDATORS.named_node(kt_actual.datatype, P_IRI_XSD+'decimal');

		expect(kt_actual.boolean, '.boolean').to.be.NaN;
		expect(kt_actual.bigint, '.bigint').to.be.NaN;
	},

	boolean(kt_actual, z_value) {
		const s_value = z_value+'';
		let b_value = z_value;

		if('number' === typeof z_value) {
			b_value = !!z_value;
		}
		else if('string' === typeof z_value) {
			if('true' === z_value) {
				b_value = true;
			}
			else if('false' === z_value) {
				b_value = false;
			}
			else {
				b_value = !!(+z_value);
			}
		}

		// literal boolean specifics
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isAbleObject: true,
			isLiteral: true,
			isDatatypedLiteral: true,
			isBooleanLiteral: true,
			isNumberPrecise: true,
			termType: 'Literal',
			language: '',
			value: s_value,
			boolean: b_value,
			number: b_value? 1: 0,
			bigint: b_value? 1n: 0n,
		});

		// datatype
		H_VALIDATORS.named_node(kt_actual.datatype, P_IRI_XSD+'boolean');
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

		H_VALIDATORS[s_type](kt_actual, w_value);
	},

	date(kt_actual, dt_value) {
		// literal integer specifics
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isAbleObject: true,
			isLiteral: true,
			isDatatypedLiteral: true,
			isDateLiteral: true,
			isNumberPrecise: true,
			termType: 'Literal',
			language: '',
			value: dt_value.toISOString().replace(/T.+$/, 'Z'),
			number: dt_value.getTime(),
			bigint: BigInt(dt_value.getTime()),
		});

		expect(kt_actual.date).to.be.an.instanceof(Date);
		expect(kt_actual.date.getTime()).to.equal(dt_value.getTime());

		// datatype
		H_VALIDATORS.named_node(kt_actual.datatype, P_IRI_XSD+'date');
	},

	dateTime(kt_actual, dt_value) {
		// literal integer specifics
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isAbleObject: true,
			isLiteral: true,
			isDatatypedLiteral: true,
			isDateTimeLiteral: true,
			isNumberPrecise: true,
			termType: 'Literal',
			language: '',
			value: dt_value.toISOString(),
			number: dt_value.getTime(),
			bigint: BigInt(dt_value.getTime()),
		});

		expect(kt_actual.date).to.be.an.instanceof(Date);
		expect(kt_actual.date.getTime()).to.equal(dt_value.getTime());

		// datatype
		H_VALIDATORS.named_node(kt_actual.datatype, P_IRI_XSD+'dateTime');
	},

	variable(kt_actual, s_name) {
		// abides general term and literal specifics
		expect(kt_actual).to.include({
			...G_PROPERTIES_GRAPHY_TERM_ALL,
			isVariable: true,
			termType: 'Variable',
			value: s_name,
		});
	},
};

export default class FactorySuite {
	constructor(gc_suite) {
		this._si_export = gc_suite.export;
		this._k_factory = gc_suite.factory;
	}

	validate_c1(g_actions) {
		const k_factory = this._k_factory;
		for(const s_action in g_actions) {
			const z_action = g_actions[s_action];

			switch(s_action) {
				case 'throws': {
					const h_map = z_action;
					for(const s_group in h_map) {
						const a_tests = h_map[s_group];
						describe(s_group+' throws', () => {
							for(const s_title of a_tests) {
								it(s_title, () => {
									expect(() => k_factory.c1(s_title, H_PREFIXES)).to.throw(Error);
								});
							}
						});
					}
					break;
				}

				case 'returns': {
					const h_types = z_action;
					for(const s_type in h_types) {
						describe(s_type+' returns', () => {
							const h_cases = h_types[s_type];
							for(const s_title in h_cases) {
								const z_descriptor = h_cases[s_title];
								it(s_title, () => {
									if('function' === typeof z_descriptor) {
										z_descriptor();
									}
									else {
										H_VALIDATORS[s_type](k_factory.c1(s_title, H_PREFIXES), z_descriptor);
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
		const k_factory = this._k_factory;
		for(const s_method in h_methods) {
			const g_actions = h_methods[s_method];

			for(const s_action in g_actions) {
				const h_cases = g_actions[s_action];
				describe(`factory.${s_method} ${s_action}`, () => {
					for(const s_title in h_cases) {
						const z_case = h_cases[s_title];

						it(s_title, () => {
							switch(s_action) {
								case 'throws': {
									expect(() => k_factory[s_method](z_case)).to.throw(Error);
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

									H_VALIDATORS[s_method](k_factory[s_method](w_arg), z_value, w_arg);
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
		const k_factory = this._k_factory;

		describe(this._si_export, () => {
			describe('factory.literal', () => {
				it('w/o datatype', () => {
					H_VALIDATORS.literal(k_factory.literal('test'), {value:'test'});
				});

				it('with datatype', () => {
					const k_datatype = k_factory.namedNode('z://yes');
					H_VALIDATORS.literal(k_factory.literal('test', k_datatype), {value:'test', datatype:'z://yes'});
				});

				it('language', () => {
					H_VALIDATORS.literal(k_factory.literal('test', 'en'), {value:'test', language:'en'});
				});

				it('language w/ optional @', () => {
					H_VALIDATORS.literal(k_factory.literal('test', '@en'), {value:'test', language:'en'});
				});

				it('valueOf casts to canonical form', () => {
					expect(k_factory.literal('hello', 'en')+'').to.equal('@en"hello');
					expect(k_factory.literal('hello', k_factory.namedNode('greeting'))+'').to.equal('^>greeting"hello');
				});

				it('.verbose', () => {
					expect(k_factory.literal('hello', 'en').verbose()).to.equal('"hello"@en');
					expect(k_factory.literal('hello', k_factory.namedNode('z://greeting')).verbose()).to.equal('"hello"^^<z://greeting>');
				});

				it('.termType', () => {
					expect(k_factory.literal(''))
						.to.have.property('termType', 'Literal');
				});

				it('.isLiteral', () => {
					expect(k_factory.literal(''))
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
							'numeric string: 0xff': '0xff',
							'numeric string: 0b101': '0b101',
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
							'bigint: 0n': 0n,
							'bigint: 1n': 1n,
							'bigint: -1n': -1n,
							'bigint: Number.MAX_SAFE_INTEGER': BigInt(Number.MAX_SAFE_INTEGER),
							'bigint: Number.MIN_SAFE_INTEGER': BigInt(Number.MIN_SAFE_INTEGER),
							'bigint: Number.MAX_SAFE_INTEGER*2n': BigInt(Number.MAX_SAFE_INTEGER) * 2n,
							'bigint: Number.MIN_SAFE_INTEGER*2n': BigInt(Number.MIN_SAFE_INTEGER) * 2n,
						},
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
							'numeric string: 0xff': '0xff',
							'numeric string: 0b101': '0b101',
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
							'+Infinity': Infinity,
							'-Infinity': -Infinity,
							NaN: NaN,
						},
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
							'numeric string: 0xff': '0xff',
							'numeric string: 0b101': '0b101',
							'Number.MAX_VALUE': Number.MAX_VALUE,
							'Number.MIN_VALUE': Number.MIN_VALUE,
						},
						returns: {
							0: 0,
							1: 1,
							'-1': -1,
							0.1: 0.1,
							'-0.1': -0.1,
							'Number.MAX_SAFE_INTEGER': Number.MAX_SAFE_INTEGER,
							'Number.MIN_SAFE_INTEGER': Number.MIN_SAFE_INTEGER,
							'numeric string: 0': ['0', 0],
							'numeric string: 1': ['1', 1],
							'numeric string: -1': ['-1', -1],
							'numeric string: 0.1': ['0.1', 0.1],
							'numeric string: -0.1': ['-0.1', -0.1],
						},
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
							'boolean string: True': 'True',
							'boolean string: False': 'False',
							'boolean string: TRUE': 'TRUE',
							'boolean string: FALSE': 'FALSE',
						},
						returns: {
							true: true,
							false: false,
							0: [0, false],
							1: [1, true],
							'boolean string: true': 'true',
							'boolean string: false':'false',
							'numeric string: 1': '1',
							'numeric string: 0': '0',
						},
					},
					number: {
						throws: {
							null: null,
							undefined: undefined,  // eslint-disable-line no-undefined
							'empty string': '',
							'non-numeric string': 'hi',
							'invalid numeric string': '0  .1',
							'numeric string: 0xff': '0xff',
							'numeric string: 0b101': '0b101',
						},
						returns: {
							0: [0, 'integer'],
							1: [1, 'integer'],
							'-1': [-1, 'integer'],
							0.1: [0.1, 'double'],
							'-0.1': [-0.1, 'double'],
							'+Infinity': [Infinity, 'double'],
							'-Infinity': [-Infinity, 'double'],
							NaN: [NaN, 'double'],
							'Number.MAX_SAFE_INTEGER': [Number.MAX_SAFE_INTEGER, 'integer'],
							'Number.MIN_SAFE_INTEGER': [Number.MIN_SAFE_INTEGER, 'integer'],
							'Number.MAX_VALUE': [Number.MAX_VALUE, 'integer'],
							'Number.MIN_VALUE': [Number.MIN_VALUE, 'double'],
							'numeric string: 0': ['0', ['integer', 0]],
							'numeric string: 1': ['1', ['integer', 1]],
							'numeric string: -1': ['-1', ['integer', -1]],
							'numeric string: 0.1': ['0.1', ['decimal', 0.1]],
							'numeric string: -0.1': ['-0.1', ['decimal', -0.1]],
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
						'leading space': [
							' :abc',
							' _:abc',
							' ?abc',
							' "abc',
							' @en"abc',
							' ^xsd:d"abc',
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
							'^xsd:boolean"never': {value:'never', datatype:P_IRI_XSD+'boolean'},
						},
						number: {
							'^xsd:integer"10': ['integer', 10],
							'^xsd:integer"-10': ['integer', -10],
							[`^xsd:integer"${Number.MAX_SAFE_INTEGER}`]: ['integer', Number.MAX_SAFE_INTEGER],
							[`^xsd:integer"${Number.MIN_SAFE_INTEGER}`]: ['integer', Number.MIN_SAFE_INTEGER],
							[`^xsd:integer"${BigInt(Number.MAX_SAFE_INTEGER)*2n}`]: ['integer', BigInt(Number.MAX_SAFE_INTEGER)*2n],
							[`^xsd:integer"${BigInt(Number.MIN_SAFE_INTEGER)*2n}`]: ['integer', BigInt(Number.MIN_SAFE_INTEGER)*2n],
							'^xsd:double"5': ['double', 5],
							'^xsd:double"5.1': ['double', 5.1],
							'^xsd:double"INF': ['double', Infinity],
							'^xsd:double"-INF': ['double', -Infinity],
							'^xsd:double"NaN': ['double', NaN],
							'^xsd:decimal"5.1': ['decimal', 5.1],
							'^xsd:boolean"true': ['boolean', true],
							'^xsd:boolean"false': ['boolean', false],
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
							a: {value:P_IRI_RDF+'type', type_alias:true},
						},
						blank_node: {
							'_:': () => {
								const kt_blank = k_factory.c1('_:');
								H_VALIDATORS.blank_node(kt_blank, null, true);
								expect(kt_blank.value).to.have.length('_fee893ce_d36a_4413_a197_a9f47a3e5991'.length);
							},
							'_:#anonymous': () => {
								const kt_blank = k_factory.c1('_:#anonymous');
								H_VALIDATORS.blank_node(kt_blank, null, true, true);
								expect(kt_blank.value).to.have.length('_fee893ce_d36a_4413_a197_a9f47a3e5991'.length);
							},
							'_:b': 'b',
							'_:b1': 'b1',
						},
						default_graph: {
							'*': '',
						},
						variable: {
							'?test': 'test',
						},
					},
				});
			});

			describe('factory.c3', () => {
				it('works', () => {
					util.validate_quads(k_factory.c3({
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
					util.validate_quads(k_factory.c3({
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
					util.validate_quads(k_factory.c4({
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
					util.validate_quads(k_factory.c4({
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
					expect(k_factory.comment()).to.be.a('string');
				});
			});

			describe('factory.newlines()', () => {
				it('returns a string', () => {
					expect(k_factory.comment()).to.be.a('string');
				});
			});

			describe('DefaultGraph', () => {
				const kt_graph = k_factory.defaultGraph();

				it('valid', () => {
					H_VALIDATORS.default_graph(kt_graph);
				});

				it('#equals(this)', () => {
					expect(kt_graph.equals(kt_graph)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_graph.equals(k_factory.defaultGraph())).to.be.true;
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

				it('#star()', () => {
					expect(kt_graph.star()).to.equal('');
				});

				it('#star({})', () => {
					expect(kt_graph.star({})).to.equal('');
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

				it('#hash()', () => {
					expect(kt_graph.hash()).to.equal(hash('*'));
				});


				test_replacements({
					input: kt_graph,
					validate: H_VALIDATORS.default_graph,
					identity: () => [],
					replace: {},
					map: {
						iri: {
							clones: [
								['*', ''],
								['', 'X'],
								[/./g, ''],
								[/./g, 'X'],
							],
						},
					},
				});
			});

			describe('NamedNode', () => {
				const p_iri_tests = 'https://graphy.link/tests#';
				const p_iri_node = p_iri_tests+'node';
				const kt_node = k_factory.namedNode(p_iri_node);
				const h_prefixes = {
					tests: p_iri_tests,
				};

				it('valid', () => {
					H_VALIDATORS.named_node(kt_node, p_iri_node);
				});

				it('replaced invalid \\u0009', () => {
					H_VALIDATORS.named_node(k_factory.namedNode('z://y/\t'), 'z://y/\\u0009');
				});

				it('replaced invalid %hi', () => {
					H_VALIDATORS.named_node(k_factory.namedNode('z://y/%hi'), 'z://y/\\u0025hi');
				});

				// it('replaced invalid \\UXXXXXXXX', () => {
				// 	H_VALIDATORS.named_node(k_factory.namedNode('z://y/\u{00010420}'), 'z://y//\\U00010420');
				// });

				it('#equals(this)', () => {
					expect(kt_node.equals(kt_node)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_node.equals(k_factory.namedNode(p_iri_node))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_node.equals(kt_node.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_node.equals({
						termType: 'NamedNode',
						value: p_iri_node,
					})).to.be.true;
				});

				it('#concise()', () => {
					expect(kt_node.concise()).to.equal(`>${p_iri_node}`);
				});

				it('#concise(h_prefixes)', () => {
					expect(kt_node.concise(h_prefixes)).to.equal('tests:node');
				});

				it('#terse()', () => {
					expect(kt_node.terse()).to.equal(`<${p_iri_node}>`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kt_node.terse(h_prefixes)).to.equal('tests:node');
				});

				it('#star()', () => {
					expect(kt_node.star()).to.equal(`<${p_iri_node}>`);
				});

				it('#star(h_prefixes)', () => {
					expect(kt_node.star(h_prefixes)).to.equal('tests:node');
				});

				it('#verbose()', () => {
					expect(kt_node.verbose()).to.equal(`<${p_iri_node}>`);
				});

				it('#isolate()', () => {
					expect(kt_node.isolate()).to.eql({
						termType: 'NamedNode',
						value: p_iri_node,
					});
				});

				it('#hash()', () => {
					expect(kt_node.hash()).to.equal(hash(`>${p_iri_node}`));
				});

				const f_replacer_iri = (w_search, w_replace) => [p_iri_node.replace(w_search, w_replace)];
				const g_replace_iri = {
					clones: [
						['absent', 'never'],
						[/absent/, 'never'],
					],
					replaces: [
						['tests', 'replaced'],
						[/tests/, 'replaced'],
						[/s/g, 'x'],
					],
				};

				test_replacements({
					input: kt_node,
					validate: H_VALIDATORS.named_node,
					identity: () => [p_iri_node],
					replace: {
						iri: f_replacer_iri,
						value: f_replacer_iri,
					},
					map: {
						iri: g_replace_iri,
						value: g_replace_iri,
						text: {
							clones: [
								['tests', 'never'],
								[/tests/, 'never'],
								[/s/g, 'x'],
							],
						},
					},
				});
			});

			describe('Relative Iri', () => {
				const s_relative = '#banana';
				const kt_node = k_factory.namedNode(s_relative);
				const p_iri_base = 'https://graphy.link/base';
				const h_prefixes = k_factory.setBaseIri({}, p_iri_base);

				const h_prefixes_never = k_factory.setBaseIri({
					never: p_iri_base,
				}, p_iri_base);

				const h_prefixes_base = k_factory.setBaseIri({
					base: p_iri_base+'#',
				}, p_iri_base+'#');

				it('valid', () => {
					H_VALIDATORS.named_node(kt_node, {value:s_relative, relative:true});
				});

				it('#equals(this)', () => {
					expect(kt_node.equals(kt_node)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_node.equals(k_factory.namedNode(s_relative))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_node.equals(kt_node.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_node.equals({
						termType: 'NamedNode',
						value: s_relative,
					})).to.be.true;
				});

				it('#concise()', () => {
					expect(() => kt_node.concise()).to.throw();
				});

				it('#concise({})', () => {
					expect(() => kt_node.concise({})).to.throw();
				});

				it('#concise(h_prefixes)', () => {
					expect(kt_node.concise(h_prefixes)).to.equal('>'+p_iri_base+s_relative);
				});

				it('#terse()', () => {
					expect(kt_node.terse()).to.equal('<'+s_relative+'>');
				});

				it('#terse({})', () => {
					expect(kt_node.terse({})).to.equal('<'+s_relative+'>');
				});

				it('#terse(h_prefixes)', () => {
					expect(kt_node.terse(h_prefixes)).to.equal('<'+s_relative+'>');
				});

				it('#terse(h_prefixes_never)', () => {
					expect(kt_node.terse(h_prefixes_never)).to.equal('<'+s_relative+'>');
				});

				it('#terse(h_prefixes_base)', () => {
					expect(k_factory.namedNode('banana').terse(h_prefixes_base)).to.equal('base:banana');
				});

				it('#star()', () => {
					expect(kt_node.star()).to.equal('<'+s_relative+'>');
				});

				it('#star({})', () => {
					expect(kt_node.star({})).to.equal('<'+s_relative+'>');
				});

				it('#star(h_prefixes)', () => {
					expect(kt_node.star(h_prefixes)).to.equal('<'+s_relative+'>');
				});

				it('#star(h_prefixes_base)', () => {
					expect(k_factory.namedNode('banana').star(h_prefixes_base)).to.equal('base:banana');
				});

				it('#verbose()', () => {
					expect(() => kt_node.verbose()).to.throw();
				});

				it('#isolate()', () => {
					expect(kt_node.isolate()).to.eql({
						termType: 'NamedNode',
						value: s_relative,
					});
				});

				it('#hash()', () => {
					expect(() => kt_node.hash()).to.throw();
				});

				const g_replace_never = {
					clones: [
						['banana', 'never'],
						[/banana/, 'never'],
						[/n/g, 'x'],
					],
				};

				test_replacements({
					input: kt_node,
					validate: H_VALIDATORS.named_node,
					identity: () => [{value:s_relative, relative:true}],
					replace: {
						value: (w_search, w_replace) => [{value:s_relative.replace(w_search, w_replace), relative:true}],
					},
					map: {
						iri: g_replace_never,
						text: g_replace_never,
						value: {
							clones: [
								['absent', 'never'],
								[/absent/, 'never'],
							],
							replaces: [
								['banana', 'replaced'],
								[/banana/, 'replaced'],
								[/n/g, 'x'],
							],
						},
					},
				});

				it('#resolve()', () => {
					expect(() => kt_node.resolve()).to.throw();
				});

				it('#resolve({})', () => {
					expect(() => kt_node.resolve({})).to.throw();
				});

				it('#resolve(p_iri_base)', () => {
					H_VALIDATORS.named_node(kt_node.resolve(p_iri_base), p_iri_base+s_relative);
				});

				it('#resolve(h_prefixes_base)', () => {
					H_VALIDATORS.named_node(k_factory.namedNode('banana').resolve(h_prefixes_base), p_iri_base+s_relative);
				});
			});

			describe('Labeled Blank Node', () => {
				const kt_node = k_factory.blankNode('label');

				it('#equals(this)', () => {
					expect(kt_node.equals(kt_node)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_node.equals(k_factory.blankNode('label'))).to.be.true;
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

				it('#star()', () => {
					expect(kt_node.star()).to.equal('_:label');
				});

				it('#star({})', () => {
					expect(kt_node.star({})).to.equal('_:label');
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

				it('#hash()', () => {
					expect(kt_node.hash()).to.equal(hash('_:label'));
				});

				const g_replace_never = {
					clones: [
						['label', 'never'],
						[/label/, 'never'],
						[/l/g, 'x'],
					],
				};

				test_replacements({
					input: kt_node,
					validate: H_VALIDATORS.blank_node,
					identity: () => ['label'],
					replace: {
						value: (w_search, w_replace) => ['label'.replace(w_search, w_replace)],
					},
					map: {
						iri: g_replace_never,
						text: g_replace_never,
						value: {
							clones: [
								['absent', 'never'],
								[/absent/, 'never'],
							],
							replaces: [
								['label', 'replaced'],
								[/label/, 'replaced'],
								[/l/g, 'x'],
							],
						},
					},
				});
			});

			describe('Ephemeral Blank Node', () => {
				const kt_node = k_factory.ephemeral();
				const nl_uuidv4 = 'xxxxyyyy-xxxx-yyyy-zzzz-xxxxyyyyzzzz'.length;

				it('.value !== .value', () => {
					expect(kt_node.value).to.not.equal(kt_node.value);
				});

				it('#equals(this)', () => {
					expect(kt_node.equals(kt_node)).to.be.false;
				});

				it('#equals(other)', () => {
					expect(kt_node.equals(k_factory.blankNode(kt_node.value))).to.be.false;
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

				it('#hash()', () => {
					expect(kt_node.hash()).to.be.a('string')
						.that.does.not.equal(hash('_:'+kt_node.value));
				});

				// test_replacements({
				// 	input: kt_node,
				// 	validate: H_VALIDATORS.blank_node,
				// 	identity: () => [null, true, true],
				// 	replace: {
				// 		// value: (w_search, w_replace) => [''],
				// 	},
				// 	map: {
				// 		iri: {
				// 			different: [
				// 				['absent', 'never'],
				// 				[/absent/, 'never'],
				// 			],
				// 		},
				// 	},
				// });
			});

			describe('Auto Blank Node', () => {
				const kt_node = k_factory.blankNode();
				const s_hash_eg = 'xxxxyyyy-xxxx-yyyy-zzzz-xxxxyyyyzzzz';
				const nl_uuidv4 = s_hash_eg.length;

				it('#equals(this)', () => {
					expect(kt_node.equals(kt_node)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_node.equals(k_factory.blankNode(kt_node.value))).to.be.true;
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

				it('#star()', () => {
					expect(kt_node.star()).to.startWith('_:_').and.have.lengthOf(nl_uuidv4+3);
				});

				it('#star({})', () => {
					expect(kt_node.star({})).to.startWith('_:_').and.have.lengthOf(nl_uuidv4+3);
				});

				it('#verbose()', () => {
					expect(kt_node.verbose()).to.startWith('_:_').and.have.lengthOf(nl_uuidv4+3);
				});

				it('#isolate()', () => {
					expect(kt_node.isolate()).to.include({
						termType: 'BlankNode',
					}).and.to.have.property('value').that.has.lengthOf(nl_uuidv4+1);
				});

				it('#hash()', () => {
					expect(kt_node.hash()).to.equal(hash('_:'+kt_node.value));
				});

				// test_replacements({
				// 	input: kt_node,
				// 	validate: H_VALIDATORS.blank_node,
				// 	identity: () => [null, true],
				// 	// replace: (w_search, w_replace) => ['label'.replace(w_search, w_replace)],
				// 	map: {
				// 		iri: {
				// 			clones: [
				// 				['absent', 'never'],
				// 				[/absent/, 'never'],
				// 			],
				// 			// replaces: [
				// 			// 	['label', 'replaced'],
				// 			// 	[/label/, 'replaced'],
				// 			// 	[/l/g, 'x'],
				// 			// ],
				// 		},
				// 	},
				// });

				// it('#replace("absent", "never")', () => {
				// 	const kt_replaced = kt_node.replace('absent', 'never');
				// 	H_VALIDATORS.blank_node(kt_replaced, null, true);
				// 	expect_original_replaced_equals(kt_node, kt_replaced, false);
				// });

				// it('#replace(/absent/, "never")', () => {
				// 	const kt_replaced = kt_node.replace(/absent/, 'never');
				// 	H_VALIDATORS.blank_node(kt_replaced, null, true);
				// 	expect_original_replaced_equals(kt_node, kt_replaced, false);
				// });
			});

			describe('Plain Literal', () => {
				const kt_literal = k_factory.literal('value');

				it('#equals(this)', () => {
					expect(kt_literal.equals(kt_literal)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_literal.equals(k_factory.literal('value'))).to.be.true;
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

				it('#star()', () => {
					expect(kt_literal.star()).to.equal('"value"');
				});

				it('#star({})', () => {
					expect(kt_literal.star({})).to.equal('"value"');
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

				it('#hash()', () => {
					expect(kt_literal.hash()).to.equal(hash('"value'));
				});

				test_replacements({
					input: kt_literal,
					validate: H_VALIDATORS.literal,
					identity: () => [{value:'value'}],
					replace: {
						text: (w_search, w_replace) => [{value:kt_literal.value.replace(w_search, w_replace)}],
						value: (w_search, w_replace) => [{value:kt_literal.value.replace(w_search, w_replace), datatype:kt_literal.datatype.value.replace(w_search, w_replace)}],
						iri: (w_search, w_replace) => [{value:kt_literal.value, datatype:kt_literal.datatype.value.replace(w_search, w_replace)}],
					},
					map: {
						text: {
							clones: [
								['absent', 'never'],
								[/absent/, 'never'],
							],
							replaces: [
								['value', 'replaced'],
								[/value/, 'replaced'],
								[/a/g, 'x'],
							],
						},
						value: {
							clones: [
								['absent', 'never'],
								[/absent/, 'never'],
							],
							replaces: [
								['value', 'replaced'],
								[/value/, 'replaced'],
								[/a/g, 'x'],
							],
						},
						iri: {
							clones: [
								['absent', 'never'],
								[/absent/, 'never'],
							],
							replaces: [
								['string', 'replace'],
								[/string/, 'replace'],
								[/s/g, 'x'],
							],
						},
					},
				});
			});

			describe('Languaged Literal', () => {
				const kt_literal = k_factory.literal('value', 'en');

				it('#equals(this)', () => {
					expect(kt_literal.equals(kt_literal)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_literal.equals(k_factory.literal('value', 'en'))).to.be.true;
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

				it('#star()', () => {
					expect(kt_literal.star()).to.equal('"value"@en');
				});

				it('#star({})', () => {
					expect(kt_literal.star({})).to.equal('"value"@en');
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

				it('#hash()', () => {
					expect(kt_literal.hash()).to.equal(hash('@en"value'));
				});

				const f_replace_text = (w_search, w_replace) => [{value:'value'.replace(w_search, w_replace), language:'en'}];
				const g_replace_text = {
					clones: [
						['absent', 'never'],
						[/absent/, 'never'],
						['en', 'never'],
						[/end/, 'never'],
					],
					replaces: [
						['value', 'replaced'],
						[/value/, 'replaced'],
						[/l/g, 'x'],
					],
				};

				test_replacements({
					input: kt_literal,
					validate: H_VALIDATORS.literal,
					identity: () => [{value:'value', language:'en'}],
					replace: {
						text: f_replace_text,
						value: f_replace_text,
					},
					map: {
						text: g_replace_text,
						value: g_replace_text,
						iri: {
							clones: [
								['value', 'never'],
								[/value/, 'never'],
								[/l/g, 'x'],
							],
						},
					},
				});
			});

			describe('Datatyped Literal', () => {
				const p_iri_tests = 'https://graphy.link/tests#';
				const p_iri_datatype = p_iri_tests+'datatype';
				const kt_datatype = k_factory.namedNode(p_iri_datatype);
				const h_prefixes = {
					tests: p_iri_tests,
				};
				const kt_literal = k_factory.literal('value', kt_datatype);

				it('#equals(this)', () => {
					expect(kt_literal.equals(kt_literal)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_literal.equals(k_factory.literal('value', k_factory.namedNode(p_iri_tests+'datatype')))).to.be.true;
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
							value: p_iri_datatype,
						},
					})).to.be.true;
				});

				it('#concise()', () => {
					expect(kt_literal.concise()).to.equal(`^>${p_iri_datatype}"value`);
				});

				it('#concise(h_prefixes)', () => {
					expect(kt_literal.concise(h_prefixes)).to.equal(`^tests:datatype"value`);
				});

				it('#terse()', () => {
					expect(kt_literal.terse()).to.equal(`"value"^^<${p_iri_datatype}>`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kt_literal.terse(h_prefixes)).to.equal('"value"^^tests:datatype');
				});

				it('#star()', () => {
					expect(kt_literal.star()).to.equal(`"value"^^<${p_iri_datatype}>`);
				});

				it('#star(h_prefixes)', () => {
					expect(kt_literal.star(h_prefixes)).to.equal('"value"^^tests:datatype');
				});

				it('#verbose()', () => {
					expect(kt_literal.verbose()).to.equal(`"value"^^<${p_iri_datatype}>`);
				});

				it('#isolate()', () => {
					expect(kt_literal.isolate()).to.eql({
						termType: 'Literal',
						value: 'value',
						language: '',
						datatype: {
							termType: 'NamedNode',
							value: p_iri_datatype,
						},
					});
				});

				it('#hash()', () => {
					expect(kt_literal.hash()).to.equal(hash(`^>${p_iri_datatype}"value`));
				});

				test_replacements({
					input: kt_literal,
					validate: H_VALIDATORS.literal,
					identity: () => [{value:'value', datatype:p_iri_datatype}],
					replace: {
						iri: (w_search, w_replace) => [{value:'value', datatype:p_iri_datatype.replace(w_search, w_replace)}],
						text: (w_search, w_replace) => [{value:'value'.replace(w_search, w_replace), datatype:p_iri_datatype}],
						value: (w_search, w_replace) => [{value:'value'.replace(w_search, w_replace), datatype:p_iri_datatype.replace(w_search, w_replace)}],
					},
					map: {
						iri: {
							clones: [
								['absent', 'never'],
								[/absent/, 'never'],
								['value', 'never'],
								[/value/, 'never'],
							],
							replaces: [
								['datatype', 'replaced'],
								[/datatype/, 'replaced'],
								[/a/g, 'x'],
							],
						},
						text: {
							clones: [
								['absent', 'never'],
								[/absent/, 'never'],
								['datatype', 'never'],
								[/datatype/, 'never'],
							],
							replaces: [
								['value', 'replaced'],
								[/value/, 'replaced'],
								[/a/g, 'x'],
							],
						},
						value: {
							clones: [
								['absent', 'never'],
								[/absent/, 'never'],
							],
							replaces: [
								['value', 'replaced'],
								[/value/, 'replaced'],
								['datatype', 'never'],
								[/datatype/, 'never'],
								[/a/g, 'x'],
							],
						},
					},
				});
			});

			describe('Integer Literal', () => {
				const p_iri_datatype = P_IRI_XSD+'integer';
				const kt_literal = k_factory.integer(5);
				const h_prefixes = {
					xsd: P_IRI_XSD,
				};

				it('integer(0)', () => {
					H_VALIDATORS.integer(k_factory.integer(0), 0);
				});

				it('integer(1)', () => {
					H_VALIDATORS.integer(k_factory.integer(1), 1);
				});

				it('integer(-1)', () => {
					H_VALIDATORS.integer(k_factory.integer(-1), -1);
				});

				it('integer(Number.MAX_SAFE_INTEGER)', () => {
					H_VALIDATORS.integer(k_factory.integer(Number.MAX_SAFE_INTEGER), Number.MAX_SAFE_INTEGER);
				});

				it('integer(Number.MIN_SAFE_INTEGER)', () => {
					H_VALIDATORS.integer(k_factory.integer(Number.MIN_SAFE_INTEGER), Number.MIN_SAFE_INTEGER);
				});

				it('integer(Number.MAX_SAFE_INTEGER*2)', () => {
					H_VALIDATORS.integer(k_factory.integer(Number.MAX_SAFE_INTEGER*2), Number.MAX_SAFE_INTEGER*2);
				});

				it('integer(Number.MIN_SAFE_INTEGER*2)', () => {
					H_VALIDATORS.integer(k_factory.integer(Number.MIN_SAFE_INTEGER*2), Number.MIN_SAFE_INTEGER*2);
				});


				it('integer(0n)', () => {
					H_VALIDATORS.integer(k_factory.integer(0n), 0n);
				});

				it('integer(1n)', () => {
					H_VALIDATORS.integer(k_factory.integer(1n), 1n);
				});

				it('integer(-1n)', () => {
					H_VALIDATORS.integer(k_factory.integer(-1n), -1n);
				});

				const xg_max_safe_int = BigInt(Number.MAX_SAFE_INTEGER);
				const xg_min_safe_int = BigInt(Number.MIN_SAFE_INTEGER);

				it('integer(Number.MAX_SAFE_INTEGER+1n)', () => {
					H_VALIDATORS.integer(k_factory.integer(xg_max_safe_int+1n), xg_max_safe_int+1n);
				});

				it('integer(Number.MIN_SAFE_INTEGER-1n)', () => {
					H_VALIDATORS.integer(k_factory.integer(xg_min_safe_int-1n), xg_min_safe_int-1n);
				});


				it('integer("0")', () => {
					H_VALIDATORS.integer(k_factory.integer('0'), '0');
				});

				it('integer("1")', () => {
					H_VALIDATORS.integer(k_factory.integer('1'), '1');
				});

				it('integer("-1")', () => {
					H_VALIDATORS.integer(k_factory.integer('-1'), '-1');
				});

				it('integer("10")', () => {
					H_VALIDATORS.integer(k_factory.integer('10'), '10');
				});

				it('integer("-10")', () => {
					H_VALIDATORS.integer(k_factory.integer('-10'), '-10');
				});

				it('integer(""+Number.MAX_SAFE_INTEGER)', () => {
					H_VALIDATORS.integer(k_factory.integer(''+Number.MAX_SAFE_INTEGER), ''+Number.MAX_SAFE_INTEGER);
				});

				it('integer(""+Number.MIN_SAFE_INTEGER)', () => {
					H_VALIDATORS.integer(k_factory.integer(''+Number.MIN_SAFE_INTEGER), ''+Number.MIN_SAFE_INTEGER);
				});

				it('integer(""+Number.MAX_SAFE_INTEGER*2n)', () => {
					H_VALIDATORS.integer(k_factory.integer(''+(BigInt(Number.MAX_SAFE_INTEGER)*2n)), ''+(BigInt(Number.MAX_SAFE_INTEGER)*2n));
				});

				it('integer(""+Number.MIN_SAFE_INTEGER*2n)', () => {
					H_VALIDATORS.integer(k_factory.integer(''+(BigInt(Number.MIN_SAFE_INTEGER)*2n)), ''+(BigInt(Number.MIN_SAFE_INTEGER)*2n));
				});


				it('integer(Infinity)', () => {
					expect(() => k_factory.integer(Infinity)).to.throw();
				});

				it('integer(NaN)', () => {
					expect(() => k_factory.integer(NaN)).to.throw();
				});

				it('integer(5.1)', () => {
					expect(() => k_factory.integer(5.1)).to.throw();
				});

				it('integer("")', () => {
					expect(() => k_factory.integer()).to.throw();
				});

				it('integer("never")', () => {
					expect(() => k_factory.integer('never')).to.throw();
				});

				it('integer("5.1")', () => {
					expect(() => k_factory.integer('5.1')).to.throw();
				});

				it('integer()', () => {
					expect(() => k_factory.integer()).to.throw();
				});

				it('integer(null)', () => {
					expect(() => k_factory.integer(null)).to.throw();
				});

				it('integer({})', () => {
					expect(() => k_factory.integer({})).to.throw();
				});


				it('#equals(this)', () => {
					expect(kt_literal.equals(kt_literal)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kt_literal.equals(k_factory.literal('5', k_factory.namedNode(p_iri_datatype)))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kt_literal.equals(kt_literal.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kt_literal.equals({
						termType: 'Literal',
						value: '5',
						language: '',
						datatype: {
							termType: 'NamedNode',
							value: p_iri_datatype,
						},
					})).to.be.true;
				});

				it('#concise()', () => {
					expect(kt_literal.concise()).to.equal(`^>${p_iri_datatype}"5`);
				});

				it('#concise(h_prefixes)', () => {
					expect(kt_literal.concise(h_prefixes)).to.equal(`^xsd:integer"5`);
				});

				it('#terse()', () => {
					expect(kt_literal.terse()).to.equal('5');
				});

				it('#terse(h_prefixes)', () => {
					expect(kt_literal.terse(h_prefixes)).to.equal('5');
				});

				it('#star()', () => {
					expect(kt_literal.star()).to.equal('5');
				});

				it('#star(h_prefixes)', () => {
					expect(kt_literal.star(h_prefixes)).to.equal('5');
				});

				it('#verbose()', () => {
					expect(kt_literal.verbose()).to.equal(`"5"^^<${p_iri_datatype}>`);
				});

				it('#isolate()', () => {
					expect(kt_literal.isolate()).to.eql({
						termType: 'Literal',
						value: '5',
						language: '',
						datatype: {
							termType: 'NamedNode',
							value: p_iri_datatype,
						},
					});
				});

				it('#hash()', () => {
					expect(kt_literal.hash()).to.equal(hash(`^>${p_iri_datatype}"5`));
				});

				// it('#replace("absent", "never")', () => {
				// 	const kt_replaced = kt_literal.replace('absent', 'never');
				// 	H_VALIDATORS.integer(kt_replaced, 5);
				// 	expect_original_replaced_equals(kt_literal, kt_replaced, true);
				// });

				// it('#replace(/absent/, "never")', () => {
				// 	const kt_replaced = kt_literal.replace(/absent/, 'never');
				// 	H_VALIDATORS.integer(kt_replaced, 5);
				// 	expect_original_replaced_equals(kt_literal, kt_replaced, true);
				// });

				// it('#replace("integer", "never")', () => {
				// 	const kt_replaced = kt_literal.replace('integer', 'never');
				// 	H_VALIDATORS.integer(kt_replaced, 5);
				// 	expect_original_replaced_equals(kt_literal, kt_replaced, true);
				// });

				// it('#replace(/integer/, "never")', () => {
				// 	const kt_replaced = kt_literal.replace(/integer/, 'never');
				// 	H_VALIDATORS.integer(kt_replaced, 5);
				// 	expect_original_replaced_equals(kt_literal, kt_replaced, true);
				// });

				// it('#replace("5", "replaced")', () => {
				// 	const kt_replaced = kt_literal.replace('5', 'replaced');
				// 	H_VALIDATORS.literal(kt_replaced, {value:'replaced', datatype:p_iri_datatype});
				// 	expect_original_replaced_equals(kt_literal, kt_replaced, false);
				// });

				// it('#replace(/5/, "replaced")', () => {
				// 	const kt_replaced = kt_literal.replace(/5/, 'replaced');
				// 	H_VALIDATORS.literal(kt_replaced, {value:'replaced', datatype:p_iri_datatype});
				// 	expect_original_replaced_equals(kt_literal, kt_replaced, false);
				// });

				// it('#replace(/5/g, "x")', () => {
				// 	const kt_replaced = kt_literal.replace(/5/g, 'x');
				// 	H_VALIDATORS.literal(kt_replaced, {value:'5'.replace(/5/g, 'x'), datatype:p_iri_datatype});
				// 	expect_original_replaced_equals(kt_literal, kt_replaced, false);
				// });
			});

			describe('Double Literal', () => {
				it('double(0)', () => {
					H_VALIDATORS.double(k_factory.double(0), 0);
				});

				it('double(1)', () => {
					H_VALIDATORS.double(k_factory.double(1), 1);
				});

				it('double(-1)', () => {
					H_VALIDATORS.double(k_factory.double(-1), -1);
				});

				it('double(Number.MAX_VALUE)', () => {
					H_VALIDATORS.double(k_factory.double(Number.MAX_VALUE), Number.MAX_VALUE);
				});

				it('double(Number.MIN_VALUE)', () => {
					H_VALIDATORS.double(k_factory.double(Number.MIN_VALUE), Number.MIN_VALUE);
				});

				it('double(0.1)', () => {
					H_VALIDATORS.double(k_factory.double(0.1), 0.1);
				});

				it('double(1.1)', () => {
					H_VALIDATORS.double(k_factory.double(1.1), 1.1);
				});

				it('double(-1.1)', () => {
					H_VALIDATORS.double(k_factory.double(-1.1), -1.1);
				});


				it('double("0")', () => {
					H_VALIDATORS.double(k_factory.double('0'), '0');
				});

				it('double("1")', () => {
					H_VALIDATORS.double(k_factory.double('1'), '1');
				});

				it('double("-1")', () => {
					H_VALIDATORS.double(k_factory.double('-1'), '-1');
				});

				it('double("5.1")', () => {
					H_VALIDATORS.double(k_factory.double('5.1'), '5.1');
				});

				it('double("-5.1")', () => {
					H_VALIDATORS.double(k_factory.double('-5.1'), '-5.1');
				});

				it('double(""+Number.MAX_VALUE)', () => {
					H_VALIDATORS.double(k_factory.double(''+Number.MAX_VALUE), ''+Number.MAX_VALUE);
				});

				it('double(""+Number.MIN_VALUE)', () => {
					H_VALIDATORS.double(k_factory.double(''+Number.MIN_VALUE), ''+Number.MIN_VALUE);
				});


				it('double("")', () => {
					expect(() => k_factory.double()).to.throw();
				});

				it('double("never")', () => {
					expect(() => k_factory.double('never')).to.throw();
				});

				it('double()', () => {
					expect(() => k_factory.double()).to.throw();
				});

				it('double(null)', () => {
					expect(() => k_factory.double(null)).to.throw();
				});

				it('double({})', () => {
					expect(() => k_factory.double({})).to.throw();
				});

				const kt_literal = k_factory.double(5.1);
				const p_iri_datatype = `${P_IRI_XSD}double`;
				const h_prefixes = {
					xsd: P_IRI_XSD,
				};

				it('#concise()', () => {
					expect(kt_literal.concise()).to.equal(`^>${p_iri_datatype}"5.1`);
				});

				it('#concise({})', () => {
					expect(kt_literal.concise({})).to.equal(`^>${p_iri_datatype}"5.1`);
				});

				it('#concise(h_prefixes)', () => {
					expect(kt_literal.concise(h_prefixes)).to.equal(`^xsd:double"5.1`);
				});

				it('#terse()', () => {
					expect(kt_literal.terse()).to.equal(`5.1e+0`);
				});

				it('#terse({})', () => {
					expect(kt_literal.terse({})).to.equal(`5.1e+0`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kt_literal.terse(h_prefixes)).to.equal(`5.1e+0`);
				});

				it('#star()', () => {
					expect(kt_literal.star()).to.equal(`5.1e+0`);
				});

				it('#star({})', () => {
					expect(kt_literal.star({})).to.equal(`5.1e+0`);
				});

				it('#star(h_prefixes)', () => {
					expect(kt_literal.star(h_prefixes)).to.equal(`5.1e+0`);
				});

				it('#verbose()', () => {
					expect(kt_literal.verbose()).to.equal(`"5.1"^^<${p_iri_datatype}>`);
				});

				it('#isolate()', () => {
					expect(kt_literal.isolate()).to.eql({
						termType: 'Literal',
						value: '5.1',
						language: '',
						datatype: {
							termType: 'NamedNode',
							value: P_IRI_XSD+'double',
						},
					});
				});

				it('#hash()', () => {
					expect(kt_literal.hash()).to.equal(hash(`^>${p_iri_datatype}"5.1`));
				});
			});

			describe('Infinite Literal', () => {
				it('double(Infinity)', () => {
					H_VALIDATORS.double(k_factory.double(Infinity), Infinity);
				});

				it('double(-Infinity)', () => {
					H_VALIDATORS.double(k_factory.double(-Infinity), -Infinity);
				});

				it('double("Infinity")', () => {
					expect(() => k_factory.double('Infinity')).to.throw();
				});

				it('double("-Infinity")', () => {
					expect(() => k_factory.double('-Infinity')).to.throw();
				});

				it('double("INF")', () => {
					H_VALIDATORS.double(k_factory.double('INF'), 'INF');
				});

				it('double("-INF")', () => {
					H_VALIDATORS.double(k_factory.double('-INF'), '-INF');
				});
			});

			describe('NaN Literal', () => {
				it('double(NaN)', () => {
					H_VALIDATORS.double(k_factory.double(NaN+''), NaN);
				});

				it('double(""+NaN)', () => {
					H_VALIDATORS.double(k_factory.double(NaN+''), NaN+'');
				});
			});

			describe('Decimal Literal', () => {
				it('decimal(0)', () => {
					H_VALIDATORS.decimal(k_factory.decimal(0), 0);
				});

				it('decimal(1)', () => {
					H_VALIDATORS.decimal(k_factory.decimal(1), 1);
				});

				it('decimal(-1)', () => {
					H_VALIDATORS.decimal(k_factory.decimal(-1), -1);
				});

				it('decimal(Number.MAX_VALUE)', () => {
					expect(() => k_factory.decimal(Number.MAX_VALUE)).to.throw();
				});

				it('decimal(Number.MIN_VALUE)', () => {
					expect(() => k_factory.decimal(Number.MIN_VALUE)).to.throw();
				});

				it('decimal(0.1)', () => {
					H_VALIDATORS.decimal(k_factory.decimal(0.1), 0.1);
				});

				it('decimal(1.1)', () => {
					H_VALIDATORS.decimal(k_factory.decimal(1.1), 1.1);
				});

				it('decimal(-1.1)', () => {
					H_VALIDATORS.decimal(k_factory.decimal(-1.1), -1.1);
				});

				for(const s_sign of ['-', '+']) {
					['0', '1', '10', '0.', '1.', '0.1', '.0', '.1']
						.flatMap(s => [s, s_sign+s, '0'+s, s+'0', s_sign+'0'+s, s_sign+s+'0'])
						.forEach((s_mut) => {
							it(`decimal("${s_mut}")`, () => {
								H_VALIDATORS.decimal(k_factory.decimal(s_mut), s_mut);
							});
						});
				}

				// const h_forms = {/* eslint-disable quote-props */
				// 	'0': ['0', '0'],
				// 	'1': ['-1', '1'],
				// 	'10': ['-10', '10'],
				// 	'0.': ['0', '0'],
				// 	'1.': ['-1', '1'],
				// 	'0.1': ['-0.1', '0.1'],
				// 	'.0': ['0', '0'],
				// 	'.1': ['-0.1', '0.1'],
				// };/* eslint-enable quote-props */

				// 	for(const s_sign of ['-', '+']) {
				// 		const s_value = '-' === s_sign? s_value_neg: s_value_pos;
				// 		const a_muts = [s_input].flatMap(s => [s, s_sign+s, '0'+s, s+'0', s_sign+'0'+s, s_sign+s+'0']);
				// 		for(const s_mut of a_muts) {
				// 			it(`decimal("${s_mut}")`, () => {
				// 				H_VALIDATORS.decimal(k_factory.decimal(s_mut), s_value);
				// 			});
				// 		}
				// 	}
				// });

				it('decimal("0")', () => {
					H_VALIDATORS.decimal(k_factory.decimal('0'), '0');
				});

				it('decimal("1")', () => {
					H_VALIDATORS.decimal(k_factory.decimal('1'), '1');
				});

				it('decimal("-1")', () => {
					H_VALIDATORS.decimal(k_factory.decimal('-1'), '-1');
				});

				it('decimal("5.1")', () => {
					H_VALIDATORS.decimal(k_factory.decimal('5.1'), '5.1');
				});

				it('decimal("-5.1")', () => {
					H_VALIDATORS.decimal(k_factory.decimal('-5.1'), '-5.1');
				});

				it('decimal(""+Number.MAX_VALUE)', () => {
					expect(() => k_factory.decimal(''+Number.MAX_VALUE)).to.throw();
				});

				it('decimal(""+Number.MIN_VALUE)', () => {
					expect(() => k_factory.decimal(''+Number.MIN_VALUE)).to.throw();
				});


				it('decimal("")', () => {
					expect(() => k_factory.decimal()).to.throw();
				});

				it('decimal("never")', () => {
					expect(() => k_factory.decimal('never')).to.throw();
				});

				it('decimal()', () => {
					expect(() => k_factory.decimal()).to.throw();
				});

				it('decimal(null)', () => {
					expect(() => k_factory.decimal(null)).to.throw();
				});

				it('decimal({})', () => {
					expect(() => k_factory.decimal({})).to.throw();
				});

				it('decimal("Infinity")', () => {
					expect(() => k_factory.decimal('Infinity')).to.throw();
				});

				it('decimal("INF")', () => {
					expect(() => k_factory.decimal('INF')).to.throw();
				});

				it('decimal("-INF")', () => {
					expect(() => k_factory.decimal('-INF')).to.throw();
				});

				it('decimal("NaN")', () => {
					expect(() => k_factory.decimal('NaN')).to.throw();
				});

				const kt_literal = k_factory.decimal(5.1);
				const p_iri_datatype = `${P_IRI_XSD}decimal`;
				const h_prefixes = {
					xsd: P_IRI_XSD,
				};

				it('#concise()', () => {
					expect(kt_literal.concise()).to.equal(`^>${p_iri_datatype}"5.1`);
				});

				it('#concise({})', () => {
					expect(kt_literal.concise({})).to.equal(`^>${p_iri_datatype}"5.1`);
				});

				it('#concise(h_prefixes)', () => {
					expect(kt_literal.concise(h_prefixes)).to.equal(`^xsd:decimal"5.1`);
				});

				it('#terse()', () => {
					expect(kt_literal.terse()).to.equal(`5.1`);
				});

				it('#terse({})', () => {
					expect(kt_literal.terse({})).to.equal(`5.1`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kt_literal.terse(h_prefixes)).to.equal(`5.1`);
				});

				it('#star()', () => {
					expect(kt_literal.star()).to.equal(`5.1`);
				});

				it('#star({})', () => {
					expect(kt_literal.star({})).to.equal(`5.1`);
				});

				it('#star(h_prefixes)', () => {
					expect(kt_literal.star(h_prefixes)).to.equal(`5.1`);
				});

				it('#verbose()', () => {
					expect(kt_literal.verbose()).to.equal(`"5.1"^^<${p_iri_datatype}>`);
				});

				it('#isolate()', () => {
					expect(kt_literal.isolate()).to.eql({
						termType: 'Literal',
						value: '5.1',
						language: '',
						datatype: {
							termType: 'NamedNode',
							value: P_IRI_XSD+'decimal',
						},
					});
				});

				it('#hash()', () => {
					expect(kt_literal.hash()).to.equal(hash(`^>${p_iri_datatype}"5.1`));
				});

				it('keeps precision', () => {
					expect(kt_literal).to.include({
						isNumberPrecise: true,
					});
				});

				it('keeps precision: normalized leading zeroes', () => {
					expect(k_factory.decimal('000.1')).to.include({
						isNumberPrecise: true,
					});
					expect(k_factory.decimal('-000.1')).to.include({
						isNumberPrecise: true,
					});
				});

				it('keeps precision: normalized leading decimal', () => {
					expect(k_factory.decimal('.1')).to.include({
						isNumberPrecise: true,
					});
					expect(k_factory.decimal('-.1')).to.include({
						isNumberPrecise: true,
					});
				});

				it('keeps precision: normalized leading and trailing zeroes', () => {
					const s_decimal = '0'.repeat(50)+'0.1'+'0'.repeat(50);
					expect(k_factory.decimal(s_decimal)).to.include({
						isNumberPrecise: true,
					});
					expect(k_factory.decimal('-'+s_decimal)).to.include({
						isNumberPrecise: true,
					});
				});

				it('loses precision: normalized', () => {
					const s_decimal = '0.'+'1'.repeat(18);
					expect(k_factory.decimal(s_decimal)).to.include({
						isNumberPrecise: false,
					});
					expect(k_factory.decimal('-'+s_decimal)).to.include({
						isNumberPrecise: false,
					});
				});

				it('loses precision: non-normalized leading zeroes', () => {
					const s_decimal = '000.'+'1'.repeat(18);
					expect(k_factory.decimal(s_decimal)).to.include({
						isNumberPrecise: false,
					});
					expect(k_factory.decimal('-'+s_decimal)).to.include({
						isNumberPrecise: false,
					});
				});

				it('loses precision: non-normalized leading and trailing zeroes', () => {
					const s_decimal = '0'.repeat(50)+'.'+'1'.repeat(18)+'0'.repeat(50);
					expect(k_factory.decimal(s_decimal)).to.include({
						isNumberPrecise: false,
					});
					expect(k_factory.decimal('-'+s_decimal)).to.include({
						isNumberPrecise: false,
					});
				});

				it('loses precision: non-normalized leading decimal', () => {
					const s_decimal = '.'+'1'.repeat(18);
					expect(k_factory.decimal(s_decimal)).to.include({
						isNumberPrecise: false,
					});
					expect(k_factory.decimal('-'+s_decimal)).to.include({
						isNumberPrecise: false,
					});
				});

				it('keeps precision: normalized leading and trailing zeroes', () => {
					const s_decimal = '0'.repeat(50)+'0.1'+'0'.repeat(50);
					expect(k_factory.decimal(s_decimal)).to.include({
						isNumberPrecise: true,
					});
					expect(k_factory.decimal('-'+s_decimal)).to.include({
						isNumberPrecise: true,
					});
				});
			});

			describe('Quad w/o explicit graph', () => {
				const p_iri_tests = 'https://graphy.link/tests#';
				const kt_datatype = k_factory.namedNode(p_iri_tests+'datatype');
				const h_prefixes = {
					tests: p_iri_tests,
				};
				const kt_subject = k_factory.blankNode('subject');
				const kt_predicate = k_factory.namedNode(p_iri_tests+'predicate');
				const kt_object = k_factory.literal('value', kt_datatype);
				const kq_quad = k_factory.quad(kt_subject, kt_predicate, kt_object);

				it('#equals(this)', () => {
					expect(kq_quad.equals(kq_quad)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kq_quad.equals(k_factory.quad(...[
						k_factory.blankNode('subject'),
						k_factory.namedNode(p_iri_tests+'predicate'),
						k_factory.literal('value', kt_datatype),
					]))).to.be.true;
				});

				it('#equals(isolate)', () => {
					expect(kq_quad.equals(kq_quad.isolate())).to.be.true;
				});

				it('#equals(similar)', () => {
					expect(kq_quad.equals({
						termType: 'Quad',
						value: '',
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

				it('#concise()', () => {
					expect(kq_quad.concise()).to.eql(
						'*'
						+'\t_:subject'
						+'\r>'+p_iri_tests+'predicate'
						+`\n^>${p_iri_tests}datatype"value`
					);
				});

				it('#concise(h_prefixes)', () => {
					expect(kq_quad.concise(h_prefixes)).to.eql(
						'*'
						+'\t_:subject'
						+'\rtests:predicate'
						+`\n^tests:datatype"value`
					);
				});

				it('#terse()', () => {
					expect(kq_quad.terse()).to.equal(`_:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> .`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kq_quad.terse(h_prefixes)).to.equal(`_:subject tests:predicate "value"^^tests:datatype .`);
				});

				it('#star()', () => {
					expect(kq_quad.star()).to.equal(`<< _:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> >>`);
				});

				it('#star(h_prefixes)', () => {
					expect(kq_quad.star(h_prefixes)).to.equal(`<< _:subject tests:predicate "value"^^tests:datatype >>`);
				});

				it('#verbose()', () => {
					expect(kq_quad.verbose()).to.equal(`_:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> .`);
				});

				it('#isolate()', () => {
					expect(kq_quad.isolate()).to.eql({
						termType: 'Quad',
						value: '',
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
			});

			describe('Quad w/ graph', () => {
				const p_iri_tests = 'https://graphy.link/tests#';
				const kt_datatype = k_factory.namedNode(p_iri_tests+'datatype');
				const h_prefixes = {
					tests: p_iri_tests,
				};
				const kt_subject = k_factory.blankNode('subject');
				const kt_predicate = k_factory.namedNode(p_iri_tests+'predicate');
				const kt_object = k_factory.literal('value', kt_datatype);
				const kt_graph = k_factory.namedNode(p_iri_tests+'graph');
				const kq_quad = k_factory.quad(kt_subject, kt_predicate, kt_object, kt_graph);

				it('#equals(this)', () => {
					expect(kq_quad.equals(kq_quad)).to.be.true;
				});

				it('#equals(other)', () => {
					expect(kq_quad.equals(k_factory.quad(...[
						k_factory.blankNode('subject'),
						k_factory.namedNode(p_iri_tests+'predicate'),
						k_factory.literal('value', kt_datatype),
						k_factory.namedNode(p_iri_tests+'graph'),
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

				it('#concise()', () => {
					expect(kq_quad.concise()).to.eql(
						'>'+p_iri_tests+'graph'
						+'\t_:subject'
						+'\r>'+p_iri_tests+'predicate'
						+`\n^>${p_iri_tests}datatype"value`
					);
				});

				it('#concise(h_prefixes)', () => {
					expect(kq_quad.concise(h_prefixes)).to.eql(
						'tests:graph'
						+'\t_:subject'
						+'\rtests:predicate'
						+`\n^tests:datatype"value`
					);
				});

				it('#terse()', () => {
					expect(kq_quad.terse()).to.equal(`<${p_iri_tests}graph> { _:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> . }`);
				});

				it('#terse(h_prefixes)', () => {
					expect(kq_quad.terse(h_prefixes)).to.equal(`tests:graph { _:subject tests:predicate "value"^^tests:datatype . }`);
				});

				it('#star()', () => {
					expect(kq_quad.star()).to.equal(`<< _:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> <${p_iri_tests}graph> >>`);
				});

				it('#star(h_prefixes)', () => {
					expect(kq_quad.star(h_prefixes)).to.equal(`<< _:subject tests:predicate "value"^^tests:datatype tests:graph >>`);
				});

				it('#verbose()', () => {
					expect(kq_quad.verbose()).to.equal(`_:subject <${p_iri_tests}predicate> "value"^^<${p_iri_tests}datatype> <${p_iri_tests}graph> .`);
				});

				it('#isolate()', () => {
					expect(kq_quad.isolate()).to.eql({
						termType: 'Quad',
						value: '',
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
			});
		});

		describe('setBaseIri', () => {
			it('returns ref', () => {
				const h_prefixes = {};
				const h_returned = k_factory.setBaseIri(h_prefixes, 'z://base/');
				expect(h_returned).to.equal(h_prefixes);
			});

			it('has accessible cache key {#}', () => {
				const h_returned = k_factory.setBaseIri({}, 'z://base/');
				expect(h_returned).to.have.property(k_factory.SI_PREFIX_BASE);
			});

			it('requires absolute IRI', () => {
				expect(() => k_factory.setBaseIri({}, '//relative/')).to.throw();
			});
		});

		describe('cachePrefixes', () => {
			it('returns frozen ref {}', () => {
				const h_prefixes = {};
				const h_returned = k_factory.cachePrefixes(h_prefixes);
				expect(h_returned).to.equal(h_prefixes);
				expect(h_returned).to.be.frozen;
			});

			it('returns frozen ref {#}', () => {
				const h_prefixes = {a:'z://'};
				const h_returned = k_factory.cachePrefixes(h_prefixes);
				expect(h_returned).to.equal(h_prefixes);
				expect(h_returned).to.be.frozen;
			});

			it('has accessible cache key {#}', () => {
				const h_returned = k_factory.cachePrefixes({a:'z://'});
				expect(h_returned).to.have.property(k_factory.SI_PREFIX_CACHE);
			});

			it('use longest prefix', () => {
				const h_prefixes = k_factory.cachePrefixes({
					short: 'z://auth/',
					long: 'z://auth/path/full/',
					med: 'z://auth/path/',
				}, true);

				const kt_node = k_factory.namedNode('z://auth/path/full/node');
				expect(kt_node.terse(h_prefixes)).to.equal('long:node');
			});

			it('avoids invalid namespace', () => {
				const h_prefixes = k_factory.cachePrefixes({
					'#invalid': 'z://y/',
				}, true);

				const kt_node = k_factory.namedNode('z://y/test');
				expect(kt_node.terse(h_prefixes)).to.equal('<z://y/test>');
			});
		});

		describe('terse', () => {

		});

		describe('concise', () => {
			it('uses cache', () => {
				const h_cache = k_factory.cachePrefixes({
					good: 'z://y/',
				});
				const sc1_test = k_factory.concise('z://y/test', h_cache);
				expect(sc1_test).to.equal('good:test');
			});
		});

		describe('RDFJS', () => {
			const d_warn = console.warn;

			// capture warn messages
			console.warn = (s_warn) => {
				// silence
				if(/^\s*Warning:/.test(s_warn)) return;

				// otherwise echo
				d_warn.apply(console, [s_warn]);
			};

			// RDFJS Data Model test suite
			// the data test suite is currently in disagreement over falsy Term values and the graph component of `Triple`
			rdfjsDataModelTester(k_factory);
		});
	}
}
