class EventEmitter2 {
  constructor() {
    this._eObject = {};
  }

  // bind
  on(eName, eHandler) {
    // 同一事件可以绑定多个函数，需要使用数组保存
    if (!(eName in this._eObject)) {
      this._eObject[eName] = [];
    }
    this._eObject[eName].push(eHandler);
  }

  // remove
  off(eName, eHandler) {
    if (!(eName in this._eObject)) {
      return undefined;
    }
    let handlers = this._eObject[eName];
    // 当存在同一事件上绑定了多个相同的函数时，循环解绑
    while (handlers.indexOf(eHandler) > 0) {
      handlers.splice(handlers.indexOf(eHandler), 1);
    }
  }

  // occur only once
  once(eName, eHandler) {
    this.on(eName, function agent(...args) {
      this.off(eName, agent);
      eHandler(...args);
    });
  }

  // emit
  emit(eName, ...args) {
    if (eName in this._eObject) {
      for (let eHandler of this._eObject[eName]) {
        eHandler.call(this, ...args);
      }
    } else {
      return undefined;
    }
  }
}

let et = new EventEmitter2();
function f(a, b) {
  console.log(this);
  console.log(a * b);
}
et.on('foo', (a, b) => {
  console.log(a + b);
});
et.on('foo', f);
et.once('foo', f);
et.emit('foo', 1, 2);
et.emit('foo', 1, 2);