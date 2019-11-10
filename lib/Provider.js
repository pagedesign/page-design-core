
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDndHtml5Backend = _interopRequireDefault(require("react-dnd-html5-backend"));

var _reactDnd = require("react-dnd");

var _Model = _interopRequireDefault(require("./Model"));

var PageDesignCoreProvider =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(PageDesignCoreProvider, _React$Component);

  function PageDesignCoreProvider() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "model", null);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "saveModel", function (model) {
      _this.model = model;
    });
    return _this;
  }

  var _proto = PageDesignCoreProvider.prototype;

  _proto.getModel = function getModel() {
    return this.model;
  };

  _proto.render = function render() {
    var _this$props = this.props,
        backend = _this$props.backend,
        context = _this$props.context,
        props = (0, _objectWithoutPropertiesLoose2.default)(_this$props, ["backend", "context"]);
    return _react.default.createElement(_reactDnd.DndProvider, {
      backend: backend,
      context: context
    }, _react.default.createElement(_Model.default, (0, _extends2.default)({}, props, {
      ref: this.saveModel
    })));
  };

  return PageDesignCoreProvider;
}(_react.default.Component);

exports.default = PageDesignCoreProvider;
(0, _defineProperty2.default)(PageDesignCoreProvider, "defaultProps", {
  context: window,
  backend: _reactDndHtml5Backend.default
});