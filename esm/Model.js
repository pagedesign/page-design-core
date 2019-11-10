
import _assertThisInitialized from "@babel/runtime/helpers/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/defineProperty";
import React from "react";
import propTypes from "prop-types";
import { last, find, findIndex } from "./utils";
import ModelContext from "./ModelContext";
import DragState from "./DragState";
import { COMMIT_ACTION_AUTO, COMMIT_ACTION_DROP, DRAG_DIR_UP, DRAG_DIR_LEFT, AXIS_VERTICAL, AXIS_HORIZONTAL, AXIS_BOTH } from "./constants";

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
  item[pidField] = item[pidField] === undefined ? props.rootId : item[pidField];
  return item;
}

var Model =
/*#__PURE__*/
function (_React$Component) {
  _inheritsLoose(Model, _React$Component);

  function Model() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

    _defineProperty(_assertThisInitialized(_this), "DropContainerContext", React.createContext({
      isRootContainer: true,
      axis: AXIS_VERTICAL
    }));

    _defineProperty(_assertThisInitialized(_this), "state", {
      scope: randomStr("scope_"),
      items: _this.props.defaultValue || []
    });

    return _this;
  }

  Model.getDerivedStateFromProps = function getDerivedStateFromProps(props, state) {
    if (props.value) {
      props.value.forEach(function (item) {
        return normalizeItem(item, props);
      });
    }

    return {
      items: "value" in props ? props.value : state.items
    };
  };

  var _proto = Model.prototype;

  _proto.getDragState = function getDragState() {
    return DragState.getState();
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
    var props = this.props;
    var handler = props[eventName];

    if (handler) {
      handler(ev);
    }
  };

  _proto.contains = function contains(parentNode, childNode) {
    var idField = this.props.idField;
    if (!childNode) return false;
    var parentId = parentNode[idField];
    var childId = childNode[idField];
    var pids = this.getPids(childId);
    return pids.indexOf(parentId) !== -1;
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
      return item && item[pidField] === id;
    });
  };

  _proto.getAllItems = function getAllItems() {
    return [].concat(this.state.items);
  };

  _proto.isRootId = function isRootId(id) {
    var rootId = this.props.rootId;
    var isRootId = id == null || rootId === id; //id存在但无法找到节点

    if (!isRootId) {
      isRootId = !!this.getItem(id);
    }

    return isRootId;
  } //获取组件的所有父级ID
  ;

  _proto.getPids = function getPids(id) {
    var _this$props = this.props,
        idField = _this$props.idField,
        pidField = _this$props.pidField;
    var pids = [];
    var node = this.getItem(id);
    if (!node) return pids;
    if (this.isRootId(node.pidField)) return pids;
    var currentFieldId = node[pidField];
    var pNode;

    while (pNode = this.getItem(currentFieldId)) {
      pids.push(pNode[idField]);
      currentFieldId = pNode[pidField];
      if (this.isRootId(currentFieldId)) break;
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

  _proto.addItems = function addItems(items, pid) {
    var _this2 = this;

    if (items === void 0) {
      items = [];
    }

    if (pid === void 0) {
      pid = null;
    }

    var pidField = this.props.pidField;
    items = items.map(function (item) {
      return normalizeItem(item, _this2.props);
    });
    items.forEach(function (item) {
      return item[pidField] = pid;
    });
    this.onChange([].concat(this.getAllItems(), items));
  };

  _proto.addTmpItem = function addTmpItem(item, pid) {
    item.__tmp__ = true;
    this.addItem(item, pid);
  };

  _proto.removeItem = function removeItem(id) {
    var _this3 = this;

    var idField = this.props.idField;
    var items = this.getAllItems(); //移除指定项目及子项目

    var ret = items.filter(function (item) {
      var shouldRemove = item[idField] === id;

      if (!shouldRemove) {
        var pids = _this3.getPids(item[idField]);

        shouldRemove = pids.indexOf(id) > -1;
      }

      return !shouldRemove;
    });
    this.onChange(ret);
  };

  _proto.getItemIndex = function getItemIndex(id, items) {
    if (items === void 0) {
      items = this.state.items;
    }

    //this.getAllItems()
    var idField = this.props.idField; // items = items || this.getAllItems();

    return findIndex(items, function (item) {
      return item[idField] === id;
    });
  };

  _proto.getItem = function getItem(id, items) {
    if (items === void 0) {
      items = this.state.items;
    }

    var idField = this.props.idField;
    return find(items, function (item) {
      return item && item[idField] === id;
    });
  };

  _proto.insertBefore = function insertBefore(item, bItem) {
    if (this.isSameItem(item, bItem)) return false;
    var _this$props2 = this.props,
        idField = _this$props2.idField,
        pidField = _this$props2.pidField;
    var items = this.getAllItems();
    var id = bItem[idField]; //判断是否需要移动

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

    var idx = findIndex(items, function (item) {
      return item[idField] === id;
    }); //this.getItemIndex(id, items);

    items.splice(idx, 0, item);
    this.onChange(items);
    return true;
  };

  _proto.insertAfter = function insertAfter(item, prevItem) {
    if (this.isSameItem(item, prevItem)) return false;
    var _this$props3 = this.props,
        idField = _this$props3.idField,
        pidField = _this$props3.pidField;
    var items = this.getAllItems();
    var id = prevItem[idField]; //判断是否需要移动

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

    var idx = findIndex(items, function (item) {
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

    var _this$props4 = this.props,
        idField = _this$props4.idField,
        pidField = _this$props4.pidField;
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
    var _this4 = this;

    var dragState = DragState.getState();
    var canDrop = dragState.canDrop;
    var dragItem = dragState.item;
    var hoverContainerId = dragState.hoverContainerId;
    var hoverItem = dragState.hoverItem;
    var hoverDirection = dragState.hoverDirection;
    var isDragging = dragState.isDragging;
    var isNew = dragState.isNew;
    if (!isDragging || !canDrop) return;
    DragState.reset();

    var moveItem = function moveItem() {
      if (hoverDirection === DRAG_DIR_UP || hoverDirection === DRAG_DIR_LEFT) {
        _this4.insertBefore(dragItem, hoverItem);
      } else {
        _this4.insertAfter(dragItem, hoverItem);
      }
    };

    if (isNew) {
      if (hoverItem) {
        //新增
        this._addItem(dragItem, undefined, false); //移动


        moveItem();
      } else {
        //新增
        this.addItem(dragItem, hoverContainerId);
      }
    } else {
      if (hoverItem) {
        moveItem();
      } else {
        var childs = this.getChildren(hoverContainerId);
        var isExist = find(childs, function (item) {
          return _this4.isSameItem(item, dragItem);
        });

        if (!isExist) {
          if (childs.length) {
            this.insertAfter(dragItem, last(childs));
          } else {
            this.updateItemPid(dragItem, hoverContainerId);
          }
        }
      }
    }
  };

  _proto.isDragging = function isDragging(id) {
    var idField = this.props.idField;
    var dragState = DragState.getState();
    var isDragging = dragState.isDragging;
    if (!isDragging) return false;

    if (id !== undefined) {
      return dragState.item && dragState.item[idField] === id;
    }

    return true;
  };

  _proto.getDraggingItem = function getDraggingItem() {
    var dragState = DragState.getState();
    return dragState.item;
  };

  _proto.isTmpItem = function isTmpItem(item) {
    return !!item.__tmp__;
  };

  _proto.getModel = function getModel() {
    return {
      model: this
    };
  };

  _proto.render = function render() {
    var children = this.props.children;
    return React.createElement(ModelContext.Provider, {
      value: this.getModel()
    }, typeof children === "function" ? children(this) : children);
  };

  return Model;
}(React.Component);

_defineProperty(Model, "defaultProps", {
  rootId: null,
  idField: "id",
  pidField: "pid",
  axis: AXIS_VERTICAL,
  commitAction: COMMIT_ACTION_AUTO,
  onChange: null
});

Model.propTypes = process.env.NODE_ENV !== "production" ? {
  idField: propTypes.string,
  pidField: propTypes.string,
  value: propTypes.array,
  defaultValue: propTypes.array,
  axis: propTypes.oneOf([AXIS_BOTH, AXIS_HORIZONTAL, AXIS_VERTICAL]),
  commitAction: propTypes.oneOf([COMMIT_ACTION_AUTO, COMMIT_ACTION_DROP]),
  onChange: propTypes.func,
  onDragStart: propTypes.func,
  onDragEnd: propTypes.func,
  onDrop: propTypes.func,
  onDropToItem: propTypes.func,
  onDropToContainer: propTypes.func,
  onDragHover: propTypes.func,
  onDragHoverContainer: propTypes.func,
  onDragHoverItem: propTypes.func
} : {};
export default Model;