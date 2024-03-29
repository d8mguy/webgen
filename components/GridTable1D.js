
// GridTable1D accepts props `data:list(T)`, `width:string`, `colorfn:function` (optional),
// `colors:list(color)` (optional but required if colorfn is defined).
// It implements a table using the 'grid' display format with a single column width pixels wide.
// Data is rows. The colorfn function, if supplied, gets called on each row with contents and index,
// it should return -1 to leave color unchanged, else an index into the colors array.
function GridTable1D(props) {
  function spanify(tbldata) {
    let rslt = [];
    for(let i = 0; i < tbldata.length; i++) {
      const row = tbldata[i];
      let bgcolor = 'inherit';
      if(props.colorfn !== undefined) {
        let inx = props.colorfn(row, i);
        if(inx !== undefined && inx >= 0) bgcolor = props.colors[inx];
      }
      rslt.push(<span style={{backgroundColor:bgcolor}} key={i}> {row} </span>)
    }
    return rslt;
  }
  return (
    <div className="dataTable" style={{width:props.width, gridTemplateColumns:'1fr'}} >
      {spanify(props.data)}
    </div>
  )
}
export default GridTable1D;
