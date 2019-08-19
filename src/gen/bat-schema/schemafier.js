
const explode_list = (a_list, sc1_list='bat:List', sc1_first='bat:first', sc1_rest='bat:rest', sc1_nil='bat:nil') => ({
	a: sc1_list,
	[sc1_first]: a_list.shift(),
	[sc1_rest]: a_list.length
		? explode_list(a_list, sc1_list, sc1_first, sc1_rest, sc1_nil)
		: sc1_nil,
});


class bat_datatype {
	constructor(k_bundle, sc1_datatype, z_datatype) {
		let g_rdf = {
			a: 'bat:Datatype',
		};

		// primitive datatype
		if('string' === typeof z_datatype) {
			g_rdf['rdfs:subClassOf'] = sc1_datatype;
		}
		// union
		else if(Array.isArray(z_datatype)) {
			let a_datatypes = z_datatype;
			for(let z_item of a_datatypes) {
				// tuple
				if(Array.isArray(z_item)) {
					Object.assign(g_rdf, explode_list(z_item, 'bat:DatatypeList'));
				}
			}
		}
		// direct concise-term struct
		else {
			Object.assign(g_rdf, z_datatype);
		}

		Object.assign(this, {
			bundle: k_bundle,
			iri: sc1_datatype,
			rdf: g_rdf,
		});
	}

	triplify(k_writer) {
		// add subject triples
		k_writer.add({
			[this.iri]: this.rdf,
		});

		// return as object
		return this.iri;
	}
}

class bat_encoding {
	constructor(k_bundle, sc1_encoding, g_descriptor) {
		let k_datatype = k_bundle.fetch(g_descriptor.datatype);

		Object.assign(this, {
			bundle: k_bundle,
			iri: sc1_encoding,
			datatype: k_datatype,
			call: g_descriptor.call,
		});
	}

	triplify(k_writer) {
		// return as object
		return this.iri;
	}

	decodify() {
		return this.call;
	}
}

class bat_member {
	constructor(k_bundle, s_member, sc1_member) {
		Object.assign(this, {
			bundle: k_bundle,
			name: s_member,
			object: sc1_member,
		});
	}

	triplify(k_writer) {
		// anonymous
		return {
			a: 'bat:Member',
			'bat:name': this.name,
			'bat:object': this.object,
		};
	}

	sourcify() {
		// fetch interface
		let k_interface = this.bundle.fetch(this.object);

		return /* syntax: js */ `
			this.${this.name} = ${k_interface.decodify()};
		`;
	}
}

class bat_overridable {
	constructor(k_bundle, sc1_interface, s_name, g_function) {
		Object.assign(this, {
			bundle: k_bundle,
			interface: sc1_interface,
			name: s_name,
			...g_function,
		});
	}

	triplify(k_writer) {
		return {
			'bat:parameters': explode_list(this.params || [], 'bat:ParameterList'),
		};
	}
}

class bat_generator extends bat_overridable {
	triplify(k_writer) {
		return {
			a: 'bat:Generator',
			...super.triplify(k_writer),
			'bat:yields': this.yields,
		};
	}

	sourcify() {
		return /* syntax: js */ `
			* ${this.name}(...a_args) {
				a_args;  // for debugging purposes
				// expected parameters: ${this.params.map(s => `<${s}>`).join(', ')}
				throw new Error("the generator '${this.name}' in the interface '${this.interface}' should be (but is not) overriden by the implementing subclass: "+this);
			}
		`;
	}
}

class bat_method extends bat_overridable {
	triplify(k_writer) {
		return {
			a: 'bat:Method',
			...super.triplify(k_writer),
			'bat:returns': this.returns,
		};
	}

	sourcify() {
		return /* syntax: js */ `
			${this.name}(...a_args) {
				a_args;  // for debugging purposes
				// expected parameters: ${this.params.map(s => `<${s}>`).join(', ')}
				throw new Error("the method '${this.name}' in the interface '${this.interface}' should be (but is not) overriden by the implementing subclass: "+this);
			}
		`;
	}
}

class bat_interface {
	constructor(k_bundle, sc1_interface, g_interface) {
		// super
		let k_super = k_bundle.fetch(g_interface.extends);

		// create members
		let a_members = [];
		if(g_interface.members) {
			for(let [s_member, sc1_member] of Object.entries(g_interface.members)) {
				a_members.push(new bat_member(k_bundle, s_member, sc1_member));
			}
		}

		// create methods
		let a_methods = [];
		if(g_interface.methods) {
			for(let [s_method, g_method] of Object.entries(g_interface.methods)) {
				a_methods.push(new bat_method(k_bundle, sc1_interface, s_method, g_method));
			}
		}

		// create generators
		let a_generators = [];
		if(g_interface.generators) {
			for(let [s_generator, g_generator] of Object.entries(g_interface.generators)) {
				a_generators.push(new bat_generator(k_bundle, sc1_interface, s_generator, g_generator));
			}
		}

		// save fields
		Object.assign(this, {
			bundle: k_bundle,
			iri: sc1_interface,
			members: a_members.length? a_members: null,
			methods: a_methods.length? a_methods: null,
			generators: a_generators.length? a_methods: null,
		});
	}

	name() {
		return this.iri.replace(/^.*([a-zA-Z0-9_.-]+)$/, '$1');
	}

