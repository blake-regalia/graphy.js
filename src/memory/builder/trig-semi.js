"use strict";
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
var core_1 = require("@graphy/core");
var c1GraphRole = core_1.DataFactory.c1GraphRole, c1SubjectRole = core_1.DataFactory.c1SubjectRole, c1PredicateRole = core_1.DataFactory.c1PredicateRole, c1ObjectRole = core_1.DataFactory.c1ObjectRole, concise = core_1.DataFactory.concise, fromTerm = core_1.DataFactory.fromTerm;
/**
 * @fileoverview
 * The following table indicates the names for various groupings of RDF term roles:
 *
 *  ┌─────────┬───────────┬─────────────┬──────────┐
 *  │ <graph> ┊ <subject> ┊ <predicate> ┊ <object> │
 *  ├─────────┴───────────┼─────────────┴──────────┤
 *  │        grub         │           prob         │
 *  ├─────────────────────┴─────────────┬──────────┤
 *  │               greed               │░░░░░░░░░░│
 *  ├─────────┬─────────────────────────┴──────────┤
 *  │░░░░░░░░░│         spred           │░░░░░░░░░░│
 *  ├─────────┼─────────────────────────┴──────────┤
 *  │░░░░░░░░░│               triple               │
 *  ├─────────┴────────────────────────────────────┤
 *  │                      quad                    │
 *  └──────────────────────────────────────────────┘
 *
 */
