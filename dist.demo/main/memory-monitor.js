const buffer = require('buffer');
const event = require('event');
const v8 = require('v8');
// set predictive heap growth multiplier
const X_PREDICTIVE_HEAP_GROWTH_MULTIPLIER = 2.2;
// determine actual heap size limit
const N_HEAP_SIZE_LIMIT = (() => {
	const N_64_MIB = 64 * 1024 * 1024;
	let h_stats = v8.getHeapStatistics();
	let n_heap_size_limit = h_stats.heap_size_limit;
	// user set --max-old-space-size limit
	let a_old_space_args = process.execArgv.filter(s_arg => s_arg.startsWith('--max-old-space-size') || s_arg.startsWith('--max_old_space_size'));
	if (a_old_space_args.length) {
		// parse limit value
		let s_old_space_arg = a_old_space_args[0];
		let n_old_space_value = (~~s_old_space_arg.substr(s_old_space_arg.indexOf('=') + 1)) * 1024 * 1024;
		// heap size limit does not match what user specified
		if (n_heap_size_limit !== (n_old_space_value + N_64_MIB)) {
			console.warn(`WARNING: V8 did not respect your --max-old-space-size argument of ${n_old_space_value / 1024 / 1024} MiB because it exceeds the heap size that V8 can support on this system architecture. I recommend trying 4031 MiB (4096 MiB - 64 MiB - 1 MiB) and seeing if this message goes away.`);
			// assume 4gb limit
			return 4096 * 1024 * 1024;
		}
	}
	// heap size limit from heap stats is trustworthy
	return n_heap_size_limit;
})();
// maximum size allowed for all buffers
const N_BUFFER_SIZE_LIMIT = buffer.kMaxLength;
// 
class HeapMonitor extends event {
	constructor(x_predictive_growth_multiplier) {
		// create means to track heap space as it grows
		Object.assign(this, {
			// object container for heap snapshot info
			heap_snapshot: {},
			// heap growth multiplier
			multiplier: x_predictive_growth_multiplier || X_PREDICTIVE_HEAP_GROWTH_MULTIPLIER,
		});
		this.update();
	}
	// acquire new memory stats
	update() {
		this.heap_snapshot.heap_size = v8.getHeapStatistics().used_heap_size;
	}
	// test whether or not we should do some garbage "shoveling"
	report(x_growth) {
		// protect against infinity bug
		if (x_growth < 0.01) return false;
		// ref snapshot info
		let h_snapshot = this.heap_snapshot;
		// grab v8 heap stats
		let h_stats = v8.getHeapStatistics();
		// compute heap growth rate based on bytes consumed in bit sequence
		let x_growth_rate = (h_stats.used_heap_size - h_snapshot.heap_size) / x_growth;
		// keep only maximum growth rate and maximum bytes consumed
		x_growth_rate = h_snapshot.max_growth_rate = Math.max(h_snapshot.max_growth_rate || 0, x_growth_rate);
		n_btyes_consumed = h_snapshot.max_bytes_consumed = Math.max(h_snapshot.max_bytes_consumed || 0, n_btyes_consumed);
		// compute worst case scenario
		return ((x_growth_rate * n_btyes_consumed * this.multiplier) + h_stats.total_heap_size > N_HEAP_SIZE_LIMIT);
	}
}
module.exports = {
	track_heap() {
		return new HeapMonitor();
	}
};
let k_heap_monitor = memory_monitor.track_heap();
k_heap_monitor.on('low', () => {});
k_heap_monitor.update(25);