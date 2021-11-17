const { R_OK } = require("constants");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "> "
});

// rl.question("FUCK YOU", answer => {
//   console.log(`FUCK YOU TOO ${answer}`);
//   rl.close();
// });

let dict = {
  cat: "猫",
  dog: "狗",
  pig: "猪"
}

rl.prompt();
rl.on("line", input => {
  console.log(dict[input]);
  rl.prompt();
})

// async function main() {
//   rl.prompt();
//   for await (const line of rl) {
//     // console.log(dict[line]);
//     rl.write(dict[line.trimEnd()]);
//     rl.prompt();
//   }
// }
// main();