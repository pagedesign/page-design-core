import React from "react";
import classnames from "classnames";
import { NativeTypes } from "react-dnd-html5-backend";
import { useDrop } from "react-dnd";
import { Provider, useModel, DropItem } from "@/src";

import "./index.scss";

let idx = 1;

function FileDropZone({ onChange }) {
    const model = useModel();
    const [{ canDrop, isOver }, connectDropTarget] = useDrop({
        accept: [NativeTypes.FILE],
        drop(item, monitor) {
            const files = item.files.map(file => {
                return {
                    pid: null,
                    id: idx++,
                    name: file.name,
                    size: file.size
                };
            });

            if (onChange) {
                onChange(files);
            }
            console.log(item);
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop()
        })
    });
    const isActive = canDrop && isOver;

    const files = model.getChildren(null);
    return (
        <div
            ref={connectDropTarget}
            className={classnames({
                "files-list": true,
                "drag-over": isActive
            })}
        >
            {files.map(file => (
                <File key={file.id} file={file} />
            ))}
        </div>
    );
}

function File({ file }) {
    const model = useModel();

    return (
        <DropItem item={file}>
            {({ connectDragAndDrop, isDragging }) => {
                const isDraggingMode = model.isDragging();
                return (
                    <div
                        className={
                            "file-item " + (isDraggingMode ? "is-dragging" : "")
                        }
                        ref={connectDragAndDrop}
                        style={{
                            backgroundColor: isDragging ? "cornsilk" : "",
                            opacity: isDragging ? 0.5 : 1,
                            padding: 10,
                            borderBottom: "1px solid #ccc"
                        }}
                    >
                        {file.name} - {file.size}
                    </div>
                );
            }}
        </DropItem>
    );
}

export default class extends React.Component {
    state = {
        files: []
    };

    renderDropContainer = ({ items, monitor, connectDropTarget, ...rest }) => {
        const item = monitor.getItem();
        if (item) {
            console.log(rest, item);
            // console.log(item.files);
        }

        return (
            <div
                ref={connectDropTarget}
                className={classnames({
                    "files-list": true,
                    "drag-over": monitor.isOver()
                })}
            ></div>
        );
    };

    handleChange = items => {
        const { files } = this.state;
        this.setState({
            files: [...files, ...items]
        });
    };

    handleSort = items => {
        this.setState({
            files: items
        });
    };

    render() {
        const { files } = this.state;
        return (
            <div className="native-files-panel">
                <h3>Drag file here</h3>
                <Provider value={files} onChange={this.handleSort}>
                    <FileDropZone onChange={this.handleChange} />
                </Provider>
            </div>
        );
    }
}
