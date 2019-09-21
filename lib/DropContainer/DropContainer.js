
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

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _reactDnd = require("react-dnd");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _invariant = _interopRequireDefault(require("invariant"));

var _constants = require("../constants");

var _ModelContext = _interopRequireDefault(require("../ModelContext"));

var DropContainer =
/*#__PURE__*/
function (_React$Component) {
  (0, _inherits2["default"])(DropContainer, _React$Component);

  function DropContainer() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, DropContainer);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(DropContainer)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDropTarget", null);
    return _this;
  }

  (0, _createClass2["default"])(DropContainer, [{
    key: "connectDrop",
    value: function connectDrop() {
      var disabled = this.props.disabled;
      var dom = (0, _reactDom.findDOMNode)(this);

      if (this._connectDropTarget) {
        this._connectDropTarget(disabled ? null : dom);
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.connectDrop();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.connectDrop();
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          _this$props$pid = _this$props.pid,
          pid = _this$props$pid === void 0 ? null : _this$props$pid,
          _canDrop = _this$props.canDrop,
          _hover = _this$props.hover,
          _drop = _this$props.drop,
          _collect = _this$props.collect,
          children = _this$props.children;

      var designer = _react["default"].useContext(_ModelContext["default"]);

      var DropContainerContext = designer.DropContainerContext;

      var _React$useContext = _react["default"].useContext(DropContainerContext),
          isRootContainer = _React$useContext.isRootContainer;

      (0, _invariant["default"])(isRootContainer ? true : pid != null, "sub DropContainer props.pid miss.");

      var _useDrop = (0, _reactDnd.useDrop)({
        accept: designer.getScope(),
        canDrop: function canDrop(_ref, monitor) {
          var item = _ref.item;

          if (_canDrop) {
            return _canDrop(item, monitor);
          }

          return true;
        },
        hover: function hover(_ref2, monitor) {
          var item = _ref2.item;

          if (_hover) {
            _hover(item, monitor);
          }

          designer.fireEvent("onDragHoverContainer", {
            target: pid,
            monitor: monitor,
            item: item
          });
          var isOver = monitor.isOver({
            shallow: true
          });
          if (!isOver) return;

          if (!monitor.canDrop()) {
            return;
          }

          designer.updateItemPid(item, pid);
        },
        drop: function drop(_ref3, monitor) {
          var item = _ref3.item;

          if (_drop) {
            _drop(item, monitor);
          } //根节点统一commit


          if (isRootContainer) {
            var isTmpItem = designer.isTmpItem(item);
            designer.commitItem(item);
            designer.fireEvent("onDrop", {
              target: item,
              action: isTmpItem ? _constants.ACTION_ADD : _constants.ACTION_SORT
            });
          }
        },
        collect: function collect(monitor) {
          var ext = _collect ? _collect(monitor) : {};
          return (0, _objectSpread2["default"])({
            monitor: monitor,
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
            isStrictlyOver: monitor.isOver({
              shallow: true
            })
          }, ext);
        }
      }),
          _useDrop2 = (0, _slicedToArray2["default"])(_useDrop, 2),
          collectedProps = _useDrop2[0],
          connectDropTarget = _useDrop2[1];

      var items = designer.getItems(pid);

      if (!collectedProps.isOver) {
        items = items.filter(function (item) {
          return !designer.isTmpItem(item);
        });
      }

      this._connectDropTarget = connectDropTarget;
      var child = typeof children === "function" ? children(items, collectedProps) : children;

      _react["default"].Children.only(child);

      return _react["default"].createElement(DropContainerContext.Provider, {
        value: {
          isRootContainer: false,
          canDrop: _canDrop
        }
      }, child);
    }
  }]);
  return DropContainer;
}(_react["default"].Component);

(0, _defineProperty2["default"])(DropContainer, "propTypes", {
  pid: _propTypes["default"].any,
  disabled: _propTypes["default"].bool,
  collect: _propTypes["default"].func,
  canDrop: _propTypes["default"].func,
  hover: _propTypes["default"].func,
  drop: _propTypes["default"].func
});
(0, _defineProperty2["default"])(DropContainer, "defaultProps", {
  pid: null
});

var _default = (0, _withComponentHooks["default"])(DropContainer);

exports["default"] = _default;