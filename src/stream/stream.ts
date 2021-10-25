import EventEmitter from 'eventemitter2';

import type {
	Readable as NodeReadable,
	Writable as NodeWritable,
	Transform as NodeTransform,
} from 'stream';

import stream from './readable/readable-node';

type ReadableFunction<
	w_type extends unknown=string,
> = () => w_type | Promise<w_type>;

type WritableFunction<
	w_type extends unknown=string,
> = (s_write: w_type) => Promise<void> | void;

type ObjectReadable<ObjectType extends Lookup=Lookup> = NodeReadable | ReadableStream | Iterable<ObjectType> | AsyncIterable<ObjectType>;
type StringWritable = NodeWritable | WritableStream | WritableFunction;

type ReadeableOrWritable = ObjectReadable | StringWritable;

type ErrCallback = (e_what?: Error) => void;

type ReadOrWrite<
	s_direction extends StreamModes,
	z_read extends unknown,
	z_write extends unknown,
> = {
	'read:string': z_read;
	'read:object': z_read;
	'write:string': z_write;
	'write:object': z_write;
}[s_direction];

type StreamModes = 'read:string' | 'read:object' | 'write:string' | 'write:object';


export type Router<
	s_mode extends StreamModes,
	YieldType=unknown,
> = {
	node?: (ds_stream: ReadOrWrite<s_mode, NodeReadable, NodeWritable>) => void;

	whatwg?: (ds_stream: ReadOrWrite<s_mode, ReadableStream, WritableStream>, y_reader_writer?: ReadableStreamGenericReader | WritableStreamDefaultWriter) => void;

	function?: (f_write: {
		'read:string': ReadableFunction;
		'read:object': ReadableFunction<YieldType>;
		'write:string': WritableFunction;
		'write:object': WritableFunction<YieldType>;
	}[s_mode]) => void;

	iterable?: (di_iter: Iterable<YieldType> | AsyncIterable<YieldType>) => void | Promise<void>;

	other?: (z_stream: ReadeableOrWritable) => void;
};


// max string buffer size
const N_DEFAULT_MAX_BUFFER = 1 << 15;  // 32 KiB

// no-op
const F_NOOP = () => {};

const F_WHATWG_NOT_SUPPORTED = (): never => {
	throw new Error(`WHATWG streams are not available in the current runtime environment`);
};


/**
 * Deduce the type of stream at runtime use the given router for callback
 */
export function streamType<
	s_mode extends StreamModes=StreamModes,
	ObjectType extends Lookup=Lookup,
>(z_stream: ReadOrWrite<s_mode, ObjectReadable, StringWritable>, h_router: Router<s_mode, ObjectType>) {
	// truthy
	if(z_stream) {
		// node.js stream
		if('function' === typeof (z_stream as NodeReadable).setEncoding) {
			if(h_router.node) return h_router.node(z_stream as NodeReadable & NodeWritable);
		}
		// WHATWG writable stream
		else if('undefined' !== typeof WritableStream && z_stream instanceof WritableStream) {
			if(h_router.whatwg) return h_router.whatwg(z_stream as ReadableStream & WritableStream, z_stream.getWriter() as WritableStreamDefaultWriter);
		}
		// WHATWG readable stream
		else if('undefined' !== typeof ReadableStream && z_stream instanceof ReadableStream) {
			if(h_router.whatwg) return h_router.whatwg(z_stream as ReadableStream & WritableStream, z_stream.getReader() as ReadableStreamGenericReader);
		}
		// simple callback optionally returning a promise
		else if('function' === typeof z_stream) {
			// @ts-expect-error b
			if (h_router.function) return h_router.function(z_stream as ReadOrWrite<s_mode, ReadableFunction, WritableFunction>);
		}
		// iterable
			// @ts-expect-error b
		else if (z_stream[Symbol.asyncIterator] || z_stream[Symbol.iterator]) {
			// @ts-expect-error b
			if(h_router.iterable) return h_router.iterable(z_stream as Iterator | AsyncIterator);
		}
	}

	// other
	if(h_router.other) {
		h_router.other(z_stream);
	}
	// throw
	else {
		throw new TypeError(`Invalid type supplied for stream argument: ${z_stream}`);
	}
}



