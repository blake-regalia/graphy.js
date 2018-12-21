const fs = require('fs');
const path = require('path');
const stream = require('stream');
const url = require('url');
const expect = require('chai').expect;

const S_CHANNEL = process.env.GRAPHY_CHANNEL || 'graphy';
const ttl_read = require(`@${S_CHANNEL}/content.ttl.read`);
const nt_read = require(`@${S_CHANNEL}/content.nt.read`);
const nq_read = require(`@${S_CHANNEL}/content.nq.read`);
const factory = require(`@${S_CHANNEL}/core.data.factory`);
const dataset_tree = require(`@${S_CHANNEL}/util.dataset.tree`);

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
const A_TEST_TYPES_EVAL_POSITIVE = [
	'rdft:TestTurtleEval',  // turtle
	'rdft:TestTrigEval',  // trig
].map(expand);

// negative eval
const A_TEST_TYPES_EVAL_NEGATIVE = [
	'rdft:TestTurtleNegativeEval',  // turtle
	'rdft:TestTrigNegativeEval',  // trig
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

class TestCase {
	constructor(gc_test) {
		Object.assign(this, {
			...gc_test,
		});
	}

	run() {
		let s_input = fs.readFileSync(this.action, 'utf8');

		it(this.name+'; input:stream', (fke_test) => {
			this.reader({
				input: {stream:fs.createReadStream(this.action)},
				base_uri: this.base,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:string', (fke_test) => {
			this.reader({
				input: {string:s_input},
				base_uri: this.base,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:none', (fke_test) => {
			fs.createReadStream(this.action).pipe(this.reader({
				base_uri: this.base,
				...this.config(fke_test),
			}));
		});
	}
}

class TestCase_Positive extends TestCase {
	run() {
		let s_input = fs.readFileSync(this.action, 'utf8');

		it(this.name+'; input:stream; validate=true', (fke_test) => {
			this.reader({
				input: {stream:fs.createReadStream(this.action)},
				base_uri: this.base,
				validate: true,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:stream; validate=false', (fke_test) => {
			this.reader({
				input: {stream:fs.createReadStream(this.action)},
				base_uri: this.base,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:string; validate=true', (fke_test) => {
			this.reader({
				input: {string:s_input},
				base_uri: this.base,
				validate: true,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:string; validate=false', (fke_test) => {
			this.reader({
				input: {string:s_input},
				base_uri: this.base,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:none; validate=true', (fke_test) => {
			fs.createReadStream(this.action).pipe(this.reader({
				base_uri: this.base,
				...this.config(fke_test),
			}));
		});

		it(this.name+'; input:none; validate=false', (fke_test) => {
			fs.createReadStream(this.action).pipe(this.reader({
				base_uri: this.base,
				...this.config(fke_test),
			}));
		});
	}
}

class TestCase_EvalPositive extends TestCase_Positive {
	config(fke_test) {
		let k_test = this;

		// actual quads emitted
		let k_tree_actual = dataset_tree();

		return {
			// collect data events
			data(g_quad) {
				k_tree_actual.add(g_quad);
			},

			// an error is a failure
			error(e_read) {
				debugger;
				fke_test(new Error(`failed to evaluate: "${k_test.name}"\n\n${e_read}`));
			},

			// done reading
			end() {
				let k_tree_expected = dataset_tree();

				// read expected
				(k_test.result.endsWith('.nq')? nq_read: nt_read)({
					input: {stream:fs.createReadStream(k_test.result)},

					// build expected
					data(g_quad) {
						k_tree_expected.add(g_quad);
					},

					// failure reading expected
					error(e_read) {
						debugger;
						fke_test(new Error(`failed to read expected evaluation result: "${k_test.name}"\n\n${e_read}`));
					},

					// ready to compare
					end() {
						// expected matches actual; all good
						if(k_tree_actual.equals(k_tree_expected)) {
							fke_test();
						}
						// mismatch; clarify
						else {
							let k_actual_missing = k_tree_expected.minus(k_tree_actual);
							let k_actual_misplaced = k_tree_actual.minus(k_tree_expected);

							let s_error = '';
							if(k_actual_missing.count()) {
								s_error += `actual quad set missing:\n${k_actual_missing.canonicalize()}`;
							}
							if(k_actual_misplaced.count()) {
								s_error += `\nactual quad set has quads that don't belong:\n${k_actual_misplaced.canonicalize()}`;
							}

							debugger;
							fke_test(new Error(s_error));
						}
					},
				});
			},
		};
	}
}

class TestCase_Negative extends TestCase {
	config(fke_test) {
		let k_test = this;

		return {
			// enable validation for these tests
			validate: true,

			// ignore data events
			data() {},

			// an error is expected
			error(e_read) {
				expect(e_read).to.be.an('error');
				fke_test();
			},

			// error not caught
			end() {
				debugger;
				fke_test(new Error(`failed to invalidate: "${k_test.name}"`));
			},
		};
	}
}

class TestCase_SyntaxPositive extends TestCase_Positive {
	config(fke_test) {
		let k_test = this;

		return {
			// ignore data events
			data() {},

			// an error is a failure
			error(e_read) {
				debugger;
				fke_test(new Error(`failed to accept: "${k_test.name}"\n\n${e_read}`));
			},

			// successfully finished
			end() {
				fke_test();
			},
		};
	}
}

// mappings [#string/iri type] => class<TestCase>
const HV1_TEST_TYPES = {
	...A_TEST_TYPES_EVAL_POSITIVE.reduce((h_out, p_type) => ({
		...h_out,
		['>'+p_type]: TestCase_EvalPositive,
	}), {}),

	...A_TEST_TYPES_EVAL_NEGATIVE.reduce((h_out, p_type) => ({
		...h_out,
		['>'+p_type]: TestCase_Negative,
	}), {}),

	...A_TEST_TYPES_SYNTAX_NEGATIVE.reduce((h_out, p_type) => ({
		...h_out,
		['>'+p_type]: TestCase_Negative,
	}), {}),

	...A_TEST_TYPES_SYNTAX_POSITIVE.reduce((h_out, p_type) => ({
		...h_out,
		['>'+p_type]: TestCase_SyntaxPositive,
	}), {}),
};

let pd_root = path.resolve(__dirname, '../../');

const collection = (sv1_head, k_tree, a_collection=[]) => {
	let sv1_rest;

	for(let [sv1_predicate, as_objects] of k_tree.pairs('*', sv1_head)) {
		let sv1_object = [...as_objects][0];
		if(sv1_predicate.endsWith('#first')) {
			a_collection.push(sv1_object);
		}
		else if(sv1_predicate.endsWith('#rest')) {
			sv1_rest = sv1_object;
		}
	}

	if('>http://www.w3.org/1999/02/22-rdf-syntax-ns#nil' !== sv1_rest) {
		return collection(sv1_rest, k_tree, a_collection);
	}
	else {
		return a_collection;
	}
};


module.exports = (gc_tests={}) => new Promise((fk_describe) => {
	let {
		reader: f_reader,
		package: si_package,
		manifest: p_manifest_source,
	} = gc_tests;

	let p_manifest = path.join(pd_root, 'build', S_CHANNEL, 'test/cache', si_package, 'manifest.ttl');
	let p_iri_manifest = url.pathToFileURL(p_manifest);

	let k_tree = dataset_tree();
	stream.pipeline(...[
		fs.createReadStream(p_manifest),

		ttl_read({
			base_uri: p_iri_manifest,
		}),

		k_tree,

		(e_pipeline) => {
			if(e_pipeline) throw e_pipeline;

			let sv1_head = [...k_tree.objects('*', '>'+p_iri_manifest, '>'+H_PREFIXES.mf+'entries', null)][0];

			let a_entries = collection(sv1_head, k_tree);

			let hv3_triples = k_tree.quad_tree['*'];

			let as_empty = new Set();
			describe('w3c rdf specification manifest', () => {
				for(let sv1_entry of a_entries) {
					let {
						['>'+H_PREFIXES.rdf+'type']: as_types=as_empty,
						['>'+H_PREFIXES.mf+'name']: as_names=as_empty,
						['>'+H_PREFIXES.mf+'action']: as_actions=as_empty,
						['>'+H_PREFIXES.mf+'result']: as_results=as_empty,
					} = hv3_triples[sv1_entry];

					let sv1_type = [...as_types][0];
					let s_name = [...as_names][0].slice(1);
					let p_action = url.fileURLToPath([...as_actions][0].slice(1));

					// no route
					if(!(sv1_type in HV1_TEST_TYPES)) {
						debugger;
						throw new Error(`no such test type: ${sv1_type}`);
					}

					// route
					let k_test_case = new HV1_TEST_TYPES[sv1_type]({
						reader: f_reader,
						name: s_name,
						action: p_action,
						result: as_results.size? url.fileURLToPath([...as_results][0].slice(1)): null,
						base: p_manifest_source.replace(/\/[^/]+$/, '/'+path.basename(p_action)),
					});

					// run
					k_test_case.run();
				}
			});

			fk_describe();
		},
	]);
});
