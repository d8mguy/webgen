
import React from "react";
// GridTable accepts props `data:list(list(T))`, `width:string`, `columnWidths:string`, `tableLabel:string` (optional),
// `colorfn:function` (optional), `colors:list(color)` (optional but required if colorfn is defined), children:list(component).
// It implements a table using the 'grid' display format with relative column widths given in the
// columnWidths array, which has integers in fr units. The whole thing is set to be width pixels wide.
// Assumes data is rows of columns, so all its inner lists are same length. The colorfn function, if
// supplied, gets called on each row with contents and index, it should return -1 to leave color unchanged,
// else an index into the colors array.
function GridTable(props) {
  function spanify(tbldata) {
    let rslt = [];
    for(let i = 0; i < tbldata.length; i++) {
      const row = tbldata[i];
      let bgcolor = 'inherit';
      if(props.colorfn !== undefined) {
        let inx = props.colorfn(row, i);
        if(inx !== undefined && inx >= 0) bgcolor = props.colors[inx];
      }
      for(let j = 0; j < row.length; j++) {
        rslt.push(<div style={{backgroundColor:bgcolor}} key={i*row.length+j}>{row[j]}</div>);
      }
    }
    return rslt;
  }
  if (props.tableLabel !== undefined) {
    return (
        <div width={props.width}>
          <div style={{textAlign: "center"}}>{props.tableLabel}</div>
          <div className="dataTable" style={{width:props.width, display:"grid", columnGap:"20px", gridTemplateColumns:props.columnWidths}} >
            {spanify(props.data)}
          </div>
        </div>
    )
  } else {
    return <div className="dataTable" style={{width:props.width, display:"grid", columnGap:"20px", gridTemplateColumns:props.columnWidths}} >
      {spanify(props.data)}
    </div>
  }
}
export default GridTable;
