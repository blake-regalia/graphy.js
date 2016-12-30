// const fs = require('fs');

const pug = require('pug');
// const foldero = require('foldero');

module.exports = function(gulp, $, p_src, p_dest) {

	// // prep path to data directory
	// let p_data = p_src+'/_data';

	// // site data
	// let h_site_data = fs.existsSync(p_data)?
	// 	foldero(p_data, {
	// 		recurse: true,
	// 		whitelist: '(.*/)*.+\.(json)$',
	// 		loader(s_file) {
	// 			let json = {};
	// 			try {
	// 				json = JSON.parse(fs.readFileSync(s_file, 'utf8'));
	// 			}
	// 			catch(e) {
	// 				throw `Error Parsing JSON file: ${s_file}\n=== ====\n${e}`;
	// 			}
	// 			return json;
	// 		},
	// 	}): {};

	// build stream
	return gulp.src([
		p_src+'/**/*.pug',
		// `!${p_src}/{**/_*,**/_*/**}`,
	])
		// // only proceed with files that have changed
		// .pipe($.cached(s_task))

		// handle uncaught exceptions thrown by any of the plugins that follow
		.pipe($.plumber())

		.pipe($.debug())

		// compile pug => html
		.pipe($.pug({
			pug: pug,
			pretty: true,
			locals: {
				site: {
					// data: h_site_data,
				},
			},
		}))

		// // compress html
		// .pipe($.htmlmin({
		// 	collapseBooleanAttributes: true,
		// 	conservativeCollapse: true,
		// 	removeCommentsFromCDATA: true,
		// 	removeEmptyAttributes: true,
		// 	removeRedundantAttributes: true,
		// }))

		.pipe($.rename((...a_args) => {
			if(this.options.rename) this.options.rename(...a_args);
		}))

		// write to output directory
		.pipe(gulp.dest(p_dest));
};

module.exports.dependencies = [
	'pug',
	'gulp-plumber',
	'gulp-debug',
	'gulp-pug',
	'gulp-rename',
];
