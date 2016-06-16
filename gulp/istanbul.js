
const instrumenter = require('isparta').Instrumentor;

module.exports = function(gulp, $, p_src, p_dest, f_done) {
	return gulp.src(p_dest+'/**/*.js')
		.pipe($.istanbul({
			includeUntested: true,
			instrumenter,
		}))
		.pipe($.istanbul.hookRequire());
};
