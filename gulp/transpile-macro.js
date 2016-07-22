const path = require('path');
const lazypipe = require('lazypipe');
const Builder = require('Builder');
const builder = new Builder();

// 
module.exports = function(gulp, $, p_src, p_dest) {

	// runs Builder.js' preprocessor on macros
	const mk_builder = (h_define={}) => {
		let s_define = '';
		// prep define string
		for(let s_define_property in h_define) {
			s_define += `@set ${s_define_property} ${h_define[s_define_property]}\n`;
		}

		// tap stream
		return $.tap((h_file) => {
			// set search directory for Builder module so it finds macro include file
			builder.machine.readers.file.searchDirs.unshift(path.dirname(h_file.path));

			// process contents as string through Builder
			h_file.contents = new Buffer(
				builder.machine.execute(s_define+h_file.contents.toString())
					.replace(/\/\*+\s*whitespace\s*\*+\/\s*/g, '')
			);
		});
	};


	gulp.src(p_src+'/**/*.js')
		// set macro variables and then apply Builder.js
		.pipe(mk_builder())

		// beautify
		.pipe($.beautify({indent_with_tabs: true}))

		// transpile & minify
		.pipe($.if(this.options.minify, lazypipe()
			// preserve mappings to beautified source file for debugging
			.pipe($.sourcemaps.init)

				// transpile
				.pipe($.babel)

				// uglify
				.pipe($.uglify)

			// write sourcemaps
			.pipe($.sourcemaps.write)()))

		// outpt
		.pipe(gulp.dest(p_dest));
};
