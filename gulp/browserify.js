// const path = require('path');

const babelify = require('babelify');
const browserify = require('browserify');
const glob = require('glob');

module.exports = function(gulp, $, p_src, p_dest) {

	// // load source files
	// return gulp.src(['dist.es6/**/*.js', '!dist.es6/debug/*.js'], {read: false})

	// 	.pipe($.debug())

	// 	// transform file objects with gulp-tap
	// 	.pipe($.tap((h_file) => {

	// 		// browserify
	// 		h_file.contents = browserify({
	// 			entries: [h_file.path],
	// 			noParse: true,
	// 			debug: true,
	// 			transform: [
	// 				// transpile down to es5
	// 				babelify.configure({
	// 					presets: ['es2015'],
	// 				}),
	// 				// envify, // Sets NODE_ENV for optimization of certain npm packages
	// 			],
	// 			// cache: {},
	// 			// packageCache: {},
	// 			// plugin: [watchify],
	// 		}).bundle();
	// 	}))

	// 	// //
	// 	// .pipe($.cached(this.task))

	// 	// transform streaming contents into buffer contents
	// 	.pipe($.buffer())

	// 	// // // rename
	// 	// .pipe($.rename((...a_args) => {
	// 	// 	if(this.options.rename) this.options.rename(...a_args);
	// 	// }))

	// 	.pipe($.debug())

	// 	// output
	// 	.pipe(gulp.dest(p_dest));

	// load source files
	return browserify({
			entries: glob.sync('dist.es6/**/*.js', {
				ignore: 'dist.es6/debug/*.js',
			}),
			debug: true,
			transform: [
				// // transpile down to es5
				// babelify.configure({
				// 	presets: ['es2015'],
				// }),
				// envify, // Sets NODE_ENV for optimization of certain npm packages
			],
			insertGlobalVars: {
				graphy: () => 'require("graphy")',
			},
			// cache: {},
			// packageCache: {},
			// plugin: [watchify],
		})
			.external('v8')
			.bundle()

		.pipe($.source_stream('bundle.js'))

		// output
		.pipe(gulp.dest(p_dest));
};


module.exports.dependencies = [
	'babelify',
	'browserify',
	'glob',
	'gulp-tap',
	'vinyl-buffer',
	'vinyl-source-stream',
	'gulp-rename',
	'gulp-debug',
];
