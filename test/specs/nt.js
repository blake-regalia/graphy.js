const fs = require('fs');
const loader = require('./loader.js');


let ds_output = fs.createWriteStream('./ntriples-earl-report.ttl');

loader({
	manifest: 'https://www.w3.org/2013/N-TriplesTests/manifest.ttl',
	mime: 'text/turtle',
	output: ds_output,
});
