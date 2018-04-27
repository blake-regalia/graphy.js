const stream = require('stream');

const worker = require('worker').scopify(require, () => {
	require('./workers/serializer.js');
}, 'undefined' !== typeof arguments && arguments);


class store extends stream.Transform {
	constructor(g_config={}) {
		super({
			// both readable and writable expect objects
			objectMode: true,
		});

debugger;
		let k_worker = worker.spawn('./workers/serializer.js', {
			inspect: {
				brk: true,
				port: 9230,
			},
		});

		Object.assign(this, {
			worker: k_worker,
		});

		debugger;
		k_worker.run('load_object_stream', [this])
			.then((p_output) => {
				debugger;
				g_config.ready(p_output);
			});
	}

	_write(g_quad, s_encoding, fk_write) {
		this.push([
			g_quad.subject.concise(),
			g_quad.predicate.concise(),
			g_quad.object.concise(),
		]);

		fk_write();
	}

	// _writev(a_chunks, fk_write) {
	// 	this.worker.run(''a_chunks.map(g => g.chunk)
	// }
}

module.exports = store;
