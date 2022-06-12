// 方法1: 引用整個物件
let car = require('./2.car');

console.log(car);

// // { brand: 'Ford', color: 'RED', run: [Function (anonymous)] }

// console.log(car.brand);
// car.run();

// 方法2: 只引用需要的
// let { brand } = require('./car');
// console.log(brand);

// 測試順序
const first = require('./3.first');
const second = require('./4.second');