var $_KEYS = Symbol(' (keys)');
var $_QUADS = Symbol(' (quads)');
var SemiIndexedGreedHandle = /** @class */ (function () {
    function SemiIndexedGreedHandle(kh_grub, sc1_predicate, as_objects) {
        this._k_dataset = kh_grub._k_dataset;
        this._kh_grub = kh_grub;
        this._sc1_subject = kh_grub._sc1_subject;
        this._sc1_predicate = sc1_predicate;
        this._as_objects = as_objects;
    }
    SemiIndexedGreedHandle.prototype.addC1Object = function (sc1_object) {
        var _a;
        // ref object store
        var h_objects = this._k_dataset._h_objects;
        var as_objects = this._as_objects;
        // prep object descriptor
        var g_object;
        // object exists in store
        if (sc1_object in h_objects) {
            // ref object descriptor
            g_object = h_objects[sc1_object];
            // triple already exists; nothing was added
            if (as_objects.has(g_object)) {
                return false;
            }
            // triple not yet exists, subject guaranteed to not yet exist in predicate-specific references
            else {
                // ref predicate
                var sc1_predicate = this._sc1_predicate;
                // ref references
                var h_refs = g_object.refs;
                // predicate exists in references
                if (sc1_predicate in h_refs) {
                    // add subject to set
                    h_refs[sc1_predicate].add(this._sc1_subject);
                }
                // predicate not yet exists in references
                else {
                    // create reference
                    h_refs[sc1_predicate] = new Set([this._sc1_subject]);
                    // update keys counter on references
                    h_refs[$_KEYS] += 1;
                }
                // update quads counter on references
                h_refs[$_QUADS] += 1;
                // jump to add
            }
        }
        // object not yet exists in store
        else {
            // create object descriptor
            g_object = h_objects[sc1_object] = {
                value: sc1_object,
                refs: (_a = {},
                    _a[$_KEYS] = 1,
                    _a[$_QUADS] = 1,
                    _a[this._sc1_predicate] = new Set([this._sc1_subject]),
                    _a)
            };
        }
        // insert into object set
        as_objects.add(g_object);
        // ref quads tree
        var hc4_quads = this._k_dataset._hc4_quads;
        // update quads counter on quads tree
        hc4_quads[$_QUADS] += 1;
        // ref triples tree
        var hc3_triples = hc4_quads[this._kh_grub._kh_graph._sc1_graph];
        // update quads counter on triples tree
        hc3_triples[$_QUADS] += 1;
        // update quads counter on probs tree
        hc3_triples[this._sc1_subject][$_QUADS] += 1;
        // new triple added
        return true;
    };
    SemiIndexedGreedHandle.prototype.deleteC1Object = function (sc1_object) {
        // ref object store
        var h_objects = this._k_dataset._h_objects;
        // object not exists in store
        if (!(sc1_object in h_objects))
            return false;
        // prep object descriptor
        var g_object = h_objects[sc1_object];
        // confine scope
        {
            // ref set of objects
            var as_objects = this._as_objects;
            // triple not exists
            if (!as_objects.has(g_object))
                return false;
            // ref quads tree
            var hc4_quads = this._k_dataset._hc4_quads;
            // decrement store-level quad counter
            hc4_quads[$_QUADS] -= 1;
            OPSG: {
                // ref grub handle
                var kh_grub = this._kh_grub;
                // ref graph handle
                var kh_graph = kh_grub._kh_graph;
                // ref triples tree
                var hc3_triples = kh_graph._hc3_triples;
                PSG: {
                    // ref probs tree
                    var hc2_probs = kh_grub._hc2_probs;
                    // ref probs key count
                    var nl_keys_probs = hc2_probs[$_KEYS];
                    // last object associated with this greed
                    if (1 === as_objects.size) {
                        // last predicate associated with this grub
                        if (1 === nl_keys_probs) {
                            // ref triples key count
                            var nl_keys_triples = hc3_triples[$_KEYS];
                            // last subject associated with this graph, not default graph
                            if (1 === nl_keys_triples && '*' !== kh_graph._sc1_graph) {
                                // drop given graph
                                delete hc4_quads[kh_graph._sc1_graph];
                                // decrement key counter
                                hc4_quads[$_KEYS] -= 1;
                                // no need to decrement others
                                break OPSG;
                            }
                            // other subjects remain or keeping default graph
                            else {
                                // drop triples tree for given subject
                                delete hc3_triples[this._sc1_subject];
                                // decrement key counter
                                hc3_triples[$_KEYS] = nl_keys_triples - 1;
                                // no need to decrement others
                                break PSG;
                            }
                        }
                        // other predicates remain
                        else {
                            // drop probs tree for given predicate
                            delete hc2_probs[this._sc1_predicate];
                            // decrement key counter
                            hc2_probs[$_KEYS] = nl_keys_probs - 1;
                        }
                    }
                    // other objects remain
                    else {
                        // delete object from set
                        as_objects["delete"](g_object);
                    }
                    // decrement subject-level quad counter
                    hc2_probs[$_QUADS] -= 1;
                }
                // decrement graph-level quad counter
                hc3_triples[$_QUADS] -= 1;
            }
        }
        // ref object descriptor
        var h_refs = g_object.refs;
        // ref subjects list
        var as_subjects = h_refs[this._sc1_predicate];
        // last subject associated with this prob
        if (1 === as_subjects.size) {
            // ref key count
            var nl_keys_refs = h_refs[$_KEYS];
            // last tuple associated with this object
            if (1 === nl_keys_refs) {
                // delete object from store
                delete h_objects[sc1_object];
                // decrement object key count
                h_objects[$_KEYS] -= 1;
            }
            // other tuples remain
            else {
                // delete predicate from refs
                delete h_refs[this._sc1_predicate];
                // decrement keys counter on references
                h_refs[$_KEYS] -= 1;
            }
        }
        // other subjects remain
        else {
            // delete subject from subjects list
            as_subjects["delete"](this._sc1_subject);
        }
        // deleted object
        return true;
    };
    return SemiIndexedGreedHandle;
}());
var SemiIndexedGrubHandle = /** @class */ (function () {
    function SemiIndexedGrubHandle(k_dataset, kh_graph, sc1_subject, hc2_probs) {
        this._k_dataset = k_dataset;
        this._kh_graph = kh_graph;
        this._sc1_subject = sc1_subject;
        this._hc2_probs = hc2_probs;
    }
    SemiIndexedGrubHandle.prototype.openC1Predicate = function (sc1_predicate) {
        // increment keys counter
        var hc2_probs = this._hc2_probs;
        // predicate exists; return tuple handle
        if (sc1_predicate in hc2_probs) {
            return new SemiIndexedGreedHandle(this, sc1_predicate, hc2_probs[sc1_predicate]);
        }
        else {
            // increment keys counter
            hc2_probs[$_KEYS] += 1;
            // create predicate w/ empty objects set
            var as_objects = hc2_probs[sc1_predicate] = new Set();
            // return tuple handle
            return new SemiIndexedGreedHandle(this, sc1_predicate, as_objects);
        }
    };
    return SemiIndexedGrubHandle;
}());
var SemiIndexedGraphHandle = /** @class */ (function () {
    function SemiIndexedGraphHandle(k_dataset, sc1_graph, hc3_triples) {
        this._k_dataset = k_dataset;
        this._sc1_graph = sc1_graph;
        this._hc3_triples = hc3_triples;
    }
    SemiIndexedGraphHandle.prototype.openC1Subject = function (sc1_subject) {
        var _a;
        // ref triples tree
        var hc3_triples = this._hc3_triples;
        // subject exists; return subject handle
        if (sc1_subject in hc3_triples) {
            return new SemiIndexedGrubHandle(this._k_dataset, this, sc1_subject, hc3_triples[sc1_subject]);
        }
        else {
            // increment keys counter
            hc3_triples[$_KEYS] += 1;
            // create subject w/ empty probs tree
            var hc2_probs = hc3_triples[sc1_subject] = (_a = {},
                _a[$_KEYS] = 0,
                _a[$_QUADS] = 0,
                _a);
            // return subject handle
            return new SemiIndexedGrubHandle(this._k_dataset, this, sc1_subject, hc2_probs);
        }
    };
    return SemiIndexedGraphHandle;
}());
function graph_to_c1(yt_graph, h_prefixes) {
    // depending on graph term type
    switch (yt_graph.termType) {
        // default graph
        case 'DefaultGraph': {
            return '*';
        }
        // named node
        case 'NamedNode': {
            return concise(yt_graph.value, h_prefixes);
        }
        // blank node
        default: {
            return '_:' + yt_graph.value;
        }
    }
}
/**
 * Trig-Optimized, Semi-Indexed Dataset in Memory
 * YES: ????, g???, g??o, g?po, gs??, gsp?, gspo
 * SOME: gs?o
 * NOT: ???o, ??p?, ??po, ?s??, ?s?o, ?sp?, ?spo, g?p?
 */
