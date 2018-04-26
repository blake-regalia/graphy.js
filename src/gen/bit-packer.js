
// unpack_9_32() {
// 	let x_00 = a[i+0x00];
// 	let x_01 = a[i+0x01];
// 	let x_02 = a[i+0x02];
// 	let x_03 = a[i+0x03];
// 	let x_04 = a[i+0x04];
// 	let x_05 = a[i+0x05];
// 	let x_06 = a[i+0x06];
// 	let x_07 = a[i+0x07];
// 	let x_08 = a[i+0x08];
// 	let x_09 = a[i+0x09];
// 	let x_0A = a[i+0x0a];

// 	a_o[i_write] = x_00 >>> 23;
// 	a_o[i_write+1] = (x_00 >>> 14) & 0x1ff;
// 	a_o[i_write+2] = (x_00 >>> 5) & 0x1ff;
// 	a_o[i_write+3] = ((x_00 & 0x1f) << 4) | (x_01 >>> 28);
// 	a_o[i_write+4] = (x_01 >>> 19) & 0x1ff;
// 	a_o[i_write+5] = (x_01 >>> 10) & 0x1ff;
// 	a_o[i_write+6] = (x_01 >>> 1) & 0xff;
// 	a_o[i_write+7] = ((x_01 & 0x01) << 8) | (x_02 >>> 24);
// 	a_o[i_write+8] = (x_01 >>> 16) & 0x1ff;
// 	a_o[i_write+9] = (x_01 >>> 7) & 0x1ff;
// 	a_o[i_write+10] = ((x_01 & 0x7f) << 2) & (x_02 >>> 30);
// 	a_o[i_write+11] = (x_02 >>> 21);
// 	a_o[i_write+12] = (x_02 >>> 12);
// 	a_o[i_write+13] = (x_02 >>> 3);
// }

console.log(`
const B_IS_LITTLE_ENDIAN = (() => {
	let at_16 = Uint16Array.from([0xface]);
	return (new Uint8Array(at_16.buffer, at_16.byteOffset, 2))[0] === 0xce;
})();

const uint16_array_to_buffer = B_IS_LITTLE_ENDIAN
	? (at, n) => Buffer.from(at.buffer, at.byteOffset, n)
	: (at, n) => Buffer.from(at.buffer, at.byteOffset, n).swap16();

const uint32_array_to_buffer = B_IS_LITTLE_ENDIAN
	? (at, n) => Buffer.from(at.buffer, at.byteOffset, n)
	: (at, n) => Buffer.from(at.buffer, at.byteOffset, n).swap32();

`);

// function pack_9_32(a_items) {
// 	let a_words = [];
// 	let n_bits_remain = 32;
// 	let n_items = a_items.length;

// 	let x = 0;
// 	let x_value = 0;
// 	let i_item = 0;
// 	while(i_item <= (n_items - 32)) {
// 		x = (a_items[i_item] << 23)
// 			| (a_items[i_item+1] << 14)
// 			| (a_items[i_item+2] << 5);
// 		x_value = a_items[i_item+3];
// 		a_words.push(x | (x_value >>> 4));
// 		x = ((x_value & 0x0f) << 28)
// 			| (a_items[i_item+4] << 19)
// 			| (a_items[i_item+5] << 10)
// 			| (a_items[i_item+6] << 1);
// 		x_value = a_items[i_item+7];
// 		a_words.push(x | (x_value >>> 8));
// 	}

// 	x = (a_items[i_item] << 23);
// }

const greatest_common_divisor = (x_a, x_b) => {
	while(x_a !== x_b) {
		if(x_a > x_b) x_a = x_a - x_b;
		else x_b = x_b - x_a;
	}
	return x_a;
};

const lowest_common_multiple = (x_a, x_b) => {
	return (x_a * x_b) / greatest_common_divisor(x_a, x_b);
};

