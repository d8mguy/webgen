
import React, {useEffect, useState} from 'react';
import { Explanatory } from "./Explanatory";
import Textbox from "./Textbox";

// FileSelect is intended for the odd purpose of selecting a local file that a localhost
// server can open. Thus, it includes a standard html input type=file selector but also extra hair.
//
// FileSelect accepts props `label:string`, `modalLabel:string`, `filepath:string`,
// `clickfn:submitter`, `filter:string` (optional).
// It presents as a button with the contents of `label` which when clicked, causes an
// input of type file (ie a file selector) to become visible.  When you select a file, it
// puts up a small modal dialogue asking you to type the path of the chosen file and whose
// dismiss button is labeled with modalLabel. The modal dialogue box is
// needed since for security reasons, the file input won't give you that. Once you hit
// the dismiss button, it calls the clickfn with two arguments: the path and the filename.
//
// FileSelect requires classes ModalDlg and FileSelect for css purposes.

function FileSelect(props) {
    const [modalActive, setModalActive] = useState(false);
    const [filename, setFilename] = useState("");
    const [filepath, setFilepath] = useState(props.filepath);
    function changed(e) {
        let fnstrg = e.target.value;
        if (fnstrg.substr(0, 12) == "C:\\fakepath\\") fnstrg = fnstrg.substr(12);
        setFilename(fnstrg);
    }
    function getFilepath1() {
        // console.log('getFilepath1');
        const fullpath = filepath.slice(-1) == '/' ? filepath : filepath + '/';
        props.clickfn(fullpath, filename);
        setModalActive(false);
        setFilename('');
    }
    useEffect(() => {
        if (filename !== '') setModalActive(true);
    }, [filename]);
    /* in FocusTrap:   */
    return (
        <div>
            { modalActive ?
                <div className="ModalDlg" >
                    Please enter the path for this file:
                    <Explanatory text="Browsers won't send file paths for security reasons" />
                    <br/>
                    <Textbox
                        changefn={e => setFilepath(e.target.value)}
                        size="50"
                        value={filepath} />
                    <br/>
                    <button style={{padding:"5px"}} onClick={e => getFilepath1()}>{props.modalLabel}</button>
                </div>
                : ''
            }
            <label htmlFor="__v1" className="FileSelect">
                {props.label}
                <input id='__v1' required
                       style={{display:'none'}}
                       type='file'
                       accept={props.filter}
                       onChange={e => changed(e)}  />
            </label>
        </div>
    )
}

export default FileSelect;