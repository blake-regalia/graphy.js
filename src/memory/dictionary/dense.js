// const bkit = require('bkit');

const U8AP_SLICE = Uint8Array.prototype.slice;
const ATU8_EMPTY = new Uint8Array(0);

function concat_atu8(atu8_a, atu8_b) {
	let nb_a = atu8_a.length;

	let atu8_concat = new Uint8Array(nb_a+atu8_b.length);

	atu8_concat.set(atu8_a);
	atu8_concat.set(atu8_b, nb_a);

	return atu8_concat;
}

function TrieDict$next(k_self) {
	return ++k_self._c_strings;
}

function* TrieDict$iterate(k_self, atu8_prefix) {
	// each entry
	for(let g_entry of k_self._a_entries) {
		let atu8_frag = g_entry.frag;
		let atu8_item = concat_atu8(atu8_prefix, atu8_frag);

		// end-of-word marker
		if(g_entry.data) {
			yield {
				item: atu8_item,
				data: g_entry.data,
			};
		}

		// dict is not empty; yield all items within
		if(g_entry.dict) {
			yield* TrieDict$iterate(g_entry.dict, atu8_item);
		}
	}
}

function TrieDict$add(k_self, atu8_add, g_parent) {
	// ref entries
	let a_entries = k_self._a_entries;

	// ref core
	let g_core = k_self._g_core;

	// no entries
	if(!a_entries.length) {
		let w_data = k_self._f_creator();

		// add new entry
		a_entries.push({
			data: w_data,
			frag: atu8_add,
			dict: null,
			parent: g_parent,
		});

		// new word added
		return w_data;
	}

	// ref first character
	let x_add_0 = atu8_add[0];

	// binary search entries
	let i_hi = a_entries.length;
	for(let i_lo=0, i_mid=i_hi>>1; i_lo<i_hi; i_mid=(i_lo+i_hi)>>1) {
		let g_entry = a_entries[i_mid];

		// ref entry frag (aka prefix)
		let atu8_prefix = g_entry.frag;
		let x_prefix_0 = atu8_prefix[0];

		// to the right
		if(x_add_0 > x_prefix_0) {
			i_lo = i_mid + 1;
		}
		// to the left
		else if(x_add_0 < x_prefix_0) {
			i_hi = i_mid;
		}
		// prefix match
		else {
			let nl_prefix = atu8_prefix.length;
			let nl_add = atu8_add.length;

			// greatest common prefix length
			let nl_gcp = Math.min(nl_prefix, nl_add);

			// compare add and prefix
			for(let i_char=0; i_char<nl_gcp; i_char++) {
				// found diff
				if(atu8_add[i_char] !== atu8_prefix[i_char]) {
					// subentries of new node
					let a_subentries = [];

					// create new node using common prefix and set foster parent
					let g_foster = g_entry.parent = a_entries[i_mid] = {
						// this word is guaranteed to not yet be in the dict
						data: null,

						// common prefix
						frag: atu8_add.subarray(0, i_char),

						// add both suffixes to entry
						dict: new TrieDict(g_core, a_subentries),

						// same parent
						parent: g_parent,
					};

					// modify entry frag
					g_entry.frag = atu8_prefix.slice(i_char);

					// create new data
					let w_data = k_self._f_creator();

					// modified existing node
					a_subentries.push({
						data: w_data,
						frag: atu8_add.slice(i_char),
						dict: null,
						parent: g_foster,
					});

					// add comes first
					if(atu8_add[i_char] < atu8_prefix[i_char]) {
						a_subentries.push(g_entry);
					}
					// prefix comes first
					else {
						a_subentries.unshift(g_entry);
					}

					// new word added
					return w_data;
				}
			}

			// add is shorter than prefix
			if(nl_add < nl_prefix) {
				// new dict
				let k_dict = new TrieDict(g_core);

				// modify prefix frag
				g_entry.frag = atu8_prefix.subarray(nl_add);

				// add sole entry
				k_dict._a_entries.push(g_entry);

				// create new data
				let w_data = k_self._f_creator(k_self);

				// create new dict
				let g_foster = a_entries[i_mid] = {
					// end-of-word because this word is shorter than prefix
					data: w_data,

					// exact word already exists in memory
					frag: atu8_add,

					// sole entry
					dict: k_dict,

					// use parent
					parent: g_parent,
				};

				// adopt entry
				g_entry.parent = g_foster;

				// new word added
				return w_data;
			}
			// add is same length as prefix (they match)
			else if(nl_add === nl_prefix) {
				// add already in dict; return value
				if(g_entry.data) {
					return g_entry.data;
				}
				// add was not in dict
				else {
					// add to dict; new word added
					return (g_entry.data = k_self._f_creator());
				}
			}
			// add is longer than prefix; call add on child
			else {
				// slice suffix
				let atu8_suffix = U8AP_SLICE.call(atu8_add, nl_prefix);

				// dict does not yet exist
				if(!g_entry.dict) {
					// new data
					let w_data = k_self._f_creator();

					// create dict
					let k_dict = g_entry.dict = new TrieDict(g_core);

					// add entry
					k_dict._a_entries.push({
						data: w_data,
						frag: atu8_suffix,
						dict: null,
						parent: g_parent,
					});

					// new word added
					return w_data;
				}
				// dict exists, add to it
				else {
					return TrieDict$add(g_entry.dict, atu8_suffix, g_entry);
				}
			}
		}
	}

	// create new data
	let w_data = k_self._f_creator();

	// no prefixes matched, add new entry
	a_entries.splice(i_hi, 0, {
		data: w_data,
		frag: atu8_add,
		dict: null,
	});

	// new word added
	return w_data;
}


