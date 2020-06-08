import React from "react";
import { findDOMNode } from "react-dom";
import { useDrop, DropTargetConnector, DropTargetMonitor } from "react-dnd";
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
import type {
	CanDropOptions,
	DragHoverOptions,
	DropOptions,
	DropContainerRenderProps,
	DragObject,
} from "./types";

export interface DropContainerProps {
	id: null | string;
	children?: ((props: DropContainerRenderProps) => React.ReactNode) | React.ReactNode;
	render?: (props: DropContainerRenderProps) => React.ReactNode;
	axis?: typeof AXIS_BOTH | typeof AXIS_HORIZONTAL | typeof AXIS_VERTICAL;
	accepts: string[];
	canDrop?: <T = DropContainer, D = DropTargetMonitor>(data: CanDropOptions<T, D>) => boolean;
	hover?: <T = DropContainer, D = DropTargetMonitor>(data: DragHoverOptions<T, D>) => void;
	drop?: <T = DropContainer, D = DropTargetConnector>(data: DropOptions<T, D>) => void;
}

class DropContainer extends React.Component<DropContainerProps> {
	static contextType = ModelContext;
	context: ModelContextValue;

	static defaultProps: DropContainerProps = {
		id: null,
		accepts: [],
	};

	_connectDropTarget: (dom: null | HTMLElement) => void;

	connectDropTarget() {
		const children = this.props.children;

		if (!children || typeof children === "function") return;

		const dom = findDOMNode(this);

		this._connectDropTarget(dom);
	}

	componentDidMount() {
		this.connectDropTarget();
	}

	componentDidUpdate() {
		this.connectDropTarget();
	}

	componentWillUnmount() {
		this._connectDropTarget(null);
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

			canDrop: (dragResult: Required<DragObject>, monitor: DropTargetMonitor) => {
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

			hover: (dragResult: Required<DragObject>, monitor: DropTargetMonitor) => {
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

			drop: (dragResult: Required<DragObject>, monitor: DropTargetMonitor) => {
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

			collect: (monitor: DropTargetMonitor) => {
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

		invariant(isRootContainer ? true : id != null, "sub DropContainer id is required.");

		const [collectedProps, connectDropTarget] = useDrop(this.getDropOptions());

		let items = model.getChildren(id);
		if (!collectedProps.isOver) {
			//collectedProps.isStrictlyOver
			items = items.filter((item) => !model.isTmpItem(item));
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

const DropContainerWithHooks = withHooks(DropContainer);

export { DropContainerWithHooks as DropContainer };
