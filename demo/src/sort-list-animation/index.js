import React from "react";
import { WebDesignDndProvider, DropContainer, DropItem } from "@/src";

const dataset = [];

for (let i = 0; i < 20; i++) {
    dataset.push({
        id: i + 1,
        title: `${i + 1}. item`
    });
}

function ListItem({ item, index }) {
    return (
        <DropItem item={item}>
            {({ connectDragAndDrop, isDragging }) => {
                return (
                    <div
                        ref={connectDragAndDrop}
                        style={{
                            position: "absolute",
                            transition:
                                "transform .2s cubic-bezier(0.2, 0, 0, 1)",
                            position: "absolute",
                            left: 5,
                            right: 5,
                            transform: `translate(0, ${(30 + 18) * index}px)`,
                            zIndex: isDragging ? 2 : 1,
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

function renderList(items) {
    const list = [...items];
    list.sort((a, b) => a.id - b.id);

    const getItemPosition = item => {
        for (let i = 0; i < items.length; i++) {
            const current = items[i];
            if (current.id === item.id) return i;
        }
    };

    return (
        <div
            style={{
                position: "relative",
                border: "1px solid #ccc",
                borderRadius: 4,
                padding: 5,
                width: 270,
                margin: "30px auto",
                height: "80%",
                overflow: "auto"
            }}
        >
            {list.map(item => (
                <ListItem
                    key={item.id}
                    index={getItemPosition(item)}
                    item={item}
                />
            ))}
        </div>
    );
}

export default () => {
    const [value, onChange] = React.useState(dataset);

    return (
        <WebDesignDndProvider value={value} onChange={onChange}>
            <DropContainer>{renderList}</DropContainer>
        </WebDesignDndProvider>
    );
};
