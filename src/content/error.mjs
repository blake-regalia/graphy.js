export class ContentError extends Error {
	constructor(gc_error) {
		super();
		this._k_content = gc_error.content;
		this._s_message = gc_error.message;
		this._s_state = gc_error.state;
		this._s_source = gc_error.source;
		this._i_position = gc_error.position;
		this._g_location = gc_error.location;

		this.name = `@graphy/content.${this.name}`;
	}

	get title() {
		return (this.name || this.constructor.name)+'<'+this.instanceName+'> : '+this.description;
	}

	get instanceName() {
		return this._k_content.constructor.name;
	}

	get message() {
		return this.toString();
	}

	// get stack() {
	// 	return this.title+'::'+this._s_message+'\n'+this.toString();
	// }

	toString() {
		const i_pos = this._i_position;

		// 55 sets the relative bias to the front of the message
		const i_off = Math.min(i_pos, Math.abs(i_pos-55));

		// 90 sets the max width of the preview
		const s_preview = this._s_source.substr(i_off, 90).replace(/[\n\t]/g, ' ');

		return this.description+'\n'
			+(this._g_location? `  at { line: ${this._g_location.line}, col: ${this._g_location.col} }\n`: ' to see the line/col offset, remove or disable the `swift: true` option')
			+`\n  ${s_preview}\n`
			+`  ${' '.repeat(i_pos-i_off)}^\n`
			+`  ${this._s_message}`;
	}
}

export class ContentSyntaxError extends ContentError {}
ContentSyntaxError.prototype.name = 'ContentSyntaxError';
ContentSyntaxError.prototype.description = 'A syntax error was found while reading input.';

export class UnexpectedTokenError extends ContentSyntaxError {
	constructor(gc_error) {
		super(gc_error);
		const s_char = this._s_source[this._i_position];
		this._s_message = `Expected ${this._s_state} ${gc_error.eofed? 'but encountered <<EOF>>': ''}. Failed to parse a valid token starting at ${s_char? '"'+s_char+'"': '<<EOF>>'}`;
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
NoSuchPrefixError.description = 'Missing prefix declaration.';

export class ExceededMaximumTokenLengthError extends ContentError {
	constructor(gc_error) {
		super(gc_error);
		this._s_message = `The maximum token length is currently set to ${gc_error.mtl}. You can adjust this value in the parameters.`;
	}
}
ExceededMaximumTokenLengthError.prototype.description = 'Exceeded maximum token length while reading input.';

/*

@graphy/content.SyntaxError<TurtleReader> : Turtle syntax error while reading input.
  at { line: 816, col: 15 }

  "; geophysical/border: <https://
                ^

  Not allowed to make thing here.
*/
