
import React from 'react';

// Button is a very minimal wrapper for the html button element.
// It accepts props `label:string`, `clickfn:submitter`, `disabled:boolean` (optional).
// Clickfn gets the event.
// If present, disabled should be a boolean expr that generates true to disable the button.

function Button(props) {
    if(props.disabled !== undefined) {
        return (
            <button onClick={e => props.clickfn(e)} disabled={props.disabled} >
                {props.label}
            </button>
        )
    } else {
        return (
            <button onClick={e => props.clickfn(e)}>
                {props.label}
            </button>
        )
    }
}

export default Button;