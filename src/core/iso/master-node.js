const path = require('path');
const wt = require('worker_threads');
const v8 = require('v8');

class MasterWorkerPolyfill extends wt.Worker {
	constructor(pr_worker, gc_worker) {
		let f_message;
		if(gc_worker.message) {
			f_message = gc_worker.message;
			delete gc_worker.message;
		}

		// resource limits
		if('string' === typeof gc_worker.resourceLimits) {
			// must be 'inherit'
			if('inherit' !== gc_worker.resourceLimits) {
				throw new Error(`@graphy/core.iso.threads: Invalid '.resourceLimits' option to Worker constructor: "${gc_worker.resourceLimits}"`);
			}

			// try to get heap stats
			let n_mib_max_old_space = 0;
			try {
				// emprically, node(/v8?) seems to reserve additional 48 MiB of heap
				n_mib_max_old_space = (v8.getHeapStatistics().total_heap_size / 1024 / 1024) - 48;
			}
			catch(e_stat) {
				delete gc_worker.resourceLimits;
			}

			// inherit max old space size
			if(n_mib_max_old_space) {
				gc_worker.resourceLimits = {
					maxOldGenerationSizeMb: n_mib_max_old_space,
				};
			}
		}

		super(path.join(gc_worker.__dirname, pr_worker), gc_worker);

		this.on('message', f_message);
	}
}

module.exports = {
	Worker: MasterWorkerPolyfill,
};
