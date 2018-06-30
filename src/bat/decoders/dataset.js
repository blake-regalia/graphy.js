/* globals
$_ROLE_HOP
$_ROLE_NODE
$_ROLE_SUBJECT
$_ROLE_PREDICATE
$_ROLE_INVERSE_PREDICATE
$_ROLE_OBJECT
$_ROLE_LITERAL

$_USE_SPO
$_USE_POS
$_USE_OSP
*/

Object.assign(global, require('../../query/symbols.js'));


const H_ROLE_TO_PRODUCTION = {
	[$_ROLE_HOP]: 'produce_hop',
	[$_ROLE_NODE]: 'produce_node',
	[$_ROLE_SUBJECT]: 'produce_subject',
	[$_ROLE_PREDICATE]: 'produce_predicate',
	[$_ROLE_INVERSE_PREDICATE]: 'produce_predicate',
	[$_ROLE_OBJECT]: 'produce_object',
	[$_ROLE_LITERAL]: 'produce_literal',
};

const H_ROLE_TO_FINDER = {
	[$_ROLE_HOP]: 'find_hop',
	[$_ROLE_NODE]: 'find_node',
	[$_ROLE_SUBJECT]: 'find_subject',
	[$_ROLE_PREDICATE]: 'find_predicate',
	[$_ROLE_INVERSE_PREDICATE]: 'find_predicate',
	[$_ROLE_OBJECT]: 'find_object',
	[$_ROLE_LITERAL]: 'find_literal',
};

const H_USE_TO_CODE = {
	[$_USE_SPO]: 'spo',
	[$_USE_POS]: 'pos',
	[$_USE_OSP]: 'osp',
};


class dataset {
	constructor(kbd, k_decoders) {
		let a_sections = [];
		let k_child;
		while((k_child = k_decoders.auto(kbd))) {
			a_sections.push(k_child);
		}

		Object.assign(this, {
			sections: a_sections,
		});
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


module.exports = dataset;
