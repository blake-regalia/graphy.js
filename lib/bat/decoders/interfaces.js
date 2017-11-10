
function implement(dc_class, a_methods) {
	a_methods.forEach((s_method) => {
		dc_class.prototype = function() {
			throw new Error(`method ${s_method} was not implemented by ${dc_class.name} subclass`);
		};
	});
}

class dictionary {}
implement(dictionary, [
	'produce_subject',
	'produce_predicate',
	'produce_object',

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

module.exports = {
	dictionary,
	chapter,
};
