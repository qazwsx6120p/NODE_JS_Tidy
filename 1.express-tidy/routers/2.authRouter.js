//=============================== Require ===================================

// ------------- 引用express和使用router -------------

const express = require('express');
const router = express.Router();

// ------------- 引用後端資料驗證套件 -------------

// 為官方規定的引用方法
const { body, validationResult } = require('express-validator');

// ------------- createPoolRequire -------------

// 自己整理的資料庫模組
const pool = require('../utils/db');

// ------------- 引用密碼雜湊套件 -------------

const bcrypt = require('bcrypt');

//==================================================================

// for image upload
// https://www.npmjs.com/package/multer
// npm i multer
const multer = require('multer');
const path = require('path');
// 圖片上傳需要地方放，在 public 裡，建立了 uploads 檔案夾
// 設定圖片儲存的位置
const storage = multer.diskStorage({
  // 設定儲存的目的地 （檔案夾）
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'members'));
  },
  // 重新命名使用者上傳的圖片名稱
  filename: function (req, file, cb) {
    // 剛學習一個新的套件，可以把拿到的物件或變數印出來看看
    // 看看裡面有沒有放什麼有用的東西
    // console.log('multer filename', file);
    // 通常我們會選擇重新命名使用者上傳的圖片名稱
    // 以避免重複的檔名或是惡意名稱，也比較好管理
    let ext = file.originalname.split('.').pop();
    let newFilename = `${Date.now()}.${ext}`;
    cb(null, newFilename);
    // {
    //   fieldname: 'photo',
    //   originalname: 'japan04-200.jpg',
    //   encoding: '7bit',
    //   mimetype: 'image/jpeg'
    // }
  },
});
const uploader = multer({
  // 設定儲存的位置
  storage: storage,
  // 過濾圖片
  // 可以想成是 photo 這個欄位的「資料驗證」
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype !== 'image/jpeg' &&
      file.mimetype !== 'image/jpg' &&
      file.mimetype !== 'image/png'
    ) {
      cb('這些是不被接受的格式', false);
    } else {
      // cb(錯誤, 結果)
      cb(null, true);
    }
  },
  // 檔案尺寸的過濾
  // 一般不會上傳太大的圖片尺寸，以免到時候前端開啟得很慢
  limits: {
    // 1k = 1024
    fileSize: 200 * 1024,
  },
});

//=================== 後端驗證規則 ===================

// 將存取規則的變數帶到，接收前端送來的資料中間件裡面
const registerRules = [
  body('email').isEmail().withMessage('Email 欄位請填寫正確格式'),
  body('password').isLength({ min: 8 }).withMessage('密碼長度至少為8'),
  body('confirmPassword')
    // confirmPassword 要等於 req.body 傳來的 password
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    //不然就給他客製的錯誤訊息
    .withMessage('密碼驗證不一致'),
];

//=================== 註冊接收前端送來的資料 ===================

