import React from "react";
import { useDragLayer, DragLayerMonitor } from "react-dnd";
import { isFunction } from "./utils";
import type { DragObject, DragLayerRenderProps } from "./types";

export interface DragLayerProps {
	children: ((props: DragLayerRenderProps) => React.ReactElement) | React.ReactElement;
}

interface DragLayerFC extends React.FC<DragLayerProps> {}

export const DragLayer: DragLayerFC = function ({ children }) {
	const props = useDragLayer((monitor: DragLayerMonitor) => {
		const dragResult: Required<DragObject> = monitor.getItem();
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