var SemiIndexedTrigDataset = /** @class */ (function () {
    function SemiIndexedTrigDataset(h_prefixes) {
        var _a, _b, _c;
        if (h_prefixes === void 0) { h_prefixes = {}; }
        this._sc1_graph = '*';
        this._h_prefixes = h_prefixes;
        this._h_objects = (_a = {},
            _a[$_KEYS] = 0,
            _a);
        var hc3_triples = this._hc3_triples = (_b = {},
            _b[$_KEYS] = 0,
            _b[$_QUADS] = 0,
            _b);
        this._hc4_quads = (_c = {},
            _c[$_KEYS] = 1,
            _c[$_QUADS] = 0,
            _c['*'] = hc3_triples,
            _c);
    }
    Object.defineProperty(SemiIndexedTrigDataset.prototype, "size", {
        get: function () {
            return this._hc4_quads[$_QUADS];
        },
        enumerable: true,
        configurable: true
    });
    SemiIndexedTrigDataset.prototype.deliver = function () {
        return new SemiIndexedTrigDataset();
    };
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
    SemiIndexedTrigDataset.prototype.distinctGraphCount = function () {
        // graph count
        return this._hc4_quads[$_KEYS];
    };
    SemiIndexedTrigDataset.prototype.distinctSubjectCount = function () {
        // only default graph
        if (1 === this._hc4_quads[$_KEYS]) {
            return this._hc3_triples[$_KEYS];
        }
        // multiple graphs
        else {
            var as_subjects = new Set();
            for (var sc1_graph in this._hc4_quads) {
                as_subjects = new Set(as_subjects.concat(Object.keys(this._hc4_quads[sc1_graph])));
            }
            return as_subjects.size;
        }
    };
    SemiIndexedTrigDataset.prototype.distinctPredicateCount = function () {
        // only default graph
        if (1 === this._hc4_quads[$_KEYS]) {
            var as_predicates = new Set();
            for (var sc1_predicate in this._hc3_triples) {
                as_predicates.add(sc1_predicate);
            }
            return as_predicates.size;
        }
        // multiple graphs
        else {
            var as_predicates = new Set();
            var h_objects = this._h_objects;
            for (var sc1_object in h_objects) {
                for (var sc1_predicate in Object.keys(h_objects[sc1_object].refs)) {
                    as_predicates.add(sc1_predicate);
                }
            }
            return as_predicates.size;
        }
    };
    SemiIndexedTrigDataset.prototype.distinctObjectCount = function () {
        return this._h_objects[$_KEYS];
    };
    SemiIndexedTrigDataset.prototype.attachPrefixes = function (h_prefixes) {
        this._h_prefixes = h_prefixes;
    };
    SemiIndexedTrigDataset.prototype.openC1Graph = function (sc1_graph) {
        var _a;
        // ref quads tree
        var hc4_quads = this._hc4_quads;
        // graph exists; return subject handle
        if (sc1_graph in hc4_quads) {
            return new SemiIndexedGraphHandle(this, sc1_graph, hc4_quads[sc1_graph]);
        }
        else {
            // increment keys counter
            hc4_quads[$_KEYS] += 1;
            // create graph w/ empty triples tree
            var hc3_triples = hc4_quads[sc1_graph] = (_a = {},
                _a[$_KEYS] = 0,
                _a[$_QUADS] = 0,
                _a);
            // return subject handle
            return new SemiIndexedGraphHandle(this, sc1_graph, hc3_triples);
        }
    };
    SemiIndexedTrigDataset.prototype.openC1Subject = function (sc1_subject) {
        var _a;
        // ref default graph triples tree
        var hc3_triples = this._hc3_triples;
        // subject exists; return subject handle
        if (sc1_subject in hc3_triples) {
            return new SemiIndexedGrubHandle(this, this, sc1_subject, hc3_triples[sc1_subject]);
        }
        // subject not yet exists
        else {
            // increment keys counter
            hc3_triples[$_KEYS] += 1;
            // create subject w/ empty probs tree
            var hc2_probs = hc3_triples[sc1_subject] = (_a = {},
                _a[$_KEYS] = 0,
                _a[$_QUADS] = 0,
                _a);
            // return subject handle
            return new SemiIndexedGrubHandle(this, this, sc1_subject, hc2_probs);
        }
    };
    SemiIndexedTrigDataset.prototype.addTriple = function (sc1_subject, sc1_predicate, sc1_object) {
        return this.openC1Subject(sc1_subject).openC1Predicate(sc1_predicate).addC1Object(sc1_object);
    };
    SemiIndexedTrigDataset.prototype.add = function (g_quad) {
        var h_prefixes = this._h_prefixes;
        var yt_subject = g_quad.subject;
        this.openC1Graph(graph_to_c1(g_quad.graph, h_prefixes))
            .openC1Subject('NamedNode' === yt_subject.termType ? concise(yt_subject.value, h_prefixes) : '_:' + yt_subject.value)
            .openC1Predicate(concise(g_quad.predicate.value, h_prefixes))
            .addC1Object(fromTerm(g_quad.object).concise(h_prefixes));
        return this;
    };
    SemiIndexedTrigDataset.prototype.has = function (g_quad) {
        // ref prefixes
        var h_prefixes = this._h_prefixes;
        // fetch triples tree
        var hc3_triples = this._hc4_quads[graph_to_c1(g_quad.graph, h_prefixes)];
        // none
        if (!hc3_triples)
            return false;
        // ref subject
        var yt_subject = g_quad.subject;
        // create subject c1
        var sc1_subject = 'NamedNode' === yt_subject.termType ? concise(yt_subject.value, h_prefixes) : '_:' + yt_subject.value;
        // fetch probs tree
        var hc2_probs = hc3_triples[concise(sc1_subject, h_prefixes)];
        // none
        if (!hc2_probs)
            return false;
        // fetch objects list
        var as_objects = hc2_probs[concise(g_quad.predicate.value, h_prefixes)];
        // none
        if (!as_objects)
            return false;
        // create object c1
        var sc1_object = fromTerm(g_quad.object).concise(h_prefixes);
        // object exists in store
        var g_object = this._h_objects[sc1_object];
        // no object
        if (!g_object)
            return false;
        // use native set .has()
        return as_objects.has(g_object);
    };
    SemiIndexedTrigDataset.prototype["delete"] = function (g_quad) {
        var h_prefixes = this._h_prefixes;
        var yt_subject = g_quad.subject;
        this.openC1Graph(graph_to_c1(g_quad.graph, h_prefixes))
            .openC1Subject('NamedNode' === yt_subject.termType ? concise(yt_subject.value, h_prefixes) : '_:' + yt_subject.value)
            .openC1Predicate(concise(g_quad.predicate.value, h_prefixes))
            .deleteC1Object(fromTerm(g_quad.object).concise(h_prefixes));
        return this;
    };
    SemiIndexedTrigDataset.prototype.match = function (yt_subject, yt_predicate, yt_object, yt_graph) {
        return new SemiIndexedTrigDataset();
    };
    SemiIndexedTrigDataset.supportsStar = false;
    return SemiIndexedTrigDataset;
}());
exports.SemiIndexedTrigDataset = SemiIndexedTrigDataset;
// DatasetFactory.semiIndexedTrigOptimized
// ByteOtimized {
// 	P: {
// 		S: {
// 			O: [G],
// 		}
// 	},
// }
