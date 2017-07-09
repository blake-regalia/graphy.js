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
	this.queue_event.push({
		event: 'restore_data',
		data: h_data,
	});
};

// simply flag that consumer requested pause
const F_PAUSE_NEGATIZE = function() {
	this.n = -1;
};

const R_IRIREF_ESCAPELESS = /<([^\\>]*)>\s*/y;
const R_IRIREF = /<([^>]*)>\s*/y;
const R_PREFIXED_NAME_ESCAPELESS = /([^#:<\[("'_][^\s#:<\[("']*)?:([^\s#<\[("'.;,)\]\\]*)(?:\s+|(?=[<\[("';,)\]#]))/y;
// const R_PREFIXED_NAME_ESCAPELESS_WITH_STOPS = /([^#:<\[("'_][^\s#:<\[("']*)?:((?:[^\s#<\[("'.;,)\]\\]*[^\s#<\[("';,)\]\\])?)(?:\s+|(?=[<\[("'.;,)\]#]))/y;
const R_PREFIXED_NAME = /([^\s#:<\[("'_][^\s#:<\[("']*)?:((?:(?:[^\s#<\[("';,)\]\\]|\\.)*[^\s#<\[("'.;,)\]\\])?)(?:\s+|(?=[<\[("'.;,)\]#]))/y;
const R_PN_LOCAL_ESCAPES = /\\(.)/g;

const R_BLANK_NODE_LABEL = /_:(.(?:[^\s:<;,)\]#]*[^\s:<.;,)\]#])?)(?:\s+|(?=[<;,)\]#]))/y;

const R_STRING_LITERAL_QUOTE = /"((?:[^"\\]|\\.)*)"\s*/y;
const R_STRING_LITERAL_QUOTE_ESCAPELESS = /"([^"\\]*)"\s*/y;
const R_STRING_LITERAL_SINGLE_QUOTE = /'((?:[^'\\]|\\.)*)'\s*/y;
const R_STRING_LITERAL_SINGLE_QUOTE_ESCAPELESS = /'([^'\\]*)'\s*/y;
const R_STRING_LITERAL_LONG_QUOTE = /"""((?:(?:""?)?(?:[^"\\]|\\.))*(?:""?)?)"""\s*/y;
const R_STRING_LITERAL_LONG_SINGLE_QUOTE = /'''((?:(?:''?)?(?:[^'\\]|\\.))*(?:''?)?)'''\s*/y;