const F_NOOP = () => {};

/**
 * This data structure organizes its keys using a Trie; the keys are the 'words'
 *   of the dictionary, stored as Uint8Array fragments. If you intend to store
 *   strings in keys, you must handle all encoding and decoding yourself (e.g.,
 *   UTF-8 encoding strings to Uint8Arrays/Buffers before adding, and likewise
 *   decoding them after retrieving). Each time a new word is added to the
 *   'dictionary', a 'creator' function is called without any arguments to create
 *   the value to store at the given node. Supplying a creator function to the
 *   constructor allows you to handle the type of data stored at each node, a
 *   crucial design component to make this data structure flexible enough to be
 *   used in multiple contexts. If no creator function is supplied, it will
 *   default to an incrementing counter (i.e., each word will return a unique ID),
 *   and will be scoped to the top instance (i.e., its children will inherit the
 *   same creator function).
 */
class TrieDict {
	static from_import(ft_data, at_import) {
		let kd_import = new TrieDict();
		kd_import.import(ft_data, at_import);
		return kd_import;
	}

	/**
	 * Create a new TrieDict
	 * @param  {Function} [f_creator=IncrementalCounter] - the creator function
	 * @param  {Array}  [_a_entries=[]] - initial entries (for interal use only)
	 */
	constructor(f_creator=null, _a_entries=[]) {
		this._a_entries = _a_entries;
		this._f_creator = f_creator || (() => {
			this._c_strings = 0;
			this._f_creator = function() {
				return TrieDict$next(this);
			};

			return this._f_creator(this);
		});
	}

	/**
	 * Add a 'word' to the dictionary. Does not create new data if word already exists
	 * @param  {Uint8Array} atu8_add - word to add
	 * @return {any} the data that was created for the new word or the data for the existing word
	 */
	add(atu8_add) {
		// empty word; not allowed
		if(!atu8_add.length) {
			throw new Error('TrieDict#add requires a non-empty word for the \'add\' argument');
		}

		return TrieDict$add(atu8_add, null);
	}

	/**
	 * Delete a 'word' from the dictionary if it exists.
	 * @param  {Uint8Array} atu8_del - word to delete
	 * @return {boolean}  `true` if the word was deleted, `false` otherwise
	 */
	delete(atu8_del) {
		// empty word; not allowed
		if(!atu8_del.length) {
			debugger;
			throw new Error('TrieDict#delete requires a non-empty word for the \'delete\' argument');
		}

		// ref entries
		let a_entries = this._a_entries;

		// no entries
		if(!a_entries.length) {
			return false;
		}

		// ref first character
		let x_del_0 = atu8_del[0];

		// binary search entries
		let i_hi = a_entries.length;
		for(let i_lo=0, i_mid=i_hi>>1; i_lo<i_hi; i_mid=(i_lo+i_hi)>>1) {
			let g_entry = a_entries[i_mid];

			// ref entry frag (aka prefix)
			let atu8_prefix = g_entry.frag;
			let x_prefix_0 = atu8_prefix[0];

			// to the right
			if(x_del_0 > x_prefix_0) {
				i_lo = i_mid + 1;
			}
			// to the left
			else if(x_del_0 < x_prefix_0) {
				i_hi = i_mid;
			}
			// prefix match
			else {
				let nl_prefix = atu8_prefix.length;
				let nl_del = atu8_del.length;

				// greatest common prefix length
				let nl_gcp = Math.min(nl_prefix, nl_del);

				// compare del and prefix
				for(let i_char=0; i_char<nl_gcp; i_char++) {
					// found diff; word does not exist
					if(atu8_del[i_char] !== atu8_prefix[i_char]) {
						return false;
					}
				}

				// del is shorter than prefix
				if(nl_del < nl_prefix) {
					// word does not exist
					return false;
				}
				// del is same length as prefix (they match)
				else if(nl_del === nl_prefix) {
					// del in dict
					if(g_entry.data) {
						// delete it
						a_entries.splice(i_mid, 1);

						// done
						return true;
					}
					// del was not in dict
					else {
						return false;
					}
				}
				// del is longer than prefix; call del on child
				else {
					// slice suffix
					let atu8_suffix = U8AP_SLICE.call(atu8_del, nl_prefix);

					// dict does not exist
					if(!g_entry.dict) {
						return false;
					}
					// dict exists, call delete on it
					else {
						return g_entry.dict.delete(atu8_suffix);
					}
				}
			}
		}

		// word does not exist
		return false;
	}


