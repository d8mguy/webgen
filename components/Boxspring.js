
import React from 'react';

// Boxspring is a different way to think about the css flexbox model.
// It accepts props `children:list(component)`, `dir:string` (optional), `springH:string` (optional), `springV:string` (optional),
// `expandH:boolean` (optional), `expandV:boolean` (optional), `minwidth:string` (optional), `minheight:string` (optional),
// `maxwidth:string` (optional), `maxheight:string` (optional).
// The dir corresponds to row or column options to flex-direction but instead of "row" and "column" you say "H" and "V".
// Saying dir~"H" translates to flex-direction:row. The springV and H each accept 6 argument values, which
// correspond to 5 distinct alignment patterns. These are L, R, LR, Center, All, Inner. The model here is that some of the
// boundaries of the children are fitted with springs that push the child boxes in various ways. The springH springs are
// on boundaries that are vertical and hence, that are disposed horizontally. And the springV springs are on horizontal
// boundaries, which are disposed vertically. We use the same names for springV's but L corresonds to top and R to bottoms.
// Normally, you care most about springs pushing in the same direction as your
// dir, so for dir~"H" you set springH~"All" to put springs on all the walls pushing horizontally. This corresponds to
// justify-contents:space-around. Similarly, "L" corresponds to right-justification (since only the leftmost boundary has
// a spring), "R" to left-justification, "LR" or "Center" to centering, since both left and right walls have springs. LR
// means springs on left and right walls. (Note that the usual naming paradigm tells "where are the springs"; only "Center"
// doesn't follow it.) "Inner" is the converse of LR -- springs everywhere except the left and right walls, translating to
// space-between. The expandH and expandV options handle the "spread" css values for align-items and justify-items. If the
// corresponding expand is true, the relevant -items css property gets set to "spread". This is different from css where
// spread is the default. (For Box, the default value of expandH and expandV is false.) When not spread, the spring property
// of the relevant direction is used.
//
// Note that all props are optional. Here are the defaults:
// dir      H
// springH  R
// springV  R
// expandH  false
// expandV  false
//
// The width and height props default to "inherited"
//
// More extensions of the basic springiness metaphor are possible and might be implemented at some point.
function Boxspring(props) {
    const dir = props.dir === undefined ? "H" : props.dir
    const springH = props.springH === undefined ? "R" : props.springH
    const springV = props.springV === undefined ? "R" : props.springV
    function setItems(propsval, springval, strg) {
        let tmp = propsval === true ? "stretch" : (propsval === undefined ? "normal" : "")
        if (tmp === "") if(springval !== "All" && springval !== "Inner") tmp = springval; else tmp = "normal";
        console.log("setItems", strg, propsval, springval, tmp)
        return tmp
    }
    let cssExpandH = setItems(props.expandH, dir === "H" ? springV : springH, "H")
    let cssExpandV = setItems(props.expandV, dir === "H" ? springV : springH, "V")
    const widthn = props.minwidth === undefined ? "inherited" : props.minwidth
    const heightn = props.minheight === undefined ? "inherited" : props.minheight
    const widthx = props.maxwidth === undefined ? "inherited" : props.maxwidth
    const heightx = props.maxheight === undefined ? "inherited" : props.maxheight
    const cssdir = dir === "H" ? "row" : "column"
    // springmapK and springmapV are pll arrays -- maps are too much hassle
    const springmapK = ["L", "R", "LR", "Center", "All", "Inner"]
    const springmapV = ["end", "start", "center", "center", "space-around", "space-between"]
    let tmp = springmapK.indexOf(springH)
    const cssAlignH = props.springH === undefined || tmp < 0 ? "normal" : springmapV[tmp]
    tmp = springmapK.indexOf(springV)
    const cssAlignV = props.springV === undefined || tmp < 0 ? "normal" : springmapV[tmp]
    tmp = springmapK.indexOf(cssExpandH)
    cssExpandH = springmapV[tmp]
    tmp = springmapK.indexOf(cssExpandV)
    cssExpandV = springmapV[tmp]
    //console.log("dir", cssdir, "width", width, "height", height, "springV", cssAlignV, "springH", cssAlignH, "expandV", cssExpandV, "expandH", cssExpandH)
    if (dir === "H") {
        return (
            <div style={{display:"flex", flexDirection:cssdir, minWidth:widthn, minHeight:heightn, maxWidth:widthx, maxHeight:heightx,
                justifyContent:cssAlignH, justifyItems:cssExpandH, alignContent:cssAlignV, alignItems: cssExpandV}} >
                {props.children}
            </div>
        )
    } else {
        return (
            <div style={{display:"flex", flexDirection:cssdir, minWidth:widthn, minHeight:heightn, maxWidth:widthx, maxHeight:heightx,
                justifyContent:cssAlignV, justifyItems:cssExpandV, alignContent:cssAlignH, alignItems: cssExpandH}} >
                {props.children}
            </div>
        )
    }
}

export default Boxspring;
