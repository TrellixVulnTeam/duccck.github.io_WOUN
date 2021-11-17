const vm = require("vm");

const context = {
  x: 0,
  console: console
};
vm.createContext(context);

const code = `
  x++;
  console.log(x);
`
vm.runInContext(code, context);

console.log(context.x);