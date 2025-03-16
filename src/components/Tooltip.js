import React from "react";

const Tooltip = ({ text, position }) => (
    <div
        style={{
            position: "absolute",
            visibility: text ? "visible" : "hidden",
            background: "#ddd",
            padding: "5px",
            borderRadius: "4px",
            left: position.x,
            top: position.y
        }}
    >
        {text}
    </div>
);

export default Tooltip;
