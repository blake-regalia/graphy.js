const B_IS_LITTLE_ENDIAN = (() => {
	let at_16 = Uint16Array.from([0xface]);
	return (new Uint8Array(at_16.buffer, at_16.byteOffset, 2))[0] === 0xce;
})();

const uint16_array_to_buffer = B_IS_LITTLE_ENDIAN ?
	(at, n) => Buffer.from(at.buffer, at.byteOffset, n) :
	(at, n) => Buffer.from(at.buffer, at.byteOffset, n).swap16();

const uint32_array_to_buffer = B_IS_LITTLE_ENDIAN ?
	(at, n) => Buffer.from(at.buffer, at.byteOffset, n) :
	(at, n) => Buffer.from(at.buffer, at.byteOffset, n).swap32();


const H_PACKERS = {
	pack_2_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(2 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 8); i_item += 8, i_write += 1) {
			x = (a_items[i_item] << 14) | (a_items[i_item + 1] << 12) | (a_items[i_item + 2] << 10) | (a_items[i_item + 3] << 8) | (a_items[i_item + 4] << 6) | (a_items[i_item + 5] << 4) | (a_items[i_item + 6] << 2) | a_items[i_item + 7];
			at_output[i_write + 0] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 14;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_3_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(3 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 3) {
			x = (a_items[i_item] << 13) | (a_items[i_item + 1] << 10) | (a_items[i_item + 2] << 7) | (a_items[i_item + 3] << 4) | (a_items[i_item + 4] << 1);
			x_value = a_items[i_item + 5];
			at_output[i_write + 0] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14) | (a_items[i_item + 6] << 11) | (a_items[i_item + 7] << 8) | (a_items[i_item + 8] << 5) | (a_items[i_item + 9] << 2);
			x_value = a_items[i_item + 10];
			at_output[i_write + 1] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 15) | (a_items[i_item + 11] << 12) | (a_items[i_item + 12] << 9) | (a_items[i_item + 13] << 6) | (a_items[i_item + 14] << 3) | a_items[i_item + 15];
			at_output[i_write + 2] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 13;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_4_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(4 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 4); i_item += 4, i_write += 1) {
			x = (a_items[i_item] << 12) | (a_items[i_item + 1] << 8) | (a_items[i_item + 2] << 4) | a_items[i_item + 3];
			at_output[i_write + 0] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 12;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_5_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(5 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 5) {
			x = (a_items[i_item] << 11) | (a_items[i_item + 1] << 6) | (a_items[i_item + 2] << 1);
			x_value = a_items[i_item + 3];
			at_output[i_write + 0] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12) | (a_items[i_item + 4] << 7) | (a_items[i_item + 5] << 2);
			x_value = a_items[i_item + 6];
			at_output[i_write + 1] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 13) | (a_items[i_item + 7] << 8) | (a_items[i_item + 8] << 3);
			x_value = a_items[i_item + 9];
			at_output[i_write + 2] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14) | (a_items[i_item + 10] << 9) | (a_items[i_item + 11] << 4);
			x_value = a_items[i_item + 12];
			at_output[i_write + 3] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 15) | (a_items[i_item + 13] << 10) | (a_items[i_item + 14] << 5) | a_items[i_item + 15];
			at_output[i_write + 4] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 11;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_6_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(6 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 8); i_item += 8, i_write += 3) {
			x = (a_items[i_item] << 10) | (a_items[i_item + 1] << 4);
			x_value = a_items[i_item + 2];
			at_output[i_write + 0] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14) | (a_items[i_item + 3] << 8) | (a_items[i_item + 4] << 2);
			x_value = a_items[i_item + 5];
			at_output[i_write + 1] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12) | (a_items[i_item + 6] << 6) | a_items[i_item + 7];
			at_output[i_write + 2] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 10;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_7_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(7 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 7) {
			x = (a_items[i_item] << 9) | (a_items[i_item + 1] << 2);
			x_value = a_items[i_item + 2];
			at_output[i_write + 0] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 11) | (a_items[i_item + 3] << 4);
			x_value = a_items[i_item + 4];
			at_output[i_write + 1] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 13) | (a_items[i_item + 5] << 6);
			x_value = a_items[i_item + 6];
			at_output[i_write + 2] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 15) | (a_items[i_item + 7] << 8) | (a_items[i_item + 8] << 1);
			x_value = a_items[i_item + 9];
			at_output[i_write + 3] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 10) | (a_items[i_item + 10] << 3);
			x_value = a_items[i_item + 11];
			at_output[i_write + 4] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12) | (a_items[i_item + 12] << 5);
			x_value = a_items[i_item + 13];
			at_output[i_write + 5] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14) | (a_items[i_item + 14] << 7) | a_items[i_item + 15];
			at_output[i_write + 6] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 9;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_8_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(8 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 2); i_item += 2, i_write += 1) {
			x = (a_items[i_item] << 8) | a_items[i_item + 1];
			at_output[i_write + 0] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 8;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_9_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(9 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 9) {
			x = (a_items[i_item] << 7);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14) | (a_items[i_item + 2] << 5);
			x_value = a_items[i_item + 3];
			at_output[i_write + 1] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12) | (a_items[i_item + 4] << 3);
			x_value = a_items[i_item + 5];
			at_output[i_write + 2] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 10) | (a_items[i_item + 6] << 1);
			x_value = a_items[i_item + 7];
			at_output[i_write + 3] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 4] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 15) | (a_items[i_item + 9] << 6);
			x_value = a_items[i_item + 10];
			at_output[i_write + 5] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 13) | (a_items[i_item + 11] << 4);
			x_value = a_items[i_item + 12];
			at_output[i_write + 6] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 11) | (a_items[i_item + 13] << 2);
			x_value = a_items[i_item + 14];
			at_output[i_write + 7] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 9) | a_items[i_item + 15];
			at_output[i_write + 8] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 7;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 9);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_10_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(10 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 8); i_item += 8, i_write += 5) {
			x = (a_items[i_item] << 6);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12) | (a_items[i_item + 2] << 2);
			x_value = a_items[i_item + 3];
			at_output[i_write + 1] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 8);
			x_value = a_items[i_item + 4];
			at_output[i_write + 2] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14) | (a_items[i_item + 5] << 4);
			x_value = a_items[i_item + 6];
			at_output[i_write + 3] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 10) | a_items[i_item + 7];
			at_output[i_write + 4] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 6;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_11_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(11 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 11) {
			x = (a_items[i_item] << 5);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 10);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 15) | (a_items[i_item + 3] << 4);
			x_value = a_items[i_item + 4];
			at_output[i_write + 2] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 9);
			x_value = a_items[i_item + 5];
			at_output[i_write + 3] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14) | (a_items[i_item + 6] << 3);
			x_value = a_items[i_item + 7];
			at_output[i_write + 4] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 5] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 13) | (a_items[i_item + 9] << 2);
			x_value = a_items[i_item + 10];
			at_output[i_write + 6] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 7);
			x_value = a_items[i_item + 11];
			at_output[i_write + 7] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12) | (a_items[i_item + 12] << 1);
			x_value = a_items[i_item + 13];
			at_output[i_write + 8] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 6);
			x_value = a_items[i_item + 14];
			at_output[i_write + 9] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 11) | a_items[i_item + 15];
			at_output[i_write + 10] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 5;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 9);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 7);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 6);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_12_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(12 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 4); i_item += 4, i_write += 3) {
			x = (a_items[i_item] << 4);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 8);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12) | a_items[i_item + 3];
			at_output[i_write + 2] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 4;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_13_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(13 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 13) {
			x = (a_items[i_item] << 3);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 6);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 9);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12);
			x_value = a_items[i_item + 4];
			at_output[i_write + 3] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 15) | (a_items[i_item + 5] << 2);
			x_value = a_items[i_item + 6];
			at_output[i_write + 4] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 5);
			x_value = a_items[i_item + 7];
			at_output[i_write + 5] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 6] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 11);
			x_value = a_items[i_item + 9];
			at_output[i_write + 7] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14) | (a_items[i_item + 10] << 1);
			x_value = a_items[i_item + 11];
			at_output[i_write + 8] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 4);
			x_value = a_items[i_item + 12];
			at_output[i_write + 9] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 7);
			x_value = a_items[i_item + 13];
			at_output[i_write + 10] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 10);
			x_value = a_items[i_item + 14];
			at_output[i_write + 11] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 13) | a_items[i_item + 15];
			at_output[i_write + 12] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 3;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 6);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 9);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 5);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 4);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 7);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_14_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(14 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 8); i_item += 8, i_write += 7) {
			x = (a_items[i_item] << 2);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 4);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 6);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 8);
			x_value = a_items[i_item + 4];
			at_output[i_write + 3] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 10);
			x_value = a_items[i_item + 5];
			at_output[i_write + 4] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12);
			x_value = a_items[i_item + 6];
			at_output[i_write + 5] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14) | a_items[i_item + 7];
			at_output[i_write + 6] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 2;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 4);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 6);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_15_16(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(15 * n_items / 8);
		let at_output = new Uint16Array(Math.ceil(n_bytes / 2));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 15) {
			x = (a_items[i_item] << 1);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 2);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 3);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 4);
			x_value = a_items[i_item + 4];
			at_output[i_write + 3] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 5);
			x_value = a_items[i_item + 5];
			at_output[i_write + 4] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 6);
			x_value = a_items[i_item + 6];
			at_output[i_write + 5] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 7);
			x_value = a_items[i_item + 7];
			at_output[i_write + 6] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 7] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 9);
			x_value = a_items[i_item + 9];
			at_output[i_write + 8] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 10);
			x_value = a_items[i_item + 10];
			at_output[i_write + 9] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 11);
			x_value = a_items[i_item + 11];
			at_output[i_write + 10] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 12);
			x_value = a_items[i_item + 12];
			at_output[i_write + 11] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 13);
			x_value = a_items[i_item + 13];
			at_output[i_write + 12] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 14);
			x_value = a_items[i_item + 14];
			at_output[i_write + 13] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 15) | a_items[i_item + 15];
			at_output[i_write + 14] = x;
		}
		if (i_item === n_items) return uint16_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 1;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 2);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 3);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 4);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 5);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 6);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 7);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 9);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint16_array_to_buffer(at_output, n_bytes);
		}
	},
	unpack_2_16(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 2 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 2) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 8); i_read += 1, i_write += 8) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 14;

			at_output[i_write + 1] = (x_left >>> 12) & 0x3;
			at_output[i_write + 2] = (x_left >>> 10) & 0x3;
			at_output[i_write + 3] = (x_left >>> 8) & 0x3;
			at_output[i_write + 4] = (x_left >>> 6) & 0x3;
			at_output[i_write + 5] = (x_left >>> 4) & 0x3;
			at_output[i_write + 6] = (x_left >>> 2) & 0x3;
			at_output[i_write + 7] = x_left & 0x3;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 14) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3;
		return [at_output, i_byte_offset];
	},
	unpack_3_16(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 3 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 3) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 3, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 13;

			at_output[i_write + 1] = (x_left >>> 10) & 0x7;
			at_output[i_write + 2] = (x_left >>> 7) & 0x7;
			at_output[i_write + 3] = (x_left >>> 4) & 0x7;
			at_output[i_write + 4] = (x_left >>> 1) & 0x7;
			x_right = at_input[i_read + 1];
			at_output[i_write + 5] = ((x_left & 0x1) << 2) | (x_right >>> 14);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 11) & 0x7;
			at_output[i_write + 7] = (x_left >>> 8) & 0x7;
			at_output[i_write + 8] = (x_left >>> 5) & 0x7;
			at_output[i_write + 9] = (x_left >>> 2) & 0x7;
			x_right = at_input[i_read + 2];
			at_output[i_write + 10] = ((x_left & 0x3) << 1) | (x_right >>> 15);
			x_left = x_right;
			at_output[i_write + 11] = (x_left >>> 12) & 0x7;
			at_output[i_write + 12] = (x_left >>> 9) & 0x7;
			at_output[i_write + 13] = (x_left >>> 6) & 0x7;
			at_output[i_write + 14] = (x_left >>> 3) & 0x7;
			at_output[i_write + 15] = x_left & 0x7;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 13) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 2) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 1) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7;
		return [at_output, i_byte_offset];
	},
	unpack_4_16(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 4 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 4) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 4); i_read += 1, i_write += 4) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 12;

			at_output[i_write + 1] = (x_left >>> 8) & 0xf;
			at_output[i_write + 2] = (x_left >>> 4) & 0xf;
			at_output[i_write + 3] = x_left & 0xf;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 12) & 0xf;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0xf;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0xf;
		return [at_output, i_byte_offset];
	},
	unpack_5_16(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 5 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 5) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 5, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 11;

			at_output[i_write + 1] = (x_left >>> 6) & 0x1f;
			at_output[i_write + 2] = (x_left >>> 1) & 0x1f;
			x_right = at_input[i_read + 1];
			at_output[i_write + 3] = ((x_left & 0x1) << 4) | (x_right >>> 12);
			x_left = x_right;
			at_output[i_write + 4] = (x_left >>> 7) & 0x1f;
			at_output[i_write + 5] = (x_left >>> 2) & 0x1f;
			x_right = at_input[i_read + 2];
			at_output[i_write + 6] = ((x_left & 0x3) << 3) | (x_right >>> 13);
			x_left = x_right;
			at_output[i_write + 7] = (x_left >>> 8) & 0x1f;
			at_output[i_write + 8] = (x_left >>> 3) & 0x1f;
			x_right = at_input[i_read + 3];
			at_output[i_write + 9] = ((x_left & 0x7) << 2) | (x_right >>> 14);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 9) & 0x1f;
			at_output[i_write + 11] = (x_left >>> 4) & 0x1f;
			x_right = at_input[i_read + 4];
			at_output[i_write + 12] = ((x_left & 0xf) << 1) | (x_right >>> 15);
			x_left = x_right;
			at_output[i_write + 13] = (x_left >>> 10) & 0x1f;
			at_output[i_write + 14] = (x_left >>> 5) & 0x1f;
			at_output[i_write + 15] = x_left & 0x1f;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 11) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 4) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 3) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 2) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 1) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x1f;
		return [at_output, i_byte_offset];
	},
	unpack_6_16(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 6 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 6) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 8); i_read += 3, i_write += 8) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 10;

			at_output[i_write + 1] = (x_left >>> 4) & 0x3f;
			x_right = at_input[i_read + 1];
			at_output[i_write + 2] = ((x_left & 0xf) << 2) | (x_right >>> 14);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 8) & 0x3f;
			at_output[i_write + 4] = (x_left >>> 2) & 0x3f;
			x_right = at_input[i_read + 2];
			at_output[i_write + 5] = ((x_left & 0x3) << 4) | (x_right >>> 12);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 6) & 0x3f;
			at_output[i_write + 7] = x_left & 0x3f;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 10) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 2) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 4) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x3f;
		return [at_output, i_byte_offset];
	},
	unpack_7_16(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 7 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 7) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 7, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 9;

			at_output[i_write + 1] = (x_left >>> 2) & 0x7f;
			x_right = at_input[i_read + 1];
			at_output[i_write + 2] = ((x_left & 0x3) << 5) | (x_right >>> 11);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 4) & 0x7f;
			x_right = at_input[i_read + 2];
			at_output[i_write + 4] = ((x_left & 0xf) << 3) | (x_right >>> 13);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 6) & 0x7f;
			x_right = at_input[i_read + 3];
			at_output[i_write + 6] = ((x_left & 0x3f) << 1) | (x_right >>> 15);
			x_left = x_right;
			at_output[i_write + 7] = (x_left >>> 8) & 0x7f;
			at_output[i_write + 8] = (x_left >>> 1) & 0x7f;
			x_right = at_input[i_read + 4];
			at_output[i_write + 9] = ((x_left & 0x1) << 6) | (x_right >>> 10);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 3) & 0x7f;
			x_right = at_input[i_read + 5];
			at_output[i_write + 11] = ((x_left & 0x7) << 4) | (x_right >>> 12);
			x_left = x_right;
			at_output[i_write + 12] = (x_left >>> 5) & 0x7f;
			x_right = at_input[i_read + 6];
			at_output[i_write + 13] = ((x_left & 0x1f) << 2) | (x_right >>> 14);
			x_left = x_right;
			at_output[i_write + 14] = (x_left >>> 7) & 0x7f;
			at_output[i_write + 15] = x_left & 0x7f;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 9) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 5) | (x_right >>> 11);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 3) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 1) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 6) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 4) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 2) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x7f;
		return [at_output, i_byte_offset];
	},
	unpack_8_16(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 8 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 8) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 2); i_read += 1, i_write += 2) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 8;

			at_output[i_write + 1] = x_left & 0xff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 8) & 0xff;
		return [at_output, i_byte_offset];
	},
	unpack_9_16(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 9 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 9) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 9, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 7;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x7f) << 2) | (x_right >>> 14);
			x_left = x_right;
			at_output[i_write + 2] = (x_left >>> 5) & 0x1ff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 3] = ((x_left & 0x1f) << 4) | (x_right >>> 12);
			x_left = x_right;
			at_output[i_write + 4] = (x_left >>> 3) & 0x1ff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 5] = ((x_left & 0x7) << 6) | (x_right >>> 10);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 1) & 0x1ff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 7] = ((x_left & 0x1) << 8) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 8] = ((x_left & 0xff) << 1) | (x_right >>> 15);
			x_left = x_right;
			at_output[i_write + 9] = (x_left >>> 6) & 0x1ff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 10] = ((x_left & 0x3f) << 3) | (x_right >>> 13);
			x_left = x_right;
			at_output[i_write + 11] = (x_left >>> 4) & 0x1ff;
			x_right = at_input[i_read + 7];
			at_output[i_write + 12] = ((x_left & 0xf) << 5) | (x_right >>> 11);
			x_left = x_right;
			at_output[i_write + 13] = (x_left >>> 2) & 0x1ff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 14] = ((x_left & 0x3) << 7) | (x_right >>> 9);
			x_left = x_right;
			at_output[i_write + 15] = x_left & 0x1ff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 7) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 2) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 4) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 6) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 8) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 1) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 3) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 5) | (x_right >>> 11);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 7) | (x_right >>> 9);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_10_16(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 10 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 10) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 8); i_read += 5, i_write += 8) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 6;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x3f) << 4) | (x_right >>> 12);
			x_left = x_right;
			at_output[i_write + 2] = (x_left >>> 2) & 0x3ff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 3] = ((x_left & 0x3) << 8) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 4] = ((x_left & 0xff) << 2) | (x_right >>> 14);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 4) & 0x3ff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 6] = ((x_left & 0xf) << 6) | (x_right >>> 10);
			x_left = x_right;
			at_output[i_write + 7] = x_left & 0x3ff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 6) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 4) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 8) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 2) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 6) | (x_right >>> 10);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_11_16(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 11 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 11) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 11, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 5;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x1f) << 6) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0x3ff) << 1) | (x_right >>> 15);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 4) & 0x7ff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 4] = ((x_left & 0xf) << 7) | (x_right >>> 9);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 5] = ((x_left & 0x1ff) << 2) | (x_right >>> 14);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 3) & 0x7ff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 7] = ((x_left & 0x7) << 8) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 8] = ((x_left & 0xff) << 3) | (x_right >>> 13);
			x_left = x_right;
			at_output[i_write + 9] = (x_left >>> 2) & 0x7ff;
			x_right = at_input[i_read + 7];
			at_output[i_write + 10] = ((x_left & 0x3) << 9) | (x_right >>> 7);
			x_left = x_right;
			x_right = at_input[i_read + 8];
			at_output[i_write + 11] = ((x_left & 0x7f) << 4) | (x_right >>> 12);
			x_left = x_right;
			at_output[i_write + 12] = (x_left >>> 1) & 0x7ff;
			x_right = at_input[i_read + 9];
			at_output[i_write + 13] = ((x_left & 0x1) << 10) | (x_right >>> 6);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 14] = ((x_left & 0x3f) << 5) | (x_right >>> 11);
			x_left = x_right;
			at_output[i_write + 15] = x_left & 0x7ff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 5) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 6) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 1) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 7) | (x_right >>> 9);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 2) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 8) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 3) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 9) | (x_right >>> 7);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 4) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 10) | (x_right >>> 6);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 5) | (x_right >>> 11);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_12_16(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 12 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 12) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 4); i_read += 3, i_write += 4) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 4;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0xf) << 8) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0xff) << 4) | (x_right >>> 12);
			x_left = x_right;
			at_output[i_write + 3] = x_left & 0xfff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 4) & 0xfff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 8) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 4) | (x_right >>> 12);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_13_16(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 13 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 13) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 13, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 3;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x7) << 10) | (x_right >>> 6);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0x3f) << 7) | (x_right >>> 9);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0x1ff) << 4) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 4] = ((x_left & 0xfff) << 1) | (x_right >>> 15);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 2) & 0x1fff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 6] = ((x_left & 0x3) << 11) | (x_right >>> 5);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 7] = ((x_left & 0x1f) << 8) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 8] = ((x_left & 0xff) << 5) | (x_right >>> 11);
			x_left = x_right;
			x_right = at_input[i_read + 8];
			at_output[i_write + 9] = ((x_left & 0x7ff) << 2) | (x_right >>> 14);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 1) & 0x1fff;
			x_right = at_input[i_read + 9];
			at_output[i_write + 11] = ((x_left & 0x1) << 12) | (x_right >>> 4);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 12] = ((x_left & 0xf) << 9) | (x_right >>> 7);
			x_left = x_right;
			x_right = at_input[i_read + 11];
			at_output[i_write + 13] = ((x_left & 0x7f) << 6) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 12];
			at_output[i_write + 14] = ((x_left & 0x3ff) << 3) | (x_right >>> 13);
			x_left = x_right;
			at_output[i_write + 15] = x_left & 0x1fff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 3) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 10) | (x_right >>> 6);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 7) | (x_right >>> 9);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 4) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 1) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 11) | (x_right >>> 5);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 8) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 5) | (x_right >>> 11);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 2) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 12) | (x_right >>> 4);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 9) | (x_right >>> 7);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 6) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 3) | (x_right >>> 13);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_14_16(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 14 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 14) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 8); i_read += 7, i_write += 8) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 2;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x3) << 12) | (x_right >>> 4);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0xf) << 10) | (x_right >>> 6);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0x3f) << 8) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 4] = ((x_left & 0xff) << 6) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 5] = ((x_left & 0x3ff) << 4) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 6] = ((x_left & 0xfff) << 2) | (x_right >>> 14);
			x_left = x_right;
			at_output[i_write + 7] = x_left & 0x3fff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 2) & 0x3fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 12) | (x_right >>> 4);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 10) | (x_right >>> 6);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 8) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 6) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 4) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 2) | (x_right >>> 14);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_15_16(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap16();
		let i_byte_offset = Math.ceil(n_items * 15 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 15) / 16);
		let at_input = new Uint16Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 15, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 1;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x1) << 14) | (x_right >>> 2);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0x3) << 13) | (x_right >>> 3);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0x7) << 12) | (x_right >>> 4);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 4] = ((x_left & 0xf) << 11) | (x_right >>> 5);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 5] = ((x_left & 0x1f) << 10) | (x_right >>> 6);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 6] = ((x_left & 0x3f) << 9) | (x_right >>> 7);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 7] = ((x_left & 0x7f) << 8) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 8];
			at_output[i_write + 8] = ((x_left & 0xff) << 7) | (x_right >>> 9);
			x_left = x_right;
			x_right = at_input[i_read + 9];
			at_output[i_write + 9] = ((x_left & 0x1ff) << 6) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 10] = ((x_left & 0x3ff) << 5) | (x_right >>> 11);
			x_left = x_right;
			x_right = at_input[i_read + 11];
			at_output[i_write + 11] = ((x_left & 0x7ff) << 4) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 12];
			at_output[i_write + 12] = ((x_left & 0xfff) << 3) | (x_right >>> 13);
			x_left = x_right;
			x_right = at_input[i_read + 13];
			at_output[i_write + 13] = ((x_left & 0x1fff) << 2) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 14];
			at_output[i_write + 14] = ((x_left & 0x3fff) << 1) | (x_right >>> 15);
			x_left = x_right;
			at_output[i_write + 15] = x_left & 0x7fff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 1) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 14) | (x_right >>> 2);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 13) | (x_right >>> 3);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 12) | (x_right >>> 4);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 11) | (x_right >>> 5);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 10) | (x_right >>> 6);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 9) | (x_right >>> 7);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 8) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 7) | (x_right >>> 9);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 6) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 5) | (x_right >>> 11);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 4) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 3) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 2) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 1) | (x_right >>> 15);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	pack_2_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(2 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 1) {
			x = (a_items[i_item] << 30) | (a_items[i_item + 1] << 28) | (a_items[i_item + 2] << 26) | (a_items[i_item + 3] << 24) | (a_items[i_item + 4] << 22) | (a_items[i_item + 5] << 20) | (a_items[i_item + 6] << 18) | (a_items[i_item + 7] << 16) | (a_items[i_item + 8] << 14) | (a_items[i_item + 9] << 12) | (a_items[i_item + 10] << 10) | (a_items[i_item + 11] << 8) | (a_items[i_item + 12] << 6) | (a_items[i_item + 13] << 4) | (a_items[i_item + 14] << 2) | a_items[i_item + 15];
			at_output[i_write + 0] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 30;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 28;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 26;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 24;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 22;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 20;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 18;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_3_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(3 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 3) {
			x = (a_items[i_item] << 29) | (a_items[i_item + 1] << 26) | (a_items[i_item + 2] << 23) | (a_items[i_item + 3] << 20) | (a_items[i_item + 4] << 17) | (a_items[i_item + 5] << 14) | (a_items[i_item + 6] << 11) | (a_items[i_item + 7] << 8) | (a_items[i_item + 8] << 5) | (a_items[i_item + 9] << 2);
			x_value = a_items[i_item + 10];
			at_output[i_write + 0] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 11] << 28) | (a_items[i_item + 12] << 25) | (a_items[i_item + 13] << 22) | (a_items[i_item + 14] << 19) | (a_items[i_item + 15] << 16) | (a_items[i_item + 16] << 13) | (a_items[i_item + 17] << 10) | (a_items[i_item + 18] << 7) | (a_items[i_item + 19] << 4) | (a_items[i_item + 20] << 1);
			x_value = a_items[i_item + 21];
			at_output[i_write + 1] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 22] << 27) | (a_items[i_item + 23] << 24) | (a_items[i_item + 24] << 21) | (a_items[i_item + 25] << 18) | (a_items[i_item + 26] << 15) | (a_items[i_item + 27] << 12) | (a_items[i_item + 28] << 9) | (a_items[i_item + 29] << 6) | (a_items[i_item + 30] << 3) | a_items[i_item + 31];
			at_output[i_write + 2] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 29;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 26;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 23;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 20;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 17;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 28;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 25;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 22;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 19;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 13;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 27;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 24;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 21;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 18;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 15;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_4_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(4 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 8); i_item += 8, i_write += 1) {
			x = (a_items[i_item] << 28) | (a_items[i_item + 1] << 24) | (a_items[i_item + 2] << 20) | (a_items[i_item + 3] << 16) | (a_items[i_item + 4] << 12) | (a_items[i_item + 5] << 8) | (a_items[i_item + 6] << 4) | a_items[i_item + 7];
			at_output[i_write + 0] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 28;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 24;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 20;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_5_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(5 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 5) {
			x = (a_items[i_item] << 27) | (a_items[i_item + 1] << 22) | (a_items[i_item + 2] << 17) | (a_items[i_item + 3] << 12) | (a_items[i_item + 4] << 7) | (a_items[i_item + 5] << 2);
			x_value = a_items[i_item + 6];
			at_output[i_write + 0] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 7] << 24) | (a_items[i_item + 8] << 19) | (a_items[i_item + 9] << 14) | (a_items[i_item + 10] << 9) | (a_items[i_item + 11] << 4);
			x_value = a_items[i_item + 12];
			at_output[i_write + 1] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 13] << 26) | (a_items[i_item + 14] << 21) | (a_items[i_item + 15] << 16) | (a_items[i_item + 16] << 11) | (a_items[i_item + 17] << 6) | (a_items[i_item + 18] << 1);
			x_value = a_items[i_item + 19];
			at_output[i_write + 2] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 20] << 23) | (a_items[i_item + 21] << 18) | (a_items[i_item + 22] << 13) | (a_items[i_item + 23] << 8) | (a_items[i_item + 24] << 3);
			x_value = a_items[i_item + 25];
			at_output[i_write + 3] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 26] << 25) | (a_items[i_item + 27] << 20) | (a_items[i_item + 28] << 15) | (a_items[i_item + 29] << 10) | (a_items[i_item + 30] << 5) | a_items[i_item + 31];
			at_output[i_write + 4] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 27;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 22;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 17;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 24;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 19;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 26;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 21;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 23;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 18;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 13;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 25;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 20;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 15;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_6_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(6 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 3) {
			x = (a_items[i_item] << 26) | (a_items[i_item + 1] << 20) | (a_items[i_item + 2] << 14) | (a_items[i_item + 3] << 8) | (a_items[i_item + 4] << 2);
			x_value = a_items[i_item + 5];
			at_output[i_write + 0] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 6] << 22) | (a_items[i_item + 7] << 16) | (a_items[i_item + 8] << 10) | (a_items[i_item + 9] << 4);
			x_value = a_items[i_item + 10];
			at_output[i_write + 1] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 11] << 24) | (a_items[i_item + 12] << 18) | (a_items[i_item + 13] << 12) | (a_items[i_item + 14] << 6) | a_items[i_item + 15];
			at_output[i_write + 2] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 26;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 20;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 22;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 24;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 18;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_7_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(7 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 7) {
			x = (a_items[i_item] << 25) | (a_items[i_item + 1] << 18) | (a_items[i_item + 2] << 11) | (a_items[i_item + 3] << 4);
			x_value = a_items[i_item + 4];
			at_output[i_write + 0] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 5] << 22) | (a_items[i_item + 6] << 15) | (a_items[i_item + 7] << 8) | (a_items[i_item + 8] << 1);
			x_value = a_items[i_item + 9];
			at_output[i_write + 1] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 10] << 19) | (a_items[i_item + 11] << 12) | (a_items[i_item + 12] << 5);
			x_value = a_items[i_item + 13];
			at_output[i_write + 2] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 14] << 23) | (a_items[i_item + 15] << 16) | (a_items[i_item + 16] << 9) | (a_items[i_item + 17] << 2);
			x_value = a_items[i_item + 18];
			at_output[i_write + 3] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 19] << 20) | (a_items[i_item + 20] << 13) | (a_items[i_item + 21] << 6);
			x_value = a_items[i_item + 22];
			at_output[i_write + 4] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 23] << 24) | (a_items[i_item + 24] << 17) | (a_items[i_item + 25] << 10) | (a_items[i_item + 26] << 3);
			x_value = a_items[i_item + 27];
			at_output[i_write + 5] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 28] << 21) | (a_items[i_item + 29] << 14) | (a_items[i_item + 30] << 7) | a_items[i_item + 31];
			at_output[i_write + 6] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 25;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 18;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 22;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 15;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 19;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 23;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 20;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 13;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 24;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 17;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 21;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_8_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(8 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 4); i_item += 4, i_write += 1) {
			x = (a_items[i_item] << 24) | (a_items[i_item + 1] << 16) | (a_items[i_item + 2] << 8) | a_items[i_item + 3];
			at_output[i_write + 0] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 24;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_9_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(9 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 9) {
			x = (a_items[i_item] << 23) | (a_items[i_item + 1] << 14) | (a_items[i_item + 2] << 5);
			x_value = a_items[i_item + 3];
			at_output[i_write + 0] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 4] << 19) | (a_items[i_item + 5] << 10) | (a_items[i_item + 6] << 1);
			x_value = a_items[i_item + 7];
			at_output[i_write + 1] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 8] << 15) | (a_items[i_item + 9] << 6);
			x_value = a_items[i_item + 10];
			at_output[i_write + 2] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 11] << 20) | (a_items[i_item + 12] << 11) | (a_items[i_item + 13] << 2);
			x_value = a_items[i_item + 14];
			at_output[i_write + 3] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25) | (a_items[i_item + 15] << 16) | (a_items[i_item + 16] << 7);
			x_value = a_items[i_item + 17];
			at_output[i_write + 4] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 18] << 21) | (a_items[i_item + 19] << 12) | (a_items[i_item + 20] << 3);
			x_value = a_items[i_item + 21];
			at_output[i_write + 5] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 22] << 17) | (a_items[i_item + 23] << 8);
			x_value = a_items[i_item + 24];
			at_output[i_write + 6] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 25] << 22) | (a_items[i_item + 26] << 13) | (a_items[i_item + 27] << 4);
			x_value = a_items[i_item + 28];
			at_output[i_write + 7] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 29] << 18) | (a_items[i_item + 30] << 9) | a_items[i_item + 31];
			at_output[i_write + 8] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 23;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 19;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 15;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 20;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 21;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 17;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 22;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 13;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 18;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_10_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(10 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 5) {
			x = (a_items[i_item] << 22) | (a_items[i_item + 1] << 12) | (a_items[i_item + 2] << 2);
			x_value = a_items[i_item + 3];
			at_output[i_write + 0] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 4] << 14) | (a_items[i_item + 5] << 4);
			x_value = a_items[i_item + 6];
			at_output[i_write + 1] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 7] << 16) | (a_items[i_item + 8] << 6);
			x_value = a_items[i_item + 9];
			at_output[i_write + 2] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 10] << 18) | (a_items[i_item + 11] << 8);
			x_value = a_items[i_item + 12];
			at_output[i_write + 3] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 13] << 20) | (a_items[i_item + 14] << 10) | a_items[i_item + 15];
			at_output[i_write + 4] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 22;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 18;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 20;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_11_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(11 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 11) {
			x = (a_items[i_item] << 21) | (a_items[i_item + 1] << 10);
			x_value = a_items[i_item + 2];
			at_output[i_write + 0] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 3] << 20) | (a_items[i_item + 4] << 9);
			x_value = a_items[i_item + 5];
			at_output[i_write + 1] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 6] << 19) | (a_items[i_item + 7] << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 2] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 9] << 18) | (a_items[i_item + 10] << 7);
			x_value = a_items[i_item + 11];
			at_output[i_write + 3] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 12] << 17) | (a_items[i_item + 13] << 6);
			x_value = a_items[i_item + 14];
			at_output[i_write + 4] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 15] << 16) | (a_items[i_item + 16] << 5);
			x_value = a_items[i_item + 17];
			at_output[i_write + 5] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 18] << 15) | (a_items[i_item + 19] << 4);
			x_value = a_items[i_item + 20];
			at_output[i_write + 6] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25) | (a_items[i_item + 21] << 14) | (a_items[i_item + 22] << 3);
			x_value = a_items[i_item + 23];
			at_output[i_write + 7] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 24] << 13) | (a_items[i_item + 25] << 2);
			x_value = a_items[i_item + 26];
			at_output[i_write + 8] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23) | (a_items[i_item + 27] << 12) | (a_items[i_item + 28] << 1);
			x_value = a_items[i_item + 29];
			at_output[i_write + 9] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22) | (a_items[i_item + 30] << 11) | a_items[i_item + 31];
			at_output[i_write + 10] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 21;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 20;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 19;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 18;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 17;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 15;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 13;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_12_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(12 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 8); i_item += 8, i_write += 3) {
			x = (a_items[i_item] << 20) | (a_items[i_item + 1] << 8);
			x_value = a_items[i_item + 2];
			at_output[i_write + 0] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 3] << 16) | (a_items[i_item + 4] << 4);
			x_value = a_items[i_item + 5];
			at_output[i_write + 1] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 6] << 12) | a_items[i_item + 7];
			at_output[i_write + 2] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 20;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_13_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(13 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 13) {
			x = (a_items[i_item] << 19) | (a_items[i_item + 1] << 6);
			x_value = a_items[i_item + 2];
			at_output[i_write + 0] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25) | (a_items[i_item + 3] << 12);
			x_value = a_items[i_item + 4];
			at_output[i_write + 1] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 5] << 18) | (a_items[i_item + 6] << 5);
			x_value = a_items[i_item + 7];
			at_output[i_write + 2] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 8] << 11);
			x_value = a_items[i_item + 9];
			at_output[i_write + 3] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 10] << 17) | (a_items[i_item + 11] << 4);
			x_value = a_items[i_item + 12];
			at_output[i_write + 4] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23) | (a_items[i_item + 13] << 10);
			x_value = a_items[i_item + 14];
			at_output[i_write + 5] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 15] << 16) | (a_items[i_item + 16] << 3);
			x_value = a_items[i_item + 17];
			at_output[i_write + 6] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22) | (a_items[i_item + 18] << 9);
			x_value = a_items[i_item + 19];
			at_output[i_write + 7] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 20] << 15) | (a_items[i_item + 21] << 2);
			x_value = a_items[i_item + 22];
			at_output[i_write + 8] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21) | (a_items[i_item + 23] << 8);
			x_value = a_items[i_item + 24];
			at_output[i_write + 9] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 25] << 14) | (a_items[i_item + 26] << 1);
			x_value = a_items[i_item + 27];
			at_output[i_write + 10] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20) | (a_items[i_item + 28] << 7);
			x_value = a_items[i_item + 29];
			at_output[i_write + 11] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 30] << 13) | a_items[i_item + 31];
			at_output[i_write + 12] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 19;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 18;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 17;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 15;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 13;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_14_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(14 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 7) {
			x = (a_items[i_item] << 18) | (a_items[i_item + 1] << 4);
			x_value = a_items[i_item + 2];
			at_output[i_write + 0] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22) | (a_items[i_item + 3] << 8);
			x_value = a_items[i_item + 4];
			at_output[i_write + 1] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 5] << 12);
			x_value = a_items[i_item + 6];
			at_output[i_write + 2] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 7] << 16) | (a_items[i_item + 8] << 2);
			x_value = a_items[i_item + 9];
			at_output[i_write + 3] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20) | (a_items[i_item + 10] << 6);
			x_value = a_items[i_item + 11];
			at_output[i_write + 4] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 12] << 10);
			x_value = a_items[i_item + 13];
			at_output[i_write + 5] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 14] << 14) | a_items[i_item + 15];
			at_output[i_write + 6] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 18;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_15_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(15 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 15) {
			x = (a_items[i_item] << 17) | (a_items[i_item + 1] << 2);
			x_value = a_items[i_item + 2];
			at_output[i_write + 0] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 19) | (a_items[i_item + 3] << 4);
			x_value = a_items[i_item + 4];
			at_output[i_write + 1] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21) | (a_items[i_item + 5] << 6);
			x_value = a_items[i_item + 6];
			at_output[i_write + 2] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23) | (a_items[i_item + 7] << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 3] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25) | (a_items[i_item + 9] << 10);
			x_value = a_items[i_item + 10];
			at_output[i_write + 4] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 11] << 12);
			x_value = a_items[i_item + 12];
			at_output[i_write + 5] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 13] << 14);
			x_value = a_items[i_item + 14];
			at_output[i_write + 6] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 15] << 16) | (a_items[i_item + 16] << 1);
			x_value = a_items[i_item + 17];
			at_output[i_write + 7] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18) | (a_items[i_item + 18] << 3);
			x_value = a_items[i_item + 19];
			at_output[i_write + 8] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20) | (a_items[i_item + 20] << 5);
			x_value = a_items[i_item + 21];
			at_output[i_write + 9] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22) | (a_items[i_item + 22] << 7);
			x_value = a_items[i_item + 23];
			at_output[i_write + 10] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 24] << 9);
			x_value = a_items[i_item + 25];
			at_output[i_write + 11] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 26] << 11);
			x_value = a_items[i_item + 27];
			at_output[i_write + 12] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 28] << 13);
			x_value = a_items[i_item + 29];
			at_output[i_write + 13] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 30] << 15) | a_items[i_item + 31];
			at_output[i_write + 14] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 17;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 19);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 16;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 13;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 15;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_16_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(16 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 2); i_item += 2, i_write += 1) {
			x = (a_items[i_item] << 16) | a_items[i_item + 1];
			at_output[i_write + 0] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 16;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_17_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(17 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 17) {
			x = (a_items[i_item] << 15);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 2] << 13);
			x_value = a_items[i_item + 3];
			at_output[i_write + 1] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 4] << 11);
			x_value = a_items[i_item + 5];
			at_output[i_write + 2] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 6] << 9);
			x_value = a_items[i_item + 7];
			at_output[i_write + 3] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 8] << 7);
			x_value = a_items[i_item + 9];
			at_output[i_write + 4] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22) | (a_items[i_item + 10] << 5);
			x_value = a_items[i_item + 11];
			at_output[i_write + 5] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20) | (a_items[i_item + 12] << 3);
			x_value = a_items[i_item + 13];
			at_output[i_write + 6] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18) | (a_items[i_item + 14] << 1);
			x_value = a_items[i_item + 15];
			at_output[i_write + 7] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 16];
			at_output[i_write + 8] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 17] << 14);
			x_value = a_items[i_item + 18];
			at_output[i_write + 9] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 19] << 12);
			x_value = a_items[i_item + 20];
			at_output[i_write + 10] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 21] << 10);
			x_value = a_items[i_item + 22];
			at_output[i_write + 11] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25) | (a_items[i_item + 23] << 8);
			x_value = a_items[i_item + 24];
			at_output[i_write + 12] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23) | (a_items[i_item + 25] << 6);
			x_value = a_items[i_item + 26];
			at_output[i_write + 13] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21) | (a_items[i_item + 27] << 4);
			x_value = a_items[i_item + 28];
			at_output[i_write + 14] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 19) | (a_items[i_item + 29] << 2);
			x_value = a_items[i_item + 30];
			at_output[i_write + 15] = x | (x_value >>> 15);
			x = ((x_value & 0x7fff) << 17) | a_items[i_item + 31];
			at_output[i_write + 16] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 15;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 13;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 14;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 19);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 15);
		x = ((x_value & 0x7fff) << 17);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_18_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(18 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 9) {
			x = (a_items[i_item] << 14);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 2] << 10);
			x_value = a_items[i_item + 3];
			at_output[i_write + 1] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 4] << 6);
			x_value = a_items[i_item + 5];
			at_output[i_write + 2] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20) | (a_items[i_item + 6] << 2);
			x_value = a_items[i_item + 7];
			at_output[i_write + 3] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 8];
			at_output[i_write + 4] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 9] << 12);
			x_value = a_items[i_item + 10];
			at_output[i_write + 5] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 11] << 8);
			x_value = a_items[i_item + 12];
			at_output[i_write + 6] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22) | (a_items[i_item + 13] << 4);
			x_value = a_items[i_item + 14];
			at_output[i_write + 7] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18) | a_items[i_item + 15];
			at_output[i_write + 8] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 14;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_19_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(19 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 19) {
			x = (a_items[i_item] << 13);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 2] << 7);
			x_value = a_items[i_item + 3];
			at_output[i_write + 1] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20) | (a_items[i_item + 4] << 1);
			x_value = a_items[i_item + 5];
			at_output[i_write + 2] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 6];
			at_output[i_write + 3] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 7] << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 4] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21) | (a_items[i_item + 9] << 2);
			x_value = a_items[i_item + 10];
			at_output[i_write + 5] = x | (x_value >>> 17);
			x = ((x_value & 0x1ffff) << 15);
			x_value = a_items[i_item + 11];
			at_output[i_write + 6] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 12] << 9);
			x_value = a_items[i_item + 13];
			at_output[i_write + 7] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22) | (a_items[i_item + 14] << 3);
			x_value = a_items[i_item + 15];
			at_output[i_write + 8] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 16];
			at_output[i_write + 9] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 17] << 10);
			x_value = a_items[i_item + 18];
			at_output[i_write + 10] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23) | (a_items[i_item + 19] << 4);
			x_value = a_items[i_item + 20];
			at_output[i_write + 11] = x | (x_value >>> 15);
			x = ((x_value & 0x7fff) << 17);
			x_value = a_items[i_item + 21];
			at_output[i_write + 12] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 22] << 11);
			x_value = a_items[i_item + 23];
			at_output[i_write + 13] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 24] << 5);
			x_value = a_items[i_item + 25];
			at_output[i_write + 14] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 26];
			at_output[i_write + 15] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 27] << 12);
			x_value = a_items[i_item + 28];
			at_output[i_write + 16] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25) | (a_items[i_item + 29] << 6);
			x_value = a_items[i_item + 30];
			at_output[i_write + 17] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 19) | a_items[i_item + 31];
			at_output[i_write + 18] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 13;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 17);
		x = ((x_value & 0x1ffff) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 15);
		x = ((x_value & 0x7fff) << 17);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 11;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 12;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 19);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_20_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(20 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 8); i_item += 8, i_write += 5) {
			x = (a_items[i_item] << 12);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 2] << 4);
			x_value = a_items[i_item + 3];
			at_output[i_write + 1] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 4];
			at_output[i_write + 2] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 5] << 8);
			x_value = a_items[i_item + 6];
			at_output[i_write + 3] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20) | a_items[i_item + 7];
			at_output[i_write + 4] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 12;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_21_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(21 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 21) {
			x = (a_items[i_item] << 11);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22) | (a_items[i_item + 2] << 1);
			x_value = a_items[i_item + 3];
			at_output[i_write + 1] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 4];
			at_output[i_write + 2] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23) | (a_items[i_item + 5] << 2);
			x_value = a_items[i_item + 6];
			at_output[i_write + 3] = x | (x_value >>> 19);
			x = ((x_value & 0x7ffff) << 13);
			x_value = a_items[i_item + 7];
			at_output[i_write + 4] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 8] << 3);
			x_value = a_items[i_item + 9];
			at_output[i_write + 5] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 10];
			at_output[i_write + 6] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25) | (a_items[i_item + 11] << 4);
			x_value = a_items[i_item + 12];
			at_output[i_write + 7] = x | (x_value >>> 17);
			x = ((x_value & 0x1ffff) << 15);
			x_value = a_items[i_item + 13];
			at_output[i_write + 8] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 14] << 5);
			x_value = a_items[i_item + 15];
			at_output[i_write + 9] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 16];
			at_output[i_write + 10] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 17] << 6);
			x_value = a_items[i_item + 18];
			at_output[i_write + 11] = x | (x_value >>> 15);
			x = ((x_value & 0x7fff) << 17);
			x_value = a_items[i_item + 19];
			at_output[i_write + 12] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 20] << 7);
			x_value = a_items[i_item + 21];
			at_output[i_write + 13] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 22];
			at_output[i_write + 14] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 23] << 8);
			x_value = a_items[i_item + 24];
			at_output[i_write + 15] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 19);
			x_value = a_items[i_item + 25];
			at_output[i_write + 16] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 26] << 9);
			x_value = a_items[i_item + 27];
			at_output[i_write + 17] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 28];
			at_output[i_write + 18] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 29] << 10);
			x_value = a_items[i_item + 30];
			at_output[i_write + 19] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21) | a_items[i_item + 31];
			at_output[i_write + 20] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 11;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 19);
		x = ((x_value & 0x7ffff) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 17);
		x = ((x_value & 0x1ffff) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 15);
		x = ((x_value & 0x7fff) << 17);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 19);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 9;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 10;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_22_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(22 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 11) {
			x = (a_items[i_item] << 10);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 3] << 8);
			x_value = a_items[i_item + 4];
			at_output[i_write + 2] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 5];
			at_output[i_write + 3] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 6] << 6);
			x_value = a_items[i_item + 7];
			at_output[i_write + 4] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 8];
			at_output[i_write + 5] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 9] << 4);
			x_value = a_items[i_item + 10];
			at_output[i_write + 6] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 11];
			at_output[i_write + 7] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 12] << 2);
			x_value = a_items[i_item + 13];
			at_output[i_write + 8] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 14];
			at_output[i_write + 9] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22) | a_items[i_item + 15];
			at_output[i_write + 10] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 10;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_23_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(23 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 23) {
			x = (a_items[i_item] << 9);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 3] << 4);
			x_value = a_items[i_item + 4];
			at_output[i_write + 2] = x | (x_value >>> 19);
			x = ((x_value & 0x7ffff) << 13);
			x_value = a_items[i_item + 5];
			at_output[i_write + 3] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22);
			x_value = a_items[i_item + 6];
			at_output[i_write + 4] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 7] << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 5] = x | (x_value >>> 15);
			x = ((x_value & 0x7fff) << 17);
			x_value = a_items[i_item + 9];
			at_output[i_write + 6] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 10] << 3);
			x_value = a_items[i_item + 11];
			at_output[i_write + 7] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 12];
			at_output[i_write + 8] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21);
			x_value = a_items[i_item + 13];
			at_output[i_write + 9] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 14] << 7);
			x_value = a_items[i_item + 15];
			at_output[i_write + 10] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 16];
			at_output[i_write + 11] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25) | (a_items[i_item + 17] << 2);
			x_value = a_items[i_item + 18];
			at_output[i_write + 12] = x | (x_value >>> 21);
			x = ((x_value & 0x1fffff) << 11);
			x_value = a_items[i_item + 19];
			at_output[i_write + 13] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 20];
			at_output[i_write + 14] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 21] << 6);
			x_value = a_items[i_item + 22];
			at_output[i_write + 15] = x | (x_value >>> 17);
			x = ((x_value & 0x1ffff) << 15);
			x_value = a_items[i_item + 23];
			at_output[i_write + 16] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | (a_items[i_item + 24] << 1);
			x_value = a_items[i_item + 25];
			at_output[i_write + 17] = x | (x_value >>> 22);
			x = ((x_value & 0x3fffff) << 10);
			x_value = a_items[i_item + 26];
			at_output[i_write + 18] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 19);
			x_value = a_items[i_item + 27];
			at_output[i_write + 19] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 28] << 5);
			x_value = a_items[i_item + 29];
			at_output[i_write + 20] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 30];
			at_output[i_write + 21] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23) | a_items[i_item + 31];
			at_output[i_write + 22] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 9;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 19);
		x = ((x_value & 0x7ffff) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 8;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 15);
		x = ((x_value & 0x7fff) << 17);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 7;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 21);
		x = ((x_value & 0x1fffff) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 17);
		x = ((x_value & 0x1ffff) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 22);
		x = ((x_value & 0x3fffff) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 19);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_24_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(24 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 4); i_item += 4, i_write += 3) {
			x = (a_items[i_item] << 8);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24) | a_items[i_item + 3];
			at_output[i_write + 2] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 8;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_25_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(25 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 25) {
			x = (a_items[i_item] << 7);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 4] << 3);
			x_value = a_items[i_item + 5];
			at_output[i_write + 3] = x | (x_value >>> 22);
			x = ((x_value & 0x3fffff) << 10);
			x_value = a_items[i_item + 6];
			at_output[i_write + 4] = x | (x_value >>> 15);
			x = ((x_value & 0x7fff) << 17);
			x_value = a_items[i_item + 7];
			at_output[i_write + 5] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24);
			x_value = a_items[i_item + 8];
			at_output[i_write + 6] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 9] << 6);
			x_value = a_items[i_item + 10];
			at_output[i_write + 7] = x | (x_value >>> 19);
			x = ((x_value & 0x7ffff) << 13);
			x_value = a_items[i_item + 11];
			at_output[i_write + 8] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 12];
			at_output[i_write + 9] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | (a_items[i_item + 13] << 2);
			x_value = a_items[i_item + 14];
			at_output[i_write + 10] = x | (x_value >>> 23);
			x = ((x_value & 0x7fffff) << 9);
			x_value = a_items[i_item + 15];
			at_output[i_write + 11] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 16];
			at_output[i_write + 12] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23);
			x_value = a_items[i_item + 17];
			at_output[i_write + 13] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 18] << 5);
			x_value = a_items[i_item + 19];
			at_output[i_write + 14] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 20];
			at_output[i_write + 15] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 19);
			x_value = a_items[i_item + 21];
			at_output[i_write + 16] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | (a_items[i_item + 22] << 1);
			x_value = a_items[i_item + 23];
			at_output[i_write + 17] = x | (x_value >>> 24);
			x = ((x_value & 0xffffff) << 8);
			x_value = a_items[i_item + 24];
			at_output[i_write + 18] = x | (x_value >>> 17);
			x = ((x_value & 0x1ffff) << 15);
			x_value = a_items[i_item + 25];
			at_output[i_write + 19] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22);
			x_value = a_items[i_item + 26];
			at_output[i_write + 20] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 27] << 4);
			x_value = a_items[i_item + 28];
			at_output[i_write + 21] = x | (x_value >>> 21);
			x = ((x_value & 0x1fffff) << 11);
			x_value = a_items[i_item + 29];
			at_output[i_write + 22] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 30];
			at_output[i_write + 23] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25) | a_items[i_item + 31];
			at_output[i_write + 24] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 7;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 22);
		x = ((x_value & 0x3fffff) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 15);
		x = ((x_value & 0x7fff) << 17);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 6;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 19);
		x = ((x_value & 0x7ffff) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 23);
		x = ((x_value & 0x7fffff) << 9);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 5;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 19);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 24);
		x = ((x_value & 0xffffff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 17);
		x = ((x_value & 0x1ffff) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 21);
		x = ((x_value & 0x1fffff) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_26_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(26 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 13) {
			x = (a_items[i_item] << 6);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24);
			x_value = a_items[i_item + 4];
			at_output[i_write + 3] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 5] << 4);
			x_value = a_items[i_item + 6];
			at_output[i_write + 4] = x | (x_value >>> 22);
			x = ((x_value & 0x3fffff) << 10);
			x_value = a_items[i_item + 7];
			at_output[i_write + 5] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 8];
			at_output[i_write + 6] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22);
			x_value = a_items[i_item + 9];
			at_output[i_write + 7] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 10] << 2);
			x_value = a_items[i_item + 11];
			at_output[i_write + 8] = x | (x_value >>> 24);
			x = ((x_value & 0xffffff) << 8);
			x_value = a_items[i_item + 12];
			at_output[i_write + 9] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 13];
			at_output[i_write + 10] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 14];
			at_output[i_write + 11] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26) | a_items[i_item + 15];
			at_output[i_write + 12] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 6;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 22);
		x = ((x_value & 0x3fffff) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 24);
		x = ((x_value & 0xffffff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_27_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(27 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 27) {
			x = (a_items[i_item] << 5);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 22);
			x = ((x_value & 0x3fffff) << 10);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 17);
			x = ((x_value & 0x1ffff) << 15);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 4];
			at_output[i_write + 3] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25);
			x_value = a_items[i_item + 5];
			at_output[i_write + 4] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 6] << 3);
			x_value = a_items[i_item + 7];
			at_output[i_write + 5] = x | (x_value >>> 24);
			x = ((x_value & 0xffffff) << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 6] = x | (x_value >>> 19);
			x = ((x_value & 0x7ffff) << 13);
			x_value = a_items[i_item + 9];
			at_output[i_write + 7] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 10];
			at_output[i_write + 8] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23);
			x_value = a_items[i_item + 11];
			at_output[i_write + 9] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | (a_items[i_item + 12] << 1);
			x_value = a_items[i_item + 13];
			at_output[i_write + 10] = x | (x_value >>> 26);
			x = ((x_value & 0x3ffffff) << 6);
			x_value = a_items[i_item + 14];
			at_output[i_write + 11] = x | (x_value >>> 21);
			x = ((x_value & 0x1fffff) << 11);
			x_value = a_items[i_item + 15];
			at_output[i_write + 12] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 16];
			at_output[i_write + 13] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21);
			x_value = a_items[i_item + 17];
			at_output[i_write + 14] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26);
			x_value = a_items[i_item + 18];
			at_output[i_write + 15] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 19] << 4);
			x_value = a_items[i_item + 20];
			at_output[i_write + 16] = x | (x_value >>> 23);
			x = ((x_value & 0x7fffff) << 9);
			x_value = a_items[i_item + 21];
			at_output[i_write + 17] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 22];
			at_output[i_write + 18] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 19);
			x_value = a_items[i_item + 23];
			at_output[i_write + 19] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24);
			x_value = a_items[i_item + 24];
			at_output[i_write + 20] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | (a_items[i_item + 25] << 2);
			x_value = a_items[i_item + 26];
			at_output[i_write + 21] = x | (x_value >>> 25);
			x = ((x_value & 0x1ffffff) << 7);
			x_value = a_items[i_item + 27];
			at_output[i_write + 22] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 28];
			at_output[i_write + 23] = x | (x_value >>> 15);
			x = ((x_value & 0x7fff) << 17);
			x_value = a_items[i_item + 29];
			at_output[i_write + 24] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22);
			x_value = a_items[i_item + 30];
			at_output[i_write + 25] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27) | a_items[i_item + 31];
			at_output[i_write + 26] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 5;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 22);
		x = ((x_value & 0x3fffff) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 17);
		x = ((x_value & 0x1ffff) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 3;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 24);
		x = ((x_value & 0xffffff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 19);
		x = ((x_value & 0x7ffff) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 26);
		x = ((x_value & 0x3ffffff) << 6);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 21);
		x = ((x_value & 0x1fffff) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 4;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 23);
		x = ((x_value & 0x7fffff) << 9);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 19);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 25);
		x = ((x_value & 0x1ffffff) << 7);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 15);
		x = ((x_value & 0x7fff) << 17);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_28_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(28 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 8); i_item += 8, i_write += 7) {
			x = (a_items[i_item] << 4);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 24);
			x = ((x_value & 0xffffff) << 8);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 4];
			at_output[i_write + 3] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 5];
			at_output[i_write + 4] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24);
			x_value = a_items[i_item + 6];
			at_output[i_write + 5] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28) | a_items[i_item + 7];
			at_output[i_write + 6] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 4;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 24);
		x = ((x_value & 0xffffff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_29_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(29 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 29) {
			x = (a_items[i_item] << 3);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 26);
			x = ((x_value & 0x3ffffff) << 6);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 23);
			x = ((x_value & 0x7fffff) << 9);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 4];
			at_output[i_write + 3] = x | (x_value >>> 17);
			x = ((x_value & 0x1ffff) << 15);
			x_value = a_items[i_item + 5];
			at_output[i_write + 4] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 6];
			at_output[i_write + 5] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21);
			x_value = a_items[i_item + 7];
			at_output[i_write + 6] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24);
			x_value = a_items[i_item + 8];
			at_output[i_write + 7] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27);
			x_value = a_items[i_item + 9];
			at_output[i_write + 8] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | (a_items[i_item + 10] << 1);
			x_value = a_items[i_item + 11];
			at_output[i_write + 9] = x | (x_value >>> 28);
			x = ((x_value & 0xfffffff) << 4);
			x_value = a_items[i_item + 12];
			at_output[i_write + 10] = x | (x_value >>> 25);
			x = ((x_value & 0x1ffffff) << 7);
			x_value = a_items[i_item + 13];
			at_output[i_write + 11] = x | (x_value >>> 22);
			x = ((x_value & 0x3fffff) << 10);
			x_value = a_items[i_item + 14];
			at_output[i_write + 12] = x | (x_value >>> 19);
			x = ((x_value & 0x7ffff) << 13);
			x_value = a_items[i_item + 15];
			at_output[i_write + 13] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 16];
			at_output[i_write + 14] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 19);
			x_value = a_items[i_item + 17];
			at_output[i_write + 15] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22);
			x_value = a_items[i_item + 18];
			at_output[i_write + 16] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25);
			x_value = a_items[i_item + 19];
			at_output[i_write + 17] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28);
			x_value = a_items[i_item + 20];
			at_output[i_write + 18] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | (a_items[i_item + 21] << 2);
			x_value = a_items[i_item + 22];
			at_output[i_write + 19] = x | (x_value >>> 27);
			x = ((x_value & 0x7ffffff) << 5);
			x_value = a_items[i_item + 23];
			at_output[i_write + 20] = x | (x_value >>> 24);
			x = ((x_value & 0xffffff) << 8);
			x_value = a_items[i_item + 24];
			at_output[i_write + 21] = x | (x_value >>> 21);
			x = ((x_value & 0x1fffff) << 11);
			x_value = a_items[i_item + 25];
			at_output[i_write + 22] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 26];
			at_output[i_write + 23] = x | (x_value >>> 15);
			x = ((x_value & 0x7fff) << 17);
			x_value = a_items[i_item + 27];
			at_output[i_write + 24] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 28];
			at_output[i_write + 25] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23);
			x_value = a_items[i_item + 29];
			at_output[i_write + 26] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26);
			x_value = a_items[i_item + 30];
			at_output[i_write + 27] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29) | a_items[i_item + 31];
			at_output[i_write + 28] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 3;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 26);
		x = ((x_value & 0x3ffffff) << 6);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 23);
		x = ((x_value & 0x7fffff) << 9);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 17);
		x = ((x_value & 0x1ffff) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 1;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 28);
		x = ((x_value & 0xfffffff) << 4);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 25);
		x = ((x_value & 0x1ffffff) << 7);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 22);
		x = ((x_value & 0x3fffff) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 19);
		x = ((x_value & 0x7ffff) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 19);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++] << 2;
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 27);
		x = ((x_value & 0x7ffffff) << 5);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 24);
		x = ((x_value & 0xffffff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 21);
		x = ((x_value & 0x1fffff) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 15);
		x = ((x_value & 0x7fff) << 17);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_30_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(30 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 16); i_item += 16, i_write += 15) {
			x = (a_items[i_item] << 2);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 28);
			x = ((x_value & 0xfffffff) << 4);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 26);
			x = ((x_value & 0x3ffffff) << 6);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 24);
			x = ((x_value & 0xffffff) << 8);
			x_value = a_items[i_item + 4];
			at_output[i_write + 3] = x | (x_value >>> 22);
			x = ((x_value & 0x3fffff) << 10);
			x_value = a_items[i_item + 5];
			at_output[i_write + 4] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 6];
			at_output[i_write + 5] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 7];
			at_output[i_write + 6] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 8];
			at_output[i_write + 7] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 9];
			at_output[i_write + 8] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 10];
			at_output[i_write + 9] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22);
			x_value = a_items[i_item + 11];
			at_output[i_write + 10] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24);
			x_value = a_items[i_item + 12];
			at_output[i_write + 11] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26);
			x_value = a_items[i_item + 13];
			at_output[i_write + 12] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28);
			x_value = a_items[i_item + 14];
			at_output[i_write + 13] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30) | a_items[i_item + 15];
			at_output[i_write + 14] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 2;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 28);
		x = ((x_value & 0xfffffff) << 4);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 26);
		x = ((x_value & 0x3ffffff) << 6);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 24);
		x = ((x_value & 0xffffff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 22);
		x = ((x_value & 0x3fffff) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	pack_31_32(a_items) {
		let n_items = a_items.length;
		let n_bytes = Math.ceil(31 * n_items / 8);
		let at_output = new Uint32Array(Math.ceil(n_bytes / 4));
		let i_write = 0;
		let i_item = 0;
		let x = 0;
		let x_value = 0;
		for (; i_item <= (n_items - 32); i_item += 32, i_write += 31) {
			x = (a_items[i_item] << 1);
			x_value = a_items[i_item + 1];
			at_output[i_write + 0] = x | (x_value >>> 30);
			x = ((x_value & 0x3fffffff) << 2);
			x_value = a_items[i_item + 2];
			at_output[i_write + 1] = x | (x_value >>> 29);
			x = ((x_value & 0x1fffffff) << 3);
			x_value = a_items[i_item + 3];
			at_output[i_write + 2] = x | (x_value >>> 28);
			x = ((x_value & 0xfffffff) << 4);
			x_value = a_items[i_item + 4];
			at_output[i_write + 3] = x | (x_value >>> 27);
			x = ((x_value & 0x7ffffff) << 5);
			x_value = a_items[i_item + 5];
			at_output[i_write + 4] = x | (x_value >>> 26);
			x = ((x_value & 0x3ffffff) << 6);
			x_value = a_items[i_item + 6];
			at_output[i_write + 5] = x | (x_value >>> 25);
			x = ((x_value & 0x1ffffff) << 7);
			x_value = a_items[i_item + 7];
			at_output[i_write + 6] = x | (x_value >>> 24);
			x = ((x_value & 0xffffff) << 8);
			x_value = a_items[i_item + 8];
			at_output[i_write + 7] = x | (x_value >>> 23);
			x = ((x_value & 0x7fffff) << 9);
			x_value = a_items[i_item + 9];
			at_output[i_write + 8] = x | (x_value >>> 22);
			x = ((x_value & 0x3fffff) << 10);
			x_value = a_items[i_item + 10];
			at_output[i_write + 9] = x | (x_value >>> 21);
			x = ((x_value & 0x1fffff) << 11);
			x_value = a_items[i_item + 11];
			at_output[i_write + 10] = x | (x_value >>> 20);
			x = ((x_value & 0xfffff) << 12);
			x_value = a_items[i_item + 12];
			at_output[i_write + 11] = x | (x_value >>> 19);
			x = ((x_value & 0x7ffff) << 13);
			x_value = a_items[i_item + 13];
			at_output[i_write + 12] = x | (x_value >>> 18);
			x = ((x_value & 0x3ffff) << 14);
			x_value = a_items[i_item + 14];
			at_output[i_write + 13] = x | (x_value >>> 17);
			x = ((x_value & 0x1ffff) << 15);
			x_value = a_items[i_item + 15];
			at_output[i_write + 14] = x | (x_value >>> 16);
			x = ((x_value & 0xffff) << 16);
			x_value = a_items[i_item + 16];
			at_output[i_write + 15] = x | (x_value >>> 15);
			x = ((x_value & 0x7fff) << 17);
			x_value = a_items[i_item + 17];
			at_output[i_write + 16] = x | (x_value >>> 14);
			x = ((x_value & 0x3fff) << 18);
			x_value = a_items[i_item + 18];
			at_output[i_write + 17] = x | (x_value >>> 13);
			x = ((x_value & 0x1fff) << 19);
			x_value = a_items[i_item + 19];
			at_output[i_write + 18] = x | (x_value >>> 12);
			x = ((x_value & 0xfff) << 20);
			x_value = a_items[i_item + 20];
			at_output[i_write + 19] = x | (x_value >>> 11);
			x = ((x_value & 0x7ff) << 21);
			x_value = a_items[i_item + 21];
			at_output[i_write + 20] = x | (x_value >>> 10);
			x = ((x_value & 0x3ff) << 22);
			x_value = a_items[i_item + 22];
			at_output[i_write + 21] = x | (x_value >>> 9);
			x = ((x_value & 0x1ff) << 23);
			x_value = a_items[i_item + 23];
			at_output[i_write + 22] = x | (x_value >>> 8);
			x = ((x_value & 0xff) << 24);
			x_value = a_items[i_item + 24];
			at_output[i_write + 23] = x | (x_value >>> 7);
			x = ((x_value & 0x7f) << 25);
			x_value = a_items[i_item + 25];
			at_output[i_write + 24] = x | (x_value >>> 6);
			x = ((x_value & 0x3f) << 26);
			x_value = a_items[i_item + 26];
			at_output[i_write + 25] = x | (x_value >>> 5);
			x = ((x_value & 0x1f) << 27);
			x_value = a_items[i_item + 27];
			at_output[i_write + 26] = x | (x_value >>> 4);
			x = ((x_value & 0xf) << 28);
			x_value = a_items[i_item + 28];
			at_output[i_write + 27] = x | (x_value >>> 3);
			x = ((x_value & 0x7) << 29);
			x_value = a_items[i_item + 29];
			at_output[i_write + 28] = x | (x_value >>> 2);
			x = ((x_value & 0x3) << 30);
			x_value = a_items[i_item + 30];
			at_output[i_write + 29] = x | (x_value >>> 1);
			x = ((x_value & 0x1) << 31) | a_items[i_item + 31];
			at_output[i_write + 30] = x;
		}
		if (i_item === n_items) return uint32_array_to_buffer(at_output, n_bytes);
		x = a_items[i_item++] << 1;

		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 30);
		x = ((x_value & 0x3fffffff) << 2);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 29);
		x = ((x_value & 0x1fffffff) << 3);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 28);
		x = ((x_value & 0xfffffff) << 4);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 27);
		x = ((x_value & 0x7ffffff) << 5);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 26);
		x = ((x_value & 0x3ffffff) << 6);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 25);
		x = ((x_value & 0x1ffffff) << 7);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 24);
		x = ((x_value & 0xffffff) << 8);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 23);
		x = ((x_value & 0x7fffff) << 9);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 22);
		x = ((x_value & 0x3fffff) << 10);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 21);
		x = ((x_value & 0x1fffff) << 11);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 20);
		x = ((x_value & 0xfffff) << 12);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 19);
		x = ((x_value & 0x7ffff) << 13);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 18);
		x = ((x_value & 0x3ffff) << 14);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 17);
		x = ((x_value & 0x1ffff) << 15);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 16);
		x = ((x_value & 0xffff) << 16);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 15);
		x = ((x_value & 0x7fff) << 17);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 14);
		x = ((x_value & 0x3fff) << 18);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 13);
		x = ((x_value & 0x1fff) << 19);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 12);
		x = ((x_value & 0xfff) << 20);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 11);
		x = ((x_value & 0x7ff) << 21);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 10);
		x = ((x_value & 0x3ff) << 22);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 9);
		x = ((x_value & 0x1ff) << 23);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 8);
		x = ((x_value & 0xff) << 24);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 7);
		x = ((x_value & 0x7f) << 25);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 6);
		x = ((x_value & 0x3f) << 26);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 5);
		x = ((x_value & 0x1f) << 27);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 4);
		x = ((x_value & 0xf) << 28);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 3);
		x = ((x_value & 0x7) << 29);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 2);
		x = ((x_value & 0x3) << 30);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x_value = a_items[i_item++];
		at_output[i_write++] = x | (x_value >>> 1);
		x = ((x_value & 0x1) << 31);
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
		x |= a_items[i_item++]
		if (i_item === n_items) {
			at_output[i_write] = x;
			return uint32_array_to_buffer(at_output, n_bytes);
		}
	},
	unpack_2_32(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 2 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 2) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 1, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 30;

			at_output[i_write + 1] = (x_left >>> 28) & 0x3;
			at_output[i_write + 2] = (x_left >>> 26) & 0x3;
			at_output[i_write + 3] = (x_left >>> 24) & 0x3;
			at_output[i_write + 4] = (x_left >>> 22) & 0x3;
			at_output[i_write + 5] = (x_left >>> 20) & 0x3;
			at_output[i_write + 6] = (x_left >>> 18) & 0x3;
			at_output[i_write + 7] = (x_left >>> 16) & 0x3;
			at_output[i_write + 8] = (x_left >>> 14) & 0x3;
			at_output[i_write + 9] = (x_left >>> 12) & 0x3;
			at_output[i_write + 10] = (x_left >>> 10) & 0x3;
			at_output[i_write + 11] = (x_left >>> 8) & 0x3;
			at_output[i_write + 12] = (x_left >>> 6) & 0x3;
			at_output[i_write + 13] = (x_left >>> 4) & 0x3;
			at_output[i_write + 14] = (x_left >>> 2) & 0x3;
			at_output[i_write + 15] = x_left & 0x3;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 30) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 28) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 26) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 24) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 22) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 20) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 18) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3;
		return [at_output, i_byte_offset];
	},
	unpack_3_32(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 3 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 3) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 3, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 29;

			at_output[i_write + 1] = (x_left >>> 26) & 0x7;
			at_output[i_write + 2] = (x_left >>> 23) & 0x7;
			at_output[i_write + 3] = (x_left >>> 20) & 0x7;
			at_output[i_write + 4] = (x_left >>> 17) & 0x7;
			at_output[i_write + 5] = (x_left >>> 14) & 0x7;
			at_output[i_write + 6] = (x_left >>> 11) & 0x7;
			at_output[i_write + 7] = (x_left >>> 8) & 0x7;
			at_output[i_write + 8] = (x_left >>> 5) & 0x7;
			at_output[i_write + 9] = (x_left >>> 2) & 0x7;
			x_right = at_input[i_read + 1];
			at_output[i_write + 10] = ((x_left & 0x3) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 11] = (x_left >>> 28) & 0x7;
			at_output[i_write + 12] = (x_left >>> 25) & 0x7;
			at_output[i_write + 13] = (x_left >>> 22) & 0x7;
			at_output[i_write + 14] = (x_left >>> 19) & 0x7;
			at_output[i_write + 15] = (x_left >>> 16) & 0x7;
			at_output[i_write + 16] = (x_left >>> 13) & 0x7;
			at_output[i_write + 17] = (x_left >>> 10) & 0x7;
			at_output[i_write + 18] = (x_left >>> 7) & 0x7;
			at_output[i_write + 19] = (x_left >>> 4) & 0x7;
			at_output[i_write + 20] = (x_left >>> 1) & 0x7;
			x_right = at_input[i_read + 2];
			at_output[i_write + 21] = ((x_left & 0x1) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 22] = (x_left >>> 27) & 0x7;
			at_output[i_write + 23] = (x_left >>> 24) & 0x7;
			at_output[i_write + 24] = (x_left >>> 21) & 0x7;
			at_output[i_write + 25] = (x_left >>> 18) & 0x7;
			at_output[i_write + 26] = (x_left >>> 15) & 0x7;
			at_output[i_write + 27] = (x_left >>> 12) & 0x7;
			at_output[i_write + 28] = (x_left >>> 9) & 0x7;
			at_output[i_write + 29] = (x_left >>> 6) & 0x7;
			at_output[i_write + 30] = (x_left >>> 3) & 0x7;
			at_output[i_write + 31] = x_left & 0x7;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 29) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 26) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 23) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 20) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 17) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 28) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 25) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 22) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 19) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 13) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 27) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 24) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 21) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 18) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 15) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x7;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7;
		return [at_output, i_byte_offset];
	},
	unpack_4_32(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 4 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 4) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 8); i_read += 1, i_write += 8) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 28;

			at_output[i_write + 1] = (x_left >>> 24) & 0xf;
			at_output[i_write + 2] = (x_left >>> 20) & 0xf;
			at_output[i_write + 3] = (x_left >>> 16) & 0xf;
			at_output[i_write + 4] = (x_left >>> 12) & 0xf;
			at_output[i_write + 5] = (x_left >>> 8) & 0xf;
			at_output[i_write + 6] = (x_left >>> 4) & 0xf;
			at_output[i_write + 7] = x_left & 0xf;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 28) & 0xf;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 24) & 0xf;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 20) & 0xf;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0xf;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0xf;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0xf;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0xf;
		return [at_output, i_byte_offset];
	},
	unpack_5_32(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 5 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 5) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 5, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 27;

			at_output[i_write + 1] = (x_left >>> 22) & 0x1f;
			at_output[i_write + 2] = (x_left >>> 17) & 0x1f;
			at_output[i_write + 3] = (x_left >>> 12) & 0x1f;
			at_output[i_write + 4] = (x_left >>> 7) & 0x1f;
			at_output[i_write + 5] = (x_left >>> 2) & 0x1f;
			x_right = at_input[i_read + 1];
			at_output[i_write + 6] = ((x_left & 0x3) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 7] = (x_left >>> 24) & 0x1f;
			at_output[i_write + 8] = (x_left >>> 19) & 0x1f;
			at_output[i_write + 9] = (x_left >>> 14) & 0x1f;
			at_output[i_write + 10] = (x_left >>> 9) & 0x1f;
			at_output[i_write + 11] = (x_left >>> 4) & 0x1f;
			x_right = at_input[i_read + 2];
			at_output[i_write + 12] = ((x_left & 0xf) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 13] = (x_left >>> 26) & 0x1f;
			at_output[i_write + 14] = (x_left >>> 21) & 0x1f;
			at_output[i_write + 15] = (x_left >>> 16) & 0x1f;
			at_output[i_write + 16] = (x_left >>> 11) & 0x1f;
			at_output[i_write + 17] = (x_left >>> 6) & 0x1f;
			at_output[i_write + 18] = (x_left >>> 1) & 0x1f;
			x_right = at_input[i_read + 3];
			at_output[i_write + 19] = ((x_left & 0x1) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 20] = (x_left >>> 23) & 0x1f;
			at_output[i_write + 21] = (x_left >>> 18) & 0x1f;
			at_output[i_write + 22] = (x_left >>> 13) & 0x1f;
			at_output[i_write + 23] = (x_left >>> 8) & 0x1f;
			at_output[i_write + 24] = (x_left >>> 3) & 0x1f;
			x_right = at_input[i_read + 4];
			at_output[i_write + 25] = ((x_left & 0x7) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 26] = (x_left >>> 25) & 0x1f;
			at_output[i_write + 27] = (x_left >>> 20) & 0x1f;
			at_output[i_write + 28] = (x_left >>> 15) & 0x1f;
			at_output[i_write + 29] = (x_left >>> 10) & 0x1f;
			at_output[i_write + 30] = (x_left >>> 5) & 0x1f;
			at_output[i_write + 31] = x_left & 0x1f;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 27) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 22) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 17) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 24) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 19) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 26) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 21) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 23) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 18) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 13) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 25) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 20) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 15) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x1f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x1f;
		return [at_output, i_byte_offset];
	},
	unpack_6_32(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 6 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 6) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 3, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 26;

			at_output[i_write + 1] = (x_left >>> 20) & 0x3f;
			at_output[i_write + 2] = (x_left >>> 14) & 0x3f;
			at_output[i_write + 3] = (x_left >>> 8) & 0x3f;
			at_output[i_write + 4] = (x_left >>> 2) & 0x3f;
			x_right = at_input[i_read + 1];
			at_output[i_write + 5] = ((x_left & 0x3) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 22) & 0x3f;
			at_output[i_write + 7] = (x_left >>> 16) & 0x3f;
			at_output[i_write + 8] = (x_left >>> 10) & 0x3f;
			at_output[i_write + 9] = (x_left >>> 4) & 0x3f;
			x_right = at_input[i_read + 2];
			at_output[i_write + 10] = ((x_left & 0xf) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 11] = (x_left >>> 24) & 0x3f;
			at_output[i_write + 12] = (x_left >>> 18) & 0x3f;
			at_output[i_write + 13] = (x_left >>> 12) & 0x3f;
			at_output[i_write + 14] = (x_left >>> 6) & 0x3f;
			at_output[i_write + 15] = x_left & 0x3f;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 26) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 20) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 22) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 24) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 18) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x3f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x3f;
		return [at_output, i_byte_offset];
	},
	unpack_7_32(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 7 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 7) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 7, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 25;

			at_output[i_write + 1] = (x_left >>> 18) & 0x7f;
			at_output[i_write + 2] = (x_left >>> 11) & 0x7f;
			at_output[i_write + 3] = (x_left >>> 4) & 0x7f;
			x_right = at_input[i_read + 1];
			at_output[i_write + 4] = ((x_left & 0xf) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 22) & 0x7f;
			at_output[i_write + 6] = (x_left >>> 15) & 0x7f;
			at_output[i_write + 7] = (x_left >>> 8) & 0x7f;
			at_output[i_write + 8] = (x_left >>> 1) & 0x7f;
			x_right = at_input[i_read + 2];
			at_output[i_write + 9] = ((x_left & 0x1) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 19) & 0x7f;
			at_output[i_write + 11] = (x_left >>> 12) & 0x7f;
			at_output[i_write + 12] = (x_left >>> 5) & 0x7f;
			x_right = at_input[i_read + 3];
			at_output[i_write + 13] = ((x_left & 0x1f) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 14] = (x_left >>> 23) & 0x7f;
			at_output[i_write + 15] = (x_left >>> 16) & 0x7f;
			at_output[i_write + 16] = (x_left >>> 9) & 0x7f;
			at_output[i_write + 17] = (x_left >>> 2) & 0x7f;
			x_right = at_input[i_read + 4];
			at_output[i_write + 18] = ((x_left & 0x3) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 19] = (x_left >>> 20) & 0x7f;
			at_output[i_write + 20] = (x_left >>> 13) & 0x7f;
			at_output[i_write + 21] = (x_left >>> 6) & 0x7f;
			x_right = at_input[i_read + 5];
			at_output[i_write + 22] = ((x_left & 0x3f) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 23] = (x_left >>> 24) & 0x7f;
			at_output[i_write + 24] = (x_left >>> 17) & 0x7f;
			at_output[i_write + 25] = (x_left >>> 10) & 0x7f;
			at_output[i_write + 26] = (x_left >>> 3) & 0x7f;
			x_right = at_input[i_read + 6];
			at_output[i_write + 27] = ((x_left & 0x7) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 28] = (x_left >>> 21) & 0x7f;
			at_output[i_write + 29] = (x_left >>> 14) & 0x7f;
			at_output[i_write + 30] = (x_left >>> 7) & 0x7f;
			at_output[i_write + 31] = x_left & 0x7f;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 25) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 18) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 22) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 15) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 19) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 23) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 20) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 13) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 24) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 17) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 21) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x7f;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x7f;
		return [at_output, i_byte_offset];
	},
	unpack_8_32(ab_input, i_read, n_items) {
		let at_output = new Uint8Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 8 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 8) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 4); i_read += 1, i_write += 4) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 24;

			at_output[i_write + 1] = (x_left >>> 16) & 0xff;
			at_output[i_write + 2] = (x_left >>> 8) & 0xff;
			at_output[i_write + 3] = x_left & 0xff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 24) & 0xff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0xff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0xff;
		return [at_output, i_byte_offset];
	},
	unpack_9_32(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 9 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 9) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 9, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 23;

			at_output[i_write + 1] = (x_left >>> 14) & 0x1ff;
			at_output[i_write + 2] = (x_left >>> 5) & 0x1ff;
			x_right = at_input[i_read + 1];
			at_output[i_write + 3] = ((x_left & 0x1f) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 4] = (x_left >>> 19) & 0x1ff;
			at_output[i_write + 5] = (x_left >>> 10) & 0x1ff;
			at_output[i_write + 6] = (x_left >>> 1) & 0x1ff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 7] = ((x_left & 0x1) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 8] = (x_left >>> 15) & 0x1ff;
			at_output[i_write + 9] = (x_left >>> 6) & 0x1ff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 10] = ((x_left & 0x3f) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 11] = (x_left >>> 20) & 0x1ff;
			at_output[i_write + 12] = (x_left >>> 11) & 0x1ff;
			at_output[i_write + 13] = (x_left >>> 2) & 0x1ff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 14] = ((x_left & 0x3) << 7) | (x_right >>> 25);
			x_left = x_right;
			at_output[i_write + 15] = (x_left >>> 16) & 0x1ff;
			at_output[i_write + 16] = (x_left >>> 7) & 0x1ff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 17] = ((x_left & 0x7f) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 18] = (x_left >>> 21) & 0x1ff;
			at_output[i_write + 19] = (x_left >>> 12) & 0x1ff;
			at_output[i_write + 20] = (x_left >>> 3) & 0x1ff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 21] = ((x_left & 0x7) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 22] = (x_left >>> 17) & 0x1ff;
			at_output[i_write + 23] = (x_left >>> 8) & 0x1ff;
			x_right = at_input[i_read + 7];
			at_output[i_write + 24] = ((x_left & 0xff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 25] = (x_left >>> 22) & 0x1ff;
			at_output[i_write + 26] = (x_left >>> 13) & 0x1ff;
			at_output[i_write + 27] = (x_left >>> 4) & 0x1ff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 28] = ((x_left & 0xf) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 29] = (x_left >>> 18) & 0x1ff;
			at_output[i_write + 30] = (x_left >>> 9) & 0x1ff;
			at_output[i_write + 31] = x_left & 0x1ff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 23) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 19) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 15) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 20) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 21) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 17) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 22) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 13) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 18) & 0x1ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x1ff;
		return [at_output, i_byte_offset];
	},
	unpack_10_32(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 10 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 10) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 5, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 22;

			at_output[i_write + 1] = (x_left >>> 12) & 0x3ff;
			at_output[i_write + 2] = (x_left >>> 2) & 0x3ff;
			x_right = at_input[i_read + 1];
			at_output[i_write + 3] = ((x_left & 0x3) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 4] = (x_left >>> 14) & 0x3ff;
			at_output[i_write + 5] = (x_left >>> 4) & 0x3ff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 6] = ((x_left & 0xf) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 7] = (x_left >>> 16) & 0x3ff;
			at_output[i_write + 8] = (x_left >>> 6) & 0x3ff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 9] = ((x_left & 0x3f) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 18) & 0x3ff;
			at_output[i_write + 11] = (x_left >>> 8) & 0x3ff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 12] = ((x_left & 0xff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 13] = (x_left >>> 20) & 0x3ff;
			at_output[i_write + 14] = (x_left >>> 10) & 0x3ff;
			at_output[i_write + 15] = x_left & 0x3ff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 22) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 18) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 20) & 0x3ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x3ff;
		return [at_output, i_byte_offset];
	},
	unpack_11_32(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 11 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 11) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 11, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 21;

			at_output[i_write + 1] = (x_left >>> 10) & 0x7ff;
			x_right = at_input[i_read + 1];
			at_output[i_write + 2] = ((x_left & 0x3ff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 20) & 0x7ff;
			at_output[i_write + 4] = (x_left >>> 9) & 0x7ff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 5] = ((x_left & 0x1ff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 19) & 0x7ff;
			at_output[i_write + 7] = (x_left >>> 8) & 0x7ff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 8] = ((x_left & 0xff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 9] = (x_left >>> 18) & 0x7ff;
			at_output[i_write + 10] = (x_left >>> 7) & 0x7ff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 11] = ((x_left & 0x7f) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 12] = (x_left >>> 17) & 0x7ff;
			at_output[i_write + 13] = (x_left >>> 6) & 0x7ff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 14] = ((x_left & 0x3f) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 15] = (x_left >>> 16) & 0x7ff;
			at_output[i_write + 16] = (x_left >>> 5) & 0x7ff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 17] = ((x_left & 0x1f) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 18] = (x_left >>> 15) & 0x7ff;
			at_output[i_write + 19] = (x_left >>> 4) & 0x7ff;
			x_right = at_input[i_read + 7];
			at_output[i_write + 20] = ((x_left & 0xf) << 7) | (x_right >>> 25);
			x_left = x_right;
			at_output[i_write + 21] = (x_left >>> 14) & 0x7ff;
			at_output[i_write + 22] = (x_left >>> 3) & 0x7ff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 23] = ((x_left & 0x7) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 24] = (x_left >>> 13) & 0x7ff;
			at_output[i_write + 25] = (x_left >>> 2) & 0x7ff;
			x_right = at_input[i_read + 9];
			at_output[i_write + 26] = ((x_left & 0x3) << 9) | (x_right >>> 23);
			x_left = x_right;
			at_output[i_write + 27] = (x_left >>> 12) & 0x7ff;
			at_output[i_write + 28] = (x_left >>> 1) & 0x7ff;
			x_right = at_input[i_read + 10];
			at_output[i_write + 29] = ((x_left & 0x1) << 10) | (x_right >>> 22);
			x_left = x_right;
			at_output[i_write + 30] = (x_left >>> 11) & 0x7ff;
			at_output[i_write + 31] = x_left & 0x7ff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 21) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 20) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 19) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 18) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 17) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 15) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 13) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7ff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x7ff;
		return [at_output, i_byte_offset];
	},
	unpack_12_32(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 12 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 12) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 8); i_read += 3, i_write += 8) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 20;

			at_output[i_write + 1] = (x_left >>> 8) & 0xfff;
			x_right = at_input[i_read + 1];
			at_output[i_write + 2] = ((x_left & 0xff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 16) & 0xfff;
			at_output[i_write + 4] = (x_left >>> 4) & 0xfff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 5] = ((x_left & 0xf) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 12) & 0xfff;
			at_output[i_write + 7] = x_left & 0xfff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 20) & 0xfff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0xfff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0xfff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0xfff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0xfff;
		return [at_output, i_byte_offset];
	},
	unpack_13_32(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 13 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 13) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 13, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 19;

			at_output[i_write + 1] = (x_left >>> 6) & 0x1fff;
			x_right = at_input[i_read + 1];
			at_output[i_write + 2] = ((x_left & 0x3f) << 7) | (x_right >>> 25);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 12) & 0x1fff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 4] = ((x_left & 0xfff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 18) & 0x1fff;
			at_output[i_write + 6] = (x_left >>> 5) & 0x1fff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 7] = ((x_left & 0x1f) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 8] = (x_left >>> 11) & 0x1fff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 9] = ((x_left & 0x7ff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 17) & 0x1fff;
			at_output[i_write + 11] = (x_left >>> 4) & 0x1fff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 12] = ((x_left & 0xf) << 9) | (x_right >>> 23);
			x_left = x_right;
			at_output[i_write + 13] = (x_left >>> 10) & 0x1fff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 14] = ((x_left & 0x3ff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 15] = (x_left >>> 16) & 0x1fff;
			at_output[i_write + 16] = (x_left >>> 3) & 0x1fff;
			x_right = at_input[i_read + 7];
			at_output[i_write + 17] = ((x_left & 0x7) << 10) | (x_right >>> 22);
			x_left = x_right;
			at_output[i_write + 18] = (x_left >>> 9) & 0x1fff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 19] = ((x_left & 0x1ff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 20] = (x_left >>> 15) & 0x1fff;
			at_output[i_write + 21] = (x_left >>> 2) & 0x1fff;
			x_right = at_input[i_read + 9];
			at_output[i_write + 22] = ((x_left & 0x3) << 11) | (x_right >>> 21);
			x_left = x_right;
			at_output[i_write + 23] = (x_left >>> 8) & 0x1fff;
			x_right = at_input[i_read + 10];
			at_output[i_write + 24] = ((x_left & 0xff) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 25] = (x_left >>> 14) & 0x1fff;
			at_output[i_write + 26] = (x_left >>> 1) & 0x1fff;
			x_right = at_input[i_read + 11];
			at_output[i_write + 27] = ((x_left & 0x1) << 12) | (x_right >>> 20);
			x_left = x_right;
			at_output[i_write + 28] = (x_left >>> 7) & 0x1fff;
			x_right = at_input[i_read + 12];
			at_output[i_write + 29] = ((x_left & 0x7f) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 30] = (x_left >>> 13) & 0x1fff;
			at_output[i_write + 31] = x_left & 0x1fff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 19) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 18) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 17) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 15) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 11) | (x_right >>> 21);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x1fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 13) & 0x1fff;
		return [at_output, i_byte_offset];
	},
	unpack_14_32(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 14 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 14) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 7, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 18;

			at_output[i_write + 1] = (x_left >>> 4) & 0x3fff;
			x_right = at_input[i_read + 1];
			at_output[i_write + 2] = ((x_left & 0xf) << 10) | (x_right >>> 22);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 8) & 0x3fff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 4] = ((x_left & 0xff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 12) & 0x3fff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 6] = ((x_left & 0xfff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 7] = (x_left >>> 16) & 0x3fff;
			at_output[i_write + 8] = (x_left >>> 2) & 0x3fff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 9] = ((x_left & 0x3) << 12) | (x_right >>> 20);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 6) & 0x3fff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 11] = ((x_left & 0x3f) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 12] = (x_left >>> 10) & 0x3fff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 13] = ((x_left & 0x3ff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 14] = (x_left >>> 14) & 0x3fff;
			at_output[i_write + 15] = x_left & 0x3fff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 18) & 0x3fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x3fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x3fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x3fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x3fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x3fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x3fff;
		return [at_output, i_byte_offset];
	},
	unpack_15_32(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 15 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 15) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 15, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 17;

			at_output[i_write + 1] = (x_left >>> 2) & 0x7fff;
			x_right = at_input[i_read + 1];
			at_output[i_write + 2] = ((x_left & 0x3) << 13) | (x_right >>> 19);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 4) & 0x7fff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 4] = ((x_left & 0xf) << 11) | (x_right >>> 21);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 6) & 0x7fff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 6] = ((x_left & 0x3f) << 9) | (x_right >>> 23);
			x_left = x_right;
			at_output[i_write + 7] = (x_left >>> 8) & 0x7fff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 8] = ((x_left & 0xff) << 7) | (x_right >>> 25);
			x_left = x_right;
			at_output[i_write + 9] = (x_left >>> 10) & 0x7fff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 10] = ((x_left & 0x3ff) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 11] = (x_left >>> 12) & 0x7fff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 12] = ((x_left & 0xfff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 13] = (x_left >>> 14) & 0x7fff;
			x_right = at_input[i_read + 7];
			at_output[i_write + 14] = ((x_left & 0x3fff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 15] = (x_left >>> 16) & 0x7fff;
			at_output[i_write + 16] = (x_left >>> 1) & 0x7fff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 17] = ((x_left & 0x1) << 14) | (x_right >>> 18);
			x_left = x_right;
			at_output[i_write + 18] = (x_left >>> 3) & 0x7fff;
			x_right = at_input[i_read + 9];
			at_output[i_write + 19] = ((x_left & 0x7) << 12) | (x_right >>> 20);
			x_left = x_right;
			at_output[i_write + 20] = (x_left >>> 5) & 0x7fff;
			x_right = at_input[i_read + 10];
			at_output[i_write + 21] = ((x_left & 0x1f) << 10) | (x_right >>> 22);
			x_left = x_right;
			at_output[i_write + 22] = (x_left >>> 7) & 0x7fff;
			x_right = at_input[i_read + 11];
			at_output[i_write + 23] = ((x_left & 0x7f) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 24] = (x_left >>> 9) & 0x7fff;
			x_right = at_input[i_read + 12];
			at_output[i_write + 25] = ((x_left & 0x1ff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 26] = (x_left >>> 11) & 0x7fff;
			x_right = at_input[i_read + 13];
			at_output[i_write + 27] = ((x_left & 0x7ff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 28] = (x_left >>> 13) & 0x7fff;
			x_right = at_input[i_read + 14];
			at_output[i_write + 29] = ((x_left & 0x1fff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 30] = (x_left >>> 15) & 0x7fff;
			at_output[i_write + 31] = x_left & 0x7fff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 17) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 13) | (x_right >>> 19);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 11) | (x_right >>> 21);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 16) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 13) & 0x7fff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 15) & 0x7fff;
		return [at_output, i_byte_offset];
	},
	unpack_16_32(ab_input, i_read, n_items) {
		let at_output = new Uint16Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 16 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 16) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 2); i_read += 1, i_write += 2) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 16;

			at_output[i_write + 1] = x_left & 0xffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 16) & 0xffff;
		return [at_output, i_byte_offset];
	},
	unpack_17_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 17 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 17) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 17, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 15;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x7fff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 2] = (x_left >>> 13) & 0x1ffff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 3] = ((x_left & 0x1fff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 4] = (x_left >>> 11) & 0x1ffff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 5] = ((x_left & 0x7ff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 9) & 0x1ffff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 7] = ((x_left & 0x1ff) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 8] = (x_left >>> 7) & 0x1ffff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 9] = ((x_left & 0x7f) << 10) | (x_right >>> 22);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 5) & 0x1ffff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 11] = ((x_left & 0x1f) << 12) | (x_right >>> 20);
			x_left = x_right;
			at_output[i_write + 12] = (x_left >>> 3) & 0x1ffff;
			x_right = at_input[i_read + 7];
			at_output[i_write + 13] = ((x_left & 0x7) << 14) | (x_right >>> 18);
			x_left = x_right;
			at_output[i_write + 14] = (x_left >>> 1) & 0x1ffff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 15] = ((x_left & 0x1) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 9];
			at_output[i_write + 16] = ((x_left & 0xffff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 17] = (x_left >>> 14) & 0x1ffff;
			x_right = at_input[i_read + 10];
			at_output[i_write + 18] = ((x_left & 0x3fff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 19] = (x_left >>> 12) & 0x1ffff;
			x_right = at_input[i_read + 11];
			at_output[i_write + 20] = ((x_left & 0xfff) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 21] = (x_left >>> 10) & 0x1ffff;
			x_right = at_input[i_read + 12];
			at_output[i_write + 22] = ((x_left & 0x3ff) << 7) | (x_right >>> 25);
			x_left = x_right;
			at_output[i_write + 23] = (x_left >>> 8) & 0x1ffff;
			x_right = at_input[i_read + 13];
			at_output[i_write + 24] = ((x_left & 0xff) << 9) | (x_right >>> 23);
			x_left = x_right;
			at_output[i_write + 25] = (x_left >>> 6) & 0x1ffff;
			x_right = at_input[i_read + 14];
			at_output[i_write + 26] = ((x_left & 0x3f) << 11) | (x_right >>> 21);
			x_left = x_right;
			at_output[i_write + 27] = (x_left >>> 4) & 0x1ffff;
			x_right = at_input[i_read + 15];
			at_output[i_write + 28] = ((x_left & 0xf) << 13) | (x_right >>> 19);
			x_left = x_right;
			at_output[i_write + 29] = (x_left >>> 2) & 0x1ffff;
			x_right = at_input[i_read + 16];
			at_output[i_write + 30] = ((x_left & 0x3) << 15) | (x_right >>> 17);
			x_left = x_right;
			at_output[i_write + 31] = x_left & 0x1ffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 15) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 13) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 14) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 11) | (x_right >>> 21);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 13) | (x_right >>> 19);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 15) | (x_right >>> 17);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_18_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 18 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 18) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 9, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 14;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x3fff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 2] = (x_left >>> 10) & 0x3ffff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 3] = ((x_left & 0x3ff) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 4] = (x_left >>> 6) & 0x3ffff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 5] = ((x_left & 0x3f) << 12) | (x_right >>> 20);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 2) & 0x3ffff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 7] = ((x_left & 0x3) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 8] = ((x_left & 0xffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 9] = (x_left >>> 12) & 0x3ffff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 10] = ((x_left & 0xfff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 11] = (x_left >>> 8) & 0x3ffff;
			x_right = at_input[i_read + 7];
			at_output[i_write + 12] = ((x_left & 0xff) << 10) | (x_right >>> 22);
			x_left = x_right;
			at_output[i_write + 13] = (x_left >>> 4) & 0x3ffff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 14] = ((x_left & 0xf) << 14) | (x_right >>> 18);
			x_left = x_right;
			at_output[i_write + 15] = x_left & 0x3ffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 14) & 0x3ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x3ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x3ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x3ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x3ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 14) | (x_right >>> 18);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_19_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 19 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 19) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 19, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 13;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x1fff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 2] = (x_left >>> 7) & 0x7ffff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 3] = ((x_left & 0x7f) << 12) | (x_right >>> 20);
			x_left = x_right;
			at_output[i_write + 4] = (x_left >>> 1) & 0x7ffff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 5] = ((x_left & 0x1) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 6] = ((x_left & 0x3fff) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 7] = (x_left >>> 8) & 0x7ffff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 8] = ((x_left & 0xff) << 11) | (x_right >>> 21);
			x_left = x_right;
			at_output[i_write + 9] = (x_left >>> 2) & 0x7ffff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 10] = ((x_left & 0x3) << 17) | (x_right >>> 15);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 11] = ((x_left & 0x7fff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 12] = (x_left >>> 9) & 0x7ffff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 13] = ((x_left & 0x1ff) << 10) | (x_right >>> 22);
			x_left = x_right;
			at_output[i_write + 14] = (x_left >>> 3) & 0x7ffff;
			x_right = at_input[i_read + 9];
			at_output[i_write + 15] = ((x_left & 0x7) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 16] = ((x_left & 0xffff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 17] = (x_left >>> 10) & 0x7ffff;
			x_right = at_input[i_read + 11];
			at_output[i_write + 18] = ((x_left & 0x3ff) << 9) | (x_right >>> 23);
			x_left = x_right;
			at_output[i_write + 19] = (x_left >>> 4) & 0x7ffff;
			x_right = at_input[i_read + 12];
			at_output[i_write + 20] = ((x_left & 0xf) << 15) | (x_right >>> 17);
			x_left = x_right;
			x_right = at_input[i_read + 13];
			at_output[i_write + 21] = ((x_left & 0x1ffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 22] = (x_left >>> 11) & 0x7ffff;
			x_right = at_input[i_read + 14];
			at_output[i_write + 23] = ((x_left & 0x7ff) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 24] = (x_left >>> 5) & 0x7ffff;
			x_right = at_input[i_read + 15];
			at_output[i_write + 25] = ((x_left & 0x1f) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 16];
			at_output[i_write + 26] = ((x_left & 0x3ffff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 27] = (x_left >>> 12) & 0x7ffff;
			x_right = at_input[i_read + 17];
			at_output[i_write + 28] = ((x_left & 0xfff) << 7) | (x_right >>> 25);
			x_left = x_right;
			at_output[i_write + 29] = (x_left >>> 6) & 0x7ffff;
			x_right = at_input[i_read + 18];
			at_output[i_write + 30] = ((x_left & 0x3f) << 13) | (x_right >>> 19);
			x_left = x_right;
			at_output[i_write + 31] = x_left & 0x7ffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 13) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 11) | (x_right >>> 21);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 17) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 15) | (x_right >>> 17);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 11) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 12) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x7ffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 13) | (x_right >>> 19);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_20_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 20 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 20) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 8); i_read += 5, i_write += 8) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 12;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0xfff) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 2] = (x_left >>> 4) & 0xfffff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 3] = ((x_left & 0xf) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 4] = ((x_left & 0xffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 8) & 0xfffff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 6] = ((x_left & 0xff) << 12) | (x_right >>> 20);
			x_left = x_right;
			at_output[i_write + 7] = x_left & 0xfffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 12) & 0xfffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0xfffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0xfffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 12) | (x_right >>> 20);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_21_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 21 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 21) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 21, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 11;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x7ff) << 10) | (x_right >>> 22);
			x_left = x_right;
			at_output[i_write + 2] = (x_left >>> 1) & 0x1fffff;
			x_right = at_input[i_read + 2];
			at_output[i_write + 3] = ((x_left & 0x1) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 4] = ((x_left & 0xfff) << 9) | (x_right >>> 23);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 2) & 0x1fffff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 6] = ((x_left & 0x3) << 19) | (x_right >>> 13);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 7] = ((x_left & 0x1fff) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 8] = (x_left >>> 3) & 0x1fffff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 9] = ((x_left & 0x7) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 10] = ((x_left & 0x3fff) << 7) | (x_right >>> 25);
			x_left = x_right;
			at_output[i_write + 11] = (x_left >>> 4) & 0x1fffff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 12] = ((x_left & 0xf) << 17) | (x_right >>> 15);
			x_left = x_right;
			x_right = at_input[i_read + 9];
			at_output[i_write + 13] = ((x_left & 0x7fff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 14] = (x_left >>> 5) & 0x1fffff;
			x_right = at_input[i_read + 10];
			at_output[i_write + 15] = ((x_left & 0x1f) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 11];
			at_output[i_write + 16] = ((x_left & 0xffff) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 17] = (x_left >>> 6) & 0x1fffff;
			x_right = at_input[i_read + 12];
			at_output[i_write + 18] = ((x_left & 0x3f) << 15) | (x_right >>> 17);
			x_left = x_right;
			x_right = at_input[i_read + 13];
			at_output[i_write + 19] = ((x_left & 0x1ffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 20] = (x_left >>> 7) & 0x1fffff;
			x_right = at_input[i_read + 14];
			at_output[i_write + 21] = ((x_left & 0x7f) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 15];
			at_output[i_write + 22] = ((x_left & 0x3ffff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 23] = (x_left >>> 8) & 0x1fffff;
			x_right = at_input[i_read + 16];
			at_output[i_write + 24] = ((x_left & 0xff) << 13) | (x_right >>> 19);
			x_left = x_right;
			x_right = at_input[i_read + 17];
			at_output[i_write + 25] = ((x_left & 0x7ffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 26] = (x_left >>> 9) & 0x1fffff;
			x_right = at_input[i_read + 18];
			at_output[i_write + 27] = ((x_left & 0x1ff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 19];
			at_output[i_write + 28] = ((x_left & 0xfffff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 29] = (x_left >>> 10) & 0x1fffff;
			x_right = at_input[i_read + 20];
			at_output[i_write + 30] = ((x_left & 0x3ff) << 11) | (x_right >>> 21);
			x_left = x_right;
			at_output[i_write + 31] = x_left & 0x1fffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 11) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 19) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 17) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 15) | (x_right >>> 17);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 13) | (x_right >>> 19);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 9) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 10) & 0x1fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 11) | (x_right >>> 21);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_22_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 22 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 22) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 11, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 10;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x3ff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0xfffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 8) & 0x3fffff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 4] = ((x_left & 0xff) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 5] = ((x_left & 0x3ffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 6) & 0x3fffff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 7] = ((x_left & 0x3f) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 8] = ((x_left & 0xffff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 9] = (x_left >>> 4) & 0x3fffff;
			x_right = at_input[i_read + 7];
			at_output[i_write + 10] = ((x_left & 0xf) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 8];
			at_output[i_write + 11] = ((x_left & 0x3fff) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 12] = (x_left >>> 2) & 0x3fffff;
			x_right = at_input[i_read + 9];
			at_output[i_write + 13] = ((x_left & 0x3) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 14] = ((x_left & 0xfff) << 10) | (x_right >>> 22);
			x_left = x_right;
			at_output[i_write + 15] = x_left & 0x3fffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 10) & 0x3fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x3fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x3fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 10) | (x_right >>> 22);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_23_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 23 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 23) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 23, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 9;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x1ff) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0x3ffff) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 3] = (x_left >>> 4) & 0x7fffff;
			x_right = at_input[i_read + 3];
			at_output[i_write + 4] = ((x_left & 0xf) << 19) | (x_right >>> 13);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 5] = ((x_left & 0x1fff) << 10) | (x_right >>> 22);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 6] = ((x_left & 0x3fffff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 7] = (x_left >>> 8) & 0x7fffff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 8] = ((x_left & 0xff) << 15) | (x_right >>> 17);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 9] = ((x_left & 0x1ffff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 3) & 0x7fffff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 11] = ((x_left & 0x7) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 9];
			at_output[i_write + 12] = ((x_left & 0xfff) << 11) | (x_right >>> 21);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 13] = ((x_left & 0x1fffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 14] = (x_left >>> 7) & 0x7fffff;
			x_right = at_input[i_read + 11];
			at_output[i_write + 15] = ((x_left & 0x7f) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 12];
			at_output[i_write + 16] = ((x_left & 0xffff) << 7) | (x_right >>> 25);
			x_left = x_right;
			at_output[i_write + 17] = (x_left >>> 2) & 0x7fffff;
			x_right = at_input[i_read + 13];
			at_output[i_write + 18] = ((x_left & 0x3) << 21) | (x_right >>> 11);
			x_left = x_right;
			x_right = at_input[i_read + 14];
			at_output[i_write + 19] = ((x_left & 0x7ff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 15];
			at_output[i_write + 20] = ((x_left & 0xfffff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 21] = (x_left >>> 6) & 0x7fffff;
			x_right = at_input[i_read + 16];
			at_output[i_write + 22] = ((x_left & 0x3f) << 17) | (x_right >>> 15);
			x_left = x_right;
			x_right = at_input[i_read + 17];
			at_output[i_write + 23] = ((x_left & 0x7fff) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 24] = (x_left >>> 1) & 0x7fffff;
			x_right = at_input[i_read + 18];
			at_output[i_write + 25] = ((x_left & 0x1) << 22) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 19];
			at_output[i_write + 26] = ((x_left & 0x3ff) << 13) | (x_right >>> 19);
			x_left = x_right;
			x_right = at_input[i_read + 20];
			at_output[i_write + 27] = ((x_left & 0x7ffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 28] = (x_left >>> 5) & 0x7fffff;
			x_right = at_input[i_read + 21];
			at_output[i_write + 29] = ((x_left & 0x1f) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 22];
			at_output[i_write + 30] = ((x_left & 0x3fff) << 9) | (x_right >>> 23);
			x_left = x_right;
			at_output[i_write + 31] = x_left & 0x7fffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 9) & 0x7fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 19) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fffff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 8) & 0x7fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 15) | (x_right >>> 17);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 11) | (x_right >>> 21);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 7) & 0x7fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 21) | (x_right >>> 11);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x7fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 17) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 22) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 13) | (x_right >>> 19);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x7fffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 9) | (x_right >>> 23);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_24_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 24 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 24) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 4); i_read += 3, i_write += 4) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 8;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0xff) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0xffff) << 8) | (x_right >>> 24);
			x_left = x_right;
			at_output[i_write + 3] = x_left & 0xffffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 8) & 0xffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 8) | (x_right >>> 24);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_25_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 25 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 25) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 25, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 7;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x7f) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0x3fff) << 11) | (x_right >>> 21);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0x1fffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 4] = (x_left >>> 3) & 0x1ffffff;
			x_right = at_input[i_read + 4];
			at_output[i_write + 5] = ((x_left & 0x7) << 22) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 6] = ((x_left & 0x3ff) << 15) | (x_right >>> 17);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 7] = ((x_left & 0x1ffff) << 8) | (x_right >>> 24);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 8] = ((x_left & 0xffffff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 9] = (x_left >>> 6) & 0x1ffffff;
			x_right = at_input[i_read + 8];
			at_output[i_write + 10] = ((x_left & 0x3f) << 19) | (x_right >>> 13);
			x_left = x_right;
			x_right = at_input[i_read + 9];
			at_output[i_write + 11] = ((x_left & 0x1fff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 12] = ((x_left & 0xfffff) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 13] = (x_left >>> 2) & 0x1ffffff;
			x_right = at_input[i_read + 11];
			at_output[i_write + 14] = ((x_left & 0x3) << 23) | (x_right >>> 9);
			x_left = x_right;
			x_right = at_input[i_read + 12];
			at_output[i_write + 15] = ((x_left & 0x1ff) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 13];
			at_output[i_write + 16] = ((x_left & 0xffff) << 9) | (x_right >>> 23);
			x_left = x_right;
			x_right = at_input[i_read + 14];
			at_output[i_write + 17] = ((x_left & 0x7fffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 18] = (x_left >>> 5) & 0x1ffffff;
			x_right = at_input[i_read + 15];
			at_output[i_write + 19] = ((x_left & 0x1f) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 16];
			at_output[i_write + 20] = ((x_left & 0xfff) << 13) | (x_right >>> 19);
			x_left = x_right;
			x_right = at_input[i_read + 17];
			at_output[i_write + 21] = ((x_left & 0x7ffff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 22] = (x_left >>> 1) & 0x1ffffff;
			x_right = at_input[i_read + 18];
			at_output[i_write + 23] = ((x_left & 0x1) << 24) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 19];
			at_output[i_write + 24] = ((x_left & 0xff) << 17) | (x_right >>> 15);
			x_left = x_right;
			x_right = at_input[i_read + 20];
			at_output[i_write + 25] = ((x_left & 0x7fff) << 10) | (x_right >>> 22);
			x_left = x_right;
			x_right = at_input[i_read + 21];
			at_output[i_write + 26] = ((x_left & 0x3fffff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 27] = (x_left >>> 4) & 0x1ffffff;
			x_right = at_input[i_read + 22];
			at_output[i_write + 28] = ((x_left & 0xf) << 21) | (x_right >>> 11);
			x_left = x_right;
			x_right = at_input[i_read + 23];
			at_output[i_write + 29] = ((x_left & 0x7ff) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 24];
			at_output[i_write + 30] = ((x_left & 0x3ffff) << 7) | (x_right >>> 25);
			x_left = x_right;
			at_output[i_write + 31] = x_left & 0x1ffffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 7) & 0x1ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 11) | (x_right >>> 21);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x1ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 22) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 15) | (x_right >>> 17);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffffff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 6) & 0x1ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 19) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 23) | (x_right >>> 9);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 5) & 0x1ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 13) | (x_right >>> 19);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ffff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 24) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 17) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fffff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x1ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 21) | (x_right >>> 11);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 7) | (x_right >>> 25);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_26_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 26 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 26) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 13, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 6;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x3f) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0xfff) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0x3ffff) << 8) | (x_right >>> 24);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 4] = ((x_left & 0xffffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 5] = (x_left >>> 4) & 0x3ffffff;
			x_right = at_input[i_read + 5];
			at_output[i_write + 6] = ((x_left & 0xf) << 22) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 7] = ((x_left & 0x3ff) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 8] = ((x_left & 0xffff) << 10) | (x_right >>> 22);
			x_left = x_right;
			x_right = at_input[i_read + 8];
			at_output[i_write + 9] = ((x_left & 0x3fffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 2) & 0x3ffffff;
			x_right = at_input[i_read + 9];
			at_output[i_write + 11] = ((x_left & 0x3) << 24) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 12] = ((x_left & 0xff) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 11];
			at_output[i_write + 13] = ((x_left & 0x3fff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 12];
			at_output[i_write + 14] = ((x_left & 0xfffff) << 6) | (x_right >>> 26);
			x_left = x_right;
			at_output[i_write + 15] = x_left & 0x3ffffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 6) & 0x3ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x3ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 22) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x3ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 24) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 6) | (x_right >>> 26);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_27_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 27 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 27) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 27, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 5;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x1f) << 22) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0x3ff) << 17) | (x_right >>> 15);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0x7fff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 4] = ((x_left & 0xfffff) << 7) | (x_right >>> 25);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 5] = ((x_left & 0x1ffffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 6] = (x_left >>> 3) & 0x7ffffff;
			x_right = at_input[i_read + 6];
			at_output[i_write + 7] = ((x_left & 0x7) << 24) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 8] = ((x_left & 0xff) << 19) | (x_right >>> 13);
			x_left = x_right;
			x_right = at_input[i_read + 8];
			at_output[i_write + 9] = ((x_left & 0x1fff) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 9];
			at_output[i_write + 10] = ((x_left & 0x3ffff) << 9) | (x_right >>> 23);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 11] = ((x_left & 0x7fffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 12] = (x_left >>> 1) & 0x7ffffff;
			x_right = at_input[i_read + 11];
			at_output[i_write + 13] = ((x_left & 0x1) << 26) | (x_right >>> 6);
			x_left = x_right;
			x_right = at_input[i_read + 12];
			at_output[i_write + 14] = ((x_left & 0x3f) << 21) | (x_right >>> 11);
			x_left = x_right;
			x_right = at_input[i_read + 13];
			at_output[i_write + 15] = ((x_left & 0x7ff) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 14];
			at_output[i_write + 16] = ((x_left & 0xffff) << 11) | (x_right >>> 21);
			x_left = x_right;
			x_right = at_input[i_read + 15];
			at_output[i_write + 17] = ((x_left & 0x1fffff) << 6) | (x_right >>> 26);
			x_left = x_right;
			x_right = at_input[i_read + 16];
			at_output[i_write + 18] = ((x_left & 0x3ffffff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 19] = (x_left >>> 4) & 0x7ffffff;
			x_right = at_input[i_read + 17];
			at_output[i_write + 20] = ((x_left & 0xf) << 23) | (x_right >>> 9);
			x_left = x_right;
			x_right = at_input[i_read + 18];
			at_output[i_write + 21] = ((x_left & 0x1ff) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 19];
			at_output[i_write + 22] = ((x_left & 0x3fff) << 13) | (x_right >>> 19);
			x_left = x_right;
			x_right = at_input[i_read + 20];
			at_output[i_write + 23] = ((x_left & 0x7ffff) << 8) | (x_right >>> 24);
			x_left = x_right;
			x_right = at_input[i_read + 21];
			at_output[i_write + 24] = ((x_left & 0xffffff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 25] = (x_left >>> 2) & 0x7ffffff;
			x_right = at_input[i_read + 22];
			at_output[i_write + 26] = ((x_left & 0x3) << 25) | (x_right >>> 7);
			x_left = x_right;
			x_right = at_input[i_read + 23];
			at_output[i_write + 27] = ((x_left & 0x7f) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 24];
			at_output[i_write + 28] = ((x_left & 0xfff) << 15) | (x_right >>> 17);
			x_left = x_right;
			x_right = at_input[i_read + 25];
			at_output[i_write + 29] = ((x_left & 0x1ffff) << 10) | (x_right >>> 22);
			x_left = x_right;
			x_right = at_input[i_read + 26];
			at_output[i_write + 30] = ((x_left & 0x3fffff) << 5) | (x_right >>> 27);
			x_left = x_right;
			at_output[i_write + 31] = x_left & 0x7ffffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 5) & 0x7ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 22) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 17) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 3) & 0x7ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 24) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 19) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x7ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 26) | (x_right >>> 6);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 21) | (x_right >>> 11);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 11) | (x_right >>> 21);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fffff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffffff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 4) & 0x7ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 23) | (x_right >>> 9);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 13) | (x_right >>> 19);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ffff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffffff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x7ffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 25) | (x_right >>> 7);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 15) | (x_right >>> 17);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fffff) << 5) | (x_right >>> 27);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_28_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 28 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 28) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 8); i_read += 7, i_write += 8) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 4;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0xf) << 24) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0xff) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0xfff) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 4] = ((x_left & 0xffff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 5] = ((x_left & 0xfffff) << 8) | (x_right >>> 24);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 6] = ((x_left & 0xffffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			at_output[i_write + 7] = x_left & 0xfffffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 4) & 0xfffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 24) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_29_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 29 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 29) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 29, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 3;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x7) << 26) | (x_right >>> 6);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0x3f) << 23) | (x_right >>> 9);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0x1ff) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 4] = ((x_left & 0xfff) << 17) | (x_right >>> 15);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 5] = ((x_left & 0x7fff) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 6] = ((x_left & 0x3ffff) << 11) | (x_right >>> 21);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 7] = ((x_left & 0x1fffff) << 8) | (x_right >>> 24);
			x_left = x_right;
			x_right = at_input[i_read + 8];
			at_output[i_write + 8] = ((x_left & 0xffffff) << 5) | (x_right >>> 27);
			x_left = x_right;
			x_right = at_input[i_read + 9];
			at_output[i_write + 9] = ((x_left & 0x7ffffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 10] = (x_left >>> 1) & 0x1fffffff;
			x_right = at_input[i_read + 10];
			at_output[i_write + 11] = ((x_left & 0x1) << 28) | (x_right >>> 4);
			x_left = x_right;
			x_right = at_input[i_read + 11];
			at_output[i_write + 12] = ((x_left & 0xf) << 25) | (x_right >>> 7);
			x_left = x_right;
			x_right = at_input[i_read + 12];
			at_output[i_write + 13] = ((x_left & 0x7f) << 22) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 13];
			at_output[i_write + 14] = ((x_left & 0x3ff) << 19) | (x_right >>> 13);
			x_left = x_right;
			x_right = at_input[i_read + 14];
			at_output[i_write + 15] = ((x_left & 0x1fff) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 15];
			at_output[i_write + 16] = ((x_left & 0xffff) << 13) | (x_right >>> 19);
			x_left = x_right;
			x_right = at_input[i_read + 16];
			at_output[i_write + 17] = ((x_left & 0x7ffff) << 10) | (x_right >>> 22);
			x_left = x_right;
			x_right = at_input[i_read + 17];
			at_output[i_write + 18] = ((x_left & 0x3fffff) << 7) | (x_right >>> 25);
			x_left = x_right;
			x_right = at_input[i_read + 18];
			at_output[i_write + 19] = ((x_left & 0x1ffffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			x_right = at_input[i_read + 19];
			at_output[i_write + 20] = ((x_left & 0xfffffff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 21] = (x_left >>> 2) & 0x1fffffff;
			x_right = at_input[i_read + 20];
			at_output[i_write + 22] = ((x_left & 0x3) << 27) | (x_right >>> 5);
			x_left = x_right;
			x_right = at_input[i_read + 21];
			at_output[i_write + 23] = ((x_left & 0x1f) << 24) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 22];
			at_output[i_write + 24] = ((x_left & 0xff) << 21) | (x_right >>> 11);
			x_left = x_right;
			x_right = at_input[i_read + 23];
			at_output[i_write + 25] = ((x_left & 0x7ff) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 24];
			at_output[i_write + 26] = ((x_left & 0x3fff) << 15) | (x_right >>> 17);
			x_left = x_right;
			x_right = at_input[i_read + 25];
			at_output[i_write + 27] = ((x_left & 0x1ffff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 26];
			at_output[i_write + 28] = ((x_left & 0xfffff) << 9) | (x_right >>> 23);
			x_left = x_right;
			x_right = at_input[i_read + 27];
			at_output[i_write + 29] = ((x_left & 0x7fffff) << 6) | (x_right >>> 26);
			x_left = x_right;
			x_right = at_input[i_read + 28];
			at_output[i_write + 30] = ((x_left & 0x3ffffff) << 3) | (x_right >>> 29);
			x_left = x_right;
			at_output[i_write + 31] = x_left & 0x1fffffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 3) & 0x1fffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 26) | (x_right >>> 6);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 23) | (x_right >>> 9);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 17) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fff) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 11) | (x_right >>> 21);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fffff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffffff) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ffffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 1) & 0x1fffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 28) | (x_right >>> 4);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 25) | (x_right >>> 7);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 22) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 19) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 13) | (x_right >>> 19);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ffff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fffff) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffffff) << 1) | (x_right >>> 31);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		at_output[i_write++] = (x_left >>> 2) & 0x1fffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 27) | (x_right >>> 5);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 24) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 21) | (x_right >>> 11);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 15) | (x_right >>> 17);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fffff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffffff) << 3) | (x_right >>> 29);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_30_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 30 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 30) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 16); i_read += 15, i_write += 16) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 2;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x3) << 28) | (x_right >>> 4);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0xf) << 26) | (x_right >>> 6);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0x3f) << 24) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 4] = ((x_left & 0xff) << 22) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 5] = ((x_left & 0x3ff) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 6] = ((x_left & 0xfff) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 7] = ((x_left & 0x3fff) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 8];
			at_output[i_write + 8] = ((x_left & 0xffff) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 9];
			at_output[i_write + 9] = ((x_left & 0x3ffff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 10] = ((x_left & 0xfffff) << 10) | (x_right >>> 22);
			x_left = x_right;
			x_right = at_input[i_read + 11];
			at_output[i_write + 11] = ((x_left & 0x3fffff) << 8) | (x_right >>> 24);
			x_left = x_right;
			x_right = at_input[i_read + 12];
			at_output[i_write + 12] = ((x_left & 0xffffff) << 6) | (x_right >>> 26);
			x_left = x_right;
			x_right = at_input[i_read + 13];
			at_output[i_write + 13] = ((x_left & 0x3ffffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			x_right = at_input[i_read + 14];
			at_output[i_write + 14] = ((x_left & 0xfffffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			at_output[i_write + 15] = x_left & 0x3fffffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 2) & 0x3fffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 28) | (x_right >>> 4);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 26) | (x_right >>> 6);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 24) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 22) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fffff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffffff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
	unpack_31_32(ab_input, i_read, n_items) {
		let at_output = new Uint32Array(n_items);
		if (!B_IS_LITTLE_ENDIAN) ab_input.swap32();
		let i_byte_offset = Math.ceil(n_items * 31 / 8) + i_read;
		let nl_input = Math.ceil((n_items * 31) / 32);
		let at_input = new Uint32Array(ab_input.buffer, ab_input.byteOffset, nl_input);
		let i_write = 0;
		for (; i_write <= (n_items - 32); i_read += 31, i_write += 32) {
			let x_left = at_input[i_read],
				x_right = 0;
			at_output[i_write] = x_left >>> 1;

			x_right = at_input[i_read + 1];
			at_output[i_write + 1] = ((x_left & 0x1) << 30) | (x_right >>> 2);
			x_left = x_right;
			x_right = at_input[i_read + 2];
			at_output[i_write + 2] = ((x_left & 0x3) << 29) | (x_right >>> 3);
			x_left = x_right;
			x_right = at_input[i_read + 3];
			at_output[i_write + 3] = ((x_left & 0x7) << 28) | (x_right >>> 4);
			x_left = x_right;
			x_right = at_input[i_read + 4];
			at_output[i_write + 4] = ((x_left & 0xf) << 27) | (x_right >>> 5);
			x_left = x_right;
			x_right = at_input[i_read + 5];
			at_output[i_write + 5] = ((x_left & 0x1f) << 26) | (x_right >>> 6);
			x_left = x_right;
			x_right = at_input[i_read + 6];
			at_output[i_write + 6] = ((x_left & 0x3f) << 25) | (x_right >>> 7);
			x_left = x_right;
			x_right = at_input[i_read + 7];
			at_output[i_write + 7] = ((x_left & 0x7f) << 24) | (x_right >>> 8);
			x_left = x_right;
			x_right = at_input[i_read + 8];
			at_output[i_write + 8] = ((x_left & 0xff) << 23) | (x_right >>> 9);
			x_left = x_right;
			x_right = at_input[i_read + 9];
			at_output[i_write + 9] = ((x_left & 0x1ff) << 22) | (x_right >>> 10);
			x_left = x_right;
			x_right = at_input[i_read + 10];
			at_output[i_write + 10] = ((x_left & 0x3ff) << 21) | (x_right >>> 11);
			x_left = x_right;
			x_right = at_input[i_read + 11];
			at_output[i_write + 11] = ((x_left & 0x7ff) << 20) | (x_right >>> 12);
			x_left = x_right;
			x_right = at_input[i_read + 12];
			at_output[i_write + 12] = ((x_left & 0xfff) << 19) | (x_right >>> 13);
			x_left = x_right;
			x_right = at_input[i_read + 13];
			at_output[i_write + 13] = ((x_left & 0x1fff) << 18) | (x_right >>> 14);
			x_left = x_right;
			x_right = at_input[i_read + 14];
			at_output[i_write + 14] = ((x_left & 0x3fff) << 17) | (x_right >>> 15);
			x_left = x_right;
			x_right = at_input[i_read + 15];
			at_output[i_write + 15] = ((x_left & 0x7fff) << 16) | (x_right >>> 16);
			x_left = x_right;
			x_right = at_input[i_read + 16];
			at_output[i_write + 16] = ((x_left & 0xffff) << 15) | (x_right >>> 17);
			x_left = x_right;
			x_right = at_input[i_read + 17];
			at_output[i_write + 17] = ((x_left & 0x1ffff) << 14) | (x_right >>> 18);
			x_left = x_right;
			x_right = at_input[i_read + 18];
			at_output[i_write + 18] = ((x_left & 0x3ffff) << 13) | (x_right >>> 19);
			x_left = x_right;
			x_right = at_input[i_read + 19];
			at_output[i_write + 19] = ((x_left & 0x7ffff) << 12) | (x_right >>> 20);
			x_left = x_right;
			x_right = at_input[i_read + 20];
			at_output[i_write + 20] = ((x_left & 0xfffff) << 11) | (x_right >>> 21);
			x_left = x_right;
			x_right = at_input[i_read + 21];
			at_output[i_write + 21] = ((x_left & 0x1fffff) << 10) | (x_right >>> 22);
			x_left = x_right;
			x_right = at_input[i_read + 22];
			at_output[i_write + 22] = ((x_left & 0x3fffff) << 9) | (x_right >>> 23);
			x_left = x_right;
			x_right = at_input[i_read + 23];
			at_output[i_write + 23] = ((x_left & 0x7fffff) << 8) | (x_right >>> 24);
			x_left = x_right;
			x_right = at_input[i_read + 24];
			at_output[i_write + 24] = ((x_left & 0xffffff) << 7) | (x_right >>> 25);
			x_left = x_right;
			x_right = at_input[i_read + 25];
			at_output[i_write + 25] = ((x_left & 0x1ffffff) << 6) | (x_right >>> 26);
			x_left = x_right;
			x_right = at_input[i_read + 26];
			at_output[i_write + 26] = ((x_left & 0x3ffffff) << 5) | (x_right >>> 27);
			x_left = x_right;
			x_right = at_input[i_read + 27];
			at_output[i_write + 27] = ((x_left & 0x7ffffff) << 4) | (x_right >>> 28);
			x_left = x_right;
			x_right = at_input[i_read + 28];
			at_output[i_write + 28] = ((x_left & 0xfffffff) << 3) | (x_right >>> 29);
			x_left = x_right;
			x_right = at_input[i_read + 29];
			at_output[i_write + 29] = ((x_left & 0x1fffffff) << 2) | (x_right >>> 30);
			x_left = x_right;
			x_right = at_input[i_read + 30];
			at_output[i_write + 30] = ((x_left & 0x3fffffff) << 1) | (x_right >>> 31);
			x_left = x_right;
			at_output[i_write + 31] = x_left & 0x7fffffff;

		}
		if (i_write === n_items) return [at_output, i_byte_offset];
		let x_left = at_input[i_read++],
			x_right = 0;
		at_output[i_write++] = (x_left >>> 1) & 0x7fffffff;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1) << 30) | (x_right >>> 2);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3) << 29) | (x_right >>> 3);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7) << 28) | (x_right >>> 4);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xf) << 27) | (x_right >>> 5);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1f) << 26) | (x_right >>> 6);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3f) << 25) | (x_right >>> 7);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7f) << 24) | (x_right >>> 8);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xff) << 23) | (x_right >>> 9);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ff) << 22) | (x_right >>> 10);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ff) << 21) | (x_right >>> 11);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ff) << 20) | (x_right >>> 12);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfff) << 19) | (x_right >>> 13);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fff) << 18) | (x_right >>> 14);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fff) << 17) | (x_right >>> 15);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fff) << 16) | (x_right >>> 16);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffff) << 15) | (x_right >>> 17);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffff) << 14) | (x_right >>> 18);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffff) << 13) | (x_right >>> 19);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ffff) << 12) | (x_right >>> 20);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffff) << 11) | (x_right >>> 21);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fffff) << 10) | (x_right >>> 22);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fffff) << 9) | (x_right >>> 23);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7fffff) << 8) | (x_right >>> 24);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xffffff) << 7) | (x_right >>> 25);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1ffffff) << 6) | (x_right >>> 26);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3ffffff) << 5) | (x_right >>> 27);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x7ffffff) << 4) | (x_right >>> 28);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0xfffffff) << 3) | (x_right >>> 29);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x1fffffff) << 2) | (x_right >>> 30);
		x_left = x_right;
		if (i_write === n_items) return [at_output, i_byte_offset];
		x_right = at_input[i_read++];
		at_output[i_write++] = ((x_left & 0x3fffffff) << 1) | (x_right >>> 31);
		x_left = x_right;
		return [at_output, i_byte_offset];
	},
};

module.exports = {
	pack(a_items, n_item_width, n_word_width) {
		return H_PACKERS['pack_' + n_item_width + '_' + n_word_width](a_items);
	},
	unpack(ab_input, i_read, n_items, n_item_width, n_word_width) {
		return H_PACKERS['unpack_' + n_item_width + '_' + n_word_width](ab_input, i_read, n_items);
	},
};