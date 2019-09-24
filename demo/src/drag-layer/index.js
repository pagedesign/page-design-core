import React from "react";
import {
    WebDesignDndProvider,
    DropContainer,
    DropItem,
    DragLayer
} from "@/src";

/**
 * 自定义拖拽层
 * 禁用系统自带的拖拽层，使用用户自定义拖拽层
 */

const dataset = [];

for (let i = 0; i < 5; i++) {
    dataset.push({
        pid: "a",
        id: i + 1,
        title: `${i + 1}. item`
    });
}

for (let i = 5; i < 10; i++) {
    dataset.push({
        pid: "b",
        id: i + 1,
        title: `${i + 1}. item`
    });
}

function ListItem({ item }) {
    return (
        <DropItem item={item}>
            {({ connectDragAndDrop, isDragging }) => {
                return (
                    <div
                        ref={connectDragAndDrop}
                        style={{
                            opacity: isDragging ? 0.5 : 1,
                            padding: 10,
                            margin: 5,
                            background: "#f2f2f2",
                            border: "1px solid #dadada"
                        }}
                    >
                        {item.title}
                    </div>
                );
            }}
        </DropItem>
    );
}

function ItemDragLayer({ dom, clientOffset }) {
    console.log(clientOffset, "offset");
    React.useEffect(() => {
        const rect = dom.getBoundingClientRect();

        const cloneNode = dom.cloneNode(true);

        cloneNode.style.display = "fixed";
        cloneNode.style.left = clientOffset.x + "px";
        cloneNode.style.top = clientOffset.y + "px";
        cloneNode.style.opacity = 1;
        cloneNode.style.boxSizing = "border-box";
        cloneNode.style.width = rect.width + "px";
        cloneNode.style.height = rect.height + "px";

        document.body.appendChild(cloneNode);
        return () => {
            document.body.removeChild(cloneNode);
        };
    }, []);

    return null;
}

export default () => {
    const [value, onChange] = React.useState(dataset);

    return (
        <WebDesignDndProvider value={value} onChange={onChange}>
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    margin: "30px auto",
                    height: "80%",
                    width: 600
                }}
            >
                <DropContainer pid="a">
                    {items => (
                        <div
                            style={{
                                flex: "1",
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                padding: 5,
                                overflow: "auto"
                            }}
                        >
                            {items.map(item => (
                                <ListItem key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </DropContainer>
                <div
                    style={{
                        width: 20
                    }}
                ></div>
                <DropContainer pid="b">
                    {items => (
                        <div
                            style={{
                                flex: "1",
                                border: "1px solid #ccc",
                                borderRadius: 4,
                                padding: 5,
                                overflow: "auto"
                            }}
                        >
                            {items.map(item => (
                                <ListItem key={item.id} item={item} />
                            ))}
                        </div>
                    )}
                </DropContainer>
                <DragLayer>
                    {({ isDragging, ...props }) => {
                        if (!isDragging) return null;
                        return <ItemDragLayer {...props} />;
                    }}
                </DragLayer>
            </div>
        </WebDesignDndProvider>
    );
};