	triplify(k_writer) {
		let g_write = {};

		if(this.extends) {
			g_write['bat:extends'] = this.extends;
		}

		// members; make ordered list
		if(this.members) {
			g_write['bat:members'] = [this.members.map(k => k.triplify(k_writer))];
		}

		// methods; make ordered list
		if(this.methods) {
			g_write['bat:methods'] = [this.methods.map(k => k.triplify(k_writer))];
		}

		// generators; make ordered list
		if(this.generators) {
			g_write['bat:generators'] = [this.generators.map(k => k.triplify(k_writer))];
		}

		// add subject triples
		k_writer.add({
			[this.iri]: g_write,
		});

		// return as object
		return this.iri;
	}

	sourcify() {
		let s_constructor = '';

		// auto-decoding class
		if(this.members) {
			let s_constructor_body = '';
			for(let k_member of this.members) {
				s_constructor_body += k_member.sourcify();
			}

			// add constructor method
			if(s_constructor_body) {
				s_constructor = /* syntax: js */ `
					constructor() {
						${s_constructor_body}
					}
				`;
			}
		}

		// superclass
		let s_extends = this.extends? /* syntax: js */ `extends dc_super`: '';

		// create interface / abstract class
		return /* syntax: js */ `
			dc_super => class ${s_extends} {
				${s_constructor}

				${this.methods.map(k => k.sourcify()).join('')}

				${this.generators.map(k => k.sourcify()).join('')}
			}
		`;
	}

	decodify() {
		return /* syntax: js */ `k_decoders.auto(kbd)`;
	}
}

class bat_field {
	constructor(k_bundle, s_field, sc1_field) {
		Object.assign(this, {
			bundle: k_bundle,
			name: s_field,
			object: sc1_field,
		});
	}

	triplify(k_writer) {
		return {
			a: 'bat:Field',
			'bat:name': this.name,
			'bat:object': this.object,
		};
	}
}

class bat_class {
	constructor(k_bundle, s_source) {
		Object.assign(this, {
			bundle: k_bundle,
			source: s_source,
		});
	}

	triplify(k_writer) {
		return {
			a: 'bat:Implementation',
			'bat:source': this.source,
		};
	}
}

class bat_protocol {
	constructor(k_bundle, sc1_protocol, g_protocol) {
		let a_fields = [];

		for(let [s_field, g_field] of Object.entries(g_protocol.fields)) {
			let k_field = new bat_field(k_bundle, s_field, g_field);

			a_fields.push(k_field);
		}

		if(g_protocol.class) {
			return new bat_class(k_bundle, g_protocol.class);
		}

		Object.assign(this, {
			bundle: k_bundle,
			iri: sc1_protocol,
			fields: a_fields.length? a_fields: [],
		});
	}

	name() {
		return this.iri.replace(/^.*([a-zA-Z0-9_.-]+)$/, '$1');
	}

	triplify(k_writer) {
		let g_write = {
			'bat:implements': this.implements,
		};

		// fields
		if(this.fields) {
			g_write['bat:fields'] = this.fields.map(k => k.triplify(k_writer));
		}

		// implementation
		if(this.class) {
			g_write['bat:class'] = this.class.triplify(k_writer);
		}

		// add subject triples
		k_writer.add({
			[this.iri]: g_write,
		});

		// return as object
		return this.iri;
	}
}

class bat_format {
	constructor(p_format, g_bundle) {
		// prep apriori fields
		Object.assign(this, {
			// prefix map
			prefixes: g_bundle.prefixes || {},

			// instance map
			refs: {},

			// absolute iri
			iri: p_format,

			// self rdf
			rdf: g_bundle,
		});

		// all things
		Object.assign(this, {
			datatypes: this.sc1_instance_map(bat_datatype, g_bundle.datatypes),
			encodings: this.sc1_instance_map(bat_encoding, g_bundle.encodings),
			interfaces: this.sc1_instance_map(bat_interface, g_bundle.interfaces),
			protocols: this.sc1_instance_map(bat_protocol, g_bundle.protocols),
		});
	}

	sc1_instance_map(dc_thing, a_things) {
		let {
			refs: h_refs,
			prefixes: h_prefixes,
		} = this;

		const factory = require('@graphy/core.data.factory');  // eslint-disable-line global-require

		let a_instances = [];
		for(let [sc1_thing, w_thing] of a_things) {
			// create datatype instance
			let k_instance = new dc_thing(this, sc1_thing, w_thing);

			// expand to full iri and save association to map
			h_refs[factory.c1(sc1_thing, h_prefixes)] = k_instance;

			// add datatype instance to list
			a_instances.push(k_instance);
		}

		return a_instances;
	}

	fetch(sc1_ref) {
		const factory = require('@graphy/core.data.factory');  // eslint-disable-line global-require

		return this.refs[factory.c1(sc1_ref, this.prefixes)];
	}

	triplify() {
		// writer
		let ds_writer = require('@graphy/content.ttl.write')({  // eslint-disable-line global-require
			prefixes: this.prefixes,
		});

		// output
		ds_writer.pipe(process.stdout);

		// self
		ds_writer.write({
			type: 'c3',
			value: {
				['>'+this.iri]: {
					a: 'bat:Format',
					...this.rdf,
				},
			},
		});

		// triplify each protocol (and consequently all their dependencies)
		for(let k_protocol of this.protocols) {
			k_protocol.triplify(this.writer);
		}

		// close writer
		ds_writer.end();
	}

	* sourcify() {
		// codify interfaces
		for(let k_interface of this.interfaces) {
			yield [k_interface.name(), k_interface.sourcify()];
		}

		// codify protocols
		for(let k_protocol of this.protocols) {
			yield [k_protocol.name(), k_protocol.sourcify()];
		}
	}
}


module.exports = (p_format, g_format) => new bat_format(p_format, g_format);
