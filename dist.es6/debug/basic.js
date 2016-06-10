import graphy from '../main';
import graph from '../../test/graph.json';

graphy(graph, function(q_graph) {

	let k_banana= q_graph.select('ns:Banana', 'ns:');

	for(let [p_predicate, a_objects] of k_banana()) {
		a_objects.forEach((k_node) => {
			console.log(q_graph.shorten(p_predicate)+' => {'+k_node.$is()+'} '+k_node.$n3());
			debugger;
		});
	}
});
