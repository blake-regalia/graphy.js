const store = require('./store.js');

module.exports = Object.assign(function() {
	
}, {
	// create a bat store we can pipe data into
	store(...a_args) {
		return new store(...a_args);
	},
});