// /api/auth/register
router.post(
  '/register',
  uploader.single('photo'),
  // 後端驗證規則變數
  registerRules,
  async (req, res, next) => {
    // 1. req.params <-- 網址上的路由參數
    // 2. req.query  <-- 網址上的 query string
    // 3. req.body <-- 通常是表單 post 用的
    console.log('register body:', req.body);

    // ------------------ 1.驗證資料 ------------------

    // 引用後端資料驗證套件validationResult
    // 拿到驗證上面自訂義驗證規則的結果
    // const 變數 = validationResult(req) <--套件官方規定用法
    const validateResults = validationResult(req);
    // 假如沒有錯誤，會顯示空物件
    // 有錯誤會顯示錯誤物件
    console.log('validateResults', validateResults);
    // 假如物件內不是空的(代表有錯誤)
    // 使用isEmpty() 判斷是否為空
    if (!validateResults.isEmpty()) {
      // 將錯誤訊息包裝成一個陣列
      let error = validateResults.array();
      // return 回覆給前端錯誤訊息
      // code: 3001 為自訂義的錯誤代碼(用來給前端辨別是何種錯誤)
      return res.status(400).json({ code: 3001, error: error });
    }

    // ------------------ 2.確認 email 有沒有註冊過 ------------------

    // 從資料庫撈出資料
    // 接回的資料為一個陣列，陣列的第一個值才是真正的資料
    let [members, field] = await pool.execute(
      // 選取id、email 從 members 資料表
      'SELECT id, email FROM members WHERE email = ?',
      // 前端送過來的email
      [req.body.email]
    );
    // 判斷mail有沒有註冊過 !== 0 (代表陣列長度不為0 <-- 註冊過)
    if (members.length !== 0) {
      // 註冊過就直接回覆給前端 400
      return (
        res
          .status(400)
          // 並傳送錯誤訊息
          .json({ code: 3002, error: '這個 email 已經註冊過' })
      );
      // 盡可能讓後端回覆的格式是一致的，如果無法完全一致，那至少要讓前端有判斷的依據。
      // 做專案的時候，在專案開始前，可以先討論好要回覆的錯誤格式與代碼。
    }

    // ------------------ 3.密碼雜湊 hash ------------------

    // bcrypt (長度: 60), argon2 (長度: 95)
    let hashPassword = await bcrypt.hash(req.body.password, 10); //<--預設10
    console.log('hashPassword: ', hashPassword);

    // ------------------ 3.圖片(不一定會有，看註冊是否需要上傳) ------------------

    // 圖片處理完成後，會被放在 req 物件裡
    console.log('req.file', req.file);
    // 最終前端需要的網址: http://localhost:3001/public/members/1655003030907.jpg
    // 可以由後端來組合這個網址，也可以由前端來組合
    // 記得不要把 http://locahost:3001 這個存進資料庫，因為正式環境部署會不同
    // 目前這個專案採用：儲存 members/1655003030907.jpg 這樣格式
    // 使用者不一定有上傳圖片，所以要確認 req 是否有 file
    let photo = req.file ? '/members/' + req.file.filename : '';

    // ------------------ 4.存進資料庫 ------------------

    let [result] = await pool.execute(
      // 存進資料庫SQL語法
      'INSERT INTO members (email, password, name, photo) VALUES (?, ?, ?, ?)',
      // 密碼記得存雜湊過的密碼
      [req.body.email, hashPassword, req.body.name, photo]
    );
    console.log('insert result:', result);

    // ------------------ 5.response(回覆給前端) ------------------

    res.json({ code: 0, result: 'OK' });
  }
);


// /api/auth/login
router.post('/login', async (req, res, next) => {
  // 確認資料有收到
  console.log('req.body', req.body);
  // 確認有沒有這個帳號
  let [members] = await pool.execute(
    'SELECT id, email, password, name, photo FROM members WHERE email = ?',
    [req.body.email]
  );
  if (members.length === 0) {
    // 如果沒有，就回覆錯誤
    // 這個 email 沒有註冊過
    return res.status(400).json({ code: 3003, error: '帳號或密碼錯誤' });
  }
  // 如果程式碼能執行到這裡，表示 members 裡至少有一個資料
  // 把這個會員資料拿出來
  let member = members[0];

  // 如果有，確認密碼
  let passwordCompareResult = await bcrypt.compare(
    req.body.password,
    member.password
  );
  if (passwordCompareResult === false) {
    // 如果密碼不符合，回覆登入錯誤
    return res.status(400).json({ code: 3004, error: '帳號或密碼錯誤' });
  }

  // 密碼符合，就開始寫 session
  // （要先去 server.js 裡啟動 session）
  let returnMember = {
    email: member.email,
    name: member.name,
    photo: member.photo,
  };
  req.session.member = returnMember;

  // 回覆資料給前端
  res.json({ code: 0, member: returnMember });
});

router.get('/logout', (req, res, next) => {
  // 因為我們會依靠判斷 req.session.member 有沒有資料來當作有沒有登入
  // 所以當我們把 req.session.member 設定成 null，那就登出了
  req.session.member = null;
  res.sendStatus(202);
});

module.exports = router;

// 登入資訊參考共筆
