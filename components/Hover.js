
// Wraps children with a span that reacts to mouseenter and mouseleave, thus lets you get specified behavior on hover
// over the wrapped element(s). Hover accepts props `enterfn:function`, `leavefn:function`, and `children:list(component)`.
//
// Note that there is no debouncing here. When I first tested this I thought I needed it but it turned out to be jumping
// around because text that came and went with hovering (via the enterfn and leavefn) changed the layout. If the widget(s)
// in props.children are protected from layout interactions with anything that changes due to hovering, debounce shouldn't
// be needed. But if not protected, then as far as I can tell, debounce doesn't help! (Or maybe I never got debounce truly working.)

function Hover(props) {
    return <span onMouseEnter={props.enterfn} onMouseLeave={props.leavefn} >
        {props.children}
    </span>
}

export default Hover;
