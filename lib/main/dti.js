const stream = require('stream');

const graphy = require('./graphy.js');
const bus = require('./bus.js');

const N_VERSION = 1;

const section_sorter = (s_code) => [
	(k, w) => k['section_'+s_code].count = w,
	(k, w) => k['section_'+s_code].dict = w,
	(k, w) => k['section_'+s_code].ref = w,
	(k, w) => k['section_'+s_code].k = w,
];

const A_SORTERS = [
	'version',
	'prefixes',
	'range_d',
	'range_s',
	'range_o',
	'range_l',
	'range_p',
	...section_sorter('d'),
	...section_sorter('s'),
	...section_sorter('o'),
	...section_sorter('l'),
	...section_sorter('p'),
];

const info = (z) => (z === null? 'null': (z.constructor.name+'; '+('undefined' !== typeof z.length? 'length: '+z.length+'; ': '')));

class Consumer extends stream.Writable {

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
		});

		k_in.on('finish', () => {
			h_config.ready(k_graph);
		});

		ds_input.pipe(k_in);
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

			// uses SPO
			if(k_graph.data_sp) {
				k_out.add('spo');
				k_out.add(k_graph.data_sp);
				k_out.add(k_graph.idx_sp);
				k_out.add(k_graph.data_s_po);
				k_out.add(k_graph.idx_s_po);
			}

			// uses POS
			if(k_graph.data_po) {
				k_out.add('pos');
				k_out.add(k_graph.data_po);
				k_out.add(k_graph.idx_po);
				k_out.add(k_graph.data_p_os);
				k_out.add(k_graph.idx_p_os);
			}

			// uses OSP
			if(k_graph.data_os) {
				k_out.add('osp');
				k_out.add(k_graph.data_os);
				k_out.add(k_graph.idx_os);
				k_out.add(k_graph.data_o_sp);
				k_out.add(k_graph.idx_o_sp);
			}

			for(let i_sort=1; i_sort<A_SORTERS.length; i_sort++) {
				let z_sort = A_SORTERS[i_sort];
				if('string' === typeof z_sort) {
					console.log(z_sort+': '+info(k_graph[z_sort] || null));
				}
			}

			console.log('[[spo]]');
			console.log('data_sp: '+info(k_graph.data_sp));
			console.log('idx_sp: '+info(k_graph.idx_sp));
			console.log('data_s_po: '+info(k_graph.data_s_po));
			console.log('idx_s_po: '+info(k_graph.idx_s_po));
		}

		// pipe serialized data to output

		k_out.pipe(ds_output);
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
			let h_section = k_graph['section_'+A_SECTIONS[i_section]];
			k_out.add(h_section.count);
			k_out.add(h_section.dict);
			k_out.add(h_section.ref);
			k_out.add(h_section.k);
		}

		let b_force_pos = false;
		if(b_force_pos) k_graph.mk_pos();

		// uses SPO
		if(k_graph.data_sp && !b_force_pos) {
			k_out.add('spo');
			k_out.add(k_graph.data_sp, bus.MSMIL, k_graph.idx_sp);
			k_out.add(k_graph.idx_sp, bus.CSMII, k_graph.data_sp);
			k_out.add(k_graph.data_s_po);
			k_out.add(k_graph.idx_s_po, bus.ARRAY, bus.CSMII, k_graph.data_s_po);
		}

		// uses POS
		if(k_graph.data_po) {
			k_out.add('pos');
			k_out.add(k_graph.data_po, bus.MSMIL, k_graph.idx_po);
			k_out.add(k_graph.idx_po, bus.CSMII, k_graph.data_po);
			// k_out.add(k_graph.data_p_os);
			// k_out.add(k_graph.idx_p_os, bus.ARRAY, bus.SORTED_LIST);
		}

		// uses OSP
		if(k_graph.data_os) {
			k_out.add('osp');
			k_out.add(k_graph.data_os);
			k_out.add(k_graph.idx_os, bus.SORTED_LIST);
			k_out.add(k_graph.data_o_sp);
			k_out.add(k_graph.idx_o_sp, bus.ARRAY, bus.SORTED_LIST);
		}
	}
}


module.exports = {
	load(ds_input, h_config, fk_load) {
		return new Consumer(ds_input, h_config, fk_load);
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

