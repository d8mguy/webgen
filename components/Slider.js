
import React from "react";
// Slider is a thin wrapper around the html tag input type="range". It accepts props
// `min:number`, `max:number`, `changefn:function`, `value:number` (optional), `label:string or [string,string]` (optional).
// For now, it is horizontal only. Value defaults to min.
// A planning note: range input type is not well supported; in particular across browsers it's very different.
// See https://css-tricks.com/sliding-nightmare-understanding-range-input/ for details. The solution is to replace
// this code with a hand written slider that handles internal events and publishes a sensible set of affordances for
// styling and passing events outside.
function Slider(props) {
    let value = props.value === null ? props.min : props.value;
    if (props.label === null) {
        return (
            <input type="range" min={props.min} max={props.max} value={value} onChange={props.changefn} />
        )
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
                    <input type="range" min={props.min} max={props.max} value={value} onChange={props.changefn} />
                </label>
            )
        } else {
            return (
                <label>
                    <input type="range" min={props.min} max={props.max} value={value} onChange={props.changefn} />
                    {labelval}
                </label>
            )
        }
    }
}
export default Slider;