export interface TransformOTSConfig {
	import?: ObjectReadable;
	data?: WritableFunction;
	warn?: (s_warn: string) => void;
	error?: (e_err: Error) => void;
	maxBuffer?: number;
}

type Lookup = Record<string, any>;

export class ImportOccupiedError extends Error {
	constructor() {
		super('The RDFJS Sink side of this stream has already imported a Source');
	}
}


function TransformOTS$_push_data(this: TransformOTS, s_push: string): boolean {
	this.emit('data', s_push);

	const z_push = this._fk_data(s_push);

	if(z_push && 'function' === typeof z_push.then) {
		return true;
	}

	return false;
}

function TransformOTS$_push_node(this: TransformOTS, s_push: string): boolean {
	return !this._ds_readable!.push(s_push);
}

function TransformOTS$_push_whatwg(this: TransformOTS, s_push: string): boolean {
	this._d_readable_controller!.enqueue(s_push);
	return !this._d_readable_controller?.desiredSize;
}

function TransformOTS$_push_data_node(this: TransformOTS, s_push: string): boolean {
	return TransformOTS$_push_data.call(this, s_push)
		|| TransformOTS$_push_node.call(this, s_push);
}

function TransformOTS$_push_data_whatwg(this: TransformOTS, s_push: string): boolean {
	return TransformOTS$_push_data.call(this, s_push)
		|| TransformOTS$_push_whatwg.call(this, s_push);
}

function TransformOTS$_push_node_whatwg(this: TransformOTS, s_push: string) {
	return TransformOTS$_push_node.call(this, s_push)
		|| TransformOTS$_push_whatwg.call(this, s_push);
}

function TransformOTS$_push_all(this: TransformOTS, s_push: string): boolean {
	return TransformOTS$_push_data.call(this, s_push)
		|| TransformOTS$_push_node.call(this, s_push)
		|| TransformOTS$_push_whatwg.call(this, s_push);
}

enum XM_DESTS {
	NONE=0,
	DATA=1,
	NODE=2,
	WHATWG=3,
}

export abstract class TransformOTS<ObjectType extends Lookup=Lookup> extends EventEmitter.EventEmitter2 {
	// data event listener pipe
	protected _fk_data: WritableFunction = F_NOOP;
	protected _fk_warn: (s_warn: string) => void;

	// default error handling is to throw
	protected _fe_error: (e_err: Error) => void = ((e_throw: unknown): never => {
		throw e_throw;
	});

	protected _f_start: VoidFunction = F_NOOP;

	// internal push buffer
	protected _s_push: string = '';
	protected _a_pushes: string[] = [];


	protected _xm_dests: XM_DESTS = XM_DESTS.NONE;

	// 
	protected _n_max_buffer: number;

	protected _w_source: unknown = null;

	protected _ds_readable: NodeReadable | null = null;
	protected _dsw_readable: ReadableStream<string> | null = null;
	protected _d_readable_controller: ReadableStreamController<string> | null = null;

	protected _c_backpressure: number = 0;
	protected _f_relieve_backpressure: VoidFunction = F_NOOP;
	protected _f_apply_backpressure: VoidFunction = F_NOOP;


	protected _fke_transform: ErrCallback = (e_transform?: Error) => {
		if(e_transform) {
			this._fe_error(e_transform);
		}
	};

	_transform(w_write: Lookup): void {
		throw new Error(`Transform#_transform not implemented by subclass`);
	}

	abstract _reset(): void;

