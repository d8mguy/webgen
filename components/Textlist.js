
// Textlist accepts props `values:list(string)`, `spacing:string` (optional).
// It implements an unordered list (ie html `ul` and `li` tags); spacing translates to line-height if present
function Textlist(props) {
  let items = props.values.map(x => <li>{x}</li>);
  if(props.spacing === undefined) {
    return <ul>{items}</ul>
  } else {
    return <ul style={{lineHeight: props.spacing}}>{items}</ul>
  }
}
export default Textlist;
