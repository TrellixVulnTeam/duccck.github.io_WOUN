const fs = require("fs");
const net = require("net");

const writable = fs.createWriteStream("./a.mp4");

// const server = net.createServer(conn => {
//   console.log("Connection success.")
//   conn.on("data", data => {
//     writable.write(data);
//   })
//   conn.on("end", () => {
//     writable.end();
//   })
// });
const server = net.createServer().on("connection", conn => {
  console.log("Connected")
  conn.on("data", data => {
    writable.write(data);
  });
  conn.on("end", () => {
    writable.end();
  });
});

server.listen(8080, () => {
  console.log("Listening on 8080");
});