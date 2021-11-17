const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 8080;
const basePath = ".";

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

// app.use(function staticfile(req, res, next) {
//   let target = path.join(basePath, path.normalize(req.url));
//   fs.stat(target, (err, stats) => {
//     if(err) {
//       next();
//     } else {
//       if(stats.isDirectory()) {
//         next();
//       } else {
//         fs.createReadStream(target).pipe(res);
//       }
//     }
//   });
// });
app.use(express.static("."));

// app.use(function getBodyText(req, res, next) {
//   if(req.is("text")) {
//     let body = "";
//     req.on("data", data => {
//       body += data.toString();
//     });
//     req.on("end", () => {
//       req.body = body;
//       next();
//     });
//   } else {
//     next();
//   }
// });
app.use(express.text());

// app.use(function jsonParse(req, res, next) {
//   if(req.is("json")) {
//     req.body = JSON.parse(req.body);
//   }
//   next();
// });
app.use(express.json());

// app.use(function urlencodedParse(req, res, next) {
//   if(req.is("urlencoded")) {
//     req.body = new URL(`http://127.0.0.1:8080${req.url}`).searchParams;
//   }
//   next();
// });
app.use(express.urlencoded({extended: true}));

// app.use(function route(req, res, next) {
//   if(req.url == "/node_modules" && req.method == "GET") {
//     res.end("1");
//   } else {
//     next();
//   }
// });
// app.get("/node_modules", (req, res, next) => {
//   res.end("get");
// });
// app.post("/node_modules", (req, res, next) => {
//   res.end("post");
// });
// app.get("/node_modules",
//   (req, res, next) => {
//     res.write("get");
//     next();
//   },
//   (req, res, next) => {
//     res.end("post");
//   }
// );
const news = require("./news.js");
app.use("/news", news);

app.get("/question/:qid", (req, res, next) => {
  res.end("question: " + req.params.qid);
});

app.use((req, res, next) => {
  res.end("FUCK: " + req.body);
});

// 1、app 是一个 function
// 2、下面代码相当于：
//    const http = require("http");
//    const server = http.createServer(app);
//    server.listen(port);
// 3、app.listen() 只能创建 http 服务器，将双面代码改为 https 模块，则可以创建 https 服务器
app.listen(port, () => {
  console.log(`Listening on ${port}.`);
});

// 实现 app.use 的 next() 效果
// step 1
function next0(req, res) {
  f1(req, res, next1);
}
app.use(function f1(req, res, next) {
  next();
});
function next1() {
  f2(req, res, next2);
}

app.use(function f2(req, res, next) {
  next();
});
function next2() {
  f3(req, res, next3);
}

app.use(function f3(req, res, next) {
  next();
});
function next3() {
  f4(req, res, next4);
}

app.use(function f4(req, res, next) {
  next();
});
function next4() {}

// step 2
// app.use 相当于将其参数 function 放入一个数组，然后在 next 中依次调用
function f1(req, res, next) {
  next();
}
function f2(req, res, next) {
  next();
}
function f3(req, res, next) {
  next();
}
function f4(req, res, next) {
  next();
}
let middlewares = [f1, f2, f3, f4];

// function next0(req, res) {
//   // 1、使用一个匿名函数封装 next，实现 app.use 中 next() 不接参数的效果
//   // 2、该匿名函数就是上述函数中的 next
//   f1(req, res, () => {
//     next1(req, res);
//   });
// }
// function next1(req, res) {
//   f2(req, res, () => {
//     next2(req, res);
//   });
// }
// function next2(req, res) {
//   f3(req, res, () => {
//     next3(req, res);
//   });
// }
// function next3(req, res) {
//   f4(req, res, () => {
//     next4(req, res);
//   });
// }
// function next4(req, res) {}

// step 3
// version 1: 构建 next
let nexts = [];
for(let i = 0; i < middlewares.length; i++) {
  nexts.push((req, res) => {
    middlewares[i](req, res, () => {
      nexts[i + 1](req, res);
    });
  });
}
// 在数组末尾添加一个空函数，middlewares 中最后一个函数调用 nexts[i + 1] 报错
nexts.push(() => {});

// version 2: 构建函数
function composeMiddlewares(middlewares) {
  return middlewares.reduceRight((total, middleware) => {
    return (req, res,) => {
      middleware(req, res, () => {
        total(req, res);
      });
    }
  }, () => {});
}
