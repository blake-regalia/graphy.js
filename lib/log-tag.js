'use strict';

var clc = require('cli-color');

var h_channels = {
    log: '',
    info: '',
    warn: '~',
    error: '!!!',
    good: '*',
    fail: 'FAILURE'
};

module.exports = {
    extend: function extend(k_exports, s_prefix) {
        Object.keys(h_channels).forEach(function (s_channel) {
            k_exports[s_channel] = function () {
                var a_args = [].slice.call(arguments);
                a_args.unshift('[' + s_prefix + ']:');
                if (h_channels[s_channel]) a_args.unshift(h_channels[s_channel]);
                (console[s_channel] || console.log).apply(console, a_args);
            };
        });

        k_exports.clc = clc;
    }
};