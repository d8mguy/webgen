
import React from "react";
import FlexWrap from "./FlexWrap";

// HButtons accepts props `clickfn:function`, `menulabels:list(string)`, `values:list(integer)` (optional),
// `selected:integer` (optional), `label:string` (optional), `labelPosition:string` (optional), `width:string` (optional).
// It implements a horizontal list of the menulabels; the clickfn's argument is the value of the corresponding element
// of the values list. If values is not supplied, it's set to 0...menulabels.count.
// Informally, this looks like a simple version of what's sometimes called a nav bar or menu bar; if props.selected is supplied
// it can be emphasized with an appropriate definition of class HButtonSel (vs HButton).
// If props.label is supplied, it is added as non-clickable text to the left of the buttons or, if props.labelPosition === 'right',
// to the right.
// Summarizing the needed classes for css:
// HButtons styles the overall component
// HButton styles buttons that are unselected but active
// HButtonSel styles buttons that are selected
// HBLeftLbl styles unselectable buttons on the left
// HBRightLbl styles unselectable buttons on the right
function HButtons(props) {
    //console.log("HB:", props.label, props.menulabels)
    const values = props.values === undefined ? [...Array(props.menulabels.length).keys()] : props.values;
    function clickLocal(inx) {
        return props.clickfn(values === undefined ? inx : values[inx]);
    }
    const w = props.width === undefined ? "inherit" : props.width;
    let buttons = props.menulabels.map((lbl, inx) => {
        return <button
                 className={inx === props.selected ? 'HButtonSel' : 'HButton'}
                 onClick={() => clickLocal(inx)}>
            {lbl}
        </button>
    });
    if (props.label !== undefined) {
        let lblstyle = 'HBLeftLbl';
        if (props.labelPosition === 'right') lblstyle = 'HBRightLbl';
        if (lblstyle === 'HBLeftLbl') buttons.unshift(<span className={lblstyle}>{props.label}</span>)
        else buttons.push(<span className={lblstyle}>{props.label}</span>)
    }
    return (
        <FlexWrap className='HButtons' dir="row" width={w} >
        {buttons}
        </FlexWrap>
    );
}

export default HButtons;
