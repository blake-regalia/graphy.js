const stream = require('stream');

const graphy = require('./graphy.js');
const bus = require('./bus.js');
const section = require('../store/section.js');
const triples = require('../store/triples.js');

const N_VERSION = 1;

const section_sorter = (s_code) => [
	(k, w) => k['section_'+s_code].count = w,
	(k, w) => k['section_'+s_code].dict = w,
	(k, w) => k['section_'+s_code].ref = w,
	(k, w) => k['section_'+s_code].k = w,
];

@macro section_sorter(code, range)
	'count',
	'dict',
	'ref',
	(k, w) => {
		k.section_@{code} = section.front_coded_null_vbyte_section(k.dict, k.ref, k.count, w, @{range});
		k.term_count += k.count;
		delete k.count;
		delete k.dict;
		delete k.ref;
	},
@end

@macro triples_sorter(a, b, c)
	'term_codes',
	'idx_a_b',
	'adj_a_b',
	'idx_ab_c',
	(k, w) => {
		let at_adj_ab_c = w;
		let [s_a, s_b, s_c] = k.term_codes;
		k.triples_@{a}@{b}@{c} = triples.contiguous_adjacency_list_triples(k, s_a, s_b, s_c, k.idx_a_b, k.adj_a_b, k.idx_ab_c, at_adj_ab_c);
		delete k.term_codes;
		delete k.idx_a_b;
		delete k.adj_a_b;
		delete k.idx_ab_c;
		// delete k.adj_ab_c;
	},
@end

const A_SORTERS = [
	'version',
	'prefixes',
	'range_d',
	'range_s',
	'range_o',
	'range_l',
	'range_p',
	@{section_sorter('d', '1')}
	@{section_sorter('s', '1 + k.section_d.count')}
	@{section_sorter('o', '1 + k.section_d.count')}
	@{section_sorter('l', '1 + k.section_d.count + k.section_o.count')}
	@{section_sorter('p', '1')}
	@{triples_sorter('s', 'p', 'o')}
	@{triples_sorter('p', 'o', 's')}
];


const info = (z) => (z === null? 'null': (z.constructor.name+'; '+('undefined' !== typeof z.length? 'length: '+z.length+'; ': '')));

class StreamConsumer extends stream.Writable {

	constructor(ds_input, h_config={}) {
		super();

		let k_graph = this.graph = graphy.linkedGraph();
		this.config = h_config;

		let s_pair = '', s_full = '';

		let i_read = 0;

		// consume stream and decode everything
		let k_in = bus.incoming((z_item, i_item, c_bytes) => {
			let z_sorter = A_SORTERS[i_item];
			if('string' === typeof z_sorter) {
				console.log(z_sorter+': '+info(z_item)+' @.'+i_read.toString(10));
				k_graph[z_sorter] = z_item;
			}
			else if('function' === typeof z_sorter) {
				console.log('fn: '+info(z_item)+' @.'+i_read.toString(10));
				z_sorter(k_graph, z_item, i_item);
			}
			else {
				debugger;

				// handle remainder
				let s_mode = z_item;
				s_pair = s_mode.substr(0, 2);
				s_full = s_mode[0]+'_'+s_mode.substr(1);
				A_SORTERS.push(0);
				A_SORTERS.push('data_'+s_pair);
				A_SORTERS.push('idx_'+s_pair);
				A_SORTERS.push('data_'+s_full);
				A_SORTERS.push('idx_'+s_full);
			}

			i_read += c_bytes;

			if(h_config.progress) {
				h_config.progress(i_read, info(z_item));
			}
		});

		k_in.on('finish', () => {
			k_graph.mk_prefix_lookup();

			if(h_config.prefixes) k_graph.set_user_prefixes(h_config.prefixes);
			h_config.ready(k_graph);
		});

		ds_input.pipe(k_in);
	}
}

