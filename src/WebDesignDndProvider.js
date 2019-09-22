import React from "react";
import HTML5Backend from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

import Model from "./Model";

export default class WebDesignDndProvider extends React.Component {
    static defaultProps = {
        backend: HTML5Backend
    };

    model = null;

    getModel() {
        return this.model;
    }

    saveModel = model => {
        this.model = model;
    };

    render() {
        const { children, backend, ...props } = this.props;

        return (
            <DndProvider backend={backend}>
                <Model {...props} ref={this.saveModel}>
                    {children}
                </Model>
            </DndProvider>
        );
    }
}
