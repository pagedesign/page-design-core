
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _reactDnd = require("react-dnd");

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _ModelContext = _interopRequireDefault(require("./ModelContext"));

var DropEmptyContainer =
/*#__PURE__*/
function (_React$Component) {
  (0, _inherits2["default"])(DropEmptyContainer, _React$Component);

  function DropEmptyContainer() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, DropEmptyContainer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(DropEmptyContainer)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDropTarget", null);
    return _this;
  }

  (0, _createClass2["default"])(DropEmptyContainer, [{
    key: "connectDropTarget",
    value: function connectDropTarget() {
      var dom = (0, _reactDom.findDOMNode)(this);

      this._connectDropTarget(dom);
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.connectDropTarget();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.connectDropTarget();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this._connectDropTarget(null);
    }
  }, {
    key: "getDropOptions",
    value: function getDropOptions() {
      var model = this.context;
      return {
        accept: model.getScope()
      };
    }
  }, {
    key: "render",
    value: function render() {
      var _useDrop = (0, _reactDnd.useDrop)(this.getDropOptions()),
          _useDrop2 = (0, _slicedToArray2["default"])(_useDrop, 2),
          collectedProps = _useDrop2[0],
          connectDropTarget = _useDrop2[1];

      this._connectDropTarget = connectDropTarget;
      return this.props.children;
    }
  }]);
  return DropEmptyContainer;
}(_react["default"].Component);

(0, _defineProperty2["default"])(DropEmptyContainer, "contextType", _ModelContext["default"]);

var _default = (0, _withComponentHooks["default"])(DropEmptyContainer);

exports["default"] = _default;