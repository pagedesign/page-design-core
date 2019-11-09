
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _find = _interopRequireDefault(require("lodash/find"));

var _last = _interopRequireDefault(require("lodash/last"));

var _findIndex = _interopRequireDefault(require("lodash/findIndex"));

var _ModelContext = _interopRequireDefault(require("../ModelContext"));

var _DragState = _interopRequireDefault(require("./DragState"));

var _constants = require("../constants");

function randomStr(prefix) {
  if (prefix === void 0) {
    prefix = "";
  }

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
  (0, _inheritsLoose2.default)(WebDesignModel, _React$Component);

  function WebDesignModel() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "DropContainerContext", _react.default.createContext({
      isRootContainer: true,
      axis: _constants.AXIS_VERTICAL
    }));
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "state", {
      scope: randomStr("scope_"),
      items: _this.props.defaultValue || []
    });
    return _this;
  }

  WebDesignModel.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
    if (props.value) {
      props.value.forEach(function (item) {
        return normalizeItem(item, props);
      });
    }

    return {
      items: "value" in props ? props.value : state.items
    };
  };

  var _proto = WebDesignModel.prototype;

  _proto.getDragState = function getDragState() {
    return _DragState.default.getState();
  };

  _proto.onChange = function onChange(items) {
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
  };

  _proto.getScope = function getScope() {
    return this.state.scope;
  };

  _proto.fireEvent = function fireEvent(eventName, ev) {
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
  };

  _proto.getItems = function getItems(pid) {
    if (pid === void 0) {
      pid = null;
    }

    var pidField = this.props.pidField;
    var items = this.getAllItems();
    return items.filter(function (item) {
      return item && item[pidField] == pid;
    });
  };

  _proto.getChildren = function getChildren(id, items) {
    if (id === void 0) {
      id = null;
    }

    if (items === void 0) {
      items = this.state.items;
    }

    var pidField = this.props.pidField;
    return items.filter(function (item) {
      return item && item[pidField] == id;
    });
  };

  _proto.getAllItems = function getAllItems() {
    return [].concat(this.state.items);
  } //获取组件的所有父级ID
  ;

  _proto.getPids = function getPids(id) {
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
  };

  _proto.updateItem = function updateItem(item) {
    var idField = this.props.idField;
    var items = this.getAllItems();
    var id = item[idField];
    var idx = this.getItemIndex(id);

    if (idx !== -1) {
      items[idx] = item;
    }

    this.onChange(items);
  };

  _proto.isSameItem = function isSameItem(s1, s2) {
    var idField = this.props.idField;
    return s1 && s2 && s1[idField] === s2[idField];
  };

  _proto._addItem = function _addItem(item, pid) {
    if (pid === void 0) {
      pid = null;
    }

    var pidField = this.props.pidField;
    item = normalizeItem(item, this.props);
    item[pidField] = pid;
    this.state.items.push(item);
  };

  _proto.addItem = function addItem(item, pid) {
    if (pid === void 0) {
      pid = null;
    }

    var pidField = this.props.pidField;
    item = normalizeItem(item, this.props);
    var items = this.getAllItems();
    item[pidField] = pid;
    items.push(item);
    this.onChange(items);
  };

  _proto.addTmpItem = function addTmpItem(item, pid) {
    item.__tmp__ = true;
    this.addItem(item, pid);
  };

  _proto.removeItem = function removeItem(id) {
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
  };

  _proto.getItemIndex = function getItemIndex(id, items) {
    var idField = this.props.idField;
    items = items || this.getAllItems();
    return (0, _findIndex.default)(items, function (item) {
      return item[idField] === id;
    });
  };

  _proto.getItem = function getItem(id) {
    var idField = this.props.idField;
    var items = this.getAllItems();
    return (0, _find.default)(items, function (item) {
      return item && item[idField] === id;
    });
  };

  _proto.insertBefore = function insertBefore(item, bItem) {
    if (this.isSameItem(item, bItem)) return false;
    var _this$props3 = this.props,
        idField = _this$props3.idField,
        pidField = _this$props3.pidField;
    var items = this.getAllItems();
    var id = bItem[idField]; // const bItem = this.getItem(id);
    //判断是否需要移动

    var _idx = this.getItemIndex(id);

    if (_idx !== 0) {
      var prevItem = items[_idx - 1];

      if (prevItem[idField] === item[idField] && prevItem[pidField] === bItem[pidField]) {
        return false;
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
    return true;
  };

  _proto.insertAfter = function insertAfter(item, prevItem) {
    if (this.isSameItem(item, prevItem)) return false;
    var _this$props4 = this.props,
        idField = _this$props4.idField,
        pidField = _this$props4.pidField;
    var items = this.getAllItems();
    var id = prevItem[idField]; // const prevItem = this.getItem(id);
    //判断是否需要移动

    var _idx = this.getItemIndex(id);

    if (_idx !== items.length - 1) {
      var nextItem = items[_idx + 1];

      if (nextItem[idField] === item[idField] && nextItem[pidField] === prevItem[pidField]) {
        return false;
      }
    } //判断当前item是否已经存在, 如果存在则先删除


    var oIdx = this.getItemIndex(item[idField]);

    if (oIdx > -1) {
      items.splice(oIdx, 1);
    }

    item[pidField] = prevItem[pidField]; //插入操作 之前有删除操作, 要重新查找index

    var idx = (0, _findIndex.default)(items, function (item) {
      return item[idField] === id;
    });
    items.splice(idx, 1, items[idx], item);
    this.onChange(items);
    return true;
  };

  _proto.clearTmpItems = function clearTmpItems() {
    var items = this.getAllItems();
    var hasTmp = false;
    var newItems = items.filter(function (item) {
      var isTmp = item.__tmp__;
      isTmp && (hasTmp = true);
      return !isTmp;
    });
    hasTmp && this.onChange(newItems);
  };

  _proto.updateItemPid = function updateItemPid(item, pid) {
    if (pid === void 0) {
      pid = null;
    }

    var _this$props5 = this.props,
        idField = _this$props5.idField,
        pidField = _this$props5.pidField;
    if (item[pidField] === pid) return false;
    var id = item[idField];
    /**
     * 局部环路检测
     * 如: {id: A, pid: null}  {id: B, pid: A}
     * 如果updateItemPid(A, B) 结果为:
     * {id: A, pid: B}  {id: B, pid: A}
     *
     */

    var pids = pid == null ? [] : this.getPids(pid);

    if (pids.length) {
      if (pids.indexOf(id) !== -1) {
        return false;
      }
    }

    var items = this.getAllItems();
    var idx = this.getItemIndex(id, items);
    if (idx === -1) return false;
    item[pidField] = pid; //将当前項添加至尾部

    items.splice(idx, 1);
    items.push(item);
    this.onChange(items);
    return true;
  };

  _proto.commitItem = function commitItem(item) {
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
  } //提交DragState中的数据
  ;

  _proto.commitDragStateItem = function commitDragStateItem() {
    var _this3 = this;

    var dragState = _DragState.default.getState();

    var canDrop = dragState.canDrop;
    var dragItem = dragState.item;
    var hoverPid = dragState.hoverPid;
    var hoverItem = dragState.hoverItem;
    var hoverDirection = dragState.hoverDirection;
    var isDragging = dragState.isDragging;
    var isNew = dragState.isNew;
    if (!isDragging || !canDrop) return;

    _DragState.default.reset();

    var moveItem = function moveItem() {
      if (hoverDirection === _constants.DRAG_DIR_UP || hoverDirection === _constants.DRAG_DIR_LEFT) {
        _this3.insertBefore(dragItem, hoverItem);
      } else {
        _this3.insertAfter(dragItem, hoverItem);
      }
    };

    if (isNew) {
      if (hoverItem) {
        //新增
        this._addItem(dragItem, undefined, false); //移动


        moveItem();
      } else {
        //新增
        this.addItem(dragItem, hoverPid);
      }
    } else {
      if (hoverItem) {
        moveItem();
      } else {
        var childs = this.getItems(hoverPid);
        var isExist = (0, _find.default)(childs, function (item) {
          return _this3.isSameItem(item, dragItem);
        });

        if (!isExist) {
          if (childs.length) {
            this.insertAfter(dragItem, (0, _last.default)(childs));
          } else {
            this.updateItemPid(dragItem, hoverPid);
          }
        }
      }
    }
  };

  _proto.isTmpItem = function isTmpItem(item) {
    return !!item.__tmp__;
  };

  _proto.getModel = function getModel() {
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
  };

  _proto.render = function render() {
    var children = this.props.children;
    return _react.default.createElement(_ModelContext.default.Provider, {
      value: this.getModel()
    }, children);
  };

  return WebDesignModel;
}(_react.default.Component);

exports.default = WebDesignModel;
(0, _defineProperty2.default)(WebDesignModel, "defaultProps", {
  idField: "id",
  pidField: "pid",
  axis: _constants.AXIS_VERTICAL,
  commitAction: _constants.COMMIT_ACTION_AUTO,
  onChange: null
});
WebDesignModel.propTypes = process.env.NODE_ENV !== "production" ? {
  value: _propTypes.default.array,
  defaultValue: _propTypes.default.array,
  axis: _propTypes.default.oneOf([_constants.AXIS_BOTH, _constants.AXIS_HORIZONTAL, _constants.AXIS_VERTICAL]),
  commitAction: _propTypes.default.oneOf([_constants.COMMIT_ACTION_AUTO, _constants.COMMIT_ACTION_DROP]),
  onChange: _propTypes.default.func,
  onDragStart: _propTypes.default.func,
  onDragEnd: _propTypes.default.func,
  onDrop: _propTypes.default.func,
  onDragHoverContainer: _propTypes.default.func,
  onDragHoverItem: _propTypes.default.func
} : {};