	constructor(gc_transform: TransformOTSConfig) {
		super({
			// need to know when 'data' listener added/removed
			newListener: true,
			removeListener: true,
		});

		// data listener added
		this.on('newListener', (si_event, f_listener) => {
			// deduce event
			switch(si_event) {
				// data handler
				case 'data': {
					// add to dests
					this._update_dests(this._xm_dests | XM_DESTS.DATA);

					// allow sync caller to finish
					queueMicrotask(() => {
						// consumer is ready
						this._consumer_ready();
					});

					break;
				}

				// end handler
				case 'end': {
					this.on('eof', f_listener);

					break;
				}

				// error handler
				case 'error': {
					this._fe_error = (e_throw: unknown) => {
						this.emit('error', e_throw);
					};

					break;
				}

				// warn
				case 'warning': {
					this._fk_warn = (s_warn: string) => {
						this.emit('warning', s_warn);
					};

					break;
				}

				default: {
					break;
				}
			}
		});

		// data listener removed
		this.on('removeListener', (si_event, f_listener) => {
			// deduce event
			switch(si_event) {
				// data listener removed
				case 'data': {
					// no more data listeners
					if(!this.listeners(si_event).length) {
						// no data hook
						if(this._fk_data === F_NOOP) {
							// remove data from dests
							this._update_dests(this._xm_dests & ~XM_DESTS.DATA);
						}
					}

					break;
				}

				// end listener removed
				case 'end': {
					this.off('eof', f_listener);

					break;
				}

				// error handler
				case 'error': {
					// no more error handlers
					if(!this.listeners(si_event).length) {
						// resort to throwing
						this._fe_error = (e_throw: unknown): never => {
							throw e_throw;
						};
					}

					break;
				}

				default: {
					break;
				}
			}
		});

		// warn hadling
		const z_warn = gc_transform.warn;
		this._fk_warn = ('undefined' !== typeof z_warn)
			? ('function' === typeof z_warn
				? z_warn
				: (z_warn? console.warn: F_NOOP)
			)
			: console.warn;

		// attach error handler
		if(gc_transform.error) {
			this.on('error', gc_transform.error);
		}

		// max buffer length
		this._n_max_buffer = gc_transform.maxBuffer || N_DEFAULT_MAX_BUFFER;

		// data callback
		const fk_data = gc_transform.data;
		if(fk_data) {
			// save to local field
			this._fk_data = fk_data;

			// add to dests
			this._update_dests(this._xm_dests | XM_DESTS.DATA);

			// allow sync caller to finish
			queueMicrotask(() => {
				// consumer is ready
				this._consumer_ready();
			});
		}

		// import
		const y_src = gc_transform.import;
		if(y_src) {
			this.import(y_src);
		}
	}

	protected _consumer_ready(): void {
		debugger;
		this._f_start();
		this._f_start = F_NOOP;
	}

	// flush buffer
	protected _flush_buffer(): boolean {
		// no buffer; exit
		if(!this._s_push) return false;

		// ref push string
		const s_push = this._s_push;

		// reset buffer
		this._s_push = '';

		// push buffer to stream
		return this.push(s_push);
	}

	protected _flush(): void {
		// flush buffer
		this._flush_buffer();

		// eof
		this.emit('eof');
	}

	// rinse off buffer to writable
	protected rinse(): void {
		this._reset();
		this._flush_buffer();
	}

	// queue data to be pushed later
	protected _queue(s_push: string): boolean {
		this._s_push += s_push;

		// internal buffer high water mark
		if(this._s_push.length > this._n_max_buffer) {
			return this._flush_buffer();
		}
		else {
			// do not worry about clearing timeouts
			queueMicrotask(() => this._flush_buffer());
		}

		return false;
	}

