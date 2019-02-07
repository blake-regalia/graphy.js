/* eslint quote-props: 0 */
/* eslint-env mocha */
const expect = require('chai').expect;

const graphy = require('graphy');

const factory = require('@graphy/core.data.factory');
const factory_suite = require('../helper/factory.js');
const util = require('../helper/util.js');
const cp = require('child_process');
const cp_exec = require('util').promisify(cp.exec);

factory_suite({
	package: 'graphy',
	factory: graphy,
});

const A_PACKAGES = [
	'core.data.factory',
	'content.nt.read',
	'content.nt.write',
	'content.nq.read',
	'content.nq.write',
	'content.ttl.read',
	'content.ttl.write',
	'content.trig.read',
	'content.trig.write',
	'util.dataset.tree',
];

describe('graphy API', () => {
	describe('package access by name', () => {
		A_PACKAGES.forEach((si_package) => {
			it(si_package, () => {
				// eslint-disable-next-line global-require
				expect(graphy[si_package]).to.equal(require('@graphy/'+si_package));
			});
		});
	});

	describe('package access by path', () => {
		A_PACKAGES.forEach((si_package) => {
			it(si_package, () => {
				let w_node = graphy;
				for(let s_frag of si_package.split(/\./g)) {
					w_node = w_node[s_frag];
				}
				// eslint-disable-next-line global-require
				expect(w_node).to.equal(require('@graphy/'+si_package));
			});
		});
	});

	describe('package access by query', () => {
		describe('graphy.content()', () => {
			/* eslint-disable global-require */
			let g_nt = {
				read: require('@graphy/content.nt.read'),
				write: require('@graphy/content.nt.write'),
			};

			let g_nq = {
				read: require('@graphy/content.nq.read'),
				write: require('@graphy/content.nq.write'),
			};

			let g_ttl = {
				read: require('@graphy/content.ttl.read'),
				write: require('@graphy/content.ttl.write'),
			};

			let g_trig = {
				read: require('@graphy/content.trig.read'),
				write: require('@graphy/content.trig.write'),
			};
			/* eslint-enable global-require */

			let access_by_query = h_tree => util.map_tree(h_tree, (s_label, f_leaf) => {
				describe(s_label, () => {
					let w_content = graphy.content(s_label);
					let h_content = f_leaf();
					for(let s_verb in h_content) {
						it(s_verb, () => {
							expect(w_content[s_verb]).to.equal(h_content[s_verb]);
						});
					}
				});
			});

			access_by_query({
				'nt': () => g_nt,
				'application/n-triples': () => g_nt,
				'aPpLiCaTiOn/N-tRiPlEs': () => g_nt,
				'nq': () => g_nq,
				'application/n-quads': () => g_nq,
				'aPpLiCaTiOn/N-qUaDs': () => g_nq,
				'ttl': () => g_ttl,
				'text/turtle': () => g_ttl,
				'tExT/tUrTlE': () => g_ttl,
				'trig': () => g_trig,
				'application/trig': () => g_trig,
				'aPpLiCaTiOn/TrIg': () => g_trig,
			});
		});
	});
});


// deduce the runtime environment
const [B_BROWSER, B_BROWSERIFY] = (() => 'undefined' === typeof process
	? [true, false]
	: (process.browser
		? [true, true]
		: ('undefined' === process.versions || 'undefined' === process.versions.node
			? [true, false]
			: [false, false])))();

