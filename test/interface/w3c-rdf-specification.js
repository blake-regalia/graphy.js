const fs = require('fs');
const path = require('path');
const url = require('url');
const expect = require('chai').expect;

const pathToFileURL = url.pathToFileURL || (p_path => `file://${p_path}`);
const fileURLToPath = url.fileURLToPath || (p_url => p_url.replace(/^file:\/\//, ''));

const ttl_read = require('@graphy-stable/content.ttl.read');
const nt_read = require('@graphy-stable/content.nt.read');
const nq_read = require('@graphy-stable/content.nq.read');
const trig_write = require('@graphy-stable/content.trig.write');
const factory = require('@graphy-stable/core.data.factory');
const dataset_tree = require('@graphy-stable/memory.dataset.fast');

const write_preview = () => trig_write({
	style: {
		simplify_default_graph: true,
	},
});

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

		it(this.name+'; input:stream; relax=false', (fke_test) => {
			this.reader({
				input: {stream:fs.createReadStream(this.action)},
				base_uri: this.base,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:stream; relax=true', (fke_test) => {
			this.reader({
				input: {stream:fs.createReadStream(this.action)},
				base_uri: this.base,
				relax: true,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:string; relax=false', (fke_test) => {
			this.reader({
				input: {string:s_input},
				base_uri: this.base,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:string; relax=true', (fke_test) => {
			this.reader({
				input: {string:s_input},
				base_uri: this.base,
				relax: true,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:none; relax=false', (fke_test) => {
			fs.createReadStream(this.action).pipe(this.reader({
				base_uri: this.base,
				...this.config(fke_test),
			}));
		});

		it(this.name+'; input:none; relax=true', (fke_test) => {
			fs.createReadStream(this.action).pipe(this.reader({
				base_uri: this.base,
				relax: true,
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
						setTimeout(async() => {
							k_tree_actual = k_tree_actual.canonicalize();
							k_tree_expected = k_tree_expected.canonicalize();

							// expected matches actual; all good
							if(k_tree_actual.equals(k_tree_expected)) {
								fke_test();
							}
							// mismatch; clarify
							else {
								debugger;
								let k_actual_missing = k_tree_expected.minus(k_tree_actual);
								let k_actual_misplaced = k_tree_actual.minus(k_tree_expected);
								let k_present = k_tree_actual.intersection(k_tree_expected);

								let s_error = '';

								if(k_tree_actual.size) {
									let st_actual = await k_tree_actual.end().pipe(write_preview()).bucket();
									s_error += `entire actual quad set:\n${st_actual}`;
								}

								if(k_present.size) {
									let st_present = await k_present.end().pipe(write_preview()).bucket();
									s_error += `actual quad set has that should be there:\n${st_present}`;
								}

								if(k_actual_missing.size) {
									let st_missing = await k_actual_missing.end().pipe(write_preview()).bucket();
									s_error += `actual quad set missing:\n${st_missing}`;
								}

								if(k_actual_misplaced.size) {
									let st_misplaced = await k_actual_misplaced.end().pipe(write_preview()).bucket();
									s_error += `\nactual quad set has quads that don't belong:\n${st_misplaced}`;
								}

								fke_test(new Error(s_error));
							}
						}, 0);
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
			// disable validation for these tests
			relax: true,

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


// deduce the runtime environment
const [B_BROWSER, B_BROWSERIFY] = (() => 'undefined' === typeof process
	? [true, false]
	: (process.browser
		? [true, true]
		: ('undefined' === process.versions || 'undefined' === process.versions.node
			? [true, false]
			: [false, false])))();

module.exports = async(gc_tests={}) => {
	let {
		reader: f_reader,
		package: si_package,
		manifest: p_manifest_source,
	} = gc_tests;

	let p_manifest = path.join(pd_root, 'build/cache/specs', si_package, 'manifest.ttl');
	let p_iri_manifest = pathToFileURL(p_manifest);

	// do not use fs in browser
	if(B_BROWSER) return;

	// pipeline for backwards-compat w/ < v10
	let k_tree = await fs.createReadStream(p_manifest)
		.pipe(ttl_read({
			base_uri: p_iri_manifest,
		}))
		.pipe(dataset_tree({
			error(e_pipeline) {
				throw e_pipeline;
			},
		}))
		.until('ready');

	let sv1_head = [...k_tree.c1_objects('*', '>'+p_iri_manifest, '>'+H_PREFIXES.mf+'entries', null)][0];

	let a_entries = collection(sv1_head, k_tree);

	let hv3_triples = k_tree._h_quad_tree['*'];

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
			let p_action = fileURLToPath([...as_actions][0].slice(1));

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
				result: as_results.size? fileURLToPath([...as_results][0].slice(1)): null,
				base: p_manifest_source.replace(/\/[^/]+$/, '/'+path.basename(p_action)),
			});

			// run
			k_test_case.run();
		}
	});
};
