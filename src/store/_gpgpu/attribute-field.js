
class AttributeField {
	constructor(k_graph, n_a, at_a_f) {
		Object.assign(this, {
			a_count: n_a,
		});

		at_a_f
	}

	find_a(xm_attributes) {
		return {
			fragmentShader: `
				#define FIND(q) find(input.q)
				uniform uint i_a;
				uniform uint a_f[];
				uniform float input_length;
				uniform sampler1D targets;
				uniform uint attribute_mask

				float find(float i_a) {
					return float(a_f[i_a] & attribute_mask);
				}

				void main() {
					int x = int(gl_FragCoord.x * input_length);
					vec4 input = texelFetch(targets, x);
					vec4 vOut = (
						FIND(r)
						FIND(g)
						FIND(b)
						FIND(a)
					);
					gl_FragColor = vOut;
				}
			`,
		};
	}
}