
import { useState, useEffect } from 'react';
import Button from "./Button";
import HButtons from "./HButtons";
import GridLayout from "./GridLayout";
import SlidesNavigator from "./SlidesNavigator";

// TreeNavigator is a stateful component that displays and navigates through a linked structure whose objects have
// properties named title:string, and either slides or nodes, both list(object) where the objects in the list satisfy
// the description just given. The objects in a nodes list should match the description here, IOW they should be navigable
// nodes of a tree as defined here. The objects in a slides should be suitable for passing to a SlidesNavigator; see the
// docs there for details.
// With respect to navigation, an item with slides represents a leaf node -- although when active the SlidesNavigator provides
// actions to navigate through it, it's a leaf to TreeNavigator. Whereas nodes items represent non-leaf nodes of the tree.
// When active, TreeNavigator presents such nodes as a list of clickable buttons labeld with the title of each child.
// TreeNavigator accepts props `tree:object`, `width:integer`, `height:integer`, `active:object` (optional).
// The active prop can be used to set the active node. The tree object has the title prop and either slides or nodes.
function TreeNavigator(props) {
    const [curTitle, setCurTitle] = useState("")
    const [curpath, setCurpath] = useState([props.tree])
    const active = curpath[curpath.length - 1]

    console.log("TN :", props, curTitle, active)
    useEffect(() => {
        if (props.tree !== null) {
            setCurTitle(props.tree.title);
            if (curTitle !== props.tree.title) setCurpath([props.tree])
        }
    }, [props.tree])
    if (props.tree === null || active === null) return "nothing to show";
    // handle click on path
    function pathClick(pathinx) {
        setCurpath(curpath.slice(0, pathinx+1))
    }
    // click handler for nodes buttons, update path and set active node
    function setActive0(inx) {
        const newnode = active.nodes[inx]
        setCurpath(curpath.concat([newnode]))
    }
    // Arg will be a list(object); create a page to display them
    function displayNodes(nodes) {
        return nodes.map((nd, inx) => {
            return <Button label={nd.title} clickfn={() => setActive0(inx)} />
        });
    }
    function displayPath() {
        return <HButtons menulabels={curpath.map(obj => obj.title)} clickfn={pathClick} />
    }
    if ('slides' in active) {
        return (
                <GridLayout columns={"1fr"} width={props.width}>
                    {displayPath()}
                    <SlidesNavigator slides={active.slides} />
                </GridLayout>
            )
    } else {
        // create a page of buttons from the titles of the nodes
        return (
            <GridLayout columns={"1fr"} width={props.width}>
                {displayPath()}
                {displayNodes(active.nodes)}
            </GridLayout>
        )
    }
}

export default TreeNavigator;

