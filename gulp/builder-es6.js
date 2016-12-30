const es = require('event-stream');
const Builder = require('Builder');

// 
module.exports = function(gulp, $, p_src, p_dest) {
	const builder = new Builder();

	// runs Builder.js' preprocessor on macros
	const mk_builder = (h_define) => {
		let s_define = '';
		// prep define string
		for(let s_define_property in h_define) {
			s_define += `@set ${s_define_property} ${h_define[s_define_property]}\n`;
		}

		// tap stream
		return $.tap((h_file, t) => {
			h_file.contents = new Buffer(
				builder.machine.execute(s_define+h_file.contents.toString())
					.replace(/\/\*+\s*whitespace\s*\*+\/\s*/g, '')
			);
		});
	};


	// load source files
	let ds_built = gulp.src(p_src+'/**/*.js')

		// handle uncaught exceptions thrown by any of the plugins that follow
		.pipe($.plumber())

		// do not recompile unchanged files
		.pipe($.cached(this.task));


	// make parser es6
	let ds_parser = ds_built

		// clone unprocessed parser src
		.pipe($.clone())

		// set macro variables and then apply Builder.js
		.pipe(mk_builder({

		}))

		// beautify
		.pipe($.beautify({indent_with_tabs: true}))

		// rename
		.pipe($.rename(h => {
			h.basename = 'stream-'+h.basename;
		}));


	// // make parser with relative iris
	// let ds_parser_relative_irirs = ds_built

	// 	// clone unprocessed parser src
	// 	.pipe($.clone())

	// 	// set macro variables and then apply Builder.js
	// 	.pipe(mk_builder({
	// 		RELATIVE_IRIS: true,
	// 	}))

	// 	// beautify
	// 	.pipe($.beautify({indent_with_tabs: true}))

	// 	// rename
	// 	.pipe($.rename(h => {
	// 		h.basename = `${h.basename}-relative-iris`;
	// 	}));



	// // make static parser es6
	// let ds_static_parser = ds_built

	// 	// clone unprocessed parser src
	// 	.pipe($.clone())

	// 	// set macro variables and then apply Builder.js
	// 	.pipe($.tap(f_builder(`@set STREAM false\n@set NETWORK true`)))

	// 	// rename
	// 	.pipe($.rename(h => {
	// 		h.basename = 'static-'+h.basename;
	// 	}));


	// output both parsers
	return es.merge(ds_parser)
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
