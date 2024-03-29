import VisibleIf from "./VisibleIf.js";
import {
    Line,
    ComposedChart,
    Scatter,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Legend,
    LabelList, Tooltip
} from "recharts";
import React, {useState} from "react";
import UpdownDialH from "./UpdownDialH";
import FlexWrap from "./FlexWrap";
import './App.css'
import Checkbox from "./Checkbox";
import Boxspring from "./Boxspring";

function SquareFilled(props) {
    let wh = "24"
    let color = props.color === undefined ? "currentColor" : props.color;
    if (props.size !== undefined) wh = props.size;
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={wh} height={wh} viewBox="0 0 24 24" fill="none"
             stroke={color} strokeWidth="2" strokeLinecap="butt"
             strokeLinejoin="miter">
            <rect width={"24"} height={"24"} fill={color}/>
        </svg>
    )
}
// Return svg to draw a small example of the dashstring argument, for creating legends.
function iconifyDash(dashstring) {
    //console.log("IDsh", dashstring)
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 20 15" fill="none"
             stroke="black" strokeWidth="1" strokeLinecap="butt">
            <line x1="0" y1="8" x2="20" y2="8" strokeDasharray={dashstring}/>
        </svg>
    )
}

// Return svg to draw a small example of the shapename argument, for creating legends.
function iconifyShapes(shapename) {
    let shapesvg = []
    if (shapename === "circle") shapesvg.push(<circle cx="7.5" cy="7.5" r="4" fill="black" />)
    else if (shapename === "diamond") shapesvg.push(<polygon points="4,7.5, 7.5,2, 11,7.5, 7.5, 13" fill="black" />)
    else shapesvg.push(<line x1="7.5" x2="7.5" y1="1" y2="14" strokeWidth="4" />, <line x1="1" x2="14" y1="7" y2="7" strokeWidth="4" />)
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none"
             stroke="black" strokeWidth="1" strokeLinecap="butt">
            {shapesvg}
        </svg>
    )
}

// Given dd is an Array of objects with an x prop and multiple y0,...yk props, find the min and max value of the latter.
// Return a 2-Array of [min, max].
// This is used for clickables so the Y axis scale doesn't change as you click.
// Check if the y axis values are set manually, use them if so.
// Note: this needs to be updated to handle externals, it currently assumes only y0, y1...
function findMinmax(dd, setL, setH, loVal, hiVal) {
    if (dd.length === 0) return [0, 0]
    if (setL === true && setH === true)
        return [parseFloat(loVal), parseFloat(hiVal)]
    const yProps = [...Array(Object.keys(dd[0]).length - 1).keys()].map(i => 'y'+i);
    //console.log('yprops', yProps)
    let curmin = 1e30, curmax = -1e30;
    dd.forEach(row => {
        yProps.forEach(yval => { const dv = row[yval]; if (dv > curmax) curmax = dv; if (dv < curmin) curmin = dv })
    })
    // now add some "y axis intelligence"
    const diff = curmax - curmin       // should be non-neg
    let ratio = 1.0
    if (diff < 0.1) {
        curmax += diff/2
        curmin -= diff/2
    } else {
        ratio = curmin === 0 ? (curmax+0.5*diff)/(curmin+0.5*diff) : curmax/curmin;

    }
    // put in something to round to integer, 10, 100, etc.
    curmax = Math.round(curmax*11)/10
    if (curmin > 0) {
        if (curmin >= 200/ratio) curmin = 0
    }
    if (setL === true) curmin = parseFloat(loVal)
    if (setH === true) curmax = parseFloat(hiVal)
    //console.log("MC minmax:", curmin, curmax)
    return [curmin, curmax]
}

// The following color series stuff is experimental; if successful I'll extract it to a library
// Return a list with length=count of strings of the form "hsl(hue, A, B)" where A and B are interpolated in such
// a way as to generate a "coordinated" series of colors. Since the hue is constant, that's the anchor for the
// coordination. Works for up to 8 colors. Any more causes duplication.
// The hue should be a number in the range 0...360
function colorStrings(hue, count) {
    const arraySize = Math.min(count, 8);
    const offset = 25
    const factor = count >= 4 ? 9 : 21
    const sVals = [...Array(arraySize).keys()].map(x => Math.floor(offset+(x+0.5)*factor)); // percentages here
    const lVals = [...Array(arraySize).keys()].map(x => Math.floor(offset+(x+0.5)*factor));
    let rslt = [];
    let colors = [...Array(arraySize).keys()].map(x => `hsl(${hue}, ${sVals[x]}%, ${lVals[x]}%)`);
    while(count >= 8) {
        rslt.push(...colors);
        count -= arraySize;
        hue += 20
        if (hue > 360) hue -= 360;
        colors = [...Array(arraySize).keys()].map(x => `hsl(${hue}, ${sVals[x]}%, ${lVals[x]}%)`);
    }
    if(count > 0) {
        rslt.push(...colors.slice(0, count))
    }
    return rslt;
}