	/**
	 * Get a 'word' from the dictionary if it exists.
	 * @param  {Uint8Array} atu8_find - word to find
	 * @return {any} the data that is associated with the word if it exists, otherwise `null`
	 */
	get(atu8_find) {
		// empty word; not allowed
		if(!atu8_find.length) {
			throw new Error('TrieDict#get requires a non-empty word for the \'find\' argument');
		}

		// ref entries
		let a_entries = this._a_entries;

		// no entries; word not found
		if(!a_entries.length) {
			return null;
		}

		// ref first character
		let x_find_0 = atu8_find[0];

		// binary search entries
		let i_hi = a_entries.length;
		for(let i_lo=0, i_mid=i_hi>>1; i_lo<i_hi; i_mid=(i_lo+i_hi)>>1) {
			let g_entry = a_entries[i_mid];

			// ref entry frag (aka prefix)
			let atu8_prefix = g_entry.frag;
			let x_prefix_0 = atu8_prefix[0];

			// to the right
			if(x_find_0 > x_prefix_0) {
				i_lo = i_mid + 1;
			}
			// to the left
			else if(x_find_0 < x_prefix_0) {
				i_hi = i_mid;
			}
			// prefix match
			else {
				let nl_prefix = atu8_prefix.length;
				let nl_find = atu8_find.length;

				// greatest common prefix length
				let nl_gcp = Math.min(nl_prefix, nl_find);

				// compare find and prefix
				for(let i_char=0; i_char<nl_gcp; i_char++) {
					// found diff; word does not exist
					if(atu8_find[i_char] !== atu8_prefix[i_char]) {
						return null;
					}
				}

				// find is shorter than prefix; word does not exist
				if(nl_find < nl_prefix) {
					return null;
				}
				// find is same length as prefix (they match)
				else if(nl_find === nl_prefix) {
					// find already in dict; return value
					if(g_entry.data) {
						return g_entry.data;
					}
					// find was not in dict
					else {
						return null;
					}
				}
				// find is longer than prefix; call find on child
				else {
					// slice suffix
					let atu8_suffix = U8AP_SLICE.call(atu8_find, nl_prefix);

					// dict does not exist; word not in dict
					if(!g_entry.dict) {
						return null;
					}
					// dict exists, recurse find on it
					else {
						return g_entry.dict.get(atu8_suffix);
					}
				}
			}
		}

		// word does not exist
		return null;
	}

