const D_TEXT_ENCODER = new TextEncoder();

class split_tracker {
	constructor(a_targets, fk_reached) {
		Object.assign(this, {
			targets: a_targets,
			reached: fk_reached,
			consumed: 0,
			fragment: 0,
			terminals: [],
			expecting: [],
			last_diff: Infinity,
			last_terminal: null,
			offset: 0,
			no_multibytes: true,
			split_start: 0,
			state: null,
		});
	}

	eos(s_fragment) {
		// there are targets in this fragment
		if(this.expecting.length) {
			// encountered terminals
			if(this.terminals.length) {
				let n_consumed = this.consumed;
				let i_offset = this.offset;

				// don't check same terminal twice
				let i_terminal = 0;
				let a_terminals = this.terminals;
				let nl_terminals = a_terminals.length;

				// each target
				let a_expecting = this.expecting;
				let nl_expecting = a_expecting.length;
				targets:
				while(a_expecting.length) {
					// align it to terminal range
					let x_relative = a_expecting.shift() - n_consumed;

					// scan terminals
					let x_best_diff = Infinity;
					let x_previous_terminal = -1;
					for(; i_terminal<nl_terminals; i_terminal++) {
						let x_terminal = a_terminals[i_terminal] - i_offset;

						// // can only compute byte lengths within this fragment
						// if(x_terminal < i_offset) continue;

						// previous diff was closest
						let x_diff = Math.abs(x_relative - x_terminal);
						if(x_diff > x_best_diff) {
							// if(x_best_diff > this.last_diff) {
							// 	this.yield_terminal(this.last_terminal);
							// }
							// else {
							// 	this.yield_terminal(n_consumed + x_previous_terminal - i_offset);
							// }

							this.yield_terminal(x_previous_terminal, s_fragment);

							// next target
							continue targets;
						}
						// this diff is closer to target
						else {
							x_best_diff = x_diff;
							x_previous_terminal = x_terminal;
						}
					}

					// use best
					this.yield_terminal(x_previous_terminal, s_fragment);

					// // didn't settle on best diff; but no way that next chunk can be closer
					// if((x_relative - x_previous_terminal) < 0) {
					// 	this.yield_terminal(n_consumed + x_previous_terminal - i_offset);
					// }
					// // save
					// else {
					// 	this.last_diff = x_best_diff;
					// 	this.last_terminal = n_consumed + x_previous_terminal - i_offset;
					// }
				}

				// clear terminals
				this.terminals.length = 0;
			}
			// didn't encounter any terminals
			else {
				debugger;
			}
		}
		// find best matches to target

		// // no multibyte characters this fragment
		// if(this.no_multibytes) {

		// }

		// update consumed length
		this.consumed += this.fragment;
		this.fragment = 0;
	}

	eof() {
		this.reached({
			byte_start: this.split_start,
			byte_end: -1,
			state: this.state,
		});
	}

	yield_terminal(i_fragment) {
		// debugger;

		let i_split_end = this.consumed;

		// no need to decode
		if(this.no_multibytes) {
			i_split_end += i_fragment;
		}
		// need to decode
		else {
			let s_chunk = this.chunk;
			let nl_fragment_h = s_chunk.length / 2;

			// roughly closer to left edge
			if(i_fragment < nl_fragment_h) {
				// translate to byte offset
				let s_sub = s_chunk.substring(0, i_fragment);
				let i_split = D_TEXT_ENCODER.encode(s_sub).length;
				i_split_end += i_split;
			}
			// roughly closer to right edge
			else {
				let s_sub = s_chunk.substr(i_fragment);
				let i_split = D_TEXT_ENCODER.encode(s_sub).length;
				i_split_end += this.fragment - i_split;
			}
		}

		this.reached({
			byte_start: this.split_start,
			byte_end: i_split_end,
			state: this.state,
		});
		this.split_start = i_split_end;
	}

	upcoming(s_chunk, at_chunk, n_offset, h_state) {
		// debugger;
		this.chunk = s_chunk;
		this.state = h_state;

		let n_chars = s_chunk.length;
		let n_bytes = at_chunk.length;

		let a_targets = this.targets;
		let n_consumed = this.consumed;
		let a_expecting = this.expecting;

		// same lengths means no multibye characters!
		this.no_multibytes = (n_bytes === n_chars);

		// update character offset
		this.offset = n_offset;

		let n_preview = n_consumed + n_bytes;
		let c_targets_surpassed = 0;
		let nl_targets = a_targets.length;
		for(let i_target=0; i_target<nl_targets; i_target++) {
			let x_target = a_targets[i_target];

			// this fragment is going to surpass a target
			if(n_preview > x_target) {
				a_expecting.push(x_target);
				c_targets_surpassed += 1;
			}
		}

		// at least one target will be surpassed
		if(c_targets_surpassed) {
			// update targets
			a_targets.splice(0, c_targets_surpassed);
		}

		// save fragment length
		this.fragment = n_bytes;
	}

	terminal(i_character) {
		// // need to track every terminal in this chunk
		// if(this.offset) {
		// 	let s = this.chunk;
		// 	debugger;
		// }

		if(this.expecting.length) {
			// console.info('substr[@'+this.terminals.length+'/'+i_character+'-'+this.offset+'='+(i_character-this.offset)+': '+this.chunk.substr(i_character - this.offset - 10, 12));
			this.terminals.push(i_character);
		}
		// // not currently tracking, only store the last terminal
		// else {
		// 	this.last_terminal = this.consumed + i_character - this.offset;
		// }
	}
}

module.exports = split_tracker;
