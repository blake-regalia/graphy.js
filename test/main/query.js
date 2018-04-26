/*eslint indent:0*/
const assert = require('assert');
const deq = assert.deepStrictEqual;
const eq = assert.strictEqual;
const fs = require('fs');

const graphy = require('../../dist/main/graphy.js');


describe('query engine:', () => {
	it('can wait', () => {
		eq(true, true);
	});

	fs.createReadStream(__dirname+'/banana.ttl')
		.pipe(graphy.store().load('text/turtle', (g) => {

			it('.node() on single object', () => {
				rows(g.pattern().subject('dbr:Gros_Michel_banana')
					.out('dbp:group').node().bind('banana')
					.exit(), [
						{banana:KT_BANANA}
					]);
			});

			it('.nodes() on single object', () => {
				rows(g.pattern().subject('dbr:Gros_Michel_banana')
					.out('dbp:group').nodes().bind('banana')
					.exit(), [
						{banana:KT_BANANA}
					]);
			});

			it('.node() on multiple objects', () => {
				rows(g.pattern().subject('dbr:Banana')
					.out('rdf:type').node().bind('type')
					.exit(), [
						{type:'umbel-rc:Plant'},
					]);
			});

			it('.nodes() on multiple objects', () => {
				rows(g.pattern().subject('dbr:Banana')
					.out('rdf:type').nodes().bind('type')
					.exit(), [
						{type:'umbel-rc:Plant'},
						{type:'umbel-rc:EukaryoticCell'},
						{type:'umbel-rc:BiologicalLivingObject'},
						{type:'owl:Thing'},
					]);
			});


			it('.node() on single subject', () => {
				rows(g.pattern().subject('dbpedia-pt:Banana')
					.in('owl:sameAs').node().bind('banana')
					.exit(), [P_BANANA]);
			});

			it('.nodes() on single subject', () => {
				rows(g.pattern().subject('dbpedia-pt:Banana')
					.in('owl:sameAs').nodes().bind('banana')
					.exit(), [P_BANANA]);
			});

			it('.node() on multiple subjects', () => {
				rows(g.pattern().subject('dbr:Lacatan_banana')
					.out('dbo:wikiPageRedirects').node().bind('redirect')
					.exit(), [
						{redirect:'dbr:Lakatan_Banana'},
					]);
			});

			it('.nodes() on multiple subjects', () => {
				rows(g.pattern().subject('dbr:Lacatan_banana')
					.out('dbo:wikiPageRedirects').nodes().bind('redirect')
					.exit(), [
						{redirect:'dbr:Lakatan_Banana'},
						{redirect:'dbr:Lakatan'},
					]);
			});


			it('.literal() on single object', () => {
				rows(g.pattern().subject('dbr:Banana')
					.out('dbp:commons').literal().bind('commons')
					.exit(), [
						{commons:'@en"Banana'}
					]);
			});

			it('.literals() on single object', () => {
				rows(g.pattern().subject('dbr:Banana')
					.out('dbp:commons').literals().bind('commons')
					.exit(), [
						{commons:'@en"Banana'}
					]);
			});

			it('.literal() on multiple objects', () => {
				rows(g.pattern().subject('dbr:Banana')
					.out('dbp:image').literal().bind('image')
					.exit(), [
						{image:'@en"Thanin market banana flowers and leaves.jpg'},
					]);
			});

			it('.literals() on multiple objects', () => {
				rows(g.pattern().subject('dbr:Banana')
					.out('dbp:image').literals().bind('image')
					.exit(), [
						{image:'@en"Thanin market banana flowers and leaves.jpg'},
						{image:'@en"River Kaveri worship Tiruchirappalli.jpg'},
					]);
			});

		}));

	});
});
