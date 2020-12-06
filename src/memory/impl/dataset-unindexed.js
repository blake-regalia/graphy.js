"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var core_data_factory_1 = require("@graphy/core.data.factory");
var c1GraphRole = core_data_factory_1.DataFactory.c1GraphRole, c1SubjectRole = core_data_factory_1.DataFactory.c1SubjectRole, c1PredicateRole = core_data_factory_1.DataFactory.c1PredicateRole, c1ObjectRole = core_data_factory_1.DataFactory.c1ObjectRole, concise = core_data_factory_1.DataFactory.concise, fromTerm = core_data_factory_1.DataFactory.fromTerm;
var UnindexedGreedHandle = /** @class */ (function () {
    function UnindexedGreedHandle(k_dataset, scp_greed) {
        this._as_quads = k_dataset._as_quads;
        this._scp_greed = scp_greed;
    }
    UnindexedGreedHandle.prototype.addC1Object = function (sc1_object) {
        // construct quad
        var scq_quad = this._scp_greed + sc1_object;
        // ref quad store
        var as_quads = this._as_quads;
        // quad already exists
        if (as_quads.has(scq_quad))
            return false;
        // insert into quad set
        as_quads.add(scq_quad);
        // quad added
        return true;
    };
    UnindexedGreedHandle.prototype.deleteC1Object = function (sc1_object) {
        // construct quad
        var scq_quad = this._scp_greed + sc1_object;
        // ref quad store
        var as_quads = this._as_quads;
        // quad does not exist
        if (!as_quads.has(scq_quad))
            return false;
        // delete from quad set
        as_quads["delete"](scq_quad);
        // quad deleted
        return true;
    };
    return UnindexedGreedHandle;
}());
var GrubHandle = /** @class */ (function () {
    function GrubHandle(k_dataset, scp_grub) {
        this._k_dataset = k_dataset;
        this._scp_grub = scp_grub;
    }
    GrubHandle.prototype.openC1Predicate = function (sc1_predicate) {
        // return greed handle
        return new UnindexedGreedHandle(this._k_dataset, this._scp_grub + sc1_predicate + '\0');
    };
    return GrubHandle;
}());
var GraphHandle = /** @class */ (function () {
    function GraphHandle(k_dataset, sc1_graph) {
        this._k_dataset = k_dataset;
        this._scp_graph = sc1_graph + '\9';
    }
    GraphHandle.prototype.openC1Subject = function (sc1_subject) {
        // return grub handle
        return new GrubHandle(this._k_dataset, this._scp_graph + sc1_subject + '\8');
    };
    return GraphHandle;
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
var R_SPLIT_QUAD = /[\9\8\0]/g;
var XM_GRAPH = 1;
var XM_SUBJECT = 2;
var XM_PREDICATE = 4;
var XM_OBJECT = 8;
/**
 * Stores an unindexed set of quads in (graph, subject, predicate, object) order.
 * Fast insertion, slow at everything else.
 */
var UnindexedTrigDataset = /** @class */ (function () {
    function UnindexedTrigDataset(h_prefixes, as_quads) {
        if (h_prefixes === void 0) { h_prefixes = {}; }
        if (as_quads === void 0) { as_quads = new Set(); }
        this._h_prefixes = h_prefixes;
        this._as_quads = as_quads;
    }
    Object.defineProperty(UnindexedTrigDataset.prototype, "size", {
        get: function () {
            return this._as_quads.size;
        },
        enumerable: true,
        configurable: true
    });
    UnindexedTrigDataset.prototype.deliver = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this];
            });
        });
    };
    UnindexedTrigDataset.prototype[Symbol.iterator] = function () {
        var h_prefixes, _i, _a, scq_quad, _b, sc1_graph, sc1_subject, sc1_predicate, sc1_object, a_remainder;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    h_prefixes = this._h_prefixes;
                    _i = 0, _a = this._as_quads;
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    scq_quad = _a[_i];
                    _b = scq_quad.split(R_SPLIT_QUAD), sc1_graph = _b[1], sc1_subject = _b[2], sc1_predicate = _b[3], sc1_object = _b[4], a_remainder = _b.slice(5);
                    // reconstruct quad object
                    return [4 /*yield*/, core_data_factory_1.DataFactory.quad(c1SubjectRole(sc1_subject, h_prefixes), c1PredicateRole(sc1_predicate, h_prefixes), c1ObjectRole(sc1_object + a_remainder.join(''), h_prefixes), c1GraphRole(sc1_graph, h_prefixes))];
                case 2:
                    // reconstruct quad object
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    UnindexedTrigDataset.prototype.openC1Graph = function (sc1_graph) {
        // return graph handle
        return new GraphHandle(this, sc1_graph);
    };
    UnindexedTrigDataset.prototype.openC1Subject = function (sc1_subject) {
        // return grub handle
        return new GrubHandle(this, sc1_subject);
    };
    UnindexedTrigDataset.prototype.distinct = function (s_which) {
        switch (s_which) {
            case 'graphs': {
                var as_graphs = new Set();
                for (var _i = 0, _a = this._as_quads; _i < _a.length; _i++) {
                    var scq_quad = _a[_i];
                    as_graphs.add(scq_quad.slice(0, scq_quad.indexOf('\9')));
                }
                return as_graphs.size;
            }
            case 'subjects': {
                var as_subjects = new Set();
                for (var _b = 0, _c = this._as_quads; _b < _c.length; _b++) {
                    var scq_quad = _c[_b];
                    as_subjects.add(scq_quad.slice(scq_quad.indexOf('\9') + 1, scq_quad.indexOf('\8')));
                }
                return as_subjects.size;
            }
            case 'predicates': {
                var as_predicates = new Set();
                for (var _d = 0, _e = this._as_quads; _d < _e.length; _d++) {
                    var scq_quad = _e[_d];
                    as_predicates.add(scq_quad.slice(scq_quad.indexOf('\8') + 1, scq_quad.indexOf('\0')));
                }
                return as_predicates.size;
            }
            case 'objects': {
                var as_objects = new Set();
                for (var _f = 0, _g = this._as_quads; _f < _g.length; _f++) {
                    var scq_quad = _g[_f];
                    as_objects.add(scq_quad.slice(scq_quad.indexOf('\0') + 1));
                }
                return as_objects.size;
            }
            default: {
                throw new Error("cannot query for distinct '" + s_which + "'");
            }
        }
    };
    UnindexedTrigDataset.prototype.attachPrefixes = function (h_prefixes) {
        this._h_prefixes = h_prefixes;
    };
    UnindexedTrigDataset.prototype.addTriple = function (sc1_subject, sc1_predicate, sc1_object) {
        return this.openC1Subject(sc1_subject).openC1Predicate(sc1_predicate).addC1Object(sc1_object);
    };
    UnindexedTrigDataset.prototype._quad_to_cq = function (g_quad) {
        var h_prefixes = this._h_prefixes;
        var yt_subject = g_quad.subject;
        return graph_to_c1(g_quad.graph, this._h_prefixes)
            + '\9' + ('NamedNode' === yt_subject.termType ? concise(yt_subject.value, h_prefixes) : '_:' + yt_subject.value)
            + '\8' + concise(g_quad.predicate.value, h_prefixes)
            + '\0' + fromTerm(g_quad.object).concise(h_prefixes);
    };
    UnindexedTrigDataset.prototype.add = function (g_quad) {
        this._as_quads.add(this._quad_to_cq(g_quad));
        return this;
    };
    UnindexedTrigDataset.prototype["delete"] = function (g_quad) {
        this._as_quads["delete"](this._quad_to_cq(g_quad));
        return this;
    };
    UnindexedTrigDataset.prototype.has = function (g_quad) {
        return this._as_quads.has(this._quad_to_cq(g_quad));
    };
    UnindexedTrigDataset.prototype._quad_to_c1s = function (yt_subject, yt_predicate, yt_object, yt_graph) {
        var h_prefixes = this._h_prefixes;
        return [
            yt_graph ? ('Variable' !== yt_graph.termType ? graph_to_c1(yt_graph, h_prefixes) : '') : '*',
            (yt_subject && 'Variable' !== yt_subject.termType) ? ('NamedNode' === yt_subject.termType ? concise(yt_subject.value, h_prefixes) : '_:' + yt_subject.value) : '',
            (yt_predicate && 'Variable' !== yt_predicate.termType) ? concise(yt_predicate.value, h_prefixes) : '',
            (yt_object && 'Variable' !== yt_object.termType) ? fromTerm(yt_object).concise(h_prefixes) : '',
        ];
    };
    UnindexedTrigDataset.prototype.match = function (yt_subject, yt_predicate, yt_object, yt_graph) {
        var xm_given = (yt_subject ? XM_SUBJECT : 0) & (yt_predicate ? XM_PREDICATE : 0) & (yt_object ? XM_OBJECT : 0) & (yt_graph ? XM_GRAPH : 0);
        var _a = this._quad_to_c1s(yt_subject, yt_predicate, yt_object, yt_graph), sc1_subject = _a[0], sc1_predicate = _a[1], sc1_object = _a[2], sc1_graph = _a[3];
        var s_regex = '';
        var f_filter = function () { return false; };
        switch (xm_given) {
            case XM_GRAPH: {
                f_filter = function (scq) { return scq.startsWith(sc1_graph); };
                break;
            }
            case (XM_GRAPH | XM_SUBJECT): {
                f_filter = function (scq) { return scq.startsWith(sc1_graph + sc1_subject); };
                break;
            }
            case (XM_GRAPH | XM_SUBJECT | XM_PREDICATE): {
                f_filter = function (scq) { return scq.startsWith(sc1_graph + sc1_subject + sc1_predicate); };
                break;
            }
            case (XM_GRAPH | XM_SUBJECT | XM_PREDICATE | XM_OBJECT): {
                f_filter = function (scq) { return scq.startsWith(sc1_graph + sc1_subject + sc1_predicate + sc1_object); };
                break;
            }
            case XM_SUBJECT: {
                f_filter = function (scq) { return sc1_subject === scq.substr(scq.indexOf('\9') + 1, sc1_subject.length); };
                break;
            }
            case (XM_SUBJECT | XM_PREDICATE): {
                f_filter = function (scq) {
                    var scp_spred = sc1_subject + '\8' + sc1_predicate;
                    return scp_spred === scq.substr(scq.indexOf('\9') + 1, scp_spred.length);
                };
                break;
            }
            case (XM_SUBJECT | XM_PREDICATE | XM_OBJECT): {
                f_filter = function (scq) {
                    var scp_sprob = sc1_subject + '\8' + sc1_predicate + '\0' + sc1_object;
                    return scp_sprob === scq.substr(scq.indexOf('\9') + 1, scp_sprob.length);
                };
                break;
            }
            case XM_PREDICATE: {
                f_filter = function (scq) { return sc1_predicate === scq.substr(scq.indexOf('\8') + 1, sc1_predicate.length); };
                break;
            }
            case (XM_PREDICATE | XM_OBJECT): {
                f_filter = function (scq) {
                    var scp_prob = sc1_predicate + '\0' + sc1_object;
                    return scp_prob === scq.substr(scq.indexOf('\8') + 1, scp_prob.length);
                };
                break;
            }
            case XM_OBJECT: {
                f_filter = function (scq) { return sc1_object === scq.substr(scq.indexOf('\0'), sc1_object.length); };
                break;
            }
        }
        var as_quads = new Set();
        for (var _i = 0, _b = this._as_quads; _i < _b.length; _i++) {
            var scq_quad = _b[_i];
            if (f_filter(scq_quad)) {
                as_quads.add(scq_quad);
            }
        }
        return new UnindexedTrigDataset(this._h_prefixes, as_quads);
    };
    UnindexedTrigDataset.supportsStar = false;
    return UnindexedTrigDataset;
}());
exports.UnindexedTrigDataset = UnindexedTrigDataset;
