
import _extends from "@babel/runtime/helpers/extends";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import React from "react";
import { findDOMNode } from "react-dom";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import { useDrop, useDrag } from "react-dnd";
import { EVENT_TYPE_ADD, EVENT_TYPE_SORT, DRAG_DIR_UP, DRAG_DIR_LEFT, DRAG_DIR_RIGHT, DRAG_DIR_DOWN, DRAG_DIR_NONE, COMMIT_ACTION_DROP, COMMIT_ACTION_AUTO, AXIS_VERTICAL, AXIS_HORIZONTAL, AXIS_BOTH } from "./constants";
import ModelContext from "./ModelContext";
import { isNodeInDocument, getHoverDirection as _getHoverDirection } from "./utils";
import DragState from "./DragState";

var DropItem =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(DropItem, _React$Component);

  function DropItem() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "_lastHoverDirection", DRAG_DIR_NONE);

    _defineProperty(_assertThisInitialized(_this), "_connectDragDOM", null);

    _defineProperty(_assertThisInitialized(_this), "_connectDropTarget", null);

    _defineProperty(_assertThisInitialized(_this), "_connectDragTarget", null);

    _defineProperty(_assertThisInitialized(_this), "_connectDragPreview", null);

    return _this;
  }

  var _proto = DropItem.prototype;

  _proto.getModel = function getModel() {
    return this.context.model;
  };

  _proto.getHoverDirection = function getHoverDirection(monitor, targetDOM, axis) {
    if (targetDOM === void 0) {
      targetDOM = findDOMNode(this);
    }

    if (axis === void 0) {
      axis = AXIS_VERTICAL;
    }

    var targetOffset = targetDOM.getBoundingClientRect();
    var dragOffset = monitor.getClientOffset();
    var middleX = ~~(targetOffset.right - targetOffset.width / 2);
    var middleY = ~~(targetOffset.bottom - targetOffset.height / 2);
    var result = false;

    switch (axis) {
      case AXIS_VERTICAL:
        result = dragOffset.y <= middleY ? DRAG_DIR_UP : DRAG_DIR_DOWN;
        break;

      case AXIS_HORIZONTAL:
        result = dragOffset.x <= middleX ? DRAG_DIR_LEFT : DRAG_DIR_RIGHT;
        break;

      case AXIS_BOTH:
        result = _getHoverDirection(targetOffset.left, targetOffset.top, targetOffset.width, targetOffset.height, dragOffset.x, dragOffset.y);
        break;

      default:
        //vertical default
        result = dragOffset.y <= middleY ? DRAG_DIR_UP : DRAG_DIR_DOWN;
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
    var targetDOM = findDOMNode(this);
    var model = this.getModel();
    var DropContainerContext = model.DropContainerContext;

    var _React$useContext = React.useContext(DropContainerContext),
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
          ret = _canDrop(_extends({}, dragResult, {
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
          _hover(_extends({}, dragResult, {
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
        DragState.setState({
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

          if (commitAction === COMMIT_ACTION_AUTO) {
            if (currentDirection === DRAG_DIR_UP || currentDirection === DRAG_DIR_LEFT) {
              model.insertBefore(dragItem, item);
            } else {
              model.insertAfter(dragItem, item);
            }
          }
        }

        var e = _extends({
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
        DragState.reset();

        if (_drop) {
          _drop(_extends({}, dragResult, {
            component: _this2,
            monitor: monitor,
            model: model
          }));
        }

        if (!monitor.didDrop()) {
          if (commitAction === COMMIT_ACTION_AUTO) {
            model.commitItem(dragResult.item);
          } else if (commitAction === COMMIT_ACTION_DROP) {
            model.commitDragStateItem();
          }

          var _DragState$getState = DragState.getState(),
              isNew = _DragState$getState.isNew; // const isTmpItem = model.isTmpItem(dragResult.item);


          var e = _extends({
            target: item,
            targetDOM: targetDOM,
            type: isNew ? EVENT_TYPE_ADD : EVENT_TYPE_SORT,
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
          hoverDirection: DRAG_DIR_NONE,
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
        var dom = findDOMNode(_this3);
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

        DragState.setState({
          item: item,
          isNew: false,
          dragDOMIsRemove: false,
          isDragging: true,
          dragDOM: dragDOM
        });
        model.fireEvent("onDragStart", {
          item: item,
          dom: dom,
          type: EVENT_TYPE_SORT,
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
        var _DragState$getState2 = DragState.getState(),
            dragDOMIsRemove = _DragState$getState2.dragDOMIsRemove,
            dragDOM = _DragState$getState2.dragDOM;

        DragState.reset();

        if (dragDOMIsRemove && dragDOM && dragDOM.parentNode) {
          dragDOM.parentNode.removeChild(dragDOM);
        }

        if (endDrag) {
          endDrag(_extends({}, dragResult, {
            model: model,
            monitor: monitor,
            component: _this3
          }));
        }

        model.fireEvent("onDragEnd", _extends({}, dragResult, {
          type: EVENT_TYPE_SORT,
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
    var dom = findDOMNode(this);

    this._connectDropTarget(dom);

    this._connectDragTarget(dom);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    //fix: 当拖动节点在拖动状态被删除时导致react-dnd在drop后需要移动鼠标才及时触发endDrag问题
    var dragDOM = this._connectDragDOM;
    var dragState = DragState.getState();

    if (dragState.isDragging && dragDOM && dragState.dragDOM === dragDOM) {
      DragState.setState({
        dragDOMIsRemove: true
      });
      setTimeout(function () {
        if (isNodeInDocument(dragDOM)) return;
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

    var _useDrop = useDrop(this.getDropOptions()),
        collectedDropProps = _useDrop[0],
        connectDropTarget = _useDrop[1];

    var _useDrag = useDrag(this.getDragOptions()),
        collectedDragProps = _useDrag[0],
        connectDragTarget = _useDrag[1],
        connectDragPreview = _useDrag[2];

    this._connectDropTarget = connectDropTarget;
    this._connectDragTarget = React.useCallback(function (dom) {
      _this4._connectDragDOM = dom;
      connectDragTarget(dom);
    }, [connectDragTarget]);
    this._connectDragPreview = connectDragPreview;
    var connectDragAndDrop = React.useCallback(function (dom) {
      _this4._connectDropTarget(dom);

      _this4._connectDragTarget(dom);
    }, []);

    var props = _extends({}, collectedDropProps, {}, collectedDragProps, {
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
    props.hoverDirection = isStrictlyOver && !isDragging && canDrop ? this._lastHoverDirection : DRAG_DIR_NONE;
    return children ? typeof children === "function" ? children(props) : children : render ? render(props) : null;
  };

  return DropItem;
}(React.Component);

_defineProperty(DropItem, "contextType", ModelContext);

_defineProperty(DropItem, "defaultProps", {
  accepts: []
});

DropItem.propTypes = process.env.NODE_ENV !== "production" ? {
  item: propTypes.object.isRequired,
  children: propTypes.oneOfType([propTypes.func, propTypes.node]),
  render: propTypes.func,
  axis: propTypes.oneOf([AXIS_BOTH, AXIS_HORIZONTAL, AXIS_VERTICAL]),
  accepts: propTypes.array,
  canDrop: propTypes.func,
  hover: propTypes.func,
  canDrag: propTypes.func,
  beginDrag: propTypes.func,
  endDrag: propTypes.func
} : {};
export default withHooks(DropItem);