
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

var _propTypes = _interopRequireDefault(require("prop-types"));

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _reactDnd = require("react-dnd");

var _constants = require("../constants");

var _ModelContext = _interopRequireDefault(require("../ModelContext"));

var DropItem =
/*#__PURE__*/
function (_React$Component) {
  (0, _inherits2["default"])(DropItem, _React$Component);

  function DropItem() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, DropItem);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(DropItem)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDropTarget", null);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDragTarget", null);
    return _this;
  }

  (0, _createClass2["default"])(DropItem, [{
    key: "getDropOptions",
    value: function getDropOptions() {
      var self = this;
      var item = this.props.item;

      var designer = _react["default"].useContext(_ModelContext["default"]);

      var DropContainerContext = designer.DropContainerContext;

      var _React$useContext = _react["default"].useContext(DropContainerContext),
          canDrop = _React$useContext.canDrop;

      return {
        accept: designer.getScope(),
        canDrop: function canDrop(_ref, monitor) {
          var dragItem = _ref.item;
          return designer.isTmpItem(item) ? false : !designer.isSameItem(item, dragItem);
        },
        hover: function hover(_ref2, monitor) {
          var dragItem = _ref2.item;
          designer.fireEvent("onDragHoverItem", {
            target: item,
            monitor: monitor,
            item: dragItem
          });
          var isOver = monitor.isOver({
            shallow: true
          });
          if (!isOver) return;
          var canDropRet = canDrop ? canDrop(dragItem, monitor) : true;

          if (!monitor.canDrop() || !canDropRet) {
            return;
          }

          var dragOffset = monitor.getClientOffset();
          var previewDOM = (0, _reactDom.findDOMNode)(self); //顺序调整

          var targetOffset = previewDOM.getBoundingClientRect();
          var middleY = ~~(targetOffset.bottom - targetOffset.height / 2);

          if (dragOffset.y <= middleY) {
            designer.insertBefore(dragItem, item);
          } else {
            designer.insertAfter(dragItem, item);
          }
        },
        collect: function collect(monitor) {
          return {
            monitor: monitor,
            isOver: monitor.isOver(),
            isStrictlyOver: monitor.isOver({
              shallow: true
            }),
            canDrop: designer.isTmpItem(item) ? false : monitor.canDrop()
          };
        }
      };
    }
  }, {
    key: "getDragOptions",
    value: function getDragOptions() {
      var _this$props = this.props,
          item = _this$props.item,
          _canDrag = _this$props.canDrag,
          beginDrag = _this$props.beginDrag,
          endDrag = _this$props.endDrag;

      var designer = _react["default"].useContext(_ModelContext["default"]);

      return {
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
          if (beginDrag) {
            beginDrag(item, monitor);
          }

          designer.setItemDragging(item);
          designer.fireEvent("onDragStart", {
            target: item,
            action: _constants.ACTION_SORT
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
            action: _constants.ACTION_SORT
          });
        } // collect(monitor) {
        //     return {
        //         // monitor,
        //         // isDragging: monitor.isDragging()
        //     };
        // }

      };
    }
  }, {
    key: "connectDropAndDrag",
    value: function connectDropAndDrag() {
      var _this$props2 = this.props,
          disableDrag = _this$props2.disableDrag,
          disableDrop = _this$props2.disableDrop;
      var dom = (0, _reactDom.findDOMNode)(this);

      if (this._connectDropTarget) {
        this._connectDropTarget(disableDrop ? null : dom);
      }

      if (this._connectDragTarget) {
        this._connectDragTarget(disableDrag ? null : dom);
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.connectDropAndDrag();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.connectDropAndDrag();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this._connectDropTarget) {
        this._connectDropTarget(null);
      }

      if (this._connectDragTarget) {
        this._connectDragTarget(null);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props3 = this.props,
          children = _this$props3.children,
          item = _this$props3.item;

      var designer = _react["default"].useContext(_ModelContext["default"]);

      var _useDrop = (0, _reactDnd.useDrop)(this.getDropOptions()),
          _useDrop2 = (0, _slicedToArray2["default"])(_useDrop, 2),
          collectedDropProps = _useDrop2[0],
          connectDropTarget = _useDrop2[1];

      var _useDrag = (0, _reactDnd.useDrag)(this.getDragOptions()),
          _useDrag2 = (0, _slicedToArray2["default"])(_useDrag, 2),
          collectedDragProps = _useDrag2[0],
          connectDragTarget = _useDrag2[1];

      this._connectDropTarget = connectDropTarget;
      this._connectDragTarget = connectDragTarget;
      var child = typeof children === "function" ? children((0, _objectSpread2["default"])({}, collectedDropProps, collectedDragProps, {
        isTmp: designer.isTmpItem(item),
        isDragging: designer.isDragging(item)
      })) : children;

      _react["default"].Children.only(child);

      return child;
    }
  }]);
  return DropItem;
}(_react["default"].Component);

(0, _defineProperty2["default"])(DropItem, "propTypes", {
  item: _propTypes["default"].object.isRequired,
  disableDrag: _propTypes["default"].bool,
  disableDrop: _propTypes["default"].bool,
  canDrag: _propTypes["default"].func,
  beginDrag: _propTypes["default"].func,
  endDrag: _propTypes["default"].func
});

var _default = (0, _withComponentHooks["default"])(DropItem);

exports["default"] = _default;