
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import React from "react";
import { findDOMNode } from "react-dom";
import { useDrop } from "react-dnd";
import withHooks from "with-component-hooks";
import ModelContext from "./ModelContext";

var DropZone =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(DropZone, _React$Component);

  function DropZone() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "_connectDropTarget", null);

    return _this;
  }

  var _proto = DropZone.prototype;

  _proto.connectDropTarget = function connectDropTarget() {
    var dom = findDOMNode(this);

    this._connectDropTarget(dom);
  };

  _proto.componentDidMount = function componentDidMount() {
    this.connectDropTarget();
  };

  _proto.componentDidUpdate = function componentDidUpdate() {
    this.connectDropTarget();
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    this._connectDropTarget(null);
  };

  _proto.getDropOptions = function getDropOptions() {
    var model = this.context.model;
    return {
      accept: model.getScope()
    };
  };

  _proto.render = function render() {
    var _useDrop = useDrop(this.getDropOptions()),
        collectedProps = _useDrop[0],
        connectDropTarget = _useDrop[1];

    this._connectDropTarget = connectDropTarget;
    return this.props.children;
  };

  return DropZone;
}(React.Component);

_defineProperty(DropZone, "contextType", ModelContext);

export default withHooks(DropZone);