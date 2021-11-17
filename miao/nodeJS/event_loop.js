// https://cloud.tencent.com/developer/article/1475974
// https://juejin.cn/post/6973817105728667678

new Promise((resolve, reject) => {
  console.log('1');
  resolve();
}).then(() => {
  console.log('2');
  new Promise((resolve, reject) => {
    console.log('3');
    resolve();
  }).then(() => {
    console.log('4');
  }).then(() => {
    console.log('5');
  });
}).then(() => {
  console.log('6');
});

new Promise((resolve, reject) => {
  console.log('7');
  resolve();
}).then(() => {
  console.log('8');
});
// 1
// 7
// 2
// 3
// 8
// 4
// 6
// 5

async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}
async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(function () {
  console.log('setTimeout0');
}, 0);
setTimeout(function () {
  console.log('setTimeout3');
}, 3);
setImmediate(() => console.log('setImmediate'));
process.nextTick(() => console.log('nextTick'));

async1();

new Promise(function (resolve) {
  console.log('promise1');
  resolve();
  console.log('promise2');
}).then(function () {
  console.log('promise3');
});

console.log('script end');
// script start
// async1 start
// async2
// promise1
// promise2
// script end
// nextTick
// async1 end
// promise3
// setTimeout0
// setTimeout3
// setImmediate

process.nextTick(() => console.log(1));
Promise.resolve().then(() => console.log(2));
process.nextTick(() => console.log(3));
Promise.resolve().then(() => console.log(4));
// 1
// 3
// 2
// 4

setTimeout(() => {
  console.log(2);
}, 2000);

new Promise((resolve, reject) => {
  console.log('p');
  resolve('p');
}).then(() => {
  setTimeout(() => {
    console.log(3);
  }, 10);
});
// p
// 3
// 2

setTimeout(() => console.log('a'), 0);

var p = new Promise((resolve) => {
  console.log('b');
  resolve();
});
p.then(() => console.log('c'));
p.then(() => console.log('d'));

console.log('e');

async function async1() {
  console.log("a");
  await async2();
  console.log("b");
}
async function async2() {
  console.log('c');
}

console.log("d");

setTimeout(function () {
  console.log("e");
}, 0);

async1();

new Promise(function (resolve) {
  console.log("f");
  resolve();
}).then(function () {
  console.log("g");
});

console.log('h');
// b
// e
// d
// a
// c
// f
// h
// c
// d
// b
// g
// a
// e

// 1、f1 被调用时，会立刻返回一个 promise，但该 promise 不是 return 语句的 promise
// 2、f1 返回的 promise 状态需要等待 return 语句的 promise 调用 then 后确定
// 3、所以此处 return Promise.resolve() 相当于 return await Promise.resolve()
async function f1() {
  return Promise.resolve();
  // 如果此处 return 的不是 promise，则结果会颠倒
  // 此时 f1 返回的 promise 状态已经确定
  // return 0;
}
async function f2() {
  // f1 return 0，则此处相当于 Promise.resolve(0).then()，then 立刻被放入 call queue
  await f1();
  console.log(1);
}

f2();

Promise.resolve().then(() => {
  console.log(2);
});
// 2
// 1