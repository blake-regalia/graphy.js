
// gulp
const gulp = require('gulp');
const soda = require('gulp-soda');

// // pre-test
// gulp.task('pre-test', () => {
// 	return gulp.src('lib/**/*.js')
// 		.pipe($.istanbul({
// 			includeUntested: true,
// 			instrumenter: Instrumenter
// 		}))
// 		.pipe($.istanbul.hookRequire());
// });

// // test basic
// gulp.task('test-basic', ['pre-test'], (cb) => {
// 	let mochaErr;
// 	gulp.src('test/basic/*.js')
// 		.pipe($.plumber())
// 		.pipe($.mocha({reporter: 'spec'}))
// 		.on('error', (err) => {
// 			mochaErr = err;
// 		})
// 		.pipe($.istanbul.writeReports())
// 		.on('end', () => {
// 			cb(mochaErr);
// 		});
// });

// // test
// gulp.task('test', ['pre-test', 'test-basic']);

// // coveralls
// gulp.task('coveralls', ['test'], () => {
// 	if (!process.env.CI) {
// 		return;
// 	}
// 	return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
// 		.pipe($.coveralls());
// });

soda(gulp, {

	//
	domain: {
		flavors: [
			'n3-minify: dist',
			'n3: dist.es6'
		],
		graphy: [
			'es5: dist.es5',
			'es6: dist.es6',
		],
		debug: [
			'es5: dist',
			// 'es5: dist.es5',
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
			test_src: 'test/ttl/*.js',
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
