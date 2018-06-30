

class TextualStreamingParser {
	constructor() {
		// fields
		Objet.assign(this, {
			// string buffer
			s: '',

			// string buffer length
			n: 0,

			// left-over string from previous data chunk
			pre: g_config.prepend || '',
		});

		// output stream
		let ds_output;

		// no input given, it will be written/piped in later
		if(null === z_input) {
			// whether or not data has been received before
			let b_init = false;

			// create transform
			ds_output = this.output = new stream.Transform({
				// do not decode strings into buffers
				decodeStrings: false,

				// output quad objects on readable side
				readableObjectMode: true,

				// once there's no more data to consume, invoke eof
				flush: (fk_flush) => {
					// now that stream has ended, clean up remainder
					eof(1);

					// done flushing, close read stream
					fk_flush();
				},

				// on data event
				transform: (s_chunk, s_encoding, fk_chunk) => {
					// first transform
					if(!b_init) {
						// notify that data will begin
						ds_output.emit('ready');

						// do not emit 'ready' event again
						b_init = false;
					}

					// stream is paused
					if(this.n < 0) {
						return this.error('stream received new data while it was supposed to be paused!');
					}

					// concatenate current chunk to previous chunk
					let s = this.s = this.pre + s_chunk;

					// cache chunk length
					this.n = s.length;

					// consume characters that may have tailed from previous token (e.g., whitespace)
					this.prime_state();

					// resume parsing
					this.safe_parse();

					// emit progress event updates
					ds_output.emit('progress', s_chunk.length);

					// done transforming this chunk
					fk_chunk();
				},
			});

			// bind events to output stream
			this.bind(ds_output, g_config);

			// notify once and never again
			ds_output.once('pipe', (ds_input) => {
				// input stream has encoding option
				if(ds_input.setEncoding) {
					// ensure stream is encoding in utf8
					ds_input.setEncoding('utf8');
				}
			});
		}
		// input is stream
		else if(z_input.setEncoding) {
			// whether or not data has been received before
			let b_init = false;

			// begin flowing mode on output stream
			const begin_flow = () => {
				// switch input to flowing mode
				z_input.on('data', (s_chunk, n_bytes) => {
					// stream is paused
					if(this.n < 0) {
						return this.error('stream received new data while it was supposed to be paused!');
					}

					// notify that data will begin
					if(!b_init) {
						ds_output.emit('ready');

						// do not notify again
						b_init = true;
					}

					// concatenate current chunk to previous chunk
					let s = this.s = this.pre + s_chunk;

					// cache chunk length
					this.n = s.length;

					// consume characters that may have tailed from previous token (e.g., whitespace)
					this.prime_state();

					// resume parsing
					this.safe_parse();

					// progress updates
					ds_output.emit('progress', s_chunk.length);
				});
			};

			// manual read mode
			const read_manual = (nb_read) => {
				// rather than emitting data/other events, queue them
				this.data = F_QUEUE_DATA;
				this.event = this.queue;

				// subscribe to readable events on input
				z_input.on('readable', () => {
					// read chunk from input stream while there is data to read
					let s_chunk = z_input.read();

					// notify that data will begin
					if(!b_init) {
						ds_output.emit('ready');

						// do not notify again
						b_init = true;
					}

					// concatenate current chunk to previous chunk
					let s = this.s = this.pre + s_chunk;

					// cache chunk length
					this.n = s.length;

					// consume characters that may have tailed from previous token (e.g., whitespace)
					this.prime_state();

					// resume parsing
					this.safe_parse();

					// progress updates
					ds_output.emit('progress', s_chunk.length);

					// return ...?
				});
			};

			// create readable output
			ds_output = this.output = new stream.Readable({
				// outputs quad objets
				objectMode: true,

				// this will only happen if consumer uses stream in non-folowing mode
				read(nb_read) {
					// which flowing mode
					switch(ds_output.readableFlowing) {
						// in flowing mode (#pipe, #'data', or #resume)
						case true: {
							// ignore read requests
							ds_output._read = () => {};

							// begin flowing
							begin_flow();
							break;
						}

						// manual reads
						case false:
						case null: {
							// switch to manual read mode
							ds_output._read = read_manual;

							// forward request to handler
							return ds_output._read(nb_read);
						}

						// no mechanism for consuming
						default: {
							debugger;
							// do not start reading input, do not parse, do not emit
						}
					}
				},
			});

			// bind events to output stream
			this.bind(ds_output, g_config);

			// set encoding on input stream
			z_input.setEncoding('utf8');

			// once stream closes, invoke eof
			z_input.on('end', eof);

			// capture error on input
			z_input.on('error', (e_input) => {
				ds_output.emit('error', `error on input stream: ${e_input.message}\n${e_input.stack}`);
			});
		}
		// string
		else if('string' === typeof z_input) {
			// create readable output
			ds_output = this.output = new stream.Readable({
				// outputs quad objets
				objectMode: true,

				// once data event is attached
				read: () => {
					// prepare to begin parsing
					this.prime_state();

					// consume entire string
					this.safe_parse();

					// remove this handler
					ds_output._read = () => {};
				},
			});

			// concatenate previous chunk
			let s = this.s = this.pre+z_input;

			// eos means we've reached eof
			if(g_config.async) {
				this.eos = function() {
					setTimeout(eof, 0);
				};
			}
			else {
				this.eos = eof;
			}

			// compute chunk length
			this.n = s.length;

			// reset index
			this.i = 0;

			// bind events to output stream
			this.bind(ds_output, g_config);

			// ready to parse
			ds_output.emit('ready');
		}
		// invalid arg
		else {
			throw new TypeError('invalid argument for input parameter: '+z_input);
		}
	}

	_error(s_message) {
		this.output.emit('error', new Error(s_message));
	}

	// bind event listeners to output stream
	bind(ds_output, g_config) {
		@*{
			for(let [s_event, g_event] of Object.entries(H_PARSE_EVENTS)) {
				yield /* syntax: js */ `
					if(g_config.${s_event}) ds_output.${g_event.once? 'once': 'on'}('${s_event}', g_config.${s_event});
					`.trim();
			}
		}
	}

	emit(s_event, ...a_args) {
		this.output.emit(s_event, ...a_args);
	}

	queue(s_event, ...a_args) {
		this.queue_event.push({
			event: s_event,
			args: a_args,
		});
	}

	emit_data(g_quad) {
		this.output.push(g_quad);
	}

	// begin parsing, keep applying until no more stack bail-outs
	safe_parse() {
		let f_sync = this.state();
		while('function' === typeof f_sync) {
			f_sync = f_sync.apply(this);
		}

		return f_sync;
	}

}