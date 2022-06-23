// ---------------------------------require----------------------------------------
// 引用express
// 設定一個app變數來使用 express
const express = require('express');
const app = express();

// ==============================================

// 內建套件無須 npm i
const path = require('path');

// ==============================================

// 只要跨來源，就會被**瀏覽器**阻擋 （事實上，請求還是發得出去，
// 只是瀏覽器沒有得到 Access-Control-Allow-Origin 許可，
// 會在最後一刻攔截資料，而不交給我們。）
// 但是開放的話要找後端開放 => cors 第三方開發的中間件
// 所以如果前端要跟後端要資料，要require('cors')
// 並讓app使用 app.use(cors())
const cors = require('cors');
app.use(cors());

// ---------------------------------createPoolRequire----------------------------------------

let = pool = require('./utils/1.db');

// ---------------------解析POST過來的body資料(會放在最上面先進行解析)---------------------

// express.urlencoded()函數是Express中的內置中間件函數
// express.urlencoded()要讓express解析body的資料(body為送過來的資料)
// extended: false -->底層是querystring
// extended: false -->底層是qs
app.use(express.urlencoded({ extended: true }));

// 要讓 express 認得 req 裡 json
app.use(express.json());


//================================== Router ==================================

//1.stockRouter
const stockRouter = require('./routers/1.stockRouter');
app.use("/api/stocks",stockRouter); // <--將網址設在server Router 的網址可以刪掉

//2.authRouter
const AuthRouter = require('./routers/2.authRouter');
app.use('/api/auth', AuthRouter);

// ---------------------------------首頁----------------------------------------

// 建立網址並發出請求 http://localhost:3001/
app.get('/', (request, response, next) => {
  console.log('首頁CCC');
  // 送回 response，結束了 request-response cycle
  // 回復客戶端顯示首頁
  response.send('首頁'); //<-- 在這回復
});

// ----------------------------------404---------------------------------------

// 這個中間件在所有路由的後面
// 會到這裡，代表客戶端打錯網址傳送給你 顯示Not Found
// => 404  <--客戶端的錯誤
app.use((req, res, next) => {
  console.log('所有路由的後面 ==> 404', req.path); //<--可以用console.log查看對方傳送甚麼網址
  // 回復404並傳送Not Found
  res.status(404).send('Not Found');
});

// ----------------------------------500---------------------------------------

// 5xx <--自己伺服器的錯誤
// 錯誤處理中間件: 通常也會放在所有中間件的最後
// 超級特殊的中間件，有四個參數
// 有點接近 try-catch 的 catch
app.use((err, req, res, next) => {
  // req.path, err <--記下錯誤的網址
  console.error('來自四個參數的錯誤處理中間件', req.path, err);
  // Server Error: 請洽系統管理員
  res.status(500).send('Server Error: 請洽系統管理員');
});

// ----------------------------------listen port---------------------------------------

// 使用這個port 3001 (通常會放到最後)
// 伺服器端為3001
// 網址localhost:3001
// 需先用 nodemon 1.server.js
app.listen(3001, () => {
  console.log('Server start at 3001');
});
