/*eslint no-console:0*/

const parser = require('../ttl/stream-parser');

parser(
	/*`
	@base <scheme://auth/path/end> .

	<//a> </b> <./c> .
	<../d> <#e> <?f=/../dots/../> .
	<//a/b/d/../c> <ing> <u/../v> .

	@base <scheme://auth/path/end/> .

	<//a> </b> <./c> .
	<../d> <#e> <?f=/../dots/../> .
	<//a/b/d/../c> <ing> <u/../v> .
`*/
`
			@base <scheme://auth/path/> .
			@base </a/x> .
			<> <./b> </a/b/c> .
`, {
	triple(h_triple) {
		console.log(h_triple);
	},
	end() {
		console.log('all done');
	},
});
