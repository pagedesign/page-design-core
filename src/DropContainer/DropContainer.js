import React from "react";
import find from "lodash/find";
import last from "lodash/last";
import { findDOMNode } from "react-dom";
import { useDrop } from "react-dnd";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import invariant from "invariant";
import {
    ACTION_ADD,
    ACTION_SORT,
    DRAG_DIR_NONE,
    DRAG_DIR_UP,
    DRAG_DIR_LEFT,
    COMMIT_ACTION_ON_DROP,
    COMMIT_ACTION_ON_HOVER
} from "../constants";
import ModelContext from "../ModelContext";
import DragState from "../Model/DragState";

class DropContainer extends React.Component {
    static contextType = ModelContext;

    static propTypes = {
        children: propTypes.oneOfType([propTypes.func, propTypes.node]),
        render: propTypes.func,
        pid: propTypes.any,
        collect: propTypes.func,
        canDrop: propTypes.func,
        hover: propTypes.func,
        drop: propTypes.func
    };

    static defaultProps = {
        pid: null
    };

    _connectDropTarget = null;

    connectDropTarget() {
        const children = this.props.children;

        if (!children || typeof children === "function") return;

        const dom = findDOMNode(this);

        this._connectDropTarget(dom);
    }

    componentDidMount() {
        //TODO: 后续提示_connectDropTarget是否被未被调用 DropItem WidgetItem 同样提示
        this.connectDropTarget();
    }

    componentDidUpdate() {
        //TODO: 后续提示_connectDropTarget是否被未被调用
        this.connectDropTarget();
    }

    componentWillUnmount() {
        this._connectDropTarget(null);
    }

    getDropOptions() {
        const { pid = null, canDrop, hover, drop, collect } = this.props;
        const targetDOM = findDOMNode(this);

        const designer = this.context;

        const DropContainerContext = designer.DropContainerContext;
        const { isRootContainer } = React.useContext(DropContainerContext);
        const commitAction = designer.props.commitAction;

        return {
            accept: designer.getScope(),

            canDrop(dragResult, monitor) {
                if (canDrop) {
                    return canDrop(dragResult, monitor);
                }

                return true;
            },

            hover: (dragResult, monitor) => {
                if (hover) {
                    hover(dragResult, monitor);
                }

                designer.fireEvent("onDragHoverContainer", {
                    target: pid,
                    targetDOM,
                    monitor,
                    ...dragResult
                });

                const isOver = monitor.isOver({ shallow: true });
                if (!isOver) return;

                if (!monitor.canDrop()) {
                    return;
                }

                DragState.setState({
                    hoverPid: pid,
                    hoverItem: undefined,
                    hoverDirection: DRAG_DIR_NONE
                });

                if (commitAction === COMMIT_ACTION_ON_HOVER) {
                    designer.updateItemPid(dragResult.item, pid);
                } else if (commitAction === COMMIT_ACTION_ON_DROP) {
                    //TODO: update dratState
                }
            },

            drop: (dragResult, monitor) => {
                if (drop) {
                    drop(dragResult, monitor);
                }

                //根节点统一commit
                if (isRootContainer) {
                    const isTmpItem = designer.isTmpItem(dragResult.item);

                    designer.fireEvent("onDrop", {
                        target: pid,
                        targetDOM,
                        action: isTmpItem ? ACTION_ADD : ACTION_SORT,
                        ...dragResult
                    });

                    if (commitAction === COMMIT_ACTION_ON_HOVER) {
                        designer.commitItem(dragResult.item);
                    } else if (commitAction === COMMIT_ACTION_ON_DROP) {
                        const dragState = DragState.getState();
                        const dragItem = dragState.item;
                        const hoverPid = dragState.hoverPid;
                        const hoverItem = dragState.hoverItem;
                        const hoverDirection = dragState.hoverDirection;

                        if (dragState.isNew) {
                            if (hoverItem) {
                                //新增并移动
                                designer._addItem(dragItem, undefined, false);

                                if (
                                    hoverDirection === DRAG_DIR_UP ||
                                    hoverDirection === DRAG_DIR_LEFT
                                ) {
                                    designer.insertBefore(dragItem, hoverItem);
                                } else {
                                    designer.insertAfter(dragItem, hoverItem);
                                }
                            } else {
                                //新增
                                designer.addItem(dragItem, hoverPid);
                            }
                        } else {
                            if (hoverItem) {
                                if (
                                    hoverDirection === DRAG_DIR_UP ||
                                    hoverDirection === DRAG_DIR_LEFT
                                ) {
                                    designer.insertBefore(dragItem, hoverItem);
                                } else {
                                    designer.insertAfter(dragItem, hoverItem);
                                }
                            } else {
                                const childs = designer.getItems(hoverPid);
                                const isExist = find(childs, item =>
                                    designer.isSameItem(item, dragItem)
                                );
                                if (!isExist) {
                                    if (childs.length) {
                                        designer.insertAfter(
                                            dragItem,
                                            last(childs)
                                        );
                                    } else {
                                        designer.updateItemPid(
                                            dragItem,
                                            hoverPid
                                        );
                                    }
                                }
                            }
                        }
                    }
                }
            },

            collect: monitor => {
                const ext = collect ? collect(monitor) : {};

                return {
                    monitor,
                    canDrop: monitor.canDrop(),
                    isOver: monitor.isOver(),
                    isStrictlyOver: monitor.isOver({ shallow: true }),
                    ...ext
                };
            }
        };
    }

    render() {
        const { pid = null, children, render } = this.props;

        const designer = this.context;

        const DropContainerContext = designer.DropContainerContext;
        const { isRootContainer } = React.useContext(DropContainerContext);

        invariant(
            isRootContainer ? true : pid != null,
            "sub DropContainer props.pid miss."
        );

        const [collectedProps, connectDropTarget] = useDrop(
            this.getDropOptions()
        );

        let items = designer.getItems(pid);
        if (!collectedProps.isOver) {
            items = items.filter(item => !designer.isTmpItem(item));
        }

        this._connectDropTarget = connectDropTarget;

        const props = {
            ...collectedProps,
            model: designer,
            connectDropTarget,
            items
        };

        const child = children
            ? typeof children === "function"
                ? children(props)
                : children
            : render
            ? render(props)
            : null;

        return (
            <DropContainerContext.Provider
                value={{
                    isRootContainer: false
                }}
            >
                {child}
            </DropContainerContext.Provider>
        );
    }
}

export default withHooks(DropContainer);
