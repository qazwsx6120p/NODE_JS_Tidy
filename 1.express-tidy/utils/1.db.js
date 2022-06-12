// 底層寫的，我們看不到
// exports = module.exports = {};

// 連結.env
// 保護帳號密碼不被上傳至github
require('dotenv').config();

// ==============================================

const mysql = require('mysql2');

// 這裡不會像爬蟲那樣，只建立一個連線 (mysql.createConnection)
// 但是也不會幫每一個 request 都分別建立連線
// 建立一個路由池 createPool
// 使用pool變數去接從資料庫來的資料

let pool = mysql
  .createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // 為了 pool 新增的參數
    connectionLimit: 10,
    dateStrings: true,
  })
  .promise(); //<--使用promise版本
// console.log(process.env.DB_HOST);

// ==============================================

// pool <--本來就是一個物件
// 這邊等於 module.exports={} <--創建一個新的記憶體位置
// 不用原本的 exports = module.exports = {};
module.exports = pool;
