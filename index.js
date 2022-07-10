var selected = [];
var available = [];

getPresets();
displayList();

function displayList() {
    let list = document.getElementById("selection");
    list.innerHTML = available.map(({name, svg}) => {
        return `<div class="flag" draggable="true" ondragstart="drag(event)" id="${name}"> \n  <svg height="20pt" viewBox="0 0 500 300" preserveAspectRatio="none" id="${name}">${svg}</svg>  ${name} \n    </div>`;
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
            available.push({name: file.name.replace(".svg", ""), svg: ev.target.result.replace(/<\/?svg(([^>])+)?>/g, "")   });
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
    document.getElementById("flag").innerHTML = selected.length > 0 ? selected.length > 1 ? selected.reduce((p, c) => p.svg + c.svg) : selected[0].svg : "";
}

function changeSelection(ev) {
    let targetId = ev.target.id;
    let flag = available.find(({name}) => name === ev.dataTransfer.getData("text"));
    if (targetId === "actives") {
        selected.push(flag);
    } else {
        selected = selected.filter((item) => item !== flag);
    }
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

    changeSelection(ev)
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
