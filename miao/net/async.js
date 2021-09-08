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
    // 解析请求
    let str = data.toString();
    let rowOne = str.split("\r\n")[0];
    let [url] = rowOne.split(" ")[1].split("?");
    let content = str.split("\r\n\r\n")[1];

    // 服务器根据请求地址返回数据
    if (url == "/") {
      conn.write("HTTP/1.1 200 OK\r\n");
      conn.write("Content-Type: text/html; charset=utf-8\r\n");
      conn.write("\r\n");
      conn.write(`
        <head>
          <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
        </head>

        <body>
          <h1 style="text-align: center;">Comment</h1>
          <fieldset style="margin-bottom: 10px;">
            <label for="name">Username</label>
            <input id="name" type="text" name="username" required autofocus><br><br>
            <label for="comment">Comment</label>
            <input id="comment" type="text" name="comment" required><br><br>
            <input type="button" value="Compose" onclick="submit()">
          </fieldset>
          <div></div>

          <script>
            let message = [];
            let obj = {};
            let div = document.querySelector("div");

            function dataDeal(data) {
              message = JSON.parse(data);
              let str = "";
              for(let i = message.length - 1; i >= 0; i--) {
                str += '<div style="border: 1px solid #EFF3F4; padding: 10px;"><div><span style="font-weight: bold;">' + _.escape(message[i].username) + '</span> <span style="font-size: 10px; color: grey;">' + message[i].date + '</span></div><p style="margin: 5px 16px 0;">' + _.escape(message[i].comment) + '</p></div>';
              }
              div.innerHTML = str;
            }

            function get(method, url, callback) {
              let xhr = new XMLHttpRequest();
              xhr.open(method, url);
              xhr.addEventListener("load", () => {
                if(xhr.responseText) {
                  callback(xhr.responseText);
                }
              });
              xhr.send();
            }
            get("GET", "./comment", dataDeal);

            function submit() {
              let nameNode = document.querySelector("#name");
              let commentNode = document.querySelector("#comment");
              let username = nameNode.value;
              let comment = commentNode.value;
              
              if(!username || !comment) {
                return;
              }
              
              let time = new Date();
              let year = time.getFullYear();
              let month = time.getMonth() + 1;
              let day = time.getDay();
              let hour = time.getHours();
              let minute = time.getMinutes();
              let date = year + "-" + month + "-" + day + " " + hour + ":" + minute;

              obj.username = username;
              obj.comment = comment;
              obj.date = date;
              message.push(obj);

              function push(method, url, data) {
                let xhr = new XMLHttpRequest();
                xhr.open(method, url);
                xhr.send(data);
              }
              push("POST", "/submit", JSON.stringify(message));

              nameNode.value = "";
              commentNode.value = "";

              let node = document.createElement("div");
              node.style = "border: 1px solid #EFF3F4; padding: 10px;";
              node.innerHTML = '<div><span style="font-weight: bold;">' + obj.username + '</span> <span style="font-size: 10px; color: grey;">' + obj.date + '</span></div><p style="margin: 5px 16px 0;">' + obj.comment + '</p></div>';
              div.insertBefore(node, div.firstChild);
            }
          </script>
        </body>
      `);
    }

    if (url == "/comment") {
      try {
        let data = fs.readFileSync("./message.json");

        conn.write("HTTP/1.1 200 OK\r\n");
        conn.write("Content-Type: application/json\r\n");
        conn.write("\r\n");
        conn.write(data);
      } catch {
        conn.write("HTTP/1.1 404 Not Found\r\n");
        conn.write("\r\n");
      }
    }

    if (url == "/submit") {
      fs.writeFileSync("./message.json", content);

      conn.write("HTTP/1.1 200 ok\r\n");
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