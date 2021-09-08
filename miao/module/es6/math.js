// 默认导出，导出的是值
// 一个模块只能存在一个 default
let pi = 3.1415926;
// export default pi;
export default 3.1415926;

// 具名导出
export function add(a, b) {
  return a + b;
}

export function mul(a, b) {
  return a * b;
}

function sub(a, b) {
  return a - b;
}
export {sub};

export let PI = 3.14;