
import { useState } from 'react';

// Local "component" for the Explanatory icon. Accepts props `color:string`.
function GreenQ(props) {
    let color = "green";
    if (props.color !== undefined) color = props.color
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color}
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-help-circle">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    )
}

// Explanatory gives popup text, it's intended to provide brief explanations.
// It accepts props `text:string`, `width:string` (optional),`height:string` (optional),
// `children:list(component)` (optional), `position:string` (optional).
// The position relates to whether the icon is left or right of any children; makes no sense unless using children.
// The width and height affect formatting of the text itself.
// It uses a fixed icon, a question mark in a circle,
// both green. Click once to get the text, again to dismiss it.
// If invoked with children, it wraps them in a span, with the Explanatory either to the left (default)
// or right (if position="right").
// There's a class Explanatory in the css file that this component needs to work properly.

function Explanatory(props) {
  const [shown, setShown] = useState('none');
  function clicked() {
    let s0 = 'block';
    if (shown == 'block') s0 = 'none';
    setShown(s0);
  }
    const w = props.width === undefined ? "150" : props.width;
    const h = props.height === undefined ? "150" : props.height;
  if(props.children === undefined) {
    return (
        <span className="Explanatory" onClick={clicked}>
            <GreenQ/>
          <div className="ExplanatoryText" style={{display:shown, width:w, height:h, position:"absolute", zIndex:5, top: "20px", left: "20px"}} > {props.text}
          </div>
        </span>
    )
  } else if(props.position === "right") {
        return (
            <span>
              {props.children}
              <div className="Explanatory">
                <img src={<GreenQ/>} tabIndex="0" alt="explanatory icon" onClick={clicked} />
                <div className="ExplanatoryText" style={{display:shown}} > {props.text} </div>
              </div>
            </span>
        )
  } else {
    return (
        <span>
          <div className="Explanatory">
            <img src={<GreenQ/>} tabIndex="0" alt="explanatory icon" onClick={clicked} />
            <div className="ExplanatoryText" style={{display:shown}} > {props.text} </div>
          </div>
          {props.children}
        </span>
    )
  }
}

export { GreenQ, Explanatory };
