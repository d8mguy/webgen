
// IncludeIf is the if statement for pagespecs. It accepts props `condition:function` and `children:list(component)`
// and includes its children if the condition prop evals to true.
// It should be written as
// - <IncludeIf condition={fn}>
// -  child1 ... childK
// - </IncludeIf>

function IncludeIf(props) {
    if(props.condition()) {
        return props.children
    } else {
        return ''
    }
}

export default IncludeIf;
