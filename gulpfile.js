const gulp = require('gulp');
const soda = require('gulp-soda');


soda(gulp, {

	inputs: {
		main: 'node',
		parsing: 'node',
		isomorphic: 'node',
		bat: 'node',
		store: 'node',
		debug: 'node',

		formats: 'formats',
		gen: 'compile',
	},


	targets: {
		node: [
			'macro',
			'develop: macro',
		],

		formats: [
			'formats',
			'develop: formats',
			'istanbul',
			'mocha:istanbul',
		],

		compile: [
			'compile',
			'develop: compile',
		],
	},

	//
	options: {
		'*': {
			test_src: [
				'test/parsers/ttl.js',
				// 'test/parsers/trig.js',
				// 'test/parsers/nt.js',
				// 'test/parsers/nq.js',
				// 'test/main/data-factory.js',
				// 'test/specs/ttl.js',
			],
		},
		'formats-formats-formats-minify': {
			minify: true,
		},
		'macro-main-es5': {
			minify: true,
		},
	},

	//
	aliases: {
		test: ['mocha'],
	},
});


