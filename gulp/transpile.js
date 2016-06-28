
module.exports = function(gulp, $, p_src, p_dest) {

	// load all javascript source files
	return gulp.src(p_src+'/**/*.js')

		// handle uncaught exceptions thrown by any of the plugins that follow
		.pipe($.plumber())

		// do not recompile unchanged files
		.pipe($.cached(this.task))

		// lint all javascript source files
		.pipe($.eslint())
		.pipe($.eslint.format())

		// preserve mappings to source files for debugging
		.pipe($.sourcemaps.init())

			// transpile
			.pipe($.babel())
		.pipe($.sourcemaps.write())

		// // optionally rename output
		// .pipe($.if(this.options.rename, $.rename(this.options.rename)))

		// write output to dist directory
		.pipe(gulp.dest(p_dest));
};
