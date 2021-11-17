// #!/usr/bin/env node
// function prime(number) {
//   if(number < 2) {
//     return "Invalid";
//   } else {
//     let primeSet = [];
//     for(let i = 2; i <= number; i++) {
//       let count = 0;
//       for(let j = 1; j <= i; j++) {
//         if(i % j == 0) {
//           count++;
//         }
//       }
//       if(count == 2) {
//         primeSet.push(i);
//       }
//     }
//     return primeSet;
//   }
// }
// function analysis(para) {
//   let primeSet = prime(para);
//   if(typeof primeSet == "string") {
//     return primeSet;
//   } else {
//     let str = `${para}:`;
//     for(let i = 0; i < primeSet.length;) {
//       if(para % primeSet[i] == 0) {
//         str = str + " " + primeSet[i];
//         para = para / primeSet[i];
//         if(para == 1) {
//           break;
//         }
//         i = 0;
//       } else {
//         i++;
//       }
//     }
//     console.log(str);
//   }
// }
// analysis(process.argv[2]);

// let fs = require("fs");
// // 封装 readFile
// function readFile(...args) {
//   return new Promise((resolve, reject) => {
//     fs.readFile(...args, (err, result) => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve(result);
//       }
//     });
//   });
// }
// // 封装 writeFile
// function writeFile(...args) {
//   return new Promise((resolve, reject) => {
//     fs.writeFile(...args, err => {
//       if (err) {
//         reject(err);
//       } else {
//         resolve();
//       }
//     });
//   });
// }
// // 将回调模式的异步函数封装为 promise 风格的函数
// function promisify(callback) {
//   return (...args) => {
//     return new Promise((resolve, reject) => {
//       callback(...args, (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result);
//         }
//       });
//     });
//   }
// }
// // 将 promise 风格的函数封装为回调模式的异步函数
// function callbackify(promisify) {
//   return (...args) => {
//     let callback = args.pop();
//     promisify(...args).then(result => {
//       callback(null, result);
//     }, reason => {
//       callback(reason);
//     });
//   }
// }
// async function f() {
//   await writeFile("f.txt", "fuck the ccp");
//   let content = await readFile("f.txt", "utf8");
//   console.log(content);
// }
// f();

// 实现一个函数 listFiles(path)，返回 path 路径下每个文件的完整路径
let path = require("path");
let fs = require("fs");
let fsp = fs.promises;
// version: sync
function listFileSync(dirPath) {
  let paths = [];
  let items = fs.readdirSync(dirPath, { withFileTypes: true });
  for (let item of items) {
    let itemPath = path.resolve(path.join(dirPath, item.name));
    if (item.isFile()) {
      paths.push(itemPath);
    } else {
      paths.push(listFileSync(itemPath));
    }
  }
  return paths;
}
// console.log(listFileSync("."));
// version: callback
function listFileCallback(dirPath, callback) {
  fs.readdir(dirPath, {withFileTypes: true}, (err, entries) => {
    let paths = [];
    let count = 0;
    dirPath = path.resolve(dirPath);
    if(entries.length == 0) {
      callback(paths);
      return;
    }
    for(let entry of entries) {
      let fullPath = path.join(dirPath, entry.name);
      if(entry.isFile()) {
        paths.push(fullPath);
      } else {
        count++;
        listFileCallback(fullPath, files => {
          paths.push(files);
          count--;
          if(count == 0) {
            callback(paths);
          }
        });
      }
    }
    if(count == 0) {
      callback(paths);
    }
  });
}
// listFileCallback(".", result => {console.log(result)});
// version: async-await
async function listFileAsync(dirPath) {
  let paths = [];
  let items = await fsp.readdir(dirPath, { withFileTypes: true });
  for (let item of items) {
    let itemPath = path.resolve(path.join(dirPath, item.name));
    if (item.isFile()) {
      paths.push(itemPath);
    } else {
      paths.push(await listFileAsync(itemPath));
    }
  }
  return paths;
}
// listFileAsync(".").then(console.log);
// version: promise
function listFilePromise(dirPath) {
  return fsp.readdir(dirPath, { withFileTypes: true }).then(items => {
    let paths = [];
    for (let item of items) {
      let itemPath = path.resolve(path.join(dirPath, item.name));
      if (item.isFile()) {
        paths.push(itemPath);
      } else {
        listFilePromise(itemPath).then(result => {
          paths.push(result);
        });
      }
    }
  });
}
// listFilePromise(".").then(result => {console.log(result);});