function gen_pack(n_item_width, n_word_width) {
	let n_bits_remain = n_word_width;
	let c_read_byte = 0;
	let c_write_byte = 0;

	let x_lcm = lowest_common_multiple(n_item_width, n_word_width);
	let n_items_per_loop = x_lcm / n_item_width;
	let n_bytes_per_loop = x_lcm / n_word_width;
	let a_out = [`
		let n_items = a_items.length;
		let n_bytes = Math.ceil(${n_item_width} * n_items / 8);
		let at_output = new Uint${n_word_width}Array(Math.ceil(n_bytes / ${n_word_width / 8}));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for(; i_item <= (n_items - ${n_items_per_loop}); i_item+=${n_items_per_loop}, i_write+=${n_bytes_per_loop}) {
			x = (a_items[i_item] << ${n_word_width - n_item_width})`,
	];

	n_bits_remain -= n_item_width;
	for(; n_bits_remain !== 0; n_bits_remain-=n_item_width) {
		let n_shift = n_bits_remain - n_item_width;
		if(n_shift >= 0) {
			let s_item = `a_items[i_item+${++c_read_byte}]`;
			a_out.push('| '+
				(n_shift
					? `(${s_item} << ${n_shift})`
					: `${s_item};
						at_output[i_write+${c_write_byte++}] = x`));
		}
		else {
			let s_split_mask = '0x'+((1 << -n_shift) - 1).toString(16);
			a_out.push(`;
				x_value = a_items[i_item+${++c_read_byte}];
				at_output[i_write+${c_write_byte++}] = x | (x_value >>> ${-n_shift});
				x = ((x_value & ${s_split_mask}) << ${n_word_width + n_shift})`);
			n_bits_remain += n_word_width;
		}
	}
	a_out.push(';\n}');

	let s_push_and_return = `
		if(i_item === n_items) {
			at_output[i_write] = x;
			return uint${n_word_width}_array_to_buffer(at_output, n_bytes);
		}`;
	a_out.push(`
		if(i_item === n_items) return uint${n_word_width}_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << ${n_word_width - n_item_width};
		${s_push_and_return}`);
	c_read_byte = 0;
	n_bits_remain = n_word_width - n_item_width;
	for(; n_bits_remain !== 0; n_bits_remain-=n_item_width) {
		let n_shift = n_bits_remain - n_item_width;
		if(n_shift >= 0) {
			let s_item = `a_items[i_item++]`;
			a_out.push(`
				x |= `+(n_shift? `${s_item} << ${n_shift};`: s_item))+';';
		}
		else {
			let s_split_mask = '0x'+((1 << -n_shift) - 1).toString(16);
			a_out.push(`
				x_value = a_items[i_item++];
				at_output[i_write++] = x | (x_value >>> ${-n_shift});
				x = ((x_value & ${s_split_mask}) << ${n_word_width + n_shift});`);
			n_bits_remain += n_word_width;
		}
		a_out.push(s_push_and_return);
	}

	return `pack_${n_item_width}_${n_word_width}(a_items) { ${a_out.join('')} },`;
}

