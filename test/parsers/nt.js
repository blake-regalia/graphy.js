/*eslint indent:0*/
const assert = require('assert');
const deq = assert.deepEqual;

const graphy = require('../../dist/main/graphy.js');
const parse_nt = graphy.nt.parse;


const as_triple = function(a_this) {
	let s_subject = a_this[0];
	let s_predicate = a_this[1];
	let z_object = a_this[2];
	return {
		subject: a_this[0],
		predicate: a_this[1],
		object:  a_this[2],
		graph: {},
	};
};

const allow = function(s_test, s_nt, a_pattern) {
	let a_quads = [];
	it(s_test, () => {
		if(R_WANTS_PREFIX.test(s_nt)) {
			s_nt = S_AUTO_PREFIX + s_nt;
		}
		parse_nt(s_nt, {
			data: a_quads.push.bind(a_quads),
			error(e_parse) {
				assert.ifError(e_parse);
			},
			end() {
				deq(a_quads, a_pattern.map(as_triple));
			},
		});
	});
};


const err = (s_test, s_nt, s_err_char, s_err_state) => {
	it(s_test, () => {
		if(R_WANTS_PREFIX.test(s_nt)) {
			s_nt = S_AUTO_PREFIX + s_nt;
		}
		parse_nt(s_nt, {
			data() {},
			error(e_parse) {
				assert.notStrictEqual(e_parse, undefined);
				let s_match = 'failed to parse a valid token starting at '+(s_err_char? '"'+s_err_char+'"': '<EOF>');
				assert.notStrictEqual(-1, e_parse.indexOf(s_match));
				if(s_err_state) {
					assert.strictEqual(/expected (\w+)/.exec(e_parse)[1], s_err_state);
				}
			},
			end() {},
		});
	});
};

const survive = (s_test, s_nt, a_pattern) => {
	let a_quads = [];
	if(R_WANTS_PREFIX.test(s_nt)) {
		s_nt = S_AUTO_PREFIX + s_nt;
	}
	let a_nt = s_nt.split('');
	it(s_test, (f_done) => {
		(new require('stream').Readable({
			read() {
				this.push(a_nt.shift() || null);
			},
		})).pipe(parse_nt({
			error(e_parse) {
				throw e_parse;
			},
			data(h_triple) {
				a_quads.push(h_triple);
			},
			end() {
				deq(a_quads, a_pattern.map(as_triple));
				f_done();
			},
		}));
	});
};


describe('nt parser:', () => {

	it('works', () => {
		allow(`
			<#a> <#b> <#c> . # comments
			<#d> <#e> "f"^^<#g> .
			<#h> <#i> "j"^^@k .
			<#l> <#m> "n" .
		`, [
			['#a', '#b', '#c'],
			['#d', '#e', {value: 'f', datatype: '#g'}],
			['#h', '#i', {value: 'j', language: 'k'}],
			['#l', '#m', {value: 'n'}],
		]);
	});
});
