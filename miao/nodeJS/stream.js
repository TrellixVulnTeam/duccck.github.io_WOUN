// https://github.com/substack/stream-handbook
const stream = require("stream");
const fs = require("fs");

const Readable = stream.Readable;
const Writable = stream.Writable;

function createFileReadStream(path) {
  let fd = fs.openSync(path);
  let pos = 0;
  return new Readable({
    read() {
      let length = 2048;
      let buf = Buffer.alloc(length);
      fs.read(fd, buf, 0, length, pos, (err, byteRead) => {
        pos += byteRead;
        if(byteRead == length) {
          this.push(buf);
        } else {
          this.push(buf.slice(0, byteRead))
          this.push(null);
          fs.closeSync(fd);
        }
      });
    }
  });
}

function createFileWriteStream(path) {
  let fd = fs.openSync(path, "w");
  let pos = 0;
  return new Writable({
    // 消费数据
    write(chunk, encoding, callback) {
      fs.write(fd, chunk, 0, chunk.length, pos, (err, byteWrite) => {
        pos += chunk.lenght;
        // 调用 callback() 消费 chunk 内的数据以告诉系统可以继续接收下一组数据
        callback();
      });
    }
  });
}

let readable = createFileReadStream("f.txt");
let writable = createFileWriteStream("t.txt");
// readable.on("data", data => {
//   writable.write(data);
// });
readable.pipe(writable);