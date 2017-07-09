/* eslint-disable */

/* eslint-disable */

/* eslint-disable */


















const EventEmitter = require('events');

const R_ESCAPES = /(\\[\\])|\\([^tbnrfu\\])/g;
const R_UNICODE_8 = /\\U(?:0000([0-9A-Fa-f]{4})|([0-9A-Fa-f]{8}))/g;
const R_UNICODE_ANY = /\\u([0-9A-Fa-f]{4})|\\U([0-9A-Fa-f]{8})/g;

const F_UNICODE_REPLACE = (s_, s_4, s_8) => {
	if (s_4) return String.fromCharCode(parseInt(s_4, 16));

	// produce utf16 be surrogate pair
	let x_cp = parseInt(s_8, 16) - 0x10000;
	return String.fromCharCode(0xD800 + (x_cp >> 10), 0xDC00 + (x_cp & 0x3FF));
};

// queue data events instead of emitting them
const F_QUEUE_DATA = function(h_data) {
	this.queue_event.push(h_data);
};

// simply flag that consumer requested pause
const F_PAUSE_NEGATIZE = function() {
	this.n = -1;
};

const R_CLEAN = /\s*(?:#[^\n]*\n\s*)*\s*/y;
const R_LITERAL_ESCAPELESS = /^"([^\\"]*)"(?:\^\^<([^\\>]*)>|@([^ \t.]+)|)?$/;
const R_LITERAL = /^"(.*)"(?:\^\^<(.*)>|@([^ \t.]+)|)?$/;
const R_HAS_ESCAPES = /[\\]/;

const R_QUAD_ESCAPELESS_SP = /(?:<([^\\>]*)>|_:([^ \t<]+))[ \t]*<([^\\>]*)>[ \t]*(.*?)[ \t]*(?:<([^>]*)>|_:([^ \t<]+)|)[ \t]*\.\s*(?:#[^\n]*\n\s*|\n\s*)+/y;
const R_QUAD = /(?:<([^>]*)>|_:([^ \t<]+))[ \t]*<([^>]*)>[ \t]*(.*?)[ \t]*(?:<([^>]*)>|_:([^ \t<]+)|)[ \t]*\.\s*(?:#[^\n]*\n\s*|\n\s*)+/y;

function GenericTerm() {}
Object.assign(GenericTerm.prototype, {
	equals(h_other) {
		return (h_other.termType === this.termType && h_other.value === this.value);
	},
	toCanonical() {
		return this.valueOf();
	},
});


function NamedNode(s_iri) {
	this.value = s_iri;
}
NamedNode.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		termType: 'NamedNode',
		isNamedNode: true,
		valueOf() {
			return this.value;
		},
		verbose() {
			return '<' + this.value + '>';
		},
		terse() {
			return '<' + this.value + '>';
		},
	});

const HP_NN_XSD_STRING = new NamedNode('http://www.w3.org/2001/XMLSchema#string');
const HP_NN_RDFS_LANG_STRING = new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#langString');

function Literal(s_value) {
	this.value = s_value;
}
Literal.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		datatype: HP_NN_XSD_STRING,
		termType: 'Literal',
		isLiteral: true,
		equals(h_other) {
			return 'Literal' === h_other.termType && h_other.value === this.value &&
				this.datatype.equals(h_other.datatype) && h_other.language === this.language;
		},
		valueOf() {
			return (this.language ? '@' + this.language : '^' + this.datatype.value) +
				'"' + this.value;
		},
		verbose() {
			return JSON.stringify(this.value) +
				(this.language ?
					'@' + this.language :
					(this.datatype !== HP_NN_XSD_STRING ?
						'^^<' + this.datatype.value + '>' :
						''));
		},
		terse() {
			return JSON.stringify(this.value) +
				(this.language ?
					'@' + this.language :
					(this.datatype !== HP_NN_XSD_STRING ?
						'^^<' + this.datatype.value + '>' :
						''));
		},
	});


function BlankNode(s_value) {
	this.value = s_value;
}
BlankNode.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		termType: 'BlankNode',
		isBlankNode: true,
		valueOf() {
			return ' ' + this.value;
		},
		verbose() {
			return '_:' + this.value;
		},
		terse() {
			return '_:' + this.value;
		},
	});

