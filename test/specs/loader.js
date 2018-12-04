const assert = require('assert');
const async = require('async');

const request = require('request');
const chalk = require('chalk');

let s_channel = process.env.GRAPHY_CHANNEL || 'graphy';
const graphy = require(s_channel);
const factory = require(`@${s_channel}/api.data.factory`);
const quad_tree = require(`@${s_channel}/api.data.set`);
const nt_read = require(`@${s_channel}/content.nt.read`);
const ttl_read = require(`@${s_channel}/content.ttl.read`);
const ttl_write = require(`@${s_channel}/content.ttl.write`);

const H_AUTHORS = {
	'>http://blake-regalia.com/#me': {
		a: ['foaf:Person', 'earl:Assertor'],
		'foaf:name': '"Blake Regalia',
		'foaf:email': '"blake.regalia@gmail.com',
		'foaf:homepage': '>http://blake-regalia.com/',
	},
};

// prefixes
const H_PREFIXES = {
	rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
	rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
	rdft: 'http://www.w3.org/ns/rdftest#',
	dc: 'http://purl.org/dc/terms/',
	doap: 'http://usefulinc.com/ns/doap#',
	earl: 'http://www.w3.org/ns/earl#',
	foaf: 'http://xmlns.com/foaf/0.1/',
	xsd: 'http://www.w3.org/2001/XMLSchema#',
	mf: 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#',
};

const expand = sc1 => factory.c1(sc1, H_PREFIXES).value;

// eval
const A_TEST_TYPES_EVAL = [
	'rdft:TestTurtleEval',  // turtle
	'rdft:TestTrigEval',  // trig
].map(expand);

// negative syntax
const A_TEST_TYPES_SYNTAX_NEGATIVE = [
	'rdft:TestNTriplesNegativeSyntax',  // n-triples
	'rdft:TestNQuadsNegativeSyntax',  // n-quads
	'rdft:TestTurtleNegativeSyntax',  // turtle
	'rdft:TestTrigNegativeSyntax',  // trig
].map(expand);

// positive syntax
const A_TEST_TYPES_SYNTAX_POSITIVE = [
	'rdft:TestNTriplesPositiveSyntax',  // n-triples
	'rdft:TestNQuadsPositiveSyntax',  // n-quads
	'rdft:TestTurtlePositiveSyntax',  // turtle
	'rdft:TestTrigPositiveSyntax',  // trig
].map(expand);

// accepted test types
const A_TEST_TYPES_ACCEPTED = [
	...A_TEST_TYPES_EVAL,
	...A_TEST_TYPES_SYNTAX_NEGATIVE,
	...A_TEST_TYPES_SYNTAX_POSITIVE,
];

// graphy iri
const P_GRAPHY = 'https://github.com/blake-regalia/graphy.js#graphy-js';

// struct: result from assertion
class AssertionResult {
	constructor(s_actual, s_expected) {
		Object.assign(this, {
			actual: s_actual,
			expected: s_expected,
		});
	}
}

// test case
class TestCase {
	constructor(p_manifest, pm_format, h_row) {
		Object.assign(this, h_row, {
			manifest: p_manifest,
			format: pm_format,
		});
	}

	// run this test case
	run() {
		return new Promise(async(fk_test, fe_test) => {
			// determine how to handle events from parser given test type
			let h_test_type;
			let p_test_type = this.type.value;
			if(p_test_type.endsWith('Eval')) {
				// eval type must have a result
				if(!this.result) throw new Error(`test case "${this.id.value}" is missing an mf:result`);

				h_test_type = this.eval(fk_test, fe_test);
			}
			else if(p_test_type.endsWith('PositiveSyntax')) {
				h_test_type = await TestCase.syntax_positive(this, fk_test, fe_test);
			}
			else if(p_test_type.endsWith('NegativeSyntax')) {
				h_test_type = await TestCase.syntax_negative(this, fk_test, fe_test);
			}
			else {
				throw new Error(`unknown test type: "${p_test_type}"`);
			}

			// fetch test action
			request(this.action.value)
				// pipe to deserializer
				.pipe(graphy.content(this.format).read(h_test_type));
		});
	}

