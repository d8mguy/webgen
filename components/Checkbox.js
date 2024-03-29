
import React from "react";
// Checkbox accepts props `clickfn:function`, `checked:boolean` (optional), `disabled:boolean` (optional),
// `label:string` (optional).
// It implements a checkbox input with the label if present, and
// clickfn handling the onClick event. The full truth is that label can be a pair of strings too. (If I say this,
// the codegen screws up.) In this case, the first string should be
// "left" or "right"; if just a string, the position defaults to "right"
// The clickfn receives the event.
function Checkbox(props) {
  let position = "right";
  let isDisabled = props.disabled === undefined ? "" : props.disabled;
  if (props.label === undefined) {
    return (
      <input type='checkbox' checked={props.checked} disabled={isDisabled} onChange={(e) => props.clickfn(e)} />
    )
  } else {
    let labelval = props.label;
    if(Array.isArray(labelval)) {
      if(props.label[0] === "left") position = "left";
      labelval = labelval[1];
    }
    if(position === "left") {
      return (
          <label>
            {labelval}
            <input type='checkbox' checked={props.checked} disabled={isDisabled} onChange={(e) => props.clickfn(e)} />
          </label>
      )
    } else {
      return (
          <label>
            <input type='checkbox' checked={props.checked} disabled={isDisabled} onChange={(e) => props.clickfn(e)} />
            {labelval}
          </label>
      )
    }
  }
}

export default Checkbox;
