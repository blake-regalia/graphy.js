export default async() => {
	const B_BROWSER = (() => 'undefined' === typeof process
		? true
		: (process.browser
			? true
			: ('undefined' === process.versions || 'undefined' === process.versions.node)))();

	if(B_BROWSER) {
		return {
			master: await import('./master-browser.js'),
			browser: await import('./worker-browser.js'),
		};
	}
	else {
		return {
			master: await import('./master-node.js'),
			browser: await import('./worker-node.js'),
		};
	}
};
