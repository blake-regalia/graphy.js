
module.exports = dc_super => class bitsequence_plain extends dc_super {
	constructor(at_sequence) {
		super();

		let ab_contents = ArrayBuffer.isView(at_sequence)? at_sequence.buffer: at_sequence;
		if(!ATU8_POPCOUNTS_16) load_popcounts();

		Object.assign(this, {
			contents: ab_contents,
			view_u8: new Uint8Array(ab_contents),
			view_u16: new Uint16Array(ab_contents),
			view_u32: new Uint32Array(ab_contents),
			read: 0,
		});
	}

	select_1(i_item) {
		let {
			view_u8: atu8_view,
			view_u16: atu16_view,
		} = this;

		let c_pop = 0;
		let i16_scan = 0;
		for(;; i16_scan++) {
			let n_popcount = ATU8_POPCOUNTS_16[atu16_view[i16_scan]];
			c_pop += n_popcount;
			if(c_pop >= i_item) {
				c_pop -= n_popcount;
				break;
			}
		}

		let ib_target = i16_scan << 1;
		let xb_char = atu8_view[ib_target];
		let ii_bit = 0;
		for(; c_pop<i_item; ii_bit++) {
			if(xb_char & 0x80) c_pop += 1;
			xb_char <<= 1;

			if(7 === ii_bit) xb_char = atu8_view[ib_target+1];
		}

		return (i16_scan << 4) + ii_bit;
	}

	rank_1(ii_target) {
		let {
			view_u8: atu8_view,
			view_u16: atu16_view,
		} = this;

		let c_pop = 0;
		let i16_target = ii_target >> 4;
		for(let i16_scan=0; i16_scan<i16_target; i16_scan++) {
			c_pop += ATU8_POPCOUNTS_16[atu16_view[i16_scan]];
		}

		let ii_intra = ii_target % 16;
		let ib_target = i16_target << 1;
		let xb_char = atu8_view[ib_target];
		for(let ii_bit=0; ii_bit<ii_intra; ii_bit++) {
			if(xb_char & 0x80) c_pop += 1;
			xb_char <<= 1;

			if(7 === ii_bit) xb_char = atu8_view[ib_target+1];
		}

		return c_pop;
	}
};
