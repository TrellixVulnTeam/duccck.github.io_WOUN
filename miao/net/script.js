let net = require("net");
let fs = require("fs");
let _ = require("lodash");
let server = net.createServer();
let port = 8000;

server.listen(port, () => {
  console.log("listening on port", port);
});

server.on("connection", conn => {
  conn.on("data", data => {
    let str = data.toString();
    let rowOne = str.split("\r\n")[0];
    let [url, info] = rowOne.split(" ")[1].split("?");
    let message = readMessage();

    function saveMessage() {
      let str = JSON.stringify(message);
      fs.writeFileSync("./message.json", str);
    }

    function readMessage() {
      try {
        let str = fs.readFileSync('./message.json');
        return JSON.parse(str);
      } catch {
        return [];
      }
    }

    function parseStr(str) {
      let obj = {};
      for (let item of str.split("&")) {
        let [key, val] = item.split("=");
        obj[key] = val;
      }
      return obj;
    }

    if (url == "/") {
      conn.write("HTTP/1.1 200 OK\r\n");
      conn.write("Content-Type: text/html; charset=utf-8\r\n");
      conn.write("\r\n");
      conn.write(`
        <h1 style="text-align: center;">Comment</h1>
        <form method="GET" action="/comment" style="margin-bottom: 10px;">
          <fieldset>
            <label for="name">Username</label>
            <input id="name" type="text" name="username" required><br><br>
            <label for="comment">Comment</label>
            <input id="comment" type="text" name="comment" required><br><br>
            <input type="submit" value="Compose">
          </fieldset>
        </form>
      `);
      
      for (let i = message.length - 1; i >= 0; i--) {
        let item = message[i];
        conn.write(`
          <div style="border: 1px solid #EFF3F4; padding: 10px;">
            <div>
              <span style="font-weight: bold;">@${_.escape(item.username)}</span> <span style="font-size: 10px; color: grey;">${item.time}</span>
            </div>
            <p style="margin: 5px 16px 0;">${_.escape(item.comment)}</p>
          </div>
        `);
      }
    }

    if (url == "/comment") {
      info = decodeURIComponent(info);
      let comment = parseStr(info);
      let time = new Date();
      let year = time.getFullYear();
      let month = time.getMonth() + 1;
      let day = time.getDay();
      let hour = time.getHours();
      let minute = time.getMinutes();
      comment.time = `${year}-${month}-${day} ${hour}:${minute}`;
      message.push(comment);
      saveMessage();

      conn.write("HTTP/1.1 301 Moved Permanently\r\n");
      conn.write("Location: /\r\n");
      conn.write("\r\n");
    }

    if (url == "/favicon.ico") {
      let ico = fs.readFileSync("./favicon.png");

      conn.write("HTTP/1.1 200 OK\r\n");
      conn.write("Content-Type: image/png\r\n");
      conn.write("\r\n");
      conn.write(ico);
    }

    conn.end();
  });
});