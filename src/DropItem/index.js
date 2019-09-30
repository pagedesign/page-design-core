import React from "react";
import { findDOMNode } from "react-dom";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import { useDrop, useDrag } from "react-dnd";
import {
    ACTION_ADD,
    ACTION_SORT,
    DRAG_DIR_UP,
    DRAG_DIR_LEFT,
    DRAG_DIR_RIGHT,
    DRAG_DIR_DOWN,
    DRAG_DIR_NONE,
    COMMIT_ACTION_DROP,
    COMMIT_ACTION_AUTO
} from "../constants";
import ModelContext from "../ModelContext";
import { isNodeInDocument, getHoverDirection } from "../utils";

import DragState from "../Model/DragState";

class DropItem extends React.Component {
    static contextType = ModelContext;

    static propTypes = {
        children: propTypes.oneOfType([propTypes.func, propTypes.node]),
        render: propTypes.func,
        item: propTypes.object.isRequired,
        axis: propTypes.oneOf(["both", "vertical", "horizontal"]),
        canDrop: propTypes.func,
        hover: propTypes.func,
        canDrag: propTypes.func,
        beginDrag: propTypes.func,
        endDrag: propTypes.func
    };

    _lastHoverDirection = DRAG_DIR_NONE;

    getHoverDirection(monitor, targetDOM = findDOMNode(this)) {
        const model = this.context;
        let { axis } = this.props;
        axis = axis || model.props.axis;

        const targetOffset = targetDOM.getBoundingClientRect();

        const dragOffset = monitor.getClientOffset();

        const middleX = ~~(targetOffset.right - targetOffset.width / 2);
        const middleY = ~~(targetOffset.bottom - targetOffset.height / 2);

        let result = false;

        switch (axis) {
            case "vertical":
                result = dragOffset.y <= middleY ? DRAG_DIR_UP : DRAG_DIR_DOWN;
                break;
            case "horizontal":
                result =
                    dragOffset.x <= middleX ? DRAG_DIR_LEFT : DRAG_DIR_RIGHT;
                break;
            case "both":
                result = getHoverDirection(
                    targetOffset.left,
                    targetOffset.top,
                    targetOffset.width,
                    targetOffset.height,
                    dragOffset.x,
                    dragOffset.y
                );
                break;
            default:
                //vertical default
                result = dragOffset.y <= middleY ? DRAG_DIR_UP : DRAG_DIR_DOWN;
        }

        return result;
    }

    getDropOptions() {
        let { item, axis, canDrop, hover } = this.props;
        const targetDOM = findDOMNode(this);
        const model = this.context;

        const commitAction = model.props.commitAction;

        axis = axis || model.props.axis;

        return {
            accept: model.getScope(),
            canDrop(dragResult, monitor) {
                const dragItem = dragResult.item;

                let ret = model.isTmpItem(item)
                    ? false
                    : !model.isSameItem(item, dragItem);

                if (ret && canDrop) {
                    ret = canDrop({
                        ...dragResult,
                        monitor,
                        model
                    });
                }

                return ret;
            },

            hover: (dragResult, monitor) => {
                const canDrop = monitor.canDrop();
                if (hover) {
                    hover({
                        ...dragResult,
                        monitor,
                        model
                    });
                }

                const dragItem = dragResult.item;

                model.fireEvent("onDragHoverItem", {
                    target: item,
                    targetDOM,
                    monitor,
                    ...dragResult
                });

                const isStrictlyOver = monitor.isOver({ shallow: true });
                if (!isStrictlyOver) return;

                const currentDirection = this.getHoverDirection(
                    monitor,
                    targetDOM
                );
                const lastHoverDirection = this._lastHoverDirection;
                this._lastHoverDirection = currentDirection;

                DragState.setState({
                    canDrop,
                    hoverPid: undefined,
                    hoverItem: item,
                    hoverDirection: currentDirection
                });

                if (!canDrop) {
                    return;
                }

                if (currentDirection !== lastHoverDirection) {
                    //TODO: 此处最好再加参数控制。当commitAction=COMMIT_ACTION_AUTO且不需要hoverDirection属性时不建议执行
                    //eg: && needHoverDirection
                    this.forceUpdate();
                }

                if (commitAction === COMMIT_ACTION_AUTO) {
                    if (
                        currentDirection === DRAG_DIR_UP ||
                        currentDirection === DRAG_DIR_LEFT
                    ) {
                        model.insertBefore(dragItem, item);
                    } else {
                        model.insertAfter(dragItem, item);
                    }
                }
            },

            drop: (dragResult, monitor) => {
                if (!monitor.didDrop()) {
                    const isTmpItem = model.isTmpItem(dragResult.item);
                    model.fireEvent("onDrop", {
                        target: item,
                        targetDOM,
                        action: isTmpItem ? ACTION_ADD : ACTION_SORT,
                        ...dragResult
                    });
                    if (commitAction === COMMIT_ACTION_AUTO) {
                        model.commitItem(dragResult.item);
                    } else if (commitAction === COMMIT_ACTION_DROP) {
                        model.commitDragStateItem();
                    }
                }
            },

            collect: monitor => {
                return {
                    monitor,
                    hoverDirection: DRAG_DIR_NONE,
                    isOver: monitor.isOver(),
                    isStrictlyOver: monitor.isOver({ shallow: true }),
                    canDrop: model.isTmpItem(item) ? false : monitor.canDrop()
                };
            }
        };
    }

