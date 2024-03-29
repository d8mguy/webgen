
// VisibleIfDiv accepts props `condition:function` and `children:list(component)`. It wraps the children in a span
// and sets the visibility style of the span to `visible` if the prop evals to true, else to `hidden`.
// This is exactly the same as VisibleIf except it creates a div for props.children instead of a span.
// It should be written as
// - <VisibleIfDiv condition={fn}>
// -  child1 ... childK
// - </VisibleIf>
// A similar component can set display properties.

function VisibleIfDiv(props) {
    return (
        <div style={{visibility: props.condition() ? 'visible' : 'hidden'}}>
            {props.children}
        </div>
    )
}

export default VisibleIfDiv;