function gen_unpack(n_item_width, n_word_width) {
	let n_word_power = n_word_width / 16;
	let n_bytes_per_word = n_word_width / 8;
	let n_bits_remain = n_word_width;
	let c_write_offset = 0;
	let c_read_byte = 0;

	let s_mask = '0x'+(((1 << n_item_width) >>> 0) - 1).toString(16);

	let n_min_item_bit_width = n_item_width <= 16? (n_item_width <= 8? 8: 16): 32;
	let x_lcm = lowest_common_multiple(n_item_width, n_word_width);
	let n_words_per_loop = x_lcm / n_word_width;
	let n_items_per_loop = x_lcm / n_item_width;
	let a_out = [`
		let at_output = new Uint${n_min_item_bit_width}Array(n_items);
		if(!B_IS_LITTLE_ENDIAN) ab_input.swap${n_word_width}();
		let i_byte_offset = Math.ceil(n_items * ${n_item_width} / 8) + i_read;
		let nl_input = Math.ceil((n_items * ${n_item_width}) / ${n_word_width});
		let at_input = new Uint${n_word_width}Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for(; i_write<=(n_items - ${n_items_per_loop}); i_read+=${n_words_per_loop}, i_write+=${n_items_per_loop}) {
			let x_left = at_input[i_read], x_right = 0;
			at_output[i_write] = x_left >>> ${n_bits_remain - n_item_width};
		`,
	];
	n_bits_remain -= n_item_width;

	//
	for(; n_bits_remain !== 0; n_bits_remain-=n_item_width) {
		let b_swap = false;
		let n_shift = n_bits_remain - n_item_width;
		let s_operation = '';
		if(n_shift >= 0) {
			s_operation = (n_shift? `(x_left >>> ${n_shift})`: 'x_left')+` & ${s_mask}`;
		}
		else {
			let s_which = (++c_read_byte).toString(16);
			let s_split_mask = '0x'+((1 << (n_item_width + n_shift)) - 1).toString(16);
			a_out.push(`x_right = at_input[i_read+${c_read_byte}];`);
			s_operation = `((x_left & ${s_split_mask}) << ${-n_shift}) | (x_right >>> ${n_word_width + n_shift})`;
			n_bits_remain += n_word_width;
			b_swap = true;
		}

		a_out.push(`at_output[i_write+${++c_write_offset}] = ${s_operation};`);
		if(b_swap) {
			a_out.push(`x_left = x_right;`);
		}
	}
	a_out.push(`\n}
		if(i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++], x_right = 0;`);


	let s_check_and_return = `if(i_write === n_items) return [at_output, i_byte_offset];`;
	n_bits_remain = n_word_width;
	for(; n_bits_remain !== n_item_width; n_bits_remain-=n_item_width) {
		let b_swap = false;
		let n_shift = n_bits_remain - n_item_width;
		let s_operation = '';
		if(n_shift >= 0) {
			s_operation = (n_shift? `(x_left >>> ${n_shift})`: 'x_left')+` & ${s_mask}`;
		}
		else {
			let s_which = (++c_read_byte).toString(16);
			let s_split_mask = '0x'+((1 << (n_item_width + n_shift)) - 1).toString(16);
			a_out.push(`x_right = at_input[i_read++];`);
			s_operation = `((x_left & ${s_split_mask}) << ${-n_shift}) | (x_right >>> ${n_word_width + n_shift})`;
			n_bits_remain += n_word_width;
			b_swap = true;
		}

		a_out.push(`at_output[i_write++] = ${s_operation};`);
		if(b_swap) {
			a_out.push(`x_left = x_right;`);
		}
		if((n_bits_remain - n_item_width) !== n_item_width) a_out.push(s_check_and_return);
	}
	a_out.push(`return [at_output, i_byte_offset];`);

	return `unpack_${n_item_width}_${n_word_width}(ab_input, i_read, n_items) { ${a_out.join('\n\t')} },`;
}


console.log('const H_PACKERS = {');
for(let i=2; i<16; i++) {
	console.log(gen_pack(i, 16));
}
for(let i=2; i<16; i++) {
	console.log(gen_unpack(i, 16));
}
for(let i=2; i<32; i++) {
	console.log(gen_pack(i, 32));
}
for(let i=2; i<32; i++) {
	console.log(gen_unpack(i, 32));
}
console.log('};');

console.log(`
	module.exports = {
		pack(a_items, n_item_width, n_word_width) {
			return H_PACKERS['pack_'+n_item_width+'_'+n_word_width](a_items);
		},
		unpack(ab_input, i_read, n_items, n_item_width, n_word_width) {
			return H_PACKERS['unpack_'+n_item_width+'_'+n_word_width](ab_input, i_read, n_items);
		},
	};
`);