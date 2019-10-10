import React from "react";
import propTypes from "prop-types";
import find from "lodash/find";
import last from "lodash/last";
import findIndex from "lodash/findIndex";
import ModelContext from "../ModelContext";
import DragState from "./DragState";
import {
    COMMIT_ACTION_AUTO,
    COMMIT_ACTION_DROP,
    DRAG_DIR_UP,
    DRAG_DIR_LEFT,
    AXIS_VERTICAL,
    AXIS_HORIZONTAL,
    AXIS_BOTH
} from "../constants";

function randomStr(prefix = "") {
    return (
        prefix +
        Math.random()
            .toString(16)
            .slice(2, 8)
    );
}

function normalizeItem(item, props) {
    const idField = props.idField;
    const pidField = props.pidField;

    item[idField] =
        item[idField] === undefined ? randomStr(`item_`) : item[idField];

    item[pidField] = item[pidField] === undefined ? null : item[pidField];

    return item;
}

export default class WebDesignModel extends React.Component {
    static propTypes = {
        value: propTypes.array,
        defaultValue: propTypes.array,
        axis: propTypes.oneOf([AXIS_BOTH, AXIS_HORIZONTAL, AXIS_VERTICAL]),
        commitAction: propTypes.oneOf([COMMIT_ACTION_AUTO, COMMIT_ACTION_DROP]),
        onChange: propTypes.func,
        onDragStart: propTypes.func,
        onDragEnd: propTypes.func,
        onDrop: propTypes.func,
        onDragHoverContainer: propTypes.func,
        onDragHoverItem: propTypes.func
    };

    static getDerivedStateFromProps(props, state) {
        if (props.value) {
            props.value.forEach(item => normalizeItem(item, props));
        }
        return {
            items: "value" in props ? props.value : state.items
        };
    }

    static defaultProps = {
        idField: "id",
        pidField: "pid",
        axis: AXIS_VERTICAL,
        commitAction: COMMIT_ACTION_AUTO,
        onChange: null
    };

    DropContainerContext = React.createContext({
        isRootContainer: true,
        axis: AXIS_VERTICAL
    });

    state = {
        scope: randomStr("scope_"),
        items: this.props.defaultValue || []
    };

    getDragState() {
        return DragState.getState();
    }

    onChange(items) {
        const props = this.props;
        const { onChange } = props;

        if (!("value" in props)) {
            this.setState({
                items
            });
        }

        if (onChange) {
            onChange(items);
        }
    }

    getScope() {
        return this.state.scope;
    }

    fireEvent(eventName, ev) {
        const { onDragStart, onDragEnd, onDrop } = this.props;

        const events = {
            onDragStart,
            onDragEnd,
            onDrop
        };

        const handler = events[eventName];

        if (handler) {
            handler(ev);
        }
    }

    getItems(pid = null) {
        const { pidField } = this.props;
        const items = this.getAllItems();

        return items.filter(item => item && item[pidField] == pid);
    }

    getChildren(id = null, items = this.state.items) {
        const { pidField } = this.props;
        return items.filter(item => item && item[pidField] == id);
    }

    getAllItems() {
        return [...this.state.items];
    }

    //获取组件的所有父级ID
    getPids(id) {
        const { idField, pidField } = this.props;
        const pids = [];
        let node = this.getItem(id);

        if (!node) return pids;

        if (!node[pidField]) return pids;

        let currentFieldId = node[pidField];
        let pNode;
        while ((pNode = this.getItem(currentFieldId))) {
            pids.push(pNode[idField]);
            currentFieldId = pNode[pidField];
            if (!currentFieldId) break;
        }

        return pids;
    }

    updateItem(item) {
        const { idField } = this.props;
        const items = this.getAllItems();
        const id = item[idField];
        const idx = this.getItemIndex(id);

        if (idx !== -1) {
            items[idx] = item;
        }

        this.onChange(items);
    }

    isSameItem(s1, s2) {
        const { idField } = this.props;

        return s1 && s2 && s1[idField] === s2[idField];
    }

    _addItem(item, pid = null) {
        const { pidField } = this.props;
        item = normalizeItem(item, this.props);
        item[pidField] = pid;

        this.state.items.push(item);
    }

    addItem(item, pid = null) {
        const { pidField } = this.props;
        item = normalizeItem(item, this.props);

        const items = this.getAllItems();

        item[pidField] = pid;

        items.push(item);

        this.onChange(items);
    }

    addTmpItem(item, pid) {
        item.__tmp__ = true;
        this.addItem(item, pid);
    }

    removeItem(id) {
        const { idField } = this.props;
        const items = this.getAllItems();
        //移除指定项目及子项目
        const ret = items.filter(item => {
            let shouldRemove = item[idField] === id;

            if (!shouldRemove) {
                const pids = this.getPids(item[idField]);
                shouldRemove = pids.indexOf(id) > -1;
            }

            return !shouldRemove;
        });

        this.onChange(ret);
    }

    getItemIndex(id, items) {
        const { idField } = this.props;
        items = items || this.getAllItems();
        return findIndex(items, item => item[idField] === id);
    }

