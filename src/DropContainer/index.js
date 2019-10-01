import React from "react";
import { findDOMNode } from "react-dom";
import { useDrop } from "react-dnd";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import invariant from "invariant";
import {
    EVENT_TYPE_ADD,
    EVENT_TYPE_SORT,
    DRAG_DIR_NONE,
    DRAG_DIR_UP,
    DRAG_DIR_LEFT,
    COMMIT_ACTION_DROP,
    COMMIT_ACTION_AUTO,
    AXIS_VERTICAL,
    AXIS_HORIZONTAL,
    AXIS_BOTH
} from "../constants";
import ModelContext from "../ModelContext";
import DragState from "../Model/DragState";

class DropContainer extends React.Component {
    static contextType = ModelContext;

    static propTypes = {
        children: propTypes.oneOfType([propTypes.func, propTypes.node]),
        axis: propTypes.oneOf([AXIS_BOTH, AXIS_HORIZONTAL, AXIS_VERTICAL]),
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
        const { pid = null, hover, canDrop, drop, collect } = this.props;
        const targetDOM = findDOMNode(this);

        const model = this.context;

        // const DropContainerContext = model.DropContainerContext;
        // const { isRootContainer } = React.useContext(DropContainerContext);
        const commitAction = model.props.commitAction;

        return {
            accept: model.getScope(),

            canDrop: (dragResult, monitor) => {
                if (canDrop) {
                    return canDrop({
                        ...dragResult,
                        component: this,
                        monitor,
                        model
                    });
                }

                return true;
            },

            hover: (dragResult, monitor) => {
                const canDrop = monitor.canDrop();
                if (hover) {
                    hover({
                        ...dragResult,
                        component: this,
                        monitor,
                        model
                    });
                }

                const isStrictlyOver = monitor.isOver({ shallow: true });
                if (!isStrictlyOver) return;

                DragState.setState({
                    canDrop: monitor.canDrop(),
                    hoverPid: pid,
                    hoverItem: undefined,
                    hoverDirection: DRAG_DIR_NONE
                });

                if (canDrop) {
                    if (commitAction === COMMIT_ACTION_AUTO) {
                        model.updateItemPid(dragResult.item, pid);
                    }
                }

                model.fireEvent("onDragHoverContainer", {
                    target: pid,
                    targetDOM,
                    monitor,
                    component: this,
                    model,
                    ...dragResult
                });
            },

            drop: (dragResult, monitor) => {
                if (drop) {
                    drop({
                        ...dragResult,
                        component: this,
                        monitor,
                        model
                    });
                }

                // //在根节点统一commit时会出现问题，当根节点canDrop返回false时导致无法提交
                // if (isRootContainer) {
                //     const isTmpItem = model.isTmpItem(dragResult.item);

                //     model.fireEvent("onDrop", {
                //         target: pid,
                //         targetDOM,
                //         type: isTmpItem ? EVENT_TYPE_ADD : EVENT_TYPE_SORT,
                //         ...dragResult
                //     });

                //     if (commitAction === COMMIT_ACTION_AUTO) {
                //         model.commitItem(dragResult.item);
                //     } else if (commitAction === COMMIT_ACTION_DROP) {
                //         model.commitDragStateItem();
                //     }
                // }

                if (!monitor.didDrop()) {
                    if (commitAction === COMMIT_ACTION_AUTO) {
                        model.commitItem(dragResult.item);
                    } else if (commitAction === COMMIT_ACTION_DROP) {
                        model.commitDragStateItem();
                    }

                    const { isNew } = DragState.getState();
                    // const isTmpItem = model.isTmpItem(dragResult.item);
                    model.fireEvent("onDrop", {
                        target: pid,
                        targetDOM,
                        type: isNew ? EVENT_TYPE_ADD : EVENT_TYPE_SORT,
                        monitor,
                        component: this,
                        model,
                        ...dragResult
                    });
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
        const { pid = null, children, render, axis } = this.props;

        const model = this.context;

        const DropContainerContext = model.DropContainerContext;
        const { isRootContainer } = React.useContext(DropContainerContext);

        invariant(
            isRootContainer ? true : pid != null,
            "sub DropContainer props.pid miss."
        );

        const [collectedProps, connectDropTarget] = useDrop(
            this.getDropOptions()
        );

        let items = model.getItems(pid);
        if (!collectedProps.isStrictlyOver) {
            items = items.filter(item => !model.isTmpItem(item));
        }

        this._connectDropTarget = connectDropTarget;

        const props = {
            ...collectedProps,
            model,
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
                    isRootContainer: false,
                    axis
                }}
            >
                {child}
            </DropContainerContext.Provider>
        );
    }
}

export default withHooks(DropContainer);
