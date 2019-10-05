
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

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

var _utils = require("../utils");

var _DragState = _interopRequireDefault(require("../Model/DragState"));

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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_lastHoverDirection", _constants.DRAG_DIR_NONE);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDragDOM", null);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDropTarget", null);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDragTarget", null);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDragPreview", null);
    return _this;
  }

  (0, _createClass2["default"])(DropItem, [{
    key: "getHoverDirection",
    value: function getHoverDirection(monitor) {
      var targetDOM = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : (0, _reactDom.findDOMNode)(this);
      var axis = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _constants.AXIS_VERTICAL;
      var targetOffset = targetDOM.getBoundingClientRect();
      var dragOffset = monitor.getClientOffset();
      var middleX = ~~(targetOffset.right - targetOffset.width / 2);
      var middleY = ~~(targetOffset.bottom - targetOffset.height / 2);
      var result = false;

      switch (axis) {
        case _constants.AXIS_VERTICAL:
          result = dragOffset.y <= middleY ? _constants.DRAG_DIR_UP : _constants.DRAG_DIR_DOWN;
          break;

        case _constants.AXIS_HORIZONTAL:
          result = dragOffset.x <= middleX ? _constants.DRAG_DIR_LEFT : _constants.DRAG_DIR_RIGHT;
          break;

        case _constants.AXIS_BOTH:
          result = (0, _utils.getHoverDirection)(targetOffset.left, targetOffset.top, targetOffset.width, targetOffset.height, dragOffset.x, dragOffset.y);
          break;

        default:
          //vertical default
          result = dragOffset.y <= middleY ? _constants.DRAG_DIR_UP : _constants.DRAG_DIR_DOWN;
      }

      return result;
    }
  }, {
    key: "getDropOptions",
    value: function getDropOptions() {
      var _this2 = this;

      var _this$props = this.props,
          item = _this$props.item,
          axis = _this$props.axis,
          _canDrop = _this$props.canDrop,
          _hover = _this$props.hover,
          _drop = _this$props.drop;
      var targetDOM = (0, _reactDom.findDOMNode)(this);
      var model = this.context;
      var DropContainerContext = model.DropContainerContext;

      var _React$useContext = _react["default"].useContext(DropContainerContext),
          pAxis = _React$useContext.axis;

      var _model$props = model.props,
          commitAction = _model$props.commitAction,
          mAxis = _model$props.axis;
      axis = axis || pAxis || mAxis;
      return {
        accept: model.getScope(),
        canDrop: function canDrop(dragResult, monitor) {
          var dragItem = dragResult.item;
          var ret = model.isTmpItem(item) ? false : !model.isSameItem(item, dragItem);

          if (ret && _canDrop) {
            ret = _canDrop((0, _objectSpread2["default"])({}, dragResult, {
              component: _this2,
              monitor: monitor,
              model: model
            }));
          }

          return ret;
        },
        hover: function hover(dragResult, monitor) {
          var canDrop = monitor.canDrop();

          if (_hover) {
            _hover((0, _objectSpread2["default"])({}, dragResult, {
              component: _this2,
              monitor: monitor,
              model: model
            }));
          }

          var isStrictlyOver = monitor.isOver({
            shallow: true
          });
          if (!isStrictlyOver) return;
          var dragItem = dragResult.item;

          var currentDirection = _this2.getHoverDirection(monitor, targetDOM, axis);

          var lastHoverDirection = _this2._lastHoverDirection;
          _this2._lastHoverDirection = currentDirection;

          _DragState["default"].setState({
            canDrop: canDrop,
            hoverPid: undefined,
            hoverItem: item,
            hoverDirection: currentDirection
          });

          if (canDrop) {
            if (currentDirection !== lastHoverDirection) {
              //TODO: 此处最好再加参数控制。当commitAction=COMMIT_ACTION_AUTO且不需要hoverDirection属性时不建议执行
              //eg: && needHoverDirection
              _this2.forceUpdate();
            }

            if (commitAction === _constants.COMMIT_ACTION_AUTO) {
              if (currentDirection === _constants.DRAG_DIR_UP || currentDirection === _constants.DRAG_DIR_LEFT) {
                model.insertBefore(dragItem, item);
              } else {
                model.insertAfter(dragItem, item);
              }
            }
          }

          model.fireEvent("onDragHoverItem", (0, _objectSpread2["default"])({
            target: item,
            targetDOM: targetDOM,
            monitor: monitor,
            component: _this2,
            model: model
          }, dragResult));
        },
        drop: function drop(dragResult, monitor) {
          if (_drop) {
            _drop((0, _objectSpread2["default"])({}, dragResult, {
              component: _this2,
              monitor: monitor,
              model: model
            }));
          }

          if (!monitor.didDrop()) {
            if (commitAction === _constants.COMMIT_ACTION_AUTO) {
              model.commitItem(dragResult.item);
            } else if (commitAction === _constants.COMMIT_ACTION_DROP) {
              model.commitDragStateItem();
            }

            var _DragState$getState = _DragState["default"].getState(),
                isNew = _DragState$getState.isNew; // const isTmpItem = model.isTmpItem(dragResult.item);


            model.fireEvent("onDrop", (0, _objectSpread2["default"])({
              target: item,
              targetDOM: targetDOM,
              type: isNew ? _constants.EVENT_TYPE_ADD : _constants.EVENT_TYPE_SORT,
              monitor: monitor,
              component: _this2,
              model: model
            }, dragResult));
          }
        },
        collect: function collect(monitor) {
          return {
            monitor: monitor,
            hoverDirection: _constants.DRAG_DIR_NONE,
            isOver: monitor.isOver(),
            isStrictlyOver: monitor.isOver({
              shallow: true
            }),
            canDrop: model.isTmpItem(item) ? false : monitor.canDrop()
          };
        }
      };
    }
  }, {
    key: "getDragOptions",
    value: function getDragOptions() {
      var _this3 = this;

      var _this$props2 = this.props,
          item = _this$props2.item,
          _canDrag = _this$props2.canDrag,
          beginDrag = _this$props2.beginDrag,
          endDrag = _this$props2.endDrag;
      var model = this.context;
      return {
        item: {
          type: model.getScope()
        },
        canDrag: function canDrag(monitor) {
          if (_canDrag) {
            return _canDrag({
              component: _this3,
              monitor: monitor,
              model: model
            });
          }

          return true;
        },
        begin: function begin(monitor) {
          var dom = (0, _reactDom.findDOMNode)(_this3);
          var dragDOM = _this3._connectDragDOM;

          if (beginDrag) {
            beginDrag({
              item: item,
              dom: dom,
              component: _this3,
              monitor: monitor,
              model: model
            });
          }

          _DragState["default"].setState({
            item: item,
            isNew: false,
            dragDOMIsRemove: false,
            isDragging: true,
            dragDOM: dragDOM
          });

          model.fireEvent("onDragStart", {
            item: item,
            dom: dom,
            type: _constants.EVENT_TYPE_SORT,
            model: model,
            monitor: monitor,
            component: _this3
          });
          return {
            item: item,
            dom: dom
          };
        },
        end: function end(dragResult, monitor) {
          var _DragState$getState2 = _DragState["default"].getState(),
              dragDOMIsRemove = _DragState$getState2.dragDOMIsRemove,
              dragDOM = _DragState$getState2.dragDOM;

          _DragState["default"].reset();

          if (dragDOMIsRemove && dragDOM && dragDOM.parentNode) {
            dragDOM.parentNode.removeChild(dragDOM);
          }

          if (endDrag) {
            endDrag((0, _objectSpread2["default"])({}, dragResult, {
              model: model,
              monitor: monitor,
              component: _this3
            }));
          }

          model.fireEvent("onDragEnd", (0, _objectSpread2["default"])({}, dragResult, {
            type: _constants.EVENT_TYPE_SORT,
            model: model,
            monitor: monitor,
            component: _this3
          }));
        },
        collect: function collect(monitor) {
          var dragResult = monitor.getItem();
          return {
            // monitor
            isDragging: dragResult && model.isSameItem(dragResult.item, item)
          };
        }
      };
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.connectDragAndDrop();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.connectDragAndDrop();
    }
  }, {
    key: "connectDragAndDrop",
    value: function connectDragAndDrop() {
      var children = this.props.children;
      if (!children || typeof children === "function") return;
      var dom = (0, _reactDom.findDOMNode)(this);

      this._connectDropTarget(dom);

      this._connectDragTarget(dom);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      //fix: 当拖动节点在拖动状态被删除时导致react-dnd在drop后需要移动鼠标才及时触发endDrag问题
      var dragDOM = this._connectDragDOM;

      var dragState = _DragState["default"].getState();

      if (dragState.isDragging && dragDOM && dragState.dragDOM === dragDOM) {
        _DragState["default"].setState({
          dragDOMIsRemove: true
        });

        setTimeout(function () {
          if ((0, _utils.isNodeInDocument)(dragDOM)) return;
          dragDOM.style.display = "none";
          dragDOM.style.width = "0px";
          dragDOM.style.height = "0px";
          dragDOM.style.overflow = "hidden";
          document.body.appendChild(dragDOM);
        }, 0);
      }

      this._connectDropTarget(null);

      this._connectDragTarget(null);

      this._connectDragPreview(null);
    }
  }, {
    key: "render",
    value: function render() {
      var _this4 = this;

      var _this$props3 = this.props,
          children = _this$props3.children,
          render = _this$props3.render,
          item = _this$props3.item;
      var model = this.context;

      var _useDrop = (0, _reactDnd.useDrop)(this.getDropOptions()),
          _useDrop2 = (0, _slicedToArray2["default"])(_useDrop, 2),
          collectedDropProps = _useDrop2[0],
          connectDropTarget = _useDrop2[1];

      var _useDrag = (0, _reactDnd.useDrag)(this.getDragOptions()),
          _useDrag2 = (0, _slicedToArray2["default"])(_useDrag, 3),
          collectedDragProps = _useDrag2[0],
          connectDragTarget = _useDrag2[1],
          connectDragPreview = _useDrag2[2];

      this._connectDropTarget = connectDropTarget;
      this._connectDragTarget = _react["default"].useCallback(function (dom) {
        _this4._connectDragDOM = dom;
        connectDragTarget(dom);
      }, [connectDragTarget]);
      this._connectDragPreview = connectDragPreview;

      var connectDragAndDrop = function connectDragAndDrop(dom) {
        _this4._connectDropTarget(dom);

        _this4._connectDragTarget(dom);
      };

      var props = (0, _objectSpread2["default"])({}, collectedDropProps, collectedDragProps, {
        item: item,
        isTmp: model.isTmpItem(item),
        model: model,
        connectDropTarget: connectDropTarget,
        connectDragTarget: connectDragTarget,
        connectDragAndDrop: connectDragAndDrop,
        connectDragPreview: connectDragPreview
      });
      var isStrictlyOver = props.isStrictlyOver,
          isDragging = props.isDragging,
          canDrop = props.canDrop;
      props.hoverDirection = isStrictlyOver && !isDragging && canDrop ? this._lastHoverDirection : _constants.DRAG_DIR_NONE;
      return children ? typeof children === "function" ? children(props) : children : render ? render(props) : null;
    }
  }]);
  return DropItem;
}(_react["default"].Component);

(0, _defineProperty2["default"])(DropItem, "contextType", _ModelContext["default"]);
(0, _defineProperty2["default"])(DropItem, "propTypes", {
  children: _propTypes["default"].oneOfType([_propTypes["default"].func, _propTypes["default"].node]),
  render: _propTypes["default"].func,
  item: _propTypes["default"].object.isRequired,
  axis: _propTypes["default"].oneOf([_constants.AXIS_BOTH, _constants.AXIS_HORIZONTAL, _constants.AXIS_VERTICAL]),
  canDrop: _propTypes["default"].func,
  hover: _propTypes["default"].func,
  canDrag: _propTypes["default"].func,
  beginDrag: _propTypes["default"].func,
  endDrag: _propTypes["default"].func
});

var _default = (0, _withComponentHooks["default"])(DropItem);

exports["default"] = _default;