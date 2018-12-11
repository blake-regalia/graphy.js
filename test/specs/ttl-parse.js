const ttl_read = require(`@${process.env.GRAPHY_CHANNEL || 'graphy'}/content.ttl.read`);
module.exports = {
	parse: (s_input, p_base, g_options={}) => new Promise((fk_read) => {
		let a_quads = [];
		ttl_read({
			...g_options,
			baseUri: p_base,
			input: {string:s_input},
			validate: true,
			data(g_quad) {
				a_quads.push(g_quad);
			},
			end() {
				fk_read(a_quads);
			},
		});
	}),
};
