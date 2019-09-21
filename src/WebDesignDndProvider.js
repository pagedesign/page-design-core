import React from "react";
import HTML5Backend from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

import Model from "./Model";

export default class WebDesignDndProvider extends React.Component {
    model = null;

    getModel() {
        return this.model;
    }

    saveModel = model => {
        this.model = model;
    };

    render() {
        const { children, ...props } = this.props;

        return (
            <DndProvider backend={HTML5Backend}>
                <Model {...props} ref={this.saveModel}>
                    {children}
                </Model>
            </DndProvider>
        );
    }
}
