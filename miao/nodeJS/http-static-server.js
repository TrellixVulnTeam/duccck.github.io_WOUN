const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const url = require("url");
const mime = require("mime");

const port = 8080;
const server = http.createServer();
const baseURL = path.resolve("C:/Users/OE/Documents/GitHub/duccck.github.io/miao/nodeJS");

server.on("request", async (req, res) => {
  console.log(req.method, req.url);
  let entireURL = new URL(req.url, `http://${req.headers.host}`);
  let decodeURL = decodeURIComponent(entireURL.pathname);
  let targetURL = path.join(baseURL, decodeURL);
  // 防止用户在终端手动请求类似 ../../ 文件路径
  if(!targetURL.startsWith(baseURL)) {
    res.writeHead(403, {
      "Content-Type": "text/html; charset=utf-8"
    });
    res.write("FUCK YOU");
    res.end();
    return;
  }
  try {
    let stat = await fsp.stat(targetURL);
    if (stat.isFile()) {
      let data = await fsp.readFile(targetURL);
      res.writeHead(200, {
        "Content-type": `${mime.getType(targetURL)}; charset=UTF-8`
      })
      res.write(data);
      res.end();
    }
    if (stat.isDirectory()) {
      // 如果用户将文件夹 url 后的 / 删除再发送请求，则跳转到页面正确 url
      if(!decodeURL.endsWith("/")) {
        res.writeHead(302, {
          Location: decodeURL + "/" + entireURL.search
        });
        res.end();
        return;
      }
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8"
      })
      res.write(`
        <h1>Index of ${decodeURL}</h1>
      `);
      let files = await fsp.readdir(targetURL, { withFileTypes: true });
      for (let file of files) {
        let stuff = file.isDirectory() ? "/" : "";
        res.write(`
        <div><a href="${path.posix.join(decodeURL, file.name) + stuff}">${file.name + stuff}</a></div>
        `);
      }
      res.write(`
        <footer style="margin-top: 50px; font-size: 14px;"><i>* Node.js ${process.version} static server running @${req.headers.host}</i></footer>
      `);
      res.end();
    }
  } catch (err) {
    res.writeHead(400);
  }
});
server.listen(port, () => {
  console.log("Listening on 8080");
});