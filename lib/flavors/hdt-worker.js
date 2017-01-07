/* eslint-disable */

@ // import parser macros
@include '../main/linked.builder-js'

const fs = require('fs');
const bus = require('../main/bus');
console.log('hdt-worker spawned');

process.stdin.resume();
process.stdin.pipe(bus.incoming((a_dict, n_max_word_length) => {
	console.log('dict length: '+a_dict.length+'; max word: '+n_max_word_length);
	let n_words = a_dict.length;

	// prepare array/-buffer for dict and ref, respectively
	let a_flat_dict = [];
	let a_ref = [];
	let ab_lens = @{mk_uint_array('a_dict.length', 'n_max_word_length')}

	let i_read = 0;

	// apply front-coding
	let i_word = 0;
	while(i_word < n_words) {
		// position of block head
		a_ref.push(a_flat_dict.length);

		// encode first word fully
		let ab_word = a_dict[i_read++];
		let n_word = ab_word.length;
		for(let i_c=0; i_c<n_word; i_c++) {
			a_flat_dict.push(ab_word[i_c]);
		}

		// end of word
		a_flat_dict.push(1);

		// save word len
		ab_lens[i_word] = n_word;

		// consume next ${block_size - 1} entries
		let i_top = Math.min(n_words, i_word+16);
		while(++i_word < i_top) {
			// ref word to be coded
			let ab_code = a_dict[i_read++];

			// prep to count how many chars to share
			let c_shared = 0;

			// set upper limit of word comparison length
			let i_limit = Math.min(ab_code.length, ab_word.length);

			// search until there is a difference
			while(c_shared < i_limit) {
				if(ab_code[c_shared] !== ab_word[c_shared]) break;
				c_shared += 1;
			}

			// encode shared chars as vbyte
			a_flat_dict.push(c_shared & 0x7f);
			let x_remain = c_shared >> 7;
			while(x_remain) {
				a_flat_dict.push(x_remain & 0x7f);
				x_remain = x_remain >> 7;
			}
			a_flat_dict[a_flat_dict.length - 1] |= 0x80;

			// push remainder of string
			let n_code = ab_code.length;
			for(let i_c=c_shared; i_c<n_code; i_c++) {
				a_flat_dict.push(ab_code[i_c]);
			}

			// end of word
			a_flat_dict.push(1);

			// save word len
			ab_lens[i_word] = n_code;
		}
	}

	bus.outgoing().send(a_flat_dict, a_ref, ab_lens).pipe(fs.createWriteStream(null, {
		fd: 4,
	}));
}));

