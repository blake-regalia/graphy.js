// deduce the runtime environment
const [B_BROWSER] = (() => 'undefined' === typeof process
	? [true]
	: (process.browser
		? [true]
		: ('undefined' === process.versions || 'undefined' === process.versions.node
			? [true]
			: [false])))();

module.exports = B_BROWSER? {
	master: require('./master-browser.js'),
	worker: require('./worker-browser.js'),
}: {
	master: require('./master-node.js'),
	worker: require('./worker-node.js'),
};
