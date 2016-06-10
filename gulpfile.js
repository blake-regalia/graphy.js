
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
		ttl: 'builder-js',
	},

	//
	range: {
		'builder-js': [
			'builder',
			'[test]: mocha',
			'mocha: istanbul',
			'istanbul: transpile',
			'transpile:builder',
			'develop:builder',
		],
	},

	//
	options: {
		'*': {
			test_src: 'test/basic/*.js',
		},
	},
});
