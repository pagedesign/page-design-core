
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

var _reactDnd = require("react-dnd");

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _ModelContext = _interopRequireDefault(require("./ModelContext"));

var _constants = require("./constants");

var _utils = require("./utils");

var _DragState = _interopRequireDefault(require("./DragState"));

var WidgetItem =
/*#__PURE__*/
function (_React$Component) {
  (0, _inheritsLoose2.default)(WidgetItem, _React$Component);

  function WidgetItem() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_connectDragDOM", null);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_connectDragTarget", null);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_connectDragPreview", null);
    return _this;
  }

  var _proto = WidgetItem.prototype;

  _proto.componentDidUpdate = function componentDidUpdate() {
    this.connectDragTarget();
  };

  _proto.componentDidMount = function componentDidMount() {
    this.connectDragTarget();
  };

  _proto.getModel = function getModel() {
    return this.context.model;
  };

  _proto.connectDragTarget = function connectDragTarget() {
    var children = this.props.children;
    if (!children || typeof children === "function") return;

    this._connectDragTarget((0, _reactDom.findDOMNode)(this));
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

    this._connectDragTarget(null);

    this._connectDragPreview(null);
  };

  _proto.getDragOptions = function getDragOptions() {
    var _this2 = this;

    var _this$props = this.props,
        getInstance = _this$props.getInstance,
        _canDrag = _this$props.canDrag,
        beginDrag = _this$props.beginDrag,
        endDrag = _this$props.endDrag;
    var model = this.getModel();
    var commitAction = model.props.commitAction;
    return {
      item: {
        type: model.getScope()
      },
      canDrag: function canDrag(monitor) {
        if (_canDrag) {
          return _canDrag({
            monitor: monitor,
            model: model,
            component: _this2
          });
        }

        return true;
      },
      begin: function begin(monitor) {
        var item = getInstance();
        var dom = (0, _reactDom.findDOMNode)(_this2);

        if (beginDrag) {
          beginDrag({
            item: item,
            dom: dom,
            component: _this2,
            monitor: monitor,
            model: model
          });
        }

        var dragDOM = _this2._connectDragDOM;

        _DragState.default.setState({
          item: item,
          isNew: true,
          dragDOMIsRemove: false,
          isDragging: true,
          dragDOM: dragDOM
        });

        if (commitAction === _constants.COMMIT_ACTION_AUTO) {
          model.addTmpItem(item);
        }

        model.fireEvent("onDragStart", {
          item: item,
          dom: dom,
          type: _constants.EVENT_TYPE_ADD,
          model: model,
          monitor: monitor,
          component: _this2
        });
        return {
          item: item,
          dom: dom
        };
      },
      end: function end(dragResult, monitor) {
        var _DragState$getState = _DragState.default.getState(),
            dragDOMIsRemove = _DragState$getState.dragDOMIsRemove,
            dragDOM = _DragState$getState.dragDOM;

        _DragState.default.reset();

        if (dragDOMIsRemove && dragDOM && dragDOM.parentNode) {
          dragDOM.parentNode.removeChild(dragDOM);
        }

        if (endDrag) {
          endDrag((0, _extends2.default)({}, dragResult, {
            model: model,
            monitor: monitor,
            component: _this2
          }));
        }

        model.clearTmpItems();
        model.fireEvent("onDragEnd", (0, _extends2.default)({}, dragResult, {
          type: _constants.EVENT_TYPE_ADD,
          model: model,
          monitor: monitor,
          component: _this2
        }));
      },
      collect: function collect(monitor) {
        return {
          monitor: monitor,
          isDragging: monitor.isDragging()
        };
      }
    };
  };

  _proto.render = function render() {
    var _this3 = this;

    var _this$props2 = this.props,
        children = _this$props2.children,
        render = _this$props2.render;
    var model = this.getModel();

    var _useDrag = (0, _reactDnd.useDrag)(this.getDragOptions()),
        collectProps = _useDrag[0],
        connectDragTarget = _useDrag[1],
        connectDragPreview = _useDrag[2];

    this._connectDragTarget = _react.default.useCallback(function (dom) {
      _this3._connectDragDOM = dom;
      connectDragTarget(dom);
    }, [connectDragTarget]);
    this._connectDragPreview = connectDragPreview;
    var props = (0, _extends2.default)({}, collectProps, {
      model: model,
      connectDragTarget: connectDragTarget,
      connectDragPreview: connectDragPreview
    });
    return children ? typeof children === "function" ? children(props) : children : render ? render(props) : null;
  };

  return WidgetItem;
}(_react.default.Component);

(0, _defineProperty2.default)(WidgetItem, "contextType", _ModelContext.default);
WidgetItem.propTypes = process.env.NODE_ENV !== "production" ? {
  children: _propTypes.default.oneOfType([_propTypes.default.func, _propTypes.default.node]),
  render: _propTypes.default.func,
  getInstance: _propTypes.default.func.isRequired,
  canDrag: _propTypes.default.func,
  beginDrag: _propTypes.default.func,
  endDrag: _propTypes.default.func
} : {};

var _default = (0, _withComponentHooks.default)(WidgetItem);

exports.default = _default;