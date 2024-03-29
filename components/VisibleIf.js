
// VisibleIf accepts props `condition:function`, `children:list(component)`, and span:boolean (optional). It wraps
// the children in a div (default) or span (if span prop is true)
// and sets the visibility style of the span to `visible` if the prop evals to true, else to `hidden`.
// It should be written as
// - <VisibleIf condition={fn}>
// -  child1 ... childK
// - </VisibleIf>
// A similar component can set display properties.

function VisibleIf(props) {
    if (props.span === true) {
        return (
            <span style={{visibility: props.condition() ? 'visible' : 'hidden'}}>
            {props.children}
        </span>
        )
    } else {
        return (
            <div style={{visibility: props.condition() ? 'visible' : 'hidden'}}>
            {props.children}
        </div>
        )
    }
}

export default VisibleIf;
