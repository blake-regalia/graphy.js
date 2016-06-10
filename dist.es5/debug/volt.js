'use strict';

var _main = require('../main');

var _main2 = _interopRequireDefault(_main);

var _graph = require('../../test/volt/graph.json');

var _graph2 = _interopRequireDefault(_graph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _main2.default)(_graph2.default, function (q_graph) {

	var k_property = q_graph.select('stko:PointsTowards', 'volt:');

	// for(let [p_predicate, a_objects] of k_property()) {
	// 	a_objects.forEach((k_node) => {
	// 		console.log(q_graph.shorten(p_predicate)+' => {'+k_node.$is()+'} '+k_node.$n3());
	// 		debugger;
	// 	});
	// }

	k_property.stages(function (k_stage) {
		console.log(k_stage.$type());
		var k_waht = k_stage.evaluate;
		// h_graph;
		debugger;
	});
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZvbHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7Ozs7QUFFQSxxQ0FBZ0IsVUFBUyxPQUFULEVBQWtCOztBQUVqQyxLQUFJLGFBQVksUUFBUSxNQUFSLENBQWUsb0JBQWYsRUFBcUMsT0FBckMsQ0FBaEI7Ozs7Ozs7OztBQVNBLFlBQVcsTUFBWCxDQUFrQixVQUFDLE9BQUQsRUFBYTtBQUM5QixVQUFRLEdBQVIsQ0FBWSxRQUFRLEtBQVIsRUFBWjtBQUNBLE1BQUksU0FBUyxRQUFRLFFBQXJCOztBQUVBO0FBQ0EsRUFMRDtBQU1BLENBakJEIiwiZmlsZSI6InZvbHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ3JhcGh5IGZyb20gJy4uL21haW4nO1xuaW1wb3J0IGhfZ3JhcGggZnJvbSAnLi4vLi4vdGVzdC92b2x0L2dyYXBoLmpzb24nO1xuXG5ncmFwaHkoaF9ncmFwaCwgZnVuY3Rpb24ocV9ncmFwaCkge1xuXG5cdGxldCBrX3Byb3BlcnR5PSBxX2dyYXBoLnNlbGVjdCgnc3RrbzpQb2ludHNUb3dhcmRzJywgJ3ZvbHQ6Jyk7XG5cblx0Ly8gZm9yKGxldCBbcF9wcmVkaWNhdGUsIGFfb2JqZWN0c10gb2Yga19wcm9wZXJ0eSgpKSB7XG5cdC8vIFx0YV9vYmplY3RzLmZvckVhY2goKGtfbm9kZSkgPT4ge1xuXHQvLyBcdFx0Y29uc29sZS5sb2cocV9ncmFwaC5zaG9ydGVuKHBfcHJlZGljYXRlKSsnID0+IHsnK2tfbm9kZS4kaXMoKSsnfSAnK2tfbm9kZS4kbjMoKSk7XG5cdC8vIFx0XHRkZWJ1Z2dlcjtcblx0Ly8gXHR9KTtcblx0Ly8gfVxuXG5cdGtfcHJvcGVydHkuc3RhZ2VzKChrX3N0YWdlKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coa19zdGFnZS4kdHlwZSgpKTtcblx0XHRsZXQga193YWh0ID0ga19zdGFnZS5ldmFsdWF0ZTtcblx0XHQvLyBoX2dyYXBoO1xuXHRcdGRlYnVnZ2VyO1xuXHR9KTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
