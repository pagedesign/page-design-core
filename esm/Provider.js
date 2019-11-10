
import _extends from "@babel/runtime/helpers/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/objectWithoutPropertiesLoose";
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import React from "react";
import HTML5Backend from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import Model from "./Model";

var PageDesignCoreProvider =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(PageDesignCoreProvider, _React$Component);

  function PageDesignCoreProvider() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "model", null);

    _defineProperty(_assertThisInitialized(_this), "saveModel", function (model) {
      _this.model = model;
    });

    return _this;
  }

  var _proto = PageDesignCoreProvider.prototype;

  _proto.getModel = function getModel() {
    return this.model;
  };

  _proto.render = function render() {
    var _this$props = this.props,
        backend = _this$props.backend,
        context = _this$props.context,
        props = _objectWithoutPropertiesLoose(_this$props, ["backend", "context"]);

    return React.createElement(DndProvider, {
      backend: backend,
      context: context
    }, React.createElement(Model, _extends({}, props, {
      ref: this.saveModel
    })));
  };

  return PageDesignCoreProvider;
}(React.Component);

_defineProperty(PageDesignCoreProvider, "defaultProps", {
  context: window,
  backend: HTML5Backend
});

export { PageDesignCoreProvider as default };