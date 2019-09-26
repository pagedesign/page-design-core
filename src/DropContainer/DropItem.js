import React from "react";
import { findDOMNode } from "react-dom";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import { useDrop, useDrag } from "react-dnd";
import { ACTION_ADD, ACTION_SORT } from "../constants";
import ModelContext from "../ModelContext";
import { isBeforeRect } from "../utils";

class DropItem extends React.Component {
    static contextType = ModelContext;

    static propTypes = {
        children: propTypes.oneOfType([propTypes.func, propTypes.node]),
        render: propTypes.func,
        item: propTypes.object.isRequired,
        axis: propTypes.oneOf(["both", "vertical", "horizontal"]),
        canDrop: propTypes.func,
        canDrag: propTypes.func,
        beginDrag: propTypes.func,
        endDrag: propTypes.func
    };

    shouldInsertBefore(monitor, targetDOM = findDOMNode(this)) {
        const designer = this.context;
        let { axis } = this.props;
        axis = axis || designer.props.axis;

        const targetOffset = targetDOM.getBoundingClientRect();

        const dragOffset = monitor.getClientOffset();

        const middleX = ~~(targetOffset.right - targetOffset.width / 2);
        const middleY = ~~(targetOffset.bottom - targetOffset.height / 2);

        let result = false;

        switch (axis) {
            case "vertical":
                result = dragOffset.y <= middleY;
                break;
            case "horizontal":
                result = dragOffset.x <= middleX;
                break;
            case "both":
                result = isBeforeRect(
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
                result = dragOffset.y <= middleY;
        }

        return result;
    }

    getDropOptions() {
        let { item, axis, canDrop } = this.props;
        const targetDOM = findDOMNode(this);
        const designer = this.context;
        // const designer = React.useContext(ModelContext);
        // const DropContainerContext = designer.DropContainerContext;
        // const { canDrop } = React.useContext(DropContainerContext);

        axis = axis || designer.props.axis;

        return {
            accept: designer.getScope(),
            canDrop(dragResult, monitor) {
                const dragItem = dragResult.item;

                let ret = designer.isTmpItem(item)
                    ? false
                    : !designer.isSameItem(item, dragItem);

                if (ret && canDrop) {
                    ret = canDrop(dragResult, monitor);
                }

                return ret;
            },

            hover: (dragResult, monitor) => {
                const dragItem = dragResult.item;

                designer.fireEvent("onDragHoverItem", {
                    target: item,
                    targetDOM,
                    monitor,
                    ...dragResult
                });

                const isOver = monitor.isOver({ shallow: true });
                if (!isOver) return;

                // const canDropRet = canDrop ? canDrop(dragItem, monitor) : true;
                //|| !canDropRet
                if (!monitor.canDrop()) {
                    return;
                }

                if (this.shouldInsertBefore(monitor, targetDOM)) {
                    designer.insertBefore(dragItem, item);
                } else {
                    designer.insertAfter(dragItem, item);
                }
            },

            collect(monitor) {
                return {
                    monitor,
                    isOver: monitor.isOver(),
                    isStrictlyOver: monitor.isOver({ shallow: true }),
                    canDrop: designer.isTmpItem(item)
                        ? false
                        : monitor.canDrop()
                };
            }
        };
    }

    getDragOptions() {
        const { item, canDrag, beginDrag, endDrag } = this.props;
        const designer = this.context;
        // const designer = React.useContext(ModelContext);

        return {
            item: {
                type: designer.getScope()
            },

            canDrag(monitor) {
                if (canDrag) {
                    return canDrag(monitor);
                }
                return true;
            },

            begin: monitor => {
                const dom = findDOMNode(this);

                if (beginDrag) {
                    beginDrag(
                        {
                            item,
                            dom
                        },
                        monitor
                    );
                }

                designer.fireEvent("onDragStart", {
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
                if (endDrag) {
                    endDrag(dragResult, monitor);
                }

                //TODO: 查找react-dnd出现onDragEnd不及时调用问题

                designer.fireEvent("onDragEnd", {
                    ...dragResult,
                    action: ACTION_SORT
                });
            },

            collect(monitor) {
                const dragResult = monitor.getItem();

                return {
                    // monitor
                    isDragging:
                        dragResult && designer.isSameItem(dragResult.item, item)
                };
            }
        };
    }

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
        this._connectDropTarget(null);
        this._connectDragTarget(null);
        this._connectDragPreview(null);
    }

    render() {
        const { children, render, item } = this.props;
        const designer = this.context;
        // const designer = React.useContext(ModelContext);

        const [collectedDropProps, connectDropTarget] = useDrop(
            this.getDropOptions()
        );

        const [
            collectedDragProps,
            connectDragTarget,
            connectDragPreview
        ] = useDrag(this.getDragOptions());

        const connectDragAndDrop = dom => {
            connectDropTarget(dom);
            connectDragTarget(dom);
        };

        this._connectDropTarget = connectDropTarget;
        this._connectDragTarget = connectDragTarget;
        this._connectDragPreview = connectDragPreview;

        const props = {
            ...collectedDropProps,
            ...collectedDragProps,
            item,
            isTmp: designer.isTmpItem(item),
            connectDropTarget,
            connectDragTarget,
            connectDragAndDrop,
            connectDragPreview
        };

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
