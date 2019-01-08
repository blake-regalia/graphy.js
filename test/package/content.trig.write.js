/* eslint-env mocha */
const expect = require('chai').expect;

const factory = require('@graphy/core.data.factory');
const stream = require('@graphy/core.iso.stream');
const dataset_tree = require('@graphy/util.dataset.tree');
const trig_read = require('@graphy/content.trig.read');

const trig_write = require('@graphy/content.trig.write');

const H_PREFIXES = {
	'': 'z://y/',
	xsd: 'http://www.w3.org/2001/XMLSchema#',
};


const normalize = st_doc => stream.source(st_doc)
	// read document
	.pipe(trig_read({
		prefixes: H_PREFIXES,
	}))
	// canonicalize in dataset
	.pipe(dataset_tree({
		canonicalize: true,
	}))
	// serialize to turtle
	.pipe(trig_write({
		prefixes: H_PREFIXES,
	}))
	// return accumulated result
	.bucket();

const write = async(hc4_input, st_validate, gc_write={}) => {
	// take concise-triples hash
	let st_output = await stream.source({
		type: 'c4',
		value: hc4_input,
	})
		// pipe it thru turtle writer
		.pipe(trig_write({
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



describe('collections', () => {
	it('long collections', async() => {
		let a_items = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

		await write({
			'>z': {
				'>a': {
					'>b': [a_items.map(s => `"${s}`)],
				},
			},
		}, `
			<z> {
				<a> <b> (${a_items.map(s => `"${s}" `).join(' ')}) .
			}
		`);
	});

	it('recursive collections', async() => {
		await write({
			'>z': {
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
			},
		}, `
			<z> {
				<a> <b> (
					"a" "b" "c" (
						"D" "E" "F" (
							"g" "h" "i"
						) "G" "H" "I"
					)
				) .
			}
		`);
	});

	it('nested anonymous blank node lists inside collections', async() => {
		await write({
			'>z': {
				'>a': {
					'>b': [[
						{
							'>c': '>d',
							'>e': ['>f', '>g'],
							'>h': [['>i', '>j'], '>k'],
						},
					]],
				},
			},
		}, /* syntax: trig */ `
			<z> {
				<a> <b> (
					[
						<c> <d> ;
						<e> <f>, <g> ;
						<h> (<i> <j>), <k> ;
					]
				) .
			}
		`);
	});

	it('custom collections', async() => {
		await write({
			'>z': {
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
			},
		}, /* syntax: trig */ `
			<z> {
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
			}
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
			'>z': {
				'>a': {
					'>b': [a_items.map(s => '"'+s)],
				},
			},
		}, /* syntax: trig */ `
			<z> {
				<a> <b> ${f_nt(a_items)}
				.
			}
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
			'>z': {
				'>a': {
					'>b': [
						['>c', ['>d', ['>e']]],
					],
				},
			},
		}, /* syntax: trig */ `
			<z> {
				<a> <b> (<c> (<d> (<e>)))
				.
			}
		`);
	});
});

