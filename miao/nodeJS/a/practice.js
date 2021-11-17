// 实现一个函数 listFiles(path)，返回 path 路径下每个文件的完整路径
let path = require("path");
let fs = require("fs");
let fsp = fs.promises;

// version: callback
function listFileCallback(dirPath, callback) {
  dirPath = path.resolve(dirPath);
  fs.readdir(dirPath, {withFileTypes: true}, (err, entries) => {
    if(entries.length == 0) {
      callback([]);
    }
    let paths = [];
    for(let entry of entries) {
      let fullPath = path.join(dirPath, entry.name);
      if(entry.isFile) {
        paths.push(fullPath);
        console.log(fullPath)
      } else {
        console.log("f")
        listFileCallback(fullPath, files => {
          paths.push(files);
          callback(paths);
        });
      }
    }
  });
}
listFileCallback(".", result => {console.log(result)});