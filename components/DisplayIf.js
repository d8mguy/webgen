
// DisplayIf accepts props `condition:function`, `children:list(component)`, span:boolean (optional), and `other:string` (optional).
// It wraps a div (default) or span (if span prop is present and true) around its children and switches its display state
// between `none` if the condition prop
// evaluates to false, and the value of its `other` prop (which defaults to "block") if it evals to true. In other words,
// it shows and hides the children in the sense of display:none.
// DisplayIf should be written as
// - <DisplayIf condition={fn} other="...">
// -  child1 ... childK
// - </DisplayIf>
// A similar component sets visibility.

function DisplayIf(props) {
    let other = 'block';
    if (props.other !== null) {
        other = props.other;
    }
    if (props.span === true) {
        return (
            <span style={{display: props.condition() ? other : 'none'}}>
            {props.children}
        </span>
        )
    } else {
        return (
            <div style={{display: props.condition() ? other : 'none'}}>
            {props.children}
        </div>
        )
    }

}

export default DisplayIf;