function DefaultGraph() {}
DefaultGraph.prototype = Object.assign(
	Object.create(GenericTerm.prototype), {
		value: '',
		termType: 'DefaultGraph',
		isDefaultGraph: true,
		valueOf() {
			return '*';
		},
		verbose() {
			return '';
		},
		terse() {
			return '';
		},
	});

const H_DEFAULT_GRAPH = new DefaultGraph();

function Quad(subject, predicate, object, graph) {
	this.subject = subject;
	this.predicate = predicate;
	this.object = object;
	this.graph = graph;
}

Object.assign(Quad.prototype, {
	equals(y_other) {
		return this.object.equals(y_other.object) &&
			this.subject.equals(y_other.subject) &&
			this.predicate.equals(y_other.predicate) &&
			this.graph.equals(y_other.graph);
	},
	// terse() {
	// 	return this.subject.terse()
	// 		+' '+this.predicate.terse()
	// 		+' '+this.object.terse()
	// 		+' '+(this.graph.isDefaultGraph ? '' : this.graph.toCanonical()+' ')+'.\n';
	// },
	valueOf() {
		return this.graph + ' ' + this.subject + ' ' + this.predicate + ' ' + this.object;
	},
});








function Parser(z_input, h_config) {

	// members
	Object.assign(this, {

		// left-over string from previous data chunk
		pre: '',

		// pause control
		n: 0,

		// events
		data: h_config.data,

		// for restoring the original event callback when resuming paused stream
		restore_data: h_config.data,

		// keep a queue of data events to hold onto until stream resumes (only happens in rare conditions)
		queue_event: [],

		// error event
		_error: h_config.error || ((e_parse) => {
			throw `parse error: ${e_parse}`;
		}),

		// parse_error (not meant to be an event callback)
		parse_error(s_expected) {
			let i = 0;
			let i_off = 0;
			let s = this.s;
			this._error(`\n\`${s.substr(i_off, i_off+30).replace(/[\n\t]/g, ' ')}\`\n` +
				` ${' '.repeat(i-i_off)}^\n` +
				`expected ${s_expected}.  failed to parse a valid token starting at ${s[i]? '"'+s[i]+'"': '<EOF>'}`);
		},
	});

	// end of file
	const eof = (b_no_callback) => {
		// there is still unparsed data
		if (this.pre.length) {
			// append newline to end so we can match quad token
			this.statement('\n');

			// still unparsed characters
			if (this.pre.length) {
				// save string and index before calling parse error
				this.s = this.pre;

				// throw parse error
				this.parse_error('statement');
			}
		}

		// make buffer's alloc eligible for gc
		this.pre = null;

		// our duty to notify listener
		if (1 !== b_no_callback) {
			// call end event listener
			if (h_config.end) {
				h_config.end();
			}
			// event emitter
			else {
				this.emit('end');
			}
		}
	};


	// duplex
	if (null === z_input) {
		// create transform
		let d_transform = new require('stream').Transform();

		// prep buffer to build string before flush
		let a_buffer = [];

		// transform
		this.data = (h_statement) => {
			// synchronously transform quad
			h_config.data(h_statement, a_buffer);

			// // also emit data event
			// this.emit('data', h_statement);
		};

		// user wants to be notified when input is readable
		if (h_config.ready) d_transform.on('readable', h_config.ready);

		// once there's no more data to consume, invoke eof
		d_transform._flush = (f_done) => {
			// now that stream has ended, clean up remainder
			eof(1);

			if (a_buffer.length) {
				d_transform.push(a_buffer.join('') + '', 'utf8');
				a_buffer.length = 0;
			}

			// call end event listener
			if (h_config.end) {
				// allow 'end' callback to write to output stream
				h_config.end(d_transform);
			}

			// close write stream (EOF-signaling)
			d_transform.push(null);

			// close read stream
			f_done();
		};

		// on data event
		d_transform._transform = (s_chunk, s_encoding, f_okay_chunk) => {
			// prep string to parse
			let s = this.pre + s_chunk;

			// remove whitespace & comments from beginning
			R_CLEAN.lastIndex = 0;
			R_CLEAN.exec(s);

			// update index and prepare to match statement
			let i = R_CLEAN.lastIndex;

			// match quads
			while (true) {

				// prepare sticky regex index
				R_QUAD_ESCAPELESS_SP.lastIndex = i;

				// execute regex
				let m_statement_e_sp = R_QUAD_ESCAPELESS_SP.exec(s);

				// regex was a match
				if (m_statement_e_sp) {

					// advance index
					i = R_QUAD_ESCAPELESS_SP.lastIndex;
					// prep object term
					let w_object;

					// determine object term type
					let s_object = m_statement_e_sp[4];

					let x = s_object[0];

					// objet term type is literal
					if ('"' === x) {
						// no escapes in string nor datatype
						let m_literal_e = R_LITERAL_ESCAPELESS.exec(s_object);
						if (m_literal_e) {
							// literal has no escapes
							w_object = new Literal(m_literal_e[1]);

							// set datatype if present
							if (m_literal_e[2]) {
								w_object.datatype = new NamedNode(m_literal_e[2]);
							}
							// otherwise, set langtag if present
							else if (m_literal_e[3]) {
								w_object.language = m_literal_e[3];
								w_object.datatype = HP_NN_RDFS_LANG_STRING;
							}
						}
						// escapes in string and/or datatype
						else {
							let m_literal = R_LITERAL.exec(s_object);

							// objet term type is literal
							if (m_literal) {
								// ref literal value
								let s_literal = m_literal[1];

								// string literal has escapes
								if (R_HAS_ESCAPES.test(s_literal)) {
									w_object = new Literal(JSON.parse('"' +
										s_literal
										.replace(R_UNICODE_8, F_UNICODE_REPLACE)
										.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
										.replace(/"/g, '\\"') // escape all quotes ;)
										+
										'"'));
								}
								// no escapes
								else {
									w_object = new Literal(s_literal);
								}

								// set datatype if present
								if (m_literal[2]) {
									w_object.datatype = new NamedNode(R_HAS_ESCAPES.test(m_literal[2]) ? m_literal[2].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_literal[2]);
								}
								// otherwise, set langtag if present
								else if (m_literal[3]) {
									w_object.language = m_literal[3];
									w_object.datatype = HP_NN_RDFS_LANG_STRING;
								}
							} else {
								this.s = s;
								this.parse_error('string literal');
							}
						}
					}
					// object term type is iri; make iri
					else if ('<' === x) {
						w_object = new NamedNode(s_object.slice(1, -1));
					}
					// object term type is blank node; make blank node
					else {
						// object term type is blank node; make blank node
						w_object = new BlankNode(s_object.substr(2));
					}

					// emit data event
					this.data(new Quad(
						m_statement_e_sp[1] ? new NamedNode(
							m_statement_e_sp[1]
						) : new BlankNode(m_statement_e_sp[2]),
						new NamedNode(
							m_statement_e_sp[3]
						),
						w_object,
						m_statement_e_sp[5] ?
						new NamedNode(R_HAS_ESCAPES.test(m_statement_e_sp[5]) ? m_statement_e_sp[5].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement_e_sp[5]) :
						(m_statement_e_sp[6] ?
							new BlankNode(m_statement_e_sp[6]) :
							H_DEFAULT_GRAPH)
					));


					// match_counter: 0

				} else {

					// prepare sticky regex index
					R_QUAD.lastIndex = i;

					// execute regex
					let m_statement = R_QUAD.exec(s);

					// regex was a match
					if (m_statement) {

						// advance index
						i = R_QUAD.lastIndex;
						// prep object term
						let w_object;

						// determine object term type
						let s_object = m_statement[4];

						let x = s_object[0];

						// objet term type is literal
						if ('"' === x) {
							// no escapes in string nor datatype
							let m_literal_e = R_LITERAL_ESCAPELESS.exec(s_object);
							if (m_literal_e) {
								// literal has no escapes
								w_object = new Literal(m_literal_e[1]);

								// set datatype if present
								if (m_literal_e[2]) {
									w_object.datatype = new NamedNode(m_literal_e[2]);
								}
								// otherwise, set langtag if present
								else if (m_literal_e[3]) {
									w_object.language = m_literal_e[3];
									w_object.datatype = HP_NN_RDFS_LANG_STRING;
								}
							}
							// escapes in string and/or datatype
							else {
								let m_literal = R_LITERAL.exec(s_object);

								// objet term type is literal
								if (m_literal) {
									// ref literal value
									let s_literal = m_literal[1];

									// string literal has escapes
									if (R_HAS_ESCAPES.test(s_literal)) {
										w_object = new Literal(JSON.parse('"' +
											s_literal
											.replace(R_UNICODE_8, F_UNICODE_REPLACE)
											.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
											.replace(/"/g, '\\"') // escape all quotes ;)
											+
											'"'));
									}
									// no escapes
									else {
										w_object = new Literal(s_literal);
									}

									// set datatype if present
									if (m_literal[2]) {
										w_object.datatype = new NamedNode(R_HAS_ESCAPES.test(m_literal[2]) ? m_literal[2].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_literal[2]);
									}
									// otherwise, set langtag if present
									else if (m_literal[3]) {
										w_object.language = m_literal[3];
										w_object.datatype = HP_NN_RDFS_LANG_STRING;
									}
								} else {
									this.s = s;
									this.parse_error('string literal');
								}
							}
						}
						// object term type is iri; make iri
						else if ('<' === x) {
							w_object = new NamedNode(s_object.slice(1, -1));
						}
						// object term type is blank node; make blank node
						else {
							// object term type is blank node; make blank node
							w_object = new BlankNode(s_object.substr(2));
						}

						// emit data event
						this.data(new Quad(
							m_statement[1] ? new NamedNode(
								R_HAS_ESCAPES.test(m_statement[1]) ? m_statement[1].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement[1]
							) : new BlankNode(m_statement[2]),
							new NamedNode(
								R_HAS_ESCAPES.test(m_statement[3]) ? m_statement[3].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement[3]
							),
							w_object,
							m_statement[5] ?
							new NamedNode(R_HAS_ESCAPES.test(m_statement[5]) ? m_statement[5].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement[5]) :
							(m_statement[6] ?
								new BlankNode(m_statement[6]) :
								H_DEFAULT_GRAPH)
						));

						// match counter: 0
					} else {
						// break loop to retry on next chunk if eos
						break;

					}


				} // end of while

				// update unparsed data string
				this.pre = s.substr(i);

				if (a_buffer.length) {
					d_transform.push(a_buffer.join('') + '', 'utf8');
					a_buffer.length = 0;
				}

				// user wants progress updates
				if (h_config.progress) h_config.progress(s_chunk.length);

				// done transforming this chunk
				f_okay_chunk();
			};


			// pause the parser (& stream if applicable)
			this.pause = this.restore_pause = function() {
				// already paused
				if (this.n < 0) return;

				// pause readable input stream
				d_transform.pause();

				// set length too low so execution will hault
				this.n = -1;

				// save original data event callback
				this.restore_data = this.data;

				// set up callback to capture data events that happen while pausing
				this.data = F_QUEUE_DATA;

			};

			// hault the parser (& close stream if applicable/possible)
			this.stop = function() {
				// cause parser to break asap
				this.n = -1;

				// safely remove event callbacks and user functions
				this.pause = this.restore_pause =
					this.resume = this.stop =
					this.error = this.end = this.parse_error =
					this.data = this.restore_data =
					function() {};

				// empty event queue in case user paused and accumulated events
				this.queue_event.length = 0;

				// attempt to destroy the readable stream
				if ('function' === typeof d_transform.destroy) {
					d_transform.destroy();
				}
			};

			// resume the parser (& stream if applicable)
			this.resume = function() {
				// not even paused
				if (this.n >= 0) return;

				// enter pseudo-"flowing" mode
				this.n = 0;

				// temporarily re-route calls to pause
				this.pause = F_PAUSE_NEGATIZE;

				// now back in "flowing", drain event queue
				while (this.queue_event.length) {
					// remove event from front of queue
					let h_event = this.queue_event.shift();

					// make event callback
					this.restore_data(h_event, d_transform);

					// callback paused stream
					if (this.n < 0) {
						// stop emptying event queue and go async immediately
						return;
					}
				}

				// now that event queue is empty, resume readable input stream
				d_transform.resume();

				// restore pause function
				this.pause = this.restore_pause;

				// restore data event
				this.data = this.restore_data;

			};

			// public operator
			this.operator = d_transform;

			// // event emitter
			// this.emit = d_transform.emit.bind(d_transform);
		}
		// stream
		else if (z_input.setEncoding) {
			// set encoding on stream
			z_input.setEncoding('utf8');

			// no data event callback
			if (!h_config.data) {
				// bind data event call to event emitter
				this.data = function(h_statement) {
					this.emit('data', h_statement);
				};
			}

			// user wants to be notified when input is readable
			if (h_config.ready) z_input.on('readable', h_config.ready);

			// once stream closes, invoke eof
			z_input.on('end', eof);

			// on data event
			z_input.on('data', (s_chunk) => {
					// prep string to parse
					let s = this.pre + s_chunk;

					// remove whitespace & comments from beginning
					R_CLEAN.lastIndex = 0;
					R_CLEAN.exec(s);

					// update index and prepare to match statement
					let i = R_CLEAN.lastIndex;

					// match quads
					while (true) {

						// prepare sticky regex index
						R_QUAD_ESCAPELESS_SP.lastIndex = i;

						// execute regex
						let m_statement_e_sp = R_QUAD_ESCAPELESS_SP.exec(s);

						// regex was a match
						if (m_statement_e_sp) {

							// advance index
							i = R_QUAD_ESCAPELESS_SP.lastIndex;
							// prep object term
							let w_object;

							// determine object term type
							let s_object = m_statement_e_sp[4];

							let x = s_object[0];

							// objet term type is literal
							if ('"' === x) {
								// no escapes in string nor datatype
								let m_literal_e = R_LITERAL_ESCAPELESS.exec(s_object);
								if (m_literal_e) {
									// literal has no escapes
									w_object = new Literal(m_literal_e[1]);

									// set datatype if present
									if (m_literal_e[2]) {
										w_object.datatype = new NamedNode(m_literal_e[2]);
									}
									// otherwise, set langtag if present
									else if (m_literal_e[3]) {
										w_object.language = m_literal_e[3];
										w_object.datatype = HP_NN_RDFS_LANG_STRING;
									}
								}
								// escapes in string and/or datatype
								else {
									let m_literal = R_LITERAL.exec(s_object);

									// objet term type is literal
									if (m_literal) {
										// ref literal value
										let s_literal = m_literal[1];

										// string literal has escapes
										if (R_HAS_ESCAPES.test(s_literal)) {
											w_object = new Literal(JSON.parse('"' +
												s_literal
												.replace(R_UNICODE_8, F_UNICODE_REPLACE)
												.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
												.replace(/"/g, '\\"') // escape all quotes ;)
												+
												'"'));
										}
										// no escapes
										else {
											w_object = new Literal(s_literal);
										}

										// set datatype if present
										if (m_literal[2]) {
											w_object.datatype = new NamedNode(R_HAS_ESCAPES.test(m_literal[2]) ? m_literal[2].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_literal[2]);
										}
										// otherwise, set langtag if present
										else if (m_literal[3]) {
											w_object.language = m_literal[3];
											w_object.datatype = HP_NN_RDFS_LANG_STRING;
										}
									} else {
										this.s = s;
										this.parse_error('string literal');
									}
								}
							}
							// object term type is iri; make iri
							else if ('<' === x) {
								w_object = new NamedNode(s_object.slice(1, -1));
							}
							// object term type is blank node; make blank node
							else {
								// object term type is blank node; make blank node
								w_object = new BlankNode(s_object.substr(2));
							}

							// emit data event
							this.data(new Quad(
								m_statement_e_sp[1] ? new NamedNode(
									m_statement_e_sp[1]
								) : new BlankNode(m_statement_e_sp[2]),
								new NamedNode(
									m_statement_e_sp[3]
								),
								w_object,
								m_statement_e_sp[5] ?
								new NamedNode(R_HAS_ESCAPES.test(m_statement_e_sp[5]) ? m_statement_e_sp[5].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement_e_sp[5]) :
								(m_statement_e_sp[6] ?
									new BlankNode(m_statement_e_sp[6]) :
									H_DEFAULT_GRAPH)
							));


							// match_counter: 0

						} else {

							// prepare sticky regex index
							R_QUAD.lastIndex = i;

							// execute regex
							let m_statement = R_QUAD.exec(s);

							// regex was a match
							if (m_statement) {

								// advance index
								i = R_QUAD.lastIndex;
								// prep object term
								let w_object;

								// determine object term type
								let s_object = m_statement[4];

								let x = s_object[0];

								// objet term type is literal
								if ('"' === x) {
									// no escapes in string nor datatype
									let m_literal_e = R_LITERAL_ESCAPELESS.exec(s_object);
									if (m_literal_e) {
										// literal has no escapes
										w_object = new Literal(m_literal_e[1]);

										// set datatype if present
										if (m_literal_e[2]) {
											w_object.datatype = new NamedNode(m_literal_e[2]);
										}
										// otherwise, set langtag if present
										else if (m_literal_e[3]) {
											w_object.language = m_literal_e[3];
											w_object.datatype = HP_NN_RDFS_LANG_STRING;
										}
									}
									// escapes in string and/or datatype
									else {
										let m_literal = R_LITERAL.exec(s_object);

										// objet term type is literal
										if (m_literal) {
											// ref literal value
											let s_literal = m_literal[1];

											// string literal has escapes
											if (R_HAS_ESCAPES.test(s_literal)) {
												w_object = new Literal(JSON.parse('"' +
													s_literal
													.replace(R_UNICODE_8, F_UNICODE_REPLACE)
													.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
													.replace(/"/g, '\\"') // escape all quotes ;)
													+
													'"'));
											}
											// no escapes
											else {
												w_object = new Literal(s_literal);
											}

											// set datatype if present
											if (m_literal[2]) {
												w_object.datatype = new NamedNode(R_HAS_ESCAPES.test(m_literal[2]) ? m_literal[2].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_literal[2]);
											}
											// otherwise, set langtag if present
											else if (m_literal[3]) {
												w_object.language = m_literal[3];
												w_object.datatype = HP_NN_RDFS_LANG_STRING;
											}
										} else {
											this.s = s;
											this.parse_error('string literal');
										}
									}
								}
								// object term type is iri; make iri
								else if ('<' === x) {
									w_object = new NamedNode(s_object.slice(1, -1));
								}
								// object term type is blank node; make blank node
								else {
									// object term type is blank node; make blank node
									w_object = new BlankNode(s_object.substr(2));
								}

								// emit data event
								this.data(new Quad(
									m_statement[1] ? new NamedNode(
										R_HAS_ESCAPES.test(m_statement[1]) ? m_statement[1].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement[1]
									) : new BlankNode(m_statement[2]),
									new NamedNode(
										R_HAS_ESCAPES.test(m_statement[3]) ? m_statement[3].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement[3]
									),
									w_object,
									m_statement[5] ?
									new NamedNode(R_HAS_ESCAPES.test(m_statement[5]) ? m_statement[5].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement[5]) :
									(m_statement[6] ?
										new BlankNode(m_statement[6]) :
										H_DEFAULT_GRAPH)
								));

								// match counter: 0
							} else {
								// break loop to retry on next chunk if eos
								break;

							}


						} // end of while

						// update unparsed data string
						this.pre = s.substr(i);;

						// user wants progress updates
						if (h_config.progress) h_config.progress(s_chunk.length);
					});


				// pause the parser (& stream if applicable)
				this.pause = this.restore_pause = function() {
					// already paused
					if (this.n < 0) return;

					// pause readable input stream
					z_input.pause();

					// set length too low so execution will hault
					this.n = -1;

					// save original data event callback
					this.restore_data = this.data;

					// set up callback to capture data events that happen while pausing
					this.data = F_QUEUE_DATA;

				};

				// hault the parser (& close stream if applicable/possible)
				this.stop = function() {
					// cause parser to break asap
					this.n = -1;

					// safely remove event callbacks and user functions
					this.pause = this.restore_pause =
						this.resume = this.stop =
						this.error = this.end = this.parse_error =
						this.data = this.restore_data =
						function() {};


					// attempt to destroy the readable stream
					if ('function' === typeof z_input.destroy) {
						z_input.destroy();
					}
				};

				// resume the parser (& stream if applicable)
				this.resume = function() {
					// not even paused
					if (this.n >= 0) return;

					// enter pseudo-"flowing" mode
					this.n = 0;

					// temporarily re-route calls to pause
					this.pause = F_PAUSE_NEGATIZE;

					// now back in "flowing", drain event queue
					while (this.queue_event.length) {
						// remove event from front of queue
						let h_event = this.queue_event.shift();

						// make event callback
						this.restore_data(h_event);

						// callback paused stream
						if (this.n < 0) {
							// stop emptying event queue and go async immediately
							return;
						}
					}

					// now that event queue is empty, resume readable input stream
					z_input.resume();

					// restore pause function
					this.pause = this.restore_pause;

					// restore data event
					this.data = this.restore_data;

				};

				// event emitter
				this.operator = new EventEmitter(); this.emit = this.operator.emit.bind(this);
			}
			// string
			else if ('string' === typeof z_input) {
				// set entire string as input
				this.pre = z_input;

				// no data event callback
				if (!h_config.data) {
					// bind data event call to event emitter
					this.data = function(h_statement) {
						this.emit('data', h_statement);
					};
				}

				// event emitter
				this.operator = new EventEmitter();
				this.emit = this.operator.emit.bind(this);


				// pause the parser (& stream if applicable)
				this.pause = this.restore_pause = function() {
					// already paused
					if (this.n < 0) return;


					// set length too low so execution will hault
					this.n = -1;

					// save original data event callback
					this.restore_data = this.data;

					// set up callback to capture data events that happen while pausing
					this.data = F_QUEUE_DATA;

				};

				// hault the parser (& close stream if applicable/possible)
				this.stop = function() {
					// cause parser to break asap
					this.n = -1;

					// safely remove event callbacks and user functions
					this.pause = this.restore_pause =
						this.resume = this.stop =
						this.error = this.end = this.parse_error =
						this.data = this.restore_data =
						function() {};


				};

				// resume the parser (& stream if applicable)
				this.resume = function() {
					// not even paused
					if (this.n >= 0) return;

					// enter pseudo-"flowing" mode
					this.n = 0;

					// temporarily re-route calls to pause
					this.pause = F_PAUSE_NEGATIZE;

					// now back in "flowing", drain event queue
					while (this.queue_event.length) {
						// remove event from front of queue
						let h_event = this.queue_event.shift();

						// make event callback
						this.restore_data(h_event);

						// callback paused stream
						if (this.n < 0) {
							// stop emptying event queue and go async immediately
							return;
						}
					}


					// restore pause function
					this.pause = this.restore_pause;

					// restore data event
					this.data = this.restore_data;

				};

				// parse all at once
				this.statement('\n');

				// reached eof
				if (h_config.async) {
					setImmediate(eof);
				} else {
					eof();
				}
			}
			// invalid arg
			else {
				throw new TypeError('[graphy] invalid argument for input parameter');
			}
		}


		Parser.prototype.statement = function(s_chunk) {
				// prep string to parse
				let s = this.pre + s_chunk;

				// remove whitespace & comments from beginning
				R_CLEAN.lastIndex = 0;
				R_CLEAN.exec(s);

				// update index and prepare to match statement
				let i = R_CLEAN.lastIndex;

				// match quads
				while (true) {

					// prepare sticky regex index
					R_QUAD_ESCAPELESS_SP.lastIndex = i;

					// execute regex
					let m_statement_e_sp = R_QUAD_ESCAPELESS_SP.exec(s);

					// regex was a match
					if (m_statement_e_sp) {

						// advance index
						i = R_QUAD_ESCAPELESS_SP.lastIndex;
						// prep object term
						let w_object;

						// determine object term type
						let s_object = m_statement_e_sp[4];

						let x = s_object[0];

						// objet term type is literal
						if ('"' === x) {
							// no escapes in string nor datatype
							let m_literal_e = R_LITERAL_ESCAPELESS.exec(s_object);
							if (m_literal_e) {
								// literal has no escapes
								w_object = new Literal(m_literal_e[1]);

								// set datatype if present
								if (m_literal_e[2]) {
									w_object.datatype = new NamedNode(m_literal_e[2]);
								}
								// otherwise, set langtag if present
								else if (m_literal_e[3]) {
									w_object.language = m_literal_e[3];
									w_object.datatype = HP_NN_RDFS_LANG_STRING;
								}
							}
							// escapes in string and/or datatype
							else {
								let m_literal = R_LITERAL.exec(s_object);

								// objet term type is literal
								if (m_literal) {
									// ref literal value
									let s_literal = m_literal[1];

									// string literal has escapes
									if (R_HAS_ESCAPES.test(s_literal)) {
										w_object = new Literal(JSON.parse('"' +
											s_literal
											.replace(R_UNICODE_8, F_UNICODE_REPLACE)
											.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
											.replace(/"/g, '\\"') // escape all quotes ;)
											+
											'"'));
									}
									// no escapes
									else {
										w_object = new Literal(s_literal);
									}

									// set datatype if present
									if (m_literal[2]) {
										w_object.datatype = new NamedNode(R_HAS_ESCAPES.test(m_literal[2]) ? m_literal[2].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_literal[2]);
									}
									// otherwise, set langtag if present
									else if (m_literal[3]) {
										w_object.language = m_literal[3];
										w_object.datatype = HP_NN_RDFS_LANG_STRING;
									}
								} else {
									this.s = s;
									this.parse_error('string literal');
								}
							}
						}
						// object term type is iri; make iri
						else if ('<' === x) {
							w_object = new NamedNode(s_object.slice(1, -1));
						}
						// object term type is blank node; make blank node
						else {
							// object term type is blank node; make blank node
							w_object = new BlankNode(s_object.substr(2));
						}

						// emit data event
						this.data(new Quad(
							m_statement_e_sp[1] ? new NamedNode(
								m_statement_e_sp[1]
							) : new BlankNode(m_statement_e_sp[2]),
							new NamedNode(
								m_statement_e_sp[3]
							),
							w_object,
							m_statement_e_sp[5] ?
							new NamedNode(R_HAS_ESCAPES.test(m_statement_e_sp[5]) ? m_statement_e_sp[5].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement_e_sp[5]) :
							(m_statement_e_sp[6] ?
								new BlankNode(m_statement_e_sp[6]) :
								H_DEFAULT_GRAPH)
						));


						// match_counter: 0

					} else {

						// prepare sticky regex index
						R_QUAD.lastIndex = i;

						// execute regex
						let m_statement = R_QUAD.exec(s);

						// regex was a match
						if (m_statement) {

							// advance index
							i = R_QUAD.lastIndex;
							// prep object term
							let w_object;

							// determine object term type
							let s_object = m_statement[4];

							let x = s_object[0];

							// objet term type is literal
							if ('"' === x) {
								// no escapes in string nor datatype
								let m_literal_e = R_LITERAL_ESCAPELESS.exec(s_object);
								if (m_literal_e) {
									// literal has no escapes
									w_object = new Literal(m_literal_e[1]);

									// set datatype if present
									if (m_literal_e[2]) {
										w_object.datatype = new NamedNode(m_literal_e[2]);
									}
									// otherwise, set langtag if present
									else if (m_literal_e[3]) {
										w_object.language = m_literal_e[3];
										w_object.datatype = HP_NN_RDFS_LANG_STRING;
									}
								}
								// escapes in string and/or datatype
								else {
									let m_literal = R_LITERAL.exec(s_object);

									// objet term type is literal
									if (m_literal) {
										// ref literal value
										let s_literal = m_literal[1];

										// string literal has escapes
										if (R_HAS_ESCAPES.test(s_literal)) {
											w_object = new Literal(JSON.parse('"' +
												s_literal
												.replace(R_UNICODE_8, F_UNICODE_REPLACE)
												.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
												.replace(/"/g, '\\"') // escape all quotes ;)
												+
												'"'));
										}
										// no escapes
										else {
											w_object = new Literal(s_literal);
										}

										// set datatype if present
										if (m_literal[2]) {
											w_object.datatype = new NamedNode(R_HAS_ESCAPES.test(m_literal[2]) ? m_literal[2].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_literal[2]);
										}
										// otherwise, set langtag if present
										else if (m_literal[3]) {
											w_object.language = m_literal[3];
											w_object.datatype = HP_NN_RDFS_LANG_STRING;
										}
									} else {
										this.s = s;
										this.parse_error('string literal');
									}
								}
							}
							// object term type is iri; make iri
							else if ('<' === x) {
								w_object = new NamedNode(s_object.slice(1, -1));
							}
							// object term type is blank node; make blank node
							else {
								// object term type is blank node; make blank node
								w_object = new BlankNode(s_object.substr(2));
							}

							// emit data event
							this.data(new Quad(
								m_statement[1] ? new NamedNode(
									R_HAS_ESCAPES.test(m_statement[1]) ? m_statement[1].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement[1]
								) : new BlankNode(m_statement[2]),
								new NamedNode(
									R_HAS_ESCAPES.test(m_statement[3]) ? m_statement[3].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement[3]
								),
								w_object,
								m_statement[5] ?
								new NamedNode(R_HAS_ESCAPES.test(m_statement[5]) ? m_statement[5].replace(R_UNICODE_ANY, F_UNICODE_REPLACE) : m_statement[5]) :
								(m_statement[6] ?
									new BlankNode(m_statement[6]) :
									H_DEFAULT_GRAPH)
							));

							// match counter: 0
						} else {
							// break loop to retry on next chunk if eos
							break;

						}


					} // end of while

					// update unparsed data string
					this.pre = s.substr(i);;
				};



				module.exports = function(z_input, h_config) {
					// duplex mode
					if (1 === arguments.length) {
						// shift arguments
						h_config = z_input;
						z_input = null;
					}

					// create parser, return operator if it wants to
					return (new Parser(z_input, h_config)).operator;
				};