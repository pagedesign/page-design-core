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
        pid: propTypes.any,
        disabled: propTypes.bool,
        collect: propTypes.func,
        canDrop: propTypes.func,
        hover: propTypes.func,
        drop: propTypes.func
    };

    static defaultProps = {
        pid: null
    };

    _connectDropTarget = null;

    connectDrop() {
        const { disabled } = this.props;

        const dom = findDOMNode(this);
        if (this._connectDropTarget) {
            this._connectDropTarget(disabled ? null : dom);
        }
    }

    componentDidMount() {
        this.connectDrop();
    }

    componentDidUpdate() {
        this.connectDrop();
    }

    render() {
        const {
            pid = null,
            canDrop,
            hover,
            drop,
            collect,
            children
        } = this.props;

        const designer = React.useContext(ModelContext);
        const DropContainerContext = designer.DropContainerContext;
        const { isRootContainer } = React.useContext(DropContainerContext);

        invariant(
            isRootContainer ? true : pid != null,
            "sub DropContainer props.pid miss."
        );

        const [collectedProps, connectDropTarget] = useDrop({
            accept: designer.getScope(),

            canDrop({ item }, monitor) {
                if (canDrop) {
                    return canDrop(item, monitor);
                }

                return true;
            },

            hover({ item }, monitor) {
                if (hover) {
                    hover(item, monitor);
                }

                designer.fireEvent("onDragHoverContainer", {
                    target: pid,
                    monitor,
                    item
                });

                const isOver = monitor.isOver({ shallow: true });
                if (!isOver) return;

                if (!monitor.canDrop()) {
                    return;
                }

                designer.updateItemPid(item, pid);
            },

            drop({ item }, monitor) {
                if (drop) {
                    drop(item, monitor);
                }

                //根节点统一commit
                if (isRootContainer) {
                    const isTmpItem = designer.isTmpItem(item);
                    designer.commitItem(item);

                    designer.fireEvent("onDrop", {
                        item,
                        target: pid,
                        action: isTmpItem ? ACTION_ADD : ACTION_SORT
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
        });

        let items = designer.getItems(pid);
        if (!collectedProps.isOver) {
            items = items.filter(item => !designer.isTmpItem(item));
        }

        this._connectDropTarget = connectDropTarget;

        const child =
            typeof children === "function"
                ? children(items, collectedProps)
                : children;

        React.Children.only(child);

        return (
            <DropContainerContext.Provider
                value={{
                    isRootContainer: false,
                    canDrop: canDrop
                }}>
                {child}
            </DropContainerContext.Provider>
        );
    }
}

export default withHooks(DropContainer);