// Convert big numbers to "K" and "M" formats
function tickfmtr(tickval) {
    let absval = Math.abs(tickval)
    let suffix = ""
    if (absval > 10000) {
        absval /= 1000
        suffix = "K"
    }
    if (absval > 10000) {
        absval /= 1000
        suffix = "M"
    }
    if (tickval < 0) absval = -absval
    return String(Math.round(absval)) + suffix
}

// RechartWrapper0 accepts props `w:integer`, `h:integer`, `params:object`, `data:object`.
// It wraps the Recharts calls for non-interactive charting (except for UpdownDialH changefn, which handles click interaction & is local).
// It was developed for perfsis frontend and uses the ChartDesc and ChartData types defined there, for params and data
// respectively. Props.params will be a ChartDesc and props.data will be a ChartData.
// It returns gracefully if props.params isn't defined; it assumes that if it is defined, so is props.data.
// ChartData is pretty complicated, it allows for multiple parts and each part can have multiple data series. Details below.
// We handle Line, Bar, and Scatter ("dot") plots, single and multiple dataseries. In fact, two kinds of multiple:
// For multiple outputs and for what I call multiseries, where some dimension (of the cube we're showing) is enumerated
// in a series. And we offer dimensional enumeration by "clicking", which means putting a control at the bottom that lets you
// move at will among the values of that dimension.
// In case of two simultaneous multiples (ie outputs and multiseries), we distinguish the outputs by dashing or shape.
// (Note that UI must restrict Bar option in case of both.)
// Otherwise, elements of a series are always distinguished by a color. The colors are selected by varying saturation
// and lightness in the hsl color space, given a particular hue.
// Part 0 of props.data is always from the perfspec proper and parts beyond that are from external series. These can have
// multiple outputs but not multiseries or clickables. So if there are clickables, higher parts will be drawn the same
// for all of them.
// The parts (perfspec and externals) are described in the ChartDesc (params) and the data is in the series slot of the
// data (ChartData). Each series is in separate rows of the data.series Array and while the x slots of each row all address
// the same thing, the y slots (ie javascript object properties) are named y0...yk for part 0, ya0...yak for part 1, etc.
// Recharts wants a single data array which is passed in props.data.series. It selects from this for each different series
// element (a Line, Bar, or Scatter) those elements matching both x and y props.
function RechartWrapper0(props) {
    const [clickInx, setClickInx] = useState(0);
    const [ttActive, setTtActive] = useState(false);
    if (!('parts' in props.params)) return (
        "No chart selected"
    )
    let ChartElt = Line;        // the default
    let darray = props.data.series;
    console.log("RW0;data", props.data, typeof darray, props.params)
    if (darray.length < 1) {
        return "No Chart!"
    }
    let eltType = typeof darray[0].x === "string" ? "category" : "number";
    const geom = props.params.parts[0].appnc.geom;
    const outdash = ["", "5", "12 2", "2 12"];        // dashing pattern for multiple outputs

    if(geom === 'Bar') {
        ChartElt = Bar
        eltType = "category"
        darray = darray.map(d => { let x = Object.assign({}, d); x.x = d.x.toString(); return x })
    }
    else if(geom === 'Dot') {
        ChartElt = Scatter
    }
    let legend = {
        contents: [],
        lines: [],
        charcount: 0,
        linebreak: function(always) {
            if (always || this.charcount > 50) {
                this.lines.push(this.contents)
                this.contents = []
                this.charcount = 0
            }
        },
        colorItem: function(lbl, color) {
            this.charcount += lbl.length + 2
            this.contents.push(<span className="LegendItem" key={`item-${this.contents.length}`} style={{color:color}}>
                <SquareFilled size={14} />
                &nbsp;
                {lbl}
            </span>)
            this.linebreak(false)
        },
        shapeItem: function(lbl, shpinx) {
            const shapes = ["circle", "cross", "diamond"]
            const shapesvg = ChartElt === Line ? iconifyDash(outdash[shpinx]) : iconifyShapes(shapes[shpinx-1])
            this.charcount += lbl.length + 2
            this.contents.push(<span className={"LegendItem"}  key={`item-${this.contents.length}`}>{lbl} &nbsp; {shapesvg} </span>)
            this.linebreak(false)
        }
    }

    // Generate a single dataseries (line, dots, bars). It will select from the data in darray those pairs that include
    // 'x' and the 'y' annotation generated by multinx and partinx.
    function oneSeries(aColor, aWidth, ykey, shapeinx, lbllist) {
        const sda = outdash[shapeinx]
        const shp = ["circle", "circle", "cross", "diamond"][shapeinx]
        //console.log("1S:", aColor, ykey, shapeinx)
        return <ChartElt
            isAnimationActive={false} strokeDasharray={sda} shape={shp} stroke ={aColor} strokeWidth={aWidth} fill={aColor} dot={false} dataKey = {ykey}>
            {lbllist}
        </ChartElt>
    }

    let allSeries = [];     // accumulate the recharts component instantiations for all dataseries here
    // This generates nSeries dataseries distinguished by colors; shapeInx is usually 0 (default) but can be 1-3 to select a different shape.
    // The shapeInx is interpreted by oneSeries.
    function accumDataseries(partnum, colors, appnc, clickI, nSeries, incr, shapeInx) {
        if (props.params.outsAsAbscissa) {
            nSeries = 1
        }
        for (let i = 0; i < nSeries; i++) {
            let pfx = ''
            if (partnum > 0) pfx = 'abcdefghijk'[partnum-1]
            const minx = i*incr + clickI
            const cmpr = props.params.compareOptions
            let lblspec = []
            if (cmpr > 0) {
                let compareLabelsHere = false
                if (props.params.parts.length === 1) compareLabelsHere = (i === 0 && cmpr < 3) || (i === 1 && cmpr >= 3)
                else compareLabelsHere = (partnum === 0 && cmpr < 3) || (partnum === 1 && cmpr >= 3)
                //console.log("compare:", nParts, i, partnum, compareLabelsHere)
                if (compareLabelsHere) lblspec = <LabelList dataKey={"compare"} fontSize={10} position={"top"} />
            }
            allSeries.push(oneSeries(colors[i], appnc.thickness, 'y' + pfx + minx, shapeInx, lblspec))
        }
    }
    //console.log("RW0;0", props.data.multiElts)

    // set up legends before generating data series because legend length tells us about the CWS case
    // Note that we add the legend item for an external dataseries here instead of in the server
    const lgnd = props.data.legend
    const dualLegend = lgnd.length === 2 && typeof lgnd[1] === 'object'
    let cStrings = dualLegend ? props.data.legend[0] : props.data.legend.slice()
    let lgndColors = colorStrings(props.params.parts[0].appnc.hue, cStrings.length);
    if (props.params.parts.length > 1) {
        cStrings.push(props.params.parts[1].source)
        lgndColors.push(...colorStrings(props.params.parts[1].appnc.hue, 1))
        console.log("leg gen", dualLegend, props.data.legend, cStrings)
    }

    // Generate data series/chart items
    props.params.parts.forEach((part, partIndex) => {
        const appnc0 = part.appnc
        let multiCount = Math.max(props.data.multiElts.length, 1)
        const outCount = part.outputs.length
        // hackish for sure; this adjustment reflect CWS case
        if (outCount === 1 && multiCount === 1 && cStrings.length === 2) multiCount = 2
        const colors = colorStrings(appnc0.hue, multiCount);
        if (props.params.outsAsAbscissa) {
            accumDataseries(partIndex, colors, appnc0, clickInx * outCount, outCount, 1, 0)
        } else if (partIndex === 0) {
            if (multiCount > 1 && outCount > 1) {
                for (let i = 0; i < outCount; i++) {
                    accumDataseries(partIndex, colors, appnc0, i + clickInx * outCount * multiCount, multiCount, outCount, i+1)
                }
            } else accumDataseries(partIndex, colors, appnc0, clickInx * multiCount, multiCount, 1, 0)
        } else accumDataseries(partIndex, colors, appnc0, 0, 1, 1, 0)
    })

    // now generate legends
    cStrings.forEach((strg, inx) => {
        legend.colorItem(strg, lgndColors[inx])
    })
    if (dualLegend) {
        legend.linebreak(true)
        props.data.legend[1].forEach((lbl, inx) => {
            legend.shapeItem(lbl, inx+1)
        })
    }
    legend.linebreak(true)      // clear

    // Legend generation has possibly generated multiple lines; format them now.
    let legendJSX = []
    const legendLinesJSX = legend.lines.map(ll => <FlexWrap dir={"row"} justify={"space-around"}>{ll}</FlexWrap>)
    const legendCode = <FlexWrap dir={"column"} justify={"center"}>{legendLinesJSX}</FlexWrap>
    legendJSX = [<Legend verticalAlign={'top'} height={25} content={() => legendCode} />]
    const minmax = findMinmax(darray, props.params.setYAxisLow, props.params.setYAxisHigh, props.params.YAxisLow, props.params.YAxisHigh)
    const tooltip = ttActive ? <Tooltip isAnimationActive={false} /> : "";
    //console.log("ready:", allSeries, props.data.title)
    // Return a chart and possibly an UpdownDialH for clicking
    return (
        <>
            <div style={{textAlign:"center"}}>{props.data.title}</div>
            <ComposedChart data={darray} width={props.w} height={props.h} >
                <XAxis dataKey={"x"} type={eltType} label={{ value: props.data.abscissaDesc, position: 'insideBottom', offset: 0}} />
                <YAxis domain={minmax} tickFormatter={tickfmtr} />
                {tooltip}
                {legendJSX}
                {allSeries}
            </ComposedChart>
            <Boxspring springH={"All"} minwidth={"400px"} maxwidth={"400px"}>
                <VisibleIf condition={() => props.data.clickElts.length > 1}>
                    <UpdownDialH labels={props.data.clickElts} curIndex={clickInx} changefn={value => setClickInx(value)}/>
                </VisibleIf>
                <Checkbox label={"Tooltips?"} checked={ttActive} clickfn={ev => setTtActive(!ttActive)} />
            </Boxspring>
        </>
    )
}


export default RechartWrapper0;