    getDragOptions() {
        const { item, canDrag, beginDrag, endDrag } = this.props;
        const model = this.context;

        return {
            item: {
                type: model.getScope()
            },

            canDrag(monitor) {
                if (canDrag) {
                    return canDrag({
                        monitor,
                        model
                    });
                }
                return true;
            },

            begin: monitor => {
                const dom = findDOMNode(this);
                const dragDOM = this._connectDragDOM;

                if (beginDrag) {
                    beginDrag(
                        {
                            item,
                            dom
                        },
                        monitor
                    );
                }

                DragState.setState({
                    item,
                    isNew: false,
                    dragDOMIsRemove: false,
                    isDragging: true,
                    dragDOM
                });

                model.fireEvent("onDragStart", {
                    item,
                    dom,
                    action: ACTION_SORT
                });

                return {
                    item,
                    dom
                };
            },

            end(dragResult, monitor) {
                const { dragDOMIsRemove, dragDOM } = DragState.getState();
                DragState.reset();
                if (dragDOMIsRemove && dragDOM && dragDOM.parentNode) {
                    dragDOM.parentNode.removeChild(dragDOM);
                }

                if (endDrag) {
                    endDrag(dragResult, monitor);
                }

                model.fireEvent("onDragEnd", {
                    ...dragResult,
                    action: ACTION_SORT
                });
            },

            collect(monitor) {
                const dragResult = monitor.getItem();

                return {
                    // monitor
                    isDragging:
                        dragResult && model.isSameItem(dragResult.item, item)
                };
            }
        };
    }

    _connectDragDOM = null;

    _connectDropTarget = null;
    _connectDragTarget = null;
    _connectDragPreview = null;

    componentDidUpdate() {
        this.connectDragAndDrop();
    }

    componentDidMount() {
        this.connectDragAndDrop();
    }

    connectDragAndDrop() {
        const children = this.props.children;

        if (!children || typeof children === "function") return;

        const dom = findDOMNode(this);

        this._connectDropTarget(dom);
        this._connectDragTarget(dom);
    }

    componentWillUnmount() {
        //fix: 当拖动节点在拖动状态被删除时导致react-dnd在drop后需要移动鼠标才及时触发endDrag问题
        const dragDOM = this._connectDragDOM;
        const dragState = DragState.getState();
        if (dragState.isDragging && dragDOM && dragState.dragDOM === dragDOM) {
            DragState.setState({
                dragDOMIsRemove: true
            });

            setTimeout(() => {
                if (isNodeInDocument(dragDOM)) return;

                dragDOM.style.display = "none";
                dragDOM.style.width = "0px";
                dragDOM.style.height = "0px";
                dragDOM.style.overflow = "hidden";

                document.body.appendChild(dragDOM);
            }, 0);
        }

        this._connectDropTarget(null);
        this._connectDragTarget(null);
        this._connectDragPreview(null);
    }

    render() {
        const { children, render, item } = this.props;
        const model = this.context;

        const [collectedDropProps, connectDropTarget] = useDrop(
            this.getDropOptions()
        );

        const [
            collectedDragProps,
            connectDragTarget,
            connectDragPreview
        ] = useDrag(this.getDragOptions());

        this._connectDropTarget = connectDropTarget;
        this._connectDragTarget = React.useCallback(
            dom => {
                this._connectDragDOM = dom;
                connectDragTarget(dom);
            },
            [connectDragTarget]
        );
        this._connectDragPreview = connectDragPreview;

        const connectDragAndDrop = dom => {
            this._connectDropTarget(dom);
            this._connectDragTarget(dom);
        };

        const props = {
            ...collectedDropProps,
            ...collectedDragProps,
            item,
            isTmp: model.isTmpItem(item),
            model,
            connectDropTarget,
            connectDragTarget,
            connectDragAndDrop,
            connectDragPreview
        };

        const { isStrictlyOver, isDragging, canDrop } = props;

        props.hoverDirection =
            isStrictlyOver && !isDragging && canDrop
                ? this._lastHoverDirection
                : DRAG_DIR_NONE;

        return children
            ? typeof children === "function"
                ? children(props)
                : children
            : render
            ? render(props)
            : null;
    }
}

export default withHooks(DropItem);
