/* eslint indent: 0, padded-blocks: 0 */
const assert = require('assert');
const deq = assert.deepEqual;
const eq = assert.strictEqual;

const stream = require('stream');

const expect = require('chai').expect;

const factory = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/core.data.factory`);
const nt_read = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/content.nt.read`);
const dataset_tree = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/util.dataset.tree`);

const graphy_reader_interface = require('../../../interfaces/content-reader.js');
const w3c_rdf_specification = require('../../../interfaces/w3c-rdf-specification.js');


const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDF_FIRST = P_IRI_RDF+'first';
const P_IRI_RDF_REST = P_IRI_RDF+'rest';
const P_IRI_RDF_NIL = P_IRI_RDF+'nil';

const P_RDF_LANGSTRING = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString';


const as_triple = function(a_this) {
	let s_subject = a_this[0];
	let s_predicate = a_this[1];
	let z_object = a_this[2];
	return {
		subject: /^[ _]/.test(s_subject)
			? {
				value: s_subject.slice(1),
				isAnonymous: ' ' === s_subject[0],
			}
			: {
				value: s_subject,
			},
		predicate: {
			value: '->' === s_predicate
				? P_IRI_RDF_FIRST
				: ('>>' === s_predicate
					? P_IRI_RDF_REST
					: s_predicate),
		},
		object: 'string' === typeof z_object
			? (' ' === z_object[0]
				? {value:z_object.slice(1), isAnonymous:true}
				: ('_' === z_object[0]
					? {value:z_object.slice(1), isAnonymous:false}
					: ('.' === z_object
						? {value:P_IRI_RDF_NIL}
						: {value:z_object})))
			: ('number' === typeof z_object
				? {value:z_object+''}
				: z_object),
		graph: {},
	};
};

const err = (s_test, s_content, s_err_char, s_err_state) => {
	it(s_test, () => {
		nt_read(s_content, {
			data() {},
			error(e_parse) {
				expect(e_parse).to.be.an('error');
				// let s_match = 'failed to parse a valid token'; // starting at '+('string' === typeof s_err_char? '"'+s_err_char+'"': '<<EOF>>');
				// expect(e_parse.message).to.have.string(s_match);
				// if(s_err_state) {
				// 	expect(/expected (\w+)/.exec(e_parse)[1]).to.equal(s_err_state);
				// }
			},
			end() {},
		});
	});
};

const deq_quads = (a_quads_a, a_quads_b) => {
	eq(a_quads_a.length, a_quads_b.length, `expected ${a_quads_b.length} quads, parsed ${a_quads_a.length}`);
	for(let i_quad=0, nl_quads=a_quads_a.length; i_quad<nl_quads; i_quad++) {
		let g_quad_a = a_quads_a[i_quad];
		let g_quad_b = a_quads_b[i_quad];

		if(g_quad_b.graph.isAnonymous) {
			assert.ok(g_quad_a.graph.isAnonymous, 'expected graph to be anonymous');
		}
		else {
			deq(g_quad_a.graph, g_quad_b.graph);
		}

		if(g_quad_a.object.isAnonymous) {
			assert.ok(g_quad_a.object.isAnonymous, 'expected object to be anonymous');
		}
		else {
			deq(g_quad_a.object, g_quad_b.object);
		}

		deq(g_quad_a.predicate, g_quad_b.predicate);

		if(g_quad_a.subject.isAnonymous) {
			assert.ok(g_quad_a.subject.isAnonymous, 'expected subject to be anonymous');
		}
		else {
			deq(g_quad_a.subject, g_quad_b.subject);
		}
	}
};

const survive = (s_test, s_content, a_pattern, b_debug=false) => {
	let a_quads = [];
	let a_ttl = s_content.split('');
	it(s_test, (f_done) => {
		(new stream.Readable({
			read() {
				this.push(a_ttl.shift() || null);
			},
		})).pipe(nt_read({
			debug: b_debug,
			error(e_parse) {
				throw e_parse;
			},
			data(h_triple) {
				a_quads.push(h_triple);
			},
			end() {
				deq_quads(a_quads, a_pattern.map(as_triple));
				f_done();
			},
		}));
	});
};

const allow = survive;

describe('nt reader:', () => {
	describe('empty:', () => {
		allow('blank', '', []);

		allow('whitespace', ' \t \n', []);
	});

	describe('iris:', () => {
		const abc = [['z://a', 'z://b', 'z://c']];

		allow('iris', '<z://a> <z://b> <z://c> .', abc);

		allow('iris w/ unicode escapes', '<\\u2713> <like> <\\U0001F5F8> .', [
			['\u2713', 'like', '\ud83d\uddf8'],
		]);

		allow('crammed spaces', `
			<z://a><z://b>"f"^^<z://g>.`, [
				['z://a', 'z://b', {value:'f', datatype:{value:'z://g'}}],
			]);
	});

	describe('basics', () => {
		it('works', () => {
			allow('basic triples', `
				<#a> <#b> <#c> . # comments
				<#d> <#e> "f"^^<#g> .
				<#h> <#i> "j"^^@k .
				<#l> <#m> "n" .
			`, [
				['#a', '#b', '#c'],
				['#d', '#e', {value:'f', datatype:'#g'}],
				['#h', '#i', {value:'j', language:'k'}],
				['#l', '#m', {value:'n'}],
			]);
		});
	});

	describe('emits parsing error for:', () => {
		err('turtle data',
			':a :b (_:g0 _:b0 _:g1).', ':', 'prefix_id');
	});


	describe('blank nodes:', () => {
		allow('labeled', `
			_:a <z://b> _:c .
			_:c <z://d> _:e .
			`, [
				['_a', 'z://b', '_c'],
				['_c', 'z://d', '_e'],
			]);
	});

	describe('string literals:', () => {
		allow('double quotes', `
			<z://a> <z://b> "" .
			<z://a> <z://b> "c" .
			<z://a> <z://b> "'c\\u002C\\n\\"" .
			`, [
				['z://a', 'z://b', {value:''}],
				['z://a', 'z://b', {value:'c'}],
				['z://a', 'z://b', {value:`'c,\n"`}],
			], true);

		allow('escapes & unicode', `
			<z://a> <z://b> "\\"\\\\t = '\\t'\\"" .
			<z://a> <z://b> "\\"\\"\\"\\"\\"\\"" .
			<z://a> <z://b> "\\"\\u00C5\\"" .
			<z://a> <z://b>  "\\"\\U0001D11E\\"\\\\test\\"" .
			`, [
				['z://a', 'z://b', {value:'"\\t = \'\t\'"'}],
				['z://a', 'z://b', {value:'""""""'}],
				['z://a', 'z://b', {value:'"Å"'}],
				['z://a', 'z://b', {value:'"𝄞"\\test"'}],
			]);

		allow('langtag', `
			<z://a> <z://b> "c"@en .
			<z://d> <z://e> "f"@EN .
			`, [
				['z://a', 'z://b', {value:'c', language:'en', datatype:{value:P_RDF_LANGSTRING}}],
				['z://d', 'z://e', {value:'f', language:'en', datatype:{value:P_RDF_LANGSTRING}}],
			]);

		allow('datatype', `
			<z://a> <z://b> "c"^^<z://x> .
			<z://d> <z://e> "f"^^<z://y> .
			<z://g> <z://h> "i"^^<z://z> .
			`, [
				['z://a', 'z://b', {value:'c', datatype:{value:'z://x'}}],
				['z://d', 'z://e', {value:'f', datatype:{value:'z://y'}}],
				['z://g', 'z://h', {value:'i', datatype:{value:'z://z'}}],
			]);
	});

	describe('emits parsing error for:', () => {
		err('blank node predicate',
			'<a> _:b <c>.', '_', 'pairs');

		err('invalid blank node full stop',
			'[ <a> <b> .', '.', 'end_of_property_list');

		err('no end of triple',
			'<z://a> <z://b> <z://c> ', '\0', 'post_object');
	});

	describe('states interrupted by end-of-stream:', () => {
		describe('triples with tokens:', () => {
			survive('iris', '<alpha> <bravo> <charlie> .', [
				['alpha', 'bravo', 'charlie'],
			]);

			survive('string literals', '<z://a> <z://b> "charlie"^^<z://delta> .', [
				['z://a', 'z://b', {value:'charlie', datatype:{value:'z://delta'}}],
			]);
		});

		survive('comments', `
			# comment
			<a> <b> <c> .`, [
				['a', 'b', 'c'],
			]);
	});

	describe('graphy reader interface', () => {
		let k_tree_expect = dataset_tree();
		k_tree_expect.add(factory.quad(...[
			factory.namedNode('a'),
			factory.namedNode('b'),
			factory.namedNode('c'),
		]));

		graphy_reader_interface({
			reader: nt_read,
			input: /* syntax: nt */ `
				<a> <b> <c> .
			`,
			events: {
				data(a_events) {
					let k_tree_actual = dataset_tree();
					for(let [g_quad] of a_events) {
						k_tree_actual.add(g_quad);
					}

					expect(k_tree_actual.equals(k_tree_expect)).to.be.true;
				},

				eof(a_eofs) {
					expect(a_eofs).to.have.length(1);
				},
			},
		});
	});

	describe('w3c rdf specification', async() => {
		await w3c_rdf_specification({
			reader: nt_read,
			package: 'content.nt.read',
			manifest: 'http://w3c.github.io/rdf-tests/ntriples/manifest.ttl',
		});
	});
});

