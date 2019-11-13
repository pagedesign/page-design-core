import React from "react";
import { findDOMNode } from "react-dom";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import { useDrop, useDrag } from "react-dnd";
import {
    EVENT_TYPE_ADD,
    EVENT_TYPE_SORT,
    DRAG_DIR_UP,
    DRAG_DIR_LEFT,
    DRAG_DIR_RIGHT,
    DRAG_DIR_DOWN,
    DRAG_DIR_NONE,
    COMMIT_ACTION_DROP,
    COMMIT_ACTION_AUTO,
    AXIS_VERTICAL,
    AXIS_HORIZONTAL,
    AXIS_BOTH,
} from "./constants";
import ModelContext from "./ModelContext";
import { isNodeInDocument, getHoverDirection } from "./utils";

import DragState from "./DragState";

class DropItem extends React.Component {
    static contextType = ModelContext;

    static defaultProps = {
        accepts: [],
    };

    _lastHoverDirection = DRAG_DIR_NONE;

    getModel() {
        return this.context.model;
    }

    getHoverDirection(
        monitor,
        targetDOM = findDOMNode(this),
        axis = AXIS_VERTICAL
    ) {
        const targetOffset = targetDOM.getBoundingClientRect();

        const dragOffset = monitor.getClientOffset();

        const middleX = ~~(targetOffset.right - targetOffset.width / 2);
        const middleY = ~~(targetOffset.bottom - targetOffset.height / 2);

        let result = false;

        switch (axis) {
            case AXIS_VERTICAL:
                result = dragOffset.y <= middleY ? DRAG_DIR_UP : DRAG_DIR_DOWN;
                break;
            case AXIS_HORIZONTAL:
                result =
                    dragOffset.x <= middleX ? DRAG_DIR_LEFT : DRAG_DIR_RIGHT;
                break;
            case AXIS_BOTH:
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
        let { item, axis, canDrop, hover, drop, accepts } = this.props;
        const targetDOM = findDOMNode(this);
        const model = this.getModel();
        const DropContainerContext = model.DropContainerContext;
        const { axis: pAxis } = React.useContext(DropContainerContext);
        const { commitAction, axis: mAxis } = model.props;

        axis = axis || pAxis || mAxis;

        return {
            accept: [model.getScope(), ...accepts],
            canDrop: (dragResult, monitor) => {
                const dragItem = dragResult.item;

                let ret = model.isTmpItem(item)
                    ? false
                    : !model.isSameItem(item, dragItem);

                if (ret) {
                    ret = !model.contains(dragItem, item);
                }

                if (ret && canDrop) {
                    ret = canDrop({
                        ...dragResult,
                        component: this,
                        monitor,
                        model,
                    });
                }

                return ret;
            },

            hover: (dragResult, monitor) => {
                const canDrop = monitor.canDrop();
                if (hover) {
                    hover({
                        ...dragResult,
                        component: this,
                        monitor,
                        model,
                    });
                }

                const isStrictlyOver = monitor.isOver({ shallow: true });
                if (!isStrictlyOver) return;

                const dragItem = dragResult.item;

                const currentDirection = this.getHoverDirection(
                    monitor,
                    targetDOM,
                    axis
                );
                const lastHoverDirection = this._lastHoverDirection;
                this._lastHoverDirection = currentDirection;

                DragState.setState({
                    canDrop,
                    hoverContainerId: undefined,
                    hoverItem: item,
                    hoverDirection: currentDirection,
                });

                if (canDrop) {
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
                }

                const e = {
                    target: item,
                    targetDOM,
                    monitor,
                    component: this,
                    model,
                    ...dragResult,
                };

                model.fireEvent("onDragHoverItem", e);
                model.fireEvent("onDragHover", e);
            },

            drop: (dragResult, monitor) => {
                const dragState = DragState.getState();
                DragState.reset();
                if (drop) {
                    drop({
                        ...dragResult,
                        component: this,
                        monitor,
                        model,
                    });
                }

                if (!monitor.didDrop()) {
                    if (commitAction === COMMIT_ACTION_AUTO) {
                        model.commitItem(dragResult.item);
                    } else if (commitAction === COMMIT_ACTION_DROP) {
                        model.commitDragStateItem(dragState);
                    }

                    const { isNew } = DragState.getState();
                    // const isTmpItem = model.isTmpItem(dragResult.item);
                    const e = {
                        target: item,
                        targetDOM,
                        type: isNew ? EVENT_TYPE_ADD : EVENT_TYPE_SORT,
                        monitor,
                        component: this,
                        model,
                        ...dragResult,
                    };
                    model.fireEvent("onDropToItem", e);
                    model.fireEvent("onDrop", e);
                }
            },

            collect: monitor => {
                return {
                    monitor,
                    hoverDirection: DRAG_DIR_NONE,
                    isOver: monitor.isOver(),
                    isStrictlyOver: monitor.isOver({ shallow: true }),
                    canDrop: model.isTmpItem(item) ? false : monitor.canDrop(),
                };
            },
        };
    }

    getDragOptions() {
        const { item, canDrag, beginDrag, endDrag } = this.props;
        const model = this.getModel();

        return {
            item: {
                type: model.getScope(),
            },

            canDrag: monitor => {
                if (canDrag) {
                    return canDrag({
                        component: this,
                        monitor,
                        model,
                    });
                }
                return true;
            },

            begin: monitor => {
                const dom = findDOMNode(this);
                const dragDOM = this._connectDragDOM;

                if (beginDrag) {
                    beginDrag({
                        item,
                        dom,
                        component: this,
                        monitor,
                        model,
                    });
                }

                DragState.setState({
                    item,
                    isNew: false,
                    dragDOMIsRemove: false,
                    isDragging: true,
                    dragDOM,
                });

                model.fireEvent("onDragStart", {
                    item,
                    dom,
                    type: EVENT_TYPE_SORT,
                    model,
                    monitor,
                    component: this,
                });

                return {
                    item,
                    dom,
                };
            },

            end: (dragResult, monitor) => {
                const { dragDOMIsRemove, dragDOM } = DragState.getState();
                DragState.reset();
                if (dragDOMIsRemove && dragDOM && dragDOM.parentNode) {
                    dragDOM.parentNode.removeChild(dragDOM);
                }

                if (endDrag) {
                    endDrag({
                        ...dragResult,
                        model,
                        monitor,
                        component: this,
                    });
                }

                model.fireEvent("onDragEnd", {
                    ...dragResult,
                    type: EVENT_TYPE_SORT,
                    model,
                    monitor,
                    component: this,
                });
            },

            collect(monitor) {
                const dragResult = monitor.getItem();

                return {
                    // monitor
                    isDragging:
                        dragResult && model.isSameItem(dragResult.item, item),
                };
            },
        };
    }

    _connectDragDOM = null;

    _connectDropTarget = null;
    _connectDragSource = null;
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
        this._connectDragSource(dom);
    }

