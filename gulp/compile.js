const cp = require('child_process');
const path = require('path');

// 
module.exports = Object.assign(function(gulp, $, p_src, p_dest) {
	const through = require('through2');

	return gulp.src(p_src+'/**/*.js')
		// handle leaks down the line
		.pipe($.plumber())

		// tap stream
		.pipe(through.obj((h_file, s_encoding, fk_file) => {
			let u_node = cp.spawn('node', [h_file.path], {
				stdio: ['ignore', 'pipe', process.stderr],
			});

			let ab_out = Buffer.allocUnsafe(0);
			u_node.stdout.on('data', (ab_chunk) => {
				ab_out = Buffer.concat([ab_out, ab_chunk], ab_out.length + ab_chunk.length);
			});
			u_node.stdout.on('end', () => {
				h_file.contents = ab_out;
				$.util.log('#end');
				fk_file(null, h_file);
			});
		}))

		// beautify
		.pipe($.beautify({indent_with_tabs: true}))

		// output
		.pipe(gulp.dest(p_dest));
}, {
	dependencies: [
		'through2',
		'gulp-plumber',
		'gulp-beautify',
	],
});

