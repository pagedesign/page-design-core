import React from "react";
import { findDOMNode } from "react-dom";
// import propTypes from "prop-types";
import { useDrag, DragSourceMonitor } from "react-dnd";
import withHooks from "with-component-hooks";
import { ModelContext, ModelContextValue } from "./ModelContext";
import {
	EVENT_TYPE_ADD,
	EVENT_TYPE_SORT,
	COMMIT_ACTION_AUTO,
	COMMIT_ACTION_DROP,
} from "./constants";
import { isNodeInDocument, isFunction } from "./utils";
import DragState from "./DragState";
import type {
	CanDragOptions,
	BeginDragOptions,
	EndDragOptions,
	DragItemRenderProps,
	Item,
	DragObject,
	DragCollectedProps,
	DropResult,
} from "./types";

export interface DragItemProps<T1 extends Item = Item> {
	getInstance: () => T1;
	children?: ((props: DragItemRenderProps<T1>) => React.ReactNode) | React.ReactNode;
	render?: (props: DragItemRenderProps<T1>) => React.ReactNode;
	canDrag?: <T = DragItem<T1>>(data: CanDragOptions<T>) => boolean;
	beginDrag?: <T = DragItem<T1>>(data: BeginDragOptions<T>) => void;
	endDrag?: <T = DragItem<T1>>(data: EndDragOptions<T>) => void;
}

class DragItem<T extends Item = Item> extends React.Component<DragItemProps<T>> {
	static contextType = ModelContext;
	context: ModelContextValue<T>;

	_dragDOM: null | HTMLElement;
	_connectDragSource: null | ((dom: null | HTMLElement) => void) = null;
	_connectDragPreview: null | ((dom: null | HTMLElement) => void) = null;

	componentDidUpdate() {
		this.connectDragSource();
	}

	componentDidMount() {
		this.connectDragSource();
	}

	getModel() {
		return this.context.model;
	}

	connectDragSource() {
		const children = this.props.children;

		if (!children || typeof children === "function") return;

		if (this._connectDragSource) {
			this._connectDragSource(findDOMNode(this));
		}
	}

	componentWillUnmount() {
		//fix: 当拖动的节点在拖动状态被删除时导致react-dnd在drop后需要移动鼠标才及时触发endDrag问题
		const dragDOM = this._dragDOM;
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

		if (this._connectDragSource) this._connectDragSource(null);
		if (this._connectDragPreview) this._connectDragPreview(null);
	}

	getDragOptions() {
		const { getInstance, canDrag, beginDrag, endDrag } = this.props;
		const model = this.getModel();
		const commitAction = model.props.commitAction;

		return {
			item: {
				type: model.getScope(),
			},

			canDrag: (monitor: DragSourceMonitor) => {
				if (canDrag) {
					return canDrag({
						monitor,
						model,
						component: this,
					});
				}

				return true;
			},

			begin: (monitor: DragSourceMonitor) => {
				const item = getInstance();
				const dom = findDOMNode(this);

				if (beginDrag) {
					beginDrag({
						item,
						dom,
						component: this,
						monitor,
						model,
					});
				}

				const dragDOM = this._dragDOM;
				DragState.setState({
					item,
					isNew: true,
					dragDOMIsRemove: false,
					isDragging: true,
					dragDOM,
				});

				if (commitAction === COMMIT_ACTION_AUTO) {
					model.addTmpItem(item);
				}

				model.fireEvent("onDragStart", {
					item,
					dom,
					type: EVENT_TYPE_ADD,
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

			end: (dragResult: Required<DragObject<T>>, monitor: DragSourceMonitor) => {
				const { dragDOMIsRemove, dragDOM } = DragState.getState();
				DragState.reset();

				if (dragDOMIsRemove && dragDOM && dragDOM.parentNode) {
					dragDOM.parentNode.removeChild(dragDOM);
				}

				if (endDrag) {
					endDrag({
						item: dragResult.item,
						dom: dragResult.dom,
						model,
						monitor,
						component: this,
					});
				}

				model.clearTmpItems();

				model.fireEvent("onDragEnd", {
					...dragResult,
					type: EVENT_TYPE_ADD,
					model,
					monitor,
					component: this,
				});
			},

			collect(monitor: DragSourceMonitor) {
				return {
					monitor,
					isDragging: monitor.isDragging(),
				};
			},
		};
	}

	render() {
		const { children, render } = this.props;
		const model = this.getModel();

		const [collectProps, connectDragSource, connectDragPreview] = useDrag(
			this.getDragOptions()
		);

		this._connectDragSource = React.useCallback(
			(dom: HTMLElement) => {
				this._dragDOM = dom;
				connectDragSource(dom);
			},
			[connectDragSource]
		);
		this._connectDragPreview = connectDragPreview;

		const props: DragItemRenderProps<T> = {
			...collectProps,
			model,
			connectDragSource,
			connectDragPreview,
		};

		return children
			? isFunction(children)
				? children(props)
				: children
			: render
			? render(props)
			: null;
	}
}

const WidgetItemWithHooks = withHooks(DragItem);
export { WidgetItemWithHooks as DragItem };
