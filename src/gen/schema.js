const fs = require('fs');

const k_schema = require('./schema/default.js');

// each source
for(let [s_file, s_source] of k_schema.sourcify()) {
	// write to file
	fs.writeFileSync(s_file, s_source);
}