	import(z_source: ObjectReadable): this {
		// already imported
		if(this._w_source) {
			throw new Error(`Transform has already imported ${this._w_source === z_source? 'this same': 'another'} source`);
		}

		// lock source
		this._w_source = z_source;

		// ref this
		const k_self = this;

		// deduce source stream type
		streamType<'read:object', ObjectType>(z_source, {
			node(ds_import: NodeReadable) {
				// in node.js environment
				if(stream) {
					// no need to apply separately
					k_self._f_apply_backpressure = F_NOOP;

					k_self._f_start = () => {
						// allow writable callback to handle signal
						ds_import.pipe(new stream.Writable({
							write(g_item: ObjectType, s_encoding: string, fke_write: ErrCallback) {
								// perform transform
								k_self._transform(g_item);

								// backpressure detected while transforming
								if(k_self._c_backpressure) {
									// once downstream is ready to resume
									k_self._f_relieve_backpressure = () => {
										// comple write callback
										fke_write();
									};
								}
							},

							final() {
								k_self.end();
							},
						}));
					};
				}
				// cannot use node.js streams
				else {
					k_self._f_apply_backpressure = () => {
						ds_import.pause();
					};

					const f_resume = k_self._f_relieve_backpressure = () => {
						ds_import.resume();
					};

					
					function resume() {
						let g_item: ObjectType | null = null;

						while(null !== (g_item = ds_import.read() as unknown as ObjectType)) {
							k_self._transform(g_item);

							if(!k_self._c_backpressure) {
								k_self._apply_backpressure();
								break;
							}
						}
					}

					ds_import.on('readable', resume);
				}
			},

			whatwg(ds_import: ReadableStream) {
				// no need to apply separately
				k_self._f_apply_backpressure = F_NOOP;

				k_self._f_start = () => {
					// allow writable return to handle signal
					ds_import.pipeTo(new WritableStream({
						start(d_controller: WritableStreamDefaultController) {

						},

						// each time the source writes
						write(g_item: ObjectType, d_controller: WritableStreamDefaultController): void | Promise<void> {
							// perform transform
							k_self._transform(g_item);

							// backpressure detected while transforming
							if(k_self._c_backpressure) {
								// pass signal to source
								return new Promise((fk_resolve) => {
									// once downstream is ready to resume, resolve promise
									k_self._f_relieve_backpressure = fk_resolve;
								});
							}
						},

						// source closes
						close() {
							k_self.end();
						},
					}));
				};
			},

			function(f_read: () => Promise<ObjectType> | ObjectType) {
				let b_pause = false;
				let b_interrupted = false;

				// applying backpressure means enabling a pause flag
				k_self._f_apply_backpressure = () => {
					b_pause = true;
				};

				// def consume function
				async function consume() {
					// pause flag encountered
					if(b_pause) {
						// flow was interrupted
						b_interrupted = true;

						// do not read
						return;
					}

					// try to read
					try {
						const z_next = await f_read();

						// data was returned
						if(z_next) {
							// transform it
							k_self._transform(z_next);

							// continue
							consume();
						}
						// eof signal
						else {
							k_self.end();
						}
					}
					// error caught
					catch(e_read: unknown) {
						k_self._fe_error(e_read as Error);
					}
				};

				// relieve backpressure
				k_self._f_relieve_backpressure = () => {
					// disable pause flag
					b_pause = false;

					// function was interrupetd; resume
					if(b_interrupted) {
						consume();
					}
				};

				// begin
				k_self._f_start = consume;
			},

			iterable(di_read: Iterable<ObjectType> | AsyncIterable<ObjectType>): void {
				let b_pause = false;
				let fk_resume: VoidFunction | null = null;

				// applying backpressure means enabling a pause flag
				k_self._apply_backpressure = () => {
					b_pause = true;
				};

				// relieve backpressure
				k_self._f_relieve_backpressure = () => {
					// disable pause flag
					b_pause = false;

					// function was interrupetd; resume
					if(fk_resume) {
						fk_resume();
						fk_resume = null;
					}
				};

				// begin
				k_self._f_start = async() => {
					// each item in iterable
					for await(const w_item of di_read) {
						// transform it
						k_self._transform(w_item);

						// pausing
						if(b_pause) {
							// await resume call
							await new Promise((fk_resolve) => {
								fk_resume = fk_resolve as VoidFunction;
							});
						}
					}

					// done
					k_self.end();
				};
			},

			other() {
				throw new TypeError(`Invalid type supplied for import: ${z_source}`);
			},
		});

		// emit import event
		this.emit('import', z_source);

		// chainable
		return this;
	}

	_apply_backpressure() {
		if(!this._c_backpressure++) {
			this._f_apply_backpressure();
		}
	}