	// for evaluation types
	eval(fk_eval, fe_eval) {
		// create two new sets to compare actual result with expected result
		let k_set_actual = quad_tree();
		let k_set_expected = quad_tree();

		// wait for expected value to be ready
		let dp_expected = new Promise((fk_expected, fe_expected) => {
			// fetch result file
			request(this.result.value)
				// network error
				.on('error', (e_req) => {
					fe_expected(new Error(`fatal network error: ${e_req.message}\n${e_req.stack}`));
				})

				// http response
				.on('response', (d_res) => {
					// not OK response
					if(200 !== d_res.statusCode) {
						fe_expected(new Error(`${d_res.statusCode} HTTP error: ${d_res.body}`));
					}
				})

				// parse result as N-Triples
				.pipe(nt_read({
					// each triple in result file
					data(h_triple) {
						// add to expected set
						k_set_expected.add(h_triple);
					},

					// ready for evaluation
					end() {
						// save canonicalized set result
						fk_expected(k_set_expected.canonicalize());
					},
				}));
		});

		// serializer config
		return {
			// default base is given by url of file
			// base_uri: `${this.manifest}${this.id.value.slice(1)}.ttl`,
			base_uri: this.id.value,

			// each triple in test file
			data(h_triple) {
				// add to actual set
				k_set_actual.add(h_triple);
			},

			// there was an error while parsing
			error(e_parse) {
				fe_eval(e_parse);
			},

			// once input is successfully consumed
			end() {
				// save result
				let s_actual = k_set_actual.canonicalize();

				// resolve with test action
				dp_expected.then((s_expected) => {
					try {
						assert.equal(s_actual, s_expected);
						fk_eval();
					}
					catch(e_assert) {
						fe_eval(new AssertionResult(s_actual, s_expected));
					}
				}).catch((e_expected) => {
					throw new Error(e_expected);
				});
			},
		};
	}

	// for positive syntax types
	static syntax_positive(k_test, fk_syntax, fe_syntax) {
		return {
			// ignore data events
			data() {},

			// an error is a failure
			error(e_parse) {
				fe_syntax(new Error(`failed to accept: "${k_test.comment.value}"\n\n${e_parse}`));
			},

			// successfully finished
			end() {
				fk_syntax();
			},
		};
	}

	// for negative syntax types
	static syntax_negative(k_test, fk_syntax, fe_syntax) {
		return {
			// enable validation for these tests
			validate: true,

			// ignore data events
			data() {},

			// an error is expected
			error(e_parse) {
				fk_syntax(e_parse);
			},

			// error not caught
			end() {
				fe_syntax(new Error(`failed to invalidate: "${k_test.comment.value}"`));
			},
		};
	}
}


