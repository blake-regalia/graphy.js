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
			'flavors-minify: dist/',
		],

		web: [
			'bundle: webapp/',
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

		// webapp development
		bundle: [
			'[all]: less pug browserify copy',
			'less',
			'pug',
			'browserify',
			'copy',
			'browser-sync: all',
			'develop: all',
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

		less: {
			watch: '**/*.less',
			rename: h => h.dirname = './styles',
		},
		pug: {
			watch: '**/*.pug',
			// rename: h => h.dirname = h.dirname.replace(/^src/, '.'),
		},
		browserify: {
			watch: '**/*.js',
			src: '_scripts',
			rename: h => h.dirname = path.join('scripts', h.dirname),
		},
	},

	//
	aliases: {
		test: ['mocha'],
	},
});

