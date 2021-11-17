const net = require("net");

let host = process.argv[2];
let port = Number(process.argv[3]);

const conn = net.connect(port, host, () => {
  process.stdin.pipe(conn).pipe(process.stdout);
})