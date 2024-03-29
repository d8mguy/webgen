
import React from "react";

// Textbox accepts props `placeholder:string` (optional), `changefn:submitter`, `value:string` (optional),
// `size:integer` (optional), `disabled:boolean` (optional), `label:string` (optional).
// I lied again: label can also be [string,string]; if so the first should be 'left' or 'right' and then the label.
// It implements an input with type="text", possibly surrounded by a label element. Size defaults to 15.

function Textbox(props) {
  const tbxvalue = props.value === undefined ? "" : props.value;
  const swidth = props.size === undefined ? "15" : props.size;
  function tbox() {
    if(props.disabled !== undefined) {
      return (
          <input type='text' size={swidth} disabled={props.disabled}
                 placeholder={props.placeholder} value={tbxvalue} onChange={props.changefn} />
      )
    } else {
      return (
          <input type='text' size={swidth} placeholder={props.placeholder} value={tbxvalue} onChange={props.changefn} />
      )
    }
  }
  if(props.label === undefined) {
    return tbox();
  } else {
    let position = "right";
    let labelval = props.label;
    if(Array.isArray(labelval)) {
      if(props.label[0] === "left") position = "left";
      labelval = labelval[1];
    }
    if(position === "left") {
      return (
          <label>
            {labelval}
            {tbox()}
          </label>
      )
    } else {
      return (
          <label>
            {tbox()}
            {labelval}
          </label>
      )
    }
  }
}
export default Textbox;
