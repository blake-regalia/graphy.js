const path = require('path');
const wt = require('worker_threads');

class MasterWorkerPolyfill extends wt.Worker {
	constructor(pr_worker, gc_worker) {
		let f_message;
		if(gc_worker.message) {
			f_message = gc_worker.message;
			delete gc_worker.message;
		}

		super(path.join(gc_worker.__dirname, pr_worker), gc_worker);

		this.on('message', f_message);
	}
}

module.exports = {
	Worker: MasterWorkerPolyfill,
};
