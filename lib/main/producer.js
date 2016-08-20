
	trial() {


			@{if_k1('source')}

			@{else_if_km('source')}

			@{else_v('source')}
				// V?s[all]
				if(H_STOMP_ALL === hp_source_type) {
					@set S_test null

					// $: end of pattern
					if(!a_pattern.length) {
						@set S_act @{init_row()}

						// ?.p
						@{if_marked('edge')}
							@set P_act @{extend_row('source', 'edge', 'predicate')}

							// K.p[1]
							@{if_k1('edge')}
								@set P_test 'i_test_p === i_edge'
								@{edge_stomp()}

							// K.p[+]
							@{else_if_km('edge')}
								@set P_test 'h_edge_ids[i_test_p]'
								@{edge_stomp()}

							// V?p
							@{else_v('edge')}
								// Vp[all]
								if(H_STOMP_ALL === hp_edge_type) {
									@set P_test null
									@set P_act null
								}
								// ??
								else {
									throw 'invalid';
								}

						// ?p
						@{else_unmarked('edge')}
							@set P_act null

							//
						@{end_else()}
					}
					// ...: more pattern
					else {
						@set S_act null
					}


					@{if_marked('edge')}
						@{if_k1('edge')}
							@{if_marked('sink')}
								@{if_k1('sink')}
									// end of pattern
									if(!pattern.length) {
										// V.s[all] Kp[1] Ko[1] $
										@set S_act @{init_row()}
										@set P_test 'i_test_p === i_edge'
										@set P_act null
										@set O_test 'i_test_o === i_sink'
										@set O_act 'a_rows.push(h_row)'
										@{stomp(true, true)}
									}
									// more pattern
									else {
										// V.s[all] Kp[1] Ko[1] ...
										@{add_marks('source')}
										@set S_test null
										@set S_act null
										@set P_test 'i_test_p === i_edge'
										@set P_act null
										@set O_test 'i_test_o === i_sink'
										@set O_act 'a_ids.push(i_source)'
										@{stomp(true, true)}

										// then continue pattern...
										throw 'V.s[all] Kp[1] Ko[1] / continue pattern';
									}
								@{else_if_km('sink')}
									throw 'multiple sinks';
								@{else_v('sink')}
									// Vo[all]
									if(H_STOMP_ALL === hp_source_type) {
										// end of pattern
										if(!pattern.length) {
											// V.s[all] Kp[1] Vo[all] $
											@set S_test null
											@set S_act @{init_row()}
											@set P_test 'i_test_p === i_edge'
											@set P_act null
											@set O_test null
											@set O_act 'a_rows.push(h_row)'
											@{stomp(true, false)}
										}
										// more pattern
										else {
											// V.s[all] Kp[1] V[all] ...
											@{add_marks('source')}
											@set S_test null
											@set S_act null
											@set P_test 'i_test_p === i_edge'
											@set P_act null
											@set O_test null
											@set O_act 'a_rows.push(h_row)'
											@{stomp(true, false)}

											// then continue pattern...
											throw 'V.s[all] Kp[1] V[all] / continue pattern';
										}
									}
									// Vo[hops]
									else if(H_STOMP_HOPS === hp_source_type) {
										throw 'Vo[hops]';
									}
									// Vo[literals]
									else if(H_STOMP_LITERALS === hp_source_type) {
										throw 'Vo[literals]';
									}
									// ??
									else {
										throw 'invalid sink type';
									}
							@{else_unmarked('sink')}

							@{end_else()}
						@{else_if_km('edge')}
						@{else_v('edge')}
					@{else_unmarked('edge')}
					@{end_else()}
				}
				// Vs[hops]
				else if(H_STOMP_HOPS === hp_source_type) {

				}
				// ??
				else {
					throw 'invalid';
				}
		@{else_unmarked()}
			@{if_k1('source')}

			@{else_if_km('source')}

			@{else_v('source')}
				// Vs[all]
				if(H_STOMP_ALL === hp_source_type) {

				}
				// Vs[hops]
				else if(H_STOMP_HOPS === hp_source_type) {

				}
				// ??
				else {
					throw 'invalid';
				}
		@{end_else()}
	}


	first() {
		// local members
		let k_graph = this.graph;
		let h_prefix_lookup = k_graph.prefix_lookup;

		// prep list of results
		let a_rows = [];

		// marks
		let a_marks = [];

		//
		let a_pattern = this.context;

		// start with sources
		let h_source = a_pattern.shift();

		// source is marked
		let s_source_mark = h_source.mark;
		if(s_source_mark) {
			// add to marked list
			a_marks.push(s_source_mark);

			// Ks[1]
			if(h_source.id) {
				//  
			}
			// Ks[+]
			else if(h_source.ids) {
				// 
			}
			// Vs
			else {
				// ref type
				let hp_source_type = h_source.type;

				// Vs[all]: all source nodes
				if(H_STOMP_ALL === hp_source_type) {
					// ref edge
					let h_edge = a_pattern.shift();

					// Kp[1]
					if(h_edge.id) {

					}
					// Kp[+]
					else if(h_edge.ids) {

					}
					// Vp
					else {
						// ref edge type
						let hp_edge_type = h_edge.type;

						// Vp[all]
						if(H_STOMP_ALL === hp_edge_type) {
							// ref sink
							let h_sink = a_pattern.shift();

							// Ko[1]
							if(h_sink.id) {

							}
							// Ko[+]
							else if(h_sink.ids) {

							}
							// Vo
							else {
								// ref sink type
								let hp_sink_type = h_sink.type;

								// Vo[all]
								if(H_STOMP_ALL === hp_sink_type) {

								}
								// Vo[hops]
								else if(H_STOMP_HOPS === hp_sink_type) {

								}
								// Vo[literals]
								else if(H_STOMP_LITERALS === hp_sink_type) {

								}
								// Vo[nodes]
								else if(H_STOMP_NODES === hp_sink_type) {

								}
							}
						}
						// ??
						else {
							throw 'invalid'
						}
					}
				}
				// Vs[hops]: all hop nodes
				else if(H_STOMP_HOPS === hp_source_type) {

				}
				// ??
				else {
					throw 'invalid';
				}
			}
		}
		// no source_mark
		else {
			// Ks[1]
			if(h_source.id) {
				//  
			}
			// Ks[+]
			else if(h_source.ids) {
				// 
			}
			// Vs
			else {
				// ref type
				let hp_type = h_source.type;

				// Vs[all]: all source nodes
				if(H_STOMP_ALL === hp_type) {

				}
				// Vs[hops]: all hop nodes
				else if(H_STOMP_HOPS === hp_type) {

				}
				// ??
				else {
					throw 'invalid';
				}
			}
		}



	rows() {
		// local members
		let k_graph = this.graph;
		let h_prefix_lookup = k_graph.prefix_lookup;

		// prep list of results
		let a_rows = [];

		// marks
		let a_marks = [];

		//
		let a_pattern = this.context;

		// start with sources
		let h_source = a_pattern.shift();

		// ref source's mark (if it has one)
		let s_source_mark = h_source.mark;

		// add mark to array
		if(s_source_mark) a_marks.push(s_source_mark);

		// all source nodes
		if(H_STOMP_ALL === h_source.type) {

			// just all sources
			if(!a_pattern.length) {
				@{each_source()}
					a_rows.push({
						[s_source_mark]: k_graph.produce_subject(i_source),
					});
				@{end_each()}
			}
			// just subject/predicate pairs
			else if(1 === a_pattern.length) {
				
				throw 'to be implemented';
			}
			// probes: V -< {K,K,..} *
			else if(h_source.probes) {
				// prep list of paths from source that have all edges
				let a_source_paths = [];

				@ // turn probe list into edge hash
				@{probes_to_edges()}

				if(h_source.probe_first) {
					@ // test all probes against each source node at root triple level only
					@{each_source()}
						// list of the probe edges by id/offset
						let a_edges = [];

						// find all edges this source has
						@{find_edge()}
							// add edge/offset to list
							a_edges.push({
								id: i_test_p,
								offset: c_offset_data_p,
							});

							// this source has all edges
							if(++c_tried === n_probes) {
								// add to source list
								a_source_paths.push({
									source: i_source,
									edges: a_edges,
								});

								// stop scanning source's predicates
								break;
							}
						@{end_find_edge()}
					@{end_each()}

					// each remaining source node
					@{each('source_path', 'h')}
						// ref source
						let i_source = h_source_path.source;

						@ // initialize virgin row from source node
						@{init_row()}

						// collect rows for this source until we can decide whether or not to commit them all to output
						let a_collect = [];

						// whether to accept / reject source's paths
						let b_accept = 1;

						// each edge info
						let a_edge_infos = h_source_path.edges;
						@{each('edge_info', 'h')}
							// ref edge id
							let i_edge = h_edge_info.id;

							// copy probe path off this edge so we can mutate the list for each path
							let a_pattern_frag = h_edges[i_edge].slice(0);

							// continue hunting down path
							b_accept &= this.hunt(i_source, i_edge, h_edge_info.offset, a_pattern_frag, h_source_row, a_collect);

							// reject
							if(!b_accept) break;
						@{end_each()}

						// only if all edges were accepted
						if(b_accept) {
							// single result
							if(1 === a_collect.length) {
								// 
								if(!a_gather.length) {
									a_gather.push(a_combo[0]);
								}
							}
							// multiple rows
							else {
								console.dir(a_collect);
								// throw 'combinations';
							}
						}
					@{end_each()}
				}
				// triples-first probe
				else {
					@ // test all probes against each source node at root triple level only
					@{each_source()}
						@ // initialize virgin row from source node
						@{init_row()}

						// running list of all path combinations from source node
						let a_combos = [];

						// find each edges this source has
						@{find_edge()}
							// copy probe path off this edge so we can mutate list for each path
							let a_pattern_frag = h_edges[i_test_p].slice(0);

							// collect rows for this path so we can combine them with gather list
							let a_collect = [];

							// test path
							b_accept &= this.hunt(i_source, i_test_p, c_offset_data_p, a_pattern_frag, h_source_row, a_collect);

							// reject
							if(!b_accept) break;

							// first result(s), put into combos
							if(!a_combos.length) {
								a_combos = a_collect;
							}
							// there are previous results to combine with
							else {
								// single result
								if(1 === a_collect.length) {
									// ref result
									let h_row = a_collect[0];

									// merge row into every existing combo
									@{each('combo')}
										Object.assign(a_combos[i_combo], h_row);
									@{end_each()}
								}
								// multiple results
								else {
									// do all combinations
									@{each('combo', 'h', 'combo_row')}
										@{each('collect', 'h', 'row')}
											Object.assign(h_combo_row, h_row);
										@{end_each()}
									@{end_each()}
								}
							}

							// no more edges to test for this source
							if(++c_tried === n_probes) {
								// commit gatherings to rows
								a_rows.push.apply(a_rows, a_combos);
							}
						@{end_find_edge()}
					@{end_each()}
				}
			}
			// normal cross traversal
			else {
				// get edge
				let h_edge = a_pattern.shift();

				// edge has mark, add it to list
				let s_edge_mark = h_edge.mark;
				if(s_edge_mark) a_marks.push(s_edge_mark);

				// V K *
				if(h_edge.id) {
					// ref edge id
					let i_edge = h_edge.id;

					// get sink
					let h_sink = a_pattern.shift();

					// V K K
					if(h_sink.id) {
						// ref sink id
						let i_sink = h_sink.id;

						// end of path
						if(!a_pattern.length) {
							@ // each source node
							@{each_source()}
								@{init_row()}

								@ // each predicate belonging to this source node
								@{scan_data_p('i_source')}
									// found the target edge
									if(i_test_p === i_edge) {
										@ // each object in sp's adjacency list
										@{each_object()}
											// found target sink
											if(i_object === i_sink) {
												// validated this path
												a_rows.push(h_row);

												// done
												break;
											}
										@{end_each()}
									}
									// reached end of adjacency list
									else if(!i_test_p) {
										break;
									}
								@{end_scan()}
							@{end_each()}
						}
						// more path
						else { 
							let a_paths = [];

							@ // each source node
							@{each_source()}
								@ // each predicate belonging to this source node
								@{scan_data_p('i_source')}
									// found the target edge
									if(i_test_p === i_edge) {
										@ // each object in sp's adjacency list
										@{each_object()}
											// found target sink
											if(i_object === i_sink) {
												// validated this path (for now)
												a_paths.push({
													lineage: [h_source, h_edge, h_sink],
													source: i_object,
												});
											}
										@{end_each()}
									}
									// reached end of adjacency list
									else if(!i_test_p) {
										break;
									}
								@{end_scan()}
							@{end_each()}

							//
							this.carry(a_paths, a_pattern);
						}
					}
					// V K V
					else {
						let hp_type = h_sink.type;

						// V K V[all]
						if(H_STOMP_ALL === hp_type) {
							// ....
							throw 'all sinks';
						}
						// V K V[hops]
						else if(H_STOMP_HOPS === hp_type) {
							// end of path
							if(!a_pattern.length) {
								throw 'end of path: V K V[hops]';
							}
							// more path
							else {
								let a_paths = [];

								let i_hops = k_graph.count_d + k_graph.count_o;

								@ // each source node
								@{each_source()}
									@ // each predicate belonging to this source node
									@{scan_data_p('i_source')}
										// found the target edge
										if(i_test_p === i_edge) {
											@ // each object in sp's adjacency list
											@{each_object()}
												// viable sink
												if(i_object <= i_hops) {
													// validated this path (for now)
													a_paths.push({
														lineage: [h_source, h_edge, h_sink],
														source: i_object,
													});
												}
											@{end_each()}
										}
										// reached end of adjacency list
										else if(!i_test_p) {
											break;
										}
									@{end_scan()}
								@{end_each()}

								//
								this.carry(a_paths, a_pattern);
							}
						}
					}
				}
				// V V *
				else if(H_STOMP_SPAN === h_step.type) {
					throw 'span';
				}
			}
		}

		//
		return a_rows;
	}

	// K[hop] * *
	carry(a_paths, a_pattern) {
		let k_graph = this.graph;

		// get edge
		let h_edge = a_pattern.shift();
debugger;
		// K V *
		if(H_STOMP_ALL === h_edge.type) {
			@{each('path', 'h')}
				let i_source = h_path.source;

				// K K 

				@ // each predicate belonging to this source node
				@{scan_data_p('i_source')}
					// found the target edge
					if(i_test_p === i_edge) {
						@ // each object in sp's adjacency list
						@{each_object()}
							// found target sink
							if(i_object === i_sink) {
								// validated this path (for now)
								a_paths.push({
									lineage: [h_source, h_edge, h_sink],
									source: i_object,
								});
							}
						@{end_each()}
					}
					// reached end of adjacency list
					else if(!i_test_p) {
						break;
					}
				@{end_scan()}

			@{end_each()}
		}
		// K K *
		else {
			// get sink
			let h_sink = a_pattern.shift();

			// K K K[1]
			if(h_sink.id) {
				@ // each source
				@{each('path', 'h')}
					let i_source = h_path.source;
					@ // each predicate belonging to this source node
					@{scan_data_p('i_source')}
						// found the target edge
						if(i_test_p === i_edge) {
							@ // each object in sp's adjacency list
							@{each_object()}
								// found target sink
								if(i_object === i_sink) {
									// validated this path (for now)
									a_paths.push({
										lineage: [h_source, h_edge, h_sink],
										source: i_object,
									});
								}
							@{end_each()}
						}
						// reached end of adjacency list
						else if(!i_test_p) {
							break;
						}
					@{end_scan()}
				@{end_each()}
			}
			// K K K[+]
			else if(h_sink.ids) {
				throw 'multiple sinks';
			}
			// K K V
			else {
				let hp_type = h_sink.type;

				// K K V[all]
				if(H_STOMP_ALL === hp_type) {
					@ // each source
					@{each('path', 'h')}
						let i_source = h_path.source;
						@ // each predicate belonging to this source node
						@{scan_data_p('i_source')}
							// found the target edge
							if(i_test_p === i_edge) {
								// ref lineage
								let a_lineage = h_path.lineage;

								@ // each object in sp's adjacency list
								@{each_object()}
									// validated this path (for now)
									a_lineage.push([h_source, h_edge, h_sink]);

									a_paths.push({
										lineage: [h_source, h_edge, h_sink],
										source: i_object,
									});
								@{end_each()}
							}
							// reached end of adjacency list
							else if(!i_test_p) {
								break;
							}
						@{end_scan()}
					@{end_each()}
				}
				// K K V[hops]
				else if(H_STOMP_HOPS === hp_type) {

				}
				// K K V[nodes]
				else if(H_STOMP_NODES === hp_type) {

				}
				// K K V[literals]
				else if(H_STOMP_LITERALS === hp_type) {

				}
			}
		}
	}

	hunt(i_source, i_edge, c_offset_data_p, a_path, h_row, a_rows) {
		let k_graph = this.graph;

		// ref target vertex
		let h_target = a_path.shift();

		//
		let s_target_mark = h_target.mark;

		// target has vertex id
		if(h_target.id) {
			let i_target = h_target.id;

			@ // each object in sp's adjacency list
			@{each_object()}
				// found target 
				if(i_object === i_target) {
					// vv this is pointless because the target is already known (maybe do it outside the loop)
					// // target is marked
					// if(s_target_mark) {
					// 	a_rows.push(Object.create(h_row, {
					// 		[s_target_mark]: k_graph.produce_object(i_object);
					// 	}));
					// }

					// change this later to continuing the hunt for predicate/object pairs
					if(!a_path.length) {
						a_rows.push(h_row);
					}
					else {
						throw 'more segments in path remain';
					}

					// all done
					return true;
				}
			@{end_each()}
		}
		else {
			throw 'dunno yet how to test for vertex that has no id';
		}

		return false;
	}




	*iterator() {
		// local members
		let k_graph = this.graph;
		let h_prefix_lookup = k_graph.prefix_lookup;

		//
		let k_root  = this.context;
		let a_marked = k_root.marked;

		//
		@{each_bucket()}
			@{each_path()}
				// prep base
				let h_base = {};

				// each mark
				for(let i_mark=0; i_mark<a_marked.length; i_mark++) {
					let h_mark = a_marked[i_mark];

					// ref path fix index
					let i_fix = h_mark.index;

					// thing is vertex
					if(0 === i_fix) {
						// produce subject node and save to row at designated key
						h_base[h_mark.name] = k_graph.produce_subject(a_path[i_fix]);
					}
					else if(0 === i_fix % 2) {
						// produce vertex and save to row at designated key
						h_base[h_mark.name] = k_graph.produce_object(a_path[i_fix]);
					}
					// thing is predicate
					else {
						// produce vertex and save to row at designated key
						h_base[h_mark.name] = k_graph.produce_predicate(a_path[i_fix]);
					}
				}

				// bucket has branches
				let a_branches = k_bucket.branches;
				if(a_branches.length) {
					// build out from this path
					let a_row_group = this.build(a_branches, i_path, [h_base]);
					
					// flatten row group
					let n_rows = a_row_group.length;
					for(let i_row=0; i_row<n_rows; i_row++) {
						yield a_row_group[i_row];
					}
				}
				// root bucket is end-of-line
				else {
					// add base as row
					yield h_base;
				}
			@{end_each()}
		@{end_each()}
	}




										// V.s[all] Kp[1] Ko[1] $
										@{each_source()}
											@{init_row()}
											@{each_edge()}
												if(i_test_p === i_edge) {
													@{each_object()}
														if(i_test_o === i_sink) {
															// add row to list
															a_rows.push(h_row);

															// done searching object list
															break;
														}
													@{end_each()}

													// done searching predicate list
													break;
												}
											@{end_each()}
										@{end_each()}


										// V.s[all] Kp[1] Ko[1] ...
										@{add_marks('source')}
										@{each_source()}
											@{each_edge()}
												if(i_test_p === i_edge) {
													@{each_object()}
														if(i_test_o === i_sink) {
															// add marked source to ids
															a_ids.push([i_source]);

															// done searching object list
															break;
														}
													@{end_each()}

													// done searching predicate list
													break;
												}
											@{end_each()}
										@{end_each()}


											// V.s[all] Kp[1] V[all] $
											@{each_source()}
												@{init_row()}
												@{each_edge()}
													if(i_test_p === i_edge) {
														@{each_object()}
															// add row to list
															a_rows.push(h_row);
														@{end_each()}

														// done searching predicate list
														break;
													}
												@{end_each()}
											@{end_each()}


											// V.s[all] Kp[1] V[all] ...
											@{add_marks('source')}
											@{each_source()}
												@{each_edge()}
													if(i_test_p === i_edge) {
														@{each_object()}
															// add marked source to ids
															a_ids.push([i_source]);
														@{end_each()}

														// done searching predicate list
														break;
													}
												@{end_each()}
											@{end_each()}





@macro 
	// whether or not to accept this path
	let b_accept = 1;

	// count how many probe attempts so we know when to stop
	let c_tried = 0;
	let a_gather = [];

	scanning: {
		@ // each predicate belonging to this source node
		@{scan_data_p('i_source')}
			// found one of the necessary probe edges
			if(h_edges[i_test_p]) {
				// copy probe path off this edge so we can mutate the list for each path
				let a_pattern_frag = h_edges[i_test_p].slice(0);

				// collect all rows separately until we can decide whether or not to commit them to output
				let a_collect = [];

				// continue hunting down path
				b_accept &= this.hunt(i_source, i_test_p, c_offset_data_p, a_pattern_frag, h_row, a_collect);

				// reject
				if(!b_accept) {
					break scanning;
				}
				// single result
				else if(1 === a_collect.length) {
					// 
					if(!a_gather.length) {
						a_gather.push(a_combo[0]);
					}
				}
				// multiple rows
				else {
					throw 'combinations';
				}

				// while counting probe attempts; all probes have now been explored
				if(++c_tried === n_probes) break;
			}
			// reached end of adjacency list
			else if(!i_test_p) {
				break;
			}
		@{end_scan()}
	}

	// all probe edges have been found
	if(b_accept) {
		a_rows.push.apply(a_rows, a_gather);
	}
@end

		//
		let n_steps = a_pattern.length;
		for(let i_step=0; i_step<n_steps; i_step++) {
			let h_source = a_pattern[i_step];

			let s_source_mark = h_source.mark;

			// V -* * *
			if(H_STOMP_ALL === h_source.type) {

				// probes: V -< K,K *
				if(h_source.probes) {
					let a_probes = h_source.probes.slice();

					//
					let h_edges = {};
					let n_probes = a_probes.length;
					for(let i_probe=0; i_probe<n_probes; i_probe++) {
						let i_edge = a_probes[i_probe][0].id;
						let a_group = h_edges[i_edge] = h_edges[i_edge] || [];
						a_group.push(a_probes[i_probe].slice(1));
					}

					@ // each source node
					@{each_source()}
						// prep row base
						let h_row = {};

						// source is marked
						if(s_source_mark) {
							h_row = {
								[s_source_mark]: k_graph.produce_subject(i_source),
							};
						}

						//
						let b_accept = 1;
						let c_tried = 0;
						let a_gather = [];

						@ // each predicate belonging to this source node
						scanning: {
							@{scan_data_p('i_source')}
								// found one of the necessary probe edges
								if(h_edges[i_test_p]) {
									// each probe path having this edge
									let a_group = h_edges[i_test_p];
									for(let i_probe=0; i_probe<a_group.length; i_probe++) {
										let a_path = a_group[i_probe];
										let a_combo = [];

										// continue hunting down path
										b_accept &= this.hunt(i_source, i_test_p, c_offset_data_p, a_path.slice(0), h_row, a_combo);

										// reject
										if(!b_accept) {
											break scanning;
										}
										// single results
										else if(1 === a_combo.length) {
											if(!a_gather.length) {
												a_gather.push(a_combo[0]);
											}
										}
										// multiple rows
										else {
											throw 'combinations';
										}

										// count how many probes have been attempted
										c_tried += 1;
									}

									// all probes have been explored
									if(c_tried === n_probes) break;
								}
								// reached end of adjacency list
								else if(!i_test_p) {
									break;
								}
							@{end_scan()}
						}

						// all probe edges have been found
						if(b_accept) {
							a_rows.push.apply(a_rows, a_gather);
						}
					@{end_each()}
				}
				// V -- * *
				else {
					// get edge
					let h_edge = a_pattern[++i_step];

					// V K *
					if(h_edge.id) {
						// ref edge id
						let i_edge = h_edge.id;

						// get sink
						let h_sink = a_pattern[++i_step];

						// V K K
						if(h_sink.id) {
							// ref sink id
							let i_sink = h_sink.id;

							@ // each source node
							@{each_source()}
								// prep row
								let h_row = {
									[s_source_mark]: k_graph.produce_subject(i_source),
								};

								@ // each predicate belonging to this source node
								source_scan: {
									@{scan_data_p('i_source')}
										// found the target edge
										if(i_test_p === i_edge) {
											@ // each object in sp's adjacency list
											@{each_object()}
												// found target sink
												if(i_object === i_sink) {
													//
													a_rows.push(h_row);
												}
											@{end_each()}
										}
										// reached end of adjacency list
										else if(!i_test_p) {
											break;
										}
									@{end_scan()}
								}
							@{end_each()}
						}
						// V K V
						else {
							// V K V[all]
							if(H_STOMP_ALL === h_sink.type) {
								// ....
							}
						}
					}
					// V V *
					else if(H_STOMP_SPAN === h_step.type) {
						throw 'span';
					}
				}
			}
		}