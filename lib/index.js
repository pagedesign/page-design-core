
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "getEmptyImage", {
  enumerable: true,
  get: function get() {
    return _reactDndHtml5Backend.getEmptyImage;
  }
});
Object.defineProperty(exports, "WebDesignDndProvider", {
  enumerable: true,
  get: function get() {
    return _WebDesignDndProvider["default"];
  }
});
Object.defineProperty(exports, "DropContainer", {
  enumerable: true,
  get: function get() {
    return _DropContainer.DropContainer;
  }
});
Object.defineProperty(exports, "DropItem", {
  enumerable: true,
  get: function get() {
    return _DropContainer.DropItem;
  }
});
Object.defineProperty(exports, "WidgetItem", {
  enumerable: true,
  get: function get() {
    return _WidgetItem["default"];
  }
});
Object.defineProperty(exports, "DragLayer", {
  enumerable: true,
  get: function get() {
    return _DragLayer["default"];
  }
});
exports.WebDesignContext = void 0;

var _reactDndHtml5Backend = require("react-dnd-html5-backend");

var _WebDesignDndProvider = _interopRequireDefault(require("./WebDesignDndProvider"));

var _DropContainer = require("./DropContainer");

var _WidgetItem = _interopRequireDefault(require("./WidgetItem"));

var _DragLayer = _interopRequireDefault(require("./DragLayer"));

var _ModelContext = _interopRequireDefault(require("./ModelContext"));

var WebDesignContext = _ModelContext["default"];
exports.WebDesignContext = WebDesignContext;