class BufferConsumer {
	constructor(ab_input, h_config={}) {
		let k_graph = this.graph = graphy.linkedGraph();
		this.config = h_config;

		console.time('decode');
		let a_items = bus.decode(ab_input);
		console.timeEnd('decode');

		for(let i_item=0, n_items=a_items.length; i_item<n_items; i_item++) {
			let z_item = a_items[i_item];
			let z_sorter = A_SORTERS[i_item];
			if('string' === typeof z_sorter) {
				console.log(z_sorter+': '+info(z_item)+' @.');
				k_graph[z_sorter] = z_item;
			}
			else if('function' === typeof z_sorter) {
				console.log('fn: '+info(z_item)+' @.');
				z_sorter(k_graph, z_item, i_item);
			}
			else {
				debugger;

				// handle remainder
				let s_mode = z_item;
				s_pair = s_mode.substr(0, 2);
				s_full = s_mode[0]+'_'+s_mode.substr(1);
				A_SORTERS.push(0);
				A_SORTERS.push('data_'+s_pair);
				A_SORTERS.push('idx_'+s_pair);
				A_SORTERS.push('data_'+s_full);
				A_SORTERS.push('idx_'+s_full);
			}
		}

		k_graph.mk_prefix_lookup();

		if(h_config.prefixes) k_graph.set_user_prefixes(h_config.prefixes);
		h_config.ready(k_graph);
	}
}

const A_SECTIONS = ['d', 's', 'o', 'l', 'p'];

class Stats extends stream.Writable {
	constructor(ds_input, h_config, fk_stat) {
		super();
		this.config = h_config;

		// consume stream and decode everything
		ds_input.pipe(bus.incoming((w_item, i_item, c_bytes) => {
			let s_item;
			if(c_bytes > 1024) {
				if(c_bytes > 1024 * 1024) {
					s_item = (c_bytes / 1024 / 1024).toFixed(2)+' MiB';
				}
				else {
					s_item = (c_bytes / 1024).toFixed(2)+' KiB';
				}
			}
			else {
				s_item = c_bytes+' B';
			}
			// console.info(A_SECTIONS[i_item]+': '+s_item+'  ('+(null === w_item? 'null': w_item.constructor.name)+')');
		}));
	}
}

class Serializer {
	constructor(ds_output, h_config, fk_writer) {
		// save & ref graph
		let k_graph = this.graph = h_config.graph;

		// once we're all finished writing
		ds_output.on('finish', () => {
			fk_writer();
		});

		// make outgoing serializer
		let k_out = this.out = bus.outgoing();

		// dti header
		k_out.add(N_VERSION);


		// subclass implements `serialize`
		if(this.serialize) {
			this.serialize();
		}
		else {
			// prefixes
			k_out.add(k_graph.prefixes);

			// ranges
			k_out.add(k_graph.range_d);
			k_out.add(k_graph.range_s);
			k_out.add(k_graph.range_o);
			k_out.add(k_graph.range_l);
			k_out.add(k_graph.range_p);

			// sections
			for(let i_section=0; i_section<A_SECTIONS.length; i_section++) {
				let h_section = k_graph['section_'+A_SECTIONS[i_section]];
				k_out.add(h_section.count);
				k_out.add(h_section.dict);
				k_out.add(h_section.ref);
				k_out.add(h_section.k);
			}

			// // sections debug
			// for(let i_sort=1; i_sort<A_SORTERS.length; i_sort++) {
			// 	let z_sort = A_SORTERS[i_sort];
			// 	if('string' === typeof z_sort) {
			// 		console.log(z_sort+': '+info(k_graph[z_sort] || null));
			// 	}
			// }

			// uses SPO
			if(k_graph.triples_spo) {
				this.serialize_triples(k_graph.triples_spo, 's', 'p', 'o');
			}

			// uses POS
			if(k_graph.triples_pos) {
				this.serialize_triples(k_graph.triples_pos, 'p', 'o', 's');
			}

			// uses OSP
			if(k_graph.triples_osp) {
				this.serialize_triples(k_graph.triples_osp, 'o', 's', 'p');
			}
		}

		// pipe serialized data to output
		k_out.pipe(ds_output);
	}

