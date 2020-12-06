"use strict";
/* eslint-disable no-use-before-define */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var trig_partial_1 = require("./trig-partial");
var common_1 = require("../common");
var core_1 = require("../../core/core");
var c1GraphRole = core_1.DataFactory.c1Graph, c1SubjectRole = core_1.DataFactory.c1Subject, c1PredicateRole = core_1.DataFactory.c1Predicate, c1ObjectRole = core_1.DataFactory.c1Object, concise = core_1.DataFactory.concise, fromTerm = core_1.DataFactory.fromTerm;
var SemiIndexedTrigDataset = /** @class */ (function (_super) {
    __extends(SemiIndexedTrigDataset, _super);
    function SemiIndexedTrigDataset(h_objects, hc4_quads, h_prefixes) {
        var _this = _super.call(this, hc4_quads, h_prefixes) || this;
        _this._h_objects = h_objects;
        return _this;
    }
    SemiIndexedTrigDataset.prototype[Symbol.iterator] = function () {
        var h_prefixes, hc4_quads, _a, _b, _i, sc1_graph, kt_graph, hc3_triples, _c, _d, _e, sc1_subject, kt_subject, hc2_probs, _f, _g, _h, sc1_predicate, kt_predicate, as_objects, _j, as_objects_1, g_object, kt_object;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    h_prefixes = this._h_prefixes;
                    hc4_quads = this._hc4_quads;
                    _a = [];
                    for (_b in hc4_quads)
                        _a.push(_b);
                    _i = 0;
                    _k.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 10];
                    sc1_graph = _a[_i];
                    kt_graph = c1GraphRole(sc1_graph, h_prefixes);
                    hc3_triples = hc4_quads[sc1_graph];
                    _c = [];
                    for (_d in hc3_triples)
                        _c.push(_d);
                    _e = 0;
                    _k.label = 2;
                case 2:
                    if (!(_e < _c.length)) return [3 /*break*/, 9];
                    sc1_subject = _c[_e];
                    kt_subject = c1SubjectRole(sc1_subject, h_prefixes);
                    hc2_probs = hc3_triples[sc1_subject];
                    _f = [];
                    for (_g in hc2_probs)
                        _f.push(_g);
                    _h = 0;
                    _k.label = 3;
                case 3:
                    if (!(_h < _f.length)) return [3 /*break*/, 8];
                    sc1_predicate = _f[_h];
                    kt_predicate = c1PredicateRole(sc1_predicate, h_prefixes);
                    as_objects = hc2_probs[sc1_predicate];
                    _j = 0, as_objects_1 = as_objects;
                    _k.label = 4;
                case 4:
                    if (!(_j < as_objects_1.length)) return [3 /*break*/, 7];
                    g_object = as_objects_1[_j];
                    kt_object = c1ObjectRole(g_object.value, h_prefixes);
                    // yield quad
                    return [4 /*yield*/, core_1.DataFactory.quad(kt_subject, kt_predicate, kt_object, kt_graph)];
                case 5:
                    // yield quad
                    _k.sent();
                    _k.label = 6;
                case 6:
                    _j++;
                    return [3 /*break*/, 4];
                case 7:
                    _h++;
                    return [3 /*break*/, 3];
                case 8:
                    _e++;
                    return [3 /*break*/, 2];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/];
            }
        });
    };
    SemiIndexedTrigDataset.prototype._total_distinct_predicates = function () {
        // distinct predicates set
        var as_predicates = new Set();
        // ref objects store
        var h_objects = this._h_objects;
        // each object
        for (var sc1_object in h_objects) {
            // each predicate in object refs; add to set
            for (var sc1_predicate in Object.keys(h_objects[sc1_object].refs)) {
                as_predicates.add(sc1_predicate);
            }
        }
        // return set
        return as_predicates;
    };
    SemiIndexedTrigDataset.prototype._total_distinct_objects = function () {
        // distinct objects set
        var as_objects = new Set();
        // each object; add to set
        for (var sc1_object in this._h_objects) {
            as_objects.add(sc1_object);
        }
        // return set
        return as_objects;
    };
    SemiIndexedTrigDataset.prototype.distinctObjectCount = function () {
        return this._h_objects[common_1.$_KEYS];
    };
    return SemiIndexedTrigDataset;
}(trig_partial_1.PartiallyIndexedTrigDataset));
exports.SemiIndexedTrigDataset = SemiIndexedTrigDataset;
SemiIndexedTrigDataset.prototype.datasetStorageType = "\n\tdescriptor {\n\t\tvalue: c1;\n\t\trefs: {\n\t\t\t[p: c1]: s;\n\t\t};\n\t};\n\tobjects {\n\t\t[o: c1]: descriptor;\n\t};\n\tquads {\n\t\t[g: c1]: trips {\n\t\t\t[s: c1]: probs {\n\t\t\t\t[p: c1]: Set<descriptor>;\n\t\t\t};\n\t\t};\n\t};\n".replace(/\s+/g, '');
