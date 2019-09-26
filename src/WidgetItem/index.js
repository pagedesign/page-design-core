import React from "react";
import { findDOMNode } from "react-dom";
import propTypes from "prop-types";
import { useDrag } from "react-dnd";
import withHooks from "with-component-hooks";
import ModelContext from "../ModelContext";
import { ACTION_ADD, ACTION_SORT } from "../constants";

class WidgetItem extends React.Component {
    static contextType = ModelContext;

    static propTypes = {
        children: propTypes.oneOfType([propTypes.func, propTypes.node]),
        render: propTypes.func,
        getInstance: propTypes.func.isRequired,
        canDrag: propTypes.func,
        beginDrag: propTypes.func,
        endDrag: propTypes.func
    };

    _connectDragTarget = null;
    _connectDragPreview = null;

    componentDidUpdate() {
        this.connectDragTarget();
    }

    componentDidMount() {
        this.connectDragTarget();
    }

    connectDragTarget() {
        const children = this.props.children;

        if (!children || typeof children === "function") return;

        this._connectDragTarget(findDOMNode(this));
    }

    componentWillUnmount() {
        this._connectDragTarget(null);
        this._connectDragPreview(null);
    }

    getDragOptions() {
        const { getInstance, canDrag, beginDrag, endDrag } = this.props;
        const designer = this.context;

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
                const item = getInstance();
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
                    action: ACTION_ADD
                });

                designer.addTmpItem(item);

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
                    action: ACTION_ADD
                });

                designer.clearTmpItems();
            },

            collect(monitor) {
                return {
                    monitor,
                    isDragging: monitor.isDragging()
                };
            }
        };
    }

    render() {
        const { children, render } = this.props;

        const [collectProps, connectDragTarget, connectDragPreview] = useDrag(
            this.getDragOptions()
        );

        this._connectDragTarget = connectDragTarget;
        this._connectDragPreview = connectDragPreview;

        const props = {
            ...collectProps,
            connectDragTarget,
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

export default withHooks(WidgetItem);
