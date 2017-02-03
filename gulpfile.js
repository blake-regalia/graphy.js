const gulp = require('gulp');
const soda = require('gulp-soda');


soda(gulp, {
	
	inputs: {
		main: 'node',
		store: 'node',
		debug: 'node',

		flavors: [
			'flavors',
			// 'flavors-minify: dist/',
		],

		gen: 'compile',
	},


	targets: {
		node: [
			'transpile-macro',
			'develop: transpile-macro',
		],

		'flavors-minify': [
			'flavors',
			'develop: flavors',
		],

		flavors: [
			'flavors',
			'develop: flavors',
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
			],
		},
		'flavors-flavors-flavors-minify': {
			minify: true,
		},
		'transpile-macro-main-es5': {
			minify: true,
		},
	},

	//
	aliases: {
		test: ['mocha'],
	},
});


