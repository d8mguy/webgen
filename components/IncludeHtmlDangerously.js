
import React from "react";

// IncludeHtmlDangerously accepts props `html:string`, `width:integer` (optional), `height:integer` (optional).
// It's a wrapper for react's div prop that sets the html of a div. Use it to include some static html, after ensuring
// that this html is sanitized. Because IncludeHtmlDangerously doesn't sanitize it for you.
function IncludeHtmlDangerously(props) {
    const w = props.width === undefined ? "inherit" : props.width;
    const h = props.height === undefined ? "inherit" : props.height;
    const dsiArg = {__html: props.html}
    return <div style={{width: w, height: h, lineHeight: "150%", overflow: "auto"}} dangerouslySetInnerHTML={dsiArg}></div>
}

export default IncludeHtmlDangerously;
