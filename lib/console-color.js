'use strict';

var clc = require('cli-color');

var h_channels = {
	log: function log(z_) {
		return z_;
	},
	info: clc.blue,
	warn: clc.xterm(208),
	error: clc.red
};

var h_originals = {};

Object.keys(h_channels).forEach(function (s_channel) {
	var f_channel = h_originals[s_channel] = console[s_channel].bind(console);
	console[s_channel] = function () {
		f_channel.apply(console, [].slice.call(arguments).map(function (z_arg) {
			return h_channels[s_channel](z_arg);
		}));
	};
});

console.good = function () {
	h_originals.log.apply(console, [].slice.call(arguments).map(function (z_arg) {
		return clc.green(z_arg);
	}));
};

console.fail = function () {
	h_originals.error.apply(console, [].slice.call(arguments).map(function (z_arg) {
		return clc.xterm(196)(z_arg);
	}));
	console.error(new Error().stack.split(/\n/g).slice(4).join('\n'));
	// if (process && process.exit) process.exit(1);
	throw 'Exitting on fatal error';
};