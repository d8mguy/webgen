
import React, { useState } from 'react';

// ChainClick accepts props `icons:list(Component)`, `clickfn:submitter`.
// It implements a FSM that keeps track of its state internally and displays the "icon"
// corresponding to that state. The state advances (circularly) each time it is
// clicked, the built in click handler also calls the user supplied function in
// the clickfn prop. It calls with the event and current (pre-increment)
// value of the state. The icons prop can be a list of icons but anything that draws in
// a rectangle will work.
// Note that a ChainClick with 2 icons implements a toggle.
function ChainClick(props) {
  const [index, setIndex] = useState(0);
  function handleClick(e) {
    props.clickfn(e, index);
    setIndex(props.icons.length === index+1 ? 0 : index+1);
  }
  return (
    <span onClick={(e) => handleClick(e)}>{props.icons[index]}</span>
  )
}

export default ChainClick;
