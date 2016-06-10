const path = require('path');

module.exports = function(gulp, $, p_src, p_dest) {

	// open read stream on source
	gulp.src(path.join(p_src, this.options.glob || '**/*'))

		// optional rename
		.pipe($.rename((...a_args) => {
			if(this.options.rename) this.options.rename(...a_args);
		}))

		// output
		.pipe(gulp.dest(p_dest));
};
