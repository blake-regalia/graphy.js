const path = require('path');

module.exports = function(gulp, $, p_src, p_dest) {

	// open read stream on source
	gulp.src(path.join(p_src, this.options.glob || '**/*'))

		// optional rename
		.pipe($.rename((h) => {
			if(['gulp', 'lib', 'scrap', 'test'].includes(h.basename)) throw 'bad router name';
			h.dirname = h.basename;
			h.basename = 'index';
		}))

		// output
		.pipe(gulp.dest('./'));
};
