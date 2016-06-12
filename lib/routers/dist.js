if(~~process.versions.node.split(/\./)[0] >= 6) {
	module.exports = require('../dist.es6/graphy/graphy.js');
}
else {
	module.exports = require('../dist.es5/graphy/graphy.js');
}
