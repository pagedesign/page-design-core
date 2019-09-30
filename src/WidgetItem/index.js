import React from "react";
import { findDOMNode } from "react-dom";
import propTypes from "prop-types";
import { useDrag } from "react-dnd";
import withHooks from "with-component-hooks";
import ModelContext from "../ModelContext";
import {
    ACTION_ADD,
    ACTION_SORT,
    COMMIT_ACTION_AUTO,
    COMMIT_ACTION_DROP
} from "../constants";
import { isNodeInDocument } from "../utils";
import DragState from "../Model/DragState";

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

    _connectDragDOM = null;

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

        this._connectDragTarget(null);
        this._connectDragPreview(null);
    }

    getDragOptions() {
        const { getInstance, canDrag, beginDrag, endDrag } = this.props;
        const model = this.context;
        const commitAction = model.props.commitAction;

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

                model.fireEvent("onDragStart", {
                    item,
                    dom,
                    action: ACTION_ADD
                });

                const dragDOM = this._connectDragDOM;
                DragState.setState({
                    item,
                    isNew: true,
                    dragDOMIsRemove: false,
                    isDragging: true,
                    dragDOM
                });

                if (commitAction === COMMIT_ACTION_AUTO) {
                    model.addTmpItem(item);
                }

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
                    action: ACTION_ADD
                });

                model.clearTmpItems();
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
        const model = this.context;

        const [collectProps, connectDragTarget, connectDragPreview] = useDrag(
            this.getDragOptions()
        );

        this._connectDragTarget = React.useCallback(
            dom => {
                this._connectDragDOM = dom;
                connectDragTarget(dom);
            },
            [connectDragTarget]
        );
        this._connectDragPreview = connectDragPreview;

        const props = {
            ...collectProps,
            model,
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
