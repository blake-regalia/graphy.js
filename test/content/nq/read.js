/* eslint indent: 0, padded-blocks: 0 */
const assert = require('assert');
const deq = assert.deepEqual;
const eq = assert.strictEqual;

const stream = require('stream');

const expect = require('chai').expect;

const nq_read = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/content.nq.read`);



const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const P_IRI_RDF_FIRST = P_IRI_RDF+'first';
const P_IRI_RDF_REST = P_IRI_RDF+'rest';
const P_IRI_RDF_NIL = P_IRI_RDF+'nil';

const P_RDF_LANGSTRING = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#langString';


const as_quad = function(a_this) {
	let s_subject = a_this[0];
	let s_predicate = a_this[1];
	let z_object = a_this[2];
	let s_graph = a_this[3];
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
		graph: s_graph
			? (/^[ _]/.test(s_graph)
				? {
					value: s_graph.slice(1),
					isAnonymous: ' ' === s_graph[0],
				}
				: {
					value: s_graph,
				})
			: {},
	};
};

const err = (s_test, s_content, s_err_char, s_err_state) => {
	it(s_test, (fk_test) => {
		nq_read(s_content, {
			data() {},
			error(e_parse) {
				expect(e_parse).to.be.an('error');
				// let s_match = 'failed to parse a valid token';
				// expect(e_parse.message).to.have.string(s_match);
				// if(s_err_state) {
				// 	expect(/expected (\w+)/.exec(e_parse)[1]).to.equal(s_err_state);
				// }
				fk_test();
			},
			end() {
				fk_test(new Error('should have caught an error'));
			},
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
		})).pipe(nq_read({
			debug: b_debug,
			error(e_parse) {
				throw e_parse;
			},
			data(g_quad) {
				a_quads.push(g_quad);
			},
			end() {
				deq_quads(a_quads, a_pattern.map(as_quad));
				f_done();
			},
		}));
	});
};

const allow = survive;

describe('nq reader:', () => {
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
	});

	describe('iris w/o graph:', () => {
		const abc = [['z://a', 'z://b', 'z://c']];

		allow('iris', '<z://a> <z://b> <z://c> .', abc);

		allow('iris w/ unicode escapes', '<\\u2713> <like> <\\U0001F5F8> .', [
			['\u2713', 'like', '\ud83d\uddf8', ''],
		]);

		allow('crammed spaces', `
			<z://a><z://b>"f"^^<z://g>.`, [
				['z://a', 'z://b', {value:'f', datatype:{value:'z://g'}}],
			]);
	});

	describe('iris w/ default graph:', () => {
		const abc = [['z://a', 'z://b', 'z://c']];

		allow('iris', '<z://a> <z://b> <z://c> . ', abc);

		allow('iris w/ unicode escapes', '<\\u2713> <like> <\\U0001F5F8> . ', [
			['\u2713', 'like', '\ud83d\uddf8', ''],
		]);

		allow('crammed spaces', `
			<z://a><z://b>"c"^^<z://d><z://g>.`, [
				['z://a', 'z://b', {value:'c', datatype:{value:'z://d'}}, 'z://g'],
			]);
	});

	describe('iris w/ named graph:', () => {
		const abcd = [['z://a', 'z://b', 'z://c', 'z://d']];

		allow('iris', '<z://a> <z://b> <z://c> <z://d> .', abcd);

		allow('iris w/ unicode escapes', '<\\u2713> <like> <\\U0001F5F8> <z://d> .', [
			['\u2713', 'like', '\ud83d\uddf8', 'z://d'],
		]);
	});

	describe('graphs:', () => {
		allow('multiple iri named', `
			<#a> <#b> <#c> <#g1> .
			<#d> <#e> <#f> <#g2> .
		`,
			[
				['#a', '#b', '#c', '#g1'],
				['#d', '#e', '#f', '#g2'],
			]);

		allow('multiple labeled blank', `
			<#a> <#b> <#c> _:g1 .
			<#d> <#e> <#f> _:g2 .
		`,
			[
				['#a', '#b', '#c', '_g1'],
				['#d', '#e', '#f', '_g2'],
			]);

		allow('mixed', `
			<#a> <#b> <#c> _:g0 .
			<#d> <#e> <#f> _:g1 .
			<#g> <#h> <#i> <#g2> .
			<#k> <#l> <#m> <#g3> .
		`,
			[
				['#a', '#b', '#c', '_g0'],
				['#d', '#e', '#f', '_g1'],
				['#g', '#h', '#i', '#g2'],
				['#k', '#l', '#m', '#g3'],
			]);
	});

	describe('basics', () => {
		it('works', () => {
			allow('basic quads', `
				<#a> <#b> <#c> <#z> . # comments
				<#d> <#e> "f"^^<#g> <#z> .
				<#h> <#i> "j"^^@k <#z> .
				<#l> <#m> "n" <#z> .
			`, [
				['#a', '#b', '#c', '#z'],
				['#d', '#e', {value:'f', datatype:'#g'}, '#z'],
				['#h', '#i', {value:'j', language:'k'}, '#z'],
				['#l', '#m', {value:'n'}, '#z'],
			]);
		});
	});

	describe('emits parsing error for:', () => {
		err('turtle data',
			':a :b (_:g0 _:b0 _:g1).', ':', 'prefix_id');
	});

	describe('blank nodes:', () => {
		allow('labeled triples', `
			_:a <z://b> _:c .
			_:c <z://d> _:e .
			`, [
				['_a', 'z://b', '_c'],
				['_c', 'z://d', '_e'],
			]);

		allow('labeled quads', `
			_:a <z://b> _:c <#g1> .
			_:c <z://d> _:e _:g2.
			`, [
				['_a', 'z://b', '_c', '#g1'],
				['_c', 'z://d', '_e', '_g2'],
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

		err('no end of quad',
			'<z://a> <z://b> <z://c> <z://d> ', '\0', 'post_object');
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

});

