const path = require('path');

// 
module.exports = Object.assign(function(gulp, $, p_src, p_dest) {
	const jmacs = require('jmacs');
	const lazypipe = require('lazypipe');
	const Builder = require('Builder');

	const builder = new Builder();

	// runs jmacs
	const mk_jmacs = (h_define) => {
		let s_define = '';
		// prep define string
		for(let s_define_property in h_define) {
			s_define += `@set ${s_define_property} ${JSON.stringify(h_define[s_define_property])}\n`;
		}

		// tap stream
		return $.tap((h_file) => {
			// process contents as string through Builder
			try {
				let s_file_contents = h_file.contents.toString();
				let h_result = jmacs.compile({
					input: s_define+s_file_contents,
					cwd: path.dirname(h_file.path),
				});

				if(h_result.error) {
					console.dir(h_result);
					console.dir(h_result.error);
					console.dir(h_result.error.message);
					console.log(h_result.error.message);
					throw `error while compiling ${h_file.path}\n\n${h_result.error.message}`;
				}

				h_file.contents = new Buffer(
					h_result.output.replace(/\/\*+\s*whitespace\s*\*+\/\s*/g, '')
				);
			}
			catch(e_compile) {
				throw 'error while compiling '+h_file.path+'\n\n'+e_compile.stack;
			}
		});
	};

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
			try {
				h_file.contents = new Buffer(
					builder.machine.execute(s_define+h_file.contents.toString())
						.replace(/\/\*+\s*whitespace\s*\*+\/\s*/g, '')
						.replace(/\n\n+/g, '\n')
				);
			}
			catch(e_compile) {
				throw 'error while compiling '+h_file.path+'\n\n'+e_compile.stack;
			}
		});
	};


	gulp.src(p_src+'/**/*.js')
		// set macro variables and then apply Builder.js
		.pipe(mk_jmacs())

		// beautify
		.pipe($.beautify({indent_with_tabs: true}))

		// // transpile & minify
		// .pipe($.if(this.options.minify, lazypipe()
		// 	// preserve mappings to beautified source file for debugging
		// 	.pipe($.sourcemaps.init)

		// 		// transpile
		// 		.pipe($.babel)

		// 		// uglify
		// 		.pipe($.uglify)

		// 	// write sourcemaps
		// 	.pipe($.sourcemaps.write)()))

		// outpt
		.pipe(gulp.dest(p_dest));
}, {
	dependencies: [
		'lazypipe',
		'Builder',
		'gulp-sourcemaps',
		'gulp-beautify',
	],
});
