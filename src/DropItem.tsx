import React from "react";
import { findDOMNode } from "react-dom";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import {
    useDrop,
    useDrag,
    DragSourceMonitor,
    DropTargetMonitor,
} from "react-dnd";
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
import { ModelContext, ModelContextValue } from "./ModelContext";
import { isNodeInDocument, getHoverDirection, isFunction } from "./utils";
import DragState from "./DragState";
import {
    Item,
    DirType,
    DragObject,
    CanDropOptions,
    DragHoverOptions,
    DropOptions,
    CanDragOptions,
    BeginDragOptions,
    EndDragOptions,
    DropItemRenderProps,
    HoverDirection,
} from "./types";

// DropItem.propTypes = {
//     item: propTypes.object.isRequired,
//     children: propTypes.oneOfType([propTypes.func, propTypes.node]),
//     render: propTypes.func,
//     axis: propTypes.oneOf([AXIS_BOTH, AXIS_HORIZONTAL, AXIS_VERTICAL]),
//     accepts: propTypes.array,
//     canDrop: propTypes.func,
//     hover: propTypes.func,
//     canDrag: propTypes.func,
//     beginDrag: propTypes.func,
//     endDrag: propTypes.func,
// };

interface DropItemProps {
    item: Item;
    accepts?: string[];
    children?:
        | ((props: DropItemRenderProps) => React.ReactNode)
        | React.ReactNode;
    render?: (props: DropItemRenderProps) => React.ReactNode;
    axis?: typeof AXIS_BOTH | typeof AXIS_HORIZONTAL | typeof AXIS_VERTICAL;
    canDrop?: <T = DropItem>(data: CanDropOptions<T>) => boolean;
    hover?: <T = DropItem>(data: DragHoverOptions<T>) => void;
    drop?: <T = DropItem, D = DropTargetMonitor>(
        data: DropOptions<T, D>
    ) => void;
    canDrag?: <T = DropItem>(data: CanDragOptions<T>) => boolean;
    beginDrag?: <T = DropItem>(data: BeginDragOptions<T>) => void;
    endDrag?: <T = DropItem>(data: EndDragOptions<T>) => void;
}

class DropItem extends React.Component<DropItemProps> {
    static contextType = ModelContext;

    static defaultProps = {
        accepts: [],
    };

    readonly props: Readonly<
        DropItemProps & {
            accepts: string[];
        }
    >;

    context: ModelContextValue;

    _lastHoverDirection: HoverDirection = DRAG_DIR_NONE;

    _connectDragDOM: null | HTMLElement = null;

    _connectDropTarget: (dom: null | HTMLElement) => void;
    _connectDragSource: (dom: null | HTMLElement) => void;
    _connectDragPreview: (dom: null | HTMLElement) => void;

    getModel() {
        return this.context.model;
    }

    getHoverDirection(
        monitor,
        targetDOM: HTMLElement = findDOMNode(this),
        axis = AXIS_VERTICAL
    ): DirType {
        const targetOffset = targetDOM.getBoundingClientRect();

        const dragOffset = monitor.getClientOffset();

        const middleX = ~~(targetOffset.right - targetOffset.width / 2);
        const middleY = ~~(targetOffset.bottom - targetOffset.height / 2);

        switch (axis) {
            case AXIS_VERTICAL:
                return dragOffset.y <= middleY ? DRAG_DIR_UP : DRAG_DIR_DOWN;
            case AXIS_HORIZONTAL:
                return dragOffset.x <= middleX ? DRAG_DIR_LEFT : DRAG_DIR_RIGHT;

            case AXIS_BOTH:
                return getHoverDirection(
                    targetOffset.left,
                    targetOffset.top,
                    targetOffset.width,
                    targetOffset.height,
                    dragOffset.x,
                    dragOffset.y
                );
            default:
                //vertical default
                return dragOffset.y <= middleY ? DRAG_DIR_UP : DRAG_DIR_DOWN;
        }
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
            canDrop: (dragResult, monitor: DropTargetMonitor) => {
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

            hover: (dragResult, monitor: DropTargetMonitor) => {
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

            drop: (
                dragResult: Required<DragObject>,
                monitor: DropTargetMonitor
            ) => {
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

            collect: (monitor: DropTargetMonitor) => {
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

            canDrag: (monitor: DragSourceMonitor) => {
                if (canDrag) {
                    return canDrag({
                        component: this,
                        monitor,
                        model,
                    });
                }
                return true;
            },

            begin: (monitor: DragSourceMonitor) => {
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
                    type: model.getScope(),
                    item,
                    dom,
                };
            },

            end: (
                dragResult: Required<DragObject>,
                monitor: DragSourceMonitor
            ) => {
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

            collect(monitor: DragSourceMonitor) {
                const dragResult = monitor.getItem();

                return {
                    // monitor
                    isDragging:
                        dragResult && model.isSameItem(dragResult.item, item),
                };
            },
        };
    }

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

        const props: DropItemRenderProps = {
            ...collectedDropProps,
            ...collectedDragProps,
            item,
            isTmp: model.isTmpItem(item),
            model,
            connectDropTarget,
            connectDragSource,
            connectDragAndDrop,
            connectDragPreview,
        } as DropItemRenderProps;

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
