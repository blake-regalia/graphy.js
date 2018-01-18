/* eslint-disable indent */

module.exports = Object.assign(function(gulp, $, p_src, p_dest, f_done) {

	let e_mocha;

	gulp.src(this.options.test_src)
		.pipe($.plumber())
		.pipe($.debug())
		.pipe($.mocha({reporter:'spec'}))
			.on('error', (e_stream) => {
				$.util.log('err: '+e_stream);
				e_mocha = e_stream;
			})
		.pipe($.istanbul.writeReports())
			.on('end', () => {
				f_done(e_mocha);
			});
}, {
	dependencies: [
		'gulp-plumber',
		'gulp-debug',
		'gulp-mocha',
		'gulp-istanbul',
		'gulp-util',
	],
});
