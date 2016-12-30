// const path = require('path');

const babelify = require('babelify');
const browserify = require('browserify');

module.exports = function(gulp, $, p_src, p_dest) {

	// load source files
	return gulp.src(p_src+'/**/*.js', {read: false})

		// transform file objects with gulp-tap
		.pipe($.tap((h_file) => {

			// browserify
			h_file.contents = browserify({
				entries: [h_file.path],
				debug: true,
				transform: [
					// transpile down to es5
					babelify.configure({
						presets: ['es2015'],
					}),
					// envify, // Sets NODE_ENV for optimization of certain npm packages
				],
				// cache: {},
				// packageCache: {},
				// plugin: [watchify],
			}).bundle();
		}))

		// //
		// .pipe($.cached(this.task))

		// transform streaming contents into buffer contents
		.pipe($.buffer())

		// // rename
		.pipe($.rename((...a_args) => {
			if(this.options.rename) this.options.rename(...a_args);
		}))

		.pipe($.debug())

		// output
		.pipe(gulp.dest(p_dest));
};


module.exports.dependencies = [
	'babelify',
	'browserify',
	'gulp-tap',
	'vinyl-buffer',
	'gulp-rename',
	'gulp-debug',
];