if(!B_BROWSER) {
	describe('graphy CLI', () => {
		const exec = async(g_exec) => {
			let {
				cmd: s_cmd,
				exit: z_exit=null,
				out: z_out=null,
				err: z_err=null,
			} = g_exec;

			let g_stdio;
			s_cmd = s_cmd.trim().split(/\n/g).map(s => s.trim()).join(' ');
			try {
				g_stdio = await cp_exec(s_cmd, {
					shell: '/bin/bash',
				});
			}
			catch(e_script) {
				let {
					stderr: s_stderr,
					code: xc_exit,
				} = e_script;

				// error expected
				if(z_exit) {
					// validate exit code
					if(true === z_exit) {
						expect(xc_exit).to.not.equal(0);
					}
					else {
						expect(xc_exit).to.equal(z_exit);
					}

					// validate stderr
					if('string' === typeof z_err) {
						expect(s_stderr.replace(/\n$/, '')).to.equal(z_err);
					}
					else if(z_err instanceof RegExp) {
						expect(s_stderr).to.match(z_err);
					}
				}
				// error not expected
				else {
					throw e_script;
				}

				// exit test
				return;
			}

			// expected non-zero exit code
			if(z_exit) throw new Error('expected non-zero exit code');

			let {
				// error: e_script,
				stdout: s_stdout,
				stderr: s_stderr,
			} = g_stdio;

			s_stdout = s_stdout.replace(/\n{1,2}$/, '');

			// validate stdout
			if('string' === typeof z_out) {
				expect(s_stdout).to.equal(z_out);
			}
			else if(z_out instanceof RegExp) {
				expect(s_stdout).to.match(z_out);
			}
			else if('function' === typeof z_out) {
				z_out(s_stdout);
			}
		};

		const execs = h_tree => util.map_tree(h_tree, (s_label, f_leaf) => {
			it(s_label, async() => {
				await exec(f_leaf());
			});
		});

		const validate_json = f_validate_rows => s_stdout => {
			s_stdout = s_stdout.trim();
			if(!s_stdout) return f_validate_rows([]);

			let a_lines = s_stdout.split(/\n/g);

			let a_rows = [];
			for(let s_line of a_lines) {
				try {
					a_rows.push(JSON.parse(s_line));
				}
				catch(e_parse) {
					throw new Error(`reader output invalid line-delimited JSON on line '${s_line}'\n${e_parse.message}`);
				}
			}

			f_validate_rows(a_rows);
		};

		let st_left = /* syntax: turtle */ `
			@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
			@prefix demo: <http://ex.org/> .

			demo:Banana a demo:Fruit .

			demo:Fruit a demo:Food .
		`;

		let st_right = /* syntax: turtle */ `
			@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
			@prefix demo: <http://ex.org/> .

			demo:Watermelon a demo:Fruit .

			demo:Fruit a demo:Food .
		`;

		let st_blank_1 = /* syntax: turtle */ `
			@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
			@prefix demo: <http://ex.org/> .

			_:blank a _:other ;
				demo:self _:blank .

			_:other a demo:BlankNode .
		`;

		let st_blank_2 = /* syntax: turtle */ `
			@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
			@prefix demo: <http://ex.org/> .

			_:otra a demo:BlankNode .

			_:bnode demo:self _:bnode ;
			 	a _:otra .
		`;

		let triples = hc3_triples => a_rows => expect(a_rows).to.have.deep.members([
			...factory.c3(hc3_triples, {demo:'http://ex.org/'}),
		].map(kq => kq.isolate()));

		execs({
			'-h': () => ({
				cmd: /* syntax: bash */ `
					npx graphy -h
				`,
				out: /Usage/,
			}),

			'--help': () => ({
				cmd: /* syntax: bash */ `
					npx graphy --help
				`,
				out: /Usage/,
			}),

			'-v': () => ({
				cmd: /* syntax: bash */ `
					npx graphy -v
				`,
				out: require('../../package.json').version,
			}),

			'--version': () => ({
				cmd: /* syntax: bash */ `
					npx graphy --version
				`,
				out: require('../../package.json').version,
			}),

			'dbr data': process.env.GRAPHY_SKIP_DBR_TESTS? {}: {
				'validate': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --validate
					`,
				}),

				'reader outputs line-delimited JSON to stdout': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --validate
						}
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'+filter subject terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --subject="dbr:Banana"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'-filter subject terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --subject="dbr:absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(0)),
				}),

				'+filter predicate terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --predicate="rdf:type"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'-filter predicate terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --predicate="rdf:absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(0)),
				}),

				'+filter object terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --object="dbr:Banana"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'-filter object terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --object="dbr:absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(0)),
				}),

				'+filter graph terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --graph="*"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'-filter graph terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --subject="dbo:absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(0)),
				}),

				'+filter subject verbose': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --subject=">http://dbpedia.org/resource/Banana"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'-filter subject verbose': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --subject=">http://dbpedia.org/resource/absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(0)),
				}),

				'+filter predicate verbose': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --predicate=">http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'-filter predicate verbose': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --predicate=">http://www.w3.org/1999/02/22-rdf-syntax-ns#absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(0)),
				}),

				'+filter object verbose': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --object=">http://dbpedia.org/resource/Banana"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'-filter object verbose': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --object=">http://dbpedia.org/resource/absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(0)),
				}),

				'-filter graph verbose': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --graph=">http://dbpedia.org/ontology/absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(0)),
				}),

				'+filter not 1 subject terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-subject="dbr:Banana"
					`,
					out: validate_json(a_rows => expect(a_rows.filter(g => 'http://dbpedia.org/resource/Banana' === g.subject)).to.have.lengthOf(0)),
				}),

				'+filter not 2 subjects terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-subject="dbr:Banana" --not-subject="dbr:Bananas"
					`,
					out: validate_json(a_rows => expect(a_rows.filter(g => 'http://dbpedia.org/resource/Banana' === g.subject || 'http://dbpedia.org/resource/Bananas' === g.subject)).to.have.lengthOf(0)),
				}),

				'-filter not 1 subject terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-subject="dbr:absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'+filter not 1 predicate terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-subject="rdf:type"
					`,
					out: validate_json(a_rows => expect(a_rows.filter(g => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' === g.predicate)).to.have.lengthOf(0)),
				}),

				'+filter not 2 predicates terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-subject="rdf:type" --not-subject="rdfs:label"
					`,
					out: validate_json(a_rows => expect(a_rows.filter(g => 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' === g.subject || 'http://www.w3.org/2000/01/rdf-schema#label' === g.subject)).to.have.lengthOf(0)),
				}),

				'-filter not 1 predicate terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-predicate="rdf:absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'+filter not 1 object terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-object="dbr:Banana"
					`,
					out: validate_json(a_rows => expect(a_rows.filter(g => 'http://dbpedia.org/resource/Banana' === g.object)).to.have.lengthOf(0)),
				}),

				'+filter not 2 objects terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-object="dbr:Banana" --not-object="dbr:Bananas"
					`,
					out: validate_json(a_rows => expect(a_rows.filter(g => 'http://dbpedia.org/resource/Banana' === g.object || 'http://dbpedia.org/resource/Bananas' === g.object)).to.have.lengthOf(0)),
				}),

				'-filter not 1 object terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-object="dbr:absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

				'+filter not 1 graph terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-graph="*"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(0)),
				}),

				'-filter not 1 graph terse': () => ({
					cmd: /* syntax: bash */ `
						cat build/cache/data/dbr/Banana.ttl
							| npx graphy content.ttl.read --not-graph="dbr:absent"
					`,
					out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
				}),

			},

			...['nt', 'ttl'].reduce((h_out, s_variant) => ({
				...h_out,
				['data variant: '+s_variant]: {
					'read error': () => ({
						cmd: /* syntax: bash */ `
							echo "invalid"
								| npx graphy content.${s_variant}.read
						`,
						exit: true,
						...('ttl' === s_variant
							? {err:/expected statement/i}
							: {}),
					}),

					'invalid': () => ({
						cmd: /* syntax: bash */ `
							echo "<z://y/This> <z://y/is> <z://y/Bad input> ."
								| npx graphy content.${s_variant}.read --validate
						`,
						exit: true,
					}),

					'allowed': () => ({
						cmd: /* syntax: bash */ `
							echo "<z://y/This> <z://y/is> <z://y/allowed input> ."
								| npx graphy content.${s_variant}.read
						`,
						out: validate_json(a_rows => expect(a_rows).to.have.lengthOf(1)),
					}),
				},
			}), {}),

			'util.dataset.tree': {
				...process.env.GRAPHY_SKIP_DBR_TESTS
					? {}
					: {
						'outputs line-delimited JSON to stdout': () => ({
							cmd: /* syntax: bash */ `
								cat build/cache/data/dbr/Banana.ttl
									| npx graphy content.ttl.read
										--pipe util.dataset.tree
							`,
							out: validate_json(a_rows => expect(a_rows).to.have.lengthOf.above(1)),
						}),
					},

				'.union()': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --union
							--inputs <(echo '${st_left}') <(echo '${st_right}')
					`,
					out: validate_json(triples({
						'demo:Banana': {
							a: 'demo:Fruit',
						},
						'demo:Fruit': {
							a: 'demo:Food',
						},
						'demo:Watermelon': {
							a: 'demo:Fruit',
						},
					})),
				}),

				'.intersection()': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --intersection
							--inputs <(echo '${st_left}') <(echo '${st_right}')
					`,
					out: validate_json(triples({
						'demo:Fruit': {
							a: 'demo:Food',
						},
					})),
				}),

				'.difference()': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --difference
							--inputs <(echo '${st_left}') <(echo '${st_right}')
					`,
					out: validate_json(triples({
						'demo:Banana': {
							a: 'demo:Fruit',
						},
						'demo:Watermelon': {
							a: 'demo:Fruit',
						},
					})),
				}),

				'.minus()': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --minus
							--inputs <(echo '${st_left}') <(echo '${st_right}')
					`,
					out: validate_json(triples({
						'demo:Banana': {
							a: 'demo:Fruit',
						},
					})),
				}),

				'.canonicalize()': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --canonicalize
							--pipe util.dataset.tree --difference
							--inputs <(echo '${st_blank_1}') <(echo '${st_blank_2}')
					`,
					out: validate_json(a_rows => expect(a_rows).to.be.empty),
				}),

				'.contains() = false': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --contains
							--inputs <(echo '${st_left}') <(echo '${st_right}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.false),
				}),

				'.contains() = true': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --contains
							--inputs <(echo '${st_left}') <(echo '${st_left}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.true),
				}),

				'.disjoint() = false': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --disjoint
							--inputs <(echo '${st_left}') <(echo '${st_right}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.false),
				}),

				'.disjoint() = true': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --disjoint
							--inputs <(echo '${st_left}') <(echo '${st_blank_1}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.true),
				}),

				'.equals() = false': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --equals
							--inputs <(echo '${st_blank_1}') <(echo '${st_blank_2}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.false),
				}),

				'.equals() = true': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree --equals
							--inputs <(echo '${st_blank_1}') <(echo '${st_blank_1}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.true),
				}),

				'.canonicalize/.contains() = false': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree -z
							--pipe util.dataset.tree --contains
							--inputs <(echo '${st_left}') <(echo '${st_right}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.false),
				}),

				'.canonicalize/.contains() = true': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree -z
							--pipe util.dataset.tree --contains
							--inputs <(echo '${st_blank_1}') <(echo '${st_blank_2}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.true),
				}),

				'.canonicalize/.disjoint() = false': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree -z
							--pipe util.dataset.tree --disjoint
							--inputs <(echo '${st_left}') <(echo '${st_right}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.false),
				}),

				'.canonicalize/.disjoint() = true': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree -z
							--pipe util.dataset.tree --disjoint
							--inputs <(echo '${st_left}') <(echo '${st_blank_1}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.true),
				}),

				'.canonicalize/.equals() = false': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree -z
							--pipe util.dataset.tree --equals
							--inputs <(echo '${st_blank_1}') <(echo '${st_right}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.false),
				}),

				'.canonicalize/.equals() = true': () => ({
					cmd: /* syntax: bash */ `
						npx graphy content.ttl.read
							--pipe util.dataset.tree -z
							--pipe util.dataset.tree --equals
							--inputs <(echo '${st_blank_1}') <(echo '${st_blank_2}')
					`,
					out: validate_json(a_rows => expect(a_rows[0]).to.be.true),
				}),
			},

			...['nt', 'nq', 'ttl', 'trig'].reduce((h_out, s_variant) => ({
				...h_out,
				['content.'+s_variant+'.write']: {
					'direct': () => ({
						cmd: /* syntax: bash */ `
							npx graphy content.ttl.read
								--pipe content.${s_variant}.write
								--inputs <(echo '${st_left}')
						`,
						out: s_stdout => expect(s_stdout).to.equal(util.gobble(({
							nt: /* syntax: n-triples */ `
								<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
								<http://ex.org/Fruit> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Food> .
							`,
							nq: /* syntax: n-quads */ `
								<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
								<http://ex.org/Fruit> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Food> .
							`,
							ttl: /* syntax: turtle */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								demo:Banana rdf:type demo:Fruit .
								
								demo:Fruit rdf:type demo:Food .
							`,
							trig: /* syntax: trig */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								{
									demo:Banana rdf:type demo:Fruit .
								}

								{
									demo:Fruit rdf:type demo:Food .
								}
							`,
						})[s_variant])),
					}),

					'after union': () => ({
						cmd: /* syntax: bash */ `
							npx graphy content.ttl.read
								--pipe util.dataset.tree --union
								--pipe content.${s_variant}.write
								--inputs <(echo '${st_left}') <(echo '${st_right}')
						`,
						out: s_stdout => expect(s_stdout).to.equal(util.gobble(({
							nt: /* syntax: n-triples */ `
								<http://ex.org/Fruit> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Food> .
								<http://ex.org/Watermelon> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
								<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
							`,
							nq: /* syntax: n-quads */ `
								<http://ex.org/Fruit> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Food> .
								<http://ex.org/Watermelon> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
								<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
							`,
							ttl: /* syntax: turtle */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								demo:Fruit rdf:type demo:Food .
								
								demo:Watermelon rdf:type demo:Fruit .

								demo:Banana rdf:type demo:Fruit .
							`,
							trig: /* syntax: trig */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								{
									demo:Fruit rdf:type demo:Food .
								}
								
								{
									demo:Watermelon rdf:type demo:Fruit .
								}

								{
									demo:Banana rdf:type demo:Fruit .
								}
							`,
						})[s_variant])),
					}),

					'after intersection': () => ({
						cmd: /* syntax: bash */ `
							npx graphy content.ttl.read
								--pipe util.dataset.tree --intersection
								--pipe content.${s_variant}.write
								--inputs <(echo '${st_left}') <(echo '${st_right}')
						`,
						out: s_stdout => expect(s_stdout).to.equal(util.gobble(({
							nt: /* syntax: n-triples */ `
								<http://ex.org/Fruit> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Food> .
							`,
							nq: /* syntax: n-quads */ `
								<http://ex.org/Fruit> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Food> .
							`,
							ttl: /* syntax: turtle */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								demo:Fruit rdf:type demo:Food .
							`,
							trig: /* syntax: trig */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								{
									demo:Fruit rdf:type demo:Food .
								}
							`,
						})[s_variant])),
					}),

					'after difference': () => ({
						cmd: /* syntax: bash */ `
							npx graphy content.ttl.read
								--pipe util.dataset.tree --difference
								--pipe content.${s_variant}.write
								--inputs <(echo '${st_left}') <(echo '${st_right}')
						`,
						out: s_stdout => expect(s_stdout).to.equal(util.gobble(({
							nt: /* syntax: n-triples */ `
								<http://ex.org/Watermelon> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
								<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
							`,
							nq: /* syntax: n-quads */ `
								<http://ex.org/Watermelon> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
								<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
							`,
							ttl: /* syntax: turtle */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								demo:Watermelon rdf:type demo:Fruit .

								demo:Banana rdf:type demo:Fruit .
							`,
							trig: /* syntax: trig */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								{
									demo:Watermelon rdf:type demo:Fruit .
								}

								{
									demo:Banana rdf:type demo:Fruit .
								}
							`,
						})[s_variant])),
					}),

					'after minus': () => ({
						cmd: /* syntax: bash */ `
							npx graphy content.ttl.read
								--pipe util.dataset.tree --minus
								--pipe content.${s_variant}.write
								--inputs <(echo '${st_left}') <(echo '${st_right}')
						`,
						out: s_stdout => expect(s_stdout).to.equal(util.gobble(({
							nt: /* syntax: n-triples */ `
								<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
							`,
							nq: /* syntax: n-quads */ `
								<http://ex.org/Banana> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://ex.org/Fruit> .
							`,
							ttl: /* syntax: turtle */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								demo:Banana rdf:type demo:Fruit .
							`,
							trig: /* syntax: trig */ `
								@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .
								@prefix demo: <http://ex.org/> .

								{
									demo:Banana rdf:type demo:Fruit .
								}
							`,
						})[s_variant])),
					}),
				},
			}), {}),

			'boolean results': {

			},
		});

	});
}
