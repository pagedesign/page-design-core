import React from "react";
import { ModelContext } from "./ModelContext";
import { Model } from "./Model";
import type { Item } from "./types";

export function useModel<T extends Item = Item>(): Model<T> {
	const context = React.useContext(ModelContext);
	return context.model as Model<T>;
}
