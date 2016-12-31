const gulp = require('gulp');
const soda = require('gulp-soda');


soda(gulp, {
	
	inputs: {
		main: [
			'node: dist.es6/',
		],

		debug: [
			'node: dist.es6/',
		],

		flavors: [
			'flavors: dist.es6/',
			// 'flavors-minify: dist/',
		],
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