const R_NUMERIC_LITERAL = /([+\-]?(?:[0-9]+([.]?[0-9]*)|([.][0-9]+))([eE][+\-]?[0-9]+)?)(?:\s+|(?=\.[^0-9]|[;,)\]]))/y;
const R_BOOLEAN_LITERAL = /(?:(true|TRUE)|false|FALSE)\s*/y;
const R_A = /a(?:\s+|(?=[<\[#]))/y;

const R_DOUBLE_CARET = /\^\^/y;
const R_WS = /\s*/y;
const R_LANGTAG = /@([A-Za-z0-9\-]+)(?:\s+|(?=[.;,\])#]))/y;

const R_PREFIX = /@?prefix\s*([^#:]*):\s*<([^>]+)>\s*\.?\s*/iy;
const R_PREFIX_KEYWORD = /(@?)prefix\s*/iy;
const R_PREFIX_ID = /([^#:]*):\s*/iy;
const R_BASE = /@?base\s*<([^>]+)>\s*\.?\s*/iy;
const R_BASE_KEYWORD = /(@?)base\s*/iy;


const R_COMMENT = /(#[^\n]*\n\s*)+/y;

const R_IRI_ABSOLUTE = /^[A-Za-z][A-Za-z0-9.\-+]*:/;
const R_URI = /^(\/[^?#]+#?)/;
const R_BASE_IRI = /^((([A-Za-z0-9.\-+]*:\/)?\/[^\/>]*)?(\/(?:[^\/>]*\/)*)?[^>]*)$/;
const R_QUERYSTRING = /(\/[^/?#]*[?#].*)$/;

const R_ANONYMOUS_BLANK_NODE = /\[\]\s*/y;
const R_CHAR_BLANK_NODE = /\[(?:\s+|(?=[<:#]))/y;
const R_CHAR_COLLECTION = /\(\s*/y;


const R_CHAR_KET = /\]\s*/y


const R_CHAR_STOP = /\.\s*/y;

const P_IRI_RDF = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const HP_NN_RDF_TYPE = new NamedNode(P_IRI_RDF + 'type');
const HP_NN_RDF_FIRST = new NamedNode(P_IRI_RDF + 'first');
const HP_NN_RDF_REST = new NamedNode(P_IRI_RDF + 'rest');
const HP_NN_RDF_NIL = new NamedNode(P_IRI_RDF + 'nil');

const P_IRI_XSD = 'http://www.w3.org/2001/XMLSchema#';
const HP_NN_XSD_BOOLEAN = new NamedNode(P_IRI_XSD + 'boolean');
const HP_NN_XSD_INTEGER = new NamedNode(P_IRI_XSD + 'integer');
const HP_NN_XSD_DECIMAL = new NamedNode(P_IRI_XSD + 'decimal');
const HP_NN_XSD_DOUBLE = new NamedNode(P_IRI_XSD + 'double');

const H_SPECIAL_ESCAPES = {
	'\t': '\\t',
	'\u0008': '\\b',
	'\n': '\\n',
	'\r': '\\r',
	'\f': '\\f',
	'"': '\\"',
};




// queue prefix events instead of emitting them
const F_QUEUE_PREFIX = function(s_prefix_id, p_prefix_iri) {
	this.queue_event.push({
		event: 'restore_prefix',
		args: [s_prefix_id, p_prefix_iri],
	});
};

// instead of putting this in a macro to be unrolled at every IRI resolution,
// ... spare the monstrosity from the source and make it a function
const F_DOT_SEGMENTS = (s_rel_iri) => {
	let m_uri = R_URI.exec(s_rel_iri);
	if (!m_uri) return s_rel_iri;
	let s_iri = m_uri[1];

	//
	let m_qs_hash = R_QUERYSTRING.exec(s_iri);
	let s_qs_hash = '';
	if (m_qs_hash) {
		s_qs_hash = m_qs_hash[1];
		s_iri = s_iri.slice(0, -s_qs_hash.length);
	}

	let a_segments = s_iri.split('/');
	let a_output = [];
	let b_empty = true;

	for (let i = 0; i < a_segments.length; i++) {
		let s_segment = a_segments[i];
		b_empty = false;

		// up a hierarchical level
		if ('..' === s_segment) {
			if (a_output.length > 1) a_output.pop();
		}
		// down a level level
		else if ('.' !== s_segment && (s_segment || !i || i === a_segments.length - 1)) {
			a_output.push(s_segment);
		}
	}

	return a_output.join('/') + s_qs_hash;
};



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

function IntegerLiteral(s_value) {
	this.value = s_value;
	this.number = parseInt(s_value);
}
IntegerLiteral.prototype = Object.assign(
	Object.create(Literal.prototype), {
		terse() {
			return this.value;
		},
		datatype: new NamedNode('http://www.w3.org/2001/XMLSchema#integer'),
		isNumeric: true,
	});

function DecimalLiteral(s_value) {
	this.value = s_value;
	this.number = parseFloat(s_value);
}
DecimalLiteral.prototype = Object.assign(
	Object.create(Literal.prototype), {
		terse() {
			return this.value;
		},
		datatype: new NamedNode('http://www.w3.org/2001/XMLSchema#decimal'),
		isNumeric: true,
	});

function DoubleLiteral(s_value) {
	this.value = s_value;
	this.number = parseFloat(s_value);
}
DoubleLiteral.prototype = Object.assign(
	Object.create(Literal.prototype), {
		terse() {
			return this.value;
		},
		datatype: new NamedNode('http://www.w3.org/2001/XMLSchema#double'),
		isNumeric: true,
	});

function BooleanLiteral(b_value) {
	this.value = b_value ? 'true' : 'false';
	this.boolean = b_value;
}
BooleanLiteral.prototype = Object.assign(
	Object.create(Literal.prototype), {
		terse() {
			return this.value;
		},
		datatype: new NamedNode('http://www.w3.org/2001/XMLSchema#boolean'),
		isBoolean: true,
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

// creates a new Quad by copying the current terms from the parser state
function Quad(quad) {
	this.subject = quad.subject;
	this.predicate = quad.predicate;
	this.object = quad.object;
	this.graph = quad.graph;
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

	// track index for anonymous blank node labels
	let i_anon = 0;

	// members
	Object.assign(this, {
		// current parser state
		state: this.statement,

		// left-over string from previous data chunk
		pre: '',

		// current @base url
		base_url: '',
		base_url_scheme: '',
		base_url_root: '',
		base_url_path: '',

		// current data
		subject: null,
		predicate: HP_NN_RDF_FIRST,
		object: null,
		graph: H_DEFAULT_GRAPH,

		// events
		ready: h_config.ready || false,
		data: h_config.data || function() {},
		base: h_config.base || false,
		prefix: h_config.prefix || false,

		// for restoring the original event callback when resuming paused stream
		restore_data: h_config.data,
		restore_prefix: h_config.prefix,

		// keep a queue of data events to hold onto until stream resumes (only happens in rare conditions)
		queue_event: [],

		// map of current prefix ids => iris
		prefixes: {},

		// queue of nested subject, predicate, state for blanknodes and collections
		nested: [],

		// hash to keep track of all blank node labels in use
		labels: {},

		// finds the next non-conflicting blank node label
		next_label() {
			let s_label = '';
			do {
				s_label = 'g' + (i_anon++);
			} while (this.labels[s_label]);

			// claim this label, and remember that we invented it
			this.labels[s_label] = 2;

			// return the label
			return s_label;
		},

		// what to do when reach eos
		eos: false,

		// which state to go to after end of statement
		after_end_of_statement: this.post_object,

		// maximum length of a token: defaults to 2048 => http://stackoverflow.com/a/417184/1641160
		max_token_length: h_config.max_token_length || 2048,

		// maximum length of a string (overrides max_token_length): defaults to 64 kibibytes
		max_string_length: h_config.max_string_length || 65536,

		// error event
		_error: h_config.error || ((e_parse) => {
			throw `parse error: ${e_parse}`;
		}),

		// parse_error (not meant to be an event callback)
		parse_error(s_expected) {
			let i = this.i;
			let i_off = Math.min(i, Math.abs(i - 15));
			let s = this.s;
			this._error(`\n\`${s.substr(i_off, i_off+30).replace(/[\n\t]/g, ' ')}\`\n` +
				` ${' '.repeat(i-i_off)}^\n` +
				`expected ${s_expected}.  failed to parse a valid token starting at ${s[i]? '"'+s[i]+'"': '<EOF>'}`);
		},
	});

	// end of file
	const eof = (b_no_callback) => {
		// invalid parsing state
		if (this.statement !== this.state) {
			return this.parse_error(this.state.name);
		}
		// there are still unparsed characters
		else if (this.i < this.n) {
			// consume whitespace and comments
			let s = this.s;
			let i = this.i;
			R_WS.lastIndex = i;
			R_WS.exec(s);
			i = R_WS.lastIndex;
			R_COMMENT.lastIndex = i;
			R_COMMENT.exec(s);
			this.i = i = R_COMMENT.lastIndex;

			// still unparsed characters
			if (i < this.n) {
				// throw parse error
				return this.parse_error(this.state.name);
			}
		}

		// make buffer's alloc eligible for gc
		this.s = null;

		// final progress update
		if (h_config.progress) {
			// no additional bytes were read
			h_config.progress(0);
		}

		// our duty to notify listener
		if (1 !== b_no_callback) {
			this.operator.emit('end');
			// call end event listener
			if (h_config.end) {
				h_config.end(this.prefixes);
			}
			// otherwise log a warning
			else {
				console.warn('[graphy] reached end of file, but no `end` event listener to call');
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
		this.data_event = this.data = (h_statement) => {

			// synchronously transform data
			h_config.data(h_statement, a_buffer);

			// // also emit data event
			// this.emit('data', h_statement);
		};

		// user wants to be notified when input is readable
		if (this.ready) {
			// notify once and never again
			d_transform.once('pipe', () => {
				this.ready();
			});
		}

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
				h_config.end(d_transform, this.prefixes);
			}

			// close write stream (EOF-signaling)
			d_transform.push(null);

			// close read stream
			f_done();
		};

		// on data event
		d_transform._transform = (s_chunk, s_encoding, f_okay_chunk) => {
			// concatenate current chunk to previous chunk
			this.s = this.pre + s_chunk;

			// cache chunk length
			this.n = this.s.length;

			// consume whitespace (and incidentally reset chunk index)
			let s = this.s;
			R_WS.lastIndex = 0;
			R_WS.exec(s);
			this.i = R_WS.lastIndex;

			// begin
			this.state();

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

			// consumer is subscribed to prefix events
			if (this.prefix) {
				// save original prefix event callback
				this.restore_prefix = this.prefix;

				// set up callback to capture prefix events that happen while pausing
				this.prefix = F_QUEUE_PREFIX;
			}
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
				this.restore_prefix = this.prefix =
				this.base =
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
				this[h_event.event].call(this, h_event.data, d_transform);

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

			// restore actual length
			this.n = this.s.length;

			// restore prefix event
			if (this.prefix) {
				this.prefix = this.restore_prefix;
			}

			// resume state
			this.state();
		};

		// public operator
		this.operator = d_transform;
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

		// once stream closes, invoke eof
		z_input.on('end', eof);

		// begin
		z_input.on('data', (s_chunk) => {
			// user wants to be notified when input is readable
			if (this.ready) {
				this.ready();

				// do not notify again
				this.ready = false;
			}

			// concatenate current chunk to previous chunk
			this.s = this.pre + s_chunk;

			// cache chunk length
			this.n = this.s.length;

			// consume whitespace (and incidentally reset chunk index)
			let s = this.s;
			R_WS.lastIndex = 0;
			R_WS.exec(s);
			this.i = R_WS.lastIndex;

			// begin
			this.state();

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

			// consumer is subscribed to prefix events
			if (this.prefix) {
				// save original prefix event callback
				this.restore_prefix = this.prefix;

				// set up callback to capture prefix events that happen while pausing
				this.prefix = F_QUEUE_PREFIX;
			}
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
				this.restore_prefix = this.prefix =
				this.base =
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
				this[h_event.event].call(this, h_event.data);

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

			// restore actual length
			this.n = this.s.length;

			// restore prefix event
			if (this.prefix) {
				this.prefix = this.restore_prefix;
			}

			// resume state
			this.state();
		};

		// event emitter
		this.operator = new EventEmitter();
		this.emit = this.operator.emit.bind(this);
	}
	// string
	else if ('string' === typeof z_input) {
		// concatenate previous chunk
		this.s = z_input;

		// eos means we've reached eof
		if (h_config.async) {
			this.eos = function() {
				setTimeout(eof);
			}
		} else {
			this.eos = eof;
		}

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

		// compute chunk length
		this.n = this.s.length;

		// reset index
		this.i = 0;

		// consume whitespace
		let s = this.s;
		R_WS.lastIndex = 0;
		R_WS.exec(s);
		this.i = R_WS.lastIndex;


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

			// consumer is subscribed to prefix events
			if (this.prefix) {
				// save original prefix event callback
				this.restore_prefix = this.prefix;

				// set up callback to capture prefix events that happen while pausing
				this.prefix = F_QUEUE_PREFIX;
			}
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
				this.restore_prefix = this.prefix =
				this.base =
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
				this[h_event.event].call(this, h_event.data);

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

			// restore actual length
			this.n = this.s.length;

			// restore prefix event
			if (this.prefix) {
				this.prefix = this.restore_prefix;
			}

			// resume state
			this.state();
		};

		// user wants to be notified when input is readable
		if (h_config.ready) h_config.ready();

		// begin
		this.state();
	}
}

Object.assign(Parser.prototype, {

			// a resume-only state to handle eos interupting ';'
			post_pair() {
				let s = this.s;
				let x = s[this.i];
				if ('.' === x || ']' === x) {
					R_WS.lastIndex = this.i + 1;
					R_WS.exec(s);
					this.i = R_WS.lastIndex;
				}
				return this.pairs();
			},

			// after a blank node subject (either property-list or colleciton)
			post_blank_subject() {
				let s = this.s;
				if ('.' === s[this.i]) {
					R_WS.lastIndex = this.i + 1;
					R_WS.exec(s);
					this.i = R_WS.lastIndex;
					return this.statement();
				}
				return this.pairs();
			},

			// parse state for statement
			statement() {
				// destruct chunk, length, and index
				let {
					s,
					n,
					i
				} = this;

				// start labeled loop, run while there are characters
				statement: while (i < n) {

						// iriref

						// prepare sticky regex index
						R_IRIREF_ESCAPELESS.lastIndex = i;

						// execute regex
						let m_iriref_e_subject = R_IRIREF_ESCAPELESS.exec(s);

						// regex was a match
						if (m_iriref_e_subject) {

							// advance index
							this.i = R_IRIREF_ESCAPELESS.lastIndex;
							// ref iri
							let s_iri = m_iriref_e_subject[1];

							// absolute iri
							if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
								// set subject
								this.subject = new NamedNode(s_iri);
							}
							// relative iri
							else {
								// make subject
								switch (s_iri[0]) {
									case '#':
										this.subject = new NamedNode(this.base_url + s_iri);
										break;
									case '?':
										this.subject = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
										break;
									case '/':
										// relative to scheme
										if ('/' === s_iri[1]) {
											this.subject = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
										}
										// relative to root
										else {
											this.subject = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
										}
										break;
										// empty
									case undefined:
										// identity
										this.subject = new NamedNode(this.base_url);
										break;
										// dot segment
									case '.':
										// prepend so it is relative to root
										s_iri = '/' + s_iri;
										// relative to path
									default:
										this.subject = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
								}
							}


							// predicate-object pairs state
							return this.pairs();



							// prefixed name

							// match_counter: 0

						} else {

							// prepare sticky regex index
							R_PREFIXED_NAME_ESCAPELESS.lastIndex = i;

							// execute regex
							let m_prefixed_named_e_subject = R_PREFIXED_NAME_ESCAPELESS.exec(s);

							// regex was a match
							if (m_prefixed_named_e_subject) {

								// advance index
								this.i = R_PREFIXED_NAME_ESCAPELESS.lastIndex;
								// check valid prefix
								let s_prefix_id = m_prefixed_named_e_subject[1] || '';

								// invalid prefix
								if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

								// make subject key
								this.subject = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_e_subject[2]);

								// predicate-object pairs state
								return this.pairs();

								// blank node label

								// match_counter: 0

							} else {

								// prepare sticky regex index
								R_BLANK_NODE_LABEL.lastIndex = i;

								// execute regex
								let m_blank_node_label_subject = R_BLANK_NODE_LABEL.exec(s);

								// regex was a match
								if (m_blank_node_label_subject) {

									// advance index
									this.i = R_BLANK_NODE_LABEL.lastIndex;
									// extract label
									let s_label = m_blank_node_label_subject[1];

									// not first time use of label
									let z_label_state = this.labels[s_label];
									if (z_label_state) {
										// label was used previously by document and has no conflict
										if (1 === z_label_state) {}
										// label is in use by invention, this would cause a conflict
										else if (2 === z_label_state) {
											// so create a redirect mapping for this actual label & use it instead
											s_label = this.labels[s_label] = this.next_label();
										}
										// label already has a redirect mapping
										else {
											// use redirected label
											s_label = this.labels[s_label];
										}
									}
									// first time use of label
									else {
										// store label in hash so we avoid future collisions
										this.labels[s_label] = 1;
									}

									// make subject key
									this.subject = new BlankNode(s_label);

									// predicate-object pairs state
									return this.pairs();

									// anonymous blank node subject

									// match_counter: 0

								} else {

									// prepare sticky regex index
									R_ANONYMOUS_BLANK_NODE.lastIndex = i;

									if (R_ANONYMOUS_BLANK_NODE.exec(s)) {

										// advance index
										this.i = R_ANONYMOUS_BLANK_NODE.lastIndex;
										// set new blank node as subject
										this.subject = new BlankNode(this.next_label());

										// goto pairs state for inside property list
										return this.pairs();

										// anonymous blank node property list subject

										// match_counter: 0

									} else {

										// prepare sticky regex index
										R_CHAR_BLANK_NODE.lastIndex = i;

										if (R_CHAR_BLANK_NODE.exec(s)) {

											// advance index
											this.i = R_CHAR_BLANK_NODE.lastIndex;
											// enter blank node
											this.subject = new BlankNode(this.next_label());

											// how to resume when we pop state
											this.nested.push([this.subject, this.predicate, 'post_blank_subject']);

											// goto pairs state for inside property list
											return this.pairs();

											// rdf collection

											// match_counter: 0

										} else {

											// prepare sticky regex index
											R_CHAR_COLLECTION.lastIndex = i;

											if (R_CHAR_COLLECTION.exec(s)) {

												// advance index
												this.i = R_CHAR_COLLECTION.lastIndex;
												// indicate that collection subject should emit an initial statement
												this.subject = null;

												// (don't push state, we don't have a subject yet)

												// goto collection-subject state
												return this.collection_subject();

												// prefix with interupt (e.g., a comment)

												// match_counter: 0

											} else {

												// prepare sticky regex index
												R_PREFIX_KEYWORD.lastIndex = i;

												// execute regex
												let m_prefix_keyword = R_PREFIX_KEYWORD.exec(s);

												// regex was a match
												if (m_prefix_keyword) {

													// advance index
													this.i = R_PREFIX_KEYWORD.lastIndex;
													// save whether or not to expect a full stop
													this.expect_full_stop = m_prefix_keyword[1] ? true : false;

													// goto prefix state
													return this.prefix_id();

													// base with interupt (e.g., a comment)

													// match_counter: 0

												} else {

													// prepare sticky regex index
													R_BASE_KEYWORD.lastIndex = i;

													// execute regex
													let m_base_keyword = R_BASE_KEYWORD.exec(s);

													// regex was a match
													if (m_base_keyword) {

														// advance index
														this.i = R_BASE_KEYWORD.lastIndex;
														// save whether or not to expect a full stop
														this.expect_full_stop = m_base_keyword[1] ? true : false;

														// goto base state
														return this.base_iri();


														// iriref

														// match_counter: 0

													} else {

														// prepare sticky regex index
														R_IRIREF.lastIndex = i;

														// execute regex
														let m_iriref_subject = R_IRIREF.exec(s);

														// regex was a match
														if (m_iriref_subject) {

															// advance index
															this.i = R_IRIREF.lastIndex;
															// ref iri
															let s_iri = m_iriref_subject[1]
																.replace(R_UNICODE_ANY, F_UNICODE_REPLACE);;

															// absolute iri
															if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																// set subject
																this.subject = new NamedNode(s_iri);
															}
															// relative iri
															else {
																// make subject
																switch (s_iri[0]) {
																	case '#':
																		this.subject = new NamedNode(this.base_url + s_iri);
																		break;
																	case '?':
																		this.subject = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
																		break;
																	case '/':
																		// relative to scheme
																		if ('/' === s_iri[1]) {
																			this.subject = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
																		}
																		// relative to root
																		else {
																			this.subject = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
																		}
																		break;
																		// empty
																	case undefined:
																		// identity
																		this.subject = new NamedNode(this.base_url);
																		break;
																		// dot segment
																	case '.':
																		// prepend so it is relative to root
																		s_iri = '/' + s_iri;
																		// relative to path
																	default:
																		this.subject = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
																}
															}


															// predicate-object pairs state
															return this.pairs();

															// prefixed name

															// match_counter: 0

														} else {

															// prepare sticky regex index
															R_PREFIXED_NAME.lastIndex = i;

															// execute regex
															let m_prefixed_named_subject = R_PREFIXED_NAME.exec(s);

															// regex was a match
															if (m_prefixed_named_subject) {

																// advance index
																this.i = R_PREFIXED_NAME.lastIndex;
																// check valid prefix
																let s_prefix_id = m_prefixed_named_subject[1] || '';

																// invalid prefix
																if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																// escape local escapes
																let s_suffix = m_prefixed_named_subject[2].replace(R_PN_LOCAL_ESCAPES, '$1');

																// make subject key
																this.subject = new NamedNode(this.prefixes[s_prefix_id] + s_suffix);

																// predicate-object pairs state
																return this.pairs();


																// comment

																// match_counter: 0

															} else {

																// prepare sticky regex index
																R_COMMENT.lastIndex = i;

																if (R_COMMENT.exec(s)) {

																	// advance index
																	i = R_COMMENT.lastIndex;
																	continue;

																	// not iriref, not prefixed name, not blank node label, not prefix id, not base
																	// match counter: 0
																} else {
																	// break loop to retry on next chunk if eos
																	break;

																}



															}

															// ran out of characters
															// update index value
															this.i = i;

															// not yet eos
															if (i < this.n) {
																// expected token was not found
																if (0 === i) {
																	// we've exceeded the maximum token length
																	if (this.n > this.max_token_length) {
																		return this.parse_error('statement');
																	}
																}
															}

															// save state before pausing
															this.state = this.statement;

															// consumer is pausing
															if (this.n < 0) {
																// go async
																return;
															}

															// store what is unparsed
															this.pre = s.slice(i);

															// if we're not parsing a stream, then this is an error
															return this.eos && this.eos();
														},




														// parse state for pairs
														pairs() {
																// destruct chunk, length, and index
																let {
																	s,
																	n,
																	i
																} = this;

																// start labeled loop, run while there are characters
																pairs: while (i < n) {
																		// benchmarks indicate: regex for end of blank node property list faster than ch

																		// iriref

																		// prepare sticky regex index
																		R_IRIREF_ESCAPELESS.lastIndex = i;

																		// execute regex
																		let m_iriref_e_predicate = R_IRIREF_ESCAPELESS.exec(s);

																		// regex was a match
																		if (m_iriref_e_predicate) {

																			// advance index
																			this.i = R_IRIREF_ESCAPELESS.lastIndex;
																			// ref iri
																			let s_iri = m_iriref_e_predicate[1];

																			// absolute iri
																			if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																				// set predicate
																				this.predicate = new NamedNode(s_iri);
																			}
																			// relative iri
																			else {
																				// make predicate
																				switch (s_iri[0]) {
																					case '#':
																						this.predicate = new NamedNode(this.base_url + s_iri);
																						break;
																					case '?':
																						this.predicate = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
																						break;
																					case '/':
																						// relative to scheme
																						if ('/' === s_iri[1]) {
																							this.predicate = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
																						}
																						// relative to root
																						else {
																							this.predicate = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
																						}
																						break;
																						// empty
																					case undefined:
																						// identity
																						this.predicate = new NamedNode(this.base_url);
																						break;
																						// dot segment
																					case '.':
																						// prepend so it is relative to root
																						s_iri = '/' + s_iri;
																						// relative to path
																					default:
																						this.predicate = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
																				}
																			}


																			// object-list state
																			return this.object_list();

																			// prefixed name

																			// match_counter: 0

																		} else {

																			// prepare sticky regex index
																			R_PREFIXED_NAME_ESCAPELESS.lastIndex = i;

																			// execute regex
																			let m_prefixed_named_e_predicate = R_PREFIXED_NAME_ESCAPELESS.exec(s);

																			// regex was a match
																			if (m_prefixed_named_e_predicate) {

																				// advance index
																				this.i = R_PREFIXED_NAME_ESCAPELESS.lastIndex;
																				// check valid prefix
																				let s_prefix_id = m_prefixed_named_e_predicate[1] || '';

																				// invalid prefix
																				if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																				// make predicate key
																				this.predicate = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_e_predicate[2]);

																				// object-list state
																				return this.object_list();

																				// 'a'

																				// match_counter: 0

																			} else {

																				// prepare sticky regex index
																				R_A.lastIndex = i;

																				if (R_A.exec(s)) {

																					// advance index
																					this.i = R_A.lastIndex;
																					// make predicate key
																					this.predicate = HP_NN_RDF_TYPE;

																					// object-list state
																					return this.object_list();

																					// ']' end of blank node property list

																					// match_counter: 0

																				} else {

																					// prepare sticky regex index
																					R_CHAR_KET.lastIndex = i;

																					if (R_CHAR_KET.exec(s)) {

																						// advance index
																						this.i = R_CHAR_KET.lastIndex;
																						let s_resume_state;
																						[this.subject, this.predicate, s_resume_state] = this.nested.pop();
																						return this[s_resume_state]();

																						// iriref

																						// match_counter: 0

																					} else {

																						// prepare sticky regex index
																						R_IRIREF.lastIndex = i;

																						// execute regex
																						let m_iriref_predicate = R_IRIREF.exec(s);

																						// regex was a match
																						if (m_iriref_predicate) {

																							// advance index
																							this.i = R_IRIREF.lastIndex;
																							// ref iri
																							let s_iri = m_iriref_predicate[1]
																								.replace(R_UNICODE_ANY, F_UNICODE_REPLACE);;

																							// absolute iri
																							if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																								// set predicate
																								this.predicate = new NamedNode(s_iri);
																							}
																							// relative iri
																							else {
																								// make predicate
																								switch (s_iri[0]) {
																									case '#':
																										this.predicate = new NamedNode(this.base_url + s_iri);
																										break;
																									case '?':
																										this.predicate = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
																										break;
																									case '/':
																										// relative to scheme
																										if ('/' === s_iri[1]) {
																											this.predicate = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
																										}
																										// relative to root
																										else {
																											this.predicate = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
																										}
																										break;
																										// empty
																									case undefined:
																										// identity
																										this.predicate = new NamedNode(this.base_url);
																										break;
																										// dot segment
																									case '.':
																										// prepend so it is relative to root
																										s_iri = '/' + s_iri;
																										// relative to path
																									default:
																										this.predicate = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
																								}
																							}


																							// object-list state
																							return this.object_list();

																							// prefixed name

																							// match_counter: 0

																						} else {

																							// prepare sticky regex index
																							R_PREFIXED_NAME.lastIndex = i;

																							// execute regex
																							let m_prefixed_named_predicate = R_PREFIXED_NAME.exec(s);

																							// regex was a match
																							if (m_prefixed_named_predicate) {

																								// advance index
																								this.i = R_PREFIXED_NAME.lastIndex;
																								// check valid prefix
																								let s_prefix_id = m_prefixed_named_predicate[1] || '';

																								// invalid prefix
																								if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																								let s_suffix = m_prefixed_named_predicate[2].replace(R_PN_LOCAL_ESCAPES, '$1');

																								// make predicate key
																								this.predicate = new NamedNode(this.prefixes[s_prefix_id] + s_suffix);

																								// object-list state
																								return this.object_list();



																								// match_counter: 0

																							} else {

																								// prepare sticky regex index
																								R_COMMENT.lastIndex = i;

																								if (R_COMMENT.exec(s)) {

																									// advance index
																									i = R_COMMENT.lastIndex;
																									continue;

																									// not iriref, not prefixed name, not 'a'
																									// match counter: 0
																								} else {
																									// break loop to retry on next chunk if eos
																									break;

																								}



																							}

																							// ran out of characters
																							// update index value
																							this.i = i;

																							// not yet eos
																							if (i < this.n) {
																								// expected token was not found
																								if (0 === i) {
																									// we've exceeded the maximum token length
																									if (this.n > this.max_token_length) {
																										return this.parse_error('pairs');
																									}
																								}
																							}

																							// save state before pausing
																							this.state = this.pairs;

																							// consumer is pausing
																							if (this.n < 0) {
																								// go async
																								return;
																							}

																							// store what is unparsed
																							this.pre = s.slice(i);

																							// if we're not parsing a stream, then this is an error
																							return this.eos && this.eos();
																						},


																						// parse state for object_list
																						object_list() {
																								// destruct chunk, length, and index
																								let {
																									s,
																									n,
																									i
																								} = this;

																								// start labeled loop, run while there are characters
																								object_list: while (i < n) {
																										// ref char
																										let x = s[i];

																										// iriref

																										// prepare sticky regex index
																										R_IRIREF_ESCAPELESS.lastIndex = i;

																										// execute regex
																										let m_iriref_e_object = R_IRIREF_ESCAPELESS.exec(s);

																										// regex was a match
																										if (m_iriref_e_object) {

																											// advance index
																											this.i = R_IRIREF_ESCAPELESS.lastIndex;
																											// ref iri
																											let s_iri = m_iriref_e_object[1];

																											// absolute iri
																											if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																												// set object
																												this.object = new NamedNode(s_iri);
																											}
																											// relative iri
																											else {
																												// make object
																												switch (s_iri[0]) {
																													case '#':
																														this.object = new NamedNode(this.base_url + s_iri);
																														break;
																													case '?':
																														this.object = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
																														break;
																													case '/':
																														// relative to scheme
																														if ('/' === s_iri[1]) {
																															this.object = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
																														}
																														// relative to root
																														else {
																															this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
																														}
																														break;
																														// empty
																													case undefined:
																														// identity
																														this.object = new NamedNode(this.base_url);
																														break;
																														// dot segment
																													case '.':
																														// prepend so it is relative to root
																														s_iri = '/' + s_iri;
																														// relative to path
																													default:
																														this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
																												}
																											}


																											// prefixed name

																											// match_counter: 0

																										} else {

																											// prepare sticky regex index
																											R_PREFIXED_NAME_ESCAPELESS.lastIndex = i;

																											// execute regex
																											let m_prefixed_named_e_object = R_PREFIXED_NAME_ESCAPELESS.exec(s);

																											// regex was a match
																											if (m_prefixed_named_e_object) {

																												// advance index
																												this.i = R_PREFIXED_NAME_ESCAPELESS.lastIndex;
																												// check valid prefix
																												let s_prefix_id = m_prefixed_named_e_object[1] || '';

																												// invalid prefix
																												if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																												// commit object iri from resolve prefixed name
																												this.object = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_e_object[2]);

																												// string literal
																											} else if (`"` === x || `'` === x) {
																												return this.string_literal();

																												// numeric literal

																												// match_counter: 0

																											} else {

																												// prepare sticky regex index
																												R_NUMERIC_LITERAL.lastIndex = i;

																												// execute regex
																												let m_numeric_literal = R_NUMERIC_LITERAL.exec(s);

																												// regex was a match
																												if (m_numeric_literal) {

																													// advance index
																													this.i = R_NUMERIC_LITERAL.lastIndex;
																													// it has exponent term, xsd:double
																													if (m_numeric_literal[4]) {
																														this.object = new DoubleLiteral(m_numeric_literal[1]);
																													}
																													// contains decimal point, xsd:decimal
																													else if (m_numeric_literal[2] || m_numeric_literal[3]) {
																														this.object = new DecimalLiteral(m_numeric_literal[1]);
																													}
																													// otherwise, it is an integer
																													else {
																														this.object = new IntegerLiteral(m_numeric_literal[1]);
																													}

																													// boolean literal

																													// match_counter: 0

																												} else {

																													// prepare sticky regex index
																													R_BOOLEAN_LITERAL.lastIndex = i;

																													// execute regex
																													let m_boolean_literal = R_BOOLEAN_LITERAL.exec(s);

																													// regex was a match
																													if (m_boolean_literal) {

																														// advance index
																														this.i = R_BOOLEAN_LITERAL.lastIndex;
																														// make literal
																														this.object = new BooleanLiteral(m_boolean_literal[1] ? true : false);

																														// blank node property list
																													} else if (`[` === x) {
																														// advance index to next token
																														R_WS.lastIndex = i + 1;
																														R_WS.exec(s);
																														this.i = R_WS.lastIndex;

																														// make object
																														let s_label = this.next_label();
																														this.object = new BlankNode(s_label);

																														// emit statement event
																														this.data(new Quad(this));
																														// this.operator.emit('data', new Quad(this));

																														// push state to stack
																														this.nested.push([this.subject, this.predicate, 'post_object']);

																														// set new subject
																														this.subject = new BlankNode(s_label);

																														// goto parsing pairs state
																														return this.pairs();

																														// labeled blank node

																														// match_counter: 0

																													} else {

																														// prepare sticky regex index
																														R_BLANK_NODE_LABEL.lastIndex = i;

																														// execute regex
																														let m_blank_node_label_object = R_BLANK_NODE_LABEL.exec(s);

																														// regex was a match
																														if (m_blank_node_label_object) {

																															// advance index
																															this.i = R_BLANK_NODE_LABEL.lastIndex;
																															// ref blank node label
																															let s_label = m_blank_node_label_object[1];

																															// not first time use of label
																															let z_label_state = this.labels[s_label];
																															if (z_label_state) {
																																// label was used previously by document and has no conflict
																																if (1 === z_label_state) {}
																																// label is in use by invention, this would cause a conflict
																																else if (2 === z_label_state) {
																																	// so create a redirect mapping for this actual label & use it instead
																																	s_label = this.labels[s_label] = this.next_label();
																																}
																																// label already has a redirect mapping
																																else {
																																	// use redirected label
																																	s_label = this.labels[s_label];
																																}
																															}
																															// first time use of label
																															else {
																																// store label in hash so we avoid future collisions
																																this.labels[s_label] = 1;
																															}

																															// make object
																															this.object = new BlankNode(s_label);

																															// collection
																														} else if (`(` === x) {
																															// advance index to next token
																															R_WS.lastIndex = i + 1;
																															R_WS.exec(s);
																															this.i = R_WS.lastIndex;

																															// state to resume after collection ends
																															this.nested.push([this.subject, this.predicate, 'post_object']);

																															// goto collection-object state
																															return this.collection_object();

																															// iriref

																															// match_counter: 0

																														} else {

																															// prepare sticky regex index
																															R_IRIREF.lastIndex = i;

																															// execute regex
																															let m_iriref_object = R_IRIREF.exec(s);

																															// regex was a match
																															if (m_iriref_object) {

																																// advance index
																																this.i = R_IRIREF.lastIndex;
																																// ref iri
																																let s_iri = m_iriref_object[1]
																																	.replace(R_UNICODE_ANY, F_UNICODE_REPLACE);;

																																// absolute iri
																																if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																	// set object
																																	this.object = new NamedNode(s_iri);
																																}
																																// relative iri
																																else {
																																	// make object
																																	switch (s_iri[0]) {
																																		case '#':
																																			this.object = new NamedNode(this.base_url + s_iri);
																																			break;
																																		case '?':
																																			this.object = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
																																			break;
																																		case '/':
																																			// relative to scheme
																																			if ('/' === s_iri[1]) {
																																				this.object = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
																																			}
																																			// relative to root
																																			else {
																																				this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
																																			}
																																			break;
																																			// empty
																																		case undefined:
																																			// identity
																																			this.object = new NamedNode(this.base_url);
																																			break;
																																			// dot segment
																																		case '.':
																																			// prepend so it is relative to root
																																			s_iri = '/' + s_iri;
																																			// relative to path
																																		default:
																																			this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
																																	}
																																}


																																// prefixed name

																																// match_counter: 0

																															} else {

																																// prepare sticky regex index
																																R_PREFIXED_NAME.lastIndex = i;

																																// execute regex
																																let m_prefixed_named_object = R_PREFIXED_NAME.exec(s);

																																// regex was a match
																																if (m_prefixed_named_object) {

																																	// advance index
																																	this.i = R_PREFIXED_NAME.lastIndex;
																																	// check valid prefix
																																	let s_prefix_id = m_prefixed_named_object[1] || '';

																																	// invalid prefix
																																	if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																																	let s_suffix = m_prefixed_named_object[2].replace(R_PN_LOCAL_ESCAPES, '$1');

																																	// commit object iri from resolve prefixed name
																																	this.object = new NamedNode(this.prefixes[s_prefix_id] + s_suffix);


																																	// match_counter: 0

																																} else {

																																	// prepare sticky regex index
																																	R_COMMENT.lastIndex = i;

																																	if (R_COMMENT.exec(s)) {

																																		// advance index
																																		i = R_COMMENT.lastIndex;
																																		continue;

																																		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
																																		// match counter: 0
																																	} else {
																																		// break loop to retry on next chunk if eos
																																		break;

																																	}



																																	// fall through for cases that did not change state on their own
																																	// at this point, a new statement has been parsed
																																	this.data(new Quad(this));
																																	// this.operator.emit('data', new Quad(this));

																																	// goto next parsing state
																																	return process.nextTick(() => {
																																		this.after_end_of_statement()
																																	});
																																}

																																// ran out of characters
																																// update index value
																																this.i = i;

																																// not yet eos
																																if (i < this.n) {
																																	// expected token was not found
																																	if (0 === i) {
																																		// we've exceeded the maximum token length
																																		if (this.n > this.max_token_length) {
																																			return this.parse_error('object_list');
																																		}
																																	}
																																}

																																// save state before pausing
																																this.state = this.object_list;

																																// consumer is pausing
																																if (this.n < 0) {
																																	// go async
																																	return;
																																}

																																// store what is unparsed
																																this.pre = s.slice(i);

																																// if we're not parsing a stream, then this is an error
																																return this.eos && this.eos();
																															},


																															// parse state for string_literal
																															string_literal() {
																																	// destruct chunk, length, and index
																																	let {
																																		s,
																																		n,
																																		i
																																	} = this;

																																	// start labeled loop, run while there are characters
																																	string_literal: while (i < n) {
																																			// we know this is going to be a literal
																																			let h_literal = this.object = new Literal();

																																			// ref character
																																			let x = s[i];

																																			// string literal quote / string literal long quote
																																			if (`"` === x) {
																																				// `"""` string literal long quote

																																				// prepare sticky regex index
																																				R_STRING_LITERAL_LONG_QUOTE.lastIndex = i;

																																				// execute regex
																																				let m_string_literal_long_quote = R_STRING_LITERAL_LONG_QUOTE.exec(s);

																																				// regex was a match
																																				if (m_string_literal_long_quote) {

																																					// advance index
																																					this.i = R_STRING_LITERAL_LONG_QUOTE.lastIndex;
																																					// set literal value
																																					h_literal.value =
																																						JSON.parse('"' +
																																							m_string_literal_long_quote[1]
																																							.replace(R_UNICODE_8, F_UNICODE_REPLACE)
																																							.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
																																							.replace(/[\t\n"\r\f\u0008]/g, (s) => {
																																								return H_SPECIAL_ESCAPES[s];
																																							}) +
																																							'"');

																																					// `"` string literal quote

																																					// match_counter: 0

																																				} else {

																																					// prepare sticky regex index
																																					R_STRING_LITERAL_QUOTE_ESCAPELESS.lastIndex = i;

																																					// execute regex
																																					let m_string_literal_quote_escapeless = R_STRING_LITERAL_QUOTE_ESCAPELESS.exec(s);

																																					// regex was a match
																																					if (m_string_literal_quote_escapeless) {

																																						// advance index
																																						this.i = R_STRING_LITERAL_QUOTE_ESCAPELESS.lastIndex;
																																						// set literal value
																																						h_literal.value =
																																							m_string_literal_quote_escapeless[1];

																																						// `"` string literal quote

																																						// match_counter: 0

																																					} else {

																																						// prepare sticky regex index
																																						R_STRING_LITERAL_QUOTE.lastIndex = i;

																																						// execute regex
																																						let m_string_literal_quote = R_STRING_LITERAL_QUOTE.exec(s);

																																						// regex was a match
																																						if (m_string_literal_quote) {

																																							// advance index
																																							this.i = R_STRING_LITERAL_QUOTE.lastIndex;
																																							// set literal value
																																							h_literal.value =
																																								JSON.parse('"' +
																																									m_string_literal_quote[1]
																																									.replace(R_UNICODE_8, F_UNICODE_REPLACE)
																																									.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
																																									.replace(/"/g, '\\"') // escape all quotes ;)
																																									+
																																									'"');

																																							// not string long literal quote, not string literal quote
																																							// match counter: 0
																																						} else {
																																							// break loop to retry on next chunk if eos
																																							break;

																																						}



																																						// `'''` string literal long single quote

																																						// match_counter: 0

																																					} else {

																																						// prepare sticky regex index
																																						R_STRING_LITERAL_LONG_SINGLE_QUOTE.lastIndex = i;

																																						// execute regex
																																						let m_string_literal_long_single_quote = R_STRING_LITERAL_LONG_SINGLE_QUOTE.exec(s);

																																						// regex was a match
																																						if (m_string_literal_long_single_quote) {

																																							// advance index
																																							this.i = R_STRING_LITERAL_LONG_SINGLE_QUOTE.lastIndex;
																																							// set literal value
																																							h_literal.value =
																																								JSON.parse('"' +
																																									m_string_literal_long_single_quote[1]
																																									.replace(R_UNICODE_8, F_UNICODE_REPLACE)
																																									.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
																																									.replace(/[\t\n"\r\f\u0008]/g, (s) => {
																																										return H_SPECIAL_ESCAPES[s];
																																									}) +
																																									'"');

																																							// `"` string literal quote

																																							// match_counter: 0

																																						} else {

																																							// prepare sticky regex index
																																							R_STRING_LITERAL_SINGLE_QUOTE_ESCAPELESS.lastIndex = i;

																																							// execute regex
																																							let m_string_literal_single_quote_escapeless = R_STRING_LITERAL_SINGLE_QUOTE_ESCAPELESS.exec(s);

																																							// regex was a match
																																							if (m_string_literal_single_quote_escapeless) {

																																								// advance index
																																								this.i = R_STRING_LITERAL_SINGLE_QUOTE_ESCAPELESS.lastIndex;
																																								// set literal value
																																								h_literal.value =
																																									m_string_literal_single_quote_escapeless[1];

																																								// `'` string literal single quote

																																								// match_counter: 0

																																							} else {

																																								// prepare sticky regex index
																																								R_STRING_LITERAL_SINGLE_QUOTE.lastIndex = i;

																																								// execute regex
																																								let m_string_literal_single_quote = R_STRING_LITERAL_SINGLE_QUOTE.exec(s);

																																								// regex was a match
																																								if (m_string_literal_single_quote) {

																																									// advance index
																																									this.i = R_STRING_LITERAL_SINGLE_QUOTE.lastIndex;
																																									// set literal value
																																									h_literal.value =
																																										JSON.parse('"' +
																																											m_string_literal_single_quote[1]
																																											.replace(R_UNICODE_8, F_UNICODE_REPLACE)
																																											.replace(R_ESCAPES, '$1$2') // no need to escape anything other than reserved characters
																																											.replace(/"/g, '\\"') // escape all quotes ;)
																																											+
																																											'"');

																																									// not string literal long single quote, not string literal single quote
																																									// match counter: 0
																																								} else {
																																									// break loop to retry on next chunk if eos
																																									break;

																																								}



																																								// complete literal
																																								return this.datatype_or_langtag();
																																							}

																																							// ran out of characters
																																							// update index value
																																							this.i = i;

																																							// not yet eos
																																							if (i < this.n) {
																																								// expected token was not found
																																								if (0 === i) {
																																									// we've exceeded the maximum token length
																																									if (this.n > this.max_string_length) {
																																										return this.parse_error('string_literal');
																																									}
																																								}
																																							}

																																							// save state before pausing
																																							this.state = this.string_literal;

																																							// consumer is pausing
																																							if (this.n < 0) {
																																								// go async
																																								return;
																																							}

																																							// store what is unparsed
																																							this.pre = s.slice(i);

																																							// if we're not parsing a stream, then this is an error
																																							return this.eos && this.eos();
																																						},


																																						// parse state for datatype_or_langtag
																																						datatype_or_langtag() {
																																								// destruct chunk, length, and index
																																								let {
																																									s,
																																									n,
																																									i
																																								} = this;

																																								// start labeled loop, run while there are characters
																																								datatype_or_langtag: while (i < n) {
																																										// ref character
																																										let x = s[i];

																																										// next token indicates datatype or langtag
																																										if (`^` === x || `@` === x) {
																																											// '^^' datatype

																																											// prepare sticky regex index
																																											R_DOUBLE_CARET.lastIndex = i;

																																											if (R_DOUBLE_CARET.exec(s)) {

																																												// advance index
																																												this.i = R_DOUBLE_CARET.lastIndex;
																																												return this.datatype();

																																												// '@' language tag

																																												// match_counter: 0

																																											} else {

																																												// prepare sticky regex index
																																												R_LANGTAG.lastIndex = i;

																																												// execute regex
																																												let m_langtag = R_LANGTAG.exec(s);

																																												// regex was a match
																																												if (m_langtag) {

																																													// advance index
																																													this.i = R_LANGTAG.lastIndex;
																																													// set literal language type
																																													this.object.language = m_langtag[1].toLowerCase();
																																													this.object.datatype = HP_NN_RDFS_LANG_STRING;

																																													// next token definitely datatype or langtag, we are just being interrupted by eos
																																													// match counter: 0
																																												} else {
																																													// break loop to retry on next chunk if eos
																																													break;

																																												}




																																												// match_counter: 0

																																											} else {

																																												// prepare sticky regex index
																																												R_COMMENT.lastIndex = i;

																																												if (R_COMMENT.exec(s)) {

																																													// advance index
																																													i = R_COMMENT.lastIndex;
																																													continue;

																																													// not datatype, not language tag => that's okay! those are optional
																																												}



																																												// goto end of statement state
																																												// at this point, a new statement has been parsed
																																												this.data(new Quad(this));
																																												// this.operator.emit('data', new Quad(this));

																																												// goto next parsing state
																																												return process.nextTick(() => {
																																													this.after_end_of_statement()
																																												});
																																											}

																																											// ran out of characters
																																											// update index value
																																											this.i = i;

																																											// not yet eos
																																											if (i < this.n) {
																																												// expected token was not found
																																												if (0 === i) {
																																													// we've exceeded the maximum token length
																																													if (this.n > this.max_token_length) {
																																														return this.parse_error('datatype_or_langtag');
																																													}
																																												}
																																											}

																																											// save state before pausing
																																											this.state = this.datatype_or_langtag;

																																											// consumer is pausing
																																											if (this.n < 0) {
																																												// go async
																																												return;
																																											}

																																											// store what is unparsed
																																											this.pre = s.slice(i);

																																											// if we're not parsing a stream, then this is an error
																																											return this.eos && this.eos();
																																										},


																																										// parse state for datatype
																																										datatype() {
																																												// destruct chunk, length, and index
																																												let {
																																													s,
																																													n,
																																													i
																																												} = this;

																																												// start labeled loop, run while there are characters
																																												datatype: while (i < n) {
																																														// iriref

																																														// prepare sticky regex index
																																														R_IRIREF_ESCAPELESS.lastIndex = i;

																																														// execute regex
																																														let m_iriref_e_datatype = R_IRIREF_ESCAPELESS.exec(s);

																																														// regex was a match
																																														if (m_iriref_e_datatype) {

																																															// advance index
																																															this.i = R_IRIREF_ESCAPELESS.lastIndex;
																																															let p_datatype;
																																															// ref iri
																																															let s_iri = m_iriref_e_datatype[1];

																																															// absolute iri
																																															if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																// set p_datatype
																																																p_datatype = s_iri;
																																															}
																																															// relative iri
																																															else {
																																																// make p_datatype
																																																switch (s_iri[0]) {
																																																	case '#':
																																																		p_datatype = this.base_url + s_iri;
																																																		break;
																																																	case '?':
																																																		p_datatype = this.base_url.replace(/(\?.*)?$/, s_iri);
																																																		break;
																																																	case '/':
																																																		// relative to scheme
																																																		if ('/' === s_iri[1]) {
																																																			p_datatype = this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1));
																																																		}
																																																		// relative to root
																																																		else {
																																																			p_datatype = this.base_url_root + F_DOT_SEGMENTS(s_iri);
																																																		}
																																																		break;
																																																		// empty
																																																	case undefined:
																																																		// identity
																																																		p_datatype = this.base_url;
																																																		break;
																																																		// dot segment
																																																	case '.':
																																																		// prepend so it is relative to root
																																																		s_iri = '/' + s_iri;
																																																		// relative to path
																																																	default:
																																																		p_datatype = this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri);
																																																}
																																															}


																																															// set literal datatype
																																															this.object.datatype = new NamedNode(p_datatype);

																																															// prefixed name

																																															// match_counter: 0

																																														} else {

																																															// prepare sticky regex index
																																															R_PREFIXED_NAME_ESCAPELESS.lastIndex = i;

																																															// execute regex
																																															let m_prefixed_named_e_datatype = R_PREFIXED_NAME_ESCAPELESS.exec(s);

																																															// regex was a match
																																															if (m_prefixed_named_e_datatype) {

																																																// advance index
																																																this.i = R_PREFIXED_NAME_ESCAPELESS.lastIndex;
																																																// check valid prefix
																																																let s_prefix_id = m_prefixed_named_e_datatype[1] || '';

																																																// invalid prefix
																																																if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																																																// set literal datatype
																																																this.object.datatype = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_e_datatype[2]);

																																																// iriref

																																																// match_counter: 0

																																															} else {

																																																// prepare sticky regex index
																																																R_IRIREF.lastIndex = i;

																																																// execute regex
																																																let m_iriref_datatype = R_IRIREF.exec(s);

																																																// regex was a match
																																																if (m_iriref_datatype) {

																																																	// advance index
																																																	this.i = R_IRIREF.lastIndex;
																																																	// ref iri
																																																	let s_iri = m_iriref_datatype[1]
																																																		.replace(R_UNICODE_ANY, F_UNICODE_REPLACE);;

																																																	// absolute iri
																																																	if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																		// set object["datatype"]
																																																		this.object["datatype"] = s_iri;
																																																	}
																																																	// relative iri
																																																	else {
																																																		// make object["datatype"]
																																																		switch (s_iri[0]) {
																																																			case '#':
																																																				this.object["datatype"] = this.base_url + s_iri;
																																																				break;
																																																			case '?':
																																																				this.object["datatype"] = this.base_url.replace(/(\?.*)?$/, s_iri);
																																																				break;
																																																			case '/':
																																																				// relative to scheme
																																																				if ('/' === s_iri[1]) {
																																																					this.object["datatype"] = this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1));
																																																				}
																																																				// relative to root
																																																				else {
																																																					this.object["datatype"] = this.base_url_root + F_DOT_SEGMENTS(s_iri);
																																																				}
																																																				break;
																																																				// empty
																																																			case undefined:
																																																				// identity
																																																				this.object["datatype"] = this.base_url;
																																																				break;
																																																				// dot segment
																																																			case '.':
																																																				// prepend so it is relative to root
																																																				s_iri = '/' + s_iri;
																																																				// relative to path
																																																			default:
																																																				this.object["datatype"] = this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri);
																																																		}
																																																	}


																																																	// prefixed name

																																																	// match_counter: 0

																																																} else {

																																																	// prepare sticky regex index
																																																	R_PREFIXED_NAME.lastIndex = i;

																																																	// execute regex
																																																	let m_prefixed_named_datatype = R_PREFIXED_NAME.exec(s);

																																																	// regex was a match
																																																	if (m_prefixed_named_datatype) {

																																																		// advance index
																																																		this.i = R_PREFIXED_NAME.lastIndex;
																																																		// check valid prefix
																																																		let s_prefix_id = m_prefixed_named_datatype[1] || '';

																																																		// invalid prefix
																																																		if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																																																		let s_suffix = m_prefixed_named_datatype[2].replace(R_PN_LOCAL_ESCAPES, '$1');

																																																		// set literal datatype
																																																		this.object.datatype = new NamedNode(this.prefixes[s_prefix_id] + s_suffix);

																																																		// not iriref, not prefixed name
																																																		// match counter: 0
																																																	} else {
																																																		// break loop to retry on next chunk if eos
																																																		break;

																																																	}



																																																	// goto end of statement state
																																																	// at this point, a new statement has been parsed
																																																	this.data(new Quad(this));
																																																	// this.operator.emit('data', new Quad(this));

																																																	// goto next parsing state
																																																	return process.nextTick(() => {
																																																		this.after_end_of_statement()
																																																	});
																																																}

																																																// ran out of characters
																																																// update index value
																																																this.i = i;

																																																// not yet eos
																																																if (i < this.n) {
																																																	// expected token was not found
																																																	if (0 === i) {
																																																		// we've exceeded the maximum token length
																																																		if (this.n > this.max_token_length) {
																																																			return this.parse_error('datatype');
																																																		}
																																																	}
																																																}

																																																// save state before pausing
																																																this.state = this.datatype;

																																																// consumer is pausing
																																																if (this.n < 0) {
																																																	// go async
																																																	return;
																																																}

																																																// store what is unparsed
																																																this.pre = s.slice(i);

																																																// if we're not parsing a stream, then this is an error
																																																return this.eos && this.eos();
																																															},


																																															// parse state for post_object
																																															post_object() {
																																																	// destruct chunk, length, and index
																																																	let {
																																																		s,
																																																		n,
																																																		i
																																																	} = this;

																																																	// start labeled loop, run while there are characters
																																																	post_object: while (i < n) {
																																																			// benchmarks confirm: character ref faster than regexes in this context
																																																			let x = s[i];

																																																			// advance index to next token beyond delimiter
																																																			R_WS.lastIndex = i + 1;
																																																			R_WS.exec(s);
																																																			this.i = R_WS.lastIndex;

																																																			// ',' more objects
																																																			if (`,` === x) {
																																																				return this.object_list();;

																																																				// ';' more predicate-object pairs
																																																			} else if (`;` === x) {
																																																				// next token is end of statement or end of blank node property list
																																																				let x1 = s[this.i];
																																																				if ('.' === x1 || ']' === x1 || ';' === x1) {
																																																					// goto post-object state
																																																					return this.post_object();
																																																				}
																																																				// eos
																																																				else if (this.i === n) {
																																																					// go to post-pair state
																																																					return this.post_pair();
																																																				}
																																																				return this.pairs();

																																																				// '.' end of statement
																																																			} else if (`.` === x) {
																																																				// assert not nested
																																																				if (this.nested.length) {
																																																					// reset index to that character
																																																					this.i = i;

																																																					// emit parse error
																																																					return this.parse_error('end_of_property_list');
																																																				}
																																																				return this.statement();

																																																				// ']' end of property-object pairs
																																																			} else if (`]` === x) {
																																																				let s_resume_state;
																																																				[this.subject, this.predicate, s_resume_state] = this.nested.pop();
																																																				return this[s_resume_state]();

																																																				// ')' end of collection
																																																			} else if (`)` === x) {
																																																				// do something
																																																				throw `end of collection`;

																																																				// comment

																																																				// match_counter: 0

																																																			} else {

																																																				// prepare sticky regex index
																																																				R_COMMENT.lastIndex = i;

																																																				if (R_COMMENT.exec(s)) {

																																																					// advance index
																																																					i = R_COMMENT.lastIndex;
																																																					// do not change state
																																																					continue;

																																																					// comment interrupted by eos?
																																																					// match counter: 0
																																																				} else {
																																																					// break loop to retry on next chunk if eos
																																																					break;

																																																				}



																																																			}

																																																			// ran out of characters
																																																			// update index value
																																																			this.i = i;

																																																			// not yet eos
																																																			if (i < this.n) {
																																																				// expected token was not found
																																																				if (0 === i) {
																																																					// we've exceeded the maximum token length
																																																					if (this.n > this.max_token_length) {
																																																						return this.parse_error('post_object');
																																																					}
																																																				}
																																																			}

																																																			// save state before pausing
																																																			this.state = this.post_object;

																																																			// consumer is pausing
																																																			if (this.n < 0) {
																																																				// go async
																																																				return;
																																																			}

																																																			// store what is unparsed
																																																			this.pre = s.slice(i);

																																																			// if we're not parsing a stream, then this is an error
																																																			return this.eos && this.eos();
																																																		},


																																																		// parse state for base_iri
																																																		base_iri() {
																																																			// destruct chunk, length, and index
																																																			let {
																																																				s,
																																																				n,
																																																				i
																																																			} = this;

																																																			// start labeled loop, run while there are characters
																																																			base_iri: while (i < n) {
																																																					// prefix id

																																																					// prepare sticky regex index
																																																					R_IRIREF_ESCAPELESS.lastIndex = i;

																																																					// execute regex
																																																					let m_iriref_e_base = R_IRIREF_ESCAPELESS.exec(s);

																																																					// regex was a match
																																																					if (m_iriref_e_base) {

																																																						// advance index
																																																						this.i = R_IRIREF_ESCAPELESS.lastIndex;
																																																						// ref iri
																																																						let s_iri = m_iriref_e_base[1];

																																																						// absolute iri
																																																						if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																							// set base_url
																																																							this.base_url = s_iri;
																																																						}
																																																						// relative iri
																																																						else {
																																																							// make base_url
																																																							switch (s_iri[0]) {
																																																								case '#':
																																																									this.base_url = this.base_url + s_iri;
																																																									break;
																																																								case '?':
																																																									this.base_url = this.base_url.replace(/(\?.*)?$/, s_iri);
																																																									break;
																																																								case '/':
																																																									// relative to scheme
																																																									if ('/' === s_iri[1]) {
																																																										this.base_url = this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1));
																																																									}
																																																									// relative to root
																																																									else {
																																																										this.base_url = this.base_url_root + F_DOT_SEGMENTS(s_iri);
																																																									}
																																																									break;
																																																									// empty
																																																								case undefined:
																																																									// identity
																																																									this.base_url = this.base_url;
																																																									break;
																																																									// dot segment
																																																								case '.':
																																																									// prepend so it is relative to root
																																																									s_iri = '/' + s_iri;
																																																									// relative to path
																																																								default:
																																																									this.base_url = this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri);
																																																							}
																																																						}

																																																						let m_base_iri = R_BASE_IRI.exec(this.base_url);
																																																						this.base_url = m_base_iri[1];
																																																						this.base_url_root = m_base_iri[2] || '';
																																																						this.base_url_scheme = m_base_iri[3] || '';
																																																						this.base_url_path = m_base_iri[4] || '';

																																																						// emit base event
																																																						this.base && this.base(this.base_url);

																																																						if (this.expect_full_stop) {
																																																							// change state
																																																							return this.full_stop();
																																																						}

																																																						// goto prefix iri state
																																																						return this.statement();

																																																						// prefix id

																																																						// match_counter: 0

																																																					} else {

																																																						// prepare sticky regex index
																																																						R_IRIREF.lastIndex = i;

																																																						// execute regex
																																																						let m_iriref_base = R_IRIREF.exec(s);

																																																						// regex was a match
																																																						if (m_iriref_base) {

																																																							// advance index
																																																							this.i = R_IRIREF.lastIndex;
																																																							// ref iri
																																																							let s_iri = m_iriref_base[1]
																																																								.replace(R_UNICODE_ANY, F_UNICODE_REPLACE);;

																																																							// absolute iri
																																																							if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																								// set base_url
																																																								this.base_url = s_iri;
																																																							}
																																																							// relative iri
																																																							else {
																																																								// make base_url
																																																								switch (s_iri[0]) {
																																																									case '#':
																																																										this.base_url = this.base_url + s_iri;
																																																										break;
																																																									case '?':
																																																										this.base_url = this.base_url.replace(/(\?.*)?$/, s_iri);
																																																										break;
																																																									case '/':
																																																										// relative to scheme
																																																										if ('/' === s_iri[1]) {
																																																											this.base_url = this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1));
																																																										}
																																																										// relative to root
																																																										else {
																																																											this.base_url = this.base_url_root + F_DOT_SEGMENTS(s_iri);
																																																										}
																																																										break;
																																																										// empty
																																																									case undefined:
																																																										// identity
																																																										this.base_url = this.base_url;
																																																										break;
																																																										// dot segment
																																																									case '.':
																																																										// prepend so it is relative to root
																																																										s_iri = '/' + s_iri;
																																																										// relative to path
																																																									default:
																																																										this.base_url = this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri);
																																																								}
																																																							}

																																																							let m_base_iri = R_BASE_IRI.exec(this.base_url);
																																																							this.base_url = m_base_iri[1];
																																																							this.base_url_root = m_base_iri[2] || '';
																																																							this.base_url_scheme = m_base_iri[3] || '';
																																																							this.base_url_path = m_base_iri[4] || '';

																																																							// emit base event
																																																							this.base && this.base(this.base_url);

																																																							if (this.expect_full_stop) {
																																																								// change state
																																																								return this.full_stop();
																																																							}

																																																							// goto prefix iri state
																																																							return this.statement();

																																																							// for poorly-placed comments

																																																							// match_counter: 0

																																																						} else {

																																																							// prepare sticky regex index
																																																							R_COMMENT.lastIndex = i;

																																																							if (R_COMMENT.exec(s)) {

																																																								// advance index
																																																								i = R_COMMENT.lastIndex;
																																																								// do not change state
																																																								continue;

																																																								// match counter: 0
																																																							} else {
																																																								// break loop to retry on next chunk if eos
																																																								break;

																																																							}


																																																						}

																																																						// ran out of characters
																																																						// update index value
																																																						this.i = i;

																																																						// not yet eos
																																																						if (i < this.n) {
																																																							// expected token was not found
																																																							if (0 === i) {
																																																								// we've exceeded the maximum token length
																																																								if (this.n > this.max_token_length) {
																																																									return this.parse_error('base_iri');
																																																								}
																																																							}
																																																						}

																																																						// save state before pausing
																																																						this.state = this.base_iri;

																																																						// consumer is pausing
																																																						if (this.n < 0) {
																																																							// go async
																																																							return;
																																																						}

																																																						// store what is unparsed
																																																						this.pre = s.slice(i);

																																																						// if we're not parsing a stream, then this is an error
																																																						return this.eos && this.eos();
																																																					},


																																																					// parse state for prefix_id
																																																					prefix_id() {
																																																							// destruct chunk, length, and index
																																																							let {
																																																								s,
																																																								n,
																																																								i
																																																							} = this;

																																																							// start labeled loop, run while there are characters
																																																							prefix_id: while (i < n) {
																																																									// prefix id

																																																									// prepare sticky regex index
																																																									R_PREFIX_ID.lastIndex = i;

																																																									// execute regex
																																																									let m_prefix_id = R_PREFIX_ID.exec(s);

																																																									// regex was a match
																																																									if (m_prefix_id) {

																																																										// advance index
																																																										this.i = R_PREFIX_ID.lastIndex;
																																																										// set temp prefix id
																																																										this.temp_prefix_id = m_prefix_id[1];

																																																										// goto prefix iri state
																																																										return this.prefix_iri();

																																																										// for poorly-placed comments

																																																										// match_counter: 0

																																																									} else {

																																																										// prepare sticky regex index
																																																										R_COMMENT.lastIndex = i;

																																																										if (R_COMMENT.exec(s)) {

																																																											// advance index
																																																											i = R_COMMENT.lastIndex;
																																																											// do not change state
																																																											continue;

																																																											// match counter: 0
																																																										} else {
																																																											// break loop to retry on next chunk if eos
																																																											break;

																																																										}



																																																									}

																																																									// ran out of characters
																																																									// update index value
																																																									this.i = i;

																																																									// not yet eos
																																																									if (i < this.n) {
																																																										// expected token was not found
																																																										if (0 === i) {
																																																											// we've exceeded the maximum token length
																																																											if (this.n > this.max_token_length) {
																																																												return this.parse_error('prefix_id');
																																																											}
																																																										}
																																																									}

																																																									// save state before pausing
																																																									this.state = this.prefix_id;

																																																									// consumer is pausing
																																																									if (this.n < 0) {
																																																										// go async
																																																										return;
																																																									}

																																																									// store what is unparsed
																																																									this.pre = s.slice(i);

																																																									// if we're not parsing a stream, then this is an error
																																																									return this.eos && this.eos();
																																																								},


																																																								// parse state for prefix_iri
																																																								prefix_iri() {
																																																									// destruct chunk, length, and index
																																																									let {
																																																										s,
																																																										n,
																																																										i
																																																									} = this;

																																																									// start labeled loop, run while there are characters
																																																									prefix_iri: while (i < n) {
																																																											// prefix iri

																																																											// prepare sticky regex index
																																																											R_IRIREF_ESCAPELESS.lastIndex = i;

																																																											// execute regex
																																																											let m_iriref_e_prefix = R_IRIREF_ESCAPELESS.exec(s);

																																																											// regex was a match
																																																											if (m_iriref_e_prefix) {

																																																												// advance index
																																																												this.i = R_IRIREF_ESCAPELESS.lastIndex;
																																																												// ref iri
																																																												let s_iri = m_iriref_e_prefix[1];

																																																												// absolute iri
																																																												if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																													// set prefixes[this.temp_prefix_id]
																																																													this.prefixes[this.temp_prefix_id] = s_iri;
																																																												}
																																																												// relative iri
																																																												else {
																																																													// make prefixes[this.temp_prefix_id]
																																																													switch (s_iri[0]) {
																																																														case '#':
																																																															this.prefixes[this.temp_prefix_id] = this.base_url + s_iri;
																																																															break;
																																																														case '?':
																																																															this.prefixes[this.temp_prefix_id] = this.base_url.replace(/(\?.*)?$/, s_iri);
																																																															break;
																																																														case '/':
																																																															// relative to scheme
																																																															if ('/' === s_iri[1]) {
																																																																this.prefixes[this.temp_prefix_id] = this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1));
																																																															}
																																																															// relative to root
																																																															else {
																																																																this.prefixes[this.temp_prefix_id] = this.base_url_root + F_DOT_SEGMENTS(s_iri);
																																																															}
																																																															break;
																																																															// empty
																																																														case undefined:
																																																															// identity
																																																															this.prefixes[this.temp_prefix_id] = this.base_url;
																																																															break;
																																																															// dot segment
																																																														case '.':
																																																															// prepend so it is relative to root
																																																															s_iri = '/' + s_iri;
																																																															// relative to path
																																																														default:
																																																															this.prefixes[this.temp_prefix_id] = this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri);
																																																													}
																																																												}


																																																												// emit prefix event
																																																												if (this.prefix) {
																																																													let s_prefix_id = this.temp_prefix_id;
																																																													this.prefix(s_prefix_id, this.prefixes[s_prefix_id]);
																																																												}

																																																												if (this.expect_full_stop) {
																																																													// change state
																																																													return this.full_stop();
																																																												}

																																																												// goto statement state
																																																												return this.statement();

																																																												// prefix iri

																																																												// match_counter: 0

																																																											} else {

																																																												// prepare sticky regex index
																																																												R_IRIREF.lastIndex = i;

																																																												// execute regex
																																																												let m_iriref_prefix = R_IRIREF.exec(s);

																																																												// regex was a match
																																																												if (m_iriref_prefix) {

																																																													// advance index
																																																													this.i = R_IRIREF.lastIndex;
																																																													// ref iri
																																																													let s_iri = m_iriref_prefix[1]
																																																														.replace(R_UNICODE_ANY, F_UNICODE_REPLACE);;

																																																													// absolute iri
																																																													if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																														// set prefixes[this.temp_prefix_id]
																																																														this.prefixes[this.temp_prefix_id] = s_iri;
																																																													}
																																																													// relative iri
																																																													else {
																																																														// make prefixes[this.temp_prefix_id]
																																																														switch (s_iri[0]) {
																																																															case '#':
																																																																this.prefixes[this.temp_prefix_id] = this.base_url + s_iri;
																																																																break;
																																																															case '?':
																																																																this.prefixes[this.temp_prefix_id] = this.base_url.replace(/(\?.*)?$/, s_iri);
																																																																break;
																																																															case '/':
																																																																// relative to scheme
																																																																if ('/' === s_iri[1]) {
																																																																	this.prefixes[this.temp_prefix_id] = this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1));
																																																																}
																																																																// relative to root
																																																																else {
																																																																	this.prefixes[this.temp_prefix_id] = this.base_url_root + F_DOT_SEGMENTS(s_iri);
																																																																}
																																																																break;
																																																																// empty
																																																															case undefined:
																																																																// identity
																																																																this.prefixes[this.temp_prefix_id] = this.base_url;
																																																																break;
																																																																// dot segment
																																																															case '.':
																																																																// prepend so it is relative to root
																																																																s_iri = '/' + s_iri;
																																																																// relative to path
																																																															default:
																																																																this.prefixes[this.temp_prefix_id] = this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri);
																																																														}
																																																													}


																																																													// emit prefix event
																																																													if (this.prefix) {
																																																														let s_prefix_id = this.temp_prefix_id;
																																																														this.prefix(s_prefix_id, this.prefixes[s_prefix_id]);
																																																													}

																																																													if (this.expect_full_stop) {
																																																														// change state
																																																														return this.full_stop();
																																																													}

																																																													// goto statement state
																																																													return this.statement();

																																																													// for poorly-placed comments

																																																													// match_counter: 0

																																																												} else {

																																																													// prepare sticky regex index
																																																													R_COMMENT.lastIndex = i;

																																																													if (R_COMMENT.exec(s)) {

																																																														// advance index
																																																														i = R_COMMENT.lastIndex;
																																																														// do not change state
																																																														continue;

																																																														// match counter: 0
																																																													} else {
																																																														// break loop to retry on next chunk if eos
																																																														break;

																																																													}


																																																												}

																																																												// ran out of characters
																																																												// update index value
																																																												this.i = i;

																																																												// not yet eos
																																																												if (i < this.n) {
																																																													// expected token was not found
																																																													if (0 === i) {
																																																														// we've exceeded the maximum token length
																																																														if (this.n > this.max_token_length) {
																																																															return this.parse_error('prefix_iri');
																																																														}
																																																													}
																																																												}

																																																												// save state before pausing
																																																												this.state = this.prefix_iri;

																																																												// consumer is pausing
																																																												if (this.n < 0) {
																																																													// go async
																																																													return;
																																																												}

																																																												// store what is unparsed
																																																												this.pre = s.slice(i);

																																																												// if we're not parsing a stream, then this is an error
																																																												return this.eos && this.eos();
																																																											},


																																																											// in case eos happens twice during prefix / base (extremely unlikely)
																																																											// parse state for full_stop
																																																											full_stop() {
																																																													// destruct chunk, length, and index
																																																													let {
																																																														s,
																																																														n,
																																																														i
																																																													} = this;

																																																													// start labeled loop, run while there are characters
																																																													full_stop: while (i < n) {

																																																															// prepare sticky regex index
																																																															R_CHAR_STOP.lastIndex = i;

																																																															if (R_CHAR_STOP.exec(s)) {

																																																																// advance index
																																																																this.i = R_CHAR_STOP.lastIndex;
																																																																// resume statement
																																																																return this.statement();

																																																																// poorly-placed comment

																																																																// match_counter: 0

																																																															} else {

																																																																// prepare sticky regex index
																																																																R_COMMENT.lastIndex = i;

																																																																if (R_COMMENT.exec(s)) {

																																																																	// advance index
																																																																	i = R_COMMENT.lastIndex;
																																																																	// try again
																																																																	continue;

																																																																	// possibly interrupted by eos
																																																																	// match counter: 0
																																																																} else {
																																																																	// break loop to retry on next chunk if eos
																																																																	break;

																																																																}



																																																															}

																																																															// ran out of characters
																																																															// update index value
																																																															this.i = i;

																																																															// not yet eos
																																																															if (i < this.n) {
																																																																// expected token was not found
																																																																if (0 === i) {
																																																																	// we've exceeded the maximum token length
																																																																	if (this.n > this.max_token_length) {
																																																																		return this.parse_error('full_stop');
																																																																	}
																																																																}
																																																															}

																																																															// save state before pausing
																																																															this.state = this.full_stop;

																																																															// consumer is pausing
																																																															if (this.n < 0) {
																																																																// go async
																																																																return;
																																																															}

																																																															// store what is unparsed
																																																															this.pre = s.slice(i);

																																																															// if we're not parsing a stream, then this is an error
																																																															return this.eos && this.eos();
																																																														},


																																																														// parse state for collection_subject
																																																														collection_subject() {
																																																															// destruct chunk, length, and index
																																																															let {
																																																																s,
																																																																n,
																																																																i
																																																															} = this;

																																																															// start labeled loop, run while there are characters
																																																															collection_subject: while (i < n) {
																																																																	// ref char
																																																																	let x = s[i];

																																																																	// end of collection
																																																																	if (`)` === x) {
																																																																		R_WS.lastIndex = i + 1;
																																																																		R_WS.exec(s);
																																																																		this.i = R_WS.lastIndex;

																																																																		// no items in collection subject
																																																																		if (null === this.subject) {
																																																																			// prepare subject
																																																																			this.subject = HP_NN_RDF_NIL;

																																																																			// state was never pushed to stack, jump to post_subject state
																																																																			return this.post_blank_subject();
																																																																		}
																																																																		// otherwise, there must be items in collection

																																																																		// commit collection end
																																																																		this.object = HP_NN_RDF_NIL;
																																																																		this.data(new Quad(this));
																																																																		// this.operator.emit('data', new Quad(this));

																																																																		// restore state from stack
																																																																		let s_resume_state;
																																																																		[this.subject, this.predicate, s_resume_state] = this.nested.pop();
																																																																		return this[s_resume_state]();
																																																																	}




																																																																	// otherwise, pre-emptively secure the next blank node label
																																																																	let s_pointer_label = this.next_label();

																																																																	// very first collection object
																																																																	if (null === this.subject) {
																																																																		// set quasi subject (really for resume state)
																																																																		this.subject = new BlankNode(s_pointer_label);
																																																																		this.nested.push([this.subject, this.predicate, 'pairs']);
																																																																		// reset subject for later conditional branch
																																																																		this.subject = null;
																																																																	}

																																																																	// iriref

																																																																	// prepare sticky regex index
																																																																	R_IRIREF_ESCAPELESS.lastIndex = i;

																																																																	// execute regex
																																																																	let m_iriref_e_object = R_IRIREF_ESCAPELESS.exec(s);

																																																																	// regex was a match
																																																																	if (m_iriref_e_object) {

																																																																		// advance index
																																																																		i = R_IRIREF_ESCAPELESS.lastIndex;
																																																																		// ref iri
																																																																		let s_iri = m_iriref_e_object[1];

																																																																		// absolute iri
																																																																		if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																																			// set object
																																																																			this.object = new NamedNode(s_iri);
																																																																		}
																																																																		// relative iri
																																																																		else {
																																																																			// make object
																																																																			switch (s_iri[0]) {
																																																																				case '#':
																																																																					this.object = new NamedNode(this.base_url + s_iri);
																																																																					break;
																																																																				case '?':
																																																																					this.object = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
																																																																					break;
																																																																				case '/':
																																																																					// relative to scheme
																																																																					if ('/' === s_iri[1]) {
																																																																						this.object = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
																																																																					}
																																																																					// relative to root
																																																																					else {
																																																																						this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
																																																																					}
																																																																					break;
																																																																					// empty
																																																																				case undefined:
																																																																					// identity
																																																																					this.object = new NamedNode(this.base_url);
																																																																					break;
																																																																					// dot segment
																																																																				case '.':
																																																																					// prepend so it is relative to root
																																																																					s_iri = '/' + s_iri;
																																																																					// relative to path
																																																																				default:
																																																																					this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
																																																																			}
																																																																		}


																																																																		// prefixed name

																																																																		// match_counter: 0

																																																																	} else {

																																																																		// prepare sticky regex index
																																																																		R_PREFIXED_NAME_ESCAPELESS.lastIndex = i;

																																																																		// execute regex
																																																																		let m_prefixed_named_e_object = R_PREFIXED_NAME_ESCAPELESS.exec(s);

																																																																		// regex was a match
																																																																		if (m_prefixed_named_e_object) {

																																																																			// advance index
																																																																			i = R_PREFIXED_NAME_ESCAPELESS.lastIndex;
																																																																			// check valid prefix
																																																																			let s_prefix_id = m_prefixed_named_e_object[1] || '';

																																																																			// invalid prefix
																																																																			if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																																																																			// commit object iri from resolve prefixed name
																																																																			this.object = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_e_object[2]);

																																																																			// string literal
																																																																		} else if (`"` === x || `'` === x) {
																																																																			// first item in list
																																																																			if (null === this.subject) {
																																																																				this.subject = new BlankNode(s_pointer_label);
																																																																				this.predicate = HP_NN_RDF_FIRST;
																																																																			}
																																																																			// not first item in list
																																																																			else {
																																																																				// make nest list item
																																																																				this.object = new BlankNode(s_pointer_label);
																																																																				this.data(new Quad(this));
																																																																				// this.operator.emit('data', new Quad(this));

																																																																				// setup for object literal
																																																																				this.subject = new BlankNode(s_pointer_label);
																																																																				this.predicate = HP_NN_RDF_FIRST;
																																																																			}

																																																																			// how to resume collection subject state after object literal
																																																																			this.after_end_of_statement = function() {
																																																																				this.predicate = HP_NN_RDF_REST;
																																																																				this.after_end_of_statement = this.post_object;
																																																																				return this.collection_subject();
																																																																			};
																																																																			return this.string_literal();

																																																																			// numeric literal

																																																																			// match_counter: 0

																																																																		} else {

																																																																			// prepare sticky regex index
																																																																			R_NUMERIC_LITERAL.lastIndex = i;

																																																																			// execute regex
																																																																			let m_numeric_literal = R_NUMERIC_LITERAL.exec(s);

																																																																			// regex was a match
																																																																			if (m_numeric_literal) {

																																																																				// advance index
																																																																				i = R_NUMERIC_LITERAL.lastIndex;
																																																																				// it has exponent term, xsd:double
																																																																				if (m_numeric_literal[4]) {
																																																																					this.object = new DoubleLiteral(m_numeric_literal[1]);
																																																																				}
																																																																				// contains decimal point, xsd:decimal
																																																																				else if (m_numeric_literal[2] || m_numeric_literal[3]) {
																																																																					this.object = new DecimalLiteral(m_numeric_literal[1]);
																																																																				}
																																																																				// otherwise, it is an integer
																																																																				else {
																																																																					this.object = new IntegerLiteral(m_numeric_literal[1]);
																																																																				}

																																																																				// boolean literal

																																																																				// match_counter: 0

																																																																			} else {

																																																																				// prepare sticky regex index
																																																																				R_BOOLEAN_LITERAL.lastIndex = i;

																																																																				// execute regex
																																																																				let m_boolean_literal = R_BOOLEAN_LITERAL.exec(s);

																																																																				// regex was a match
																																																																				if (m_boolean_literal) {

																																																																					// advance index
																																																																					i = R_BOOLEAN_LITERAL.lastIndex;
																																																																					// make literal
																																																																					this.object = new Literal(m_boolean_literal[1] ? true : false);

																																																																					// blank node property list
																																																																				} else if (`[` === x) {
																																																																					// advance index to next token
																																																																					R_WS.lastIndex = i + 1;
																																																																					R_WS.exec(s);
																																																																					this.i = R_WS.lastIndex;

																																																																					// this blank node is just the next item in the list
																																																																					if (null !== this.subject) {
																																																																						this.object = new BlankNode(s_pointer_label);
																																																																						this.data(new Quad(this));
																																																																						// this.operator.emit('data', new Quad(this));
																																																																					}

																																																																					// subject needs to be set
																																																																					this.subject = new BlankNode(s_pointer_label);
																																																																					this.predicate = HP_NN_RDF_FIRST;
																																																																					let s_label = this.next_label();
																																																																					this.object = new BlankNode(s_label);
																																																																					this.data(new Quad(this));
																																																																					// this.operator.emit('data', new Quad(this));

																																																																					// when resume
																																																																					this.predicate = HP_NN_RDF_REST;

																																																																					// push state
																																																																					this.nested.push([this.subject, this.predicate, 'collection_subject']);

																																																																					// prepare next triple
																																																																					this.subject = new BlankNode(s_label);

																																																																					// goto parsing pairs state
																																																																					return this.pairs();

																																																																					// new collection
																																																																				} else if (`(` === x) {
																																																																					R_WS.lastIndex = i + 1;
																																																																					R_WS.exec(s);
																																																																					i = R_WS.lastIndex;

																																																																					// commit list item pointer
																																																																					this.object = new BlankNode(s_pointer_label);
																																																																					this.data(new Quad(this));
																																																																					// this.operator.emit('data', new Quad(this));

																																																																					// add this list as an item to the outer list
																																																																					this.subject = new BlankNode(s_pointer_label);
																																																																					this.predicate = HP_NN_RDF_REST;
																																																																					this.nested.push([this.subject, this.predicate, 'collection_object']);

																																																																					// prepare next triple
																																																																					this.predicate = HP_NN_RDF_FIRST;

																																																																					// flowing
																																																																					continue;

																																																																					// labeled blank node

																																																																					// match_counter: 0

																																																																				} else {

																																																																					// prepare sticky regex index
																																																																					R_BLANK_NODE_LABEL.lastIndex = i;

																																																																					// execute regex
																																																																					let m_blank_node_label_object = R_BLANK_NODE_LABEL.exec(s);

																																																																					// regex was a match
																																																																					if (m_blank_node_label_object) {

																																																																						// advance index
																																																																						i = R_BLANK_NODE_LABEL.lastIndex;
																																																																						// ref blank node label
																																																																						let s_label = m_blank_node_label_object[1];

																																																																						// not first time use of label
																																																																						let z_label_state = this.labels[s_label];
																																																																						if (z_label_state) {
																																																																							// label was used previously by document and has no conflict
																																																																							if (1 === z_label_state) {}
																																																																							// label is in use by invention, this would cause a conflict
																																																																							else if (2 === z_label_state) {
																																																																								// so create a redirect mapping for this actual label & use it instead
																																																																								s_label = this.labels[s_label] = this.next_label();
																																																																							}
																																																																							// label already has a redirect mapping
																																																																							else {
																																																																								// use redirected label
																																																																								s_label = this.labels[s_label];
																																																																							}
																																																																						}
																																																																						// first time use of label
																																																																						else {
																																																																							// store label in hash so we avoid future collisions
																																																																							this.labels[s_label] = 1;
																																																																						}

																																																																						// make object
																																																																						this.object = new BlankNode(s_label);

																																																																						// iriref

																																																																						// match_counter: 0

																																																																					} else {

																																																																						// prepare sticky regex index
																																																																						R_IRIREF.lastIndex = i;

																																																																						// execute regex
																																																																						let m_iriref_object = R_IRIREF.exec(s);

																																																																						// regex was a match
																																																																						if (m_iriref_object) {

																																																																							// advance index
																																																																							i = R_IRIREF.lastIndex;
																																																																							// ref iri
																																																																							let s_iri = m_iriref_object[1]
																																																																								.replace(R_UNICODE_ANY, F_UNICODE_REPLACE);;

																																																																							// absolute iri
																																																																							if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																																								// set object
																																																																								this.object = new NamedNode(s_iri);
																																																																							}
																																																																							// relative iri
																																																																							else {
																																																																								// make object
																																																																								switch (s_iri[0]) {
																																																																									case '#':
																																																																										this.object = new NamedNode(this.base_url + s_iri);
																																																																										break;
																																																																									case '?':
																																																																										this.object = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
																																																																										break;
																																																																									case '/':
																																																																										// relative to scheme
																																																																										if ('/' === s_iri[1]) {
																																																																											this.object = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
																																																																										}
																																																																										// relative to root
																																																																										else {
																																																																											this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
																																																																										}
																																																																										break;
																																																																										// empty
																																																																									case undefined:
																																																																										// identity
																																																																										this.object = new NamedNode(this.base_url);
																																																																										break;
																																																																										// dot segment
																																																																									case '.':
																																																																										// prepend so it is relative to root
																																																																										s_iri = '/' + s_iri;
																																																																										// relative to path
																																																																									default:
																																																																										this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
																																																																								}
																																																																							}


																																																																							// prefixed name

																																																																							// match_counter: 0

																																																																						} else {

																																																																							// prepare sticky regex index
																																																																							R_PREFIXED_NAME.lastIndex = i;

																																																																							// execute regex
																																																																							let m_prefixed_named_object = R_PREFIXED_NAME.exec(s);

																																																																							// regex was a match
																																																																							if (m_prefixed_named_object) {

																																																																								// advance index
																																																																								i = R_PREFIXED_NAME.lastIndex;
																																																																								// check valid prefix
																																																																								let s_prefix_id = m_prefixed_named_object[1] || '';

																																																																								// invalid prefix
																																																																								if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																																																																								let s_suffix = m_prefixed_named_object[2].replace(R_PN_LOCAL_ESCAPES, '$1');

																																																																								// commit object iri from resolve prefixed name
																																																																								this.object = new NamedNode(this.prefixes[s_prefix_id] + s_suffix);


																																																																								// match_counter: 0

																																																																							} else {

																																																																								// prepare sticky regex index
																																																																								R_COMMENT.lastIndex = i;

																																																																								if (R_COMMENT.exec(s)) {

																																																																									// advance index
																																																																									i = R_COMMENT.lastIndex;
																																																																									continue;

																																																																									// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
																																																																									// match counter: 0
																																																																								} else {
																																																																									// break loop to retry on next chunk if eos
																																																																									break;

																																																																								}





																																																																								// not the very first item of collection subject
																																																																								if (this.subject !== null) {
																																																																									// ref object
																																																																									let w_object = this.object;

																																																																									// create blanknode to embed list
																																																																									this.object = new BlankNode(s_pointer_label);

																																																																									// emit statement that functions as collection's head "pointer"
																																																																									this.data(new Quad(this));
																																																																									// this.operator.emit('data', new Quad(this));

																																																																									// swap back object
																																																																									this.object = w_object;
																																																																								}

																																																																								// emit statement that is item
																																																																								this.subject = new BlankNode(s_pointer_label);
																																																																								this.predicate = HP_NN_RDF_FIRST;
																																																																								this.data(new Quad(this));
																																																																								// this.operator.emit('data', new Quad(this));

																																																																								// prepare next predicate
																																																																								this.predicate = HP_NN_RDF_REST;

																																																																							}

																																																																							// ran out of characters
																																																																							// update index value
																																																																							this.i = i;

																																																																							// not yet eos
																																																																							if (i < this.n) {
																																																																								// expected token was not found
																																																																								if (0 === i) {
																																																																									// we've exceeded the maximum token length
																																																																									if (this.n > this.max_token_length) {
																																																																										return this.parse_error('collection_subject');
																																																																									}
																																																																								}
																																																																							}

																																																																							// save state before pausing
																																																																							this.state = this.collection_subject;

																																																																							// consumer is pausing
																																																																							if (this.n < 0) {
																																																																								// go async
																																																																								return;
																																																																							}

																																																																							// store what is unparsed
																																																																							this.pre = s.slice(i);

																																																																							// if we're not parsing a stream, then this is an error
																																																																							return this.eos && this.eos();
																																																																						},



																																																																						// parse state for collection_object
																																																																						collection_object() {
																																																																								// destruct chunk, length, and index
																																																																								let {
																																																																									s,
																																																																									n,
																																																																									i
																																																																								} = this;

																																																																								// start labeled loop, run while there are characters
																																																																								collection_object: while (i < n) {

																																																																										// ref char
																																																																										let x = s[i];

																																																																										// end of collection
																																																																										if (`)` === x) {
																																																																											R_WS.lastIndex = i + 1;
																																																																											R_WS.exec(s);
																																																																											this.i = R_WS.lastIndex;

																																																																											// make & emit collection's tail "pointer"
																																																																											this.object = HP_NN_RDF_NIL;
																																																																											this.data(new Quad(this));
																																																																											// this.operator.emit('data', new Quad(this));

																																																																											// restore previous state
																																																																											let s_resume_state;
																																																																											[this.subject, this.predicate, s_resume_state] = this.nested.pop();
																																																																											return this[s_resume_state]();
																																																																										}




																																																																										// otherwise, pre-emptively secure the next blank node label
																																																																										let s_pointer_label = this.next_label();

																																																																										// iriref

																																																																										// prepare sticky regex index
																																																																										R_IRIREF_ESCAPELESS.lastIndex = i;

																																																																										// execute regex
																																																																										let m_iriref_e_object = R_IRIREF_ESCAPELESS.exec(s);

																																																																										// regex was a match
																																																																										if (m_iriref_e_object) {

																																																																											// advance index
																																																																											i = R_IRIREF_ESCAPELESS.lastIndex;
																																																																											// commit object iri as is
																																																																											// ref iri
																																																																											let s_iri = m_iriref_e_object[1];

																																																																											// absolute iri
																																																																											if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																																												// set object
																																																																												this.object = new NamedNode(s_iri);
																																																																											}
																																																																											// relative iri
																																																																											else {
																																																																												// make object
																																																																												switch (s_iri[0]) {
																																																																													case '#':
																																																																														this.object = new NamedNode(this.base_url + s_iri);
																																																																														break;
																																																																													case '?':
																																																																														this.object = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
																																																																														break;
																																																																													case '/':
																																																																														// relative to scheme
																																																																														if ('/' === s_iri[1]) {
																																																																															this.object = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
																																																																														}
																																																																														// relative to root
																																																																														else {
																																																																															this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
																																																																														}
																																																																														break;
																																																																														// empty
																																																																													case undefined:
																																																																														// identity
																																																																														this.object = new NamedNode(this.base_url);
																																																																														break;
																																																																														// dot segment
																																																																													case '.':
																																																																														// prepend so it is relative to root
																																																																														s_iri = '/' + s_iri;
																																																																														// relative to path
																																																																													default:
																																																																														this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
																																																																												}
																																																																											}


																																																																											// prefixed name

																																																																											// match_counter: 0

																																																																										} else {

																																																																											// prepare sticky regex index
																																																																											R_PREFIXED_NAME_ESCAPELESS.lastIndex = i;

																																																																											// execute regex
																																																																											let m_prefixed_named_e_object = R_PREFIXED_NAME_ESCAPELESS.exec(s);

																																																																											// regex was a match
																																																																											if (m_prefixed_named_e_object) {

																																																																												// advance index
																																																																												i = R_PREFIXED_NAME_ESCAPELESS.lastIndex;
																																																																												// check valid prefix
																																																																												let s_prefix_id = m_prefixed_named_e_object[1] || '';

																																																																												// invalid prefix
																																																																												if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																																																																												// commit object iri from resolve prefixed name
																																																																												this.object = new NamedNode(this.prefixes[s_prefix_id] + m_prefixed_named_e_object[2]);

																																																																												// string literal
																																																																											} else if (`"` === x || `'` === x) {
																																																																												// update index before changing states
																																																																												this.i = i;

																																																																												// create blanknode to embed list
																																																																												this.object = new BlankNode(s_pointer_label);

																																																																												// emit statement that functions as collection's head "pointer"
																																																																												this.data(new Quad(this));
																																																																												// this.operator.emit('data', new Quad(this));

																																																																												// prepare statement that is item
																																																																												this.subject = new BlankNode(s_pointer_label);
																																																																												this.predicate = HP_NN_RDF_FIRST;

																																																																												this.after_end_of_statement = function() {
																																																																													this.predicate = HP_NN_RDF_REST;
																																																																													this.after_end_of_statement = this.post_object;
																																																																													return this.collection_object();
																																																																												};
																																																																												return this.string_literal();

																																																																												// numeric literal

																																																																												// match_counter: 0

																																																																											} else {

																																																																												// prepare sticky regex index
																																																																												R_NUMERIC_LITERAL.lastIndex = i;

																																																																												// execute regex
																																																																												let m_numeric_literal = R_NUMERIC_LITERAL.exec(s);

																																																																												// regex was a match
																																																																												if (m_numeric_literal) {

																																																																													// advance index
																																																																													i = R_NUMERIC_LITERAL.lastIndex;
																																																																													// it has exponent term, xsd:double
																																																																													if (m_numeric_literal[4]) {
																																																																														this.object = new DoubleLiteral(m_numeric_literal[1]);
																																																																													}
																																																																													// contains decimal point, xsd:decimal
																																																																													else if (m_numeric_literal[2] || m_numeric_literal[3]) {
																																																																														this.object = new DecimalLiteral(m_numeric_literal[1]);
																																																																													}
																																																																													// otherwise, it is an integer
																																																																													else {
																																																																														this.object = new IntegerLiteral(m_numeric_literal[1]);
																																																																													}

																																																																													// boolean literal

																																																																													// match_counter: 0

																																																																												} else {

																																																																													// prepare sticky regex index
																																																																													R_BOOLEAN_LITERAL.lastIndex = i;

																																																																													// execute regex
																																																																													let m_boolean_literal = R_BOOLEAN_LITERAL.exec(s);

																																																																													// regex was a match
																																																																													if (m_boolean_literal) {

																																																																														// advance index
																																																																														i = R_BOOLEAN_LITERAL.lastIndex;
																																																																														// make literal
																																																																														this.object = new Literal(m_boolean_literal[1] ? true : false);

																																																																														// blank node property list
																																																																													} else if (`[` === x) {
																																																																														// advance index to next token
																																																																														R_WS.lastIndex = i + 1;
																																																																														R_WS.exec(s);
																																																																														this.i = R_WS.lastIndex;

																																																																														// commit head of list pointer
																																																																														this.object = new BlankNode(s_pointer_label);
																																																																														this.data(new Quad(this));
																																																																														// this.operator.emit('data', new Quad(this));

																																																																														// setup state to resume and push
																																																																														this.subject = new BlankNode(s_pointer_label);
																																																																														this.predicate = HP_NN_RDF_REST;
																																																																														this.nested.push([this.subject, this.predicate, 'collection_object']);

																																																																														// enter blank node
																																																																														this.predicate = HP_NN_RDF_FIRST;
																																																																														let s_label = this.next_label();
																																																																														this.object = new BlankNode(s_label);
																																																																														this.data(new Quad(this));
																																																																														// this.operator.emit('data', new Quad(this));

																																																																														// prepare next triple
																																																																														this.subject = new BlankNode(s_label);
																																																																														this.predicate = HP_NN_RDF_FIRST;

																																																																														// goto parsing pairs state
																																																																														return this.pairs();

																																																																														// new collection
																																																																													} else if (`(` === x) {
																																																																														R_WS.lastIndex = i + 1;
																																																																														R_WS.exec(s);
																																																																														i = R_WS.lastIndex;

																																																																														// commit list item pointer
																																																																														this.object = new BlankNode(s_pointer_label);
																																																																														if (null === this.subject) {
																																																																															let a_recent = this.nested[this.nested.length - 1];
																																																																															this.subject = a_recent[0];
																																																																															this.predicate = a_recent[1];
																																																																														}
																																																																														this.data(new Quad(this));
																																																																														// this.operator.emit('data', new Quad(this));

																																																																														// add this list as an item to the outer list
																																																																														this.subject = new BlankNode(s_pointer_label);
																																																																														this.predicate = HP_NN_RDF_REST;
																																																																														this.nested.push([this.subject, this.predicate, 'collection_object']);

																																																																														// prepare next triple
																																																																														this.predicate = HP_NN_RDF_FIRST;

																																																																														// flowing
																																																																														continue;

																																																																														// labeled blank node

																																																																														// match_counter: 0

																																																																													} else {

																																																																														// prepare sticky regex index
																																																																														R_BLANK_NODE_LABEL.lastIndex = i;

																																																																														// execute regex
																																																																														let m_blank_node_label_object = R_BLANK_NODE_LABEL.exec(s);

																																																																														// regex was a match
																																																																														if (m_blank_node_label_object) {

																																																																															// advance index
																																																																															i = R_BLANK_NODE_LABEL.lastIndex;
																																																																															// ref blank node label
																																																																															let s_label = m_blank_node_label_object[1];

																																																																															// not first time use of label
																																																																															let z_label_state = this.labels[s_label];
																																																																															if (z_label_state) {
																																																																																// label was used previously by document and has no conflict
																																																																																if (1 === z_label_state) {}
																																																																																// label is in use by invention, this would cause a conflict
																																																																																else if (2 === z_label_state) {
																																																																																	// so create a redirect mapping for this actual label & use it instead
																																																																																	s_label = this.labels[s_label] = this.next_label();
																																																																																}
																																																																																// label already has a redirect mapping
																																																																																else {
																																																																																	// use redirected label
																																																																																	s_label = this.labels[s_label];
																																																																																}
																																																																															}
																																																																															// first time use of label
																																																																															else {
																																																																																// store label in hash so we avoid future collisions
																																																																																this.labels[s_label] = 1;
																																																																															}

																																																																															// make object
																																																																															this.object = new BlankNode(s_label);

																																																																															// iriref

																																																																															// match_counter: 0

																																																																														} else {

																																																																															// prepare sticky regex index
																																																																															R_IRIREF.lastIndex = i;

																																																																															// execute regex
																																																																															let m_iriref_object = R_IRIREF.exec(s);

																																																																															// regex was a match
																																																																															if (m_iriref_object) {

																																																																																// advance index
																																																																																i = R_IRIREF.lastIndex;
																																																																																// commit object iri as is
																																																																																// ref iri
																																																																																let s_iri = m_iriref_object[1]
																																																																																	.replace(R_UNICODE_ANY, F_UNICODE_REPLACE);;

																																																																																// absolute iri
																																																																																if (!this.base_url || R_IRI_ABSOLUTE.test(s_iri)) {
																																																																																	// set object
																																																																																	this.object = new NamedNode(s_iri);
																																																																																}
																																																																																// relative iri
																																																																																else {
																																																																																	// make object
																																																																																	switch (s_iri[0]) {
																																																																																		case '#':
																																																																																			this.object = new NamedNode(this.base_url + s_iri);
																																																																																			break;
																																																																																		case '?':
																																																																																			this.object = new NamedNode(this.base_url.replace(/(\?.*)?$/, s_iri));
																																																																																			break;
																																																																																		case '/':
																																																																																			// relative to scheme
																																																																																			if ('/' === s_iri[1]) {
																																																																																				this.object = new NamedNode(this.base_url_scheme + F_DOT_SEGMENTS(s_iri.substr(1)));
																																																																																			}
																																																																																			// relative to root
																																																																																			else {
																																																																																				this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(s_iri));
																																																																																			}
																																																																																			break;
																																																																																			// empty
																																																																																		case undefined:
																																																																																			// identity
																																																																																			this.object = new NamedNode(this.base_url);
																																																																																			break;
																																																																																			// dot segment
																																																																																		case '.':
																																																																																			// prepend so it is relative to root
																																																																																			s_iri = '/' + s_iri;
																																																																																			// relative to path
																																																																																		default:
																																																																																			this.object = new NamedNode(this.base_url_root + F_DOT_SEGMENTS(this.base_url_path + s_iri));
																																																																																	}
																																																																																}


																																																																																// prefixed name

																																																																																// match_counter: 0

																																																																															} else {

																																																																																// prepare sticky regex index
																																																																																R_PREFIXED_NAME.lastIndex = i;

																																																																																// execute regex
																																																																																let m_prefixed_named_object = R_PREFIXED_NAME.exec(s);

																																																																																// regex was a match
																																																																																if (m_prefixed_named_object) {

																																																																																	// advance index
																																																																																	i = R_PREFIXED_NAME.lastIndex;
																																																																																	// check valid prefix
																																																																																	let s_prefix_id = m_prefixed_named_object[1] || '';

																																																																																	// invalid prefix
																																																																																	if (!this.prefixes.hasOwnProperty(s_prefix_id)) return this._error(`no such prefix "${s_prefix_id}"`);

																																																																																	let s_suffix = m_prefixed_named_object[2].replace(R_PN_LOCAL_ESCAPES, '$1');

																																																																																	// commit object iri from resolve prefixed name
																																																																																	this.object = new NamedNode(this.prefixes[s_prefix_id] + s_suffix);


																																																																																	// match_counter: 0

																																																																																} else {

																																																																																	// prepare sticky regex index
																																																																																	R_COMMENT.lastIndex = i;

																																																																																	if (R_COMMENT.exec(s)) {

																																																																																		// advance index
																																																																																		i = R_COMMENT.lastIndex;
																																																																																		continue;

																																																																																		// not iriref, not prefixed name, not string literal, not numeric literal, not boolean literal, not blank node property list, not collection
																																																																																		// match counter: 0
																																																																																	} else {
																																																																																		// break loop to retry on next chunk if eos
																																																																																		break;

																																																																																	}




																																																																																	// ref object
																																																																																	let w_object = this.object;

																																																																																	// create blanknode to embed list
																																																																																	this.object = new BlankNode(s_pointer_label);

																																																																																	// emit statement that functions as collection's head "pointer"
																																																																																	this.data(new Quad(this));
																																																																																	// this.operator.emit('data', new Quad(this));

																																																																																	// emit statement that is item
																																																																																	this.subject = new BlankNode(s_pointer_label);
																																																																																	this.predicate = HP_NN_RDF_FIRST;
																																																																																	this.object = w_object;
																																																																																	this.data(new Quad(this));
																																																																																	// this.operator.emit('data', new Quad(this));

																																																																																	// prepare next predicate
																																																																																	this.predicate = HP_NN_RDF_REST;

																																																																																}

																																																																																// ran out of characters
																																																																																// update index value
																																																																																this.i = i;

																																																																																// not yet eos
																																																																																if (i < this.n) {
																																																																																	// expected token was not found
																																																																																	if (0 === i) {
																																																																																		// we've exceeded the maximum token length
																																																																																		if (this.n > this.max_token_length) {
																																																																																			return this.parse_error('collection_object');
																																																																																		}
																																																																																	}
																																																																																}

																																																																																// save state before pausing
																																																																																this.state = this.collection_object;

																																																																																// consumer is pausing
																																																																																if (this.n < 0) {
																																																																																	// go async
																																																																																	return;
																																																																																}

																																																																																// store what is unparsed
																																																																																this.pre = s.slice(i);

																																																																																// if we're not parsing a stream, then this is an error
																																																																																return this.eos && this.eos();
																																																																															},

																																																																														});

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