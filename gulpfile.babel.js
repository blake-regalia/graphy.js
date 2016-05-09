// native imports
import path from 'path';

// gulp
import gulp from 'gulp';

// load gulp plugins
import plugins from 'gulp-load-plugins';
const $ = plugins({
	// // uncomment these lines to show debug messages while loading gulp plugins
	// DEBUG: true,

	// load gulp and vinyl modules
	pattern: ['gulp-*', 'vinyl-*'],
	replaceString: /^(?:gulp|vinyl)(-|\.)/,
});

// general libraries
import del from 'del';
import {Instrumenter} from 'isparta';

// local config
import compileConfig from './.compileconfig.json';

// pre-test
gulp.task('pre-test', () => {
	return gulp.src('lib/**/*.js')
		.pipe($.istanbul({
			includeUntested: true,
			instrumenter: Instrumenter
		}))
		.pipe($.istanbul.hookRequire());
});


// test basic
gulp.task('test-basic', ['pre-test'], (cb) => {
	let mochaErr;
	gulp.src('test/basic/*.js')
		.pipe($.plumber())
		.pipe($.mocha({reporter: 'spec'}))
		.on('error', (err) => {
			mochaErr = err;
		})
		.pipe($.istanbul.writeReports())
		.on('end', () => {
			cb(mochaErr);
		});
});


// test
gulp.task('test', ['pre-test', 'test-basic']);

// coveralls
gulp.task('coveralls', ['test'], () => {
	if (!process.env.CI) {
		return;
	}
	return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
		.pipe($.coveralls());
});

// clean
gulp.task('clean', () => {
	return del('dist');
});

// babel
compileConfig.transpile.forEach((s_directory) => {

	// register cleaner
	gulp.task('clean-'+s_directory, () => {
		return del([
			'./dist/'+s_directory,
		]);
	});

	// register builder
	gulp.task('build-'+s_directory, ['clean-'+s_directory], () => {

		// load all javascript source files
		return gulp.src('./lib/'+s_directory+'/*.js')

			// handle uncaught exceptions thrown by any of the plugins that follow
			.pipe($.plumber())

			// do not recompile unchanged files
			.pipe($.cached(`build-${s_directory}`))

			// lint all javascript source files
			.pipe($.eslint())
			.pipe($.eslint.format())

			// // preserve mappings to source files for debugging in es5 runtime
			// .pipe($.sourcemaps.init())

				// transpile es2015 => es5
				.pipe($.babel())
			// .pipe($.sourcemaps.write())

			// write output to dist directory
			.pipe(gulp.dest('./dist/'+s_directory));
	});
});

// transpile source code using babel
gulp.task('babel', compileConfig.transpile.map(s_directory => 'build-'+s_directory));

// prepublish
gulp.task('prepublish', ['babel']);

// default
gulp.task('default', ['babel']);
