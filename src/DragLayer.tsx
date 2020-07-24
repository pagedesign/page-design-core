import React from "react";
import { useDragLayer, DragLayerMonitor } from "react-dnd";
import { isFunction } from "./utils";
import type { DragObject, DragLayerRenderProps, Item } from "./types";

export interface DragLayerProps<T extends Item = Item> {
	children: ((props: DragLayerRenderProps<T>) => React.ReactElement) | React.ReactElement;
}

export const DragLayer = function <T extends Item = Item>({ children }: DragLayerProps<T>) {
	const props: DragLayerRenderProps<T> = useDragLayer((monitor: DragLayerMonitor) => {
		const dragResult: Required<DragObject<T>> = monitor.getItem();
		return {
			...dragResult,
			monitor,
			isDragging: monitor.isDragging(),
			initialClientOffset: monitor.getInitialClientOffset(),
			initialSourceClientOffset: monitor.getInitialSourceClientOffset(),
			clientOffset: monitor.getClientOffset(),
			differenceFromInitialOffset: monitor.getDifferenceFromInitialOffset(),
			sourceClientOffset: monitor.getSourceClientOffset(),
		};
	});

	return isFunction(children) ? children(props) : children;
};

DragLayer.displayName = "DragLayer";
