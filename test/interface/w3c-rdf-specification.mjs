// deduce the runtime environment
const [B_BROWSER, B_BROWSERIFY] = (() => 'undefined' === typeof process
	? [true, false]
	: (process.browser
		? [true, true]
		: ('undefined' === process.versions || 'undefined' === process.versions.node
			? [true, false]
			: [false, false])))();

import fs from 'fs';
import path from 'path';
import url from 'url';
import {expect} from 'chai';
import { dirname } from 'path';

// const fs = require('fs');
// const path = require('path');
// const url = require('url');
// const expect = require('chai').expect;

const pathToFileURL = url.pathToFileURL || (p_path => `file://${p_path}`);
const fileURLToPath = url.fileURLToPath || (p_url => p_url.replace(/^file:\/\//, ''));


const __dirname = dirname(fileURLToPath(import.meta.url));

// const ttl_read = require('@graphy-stable/content.ttl.read');
// const nt_read = require('@graphy-stable/content.nt.read');
// const nq_read = require('@graphy-stable/content.nq.read');
// const trig_write = require('@graphy-stable/content.trig.write');
// const factory = require('@graphy-stable/core.data.factory');
// const dataset_tree = require('@graphy-stable/memory.dataset.fast');

import ttl_read from '@graphy-stable/content.ttl.read';
import nt_read from '@graphy-stable/content.nt.read';
import nq_read from '@graphy-stable/content.nq.read';
import trig_write from '@graphy-stable/content.trig.write';
import factory from '@graphy-stable/core.data.factory';

import {TurtleLoader} from '@graphy/content';

import {QuadTree} from '@graphy/memory';

const dataset_tree = (gc_tree) => {
	const k_tree = new QuadTree(gc_tree);
	return k_tree;
}

const write_preview = (h_prefixes={}) => trig_write({
	prefixes: h_prefixes || {},
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
];

// negative eval
const A_TEST_TYPES_EVAL_NEGATIVE = [
	'rdft:TestTurtleNegativeEval',  // turtle
	'rdft:TestTrigNegativeEval',  // trig
];

// negative syntax
const A_TEST_TYPES_SYNTAX_NEGATIVE = [
	'rdft:TestNTriplesNegativeSyntax',  // n-triples
	'rdft:TestNQuadsNegativeSyntax',  // n-quads
	'rdft:TestTurtleNegativeSyntax',  // turtle
	'rdft:TestTrigNegativeSyntax',  // trig
];

// positive syntax
const A_TEST_TYPES_SYNTAX_POSITIVE = [
	'rdft:TestNTriplesPositiveSyntax',  // n-triples
	'rdft:TestNQuadsPositiveSyntax',  // n-quads
	'rdft:TestTurtlePositiveSyntax',  // turtle
	'rdft:TestTrigPositiveSyntax',  // trig
];

class TestCase {
	constructor(gc_test) {
		this._f_reader = gc_test.reader;
		this._dc_reader = gc_test.reader_class;
		this._b_catch = false;

		Object.assign(this, {
			...gc_test,
		});
	}

	run() {
		const s_input = fs.readFileSync(this.action, 'utf8');

		it(this.name+`; input:stream [${this.action}]`, (fke_test) => {
			const dp_read = this._f_reader(fs.createReadStream(this.action), {
				baseIri: this.base,
				...this.config(fke_test),
			});

			if(this._b_catch) dp_read.catch(() => {});
		});

		it(this.name+`; input:string [${this.action}]`, (fke_test) => {
			const dp_read = this._f_reader(s_input, {
				baseIri: this.base,
				...this.config(fke_test),
			})

			if(this._b_catch) dp_read.catch(() => {});
		});

		it(this.name+`; input:none [${this.action}]`, (fke_test) => {
			fs.createReadStream(this.action).pipe(new this._dc_reader({
				baseIri: this.base,
				...this.config(fke_test),
			}));
		});
	}
}

class TestCase_Positive extends TestCase {
	run() {
		let s_input = fs.readFileSync(this.action, 'utf8');

		it(this.name+'; input:stream; tolerant=false', (fke_test) => {
			this._f_reader(fs.createReadStream(this.action), {
				baseIri: this.base,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:stream; tolerant=true', (fke_test) => {
			this._f_reader(fs.createReadStream(this.action), {
				baseIri: this.base,
				tolerant: true,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:string; tolerant=false', (fke_test) => {
			this._f_reader(s_input, {
				baseIri: this.base,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:string; tolerant=true', (fke_test) => {
			this._f_reader(s_input, {
				baseIri: this.base,
				tolerant: true,
				...this.config(fke_test),
			});
		});

		it(this.name+'; input:none; tolerant=false', (fke_test) => {
			fs.createReadStream(this.action).pipe(new this._dc_reader({
				baseIri: this.base,
				...this.config(fke_test),
			}));
		});

		it(this.name+'; input:none; tolerant=true', (fke_test) => {
			fs.createReadStream(this.action).pipe(new this._dc_reader({
				baseIri: this.base,
				tolerant: true,
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
		// let k_tree_act = new QuadTree();

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
			eof() {
				let k_tree_expected = dataset_tree();

				// read expected
				(k_test.result.endsWith('.nq')? nq_read: nt_read)(fs.createReadStream(k_test.result), {
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
					eof() {
						setTimeout(async() => {
							k_tree_actual = k_tree_actual.canonicalize();
							k_tree_expected = k_tree_expected.canonicalize();

							// expected matches actual; all good
							if(k_tree_actual.equals(k_tree_expected)) {
								fke_test();
							}
							// mismatch; clarify
							else {
								let k_actual_missing = k_tree_expected.minus(k_tree_actual);
								let k_actual_misplaced = k_tree_actual.minus(k_tree_expected);
								let k_present = k_tree_actual.intersection(k_tree_expected);

								let s_error = '';

								if(k_tree_actual.size) {
									const ds_writer = write_preview(k_tree_actual.prefixes);
									const st_actual = await ds_writer.end({
										type: 'c4',
										value: k_tree_actual._hc4_quads,
									}).bucket();
									s_error += `entire actual quad set:\n${st_actual}`;
								}

								if(k_present.size) {
									const ds_writer = write_preview(k_present.prefixes);
									const st_present = await ds_writer.end({
										type: 'c4',
										value: k_present._hc4_quads,
									}).bucket();
									s_error += `actual quad set has that should be there:\n${st_present}`;
								}

								if(k_actual_missing.size) {
									const ds_writer = write_preview(k_actual_missing.prefixes);
									const st_missing = await ds_writer.end({
										type: 'c4',
										value: k_actual_missing._hc4_quads,
									}).bucket();
									s_error += `actual quad set missing:\n${st_missing}`;
								}

								if(k_actual_misplaced.size) {
									const ds_writer = write_preview(k_actual_misplaced.prefixes);
									const st_misplaced = await ds_writer.end({
										type: 'c4',
										value: k_actual_misplaced._hc4_quads,
									}).bucket();
									s_error += `\nactual quad set has quads that don't belong:\n${st_misplaced}`;
								}

								debugger;
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
		this._b_catch = true;

		return {
			// ignore data events
			data() {},

			// an error is expected
			error(e_read) {
				expect(e_read).to.be.an('error');
				fke_test();
			},

			// error not caught
			eof() {
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
			tolerant: true,

			// ignore data events
			data() {},

			// an error is a failure
			error(e_read) {
				debugger;
				fke_test(new Error(`failed to accept: "${k_test.name}"\n\n${e_read}`));
			},

			// successfully finished
			eof() {
				fke_test();
			},
		};
	}
}

// mappings [#string/iri type] => class<TestCase>
const HC1_TEST_TYPES = {
	...A_TEST_TYPES_EVAL_POSITIVE.reduce((h_out, sc1_type) => ({
		...h_out,
		[sc1_type]: TestCase_EvalPositive,
	}), {}),

	...A_TEST_TYPES_EVAL_NEGATIVE.reduce((h_out, sc1_type) => ({
		...h_out,
		[sc1_type]: TestCase_Negative,
	}), {}),

	...A_TEST_TYPES_SYNTAX_NEGATIVE.reduce((h_out, sc1_type) => ({
		...h_out,
		[sc1_type]: TestCase_Negative,
	}), {}),

	...A_TEST_TYPES_SYNTAX_POSITIVE.reduce((h_out, sc1_type) => ({
		...h_out,
		[sc1_type]: TestCase_SyntaxPositive,
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


export default function(gc_tests) {
	before(async() => {
		// do not use fs in browser
		if(B_BROWSER) return;

		let {
			reader: f_reader,
			reader_class: dc_reader,
			package: si_package,
			manifest: p_manifest_source,
		} = gc_tests;

		let p_manifest = path.join(pd_root, 'build/cache/specs', si_package, 'manifest.ttl');
		let p_iri_manifest = pathToFileURL(p_manifest);

		let k_tree = await TurtleLoader.run(fs.createReadStream(p_manifest), {
			baseIri: p_iri_manifest+'',
		});

		// get head of list pointer
		let [sc1_head] = k_tree.matchC1('>'+p_iri_manifest, 'mf:entries', null).distinctC1Objects();

		describe('w3c rdf specification', () => {
			// traverse collextion
			for(const sc1_entry of k_tree.collectionC1(sc1_head)) {
				const {
					a_types=[],
					a_names=[],
					a_actions=[],
					a_results=[],
				} = k_tree.crawlTriples({
					[sc1_entry]: {
						'rdf:type': as_types => ({a_types:[...as_types]}),
						'mf:name': as_names => ({a_names:[...as_names]}),
						'mf:action': as_actions => ({a_actions:[...as_actions]}),
						'mf:result': as_results => ({a_results:[...as_results]}),
					},
				});

				let sc1_type = a_types[0];
				let s_name = a_names[0].slice(1);
				let p_action = fileURLToPath(a_actions[0].slice(1));

				// no route
				if(!(sc1_type in HC1_TEST_TYPES)) {
					debugger;
					throw new Error(`no such test type: ${sc1_type}`);
				}

				// route
				let k_test_case = new HC1_TEST_TYPES[sc1_type]({
					reader: f_reader,
					reader_class: dc_reader,
					name: s_name,
					action: p_action,
					result: a_results.length? fileURLToPath(a_results[0].slice(1)): null,
					base: p_manifest_source.replace(/\/[^/]+$/, '/'+path.basename(p_action)),
				});

				// run
				k_test_case.run();
			}
		});
	});
}
