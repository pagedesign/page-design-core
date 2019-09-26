import React from "react";
import { findDOMNode } from "react-dom";
import { useDrop } from "react-dnd";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import invariant from "invariant";
import { ACTION_ADD, ACTION_SORT } from "../constants";
import ModelContext from "../ModelContext";

class DropContainer extends React.Component {
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
        const self = this;
        const { pid = null, canDrop, hover, drop, collect } = this.props;

        const designer = React.useContext(ModelContext);
        const DropContainerContext = designer.DropContainerContext;
        const { isRootContainer } = React.useContext(DropContainerContext);

        return {
            accept: designer.getScope(),

            canDrop(dragResult, monitor) {
                if (canDrop) {
                    return canDrop(dragResult, monitor);
                }

                return true;
            },

            hover(dragResult, monitor) {
                const targetDOM = findDOMNode(self);

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

                designer.updateItemPid(dragResult.item, pid);
            },

            drop(dragResult, monitor) {
                const targetDOM = findDOMNode(self);

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

                    designer.commitItem(dragResult.item);
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

        const designer = React.useContext(ModelContext);
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
