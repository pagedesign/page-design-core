import React from "react";
import HTML5Backend from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { Model, ModelProps } from "./Model";

export interface ProviderProps extends ModelProps {
    backend: typeof HTML5Backend;
    context: any;
}

export class PageDesignCore extends React.Component<Partial<ProviderProps>> {
    static defaultProps: Pick<ProviderProps, "context" | "backend"> = {
        context: window,
        backend: HTML5Backend,
    };
    readonly props: Readonly<ProviderProps>;

    model: Model;

    getModel() {
        return this.model;
    }

    saveModel = (model: Model) => {
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
