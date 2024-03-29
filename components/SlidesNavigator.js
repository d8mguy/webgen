
import { useState } from 'react';
import HButtons from "./HButtons";
import { ArrowLeft, ArrowRight } from 'react-feather'

// SlidesNavigator accepts props `slides:list(object)`, `width:integer`, `height:integer`, `curIndex:integer` (optional).
// The objects in slides should be react objects that are displayable, they're displayed with a navigator started with
// curIndex.
// There is currently a dependency on react-feather for the arrow icons. So you need to include that in any npm tree whose
// webgen spec uses this component.
function SlidesNavigator(props) {
    const curinx0 = props.curIndex === undefined ? 1 : props.curIndex
    const [curinx, setCurinx] = useState(curinx0)
    let navlabels = props.slides.map((_, inx) => (inx+1).toString())
    navlabels.unshift(<ArrowLeft size={16}/>)
    navlabels.push(<ArrowRight size={16}/>)
    function localclick(inx) {
        if (inx === 0) {
            console.log("sn: ", curinx)
            if (curinx > 1) setCurinx(curinx - 1)
        } else if (inx === props.slides.length+1) {
            if (curinx < props.slides.length) setCurinx(curinx + 1)
        } else setCurinx(inx)
    }
    const navbar = <HButtons selected={curinx} menulabels={navlabels} clickfn={localclick} />
    return (
        <div style={{width: props.width}}>
            {navbar}
            <div style={{width: props.width, height: props.height}}>
                {props.slides[curinx-1]}
            </div>
        </div>
    )
}

export default SlidesNavigator;
