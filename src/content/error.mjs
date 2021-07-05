import supportsColor from 'supports-color';
import styles from 'ansi-styles';

const HM_PRIVATES = new Map();

const B_COLOR = supportsColor.stdout;
const S_PREVIEW_TAB = B_COLOR? styles.dim.open+'→'+styles.dim.close: '→';
const S_PREVIEW_NEWLINE = B_COLOR? styles.dim.open+'↵'+styles.dim.close: '↵';

const inject_color = B_COLOR
	? (s, i) => s.slice(0, i)+styles.bold.open+s[i]+styles.bold.close+s.slice(i+1)
	: s => s;

export class ContentError extends Error {
	constructor(k_consumer, gc_error) {
		super();

		const s_source = k_consumer.s;

		const {
			caret: i_caret=k_consumer.i,
			start: i_token_start=-1,
			end: i_token_end=-1,
		} = gc_error.token;

		// sets the max width of the preview
		const nl_width = Math.min(90, process?.stdout?.columns || 90);

		// 0.62 sets the relative bias to the front of the message
		const i_off = Math.min(i_caret, Math.abs(i_caret-Math.floor(nl_width*0.62)));

		// format preview
		const s_preview = inject_color(s_source.substr(i_off, nl_width), i_caret-i_off)
			.replace(/\t/g, S_PREVIEW_TAB).replace(/\r?\n/g, S_PREVIEW_NEWLINE);  // ␉␤

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
			s_instance: k_consumer?._dc_actor?.name,
			s_message: gc_error.message,
			s_state: gc_error.state,
			s_source: s_source,
			g_location: gc_error.location || k_consumer?._b_line_tracking
				? {
					line: 1 + k_consumer._c_lines + count_lines_until(s_source, i_caret),
					col: i_caret - s_source.lastIndexOf('\n', i_caret),
				}
				: null,
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
			+(g_location? `  at { line: ${g_location.line}, col: ${g_location.col} }`: ' to see the line/col offset, remove or disable the `swift: true` option')+'\n\n'
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
	constructor(k_consumer, gc_error) {
		super(k_consumer, gc_error);
		const g_self = HM_PRIVATES.get(this);
		const s_char = g_self.s_source[g_self.i_caret];
		g_self.s_message = `Expected ${gc_error.state} ${gc_error.eofed? 'but encountered <<EOF>>': gc_error.but || ''}. Failed to parse a valid token starting at ${s_char? '"'+s_char+'"': '<<EOF>>'}`;
	}
}

export class InvalidStateChangeError extends ContentError {}
InvalidStateChangeError.prototype.description = 'An invalid state change was detected.';

export class NoSuchPrefixError extends ContentError {
	constructor(k_consumer, gc_error) {
		super(k_consumer, gc_error);
		const g_self = HM_PRIVATES.get(this);
		g_self.s_message = `No such prefix '${gc_error.prefix}' was declared.`;
	}
}
NoSuchPrefixError.description = 'Missing prefix declaration.';

export class ExceededMaximumTokenLengthError extends ContentError {
	constructor(k_consumer, gc_error) {
		super(k_consumer, gc_error);
		const g_self = HM_PRIVATES.get(this);
		g_self.s_message = `The maximum token length is currently set to ${gc_error.mtl}. You can adjust this value in the parameters.`;
	}
}
ExceededMaximumTokenLengthError.prototype.description = 'Exceeded maximum token length while reading input.';

export class EmptyCollectionError extends ContentError {
	constructor(k_consumer, gc_error) {
		super(k_consumer, gc_error);
		const g_self = HM_PRIVATES.get(this);
		g_self.s_message = '';
	}
}
EmptyCollectionError.prototype.description = 'Empty collection cannot exist in subject position.';

export class ContextualError extends Error {
	constructor(g_context) {
		super();
		this._g_context = g_context;
	}
}

/*

@graphy/content.SyntaxError<TurtleReader> : Turtle syntax error while reading input.
  at { line: 816, col: 15 }

  "; geophysical/border: <https://
                ^

  Not allowed to make thing here.
*/
