/* eslint-env mocha */
/* eslint indent: 1 */
const assert = require('assert');
const eq = assert.strictEqual;
const deq = assert.deepEqual;

const graphy = require('graphy');

const ST_PREFIXES = /* syntax: turtle */ `
	@prefix : <> .
	@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
`;

const write = (h_triples, st_verify) => new Promise((fk_test) => {
    let k_set_expected = graphy.set();

    graphy.ttl.parser({input:ST_PREFIXES+st_verify})
        .pipe(k_set_expected)
        .on('finish', () => {
            let k_set_actual = graphy.set(null, {debug:true});

            let k_writer = graphy.ttl.writer({
                prefixes: {'':''},
                indent: '    ',
                trailling: true,
            });

            // k_writer.pipe(process.stdout);

            k_writer
                .pipe(graphy.ttl.parser())
                .pipe(k_set_actual)
                .on('finish', () => {
                    eq(k_set_actual.canonicalize(), k_set_expected.canonicalize());
                    fk_test();
                });

            k_writer.add(h_triples);
            k_writer.end();
        });
});

const comment = () => graphy.comment({
    width: 100,
    border: {
        char: '*',
        top: 1,
        bottom: 1,
    },
    indent: '    ',
});


let h_tests = {
    basic: {
        'absolute IRIs': {
            write: {
                [comment()]: 'start at the top',
                '>s0': {
                    [comment()]: 'i_p: 0, ',
                    [comment()]: 'following comment',
                    '>pa0': '>oa0',
                    [comment()]: 'i_p: 1, ',
                    [comment()]: 'following comment',
                    '>pa1': ['>oa0'],
                    [comment()]: 'i_p: 2, ',
                    [comment()]: 'following comment',
                    '>pa2': ['>oa0', '>oa1'],
                    [comment()]: 'i_p: 3, ',
                    [comment()]: 'following comment',
                    '>pa3': ['>oa0', '>oa1', '>oa2'],
                    [comment()]: 'i_p: 4, /b, ',
                    [comment()]: 'following comment',
                    '>pa4': {
                        [comment()]: 'i_p: 0, ',
                        [comment()]: 'following comment',
                        '>pb0': '>ob0',
                        [comment()]: 'i_p: 1, ',
                        [comment()]: 'following comment',
                        '>pb1': ['>ob0'],
                        [comment()]: 'i_p: 2, ',
                        [comment()]: 'following comment',
                        '>pb2': ['>ob0', '>ob1'],
                        [comment()]: 'i_p: 3, ',
                        [comment()]: 'following comment',
                        '>pb3': ['>ob0', '>ob1', '>ob2'],
                        [comment()]: 'i_p: 4, /c, ',
                        [comment()]: 'following comment',
                        '>pb4': {
                            [comment()]: 'i_p: 0, ',
                            [comment()]: 'following comment',
                            '>pc0': '>oc0',
                            [comment()]: 'i_p: 1, ',
                            [comment()]: 'following comment',
                            '>pc1': ['>oc0'],
                            [comment()]: 'i_p: 2, ',
                            [comment()]: 'following comment',
                            '>pc2': ['>oc0', '>oc1'],
                            [comment()]: 'i_p: 3, ',
                            [comment()]: 'following comment',
                            '>pc3': ['>oc0', '>oc1', '>oc2'],

                        },
                        [comment()]: 'i_p: 5, ',
                        [comment()]: 'following comment',
                        '>pb5': [
                            '>on0',
                            ['>on1'],
                            ['>on2', '>on3'],
                            ['>on4', '>on5', '>on6'],
                            {
                                [comment()]: 'i_p: 0, ',
                                [comment()]: 'following comment',
                                '>pd0': '>od0',
                                [comment()]: 'i_p: 1, ',
                                [comment()]: 'following comment',
                                '>pd1': ['>od0'],
                                [comment()]: 'i_p: 2, ',
                                [comment()]: 'following comment',
                                '>pd2': ['>od0', '>od1'],
                                [comment()]: 'i_p: 3, ',
                                [comment()]: 'following comment',
                                '>pd3': ['>od0', '>od1', '>od2'],

                            },
                        ],

                    },
                    [comment()]: 'i_p: 5, ',
                    [comment()]: 'following comment',
                    '>pa5': [
                        '>on0',
                        ['>on1'],
                        ['>on2', '>on3'],
                        ['>on4', '>on5', '>on6'],
                        {
                            [comment()]: 'i_p: 0, ',
                            [comment()]: 'following comment',
                            '>pc0': '>oc0',
                            [comment()]: 'i_p: 1, ',
                            [comment()]: 'following comment',
                            '>pc1': ['>oc0'],
                            [comment()]: 'i_p: 2, ',
                            [comment()]: 'following comment',
                            '>pc2': ['>oc0', '>oc1'],
                            [comment()]: 'i_p: 3, ',
                            [comment()]: 'following comment',
                            '>pc3': ['>oc0', '>oc1', '>oc2'],
                            [comment()]: 'i_p: 4, /d, ',
                            [comment()]: 'following comment',
                            '>pc4': {
                                [comment()]: 'i_p: 0, ',
                                [comment()]: 'following comment',
                                '>pd0': '>od0',
                                [comment()]: 'i_p: 1, ',
                                [comment()]: 'following comment',
                                '>pd1': ['>od0'],
                                [comment()]: 'i_p: 2, ',
                                [comment()]: 'following comment',
                                '>pd2': ['>od0', '>od1'],
                                [comment()]: 'i_p: 3, ',
                                [comment()]: 'following comment',
                                '>pd3': ['>od0', '>od1', '>od2'],

                            },
                            [comment()]: 'i_p: 5, ',
                            [comment()]: 'following comment',
                            '>pc5': [
                                '>on0',
                                ['>on1'],
                                ['>on2', '>on3'],
                                ['>on4', '>on5', '>on6'],
                                {
                                    [comment()]: 'i_p: 0, ',
                                    [comment()]: 'following comment',
                                    '>pe0': '>oe0',
                                    [comment()]: 'i_p: 1, ',
                                    [comment()]: 'following comment',
                                    '>pe1': ['>oe0'],
                                    [comment()]: 'i_p: 2, ',
                                    [comment()]: 'following comment',
                                    '>pe2': ['>oe0', '>oe1'],
                                    [comment()]: 'i_p: 3, ',
                                    [comment()]: 'following comment',
                                    '>pe3': ['>oe0', '>oe1', '>oe2'],

                                },
                            ],

                        },
                    ],

                },
            },
            expect: `
				<a> <b> <c> .
			`,
        },

        'prefixed names': {
            write: {':a':{':b':':c'}},
            expect: `
				<a> <b> <c> .
			`,
        },

        coercions: (() => {
            let dt_now = new Date();
            return {
                write: {
                    ':coerce': {
                        ':integer': 42,
                        ':decimal': 4.2,
                        ':dateTime': dt_now,
                    },
                },
                expect: `
					:coerce :integer 42 ;
						:decimal 4.2 ;
						:dateTime "${dt_now.toISOString()}"^^xsd:dateTime ;
					.
				`,
            };
        })(),
    },
};

for(let s_describe in h_tests) {
    let h_cases = h_tests[s_describe];
    describe(s_describe, () => {
        for(let s_it in h_cases) {
            let g_test = h_cases[s_it];
            it(s_it, async() => await write(g_test.write, g_test.expect));
        }
    });
}
