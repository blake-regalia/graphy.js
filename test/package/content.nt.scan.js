/* eslint indent: 0, padded-blocks: 0, quote-props: 0 */
const expect = require('chai').expect;

const stream = require('stream');
const events = require('events');
const once = events.once;
const factory = require('@graphy/core.data.factory');
const dataset_tree = require('@graphy/memory.dataset.fast');

const nt_scriber = require('@graphy/content.nt.scribe');

const nt_scan = require('@graphy/content.nt.scan');

function emulate_stream(ab_input) {
	let ib_start = 0;
	let nb_input = ab_input.length;

	return new stream.Readable({
		read() {
			let ib_next = ib_start + 0x10000;
			let ab_next = ab_input.slice(ib_start, ib_next);
			if(ib_start >= nb_input) {
				this.push(null);
			}
			else {
				this.push(ab_next);
			}

			ib_start = ib_next;
		},
	});
}

describe('content.nt.scan', () => {
	const NL_GENERATE = 0x10000 * 64;  // approximately 4 MiB
	let ab_generate;
	let c_items = 0;


	before(async() => {
		let s_generate = '';

		let ds_scriber = nt_scriber();

		ds_scriber.on('data', (s_write) => {
			s_generate += s_write;
		});

		let p_ns = 'http://example.org/linked-open-data/instance-or-ontology/';

		for(; s_generate.length<NL_GENERATE; c_items++) {
			ds_scriber.write(factory.quad(...[
				factory.namedNode(p_ns+'subject-'+c_items),
				factory.namedNode(p_ns+'predicate-'+c_items),
				(c_items % 5)
					? factory.namedNode(p_ns+'object-'+c_items)
					: (c_items % 2)
						? factory.literal('some -value', factory.namedNode(p_ns+'datatype-'+c_items))
						: factory.literal('This string is an example literal data for the generated dataset, item number "'+c_items+'".', 'en'),
			]));
		}

		ds_scriber.end();

		await once(ds_scriber, 'end');

		ab_generate = Buffer.from(s_generate);
	});

	describe('safeguards', () => {
		it('no workers', (fke_test) => {
			let ds_scanner = nt_scan({
				preset: 'count',
				report(c_quads) {
					expect(c_quads).to.equal(c_items);
					fke_test();
				},
			});

			// force set workers to zero
			ds_scanner._nl_workers = 0;

			emulate_stream(ab_generate)
				.pipe(ds_scanner);
		});
	});

	describe('basics', () => {
		it('blank', (fke_test) => {
			emulate_stream(Buffer.allocUnsafe(0))
				.pipe(nt_scan({
					preset: 'count',
					report(c_quads) {
						expect(c_quads).to.equal(0);
						fke_test();
					},
				}));
		});

		it('one line', (fke_test) => {
			emulate_stream(Buffer.from(`<z://a/> <z://b/> <z://c/> .`))
				.pipe(nt_scan({
					preset: 'count',
					report(c_quads) {
						expect(c_quads).to.equal(1);
						fke_test();
					},
				}));
		});

		it('two lines', (fke_test) => {
			emulate_stream(Buffer.from(`<z://a/> <z://b/> <z://c/> .\n<z://a/> <z://b/> "c"@en .`))
				.pipe(nt_scan({
					preset: 'count',
					report(c_quads) {
						expect(c_quads).to.equal(2);
						fke_test();
					},
				}));
		});
	});

	describe('errors', () => {
		it('invalid master', (fke_test) => {
			emulate_stream(Buffer.from('Invalid.'))
				.pipe(nt_scan({
					preset: 'count',

					error(e_read) {
						fke_test();
					},

					report() {
						fke_test(new Error('failed to stop report after invalid input'));
					},
				}));
		});

		it('invalid worker', (fke_test) => {
			emulate_stream(Buffer.from('<z://a/> <z://b/> <z://c/> .\nInvalid.'))
				.pipe(nt_scan({
					preset: 'count',

					error(e_read) {
						fke_test();
					},

					report() {
						fke_test(new Error('failed to stop report after invalid input'));
					},
				}));
		});
	});

	describe('tasks', () => {
		it('preset: count', (fke_test) => {
			emulate_stream(ab_generate)
				.pipe(nt_scan({
					preset: 'count',

					report(c_quads) {
						expect(c_quads).to.equal(c_items);
						fke_test();
					},
				}));
		});

		it('preset: scribe', (fke_test) => {
			emulate_stream(ab_generate)
				.pipe(nt_scan({
					preset: 'scribe',

					user: {
						prefixes: {
							'': 'http://example.org/linked-open-data/instance-or-ontology/',
						},
					},

					update() {
						expect(c_quads).to.equal(c_items);
					},

					end() {
						fke_test();
					},
				}));
		});

		it('preset: distinct-quads', () => {
			emulate_stream(ab_generate)
				.pipe(nt_scan({
					preset: 'distinct-quads',

					report(c_quads) {
						expect(c_quads).to.equal(c_items);
					},
				}));
		});
	});
});
