import React from "react";
import { Model } from "./Model";
import { AXIS_VERTICAL, AXIS_HORIZONTAL, AXIS_BOTH } from "./constants";
import type { Item } from "./types";

export type ModelContextValue<T extends Item = Item> = { model: Model<T> };

export type DropContainerContextValue = {
	isRootContainer: boolean;
	axis?: typeof AXIS_BOTH | typeof AXIS_HORIZONTAL | typeof AXIS_VERTICAL;
};

export const ModelContext = React.createContext<ModelContextValue>({
	model: {},
} as ModelContextValue);
