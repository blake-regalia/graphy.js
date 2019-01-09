/* eslint indent: 0, padded-blocks: 0 */
const expect = require('chai').expect;

const stream = require('@graphy/core.iso.stream');

const w3c_rdf_specification = require('../interface/w3c-rdf-specification.js');
const graphy_reader_interface = require('../interface/content-reader.js');
const util = require('./util.js');

const R_WANTS_PREFIX = /^\s*[(:_[]/;

class reader_suite {
	constructor(gc_suite, f_suite) {
		let s_prefix_string = '';
		if(gc_suite.prefixes) {
			let h_prefixes = gc_suite.prefixes;
			for(let [s_prefix_id, p_iri] of Object.entries(h_prefixes)) {
				s_prefix_string += `@prefix ${s_prefix_id}: <${p_iri}> .\n`;
			}
		}

		Object.assign(this, {
			...gc_suite,
			prefix_string: s_prefix_string,
			package: `content.${gc_suite.alias}.read`,
		});

		describe(this.package, () => {
			f_suite(this);
		});
	}

	errors(h_tree) {
		describe('emits read error for:', () => {
			util.map_tree(h_tree, (s_label, f_leaf) => {
				// destructure leaf node
				let {
					input: st_input,
					char: s_char=null,
					state: s_err_state=null,
					debug: b_debug=false,
				} = f_leaf();

				it(s_label, (fke_test) => {
					this.reader(st_input, {
						debug: b_debug,

						// ignore data events
						data() {},

						// expect error
						error(e_parse) {
							expect(e_parse).to.be.an('error');
							if(s_char) {
								let s_match = 'failed to parse a valid token'; // starting at '+('string' === typeof s_err_char? '"'+s_err_char+'"': '<<EOF>>');
								expect(e_parse.message).to.have.string(s_match);
								if(s_err_state) {
									expect(/expected (\w+)/.exec(e_parse.message)[1]).to.equal(s_err_state);
								}
							}
							fke_test();
						},

						// watch for end
						end() {
							debugger; st_input;  // for debugging
							fke_test(new Error('should have caught an error'));
						},
					});
				});
			});
		});
	}

	allows(h_tree) {
		let g_modes = {
			'no validation': {
				validate: false,
			},
			'yes validation': {
				validate: true,
			},
		};

		for(let [s_mode, gc_read] of Object.entries(g_modes)) {
			describe(s_mode, () => {
				util.map_tree(h_tree, (s_label, f_leaf) => {
					// destructure leaf node
					let [st_input, a_validate, b_debug=false] = f_leaf();

					// input wants prefixes
					if(this.prefix_string && R_WANTS_PREFIX.test(st_input)) {
						st_input = this.prefix_string+st_input;
					}

					// create test case
					it(s_label, (fke_test) => {
						let a_quads = [];

						// feed input one character at a time
						let i_char = 0;
						(new stream.Readable({
							read() {
								this.push(st_input[i_char++] || null);
							},
						})).pipe(this.reader({
							debug: b_debug,
							...gc_read,

							// watch for errors
							error(e_read) {
								fke_test(e_read);
							},

							// expect data
							data(g_quad) {
								a_quads.push(g_quad);
							},

							// wait for end
							end() {
								util.validate_quads(a_quads, a_validate);
								fke_test();
							},
						}));
					});
				});
			});
		}
	}

	interfaces(f_interface) {  // eslint-disable-line class-methods-use-this
		describe('graphy reader interface', () => {
			f_interface(graphy_reader_interface);
		});
	}

	specification() {
		describe('w3c rdf specification', async() => {
			await w3c_rdf_specification({
				reader: this.reader,
				package: this.package,
				manifest: this.manifest,
			});
		});
	}
}

module.exports = function(...a_args) {
	return new reader_suite(...a_args);
};
