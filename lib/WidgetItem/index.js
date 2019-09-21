
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

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactDom = require("react-dom");

var _reactDnd = require("react-dnd");

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _ModelContext = _interopRequireDefault(require("../ModelContext"));

var _constants = require("../constants");

var WidgetItem =
/*#__PURE__*/
function (_React$Component) {
  (0, _inherits2["default"])(WidgetItem, _React$Component);

  function WidgetItem() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, WidgetItem);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(WidgetItem)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDragSource", null);
    return _this;
  }

  (0, _createClass2["default"])(WidgetItem, [{
    key: "connectDrag",
    value: function connectDrag() {
      var disabled = this.props.disabled;
      var dom = (0, _reactDom.findDOMNode)(this);

      if (this._connectDragSource) {
        this._connectDragSource(disabled ? null : dom);
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.connectDrag();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.connectDrag();
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          children = _this$props.children,
          getInstance = _this$props.getInstance,
          _canDrag = _this$props.canDrag,
          beginDrag = _this$props.beginDrag,
          endDrag = _this$props.endDrag;

      var designer = _react["default"].useContext(_ModelContext["default"]);

      var _useDrag = (0, _reactDnd.useDrag)({
        item: {
          type: designer.getScope()
        },
        canDrag: function canDrag(monitor) {
          if (_canDrag) {
            return _canDrag(monitor);
          }

          return true;
        },
        begin: function begin(monitor) {
          var item = getInstance();

          if (beginDrag) {
            beginDrag(item, monitor);
          }

          designer.addTmpItem(item);
          designer.fireEvent("onDragStart", {
            target: item,
            action: _constants.ACTION_ADD
          });
          return {
            item: item
          };
        },
        end: function end(item, monitor) {
          if (endDrag) {
            endDrag(item, monitor);
          }

          designer.clearTmpItems();
          designer.fireEvent("onDragEnd", {
            target: item,
            action: _constants.ACTION_ADD
          });
        },
        collect: function collect(monitor) {
          return {
            monitor: monitor,
            isDragging: monitor.isDragging()
          };
        }
      }),
          _useDrag2 = (0, _slicedToArray2["default"])(_useDrag, 2),
          collectProps = _useDrag2[0],
          connectDragSource = _useDrag2[1];

      this._connectDragSource = connectDragSource;
      var child = typeof children === "function" ? children(collectProps) : children;

      _react["default"].Children.only(child);

      return child;
    }
  }]);
  return WidgetItem;
}(_react["default"].Component);

(0, _defineProperty2["default"])(WidgetItem, "propTypes", {
  getInstance: _propTypes["default"].func.isRequired,
  disabled: _propTypes["default"].bool,
  canDrag: _propTypes["default"].func,
  beginDrag: _propTypes["default"].func,
  endDrag: _propTypes["default"].func
});

var _default = (0, _withComponentHooks["default"])(WidgetItem);

exports["default"] = _default;