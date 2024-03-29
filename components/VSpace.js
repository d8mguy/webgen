
import React from "react";

// VSpace is a way to create vertical space. It accepts props `height:string`.
//
function VSpace(props) {
    return (
        <div style={{minHeight:props.height}}></div>
    )
}
export default VSpace;
