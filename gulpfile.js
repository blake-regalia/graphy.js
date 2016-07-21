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
			'transpile',
			'develop: transpile',
		],

		es6: [
			'copy',
			'develop: copy',
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
		'parsers-flavors-parsers-minify': {
			minify: true,
		},
	},

	//
	aliases: {
		test: ['mocha'],
	},
});
