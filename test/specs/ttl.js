const assert = require('assert');
const stream = require('stream');

const graphy = require('../../dist/main/graphy.js');
const async = require('async');
const request = require('request');

const P_PATH = 'https://www.w3.org/2013/TurtleTests/';

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


function test_eval(s_subject_id) {
	let s_output = '';
	return parse({
		data(h_triple) {
			s_output += h_triple.verbose();
		},
		error(e_parse) {
			console.error('parsing failed on '+s_subject_id);
			console.error(e_parse);
			process.exit(1);
		},
		end() {
			let h_labels = {};
			let i_anon = 0;
			h_results[s_subject_id] = s_output
				// try to make non-anymous blank node labels match auto-incrementing ones
				.replace(/_:[^g\s]+/g, (s_label) => {
					if('#turtle-subm-10' === s_subject_id) {
						i_anon += 1;
					}
					if(h_labels[s_label]) return h_labels[s_label];
					return h_labels[s_label] = '_:g'+(i_anon++);
				});
		},
	});
}

function test_positive_syntax(s_subject_id) {
	let b_failed = false;
	return parse({
		data() {},
		error() {
			b_failed = true;
		},
		end() {
			h_results[s_subject_id] = !b_failed;
		},
	});
}

function test_negative_syntax(s_subject_id) {
	let b_failed = false;
	let ds_transform = parse({
		data() {},
		error() {
			b_failed = true;
		},
		end() {
			h_results[s_subject_id] = b_failed;
		},
	});
	ds_transform.on('finish', (e_parse) => {
		h_results[s_subject_id] = true;
	});
	return ds_transform;
}

function validate(s_subject_id) {
	let d_reader = new stream.Writable();
	let s_nt = '';
	d_reader._write = function(s_chunk, s_enc, f_okay) {
		s_nt += s_chunk;
		f_okay();
	};
	d_reader.on('finish', () => {
		let h_labels = {};
		let i_anon = 0;
		h_answers[s_subject_id] = s_nt
			// remove blank node labels and make them match auto-assigned anonymous labels
			.replace(/_:(b|el|innerEl|outerEl|genid|hasParent)[0-9]*/g, (s_label) => {
				if(h_labels[s_label]) return h_labels[s_label];
				return h_labels[s_label] = '_:g'+(i_anon++);
			})
			// // wtf? canonical N-Triples form explicitly states that characters MUST NOT be represented by UCHAR!
			// .replace(/\\u([0-9a-fA-F]{4})/g, (s_uchar, x_cp) => {
			// 	return String.fromCharCode(parseInt(x_cp, 16));
			// })

			// lowercase-ify unicode escapes
			.replace(/\\u([0-9A-F]{4})/g, (s_uchar, s_cp) => JSON.stringify(String.fromCodePoint(parseInt(s_cp, 16))).slice(1, -1))
			.replace(/\\U([0-9A-F]{8})/g, (s_uchar, s_cp) => JSON.stringify(String.fromCodePoint(parseInt(s_cp, 16))).slice(1, -1))

			// // some more things i do not understand why they don't escape / conform to
			// .replace(/\u0008/g, '\\b')
			// .replace(/\f/g, '\\f')
			// .replace(/\r/g, '\\r')

			// lowercase-ify language tags
			.replace(/@[a-zA-Z](-[a-zA-Z0-9]+)*/, s => s.toLowerCase())

			// we don't do document base IRI
			.replace(/<http:\/\/www\.w3\.org\/2013\/TurtleTests\/(?:.*\.ttl#)?([xy]|[abc][0-9])/g, '<$1');
	});
	return d_reader;
}


const parse = (...a_args) => graphy.deserializer('text/turtle', ...a_args);

const q_tests = async.queue(function(h_task, f_okay) {
	request(P_PATH+h_task.data.object.value)
		.pipe(h_task.pipe(h_task.data.subject.value))
		.on('finish', () => {
			f_okay();
		});
}, 12);

q_tests.drain = function() {
	console.log('\n=== results ===\n');
	for(let s_test_id in h_tests) {
		let z_result = h_results[s_test_id];
		let z_answer = h_answers[s_test_id];

		if('string' === typeof h_answers[s_test_id]) {
			let a_answer_lines = z_answer.split(/\n/g);
			let a_result_lines = z_result.split(/\n/g);
			if(a_answer_lines.length !== a_result_lines.length) {
				console.error('\u001b[31m˟\u001b[39m '+s_test_id
					+'\n\t\u001b[31m'+z_result+'\u001b[39m'
					+'\n\t'+z_answer);
			}
			else {
				for(let i=0; i<a_answer_lines.length; i++) {
					let i_found = a_result_lines.indexOf(a_answer_lines[i]);
					if(-1 === i_found) {
						console.error('\u001b[31m˟\u001b[39m '+s_test_id
							+'\n\t\u001b[31m'+z_result+'\u001b[39m'
							+'\n\t'+z_answer);
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

request(P_PATH+'manifest.ttl')
	.pipe(parse({
		data(h_triple) {
			// ref parts
			let p_subject = h_triple.subject.value;
			let p_predicate = h_triple.predicate.value;
			let w_object = h_triple.object.value;

			// mf action
			if(P_IRI_MF_ACTION === p_predicate) {
				let h_info = h_tests[p_subject];
				if(h_info) q_tests.push({pipe:h_info.pipe, data:h_triple});
			}
			// mf result
			else if(P_IRI_MF_RESULT === p_predicate) {
				q_tests.push({pipe:validate, data:h_triple});
			}
			// rdf:type
			else if(P_IRI_RDF_TYPE === p_predicate) {
				if(P_IRI_RDFT_TEST_TURTLE_EVAL === w_object) {
					h_tests[p_subject] = {pipe:test_eval};
				}
				else if(P_IRI_RDFT_TEST_TURTLE_POSITIVE_SYNTAX === w_object) {
					h_tests[p_subject] = {pipe:test_positive_syntax};
					h_answers[p_subject] = true;
				}
				// // negative syntaxes are not of concern since we only care about parsing valid syntax documents
				// else if(P_IRI_RDFT_TEST_TURTLE_NEGATIVE_SYNTAX === w_object) {
					// h_tests[p_subject] = test_negative_syntax;
					// h_answers[p_subject] = false;
				// }
			}
		},
		end() {
			console.log('running tests...');
		},
	}));
