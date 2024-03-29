
import React from "react";
// HRadioButton accepts props `clickfn:function`, `labels:list(string)`, `initval:string` (optional), `values: list(string)` (optional),
// `labelPosition:string` (optional).
// It implements a set of radio buttons arrayed horizontally, labeled by labels. The value property of the underlying input is
// set to the label of that radio button. Labels are to the right of their button unless labelPosition is set to 'left'.
// The clickfn receives the event. Note that radio buttons call this onChange.
function HRadioButton(props) {
  let position = "right";
  if (props.labelPosition === "left") position = "left";
  let labels = props.labels;
  let vals = props.values;
  if (vals === undefined) vals = props.labels;
  let groupid = `radiogroup${Math.floor(10000*Math.random())}`;
  let buttons = labels.map((lbl, inx) => {
    return (
        <label>
          <input type='radio' value={vals[inx]} checked={props.initval === vals[inx]} name={groupid} onChange={e => props.clickfn(e)} />
          {lbl}
        </label>
    )
  });
  // The following seems dumb, but I expect left labeling to happen very very seldom
  if (position !== "right") buttons = labels.map((lbl, inx) => {
    return (
        <label>
          {lbl}
          <input type='radio' value={vals[inx]} checked={props.initval === lbl} name={groupid} onChange={e => props.clickfn(e)} />
        </label>
    )
  });
  return (
      <span>
        {buttons}
      </span>
  )
}

export default HRadioButton;
