
import _extends from "@babel/runtime/helpers/extends";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import React from "react";
import { findDOMNode } from "react-dom";
import { useDrop } from "react-dnd";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import invariant from "invariant";
import { EVENT_TYPE_ADD, EVENT_TYPE_SORT, DRAG_DIR_NONE, DRAG_DIR_UP, DRAG_DIR_LEFT, COMMIT_ACTION_DROP, COMMIT_ACTION_AUTO, AXIS_VERTICAL, AXIS_HORIZONTAL, AXIS_BOTH } from "./constants";
import ModelContext from "./ModelContext";
import DragState from "./DragState";

var DropContainer =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(DropContainer, _React$Component);

  function DropContainer() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "_connectDropTarget", null);

    return _this;
  }

  var _proto = DropContainer.prototype;

  _proto.connectDropTarget = function connectDropTarget() {
    var children = this.props.children;
    if (!children || typeof children === "function") return;
    var dom = findDOMNode(this);

    this._connectDropTarget(dom);
  };

  _proto.componentDidMount = function componentDidMount() {
    //TODO: 后续提示_connectDropTarget是否被未被调用 DropItem WidgetItem 同样提示
    this.connectDropTarget();
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    //TODO: 后续提示_connectDropTarget是否被未被调用
    this.connectDropTarget();
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this._connectDropTarget(null);
  };

  _proto.getModel = function getModel() {
    return this.context.model;
  };

  _proto.getDropOptions = function getDropOptions() {
    var _this2 = this;

    var _this$props = this.props,
        _this$props$id = _this$props.id,
        id = _this$props$id === void 0 ? null : _this$props$id,
        _hover = _this$props.hover,
        _canDrop = _this$props.canDrop,
        _drop = _this$props.drop,
        accepts = _this$props.accepts;
    var targetDOM = findDOMNode(this);
    var model = this.getModel(); // const DropContainerContext = model.DropContainerContext;
    // const { isRootContainer } = React.useContext(DropContainerContext);

    var commitAction = model.props.commitAction;
    return {
      accept: [model.getScope()].concat(accepts),
      canDrop: function canDrop(dragResult, monitor) {
        var ret = !model.contains(dragResult.item, model.getItem(id));

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
        DragState.setState({
          canDrop: monitor.canDrop(),
          hoverContainerId: id,
          hoverItem: undefined,
          hoverDirection: DRAG_DIR_NONE
        });

        if (canDrop) {
          if (commitAction === COMMIT_ACTION_AUTO) {
            model.updateItemPid(dragResult.item, id);
          }
        }

        var e = _extends({
          target: id,
          targetDOM: targetDOM,
          monitor: monitor,
          component: _this2,
          model: model
        }, dragResult);

        model.fireEvent("onDragHoverContainer", e);
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
        } // //在根节点统一commit时会出现问题，当根节点canDrop返回false时导致无法提交
        // if (isRootContainer) {
        //     const isTmpItem = model.isTmpItem(dragResult.item);
        //     model.fireEvent("onDrop", {
        //         target: id,
        //         targetDOM,
        //         type: isTmpItem ? EVENT_TYPE_ADD : EVENT_TYPE_SORT,
        //         ...dragResult
        //     });
        //     if (commitAction === COMMIT_ACTION_AUTO) {
        //         model.commitItem(dragResult.item);
        //     } else if (commitAction === COMMIT_ACTION_DROP) {
        //         model.commitDragStateItem();
        //     }
        // }


        if (!monitor.didDrop()) {
          if (commitAction === COMMIT_ACTION_AUTO) {
            model.commitItem(dragResult.item);
          } else if (commitAction === COMMIT_ACTION_DROP) {
            model.commitDragStateItem();
          }

          var _DragState$getState = DragState.getState(),
              isNew = _DragState$getState.isNew; // const isTmpItem = model.isTmpItem(dragResult.item);


          var e = _extends({
            target: id,
            targetDOM: targetDOM,
            type: isNew ? EVENT_TYPE_ADD : EVENT_TYPE_SORT,
            monitor: monitor,
            component: _this2,
            model: model
          }, dragResult);

          model.fireEvent("onDropToContainer", e);
          model.fireEvent("onDrop", e);
        }
      },
      collect: function collect(monitor) {
        return {
          monitor: monitor,
          canDrop: monitor.canDrop(),
          isOver: monitor.isOver(),
          isStrictlyOver: monitor.isOver({
            shallow: true
          })
        };
      }
    };
  };

  _proto.render = function render() {
    var _this$props2 = this.props,
        id = _this$props2.id,
        children = _this$props2.children,
        render = _this$props2.render,
        axis = _this$props2.axis;
    var model = this.getModel();
    var DropContainerContext = model.DropContainerContext;

    var _React$useContext = React.useContext(DropContainerContext),
        isRootContainer = _React$useContext.isRootContainer;

    !(isRootContainer ? true : id != null) ? process.env.NODE_ENV !== "production" ? invariant(false, "sub DropContainer id is required.") : invariant(false) : void 0;

    var _useDrop = useDrop(this.getDropOptions()),
        collectedProps = _useDrop[0],
        connectDropTarget = _useDrop[1];

    var items = model.getChildren(id);

    if (!collectedProps.isOver) {
      //collectedProps.isStrictlyOver
      items = items.filter(function (item) {
        return !model.isTmpItem(item);
      });
    }

    this._connectDropTarget = connectDropTarget;

    var props = _extends({}, collectedProps, {
      model: model,
      connectDropTarget: connectDropTarget,
      items: items
    });

    var child = children ? typeof children === "function" ? children(props) : children : render ? render(props) : null;
    return React.createElement(DropContainerContext.Provider, {
      value: {
        isRootContainer: false,
        axis: axis
      }
    }, child);
  };

  return DropContainer;
}(React.Component);

_defineProperty(DropContainer, "contextType", ModelContext);

_defineProperty(DropContainer, "defaultProps", {
  id: null,
  accepts: []
});

DropContainer.propTypes = process.env.NODE_ENV !== "production" ? {
  children: propTypes.oneOfType([propTypes.func, propTypes.node]),
  axis: propTypes.oneOf([AXIS_BOTH, AXIS_HORIZONTAL, AXIS_VERTICAL]),
  accepts: propTypes.array,
  render: propTypes.func,
  id: propTypes.any,
  canDrop: propTypes.func,
  hover: propTypes.func,
  drop: propTypes.func
} : {};
export default withHooks(DropContainer);