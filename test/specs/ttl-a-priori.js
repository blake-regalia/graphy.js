const fs = require('fs');

const assert = require('assert');
const stream = require('stream');

const graphy = require('graphy');
const async = require('async');
const request = require('request');
require('colors');

const P_PATH = 'http://www.w3.org/2013/TurtleTests/';

const P_IRI_MF = 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#';
const P_IRI_MF_ACTION = P_IRI_MF+'action';
const P_IRI_MF_RESULT = P_IRI_MF+'result';

const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDF_TYPE = P_IRI_RDF+'type';

const P_IRI_RDFT = 'http://www.w3.org/ns/rdftest#';
const P_IRI_RDFT_TEST_TURTLE_EVAL = P_IRI_RDFT+'TestTurtleEval';
const P_IRI_RDFT_TEST_TURTLE_POSITIVE_SYNTAX = P_IRI_RDFT+'TestTurtlePositiveSyntax';
const P_IRI_RDFT_TEST_TURTLE_NEGATIVE_SYNTAX = P_IRI_RDFT+'TestTurtleNegativeSyntax';

const h_tests = {};
const h_results = {};
const h_answers = {};


function test_eval(s_test_id) {
	let k_set = graphy.set();
	return graphy.format.ttl.read({
		// set default base
		prepend: `@base <${P_PATH}${s_test_id.slice(1)}.ttl> .\n`,

		data(g_quad) {
			k_set.add(g_quad);
		},
		error(e_parse) {
			console.error('parsing failed on '+s_test_id);
			console.error(e_parse);
			process.exit(1);
		},
		end() {
			h_results[s_test_id] = k_set.canonicalize();
		},
	});
}

function test_positive_syntax(s_test_id) {
	let w_result = true;
	return graphy.format.ttl.read({
		data() {},
		error(e_parse) {
			w_result = e_parse;
		},
		end() {
			h_results[s_test_id] = w_result;
		},
	});
}

function test_negative_syntax(s_test_id) {
	let w_result = true;
	let ds_transform = graphy.format.ttl.read({
		debug: ('#turtle-syntax-bad-esc-01' === s_test_id),
		validate: true,
		data() {},
		error(e_parse) {
			w_result = false;
		},
	});

	ds_transform.on('finish', () => {
		h_results[s_test_id] = w_result;
	});
	return ds_transform;
}

function validate(s_test_id) {
	let d_reader = new stream.Writable();
	let s_nt = '';
	d_reader._write = function(s_chunk, s_enc, f_okay) {
		s_nt += s_chunk;
		f_okay();
	};
	d_reader.on('finish', () => {
		let k_set = graphy.set();
		graphy.nt.parser(s_nt, {
			data(h_triple) {
				k_set.add(h_triple);
			},
		});

		h_answers[s_test_id] = k_set.canonicalize();
	});
	return d_reader;
}


const q_tests = async.queue(function(h_task, f_okay) {
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

q_tests.drain = function() {
	console.log('\n=== results ===\n');

	// generate EARL report
	let k_writer = graphy.format.ttl.write({
		prefixes: {
			rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
			rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
			dc: 'http://purl.org/dc/terms/',
			doap: 'http://usefulinc.com/ns/doap#',
			earl: 'http://www.w3.org/ns/earl#',
			foaf: 'http://xmlns.com/foaf/0.1/',
			xsd: 'http://www.w3.org/2001/XMLSchema#',
			mf: 'http://www.w3.org/2001/sw/DataAccess/tests/test-manifest#',
			test: 'http://www.w3.org/2013/TurtleTests/',
			manifest: 'http://www.w3.org/2013/TurtleTests/manifest.ttl#',
		},
	});

	k_writer.pipe(fs.createWriteStream('earl-report.ttl'));

	k_writer.add({
		'>for': {
			'>future': '"use',
		},
	});

	k_writer.end();

	for(let s_test_id in h_tests) {
		let z_result = h_results[s_test_id];
		let z_answer = h_answers[s_test_id];

		if('string' === typeof h_answers[s_test_id]) {
			let a_answer_lines = z_answer.split(/\n/g);
			let a_result_lines = z_result.split(/\n/g);
			if(a_answer_lines.length !== a_result_lines.length) {
				console.error('˟ '.red+s_test_id
					+'\n\t'+'[actual]'.red+' '+'[expected]'.blue
					+'\n\t'+z_result.red
					+'\n\t'+z_answer.blue);
			}
			else {
				for(let i=0; i<a_answer_lines.length; i++) {
					let i_found = a_result_lines.indexOf(a_answer_lines[i]);
					if(-1 === i_found) {
						console.error('˟ '.red+s_test_id
							+'\n\t'+'[actual]'.red+' '+'[expected]'.blue
							+'\n\t'+z_result.red
							+'\n\t'+z_answer.blue);
						break;
					}
					else {
						a_answer_lines.splice(i_found, 1);
					}
				}
			}
		}
		else {
			try {
				assert.equal(z_result, z_answer);
				console.log('\u001b[32m✓\u001b[39m '+s_test_id);
			}
			catch(e) {
				console.error('\u001b[31m˟\u001b[39m '+s_test_id
					+'\n\t\u001b[31m'+z_result+'\u001b[39m'
					+'\n\t'+z_answer);
			}
		}
	}
	process.exit(0);
};

class TestCase {
	constructor(h_row) {
		Object.assign(this, h_row);
	}


}

request(P_PATH+'manifest.ttl')
	.pipe(graphy.format.ttl.read({
		data(g_quad) {
			let {
				subject: g_subject,
				predicate: g_predicate,
				object: g_object,
			} = g_quad;

			// ref parts
			let p_subject = g_subject.value;
			let p_predicate = g_predicate.value;
			let p_object = g_object.value;

			// mf action
			if(P_IRI_MF_ACTION === p_predicate) {
				let h_info = h_tests[p_subject];
				if(h_info) q_tests.push({pipe:h_info.pipe, data:g_quad});
			}
			// mf result
			else if(P_IRI_MF_RESULT === p_predicate) {
				q_tests.push({pipe:validate, data:g_quad});
			}
			// rdf:type
			else if(P_IRI_RDF_TYPE === p_predicate) {
				if(P_IRI_RDFT_TEST_TURTLE_EVAL === p_object) {
					h_tests[p_subject] = {pipe:test_eval};
				}
				else if(P_IRI_RDFT_TEST_TURTLE_POSITIVE_SYNTAX === p_object) {
					h_tests[p_subject] = {pipe:test_positive_syntax};
					h_answers[p_subject] = true;
				}
				else if(P_IRI_RDFT_TEST_TURTLE_NEGATIVE_SYNTAX === p_object) {
					h_tests[p_subject] = {pipe:test_negative_syntax};
					h_answers[p_subject] = false;
				}
				// else {
				// 	throw new Error('unrecognized test type: '+p_object);
				// }
			}
		},

		end() {
			console.log('running tests...');

		},
	}));
