import React from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { Model, ModelProps } from "./Model";
import type { Item } from "./types";

export interface ProviderProps<T extends Item> extends ModelProps<T> {
	backend: typeof HTML5Backend;
	context: any;
}

export class PageDesignCore<T extends Item = Item> extends React.Component<ProviderProps<T>> {
	static defaultProps: Partial<ProviderProps<Item>> = {
		context: window,
		backend: HTML5Backend,
	};

	model: Model<T>;

	getModel() {
		return this.model;
	}

	saveModel = (model: Model<T>) => {
		this.model = model;
	};

	render() {
		const { backend, context, ...props } = this.props;

		return (
			<DndProvider backend={backend} context={context}>
				<Model {...props} ref={this.saveModel} />
			</DndProvider>
		);
	}
}
