const bus = require('./bus.js');

// lookup table for 1 byte popcounts
const A_POPCOUNTS = [
	0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5,
	1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
	1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
	2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
	1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6,
	2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
	2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7,
	3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8,
];

function popcount_32(x) {
	return A_POPCOUNTS[x & 0xff]
		+ A_POPCOUNTS[(x >> 8) & 0xff]
		+ A_POPCOUNTS[(x >> 16) & 0xff]
		+ A_POPCOUNTS[x >>> 24];
}

class bitsequence_reader {

	constructor(at_payload) {
		let kbd_payload = new bus.buffer_decoder(at_payload);

		let n_bits = kbd_payload.vuint();

		let at_words = new Uint32Array(kbd_payload.buffer(4));

		let n_blocks = Math.ceil(Math.ceil(n_bits / 8) / 4);
		let at_blocks = new Uint32Array(n_blocks);

		let n_blocks_per_super = 8;
		let n_supers = Math.ceil(at_blocks.length / n_blocks_per_super);
		let at_supers = bus.new_uint_array(n_bits, n_supers);

		Object.assign(this, {
			bit_count: n_bits,
			words_per_block: 8,
			blocks_per_super: 8,

			blocks: at_blocks,
			supers: at_supers,
		});
	}

	index() {
		let {
			bit_count: n_bits,
			blocks_per_super: n_blocks_per_super,
			words: at_words,
			blocks: at_blocks,
			supers: at_supers,
		} = this;

		let c_popcount = 0;
		let i_super = 0;

		for(let i_block=0, n_blocks=at_blocks.length; i_block<n_blocks; i_block++) {
			if(0 === n_blocks_per_super % i_block) {
				at_supers[i_super++] = c_popcount;
			}

			at_blocks[i_block] = c_popcount;
			c_popcount += popcount_32(at_blocks[i_block]);
		}
	}

	rank_1(i_pos) {
		let {

		} = this;

		let i_block = i_pos >>> 4;
		let i_super = i_block >>> n_blocks_per_super_k;


		popcount_32();
	}
}


