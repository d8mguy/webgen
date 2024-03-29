

// HueSelectSlider is a slider linked to a square that changes hue as the slider is moved, the changefn allows to send
// a value back to a client, which manages the state for props.value. It accepts props `changefn:function`, `value:integer`,
// `width:string` (optional).

function HueSelectSlider(props) {
    const wdth = (props.width === undefined) ? "inherit" : props.width;
    return (
        <input type="range"
               min={0} max={360}
               style={{border:"none", width:wdth, backgroundColor: `hsl(${props.value}, 80%, 40%)`}}
               value={props.value}
               onChange={v => props.changefn(v)}/>
    )
}

export default HueSelectSlider;
