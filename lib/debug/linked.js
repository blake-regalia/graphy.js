const fs = require('fs');
const graphy = require('../graphy/graphy');

let p_file = '/Users/blake/dev/graphy/scrap/banana.ttl';
let ds_input = fs.createReadStream(p_file);
ds_input = `
	@prefix dbo: <dbo://> .
	@prefix dbp: <dbp://> .
	@prefix dbr: <dbr://> .
	@prefix rdf: <rdf://> .
	@prefix rdfs: <rdfs://> .
	dbr:Banana rdfs:label "Banana"@en, "Banane"@fr ;
		dbp:linksTo dbr:Monkey, dbr:Yellow .
	dbr:Monkey rdf:type dbo:Animal .
`;

graphy.ttl.linked(ds_input, {async: true}, (error, g) => {
	debugger;

	let banana = g.enter('dbr:Banana');
	console.dir(banana.hop('rdfs:label').literals('@en').values());
	console.dir(banana.at.rdfs.label.literals.values());

	console.dir(banana.hop('dbp:linksTo').nodes.hop('rdf:type').values());
});
