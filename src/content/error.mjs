const HM_PRIVATES = new Map();

export class ContentError extends Error {
	constructor(gc_error) {
		super();

		const {
			caret: i_caret,
			start: i_token_start=-1,
			end: i_token_end=-1,
		} = gc_error.token;

		// sets the max width of the preview
		const nl_width = Math.min(90, process?.stdout?.columns || 90);

		// 0.62 sets the relative bias to the front of the message
		const i_off = Math.min(i_caret, Math.abs(i_caret-Math.floor(nl_width*0.62)));

		// format preview
		const s_preview = gc_error.source.substr(i_off, nl_width).replace(/[\n\t]/g, ' ');

		// border strings
		const nl_pre = i_caret - i_off;
		let s_border_top= '';
		let s_border_btm = '';

		// token highlighting
		if(i_token_start >= 0) {
			const a_border_top = '┈'.repeat(nl_width).split('');
			const a_border_btm = [...a_border_top];

			const ir_token_start = i_token_start - i_off;
			const ir_caret = i_caret - i_off;
			const ir_token_end = i_token_end - i_off;

			if(ir_token_start >= 0) {
				a_border_top[ir_token_start] = '┍';
				a_border_btm[ir_token_start] = '┕';
			}

			if(ir_token_end < nl_width) {
				a_border_top[ir_token_end-1] = '┑';
				a_border_btm[ir_token_end-1] = '┙';
			}

			if(ir_token_start !== ir_token_end && (ir_token_start === ir_caret || ir_token_end === ir_caret)) {
				a_border_top[ir_caret] = '╇';
				a_border_btm[ir_caret] = '╈';
			}
			else {
				a_border_top[ir_caret] = '┻';
				a_border_btm[ir_caret] = '┳';
			}

			s_border_top = a_border_top.join('');
			s_border_btm = a_border_btm.join('');
		}
		// caret only
		else {
			s_border_top = '┈'.repeat(nl_pre);
			const s_post = '┈'.repeat(nl_width-nl_pre-1);
			s_border_btm = s_border_top+'┳'+s_post;
			s_border_top += '┻'+s_post;
		}

		const g_self = {
			s_instance: gc_error.content?._dc_actor?.name,
			s_message: gc_error.message,
			s_state: gc_error.state,
			s_source: gc_error.source,
			g_location: gc_error.location,
			i_caret,
			s_preview,
			s_border_top,
			s_border_btm,
		};

		HM_PRIVATES.set(this, g_self);
	}

	get name() {
		const {
			s_instance,
			s_name,
		} = HM_PRIVATES.get(this);

		const s_title = (s_name || this.constructor.name)+(s_instance? '<'+s_instance+'>': '');
		return `@graphy/content.${s_title}`;
	}

	get message() {
		const {
			g_location,
			s_border_top,
			s_preview,
			s_border_btm,
			s_message,
		} = HM_PRIVATES.get(this);

		return this.description+'\n'
			+(g_location? `  at { line: ${g_location.line}, col: ${g_location.col} }`: ' to see the line/col offset, remove or disable the `swift: true` option')+'\n'
			+`  ${s_border_top}\n`
			+`  ${s_preview}\n`
			+`  ${s_border_btm}\n`
			+`\n  ${s_message}`;
	}

	// get stack() {
	// 	return this.title+'::'+this.message;
	// }
}

export class ContentSyntaxError extends ContentError {}
ContentSyntaxError.prototype.description = 'Syntax error found while reading input.';

export class UnexpectedTokenError extends ContentSyntaxError {
	constructor(gc_error) {
		super(gc_error);
		const g_self = HM_PRIVATES.get(this);
		const s_char = g_self.s_source[g_self.i_caret];
		g_self.s_message = `Expected ${gc_error.state} ${gc_error.eofed? 'but encountered <<EOF>>': ''}. Failed to parse a valid token starting at ${s_char? '"'+s_char+'"': '<<EOF>>'}`;
	}
}

export class InvalidStateChangeError extends ContentError {}
InvalidStateChangeError.prototype.description = 'An invalid state change was detected.';

export class NoSuchPrefixError extends ContentError {
	constructor(gc_error) {
		super(gc_error);
		const g_self = HM_PRIVATES.get(this);
		g_self.s_message = `No such prefix '${gc_error.prefix}' was declared.`;
	}
}
NoSuchPrefixError.description = 'Missing prefix declaration.';

export class ExceededMaximumTokenLengthError extends ContentError {
	constructor(gc_error) {
		super(gc_error);
		const g_self = HM_PRIVATES.get(this);
		g_self.s_message = `The maximum token length is currently set to ${gc_error.mtl}. You can adjust this value in the parameters.`;
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
