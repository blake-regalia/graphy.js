const Builder = require('Builder');
const builder = new Builder();

module.exports = function(gulp, $, p_src, p_dest) {

	// load source files
	let ds_built = gulp.src(p_src+'/**/*.js')

		// handle uncaught exceptions thrown by any of the plugins that follow
		.pipe($.plumber())

		// do not recompile unchanged files
		.pipe($.cached(this.task))

		// transform file objects with gulp-tap
		.pipe($.tap((h_file) => {

			// run Builder preprocessor on macros
			h_file.contents = new Buffer(builder.machine.execute(h_file.contents.toString()));
		}));


	// output es6
	ds_built

		// stream parser
		.pipe($.insert.prepend(`@set STREAM true\n@setNETWORK false`))

		// rename
		.pipe($.rename(h => {
			h.basename = 'stream-parser';
		}))

		// output
		.pipe(gulp.dest(p_dest));


	// // transpile
	// ds_built

	// 	// handle uncaught exceptions thrown by any of the plugins that follow
	// 	.pipe($.plumber())

	// 	// do not recompile unchanged files
	// 	.pipe($.cached(this.task))

	// 	// lint all javascript source files
	// 	.pipe($.eslint())
	// 	.pipe($.eslint.format())

	// 	// preserve mappings to source files for debugging
	// 	.pipe($.sourcemaps.init())

	// 		// transpile
	// 		.pipe($.babel())
	// 	.pipe($.sourcemaps.write())

	// 	// // optionally rename output
	// 	// .pipe($.if(this.options.rename, $.rename(this.options.rename)))

	// 	// write output to dist directory
	// 	.pipe(gulp.dest(p_dest));
};
