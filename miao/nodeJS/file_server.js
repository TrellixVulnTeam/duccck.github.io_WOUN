// const http = require("http");
// const fs = require("fs");
// const path = require("path");
// const url = require("url");
// const mime = require("mime");

// const methods = Object.create(null);
// methods.GET = function (path, respond) {
//   fs.stat(path, (err, stats) => {
//     if (err && err.code == "ENOENT") {
//       respond(404, "File no found");
//     } else if (err) {
//       respond(404, err.toString());
//     } else if (stats.isFile()) {
//       respond(200, fs.createReadStream(path), mime.getType(path));
//     } else {
//       fs.readdir(path, { withFileTypes: true }, (err, entries) => {
//         if (err) {
//           respond(500, err.toString());
//         } else {
//           let str = "";
//           for (let entry of entries) {
//             str += entry.name + "\n";
//           }
//           respond(200, str);
//         }
//       });
//     }
//   });
// }
// methods.DELETE = function (path, respond) {
//   fs.stat(path, (err, stats) => {
//     if (err && err.code == "ENOENT") {
//       respond(204);
//     } else if (err) {
//       respond(500, err.toString());
//     } else if (stats.isFile()) {
//       fs.unlink(path, respondErrorOrNothing(respond));
//     } else {
//       fs.rmdir(path, respondErrorOrNothing(respond));
//     }
//   });
//   function respondErrorOrNothing(respond) {
//     return err => {
//       if (err) {
//         respond(500, err.toString());
//       } else {
//         respond(204);
//       }
//     }
//   }
// }
// methods.PUT = function (path, respond, request) {
//   const writable = fs.createWriteStream(path, "w");
//   request.pipe(writable);
//   writable.on("error", err => {
//     respond(500, err.toString());
//   });
//   writable.on("finish", () => {
//     respond(204);
//   });
// }

// http.createServer((req, res) => {
//   function respond(code, body, type) {
//     if (!type) {
//       type = "text/plain"
//     }
//     res.writeHead(code, {
//       "Content-Type": type
//     });
//     if (body && body.pipe) {
//       body.pipe(res);
//     } else {
//       res.end(body);
//     }
//   }
//   if (req.method in methods) {
//     methods[req.method](urlToPath(req.url), respond, req);
//   } else {
//     respond(405, "Method" + req.method + "not allowed");
//   }
// }).listen(8080, () => {
//   console.log("listening on 8080.");
// });

// function urlToPath(url) {
//   return "." + decodeURIComponent(new URL(url, "http://127.0.0.1:8080").pathname);
// }

// version: async-await
const { createServer } = require("http");

const methods = Object.create(null);

createServer((request, response) => {
  let handler = methods[request.method] || notAllowed;
  handler(request)
    .catch(error => {
      if (error.status != null) return error;
      return { body: String(error), status: 500 };
    })
    .then(({ body, status = 200, type = "text/plain" }) => {
      response.writeHead(status, { "Content-Type": type });
      if (body && body.pipe) body.pipe(response);
      else response.end(body);
    });
}).listen(8000);

async function notAllowed(request) {
  return {
    status: 405,
    body: `Method ${request.method} not allowed.`
  };
}

var { parse } = require("url");
var { resolve, sep } = require("path");

var baseDirectory = process.cwd();

function urlPath(url) {
  let { pathname } = parse(url);
  let path = resolve(decodeURIComponent(pathname).slice(1));
  if (path != baseDirectory &&
    !path.startsWith(baseDirectory + sep)) {
    throw { status: 403, body: "Forbidden" };
  }
  return path;
}

const { createReadStream } = require("fs");
const { stat, readdir } = require("fs").promises;
const mime = require("mime");

methods.GET = async function (request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    if (error.code != "ENOENT") throw error;
    else return { status: 404, body: "File not found" };
  }
  if (stats.isDirectory()) {
    return { body: (await readdir(path)).join("\n") };
  } else {
    return {
      body: createReadStream(path),
      type: mime.getType(path)
    };
  }
};

const { rmdir, unlink } = require("fs").promises;

methods.DELETE = async function (request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    if (error.code != "ENOENT") throw error;
    else return { status: 204 };
  }
  if (stats.isDirectory()) await rmdir(path);
  else await unlink(path);
  return { status: 204 };
};

const { createWriteStream } = require("fs");

function pipeStream(from, to) {
  return new Promise((resolve, reject) => {
    from.on("error", reject);
    to.on("error", reject);
    to.on("finish", resolve);
    from.pipe(to);
  });
}

methods.PUT = async function (request) {
  let path = urlPath(request.url);
  await pipeStream(request, createWriteStream(path));
  return { status: 204 };
};

const { mkdir } = require("fs").promises;

methods.MKCOL = async function (request) {
  let path = urlPath(request.url);
  let stats;
  try {
    stats = await stat(path);
  } catch (error) {
    if (error.code != "ENOENT") throw error;
    await mkdir(path);
    return { status: 204 };
  }
  if (stats.isDirectory()) return { status: 204 };
  else return { status: 400, body: "Not a directory" };
};