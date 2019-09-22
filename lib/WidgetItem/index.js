
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactDom = require("react-dom");

var _reactDnd = require("react-dnd");

var _reactDndHtml5Backend = require("react-dnd-html5-backend");

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _ModelContext = _interopRequireDefault(require("../ModelContext"));

var _constants = require("../constants");

var WidgetItem =
/*#__PURE__*/
function (_React$Component) {
  (0, _inherits2["default"])(WidgetItem, _React$Component);

  function WidgetItem() {
    (0, _classCallCheck2["default"])(this, WidgetItem);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(WidgetItem).apply(this, arguments));
  }

  (0, _createClass2["default"])(WidgetItem, [{
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

          designer.fireEvent("onDragStart", {
            item: item,
            action: _constants.ACTION_ADD
          });
          designer.addTmpItem(item);
          return {
            item: item
          };
        },
        end: function end(item, monitor) {
          if (endDrag) {
            endDrag(item, monitor);
          }

          designer.fireEvent("onDragEnd", {
            item: item,
            action: _constants.ACTION_ADD
          });
          designer.clearTmpItems();
        },
        collect: function collect(monitor) {
          return {
            monitor: monitor,
            isDragging: monitor.isDragging()
          };
        }
      }),
          _useDrag2 = (0, _slicedToArray2["default"])(_useDrag, 3),
          collectProps = _useDrag2[0],
          connectDragTarget = _useDrag2[1],
          connectDragPreview = _useDrag2[2];

      return children((0, _objectSpread2["default"])({}, collectProps, {
        connectDragTarget: connectDragTarget,
        connectDragPreview: connectDragPreview
      }));
    }
  }]);
  return WidgetItem;
}(_react["default"].Component);

(0, _defineProperty2["default"])(WidgetItem, "propTypes", {
  children: _propTypes["default"].func.isRequired,
  getInstance: _propTypes["default"].func.isRequired,
  canDrag: _propTypes["default"].func,
  beginDrag: _propTypes["default"].func,
  endDrag: _propTypes["default"].func
});

var _default = (0, _withComponentHooks["default"])(WidgetItem);

exports["default"] = _default;