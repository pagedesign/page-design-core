import React from "react";
import { findDOMNode } from "react-dom";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import { useDrop, useDrag } from "react-dnd";
import { ACTION_ADD, ACTION_SORT } from "../constants";
import ModelContext from "../ModelContext";
import { isBeforeRect } from "../utils";

class DropItem extends React.Component {
    static propTypes = {
        children: propTypes.oneOfType([propTypes.func, propTypes.node]),
        render: propTypes.func,
        item: propTypes.object.isRequired,
        align: propTypes.oneOf(["all", "vertical", "horizontal"]),
        canDrag: propTypes.func,
        beginDrag: propTypes.func,
        endDrag: propTypes.func
    };

    getDropOptions() {
        const self = this;
        let { item, align } = this.props;
        const designer = React.useContext(ModelContext);
        // const DropContainerContext = designer.DropContainerContext;
        // const { canDrop } = React.useContext(DropContainerContext);

        align = align || designer.props.align;

        return {
            accept: designer.getScope(),
            canDrop({ item: dragItem }, monitor) {
                return designer.isTmpItem(item)
                    ? false
                    : !designer.isSameItem(item, dragItem);
            },

            hover({ item: dragItem }, monitor) {
                designer.fireEvent("onDragHoverItem", {
                    target: item,
                    monitor,
                    item: dragItem
                });

                const isOver = monitor.isOver({ shallow: true });
                if (!isOver) return;

                // const canDropRet = canDrop ? canDrop(dragItem, monitor) : true;
                //|| !canDropRet
                if (!monitor.canDrop()) {
                    return;
                }

                const dragOffset = monitor.getClientOffset();
                const targetDOM = findDOMNode(self);

                //顺序调整
                const targetOffset = targetDOM.getBoundingClientRect();

                const middleX = ~~(targetOffset.right - targetOffset.width / 2);

                const middleY = ~~(
                    targetOffset.bottom -
                    targetOffset.height / 2
                );

                let shouldInsertBefore = false;

                switch (align) {
                    case "vertical":
                        shouldInsertBefore = dragOffset.y <= middleY;
                        break;
                    case "horizontal":
                        shouldInsertBefore = dragOffset.x <= middleX;
                        break;
                    case "all":
                        shouldInsertBefore = isBeforeRect(
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
                        shouldInsertBefore = dragOffset.y <= middleY;
                }

                if (shouldInsertBefore) {
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
        const self = this;
        const { item, canDrag, beginDrag, endDrag } = this.props;
        const designer = React.useContext(ModelContext);

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

            begin(monitor) {
                const dom = findDOMNode(self);

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

                designer.setItemDragging(item);

                return {
                    item,
                    dom
                };
            },

            end(dragResult, monitor) {
                if (endDrag) {
                    endDrag(dragResult, monitor);
                }

                designer.fireEvent("onDragEnd", {
                    ...dragResult,
                    action: ACTION_SORT
                });

                //clearDraggingState
                designer.clearTmpItems();
            }

            // collect(monitor) {
            //     return {
            //         // monitor,
            //         // isDragging: monitor.isDragging()
            //     };
            // }
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
        const designer = React.useContext(ModelContext);

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
            isDragging: designer.isDragging(item),
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
