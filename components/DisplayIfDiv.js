
// DisplayIfDiv accepts props `condition:function`, `children:list(component)`, and `other:string` (optional).
// It wraps a div around its children and switches its display state between `none` if the condition prop
// evaluates to false, and the value of its `other` prop if it evals to true. In other words,
// it shows and hides the children in the sense of display:none. The `other` prop defaults to "block".
// DisplayIf should be written as
// - <DisplayIfDiv condition={fn} other="...">
// -  child1 ... childK
// - </DisplayIfDiv>
// A similar component sets visibility.

function DisplayIfDiv(props) {
    let other = 'block';
    if (props.other !== null) {
        other = props.other;
    }
    return (
        <div style={{display: props.condition() ? other : 'none'}}>
            {props.children}
        </div>
    )
}

export default DisplayIfDiv;
