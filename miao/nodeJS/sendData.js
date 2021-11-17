const fs = require("fs");
const net = require("net");

const readable = fs.createReadStream("./1. 专项课程介绍.mp4");

// const conn = net.connect(8080, "127.0.0.1");
// conn.on("connect", () => {
//   readable.on("data", data => {
//     conn.write(data);
//   });
//   readable.on("end", () => {
//     conn.end();
//   });
// });
const conn = net.connect(8080, "127.0.0.1", () => {
  console.log("Connected")
  readable.on("data", data => {
    if(!conn.write(data)) {
      readable.pause();
    }
  });
  conn.on("drain", () => {
    readable.resume();
  })
  readable.on("end", () => {
    conn.end();
  });
});