
import React from "react";

// GridLayout accepts props `columns:string`, `width:string`, `margin:string` (optional), children:list(component).
// It implements a grid layout for children. The columns prop is a value for gridTemplateColumns.
function GridLayout(props) {
    const mrgn = props.margin === undefined ? "inherit" : props.margin;
    return (
        <div className="GridLayout" style={{width:props.width, margin:mrgn, gridTemplateColumns:props.columns, alignContent:"end"}} >
            {props.children}
        </div>
    )
}
export default GridLayout;
