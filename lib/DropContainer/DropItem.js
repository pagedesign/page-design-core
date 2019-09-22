
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

var _reactDom = require("react-dom");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _reactDnd = require("react-dnd");

var _constants = require("../constants");

var _ModelContext = _interopRequireDefault(require("../ModelContext"));

var _utils = require("../utils");

var DropItem =
/*#__PURE__*/
function (_React$Component) {
  (0, _inherits2["default"])(DropItem, _React$Component);

  function DropItem() {
    (0, _classCallCheck2["default"])(this, DropItem);
    return (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(DropItem).apply(this, arguments));
  }

  (0, _createClass2["default"])(DropItem, [{
    key: "getDropOptions",
    value: function getDropOptions() {
      var self = this;
      var _this$props = this.props,
          item = _this$props.item,
          align = _this$props.align;

      var designer = _react["default"].useContext(_ModelContext["default"]);

      var DropContainerContext = designer.DropContainerContext;

      var _React$useContext = _react["default"].useContext(DropContainerContext),
          canDrop = _React$useContext.canDrop;

      align = align || designer.props.align;
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
          var targetDOM = (0, _reactDom.findDOMNode)(self); //顺序调整

          var targetOffset = targetDOM.getBoundingClientRect();
          var middleX = ~~(targetOffset.right - targetOffset.width / 2);
          var middleY = ~~(targetOffset.bottom - targetOffset.height / 2);
          var shouldInsertBefore = false;

          switch (align) {
            case "vertical":
              shouldInsertBefore = dragOffset.y <= middleY;
              break;

            case "horizontal":
              shouldInsertBefore = dragOffset.x <= middleX;
              break;

            case "all":
              shouldInsertBefore = (0, _utils.isBeforeRect)(targetOffset.left, targetOffset.top, targetOffset.width, targetOffset.height, dragOffset.x, dragOffset.y);
              break;

            default:
              //vertical default
              shouldInsertBefore = dragOffset.y <= middleY;
          }

          if (shouldInsertBefore) {
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
      var _this$props2 = this.props,
          item = _this$props2.item,
          _canDrag = _this$props2.canDrag,
          beginDrag = _this$props2.beginDrag,
          endDrag = _this$props2.endDrag;

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

          designer.fireEvent("onDragStart", {
            item: item,
            action: _constants.ACTION_SORT
          });
          designer.setItemDragging(item);
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
            action: _constants.ACTION_SORT
          }); //clearDraggingState

          designer.clearTmpItems();
        } // collect(monitor) {
        //     return {
        //         // monitor,
        //         // isDragging: monitor.isDragging()
        //     };
        // }

      };
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
          _useDrag2 = (0, _slicedToArray2["default"])(_useDrag, 3),
          collectedDragProps = _useDrag2[0],
          connectDragTarget = _useDrag2[1],
          connectDragPreview = _useDrag2[2];

      var connectDragAndDrop = function connectDragAndDrop(dom) {
        connectDropTarget(dom);
        connectDragTarget(dom);
      };

      return children((0, _objectSpread2["default"])({}, collectedDropProps, collectedDragProps, {
        item: item,
        isTmp: designer.isTmpItem(item),
        isDragging: designer.isDragging(item),
        connectDropTarget: connectDropTarget,
        connectDragTarget: connectDragTarget,
        connectDragAndDrop: connectDragAndDrop,
        connectDragPreview: connectDragPreview
      }));
    }
  }]);
  return DropItem;
}(_react["default"].Component);

(0, _defineProperty2["default"])(DropItem, "propTypes", {
  children: _propTypes["default"].func.isRequired,
  item: _propTypes["default"].object.isRequired,
  align: _propTypes["default"].oneOf(["all", "vertical", "horizontal"]),
  canDrag: _propTypes["default"].func,
  beginDrag: _propTypes["default"].func,
  endDrag: _propTypes["default"].func
});

var _default = (0, _withComponentHooks["default"])(DropItem);

exports["default"] = _default;