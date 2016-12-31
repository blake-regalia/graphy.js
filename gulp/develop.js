const path = require('path');

module.exports = function(gulp, $, p_src, p_dest) {

	// each dependency
	this.deps.forEach((s_dep) => {
		// make glob path for files to watch
		let h_friend = this.friend(s_dep);
		let p_watch = path.join(h_friend.src, h_friend.options.watch || '**/*');

		// debug print
		$.util.log($.util.colors.magenta(`watching ${p_watch}...`));

		// watch those files and run dependent task
		gulp.watch(p_watch, [s_dep]);
	});
};

module.exports.dependencies = [
	'gulp-util',
];
