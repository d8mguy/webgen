
import React from "react";
// VRadioButton works exactly like HRadioButton except the elements are stacked vertically instead of horizontally.
// It accepts props `clickfn:function`, `labels:list(string)`, `value:string` (optional), `labelPosition:string` (optional).
// It implements a set of radio buttons arrayed vertically, labeled by labels. The value property of the underlying input is
// set to the label of that radio button. Labels are to the right of their button unless labelPosition is set to 'left'.
// The clickfn receives the event. Note that radio buttons call this onChange.
function VRadioButton(props) {
    let position = "right";
    console.log("VRB:", props)
    if (props.labelPosition === "left") position = "left";
    let labels = props.labels;
    let groupid = `radiogroup${Math.floor(10000*Math.random())}`;
    let buttons = labels.map((lbl, inx) => {
        return (
            <div>
                <label>
                    <input type='radio' value={lbl} checked={props.value === lbl} name={groupid} onChange={e => props.clickfn(e)} />
                    {lbl}
                </label>
            </div>
        )
    });
  // The following seems dumb, but I expect left labeling to happen very very seldom
  if (position !== "right") buttons = labels.map((lbl, inx) => {
    return (
        <div>
          <label>
              {lbl}
              <input type='radio' value={lbl} checked={props.value === lbl} name={groupid} onChange={e => props.clickfn(e)} />
          </label>
        </div>
    )
  });
  return (
      <div>{buttons}</div>
  )
}

export default VRadioButton;
