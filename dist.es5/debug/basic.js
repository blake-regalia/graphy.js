'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _main = require('../main');

var _main2 = _interopRequireDefault(_main);

var _graph = require('../../test/graph.json');

var _graph2 = _interopRequireDefault(_graph);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _main2.default)(_graph2.default, function (q_graph) {

	var k_banana = q_graph.select('ns:Banana', 'ns:');

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		var _loop = function _loop() {
			var _step$value = _slicedToArray(_step.value, 2);

			var p_predicate = _step$value[0];
			var a_objects = _step$value[1];

			a_objects.forEach(function (k_node) {
				console.log(q_graph.shorten(p_predicate) + ' => {' + k_node.$is() + '} ' + k_node.$n3());
				debugger;
			});
		};

		for (var _iterator = k_banana()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			_loop();
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhc2ljLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTs7OztBQUNBOzs7Ozs7QUFFQSxxQ0FBYyxVQUFTLE9BQVQsRUFBa0I7O0FBRS9CLEtBQUksV0FBVSxRQUFRLE1BQVIsQ0FBZSxXQUFmLEVBQTRCLEtBQTVCLENBQWQ7O0FBRitCO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUEsT0FJdEIsV0FKc0I7QUFBQSxPQUlULFNBSlM7O0FBSzlCLGFBQVUsT0FBVixDQUFrQixVQUFDLE1BQUQsRUFBWTtBQUM3QixZQUFRLEdBQVIsQ0FBWSxRQUFRLE9BQVIsQ0FBZ0IsV0FBaEIsSUFBNkIsT0FBN0IsR0FBcUMsT0FBTyxHQUFQLEVBQXJDLEdBQWtELElBQWxELEdBQXVELE9BQU8sR0FBUCxFQUFuRTtBQUNBO0FBQ0EsSUFIRDtBQUw4Qjs7QUFJL0IsdUJBQW9DLFVBQXBDLDhIQUFnRDtBQUFBO0FBSy9DO0FBVDhCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFVL0IsQ0FWRCIsImZpbGUiOiJiYXNpYy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBncmFwaHkgZnJvbSAnLi4vbWFpbic7XG5pbXBvcnQgZ3JhcGggZnJvbSAnLi4vLi4vdGVzdC9ncmFwaC5qc29uJztcblxuZ3JhcGh5KGdyYXBoLCBmdW5jdGlvbihxX2dyYXBoKSB7XG5cblx0bGV0IGtfYmFuYW5hPSBxX2dyYXBoLnNlbGVjdCgnbnM6QmFuYW5hJywgJ25zOicpO1xuXG5cdGZvcihsZXQgW3BfcHJlZGljYXRlLCBhX29iamVjdHNdIG9mIGtfYmFuYW5hKCkpIHtcblx0XHRhX29iamVjdHMuZm9yRWFjaCgoa19ub2RlKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhxX2dyYXBoLnNob3J0ZW4ocF9wcmVkaWNhdGUpKycgPT4geycra19ub2RlLiRpcygpKyd9ICcra19ub2RlLiRuMygpKTtcblx0XHRcdGRlYnVnZ2VyO1xuXHRcdH0pO1xuXHR9XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
