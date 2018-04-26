
function implement(dc_class, a_methods) {
	a_methods.forEach((s_method) => {
		dc_class.prototype = function() {
			throw new Error(`method ${s_method} was not implemented by ${dc_class.name} subclass`);
		};
	});
}

class dataset {}

class dictionary {
}
implement(dictionary, [
	'produce_hop',
	'produce_subject',
	'produce_predicate',
	'produce_object',
	'produce_literal',

	'find_hop',
	'find_subject',
	'find_predicate',
	'find_object_node',
	'find_object_literal',
]);


class chapter {}
implement(chapter, [
	'produce',
	'find',
]);

class triples {
	each_a(hp_role) {
			// too low (not in range yet)
			if(i_term < i_start) continue;

			// to high (out of range)
			if(i_term >= i_stop) break;

	}
}
implement(triples, [
	'rank_b',

	'each_a',
	'each_b',
	'each_c',

	'has_c',
	'find_b',
]);

module.exports = {
	dictionary,
	chapter,
	triples,
};