    componentWillUnmount() {
        //fix: 当拖动节点在拖动状态被删除时导致react-dnd在drop后需要移动鼠标才及时触发endDrag问题
        const dragDOM = this._connectDragDOM;
        const dragState = DragState.getState();
        if (dragState.isDragging && dragDOM && dragState.dragDOM === dragDOM) {
            DragState.setState({
                dragDOMIsRemove: true,
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
        this._connectDragSource(null);
        this._connectDragPreview(null);
    }

    render() {
        const { children, render, item } = this.props;
        const model = this.getModel();

        const [collectedDropProps, connectDropTarget] = useDrop(
            this.getDropOptions()
        );

        const [
            collectedDragProps,
            connectDragSource,
            connectDragPreview,
        ] = useDrag(this.getDragOptions());

        this._connectDropTarget = connectDropTarget;
        this._connectDragSource = React.useCallback(
            dom => {
                this._connectDragDOM = dom;
                connectDragSource(dom);
            },
            [connectDragSource]
        );
        this._connectDragPreview = connectDragPreview;

        const connectDragAndDrop = React.useCallback(dom => {
            this._connectDropTarget(dom);
            this._connectDragSource(dom);
        }, []);

        const props = {
            ...collectedDropProps,
            ...collectedDragProps,
            item,
            isTmp: model.isTmpItem(item),
            model,
            connectDropTarget,
            connectDragSource,
            connectDragAndDrop,
            connectDragPreview,
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

DropItem.propTypes = {
    item: propTypes.object.isRequired,
    children: propTypes.oneOfType([propTypes.func, propTypes.node]),
    render: propTypes.func,
    axis: propTypes.oneOf([AXIS_BOTH, AXIS_HORIZONTAL, AXIS_VERTICAL]),
    accepts: propTypes.array,
    canDrop: propTypes.func,
    hover: propTypes.func,
    canDrag: propTypes.func,
    beginDrag: propTypes.func,
    endDrag: propTypes.func,
};

export default withHooks(DropItem);