	_relieve_backpressure() {
		if(!--this._c_backpressure) {
			this._f_relieve_backpressure();
		}

		this._c_backpressure = Math.max(0, this._c_backpressure);
	}

	nodeReadable(): NodeReadable {
		// readable stream already created
		if(this._ds_readable) {
			return this._ds_readable;
		}
		// in node.js environment
		else if(stream) {
			const k_self = this;

			// create readable stream
			const ds_readable = this._ds_readable = new stream.Readable({
				encoding: 'utf8',
				objectMode: false,
				read() {
					k_self._consumer_ready();
				},
			});

			// // wtf
			// ds_readable.on('newListener', (si_event: string) => {
			// 	if('data' === si_event) {
			// 		k_self._consumer_ready();
			// 	}
			// });

			// handle backpressure
			{
				ds_readable.on('pause', () => {
					this._apply_backpressure();
				});

				ds_readable.on('resume', () => {
					this._relieve_backpressure();
				});
			}

			// forward end of stream event
			this.on('eof', () => {
				ds_readable.push(null);
			});

			// add dest
			this._update_dests(this._xm_dests | XM_DESTS.NODE);

			// return readable stream
			return ds_readable;
		}
		// not supported
		else {
			throw new Error(`Not within node.js environment`);
		}
	}

	whatwgReadable(): ReadableStream<string> {
		// readable stream already created
		if(this._dsw_readable) {
			return this._dsw_readable;
		}
		// in WHATWG environment
		else if('undefined' !== typeof ReadableStream) {
			const k_self = this;

			// create readable stream
			const dsw_readable = this._dsw_readable = new ReadableStream<string>({
				start(d_controller: ReadableStreamController<string>) {
					k_self._d_readable_controller = d_controller;
				},

				pull(d_controller: ReadableStreamController<string>) {
					k_self._consumer_ready();
				},
			});

			// forward end of stream event
			this.on('eof', () => {
				this._d_readable_controller!.close();
			});

			// add dest
			this._update_dests(this._xm_dests | XM_DESTS.WHATWG);

			// return readable stream
			return dsw_readable;
		}
		else {
			throw new Error(`WHATWG streams are not available in the current runtime environment`);
		}
	}

	protected _update_dests(xm_set: XM_DESTS): unknown {
		this._xm_dests = xm_set;

		switch(xm_set) {
			case XM_DESTS.NONE: {
				return this.push = TransformOTS.prototype.push;
			}

			case XM_DESTS.DATA: {
				return this.push = TransformOTS$_push_data;
			}

			case XM_DESTS.NODE: {
				return this.push = TransformOTS$_push_node;
			}

			case XM_DESTS.WHATWG: {
				return this.push = TransformOTS$_push_whatwg;
			}

			case XM_DESTS.DATA | XM_DESTS.NODE: {
				return this.push = TransformOTS$_push_data_node;
			}

			case XM_DESTS.DATA | XM_DESTS.WHATWG: {
				return this.push = TransformOTS$_push_data_whatwg;
			}

			case XM_DESTS.NODE | XM_DESTS.WHATWG: {
				return this.push = TransformOTS$_push_node_whatwg;
			}

			case XM_DESTS.DATA | XM_DESTS.NODE | XM_DESTS.WHATWG: {
				return this.push = TransformOTS$_push_all;
			}

			default: {
				break;
			}
		}
	}

	// read from readable side
	read(): string | null {
		// there should never be an empty string in the queue
		return this._a_pushes.shift() || null;
	}

	// push to readable side
	push(s_push: string): boolean {
		// exports not yet set up; build in queue
		this._a_pushes.push(s_push);

		// emit readable
		this.emit('readable');

		// no backpressure
		return false;
	}

	// write method
	write(w_write: ObjectType): void {
		// call impl class method
		this._transform(w_write);
	}

	// end method
	end(): void {
		this._flush();
	}
} {
	Object.assign(TransformOTS.prototype, {
		isGraphyWritable: true,
	});
}
