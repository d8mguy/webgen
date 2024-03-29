
import React from "react";

// HSpace is a way to create horizontal space. It accepts props `width:string`.
//
function HSpace(props) {
    return (
        <span style={{display:"inline-block", width:props.width}}></span>
    )
}
export default HSpace;
