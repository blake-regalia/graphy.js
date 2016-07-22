const gulp = require('gulp');
const soda = require('gulp-soda');

soda(gulp, {

	//
	domain: {
		main: [
			'es5: dist',
			'es6: dist.es6',
		],
		flavors: [
			'flavors-minify: dist',
			'flavors: dist.es6'
		],
		debug: [
			'es6: dist.es6',
		],
	},

	//
	range: {
		es5: [
			'transpile-macro',
			'develop: transpile-macro',
		],

		es6: [
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
				// 'test/parsers/ttl.js',
				// 'test/parsers/trig.js',
				// 'test/parsers/nt.js',
				// 'test/parsers/nq.js',
				'test/main/data-factory.js',
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
