import React from "react";
import { findDOMNode } from "react-dom";
import { useDrop } from "react-dnd";
import propTypes from "prop-types";
import withHooks from "with-component-hooks";
import invariant from "invariant";
import {
    ACTION_ADD,
    ACTION_SORT,
    DRAG_DIR_NONE,
    DRAG_DIR_UP,
    DRAG_DIR_LEFT,
    COMMIT_ACTION_DROP,
    COMMIT_ACTION_AUTO
} from "../constants";
import ModelContext from "../ModelContext";
import DragState from "../Model/DragState";

class DropContainer extends React.Component {
    static contextType = ModelContext;

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
        const { pid = null, hover, canDrop, drop, collect } = this.props;
        const targetDOM = findDOMNode(this);

        const designer = this.context;

        const DropContainerContext = designer.DropContainerContext;
        const { isRootContainer } = React.useContext(DropContainerContext);
        const commitAction = designer.props.commitAction;

        return {
            accept: designer.getScope(),

            canDrop(dragResult, monitor) {
                if (canDrop) {
                    return canDrop(dragResult, monitor);
                }

                return true;
            },

            hover: (dragResult, monitor) => {
                if (hover) {
                    hover(dragResult, monitor);
                }

                designer.fireEvent("onDragHoverContainer", {
                    target: pid,
                    targetDOM,
                    monitor,
                    ...dragResult
                });

                if (!monitor.canDrop()) {
                    return;
                }

                //commitAction=COMMIT_ACTION_DROP时
                //关于这段代码在场景一,场景二所在位置的表现：
                //场景一：由于react-dnd在canDrop返回false的情况下也会触发，所以在COMMIT_ACTION_DROP且有嵌套情况下会出现问题
                //好在react-dnd的hover触发顺序是先parent -> child 所以这种情况放在场景一比较合理。
                //场景二：建议放在场景二，这时自定义属性canDrop需要慎重，另一种方式就是connectDropTarget完全交于用户自己处理就不会有场景一的问题。

                //场景一
                // DragState.setState({
                //     hoverPid: pid,
                //     hoverItem: undefined,
                //     hoverDirection: DRAG_DIR_NONE
                // });

                const isStrictlyOver = monitor.isOver({ shallow: true });
                if (!isStrictlyOver) return;

                //场景二
                DragState.setState({
                    hoverPid: pid,
                    hoverItem: undefined,
                    hoverDirection: DRAG_DIR_NONE
                });

                if (commitAction === COMMIT_ACTION_AUTO) {
                    designer.updateItemPid(dragResult.item, pid);
                }
            },

            drop: (dragResult, monitor) => {
                if (drop) {
                    drop(dragResult, monitor);
                }

                //在根节点统一commit
                if (isRootContainer) {
                    const isTmpItem = designer.isTmpItem(dragResult.item);

                    designer.fireEvent("onDrop", {
                        target: pid,
                        targetDOM,
                        action: isTmpItem ? ACTION_ADD : ACTION_SORT,
                        ...dragResult
                    });

                    if (commitAction === COMMIT_ACTION_AUTO) {
                        designer.commitItem(dragResult.item);
                    } else if (commitAction === COMMIT_ACTION_DROP) {
                        designer.commitDragStateItem();
                    }
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

        const designer = this.context;

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
