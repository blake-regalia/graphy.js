/* eslint-env mocha */
const expect = require('chai').expect;

const S_GRAPHY_CHANNEL = `@${process.env.GRAPHY_CHANNEL || 'graphy'}`;
const factory = require(`${S_GRAPHY_CHANNEL}/core.data.factory`);
const stream = require(`${S_GRAPHY_CHANNEL}/core.iso.stream`);
const dataset_tree = require(`${S_GRAPHY_CHANNEL}/util.dataset.tree`);
const ttl_read = require(`${S_GRAPHY_CHANNEL}/content.ttl.read`);

const ttl_write = require(`${S_GRAPHY_CHANNEL}/content.ttl.write`);

const H_PREFIXES = {
	'': 'z://y/',
	xsd: 'http://www.w3.org/2001/XMLSchema#',
};

const normalize = st_doc => stream.source(st_doc)
	// read document
	.pipe(ttl_read())
	// canonicalize in dataset
	.pipe(dataset_tree({
		canonicalize: true,
	}))
	// serialize to turtle
	.pipe(ttl_write({
		prefixes: H_PREFIXES,
	}))
	// return accumulated result
	.bucket();

const write = async(hc3_input, st_validate, gc_write={}) => {
	// take concise-triples hash
	let st_output = await stream.source({
		type: 'c3',
		value: hc3_input,
	})
		// pipe it thru turtle writer
		.pipe(ttl_write({
			prefixes: H_PREFIXES,
			...gc_write,
		}))

		// accumulate its output
		.bucket();

	// canonicalize output
	let st_result = await normalize(st_output);

	// canonicalize expectation
	let st_expect = await normalize(`
		@prefix : <${H_PREFIXES['']}> .
		@prefix xsd: <${H_PREFIXES.xsd}> .
		${st_validate}`);

	// assertion
	expect(st_result).to.equal(st_expect);
};

describe('objects', () => {
	it('c1 strings', async() => {
		await write({
			':subject': {
				a: ':type',
				':c1-bn-anon': '_:',
				':c1-bn-labeled': '_:orange',
				':c1-pn': ':object',
				':c1-iri': '>z://object',
				':c1-literal': '"object',
				':c1-lang-literal': '@en"object',
				':c1-dtype-literal-pn': '^:d"object',
				':c1-dtype-literal-iri': '^>x://d"object',
			},
		}, `
			:subject a :type ;
				:c1-bn-anon [] ;
				:c1-bn-labeled _:orange ;
				:c1-pn :object ;
				:c1-iri <z://object> ;
				:c1-literal "object" ;
				:c1-lang-literal "object"@en ;
				:c1-dtype-literal-pn "object"^^:d ;
				:c1-dtype-literal-iri "object"^^<x://d> .
		`);
	});

	it('es literals', async() => {
		await write({
			':subject': {
				':false': false,
				':true': true,
				':zero': 0,
				':integer': 12,
				':decimal': 12.1,
				':infinity': Infinity,
				':negative-infinity': -Infinity,
				':NaN': NaN,
			},
		}, `
			:subject
				:false false ;
				:true true ;
				:zero 0 ;
				:integer 12 ;
				:decimal 12.1 ;
				:infinity "INF"^^xsd:double ;
				:negative-infinity "-INF"^^xsd:double ;
				:NaN "NaN"^^xsd:double .
		`);
	});

	it('special objects', async() => {
		await write({
			':subject': {
				':date': new Date('1990-03-12'),
				':term-node': factory.namedNode('ex://test'),
				':term-bn': factory.blankNode('test'),
				':literal': factory.literal('test'),
			},
		}, `
			:subject
				:date "1990-03-12T00:00:00.000Z"^^xsd:dateTime ;
				:term-node <ex://test> ;
				:term-bn _:test ;
				:literal "test" .
		`);
	});

	it('object lists', async() => {
		await write({
			':subject': {
				':list-c1-nodes': ['_:', '_:orange', ':object', '>z://object'],
				':list-c1-literals': ['@en"object', '^:d"object', '^>x://d"object'],
				':list-es-literals': [false, true, 0, 12, 12.1, Infinity, -Infinity, NaN],
				':es-set-nodes': new Set([':a', ':b', ':c']),
			},
		}, `
			:subject
				:list-c1-nodes [], _:orange, :object, <z://object> ;
				:list-c1-literals "object"@en, "object"^^:d, "object"^^<x://d> ;
				:list-es-literals false, true, 0, 12, 12.1, "INF"^^xsd:double, "-INF"^^xsd:double, "NaN"^^xsd:double ;
				:es-set-nodes :a, :b, :c .
		`);
	});

	it('nested blank nodes', async() => {
		await write({
			':subject': {
				':nested-blank': {},
				':nested-single': {
					':prop': ':object',
				},
				':nested-multiple': {
					':prop1': ':object',
					':prop2': ':object',
				},
				':nested-recursive-1': {
					':prop1': ':object',
					':prop2': {
						':recurse1': ':object',
					},
				},
			},
		}, `
			:subject
				:nested-blank [] ;
				:nested-single [
					:prop :object ;
				] ;
				:nested-multiple [
					:prop1 :object ;
					:prop2 :object ;
				] ;
				:nested-recursive-1 [
					:prop1 :object ;
					:prop2 [
						:recurse1 :object ;
					] ;
				] .
		`);
	});
});

