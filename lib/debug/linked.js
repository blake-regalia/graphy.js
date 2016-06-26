const fs = require('fs');
const graphy = require('../graphy/graphy');

let p_file = '/Users/blake/dev/graphy/scrap/banana.ttl';
let ds_input = fs.createReadStream(p_file);

graphy.ttl.linked(ds_input, {async: true}, (error, g) => {
	debugger;

	let banana = g.enter('dbr:Banana');
	
	let any = banana.at.rdf.type.anyNodes;
	debugger;

	console.dir(banana.hop('rdfs:label').literals('@en').values());
	console.dir(banana.at.rdfs.label.literals.values());

	console.dir(banana.hop('dbp:linksTo').nodes.hop('rdf:type').values());
});
