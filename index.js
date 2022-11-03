var selected = [];
var available = [];
const { Canvg } = require('canvg');

getPresets();
displayList();

/**
 * Adds all available Flags to the selection
 */
function displayList() {
    let list = document.getElementById("selection");
    list.innerHTML += available.map(({name, svg}) => {
        return `<div class="flag" onclick="switchPlace(event)" draggable="true" ondragstart="drag(event)" id="${name}"> \n  <svg height="20pt" width="20pt" id="${name}">${svg}</svg>  ${name} \n    </div>`;
    }).reduce((p, c) => p + c);

}

/**
 * Fetches Flags from flags.js
 */
function getPresets() {
    available = presets;
}

/**
 * Adds Flag from an uploaded file
 *
 * @param {Event} ev - input event for file
 */
function addFlags(ev) {
    const reader = new FileReader();
    for (let i = 0; i < ev.target.files.length; i++) {
        let file = ev.target.files[i];
        reader.onload = (ev) => {
            available.push({name: file.name.replace(".svg", ""), svg: ev.target.result});
            displayList();
            composeFlag();
        };
        reader.readAsText(file);
    }
}

/**
 * Downloads the composed Flag as SVG
 */
function saveFlag() {
    let svg = document.getElementById("flag").outerHTML;
    let name = document.getElementById("saveName").value;
    download(svg, name + ".svg", "text/svg+xml");
}

/**
 * Downloads the composed Flag as PNG
 */
function saveAsPNG() {
    // Get values
    let width = document.getElementById("width").value;
    let height = document.getElementById("height").value;
    let svg = document.getElementById("flag");
    let name = document.getElementById("saveName").value;
    let uri = `data:image/svg+xml;base64,${btoa(new XMLSerializer().serializeToString(svg))}`;
    // Create a canvas and context
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")
    // Use canvg to render
    Canvg.from(ctx, uri).then((v) => {
        v.start();
        v.ready().then(() => {
            // Download
            const a = document.createElement("a")
            const quality = 1.0 // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality
            a.href = canvas.toDataURL("image/png", quality)
            a.download = name
            a.append(canvas)
            a.click()
            a.remove()
        })
    })
}

/**
 * Hides Flags in selection, that don't match the search
 *
 * @param {Event} ev - text input event
 */
function search(ev) {
    let s = ev.target.value;
    let nodes = document.getElementById("selection").childNodes.forEach((node) => {
        node.hidden = node.id && node.id != "search" ? (node.id.includes(s) ? false : true) : false;
    });
}

/**
 * Composes the SVG Flag into the View
 */
function composeFlag() {
    document.getElementById("flag").innerHTML = selected.length > 0 ? selected.length > 1 ? selected.reduce((p, c) => (p.svg ? p.svg : p) + c.svg) : selected[0].svg : "";
    updateSize()
}

/**
 * Updates the size of the Flag View
 */
function updateSize() {
    let width = document.getElementById("width").value;
    let height = document.getElementById("height").value;
    let flag = document.getElementById("flag");
    flag.viewBox.baseVal.width = width;
    flag.viewBox.baseVal.height = height;
}

/**
 * Sets selected to all selected Flags and then calls composeFlag
 */
function changeSelection() {
    selected = Array.from(document.getElementById("actives").children).map(node => available.find(({name}) => name === node.id));
    composeFlag();
}

function allowDrop(ev) {
    ev.preventDefault();
}
  
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}
  
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));

    changeSelection()
}

function dropFiles(ev) {
    ev.preventDefault();
    addFlags({target: ev.dataTransfer})
}

/**
 * Toggles the selection of the clicked Flag
 *
 * @param {Event} ev - Click event
 */
function switchPlace(ev) {
    let node = ev.currentTarget;
    let parent = node.parentNode.id;
    if (parent === "actives") {
        document.getElementById("selection").appendChild(node);
    } else {
        document.getElementById("actives").appendChild(node);
    }

    changeSelection();
}

/**
 * Downloads some Data
 *
 * @param {any} data - File content
 * @param {String} filename - Name of the File
 * @param {String} type - Filetype eg. text/svg+xml
 */
function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}
