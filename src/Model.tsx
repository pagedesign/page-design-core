import React from "react";
import { last, find, findIndex, isFunction } from "./utils";
import { DropZone } from "./DropZone";
import {
    ModelContext,
    ModelContextValue,
    DropContainerContextValue,
} from "./ModelContext";
import DragState from "./DragState";
import {
    COMMIT_ACTION_AUTO,
    COMMIT_ACTION_DROP,
    DRAG_DIR_UP,
    DRAG_DIR_LEFT,
    AXIS_VERTICAL,
    AXIS_HORIZONTAL,
    AXIS_BOTH,
} from "./constants";
import { IdType, Item } from "./types";

type ItemId = IdType;

export interface ModelProps {
    rootId: ItemId;
    axis: typeof AXIS_BOTH | typeof AXIS_HORIZONTAL | typeof AXIS_VERTICAL;
    commitAction: typeof COMMIT_ACTION_AUTO | typeof COMMIT_ACTION_DROP;
    value?: Item[];
    defaultValue?: Item[];
    children?: ((instance: Model) => React.ReactNode) | React.ReactNode;
    onChange?(items: Item[]): void;
    onDragStart?(): void;
    onDragEnd?(): void;
    onDrop?(): void;
    onDropToItem?(): void;
    onDropToContainer?(): void;
    onDragHover?(): void;
    onDragHoverContainer?(): void;
    onDragHoverItem?(): void;
}

interface ModelState {
    scope: string;
    items: Item[];
}

function randomStr(prefix = "") {
    return (
        prefix +
        Math.random()
            .toString(16)
            .slice(2, 8)
    );
}

function normalizeItem(item: Item, props: ModelProps) {
    item.id = item.id === undefined ? randomStr(`item_`) : item.id;
    item.pid = item.pid === undefined ? props.rootId : item.pid;
    return item;
}

export class Model extends React.Component<Partial<ModelProps>, ModelState> {
    static getDerivedStateFromProps(props: ModelProps, state: ModelState) {
        return {
            items:
                "value" in props
                    ? (props.value as Item[]).map(item =>
                          normalizeItem(item, props)
                      )
                    : state.items,
        };
    }

    static defaultProps: ModelProps = {
        rootId: null,
        axis: AXIS_VERTICAL,
        commitAction: COMMIT_ACTION_AUTO,
    };

    readonly props: Readonly<ModelProps>;

    DropContainerContext = React.createContext<DropContainerContextValue>({
        isRootContainer: true,
        axis: AXIS_VERTICAL,
    });

    state: ModelState = {
        scope: randomStr("scope_"),
        items: [],
    };

    getDragState() {
        return DragState.getState();
    }

    onChange(items: Item[]) {
        const props = this.props;
        const { onChange } = props;

        if (!("value" in props)) {
            this.setState({
                items,
            });
        }

        if (onChange) {
            onChange(items);
        }
    }

    getScope() {
        return this.state.scope;
    }

    fireEvent(eventName: string, ev) {
        const props = this.props;

        const handler = props[eventName];

        if (handler) {
            handler(ev);
        }
    }

    contains(parentNode, childNode) {
        if (!childNode) return false;

        const parentId = parentNode.id;
        const childId = childNode.id;

        const pids = this.getPids(childId);

        pids.push(childId);

        return pids.indexOf(parentId) !== -1;
    }

    getChildren(id: IdType = null, items = this.state.items) {
        return items.filter(item => item && item.pid === id);
    }

    getAllItems() {
        return [...this.state.items];
    }

    isRootId(id: null | string) {
        const { rootId } = this.props;
        let isRootId = id == null || rootId === id;

        //id存在但无法找到节点
        if (!isRootId) {
            isRootId = !this.getItem(id);
        }

        return isRootId;
    }

    //获取组件的所有父级ID
    getPids(id: ItemId) {
        const pids: ItemId[] = [];
        let node = this.getItem(id);
        while (node) {
            const pid = node.pid;

            if (this.isRootId(pid)) break;

            pids.push(pid);
            node = this.getItem(pid);
        }

        return pids;
    }

    updateItem(item: Item) {
        const items = this.getAllItems();
        const id = item.id;
        const idx = this.getItemIndex(id);

        if (idx !== -1) {
            items[idx] = item;
        }

        this.onChange(items);
    }

    isSameItem(s1: Item, s2: Item) {
        return s1 && s2 && s1.id === s2.id;
    }

    _addItem(item: Item, pid: null | string = null) {
        item = normalizeItem(item, this.props);
        item.pid = pid;

        this.state.items.push(item);
    }

    addItem(item: Item, pid = null) {
        item = normalizeItem(item, this.props);

        const items = this.getAllItems();

        item.pid = pid;

        items.push(item);

        this.onChange(items);
    }