describe('collections', () => {
	it('long collections', async() => {
		let a_items = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

		await write({
			'>a': {
				'>b': [a_items.map(s => `"${s}`)],
			},
		}, `
			<a> <b> (${a_items.map(s => `"${s}" `).join(' ')}) .
		`);
	});

	it('recursive collections', async() => {
		await write({
			'>a': {
				'>b': [[
					'"a', '"b', '"c', [
						'"D', '"E', '"F', [
							'"g', '"h', '"i',
						],
						'"G', '"H', '"I',
					],
				]],
			},
		}, `
			<a> <b> (
				"a" "b" "c" (
					"D" "E" "F" (
						"g" "h" "i"
					) "G" "H" "I"
				)
			) .
		`);
	});

	it('nested anonymous blank node lists inside collections', async() => {
		await write({
			'>a': {
				'>b': [[
					{
						'>c': '>d',
						'>e': ['>f', '>g'],
						'>h': [['>i', '>j'], '>k'],
					},
				]],
			},
		}, /* syntax: turtle */ `
			<a> <b> (
				[
					<c> <d> ;
					<e> <f>, <g> ;
					<h> (<i> <j>), <k> ;
				]
			) .
		`);
	});

	it('custom collections', async() => {
		await write({
			'>a': {
				'>b': [[
					'"a', '"b', '"c', [
						'"D', '"E', '"F', [
							'"g', '"h', '"i',
						],
						'"G', '"H', '"I',
					],
				]],
			},
		}, /* syntax: turtle */ `
			<a> <b> [
				<first> "a" ;
				<rest> [
					<first> "b" ;
					<rest> [
						<first> "c" ;
						<rest> [
							<first> [
								<first> "D" ;
								<rest> [
									<first> "E" ;
									<rest> [
										<first> "F" ;
										<rest> [
											<first> [
												<first> "g" ;
												<rest> [
													<first> "h" ;
													<rest> [
														<first> "i" ;
														<rest> <nil> ;
													] ;
												] ;
											] ;
											<rest> [
												<first> "G" ;
												<rest> [
													<first> "H" ;
													<rest> [
														<first> "I" ;
														<rest> <nil>
													] ;
												] ;
											] ;
										] ;
									] ;
								] ;
							] ;
							<rest> <nil> ;
						] ;
					] ;
				] ;
			] .
		`, {
			collections: {
				first: '>first',
				rest: '>rest',
				nil: '>nil',
			},
		});
	});

	it('long custom collections', async() => {
		let a_items = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

		let f_nt = a_rest => /* syntax: turtle */ `[
			<first> "${a_rest.shift()}" ;
			<rest> ${a_rest.length? f_nt(a_rest): '<nil>'} ;
		]`;

		await write({
			'>a': {
				'>b': [a_items.map(s => '"'+s)],
			},
		}, /* syntax: turtle */ `
			<a> <b> ${f_nt(a_items)}
			.
		`, {
			collections: {
				first: '>first',
				rest: '>rest',
				nil: '>nil',
			},
		});
	});
});


describe('write mechanism', () => {

	it('end without awaiting for drain', () => async() => {
		await write({
			'>a': {
				'>b': [
					['>c', ['>d', ['>e']]],
				],
			},
		}, /* syntax: turtle */ `
			<a> <b> (<c> (<d> (<e>)))
			.
		`);
	});
});

