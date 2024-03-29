
import React from "react";
// DropdownValue accepts props `options:list(string)`, `changefn:function`, `values:list(integer)` (optional),
// `optionLabel:string` (optional), `label:string` (optional), `selectValue:string` (optional).
// It implements a selector whose labels (contents) are in props.options and whose values are in props.values.
// If props.values is omitted, we use the (zero-origin) indices of props.options.
// The changefn prop handles onChange, it is supplied with the integer value of the selected option, numbered from 0.
// That's the difference between DropdownValue and Dropdown, whose changefn gets the event.
// A non-null optionLabel becomes the label of a first selector with value -1, which is selected by default. This gives an
// "inline label" for the select widget.
// A non-null label wraps a label tag around the DDV of a first selector with value -1, which is selected by default. This gives an
// "inline label" for the select widget.



function DropdownValue(props) {
  function DDOption(props2) {
    return (
      <option value={props2.index} selected={props.selectValue === props2.index}>{props2.nm}</option>
    )
  }
  function onchange(e) {
    //console.log("ddv, passing", parseInt(e.target.value))
    props.changefn(parseInt(e.target.value));
  }
  //console.log("DDV: ", props.options)
  const values = props.values || [...Array(props.options.length).keys()];
  let options = props.options.map((x, inx) => <DDOption key={props.index} nm={x} index={values[inx]} />);
  if (props.optionLabel != null) {
    options.unshift(<DDOption key={-1} nm={props.optionLabel} index={-1} />);
  }
  if (props.label === undefined) {
    return (
        <select value={props.selectValue} onChange={onchange} >
          {options}
        </select>
    )
  } else {
    let nm = `lblnm${Math.floor(10000*Math.random())}`;
    return (
        <span>
          <label for={nm}>{props.label}</label>
          <select name={nm} value={props.selectValue} onChange={onchange} >
            {options}
          </select>
        </span>
    )
  }
}
export default DropdownValue;