    addItems(items: Item[] = [], pid: ItemId = null) {
        items = items.map(item => normalizeItem(item, this.props));

        items.forEach(item => (item.pid = pid));

        this.onChange([...this.getAllItems(), ...items]);
    }

    addTmpItem(item, pid?) {
        item.__tmp__ = true;
        this.addItem(item, pid);
    }

    removeItem(id) {
        const items = this.getAllItems();
        //移除指定项目及子项目
        const ret = items.filter(item => {
            let shouldRemove = item.id === id;

            if (!shouldRemove) {
                const pids = this.getPids(item.id);
                shouldRemove = pids.indexOf(id) > -1;
            }

            return !shouldRemove;
        });

        this.onChange(ret);
    }

    getItemIndex(id, items = this.state.items) {
        //this.getAllItems()
        // items = items || this.getAllItems();
        return findIndex(items, item => item.id === id);
    }

    getItem(id, items = this.state.items) {
        return find(items, item => item && item.id === id);
    }

    insertBefore(item, bItem) {
        if (this.isSameItem(item, bItem)) return false;

        const items = this.getAllItems();
        const id = bItem.id;

        //判断是否需要移动
        const _idx = this.getItemIndex(id);
        if (_idx !== 0) {
            const prevItem = items[_idx - 1];
            if (prevItem.id === item.id && prevItem.pid === bItem.pid) {
                return false;
            }
        }

        //判断当前item是否已经存在, 如果存在则先删除
        const oIdx = this.getItemIndex(item.id);
        if (oIdx > -1) {
            items.splice(oIdx, 1);
        }

        item.pid = bItem.pid;

        //插入操作
        const idx = findIndex(items, item => item.id === id); //this.getItemIndex(id, items);
        items.splice(idx, 0, item);

        this.onChange(items);

        return true;
    }

    insertAfter(item, prevItem) {
        if (this.isSameItem(item, prevItem)) return false;

        const items = this.getAllItems();
        const id = prevItem.id;

        //判断是否需要移动
        const _idx = this.getItemIndex(id);
        if (_idx !== items.length - 1) {
            const nextItem = items[_idx + 1];
            if (nextItem.id === item.id && nextItem.pid === prevItem.pid) {
                return false;
            }
        }

        //判断当前item是否已经存在, 如果存在则先删除
        const oIdx = this.getItemIndex(item.id);
        if (oIdx > -1) {
            items.splice(oIdx, 1);
        }

        item.pid = prevItem.pid;

        //插入操作 之前有删除操作, 要重新查找index
        const idx = findIndex(items, item => item.id === id);
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

    updateItemPid(item: Item, pid: IdType = null) {
        if (item.pid === pid) return false;

        const id = item.id;

        //自身引用
        if (id === pid) return false;

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

        item.pid = pid;
        //将当前項添加至尾部
        items.splice(idx, 1);
        items.push(item);

        this.onChange(items);

        return true;
    }

    commitItem(item) {
        const items = this.getAllItems();
        const id = item.id;
        const idx = this.getItemIndex(id);

        if (idx !== -1 && item.__tmp__) {
            item.__tmp__ = false;
            delete item.__tmp__;
            items[idx] = item;

            this.onChange(items);
        }
    }

    //提交DragState中的数据
    commitDragStateItem(dragState) {
        const canDrop = dragState.canDrop;
        const dragItem = dragState.item;
        const hoverContainerId = dragState.hoverContainerId;
        const hoverItem = dragState.hoverItem;
        const hoverDirection = dragState.hoverDirection;
        const isDragging = dragState.isDragging;
        const isNew = dragState.isNew;

        if (!isDragging || !canDrop) return;

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
                this._addItem(dragItem, null);
                //移动
                moveItem();
            } else {
                //新增
                this.addItem(dragItem, hoverContainerId);
            }
        } else {
            if (hoverItem) {
                moveItem();
            } else {
                const childs = this.getChildren(hoverContainerId);
                const isExist = find(childs, item =>
                    this.isSameItem(item, dragItem)
                );

                if (!isExist) {
                    if (childs.length) {
                        this.insertAfter(dragItem, last(childs));
                    } else {
                        this.updateItemPid(dragItem, hoverContainerId);
                    }
                }
            }
        }
    }

    isDragging(id) {
        const dragState = DragState.getState();
        const isDragging = dragState.isDragging;

        if (!isDragging) return false;

        if (id !== undefined) {
            return dragState.item && dragState.item.id === id;
        }

        return true;
    }

    getDraggingItem() {
        const dragState = DragState.getState();

        return dragState.item;
    }

    isTmpItem(item: Item) {
        return !!item.__tmp__;
    }

    getModel(this: Model): ModelContextValue {
        return {
            model: this,
        };
    }

    render() {
        const { children } = this.props;

        return (
            <ModelContext.Provider value={this.getModel()}>
                <DropZone>
                    {isFunction(children) ? children(this) : children}
                </DropZone>
            </ModelContext.Provider>
        );
    }
}
