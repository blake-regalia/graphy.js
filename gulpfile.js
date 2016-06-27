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
			'n3-minify: dist',
			'n3: dist.es6'
		],
		debug: [
			'es5: dist',
			'es6: dist.es6',
		],
		routers: 'routing',
	},

	//
	range: {
		'n3-minify': [
			'n3',
			'develop: n3',
		],

		n3: [
			'n3',
			'develop: n3',
			'istanbul',
			'mocha:istanbul',
		],

		es5: [
			'transpile',
			'develop: transpile',
		],

		es6: [
			'copy',
			'develop: copy',
		],

		routing: [
			'routing',
			'develop: routing',
		],
	},

	//
	options: {
		'*': {
			test_src: [
				'test/parsers/ttl.js',
				'test/parsers/trig.js',
				'test/parsers/nt.js',
				'test/parsers/nq.js',
				'test/main/data-factory.js',
			],
		},
		'n3-flavors-n3-minify': {
			minify: true,
		},
		routing: {
			map: {
				'ttl.js': 'ttl',
				'index.js': 'dist',
			},
		},
	},

	//
	aliases: {
		test: ['mocha'],
	},
});
