// native imports
import path from 'path';

// gulp & gulp-specific plugins
import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-istanbul';
import plumber from 'gulp-plumber';

import eslint from 'gulp-eslint';
import excludeGitignore from 'gulp-exclude-gitignore';
import nsp from 'gulp-nsp';
import coveralls from 'gulp-coveralls';

// general libraries
import del from 'del';
import {Instrumenter} from 'isparta';

// local config
import compileConfig from './.compileconfig.json';

// static
gulp.task('static', () => {
	return gulp.src('lib/index.js')
		.pipe(excludeGitignore())
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

// nsp
gulp.task('nsp', (cb) => {
	nsp('package.json', cb);
});

// pre-test
gulp.task('pre-test', () => {
	return gulp.src('lib/**/*.js')
		.pipe(istanbul({
			includeUntested: true,
			instrumenter: Instrumenter
		}))
		.pipe(istanbul.hookRequire());
});

// test
gulp.task('test', ['pre-test'], (cb) => {
	let mochaErr;
	gulp.src('test/**/*.js')
		.pipe(plumber())
		.pipe(mocha({reporter: 'spec'}))
		.on('error', (err) => {
			mochaErr = err;
		})
		.pipe(istanbul.writeReports())
		.on('end', () => {
			cb(mochaErr);
		});
});

// coveralls
gulp.task('coveralls', ['test'], () => {
	if (!process.env.CI) {
		return;
	}
	return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
		.pipe(coveralls());
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
		return gulp.src('./lib/'+s_directory+'/*.js')
			.pipe(babel())
			.pipe(gulp.dest('./dist/'+s_directory));
	});
});

// transpile source code using babel
gulp.task('babel', compileConfig.transpile.map(s_directory => 'build-'+s_directory));

// prepublish
gulp.task('prepublish', ['babel']);

// default
gulp.task('default', ['babel']);
