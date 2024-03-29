
import React from "react";

// FlexWrap accepts props `justify:string` (optional), `dir:string` (optional), `align:string` (optional),
// `width:string` (optional), children:list(component).
// It implements a flex layout for children.
function FlexWrap(props) {
    const jstfy = props.justify === undefined ? "normal" : props.justify;
    const dir = props.dir === undefined ? "column" : props.dir;
    const align = props.align === undefined ? "stretch" : props.align;
    const wdth = props.width === undefined ? "inherit" : props.width;
    return (
        <div style={{display:"flex", justifyContent:jstfy, width:wdth, flexDirection:dir, alignItems: align}} >
            {props.children}
        </div>
    )
}
export default FlexWrap;
