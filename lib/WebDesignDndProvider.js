
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDndHtml5Backend = _interopRequireDefault(require("react-dnd-html5-backend"));

var _reactDnd = require("react-dnd");

var _Model = _interopRequireDefault(require("./Model"));

var WebDesignDndProvider =
/*#__PURE__*/
function (_React$Component) {
  (0, _inherits2["default"])(WebDesignDndProvider, _React$Component);

  function WebDesignDndProvider() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, WebDesignDndProvider);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(WebDesignDndProvider)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "model", null);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "saveModel", function (model) {
      _this.model = model;
    });
    return _this;
  }

  (0, _createClass2["default"])(WebDesignDndProvider, [{
    key: "getModel",
    value: function getModel() {
      return this.model;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          children = _this$props.children,
          backend = _this$props.backend,
          props = (0, _objectWithoutProperties2["default"])(_this$props, ["children", "backend"]);
      return _react["default"].createElement(_reactDnd.DndProvider, {
        backend: backend
      }, _react["default"].createElement(_Model["default"], (0, _extends2["default"])({}, props, {
        ref: this.saveModel
      }), children));
    }
  }]);
  return WebDesignDndProvider;
}(_react["default"].Component);

exports["default"] = WebDesignDndProvider;
(0, _defineProperty2["default"])(WebDesignDndProvider, "defaultProps", {
  backend: _reactDndHtml5Backend["default"]
});