const es = require('event-stream');
const Builder = require('Builder');
const builder = new Builder();

// 
module.exports = function(gulp, $, p_src, p_dest) {

	// runs Builder.js' preprocessor on macros
	const mk_builder = (h_define) => {
		let s_define = '';
		// prep define string
		for(let s_define_property in h_define) {
			s_define += `@set ${s_define_property} ${h_define[s_define_property]}\n`;
		}

		// tap stream
		return $.tap((h_file) => {
			h_file.contents = new Buffer(
				builder.machine.execute(s_define+h_file.contents.toString())
					.replace(/\/\*+\s*whitespace\s*\*+\/\s*/g, '')
			);
		});
	};


	// load source files into a stream that will be cloned for each n3 flavor
	let ds_source = gulp.src(p_src+'/**/*.js')

		// handle uncaught exceptions thrown by any of the plugins that follow
		.pipe($.plumber())

		// do not recompile unchanged files
		.pipe($.cached(this.task));


	// make a variety of flavors
	const mk_flavors = (h_flavors) => {
		return Object.keys(h_flavors).map((s_flavor) => {

			// make flavor
			let ds_flavor = ds_source

				// clone unprocessed source
				.pipe($.clone())

				// set macro variables and then apply Builder.js
				.pipe(mk_builder(h_flavors[s_flavor]))

				// beautify
				.pipe($.beautify({indent_with_tabs: true}))

				// rename
				.pipe($.rename(h => {
					h.dirname = s_flavor;
				}));

			// transpile & minify
			if(this.options.es5) {
				return ds_flavor

					// preserve mappings to beautified source file for debugging
					.pipe($.sourcemaps.init())

					// transpile
					.pipe($.babel())

					// uglify
					.pipe($.uglify())
				.pipe($.sourcemaps.write());
			}

			// return as is
			return ds_flavor;
		});
	};


	// make a stream for each flavor
	let a_streams = mk_flavors({

		// N-Triples
		nt: {
			N: true,
			NT: true,
		},

		// N-Quads
		nq: {
			N: true,
			NQ: true,
		},

		// Turtle
		ttl: {
			T: true,
			TTL: true,
		},

		// TriG
		trig: {
			T: true,
			TRIG: true,
		},
	});


	// output all flavors
	return es.merge.apply(es, a_streams)
		.pipe(gulp.dest(this.sub_dest('')));
};
