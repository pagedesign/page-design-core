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
    AXIS_BOTH,
} from "./constants";
import { ModelContext, ModelContextValue } from "./ModelContext";
import DragState from "./DragState";
import { isFunction } from "./utils";
import { Model } from "./Model";
import {
    CanDropOptions,
    DragHoverOptions,
    DropOptions,
    DropContainerRenderProps,
} from "./types";

interface DropContainerProps {
    id: null | string;
    children?:
        | ((props: DropContainerRenderProps) => React.ReactNode)
        | React.ReactNode;
    render?: (props: DropContainerRenderProps) => React.ReactNode;
    axis?: typeof AXIS_BOTH | typeof AXIS_HORIZONTAL | typeof AXIS_VERTICAL;
    accepts: string[];
    canDrop?(data: CanDropOptions): boolean;
    hover?(data: DragHoverOptions): void;
    drop?(data: DropOptions): void;
}

// DropContainer.propTypes = {
//     children: propTypes.oneOfType([propTypes.func, propTypes.node]),
//     axis: propTypes.oneOf([AXIS_BOTH, AXIS_HORIZONTAL, AXIS_VERTICAL]),
//     accepts: propTypes.array,
//     render: propTypes.func,
//     id: propTypes.any,
//     canDrop: propTypes.func,
//     hover: propTypes.func,
//     drop: propTypes.func,
// };

class DropContainer extends React.Component<Partial<DropContainerProps>> {
    static contextType = ModelContext;
    context: ModelContextValue;

    static defaultProps: DropContainerProps = {
        id: null,
        accepts: [],
    };

    readonly props: Readonly<DropContainerProps>;

    _connectDropTarget: null | ((dom: null | HTMLElement) => void) = null;

    connectDropTarget() {
        const children = this.props.children;

        if (!children || typeof children === "function") return;

        const dom = findDOMNode(this);

        if (this._connectDropTarget) {
            this._connectDropTarget(dom);
        }
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
        if (this._connectDropTarget) {
            this._connectDropTarget(null);
        }
    }

    getModel() {
        return this.context.model;
    }

    getDropOptions() {
        const { id = null, hover, canDrop, drop, accepts } = this.props;
        const targetDOM = findDOMNode(this);

        const model = this.getModel();

        // const DropContainerContext = model.DropContainerContext;
        // const { isRootContainer } = React.useContext(DropContainerContext);
        const commitAction = model.props.commitAction;

        return {
            accept: [model.getScope(), ...accepts],

            canDrop: (dragResult, monitor) => {
                let ret = !model.contains(dragResult.item, model.getItem(id));

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

                DragState.setState({
                    canDrop: monitor.canDrop(),
                    hoverContainerId: id,
                    hoverItem: undefined,
                    hoverDirection: DRAG_DIR_NONE,
                });

                if (canDrop) {
                    if (commitAction === COMMIT_ACTION_AUTO) {
                        model.updateItemPid(dragResult.item, id);
                    }
                }

                const e = {
                    target: id,
                    targetDOM,
                    monitor,
                    component: this,
                    model,
                    ...dragResult,
                };

                model.fireEvent("onDragHoverContainer", e);
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
                    const e = {
                        target: id,
                        targetDOM,
                        type: isNew ? EVENT_TYPE_ADD : EVENT_TYPE_SORT,
                        monitor,
                        component: this,
                        model,
                        ...dragResult,
                    };
                    model.fireEvent("onDropToContainer", e);
                    model.fireEvent("onDrop", e);
                }
            },

            collect: monitor => {
                return {
                    monitor,
                    canDrop: monitor.canDrop(),
                    isOver: monitor.isOver(),
                    isStrictlyOver: monitor.isOver({ shallow: true }),
                };
            },
        };
    }

    render() {
        const { id, children, render, axis } = this.props;

        const model = this.getModel();

        const DropContainerContext = model.DropContainerContext;
        const { isRootContainer } = React.useContext(DropContainerContext);

        invariant(
            isRootContainer ? true : id != null,
            "sub DropContainer id is required."
        );

        const [collectedProps, connectDropTarget] = useDrop(
            this.getDropOptions()
        );

        let items = model.getChildren(id);
        if (!collectedProps.isOver) {
            //collectedProps.isStrictlyOver
            items = items.filter(item => !model.isTmpItem(item));
        }

        this._connectDropTarget = connectDropTarget;

        const props = {
            ...collectedProps,
            model,
            connectDropTarget,
            items,
        };

        const child = children
            ? isFunction(children)
                ? children(props)
                : children
            : render
            ? render(props)
            : null;

        return (
            <DropContainerContext.Provider
                value={{
                    isRootContainer: false,
                    axis,
                }}
            >
                {child}
            </DropContainerContext.Provider>
        );
    }
}

export default withHooks(DropContainer);
