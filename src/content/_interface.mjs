// import {
// 	StringDecoder,
// } from 'string_decoder';

/* global StringDecoder TextDecoderStream TransformStream */

export const F_NOOP = () => {};
export const F_THROW = (e_read) => {
	throw e_read;
};

const G_TEXT_DECODER_STREAM_METHODS = {
	start() {
		this._d_decoder = new TextDecoder('utf-8', {
			fatal: true,
		});
	},

	transform(w_chunk, d_controller) {
		const s_decoded = this._d_decoder.decode(w_chunk, {
			stream: true,
		});

		if('' !== s_decoded) d_controller.enqueue(s_decoded);
	},

	flush(d_controller) {
		const s_output = this._d_decoder.decode();
		if('' !== s_output) d_controller.enqueue(s_output);
	},
};

function debug_arg(w_arg) {
	const s_arg = w_arg && 'toString' in w_arg? w_arg.toString(): ''+w_arg;
	return `${typeof w_arg} "${s_arg.slice(0, 80)}${s_arg.length > 80? '[...]': ''}"`;
}

class TextDecoderProxy {
	constructor() {
		const d_decoder = this._d_decoder = new TextDecoder('utf-8', {
			fatal: true,
		});

		this.decode = ab => d_decoder.decode(ab);
	}

	flush() {
		return this._d_decoder.decode();
	}
}

class StringDecoderProxy {
	constructor() {
		const d_decoder = this._d_decoder = new StringDecoder('utf8');

		this.decode = ab => d_decoder.write(ab);
	}

	flush() {
		return this._d_decoder.end();
	}
}

class DecoderUnavailableProxy {
	decode() {
		throw new Error(`Unable to decode chunk of bytes since no UTF-8 encoder is available in the current environment`);
	}

	flush() {
		return '';
	}
}

let DecoderProxy = null;

export async function resolve_decoder_proxy() {
	if(DecoderProxy) return DecoderProxy;

	if('function' === typeof TextDecoder) return DecoderProxy = TextDecoder;
	try {
		const {
			StringDecoder,
		} = await import('string_decoder');

		return DecoderProxy = StringDecoder;
	}
	catch(e_import) {
		return DecoderProxy = DecoderUnavailableProxy;
	}
}

// export const DecoderProxy = 'function' === typeof TextDecoder
// 	? TextDecoderProxy
// 	: ('function' === typeof StringDecoder
// 		? StringDecoderProxy
// 		: DecoderUnavailableProxy);


export class ArrayBufferReader {
	constructor(z_input) {
		this._atu8_content = z_input instanceof Uint8Array
			? z_input
			: (z_input instanceof ArrayBuffer
				? new Uint8Array(z_input)
				: new Uint8Array(z_input.buffer)
			);
	}

	async* [Symbol.asyncIterator]() {
		await resolve_decoder_proxy();
		const k_decoder = new DecoderProxy();
		const atu8_content = this._atu8_content;
		const nb_content = atu8_content.byteLength;

		let ib_next = 0;
		for(let ib_read=0; ib_read<nb_content; ib_read=ib_next) {
			// read 64 KiB at a time
			ib_next += 0x10000;

			// take next chunk
			const atu8_chunk = atu8_content.subarray(ib_read, ib_next);

			// decode to string
			const s_chunk = k_decoder.decode(atu8_chunk);

			// yield if anything is there
			if(s_chunk) yield s_chunk;
		}

		// flush
		const s_flush = k_decoder.flush();
		if(s_flush) yield s_flush;
	}
}


export function create_static_run_method(dc_consumer, dc_stream) {
	return async function ContentReader$_run(z_input, gc_run) {
		// instantiate consumer
		const k_consumer = new dc_consumer(gc_run, dc_stream);

		// string
		if('string' === typeof z_input) {
			return k_consumer.consume_string(z_input);
		}
		// Promise; recurse on awaited value
		else if(z_input instanceof Promise) {
			return await ContentReader$_run(await z_input, gc_run);
		}

		// environment supports ReadableStream
		if('function' === typeof ReadableSteam) {
			// TransformStream does not exist
			if('function' !== typeof TransformStream) {
				throw new Error(`The current environment lacks the prerequisite TransformStream class in order to handle the ReadableSteam input`);
			}

			// prep transform instance
			let d_transform = null;
			let d_input = null;

			// input is a Response
			if('function' === typeof Response && z_input instanceof Response) {
				// TextDecoderStream exists; use it
				if('function' === typeof TextDecoderStream) {
					d_transform = new TextDecoderStream();
				}
				// TextDecoder exists; create a text decoding transform stream
				else if('function' === typeof TextDecoder) {
					d_transform = new TransformStream(G_TEXT_DECODER_STREAM_METHODS);
				}
				// neither exist :(
				else {
					throw new Error(`The current environment lacks the prerequisite TextDecoder class in order to decode the ReadableStream from a Response body`);
				}

				// set input stream to Response body
				d_input = z_input.body;
			}
			// input is a ReadableStream, values could be anything
			else if(z_input instanceof ReadableStream) {
				// create a value-agnostic decoder transform stream
				d_transform = new TransformStream({
					...G_TEXT_DECODER_STREAM_METHODS,

					transform(w_chunk, d_controller) {
						// chunk is a string; pass as-is
						if('string' === typeof w_chunk) {
							d_controller.enqueue(w_chunk);
						}
						// chunk is data view or array buffer
						else if(ArrayBuffer.isView(w_chunk) || w_chunk instanceof ArrayBuffer) {
							const s_decoded = this._d_decoder.decode(w_chunk, {
								stream: true,
							});

							if('' !== s_decoded) d_controller.enqueue(s_decoded);
						}
						// invalid
						else {
							throw new Error(`Invalid chunk type encountered while reading user provided ReadableStream: ${debug_arg(w_chunk)}`);
						}
					},
				});

				// set input stream
				d_input = z_input;
			}

			// transform was defined
			if(d_transform) {
				// decoode input stream
				const d_readable = d_input.pipeThrough(d_transform);

				// readable is async iterable; consume as async iterable
				if(Symbol.asyncIterator in d_readable) {
					return await k_consumer.consume_async_iterable_strings(d_readable);
				}
				// consume as ReadableStream
				else {
					return await k_consumer.consume_whatwg_readable_stream_strings(d_readable);
				}
			}
		}

		// node.js stream
		if('function' === typeof z_input.setEncoding) {
			return await k_consumer.consume_stream(z_input);
		}

		// async iterable
		if(Symbol.asyncIterator in z_input) {
			// consume as async iterable of any value types
			return await k_consumer.consume_async_iterable_any(z_input);
		}

		// ArrayBuffer
		if(ArrayBuffer.isView(z_input) || z_input instanceof ArrayBuffer) {
			// scan in chunks
			return await k_consumer.consume_async_iterable_strings(new ArrayBufferReader(z_input));
		}

		// nothing worked
		throw new TypeError(`Invalid 'input' argument type in call to @graphy/content.${dc_consumer.name}.run(); ${debug_arg(z_input)}"`);
	};
}
