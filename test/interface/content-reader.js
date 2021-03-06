const stream = require('stream');

const bind = (s_until, k_reader, a_events_capture, fke_test) => {
	let h_events = a_events_capture.reduce((h_out, s_event) => ({
		...h_out,
		[s_event]: [],
	}), {});

	for(let s_event of a_events_capture) {
		k_reader.on(s_event, (...a_args) => {
			h_events[s_event].push(a_args);
		});
	}

	k_reader.on('error', (e_read) => {
		fke_test(e_read);
	});

	k_reader.on(s_until, () => {
		fke_test(null, h_events);
	});

	return h_events;
};

const summarize_events = (s_until, a_events_capture, fke_test) => {
	let h_events = a_events_capture.reduce((h_out, s_event) => ({
		...h_out,
		[s_event]: [],
	}), {});

	let h_inline = {
		error(e_read) {
			fke_test(e_read);
		},

		[s_until]() {
			fke_test(null, h_events);
		},
	};

	for(let s_event of a_events_capture) {
		let f_existing = h_inline[s_event];
		h_inline[s_event] = (...a_args) => {
			h_events[s_event].push(a_args);
			if(f_existing) f_existing();
		};
	}

	return h_inline;
};

const validate = (h_events, h_events_validate) => {
	for(let s_event in h_events_validate) {
		h_events_validate[s_event](h_events[s_event]);
	}
};

const asynchronously = (a_fs) => {
	if(!a_fs.length) return;

	setTimeout(() => {
		a_fs[0]();

		asynchronously(a_fs.slice(1));
	}, 5);
};

const graphy_reader_interface = ({
	reader: f_reader,
	input: s_input,
	events: h_events_validate,
}) => {
	let a_events_capture = Object.keys(h_events_validate);

	let a_untils = ['end', 'finish', 'eof'];
	for(let s_until of a_untils) {
		describe(`until '${s_until}'`, () => {

			describe('transform (no input)', () => {
				let h_cases = {
					'write w/ encoding then end': k_reader => [
						() => {
							// write w/ encoding
							k_reader.write(s_input, 'utf-8');
						},

						() => {
							// end writable
							k_reader.end();
						},
					],

					'write w/o encoding then end': k_reader => [
						() => {
							// write w/ encoding
							k_reader.write(s_input);
						},

						() => {
							// end writable
							k_reader.end();
						},
					],

					'end w/ encoding': k_reader => [
						() => {
							// end writable
							k_reader.end(s_input, 'utf-8');
						},
					],

					'end w/o encoding': k_reader => [
						() => {
							// end writable
							k_reader.end(s_input);
						},
					],
				};

				describe('.on events', () => {
					describe('sync', () => {
						for(let s_title in h_cases) {
							let f_case = h_cases[s_title];
							it(s_title, (fke_test) => {
								// create reader
								let k_reader = f_reader();

								// bind events
								bind(s_until, k_reader, a_events_capture, (e_read, h_events) => {
									if(e_read) return fke_test(e_read);

									// validate
									validate(h_events, h_events_validate);

									// done
									fke_test();
								});

								// run each test action
								let a_actions = f_case(k_reader);
								for(let f_action of a_actions) {
									f_action();
								}
							});
						}
					});

					describe('async', () => {
						for(let s_title in h_cases) {
							let f_case = h_cases[s_title];
							it(s_title, (fke_test) => {
								// create reader
								let k_reader = f_reader();

								// async
								asynchronously([
									() => {
										// bind events
										bind(s_until, k_reader, a_events_capture, (e_read, h_events) => {
											if(e_read) return fke_test(e_read);

											setTimeout(() => {
												// validate
												validate(h_events, h_events_validate);

												// done
												fke_test();
											}, 5);
										});
									},

									// spread cases
									...f_case(k_reader),
								]);
							});
						}
					});
				});  // .on events

				describe('inline events', () => {
					for(let s_title in h_cases) {
						let f_case = h_cases[s_title];
						it(s_title, (fke_test) => {
							// create reader
							let k_reader = f_reader(summarize_events(s_until, a_events_capture, (e_read, h_events) => {
								if(e_read) return fke_test(e_read);

								// validate
								validate(h_events, h_events_validate);

								// done
								fke_test();
							}));

							// run each test action
							let a_actions = f_case(k_reader);
							for(let f_action of a_actions) {
								f_action();
							}
						});
					}
				});  // inline events

				describe('inline events + .on listeners', () => {
					for(let s_title in h_cases) {
						let f_case = h_cases[s_title];
						it(s_title, (fke_test) => {
							let b_events_on = false;
							let b_events_inline = false;

							// create reader
							let k_reader = f_reader(summarize_events(s_until, a_events_capture, (e_read, h_events) => {
								if(e_read) return fke_test(e_read);

								// validate
								validate(h_events, h_events_validate);

								// .on events already done
								if(b_events_on) {
									// done w/ both now
									fke_test();
								}
								// first one done
								else {
									// done w/ inline
									b_events_inline = true;
								}
							}));

							// bind events
							bind(s_until, k_reader, a_events_capture, (e_read, h_events) => {
								if(e_read) return fke_test(e_read);

								// validate
								validate(h_events, h_events_validate);

								// .on events already done
								if(b_events_inline) {
									// done w/ both now
									fke_test();
								}
								// first one done
								else {
									b_events_on = true;
								}
							});

							// run each test action
							let a_actions = f_case(k_reader);
							for(let f_action of a_actions) {
								f_action();
							}
						});
					}
				});  // inline events + .on listeners
			});  // transform (no input)

			describe('input string', () => {
				it('.on events', ((fke_test) => {
					let k_reader = f_reader({
						input: {string:s_input},
					});

					bind(s_until, k_reader, a_events_capture, (e_read, h_events) => {
						if(e_read) return fke_test(e_read);

						// validate
						validate(h_events, h_events_validate);

						// done
						fke_test();
					});
				}));

				it('inline events', ((fke_test) => {
					f_reader({
						input: {string:s_input},
						...summarize_events(s_until, a_events_capture, (e_read, h_events) => {
							if(e_read) return fke_test(e_read);

							// validate
							validate(h_events, h_events_validate);

							// done
							fke_test();
						}),
					});
				}));
			});  // input string

			describe('input stream', () => {
				const stream_from_string = s_in => new stream.Readable({
					read() {
						this.push(s_in);
						this.push(null);
					},
				});

				it('.on events', ((fke_test) => {
					let k_reader = f_reader({
						input: {stream:stream_from_string(s_input)},
					});

					bind(s_until, k_reader, a_events_capture, (e_read, h_events) => {
						if(e_read) return fke_test(e_read);

						// validate
						validate(h_events, h_events_validate);

						// done
						fke_test();
					});
				}));

				it('inline events', ((fke_test) => {
					f_reader({
						input: {stream:stream_from_string(s_input)},
						...summarize_events(s_until, a_events_capture, (e_read, h_events) => {
							if(e_read) return fke_test(e_read);

							// validate
							validate(h_events, h_events_validate);

							// done
							fke_test();
						}),
					});
				}));
			});  // input stream
		});
	}
};

module.exports = graphy_reader_interface;
