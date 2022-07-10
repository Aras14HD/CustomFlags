var fs = require('fs');
var files = fs.readdirSync('flags')
files = files.map((file) => {return {name: file.replace(".svg", ""), svg: fs.readFileSync("flags/" + file).toString("utf-8")}})
fs.writeFileSync("flags.js", "let presets = " + JSON.stringify(files))