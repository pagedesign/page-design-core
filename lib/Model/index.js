
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf3 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _ModelContext = _interopRequireDefault(require("../ModelContext"));

var _find = _interopRequireDefault(require("lodash/find"));

var _findIndex = _interopRequireDefault(require("lodash/findIndex"));

function randomStr() {
  var prefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
  return prefix + Math.random().toString(16).slice(2, 8);
}

function normalizeItem(item, props) {
  var idField = props.idField;
  var pidField = props.pidField;
  item[idField] = item[idField] === undefined ? randomStr("item_") : item[idField];
  item[pidField] = item[pidField] === undefined ? null : item[pidField];
  return item;
}

var WebDesignModel =
/*#__PURE__*/
function (_React$Component) {
  (0, _inherits2["default"])(WebDesignModel, _React$Component);

  function WebDesignModel() {
    var _getPrototypeOf2;

    var _this;

    (0, _classCallCheck2["default"])(this, WebDesignModel);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = (0, _possibleConstructorReturn2["default"])(this, (_getPrototypeOf2 = (0, _getPrototypeOf3["default"])(WebDesignModel)).call.apply(_getPrototypeOf2, [this].concat(args)));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "DropContainerContext", _react["default"].createContext({
      isRootContainer: true,
      canDrop: null
    }));
    (0, _defineProperty2["default"])((0, _assertThisInitialized2["default"])(_this), "state", {
      scope: randomStr("scope_"),
      items: []
    });
    return _this;
  }

  (0, _createClass2["default"])(WebDesignModel, [{
    key: "onChange",
    value: function onChange(items) {
      var props = this.props;
      var onChange = props.onChange;

      if (!("value" in props)) {
        this.setState({
          items: items
        });
      }

      if (onChange) {
        onChange(items);
      }
    }
  }, {
    key: "getScope",
    value: function getScope() {
      return this.state.scope;
    }
  }, {
    key: "fireEvent",
    value: function fireEvent(eventName, ev) {
      var _this$props = this.props,
          onDragStart = _this$props.onDragStart,
          onDragEnd = _this$props.onDragEnd,
          onDrop = _this$props.onDrop;
      var events = {
        onDragStart: onDragStart,
        onDragEnd: onDragEnd,
        onDrop: onDrop
      };
      var handler = events[eventName];

      if (handler) {
        handler(ev);
      }
    }
  }, {
    key: "getItems",
    value: function getItems() {
      var pid = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var pidField = this.props.pidField;
      var items = this.getAllItems();
      return items.filter(function (item) {
        return item && item[pidField] == pid;
      });
    }
  }, {
    key: "getChildren",
    value: function getChildren() {
      var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      var items = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.state.items;
      var pidField = this.props.pidField;
      return items.filter(function (item) {
        return item[pidField] == id;
      });
    }
  }, {
    key: "getAllItems",
    value: function getAllItems() {
      return (0, _toConsumableArray2["default"])(this.state.items);
    } //获取组件的所有父级ID

  }, {
    key: "getPids",
    value: function getPids(id) {
      var _this$props2 = this.props,
          idField = _this$props2.idField,
          pidField = _this$props2.pidField;
      var pids = [];
      var node = this.getItem(id);
      if (!node) return pids;
      if (!node[pidField]) return pids;
      var currentFieldId = node[pidField];
      var pNode;

      while (pNode = this.getItem(currentFieldId)) {
        pids.push(pNode[idField]);
        currentFieldId = pNode[pidField];
        if (!currentFieldId) break;
      }

      return pids;
    }
  }, {
    key: "updateItem",
    value: function updateItem(item) {
      var idField = this.props.idField;
      var items = this.getAllItems();
      var id = item[idField];
      var idx = this.getItemIndex(id);

      if (idx !== -1) {
        items[idx] = item;
      }

      this.onChange(items);
    }
  }, {
    key: "isSameItem",
    value: function isSameItem(s1, s2) {
      var idField = this.props.idField;
      return s1[idField] === s2[idField];
    }
  }, {
    key: "addItem",
    value: function addItem(item) {
      var pid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var _this$props3 = this.props,
          pidField = _this$props3.pidField,
          indexField = _this$props3.indexField;
      item = normalizeItem(item, this.props);
      var items = this.getAllItems();
      item[pidField] = pid;
      items.push(item);
      this.onChange(items);
    }
  }, {
    key: "addTmpItem",
    value: function addTmpItem(item, pid) {
      item.__tmp__ = true;
      item.__dragging__ = true;
      this.addItem(item, pid);
    }
  }, {
    key: "setItemDragging",
    value: function setItemDragging(item) {
      item.__dragging__ = true;
      this.onChange(this.getAllItems());
    }
  }, {
    key: "removeItem",
    value: function removeItem(id) {
      var _this2 = this;

      var idField = this.props.idField;
      var items = this.getAllItems(); //移除指定项目及子项目

      var ret = items.filter(function (item) {
        var shouldRemove = item[idField] === id;

        if (!shouldRemove) {
          var pids = _this2.getPids(item[idField]);

          shouldRemove = pids.indexOf(id) > -1;
        }

        return !shouldRemove;
      });
      this.onChange(ret);
    }
  }, {
    key: "getItemIndex",
    value: function getItemIndex(id, items) {
      var idField = this.props.idField;
      items = items || this.getAllItems();
      return (0, _findIndex["default"])(items, function (item) {
        return item[idField] === id;
      });
    }
  }, {
    key: "getItem",
    value: function getItem(id) {
      var idField = this.props.idField;
      var items = this.getAllItems();
      return (0, _find["default"])(items, function (item) {
        return item && item[idField] === id;
      });
    }
  }, {
    key: "insertBefore",
    value: function insertBefore(item, bItem) {
      var _this$props4 = this.props,
          idField = _this$props4.idField,
          pidField = _this$props4.pidField;
      var items = this.getAllItems();
      var id = bItem[idField]; // const bItem = this.getItem(id);
      //判断是否需要移动

      var _idx = this.getItemIndex(id);

      if (_idx !== 0) {
        var prevItem = items[_idx - 1];

        if (prevItem[idField] === item[idField] && prevItem[pidField] === bItem[pidField]) {
          return;
        }
      } //判断当前item是否已经存在, 如果存在则先删除


      var oIdx = this.getItemIndex(item[idField]);

      if (oIdx > -1) {
        items.splice(oIdx, 1);
      }

      item[pidField] = bItem[pidField]; //插入操作

      var idx = this.getItemIndex(id, items);
      items.splice(idx, 0, item);
      this.onChange(items);
    }
  }, {
    key: "insertAfter",
    value: function insertAfter(item, prevItem) {
      var _this$props5 = this.props,
          idField = _this$props5.idField,
          pidField = _this$props5.pidField;
      var items = this.getAllItems();
      var id = prevItem[idField]; // const prevItem = this.getItem(id);
      //判断是否需要移动

      var _idx = this.getItemIndex(id);

      if (_idx !== items.length - 1) {
        var nextItem = items[_idx + 1];

        if (nextItem[idField] === item[idField] && nextItem[pidField] === prevItem[pidField]) {
          return;
        }
      } //判断当前item是否已经存在, 如果存在则先删除


      var oIdx = this.getItemIndex(item[idField]);

      if (oIdx > -1) {
        items.splice(oIdx, 1);
      }

      item[pidField] = prevItem[pidField]; //插入操作 之前有删除操作, 要重新查找index

      var idx = (0, _findIndex["default"])(items, function (item) {
        return item[idField] === id;
      });
      items.splice(idx, 1, items[idx], item);
      this.onChange(items);
    }
  }, {
    key: "clearTmpItems",
    value: function clearTmpItems() {
      var items = this.getAllItems();
      var newItems = items.map(function (item) {
        if (item.__dragging__) {
          delete item.__dragging__;
        }

        return item;
      }).filter(function (item) {
        return !item.__tmp__;
      });
      this.onChange(newItems);
    }
  }, {
    key: "updateItemPid",
    value: function updateItemPid(item) {
      var pid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var _this$props6 = this.props,
          idField = _this$props6.idField,
          pidField = _this$props6.pidField;
      var id = item[idField];
      var idx = this.getItemIndex(id);
      if (item[pidField] === pid) return true;
      /**
       * 局部环路检测
       * 如: {id: A, pid: null}  {id: B, pid: A}
       * 这是如果updateItemPid(A, B) 结果为:
       * {id: A, pid: B}  {id: B, pid: A}
       *
       */

      var pids = pid == null ? [] : this.getPids(pid);

      if (pids.length) {
        if (pids.indexOf(id) !== -1) {
          return false;
        }
      } // 同级节点转变为子节点时顺序处理


      if (pid) {
        var pidIndex = this.getItemIndex(pid);
        var childs = this.getChildren(pid);

        if (childs.length) {
          var firstItem = childs[0];
          var lastItem = childs[childs.length - 1];

          if (idx > pidIndex) {
            this.insertAfter(item, lastItem);
          } else {
            this.insertBefore(item, firstItem);
          }

          return true;
        }
      }

      if (idx !== -1) {
        item[pidField] = pid;
      }

      this.onChange(this.getAllItems());
      return true;
    }
  }, {
    key: "commitItem",
    value: function commitItem(item) {
      var idField = this.props.idField;
      var items = this.getAllItems();
      var id = item[idField];
      var idx = this.getItemIndex(id);

      if (idx !== -1 && item.__tmp__) {
        item.__tmp__ = false;
        delete item.__tmp__;
        items[idx] = item;
        this.onChange(items);
      }
    }
  }, {
    key: "isTmpItem",
    value: function isTmpItem(item) {
      return !!item.__tmp__;
    }
  }, {
    key: "isDragging",
    value: function isDragging(item) {
      return !!item.__dragging__;
    }
  }, {
    key: "getModel",
    value: function getModel() {
      return Object.create(this); // return {
      //     DropContainerContext: this.DropContainerContext,
      //     isSameItem: this.isSameItem.bind(this),
      //     getScope: this.getScope.bind(this),
      //     fireEvent: this.fireEvent.bind(this),
      //     addItem: this.addItem.bind(this),
      //     addTmpItem: this.addTmpItem.bind(this),
      //     getPids: this.getPids.bind(this),
      //     updateItem: this.updateItem.bind(this),
      //     getItems: this.getItems.bind(this),
      //     getAllItems: this.getAllItems.bind(this),
      //     removeItem: this.removeItem.bind(this),
      //     getItemIndex: this.getItemIndex.bind(this),
      //     getItem: this.getItem.bind(this),
      //     insertBefore: this.insertBefore.bind(this),
      //     insertAfter: this.insertAfter.bind(this),
      //     clearTmpItems: this.clearTmpItems.bind(this),
      //     commitItem: this.commitItem.bind(this),
      //     isTmpItem: this.isTmpItem.bind(this),
      //     updateItemPid: this.updateItemPid.bind(this),
      //     setItemDragging: this.setItemDragging.bind(this),
      //     isDragging: this.isDragging.bind(this)
      // };
    }
  }, {
    key: "render",
    value: function render() {
      var children = this.props.children;
      return _react["default"].createElement(_ModelContext["default"].Provider, {
        value: this.getModel()
      }, children);
    }
  }], [{
    key: "getDerivedStateFromProps",
    value: function getDerivedStateFromProps(props, state) {
      if (props.value) {
        props.value.forEach(function (item) {
          return normalizeItem(item, props);
        });
      }

      return {
        items: "value" in props ? props.value : state.items
      };
    }
  }]);
  return WebDesignModel;
}(_react["default"].Component);

exports["default"] = WebDesignModel;
(0, _defineProperty2["default"])(WebDesignModel, "propTypes", {
  value: _propTypes["default"].array,
  align: _propTypes["default"].oneOf(["all", "vertical", "horizontal"]),
  onChange: _propTypes["default"].func,
  onDragStart: _propTypes["default"].func,
  onDragEnd: _propTypes["default"].func,
  onDrop: _propTypes["default"].func
});
(0, _defineProperty2["default"])(WebDesignModel, "defaultProps", {
  idField: "id",
  pidField: "pid",
  indexField: "index",
  align: "vertical",
  onChange: null
});