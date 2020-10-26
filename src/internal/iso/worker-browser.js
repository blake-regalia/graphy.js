
module.exports = (fk_init) => {
	onmessage = (e_msg) => {
		let g_msg = e_msg.data;

		if('init' === g_msg.type) {
			let g_value = g_msg.value;

			fk_init({
				workerData: g_value.data,
				parentPort: {
					postMessage,
				},
			});
		}
	};
};
