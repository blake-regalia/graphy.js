const path = require('path');
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
			// set search directory for Builder module so it finds macro include file
			builder.machine.readers.file.searchDirs.unshift(path.dirname(h_file.path));

			// process contents as string through Builder
			h_file.contents = new Buffer(
				builder.machine.execute(s_define+h_file.contents.toString())
					.replace(/\/\*+\s*whitespace\s*\*+\/\s*/g, '')
			);
		});
	};


	// load source files into a stream that will be cloned for each n3 flavor
	let h_sources = {
		// N-Quads & N-Triples
		n: gulp.src(p_src+'/**/n-*.js')
			// handle uncaught exceptions thrown by any of the plugins that follow
			.pipe($.plumber()),

			// // do not recompile unchanged files
			// .pipe($.cached(this.task)),

		// Turtle and TriG
		t: gulp.src(p_src+'/**/t-*.js')
			// handle uncaught exceptions thrown by any of the plugins that follow
			.pipe($.plumber()),

			// // do not recompile unchanged files
			// .pipe($.cached(this.task)),
	};


	// make a variety of flavors
	const mk_flavors = (h_flavors) => {
		return Object.keys(h_flavors).map((s_flavor) => {

			// make flavor
			let ds_flavor = h_sources[s_flavor[0]]

				// clone unprocessed source
				.pipe($.clone())

				// set macro variables and then apply Builder.js
				.pipe(mk_builder(h_flavors[s_flavor]))

				// beautify
				.pipe($.beautify({indent_with_tabs: true}))

				// rename
				.pipe($.rename(h => {
					h.basename = h.basename.replace(/^[a-z]\-/, '');
					h.dirname = s_flavor;
				}));

			// transpile & minify
			if(this.options.minify) {

				// // property names not to mangle
				// let a_save_properties = [
				// 	'lastIndex', 'length', 'exec',
				// 	'exports',
				// 	'value', 'termType', 'datatype', 'language',
				// 	'setEncoding',
				// 	'triple', 'base', 'prefix', 'error', 'end',
				// 	'resume', 'statement', 'collection_subject', 'collection_object',
				// 	'pairs', 'object_list', 'post_object', 'end_of_triple', 'after_end_of_triple',
				// 	'base_iri', 'prefix_id', 'prefix_iri', 'full_stop',
				// ];

				return ds_flavor

					// preserve mappings to beautified source file for debugging
					.pipe($.sourcemaps.init())

						// rename certain symbols
						.pipe($.regexp_sourcemaps(/GenericTerm(?=[.()])/g, 'G'))
						.pipe($.regexp_sourcemaps(/NamedNode(?=[.()])/g, 'N'))
						.pipe($.regexp_sourcemaps(/Literal(?=[.()])/g, 'L'))
						.pipe($.regexp_sourcemaps(/BlankNode(?=[.()])/g, 'B'))

						// transpile
						.pipe($.babel())

						// uglify
						.pipe($.uglify({
							// compress: {
							// 	keep_fnames: true,
							// },
							// mangleProperties: {
							// 	// regex: /base(_\w+)?/,
							// 	// regex: /^((?!length|exports|value|setEncoding|triple|base|prefix|error|end).)*$/,
							// 	regex: new RegExp(`^((?!${a_save_properties.join('|')}).)*$`, 'g'),
							// },
						}))

					// write sourcemaps
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
			TRIPLES: true,
		},

		// N-Quads
		nq: {
			N: true,
			NQ: true,
			QUADS: true,
		},

		// Turtle
		ttl: {
			T: true,
			TTL: true,
			TRIPLES: true,
		},

		// TriG
		trig: {
			T: true,
			TRIG: true,
			QUADS: true,
		},
	});


	// output all flavors
	return es.merge.apply(es, a_streams)
		.pipe(gulp.dest(this.sub_dest('')));
};
