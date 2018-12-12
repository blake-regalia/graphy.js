const fs = require('fs');
const loader = require('./loader.js');

let ds_output = fs.createWriteStream(`./build/${process.env.GRAPHY_CHANNEL || 'graphy'}/.n-triples-earl-report.ttl`);

loader({
	manifest: 'http://w3c.github.io/rdf-tests/n-quads/manifest.ttl',
	mime: 'application/n-quads',
	output: ds_output,
});
