
import React from "react";

// Text is a way to place calculated text in a div and give it layout properties. It accepts props
// `contents:string`. (And of course, the universal props, like class, width, height, etc.)
function Text(props) {
    return (
        <span>
            {props.contents}
        </span>
    )
}
export default Text;
