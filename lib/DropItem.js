
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _reactDnd = require("react-dnd");

var _constants = require("./constants");

var _ModelContext = _interopRequireDefault(require("./ModelContext"));

var _utils = require("./utils");

var _DragState = _interopRequireDefault(require("./DragState"));

var DropItem =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(DropItem, _React$Component);

  function DropItem() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_lastHoverDirection", _constants.DRAG_DIR_NONE);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_connectDragDOM", null);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_connectDropTarget", null);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_connectDragTarget", null);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_connectDragPreview", null);
    return _this;
  }

  var _proto = DropItem.prototype;

  _proto.getModel = function getModel() {
    return this.context.model;
  };

  _proto.getHoverDirection = function getHoverDirection(monitor, targetDOM, axis) {
    if (targetDOM === void 0) {
      targetDOM = (0, _reactDom.findDOMNode)(this);
    }

    if (axis === void 0) {
      axis = _constants.AXIS_VERTICAL;
    }

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
  };

  _proto.getDropOptions = function getDropOptions() {
    var _this2 = this;

    var _this$props = this.props,
        item = _this$props.item,
        axis = _this$props.axis,
        _canDrop = _this$props.canDrop,
        _hover = _this$props.hover,
        _drop = _this$props.drop,
        accepts = _this$props.accepts;
    var targetDOM = (0, _reactDom.findDOMNode)(this);
    var model = this.getModel();
    var DropContainerContext = model.DropContainerContext;

    var _React$useContext = _react.default.useContext(DropContainerContext),
        pAxis = _React$useContext.axis;

    var _model$props = model.props,
        commitAction = _model$props.commitAction,
        mAxis = _model$props.axis;
    axis = axis || pAxis || mAxis;
    return {
      accept: [model.getScope()].concat(accepts),
      canDrop: function canDrop(dragResult, monitor) {
        var dragItem = dragResult.item;
        var ret = model.isTmpItem(item) ? false : !model.isSameItem(item, dragItem);

        if (ret) {
          ret = !model.contains(dragItem, item);
        }

        if (ret && _canDrop) {
          ret = _canDrop((0, _extends2.default)({}, dragResult, {
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
          _hover((0, _extends2.default)({}, dragResult, {
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

        _DragState.default.setState({
          canDrop: canDrop,
          hoverContainerId: undefined,
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

        var e = (0, _extends2.default)({
          target: item,
          targetDOM: targetDOM,
          monitor: monitor,
          component: _this2,
          model: model
        }, dragResult);
        model.fireEvent("onDragHoverItem", e);
        model.fireEvent("onDragHover", e);
      },
      drop: function drop(dragResult, monitor) {
        if (_drop) {
          _drop((0, _extends2.default)({}, dragResult, {
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

          var _DragState$getState = _DragState.default.getState(),
              isNew = _DragState$getState.isNew; // const isTmpItem = model.isTmpItem(dragResult.item);


          var e = (0, _extends2.default)({
            target: item,
            targetDOM: targetDOM,
            type: isNew ? _constants.EVENT_TYPE_ADD : _constants.EVENT_TYPE_SORT,
            monitor: monitor,
            component: _this2,
            model: model
          }, dragResult);
          model.fireEvent("onDropToItem", e);
          model.fireEvent("onDrop", e);
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
  };

  _proto.getDragOptions = function getDragOptions() {
    var _this3 = this;

    var _this$props2 = this.props,
        item = _this$props2.item,
        _canDrag = _this$props2.canDrag,
        beginDrag = _this$props2.beginDrag,
        endDrag = _this$props2.endDrag;
    var model = this.getModel();
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

        _DragState.default.setState({
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
        var _DragState$getState2 = _DragState.default.getState(),
            dragDOMIsRemove = _DragState$getState2.dragDOMIsRemove,
            dragDOM = _DragState$getState2.dragDOM;

        _DragState.default.reset();

        if (dragDOMIsRemove && dragDOM && dragDOM.parentNode) {
          dragDOM.parentNode.removeChild(dragDOM);
        }

        if (endDrag) {
          endDrag((0, _extends2.default)({}, dragResult, {
            model: model,
            monitor: monitor,
            component: _this3
          }));
        }

        model.fireEvent("onDragEnd", (0, _extends2.default)({}, dragResult, {
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
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    this.connectDragAndDrop();
  };

  _proto.componentDidMount = function componentDidMount() {
    this.connectDragAndDrop();
  };

  _proto.connectDragAndDrop = function connectDragAndDrop() {
    var children = this.props.children;
    if (!children || typeof children === "function") return;
    var dom = (0, _reactDom.findDOMNode)(this);

    this._connectDropTarget(dom);

    this._connectDragTarget(dom);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    //fix: 当拖动节点在拖动状态被删除时导致react-dnd在drop后需要移动鼠标才及时触发endDrag问题
    var dragDOM = this._connectDragDOM;

    var dragState = _DragState.default.getState();

    if (dragState.isDragging && dragDOM && dragState.dragDOM === dragDOM) {
      _DragState.default.setState({
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
  };

  _proto.render = function render() {
    var _this4 = this;

    var _this$props3 = this.props,
        children = _this$props3.children,
        render = _this$props3.render,
        item = _this$props3.item;
    var model = this.getModel();

    var _useDrop = (0, _reactDnd.useDrop)(this.getDropOptions()),
        collectedDropProps = _useDrop[0],
        connectDropTarget = _useDrop[1];

    var _useDrag = (0, _reactDnd.useDrag)(this.getDragOptions()),
        collectedDragProps = _useDrag[0],
        connectDragTarget = _useDrag[1],
        connectDragPreview = _useDrag[2];

    this._connectDropTarget = connectDropTarget;
    this._connectDragTarget = _react.default.useCallback(function (dom) {
      _this4._connectDragDOM = dom;
      connectDragTarget(dom);
    }, [connectDragTarget]);
    this._connectDragPreview = connectDragPreview;

    var connectDragAndDrop = _react.default.useCallback(function (dom) {
      _this4._connectDropTarget(dom);

      _this4._connectDragTarget(dom);
    }, []);

    var props = (0, _extends2.default)({}, collectedDropProps, {}, collectedDragProps, {
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
  };

  return DropItem;
}(_react.default.Component);

(0, _defineProperty2.default)(DropItem, "contextType", _ModelContext.default);
(0, _defineProperty2.default)(DropItem, "defaultProps", {
  accepts: []
});
DropItem.propTypes = process.env.NODE_ENV !== "production" ? {
  item: _propTypes.default.object.isRequired,
  children: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.node]),
  render: _propTypes.default.func,
  axis: _propTypes.default.oneOf([_constants.AXIS_BOTH, _constants.AXIS_HORIZONTAL, _constants.AXIS_VERTICAL]),
  accepts: _propTypes.default.array,
  canDrop: _propTypes.default.func,
  hover: _propTypes.default.func,
  canDrag: _propTypes.default.func,
  beginDrag: _propTypes.default.func,
  endDrag: _propTypes.default.func
} : {};

var _default = (0, _withComponentHooks.default)(DropItem);

exports.default = _default;