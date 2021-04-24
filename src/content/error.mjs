export class ContentError extends Error {
	constructor(gc_error) {
		super();
		this._k_content = gc_error.content;
		this._s_message = gc_error.message;
		this._s_state = gc_error.state;
		this._s_source = gc_error.source;
		this._g_location = gc_error.location;
		({
			caret: this._i_caret,
			start: this._i_token_start=-1,
			end: this._i_token_end=-1,
		} = gc_error.token);

		this.name = `@graphy/content.${this.title}`;
		// this.name = this.title;
	}

	get title() {
		return (this.name || this.constructor.name)+'<'+this.instanceName+'>';
	}

	get instanceName() {
		return this._k_content._dc_actor.name;
	}

	get message() {
		return this.toString();
	}

	// get stack() {
	// 	return this.title+'::'+this._s_message+'\n'+this.toString();
	// }

	toString() {
		const i_pos = this._i_caret;

		// sets the max width of the preview
		const nl_width = Math.min(90, process?.stdout?.columns || 90);

		// 0.62 sets the relative bias to the front of the message
		const i_off = Math.min(i_pos, Math.abs(i_pos-Math.floor(nl_width*0.62)));

		// format preview
		const s_preview = this._s_source.substr(i_off, nl_width).replace(/[\n\t]/g, ' ');
debugger;
		// border strings
		const nl_pre = i_pos - i_off;
		let s_border_top= '';
		let s_border_btm = '';

		if(this._i_token_start >= 0) {
			const a_border_top = '┈'.repeat(nl_width).split('');
			const a_border_btm = [...a_border_top];

			const ir_token_start = this._i_token_start - i_off;
			const ir_caret = this._i_caret - i_off;
			const ir_token_end = this._i_token_end - i_off;

			if(ir_token_start >= 0) {
				a_border_top[ir_token_start] = '┍';
				a_border_btm[ir_token_start] = '┕';
			}

			if(ir_token_end < nl_width) {
				a_border_top[ir_token_end-1] = '┑';
				a_border_btm[ir_token_end-1] = '┙';
			}

			a_border_top[ir_caret] = '┻';
			a_border_btm[ir_caret] = '┳';

			s_border_top = a_border_top.join('');
			s_border_btm = a_border_btm.join('');
		}
		else {
			s_border_top = '┈'.repeat(nl_pre);
			const s_post = '┈'.repeat(nl_width-nl_pre-1);
			s_border_btm = s_border_top+'┳'+s_post;
			s_border_top += '┻'+s_post;
		}

		return this.description+'\n'
			+(this._g_location? `  at { line: ${this._g_location.line}, col: ${this._g_location.col} }`: ' to see the line/col offset, remove or disable the `swift: true` option')+'\n'
			+`  ${s_border_top}\n`
			+`  ${s_preview}\n`
			+`  ${s_border_btm}\n`
			+`\n  ${this._s_message}`;
	}
}

export class ContentSyntaxError extends ContentError {}
ContentSyntaxError.prototype.name = 'ContentSyntaxError';
ContentSyntaxError.prototype.description = 'A syntax error was found while reading input.';

export class UnexpectedTokenError extends ContentSyntaxError {
	constructor(gc_error) {
		super(gc_error);
		const s_char = this._s_source[this._i_caret];
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
