
import { useState } from 'react';

// Note: this adds a key prop to the official PopupTextarea, I'm not sure if it's helpful so I've kept this here just in case.

// PopupTextarea is a textarea that takes little screen space when it isn't being used.
// Therefore, it's useful for longer texts that you don't need to see all the time.
// It accepts props, `buttonText:string`, `key:string`, `text:string` (optional), `dismissfn:function`,
// `rows:integer` (optional = 2), `cols:integer` (optional = 25).
// It renders a button with the buttonText. Clicking on the button makes a
// textarea visible and gives it focus (its size can be set with props `rows` and
// `cols`).
//
// The idea is that you type into this textarea; the text is retained in the
// text property of state. When focus leaves the textarea, the internally supplied
// handler calls the `dismissfn` fn with this text; this is how to get it back to the
// parent.
//
// After the button has been clicked on and text has been set, hovering over
// the button causes the textarea to expose and focus without a click, so that it's
// easy to see what's in the otherwise hidden textarea.
//
// The role of the key prop is to allow for resetting the stateful behavior, ie whether the text has been entered or not.
// To "reuse" a PopupTextarea, simply change the value of the key you supplied.
function PopupTextarea(props) {
  const [value, setValue] = useState(props.text);
  const [anyClick, setAnyClick] = useState(false);
  const [hovered, setHovered] = useState('hidden');
  const [textset, setTextset] = useState(false);
  const [curKey, setCurKey] = useState("")
  function handleBlur() {
    props.dismissfn(value);
    setTextset(true);
  }
  function handleClick() {
    setAnyClick(true);
    setHovered('visible');
    setTextset(true);
  }
  function handleChange(e) {
    setValue(e.target.value);
  }
  function handleHover(e) {
    let visibility = 'hidden'
    if (e.type === 'mouseenter' && textset) {
      visibility = 'visible'
    }
    setHovered(visibility);
  }
  const nrows = props.rows || 2, ncols = props.cols || 25;
  if (curKey !== props.key) {
    setCurKey(props.key);
    setTextset(false);
  }
  if (props.text !== undefined && props.text !== "") setTextset(true);
  return (
    <>
      <span position="relative" style={{border: "2px", fontSize: "16px"}}>
        <button className="PopupTAButton" onMouseEnter={handleHover} onMouseLeave={handleHover} onClick={handleClick} >
          {props.buttonText}
        </button>
        <textarea
          position="absolute"
          style={{top:"-50px", left:"55%", visibility:hovered}}
          ref={(input) => { if(input != null && anyClick) { input.focus();}}}
          onChange={handleChange}
          onBlur={handleBlur}
          value={value}
          rows={nrows}
          cols={ncols}
        />
      </span>
    </>
  )
}

export default PopupTextarea;
