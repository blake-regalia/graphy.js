export class ContentError extends Error {
	constructor(gc_error) {
		super();
		this._k_content = gc_error.content;
		this._s_message = gc_error.message;
		this._s_state = gc_error.state;
		this._s_source = gc_error.source;
		this._i_position = gc_error.position;
		this._g_location = gc_error.location;
	}

	get title() {
		return (this.name || this.constructor.name)+'<'+this.instanceName+'> : '+this.description;
	}

	get instanceName() {
		return this._k_content.constructor.name;
	}

	get message() {
		return this._s_message;
	}

	toString() {
		const i_pos = this._i_position;
		const i_off = Math.min(i_pos, Math.abs(i_pos-15));

		return `@graphy/content.${this.name}\n`
			+(this._g_location? `  at { line: ${this._g_location.line}, col: ${this._g_location.col} }\n`: '')
			+`\n  ${this._s_source.substr(i_off, i_off+90).replace(/[\n\t]/g, ' ')}\n`
			+`  ${' '.repeat(i_pos-i_off)}^\n`
			+`  ${this._s_message.replace()}`;
	}
}

export class TurtleSyntaxError extends ContentError {}
TurtleSyntaxError.prototype.name = 'SyntaxError';
TurtleSyntaxError.prototype.description = 'Turtle syntax error while reading input.';

export class TurtleUnexpectedTokenError extends TurtleSyntaxError {
	constructor(gc_error) {
		super(gc_error);
		const s_char = this._s_source[this._i_pos];
		this._s_message = `Expected ${this.state} ${gc_error.eofed? 'but encountered <<EOF>>': ''}. Failed to parse a valid token starting at ${s_char? '"'+s_char+'"': '<<EOF>>'}`;
	}
}

export class InvalidStateChangeError extends ContentError {}
InvalidStateChangeError.prototype.description = 'An invalid state change was detected.';

export class NoSuchPrefixError extends ContentError {
	constructor(gc_error) {
		super(gc_error);
		this._s_message = `No such prefix '${gc_error.prefix}' was declared.`;
	}
}
NoSuchPrefixError.description = 'Missing prefix.';

export class EMTLError extends ContentError {
	constructor(gc_error) {
		super(gc_error);
		this._s_message = `The maximum token length is currently set to ${gc_error.mtl}. You can adjust this value in the parameters.`;
	}
}
EMTLError.prototype.description = 'Exceeded maximum token length while reading input.';

/*

@graphy/content.SyntaxError<TurtleReader> : Turtle syntax error while reading input.
  at { line: 816, col: 15 }

  "; geophysical/border: <https://
                ^

  Not allowed to make thing here.
*/