// run test on given manifest and pipe to given output stream
module.exports = async function test({
	manifest: p_manifest,
	mime: pm_format,
	output: ds_output,
}) {
	// create report
	let kw_report = ttl_write({
		// user-defined prefixes
		prefixes: H_PREFIXES,
	});

	// pipe to output
	kw_report.pipe(ds_output);

	// commit software info
	await kw_report.add({
		['>'+P_GRAPHY]: {
			a: ['earl:Software', 'earl:TestSubject', 'earl:Project'],
			'doap:name': '"graphy.js',
			'doap:homepage': '>'+P_GRAPHY,
			'dc:title': '"graphy.js',
		},
	});

	// commit author info
	await kw_report.add(H_AUTHORS);

	// for committing each test outcome
	let commit_outcome = async(k_test_case, s_outcome) => {
		await kw_report.add({
			[factory.comment()]: 'This RDF file was programtically generated using graphy.js: https://github.com/blake-regalia/graphy.js',
			['>'+k_test_case.id.value]: {
				a: ['earl:TestCriterion', 'earl:TestCase'],
				'dc:title': k_test_case.name,
				'dc:description': k_test_case.comment,
				'mf:action': k_test_case.action,
				...(k_test_case.result? {'mf:result':k_test_case.result}: {}),
				'earl:assertions': [
					[ // an rdf collection
						{
							'rdf:type': 'earl:Assertion',
							'earl:assertedBy': Object.keys(H_AUTHORS),
							'earl:test': k_test_case.id,
							'earl:subject': '>'+P_GRAPHY,
							'earl:mode': 'earl:automatic',
							'earl:result': {
								a: 'earl:TestResult',
								'earl:outcome': 'earl:'+s_outcome,
								'dc:date': new Date(),
							},
						},
					],
				],
			},
		});
	};

	const P_PATH = 'https://www.w3.org/2013/TurtleTests/';

	const P_IRI_MF = 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#';
	const P_IRI_MF_ACTION = P_IRI_MF+'action';
	const P_IRI_MF_RESULT = P_IRI_MF+'result';

	const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
	const P_IRI_RDF_TYPE = P_IRI_RDF+'type';

	const P_IRI_RDFS = 'http://www.w3.org/2000/01/rdf-schema#';
	const P_IRI_RDFS_LABEL = P_IRI_RDFS;

	const P_IRI_RDFT = 'http://www.w3.org/ns/rdftest#';
	const P_IRI_RDFT_TEST_TURTLE_EVAL = P_IRI_RDFT+'TestTurtleEval';
	const P_IRI_RDFT_TEST_TURTLE_POSITIVE_SYNTAX = P_IRI_RDFT+'TestTurtlePositiveSyntax';
	const P_IRI_RDFT_TEST_TURTLE_NEGATIVE_SYNTAX = P_IRI_RDFT+'TestTurtleNegativeSyntax';

	const h_tests = {};
	const h_results = {};
	const h_answers = {};

	let a_test_cases = [];

	const yq_tests = async.queue(function(h_task, f_okay) {
		let s_test_id = h_task.data.subject.value;
		request(P_PATH+h_task.data.object.value)
			.pipe(h_task.pipe(s_test_id))
			.on('finish', () => {
				f_okay();
			})
			.on('error', (e_parse) => {
				h_results[s_test_id] = null;
			});
	}, 12);

	// tree of quads
	let y_tree = quad_tree({
		prefixes: H_PREFIXES,
	});

	// fetch manifest file
	request(p_manifest)
		// deserialize
		.pipe(ttl_read({
			// base is resource url
			base_uri: p_manifest,

			// data events
			data(y_quad) {
				let {
					subject: g_subject,
					predicate: g_predicate,
					object: g_object,
				} = y_quad;

				// ref parts
				let p_subject = g_subject.value;
				let p_predicate = g_predicate.value;
				let p_object = g_object.value;

				// rdf:type
				if(P_IRI_RDF_TYPE === p_predicate) {
					// negative syntax
					if(A_TEST_TYPES_SYNTAX_NEGATIVE.includes(p_object)) {
						a_test_cases.push({
							type: g_object,
							subject: g_subject.concise(),
						});
					}
					// positive syntax
					else if(A_TEST_TYPES_SYNTAX_POSITIVE.includes(p_object)) {
						a_test_cases.push({
							type: g_object,
							subject: g_subject.concise(),
						});
					}
					// eval
					else if(A_TEST_TYPES_EVAL.includes(p_object)) {
						a_test_cases.push({
							type: g_object,
							subject: g_subject.concise(),
						});
					}
				}

				// add triple to set
				y_tree.add(y_quad);
			},

			// done
			async end() {
				for(let {type:yt_type, subject:sv1_subject} of a_test_cases) {
					let hc3_case = {};
					for(let [sv1_predicate, as_objects] of y_tree.pairs('*', sv1_subject)) {
						hc3_case[factory.c1(sv1_predicate).concise(H_PREFIXES)] = factory.c1([...as_objects][0]);
					}

					let {
						'mf:name': yt_name,
						'rdfs:comment': yt_comment,
						'mf:action': yt_action,
					} = hc3_case;

					// create test case instance
					let k_test_case = new TestCase(p_manifest, pm_format, {
						id: factory.c1(sv1_subject),
						type: yt_type,
						name: yt_name,
						comment: yt_comment,
						action: yt_action,
						result: hc3_case['mf:result'] || null,
					});

					// load test case
					try {
						await k_test_case.run();
					}
					catch(z_reason) {
						// case label
						let s_case = `${chalk.red('˟')} ${k_test_case.id.value}`;

						// actual vs. expected
						if(z_reason instanceof AssertionResult) {
							console.error(`${s_case}\n\t${chalk.red(z_reason.expected)}\n\t${chalk.green(z_reason.actual)}`);
						}
						// error message
						else {
							console.error(`${s_case}\n\t${chalk.red(z_reason)}`);
						}

						// write to report
						await commit_outcome(k_test_case, 'failed');

						// next test case
						continue;
					}

					// log success to console
					console.log(`${chalk.green('✓')} ${k_test_case.id.value}`);

					// write to report
					await commit_outcome(k_test_case, 'passed');
				}

				// all done!
				kw_report.end();
			},
		}));

		// // pipe into a new store
		// .pipe(graphy.store.memory.create({
		// 	// user-defined prefixes
		// 	prefixes: H_PREFIXES,

		// 	// once store is ready
		// 	async ready(g) {
		// 		// extract test cases from manifest
		// 		let g_manifest = await g.pattern()
		// 			.subjects().outs({
		// 				a: 'mf:Manifest',
		// 				'rdfs:label': e => e.literal().bind('label'),
		// 				'mf:entries': e => e.collection().bind('test_cases'),
		// 				// 'mf:entries/rdf:rest*/rdf:first': e => e.objects().gather().bind('test_cases'),
		// 			})
		// 			.exit()
		// 			.row();

		// 		// each test case
		// 		for(let kt_test_case of g_manifest.test_cases) {
		// 			// fetch test case
		// 			let g_test_case = await g.pattern()
		// 				.subject(kt_test_case).bind('id').outs({
		// 					'rdft:approval': 'rdft:Approved',
		// 					'rdf:type': e => e.node(A_TEST_TYPES_ACCEPTED).bind('type'),
		// 					'mf:name': e => e.literal().bind('name'),
		// 					'rdfs:comment': e => e.literals().gather('comments')
		// 						.map(h => h.value.toLowerCase())
		// 						.save(),
		// 					'mf:action': e => e.node().bind('action'),
		// 					'mf:result?': e => e.node().bind('result'),
		// 				})
		// 				.exit()
		// 				.row();

		// 			// create test case instance
		// 			let k_test_case = new TestCase(p_manifest, pm_format, g_test_case);

		// 			// load test case
		// 			try {
		// 				await k_test_case.run();
		// 			}
		// 			catch(z_reason) {
		// 				// case label
		// 				let s_case = `${'˟'.red} ${k_test_case.id.value}`;

		// 				// actual vs. expected
		// 				if(z_reason instanceof AssertionResult) {
		// 					console.error(`${s_case}\n\t${z_reason.expected.red}\n\t${z_reason.actual.green}`);
		// 				}
		// 				// error message
		// 				else {
		// 					console.error(`${s_case}\n\t${z_reason.red}`);
		// 				}

		// 				// write to report
		// 				commit_outcome(k_test_case, 'failed');

		// 				// next test case
		// 				continue;
		// 			}

		// 			// log success to console
		// 			console.log(`${chalk.green('✓')} ${k_test_case.id.value}`);

		// 			// write to report
		// 			commit_outcome(k_test_case, 'passed');
		// 		}

		// 		// all done!
		// 		kw_report.end();
		// 	},
		// }));
};
