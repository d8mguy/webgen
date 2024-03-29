
import React  from 'react';

// UpdownDialH accepts props `changefn:submitter`, `curIndex:integer`, `min:integer` (optional), `max:integer` (optional),
// `labels:list(string)` (optional).
// It implements an up/down counter that reports changes to  curIndex via changefn. Either min and max must both be present or labels.
// If labels is present, min and max are 0 and length(labels)-1; if omitted, it is set to a list of string labels of the numbers
// between min and max. (Step size always 1.)
function UpdownDialH(props) {
    let inx0 = 0;
    let labels = props.labels;
    //console.log("UDD:", props.labels, props.min, props.max)
    if (labels === undefined) labels = [...Array(1 + props.max-props.min).keys()].map(inx => (inx+props.min).toString())
    function up() {
        if(props.curIndex < labels.length - 1) props.changefn(props.curIndex + 1);
    }
    function down() {
        if(props.curIndex > 0) props.changefn(props.curIndex - 1);
    }
    //console.log("UDD:", labels)
    return (
        <span style={{display: "inline-block"}}>
            <input type='button' value={"-"} onClick={down}/>
            <input type='text' size={12} style={{textAlign:'center'}} readOnly={true} value={labels[props.curIndex]} />
            <input type='button' value={"+"} onClick={up}/>
        </span>
    )
}
export default UpdownDialH;
