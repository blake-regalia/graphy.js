import graphy from '../main';
import h_graph from '../../test/volt/graph.json';

graphy(h_graph, function(q_graph) {

	let k_property= q_graph.select('stko:PointsTowards', 'volt:');

	// for(let [p_predicate, a_objects] of k_property()) {
	// 	a_objects.forEach((k_node) => {
	// 		console.log(q_graph.shorten(p_predicate)+' => {'+k_node.$is()+'} '+k_node.$n3());
	// 		debugger;
	// 	});
	// }

	k_property.stages((k_stage) => {
		console.log(k_stage.$type());
		let k_waht = k_stage.evaluate;
		// h_graph;
		debugger;
	});
});
