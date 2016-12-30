const path = require('path');
const browser_sync_lib = require('browser-sync');

module.exports = function(gulp, $, p_src, p_dest, cb) {
	const browser_sync = browser_sync_lib.create();

	// watch targets
	this.deps.forEach((s_dep) => {

		// watch event emitter
		let d_watch = gulp.watch(path.join(p_src, this.options.watch || '**/*'), [s_dep]);

		// after change
		d_watch.on('change', () => {
			// wait for dependencies to complete
			setImmediate(() => {
				// then reload browser
				browser_sync.reload();
			});
		});
	});

	// 
	if(this.deps.length) {

		//
		browser_sync.init(this.config.browser_sync);
	}

	$.util.log();
	cb();
};
