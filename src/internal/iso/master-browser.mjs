
class MasterWorkerPolyfill extends Worker {
	constructor(p_worker, gc_worker={}) {
		let f_message;
		if(gc_worker.message) {
			f_message = gc_worker.message;
			delete gc_worker.message;
		}

		let w_data;
		if(gc_worker.workerData) {
			w_data = gc_worker.workerData;
			delete gc_worker.workerData;
		}

		// remove extraneous node options
		if(gc_worker.__dirname) delete gc_worker.__dirname;
		if(gc_worker.resourceLimits) delete gc_worker.resourceLimits;

		super(p_worker, gc_worker);

		this.postMessage({
			type: 'init',
			value: {
				data: w_data,
			},
		});

		this.onmessage = f_message;
	}
}

export {
	MasterWorkerPolyfill as Worker,
};
