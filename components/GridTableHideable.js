
// GridTableHideable accepts props `data:list(list(T))`, `columnWidth:integer`, `hiddenColumns:function`.
// It implements a table using the 'grid' display format with fixed width, hideable columns.
// In grid css language, the gridTemplateColumns are all either 1fr or 0 (for hidden columns).
// Set column width with columnWidth prop; hiddenColumns is a (zero origin) list of column indices.
// Note that the width of the table will be nCols * props.columnWidth.
// Assumes data is rows of columns, so all its inner lists are same length, and hiddenColumns
// indices refer to these.
function GridTableHideable(props) {
  const nCols = props.data.length == 0 ? 1 : props.data[0].length;
  function spanify(tbldata) {
    let rslt = [];
    for(let i = 0; i < tbldata.length; i++) {
      const row = tbldata[i];
      for(let j = 0; j < row.length; j++) {
        rslt.push(<span key={i*row.length+j}> {row[j]} </span>);
      }
    }
    return rslt;
  }
  function gtcGenerate() {
    let gtc0 = Array(nCols).fill('1fr')
    props.hiddenColumns.forEach(inx => gtc0[inx] = '0')
    return gtc0.join(' ');
  }
  return (
    <div className="dataTable" style={{width:props.columnWidth * (nCols - props.hiddenColumns.length), gridTemplateColumns:gtcGenerate()}} >
      {spanify(props.data)}
    </div>
  )
}
export default GridTableHideable;
