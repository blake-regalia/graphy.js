/* eslint-env mocha */
const assert = require('assert');

const S_GRAPHY_CHANNEL = `@${process.env.GRAPHY_CHANNEL || 'graphy'}`;
const data_set = require(`${S_GRAPHY_CHANNEL}/api.data.set`);
const trig_read = require(`${S_GRAPHY_CHANNEL}/content.trig.read`);

const trig_write = require(`${S_GRAPHY_CHANNEL}/content.trig.write`);

const H_PREFIXES = {
	'': '',
};

const doc_as_set = st_doc => new Promise((fk_set) => {
	// parse expected document
	trig_read({
		prefixes: H_PREFIXES,
		input: {
			string: st_doc,
		},
	})
		// create then return set
		.pipe(data_set({
			ready(k_set) {
				fk_set(k_set);
			},
		}));
});

const write = (hc4_input, st_expected, gc_write={}) => new Promise((fk_write) => {
	let k_writer = trig_write({
		prefixes: H_PREFIXES,
		...gc_write,
	});

	// output string
	let st_output = '';
	k_writer.setEncoding('utf8');
	k_writer
		.on('data', (s_chunk) => {
			st_output += s_chunk;
		})
		.on('end', async() => {
			// parse result document
			let k_result = await doc_as_set(st_output);

			// parse expected document
			let k_expected = await doc_as_set(st_expected);

			// compare
			try {
				assert.strictEqual(k_result.canonicalize(), k_expected.canonicalize());
			}
			catch(e_equal) {
				// console.warn(k_result);
				throw e_equal;
			}

			fk_write();
		});

	// write to turtle document
	k_writer.write({
		type: 'c4',
		value: hc4_input,
	});

	// close document without waiting for drain
	k_writer.end();
});


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

