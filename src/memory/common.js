"use strict";
exports.__esModule = true;
/**
 * Caches the number of 'keys' stored in the tree.
 */
exports.$_KEYS = Symbol('key-count');
/**
 * Tracks the total count of quads stored at all descendent levels of the tree.
 */
exports.$_QUADS = Symbol('quad-count');
/**
 * When present, indicates that the tree is overlaying another object via prototype.
 *   This allows for super quick set operations, such as `union` and `difference`, on
 *   the average case and significantly reduces memory consumption and GC time.
 */
exports.$_OVERLAY = Symbol('overlay-status');
/**
 * When present, indicates that the tree was used to create an overlay for another tree.
 *   The implication is that if `add` or `delete` is called on a buried tree, the method
 *   will have to create a new tree since the original object may still be referenced.
 */
exports.$_BURIED = Symbol('buried-status');
var Generic;
(function (Generic) {
    Generic.overlayTree = function (n_keys, n_quads) {
        if (n_keys === void 0) { n_keys = 0; }
        if (n_quads === void 0) { n_quads = 0; }
        var _a;
        return (_a = {},
            _a[exports.$_KEYS] = n_keys,
            _a[exports.$_QUADS] = n_quads,
            _a);
    };
    Generic.overlay = function (hcw_src) {
        // create new tree
        var hcw_dst = Object.create(hcw_src);
        // src is now buried
        hcw_src[exports.$_BURIED] = 1;
        // dst is an overlay
        hcw_dst[exports.$_OVERLAY] = 1;
        return hcw_dst;
    };
    Generic.trace = function (hcw_overlay) {
        // create dst tree
        var hcw_dst = {};
        // check each key
        for (var sv1_key in hcw_overlay) {
            hcw_dst[sv1_key] = hcw_overlay[sv1_key];
        }
        // copy key count and quad count
        hcw_dst[exports.$_KEYS] = hcw_overlay[exports.$_KEYS];
        hcw_dst[exports.$_QUADS] = hcw_overlay[exports.$_QUADS];
        return hcw_dst;
    };
})(Generic = exports.Generic || (exports.Generic = {}));
