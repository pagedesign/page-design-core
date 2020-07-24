import {
	DragSourceMonitor,
	DropTargetMonitor,
	DragLayerMonitor,
	ConnectDragSource,
	ConnectDragPreview,
	ConnectDropTarget,
	XYCoord,
} from "react-dnd";

import { Model } from "./Model";

import {
	DRAG_DIR_UP,
	DRAG_DIR_DOWN,
	DRAG_DIR_LEFT,
	DRAG_DIR_RIGHT,
	DRAG_DIR_NONE,
	EVENT_TYPE_ADD,
	EVENT_TYPE_SORT,
} from "./constants";

export type DirType =
	| typeof DRAG_DIR_UP
	| typeof DRAG_DIR_DOWN
	| typeof DRAG_DIR_LEFT
	| typeof DRAG_DIR_RIGHT;

export type HoverDirection = DirType | typeof DRAG_DIR_NONE;

export type IdType = string | number | null;

export interface Item extends Record<string | number, any> {
	id: IdType;
	pid: IdType;
	__tmp__?: boolean;
}

export interface DragObject<T extends Item = Item> {
	type: string;
	item?: T;
	dom?: HTMLElement;
}

export interface DropResult {}

export interface DragCollectedProps {
	isDragging: boolean;
	monitor: DragSourceMonitor;
}

export interface DragState<T extends Item = Item> {
	item: null | T;
	isNew: boolean;
	canDrop: boolean;
	hoverContainerId: IdType;
	hoverItem: null | T;
	hoverDirection:
		| typeof DRAG_DIR_UP
		| typeof DRAG_DIR_DOWN
		| typeof DRAG_DIR_LEFT
		| typeof DRAG_DIR_RIGHT
		| typeof DRAG_DIR_NONE;
	dragDOMIsRemove: boolean;
	isDragging: boolean;
	currentDragDOM: null | HTMLElement;
	dragDOM: null | HTMLElement;
}

export type DragStateType = DragState;

export interface CanDragOptions<T, D = DragSourceMonitor> {
	monitor: D;
	model: Model;
	component: T;
}

export interface CanDropOptions<T, D = DragSourceMonitor> extends CanDragOptions<T, D> {
	item: Item;
	dom: HTMLElement;
}

export interface DragHoverOptions<T, D> extends CanDropOptions<T, D> {}

export interface BeginDragOptions<T> extends CanDropOptions<T> {}

export interface EndDragOptions<T> extends CanDropOptions<T> {}

export interface DropOptions<T, D = DragSourceMonitor> extends CanDragOptions<T, D> {
	item: Item;
	dom: HTMLElement;
}

export interface DropContainerRenderProps<T extends Item> {
	monitor: DropTargetMonitor;
	canDrop: boolean;
	isOver: boolean;
	isStrictlyOver: boolean;
	model: Model<T>;
	connectDropTarget: ConnectDropTarget;
	items: T[];
	[propName: string]: any;
}

export interface DragItemRenderProps<T extends Item> {
	monitor: DragSourceMonitor;
	isDragging: boolean;
	model: Model<T>;
	connectDragSource: ConnectDragSource;
	connectDragPreview: ConnectDragPreview;
}

export interface DropItemRenderProps<T extends Item = Item> {
	monitor: DropTargetMonitor;
	hoverDirection: HoverDirection;
	isOver: boolean;
	isStrictlyOver: boolean;
	canDrop: boolean;
	isDragging: boolean;
	item: T;
	isTmp: boolean;
	model: Model<T>;
	connectDropTarget: ConnectDropTarget;
	connectDragSource: ConnectDragSource;
	connectDragAndDrop: (dom: HTMLElement | null) => void;
	connectDragPreview: ConnectDragPreview;
}

export interface DragLayerRenderProps<T extends Item = Item> {
	type: string;
	dom: HTMLElement;
	item: T;
	monitor: DragLayerMonitor;
	isDragging: boolean;
	initialClientOffset: XYCoord | null;
	initialSourceClientOffset: XYCoord | null;
	clientOffset: XYCoord | null;
	differenceFromInitialOffset: XYCoord | null;
	sourceClientOffset: XYCoord | null;
}

export interface DragStartEvent<T extends Item = Item> {
	item: T;
	dom: HTMLElement;
	type: typeof EVENT_TYPE_ADD | typeof EVENT_TYPE_SORT;
	model: Model<T>;
	monitor: DragSourceMonitor;
	component: any;
}
export interface DragEndEvent<T extends Item = Item> extends DragObject<T> {
	type: typeof EVENT_TYPE_ADD | typeof EVENT_TYPE_SORT;
	model: Model<T>;
	monitor: DragSourceMonitor;
	component: any;
}
export interface DropEvent<T extends Item = Item> extends DragObject<T> {
	target: IdType;
	targetDOM: HTMLElement;
	monitor: DropTargetMonitor;
	component: any;
	model: Model<T>;
	type: typeof EVENT_TYPE_ADD | typeof EVENT_TYPE_SORT;
}
export interface DropToItemEvent<T extends Item = Item> extends DragObject<T> {
	target: T;
	targetDOM: HTMLElement;
	monitor: DropTargetMonitor;
	component: any;
	model: Model<T>;
	type: typeof EVENT_TYPE_ADD | typeof EVENT_TYPE_SORT;
}

export type DropToContainerEvent<T extends Item = Item> = DropEvent<T>;

export interface DragHoverEvent<T extends Item = Item>
	extends Omit<DropEvent<T>, "type" | "target"> {
	target: T | string | null;
}

export type DragHoverContainerEvent<T extends Item = Item> = Omit<DropEvent<T>, "type">;
export type DragHoverItemEvent<T extends Item = Item> = Omit<DropToItemEvent<T>, "type">;
