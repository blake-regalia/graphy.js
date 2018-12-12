const fs = require('fs');
const loader = require('./loader.js');

let ds_output = fs.createWriteStream(`./build/${process.env.GRAPHY_CHANNEL || 'graphy'}/.turtle-earl-report.ttl`);

loader({
	manifest: 'http://w3c.github.io/rdf-tests/trig/manifest.ttl',
	mime: 'application/trig',
	output: ds_output,
});