	/**
	 * Retrieve all words (along with their data) that start with the given prefix.
	 * @param  {Uint8Array} atu8_under - the prefix under which to retrieve all words
	 * @yields {ItemDataStruct} a simple object with a `.item` property that is a
	 *   Uint8Array of the word, and a `.data` property that is the associated data.
	 */
	* under(atu8_under, atu8_above=ATU8_EMPTY) {
		// empty word; not allowed
		if(!atu8_under.length) {
			throw new Error('TrieDict#under requires a non-empty word for the \'under\' argument');
		}

		// ref entries
		let a_entries = this._a_entries;

		// no entries; word not found
		if(!a_entries.length) {
			return;
		}

		// ref first character
		let x_under_0 = atu8_under[0];

		// binary search entries
		let i_hi = a_entries.length;
		for(let i_lo=0, i_mid=i_hi>>1; i_lo<i_hi; i_mid=(i_lo+i_hi)>>1) {
			let g_entry = a_entries[i_mid];

			// ref entry frag (aka prefix)
			let atu8_prefix = g_entry.frag;
			let x_prefix_0 = atu8_prefix[0];

			// to the right
			if(x_under_0 > x_prefix_0) {
				i_lo = i_mid + 1;
			}
			// to the left
			else if(x_under_0 < x_prefix_0) {
				i_hi = i_mid;
			}
			// prefix match
			else {
				let nl_prefix = atu8_prefix.length;
				let nl_under = atu8_under.length;

				// greatest common prefix length
				let nl_gcp = Math.min(nl_prefix, nl_under);

				// compare under and prefix
				for(let i_char=0; i_char<nl_gcp; i_char++) {
					// found diff; word does not exist
					if(atu8_under[i_char] !== atu8_prefix[i_char]) {
						return;
					}
				}

				// under is shorter than or equal to length of prefix
				if(nl_under <= nl_prefix) {
					// create whole start word
					let atu8_start = concat_atu8(atu8_above, atu8_under);

					// under already in dict; yield it
					if(g_entry.data) {
						yield {
							item: atu8_start,
							data: g_entry.data,
						};
					}

					// dict exists, start iterating on it
					yield* TrieDict$iterate(g_entry.dict, atu8_start);
				}
				// under is longer than prefix; call under on child
				else {
					// slice suffix
					let atu8_suffix = U8AP_SLICE.call(atu8_under, nl_prefix);

					// dict exists
					if(g_entry.dict) {
						// create whole start word
						let atu8_start = concat_atu8(atu8_above, atu8_prefix);

						// recurse under dict
						yield* g_entry.dict.under(atu8_suffix, atu8_start);
					}
				}
			}
		}
	}

	/**
	 * Retrieve all words (along with their data) that are stored in the dictionary.
	 * @yields {ItemDataStruct} a simple object with a `.item` property that is a
	 *   Uint8Array of the word, and a `.data` property that is the associated data.
	 */
	* [Symbol.iterator]() {
		yield* TrieDict$iterate(this, ATU8_EMPTY);
	}

	// export(ft_data) {
	// 	let kbe_export = new bkit.BufferEncoder();

	// 	let a_entries = this._a_entries;

	// 	// encode number of entries
	// 	kbe_export.vuint(a_entries.length);

	// 	// each entry
	// 	for(let g_entry of a_entries) {
	// 		// encode data
	// 		if(g_entry.data) {
	// 			ft_data(kbe_export, g_entry.data);
	// 		}
	// 		// no data
	// 		else {
	// 			kbe_export.append_byte(0);
	// 		}

	// 		// encode word
	// 		kbe_export.vuint(g_entry.frag.length);
	// 		kbe_export.append(g_entry.frag);
	// 	}

	// 	// each dict
	// 	for(let g_entry of a_entries) {
	// 		// dict not empty
	// 		if(g_entry.dict) {
	// 			g_entry.dict.export(ft_data);
	// 		}
	// 		// no dict
	// 		else {
	// 			kbe_export.append_byte(0);
	// 		}
	// 	}

	// 	return kbe_export.close();
	// }

	// import(ft_data, at_import) {
	// 	let kbd_import = new bkit.BufferDecoder(at_import);

	// 	// decode number of entries
	// 	let nl_entries = kbd_import.vuint();

	// 	// entries for this dict
	// 	let a_entries = [];

	// 	// each entry
	// 	for(let i_entry=0; i_entry<nl_entries; i_entry++) {
	// 		let w_data = null;

	// 		// non-null data; decode
	// 		if(kbd_import.peek_byte()) {
	// 			w_data = ft_data(kbd_import);
	// 		}
	// 		// null data; skip
	// 		else {
	// 			kbd_import.skip(1);
	// 		}

	// 		// decode frag
	// 		let nb_frag = kbd_import.vuint();
	// 		let atu8_frag = kbd_import.grab(nb_frag);

	// 		// create entry
	// 		a_entries.push({
	// 			data: w_data,
	// 			frag: atu8_frag,
	// 			dict: null,
	// 		});
	// 	}

	// 	// each entry
	// 	for(let i_entry=0; i_entry<nl_entries; i_entry++) {
	// 		// dict exists
	// 		if(kbd_import.peek_byte()) {
	// 			let kd_child = new TrieDict(g_core.create);

	// 			// grab remainder and forward to child
	// 			kd_child.import(ft_data, kbd_import.grab());
	// 		}
	// 		// no dict; skip
	// 		else {
	// 			kbd_import.skip(1);
	// 		}
	// 	}
	// }
}

module.exports = TrieDict;