    getItem(id) {
        const { idField } = this.props;
        const items = this.getAllItems();
        return find(items, item => item && item[idField] === id);
    }

    insertBefore(item, bItem) {
        if (this.isSameItem(item, bItem)) return false;

        const { idField, pidField } = this.props;
        const items = this.getAllItems();
        const id = bItem[idField];
        // const bItem = this.getItem(id);

        //判断是否需要移动
        const _idx = this.getItemIndex(id);
        if (_idx !== 0) {
            const prevItem = items[_idx - 1];
            if (
                prevItem[idField] === item[idField] &&
                prevItem[pidField] === bItem[pidField]
            ) {
                return false;
            }
        }

        //判断当前item是否已经存在, 如果存在则先删除
        const oIdx = this.getItemIndex(item[idField]);
        if (oIdx > -1) {
            items.splice(oIdx, 1);
        }

        item[pidField] = bItem[pidField];

        //插入操作
        const idx = this.getItemIndex(id, items);
        items.splice(idx, 0, item);

        this.onChange(items);

        return true;
    }

    insertAfter(item, prevItem) {
        if (this.isSameItem(item, prevItem)) return false;

        const { idField, pidField } = this.props;
        const items = this.getAllItems();
        const id = prevItem[idField];
        // const prevItem = this.getItem(id);

        //判断是否需要移动
        const _idx = this.getItemIndex(id);
        if (_idx !== items.length - 1) {
            const nextItem = items[_idx + 1];
            if (
                nextItem[idField] === item[idField] &&
                nextItem[pidField] === prevItem[pidField]
            ) {
                return false;
            }
        }

        //判断当前item是否已经存在, 如果存在则先删除
        const oIdx = this.getItemIndex(item[idField]);
        if (oIdx > -1) {
            items.splice(oIdx, 1);
        }

        item[pidField] = prevItem[pidField];

        //插入操作 之前有删除操作, 要重新查找index
        const idx = findIndex(items, item => item[idField] === id);
        items.splice(idx, 1, items[idx], item);

        this.onChange(items);

        return true;
    }

    clearTmpItems() {
        const items = this.getAllItems();
        let hasTmp = false;

        const newItems = items.filter(item => {
            const isTmp = item.__tmp__;
            isTmp && (hasTmp = true);
            return !isTmp;
        });

        hasTmp && this.onChange(newItems);
    }

    updateItemPid(item, pid = null) {
        const { idField, pidField } = this.props;

        if (item[pidField] === pid) return false;

        const id = item[idField];

        /**
         * 局部环路检测
         * 如: {id: A, pid: null}  {id: B, pid: A}
         * 如果updateItemPid(A, B) 结果为:
         * {id: A, pid: B}  {id: B, pid: A}
         *
         */
        const pids = pid == null ? [] : this.getPids(pid);
        if (pids.length) {
            if (pids.indexOf(id) !== -1) {
                return false;
            }
        }

        const items = this.getAllItems();
        const idx = this.getItemIndex(id, items);

        if (idx === -1) return false;

        item[pidField] = pid;
        //将当前項添加至尾部
        items.splice(idx, 1);
        items.push(item);

        this.onChange(items);

        return true;
    }

    commitItem(item) {
        const { idField } = this.props;
        const items = this.getAllItems();
        const id = item[idField];
        const idx = this.getItemIndex(id);

        if (idx !== -1 && item.__tmp__) {
            item.__tmp__ = false;
            delete item.__tmp__;
            items[idx] = item;

            this.onChange(items);
        }
    }

    //提交DragState中的数据
    commitDragStateItem() {
        const dragState = DragState.getState();
        const canDrop = dragState.canDrop;
        const dragItem = dragState.item;
        const hoverPid = dragState.hoverPid;
        const hoverItem = dragState.hoverItem;
        const hoverDirection = dragState.hoverDirection;
        const isDragging = dragState.isDragging;
        const isNew = dragState.isNew;

        if (!isDragging || !canDrop) return;

        DragState.reset();

        const moveItem = () => {
            if (
                hoverDirection === DRAG_DIR_UP ||
                hoverDirection === DRAG_DIR_LEFT
            ) {
                this.insertBefore(dragItem, hoverItem);
            } else {
                this.insertAfter(dragItem, hoverItem);
            }
        };

        if (isNew) {
            if (hoverItem) {
                //新增
                this._addItem(dragItem, undefined, false);
                //移动
                moveItem();
            } else {
                //新增
                this.addItem(dragItem, hoverPid);
            }
        } else {
            if (hoverItem) {
                moveItem();
            } else {
                const childs = this.getItems(hoverPid);
                const isExist = find(childs, item =>
                    this.isSameItem(item, dragItem)
                );

                if (!isExist) {
                    if (childs.length) {
                        this.insertAfter(dragItem, last(childs));
                    } else {
                        this.updateItemPid(dragItem, hoverPid);
                    }
                }
            }
        }
    }

    isTmpItem(item) {
        return !!item.__tmp__;
    }

    getModel() {
        return Object.create(this);
        // return {
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

    render() {
        const { children } = this.props;

        return (
            <ModelContext.Provider value={this.getModel()}>
                {children}
            </ModelContext.Provider>
        );
    }
}
