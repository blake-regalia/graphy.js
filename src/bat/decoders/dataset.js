const bkit = require('bkit');

const bat = require('../bat.js');

/* globals
HP_ROLE_HOP
HP_ROLE_NODE
HP_ROLE_SUBJECT
HP_ROLE_PREDICATE
HP_ROLE_INVERSE_PREDICATE
HP_ROLE_OBJECT
HP_ROLE_LITERAL

HP_USE_SPO
HP_USE_POS
HP_USE_OSP
*/

Object.assign(global, require('../../store/symbols.js'));


const H_ROLE_TO_PRODUCTION = {
	[HP_ROLE_HOP]: 'produce_hop',
	[HP_ROLE_NODE]: 'produce_node',
	[HP_ROLE_SUBJECT]: 'produce_subject',
	[HP_ROLE_PREDICATE]: 'produce_predicate',
	[HP_ROLE_INVERSE_PREDICATE]: 'produce_predicate',
	[HP_ROLE_OBJECT]: 'produce_object',
	[HP_ROLE_LITERAL]: 'produce_literal',
};

const H_ROLE_TO_FINDER = {
	[HP_ROLE_HOP]: 'find_hop',
	[HP_ROLE_NODE]: 'find_node',
	[HP_ROLE_SUBJECT]: 'find_subject',
	[HP_ROLE_PREDICATE]: 'find_predicate',
	[HP_ROLE_INVERSE_PREDICATE]: 'find_predicate',
	[HP_ROLE_OBJECT]: 'find_object',
	[HP_ROLE_LITERAL]: 'find_literal',
};

const H_USE_TO_CODE = {
	[HP_USE_SPO]: 'spo',
	[HP_USE_POS]: 'pos',
	[HP_USE_OSP]: 'osp',
};


class dataset {
	constructor(at_payload) {
		let kbd = new bkit.buffer_decoder(at_payload);

		debugger;
	}

	produce(i_term, hp_role) {
		return this.dictionary[H_ROLE_TO_PRODUCTION[hp_role]](i_term, hp_role);
	}

	find(s_ct, hp_role) {
		return this.dictionary[H_ROLE_TO_FINDER[hp_role]](s_ct, hp_role);
	}

	triples(hp_use) {
		return this.triples[H_USE_TO_CODE[hp_use]];
	}

	range(hp_role) {
		return 
	}
}


module.exports = {
	decoders: {
		[bat.PE_DATASET]: dataset,
	},
};
