
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

var _reactDnd = require("react-dnd");

var _withComponentHooks = _interopRequireDefault(require("with-component-hooks"));

var _ModelContext = _interopRequireDefault(require("../ModelContext"));

var _constants = require("../constants");

var _utils = require("../utils");

var _DragState = _interopRequireDefault(require("../Model/DragState"));

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
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDragDOM", null);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDragTarget", null);
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "_connectDragPreview", null);
    return _this;
  }

  (0, _createClass2["default"])(WidgetItem, [{
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.connectDragTarget();
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.connectDragTarget();
    }
  }, {
    key: "connectDragTarget",
    value: function connectDragTarget() {
      var children = this.props.children;
      if (!children || typeof children === "function") return;

      this._connectDragTarget((0, _reactDom.findDOMNode)(this));
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

      this._connectDragTarget(null);

      this._connectDragPreview(null);
    }
  }, {
    key: "getDragOptions",
    value: function getDragOptions() {
      var _this2 = this;

      var _this$props = this.props,
          getInstance = _this$props.getInstance,
          _canDrag = _this$props.canDrag,
          beginDrag = _this$props.beginDrag,
          endDrag = _this$props.endDrag;
      var model = this.context;
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

          _DragState["default"].setState({
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
          var _DragState$getState = _DragState["default"].getState(),
              dragDOMIsRemove = _DragState$getState.dragDOMIsRemove,
              dragDOM = _DragState$getState.dragDOM;

          _DragState["default"].reset();

          if (dragDOMIsRemove && dragDOM && dragDOM.parentNode) {
            dragDOM.parentNode.removeChild(dragDOM);
          }

          if (endDrag) {
            endDrag((0, _objectSpread2["default"])({}, dragResult, {
              model: model,
              monitor: monitor,
              component: _this2
            }));
          }

          model.clearTmpItems();
          model.fireEvent("onDragEnd", (0, _objectSpread2["default"])({}, dragResult, {
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
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      var _this$props2 = this.props,
          children = _this$props2.children,
          render = _this$props2.render;
      var model = this.context;

      var _useDrag = (0, _reactDnd.useDrag)(this.getDragOptions()),
          _useDrag2 = (0, _slicedToArray2["default"])(_useDrag, 3),
          collectProps = _useDrag2[0],
          connectDragTarget = _useDrag2[1],
          connectDragPreview = _useDrag2[2];

      this._connectDragTarget = _react["default"].useCallback(function (dom) {
        _this3._connectDragDOM = dom;
        connectDragTarget(dom);
      }, [connectDragTarget]);
      this._connectDragPreview = connectDragPreview;
      var props = (0, _objectSpread2["default"])({}, collectProps, {
        model: model,
        connectDragTarget: connectDragTarget,
        connectDragPreview: connectDragPreview
      });
      return children ? typeof children === "function" ? children(props) : children : render ? render(props) : null;
    }
  }]);
  return WidgetItem;
}(_react["default"].Component);

(0, _defineProperty2["default"])(WidgetItem, "contextType", _ModelContext["default"]);
(0, _defineProperty2["default"])(WidgetItem, "propTypes", {
  children: _propTypes["default"].oneOfType([_propTypes["default"].func, _propTypes["default"].node]),
  render: _propTypes["default"].func,
  getInstance: _propTypes["default"].func.isRequired,
  canDrag: _propTypes["default"].func,
  beginDrag: _propTypes["default"].func,
  endDrag: _propTypes["default"].func
});

var _default = (0, _withComponentHooks["default"])(WidgetItem);

exports["default"] = _default;