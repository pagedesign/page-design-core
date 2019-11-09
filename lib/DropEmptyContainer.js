
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _reactDnd = require("react-dnd");

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _ModelContext = _interopRequireDefault(require("./ModelContext"));

var DropEmptyContainer =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(DropEmptyContainer, _React$Component);

  function DropEmptyContainer() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_connectDropTarget", null);
    return _this;
  }

  var _proto = DropEmptyContainer.prototype;

  _proto.connectDropTarget = function connectDropTarget() {
    var dom = (0, _reactDom.findDOMNode)(this);

    this._connectDropTarget(dom);
  };

  _proto.componentDidMount = function componentDidMount() {
    this.connectDropTarget();
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    this.connectDropTarget();
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this._connectDropTarget(null);
  };

  _proto.getDropOptions = function getDropOptions() {
    var model = this.context;
    return {
      accept: model.getScope()
    };
  };

  _proto.render = function render() {
    var _useDrop = (0, _reactDnd.useDrop)(this.getDropOptions()),
        collectedProps = _useDrop[0],
        connectDropTarget = _useDrop[1];

    this._connectDropTarget = connectDropTarget;
    return this.props.children;
  };

  return DropEmptyContainer;
}(_react.default.Component);

(0, _defineProperty2.default)(DropEmptyContainer, "contextType", _ModelContext.default);

var _default = (0, _withComponentHooks.default)(DropEmptyContainer);

exports.default = _default;