// vue 将 data 数据转化为 setter / getter 原理
// onChange 为模拟更新页面的函数
// 1、当多次修改时，只对最后一次修改更新页面
let sign = false; // 1
function observe(obj, onChange) {
  for(let key in obj) {
    let value = obj[key];
    if(typeof value === "object") {
      // 当属性值为对象时
      value = observe(value, onChange);
    }
    Object.defineProperty(obj, key, {
      set: function(val) {
        if(val != value) {
          // 当修改或新增的属性值为对象时，需要经过处理后再赋值
          value = observe(val, onChange);
          // onChange();
          // 1
          if(!sign) {
            Promise.revole().then(() => { onChange(); sign = false; });
            sign = true;
          }
        }
      },
      get: function() {
        return value;
      }
    });
  }
  return obj;
}