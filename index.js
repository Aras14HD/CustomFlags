var selected = [];
var available = [];

getPresets();
displayList();

function displayList() {
    let list = document.getElementById("selection");
    list.innerHTML = available.map(({name, svg}) => {
        return `<div class="flag" onclick="switchPlace(event)" draggable="true" ondragstart="drag(event)" id="${name}"> \n  <svg height="20pt" width="20pt" id="${name}">${svg}</svg>  ${name} \n    </div>`;
    }).reduce((p, c) => p + c);

}

function getPresets() {
    available = presets;
}

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

function saveFlag() {
    let svg = document.getElementById("flag").innerHTML;
    let name = document.getElementById("saveName").value;
    download(svg, name + ".svg", "text/svg+xml");
}

function composeFlag() {
    document.getElementById("flag").innerHTML = selected.length > 0 ? selected.length > 1 ? selected.reduce((p, c) => (p.svg ? p.svg : p) + c.svg) : selected[0].svg : "";
}

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
