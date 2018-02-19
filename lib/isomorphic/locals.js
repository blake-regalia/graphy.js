
// deduce the runtime environment
const [B_BROWSER, B_BROWSERIFY] = (() => 'undefined' === typeof process
	? [true, false]
	: (process.browser
		? [true, true]
		: ('undefined' === process.versions || 'undefined' === process.versions.node
			? [true, false]
			: [false, false])))();


const locals = Object.assign({
	B_BROWSER,
	B_BROWSERIFY,
}, B_BROWSER? require('./browser/locals.js'): require('./node/locals.js'));

module.exports = locals;
