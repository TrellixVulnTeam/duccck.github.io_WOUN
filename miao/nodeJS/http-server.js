// htttp 模块：响应 http 请求，过滤非 http 请求
const http = require("http");
const server = http.createServer();
// http 服务器收到请求时触发
// req 表示客户端发来的请求，通过其相关属性拿到请求信息
// res 表示服务器响应
server.on("request", async (req, res) => {
  console.log(req.method, req.url, res.socket.remoteAddress);
  for await (let data of req) {
    console.log(data.toString());
  }
  res.writeHead(200, {
    "Content-type": "text/html; charset=UTF-8"
  })
  res.write("FUCK");
  res.end(); // 响应结束
});
server.listen(8080, () => {
  console.log("Listening on 8080");
});

// HTTP client
let request = http.request("http://www.google.com", {
  method: "GET",
  header: {}
}, response => {
  response.on("data", data => {
    console.log(data);
  });
});
request.write("fuck the ccp");
request.end();