	serialize_triples(h_triples, s_a, s_b, s_c) {
		let k_out = this.out;

		let s_abc = s_a+s_b+s_c;
		k_out.add(s_abc);
		k_out.add(h_triples.idx_a_b);
		k_out.add(h_triples.adj_a_b);
		k_out.add(h_triples.idx_ab_c);
		k_out.add(h_triples.adj_ab_c);

		console.log(`[[${s_abc}]]`);
		console.log(`idx_${s_a}_${s_b}: `+info(h_triples.idx_a_b));
		console.log(`adj_${s_a}_${s_b}: `+info(h_triples.adj_a_b));
		console.log(`idx_${s_a}${s_b}_${s_c}: `+info(h_triples.idx_ab_c));
		console.log(`adj_${s_a}${s_b}_${s_c}: `+info(h_triples.adj_ab_c));
	}
}

class SpaceSaver extends Serializer {
	constructor(...a_args) {
		super(...a_args);
	}

	serialize() {
		let k_graph = this.graph;
		let k_out = this.out;

		// prefixes
		k_out.add(k_graph.prefixes);

		// ranges
		k_out.add([
			k_graph.range_d,
			k_graph.range_s,
			k_graph.range_o,
			k_graph.range_l,
			k_graph.range_p,
		]);

		// sections
		for(let i_section=0; i_section<A_SECTIONS.length; i_section++) {
			let k_section = k_graph['section_'+A_SECTIONS[i_section]];
			k_out.add(k_section.count);
			// k_out.add(k_section, bus.NULL_TERMINATED_FC_DICT_COMPRESSED, h_section.k);
			k_out.add(k_section.dict);
			k_out.add(k_section.k);
		}

		let b_force_pos = false;
		if(b_force_pos) k_graph.mk_pos();

		// uses SPO
		if(k_graph.triples_spo && !b_force_pos) {
			this.serialize_triples(k_graph.triples_spo, 's', 'p', 'o');
		}

		// uses POS
		if(k_graph.triples_pos) {
			this.serialize_triples(k_graph.triples_pos, 'p', 'o', 's');
		}

		// uses OSP
		if(k_graph.triples_osp) {
			this.serialize_triples(k_graph.triples_osp, 'o', 's', 'p');
		}
	}

	serialize_triples(h_triples, s_a, s_b, s_c) {
		let k_out = this.out;

		let s_abc = s_a+s_b+s_c;
		k_out.add(s_abc);
		k_out.add(h_triples.idx_a_b, bus.CSMI, h_triples.adj_a_b);
		k_out.add(h_triples.adj_a_b, bus.MSMI, h_triples.idx_a_b);
		k_out.add(h_triples.idx_ab_c, bus.CSMI, h_triples.adj_ab_c);
		k_out.add(h_triples.adj_ab_c, bus.MSMI, h_triples.idx_ab_c);

		console.log(`[[${s_abc}]]`);
		console.log(`idx_${s_a}_${s_b}: `+info(h_triples.idx_a_b));
		console.log(`adj_${s_a}_${s_b}: `+info(h_triples.adj_a_b));
		console.log(`idx_${s_a}${s_b}_${s_c}: `+info(h_triples.idx_ab_c));
		console.log(`adj_${s_a}${s_b}_${s_c}: `+info(h_triples.adj_ab_c));
	}
}


module.exports = {
	load(z_input, h_config, fk_load) {
		// readable stream
		if('setEncoding' in z_input) {
			return new StreamConsumer(z_input, h_config, fk_load);
		}
		// buffer
		else if('readUInt8' in z_input) {
			return new BufferConsumer(z_input, h_config, fk_load);
		}
		else {
			throw 'invalid input type '+(z_input.constructor.name);
		}
	},

	write(ds_output, h_config, fk_write) {
		return new Serializer(ds_output, h_config, fk_write);
	},

	compress(ds_output, h_config, fk_write) {
		return new SpaceSaver(ds_output, h_config, fk_write);
	},

	stats(ds_input, h_config, fk_stat) {
		return new Stats(ds_input, h_config, fk_stat);
	},
};

